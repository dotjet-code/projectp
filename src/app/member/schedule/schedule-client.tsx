"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EventType = "stream" | "live" | "deadline" | "meeting" | "other";

type ScheduleEntry = {
  id: number;
  title: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string | null;
  notes: string | null;
  isGlobal: boolean;
};

const TYPE_LABELS: Record<EventType, string> = {
  stream: "🎬 配信",
  live: "🎤 ライブ",
  deadline: "📸 提出期限",
  meeting: "📋 ミーティング",
  other: "📅 その他",
};

const TYPE_COLORS: Record<EventType, string> = {
  stream: "border-blue-200 bg-blue-50",
  live: "border-pink-200 bg-pink-50",
  deadline: "border-amber-200 bg-amber-50",
  meeting: "border-gray-200 bg-gray-50",
  other: "border-gray-200 bg-white",
};

export function ScheduleClient({
  schedule,
}: {
  schedule: ScheduleEntry[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("stream");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/member/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          eventType,
          eventDate,
          eventTime: eventTime || null,
          notes: notes || null,
        }),
      });
      setTitle("");
      setEventDate("");
      setEventTime("");
      setNotes("");
      setShowForm(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: number) {
    await fetch(`/api/member/schedule?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  // 日付ごとにグループ化
  const grouped = new Map<string, ScheduleEntry[]>();
  for (const s of schedule) {
    const arr = grouped.get(s.eventDate) ?? [];
    arr.push(s);
    grouped.set(s.eventDate, arr);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">今後の予定</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white"
        >
          {showForm ? "閉じる" : "+ 予定を追加"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onAdd}
          className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                タイトル *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                種類
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {(Object.keys(TYPE_LABELS) as EventType[]).map((k) => (
                  <option key={k} value={k}>
                    {TYPE_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                日付 *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                時間 (任意)
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {busy ? "追加中..." : "追加"}
          </button>
        </form>
      )}

      {schedule.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm text-muted">今後の予定はありません</p>
        </div>
      ) : (
        [...grouped.entries()].map(([date, entries]) => (
          <div key={date}>
            <p className="text-xs font-bold text-muted mb-2">
              {new Date(date + "T00:00:00").toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </p>
            <ul className="space-y-2">
              {entries.map((s) => (
                <li
                  key={s.id}
                  className={`rounded-xl border p-3 ${TYPE_COLORS[s.eventType]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold">
                          {TYPE_LABELS[s.eventType]}
                        </span>
                        {s.eventTime && (
                          <span className="text-[10px] text-muted">
                            {s.eventTime.slice(0, 5)}
                          </span>
                        )}
                        {s.isGlobal && (
                          <span className="text-[9px] text-muted">
                            運営配信
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold">{s.title}</p>
                      {s.notes && (
                        <p className="mt-1 text-[10px] text-muted">
                          {s.notes}
                        </p>
                      )}
                    </div>
                    {!s.isGlobal && (
                      <button
                        onClick={() => onDelete(s.id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
