import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  getMemberIdByAuthUser,
  getMemberSubmissions,
} from "@/lib/projectp/member-dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "収支提出" };

export default async function MemberSubmissionsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/member/login");

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) {
    return (
      <main className="mx-auto max-w-[800px] px-6 py-12 text-center">
        <p className="text-sm text-muted">メンバー情報が見つかりません。</p>
      </main>
    );
  }

  const submissions = await getMemberSubmissions(memberId);

  const statusLabel = (s: string) =>
    s === "approved" ? "承認" : s === "rejected" ? "却下" : "審査中";
  const statusColor = (s: string) =>
    s === "approved"
      ? "bg-emerald-50 text-emerald-700"
      : s === "rejected"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <main className="mx-auto max-w-[800px] px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">収支提出</h1>
        <a
          href={`/submit/${memberId}`}
          className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white"
        >
          + 新規提出
        </a>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-3xl mb-2">📸</p>
          <p className="text-sm text-muted">
            まだ収支を提出していません。「新規提出」から始めましょう。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl bg-white border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor(
                        s.status
                      )}`}
                    >
                      {statusLabel(s.status)}
                    </span>
                    {s.periodName && (
                      <span className="text-[10px] text-muted">
                        {s.periodName}
                      </span>
                    )}
                    {s.broadcastDate && (
                      <span className="text-[10px] text-muted">
                        {s.broadcastDate}
                      </span>
                    )}
                    {s.venue && (
                      <span className="text-[10px] text-muted">
                        @ {s.venue}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-3 text-sm">
                    <span>
                      購入:{" "}
                      <b className="text-foreground">
                        ¥{s.purchaseAmount.toLocaleString()}
                      </b>
                    </span>
                    <span>
                      払戻:{" "}
                      <b className="text-foreground">
                        ¥{s.payoutAmount.toLocaleString()}
                      </b>
                    </span>
                    <span>
                      利益:{" "}
                      <b
                        className={
                          s.profit >= 0 ? "text-emerald-700" : "text-red-600"
                        }
                      >
                        ¥{s.profit.toLocaleString()}
                      </b>
                    </span>
                  </div>
                  {s.reviewNote && s.status === "rejected" && (
                    <p className="mt-1 text-[10px] text-red-600">
                      運営メモ: {s.reviewNote}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-muted shrink-0">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
