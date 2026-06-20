---
name: DB schema push
description: How drizzle schema changes reach the Postgres database in this monorepo.
---
Schema is defined in `lib/db/src/schema/*` (drizzle-orm). There are no SQL
migration files — the database is synced with `drizzle-kit push`:

- `pnpm --filter @workspace/db run push` (interactive) or `... run push-force`.

**Why:** A fresh/parallel environment's DB can be empty even though the schema
code exists, so API routes fail with `relation "<table>" does not exist` (500)
until you push. Encountered when the `topic_suggestions` table was missing.

**How to apply:** After adding/changing any table or column in `lib/db`, run the
push before testing endpoints that touch the new shape.
