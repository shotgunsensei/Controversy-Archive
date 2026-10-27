# Editor generation coordination follow-on

Base: `78183c4c4d178722cb6e0b4b05a7f0255beee4f7`. Isolated branch: `codex/archive-generation-oct27`. The reviewed original quality candidate is preserved. This source-only change has no migration and no public frontend change. Root reviewed the row-ID lock, NOWAIT, post-lock cache recheck and same-transaction update.

## Implemented contract

The existing application has a shared PostgreSQL `topics` table, one cached dossier per topic and an explicit, default-disabled, server-editor preparation action. That existing cache contract supports database coordination without inventing a new account, provider, allowance or schema.

The editor POST retains authentication, default-disabled activation, provider-configuration checks, public read-only GET behavior and local promise sharing. A preparation transaction acquires the existing topic row with `FOR UPDATE NOWAIT`, rechecks its current cache, invokes the existing generator only if still empty, and writes the result before the transaction commits. Another instance encountering the lock receives 409 `ARCHIVE_DEEP_DIVE_PREPARING`. An unavailable transaction or removed topic produces no generation. No database or provider was contacted during this implementation.

## Verified limits, failure and retry behavior

This coordinates simultaneous work **while the database transaction/session remains alive**. It does not provide crash-safe or exactly-once paid execution. Provider success followed by persistence failure, process termination or database session loss can leave no committed cache while provider work has occurred or is still running. A later explicit POST can generate again. Tests deliberately preserve that outcome instead of presenting it as a solved spending policy. There is no automatic retry or reclamation mechanism added here.

The transaction holds a database connection and topic-row lock during the provider call and its SDK retry behavior. Unrelated topics may consume separate connections; NOWAIT prevents another instance from waiting on the same topic but does not establish a global concurrency budget. Database session termination can release the lock while remote work continues. Activation therefore needs coordinated provider/transaction timeouts, pool capacity and a durable ambiguous-outcome policy.

The application client explicitly configures neither `timeout` nor `maxRetries`. It declares OpenAI `^6.27.0`; its lockfile resolves `6.44.0(ws@8.21.0)(zod@3.25.76)`. The installed compatible SDK used by the disclosed local type graph is **6.49.0**; its source defaults are **600,000ms request timeout and two retries**, allowing retryable failures to outlast one request timeout. These inspected cache defaults do not verify the locked or deployed runtime, proxy settings, provider deadlines or actual retry outcomes. The generator's source output cap of 8,192 completion tokens is not a currency spending ceiling.

## Verification

- Existing editorial/generation regressions plus seven coordination/calibration tests: **33/33 passed, zero skips**. The coordination tests load independent actual route modules with a shared synthetic transaction/row-lock/provider fixture. They are not two real servers or PostgreSQL integration tests.
- The initial five new coordination tests against the prior implementation produced one pass and four failures; the failure evidence is retained outside the source worktree.
- Complete API source TypeScript gate passed with the already-disclosed compatible cached graph. No package acquisition or exact-lockfile/full-root claim.
- OpenAPI YAML unique-key/parse validation passed and documents contention 409. Exact Orval regeneration remains unrun.
- The immutable patch is checked for application to the preserved base; root owns commit/publication. No frontend rebuild is required for this API-only change.

Commands: `node --test tests/editorial-boundaries.test.cjs tests/deep-dive-boundaries.test.cjs tests/generation-coordination.test.cjs`; complete API `tsc -p` using `evidence/quality-oct27/companions/tsconfig.archive-generation-api.json`; YAML validation with existing `yaml@2.9.0`; `git diff --check`; `git apply --check` against the clean base.

## Remaining activation inputs and engineering

No quantitative generation-budget contract exists in this repository. Keep `ARCHIVE_EDITOR_GENERATION` disabled until the owner approves: resource scope (archive/provider project/editor), budget measure and amount, accounting/reset period, allowed parallel preparations, request/retry deadlines and ambiguous-paid-outcome/reconciliation rules. No values were invented. A durable reservation/usage ledger and reconciliation implementation must follow those decisions before claiming enforceable spending or crash-safe deduplication.

Existing `ADMIN_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` and actual database binding require secure owner configuration and acceptance; their values were not read or changed. Production database/provider testing remains gated. A real disposable PostgreSQL concurrency test also remains unrun: `postgres.exe`, `initdb.exe`, `psql.exe` were absent from PATH and the two standard PostgreSQL installation directories were absent. An already-approved disposable runtime location could enable that test; no download or installation was attempted.

This is bounded manual source-backed review and synthetic validation. The required Standard Security scan/start/artifact tools remain unavailable. Existing production, credential, dependency and publication holds remain unchanged.
