# MANUAL.md — 外部サービスの手動操作詳細

「教えて、minta先生」ハンズオン教材で使う **外部サービスの登録 / 操作手順** を1ページにまとめたもの。

Claude Code は外部サービスの**ブラウザ操作はできない**ので、これらは受講者自身がブラウザで実施します。

---

## 目次

1. [Google AI Studio — Gemini API キーの取得](#1-google-ai-studio--gemini-api-キーの取得)
2. [OpenAI Platform — OpenAI API キーの取得（任意）](#2-openai-platform--openai-api-キーの取得任意)
3. [GitHub — レポジトリの作成と push](#3-github--レポジトリの作成と-push)
4. [Vercel — プロジェクトのデプロイ](#4-vercel--プロジェクトのデプロイ)
5. [Supabase — Vercel Marketplace 経由で連携](#5-supabase--vercel-marketplace-経由で連携)
6. [Supabase SQL Editor — テーブル作成](#6-supabase-sql-editor--テーブル作成)
7. [Vercel — 環境変数の確認と Redeploy](#7-vercel--環境変数の確認と-redeploy)
8. [トラブル時の各サービスでの確認場所](#8-トラブル時の各サービスでの確認場所)

---

## 1. Google AI Studio — Gemini API キーの取得

### なぜこれが必要か
- 「教えて、minta先生」アプリが、ユーザーの質問を理解して回答する **AI** の正体は Google の Gemini モデル
- Gemini を API として呼び出すには **API キー** が必要
- AI Studio で取得すると **無料枠あり・クレジットカード不要**

### 手順

1. **https://aistudio.google.com/apikey** を開く
2. Google アカウントでログイン（既にログイン済みなら自動的に画面が出る）
3. **「APIキーを作成」**（"Create API key"）ボタンをクリック
4. プロジェクトを選択するダイアログが出たら:
   - **「新しいプロジェクトでAPIキーを作成」**（"Create API key in new project"）を選択
   - 既存プロジェクトがあって明確にそれに紐付けたい場合のみ既存を選ぶ
5. APIキーが生成される（`AIzaSy...` で始まる文字列）
6. **「キーをコピー」**ボタンでクリップボードへコピー
7. すぐに `.env.local` (or Vercel ダッシュボード) に貼り付けて、ブラウザのコピー履歴をクリア

### セキュリティ注意

- このキーは **無料枠の範囲なら漏れても課金リスクは小さい**が、レート制限を悪用されると自分のクォータを食われる
- 万一漏れたら、同じ画面の **「Delete」（ゴミ箱アイコン）** で削除して再生成
- 後でクォータが見たくなったら https://aistudio.google.com/ → 左下「Settings」or 「使用量」を確認

### 無料枠

- **Gemini 2.5 Flash**: 15 RPM (Requests Per Minute) / 1,500 RPD (Requests Per Day) ※2026/5時点
- 課金プランにアップグレードすると上限緩和

---

## 2. OpenAI Platform — OpenAI API キーの取得（任意）

### なぜこれが必要か
- フォールバック用。Gemini が落ちたり制限に当たったときの代替
- アプリは **`GEMINI_API_KEY` を優先**するが、**未設定なら `OPENAI_API_KEY` を見て切り替わる**設計
- OpenAI は有料（少額の課金が必要）

### 手順

1. **https://platform.openai.com/api-keys** を開く
2. OpenAI アカウントにサインイン or 新規登録
3. **クレジットカードを Billing に登録**（必須・少額でOK）:
   - Settings → Billing → Payment methods → Add payment method
   - クレジット残高: $5〜10 程度をチャージ（授業デモには十分）
4. API Keys ページに戻り、**「Create new secret key」**
5. 名前を付ける（例: `minta-sensei-handson`）
6. **「Create secret key」** → キーがコピーできる画面に（`sk-proj-...` で始まる）
7. **このキーは一度しか見えない**ので、すぐにコピー → `.env.local` (or Vercel ダッシュボード) に貼り付け

### セキュリティ注意

- OpenAI キーは漏れると **直接課金される**ので、Gemini より厳重に扱う
- 万一漏れたら同じ画面で即 Revoke して再生成
- 課金上限を設定: Billing → Usage limits → Monthly budget を $10 などに設定

---

## 3. GitHub — レポジトリの作成と push

### なぜこれが必要か
- Vercel は **GitHub と連携してデプロイ**する。コードを GitHub に置く必要がある
- ローカルで書いたコードを世界に公開する玄関口

### 手順

1. **https://github.com** にサインイン
2. 右上の **「+」 → New repository**
3. 設定:
   - Repository name: `minta-sensei-handson`（任意）
   - Description: 任意
   - Public / Private: **Public 推奨**（Vercel Hobby プランは Public が前提）
   - Initialize this repository: **何もチェックしない**（既存ローカルから push するため）
4. **「Create repository」**
5. 表示される URL（例: `git@github.com:YOUR-USERNAME/minta-sensei-handson.git`）をコピー
6. ローカルで:
   ```bash
   cd ~/Documents/projects/minta-sensei-handson  # 自分のディレクトリパス
   git remote set-url origin git@github.com:YOUR-USERNAME/minta-sensei-handson.git
   # もしくは
   git remote add mine git@github.com:YOUR-USERNAME/minta-sensei-handson.git
   git push -u origin main
   ```
7. ブラウザで自分のレポを開き、ファイルが反映されているか確認

### セキュリティ注意

- **`.env.local` が含まれていないか必ず確認**:
  - ブラウザで自分のレポを開いて、`.env.local` が表示されていないことをチェック
  - もし含まれていたら、即 API キーを Revoke + history から消す
- レポを Public にする前に: `git log --all -p | grep -iE 'sk-proj-|AIza|SUPABASE_SERVICE_ROLE'` で機密漏れ確認

---

## 4. Vercel — プロジェクトのデプロイ

### なぜこれが必要か
- 「世界からアクセスできるアプリ」にするための **公開先**
- Vercel は Next.js の作者である Vercel 社が提供しているサービス。Next.js を一番速くデプロイできる

### 手順

1. **https://vercel.com** にアクセス
2. **「Sign up」 → Continue with GitHub** を選択（GitHub アカウントで Vercel にログイン）
3. ダッシュボードで **「Add New」 → Project**
4. **「Import Git Repository」** で自分の `minta-sensei-handson` を探す → **「Import」**
5. 設定画面:
   - **Project Name**: `minta-sensei-handson`（そのままでOK）
   - **Framework Preset**: Next.js（自動検出）
   - **Root Directory**: そのまま（`./`）
   - **Build and Output Settings**: そのまま
6. **Environment Variables** セクションを開く:
   - Name: `GEMINI_API_KEY`
   - Value: 取得した Gemini API キー（`AIzaSy...`）
   - 全環境（Production / Preview / Development）にチェック
   - 必要なら `OPENAI_API_KEY` も追加（フォールバック用）
7. **「Deploy」** ボタンを押す
8. 1〜2分待つ → ビルドログが流れる
9. 完了すると **「Visit」** ボタンと公開URL（例: `https://minta-sensei-handson-xxxxx.vercel.app`）が表示

### セキュリティ注意

- 環境変数の値は Vercel 内では暗号化されるが、**ビルドログには出力されることがある**
- API キーを誤って `NEXT_PUBLIC_` プレフィックス付きで登録すると、**クライアント側 JS から見えてしまう**ので注意
- **Sensitive フラグ**: 環境変数登録時に「Sensitive」をチェックすると、ダッシュボード上でも値が伏せられる

---

## 5. Supabase — Vercel Marketplace 経由で連携

### なぜこれが必要か
- アプリの分析メタを蓄積する **データベース**
- Vercel から **ワンクリック連携**で繋がる（スライドで強調したい簡単さ）

### 手順

1. Vercel ダッシュボードで該当プロジェクト（`minta-sensei-handson`）を開く
2. 上部タブの **「Storage」** をクリック
3. **「Create Database」** ボタン
4. データベース一覧から **「Supabase」** を選択
5. **「Continue」**:
   - 既に Supabase アカウントがあれば連携の認証画面
   - 無ければ Supabase アカウント新規作成の流れ
6. **新規 Supabase プロジェクト** の設定:
   - Database name: 例 `minta-sensei-db`
   - Region: **Northeast Asia (Tokyo)**（日本からのアクセスが速い）
   - Plan: **Free**（無料・少容量で十分）
7. **「Connect」** をクリック
8. 連携完了 → **環境変数が自動で Vercel プロジェクトに注入される**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `POSTGRES_URL`, `POSTGRES_PRISMA_URL` 他（今回は使わないが入る）
9. Supabase ダッシュボードに自動で遷移（or **「Open in Supabase」**ボタンから手動で）

### 環境変数の自動投入を確認

Vercel ダッシュボード → Settings → Environment Variables を開いて、上記の変数が自動で追加されているはず。

### セキュリティ注意

- **`SUPABASE_SERVICE_ROLE_KEY` は DB 全権アクセス可能**。クライアント側に絶対に出してはいけない
- `NEXT_PUBLIC_` プレフィックスが付いた変数だけがクライアントから読める
- `service_role` は `NEXT_PUBLIC_` 付きで自動投入されないので安全（Vercel/Supabase の設計上）

---

## 6. Supabase SQL Editor — テーブル作成

### なぜこれが必要か
- Supabase は空っぽの PostgreSQL データベース。テーブルがまだ無い
- アプリは `qa_logs` テーブルに INSERT しようとするので、まずはテーブルを作る必要がある

### 手順

1. Supabase ダッシュボード（前ステップで開いたもの）にアクセス
2. 左サイドバーの **`</>` SQL Editor** アイコン
3. 中央上の **「New query」** ボタン
4. 教材の **`assets/supabase-schema.sql`** の中身を全部コピー
5. SQL Editor に貼り付け
6. 右下の **「Run」** ボタン（or `⌘+Enter` / `Ctrl+Enter`）
7. **「Success. No rows returned」** と出れば成功
8. 確認: 左サイドバーの **🗂 Table Editor** → `public` schema 下に `qa_logs` テーブルが見える

### SQL の中身（解説）

```sql
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

alter table public.qa_logs enable row level security;

drop policy if exists "anon can read qa_logs" on public.qa_logs;
create policy "anon can read qa_logs"
  on public.qa_logs
  for select
  to anon
  using (true);
```

- `qa_logs` テーブル: 各カラムの意味は [step3.html](step3.html) のテーブル定義を参照
- `qa_logs_created_at_idx`: 新しい順に取得するためのインデックス
- `enable row level security`: 行レベルセキュリティ有効化（**本番運用では必須**）
- `policy`: anon ロールには SELECT だけ許可（INSERT は service_role からのみ可能）

### セキュリティ注意

- **`enable row level security` を絶対に外さない**。これを外すと、anon ロールから任意のデータが INSERT/UPDATE/DELETE できてしまう
- 新しいテーブルを追加するときは、必ず同じパターン（RLS有効化 + 必要なポリシーだけ作る）で

---

## 7. Vercel — 環境変数の確認と Redeploy

### なぜこれが必要か
- 環境変数を後から追加した場合、既存のデプロイには反映されていない
- **Redeploy** が必要

### 手順

1. Vercel ダッシュボードで該当プロジェクトを開く
2. 上部タブ **「Deployments」**
3. 最上段の最新デプロイの **右側の `⋯`（3点リーダー）** をクリック
4. **「Redeploy」** を選択
5. ダイアログ: **「Use existing Build Cache」のチェックを外す**（任意・新規ビルドの方が確実）
6. **「Redeploy」** ボタン
7. 1〜2分待つ → ステータスが「Ready」になればOK

### 動作確認

- 公開URLにアクセス
- 質問を投げて、minta先生が答えるか確認
- 画面下部「みんなの質問傾向」に新しい質問が表示されることを確認
- Supabase の Table Editor で `qa_logs` を開き、新しいレコードが追加されているか確認

---

## 8. トラブル時の各サービスでの確認場所

### Vercel
- **Deployments タブ** → 失敗したデプロイをクリック → **Building / Runtime Logs**
  - ビルドエラー: Building タブ
  - 実行時エラー: Runtime Logs タブ
- **Settings → Environment Variables**: 環境変数が正しく入っているか
- **Settings → General → Build & Development Settings**: フレームワーク、ノードバージョン

### Supabase
- **Logs**（左サイドバー） → API / Database / Auth など分野別ログ
- **Table Editor** → `qa_logs` を開いてレコードを直接見る
- **SQL Editor** → 任意のクエリでデバッグ:
  - `select * from qa_logs order by created_at desc limit 10;`
  - `select count(*) from qa_logs;`
- **Database → Policies**: RLS ポリシーの確認・変更

### GitHub
- **Insights → Network**: コミット履歴のグラフ
- **Settings → Secrets and variables**: Actions 用の secrets（今回は使わない）
- **Settings → Branches**: ブランチ保護ルール

### Gemini / OpenAI ダッシュボード
- **使用量タブ**: クォータ消費状況
- **API キー管理**: Revoke / 再生成

---

## ヘルプ・公式ドキュメント

| サービス | 公式ドキュメント |
|---|---|
| Google AI Studio | https://ai.google.dev/gemini-api/docs |
| OpenAI Platform | https://platform.openai.com/docs |
| GitHub | https://docs.github.com |
| Vercel | https://vercel.com/docs |
| Supabase | https://supabase.com/docs |
| Next.js | https://nextjs.org/docs |
| Claude Code | https://docs.claude.com/claude-code |
