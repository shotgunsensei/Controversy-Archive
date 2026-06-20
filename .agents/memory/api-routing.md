---
name: API routing in this monorepo
description: How the frontend reaches the api-server and why curl to the dev domain can mislead
---

The frontend api client (`lib/api-client-react`) issues **relative** requests like `/api/topics` (no base URL set for web). These resolve against the page origin, which is the preview proxy at `localhost:80`. That proxy does path-based routing to each artifact.

**Gotcha:** `curl "$REPLIT_DEV_DOMAIN/api/..."` can return empty because the dev domain maps to a specific externalPort (per `.replit [[ports]]`), which may be a different artifact (e.g. the mockup-sandbox on externalPort 80), not the path-routed proxy the browser uses.

**How to verify the API directly:** curl the api-server on its own local port (check the workflow log for `Server listening port: NNNN`, e.g. `curl http://localhost:8080/api/healthz`). To verify end-to-end as the user sees it, use the app_preview screenshot (it goes through `localhost:80` path routing) rather than curling the dev domain.
