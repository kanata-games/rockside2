# ドット絵スプライト（素材づくり担当）

全ファイル共通：透過PNG、横一列、右向き、アンチエイリアスなし（アルファは0か255のみ）。各フレームの下端が足元（地面）です。

| ファイル | 1フレーム | フレーム数 | フレーム順（0始まり） |
|---|---|---|---|
| kanon.png | 32×32 | 14 | 0-1 待機 / 2-5 走り / 6 ジャンプ / 7 落下 / 8 ショット / 9-12 走りながらショット / 13 被弾 |
| tobiume_dark.png | 48×48 | 8 | 0-1 待機 / 2-3 飛行 / 4-5 攻撃（5が発射の瞬間）/ 6 被弾 / 7 撃破 |
| neenia.png | 32×32 | 2 | 0 弓を構えて待機 / 1 矢を放つ（矢はゲーム側で発射） |
| seiten.png | 32×32 | 2 | 0-1 歌う |
| astarte.png | 32×32 | 2 | 0-1 鎌を持って立つ |
| lily.png | 32×32 | 2 | 0 マイクを持って待機 / 1 ウインク＋キラッ（待機ループ用） |
| shiranui.png | 32×32 | 6 | 0-1 待機 / 2 喜ぶ / 3 ありがとう / 4 手を振る（扇子）/ 5 狐火 |
| shiranui_dark.png | 48×48 | 8 | 0-1 待機 / 2 滑空 / 3 幻影 / 4-5 攻撃（5 が炎を放つ瞬間）/ 6 被弾 / 7 撃破 |
| diceroll.png | 32×32 | 6 | 0-1 待機 / 2 一服（煙草）/ 3 だるそうに手を振る（ありがとう）/ 4 サイコロを放る / 5 カード |
| diceroll_dark.png | 48×48 | 9 | 0-1 待機 / 2-3 歩き / 4 振りかぶり / 5 サイコロを投げる / 6 カードを弾く / 7 被弾 / 8 撃破（頭が砕ける）|
| kanata_boss.png | 64×64 | 9 | 0-1 待機（1 は目を閉じる）/ 2 移動 / 3 物を浮かせる（手を上げる）/ 4 吸い込み / 5 吐き出し / 6 被弾（ひざをつく）/ 7 撃破（倒れる）/ 8 浮遊（おまけ）|
| mimic_rampage.png | 64×64 | 7 | 0 待機 / 1 飛びかかり / 2 大口で吸い込み（渦を含む）/ 3 がれきを吐く / 4 被弾（火花）/ 5 破壊 / 6 待機2（呼吸）|
| kanata.png | 32×32 | 5 | 0 待機 / 1 まばたき / 2 だるそうに手を振る / 3 喜ぶ（ジャンプ）/ 4 マイクで歌う |
| kanata_ghost.png | 32×32 | 3 | 0-1 浮遊 / 2 青い玉を投げる（玉はゲーム側）|
| umine_dark.png | 32×32 | 14 | 闇海音（仮）: kanon.png と同じフレーム配置を影色に変換（青→紫がかった黒、白→灰ラベンダー、肌→灰）。本番の絵に差し替え予定 |
| umine_spell.png | 48×48 | 6 | 海音の覚醒（クライマックス）: 0 構え / 1-4 水が集まる / 5 杖を掲げる＋魔法陣 |
| sea_split.png | 48×96 | 5 | 海割りの水の壁: 0 せり上がる / 1 巻く / 2-3 最大（交互）/ 4 縦タイル用の胴体 |

kanon.json と tobiume_dark.json に同じ内容を機械可読な形で入れてあります。
海音のショット系フレームには弾を描いていないので、弾はゲーム側で出してください（杖の先は枠の右端付近）。闇落ち飛梅の攻撃フレーム（4, 5）には手元の魔法の光だけ描き込んであります。飛ぶ弾はゲーム側で出してください。

## tobiume.png (通常の飛梅、闇落ち前) 32×32 × 15フレーム
- 0-1 待機 / 2-3 飛行 / 4-5 魔法（5が発射の瞬間、弾は描いていない）/ 6 被弾 / 7-10 通常攻撃のキック（7 構え、8 飛び上がり、9 前蹴り、10 ヒット）/ 11-14 必殺技スーパーウルトラ飛梅ちゃんキック（11 空中でため、12-13 斜め右下への急降下キック・ループ、14 着地の衝撃波）
- フレーム情報は tobiume.json

