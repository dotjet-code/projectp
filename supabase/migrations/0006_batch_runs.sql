-- バッチ実行履歴
-- 日次バッチ / 手動バッチの両方がここに記録される
create table if not exists batch_runs (
  id bigserial primary key,
  source text not null,           -- 'cron' | 'admin'
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total int not null default 0,
  succeeded_count int not null default 0,
  failed_count int not null default 0,
  failed_summary text             -- 失敗時の簡易サマリ
);

create index if not exists batch_runs_started_at_idx
  on batch_runs (started_at desc);

alter table batch_runs enable row level security;
