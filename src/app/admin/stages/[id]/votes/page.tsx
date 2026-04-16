import Link from "next/link";
import { notFound } from "next/navigation";
import { getStageById } from "@/lib/projectp/stage";
import { getStageVoteSummary } from "@/lib/projectp/live-vote-admin";
import { ConvertToSpecialButton } from "./convert-to-special";

export const dynamic = "force-dynamic";

export default async function AdminVotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stage = await getStageById(id);
  if (!stage) notFound();

  const summary = await getStageVoteSummary(id);

  const maxVotes = Math.max(
    ...summary.memberTotals.map((m) => m.totalVotes),
    1
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ライブ投票集計</h1>
        <Link
          href="/admin/stages"
          className="text-xs text-gray-500 hover:text-gray-900 underline"
        >
          ← Stage 管理
        </Link>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        Stage:{" "}
        <span className="font-bold text-foreground">
          {stage.title ?? stage.name}
        </span>
      </p>
      <p className="text-xs text-gray-500 mb-8">
        {stage.startDate} 〜 {stage.endDate}
      </p>

      {/* Total */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-8 text-center">
        <p className="text-xs font-bold text-muted">総投票数</p>
        <p className="mt-1 text-3xl font-black text-foreground font-[family-name:var(--font-outfit)]">
          {summary.totalVotes.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-muted">
          {summary.days.length} 日間 / {summary.memberTotals.length} メンバーに投票あり
        </p>
      </div>

      {/* Member totals + convert to special */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">メンバー別集計</h2>
          <ConvertToSpecialButton stageId={stage.id} memberTotals={summary.memberTotals} />
        </div>

        {summary.memberTotals.length === 0 ? (
          <p className="text-xs text-gray-500">投票データがありません。</p>
        ) : (
          <ul className="space-y-2">
            {summary.memberTotals.map((m, i) => {
              const pct = (m.totalVotes / maxVotes) * 100;
              return (
                <li
                  key={m.memberId}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-[family-name:var(--font-outfit)] text-sm font-extrabold text-[#e7000b]">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {m.name}
                      </p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-live to-[#fb64b6] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground w-12 text-right">
                      {m.totalVotes.toLocaleString()}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Day-by-day */}
      <section>
        <h2 className="text-lg font-semibold mb-3">日別サマリ</h2>
        {summary.days.length === 0 ? (
          <p className="text-xs text-gray-500">投票データがありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {summary.days.map((d) => (
              <li
                key={d.voteDate}
                className="flex items-center justify-between px-4 py-3 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-foreground">
                    {d.voteDate}
                  </span>
                  {d.topMember && (
                    <span className="ml-2 text-muted">
                      1位: {d.topMember.name} ({d.topMember.count})
                    </span>
                  )}
                </div>
                <span className="font-[family-name:var(--font-outfit)] font-bold text-foreground">
                  {d.totalVotes} 票
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
