import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";

/**
 * POST /api/admin/members/:id/invite
 * body: { email }
 *
 * メンバーを招待: auth.users に role='member' で作成し、
 * members.auth_user_id にリンク。magic link メールを送信。
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : null;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // メンバー存在チェック
  const { data: member } = await supabase
    .from("members")
    .select("id, name, auth_user_id")
    .eq("id", id)
    .maybeSingle();
  if (!member) {
    return NextResponse.json({ error: "member not found" }, { status: 404 });
  }
  if ((member as { auth_user_id: string | null }).auth_user_id) {
    return NextResponse.json(
      { error: "このメンバーは既に招待済みです" },
      { status: 400 }
    );
  }

  // auth.users を作成 (role='member') + 招待メールを送信
  const origin = req.nextUrl.origin;
  const { data: authUser, error: authErr } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role: "member" },
      redirectTo: `${origin}/auth/callback?next=/member/dashboard`,
    });
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }

  // app_metadata に role='member' を設定
  // (inviteUserByEmail は user_metadata にしか data を入れないため)
  await supabase.auth.admin.updateUserById(authUser.user.id, {
    app_metadata: { role: "member" },
  });

  // members.auth_user_id をリンク
  const { error: linkErr } = await supabase
    .from("members")
    .update({ auth_user_id: authUser.user.id })
    .eq("id", id);
  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  await logAudit({
    action: "member.invite",
    targetType: "member",
    targetId: id,
    detail: `${(member as { name: string }).name} を ${email} で招待`,
  });

  return NextResponse.json({
    ok: true,
    message: `${email} に招待を送りました。メンバーはメール内のリンクからログインできます。`,
  });
}
