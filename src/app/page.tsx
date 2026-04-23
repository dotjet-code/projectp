import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { NewsFlash } from "@/components/news-flash";
import { StageTimeline } from "@/components/stage-timeline";
import { MemberGrid } from "@/components/member-grid";
import { TodaysLive } from "@/components/todays-live";
import { Footer } from "@/components/footer";
import { TornDivider } from "@/components/torn-divider";
import { MissionStatement } from "@/components/mission-statement";
import { PredictionCTA } from "@/components/prediction-cta";
import { ChinchiroCTA } from "@/components/chinchiro-cta";
import { HowItWorks } from "@/components/how-it-works";
import { OshiPicker } from "@/components/oshi-picker";
import { WelcomeChinchiroModal } from "@/components/welcome-chinchiro-modal";
import { getActiveStage } from "@/lib/projectp/stage";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { getTodayActivityStats } from "@/lib/projectp/activity-stats";

// 実データ反映のためプリレンダリング無効化
export const dynamic = "force-dynamic";

type FlashRow = {
  time: string;
  text: string;
  accent: "red" | "pink" | "teal" | "neutral";
};

/**
 * ランキング上位 4 名から号外用の見出し / サブ / 直近の動きを生成する。
 * メンバー入れ替わりや試合状況に合わせて自動で更新される。
 */
function buildNewsFlash(
  ranked: Awaited<ReturnType<typeof getRankedMembers>>,
): { headline: string; sub: string; recent: FlashRow[] } {
  const active = ranked.filter((m) => m.name !== "Coming Soon");
  const top1 = active[0];
  const top2 = active[1];
  const top3 = active[2];
  const top4 = active[3];

  if (!top1) {
    return {
      headline: "開幕、間近。",
      sub: "次のステージで、誰が主役の座を獲るのか。",
      recent: [],
    };
  }

  const margin =
    top1 && top2 ? Math.abs(top1.effectivePoints - top2.effectivePoints) : 0;
  const stripDot = (s: string) => s.replace(/。$/, "");
  const top1Short = stripDot(top1.name);
  const top2Short = top2 ? stripDot(top2.name) : "";

  const headline =
    top2 && margin <= 100
      ? `${top1Short}、${top2Short}に肉薄。`
      : top2
        ? `${top1Short}、独走中。`
        : `${top1Short}、ひとり勝ち。`;

  const sub =
    top2 && margin <= 100
      ? `${top1.name} と ${top2.name} の差はわずか ${margin.toLocaleString()} pt。揺らぐ首位。`
      : top2
        ? `${top1.name} が ${margin.toLocaleString()} pt の差で他を引き離す。`
        : `${top1.name} が独占状態。追走者の出現を待つ。`;

  const recent: FlashRow[] = [];
  if (top1) {
    recent.push({
      time: "#1",
      text: `${top1.name} (${top1.effectivePoints.toLocaleString()}pt)`,
      accent: "red",
    });
  }
  if (top2) {
    recent.push({
      time: "#2",
      text: `${top2.name} (${top2.effectivePoints.toLocaleString()}pt)`,
      accent: "pink",
    });
  }
  if (top3) {
    recent.push({
      time: "#3",
      text: `${top3.name} (${top3.effectivePoints.toLocaleString()}pt)`,
      accent: "pink",
    });
  }
  if (top4) {
    recent.push({
      time: "#4",
      text: `${top4.name} (${top4.effectivePoints.toLocaleString()}pt)`,
      accent: "teal",
    });
  }

  return { headline, sub, recent };
}

export default async function Home() {
  const [stage, ranked, activity] = await Promise.all([
    getActiveStage().catch(() => null),
    getRankedMembers().catch(() => []),
    getTodayActivityStats().catch(() => ({
      chinchiroRolls: 0,
      chinchiroVotes: 0,
      topHandToday: null,
    })),
  ]);
  const stageLabel = stage
    ? `${stage.stageNumber ? `ステージ ${stage.stageNumber}` : ""}${stage.title ? ` 「${stage.title}」` : ""} 開催中`
    : "次のステージは近日開始";

  const flash = buildNewsFlash(ranked);

  // ウェルカム賽用のメンバー (supabase 未連携 = supabaseId null は除外)
  const chinchiroMembers = ranked
    .filter((m) => m.supabaseId && m.name !== "Coming Soon")
    .slice(0, 12)
    .map((m, i) => ({
      id: m.supabaseId as string,
      name: m.name,
      slug: m.slug,
      avatarUrl: m.avatarUrl,
      rank: i + 1,
    }));

  return (
    <>
      {chinchiroMembers.length > 0 && (
        <WelcomeChinchiroModal members={chinchiroMembers} />
      )}
      <Header />
      <StageTimeline stage={stage} />
      <main>
        <Hero
          stageLabel={stageLabel}
          portraitImage="/hero/top.png"
          backgroundImage="/hero/bg-collage.png"
          titleImage="/hero/title-kakeagari-v2.png"
          titleImageAspect={669 / 373}
          taglineImages={[
            "/hero/tagline-shuyaku.png",
            "/hero/tagline-jinsei.png",
            "/hero/tagline-niji.png",
          ]}
          jerseyNumber="01"
          grade="S"
          newsFlashSlot={
            <NewsFlash
              stage={stage}
              headline={flash.headline}
              sub={flash.sub}
              grade="S"
              recent={flash.recent}
            />
          }
        />
        <HowItWorks activity={activity} />
        <OshiPicker members={ranked.filter((m) => m.name !== "Coming Soon")} />
        <ChinchiroCTA />
        <TornDivider variant="top" height={18} />
        <MemberGrid />
        <TornDivider variant="bottom" height={18} color="#111111" />
        <PredictionCTA
          variant="black"
          eyebrow="━ 予想"
          headline={
            <p>
              顔ぶれは、見えた。
              <br className="md:hidden" />
              <span
                className="relative inline-block"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, #D41E28 60%)",
                  paddingInline: "4px",
                }}
              >
                頂点を獲るのは、誰だ。
              </span>
            </p>
          }
          label="無料で予想する"
          sub="的中したら、君もランクイン。"
          spacing="compact"
        />
        <TornDivider variant="top" height={18} color="#111111" />
        <TodaysLive />
        <TornDivider variant="bottom" height={18} color="#111111" />
        <MissionStatement />
      </main>
      <Footer />
    </>
  );
}
