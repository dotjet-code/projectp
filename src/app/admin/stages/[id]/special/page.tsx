import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStageById } from "@/lib/projectp/stage";
import { listSpecialForStage } from "@/lib/projectp/balance-special";
import { LogoutButton } from "../../../logout-button";
import { SpecialEditor } from "./special-editor";

export const dynamic = "force-dynamic";

type MemberRow = { id: string; name: string };

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

export default async function StageSpecialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stage = await getStageById(id);
  if (!stage) notFound();

  const [members, entries] = await Promise.all([
    listMembers(),
    listSpecialForStage(id),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">特別ポイント入力</h1>
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
      </p>
      <p className="text-xs text-gray-500 mb-6">
        {stage.startDate} 〜 {stage.endDate}
        {stage.status === "closed" && " · closed"}
      </p>

      <p className="mb-6 rounded-lg bg-purple-50 border border-purple-200 px-4 py-3 text-xs text-purple-900">
        SPECIAL / LIVE DAY ONLY:{" "}
        <b>ライブ開催日のみ有効</b> な別レイヤーポイントです。日付ごとにメンバー別で記録します。
      </p>

      <SpecialEditor
        stageId={stage.id}
        members={members}
        initialEntries={entries}
        defaultDate={stage.startDate}
      />
    </main>
  );
}
