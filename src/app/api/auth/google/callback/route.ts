import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient, GOOGLE_SCOPES } from "@/lib/google/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Google からの認可コールバック。
 * GET /api/auth/google/callback?code=xxx&state=member_id
 *   → code を refresh_token に交換
 *   → members テーブルに保存
 *   → /admin/connect?status=... にリダイレクト
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/admin/connect?status=error&reason=${encodeURIComponent(errorParam)}`
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      `${origin}/admin/connect?status=error&reason=missing_params`
    );
  }

  const memberId = state;

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      // prompt=consent を付けているので基本ここには来ない想定
      return NextResponse.redirect(
        `${origin}/admin/connect?status=error&reason=no_refresh_token&member_id=${memberId}`
      );
    }

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
      .from("members")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_scopes: GOOGLE_SCOPES.join(" "),
        google_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (updateError) {
      return NextResponse.redirect(
        `${origin}/admin/connect?status=error&reason=${encodeURIComponent(updateError.message)}&member_id=${memberId}`
      );
    }

    return NextResponse.redirect(
      `${origin}/admin/connect?status=success&member_id=${memberId}`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.redirect(
      `${origin}/admin/connect?status=error&reason=${encodeURIComponent(msg)}&member_id=${memberId}`
    );
  }
}
