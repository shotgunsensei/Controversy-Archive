const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

const root = process.env.ARCHIVE_TEST_SOURCE_ROOT || path.resolve(__dirname, "..");
const source = (file) => readFileSync(path.join(root, file), "utf8");
const listKey = ["/api/topic-suggestions"];
const syntheticKey = "synthetic-editor-fixture-only";
const pending = {
  id: 1, title: "Private synthetic submission", controversy: "Private synthetic review text",
  status: "pending", createdAt: new Date("2026-01-01T00:00:00Z"),
};

function load(file, dependencies, extras = {}, append = "") {
  const output = ts.transpileModule(source(file), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    transformers: { before: [(context) => {
      const visit = (node) => ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword
        ? ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment("env", ts.factory.createObjectLiteralExpression([ts.factory.createPropertyAssignment("BASE_URL", ts.factory.createStringLiteral("/"))]))])
        : ts.visitEachChild(node, visit, context);
      return (file) => ts.visitNode(file, visit);
    }] },
  });
  assert.equal(output.diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} };
  vm.runInNewContext(output.outputText + append, {
    module, exports: module.exports, console, URL, Headers, AbortController,
    process: { env: {} },
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected dependency in isolated source test: ${name}`);
    },
    ...extras,
  }, { filename: file });
  return module.exports;
}

function api(expected = syntheticKey) {
  const routes = [];
  const state = { suggestions: [{ ...pending }], topics: [], reads: 0, writes: 0 };
  const suggestions = { name: "suggestions", id: "id", title: "title", status: "status", createdAt: "createdAt" };
  const topics = { name: "topics", id: "id", slug: "slug" };
  const rows = (table) => state[table.name];
  const compare = (op, a, b) => ({ op, a, b });
  const value = (v, row) => v?.lower ? row[v.lower].toLowerCase() : row[v];
  const matches = (condition, row) => !condition || (condition.op === "and"
    ? condition.a.every((c) => matches(c, row))
    : condition.op === "eq" ? value(condition.a, row) === condition.b : value(condition.a, row) !== condition.b);
  const db = {
    select() {
      state.reads += 1;
      let table, condition;
      const selected = () => rows(table).filter((r) => matches(condition, r));
      const query = {
        from(t) { table = t; return this; }, where(c) { condition = c; return this; },
        orderBy() { return Promise.resolve(selected().slice().sort((a, b) => b.createdAt - a.createdAt)); },
        limit(n) { return Promise.resolve(selected().slice(0, n)); },
        then(resolve, reject) { return Promise.resolve(selected()).then(resolve, reject); },
      };
      return query;
    },
    insert(table) {
      return { values(data) { return { returning: async () => {
        state.writes += 1;
        const row = { id: rows(table).length + 1, createdAt: new Date("2026-01-02T00:00:00Z"), status: "pending", featured: false, ...data };
        rows(table).push(row); return [row];
      } }; } };
    },
    update(table) {
      return { set(data) { return { where(condition) {
        state.writes += 1;
        const selected = rows(table).filter((r) => matches(condition, r));
        selected.forEach((r) => Object.assign(r, data));
        return { returning: async () => selected, then: (resolve) => Promise.resolve(undefined).then(resolve) };
      } }; } };
    },
  };
  const requireAdmin = load("artifacts/api-server/src/middlewares/requireAdmin.ts", {}, { process: { env: expected === undefined ? {} : { ADMIN_KEY: expected } } }).requireAdmin;
  const rateLimit = load("artifacts/api-server/src/middlewares/rateLimit.ts", {}).rateLimit;
  load("artifacts/api-server/src/routes/suggestions.ts", {
    express: { Router: () => ({ get: (route, ...handlers) => routes.push({ method: "GET", route, handlers }), post: (route, ...handlers) => routes.push({ method: "POST", route, handlers }) }) },
    "@workspace/db": { db, topicSuggestionsTable: suggestions, topicsTable: topics },
    "drizzle-orm": { eq: (a, b) => compare("eq", a, b), ne: (a, b) => compare("ne", a, b), and: (...a) => ({ op: "and", a }), desc: (a) => a, sql: (_strings, column) => ({ lower: column }) },
    "../lib/logger": { logger: { error() {} } },
    "../middlewares/requireAdmin": { requireAdmin }, "../middlewares/rateLimit": { rateLimit },
  });
  async function request(method, route, { key, body = {}, id = "1", ip = "synthetic-ip" } = {}) {
    const found = routes.find((r) => r.method === method && r.route === route);
    assert.ok(found, `Missing route ${method} ${route}`);
    const response = { statusCode: 200, headers: {}, body: undefined,
      setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
      status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; },
    };
    const req = { body, params: { id }, ip, header: (name) => name.toLowerCase() === "x-admin-key" ? key : undefined };
    for (const handler of found.handlers) { let next = false; await handler(req, response, () => { next = true; }); if (!next) break; }
    return response;
  }
  return { state, request };
}

for (const key of [undefined, "incorrect-synthetic-key"]) {
  test(`private queue denies ${key === undefined ? "anonymous" : "incorrect-key"} reads before storage`, async () => {
    const app = api(); const res = await app.request("GET", "/topic-suggestions", { key });
    assert.equal(res.statusCode, 401); assert.equal(app.state.reads, 0);
    assert.equal(res.headers["cache-control"], "private, no-store");
    assert.ok(!JSON.stringify(res.body).includes(pending.title));
  });
}
test("unconfigured moderation fails closed without a storage read", async () => {
  const app = api(null); const res = await app.request("GET", "/topic-suggestions", { key: syntheticKey });
  assert.equal(res.statusCode, 503); assert.equal(app.state.reads, 0);
  assert.equal(res.headers["cache-control"], "private, no-store");
});
test("authorized editor receives only pending rows, newest first, with the existing response", async () => {
  const app = api(); app.state.suggestions.push({ ...pending, id: 2, createdAt: new Date("2026-01-02T00:00:00Z") }, { ...pending, id: 3, status: "rejected" });
  const res = await app.request("GET", "/topic-suggestions", { key: syntheticKey });
  assert.equal(res.statusCode, 200); assert.deepEqual(Array.from(res.body, (r) => r.id), [2, 1]);
  assert.equal(res.body[1].controversy, pending.controversy); assert.equal(res.body[1].createdAt, "2026-01-01T00:00:00.000Z");
  assert.equal(res.headers["cache-control"], "private, no-store");
});
test("anonymous submission retains validation, duplicate handling and its receipt", async () => {
  const app = api();
  const invalid = await app.request("POST", "/topic-suggestions", { body: { title: "x", controversy: "too short" } });
  assert.equal(invalid.statusCode, 400); assert.equal(app.state.writes, 0);
  const duplicate = await app.request("POST", "/topic-suggestions", { body: { title: pending.title.toUpperCase(), controversy: pending.controversy } });
  assert.equal(duplicate.statusCode, 409); assert.equal(app.state.writes, 0);
  const created = await app.request("POST", "/topic-suggestions", { body: { title: "  New synthetic topic  ", controversy: "  Synthetic submission for review only.  " } });
  assert.equal(created.statusCode, 201); assert.equal(created.body.title, "New synthetic topic");
  assert.equal(created.body.status, "pending"); assert.equal(app.state.writes, 1);
});
test("anonymous submission keeps the existing five-per-window limiter", async () => {
  const app = api();
  for (let i = 0; i < 5; i++) assert.equal((await app.request("POST", "/topic-suggestions", { body: { title: `Synthetic topic ${i}`, controversy: "A synthetic review-only suggestion." } })).statusCode, 201);
  const res = await app.request("POST", "/topic-suggestions", { body: { title: "Sixth synthetic topic", controversy: "A synthetic review-only suggestion." } });
  assert.equal(res.statusCode, 429); assert.equal(app.state.writes, 5); assert.ok(res.headers["retry-after"] > 0);
});
test("authorized approval and rejection preserve the editorial workflow", async () => {
  const app = api();
  assert.equal((await app.request("POST", "/topic-suggestions/:id/approve")).statusCode, 401);
  assert.equal((await app.request("POST", "/topic-suggestions/:id/reject", { key: "incorrect" })).statusCode, 401);
  assert.equal(app.state.reads, 0); assert.equal(app.state.writes, 0);
  const approved = await app.request("POST", "/topic-suggestions/:id/approve", { key: syntheticKey });
  assert.equal(approved.statusCode, 200); assert.equal(approved.body.title, pending.title); assert.equal(app.state.suggestions[0].status, "approved");
  assert.equal((await app.request("GET", "/topic-suggestions", { key: syntheticKey })).body.length, 0);
  app.state.suggestions.push({ ...pending, id: 2 });
  const rejected = await app.request("POST", "/topic-suggestions/:id/reject", { key: syntheticKey, id: "2" });
  assert.equal(rejected.statusCode, 200); assert.equal(rejected.body.status, "rejected");
  assert.equal((await app.request("GET", "/topic-suggestions", { key: syntheticKey })).body.length, 0);
});

function ui({ states = [], queue = { data: [pending], isLoading: false }, queryClient, topic, dive } = {}) {
  const state = states.slice(), effects = [], storage = new Map(), calls = { list: [], clear: [], mutations: [] };
  let cursor = 0;
  const jsx = (type, props) => ({ type, props: props || {} });
  const react = { useState(initial) { const index = cursor++; if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial; return [state[index], (v) => { state[index] = typeof v === "function" ? v(state[index]) : v; }]; }, useEffect(fn) { effects.push(fn); }, useCallback(fn) { return fn; } };
  const client = queryClient || { cancelQueries() { calls.clear.push("cancel"); return Promise.resolve(); }, removeQueries() { calls.clear.push("remove"); }, invalidateQueries() {} };
  const apiClient = {
    getListTopicSuggestionsQueryKey: () => listKey,
    useListTopicSuggestions(options) { calls.list.push(options); return { refetch() {}, ...queue }; },
    useCreateTopicSuggestion(options) { calls.submit = options; return { mutate(value) { calls.mutations.push(value); }, isPending: false }; },
    useVerifyAdminKey() { return { mutate() {}, isPending: false }; },
    useApproveTopicSuggestion(options) { calls.approve = options; return { mutate() {}, isPending: false }; },
    useRejectTopicSuggestion(options) { calls.reject = options; return { mutate() {}, isPending: false }; },
    useGetTopic() { return { data: topic, isLoading: false }; },
    useGetTopicDeepDive() { return { data: dive?.data, isLoading: dive?.loading || false, isError: false, refetch() {} }; },
    getGetTopicQueryKey: () => ["topic"], getGetTopicDeepDiveQueryKey: () => ["deep-dive"],
  };
  const colors = { primary: "#fff", primaryForeground: "#000", foreground: "#fff", mutedForeground: "#aaa", border: "#555", card: "#222", destructive: "#f00" };
  const deps = { react, "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    wouter: { Link: "a", useParams: () => ({ slug: "synthetic" }) },
    "@workspace/api-client-react": apiClient, "@tanstack/react-query": { useQueryClient: () => client },
    "lucide-react": new Proxy({}, { get: (_t, p) => p }),
    "framer-motion": { motion: new Proxy({}, { get: (_t, p) => `motion.${p}` }), AnimatePresence: "AnimatePresence" },
    "@/components/site-footer": { SiteFooter: "footer" }, "@/hooks/use-toast": { useToast: () => ({ toast() {} }) },
    "@/components/markdown": { Markdown: "Markdown" }, "@/components/Markdown": { Markdown: "Markdown" },
    "@expo/vector-icons": { Feather: "Feather" }, "expo-haptics": {}, "expo-router": {},
    "react-native": { View: "View", Text: "Text", Pressable: "Pressable", ActivityIndicator: "ActivityIndicator", ScrollView: "ScrollView", Platform: { OS: "web", select: (o) => o.web }, StyleSheet: { create: (o) => o, hairlineWidth: 1 } },
    "react-native-safe-area-context": {}, "@/components/ScanlineOverlay": {}, "@/components/StudioFooter": {}, "@/hooks/useColors": { useColors: () => colors },
  };
  function component(file, append) { return load(file, deps, { window: { sessionStorage: { getItem: (k) => storage.get(k), setItem: (k, v) => storage.set(k, v), removeItem: (k) => storage.delete(k) } }, fetch() { throw Error("Network is forbidden in source tests"); } }, append); }
  return { calls, effects, state, storage, colors, component, render(fn) { cursor = 0; return fn(); } };
}
function nodes(tree) { if (!tree || typeof tree !== "object") return []; if (Array.isArray(tree)) return tree.flatMap(nodes); return [tree, ...nodes(tree.props?.children)]; }
function text(tree) { if (Array.isArray(tree)) return tree.map(text).join(" "); if (tree == null || typeof tree === "boolean") return ""; if (typeof tree !== "object") return String(tree); return text(tree.props?.children); }
function editor(options = {}) { const h = ui({ states: [syntheticKey, true, false, "", null], ...options }); const c = h.component("artifacts/archive/src/pages/admin.tsx").default; return { h, c, tree: h.render(c) }; }

test("public suggestion form neither requests nor renders retained editorial queue data", () => {
  const h = ui(); const c = h.component("artifacts/archive/src/pages/suggest.tsx").default; const tree = h.render(c);
  assert.equal(h.calls.list.length, 0); assert.ok(!text(tree).includes(pending.title)); assert.ok(!text(tree).includes(pending.controversy));
  assert.ok(text(tree).includes("Submit for Review"));
});
test("public form still submits only the visitor's validated input", () => {
  const h = ui({ states: ["  Synthetic visitor topic  ", "  A synthetic visitor explanation.  ", null] }); const c = h.component("artifacts/archive/src/pages/suggest.tsx").default;
  const form = nodes(h.render(c)).find((n) => n.props.onSubmit); form.props.onSubmit({ preventDefault() {} });
  assert.equal(h.calls.mutations.length, 1); assert.equal(h.calls.mutations[0].data.title, "Synthetic visitor topic");
  assert.equal(h.calls.mutations[0].data.controversy, "A synthetic visitor explanation.");
  h.calls.submit.mutation.onSuccess(); assert.equal(h.state[0], ""); assert.equal(h.state[1], "");
});
test("verified editor supplies its credential to list, approve and reject", async () => {
  const { h } = editor(); const options = h.calls.list[0]; assert.equal(options.query.enabled, true);
  assert.equal(options.request.headers["x-admin-key"], syntheticKey);
  assert.deepEqual(Array.from(options.query.queryKey), listKey); assert.ok(!JSON.stringify(options.query.queryKey).includes(syntheticKey));
  assert.equal(h.calls.approve.request.headers["x-admin-key"], syntheticKey); assert.equal(h.calls.reject.request.headers["x-admin-key"], syntheticKey);
  const calls = [];
  const transport = load("lib/api-client-react/src/custom-fetch.ts", {}, { Request, Response,
    fetch: (url, init) => { calls.push({ url, init }); return Promise.resolve(new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } })); },
  });
  const generated = load("lib/api-client-react/src/generated/api.ts", { "@tanstack/react-query": {}, "../custom-fetch": transport });
  const signal = new AbortController().signal; await generated.getListTopicSuggestionsQueryOptions(options).queryFn({ signal });
  assert.equal(calls[0].url, "/api/topic-suggestions"); assert.equal(new Headers(calls[0].init.headers).get("x-admin-key"), syntheticKey); assert.equal(calls[0].init.signal, signal);
});
test("locked console neither fetches nor displays cached private queue", () => {
  const { h, tree } = editor({ states: ["", false, false, "", null] });
  assert.equal(h.calls.list[0].query.enabled, false); assert.ok(!text(tree).includes(pending.title));
});
for (const status of [401, 503]) {
  test(`editor list ${status} hides stale queue and locks/discards protected state`, () => {
    const { h, c, tree } = editor({ queue: { data: [pending], isLoading: false, isError: true, error: { status } } });
    assert.ok(!text(tree).includes(pending.title)); assert.ok(!text(tree).includes("1 PENDING"));
    h.effects.forEach((fn) => fn());
    assert.equal(h.state[1], false); assert.equal(h.state[0], ""); assert.ok(h.calls.clear.includes("cancel")); assert.ok(h.calls.clear.includes("remove"));
    assert.ok(!text(h.render(c)).includes(pending.title));
  });
}
test("editor storage failure is unavailable rather than empty or stale", () => {
  const { tree } = editor({ queue: { data: [pending], isLoading: false, isError: true, error: { status: 500 } } });
  assert.ok(!text(tree).includes(pending.title)); assert.ok(!text(tree).includes("QUEUE EMPTY")); assert.ok(text(tree).includes("Could not load"));
});
test("lock aborts the actual query cache request and a late completion cannot restore it", async () => {
  const archiveRequire = createRequire(path.join(root, "artifacts/archive/package.json"));
  const { QueryClient } = archiveRequire("@tanstack/react-query");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let finish, signal; const inFlight = client.fetchQuery({ queryKey: listKey, queryFn: (context) => { signal = context.signal; return new Promise((resolve) => { finish = resolve; }); } }).catch(() => undefined);
  const { h, c, tree } = editor({ queryClient: client }); h.storage.set("archive_admin_key", syntheticKey);
  nodes(tree).find((n) => n.type === "button" && text(n).trim() === "Lock").props.onClick();
  assert.equal(signal.aborted, true); assert.equal(client.getQueryData(listKey), undefined); assert.equal(h.storage.size, 0);
  finish([pending]); await inFlight; await Promise.resolve(); assert.equal(client.getQueryData(listKey), undefined);
  assert.ok(!text(h.render(c)).includes(pending.title)); client.clear();
});

const topic = { id: 1, slug: "synthetic", title: "Synthetic topic", category: "Synthetic", summary: "Synthetic summary", controversy: "Synthetic controversy", tags: [], featured: false };
for (const cached of [false, true]) {
  test(`web ${cached ? "cached" : "new"} dossier is explicitly AI-generated and unverified`, () => {
    const h = ui({ topic: { ...topic, hasDeepDive: cached }, dive: { data: { research: "Synthetic model text", theories: [], verdict: null } } });
    const tree = h.render(h.component("artifacts/archive/src/pages/topic.tsx").default);
    assert.match(text(tree), /AI-generated.*unverified/i); assert.match(text(tree), /citations.*review date/i);
  });
}
test("web generation loading makes no unsupported source-retrieval claim", () => {
  const h = ui({ topic, dive: { loading: true } }); const tree = h.render(h.component("artifacts/archive/src/pages/topic.tsx").default);
  assert.doesNotMatch(text(tree), /scouring|dark-net|cross-referencing/i); assert.match(text(tree), /AI-generated/i);
});
for (const loading of [false, true]) {
  test(`mobile ${loading ? "loading" : "legacy result"} discloses unverified AI provenance`, () => {
    const h = ui(); const section = h.component("artifacts/mobile/app/topic/[slug].tsx", "\nexports.__section = DeepDiveSection;\n").__section;
    const tree = section({ colors: h.colors, requested: true, loading, error: false, deepDive: { research: "Synthetic legacy model text", theories: [] }, onRequest() {}, onRetry() {} });
    assert.doesNotMatch(text(tree), /cross-referencing|AI-researched/i); assert.match(text(tree), /AI-generated.*unverified/i);
  });
}
