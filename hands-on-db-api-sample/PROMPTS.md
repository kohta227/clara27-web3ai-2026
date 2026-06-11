# PROMPTS.md — Claude Code に投げるプロンプト集

「教えて、minta先生」ハンズオン教材で使うプロンプトを **コピペできる形** で集めたもの。

各 Step の HTML にも掲載されているのと同じ内容ですが、ここでは **すべてのプロンプトを1ページで** 見渡せます。
HTML を開けない環境（モバイル / コマンドラインメイン等）でも、これだけで進められます。

---

## 目次

- [Step 1: ローカルで動かす](#step-1-ローカルで動かす)
- [Step 2: Vercel にデプロイ](#step-2-vercel-にデプロイ)
- [Step 3: Supabase を繋ぐ](#step-3-supabase-を繋ぐ)
- [カスタマイズ用プロンプト](#カスタマイズ用プロンプト)
- [リセット用プロンプト](#リセット用プロンプト)
- [セキュリティチェック用プロンプト](#セキュリティチェック用プロンプト)

---

## Step 1: ローカルで動かす

Claude Code (新しい会話) を開いて以下を貼り付け。`__` の部分を埋めてから送信。

````text
# 教えて、minta先生 — Step 1: ローカルで動かす

千葉工業大学「web3・AI概論」のハンズオン教材「教えて、minta先生」のセットアップを一緒に進めてください。

## 私の環境
- OS: __ (例: macOS Sequoia / Windows 11 + WSL2 Ubuntu / Ubuntu 24.04)
- Node.js: 未確認なら確認してください

## ゴール
ローカル PC で http://localhost:3000 に minta先生のアプリが立ち上がり、質問を投げると AI が答える状態。

## 進め方
以下を上から順に進めてください。各ステップで何をしたか、私に説明しながら進めてください。

### 1. 環境チェック
- `node --version` を実行 → v20.9 以上か確認
- v20 未満なら nvm でアップグレードを案内
- `git --version` で git があるか確認

### 2. リポジトリ取得
- 適当な作業ディレクトリ (~/Documents/projects/ 等) に cd
- `git clone https://github.com/web3ai-gairon/minta-sensei-handson.git` で clone
- `cd minta-sensei-handson` に入る

### 3. 依存インストール
- `npm install` を実行
- 警告は出るかもしれないが、エラーで止まらなければOK

### 4. 環境変数の準備
- `cp .env.local.example .env.local` で雛形コピー
- 私に「Gemini API キーを https://aistudio.google.com/apikey で取得して、.env.local の GEMINI_API_KEY= の行に書いてください」と案内する
- **重要: API キーは絶対にこのチャットに貼らせないこと。私が自分のエディタで .env.local に直接書く**
- 私が「書きました」と言ったら次へ

### 5. dev server 起動
- `npm run dev` をバックグラウンドで起動
- ログに「Ready in」が出るのを待つ
- ブラウザで http://localhost:3000 を開くよう私に伝える

### 6. 動作確認
- 私が「画面が出ました」と言ったら、テスト質問例を提示
  例: 「プロンプトエンジニアリングって何ですか？」
- minta先生から回答が返ってくれば Step 1 完了

## エラー時
- ログをそのまま見せて、原因と対処を一緒に考える
- API キーや個人情報を含まない範囲で対応
- 詰まったら TROUBLESHOOT.md を参照

## セキュリティ注意（必須）
- API キーを私 (あなた = Claude Code) のチャット履歴に絶対に貼らせない
- 私が間違えて貼りそうになったら止める
- `.env.local` は `.gitignore` で除外済みだが、念のため確認

それでは Step 1 から始めてください。
````

---

## Step 2: Vercel にデプロイ

Step 1 完了後、同じ会話の続きで以下を投入。

````text
# Step 2: Vercel にデプロイ

Step 1 でローカルで動いた「教えて、minta先生」アプリを、Vercel にデプロイして公開URLで動くようにします。

## 私の状況
- Step 1 完了: ローカル http://localhost:3000 で動いている
- GitHub アカウント: __ (例: github.com/your-username)
- Vercel アカウント: __ (まだ無ければ取得から)

## ゴール
- 公開URL (例: https://minta-sensei-handson.vercel.app) で minta先生が答える
- Vercel ダッシュボードで環境変数を管理できる状態

## 進め方

### 1. GitHub に自分のレポを作る
- まず GitHub にログインして、新規レポ (例: minta-sensei-handson) を Public で作成
- ローカルの clone 元 (web3ai-gairon/minta-sensei-handson) の remote を、自分のレポに付け替え:
  - `git remote set-url origin git@github.com:YOUR-USERNAME/minta-sensei-handson.git`
- `git push -u origin main` で push

### 2. .gitignore 確認
- `.env.local` が .gitignore に含まれていることを再確認
- 万が一すでにコミットしていないか `git log --all -- .env.local` で確認
- 心配なら Claude Code に「.env.local が GitHub に push されていないか確認して」と頼む

### 3. Vercel に Import
- vercel.com → Sign in with GitHub
- New Project → 作ったレポを選ぶ → Import
- Framework Preset: Next.js が自動検出されるはず
- Root Directory: そのまま (./)

### 4. 環境変数を入力
- 「Environment Variables」セクションを開く
- Name: GEMINI_API_KEY
- Value: 自分の Gemini API キー (AIza... で始まる)
- **重要: キーを私 (Claude Code) のチャットに貼らせない。Vercel ダッシュボードに私が直接入力する**
- 全環境 (Production / Preview / Development) にチェック

### 5. Deploy
- Deploy ボタンを押す → 1-2 分待つ → 「Visit」ボタンが出れば完成

### 6. 動作確認
- 公開URLで質問を投げて、minta先生が答えるか確認
- ダメだったら Vercel の Deployments タブ → 失敗したデプロイをクリック → Runtime Logs をチェック
- ログを私が読んで、原因と対処を伝える

## セキュリティ注意
- API キーをチャットに貼らせない (Vercel ダッシュボードに直接入力させる)
- Vercel の環境変数は「Sensitive」フラグを付けると、ダッシュボード上でも値が伏せられる
- 公開URLは世界からアクセス可能。本番運用前に rate limit / 認証を検討する

それでは Step 2 を始めてください。
````

---

## Step 3: Supabase を繋ぐ

````text
# Step 3: Supabase を Vercel から Connect

「教えて、minta先生」アプリに DB を繋ぎます。Vercel から Supabase をワンクリック連携 → SQL でテーブル作成 → 公開URLで履歴蓄積、までです。

## 私の状況
- Step 2 完了: 公開URL (https://___.vercel.app) で動いている
- DB はまだ繋がっていない（「Supabase未設定」と表示されている）

## ゴール
- 公開URLで質問を投げると、画面下部の「みんなの質問傾向」に履歴が表示される
- Supabase Table Editor で qa_logs テーブルに分析メタが入っているのが確認できる

## 進め方

### 1. Vercel から Supabase を Connect
- Vercel ダッシュボードの該当プロジェクト → 上タブ「Storage」
- 「Create Database」→「Supabase」を選択
- Continue → 既存 Supabase アカウントと連携 or 新規作成
- 新規 Supabase プロジェクト名: 例 minta-sensei-db
- Region: Northeast Asia (Tokyo)
- Plan: Free
- Connect

### 2. 環境変数の自動投入を確認
- Vercel の Settings → Environment Variables を開く
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY などが自動で入っているはず

### 3. SQL Editor でテーブル作成
- Supabase ダッシュボードに自動で遷移 (or アクセス)
- 左サイドバーの SQL Editor (</> アイコン) を開く
- 教材の `assets/supabase-schema.sql` の中身を全部コピー
- SQL Editor に貼って Run (⌘+Enter)
- 「Success. No rows returned」が出ればOK
- 左サイドバーの Table Editor で qa_logs テーブルが作られているか確認

### 4. Vercel で Redeploy
- 環境変数の追加を反映するため再デプロイが必要
- Vercel の Deployments タブ → 最新デプロイの右の ⋯ → Redeploy

### 5. 動作確認
- 公開URLにアクセス
- 質問を投げる: 例「Next.js のメリットを3つ教えて」
- 回答が返り、画面下部の「みんなの質問傾向」に表示される
- Supabase の Table Editor で qa_logs を開き、レコードが追加されているか確認
- レコードには元の質問文・回答文ではなく、PII除去済の分析メタだけが入っていることを確認

## セキュリティ注意
- SUPABASE_SERVICE_ROLE_KEY は DB 全権アクセス可能な強力なキー。クライアント JS から絶対に呼ばない
- RLS (Row Level Security) は有効化済み

それでは Step 3 を始めてください。
````

---

## カスタマイズ用プロンプト

### P-CUSTOM-1: minta先生を別キャラに変える

````text
src/lib/minta.ts の MINTA_SYSTEM_PROMPT を、以下のキャラに合わせて書き換えてください。

# キャラ設定
- 名前: __ (例: Sebastian)
- 役柄: __ (例: ヴィクトリア朝の執事)
- 口調: __ (例: 丁寧・古風・第三人称)
- 専門領域: __ (例: 科学とテクノロジー全般)
- NG: 個人情報を扱わない / 政治・宗教には触れない

人格定義を書き換えたら、画面のヘッダー文字列「教えて、minta先生」も、新しいキャラ名に合わせて src/app/page.tsx を更新してください。
````

### P-CUSTOM-2: 色を変える

````text
src/app/page.tsx 内の Tailwind カラー (rose-50, rose-500 など) を、すべて __ (例: sky) に置き換えてください。
hover の色も同様に変更してください。
````

### P-CUSTOM-3: DB スキーマ拡張（sentimentカラム追加）

````text
qa_logs テーブルに sentiment カラム (text型) を追加してください。

具体的にやってほしいこと:
1. assets/supabase-schema.sql に ALTER TABLE 文を追加 (既存テーブルにカラム追加)
2. Supabase の SQL Editor で実行する SQL を出力 (私が手動で実行する)
3. src/lib/supabase.ts の QaLog interface に sentiment を追加
4. src/lib/pii.ts の AnalysisResult interface に sentiment を追加
5. src/lib/pii.ts の ANALYZER_INSTRUCTION で sentiment を判定するよう指示を追加
6. src/app/api/ask/route.ts で sentiment を insert に含める
7. src/app/page.tsx の履歴表示で sentiment をバッジ表示

セキュリティ注意: ALTER TABLE は本番DB で慎重に実行する
````

### P-CUSTOM-4: 別アプリに転用

````text
このアプリの骨格を流用して、__ アプリを作りたいです。

# 元のアプリ
- 質問入力 → minta先生（AI）が回答 → PII除去 → DB蓄積 → 履歴表示

# 作りたいアプリ
- 名前: __
- ユーザー入力: __ (例: 英作文)
- AI 加工: __ (例: 添削とリライト + 評価点)
- DB保存: __ (例: 評価点 + 改善ポイント要約)
- 履歴表示: __ (例: 過去の平均点グラフ)

# 進め方
1. src/lib/minta.ts の人格を、新しい AI の役割に書き換え
2. src/app/page.tsx の UI を新しい入力形式に変更
3. src/app/api/ask/route.ts の処理を新しい AI 加工に変更
4. assets/supabase-schema.sql を新しいスキーマに変更（既存テーブル削除 → 新規作成）
5. src/lib/pii.ts の分析プロンプトを、新しい用途に合わせて書き換え
6. 全体を確認して、テストデータで動作確認

セキュリティ注意:
- 既存のDBにテストデータが入っていれば、新規スキーマ前にバックアップ
- 環境変数は変更不要
````

---

## リセット用プロンプト

### P-RESET-1: 全部リセットしてやり直す

````text
「教えて、minta先生」のセットアップを最初からやり直したい。以下を実行してください。

1. ローカルの作業ディレクトリ (minta-sensei-handson) を rm -rf で削除
2. Vercel のプロジェクトを削除 (私がダッシュボードから削除)
3. Supabase のプロジェクトを削除 (私がダッシュボードから削除)
4. GitHub の自分のレポを削除 (私がダッシュボードから削除) [任意]

これらが終わったら、Step 1 から再開してください。
````

### P-RESET-2: 環境変数だけリセット

````text
.env.local の中身を一度全部消して、新しいキーで .env.local.example から作り直したい。

進め方:
1. `rm .env.local && cp .env.local.example .env.local` で雛形を作り直す
2. 私が新しいキーを .env.local に直接書く（チャットには貼らない）
3. dev server を再起動 (npm run dev) して動作確認
````

---

## セキュリティチェック用プロンプト

### P-SEC-1: GitHub に機密が漏れていないか確認

````text
このリポジトリの全コミット履歴から、機密情報が漏れていないか確認してください。

チェック項目:
1. `.env.local` が `git log --all -- .env.local` で追跡履歴があるか確認 → あれば warning
2. コミット全体から以下のパターンを grep:
   - sk-proj-...
   - AIza...
   - service_role
   - PASSWORD=
   - postgresql://[^@]*:[^@]*@
3. もし見つかったら、即座に該当キーを Revoke する案内を出す
4. GitHub の Secret Scanning が有効か（Public レポなら自動で有効）も確認

セキュリティ注意:
- 漏れているキーは見つけ次第すぐに Revoke
- 履歴から完全に消すには git filter-repo / BFG が必要だが、Revoke の方が現実的
````

### P-SEC-2: 本番運用前のセキュリティ レビュー

````text
このアプリを本番運用する前に、セキュリティ上の懸念点をリストアップしてください。

確認してほしい観点:
1. API キーの取り扱い（環境変数経由か / クライアントから読めないか）
2. 入力バリデーション（API ルートで受け取る question の長さ・型・特殊文字）
3. レート制限（同じIPからの大量リクエストを防ぐ仕組み）
4. CORS / CSRF 対策
5. Supabase RLS ポリシーが意図通りか
6. クライアントから service_role キーが見えないか
7. エラーログに機密情報が漏れていないか
8. PII 検出ロジックが十分か（regex の漏れ / LLM 分析の見落とし）

各項目について「OK / 要対応 / 不明」を付けて、要対応の項目には具体的な対策案を出してください。
````

### P-SEC-3: PII 検出の精度確認

````text
src/lib/pii.ts の PII 検出ロジックの精度を確認したい。

以下のテスト質問で、PII が適切に除去されているか確認してください。

テスト質問例:
1. "私の名前は田中太郎です。Next.js について教えてください"
2. "tanaka@example.com にメールしたいんですが Gmail API の使い方を教えて"
3. "千葉工業大学に通っています。情報系の卒研テーマで悩んでいます"
4. "Discord ID は taro#1234 です。Discord Bot の作り方を教えて"
5. "電話番号 03-1234-5678 に SMS を送るシステムを作りたい"

各テスト質問について:
- regex で検出された PII
- LLM で検出された PII
- 最終的に保存されたメタデータ (topic_summary / answer_summary) に PII が残っていないか

注意: テスト質問は実在の人物ではなく架空のデータで実施
````

---

## 教材を進める上での共通ルール（全プロンプトで守る）

すべての Claude Code 会話で、以下のルールを共有してください。プロンプト冒頭にコピペすると良いです。

```text
# このセッションでの共通ルール

1. **API キー・パスワード・トークンを私 (Claude) のチャットに貼らせない**
   - ユーザーが間違えて貼りそうになったら、Stop して .env.local に書くよう案内する
   - 既に貼られてしまった場合は、即座に Revoke する案内を最優先

2. **作業ログを残す**
   - 各ステップで何をしたか、私に説明しながら進める
   - 失敗したコマンドや出力エラーは、解決後も「これが起きた」と記録

3. **不可逆な操作の前は確認**
   - `rm -rf`, `DROP TABLE`, GitHub レポ削除など、戻せない操作は必ず私に確認

4. **わからないことは「わからない」と言う**
   - 推測で進めない
   - 公式ドキュメントへのリンクを提示

5. **セキュリティ上の懸念があれば、作業の手を止めて指摘する**
```
