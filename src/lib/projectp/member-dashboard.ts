import { createAdminClient } from "@/lib/supabase/admin";
import { getRankedMembers, type RankedMember } from "./live-stats";

export type MemberDashboardData = {
  memberId: string;
  name: string;
  rank: number;
  totalMembers: number;
  points: number;
  role: "PLAYER" | "PIT";
  stats: {
    buzz: number;
    concurrent: number;
    revenue: number;
  };
  // 前 Stage からの順位変動
  rankChange: number | null;
  // 上位への差
  pointsToNextRank: number | null;
  // ファンの予想で自分を選んだ人数
  fanPredictionCount: number;
};

/**
 * auth.users.id からリンクされたメンバー ID を取得。
 */
export async function getMemberIdByAuthUser(
  authUserId: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

/**
 * メンバーのダッシュボードデータを取得。
 */
export async function getMemberDashboard(
  memberId: string
): Promise<MemberDashboardData | null> {
  const ranked = await getRankedMembers();
  const me = ranked.find((m) => String(m.id) === memberId);
  if (!me) return null;

  const totalMembers = ranked.filter((m) => m.name !== "Coming Soon").length;

  // 上位との差
  let pointsToNextRank: number | null = null;
  if (me.rank > 1) {
    const above = ranked.find((m) => m.rank === me.rank - 1);
    if (above) pointsToNextRank = above.points - me.points;
  }

  // ファンの予想で自分を選んだ人数 (全賭式・全 Stage 合計)
  const supabase = createAdminClient();
  let fanPredictionCount = 0;
  try {
    const { data } = await supabase
      .from("predictions")
      .select("tansho, fukusho, nirenpuku, nirentan, sanrenpuku, sanrentan")
      .not("user_id", "is", null);
    for (const r of (data ?? []) as Record<string, unknown>[]) {
      for (const key of [
        "tansho",
        "fukusho",
        "nirenpuku",
        "nirentan",
        "sanrenpuku",
        "sanrentan",
      ]) {
        const arr = r[key];
        if (Array.isArray(arr) && arr.includes(memberId)) {
          fanPredictionCount++;
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    memberId,
    name: me.name,
    rank: me.rank,
    totalMembers,
    points: me.points,
    role: me.role as "PLAYER" | "PIT",
    stats: me.detail.stats,
    rankChange: null, // 将来 Stage 比較で実装
    pointsToNextRank,
    fanPredictionCount,
  };
}

/**
 * メンバーの収支提出履歴。
 */
export type MemberSubmission = {
  id: number;
  periodName: string | null;
  imageUrl: string;
  purchaseAmount: number;
  payoutAmount: number;
  profit: number;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  broadcastDate: string | null;
  venue: string | null;
  createdAt: string;
};

export async function getMemberSubmissions(
  memberId: string
): Promise<MemberSubmission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("balance_submissions")
    .select(
      "id, image_url, purchase_amount, payout_amount, profit, status, review_note, broadcast_date, venue, created_at, periods:period_id(name)"
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  type Row = {
    id: number;
    image_url: string;
    purchase_amount: number;
    payout_amount: number;
    profit: number;
    status: string;
    review_note: string | null;
    broadcast_date: string | null;
    venue: string | null;
    created_at: string;
    periods: { name: string | null } | null;
  };

  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    periodName: r.periods?.name ?? null,
    imageUrl: r.image_url,
    purchaseAmount: r.purchase_amount,
    payoutAmount: r.payout_amount,
    profit: r.profit,
    status: (r.status === "approved" || r.status === "rejected"
      ? r.status
      : "pending") as "pending" | "approved" | "rejected",
    reviewNote: r.review_note,
    broadcastDate: r.broadcast_date,
    venue: r.venue,
    createdAt: r.created_at,
  }));
}
