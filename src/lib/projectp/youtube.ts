import {
  getYoutubeAnalyticsClient,
  getYoutubeDataClient,
} from "@/lib/google/clients";
import type { Period } from "./period";

/**
 * Project P 用 YouTube データ取得ユーティリティ。
 *
 * 認可済みメンバーの refresh_token を渡して、各種指標を返す。
 */

// =====================================================================
// チャンネル基本情報
// =====================================================================
export type ChannelInfo = {
  channelId: string;
  title: string;
  uploadsPlaylistId: string;
  subscriberCount: number;
  viewCount: number;
};

export async function fetchMyChannel(refreshToken: string): Promise<ChannelInfo> {
  const yt = getYoutubeDataClient(refreshToken);
  const res = await yt.channels.list({
    part: ["id", "snippet", "contentDetails", "statistics"],
    mine: true,
  });
  const ch = res.data.items?.[0];
  if (!ch?.id) throw new Error("channel not found");
  return {
    channelId: ch.id,
    title: ch.snippet?.title ?? "",
    uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads ?? "",
    subscriberCount: Number(ch.statistics?.subscriberCount ?? 0),
    viewCount: Number(ch.statistics?.viewCount ?? 0),
  };
}

// =====================================================================
// バズ指標
// 期間内に投稿された動画のうち、最も再生された1本
// =====================================================================
export type TopVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number;
};

export async function fetchTopVideoInPeriod(
  refreshToken: string,
  uploadsPlaylistId: string,
  period: Period
): Promise<TopVideo | null> {
  const yt = getYoutubeDataClient(refreshToken);

  // 1) uploads プレイリストから期間内の動画を集める
  const candidates: { videoId: string; publishedAt: string }[] = [];
  let pageToken: string | undefined;
  // 安全のため最大10ページ (50 * 10 = 500件) まで
  for (let page = 0; page < 10; page++) {
    const res = await yt.playlistItems.list({
      part: ["contentDetails"],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken,
    });
    const items = res.data.items ?? [];
    let stopPaging = false;
    for (const it of items) {
      const vid = it.contentDetails?.videoId;
      const publishedAt = it.contentDetails?.videoPublishedAt;
      if (!vid || !publishedAt) continue;
      const t = new Date(publishedAt).getTime();
      if (t >= period.end.getTime()) continue; // 期間より新しい
      if (t < period.start.getTime()) {
        // 並び順は新しい順なので、ここまで来たら以降は確実に期間外
        stopPaging = true;
        continue;
      }
      candidates.push({ videoId: vid, publishedAt });
    }
    if (stopPaging) break;
    pageToken = res.data.nextPageToken ?? undefined;
    if (!pageToken) break;
  }

  if (candidates.length === 0) return null;

  // 2) videos.list で再生数を一括取得（最大50件ずつ）
  let top: TopVideo | null = null;
  for (let i = 0; i < candidates.length; i += 50) {
    const chunk = candidates.slice(i, i + 50);
    const res = await yt.videos.list({
      part: ["snippet", "statistics"],
      id: chunk.map((c) => c.videoId),
    });
    for (const v of res.data.items ?? []) {
      const views = Number(v.statistics?.viewCount ?? 0);
      if (!top || views > top.viewCount) {
        top = {
          videoId: v.id ?? "",
          title: v.snippet?.title ?? "",
          publishedAt: v.snippet?.publishedAt ?? "",
          viewCount: views,
        };
      }
    }
  }
  return top;
}

// =====================================================================
// 同接（ライブ）指標
// 期間内に開始されたライブ配信を列挙し、Analytics API でライブ視聴回数を集計
// =====================================================================
export type LiveBroadcastSummary = {
  videoId: string;
  title: string;
  actualStartTime: string;
  actualEndTime: string | null;
  liveViews: number;       // ライブ中の視聴回数 (Analytics API)
  peakConcurrent: number;  // ピーク同接 (Analytics API)
};

export type LiveAggregate = {
  totalLiveViews: number;
  totalPeakConcurrentSum: number;
  broadcastCount: number;
  broadcasts: LiveBroadcastSummary[];
};

