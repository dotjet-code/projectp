import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

/**
 * /api/og/chinchiro?hand=pinzoro&value=100&name=ねこみ&d1=1&d2=1&d3=1
 *
 * X シェア用の 1200x630 OG 画像を動的生成する。
 * 推しの名前 + 役名 + 出目 + 票数 + "#かけあがりの賽" を印字。
 */
export const runtime = "edge";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const HAND_DISPLAY: Record<string, { label: string; bg: string; fg: string }> = {
  pinzoro: { label: "ピンゾロ", bg: "#FFE600", fg: "#111111" },
  zorome:  { label: "ゾロ目",   bg: "#D41E28", fg: "#FFFFFF" },
  shigoro: { label: "シゴロ",   bg: "#1CB4AF", fg: "#FFFFFF" },
  normal:  { label: "",         bg: "#F5F1E8", fg: "#111111" },
  hifumi:  { label: "ヒフミ",   bg: "#4A5060", fg: "#F5F1E8" },
  menashi: { label: "目なし",   bg: "#4A5060", fg: "#F5F1E8" },
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const hand = url.searchParams.get("hand") ?? "normal";
  const value = Number(url.searchParams.get("value") ?? "1");
  const name = (url.searchParams.get("name") ?? "").slice(0, 20) || "推し";
  const d1 = Number(url.searchParams.get("d1") ?? "1");
  const d2 = Number(url.searchParams.get("d2") ?? "1");
  const d3 = Number(url.searchParams.get("d3") ?? "1");

  const style = HAND_DISPLAY[hand] ?? HAND_DISPLAY.normal;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F5F1E8",
          padding: "40px 60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top ribbon */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.3em",
              color: "#D41E28",
            }}
          >
            DAILY ROLL
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#111111",
            }}
          >
            今日の賽
          </div>
        </div>

        {/* Body: dice + info */}
        <div
          style={{
            display: "flex",
            flex: 1,
            marginTop: "30px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Dice */}
          <div style={{ display: "flex", gap: "24px" }}>
            {[d1, d2, d3].map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "160px",
                  height: "160px",
                  backgroundColor: "#FFFFFF",
                  border: "4px solid #111111",
                  borderRadius: "14px",
                  fontSize: 140,
                  color: "#111",
                  boxShadow: "8px 8px 0 rgba(17,17,17,0.22)",
                }}
              >
                {DICE_FACES[Math.max(0, Math.min(5, d - 1))]}
              </div>
            ))}
          </div>

          {/* Hand + value */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 28px",
                backgroundColor: style.bg,
                color: style.fg,
                fontSize: 48,
                fontWeight: 900,
              }}
            >
              {style.label || "出た!"}
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "baseline",
                color: "#111",
              }}
            >
              <span style={{ fontSize: 160, fontWeight: 900, lineHeight: 1 }}>
                {value}
              </span>
              <span style={{ fontSize: 48, fontWeight: 900, marginLeft: 8 }}>
                票
              </span>
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: 36,
                fontWeight: 900,
                color: "#D41E28",
              }}
            >
              {name} に捧ぐ
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            fontSize: 22,
            fontWeight: 900,
            color: "#4A5060",
          }}
        >
          <span>#かけあがりの賽</span>
          <span>kakeagari</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
