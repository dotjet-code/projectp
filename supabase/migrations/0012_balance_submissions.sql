-- メンバーが提出する収支スクショ + 自動認識結果
create table if not exists balance_submissions (
  id bigserial primary key,
  member_id uuid not null references members(id) on delete cascade,
  period_id uuid references periods(id) on delete set null,

  -- 画像
  image_url text not null,

  -- AI 自動認識結果（メンバーが修正可能）
  purchase_amount int not null default 0,    -- 購入金額
  payout_amount int not null default 0,      -- 払戻金額
  profit int not null default 0,             -- 利益 (payout - purchase)

  -- AI が抽出した補助情報
  race_info text,              -- "三国2R 3連単 1-2-3"
  race_date text,              -- "8月2日"
  raw_ocr jsonb,               -- AI レスポンス全文

  -- メンバーのメモ
  note text,

  -- 運営レビュー
  status text not null default 'pending',    -- 'pending' | 'approved' | 'rejected'
  reviewed_at timestamptz,
  review_note text,

  created_at timestamptz not null default now()
);

create index if not exists balance_submissions_period_member_idx
  on balance_submissions (period_id, member_id);
create index if not exists balance_submissions_status_idx
  on balance_submissions (status);

alter table balance_submissions enable row level security;
