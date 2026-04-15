-- 予想の賭式を 6 種類に拡張
--
-- 既存の player_win/player_tri/pit_win/pit_tri は後方互換のため残すが、
-- 新しい予想は以下の 6 カラムに保存される。
-- 全 12 名(PLAYER+PIT 全体) から選ぶ。
--
-- tansho     jsonb [uuid]        単勝: 1 着 1 名
-- fukusho    jsonb [uuid]        複勝: 3 着以内 1 名
-- nirenpuku  jsonb [uuid, uuid]  二連複: 1-2 着 順不同
-- nirentan   jsonb [uuid, uuid]  二連単: 1-2 着 順通り
-- sanrenpuku jsonb [uuid uuid uuid]  三連複: 1-2-3 着 順不同
-- sanrentan  jsonb [uuid uuid uuid]  三連単: 1-2-3 着 順通り
--
-- スコア配分: 1 / 2 / 5 / 10 / 15 / 30 = 最大 63 点

alter table predictions
  add column if not exists tansho jsonb default '[]'::jsonb,
  add column if not exists fukusho jsonb default '[]'::jsonb,
  add column if not exists nirenpuku jsonb default '[]'::jsonb,
  add column if not exists nirentan jsonb default '[]'::jsonb,
  add column if not exists sanrenpuku jsonb default '[]'::jsonb,
  add column if not exists sanrentan jsonb default '[]'::jsonb;
