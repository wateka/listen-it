# Listen it, ____!

このアプリは、友達の聴いてほしい曲を、自分の Spotify プレイリストに直接送ってもらうためのアプリです。

Spotify ユーザではない友達も、このアプリ上で曲を検索してあなたに送るだけで、簡単にあなたの Spotify プレイリストに曲を追加できます。

「おすすめされた曲を、つい聴き忘れてしまう」という方におすすめのアプリです。

## 技術スタック

- TypeScript
- React & Next.js (フロントエンド)
- Auth.js (Google & Spotify 認証)
- Spotify API
- Tailwind CSS & Daisy UI
- Hono & Hono RPC (バックエンド)
- Drizzle ORM
- Turso (SQLite データベース)
- Vercel (ホスティング)

## 機能紹介

https://listen-it.wateka.dev から、利用することができます。

1. Spotify でログインして、送り先のURLを友達に共有する
   ![マイページのスクリーンショット。送り先のURLが表示されている。](./docs/images/1-url.png)
2. 友達に、URL を開いてもらって、そこから曲を送ってもらう
   ![友達に送ったURLの遷移先のスクリーンショット。検索欄と、楽曲の検索結果リストが表示されており、各検索結果アイテムの右隣には「送る」ボタンが用意されている。](./docs/images/2-1-select.png)
   ![上の画面で「送る」ボタンをクリックしたあとの画面の遷移先。選んだ曲を送って良いか、確認画面が表示されている。](./docs/images/2-2-send.png)
3. あなたの Spotify プレイリストに、自動で曲が入ります！
