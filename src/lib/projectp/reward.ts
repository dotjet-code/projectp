import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type RewardType = "live_vote_bonus" | "cheki_free";

export const REWARD_LABELS: Record<RewardType, string> = {
  live_vote_bonus: "ライブ会場投票ボーナス票",
  cheki_free: "チェキ券1枚無料",
};

export type Reward = {
  id: number;
  userId: string;
  periodId: string;
  predictionId: number | null;
  rewardType: RewardType;
  rewardCode: string;
  totalScore: number | null;
  issuedAt: string;
  redeemedAt: string | null;
  expiresAt: string | null;
};

type Row = {
  id: number;
  user_id: string;
  period_id: string;
  prediction_id: number | null;
  reward_type: string;
  reward_code: string;
  total_score: number | null;
  issued_at: string;
  redeemed_at: string | null;
  expires_at: string | null;
};

export function isExpired(reward: Reward, now = new Date()): boolean {
  if (!reward.expiresAt) return false;
  return new Date(reward.expiresAt).getTime() < now.getTime();
}

function asRewardType(s: string): RewardType {
  return s === "cheki_free" ? "cheki_free" : "live_vote_bonus";
}

function mapRow(r: Row): Reward {
  return {
    id: r.id,
    userId: r.user_id,
    periodId: r.period_id,
    predictionId: r.prediction_id,
    rewardType: asRewardType(r.reward_type),
    rewardCode: r.reward_code,
    totalScore: r.total_score,
    issuedAt: r.issued_at,
    redeemedAt: r.redeemed_at,
    expiresAt: r.expires_at,
  };
}

/**
 * 10文字の推測困難なコードを生成。誤読しやすい文字 (0/O, 1/I/L) を除外。
 */
function generateRewardCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export type RewardCandidate = {
  userId: string;
  displayName: string | null;
  email: string | null;
  totalScore: number | null;
  willIssue: boolean; // false なら既発行済
};

/**
 * 発行せずに対象者数と具体リストを計算する dry-run。
 * eligible: 条件を満たすファン数(banned 除外後)
 * alreadyIssued: 既発行分の内訳
 * willIssue: 今回発行される数
 * candidates: 対象者の上位(スコア降順、最大 50 件)
 */
export async function previewRewardCandidates(input: {
  periodId: string;
  rewardType: RewardType;
  minScore: number;
}): Promise<{
  eligible: number;
  alreadyIssued: number;
  willIssue: number;
  maxScore: number | null;
  candidates: RewardCandidate[];
}> {
  const supabase = createAdminClient();

  const { data: preds } = await supabase
    .from("predictions")
    .select("user_id, total_score")
    .eq("period_id", input.periodId)
    .not("user_id", "is", null)
    .gte("total_score", input.minScore)
    .order("total_score", { ascending: false });

  const rawRows = (preds ?? []) as Array<{
    user_id: string;
    total_score: number | null;
  }>;
  const userIds = rawRows.map((r) => r.user_id);

  // banned/flagged 除外 + 表示名取得
  const nameById = new Map<string, string | null>();
  const blocked = new Set<string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("fan_profiles")
      .select("user_id, display_name, status")
      .in("user_id", userIds);
    for (const p of (profiles ?? []) as {
      user_id: string;
      display_name: string | null;
      status: string;
    }[]) {
      nameById.set(p.user_id, p.display_name);
      if (p.status !== "active") blocked.add(p.user_id);
    }
  }
  const rows = rawRows.filter((r) => !blocked.has(r.user_id));

  // 既発行分
  const { data: existing } = await supabase
    .from("prediction_rewards")
    .select("user_id")
    .eq("period_id", input.periodId)
    .eq("reward_type", input.rewardType);
  const alreadyIssuedIds = new Set(
    ((existing ?? []) as { user_id: string }[]).map((r) => r.user_id)
  );

  const willIssue = rows.filter((r) => !alreadyIssuedIds.has(r.user_id)).length;
  const maxScore = rawRows.reduce<number | null>((max, r) => {
    if (r.total_score === null) return max;
    return max === null || r.total_score > max ? r.total_score : max;
  }, null);

  // 対象者の上位をファン情報付きで取得 (最大 50)
  const topUsers = rows.slice(0, 50);
  const emailById = new Map<string, string | null>();
  if (topUsers.length > 0) {
    try {
      const { data: users } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const topIds = new Set(topUsers.map((r) => r.user_id));
      for (const u of users?.users ?? []) {
        if (topIds.has(u.id)) emailById.set(u.id, u.email ?? null);
      }
    } catch {
      // ignore
    }
  }

  const candidates: RewardCandidate[] = topUsers.map((r) => ({
    userId: r.user_id,
    displayName: nameById.get(r.user_id) ?? null,
    email: emailById.get(r.user_id) ?? null,
    totalScore: r.total_score,
    willIssue: !alreadyIssuedIds.has(r.user_id),
  }));

  return {
    eligible: rows.length,
    alreadyIssued: alreadyIssuedIds.size,
    willIssue,
    maxScore,
    candidates,
  };
}