## ダーク版ボス（48×48 × 8フレーム、tobiume_dark.png と同じ形式）
- neenia_dark.png: 0-1 待機 / 2-3 歩き / 4-5 攻撃（4 弓を引く、5 放つ瞬間。矢はゲーム側）/ 6 被弾 / 7 撃破
- seiten_dark.png: 0-1 待機 / 2-3 跳びかかり（leap：2 空中で跳びかかる姿勢、3 しゃがみ＝踏み切りの溜めと着地の両方に使う）/ 4-5 攻撃（4 息を吸う、5 呪いの歌を放つ瞬間）/ 6 被弾 / 7 撃破
- astarte_dark.png: 0-1 待機 / 2-3 浮遊移動（glide）/ 4-5 攻撃（4 振りかぶり、5 斬撃の瞬間。斬撃の軌跡はスプライトに含む）/ 6 被弾 / 7 撃破
- lily_dark.png: 0-1 待機 / 2-3 くるりと回るダンスステップ（dance）/ 4-5 攻撃（4 マイクを口元に構えて息を吸う、5 歌声を放つ瞬間。赤い音波と小さな星はスプライトに含む）/ 6 被弾（待機を加工：のけぞり＋赤白フラッシュ＋目閉じ）/ 7 撃破（横たわる）
- フレーム情報は各 .json。体の中心 x（全フレーム共通、cxF 不要）: neenia_dark 20 / astarte_dark 22 / lily_dark 21（各 .json の "cx"）

## 顔アイコン（24×24、ステージセレクト用）
kanon_face.png, tobiume_face.png, tobiume_dark_face.png, neenia_face.png, neenia_dark_face.png, seiten_face.png, seiten_dark_face.png, astarte_face.png, astarte_dark_face.png, lily_face.png, lily_dark_face.png, disaster_dark_face.png, star_face.png, shiranui_face.png, shiranui_dark_face.png, diceroll_face.png, diceroll_dark_face.png, kanata_face.png（一覧: work/faces_preview.png。シラヌイの2つは work/shiranui_preview.png、ダイスロールの2つは work/diceroll_preview.png）

## リリィ（lily）メモ
- lily.png の情報は allies.json の "lily"（idle: 0,1）。
- lily_dark.png の攻撃5は音波をマイクの右（x≈25-45, y≈10-17）に描き込み済み。（2026-10-03 作り直し）音波は x≈33-46, y≈11-18。飛ぶ弾を出すならマイク先端 ≈(30,15) から。フレーム5も体は他フレームと同じ位置（体の中心 x=21）。
- 生成: 画像生成の生素材 work/lily_raw.png / work/lily_dark_raw.png → pixel_sheet.py（通常版は work/lily_raw_med9.png＝メディアン9で前処理した生素材から）。被弾6は work/lily_dark_raw_composite.png で待機セルを加工して作成。顔は face_icon.py。

## ウミミ（umimi）サポート仲間 32×32 × 10フレーム
- ファイル: umimi.png（横一列・右向き・透過）、umimi.json（アニメ定義・fps/loop）、顔アイコン umimi_face.png（24×24）
- 用途: ロックマンのラッシュ的な呼び出し式サポート仲間。足場になる／回復する。
- フレーム順: 0-1 待機（浮遊、1は1px上がる）/ 2-3 泳ぎ移動（後ろに小さな泡）/ 4 登場（月光の淡い金色の縁取りとキラキラ）/ 5-6 足場（白い月の円盤に乗った姿。円盤が乗れる面：フレーム内 y=24 が上面、x=1〜31。6は踏まれた時用だが差はごく小さい）/ 7-8 回復（額の三日月が光り、キラキラ・月・ハートが昇る。8が一番明るい瞬間）/ 9 退場（小さく縮んで淡く消えていく）
- 生成: 画像生成の生素材 work/umimi_raw.png → work/umimi_prep.py（左右反転・緑の光輪除去）→ work/umimi_build.py（パレット固定の縮小 umimi_convert.py ＋エフェクト）、顔は work/umimi_face.py

