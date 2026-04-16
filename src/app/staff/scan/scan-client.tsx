"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

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
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  const doRedeem = useCallback(
    async (redeemCode: string) => {
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
            {
              code: redeemCode,
              status: "error",
              message: j.error ?? "エラー",
            },
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
    },
    [staffToken, busy]
  );

  // 自動消込 (QR から code 付きで来た場合)
  useEffect(() => {
    if (autoCode && staffToken) {
      doRedeem(autoCode);
    }
    if (staffToken) {
      setTokenValid(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startScanner() {
    setScanning(true);
  }

  // scanning が true になったら DOM 更新後にカメラ起動
  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;

    // DOM にコンテナが描画されるのを待つ
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            stopScanner();
            doRedeem(decodedText.trim());
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera error:", err);
        setScanning(false);
      }
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  async function stopScanner() {
    setScanning(false);
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
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
          <p className="text-lg font-bold text-foreground">
            トークンの有効期限切れ
          </p>
          <p className="mt-2 text-sm text-muted">
            このスタッフ URL は期限切れです。運営に新しい URL
            を発行してもらってください。
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
        {/* QR スキャンボタン */}
        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-blue py-4 text-base font-bold text-white shadow-lg"
          >
            📷 QR コードをスキャン
          </button>
        ) : (
          <div className="space-y-2">
            <div
              id={scannerContainerId}
              className="rounded-xl overflow-hidden"
            />
            <button
              onClick={stopScanner}
              className="w-full rounded-xl border border-gray-300 bg-white py-2 text-sm font-bold text-gray-700"
            >
              カメラを閉じる
            </button>
          </div>
        )}

        {/* 手入力フォーム */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-3 text-[10px] text-muted">
              または手入力
            </span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="景品コードを入力"
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
              <span
                className={`text-lg font-bold ${
                  h.status === "ok" ? "text-emerald-800" : "text-red-700"
                }`}
              >
                {h.status === "ok" ? "✓" : "✕"} {h.message}
              </span>
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
