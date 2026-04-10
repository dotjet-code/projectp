"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/supabase/types";

type Mode = "view" | "edit";

export function MemberRow({ member }: { member: Member }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(member.name);
  const [handle, setHandle] = useState(member.handle ?? "");
  const [channelId, setChannelId] = useState(member.youtube_channel_id ?? "");

  const connected = Boolean(member.google_refresh_token);

  async function onDelete() {
    if (
      !confirm(
        `「${member.name}」を削除します。\n紐付いた snapshots / period_points も全て消えます。よろしいですか？`
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/members?id=${encodeURIComponent(member.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          name,
          handle: handle || null,
          youtube_channel_id: channelId || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setMode("view");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function onCancel() {
    setName(member.name);
    setHandle(member.handle ?? "");
    setChannelId(member.youtube_channel_id ?? "");
    setError(null);
    setMode("view");
  }

  if (mode === "edit") {
    return (
      <li className="p-4 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              ハンドル
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@xxx"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              YouTube チャンネル ID
            </label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600">エラー: {error}</p>}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={busy || !name.trim()}
            className="rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {busy ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            キャンセル
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between p-4">
      <div className="min-w-0">
        <Link href={`/admin/members/${member.id}`} className="font-medium truncate hover:text-primary-dark transition-colors">
          {member.name}
        </Link>
        <p className="text-xs text-gray-500 truncate">
          {member.handle ?? "—"} / channel: {member.youtube_channel_id ?? "—"}
        </p>
        <p className="mt-1 text-xs">
          {connected ? (
            <span className="text-green-700">
              ✅ 連携済み（{member.google_connected_at?.slice(0, 10)}）
            </span>
          ) : (
            <span className="text-gray-500">⏳ 未連携</span>
          )}
        </p>
        {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={`/api/auth/google/start?member_id=${member.id}`}
          className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800"
        >
          {connected ? "再連携" : "Google で連携"}
        </a>
        <button
          type="button"
          onClick={() => setMode("edit")}
          disabled={busy}
          className="rounded-full border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          編集
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="rounded-full border border-red-300 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
        >
          {busy ? "..." : "削除"}
        </button>
      </div>
    </li>
  );
}
