import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function LiveInfoPage() {
  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf2f8] via-[#fce7f3]/40 to-transparent pt-10 pb-8 text-center">
          <p className="text-5xl mb-3">🎤</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-live to-[#fb64b6] bg-clip-text text-transparent">
            ライブ応援
          </h1>
          <p className="mt-3 text-sm text-muted max-w-md mx-auto px-4 leading-relaxed">
            Project P のライブに来て、推しメンバーを直接応援しよう！
          </p>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-[720px] px-4 mt-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-live to-[#fb64b6]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#e7000b] tracking-tight">
              💖 ライブ当日の応援投票とは？
            </h2>
          </div>

          <div className="rounded-2xl bg-white/70 border border-white/80 p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-foreground">
              Project P のライブイベントに来場したお客さんだけが参加できる、
              <strong>会場限定の応援投票</strong>です。
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              来場時にお渡しする<strong>投票コード</strong>を使って、
              スマホから推しメンバーに投票できます。
              投票結果は<strong>SPECIAL ポイント</strong>としてメンバーの戦いに直接反映されます。
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              あなたの1票が、推しの未来を変える。
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-[720px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
              📋 投票の流れ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "ライブに来場",
                desc: "会場で投票コードが書かれた紙を受け取ります",
                icon: "🎫",
              },
              {
                step: "2",
                title: "コードを入力",
                desc: "スマホで投票ページを開き、コードを入力します",
                icon: "📱",
              },
              {
                step: "3",
                title: "推しに投票！",
                desc: "持っているチケットを好きなメンバーに投票します",
                icon: "💖",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl bg-white/70 border border-white/80 p-5 text-center shadow-sm"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-live to-[#fb64b6] text-sm font-bold text-white shadow-md font-[family-name:var(--font-outfit)]">
                  {item.step}
                </span>
                <p className="mt-3 text-2xl">{item.icon}</p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Special points */}
        <section className="mx-auto max-w-[720px] px-4 mt-10">
          <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1 text-[10px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">
                SPECIAL
              </span>
              <span className="text-[10px] font-bold text-purple-700 tracking-wider font-[family-name:var(--font-outfit)]">
                LIVE DAY ONLY
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              ライブ当日の投票は<strong>特別ポイント</strong>として加算されます。
              <br />
              通常のバズ・配信・収支とは<strong>別レイヤー</strong>で表示され、
              <br />
              会場に来てくれたファンの応援がダイレクトに順位争いに影響します。
            </p>
          </div>
        </section>

        {/* Next live */}
        <section className="mx-auto max-w-[720px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#ffd230] to-[#f59e0b]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#b45309] tracking-tight">
              📅 次のライブ
            </h2>
          </div>

          <div className="rounded-2xl border border-[rgba(254,243,198,0.6)] bg-gradient-to-r from-[rgba(254,249,195,0.6)] to-[rgba(254,243,198,0.6)] p-6 text-center">
            <p className="text-3xl mb-3">🎤</p>
            <p className="text-sm font-bold text-foreground">
              次のライブ情報は近日公開
            </p>
            <p className="mt-2 text-xs text-muted">
              ライブ開催が決まり次第、ここでお知らせします。
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[720px] px-4 mt-10 text-center">
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-blue px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)] transition-all"
          >
            📊 今のランキングを見る →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
