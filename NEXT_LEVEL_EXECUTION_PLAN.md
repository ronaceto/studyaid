# StudyAid4U Next-Level Execution Plan

## Objective
Stabilize deployment, eliminate 404/API failures, and raise product quality with a phased engineering plan that is testable, measurable, and low-risk.

## Guiding principles
- Fix **platform and architecture blockers first** before feature work.
- Make every phase deployable with a rollback path.
- Prefer configuration hardening and automated validation over manual checks.

## Phase 0 — Triage and baseline (Day 0-1)

### Goals
- Reproduce current failures deterministically.
- Capture a baseline for comparison.

### Tasks
1. Freeze current branch and tag baseline (`pre-stabilization`).
2. Run local and CI checks:
   - `npm ci`
   - `npm run build`
   - smoke routes (`/`, `/quick-quiz`, `/tutor`)
3. Export current Netlify build logs and environment variable inventory (names only, no values).
4. Create an issue matrix mapped to categories:
   - Deployment/config
   - Runtime API
   - Missing routes/features
   - TypeScript/build errors

### Exit criteria
- A reproducible checklist exists for each major failure with evidence (log snippet + route/API).

---

## Phase 1 — Deployment architecture hardening (Day 1-2)

### Goals
- Eliminate 404s from misaligned root/build paths.
- Ensure Next.js adapter owns routing/functions.

### Tasks
1. Decide one deployment topology:
   - **Preferred:** keep current repo shape and set `base` correctly in `netlify.toml`.
   - Alternative: flatten repo to root if team wants simpler ops.
2. Standardize `netlify.toml`:
   - Include `@netlify/plugin-nextjs`.
   - Remove manual `functions` overrides for app router endpoints.
   - Remove conflicting redirects/publish settings not required by plugin.
3. Add a CI assertion script that fails if expected files are not found in the configured base:
   - `package.json`
   - `next.config.js`
   - `app/`

### Exit criteria
- Netlify preview deploy serves `/` and core routes without 404.
- No duplicated/misrouted functions in deploy logs.

---

## Phase 2 — Secrets and environment reliability (Day 2)

### Goals
- Stop Prisma/OpenAI failures caused by missing env vars.
- Prevent secret scanning failures from leaked values in build artifacts.

### Tasks
1. Define a required env contract in docs and startup validation:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - auth and SMTP variables only if features enabled
2. Add environment validation at server startup (e.g., zod/env module), with clear error messages.
3. Ensure no secrets are committed:
   - rotate any previously exposed credentials
   - scrub hard-coded secret-like values
4. Update build strategy:
   - run `prisma generate` in build
   - move `prisma migrate deploy` to a controlled release job or guarded step

### Exit criteria
- Build succeeds when optional env vars are absent and fails fast only for truly required vars.
- Secret scanning passes for new deploys.

---

## Phase 3 — Application correctness and route completion (Day 3-5)

### Goals
- Resolve compile/runtime breaks.
- Implement missing tutor flow routes required by smoke tests.

### Tasks
1. Normalize Prisma client imports:
   - choose `lib/prisma.ts` or `lib/db.ts`
   - update all imports consistently
2. Implement missing tutor pages/API paths:
   - hint
   - attempt
   - reflection
   - reveal
3. Harden `app/api/quick-quiz/create/route.ts`:
   - validate payload
   - apply defaults
   - clamp count range
   - return typed error responses
4. Resolve TypeScript issues identified in report:
   - undefined/mis-imported types (`Mode`, `SessionStatus`)
   - invalid Prisma `orderBy`
   - invalid React node returns/layout issues

### Exit criteria
- `npm run build` passes cleanly.
- Smoke tests for tutor + quick-quiz flows pass locally and in preview deploy.

---

## Phase 4 — Quality gates and observability (Day 5-6)

### Goals
- Prevent regressions and shorten debugging loops.

### Tasks
1. Add integration coverage for critical flows:
   - quick-quiz generation API
   - tutor step progression
2. Add route health checks in CI for deployed previews.
3. Add structured server logging for API failures (request id, route, status, sanitized error).
4. Add user-facing error states for AI/API failures.

### Exit criteria
- New PRs are blocked if critical route/API tests fail.
- On-call can diagnose failures from logs in <10 minutes.

---

## Phase 5 — Product maturity track (Week 2+)

### Goals
- Move from “stable app” to “learning product.”

### Tasks
1. Authentication + per-user progress tracking.
2. Session analytics (completion, hint usage, retry rates).
3. Content safety/quality improvements for generated questions.
4. Admin tooling for curriculum/topic management.

### Exit criteria
- Team has measurable learning KPIs and a repeatable release cadence.

---

## Recommended sequencing by risk and impact
1. Deployment architecture (Phase 1)
2. Env/secrets reliability (Phase 2)
3. Route/type correctness (Phase 3)
4. Testing + observability (Phase 4)
5. Product enhancements (Phase 5)

## Ownership model
- **Tech Lead:** architecture and release gating decisions
- **Platform Engineer:** Netlify/Vercel, env contracts, CI
- **App Engineer(s):** tutor/quiz flows and TS fixes
- **QA/Automation:** smoke/integration coverage and preview checks

## Decision checkpoint: Netlify vs Vercel
After Phase 2, run one controlled preview deployment on both platforms and compare:
- build success rate
- median deploy time
- runtime API error rate
- operational overhead

If Vercel materially reduces operational complexity, plan a managed migration in a dedicated sprint.
