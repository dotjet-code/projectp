"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Stage } from "@/lib/projectp/stage";

type Mode = "view" | "edit";

export function StageCard({
  stage,
  variant,
}: {
  stage: Stage;
  variant: "active" | "closed";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [seriesNumber, setSeriesNumber] = useState(
    stage.seriesNumber?.toString() ?? ""
  );
  const [stageNumber, setStageNumber] = useState(
    stage.stageNumber?.toString() ?? ""
  );
  const [title, setTitle] = useState(stage.title ?? "");
  const [subtitle, setSubtitle] = useState(stage.subtitle ?? "");
  const [startDate, setStartDate] = useState(stage.startDate);
  const [endDate, setEndDate] = useState(stage.endDate);
  const [predictionsCloseAt, setPredictionsCloseAt] = useState(
    stage.predictionsCloseAt
      ? toLocalInputValue(stage.predictionsCloseAt)
      : ""
  );

  function resetForm() {
    setSeriesNumber(stage.seriesNumber?.toString() ?? "");
    setStageNumber(stage.stageNumber?.toString() ?? "");
    setTitle(stage.title ?? "");
    setSubtitle(stage.subtitle ?? "");
    setStartDate(stage.startDate);
    setEndDate(stage.endDate);
    setPredictionsCloseAt(
      stage.predictionsCloseAt
        ? toLocalInputValue(stage.predictionsCloseAt)
        : ""
    );
    setError(null);
  }

  function toLocalInputValue(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function onSave() {
    setBusy(true);
    setError(null);
    try {
      const sn = seriesNumber ? Number(seriesNumber) : null;
      const stn = stageNumber ? Number(stageNumber) : null;
      const newName =
        sn && stn
          ? `Series ${sn} Stage ${stn}${title ? `: ${title}` : ""}`
          : title || stage.name;

      const res = await fetch(`/api/admin/stages/${stage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          seriesNumber: sn,
          stageNumber: stn,
          title: title || null,
          subtitle: subtitle || null,
          startDate,
          endDate,
          predictionsCloseAt: predictionsCloseAt
            ? new Date(predictionsCloseAt).toISOString()
            : null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setMode("view");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onFinalize() {
    if (
      !confirm(
        "この Stage を確定しますか？\n" +
          "現時点のスナップショットを period_points に書き込み、\n" +
          "Stage は closed になります（後から再オープン可能）。"
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stages/${stage.id}/finalize`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onReopen() {
    if (
      !confirm(
        "この Stage を再オープンしますか？\n" +
          "状態が active に戻り、再度ポイント集計の対象になります。"
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stages/${stage.id}/reopen`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (
      !confirm(
        `「${stage.title ?? stage.name}」を完全に削除します。\n` +
          "紐付いた集計結果 (period_points) も全て消えます。\n" +
          "本当によろしいですか？"
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stages/${stage.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const isActive = variant === "active";
  const containerClass = isActive
    ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
    : "rounded-2xl border border-gray-200 bg-white p-5";

  return (
    <div className={containerClass}>
      {mode === "view" ? (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`text-xs font-bold tracking-wider ${
                isActive ? "text-emerald-700" : "text-gray-500"
              }`}
            >
              {stage.seriesNumber !== null
                ? `SERIES ${stage.seriesNumber} / `
                : ""}
              {stage.stageNumber !== null
                ? `STAGE ${stage.stageNumber}`
                : "STAGE"}
              {!isActive && " · closed"}
            </p>
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-foreground truncate">
              {stage.title ?? stage.name}
            </h3>
            {stage.subtitle && (
              <p className="text-sm text-muted mt-0.5">{stage.subtitle}</p>
            )}
            <p className="mt-2 text-xs text-muted">
              {stage.startDate} 〜 {stage.endDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/stages/${stage.id}/balance`}
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              💰 収支
            </Link>
            <Link
              href={`/admin/stages/${stage.id}/special`}
              className="rounded-full border border-purple-300 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50"
            >
              ⭐ 特別
            </Link>
            <Link
              href={`/admin/stages/${stage.id}/predictions`}
              className="rounded-full border border-blue-300 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50"
            >
              🎯 予想
            </Link>
            {!isActive && (
              <Link
                href={`/admin/rewards?stage=${stage.id}`}
                className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
              >
                🎁 景品発行
              </Link>
            )}
            <Link
              href={`/admin/stages/${stage.id}/votes`}
              className="rounded-full border border-pink-300 px-3 py-1.5 text-xs font-bold text-pink-700 hover:bg-pink-50"
            >
              💖 投票
            </Link>
            <Link
              href={`/admin/stages/${stage.id}/submissions`}
              className="rounded-full border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50"
            >
              📸 提出審査
            </Link>
            <a
              href={`/api/admin/stages/${stage.id}/export-csv`}
              className="rounded-full border border-green-300 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-50"
              download
            >
              📥 CSV
            </a>
            <button
              type="button"
              onClick={() => setMode("edit")}
              disabled={busy}
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              編集
            </button>

            {isActive ? (
              <button
                type="button"
                onClick={onFinalize}
                disabled={busy}
                className="rounded-full bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
              >
                {busy ? "確定中..." : "✅ 確定する"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onReopen}
                disabled={busy}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
              >
                {busy ? "再オープン中..." : "↻ 再オープン"}
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Series 番号
              </label>
              <input
                type="number"
                min={1}
                value={seriesNumber}
                onChange={(e) => setSeriesNumber(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Stage 番号
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={stageNumber}
                onChange={(e) => setStageNumber(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              サブタイトル
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              予想締切日時（任意）
            </label>
            <input
              type="datetime-local"
              value={predictionsCloseAt}
              onChange={(e) => setPredictionsCloseAt(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[10px] text-muted">
              特番開始直前の時刻を指定。これを過ぎるとファンは予想を変更できなくなります。
            </p>
          </div>

          {error && <p className="text-xs text-red-600">エラー: {error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              {busy ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setMode("view");
              }}
              disabled={busy}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {mode === "view" && error && (
        <p className="mt-2 text-xs text-red-600">エラー: {error}</p>
      )}
    </div>
  );
}
