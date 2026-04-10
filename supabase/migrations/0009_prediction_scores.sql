-- 予想の的中スコア保存カラム
-- スコアは Stage 確定後に計算される。
-- total_score: 全スロットの合計（最大 10 点 = 2+3+2+3）
-- slot_scores: { playerWin:[0|1,0|1], playerTri:[...3], pitWin:[...2], pitTri:[...3] }
alter table predictions
  add column if not exists total_score int,
  add column if not exists slot_scores jsonb,
  add column if not exists scored_at timestamptz;

create index if not exists predictions_period_score_idx
  on predictions (period_id, total_score desc);
