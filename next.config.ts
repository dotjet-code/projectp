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
};

export default nextConfig;
