# Gaorin Seeker

がおりんに関わる場所を写真から当てるゲームです。

## 開発ガイド

### 必要なもの

- Node.js 24.18.1（`mise.toml` で固定しています。mise を使う場合は `mise install` で揃います）
- npm

### セットアップと起動

```bash
npm install
npm run dev
```

開発サーバーが表示するURLをブラウザで開くと、ゲームが起動します。

### スクリプト一覧

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用にビルド（出力先は `dist/`） |
| `npm run preview` | ビルド結果をローカルで確認 |
| `npm run lint` | ESLint でチェック |
| `npm run format` | Prettier で整形 |
| `npm run stages:update` | ステージデータの補完（下記参照） |

### ステージ（問題データ）の追加方法

ステージは `src/data/stages.json` で管理しています。1ステージが1オブジェクトで、形式は次のとおりです。

```json
{
  "title": "場所の名前",
  "xPostUrl": "https://x.com/gao_rin_V/status/...",
  "hintImages": [
    "https://pbs.twimg.com/media/...?format=jpg&name=large"
  ],
  "latlon": "34.153154, 135.175693"
}
```

- `title` : 場所の名前
- `xPostUrl` : 元になった、がおりんのX投稿のURL
- `hintImages` : ヒント写真のURLの配列（複数可）。写真はリポジトリ内には置かず、外部URLを参照します
- `latlon` : 正解座標。「緯度, 経度」の文字列で書きます

項目を追加したら、次のコマンドを実行してください。

```bash
npm run stages:update
```

このスクリプトが、各ステージの `id`（8桁）の採番と、`latlon` から `latitude` / `longitude` への変換を自動で補完します。

### 技術スタック

- Vite + Vue 3 (Composition API) + JavaScript
- Tailwind CSS (v4)
- Leaflet（地図表示、OpenStreetMapベース）

## ⚠️ ライセンスに関する重要な注意 (License Notice)

本プロジェクトの**ソースコード**は [Unlicense] に基づき、完全に自由（署名不要）にコピペや改変が可能です。

しかし、**アプリのロゴおよびキャラクター画像（`public/assets/` 内）の著作権は放棄していません。**

このコードをベースに自身のアプリを公開する場合は、**必ずあなた自身のロゴやキャラクターに差し替えて**ご使用ください。
