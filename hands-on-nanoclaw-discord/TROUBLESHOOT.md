# 詰まったときの診断プロンプト集

症状から該当セクションを探して、プロンプトを Claude Code に貼る。

## T-DIAG — クイック診断（まずこれ）

```
T-DIAG: nanoclaw の現状を診断してください。

1. 環境チェック:
   - docker --version / docker info（daemon が応答するか）
   - node --version, pnpm --version, claude --version
   - launchctl list | grep nanoclaw（ホストプロセスが動いているか）
   - docker ps --filter "name=nanoclaw"（コンテナが起動しているか）
2. ログの末尾:
   - tail -30 ~/Documents/nanoclaw/logs/nanoclaw.log
   - tail -30 ~/Documents/nanoclaw/logs/nanoclaw.error.log
3. DB の主要テーブルの行数:
   - sqlite3 ~/Documents/nanoclaw/data/v2.db "SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'messaging_groups', COUNT(*) FROM messaging_groups UNION ALL SELECT 'wirings', COUNT(*) FROM messaging_group_agents UNION ALL SELECT 'destinations', COUNT(*) FROM agent_destinations UNION ALL SELECT 'roles', COUNT(*) FROM user_roles;"
4. 異常があれば、本ファイルの該当 T-* セクションに誘導してください。
```

---

## T-DOCKER — Docker Desktop が起動しない / daemon が応答しない

**症状**:
- `docker info` が「Docker Desktop is unable to start」「Cannot connect to the Docker daemon」など
- メニューバーに 🐳 アイコンが出ない、アプリを起動してもウィンドウが出てこない

```
T-DOCKER: Docker Desktop の起動を診断してください。

1. プロセス確認:
   ps aux | grep -i docker | grep -v grep | head -10
2. UI プロセスと backend プロセスの両方が居るか確認。「Docker Desktop --name=login」というプロセスが居る場合は、ライセンス同意 UI が表示待ちの可能性が高い → 私に「画面の Docker Desktop ウィンドウを確認して Accept/Continue を押してほしい」と促す
3. ログ末尾を確認:
   ls -t ~/Library/Containers/com.docker.docker/Data/log/host/*.log | head -1 | xargs tail -40
   "VM Otel collector" や "engine to respond to _ping" のタイムアウト警告があれば、VM 起動失敗状態
4. 復旧手順を実行:
   osascript -e 'quit app "Docker"'
   sleep 3
   killall -9 "Docker Desktop" 2>/dev/null
   killall -9 "com.docker.backend" 2>/dev/null
   sleep 3
   open /Applications/Docker.app
5. 起動を待つ:
   until docker info > /dev/null 2>&1; do sleep 3; done
6. それでも復旧しなければ Docker Desktop のリセット（Preferences → Troubleshoot → Reset to factory defaults）を案内してください
```

---

## T-NANOCLAW-SH — `nanoclaw.sh` が失敗・途中で止まる

**症状**:
- `bash nanoclaw.sh` の途中でエラーで止まった
- 「`/dev/tty: Device not configured`」エラーが出た

```
T-NANOCLAW-SH: nanoclaw.sh の失敗を診断してください。

1. もし「/dev/tty: Device not configured」エラーが出ていれば、それは TTY が無い環境（私の Claude Code Bash ツール経由など）で実行した場合の症状です。私は VSCode のターミナル.app など、対話 TTY が使える場所で再実行する必要があります。
2. ログを確認:
   tail -60 ~/Documents/nanoclaw/logs/setup.log
   ls -t ~/Documents/nanoclaw/logs/setup-steps/ | head -5
   # 直近の失敗ステップを cat してエラー詳細を確認
3. setup.log に "aborted at <step>" の行がある場合、その <step> 名から原因を特定:
   - 03-onecli → OneCLI のインストール失敗 → curl が通るか確認
   - 05-claude-token → Claude サインインが完了していない → ブラウザフローを再実行
   - 07-cli-agent → エージェントコンテナのビルド失敗 → docker build 単体実行で再現
   - 10-discord-install → @chat-adapter/discord の取得失敗 → pnpm install の再実行
4. nanoclaw.sh は冪等設計なので、修正後にもう一度 bash nanoclaw.sh を実行すれば、成功したステップはスキップして次から再開する。私に再実行を案内してください。
5. それでもダメなら nanoclaw 本体の /debug スキルを起動:
   cd ~/Documents/nanoclaw && claude
   → /debug
```