## 魔王ディザスター（disaster_dark）ボス 48×48 × 14フレーム
- 魔王ディザスター＝スターの闇の姿。中性的な見た目だが少年（男の子）。
- disaster_dark.png: 0-1 待機 / 2-3 滑空（glide）/ 4 変形・溜め（どの武器攻撃の前にも挟める）/ 5 剣 / 6 槍 / 7 斧 / 8 大鎌 / 9 弓 / 10 鞭（連接剣）/ 11 砲槍 / 12 被弾 / 13 撃破
- 武器名→フレーム: sword 5, spear 6, axe 7, scythe 8, bow 9, whip 10, lance 11（json の "weapons"）。先端・発射点の座標は disaster_dark.json の各 note。
- 共通スケール 0.16（体の高さ約40px）、体の中心 x=23（cx 23、cxF 不要）、足元 y≈45（浮遊ボスなので下端から約2px上）。撃破13のみ下端に接地。32色。
- alchemic_weapons.png（32×32×7: sword, spear, axe, scythe, bow, whip, lance。lance＝砲槍は 2026-10-03 に末尾フレーム6として追加、既存0〜5は無変更）: 武器だけのアイコン。柄の位置 grip は alchemic_weapons.json。drawDisasterWeapon で使う場合は drawImage(img, -size*gripNorm[0], -size*gripNorm[1], size, size)、size は 32 か 64 推奨。
- transform_fx.png（24×24×4: 火花 / 稲妻の輪 / 閃光 / 消えていく火花）: 紫の変形エフェクト。
- disaster_bullets.png（24×24×6、右向き: sword_wave, spear_bolt, ground_burst, arrow, scythe_wave, orb）: 弾はセル中央が中心。scythe_wave は原画が逆向きだったので左右反転済み。当たり判定の目安は disaster_bullets.json。
- 顔: disaster_dark_face.png（赤い目が光る・角が見える）。プレビュー: work/disaster_preview.png、整列確認: work/alignment_check.png
- 生成: work/disaster_dark_raw.jpg + work/disaster_weapons_raw.jpg → work/body_sheet.py work/disaster_dark_spec.json。武器・エフェクト・弾は work/build_icons.py（weapons_spec.json / fx_spec.json / starw_spec.json / bullets_spec.json、弓の弦は post_bow.py）。顔は work/faces_new.py

## スター（star）32×32 × 7フレーム
- 魔王ディザスターの本来の姿。中性的な見た目だが少年（男の子）。青い髪・緑の目・白いマフラー・赤い上着。
- star.png: 0-1 待機 / 2 喜ぶ（ジャンプして拳を上げる。足は下端から約3px上）/ 3 うれしい（胸に手＋黄色いきらめき）/ 4 ありがとう（おじぎ）/ 5 手を振る / 6 剣を掲げる
- 体の中心 x=16、足元は下端（joy 以外）、頭頂〜足 約29px。情報は star.json と allies.json の "star"。
- star_weapon.png（32×32×2: シアンの剣 / シアンの斬撃の弧）。顔: star_face.png。プレビュー: work/star_preview.png
- 生成: work/star_raw.jpg → work/body_sheet.py work/star_spec.json → work/star_post.py（顔の赤い点を除去、きらめきを黄色に）

## シラヌイ（shiranui）32×32 × 6フレーム
- 狐の少女。紅い長髪・白い内毛の赤い狐耳・金色の瞳・赤黒の花柄の着物（白い襦袢）・黒い帯・赤い狐の尻尾・扇子。闇落ちボス（shiranui_dark）の本来の姿。
- shiranui.png: 0-1 待機（扇子を胸の前で持つ）/ 2 喜ぶ（目を閉じて笑う）/ 3 ありがとう（おじぎ）/ 4 手を振る（開いた扇子を掲げる）/ 5 狐火（手のひらにオレンジの炎）
- 体の中心 x=16（cx 16、全フレーム共通、cxF 不要）、足元は下端 y=31（全フレーム）、耳の先〜足 約28px。金色の目は全フレーム x=16 付近（2・3 は目を閉じている）。
- 情報は shiranui.json と allies.json の "shiranui"（idle 0,1 / happy 2 / thanks 3 / wave 4 / foxfire 5）。32色。

