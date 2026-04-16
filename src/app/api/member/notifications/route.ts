import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import {
  getNotificationsForMember,
  markAllAsRead,
  markAsRead,
} from "@/lib/projectp/member-notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) return NextResponse.json({ notifications: [] });

  const notifications = await getNotificationsForMember(memberId);
  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (body?.action === "markAllRead") {
    await markAllAsRead(memberId);
    return NextResponse.json({ ok: true });
  }
  if (body?.action === "markRead" && typeof body.id === "number") {
    await markAsRead(body.id, memberId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
