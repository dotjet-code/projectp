import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/auth/fan/me
 * 軽量なログイン状態確認エンドポイント。
 * admin はファンとしては扱わない。
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
  return NextResponse.json({
    loggedIn: true,
    email: user.email ?? null,
  });
}
