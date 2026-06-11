# TROUBLESHOOT.md — 症状別 診断プロンプト集

「教えて、minta先生」ハンズオン教材で詰まったときの **症状別** 対処と Claude Code 用プロンプト集。

エラーが出たら、まずここを開いて **症状名を検索**してください。マッチしたら、対応する **`P-XXX-N` プロンプト** を Claude Code に貼って対話で解決。

---

## 目次

### Step 1（ローカル）でのトラブル

- [S1-1: `npm install` で大量のエラー](#s1-1-npm-install-で大量のエラー)
- [S1-2: `npm run dev` が起動しない](#s1-2-npm-run-dev-が起動しない)
- [S1-3: ブラウザで `localhost:3000` を開けない](#s1-3-ブラウザで-localhost3000-を開けない)
- [S1-4: 質問しても「minta先生からの回答取得に失敗しました」](#s1-4-質問しても-minta先生からの回答取得に失敗しました)
- [S1-5: Gemini が Quota exceeded](#s1-5-gemini-が-quota-exceeded)

### Step 2（Vercel）でのトラブル

- [S2-1: Vercel のビルドが失敗する](#s2-1-vercel-のビルドが失敗する)
- [S2-2: 公開URLで「Internal Server Error」](#s2-2-公開urlで-internal-server-error)
- [S2-3: `.env.local` を間違えて push してしまった](#s2-3-envlocal-を間違えて-push-してしまった)
- [S2-4: 環境変数を変更したが反映されない](#s2-4-環境変数を変更したが反映されない)

### Step 3（Supabase）でのトラブル

- [S3-1: SQL Editor で「permission denied」](#s3-1-sql-editor-で-permission-denied)
- [S3-2: 履歴が表示されない](#s3-2-履歴が表示されない)
- [S3-3: 「Supabase未設定」のままになる](#s3-3-supabase未設定のままになる)
- [S3-4: Supabase に書き込めるが読めない](#s3-4-supabase-に書き込めるが読めない)

### セキュリティ系のトラブル

- [SEC-1: API キーを誤って公開してしまった](#sec-1-api-キーを誤って公開してしまった)
- [SEC-2: 質問に個人情報が含まれて保存された](#sec-2-質問に個人情報が含まれて保存された)
- [SEC-3: 知らない人からの大量リクエスト](#sec-3-知らない人からの大量リクエスト)

---

## S1-1: `npm install` で大量のエラー

### 症状
```
npm error code ENOTFOUND
npm error syscall getaddrinfo
npm error errno ENOTFOUND
```
または
```
npm ERR! peer dep ...
npm ERR! gyp ERR! ...
```

### 原因の可能性
- ネットワーク接続が無い・DNSが効いていない
- Node.js のバージョンが古い（v20未満）
- macOS/Linux に Xcode/build-essential が無く native module ビルドが失敗

### 診断プロンプト

````text
# S1-1: npm install が失敗

以下のエラーが出ました:

[エラー全文を貼る]

調べてほしいこと:
1. `ping -c 2 registry.npmjs.org` でDNS解決できるか
2. `node --version` で v20.9 以上か
3. `npm config get registry` で npm のレジストリ設定
4. もし社内プロキシ環境なら、proxy 設定が必要かもしれない

順番に確認して、対処を案内してください。
````

---

## S1-2: `npm run dev` が起動しない

### 症状
```
Error: Cannot find module 'next'
```
または
```
EADDRINUSE: address already in use :::3000
```

### 原因の可能性
- `npm install` を実行していない、または途中で止まった
- ポート 3000 が他のプロセスで使われている

### 診断プロンプト

````text
# S1-2: npm run dev が失敗

エラー:
[エラー全文を貼る]

調べてほしいこと:
1. `node_modules/` ディレクトリが存在するか、`ls node_modules/.bin/next` で next バイナリがあるか
2. ポート競合の可能性: `lsof -i :3000` でプロセスを確認
3. もしポート競合なら `npm run dev -- --port 3001` で別ポート起動を試す

ステップごとに対処を案内してください。
````

---

## S1-3: ブラウザで `localhost:3000` を開けない

### 症状
- ブラウザで「サイトにアクセスできません」
- `ERR_CONNECTION_REFUSED`

### 原因の可能性
- `npm run dev` が起動していない、ターミナルで止まっている
- 別のポートで起動している
- ファイアウォール / VPN がブロック

### 診断プロンプト

````text
# S1-3: localhost:3000 が開けない

症状: ブラウザで http://localhost:3000 が表示されない

調べてほしいこと:
1. dev server のターミナル出力を私から教えてもらう
2. `Ready in ...ms` のログがあるか確認
3. ポート番号が 3000 でなく別の番号になっていないか確認
4. `curl http://localhost:3000` で疎通確認

問題箇所を絞り込んで案内してください。
````

---

## S1-4: 質問しても「minta先生からの回答取得に失敗しました」

### 症状
- アプリは開ける
- 質問を送ると赤いエラーバナーで「minta先生からの回答取得に失敗しました」

### 原因の可能性
- `GEMINI_API_KEY` (or `OPENAI_API_KEY`) が `.env.local` に書かれていない
- キーの値が間違っている（コピーミス、余分なスペースなど）
- ネットワーク的に Gemini/OpenAI に届かない
- クォータ超過

### 診断プロンプト

````text
# S1-4: 「minta先生からの回答取得に失敗しました」エラー

調べてほしいこと:
1. dev server のターミナルログを見せる（直近のエラーを抜粋）
2. `.env.local` に GEMINI_API_KEY が書かれているか確認（値そのものは見せず、行の有無だけ）
3. 値の末尾に余分な改行や空白が入っていないか
4. キーの長さがおかしくないか (Gemini なら 39 文字程度の AIzaSy... )

エラーが Quota 系なら S1-5 を参照。
````

---

## S1-5: Gemini が Quota exceeded

### 症状
ターミナルログに:
```
ApiError: {"error":{"code":429,"message":"You exceeded your current quota..."}}
... limit: 0, model: gemini-2.0-flash ...
```

### 原因の可能性
- 新規プロジェクトでクォータがまだ反映されていない (時間経過で解消)
- 該当モデルの Free Tier が変更された
- 同じキーで連続リクエストし過ぎてレート制限に当たった

### 対処

1. 数分待ってリトライ
2. モデルを別のものに切り替える（例: `gemini-2.0-flash` → `gemini-2.5-flash`）
3. AI Studio のクォータ画面で実際の上限を確認: https://aistudio.google.com/

### 診断プロンプト

````text
# S1-5: Gemini Quota exceeded

ログ:
[Quota エラー全文]

対処:
1. src/lib/llm.ts の GEMINI_MODEL を別モデルに変えて試す
   - 候補: gemini-2.5-flash, gemini-2.5-flash-lite, gemini-2.0-flash, gemini-1.5-flash
2. .env.local に OPENAI_API_KEY を追加して、Gemini を一時的に外す手も
3. 数分〜数十分待ってからリトライ

順番に試して結果を報告します。
````

---

## S2-1: Vercel のビルドが失敗する

### 症状
- Vercel の Deployments で「Failed」と表示
- Building Logs にエラー

### 原因の可能性
- TypeScript / ESLint エラー（ローカルでは通っても、Vercel の本番ビルドでは厳しめ）
- 依存ライブラリのバージョン不整合
- 環境変数が必須だが Vercel に未設定

### 診断プロンプト

````text
# S2-1: Vercel ビルド失敗

Vercel の Building Logs から、エラー部分を抜粋して貼ります:

[ログを貼る]

調べてほしいこと:
1. ローカルで `npm run build` を実行して同じエラーが出るか
2. もし出るなら、まずローカルで直す
3. ローカルで通るのに Vercel で失敗する場合、環境変数 / Node.js バージョン / Build Command の違いを確認

修正案を出してください。
````

---

## S2-2: 公開URLで「Internal Server Error」

### 症状
- Vercel のビルドは成功
- 公開URLにアクセスすると「Internal Server Error」または白画面

### 原因の可能性
- ランタイムでクラッシュ（環境変数未設定など）
- API ルートが正しく動いていない

### 診断プロンプト

````text
# S2-2: Vercel Internal Server Error

公開URL: https://___.vercel.app

調べてほしいこと:
1. Vercel の Deployments → 該当デプロイ → Runtime Logs を見せる
2. 環境変数 GEMINI_API_KEY が設定されているか確認
3. アクセスしたURL が /api/ask なのか、トップページなのか

ログを見て原因を特定してください。
````

---

## S2-3: `.env.local` を間違えて push してしまった

### 症状
- GitHub のレポを開いて、`.env.local` のファイルが表示される
- 中身に API キーが書かれている

### 緊急対処（順番厳守）

1. **すぐに該当 API キーを Revoke**:
   - Gemini: https://aistudio.google.com/apikey → 削除
   - OpenAI: https://platform.openai.com/api-keys → Revoke
   - Supabase: 漏れたキーがどれかによる（service_role が一番危険）
2. **新しいキーを再発行**
3. **`.env.local` を `.gitignore` に追加**（既に入っていれば追加不要）
4. **コミット履歴から消す**（任意・推奨）

### 診断プロンプト

````text
# S2-3: .env.local を GitHub に push してしまった

緊急度: 高

進めてほしいこと:
1. まず私に「該当 API キーを今すぐ Revoke してください」と促す
2. Revoke が完了したか確認する
3. その後、git rm --cached .env.local で追跡を解除
4. .gitignore に .env.local を追加（既に入っていれば不要）
5. 新しいコミットを作って push
6. 必要なら git filter-repo か BFG でコミット履歴から完全削除を案内

セキュリティ注意:
- 漏れたキーは絶対にもう使わない。すぐ Revoke。
- 履歴を消しても、漏れた事実は消えないので Revoke が最優先
````

---

## S2-4: 環境変数を変更したが反映されない

### 症状
- Vercel の Environment Variables を更新したが、公開URL で挙動が変わらない

### 原因

環境変数の変更は **既存のデプロイには反映されない**。Redeploy が必要。

### 対処

1. Vercel ダッシュボード → Deployments
2. 最新デプロイの `⋯` → **Redeploy**
3. 「Use existing Build Cache」のチェックを外して Redeploy
4. 1-2 分待つ

---

## S3-1: SQL Editor で「permission denied」

### 症状
- SQL Editor で SQL を Run しようとすると `permission denied for table ...` や `must be owner of ...`

### 原因の可能性
- Vercel 経由で作った Supabase プロジェクトで、SQL Editor のロールが意図と違う
- 既存テーブルへの ALTER 権限がない

### 診断プロンプト

````text
# S3-1: Supabase SQL Editor で permission denied

エラー: [エラー全文]

調べてほしいこと:
1. 現在の Supabase プロジェクトのロール: 通常は postgres (owner)
2. SQL Editor の右上で実行ロールを確認
3. もし anon になっていれば postgres に切り替え

対処を案内してください。
````

---

## S3-2: 履歴が表示されない

### 症状
- 質問は答えるが、画面下部「みんなの質問傾向」に何も出ない

### 原因の可能性
- Supabase が未設定（環境変数が無い）
- RLS ポリシーで anon ロールに select 権限が無い
- テーブル名が違う

### 診断プロンプト

````text
# S3-2: 履歴が表示されない

調べてほしいこと:
1. Vercel の Environment Variables に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY があるか確認
2. Supabase の Table Editor で qa_logs テーブルにレコードがあるか確認
3. レコードがあるのに表示されないなら、RLS ポリシーを確認:
   - Database → Policies → qa_logs に "anon can read qa_logs" がある
   - Operation: SELECT, Target roles: anon, Using expression: true
4. ブラウザの DevTools (F12) → Network → /api/history のレスポンスを確認

順番に確認して原因を絞り込んでください。
````

---

## S3-3: 「Supabase未設定」のままになる

### 症状
- 画面下部に常に「Supabase が未設定です」のメッセージ

### 原因の可能性
- Vercel に環境変数が無い
- Redeploy していない（変更が反映されていない）
- 変数名が間違っている（NEXT_PUBLIC_SUPABASE_URL の typo など）

### 対処

1. Vercel → Settings → Environment Variables を確認
2. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` の3つがあるか
3. 無ければ Supabase Connect をやり直す（Storage → Supabase）
4. Redeploy する

---

## S3-4: Supabase に書き込めるが読めない

### 症状
- 質問するとレコードが Supabase に増える（Table Editor で確認）
- でも画面の履歴一覧には出ない

### 原因
- service_role で書き込みはできるが、anon の SELECT ポリシーが無い

### 対処

SQL Editor で:

```sql
drop policy if exists "anon can read qa_logs" on public.qa_logs;
create policy "anon can read qa_logs"
  on public.qa_logs
  for select
  to anon
  using (true);
```

を Run。

---

## SEC-1: API キーを誤って公開してしまった

詳細は [S2-3](#s2-3-envlocal-を間違えて-push-してしまった) を参照。**Revoke が最優先**。

---

## SEC-2: 質問に個人情報が含まれて保存された

### 症状
- Supabase の `qa_logs` を見ると、`topic_summary` に実名やメールアドレスが含まれている

### 原因の可能性
- LLM の PII 分析が誤って通してしまった（精度の限界）
- regex でも漏れがある

### 対処

1. **該当レコードを即座に削除**:
   ```sql
   delete from qa_logs where id = '___';
   ```
2. PII 検出の精度を高める:
   - `src/lib/pii.ts` の regex を強化
   - `ANALYZER_INSTRUCTION` の指示をより厳しく
   - 重要な用途では Microsoft Presidio などの専用ライブラリを併用
3. 本番運用なら、保存前に人手レビューを挟むワークフローを検討

### 診断プロンプト

````text
# SEC-2: PII が DB に保存された

レコード ID: ___
症状: ___ (例: topic_summary に実名が残っている)

対処:
1. まず該当レコードを Supabase Table Editor で確認
2. SQL Editor で `delete from qa_logs where id = '___';` を Run
3. src/lib/pii.ts を見て、検出ロジックを強化する案を出してください
4. 同じパターンが他のレコードに無いか SQL で検索:
   `select * from qa_logs where topic_summary ilike '%___%';`
````

---

## SEC-3: 知らない人からの大量リクエスト

### 症状
- Vercel の Runtime Logs に身に覚えのない大量アクセス
- Gemini / OpenAI のクォータが急速に減る

### 原因の可能性
- 公開URLが SNS や検索エンジンに載って、悪意ある人が見つけた
- ボット / スクレイパー

### 対処（即時）

1. Vercel の Settings → **Deployment Protection** で一時的に Password Protection を ON
2. Gemini / OpenAI ダッシュボードでクォータ消費を確認
3. 必要なら API キーを Revoke して新規発行

### 対処（恒久）

1. **レート制限を実装**: Upstash Redis + Vercel Edge Middleware
2. **認証を追加**: Supabase Auth でログイン必須に
3. **使用量上限を設定**: Gemini / OpenAI のダッシュボードで月次予算上限

### 診断プロンプト

````text
# SEC-3: 不審な大量リクエスト

状況:
- Vercel Runtime Logs に毎分大量のアクセス (具体的な数)
- 自分は触っていない時間帯

対処:
1. 一時的に Vercel の Deployment Protection で防御
2. 攻撃元 IP / User-Agent を特定
3. 恒久対策として:
   - Upstash Redis + Vercel Edge Middleware でレート制限
   - or Supabase Auth で認証必須化

選択肢を整理して、優先順位を提示してください。
````

---

## 困ったときの最後の手段

すべてリセットしてやり直したい場合は、[PROMPTS.md の P-RESET-1](PROMPTS.md#p-reset-1-全部リセットしてやり直す) を Claude Code に投げてください。
