import Image from "next/image";
import Link from "next/link";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { getBoatColor } from "@/lib/projectp/boat-colors";
import { LiveBadge } from "./live-badge";

const medals = ["🥇", "🥈", "🥉"];

function StatMiniBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-[family-name:var(--font-outfit)] text-[11px] font-semibold text-muted w-10 text-right">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export async function Rankings() {
  const ranked = await getRankedMembers();
  const top3 = ranked.slice(0, 3);

  const maxBuzz = Math.max(...ranked.map((m) => m.detail.stats.buzz), 1);
  const maxConc = Math.max(
    ...ranked.map((m) => m.detail.stats.concurrent),
    1
  );
  const maxRev = Math.max(...ranked.map((m) => m.detail.stats.revenue), 1);

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-12">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#00d3f3] to-[#00bcff]" />
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold tracking-tight text-[#007595]">
            暫定 TOP3
          </h2>
        </div>
        <Link
          href="/ranking"
          className="text-[11px] font-bold text-primary-dark underline"
        >
          全体ランキングを見る →
        </Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {top3.map((member) => {
          const mbc = getBoatColor(member.boatColor);
          return (
            <Link
              key={member.id}
              href={`/members/${member.slug}`}
              className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 px-4 py-3.5 shadow-sm hover:shadow-md transition-all group"
            >
              {/* Rank */}
              <div className="w-8 shrink-0 text-center">
                <span className="text-xl">{medals[member.rank - 1]}</span>
              </div>

              {/* Avatar */}
              <Image
                src={member.avatarUrl}
                alt={member.name}
                width={44}
                height={44}
                className="size-11 shrink-0 rounded-full object-cover object-top"
                style={{
                  boxShadow: mbc
                    ? `0 0 0 2.5px ${mbc.main}, 0 1px 3px rgba(0,0,0,0.1)`
                    : "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />

              {/* Name + Role */}
              <div className="flex-1 md:flex-none md:w-32 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary-dark transition-colors truncate">
                    {member.name}
                  </p>
                  <LiveBadge slug={member.slug} size="xs" />
                </div>
                <span
                  className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                    member.role === "PLAYER"
                      ? "bg-gradient-to-r from-player to-player-end"
                      : "bg-gradient-to-r from-pit to-pit-end"
                  }`}
                >
                  {member.role}
                </span>
              </div>

              {/* Stats — hidden on mobile */}
              <div className="hidden md:flex flex-1 items-center gap-4">
                <div className="flex-1">
                  <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">
                    バズ
                  </p>
                  <StatMiniBar
                    value={member.detail.stats.buzz}
                    max={maxBuzz}
                    color="#00d3f3"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">
                    配信
                  </p>
                  <StatMiniBar
                    value={member.detail.stats.concurrent}
                    max={maxConc}
                    color="#2b7fff"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">
                    収支
                  </p>
                  <StatMiniBar
                    value={member.detail.stats.revenue}
                    max={maxRev}
                    color="#a684ff"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="w-16 sm:w-24 shrink-0 text-right">
                <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground">
                  {member.points.toLocaleString()}
                </span>
                <p className="text-[9px] text-muted font-[family-name:var(--font-outfit)]">
                  pts
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
