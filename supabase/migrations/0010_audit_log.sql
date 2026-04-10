-- 運営操作の監査ログ
create table if not exists audit_log (
  id bigserial primary key,
  action text not null,          -- 'stage.finalize' | 'stage.reopen' | 'stage.delete' | 'member.create' | 'member.delete' | 'batch.run' etc
  actor text,                    -- 運営のメール or 'cron'
  target_type text,              -- 'stage' | 'member' | 'batch'
  target_id text,
  detail text,                   -- 人が読める1行サマリ
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx
  on audit_log (created_at desc);

alter table audit_log enable row level security;
