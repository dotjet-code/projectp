import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";

/**
 * PATCH /api/admin/submissions/:subId
 * body: { status: "approved" | "rejected" | "revoked" }
 *
 * approved:  balance_entries に profit を加算
 * rejected:  記録のみ
 * revoked:   承認/却下を取り消して pending に戻す。
 *            元が approved だった場合は balance_entries から profit を減算。
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ subId: string }> }
) {
  const { subId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const validStatuses = ["approved", "rejected", "revoked"];
  if (!body || !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: "status must be 'approved', 'rejected', or 'revoked'" },
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

  const currentStatus = sub.status as string;
  const newStatus = body.status as string;

  // 取り消し: approved or rejected → pending に戻す
  if (newStatus === "revoked") {
    if (currentStatus === "pending") {
      return NextResponse.json({ error: "already pending" }, { status: 400 });
    }

    // approved だった場合、balance_entries から profit を減算
    if (currentStatus === "approved" && sub.period_id) {
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
        const newAmount = Number(existing.amount) - profit;
        await supabase
          .from("balance_entries")
          .update({ amount: newAmount })
          .eq("id", existing.id);
      }
    }

    await supabase
      .from("balance_submissions")
      .update({
        status: "pending",
        reviewed_at: null,
        review_note: null,
      })
      .eq("id", subId);

    await logAudit({
      action: "submission.revoked",
      targetType: "balance_submission",
      targetId: subId,
      detail: `提出 #${subId} の${
        currentStatus === "approved" ? "承認" : "却下"
      }を取り消し (利益: ${sub.profit})`,
    });

    return NextResponse.json({ ok: true });
  }

  // 通常の承認/却下: pending からのみ
  if (currentStatus !== "pending") {
    return NextResponse.json(
      { error: "先に取り消してから再審査してください" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { error: upErr } = await supabase
    .from("balance_submissions")
    .update({
      status: newStatus,
      reviewed_at: now,
      review_note: body.reviewNote ?? null,
    })
    .eq("id", subId);
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // 承認時: balance_entries に加算
  if (newStatus === "approved" && sub.period_id) {
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
    action: `submission.${newStatus}`,
    targetType: "balance_submission",
    targetId: subId,
    detail: `提出 #${subId} を${
      newStatus === "approved" ? "承認" : "却下"
    } (利益: ${sub.profit})`,
  });

  return NextResponse.json({ ok: true });
}
