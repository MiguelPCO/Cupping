import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "recovery"
    | "email"
    | null;

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  let userId: string | null = null;

  // PKCE flow (OAuth + email signup confirmation)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    userId = data.user.id;
  }
  // OTP / token_hash flow (magic link, email change, etc.)
  else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
    userId = data.user.id;
  } else {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Ensure user profile exists (first-time login for any provider)
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingProfile) {
    const { data: authUser } = await supabase.auth.getUser();
    const user = authUser.user;

    if (user) {
      const rawUsername =
        (user.user_metadata?.user_name as string | undefined) ??
        user.email?.split("@")[0] ??
        `user${Date.now()}`;

      const username = rawUsername
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 30);

      const displayName =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        username;

      const avatarUrl =
        (user.user_metadata?.avatar_url as string | undefined) ?? null;

      // Trigger on_user_created auto-creates 4 default collections
      await supabase.from("users").insert({
        id: user.id,
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
      });
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
