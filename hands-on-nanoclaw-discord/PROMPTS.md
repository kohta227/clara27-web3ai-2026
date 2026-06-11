# Claude Code プロンプト集

このファイルは **Claude Code に順番に貼り付けて使う指示集** です。
各プロンプトを上から順にコピー → Claude Code にペースト → 実行を待つ → 次へ。

## 進行ルール（最初に一度だけ把握）

- **各プロンプトは自己完結している**ので、途中で会話を閉じてもまた開いて続行できる
- Claude Code が **「次のプロンプトに進んでください」** と言うまで次に行かない
- Claude Code が **「ブラウザで〜してください」** と言ったら `MANUAL.md` の該当ステップに切り替える
- 詰まったら `TROUBLESHOOT.md` の該当プロンプトを使う
- **秘密情報の取り扱い**: Discord Bot Token は Claude Code に貼らない。`nanoclaw.sh` の対話プロンプトに**ターミナルで直接入力**する
- **フォールバック素材**: P7 で書く `CLAUDE.local.md` の内容は `assets/CLAUDE.local.md.minta` にも同じ内容が置いてある

---

## P0 — 役割設定と環境調査

```
あなたは私の nanoclaw × Discord ハンズオンの伴走アシスタントです。これから、Claude Code (あなた) と私 (人間) で協力して、Discord 上で動く AI 講師Bot「minta」を私の Mac に構築します。完成すると、Discord サーバで @minta-bot にメンションするとフレンドリーな AI 講師として返答してくれます。エージェントは Docker 上の Linux コンテナで隔離して動き、Claude Code サブスクで認証します。

最初に環境を調査して、構築計画を立ててください。具体的には:

1. 私の OS / CPUアーキ / メモリ容量を調べる
2. すでに入っているツールを確認: docker, git, node, pnpm, claude（Claude Code CLI）, sqlite3
3. Docker Desktop の daemon が起動しているか（docker info）を確認
4. ディスクの空き容量を確認（最低 5GB 必要）
5. ~/Documents/nanoclaw/ が既に存在するか確認（既にクローン済みなら P2 をスキップする方針）
6. 結果を一覧表で示し、これから何をどの順で実行するかの計画を提示してください

不足しているものがあれば次のプロンプトでどう手当するか示してください:
- Docker Desktop が未インストール → P1 で対応
- nanoclaw 未クローン → P2 で対応
- Claude Code CLI 未インストール → 自動インストール案を提示

OS が Windows ネイティブの場合は、WSL2 への切り替えを強く推奨してください。

調査と計画提示が終わったら、私が「OK」または「進めて」と返すまで待ってください。
```

---

## P1 — Docker Desktop インストール伴走

> P0 で Docker が入っていなかった場合のみ。入っていれば P2 へ。

```
ステップ 1: Docker Desktop を導入し、daemon が応答する状態にする。

私は macOS を使っています。以下を sudo を使わずに実行してください。各ステップで何をしているか日本語で簡潔に説明してから実行してください。

1. 自分のチップを確認（uname -m）:
   - arm64 → Apple Silicon
   - x86_64 → Intel
2. 適切な Docker.dmg を /tmp にダウンロード:
   - Apple Silicon: https://desktop.docker.com/mac/main/arm64/Docker.dmg
   - Intel: https://desktop.docker.com/mac/main/amd64/Docker.dmg
3. hdiutil attach でマウント
4. /Volumes/Docker/Docker.app を /Applications/ にコピー
5. hdiutil detach でアンマウント
6. open /Applications/Docker.app で起動
7. ここで私に「画面に Docker Desktop のウィンドウが出てきたか、ライセンス同意ダイアログがあれば Accept してほしい」と伝えてください。私が画面を操作する必要があります（GUI 部分）
8. 私が「同意した」「起動した」と言ったら、daemon の起動を Bash の run_in_background と until ループで待機:
   - until docker info > /dev/null 2>&1; do sleep 3; done

daemon が応答したら docker version の出力を 5 行以内で要約し、次のプロンプトに進んでいいか聞いてください。

注意: daemon の起動には初回 1〜3 分かかります。「unable to start」が長く続く場合は、ライセンス同意ダイアログが裏に隠れていないか確認するよう私に促してください。詳細は TROUBLESHOOT.md の T-DOCKER 参照。
```

---

## P2 — nanoclaw のクローン

