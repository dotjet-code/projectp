import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CountdownStatus } from "@/components/countdown-status";
import { MemberGrid } from "@/components/member-grid";
import { ReorgLine } from "@/components/reorg-line";
import { Rankings } from "@/components/rankings";
import { TodaysLive } from "@/components/todays-live";
import { Footer } from "@/components/footer";

// 実データ反映のためプリレンダリング無効化
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CountdownStatus />
        <MemberGrid />
        <ReorgLine />
        <Rankings />
        <TodaysLive />
      </main>
      <Footer />
    </>
  );
}
