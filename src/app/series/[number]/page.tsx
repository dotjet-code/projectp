import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSeriesTotals } from "@/lib/projectp/stage";

export const dynamic = "force-dynamic";

const medals = ["🥇", "🥈", "🥉"];

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const seriesNumber = Number(number);
  if (Number.isNaN(seriesNumber)) notFound();

  const data = await getSeriesTotals(seriesNumber);

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fef9c3] via-[#fef3c6]/40 to-transparent pt-10 pb-8 text-center">
          <div className="relative">
            <p className="text-5xl mb-3">🏁</p>
            <p className="text-xs font-bold tracking-wider text-amber-700 mb-1">
              SERIES {seriesNumber}
            </p>
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#8b5cf6] bg-clip-text text-transparent">
              半年累計ランキング
            </h1>
            <p className="mt-2 text-xs text-muted">
              {data.stages.length} ステージ / 確定済みのみ集計
            </p>
          </div>
        </section>

        {/* Stages used */}
        {data.stages.length > 0 && (
          <section className="mx-auto max-w-[964px] px-4 mt-4">
            <ul className="flex flex-wrap items-center gap-2">
              {data.stages.map((s) => (
                <li
                  key={s.id}
                  className="rounded-full bg-white/70 border border-white/80 px-3 py-1 text-[11px] font-bold text-foreground"
                >
                  STAGE {s.stageNumber ?? "?"}
                  {s.title ? ` · ${s.title}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Ranking */}
        <section className="mx-auto max-w-[964px] px-4 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#ffd230] to-[#f59e0b]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#b45309] tracking-tight">
              🏆 累計順位
            </h2>
          </div>

          {data.rows.length === 0 ? (
            <p className="text-sm text-muted">
              この Series にはまだ確定済みステージがありません。
              ステージの結果が確定するとここに累計が表示されます。
            </p>
          ) : (
            <div className="space-y-2">
              {data.rows.map((r) => {
                const isReorgLine = r.rank === 7;
                return (
                  <div key={r.memberId}>
                    {isReorgLine && (
                      <div className="relative my-3">
                        <div className="border-t-2 border-dashed border-reorg" />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 rounded-full bg-gradient-to-r from-pit to-pit-end px-4 py-1 text-[11px] font-bold text-white tracking-wider shadow-[0_1px_3px_#fee685]">
                          ⚡ Series 再編成ライン ⚡
                        </span>
                      </div>
                    )}

                    <Link
                      href={r.slug ? `/members/${r.slug}` : "/members"}
                      className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 px-4 py-3 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="w-8 shrink-0 text-center">
                        {r.rank <= 3 ? (
                          <span className="text-xl">{medals[r.rank - 1]}</span>
                        ) : (
                          <span className="font-[family-name:var(--font-outfit)] text-sm font-extrabold text-[#0092b8]">
                            #{r.rank}
                          </span>
                        )}
                      </div>

                      {r.avatarUrl && (
                        <Image
                          src={r.avatarUrl}
                          alt={r.memberName}
                          width={44}
                          height={44}
                          className="size-11 shrink-0 rounded-full object-cover object-top shadow-sm"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {r.memberName}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                              r.position === "PLAYER"
                                ? "bg-gradient-to-r from-player to-player-end"
                                : "bg-gradient-to-r from-pit to-pit-end"
                            }`}
                          >
                            {r.position}
                          </span>
                          <span className="text-[9px] font-bold text-muted tracking-wider">
                            {r.stagesCounted} stage 集計
                          </span>
                          {r.specialPoints > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 border border-purple-200 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 tracking-wider font-[family-name:var(--font-outfit)]">
                              SPECIAL +{r.specialPoints.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted">
                        <div className="text-right">
                          <p className="font-bold text-[#00d3f3]">
                            {r.buzzPoints.toLocaleString()}
                          </p>
                          <p>バズ</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#2b7fff]">
                            {r.livePoints.toLocaleString()}
                          </p>
                          <p>配信</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#a684ff]">
                            {r.balancePoints.toLocaleString()}
                          </p>
                          <p>収支</p>
                        </div>
                      </div>

                      <div className="w-16 sm:w-24 shrink-0 text-right">
                        <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground">
                          {r.totalPoints.toLocaleString()}
                        </span>
                        <p className="text-[9px] text-muted font-[family-name:var(--font-outfit)]">
                          pts
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
