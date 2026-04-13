-- 順位予想の景品
--
-- 設計:
--   - 管理者が Stage 確定後に一括発行する。
--   - 1ユーザー × 1period × 景品種別 = 最大1枚（unique で担保）。
--   - reward_code は推測不可な短い一意コード。会場で人がスキャン/目視照合し、
--     redeem 時刻と実行 admin を記録する。
--   - 受取は会場限定なので、オンラインで無効化する必要はない。

create table if not exists prediction_rewards (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  period_id uuid not null references periods(id) on delete cascade,
  prediction_id bigint references predictions(id) on delete set null,
  reward_type text not null, -- 'live_vote_bonus' | 'cheki_free'
  reward_code text not null unique,
  total_score int,
  issued_at timestamptz not null default now(),
  issued_by uuid references auth.users(id),
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users(id),
  redeemed_note text,
  unique (user_id, period_id, reward_type)
);

create index if not exists prediction_rewards_user_idx
  on prediction_rewards(user_id);
create index if not exists prediction_rewards_period_idx
  on prediction_rewards(period_id);
create index if not exists prediction_rewards_unredeemed_idx
  on prediction_rewards(reward_code) where redeemed_at is null;

alter table prediction_rewards enable row level security;
