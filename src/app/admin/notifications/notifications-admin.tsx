"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = { id: string; name: string };

export function NotificationsAdmin({ members }: { members: Member[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"notification" | "schedule">("notification");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("notification")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold ${
            tab === "notification"
              ? "bg-black text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          📢 お知らせ送信
        </button>
        <button
          onClick={() => setTab("schedule")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold ${
            tab === "schedule"
              ? "bg-black text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          📅 スケジュール配信
        </button>
      </div>

      {tab === "notification" ? (
        <NotificationForm members={members} />
      ) : (
        <ScheduleForm members={members} />
      )}
    </div>
  );
}

function NotificationForm({ members }: { members: Member[] }) {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("info");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body: body || null,
          category,
          targetMemberId: target || null,
        }),
      });
      if (!res.ok) throw new Error("送信に失敗しました");
      setResult("送信しました");
      setTitle("");
      setBody("");
      router.refresh();
    } catch {
      setResult("エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            宛先
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">全メンバー</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="info">📢 お知らせ</option>
            <option value="feedback">💬 フィードバック</option>
            <option value="urgent">🚨 重要</option>
          </select>
        </div>
      </div>
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
          placeholder="4月の配信頻度について"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          本文 (任意)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="詳細な内容をここに..."
        />
      </div>
      {result && (
        <p className={`text-xs ${result.includes("エラー") ? "text-red-600" : "text-emerald-700"}`}>
          {result}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !title}
        className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
      >
        {busy ? "送信中..." : "送信"}
      </button>
    </form>
  );
}

function ScheduleForm({ members }: { members: Member[] }) {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("other");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          title,
          eventType,
          eventDate,
          eventTime: eventTime || null,
          notes: notes || null,
          targetMemberId: target || null,
        }),
      });
      if (!res.ok) throw new Error("作成に失敗しました");
      setResult("スケジュールを配信しました");
      setTitle("");
      setEventDate("");
      setEventTime("");
      setNotes("");
      router.refresh();
    } catch {
      setResult("エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            対象
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">全メンバー共通</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            種類
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="stream">🎬 配信</option>
            <option value="live">🎤 ライブ</option>
            <option value="deadline">📸 提出期限</option>
            <option value="meeting">📋 ミーティング</option>
            <option value="other">📅 その他</option>
          </select>
        </div>
      </div>
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
      {result && (
        <p className={`text-xs ${result.includes("エラー") ? "text-red-600" : "text-emerald-700"}`}>
          {result}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !title || !eventDate}
        className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
      >
        {busy ? "作成中..." : "配信"}
      </button>
    </form>
  );
}
