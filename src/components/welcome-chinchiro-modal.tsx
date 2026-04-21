"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { StreakBadge, getStreakTier } from "@/components/streak-badge";

/**
 * 「今日の賽」ウェルカムポップアップ (チンチロ式ボーナス票) ベスト版。
 *
 * - 1 日 1 回。振っていなければ自動で開く。
 * - メンバーから 1 人選ぶ → 3 個サイコロが回転 → 役と票数が表示される。
 * - ピンゾロ 100 票、ヒフミは全員に 1 票ずつお裾分け。
 * - 連続日数 (streak) 表示、シェアで +1 票報酬、判子演出付き。
 * - スキップ不可 (閉じるは結果確定後のみ)。a11y のため ESC は閉じない。
 */
export interface ChinchiroMember {
  id: string;             // supabase uuid
  name: string;
  avatarUrl: string;
  rank: number;
}

interface Props {
  members: ChinchiroMember[];
}

type Phase =
  | "idle"       // まだ誰も選んでいない
  | "rolling"    // サイコロ回転中 (API 待ち)
  | "result"     // 結果表示
  | "done";      // 閉じた後の余韻 (次訪問まで非表示)

/**
 * 白地に黒ピップのサイコロ面。value は 1-6。
 * 日本のサイコロ慣習で、1 の目だけは赤にする。
 * 3x3 グリッド上の位置に丸を配置する (伝統的なサイコロ目の配置)。
 */
