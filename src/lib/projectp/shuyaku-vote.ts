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
    kind: "daily",
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

// ===== 「今日の賽」(チンチロ式ボーナス票) =====

export type ChinchiroHand =
  | "pinzoro"   // 1-1-1
  | "zorome"    // X-X-X (X≠1)
  | "shigoro"   // 4-5-6
  | "normal"    // 2個同じ + 1個独立
  | "hifumi"    // 1-2-3
  | "menashi";  // 全バラで役無し (再振り対象)

export interface ChinchiroResult {
  dice: [number, number, number];
  hand: ChinchiroHand;
  /** この役で加算する票数 (再振り前の menashi は 0) */
  value: number;
  /** 表示用の役名 (日本語) */
  handLabel: string;
}

/**
 * 3 個の出目から役を判定する。
 * 入力は crypto で生成した d6 × 3。
 */
export function judgeChinchiro(
  d1: number,
  d2: number,
  d3: number,
): ChinchiroResult {
  const dice: [number, number, number] = [d1, d2, d3];
  const sorted = [...dice].sort((a, b) => a - b);
  const [a, b, c] = sorted;

  // ピンゾロ (1-1-1)
  if (a === 1 && b === 1 && c === 1) {
    return { dice, hand: "pinzoro", value: 15, handLabel: "ピンゾロ" };
  }
  // ゾロ目 (X-X-X, X≠1)
  if (a === b && b === c) {
    return { dice, hand: "zorome", value: a * 2, handLabel: `${a}のゾロ目` };
  }
  // シゴロ (4-5-6)
  if (a === 4 && b === 5 && c === 6) {
    return { dice, hand: "shigoro", value: 8, handLabel: "シゴロ" };
  }
  // ヒフミ (1-2-3)  ※シンプル版では 1票救済
  if (a === 1 && b === 2 && c === 3) {
    return { dice, hand: "hifumi", value: 1, handLabel: "ヒフミ" };
  }
  // 通常役 (2 個そろい + 1 個独立 → 独立の目の数)
  if (a === b && b !== c) {
    return { dice, hand: "normal", value: c, handLabel: `${a}の対 + ${c}` };
  }
  if (b === c && a !== b) {
    return { dice, hand: "normal", value: a, handLabel: `${b}の対 + ${a}` };
  }
  // 全バラで役なし (振り直し候補)
  return { dice, hand: "menashi", value: 0, handLabel: "目なし" };
}

/**
 * チンチロ票を入れる。
 * 1 日 1 回の制約は DB 側 partial unique index で担保。
 */
export async function castChinchiroVote(
  cookieId: string,
  memberId: string,
  result: ChinchiroResult,
): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  if (!Number.isInteger(result.value) || result.value < 0 || result.value > 30) {
    return { ok: false, error: "invalid chinchiro value" };
  }
  if (result.dice.length !== 3) {
    return { ok: false, error: "invalid dice tuple" };
  }

  const supabase = createAdminClient();
  const stage = await getActiveStage().catch(() => null);
  const voteDate = todayJst();

  const { error } = await supabase.from("shuyaku_votes").insert({
    cookie_id: cookieId,
    member_id: memberId,
    period_id: stage?.id ?? null,
    vote_date: voteDate,
    value: result.value,
    kind: "chinchiro",
    dice: result.dice,
    hand: result.hand,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        code: "already_rolled_today",
        error: "本日の賽は振り終えています",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * この cookie が今日チンチロを既に振ったか。
 * 振った場合は結果も返す (UI の「振り直し禁止」判定 + 結果再表示に使う)。
 */
export async function getTodaysChinchiroByCookie(
  cookieId: string,
): Promise<{ memberId: string; value: number; dice: number[]; hand: string } | null> {
  const supabase = createAdminClient();
  const voteDate = todayJst();
  const { data } = await supabase
    .from("shuyaku_votes")
    .select("member_id, value, dice, hand")
    .eq("cookie_id", cookieId)
    .eq("vote_date", voteDate)
    .eq("kind", "chinchiro")
    .maybeSingle();
  if (!data) return null;
  return {
    memberId: data.member_id,
    value: data.value as number,
    dice: (data.dice as number[] | null) ?? [],
    hand: (data.hand as string | null) ?? "normal",
  };
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
