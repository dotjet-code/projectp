import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveStage } from "./stage";

/**
 * 主役指名（人気投票）ヘルパー。
 * Sanrio キャラ大賞方式 + サイコロ:
 *   - 匿名 Cookie ベース
 *   - 1 日に何人にでも振れる
 *   - 同じ人には 1 日 1 回まで
 *   - 1 票あたり 1〜6 のランダム値 (サーバー決定)
 *
 * 集計は SUM(value)。
 */

function todayJst(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** サイコロ値の有効範囲 (d6) */
export const DICE_MIN = 1;
export const DICE_MAX = 6;

/**
 * 票を入れる。サイコロ値 (1〜6) は呼び出し側で生成済みのものを渡す。
 * 当日同じ人に 2 回目を入れようとすると unique 違反 (code=23505) を返す。
 */
export async function castShuyakuVote(
  cookieId: string,
  memberId: string,
  value: number,
): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  if (!Number.isInteger(value) || value < DICE_MIN || value > DICE_MAX) {
    return { ok: false, error: "invalid dice value" };
  }

  const supabase = createAdminClient();
  const stage = await getActiveStage().catch(() => null);
  const voteDate = todayJst();

  const { error } = await supabase.from("shuyaku_votes").insert({
    cookie_id: cookieId,
    member_id: memberId,
    period_id: stage?.id ?? null,
    vote_date: voteDate,
    value,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        code: "already_voted_today",
        error: "本日はもう指名済みです",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * この cookie が今日指名済みのメンバー一覧（出目つき）。
 */
export async function getTodaysShuyakuByCookie(
  cookieId: string,
): Promise<{ memberId: string; value: number }[]> {
  const supabase = createAdminClient();
  const voteDate = todayJst();
  const { data } = await supabase
    .from("shuyaku_votes")
    .select("member_id, value")
    .eq("cookie_id", cookieId)
    .eq("vote_date", voteDate);
  return (data ?? []).map((r) => ({
    memberId: r.member_id,
    value: r.value as number,
  }));
}

/**
 * 全期間 (アクティブ Stage 内) の主役指名スコアを member_id 別に集計。
 * 値 = SUM(value)。
 */
export async function getShuyakuTotalsByMember(
  periodId?: string | null,
): Promise<Map<string, number>> {
  const supabase = createAdminClient();
  let query = supabase.from("shuyaku_votes").select("member_id, value");
  if (periodId) {
    query = query.eq("period_id", periodId);
  }
  const { data, error } = await query;
  if (error) {
    return new Map();
  }
  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const v = (row.value as number | null) ?? 1;
    totals.set(row.member_id, (totals.get(row.member_id) ?? 0) + v);
  }
  return totals;
}

/**
 * アクティブ Stage の予想投票で各メンバーが「予想に登場した数」を集計。
 * 1 予想内でメンバーが何度登場しても 1 とカウント (ユーザー単位)。
 */
export async function getPredictionMentionsByMember(
  periodId?: string | null,
): Promise<Map<string, number>> {
  const supabase = createAdminClient();
  let query = supabase
    .from("predictions")
    .select("tansho, fukusho, nirenpuku, nirentan, sanrenpuku, sanrentan");
  if (periodId) {
    query = query.eq("period_id", periodId);
  }
  const { data, error } = await query;
  if (error) {
    return new Map();
  }
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const mentioned = new Set<string>();
    const fields: unknown[] = [
      row.tansho,
      row.fukusho,
      row.nirenpuku,
      row.nirentan,
      row.sanrenpuku,
      row.sanrentan,
    ];
    for (const f of fields) {
      if (Array.isArray(f)) {
        for (const v of f) {
          if (typeof v === "string") mentioned.add(v);
        }
      }
    }
    for (const id of mentioned) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return counts;
}
