import { createAdminClient } from "@/lib/supabase/admin";

export type StagePerformance = {
  periodId: string;
  periodName: string;
  rank: number;
  buzzPoints: number;
  livePoints: number;
  balancePoints: number;
  specialPoints: number;
  totalPoints: number;
  position: "PLAYER" | "PIT";
};

export type PerformanceAnalysis = {
  stages: StagePerformance[];
  // 全メンバーの平均との比較
  avgComparison: {
    buzz: { me: number; avg: number };
    live: { me: number; avg: number };
    balance: { me: number; avg: number };
  };
  // 強み/弱み
  strengths: string[];
  weaknesses: string[];
};

export type FanEngagement = {
  // 賭式別の選ばれた回数
  byBetType: {
    key: string;
    label: string;
    count: number;
  }[];
  totalPicks: number;
  // ライブ投票の得票数 (イベント別)
  liveVotes: {
    eventTitle: string;
    eventDate: string;
    votes: number;
  }[];
  totalVotes: number;
};

/**
 * メンバーの Stage 別パフォーマンスと分析。
 */
export async function getMemberPerformance(
  memberId: string
): Promise<PerformanceAnalysis> {
  const supabase = createAdminClient();

  // 全 closed Stage の period_points を取得
  const { data: allPoints } = await supabase
    .from("period_points")
    .select(
      "period_id, member_id, rank, position, buzz_points, live_points, balance_points, special_points, periods(name, start_date)"
    )
    .not("rank", "is", null)
    .order("periods(start_date)", { ascending: true });

  type PointRow = {
    period_id: string;
    member_id: string;
    rank: number;
    position: string;
    buzz_points: number;
    live_points: number;
    balance_points: number;
    special_points: number;
    periods: { name: string | null; start_date: string | null } | null;
  };
  const rows = (allPoints ?? []) as unknown as PointRow[];

  // 自分の Stage パフォーマンス
  const myStages: StagePerformance[] = rows
    .filter((r) => r.member_id === memberId)
    .map((r) => ({
      periodId: r.period_id,
      periodName: r.periods?.name ?? "Stage",
      rank: r.rank,
      buzzPoints: r.buzz_points,
      livePoints: r.live_points,
      balancePoints: r.balance_points,
      specialPoints: r.special_points,
      totalPoints:
        r.buzz_points + r.live_points + r.balance_points + r.special_points,
      position: (r.position === "PLAYER" ? "PLAYER" : "PIT") as
        | "PLAYER"
        | "PIT",
    }));

  // 全メンバー平均(直近の Stage)
  const latestPeriodId = myStages.length > 0
    ? myStages[myStages.length - 1].periodId
    : null;

  let avgComparison = {
    buzz: { me: 0, avg: 0 },
    live: { me: 0, avg: 0 },
    balance: { me: 0, avg: 0 },
  };

  if (latestPeriodId) {
    const latestRows = rows.filter((r) => r.period_id === latestPeriodId);
    const n = latestRows.length || 1;
    const avgBuzz = latestRows.reduce((s, r) => s + r.buzz_points, 0) / n;
    const avgLive = latestRows.reduce((s, r) => s + r.live_points, 0) / n;
    const avgBal = latestRows.reduce((s, r) => s + r.balance_points, 0) / n;
    const me = latestRows.find((r) => r.member_id === memberId);

    avgComparison = {
      buzz: { me: me?.buzz_points ?? 0, avg: Math.round(avgBuzz) },
      live: { me: me?.live_points ?? 0, avg: Math.round(avgLive) },
      balance: { me: me?.balance_points ?? 0, avg: Math.round(avgBal) },
    };
  }

  // 強み/弱み判定
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const cats = [
    { key: "buzz", label: "バズ" },
    { key: "live", label: "配信" },
    { key: "balance", label: "収支" },
  ] as const;
  for (const c of cats) {
    const comp = avgComparison[c.key];
    if (comp.me > comp.avg * 1.2) strengths.push(c.label);
    else if (comp.me < comp.avg * 0.8) weaknesses.push(c.label);
  }

  return { stages: myStages, avgComparison, strengths, weaknesses };
}

/**
 * ファンからのエンゲージメント。
 */
export async function getFanEngagement(
  memberId: string
): Promise<FanEngagement> {
  const supabase = createAdminClient();

  // 予想で選ばれた回数(賭式別)
  const betKeys = [
    { key: "tansho", label: "単勝" },
    { key: "fukusho", label: "複勝" },
    { key: "nirenpuku", label: "二連複" },
    { key: "nirentan", label: "二連単" },
    { key: "sanrenpuku", label: "三連複" },
    { key: "sanrentan", label: "三連単" },
  ];

  const { data: preds } = await supabase
    .from("predictions")
    .select("tansho, fukusho, nirenpuku, nirentan, sanrenpuku, sanrentan")
    .not("user_id", "is", null);

  const counts: Record<string, number> = {};
  for (const k of betKeys) counts[k.key] = 0;
  let totalPicks = 0;

  for (const r of (preds ?? []) as Record<string, unknown>[]) {
    for (const k of betKeys) {
      const arr = r[k.key];
      if (Array.isArray(arr) && arr.includes(memberId)) {
        counts[k.key]++;
        totalPicks++;
      }
    }
  }

  const byBetType = betKeys.map((k) => ({
    key: k.key,
    label: k.label,
    count: counts[k.key],
  }));

  // ライブ投票の得票数
  const { data: votes } = await supabase
    .from("event_votes")
    .select("event_id, live_events:event_id(title, event_date)")
    .eq("member_id", memberId);

  const votesByEvent = new Map<
    string,
    { title: string; date: string; votes: number }
  >();
  for (const v of (votes ?? []) as unknown as {
    event_id: string;
    live_events: { title: string; event_date: string } | null;
  }[]) {
    const e = votesByEvent.get(v.event_id) ?? {
      title: v.live_events?.title ?? "イベント",
      date: v.live_events?.event_date ?? "",
      votes: 0,
    };
    e.votes++;
    votesByEvent.set(v.event_id, e);
  }

  const liveVotes = [...votesByEvent.values()]
    .map((e) => ({
      eventTitle: e.title,
      eventDate: e.date,
      votes: e.votes,
    }))
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  const totalVotes = liveVotes.reduce((s, v) => s + v.votes, 0);

  return { byBetType, totalPicks, liveVotes, totalVotes };
}
