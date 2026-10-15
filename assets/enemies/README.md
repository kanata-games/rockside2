# 雑魚敵スプライト（月影の館）

全ファイル共通：透過PNG（アルファ0/255のみ）、横一列・同サイズのコマ、**右向き**（ゲーム既存の慣例どおり。左向きは読み込み時に反転）。共通パレット（藍・月光銀・紫＋赤アクセント、輪郭は濃紺黒）。

| ファイル | 1コマ | アニメ |
|---|---|---|
| armor.png | 40×36 | idle / move(歩き) / guard(盾で受ける) / telegraph / attack(槍の突き) / hurt / death |
| crawler.png | 20×14 | idle / move(這う) / telegraph / attack / hurt / death。床向きで描画。壁・天井はゲーム側で回転（json の wall_rotation） |
| turret.png | 24×24 | idle・move(浮遊) / telegraph(チャージ) / attack(マズルフラッシュ) / hurt / death。弾は turret_bullet.png（8×8×2コマ） |
| bat.png | 20×16 | idle・move(羽ばたき) / telegraph / attack(急降下) / hurt / death |
| book.png | 20×20 | idle(閉じて眠る) / move(跳ねる) / telegraph(口を開く) / attack(噛みつき) / hurt / death |
| slime.png | 18×18 | idle / move(跳ねる) / fall(天井から落下) / telegraph / attack / hurt / death |

各 json：frame(w,h)、anchor(cx, feet_y)、animations(frames, ms, loop, attack.active)、hitbox(body / attack, [x,y,w,h]、反転時はxを鏡映)、turret は projectile_spawn。
生成スクリプトとプレビューは work/enemies/（gen.py を再実行すると再生成）。
