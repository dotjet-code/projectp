import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
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
      <main>
        <Hero
          stageLabel={stageLabel}
          portraitImage="/hero/shiomi-kira.jpg"
          backgroundImage="/hero/haikei.jpg"
          jerseyNumber="01"
          grade="S"
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
