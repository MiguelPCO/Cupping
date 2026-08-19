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

  // Test 1 follows/unfollows B through the UI, which leaves no `follows` row
  // behind on success — but if it fails partway (e.g. after the follow
  // click, before the unfollow click), the row would survive. Test 2 also
  // admin-inserts a `follows` row plus a `coffees` / `coffee_entries` pair
  // for B, and clicking the like button inserts an `entry_likes` row
  // referencing A and the entry — all FK-referencing these two users. Clean
  // up in dependency order (entry_likes before coffee_entries, since it
  // references the entry; coffee_entries before coffees) before
  // deleteTestUser, or the auth.users delete throws with an FK violation
  // and strands both users (same pattern as auth-visibility.spec.ts /
  // coffee-crud.spec.ts).
  test.afterAll(async () => {
    const admin = getAdminClient();

    const { error: likesError } = await admin
      .from("entry_likes")
      .delete()
      .in("user_id", [a.id, b.id]);
    if (likesError) {
      console.error(`cleanup: entry_likes delete failed: ${likesError.message}`);
    }

    const { error: entriesError } = await admin
      .from("coffee_entries")
      .delete()
      .eq("user_id", b.id);
    if (entriesError) {
      console.error(`cleanup: coffee_entries delete failed: ${entriesError.message}`);
    }

    const { error: coffeesError } = await admin
      .from("coffees")
      .delete()
      .eq("created_by", b.id);
    if (coffeesError) {
      console.error(`cleanup: coffees delete failed: ${coffeesError.message}`);
    }

    const { error: followsError } = await admin
      .from("follows")
      .delete()
      .eq("follower_id", a.id)
      .eq("following_id", b.id);
    if (followsError) {
      console.error(`cleanup: follows delete failed: ${followsError.message}`);
    }

    const results = await Promise.allSettled([deleteTestUser(a.id), deleteTestUser(b.id)]);
    for (const result of results) {
      if (result.status === "rejected") console.error(`cleanup: ${result.reason}`);
    }
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
    const { error: followError } = await admin
      .from("follows")
      .insert({ follower_id: a.id, following_id: b.id });
    if (followError) throw new Error(`setup failed: ${followError.message}`);

    const { data: coffee, error: coffeeError } = await admin
      .from("coffees")
      .insert({ name: "Social Feed Coffee", brand: "E2E Test", type: "bean", created_by: b.id })
      .select("id")
      .single();
    if (coffeeError || !coffee) throw new Error(`setup failed: ${coffeeError?.message}`);

    const { error: entryError } = await admin.from("coffee_entries").insert({
      user_id: b.id,
      coffee_id: coffee.id,
      rating_global: 4,
      visibility: "public",
    });
    if (entryError) throw new Error(`setup failed: ${entryError.message}`);

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