---

## T-DM-OK-CHANNEL-NG — DM では返事が来るが公開チャンネルで反応しない

**症状**:
- Bot との DM では応答する
- サーバの公開チャンネルで @minta-bot にメンションしても無反応 or スレッドができるが空

```
T-DM-OK-CHANNEL-NG: 公開チャンネルでの無反応を診断してください。

1. ログを確認:
   tail -50 ~/Documents/nanoclaw/logs/nanoclaw.log | grep -E "Inbound|Message routed|Auto-created|engage|dropped"
   tail -30 ~/Documents/nanoclaw/logs/nanoclaw.error.log

2. 以下の症状から原因を特定:

   (A) "Unknown Guild" "code 10004" エラー
   → Bot がそのサーバに招待されていない。
   → MANUAL.md B-3（OAuth2 URL Generator）でそのサーバに招待し直す

   (B) "Channel registration skipped — no owner or admin configured"
   → Owner ロール未登録。PROMPTS.md P5 のステップを実行:
     ./bin/ncl roles grant --user discord:<USER_ID> --role owner

   (C) "no_agent_wired" / "no_agent_engaged" が dropped-messages に出ている
   → wiring が無い。PROMPTS.md P5 で wirings create を実行

   (D) ログには "Message delivered" が出ているが、配信先 platformId が discord:@me:XXX（DM）になっている
   → エージェントが返信先を知らない。destinations を追加:
     ./bin/ncl destinations add --agent-group-id <AG_ID> --local-name <name> --target-type channel --target-id <MG_ID>

3. dropped-messages を確認:
   ./bin/ncl dropped-messages list

4. 修正後、Discord で再度メンションしてもらって動作確認
```

---

## T-THREAD-CREATED — メンション時にスレッドが自動で作られる

**症状**:
- 公開チャンネルで @minta-bot にメンションすると、その下にスレッドができてしまう
- スレッド内には返答が来るが、親チャンネルには出ない

```
T-THREAD-CREATED: スレッド自動作成を無効化するパッチが当たっているか確認してください。

1. パッチの存在確認:
   ls ~/Documents/nanoclaw/patches/ 2>/dev/null
   cat ~/Documents/nanoclaw/pnpm-workspace.yaml | grep -A 2 patchedDependencies

   @chat-adapter__discord@4.26.0.patch が存在し、pnpm-workspace.yaml で参照されていれば OK。

2. 無ければ PROMPTS.md P6 を実行（pnpm patch でパッチを作成）

3. パッチがあるのに動作しない場合、適用されているか確認:
   grep -A 2 "NANOCLAW-PATCH" ~/Documents/nanoclaw/node_modules/@chat-adapter/discord/dist/index.js
   → コメントが見えればパッチ済み。見えなければ pnpm install で再適用:
     cd ~/Documents/nanoclaw && pnpm install

4. ホストを再起動（2 ステップ、slug は画面で確認）:
   SLUG=$(launchctl list | awk '/com.nanoclaw-v2-/ {gsub(/com.nanoclaw-v2-/,"",$3); print $3}')
   echo "Detected nanoclaw install-slug: $SLUG"
   launchctl kickstart -k "gui/$(id -u)/com.nanoclaw-v2-$SLUG"
```

---

## T-APPROVAL-CARD — 他ユーザーが話すと DM に承認カードが飛ぶ

