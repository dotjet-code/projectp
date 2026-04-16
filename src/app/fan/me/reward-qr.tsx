"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * 景品コードの QR コード表示。
 * QR にはコード文字列のみ埋め込み(URL ではない)。
 * スタッフはスキャナで読み取ってスタッフ消込ページに入力する。
 */
export function RewardQR({ rewardCode }: { rewardCode: string }) {
  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <div className="rounded-xl bg-white p-3 shadow-sm border border-gray-200">
        <QRCodeSVG
          value={rewardCode}
          size={160}
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-[9px] text-muted text-center">
        会場スタッフにこの QR コードを見せてください
      </p>
    </div>
  );
}
