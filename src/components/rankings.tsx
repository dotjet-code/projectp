import Image from "next/image";
import Link from "next/link";
import { getRankedMembers, type RankedMember } from "@/lib/projectp/live-stats";
import { getBoatColor } from "@/lib/projectp/boat-colors";
import { LiveBadge } from "./live-badge";

const medals = ["🥇", "🥈", "🥉"];

function RankingCard({
  title,
  titleColor,
  accentFrom,
  accentTo,
  borderColor,
  items,
}: {
  title: string;
  titleColor: string;
  accentFrom: string;
  accentTo: string;
  borderColor: string;
  items: RankedMember[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-1.5 rounded-full"
          style={{ backgroundImage: `linear-gradient(to bottom, ${accentFrom}, ${accentTo})` }}
        />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold tracking-tight" style={{ color: titleColor }}>
          {title}
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((member, i) => (
          <Link
            key={member.id}
            href={`/members/${member.slug}`}
            className="flex items-center gap-3 rounded-2xl bg-white border px-4 py-3.5 hover:shadow-md transition-shadow group"
            style={{ borderColor }}
          >
            <span className="text-xl">{medals[i]}</span>
            {(() => {
              const mbc = getBoatColor(member.boatColor);
              return (
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover object-top"
                  style={{
                    boxShadow: mbc
                      ? `0 0 0 2.5px ${mbc.main}, 0 1px 3px rgba(0,0,0,0.1)`
                      : "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                />
              );
            })()}
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-foreground group-hover:text-primary-dark transition-colors">
                  {member.name}
                </p>
                <LiveBadge slug={member.slug} size="xs" />
              </div>
              <p className="font-[family-name:var(--font-outfit)] text-xs font-semibold text-muted">
                {member.points.toLocaleString()} pts
              </p>
            </div>
            <svg className="size-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function Rankings() {
  const ranked = await getRankedMembers();
  const playerTop3 = ranked.filter((m) => m.role === "PLAYER").slice(0, 3);
  const pitTop3 = ranked.filter((m) => m.role === "PIT").slice(0, 3);

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <RankingCard
          title="PLAYER 暫定TOP3"
          titleColor="#007595"
          accentFrom="#00d3f3"
          accentTo="#00bcff"
          borderColor="rgba(206,250,254,0.5)"
          items={playerTop3}
        />
        <RankingCard
          title="PIT 暫定TOP3"
          titleColor="#bb4d00"
          accentFrom="#ffb900"
          accentTo="#fdc700"
          borderColor="rgba(254,243,198,0.5)"
          items={pitTop3}
        />
      </div>
    </section>
  );
}