export async function fetchLiveAggregate(
  refreshToken: string,
  uploadsPlaylistId: string,
  period: Period
): Promise<LiveAggregate> {
  const yt = getYoutubeDataClient(refreshToken);
  const ytAnalytics = getYoutubeAnalyticsClient(refreshToken);

  // 1) uploads プレイリストから期間内候補動画を取得
  const candidateIds: string[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 10; page++) {
    const res = await yt.playlistItems.list({
      part: ["contentDetails"],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken,
    });
    const items = res.data.items ?? [];
    let stopPaging = false;
    for (const it of items) {
      const vid = it.contentDetails?.videoId;
      const publishedAt = it.contentDetails?.videoPublishedAt;
      if (!vid || !publishedAt) continue;
      const t = new Date(publishedAt).getTime();
      if (t >= period.end.getTime()) continue;
      if (t < period.start.getTime()) {
        stopPaging = true;
        continue;
      }
      candidateIds.push(vid);
    }
    if (stopPaging) break;
    pageToken = res.data.nextPageToken ?? undefined;
    if (!pageToken) break;
  }

  if (candidateIds.length === 0) {
    return {
      totalLiveViews: 0,
      totalPeakConcurrentSum: 0,
      broadcastCount: 0,
      broadcasts: [],
    };
  }

  // 2) videos.list で liveStreamingDetails を取り、ライブ配信だけに絞る
  const liveBroadcasts: {
    videoId: string;
    title: string;
    actualStartTime: string;
    actualEndTime: string | null;
  }[] = [];

  for (let i = 0; i < candidateIds.length; i += 50) {
    const chunk = candidateIds.slice(i, i + 50);
    const res = await yt.videos.list({
      part: ["snippet", "liveStreamingDetails"],
      id: chunk,
    });
    for (const v of res.data.items ?? []) {
      const details = v.liveStreamingDetails;
      if (!details?.actualStartTime) continue; // ライブではない (or 配信前)
      const t = new Date(details.actualStartTime).getTime();
      if (t < period.start.getTime() || t >= period.end.getTime()) continue;
      liveBroadcasts.push({
        videoId: v.id ?? "",
        title: v.snippet?.title ?? "",
        actualStartTime: details.actualStartTime,
        actualEndTime: details.actualEndTime ?? null,
      });
    }
  }

  if (liveBroadcasts.length === 0) {
    return {
      totalLiveViews: 0,
      totalPeakConcurrentSum: 0,
      broadcastCount: 0,
      broadcasts: [],
    };
  }

  // 3) Analytics API で各ライブの「ライブ中の視聴回数」「ピーク同接」を取得
  // ドキュメント:
  //   https://developers.google.com/youtube/analytics/reference/reports
  //   metric `views` を `liveOrOnDemand` ディメンションで分割すると LIVE のみの視聴が取れる
  //   `peakConcurrentViewers` メトリックでピーク同接が取れる
  const summaries: LiveBroadcastSummary[] = [];
  for (const b of liveBroadcasts) {
    // 各動画について Analytics API を叩く
    // - startDate / endDate は YYYY-MM-DD（YouTube Analytics の対応）
    // - filters=video==<id>;liveOrOnDemand==LIVE で対象を絞る
    const dayStart = b.actualStartTime.slice(0, 10);
    const dayEnd = (b.actualEndTime ?? b.actualStartTime).slice(0, 10);
    let liveViews = 0;
    let peakConcurrent = 0;

    try {
      const res = await ytAnalytics.reports.query({
        ids: "channel==MINE",
        startDate: dayStart,
        endDate: dayEnd,
        metrics: "views,peakConcurrentViewers",
        filters: `video==${b.videoId};liveOrOnDemand==LIVE`,
      });
      const row = res.data.rows?.[0];
      if (row) {
        liveViews = Number(row[0] ?? 0);
        peakConcurrent = Number(row[1] ?? 0);
      }
    } catch {
      // 取れない場合は 0 のまま（権限・期間外・未集計など）
    }

    summaries.push({
      ...b,
      liveViews,
      peakConcurrent,
    });
  }

  return {
    totalLiveViews: summaries.reduce((s, b) => s + b.liveViews, 0),
    totalPeakConcurrentSum: summaries.reduce((s, b) => s + b.peakConcurrent, 0),
    broadcastCount: summaries.length,
    broadcasts: summaries,
  };
}
