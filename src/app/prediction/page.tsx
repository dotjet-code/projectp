"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { members, type Member } from "@/lib/data";

type SlotSelection = (Member | null)[];

function EntryTypeBadge({ type, active, onClick }: { type: "normal" | "welcome"; active: boolean; onClick: () => void }) {
  if (type === "normal") {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all ${
          active
            ? "border-primary/30 bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] text-primary-dark shadow-sm"
            : "border-gray-100 bg-white/70 text-muted hover:border-gray-200"
        }`}
      >
        <span className="rounded-full bg-gradient-to-r from-primary to-primary-cyan px-2 py-0.5 text-[10px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">
          受付中
        </span>
        通常エントリー
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all ${
        active
          ? "border-live/30 bg-gradient-to-r from-[#fef2f2] to-[#fdf2f8] text-[#e7000b] shadow-sm"
          : "border-gray-100 bg-white/70 text-muted hover:border-gray-200"
      }`}
    >
      <span className="text-lg">🎁</span>
      初回限定ウェルカム
    </button>
  );
}

function SlotCard({ index, member, label, onRemove }: {
  index: number;
  member: Member | null;
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-3 sm:px-6 py-3 sm:py-4 min-w-[90px] sm:min-w-[120px] transition-all ${
      member ? "border-primary/30 bg-[#ecfeff]/50" : "border-gray-200 bg-white/50"
    }`}>
      {member ? (
        <>
          <div className="relative">
            <Image
              src={member.avatarUrl}
              alt={member.name}
              width={48}
              height={48}
              className="size-12 rounded-full object-cover object-top shadow-sm"
            />
            <button
              onClick={onRemove}
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gray-400 text-white text-[10px] hover:bg-gray-500 transition-colors"
            >
              x
            </button>
          </div>
          <p className="text-xs font-bold text-foreground text-center">{member.name}</p>
        </>
      ) : (
        <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
          <span className="text-lg text-gray-300">?</span>
        </div>
      )}
      <span className="text-[10px] font-bold text-muted">{label}</span>
    </div>
  );
}

function MemberCandidate({ member, selected, onSelect }: {
  member: Member;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={selected}
      className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
        selected
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/80 hover:shadow-sm cursor-pointer"
      }`}
    >
      <Image
        src={member.avatarUrl}
        alt={member.name}
        width={48}
        height={48}
        className="size-12 rounded-full object-cover object-top shadow-sm"
      />
      <p className="text-[11px] font-bold text-foreground text-center leading-tight">{member.name}</p>
      <p className="font-[family-name:var(--font-outfit)] text-[10px] text-muted">
        総合 {member.points.toLocaleString()}
      </p>
    </button>
  );
}

