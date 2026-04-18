import Image from "next/image";
import Link from "next/link";
import type { RankedMember } from "@/lib/projectp/live-stats";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { SectionHeading } from "./section-heading";
import { FloatingLiveBadge } from "./live-badge";

const BOAT_PLATES: Record<
  number,
  { bg: string; border: string; fg: string }
> = {
  1: { bg: "#F5F5F0", border: "#111111", fg: "#111111" },
  2: { bg: "#1A1A1A", border: "#1A1A1A", fg: "#F5F1E8" },
  3: { bg: "#D41E28", border: "#D41E28", fg: "#FFFFFF" },
  4: { bg: "#1E4BC8", border: "#1E4BC8", fg: "#FFFFFF" },
  5: { bg: "#F2C81B", border: "#F2C81B", fg: "#111111" },
  6: { bg: "#0F8F4A", border: "#0F8F4A", fg: "#FFFFFF" },
};

function Jersey({ number }: { number: number }) {
  return (
    <div
      className="w-10 h-10 flex items-center justify-center border border-[#111] bg-white text-[11px] font-bold text-[#4A5060] tabular-nums"
      style={{ fontFamily: "var(--font-outfit)" }}
      aria-label={`ゼッケン ${number}`}
    >
      {String(number).padStart(2, "0")}
    </div>
  );
}

function BoatPlate({ rank }: { rank: number }) {
  if (rank <= 6) {
    const c = BOAT_PLATES[rank];
    return (
      <div
        className="w-9 h-9 border"
        style={{ backgroundColor: c.bg, borderColor: c.border }}
        aria-label={`${rank}号艇`}
      />
    );
  }
  return (
    <div
      className="w-9 h-9 flex items-center justify-center bg-[#4A5060] text-white text-[10px] font-black"
      style={{ fontFamily: "var(--font-outfit)" }}
      aria-label="PIT"
    >
      P
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-[10px] font-medium text-[#4A5060] shrink-0">
        {label}
      </span>
      <div className="w-20 h-[3px] bg-[#E0DCC8]">
        <div
          className="h-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[10px] font-bold tabular-nums text-[#111] w-10 text-right"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function MemberRow({
  member,
  rank,
  maxBuzz,
  maxConc,
  maxRev,
}: {
  member: RankedMember;
  rank: number;
  maxBuzz: number;
  maxConc: number;
  maxRev: number;
}) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="flex items-center gap-3 md:gap-4 py-4 border-b border-[#D5CFC0] hover:bg-white/60 transition-colors group"
    >
      <div className="shrink-0">
        <Jersey number={member.id} />
      </div>

      <div className="shrink-0">
        <BoatPlate rank={rank} />
      </div>

      <div className="shrink-0 relative w-16 h-16 overflow-hidden border border-[#D5CFC0]">
        <Image
          src={member.avatarUrl}
          alt=""
          width={64}
          height={64}
          className="w-full h-full object-cover object-top grayscale contrast-125"
        />
        <FloatingLiveBadge slug={member.slug} />
      </div>

      <div className="shrink-0 w-12 md:w-14 flex items-baseline gap-0.5">
        <span
          className="text-4xl md:text-5xl font-black leading-none tabular-nums text-[#111]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {rank}
        </span>
        <span className="text-[10px] text-[#4A5060] leading-none pb-0.5">−</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base md:text-lg font-bold text-[#111] truncate leading-tight">
          {member.name}
        </p>
        <span
          className={`inline-block mt-1 text-[10px] font-black tracking-wider px-1.5 py-0.5 ${
            member.role === "PLAYER"
              ? "bg-[#D41E28] text-white"
              : "bg-[#4A5060] text-white"
          }`}
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {member.role}
        </span>
      </div>

      <div className="hidden md:block shrink-0 space-y-1">
        <ScoreBar
          label="バズ"
          value={member.detail.stats.buzz}
          max={maxBuzz}
          color="#00BCFF"
        />
        <ScoreBar
          label="配信"
          value={member.detail.stats.concurrent}
          max={maxConc}
          color="#1447E6"
        />
        <ScoreBar
          label="収支"
          value={member.detail.stats.revenue}
          max={maxRev}
          color="#7A3DFF"
        />
      </div>

      <div className="shrink-0 w-20 text-right">
        <p
          className="text-2xl md:text-3xl font-black tabular-nums leading-none text-[#111]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {member.effectivePoints.toLocaleString()}
        </p>
        <p
          className="text-[10px] text-[#4A5060] mt-0.5"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          pt
        </p>
      </div>

      <div
        className="hidden lg:block shrink-0 text-sm font-bold text-[#D41E28] group-hover:underline"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        詳細 →
      </div>
    </Link>
  );
}

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

  const players = active.slice(0, 6);
  const pits = active.slice(6);

  return (
    <section className="mx-auto max-w-[1200px] px-4 mt-16">
      <SectionHeading
        title="本日の出走"
        eyebrow="TODAY'S STARTERS"
        aside={<span>月末の結果で全員のポジションが変わる。</span>}
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
          />
        ))}
      </div>
    </section>
  );
}
