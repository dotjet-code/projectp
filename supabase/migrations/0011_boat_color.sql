-- メンバーのボートレースカラー（1〜6号艇）
-- イベント後に割り当てが決まったら値を入れる。null は未割り当て。
alter table members
  add column if not exists boat_color int check (boat_color between 1 and 6);
