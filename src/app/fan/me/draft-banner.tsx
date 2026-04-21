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
        className="block bg-[#FFE600] border-2 border-[#D41E28] p-4 transition-transform active:translate-y-0.5"
        style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.22)" }}
      >
        <p
          className="text-[10px] font-black tracking-[0.32em] text-[#D41E28]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ━ 下書きあり
        </p>
        <p
          className="mt-1 text-sm font-black text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          予想はまだ未提出です
        </p>
        <p
          className="mt-1 text-xs text-[#111]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          タップで続きから提出できます →
        </p>
      </Link>
    </section>
  );
}
