import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";

/**
 * POST /api/auth/fan/delete
 *
 * ファン会員が自分のアカウントを削除する。
 * auth.users を削除すると fan_profiles / predictions.user_id / prediction_rewards も
 * 外部キー (on delete cascade / set null) で連動して消える。
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "server misconfigured" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const role =
    (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
  if (role === "admin") {
    return NextResponse.json(
      { error: "管理者アカウントはここからは削除できません" },
      { status: 403 }
    );
  }

  const email = user.email;
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    action: "fan.self_delete",
    actor: email ?? user.id,
    targetType: "fan",
    targetId: user.id,
    detail: "ファン会員自身による退会",
  });

  // セッションをクリア
  await supabase.auth.signOut();
  return res;
}
