import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { SubmissionReviewButton } from "./submission-review-button";

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
  venue: string | null;
  broadcast_date: string | null;
  note: string | null;
  status: string;
  created_at: string;
};

type BroadcastGroup = {
  date: string;
  venue: string | null;
  subs: Sub[];
  totalProfit: number;
  raceCount: number;
  pendingCount: number;
};

async function getSubmissions(): Promise<Sub[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("balance_submissions")
    .select(
      "id, member_id, image_url, purchase_amount, payout_amount, profit, race_info, venue, broadcast_date, note, status, created_at, members:member_id (name)"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => {
    const row = r as unknown as Sub & { members: { name: string } | null };
    return { ...row, member_name: row.members?.name ?? "(不明)" };
  });
}

function groupByBroadcast(subs: Sub[]): BroadcastGroup[] {
  const map = new Map<string, BroadcastGroup>();
  for (const s of subs) {
    const key = `${s.broadcast_date ?? "unknown"}_${s.venue ?? ""}`;
    if (!map.has(key)) {
      map.set(key, {
        date: s.broadcast_date ?? "(日付なし)",
        venue: s.venue,
        subs: [],
        totalProfit: 0,
        raceCount: 0,
        pendingCount: 0,
      });
    }
    const g = map.get(key)!;
    g.subs.push(s);
    g.raceCount += 1;
    if (s.status === "approved") g.totalProfit += s.profit;
    if (s.status === "pending") g.pendingCount += 1;
  }
  // 日付降順
  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export default async function AdminSubmissionsPage() {
  const subs = await getSubmissions();
  const groups = groupByBroadcast(subs);
  const pendingTotal = subs.filter((s) => s.status === "pending").length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">配信収支</h1>
        {pendingTotal > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            未審査 {pendingTotal} 件
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-8">
        メンバーから提出された配信ごとの収支スクショを審査します。
      </p>

      {groups.length === 0 ? (
        <p className="text-sm text-gray-500">提出はまだありません。</p>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={`${g.date}_${g.venue}`}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-foreground">
                  {g.date}
                  {g.venue && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {g.venue}
                    </span>
                  )}
                </h2>
                <span className="text-xs text-muted">
                  {g.raceCount} レース
                </span>
                {g.pendingCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    未審査 {g.pendingCount}
                  </span>
                )}
                <span
                  className={`text-xs font-[family-name:var(--font-outfit)] font-bold ${
                    g.totalProfit >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  承認済み計: {g.totalProfit >= 0 ? "+" : ""}
                  {g.totalProfit.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {g.subs.map((s) => {
                  const isPending = s.status === "pending";
                  const isApproved = s.status === "approved";
                  return (
                    <div
                      key={s.id}
                      className={`rounded-2xl border bg-white p-4 ${
                        isPending
                          ? "border-amber-200"
                          : isApproved
                          ? "border-emerald-200"
                          : "border-red-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={s.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <Image
                            src={s.image_url}
                            alt="receipt"
                            width={120}
                            height={90}
                            className="rounded-lg border border-gray-200 object-contain max-h-[120px] w-auto"
                            unoptimized
                          />
                        </a>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-foreground">
                              {s.member_name}
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
                              {isPending
                                ? "未審査"
                                : isApproved
                                ? "承認"
                                : "却下"}
                            </span>
                          </div>
                          <p className="text-xs text-muted">
                            {s.race_info ?? "(レース情報なし)"}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs">
                            <span>
                              購入:{" "}
                              <b>{s.purchase_amount.toLocaleString()}</b>
                            </span>
                            <span>
                              払戻:{" "}
                              <b>{s.payout_amount.toLocaleString()}</b>
                            </span>
                            <span
                              className={`font-[family-name:var(--font-outfit)] font-bold ${
                                s.profit >= 0
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {s.profit >= 0 ? "+" : ""}
                              {s.profit.toLocaleString()}
                            </span>
                          </div>
                          {s.note && (
                            <p className="mt-0.5 text-[10px] text-muted">
                              {s.note}
                            </p>
                          )}
                        </div>

                        {isPending ? (
                          <SubmissionReviewButton submissionId={s.id} mode="review" />
                        ) : (
                          <SubmissionReviewButton submissionId={s.id} mode="revoke" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
