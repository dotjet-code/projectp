"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type OcrResult = {
  purchase: number;
  payout: number;
  profit: number;
  raceInfo: string;
  raceDate: string;
  confidence: string;
};

export function SubmitForm({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ocr, setOcr] = useState<OcrResult | null>(null);

  const [purchase, setPurchase] = useState("");
  const [payout, setPayout] = useState("");
  const [note, setNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const profit =
    purchase && payout ? Number(payout) - Number(purchase) : null;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOcr(null);
    setPurchase("");
    setPayout("");
    setError(null);
    setFlash(null);

    // 自動解析
    analyzeImage(f);
  }

  async function analyzeImage(f: File) {
    setAnalyzing(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", f);
      fd.append("member_id", memberId);

      const res = await fetch("/api/public/submit-balance?analyze_only=1", {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);

      const result = j.ocr as OcrResult;
      setOcr(result);
      setPurchase(String(result.purchase));
      setPayout(String(result.payout));
    } catch (e) {
      setError(
        `画像解析失敗: ${e instanceof Error ? e.message : String(e)}。手動で入力してください。`
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setFlash(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("member_id", memberId);
      fd.append("purchase", purchase);
      fd.append("payout", payout);
      if (note) fd.append("note", note);

      const res = await fetch("/api/public/submit-balance", {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);

      setFlash("提出しました！ 運営の承認をお待ちください。");
      setFile(null);
      setPreview(null);
      setOcr(null);
      setPurchase("");
      setPayout("");
      setNote("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-[720px] px-4">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4"
      >
        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            スクリーンショット *
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20"
          />
          {preview && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 max-h-[300px]">
              <Image
                src={preview}
                alt="プレビュー"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                unoptimized
              />
              {analyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary-dark">
                    <span className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    AI が画像を解析中...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* OCR result badge */}
        {ocr && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs">
            <p className="font-bold text-emerald-700 mb-1">
              AI 自動認識 (信頼度: {ocr.confidence})
            </p>
            <p className="text-emerald-900">
              {ocr.raceInfo} / {ocr.raceDate}
            </p>
            <p className="text-emerald-900">
              購入: {ocr.purchase.toLocaleString()}円 → 払戻:{" "}
              {ocr.payout.toLocaleString()}円 → 利益:{" "}
              <b>{ocr.profit.toLocaleString()}円</b>
            </p>
            <p className="text-[10px] text-emerald-700 mt-1">
              ※ 間違っていれば下のフォームで修正してください
            </p>
          </div>
        )}

        {/* Manual fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              購入金額（円）
            </label>
            <input
              type="number"
              required
              value={purchase}
              onChange={(e) => setPurchase(e.target.value)}
              placeholder="10000"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              払戻金額（円）
            </label>
            <input
              type="number"
              required
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
              placeholder="212000"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Profit preview */}
        {profit !== null && (
          <div
            className={`rounded-xl px-4 py-3 text-center ${
              profit >= 0
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p className="text-xs font-bold text-muted mb-0.5">利益（収支ポイント）</p>
            <p
              className={`font-[family-name:var(--font-outfit)] text-2xl font-black ${
                profit >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {profit >= 0 ? "+" : ""}
              {profit.toLocaleString()}
            </p>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            メモ（任意）
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: 三国2R 的中！"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Error / Success */}
        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        {flash && (
          <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
            {flash}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || analyzing || !file || !purchase || !payout}
          className="w-full rounded-full bg-gradient-to-r from-primary to-primary-blue px-6 py-3 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? "提出中..." : "収支を提出する"}
        </button>
      </form>
    </section>
  );
}
