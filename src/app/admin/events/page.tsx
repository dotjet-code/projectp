import Link from "next/link";
import { listLiveEvents } from "@/lib/projectp/live-event";
import { CreateEventForm } from "./create-event-form";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await listLiveEvents();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">ライブイベント管理</h1>
      <p className="text-sm text-gray-600 mb-8">
        会場での投票用イベントを作成・管理します。
      </p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">イベント作成</h2>
        <CreateEventForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">イベント一覧</h2>
        {events.length === 0 ? (
          <p className="text-xs text-gray-500">イベントがまだありません。</p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/admin/events/${ev.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">{ev.title}</p>
                    <p className="text-xs text-muted">
                      {ev.eventDate}
                      {ev.venue && ` · ${ev.venue}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
                      ev.status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : ev.status === "closed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
