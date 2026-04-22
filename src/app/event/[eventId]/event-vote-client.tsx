"use client";

import { useState } from "react";
import Image from "next/image";

type Member = { id: string; name: string; avatarUrl: string };

type Phase = "code-entry" | "voting" | "done";

export function EventVoteClient({
  eventId,
  eventStatus,
  members,
}: {
  eventId: string;
  eventStatus: "draft" | "open" | "closed";
  members: Member[];
}) {
  const [phase, setPhase] = useState<Phase>("code-entry");
  const [code, setCode] = useState("");
  const [codeId, setCodeId] = useState<number | null>(null);
  const [ticketsRemaining, setTicketsRemaining] = useState(0);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votedMembers, setVotedMembers] = useState<string[]>([]);

  async function onValidateCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/public/event-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "validate" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setCodeId(j.codeId);
      setTicketsRemaining(j.ticketsRemaining);
      setTicketsTotal(j.ticketsTotal);
      setBonusMultiplier(j.bonusMultiplier ?? 1);
      setPhase("voting");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onVote(memberId: string) {
    if (ticketsRemaining <= 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/public/event-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, codeId, memberId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setTicketsRemaining(j.ticketsRemaining);
      setVotedMembers((prev) => [...prev, memberId]);
      if (j.ticketsRemaining <= 0) setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? "";

  if (eventStatus !== "open" && phase === "code-entry") {
    return (
      <section className="mx-auto max-w-[720px] px-4 mt-6">
        <div
          className="bg-[#F5F1E8] border-2 border-dashed border-[#111]/40 p-8 text-center"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          <p className="text-3xl mb-3">
            {eventStatus === "closed" ? "🏁" : "⏳"}
          </p>
          <p className="text-sm font-black text-[#111]">
            {eventStatus === "closed"
              ? "投票は締め切られました。ありがとうございました!"
              : "投票はまだ開始されていません。MC のアナウンスをお待ちください。"}
          </p>
        </div>
      </section>
    );
  }

  // Phase: code entry
  if (phase === "code-entry") {
    return (
      <section className="mx-auto max-w-[420px] px-4 mt-6">
        <div
          className="bg-[#F5F1E8] border-2 border-[#111] p-6"
          style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.22)" }}
        >
          <div className="flex items-baseline gap-3 mb-3">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ 投票コード
            </p>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
          <p
            className="text-xs text-[#4A5060] text-center mb-4"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            入場時にお渡しした紙に記載されている 4 桁のコードを入力してください
          </p>
          <form onSubmit={onValidateCode} className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-xl font-black text-[#4A5060] tracking-[0.3em]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                PJ-
              </span>
              <input
                type="text"
                required
                value={code.replace(/^PJ-/i, "")}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(/[^A-Za-z0-9]/g, "")
                    .slice(0, 4);
                  setCode("PJ-" + val);
                }}
                placeholder="XXXX"
                maxLength={4}
                className="w-32 border-2 border-[#111] bg-white px-4 py-3 text-center text-xl font-black tracking-[0.3em] uppercase"
                style={{ fontFamily: "var(--font-outfit)" }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
            </div>
            {error && (
              <p
                className="text-xs text-[#D41E28] text-center font-black"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || code.length < 4}
              className="w-full bg-[#D41E28] text-white px-6 py-3 text-base font-black disabled:opacity-40 transition-transform active:translate-y-0.5"
              style={{
                fontFamily: "var(--font-noto-serif), serif",
                boxShadow: "4px 4px 0 rgba(17,17,17,0.22)",
              }}
            >
              {busy ? "確認中..." : "コードを確認する"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  // Phase: done
  if (phase === "done") {
    return (
      <section className="mx-auto max-w-[420px] px-4 mt-6">
        <div
          className="bg-[#FFE600] border-2 border-[#111] p-8 text-center"
          style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.22)" }}
        >
          <p className="text-5xl mb-3">🎉</p>
          <h2
            className="text-2xl font-black text-[#111] mb-2"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            投票完了!
          </h2>
          <p
            className="text-sm text-[#111] mb-4"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {ticketsTotal} チケット全て使いました。結果発表をお楽しみに!
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {votedMembers.map((mid, i) => (
              <span
                key={i}
                className="bg-white border-2 border-[#111] px-3 py-1 text-xs font-black text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {memberName(mid)}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Phase: voting
  return (
    <section className="mx-auto max-w-[720px] px-4 mt-4">
      {/* Bonus badge */}
      {bonusMultiplier > 1 && (
        <div
          className="bg-[#FFE600] border-2 border-[#D41E28] px-4 py-3 mb-4 text-center"
          style={{ boxShadow: "3px 3px 0 rgba(17,17,17,0.22)" }}
        >
          <span
            className="text-base md:text-lg font-black text-[#D41E28]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            🎯 予想ボーナス {bonusMultiplier}x
          </span>
          <p
            className="text-[10px] text-[#111] mt-0.5"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            順位予想の的中スコアにより投票数が {bonusMultiplier} 倍に
          </p>
        </div>
      )}

      {/* Ticket counter */}
      <div
        className="bg-[#F5F1E8] border-2 border-[#111] p-4 mb-6 text-center"
        style={{ boxShadow: "4px 4px 0 rgba(17,17,17,0.18)" }}
      >
        <p
          className="text-[10px] font-black tracking-[0.3em] text-[#4A5060] mb-2"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          残りチケット
        </p>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {Array.from({ length: ticketsTotal }).map((_, i) => (
            <span
              key={i}
              className={`inline-flex size-9 items-center justify-center text-lg transition-all ${
                i < ticketsRemaining
                  ? "bg-[#D41E28] text-white"
                  : "bg-[#F5F1E8] text-[#4A5060]/40 border border-[#111]/20"
              }`}
            >
              🎟️
            </span>
          ))}
        </div>
        <p
          className="mt-2 text-base font-black text-[#111]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {ticketsRemaining} / {ticketsTotal}
        </p>
      </div>

      {error && (
        <p
          className="mb-3 bg-[#FFE600] border-l-4 border-[#D41E28] px-3 py-2 text-xs text-[#111] font-black"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {error}
        </p>
      )}

      {/* Member selection */}
      <p
        className="text-xs font-black text-[#4A5060] mb-3 text-center tracking-wider"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        応援したいメンバーをタップしてください
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onVote(m.id)}
            disabled={busy || ticketsRemaining <= 0}
            className="flex flex-col items-center gap-2 bg-[#F5F1E8] border-2 border-[#111] p-4 transition-transform active:translate-y-0.5 hover:bg-[#FFE600] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              boxShadow: "3px 3px 0 rgba(17,17,17,0.18)",
              fontFamily: "var(--font-noto-serif), serif",
            }}
          >
            <Image
              src={m.avatarUrl}
              alt={m.name}
              width={64}
              height={64}
              className="size-16 object-cover object-top border-2 border-[#111]"
            />
            <p className="text-xs font-black text-[#111] text-center">
              {m.name}
            </p>
          </button>
        ))}
      </div>

      {/* Voted history */}
      {votedMembers.length > 0 && (
        <div className="mt-6 text-center">
          <p
            className="text-[10px] font-black tracking-[0.3em] text-[#4A5060] mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            投票済み
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {votedMembers.map((mid, i) => (
              <span
                key={i}
                className="bg-[#D41E28] text-white border-2 border-[#111] px-2.5 py-1 text-[11px] font-black"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {memberName(mid)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
