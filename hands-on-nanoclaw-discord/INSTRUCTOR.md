# 講師・転用者向けガイド

この教材を **自分の授業・研修・イベントで使いたい** と思った人向け。
原著者以外の講師が転用する手順、改変ポイント、想定されるハマり所。

---

## まず読むべき順序

1. このファイル (`INSTRUCTOR.md`) ← 今ここ
2. `README.md` — 教材の全体像
3. `PROMPTS.md` — 受講者が触るメイン教材（Claude Code に貼り付ける P0〜P7+PV）
4. `MANUAL.md` — Docker / Discord Developer Portal / nanoclaw.sh の手動手順（時期によって UI が変わるので注意）
5. `TROUBLESHOOT.md` — エラー時のリカバリプロンプト集
6. `CHEATSHEET.md` — `ncl` コマンドリファレンス（運用時に役立つ）
7. HTML 4 ページ (`index.html` / `step1.html` / `step2.html` / `customize.html`) — 受講者がじかに開く画面なので、自分の授業文脈に合わせて文言を調整するならここ

---

## 自分の授業に合わせて変更すべき箇所

### 最低限変えるところ

| ファイル | 箇所 | 変更内容 |
|---|---|---|
| `README.md` | 冒頭の引用文 | 自分の授業・組織名を書く（または削除） |
| `README.md` | サポート欄 | 自分の連絡先・質問チャネルを書く |
| `index.html` | hero / footer | 「千葉工業大学 web3/AI 概論」の名残りがあれば自分の文脈に置換 |
| `assets/CLAUDE.local.md.minta` | 全体 | 「minta」キャラの設定。自分の組織のサポート Bot に合わせて書き換える |

### よく変えるところ（推奨）

| ファイル | 箇所 | 変更内容 |
|---|---|---|
| `PROMPTS.md` P7 / `assets/CLAUDE.local.md.minta` | 人格設定 | 別キャラ（チューター、相談役、特定テーマの先生など）に変えたい場合 |
| `customize.html` | 派生レシピカード | 自分の組織向けの派生 Bot レシピを追加 |
| `MANUAL.md` | スクリーンショット | `assets/screenshots/` に最新版（Discord Developer Portal UI 等）を撮って配置 |
| `DISTRIBUTION.md` | 配布先 URL / 連絡先 | 自分のリポジトリ URL に置換 |

### 変えてはいけないところ

| ファイル | 箇所 | 理由 |
|---|---|---|
| `LICENSE` | 全体 | CC BY-NC-SA 4.0 の継承条件があるため、ライセンスは変更不可（ShareAlike 条件） |
| `LICENSE` | クレジット行 | 元の著作権表示を保持（Attribution 条件） |

---

## 派生形のアイデア

`CLAUDE.local.md` を変えるだけで、minta 以外のキャラに変身できる。

派生例の **詳細プロンプト** はすべて [customize.html](customize.html) に整理してある:

- 📚 やさしい家庭教師 Bot
- 🏋 辛口コーチ Bot
- 🗒 議事録要約 Bot
- 💼 Slack にも応答させる（チャネル追加）
- 📅 Google Calendar と連携（MCP ツール）
- 👥 複数キャラを 1 つの nanoclaw で運用

授業で「設定一発で人格が変わる」をデモする時は **「やさしい家庭教師 Bot」** が分かりやすい（minta との対比が鮮明）。業界・組織に合わせた独自の派生を作るなら、`customize.html` のカード構造をコピーして自分のレシピを追加する。

各派生で、**`CLAUDE.local.md` だけ変える** → 他の手順は全く同じ。`groups/<group-folder>/CLAUDE.local.md` の内容を差し替えるだけで、ホスト再起動後に人格が切り替わる。

---

## 認証・料金の判断材料

授業対象や利用シーンに応じて、Anthropic 認証方式を選ぶ:

| 用途 | 推奨認証 | 理由 |
|---|---|---|
| **少人数（〜10名）の集中ハンズオン** | Claude.ai Pro / Max でブラウザサインイン | 受講者ごとにアカウントを使う。料金は受講者持ち（or 講師補助） |
| **個人練習・自己学習** | 同上 | 月額固定で安心 |
| **大規模授業（30 名以上）** | Anthropic API キー（受講者ごと） | 配布管理が大変。事前にキーを発行して `console.anthropic.com` から共有 |
| **講師による単一デモ** | Claude.ai Pro / Max（講師アカウント） | 受講者は見学。動作確認は講師 PC 上 |

