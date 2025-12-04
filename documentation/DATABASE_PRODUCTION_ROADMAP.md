# Database Production Readiness Roadmap

This document outlines the concrete steps required to lift the Supabase layer of the realtime workspace application to production quality. The checklist is grouped by capability area so engineering, data, and platform teams can execute in parallel.

## 1. Migration & Schema Hygiene
- Author a Supabase migration for every structural change (`supabase migration new <name>`), apply locally, and commit the SQL under `supabase/migrations/`.
- Remove console-only tweaks by re-expressing them as migrations; document rollback guidance for each change.
- Introduce environment bootstrap scripts (seed data, QA fixtures) and check them into version control.
- Version all database functions, triggers, and RLS policies alongside the migrations.

## 2. Row-Level Security Hardening
- Replace broad FOR ALL policies with verb-specific rules for `users`, `projects`, `workspace_tabs`, and `workspace_history`.
- Ensure each policy has a matching `WITH CHECK` clause to prevent privilege escalation on INSERT/UPDATE.
- Create explicit service-role policies only where automation requires bypassing RLS (e.g., webhooks, admin tasks).
- Add regression tests that verify authenticated users can access only their own rows and that anonymous users see nothing.
- Plan the Clerk → Supabase JWT template integration so browser clients can rely on RLS without the service key.

## 3. Data Integrity & Lifecycle
- Tighten constraints: add `NOT NULL` and sensible defaults to business-critical columns, enforce `UNIQUE (project_id, position)` on `workspace_tabs`, and ensure FKs have the correct `ON DELETE` behavior.
- Define cascade/soft-delete flows for projects, tabs, and history; implement using FK clauses, triggers, or background jobs.
- Validate API handlers so they meet the new constraints and keep metadata (e.g., `activeBriefSectionIds`) consistent.
- Populate and maintain lifecycle timestamps (`last_active_at`, `changed_at`) through triggers or scheduled jobs.

## 4. Performance & Scalability
- Run `EXPLAIN ANALYZE` on primary queries (project listing, tab updates, webhook inserts) using production-like data.
- Add or adjust composite indexes—examples: `(user_id, updated_at DESC)` on `projects`, `(project_id, position)` on `workspace_tabs`.
- Document query plans and index rationale in the repo for future tuning.
- Establish Supabase connection pooling limits, query timeouts, and caching strategies if hotspots emerge.
- Load-test service-role endpoints to ensure they withstand concurrent webhook bursts and user onboarding spikes.

## 5. Operations & Observability
- Update `package.json` with scripts such as `"db:migrate": "supabase db push"` and wire them into CI/CD so deployments halt on migration failure.
- Schedule automated Supabase backups, perform verification restores, and document the procedure in an Ops runbook.
- Pipe Supabase logs to centralized monitoring (Logflare, Datadog, etc.) and configure alerting for webhook failures, policy violations, and anomalous insert errors.
- Store secrets in managed environment providers (Vercel, Supabase config) and set a rotation cadence.

## 6. Data Governance & Compliance
- Classify PII fields and define retention/anonymization policies; capture this in a compliance handbook.
- Build an export/delete workflow for data subject access requests (DSAR) and connect it to support tooling.
- Log administrative actions (service-role writes, schema changes) to an immutable audit target.
- Prepare an incident response playbook covering key rotation, customer comms, and legal notifications.

## 7. Validation & Testing
- Add integration tests that exercise RLS paths, project CRUD, and webhook flows with Supabase test instances.
- Introduce load tests (k6/Artillery) focusing on project creation and tab synchronization.
- Gate production deployments on test suites, migration success, and basic health checks.

## Execution Order
1. **Schema & migration hygiene** – establishes a baseline for reproducibility.
2. **RLS hardening** – secures customer data and enables client-side access patterns.
3. **Integrity & lifecycle updates** – prevents data drift as usage scales.
4. **Performance tuning** – keeps latency acceptable before traffic ramps up.
5. **Operations & governance** – ensures recoverability, observability, and compliance.

Check off each milestone as you complete it and append artifacts (migration IDs, runbooks, dashboards) to this document for long-term traceability.