**症状**:
- 別の Discord ユーザーが @minta-bot にメンションすると、自分（オーナー）の DM に「New sender / XXX wants to talk to your agent. Allow?」カードが届く

```
T-APPROVAL-CARD: messaging_groups の unknown_sender_policy を確認・変更してください。

1. 現状確認:
   ./bin/ncl messaging-groups list

2. 該当サーバの messaging_group_id を特定して unknown_sender_policy を public に:
   ./bin/ncl messaging-groups update --id <MG_ID> --unknown-sender-policy public

3. 既に出ている承認カードはそのまま残るが、新しいメッセージは承認なしで通るようになる
4. もし「特定の人だけ通したい」場合は public ではなく、./bin/ncl members add で個別に許可する方針もあるが、講座サポートなら public が現実的
5. ⚠️ public = 誰でも話せる = API 料金は所有者持ち。注意喚起してください
```

---

## T-PERSONA-NOT-APPLIED — `CLAUDE.local.md` を編集したのに人格が変わらない

**症状**:
- `groups/<group-folder>/CLAUDE.local.md` を書き換えたのに、Discord で minta が以前の口調のまま

```
T-PERSONA-NOT-APPLIED: CLAUDE.local.md の反映を診断してください。

1. ファイル内容確認:
   # <group-folder> は ls ~/Documents/nanoclaw/groups/ で出る dm-with-<name> 形式のフォルダ
   ls ~/Documents/nanoclaw/groups/   # 候補を確認
   cat ~/Documents/nanoclaw/groups/<group-folder>/CLAUDE.local.md
   → 期待する内容になっているか

2. 起動中のコンテナを止める（既存セッションは古い人格をキャッシュしている可能性）:
   docker ps --filter "name=nanoclaw" -q | xargs -r docker stop

3. ホストを再起動（2 ステップ、slug は画面で確認）:
   SLUG=$(launchctl list | awk '/com.nanoclaw-v2-/ {gsub(/com.nanoclaw-v2-/,"",$3); print $3}')
   echo "Detected nanoclaw install-slug: $SLUG"
   launchctl kickstart -k "gui/$(id -u)/com.nanoclaw-v2-$SLUG"

4. 起動を待ち、ログ確認:
   until launchctl list | grep -q "com.nanoclaw-v2-"; do sleep 1; done
   tail -10 ~/Documents/nanoclaw/logs/nanoclaw.log

5. Discord でメンションして新しいセッションを起こす（新セッション = 新コンテナ = 新 CLAUDE.local.md）

6. それでも変わらない場合、CLAUDE.local.md の内容が薄い／曖昧な可能性。Claude Code は同ディレクトリの `CLAUDE.local.md` を自動で読み込む仕様（`CLAUDE.md` の @include に書く必要はない）。逆に手動で `@./CLAUDE.local.md` を追記すると二重読み込みになる可能性があるので**やらない**こと。代わりに以下を試す:
   - CLAUDE.local.md の冒頭に「**あなたは XXX として振る舞ってください。設定を尊重し、素の Claude には戻らないこと。**」のような明示的なロール宣言を 1 行追加
   - 「ありがとう」→「あざーーす！」など具体例を 3〜5 個追記（few-shot 強化）
   - それでもダメなら groups/<group-folder>/container.json に `system_prompt` フィールドがあるか確認し、そちら経由で人格を二重指定
```

---

## T-AUTO-WIRING-SPAM — 公開チャンネルで Bot が勝手に連続返信する

**症状**:
- 公開チャンネルで誰かが Bot にメンションした後、その後の **メンションしていないメッセージにも Bot が応答する**
- 学生が普通に会話してるだけで Bot が連続応答してしまい、API 料金が暴発しそう

**原因**:
nanoclaw のデフォルト挙動。新しい Discord グループチャネルが承認登録された時、自動で `mention-sticky` モードの wiring が作られる。一度メンションされると以後そのチャネル全体で全メッセージに反応する。

