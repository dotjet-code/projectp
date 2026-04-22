/**
 * ちんちろ継続ストリークのミルストーンバッジ。
 * 3 / 7 / 14 / 30 日で称号とカラーが変わる。
 * size は表示場所に応じて調整: "sm" (マイページ) / "md" (モーダル)
 */
export type StreakTier = "rookie" | "bronze" | "silver" | "gold" | "legend";

export interface StreakTierInfo {
  tier: StreakTier;
  label: string;
  bg: string;
  fg: string;
  /** 次のティアまで必要な日数 (legend なら null) */
  nextInDays: number | null;
  nextLabel: string | null;
}

export function getStreakTier(days: number): StreakTierInfo {
  if (days >= 30)
    return {
      tier: "legend",
      label: "LEGEND",
      bg: "#111111",
      fg: "#FFE600",
      nextInDays: null,
      nextLabel: null,
    };
  if (days >= 14)
    return {
      tier: "gold",
      label: "GOLD",
      bg: "#FFE600",
      fg: "#111111",
      nextInDays: 30 - days,
      nextLabel: "LEGEND",
    };
  if (days >= 7)
    return {
      tier: "silver",
      label: "SILVER",
      bg: "#CCCCCC",
      fg: "#111111",
      nextInDays: 14 - days,
      nextLabel: "GOLD",
    };
  if (days >= 3)
    return {
      tier: "bronze",
      label: "BRONZE",
      bg: "#C87F3E",
      fg: "#FFFFFF",
      nextInDays: 7 - days,
      nextLabel: "SILVER",
    };
  return {
    tier: "rookie",
    label: "ROOKIE",
    bg: "#4A5060",
    fg: "#F5F1E8",
    nextInDays: 3 - days,
    nextLabel: "BRONZE",
  };
}

export function StreakBadge({
  days,
  size = "md",
  showNextHint = false,
}: {
  days: number;
  size?: "sm" | "md";
  showNextHint?: boolean;
}) {
  const info = getStreakTier(days);
  const tall = size === "md";

  return (
    <span
      className="inline-flex items-center gap-1.5 align-middle"
      title={
        info.nextInDays && info.nextLabel
          ? `あと ${info.nextInDays} 日で ${info.nextLabel}`
          : "最高ランク"
      }
    >
      <span
        className={`inline-flex items-center font-black tracking-wider ${tall ? "text-[11px] px-2 py-1" : "text-[9px] px-1.5 py-0.5"}`}
        style={{
          backgroundColor: info.bg,
          color: info.fg,
          fontFamily: "var(--font-outfit)",
        }}
      >
        {info.label}
      </span>
      {showNextHint && info.nextInDays && info.nextLabel && (
        <span
          className={`${tall ? "text-[10px]" : "text-[9px]"} text-[#4A5060]`}
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          あと {info.nextInDays} 日で {info.nextLabel}
        </span>
      )}
    </span>
  );
}
