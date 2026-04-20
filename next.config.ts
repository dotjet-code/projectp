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
  allowedDevOrigins: [
    "192.168.0.0/16",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "100.64.0.0/10", // Tailscale CGNAT
    "localhost",
  ],
};

export default nextConfig;
