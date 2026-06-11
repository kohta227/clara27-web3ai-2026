# 手動操作ガイド — あなたが手を動かす 3 箇所

> **📖 このファイルは「あなた（受講者）が画面で開きながら操作する」ためのページです。**
> Claude Code に貼り付けるプロンプト集ではありません（プロンプトは `PROMPTS.md`）。
> ブラウザでブックマークしておくか、別タブで開きっぱなしにすると進めやすいです。

このハンズオンで **人間がブラウザ／ターミナルで自分の手でやる必要がある操作** は 3 箇所だけ。それ以外は Claude Code が伴走してくれます。

| ステップ | 内容 | 所要 |
|---|---|---|
| **A** | Docker / Docker Desktop のインストール | 5〜10 分 |
| **B** | Discord Bot 作成（Developer Portal） | 10〜15 分 |
| **C** | `nanoclaw.sh` の対話入力（ターミナルから） | 10〜15 分 |

Claude Code が **「ここはあなたの操作が必要です」「ブラウザで〜してください」** と立ち止まったら、このファイルの該当セクション（A / B / C）を画面で開いて、その手順に従ってください。終わったら Claude Code に「終わった」「次へ」と返事をすると続行します。

---

## A. Docker のインストール

> PROMPTS.md の **P1** から参照される

nanoclaw はエージェントを **Linux コンテナで隔離して動かす**。Docker が必須。

### A-mac. macOS（Docker Desktop）

#### A-mac-1. ダウンロード

https://www.docker.com/products/docker-desktop/ から、自分の Mac に合わせて選ぶ：

- **Apple Silicon (M1/M2/M3/M4)** → "Download for Mac - Apple Silicon"
- **Intel** → "Download for Mac - Intel"

自分のチップが分からない場合はターミナルで:
```bash
uname -m
```
→ `arm64` なら Apple Silicon、`x86_64` なら Intel。

#### A-mac-2. インストール

1. ダウンロードした `Docker.dmg` をダブルクリック
2. **Docker.app を Applications フォルダにドラッグ**
3. Applications から **Docker.app を起動**
4. 「インターネットからDLしたアプリ」確認 → **開く**
5. ライセンス同意 → **Accept**
6. 推奨設定 → そのまま進める
7. 管理者パスワード入力（要求された場合）

#### A-mac-3. 起動確認

メニューバーに 🐳 アイコンが出て **「Docker Desktop is running」** になるまで待つ（初回は 1〜3 分）。

ターミナルで:
```bash
docker --version
docker info
```

両方エラーなく動けば OK。

---

### A-linux. Linux / WSL2（Docker Engine）

> Windows ユーザーは **WSL2 (Ubuntu)** を入れてから、その中で以下を実行。

#### A-linux-1. インストール

公式スクリプトでまとめて入れる：
```bash
curl -fsSL https://get.docker.com | sh
```

#### A-linux-2. sudo なしで叩けるようにする

```bash
sudo usermod -aG docker $USER
newgrp docker     # シェルを開き直すか、これで現セッションに反映
```

#### A-linux-3. daemon を起動

WSL2 の場合：
```bash
sudo service docker start
```

ネイティブ Linux (systemd) の場合：
```bash
sudo systemctl enable --now docker
```

#### A-linux-4. 起動確認

```bash
docker --version
docker info
docker run hello-world   # 動作確認（hello world コンテナを起動）
```

> 💡 WSL2 で動かす場合、ファイルパスは Linux 側（`/home/<user>/Documents/nanoclaw`）に置くのが推奨。Windows 側 (`/mnt/c/...`) は I/O が遅い。

---

> 詰まったら → `TROUBLESHOOT.md` の **T-DOCKER**

---

## B. Discord Bot の作成

> PROMPTS.md の **P4** から参照される

### B-1. Application の作成

1. https://discord.com/developers/applications にアクセス
2. 右上の青いボタン **「新しいアプリケーション (New Application)」** をクリック
3. ダイアログで：
   - **名前**：あなたの好きな Bot 名（例：`minta-bot` / `my-helper` / `sensei-bot` など。後で変更可能）
   - **「私はDiscord利用規約に同意します」** にチェック
4. **「作成」** をクリック

> 💡 **ここがあなたの Bot のアイデンティティを決める最初のタイミング**。教材例の「minta-bot」をそのまま使っても、まったく違う名前にしてもOK。決めた名前は控えておいてください。後の `nanoclaw.sh` 対話でも同じ名前を使うと混乱しません。

### B-2. Bot を有効化 & Token を取得

