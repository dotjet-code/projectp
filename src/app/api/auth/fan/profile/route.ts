import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/auth/fan/profile
 * body: { displayName }
 *
 * ファン会員自身が表示名を更新する。
 */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const raw =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";
  if (raw.length > 30) {
    return NextResponse.json(
      { error: "表示名は 30 文字以内で入力してください" },
      { status: 400 }
    );
  }
  const displayName = raw || null;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const role =
    (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
  if (role === "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("fan_profiles")
    .update({
      display_name: displayName,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, displayName });
}
