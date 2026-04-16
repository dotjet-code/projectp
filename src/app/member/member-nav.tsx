"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const items = [
  { label: "ダッシュボード", href: "/member/dashboard" },
  { label: "分析", href: "/member/performance" },
  { label: "ファンの声", href: "/member/fans" },
  { label: "収支提出", href: "/member/submissions" },
  { label: "お知らせ", href: "/member/notifications" },
  { label: "スケジュール", href: "/member/schedule" },
];

export function MemberNav({ memberName }: { memberName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/member/notifications")
      .then((r) => r.json())
      .then((j) => {
        const unread = ((j.notifications ?? []) as { isRead: boolean }[]).filter(
          (n) => !n.isRead
        ).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, [pathname]);

  async function onLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/fan/logout", { method: "POST" });
    router.push("/member/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        {memberName && (
          <span className="text-sm font-bold text-foreground">{memberName}</span>
        )}
        <nav className="flex items-center gap-1 overflow-x-auto rounded-full border border-gray-200 bg-white p-1">
          {items.map((it) => {
            const active = pathname.startsWith(it.href);
            const badge =
              it.href === "/member/notifications" && unreadCount > 0;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {it.label}
                {badge && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold border border-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          {loggingOut ? "..." : "ログアウト"}
        </button>
      </div>
    </div>
  );
}
