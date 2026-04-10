import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";

export default async function SubmitBalancePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const supabase = createAdminClient();

  const { data: member } = await supabase
    .from("members")
    .select("id, name")
    .eq("id", memberId)
    .eq("is_active", true)
    .maybeSingle();
  if (!member) notFound();

  // 過去の提出履歴（直近10件）
  const { data: history } = await supabase
    .from("balance_submissions")
    .select("id, purchase_amount, payout_amount, profit, race_info, status, created_at")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      <Header />
      <main className="pb-10">
        <section className="pt-10 pb-6 text-center">
          <p className="text-4xl mb-2">💰</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            収支スクショ提出
          </h1>
          <p className="mt-2 text-sm text-muted">
            {member.name} さんの収支を報告します
          </p>
        </section>

        <SubmitForm memberId={member.id} memberName={member.name} />

        {/* 提出履歴 */}
        {(history ?? []).length > 0 && (
          <section className="mx-auto max-w-[720px] px-4 mt-10">
            <h2 className="text-sm font-bold text-gray-700 mb-3">
              提出履歴（直近10件）
            </h2>
            <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {(history ?? []).map((h) => {
                const row = h as {
                  id: number;
                  purchase_amount: number;
                  payout_amount: number;
                  profit: number;
                  race_info: string | null;
                  status: string;
                  created_at: string;
                };
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between px-4 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {row.race_info || "(レース情報なし)"}
                      </p>
                      <p className="text-[10px] text-muted">
                        購入 {row.purchase_amount.toLocaleString()} → 払戻{" "}
                        {row.payout_amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-[family-name:var(--font-outfit)] font-bold ${
                          row.profit >= 0 ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {row.profit >= 0 ? "+" : ""}
                        {row.profit.toLocaleString()}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                          row.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : row.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.status === "approved"
                          ? "承認"
                          : row.status === "rejected"
                          ? "却下"
                          : "審査中"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
