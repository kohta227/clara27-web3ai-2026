# 教えて、minta先生 — DB連携・API連携ハンズオン教材

**Next.js + OpenAI API + Supabase + Vercel** を組み合わせた、最小サンプルアプリのハンズオン教材です。

千葉工業大学「web3・AI概論 2026」の授業向けに、「**DB連携・API連携あり / なし**」のスライド（第N回）で実物を見せるためのリファレンス。

> ライセンス: CC BY-NC-SA 4.0 / 他の授業や個人学習に再利用可能

---

## 完成イメージ

ブラウザでアプリにアクセス → minta先生に質問を投げる:

- 入力した質問 → **OpenAI API** に渡って minta先生（人格を持ったAI）が回答
- 同時に → **PII（個人情報）を除去した分析メタ**だけが **Supabase** に蓄積
- ページ下部に「**みんなの質問傾向**」として履歴一覧が表示される

→ **「AIの頭脳」と「DBの蓄積」を組み合わせたプロダクト**を、最短経路で動かす体験ができます。

---

## このハンズオンで体験すること

1. **OpenAI API キーを環境変数に入れる** → ローカルで動く
2. **GitHub に push** する
3. **Vercel にデプロイ**する（GitHub と連携 → 自動デプロイ）
4. **Vercel 上で OpenAI API キーを環境変数として設定**する
5. **Vercel Marketplace から Supabase を「Connect」する** → 環境変数が自動で入る
6. 質問 → 回答 → DBに分析メタが蓄積される様子を確認

→ 「**ローカルだけで動く** → **クラウドで動く** → **DBが繋がる**」の3段階を授業内で見せられます。

---

## 所要時間

| パート | 時間 |
|---|---|
| OpenAI / Supabase / GitHub / Vercel アカウント準備（既にあればスキップ） | 5〜15 分 |
| ローカル動作確認（`.env.local` 埋めて `npm run dev`） | 5〜10 分 |
| GitHub push + Vercel デプロイ + 環境変数設定 | 10〜15 分 |
| Supabase 連携設定 + 動作確認 | 5〜10 分 |
| **合計** | **30〜60 分** |

---

## 動作確認済み環境

- **macOS 26.4 (Apple Silicon)** — 主な検証環境
- Node.js **v22.x**（Next.js 16 が要求する v20.9+）
- npm v10.x
- Next.js **16.2.6**
- OpenAI Node SDK **v6.x**
- `@supabase/supabase-js` **v2.x**

Windows は WSL2 (Ubuntu) 推奨。Linux も同手順で動作するはず。

---

## 進め方

### 推奨ルート（HTML をクリックしながら）

1. **`index.html` をダブルクリックで開く** — 全体ハブ画面が出ます
2. **Step 1 — ローカルで動かす** → OpenAI API キーを入れて自分のPCで動作確認
3. **Step 2 — DBを繋ぐ** → Supabase プロジェクトを作って分析メタの蓄積を確認
4. **Step 3 — Vercel にデプロイ** → GitHubに push → Vercelで公開
5. 完成後 **カスタマイズ** → minta先生の人格を別キャラに変える / 別の用途に転用

### 文書だけで進めたい場合

`MANUAL.md`（外部サービスの手動操作詳細） → `PROMPTS.md`（Claude Code に投げるプロンプト集）の順で読み進めれば、HTML を介さなくても完結します。

---

## 🛡 シークレット衛生 — このハンズオンの方針

OpenAI API キー、Supabase service_role key は **Claude や ChatGPT のチャットに貼り付けない** 方針で進めます。

- 受講者自身が `.env.local` ファイルに直接書き込む
- Vercel のダッシュボード上で環境変数を入力する
- AI チャットには値を一切渡さず、動作確認だけを依頼する

理由：本番運用で API キーを扱うとき、AI チャットにシークレットを貼る習慣があると、会話ログ・スクショ・転送先に残って事故ります。今回は安価な OpenAI と Free プランの Supabase ですが、**「AI に渡さない」を体に染み込ませる練習**として最初から徹底します。

---

## アプリの中身（リファレンス実装）

`reference-app/` ディレクトリに Next.js プロジェクトとして配置:

