import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーコンポーネント / Route Handler 用 Supabase クライアント。
 * セッション Cookie を読み書きする。
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase env vars");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component から呼ばれた場合は set 不可だが middleware で処理されるので無視
        }
      },
    },
  });
}
