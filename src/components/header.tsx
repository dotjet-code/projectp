"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function FanAuthLink({ onNavigate }: { onNavigate?: () => void }) {
  const [state, setState] = useState<"loading" | "out" | "in">("loading");
  const [unredeemed, setUnredeemed] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/fan/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setState(j.loggedIn ? "in" : "out");
        setUnredeemed(j.unredeemedRewards ?? 0);
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
        className="relative inline-flex items-center gap-1 bg-[#D41E28] text-white px-3 py-1.5 text-xs font-black"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        マイページ
        {unredeemed > 0 && (
          <span
            className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#FFE600] text-[#111] text-[10px] font-black border border-[#111]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {unredeemed}
          </span>
        )}
      </Link>
    );
  }
  return (
    <Link
      href="/fan/login"
      onClick={onNavigate}
      className="inline-flex items-center border border-[#111] bg-[#F5F1E8] text-[#111] px-3 py-1.5 text-xs font-black hover:bg-[#111] hover:text-[#F5F1E8] transition-colors"
      style={{ fontFamily: "var(--font-noto-serif), serif" }}
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
  { label: "予想王", href: "/ranking/predictors" },
  { label: "ライブ応援", href: "/live/vote" },
  { label: "結果発表", href: "/results" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/ranking") return pathname === "/ranking";
  return pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F5F1E8] border-b border-[#111]">
      <div className="flex items-center justify-between px-4 py-3 max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex size-7 items-center justify-center bg-[#D41E28] text-white text-xs font-black"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              transform: "rotate(-4deg)",
            }}
            aria-hidden
          >
            か
          </span>
          <span
            className="text-lg font-black text-[#111] tracking-tight"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            かけあがり
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-black tracking-wide transition-colors ${
                  isActive
                    ? "text-[#D41E28]"
                    : "text-[#111] hover:text-[#D41E28]"
                }`}
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute left-2 right-2 bottom-0 h-[3px] bg-[#D41E28]"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
          <div className="ml-3">
            <FanAuthLink />
          </div>
        </nav>

        {/* Mobile hamburger (WCAG: 最低 44×44 のタップ領域) */}
        <button
          className="md:hidden flex size-11 items-center justify-center text-[#111] border border-[#111]"
          onClick={() => setOpen(!open)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
        >
          {open ? (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-[#111] bg-[#F5F1E8] px-4 py-3 flex flex-col">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between border-b border-[#D5CFC0] px-2 py-3 text-base font-black transition-colors ${
                  isActive
                    ? "text-[#D41E28]"
                    : "text-[#111] hover:text-[#D41E28]"
                }`}
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="text-[#D41E28]" aria-hidden>
                    →
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-4">
            <FanAuthLink onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      )}
    </header>
  );
}
