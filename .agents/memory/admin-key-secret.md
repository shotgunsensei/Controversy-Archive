---
name: ADMIN_KEY must be a Secret only
description: Operational rule for the archive admin/moderation password env var
---

The archive Moderation Console password (`ADMIN_KEY`, checked by the api-server `requireAdmin` middleware against `process.env.ADMIN_KEY`) must exist ONLY as a Replit Secret, never also as a shared env var.

**Why:** A merged task once auto-generated `ADMIN_KEY` as a shared env var while the user also set it as a Secret. Two sources for the same name makes runtime resolution ambiguous and means the user's chosen password may not be the one enforced. The user explicitly wanted to set their own password as a Secret.

**How to apply:** When (re)provisioning the admin password, delete any shared `ADMIN_KEY` env var first (`deleteEnvVars` env `shared`), then `requestEnvVar` the Secret. Restart the api-server after the Secret changes so the new value is picked up.
