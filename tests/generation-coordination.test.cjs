const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = path.resolve(__dirname, '../artifacts/api-server/src/routes/topics.ts');
const draft = { research: 'Synthetic local preparation', theories: [], verdict: null };
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

function storage() {
  return { row: { id: 1, slug: 'synthetic-topic', title: 'Synthetic topic', deepDive: null }, lock: false, generations: 0, writes: 0, started: deferred(), release: null, beforeTransaction: null, transactionFailure: false };
}

function instance(shared) {
  const routes = [];
  function select(transaction = false) {
    let locking = false;
    const query = {
      from() { return query; }, where() { return query; },
      for(mode, options) { assert.equal(mode, 'update'); assert.equal(options.noWait, true); locking = true; return query; },
      async limit() {
        if (locking) {
          assert(transaction, 'Row locks must be scoped to a transaction');
          if (shared.lock) throw Object.assign(new Error('Synthetic wrapped contention'), { cause: { code: '55P03' } });
          shared.lock = true;
        }
        return shared.row ? [{ ...shared.row }] : [];
      },
    };
    return query;
  }
  const update = () => ({ set: values => ({ where: async () => { if (shared.writeFailure) throw new Error('Synthetic storage write failure'); shared.writes++; shared.row.deepDive = values.deepDive; } }) });
  const db = {
    select: () => select(false), update,
    async transaction(work) {
      if (shared.transactionFailure) throw new Error('Synthetic unavailable storage');
      shared.beforeTransaction?.();
      const alreadyLocked = shared.lock;
      try { return await work({ select: () => select(true), update }); }
      finally { if (!alreadyLocked) shared.lock = false; }
    },
  };
  const router = { get(url, ...handlers) { routes.push({ method: 'GET', url, handlers }); }, post(url, ...handlers) { routes.push({ method: 'POST', url, handlers }); } };
  const imports = {
    express: { Router: () => router }, '@workspace/db': { db, topicsTable: {} },
    'drizzle-orm': { eq: () => ({}), asc: () => ({}), sql: () => ({}) },
    '../lib/deepDive': { generateDeepDive: async () => { shared.generations++; shared.started.resolve(); if (shared.release) await shared.release.promise; if (shared.providerFailure) throw new Error('Synthetic provider outcome unavailable'); return draft; } },
    '../lib/logger': { logger: { error() {} } }, '../middlewares/requireAdmin': { requireAdmin(_req, _res, next) { next(); } },
  };
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require: name => { if (!imports[name]) throw new Error('Unexpected dependency'); return imports[name]; }, process: { env: { ARCHIVE_EDITOR_GENERATION: 'enabled', AI_INTEGRATIONS_OPENAI_BASE_URL: 'https://example.invalid', AI_INTEGRATIONS_OPENAI_API_KEY: 'synthetic-fixture-only' } } }, { filename: source });
  return async () => {
    const route = routes.find(row => row.method === 'POST' && row.url === '/topics/:slug/deep-dive');
    const request = { params: { slug: 'synthetic-topic' } };
    const reply = { sent: false, statusCode: 200, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; this.sent = true; return this; } };
    for (const handler of route.handlers) { if (reply.sent) break; await handler(request, reply, () => {}); }
    return reply;
  };
}

test('separate process instances do not invoke generation concurrently for one topic', async () => {
  const shared = storage(); shared.release = deferred();
  const firstInstance = instance(shared), secondInstance = instance(shared);
  const first = firstInstance(); await shared.started.promise;
  const second = secondInstance();
  await new Promise(resolve => setImmediate(resolve));
  const beforeRelease = shared.generations; shared.release.resolve();
  const replies = await Promise.all([first, second]);
  assert.equal(beforeRelease, 1);
  assert.equal(shared.generations, 1); assert.equal(shared.writes, 1);
  assert.deepEqual(replies.map(row => row.statusCode), [200, 409]);
});

test('a later instance serves the committed dossier without another generation', async () => {
  const shared = storage();
  assert.equal((await instance(shared)()).statusCode, 200);
  assert.equal((await instance(shared)()).statusCode, 200);
  assert.equal(shared.generations, 1); assert.equal(shared.writes, 1);
});

test('the locked transaction rechecks a cache filled after preflight', async () => {
  const shared = storage(); shared.beforeTransaction = () => { shared.row.deepDive = draft; };
  assert.equal((await instance(shared)()).statusCode, 200);
  assert.equal(shared.generations, 0); assert.equal(shared.writes, 0);
});

test('transaction lookup failure fails closed before generation or a write', async () => {
  const shared = storage(); shared.transactionFailure = true;
  assert.equal((await instance(shared)()).statusCode, 500);
  assert.equal(shared.generations, 0); assert.equal(shared.writes, 0);
});

test('a topic removed after preflight does not trigger generation', async () => {
  const shared = storage(); shared.beforeTransaction = () => { shared.row = null; };
  assert.equal((await instance(shared)()).statusCode, 404);
  assert.equal(shared.generations, 0); assert.equal(shared.writes, 0);
});

test('provider failure releases the lock; a later explicit request can generate again', async () => {
  const shared = storage(); shared.providerFailure = true;
  const request = instance(shared);
  assert.equal((await request()).statusCode, 500);
  assert.equal(shared.lock, false); assert.equal(shared.row.deepDive, null);
  shared.providerFailure = false;
  assert.equal((await request()).statusCode, 200);
  assert.equal(shared.generations, 2); assert.equal(shared.writes, 1);
});

test('post-generation write failure is not misrepresented as exactly-once provider spending', async () => {
  const shared = storage(); shared.writeFailure = true;
  const request = instance(shared);
  assert.equal((await request()).statusCode, 500);
  assert.equal(shared.generations, 1); assert.equal(shared.row.deepDive, null); assert.equal(shared.lock, false);
  shared.writeFailure = false;
  assert.equal((await request()).statusCode, 200);
  assert.equal(shared.generations, 2); assert.equal(shared.writes, 1);
});
