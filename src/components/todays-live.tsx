import Link from "next/link";
import { listLiveEvents } from "@/lib/projectp/live-event";
import { SectionHeading } from "./section-heading";

type LiveEvent = Awaited<ReturnType<typeof listLiveEvents>>[number];

function formatDate(iso: string): string {
  return iso.replace(/-/g, ".");
}

function TodayRow({ ev }: { ev: LiveEvent }) {
  return (
    <div className="relative border-t-[3px] border-[#111111] bg-[#111111] text-[#F5F1E8] px-5 py-6 md:px-7 md:py-7 overflow-hidden">
      {/* 右側スタンプ: 放送中 */}
      {ev.status === "open" && (
        <div
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-[#D41E28] text-white px-3 py-1 flex items-center gap-2 select-none"
          style={{ transform: "rotate(-3deg)" }}
        >
          <span className="inline-block w-2 h-2 bg-white animate-pulse" aria-hidden />
          <span
            className="text-[10px] font-black tracking-[0.2em]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            投票受付中
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-black tracking-[0.3em] text-[#FFE600]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {formatDate(ev.eventDate)}
          </p>
          <h3
            className="mt-3 text-2xl md:text-4xl font-black leading-tight text-[#F5F1E8]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {ev.title}
          </h3>
          {ev.venue && (
            <p
              className="mt-2 text-sm font-bold text-[#9BA8BF]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              @ {ev.venue}
            </p>
          )}
        </div>

        <Link
          href={ev.status === "open" ? `/event/${ev.id}` : "/live/vote"}
          className="shrink-0 self-start md:self-end inline-flex items-center gap-2 bg-[#D41E28] text-white px-6 py-3 text-base font-black tracking-wide hover:translate-y-[-2px] transition-transform"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {ev.status === "open" ? "投票する" : "詳細を見る"} →
        </Link>
      </div>
    </div>
  );
}

function FutureRow({ ev }: { ev: LiveEvent }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5 border-b border-[#D5CFC0]">
      <div className="flex items-baseline gap-4 min-w-0">
        <span
          className="text-sm font-black tracking-[0.2em] text-[#D41E28] shrink-0 tabular-nums"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {formatDate(ev.eventDate)}
        </span>
        <div className="min-w-0">
          <p
            className="text-base md:text-lg font-black text-[#111111] truncate"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {ev.title}
          </p>
          {ev.venue && (
            <p className="text-xs text-[#4A5060] truncate">@ {ev.venue}</p>
          )}
        </div>
      </div>
      <Link
        href="/live/vote"
        className="shrink-0 text-xs font-black text-[#D41E28] hover:underline"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        詳細 →
      </Link>
    </div>
  );
}

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
    <section className="mx-auto max-w-[1200px] px-4 mt-16 space-y-12">
      {todayEvents.length > 0 && (
        <div>
          <SectionHeading
            title="本日のライブ"
            eyebrow="TONIGHT'S LIVE"
            accent="red"
          />
          <div className="space-y-3">
            {todayEvents.map((ev) => (
              <TodayRow key={ev.id} ev={ev} />
            ))}
          </div>
        </div>
      )}

      {futureEvents.length > 0 && (
        <div>
          <SectionHeading
            title="ライブ予定"
            eyebrow="UPCOMING"
            accent="black"
          />
          <div className="border-t-[3px] border-[#111]">
            {futureEvents.map((ev) => (
              <FutureRow key={ev.id} ev={ev} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
