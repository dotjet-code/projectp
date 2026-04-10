import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";

/**
 * PATCH /api/admin/stages/:id/submissions/:subId
 * body: { status: "approved" | "rejected", reviewNote?: string }
 *
 * 承認時: balance_entries に profit を加算（既存があれば上書きではなく合算）
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; subId: string }> }
) {
  const { id: stageId, subId } = await ctx.params;
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

  // 提出を取得
  const { data: sub, error: fetchErr } = await supabase
    .from("balance_submissions")
    .select("id, member_id, profit, status")
    .eq("id", subId)
    .maybeSingle();
  if (fetchErr || !sub) {
    return NextResponse.json({ error: "submission not found" }, { status: 404 });
  }
  if ((sub.status as string) !== "pending") {
    return NextResponse.json(
      { error: "already reviewed" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // ステータス更新
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

  // 承認時: balance_entries に加算
  if (body.status === "approved") {
    const memberId = sub.member_id as string;
    const profit = Number(sub.profit);

    // 既存の balance_entry を取得
    const { data: existing } = await supabase
      .from("balance_entries")
      .select("id, amount")
      .eq("member_id", memberId)
      .eq("period_id", stageId)
      .maybeSingle();

    if (existing) {
      // 合算
      const newAmount = Number(existing.amount) + profit;
      await supabase
        .from("balance_entries")
        .update({ amount: newAmount })
        .eq("id", existing.id);
    } else {
      // 新規
      await supabase.from("balance_entries").insert({
        member_id: memberId,
        period_id: stageId,
        amount: profit,
        note: "スクショ承認から自動反映",
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
