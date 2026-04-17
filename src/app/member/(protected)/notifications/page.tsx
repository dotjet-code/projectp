import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import { getNotificationsForMember } from "@/lib/projectp/member-notifications";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "お知らせ" };

export default async function MemberNotificationsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/member/login");

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) redirect("/member/dashboard");

  const notifications = await getNotificationsForMember(memberId);

  return (
    <main className="mx-auto max-w-[800px] px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-6">お知らせ</h1>
      <NotificationsClient notifications={notifications} />
    </main>
  );
}
