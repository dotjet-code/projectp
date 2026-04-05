import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CountdownStatus } from "@/components/countdown-status";
import { MemberGrid } from "@/components/member-grid";
import { ReorgLine } from "@/components/reorg-line";
import { Rankings } from "@/components/rankings";
import { TrendingLive } from "@/components/trending-live";
import { TodaysLive } from "@/components/todays-live";
import { Footer } from "@/components/footer";

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
        <TrendingLive />
        <TodaysLive />
      </main>
      <Footer />
    </>
  );
}
