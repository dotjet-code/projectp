import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSeriesTotals } from "@/lib/projectp/stage";

export const dynamic = "force-dynamic";

const medals = ["🥇", "🥈", "🥉"];

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const seriesNumber = Number(number);
  if (Number.isNaN(seriesNumber)) notFound();

  const data = await getSeriesTotals(seriesNumber);

  return (
    <>
      <Header />
      <main className="pb-10 bg-[#F5F1E8] min-h-[60vh]">
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
              SERIES {seriesNumber}
            </p>
            <h1
              className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              半年累計<span className="text-[#D41E28]">ランキング。</span>
            </h1>
            <div className="mt-6 max-w-2xl">
              <p
                className="text-lg md:text-2xl font-black leading-relaxed text-[#F5F1E8]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <span className="text-[#FFE600]">半年、走り抜いた者は誰か。</span>
                <br />
                シリーズ通算。確定済みステージの積み上げで、年間順位が決まる。
              </p>
              <p
                className="mt-3 text-xs md:text-sm font-bold tracking-widest text-[#9BA8BF]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ {data.stages.length} STAGES · 確定済みのみ集計
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

        {/* Stages used */}
        {data.stages.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 mt-8">
            <p
              className="text-[10px] font-black tracking-[0.32em] text-[#D41E28] mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ INCLUDED STAGES
            </p>
            <ul className="flex flex-wrap items-center gap-2">
              {data.stages.map((s) => (
                <li
                  key={s.id}
                  className="bg-[#F5F1E8] border-2 border-[#111] px-3 py-1.5 text-[11px] font-black text-[#111] tracking-wider"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  STAGE {s.stageNumber ?? "?"}
                  {s.title ? ` · ${s.title}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Ranking */}
        <section className="mx-auto max-w-[1100px] px-4 mt-8">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ CUMULATIVE
            </p>
            <h2
              className="text-2xl md:text-3xl font-black text-[#111] leading-none"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              累計順位
            </h2>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>

          {data.rows.length === 0 ? (
            <div
              className="bg-[#F5F1E8] border-2 border-[#111] p-8 md:p-10 text-center"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(17,17,17,0.10) 0.6px, transparent 1px)",
                backgroundSize: "5px 5px",
                boxShadow: "5px 5px 0 rgba(17,17,17,0.18)",
              }}
            >
              <h3
                className="text-2xl md:text-3xl font-black text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                まだ確定したシリーズがありません
              </h3>
              <p
                className="mt-3 text-sm text-[#4A5060] leading-relaxed"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                ステージの結果が確定すると、ここに累計が表示される。
              </p>
              <Link
                href="/ranking"
                className="mt-5 inline-flex items-center gap-2 bg-[#D41E28] text-white px-6 py-2.5 text-sm font-black hover:translate-y-0.5 transition-transform"
                style={{
                  fontFamily: "var(--font-noto-serif), serif",
                  boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                }}
              >
                現在の暫定ランキングを見る →
              </Link>
            </div>
          ) : (
            <div className="border-t-[3px] border-[#111]">
              {data.rows.map((r) => {
                const isReorgLine = r.rank === 7;
                return (
                  <div key={r.memberId}>
                    {isReorgLine && (
                      <div className="relative my-2 py-2">
                        <div className="border-t-2 border-dashed border-[#D41E28]" />
                        <span
                          className="absolute left-1/2 -translate-x-1/2 -top-1 bg-[#D41E28] text-white px-4 py-1 text-[10px] font-black tracking-wider"
                          style={{
                            fontFamily: "var(--font-outfit)",
                            boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
                          }}
                        >
                          ━ Series 再編成ライン ━
                        </span>
                      </div>
                    )}

                    <Link
                      href={r.slug ? `/members/${r.slug}` : "/members"}
                      className="flex items-center gap-3 md:gap-4 px-3 py-3 border-b border-[#D5CFC0] hover:bg-white/60 transition-colors group"
                    >
                      <div className="w-8 shrink-0 text-center">
                        {r.rank <= 3 ? (
                          <span className="text-2xl">{medals[r.rank - 1]}</span>
                        ) : (
                          <span
                            className="text-base font-black text-[#111] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            #{r.rank}
                          </span>
                        )}
                      </div>

                      {r.avatarUrl && (
                        <Image
                          src={r.avatarUrl}
                          alt={r.memberName}
                          width={48}
                          height={48}
                          className="w-12 h-12 shrink-0 object-cover border border-[#111]/40 md:grayscale md:contrast-125 md:group-hover:grayscale-0 md:group-hover:contrast-100 transition-[filter] duration-300"
                          style={{ objectPosition: "50% 18%" }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-base font-black text-[#111] truncate leading-tight"
                          style={{ fontFamily: "var(--font-noto-serif), serif" }}
                        >
                          {r.memberName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white ${
                              r.position === "PLAYER"
                                ? "bg-[#D41E28]"
                                : "bg-[#4A5060]"
                            }`}
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.position}
                          </span>
                          <span
                            className="text-[10px] font-bold text-[#4A5060] tracking-wider"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.stagesCounted} stage 集計
                          </span>
                          {r.specialPoints > 0 && (
                            <span
                              className="inline-flex items-center gap-1 bg-[#FFE600] text-[#111] px-1.5 py-0.5 text-[9px] font-black tracking-wider"
                              style={{ fontFamily: "var(--font-outfit)" }}
                            >
                              SPECIAL +{r.specialPoints.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-4 text-[10px]">
                        <div className="text-right">
                          <p
                            className="font-black text-[#00BCFF] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.buzzPoints.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-[#4A5060]">バズ</p>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-black text-[#1447E6] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.livePoints.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-[#4A5060]">配信</p>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-black text-[#7A3DFF] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.balancePoints.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-[#4A5060]">収支</p>
                        </div>
                      </div>

                      <div className="w-20 sm:w-24 shrink-0 text-right">
                        <span
                          className="text-2xl md:text-3xl font-black text-[#111] tabular-nums leading-none"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {r.totalPoints.toLocaleString()}
                        </span>
                        <p
                          className="text-[9px] text-[#4A5060] mt-0.5"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          pt
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
