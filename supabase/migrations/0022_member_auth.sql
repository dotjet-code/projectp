-- メンバー用認証
-- admin がメンバーを招待すると auth.users に role='member' で作成し、
-- members.auth_user_id でリンクする。

alter table members
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
