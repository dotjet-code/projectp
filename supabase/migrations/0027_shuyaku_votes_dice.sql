-- 主役指名にサイコロ要素を追加
-- 1票あたり 1〜6 のランダム値が入る (サーバー側で決定)。
-- 既存行は default 1 で互換維持。
alter table shuyaku_votes
  add column if not exists value smallint not null default 1
    check (value between 1 and 6);

-- 集計用インデックス: member_id ごとの SUM(value) で使う
create index if not exists shuyaku_votes_member_value_idx
  on shuyaku_votes (member_id, value);
