import Image from "next/image";
import Link from "next/link";
import { getRankedMembers } from "@/lib/projectp/live-stats";
import { SectionHeading } from "./section-heading";
import { LiveBadge } from "./live-badge";

const BOAT_PLATES: Record<
  number,
  { bg: string; border: string }
> = {
  1: { bg: "#F5F5F0", border: "#111111" },
  2: { bg: "#1A1A1A", border: "#1A1A1A" },
  3: { bg: "#D41E28", border: "#D41E28" },
};

export async function Rankings() {
  const ranked = await getRankedMembers();
  const top3 = ranked.filter((m) => m.name !== "Coming Soon").slice(0, 3);

  const maxBuzz = Math.max(...ranked.map((m) => m.detail.stats.buzz), 1);
  const maxConc = Math.max(...ranked.map((m) => m.detail.stats.concurrent), 1);
  const maxRev = Math.max(...ranked.map((m) => m.detail.stats.revenue), 1);

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
        {top3.map((member, i) => {
          const rank = i + 1;
          const plate = BOAT_PLATES[rank];
          const buzzPct = (member.detail.stats.buzz / maxBuzz) * 100;
          const concPct = (member.detail.stats.concurrent / maxConc) * 100;
          const revPct = (member.detail.stats.revenue / maxRev) * 100;

          return (
            <Link
              key={member.id}
              href={`/members/${member.slug}`}
              className="flex items-center gap-4 py-5 border-b border-[#D5CFC0] hover:bg-white/60 transition-colors group"
            >
              {/* 巨大順位 */}
              <div
                className="shrink-0 w-20 md:w-24 text-[#D41E28] leading-none"
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "clamp(64px, 7vw, 96px)",
                  fontWeight: 900,
                }}
              >
                <span className="tabular-nums">{rank}</span>
              </div>

              {/* 号艇プレート */}
              <div
                className="shrink-0 w-10 h-10 border"
                style={{ backgroundColor: plate.bg, borderColor: plate.border }}
                aria-label={`${rank}号艇`}
              />

              {/* 写真 */}
              <div className="shrink-0 w-20 h-20 overflow-hidden border border-[#D5CFC0]">
                <Image
                  src={member.avatarUrl}
                  alt=""
                  width={80}
                  height={80}
                  className="w-full h-full object-cover object-top grayscale contrast-125"
                />
              </div>

              {/* 氏名 + ロール + LIVE */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xl md:text-2xl font-bold text-[#111] leading-tight">
                    {member.name}
                  </p>
                  <LiveBadge slug={member.slug} size="xs" />
                </div>
                <span
                  className={`inline-block mt-1.5 text-[10px] font-black tracking-wider px-1.5 py-0.5 ${
                    member.role === "PLAYER"
                      ? "bg-[#D41E28] text-white"
                      : "bg-[#4A5060] text-white"
                  }`}
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {member.role}
                </span>
              </div>

              {/* 3 スコアバー (デスクトップのみ) */}
              <div className="hidden md:block shrink-0 space-y-1.5 w-48">
                <StatRow label="バズ" value={member.detail.stats.buzz} pct={buzzPct} color="#00BCFF" />
                <StatRow label="配信" value={member.detail.stats.concurrent} pct={concPct} color="#1447E6" />
                <StatRow label="収支" value={member.detail.stats.revenue} pct={revPct} color="#7A3DFF" />
              </div>

              {/* 合計 pt */}
              <div className="shrink-0 w-24 text-right">
                <p
                  className="text-3xl md:text-4xl font-black tabular-nums leading-none text-[#111]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {member.effectivePoints.toLocaleString()}
                </p>
                <p
                  className="text-[11px] text-[#4A5060] mt-1"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  pt
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function StatRow({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[10px] font-medium text-[#4A5060]">{label}</span>
      <div className="flex-1 h-[3px] bg-[#E0DCC8]">
        <div
          className="h-full"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="w-12 text-right text-[10px] font-bold tabular-nums text-[#111]"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}
