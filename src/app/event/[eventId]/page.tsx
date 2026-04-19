import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getLiveEvent } from "@/lib/projectp/live-event";
import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers } from "@/lib/data";
import { EventVoteClient } from "./event-vote-client";

export const dynamic = "force-dynamic";

export default async function EventVotePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getLiveEvent(eventId);
  if (!event) notFound();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const dummyByName = new Map(dummyMembers.map((d) => [d.name, d]));
  const members = (data ?? [])
    .filter((m) => (m.name as string) !== "Coming Soon")
    .map((m) => ({
      id: m.id as string,
      name: m.name as string,
      avatarUrl: dummyByName.get(m.name)?.avatarUrl ?? "",
    }));

  return (
    <>
      <Header />
      <main className="pb-10 bg-[#F5F1E8]">
        <section className="relative overflow-hidden bg-[#111] text-[#F5F1E8] px-6 pt-12 md:pt-16 pb-10">
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle, #F5F1E8 0.7px, transparent 1px)",
              backgroundSize: "7px 7px",
            }}
            aria-hidden
          />
          <div className="relative max-w-[1100px] mx-auto">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="inline-block w-2 h-2 bg-[#D41E28] animate-pulse" />
              <p
                className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ LIVE EVENT
              </p>
              <span className="flex-1 h-px bg-[#F5F1E8]/30" aria-hidden />
            </div>
            <h1
              className="text-3xl md:text-5xl font-black leading-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              {event.title}
            </h1>
            <p
              className="mt-2 text-sm tabular-nums text-[#9BA8BF] tracking-wider"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {event.eventDate}
              {event.venue && ` · ${event.venue}`}
            </p>
            {event.status === "closed" && (
              <p
                className="mt-4 inline-block bg-[#111] text-white border-2 border-white px-4 py-1.5 text-xs font-black tracking-wider"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                🔒 投票は締め切られました
              </p>
            )}
            {event.status === "draft" && (
              <p
                className="mt-4 inline-block bg-[#FFE600] text-[#111] px-4 py-1.5 text-xs font-black tracking-wider"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                投票はまだ開始されていません
              </p>
            )}
          </div>
        </section>

        <EventVoteClient
          eventId={event.id}
          eventStatus={event.status}
          members={members}
        />
      </main>
      <Footer />
    </>
  );
}
