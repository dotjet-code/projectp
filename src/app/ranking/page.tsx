import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { RankingClient } from "./ranking-client";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const members = await getRankedMembers();
  return (
    <>
      <Header />
      <RankingClient members={members} />
      <Footer />
    </>
  );
}
