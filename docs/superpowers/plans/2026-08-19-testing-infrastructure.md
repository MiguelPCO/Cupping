# Testing Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Vitest+RTL unit testing and Playwright E2E testing for Cupping, with a first batch of tests covering auth/visibility, coffee CRUD, social, and dashboard stats.

**Architecture:** Vitest (jsdom) for unit/integration tests with Supabase mocked at the module boundary (`@/lib/supabase/server`, `@/lib/supabase/client`, `@/lib/hooks`). Playwright E2E tests run against a real `next dev` server pointed at a dedicated Supabase Cloud test project via `.env.test`, using service-role-created pre-confirmed users for login-gated suites and the real UI for the signup flow itself.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitejs/plugin-react, jsdom, @playwright/test, dotenv, @supabase/supabase-js (service-role admin client in test helpers only).

**Spec:** `docs/superpowers/specs/2026-08-19-testing-infrastructure-design.md`

## Global Constraints

- No CI/GitHub Actions wiring in this plan — local-only (spec non-goal).
- Not aiming for 100% coverage — this batch only (spec non-goal).
- Do not touch `/terms` or onboarding — features don't exist (spec non-goal).
- Do not split `coffee-form.tsx` — separate tech-debt sub-project (spec non-goal, user's explicit call).
- Every test-data-creating E2E test must use a `crypto.randomUUID().slice(0, 8)` suffix for emails/usernames and clean up in `afterAll` via a service-role client (spec: Isolation between runs).
- Seed script (`scripts/seed-test-db.ts`) must be idempotent — safe to run twice (spec: Success criteria).
- Package manager is **npm** (this repo uses `package-lock.json`, not pnpm/yarn) — use `npm install`, `npm run <script>` throughout.
- Resolved open questions from the spec (locked for this plan):
  - **Playwright `webServer` command:** `next dev --turbopack -p 3100`, with env vars loaded from `.env.test` via `dotenv` and injected into `webServer.env` — `next dev` always forces `NODE_ENV=development` internally, so Next's automatic `.env.test` loading (which only fires when `NODE_ENV=test`) cannot be relied on. Port 3100 avoids colliding with a developer's own `npm run dev` on 3000.
  - **Seed script wiring:** manual (`npm run seed:test`, documented, not wired into Playwright `globalSetup`) — keeps the harness simple for this local-only phase; revisit when CI is added.
  - **New-user creation for login-gated E2E suites:** Supabase's real signup flow requires email confirmation before a session exists, which E2E can't click through. The "Auth" suite tests the real signup UI (asserting the "check your email" success state) separately from login. Every other suite that needs an authenticated session creates its user via the service-role `auth.admin.createUser({ email_confirm: true })` API in a helper, then logs in through the real UI with those credentials — still a real UI login, just with an out-of-band, pre-confirmed account.
  - **"Add café" entry point for CRUD E2E:** the header's "Añadir café" button opens a modal (`add-coffee-modal.tsx`) wrapping the same `CoffeeForm`. E2E navigates directly to `/coffee/new` instead of driving the modal — same component under test, fewer moving parts.
  - **Deviation from the spec's `storageState` reuse:** the spec's Data Strategy section calls for signing in once per suite and reusing Playwright's `storageState` so non-auth suites don't pay for a full UI login per test. This plan does **not** implement that — `loginAs()` (Task 10) drives the real login UI on every call, including multiple times within the same test file. Reason: `storageState` reuse assumes a stable pre-existing account: our users are created fresh per test run (`createTestUser`, unique-suffixed) specifically for isolation, so there's no static credential to log in with ahead of time in a `globalSetup` step — wiring real reuse would mean logging in once per dynamically-created user inside `beforeAll` and hand-rolling a `browser.newContext({ storageState })` per test, which is meaningfully more machinery for a suite this size (3 files, single-digit tests each, `workers: 1`, no CI yet). Flagging this explicitly rather than silently dropping it: if E2E runtime becomes a real pain point later, this is the first optimization to add, and it composes cleanly with the CI sub-project's own `globalSetup` needs.

---

## Task 1: Vitest + React Testing Library harness

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (devDependencies + `scripts.test`, `scripts.test:watch`)
- Test: `src/lib/utils.test.ts` (smoke test)

**Interfaces:**
- Produces: `npm run test` (runs `vitest run`), `npm run test:watch` (runs `vitest`). Every later unit-test task depends on this config existing and passing.

- [ ] **Step 1: Install dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"],
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add npm scripts to `package.json`**

Add to the `"scripts"` block (alongside the existing `dev`/`build`/`lint`/`typecheck`):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write the smoke test**

Create `src/lib/utils.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});
```

- [ ] **Step 6: Run it, verify pass**

Run: `npm run test`
Expected: PASS — 2 tests in `src/lib/utils.test.ts`. If it fails on module resolution (`Cannot find module '@/lib/utils'`), check the `resolve.alias` path in `vitest.config.ts` matches `tsconfig.json`'s `"@/*": ["./src/*"]`.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json src/lib/utils.test.ts
git commit -m "test: add Vitest + React Testing Library harness"
```

---

## Task 2: Playwright harness + `.env.test`

**Files:**
- Create: `playwright.config.ts`
- Create: `.env.test.example` (committed template)
- Create: `.env.test` (gitignored — real test-project credentials)
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (devDependencies + `scripts.test:e2e`)
- Modify: `.gitignore` (add `.env.test`, add `tests/e2e/.auth/`)

**Interfaces:**
- Produces: `npm run test:e2e` (runs `playwright test`), a `.env.test` convention every later E2E task reads from (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

- [ ] **Step 1: Install dependencies**

```bash
npm install -D @playwright/test dotenv
npx playwright install chromium
```

- [ ] **Step 2: Create the dedicated Supabase test project**

Manual step (do this once, outside the codebase): create a second, free-tier Supabase project separate from prod. In the SQL Editor, run the full contents of `supabase/schema.sql`, then every file in `supabase/migrations/` in filename order (`20260619_...` through `20260622_entry_visibility.sql`). Also create the `coffee-photos` storage bucket (public) per the commented-out block at the bottom of `schema.sql`.

- [ ] **Step 3: Create `.env.test.example`**

```
# Dedicated Supabase Cloud TEST project — never point this at prod.
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
```

- [ ] **Step 4: Create `.env.test` with real test-project values**

Copy `.env.test.example` to `.env.test` and fill in the actual test-project URL, anon key, and service-role key (from Supabase Dashboard → Project Settings → API, on the test project created in Step 2 — never the prod project).

- [ ] **Step 5: Add `.env.test` and the Playwright auth-state cache to `.gitignore`**

Add these lines to `.gitignore` (near the existing `.env.local` line):

```
.env.test
tests/e2e/.auth/
```

- [ ] **Step 6: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(__dirname, ".env.test") });

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npx next dev --turbopack -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
  },
});
```

- [ ] **Step 7: Add npm script to `package.json`**

```json
"test:e2e": "playwright test"
```

- [ ] **Step 8: Write the smoke test**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/CUPPING/i);
});
```

- [ ] **Step 9: Run it, verify pass**

Run: `npm run test:e2e`
Expected: PASS — Playwright boots `next dev` on port 3100, waits for it to be ready, and the smoke test passes. If it times out waiting for the server, run `npx next dev --turbopack -p 3100` manually first to check for a startup error (most likely a missing/invalid `.env.test` value).

- [ ] **Step 10: Commit**

```bash
git add playwright.config.ts .env.test.example tests/e2e/smoke.spec.ts package.json package-lock.json .gitignore
git commit -m "test: add Playwright E2E harness against dedicated test Supabase project"
```

(`.env.test` itself is gitignored and never committed.)

---

## Task 3: `use-dashboard-stats` unit tests

**Files:**
- Test: `src/lib/hooks/use-dashboard-stats.test.ts`

**Interfaces:**
- Consumes: `useDashboardStats(entries: CoffeeEntryWithCoffee[])` from `src/lib/hooks/use-dashboard-stats.ts`, returning `DashboardStats` (see that file's exported interface — `totalCoffees`, `avgRating`, `thisWeekCount`, `currentStreak`, `ratingDistribution`, `topBrands`, `topOrigins`, `reviewTimeline`, `subRatingAverages`, `flavorFamilyData`).

- [ ] **Step 1: Write the tests**

Create `src/lib/hooks/use-dashboard-stats.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDashboardStats } from "./use-dashboard-stats";
import type { CoffeeEntryWithCoffee } from "@/types/coffee";

