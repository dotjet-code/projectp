import { createAdminClient } from "@/lib/supabase/admin";

export type EventType = "stream" | "live" | "deadline" | "meeting" | "other";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  stream: "🎬 配信",
  live: "🎤 ライブ",
  deadline: "📸 提出期限",
  meeting: "📋 ミーティング",
  other: "📅 その他",
};

export type ScheduleEntry = {
  id: number;
  memberId: string | null;
  title: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string | null;
  notes: string | null;
  isGlobal: boolean;
  createdAt: string;
};

type Row = {
  id: number;
  member_id: string | null;
  title: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  notes: string | null;
  created_at: string;
};

function mapRow(r: Row): ScheduleEntry {
  return {
    id: r.id,
    memberId: r.member_id,
    title: r.title,
    eventType: (["stream", "live", "deadline", "meeting"].includes(
      r.event_type
    )
      ? r.event_type
      : "other") as EventType,
    eventDate: r.event_date,
    eventTime: r.event_time,
    notes: r.notes,
    isGlobal: !r.member_id,
    createdAt: r.created_at,
  };
}

/**
 * メンバーのスケジュール(自分 + 全体)を日付順に返す。
 */
export async function getScheduleForMember(
  memberId: string,
  fromDate?: string
): Promise<ScheduleEntry[]> {
  const supabase = createAdminClient();
  const since = fromDate ?? new Date().toISOString().slice(0, 10);
  let q = supabase
    .from("member_schedules")
    .select("*")
    .or(`member_id.is.null,member_id.eq.${memberId}`)
    .gte("event_date", since)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true })
    .limit(50);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as Row[]).map(mapRow);
}

export async function createScheduleEntry(input: {
  memberId?: string | null;
  title: string;
  eventType?: EventType;
  eventDate: string;
  eventTime?: string | null;
  notes?: string | null;
  createdBy?: string;
}): Promise<ScheduleEntry> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("member_schedules")
    .insert({
      member_id: input.memberId ?? null,
      title: input.title,
      event_type: input.eventType ?? "other",
      event_date: input.eventDate,
      event_time: input.eventTime ?? null,
      notes: input.notes ?? null,
      created_by: input.createdBy ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function deleteScheduleEntry(id: number): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("member_schedules").delete().eq("id", id);
}