## 闇落ちシラヌイ（shiranui_dark）ボス 48×48 × 8フレーム
- 赤く光る目・黒と紅のぼろぼろの着物・頭に割れた狐面・炎の尻尾・赤／紫の狐火（狐火はスプライトに含む）。
- shiranui_dark.png: 0-1 待機（浮遊）/ 2 滑空（glide、1フレーム）/ 3 幻影（vanish）/ 4-5 攻撃（4 扇子を振りかぶる、5 振り抜いて大きな炎を放つ瞬間。三日月形の炎 x≈35-46, y≈11-42 をスプライトに含む）/ 6 被弾 / 7 撃破（うつ伏せ）
- 体の中心 x=24（cx 24、cxF 不要）、共通スケール 0.155（耳の先〜足 約39px）。足元 y=44（浮遊ボスなので下端から約3px上）。撃破7のみ下端 y=47 に接地。29色。
- 狐火の弾の発生点（フレーム5）: 振り抜いた扇子の先 ≈(38,24)（json の "spawn"）。左向きでは x → 47-x。
- 幻影3: 原画の3体並びの残像は48pxでは読めないので、待機1をもとに「体をチェッカー模様で間引いた半透明風＋右側に紫の輪郭だけの残像2つ」にした。ゲーム側で1フレームおきに非表示にする点滅と組み合わせると消える感じが出る。
- 横方向の圧縮: 滑空2の尻尾・裾（0.47）と攻撃5の炎（0.59）は枠に収めるため体から離れた部分だけ圧縮。体の位置は変えていない。
- 被弾6は原画ののけぞりポーズのまま（白赤の点滅はゲーム側で）。

## シラヌイの弾（shiranui_bullets）24×24 × 5 ＋ 火柱 24×48 × 2
- shiranui_bullets.png（右向き）: 0 foxfire_a / 1 foxfire_b（狐火の玉の2フレームアニメ）/ 2 wisp（紫の鬼火）/ 3 crescent（三日月形の炎の斬撃波）/ 4 fan（回転する黒い扇子＝ブーメラン。回転はゲーム側で、セル中央 (12,12) を軸に）
- 描画はセル中央 (12,12) を弾の位置に合わせる。当たり判定の目安は shiranui_bullets.json の hitboxSuggestion（disaster_bullets.json と同じ形式。炎の玉は右寄りの頭 ≈(16,12) が中心）。
- 火柱は 24×24 に収まらないので別シート shiranui_bullets_pillar.png（24×48 × 2: 0 火柱 / 1 その左右反転＝揺らぎ用、10fps でループ）。下端の岩片の底 y=45 を床に合わせる。情報は shiranui_bullets.json の "pillarSheet"。
- 顔: shiranui_face.png（金色の目・白い内毛の狐耳）、shiranui_dark_face.png（赤く光る目・割れた白い狐面・暗い血の赤の髪・紫の狐火）。
- プレビュー: work/shiranui_preview.png（4倍・全フレーム＋弾＋顔）、整列確認: work/shiranui_alignment.png
- 生成: work/shiranui_raw.jpg → work/body_sheet.py work/shiranui_spec.json → work/shiranui_post.py normal（閉じた目・扇子の柄・狐火の色）。闇: work/shiranui_dark_raw.jpg → body_sheet.py work/shiranui_dark_spec.json → shiranui_post.py dark（狐面の白・光る目・狐火の芯・炎のハイライト・幻影）。弾: work/build_icons.py work/shiranui_bullets_spec.json / work/shiranui_pillar_spec.json。顔: work/shiranui_faces.py。プレビュー: work/make_shiranui_preview.py
- sprite_lib.py に追加（既存の処理は変更なし）: sample "mode"（多数決縮小。赤一色のキャラが平均でにごらないように）、eye_masks の "gold"、accent_gold / accent_white。

## ダイスロール（diceroll）32×32 × 6フレーム（8番目のボスの本来の姿・カジノステージ）
- 不機嫌で落ち着いた少女。白い長髪・赤い目・赤いリボン・小さな王冠（金と黒）・白黒ハーレクイン柄のジャケット・黒いスカート・黒いブーツ。煙草好き。
- diceroll.png: 0-1 待機 / 2 一服（煙のかたまり x 22-23, y 11-12）/ 3 だるそうに片手を振る（ありがとう）/ 4 サイコロを上に放る（サイコロ x 22-24, y 3-5）/ 5 カードを指に挟んでにやり（カード x 20-21, y 13-17）
- 全フレームで足元の中心が x=16（cx 16）、足元は下端 y=31。共通スケール 0.083（王冠〜足 約29px）。赤い目は各1px（2px間隔、真上に黒いまつ毛1px）。
- 情報は diceroll.json と allies.json の "diceroll"（idle 0,1 / smoke 2 / thanks 3 / toss 4 / card 5）。30色。

