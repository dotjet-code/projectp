import { createAdminClient } from "@/lib/supabase/admin";

export type FanProfile = {
  userId: string;
  displayName: string | null;
  phoneE164: string | null;
  phoneVerifiedAt: string | null;
  status: "active" | "flagged" | "banned";
  createdAt: string;
};

type Row = {
  user_id: string;
  display_name: string | null;
  phone_e164: string | null;
  phone_verified_at: string | null;
  status: string;
  created_at: string;
};

function mapRow(r: Row): FanProfile {
  const s = r.status === "flagged" || r.status === "banned" ? r.status : "active";
  return {
    userId: r.user_id,
    displayName: r.display_name,
    phoneE164: r.phone_e164,
    phoneVerifiedAt: r.phone_verified_at,
    status: s,
    createdAt: r.created_at,
  };
}

export type FanListEntry = FanProfile & {
  email: string | null;
  predictionCount: number;
  rewardCount: number;
  totalScore: number; // 採点済みの全予想の合計スコア
};

export async function listFans(query?: string): Promise<FanListEntry[]> {
  const supabase = createAdminClient();
  let q = supabase
    .from("fan_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (query && query.trim()) {
    q = q.ilike("display_name", `%${query.trim()}%`);
  }
  const { data: profiles, error } = await q;
  if (error || !profiles) return [];

  const userIds = (profiles as Row[]).map((r) => r.user_id);
  if (userIds.length === 0) return [];

  // auth.users から email を取得（admin API 経由）
  const { data: users } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const emailById = new Map<string, string | null>();
  for (const u of users?.users ?? []) {
    emailById.set(u.id, u.email ?? null);
  }

  const [{ data: preds }, { data: rewards }] = await Promise.all([
    supabase
      .from("predictions")
      .select("user_id, total_score")
      .in("user_id", userIds),
    supabase
      .from("prediction_rewards")
      .select("user_id")
      .in("user_id", userIds),
  ]);
  const predCount = new Map<string, number>();
  const totalScoreByUser = new Map<string, number>();
  for (const p of (preds ?? []) as {
    user_id: string;
    total_score: number | null;
  }[]) {
    predCount.set(p.user_id, (predCount.get(p.user_id) ?? 0) + 1);
    if (p.total_score !== null) {
      totalScoreByUser.set(
        p.user_id,
        (totalScoreByUser.get(p.user_id) ?? 0) + p.total_score
      );
    }
  }
  const rewardCount = new Map<string, number>();
  for (const r of (rewards ?? []) as { user_id: string }[]) {
    rewardCount.set(r.user_id, (rewardCount.get(r.user_id) ?? 0) + 1);
  }

  return (profiles as Row[]).map((r) => ({
    ...mapRow(r),
    email: emailById.get(r.user_id) ?? null,
    predictionCount: predCount.get(r.user_id) ?? 0,
    rewardCount: rewardCount.get(r.user_id) ?? 0,
    totalScore: totalScoreByUser.get(r.user_id) ?? 0,
  }));
}

export type FanDetail = {
  profile: FanProfile;
  email: string | null;
  predictions: Array<{
    predictionId: number;
    periodName: string | null;
    periodStartDate: string | null;
    periodEndDate: string | null;
    totalScore: number | null;
    createdAt: string;
  }>;
  rewards: Array<{
    id: number;
    rewardType: string;
    rewardCode: string;
    totalScore: number | null;
    issuedAt: string;
    redeemedAt: string | null;
  }>;
};

export async function getFanDetail(userId: string): Promise<FanDetail | null> {
  const supabase = createAdminClient();
  const { data: p } = await supabase
    .from("fan_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!p) return null;

  const [preds, rewards, userRes] = await Promise.all([
    supabase
      .from("predictions")
      .select("id, total_score, created_at, periods(name, start_date, end_date)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("prediction_rewards")
      .select("id, reward_type, reward_code, total_score, issued_at, redeemed_at")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false }),
    supabase.auth.admin.getUserById(userId),
  ]);

  type PredJoin = {
    id: number;
    total_score: number | null;
    created_at: string;
    periods:
      | { name: string | null; start_date: string | null; end_date: string | null }
      | null;
  };
  type RewardRow = {
    id: number;
    reward_type: string;
    reward_code: string;
    total_score: number | null;
    issued_at: string;
    redeemed_at: string | null;
  };

  return {
    profile: mapRow(p as Row),
    email: userRes.data.user?.email ?? null,
    predictions: ((preds.data ?? []) as unknown as PredJoin[]).map((r) => ({
      predictionId: r.id,
      periodName: r.periods?.name ?? null,
      periodStartDate: r.periods?.start_date ?? null,
      periodEndDate: r.periods?.end_date ?? null,
      totalScore: r.total_score,
      createdAt: r.created_at,
    })),
    rewards: ((rewards.data ?? []) as RewardRow[]).map((r) => ({
      id: r.id,
      rewardType: r.reward_type,
      rewardCode: r.reward_code,
      totalScore: r.total_score,
      issuedAt: r.issued_at,
      redeemedAt: r.redeemed_at,
    })),
  };
}

export async function getFanProfile(userId: string): Promise<FanProfile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("fan_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Row);
}

/**
 * ファンプロフィールが無ければ作成。既に存在すればそのまま返す。
 * signup_ip/ua は新規作成時のみ記録。
 */
export async function ensureFanProfile(input: {
  userId: string;
  signupIp?: string | null;
  signupUa?: string | null;
}): Promise<FanProfile> {
  const existing = await getFanProfile(input.userId);
  if (existing) return existing;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("fan_profiles")
    .insert({
      user_id: input.userId,
      signup_ip: input.signupIp ?? null,
      signup_ua: input.signupUa ?? null,
    })
    .select()
    .single();
  if (error) {
    // 競合で他リクエストが先に作った場合を救済
    const again = await getFanProfile(input.userId);
    if (again) return again;
    throw new Error(error.message);
  }
  return mapRow(data as Row);
}
