import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "プロフィール設定" };

export default async function MemberSettingsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/member/login");

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) redirect("/member/dashboard");

  const admin = createAdminClient();
  const { data } = await admin
    .from("members")
    .select("name, bio, sns_instagram, sns_x, sns_youtube, sns_tiktok")
    .eq("id", memberId)
    .single();

  type Profile = {
    name: string;
    bio: string | null;
    sns_instagram: string | null;
    sns_x: string | null;
    sns_youtube: string | null;
    sns_tiktok: string | null;
  };
  const p = data as Profile | null;

  return (
    <main className="mx-auto max-w-[600px] px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-6">プロフィール設定</h1>
      <SettingsForm
        initial={{
          bio: p?.bio ?? "",
          snsInstagram: p?.sns_instagram ?? "",
          snsX: p?.sns_x ?? "",
          snsYoutube: p?.sns_youtube ?? "",
          snsTiktok: p?.sns_tiktok ?? "",
        }}
      />
    </main>
  );
}
