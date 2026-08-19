import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, type TestUser } from "./helpers/create-test-user";
import { loginAs } from "./helpers/auth";
import { getAdminClient } from "./helpers/admin-client";

test.describe("Coffee CRUD", () => {
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createTestUser("crud");
  });

  test.afterAll(async () => {
    // The UI only ever deletes the coffee_entries row (see EntryActions /
    // deleteCoffeeEntry) — it never removes the underlying `coffees` catalog
    // row, whose `created_by` also FK-references this user. And if the test
    // fails before reaching the delete step, the entry row survives too.
    // Clean up both first so deleteTestUser's auth.users delete doesn't hit
    // an FK violation and strand the test user (same pattern as
    // auth-visibility.spec.ts's afterAll). Log rather than throw so a
    // partial failure here doesn't skip the user cleanup below.
    const admin = getAdminClient();
    const { error: entriesError } = await admin
      .from("coffee_entries")
      .delete()
      .eq("user_id", user.id);
    if (entriesError) {
      console.error(`cleanup: coffee_entries delete failed: ${entriesError.message}`);
    }
    const { error: coffeesError } = await admin
      .from("coffees")
      .delete()
      .eq("created_by", user.id);
    if (coffeesError) {
      console.error(`cleanup: coffees delete failed: ${coffeesError.message}`);
    }
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
    // Use the heading role, not getByText — the route announcer live-region
    // also contains the page title ("{name} — CUPPING"), which includes the
    // coffee name and would otherwise make getByText match two elements.
    await expect(page.getByRole("heading", { name: coffeeName })).toBeVisible();
    await expect(page.getByText("Bright and floral.")).toBeVisible();

    const entryUrl = page.url();

    // Edit — edit mode starts back at step 1 (defaultValues are pre-filled,
    // but there's no preselectedCoffee so initialStep is 1, not 2). "Notas
    // de cata" lives on step 2, so advance one step before filling it, then
    // three more to reach step 5.
    await page.getByRole("button", { name: "Editar" }).click();
    await page.waitForURL(/\/coffee\/[0-9a-f-]+\/edit$/);
    await expect(page.getByText("Paso 1 de 5")).toBeVisible();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByText("Paso 2 de 5")).toBeVisible();
    await page.getByLabel("Notas de cata").fill("Updated tasting notes.");
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Siguiente" }).click();
    }
    await expect(page.getByText("Paso 5 de 5")).toBeVisible();
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
