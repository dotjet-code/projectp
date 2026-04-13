"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type IpCluster = {
  ip: string;
  userIds: string[];
  count: number;
  earliestAt: string;
  latestAt: string;
  hasFlagged: boolean;
};
type Hotspot = { ip: string | null; attempts: number };
type RewardCluster = {
  ip: string;
  periodId: string;
  userIds: string[];
  rewardCount: number;
};

export function AnomaliesClient({
  ipClusters,
  hotspots,
  rewardClusters,
}: {
  ipClusters: IpCluster[];
  hotspots: Hotspot[];
  rewardClusters: RewardCluster[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(userId: string, status: "active" | "flagged" | "banned") {
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
    <div className="space-y-8">
      {/* IP cluster */}
      <section>
        <h2 className="text-sm font-bold mb-2">
          🧱 同一 IP からの複数登録 ({ipClusters.length})
        </h2>
        <p className="text-[10px] text-muted mb-3">
          同じ IP アドレスから 2 件以上のファン会員が作成されています。家族・職場の共有 IP の可能性もあるので即断は禁物。
        </p>
        <div className="space-y-3">
          {ipClusters.length === 0 && (
            <p className="text-xs text-muted">該当なし</p>
          )}
          {ipClusters.map((c) => (
            <div
              key={c.ip}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs">
                  <span className="font-mono font-bold">{c.ip}</span>
                  <span className="ml-2 text-muted">{c.count} アカウント</span>
                  {c.hasFlagged && (
                    <span className="ml-2 rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[10px] font-bold">
                      flagged あり
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted">
                  {new Date(c.earliestAt).toLocaleDateString()} 〜{" "}
                  {new Date(c.latestAt).toLocaleDateString()}
                </p>
              </div>
              <ul className="space-y-1">
                {c.userIds.map((uid) => (
                  <li key={uid} className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-gray-600 truncate flex-1">
                      {uid}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStatus(uid, "flagged")}
                      disabled={busy === uid}
                      className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-0.5 text-[10px] font-bold text-yellow-800 disabled:opacity-40"
                    >
                      flag
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(uid, "banned")}
                      disabled={busy === uid}
                      className="rounded-full border border-red-300 bg-red-50 px-3 py-0.5 text-[10px] font-bold text-red-700 disabled:opacity-40"
                    >
                      ban
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(uid, "active")}
                      disabled={busy === uid}
                      className="rounded-full border border-gray-300 bg-white px-3 py-0.5 text-[10px] font-bold text-gray-700 disabled:opacity-40"
                    >
                      解除
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Rate limit hotspots */}
      <section>
        <h2 className="text-sm font-bold mb-2">
          🔥 直近24時間のレート制限ヒット ({hotspots.length})
        </h2>
        <p className="text-[10px] text-muted mb-3">
          magic link 送信を 5 回以上試みた IP。Bot の総当たりやスクリプト実行の兆候。
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">試行回数</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((h, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-1.5 font-mono">{h.ip ?? "(unknown)"}</td>
                  <td className="px-3 py-1.5 font-bold">{h.attempts}</td>
                </tr>
              ))}
              {hotspots.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-3 text-center text-muted">
                    該当なし
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reward clusters */}
      <section>
        <h2 className="text-sm font-bold mb-2">
          🎁 同一 IP 由来の景品クラスタ ({rewardClusters.length})
        </h2>
        <p className="text-[10px] text-muted mb-3">
          同じ IP から登録されたファンが、同じ Stage で複数の景品を取得しているケース。
        </p>
        <div className="space-y-2">
          {rewardClusters.length === 0 && (
            <p className="text-xs text-muted">該当なし</p>
          )}
          {rewardClusters.map((c, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-3 text-xs"
            >
              <p>
                <span className="font-mono font-bold">{c.ip}</span>
                <span className="ml-2 text-muted">
                  Stage {c.periodId.slice(0, 8)} で {c.userIds.length} アカウントが計 {c.rewardCount} 件取得
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
