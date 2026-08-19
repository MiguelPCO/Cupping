import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function getAdminClient() {
  // Read fresh from process.env (not cached) so a run using a misconfigured
  // or shell-overridden env fails here instead of silently hitting the
  // wrong Supabase project.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (load .env.test first)"
    );
  }
  // Structural sanity check: catches an empty/garbage/non-Supabase URL
  // reaching here (e.g. .env.test failed to load and a stray shell var
  // took over) without hardcoding the actual test project's ref into
  // source. This is intentionally shape-only, not an allowlist of a
  // specific project, per .env.test.example's "never point this at prod"
  // contract — the developer is responsible for .env.test itself pointing
  // at the dedicated test project.
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL ("${url}") does not look like a Supabase project URL. ` +
        "Refusing to run admin/E2E operations against it — verify .env.test is present " +
        "and loaded with override: true, and that it points at the dedicated test project."
    );
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
