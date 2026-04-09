/**
 * 集計期間ユーティリティ。
 * Project P は基本「当月」（その月の1日 00:00 〜 月末 23:59 JST 相当）で集計する。
 */

export type Period = {
  name: string;       // "2026-04"
  start: Date;        // UTC start (inclusive)
  end: Date;          // UTC end (exclusive)
  startDate: string;  // "YYYY-MM-DD"
  endDate: string;    // "YYYY-MM-DD" (inclusive last day)
};

/**
 * "当月" の Period を返す。基準は JST。
 * 注: サーバー時刻 = UTC 想定。JST = UTC+9。
 */
export function currentPeriod(now: Date = new Date()): Period {
  // JST 時刻に変換した上で年月を取得
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = jst.getUTCFullYear();
  const month = jst.getUTCMonth(); // 0-11

  // 月初 (JST 00:00) = UTC で前日の 15:00
  const start = new Date(Date.UTC(year, month, 1, -9, 0, 0));
  // 翌月初 (JST 00:00)
  const end = new Date(Date.UTC(year, month + 1, 1, -9, 0, 0));

  // 表示用の YYYY-MM-DD（JST基準の暦日）
  const startDate = formatJstDate(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = formatJstDate(year, month, lastDay);

  return {
    name: `${year}-${String(month + 1).padStart(2, "0")}`,
    start,
    end,
    startDate,
    endDate,
  };
}

function formatJstDate(year: number, month0: number, day: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
