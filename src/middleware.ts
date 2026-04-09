import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * 運営専用エリアのアクセス保護。
 *
 * 保護対象:
 *   /admin/*
 *   /api/admin/*
 *   /api/debug/*
 *
 * 保護しない（公開）:
 *   /api/auth/google/*       … メンバーが YouTube 認可するための入口
 *   /api/batch/snapshot      … Vercel Cron が叩くバッチ（CRON_SECRET で別途認証）
 *   /login                   … 運営ログインフォーム
 *   /api/auth/login,logout   … 運営ログイン/ログアウト Route Handler
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 公開パス
  if (
    pathname.startsWith("/api/auth/google") ||
    pathname === "/api/batch/snapshot" ||
    pathname === "/login" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout")
  ) {
    return NextResponse.next();
  }

  // 保護対象かどうか
  const needsAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/debug");

  if (!needsAuth) {
    return NextResponse.next();
  }

  // Supabase セッションを読み取り
  const res = NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // API なら 401 JSON、ページならログインへリダイレクト
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/debug/:path*",
    "/api/auth/:path*",
    "/login",
  ],
};