## 闇落ちダイスロール（diceroll_dark）ボス 48×48 × 9フレーム
- サイコロ頭の怪人。白いサイコロの頭（黒い目）・黒金の王冠（赤い宝石）・赤く光る一つ目・ギザギザの笑い口・白黒ハーレクイン柄の燕尾服（金の縁取り）・赤いマント・白い手袋。
- diceroll_dark.png: 0-1 待機 / 2-3 歩き（3 は合成したパッシングポーズ：上半身を1px上げ、脚は待機1の脚を移植）/ 4 振りかぶり（サイコロを持った手 ≈(10,21)）/ 5 サイコロを投げる / 6 カードを弾く / 7 被弾（顔にひび・目を見開く）/ 8 撃破（サイコロの頭が砕け、白い髪と赤い片目 ≈(34,32) が見える。ひざまずき、王冠は髪の上、白い破片が3つ飛ぶ）
- 全フレームで体の中心が x=24（cx 24）、足元は下端 y=47 に接地（歩くボスなので浮遊なし）。共通スケール 0.127（王冠〜足 約37px）。
- 飛んでいるサイコロ・カードは絵から外してある（はみ出すため）。弾の発生点（diceroll_dark.json の spawn）: サイコロ = フレーム5 の (39,23)、カード = フレーム6 の (36,23)。左向きでは x → 47-x。
- 一つ目（2x2 の赤＋ハイライト、反対側の目は黒い細線）・笑い口・王冠（9x4）はコードで描き直している（48px に縮小すると原画の目が2つとも赤く、王冠が茶色くつぶれるため。参考画の一つ目に合わせた）。各フレームの目の位置は diceroll_dark.json の eyes。
- 32色。黒い服は暗い背景では輪郭が沈みやすいので、ステージ背景は明るめか、黒以外の色を推奨。

## ダイスロールの弾（diceroll_bullets）24×24 × 17
- すべてコードでピクセル単位に描画（縮小しないので目がつぶれない）。右向き。11色。
- 並び: 0-5 die_1〜die_6（サイコロの目 1〜6、14×14）/ 6-9 roll_a〜roll_d（転がるサイコロ 0°・22.5°・45°・67.5°、5の目。90°で1周なので 6→9 を 12fps でループ）/ 10 card_back（赤い裏面）/ 11 card_edge（真横）/ 12 card_front（スペード）※回転は 10,11,12,11 / 13 chip_red（赤白チップ）/ 14 chip_black（黒金チップ）/ 15 roulette_ball（銀の玉、左に軌跡）/ 16 fiery_die（燃える赤いサイコロ、炎は左へなびく）
- 描画はセル中央 (12,12) を弾の位置に合わせる（roulette_ball は玉の中心 (15,12)、fiery_die は (13,12)）。当たり判定の目安は diceroll_bullets.json の hitboxSuggestion（disaster_bullets.json と同じ形式。サイコロ・チップ 12x12、カード 8x12、玉 7x7）。
- 顔: diceroll_face.png（白い髪・赤い目・リボン・小さな王冠）、diceroll_dark_face.png（サイコロの頭・赤い一つ目・ギザギザの口・王冠）。
- プレビュー: work/diceroll_preview.png（4倍・全フレーム＋発生点＋弾の当たり判定＋顔）、整列確認: work/diceroll_alignment.png（重ね合わせ＋明るい背景での見え方）
- 生成: 闇: work/diceroll_dark_raw.jpg → work/body_sheet.py work/diceroll_dark_spec.json → work/diceroll_post.py（金の縁取り・歩き2の合成・ハーレクイン柄・一つ目と口・王冠・撃破の頭）。通常: work/diceroll_raw.jpg → body_sheet.py work/diceroll_spec.json → work/diceroll_norm_post.py work/diceroll_spec.json（菱形柄の検出→1pxチェッカー・王冠・目・放ったサイコロ）。弾: work/diceroll_bullets.py。顔: work/diceroll_faces.py。プレビュー: work/make_diceroll_preview.py
- sprite_lib.py に追加（既存の処理は変更なし）: MODE_OPTS["boost"]（sample "mode" で特定の色の重みを上げる）。body_sheet.py に追加: フレームごとの "exclude"（原画の矩形を除外。隣のポーズのサイコロなど）。

