import { google, youtube_v3, youtubeAnalytics_v2 } from "googleapis";
import { createOAuthClient } from "./oauth";

/**
 * 保存済み refresh_token から OAuth2 クライアントを生成。
 * googleapis ライブラリが access_token を必要に応じて自動更新してくれる。
 */
export function getAuthorizedClient(refreshToken: string) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export function getYoutubeDataClient(refreshToken: string): youtube_v3.Youtube {
  return google.youtube({ version: "v3", auth: getAuthorizedClient(refreshToken) });
}

export function getYoutubeAnalyticsClient(
  refreshToken: string
): youtubeAnalytics_v2.Youtubeanalytics {
  return google.youtubeAnalytics({
    version: "v2",
    auth: getAuthorizedClient(refreshToken),
  });
}
