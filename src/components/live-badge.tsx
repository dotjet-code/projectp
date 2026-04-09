"use client";

import { useLiveStatusBySlug } from "@/lib/projectp/live-status-client";

/**
 * 汎用 LIVE バッジ。
 * slug を渡せば、今ライブ中のメンバーだけ赤いバッジが表示される。
 * ライブしていない / 未ロード → 何も描画しない
 */
export function LiveBadge({
  slug,
  size = "sm",
  className = "",
}: {
  slug: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const status = useLiveStatusBySlug(slug);
  if (!status?.isLive) return null;

  const sizeClasses =
    size === "xs"
      ? "px-1.5 py-0.5 text-[9px] gap-0.5"
      : size === "md"
      ? "px-2.5 py-1 text-[11px] gap-1"
      : "px-2 py-0.5 text-[10px] gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#fb2c36] font-bold text-white shadow-md ${sizeClasses} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-white opacity-80 animate-pulse" />
      LIVE
    </span>
  );
}

/**
 * 同じだが absolute 配置で右上に浮かせるバリアント。
 */
export function FloatingLiveBadge({ slug }: { slug: string }) {
  const status = useLiveStatusBySlug(slug);
  if (!status?.isLive) return null;

  return (
    <span className="absolute -top-1 -right-1 inline-flex items-center gap-0.5 rounded-full bg-[#fb2c36] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md z-10">
      <span className="size-1.5 rounded-full bg-white opacity-80 animate-pulse" />
      LIVE
    </span>
  );
}
