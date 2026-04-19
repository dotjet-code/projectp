import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers } from "@/lib/data";
import { getActiveStage } from "@/lib/projectp/stage";
import { PredictionClient } from "./prediction-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "順位予想",
  description: "かけあがり の最終順位を予想しよう。的中すればランキング入り。",
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
        {/* Hero */}
        <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-12 md:py-16 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
          <div className="max-w-[1200px] mx-auto">
            <p
              className="text-xs md:text-sm font-black tracking-[0.35em] text-[#FFE600]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              PREDICTION
            </p>
            <h1
              className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              順位<span className="text-[#D41E28]">予想。</span>
            </h1>
            <div className="mt-6 max-w-2xl">
              <p
                className="text-lg md:text-2xl font-black leading-relaxed text-[#F5F1E8]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <span className="text-[#FFE600]">最終順位を、当ててみせろ。</span>
                <br />
                単勝 1pt から三連単 30pt まで。読み切った者だけが、年間王者の称号に近づく。
              </p>
              {stage && (
                <p
                  className="mt-3 text-xs md:text-sm font-bold tracking-wider text-[#9BA8BF]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  ━ {stage.title ?? stage.name}
                </p>
              )}
              <div
                className="mt-4 h-2 max-w-[220px] bg-[#D41E28]"
                style={{
                  clipPath:
                    "polygon(0 60%, 4% 20%, 10% 70%, 18% 30%, 28% 65%, 38% 25%, 48% 70%, 58% 30%, 68% 68%, 78% 28%, 86% 70%, 94% 34%, 100% 66%, 100% 100%, 0 100%)",
                }}
                aria-hidden
              />
            </div>
          </div>
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