## 清掃員カナタ（kanata_boss）最終ボス 64×64 × 9フレーム
- 半分幽霊のポルターガイスト・メイド（ユーザーさん自身のキャラクター）。黒白ツートンの髪・眠そうなジト目（青紫）・ダウナー・黒白のゴシックメイド服。背中の青いガラスタンク（中に幽霊）・白い蛇腹ホース・牙のある黒い吸い込み口までが1体のミミック。周りを青い幽霊が飛ぶ。闇落ち版はない。
- kanata_boss.png: 0-1 待機（1 は目を閉じる）/ 2 移動（髪がなびく）/ 3 物を浮かせる（手を上げる。浮かぶ物は描いていない）/ 4 吸い込み（青い風を含む）/ 5 吐き出し（ホースを持ち上げ、幽霊が飛び出す）/ 6 被弾（ひざをつく）/ 7 撃破（横たわる）/ 8 浮遊（おまけ）
- 全フレームで体の中心が x=32（cx 32）、足元は下端 y=63。共通スケール 0.163（ヘッドドレス〜足 約60px）。原画 refs/kanata_sheet_ref.png（すでにドット絵）を多数決縮小。3 だけ work/kanata_extra_raw.jpg から（シートに手を上げるポーズが無いため）。
- 発生点（kanata_boss.json の spawn。左向きでは x → 63-x）: 吸い込み口 mouth_suction = フレーム4 の (52,41) / 吐き出し口 mouth_spit = フレーム5 の (56,30) / 浮かせる物の中心 levitate = フレーム3 の (54,6)（枠の上にはみ出してよい）/ 上げた手 levitateHand = フレーム3 の (50,24) / 床の掃除機の口 mouth_idle = フレーム0 の (59,58)。
- 吸い込みの風は kanata_bullets_wind.png の収束点 (4,12) を mouth_suction に合わせて描く。浮かせる物・吐き出す弾は kanata_bullets の debris / ghost_bullet / ghost_fireball。
- 顔は約8x5pxと小さいので、ジト目（上まぶたの黒＋青紫の虹彩）を手で打ち直した。シルエットの外側に1pxの濃紺アウトライン。32色。

## 暴走ミミック（mimic_rampage）64×64 × 7フレーム
- カナタの掃除機が暴走した姿。牙のある黒い口＝黒い犬のような体＋白い蛇腹ホース＋青いガラスタンク（中に怒った幽霊）。
- mimic_rampage.png: 0 待機 / 1 飛びかかり（体が右へ7px前に出る）/ 2 大口で吸い込み（青い渦を含む）/ 3 がれきを吐く / 4 被弾（ひび＋黄色い火花はコードで描き足し）/ 5 破壊（タンクが割れる）/ 6 待機2（下4行より上を1px上げた呼吸フレーム。idle は 0,6 のループ）
- 体の中心 x=34（cx 34）、足元は下端 y=63。共通スケール 0.15。口の発生点（mimic_rampage.json の spawn.mouth、フレームごと）: 0 (49,51) / 1 (57,42) / 2 (46,47) / 3 (45,49) / 4 (45,46) / 6 (49,50)。28色。

## カナタ（kanata）仲間 32×32 × 5フレーム ／ 幽霊形態（kanata_ghost）32×32 × 3フレーム
- kanata.png（掃除機なしの通常の姿）: 0 待機 / 1 まばたき / 2 だるそうに手を振る / 3 喜ぶ（ジャンプ、足が約2px浮く）/ 4 目を閉じてマイクで歌う。cx 16、足元 y=31、スケール 0.104（約28px）。目は手置きのジト目。allies.json の "kanata"（idle 0,0,0,1 / wave 2 / happy 3 / sing 4）。
- kanata_ghost.png: 0-1 ふわふわ浮遊 / 2 青い玉を投げる（玉は描いていない。spawn.orb = フレーム2 の (27,16) から kanata_bullets の ghost_fireball / ghost_bullet を出す）。cx 16、しっぽの下端 y≈30、スケール 0.094。淡い青の6段ランプに色を置き換え、しっぽの先は市松の抜きで薄れていく。アルファは 0/255 のままなので、半透明にしたいときはゲーム側で alpha 0.6〜0.75 で描画（または1フレームおきの点滅）。9色。
- 顔: kanata_face.png（シートの待機の頭から。黒白ツートンの髪・ジト目）。

