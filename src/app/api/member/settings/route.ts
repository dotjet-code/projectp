import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("members")
    .select("name, bio, sns_instagram, sns_x, sns_youtube, sns_tiktok")
    .eq("id", memberId)
    .single();

  return NextResponse.json({ profile: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) return NextResponse.json({ error: "not found" }, { status: 404 });

  function sanitizeUrl(val: string): string | null {
    const trimmed = val.trim().slice(0, 200);
    if (!trimmed) return null;
    try {
      const u = new URL(trimmed);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      return trimmed;
    } catch {
      return null;
    }
  }

  const admin = createAdminClient();
  const update: Record<string, unknown> = {};
  if (typeof body.bio === "string") update.bio = body.bio.slice(0, 500);
  if (typeof body.snsInstagram === "string")
    update.sns_instagram = sanitizeUrl(body.snsInstagram);
  if (typeof body.snsX === "string") update.sns_x = sanitizeUrl(body.snsX);
  if (typeof body.snsYoutube === "string")
    update.sns_youtube = sanitizeUrl(body.snsYoutube);
  if (typeof body.snsTiktok === "string")
    update.sns_tiktok = sanitizeUrl(body.snsTiktok);

  const { error } = await admin
    .from("members")
    .update(update)
    .eq("id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
