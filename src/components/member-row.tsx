import Image from "next/image";
import Link from "next/link";
import type { RankedMember } from "@/lib/projectp/live-stats";
import { BOAT_PLATES, type BoatColorNumber } from "@/lib/projectp/boat-colors";
import { FloatingLiveBadge } from "./live-badge";
import { ShuyakuVoteButton } from "./shuyaku-vote-button";

// value/max → 0..100 の比率。floor を指定するとゼロ値でも最小可視幅を確保できる。
function barPct(value: number, max: number, floor = 0): number {
  const raw = (value / Math.max(max, 1)) * 100;
  return Math.max(floor, Math.min(100, raw));
}

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
    const c = BOAT_PLATES[rank as BoatColorNumber];
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

/**
 * モバイル用 ミニ統計 (4 指標: バー + ラベル付き)。
 * デスクトップでは `md:hidden` で非表示。
 */
function MiniStatsBars({
  buzz,
  conc,
  rev,
  shuyaku,
  maxBuzz,
  maxConc,
  maxRev,
  maxShuyaku,
}: {
  buzz: number;
  conc: number;
  rev: number;
  shuyaku: number;
  maxBuzz: number;
  maxConc: number;
  maxRev: number;
  maxShuyaku: number;
}) {
  const bars = [
    { value: buzz, max: maxBuzz, color: "#00BCFF", label: "バズ" },
    { value: conc, max: maxConc, color: "#1447E6", label: "配信" },
    { value: rev, max: maxRev, color: "#7A3DFF", label: "収支" },
    { value: shuyaku, max: maxShuyaku, color: "#D41E28", label: "投票" },
  ];
  return (
    <div
      className="md:hidden flex items-end gap-2"
      role="img"
      aria-label="バズ・配信・収支・投票 の強度"
    >
      {bars.map((b) => {
        // モバイルはバー幅 12px なので、ゼロ値でも最低 6% は残して視認性を確保
        const pct = barPct(b.value, b.max, 6);
        return (
          <div
            key={b.label}
            className="flex flex-col items-center gap-0.5"
            title={`${b.label}: ${b.value.toLocaleString()}`}
          >
            <div className="w-3 h-3 bg-[#E0DCC8] flex items-end">
              <div
                className="w-full"
                style={{ height: `${pct}%`, backgroundColor: b.color }}
              />
            </div>
            <span
              className="text-[8px] font-bold leading-none text-[#4A5060] whitespace-nowrap"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              {b.label}
            </span>
          </div>
        );
      })}
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
  const pct = barPct(value, max);
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
      {/*
        行全体を 1 つの <Link> でラップ。フォーカス可能な要素は
        「メンバー詳細リンク」 と 「主役指名ボタン」 の 2 つだけにする。
      */}
      <Link
        href={href}
        aria-label={`${rank}位 ${member.name} (${member.role}) ${member.effectivePoints.toLocaleString()}pt の詳細`}
        className="flex-1 min-w-0 flex items-center gap-2 md:gap-0 focus-visible:outline-2 focus-visible:outline-[#D41E28] focus-visible:outline-offset-2"
      >
        {/* === IDENTITY (mobile はゼッケンと号艇を非表示) === */}
        <div className="hidden md:block shrink-0 md:mr-2" aria-hidden>
          <Jersey number={member.id} />
        </div>

        <div className="hidden md:block shrink-0 md:mr-3" aria-hidden>
          <BoatPlate rank={rank} />
        </div>

        <div
          className="shrink-0 md:mr-4 relative w-10 h-10 md:w-16 md:h-16 overflow-hidden border border-[#D5CFC0]"
          aria-hidden
          style={{
            backgroundImage: "url(/members/haikei.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
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
        </div>

        <div
          className="shrink-0 md:mr-3 w-6 md:w-12 flex items-baseline gap-0.5"
          aria-hidden
        >
          <span
            className="text-xl md:text-4xl font-black leading-none tabular-nums text-[#111]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {rank}
          </span>
          <span className="hidden md:inline text-[10px] text-[#4A5060] leading-none pb-0.5">
            −
          </span>
        </div>

        {/* 名前 + ロール + モバイル用 ミニ統計 (ラベル付き) */}
        <div className="flex-1 md:flex-initial md:shrink-0 md:mr-3 md:w-40 min-w-0">
          <p className="text-sm md:text-lg font-bold text-[#111] truncate leading-tight">
            {member.name}
          </p>
          <div className="mt-0.5 md:mt-1 flex flex-col gap-1.5">
            <span
              className={`self-start inline-block text-[9px] md:text-[10px] font-black tracking-wider px-1.5 py-0.5 ${
                member.role === "PLAYER"
                  ? "bg-[#D41E28] text-white"
                  : "bg-[#4A5060] text-white"
              }`}
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {member.role}
            </span>
            {/* モバイル専用: 4 指標バー + ラベル */}
            <MiniStatsBars
              buzz={member.detail.stats.buzz}
              conc={member.detail.stats.concurrent}
              rev={member.detail.stats.revenue}
              shuyaku={member.detail.stats.shuyaku ?? 0}
              maxBuzz={maxBuzz}
              maxConc={maxConc}
              maxRev={maxRev}
              maxShuyaku={maxShuyaku}
            />
          </div>
        </div>

        {/* === DATA (スコアバー 4本) — desktop only === */}
        <div className="hidden md:block flex-1 min-w-0 max-w-[320px] mr-6 lg:mr-10 space-y-1">
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
            label="投票"
            value={member.detail.stats.shuyaku ?? 0}
            max={maxShuyaku}
            color="#D41E28"
          />
        </div>

        {/* 合計 pt */}
        <div
          className="shrink-0 md:mr-6 lg:mr-10 w-[60px] md:w-24 text-right tabular-nums"
          aria-hidden
        >
          <p
            className="text-base md:text-3xl font-black tabular-nums leading-none text-[#111]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {member.effectivePoints.toLocaleString()}
          </p>
          <p
            className="text-[9px] md:text-[10px] text-[#4A5060] mt-0.5"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            pt
          </p>
        </div>
      </Link>

      {/* === ACTION (mobile は 48px ダイス・desktop は 176px 横長) === */}
      <div className="md:hidden shrink-0 flex justify-center pl-1">
        {member.supabaseId && (
          <ShuyakuVoteButton
            memberId={member.supabaseId}
            memberName={member.name}
            size="sm"
            showRule={false}
            compact
          />
        )}
      </div>
      <div className="hidden md:block shrink-0 w-44">
        {member.supabaseId && (
          <ShuyakuVoteButton
            memberId={member.supabaseId}
            memberName={member.name}
            size="sm"
            showRule={false}
            fullWidth
          />
        )}
      </div>
    </div>
  );
}
