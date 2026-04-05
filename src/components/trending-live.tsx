import Image from "next/image";
import Link from "next/link";
import { members } from "@/lib/data";

export function TrendingLive() {
  const trending = members.filter((m) => m.isTrending);
  const live = members.filter((m) => m.isLive);

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-12">
      <div className="grid grid-cols-2 gap-8">
        {/* Trending */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-trending to-[#00d5be]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#007a55] tracking-tight">
              🚀 急上昇
            </h2>
          </div>

          <div className="flex flex-col gap-2.5">
            {trending.map((member) => (
              <Link
                href={`/members/${member.slug}`}
                key={member.id}
                className="flex items-center gap-3 rounded-2xl border border-[rgba(208,250,229,0.5)] bg-gradient-to-r from-[rgba(236,253,245,0.8)] to-[rgba(240,253,250,0.8)] px-4 py-3 hover:shadow-md transition-shadow"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-[#d0fae5]">
                  <svg className="size-5 text-[#00d492]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <Image src={member.avatarUrl} alt={member.name} width={36} height={36} className="size-9 rounded-full object-cover object-top shadow-sm" />
                <span className="flex-1 text-sm font-bold text-foreground">{member.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                    member.role === "PLAYER"
                      ? "bg-gradient-to-r from-player to-player-end shadow-[0_1px_3px_#bedbff]"
                      : "bg-gradient-to-r from-pit to-pit-end shadow-[0_1px_3px_#fee685]"
                  }`}
                >
                  {member.role}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Members */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-live to-[#fb64b6]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#e7000b] tracking-tight">
              📡 配信中メンバー
            </h2>
          </div>

          <div className="flex flex-col gap-2.5">
            {live.map((member) => (
              <Link
                href={`/members/${member.slug}`}
                key={member.id}
                className="flex items-center gap-3 rounded-2xl border border-[rgba(255,226,226,0.5)] bg-gradient-to-r from-[rgba(254,242,242,0.8)] to-[rgba(253,242,248,0.8)] px-4 py-3 hover:shadow-md transition-shadow"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-[#ffe2e2]">
                  <span className="size-2.5 rounded-full bg-live animate-pulse" />
                </div>
                <Image src={member.avatarUrl} alt={member.name} width={36} height={36} className="size-9 rounded-full object-cover object-top shadow-sm" />
                <span className="flex-1 text-sm font-bold text-foreground">{member.name}</span>
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-live to-live-end px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white opacity-90 shadow-[0_1px_3px_#ffc9c9] font-[family-name:var(--font-outfit)]">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
