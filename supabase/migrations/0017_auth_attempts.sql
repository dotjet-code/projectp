-- ファン認証のレート制限用ログ
--
-- magic link 送信や fan signup を IP/メール単位で記録し、
-- 一定時間内の試行回数を数えて制限する。
-- 古い行は定期的に削除する想定（cron で created_at < now() - 7 day を delete）。

create table if not exists auth_attempts (
  id bigserial primary key,
  kind text not null,            -- 'fan.magic_link'
  ip inet,
  email_hash text,               -- sha256(lower(email)) で保存（生メールを残さない）
  ua text,
  created_at timestamptz not null default now()
);

create index if not exists auth_attempts_ip_idx
  on auth_attempts (kind, ip, created_at desc);
create index if not exists auth_attempts_email_idx
  on auth_attempts (kind, email_hash, created_at desc);
create index if not exists auth_attempts_created_idx
  on auth_attempts (created_at);

alter table auth_attempts enable row level security;
