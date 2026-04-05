"use client";

import Link from "next/link";

export function TodaysLive() {
  return (
    <section className="mx-auto max-w-[964px] px-4 mt-12">
      <div className="flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple to-[#c27aff]" />
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#7008e7] tracking-tight">
            🎤 本日のライブ
          </h2>
        </div>

        {/* Card */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[rgba(237,233,254,0.5)] px-6 py-6"
          style={{
            backgroundImage: "linear-gradient(172deg, rgba(237,233,254,0.8) 0%, rgba(250,245,255,0.8) 50%, rgba(253,244,255,0.8) 100%)",
          }}
        >
          {/* Animated glow orbs — large, visible, slow movement */}
          <div
            className="absolute rounded-full"
            style={{
              width: 180,
              height: 180,
              right: -40,
              top: -60,
              background: "radial-gradient(circle, rgba(196,167,255,0.35) 0%, transparent 70%)",
              animation: "drift 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 140,
              height: 140,
              left: -30,
              bottom: -50,
              background: "radial-gradient(circle, rgba(246,180,255,0.3) 0%, transparent 70%)",
              animation: "drift 8s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              left: "45%",
              top: -20,
              background: "radial-gradient(circle, rgba(167,132,255,0.2) 0%, transparent 70%)",
              animation: "drift 7s ease-in-out infinite",
              animationDelay: "-3s",
            }}
          />

          {/* Sparkle dots — bigger, more visible */}
          {[
            { left: "8%", top: "25%", delay: "0s", size: 6 },
            { left: "25%", top: "75%", delay: "1.2s", size: 5 },
            { left: "55%", top: "18%", delay: "0.4s", size: 7 },
            { left: "78%", top: "65%", delay: "2s", size: 5 },
            { left: "42%", top: "50%", delay: "3s", size: 6 },
            { left: "92%", top: "35%", delay: "1.8s", size: 4 },
            { left: "68%", top: "80%", delay: "0.8s", size: 5 },
            { left: "15%", top: "55%", delay: "2.5s", size: 4 },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                backgroundColor: "rgba(194,122,255,0.7)",
                animation: `sparkle 2.5s ease-in-out infinite`,
                animationDelay: s.delay,
              }}
            />
          ))}

          {/* Sound wave bars — more visible */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-end gap-[3px] pointer-events-none">
            {[18, 28, 14, 24, 20, 32, 16, 26, 20, 30].map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full"
                style={{
                  height: h,
                  backgroundColor: "rgba(112,8,231,0.12)",
                  animation: `soundbar 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {/* Date + Badge */}
              <div className="flex items-center gap-2 mb-2">
                <svg className="size-4 text-[#7f22fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-[family-name:var(--font-outfit)] text-sm font-bold text-[#7f22fe]">
                  2026-04-29
                </span>
                <span
                  className="rounded-full bg-gradient-to-r from-purple to-[#ed6aff] px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white shadow-[0_1px_3px_#ddd6ff] font-[family-name:var(--font-outfit)] animate-pulse"
                >
                  LIVE DAY
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground">
                SPACE ODD お披露目ライブ
              </h3>

              {/* Venue */}
              <p className="mt-1 text-sm text-muted">
                SPACE ODD ｜ 投票 15:00〜21:00
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/live/vote"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple to-purple-end px-6 py-3 text-base font-bold text-white shadow-[0_10px_15px_rgba(221,214,255,0.5)] transition hover:shadow-[0_10px_20px_rgba(221,214,255,0.6)] hover:scale-[1.02]"
            >
              応援投票する →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
