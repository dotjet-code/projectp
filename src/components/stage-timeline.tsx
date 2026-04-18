import type { Stage } from "@/lib/projectp/stage";

const PHASES = [
  { key: "opening", label: "開幕" },
  { key: "mid", label: "中盤" },
  { key: "closing", label: "終盤" },
  { key: "finale", label: "月末特番" },
] as const;

function computeCurrentPhaseIndex(stage: Stage | null): number {
  if (!stage) return 0;
  const start = new Date(stage.startDate).getTime();
  const end = new Date(stage.endDate).getTime();
  const span = Math.max(end - start, 1);
  const now = Date.now();
  const t = (now - start) / span;
  if (t < 0.3) return 0;
  if (t < 0.6) return 1;
  if (t < 0.95) return 2;
  return 3;
}

export function StageTimeline({ stage }: { stage: Stage | null }) {
  const current = computeCurrentPhaseIndex(stage);
  const stageNum = stage?.stageNumber ?? null;
  const currentLabel = PHASES[current].label;

  return (
    <div className="border-b border-[#111] bg-[#F5F1E8]">
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Timeline nodes */}
          <div className="flex-1 relative h-6 flex items-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#111]" />
            <div className="relative w-full flex justify-between">
              {PHASES.map((phase, i) => {
                const isActive = i === current;
                const isPast = i < current;
                return (
                  <div
                    key={phase.key}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className={
                        isActive
                          ? "block w-4 h-4 rounded-full bg-[#D41E28] outline outline-2 outline-[#D41E28] outline-offset-[3px]"
                          : isPast
                          ? "block w-2.5 h-2.5 rounded-full bg-[#111]"
                          : "block w-2.5 h-2.5 rounded-full border border-[#111] bg-[#F5F1E8]"
                      }
                      aria-hidden
                    />
                    <span
                      className={`hidden sm:block text-[10px] font-bold tracking-wider ${
                        isActive ? "text-[#D41E28]" : "text-[#4A5060]"
                      }`}
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {phase.label.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right-side stage marker (現節がある時のみ) */}
          {stageNum !== null && (
            <div className="shrink-0 flex items-center gap-3 text-xs md:text-sm">
              <span className="text-[#4A5060]" style={{ fontFamily: "var(--font-outfit)" }}>
                第
              </span>
              <span
                className="text-xl md:text-2xl font-black text-[#111] leading-none tabular-nums"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {stageNum}
              </span>
              <span className="text-[#4A5060]">節</span>
              <span className="h-4 w-px bg-[#111]" />
              <span className="font-bold text-[#D41E28]">{currentLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
