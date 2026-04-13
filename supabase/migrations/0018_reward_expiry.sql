-- 景品に有効期限を追加
--
-- 設計:
--   - expires_at は null 許容（= 無期限）。
--   - 発行時に管理者が指定。通常はライブイベント当日を期限に設定する想定。
--   - 期限切れの判定は redeem 時と表示時に行う。行自体は残す（監査用）。

alter table prediction_rewards
  add column if not exists expires_at timestamptz;

create index if not exists prediction_rewards_expires_idx
  on prediction_rewards(expires_at)
  where redeemed_at is null and expires_at is not null;
