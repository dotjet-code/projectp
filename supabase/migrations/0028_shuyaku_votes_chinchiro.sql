-- 「今日の賽」(チンチロ式ボーナス票) 対応
--
-- 通常投票 (kind='daily'): 1人1日1回、出目 1〜6
-- ボーナス票 (kind='chinchiro'): 1ユーザー1日1回、好きな1人に投じる。
--   3 個サイコロの役で票数が決まる (ピンゾロ 15, ゾロ目 X×2, シゴロ 8,
--   通常役 1-6, ヒフミ 1, 目なし = 再振り後も無ければ 1)。

alter table shuyaku_votes
  add column if not exists kind text not null default 'daily'
    check (kind in ('daily', 'chinchiro')),
  add column if not exists dice smallint[] check (
    dice is null or (array_length(dice, 1) = 3
      and dice[1] between 1 and 6
      and dice[2] between 1 and 6
      and dice[3] between 1 and 6)
  ),
  add column if not exists hand text check (
    hand is null or hand in ('pinzoro', 'zorome', 'shigoro', 'normal', 'hifumi', 'menashi')
  );

-- value の上限を 1〜6 → 0〜30 に拡張 (ピンゾロ 15票 + 将来の倍率拡張余地)
alter table shuyaku_votes drop constraint if exists shuyaku_votes_value_check;
alter table shuyaku_votes
  add constraint shuyaku_votes_value_check
    check (value between 0 and 30);

-- 既存 unique (cookie_id, member_id, vote_date) は daily のみに限定
-- chinchiro は (cookie_id, vote_date) で 1 日 1 回 (member_id は自由)
alter table shuyaku_votes drop constraint if exists shuyaku_votes_cookie_id_member_id_vote_date_key;

create unique index if not exists shuyaku_votes_daily_unique_idx
  on shuyaku_votes (cookie_id, member_id, vote_date)
  where kind = 'daily';

create unique index if not exists shuyaku_votes_chinchiro_unique_idx
  on shuyaku_votes (cookie_id, vote_date)
  where kind = 'chinchiro';
