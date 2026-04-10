import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";

/**
 * 開発用：メンバー一覧取得 / 作成 / 更新エンドポイント。
 * 本番では認証付きの管理画面から呼ぶべきだが、MVP では直叩き。
 */
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, name, handle, youtube_channel_id, google_connected_at")
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ members: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.name === "string") patch.name = body.name;
  if ("handle" in body) patch.handle = body.handle;
  if ("youtube_channel_id" in body)
    patch.youtube_channel_id = body.youtube_channel_id;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .update(patch)
    .eq("id", body.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ member: data });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const supabase = createAdminClient();
  // 名前を取得（ログ用）
  const { data: m } = await supabase
    .from("members")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await logAudit({
    action: "member.delete",
    targetType: "member",
    targetId: id,
    detail: `${(m?.name as string) ?? id} を削除`,
  });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .insert({
      name: body.name.trim(),
      handle: body.handle ?? null,
      youtube_channel_id: body.youtube_channel_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await logAudit({
    action: "member.create",
    targetType: "member",
    targetId: (data as { id: string }).id,
    detail: `${body.name.trim()} を追加`,
  });
  return NextResponse.json({ member: data });
}
