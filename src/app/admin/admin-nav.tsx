import Link from "next/link";
import { LogoutButton } from "./logout-button";

/**
 * 管理画面共通ヘッダー。各 /admin ページの上部に置く。
 * 現状ページは active ハイライト付きで表示する。
 */
type NavKey = "stages" | "connect" | "submissions" | "stats" | "settings";

const items: { key: NavKey; label: string; href: string }[] = [
  { key: "stages", label: "Stage", href: "/admin/stages" },
  { key: "connect", label: "メンバー", href: "/admin/connect" },
  { key: "submissions", label: "配信収支", href: "/admin/submissions" },
  { key: "stats", label: "ポイント", href: "/admin/stats" },
  { key: "settings", label: "設定", href: "/admin/settings" },
];

export function AdminNav({ current }: { current: NavKey }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <nav className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
        {items.map((it) => {
          const active = it.key === current;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
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
      <LogoutButton />
    </div>
  );
}
