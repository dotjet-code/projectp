/**
 * サイトのベース URL を取得するユーティリティ。
 *
 * 優先順位:
 *   1. NEXT_PUBLIC_SITE_URL (本番用に明示設定した独自ドメイン)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (Vercel が production deployment に自動注入)
 *   3. VERCEL_URL (Vercel のプレビューデプロイ URL、自動注入)
 *   4. 開発フォールバック (http://localhost:3000)
 *
 * Client と Server の両方で使える形で export する。
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodHost) return `https://${prodHost}`;

  const previewHost = process.env.VERCEL_URL;
  if (previewHost) return `https://${previewHost}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
