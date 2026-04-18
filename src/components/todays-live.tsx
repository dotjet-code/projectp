import Link from "next/link";
import { listLiveEvents } from "@/lib/projectp/live-event";
import { SectionHeading } from "./section-heading";

export async function TodaysLive() {
  const events = await listLiveEvents();
  const today = new Date().toISOString().slice(0, 10);

  const todayEvents = events.filter(
    (e) => e.eventDate === today && e.status !== "closed"
  );
  const futureEvents = events.filter(
    (e) => e.eventDate > today && e.status !== "closed"
  );

  if (todayEvents.length === 0 && futureEvents.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-4 mt-16 space-y-10">
      {/* 本日のライブ */}
      {todayEvents.length > 0 && (
        <div>
          <SectionHeading title="本日のライブ" eyebrow="TONIGHT'S LIVE" accent="red" />
          <div className="space-y-3">
            {todayEvents.map((ev) => (
              <div
                key={ev.id}
                className="relative overflow-hidden rounded-2xl border border-live/30 px-6 py-6"
                style={{
                  backgroundImage:
                    "linear-gradient(172deg, rgba(255,230,235,0.8) 0%, rgba(255,240,245,0.8) 50%, rgba(253,244,255,0.8) 100%)",
                }}
              >
                {/* Sound wave bars */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-end gap-[3px] pointer-events-none">
                  {[18, 28, 14, 24, 20, 32, 16, 26, 20, 30].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full"
                      style={{
                        height: h,
                        backgroundColor: "rgba(231,0,11,0.1)",
                        animation: `soundbar 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-[family-name:var(--font-outfit)] text-sm font-bold text-[#e7000b]">
                        {ev.eventDate}
                      </span>
                      {ev.status === "open" && (
                        <span className="rounded-full bg-gradient-to-r from-live to-[#fb64b6] px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white animate-pulse">
                          投票受付中
                        </span>
                      )}
                      {ev.status === "draft" && (
                        <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white">
                          本日開催
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{ev.title}</h3>
                    {ev.venue && <p className="mt-1 text-sm text-muted">{ev.venue}</p>}
                  </div>

                  {ev.status === "open" ? (
                    <Link
                      href={`/event/${ev.id}`}
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-live to-[#fb64b6] px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-[1.02]"
                    >
                      💖 投票する →
                    </Link>
                  ) : (
                    <Link
                      href="/live/vote"
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple to-purple-end px-6 py-3 text-base font-bold text-white shadow-[0_10px_15px_rgba(221,214,255,0.5)] transition hover:scale-[1.02]"
                    >
                      詳細を見る →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ライブ予定 */}
      {futureEvents.length > 0 && (
        <div>
          <SectionHeading title="ライブ予定" eyebrow="UPCOMING" accent="black" />
          <div className="space-y-3">
            {futureEvents.map((ev) => (
              <div
                key={ev.id}
                className="rounded-2xl border border-[rgba(237,233,254,0.5)] bg-gradient-to-r from-[rgba(237,233,254,0.5)] to-[rgba(250,245,255,0.5)] px-6 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-[family-name:var(--font-outfit)] text-xs font-bold text-[#7f22fe]">
                      {ev.eventDate}
                    </span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{ev.title}</p>
                    {ev.venue && <p className="text-xs text-muted">{ev.venue}</p>}
                  </div>
                  <Link
                    href="/live/vote"
                    className="text-xs font-bold text-[#7f22fe] underline"
                  >
                    詳細 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
