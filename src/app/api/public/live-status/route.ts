import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectLiveVideos } from "@/lib/projectp/live-detect";

/**
 * GET /api/public/live-status
 *
 * 全メンバーの「今ライブ中か？」を返す公開エンドポイント。
 *
 * キャッシュ戦略:
 *   - Supabase の live_status.updated_at が 30秒以内なら、その値をそのまま返す
 *   - 30秒以上古い、または未登録なら、YouTube API を叩き直して更新
 *
 * クライアントはこれを 30 秒ごとにポーリングする想定。
 * サーバー側で 30 秒キャッシュがあるので、複数ユーザーが見ていても
 * API クォータは 30 秒に 1回ぶんしか消費しない。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CACHE_TTL_MS = 30 * 1000;

type StatusRow = {
  memberId: string;
  memberName: string;
  slug: string | null;
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  thumbnailUrl: string | null;
  concurrentViewers: number | null;
  startedAt: string | null;
  updatedAt: string;
};

export async function GET() {
  const supabase = createAdminClient();

  // 連携済み members と直近動画IDキャッシュを取得
  const { data: membersRows, error: mErr } = await supabase
    .from("members")
    .select("id, name, recent_video_ids")
    .eq("is_active", true)
    .not("google_refresh_token", "is", null);

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }

  const members = membersRows ?? [];
  const nowIso = new Date().toISOString();

  // 既存の live_status を取得
  const { data: existingStatus } = await supabase
    .from("live_status")
    .select("*")
    .in(
      "member_id",
      members.map((m) => m.id)
    );

  type StatusRowDB = NonNullable<typeof existingStatus>[number];
  const statusByMember = new Map<string, StatusRowDB>();
  for (const s of existingStatus ?? []) {
    statusByMember.set(s.member_id, s);
  }

  // キャッシュ有効性判定：全員ぶんの最新 updated_at が 30秒以内ならキャッシュヒット
  const now = Date.now();
  const hasFreshCache =
    members.length > 0 &&
    members.every((m) => {
      const st = statusByMember.get(m.id);
      if (!st) return false;
      const age = now - new Date(st.updated_at).getTime();
      return age < CACHE_TTL_MS;
    });

  if (!hasFreshCache) {
    // YouTube API を1回だけ叩いて全員ぶん更新
    const allVideoIds: string[] = [];
    const memberIdByVideoId = new Map<string, string>();

    for (const m of members) {
      const ids = Array.isArray(m.recent_video_ids)
        ? (m.recent_video_ids as string[])
        : [];
      for (const vid of ids) {
        allVideoIds.push(vid);
        memberIdByVideoId.set(vid, m.id);
      }
    }

    let lives: Awaited<ReturnType<typeof detectLiveVideos>> = [];
    try {
      lives = await detectLiveVideos(allVideoIds);
    } catch (e) {
      // API 失敗時はキャッシュを返してフォールバック（エラー情報も付ける）
      console.error("detectLiveVideos failed:", e);
    }

    const liveByMember = new Map<string, (typeof lives)[number]>();
    for (const l of lives) {
      const memberId = memberIdByVideoId.get(l.videoId);
      if (memberId) liveByMember.set(memberId, l);
    }

    // 全メンバーぶん upsert
    const rows = members.map((m) => {
      const live = liveByMember.get(m.id);
      return {
        member_id: m.id,
        is_live: Boolean(live),
        video_id: live?.videoId ?? null,
        title: live?.title ?? null,
        thumbnail_url: live?.thumbnailUrl ?? null,
        concurrent_viewers: live?.concurrentViewers ?? null,
        started_at: live?.startedAt ?? null,
        updated_at: nowIso,
      };
    });

    if (rows.length > 0) {
      await supabase
        .from("live_status")
        .upsert(rows, { onConflict: "member_id" });
    }

    // 返り値用に再構築
    for (const r of rows) {
      statusByMember.set(r.member_id, r);
    }
  }

  // data.ts の slug を取得するため import
  const { members: dummyMembers } = await import("@/lib/data");
  const nameToSlug = new Map<string, string>();
  for (const d of dummyMembers) nameToSlug.set(d.name, d.slug);

  const result: StatusRow[] = members.map((m) => {
    const st = statusByMember.get(m.id);
    return {
      memberId: m.id,
      memberName: m.name,
      slug: nameToSlug.get(m.name) ?? null,
      isLive: Boolean(st?.is_live),
      videoId: st?.video_id ?? null,
      title: st?.title ?? null,
      thumbnailUrl: st?.thumbnail_url ?? null,
      concurrentViewers: st?.concurrent_viewers ?? null,
      startedAt: st?.started_at ?? null,
      updatedAt: st?.updated_at ?? nowIso,
    };
  });

  return NextResponse.json(
    { liveMembers: result },
    {
      headers: {
        // ブラウザ/Vercel エッジでも短時間キャッシュ
        "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
      },
    }
  );
}
