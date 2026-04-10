import Link from "next/link";
import { listStages } from "@/lib/projectp/stage";
import { LogoutButton } from "../logout-button";
import { CreateStageForm } from "./create-stage-form";
import { StageActions } from "./stage-actions";

export const dynamic = "force-dynamic";

export default async function AdminStagesPage() {
  const stages = await listStages();
  const active = stages.find((s) => s.status === "active") ?? null;
  const closed = stages.filter((s) => s.status === "closed");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project P / Admin: Stage 管理</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/connect"
            className="text-xs text-gray-500 hover:text-gray-900 underline"
          >
            ← メンバー管理
          </Link>
          <Link
            href="/admin/stats"
            className="text-xs text-gray-500 hover:text-gray-900 underline"
          >
            ポイント状況 →
          </Link>
          <LogoutButton />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-8">
        特番から次の特番までが1つの Stage。Series は半年の括り。
      </p>

      {/* Active Stage */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">現在の Stage</h2>
        {active ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-700 tracking-wider">
                  {active.seriesNumber !== null
                    ? `SERIES ${active.seriesNumber} / `
                    : ""}
                  {active.stageNumber !== null
                    ? `STAGE ${active.stageNumber}`
                    : "STAGE"}
                </p>
                <h3 className="mt-1 text-xl font-bold text-foreground">
                  {active.title ?? active.name}
                </h3>
                {active.subtitle && (
                  <p className="text-sm text-muted mt-0.5">{active.subtitle}</p>
                )}
                <p className="mt-2 text-xs text-muted">
                  {active.startDate} 〜 {active.endDate}
                </p>
              </div>
              <StageActions stageId={active.id} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5">
            <p className="text-sm text-gray-600">
              active な Stage はありません。下のフォームから作成してください。
            </p>
          </div>
        )}
      </section>

      {/* Create new */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">新しい Stage を作成</h2>
        <CreateStageForm hasActive={Boolean(active)} />
      </section>

      {/* Closed Stages history */}
      <section>
        <h2 className="text-lg font-semibold mb-3">過去の Stage</h2>
        {closed.length === 0 ? (
          <p className="text-sm text-gray-500">確定済みの Stage はまだありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {closed.map((s) => (
              <li key={s.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 tracking-wider">
                      {s.seriesNumber !== null
                        ? `SERIES ${s.seriesNumber} / `
                        : ""}
                      {s.stageNumber !== null
                        ? `STAGE ${s.stageNumber}`
                        : "STAGE"}
                    </p>
                    <p className="font-bold text-foreground">
                      {s.title ?? s.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.startDate} 〜 {s.endDate}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                    closed
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
