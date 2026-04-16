"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type RedeemResult = {
  status: "loading" | "ok" | "error";
  message: string;
  fan?: { displayName: string | null; email: string | null };
  rewardType?: string;
};

export default function AdminRewardScanPage() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const [result, setResult] = useState<RedeemResult>({
    status: "loading",
    message: "消込中...",
  });

  useEffect(() => {
    if (!code) {
      setResult({ status: "error", message: "コードがありません" });
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/admin/rewards/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const j = await res.json();
        if (res.ok) {
          const label =
            j.reward?.rewardType === "cheki_free"
              ? "チェキ券1枚無料"
              : "ライブ会場投票ボーナス票";
          setResult({
            status: "ok",
            message: `消込完了: ${label}`,
            fan: {
              displayName: j.reward?.displayName ?? null,
              email: j.reward?.email ?? null,
            },
            rewardType: j.reward?.rewardType,
          });
        } else {
          const msg =
            j.error === "not_found"
              ? "コードが見つかりません"
              : j.error === "already_redeemed"
              ? "既に消込済みです"
              : j.error === "expired"
              ? "有効期限切れです"
              : j.error === "unauthorized"
              ? "管理者ログインが必要です"
              : `エラー: ${j.error}`;
          setResult({ status: "error", message: msg });
        }
      } catch {
        setResult({ status: "error", message: "通信エラーが発生しました" });
      }
    })();
  }, [code]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {result.status === "loading" && (
          <div className="space-y-4">
            <p className="text-5xl">⏳</p>
            <p className="text-lg font-bold text-muted">{result.message}</p>
          </div>
        )}
        {result.status === "ok" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-4xl">✓</span>
            </div>
            <p className="text-xl font-extrabold text-emerald-800">
              {result.message}
            </p>
            {result.fan && (
              <div className="rounded-xl bg-white border border-gray-200 p-4">
                <p className="text-lg font-bold text-foreground">
                  {result.fan.displayName ?? "(名無し)"}
                </p>
                <p className="text-xs text-muted">{result.fan.email}</p>
              </div>
            )}
            <p className="text-xs font-mono text-muted">{code}</p>
          </div>
        )}
        {result.status === "error" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-100">
              <span className="text-4xl">✕</span>
            </div>
            <p className="text-xl font-extrabold text-red-700">
              {result.message}
            </p>
            <p className="text-xs font-mono text-muted">{code}</p>
            {result.message.includes("管理者ログイン") && (
              <a
                href="/login"
                className="inline-block rounded-full bg-black text-white px-6 py-2 text-sm font-bold"
              >
                ログインする
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
