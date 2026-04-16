-- スタッフ消込用のワンタイムトークン
-- admin が当日分を発行し、スタッフに URL を共有する。
-- ログイン不要で景品消込のみ実行可能。

create table if not exists staff_scan_tokens (
  id bigserial primary key,
  token text not null unique,
  label text,                    -- 「4/29 ライブ スタッフA」など
  expires_at timestamptz not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists staff_scan_tokens_token_idx
  on staff_scan_tokens (token) where expires_at > now();

alter table staff_scan_tokens enable row level security;