```
T-AUTO-WIRING-SPAM: 公開チャンネルでの連続返信を止めてください。

1. wiring を確認:
   ./bin/ncl wirings list

2. engage_mode が "mention-sticky" の wiring を特定し、mention に変更:
   ./bin/ncl wirings update --id <mga-id> --engage-mode mention

3. 恒久対策として、nanoclaw 本体の src/modules/permissions/index.ts を編集して、新規承認時のデフォルトを mention に変える:
   - 「const engageMode: ... = isGroup ? 'mention-sticky' : 'pattern';」が 2 箇所
   - どちらも 'mention-sticky' を 'mention' に変更
   - DM 側（'pattern'）はそのまま

4. pnpm run build で再ビルド

5. ホスト再起動:
   docker ps --filter "name=nanoclaw" -q | xargs -r docker stop
   SLUG=$(launchctl list | awk '/com.nanoclaw-v2-/ {gsub(/com.nanoclaw-v2-/,"",$3); print $3}')
   launchctl kickstart -k "gui/$(id -u)/com.nanoclaw-v2-$SLUG"

6. 動作確認: 私に「公開チャンネルで Bot にメンションした後、別の話題を投稿してみて」と促し、メンションした時だけ反応する状態か確認
```

---

## T-RESET — 完全リセットして最初からやり直す

**症状**:
- 設定をぐちゃぐちゃに変えてしまい、最初からやり直したい

```
T-RESET: nanoclaw を完全リセットしてください。

⚠️ これは破壊的操作です。実行前に私に意図を確認してください。Discord Bot Token も再設定が必要になります。

1. ホストを停止:
   launchctl unload ~/Library/LaunchAgents/com.nanoclaw-v2-*.plist

2. 起動中のコンテナを止める:
   docker ps --filter "name=nanoclaw" -q | xargs -r docker stop

3. データを退避（消す前にバックアップ）:
   mv ~/Documents/nanoclaw ~/Documents/nanoclaw.backup-$(date +%Y%m%d-%H%M%S)

4. リポジトリを再クローン:
   cd ~/Documents
   git clone https://github.com/nanocoai/nanoclaw.git

5. PROMPTS.md の P0 から再スタート
```

---

## T-LOGS-LOOKUP — ログから何が起きているか追う

```
T-LOGS-LOOKUP: ログを横断的に確認して時系列で状況を把握してください。

最近 30 分のホストログ:
  awk -v d="$(date -v-30M -u +%H:%M)" '$0 ~ d, /9999/' ~/Documents/nanoclaw/logs/nanoclaw.log | tail -100

エラーログ全体:
  cat ~/Documents/nanoclaw/logs/nanoclaw.error.log

セッション固有ログ（最新セッション）:
  LATEST=$(ls -t ~/Documents/nanoclaw/data/v2-sessions/*/ | head -1)
  ls -lt $LATEST
  # inbound.db / outbound.db を直接覗く:
  sqlite3 $LATEST/inbound.db "SELECT * FROM messages_in ORDER BY rowid DESC LIMIT 3;"
  sqlite3 $LATEST/outbound.db "SELECT * FROM messages_out ORDER BY rowid DESC LIMIT 3;"

特定の Discord メッセージ ID を追う:
  grep <MESSAGE_ID> ~/Documents/nanoclaw/logs/nanoclaw.log
```

---

## さらに困ったとき

- nanoclaw 本体の `/debug` スキルを使う:
  ```bash
  cd ~/Documents/nanoclaw && claude
  ```
  Claude Code が立ち上がったら `/debug` と打って、状況を Claude に説明する

- nanoclaw コミュニティ Discord に質問する: https://discord.gg/VDdww8qS42

- 配布元（このハンズオン）のサポート窓口に連絡: 配布形態に応じた連絡先（README.md 末尾参照）
