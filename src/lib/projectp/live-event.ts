import { createAdminClient } from "@/lib/supabase/admin";

// =====================================================================
// Types
// =====================================================================
export type BonusTier = {
  minScore: number;
  multiplier: number;
};

export type LiveEvent = {
  id: string;
  periodId: string | null;
  title: string;
  eventDate: string;
  venue: string | null;
  status: "draft" | "open" | "closed";
  defaultTickets: number;
  baseTickets: number;
  bonusTiers: BonusTier[];
  createdAt: string;
};

export type EventCode = {
  id: number;
  eventId: string;
  code: string;
  ticketsTotal: number;
  ticketsUsed: number;
  activatedAt: string | null;
  userId: string | null;
  bonusMultiplier: number;
  createdAt: string;
};

export type EventVoteTally = {
  memberId: string;
  memberName: string;
  votes: number;
};

// =====================================================================
// Event CRUD
// =====================================================================
export async function listLiveEvents(): Promise<LiveEvent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("live_events")
    .select("*")
    .order("event_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEvent);
}

export async function getLiveEvent(id: string): Promise<LiveEvent | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("live_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapEvent(data);
}

export async function createLiveEvent(input: {
  title: string;
  eventDate: string;
  venue?: string;
  periodId?: string;
  defaultTickets?: number;
  baseTickets?: number;
  bonusTiers?: BonusTier[];
}): Promise<LiveEvent> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("live_events")
    .insert({
      title: input.title,
      event_date: input.eventDate,
      venue: input.venue ?? null,
      period_id: input.periodId ?? null,
      default_tickets: input.defaultTickets ?? input.baseTickets ?? 3,
      base_tickets: input.baseTickets ?? input.defaultTickets ?? 3,
      bonus_tiers: input.bonusTiers ?? [
        { minScore: 30, multiplier: 2 },
        { minScore: 50, multiplier: 3 },
      ],
      status: "draft",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapEvent(data);
}

export async function updateLiveEvent(
  id: string,
  patch: {
    title?: string;
    eventDate?: string;
    venue?: string | null;
    baseTickets?: number;
    bonusTiers?: BonusTier[];
  }
): Promise<LiveEvent> {
  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.eventDate !== undefined) update.event_date = patch.eventDate;
  if (patch.venue !== undefined) update.venue = patch.venue;
  if (patch.baseTickets !== undefined) {
    update.base_tickets = patch.baseTickets;
    update.default_tickets = patch.baseTickets;
  }
  if (patch.bonusTiers !== undefined) update.bonus_tiers = patch.bonusTiers;

  const { data, error } = await supabase
    .from("live_events")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapEvent(data);
}

export async function updateEventStatus(
  id: string,
  status: "draft" | "open" | "closed"
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("live_events")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// =====================================================================
// Code generation
// =====================================================================
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 紛らわしい O/0/I/1 を除外
  let code = "PJ-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateCodes(
  eventId: string,
  count: number,
  ticketsPerCode: number
): Promise<{ generated: number }> {
  const supabase = createAdminClient();
  const rows: { event_id: string; code: string; tickets_total: number }[] = [];
  const usedCodes = new Set<string>();

  for (let i = 0; i < count; i++) {
    let code: string;
    do {
      code = generateCode();
    } while (usedCodes.has(code));
    usedCodes.add(code);
    rows.push({
      event_id: eventId,
      code,
      tickets_total: ticketsPerCode,
    });
  }

  // 50件ずつバッチ insert
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await supabase.from("event_codes").insert(chunk);
    if (error) throw new Error(error.message);
  }

  return { generated: rows.length };
}

export async function getEventCodes(eventId: string): Promise<EventCode[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_codes")
    .select("*")
    .eq("event_id", eventId)
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCode);
}

// =====================================================================
// Voting
// =====================================================================

/**
 * コードを検証してイベント情報と残りチケット数を返す。
 * fanUserId が渡された場合、初回有効化時にボーナス倍率を計算して保存する。
 */
export async function validateCode(
  code: string,
  fanUserId?: string | null
): Promise<{
  event: LiveEvent;
  codeRow: EventCode;
  ticketsRemaining: number;
  bonusApplied: boolean;
} | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_codes")
    .select("*, live_events:event_id (*)")
    .eq("code", code.toUpperCase().trim())
    .maybeSingle();
  if (error || !data) return null;

  const row = data as unknown as {
    id: number;
    event_id: string;
    code: string;
    tickets_total: number;
    tickets_used: number;
    activated_at: string | null;
    user_id: string | null;
    bonus_multiplier: number;
    created_at: string;
    live_events: Record<string, unknown>;
  };

  const event = mapEvent(row.live_events);
  let codeRow = mapCode(row);
  let bonusApplied = false;

  // 初回有効化 かつ ファン会員 → ボーナス計算
  if (!codeRow.activatedAt && fanUserId && !codeRow.userId) {
    // ファンの通算スコアを取得
    const { data: preds } = await supabase
      .from("predictions")
      .select("total_score")
      .eq("user_id", fanUserId)
      .not("total_score", "is", null);
    const totalScore = ((preds ?? []) as { total_score: number | null }[]).reduce(
      (s, r) => s + (r.total_score ?? 0),
      0
    );

    let multiplier = calcBonusMultiplier(totalScore, event.bonusTiers);

    // live_vote_bonus 景品を持っていれば倍率 +1 & 自動消込
    const { data: voteRewards } = await supabase
      .from("prediction_rewards")
      .select("id, reward_code")
      .eq("user_id", fanUserId)
      .eq("reward_type", "live_vote_bonus")
      .is("redeemed_at", null);
    const activeReward = ((voteRewards ?? []) as { id: number; reward_code: string }[])[0];
    if (activeReward) {
      multiplier += 1;
      // 自動消込
      await supabase
        .from("prediction_rewards")
        .update({
          redeemed_at: new Date().toISOString(),
          redeemed_note: `auto:event_code_${codeRow.id}`,
        })
        .eq("id", activeReward.id)
        .is("redeemed_at", null);
    }

    const newTickets = event.baseTickets * multiplier;

    // 保存
    await supabase
      .from("event_codes")
      .update({
        user_id: fanUserId,
        bonus_multiplier: multiplier,
        tickets_total: newTickets,
      })
      .eq("id", codeRow.id);

    codeRow = {
      ...codeRow,
      userId: fanUserId,
      bonusMultiplier: multiplier,
      ticketsTotal: newTickets,
    };
    bonusApplied = multiplier > 1;
  }

  const ticketsRemaining = codeRow.ticketsTotal - codeRow.ticketsUsed;
  return { event, codeRow, ticketsRemaining, bonusApplied };
}

