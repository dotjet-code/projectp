import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ResultsPage() {
  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fef9c3] via-[#fef3c6]/40 to-transparent pt-10 pb-8 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-[20%] top-[10%] size-32 rounded-full bg-[#ffd230] blur-[60px]" />
            <div className="absolute right-[20%] top-[20%] size-24 rounded-full bg-primary blur-[50px]" />
          </div>
          <div className="relative">
            <p className="text-5xl mb-3">🏆</p>
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#8b5cf6] bg-clip-text text-transparent">
              今月の最終結果
            </h1>
            <p className="mt-2 text-sm text-muted">
              2026年4月クール
            </p>
          </div>
        </section>

        {/* Status */}
        <section className="mx-auto max-w-[720px] px-4 mt-6">
          <div className="rounded-2xl border border-[rgba(254,243,198,0.6)] bg-gradient-to-r from-[rgba(254,249,195,0.6)] to-[rgba(254,243,198,0.6)] p-8 text-center">
            <p className="text-4xl mb-3">⏳</p>
            <h2 className="text-lg font-bold text-foreground">
              最終結果は月末特番後に公開
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              月間3指標（バズ・配信・収支）と月末特番の結果をもとに、
              <br />
              最終順位と翌月の PLAYER / PIT 編成が確定します。
            </p>
            <p className="mt-4 text-xs text-muted">
              現在の暫定順位は
              <a href="/ranking" className="underline text-primary-dark ml-1">
                総合ランキング
              </a>
              から確認できます。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
