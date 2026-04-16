"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function MemberLoginForm() {
  const params = useSearchParams();
  const paramError = params.get("error");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(paramError);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/member/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "送信に失敗しました");
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
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
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-40"
      >
        {submitting ? "送信中..." : "ログインリンクを送る"}
      </button>
      <p className="text-[10px] text-muted text-center">
        運営から招待されたメールアドレスでのみログインできます。
      </p>
    </form>
  );
}
