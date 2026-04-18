import type { Metadata } from "next";
import { Outfit, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./animations.css";
import { LiveStatusProvider } from "@/lib/projectp/live-status-client";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://projectp-six.vercel.app"),
  title: {
    default: "かけあがり",
    template: "%s | かけあがり",
  },
  description:
    "主役はまだ空席。12人が数字で競い、勝ち上がるのは誰だ。かけあがりは、次のステージに立つ6人を決める競争型エンタメプロジェクト。",
  openGraph: {
    title: "かけあがり",
    description: "主役はまだ空席。12人が数字で競い、勝ち上がるのは誰だ。",
    url: "https://projectp-six.vercel.app",
    siteName: "かけあがり",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "かけあがり",
    description: "主役はまだ空席。12人が数字で競い、勝ち上がるのは誰だ。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${outfit.variable} ${notoSansJP.variable} ${notoSerifJP.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden">
        <LiveStatusProvider>{children}</LiveStatusProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
