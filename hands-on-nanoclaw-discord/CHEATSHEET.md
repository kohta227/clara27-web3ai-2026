# `ncl` コマンドチートシート — nanoclaw データモデルとコマンドリファレンス

トラブルや拡張時に「どこを見ればいいか」「どのコマンドを叩けばいいか」のリファレンス。

## `ncl` の使い方

すべて nanoclaw のルートディレクトリで実行：

```bash
cd ~/Documents/nanoclaw
./bin/ncl <resource> <verb> [--flag value ...]
```

ヘルプ：
```bash
./bin/ncl help                    # 全リソース一覧
./bin/ncl <resource> help         # 各リソースの詳細
```

> 💡 `bin/ncl` を `/usr/local/bin/ncl` にシンボリックリンクしておくと、どこからでも `ncl ...` で叩ける。

---

## データモデルの全体図

```
users（誰）
  └─ user_roles（権限：owner / admin）
       └─ scope: 全体 or agent_groups の特定の1つ

agent_groups（AIエージェントの識別子・人格を持つ）
  ├─ agent_group_members（このエージェントと話せる人）
  ├─ agent_destinations（このエージェントが返信を送れる宛先）
  └─ groups/<folder>/
       ├─ CLAUDE.md           ← spawn時にcomposeされる（編集禁止）
       ├─ CLAUDE.local.md     ← 人格定義（★ここを編集）
       └─ container.json      ← MCP, モデル等の設定

messaging_groups（チャネル：DM・サーバの1チャンネル）
  └─ unknown_sender_policy: strict | request_approval | public

messaging_group_agents（wiring）
  ├─ messaging_group_id × agent_group_id
  └─ engage_mode: mention | mention-sticky | pattern
       sender_scope: all | known
       ignored_message_policy: drop | accumulate

sessions（実行単位）
  └─ コンテナを起動して、inbound.db / outbound.db で会話
```

---

## よく使うコマンド

### A. 状態確認

```bash
./bin/ncl messaging-groups list      # チャネル一覧（DM・サーバごと）
./bin/ncl groups list                # エージェントグループ一覧
./bin/ncl wirings list               # チャネル⇔エージェントの紐付け
./bin/ncl destinations list          # エージェントの返信先カタログ
./bin/ncl roles list                 # 権限を持つユーザー
./bin/ncl users list                 # 認識済みユーザー
./bin/ncl sessions list              # 実行中・過去のセッション
./bin/ncl dropped-messages list      # 弾かれたメッセージ（原因確認に有用）
```

### B. オーナー権限を付与

```bash
./bin/ncl roles grant --user discord:<USER_ID> --role owner
```

→ `discord:<USER_ID>` は `./bin/ncl users list` で確認できる

### C. チャネルとエージェントを紐づける（wiring 作成）

```bash
./bin/ncl wirings create \
  --messaging-group-id <MG_ID> \
  --agent-group-id <AG_ID> \
  --engage-mode mention
```

`--engage-mode` の選択：

| 値 | 意味 |
|---|---|
| `mention` | @メンション時のみ反応（**公開チャンネル推奨**） |
| `mention-sticky` | 一度メンションされたスレッド内で連続反応 |
| `pattern` | 正規表現マッチで反応（`.` = 全部反応 = DMで使う） |

### D. エージェントの返信先カタログを追加

```bash
./bin/ncl destinations add \
  --agent-group-id <AG_ID> \
  --local-name <local-alias> \
  --target-type channel \
  --target-id <MG_ID>
```

→ エージェントが「どこに返信するか」を知っていないと、サーバのチャネルでメンションされても DM に飛んでしまう

### E. チャネルの新参者ポリシーを変更

```bash
./bin/ncl messaging-groups update \
  --id <MG_ID> \
  --unknown-sender-policy public
```

| 値 | 意味 |
|---|---|
| `strict` | 未知の発信者は黙って弾く |
| `request_approval` | オーナーに承認カードを DM で送る（**デフォルト**） |
| `public` | 誰でも話せる（**講座サポート向き**。ただし API 料金は所有者持ち） |

### F. メッセージング・グループの確認

```bash
./bin/ncl messaging-groups get --id <MG_ID>
```

---

## DB の場所と直接読む方法

データベースは SQLite。`ncl` 経由で操作するのが原則だが、デバッグで中身を見たい時：

```bash
sqlite3 ~/Documents/nanoclaw/data/v2.db ".tables"
sqlite3 ~/Documents/nanoclaw/data/v2.db "SELECT * FROM messaging_groups;"
sqlite3 ~/Documents/nanoclaw/data/v2.db ".schema agent_destinations"
```

セッション固有の DB（メッセージ流通）：

```bash
ls ~/Documents/nanoclaw/data/v2-sessions/<agent_group_id>/<session_id>/
# inbound.db (受信), outbound.db (送信)
```

---

## ログの場所

```bash
~/Documents/nanoclaw/logs/nanoclaw.log         # メインログ
~/Documents/nanoclaw/logs/nanoclaw.error.log   # エラーのみ
~/Documents/nanoclaw/logs/setup.log            # セットアップ履歴
~/Documents/nanoclaw/logs/setup-steps/         # 各ステップの詳細
```

リアルタイム監視：
```bash
tail -f ~/Documents/nanoclaw/logs/nanoclaw.log
```

---

## ホストの再起動

設定変更後（特に `pnpm patch` や `CLAUDE.local.md` 編集後）に必要：

```bash
# Step 1: install-slug を確認
launchctl list | grep nanoclaw
# → 例: 12345  0  com.nanoclaw-v2-aac6760e
#       この場合 slug = aac6760e

# Step 2: その slug でホスト再起動
launchctl kickstart -k gui/$(id -u)/com.nanoclaw-v2-aac6760e
```

> 💡 ワンライナーでまとめたい場合:
> ```bash
> SLUG=$(launchctl list | awk '/com.nanoclaw-v2-/ {gsub(/com.nanoclaw-v2-/,"",$3); print $3}')
> launchctl kickstart -k gui/$(id -u)/com.nanoclaw-v2-$SLUG
> ```

---

## 全停止 / 完全リセット

```bash
# 停止
launchctl unload ~/Library/LaunchAgents/com.nanoclaw-v2-*.plist

# 起動コンテナを止める
docker ps --filter "name=nanoclaw" -q | xargs -r docker stop

# 起動再開
launchctl load ~/Library/LaunchAgents/com.nanoclaw-v2-*.plist
```

完全リセットは `TROUBLESHOOT.md` の **T-RESET** プロンプトを使う。

---

## 関連ドキュメント

- nanoclaw 本体: https://github.com/nanocoai/nanoclaw
- 日本語 README: `~/Documents/nanoclaw/README_ja.md`
- 隔離モデル: `~/Documents/nanoclaw/docs/isolation-model.md`
- Claude Agent SDK: https://docs.anthropic.com/en/docs/claude-code
