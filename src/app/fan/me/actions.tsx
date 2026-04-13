"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DisplayNameForm({
  initial,
}: {
  initial: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFlash(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/fan/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "保存に失敗しました");
      setFlash("保存しました");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <p className="text-[10px] font-semibold tracking-wider text-muted">
        表示名（ランキング掲載用）
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
          placeholder="未設定"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
      {flash && <p className="text-[10px] text-emerald-700">{flash}</p>}
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </form>
  );
}

export function FanMeActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/fan/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/fan/delete", { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? "退会に失敗しました");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onLogout}
        disabled={loading}
        className="w-full rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
      >
        {loading ? "ログアウト中..." : "ログアウト"}
      </button>

      {!confirmDelete ? (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="w-full text-[11px] text-gray-500 hover:text-red-600 py-1"
        >
          退会する
        </button>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center space-y-2">
          <p className="text-[11px] text-red-800 font-bold">
            本当に退会しますか？予想履歴と未消込の景品はすべて失われます。
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-bold text-gray-700"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold text-white disabled:opacity-40"
            >
              {deleting ? "削除中..." : "退会する"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
