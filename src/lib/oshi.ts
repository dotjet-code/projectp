/**
 * 推し情報を localStorage で管理する共通ヘルパ。
 *
 * - 推しスラッグと「選んだ日」(JST YYYY-MM-DD) を保存する。
 * - 翌日以降のチンチロでは自動投票させるため、選んだ日と今日を比較する。
 * - 旧形式 (プレーン文字列) からの読み出しにもフォールバック対応する。
 */

export const OSHI_KEY = "projectp.oshi";
export const OSHI_CHANGE_EVENT = "oshi:changed";

export interface StoredOshi {
  slug: string;
  setAt: string; // YYYY-MM-DD (JST)
}

export function todayJST(): string {
  const now = new Date();
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000;
  return new Date(jstMs).toISOString().slice(0, 10);
}

export function readOshi(): StoredOshi | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OSHI_KEY);
    if (!raw) return null;
    if (raw.startsWith("{")) {
      const parsed = JSON.parse(raw) as Partial<StoredOshi>;
      if (!parsed?.slug) return null;
      return { slug: parsed.slug, setAt: parsed.setAt ?? todayJST() };
    }
    return { slug: raw, setAt: todayJST() };
  } catch {
    return null;
  }
}

export function writeOshi(slug: string): StoredOshi {
  const value: StoredOshi = { slug, setAt: todayJST() };
  try {
    window.localStorage.setItem(OSHI_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(OSHI_CHANGE_EVENT));
  return value;
}

export function clearOshi(): void {
  try {
    window.localStorage.removeItem(OSHI_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(OSHI_CHANGE_EVENT));
}

// 推しが設定されていれば true (= チンチロで自動投票する)
export function shouldAutoVote(oshi: StoredOshi | null): boolean {
  return Boolean(oshi);
}
