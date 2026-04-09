import { NextRequest, NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/google/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 認可フローの入口。
 * GET /api/auth/google/start?member_id=xxx
 *   → 該当 member が存在するか確認
 *   → Google 認可 URL を生成してリダイレクト
 */
export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("member_id");
  if (!memberId) {
    return NextResponse.json(
      { error: "member_id is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: member, error } = await supabase
    .from("members")
    .select("id, name")
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!member) {
    return NextResponse.json({ error: "member not found" }, { status: 404 });
  }

  const authUrl = buildAuthUrl(memberId);
  return NextResponse.redirect(authUrl);
}
