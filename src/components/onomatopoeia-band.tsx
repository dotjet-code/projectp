export interface OnomatopoeiaBandProps {
  /** 中央に出す 1 語 (例: 「激闘。」「沸騰。」「静寂。」) */
  word?: string;
  /** 右上の補足 (例: "STAGE 12 · DAY 07") */
  caption?: string;
}

const BOAT_COLORS = [
  "#F5F5F0",
  "#1A1A1A",
  "#D41E28",
  "#1E4BC8",
  "#F2C81B",
  "#0F8F4A",
];

export function OnomatopoeiaBand({
  word = "激闘。",
  caption,
}: OnomatopoeiaBandProps) {
  return (
    <div className="w-full bg-[#111111] text-white relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 h-[120px] flex items-center justify-between">
        {/* 左: 6 色タイル */}
        <div className="flex items-center gap-1 shrink-0" aria-hidden>
          {BOAT_COLORS.map((c, i) => (
            <span
              key={i}
              className="block w-3 h-3 border border-[#4A5060]"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* 中央: オノマトペ */}
        <h2
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-7xl font-black leading-none tracking-tight select-none"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {word}
        </h2>

        {/* 右: 補足 */}
        <div
          className="text-[10px] md:text-xs tracking-[0.25em] text-[#9BA8BF] shrink-0"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {caption}
        </div>
      </div>
    </div>
  );
}
