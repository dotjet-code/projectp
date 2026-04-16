import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers } from "@/lib/data";
import { getActiveStage } from "@/lib/projectp/stage";
import { PredictionClient } from "./prediction-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "順位予想",
  description: "Project P の最終順位を予想しよう。的中すればランキング入り。",
};

async function listMembersWithMeta() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const dummyByName = new Map(dummyMembers.map((d) => [d.name, d]));

  return (data ?? []).filter((m) => (m.name as string) !== "Coming Soon").map((m) => {
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

export default async function PredictionPage() {
  const [members, stage] = await Promise.all([
    listMembersWithMeta(),
    getActiveStage().catch(() => null),
  ]);

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Page Header */}
        <section className="pt-10 pb-6 text-center">
          <p className="text-4xl mb-2">🎯</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            順位予想
          </h1>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            {stage
              ? `「${stage.title ?? stage.name}」の最終順位を予想しよう。特番で確定した結果が、次の再編成を決める。`
              : "現在進行中のステージがありません。次のステージが始まると予想できるようになります。"}
          </p>
        </section>

        <PredictionClient
          members={members}
          stage={
            stage && {
              id: stage.id,
              name: stage.name,
              title: stage.title,
              subtitle: stage.subtitle,
              seriesNumber: stage.seriesNumber,
              stageNumber: stage.stageNumber,
              startDate: stage.startDate,
              endDate: stage.endDate,
            }
          }
        />
      </main>
      <Footer />
    </>
  );
}
