import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";

/**
 * POST /api/admin/fans/status
 * body: { userId, status: 'active' | 'flagged' | 'banned' }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : null;
  const status =
    body?.status === "flagged" || body?.status === "banned"
      ? body.status
      : body?.status === "active"
      ? "active"
      : null;
  if (!userId || !status) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("fan_profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    action: "fan.status_change",
    actor: user.email ?? user.id,
    targetType: "fan",
    targetId: userId,
    detail: `→ ${status}`,
  });
  return NextResponse.json({ ok: true });
}
