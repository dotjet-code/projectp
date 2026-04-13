import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/auth/fan/me
 * 軽量なログイン状態確認エンドポイント。
 * admin はファンとしては扱わない。
 * 未消込景品の件数も返してヘッダーバッジに使う。
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ loggedIn: false });
  }
  const role =
    (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
  if (role === "admin") {
    return NextResponse.json({ loggedIn: false, isAdmin: true });
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const { count } = await admin
    .from("prediction_rewards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("redeemed_at", null)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

  return NextResponse.json({
    loggedIn: true,
    email: user.email ?? null,
    unredeemedRewards: count ?? 0,
  });
}
