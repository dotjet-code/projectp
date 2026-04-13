-- Fan ユーザー（順位予想の景品対象者）導入
--
-- 設計方針:
--   - 認証は Supabase Auth を共用。
--   - 管理者とファンは auth.users.raw_app_meta_data.role で区別する。
--     'admin' → 運営（/admin/* にアクセス可）
--     未設定  → 一般ファン
--   - 移行時点で auth.users に存在する全アカウントは運営なので
--     role='admin' をまとめて付与する。
--   - 以降、/fan/signup 経由で作られたアカウントは role 未設定のまま。

-- 1) 既存ユーザー全員に admin ロールを付与
update auth.users
set raw_app_meta_data = jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
where coalesce(raw_app_meta_data->>'role', '') = '';

-- 2) ファン会員プロフィール（auth.users と 1:1）
create table if not exists fan_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone_e164 text unique,
  phone_verified_at timestamptz,
  signup_ip inet,
  signup_ua text,
  status text not null default 'active', -- 'active' | 'flagged' | 'banned'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table fan_profiles enable row level security;

-- 3) predictions にログインユーザーを紐付け（cookie_id 方式と併存）
alter table predictions
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- ログイン済ユーザーは 1 period につき 1 予想
create unique index if not exists predictions_user_period_uidx
  on predictions(user_id, period_id)
  where user_id is not null;

create index if not exists predictions_user_idx on predictions(user_id);