```
ステップ 2: nanoclaw リポジトリを ~/Documents/ にクローンする。

1. ~/Documents/ に移動
2. git clone https://github.com/nanocoai/nanoclaw.git を実行
3. ~/Documents/nanoclaw/ のトップレベル構造（README*.md / nanoclaw.sh / bin/ncl / groups/ / container/ / src/）が揃っているか ls で確認
4. ~/Documents/nanoclaw/README_ja.md の存在を確認（日本語ガイドが読める）
5. ~/Documents/nanoclaw/bin/ncl が実行可能か（ls -l）を確認

もし ~/Documents/nanoclaw/ が既に存在している場合は、git status で変更がないか確認し、もし汚れていたら私に状況を伝えてから停止してください（勝手に上書きしない）。

完了したら、次のプロンプトに進んでいいか聞いてください。
```

---

## P3 — `nanoclaw.sh` セットアップの伴走

```
ステップ 3: nanoclaw.sh の対話セットアップを開始する。

⚠️ 重要: nanoclaw.sh は対話的（TTY 必須）なので、あなた（Claude Code）の Bash ツールでは動かせません。私のターミナルで直接実行します。

1. まず私に向けて、これからやることを 3 行以内で伝えてください:
   - 私が VSCode のターミナルか別のターミナル.app で nanoclaw.sh を実行する
   - 途中で**最大 11 個**の選択肢が出てくる（Homebrew 既導入なら C-1 がスキップされて 10 個）ので、MANUAL.md のステップ C を見ながら答える
   - Discord Bot Token を聞かれたら、ターミナルに直接貼る（Claude Code には貼らない）

2. 私に以下のコマンドをコピーして実行するよう指示:

   cd ~/Documents/nanoclaw && bash nanoclaw.sh

3. 私が実行している間、あなたは以下のいずれかを待ちます:
   (a) 各選択肢で詰まったら私が画面の文章を貼って質問するので、MANUAL.md ステップ C を根拠に短く答える
   (b) 私が「終わった」と言うまで待つ

4. 私が「終わった」または「Setup complete!」と報告したら:
   - ~/Documents/nanoclaw/logs/setup.log の最後を読んで、各ステップが success だったか確認
   - launchctl list | grep nanoclaw でホストプロセスが起動していることを確認
   - docker ps --filter "name=nanoclaw" でコンテナを確認（メッセージが来てないなら起動していないのが正常）

5. Discord Bot Token が無事に登録された確認として、nanoclaw のログ ~/Documents/nanoclaw/logs/nanoclaw.log に "Discord Gateway connected" の行があるか tail で確認

完了したら、次のプロンプトに進んでいいか聞いてください。

⚠️ Bot Token は私が直接ターミナルに入力します。あなたから Token を読んだり、私から Token を受け取って実行したりしないでください。
```

---

## P4 — Discord Bot 作成の伴走

> nanoclaw.sh の対話で「No, walk me through creating one」を選んだ場合、nanoclaw が Developer Portal を案内するのでこの P4 は **不要**。
> nanoclaw.sh をやり直す場合や、後から別のサーバに Bot を追加したい場合に使う。

```
ステップ 4: Discord Bot を作成し、テスト用サーバに招待する。

⚠️ Bot Token は MANUAL.md B-2 の手順で私がブラウザで取得します。あなたには Token を共有しません。

1. 私に MANUAL.md のステップ B を実行してもらってください。具体的には:
   - https://discord.com/developers/applications で New Application
   - 名前を minta-bot に設定
   - Bot サイドバーで MESSAGE CONTENT INTENT と SERVER MEMBERS INTENT を ON
   - Reset Token して Token をコピー（一度しか出ない）
   - OAuth2 URL Generator で bot スコープ + 必要権限（View Channels / Send Messages / Send Messages in Threads / Read Message History / Add Reactions）を生成
   - URL を開いてテスト用サーバに招待

2. 私が「招待完了」と言ったら、Token はまだ nanoclaw に登録されていない状態。Token 登録は nanoclaw.sh の "Got your bot token?" プロンプトでターミナルに直接入力するか、もしくは既に setup 済みの場合は OneCLI 経由で別途登録する。私に状況を聞いて、どちらか案内してください。

3. Bot が招待されたサーバの Discord Server ID（数字の長い ID、サーバ名右クリック → ID をコピー）を私に教えてもらう必要があります。後の P5 で wiring を作る時に使います。これを忘れないように私に控えるよう促してください。

完了したら、次のプロンプトに進んでいいか聞いてください。
```

---

## P5 — 公開チャンネルで動かす設定（ワイヤリング）

