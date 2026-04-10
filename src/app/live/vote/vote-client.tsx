"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PublicMember = {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  role: "PLAYER" | "PIT";
};

type TallyRow = {
  memberId: string;
  memberName: string;
  slug: string | null;
  avatarUrl: string | null;
  count: number;
};

type Tally = {
  voteDate: string;
  totalVotes: number;
  rows: TallyRow[];
};

type MyVote = { memberId: string } | null;

function MemberVoteCard({
  member,
  selected,
  disabled,
  onSelect,
}: {
  member: PublicMember;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
        selected
          ? "bg-gradient-to-b from-[#fef2f2] to-white ring-2 ring-live shadow-md scale-[1.03]"
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
          <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-live text-white text-xs shadow-md">
            ✓
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-foreground text-center">
        {member.name}
      </p>
      <span
        className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
          member.role === "PLAYER"
            ? "bg-gradient-to-r from-player to-player-end"
            : "bg-gradient-to-r from-pit to-pit-end"
        }`}
      >
        {member.role}
      </span>
    </button>
  );
}

export function VoteClient({ members }: { members: PublicMember[] }) {
  const [myVote, setMyVote] = useState<MyVote>(null);
  const [tally, setTally] = useState<Tally | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/public/live-vote", { cache: "no-store" });
      const j = await res.json();
      setTally(j.tally);
      setMyVote(j.myVote);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function vote(memberId: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/live-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setTally(j.tally);
      setMyVote(j.myVote);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  const maxCount = Math.max(...(tally?.rows.map((r) => r.count) ?? [0]), 1);

  return (
    <>
      {/* Member grid */}
      <section className="mx-auto max-w-[964px] px-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-live to-[#fb64b6]" />
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-extrabold text-[#e7000b] tracking-tight">
            👥 投票するメンバーを選ぶ
          </h2>
        </div>

        {myVote && (
          <p className="mb-3 rounded-lg bg-live/10 border border-live/30 px-3 py-2 text-xs text-[#e7000b]">
            ✓ すでに投票済みです。違うメンバーを選ぶと上書きされます。
          </p>
        )}

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            エラー: {error}
          </p>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {members.map((m) => (
            <MemberVoteCard
              key={m.id}
              member={m}
              selected={myVote?.memberId === m.id}
              disabled={submitting}
              onSelect={() => vote(m.id)}
            />
          ))}
        </div>
      </section>

      {/* Tally */}
      <section className="mx-auto max-w-[964px] px-4 mt-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-extrabold text-primary-dark tracking-tight">
            📊 今日の集計{" "}
            {tally && (
              <span className="text-xs font-normal text-muted">
                （{tally.totalVotes.toLocaleString()} 票 · {tally.voteDate}）
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <p className="text-xs text-muted">読み込み中...</p>
        ) : !tally || tally.rows.length === 0 ? (
          <p className="text-xs text-muted">
            まだ投票がありません。最初の 1票になろう！
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tally.rows.map((r, i) => {
              const pct = (r.count / maxCount) * 100;
              return (
                <li
                  key={r.memberId}
                  className="rounded-2xl bg-white/70 border border-white/80 p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-[family-name:var(--font-outfit)] text-sm font-extrabold text-[#0092b8]">
                      {i + 1}
                    </span>
                    {r.avatarUrl && (
                      <Image
                        src={r.avatarUrl}
                        alt={r.memberName}
                        width={36}
                        height={36}
                        className="size-9 shrink-0 rounded-full object-cover object-top shadow-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {r.memberName}
                      </p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-live to-[#fb64b6] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-[family-name:var(--font-outfit)] text-sm font-black text-foreground w-12 text-right">
                      {r.count.toLocaleString()}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-3 text-[10px] text-muted">
          ※ 15秒ごとに自動更新 / 匿名 Cookie で1人1日1票
        </p>
      </section>
    </>
  );
}
