import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { QueryProvider } from "./_components/query-provider";
import { Header } from "./_components/header";
import { MobileBottomNav } from "./_components/mobile-bottom-nav";
import { AddCoffeeModal } from "./_components/add-coffee-modal";
import { GrainTexture } from "@/components/ui/grain-texture";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <QueryProvider>
      <GrainTexture />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-copper-500 focus:text-white focus:text-sm"
      >
        Ir al contenido principal
      </a>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <Header
          displayName={profile?.display_name ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
          userId={user.id}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto min-w-0 pb-24 sm:pb-0"
        >
          {children}
        </main>
        <MobileBottomNav />
        <AddCoffeeModal />
      </div>
    </QueryProvider>
  );
}
