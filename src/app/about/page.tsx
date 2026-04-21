import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pb-20">
        {/* Hero */}
        <section className="relative bg-[#111111] text-[#F5F1E8] px-6 py-16 md:py-24 overflow-hidden">
          {/* 赤斜めストライプ帯 */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
          <div className="max-w-[1200px] mx-auto relative">
            <p
              className="text-xs md:text-sm font-black tracking-[0.35em] text-[#FFE600]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ABOUT
            </p>
            <h1
              className="mt-4 text-5xl md:text-8xl font-black tracking-tight leading-[0.9]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              かけあがり！<br />
              <span className="text-[#D41E28]">とは？</span>
            </h1>
            <div className="mt-6 max-w-2xl">
              <p
                className="text-lg md:text-2xl font-black leading-relaxed text-[#F5F1E8]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <span className="text-[#FFE600]">数字で勝ち取り、数字で奪われる。</span>
                <br />
                毎月、主役の座を懸けて駆け上がる。上位 6 名だけが、次のステージに立てる。
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

        <div className="max-w-[1200px] mx-auto px-4 mt-16 space-y-16">
          {/* 概要 */}
          <section>
            <SectionHeading title="概要" eyebrow="OVERVIEW" accent="red" />
            <div className="space-y-5 max-w-3xl">
              <p
                className="text-base md:text-lg leading-relaxed text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                かけあがり は、<strong className="text-[#D41E28]">メンバーが毎月の成績で競い合い、上位 6 名が「PLAYER」として次のメインステージに立つ</strong>競争型エンタメプロジェクト。
              </p>
              <p
                className="text-base leading-relaxed text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                固定チームではない。毎月の成績でポジションが入れ替わり、誰もが主役になれる可能性と、主役を失うリスクを同時に抱えている。
              </p>
              <p
                className="text-sm leading-relaxed text-[#4A5060]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                勝ち取った 6 名は「かけっこ！」のメインメンバーとしてステージに立つ。
              </p>
            </div>
          </section>

          {/* 4指標 */}
          <section>
            <SectionHeading
              title="4 つの競争指標"
              eyebrow="SCORING AXIS"
              accent="red"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t-[3px] border-[#111]">
              {[
                {
                  num: "01",
                  label: "バズ",
                  desc: "SNS での話題性、動画再生数、トレンド力。注目を集めた者が勝つ。",
                  color: "#00BCFF",
                },
                {
                  num: "02",
                  label: "配信",
                  desc: "配信の同時接続数。リアルタイムでファンを動かせるかが問われる。",
                  color: "#1447E6",
                },
                {
                  num: "03",
                  label: "収支",
                  desc: "グッズ・投げ銭・チケットなどの経済指標。応援が数字になる。",
                  color: "#7A3DFF",
                },
                {
                  num: "04",
                  label: "投票",
                  desc: "毎日のサイコロ投票と順位予想で集まる、ファンからの直接指名。",
                  color: "#D41E28",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border-b-[3px] border-[#111] md:border-b-0 md:border-r-[3px] md:last:border-r-0 even:border-r-0 md:even:border-r-[3px] px-5 py-7 md:px-6 md:py-8 bg-[#F5F1E8]"
                >
                  <div className="flex items-baseline gap-3 mb-4">
                    <span
                      className="text-3xl md:text-4xl font-black leading-none tabular-nums"
                      style={{ fontFamily: "var(--font-outfit)", color: stat.color }}
                    >
                      {stat.num}
                    </span>
                    <h3
                      className="text-xl md:text-2xl font-black"
                      style={{ fontFamily: "var(--font-noto-serif), serif" }}
                    >
                      {stat.label}
                    </h3>
                  </div>
                  <p
                    className="text-sm leading-relaxed text-[#4A5060]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-[#D41E28] text-white px-6 py-4">
              <p
                className="text-center text-base md:text-lg font-black"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                4 指標の合計ポイントが、毎月の総合順位を決める。
              </p>
            </div>
          </section>

          {/* PLAYER / PIT */}
          <section>
            <SectionHeading
              title="PLAYER と PIT"
              eyebrow="ROLES"
              accent="red"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-[3px] border-[#111]">
              <div className="bg-[#D41E28] text-white px-6 py-8 md:px-8 md:py-10 md:border-r-[3px] md:border-[#111]">
                <div className="flex items-baseline gap-3 mb-5">
                  <span
                    className="text-5xl md:text-7xl font-black leading-none tabular-nums"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    1-6
                  </span>
                  <span
                    className="text-lg md:text-xl font-bold"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    位
                  </span>
                </div>
                <p
                  className="text-xs font-black tracking-[0.3em] mb-3"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  PLAYER
                </p>
                <ul
                  className="space-y-2 text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  <li>— メインステージに立つ権利を持つ</li>
                  <li>—「かけっこ！」の正規メンバーとして活動</li>
                  <li>— 優先的な露出・企画参加の機会</li>
                  <li>— 成績が落ちれば、翌月は PIT に降格</li>
                </ul>
              </div>
              <div className="bg-[#111111] text-[#F5F1E8] px-6 py-8 md:px-8 md:py-10 border-t-[3px] border-[#111] md:border-t-0">
                <div className="flex items-baseline gap-3 mb-5">
                  <span
                    className="text-5xl md:text-7xl font-black leading-none tabular-nums"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    7-12
                  </span>
                  <span
                    className="text-lg md:text-xl font-bold"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    位
                  </span>
                </div>
                <p
                  className="text-xs font-black tracking-[0.3em] mb-3 text-[#FFE600]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  PIT
                </p>
                <ul
                  className="space-y-2 text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  <li>— 次のチャンスに向けて準備する期間</li>
                  <li>— 個人配信や企画で巻き返しを図る</li>
                  <li>— ファンの応援がダイレクトに順位に影響</li>
                  <li>— 成績次第で、翌月は PLAYER に昇格</li>
                </ul>
              </div>
            </div>

            {/* PASS LINE 装飾 */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-[#111]" aria-hidden />
              <div className="bg-[#D41E28] text-white px-4 py-1">
                <span
                  className="text-xs font-black tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  — PASS LINE — 6位 / 7位 の境界 —
                </span>
              </div>
              <div className="flex-1 h-px bg-[#111]" aria-hidden />
            </div>
            <p
              className="mt-5 text-center text-sm text-[#4A5060]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              毎月の成績で全員のポジションが変わる。<br />
              固定チームではなく、競争が生むドラマ。
            </p>
          </section>

          {/* 月1特番 */}
          <section>
            <SectionHeading
              title="月末 特番"
              eyebrow="MONTHLY FINAL"
              accent="red"
            />
            <p
              className="text-base md:text-lg leading-relaxed text-[#111] max-w-3xl mb-6"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              毎月末、メンバー全員が集合する特別配信番組。ここで月間の戦いが最終確定し、翌月の PLAYER / PIT 編成が発表される。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-[3px] border-[#111]">
              {[
                { num: "01", label: "振り返り", desc: "4 指標の推移と順位変動を全員で確認" },
                { num: "02", label: "最終決戦", desc: "最終順位に影響する特別企画を実施" },
                { num: "03", label: "新編成", desc: "PLAYER 6 名 / PIT 6 名が決定、翌月スタート" },
              ].map((item) => (
                <div
                  key={item.num}
                  className="border-b-[3px] border-[#111] md:border-b-0 md:border-r-[3px] md:last:border-r-0 px-6 py-8"
                >
                  <span
                    className="text-5xl font-black leading-none tabular-nums text-[#D41E28]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {item.num}
                  </span>
                  <h3
                    className="mt-4 text-xl font-black text-[#111]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    {item.label}
                  </h3>
                  <p
                    className="mt-2 text-sm text-[#4A5060]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 最後に勝ち取るもの */}
          <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-12 md:py-16 text-center overflow-hidden">
            <p
              className="text-xs font-black tracking-[0.35em] text-[#FFE600] mb-4"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              LAST STOP
            </p>
            <h2
              className="text-3xl md:text-5xl font-black leading-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              勝ち取るのは、<br />
              <span className="text-[#D41E28]">「次の主役」という未来。</span>
            </h2>
            <p
              className="mt-6 text-sm md:text-base leading-relaxed max-w-xl mx-auto text-[#9BA8BF]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              数字で証明し、ファンに選ばれ、ステージの中央に立つ。<br />
              順位でも、称号でもなく、次の主役になる権利を賭けた戦い。
            </p>
          </section>

          {/* CTA */}
          <section className="text-center">
            <Link
              href="/members"
              className="inline-flex items-center gap-3 bg-[#D41E28] text-white px-10 py-4 text-lg font-black hover:translate-y-[-2px] transition-transform"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              メンバーを見る →
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
