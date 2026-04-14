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

  let unredeemed = 0;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("prediction_rewards")
      .select("expires_at")
      .eq("user_id", user.id)
      .is("redeemed_at", null);
    const now = Date.now();
    unredeemed = ((data ?? []) as { expires_at: string | null }[]).filter(
      (r) => !r.expires_at || new Date(r.expires_at).getTime() > now
    ).length;
  } catch {
    // テーブル未作成等。ヘッダーバッジ起因で全機能を止めたくないので無視。
  }

  return NextResponse.json({
    loggedIn: true,
    email: user.email ?? null,
    unredeemedRewards: unredeemed,
  });
}
