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
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#F5F1E8]">
      <div className="max-w-[520px] text-center">
        <div className="flex items-baseline gap-3 mb-3 justify-center">
          <span className="inline-block w-2 h-2 bg-[#D41E28]" />
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ エラー
          </p>
        </div>
        <h1
          className="text-3xl md:text-4xl font-black text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          何かがおかしい。
        </h1>
        <p
          className="mt-3 text-sm text-[#4A5060] leading-relaxed"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          一時的な問題の可能性があります。再読み込みをお試しください。
        </p>
        {error.digest && (
          <p
            className="mt-3 text-[10px] text-[#9BA8BF] font-mono"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            error: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 bg-[#D41E28] text-white px-6 py-2.5 text-sm font-black transition-transform active:translate-y-0.5"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
            }}
          >
            再読み込み
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-[#111] bg-white text-[#111] px-6 py-2.5 text-sm font-black hover:bg-[#FFE600] transition-colors"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
            }}
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
