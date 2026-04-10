/**
 * Claude Haiku でボートレースの的中画面スクショから金額を抽出する。
 *
 * 環境変数: ANTHROPIC_API_KEY
 */

export type ReceiptOcrResult = {
  purchase: number;  // 購入金額
  payout: number;    // 払戻金額
  profit: number;    // 利益 = payout - purchase
  raceInfo: string;  // "三国2R 3連単 1-2-3" 等
  raceDate: string;  // "8月2日" 等
  confidence: "high" | "medium" | "low";
  raw: unknown;
};

export async function analyzeReceiptImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<ReceiptOcrResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `この画像はボートレースの的中結果（または購入明細）のスクリーンショットです。
以下の情報を JSON で抽出してください。金額は数値（円単位、カンマなし）で返してください。

{
  "purchase": 購入金額（円）,
  "payout": 払戻金額（円）,
  "race_info": "場名 + レース番号 + 勝式 + 組番" (例: "三国2R 3連単 1-2-3"),
  "race_date": "日付" (例: "8月2日"),
  "confidence": "high" | "medium" | "low"
}

的中していない場合（ハズレ）は payout を 0 にしてください。
払戻金額が見つからない場合も 0 にしてください。
JSON のみを返してください。説明は不要です。`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const text =
    data.content?.[0]?.type === "text" ? data.content[0].text : "";

  // JSON を抽出（マークダウンコードブロックの可能性も考慮）
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    purchase?: number;
    payout?: number;
    race_info?: string;
    race_date?: string;
    confidence?: string;
  };

  const purchase = Number(parsed.purchase) || 0;
  const payout = Number(parsed.payout) || 0;

  return {
    purchase,
    payout,
    profit: payout - purchase,
    raceInfo: parsed.race_info ?? "",
    raceDate: parsed.race_date ?? "",
    confidence:
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "medium",
    raw: data,
  };
}
