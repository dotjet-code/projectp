"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DRAFT_KEY_PREFIX = "projectp.prediction_draft.";

/**
 * localStorage に prediction draft が残っていれば
 * 「予想の続きがあります」CTA を表示する。
 */
export function PredictionDraftBanner() {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(DRAFT_KEY_PREFIX)) {
          const raw = window.localStorage.getItem(key);
          if (!raw) continue;
          const obj = JSON.parse(raw) as Record<string, unknown[]>;
          const filled = Object.values(obj).some(
            (arr) => Array.isArray(arr) && arr.some((x) => x != null)
          );
          if (filled) {
            setHasDraft(true);
            return;
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!hasDraft) return null;

  return (
    <section className="mx-auto max-w-[520px] px-4 mt-6">
      <Link
        href="/prediction"
        className="block rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <p className="text-[10px] font-semibold tracking-wider text-primary-dark">
          ✨ 予想の続きがあります
        </p>
        <p className="mt-1 text-sm font-bold text-foreground">
          予想ページで前回選んだ内容が保存されています
        </p>
        <p className="mt-2 text-xs font-bold text-primary-dark">
          予想ページで提出する →
        </p>
      </Link>
    </section>
  );
}
