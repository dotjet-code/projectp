import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const pMeanings = [
  { word: "Pass Line", desc: "再編成ライン。6位と7位の境界が、来月の運命を分ける。" },
  { word: "Pole Position", desc: "1位。最も多くのポイントを積み上げた者だけが立てる場所。" },
  { word: "Pride", desc: "誇り。ステージに立つ者の覚悟と、そこを目指す者の意地。" },
  { word: "Penalty", desc: "代償。下位に落ちれば、主役の座を手放すことになる。" },
  { word: "Project", desc: "企画そのもの。12人の競争が生み出す、終わりのないドラマ。" },
];

function SectionBlock({
  icon,
  title,
  titleColor,
  accentFrom,
  accentTo,
  children,
}: {
  icon: string;
  title: string;
  titleColor: string;
  accentFrom: string;
  accentTo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 first:mt-0">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="h-8 w-1.5 rounded-full"
          style={{ backgroundImage: `linear-gradient(to bottom, ${accentFrom}, ${accentTo})` }}
        />
        <h2
          className="font-[family-name:var(--font-outfit)] text-lg sm:text-xl font-extrabold tracking-tight"
          style={{ color: titleColor }}
        >
          {icon} {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="pt-10 pb-8 text-center bg-gradient-to-b from-[#e0f7fa]/50 to-transparent">
          <p className="text-4xl mb-2">📖</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            Project P とは？
          </h1>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            12人が数字で競い、主役の座を勝ち取る。それが Project P のすべて。
          </p>
        </section>

        <div className="mx-auto max-w-[720px] px-4">

          {/* 概要 */}
          <SectionBlock icon="🎯" title="Project P の概要" titleColor="#007595" accentFrom="#00d3f3" accentTo="#00bcff">
            <div className="rounded-2xl bg-white/70 border border-white/80 p-5 sm:p-6 shadow-sm">
              <p className="text-sm leading-relaxed text-foreground">
                Project P は、12人のメンバーが毎月の成績で競い合い、上位6名が「PLAYER」として次のメインステージに立つ権利を得る競争型エンタメプロジェクトです。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                固定チームではありません。毎月の成績でポジションが入れ替わり、誰もが主役になれる可能性と、主役を失うリスクを同時に抱えています。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                勝ち取った6名は、「かけっこ！」のメインメンバーとしてステージに立ちます。
              </p>
            </div>
          </SectionBlock>

          {/* 3ポイント */}
          <SectionBlock icon="📊" title="3つの競争指標" titleColor="#007595" accentFrom="#00d3f3" accentTo="#2b7fff">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "バズ", icon: "🔥", desc: "SNSでの話題性、動画再生数、トレンド力。注目を集めた者が勝つ。", color: "from-primary/10 to-primary-cyan/10", border: "border-primary/15" },
                { label: "同接", icon: "📡", desc: "配信の同時接続数。リアルタイムでファンを動かせるかが問われる。", color: "from-primary-blue/10 to-[#5b9bff]/10", border: "border-primary-blue/15" },
                { label: "収支", icon: "💰", desc: "グッズ・投げ銭・チケットなどの経済指標。応援が数字になる。", color: "from-purple/10 to-[#c27aff]/10", border: "border-purple/15" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-2xl border bg-gradient-to-br ${stat.color} ${stat.border} p-5`}>
                  <p className="text-2xl mb-2">{stat.icon}</p>
                  <h3 className="text-base font-bold text-foreground mb-1">{stat.label}</h3>
                  <p className="text-xs text-muted leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-[rgba(206,250,254,0.5)] bg-gradient-to-r from-[rgba(236,254,255,0.8)] to-[rgba(240,249,255,0.8)] px-5 py-4">
              <p className="text-sm font-bold text-primary-dark text-center">
                3指標の合計ポイントが、毎月の総合順位を決める
              </p>
            </div>
          </SectionBlock>

          {/* 月1特番 */}
          <SectionBlock icon="🎬" title="月1特番" titleColor="#7008e7" accentFrom="#a684ff" accentTo="#c27aff">
            <div className="rounded-2xl bg-white/70 border border-white/80 p-5 sm:p-6 shadow-sm">
              <p className="text-sm leading-relaxed text-foreground">
                毎月末、12人全員が集合する特別配信番組が行われます。ここで月間の戦いが最終確定し、翌月のPLAYER / PIT編成が発表されます。
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: "1", label: "月間成績の振り返り", desc: "3指標の推移と順位変動を全員で確認" },
                  { step: "2", label: "特番内での勝負", desc: "最終順位に影響する特別企画を実施" },
                  { step: "3", label: "翌月編成の発表", desc: "PLAYER 6名 / PIT 6名が決定" },
                ].map((item) => (
                  <div key={item.step} className="rounded-xl bg-[rgba(237,233,254,0.5)] p-4 text-center">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-r from-purple to-[#c27aff] text-xs font-bold text-white font-[family-name:var(--font-outfit)]">
                      {item.step}
                    </span>
                    <p className="mt-2 text-sm font-bold text-foreground">{item.label}</p>
                    <p className="mt-1 text-xs text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionBlock>

          {/* PLAYER / PIT */}
          <SectionBlock icon="⚡" title="PLAYER と PIT" titleColor="#bb4d00" accentFrom="#ffb900" accentTo="#fdc700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-primary-blue/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-gradient-to-r from-player to-player-end px-3 py-0.5 text-[11px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">
                    PLAYER
                  </span>
                  <span className="text-sm font-bold text-foreground">上位6名</span>
                </div>
                <ul className="space-y-2 text-xs text-muted leading-relaxed">
                  <li>• メインステージに立つ権利を持つ</li>
                  <li>• 「かけっこ！」の正規メンバーとして活動</li>
                  <li>• 優先的な露出・企画参加の機会</li>
                  <li>• 成績が落ちれば、翌月はPITに降格</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-pit/15 bg-gradient-to-br from-pit/10 to-pit-end/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-gradient-to-r from-pit to-pit-end px-3 py-0.5 text-[11px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">
                    PIT
                  </span>
                  <span className="text-sm font-bold text-foreground">下位6名</span>
                </div>
                <ul className="space-y-2 text-xs text-muted leading-relaxed">
                  <li>• 次のチャンスに向けて準備する期間</li>
                  <li>• 個人配信や企画で巻き返しを図る</li>
                  <li>• ファンの応援がダイレクトに順位に影響</li>
                  <li>• 成績次第で、翌月はPLAYERに昇格</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 relative">
              <div className="border-t-2 border-dashed border-reorg" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 rounded-full bg-gradient-to-r from-pit to-pit-end px-4 py-1 text-[11px] font-bold text-white tracking-wider shadow-[0_1px_3px_#fee685]">
                ⚡ 再編成ライン（6位 / 7位の境界）⚡
              </span>
            </div>
            <p className="mt-6 text-center text-xs text-muted">
              毎月の成績で全員のポジションが変わる。固定チームではなく、競争が生むドラマ。
            </p>
          </SectionBlock>

          {/* P の意味 */}
          <SectionBlock icon="🔤" title="P が持つ意味" titleColor="#007595" accentFrom="#00d3f3" accentTo="#2b7fff">
            <div className="rounded-2xl bg-white/70 border border-white/80 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4">
                {pMeanings.map((item) => (
                  <div key={item.word} className="flex items-start gap-4">
                    <span className="shrink-0 font-[family-name:var(--font-outfit)] text-sm font-black text-primary-dark w-32 sm:w-36">
                      {item.word}
                    </span>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionBlock>

          {/* 最後に勝ち取るもの */}
          <section className="mt-14">
            <div className="rounded-2xl bg-gradient-to-r from-[#fef9c3] via-[#fef3c6] to-[#fef9c3] border border-[#fde68a]/50 p-6 sm:p-8 text-center">
              <p className="text-4xl mb-3">👑</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                最後に勝ち取るもの
              </h2>
              <p className="mt-3 text-sm text-muted leading-relaxed max-w-md mx-auto">
                数字で証明し、ファンに選ばれ、ステージの中央に立つ。
                <br />
                Project P で勝ち取るのは、順位でも称号でもなく、
                <br />
                <span className="font-bold text-foreground">「次の主役」という未来</span>です。
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-10 text-center">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-blue px-8 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)] transition-all"
            >
              👥 メンバーを見る →
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
