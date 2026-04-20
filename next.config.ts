import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 画像ファイル更新時のキャッシュバスター (?v=...) を許可するため、
    // /members と /hero は任意のクエリ文字列を受け入れる。
    localPatterns: [
      { pathname: "/members/**" },
      { pathname: "/hero/**" },
    ],
  },
  // LAN 越しにスマホ等から dev サーバを覗きに来るときに
  // HMR/チャンクが block されないようにする (dev 時のみ有効)。
  // Next.js の allowedDevOrigins は CIDR 非対応 / exact host or ワイルドカード。
  allowedDevOrigins: [
    "192.168.11.36",
    "localhost",
    "127.0.0.1",
    "100.*.*.*", // Tailscale CGNAT 帯
    "192.168.*.*", // 家庭 LAN 一般帯
  ],
};

export default nextConfig;
