"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fan = {
  userId: string;
  displayName: string | null;
  email: string | null;
  status: "active" | "flagged" | "banned";
  createdAt: string;
  predictionCount: number;
  rewardCount: number;
};

const STATUS_STYLES: Record<Fan["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  flagged: "bg-yellow-50 text-yellow-800",
  banned: "bg-red-50 text-red-700",
};

export function FansClient({
  initialQuery,
  fans,
}: {
  initialQuery: string;
  fans: Fan[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [busy, setBusy] = useState<string | null>(null);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/admin/fans${params.toString() ? `?${params}` : ""}`);
  }

  async function setStatus(userId: string, status: Fan["status"]) {
    setBusy(userId);
    try {
      const res = await fetch("/api/admin/fans/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="表示名で検索"
          className="flex-1 max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-black text-white px-5 py-2 text-xs font-bold"
        >
          検索
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">メール</th>
              <th className="px-3 py-2">表示名</th>
              <th className="px-3 py-2">登録</th>
              <th className="px-3 py-2 text-right">予想</th>
              <th className="px-3 py-2 text-right">景品</th>
              <th className="px-3 py-2">状態</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {fans.map((f) => (
              <tr key={f.userId} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-[11px]">
                  {f.email ?? "(none)"}
                </td>
                <td className="px-3 py-2">{f.displayName ?? "—"}</td>
                <td className="px-3 py-2 text-muted">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 text-right">{f.predictionCount}</td>
                <td className="px-3 py-2 text-right">{f.rewardCount}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[f.status]}`}
                  >
                    {f.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 justify-end">
                    {f.status !== "active" && (
                      <button
                        type="button"
                        onClick={() => setStatus(f.userId, "active")}
                        disabled={busy === f.userId}
                        className="rounded-full border border-gray-300 px-2 py-0.5 text-[10px] disabled:opacity-40"
                      >
                        解除
                      </button>
                    )}
                    {f.status !== "flagged" && (
                      <button
                        type="button"
                        onClick={() => setStatus(f.userId, "flagged")}
                        disabled={busy === f.userId}
                        className="rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-800 disabled:opacity-40"
                      >
                        flag
                      </button>
                    )}
                    {f.status !== "banned" && (
                      <button
                        type="button"
                        onClick={() => setStatus(f.userId, "banned")}
                        disabled={busy === f.userId}
                        className="rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 disabled:opacity-40"
                      >
                        ban
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {fans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted">
                  該当するファンがいません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
