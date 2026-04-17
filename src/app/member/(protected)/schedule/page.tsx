import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import { getScheduleForMember } from "@/lib/projectp/member-schedule";
import { ScheduleClient } from "./schedule-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "スケジュール" };

export default async function MemberSchedulePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/member/login");

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) redirect("/member/dashboard");

  const schedule = await getScheduleForMember(memberId);

  return (
    <main className="mx-auto max-w-[800px] px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-6">スケジュール</h1>
      <ScheduleClient schedule={schedule} />
    </main>
  );
}
