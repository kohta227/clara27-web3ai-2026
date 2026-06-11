-- ============================================
-- 「教えて、minta先生」用 DBスキーマ
-- ============================================
-- 使い方:
--   1. Supabase ダッシュボード → SQL Editor を開く
--   2. このファイル全部を貼り付けて Run
--   3. テーブル qa_logs が作られ、anon ロールで閲覧のみ可能になる
-- ============================================

create table if not exists public.qa_logs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  topic_summary text not null,
  answer_summary text not null,
  question_char_count int not null,
  answer_char_count int not null,
  contains_pii boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create index if not exists qa_logs_created_at_idx
  on public.qa_logs (created_at desc);

-- 行レベルセキュリティ（RLS）を有効化
alter table public.qa_logs enable row level security;

-- 匿名ユーザー（フロントエンド）は読み取りだけ許可
drop policy if exists "anon can read qa_logs" on public.qa_logs;
create policy "anon can read qa_logs"
  on public.qa_logs
  for select
  to anon
  using (true);

-- 書き込みは service_role（サーバサイド）からのみ
-- → クライアントから直接 insert することはできない
