"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * 景品コードの QR コード表示。
 * QR には admin 消込 URL を埋め込む。スタッフがスマホで読むと即消込ページへ。
 */
export function RewardQR({
  rewardCode,
  baseUrl,
}: {
  rewardCode: string;
  baseUrl: string;
}) {
  const scanUrl = `${baseUrl}/admin/rewards/scan?code=${rewardCode}`;

  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <div className="rounded-xl bg-white p-3 shadow-sm border border-gray-200">
        <QRCodeSVG
          value={scanUrl}
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
