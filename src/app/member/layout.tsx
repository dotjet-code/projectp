import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { MemberNav } from "./member-nav";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/member/login");

  const role =
    (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
  if (role !== "member" && role !== "admin") redirect("/member/login");

  // メンバー名を取得
  let memberName: string | undefined;
  if (role === "member") {
    const memberId = await getMemberIdByAuthUser(user.id);
    if (memberId) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("members")
        .select("name")
        .eq("id", memberId)
        .maybeSingle();
      memberName = (data as { name: string } | null)?.name ?? undefined;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1000px] px-6 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <a
              href="/"
              className="font-[family-name:var(--font-outfit)] text-sm font-extrabold bg-gradient-to-r from-[#00b8db] to-primary-blue bg-clip-text text-transparent"
            >
              Project P
            </a>
            <span className="text-[10px] text-muted">メンバー専用</span>
          </div>
          <MemberNav memberName={memberName} />
        </div>
      </div>
      {children}
    </div>
  );
}
