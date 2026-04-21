"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { RankedMember } from "@/lib/projectp/live-stats";

const OSHI_KEY = "projectp.oshi";

interface OshiPickerProps {
  members: RankedMember[];
}

/**
 * 初見ユーザー向け「推し選び」カード。
 * localStorage.projectp.oshi にスラッグを保存。既に選んでいる場合は
 * コンパクトな「あなたの推しは XX」表示に切り替える。
 */
export function OshiPicker({ members }: OshiPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [oshiSlug, setOshiSlug] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(OSHI_KEY);
      if (saved) setOshiSlug(saved);
    } catch {
      // ignore
    }
  }, []);

  const handlePick = (slug: string) => {
    try {
      window.localStorage.setItem(OSHI_KEY, slug);
    } catch {
      // ignore
    }
    setOshiSlug(slug);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // SSR 時 or 選択済みですでに compact 表示中の状態では再描画差異を避ける
  if (!mounted) return null;

  // 既に選択済み = 小さい「あなたの推し」バッジだけ表示
  const oshiMember = oshiSlug
    ? members.find((m) => m.slug === oshiSlug)
    : null;

  if (oshiMember) {
    return (
      <section className="bg-[#111] text-[#F5F1E8] border-y-2 border-[#111]">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative shrink-0 w-9 h-9 overflow-hidden">
              <Image
                src={oshiMember.avatarUrl}
                alt={oshiMember.name}
                fill
                sizes="36px"
                className="object-cover"
              />
            </span>
            <div className="min-w-0">
              <p
                className="text-[9px] tracking-[0.32em] text-[#FFE600]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ あなたの推し
              </p>
              <p
                className="text-sm md:text-base font-black truncate"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {oshiMember.name}
              </p>
            </div>
          </div>
          <Link
            href={`/members/${oshiMember.slug}`}
            className="shrink-0 inline-flex items-center gap-1 bg-[#D41E28] text-white px-3 py-1.5 text-xs font-black"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
            }}
          >
            ページへ →
          </Link>
        </div>
      </section>
    );
  }

  // dismiss 済みは非表示
  if (dismissed) return null;

  return (
    <section className="bg-[#F5F1E8] border-y-2 border-[#111] relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle, #111 0.6px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
        aria-hidden
      />
      <div className="relative max-w-[1200px] mx-auto px-4 py-5 md:py-6">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="inline-block w-2 h-2 bg-[#D41E28]" />
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ 推しを選ぶ
          </p>
          <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[10px] text-[#4A5060] hover:text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
            aria-label="閉じる"
          >
            あとで ×
          </button>
        </div>
        <p
          className="text-sm md:text-base font-black text-[#111] mb-3"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          まだ推しがいない? <span className="text-[#D41E28]">タップで決めよう</span>
        </p>
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handlePick(m.slug)}
              className="group shrink-0 snap-start flex flex-col items-center gap-1 focus:outline-none"
              aria-label={`${m.name} を推しに選ぶ`}
            >
              <span
                className="relative block w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 border-[#111] group-hover:border-[#D41E28] transition-colors"
                style={{
                  boxShadow: "3px 3px 0 rgba(17,17,17,0.18)",
                }}
              >
                <Image
                  src={m.avatarUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 64px, 80px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </span>
              <span
                className="text-[10px] md:text-xs font-black text-[#111] tracking-wide whitespace-nowrap"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {m.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
