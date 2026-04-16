import { getStageTrendByMemberName } from "@/lib/projectp/trend";

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (86400 * 1000)
  );
}

function fmtDate(d: string): string {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

export async function StageTrendChart({ memberName }: { memberName: string }) {
  const { stageTitle, stageName, stageStartDate, stageEndDate, points } =
    await getStageTrendByMemberName(memberName);
  if (points.length === 0 || !stageStartDate || !stageEndDate) return null;

  const totalDays = Math.max(daysBetween(stageStartDate, stageEndDate), 1);
  const maxVal = Math.max(...points.map((p) => p.totalPoints), 1);

  // SVG 座標系
  const svgW = 400;
  const svgH = 200;
  const padL = 0;  // 左端ぴったり
  const padR = 0;  // 右端ぴったり
  const padT = 15;
  const padB = 5;
  const plotW = svgW;
  const plotH = svgH - padT - padB;

  const pts = points.map((p) => {
    const day = daysBetween(stageStartDate, p.date);
    return {
      x: padL + (day / totalDays) * plotW,
      y: padT + plotH - (p.totalPoints / maxVal) * plotH,
      value: p.totalPoints,
      date: p.date,
    };
  });

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // グラデーション塗り潰しパス
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x.toFixed(1)} ${padT + plotH} L ${pts[0].x.toFixed(1)} ${padT + plotH} Z`;

  // Y 軸グリッド (4 本)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padT + plotH - t * plotH,
    label: Math.round(maxVal * t).toLocaleString(),
  }));

  // 今日の X 位置
  const today = new Date().toISOString().slice(0, 10);
  const todayDay = daysBetween(stageStartDate, today);
  const todayX =
    todayDay >= 0 && todayDay <= totalDays
      ? padL + (todayDay / totalDays) * plotW
      : null;

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
        {/* グラフ本体: SVG は線とドットだけ、テキストは HTML */}
        <div className="relative" style={{ height: 180 }}>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            {/* グリッド横線 */}
            {yTicks.map((t) => (
              <line
                key={t.y}
                x1={0}
                y1={t.y}
                x2={svgW}
                y2={t.y}
                stroke="#f0f0f0"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* 今日の参照線 */}
            {todayX !== null && (
              <line
                x1={todayX}
                y1={padT}
                x2={todayX}
                y2={padT + plotH}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* エリア塗り潰し */}
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d3f3" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#00d3f3" stopOpacity={0} />
              </linearGradient>
            </defs>
            {pts.length > 1 && <path d={areaPath} fill="url(#areaFill)" />}

            {/* ライン */}
            {pts.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#00d3f3"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* ドット */}
            {pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#00d3f3"
                stroke="white"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* 「今日」ラベル (HTML) */}
          {todayX !== null && (
            <span
              className="absolute text-[10px] text-gray-400 font-[family-name:var(--font-outfit)]"
              style={{
                left: `${(todayX / svgW) * 100}%`,
                top: 0,
                transform: "translateX(-50%)",
              }}
            >
              今日
            </span>
          )}
        </div>

        {/* X 軸ラベル + 統計 (HTML、歪みなし) */}
        <div className="flex items-center justify-between text-[10px] text-muted mt-1">
          <span className="font-[family-name:var(--font-outfit)]">
            {fmtDate(stageStartDate)}
          </span>
          <span>
            {points.length} 日分 / 全 {totalDays} 日 · 最高{" "}
            <b className="text-foreground">{maxVal.toLocaleString()}</b> pts
          </span>
          <span className="font-[family-name:var(--font-outfit)]">
            {fmtDate(stageEndDate)}
          </span>
        </div>
      </div>
    </section>
  );
}
