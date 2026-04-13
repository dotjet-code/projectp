-- 予想の締切
--
-- Stage (periods) に予想締切を追加。
-- 通常は「特番の直前」を指定する想定。
-- null なら締切なし（Stage が active である限り受け付ける）。

alter table periods
  add column if not exists predictions_close_at timestamptz;
