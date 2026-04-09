"use client";

import { useLiveStatusBySlug } from "@/lib/projectp/live-status-client";

/**
 * メンバー詳細ページなどに置く「今ライブ配信中です」カード。
 * 配信中なら赤いバッジ + 現在視聴者数 + 視聴リンクを表示。
 * 配信していなければ何も描画しない。
 */
export function LiveNowIndicator({ slug }: { slug: string }) {
  const status = useLiveStatusBySlug(slug);
  if (!status?.isLive || !status.videoId) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${status.videoId}`;

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#fb2c36] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_20px_rgba(251,44,54,0.3)] hover:shadow-[0_10px_25px_rgba(251,44,54,0.45)] transition"
    >
      <span className="size-2 rounded-full bg-white animate-pulse" />
      <span>LIVE 配信中</span>
      {status.concurrentViewers !== null && (
        <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">
          {status.concurrentViewers.toLocaleString()} 人視聴中
        </span>
      )}
    </a>
  );
}
