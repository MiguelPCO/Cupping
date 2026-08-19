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
  let coffeeId: string;

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
    coffeeId = coffee.id;

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

  // Rows inserted directly via the admin client in beforeAll (coffee_entries,
  // coffees, follows) are FK-referenced by the owner/viewer auth users and
  // must be removed before deleteTestUser, or the auth.users delete fails
  // with a foreign-key violation and both users leak. Delete in dependency
  // order: entries -> follows -> coffee -> users. Guard each step so a
  // partially-failed beforeAll doesn't throw here and skip later cleanup;
  // log (don't throw on) child-row delete errors so they're diagnosable
  // instead of only surfacing as a downstream FK violation; run the two
  // user deletes via allSettled so one throwing can't strand the other.
  test.afterAll(async () => {
    const admin = getAdminClient();
    if (entryId) {
      const { error } = await admin.from("coffee_entries").delete().eq("id", entryId);
      if (error) console.error(`cleanup: coffee_entries delete failed: ${error.message}`);
    }
    if (owner && viewer) {
      const { error } = await admin
        .from("follows")
        .delete()
        .eq("follower_id", viewer.id)
        .eq("following_id", owner.id);
      if (error) console.error(`cleanup: follows delete failed: ${error.message}`);
    }
    if (coffeeId) {
      const { error } = await admin.from("coffees").delete().eq("id", coffeeId);
      if (error) console.error(`cleanup: coffees delete failed: ${error.message}`);
    }
    const results = await Promise.allSettled([
      owner ? deleteTestUser(owner.id) : Promise.resolve(),
      viewer ? deleteTestUser(viewer.id) : Promise.resolve(),
    ]);
    for (const result of results) {
      if (result.status === "rejected") console.error(`cleanup: ${result.reason}`);
    }
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
