/**
 * Cloudflare Turnstile 検証。
 * 環境変数 TURNSTILE_SECRET_KEY が設定されていない場合は no-op で通す。
 * フロントは NEXT_PUBLIC_TURNSTILE_SITE_KEY が設定されていればウィジェットを描画。
 */
export const TURNSTILE_ENABLED = !!process.env.TURNSTILE_SECRET_KEY;

export async function verifyTurnstile(
  token: string | null,
  remoteIp: string | null
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true }; // 未設定なら検証スキップ
  if (!token) return { ok: false, error: "turnstile_missing" };

  const form = new URLSearchParams();
  form.append("secret", secret);
  form.append("response", token);
  if (remoteIp) form.append("remoteip", remoteIp);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form }
    );
    const j = (await res.json()) as { success: boolean };
    return j.success ? { ok: true } : { ok: false, error: "turnstile_failed" };
  } catch {
    return { ok: false, error: "turnstile_error" };
  }
}
