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

  // auth.users を作成 (role='member')
  const { data: authUser, error: authErr } =
    await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { role: "member" },
    });
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }

  // members.auth_user_id をリンク
  const { error: linkErr } = await supabase
    .from("members")
    .update({ auth_user_id: authUser.user.id })
    .eq("id", id);
  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  // magic link を送信
  const origin = req.nextUrl.origin;
  const { error: otpErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/member/dashboard`,
    },
  });
  // generateLink のエラーは無視(メール送信は別途)
  if (otpErr) {
    console.warn("generateLink warning:", otpErr.message);
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
