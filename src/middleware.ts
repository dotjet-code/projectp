import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * アクセス保護。
 *
 * /admin/*      → role='admin' 必須
 * /member/*     → role='member' 必須
 * /api/admin/*  → role='admin' 必須
 * /api/member/* → role='member' 必須
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 公開パス(認証不要)
  if (
    pathname.startsWith("/api/auth/google") ||
    pathname.startsWith("/api/auth/fan") ||
    pathname.startsWith("/api/auth/member") ||
    pathname === "/api/batch/snapshot" ||
    pathname === "/api/batch/cleanup" ||
    pathname === "/login" ||
    pathname === "/member/login" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout")
  ) {
    return NextResponse.next();
  }

  // 保護対象の判定
  const isAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/debug");
  const isMember =
    pathname.startsWith("/member") || pathname.startsWith("/api/member");

  if (!isAdmin && !isMember) {
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
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    // ページなら該当ログイン画面へリダイレクト
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = isMember ? "/member/login" : "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role =
    (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;

  // admin エリア → admin ロール必須
  if (isAdmin && role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  // member エリア → member ロール必須 (admin もアクセス可)
  if (isMember && role !== "member" && role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/debug/:path*",
    "/api/auth/:path*",
    "/member/:path*",
    "/api/member/:path*",
    "/login",
  ],
};
