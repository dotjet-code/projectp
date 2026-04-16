import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/auth/member/magic-link
 * body: { email }
 *
 * メンバー用 magic link。招待済み (role='member') のメアドのみ受付。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  // メンバーとして招待されているか確認
  const admin = createAdminClient();
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const memberUser = (users?.users ?? []).find(
    (u) =>
      u.email === email &&
      (u.app_metadata as { role?: string } | undefined)?.role === "member"
  );
  if (!memberUser) {
    return NextResponse.json(
      { error: "このメールアドレスはメンバーとして登録されていません" },
      { status: 400 }
    );
  }

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

  const origin = req.nextUrl.origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=/member/dashboard`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return res;
}