## カナタの弾（kanata_bullets）24×24 × 8 ＋ 吸い込みの風 48×24 × 3
- kanata_bullets.png（右向き）: 0-1 ghost_bullet_a/b（青い幽霊弾の2フレームアニメ。原画は左向きだったので反転済み）/ 2 ghost_fireball（青い鬼火）/ 3 paper_ball / 4 plank / 5 tin_can / 6 rock / 7 plate_shard（がれき5種。回転させて投げてよい）。当たり判定の目安は kanata_bullets.json の hitboxSuggestion（center つき）。30色。
- 吸い込みの風は 24×24 に入らないので別シート kanata_bullets_wind.png（48×24 × 3: 0 長いすじ / 1 弧のすじ / 2 渦、10fps ループ）。原画の小さな口は消して、すじだけにした。左端の収束点 (4,12) が掃除機の口。すじは右（前方）へ広がる。左向きでは反転して収束点は (43,12)。情報は kanata_bullets.json の "wind"。12色。
- プレビュー: work/kanata_preview.png（4倍・全フレーム＋発生点＋当たり判定＋3倍のゲーム内合成）、整列確認: work/kanata_alignment.png
- 生成: ボス: work/kanata_work/kanata_sheet_green_sharp.png（シートを緑背景に＋シャープ）→ work/body_sheet.py work/kanata_boss_spec.json → work/kanata_post.py（肌・ジト目・アウトライン）。ミミック: work/mimic_raw.jpg → body_sheet.py work/mimic_spec.json → work/mimic_post.py。通常／幽霊: work/kanata_small_raw.jpg → body_sheet.py work/kanata_small_spec.json / work/kanata_ghost_spec.json → work/kanata_small_post.py normal / ghost。弾: work/build_icons.py work/kanata_bullets_spec.json / work/kanata_wind_spec.json（風は口を消した work/kanata_work/kb_nomouth.png から）。顔: work/kanata_faces.py。プレビュー: work/make_kanata_preview.py
- body_sheet.py に追加（既存の処理は変更なし）: フレームごとの "move"（原画の矩形の中身を切り取ってずらして貼る。吐き出しの掃除機の頭を体に寄せるのに使用）。sprite_lib.py に追加: skin_pale（とても白い肌の判定）。

## 闇海音（umine_dark・仮）
- umine_dark.png / umine_dark_face.png: kanon.png / kanon_face.png を色変換しただけの仮素材（顔は目を赤く）。本番の闇海音の絵ができたら同じ 32×32×14 の配置で上書きすればそのまま使えます（cx 11、杖の先 30,17）。

## 海音の覚醒（umine_spell）48×48 × 6フレーム と 海割りの水の壁（sea_split）48×96 × 5フレーム
- umine_spell.png: refs/umine_spell_sequence.png（3×2 の詠唱シーケンス）を 31/375 に縮小（アルファは2値化）。各フレームで足元の中心が x=24、足元 y≈46。杖は右向き（左向きは反転）。仮の自動縮小なので、ドット絵で描き直してもらえると助かります。
- sea_split.png: 絵は『左側の壁』（断面が右向き）。右の壁は左右反転。もっと高い壁はフレーム4を縦に並べ、上に波頭を重ねる（つなぎ目は泡の白で隠す）。情報は sea_split.json。

## エンディングのパーティー（party_bg / party_props）
- party_bg.png（256×240＝ゲーム画面）: 16:9 の生素材の高さ全体を 240 に（1/3）縮小し、ステージが中央に来るよう横を切り出し（生素材 x 476〜1244）。ステージの床（上面）は y≈157、手前の床は y≈175〜240。52色、ディザなし。
- party_bg_wide.png（384×240）: 少し横スクロールさせる用（生素材 x 64〜1216。左の窓・三日月も入る）。同じパレット。
- 縮小は 3×3 ブロックの多数決（なめらかにしない）。色は「全体から40色＋彩度の高い部分（スポットライト・ちょうちん・旗）から18色」の共通パレット（茶色に飲まれて照明の色が消えるのを防ぐため）。
- party_props.png（高さ32の1列のシート、各セルは下揃え）＋ party_props.json（name, x, y, w, h, bottomAnchor = セル下端の中央、contentBox）。並び: table_round 48×32 / table_long 64×24 / mic_stand 16×32 / roast_chicken・cake・sushi・pizza・fruit_bowl 24×24 / beer_mug・wine_glass・juice・bottle 16×16 / balloons 16×32 / plates 24×24 / speaker 24×32。40色。
- 料理・飲み物をテーブルに置くときは、bottomAnchor を天板の高さ（table_round はセル上端から約10px、table_long は約6px）に合わせる。緑のびんは緑背景の抜きで消えるため、専用の抜き（明るい緑だけを背景とみなす）で切り出した。
- プレビュー: work/party_preview.png（3倍の背景に32pxの仲間（カナタ・ダイスロール・シラヌイ・スター・海音）と小物を配置、小物シート4倍、ワイド版2倍）
- 生成: work/party_bg.py / work/party_props.py / work/make_party_preview.py

