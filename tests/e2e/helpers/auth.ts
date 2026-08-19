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
