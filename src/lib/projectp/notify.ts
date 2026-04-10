/**
 * Discord Webhook 通知ヘルパー。
 * DISCORD_WEBHOOK_URL が未設定の環境ではただログを出すだけ。
 */
export async function notifyDiscord(text: string): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.log("[notify:noop]", text);
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
  } catch (e) {
    console.error("[notify:error]", e);
  }
}
