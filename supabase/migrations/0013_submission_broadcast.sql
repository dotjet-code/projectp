-- 配信日・会場を提出に紐付け
alter table balance_submissions
  add column if not exists venue text,
  add column if not exists broadcast_date date;

create index if not exists balance_submissions_broadcast_date_idx
  on balance_submissions (broadcast_date desc);
