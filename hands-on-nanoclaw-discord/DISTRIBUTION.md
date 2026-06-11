# 配布の仕方

このハンズオン教材を **受講者・読者に渡す** ための具体的な手順。

---

## 推奨配布チャネル

| 形態 | 向き | 補足 |
|---|---|---|
| **GitHub リポジトリ** | 多数の受講者・継続的更新 | 推奨。フォーク歓迎の精神に合う |
| **GitHub Pages（HTML 公開）** | ブラウザだけで参照させたい場合 | `index.html` を起点に静的サイトとして公開 |
| **Notion ページ** | テキスト中心の閲覧向け | コードハイライトに制約あり |
| **Zip ファイル** | 一回限り・オフライン配布 | バージョン管理に弱い |

---

## GitHub 配布の手順

### 1. 配布前チェックリスト

教材の動作確認を一度行ってから push する：

- [ ] `PROMPTS.md` の P0〜P7+PV を実機で通す
- [ ] HTML 4 ページが正しく描画される（hero の文字色・コピーボタン動作）
- [ ] ローカル `file://` で開いてリンクが想定通り
- [ ] `assets/CLAUDE.local.md.minta` が自分の組織向けに調整済み
- [ ] `LICENSE` がそのまま残っている
- [ ] サポート連絡先が `README.md` に書かれている

### 2. リポジトリ作成

```bash
cd ~/Documents/web3ai-gairon/agents-docs/hands-on-nanoclaw-discord
git init
git add .
git commit -m "Initial: nanoclaw × Discord ハンズオン教材"

# GitHub に新しい public repo を作る (例: nanoclaw-discord-handson)
# その後リモートを追加して push
git remote add origin git@github.com:<username>/nanoclaw-discord-handson.git
git branch -M main
git push -u origin main
```

### 3. README 上部にバッジ・スクショ追加（任意）

完成形 Bot の応答スクショ（minta が「あざーーす！」と返している絵）を `README.md` 冒頭に貼ると、受講者が完成イメージを持ちやすい。

### 4. リポジトリ説明文（GitHub の About 欄）

例：

> nanoclaw を使った Discord Bot ハンズオン教材 — Claude Code が伴走、90 分で minta-bot が動く。CC BY-NC-SA 4.0

### 5. 共有 URL

受講者に渡す URL は GitHub Pages を有効化した場合：

```
https://<username>.github.io/<repo-name>/
```

GitHub Pages を使わない場合は README 直接:

```
https://github.com/<username>/<repo-name>
```

---

## ZIP 配布の手順（GitHub 使わない場合）

```bash
cd ~/Documents/web3ai-gairon/agents-docs/
zip -r hands-on-nanoclaw-discord.zip hands-on-nanoclaw-discord/

# サイズ確認
ls -lh hands-on-nanoclaw-discord.zip
```

→ 講義サイトに添付 / メールで送付 / USB で渡す。

---

## Notion 配布の手順

`README.md` / `MANUAL.md` / `PROMPTS.md` を Notion のページとしてインポート。プロンプト本体はトグル or コードブロックで貼る。

メリット：受講者にとっての敷居が低い（ブラウザだけで読める）。コピペが楽。
デメリット：教材のバージョン管理が GitHub より弱い。コードハイライトが不完全。

---

## 配布後の更新

### マイナー更新（typo 修正など）

```bash
git commit -am "fix: typo in MANUAL.md C-3"
git push
```

### バージョン管理（任意）

`CHANGELOG.md` を別途置くか、`README.md` の末尾にバージョン履歴を書く。

```markdown
## v1.0.0 (2026-05-28)
- 初版リリース

## v1.1.0 (2026-XX-XX)
- Discord Developer Portal の UI 変更に対応
- 派生レシピを追加
```

---

## 受講者側の取得手順（受講者に伝える内容）

```markdown
# このハンズオンを始めるには

## 1. 教材を入手

git clone https://github.com/<username>/<repo-name>.git
cd <repo-name>

または、ZIP / Notion からダウンロード。

## 2. ブラウザで index.html を開く

ダブルクリックで開けば全体ハブが表示されます。Step 1 / Step 2 のカードから進めてください。

## 3. README.md を読む（任意）

教材の全体像を 5 分で把握できます。

## 4. MANUAL.md のステップ A を実行（5〜10分）

Docker Desktop のインストール（事前準備）。

## 5. step1.html / step2.html の起動プロンプトを Claude Code に貼り付け

あとは Claude Code が伴走してくれます。
```

---

## ライセンス上の配慮

このハンズオン教材は **CC BY-NC-SA 4.0** ライセンス。配布時は以下を明記：

```
原典: 千葉工業大学「web3/AI 概論」 — nanoclaw × Discord ハンズオン
ライセンス: CC BY-NC-SA 4.0
原典 URL: <配布元 URL>
```

転用・改変する場合も同じライセンスで継承（CC BY-NC-SA 4.0 の SA 条件）。非営利利用に限る（NC 条件）。

---

## トラブル時の連絡先

配布形態に応じて：

- **GitHub**: Issue を立てる
- **Notion**: コメント機能
- **メール**: `README.md` のサポート欄に書く

受講者には授業中に詰まった場合の連絡経路を明示する。

授業中の即応窓口：

- 講師 + TA 1〜2 名を確保（受講者 20 名で TA 1 名目安）
- 質問用の Discord チャンネル（受講者全員参加）を用意して、即時相談を受け付ける
- 詰まった人の Mac を画面共有してもらえる体制（Zoom / Google Meet）