```
reference-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← UI（質問フォーム + 履歴）
│   │   ├── layout.tsx            ← メタ情報
│   │   ├── globals.css
│   │   └── api/
│   │       ├── ask/route.ts      ← POST: 質問→OpenAI→PII除去→Supabase保存
│   │       └── history/route.ts  ← GET: 履歴取得
│   └── lib/
│       ├── minta.ts              ← minta先生の system prompt
│       ├── openai.ts             ← OpenAIクライアント
│       ├── pii.ts                ← PII除去ロジック（regex + LLM）
│       └── supabase.ts           ← Supabaseクライアント
├── .env.local.example            ← 環境変数テンプレ
├── package.json
└── ...
```

---

## アーキテクチャ図

```
[ ブラウザ ]
     ↕  HTTP
[ Next.js (Vercel) ]
     │
     ├──→ [ OpenAI API ]            ① minta先生として回答生成
     │                              ② 質問・回答からPII除去&分析
     │
     └──→ [ Supabase (PostgreSQL) ] ③ 分析メタを保存 / 履歴を取得
                                      （元の質問文・回答文は保存しない）
```

PII（Personally Identifiable Information・個人情報）除去は2段階:
1. **regex 一次フィルタ** — メール / 電話 / URL を機械的に消す
2. **LLM 二次分析** — 名前・地名・組織名などを文脈で判断して除去 → カテゴリ・要約をJSONで返す

→ 「**生の質問文・回答文はDBに保存されない**」という設計が、授業で説明できるポイント。

---

## ファイル構成

### 受講者がじかに開く（HTML — メイン）

| ファイル | 役割 |
|---|---|
| **`index.html`** | **入口**。ダブルクリックで開く。全体ハブ画面 |
| `step1.html` | ローカル動作確認（OpenAI API キーを入れて動かす） |
| `step2.html` | DB連携（Supabase プロジェクト作成と SQL 実行） |
| `step3.html` | Vercel デプロイ（GitHub経由 + Supabase連携） |
| `customize.html` | 完成後のカスタマイズ案 |

### 文書版（Claude Code が読む & HTML から参照）

| ファイル | 役割 |
|---|---|
| `README.md` | このファイル（全体マップ） |
| `PROMPTS.md` | Claude Code に投げる詳細プロンプト集 |
| `MANUAL.md` | OpenAI / Supabase / Vercel ダッシュボード等の手動操作詳細 |
| `TROUBLESHOOT.md` | エラー時の診断プロンプト集 |

### 配布者向け

| ファイル | 役割 |
|---|---|
| `INSTRUCTOR.md` | 他の授業・組織で転用する人向けガイド |
| `DISTRIBUTION.md` | GitHub / ZIP / Notion 等で配布する手順 |

### サポートファイル

| ファイル | 役割 |
|---|---|
| `LICENSE` | CC BY-NC-SA 4.0 ライセンス本文 |
| `style.css` / `app.js` | HTML 用スタイル・スクリプト（依存ゼロ） |
| `assets/supabase-schema.sql` | Supabase に流す DDL |
| `assets/env.template` | `.env.local` のテンプレ |
| `reference-app/` | 完成形 Next.js プロジェクト |

---

## 中断・再開

途中で中断したり、別の日にやり直したりするのもOK。各 Step は冪等（idempotent）に書かれています — 既にできている部分は飛ばして次に進めます。

完全リセットしたい場合は `TROUBLESHOOT.md` の **P-PRESET-1** プロンプトを使ってください。

---

## ライセンス・再配布

本教材は **CC BY-NC-SA 4.0** ライセンスで提供されます（非営利・継承条件付き）。詳細は `LICENSE` を参照。

サードパーティの利用規約は各々のものに従う:

- Next.js: MIT
- OpenAI API: OpenAI の利用規約 + 課金（従量制）
- Supabase: MIT (SDK) / 利用規約（サービス）
- Vercel: 利用規約（Hobby プラン無料）

---

## 配布方法・転用

- 受講者に配る場合: `DISTRIBUTION.md`
- 他の授業・組織で転用する場合: `INSTRUCTOR.md`

---

## サポート

- 授業中に詰まったら、隣の人・受講グループ・講師に相談
- バグや改善提案は配布元の Issue / メール / Notion 等で
