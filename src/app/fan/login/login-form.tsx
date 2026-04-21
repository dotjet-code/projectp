"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const GOOGLE_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void }
      ) => string;
      reset: (id?: string) => void;
    };
  }
}

export function FanLoginForm() {
  const params = useSearchParams();
  const paramError = params.get("error");
  const rawNext = params.get("next") ?? "";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(paramError);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const tryRender = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t) => setTurnstileToken(t),
        });
      }
    };
    tryRender();
    const id = window.setInterval(tryRender, 300);
    return () => window.clearInterval(id);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/fan/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken, next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "送信に失敗しました");
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      if (TURNSTILE_SITE_KEY && window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        setTurnstileToken(null);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleClick() {
    setGoogleSubmitting(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      const origin = window.location.origin;
      const nextPath = next || "/fan/me";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setGoogleSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <p className="text-3xl">📬</p>
        <p className="text-sm font-bold text-foreground">メールを送りました</p>
        <p className="text-xs text-muted">
          届いたメール内のリンクをクリックするとログインできます。
        </p>
      </div>
    );
  }

  const nextLabel = (() => {
    if (next.startsWith("/prediction")) return "順位予想ページ";
    if (next.startsWith("/live/vote")) return "ライブ応援ページ";
    if (next.startsWith("/fan/me")) return "マイページ";
    return null;
  })();

  return (
    <div className="space-y-4">
      {nextLabel && (
        <div className="bg-[#FFE600] border-l-4 border-[#D41E28] px-3 py-2 text-[12px] text-[#111]">
          ログイン後、<b>{nextLabel}</b>に戻ります。下書きは保存されています。
        </div>
      )}

      {GOOGLE_AUTH_ENABLED && (
        <>
          <button
            type="button"
            onClick={onGoogleClick}
            disabled={googleSubmitting || submitting}
            className="w-full inline-flex items-center justify-center gap-3 bg-white border-2 border-[#111] px-5 py-2.5 text-sm font-black text-[#111] disabled:opacity-40"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "3px 3px 0 rgba(17,17,17,0.18)",
            }}
          >
            <GoogleIcon />
            <span>{googleSubmitting ? "接続中..." : "Google で続ける"}</span>
          </button>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] text-[#4A5060]">
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
            <span>または メール</span>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </div>
        {TURNSTILE_SITE_KEY && (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              strategy="afterInteractive"
            />
            <div ref={turnstileRef} className="flex justify-center" />
          </>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={
            submitting ||
            googleSubmitting ||
            (Boolean(TURNSTILE_SITE_KEY) && !turnstileToken)
          }
          className="w-full rounded-full bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-40"
        >
          {submitting ? "送信中..." : "ログインリンクを送る"}
        </button>
        <p className="text-[10px] text-muted text-center">
          初めての方はこのメール送信で自動的に会員登録されます。
        </p>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
