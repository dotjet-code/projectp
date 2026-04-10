"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-[520px] text-center">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-extrabold text-foreground">
          エラーが発生しました
        </h1>
        <p className="mt-2 text-sm text-muted">
          一時的な問題の可能性があります。再読み込みをお試しください。
        </p>
        {error.digest && (
          <p className="mt-3 text-[10px] text-gray-400 font-mono">
            error: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            再読み込み
          </button>
          <Link
            href="/"
            className="text-xs text-muted underline hover:text-primary-dark"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
