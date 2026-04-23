"use client";

import Link from "next/link";

function Section({
  num,
  eyebrow,
  title,
  children,
}: {
  num: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 md:mb-16">
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="inline-flex w-10 h-10 items-center justify-center bg-[#111] text-[#FFE600] text-base font-black shrink-0"
          style={{
            fontFamily: "var(--font-outfit)",
            boxShadow: "3px 3px 0 rgba(17,17,17,0.2)",
          }}
        >
          {num}
        </span>
        <div>
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ {eyebrow}
          </p>
          <h2
            className="mt-1 text-xl md:text-3xl font-black text-[#111] leading-tight"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {title}
          </h2>
        </div>
      </div>
      <div className="ml-0 md:ml-14 mt-4">{children}</div>
    </section>
  );
}

function Big({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-base md:text-lg leading-relaxed text-[#111] mb-3"
      style={{ fontFamily: "var(--font-noto-serif), serif" }}
    >
      {children}
    </p>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative inline-block px-1"
      style={{
        background: "linear-gradient(180deg, transparent 60%, #FFE600 60%)",
      }}
    >
      {children}
    </span>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 md:gap-4 py-3 border-b border-[#111]/15 last:border-b-0">
      <div
        className="flex w-10 h-10 md:w-12 md:h-12 shrink-0 items-center justify-center bg-[#D41E28] text-white text-base md:text-lg font-black"
        style={{
          fontFamily: "var(--font-outfit)",
          boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
        }}
      >
        {num}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className="text-sm md:text-base font-black text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {title}
        </p>
        <p
          className="text-xs md:text-sm text-[#4A5060] mt-1 leading-relaxed"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <div className="bg-white border-l-4 border-[#D41E28] px-4 py-3 mb-2">
      <p
        className="text-sm font-black text-[#111]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        <span className="text-[#D41E28] mr-1">Q.</span>
        {q}
      </p>
      <p
        className="text-xs md:text-sm text-[#4A5060] mt-1 leading-relaxed"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        <span className="text-[#4A5060] mr-1 font-black">A.</span>
        {a}
      </p>
    </div>
  );
}

function Callout({
  tone = "yellow",
  children,
}: {
  tone?: "yellow" | "teal";
  children: React.ReactNode;
}) {
  const cls =
    tone === "teal"
      ? "bg-[#1CB4AF] text-white border-[#111]"
      : "bg-[#FFE600] text-[#111] border-[#D41E28]";
  return (
    <div className={`${cls} border-l-4 px-4 py-3 mt-3`}>
      <p
        className="text-xs md:text-sm leading-relaxed font-bold"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {children}
      </p>
    </div>
  );
}

export function GuideClient() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-4 pt-12 md:pt-16 pb-6">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="inline-block w-2 h-2 bg-[#D41E28]" />
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ かけあがりガイド
          </p>
          <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
        </div>
        <h1
          className="text-3xl md:text-5xl font-black leading-tight text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          3 分で分かる、
          <br />
          <Highlight>かけあがり！ガイド</Highlight>
        </h1>
        <p
          className="mt-5 text-sm md:text-base text-[#4A5060] leading-relaxed max-w-2xl"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          かけあがり！は、<b className="text-[#111]">メンバーがバトルステージごとに数字で競い合う</b>
          競争型エンタメ。あなたは <b className="text-[#D41E28]">推しを押し上げるファン</b> として参加できる。
        </p>
        <div
          className="mt-4 h-2 max-w-[220px] bg-[#D41E28]"
          style={{
            clipPath:
              "polygon(0 60%, 4% 20%, 10% 70%, 18% 30%, 28% 65%, 38% 25%, 48% 70%, 58% 30%, 68% 68%, 78% 28%, 86% 70%, 94% 34%, 100% 66%, 100% 100%, 0 100%)",
          }}
          aria-hidden
        />
      </section>

      {/* 目次 */}
      <section className="max-w-[1100px] mx-auto px-4 mb-10">
        <div
          className="bg-white border-2 border-[#111] p-4 md:p-5"
          style={{ boxShadow: "4px 4px 0 rgba(17,17,17,0.18)" }}
        >
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.3em] text-[#4A5060] mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ このページでわかること
          </p>
          <ol
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm md:text-base text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            <li className="flex gap-2">
              <span className="text-[#D41E28] font-black">01</span>
              <a href="#about" className="hover:underline">
                かけあがり！とは?
              </a>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D41E28] font-black">02</span>
              <a href="#cycle" className="hover:underline">
                バトルステージのサイクル
              </a>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D41E28] font-black">03</span>
              <a href="#fan" className="hover:underline">
                ファンの遊び方
              </a>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D41E28] font-black">04</span>
              <a href="#score" className="hover:underline">
                予想スコアの早見
              </a>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D41E28] font-black">05</span>
              <a href="#live" className="hover:underline">
                ライブで応援する
              </a>
            </li>
            <li className="flex gap-2">
              <span className="text-[#D41E28] font-black">06</span>
              <a href="#faq" className="hover:underline">
                よくある質問
              </a>
            </li>
          </ol>
        </div>
      </section>

      {/* 本文 */}
      <div className="mx-auto max-w-[760px] px-4">
        <div id="about" className="scroll-mt-24">
          <Section num="01" eyebrow="WHAT IS IT" title="かけあがり！とは?">
            <Big>
              <Highlight>バズ・配信・収支・投票</Highlight>
              の 4 指標でポイントを積み上げ、競い合う競争型エンタメ。
            </Big>
            <Big>
              上位 6 名が <b className="text-[#D41E28]">PLAYER</b>（そのバトルステージの主役）。残りは
              <b> PIT</b>（待機組）。
              バトルステージ閉幕後はまた 0 から — 誰でも駆け上がれる。
            </Big>

            <div
              className="mt-5 bg-[#FFE600] border-2 border-[#111] p-4"
              style={{ boxShadow: "3px 3px 0 rgba(17,17,17,0.18)" }}
            >
              <p
                className="text-[10px] font-black tracking-[0.3em] text-[#D41E28] mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ バトルステージとは?
              </p>
              <p
                className="text-sm md:text-base text-[#111] leading-relaxed"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <b>1 つの「バトルステージ」は約 1 ヶ月の競争期間。</b>
                バトルステージの中で全員がポイントを積み上げ、閉幕特番で最終順位が確定する。
                その結果で、<b>次のバトルステージ</b>の PLAYER / PIT が決まる。
              </p>
            </div>
          </Section>
        </div>

        <div id="cycle" className="scroll-mt-24">
          <Section num="02" eyebrow="STAGE CYCLE" title="バトルステージのサイクル">
            <div className="space-y-1">
              <div className="bg-[#D41E28] text-white px-4 py-2 text-center text-sm font-black">
                バトルステージ開幕（約 1 ヶ月）
              </div>
              <div className="flex justify-center py-1">
                <span className="text-[#D41E28] text-lg font-black">↓</span>
              </div>
              <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs md:text-sm text-[#111]">
                メンバー活動 → バズ・配信・収支を積み上げる
              </div>
              <div className="flex justify-center py-1">
                <span className="text-[#D41E28] text-lg font-black">↓</span>
              </div>
              <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs md:text-sm text-[#111]">
                ファンが毎日の賽 + 順位予想を提出
              </div>
              <div className="flex justify-center py-1">
                <span className="text-[#D41E28] text-lg font-black">↓</span>
              </div>
              <div className="bg-white border border-[#111] px-4 py-2 text-center text-xs md:text-sm text-[#111]">
                ライブイベントで来場者投票
              </div>
              <div className="flex justify-center py-1">
                <span className="text-[#D41E28] text-lg font-black">↓</span>
              </div>
              <div className="bg-[#111] text-[#FFE600] px-4 py-2 text-center text-sm font-black">
                閉幕特番 → 最終順位確定 → 的中景品 → 次バトルステージへ
              </div>
            </div>
          </Section>
        </div>

        <div id="fan" className="scroll-mt-24">
          <Section num="03" eyebrow="HOW TO PLAY" title="ファンの遊び方">
            <Big>
              やることはシンプル。<Highlight>5 ステップ</Highlight>だけ。
            </Big>
            <div
              className="mt-2 bg-white border-2 border-[#111]"
              style={{ boxShadow: "4px 4px 0 rgba(17,17,17,0.18)" }}
            >
              <div className="p-4 md:p-5">
                <Step
                  num={1}
                  title="会員になる（無料）"
                  desc={
                    <>
                      メアドだけで OK。右上の「会員ログイン」からメールを送信 → 届いたリンクをタップで完了。
                    </>
                  }
                />
                <Step
                  num={2}
                  title="推しを選ぶ"
                  desc="メンバーのなかから 1 人、タップで決めるだけ。以降の賽は自動で推しに入る。"
                />
                <Step
                  num={3}
                  title="毎日の賽を振る（無料・1 日 1 回）"
                  desc={
                    <>
                      サイコロで 1〜100 票を獲得。<b className="text-[#D41E28]">ピンゾロ (1-1-1) で 100 票</b>。
                      推しを一気に押し上げられる。
                    </>
                  }
                />
                <Step
                  num={4}
                  title="順位予想を提出"
                  desc={
                    <>
                      6 種類の賭式（単勝〜三連単）で順位を当てる。
                      <b>最大 63 pt</b>。途中保存できるので締切前までに仕上げれば OK。
                    </>
                  }
                />
                <Step
                  num={5}
                  title="結果を見て景品を受け取る"
                  desc={
                    <>
                      閉幕特番で採点 → マイページに赤バッジがついたら景品アリ。QR を会場で見せるか、
                      ライブ投票の時に自動適用される。
                    </>
                  }
                />
              </div>
            </div>
            <Callout>
              💡 <b>途中で離れても大丈夫。</b> 選んだ予想は自動保存。ログインしなおして続きから提出できる。
            </Callout>
          </Section>
        </div>

        <div id="score" className="scroll-mt-24">
          <Section num="04" eyebrow="SCORING" title="予想スコアの早見">
            <Big>
              6 種類の賭式。的中した分だけ <b className="text-[#D41E28]">最大 63 pt</b>。
            </Big>
            <div className="space-y-1.5">
              {[
                { name: "複勝", desc: "3 着以内に入る 1 名を予想", pts: 1 },
                { name: "単勝", desc: "1 着を予想", pts: 2 },
                { name: "二連複", desc: "1-2 着の 2 名を順不同で", pts: 5 },
                { name: "二連単", desc: "1-2 着を順番通りに", pts: 10 },
                { name: "三連複", desc: "1-3 着の 3 名を順不同で", pts: 15 },
                { name: "三連単", desc: "1-3 着を順番通りに", pts: 30 },
              ].map((b) => (
                <div
                  key={b.name}
                  className="flex items-center justify-between bg-white border border-[#111]/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <span
                      className="text-sm md:text-base font-black text-[#111]"
                      style={{ fontFamily: "var(--font-noto-serif), serif" }}
                    >
                      {b.name}
                    </span>
                    <span className="text-[10px] md:text-xs text-[#4A5060] ml-2">
                      {b.desc}
                    </span>
                  </div>
                  <span
                    className="text-sm md:text-base font-black text-[#D41E28] tabular-nums shrink-0 ml-2"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    +{b.pts}pt
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div id="live" className="scroll-mt-24">
          <Section num="05" eyebrow="LIVE" title="ライブで応援する">
            <Big>
              会場に行くと、その場で<Highlight>来場者投票</Highlight>に参加できる。
            </Big>
            <div
              className="bg-white border-2 border-[#111] p-4 md:p-5"
              style={{ boxShadow: "4px 4px 0 rgba(17,17,17,0.18)" }}
            >
              <Step num={1} title="会場で PJ-XXXX コードをもらう" desc="入場時に 4 桁のコードが書かれた紙が配られる。" />
              <Step num={2} title="投票ページでコードを入力" desc="スマホで投票ページを開き、コードを入れると投票可能に。" />
              <Step num={3} title="応援したいメンバーに投票" desc="チケット数分だけ投票できる。同じ人に複数票入れても OK。" />
            </div>
            <Callout tone="teal">
              🎯 <b>予想ボーナス:</b> ファン会員としてログイン中なら、通算スコアに応じて票数が 2 倍 / 3 倍に。
              投票ボーナス景品を持っていればさらに +1 倍！
            </Callout>
          </Section>
        </div>

        <div id="faq" className="scroll-mt-24">
          <Section num="06" eyebrow="FAQ" title="よくある質問">
            <FAQ
              q="会員登録は本当に無料?"
              a="完全無料です。メアドだけで登録でき、課金要素はありません。"
            />
            <FAQ
              q="予想は何回でも変えられる?"
              a="締切前なら何度でも上書きできます。締切を過ぎると変更不可です。"
            />
            <FAQ
              q="推しは途中で変えられる?"
              a="変えられます。「あなたの推し」バナーの『解除』から設定し直してください。"
            />
            <FAQ
              q="景品に有効期限はある?"
              a={
                <>
                  景品ごとに期限があります。マイページで確認できます。期限切れは使えないので、早めに受け取りに来てください。
                </>
              }
            />
            <FAQ
              q="退会したい"
              a="マイページの一番下「退会する」から手続きできます。予想履歴と景品はすべて削除されます。"
            />
          </Section>
        </div>

        {/* CTA */}
        <section className="mb-16 text-center">
          <p
            className="text-sm md:text-base text-[#4A5060] mb-4"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            読んだら、あとは参加するだけ。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#D41E28] text-white px-6 py-3 text-sm md:text-base font-black transition-transform active:translate-y-0.5"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "4px 4px 0 rgba(17,17,17,0.22)",
            }}
          >
            トップへ戻って参加する →
          </Link>
        </section>

        {/* Backstage link (小さく、運営関係者向け) */}
        <section className="mb-10 pt-6 border-t border-[#111]/20 text-center">
          <p
            className="text-[10px] tracking-[0.2em] text-[#4A5060]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            MEMBER / STAFF / ADMIN
          </p>
          <Link
            href="/backstage/guide"
            className="inline-block mt-1 text-xs text-[#4A5060] hover:text-[#111] underline-offset-2 hover:underline"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            バックステージ ガイド →
          </Link>
        </section>
      </div>
    </div>
  );
}
