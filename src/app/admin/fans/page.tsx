import { AdminNav } from "../admin-nav";
import { listFans } from "@/lib/projectp/fan-profile";
import { FansClient } from "./fans-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "ファン管理" };

export default async function AdminFansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const fans = await listFans(params.q);

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-8">
      <AdminNav current="fans" />
      <h1 className="text-2xl font-extrabold mb-2">ファン管理</h1>
      <p className="text-xs text-muted mb-6">
        ファン会員の一覧。status を変更すると景品発行対象から外れる。
      </p>
      <FansClient initialQuery={params.q ?? ""} fans={fans} />
    </main>
  );
}
