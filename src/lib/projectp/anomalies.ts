import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 不正の兆候を検知するヘルパー。
 * いずれも軽量クエリで済むよう、件数の多い JOIN は避けて
 * アプリ側でグループ化する。
 */

export type IpCluster = {
  ip: string;
  userIds: string[];
  count: number;
  earliestAt: string;
  latestAt: string;
  hasFlagged: boolean;
};

/**
 * 同一 signup_ip から作成された fan_profiles をグルーピング。
 * 2件以上のものだけ返す。
 */
export async function detectIpClusters(
  minCount = 2
): Promise<IpCluster[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("fan_profiles")
    .select("user_id, signup_ip, status, created_at")
    .not("signup_ip", "is", null)
    .order("created_at", { ascending: true });

  const rows =
    (data ?? []) as Array<{
      user_id: string;
      signup_ip: string;
      status: string;
      created_at: string;
    }>;

  const byIp = new Map<string, IpCluster>();
  for (const r of rows) {
    const c = byIp.get(r.signup_ip);
    if (c) {
      c.userIds.push(r.user_id);
      c.count++;
      c.latestAt = r.created_at;
      if (r.status !== "active") c.hasFlagged = true;
    } else {
      byIp.set(r.signup_ip, {
        ip: r.signup_ip,
        userIds: [r.user_id],
        count: 1,
        earliestAt: r.created_at,
        latestAt: r.created_at,
        hasFlagged: r.status !== "active",
      });
    }
  }

  return [...byIp.values()]
    .filter((c) => c.count >= minCount)
    .sort((a, b) => b.count - a.count);
}

export type RateLimitHotspot = {
  ip: string | null;
  attempts: number;
};

/**
 * 直近 hours 時間のレート制限ヒット候補（IP ごとの試行数）。
 */
export async function detectRateLimitHotspots(
  hours = 24,
  minAttempts = 5
): Promise<RateLimitHotspot[]> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from("auth_attempts")
    .select("ip")
    .eq("kind", "fan.magic_link")
    .gte("created_at", since);

  const counts = new Map<string | null, number>();
  for (const r of (data ?? []) as { ip: string | null }[]) {
    counts.set(r.ip, (counts.get(r.ip) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([ip, attempts]) => ({ ip, attempts }))
    .filter((h) => h.attempts >= minAttempts)
    .sort((a, b) => b.attempts - a.attempts);
}

export type SuspectRewardCluster = {
  ip: string;
  periodId: string;
  userIds: string[];
  rewardCount: number;
};

/**
 * 同一 IP 由来のファンが同じ period で複数の景品を取得しているケース。
 */
export async function detectSuspectRewardClusters(): Promise<
  SuspectRewardCluster[]
> {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("fan_profiles")
    .select("user_id, signup_ip")
    .not("signup_ip", "is", null);
  const ipByUser = new Map<string, string>();
  for (const r of (profiles ?? []) as {
    user_id: string;
    signup_ip: string;
  }[]) {
    ipByUser.set(r.user_id, r.signup_ip);
  }

  const { data: rewards } = await supabase
    .from("prediction_rewards")
    .select("user_id, period_id");
  const grouped = new Map<string, SuspectRewardCluster>();
  for (const r of (rewards ?? []) as {
    user_id: string;
    period_id: string;
  }[]) {
    const ip = ipByUser.get(r.user_id);
    if (!ip) continue;
    const key = `${ip}:${r.period_id}`;
    const c = grouped.get(key);
    if (c) {
      if (!c.userIds.includes(r.user_id)) c.userIds.push(r.user_id);
      c.rewardCount++;
    } else {
      grouped.set(key, {
        ip,
        periodId: r.period_id,
        userIds: [r.user_id],
        rewardCount: 1,
      });
    }
  }

  return [...grouped.values()]
    .filter((c) => c.userIds.length >= 2)
    .sort((a, b) => b.userIds.length - a.userIds.length);
}
