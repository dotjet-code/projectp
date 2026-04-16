"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const items = [
  { label: "ステージ", href: "/admin/stages" },
  { label: "メンバー", href: "/admin/connect" },
  { label: "配信収支", href: "/admin/submissions" },
  { label: "ポイント", href: "/admin/stats" },
  { label: "景品", href: "/admin/rewards" },
  { label: "イベント", href: "/admin/events" },
  { label: "ファン", href: "/admin/fans" },
  { label: "お知らせ", href: "/admin/notifications" },
  { label: "不正検知", href: "/admin/anomalies" },
  { label: "設定", href: "/admin/settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center gap-2">
      <nav className="flex items-center gap-1 overflow-x-auto rounded-full border border-gray-200 bg-white p-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                active
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="self-end">
        <LogoutButton />
      </div>
    </div>
  );
}