function PredictionSection({
  title,
  titleColor,
  accentFrom,
  accentTo,
  slotCount,
  candidates,
  selections,
  onSelect,
  onRemove,
  isLocked,
}: {
  title: string;
  titleColor: string;
  accentFrom: string;
  accentTo: string;
  slotCount: number;
  candidates: Member[];
  selections: SlotSelection;
  onSelect: (member: Member) => void;
  onRemove: (index: number) => void;
  isLocked: boolean;
}) {
  const slotLabels = slotCount === 2 ? ["1着", "2着"] : ["1着", "2着", "3着"];
  const selectedIds = selections.filter(Boolean).map((m) => m!.id);

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[family-name:var(--font-outfit)] text-lg font-extrabold tracking-tight" style={{ color: titleColor }}>
          {title}
        </h2>
        <svg className="size-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div className="rounded-2xl bg-white/70 border border-white/80 p-6 shadow-sm">
        {isLocked && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-muted">
            <span>🔒</span>
            <span>締切済み — この予想は変更できません</span>
          </div>
        )}

        {/* Slots */}
        <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 ${isLocked ? "opacity-60 pointer-events-none" : ""}`}>
          {slotLabels.map((label, i) => (
            <SlotCard
              key={i}
              index={i}
              member={selections[i] ?? null}
              label={label}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>

        {/* Candidates */}
        <div className={`grid grid-cols-3 sm:grid-cols-6 gap-1 ${isLocked ? "opacity-60 pointer-events-none" : ""}`}>
          {candidates.map((member) => (
            <MemberCandidate
              key={member.id}
              member={member}
              selected={selectedIds.includes(member.id)}
              onSelect={() => onSelect(member)}
            />
          ))}
        </div>

        {/* Prompt */}
        <p className="mt-4 text-center text-sm text-muted">
          {slotCount === 2 ? "2名を選んでください" : "3名を選んでください"}
        </p>
      </div>
    </section>
  );
}

export default function PredictionPage() {
  const [entryType, setEntryType] = useState<"normal" | "welcome">("normal");
  const [isLocked] = useState(false);

  const playerMembers = members.filter((m) => m.role === "PLAYER");
  const pitMembers = members.filter((m) => m.role === "PIT");

  // Selection state for each section
  const [playerWin, setPlayerWin] = useState<SlotSelection>([null, null]);
  const [playerTri, setPlayerTri] = useState<SlotSelection>([null, null, null]);
  const [pitWin, setPitWin] = useState<SlotSelection>([null, null]);
  const [pitTri, setPitTri] = useState<SlotSelection>([null, null, null]);

  function makeSelectHandler(selections: SlotSelection, setSelections: (s: SlotSelection) => void) {
    return (member: Member) => {
      if (isLocked) return;
      const nextSlot = selections.findIndex((s) => s === null);
      if (nextSlot === -1) return;
      const next = [...selections];
      next[nextSlot] = member;
      setSelections(next);
    };
  }

  function makeRemoveHandler(selections: SlotSelection, setSelections: (s: SlotSelection) => void) {
    return (index: number) => {
      if (isLocked) return;
      const next = [...selections];
      next[index] = null;
      setSelections(next);
    };
  }

  const allFilled =
    playerWin.every(Boolean) &&
    playerTri.every(Boolean) &&
    pitWin.every(Boolean) &&
    pitTri.every(Boolean);

  function handleSubmit() {
    const payload = {
      entryType,
      playerWin: playerWin.map((m) => m?.slug),
      playerTri: playerTri.map((m) => m?.slug),
      pitWin: pitWin.map((m) => m?.slug),
      pitTri: pitTri.map((m) => m?.slug),
    };
    console.log("Submit prediction:", payload);
    alert("予想を提出しました！（デモ）");
  }

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Page Header */}
        <section className="pt-10 pb-6 text-center">
          <p className="text-4xl mb-2">🎯</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            今月の順位予想
          </h1>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            2026年4月クールの最終順位を予想しよう。月末特番で確定した結果が翌月再編成を決める。
          </p>
        </section>

        {/* Countdown + Entry Type */}
        <section className="mx-auto max-w-[964px] px-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Countdown */}
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-4 text-white shadow-[0_10px_15px_rgba(162,244,253,0.4)]"
              style={{ backgroundImage: "linear-gradient(165deg, #00d3f3 0%, #00bcff 50%, #2b7fff 100%)" }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -left-2 -top-2 size-20 rounded-full bg-white" />
                <div className="absolute right-4 bottom-0 size-16 rounded-full bg-white" />
              </div>
              <p className="relative text-[11px] font-semibold tracking-wider opacity-90 font-[family-name:var(--font-outfit)]">
                締切まで
              </p>
              <div className="relative mt-1 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-outfit)] text-4xl font-black">20</span>
                <span className="text-sm font-bold opacity-80">日</span>
                <span className="font-[family-name:var(--font-outfit)] text-xl font-black opacity-60 mx-0.5">:</span>
                <span className="font-[family-name:var(--font-outfit)] text-4xl font-black">10</span>
                <span className="text-sm font-bold opacity-80">時間</span>
              </div>
            </div>

            {/* Entry types */}
            <div className="flex flex-col gap-2">
              <EntryTypeBadge type="normal" active={entryType === "normal"} onClick={() => setEntryType("normal")} />
              <EntryTypeBadge type="welcome" active={entryType === "welcome"} onClick={() => setEntryType("welcome")} />
            </div>
          </div>
        </section>

        {/* Info banner */}
        <section className="mx-auto max-w-[964px] px-4 mt-6">
          <div className="rounded-2xl border border-[rgba(206,250,254,0.5)] bg-gradient-to-r from-[rgba(236,254,255,0.8)] to-[rgba(240,249,255,0.8)] px-5 py-4">
            <div className="flex items-start gap-2">
              <span className="text-primary-dark mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-bold text-primary-dark">予想と翌月再編成の関係</p>
                <p className="text-xs text-muted mt-1">
                  月間3指標（バズ・配信・収支）で土台を作り、月末特番で最終確定。最終順位が翌月のPLAYER/PIT編成を決定します！
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PLAYER 連単予想 */}
        <PredictionSection
          title="PLAYER部門 連単予想"
          titleColor="#007595"
          accentFrom="#00d3f3"
          accentTo="#00bcff"
          slotCount={2}
          candidates={playerMembers}
          selections={playerWin}
          onSelect={makeSelectHandler(playerWin, setPlayerWin)}
          onRemove={makeRemoveHandler(playerWin, setPlayerWin)}
          isLocked={isLocked}
        />

        {/* PLAYER 3連単予想 */}
        <PredictionSection
          title="PLAYER部門 3連単予想"
          titleColor="#007595"
          accentFrom="#00d3f3"
          accentTo="#00bcff"
          slotCount={3}
          candidates={playerMembers}
          selections={playerTri}
          onSelect={makeSelectHandler(playerTri, setPlayerTri)}
          onRemove={makeRemoveHandler(playerTri, setPlayerTri)}
          isLocked={isLocked}
        />

        {/* PIT 連単予想 */}
        <PredictionSection
          title="PIT部門 連単予想"
          titleColor="#bb4d00"
          accentFrom="#ffb900"
          accentTo="#fdc700"
          slotCount={2}
          candidates={pitMembers}
          selections={pitWin}
          onSelect={makeSelectHandler(pitWin, setPitWin)}
          onRemove={makeRemoveHandler(pitWin, setPitWin)}
          isLocked={isLocked}
        />

        {/* PIT 3連単予想 */}
        <PredictionSection
          title="PIT部門 3連単予想"
          titleColor="#bb4d00"
          accentFrom="#ffb900"
          accentTo="#fdc700"
          slotCount={3}
          candidates={pitMembers}
          selections={pitTri}
          onSelect={makeSelectHandler(pitTri, setPitTri)}
          onRemove={makeRemoveHandler(pitTri, setPitTri)}
          isLocked={isLocked}
        />

        {/* Submit */}
        <section className="mx-auto max-w-[964px] px-4 mt-12 text-center">
          {isLocked ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-10 py-3.5 text-base font-bold text-muted">
              🔒 締切済み
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allFilled}
              className={`inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-base font-bold text-white transition-all ${
                allFilled
                  ? "bg-gradient-to-r from-primary to-primary-blue shadow-[0_10px_15px_rgba(83,234,253,0.4)] hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              🎯 予想を提出する →
            </button>
          )}
          {!allFilled && !isLocked && (
            <p className="mt-3 text-xs text-muted">
              全4セクションの予想を完了してから提出できます
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
