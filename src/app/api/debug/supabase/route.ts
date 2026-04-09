import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 接続確認用のデバッグエンドポイント。
 * members テーブルの件数を返すだけ。開発中のみ使う想定。
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, members_count: count ?? 0 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
