import Link from "next/link";
import { getMemberStageHistory } from "@/lib/projectp/stage";

export async function MemberStageHistory({
  memberName,
}: {
  memberName: string;
}) {
  const history = await getMemberStageHistory(memberName);
  if (history.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1100px] px-4 mt-12">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="inline-block w-2 h-2 bg-[#D41E28]" />
        <p
          className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          ━ HISTORY
        </p>
        <h2
          className="text-2xl md:text-3xl font-black text-[#111] leading-none"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          過去ステージの成績
        </h2>
        <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
      </div>

      <ul className="border-t-[3px] border-[#111]">
        {history.map((h) => (
          <li key={h.stageId}>
            <Link
              href={`/results?stage=${h.stageId}`}
              className="flex items-center gap-3 md:gap-4 px-3 py-3 border-b border-[#D5CFC0] hover:bg-white/60 transition-colors group"
            >
              <div className="w-10 shrink-0 text-center">
                {h.rank !== null ? (
                  <span
                    className="text-xl font-black tabular-nums text-[#111]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    #{h.rank}
                  </span>
                ) : (
                  <span className="text-xs text-[#4A5060]">—</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-black tracking-[0.25em] text-[#D41E28]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {h.seriesNumber !== null ? `SERIES ${h.seriesNumber}` : ""}
                  {h.stageNumber !== null
                    ? ` · STAGE ${h.stageNumber}`
                    : ""}
                </p>
                <p
                  className="mt-0.5 text-base font-black text-[#111] truncate leading-tight"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  {h.stageTitle ?? h.stageName}
                </p>
                <p
                  className="text-[10px] text-[#4A5060] tabular-nums"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {h.startDate} 〜 {h.endDate}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {h.position && (
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white ${
                      h.position === "PLAYER"
                        ? "bg-[#D41E28]"
                        : "bg-[#4A5060]"
                    }`}
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {h.position}
                  </span>
                )}
                <div className="text-right">
                  <span
                    className="text-lg md:text-xl font-black tabular-nums text-[#111] leading-none"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {h.totalPoints.toLocaleString()}
                  </span>
                  <span
                    className="text-[9px] text-[#4A5060] ml-0.5"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    pt
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
