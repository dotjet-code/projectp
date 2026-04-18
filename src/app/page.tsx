import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { StageTimeline } from "@/components/stage-timeline";
import { OnomatopoeiaBand } from "@/components/onomatopoeia-band";
import { CountdownStatus } from "@/components/countdown-status";
import { MemberGrid } from "@/components/member-grid";
import { Rankings } from "@/components/rankings";
import { TodaysLive } from "@/components/todays-live";
import { Footer } from "@/components/footer";
import { getActiveStage } from "@/lib/projectp/stage";

// 実データ反映のためプリレンダリング無効化
export const dynamic = "force-dynamic";

export default async function Home() {
  const stage = await getActiveStage().catch(() => null);
  const stageLabel = stage
    ? `${stage.stageNumber ? `ステージ ${stage.stageNumber}` : ""}${stage.title ? ` 「${stage.title}」` : ""} 開催中`
    : "次のステージは近日開始";

  return (
    <>
      <Header />
      <StageTimeline stage={stage} />
      <main>
        <Hero
          stageLabel={stageLabel}
          portraitImage="/hero/shiomi-kira.jpg"
          backgroundImage="/hero/bg-collage.png"
          titleImage="/hero/title-kakeagari-v2.png"
          titleImageAspect={669 / 373}
          jerseyNumber="01"
          grade="S"
        />
        <OnomatopoeiaBand
          word="激闘。"
          caption={
            stage?.stageNumber
              ? `STAGE ${stage.stageNumber} · RACE DAY`
              : undefined
          }
        />
        <CountdownStatus />
        <MemberGrid />
        <Rankings />
        <TodaysLive />
      </main>
      <Footer />
    </>
  );
}
