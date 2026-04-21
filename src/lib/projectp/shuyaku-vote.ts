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
  | "hifumi"    // 1-2-3  ベスト版では「全員にお裾分け」
  | "menashi";  // 全バラで役無し (再振り対象)

export interface ChinchiroResult {
  dice: [number, number, number];
  hand: ChinchiroHand;
  /** 選んだメンバー 1 人に加算する票数 (ヒフミ時は 1、全員お裾分けは別計算) */
  value: number;
  /** 表示用の役名 (日本語) */
  handLabel: string;
}

/**
 * 3 個の出目から役を判定する。
 * 入力は crypto で生成した d6 × 3。
 *
 * ベスト版の票数:
 *   - ピンゾロ (1-1-1)     : 100 票
 *   - ゾロ目 (X-X-X, X≠1)  : X × 2 票 (2-2-2=4 〜 6-6-6=12)
 *   - シゴロ (4-5-6)       : 8 票
 *   - 通常役 (2 揃+1 独)   : 独の目 1-6 票
 *   - ヒフミ (1-2-3)       : 1 票 (呼び出し側で全員お裾分けに展開)
 *   - 目なし               : 0 票 (呼び出し側で再振り)
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
    return { dice, hand: "pinzoro", value: 100, handLabel: "ピンゾロ" };
  }
  // ゾロ目 (X-X-X, X≠1)
  if (a === b && b === c) {
    return { dice, hand: "zorome", value: a * 2, handLabel: `${a}のゾロ目` };
  }
  // シゴロ (4-5-6)
  if (a === 4 && b === 5 && c === 6) {
    return { dice, hand: "shigoro", value: 8, handLabel: "シゴロ" };
  }
  // ヒフミ (1-2-3)
  if (a === 1 && b === 2 && c === 3) {
    return { dice, hand: "hifumi", value: 1, handLabel: "ヒフミ" };
  }
  // 通常役 (2 個そろい + 1 個独立 → 独立の目の数)
  if (a === b && b !== c) {
    return { dice, hand: "normal", value: c, handLabel: `${c}の目` };
  }
  if (b === c && a !== b) {
    return { dice, hand: "normal", value: a, handLabel: `${a}の目` };
  }
  // 全バラで役なし (振り直し候補)
  return { dice, hand: "menashi", value: 0, handLabel: "目なし" };
}

export interface ChinchiroRollRecord {
  cookieId: string;
  voteDate: string;
  hand: ChinchiroHand;
  dice: number[];
  pickedMemberId: string;
  totalValue: number;
  streakDays: number;
  sharedAt: string | null;
}

/**
 * チンチロを振る = 2 段階アトミック:
 *   (1) chinchiro_rolls に INSERT (PK 重複なら「今日は既に振り済み」)
 *   (2) shuyaku_votes に結果票を INSERT (ヒフミは全員 1票、他は選んだ 1 人に票数)
 *
 * ストリークは直前日 (vote_date = 今日 - 1日) の行を参照。
 */
export async function castChinchiroRoll(
  cookieId: string,
  pickedMemberId: string,
  result: ChinchiroResult,
  allMemberIds: string[],
): Promise<
  | { ok: true; record: ChinchiroRollRecord }
  | { ok: false; error: string; code?: string }
