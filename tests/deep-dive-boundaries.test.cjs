const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = path.resolve(process.env.ARCHIVE_TEST_SOURCE_ROOT || path.join(__dirname, '..'), 'artifacts/api-server/src/routes/topics.ts');

function fixture({ cached = false, enabled = false, configured = true, adminConfigured = true } = {}) {
  const routes = [];
  const state = { generations: 0, writes: 0 };
  const draft = { research: 'Synthetic draft only', theories: [], verdict: null };
  const row = { id: 1, slug: 'synthetic-topic', title: 'Synthetic topic', deepDive: cached ? draft : null };
  const db = {
    select: () => ({ from: () => ({ where: () => ({ for: () => ({ limit: async () => [row] }), limit: async () => [row] }) }) }),
    update: () => ({ set: () => ({ where: async () => { state.writes++; } }) }),
    transaction: async work => work(db),
  };
  const router = { get(url, ...handlers) { routes.push({ method: 'GET', url, handlers }); }, post(url, ...handlers) { routes.push({ method: 'POST', url, handlers }); } };
  const env = { ...(adminConfigured ? { ADMIN_KEY: 'synthetic-editor-fixture-only' } : {}), ...(enabled ? { ARCHIVE_EDITOR_GENERATION: 'enabled', ...(configured ? { AI_INTEGRATIONS_OPENAI_BASE_URL: 'https://example.invalid', AI_INTEGRATIONS_OPENAI_API_KEY: 'synthetic-fixture-only' } : {}) } : {}) };
  const authModule = { exports: {} };
  const authSource = path.resolve(path.dirname(source), '../middlewares/requireAdmin.ts');
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(authSource, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { module: authModule, exports: authModule.exports, process: { env } });
  const { requireAdmin } = authModule.exports;
  const imports = {
    express: { Router: () => router }, '@workspace/db': { db, topicsTable: {} },
    'drizzle-orm': { eq: () => ({}), asc: () => ({}), sql: () => ({}) },
    '../lib/deepDive': { generateDeepDive: async () => { state.generations++; return draft; } },
    '../lib/logger': { logger: { error() {} } }, '../middlewares/requireAdmin': { requireAdmin },
  };
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, require: name => { if (!imports[name]) throw new Error(`Unexpected dependency: ${name}`); return imports[name]; }, process: { env } }, { filename: source });
  async function request(method, authorized = false) {
    const route = routes.find(item => item.method === method && item.url === '/topics/:slug/deep-dive');
    assert(route, `${method} route must exist`);
    const res = { statusCode: 200, sent: false, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; this.sent = true; return this; } };
    const req = { params: { slug: row.slug }, header: name => authorized && name === 'x-admin-key' ? env.ADMIN_KEY : undefined };
    for (const handler of route.handlers) { if (res.sent) break; await handler(req, res, () => {}); }
    return res;
  }
  return { state, request };
}

test('uncached public GET performs no generation or database write', async () => {
  const f = fixture(); const response = await f.request('GET');
  assert.equal(f.state.generations, 0);
  assert.equal(f.state.writes, 0);
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.code, 'ARCHIVE_DEEP_DIVE_NOT_PREPARED');
});

test('cached public GET remains available without provider work', async () => {
  const f = fixture({ cached: true }); const response = await f.request('GET');
  assert.equal(response.statusCode, 200); assert.equal(response.body.research, 'Synthetic draft only');
  assert.equal(f.state.generations, 0); assert.equal(f.state.writes, 0);
});

test('editor preparation is disabled by default and requires server authorization', async () => {
  const f = fixture();
  assert.equal((await f.request('POST')).statusCode, 401);
  assert.equal((await f.request('POST', true)).statusCode, 503);
  assert.equal(f.state.generations, 0); assert.equal(f.state.writes, 0);
});

test('explicitly enabled editor-only preparation uses the synthetic generation port', async () => {
  const f = fixture({ enabled: true });
  assert.equal((await f.request('POST')).statusCode, 401);
  assert.equal((await f.request('POST', true)).statusCode, 200);
  assert.equal(f.state.generations, 1); assert.equal(f.state.writes, 1);
});

test('enabled preparation fails closed without provider configuration', async () => {
  const f = fixture({ enabled: true, configured: false });
  const response = await f.request('POST', true);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, 'ARCHIVE_EDITOR_GENERATION_UNCONFIGURED');
  assert.equal(f.state.generations, 0); assert.equal(f.state.writes, 0);
});

test('preparation fails closed when the existing server editor key is unavailable', async () => {
  const f = fixture({ enabled: true, adminConfigured: false });
  assert.equal((await f.request('POST', true)).statusCode, 503);
  assert.equal(f.state.generations, 0); assert.equal(f.state.writes, 0);
});
