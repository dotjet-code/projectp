interface HowItWorksProps {
  /** 本日のアクティビティ (社会的証明 strip 用、任意) */
  activity?: {
    chinchiroRolls: number;
    chinchiroVotes: number;
    topHandToday: string | null;
  };
}

/**
 * 0秒理解用の 4 ステップ図解。
 * モバイル: 2×2 グリッド + 下向き矢印
 * デスクトップ: 横 4 並び + 右向き矢印
 * 読ませるのではなく、見せて伝える装置。
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

      <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-12">
        <div className="flex items-baseline gap-3 mb-6 md:mb-8">
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

        <ol
          className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 md:gap-6"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          <Step
            num={1}
            icon={<DiceIcon />}
            title="賽を振る"
            sub="毎日1回 無料"
            accent="red"
            delay={0}
          />
          <Step
            num={2}
            icon={<VoteIcon />}
            title="推しに票が入る"
            sub="役で票数が決まる"
            accent="teal"
            delay={0.15}
          />
          <Step
            num={3}
            icon={<ChartIcon />}
            title="順位が動く"
            sub="リアルタイム集計"
            accent="pink"
            delay={0.3}
          />
          <Step
            num={4}
            icon={<TrophyIcon />}
            title="上位6名 選抜"
            sub="ステージ閉幕で決着"
            accent="red"
            highlight
            delay={0.45}
          />
        </ol>
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
        .hiw-step {
          animation: hiw-pop 0.5s ease-out both;
        }
        .hiw-arrow {
          animation: hiw-pulse 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-step, .hiw-arrow { animation: none; opacity: 1; }
        }
      `}</style>
    </section>
  );
}

type Accent = "red" | "teal" | "pink";

function Step({
  num,
  icon,
  title,
  sub,
  accent,
  highlight = false,
  delay,
}: {
  num: number;
  icon: React.ReactNode;
  title: string;
  sub: string;
  accent: Accent;
  highlight?: boolean;
  delay: number;
}) {
  const colors: Record<Accent, { bg: string; fg: string }> = {
    red: { bg: "#D41E28", fg: "#FFFFFF" },
    teal: { bg: "#1CB4AF", fg: "#FFFFFF" },
    pink: { bg: "#ED2B86", fg: "#FFFFFF" },
  };
  const c = colors[accent];
  // モバイルは 2x2 → 2 と 4 が右カラム、3 と 1 が左カラム。
  // 矢印を 1→2 (右) / 2→3 (下) / 3→4 (右) で配置。
  const showRightArrow = num === 1 || num === 3; // 1→2, 3→4
  const showDownArrowMobile = num === 2; // 2→3 (mobile only)

  return (
    <li
      className="hiw-step relative flex flex-col items-center text-center"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* 番号バッジ */}
      <div
        className="mb-3 inline-flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          backgroundColor: "#111",
          color: "#FFE600",
          fontFamily: "var(--font-outfit)",
          fontSize: 14,
          fontWeight: 900,
          transform: "rotate(-3deg)",
        }}
      >
        {num}
      </div>

      {/* アイコン丸 */}
      <div
        className={`relative flex items-center justify-center ${highlight ? "ring-[6px] ring-[#FFE600]" : ""}`}
        style={{
          width: "clamp(80px, 18vw, 100px)",
          height: "clamp(80px, 18vw, 100px)",
          backgroundColor: c.bg,
          color: c.fg,
          boxShadow: "5px 5px 0 rgba(17,17,17,0.3)",
          borderRadius: "50%",
        }}
      >
        {icon}
      </div>

      {/* タイトル */}
      <p
        className="mt-3 text-sm md:text-base font-black text-[#111] leading-tight"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {title}
      </p>
      <p
        className="mt-1 text-[11px] md:text-xs text-[#4A5060] leading-snug"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {sub}
      </p>

      {/* 矢印: モバイルは 1→2 横 / 2→3 下 / 3→4 横 */}
      {showRightArrow && (
        <span
          className="hiw-arrow absolute -right-1 md:-right-2 text-[#D41E28] text-xl md:text-3xl font-black select-none pointer-events-none"
          aria-hidden
          style={{
            top: "calc(32px + 3px + clamp(80px,18vw,100px)/2 - 12px)",
            animationDelay: `${delay + 0.3}s`,
          }}
        >
          →
        </span>
      )}
      {showDownArrowMobile && (
        <span
          className="hiw-arrow absolute md:hidden text-[#D41E28] text-xl font-black select-none pointer-events-none"
          aria-hidden
          style={{
            left: "100%",
            top: "calc(100% + 2px)",
            animationDelay: `${delay + 0.3}s`,
            transform: "translateX(-50%)",
          }}
        >
          ↓
        </span>
      )}
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
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#FFFFFF" />
      <circle cx="24" cy="24" r="6" fill="#D41E28" />
      <circle cx="15" cy="15" r="2.6" fill="#111" />
      <circle cx="33" cy="33" r="2.6" fill="#111" />
    </svg>
  );
}

function VoteIcon() {
  return (
    <svg
      width="56%"
      height="56%"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <path
        d="M24 6 L30 18 L43 20 L33 30 L36 43 L24 36 L12 43 L15 30 L5 20 L18 18 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="56%"
      height="56%"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <rect x="6" y="28" width="9" height="14" rx="1" fill="#FFFFFF" />
      <rect x="19" y="18" width="9" height="24" rx="1" fill="#FFFFFF" />
      <rect x="32" y="8" width="9" height="34" rx="1" fill="#FFFFFF" />
      <path
        d="M8 28 L22 18 L34 10"
        stroke="#FFE600"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      width="58%"
      height="58%"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 8 H36 V22 C36 30 30 34 24 34 C18 34 12 30 12 22 Z"
        fill="#FFFFFF"
      />
      <rect x="20" y="34" width="8" height="5" fill="#FFFFFF" />
      <rect x="13" y="39" width="22" height="3" fill="#FFFFFF" />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        fontSize="12"
        fontWeight="900"
        fill="#D41E28"
        fontFamily="var(--font-outfit)"
      >
        6
      </text>
    </svg>
  );
}
