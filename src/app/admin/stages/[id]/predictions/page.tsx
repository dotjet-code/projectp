import Link from "next/link";
import { notFound } from "next/navigation";
import { getStageById } from "@/lib/projectp/stage";
import {
  BET_LABELS,
  BET_SLOT_COUNTS,
  MAX_PREDICTION_SCORE,
  countPredictionsForPeriod,
  getPredictionSummary,
  getTopPredictors,
  type BetKey,
} from "@/lib/projectp/prediction";
import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers } from "@/lib/data";
import { AdminNav } from "../../../admin-nav";
import { RescoreButton } from "./rescore-button";

export const dynamic = "force-dynamic";

export default async function AdminPredictionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stage = await getStageById(id);
  if (!stage) notFound();

  const [totalCount, summary, topPredictors] = await Promise.all([
    countPredictionsForPeriod(id).catch(() => 0),
    getPredictionSummary(id).catch(() => null),
    getTopPredictors(id, 20).catch(() => []),
  ]);

  // メンバー名解決用
  const supabase = createAdminClient();
  const { data: memberRows } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true);
  const memberById = new Map(
    (memberRows ?? []).map((m) => [m.id, m.name])
  );
  void dummyMembers;

  function resolveName(memberId: string): string {
    return memberById.get(memberId) ?? "(不明)";
  }

  const slotGroups: {
    key: BetKey;
    title: string;
    labels: string[];
  }[] = [
    { key: "fukusho", title: BET_LABELS.fukusho, labels: ["3着以内"] },
    { key: "tansho", title: BET_LABELS.tansho, labels: ["1着"] },
    {
      key: "nirenpuku",
      title: BET_LABELS.nirenpuku,
      labels: ["選出"],
    },
    { key: "nirentan", title: BET_LABELS.nirentan, labels: ["1着", "2着"] },
    {
      key: "sanrenpuku",
      title: BET_LABELS.sanrenpuku,
      labels: ["選出"],
    },
    {
      key: "sanrentan",
      title: BET_LABELS.sanrentan,
      labels: ["1着", "2着", "3着"],
    },
  ];
  void BET_SLOT_COUNTS;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <AdminNav current="stages" />
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">予想集計</h1>
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
        {stage.status === "closed" && (
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
            closed
          </span>
        )}
      </p>
      <p className="text-xs text-gray-500 mb-8">
        {stage.startDate} 〜 {stage.endDate}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-xs font-bold text-muted">提出数</p>
          <p className="mt-1 text-3xl font-black text-foreground font-[family-name:var(--font-outfit)]">
            {totalCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-xs font-bold text-muted">スコア済み</p>
          <p className="mt-1 text-3xl font-black text-foreground font-[family-name:var(--font-outfit)]">
            {topPredictors.length}
          </p>
          {stage.status === "closed" && (
            <RescoreButton stageId={stage.id} />
          )}
        </div>
      </div>

      {/* Summary by slot */}
      {summary && summary.totalCount > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">スロット別集計</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slotGroups.map((g) => {
              const tallies = summary.bySlot[g.key] ?? [];
              return (
                <div
                  key={g.key}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <h3 className="text-sm font-bold text-foreground mb-2">
                    {g.title}
                  </h3>
                  <div className="space-y-2">
                    {tallies.map((t: { positionIndex: number; rows: { memberId: string; count: number }[] }) => {
                      const maxC = Math.max(
                        ...t.rows.map((r: { count: number }) => r.count),
                        1
                      );
                      return (
                        <div key={t.positionIndex}>
                          <p className="text-[10px] font-bold text-muted mb-1">
                            {g.labels[t.positionIndex] ?? ""}
                          </p>
                          {t.rows.slice(0, 5).map((r: { memberId: string; count: number }) => {
                            const pct = (r.count / maxC) * 100;
                            return (
                              <div
                                key={r.memberId}
                                className="flex items-center gap-2 mb-0.5"
                              >
                                <span className="text-[11px] font-bold text-foreground w-20 truncate">
                                  {resolveName(r.memberId)}
                                </span>
                                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-muted w-6 text-right">
                                  {r.count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Top predictors */}
      <section>
        <h2 className="text-lg font-semibold mb-3">的中者ランキング</h2>
        {topPredictors.length === 0 ? (
          <p className="text-xs text-gray-500">
            {stage.status === "closed"
              ? "採点済みの予想がまだありません。上の「再採点」ボタンを押してください。"
              : "Stage を確定すると自動で採点されます。"}
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {topPredictors.map((p) => (
              <li
                key={p.rank}
                className="flex items-center justify-between px-4 py-2.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-[#7008e7]">
                    {p.rank <= 3
                      ? ["🥇", "🥈", "🥉"][p.rank - 1]
                      : `#${p.rank}`}
                  </span>
                  <span className="font-mono text-muted">
                    {p.cookieIdMasked}
                  </span>
                  {p.entryType === "welcome" && (
                    <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-[9px] font-bold text-pink-700">
                      WELCOME
                    </span>
                  )}
                </div>
                <span className="font-[family-name:var(--font-outfit)] text-sm font-black text-foreground">
                  {p.totalScore}/{MAX_PREDICTION_SCORE}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
