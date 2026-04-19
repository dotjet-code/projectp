/**
 * 主役指名 (人気投票) のルールを目立つ形で説明する共通バナー。
 * Sanrio キャラクター大賞方式: 毎日 何人にでも 1 票ずつ。同じ人は 1 日 1 回まで。
 */
export function ShuyakuRuleNotice() {
  return (
    <div
      className="bg-[#FFE600] border-2 border-[#111] px-5 py-3 md:px-6 md:py-4 flex items-start gap-3 md:gap-4"
      style={{
        boxShadow: "4px 4px 0 rgba(17,17,17,0.18)",
      }}
    >
      <span
        className="shrink-0 inline-flex w-9 h-9 md:w-10 md:h-10 items-center justify-center bg-[#D41E28] text-white text-base md:text-lg select-none"
        style={{
          fontFamily: "var(--font-noto-serif), serif",
          boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
        }}
        aria-hidden
      >
        🎲
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ━ HOW TO VOTE
        </p>
        <p
          className="mt-1 text-sm md:text-base font-black leading-snug text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          毎日、<span className="text-[#D41E28]">何人にでもサイコロを振れます</span>。
          出た目（<span className="tabular-nums">1〜6</span>）がそのまま、その子への票数に。
          <span className="block md:inline md:ml-1 text-[#4A5060] font-bold text-xs md:text-sm">
            （ただし、同じ人には 1 日 1 回まで）
          </span>
        </p>
      </div>
    </div>
  );
}
