import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import { getFanEngagement } from "@/lib/projectp/member-performance";

export const dynamic = "force-dynamic";
export const metadata = { title: "ファンの声" };

export default async function MemberFansPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/member/login");

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) redirect("/member/dashboard");

  const engagement = await getFanEngagement(memberId);
  const maxBetCount = Math.max(...engagement.byBetType.map((b) => b.count), 1);
  const maxVotes = Math.max(...engagement.liveVotes.map((v) => v.votes), 1);

  return (
    <main className="mx-auto max-w-[800px] px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-6">ファンの声</h1>

      {/* サマリ */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border border-[rgba(206,250,254,0.5)] bg-gradient-to-br from-[#ecfeff] to-[#f0f9ff] p-5 text-center">
          <p className="text-[10px] font-semibold text-primary-dark">
            🎯 予想で選ばれた回数
          </p>
          <p className="mt-1 font-[family-name:var(--font-outfit)] text-3xl font-black text-primary-dark">
            {engagement.totalPicks}
          </p>
          <p className="text-[10px] text-muted">全賭式・全 Stage</p>
        </div>
        <div className="rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50 to-red-50 p-5 text-center">
          <p className="text-[10px] font-semibold text-[#e7000b]">
            💖 ライブ投票の総得票
          </p>
          <p className="mt-1 font-[family-name:var(--font-outfit)] text-3xl font-black text-[#e7000b]">
            {engagement.totalVotes}
          </p>
          <p className="text-[10px] text-muted">全イベント合計</p>
        </div>
      </div>

      {/* 賭式別の選ばれた回数 */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-muted mb-3">
          🎯 賭式別: ファンに選ばれた回数
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
          {engagement.byBetType.map((b) => (
            <div key={b.key} className="flex items-center gap-3">
              <span className="text-xs font-bold w-16">{b.label}</span>
              <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-blue"
                  style={{
                    width: `${(b.count / maxBetCount) * 100}%`,
                  }}
                />
              </div>
              <span className="font-[family-name:var(--font-outfit)] text-sm font-bold w-8 text-right">
                {b.count}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted">
          ファン会員が予想で「あなた」を選んだ回数。複勝や単勝で多く選ばれていると期待されています。
        </p>
      </section>

      {/* ライブ投票の得票推移 */}
      <section>
        <h2 className="text-sm font-bold text-muted mb-3">
          💖 ライブ投票の得票数
        </h2>
        {engagement.liveVotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="text-sm text-muted">
              まだライブ投票のデータがありません。
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            {engagement.liveVotes.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="min-w-0 flex-shrink-0 w-32">
                  <p className="text-xs font-bold truncate">{v.eventTitle}</p>
                  <p className="text-[10px] text-muted">{v.eventDate}</p>
                </div>
                <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e7000b] to-[#fb64b6]"
                    style={{
                      width: `${(v.votes / maxVotes) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-[family-name:var(--font-outfit)] text-sm font-bold w-8 text-right">
                  {v.votes}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
