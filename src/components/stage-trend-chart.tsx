import { getStageTrendByMemberName } from "@/lib/projectp/trend";

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (86400 * 1000),
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

  const svgW = 400;
  const svgH = 220;
  const padL = 0;
  const padR = 0;
  const padT = 18;
  const padB = 6;
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
    ? `「${stageTitle}」推移`
    : stageName
      ? `${stageName} 推移`
      : "ステージ内推移";

  return (
    <section className="mx-auto max-w-[1100px] px-4 mt-12">
      {/* セクション見出し (新トーン) */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="inline-block w-2 h-2 bg-[#D41E28]" />
        <p
          className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ━ 推移
        </p>
        <h2
          className="text-2xl md:text-3xl font-black text-[#111] leading-none"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {displayTitle}
        </h2>
        <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
      </div>

      <div
        className="relative bg-[#F5F1E8] border-2 border-[#111] px-5 py-5 md:px-6 md:py-6"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(17,17,17,0.08) 0.6px, transparent 1px)",
          backgroundSize: "5px 5px",
          boxShadow: "5px 5px 0 rgba(17,17,17,0.18)",
        }}
      >
        {/* 上段: 統計サマリ */}
        <div className="flex items-baseline justify-between mb-4 pb-3 border-b-[3px] border-[#111]">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[10px] font-black tracking-[0.3em] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              MAX
            </span>
            <span
              className="text-2xl md:text-3xl font-black tabular-nums text-[#111] leading-none"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {maxVal.toLocaleString()}
            </span>
            <span
              className="text-xs font-bold text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              pt
            </span>
          </div>
          <div
            className="text-[10px] font-bold tabular-nums tracking-wider text-[#4A5060]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {points.length} 日記録 · 全 {totalDays} 日
          </div>
        </div>

        {/* グラフ本体 */}
        <div className="relative" style={{ height: 200 }}>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            {/* グリッド横線 (黒の点線) */}
            {yTicks.map((t, i) => (
              <line
                key={t.y}
                x1={0}
                y1={t.y}
                x2={svgW}
                y2={t.y}
                stroke="#111111"
                strokeOpacity={i === 0 || i === yTicks.length - 1 ? 0.4 : 0.12}
                strokeWidth={1}
                strokeDasharray={i === 0 || i === yTicks.length - 1 ? "0" : "3 3"}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* 今日の参照線 (赤の縦点線) */}
            {todayX !== null && (
              <line
                x1={todayX}
                y1={padT}
                x2={todayX}
                y2={padT + plotH}
                stroke="#D41E28"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* エリア塗り潰し (赤グラデ) */}
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D41E28" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#D41E28" stopOpacity={0} />
              </linearGradient>
            </defs>
            {pts.length > 1 && <path d={areaPath} fill="url(#areaFill)" />}

            {/* ライン (赤・太め) */}
            {pts.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#D41E28"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* ドット (赤、白縁) */}
            {pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#D41E28"
                stroke="#F5F1E8"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* 「今日」ラベル */}
          {todayX !== null && (
            <span
              className="absolute text-[10px] font-black tracking-wider text-[#D41E28] bg-[#FFE600] px-1.5 py-0.5 leading-none"
              style={{
                fontFamily: "var(--font-outfit)",
                left: `${(todayX / svgW) * 100}%`,
                top: -2,
                transform: "translateX(-50%)",
                boxShadow: "1px 1px 0 rgba(17,17,17,0.22)",
              }}
            >
              TODAY
            </span>
          )}
        </div>

        {/* X 軸ラベル */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#111]/30 text-[10px] font-bold tabular-nums text-[#4A5060]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          <span>{fmtDate(stageStartDate)}</span>
          <span>{fmtDate(stageEndDate)}</span>
        </div>
      </div>
    </section>
  );
}
