"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { label: "ダッシュボード", href: "/member/dashboard" },
  { label: "収支提出", href: "/member/submissions" },
];

export function MemberNav({ memberName }: { memberName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
