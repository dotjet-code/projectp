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
  redeemedBy: string;
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

  const { data, error } = await supabase
    .from("prediction_rewards")
    .update({
      redeemed_at: new Date().toISOString(),
      redeemed_by: input.redeemedBy,
      redeemed_note: input.note ?? null,
    })
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
