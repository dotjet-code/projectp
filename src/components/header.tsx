"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "トップ", href: "/" },
  { label: "メンバー", href: "/members" },
  { label: "順位予想", href: "/prediction" },
  { label: "ランキング", href: "/ranking" },
  { label: "ライブ応援", href: "/live/vote" },
  { label: "結果発表", href: "/results" },
  { label: "管理", href: "/admin" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2.5 backdrop-blur-md bg-white/70">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-blue">
          <span className="font-[family-name:var(--font-outfit)] text-[10px] font-black text-white">P</span>
        </div>
        <span
          className="font-[family-name:var(--font-outfit)] text-base font-extrabold bg-gradient-to-r from-[#00b8db] to-primary-blue bg-clip-text text-transparent"
        >
          Project P
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] text-primary-dark font-bold shadow-sm"
                  : "text-muted hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
