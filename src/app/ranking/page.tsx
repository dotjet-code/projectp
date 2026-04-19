import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getRankingContext } from "@/lib/projectp/live-stats";
import { RankingClient } from "./ranking-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "総合ランキング",
  description: "かけあがり メンバーの暫定順位。バズ・配信・収支・投票の 4 指標で競う。",
};

export default async function RankingPage() {
  const ctx = await getRankingContext();
  const stageLabel = ctx.stage
    ? `${ctx.stage.stageNumber ? `ステージ ${ctx.stage.stageNumber}` : ""}${ctx.stage.title ? ` 「${ctx.stage.title}」` : ""}`
    : undefined;

  return (
    <>
      <Header />
      <RankingClient members={ctx.members} stageLabel={stageLabel} />
      <Footer />
    </>
  );
}
