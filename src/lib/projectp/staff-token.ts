import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type StaffToken = {
  id: number;
  token: string;
  label: string | null;
  expiresAt: string;
  createdAt: string;
};

/**
 * 消込用トークンを生成。デフォルトで当日 23:59 まで有効。
 */
export async function createStaffToken(input: {
  label?: string;
  expiresAt?: string;
  createdBy?: string;
}): Promise<StaffToken> {
  const supabase = createAdminClient();
  const token = randomBytes(24).toString("base64url");

  // デフォルト: 今日の 23:59:59
  const defaultExpiry = new Date();
  defaultExpiry.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("staff_scan_tokens")
    .insert({
      token,
      label: input.label ?? null,
      expires_at: input.expiresAt ?? defaultExpiry.toISOString(),
      created_by: input.createdBy ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const row = data as {
    id: number;
    token: string;
    label: string | null;
    expires_at: string;
    created_at: string;
  };
  return {
    id: row.id,
    token: row.token,
    label: row.label,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

/**
 * トークンを検証。有効なら true。
 */
export async function validateStaffToken(
  token: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("staff_scan_tokens")
    .select("id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!data) return false;
  const expires = new Date((data as { expires_at: string }).expires_at);
  return expires.getTime() > Date.now();
}

export async function listStaffTokens(): Promise<StaffToken[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("staff_scan_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return ((data ?? []) as Array<{
    id: number;
    token: string;
    label: string | null;
    expires_at: string;
    created_at: string;
  }>).map((r) => ({
    id: r.id,
    token: r.token,
    label: r.label,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));
}
