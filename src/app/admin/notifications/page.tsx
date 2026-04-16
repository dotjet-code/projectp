import { createAdminClient } from "@/lib/supabase/admin";
import { NotificationsAdmin } from "./notifications-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "お知らせ管理" };

export default async function AdminNotificationsPage() {
  const supabase = createAdminClient();

  // メンバー一覧(個別送信用)
  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  // 直近のお知らせ
  const { data: recent } = await supabase
    .from("member_notifications")
    .select("id, title, body, category, target_member_id, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  type MemberOption = { id: string; name: string };
  type NotifRow = {
    id: number;
    title: string;
    body: string | null;
    category: string;
    target_member_id: string | null;
    created_at: string;
  };

  const memberList = (members ?? []) as MemberOption[];
  const memberNameById = new Map(memberList.map((m) => [m.id, m.name]));

  return (
    <main className="mx-auto max-w-[900px] px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">お知らせ管理</h1>
      <p className="text-xs text-muted mb-6">
        メンバーへのお知らせ・フィードバックを送信。全体配信または個別に送れる。
      </p>

      <NotificationsAdmin
        members={memberList}
      />

      {/* 送信済み一覧 */}
      <section className="mt-10">
        <h2 className="text-sm font-bold text-muted mb-3">送信済み (直近30件)</h2>
        <div className="space-y-2">
          {((recent ?? []) as NotifRow[]).map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      n.category === "urgent"
                        ? "bg-red-50 text-red-700"
                        : n.category === "feedback"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {n.category === "urgent"
                      ? "重要"
                      : n.category === "feedback"
                      ? "FB"
                      : "通知"}
                  </span>
                  <span className="font-bold">{n.title}</span>
                  <span className="text-muted">
                    {n.target_member_id
                      ? `→ ${memberNameById.get(n.target_member_id) ?? "個別"}`
                      : "→ 全員"}
                  </span>
                </div>
                <span className="text-muted">
                  {new Date(n.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
              {n.body && (
                <p className="mt-1 text-muted truncate">{n.body}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
