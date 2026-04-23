import type { Stage } from "@/lib/projectp/stage";
import { TornDivider } from "@/components/torn-divider";

export interface NewsFlashProps {
  stage: Stage | null;
  /** 事件の大見出し (例: 「首位、陥落。」) */
  headline: string;
  /** 事件サブ (例: 3時間前、塩見きら が 阿久津真央 に首位を譲渡) */
  sub?: string;
  /** 事件等級 → 号外 / 速報 / 激震 */
  grade?: "S" | "A" | "B" | "C" | "D" | "E";
  /** 本文リード (2〜3 文。段組みで表示) */
  bodyLead?: string;
  /** 直近の動き (最新 3-4 件) */
  recent?: {
    time: string;
    text: string;
    accent?: "red" | "pink" | "teal" | "neutral";
  }[];
  /** 発行号数 (省略時は stage.stageNumber から生成) */
  issueNumber?: string;
  /** 取材班クレジット */
  reporter?: string;
}

const GRADE_STAMP: Record<string, string> = {
  S: "号外",
  A: "号外",
  B: "速報",
  C: "接戦",
  D: "告知",
  E: "通常",
};

const PHASE_LABELS = ["開幕", "中盤", "終盤", "閉幕特番"] as const;

function computePhase(stage: Stage | null): string {
  if (!stage) return "開幕前";
  const start = new Date(stage.startDate).getTime();
  const end = new Date(stage.endDate).getTime();
  const span = Math.max(end - start, 1);
  const t = (Date.now() - start) / span;
  if (t < 0.3) return PHASE_LABELS[0];
  if (t < 0.6) return PHASE_LABELS[1];
  if (t < 0.95) return PHASE_LABELS[2];
  return PHASE_LABELS[3];
}

function computeCountdown(
  stage: Stage | null,
): { days: number; hours: number } | null {
  if (!stage) return null;
  const [y, m, d] = stage.endDate.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1, d, 15, 0, 0)).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0 };
  return {
    days: Math.floor(diff / (24 * 60 * 60 * 1000)),
    hours: Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
  };
}

