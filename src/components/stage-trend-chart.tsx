import { getStageTrendByMemberName } from "@/lib/projectp/trend";
import { TrendLineChart } from "./trend-line-chart";

export async function StageTrendChart({ memberName }: { memberName: string }) {
  const { stageTitle, stageName, stageStartDate, stageEndDate, points } =
    await getStageTrendByMemberName(memberName);
  if (points.length === 0 || !stageStartDate || !stageEndDate) return null;

  const displayTitle = stageTitle
    ? `ステージ「${stageTitle}」推移`
    : stageName
    ? `${stageName} 推移`
    : "ステージ内推移";

  const totalDays = Math.round(
    (new Date(stageEndDate).getTime() - new Date(stageStartDate).getTime()) /
      (86400 * 1000)
  );

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
          📈 {displayTitle}
        </h2>
      </div>
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
        <TrendLineChart
          points={points}
          stageStartDate={stageStartDate}
          stageEndDate={stageEndDate}
        />
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
          <span>
            {points.length} 日分 / 全 {totalDays} 日（{stageStartDate.slice(5)} 〜{" "}
            {stageEndDate.slice(5)}）
          </span>
          <span>
            最高:{" "}
            <b className="text-foreground">
              {Math.max(...points.map((p) => p.totalPoints)).toLocaleString()}
            </b>{" "}
            pts
          </span>
        </div>
      </div>
    </section>
  );
}
