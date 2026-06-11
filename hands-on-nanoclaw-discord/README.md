# nanoclaw × Discord ハンズオン — 自分専用の Discord Bot をつくる

**Claude Code を主役に**、OSS の Claude エージェントハーネス **nanoclaw** を使って、Discord 上で動く自分専用の AI Bot を 90 分で作るハンズオン教材です。

> 教材では一例として **講師Bot「minta」**（元気で明るいバイブコーダー人格）を作りますが、**Bot の名前・人格はあなたが自由に決めて OK**。要所で「ここで自分の好きな名前／キャラを選ぶ」案内が入ります。
>
> 千葉工業大学「web3/AI 概論」向けに開発。他の授業や個人学習に再利用可能（ライセンス: CC BY-NC-SA 4.0）。

---

## 🚀 まず最初に — これを Claude Code に貼って始める

新しい Claude Code 会話を開いて、以下の **1 行プロンプト** をそのまま貼り付けてください。あとは伴走で進みます。

```
https://github.com/web3ai-gairon/pub-docs の hands-on-nanoclaw-discord/ ディレクトリの教材を使って、Discord 上で動く自分専用の AI Bot を一緒に作りたいです。リポジトリを clone して、hands-on-nanoclaw-discord/README.md を読んで全体像を把握してから、私の OS / Docker / Node / pnpm / Claude Code CLI / 既存ツールを調査して、最初の構築計画を提示してください。その後は hands-on-nanoclaw-discord/PROMPTS.md の P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → PV の順に伴走してください。Docker Desktop インストール (MANUAL.md ステップ A) と Discord Bot 作成 (MANUAL.md ステップ B) と nanoclaw.sh の対話入力 (MANUAL.md ステップ C) で手動が必要な部分は、その都度私に案内してください。シークレット (Discord Bot Token) は AI チャットに貼らない方針で進めます。教材の例「minta」をそのまま作っても、自分の好きな Bot 名・人格にしてもOKです。
```

