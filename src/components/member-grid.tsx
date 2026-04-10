import Image from "next/image";
import Link from "next/link";
import type { Member } from "@/lib/data";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { getBoatColor } from "@/lib/projectp/boat-colors";
import { FloatingLiveBadge } from "./live-badge";

function RoleBadge({ role }: { role: Member["role"] }) {
  const isPlayer = role === "PLAYER";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white shadow-sm font-[family-name:var(--font-outfit)] ${
        isPlayer
          ? "bg-gradient-to-r from-player to-player-end shadow-[0_1px_3px_#bedbff]"
          : "bg-gradient-to-r from-pit to-pit-end shadow-[0_1px_3px_#fee685]"
      }`}
    >
      {role}
    </span>
  );
}

function MemberCard({ member }: { member: Member }) {
  const bc = getBoatColor(member.boatColor);
  return (
    <Link
      href={`/members/${member.slug}`}
      className="group flex flex-col items-center gap-2 cursor-pointer"
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="size-[72px] overflow-hidden rounded-full bg-gray-200 shadow-md"
          style={{
            boxShadow: bc ? `0 0 0 3px ${bc.main}` : undefined,
          }}
        >
          <Image
            src={member.avatarUrl}
            alt={member.name}
            width={72}
            height={72}
            className="size-full object-cover object-top"
          />
        </div>
        <FloatingLiveBadge slug={member.slug} />
        <RoleBadge role={member.role} />
      </div>

      {/* Rank + Name */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="font-[family-name:var(--font-outfit)] text-sm font-extrabold text-[#0092b8]">
            #{member.rank}
          </span>
        </div>
        <p className="text-sm font-bold text-foreground group-hover:text-primary-dark transition-colors">
          {member.name}
        </p>
      </div>
    </Link>
  );
}

export async function MemberGrid() {
  const ranked = await getRankedMembers();
  const playerMembers = ranked.filter((m) => m.role === "PLAYER");
  const pitMembers = ranked.filter((m) => m.role === "PIT");

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
          今月の PLAYER / PIT 編成
        </h2>
      </div>
      <p className="ml-5 mb-6 text-sm text-muted">
        月末特番の結果で全員のポジションが変わる。今の順位が、来月の運命を決める。
      </p>

      {/* Grid Labels + Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PLAYER Side */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted font-[family-name:var(--font-outfit)] tracking-wider">
              1位〜6位 — ステージの主役
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {playerMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* PIT Side */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted font-[family-name:var(--font-outfit)] tracking-wider">
              7位以下 — 逆襲の待機組
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {pitMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