function makeEntry(overrides: Partial<CoffeeEntryWithCoffee> = {}): CoffeeEntryWithCoffee {
  return {
    id: crypto.randomUUID(),
    user_id: "user-1",
    coffee_id: "coffee-1",
    rating_global: 4,
    rating_aroma: null,
    rating_body: null,
    rating_acidity: null,
    rating_sweetness: null,
    rating_bitterness: null,
    rating_aftertaste: null,
    notes: null,
    photo_url: null,
    brew_method: null,
    visibility: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    flavor_tags: [],
    coffee: {
      id: "coffee-1",
      name: "Yirgacheffe",
      brand: "Stumptown",
      type: "bean",
      origin: "Ethiopia",
      roast_level: "light",
      image_url: null,
      avg_rating: 4,
      total_reviews: 1,
      created_by: "user-1",
      created_at: new Date().toISOString(),
    },
    ...overrides,
  } as CoffeeEntryWithCoffee;
}

describe("useDashboardStats", () => {
  it("returns zeroed stats for an empty entry list", () => {
    const { result } = renderHook(() => useDashboardStats([]));
    expect(result.current.totalCoffees).toBe(0);
    expect(result.current.avgRating).toBe(0);
    expect(result.current.currentStreak).toBe(0);
  });

  it("counts unique coffees and averages ratings", () => {
    const entries = [
      makeEntry({ id: "e1", coffee_id: "c1", rating_global: 4 }),
      makeEntry({ id: "e2", coffee_id: "c1", rating_global: 2 }),
      makeEntry({ id: "e3", coffee_id: "c2", rating_global: 5 }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    expect(result.current.totalCoffees).toBe(2);
    expect(result.current.avgRating).toBeCloseTo((4 + 2 + 5) / 3);
  });

  it("buckets rating distribution to the nearest half point", () => {
    const entries = [
      makeEntry({ id: "e1", rating_global: 4.3 }),
      makeEntry({ id: "e2", rating_global: 4.4 }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    const bucket = result.current.ratingDistribution.find((b) => b.rating === "4.5");
    expect(bucket?.count).toBe(2);
  });

  it("computes sub-rating averages only from non-null values", () => {
    const entries = [
      makeEntry({ id: "e1", rating_aroma: 8 }),
      makeEntry({ id: "e2", rating_aroma: null }),
      makeEntry({ id: "e3", rating_aroma: 6 }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    const aroma = result.current.subRatingAverages.find((s) => s.subject === "Aroma");
    expect(aroma?.value).toBe(7);
  });

  it("counts a coffee in the flavor family radar if it has any matching tag", () => {
    const entries = [
      makeEntry({ id: "e1", flavor_tags: ["chocolate"] }),
      makeEntry({ id: "e2", flavor_tags: ["citrus"] }),
    ];
    const { result } = renderHook(() => useDashboardStats(entries));
    const choco = result.current.flavorFamilyData.find((f) => f.subject === "Choco");
    expect(choco?.count).toBe(1);
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test -- use-dashboard-stats`
Expected: PASS — 5 tests. This exercises existing, unmodified logic in `use-dashboard-stats.ts`; no implementation changes needed. If `FLAVOR_TAGS`/`FLAVOR_FAMILIES` import fails, check `@/types/coffee` exports those two consts (it does, per `coffee-form.tsx`'s import).

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/use-dashboard-stats.test.ts
git commit -m "test: cover useDashboardStats computation logic"
```

---

## Task 4: `coffeeFormSchema` validation unit tests

**Files:**
- Test: `src/lib/validations/coffee.test.ts`

**Interfaces:**
- Consumes: `coffeeFormSchema` (Zod schema) from `src/lib/validations/coffee.ts`.

- [ ] **Step 1: Write the tests**

Create `src/lib/validations/coffee.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { coffeeFormSchema } from "./coffee";

const validBase = {
  name: "Yirgacheffe",
  brand: "Stumptown",
  type: "bean" as const,
  rating_global: 4,
};

describe("coffeeFormSchema", () => {
  it("accepts the minimal valid payload", () => {
    const result = coffeeFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.flavor_tags).toEqual([]);
      expect(result.data.visibility).toBe("public");
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing brand", () => {
    const { brand, ...rest } = validBase;
    const result = coffeeFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects rating_global below 0.5", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_global: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating_global above 5", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_global: 5.5 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer sub-rating", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_aroma: 7.5 });
    expect(result.success).toBe(false);
  });

  it("accepts a null sub-rating", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, rating_aroma: null });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown flavor tag", () => {
    const result = coffeeFormSchema.safeParse({
      ...validBase,
      flavor_tags: ["not-a-real-tag"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown coffee type", () => {
    const result = coffeeFormSchema.safeParse({ ...validBase, type: "liquid" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test -- coffee.test`
Expected: PASS — 9 tests.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/coffee.test.ts
git commit -m "test: cover coffeeFormSchema validation edge cases"
```

---

## Task 5: `lib/actions/coffee.ts` auth-guard unit tests

**Files:**
- Test: `src/lib/actions/coffee.test.ts`

**Interfaces:**
- Consumes: `createCoffeeEntry`, `updateCoffeeEntry`, `deleteCoffeeEntry` from `src/lib/actions/coffee.ts`; mocks `createServerSupabaseClient` from `@/lib/supabase/server` and `revalidatePath` from `next/cache`.
- This is the exact test the spec calls out as motivation — the react-doctor audit flagged these functions as suspected-missing-auth-guard false positives; this test proves the guard exists and stays proven on every future change.

- [ ] **Step 1: Write the tests**

Create `src/lib/actions/coffee.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

import { createCoffeeEntry, updateCoffeeEntry, deleteCoffeeEntry } from "./coffee";

const validInput = {
  name: "Yirgacheffe",
  brand: "Stumptown",
  type: "bean" as const,
  rating_global: 4,
  flavor_tags: [] as const,
  visibility: "public" as const,
};

beforeEach(() => {
  mockFrom.mockReset();
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: null } });
});

describe("createCoffeeEntry — auth guard", () => {
  it("returns 'No autenticado' and never queries the database when unauthenticated", async () => {
    const result = await createCoffeeEntry(validInput);
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("updateCoffeeEntry — auth guard", () => {
  it("returns 'No autenticado' and never queries the database when unauthenticated", async () => {
    const result = await updateCoffeeEntry("entry-1", validInput);
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("deleteCoffeeEntry — auth guard", () => {
  it("returns 'No autenticado' and never queries the database when unauthenticated", async () => {
    const result = await deleteCoffeeEntry("entry-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("updateCoffeeEntry — ownership guard", () => {
  it("returns 'No autorizado' when the entry belongs to a different user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    const single = vi.fn().mockResolvedValue({
      data: { id: "entry-1", user_id: "user-b" },
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await updateCoffeeEntry("entry-1", validInput);
    expect(result).toEqual({ error: "No autorizado" });
  });
});

describe("deleteCoffeeEntry — ownership guard", () => {
  it("returns 'No autorizado' when the entry belongs to a different user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    const single = vi.fn().mockResolvedValue({
      data: { id: "entry-1", user_id: "user-b" },
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await deleteCoffeeEntry("entry-1");
    expect(result).toEqual({ error: "No autorizado" });
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test -- lib/actions/coffee.test`
Expected: PASS — 5 tests. This asserts real, existing behavior in `src/lib/actions/coffee.ts` (each function's `if (!user) return { error: "No autenticado" };` guard, and the ownership check in `updateCoffeeEntry`/`deleteCoffeeEntry`). No production code changes.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/coffee.test.ts
git commit -m "test: prove auth and ownership guards on coffee server actions"
```

---

## Task 6: `lib/actions/social.ts` auth-guard unit tests

**Files:**
- Test: `src/lib/actions/social.test.ts`

**Interfaces:**
- Consumes: `followUser`, `unfollowUser`, `updateProfile`, `likeEntry`, `unlikeEntry` from `src/lib/actions/social.ts`; same `@/lib/supabase/server` / `next/cache` mocking pattern as Task 5.

- [ ] **Step 1: Write the tests**

Create `src/lib/actions/social.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

import {
  followUser,
  unfollowUser,
  updateProfile,
  likeEntry,
  unlikeEntry,
} from "./social";

beforeEach(() => {
  mockFrom.mockReset();
  mockGetUser.mockReset();
  mockGetUser.mockResolvedValue({ data: { user: null } });
});

describe("unauthenticated guard", () => {
  it("followUser returns 'No autenticado' and never queries the database", async () => {
    const result = await followUser("target-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("unfollowUser returns 'No autenticado' and never queries the database", async () => {
    const result = await unfollowUser("target-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("updateProfile returns 'No autenticado' and never queries the database", async () => {
    const result = await updateProfile({
      display_name: "Test",
      username: "testuser",
    });
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("likeEntry returns 'No autenticado' and never queries the database", async () => {
    const result = await likeEntry("entry-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("unlikeEntry returns 'No autenticado' and never queries the database", async () => {
    const result = await unlikeEntry("entry-1");
    expect(result).toEqual({ error: "No autenticado" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("followUser — self-follow guard", () => {
  it("rejects following yourself before touching the database", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-a" } } });
    const result = await followUser("user-a");
    expect(result).toEqual({ error: "No puedes seguirte a ti mismo" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test -- lib/actions/social.test`
Expected: PASS — 6 tests. Asserts existing behavior; no production code changes.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/social.test.ts
git commit -m "test: prove auth and self-follow guards on social server actions"
```

---

## Task 7: `RatingCups` interaction unit tests

**Files:**
- Test: `src/components/coffee/rating-cups.test.tsx`

**Interfaces:**
- Consumes: `RatingCups` from `src/components/coffee/rating-cups.tsx` — props `value`, `onChange`, `max`, `readOnly`. Renders `role="slider"` with `aria-label="Rating: {value} de {max} tazas"`, `aria-valuenow`, keyboard handling for ArrowRight/ArrowLeft/ArrowUp/ArrowDown/Home/End.

- [ ] **Step 1: Write the tests**

Create `src/components/coffee/rating-cups.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingCups } from "./rating-cups";

describe("RatingCups", () => {
  it("renders the current value in the accessible label", () => {
    render(<RatingCups value={3.5} max={5} />);
    expect(
      screen.getByRole("slider", { name: "Rating: 3.5 de 5 tazas" })
    ).toBeInTheDocument();
  });

  it("increases by 0.5 on ArrowRight", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={3} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it("decreases by 0.5 on ArrowLeft, floored at 0.5", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={0.5} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it("jumps to max on End", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={2} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("jumps to 0.5 on Home", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={4} max={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it("does not call onChange when readOnly", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RatingCups value={3} max={5} readOnly onChange={onChange} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("tabIndex", "-1");
    await user.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test -- rating-cups`
Expected: PASS — 6 tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/coffee/rating-cups.test.tsx
git commit -m "test: cover RatingCups keyboard interaction"
```

---

## Task 8: `SearchModal` interaction unit tests

**Files:**
- Test: `src/app/(main)/_components/search-modal.test.tsx`

**Interfaces:**
- Consumes: `SearchModal` from `search-modal.tsx` — props `open`, `onClose`, `userId`. Mocks `useCoffeeEntries` from `@/lib/hooks` and `useRouter` from `next/navigation` (both are the modal's only external dependencies besides `lucide-react` icons, which render fine unmocked).

- [ ] **Step 1: Write the tests**

Create `src/app/(main)/_components/search-modal.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchModal } from "./search-modal";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockEntries = [
  { id: "e1", rating_global: 4.5, coffee: { name: "Yirgacheffe", brand: "Stumptown" } },
  { id: "e2", rating_global: 3.0, coffee: { name: "Kopi Luwak", brand: "Lavazza" } },
  { id: "e3", rating_global: 5.0, coffee: { name: "Yirga Blend", brand: "Blue Bottle" } },
];

vi.mock("@/lib/hooks", () => ({
  useCoffeeEntries: () => ({ data: mockEntries }),
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe("SearchModal", () => {
  it("renders nothing when closed", () => {
    render(<SearchModal open={false} onClose={vi.fn()} userId="user-1" />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters results by coffee name as the user types", async () => {
    const user = userEvent.setup();
    render(<SearchModal open onClose={vi.fn()} userId="user-1" />);
    const input = screen.getByLabelText("Buscar por café o marca");
    await user.type(input, "yirga");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByText("Yirgacheffe")).toBeInTheDocument();
    expect(screen.getByText("Yirga Blend")).toBeInTheDocument();
    expect(screen.queryByText("Kopi Luwak")).not.toBeInTheDocument();
  });

  it("filters results by brand as the user types", async () => {
    const user = userEvent.setup();
    render(<SearchModal open onClose={vi.fn()} userId="user-1" />);
    const input = screen.getByLabelText("Buscar por café o marca");
    await user.type(input, "lavazza");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("Kopi Luwak")).toBeInTheDocument();
  });

  it("navigates to the entry and closes on click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SearchModal open onClose={onClose} userId="user-1" />);
    await user.click(screen.getByText("Kopi Luwak"));
    expect(mockPush).toHaveBeenCalledWith("/coffee/e2");
    expect(onClose).toHaveBeenCalled();
  });

  it("navigates to the active entry on Enter", async () => {
    const user = userEvent.setup();
    render(<SearchModal open onClose={vi.fn()} userId="user-1" />);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(mockPush).toHaveBeenCalledWith("/coffee/e2");
  });

  it("calls onClose on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SearchModal open onClose={onClose} userId="user-1" />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test -- search-modal`
Expected: PASS — 6 tests. Note the ArrowDown-then-Enter test relies on `activeIndex` starting at 0 (pointing at `mockEntries[0]`, "Yirgacheffe") and ArrowDown moving it to index 1 (`mockEntries[1]`, "Kopi Luwak" → `/coffee/e2`) — matches the component's own `useEffect`-driven keydown listener, no mocking needed there since it's plain DOM `keydown`, not a synthetic React handler.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(main)/_components/search-modal.test.tsx"
git commit -m "test: cover SearchModal filtering and keyboard navigation"
```

---

## Task 9: `CoffeeForm` step-gating unit tests

**Files:**
- Test: `src/components/coffee/coffee-form.test.tsx`

**Interfaces:**
- Consumes: `CoffeeForm` from `coffee-form.tsx`. Mocks `@/lib/hooks` (`useCreateCoffeeEntry`, `useUpdateCoffeeEntry`, `useCurrentUser` — the only three the component imports from there) and `next/navigation`'s `useRouter`. Does **not** mock `@/lib/supabase/storage` — it's only called inside `onSubmit`, which these tests never trigger (they stop at step-gating, never submit).

- [ ] **Step 1: Write the tests**

Create `src/components/coffee/coffee-form.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoffeeForm } from "./coffee-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/hooks", () => ({
  useCreateCoffeeEntry: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCoffeeEntry: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCurrentUser: () => ({ data: null }),
}));

describe("CoffeeForm step gating", () => {
  it("starts on step 1 of 5", () => {
    render(<CoffeeForm />);
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
  });

  it("blocks advancing past step 1 when name/brand are empty", async () => {
    const user = userEvent.setup();
    render(<CoffeeForm />);
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
    expect(await screen.findByText("Mínimo 2 caracteres")).toBeInTheDocument();
  });

  it("advances to step 2 once name/brand/type are valid", async () => {
    const user = userEvent.setup();
    render(<CoffeeForm />);
    await user.type(screen.getByLabelText("Nombre del café *"), "Yirgacheffe");
    await user.type(screen.getByLabelText("Marca *"), "Stumptown");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();
  });

  it("starts on step 2 when a coffee is preselected", () => {
    render(
      <CoffeeForm
        preselectedCoffee={{
          id: "c1",
          name: "Yirgacheffe",
          brand: "Stumptown",
          type: "bean",
          origin: null,
          roast_level: null,
          image_url: null,
          avg_rating: 4,
          total_reviews: 1,
          created_by: "user-1",
          created_at: new Date().toISOString(),
        }}
      />
    );
    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();
  });

  it("goes back a step on Atrás", async () => {
    const user = userEvent.setup();
    render(<CoffeeForm />);
    await user.type(screen.getByLabelText("Nombre del café *"), "Yirgacheffe");
    await user.type(screen.getByLabelText("Marca *"), "Stumptown");
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Atrás" }));
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test -- coffee-form`
Expected: PASS — 5 tests. If step 1's `name`/`brand` labels don't match via `getByLabelText`, confirm the `htmlFor`/`id` pairing added during the react-doctor a11y pass (commit `8f94129`) is still `id="name"`/`id="brand"` — it is, per that commit.

- [ ] **Step 3: Commit**

```bash
git add src/components/coffee/coffee-form.test.tsx
git commit -m "test: cover CoffeeForm step-gating validation"
```

---

## Task 10: Seed script + E2E helpers (users, cleanup)

**Files:**
- Create: `scripts/seed-test-db.ts`
- Create: `tests/e2e/helpers/admin-client.ts`
- Create: `tests/e2e/helpers/create-test-user.ts`
- Create: `tests/e2e/helpers/auth.ts`
- Modify: `package.json` (`scripts.seed:test`, add `tsx` devDependency to run the `.ts` seed script directly)

**Interfaces:**
- Produces: `getAdminClient(): SupabaseClient<Database>` (service-role client, used only in `tests/e2e/**` and `scripts/**`, never in app code). `createTestUser(prefix: string): Promise<{ id: string; email: string; password: string; username: string }>` — creates a pre-confirmed auth user + matching `public.users` row with a unique suffix. `loginAs(page: Page, email: string, password: string): Promise<void>` — drives the real login UI. `deleteTestUser(userId: string): Promise<void>` — service-role cascade delete (schema's `on delete cascade` from `auth.users` handles `public.users`, `coffee_entries`, `collections`, `follows`).

- [ ] **Step 1: Install `tsx`**

```bash
npm install -D tsx
```

- [ ] **Step 2: Create `tests/e2e/helpers/admin-client.ts`**

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (load .env.test first)"
    );
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 3: Create `tests/e2e/helpers/create-test-user.ts`**

```ts
import { getAdminClient } from "./admin-client";

export interface TestUser {
  id: string;
  email: string;
  password: string;
  username: string;
  displayName: string;
}

const PASSWORD = "TestPassword123!";

// `prefix` becomes part of the username, which the DB constrains to
// `^[a-z0-9_]+$` (see supabase/schema.sql) — use only lowercase letters,
// digits, and underscores, never hyphens.
export async function createTestUser(prefix: string): Promise<TestUser> {
  const admin = getAdminClient();
  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `${prefix}-${suffix}@cupping-e2e.test`;
  const username = `${prefix}_${suffix}`.toLowerCase();
  const displayName = `E2E ${prefix} ${suffix}`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`createTestUser failed: ${error?.message}`);
  }

  const { error: profileError } = await admin
    .from("users")
    .insert({ id: data.user.id, username, display_name: displayName });
  if (profileError) {
    throw new Error(`createTestUser profile insert failed: ${profileError.message}`);
  }

  return { id: data.user.id, email, password: PASSWORD, username, displayName };
}

export async function deleteTestUser(userId: string): Promise<void> {
  const admin = getAdminClient();
  await admin.auth.admin.deleteUser(userId);
}
```

- [ ] **Step 4: Create `tests/e2e/helpers/auth.ts`**

```ts
import { type Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("tu@email.com").fill(email);
  await page.getByPlaceholder("Contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  // login-form.tsx does a full `window.location.href` navigation on success
  // (so middleware re-reads the fresh Supabase cookie) — waitForURL covers it.
  await page.waitForURL("/dashboard");
}
```

- [ ] **Step 5: Create `scripts/seed-test-db.ts`**

```ts
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.test" });

import { getAdminClient } from "../tests/e2e/helpers/admin-client";

const BASELINE_COFFEES = [
  { name: "Yirgacheffe", brand: "Stumptown", type: "bean" as const, origin: "Ethiopia", roast_level: "light" as const },
  { name: "Colombia Supremo", brand: "Lavazza", type: "ground" as const, origin: "Colombia", roast_level: "medium" as const },
];

async function main() {
  const admin = getAdminClient();

  for (const coffee of BASELINE_COFFEES) {
    const { data: existing } = await admin
      .from("coffees")
      .select("id")
      .ilike("name", coffee.name)
      .ilike("brand", coffee.brand)
      .eq("type", coffee.type)
      .maybeSingle();

    if (existing) {
      console.log(`skip (exists): ${coffee.brand} ${coffee.name}`);
      continue;
    }

    const { error } = await admin.from("coffees").insert(coffee);
    if (error) {
      console.error(`failed to seed ${coffee.brand} ${coffee.name}:`, error.message);
      process.exitCode = 1;
      continue;
    }
    console.log(`seeded: ${coffee.brand} ${coffee.name}`);
  }
}

main();
```

- [ ] **Step 6: Add npm script**

```json
"seed:test": "tsx scripts/seed-test-db.ts"
```

- [ ] **Step 7: Run the seed script, verify idempotency**

Run: `npm run seed:test`
Expected: two lines starting with `seeded:`.

Run: `npm run seed:test` again.
Expected: two lines starting with `skip (exists):` — proves idempotency (spec: Success criteria).

- [ ] **Step 8: Commit**

```bash
git add scripts/seed-test-db.ts tests/e2e/helpers/admin-client.ts tests/e2e/helpers/create-test-user.ts tests/e2e/helpers/auth.ts package.json package-lock.json
git commit -m "test: add E2E seed script, admin client, and auth helpers"
```

---

## Task 11: Auth + entry-visibility E2E suite

**Files:**
- Create: `tests/e2e/auth-visibility.spec.ts`

**Interfaces:**
- Consumes: `createTestUser`, `deleteTestUser` from `tests/e2e/helpers/create-test-user.ts`; `loginAs` from `tests/e2e/helpers/auth.ts`; `getAdminClient` from `tests/e2e/helpers/admin-client.ts`.
- This suite is the highest-priority one per the spec — it's the direct automated replacement for the manual re-read that caught the react-doctor false positives.

- [ ] **Step 1: Write the suite**

Create `tests/e2e/auth-visibility.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, type TestUser } from "./helpers/create-test-user";
import { loginAs } from "./helpers/auth";
import { getAdminClient } from "./helpers/admin-client";

test.describe("Auth", () => {
  test("signup shows the email-confirmation success message", async ({ page }) => {
    const suffix = crypto.randomUUID().slice(0, 8);
    const email = `signup-${suffix}@cupping-e2e.test`;

    await page.goto("/login");
    await page.getByRole("button", { name: "¿No tienes cuenta? Crear cuenta" }).click();
    await page.getByPlaceholder("tu@email.com").fill(email);
    await page.getByPlaceholder("Contraseña").fill("TestPassword123!");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(
      page.getByText("Revisa tu email para confirmar tu cuenta.")
    ).toBeVisible();

    // Clean up the auth user Supabase created even though it's unconfirmed.
    const admin = getAdminClient();
    const { data } = await admin.auth.admin.listUsers();
    const created = data.users.find((u) => u.email === email);
    if (created) await admin.auth.admin.deleteUser(created.id);
  });

  test("rejects an incorrect password with a Spanish error message", async ({ page }) => {
    const user = await createTestUser("badpw");
    try {
      await page.goto("/login");
      await page.getByPlaceholder("tu@email.com").fill(user.email);
      await page.getByPlaceholder("Contraseña").fill("WrongPassword999!");
      await page.getByRole("button", { name: "Iniciar sesión" }).click();
      await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("logs in, then logs out back to the login screen", async ({ page }) => {
    const user = await createTestUser("loginlogout");
    try {
      await loginAs(page, user.email, user.password);
      await page.getByRole("button", { name: `Menú de ${user.displayName}` }).click();
      await page.getByRole("menuitem", { name: /Cerrar sesión/ }).click();
      await page.waitForURL("/login");
    } finally {
      await deleteTestUser(user.id);
    }
  });
});

test.describe("Entry visibility (RLS)", () => {
  let owner: TestUser;
  let viewer: TestUser;
  let entryId: string;

  test.beforeAll(async () => {
    owner = await createTestUser("visowner");
    viewer = await createTestUser("visviewer");

    const admin = getAdminClient();
    const { data: coffee, error: coffeeError } = await admin
      .from("coffees")
      .insert({ name: "Private Blend", brand: "E2E Test", type: "bean", created_by: owner.id })
      .select("id")
      .single();
    if (coffeeError || !coffee) throw new Error(`setup failed: ${coffeeError?.message}`);

    const { data: entry, error: entryError } = await admin
      .from("coffee_entries")
      .insert({
        user_id: owner.id,
        coffee_id: coffee.id,
        rating_global: 4.5,
        visibility: "private",
      })
      .select("id")
      .single();
    if (entryError || !entry) throw new Error(`setup failed: ${entryError?.message}`);
    entryId = entry.id;

    await admin.from("follows").insert({ follower_id: viewer.id, following_id: owner.id });
  });

  test.afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(viewer.id);
  });

  test("a private entry does not appear on the owner's public profile to another user", async ({ page }) => {
    await loginAs(page, viewer.email, viewer.password);
    await page.goto(`/profile/${owner.username}`);
    await expect(page.getByText("Private Blend")).toHaveCount(0);
  });

  test("a private entry does not appear in a follower's activity feed", async ({ page }) => {
    await loginAs(page, viewer.email, viewer.password);
    await page.goto("/dashboard");
    await expect(page.getByText("Private Blend")).toHaveCount(0);
  });

  test("a private entry is directly fetchable by its owner but not by another user", async ({ page }) => {
    await loginAs(page, owner.email, owner.password);
    await page.goto(`/coffee/${entryId}`);
    await expect(page.getByText("Private Blend")).toBeVisible();

    await page.getByRole("button", { name: `Menú de ${owner.displayName}` }).click();
    await page.getByRole("menuitem", { name: /Cerrar sesión/ }).click();
    await page.waitForURL("/login");

    await loginAs(page, viewer.email, viewer.password);
    await page.goto(`/coffee/${entryId}`);
    await expect(page.getByText("Private Blend")).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test:e2e -- auth-visibility`
Expected: PASS — 6 tests. If the "directly fetchable" test's final assertion fails (private entry still visible to a non-owner), that is a **real RLS regression** in the `20260622_entry_visibility.sql` policy on the test project, not a test bug — stop and re-verify that migration was applied in Task 2 Step 2 before touching this test.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/auth-visibility.spec.ts
git commit -m "test: add E2E suite for auth flows and RLS entry visibility"
```

---

## Task 12: Coffee CRUD E2E suite

**Files:**
- Create: `tests/e2e/coffee-crud.spec.ts`

**Interfaces:**
- Consumes: same helpers as Task 11. Drives the real 5-step `CoffeeForm` wizard via `/coffee/new`.

- [ ] **Step 1: Write the suite**

Create `tests/e2e/coffee-crud.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, type TestUser } from "./helpers/create-test-user";
import { loginAs } from "./helpers/auth";

test.describe("Coffee CRUD", () => {
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createTestUser("crud");
  });

  test.afterAll(async () => {
    await deleteTestUser(user.id);
  });

  test("creates a review through the 5-step wizard, then edits it, then deletes it", async ({ page }) => {
    const coffeeName = `E2E Coffee ${crypto.randomUUID().slice(0, 8)}`;

    await loginAs(page, user.email, user.password);
    await page.goto("/coffee/new");

    // Step 1: info
    await expect(page.getByText("Paso 1 de 5")).toBeVisible();
    await page.getByLabel("Nombre del café *").fill(coffeeName);
    await page.getByLabel("Marca *").fill("E2E Brand");
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 2: rating
    await expect(page.getByText("Paso 2 de 5")).toBeVisible();
    await page.getByRole("slider", { name: /Rating:/ }).focus();
    await page.keyboard.press("ArrowUp");
    await page.getByLabel("Notas de cata").fill("Bright and floral.");
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 3: flavors + brew method
    await expect(page.getByText("Paso 3 de 5")).toBeVisible();
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 4: photo (skip)
    await expect(page.getByText("Paso 4 de 5")).toBeVisible();
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 5: collection (skip) + submit
    await expect(page.getByText("Paso 5 de 5")).toBeVisible();
    await page.getByRole("button", { name: "Guardar reseña" }).click();

    await page.waitForURL(/\/coffee\/[0-9a-f-]+$/);
    await expect(page.getByText(coffeeName)).toBeVisible();
    await expect(page.getByText("Bright and floral.")).toBeVisible();

    const entryUrl = page.url();

    // Edit
    await page.getByRole("button", { name: "Editar" }).click();
    await page.waitForURL(/\/coffee\/[0-9a-f-]+\/edit$/);
    await page.getByLabel("Notas de cata").fill("Updated tasting notes.");
    // Jump straight to the last step to submit (edit mode pre-fills all fields).
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Siguiente" }).click();
    }
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.waitForURL(entryUrl);
    await expect(page.getByText("Updated tasting notes.")).toBeVisible();

    // Delete
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Eliminar" }).click();
    await page.waitForURL("/dashboard");
    await page.goto(entryUrl);
    await expect(page.getByText(coffeeName)).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test:e2e -- coffee-crud`
Expected: PASS — 1 test covering create → verify → edit → verify → delete → verify-gone. The `page.once("dialog", ...)` handles `EntryActions`'s native `confirm()` call — Playwright auto-dismisses dialogs by default, which would otherwise make "Eliminar" appear to do nothing.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/coffee-crud.spec.ts
git commit -m "test: add E2E suite for coffee entry create/edit/delete"
```

---

## Task 13: Social E2E suite

**Files:**
- Create: `tests/e2e/social.spec.ts`

**Interfaces:**
- Consumes: same helpers as Task 11.

- [ ] **Step 1: Write the suite**

Create `tests/e2e/social.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, type TestUser } from "./helpers/create-test-user";
import { loginAs } from "./helpers/auth";
import { getAdminClient } from "./helpers/admin-client";

test.describe("Social", () => {
  let a: TestUser;
  let b: TestUser;

  test.beforeAll(async () => {
    a = await createTestUser("social_a");
    b = await createTestUser("social_b");
  });

  test.afterAll(async () => {
    await deleteTestUser(a.id);
    await deleteTestUser(b.id);
  });

  test("A follows B, B's follower count updates, then A unfollows", async ({ page }) => {
    await loginAs(page, a.email, a.password);
    await page.goto(`/profile/${b.username}`);

    await page.getByRole("button", { name: "Seguir" }).click();
    await expect(page.getByRole("button", { name: "Siguiendo" })).toBeVisible();

    await page.goto(`/profile/${b.username}/followers`);
    await expect(page.getByText(a.displayName)).toBeVisible();

    await page.goto(`/profile/${b.username}`);
    await page.getByRole("button", { name: "Siguiendo" }).click();
    await expect(page.getByRole("button", { name: "Seguir" })).toBeVisible();
  });

  test("B's new public entry appears in A's activity feed once A follows B, and B can like it", async ({ page }) => {
    const admin = getAdminClient();
    await admin.from("follows").insert({ follower_id: a.id, following_id: b.id });

    const { data: coffee } = await admin
      .from("coffees")
      .insert({ name: "Social Feed Coffee", brand: "E2E Test", type: "bean", created_by: b.id })
      .select("id")
      .single();
    await admin.from("coffee_entries").insert({
      user_id: b.id,
      coffee_id: coffee!.id,
      rating_global: 4,
      visibility: "public",
    });

    await loginAs(page, a.email, a.password);
    await page.goto("/dashboard");
    // "Social Feed Coffee" renders twice in the activity card (the "reseñó
    // X" line and the card title) — .first() avoids a strict-mode violation.
    await expect(page.getByText("Social Feed Coffee").first()).toBeVisible();

    const likeButton = page.getByRole("button", { name: "Me gusta" }).first();
    await likeButton.click();
    await expect(page.getByRole("button", { name: "Quitar me gusta" }).first()).toBeVisible();
  });
});
```

- [ ] **Step 2: Run it, verify pass**

Run: `npm run test:e2e -- social`
Expected: PASS — 2 tests.

- [ ] **Step 3: Run the full suite end to end**

Run: `npm run test && npm run test:e2e`
Expected: all unit tests (Tasks 1, 3–9) and all E2E tests (Tasks 2, 11–13) PASS in one clean run — this is the spec's Success Criteria in full.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/social.spec.ts
git commit -m "test: add E2E suite for follow/unfollow, activity feed, and likes"
```

---

## Post-plan note

Two spec non-goals remain deliberately untouched by this plan and are queued as the user's next hardening sub-projects: CI/GitHub Actions wiring (to run `npm run test` and `npm run test:e2e` on every push/PR), and the tech-debt / RLS-security-audit sub-projects. Each gets its own brainstorm → spec → plan cycle when the user is ready to start it.
