import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { ensureFanProfile } from "@/lib/projectp/fan-profile";

/**
 * GET /auth/callback
 *
 * Supabase magic link からの戻り先。2 種類のパターンを処理する:
 *   1. PKCE (?code=...)       → exchangeCodeForSession (同一端末必須)
 *   2. OTP   (?token_hash=...&type=magiclink|invite|signup|email) → verifyOtp (クロス端末OK)
 *
 * 推奨は #2。Supabase メールテンプレートを
 *   `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink`
 * 形式にしておくと、どの端末で開いてもログインできる。
 *
 * session 確立後、ファンユーザーなら fan_profiles を作成して next にリダイレクト。
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = params.get("next") || "/fan/me";

  const loginPath = next.startsWith("/member") ? "/member/login" : "/fan/login";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(new URL(`${loginPath}?error=nocode`, req.url));
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

  let authError: string | null = null;
  // token_hash を優先: クロス端末で成立するため
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) authError = error.message;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) authError = error.message;
  }
  if (authError) {
    return NextResponse.redirect(
      new URL(
        `${loginPath}?error=${encodeURIComponent(authError)}`,
        req.url
      )
    );
  }

  // セッションからユーザーを取得し、ファンユーザーなら profile を作成
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role =
      (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
    if (role !== "admin" && role !== "member") {
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
