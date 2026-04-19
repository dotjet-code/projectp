import { TornDivider } from "@/components/torn-divider";

export function MissionStatement() {
  return (
    <section className="relative bg-[#111] text-[#F5F1E8] overflow-hidden">
      {/* ハーフトーン背景 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, #F5F1E8 0.7px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
        aria-hidden
      />
      {/* 上端 ビネット */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-[960px] mx-auto px-6 py-20 md:py-32">
        {/* セクションラベル */}
        <div className="flex items-center gap-3 mb-12 md:mb-16">
          <span className="inline-block w-2 h-2 bg-[#D41E28] animate-pulse" />
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.4em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            MANIFESTO
          </p>
          <span className="flex-1 h-px bg-[#F5F1E8]/30" aria-hidden />
          <p
            className="text-[10px] font-bold tracking-[0.3em] text-[#F5F1E8]/60"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ 君へ
          </p>
        </div>

        <div
          className="space-y-10 md:space-y-14"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {/* 1. 必要なのは、お金じゃない。 */}
          <p className="text-3xl md:text-5xl font-black leading-[1.4] tracking-tight">
            必要なのは、
            <span className="relative inline-block">
              <span
                className="absolute inset-0 text-[#D41E28]"
                style={{ transform: "translate(2px, 2px)", opacity: 0.55 }}
                aria-hidden
              >
                お金じゃない
              </span>
              <span className="relative">お金じゃない</span>
            </span>
            。
          </p>

          {/* 2. かけるべきは覚悟 */}
          <p className="text-xl md:text-3xl font-black leading-[1.55] text-[#F5F1E8]/95">
            あなたがかけるべきは、
            <br />
            この子たちの運命を
            <br className="hidden md:block" />
            <span
              className="inline-block mt-1 md:mt-2 text-2xl md:text-4xl"
              style={{
                borderBottom: "6px solid #D41E28",
                paddingBottom: "2px",
              }}
            >
              最後まで見届ける覚悟。
            </span>
          </p>

          {/* 3. 覚悟はできましたか？ クライマックス */}
          <div className="py-6 md:py-10">
            <p
              className="relative inline-block text-4xl md:text-7xl font-black leading-[1.1] tracking-[-0.02em]"
              aria-label="覚悟はできましたか？"
            >
              <span
                aria-hidden
                className="absolute inset-0 text-[#1CB4AF]"
                style={{ transform: "translate(-3px, -3px)", opacity: 0.5 }}
              >
                覚悟は、できましたか？
              </span>
              <span
                aria-hidden
                className="absolute inset-0 text-[#D41E28]"
                style={{ transform: "translate(4px, 4px)", opacity: 0.6 }}
              >
                覚悟は、できましたか？
              </span>
              <span className="relative">覚悟は、できましたか？</span>
            </p>
            {/* 不規則アンダーライン */}
            <div className="mt-4 max-w-[280px]">
              <TornDivider
                variant="both"
                height={8}
                color="#D41E28"
                shadow={false}
              />
            </div>
          </div>

          {/* 4. このページは、無料で投票できる */}
          <p className="text-lg md:text-2xl font-bold leading-[1.8] text-[#F5F1E8]/85">
            このページは、
            <span className="text-[#F5F1E8] font-black">次の主役候補</span>
            に
            <span className="inline-block mx-1 px-2 py-0.5 bg-[#D41E28] text-white text-base md:text-xl font-black tracking-wider align-middle">
              無料
            </span>
            で投票できるページです。
          </p>

          {/* 5. あなたの一票が、 */}
          <p className="text-2xl md:text-4xl font-black leading-[1.55]">
            あなたの
            <span
              className="relative inline-block px-1"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, rgba(212,30,40,0.6) 60%)",
              }}
            >
              一票
            </span>
            が、
            <br />
            彼女たちの
            <span className="underline decoration-[#D41E28] decoration-[3px] underline-offset-[6px]">
              順位
            </span>
            も、
            <span className="underline decoration-[#D41E28] decoration-[3px] underline-offset-[6px]">
              物語
            </span>
            も、
            <br className="hidden md:block" />
            <span className="text-[#F5F1E8]">動かしていく。</span>
          </p>
        </div>

        {/* 末尾の署名ライン */}
        <div className="mt-14 md:mt-20 flex items-center gap-3">
          <span className="flex-1 h-px bg-[#F5F1E8]/40" aria-hidden />
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.35em] text-[#F5F1E8]/70"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ PROJECT　KAKEAGARI━
          </p>
          <span className="flex-1 h-px bg-[#F5F1E8]/40" aria-hidden />
        </div>
      </div>
    </section>
  );
}
