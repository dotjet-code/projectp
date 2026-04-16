-- メンバー向けお知らせ
create table if not exists member_notifications (
  id bigserial primary key,
  target_member_id uuid references members(id) on delete cascade, -- null = 全員向け
  title text not null,
  body text,
  category text not null default 'info', -- 'info' | 'feedback' | 'urgent'
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists member_notifications_target_idx
  on member_notifications (target_member_id, created_at desc);
alter table member_notifications enable row level security;

-- お知らせ既読管理
create table if not exists member_notification_reads (
  notification_id bigint not null references member_notifications(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, member_id)
);
alter table member_notification_reads enable row level security;

-- メンバースケジュール
create table if not exists member_schedules (
  id bigserial primary key,
  member_id uuid references members(id) on delete cascade, -- null = 全体スケジュール(運営配信)
  title text not null,
  event_type text not null default 'other', -- 'stream' | 'live' | 'deadline' | 'meeting' | 'other'
  event_date date not null,
  event_time time,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists member_schedules_member_date_idx
  on member_schedules (member_id, event_date);
create index if not exists member_schedules_date_idx
  on member_schedules (event_date);
alter table member_schedules enable row level security;
