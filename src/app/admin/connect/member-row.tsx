"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/supabase/types";

export function MemberRow({ member }: { member: Member }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const connected = Boolean(member.google_refresh_token);

  async function onDelete() {
    if (
      !confirm(
        `「${member.name}」を削除します。\n紐付いた snapshots / period_points も全て消えます。よろしいですか？`
      )
    ) {
      return;
    }
    setDeleting(true);
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
      alert(`削除失敗: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium">{member.name}</p>
        <p className="text-xs text-gray-500">
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
      </div>
      <div className="flex items-center gap-2">
        <a
          href={`/api/auth/google/start?member_id=${member.id}`}
          className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800"
        >
          {connected ? "再連携" : "Google で連携"}
        </a>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-full border border-red-300 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
        >
          {deleting ? "削除中..." : "削除"}
        </button>
      </div>
    </li>
  );
}
