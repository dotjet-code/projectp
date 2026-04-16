"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type RedeemEntry = {
  code: string;
  status: "ok" | "error";
  message: string;
  fan?: { displayName: string | null; email: string | null };
  rewardType?: string;
};

export function StaffScanClient() {
  const params = useSearchParams();
  const staffToken = params.get("token") ?? "";
  const autoCode = params.get("code") ?? "";

  const [code, setCode] = useState(autoCode);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<RedeemEntry[]>([]);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // 自動消込 (QR から code 付きで来た場合)
  useEffect(() => {
    if (autoCode && staffToken) {
      doRedeem(autoCode);
    }
    // トークン検証
    if (staffToken) {
      setTokenValid(true); // API が 403 返したら false にする
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doRedeem(redeemCode: string) {
    if (!redeemCode.trim() || !staffToken || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/staff/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffToken, code: redeemCode }),
      });
      const j = await res.json();
      if (res.ok) {
        const label =
          j.reward?.rewardType === "cheki_free"
            ? "チェキ券1枚無料"
            : "ライブ会場投票ボーナス票";
        setHistory((h) => [
          {
            code: redeemCode,
            status: "ok",
            message: `消込OK: ${label}`,
            fan: {
              displayName: j.reward?.displayName ?? null,
              email: j.reward?.email ?? null,
            },
            rewardType: j.reward?.rewardType,
          },
          ...h,
        ]);
      } else {
        if (res.status === 403) setTokenValid(false);
        setHistory((h) => [
          { code: redeemCode, status: "error", message: j.error ?? "エラー" },
          ...h,
        ]);
      }
    } catch {
      setHistory((h) => [
        { code: redeemCode, status: "error", message: "通信エラー" },
        ...h,
      ]);
    } finally {
      setBusy(false);
      setCode("");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    doRedeem(code);
  }

  if (!staffToken) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-5xl mb-3">🔒</p>
          <p className="text-sm text-muted">
            スタッフ用 URL が無効です。運営から共有された URL を使ってください。
          </p>
        </div>
      </main>
    );
  }

  if (tokenValid === false) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-5xl mb-3">⏰</p>
          <p className="text-lg font-bold text-foreground">トークンの有効期限切れ</p>
          <p className="mt-2 text-sm text-muted">
            このスタッフ URL は期限切れです。運営に新しい URL を発行してもらってください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3 text-center">
        <p className="font-[family-name:var(--font-outfit)] text-sm font-extrabold text-primary-dark">
          Project P スタッフ消込
        </p>
      </div>

      <div className="mx-auto max-w-md px-4 py-6 space-y-4">
        {/* 入力フォーム */}
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
            placeholder="景品コードを入力 / スキャン"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-lg font-mono uppercase tracking-wider"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {busy ? "..." : "消込"}
          </button>
        </form>

        <p className="text-[10px] text-muted text-center">
          ファンのスマホに表示された QR コードをカメラで読み取るか、コードを手入力してください
        </p>

        {/* 履歴 */}
        <div className="space-y-2">
          {history.map((h, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 ${
                h.status === "ok"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-lg font-bold ${
                    h.status === "ok" ? "text-emerald-800" : "text-red-700"
                  }`}
                >
                  {h.status === "ok" ? "✓" : "✕"} {h.message}
                </span>
              </div>
              {h.fan && (
                <div className="mt-2">
                  <p className="text-base font-bold text-foreground">
                    {h.fan.displayName ?? "(名無し)"}
                  </p>
                  <p className="text-xs text-muted">{h.fan.email}</p>
                </div>
              )}
              <p className="mt-1 text-[10px] font-mono text-muted">{h.code}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
