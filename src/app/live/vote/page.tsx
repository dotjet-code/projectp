import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers } from "@/lib/data";
import { VoteClient } from "./vote-client";

export const dynamic = "force-dynamic";

async function listVotableMembers() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const dummyByName = new Map(dummyMembers.map((d) => [d.name, d]));

  return (data ?? []).map((m) => {
    const dummy = dummyByName.get(m.name);
    return {
      id: m.id as string,
      name: m.name as string,
      slug: dummy?.slug ?? "",
      avatarUrl: dummy?.avatarUrl ?? "",
      role: (dummy?.role ?? "PIT") as "PLAYER" | "PIT",
    };
  });
}

export default async function LiveVotePage() {
  const members = await listVotableMembers();

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf2f8] via-[#fce7f3]/40 to-transparent pt-10 pb-8 text-center">
          <p className="text-4xl mb-2">💖</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-live to-[#fb64b6] bg-clip-text text-transparent">
            ライブ応援投票
          </h1>
          <p className="mt-2 text-xs text-muted max-w-md mx-auto px-4">
            今日、あなたが推すメンバー 1人に投票しよう。
            <br />
            1日 1票、気が変わったら上書きもできます。
          </p>
        </section>

        <VoteClient members={members} />
      </main>
      <Footer />
    </>
  );
}
