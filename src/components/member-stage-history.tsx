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
    <section className="mx-auto max-w-[964px] px-4 mt-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#ffd230] to-[#f59e0b]" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#b45309] tracking-tight">
          🏁 過去 Stage の成績
        </h2>
      </div>

      <ul className="flex flex-col gap-2">
        {history.map((h) => (
          <li key={h.stageId}>
            <Link
              href={`/results?stage=${h.stageId}`}
              className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 px-4 py-3 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-10 shrink-0 text-center">
                {h.rank !== null ? (
                  <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-[#0092b8]">
                    #{h.rank}
                  </span>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-500 tracking-wider">
                  {h.seriesNumber !== null ? `SERIES ${h.seriesNumber}` : ""}
                  {h.stageNumber !== null
                    ? ` / STAGE ${h.stageNumber}`
                    : ""}
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {h.stageTitle ?? h.stageName}
                </p>
                <p className="text-[10px] text-muted">
                  {h.startDate} 〜 {h.endDate}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {h.position && (
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                      h.position === "PLAYER"
                        ? "bg-gradient-to-r from-player to-player-end"
                        : "bg-gradient-to-r from-pit to-pit-end"
                    }`}
                  >
                    {h.position}
                  </span>
                )}
                <div className="text-right">
                  <span className="font-[family-name:var(--font-outfit)] text-sm font-black text-foreground">
                    {h.totalPoints.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-muted ml-0.5">pts</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
