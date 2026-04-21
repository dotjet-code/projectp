"use client";

export interface ChinchiroCTAProps {
  eyebrow?: string;
  headline?: React.ReactNode;
  label?: string;
  sub?: string;
  stampText?: string;
  spacing?: "compact" | "normal";
}

const STAMP_CLIP =
  "polygon(3% 8%, 12% 2%, 28% 5%, 42% 0%, 58% 4%, 74% 1%, 88% 5%, 100% 12%, 97% 28%, 100% 42%, 96% 58%, 100% 72%, 96% 88%, 88% 100%, 72% 96%, 58% 100%, 42% 96%, 28% 100%, 12% 97%, 2% 88%, 0 72%, 4% 58%, 0 42%, 4% 28%, 0 12%)";

export function ChinchiroCTA({
  eyebrow = "━ 今日の賽",
  headline,
  label = "今すぐ振る",
  sub = "1日1回 · 無料 · ピンゾロで100票",
  stampText = "FREE",
  spacing = "compact",
}: ChinchiroCTAProps) {
  const py = spacing === "compact" ? "py-10 md:py-14" : "py-16 md:py-20";

  const handleClick = () => {
    window.dispatchEvent(new Event("chinchiro:open"));
  };

  return (
    <section
      className={`relative overflow-hidden ${py}`}
      style={{ backgroundColor: "#F5F1E8", color: "#111111" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, #111111 0.7px, transparent 1px)",
          backgroundSize: "7px 7px",
        }}
        aria-hidden
      />

      <div className="relative max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        <div className="text-center md:text-left">
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.4em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {eyebrow}
          </p>
          <div
            className="mt-2 text-2xl md:text-4xl font-black leading-tight"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {headline ?? (
              <p>
                推しを選んで、
                <br className="md:hidden" />
                <span
                  className="relative inline-block"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 60%, #D41E28 60%)",
                    paddingInline: "4px",
                    color: "#F5F1E8",
                  }}
                >
                  賽を振れ
                </span>
                。
              </p>
            )}
          </div>
        </div>

        <div className="relative shrink-0">
          <div
            className="absolute -top-5 -right-5 z-10 flex items-center justify-center select-none"
            style={{
              width: 60,
              height: 60,
              backgroundColor: "#111111",
              color: "#FFE600",
              clipPath: STAMP_CLIP,
              transform: "rotate(12deg)",
              boxShadow: "3px 3px 0 rgba(17,17,17,0.25)",
              fontFamily: "var(--font-outfit)",
            }}
            aria-hidden
          >
            <span className="text-[14px] font-black tracking-wider">
              {stampText}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClick}
            className="group relative inline-flex items-center gap-3 px-7 py-4 md:px-10 md:py-5 font-black transition-transform active:translate-y-0.5"
            style={{
              backgroundColor: "#D41E28",
              color: "#FFFFFF",
              boxShadow: "6px 6px 0 rgba(17,17,17,0.25)",
              fontFamily: "var(--font-noto-serif), serif",
            }}
          >
            <span className="text-xl md:text-2xl tracking-wide">🎲 {label}</span>
            <span
              className="text-2xl md:text-3xl leading-none transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </button>

          {sub && (
            <p
              className="mt-3 text-center text-[11px] md:text-xs font-bold tracking-[0.18em] opacity-80"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
