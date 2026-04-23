import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GuideClient } from "./guide-client";

export const metadata = {
  title: "かけあがりガイド",
  description:
    "3 分で分かる、かけあがり！ガイド。推しの決め方・予想・ライブ投票・景品の受け取り方までまとめて解説。",
};

export default function GuidePage() {
  return (
    <>
      <Header />
      <main className="pb-16 bg-[#F5F1E8]">
        <GuideClient />
      </main>
      <Footer />
    </>
  );
}
