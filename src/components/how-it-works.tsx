interface HowItWorksProps {
  /** 本日のアクティビティ (社会的証明 strip 用、任意) */
  activity?: {
    chinchiroRolls: number;
    chinchiroVotes: number;
    topHandToday: string | null;
  };
}

/**
 * ファンができる「応援の 4 つのかたち」を並列で見せ、
 * その全部が「彼女たちの運命を変える」に着地させる図解。
 *
 * モバイル: 2×2 グリッド、デスクトップ: 横 4 並び。
 * 時系列フローではなく、4 つの入力 → 1 つの結果 という構造。
 */
export function HowItWorks({ activity }: HowItWorksProps = {}) {
  return (
    <section
      className="relative bg-[#F5F1E8] border-y-2 border-[#111] overflow-hidden"
      aria-label="遊びかた"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle, #111111 0.6px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
        aria-hidden
      />

      <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-14">
        {/* Eyebrow */}
        <div className="flex items-baseline gap-3 mb-5 md:mb-6">
          <span className="inline-block w-2 h-2 bg-[#D41E28]" />
          <p
            className="text-[11px] md:text-xs font-black tracking-[0.35em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ━ 遊びかた
          </p>
          <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          <p
            className="text-[10px] md:text-xs text-[#4A5060]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            3 分で分かる
          </p>
        </div>

        {/* Lead */}
        <h2
          className="text-xl md:text-3xl font-black leading-tight text-[#111] mb-5 md:mb-8 max-w-2xl"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          あなたの応援、
          <span
            className="relative inline-block px-1"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, #FFE600 60%)",
            }}
          >
            3 つのかたち
          </span>
          。
        </h2>

        {/* 3 アクションタイル */}
        <ol
          className="grid grid-cols-3 gap-2 md:gap-5"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          <Tile
            icon={<DiceIcon />}
            title="毎日の賽"
            sub="毎日 1 回 · 無料"
            detail="役で 1〜100 票が推しに入る"
            accent="red"
            delay={0}
          />
          <Tile
            icon={<PodiumIcon />}
            title="順位予想"
            sub="無料・何度でも提出"
            detail="予想そのものが推しの票になる"
            accent="teal"
            delay={0.1}
          />
          <Tile
            icon={<PlayIcon />}
            title="視聴で応援"
            sub="配信 · 動画を見る"
            detail="バズ · 配信指標を底上げ"
            accent="navy"
            delay={0.2}
          />
        </ol>

        {/* 結果バナー */}
        <div className="mt-8 md:mt-10 flex flex-col items-center">
          <span
            className="hiw-arrow text-[#D41E28] text-2xl md:text-3xl font-black leading-none"
            aria-hidden
          >
            ↓
          </span>
          <div
            className="mt-3 md:mt-4 w-full max-w-[820px] bg-[#111] text-white px-5 py-5 md:px-8 md:py-6"
            style={{ boxShadow: "6px 6px 0 rgba(17,17,17,0.25)" }}
          >
            <p
              className="text-base md:text-xl font-black text-center leading-relaxed"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              その全部で、
              <span
                className="relative inline-block px-1"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 60%, #D41E28 60%)",
                }}
              >
                彼女たちの運命は変わる
              </span>
              。
            </p>
            <p
              className="mt-2 text-xs md:text-sm text-[#FFE600] text-center font-black tracking-wider"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              上位 6 名だけが、次の主役のステージへ。
            </p>
          </div>

          {/* ライブ投票の補足 (会場限定のため別扱い) */}
          <p
            className="mt-4 text-[11px] md:text-xs text-[#4A5060] text-center leading-relaxed"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            ※ 会場に来たら、<b className="text-[#111]">ライブ投票</b>でさらに票数倍増。
          </p>
        </div>
      </div>

      {/* 本日のアクティビティ (社会的証明) */}
      {activity && activity.chinchiroRolls > 0 && (
        <div className="relative max-w-[1200px] mx-auto px-4 pb-5 md:pb-8">
          <div
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] md:text-sm text-[#4A5060]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-[#D41E28] animate-pulse" />
              <span
                className="text-[10px] md:text-xs font-black tracking-[0.25em]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                TODAY
              </span>
            </span>
            <span>
              本日{" "}
              <b className="text-[#111] text-base md:text-lg">
                {activity.chinchiroRolls.toLocaleString()}
              </b>{" "}
              人が賽を振った
            </span>
            <span>
              ·{" "}
              <b className="text-[#D41E28] text-base md:text-lg">
                {activity.chinchiroVotes.toLocaleString()}
              </b>{" "}
              票 積まれた
            </span>
            {activity.topHandToday && (
              <span>
                · 最高役 <b className="text-[#111]">{activity.topHandToday}</b>
              </span>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes hiw-pop {
          0% { opacity: 0; transform: translateY(8px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hiw-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .hiw-tile {
          animation: hiw-pop 0.5s ease-out both;
        }
        .hiw-arrow {
          animation: hiw-pulse 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-tile, .hiw-arrow { animation: none; opacity: 1; }
        }
      `}</style>
    </section>
  );
}

type Accent = "red" | "teal" | "pink" | "navy";

function Tile({
  icon,
  title,
  sub,
  detail,
  accent,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  detail: string;
  accent: Accent;
  delay: number;
}) {
  const colors: Record<Accent, { bg: string; fg: string; accent: string }> = {
    red: { bg: "#D41E28", fg: "#FFFFFF", accent: "#D41E28" },
    teal: { bg: "#1CB4AF", fg: "#FFFFFF", accent: "#0F7F7C" },
    pink: { bg: "#ED2B86", fg: "#FFFFFF", accent: "#ED2B86" },
    navy: { bg: "#1447E6", fg: "#FFFFFF", accent: "#1447E6" },
  };
  const c = colors[accent];

  return (
    <li
      className="hiw-tile relative flex flex-col items-center text-center bg-white border-2 border-[#111] px-3 py-4 md:px-4 md:py-5"
      style={{
        animationDelay: `${delay}s`,
        boxShadow: "4px 4px 0 rgba(17,17,17,0.18)",
      }}
    >
      {/* アイコン丸 */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: "clamp(60px, 14vw, 78px)",
          height: "clamp(60px, 14vw, 78px)",
          backgroundColor: c.bg,
          color: c.fg,
          borderRadius: "50%",
          boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
        }}
      >
        {icon}
      </div>

      <p
        className="mt-3 text-sm md:text-base font-black text-[#111] leading-tight"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {title}
      </p>
      <p
        className="mt-1 text-[10px] md:text-xs font-black tracking-wider leading-snug"
        style={{
          fontFamily: "var(--font-noto-serif), serif",
          color: c.accent,
        }}
      >
        {sub}
      </p>
      <p
        className="mt-1 text-[10px] md:text-xs text-[#4A5060] leading-snug"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {detail}
      </p>
    </li>
  );
}

function DiceIcon() {
  return (
    <svg
      width="56%"
      height="56%"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <rect x="8" y="8" width="32" height="32" rx="5" fill="#FFFFFF" />
      <circle cx="16" cy="16" r="2.6" fill="#111" />
      <circle cx="24" cy="24" r="2.6" fill="#111" />
      <circle cx="32" cy="32" r="2.6" fill="#111" />
    </svg>
  );
}

function PodiumIcon() {
  return (
    <svg
      width="62%"
      height="62%"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      {/* 3rd (left, short) */}
      <rect x="5" y="28" width="11" height="14" fill="#FFFFFF" opacity="0.65" />
      {/* 2nd (right, mid) */}
      <rect x="32" y="23" width="11" height="19" fill="#FFFFFF" opacity="0.8" />
      {/* 1st (center, tall) */}
      <rect x="18.5" y="15" width="11" height="27" fill="#FFFFFF" />
      {/* star on top of 1st */}
      <path
        d="M24 7 L25.6 10.2 L29.2 10.7 L26.6 13.2 L27.2 16.8 L24 15.1 L20.8 16.8 L21.4 13.2 L18.8 10.7 L22.4 10.2 Z"
        fill="#FFE600"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="58%"
      height="58%"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <path d="M14 10 L14 38 L37 24 Z" fill="#FFFFFF" />
    </svg>
  );
}
