import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveStage } from "./stage";

/**
 * ライブ応援投票ヘルパー。
 * 匿名 Cookie ベース、1 (cookie_id, vote_date) につき 1票。
 */

export type VoteTallyRow = {
  memberId: string;
  memberName: string;
  slug: string | null;
  avatarUrl: string | null;
  count: number;
};

function todayJst(): string {
  // JST の「今日」の YYYY-MM-DD を返す
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export async function castLiveVote(
  cookieId: string,
  memberId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  // active Stage を紐付け（無ければ null）
  const stage = await getActiveStage().catch(() => null);

  const voteDate = todayJst();

  const { error } = await supabase.from("live_votes").upsert(
    {
      cookie_id: cookieId,
      member_id: memberId,
      period_id: stage?.id ?? null,
      vote_date: voteDate,
    },
    { onConflict: "cookie_id,vote_date" }
  );
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * 今日の投票集計。votes 降順で返す。
 */
export async function getTodaysTally(): Promise<{
  voteDate: string;
  totalVotes: number;
  rows: VoteTallyRow[];
}> {
  const supabase = createAdminClient();
  const voteDate = todayJst();

  const { data: votes, error } = await supabase
    .from("live_votes")
    .select("member_id")
    .eq("vote_date", voteDate);
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const v of votes ?? []) {
    counts.set(v.member_id, (counts.get(v.member_id) ?? 0) + 1);
  }

  if (counts.size === 0) {
    return { voteDate, totalVotes: 0, rows: [] };
  }

  // メンバー情報を取得
  const memberIds = [...counts.keys()];
  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .in("id", memberIds);

  const { members: dummyMembers } = await import("@/lib/data");
  const dummyByName = new Map(dummyMembers.map((d) => [d.name, d]));

  const rows: VoteTallyRow[] = (members ?? []).map((m) => {
    const dummy = dummyByName.get(m.name);
    return {
      memberId: m.id,
      memberName: m.name,
      slug: dummy?.slug ?? null,
      avatarUrl: dummy?.avatarUrl ?? null,
      count: counts.get(m.id) ?? 0,
    };
  });

  rows.sort((a, b) => b.count - a.count);

  return {
    voteDate,
    totalVotes: rows.reduce((s, r) => s + r.count, 0),
    rows,
  };
}

/**
 * この cookie が今日すでに投票しているか。
 */
export async function getTodaysVoteByCookie(
  cookieId: string
): Promise<{ memberId: string } | null> {
  const supabase = createAdminClient();
  const voteDate = todayJst();
  const { data } = await supabase
    .from("live_votes")
    .select("member_id")
    .eq("cookie_id", cookieId)
    .eq("vote_date", voteDate)
    .maybeSingle();
  if (!data) return null;
  return { memberId: data.member_id };
}
