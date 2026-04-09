"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateMemberForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [channelId, setChannelId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          handle: handle || null,
          youtube_channel_id: channelId || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setName("");
      setHandle("");
      setChannelId("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 p-4 space-y-3"
    >
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          名前 *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="例: ナカジマ"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          ハンドル（任意）
        </label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="例: @nakajima"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          YouTube チャンネル ID（任意・UCxxxx 形式）
        </label>
        <input
          type="text"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="例: UCxxxxxxxxxxxxxxxxxxxxxx"
        />
      </div>
      {error && <p className="text-xs text-red-600">エラー: {error}</p>}
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
      >
        {submitting ? "追加中..." : "メンバー追加"}
      </button>
    </form>
  );
}
