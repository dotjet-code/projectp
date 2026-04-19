import Image from "next/image";
import Link from "next/link";
import type { RankedMember } from "@/lib/projectp/live-stats";
import { FloatingLiveBadge } from "./live-badge";
import { ShuyakuVoteButton } from "./shuyaku-vote-button";

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

export function ScoreBar({
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
    <div className="flex items-center gap-2 w-full">
      <span className="w-7 text-[10px] font-medium text-[#4A5060] shrink-0">
        {label}
      </span>
      <div className="flex-1 h-[3px] bg-[#E0DCC8] min-w-0">
        <div
          className="h-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[10px] font-bold tabular-nums text-[#111] w-14 text-right shrink-0"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export interface MemberRowProps {
  member: RankedMember;
  rank: number;
  maxBuzz: number;
  maxConc: number;
  maxRev: number;
  maxShuyaku: number;
}

/**
 * ホームの「本日の出走」と /ranking で共通で使うメンバー行。
 * ジャージ + 号艇 + アバター + 順位 + 名前 + 4 スコアバー + 合計pt + 主役指名ボタン。
 */
export function MemberRow({
  member,
  rank,
  maxBuzz,
  maxConc,
  maxRev,
  maxShuyaku,
}: MemberRowProps) {
  const href = `/members/${member.slug}`;
  return (
    <div className="flex items-center gap-2 md:gap-0 py-4 md:py-5 border-b border-[#D5CFC0] hover:bg-white/60 transition-colors group">
      {/* === IDENTITY (mobile はゼッケンと号艇を非表示) === */}
      <Link
        href={href}
        className="hidden md:block shrink-0 md:mr-2"
        aria-label={`${member.name} 詳細`}
      >
        <Jersey number={member.id} />
      </Link>

      <Link
        href={href}
        className="hidden md:block shrink-0 md:mr-3"
        tabIndex={-1}
        aria-hidden
      >
        <BoatPlate rank={rank} />
      </Link>

      <Link
        href={href}
        className="shrink-0 md:mr-4 relative w-12 h-12 md:w-16 md:h-16 overflow-hidden border border-[#D5CFC0]"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={member.avatarUrl}
          alt=""
          width={64}
          height={64}
          className="w-full h-full object-cover md:grayscale md:contrast-125 md:group-hover:grayscale-0 md:group-hover:contrast-100 transition-[filter] duration-300"
          style={{ objectPosition: "50% 18%" }}
        />
        <FloatingLiveBadge slug={member.slug} />
      </Link>

      <Link
        href={href}
        className="shrink-0 md:mr-3 w-7 md:w-12 flex items-baseline gap-0.5"
        tabIndex={-1}
        aria-hidden
      >
        <span
          className="text-2xl md:text-4xl font-black leading-none tabular-nums text-[#111]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {rank}
        </span>
        <span className="hidden md:inline text-[10px] text-[#4A5060] leading-none pb-0.5">
          −
        </span>
      </Link>

      {/* 名前 + ロール (mobile は flex-1 で残り埋め) */}
      <Link href={href} className="flex-1 md:flex-initial md:shrink-0 md:mr-3 md:w-40 min-w-0">
        <p className="text-sm md:text-lg font-bold text-[#111] truncate leading-tight">
          {member.name}
        </p>
        <span
          className={`inline-block mt-0.5 md:mt-1 text-[9px] md:text-[10px] font-black tracking-wider px-1.5 py-0.5 ${
            member.role === "PLAYER"
              ? "bg-[#D41E28] text-white"
              : "bg-[#4A5060] text-white"
          }`}
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {member.role}
        </span>
      </Link>

      {/* === DATA (スコアバー 4本) === */}
      <div className="hidden md:block flex-1 min-w-0 max-w-[320px] mr-10 space-y-1">
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
        <ScoreBar
          label="主役"
          value={member.detail.stats.shuyaku ?? 0}
          max={maxShuyaku}
          color="#D41E28"
        />
      </div>

      {/* 合計 pt */}
      <Link
        href={href}
        className="shrink-0 md:mr-10 w-16 md:w-24 text-right tabular-nums"
        tabIndex={-1}
        aria-hidden
      >
        <p
          className="text-xl md:text-3xl font-black tabular-nums leading-none text-[#111]"
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
      </Link>

      {/* === ACTION (mobile はコンパクト・desktop は通常サイズ) === */}
      {member.supabaseId && (
        <>
          {/* mobile: アイコンのみのコンパクトボタン */}
          <div className="md:hidden shrink-0 ml-1">
            <ShuyakuVoteButton
              memberId={member.supabaseId}
              memberName={member.name}
              size="sm"
              showRule={false}
              compact
            />
          </div>
          {/* desktop: 通常サイズ */}
          <div className="hidden md:block shrink-0 w-44">
            <ShuyakuVoteButton
              memberId={member.supabaseId}
              memberName={member.name}
              size="sm"
              showRule={false}
              fullWidth
            />
          </div>
        </>
      )}
    </div>
  );
}
