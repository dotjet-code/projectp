import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { NewsFlash } from "@/components/news-flash";
import { StageTimeline } from "@/components/stage-timeline";
import { MemberGrid } from "@/components/member-grid";
import { Rankings } from "@/components/rankings";
import { TodaysLive } from "@/components/todays-live";
import { Footer } from "@/components/footer";
import { TornDivider } from "@/components/torn-divider";
import { MissionStatement } from "@/components/mission-statement";
import { PredictionCTA } from "@/components/prediction-cta";
import { WelcomeChinchiroModal } from "@/components/welcome-chinchiro-modal";
import { getActiveStage } from "@/lib/projectp/stage";
import { getRankedMembers } from "@/lib/projectp/live-stats";

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
      time: "3h 前",
      text: `${top1.name} 首位キープ (${top1.effectivePoints.toLocaleString()}pt)`,
      accent: "red",
    });
  }
  if (top2) {
    recent.push({
      time: "5h 前",
      text: `${top2.name} 2 位浮上 (${top2.effectivePoints.toLocaleString()}pt)`,
      accent: "red",
    });
  }
  if (top3) {
    recent.push({
      time: "8h 前",
      text: `${top3.name} 表彰台に届く (${top3.effectivePoints.toLocaleString()}pt)`,
      accent: "pink",
    });
  }
  if (top4) {
    recent.push({
      time: "昨日",
      text: `${top4.name} 4 位を確保 (${top4.effectivePoints.toLocaleString()}pt)`,
      accent: "teal",
    });
  }

  return { headline, sub, recent };
}

export default async function Home() {
  const [stage, ranked] = await Promise.all([
    getActiveStage().catch(() => null),
    getRankedMembers().catch(() => []),
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
        <MissionStatement />
        <TornDivider variant="bottom" height={18} />
        <PredictionCTA
          variant="cream"
          label="今すぐ予想する"
          sub="無料 · 登録不要 · 1分で完了"
          spacing="compact"
        />
        <TornDivider variant="top" height={18} />
        <MemberGrid />
        <TornDivider variant="bottom" height={18} color="#111111" />
        <PredictionCTA
          variant="black"
          eyebrow="━ PLACE YOUR BET"
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
        <Rankings />
        <TornDivider variant="top" height={18} color="#111111" />
        <TodaysLive />
      </main>
      <Footer />
    </>
  );
}
