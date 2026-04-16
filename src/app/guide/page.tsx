import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GuideClient } from "./guide-client";

export const metadata = {
  title: "ガイド",
  description: "Project P の使い方ガイド。ファン・メンバー・スタッフ・運営それぞれの操作方法。",
};

export default function GuidePage() {
  return (
    <>
      <Header />
      <main className="pb-16">
        <GuideClient />
      </main>
      <Footer />
    </>
  );
}
