-- balance_entries は 1メンバー × 1Stage = 1行で上書き運用にする
-- 既存の重複行があれば最新だけ残してから unique を貼る想定（dev 環境はまだ空のはず）
create unique index if not exists balance_entries_member_period_uniq
  on balance_entries (member_id, period_id);

-- special_point_entries は日付別の複数エントリを許容するので unique は付けない
-- 検索性のためのインデックスだけ
create index if not exists special_point_entries_period_member_idx
  on special_point_entries (period_id, member_id);
