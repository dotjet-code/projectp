import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStageById } from "@/lib/projectp/stage";
import { SubmissionActions } from "./submission-actions";

export const dynamic = "force-dynamic";

type Sub = {
  id: number;
  member_id: string;
  member_name: string;
  image_url: string;
  purchase_amount: number;
  payout_amount: number;
  profit: number;
  race_info: string | null;
  race_date: string | null;
  note: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
};

export default async function AdminSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stage = await getStageById(id);
  if (!stage) notFound();

  const supabase = createAdminClient();
  const { data: rawSubs } = await supabase
    .from("balance_submissions")
    .select(
      "id, member_id, image_url, purchase_amount, payout_amount, profit, race_info, race_date, note, status, review_note, created_at, members:member_id (name)"
    )
    .eq("period_id", id)
    .order("created_at", { ascending: false });

  const subs: Sub[] = (rawSubs ?? []).map((r) => {
    const row = r as unknown as {
      id: number;
      member_id: string;
      image_url: string;
      purchase_amount: number;
      payout_amount: number;
      profit: number;
      race_info: string | null;
      race_date: string | null;
      note: string | null;
      status: string;
      review_note: string | null;
      created_at: string;
      members: { name: string } | null;
    };
    return {
      ...row,
      member_name: row.members?.name ?? "(不明)",
    };
  });

  const pending = subs.filter((s) => s.status === "pending");
  const reviewed = subs.filter((s) => s.status !== "pending");

  // 承認済みの合計利益
  const approved = subs.filter((s) => s.status === "approved");
  const totalProfit = approved.reduce((s, r) => s + r.profit, 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">収支スクショ審査</h1>
        <Link
          href="/admin/stages"
          className="text-xs text-gray-500 hover:text-gray-900 underline"
        >
          ← Stage 管理
        </Link>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        Stage: <b>{stage.title ?? stage.name}</b>
      </p>
      <p className="text-xs text-gray-500 mb-6">
        提出 {subs.length} 件 / 未審査 {pending.length} 件 / 承認済み合計利益:{" "}
        <b className={totalProfit >= 0 ? "text-emerald-700" : "text-red-700"}>
          {totalProfit >= 0 ? "+" : ""}
          {totalProfit.toLocaleString()}
        </b>
      </p>

      {/* Pending */}
      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3 text-amber-700">
            未審査 ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((s) => (
              <SubmissionCard key={s.id} sub={s} stageId={id} />
            ))}
          </div>
        </section>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">審査済み ({reviewed.length})</h2>
          <div className="space-y-3">
            {reviewed.map((s) => (
              <SubmissionCard key={s.id} sub={s} stageId={id} compact />
            ))}
          </div>
        </section>
      )}

      {subs.length === 0 && (
        <p className="text-sm text-gray-500">
          この Stage にはまだ収支提出がありません。
        </p>
      )}
    </main>
  );
}

function SubmissionCard({
  sub,
  stageId,
  compact,
}: {
  sub: Sub;
  stageId: string;
  compact?: boolean;
}) {
  const isPending = sub.status === "pending";
  const isApproved = sub.status === "approved";

  return (
    <div
      className={`rounded-2xl border bg-white p-4 ${
        isPending
          ? "border-amber-200"
          : isApproved
          ? "border-emerald-200"
          : "border-red-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        {!compact && (
          <a
            href={sub.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Image
              src={sub.image_url}
              alt="receipt"
              width={200}
              height={150}
              className="rounded-xl border border-gray-200 object-contain max-h-[200px] w-auto"
              unoptimized
            />
          </a>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-foreground">
              {sub.member_name}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                isPending
                  ? "bg-amber-100 text-amber-700"
                  : isApproved
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPending ? "未審査" : isApproved ? "承認" : "却下"}
            </span>
          </div>
          <p className="text-xs text-muted">
            {sub.race_info ?? "(レース情報なし)"}{" "}
            {sub.race_date && `/ ${sub.race_date}`}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span>
              購入: <b>{sub.purchase_amount.toLocaleString()}</b>
            </span>
            <span>
              払戻: <b>{sub.payout_amount.toLocaleString()}</b>
            </span>
            <span
              className={`font-[family-name:var(--font-outfit)] font-bold ${
                sub.profit >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              利益: {sub.profit >= 0 ? "+" : ""}
              {sub.profit.toLocaleString()}
            </span>
          </div>
          {sub.note && (
            <p className="mt-1 text-[10px] text-muted">メモ: {sub.note}</p>
          )}
          {sub.review_note && (
            <p className="mt-1 text-[10px] text-gray-500">
              審査メモ: {sub.review_note}
            </p>
          )}
          <p className="mt-1 text-[10px] text-gray-400">
            {new Date(sub.created_at).toLocaleString("ja-JP")}
          </p>
        </div>

        {/* Actions */}
        {isPending && (
          <div className="shrink-0">
            <SubmissionActions submissionId={sub.id} stageId={stageId} />
          </div>
        )}
      </div>
    </div>
  );
}
