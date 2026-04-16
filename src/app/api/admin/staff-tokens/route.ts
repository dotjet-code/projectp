import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createStaffToken, listStaffTokens } from "@/lib/projectp/staff-token";

export const dynamic = "force-dynamic";

export async function GET() {
  const tokens = await listStaffTokens();
  return NextResponse.json({ tokens });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const token = await createStaffToken({
      label: body?.label ?? null,
      expiresAt: body?.expiresAt ?? undefined,
      createdBy: user.id,
    });
    return NextResponse.json({ token });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
