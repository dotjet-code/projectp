import { createAdminClient } from "@/lib/supabase/admin";
import type { Member } from "@/lib/supabase/types";
import { CreateMemberForm } from "./create-member-form";
import { MemberRow } from "./member-row";

export const dynamic = "force-dynamic";

async function getMembers(): Promise<Member[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Member[];
}

function StatusBanner({
  status,
  reason,
}: {
  status?: string;
  reason?: string;
}) {
  if (!status) return null;
  const isSuccess = status === "success";
  return (
    <div
      className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
        isSuccess
          ? "border-green-300 bg-green-50 text-green-900"
          : "border-red-300 bg-red-50 text-red-900"
      }`}
    >
      {isSuccess ? (
        <>✅ 認可に成功しました。refresh_token を保存しました。</>
      ) : (
        <>❌ 認可に失敗しました: {reason ?? "unknown error"}</>
      )}
    </div>
  );
}

export default async function AdminConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reason?: string }>;
}) {
  const { status, reason } = await searchParams;
  const members = await getMembers();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">メンバー管理</h1>
      <p className="text-sm text-gray-600 mb-8">
        各メンバーの YouTube アカウントと連携し、バッチが Analytics API を叩けるようにします。
      </p>

      <StatusBanner status={status} reason={reason} />

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">メンバー追加（開発用）</h2>
        <CreateMemberForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">メンバー一覧</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">
            メンバーがまだ登録されていません。上のフォームから追加してください。
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
