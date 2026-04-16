import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import {
  getScheduleForMember,
  createScheduleEntry,
  deleteScheduleEntry,
} from "@/lib/projectp/member-schedule";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) return NextResponse.json({ schedule: [] });

  const schedule = await getScheduleForMember(memberId);
  return NextResponse.json({ schedule });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.eventDate) {
    return NextResponse.json({ error: "title and eventDate required" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const entry = await createScheduleEntry({
    memberId,
    title: body.title,
    eventType: body.eventType,
    eventDate: body.eventDate,
    eventTime: body.eventTime ?? null,
    notes: body.notes ?? null,
    createdBy: user.id,
  });
  return NextResponse.json({ entry });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await deleteScheduleEntry(Number(id));
  return NextResponse.json({ ok: true });
}
