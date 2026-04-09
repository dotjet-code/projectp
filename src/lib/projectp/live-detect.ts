/**
 * ライブ配信中判定ユーティリティ。
 *
 * 認可 (OAuth) 不要の GOOGLE_API_KEY ベースで videos.list を叩き、
 * 動画ID配列のうち「ライブ配信中」のものを抽出する。
 *
 * コスト: 1リクエスト 1 unit、最大 50 動画ID までバッチ可能
 */

export type LiveDetectionResult = {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  concurrentViewers: number;
  startedAt: string;
};

type VideoItem = {
  id: string;
  snippet?: {
    title?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
      standard?: { url?: string };
      maxres?: { url?: string };
    };
  };
  liveStreamingDetails?: {
    actualStartTime?: string;
    actualEndTime?: string;
    concurrentViewers?: string;
  };
};

/**
 * 動画IDの配列を受け取り、ライブ配信中のものだけ返す。
 *
 * ライブ中の判定:
 *   actualStartTime が存在する（=配信開始した）
 *   actualEndTime が存在しない（=まだ終わっていない）
 *   concurrentViewers が存在する（=現在視聴中の人がいる）
 */
export async function detectLiveVideos(
  videoIds: string[]
): Promise<LiveDetectionResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not configured");
  if (videoIds.length === 0) return [];

  const uniqueIds = [...new Set(videoIds)];
  const results: LiveDetectionResult[] = [];

  // YouTube Data API は id パラメータ最大50件
  for (let i = 0; i < uniqueIds.length; i += 50) {
    const chunk = uniqueIds.slice(i, i + 50);
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,liveStreamingDetails");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      // サーバーサイドのみで使うので next キャッシュに載せない
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`videos.list failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as { items?: VideoItem[] };

    for (const v of data.items ?? []) {
      const d = v.liveStreamingDetails;
      if (!d?.actualStartTime) continue;
      if (d.actualEndTime) continue;
      if (!d.concurrentViewers) continue;

      const thumb =
        v.snippet?.thumbnails?.medium?.url ??
        v.snippet?.thumbnails?.high?.url ??
        v.snippet?.thumbnails?.default?.url ??
        null;

      results.push({
        videoId: v.id,
        title: v.snippet?.title ?? "",
        thumbnailUrl: thumb,
        concurrentViewers: Number(d.concurrentViewers),
        startedAt: d.actualStartTime,
      });
    }
  }

  return results;
}
