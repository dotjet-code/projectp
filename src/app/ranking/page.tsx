import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getRankingContext } from "@/lib/projectp/live-stats";
import { RankingClient } from "./ranking-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "総合ランキング",
  description: "Project P メンバーの暫定順位。バズ・配信・収支の3指標で競う。",
};

export default async function RankingPage() {
  const ctx = await getRankingContext();
  const stageLabel = ctx.stage
    ? `${ctx.stage.stageNumber ? `ステージ ${ctx.stage.stageNumber}` : ""}${ctx.stage.title ? ` 「${ctx.stage.title}」` : ""} — バズ / 配信 / 収支`
    : "バズ / 配信 / 収支 の3指標合算";

  return (
    <>
      <Header />
      <RankingClient members={ctx.members} stageLabel={stageLabel} />
      <Footer />
    </>
  );
}
