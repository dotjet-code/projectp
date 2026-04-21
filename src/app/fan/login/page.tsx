import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FanLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ファン会員ログイン",
  description:
    "メールアドレスで かけあがり のファン会員にログイン。順位予想の景品対象になります。",
};

export default function FanLoginPage() {
  return (
    <>
      <Header />
      <main className="pb-16 bg-[#F5F1E8] min-h-[60vh]">
        <section className="max-w-[1100px] mx-auto px-4 pt-12 md:pt-16 pb-8">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ ファン会員
            </p>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
          <h1
            className="text-3xl md:text-5xl font-black leading-tight text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            ファン会員ログイン
          </h1>
          <div className="mt-5 max-w-2xl">
            <p
              className="text-lg md:text-2xl font-black leading-relaxed text-[#111]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <span
                className="relative inline-block px-1"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, #FFE600 60%)",
                }}
              >
                観客から、共犯者へ。
              </span>
              <br />
              メアド一つで、君の一票が誰かの順位を動かす。
            </p>
            <div
              className="mt-4 h-2 max-w-[220px] bg-[#D41E28]"
              style={{
                clipPath:
                  "polygon(0 60%, 4% 20%, 10% 70%, 18% 30%, 28% 65%, 38% 25%, 48% 70%, 58% 30%, 68% 68%, 78% 28%, 86% 70%, 94% 34%, 100% 66%, 100% 100%, 0 100%)",
              }}
              aria-hidden
            />
          </div>
        </section>

        <section className="mx-auto max-w-[480px] px-4">
          <div
            className="relative bg-[#F5F1E8] border-2 border-[#111] p-6 md:p-7"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(17,17,17,0.10) 0.6px, transparent 1px)",
              backgroundSize: "5px 5px",
              boxShadow: "6px 6px 0 rgba(17,17,17,0.18)",
            }}
          >
            <FanLoginForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
