"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

type DataPoint = {
  date: string;
  label: string;
  totalPoints: number | null;
};

function formatDate(d: string): string {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function TrendLineChart({
  points,
  stageStartDate,
  stageEndDate,
}: {
  points: { date: string; totalPoints: number }[];
  stageStartDate: string;
  stageEndDate: string;
}) {
  // Stage 全日程の日付リストを生成
  const allDates: string[] = [];
  let cur = stageStartDate;
  while (cur <= stageEndDate) {
    allDates.push(cur);
    cur = addDays(cur, 1);
  }

  // データを日付でマッピング
  const pointsByDate = new Map(points.map((p) => [p.date, p.totalPoints]));

  // 全日付のデータ配列(データなしは null)
  const data: DataPoint[] = allDates.map((d) => ({
    date: d,
    label: formatDate(d),
    totalPoints: pointsByDate.get(d) ?? null,
  }));

  // 今日の位置(参考線)
  const today = new Date().toISOString().slice(0, 10);
  const maxVal = Math.max(...points.map((p) => p.totalPoints), 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d3f3" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d3f3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
          domain={[0, Math.ceil(maxVal * 1.1)]}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontSize: 12,
            padding: "8px 12px",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) =>
            value != null
              ? [`${Number(value).toLocaleString()} pts`, "ポイント"]
              : ["—", ""]
          }
        />
        {today >= stageStartDate && today <= stageEndDate && (
          <ReferenceLine
            x={formatDate(today)}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{
              value: "今日",
              position: "top",
              fontSize: 10,
              fill: "#94a3b8",
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="totalPoints"
          stroke="#00d3f3"
          strokeWidth={2.5}
          fill="url(#colorPts)"
          dot={{ r: 3, fill: "#00d3f3", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 5, fill: "#00d3f3", stroke: "#fff", strokeWidth: 2 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
