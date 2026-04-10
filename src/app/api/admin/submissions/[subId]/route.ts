import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/projectp/audit";
import { getActiveStage } from "@/lib/projectp/stage";

/**
 * PATCH /api/admin/submissions/:subId
 * body: { status: "approved" | "rejected" | "revoked" }
 *
 * period_id が null の提出は、承認時に active Stage を自動補完する。
 */

async function resolvePeriodId(sub: { period_id: unknown }): Promise<string | null> {
  if (sub.period_id) return sub.period_id as string;
  const stage = await getActiveStage().catch(() => null);
  return stage?.id ?? null;
}

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

  // period_id を解決（null なら active Stage で補完）
  const periodId = await resolvePeriodId(sub);

  // 取り消し: approved or rejected → pending に戻す
  if (newStatus === "revoked") {
    if (currentStatus === "pending") {
      return NextResponse.json({ error: "already pending" }, { status: 400 });
    }

    // approved だった場合、balance_entries から profit を減算
    if (currentStatus === "approved" && periodId) {
      const memberId = sub.member_id as string;
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

  // period_id が null だった場合、この機会に補完して保存
  const updatePatch: Record<string, unknown> = {
    status: newStatus,
    reviewed_at: now,
    review_note: body.reviewNote ?? null,
  };
  if (!sub.period_id && periodId) {
    updatePatch.period_id = periodId;
  }

  const { error: upErr } = await supabase
    .from("balance_submissions")
    .update(updatePatch)
    .eq("id", subId);
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // 承認時: balance_entries に加算
  if (newStatus === "approved" && periodId) {
    const memberId = sub.member_id as string;
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
