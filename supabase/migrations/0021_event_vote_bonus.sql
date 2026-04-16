-- ライブ投票の予想ボーナス倍率
--
-- イベントごとに base_tickets と bonus_tiers を設定可能。
-- コード有効化時にファン会員の通算スコアと照合し、
-- tickets_total と bonus_multiplier を確定保存する。

-- イベントにボーナス設定を追加
alter table live_events
  add column if not exists base_tickets int not null default 3,
  add column if not exists bonus_tiers jsonb not null default '[
    {"minScore": 30, "multiplier": 2},
    {"minScore": 50, "multiplier": 3}
  ]'::jsonb;

-- コードにファン紐付け + 適用済み倍率
alter table event_codes
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists bonus_multiplier int not null default 1;
