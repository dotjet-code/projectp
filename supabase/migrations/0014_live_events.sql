-- ライブイベント投票システム
-- ワンタイムコード + チケット制

create table if not exists live_events (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references periods(id) on delete set null,
  title text not null,
  event_date date not null,
  venue text,
  status text not null default 'draft',  -- 'draft' | 'open' | 'closed'
  default_tickets int not null default 3,
  created_at timestamptz not null default now()
);

alter table live_events enable row level security;

create table if not exists event_codes (
  id bigserial primary key,
  event_id uuid not null references live_events(id) on delete cascade,
  code text not null unique,
  tickets_total int not null default 3,
  tickets_used int not null default 0,
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists event_codes_event_idx on event_codes (event_id);
create index if not exists event_codes_code_idx on event_codes (code);

alter table event_codes enable row level security;

create table if not exists event_votes (
  id bigserial primary key,
  event_id uuid not null references live_events(id) on delete cascade,
  code_id bigint not null references event_codes(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists event_votes_event_member_idx
  on event_votes (event_id, member_id);

alter table event_votes enable row level security;
