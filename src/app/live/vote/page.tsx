import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { listLiveEvents } from "@/lib/projectp/live-event";

export const dynamic = "force-dynamic";

export default async function LiveInfoPage() {
  const events = await listLiveEvents();
  const today = new Date().toISOString().slice(0, 10);
  const openEvents = events.filter((e) => e.status === "open");
  const upcomingEvents = events.filter(
    (e) => e.eventDate >= today && e.status !== "closed"
  );

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-12 md:py-16 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
          <div className="max-w-[1200px] mx-auto">
            <p
              className="text-xs md:text-sm font-black tracking-[0.35em] text-[#FFE600]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              LIVE VOTE
            </p>
            <h1
              className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              ライブ<span className="text-[#D41E28]">応援。</span>
            </h1>
            <p
              className="mt-4 text-sm md:text-base leading-relaxed max-w-2xl text-[#9BA8BF]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              会場に来た者だけが投じられる一票。かけあがり のライブで、直接プッシュせよ。
            </p>
          </div>
        </section>

        {/* 開催中のイベント */}
        {openEvents.length > 0 && (
          <section className="mx-auto max-w-[720px] px-4 mt-6">
            <div className="rounded-2xl bg-gradient-to-r from-live/10 to-[#fb64b6]/10 border-2 border-live/30 p-6 text-center">
              <p className="text-xs font-bold text-[#e7000b] tracking-wider animate-pulse mb-2">
                🔴 投票受付中
              </p>
              {openEvents.map((ev) => (
                <div key={ev.id} className="mb-4 last:mb-0">
                  <h3 className="text-lg font-bold text-foreground">{ev.title}</h3>
                  <p className="text-xs text-muted mt-1">
                    {ev.eventDate} {ev.venue && `· ${ev.venue}`}
                  </p>
                  <Link
                    href={`/event/${ev.id}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-live to-[#fb64b6] px-8 py-3 text-base font-bold text-white shadow-lg"
                  >
                    💖 投票する →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

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
              来場時にお渡しする<strong>投票コード</strong>を使って、
              スマホから推しメンバーに投票できます。
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-[720px] px-4 mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "ライブに来場", desc: "会場で投票コード(PJ-XXXX)を受け取る", icon: "🎫" },
              { step: "2", title: "コードを入力", desc: "投票ページで 4 桁のコードを入力", icon: "📱" },
              { step: "3", title: "推しに投票！", desc: "チケット数ぶん投票。同じ人に複数票 OK", icon: "💖" },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl bg-white/70 border border-white/80 p-5 text-center shadow-sm">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-live to-[#fb64b6] text-sm font-bold text-white shadow-md">
                  {item.step}
                </span>
                <p className="mt-3 text-2xl">{item.icon}</p>
                <p className="mt-2 text-sm font-bold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bonus */}
        <section className="mx-auto max-w-[720px] px-4 mt-10">
          <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-6 text-center">
            <p className="text-sm text-foreground leading-relaxed">
              🎯 <strong>ファン会員</strong>としてログインしてからコードを入力すると、
              <strong>予想スコアに応じて投票数が 2 倍・3 倍</strong>に！
            </p>
          </div>
        </section>

        {/* ライブ予定 */}
        <section className="mx-auto max-w-[720px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#ffd230] to-[#f59e0b]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#b45309] tracking-tight">
              📅 ライブ予定
            </h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
              <p className="text-sm text-muted">次のライブ情報は近日公開</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-2xl border p-5 ${
                    ev.status === "open"
                      ? "border-live/30 bg-live/5"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-muted">{ev.eventDate}</span>
                        {ev.status === "open" && (
                          <span className="rounded-full bg-live px-2 py-0.5 text-[9px] font-bold text-white animate-pulse">投票受付中</span>
                        )}
                        {ev.eventDate === today && ev.status === "draft" && (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">本日開催</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-foreground">{ev.title}</p>
                      {ev.venue && <p className="text-xs text-muted">{ev.venue}</p>}
                    </div>
                    {ev.status === "open" && (
                      <Link href={`/event/${ev.id}`} className="rounded-full bg-gradient-to-r from-live to-[#fb64b6] px-5 py-2 text-xs font-bold text-white">
                        投票 →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-[720px] px-4 mt-10 text-center">
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-blue px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] transition-all"
          >
            📊 今のランキングを見る →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