> {
  if (!Number.isInteger(result.value) || result.value < 0 || result.value > 200) {
    return { ok: false, error: "invalid chinchiro value" };
  }
  if (result.dice.length !== 3) {
    return { ok: false, error: "invalid dice tuple" };
  }
  if (allMemberIds.length < 1) {
    return { ok: false, error: "member list is empty" };
  }

  const supabase = createAdminClient();
  const stage = await getActiveStage().catch(() => null);
  const voteDate = todayJst();

  // ストリーク: 昨日 (JST) に振っていたら +1、そうでなければ 1 に戻る
  const yesterday = (() => {
    const d = new Date(voteDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const { data: yesterdayRow } = await supabase
    .from("chinchiro_rolls")
    .select("streak_days")
    .eq("cookie_id", cookieId)
    .eq("vote_date", yesterday)
    .maybeSingle();
  const streakDays = yesterdayRow?.streak_days
    ? (yesterdayRow.streak_days as number) + 1
    : 1;

  // 合計票数: ヒフミは全員分 (= 全メンバー数 × 1 票) に展開
  const totalValue =
    result.hand === "hifumi" ? allMemberIds.length : result.value;

  // (1) chinchiro_rolls に INSERT — 重複は 23505 で弾く (1 日 1 回のアトミック保証)
  const { error: rollErr } = await supabase.from("chinchiro_rolls").insert({
    cookie_id: cookieId,
    vote_date: voteDate,
    hand: result.hand,
    dice: result.dice,
    picked_member_id: pickedMemberId,
    total_value: totalValue,
    streak_days: streakDays,
  });
  if (rollErr) {
    if (rollErr.code === "23505") {
      return {
        ok: false,
        code: "already_rolled_today",
        error: "本日の賽は振り終えています",
      };
    }
    return { ok: false, error: rollErr.message };
  }

  // (2) shuyaku_votes に結果票を INSERT
  const rows =
    result.hand === "hifumi"
      ? allMemberIds.map((memberId) => ({
          cookie_id: cookieId,
          member_id: memberId,
          period_id: stage?.id ?? null,
          vote_date: voteDate,
          value: 1,
          kind: "chinchiro",
          dice: result.dice,
          hand: "hifumi",
        }))
      : [
          {
            cookie_id: cookieId,
            member_id: pickedMemberId,
            period_id: stage?.id ?? null,
            vote_date: voteDate,
            value: result.value,
            kind: "chinchiro",
            dice: result.dice,
            hand: result.hand,
          },
        ];

  const { error: voteErr } = await supabase.from("shuyaku_votes").insert(rows);
  if (voteErr) {
    // このパスに入るのは ほぼ発生しない (chinchiro_rolls で原子化済)
    return { ok: false, error: voteErr.message };
  }

  return {
    ok: true,
    record: {
      cookieId,
      voteDate,
      hand: result.hand,
      dice: result.dice,
      pickedMemberId,
      totalValue,
      streakDays,
      sharedAt: null,
    },
  };
}

/**
 * この cookie が今日チンチロを振ったかを返す。
 * 振っていれば記録 (役名・出目・ストリーク) も併せて返す。
 */
export async function getTodaysChinchiroByCookie(
  cookieId: string,
): Promise<ChinchiroRollRecord | null> {
  const supabase = createAdminClient();
  const voteDate = todayJst();
  const { data } = await supabase
    .from("chinchiro_rolls")
    .select("vote_date, hand, dice, picked_member_id, total_value, streak_days, shared_at")
    .eq("cookie_id", cookieId)
    .eq("vote_date", voteDate)
    .maybeSingle();
  if (!data) return null;
  return {
    cookieId,
    voteDate: data.vote_date as string,
    hand: data.hand as ChinchiroHand,
    dice: (data.dice as number[]) ?? [],
    pickedMemberId: data.picked_member_id as string,
    totalValue: data.total_value as number,
    streakDays: data.streak_days as number,
    sharedAt: (data.shared_at as string | null) ?? null,
  };
}

/**
 * シェア報酬で、当たった役と「同じ票数」を推しにもう 1 回加算する。
 *   - ピンゾロ → +100 票
 *   - ゾロ目   → +(X × 2) 票
 *   - シゴロ   → +8 票
 *   - 通常役   → +(独の目) 票
 *   - ヒフミ   → +12 票 (全員お裾分けと同じ枠)
 *   - 目なし   → +1 票 (救済と同値)
 *
 * shared_at を最初の 1 回だけ記録し、以降は noop。
 * ヒフミの場合は picked_member_id (= 最初に選んだメンバー) にまとめて入れる。
 */
export async function claimChinchiroShareBonus(
  cookieId: string,
): Promise<
  | { ok: true; addedVote: boolean; bonusValue: number }
  | { ok: false; error: string; code?: string }
> {
  const supabase = createAdminClient();
  const voteDate = todayJst();

  const { data: roll } = await supabase
    .from("chinchiro_rolls")
    .select("picked_member_id, shared_at, total_value")
    .eq("cookie_id", cookieId)
    .eq("vote_date", voteDate)
    .maybeSingle();

  if (!roll) {
    return { ok: false, code: "not_rolled", error: "本日はまだ振っていません" };
  }
  if (roll.shared_at) {
    // 既にシェア報酬受領済み
    return { ok: true, addedVote: false, bonusValue: 0 };
  }

  const pickedMemberId = roll.picked_member_id as string | null;
  if (!pickedMemberId) {
    return { ok: false, error: "picked member missing" };
  }

  const bonusValue = Math.max(1, Math.min(200, (roll.total_value as number) ?? 1));

  // shared_at を NULL → now() に更新 (once-only の原子化)
  const { data: updated, error: updateErr } = await supabase
    .from("chinchiro_rolls")
    .update({ shared_at: new Date().toISOString() })
    .eq("cookie_id", cookieId)
    .eq("vote_date", voteDate)
    .is("shared_at", null)
    .select("shared_at");

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }
  if (!updated || updated.length === 0) {
    // 競合でほかのリクエストが先に取った
    return { ok: true, addedVote: false, bonusValue: 0 };
  }

  // +1 票: 既存の chinchiro 行に追加 (推しに重ねる)
  // UPSERT 的に value を +1。存在しなければ新規 1 票。
  const stage = await getActiveStage().catch(() => null);
  const { data: existing } = await supabase
    .from("shuyaku_votes")
    .select("id, value")
    .eq("cookie_id", cookieId)
    .eq("member_id", pickedMemberId)
    .eq("vote_date", voteDate)
    .eq("kind", "chinchiro")
    .maybeSingle();

  if (existing) {
    await supabase
      .from("shuyaku_votes")
      .update({
        value: (existing.value as number) + bonusValue,
      })
      .eq("id", existing.id as number);
  } else {
    await supabase.from("shuyaku_votes").insert({
      cookie_id: cookieId,
      member_id: pickedMemberId,
      period_id: stage?.id ?? null,
      vote_date: voteDate,
      value: bonusValue,
      kind: "chinchiro",
    });
  }

  return { ok: true, addedVote: true, bonusValue };
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

export interface ChinchiroCookieStats {
  /** 総献上票数 (全期間、cookie 単位) */
  totalValue: number;
  /** 振った合計日数 */
  totalRolls: number;
  /** 今日振っているか (振っていれば当日の total_value) */
  rolledToday: { totalValue: number; streakDays: number } | null;
  /** 最も多く献上したメンバー (id, 票数) */
  topMember: { memberId: string; value: number } | null;
}

export interface SupporterRank {
  /** 自分の順位 (1-indexed) */
  rank: number;
  /** 全応援者数 (賽を 1 度でも振った cookie 数) */
  totalParticipants: number;
  /** あなたの総献上票数 */
  myValue: number;
  /** 1 位の総献上票数 (目標として表示) */
  topValue: number;
}

/**
 * 指定 cookie の「応援者ランキング」での位置を返す。
 * 集計対象は chinchiro_rolls の total_value 合計 (cookie 単位)。
 */
export async function getSupporterRank(
  cookieId: string,
): Promise<SupporterRank | null> {
  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("chinchiro_rolls")
    .select("cookie_id, total_value");

  if (!rows || rows.length === 0) return null;

  const totals = new Map<string, number>();
  for (const r of rows as Array<{ cookie_id: string; total_value: number }>) {
    const v = typeof r.total_value === "number" ? r.total_value : 0;
    totals.set(r.cookie_id, (totals.get(r.cookie_id) ?? 0) + v);
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const myValue = totals.get(cookieId) ?? 0;
  const rank = sorted.findIndex(([cid]) => cid === cookieId) + 1;
  if (rank === 0) return null;

  return {
    rank,
    totalParticipants: sorted.length,
    myValue,
    topValue: sorted[0]?.[1] ?? 0,
  };
}

/**
 * 指定 cookie の全期間ちんちろ統計。マイページで「あなたの賽記録」表示に使う。
 * ストリーク日数は shuyaku_votes_chinchiro テーブル (chinchiro_rolls) から当日分を読み、
 * 過去の total_value は合算する。
 */
export async function getChinchiroStatsByCookie(
  cookieId: string,
): Promise<ChinchiroCookieStats> {
  const supabase = createAdminClient();
  const voteDate = todayJst();

  const [{ data: rolls }, { data: todays }, { data: votes }] = await Promise.all([
    supabase
      .from("chinchiro_rolls")
      .select("total_value, vote_date")
      .eq("cookie_id", cookieId),
    supabase
      .from("chinchiro_rolls")
      .select("total_value, streak_days")
      .eq("cookie_id", cookieId)
      .eq("vote_date", voteDate)
      .maybeSingle(),
    supabase
      .from("shuyaku_votes")
      .select("member_id, value")
      .eq("cookie_id", cookieId)
      .eq("kind", "chinchiro"),
  ]);

  const totalValue = ((rolls ?? []) as Array<{ total_value: number }>).reduce(
    (s, r) => s + (typeof r.total_value === "number" ? r.total_value : 0),
    0,
  );
  const totalRolls = (rolls ?? []).length;
  const rolledToday = todays
    ? {
        totalValue: (todays.total_value as number) ?? 0,
        streakDays: (todays.streak_days as number) ?? 1,
      }
    : null;

  // 推し別に集計
  const memberTotals = new Map<string, number>();
  for (const v of (votes ?? []) as Array<{
    member_id: string;
    value: number;
  }>) {
    memberTotals.set(
      v.member_id,
      (memberTotals.get(v.member_id) ?? 0) +
        (typeof v.value === "number" ? v.value : 0),
    );
  }
  let topMember: { memberId: string; value: number } | null = null;
  for (const [memberId, value] of memberTotals) {
    if (!topMember || value > topMember.value) {
      topMember = { memberId, value };
    }
  }

  return { totalValue, totalRolls, rolledToday, topMember };
}