/**
 * 指定 Stage の予想の中で totalScore >= minScore のユーザーに景品を発行する。
 * スコアは 0〜63 (複勝 1 / 単勝 2 / 二連複 5 / 二連単 10 / 三連複 15 / 三連単 30)。
 * banned/flagged のファンおよび既に同種の景品が発行済のユーザーはスキップ。
 */
export async function issueRewardsForPeriod(input: {
  periodId: string;
  rewardType: RewardType;
  minScore: number;
  issuedBy: string;
  expiresAt?: string | null;
}): Promise<{ issued: number; skipped: number; rewards: Reward[] }> {
  const supabase = createAdminClient();

  // 対象: ログイン済ユーザー (user_id is not null) で minScore 以上
  const { data: preds, error } = await supabase
    .from("predictions")
    .select("id, user_id, total_score")
    .eq("period_id", input.periodId)
    .not("user_id", "is", null)
    .gte("total_score", input.minScore);
  if (error) throw new Error(error.message);

  const rawRows = (preds ?? []) as Array<{
    id: number;
    user_id: string;
    total_score: number | null;
  }>;

  // banned/flagged のファンは景品対象外
  const userIds = rawRows.map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from("fan_profiles")
    .select("user_id, status")
    .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const blocked = new Set(
    ((profiles ?? []) as { user_id: string; status: string }[])
      .filter((p) => p.status !== "active")
      .map((p) => p.user_id)
  );
  const rows = rawRows.filter((r) => !blocked.has(r.user_id));

  // 既発行分を取得
  const { data: existing } = await supabase
    .from("prediction_rewards")
    .select("user_id")
    .eq("period_id", input.periodId)
    .eq("reward_type", input.rewardType);
  const alreadyIssued = new Set(
    ((existing ?? []) as { user_id: string }[]).map((r) => r.user_id)
  );

  const toInsert = rows
    .filter((r) => !alreadyIssued.has(r.user_id))
    .map((r) => ({
      user_id: r.user_id,
      period_id: input.periodId,
      prediction_id: r.id,
      reward_type: input.rewardType,
      reward_code: generateRewardCode(),
      total_score: r.total_score,
      issued_by: input.issuedBy,
      expires_at: input.expiresAt ?? null,
    }));

  if (toInsert.length === 0) {
    return { issued: 0, skipped: rows.length, rewards: [] };
  }

  const { data: inserted, error: insErr } = await supabase
    .from("prediction_rewards")
    .insert(toInsert)
    .select();
  if (insErr) throw new Error(insErr.message);

  const rewards = ((inserted ?? []) as Row[]).map(mapRow);
  return {
    issued: rewards.length,
    skipped: rows.length - rewards.length,
    rewards,
  };
}

/**
 * コードを消込む。未消込のものだけ更新される（二重消込不可）。
 */
export async function redeemReward(input: {
  rewardCode: string;
  redeemedBy?: string | null;
  note?: string | null;
}): Promise<
  | { ok: true; reward: Reward }
  | { ok: false; reason: "not_found" | "already_redeemed" | "expired" }
