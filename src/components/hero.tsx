import Image from "next/image";

export interface HeroProps {
  stageLabel?: string;
  headline?: string;
  subtitle?: string;
  grade?: "S" | "A" | "B" | "C" | "D" | "E";
  /** nanobanana 等で生成した背景アート画像。テキスト無し前提 */
  backgroundImage?: string;
  /** 主役メンバーの縦長モノクロ写真 */
  portraitImage?: string;
  /** 主役メンバーのゼッケン番号 (01-12) */
  jerseyNumber?: string;
}

const GRADE_LABELS: Record<NonNullable<HeroProps["grade"]>, string> = {
  S: "激震",
  A: "号外",
  B: "速報",
  C: "接戦",
  D: "告知",
  E: "静寂",
};

export function Hero({
  stageLabel,
  headline = "首位、陥落。",
  subtitle = "3時間前、塩見きら が 阿久津真央 に首位を譲渡。差はわずか 8pt。",
  grade = "S",
  backgroundImage,
  portraitImage,
  jerseyNumber = "01",
}: HeroProps) {
  const today = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  const hasPortrait = Boolean(portraitImage);

  return (
    <section className="relative overflow-hidden bg-[#F5F1E8]">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden
        />
      )}

      <div
        className={`relative grid min-h-[640px] ${
          hasPortrait ? "md:grid-cols-[2fr_3fr]" : "grid-cols-1"
        }`}
      >
        {hasPortrait && (
          <div className="relative hidden md:block overflow-hidden">
            <Image
              src={portraitImage!}
              alt=""
              fill
              priority
              className="object-cover grayscale contrast-125"
              aria-hidden
            />
            <div
              className="absolute -left-[10%] -right-[10%] top-1/3 h-20 bg-[#D41E28] opacity-75"
              style={{ transform: "rotate(-12deg)" }}
              aria-hidden
            />
            <div
              className="absolute bottom-6 right-6 text-white font-black leading-none pointer-events-none select-none"
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "clamp(160px, 22vw, 280px)",
                mixBlendMode: "difference",
              }}
              aria-hidden
            >
              {jerseyNumber}
            </div>
          </div>
        )}

        <div className="relative flex flex-col justify-center px-6 py-16 md:px-16 md:py-24">
          <h1
            className="relative font-black tracking-tight leading-[0.92] text-[#111111]"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              fontSize: "clamp(56px, 10vw, 128px)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 text-[#1447E6]"
              style={{ transform: "translate(8px, 8px)", opacity: 0.28 }}
            >
              {headline}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 text-[#D41E28]"
              style={{ transform: "translate(4px, 4px)", opacity: 0.6 }}
            >
              {headline}
            </span>
            <span className="relative">{headline}</span>

            <span
              className="absolute -top-4 right-0 md:-right-4 inline-flex items-center justify-center bg-[#D41E28] text-white font-black select-none"
              style={{
                transform: "rotate(-6deg)",
                width: "clamp(72px, 10vw, 140px)",
                height: "clamp(72px, 10vw, 140px)",
                fontFamily: "var(--font-noto-serif), serif",
                fontSize: "clamp(24px, 4vw, 56px)",
                boxShadow: "2px 2px 0 rgba(17, 17, 17, 0.08)",
              }}
            >
              {GRADE_LABELS[grade]}
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base sm:text-lg leading-relaxed text-[#111111]">
            {subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4 text-[#4A5060]">
            <span className="text-sm font-medium">{today}</span>
            {stageLabel && (
              <>
                <span className="h-5 w-px bg-[#4A5060]" aria-hidden />
                <span className="text-xl md:text-2xl font-bold text-[#111111]">
                  {stageLabel}
                </span>
              </>
            )}
            <span
              className="inline-flex items-center bg-[#D41E28] text-white text-xs font-bold tracking-widest px-3 py-1.5"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              速報 GRADE {grade}
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[6px] bg-[#D41E28]"
        aria-hidden
      />
    </section>
  );
}
