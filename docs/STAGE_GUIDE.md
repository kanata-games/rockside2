# ステージ作成ガイド / Stage Authoring Guide — 海音ちゃんの冒険２ (ROCKSIDE II)

> ピッちゃん（ChatGPT）や他のAIが部屋を追加・修正するための手順書です。**部屋はすべて `src/03b_rooms.js` の文字の絵（ASCII）で作ります。座標を手で書かないでください。**
> This is the how-to for ChatGPT ("ピッちゃん") or any other AI that adds or edits rooms. **Every room is drawn as ASCII in `src/03b_rooms.js`. Never hand-write pixel rectangles.**

![world map](world_map.png)

---

## 1. しくみ / How it works

- 1文字 = 16×16px のタイル1枚。/ One character = one 16×16 px tile.
- 部屋は「画面（セル）」単位。1セル = 256×240px = **16列×15行**。部屋の大きさは `cw×ch` セル（行数・列数は必ず16と15の倍数）。/ Rooms are measured in screens ("cells"): 1 cell = 256×240 px = **16 columns × 15 rows**. A room is `cw × ch` cells, so its row length must be a multiple of 16 and its row count a multiple of 15.
- 各部屋は世界地図上の位置 `cx, cy`（セル単位）を持ちます。部屋同士は重なってはいけません。ゲーム内マップは悪魔城のようにこのセルで描かれます。/ Each room has a world-grid position `cx, cy` in cells. Rooms must not overlap. The in-game map is drawn from these cells, Castlevania-style.
- `buildMansionWorld(ROOM_DEFS)` が文字の絵から `MR`（当たり判定・扉・セーブ・敵・小物）、`MANSION_PORTALS`（ワープ）、`MANSION_PROPS`（壊せる小物）を自動生成します。ボス・セーブ・フラグの処理は `src/04i_mansion.js` のまま動きます。/ It generates `MR` (collision, doors, saves, enemies, props), `MANSION_PORTALS` and `MANSION_PROPS` from the ASCII. Bosses, saves and flags in `src/04i_mansion.js` keep working unchanged.
- 描画は当たり判定とまったく同じタイルを、エリアごとの色で描きます（背景の絵は飾りなので、足場の参考にしないこと）。/ The renderer draws exactly the collision tiles, styled per area. The painted backdrop is decoration only, so never use it to place floors.

## 2. タイルの記号 / Tile legend

