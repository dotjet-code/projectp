"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteButton({
  memberId,
  isInvited,
}: {
  memberId: string;
  isInvited: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isInvited) {
    return (
      <span className="text-[10px] text-emerald-700 font-bold">
        ✓ 招待済み
      </span>
    );
  }

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/members/${memberId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setResult(j.message);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white"
      >
        ⭐ メンバーを招待
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mt-2">
      <form onSubmit={onInvite} className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700">
          招待先メールアドレス
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
          >
            {busy ? "送信中..." : "招待"}
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {result && <p className="text-xs text-emerald-700">{result}</p>}
      </form>
    </div>
  );
}
