"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { members, type Member } from "@/lib/data";

type VoteState = "not-checked-in" | "ready" | "voted" | "closed";

function MemberVoteCard({
  member,
  selected,
  disabled,
  onSelect,
}: {
  member: Member;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
        selected
          ? "bg-gradient-to-b from-[#ecfeff] to-white ring-2 ring-primary shadow-md scale-[1.03]"
          : disabled
          ? "opacity-40 cursor-not-allowed"
          : "bg-white/50 hover:bg-white hover:shadow-sm cursor-pointer"
      }`}
    >
      <div className="relative">
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={64}
          height={64}
          className="size-16 rounded-full object-cover object-top shadow-sm"
        />
        {selected && (
          <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-white text-xs shadow-md">
            ✓
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-foreground">{member.name}</p>
    </button>
  );
}

export default function LiveVotePage() {
  const [state, setState] = useState<VoteState>("not-checked-in");
  const [playerVote, setPlayerVote] = useState<Member | null>(null);
  const [pitVote, setPitVote] = useState<Member | null>(null);

  const playerMembers = members.filter((m) => m.role === "PLAYER");
  const pitMembers = members.filter((m) => m.role === "PIT");

  const canVote = state === "ready";
  const bothSelected = playerVote !== null && pitVote !== null;

  function handleCheckIn() {
    console.log("Check-in triggered");
    setState("ready");
  }

  function handleSubmitVote() {
    if (!playerVote || !pitVote) return;
    const payload = {
      playerVote: playerVote.slug,
      pitVote: pitVote.slug,
      timestamp: new Date().toISOString(),
    };
    console.log("Vote submitted:", payload);
    setState("voted");
  }

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Special Hero */}
        <section
          className="relative overflow-hidden pt-8 pb-10 text-center"
          style={{
            backgroundImage: "linear-gradient(165deg, #0c1a3a 0%, #1a1a2e 40%, #2d1b4e 100%)",
          }}
        >
          {/* Decorative */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-[10%] top-[20%] size-32 rounded-full bg-primary blur-[60px]" />
            <div className="absolute right-[15%] top-[30%] size-24 rounded-full bg-purple blur-[50px]" />
            <div className="absolute left-[50%] bottom-0 size-40 rounded-full bg-primary-blue blur-[80px]" />
          </div>

          <div className="relative">
            <span className="inline-block rounded-full bg-gradient-to-r from-live to-live-end px-4 py-1 text-[11px] font-bold text-white tracking-widest shadow-lg font-[family-name:var(--font-outfit)] mb-4">
              LIVE DAY SPECIAL
            </span>
            <p className="text-4xl mb-3">🎤</p>
            <h1 className="text-2xl font-extrabold text-white">
              本日の現地応援投票
            </h1>
            <p className="mt-2 text-sm text-white/60">
              会場からリアルに。今日の1票が特別ポイントに直結。
            </p>
          </div>
        </section>

        {/* Event Info */}
        <section className="mx-auto max-w-[600px] px-4 -mt-6 relative z-10">
          <div className="rounded-2xl bg-white border border-white/80 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-foreground">Project P LIVE STAGE #12</h2>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                品川ステラボール
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                投票 15:00〜21:00
              </span>
            </div>

            {/* Time progress */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-muted font-[family-name:var(--font-outfit)] mb-1">
                <span>15:00</span>
                <span className="font-bold text-primary-dark">NOW</span>
                <span>21:00</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-blue transition-all"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Check-in */}
        <section className="mx-auto max-w-[600px] px-4 mt-6">
          <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-sm font-bold text-foreground">チェックイン</p>
                  <p className="text-[11px] text-muted">
                    {state === "not-checked-in"
                      ? "会場に到着したらチェックインしてください"
                      : "チェックイン完了 — 投票可能です"}
                  </p>
                </div>
              </div>

              {state === "not-checked-in" ? (
                <button
                  onClick={handleCheckIn}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_10px_rgba(83,234,253,0.3)] hover:shadow-[0_4px_15px_rgba(83,234,253,0.4)] transition-all"
                >
                  チェックイン
                </button>
              ) : (
                <div className="flex items-center gap-1.5 rounded-xl bg-[#d0fae5] px-4 py-2.5 text-sm font-bold text-[#007a55]">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  完了
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Special point notice */}
        <section className="mx-auto max-w-[600px] px-4 mt-4">
          <div className="rounded-2xl border border-[rgba(255,226,226,0.5)] bg-gradient-to-r from-[rgba(254,242,242,0.8)] to-[rgba(253,242,248,0.8)] px-5 py-4">
            <div className="flex items-start gap-2">
              <span className="text-lg mt-[-2px]">⚡</span>
              <div>
                <p className="text-sm font-bold text-[#e7000b]">今日の応援は特別ポイント</p>
                <p className="text-xs text-muted mt-1">
                  ライブ当日の投票は通常の月間指標とは別に特別ポイントとして加算されます。ライブ会場からの1票が直接月末のランキングに影響します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Voted confirmation */}
        {state === "voted" && (
          <section className="mx-auto max-w-[600px] px-4 mt-8">
            <div className="rounded-2xl bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] border border-primary/20 p-6 text-center shadow-sm">
              <p className="text-4xl mb-2">🎉</p>
              <h3 className="text-lg font-bold text-primary-dark">投票完了！</h3>
              <p className="text-sm text-muted mt-1">
                あなたの応援は特別ポイントとして反映されます
              </p>
              <div className="mt-4 flex items-center justify-center gap-6">
                {playerVote && (
                  <div className="flex flex-col items-center gap-1">
                    <Image src={playerVote.avatarUrl} alt={playerVote.name} width={48} height={48} className="size-12 rounded-full object-cover object-top shadow-sm ring-2 ring-primary" />
                    <p className="text-xs font-bold text-foreground">{playerVote.name}</p>
                    <span className="text-[10px] font-bold text-player font-[family-name:var(--font-outfit)]">PLAYER</span>
                  </div>
                )}
                <span className="text-2xl text-muted">×</span>
                {pitVote && (
                  <div className="flex flex-col items-center gap-1">
                    <Image src={pitVote.avatarUrl} alt={pitVote.name} width={48} height={48} className="size-12 rounded-full object-cover object-top shadow-sm ring-2 ring-pit" />
                    <p className="text-xs font-bold text-foreground">{pitVote.name}</p>
                    <span className="text-[10px] font-bold text-pit font-[family-name:var(--font-outfit)]">PIT</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Closed state */}
        {state === "closed" && (
          <section className="mx-auto max-w-[600px] px-4 mt-8">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center">
              <p className="text-3xl mb-2">🔒</p>
              <h3 className="text-lg font-bold text-muted">投票は締め切りました</h3>
              <p className="text-sm text-muted mt-1">結果は月末特番にて発表されます</p>
            </div>
          </section>
        )}

        {/* PLAYER Vote */}
        {state !== "voted" && state !== "closed" && (
          <>
            <section className="mx-auto max-w-[600px] px-4 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
                <h2 className="text-base font-extrabold text-primary-dark">
                  PLAYERに1票
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {playerMembers.map((member) => (
                  <MemberVoteCard
                    key={member.id}
                    member={member}
                    selected={playerVote?.id === member.id}
                    disabled={!canVote}
                    onSelect={() => canVote && setPlayerVote(member)}
                  />
                ))}
              </div>
            </section>

            {/* PIT Vote */}
            <section className="mx-auto max-w-[600px] px-4 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-pit to-[#fdc700]" />
                <h2 className="text-base font-extrabold text-[#bb4d00]">
                  PITに1票
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {pitMembers.map((member) => (
                  <MemberVoteCard
                    key={member.id}
                    member={member}
                    selected={pitVote?.id === member.id}
                    disabled={!canVote}
                    onSelect={() => canVote && setPitVote(member)}
                  />
                ))}
              </div>
            </section>

            {/* Submit */}
            <section className="mx-auto max-w-[600px] px-4 mt-8 text-center">
              <button
                onClick={handleSubmitVote}
                disabled={!canVote || !bothSelected}
                className={`inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-base font-bold text-white transition-all ${
                  canVote && bothSelected
                    ? "bg-gradient-to-r from-live to-[#fb64b6] shadow-[0_10px_15px_rgba(255,100,103,0.3)] hover:shadow-[0_10px_20px_rgba(255,100,103,0.4)]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                💖 投票する →
              </button>
              {canVote && !bothSelected && (
                <p className="mt-3 text-xs text-muted">PLAYER・PIT から各1名を選んでください</p>
              )}
              {!canVote && state === "not-checked-in" && (
                <p className="mt-3 text-xs text-muted">先にチェックインを完了してください</p>
              )}
            </section>
          </>
        )}

        {/* Notes */}
        <section className="mx-auto max-w-[600px] px-4 mt-10">
          <div className="rounded-2xl bg-gray-50/80 px-5 py-4 text-[11px] text-muted leading-relaxed">
            <p className="font-bold text-foreground text-xs mb-2">📋 注意事項</p>
            <ul className="list-disc list-inside space-y-1">
              <li>ライブ当日1回のみ投票できます</li>
              <li>PLAYERとPITそれぞれ1名ずつ選んでください</li>
              <li>投票結果は「LIVE DAY SPECIAL」として月間ランキングに加算されます</li>
              <li>チェックインは会場内でのみ可能です</li>
              <li>不正なチェックインが検出された場合、投票は無効となります</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
