import type { ReactNode } from "react";

type Accent = "red" | "black" | "yellow";

const ACCENT_COLOR: Record<Accent, string> = {
  red: "#D41E28",
  black: "#111111",
  yellow: "#FFE600",
};

export interface SectionHeadingProps {
  title: ReactNode;
  /** 英字サブタイトル (Anton/Outfit で小さく上に置く) */
  eyebrow?: string;
  /** セクション右端の小さな補足 */
  aside?: ReactNode;
  accent?: Accent;
  className?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  aside,
  accent = "red",
  className = "",
}: SectionHeadingProps) {
  const color = ACCENT_COLOR[accent];

  return (
    <div className={`flex items-end justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-stretch gap-4">
        <div
          className="w-[6px] shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div>
          {eyebrow && (
            <p
              className="text-[11px] font-bold tracking-[0.2em] text-[#4A5060] uppercase leading-none mb-1.5"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-[#111111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {title}
          </h2>
        </div>
      </div>
      {aside && (
        <div className="text-xs font-medium text-[#4A5060] pb-1">{aside}</div>
      )}
    </div>
  );
}
