-- Stage 順位予想
-- 匿名 Cookie × Stage で 1つの予想。上書き可。
create table if not exists predictions (
  id bigserial primary key,
  cookie_id text not null,
  period_id uuid not null references periods(id) on delete cascade,
  entry_type text not null default 'normal',   -- 'normal' | 'welcome'
  player_win jsonb not null default '[]'::jsonb,  -- uuid[2]
  player_tri jsonb not null default '[]'::jsonb,  -- uuid[3]
  pit_win jsonb not null default '[]'::jsonb,     -- uuid[2]
  pit_tri jsonb not null default '[]'::jsonb,     -- uuid[3]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cookie_id, period_id)
);

create index if not exists predictions_period_idx on predictions (period_id);

alter table predictions enable row level security;
