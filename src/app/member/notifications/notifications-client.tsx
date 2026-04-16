"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: number;
  title: string;
  body: string | null;
  category: "info" | "feedback" | "urgent";
  isGlobal: boolean;
  isRead: boolean;
  createdAt: string;
};

const CATEGORY_STYLES: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  feedback: "bg-amber-50 border-amber-200 text-amber-900",
  urgent: "bg-red-50 border-red-200 text-red-900",
};

const CATEGORY_LABELS: Record<string, string> = {
  info: "📢 お知らせ",
  feedback: "💬 フィードバック",
  urgent: "🚨 重要",
};

export function NotificationsClient({
  notifications,
}: {
  notifications: Notification[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function markAllRead() {
    setBusy(true);
    await fetch("/api/member/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    router.refresh();
    setBusy(false);
  }

  async function markRead(id: number) {
    await fetch("/api/member/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            未読 <b>{unreadCount}</b> 件
          </p>
          <button
            onClick={markAllRead}
            disabled={busy}
            className="text-[10px] text-primary-dark font-bold underline disabled:opacity-40"
          >
            すべて既読にする
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm text-muted">お知らせはまだありません</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                n.isRead
                  ? "bg-white border-gray-200 opacity-70"
                  : CATEGORY_STYLES[n.category] ?? CATEGORY_STYLES.info
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold">
                      {CATEGORY_LABELS[n.category] ?? "📢 お知らせ"}
                    </span>
                    {!n.isRead && (
                      <span className="size-2 rounded-full bg-red-500 shrink-0" />
                    )}
                    {n.isGlobal && (
                      <span className="text-[9px] text-muted">全体</span>
                    )}
                  </div>
                  <p className="text-sm font-bold">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 text-xs text-muted whitespace-pre-wrap">
                      {n.body}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-muted shrink-0">
                  {new Date(n.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
