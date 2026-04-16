import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isDisposableEmail } from "@/lib/projectp/disposable-email";
import { checkAndRecordMagicLinkAttempt } from "@/lib/projectp/rate-limit";
import { verifyTurnstile } from "@/lib/projectp/turnstile";

/**
 * POST /api/auth/fan/magic-link
 * body: { email, turnstileToken? }
 *
 * 防御層:
 *   1. メール形式チェック
 *   2. 使い捨てメールドメイン拒否
 *   3. Turnstile 検証 (env 設定時のみ)
 *   4. IP / メール単位のレート制限
 *   5. Supabase Auth で magic link 送信
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const turnstileToken =
    typeof body?.turnstileToken === "string" ? body.turnstileToken : null;
  // next は app 内部の相対パスのみ許可
  const rawNext = typeof body?.next === "string" ? body.next : "";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/fan/me";

  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "使い捨てメールアドレスは登録できません" },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = req.headers.get("user-agent") ?? null;

  const turnstile = await verifyTurnstile(turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json(
      { error: "Bot 判定に失敗しました。再度お試しください。" },
      { status: 400 }
    );
  }

  const rl = await checkAndRecordMagicLinkAttempt({ ip, email, ua });
  if (!rl.ok) {
    const msg =
      rl.reason === "ip_exceeded"
        ? "リクエストが多すぎます。しばらく待ってから再度お試しください。"
        : "このメールアドレスへの送信回数が上限に達しました。";
    return NextResponse.json({ error: msg }, { status: 429 });
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
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return res;
}
