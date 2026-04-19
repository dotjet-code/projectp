import Link from "next/link";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { SectionHeading } from "./section-heading";
import { MemberRow } from "./member-row";

export async function Rankings() {
  const ranked = await getRankedMembers();
  const top3 = ranked.filter((m) => m.name !== "Coming Soon").slice(0, 3);

  const maxBuzz = Math.max(...ranked.map((m) => m.detail.stats.buzz), 1);
  const maxConc = Math.max(...ranked.map((m) => m.detail.stats.concurrent), 1);
  const maxRev = Math.max(...ranked.map((m) => m.detail.stats.revenue), 1);
  const maxShuyaku = Math.max(
    ...ranked.map((m) => m.detail.stats.shuyaku ?? 0),
    1,
  );

  return (
    <section className="mx-auto max-w-[1200px] px-4 mt-16">
      <SectionHeading
        title="暫定 TOP 3"
        eyebrow="CURRENT STANDINGS"
        aside={
          <Link
            href="/ranking"
            className="font-bold text-[#D41E28] hover:underline"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            全体ランキング →
          </Link>
        }
      />

      <div className="border-t-[3px] border-[#111]">
        {top3.map((member, i) => (
          <MemberRow
            key={member.id}
            member={member}
            rank={i + 1}
            maxBuzz={maxBuzz}
            maxConc={maxConc}
            maxRev={maxRev}
            maxShuyaku={maxShuyaku}
          />
        ))}
      </div>
    </section>
  );
}
