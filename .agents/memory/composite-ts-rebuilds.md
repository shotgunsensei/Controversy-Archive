---
name: Composite TS project rebuilds
description: Why dependents fail typecheck after editing a lib/* package, and how to fix
---

In this pnpm monorepo, `lib/*` packages are TypeScript composite projects consumed via project references. Dependents (`artifacts/*`, `scripts`) typecheck against the referenced package's emitted `.d.ts`, NOT its source.

**Rule:** After editing a `lib/*` package's source (e.g. adding a DB schema export, fixing an integration lib), rebuild its declarations before dependents will typecheck cleanly: `cd lib/<pkg> && npx tsc --build`.

**Why:** Symptoms are misleading — you get `TS2305 Module has no exported member X` or `TS6305 Output file has not been built from source` even though the export clearly exists in source. The dist `.d.ts` is just stale.

**How to apply:** When a dependent suddenly can't see a newly added export from a workspace `lib`, rebuild that lib with `tsc --build` first before suspecting the code. Note that a freshly copied composite lib must build cleanly (its own source must typecheck) before its `.d.ts` is emitted at all.