> {
  const supabase = createAdminClient();
  const code = input.rewardCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "not_found" };

  const { data: existing } = await supabase
    .from("prediction_rewards")
    .select("*")
    .eq("reward_code", code)
    .maybeSingle();
  if (!existing) return { ok: false, reason: "not_found" };
  const row = existing as Row;
  if (row.redeemed_at) {
    return { ok: false, reason: "already_redeemed" };
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const updatePayload: Record<string, unknown> = {
    redeemed_at: new Date().toISOString(),
    redeemed_note: input.note ?? null,
  };
  // redeemed_by は UUID 外部キーなので、有効な UUID のみセット
  if (input.redeemedBy && input.redeemedBy.length === 36 && input.redeemedBy.includes("-")) {
    updatePayload.redeemed_by = input.redeemedBy;
  }

  const { data, error } = await supabase
    .from("prediction_rewards")
    .update(updatePayload)
    .eq("reward_code", code)
    .is("redeemed_at", null)
    .select()
    .single();
  if (error || !data) {
    return { ok: false, reason: "already_redeemed" };
  }
  return { ok: true, reward: mapRow(data as Row) };
}

export async function listRewardsForUser(userId: string): Promise<Reward[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("prediction_rewards")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  if (error) return [];
  return ((data ?? []) as Row[]).map(mapRow);
}

export async function listRewardsForPeriod(
  periodId: string
): Promise<Reward[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("prediction_rewards")
    .select("*")
    .eq("period_id", periodId)
    .order("issued_at", { ascending: false });
  if (error) return [];
  return ((data ?? []) as Row[]).map(mapRow);
}

export type RewardWithFan = Reward & {
  displayName: string | null;
  email: string | null;
};

/**
 * 管理画面向け: Reward + ファン情報 (表示名 + メール) を返す。
 */
export async function listRewardsForPeriodWithFan(
  periodId: string
): Promise<RewardWithFan[]> {
  const supabase = createAdminClient();
  const rewards = await listRewardsForPeriod(periodId);
  if (rewards.length === 0) return [];

  const userIds = Array.from(new Set(rewards.map((r) => r.userId)));

  // 表示名
  const { data: profiles } = await supabase
    .from("fan_profiles")
    .select("user_id, display_name")
    .in("user_id", userIds);
  const nameById = new Map<string, string | null>();
  for (const p of (profiles ?? []) as {
    user_id: string;
    display_name: string | null;
  }[]) {
    nameById.set(p.user_id, p.display_name);
  }

  // メール (auth.users から一括取得)
  const emailById = new Map<string, string | null>();
  try {
    const { data: users } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    for (const u of users?.users ?? []) {
      if (userIds.includes(u.id)) {
        emailById.set(u.id, u.email ?? null);
      }
    }
  } catch {
    // ignore
  }

  return rewards.map((r) => ({
    ...r,
    displayName: nameById.get(r.userId) ?? null,
    email: emailById.get(r.userId) ?? null,
  }));
}

/**
 * code から fan 情報付きで 1 件取得(消込時の本人確認用)。
 */
export async function getRewardByCodeWithFan(
  code: string
): Promise<RewardWithFan | null> {
  const supabase = createAdminClient();
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const { data } = await supabase
    .from("prediction_rewards")
    .select("*")
    .eq("reward_code", normalized)
    .maybeSingle();
  if (!data) return null;
  const reward = mapRow(data as Row);

  const { data: profile } = await supabase
    .from("fan_profiles")
    .select("display_name")
    .eq("user_id", reward.userId)
    .maybeSingle();
  let email: string | null = null;
  try {
    const { data: u } = await supabase.auth.admin.getUserById(reward.userId);
    email = u.user?.email ?? null;
  } catch {
    // ignore
  }
  return {
    ...reward,
    displayName:
      (profile as { display_name: string | null } | null)?.display_name ?? null,
    email,
  };
}
