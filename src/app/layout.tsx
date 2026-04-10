import type { Metadata } from "next";
import { Outfit, Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./animations.css";
import { LiveStatusProvider } from "@/lib/projectp/live-status-client";
import { OshiProvider } from "@/lib/projectp/oshi-context";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://projectp-six.vercel.app"),
  title: {
    default: "Project P",
    template: "%s | Project P",
  },
  description:
    "12人が数字で競い、主役の座を勝ち取る。Project P は、かけっこ！のメインメンバー6名を決める競争型エンタメプロジェクトです。",
  openGraph: {
    title: "Project P",
    description:
      "12人が数字で競い、主役の座を勝ち取る競争型エンタメプロジェクト。",
    url: "https://projectp-six.vercel.app",
    siteName: "Project P",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project P",
    description:
      "12人が数字で競い、主役の座を勝ち取る競争型エンタメプロジェクト。",
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
    <html lang="ja" className={`${outfit.variable} ${notoSansJP.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden">
        <OshiProvider>
          <LiveStatusProvider>{children}</LiveStatusProvider>
        </OshiProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
