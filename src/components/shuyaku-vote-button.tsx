"use client";

import { useEffect, useRef, useState, useTransition } from "react";

export interface ShuyakuVoteButtonProps {
  memberId: string;
  memberName: string;
  /** 表示モード */
  size?: "sm" | "md";
  /** ルール説明文を併記するか (md size のみ表示) */
  showRule?: boolean;
  /** 親幅にフィットさせる (列を揃える時) */
  fullWidth?: boolean;
  /** モバイル向け正方形コンパクトモード */
  compact?: boolean;
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]; // d6

/**
 * 「主役指名」 サイコロを振って 1〜6 票を入れる人気投票ボタン。
 * - サイコロ値はサーバーが決める (クライアントは出目を決めない)
 * - クリック → サイコロアニメ → サーバーから出た値を表示
 * - 既に今日指名済みなら disabled + 過去の出目を表示
 *
 * レイアウト方針:
 * - ボタン本体は voted 前後で同一寸法 (行高がブレない)
 * - 結果メッセージは行内に出さない (色の変化で状態を伝える)
 * - 「また明日復活」等の補足はセクション側で説明する
 */
export function ShuyakuVoteButton({
  memberId,
  memberName,
  size = "md",
  showRule = true,
  fullWidth = false,
  compact = false,
}: ShuyakuVoteButtonProps) {
  const [voted, setVoted] = useState<boolean>(false);
  const [resultValue, setResultValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollFace, setRollFace] = useState(0);
  const [, startTransition] = useTransition();
  const [posting, setPosting] = useState(false);
  const animTimer = useRef<number | null>(null);

  // 初回: 今日の指名済みを取得
  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/shuyaku-vote", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list: { memberId: string; value: number }[] = Array.isArray(
          d?.votedToday,
        )
          ? d.votedToday
          : [];
        const mine = list.find((v) => v.memberId === memberId);
        if (mine) {
          setVoted(true);
          setResultValue(mine.value);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (animTimer.current) window.clearInterval(animTimer.current);
    };
  }, [memberId]);

  const startRollAnim = () => {
    setRolling(true);
    animTimer.current = window.setInterval(() => {
      setRollFace((f) => (f + 1) % 6);
    }, 70);
  };
  const stopRollAnim = (final: number) => {
    if (animTimer.current) {
      window.clearInterval(animTimer.current);
      animTimer.current = null;
    }
    setRollFace(final - 1);
    setRolling(false);
  };

  const handleClick = () => {
    if (voted || posting || rolling) return;
    setPosting(true);
    startRollAnim();
    const startedAt = Date.now();
    startTransition(async () => {
      try {
        const r = await fetch("/api/public/shuyaku-vote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ memberId }),
        });

        // 演出のため 最低 700ms はサイコロを回す
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, 700 - elapsed);
        await new Promise((res) => setTimeout(res, wait));

        if (r.ok) {
          const j = await r.json();
          const v = Number(j?.value);
          if (Number.isInteger(v) && v >= 1 && v <= 6) {
            stopRollAnim(v);
            setVoted(true);
            setResultValue(v);
          } else {
            stopRollAnim(1);
          }
        } else {
          const j = await r.json().catch(() => ({}));
          stopRollAnim(rollFace + 1);
          if (j?.code === "already_voted_today") {
            setVoted(true);
          }
        }
      } catch {
        stopRollAnim(rollFace + 1);
      } finally {
        setPosting(false);
      }
    });
  };

  const displayFace = voted && resultValue ? resultValue - 1 : rollFace;

  // ====== モバイル/コンパクト: 正方形ダイス + 上にラベル ======
  if (compact) {
    const topLabel = rolling
      ? "振っています…"
      : voted && resultValue
        ? `✓ ${resultValue} 票で投票済み`
        : "押して投票";

    return (
      <div className="inline-flex flex-col items-center gap-1 select-none">
        <span
          className="text-[9px] font-black tracking-wide text-[#4A5060] whitespace-nowrap leading-none"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
          aria-hidden
        >
          {topLabel}
        </span>
        <button
          type="button"
          onClick={handleClick}
          disabled={voted || posting || rolling}
          aria-pressed={voted}
          aria-label={
            voted
              ? `${memberName} に ${resultValue} 票で投票済み`
              : `${memberName} を主役に指名する (サイコロを振る)`
          }
          className="relative flex items-center justify-center w-12 h-12 disabled:cursor-not-allowed transition-transform active:translate-y-0.5"
          style={{
            backgroundColor: voted ? "#111111" : "#D41E28",
            boxShadow: voted
              ? "3px 3px 0 rgba(17,17,17,0.25)"
              : "3px 3px 0 rgba(17,17,17,0.22)",
            opacity: posting && !rolling ? 0.6 : 1,
          }}
        >
          <span
            className="text-3xl leading-none"
            style={{
              color: voted ? "#FFE600" : "#FFFFFF",
              transform: rolling ? "rotate(15deg)" : "rotate(0deg)",
              transition: rolling ? "none" : "transform 200ms ease",
              textShadow: "1px 1px 0 rgba(0,0,0,0.25)",
              marginTop: "-2px",
            }}
            aria-hidden
          >
            {DICE_FACES[displayFace]}
          </span>
        </button>
      </div>
    );
  }

  // ====== デスクトップ: 横長ボタン (ラベル付き) ======
  const sm = size === "sm";
  const dicePx = sm ? "text-3xl" : "text-5xl";
  const labelText = sm ? "text-xs md:text-sm" : "text-sm md:text-base";
  const padding = sm ? "px-3 py-2" : "px-4 py-3";

  const wrapperCls = fullWidth
    ? "flex flex-col items-start gap-1.5 w-full"
    : "inline-flex flex-col items-start gap-1.5";
  const buttonCls = fullWidth
    ? "flex w-full items-center justify-start gap-3"
    : "inline-flex items-center gap-3";

  return (
    <div className={wrapperCls}>
      <button
        type="button"
        onClick={handleClick}
        disabled={voted || posting || rolling}
        aria-pressed={voted}
        aria-label={
          voted
            ? `${memberName} に ${resultValue} 票で投票済み`
            : `${memberName} を主役に指名する (サイコロを振る)`
        }
        className={`group relative ${buttonCls} ${padding} font-black ${labelText} tracking-wide transition-transform active:translate-y-0.5 disabled:cursor-not-allowed`}
        style={{
          backgroundColor: voted ? "#111111" : "#D41E28",
          color: voted ? "#FFE600" : "#FFFFFF",
          boxShadow: voted
            ? "3px 3px 0 rgba(17,17,17,0.25)"
            : "4px 4px 0 rgba(17,17,17,0.22)",
          fontFamily: "var(--font-noto-serif), serif",
          opacity: posting && !rolling ? 0.6 : 1,
        }}
      >
        <span
          className={`${dicePx} leading-none select-none`}
          style={{
            color: voted ? "#FFE600" : "#FFFFFF",
            display: "inline-block",
            transform: rolling ? "rotate(15deg)" : "rotate(0deg)",
            transition: rolling ? "none" : "transform 200ms ease",
            textShadow: "2px 2px 0 rgba(0,0,0,0.3)",
          }}
          aria-hidden
        >
          {DICE_FACES[displayFace]}
        </span>

        <span className="flex flex-col items-start leading-tight">
          {voted && resultValue ? (
            <>
              <span className="text-[10px] tracking-[0.25em] opacity-80">
                INDICATED
              </span>
              <span>{resultValue} 票で投票済み</span>
            </>
          ) : rolling ? (
            <>
              <span className="text-[10px] tracking-[0.25em] opacity-80">
                ROLLING…
              </span>
              <span>振っています</span>
            </>
          ) : (
            <>
              <span className="text-[10px] tracking-[0.25em] opacity-80">
                ROLL THE DIE
              </span>
              <span>この子を主役に。</span>
            </>
          )}
        </span>
      </button>

      {/* 投票前 + showRule=true 時のみ: 1 日 1 回ルールをさりげなく */}
      {showRule && !voted && (
        <p
          className="text-[10px] md:text-[11px] text-[#4A5060]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          ※ 同じ人には 1 日 1 回まで。明日 0:00 にサイコロが復活。
        </p>
      )}
    </div>
  );
}
