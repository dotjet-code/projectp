import Image from "next/image";

export interface HeroProps {
  stageLabel?: string;
  /** 巨大平仮名タイトル (画像が無い時のフォールバック) */
  brandTitle?: string;
  /** 破れ紙に印刷されたタイトル画像 (優先) */
  titleImage?: string;
  /** titleImage のアスペクト比 (既定 1920:600 = 3.2) */
  titleImageAspect?: number;
  /** 事件ヘッドライン (破れ紙ラベルで配置) */
  eventHeadline?: string;
  /** 散らし配置の煽りコピー */
  taglines?: string[];
  /** 事件等級 → 朱肉判子に出る語 */
  grade?: "S" | "A" | "B" | "C" | "D" | "E";
  /** 背景に敷くコラージュ画像（nanobanana 生成） */
  backgroundImage?: string;
  /** 被写体の切抜き画像 */
  portraitImage?: string;
  /** 被写体のゼッケン番号 */
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

const DEFAULT_TAGLINES = ["主役はまだ空席", "命を賭けて", "虹を架けるのは君だ"];

// 破れ紙エッジのクリップパス
const TORN_CLIP_PATH =
  "polygon(2% 8%, 8% 2%, 18% 6%, 28% 0%, 38% 6%, 48% 2%, 60% 8%, 72% 2%, 84% 8%, 92% 2%, 100% 10%, 98% 22%, 100% 36%, 96% 50%, 100% 62%, 98% 76%, 100% 88%, 94% 96%, 86% 94%, 74% 100%, 62% 94%, 50% 100%, 38% 96%, 26% 100%, 14% 94%, 4% 98%, 0% 84%, 4% 72%, 0% 60%, 4% 48%, 0% 36%, 4% 24%, 0% 12%)";

// 朱肉判子の不規則エッジ
const STAMP_CLIP_PATH =
  "polygon(3% 8%, 12% 2%, 28% 5%, 42% 0%, 58% 4%, 74% 1%, 88% 5%, 100% 12%, 97% 28%, 100% 42%, 96% 58%, 100% 72%, 96% 88%, 88% 100%, 72% 96%, 58% 100%, 42% 96%, 28% 100%, 12% 97%, 2% 88%, 0 72%, 4% 58%, 0 42%, 4% 28%, 0 12%)";

function TornLabel({
  children,
  variant = "white",
  rotation = 0,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "white" | "red" | "pink" | "teal" | "black";
  rotation?: number;
  className?: string;
}) {
  const styles: Record<string, { bg: string; fg: string }> = {
    white: { bg: "#F5F1E8", fg: "#111111" },
    red: { bg: "#D41E28", fg: "#F5F1E8" },
    pink: { bg: "#ED2B86", fg: "#F5F1E8" },
    teal: { bg: "#1CB4AF", fg: "#F5F1E8" },
    black: { bg: "#111111", fg: "#F5F1E8" },
  };
  const s = styles[variant];

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: s.bg,
          clipPath: TORN_CLIP_PATH,
        }}
        aria-hidden
      />
      <div
        className="relative px-5 py-3 font-black leading-none"
        style={{
          color: s.fg,
          fontFamily: "var(--font-noto), sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function BrandTitle({ text }: { text: string }) {
  const chars = [...text];
  // 決定論的にアクセントを置く（SSR/CSR ずれ回避のため Math.random は使わない）
  const accents = new Set<number>();
  if (chars.length >= 3) {
    accents.add(1);
    if (chars.length >= 5) accents.add(chars.length - 2);
  }

  const accentColors = ["#D41E28", "#ED2B86"];
  const rotations = [-1.5, 1, -0.5, 1.5, -1, 0.5];

  return (
    <h1
      className="relative font-black leading-[0.82] tracking-[-0.03em] select-none"
      style={{
        fontFamily: "var(--font-noto), sans-serif",
        fontSize: "clamp(88px, 15vw, 200px)",
        fontWeight: 900,
      }}
    >
      {chars.map((ch, i) => {
        const isAccent = accents.has(i);
        const color = isAccent
          ? accentColors[i % accentColors.length]
          : "#111111";
        const rot = rotations[i % rotations.length];
        const shadow =
          i === 0
            ? "3px 3px 0 rgba(237, 43, 134, 0.4)"
            : i === chars.length - 1
            ? "-3px 3px 0 rgba(28, 180, 175, 0.4)"
            : "none";
        return (
          <span
            key={i}
            className="inline-block relative"
            style={{
              color,
              transform: `rotate(${rot}deg)`,
              marginRight: "-0.02em",
              textShadow: shadow,
            }}
          >
            {ch}
          </span>
        );
      })}
    </h1>
  );
}

export function Hero({
  stageLabel,
  brandTitle = "かけあがり",
  titleImage,
  titleImageAspect = 1920 / 600,
  eventHeadline = "首位、陥落。",
  taglines = DEFAULT_TAGLINES,
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

  return (
    <section className="relative overflow-hidden bg-[#F5F1E8]">
      {/* ====== 背景コラージュレイヤー ====== */}

      {/* 生成背景画像 (コラージュ本体) */}
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



      {/* ====== メインコンテンツ ====== */}
      <div className="relative mx-auto max-w-[1200px] px-4 pt-10 pb-20 md:pt-16 md:pb-28 min-h-[740px]">
        {/* 人物切抜き */}
        {portraitImage && (
          <div
            className="absolute right-0 md:right-4 bottom-8 w-[60%] md:w-[46%] pointer-events-none"
            style={{ height: "84%" }}
            aria-hidden
          >
            <div className="relative w-full h-full">
              <Image
                src={portraitImage}
                alt=""
                fill
                priority
                className="object-cover object-top"
                style={{
                  filter: "contrast(1.1) saturate(1.05)",
                  clipPath:
                    "polygon(6% 2%, 14% 0, 28% 4%, 44% 0, 58% 3%, 72% 0, 86% 4%, 96% 2%, 100% 14%, 96% 28%, 100% 46%, 98% 62%, 100% 78%, 94% 92%, 86% 100%, 72% 96%, 58% 100%, 44% 96%, 28% 100%, 14% 96%, 4% 100%, 0 88%, 4% 72%, 0 56%, 4% 38%, 0 22%, 2% 10%)",
                }}
              />
              {/* 巨大ゼッケン (彫込み) */}
              <div
                className="absolute right-2 bottom-8 font-black leading-none select-none"
                style={{
                  color: "#F5F1E8",
                  fontFamily: "var(--font-outfit)",
                  fontSize: "clamp(140px, 20vw, 280px)",
                  mixBlendMode: "difference",
                  fontWeight: 900,
                }}
              >
                {jerseyNumber}
              </div>
            </div>
          </div>
        )}

        {/* 巨大ブランドタイトル */}
        <div className="relative z-10 pt-2 md:pt-4">
          {titleImage ? (
            <div
              className="relative w-full max-w-[720px]"
              style={{ aspectRatio: titleImageAspect }}
            >
              <Image
                src={titleImage}
                alt={brandTitle}
                fill
                priority
                className="object-contain object-left"
                sizes="(max-width: 768px) 90vw, 900px"
              />
            </div>
          ) : (
            <div className="inline-block relative">
              <div
                className="absolute bg-[#F5F1E8]"
                style={{
                  inset: "-16px -24px",
                  clipPath: TORN_CLIP_PATH,
                  boxShadow: "6px 6px 0 rgba(17,17,17,0.1)",
                }}
                aria-hidden
              />
              <div className="relative px-2">
                <BrandTitle text={brandTitle} />
              </div>
            </div>
          )}
        </div>

        {/* 煽りコピー群 */}
        <div className="relative z-10 mt-8 md:mt-12 max-w-[64%] md:max-w-[58%]">
          <div className="mb-4">
            <TornLabel variant="black" rotation={-2}>
              <span
                className="text-xl md:text-3xl"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {eventHeadline}
              </span>
            </TornLabel>
          </div>

          <div className="flex flex-wrap items-start gap-3 md:gap-4">
            {taglines.map((t, i) => {
              const variants = ["white", "pink", "teal", "red"] as const;
              const v = variants[i % variants.length];
              const rot = i % 2 === 0 ? -3 : 2;
              return (
                <TornLabel key={`${t}-${i}`} variant={v} rotation={rot}>
                  <span className="text-sm md:text-lg">{t}</span>
                </TornLabel>
              );
            })}
          </div>
        </div>

        {/* 右上: 朱肉判子 */}
        <div
          className="absolute right-4 md:right-12 top-6 md:top-10 z-20 flex items-center justify-center select-none"
          style={{
            width: "clamp(88px, 11vw, 150px)",
            height: "clamp(88px, 11vw, 150px)",
            backgroundColor: "#D41E28",
            transform: "rotate(-8deg)",
            boxShadow: "4px 4px 0 rgba(17,17,17,0.15)",
            clipPath: STAMP_CLIP_PATH,
          }}
          aria-label={`等級 ${grade}: ${GRADE_LABELS[grade]}`}
        >
          <span
            className="text-white font-black"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              fontSize: "clamp(30px, 4.5vw, 62px)",
              lineHeight: 1,
            }}
          >
            {GRADE_LABELS[grade]}
          </span>
        </div>

        {/* 下段: 日付 / 節 / 等級バッジ */}
        <div className="relative z-10 mt-10 md:mt-16 flex flex-wrap items-center gap-3 md:gap-4">
          <TornLabel variant="white" rotation={1}>
            <span
              className="text-xs md:text-sm"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {today}
            </span>
          </TornLabel>
          {stageLabel && (
            <TornLabel variant="red" rotation={-1}>
              <span className="text-xs md:text-sm">{stageLabel}</span>
            </TornLabel>
          )}
          <TornLabel variant="teal" rotation={2}>
            <span
              className="text-[10px] md:text-xs tracking-[0.2em]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              GRADE {grade}
            </span>
          </TornLabel>
        </div>
      </div>

      {/* 下端: 破れた赤テープ */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[28px] bg-[#D41E28] pointer-events-none"
        style={{
          clipPath:
            "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
        }}
        aria-hidden
      />
    </section>
  );
}
