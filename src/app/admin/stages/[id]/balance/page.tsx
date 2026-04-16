import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStageById } from "@/lib/projectp/stage";
import { listBalanceForStage } from "@/lib/projectp/balance-special";
import { LogoutButton } from "../../../logout-button";
import { BalanceForm } from "./balance-form";

export const dynamic = "force-dynamic";

type MemberRow = {
  id: string;
  name: string;
};

async function listMembers(): Promise<MemberRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MemberRow[];
}

export default async function StageBalancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stage = await getStageById(id);
  if (!stage) notFound();

  const [members, entries] = await Promise.all([
    listMembers(),
    listBalanceForStage(id),
  ]);

  const entryByMember = new Map<string, (typeof entries)[number]>();
  for (const e of entries) entryByMember.set(e.memberId, e);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">収支ポイント入力</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/stages"
            className="text-xs text-gray-500 hover:text-gray-900 underline"
          >
            ← ステージ管理
          </Link>
          <LogoutButton />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        ステージ:{" "}
        <span className="font-bold text-foreground">
          {stage.title ?? stage.name}
        </span>
        {stage.subtitle && (
          <span className="text-gray-500"> — {stage.subtitle}</span>
        )}
      </p>
      <p className="text-xs text-gray-500 mb-8">
        {stage.startDate} 〜 {stage.endDate}
        {stage.status === "closed" && " · closed"}
      </p>

      <p className="mb-6 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-900">
        Project P ルール: <b>期間終了時の残金</b> をそのままポイントとして入力します。
        1メンバー1値で上書き保存されます。
      </p>

      <ul className="space-y-3">
        {members.map((m) => {
          const existing = entryByMember.get(m.id);
          return (
            <li
              key={m.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <BalanceForm
                stageId={stage.id}
                member={m}
                initialAmount={existing?.amount ?? 0}
                initialNote={existing?.note ?? ""}
              />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