```
ステップ 5: nanoclaw に Discord サーバとエージェントを正しく結びつける。

セットアップ直後の nanoclaw は、Bot との DM では応答するが、**公開チャンネルでは反応しない**ことが多いです。原因は以下のうちどれか:
- Owner ロールがDBに未登録（DMでは Owner として認識されるが、公開チャネルでは別判定）
- messaging_groups と agent_groups の wiring が未作成
- agent_destinations にチャネルが未登録（エージェントが返信先を知らない）

これらを `./bin/ncl` で一括解決します。

1. まず ~/Documents/nanoclaw に移動

2. 現状を把握:
   ./bin/ncl users list
   ./bin/ncl messaging-groups list
   ./bin/ncl wirings list
   ./bin/ncl destinations list
   ./bin/ncl roles list

3. 私の Discord ユーザー ID を users list から特定。形式は **`discord:` + 18 桁前後の数字**（例: `discord:995221661227946044`）。確認のため私に「あなたの Discord ユーザー名」を聞き、users テーブルの name 列と照合する。**以後のコマンドでは `--user` に `discord:` 接頭辞を含めた完全な ID を渡す**こと（接頭辞を省略すると登録に失敗する）。

4. 公開チャンネル用の messaging_group ID（`mg-...` 形式）を messaging-groups list から特定。`channel_type=discord` かつ `is_group=1` のものが対象（DM は `is_group=0`）。

5. nanoclaw が作った唯一の agent_group ID（minta-bot 用、`ag-...` 形式）を確認。`./bin/ncl groups list` で取得。

6. **「list → 存在しなければ create」の順で**、以下を実行。既に存在するエントリは create でエラー（UNIQUE 制約違反）になるので、必ず先に list で確認してから create:

   # 6-A. Owner ロール（global）— roles list で確認 → 無ければ grant
   ./bin/ncl roles grant --user discord:<USER_ID> --role owner

   # 6-B. 公開チャンネル wiring — wirings list で確認 → 無ければ create
   ./bin/ncl wirings create \
     --messaging-group-id <MG_ID> \
     --agent-group-id <AG_ID> \
     --engage-mode mention

   # 6-C. destination 追加 — destinations list で確認 → 無ければ add
   #   注: ドキュメント上は wiring 作成時に自動作成されることになっているが、
   #       実装の状況によっては未作成のまま残るケースがある。明示的に add する。
   #   <local-alias> は半角英数とハイフンで自由に命名（例: my-class-server）
   ./bin/ncl destinations add \
     --agent-group-id <AG_ID> \
     --local-name <local-alias> \
     --target-type channel \
     --target-id <MG_ID>

   # 6-D. 誰でも話せるように unknown_sender_policy=public に（messaging-groups list で現在値確認）
   ./bin/ncl messaging-groups update \
     --id <MG_ID> \
     --unknown-sender-policy public

7. 終わったら ./bin/ncl roles list / wirings list / destinations list / messaging-groups list で 4 つすべて反映されていることを確認

8. 私に「Discord の公開チャンネルで @minta-bot こんにちは と打ってください」と促し、応答が来るか確認してもらう

9. 応答が来た場合、ログから何が起きたかを 3 行で要約。応答が来ない場合は ~/Documents/nanoclaw/logs/nanoclaw.log と nanoclaw.error.log を tail し、何が起きているか確認して TROUBLESHOOT.md の該当セクションに誘導

10. ⚠️ 重要な注意：nanoclaw のデフォルト挙動として、**新しい Discord グループチャネルが承認登録された時の wiring は `mention-sticky` モード**になる（「一度メンションされたら以後そのチャネルで全メッセージに反応」）。これは多人数チャンネルでは事故のもと。**今後また別のチャネルで承認カードを Allow する場合に備えて、デフォルトを mention に変えるパッチも当てておくことを推奨**。詳しくは customize.html「📡 公開チャンネルで Bot が勝手に連続返信するのを防ぐ」レシピ、または TROUBLESHOOT.md の T-AUTO-WIRING-SPAM を参照。

完了したら、次のプロンプトに進んでいいか聞いてください。

⚠️ unknown_sender_policy=public にすると誰でもメンションで Claude を呼べる = API 料金は所有者持ちです。この点を私に注意喚起してください。
```

---

## P6 — メンション時のスレッド自動作成を無効化

