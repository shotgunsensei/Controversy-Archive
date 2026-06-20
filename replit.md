# Source of Truth, Destination Mystery

A searchable web archive of the internet's most controversial and debated topics — anomalies, lost histories, mysteries, and conspiracies — where each entry opens into an AI-generated research dossier with plausible theories and a balanced verdict.

## Run & Operate

- `pnpm --filter @workspace/archive run dev` — run the web frontend
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/scripts run seed` — seed/refresh the topics catalog (idempotent upsert by slug)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Postgres), `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` (OpenAI via Replit integration)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter (routing), TanStack Query, Tailwind, framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI (gpt-5.4) via `@workspace/integrations-openai-ai-server`
- API codegen: Orval (hooks + Zod) from OpenAPI spec

## Where things live

- DB schema (source of truth): `lib/db/src/schema/topics.ts` — `topicsTable` includes a `deepDive` jsonb column that caches the generated dossier
- API contract (source of truth): `lib/api-spec/openapi.yaml` → codegen produces `lib/api-client-react` (hooks) and `lib/api-zod` (schemas)
- API routes: `artifacts/api-server/src/routes/topics.ts`; AI generation: `artifacts/api-server/src/lib/deepDive.ts`
- Frontend pages: `artifacts/archive/src/pages/` (`home.tsx`, `topic.tsx`)
- Seed catalog (57 topics): `scripts/src/seed.ts`

## Architecture decisions

- Deep dives are generated on first request and cached in the topic row (`deepDive` jsonb). Subsequent requests serve from DB — no regeneration. This keeps cost down and responses instant after the first ~20s generation.
- Topic search/filter/sort is done in-process over the full table (small catalog), not via SQL full-text — simpler and adequate at this scale.
- The OpenAPI spec uses only GET endpoints (no request bodies) so codegen stays clean.

## Product

- Browse 57 controversial topics across 7 categories (Mysteries, Places, People, Inventions, Events, Conspiracies, Artifacts).
- Home: live debounced search, category filter, sort, featured "Priority Dossiers" + full archive grid, archive stats.
- Detail page (`/topic/:slug`): topic overview + on-demand AI "Deep Dive" with markdown research, color-coded theory plausibility, and a verdict.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After editing OpenAPI spec, run codegen before relying on new hooks/schemas.
- After changing `lib/db` or `lib/integrations-*` (composite TS projects), their `.d.ts` outputs must be rebuilt (`tsc --build`) before dependents typecheck cleanly.
- Restart a workflow after code changes — running workflows serve a built bundle, not live source.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
