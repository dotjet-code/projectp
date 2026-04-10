import { NextResponse } from "next/server";
import { runSnapshotBatch } from "@/lib/projectp/batch";

/**
 * 管理画面から「今すぐ更新」ボタン用。
 * middleware の Supabase 認証で保護されている。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const result = await runSnapshotBatch("admin");
  return NextResponse.json(result);
}
