# ROOMLY Free MVP

課金なしで公開できる、静的HTML/CSS/JavaScript版です。

## 中身
- Pinterest連携デモ
- 部屋サイズ・形の入力
- ROOM MATCH
- Pin詳細
- スマホ向け2D家具ドラッグ
- Sense Coach（デモ判定）
- DB / 課金 / AI APIなし

## 無料公開（Cloudflare Pages）
1. GitHubに新しい公開リポジトリを作る
2. このフォルダの `index.html`, `styles.css`, `app.js`, `assets/` をアップロード
3. Cloudflare PagesでGitHubリポジトリを接続
4. Framework preset は `None`
5. Build command は空欄
6. Build output directory は `/` またはリポジトリルート
7. Deploy

Cloudflare Pagesを使わず、GitHub Pagesでも静的公開できます。

## 注意
`assets/` の画像は今回ユーザーが共有したPinterest由来の参考画像を試作表示に使っています。
一般公開・商用化する際は、Pinterest API・埋め込み・権利処理など正式な利用方法へ切り替えてください。
