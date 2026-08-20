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
// `^[a-z0-9_]+$` (defined in the Supabase Cloud test project's schema,
// not a file committed to this repo) — use only lowercase letters,
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
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`deleteTestUser failed for ${userId}: ${error.message}`);
  }
}
