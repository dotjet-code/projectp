import { AdminNav } from "../admin-nav";
import { listStages } from "@/lib/projectp/stage";
import { RewardsClient } from "./rewards-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "景品管理" };

export default async function AdminRewardsPage() {
  const stages = await listStages();

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-8">
      <AdminNav current="rewards" />

      <h1 className="text-2xl font-extrabold mb-2">景品管理</h1>
      <p className="text-xs text-muted mb-6">
        順位予想の的中者に景品を発行・会場で消込む。
      </p>

      <RewardsClient
        stages={stages.map((s) => ({
          id: s.id,
          name: s.name,
          title: s.title,
          startDate: s.startDate,
          endDate: s.endDate,
        }))}
      />
    </main>
  );
}
