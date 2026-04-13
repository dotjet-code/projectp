"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function FanAuthLink({ onNavigate }: { onNavigate?: () => void }) {
  const [state, setState] = useState<"loading" | "out" | "in">("loading");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/fan/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setState(j.loggedIn ? "in" : "out");
      })
      .catch(() => !cancelled && setState("out"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") return null;
  if (state === "in") {
    return (
      <Link
        href="/fan/me"
        onClick={onNavigate}
        className="rounded-full bg-gradient-to-r from-primary to-primary-blue px-4 py-1.5 text-xs font-bold text-white shadow-sm"
      >
        🎟️ マイページ
      </Link>
    );
  }
  return (
    <Link
      href="/fan/login"
      onClick={onNavigate}
      className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
    >
      会員ログイン
    </Link>
  );
}
const navItems = [
  { label: "トップ", href: "/" },
  { label: "メンバー", href: "/members" },
  { label: "順位予想", href: "/prediction" },
  { label: "ランキング", href: "/ranking" },
  { label: "ライブ応援", href: "/live/vote" },
  { label: "結果発表", href: "/results" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-blue">
            <span className="font-[family-name:var(--font-outfit)] text-[10px] font-black text-white">P</span>
          </div>
          <span className="font-[family-name:var(--font-outfit)] text-base font-extrabold bg-gradient-to-r from-[#00b8db] to-primary-blue bg-clip-text text-transparent">
            Project P
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
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
          <div className="ml-2">
            <FanAuthLink />
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex size-10 items-center justify-center rounded-xl text-muted hover:bg-gray-50 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] text-primary-dark font-bold"
                    : "text-muted hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-1 border-t border-gray-100">
            <FanAuthLink onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      )}
    </header>
  );
}
