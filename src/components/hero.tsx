"use client";

import Link from "next/link";

const windStreaks = [
  { top: "14%", height: 1.5, duration: "4s", delay: "0s", opacity: 0.15, width: "25%" },
  { top: "30%", height: 1, duration: "5.5s", delay: "1.5s", opacity: 0.1, width: "35%" },
  { top: "46%", height: 2, duration: "6s", delay: "0.5s", opacity: 0.12, width: "20%" },
  { top: "58%", height: 1, duration: "4.5s", delay: "3s", opacity: 0.08, width: "30%" },
  { top: "22%", height: 1, duration: "7s", delay: "4s", opacity: 0.07, width: "28%" },
  { top: "38%", height: 1.5, duration: "5s", delay: "2.5s", opacity: 0.09, width: "32%" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-8" style={{
      background: "linear-gradient(180deg, #dff6fd 0%, #c4ecf8 25%, #a8e0f4 45%, #8dd4ef 60%, #b2ebf2 75%, #e0f7fa 100%)",
    }}>

      {/* Sky — soft gradient clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: 500, height: 120,
            left: "5%", top: "8%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)",
            animation: "drift 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400, height: 90,
            right: "10%", top: "15%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)",
            animation: "drift 15s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 350, height: 80,
            left: "30%", top: "5%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%)",
            animation: "drift 10s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />
      </div>

      {/* Horizon glow */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: 80,
          height: 60,
          background: "linear-gradient(180deg, transparent 0%, rgba(0,211,243,0.06) 50%, rgba(0,188,255,0.04) 100%)",
        }}
      />

      {/* Wind streaks */}
      <div className="absolute inset-0 pointer-events-none">
        {windStreaks.map((w, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: w.top,
              left: 0,
              width: w.width,
              height: w.height,
              opacity: w.opacity,
              animation: `wind ${w.duration} ${w.delay} linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Animated ocean waves */}
      <div className="absolute bottom-0 left-0 right-0 h-28">
        <svg
          viewBox="0 0 1440 120" className="absolute bottom-0 h-full" preserveAspectRatio="none"
          style={{ width: "200%", animation: "wave 12s ease-in-out infinite" }}
        >
          <path d="M0,70 C180,100 360,40 540,70 C720,100 900,40 1080,70 C1260,100 1440,40 1440,70 V120 H0Z" fill="rgba(0,211,243,0.12)" />
        </svg>
        <svg
          viewBox="0 0 1440 120" className="absolute bottom-0 h-full" preserveAspectRatio="none"
          style={{ width: "200%", animation: "wave 8s ease-in-out infinite", animationDelay: "-2s" }}
        >
          <path d="M0,80 C240,50 480,95 720,65 C960,35 1200,90 1440,55 V120 H0Z" fill="rgba(0,188,255,0.10)" />
        </svg>
        <svg
          viewBox="0 0 1440 120" className="absolute bottom-0 h-full" preserveAspectRatio="none"
          style={{ width: "200%", animation: "wave 6s ease-in-out infinite reverse", animationDelay: "-4s" }}
        >
          <path d="M0,85 C200,65 400,100 600,75 C800,50 1000,95 1200,70 C1350,55 1440,80 1440,85 V120 H0Z" fill="rgba(43,127,255,0.07)" />
        </svg>
        <svg
          viewBox="0 0 1440 120" className="absolute bottom-0 h-full" preserveAspectRatio="none"
          style={{ width: "200%", animation: "wave 10s ease-in-out infinite", animationDelay: "-6s" }}
        >
          <path d="M0,92 C360,75 720,105 1080,85 C1260,75 1380,95 1440,90 V120 H0Z" fill="rgba(255,255,255,0.6)" />
        </svg>
        <svg
          viewBox="0 0 1440 120" className="absolute bottom-0 h-full" preserveAspectRatio="none"
          style={{ width: "200%", animation: "wave 7s ease-in-out infinite reverse", animationDelay: "-1s" }}
        >
          <path d="M0,100 C240,90 480,108 720,95 C960,82 1200,105 1440,95 V120 H0Z" fill="rgba(255,255,255,0.85)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-[996px] px-4">
        <div className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-full bg-white/60 px-5 py-2 shadow-sm border border-white/60">
          <span className="text-sm font-bold text-primary-dark font-[family-name:var(--font-outfit)]">
            2026年4月クール 開催中
          </span>
          <span className="size-2 rounded-full bg-primary opacity-90 animate-pulse" />
        </div>

        <h1 className="text-center">
          <span className="font-[family-name:var(--font-outfit)] text-7xl font-black tracking-tight bg-gradient-to-r from-[#00b8db] via-primary-blue to-[#8e51ff] bg-clip-text text-transparent">
            Project P
          </span>
        </h1>

        <p className="mt-4 text-center text-xl font-medium text-[#62748e]">
          12人の現在地を、いま見届けよう。
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/prediction"
            className="flex items-center gap-1 rounded-2xl bg-gradient-to-r from-primary to-primary-blue px-8 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] transition hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)]"
          >
            🎯 予想する →
          </Link>
          <Link
            href="/results"
            className="flex items-center gap-1 rounded-2xl bg-white/80 border border-white/80 px-8 py-3.5 text-base font-bold text-[#45556c] shadow-sm transition hover:bg-white"
          >
            🏆 結果を見る →
          </Link>
        </div>
      </div>
    </section>
  );
}
