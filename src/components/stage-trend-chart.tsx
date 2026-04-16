import { getStageTrendByMemberName } from "@/lib/projectp/trend";

export async function StageTrendChart({ memberName }: { memberName: string }) {
  const { stageName, stageTitle, points } =
    await getStageTrendByMemberName(memberName);
  if (points.length === 0) return null;

  const max = Math.max(...points.map((p) => p.totalPoints), 1);
  const w = 100;
  const h = 50;
  const innerH = h - 10;

  const pts = points.map((p, i) => ({
    x: points.length === 1 ? w / 2 : (i / (points.length - 1)) * w,
    y: h - 5 - (p.totalPoints / max) * innerH,
    value: p.totalPoints,
    date: p.date,
  }));

  const path = pts
    .map(
      (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    )
    .join(" ");

  // ステージ名の表示用
  const displayTitle = stageTitle
    ? `ステージ「${stageTitle}」推移`
    : stageName
    ? `${stageName} 推移`
    : "ステージ内推移";

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
          📈 {displayTitle}
        </h2>
      </div>
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
        <p className="text-xs text-muted mb-3">
          累計ポイント推移（1日 1スナップショット）
        </p>
        <div style={{ aspectRatio: "3 / 1" }}>
          <svg
            viewBox={`0 0 ${w} ${h + 10}`}
            className="size-full"
            preserveAspectRatio="none"
          >
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = h - 5 - t * innerH;
              return (
                <line
                  key={t}
                  x1={0}
                  y1={y}
                  x2={w}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={0.3}
                />
              );
            })}
            {/* Line */}
            {points.length > 1 && (
              <path
                d={path}
                fill="none"
                stroke="#00d3f3"
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Points */}
            {pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={1.5}
                fill="#00d3f3"
                stroke="white"
                strokeWidth={0.6}
              />
            ))}
            {/* Date labels */}
            {pts.length > 0 && (
              <>
                <text
                  x={0}
                  y={h + 6}
                  fontSize={3.5}
                  fill="#7a8ba0"
                  textAnchor="start"
                >
                  {pts[0].date.slice(5)}
                </text>
                {pts.length > 1 && (
                  <text
                    x={w}
                    y={h + 6}
                    fontSize={3.5}
                    fill="#7a8ba0"
                    textAnchor="end"
                  >
                    {pts[pts.length - 1].date.slice(5)}
                  </text>
                )}
              </>
            )}
          </svg>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
          <span>{points.length} 日分のスナップショット</span>
          <span>
            最高: <b className="text-foreground">{max.toLocaleString()}</b> pts
          </span>
        </div>
      </div>
    </section>
  );
}
