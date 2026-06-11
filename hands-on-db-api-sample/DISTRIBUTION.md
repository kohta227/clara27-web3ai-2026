# DISTRIBUTION.md — 教材を受講者に配布する手順

「教えて、minta先生」教材を、受講者へ届ける具体的な手段。

教材は **2つに分かれている**:
1. **教材本体（このディレクトリ全部）** — index.html / step1〜3.html / customize.html / MD群 / LICENSE / style.css / app.js / assets/
2. **リファレンス実装** — `reference-app/`（実は別レポとして配布する想定）

---

## 目次

1. [配布方法の選択肢](#1-配布方法の選択肢)
2. [GitHub 公開レポとして配布（推奨）](#2-github-公開レポとして配布推奨)
3. [ZIP ダウンロードとして配布](#3-zip-ダウンロードとして配布)
4. [Notion ページに埋め込んで配布](#4-notion-ページに埋め込んで配布)
5. [配布前の最終チェック](#5-配布前の最終チェック)
6. [受講者からのフィードバック収集](#6-受講者からのフィードバック収集)

---

## 1. 配布方法の選択肢

| 方法 | 向いている場面 | 受講者の負担 |
|---|---|---|
| **GitHub レポ** | プログラミング経験ある受講者向け | 中（git clone を覚える） |
| **ZIP ダウンロード** | プログラミング初心者向け | 低（ダブルクリックで開ける） |
| **Notion ページ** | 教材を読みながら進める授業 | 低（ブラウザだけ） |
| **混合**（HTML を Notion / ZIP は GitHub） | 一番丁寧 | やや高 |

---

## 2. GitHub 公開レポとして配布（推奨）

### メリット
- 教材本体・リファレンス実装・更新履歴を1箇所で管理
- 受講者は `git clone` でいつでも最新版を取得
- 派生・改変版を Fork で簡単に作れる
- 教材自体の Issue / Discussion で受講者と対話可能

### 手順

#### 教材リポ（hands-on-db-api-sample/）

1. GitHub で公開レポを作成（例: `web3ai-gairon/hands-on-db-api-sample`）
2. このディレクトリを git init → commit → push
3. README に「**1. Use this template ボタンで自分のリポを作る**」「**2. clone して index.html を開く**」を明記
4. Topics に `hands-on`, `nextjs`, `gemini`, `supabase`, `vercel`, `tutorial-jp` などを設定

#### リファレンス実装リポ（reference-app/）

別レポとして配布する（教材本体に同梱しない）。理由:
- リファレンス実装は **Vercel デプロイ可能なスタンドアロン**にしたい
- 教材本体は **`reference-app/` を `.gitignore` で除外**

1. GitHub で別レポを作成（例: `web3ai-gairon/minta-sensei-handson`）
2. `reference-app/` の中身を新規 git init → commit → push
3. 教材本体の README / step1.html に「`git clone https://github.com/web3ai-gairon/minta-sensei-handson.git`」と書く

### 受講者への案内テンプレ

```markdown
# 受講者へ

## 1. 教材本体を取得

ブラウザで開く: https://github.com/web3ai-gairon/hands-on-db-api-sample

「Code → Download ZIP」でダウンロード → 解凍 → `index.html` をダブルクリック

## 2. アプリのコードを取得

ターミナルで:
\`\`\`bash
cd ~/Documents/projects   # 自分の作業ディレクトリに
git clone https://github.com/web3ai-gairon/minta-sensei-handson.git
cd minta-sensei-handson
\`\`\`

## 3. 教材の Step 1 から始める

`index.html` を開いて Step 1 のリンクから順に進めてください。
```

---

## 3. ZIP ダウンロードとして配布

### メリット
- 受講者は git も npm も触れる前から始められる
- HTML だけ見たい人にもオフラインで届く

### 手順

1. このディレクトリ全体（`hands-on-db-api-sample/`）から `reference-app/` と `node_modules/` を除外して ZIP 化
2. ファイル名: `minta-sensei-handson-v2026.5.zip`
3. 配布先（任意）:
   - Google Drive 共有リンク（権限: 閲覧）
   - 学内サーバ
   - Notion アップロード（25MB まで）
   - 直接メール / Discord 添付

### ZIP 作成コマンド例（macOS / Linux）

```bash
cd /Users/uni/Documents/web3ai-gairon/agents-docs
zip -r minta-sensei-handson-v2026.5.zip hands-on-db-api-sample \
  -x "hands-on-db-api-sample/reference-app/*" \
  -x "hands-on-db-api-sample/**/.DS_Store" \
  -x "hands-on-db-api-sample/**/.env*"
```

### 受講者への案内テンプレ

```markdown
# 受講者へ

1. 配布された ZIP をダウンロード
2. ダブルクリックで解凍
3. 解凍したフォルダの中の `index.html` をダブルクリック
4. ブラウザで教材が開く → Step 1 から進めてください
5. アプリ本体は教材内で別途 git clone する手順があります
```

---

## 4. Notion ページに埋め込んで配布

### メリット
- 受講者は Notion を開くだけ
- コメント機能で質問できる
- 講師が随時更新できる

### 手順

1. Notion でページを作る（例: 「教えて、minta先生 — ハンズオン」）
2. このリポの README.md / step1〜3.md (HTML → MD に変換) の内容をコピペ
3. 「Code」ブロックでプロンプト集を埋め込む
4. リンク共有（Web で公開設定）

### Notion 用に HTML → Markdown 変換

- HTML を直接埋め込むのは Notion 非対応
- HTML の本文を抜き出して Markdown に書き換え（手動 or pandoc）

```bash
brew install pandoc
pandoc step1.html -o step1.md
```

→ Notion に Markdown インポート

### Notion ページ構成例

```
[親ページ] 教えて、minta先生 — ハンズオン
├── [サブ] イントロ
├── [サブ] Step 1: ローカルで動かす
├── [サブ] Step 2: Vercel にデプロイ
├── [サブ] Step 3: Supabase を繋ぐ
├── [サブ] カスタマイズレシピ
├── [サブ] トラブルシュート
└── [サブ] 質問・コメント
```

---

## 5. 配布前の最終チェック

### コンテンツの確認

- [ ] **`reference-app/.env.local` が ZIP / GitHub に含まれていない**
- [ ] **API キー / 個人情報を含むテキストが含まれていない**
- [ ] **教材内のリンクが切れていない**（index.html → step1.html などの相対パス）
- [ ] **画像・スクリーンショットが読み込める**（assets/ 以下）
- [ ] **LICENSE ファイルが含まれている**

### 受講者環境での動作確認

- [ ] **講師が clone した状態から、Step 1 を最後まで通せる**
- [ ] **配布した ZIP / Notion で index.html を開いて、全ページに遷移できる**
- [ ] **公式ドキュメントへのリンクが最新版に向いている**

### セキュリティの確認

- [ ] **講師の API キーが教材内に残っていない**
- [ ] **講師の個人情報が `.env.local.example` などに残っていない**
- [ ] **`reference-app/` を別レポにする場合、機密漏れがないか `git log --all -p | grep -iE 'sk-proj-|AIza|service_role'`**
- [ ] **GitHub レポを Public にする前にもう一度すべてを再確認**

---

## 6. 受講者からのフィードバック収集

教材を配布したら、フィードバックを得る仕組みを用意します。

### 方法1: GitHub Issues

教材レポの Issues タブで:
- 「バグ」「改善提案」「質問」のラベルを用意
- Issue テンプレを設定（What happened / What expected / Environment）

### 方法2: Google Forms

簡単なアンケートで:
- どこまで進んだか（Step 1 / 2 / 3 / カスタマイズ）
- 何分かかったか
- どこで詰まったか
- 何が一番面白かったか
- 教材で改善すべき点

### 方法3: Discord / Slack チャンネル

- 質問チャンネルを用意
- 詰まった受講者同士が助け合える場
- 講師 / TA が見回り

### 集まったフィードバックの活かし方

1. **教材本体の改善**（次回バージョン v2026.6 etc）
2. **受講者の改造アイデア集**（INSTRUCTOR.md の事例集として）
3. **講師同士の知見共有**（同じカリキュラムを使う他校・他組織と）

---

## 配布版管理（バージョニング）

教材は時間とともに古くなります（モデル名 / 各サービスの UI / API スペック）。バージョン管理を:

- `v2026.5` のようなバージョンを README とフッターに明記
- 大きな変更時は新バージョンを作成（古いバージョンも残す）
- CHANGELOG.md で変更履歴を管理

```
v2026.5 (初回リリース)
- 教材本体作成
- Gemini 2.5 Flash / OpenAI gpt-4o-mini 両対応
- Vercel + Supabase Marketplace 連携
```
