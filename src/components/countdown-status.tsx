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
  let targetIso: string | null = null;
  if (stage) {
    const [y, m, d] = stage.endDate.split("-").map(Number);
    targetIso = new Date(Date.UTC(y, m - 1, d, 15, 0, 0)).toISOString();
  }
  const remaining = targetIso ? diffDaysHours(targetIso) : null;

  return (
    <section className="mx-auto max-w-[1200px] px-4 mt-10 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Countdown (黒スコアボード) */}
        <div className="relative bg-[#111111] text-white px-6 py-8 md:px-10 md:py-10 border-[3px] border-[#111111]">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block w-2 h-2 bg-[#FFE600] animate-pulse"
              aria-hidden
            />
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.3em] text-[#FFE600]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              閉幕特番まで
            </p>
          </div>
          {remaining ? (
            <div className="flex items-baseline gap-4">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-6xl md:text-8xl font-black leading-none tabular-nums"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {remaining.days}
                </span>
                <span
                  className="text-xl md:text-2xl font-bold pb-1"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  日
                </span>
              </div>
              <span
                className="text-4xl md:text-6xl font-black text-[#D41E28] leading-none"
                style={{ fontFamily: "var(--font-outfit)" }}
                aria-hidden
              >
                :
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-5xl md:text-7xl font-black leading-none tabular-nums"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {String(remaining.hours).padStart(2, "0")}
                </span>
                <span
                  className="text-lg md:text-xl font-bold pb-1"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  時間
                </span>
              </div>
            </div>
          ) : (
            <p
              className="text-3xl md:text-5xl font-black"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              準備中
            </p>
          )}
          {stage?.endDate && (
            <p
              className="mt-4 text-[10px] md:text-xs font-bold tracking-widest text-[#9BA8BF]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              終戦日 {stage.endDate.replace(/-/g, ".")}
            </p>
          )}
        </div>

        {/* Now playing (紙スコアボード) */}
        <div className="relative bg-[#F5F1E8] text-[#111111] px-6 py-8 md:px-10 md:py-10 border-[3px] border-[#111111] md:border-l-0">
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.3em] text-[#D41E28] mb-4"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            NOW PLAYING
          </p>
          {stage ? (
            <>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-lg md:text-xl font-bold text-[#4A5060]"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  第
                </span>
                <span
                  className="text-5xl md:text-7xl font-black leading-none tabular-nums"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {stage.stageNumber ?? "?"}
                </span>
                <span
                  className="text-xl md:text-2xl font-bold"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  節
                </span>
              </div>
              {(stage.title ?? stage.name) && (
                <p
                  className="mt-3 text-lg md:text-2xl font-black leading-tight"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  「{stage.title ?? stage.name}」
                </p>
              )}
              <p
                className="mt-2 text-[10px] md:text-xs font-bold tracking-widest text-[#4A5060]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {stage.startDate.replace(/-/g, ".")} — {stage.endDate.replace(/-/g, ".")}
              </p>
            </>
          ) : (
            <p
              className="text-2xl md:text-3xl font-black"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              次節 開幕前
            </p>
          )}
          <Link
            href="/ranking"
            className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#D41E28] hover:underline"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            全体ランキングを見る →
          </Link>
        </div>
      </div>
    </section>
  );
}
