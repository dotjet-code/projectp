import { google } from "googleapis";

/**
 * Project P が使うスコープ。
 * - youtube.readonly: Data API v3（チャンネル / 動画 / ライブ情報）
 * - yt-analytics.readonly: Analytics API（ライブ視聴の正確な値）
 */
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export function createOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Google OAuth env vars: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI"
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * 認可 URL を生成。
 * - access_type=offline で refresh_token を取得
 * - prompt=consent で毎回 refresh_token を発行させる（再認可時も確実に取得）
 */
export function buildAuthUrl(state: string) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state,
    include_granted_scopes: true,
  });
}
