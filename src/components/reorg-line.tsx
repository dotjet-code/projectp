import Image from "next/image";
import Link from "next/link";
import { getRankedMembers } from "@/lib/projectp/live-stats";

export async function ReorgLine() {
  const ranked = await getRankedMembers();
  const borderMembers = ranked.filter((m) => m.rank >= 5 && m.rank <= 8);

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-pit to-[#fdc700]" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#bb4d00] tracking-tight">
          翌月再編成ライン
        </h2>
      </div>
      <p className="ml-5 mb-5 text-sm text-muted">
        総合6位と7位の境界が、翌月のポジションを分ける
      </p>

      {/* Card */}
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
        {borderMembers.map((member) => (
          <div key={member.id}>
            {/* Reorg line between rank 6 and 7 */}
            {member.rank === 7 && (
              <div className="relative my-1">
                <div className="border-t-2 border-dashed border-reorg" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 rounded-full bg-gradient-to-r from-pit to-pit-end px-4 py-1 text-[11px] font-bold text-white tracking-wider shadow-[0_1px_3px_#fee685]">
                  ⚡ 翌月再編成ライン ⚡
                </span>
              </div>
            )}

            {/* Member row */}
            <Link
              href={`/members/${member.slug}`}
              className="flex items-center gap-3 rounded-[20px] px-3 py-3 hover:bg-white/50 transition-colors group"
            >
              <span className="w-8 font-[family-name:var(--font-outfit)] text-base font-extrabold text-[#0092b8] text-center">
                #{member.rank}
              </span>
              <Image
                src={member.avatarUrl}
                alt={member.name}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover object-top shadow-sm"
              />
              <span className="flex-1 text-sm font-bold text-foreground group-hover:text-primary-dark transition-colors">
                {member.name}
              </span>
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
          </div>
        ))}
      </div>
    </section>
  );
}
