# ぐっどレンタカー 業務管理アプリ（Netlify版）

Good Innovation株式会社 レンタカー業務管理プロトタイプ v1.1（監査是正版）

## 構成

- `src/App.jsx` — アプリ本体（React）
- `netlify/functions/anthropic.js` — AI読取用のAPIプロキシ（APIキーはここで付与。ブラウザには出ません）
- `netlify.toml` — Netlifyビルド設定
- データ保存 — ブラウザのlocalStorage（設定タブからエクスポート/インポート可能）

## デプロイ手順（初回）

### 1. Anthropic APIキーを取得
1. https://console.anthropic.com にサインアップ／ログイン
2. 「API Keys」でキーを作成し、`sk-ant-...` をコピー
3. クレジット（従量課金）を登録。読取1回あたり数円程度です

### 2. Netlifyへデプロイ（GitHub連携がおすすめ）
1. このフォルダ一式をGitHubリポジトリにアップロード
2. Netlify → Add new site → Import an existing project → リポジトリを選択
3. ビルド設定は自動認識されます（Build command: `npm run build` / Publish: `dist`）

※ CLIを使う場合: `npm install` → `npx netlify deploy --prod`（`--build` 付き）

### 3. 環境変数を設定（重要）
1. Netlify → Site configuration → Environment variables
2. Key: `ANTHROPIC_API_KEY` ／ Value: 手順1のAPIキー
3. Deploys → Trigger deploy → Deploy site で再デプロイ

### 4. 動作確認
サイトを開き、設定タブ →「API接続テストを実行」で「接続成功」と出ればAI読取が使えます。

## よくあるエラー

| 症状 | 原因と対処 |
|---|---|
| 接続テストで「APIキー未設定」 | 環境変数 `ANTHROPIC_API_KEY` を登録し再デプロイ |
| HTTP 401/403 | キーの値が誤っている／失効。コピーし直して再設定 |
| HTTP 404 | `dist` フォルダだけをドラッグ&ドロップしている。Functions が含まれないため、GitHub連携かCLIでプロジェクト一式をデプロイ |
| 保存されない | プライベートブラウズを解除。データは端末ごとのため、設定タブから定期的にエクスポート |

## 重要な注意（システム監査レポートより）

- 本アプリは**要件確認用プロトタイプ**です。監査判定（D：要是正）のとおり、認証・権限・データベース保存・監査ログが未実装のため、**実顧客情報を入力しての本番運用はしないでください**。
- URLを知っている人は誰でもアクセスできます。試験利用でも、NetlifyのパスワードプロテクションやBasic認証の導入を推奨します。
- 免許証等の画像は読取時にAnthropic APIへ送信されます。本人への説明・同意のうえご利用ください（アプリ内に同意チェックがあります）。
