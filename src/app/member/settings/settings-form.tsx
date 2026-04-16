"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initial: {
    bio: string;
    snsInstagram: string;
    snsX: string;
    snsYoutube: string;
    snsTiktok: string;
  };
};

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [bio, setBio] = useState(initial.bio);
  const [snsInstagram, setSnsInstagram] = useState(initial.snsInstagram);
  const [snsX, setSnsX] = useState(initial.snsX);
  const [snsYoutube, setSnsYoutube] = useState(initial.snsYoutube);
  const [snsTiktok, setSnsTiktok] = useState(initial.snsTiktok);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFlash(null);
    setError(null);
    try {
      const res = await fetch("/api/member/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, snsInstagram, snsX, snsYoutube, snsTiktok }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "保存に失敗しました");
      }
      setFlash("保存しました");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          自己紹介 (公開ページに表示)
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="ファンに向けた自己紹介を書いてください"
        />
        <p className="text-[10px] text-muted text-right">
          {bio.length} / 500
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700">SNS リンク</p>
        {[
          {
            label: "Instagram",
            icon: "📸",
            value: snsInstagram,
            set: setSnsInstagram,
            placeholder: "https://instagram.com/...",
          },
          {
            label: "X (Twitter)",
            icon: "𝕏",
            value: snsX,
            set: setSnsX,
            placeholder: "https://x.com/...",
          },
          {
            label: "YouTube",
            icon: "▶️",
            value: snsYoutube,
            set: setSnsYoutube,
            placeholder: "https://youtube.com/@...",
          },
          {
            label: "TikTok",
            icon: "🎵",
            value: snsTiktok,
            set: setSnsTiktok,
            placeholder: "https://tiktok.com/@...",
          },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-6 text-center">{s.icon}</span>
            <input
              type="url"
              value={s.value}
              onChange={(e) => s.set(e.target.value)}
              placeholder={s.placeholder}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      {flash && <p className="text-xs text-emerald-700">{flash}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
      >
        {saving ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
