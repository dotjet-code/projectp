import { TornDivider } from "@/components/torn-divider";

export function MissionStatement() {
  return (
    <section className="relative bg-[#111] text-[#F5F1E8] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, #F5F1E8 0.7px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
        aria-hidden
      />

      <div className="relative max-w-[960px] mx-auto px-6 py-16 md:py-24">
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <span className="inline-block w-2 h-2 bg-[#D41E28] animate-pulse" />
          <p
            className="text-[10px] md:text-xs font-black tracking-[0.4em] text-[#D41E28]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            MANIFESTO
          </p>
          <span className="flex-1 h-px bg-[#F5F1E8]/30" aria-hidden />
        </div>

        <p
          className="text-2xl md:text-4xl font-black leading-[1.5]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          あなたの
          <span
            className="relative inline-block px-1"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, rgba(212,30,40,0.6) 60%)",
            }}
          >
            一票
          </span>
          が、彼女たちの
          <span className="underline decoration-[#D41E28] decoration-[3px] underline-offset-[6px]">
            順位
          </span>
          も、
          <span className="underline decoration-[#D41E28] decoration-[3px] underline-offset-[6px]">
            物語
          </span>
          も、動かしていく。
        </p>

        <div className="mt-6 max-w-[280px]">
          <TornDivider variant="both" height={6} color="#D41E28" shadow={false} />
        </div>
      </div>
    </section>
  );
}
