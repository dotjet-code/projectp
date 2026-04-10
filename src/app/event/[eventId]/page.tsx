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
  const members = (data ?? []).map((m) => ({
    id: m.id as string,
    name: m.name as string,
    avatarUrl: dummyByName.get(m.name)?.avatarUrl ?? "",
  }));

  return (
    <>
      <Header />
      <main className="pb-10">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf2f8] via-[#fce7f3]/40 to-transparent pt-10 pb-6 text-center">
          <p className="text-4xl mb-2">🎤</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-live to-[#fb64b6] bg-clip-text text-transparent">
            {event.title}
          </h1>
          <p className="mt-2 text-xs text-muted">
            {event.eventDate}
            {event.venue && ` · ${event.venue}`}
          </p>
          {event.status === "closed" && (
            <p className="mt-3 rounded-full inline-block bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-700">
              投票は締め切られました
            </p>
          )}
          {event.status === "draft" && (
            <p className="mt-3 rounded-full inline-block bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">
              投票はまだ開始されていません
            </p>
          )}
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
