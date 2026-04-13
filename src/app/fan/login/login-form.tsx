"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

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
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
        body: JSON.stringify({ email, turnstileToken }),
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

  return (
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
          submitting || (Boolean(TURNSTILE_SITE_KEY) && !turnstileToken)
        }
        className="w-full rounded-full bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-40"
      >
        {submitting ? "送信中..." : "ログインリンクを送る"}
      </button>
      <p className="text-[10px] text-muted text-center">
        初めての方はこのメール送信で自動的に会員登録されます。
      </p>
    </form>
  );
}
