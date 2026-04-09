import { createClient } from "@supabase/supabase-js";

/**
 * service_role キーを使うサーバーサイド専用クライアント。
 * RLS をバイパスするので、絶対にクライアントに渡さないこと。
 * バッチ処理や管理 API Route からのみ使う。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