## 砲槍アイコン（alchemic_weapons.png フレーム6）
- disaster_weapons_raw.jpg の砲槍ポーズ（disaster_dark.png フレーム11と同じ武器）から砲身・砲口・紫の光を切り出し、原画で手に隠れている柄とつばを描き足した。他の武器と同じく柄が左下・砲口が右上。既存シートのパレット（24色）に合わせたので色数は増えていない。
- grip (11,23)、gripNorm [0.359, 0.734]、砲口 muzzle ≈(24,4)（alchemic_weapons.json の weapons.lance）。
- 生成: work/build_lance_icon.py。元ファイルのバックアップ: work/backup_20261003b/

## 変更履歴（2026-10-03）
- astarte_dark.png: 生素材から作り直し。全フレームで体が x=22 に揃う（ゲーム側は cx 22、cxF 削除でOK）。
- neenia_dark.png: 作り直し。体の中心 x=20、矢の先端 ≈(45,22)（フレーム5）。ゲーム側の cx 21 / muzX 40 / muzY 24 は json の値に合わせて更新を。
- neenia_dark_face.png: 通常版と区別できるよう、灰紫の色調＋赤く光る目＋茨に作り直し。
  → **2026-10-03 ユーザーの希望で取り消し。** 本番の neenia_dark_face.png は作り直し前の版（abe6b1b より前 / work/backup_20261003/neenia_dark_face.png と同じもの）に戻しました。neenia_dark.png（体のシート）は新しい版のままです。
- lily_dark.png: フレーム5だけ作り直し、体の位置を他フレームに合わせた。
- seiten_dark.json / この README: leap の説明を修正（2 空中、3 しゃがみ）。画像の並びはゲームのコード（poseF 0 = 空中、1 = しゃがみ）と合っているので入れ替えていない。
- 追加: disaster_dark / alchemic_weapons / transform_fx / disaster_bullets / star / star_weapon と各顔アイコン、プレビュー（work/fixes_preview.png ほか）。
- 追加（2026-10-03 午後）: shiranui / shiranui_dark / shiranui_bullets / shiranui_bullets_pillar と顔アイコン2つ、allies.json に "shiranui"。alchemic_weapons に砲槍（フレーム6）を追加（バックアップ work/backup_20261003b/）。
- 追加（2026-10-03 夕方）: diceroll / diceroll_dark / diceroll_bullets と顔アイコン2つ、allies.json に "diceroll"。
- 追加（2026-10-03 夜・最終ステージ）: kanata_boss / mimic_rampage / kanata / kanata_ghost / kanata_bullets / kanata_bullets_wind と顔アイコン kanata_face、allies.json に "kanata"。エンディング用に party_bg / party_bg_wide / party_props。

## リポジトリ（kanata-games/rockside）での注意 – 2026-10-03
- **lily_dark.png はリポジトリ版（ChatGPT が作り直したシート）を使い続けています。** 上の lily_dark の説明（フレーム5に音波を描き込み・cx=21）はローカル旧シートの修正版のもので、本番では採用していません。
  本番のシートはフレーム5に音波を含まず、音波は `lilySongWave`（02b_chars.js）として別レイヤーで歌攻撃のときだけ重ねます。体の中心 cx=24。
- Disaster / Star の素材（disaster_dark, star, alchemic_weapons, transform_fx, star_weapon, disaster_bullets, 顔）は本番に統合済み（src/04b_disaster.js）。
- astarte_dark（cx=22, cxF 廃止）、neenia_dark（cx=20, 矢先 45,22）は本番に反映済み。neenia_dark_face は作り直し前の版に戻しています（上の変更履歴を参照）。
