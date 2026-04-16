import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createNotification } from "@/lib/projectp/member-notifications";
import { createScheduleEntry } from "@/lib/projectp/member-schedule";

/**
 * POST /api/admin/notifications
 * body: { title, body?, category?, targetMemberId? }
 *
 * POST /api/admin/notifications  (action: "schedule")
 * body: { action: "schedule", title, eventType, eventDate, eventTime?, notes?, targetMemberId? }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (body.action === "schedule") {
    if (!body.eventDate) {
      return NextResponse.json({ error: "eventDate required" }, { status: 400 });
    }
    const entry = await createScheduleEntry({
      memberId: body.targetMemberId ?? null,
      title: body.title,
      eventType: body.eventType ?? "other",
      eventDate: body.eventDate,
      eventTime: body.eventTime ?? null,
      notes: body.notes ?? null,
      createdBy: user.id,
    });
    return NextResponse.json({ ok: true, entry });
  }

  await createNotification({
    targetMemberId: body.targetMemberId ?? null,
    title: body.title,
    body: body.body ?? null,
    category: body.category ?? "info",
    createdBy: user.id,
  });
  return NextResponse.json({ ok: true });
}
