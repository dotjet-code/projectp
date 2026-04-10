import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveStage } from "@/lib/projectp/stage";
import { analyzeReceiptImage } from "@/lib/projectp/ocr-receipt";

/**
 * POST /api/public/submit-balance
 *
 * メンバーが収支スクショを提出する。
 * - multipart/form-data で画像 + member_id + (任意) 手動修正値
 * - 画像を Supabase Storage にアップロード
 * - Claude Haiku で自動解析
 * - balance_submissions に pending で保存
 *
 * Query: ?analyze_only=1 だと解析結果だけ返す（保存しない）
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const analyzeOnly = req.nextUrl.searchParams.get("analyze_only") === "1";

  const formData = await req.formData();
  const memberId = formData.get("member_id") as string | null;
  const image = formData.get("image") as File | null;

  // 手動修正値（任意）
  const manualPurchase = formData.get("purchase") as string | null;
  const manualPayout = formData.get("payout") as string | null;
  const note = formData.get("note") as string | null;
  const broadcastDate = formData.get("broadcast_date") as string | null;
  const venue = formData.get("venue") as string | null;

  if (!memberId) {
    return NextResponse.json({ error: "member_id is required" }, { status: 400 });
  }
  if (!image) {
    return NextResponse.json({ error: "image is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // メンバー存在確認
  const { data: member } = await supabase
    .from("members")
    .select("id, name")
    .eq("id", memberId)
    .maybeSingle();
  if (!member) {
    return NextResponse.json({ error: "member not found" }, { status: 404 });
  }

  // 画像を base64 に変換して解析
  const arrayBuf = await image.arrayBuffer();
  const base64 = Buffer.from(arrayBuf).toString("base64");
  const mediaType = (image.type || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/gif";

  let ocrResult;
  try {
    ocrResult = await analyzeReceiptImage(base64, mediaType);
  } catch (e) {
    return NextResponse.json(
      {
        error: "画像解析に失敗しました",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }

  // 手動修正値があればそちらを優先
  const purchase =
    manualPurchase !== null ? Number(manualPurchase) : ocrResult.purchase;
  const payout =
    manualPayout !== null ? Number(manualPayout) : ocrResult.payout;
  const profit = payout - purchase;

  if (analyzeOnly) {
    return NextResponse.json({
      ocr: ocrResult,
      final: { purchase, payout, profit },
    });
  }

  // Supabase Storage にアップロード
  const stage = await getActiveStage().catch(() => null);
  const timestamp = Date.now();
  const ext = image.name?.split(".").pop() ?? "jpg";
  const storagePath = `balance/${memberId}/${timestamp}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("receipts")
    .upload(storagePath, arrayBuf, {
      contentType: image.type || "image/jpeg",
      upsert: false,
    });
  if (uploadErr) {
    return NextResponse.json(
      { error: `画像アップロード失敗: ${uploadErr.message}` },
      { status: 500 }
    );
  }

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from("receipts")
    .getPublicUrl(storagePath);
  const imageUrl = urlData.publicUrl;

  // balance_submissions に保存
  const { data: submission, error: insertErr } = await supabase
    .from("balance_submissions")
    .insert({
      member_id: memberId,
      period_id: stage?.id ?? null,
      image_url: imageUrl,
      purchase_amount: purchase,
      payout_amount: payout,
      profit,
      race_info: ocrResult.raceInfo,
      race_date: ocrResult.raceDate,
      raw_ocr: ocrResult.raw,
      note: note ?? null,
      venue: venue ?? null,
      broadcast_date: broadcastDate ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json(
      { error: insertErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    submission,
    ocr: ocrResult,
  });
}
