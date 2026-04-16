import { listStages } from "@/lib/projectp/stage";
import { CreateStageForm } from "./create-stage-form";
import { StageCard } from "./stage-card";

export const dynamic = "force-dynamic";

export default async function AdminStagesPage() {
  const stages = await listStages();
  const active = stages.find((s) => s.status === "active") ?? null;
  const closed = stages.filter((s) => s.status === "closed");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">Stage 管理</h1>
      <p className="text-sm text-gray-600 mb-8">
        特番から次の特番までが1つの Stage。Series は半年の括り。
      </p>

      {/* Active Stage */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">現在の Stage</h2>
        {active ? (
          <StageCard stage={active} variant="active" />
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
          <div className="space-y-3">
            {closed.map((s) => (
              <StageCard key={s.id} stage={s} variant="closed" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
