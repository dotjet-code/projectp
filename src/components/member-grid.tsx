import { getRankedMembers } from "@/lib/projectp/live-stats";
import { SectionHeading } from "./section-heading";
import { MemberRow } from "./member-row";

function PassLineDivider() {
  return (
    <div
      className="flex items-center bg-[#D41E28] text-white h-9 px-4 my-0"
      aria-label="PASS LINE"
    >
      <span
        className="text-[11px] font-black tracking-[0.25em]"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        — PASS LINE · 6位以上が PLAYER —
      </span>
    </div>
  );
}

export async function MemberGrid() {
  const ranked = await getRankedMembers();
  const active = ranked.filter((m) => m.name !== "Coming Soon");

  const maxBuzz = Math.max(...active.map((m) => m.detail.stats.buzz), 1);
  const maxConc = Math.max(...active.map((m) => m.detail.stats.concurrent), 1);
  const maxRev = Math.max(...active.map((m) => m.detail.stats.revenue), 1);
  const maxShuyaku = Math.max(
    ...active.map((m) => m.detail.stats.shuyaku ?? 0),
    1,
  );

  const players = active.slice(0, 6);
  const pits = active.slice(6);

  return (
    <section className="mx-auto max-w-[1200px] px-4 mt-16">
      <SectionHeading
        title={
          <>
            <span className="inline-block">本日の</span>
            <span className="inline-block">出走</span>
          </>
        }
        eyebrow="TODAY'S STARTERS"
        aside={
          <span>
            月末の結果で全員のポジションが変わる。
            <span className="block md:inline md:ml-2 text-[#4A5060]">
              <span className="text-[#D41E28] font-bold">主役</span>は毎日サイコロで（同じ人には 1 日 1 回まで）。
            </span>
          </span>
        }
      />
      <div className="border-t-[3px] border-[#111]">
        {players.map((member, i) => (
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
        {pits.length > 0 && <PassLineDivider />}
        {pits.map((member, i) => (
          <MemberRow
            key={member.id}
            member={member}
            rank={i + 7}
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
