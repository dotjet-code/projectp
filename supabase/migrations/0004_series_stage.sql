-- Stage（旧 period）に Series 概念・タイトル・サブタイトルを追加
-- daily_snapshots に period_id を紐付け

-- series_number: 半年の大きな括り（1, 2, 3, ...）
-- stage_number:  その Series の中で何番目の Stage か（1〜6 想定）
-- title:         Stage のタイトル（例: "夜明け前"）
-- subtitle:      補助説明（例: "春の終わりに、誰が立つか"）
alter table periods
  add column if not exists series_number int,
  add column if not exists stage_number int,
  add column if not exists title text,
  add column if not exists subtitle text;

-- 既存の name カラムをタイトル扱いできるように NOT NULL を維持したまま残す
-- （name は "Series1 Stage2" のような自動生成文字列 or 手動入力）

-- daily_snapshots の紐付け
alter table daily_snapshots
  add column if not exists period_id uuid references periods(id) on delete set null;

create index if not exists daily_snapshots_period_member_idx
  on daily_snapshots (period_id, member_id);

-- active な period は常に 1 つだけ
create unique index if not exists periods_single_active_idx
  on periods (status) where status = 'active';
