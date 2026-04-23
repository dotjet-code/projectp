import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackstageGuideClient } from "./guide-client";

export const metadata = {
  title: "バックステージ ガイド",
  description:
    "メンバー・スタッフ・運営向けの操作ガイド。内部関係者のみ閲覧。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BackstageGuidePage() {
  return (
    <>
      <Header />
      <main className="pb-16 bg-[#F5F1E8]">
        <BackstageGuideClient />
      </main>
      <Footer />
    </>
  );
}
