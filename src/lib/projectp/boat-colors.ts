/**
 * ボートレース 6 カラーの定義。
 *
 * 各色には「メイン」「薄め背景」「テキスト用」「グラデーション」を用意し、
 * member detail や card で適用できるようにする。
 */

export type BoatColorNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type BoatColorTheme = {
  number: BoatColorNumber;
  label: string;       // "1号艇" etc
  name: string;        // "白" etc
  /** 主色（ボーダー・アイコン・バーに使う） */
  main: string;
  /** 濃いめ（テキストに使っても読めるトーン） */
  dark: string;
  /** 薄い背景色 */
  bg: string;
  /** 更に薄い背景（カード全体） */
  bgSubtle: string;
  /** グラデーション from → to */
  gradientFrom: string;
  gradientTo: string;
  /** テキストが白文字でいいか */
  lightText: boolean;
};

export const BOAT_COLORS: Record<BoatColorNumber, BoatColorTheme> = {
  1: {
    number: 1,
    label: "1号艇",
    name: "白",
    main: "#9CA3AF",     // グレーをアクセントに（白は見えないので）
    dark: "#374151",
    bg: "#F3F4F6",
    bgSubtle: "#F9FAFB",
    gradientFrom: "#E5E7EB",
    gradientTo: "#F9FAFB",
    lightText: false,
  },
  2: {
    number: 2,
    label: "2号艇",
    name: "黒",
    main: "#1F2937",
    dark: "#111827",
    bg: "#1F2937",
    bgSubtle: "#111827",
    gradientFrom: "#1F2937",
    gradientTo: "#374151",
    lightText: true,
  },
  3: {
    number: 3,
    label: "3号艇",
    name: "赤",
    main: "#E60012",
    dark: "#B91C1C",
    bg: "#FEF2F2",
    bgSubtle: "#FFF5F5",
    gradientFrom: "#E60012",
    gradientTo: "#FF4D5A",
    lightText: false,
  },
  4: {
    number: 4,
    label: "4号艇",
    name: "青",
    main: "#0068B7",
    dark: "#1E40AF",
    bg: "#EFF6FF",
    bgSubtle: "#F0F7FF",
    gradientFrom: "#0068B7",
    gradientTo: "#3B82F6",
    lightText: false,
  },
  5: {
    number: 5,
    label: "5号艇",
    name: "黄",
    main: "#CA8A04",
    dark: "#92400E",
    bg: "#FEFCE8",
    bgSubtle: "#FFFDE7",
    gradientFrom: "#EAB308",
    gradientTo: "#FDE047",
    lightText: false,
  },
  6: {
    number: 6,
    label: "6号艇",
    name: "緑",
    main: "#00A73C",
    dark: "#166534",
    bg: "#F0FDF4",
    bgSubtle: "#F5FFF8",
    gradientFrom: "#00A73C",
    gradientTo: "#4ADE80",
    lightText: false,
  },
};

export function getBoatColor(n: number | null | undefined): BoatColorTheme | null {
  if (n === null || n === undefined) return null;
  return BOAT_COLORS[n as BoatColorNumber] ?? null;
}

/**
 * 出馬表 / ランキング行で使う、レース公式の艇番プレート色。
 * BOAT_COLORS とは別用途 (カード内の小さな「号艇」チップに使う実寸色)。
 */
export const BOAT_PLATES: Record<
  BoatColorNumber,
  { bg: string; border: string; fg: string }
> = {
  1: { bg: "#F5F5F0", border: "#111111", fg: "#111111" },
  2: { bg: "#1A1A1A", border: "#1A1A1A", fg: "#F5F1E8" },
  3: { bg: "#D41E28", border: "#D41E28", fg: "#FFFFFF" },
  4: { bg: "#1E4BC8", border: "#1E4BC8", fg: "#FFFFFF" },
  5: { bg: "#F2C81B", border: "#F2C81B", fg: "#111111" },
  6: { bg: "#0F8F4A", border: "#0F8F4A", fg: "#FFFFFF" },
};