function DiceFace({ value }: { value: number }) {
  // 3x3 セル (1..9) の pip 位置:
  //   1 2 3
  //   4 5 6
  //   7 8 9
  const pipsByValue: Record<number, number[]> = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };
  const pips = new Set(pipsByValue[value] ?? []);
  // 1 の目だけ赤 (日本の伝統的な色使い)。それ以外は黒。
  const pipColor = value === 1 ? "#D41E28" : "#111111";
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1.5 gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
        <div key={pos} className="flex items-center justify-center">
          {pips.has(pos) && (
            <span
              className={`rounded-full ${value === 1 ? "w-3.5 h-3.5" : "w-2 h-2"}`}
              style={{ backgroundColor: pipColor }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const HAND_COLOR: Record<string, { bg: string; fg: string }> = {
  pinzoro:  { bg: "#FFE600", fg: "#111111" },
  zorome:   { bg: "#D41E28", fg: "#FFFFFF" },
  shigoro:  { bg: "#1CB4AF", fg: "#FFFFFF" },
  normal:   { bg: "#F5F1E8", fg: "#111111" },
  hifumi:   { bg: "#4A5060", fg: "#F5F1E8" },
  menashi:  { bg: "#4A5060", fg: "#F5F1E8" },
};

/**
 * ピンゾロ / シゴロ / ゾロ目 時に押す判子の字 (2文字熟語)。
 * SNS スクショで "これ何?" と二度見させる強度を狙う。
 */
const STAMP_CHARS: Record<string, string> = {
  pinzoro: "神引",
  shigoro: "躍進",
  zorome:  "三揃",
};

/** シェアで +票の対象役 (特別な役だけ公式インセンティブを付ける) */
const SHAREABLE_HANDS = new Set(["pinzoro", "shigoro", "zorome"]);

/**
 * 役ごとに冴えた SNS シェア文言を生成。
 * 改行 + ハッシュタグは X 上で映える形式に統一。
 */
function buildShareText(args: {
  name: string;
  handKey: string;
  handLabel: string;
  dice: [number, number, number];
  value: number;
  totalValue: number;
  streakDays: number;
}): string {
  const { name, handKey, dice, value, totalValue, streakDays } = args;
  const TAG = "#かけあがりの賽";
  const streak = streakDays >= 3 ? `\n連続 ${streakDays} 日目。` : "";

  switch (handKey) {
    case "pinzoro":
      return `🎲 ピンゾロ引いた。\n1/216 の奇跡、ぜんぶ ${name} に捧ぐ。\n${totalValue} 票、盛大に積んだ。${streak}\n${TAG}`;
    case "shigoro":
      return `🎲 シゴロきた。4-5-6 の勝ち筋、\n${name} に ${totalValue} 票、一段跳ね。${streak}\n${TAG}`;
    case "zorome":
      return `🎲 ${dice.join("-")} 揃った。\nゾロ目の ${totalValue} 票、${name} に雷落とす。${streak}\n${TAG}`;
    case "normal":
      return `🎲 今日の目は ${value}。\n迷わず ${name} に、${totalValue} 票。${streak}\n${TAG}`;
    case "hifumi":
      return `🎲 ヒフミ。全員に 1 票ずつお裾分け。\n推しも対抗馬も、平等に押し上げた。${streak}\n${TAG}`;
    case "menashi":
      return `🎲 目なし 2 連発。\nそれでも ${name} に 1 票、粘り切った。${streak}\n${TAG}`;
    default:
      return `🎲 ${name} に ${totalValue} 票、賽で決めた。${streak}\n${TAG}`;
  }
}

export function WelcomeChinchiroModal({ members }: Props) {
  // マウント完了フラグ。クライアント専用 UI を SSR 時に出さないことで
  // hydration mismatch を完全に回避する。
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [picked, setPicked] = useState<ChinchiroMember | null>(null);
  const [rollFaces, setRollFaces] = useState<[number, number, number]>([0, 0, 0]);
  const [finalDice, setFinalDice] = useState<[number, number, number] | null>(null);
  const [handLabel, setHandLabel] = useState<string>("");
  const [handKey, setHandKey] = useState<string>("normal");
  const [voteValue, setVoteValue] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [shareClaimed, setShareClaimed] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [forceOpen, setForceOpen] = useState<boolean>(false);
  // DEV: 次に振る役を予約する。null の時は通常ランダム。
  const [devQueuedHand, setDevQueuedHand] = useState<string | null>(null);
  const animRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // 本日既に振っている場合に、その結果を復元する共通処理。
  // 手動 open (CTA 経由) / 自動 open どちらでも、振り終えていれば結果画面を表示する。
  const restoreTodayRoll = (d: {
    rolledToday?: {
      hand?: string;
      handLabel?: string;
      dice?: number[];
      pickedMemberId?: string;
      totalValue?: number;
      streakDays?: number;
      sharedAt?: string | null;
    } | null;
  }) => {
    const r = d?.rolledToday;
    if (!r || !r.dice || r.dice.length !== 3) return false;
    const dice: [number, number, number] = [
      r.dice[0] ?? 1,
      r.dice[1] ?? 1,
      r.dice[2] ?? 1,
    ];
    const foundMember =
      members.find((m) => m.id === r.pickedMemberId) ?? null;
    if (foundMember) setPicked(foundMember);
    setFinalDice(dice);
    setHandKey((r.hand as string) ?? "normal");
    setHandLabel(r.handLabel ?? "");
    setVoteValue(r.totalValue ?? 0);
    setTotalValue(r.totalValue ?? 0);
    setStreakDays(r.streakDays ?? 1);
    setShareClaimed(Boolean(r.sharedAt));
    setPhase("result");
    return true;
  };

  // 初回: 今日振ってなければ 500ms 後に表示
  // ?chinchiro=1 で強制表示 (モバイル等の疎通確認用)
  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("chinchiro") === "1") {
      setForceOpen(true);
      setOpen(true);
      return;
    }
    fetch("/api/public/shuyaku-vote/chinchiro", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setDevMode(Boolean(d?.devAlwaysOpen));
        if (!d?.rolledToday) {
          setTimeout(() => !cancelled && setOpen(true), 500);
        } else {
          // 既に振っている → 結果を復元しておく (手動 open 時に活用)
          restoreTodayRoll(d);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };

  }, []);

  // 任意の場所から window 経由で手動オープン可能にする (上部 CTA など)
  useEffect(() => {
    const onOpen = async () => {
      // idle で finalDice も無いとき = まだ一度も振っていない可能性。サーバに確認。
      // done (閉じた後) に再オープンされた場合も finalDice が残っていれば result に戻す。
      if (phase !== "result" && phase !== "rolling") {
        if (finalDice && picked) {
          // セッション内で振り終えて閉じた → 状態は残っているので result に戻す
          setPhase("result");
        } else {
          // state が空 = まだ振ってない or ページ再読込後。サーバで確認し、あれば復元
          try {
            const r = await fetch("/api/public/shuyaku-vote/chinchiro", {
              cache: "no-store",
            });
            const d = await r.json();
            restoreTodayRoll(d);
          } catch {
            // ignore
          }
        }
      }
      setOpen(true);
    };
    window.addEventListener("chinchiro:open", onOpen);
    return () => window.removeEventListener("chinchiro:open", onOpen);

  }, [phase, finalDice, picked]);

  // フォーカストラップ + ESC 無効化 (スキップ不可)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const startRollAnim = () => {
    if (animRef.current) window.clearInterval(animRef.current);
    animRef.current = window.setInterval(() => {
      setRollFaces([
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
      ]);
    }, 70);
  };

  const stopRollAnim = (finalValues: [number, number, number]) => {
    if (animRef.current) {
      window.clearInterval(animRef.current);
      animRef.current = null;
    }
    setRollFaces([finalValues[0] - 1, finalValues[1] - 1, finalValues[2] - 1]);
  };

  const handlePick = async (m: ChinchiroMember, forceHandOverride?: string) => {
    if (phase !== "idle") return;
    const forceHand = forceHandOverride ?? devQueuedHand ?? undefined;
    setPicked(m);
    setPhase("rolling");
    setErrorMsg(null);
    startRollAnim();
    const startedAt = Date.now();
    try {
      const r = await fetch("/api/public/shuyaku-vote/chinchiro", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          forceHand ? { memberId: m.id, forceHand } : { memberId: m.id },
        ),
      });
      const elapsed = Date.now() - startedAt;
      // 演出のため最低 1400ms は回す
      const wait = Math.max(0, 1400 - elapsed);
      await new Promise((res) => setTimeout(res, wait));

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        stopRollAnim([1, 1, 1]);
        setErrorMsg(j?.error ?? "エラーが発生しました");
        setPhase("result");
        return;
      }
      const j = await r.json();
      const dice = j.dice as [number, number, number];
      setFinalDice(dice);
      setHandLabel(j.handLabel as string);
      setHandKey(j.hand as string);
      setVoteValue(j.value as number);
      setTotalValue((j.totalValue as number) ?? (j.value as number));
      setStreakDays((j.streakDays as number) ?? 1);
      stopRollAnim(dice);
      setPhase("result");
    } catch {
      stopRollAnim([1, 1, 1]);
      setErrorMsg("通信エラー");
      setPhase("result");
    }
  };

  const handleShare = async (platform: "x" | "line" = "x") => {
    if (!picked || !finalDice) return;
    setShareError(null);

    const name = picked.name;
    const text = buildShareText({
      name,
      handKey,
      handLabel,
      dice: finalDice,
      value: voteValue,
      totalValue,
      streakDays,
    });
    const ogUrl = `/api/og/chinchiro?hand=${handKey}&value=${totalValue}&name=${encodeURIComponent(
      name,
    )}&d1=${finalDice[0]}&d2=${finalDice[1]}&d3=${finalDice[2]}`;
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${ogUrl}`
        : ogUrl;
    const shareUrl =
      platform === "line"
        ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}`
        : `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");

    // サーバに 役と同額の +N 票報酬を要求 (1 回のみ成功)
    try {
      const r = await fetch("/api/public/shuyaku-vote/chinchiro/share", {
        method: "POST",
      });
      if (r.ok) {
        const j = await r.json();
        setShareClaimed(true);
        if (!j.addedVote) {
          setShareError("既に受け取り済みの報酬です");
        }
      } else {
        setShareError("報酬付与に失敗しました");
      }
    } catch {
      setShareError("通信エラーで報酬が付与できませんでした");
    }
  };

  const handleClose = () => {
    setPhase("done");
    setOpen(false);
    // モーダル閉じ後、本日の出走 (MemberGrid) までスムーズスクロール。
    // setTimeout で body.overflow 解除 + モーダル unmount を待ってから実行。
    setTimeout(() => {
      const target = document.getElementById("today-starters");
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 50);
  };

  // SSR 時は何も描画しない (hydration mismatch 完全回避)
  if (!mounted) return null;

  // デバッグ用: モーダルが閉じていても mount 確認できる浮遊ボタン。
  const debugButtonEnabled = devMode || forceOpen;

  if (!open) {
    if (!debugButtonEnabled) return null;
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] bg-[#D41E28] text-white px-3 py-2 text-xs font-black shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
        aria-label="賽を振るモーダルを開く"
      >
        🎲 賽を振る
      </button>
    );
  }

  const handStyle = HAND_COLOR[handKey] ?? HAND_COLOR.normal;
  const stampChar = STAMP_CHARS[handKey];
  const shareable = SHAREABLE_HANDS.has(handKey);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111]/85 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chinchiro-title"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-[420px] overflow-y-auto border-2 border-[#111] bg-[#F5F1E8] shadow-[6px_6px_0_rgba(0,0,0,0.3)]"
        style={{
          // iOS Safari/Chrome 15.3 以下で dvh 未サポート。vh で統一して
          // 旧デバイスでもモーダルが viewport 外に飛ばないようにする。
          maxHeight: "90vh",
        }}
      >
        {/* 上部赤帯 */}
        <div
          className="bg-[#D41E28] px-4 py-2 text-center"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% 85%, 96% 95%, 90% 88%, 80% 100%, 70% 92%, 60% 100%, 50% 90%, 40% 100%, 30% 92%, 20% 100%, 10% 90%, 4% 98%, 0 85%)",
          }}
        >
          <p
            id="chinchiro-title"
            className="text-[10px] font-black tracking-[0.3em] text-[#FFE600]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            DAILY ROLL
          </p>
          <h2
            className="mt-1 text-xl font-black text-white"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            今日の賽
          </h2>
        </div>

        {/* 本体 */}
        <div className="px-5 pt-5 pb-6">
          {phase === "idle" && (
            <>
              <p
                className="text-center text-base font-black text-[#111] leading-tight"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                推しを選んでサイコロを振ろう。
              </p>
              <p
                className="mt-1 text-center text-xs text-[#4A5060] leading-snug"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                3 個の賽の<span className="font-black">役</span>で票数が決まる
                <span className="font-black">チンチロ方式</span>。<br />
                一撃 <span className="text-[#D41E28] font-black">100 票</span>
                のピンゾロも。毎日 1 回・<span className="font-black">無料</span>。
              </p>
              <p
                className="mt-2 text-center text-[10px] text-[#4A5060] leading-relaxed"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                出た票はそのまま推しの
                <span className="font-black">ランキング</span>
                に加算されます。
              </p>

              {/* 役の早見 (idle 段階でも開けるようにして期待感を煽る) */}
              <details className="mt-2 text-[10px] text-[#4A5060]">
                <summary
                  className="cursor-pointer text-center font-black tracking-wide"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  ▶ 役と票数を見る
                </summary>
                <ul
                  className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 px-2"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  <li>
                    <span className="font-black text-[#D41E28]">ピンゾロ</span> (1-1-1): 100 票
                  </li>
                  <li>シゴロ (4-5-6): 8 票</li>
                  <li>ゾロ目: 出目 × 2 票</li>
                  <li>通常役: 1〜6 票</li>
                  <li>ヒフミ: 全員に 1 票</li>
                  <li>目なし: 振り直し</li>
                </ul>
              </details>

              {/* DEV ONLY: 次に振る役を予約する (本番では表示されない) */}
              {devMode && (
                <div className="mt-3 rounded border border-dashed border-[#D41E28] bg-[#FFE600]/40 p-2">
                  <p
                    className="text-[10px] font-black tracking-widest text-[#D41E28]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    🧪 DEV: 次に振る役を予約 → その後に推しをタップ
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {[
                      { key: null,      label: "ランダム" },
                      { key: "pinzoro", label: "ピンゾロ" },
                      { key: "zorome",  label: "ゾロ目" },
                      { key: "shigoro", label: "シゴロ" },
                      { key: "normal",  label: "通常役" },
                      { key: "hifumi",  label: "ヒフミ" },
                      { key: "menashi", label: "目なし" },
                    ].map((h) => {
                      const selected = devQueuedHand === h.key;
                      return (
                        <button
                          key={h.key ?? "random"}
                          type="button"
                          onClick={() => setDevQueuedHand(h.key)}
                          className={`flex-1 min-w-[60px] border border-[#111] px-1 py-1 text-[10px] font-black transition-colors ${
                            selected
                              ? "bg-[#111] text-[#FFE600]"
                              : "bg-white hover:bg-[#FFE600]"
                          }`}
                          style={{ fontFamily: "var(--font-noto-serif), serif" }}
                        >
                          {h.label}
                          {selected && " ✓"}
                        </button>
                      );
                    })}
                  </div>
                  <p
                    className="mt-1 text-[9px] text-[#4A5060] text-center"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    現在: {devQueuedHand
                      ? `【${
                          { pinzoro: "ピンゾロ", zorome: "ゾロ目", shigoro: "シゴロ", normal: "通常役", hifumi: "ヒフミ", menashi: "目なし" }[devQueuedHand]
                        }】で振る`
                      : "ランダム (通常)"}
                  </p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                {members.slice(0, 12).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handlePick(m)}
                    className="group relative aspect-square overflow-hidden border border-[#111] transition-transform active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#D41E28] focus-visible:outline-offset-2"
                    style={{
                      backgroundImage: "url(/members/haikei.jpeg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    aria-label={`${m.name} を選んで賽を振る`}
                  >
                    <Image
                      src={m.avatarUrl}
                      alt=""
                      fill
                      sizes="(max-width: 420px) 30vw, 120px"
                      className="object-cover object-top transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-[#111]/75 px-1 py-0.5 text-center">
                      <span
                        className="text-[10px] font-black text-white truncate block"
                        style={{ fontFamily: "var(--font-noto-serif), serif" }}
                      >
                        {m.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {(phase === "rolling" || phase === "result") && picked && (
            <div className="flex flex-col items-center">
              {/* 選ばれた人 */}
              <div
                className="relative w-24 h-24 overflow-hidden border-2 border-[#111]"
                style={{
                  backgroundImage: "url(/members/haikei.jpeg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Image
                  src={picked.avatarUrl}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              </div>
              <p
                className="mt-2 text-sm font-black text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {handKey === "hifumi" && phase === "result"
                  ? "全員にお裾分け。"
                  : `${picked.name} に`}
              </p>

              {/* サイコロ 3 個 — 白地に黒ピップ (1 の目だけ赤) */}
              <div className="relative mt-4 flex items-center justify-center gap-3">
                {rollFaces.map((f, i) => (
                  <div
                    key={i}
                    className="h-16 w-16 border-2 border-[#111] bg-white"
                    style={{
                      boxShadow: "3px 3px 0 rgba(17,17,17,0.25)",
                      transform: phase === "rolling" ? "rotate(6deg)" : "rotate(0deg)",
                      transition: phase === "rolling" ? "none" : "transform 180ms ease",
                    }}
                    aria-hidden
                  >
                    <DiceFace value={f + 1} />
                  </div>
                ))}

                {/* 判子演出: ピンゾロ / シゴロ / ゾロ目 — 2 文字を縦書きで角押し */}
                {phase === "result" && stampChar && (
                  <div
                    className="absolute pointer-events-none select-none"
                    style={{
                      right: "-22px",
                      top: "-28px",
                      width: "44px",
                      height: "52px",
                      transform: "rotate(-10deg)",
                      clipPath:
                        "polygon(4% 6%, 16% 2%, 32% 4%, 52% 0%, 72% 4%, 88% 2%, 100% 10%, 98% 28%, 100% 46%, 96% 62%, 100% 78%, 94% 94%, 78% 100%, 60% 96%, 42% 100%, 26% 96%, 12% 100%, 0 92%, 2% 76%, 0 58%, 4% 42%, 0 26%, 2% 12%)",
                      backgroundColor: "#D41E28",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontSize: 20,
                      fontWeight: 900,
                      lineHeight: 1.05,
                      letterSpacing: "-0.02em",
                      writingMode: "vertical-rl",
                      textOrientation: "upright",
                      fontFamily: "var(--font-noto-serif), serif",
                      boxShadow: "3px 3px 0 rgba(17,17,17,0.3)",
                      animation:
                        "chinchiro-stamp-in 400ms cubic-bezier(0.2, 1.5, 0.3, 1) both",
                    }}
                    aria-hidden
                  >
                    {stampChar}
                  </div>
                )}
              </div>

              {/* 役名 + 票数 + ストリーク */}
              <div className="mt-5 w-full" aria-live="assertive">
                {phase === "result" && !errorMsg && (
                  <>
                    <div
                      className="flex flex-col items-center py-3"
                      style={{
                        backgroundColor: handStyle.bg,
                        color: handStyle.fg,
                      }}
                    >
                      <span
                        className="text-xs font-black tracking-[0.3em]"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        {handKey.toUpperCase()}
                      </span>
                      <span
                        className="text-2xl font-black leading-none"
                        style={{ fontFamily: "var(--font-noto-serif), serif" }}
                      >
                        {handLabel}
                      </span>
                      {handKey === "hifumi" ? (
                        <>
                          <span
                            className="mt-2 text-3xl font-black leading-none tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            全員 × 1<span className="ml-1 text-base">票</span>
                          </span>
                          <span
                            className="mt-1 text-[10px] font-bold opacity-80"
                            style={{ fontFamily: "var(--font-noto-serif), serif" }}
                          >
                            推しの対抗馬も底上げ — 戦略ノイズ
                          </span>
                        </>
                      ) : (
                        <span
                          className="mt-2 text-4xl font-black leading-none tabular-nums"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {voteValue}<span className="ml-1 text-base">票</span>
                        </span>
                      )}
                    </div>

                    {/* ストリーク表示 + ティアバッジ */}
                    <div className="mt-3 flex items-center justify-center gap-2 text-[#111] flex-wrap">
                      <span className="text-base" aria-hidden>🎲</span>
                      <span
                        className="text-sm font-black"
                        style={{ fontFamily: "var(--font-noto-serif), serif" }}
                      >
                        連続 <span className="text-[#D41E28]">{streakDays}</span> 日目
                      </span>
                      <StreakBadge days={streakDays} size="md" />
                    </div>
                    {getStreakTier(streakDays).nextInDays && (
                      <p
                        className="mt-1 text-center text-[10px] text-[#4A5060]"
                        style={{ fontFamily: "var(--font-noto-serif), serif" }}
                      >
                        あと{" "}
                        <b className="text-[#D41E28]">
                          {getStreakTier(streakDays).nextInDays}
                        </b>{" "}
                        日で {getStreakTier(streakDays).nextLabel}
                      </p>
                    )}
                  </>
                )}
                {phase === "rolling" && (
                  <p
                    className="text-center text-sm font-black text-[#4A5060]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    賽を振っています…
                  </p>
                )}
                {errorMsg && (
                  <p
                    className="text-center text-sm font-black text-[#D41E28]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* シェアボタン: 特別な役で +1 票 */}
              {phase === "result" && !errorMsg && shareable && (
                <div className="mt-4 w-full">
                  {shareClaimed ? (
                    <p
                      className="w-full bg-[#4A5060] px-4 py-3 text-sm font-black text-white text-center"
                      style={{
                        fontFamily: "var(--font-noto-serif), serif",
                        boxShadow: "4px 4px 0 rgba(17,17,17,0.22)",
                      }}
                    >
                      ✓ シェア報酬 +{totalValue} 票 受領済み
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleShare("x")}
                        className="bg-[#111] px-3 py-3 text-xs md:text-sm font-black text-white transition-transform active:translate-y-0.5"
                        style={{
                          fontFamily: "var(--font-noto-serif), serif",
                          boxShadow: "4px 4px 0 rgba(17,17,17,0.22)",
                        }}
                      >
                        X で +{totalValue} 票
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare("line")}
                        className="bg-[#06C755] px-3 py-3 text-xs md:text-sm font-black text-white transition-transform active:translate-y-0.5"
                        style={{
                          fontFamily: "var(--font-noto-serif), serif",
                          boxShadow: "4px 4px 0 rgba(17,17,17,0.22)",
                        }}
                      >
                        LINE で +{totalValue} 票
                      </button>
                    </div>
                  )}
                  {shareError && (
                    <p className="mt-1 text-center text-[10px] text-[#D41E28]">
                      {shareError}
                    </p>
                  )}
                </div>
              )}

              {/* 閉じるは結果確定後のみ */}
              {phase === "result" && (
                <div className="mt-5 flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 bg-[#111] px-6 py-3 text-sm font-black text-[#FFE600] transition-transform active:translate-y-0.5"
                    style={{
                      fontFamily: "var(--font-noto-serif), serif",
                      boxShadow: "4px 4px 0 rgba(17,17,17,0.22)",
                    }}
                    autoFocus
                  >
                    {finalDice ? "まだまだ、応援できる →" : "閉じる"}
                  </button>
                  {finalDice && picked && (
                    <p
                      className="text-[10px] text-[#4A5060] text-center leading-snug"
                      style={{ fontFamily: "var(--font-noto-serif), serif" }}
                    >
                      {picked.name} にも、他の子にも。<br />
                      全員に 1 日 1 回、<span className="font-black">サイコロで 1〜6 票</span>。
                      <span className="font-black">無料</span>。
                    </p>
                  )}
                </div>
              )}

              {/* 役の早見 (畳み) */}
              {phase === "result" && !errorMsg && (
                <details className="mt-4 w-full text-[11px] text-[#4A5060]">
                  <summary
                    className="cursor-pointer text-center font-black"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    役の早見を見る
                  </summary>
                  <ul
                    className="mt-2 space-y-0.5"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    <li>ピンゾロ (1-1-1): 100 票 🎯</li>
                    <li>ゾロ目 (X-X-X): 出目 × 2 票</li>
                    <li>シゴロ (4-5-6): 8 票</li>
                    <li>通常役 (2 揃 + 1 独): 独の目 1〜6 票</li>
                    <li>ヒフミ (1-2-3): 全員に 1 票ずつお裾分け</li>
                    <li>目なし: 1 回だけ振り直し (以降は 1 票救済)</li>
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 判子演出用キーフレーム */}
      <style>{`
        @keyframes chinchiro-stamp-in {
          0% { transform: rotate(-10deg) scale(2.2); opacity: 0; }
          60% { transform: rotate(-10deg) scale(0.9); opacity: 1; }
          100% { transform: rotate(-10deg) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