> 💡 **ブラウザで見たい場合**: [`https://web3ai-gairon.github.io/pub-docs/hands-on-nanoclaw-discord/`](https://web3ai-gairon.github.io/pub-docs/hands-on-nanoclaw-discord/) を開けば、Step 1 / Step 2 のハブ画面（GUI 版）が見られます。Claude Code 経由でも HTML 経由でも、たどり着く先は同じです。

### 手元に clone して使う（カスタマイズしたい人向け）

教材を改造したい、自分の組織用に書き換えたい、という人は手元に clone してください：

```bash
git clone https://github.com/web3ai-gairon/pub-docs.git
cd pub-docs/hands-on-nanoclaw-discord
open index.html        # ブラウザでハブ画面を開く
```

clone 後は `assets/CLAUDE.local.md.minta`（人格テンプレ）や `PROMPTS.md`（プロンプト）など自由に書き換え可能。改変版を自分のリポジトリにフォークして公開もOK（**CC BY-NC-SA 4.0** の継承・帰属条件あり）。詳しい改変ガイドは [`INSTRUCTOR.md`](INSTRUCTOR.md)、配布手順は [`DISTRIBUTION.md`](DISTRIBUTION.md) を参照。

---

## 完成イメージ

Discord のサーバで（教材の例「minta」の場合）:

- `@minta-bot こんにちは` → 元気で明るい minta が短く挨拶を返す
- `@minta-bot ありがとう` → **「あざーーす！」** とちょっと煽り気味に返す
- 学生が話しかけても**承認カード不要**で直接応答
- **スレッドを作らず**、チャンネルで直接返信する設計

→ 個性ある AI Bot を **自分の Mac で動かす**。クラウド配線・サーバ運用ゼロ。

> 💡 上記は教材例「minta」の挙動。あなたが落ち着いた家庭教師にすれば敬語で丁寧に返し、英会話練習相手にすれば英語で会話する、というように **キャラを変えれば挙動も変わります**。設計は `CLAUDE.local.md` 1 枚で完結します（Step 2 で扱う）。

---

## 所要時間

| パート | 時間 |
|---|---|
| 手動操作（Docker / Discord Developer Portal / nanoclaw.sh 対話） | 30〜40 分 |
| Claude Code がやってくれるセットアップ | 20〜30 分（コンテナビルド時間込み） |
| 動作確認 & 人格チューニング | 10〜20 分 |
| **合計** | **60〜90 分** |

---

## 動作確認済み環境

- **macOS 26.x (Apple Silicon, arm64)** — 本教材の主な検証環境
- **Docker Desktop 4.75+** — エージェントは Linux コンテナで隔離して動く（必須）
- **Node.js 20+** / **pnpm 10+** — nanoclaw 本体の前提
- **Claude Code (公式 CLI)** — 認証およびカスタマイズの伴走役
- **認証方式** — 以下のどちらか：
  - **Claude.ai アカウント**（Pro / Max プラン）で Claude Code にサインイン（推奨）
  - **Anthropic API キー**（`console.anthropic.com` で発行）を直接貼る方式

### Windows の場合

WSL2 (Ubuntu) 上で実行を強く推奨。nanoclaw のホストプロセスは Linux/macOS が前提。WSL2 内では Mac と同一手順がそのまま通る。

PowerShell を管理者で開いて:
```powershell
wsl --install
```
→ Ubuntu 起動 → 以後 Ubuntu 内で作業。

---

## 進め方

### 推奨ルート（HTML をクリックしながら）

1. **`index.html` をダブルクリックでブラウザで開く** — 全体ハブ画面が出ます
2. **「Step 1 — 土台を作る」** カードをクリック → 表示されたプロンプトをコピーして Claude Code に貼る → 対話で進める
3. **「Step 2 — 公開チャンネル + 人格化」** カードをクリック → P5〜P7+PV を順番に Claude Code に貼る
4. 途中で Claude Code が「ブラウザで〜してください」と言ったら `MANUAL.md` の該当ステップに切り替える
5. 全部完走したら、`CLAUDE.local.md` を編集して **自分の好きな人格に書き換える**

### 文書だけで進めたい場合（HTMLが使えない / 苦手 / GitHub 上で進めたい）

`.md` ファイル直接でも完結します：

1. `MANUAL.md` のステップ A（Docker Desktop インストール）を先に終わらせる
2. `PROMPTS.md` の P0 から順に Claude Code に貼る
3. 詰まったら `TROUBLESHOOT.md` の症状リストから該当プロンプトを投げる

---

## 🛡 秘密情報の取り扱い — このハンズオンの方針

**Discord Bot Token を Claude Code (AI チャット) に貼り付けない** 方針で進めます。Bot Token は `nanoclaw.sh` の対話プロンプトに**直接ターミナルで入力**します。Claude Code は Token を一切受け取らずに動作確認だけを行う、というセキュアな手順です。

理由：本番運用で API キーや Bot Token を扱うとき、AI チャットに貼る習慣があると会話ログ・スクショ・転送先に残って事故ります。**「AI に渡さない」を体に染み込ませる練習** として最初から徹底します。

---

## ファイル構成

### 受講者がじかに開く（HTML — メイン）

| ファイル | 役割 |
|---|---|
| **`index.html`** | **入口**。ダブルクリックで開く。全体ハブ画面 |
| `step1.html` | Step 1 — 土台を作る（Docker + nanoclaw クローン + Discord Bot + nanoclaw.sh 完走）|
| `step2.html` | Step 2 — 公開チャンネル + 人格化（wiring + adapter patch + minta 化 + 動作確認）|

### 文書版（Claude Code が読む & HTML から参照）

| ファイル | 役割 |
|---|---|
| **`README.md`** | このファイル（全体マップ） |
| **`MANUAL.md`** | 手動操作 3 箇所の詳細（Docker / Discord Developer Portal / nanoclaw.sh 対話） |
| **`PROMPTS.md`** | Claude Code に貼るプロンプト集（P0〜P7 + PV）★ AI伴走の心臓部 |
| **`CHEATSHEET.md`** | `ncl` コマンドリファレンス（messaging-groups / wirings / destinations / roles） |
| **`TROUBLESHOOT.md`** | 症状別の診断プロンプト集 |

### 配布者向け

| ファイル | 役割 |
|---|---|
| `INSTRUCTOR.md` | 他の授業・組織で転用する人向けガイド |
| `DISTRIBUTION.md` | GitHub / ZIP / Notion 等で配布する手順 |

### サポートファイル

| ファイル | 役割 |
|---|---|
| `LICENSE` | CC BY-NC-SA 4.0 ライセンス本文 |
| `style.css` / `app.js` | HTML 用スタイル・スクリプト（依存ゼロ）|
| `assets/CLAUDE.local.md.minta` | 「minta」人格定義テンプレ |

---

## 中断・再開

途中で中断したり、別の日にやり直したりするのも OK。各 P プロンプトは**冪等（idempotent）**に設計されている — 同じプロンプトを再実行しても、すでに済んでいる作業はスキップする。

完全リセットしたい場合は `TROUBLESHOOT.md` の **T-RESET** プロンプトを使う。

---

## 本ハンズオンで触れる技術スタック

```
[ Mac / Win+WSL2 ]
  ├─ Claude Code             ← 伴走アシスタント・コード修正役
  ├─ Docker Desktop          ← エージェントコンテナのランタイム
  ├─ nanoclaw                ← Claude Agent SDK 上のメッセージング・ハーネス
  │   ├─ Host (Node)         ← ルーター・チャネル管理・配信
  │   ├─ Agent Container     ← Bun + Claude Agent SDK（人格・記憶）
  │   └─ ncl CLI             ← 管理操作（wiring / destinations / roles）
  └─ OneCLI Agent Vault      ← Anthropic クレデンシャル管理
                 ↕
        Discord Bot API
                 ↕
              Discord サーバ
```

---

## ライセンス・再配布

本教材は **CC BY-NC-SA 4.0** ライセンスで提供されます（非営利・継承条件付き）。詳細は `LICENSE` を参照。

サードパーティ素材は各々のライセンスに従う:

- nanoclaw: MIT
- Claude Agent SDK: Anthropic 利用規約
- Docker Desktop: Docker 利用規約
- Discord Bot API: Discord デベロッパー規約

## 配布方法・転用

- 受講者に配る場合: `DISTRIBUTION.md` を参照
- 他の授業・組織で転用する場合: `INSTRUCTOR.md` を参照

---

## サポート

- 授業中に詰まったら、隣の人・受講グループ・講師に相談
- バグや改善提案は配布元の Issue / メール / Notion 等で（配布形態による）
