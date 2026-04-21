import { createAdminClient } from "@/lib/supabase/admin";

function todayJst(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export interface TodayActivityStats {
  /** 本日振られたちんちろの件数 (JST) */
  chinchiroRolls: number;
  /** 本日積まれた票の合計 (ちんちろの total_value の合計) */
  chinchiroVotes: number;
  /** 直近で達成された最高役 (pinzoro > shigoro > zorome > normal) があれば役名 */
  topHandToday: string | null;
}

/**
 * トップページの "今日のアクティビティ" 表示用の軽量集計。
 * Supabase 管理クライアントで全ロールを当日分だけ取得し、メモリで合計する。
 * JST の 0 時でリセット。テーブル件数は 1 日あたり最大で cookie 数 × 1 = 数百〜数千程度を想定。
 */
export async function getTodayActivityStats(): Promise<TodayActivityStats> {
  const supabase = createAdminClient();
  const voteDate = todayJst();

  const { data, error } = await supabase
    .from("chinchiro_rolls")
    .select("hand, total_value")
    .eq("vote_date", voteDate);

  if (error || !data) {
    return { chinchiroRolls: 0, chinchiroVotes: 0, topHandToday: null };
  }

  const rows = data as Array<{ hand: string; total_value: number }>;
  const chinchiroRolls = rows.length;
  const chinchiroVotes = rows.reduce(
    (s, r) => s + (typeof r.total_value === "number" ? r.total_value : 0),
    0,
  );

  const handPriority: Record<string, number> = {
    pinzoro: 5,
    shigoro: 4,
    zorome: 3,
    hifumi: 2,
    normal: 1,
    menashi: 0,
  };
  const handLabel: Record<string, string> = {
    pinzoro: "ピンゾロ",
    shigoro: "シゴロ",
    zorome: "ゾロ目",
    hifumi: "ヒフミ",
    normal: "通常役",
    menashi: "目なし",
  };
  let topHand: string | null = null;
  let topPriority = -1;
  for (const r of rows) {
    const p = handPriority[r.hand] ?? -1;
    if (p > topPriority) {
      topPriority = p;
      topHand = handLabel[r.hand] ?? null;
    }
  }

  return { chinchiroRolls, chinchiroVotes, topHandToday: topHand };
}
