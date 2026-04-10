import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers } from "@/lib/data";

/**
 * 管理画面用: Stage 期間内のライブ投票集計。
 */

export type VoteDaySummary = {
  voteDate: string;
  totalVotes: number;
  topMember: { memberId: string; name: string; count: number } | null;
};

export type VoteMemberTotal = {
  memberId: string;
  name: string;
  slug: string | null;
  totalVotes: number;
};

export type StageVoteSummary = {
  totalVotes: number;
  days: VoteDaySummary[];
  memberTotals: VoteMemberTotal[];
};

export async function getStageVoteSummary(
  stageId: string
): Promise<StageVoteSummary> {
  const supabase = createAdminClient();

  const { data: votes, error } = await supabase
    .from("live_votes")
    .select("member_id, vote_date")
    .eq("period_id", stageId);
  if (error) throw new Error(error.message);

  const rows = (votes ?? []) as Array<{
    member_id: string;
    vote_date: string;
  }>;

  // メンバー名解決
  const memberIds = [...new Set(rows.map((r) => r.member_id))];
  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .in("id", memberIds.length > 0 ? memberIds : ["__none__"]);
  const nameById = new Map(
    (members ?? []).map((m) => [m.id, m.name as string])
  );
  const dummyByName = new Map(dummyMembers.map((d) => [d.name, d]));

  // 日別集計
  const byDate = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (!byDate.has(r.vote_date)) byDate.set(r.vote_date, new Map());
    const dm = byDate.get(r.vote_date)!;
    dm.set(r.member_id, (dm.get(r.member_id) ?? 0) + 1);
  }

  const days: VoteDaySummary[] = [...byDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, counts]) => {
      let topEntry: { memberId: string; count: number } | null = null;
      let total = 0;
      for (const [mid, c] of counts) {
        total += c;
        if (!topEntry || c > topEntry.count) topEntry = { memberId: mid, count: c };
      }
      return {
        voteDate: date,
        totalVotes: total,
        topMember: topEntry
          ? {
              memberId: topEntry.memberId,
              name: nameById.get(topEntry.memberId) ?? "(不明)",
              count: topEntry.count,
            }
          : null,
      };
    });

  // メンバー別合計
  const memberCounts = new Map<string, number>();
  for (const r of rows) {
    memberCounts.set(r.member_id, (memberCounts.get(r.member_id) ?? 0) + 1);
  }
  const memberTotals: VoteMemberTotal[] = [...memberCounts.entries()]
    .map(([mid, count]) => {
      const name = nameById.get(mid) ?? "(不明)";
      const dummy = dummyByName.get(name);
      return {
        memberId: mid,
        name,
        slug: dummy?.slug ?? null,
        totalVotes: count,
      };
    })
    .sort((a, b) => b.totalVotes - a.totalVotes);

  return {
    totalVotes: rows.length,
    days,
    memberTotals,
  };
}
