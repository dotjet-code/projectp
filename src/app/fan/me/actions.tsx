"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FanMeActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/fan/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className="w-full rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
    >
      {loading ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