/**
 * 投票を実行。1チケット消費。
 */
export async function castEventVote(
  codeId: number,
  eventId: string,
  memberId: string
): Promise<{ ok: true; ticketsRemaining: number } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  // コードの現状を再取得（楽観ロックの代わり）
  const { data: codeRow } = await supabase
    .from("event_codes")
    .select("tickets_total, tickets_used, activated_at")
    .eq("id", codeId)
    .single();
  if (!codeRow) return { ok: false, error: "コードが見つかりません" };

  const remaining =
    (codeRow.tickets_total as number) - (codeRow.tickets_used as number);
  if (remaining <= 0) return { ok: false, error: "チケットを使い切りました" };

  // イベントが open か確認
  const { data: ev } = await supabase
    .from("live_events")
    .select("status")
    .eq("id", eventId)
    .single();
  if (!ev || (ev.status as string) !== "open") {
    return { ok: false, error: "投票は現在受け付けていません" };
  }

  // 投票を記録
  const { error: voteErr } = await supabase.from("event_votes").insert({
    event_id: eventId,
    code_id: codeId,
    member_id: memberId,
  });
  if (voteErr) return { ok: false, error: voteErr.message };

  // チケット消費 + 初回 activated_at
  const update: Record<string, unknown> = {
    tickets_used: (codeRow.tickets_used as number) + 1,
  };
  if (!codeRow.activated_at) {
    update.activated_at = new Date().toISOString();
  }
  await supabase.from("event_codes").update(update).eq("id", codeId);

  return { ok: true, ticketsRemaining: remaining - 1 };
}

/**
 * イベントの投票集計。
 */
export async function getEventTally(
  eventId: string
): Promise<EventVoteTally[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_votes")
    .select("member_id, members:member_id (name)")
    .eq("event_id", eventId);
  if (error) throw new Error(error.message);

  const counts = new Map<string, { name: string; votes: number }>();
  for (const r of data ?? []) {
    const row = r as unknown as {
      member_id: string;
      members: { name: string } | null;
    };
    const cur = counts.get(row.member_id) ?? {
      name: row.members?.name ?? "(不明)",
      votes: 0,
    };
    cur.votes += 1;
    counts.set(row.member_id, cur);
  }

  return [...counts.entries()]
    .map(([memberId, v]) => ({
      memberId,
      memberName: v.name,
      votes: v.votes,
    }))
    .sort((a, b) => b.votes - a.votes);
}

// =====================================================================
// mappers
// =====================================================================
function parseBonusTiers(v: unknown): BonusTier[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(
      (t): t is { minScore: number; multiplier: number } =>
        !!t &&
        typeof t === "object" &&
        typeof t.minScore === "number" &&
        typeof t.multiplier === "number"
    )
    .sort((a, b) => b.minScore - a.minScore);
}

function mapEvent(r: Record<string, unknown>): LiveEvent {
  return {
    id: r.id as string,
    periodId: (r.period_id as string | null) ?? null,
    title: r.title as string,
    eventDate: r.event_date as string,
    venue: (r.venue as string | null) ?? null,
    status: r.status as "draft" | "open" | "closed",
    defaultTickets: (r.default_tickets as number) ?? 3,
    baseTickets: (r.base_tickets as number) ?? 3,
    bonusTiers: parseBonusTiers(r.bonus_tiers),
    createdAt: r.created_at as string,
  };
}

function mapCode(r: Record<string, unknown>): EventCode {
  return {
    id: r.id as number,
    eventId: r.event_id as string,
    code: r.code as string,
    ticketsTotal: r.tickets_total as number,
    ticketsUsed: r.tickets_used as number,
    activatedAt: (r.activated_at as string | null) ?? null,
    userId: (r.user_id as string | null) ?? null,
    bonusMultiplier: (r.bonus_multiplier as number) ?? 1,
    createdAt: r.created_at as string,
  };
}

/**
 * ファンの通算スコアとイベントの bonus_tiers から倍率を計算。
 */
export function calcBonusMultiplier(
  totalScore: number,
  tiers: BonusTier[]
): number {
  for (const t of tiers) {
    if (totalScore >= t.minScore) return t.multiplier;
  }
  return 1;
}