```
ステップ 6: Discord adapter にパッチを当て、メンション時のスレッド自動作成を無効化する。

デフォルトの @chat-adapter/discord は、サーバの公開チャンネルでメンションされると自動的にスレッドを作成し、その中で返信します。これは長い会話の整理には便利ですが、教材や講座では「メンション → そのチャンネルに直接返信」のほうがシンプル。

nanoclaw 流に pnpm patch でパッチを当てます。

1. ~/Documents/nanoclaw に移動

2. パッチ対象の確認:
   - node_modules/@chat-adapter/discord/dist/index.js の line ≈801 付近に "if (!discordThreadId && isMentioned)" ブロックがあり、その中で createDiscordThread() を呼んでいる
   - これを削除（コメントに置き換え）すれば、エージェントは元のチャネル直下で返信するようになる

3. pnpm patch を起動:
   pnpm patch @chat-adapter/discord@4.26.0

   → 出力された一時ディレクトリのパスをメモ（例: /Users/.../node_modules/.pnpm_patches/@chat-adapter/discord@4.26.0）

4. その一時ディレクトリの dist/index.js を開き、以下のブロックを削除:

   if (!discordThreadId && isMentioned) {
     try {
       const newThread = await this.createDiscordThread(channelId, data.id);
       discordThreadId = newThread.id;
       this.logger.debug("Created Discord thread for forwarded mention", { ... });
     } catch (error) {
       this.logger.error("Failed to create Discord thread for mention", { ... });
     }
   }

   → 削除した位置に // NANOCLAW-PATCH: do not auto-create a Discord thread on mention. Reply directly in the parent channel instead. というコメントを残す

5. パッチをコミット:
   pnpm patch-commit '<一時ディレクトリのパス>'

   → patches/@chat-adapter__discord@4.26.0.patch が生成され、pnpm-workspace.yaml の patchedDependencies に登録される

6. nanoclaw ホストを再起動して、パッチ済みの adapter をロードさせる:
   # Step 1: install-slug を取得して表示（私にも見せる）
   SLUG=$(launchctl list | awk '/com.nanoclaw-v2-/ {gsub(/com.nanoclaw-v2-/,"",$3); print $3}')
   echo "Detected nanoclaw install-slug: $SLUG"
   # Step 2: その slug でホスト再起動
   launchctl kickstart -k "gui/$(id -u)/com.nanoclaw-v2-$SLUG"

7. 再起動完了を待つ:
   until launchctl list | grep -q "com.nanoclaw-v2-"; do sleep 1; done
   tail -20 ~/Documents/nanoclaw/logs/nanoclaw.log

   "NanoClaw running" と "Discord Gateway connected" の両方が出ていれば OK。

8. 私に「Discord で @minta-bot もう一度 hi と打ってください」と指示し、スレッドを作らずに親チャンネルで直接返答されるか確認してもらう

完了したら、次のプロンプトに進んでいいか聞いてください。
```

---

## P7 — 人格定義（minta 化 or あなたの好きなキャラに）

> ⭐ **ここが Bot の人格を決めるメインのタイミング**。教材ではサンプル人格「minta」（元気で明るいバイブコーダー）を `assets/CLAUDE.local.md.minta` に用意していますが、自分の好きなキャラ（落ち着いた家庭教師、英会話の練習相手、特定テーマの専門家、ねこ、執事…なんでも）を書いてもOK。詳しい派生例は [customize.html](customize.html) に。

