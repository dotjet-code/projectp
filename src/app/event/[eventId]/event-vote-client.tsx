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
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-3xl mb-3">
            {eventStatus === "closed" ? "🏁" : "⏳"}
          </p>
          <p className="text-sm font-bold text-foreground">
            {eventStatus === "closed"
              ? "投票は締め切られました。ありがとうございました！"
              : "投票はまだ開始されていません。MCのアナウンスをお待ちください。"}
          </p>
        </div>
      </section>
    );
  }

  // Phase: code entry
  if (phase === "code-entry") {
    return (
      <section className="mx-auto max-w-[420px] px-4 mt-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-bold text-foreground text-center mb-4">
            投票コードを入力してください
          </h2>
          <p className="text-xs text-muted text-center mb-4">
            入場時にお渡しした紙に記載されているコードを入力してください
          </p>
          <form onSubmit={onValidateCode} className="space-y-4">
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PJ-XXXX"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl font-[family-name:var(--font-outfit)] font-bold tracking-[0.3em] uppercase"
              autoComplete="off"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy || code.length < 4}
              className="w-full rounded-full bg-gradient-to-r from-live to-[#fb64b6] px-6 py-3 text-base font-bold text-white shadow-[0_10px_15px_rgba(255,100,103,0.3)] disabled:opacity-40 transition-all"
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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="text-xl font-bold text-foreground mb-2">
            投票完了！
          </h2>
          <p className="text-sm text-muted mb-4">
            {ticketsTotal} チケット全て使いました。結果発表をお楽しみに！
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {votedMembers.map((mid, i) => (
              <span
                key={i}
                className="rounded-full bg-white border border-emerald-200 px-3 py-1 text-xs font-bold text-foreground"
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
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-3 mb-4 text-center">
          <span className="text-lg font-black text-amber-700">
            🎯 予想ボーナス {bonusMultiplier}x
          </span>
          <p className="text-[10px] text-amber-700 mt-0.5">
            順位予想の的中スコアにより投票数が {bonusMultiplier} 倍になりました
          </p>
        </div>
      )}

      {/* Ticket counter */}
      <div className="rounded-2xl bg-gradient-to-r from-live/10 to-[#fb64b6]/10 border border-live/20 p-4 mb-6 text-center">
        <p className="text-xs font-bold text-muted mb-1">残りチケット</p>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: ticketsTotal }).map((_, i) => (
            <span
              key={i}
              className={`inline-flex size-10 items-center justify-center rounded-full text-lg transition-all ${
                i < ticketsRemaining
                  ? "bg-gradient-to-r from-live to-[#fb64b6] text-white shadow-md scale-110"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              🎟️
            </span>
          ))}
        </div>
        <p className="mt-2 text-sm font-bold text-foreground">
          {ticketsRemaining} / {ticketsTotal}
        </p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 text-center">
          {error}
        </p>
      )}

      {/* Member selection */}
      <p className="text-xs font-bold text-muted mb-3 text-center">
        応援したいメンバーをタップしてください
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onVote(m.id)}
            disabled={busy || ticketsRemaining <= 0}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 border border-white/80 p-4 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Image
              src={m.avatarUrl}
              alt={m.name}
              width={64}
              height={64}
              className="size-16 rounded-full object-cover object-top shadow-sm"
            />
            <p className="text-xs font-bold text-foreground text-center">
              {m.name}
            </p>
          </button>
        ))}
      </div>

      {/* Voted history */}
      {votedMembers.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold text-muted mb-2">投票済み</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {votedMembers.map((mid, i) => (
              <span
                key={i}
                className="rounded-full bg-live/10 border border-live/20 px-2.5 py-1 text-[11px] font-bold text-[#e7000b]"
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
