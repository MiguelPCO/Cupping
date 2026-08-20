# Testing Infrastructure — Design

**Date:** 2026-08-19
**Status:** Approved by user, pending implementation plan

## Context

Cupping (Next.js 15.5 App Router, React 19, TypeScript strict, Supabase v2) has zero automated tests today — no Vitest, no Playwright, no CI. A full react-doctor audit (2026-08-18) fixed 80+ code-quality issues but surfaced three `server-auth-actions` findings that turned out to be false positives on manual inspection (the auth guards exist, the scanner's heuristic just didn't recognize the pattern). That near-miss — a real security property that only got confirmed by reading source line-by-line — is the direct motivation for this work: automated tests that assert the property, not a human re-reading code after every change.

This is the first of several planned hardening sub-projects (testing → CI → tech debt → RLS/security audit). This spec covers **testing only**. CI wiring and the broader security audit are explicitly out of scope and will get their own spec/plan cycles.

## Goal

Stand up a working test suite — Vitest for unit/integration, Playwright for E2E — with a first batch of tests covering the highest-value flows, running locally (no CI in this phase).

## Non-goals

- CI/GitHub Actions wiring (next sub-project)
- 100% coverage of any kind — this establishes the harness and proves it on real flows, not exhaustive coverage
- Testing `/terms` or onboarding — those features don't exist yet
- Splitting `coffee-form.tsx` — separate tech-debt sub-project, tracked independently

## Architecture

### Unit / integration — Vitest + React Testing Library

- `jsdom` environment, config at `vitest.config.ts` (project already has `/// <reference types="vitest/config" />`-style precedent to follow from sibling FitGame Pro project, but no existing config here — greenfield).
- Supabase is mocked at the module boundary (`vi.mock("@/lib/supabase/client")` / `vi.mock("@/lib/supabase/server")`) — unit tests never hit a network.
- No offline-mode trick needed (unlike FitGame Pro) since Cupping has no offline fallback layer; mocking the client module is the only viable isolation point.

### E2E — Playwright against a dedicated Supabase Cloud test project

- A **second Supabase project** (free tier), separate from prod. Same schema: apply `supabase/schema.sql` + everything in `supabase/migrations/` via `supabase db push` against it once, then keep it in sync the same way prod is kept in sync.
- `.env.test` holds `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the test project. Playwright's `webServer` config runs `next dev` (or `next start` against a `next build --mode test` — decide in the implementation plan) with that env file loaded.
- Docker/local Supabase (`supabase start`) was considered and rejected for now — Docker isn't installed on the dev machine. This can be revisited later without rewriting tests: same schema, same seed approach, just a different `NEXT_PUBLIC_SUPABASE_URL`.

## Data strategy

### Seeding

- `scripts/seed-test-db.ts` — a one-off Node script using the test project's `service_role` key (never the anon key) to create baseline fixtures: a small number of coffees, and one or two "well-known" users if any suite benefits from a stable fixture (most suites create their own users — see below).

### Isolation between runs

- No shared mutable fixtures for anything a test *writes to*. Every E2E test that creates a user/entry/etc. generates a unique suffix (`crypto.randomUUID().slice(0, 8)`) for emails/usernames, so parallel or repeated runs never collide.
- Each suite's `afterAll` uses a service-role Supabase client to delete exactly what that suite created (by the unique suffix / tracked IDs), keeping the test project from growing unbounded.

### Auth in E2E

- The **auth suite** is the only one that exercises the login UI directly (that's its job).
- Every other suite signs in once via a helper (`tests/e2e/helpers/auth.ts`) and reuses Playwright's `storageState` so each spec file doesn't pay for a full UI login per test.

## Test suites (first batch — all in scope per user)

1. **Auth + entry visibility** (highest priority — this is the property that motivated the whole effort)
   - Signup, login, logout via the real UI.
   - A private entry (`visibility: "private"`) created by user A does **not** appear on user A's public profile when viewed as user B, and does not appear in the community activity feed. This is the RLS assertion the react-doctor false positives couldn't give us.

2. **Coffee CRUD**
   - Full 5-step `CoffeeForm` wizard: create a review (info → rating → flavors → photo → collection), verify it persists and renders on the detail page.
   - Edit an existing entry, verify changes persist.
   - Delete an entry, verify it's gone.

3. **Social**
   - Follow / unfollow a user, verify follower/following counts update.
   - Like an entry, verify the like count and toggle state.
   - Activity feed reflects a followed user's new public entry.

4. **Dashboard stats — unit, not E2E**
   - `use-dashboard-stats.ts` computes rating distributions, sub-rating averages, and flavor-family radar data from a plain `entries` array with no Supabase dependency — ideal Vitest target. Feed it fixture arrays, assert the computed shape/values directly. Far more precise and far faster than asserting on rendered chart pixels.

### Unit test targets outside the dashboard (rounds out the first batch)

- `lib/validations/coffee.ts` — Zod schema edge cases (invalid ratings, required fields).
- `lib/actions/coffee.ts`, `lib/actions/social.ts` — the exact functions the scanner flagged: assert an unauthenticated call returns `{ error: "No autenticado" }` and never reaches `.insert()`/`.update()` (mock the Supabase client, assert it was never called on the auth-rejected path).
- Interactive components with real logic: `RatingCups` (keyboard nav, half-cup click math), `search-modal.tsx` (arrow-key navigation, Enter-to-navigate), `CoffeeForm` step gating (`goNext` validation per step).

## Error handling / flakiness guardrails

- E2E tests against a real cloud backend are inherently slower and more flake-prone than a local/mocked backend. Mitigate with: generous but bounded Playwright timeouts, `waitForSelector` on real content markers (not fixed sleeps — matches the pattern already used by FitGame Pro's E2E suite per prior project notes), and retries limited to CI (none needed yet since this phase is local-only).
- Seed/cleanup scripts must be idempotent — re-running the seed script twice should not fail or duplicate fixtures.

## Open questions for the implementation plan (not blocking spec approval)

- Exact Playwright `webServer` command (`next dev` vs a `test`-mode build) — mirrors a decision FitGame Pro already made once; reuse that reasoning during planning.
- Whether `scripts/seed-test-db.ts` runs manually before a local test session or gets wired into a Playwright `globalSetup` — planning-level detail.

## Success criteria

- `npx vitest run` passes locally with the unit targets listed above covered.
- `npx playwright test` passes locally against the dedicated test Supabase project, covering all four suites (dashboard as unit, the rest as E2E).
- The auth-guard assertion on `lib/actions/coffee.ts` / `social.ts` exists and passes — directly closing the doubt the react-doctor false positives raised.
