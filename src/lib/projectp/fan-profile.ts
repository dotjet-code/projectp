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
      .select("user_id")
      .in("user_id", userIds),
    supabase
      .from("prediction_rewards")
      .select("user_id")
      .in("user_id", userIds),
  ]);
  const predCount = new Map<string, number>();
  for (const p of (preds ?? []) as { user_id: string }[]) {
    predCount.set(p.user_id, (predCount.get(p.user_id) ?? 0) + 1);
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
  }));
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
