import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-16 pb-10 overflow-hidden">
      {/* Decorative bubbles */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute left-0 top-9 size-11 rounded-full bg-primary" />
        <div className="absolute left-[22%] top-6 size-[73px] rounded-full bg-primary" />
        <div className="absolute left-[44%] top-5 size-[100px] rounded-full bg-primary" />
        <div className="absolute left-[66%] top-0 size-[130px] rounded-full bg-primary" />
        <div className="absolute left-[88%] -top-14 size-[164px] rounded-full bg-primary" />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-blue">
            <span className="font-[family-name:var(--font-outfit)] text-[10px] font-black text-white">P</span>
          </div>
          <span className="font-[family-name:var(--font-outfit)] text-base font-extrabold bg-gradient-to-r from-[#00b8db] to-primary-blue bg-clip-text text-transparent">
            Project P
          </span>
        </div>

        {/* Tagline */}
        <p className="text-sm text-muted text-center">
          12人の現在地を、いま見届けよう。
        </p>

        {/* Links */}
        <div className="mt-2 flex items-center gap-4">
          <Link href="/about" className="text-xs text-muted hover:text-primary-dark transition-colors">
            Project Pとは？
          </Link>
          <span className="text-xs text-gray-300">|</span>
          <Link href="/members" className="text-xs text-muted hover:text-primary-dark transition-colors">
            メンバー
          </Link>
          <span className="text-xs text-gray-300">|</span>
          <Link href="/ranking" className="text-xs text-muted hover:text-primary-dark transition-colors">
            ランキング
          </Link>
        </div>
      </div>
    </footer>
  );
}
