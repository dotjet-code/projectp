import Image from "next/image";
import { TornDivider } from "@/components/torn-divider";

export interface HeroProps {
  stageLabel?: string;
  /** 巨大平仮名タイトル (画像が無い時のフォールバック) */
  brandTitle?: string;
  /** 破れ紙に印刷されたタイトル画像 (優先) */
  titleImage?: string;
  /** titleImage のアスペクト比 (既定 1920:600 = 3.2) */
  titleImageAspect?: number;
  /** 事件ヘッドライン (NewsFlash 側で使う想定、Hero 内には出さない) */
  eventHeadline?: string;
  /** 散らし配置の煽りコピー (テキストフォールバック) */
  taglines?: string[];
  /** 煽りコピーの破れ紙画像 (優先、配列の順で配置) */
  taglineImages?: string[];
  /** taglineImages のアスペクト比 (既定 669:373) */
  taglineImageAspect?: number;
  /** 事件等級 → 朱肉判子に出る語 */
  grade?: "S" | "A" | "B" | "C" | "D" | "E";
  /** 背景に敷くコラージュ画像（nanobanana 生成） */
  backgroundImage?: string;
  /** 被写体の切抜き画像 */
  portraitImage?: string;
  /** 被写体のゼッケン番号 */
  jerseyNumber?: string;
  /** 左カラムに差し込む号外ニュース枠 */
  newsFlashSlot?: React.ReactNode;
}

const GRADE_LABELS: Record<NonNullable<HeroProps["grade"]>, string> = {
  S: "激震",
  A: "号外",
  B: "速報",
  C: "接戦",
  D: "告知",
  E: "静寂",
};