切り替えは `nanoclaw.sh` の対話プロンプトで選択できる。詳細は `MANUAL.md` C-3 参照。

API 料金見積もり：ハンズオン中の利用量はおおむね $1 未満／人。`unknown_sender_policy=public` を有効にした後は誰でもメンションで API を呼べる点に注意。

---

## 想定されるハマり所（講師として）

### 当日 Discord 周りの仕様変更

Discord Developer Portal は UI を定期的に変える。半年〜1 年で `MANUAL.md` の B-1〜B-3 のスクリーンショットが古くなる可能性。

対処:
- 授業直前に自分で全ステップ通しでテストする
- 古いスクショは captioned で「概念図として参照」と注記する
- `TROUBLESHOOT.md` に新しい症状が出たら追記

### Docker Desktop 周りの問題

受講者の Mac で Docker Desktop のインストールが管理者権限不足で失敗する／VM が起動しないケース。

対処:
- 事前に管理者権限の確認を案内
- WSL2 / Linux への切り替えを提示（`MANUAL.md` の A-linux セクション）
- 共用 PC の場合は事前に Docker をインストールしておく

### 受講者のスペック差

メモリ容量・OS のバリエーション。

対処:
- P0 で Claude Code に環境判定させる（OS・メモリ・既存ツール）
- Apple Silicon と Intel で挙動が一部異なる可能性
- 「皆さん同じ進度で進む必要はない」と最初に言う（並列実行できる教材設計）

### Claude Code サブスクが切れている受講者

授業中に発覚することがある。

対処:
- ペア学習を奨励
- Anthropic API キーを別途用意してフォールバック（小額のクレジット）
- 代替手段として「コマンドをそのままターミナルに打つだけ」のフォールバックパスを用意（PROMPTS.md のプロンプト内容を自分で順に解読して実行する）

### nanoclaw のバージョン更新

nanoclaw 本体が更新されると、`@chat-adapter/discord` のバージョンが変わって `pnpm patch` が失敗する可能性。

対処:
- 受講者には授業時点で動作確認した nanoclaw のコミットを案内
- 自分で全ステップ再テストしてから配布
- `PROMPTS.md` P6 のパッケージバージョンを差し替えるだけで対応可能

### 自動 wiring のデフォルトが `mention-sticky`

nanoclaw のデフォルト挙動として、新しい Discord グループチャネルで Bot が承認登録された時、自動で `mention-sticky` モードの wiring が作られる。これは「一度メンションされたら以後そのチャネル全体で全メッセージに反応」という設計だが、多人数チャンネルでは Bot が連続応答し続けて **API 料金が暴発する事故**になりやすい。

対処:
- 受講者には事前に「公開チャネルで Bot を承認登録した直後は `./bin/ncl wirings list` で engage_mode を確認して、mention-sticky なら mention に変える」と伝える
- 恒久対策として `src/modules/permissions/index.ts` のデフォルトを `mention` に変えるパッチを当てておくのが推奨（詳細は customize.html「📡 公開チャンネルで Bot が勝手に連続返信するのを防ぐ」レシピ、または TROUBLESHOOT の T-AUTO-WIRING-SPAM 参照）
- 講師は自分の配布フォークでこのパッチを事前適用してから配ると、受講者はこの罠を踏まずに済む

---

## 改善提案・PR を受け取る場合

GitHub で公開している場合、Issue や PR を受け取る。

歓迎しやすい変更:
- typo 修正
- スクリーンショット更新（Discord UI 変更追従）
- 新しい派生 `CLAUDE.local.md` の事例追加
- `TROUBLESHOOT.md` に新症状のプロンプト追加
- 別 OS（Linux / WSL2）での動作報告

慎重にすべき変更:
- アーキテクチャ大幅変更（nanoclaw → 別フレームワーク等）
- ライセンス絡みの変更

---

## 推奨: 配布前のドライラン

授業の 1 週間前を目安に:

1. クリーンな PC（または別アカウント / VM）で全プロンプトを通す
2. 想定時間（90 分）内に終わるか確認
3. 詰まった箇所があれば該当プロンプトを補強
4. スクリーンショットの差し替えが必要か確認
5. nanoclaw / Discord adapter / Docker Desktop のバージョンが想定範囲か確認

---

## 質問・連絡先

転用に関して困ったら、`README.md` 冒頭に書かれた原著（千葉工業大学 web3/AI 概論）の経路から問い合わせるか、自身で配布する場合は自分の経路を `README.md` のサポート欄に書く。
