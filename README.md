# ROCKSIDE II — 海音ちゃんの冒険２

前作 ROCKSIDE v0.12.0 を土台にした、独立した続編開発用リポジトリ。前作の kanata-games/rockside は変更しない。コピー元のコミットは BASE_ORIGIN.json に記録。

## 現在の版

2.0.0-test.1。前作の操作・ステージ・敵・ボス・スマホのボタン配置を継承し、新しい海音ちゃんのモデルを「前作／40px／48px」で比較できる。

ステージと物語は前作由来の確認用。続編固有のステージ・物語はまだ未実装。新素材は8ポーズで、走り射撃と被弾は仮表示。新モデルの表示サイズだけを変え、身体の当たり判定と移動設定は前作のまま比較する。

## ファイル

- index.html: 現在の土台版。完成した続編の本番公開はまだ行っていない。
- preview.html: 改修の動作確認用。今は土台版と同じ初期内容。
- src/: 開発用コード。編集はここで行う。
- src/02c_sequel.js: 新モデルの読み込み・表示・サイズ比較。
- assets/: 前作から引き継いだ素材とメタデータ。
- umine-sheet.jpeg: 新モデルの仮素材。白背景を読み込み時に処理する。完成透過シートへ交換予定。
- first-test/: 最初に作った独立した訓練場を保存。

## 開発とビルド

まず src/ を変更して、`python3 tools/build.py --out preview.html` でテスト版を作る。確認後に `python3 tools/build.py` で index.html へ反映する。生成HTMLを直接編集しない。

進行データは rockside2_progress_v1、音設定は rockside2_muted、モデル設定は rockside2_model_size を使う。前作の保存キーを使わない。

現在遊べる確認用サイト: https://umine-adventure-2-test.norogon323.chatgpt.site

このリポジトリのGitHub Pagesはまだ未設定。コードを更新しても、上の確認用サイトへ自動反映する連携はまだない。
