import Link from "next/link";
import { notFound } from "next/navigation";
import { getLiveEvent, getEventCodes, getEventTally } from "@/lib/projectp/live-event";
import { EventActions } from "./event-actions";
import { CopyInput } from "../../members/[id]/copy-input";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getLiveEvent(id);
  if (!event) notFound();

  const [codes, tally] = await Promise.all([
    getEventCodes(id),
    getEventTally(id),
  ]);

  const totalCodes = codes.length;
  const activatedCodes = codes.filter((c) => c.activatedAt).length;
  const totalVotes = codes.reduce((s, c) => s + c.ticketsUsed, 0);
  const totalTickets = codes.reduce((s, c) => s + c.ticketsTotal, 0);

  // 投票ページURL
  const voteUrl = `https://projectp-six.vercel.app/event/${event.id}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <Link
          href="/admin/events"
          className="text-xs text-gray-500 hover:text-gray-900 underline"
        >
          ← イベント一覧
        </Link>
      </div>
      <p className="text-xs text-gray-500 mb-6">
        {event.eventDate}
        {event.venue && ` · ${event.venue}`}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-muted">ステータス</p>
          <p
            className={`mt-1 text-lg font-black font-[family-name:var(--font-outfit)] ${
              event.status === "open"
                ? "text-emerald-700"
                : event.status === "closed"
                ? "text-gray-700"
                : "text-amber-700"
            }`}
          >
            {event.status.toUpperCase()}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-muted">コード数</p>
          <p className="mt-1 text-lg font-black font-[family-name:var(--font-outfit)] text-foreground">
            {totalCodes}
          </p>
          <p className="text-[10px] text-muted">使用 {activatedCodes}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-muted">投票数</p>
          <p className="mt-1 text-lg font-black font-[family-name:var(--font-outfit)] text-foreground">
            {totalVotes}
          </p>
          <p className="text-[10px] text-muted">/ {totalTickets} チケット</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-muted">チケット/人</p>
          <p className="mt-1 text-lg font-black font-[family-name:var(--font-outfit)] text-foreground">
            {event.defaultTickets}
          </p>
        </div>
      </div>

      {/* Actions */}
      <EventActions eventId={event.id} currentStatus={event.status} totalCodes={totalCodes} />

      {/* Vote URL */}
      <section className="mb-8 mt-6">
        <h2 className="text-sm font-bold text-gray-700 mb-2">投票ページ URL</h2>
        <CopyInput value={voteUrl} />
        <p className="mt-1 text-[10px] text-muted">
          このURLからQRコードを作成してください。来場者はここにアクセスして投票します。
        </p>
      </section>

      {/* Tally */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">投票集計</h2>
        {tally.length === 0 ? (
          <p className="text-xs text-gray-500">まだ投票がありません。</p>
        ) : (
          <ul className="space-y-2">
            {tally.map((t, i) => {
              const maxV = Math.max(...tally.map((x) => x.votes), 1);
              const pct = (t.votes / maxV) * 100;
              return (
                <li
                  key={t.memberId}
                  className="rounded-2xl border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-[family-name:var(--font-outfit)] text-sm font-extrabold text-[#e7000b]">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {t.memberName}
                      </p>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-live to-[#fb64b6] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground w-12 text-right">
                      {t.votes}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Codes (collapsible summary) */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          コード一覧（{totalCodes} 件）
        </h2>
        {totalCodes === 0 ? (
          <p className="text-xs text-gray-500">
            コードが未生成です。上の「コード生成」ボタンで作成してください。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-left font-bold text-muted">
                    コード
                  </th>
                  <th className="px-3 py-2 text-right font-bold text-muted">
                    使用
                  </th>
                  <th className="px-3 py-2 text-right font-bold text-muted">
                    状態
                  </th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-3 py-1.5 font-mono font-bold text-foreground">
                      {c.code}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {c.ticketsUsed}/{c.ticketsTotal}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {c.activatedAt ? (
                        <span className="text-emerald-700">使用済み</span>
                      ) : (
                        <span className="text-gray-400">未使用</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
