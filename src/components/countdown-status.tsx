import Link from "next/link";
import { getActiveStage } from "@/lib/projectp/stage";

function diffDaysHours(targetIso: string): { days: number; hours: number } | null {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0 };
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return { days, hours };
}

export async function CountdownStatus() {
  const stage = await getActiveStage();

  // 終了日 (JST 23:59:59) までのカウントダウン
  // endDate "2026-05-25" → 翌日 00:00 JST = UTC で 当日 15:00
  let targetIso: string | null = null;
  if (stage) {
    const [y, m, d] = stage.endDate.split("-").map(Number);
    // 翌日 00:00 JST = UTC で当日 15:00
    targetIso = new Date(Date.UTC(y, m - 1, d, 15, 0, 0)).toISOString();
  }
  const remaining = targetIso ? diffDaysHours(targetIso) : null;

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Countdown */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white shadow-[0_10px_15px_rgba(162,244,253,0.4)]"
          style={{
            backgroundImage:
              "linear-gradient(165deg, #00d3f3 0%, #00bcff 50%, #2b7fff 100%)",
          }}
        >
          {/* Animated floating orbs */}
          <div
            className="absolute rounded-full bg-white"
            style={{
              width: 105,
              height: 105,
              left: -4,
              top: -12,
              opacity: 0.1,
              animation: "drift 7s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full bg-white"
            style={{
              width: 100,
              height: 100,
              left: 140,
              top: 28,
              opacity: 0.08,
              animation: "drift 9s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute rounded-full bg-white"
            style={{
              width: 101,
              height: 101,
              left: 282,
              top: 16,
              opacity: 0.07,
              animation: "drift 8s ease-in-out infinite",
              animationDelay: "-3s",
            }}
          />
          <div
            className="absolute rounded-full bg-white"
            style={{
              width: 96,
              height: 96,
              left: 427,
              top: 52,
              opacity: 0.09,
              animation: "drift 6s ease-in-out infinite reverse",
              animationDelay: "-1s",
            }}
          />

          {/* Sparkle particles */}
          {[
            { left: "15%", top: "20%", delay: "0s", size: 4 },
            { left: "40%", top: "70%", delay: "1.2s", size: 3 },
            { left: "65%", top: "25%", delay: "0.6s", size: 5 },
            { left: "85%", top: "60%", delay: "2s", size: 3 },
            { left: "30%", top: "45%", delay: "3s", size: 4 },
            { left: "75%", top: "40%", delay: "1.8s", size: 3 },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animation: `sparkle 2.5s ease-in-out infinite`,
                animationDelay: s.delay,
              }}
            />
          ))}

          <p className="relative text-center text-sm font-semibold tracking-wide opacity-90 font-[family-name:var(--font-outfit)]">
            🎬 月末特番まで
          </p>

          <div className="relative mt-3 flex items-center justify-center gap-2">
            {remaining ? (
              <>
                <div className="flex items-end gap-1 rounded-[20px] bg-white/20 px-5 py-2">
                  <span className="font-[family-name:var(--font-outfit)] text-4xl font-black leading-10">
                    {remaining.days}
                  </span>
                  <span className="pb-0.5 text-sm font-black opacity-80">日</span>
                </div>
                <span className="font-[family-name:var(--font-outfit)] text-2xl font-black opacity-60">
                  :
                </span>
                <div className="flex items-end gap-1 rounded-[20px] bg-white/20 px-5 py-2">
                  <span className="font-[family-name:var(--font-outfit)] text-4xl font-black leading-10">
                    {remaining.hours}
                  </span>
                  <span className="pb-0.5 text-sm font-black opacity-80">
                    時間
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-end gap-1 rounded-[20px] bg-white/20 px-5 py-2">
                <span className="font-[family-name:var(--font-outfit)] text-base font-black leading-6">
                  準備中
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Stage */}
        <div className="flex items-center justify-between rounded-2xl bg-white/70 border border-white/80 px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest text-muted font-[family-name:var(--font-outfit)]">
              NOW PLAYING
            </span>
            {stage ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gradient-to-r from-primary to-primary-cyan px-2.5 py-0.5 text-[11px] font-bold text-white tracking-wider shadow-[0_1px_3px_#a2f4fd]">
                    {stage.stageNumber !== null
                      ? `ステージ ${stage.stageNumber}`
                      : "ステージ"}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {stage.title ?? stage.name}
                  </span>
                </div>
                <p className="text-[11px] text-muted">
                  {stage.startDate} 〜 {stage.endDate}
                </p>
              </>
            ) : (
              <span className="text-sm text-muted">次のステージは近日開始</span>
            )}
          </div>
          <Link
            href="/ranking"
            className="flex size-10 items-center justify-center rounded-full bg-[#ecfeff] text-primary-dark transition hover:bg-[#d5f5f6]"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