| 文字 | 意味 (JA) | Meaning (EN) |
|---|---|---|
| `#` | 壁・床（固い） | solid wall / floor |
| `=` | 薄い足場（タイルの上半分8pxだけ固い。下からはすり抜けない） | thin ledge (solid top 8 px; still solid from below) |
| `.` | 空気 | empty air |
| `\|` | 空気（昇降機の通り道の目印。任意） | air, optional lift-shaft marker |
| `g` | 封印の門（`seal` フラグまで固い） | seal gate (solid until flag `seal`) |
| `k` | 錠の門（その部屋の `lever.flag` まで固い） | latch gate (solid until this room's `lever.flag`) |

**目印（床のすぐ上の空気マスに置く）/ Markers (put them in the air tile directly above the floor they stand on).** The marker's x is the tile centre and its y is the tile bottom, i.e. the floor surface.

| 文字 | 意味 (JA) | Meaning (EN) |
|---|---|---|
| `S` | セーブの灯り（1部屋1つ） | save altar (one per room) |
| `W` | 紫のワープ扉（1部屋1つ。`portalNeed` でロック、`warpOrder` で並び順） | violet warp door (one per room; `portalNeed` locks it, `warpOrder` sets its place in the list) |
| `D` | 端の扉。部屋の左端/右端のセル列に置くと、隣の部屋の向かい側の `D`（同じ世界行）と自動でつながる | edge door. In the first or last cell column it auto-pairs with the facing `D` of the neighbouring room in the same world row |
| `1`–`9` | つなぎ扉。`links:{1:'gallery:1'}` で相手を指定、`need:{1:'seal'}` で鍵 | linked door. `links:{1:'gallery:1'}` names the partner, `need:{1:'seal'}` locks it |
| `X` | 奥の扉（`extension:{link:'room:1', onEnterFlag}`。なければ鍵のかかった飾り扉） | extension door (`extension:{link:'room:1', onEnterFlag}`; without it, a locked decoration) |
| `s` | 水脈の紋章（`seal` フラグ） | seal emblem (flag `seal`) |
| `L` | レバー（`lever:{flag,label}` 必須） | lever (needs `lever:{flag,label}`) |
| `B` / `G` | ボス出現位置 / ゴール門 | boss spawn / goal gate |
| `N` | NPCの立ち位置（`r.npc`） | NPC spot (`r.npc`) |
| `w` / `f` | 歩く敵（巡回範囲は床から自動） / 飛ぶ敵（±48px） | walker (patrol taken from the floor) / flyer (±48 px) |
| `c` `v` `x` | 壊せる燭台・壺・箱 | breakable candle, vase, box |
| `u` | 蒸気の噴き出し口（`ventOffsets` で時間差） | steam vent (`ventOffsets` staggers them) |
| `K` `O` `P` `C` | 背景の本棚・窓・絵・時計（当たり判定なし） | background bookcase, window, picture, clock (never solid) |

## 3. 動きの寸法（ここに合わせて作る）/ Move dimensions (build to these)

Values come from `MC` in `src/04i_mansion.js`: body 14×26 px, jump 5.8, gravity 0.28, run 1.8, slide 4.1 and wall kick 5.6 up / 2.5 out.

| 動き / Move | 寸法 (JA) | Size (EN) |
|---|---|---|
| 体 / body | 1列×2行。立てる所 = 床の上に空気2マス | 1 column × 2 rows. A standing spot is 2 free tiles over a solid one |
| ジャンプの高さ | **3マスまで**（理論60px。4マスは届かない） | rise **3 tiles max** (60 px apex; 4 tiles fails) |
| ジャンプの幅 | 同じ高さなら**空き3マス**（中心から4列）、3マス上がるなら2マス | gap of **3 empty tiles** on the level (4 columns centre to centre), 2 when rising 3 |
| 頭上 / headroom | 3マス上がるジャンプは、その上にもう1マス空気が必要 | a 3-tile rise needs 1 more free tile above it |
| スライディング | **高さ1行のすき間**だけ通れる（立つと26px、滑ると14px）。トンネルの中では止まらず抜けるまで滑り続ける | passes **1-row gaps** only (26 px standing, 14 px sliding). Under a ceiling it keeps sliding until it is out |
| スライディングジャンプ | 滑っている最中にジャンプ → 4.1の速さのまま飛ぶ。**空き6マス**の溝を越えられる（普通のジャンプは無理） | jump during a slide and the 4.1 speed is kept in the air. Clears a **6-empty-tile** gap that a normal jump can't |
| 壁キック | 横に壁があれば同じ壁を何回でも登れる（ロックマンX式）。1回で約3.5マス上昇、壁から**2列（約24px）**はねる | climbs any wall face, the same wall repeatedly (Mega Man X style). About 3.5 tiles per kick, swinging **2 columns (~24 px)** off the wall |
| 壁キックの注意 | はねる2列の上に天井や足場があると頭をぶつけて止まる → **壁の横は最低3列あける**か、1〜2列幅のたて穴にする | a ceiling or ledge over those 2 swing columns stops the climb, so **keep 3 open columns beside a kick wall** or use a 1–2 column shaft |
| 壁の上に乗る | 登った壁の上へ横にステップ。はねる2列も上まで空いていること | step sideways onto the wall top; the 2 swing columns must stay open up to it |
| 床の穴 | 床の一番下の行まで空気にすると落下（チェックポイントへ戻る） | air down to the bottom row is a pit (you return to the checkpoint) |

**よく使う形 / Ready-made shapes**

```
Slide tunnel (1 free row)     Wall-kick shaft (2-3 wide)    Slide-jump gap (6 empty)
##########                    #...#                         ===......===
##########                    #...#                         (6 dots between ledges)
..........  <- only 1 row     #...#
##########                    #...#
```

## 4. 部屋を足す手順 / Adding a room, step by step

1. 地図を決める：`python3 tools/mapview.py` で `docs/world_map.png` を見て、空いているセルに `cx, cy, cw, ch` を決める。/ Pick free world cells from `docs/world_map.png`.
2. `ROOM_DEFS` に1件追加 / Add one entry to `ROOM_DEFS`:
   ```js
   {id:'chapel',name:'月影の礼拝堂',area:'library',cx:12,cy:3,tone:'#30283e',
    links:{1:'archive:4'},need:{1:'seal'},rows:[
     '################################',   // 32 chars = 2 cells wide
     ...                                   // 15 or 30 or 45 ... rows
   ]}
   ```
   `area` は `hub mansion library tower water star garden play` のどれか（タイルの色）。/ `area` picks the tile style.
3. 外周を `#` で囲む（扉は部屋の中に置く。押して入る扉です）。/ Wall the room in with `#`. Doors sit inside the room; the player presses ↑ / 調べる to use them.
4. 隣の部屋と横につなぐなら、両方の部屋の向かい合う端のセル列に `D` を1つずつ、**同じ世界行**に置く。それ以外は数字扉と `links` を両方向に書く。/ For side-by-side rooms put one `D` in each facing edge cell column, in the **same world row**. Otherwise use digit doors with `links` written in both rooms.
5. 確認 / Check:
   ```bash
   node tools/reach.js            # must end with "OK"
   python3 tools/mapview.py       # look at docs/world_map.png (red = unreachable)
   python3 tools/build.py --out preview.html
   node tools/test-mansion.cjs    # every line PASS, exit 0
   ```

## 5. reach.js が見るもの / What `tools/reach.js` checks

- 拠点のセーブから、歩く・ジャンプ・壁キック・スライディング・スライディングジャンプ・扉・昇降機・ワープで行ける所を全部さがす。紋章やレバーを取ったら扉や門を開けて、もう一度さがす（新しく開くものがなくなるまで）。/ It flood-fills from the hub save using walk, jump, wall kick, slide, slide jump, doors, lifts and warps. After each seal or lever it opens doors and gates and searches again, until nothing new opens.
- **エラーになるもの / Errors:**
  - セーブ・扉・ワープ・レバー・紋章・ボス・ゴール・NPC・小物に行けない。/ A save, door, warp, lever, seal, boss, goal, NPC or prop can't be reached.
  - 目印の下に床がない、立つ空間がない。/ A marker has no floor or no room to stand.
  - **一方通行のわな**：行けるのに拠点へ戻れない場所。/ **One-way traps**: places you can reach but can't get back from to the hub.
- `needs wallkick / slide / slidejump` は「その動きを使えないと行けなくなる目印の数」。ゲートが本当に効いているかの確認に使う。/ These lines count the key points you lose without that move, which proves each gate really works.
- `--json FILE` で結果を書き出し、mapview が赤く塗る。/ `--json FILE` writes the result for mapview's red overlay.
- 部屋の文字の絵がおかしい（長さ違い・知らない文字・相手のない `D`）と、ゲームを読みこむ前に `[rooms] ...` で止まって理由を表示する。/ Broken ASCII (wrong length, unknown char, unpaired `D`) stops at load time with a `[rooms] ...` message that says what is wrong.

## 6. ビルドの罠 / The build trap

- **必ず `python3 tools/build.py --out preview.html`**。`--out` を忘れると `index.html`（公開URLの入口のリダイレクト）を上書きして、公開版が壊れます。/ **Always run `python3 tools/build.py --out preview.html`.** Without `--out` it overwrites `index.html`, the redirect behind the public URL.
- `preview.html` と `index.html` は手で編集しない。/ Never hand-edit `preview.html` or `index.html`.
- 公開前に `src/01_head.html` の `GAME_VERSION` を上げる。/ Bump `GAME_VERSION` in `src/01_head.html` before publishing.

## 7. やっていいこと・だめなこと / Do's and don'ts (learned the hard way)

**Do**
- 床の高さは16の倍数。立つ床どうしの段差は**3マス以内**（ジャンプで登れる）。/ Keep floors on 16 px rows, with **≤3-tile** steps between standing floors.
- 新しい部屋を足したら毎回 `reach.js` → `mapview.py` → テスト。/ Run `reach.js`, `mapview.py`, then the tests after every room.
- ゲート（スライディング・壁キック・スライディングジャンプ）は**いつも同じ形**で作り、見た目で分かるようにする。/ Build every gate (slide, wall kick, slide jump) in **the same shape** each time, so players learn it by sight.
- 行き止まりの先には戻り道（段差・壁キック用の壁・扉）を必ず置く。/ Always give a dead end a way back: steps, a kick wall or a door.
- ボス部屋は床を y=256（16行目）に置く（`seitenArena` `diceArena` `garden` のAIがこの高さ前提）。/ Boss rooms keep their floor at y=256 (row 16); the `seitenArena`, `diceArena` and `garden` AIs assume it.

**Don't**
- 背景の絵の手すりや床に合わせて足場を作らない（絵は当たり判定ではない）。/ Don't place platforms to match the painted backdrop; it isn't collision.
- 薄い足場のすぐ下を通路にしない。ジャンプで頭をぶつけて進めなくなる（大広間で実際に起きた）。/ Don't run a corridor right under a thin ledge; jumps bump into it and stall (this really happened in the hall).
- 壁キックで登る壁の横2列に足場を置かない（貯水室・大広間で実際に止まった）。/ Don't put a ledge in the 2 columns beside a kick wall; the climb really stopped in the reservoir and the hall.
- 部屋どうしを「下に落ちたら隣」にしない。落下はチェックポイントに戻る仕様。/ Don't connect rooms by falling; a fall returns you to the checkpoint.
- 扉の相手を片方だけ書かない（数字扉は両方の部屋に `links`）。/ Don't write a door link on one side only; digit doors need `links` in both rooms.
- セーブのキー `rockside2_mansion_v1` / `version:1` は変えない。古いセーブの記録地点が新しい床に合わないときは、その部屋の `S` に自動で移る。/ Don't change the save key `rockside2_mansion_v1` / `version:1`. An old checkpoint that no longer fits the new floor moves to that room's `S` automatically.
- `HUB_NPCS`（`src/04i_mansion.js`）のアスターテや青天の立ち位置は座標で書いてある。部屋を作り直したら、その位置に床があるか確認。/ The Astarte and Seiten spots in `HUB_NPCS` (`src/04i_mansion.js`) are hard-coded coordinates. After rebuilding a room, check there is floor at those spots.

## 8. 今の世界 / The current world (phase 1)

- 14部屋・88セル。進む順番：書庫の紋章（スライディングのトンネルの先）→ 封書の錠 → 星灯りの錠 → 中庭のアスターテ。/ 14 rooms, 88 cells. Unlock order: archive seal (past the slide tunnel), then the 封書 latch, then the 星灯り latch, then Astarte in the garden.
- 壁キック：大広間の柱と東の壁、時計塔の東壁のたて穴、貯水室の隠し棚。/ Wall kick: the hall pillars and east wall, the clock tower's east-wall shaft, and the reservoir's secret shelf.
- スライディング：書庫の低いトンネル（ここを抜けないと先へ進めない）。/ Slide: the archive's low tunnel. Everything past it requires going through.
- スライディングジャンプ：星灯りの渡り廊下の隠し棚（6マスの溝）。/ Slide jump: the star passage's secret ledge across a 6-tile gap.
