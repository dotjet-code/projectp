import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureFanProfile } from "@/lib/projectp/fan-profile";

/**
 * GET /auth/callback?code=...&next=/fan/me
 *
 * Supabase magic link からの戻り先。code を session に交換し、
 * ファンユーザーなら fan_profiles を作成してから next にリダイレクトする。
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || "/fan/me";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  if (!code) {
    return NextResponse.redirect(new URL("/fan/login?error=nocode", req.url));
  }

  const redirect = NextResponse.redirect(new URL(next, req.url));
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          redirect.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/fan/login?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }

  // セッションからユーザーを取得し、ファンユーザーなら profile を作成
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role =
      (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
    if (role !== "admin") {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      const ua = req.headers.get("user-agent") ?? null;
      try {
        await ensureFanProfile({
          userId: user.id,
          signupIp: ip,
          signupUa: ua,
        });
      } catch (e) {
        console.error("ensureFanProfile failed:", e);
      }
    }
  }

  return redirect;
}
