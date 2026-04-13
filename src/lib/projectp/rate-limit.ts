import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * シンプルな DB ベースのレート制限。
 * Vercel の serverless でもインスタンス間で一貫するように Postgres を使う。
 *
 * - per-IP: 1 時間あたり N 回
 * - per-email: 1 時間あたり M 回
 *
 * 試行回数を数えてから記録する形式（古典的な fixed-window）。
 * 厳密な leaky bucket ではないが用途には十分。
 */

export function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export type RateLimitResult = {
  ok: boolean;
  reason?: "ip_exceeded" | "email_exceeded";
};

export async function checkAndRecordMagicLinkAttempt(input: {
  ip: string | null;
  email: string;
  ua: string | null;
  limits?: {
    perIpPerHour?: number;
    perEmailPerHour?: number;
  };
}): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const perIp = input.limits?.perIpPerHour ?? 8;
  const perEmail = input.limits?.perEmailPerHour ?? 4;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const emailHash = hashEmail(input.email);

  if (input.ip) {
    const { count: ipCount } = await supabase
      .from("auth_attempts")
      .select("*", { count: "exact", head: true })
      .eq("kind", "fan.magic_link")
      .eq("ip", input.ip)
      .gte("created_at", since);
    if ((ipCount ?? 0) >= perIp) {
      return { ok: false, reason: "ip_exceeded" };
    }
  }

  const { count: emailCount } = await supabase
    .from("auth_attempts")
    .select("*", { count: "exact", head: true })
    .eq("kind", "fan.magic_link")
    .eq("email_hash", emailHash)
    .gte("created_at", since);
  if ((emailCount ?? 0) >= perEmail) {
    return { ok: false, reason: "email_exceeded" };
  }

  await supabase.from("auth_attempts").insert({
    kind: "fan.magic_link",
    ip: input.ip,
    email_hash: emailHash,
    ua: input.ua,
  });

  return { ok: true };
}
