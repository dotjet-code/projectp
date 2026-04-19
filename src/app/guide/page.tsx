import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GuideClient } from "./guide-client";

export const metadata = {
  title: "ガイド",
  description: "かけあがり の使い方ガイド。ファン・メンバー・スタッフ・運営それぞれの操作方法。",
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
