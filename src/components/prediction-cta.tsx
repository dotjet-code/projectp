import Link from "next/link";

export interface PredictionCTAProps {
  /** 上の小ラベル (例: 「━ YOUR TURN」) */
  eyebrow?: string;
  /** メイン煽りコピー (ReactNode 可) */
  headline?: React.ReactNode;
  /** ボタン文言 (例: 「今すぐ予想する」) */
  label?: string;
  /** ボタン下のサブ文言 */
  sub?: string;
  /** 朱印に出る短い英字 */
  stampText?: string;
  /** トーン: 黒地(default) or 赤地 or クリーム地 */
  variant?: "black" | "red" | "cream";
  /** 余白 (上下のセクション padding) */
  spacing?: "compact" | "normal";
}

const STAMP_CLIP =
  "polygon(3% 8%, 12% 2%, 28% 5%, 42% 0%, 58% 4%, 74% 1%, 88% 5%, 100% 12%, 97% 28%, 100% 42%, 96% 58%, 100% 72%, 96% 88%, 88% 100%, 72% 96%, 58% 100%, 42% 96%, 28% 100%, 12% 97%, 2% 88%, 0 72%, 4% 58%, 0 42%, 4% 28%, 0 12%)";

export function PredictionCTA({
  eyebrow = "━ YOUR TURN",
  headline,
  label = "今すぐ予想する",
  sub = "無料 · 登録不要 · 1分で完了",
  stampText = "FREE",
  variant = "black",
  spacing = "normal",
}: PredictionCTAProps) {
  const palette = {
    black: {
      bg: "#111111",
      fg: "#F5F1E8",
      btnBg: "#D41E28",
      btnFg: "#FFFFFF",
      accent: "#FFE600",
    },
    red: {
      bg: "#D41E28",
      fg: "#F5F1E8",
      btnBg: "#111111",
      btnFg: "#FFE600",
      accent: "#F5F1E8",
    },
    cream: {
      bg: "#F5F1E8",
      fg: "#111111",
      btnBg: "#D41E28",
      btnFg: "#FFFFFF",
      accent: "#111111",
    },
  }[variant];

  const py = spacing === "compact" ? "py-10 md:py-14" : "py-16 md:py-20";

  return (
    <section
      className={`relative overflow-hidden ${py}`}
      style={{ backgroundColor: palette.bg, color: palette.fg }}
    >
      {/* ハーフトーン背景 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle, ${palette.fg} 0.7px, transparent 1px)`,
          backgroundSize: "7px 7px",
        }}
        aria-hidden
      />

      <div className="relative max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        {/* 左: 煽りコピー */}
        <div className="text-center md:text-left">
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.4em]"
            style={{
              fontFamily: "var(--font-outfit)",
              color: palette.btnBg,
            }}
          >
            {eyebrow}
          </p>
          <div
            className="mt-2 text-2xl md:text-4xl font-black leading-tight"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {headline ?? (
              <p>
                次の主役を、
                <br className="md:hidden" />
                <span
                  className="relative inline-block"
                  style={{
                    background: `linear-gradient(180deg, transparent 60%, ${palette.btnBg} 60%)`,
                    paddingInline: "4px",
                  }}
                >
                  君が決める
                </span>
                。
              </p>
            )}
          </div>
        </div>

        {/* 右: ボタン本体 */}
        <div className="relative shrink-0">
          {/* 朱印「FREE」 */}
          <div
            className="absolute -top-5 -right-5 z-10 flex items-center justify-center select-none"
            style={{
              width: 60,
              height: 60,
              backgroundColor: palette.accent,
              color: palette.bg,
              clipPath: STAMP_CLIP,
              transform: "rotate(12deg)",
              boxShadow: "3px 3px 0 rgba(17,17,17,0.25)",
              fontFamily: "var(--font-outfit)",
            }}
            aria-hidden
          >
            <span className="text-[14px] font-black tracking-wider">{stampText}</span>
          </div>

          <Link
            href="/prediction"
            className="group relative inline-flex items-center gap-3 px-7 py-4 md:px-10 md:py-5 font-black transition-transform active:translate-y-0.5"
            style={{
              backgroundColor: palette.btnBg,
              color: palette.btnFg,
              boxShadow: "6px 6px 0 rgba(17,17,17,0.25)",
              fontFamily: "var(--font-noto-serif), serif",
            }}
          >
            <span className="text-xl md:text-2xl tracking-wide">{label}</span>
            <span
              className="text-2xl md:text-3xl leading-none transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </Link>

          {sub && (
            <p
              className="mt-3 text-center text-[11px] md:text-xs font-bold tracking-[0.18em]"
              style={{
                fontFamily: "var(--font-outfit)",
                color: palette.fg,
                opacity: 0.8,
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