```
ステップ 7: エージェントの人格を、私の選んだキャラに書き換える。

nanoclaw の人格は groups/<group-folder>/CLAUDE.local.md に書かれた内容として注入されます。これがコンテナ内の Claude Agent SDK のシステム指示として使われ、「自分が誰か」のアイデンティティ層になります。

最初に私（人間）に確認してください:
- 教材例の「minta」（元気で明るいバイブコーダー、千葉工大web3/AI概論サポートBot、「ありがとう」→「あざーーす！」と返す）をそのまま使うか？
- それとも別のキャラにするか？ どんなキャラがいいか自然言語で説明してもらう
- 別キャラなら、私の説明から CLAUDE.local.md を新規作成する（assets/CLAUDE.local.md.minta の構造を参考に「人格・キャラ設定」「口調・話し方」「振る舞い」「ユーザー」のセクションで整理）

1. グループフォルダの場所を確認:
   ls ~/Documents/nanoclaw/groups/

   出てくるフォルダのうち、`_ping-test` と `main` は nanoclaw が標準で持っているもの。**それ以外の `dm-with-<your-name>` 形式のフォルダ**が、nanoclaw.sh の対話で「What should your assistant call you?」に答えた名前（例: "spark" なら `dm-with-spark`）に基づいて作られた、minta-bot のエージェントグループ。これが `<group-folder>` の正体。

   以下、`<group-folder>` をそのフォルダ名で置き換えて作業します。

2. 現在の CLAUDE.local.md を読んで内容をバックアップ:
   cat ~/Documents/nanoclaw/groups/<group-folder>/CLAUDE.local.md
   cp ~/Documents/nanoclaw/groups/<group-folder>/CLAUDE.local.md /tmp/CLAUDE.local.md.backup

3. assets/CLAUDE.local.md.minta（このハンズオン教材内）の内容で上書き:
   - もしハンズオン教材を ~/Documents/web3ai-gairon/agents-docs/hands-on-nanoclaw-discord/ に置いている場合:
     cp ~/Documents/web3ai-gairon/agents-docs/hands-on-nanoclaw-discord/assets/CLAUDE.local.md.minta ~/Documents/nanoclaw/groups/<group-folder>/CLAUDE.local.md
   - そうでない場合は、私に「assets/CLAUDE.local.md.minta の内容をペーストするか、minta 人格の希望を聞いて代替案を作ってよいか」確認してください

4. 書き込んだ CLAUDE.local.md を cat で表示し、私に内容確認してもらう。気に入らない部分があれば（一人称・口調・キャッチフレーズ等）私の希望に合わせて修正

5. 既存のコンテナにキャッシュされている可能性があるので、ホスト再起動（P6 と同じ 2 ステップ）:
   SLUG=$(launchctl list | awk '/com.nanoclaw-v2-/ {gsub(/com.nanoclaw-v2-/,"",$3); print $3}')
   echo "Detected nanoclaw install-slug: $SLUG"
   launchctl kickstart -k "gui/$(id -u)/com.nanoclaw-v2-$SLUG"

6. ホスト起動を待ってから、私に「Discord で @minta-bot ありがとう と打って、『あざーーす！』系の煽り返しが来るか試してください」と指示

7. 返答が想定通りなら完了。違う場合は CLAUDE.local.md の該当箇所を強化（例: 「必ず『あざーーす！』と返す」を明示する）してもう一度試す

完了したら、PV（動作確認）に進んでいいか聞いてください。
```

---

## PV — 動作確認

```
最終確認: minta が想定通り動いているかチェックリスト形式で確認する。

以下の項目を一つずつ私に試してもらい、結果を記録してください:

【DM】
1. Bot との DM で「こんにちは」 → 元気な minta が応答するか
2. DM で「ありがとう」 → 「あざーーす！」系の煽り返しが来るか

【公開チャンネル】
3. 公開チャンネルで「@minta-bot こんにちは」 → スレッドを作らず親チャンネルで応答するか
4. 公開チャンネルで「@minta-bot ありがとう」 → 「あざーーす！」が来るか
5. 公開チャンネルで「@minta-bot web3 って何？」 → AI/web3 専門としてフレンドリーに答えるか
6. 公開チャンネルで「@minta-bot 量子力学について教えて」 → 専門外として正直に「ぐぐって！」系に返すか

【他ユーザー】
7. 別の Discord アカウント（or 学生など別の人）から @minta-bot にメンション → DM に承認カードが飛ばず、直接応答するか

各項目が想定通りなら ✅、違うなら原因を nanoclaw.log と nanoclaw.error.log から特定して TROUBLESHOOT.md の該当セクションに誘導してください。

全項目 ✅ なら、ハンズオン完了です。お疲れさまでした！🎉

最後に、これまでに作成・変更したファイルを 1 行ずつ列挙して、いつでも振り返れるようにしてください:
- ~/Documents/nanoclaw/groups/<group-folder>/CLAUDE.local.md（人格定義）
- ~/Documents/nanoclaw/patches/@chat-adapter__discord@4.26.0.patch（スレッド作成無効化）
- nanoclaw データベース（v2.db）の roles / wirings / destinations / messaging_groups の追加分
```

---

## 完成後のカスタマイズ案

ハンズオン本編はここまでですが、minta をより自分仕様にしたい場合の方向性:

- **人格をもっと自分好みに**: `groups/<group-folder>/CLAUDE.local.md` を編集してホスト再起動
- **記憶を持たせる**: minta が会話中に得た情報を `groups/<group-folder>/memory/<topic>.md` に書き溜める指示を CLAUDE.local.md に追加
- **新しいチャネルを追加**: Slack, Telegram などを `/add-<channel>` スキル経由で追加（nanoclaw の README_ja.md 参照）
- **複数の人格を持つエージェント**: `agent_groups` を複数作り、それぞれ別の人格で別チャネルにワイヤリング
- **MCP ツールを足す**: Gmail, Calendar など外部ツール連携を `groups/<group-folder>/container.json` で設定

これらも基本的に Claude Code に「〜したい」と頼めば該当ファイルを書き換えてくれます。
