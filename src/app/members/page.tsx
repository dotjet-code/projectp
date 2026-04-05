import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { members, type Member } from "@/lib/data";

const medals = ["🥇", "🥈", "🥉"];

function SnsIcons() {
  return (
    <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 pt-2.5">
      {/* Instagram */}
      <button className="flex size-7 items-center justify-center rounded-2xl text-muted hover:bg-gray-50 transition-colors">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {/* X */}
      <button className="flex size-7 items-center justify-center rounded-2xl text-muted hover:bg-gray-50 transition-colors">
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      {/* YouTube */}
      <button className="flex size-7 items-center justify-center rounded-2xl text-muted hover:bg-gray-50 transition-colors">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="4" />
          <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {/* TikTok */}
      <button className="flex size-7 items-center justify-center rounded-2xl text-muted hover:bg-gray-50 transition-colors">
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.98a8.18 8.18 0 004.76 1.52V7.08a4.83 4.83 0 01-1-.39z" />
        </svg>
      </button>
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  const rankDisplay =
    member.rank <= 3 ? medals[member.rank - 1] : `#${member.rank}`;
  const isTopRank = member.rank <= 3;

  return (
    <Link
      href={`/members/${member.slug}`}
      className="group relative rounded-2xl border border-gray-100/80 bg-white transition-shadow hover:shadow-md"
    >
      {/* Rank badge */}
      <div
        className={`absolute -top-2 right-[-6px] z-10 flex size-8 items-center justify-center rounded-full shadow-md ${
          isTopRank
            ? "bg-gradient-to-br from-[#fef3c6] to-[#fef9c2]"
            : "bg-white border border-gray-100"
        }`}
      >
        <span
          className={`font-[family-name:var(--font-outfit)] text-center leading-none ${
            isTopRank ? "text-base" : "text-xs font-extrabold text-[#0092b8]"
          }`}
        >
          {rankDisplay}
        </span>
      </div>

      {/* Image */}
      <div className="relative mx-3 sm:mx-4 mt-3 sm:mt-4 aspect-square">
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={195}
          height={195}
          className="absolute inset-0 size-full rounded-[20px] object-cover object-top shadow-sm"
        />
        {member.isLive && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#fb2c36] px-2 py-0.5 shadow-md">
            <span className="size-1.5 rounded-full bg-white opacity-60 animate-pulse" />
            <span className="text-[10px] font-bold text-white">LIVE</span>
          </div>
        )}
        {member.isTrending && (
          <div className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-[#d0fae5] shadow-sm">
            <svg className="size-3.5 text-[#00d492]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-3">
        <p className="text-center text-sm font-bold text-foreground">{member.name}</p>
        <div className="mt-1.5 flex justify-center">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
              member.role === "PLAYER"
                ? "bg-gradient-to-r from-player to-player-end shadow-[0_1px_3px_#bedbff]"
                : "bg-gradient-to-r from-pit to-pit-end shadow-[0_1px_3px_#fee685]"
            }`}
          >
            {member.role}
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="mt-2 px-4 text-center">
        <p className="text-[10px] text-muted">総合ポイント</p>
        <p className="font-[family-name:var(--font-outfit)] text-base font-extrabold text-[#0092b8]">
          {member.points.toLocaleString()}
        </p>
      </div>

      {/* SNS */}
      <div className="px-4 pb-3 pt-2">
        <SnsIcons />
      </div>
    </Link>
  );
}

function CompactMemberRow({ member }: { member: Member }) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="flex flex-col items-center gap-1 rounded-2xl p-3 hover:bg-white/50 transition-colors"
    >
      <Image
        src={member.avatarUrl}
        alt={member.name}
        width={64}
        height={64}
        className="size-16 rounded-full object-cover object-top shadow-sm"
      />
      <p className="text-xs font-bold text-foreground text-center">{member.name}</p>
      <p className="font-[family-name:var(--font-outfit)] text-[11px] font-semibold text-muted">
        #{member.rank}
      </p>
      <div className="flex items-center gap-1">
        {/* Compact SNS */}
        <button className="flex size-[22px] items-center justify-center rounded-full text-muted hover:bg-gray-100 transition-colors">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <button className="flex size-[22px] items-center justify-center rounded-full text-muted hover:bg-gray-100 transition-colors">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>
        <button className="flex size-[22px] items-center justify-center rounded-full text-muted hover:bg-gray-100 transition-colors">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="4" />
            <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>
    </Link>
  );
}

export default function MembersPage() {
  const playerMembers = members.filter((m) => m.role === "PLAYER");
  const pitMembers = members.filter((m) => m.role === "PIT");

  return (
    <>
      <Header />
      <main>
        {/* Page Header */}
        <section className="pt-10 pb-8 text-center">
          <p className="text-4xl mb-2">👥</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            メンバー紹介
          </h1>
          <p className="mt-2 text-sm text-muted">
            Project P を構成する12人のメンバー
          </p>
        </section>

        {/* All Members Grid */}
        <section className="mx-auto max-w-[996px] px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
              🏆 全メンバー（現在の順位順）
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>

        {/* PLAYER Section */}
        <section className="mx-auto max-w-[996px] px-4 mt-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
              ⭐ PLAYER（上位6名）
            </h2>
          </div>

          <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
            <p className="text-sm text-muted mb-3">ステージの主役として活躍するメンバー</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
              {playerMembers.map((member) => (
                <CompactMemberRow key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* PIT Section */}
        <section className="mx-auto max-w-[996px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-pit to-[#fdc700]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#bb4d00] tracking-tight">
              🔥 PIT（下位6名）
            </h2>
          </div>

          <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
            <p className="text-sm text-muted mb-3">逆襲の機会を待つメンバー</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
              {pitMembers.map((member) => (
                <CompactMemberRow key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="mx-auto max-w-[996px] px-4 mt-10">
          <div className="rounded-2xl border border-[rgba(206,250,254,0.5)] bg-gradient-to-r from-[rgba(236,254,255,0.8)] to-[rgba(240,249,255,0.8)] px-5 py-5 text-center">
            <p className="text-2xl mb-2">🔄</p>
            <p className="text-sm font-bold text-primary-dark">
              月間3指標（バズ・同接・収支）と月末特番の結果により、毎月 PLAYER / PIT が再編成されます
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