export function NewsFlash({
  stage,
  headline,
  sub,
  grade = "S",
  bodyLead,
  recent = [],
  issueNumber,
  reporter = "かけあがり取材班",
}: NewsFlashProps) {
  const phase = computePhase(stage);
  const remaining = computeCountdown(stage);
  const stampLabel = GRADE_STAMP[grade] ?? "速報";
  const updatedAt = new Date();
  const updatedLabel = `${updatedAt
    .getHours()
    .toString()
    .padStart(2, "0")}:${updatedAt.getMinutes().toString().padStart(2, "0")} JST`;
  const issue =
    issueNumber ??
    `第 ${stage?.stageNumber ?? "—"} 節 · No.${String(updatedAt.getMonth() + 1).padStart(2, "0")}${String(updatedAt.getDate()).padStart(2, "0")}`;

  return (
    <div
      className="relative w-full bg-[#F5F1E8] text-[#111] shadow-[8px_8px_0_rgba(17,17,17,0.18)]"
      style={{
        transform: "rotate(-0.4deg)",
        backgroundImage:
          "radial-gradient(circle, rgba(17,17,17,0.14) 0.6px, transparent 1px), linear-gradient(180deg, rgba(17,17,17,0.04) 0%, rgba(17,17,17,0) 18%)",
        backgroundSize: "5px 5px, 100% 100%",
      }}
    >
      {/* 紙の上端: 破れた赤テープ */}
      <div
        className="absolute -top-1 left-5 right-5 h-2 bg-[#D41E28]"
        style={{
          clipPath:
            "polygon(0 40%, 4% 20%, 10% 50%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
        }}
        aria-hidden
      />

      {/* 朱肉判子「号外」 (左上、少し大きめ) */}
      <div
        className="absolute -top-4 -left-3 z-20 flex items-center justify-center bg-[#D41E28] text-white select-none"
        style={{
          width: 76,
          height: 76,
          transform: "rotate(-14deg)",
          clipPath:
            "polygon(3% 8%, 12% 2%, 28% 5%, 42% 0%, 58% 4%, 74% 1%, 88% 5%, 100% 12%, 97% 28%, 100% 42%, 96% 58%, 100% 72%, 96% 88%, 88% 100%, 72% 96%, 58% 100%, 42% 96%, 28% 100%, 12% 97%, 2% 88%, 0 72%, 4% 58%, 0 42%, 4% 28%, 0 12%)",
          fontFamily: "var(--font-noto-serif), serif",
          boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
          lineHeight: 1,
        }}
      >
        <div className="flex flex-col items-center leading-none">
          <span className="text-[8px] font-black tracking-[0.25em] opacity-90">
            KAKEAGARI
          </span>
          <span className="text-[22px] font-black mt-0.5">{stampLabel}</span>
        </div>
      </div>

      {/* 右上: 速報サイレン小判子 */}
      <div
        className="absolute -top-3 right-3 z-20 flex items-center gap-1 bg-[#111] text-white select-none px-2 py-1"
        style={{
          transform: "rotate(3deg)",
          fontFamily: "var(--font-outfit)",
          boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
        }}
      >
        <span className="inline-block w-1.5 h-1.5 bg-[#D41E28] animate-pulse" />
        <span className="text-[9px] font-black tracking-[0.25em]">BREAKING</span>
      </div>

      <div className="px-5 pt-7 pb-4 md:px-6 md:pt-8 md:pb-5">
        {/* マストヘッド */}
        <div className="flex items-baseline gap-2 pl-[72px] md:pl-[80px]">
          <p
            className="text-[11px] md:text-xs font-black tracking-[0.32em] text-[#111]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            KAKEAGARI
          </p>
          <p
            className="text-[10px] md:text-[11px] font-black tracking-[0.2em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            DAILY
          </p>
          <span
            className="text-[10px] text-[#4A5060] font-bold tracking-wider"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {issue}
          </span>
        </div>

        {/* マストヘッド下: 不規則な赤テープ */}
        <div className="mt-2">
          <TornDivider variant="both" height={10} color="#D41E28" shadow={false} />
        </div>

        {/* 発行情報 */}
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-[#4A5060]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          <span>
            {new Intl.DateTimeFormat("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            }).format(updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-[#D41E28]" />
            LIVE {updatedLabel}
          </span>
        </div>

        {/* 事件大見出し: 明朝 × 版ズレ × 下線の力押し */}
        <div className="relative mt-3 md:mt-4">
          {/* 緊急速報 横バナー (見出しの上に独立して配置) */}
          <div
            className="inline-flex items-center gap-1.5 mb-2 bg-[#111] text-[#FFE600] px-2 py-1 select-none"
            style={{
              transform: "rotate(-1deg)",
              boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
            }}
          >
            <span className="inline-block w-1.5 h-1.5 bg-[#D41E28] animate-pulse" />
            <span
              className="text-[10px] font-black tracking-[0.3em]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              緊急速報
            </span>
          </div>

          <h2
            className="relative text-[34px] md:text-[44px] font-black leading-[0.92] tracking-[-0.02em] text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            <span
              aria-hidden
              className="absolute inset-0 text-[#1CB4AF]"
              style={{ transform: "translate(-2px, -2px)", opacity: 0.5 }}
            >
              {headline}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 text-[#D41E28]"
              style={{ transform: "translate(2px, 2px)", opacity: 0.55 }}
            >
              {headline}
            </span>
            <span className="relative">{headline}</span>
          </h2>

          {/* 見出し下の筆ストローク (赤) */}
          <div
            className="mt-2 h-[10px] bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 60%, 4% 20%, 10% 70%, 18% 30%, 28% 65%, 38% 25%, 48% 70%, 58% 30%, 68% 68%, 78% 28%, 86% 70%, 94% 34%, 100% 66%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
        </div>

        {/* サブ見出し */}
        {sub && (
          <p
            className="mt-3 text-[13px] md:text-sm font-black leading-snug text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {sub}
          </p>
        )}

        {/* 本文リード (任意): 2 段組 + ドロップキャップ */}
        {bodyLead && (
          <div className="mt-3">
            <p
              className="text-[12px] leading-[1.7] text-[#111] md:columns-2 md:gap-4"
              style={{
                fontFamily: "var(--font-noto-serif), serif",
                columnRule: "1px solid rgba(17,17,17,0.25)",
                textAlign: "justify",
              }}
            >
              <span
                className="float-left mr-1 text-[32px] leading-[0.85] font-black text-[#D41E28]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
                aria-hidden
              >
                {bodyLead.charAt(0)}
              </span>
              {bodyLead.slice(1)}
            </p>
          </div>
        )}

        {/* 区切り: 不規則な黒テープ */}
        <div className="mt-3">
          <TornDivider variant="both" height={8} color="#111111" shadow={false} />
        </div>

        {/* 指標ブロック: STAGE / 締切 / GRADE の 3 カラム */}
        <div className="mt-3 grid grid-cols-3 divide-x divide-[#111]/40">
          <div className="pr-2">
            <p
              className="text-[8px] font-black tracking-[0.25em] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              STAGE
            </p>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span
                className="text-2xl font-black leading-none tabular-nums text-[#111]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {stage?.stageNumber ?? "—"}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                節
              </span>
              <span
                className="ml-1 inline-block bg-[#D41E28] text-white text-[8px] font-black tracking-[0.18em] px-1 py-px"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {phase}
              </span>
            </div>
          </div>

          <div className="px-2">
            <p
              className="text-[8px] font-black tracking-[0.25em] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              閉幕特番まで
            </p>
            {remaining ? (
              <div className="mt-0.5 flex items-baseline gap-1">
                <span
                  className="text-2xl font-black leading-none tabular-nums text-[#111]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {remaining.days}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  日
                </span>
                <span
                  className="ml-1 text-base font-black leading-none tabular-nums text-[#D41E28]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {String(remaining.hours).padStart(2, "0")}
                </span>
                <span
                  className="text-[9px] font-bold"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  h
                </span>
              </div>
            ) : (
              <p
                className="mt-0.5 text-base font-black"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                準備中
              </p>
            )}
          </div>

          <div className="pl-2">
            <p
              className="text-[8px] font-black tracking-[0.25em] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              GRADE
            </p>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span
                className="text-2xl font-black leading-none text-[#D41E28]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {grade}
              </span>
              <span
                className="ml-1 inline-block border border-[#111] text-[#111] text-[8px] font-black tracking-[0.18em] px-1 py-px"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                CLASS
              </span>
            </div>
          </div>
        </div>

        {/* 区切り: 不規則な赤テープ */}
        <div className="mt-3">
          <TornDivider variant="both" height={10} color="#D41E28" shadow={false} />
        </div>

        {/* 最新の動き: 株価ティッカー風 */}
        {recent.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-[#D41E28]" />
              <p
                className="text-[9px] font-black tracking-[0.25em] text-[#111]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                暫定トップ
              </p>
              <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
              <p
                className="text-[8px] font-bold tracking-[0.18em] text-[#4A5060]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                CURRENT
              </p>
            </div>
            <ul className="divide-y divide-[#111]/15">
              {recent.slice(0, 4).map((r, i) => {
                const accentColor = {
                  red: "#D41E28",
                  pink: "#ED2B86",
                  teal: "#1CB4AF",
                  neutral: "#4A5060",
                }[r.accent ?? "neutral"];
                return (
                  <li
                    key={i}
                    className="flex items-baseline gap-2 py-1 text-[12px]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    <span
                      className="w-9 shrink-0 text-[11px] font-black tabular-nums tracking-wider"
                      style={{
                        fontFamily: "var(--font-outfit)",
                        color: accentColor,
                      }}
                    >
                      {r.time}
                    </span>
                    <span className="font-bold text-[#111] leading-snug flex-1">
                      {r.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 奥付 (bylineバー) */}
        <div className="mt-3 pt-2 border-t-[3px] border-[#111] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[8px] font-black tracking-[0.25em] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              編集
            </span>
            <span
              className="text-[10px] font-black text-[#111]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              {reporter}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[8px] font-black tracking-[0.25em] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              LAST UPDATE
            </span>
            <span
              className="text-[10px] font-black tabular-nums text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {updatedLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 左下: 折り目の影 */}
      <div
        className="absolute bottom-0 left-0 w-[40%] h-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(17,17,17,0.18) 0%, rgba(17,17,17,0) 70%)",
        }}
        aria-hidden
      />
      {/* 右下: ページ番号 */}
      <div
        className="absolute bottom-2 right-3 text-[9px] font-black tracking-[0.3em] text-[#4A5060] select-none"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        P.01 / 01
      </div>
    </div>
  );
}