const DEFAULT_TAGLINES = [
  "主役は、まだ空席。",
  "人生を懸けて",
  "虹を架けるのは君だ",
];

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
  taglines = DEFAULT_TAGLINES,
  taglineImages,
  taglineImageAspect = 669 / 373,
  grade = "S",
  backgroundImage,
  portraitImage,
  jerseyNumber = "01",
  newsFlashSlot,
}: HeroProps) {
  const today = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  return (
    <section className="relative bg-[#F5F1E8]">
      {/* ==== ステージ: 背景コラージュ画像 1376×768 を最大サイズとする ==== */}
      <div className="relative mx-auto w-full max-w-[1376px] md:aspect-[1376/768] overflow-hidden">
        {/* 背景画像 (リピートなし、ピッタリ収める) */}
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            className="object-cover object-center pointer-events-none select-none"
            sizes="(max-width: 1376px) 100vw, 1376px"
            aria-hidden
          />
        )}

        {/* ==== コンテンツオーバーレイ ==== */}
        <div className="relative z-10 h-full grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4 md:gap-6 px-4 md:px-6 pt-2 pb-4 md:pt-3 md:pb-5">
          {/* 左カラム: タイトル + 号外 (オーバーラップ) */}
          <div className="flex flex-col min-h-0">
            {/* かけあがり タイトル (左上に詰めて、ほんの少し大きめ) */}
            <div className="shrink-0 relative z-30">
              {titleImage ? (
                <div
                  className="relative w-full max-w-[300px] md:max-w-[380px]"
                  style={{ aspectRatio: titleImageAspect }}
                >
                  <Image
                    src={titleImage}
                    alt={brandTitle}
                    fill
                    priority
                    className="object-contain object-left"
                    sizes="(max-width: 768px) 70vw, 380px"
                  />
                </div>
              ) : (
                <div className="inline-block relative">
                  <div
                    className="absolute bg-[#F5F1E8]"
                    style={{
                      inset: "-12px -18px",
                      clipPath: TORN_CLIP_PATH,
                      boxShadow: "4px 4px 0 rgba(17,17,17,0.1)",
                    }}
                    aria-hidden
                  />
                  <div className="relative px-2">
                    <BrandTitle text={brandTitle} />
                  </div>
                </div>
              )}
            </div>

            {/* 号外ニュース紙面 (タイトルにかぶせて上に持ち上げ、下端は見切れさせる) */}
            <div className="relative z-20 -mt-16 md:-mt-24 pl-2 pr-2">
              {newsFlashSlot}
            </div>

            {/* 下段メタラベル */}
            <div className="shrink-0 mt-3 flex flex-wrap items-center gap-2 relative z-30">
              <TornLabel variant="white" rotation={1}>
                <span
                  className="text-[10px]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {today}
                </span>
              </TornLabel>
              {stageLabel && (
                <TornLabel variant="red" rotation={-1}>
                  <span className="text-[10px]">{stageLabel}</span>
                </TornLabel>
              )}
            </div>
          </div>

          {/* 右カラム: 人物 + タグライン (ポスタークラスタ) */}
          <div className="relative min-h-[420px] md:min-h-0">
            {/* 人物切抜き (右側) */}
            {portraitImage && (
              <div
                className="absolute right-0 top-0 bottom-0 w-[70%] md:w-[68%] pointer-events-none"
                aria-hidden
              >
                <div className="relative w-full h-full">
                  <Image
                    src={portraitImage}
                    alt=""
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1376px) 50vw, 660px"
                    style={{
                      filter: "contrast(1.1) saturate(1.05)",
                      clipPath:
                        "polygon(6% 2%, 14% 0, 28% 4%, 44% 0, 58% 3%, 72% 0, 86% 4%, 96% 2%, 100% 14%, 96% 28%, 100% 46%, 98% 62%, 100% 78%, 94% 92%, 86% 100%, 72% 96%, 58% 100%, 44% 96%, 28% 100%, 14% 96%, 4% 100%, 0 88%, 4% 72%, 0 56%, 4% 38%, 0 22%, 2% 10%)",
                    }}
                  />
                  <div
                    className="absolute right-2 bottom-4 font-black leading-none select-none"
                    style={{
                      color: "#F5F1E8",
                      fontFamily: "var(--font-outfit)",
                      fontSize: "clamp(110px, 14vw, 220px)",
                      mixBlendMode: "difference",
                      fontWeight: 900,
                    }}
                  >
                    {jerseyNumber}
                  </div>
                </div>
              </div>
            )}

            {/* 朱肉判子 GRADE (右上) */}
            <div
              className="absolute right-2 md:right-4 top-1 md:top-2 z-20 flex items-center justify-center select-none"
              style={{
                width: "clamp(64px, 7.5vw, 112px)",
                height: "clamp(64px, 7.5vw, 112px)",
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
                  fontSize: "clamp(20px, 3vw, 42px)",
                  lineHeight: 1,
                }}
              >
                {GRADE_LABELS[grade]}
              </span>
            </div>

            {/* タグラインラベル群 (人物の左側に積む) */}
            <div className="absolute left-0 top-4 md:top-6 z-10 flex flex-col items-start gap-2 md:gap-3 w-[42%] md:w-[38%]">
              {taglineImages && taglineImages.length > 0
                ? taglineImages.map((src, i) => {
                    const rotations = [-3, 2, -2];
                    const rot = rotations[i % rotations.length];
                    const alt = taglines[i] ?? "";
                    return (
                      <div
                        key={`${src}-${i}`}
                        className="relative w-full max-w-[200px]"
                        style={{
                          aspectRatio: taglineImageAspect,
                          transform: `rotate(${rot}deg)`,
                        }}
                      >
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          className="object-contain object-left"
                          sizes="(max-width: 768px) 160px, 200px"
                        />
                      </div>
                    );
                  })
                : taglines.map((t, i) => {
                    const variants = ["white", "pink", "teal", "red"] as const;
                    const v = variants[i % variants.length];
                    const rot = i % 2 === 0 ? -3 : 2;
                    return (
                      <TornLabel key={`${t}-${i}`} variant={v} rotation={rot}>
                        <span className="text-sm md:text-base">{t}</span>
                      </TornLabel>
                    );
                  })}
            </div>

            {/* GRADE タグ (右下、メタ情報) */}
            <div className="absolute right-3 bottom-2 z-20">
              <TornLabel variant="teal" rotation={2}>
                <span
                  className="text-[10px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  GRADE {grade}
                </span>
              </TornLabel>
            </div>
          </div>
        </div>
      </div>

      {/* 下端: 破れた赤テープ */}
      <TornDivider variant="top" height={22} />
    </section>
  );
}