1. 左サイドバーの **「Bot」** をクリック
2. ページ下部 **「Privileged Gateway Intents」** で以下 2 つを **ON**：
   - **MESSAGE CONTENT INTENT** ✅（必須・最重要）
   - **SERVER MEMBERS INTENT** ✅（推奨）
3. 画面下に出てくる **「変更を保存」** をクリック
4. ページ上部の **「Reset Token」** → 確認ダイアログ → 表示される Token を**すぐコピー**

> ⚠️ **Token は一度しか表示されない**。失くしたら Reset Token をやり直す。
> ⚠️ **Token は AI チャット（Claude Code 含む）に貼らない**。後で `nanoclaw.sh` の対話プロンプトに**ターミナルで直接**貼り付ける。

### B-3. Bot をサーバに招待

1. 左サイドバー **「OAuth2」** → **「OAuth2 URL Generator」**
2. **SCOPES** で `bot` をチェック
3. **BOT PERMISSIONS** で以下にチェック：
   - View Channels
   - Send Messages
   - Send Messages in Threads
   - Read Message History
   - Add Reactions
4. ページ下部に生成された **URL をコピー** → 新しいタブで開く
5. **使いたい Discord サーバを選択** → 「認証」
6. 自分のサーバのメンバー一覧に `minta-bot`（オフライン状態でOK）が出れば成功

> 💡 nanoclaw.sh の対話で「招待ページを開く」と言われたときは、これと同じ URL が自動で開く。**最初に招待し損ねたサーバには、後でこの手順で個別に追加で招待できる**。

---

## C. `nanoclaw.sh` の対話入力ガイド

> PROMPTS.md の **P3** から参照される

`bash nanoclaw.sh` をターミナルで実行すると、対話的に各種設定を聞かれる。ここでの選択肢ガイド。

### C-1. Homebrew インストールの確認

```
Homebrew isn't installed. NanoClaw uses it to install Node and Docker on your Mac.
This also installs Apple's Command Line Tools, which can take 5-10 minutes.
```

→ **続行** で OK。Apple CLT のインストールに 5〜10 分。すでに Node/Docker が入っていれば再インストールは省略される。

### C-2. How would you like to begin?

```
○ Standard setup
○ Advanced (override defaults)
```

→ **Standard setup** を選ぶ（教材は標準フロー前提）

### C-3. 認証方式

```
○ Sign in with Claude subscription
○ Paste an existing OAuth token
○ Paste an Anthropic API key
```

→ **Sign in with Claude subscription** を選ぶ。ブラウザが開いて Claude にサインインするフローが走る。OAuth トークンが自動取得され、OneCLI Vault に保存される。

### C-4. What should your assistant call you?

→ **あなた（人間）の呼ばれたい名前**（例: `spark`、Discord ユーザー名、ニックネームなど）。これは Bot の名前ではなく、Bot があなたに対して使う呼び名です。後で変更可能。

> 💡 ここで答えた名前が、後で出てくる `groups/dm-with-<your-name>/` フォルダ名に使われます。CLAUDE.local.md の編集場所を探すときの目印になるので、何と答えたか覚えておいてください。

### C-5. Timezone confirmation

```
I detected Asia/Tokyo from your computer settings. Is that right?
```

→ **Yes**

### C-6. Want to chat with your assistant from your phone?

```
○ Yes, connect Discord
○ No, just CLI for now
```

→ **Yes, connect Discord** を選ぶ

### C-7. Do you already have a Discord bot?

```
○ Yes, I have a bot token ready
○ No, walk me through creating one
○ ← Back to channel selection
```

→ **No, walk me through creating one** を選ぶと、nanoclaw が Discord Developer Portal を自動で開いて手順を案内してくれる（**MANUAL.md ステップ B** と同じ内容）。Token を取得したら nanoclaw に戻って入力。

### C-8. Press Enter to open the invite page

→ Enter で招待 URL がブラウザで開く。**メイン用途のサーバを選んで招待**。複数サーバに入れたい場合は、後で MANUAL.md ステップ B-3 の URL Generator から個別に招待できる。

### C-9. I've added the bot to a server

→ **Yes**

### C-10. How should this Discord account be registered?

```
● Owner (full access — recommended for your own account)
○ Admin (can manage the agent for this channel)
○ Member (can chat with the agent but nothing more)
```

→ **Owner** を選ぶ。自分のBotなので全権限。

### C-11. 完走

`Setup complete!` のメッセージが出れば C 終了。PROMPTS.md の **P5** に戻る。

> 詰まったら → `TROUBLESHOOT.md` の **T-NANOCLAW-SH**
