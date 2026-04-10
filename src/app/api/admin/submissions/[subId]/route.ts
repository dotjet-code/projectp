import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";

/**
 * PATCH /api/admin/submissions/:subId
 * body: { status: "approved" | "rejected" }
 *
 * Stage ID を指定せずに審査する汎用エンドポイント。
 * 承認時は balance_entries に profit を加算。
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ subId: string }> }
) {
  const { subId } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (
    !body ||
    (body.status !== "approved" && body.status !== "rejected")
  ) {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: sub, error: fetchErr } = await supabase
    .from("balance_submissions")
    .select("id, member_id, period_id, profit, status")
    .eq("id", subId)
    .maybeSingle();
  if (fetchErr || !sub) {
    return NextResponse.json({ error: "submission not found" }, { status: 404 });
  }
  if ((sub.status as string) !== "pending") {
    return NextResponse.json({ error: "already reviewed" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { error: upErr } = await supabase
    .from("balance_submissions")
    .update({
      status: body.status,
      reviewed_at: now,
      review_note: body.reviewNote ?? null,
    })
    .eq("id", subId);
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  if (body.status === "approved" && sub.period_id) {
    const memberId = sub.member_id as string;
    const periodId = sub.period_id as string;
    const profit = Number(sub.profit);

    const { data: existing } = await supabase
      .from("balance_entries")
      .select("id, amount")
      .eq("member_id", memberId)
      .eq("period_id", periodId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("balance_entries")
        .update({ amount: Number(existing.amount) + profit })
        .eq("id", existing.id);
    } else {
      await supabase.from("balance_entries").insert({
        member_id: memberId,
        period_id: periodId,
        amount: profit,
        note: "配信収支から自動反映",
      });
    }
  }

  await logAudit({
    action: `submission.${body.status}`,
    targetType: "balance_submission",
    targetId: subId,
    detail: `提出 #${subId} を${
      body.status === "approved" ? "承認" : "却下"
    } (利益: ${sub.profit})`,
  });

  return NextResponse.json({ ok: true });
}
