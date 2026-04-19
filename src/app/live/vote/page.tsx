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
      <main className="pb-10 bg-[#F5F1E8]">
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
            <div className="mt-6 max-w-2xl">
              <p
                className="text-lg md:text-2xl font-black leading-relaxed text-[#F5F1E8]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <span className="text-[#FFE600]">会場に来た者だけが、投じられる一票。</span>
                <br />
                その日、その瞬間、君の手で順位を動かせ。
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
          </div>
        </section>

        {/* 開催中のイベント */}
        {openEvents.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 mt-6">
            <div
              className="relative bg-[#FFE600] border-2 border-[#111] p-6 text-center"
              style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.22)" }}
            >
              <p
                className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28] mb-3"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ NOW VOTING <span className="inline-block w-1.5 h-1.5 bg-[#D41E28] animate-pulse ml-1" />
              </p>
              {openEvents.map((ev) => (
                <div key={ev.id} className="mb-4 last:mb-0">
                  <h3
                    className="text-2xl md:text-3xl font-black text-[#111] leading-tight"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    {ev.title}
                  </h3>
                  <p
                    className="text-xs text-[#4A5060] mt-1 tabular-nums"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {ev.eventDate} {ev.venue && `· ${ev.venue}`}
                  </p>
                  <Link
                    href={`/event/${ev.id}`}
                    className="mt-4 inline-flex items-center gap-3 bg-[#D41E28] text-white px-8 py-3 text-base font-black hover:translate-y-0.5 transition-transform"
                    style={{
                      fontFamily: "var(--font-noto-serif), serif",
                      boxShadow: "5px 5px 0 rgba(17,17,17,0.22)",
                    }}
                  >
                    投票する <span className="text-xl">→</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="mx-auto max-w-[1100px] px-4 mt-10">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ HOW IT WORKS
            </p>
            <h2
              className="text-2xl md:text-3xl font-black text-[#111] leading-none"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              ライブ当日の応援投票とは？
            </h2>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
          <div
            className="bg-[#F5F1E8] border-2 border-[#111] px-6 py-5"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(17,17,17,0.10) 0.6px, transparent 1px)",
              backgroundSize: "5px 5px",
              boxShadow: "5px 5px 0 rgba(17,17,17,0.18)",
            }}
          >
            <p
              className="text-sm md:text-base leading-relaxed text-[#111]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              かけあがり のライブイベントに来場した者だけが参加できる、
              <b className="text-[#D41E28]">会場限定の応援投票</b>。
              来場時に渡される<b>投票コード</b>を使って、
              スマホから推しメンバーに票を投じる。
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-[1100px] px-4 mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {[
              { step: "01", title: "ライブに来場", desc: "会場で投票コード (PJ-XXXX) を受け取る", icon: "🎫" },
              { step: "02", title: "コードを入力", desc: "投票ページで 4 桁のコードを入力", icon: "📱" },
              { step: "03", title: "推しに投票", desc: "チケット数ぶん投票。同じ人に複数票 OK", icon: "💖" },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#F5F1E8] border-2 border-[#111] p-5 text-center"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(17,17,17,0.08) 0.6px, transparent 1px)",
                  backgroundSize: "5px 5px",
                  boxShadow: "4px 4px 0 rgba(17,17,17,0.18)",
                }}
              >
                <span
                  className="inline-flex w-10 h-10 items-center justify-center bg-[#D41E28] text-base font-black text-white tabular-nums"
                  style={{
                    fontFamily: "var(--font-outfit)",
                    boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
                  }}
                >
                  {item.step}
                </span>
                <p className="mt-3 text-2xl">{item.icon}</p>
                <p
                  className="mt-2 text-base font-black text-[#111]"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  {item.title}
                </p>
                <p
                  className="mt-1 text-xs text-[#4A5060]"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bonus */}
        <section className="mx-auto max-w-[1100px] px-4 mt-10">
          <div className="bg-[#111] text-[#F5F1E8] border-2 border-[#111] px-6 py-5"
            style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.22)" }}
          >
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#FFE600] mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ BONUS
            </p>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <b className="text-[#FFE600]">ファン会員</b>としてログインしてからコードを入力すると、
              予想スコアに応じて投票数が <b className="text-[#FFE600]">2 倍 · 3 倍</b> に。
            </p>
          </div>
        </section>

        {/* ライブ予定 */}
        <section className="mx-auto max-w-[1100px] px-4 mt-10">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ SCHEDULE
            </p>
            <h2
              className="text-2xl md:text-3xl font-black text-[#111] leading-none"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              ライブ予定
            </h2>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="bg-[#F5F1E8] border-2 border-dashed border-[#111]/40 p-8 text-center">
              <p
                className="text-sm text-[#4A5060]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                次のライブ情報は近日公開
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`border-2 px-5 py-4 ${
                    ev.status === "open"
                      ? "border-[#D41E28] bg-[#FFE600]"
                      : "border-[#111] bg-[#F5F1E8]"
                  }`}
                  style={{ boxShadow: "3px 3px 0 rgba(17,17,17,0.18)" }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-black tabular-nums tracking-wider text-[#4A5060]"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {ev.eventDate}
                        </span>
                        {ev.status === "open" && (
                          <span
                            className="bg-[#D41E28] text-white px-2 py-0.5 text-[9px] font-black tracking-wider animate-pulse"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            投票受付中
                          </span>
                        )}
                        {ev.eventDate === today && ev.status === "draft" && (
                          <span
                            className="bg-[#111] text-[#FFE600] px-2 py-0.5 text-[9px] font-black tracking-wider"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            本日開催
                          </span>
                        )}
                      </div>
                      <p
                        className="text-base md:text-lg font-black text-[#111] truncate"
                        style={{ fontFamily: "var(--font-noto-serif), serif" }}
                      >
                        {ev.title}
                      </p>
                      {ev.venue && (
                        <p
                          className="text-xs text-[#4A5060]"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {ev.venue}
                        </p>
                      )}
                    </div>
                    {ev.status === "open" && (
                      <Link
                        href={`/event/${ev.id}`}
                        className="shrink-0 inline-flex items-center gap-2 bg-[#D41E28] text-white px-5 py-2 text-xs font-black hover:translate-y-0.5 transition-transform"
                        style={{
                          fontFamily: "var(--font-noto-serif), serif",
                          boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                        }}
                      >
                        投票 →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-[1100px] px-4 mt-12 text-center">
          <Link
            href="/ranking"
            className="group inline-flex items-center gap-3 bg-[#111] text-[#FFE600] px-10 py-4 text-base font-black hover:translate-y-0.5 transition-transform"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "5px 5px 0 rgba(17,17,17,0.22)",
            }}
          >
            <span>今のランキングを見る</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
