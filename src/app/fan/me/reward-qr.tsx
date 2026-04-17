"use client";

import { QRCodeCanvas } from "qrcode.react";

/**
 * 景品コードの QR コード表示。
 * QR にはコード文字列のみ埋め込み(URL ではない)。
 * スタッフはスキャナで読み取ってスタッフ消込ページに入力する。
 *
 * Canvas で描画しているのは、ブラウザの強制ダークモードや Dark Reader 系拡張が
 * SVG の白背景を灰色に再配色して QR が読めなくなるのを防ぐため。
 */
export function RewardQR({ rewardCode }: { rewardCode: string }) {
  return (
    <div
      className="mt-3 flex flex-col items-center gap-2"
      style={{ colorScheme: "light", forcedColorAdjust: "none" }}
    >
      <div className="rounded-xl bg-white p-3 shadow-sm border border-gray-200">
        <QRCodeCanvas
          value={rewardCode}
          size={160}
          level="M"
          includeMargin={true}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>
      <p className="text-[9px] text-muted text-center">
        会場スタッフにこの QR コードを見せてください
      </p>
    </div>
  );
}
