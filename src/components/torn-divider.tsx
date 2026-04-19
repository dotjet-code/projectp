/**
 * 破れた赤テープ風の不規則な区切り線。
 * セクションの上端 / 下端 / 中間の区切りに使う。
 */
export interface TornDividerProps {
  /** 不規則 (破れ) なエッジの位置 */
  variant?: "top" | "bottom" | "both";
  /** 色 (既定: 赤) */
  color?: string;
  /** 高さ (px) */
  height?: number;
  /** 微妙な傾き (deg) */
  rotation?: number;
  /** 影 (既定: 軽い影) */
  shadow?: boolean;
  className?: string;
}

const TORN_TOP =
  "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)";

const TORN_BOTTOM =
  "polygon(0 0, 100% 0, 100% 60%, 96% 80%, 90% 58%, 82% 86%, 74% 60%, 66% 84%, 58% 58%, 50% 82%, 42% 60%, 34% 90%, 26% 55%, 18% 85%, 10% 60%, 4% 80%, 0 60%)";

const TORN_BOTH =
  "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 60%, 96% 80%, 90% 58%, 82% 86%, 74% 60%, 66% 84%, 58% 58%, 50% 82%, 42% 60%, 34% 90%, 26% 55%, 18% 85%, 10% 60%, 4% 80%, 0 60%)";

export function TornDivider({
  variant = "top",
  color = "#D41E28",
  height = 20,
  rotation = 0,
  shadow = true,
  className = "",
}: TornDividerProps) {
  const clipPath =
    variant === "bottom" ? TORN_BOTTOM : variant === "both" ? TORN_BOTH : TORN_TOP;

  return (
    <div
      className={`relative w-full pointer-events-none select-none ${className}`}
      style={{
        height,
        backgroundColor: color,
        clipPath,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        filter: shadow ? "drop-shadow(0 2px 0 rgba(17,17,17,0.12))" : undefined,
      }}
      aria-hidden
    />
  );
}
