-- メンバープロフィール拡張
alter table members
  add column if not exists bio text,
  add column if not exists sns_instagram text,
  add column if not exists sns_x text,
  add column if not exists sns_youtube text,
  add column if not exists sns_tiktok text;
