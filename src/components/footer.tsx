import Link from "next/link";

const BOAT_COLORS = [
  "#F5F5F0",
  "#1A1A1A",
  "#D41E28",
  "#1E4BC8",
  "#F2C81B",
  "#0F8F4A",
];

export function Footer() {
  return (
    <footer className="mt-20 bg-[#111111] text-[#F5F1E8]">
      {/* 上端: 破れ紙風ボーダー */}
      <div
        className="w-full h-3 bg-[#D41E28]"
        style={{
          clipPath:
            "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
        }}
        aria-hidden
      />

      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-start">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex size-8 items-center justify-center bg-[#D41E28] text-white text-sm font-black"
                style={{
                  fontFamily: "var(--font-noto-serif), serif",
                  transform: "rotate(-4deg)",
                }}
                aria-hidden
              >
                か
              </span>
              <span
                className="text-2xl font-black text-[#F5F1E8] tracking-tight"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                かけあがり！
              </span>
            </div>
            <p
              className="mt-3 text-xs tracking-[0.25em] text-[#D4A73E]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              KAKEAGARI
            </p>
          </div>

          {/* Tagline + Links */}
          <div>
            <p
              className="text-base md:text-lg font-bold text-[#F5F1E8] leading-relaxed"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              ランナーの現在地を、いま見届けよう。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLink href="/about">かけあがりとは？</FooterLink>
              <FooterDivider />
              <FooterLink href="/members">メンバー</FooterLink>
              <FooterDivider />
              <FooterLink href="/ranking">ランキング</FooterLink>
              <FooterDivider />
              <FooterLink href="/prediction">順位予想</FooterLink>
              <FooterDivider />
              <FooterLink href="/live/vote">ライブ応援</FooterLink>
            </div>
          </div>

          {/* 号艇カラーマーク */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-1" aria-hidden>
              {BOAT_COLORS.map((c, i) => (
                <span
                  key={i}
                  className="block w-3 h-3 border border-[#4A5060]"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 下部: コピーライト帯 */}
        <div className="mt-10 pt-6 border-t border-[#4A5060] flex flex-wrap items-center justify-between gap-3">
          <p
            className="text-[10px] tracking-[0.2em] text-[#9BA8BF]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            © {new Date().getFullYear()} KAKEAGARI ALL RIGHTS RESERVED
          </p>
          <p
            className="text-[10px] tracking-[0.2em] text-[#9BA8BF]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            主役は、勝ち取るもの。
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-xs font-bold text-[#F5F1E8] hover:text-[#D41E28] transition-colors tracking-wide"
    >
      {children}
    </Link>
  );
}

function FooterDivider() {
  return <span className="text-[#4A5060] text-xs">/</span>;
}
