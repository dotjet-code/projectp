"use client";

import { SITE_URL } from "@/lib/site-url";

export function ShareButtons({
  text,
  path,
}: {
  text: string;
  path: string;
}) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : `${SITE_URL}${path}`;

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;
  const lineHref = `https://line.me/R/msg/text/?${encodeURIComponent(
    `${text}\n${url}`
  )}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL をコピーしました");
    } catch {
      prompt("URL をコピーしてください", url);
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#111] text-white border-2 border-[#111] px-4 py-2.5 text-xs font-black transition-transform active:translate-y-0.5"
        style={{
          fontFamily: "var(--font-noto-serif), serif",
          boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
        }}
        aria-label="X でシェア"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X</span>
      </a>
      <a
        href={lineHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#06C755] text-white border-2 border-[#111] px-4 py-2.5 text-xs font-black transition-transform active:translate-y-0.5"
        style={{
          fontFamily: "var(--font-noto-serif), serif",
          boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
        }}
        aria-label="LINE でシェア"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
        <span>LINE</span>
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 bg-[#F5F1E8] text-[#111] border-2 border-[#111] px-4 py-2.5 text-xs font-black transition-transform active:translate-y-0.5 hover:bg-[#FFE600]"
        style={{
          fontFamily: "var(--font-noto-serif), serif",
          boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
        }}
        aria-label="URL をコピー"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span>URL</span>
      </button>
    </div>
  );
}
