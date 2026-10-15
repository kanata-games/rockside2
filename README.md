# 海音ちゃんの冒険２ — 屋敷探索テスト

ROCKSIDE II / 2.0.0-test.46（GitHub公開版）。前作 ROCKSIDE v0.12.0 から独立した続編開発用プロジェクト。由来は BASE_ORIGIN.json に記録。前作リポジトリには変更を加えない。

## ステージの作り方 / How to build stages

**部屋を追加・修正する前に必ず読む → [docs/STAGE_GUIDE.md](docs/STAGE_GUIDE.md)**（日本語・英語）
**Read [docs/STAGE_GUIDE.md](docs/STAGE_GUIDE.md) before adding or editing rooms** (Japanese + English).

- 部屋は `src/03b_rooms.js` のASCIIタイル（1文字=16px、1画面=16×15マス）で作る。/ Rooms are ASCII tiles in `src/03b_rooms.js` (1 char = 16 px; 1 screen = 16×15 tiles).
- 確認 / Check: `node tools/reach.js`, then `python3 tools/mapview.py` (writes `docs/world_map.png`), then `node tools/test-mansion.cjs` `node tools/test-hoshiyomi.cjs` and `node tools/test-keiko.cjs`.
- ビルドは必ず / Always build with `python3 tools/build.py --out preview.html`. Without `--out` it overwrites the `index.html` redirect.

### 2.0.0-test.54
- ダイスロール（紳士）に続編の新しい絵（assets/diceroll-sequel：待機・移動・ジャンプ・予兆・攻撃A/B・被弾）。拠点と遊戯室の両方で表示。ダイス・スタンプ／カードの壁／ジャックポット・ナイトは絵の手や足の位置から弾を出す。カットイン画像を新しいものに差し替え。
- 紳士との勝負は「練習」で、手加減していることを台詞でにおわせる（勝利時「本気の札は、また今度」）。
- 新しいボス：**ダイスロール（素顔）**。影4体を倒す（ダーク海音ちゃん解放）と、拠点のダイスロールの誘いが本気の勝負に変わる（場所は月影の遊戯室）。中身の女の子（銀髪・赤い目・ダウナー、棒付きキャンディと赤い煙。タバコは描かない）が攻めてくる。HP 200。
  - 技：キャンディ・ラッシュ（突進の線で予告→残像つきの突進＋はじける飴の爆弾）、スモーク・ヴェール（煙に消える→足元マークの位置に現れて蹴り上げ）、ロリポップ・スピン（飴6個を回しながら追う→外へはじく）、ローデッド・ダイス（ルーレットで出目→その数だけ赤いサイコロ）、シュガー・レイン（跳び上がって列ごとに降らせる、安全な列は1本）。怒り時の必殺 **スウィート・オールイン**（カットイン、出目3回：奇数＝左右からカードの壁、偶数＝床側に隙間のある煙の輪）。
  - ご褒美：月影の飴玉（最大HP+2、一度だけ）。勝った後は、紳士の練習と本気の勝負を交互に受けられる。
  - 納品された絵をすべて使用：diceroll_girl-sequel、会話用の表情4種（diceroll_girl_talk-sequel）、diceroll_girl_face、fx/diceroll_girl_*（red_dice / roulette / smoke / card_storm / impact / aura / cutin）。素材が無いときはコードで描いた絵になる。
- カットイン用フォントのサブセットに「素顔（）」などの新しい文字を追加。

### 2.0.0-test.53
- カットインの技名を Dela Gothic One で表示（斜体風の傾き、黒の太い縁取り＋ボス色の線、ボス色のずらし影、入りの瞬間に拡大→縮小の「カッ！」）。ボス名も同じフォント。フォントを読み込めない間は従来の sans-serif で表示。
- フォントは技名・ボス名に使う文字とカタカナ・ASCIIだけに絞ったサブセット（assets/fonts/DelaGothicOne-cutin.woff2、約22KB）。作り直しは `tools/font-subset.py`。

### 2.0.0-test.52
- 必殺技のカットインを作り直し：画面中央の大きな帯（約40%を約1.6秒覆っていた）をやめ、右上の小さな斜めの帯（画面上部 y18〜48、上20%以内）に変更。顔（目元）の切り抜き＋技名＋ボス名。4フレームで「カッ！」と入り、約0.73秒で横へ抜ける。長い停止なし（ヒットストップ2フレームのみ）、全画面フラッシュなし。高解像度のオーバーレイに描くので文字がくっきり見える。全ボスの必殺技に適用。

### 2.0.0-test.51
- 青天：新技 天翔け(sSkyPounce：空へ消え、光の柱で予告してから落下＋着地の衝撃波)、ハートの扇(sHeartFan：白線の方向だけ空く扇弾)、怒り時の必殺 ソラノコエ・ララバイ（カットイン、音符の輪3回。隙間の方向を水色の線＋床の安全地帯で予告）。
- ダイスロール：新技 ダイス・スタンプ(dSlam：着地点マーク→跳躍→衝撃波＋跳ねるサイコロ)、カードの壁(dCardWall：上下交互のカード。高さを光で予告、低い＝ジャンプ／高い＝スライディング)、怒り時の必殺 ジャックポット・ナイト（カットイン、出目3つで安全な列が決まり、それ以外の列にチップの雨。必殺中はカメラが部屋全体を映す）。
- アスターテ（チュートリアルのまま）：三日月三連(低・高・低を溜めの光で予告)、月の雫(足元マーク→ゆっくり落ちる星)。溜めオーラと命中エフェクトを追加。
- ヒットストップ・画面揺れ・被弾フラッシュを全ボスに拡張。ボスカメラを青天/ダイスロール/アスターテにも適用。
- 納品FX（hoshiyomi_ / seiten_ / diceroll_ / dice_roll_impact / astarte_）を読み込み、カットイン画像も表示。素材が無い場合はコード描画になる。
- ダーク星詠みの難しさを調整：HP 140→130、彗星の星を減らし、ノヴァの隙間が必ず下向きに開くよう修正（上向きになると避けられない不具合があった）。予測ボットは被弾6/16、負けなしで勝てる。

### 2.0.0-test.50
- シャドウ4体に納品FX素材を適用（slash / shockwave / impact / aura、固有：ヴェスパーの隕石・ラヴィスの矢の雨・ノクターンの音の輪・エクリプスのビーム）。必殺技のカットインに立ち絵画像。素材が無い場合はこれまでのコード描画に戻る。
- ダーク星詠みを作り直し：新技 星座結び(hsConstel)・彗星落とし(hsComet)・周回星弾(hsOrbit)、怒り時の必殺 スターダスト・ノヴァ（隙間の方向を水色の線で予告）。HP 100→140、浮遊、怒り時のフラッシュ・揺れ。

## 現在の公開版（2026-10-15 / test.49）

- **ニセモノの技を、前作の「闇」版に寄せて作り直した**（前作 rockside の aiTobiume / aiNeenia / aiLily / aiDisaster を参考にした）
  - ハネウメ（闇飛梅のまね）：宙に浮いて戦う。ねらいをつけた扇状のハート弾、ねらい線を引いてから斜めに急降下、海音の真上を追いかけてからの急降下キック（着地の衝撃が左右に走る）。
  - ネムニア（闇ネーニアのまね）：距離をとる。先を読んだねらい線つきの矢、空へ放って落ちる場所に印を出す山なりの矢、バックステップ（追いつめられると飛び越える）からの3本の矢、壁や天井で跳ね返る矢（跳ね返る道すじが先に見える）、矢の雨、茨のわな。
  - リリリ（闇リリィのまね）：ゆれる歌の波、後ろに跳びながらのハート、宙に浮いて撃つ音符、横にゆれながら降る星の雨（落ちる列が先に光る）。
  - ズターさん（闇ディザスターのまね）：武器が変わるたびに頭の上へ印が出る。剣・斧・大鎌・弓に加えて、ねらい線が固まってから投げる槍、床の届く範囲に線を出してから振る鞭剣、ためてから撃つ砲槍（床で割れて衝撃になる）。
- **影の四騎の技を、それぞれの武器に合わせて新しく作った**。HPが半分になると、名前つきの大技を1回使う。大技は帯のカットインと白い光で始まる。
  - ヴェスパー：大きな闇の球（途中で8方向に割れる）、消えて海音の真上に現れる急降下キック（2〜3回つづく）。大技「トワイライト・メテオ」：印のついた場所へ流星キックを5回。
  - ラヴィス：高さを示す線が出てから飛ぶ、部屋を横切る貫く矢。空へ射た矢が、印の列へ落ちてくる。霧に消えて反対側に現れる。大技「ミストラル・ハント」：ワープしながら、ねらい線が固まってから矢を4回。
  - ノクターン：高さを交互に変える赤い音波の輪、回りながら星をらせん状にまく、印めがけたステージダイブ。大技「ミッドナイト・アンコール」：照明の柱が部屋をなめていき、安全なのは光らない隙間だけ。
  - エクリプス：突進して紫の軌跡を残し、そのあと軌跡の一部が柱になって吹き上がる。背後へのワープから、上・下の順に斬る。大技「トータル・エクリプス」：部屋が暗くなり、隙間つきで三日月の刃が降る。最後は部屋全体を横に斬る高い斬撃。
- **演出**：弾が当たると一瞬止まり、とどめでは長く止まって光る。たたきつけや爆発で画面がゆれ、海音がダメージを受けると赤く光る。どの攻撃も、線・印・列・輪の予告が先に出る。よけ方をせりふで説明することはしない。
- ボスのHPを上げた（ニセモノ 220〜290、影 340〜380）。どの技も一度は見られる長さにするため。
- テスト `tools/test-bosses.cjs` と、共通の予測ボット `tools/bossbot.cjs` を追加した。ボットは弾・ビーム・予告を見て、48フレーム先まで9通りの動きを試し、いちばん当たらない動きを選ぶ。強化ありで8体すべてに負けずに勝ち、全部の技と大技のカットインが出ることを確かめる。ビームの前には必ず予告の線が出ることも確かめる。

## 前の公開版（2026-10-15 / test.48）

- **星詠みのお店に新しい強化**（欠片で買う。セーブされる）
  - **星の小瓶**（欠片4・7、2本まで）：HPが満タンのときに拾った回復をためておける（1本に8）。小瓶ボタンかVキーでHPに注ぐ。HPバーの横とステータス画面に表示。
  - **空中ダッシュ**（欠片8）：空中でスライド入力（SLIDE／↓+ジャンプ）すると、横にまっすぐダッシュ。1回のジャンプに1度、着地か壁で回復。
  - 寄り道部屋「星屑の飛び石」（稽古庭入口の扉8）に、スライドジャンプ＋空中ダッシュでしか取れない欠片を1つ置いた。
  - reach テストにダッシュを加えた。解除の順番は変わらない。ダッシュは生まれつきのスライドジャンプの代わりにもなる（6か所）が、封印・レバーなどの関門は飛び越えられない。
- **ボス戦のカメラ**：ニセモノ・影の四騎・ダーク星詠みとの戦いでは、海音とボスの真ん中を映し、離れると引いて両方を映す。ボスが画面外から攻撃することがなくなった。
- **ボスのせりふ**：よけ方を教えるのは最初のボス（アスターテ）だけにした。ニセモノ・本物の仲間・影の四騎のせりふから攻撃のヒントを消し、性格と物語の話に書き直した。
- テスト `tools/test-upgrades.cjs` を追加（お店、小瓶、ダッシュ、ダッシュ用の欠片、カメラ）。

## 前の公開版（2026-10-15 / test.47）

- **影の四騎（新ボス4体）**：昔の「ぼんやり闇バージョン」の絵から生まれた、まったく別のオリジナルボス。どれも寄り道の隠し部屋にいる。
  - 黄昏翼ヴェスパー（黄昏翼の止まり木）：入口は回廊の下の床にある扉7
  - 霧弓ラヴィス（霧弓の書架裏）：入口は禁書庫の下の床にある扉7
  - 夜想ノクターン（夜想の水底劇場）：入口は月光の貯水室の扉7
  - 蝕王エクリプス（蝕の天蓋）：入口は天文ドームの扉7
- **手ごわさ**：HPは220〜260。弾の数も攻撃の速さも、ニセモノたちより上。くらうダメージは1.5倍。
  - 強化なしだと戦いがおよそ3倍長くなり、3ダメージを6回くらうと倒れる。
  - HP・弾・スライディングを強化していれば、十分に勝てる。
  - 予告のルールは今までと同じ。高い攻撃はスライディングでくぐり、低い攻撃はジャンプで越える。降ってくる攻撃は、先に安全な隙間が光る。
- **ごほうび**：1体倒すごとに欠片3つ。4体とも倒すと、スタイル「**ダーク海音ちゃん**」が解放され、すぐに変身する。
  - ステータス画面のボタンで、いつでも元に戻したり、また変身したりできる。どちらのスタイルかはセーブされる。
  - ダークの特徴：影の弾が敵を貫通する（同じ敵に当たるのは1回だけ）。弾も速くなる。そのかわり連射は少し遅い（10→14フレーム）。
  - 絵は `umine_dark_style-sequel*.png` を使う。絵が届いていないときは、海音の色を変えて代わりにする。どちらのスタイルでも紫のオーラが出る。
- テスト `tools/test-shade.cjs`：ボットが強化ありで4体それぞれに一度も負けずに勝つ。強化なしだと戦いが長く、一撃も重いことを確かめる。ダークスタイルの解放・切り替え・セーブと、弾の貫通も確かめる。
- 直したこと：抜け穴の描画が1フレームに2回呼ばれていたのを1回にした。

## 前の公開版（2026-10-15 / test.46）

- test.45 の4人の hi-res の絵が本物に似ていなかったので、別人のニセモノ（月が映した写し身）にした。ニセモノとはふつうのボス戦になる。/ The four hi-res sprites from test.45 didn't look like the real characters, so they are now different, original impostors (phantoms cast by the moon). Fighting them is a real boss fight.
  - ハネウメ（跳梅）：飛梅のニセモノ / impostor of 飛梅
  - ネムニア：ネーニアのニセモノ / impostor of ネーニア
  - リリリ：リリィのニセモノ / impostor of リリィ
  - ズターさん：スターさんのニセモノ / impostor of スターさん
- 本物の4人は、それぞれ別の場所にある檻の部屋に閉じこめられている。続けて戦う作りはやめた。/ The real four are each held in a cage room in a different part of the world, no longer as back-to-back arenas.
  - 梅香の離れ：稽古庭の渡り廊の先 / past 渡り廊 in the sparring garden
  - 弓張りの塔牢：天文書庫の控え室の扉から / through a door in the observatory's 控え室
  - 月影の楽屋：拠点の地下室の扉から / through a door in the hub cellar
  - 錬金の封印室：星灯りの渡り廊下の扉から / through a door in 星灯りの渡り廊下
- 部屋に入ると、ニセモノが友だちのふりをして近づいてくる。少しずれたことを言ったあと正体を明かして、戦いになる。/ In each room the impostor approaches as Umine's friend, says something slightly off, then reveals itself and fights.
- 勝つとニセモノは消え、檻が開いて本物が出てくる。本物は腕試しや協力の話、助言をくれて、星詠みの欠片を3つくれる。/ Winning makes the impostor fade, the cage opens, and the real friend comes out: cooperation talk, a tip, and 3 star shards.
  - 本物に話しかけると、ニセモノを呼び出して再戦できる。/ Talk to the real friend to summon the impostor for a rematch.
- 絵：/ Art:
  - ニセモノ：`assets/<tobiume|neenia|lily|disaster>-sequel`、なければ仮の絵 / impostors: those sheets, else placeholder
  - 本物：`assets/<tobiume|neenia|lily|star>_real-sequel`（素材づくり担当の、本物に似せた絵が届いて入っている）。なければ前作の普通の絵を拡大、それもなければ仮の絵。/ real friends: the art maker's faithful `_real-sequel` sheets (already in), else the first game's normal sheets scaled up, else placeholder
  - ユーザーの資料：`refs/<tobiume|neenia|star|lily>_real.png` / the user's references
- 稽古庭の中：崩れ門 → 井戸塔 → 休み処（セーブ・ワープ）→ 渡り廊 → 梅香の離れ。スライディング・壁キック・スライディングジャンプで進むのは変わらない。/ The garden route: 崩れ門, 井戸塔, 休み処 (save + warp), 渡り廊, 梅香の離れ, still gated by slide, wall kick and slide jump.

## 前の公開版（2026-10-15 / test.45）

- 新エリア「月下の稽古庭」：崩れかけた月夜の庭と回廊、8部屋。/ New area 月下の稽古庭: a crumbling moonlit garden and cloister, 8 rooms.
  - 入口は中庭の新しい扉。/ Entered through a new door in the garden.
  - 部屋の順番：崩れ門 → 梅香の回廊（飛梅）→ 月見の井戸塔 → 休み処（セーブ・ワープ）→ 弓張りの中庭（ネーニア）→ 崩れた渡り廊 → 月光の舞台（リリィ）→ 星剣の広間（スターさん）。/ Room order: 崩れ門, 梅香の回廊 (飛梅), 月見の井戸塔, 休み処 (save + warp), 弓張りの中庭 (ネーニア), 崩れた渡り廊, 月光の舞台 (リリィ), 星剣の広間 (スターさん).
  - 進むには3つの技を使う。/ Three moves gate the way:
    - 崩れ門の低いすき間：スライディング / slide under the low gap in 崩れ門
    - 井戸塔：壁キックで登る / wall-kick up the 井戸塔
    - 渡り廊の6マスの穴：スライディングジャンプ / slide-jump the 6-tile hole in 渡り廊
- 腕試し：前作の仲間4人（もう元に戻っている）が、海音の戦いの勘を取り戻すために手合わせしてくれる。/ Sparring (腕試し): the four allies from the first game, already back to normal, spar with Umine to help her regain her battle sense.
  - 戦う前に一声かけてくれて、勝つとほめてくれる。その後、助言をくれて、星詠みの欠片を3つくれる。/ Each greets her before the fight. Win, and they praise her, give advice and hand over 3 star shards.
  - 勝った後もその部屋に残っていて、話しかけるとまた手合わせできる。負けたら全回復してやり直し。/ They stay in their arena afterwards; talk to them for a rematch. Losing restores HP and restarts.
  - 攻撃は前作のものを、続編の動きに合わせて作り直した。高いものはスライディングでくぐり、低いものはジャンプで越える。降ってくるものは、先に安全なすき間が見える。/ Attacks are the first game's, rebuilt for the sequel: slide under high ones, jump over low ones, and falling attacks show their safe gaps first.
  - 飛梅：ハート弾（高・低）、低空の急降下（くぐる）、急降下キックの後に地面の衝撃（跳ぶ）。/ 飛梅: high/low heart shots, a low-flying swoop (slide under), a dive kick that sends floor shocks (jump them).
  - ネーニア：高い矢・低い矢、矢の雨（安全なすき間が出る）、茨の矢（落ちる場所に先に印が出て、しばらく茨が残る）。/ ネーニア: high and low arrows, arrow rain with safe gaps, snare arrows (landing spots marked first; thorns linger).
  - リリィ：歌の波（跳ぶ。第2形態では左右両方へ）、音符（くぐる）、スターライトレイン（すき間が出る）。/ リリィ: song waves (jump; both ways in phase 2), notes (slide under), Starlight Rain with safe gaps.
  - スターさん：錬金剣の形が変わる前に紫に光り、頭の上に次の武器が出る。/ スターさん: before each weapon change, his alchemy sword flashes purple and the next weapon shows above his head.
    - 剣：波を飛ばす（跳ぶ）/ sword: a wave (jump)
    - 槍：突進（跳ぶ）/ spear: a lunge (jump)
    - 斧：跳んで叩きつけ、衝撃が走る（跳ぶ）/ axe: a leaping slam with shocks (jump)
    - 大鎌：投げると戻ってくる（2回くぐる）/ scythe: a boomerang (slide under it twice)
    - 弓：高い矢・低い矢 / bow: high and low arrows
  - HPが半分を切ると第2形態になる。/ Below half HP, each moves to phase 2.
- 絵：仲間の絵は `assets/<tobiume|neenia|lily|disaster>-sequel.png/.json` を使う。なければ前作の普通の絵を拡大して使い、それもなければ仮の絵を描く。背景は `assets/bg/wander_far.png` と `wander_mid.png`。/ Art: allies use the hi-res `-sequel` sheets, falling back to the first game's normal sheets scaled up, then to placeholder art. Backgrounds: `assets/bg/wander_far.png` and `wander_mid.png`.
- 直したところ：/ Fixes:
  - 地図の部屋の名前を短い名前にして、セルに収まる大きさにした（天文書庫のあたりで重なっていた）。/ Map labels now use short names and shrink to fit their cell (they overlapped around the observatory).
  - 天文書庫と稽古庭の奥の壁に、空の見えるアーチの開口部をあけた。これで背景の星空や月夜の庭が見える。/ The observatory and the sparring garden now have open arches in the back wall, so the starry sky and the moonlit garden show through.
- テスト：`tools/test-keiko.cjs` を追加した。4人それぞれについて、自動操作が予告だけを見てよけて勝つ（受けたダメージは0〜4）。ほかに、やり直し、戦闘中に部屋の出口が閉じること、欠片、再戦、セーブ、中庭の扉、絵の読み込み順を確かめる。/ Tests: added `tools/test-keiko.cjs`. For each of the four, a bot dodges from the telegraphs alone and wins, taking 0–4 damage. It also covers retry, the arena sealing during a fight, shards, rematch, save, the garden door and art-loader order.

## 前の公開版（2026-10-15 / test.44）

- 新エリア「書庫の奥」（星詠みの天文書庫）を追加した。6部屋：星詠みの螺旋書架 → 星図の書架 → 望遠鏡の回廊 → 星灯りの控え室（セーブ・ワープ）→ 天球儀のドーム（ボス）。/ New area 書庫の奥 (starry observatory-library), 6 rooms ending in the boss dome, with a save and warp room just before the boss.
  - 入口は書庫の内側（archiveInner）の上。倒れた書棚の塔を壁キックで登り、天井の穴から上の部屋へ。/ The entrance is above archiveInner: wall-kick up the toppled shelf tower and through the ceiling gap.
  - 壁キックの竪穴と、スライディングでしか通れない低いすき間で進む。敵は既存の6種を使い回す。/ Gated by wall-kick shafts and slide-only gaps; reuses the existing 6 foes.
  - 新しい背景 'cosmos'（星図の輪・星座・書架の影）。/ New 'cosmos' far layer (star-chart rings, constellations, shelf silhouettes).
- 縦のつながり：部屋の天井・床のすき間が、上下の部屋につながるようにした。/ Vertical exits: a gap in a room's top or bottom row now leads to the room above or below.
- ボス「ダーク星詠み」（闇に染まったギャルの星詠み）。/ Boss ダーク星詠み.
  - 星弾：高い弾はスライディングでくぐり、低い弾はジャンプでかわす。撃つ前に弾の高さの印が出る。/ Star shots: slide under high ones, jump over low ones. Markers show their heights before she fires.
  - 星の雨：安全なすき間が水色の柱で予告される。/ Star rain: the safe gaps are telegraphed as cyan columns.
  - ダッシュ：壁際まで下がってから、床に線を出して突進する。/ Dash: she backs off to the wall, shows a line on the floor, then charges.
  - HPが半分を切ると第2形態。弾が3発になり、雨のすき間が途中で移動し（移動先は黄色で予告）、ダッシュが往復になる。/ Below half HP, phase 2: 3 shots, rain gaps that move mid-attack (new spots flash yellow first), and a double dash.
  - 戦う前と倒した後に会話がある。負けたら全回復してやり直し。/ Dialogue before and after the fight. Losing restores HP and restarts the fight.
- 倒すと星詠みが拠点の客室に来て、強化屋になる。/ After her defeat, 星詠み moves to the hub bedroom and runs upgrades.
  - 新しい素材「星詠みの欠片」：敵が2体に1つ落とし、各部屋にも置いてある。/ New material 星詠みの欠片: every other defeated foe drops one, and more are placed in rooms.
  - 強化：最大HP（+2）、水弾の威力（+1）、スライディングの長さ。セーブに残る。/ Upgrades: max HP (+2), shot power (+1), slide length. Saved.
  - `MANSION_UPGRADES` に1行足せば項目を増やせる。/ Add a row to `MANSION_UPGRADES` to add an upgrade.
- 拠点を上下に広げた。/ The hub now extends vertically.
  - 上：煙突の竪穴を壁キックで登ると「星見の屋根裏」。/ Up: wall-kick the chimney into 星見の屋根裏 (the loft).
  - 下：床の跳ね上げ戸を「調べる」で開けて地下室へ。地下室の壁を壁キックすると戻れる。/ Down: use the floor hatch to drop into the cellar, and wall-kick back up.
- 絵：ボスは `assets/hoshiyomi_dark-sequel.json/png`（512pxのコマ、hi-res）があればそれを使う。なければ48pxの `hoshiyomi_dark.png` を使い、それもなければ仮の絵を描く。拠点の星詠みも同じ順（`hoshiyomi-sequel` → `hoshiyomi`）。/ Art: the boss prefers the hi-res `-sequel` sheets, falls back to the 48px sheets, then to placeholder art. The hub 星詠み uses the same order.
- テスト：`tools/test-hoshiyomi.cjs` を追加した。中身は縦の出入り、欠片、強化、絵の読み込み順、ボス戦の自動操作（予告を見てよけて勝つ）、負けたときのやり直し。/ Tests: added `tools/test-hoshiyomi.cjs`, covering vertical exits, shards, upgrades, art-loader order, a boss bot that reads the telegraphs, dodges and wins, and the retry after a loss.

## 前の公開版（2026-10-15 / test.43）

- 素材づくり担当の敵の絵6種（armor, crawler, turret, bat, book, slime と turret_bullet）を入れた。/ Added the art maker's 6 enemy sheets (armor, crawler, turret, bat, book, slime) plus turret_bullet.
- 当たり判定は絵の json の body から取り、体の中心を基準にした（armor は槍の分だけ cx がずれているため）。左向きのときは x を反転する。/ Hitboxes come from each sheet's json body box and pivot on the body centre (armor's spear shifts its cx). Facing left mirrors x.
- 盾持ちは、下にスライディングで通れる14pxのすき間を残した。/ The shield walker keeps a 14 px gap underneath that a slide passes through.
- どの敵も予告（telegraph）を見せてから攻撃する。予告と攻撃の長さは絵の ms から決まる。/ Every foe shows a telegraph before attacking; telegraph and attack lengths follow the sheet's ms.
  - armor：槍の突き / spear thrust
  - crawler：かみつき / bite
  - bat：急降下 / dive
  - book：かみつき / bite
  - slime：飛びかかり / lunge
  - turret：projectile_spawn から弾を撃つ / fires from projectile_spawn
- 攻撃が当たるのは、attack の active コマの間だけ。/ The attack box only hurts on the active frames.
- crawler は wall_rotation で壁に沿って回る。/ The crawler rotates to follow the wall using wall_rotation.
- ダメージで hurt、倒すと death のアニメ。/ Taking damage plays hurt; defeat plays death.

## 前の公開版（2026-10-15 / test.42）

- 見た目 / Visuals (`src/04j_stage_art.js`):
  - エリア別タイルセット：縁取り、ひび、欠け石、苔・真鍮・木の天板、深い壁の陰影。/ Per-area tilesets with caps, cracks, missing bricks, moss/brass/wood trims and depth shading.
  - 奥の壁：石積み・羽目板・レンガ・濡れ石・大理石。付け柱、廻り縁、腰壁つき。/ Back walls in ashlar, panelling, brick, wet stone or marble, with pilasters, crown mouldings and wainscots.
  - 窓から奥のパララックス（月夜、書架の奥、回る歯車、地下水の洞、星空）が見える。/ Windows look out on parallax far layers: a moonlit night, deep stacks, turning gears, a water cavern, a starfield.
  - 小物を自動配置（本棚、燭台、彫像、木箱、バルブ、配管、水晶、天体儀）。/ Props are placed automatically: bookshelves, candelabra, statues, crates, valves, pipes, crystals, orreries.
  - 灯り（暗さ＋燭台・窓・セーブ・ワープの光）、窓からの光の筋、ほこり、低い霧。/ Lighting: darkness lit by candles, windows, saves and warps, plus window god-rays, dust motes and low fog.
- 関門を「場所」にした / Gates became places (`scenes`):
  - 大広間：2本柱をやめ、崩れた大階段の芯を壁キックで登る。帰りは東壁の折れた螺旋階段。/ Hall: the two pillars are gone. You wall-kick up the core of a collapsed grand staircase, and come back down a broken spiral stair on the east wall.
  - 書庫：スライディングの穴は倒れた本棚の下。/ Archive: the slide gap runs under a fallen bookcase.
  - 時計塔：東の壁キックは昇降機の竪穴。/ Clock tower: the east wall-kick climb is an elevator shaft.
  - 貯水室：配管シャフト。/ Reservoir: a pipe chase.
  - 星灯り：崩れた橋をスライディングジャンプで越える。/ Star passage: the slide jump crosses a broken bridge.
- 敵 / Foes (`src/04k_foes.js`):
  - 部屋データの `foes` から種類ごとに出す。/ Foes spawn by kind from each room's `foes` list.
  - 新しい6種：
    - 盾持ち鎧：正面の弾は弾く。背後から攻撃するか、下をスライディングでくぐる。
    - 壁這い
    - 浮遊砲台：予告してから狙い撃つ。
    - コウモリの群れ
    - 跳ねる本ミミック
    - 天井から落ちる水滴スライム
  - New kinds:
    - shield walker: frontal shots bounce off. Hit it from behind or slide under it.
    - wall crawler
    - hover turret: it telegraphs, then fires an aimed shot.
    - bat swarm
    - hopping book mimic
    - drip slime that drops from the ceiling
  - 絵は `assets/enemies/<kind>.png/.json` に置き、manifest に名前を足すと差し替わる。それまでは仮のドット絵。/ To swap in real art, drop `assets/enemies/<kind>.png/.json` in place and add the kind to the manifest. Until then a placeholder pixel sprite is drawn.
  - 仕様は STAGE_GUIDE §9。/ The spec is in STAGE_GUIDE §9.

## さらに前の公開版（2026-10-15 / test.41）

- ステージ作り直し第1段階 / Stage rebuild phase 1:
  - 14部屋をすべて16pxタイルの格子に作り直した。/ All 14 rooms rebuilt on the 16 px tile grid.
  - 世界地図は256×240の画面セル単位で、ゲーム内マップは悪魔城風に部屋の大きさどおり描く。/ The world map uses 256×240 screen cells, and the in-game map draws each room at its real size, Castlevania-style.
  - 当たり判定と同じタイルをエリア別の色で描く。/ Collision tiles are drawn exactly as they collide, styled per area.
- 動き / Moves:
  - スライディングは高さ1行のすき間を通る（slideH 14）。/ The slide fits a 1-row gap (slideH 14).
  - スライディングジャンプ（Xのダッシュジャンプ式）を追加。/ Added the slide jump (like X's dash jump).
  - 壁キックで時計塔の東壁と大広間の東壁を登れる。/ Wall kicks climb the clock tower's east wall and the hall's east wall.
- 到達テスト / Reach test: `tools/reach.js` checks every save, door, warp, lever and boss, plus one-way traps.
  - 隠し小物を2つ追加：貯水室（壁キック）、星灯り（スライディングジャンプ）。/ Two secret breakables were added: the reservoir (wall kick) and the star passage (slide jump).
- 回廊の西端に段を付け、大広間に東から戻る道を作った（以前は落下か一方通行になっていた）。/ The gallery's west end got stairs, and the hall got a way back from the east. Before, these were a fall or a one-way trip.
- セーブキー `rockside2_mansion_v1` と `version:1` はそのまま。新しい床に合わない古い記録地点は、その部屋のセーブに移る。/ Save key `rockside2_mansion_v1` and `version:1` are unchanged. An old checkpoint that doesn't fit the new floor moves to that room's save.

## さらに前の公開版（2026-10-15 / test.40）

公開URL：https://kanata-games.github.io/rockside2/

- test.33〜40を公開版へ反映。回廊・書庫の拡張、上下階と昇降機、書庫先の４区画、禁書庫・青天戦を追加。
- 青天との仲直り後に交代ボタン／Cでバディを選択可能。爪２段は各２ダメージ、固有行動／Rで歌声、STEP／Shiftでバックステップ。HPは共通。
- 星詠みの護符はアスターテと青天から各１個（各最大HP＋２、合計最大HP20）。再戦で増えず、旧セーブの勝利記録を引き継ぐ。
- 公開用preview.htmlを再生成し、使用素材・ソース・回帰テスト・変更履歴を同期。固定入口index.htmlと前作rocksideは変更しない。
- セーブキーrockside2_mansion_v1とversion:1を維持。GitHub版とSites版のセーブは別オリジンのため共有されない。
- 以下の公開状況の記述は各開発時点の履歴。現在の公開範囲はこの節を優先。
- 検証：公開用ビルドの探索・戦闘・バディ・報酬・旧セーブ移行の自動テスト。スマホ実機のタッチ操作は未確認。

## Sitesテスト版 test.40（2026-10-10）

- 星詠みの護符はアスターテ・青天の初勝利で各１個、各最大HP＋２。合計２個で最大HP20。再勝利では増殖しない。旧セーブの勝利記録から個別取得へ移行。
- 青天との仲直り後にバディ追加。交代ボタン／Cで海音→アスターテ→青天。HPを共有し、青天は爪２段（各２ダメージ）、固有行動の歌声、STEPのバックステップを使える。既存の８コマを同一縮尺で使用。
- 永続アイテムの効果と取得元を定義に分離。今後の別種報酬を追加可能。
- 通常回帰テスト・新しい報酬移行／バディ動作テストで検証。スマートフォン実機のタッチ操作は未確認。

## Sitesテスト版 test.39（2026-10-10）

- 青天の勝利会話で「星詠みの護符」を贈る。既存のアスターテ報酬と同じ護符として、恒久効果は１回だけ最大HP＋２（16→18）。保存互換のため既存の `flags.astarteReward` を共用。どちらを先に倒しても重複強化しない。アスターテの本番勝利記録 `astarteFull` は独立して維持。
- test.38以前に青天を倒していて護符が未取得なら、歌声の間で次に話しかけた時に贈って記録する。再戦やセーブ初期化は不要。すでに所持している場合、再会／勝利を繰り返しても追加取得・強化・会話による全回復はしない。
- ボタンを「一緒に遊ぶ」に変更。画面内の「EX」「再戦」や、寄り道をシステムとして説明する探索メモを除去。再度の戦闘は同じHP64・同じ行動で、難易度を追加上昇させない。報酬も「離れている間も守ってくれる」物語のセリフで渡し、効果はステータスに表示する。
- VMで初勝利・保存再開・既存勝利からの受取・重複取得防止・両ボスの報酬順序・本筋とチェックポイントの保持を確認。既存の戦闘／操作のテストも継続。スマホ実機の操作確認は未実施。
- GitHub公開版はtest.32。Sitesテスト版：https://umine-adventure-2-test.norogon323.chatgpt.site

## Sitesテスト版 test.38（2026-10-10）

- 禁書庫の青天戦は本筋の進行条件を持たないEXルート。書庫での「隣にいてね」を受け、待っていた寂しさ→拗ねて追いかける→戦闘後の仲直りという会話に変更。初戦・敗北・勝利・再会・再戦はストーリーのみ。アスターテ／ダイスロールも戦闘前後の回避指南・技名の実況テロップを除去。移動やメニューの操作案内は探索時のまま。
- 青天HP40→64。接近速度0.9/1.3→1.65/2、基本待機36/24F→22/16F。飛びかかりは２／３連を維持し、予備姿勢26/20F、跳躍36/30F、着地16/12F。跳躍距離220/270、高さ80/90。狙いは予備姿勢開始時に固定し、発動後は追尾しない。
- 新技「地上突進→爪の振り払い」。予備姿勢28/22F→最大220/260の固定地点へ速度6/7→爪の構え14F→18Fの振り払い→26/20Fの隙。爪の判定は振り払い5～13F、前方62×26、３ダメージ。明るい３本の爪跡、足元の予告、走りの残像・粉塵・効果音。ジャンプと正面ガードで対処可能。既存８コマを共通倍率のまま使用し、キャラの等身を変えない。
- 歌は息継ぎ35/28F→低い波２／３回。半分以下は高い音符→20F後に低い波を40F間隔で３組。通常波46F間隔、速度3/3.35、音符3.4。歌声と跳躍・突進を巡回して攻撃の休みを減らす。戦闘中のテキストに攻略方法を出さず、身構え・光・音で予告する。
- 勝利済みのセーブでも歌声の間の青天と会話し「青天ともう一度遊ぶ（EX再戦）」から挑戦可能。仲直りの記録・本筋の進行・護符・近道・探索チェックポイントは維持。初戦や再戦のキャンセル、休止、再挑戦、退出に対応。再戦中は友好NPCを重ねて表示しない。新たなワープや進行必須条件、報酬は追加しない。
- 通常HP16の自動操作で、海音は着地点を避ける移動・突進を跳び越える操作・短いジャンプと水弾で3620F、最低HP13で勝利。アスターテは移動・ジャンプと鎌／星弾で1737F、最低HP6。立ち止まった水弾連射は再挑戦になる。これらは成立確認でありスマホ実機の難易度・操作感の評価は未確認。
- VM：既存機能に加え、物語セリフ、左右の固定突進、爪の予告／発生／隙、ジャンプ・ガードの実判定、HP半分のテンポ、残像のメニュー停止、通常HPの両キャラ勝利、保存済みEXの再戦／敗北キャンセル／退出／再開、本筋フラグ非干渉を確認。実Canvasで突進・爪・歌の描画を目視確認。ブラウザ／スマホ実機の操作は未確認。
- GitHub公開版はtest.32。Sitesテスト版：https://umine-adventure-2-test.norogon323.chatgpt.site

## Sitesテスト版 test.37（2026-10-10）

- 星灯りの渡り廊下の紫ワープ横・右奥の普通扉（1118,368）を「禁書庫・封じられた閲覧室」へ接続。1024×400の道中に封鎖された本棚、上階の回復小物、雑魚、ボス直前の記録の灯り（914,368）。奥の扉（993,368）から専用の「禁書庫・歌声の間」（512×288）へ。両方向に戻れる。紫ワープは追加せず全体３か所。
- 青天のボスはHP40を削り切る戦い。前作の土台に残る `aiSeiten` の「２連飛びかかり／息継ぎ→低い歌声波／HP50%以下の３連跳躍と高い音符→低い波」を参照し、続編の操作・画面・姿に合わせて別AIで実装。前作リポジトリは変更しない。
- 飛びかかりは身を低くしてから固定した着地点へ跳ぶ。黄色の着地予告を見て移動でき、発射後は追尾しない。HP半分から３連になり待機・着地の間が短くなる。歌は息継ぎ48F（半分以下40F）→低い波１回。半分以下は高い音符を先に出し、20F後に低い波、58F間隔で２組。立って高い音をやり過ごし、低い波を跳べる高さ・間隔。音波は濃い縁＋ピンク＋明るい芯、音符は金色。
- 通常HPで手強さを検証：立ち止まった水弾連射は816Fで再挑戦へ。着地点を避ける移動＋波のジャンプ＋水弾で1925F・最低HP10、アスターテの同じ移動＋鎌／星弾で1195F・最低HP7で勝利。これは自動操作による成立確認で、スマホ実機の操作感は未確認。ダメージは水弾１、鎌／星弾２、短い18Fのボス被弾間隔。鎌モデル・モーションはtest.32のまま。
- バトル中は扉を閉じ、メニューで完全停止・「戦闘をやめて禁書庫へ戻る」が使える。敗北はHPを戻した再挑戦会話。会話を閉じれば入口側に戻って退出できる。バディ交代・正面ガードも使用可能。戦闘中の探索チェックポイントを勝手に書き換えない。
- 勝利は `flags.seitenDefeated` を従来のversion:1セーブに保存。既存の進行・護符・近道・青天退室フラグを維持。再入室で戦闘を再発させず、青天が歌声の間に友好的なNPCとして残って会話する。禁書庫のさらに先は今回は未開通。新能力・強化報酬は今回追加しない。
- 続編の青天の肖像・待機シートを参照して戦闘８コマをbuilt-in image_genで新規生成。走り２・予備姿勢・上昇・飛びかかり・着地・息継ぎ・歌う姿。原画PNGを無加工で保存。描画は等しい450×400の切出し・共通倍率.125・足元アンカー。生成シートの余白が不均等のためセル境界を決め打ちせず、各姿が収まる矩形をメタデータで指定。`assets/seiten-sequel-combat.png` / `.json` / `-prompt.txt`。会話には既存の専用肖像を継続使用。
- ６列に増えたマップを画面内に収め、禁書庫と歌声の間・探索メモを追加。VMテスト：両キャラ道中、戦闘前会話・キャンセル、攻撃／被弾間隔、２／３連跳躍と予告固定、歌の順序・実当たり判定、ガード・交代、休止／再挑戦／退出、通常HP勝利、勝利フラグ／旧セーブ／NPC、８コマ左右描画、マップ、既存機能PASS。実Canvasで背景・着地・歌・弾・HPバーを目視確認。ブラウザ／スマホ実機の操作感は未確認。
- GitHub公開版はtest.32のまま。Sitesテスト版：https://umine-adventure-2-test.norogon323.chatgpt.site

## Sitesテスト版 test.36（2026-10-10）

- 書庫の下階（昇降機で下りて右奥の扉）から４区画を連結。封書の回廊（960×400）、時計塔の吹き抜け（640×640）、月映しの貯水室（1024×400）、星灯りの渡り廊下（1152×400）。普通の扉で往復できる探索ルート。
- 封書の回廊は上階の錠で通路の柵を開く。時計塔は３層の昇降機で下→中→上→中→下と移動し、離れた乗り場から呼び出せる。貯水室には予告の光→噴水→休止を繰り返す水圧トラップを３か所。高い足場で回避できる。
- 星灯りの上階の錠を開くと、書庫上階へ戻る恒久的な近道が開通。最後の区画に紫ワープを１か所だけ追加（全体３か所）。記録の灯り・雑魚・壊せる回復小物も配置。最奥の次の区間は未開通で施錠表示。
- 新４区画はカメラ倍率0.8。キャラ・武器・衝突の世界座標を維持し、風景全体を共通倍率で表示。新しい背景は既存素材とCanvas描画で本棚・時計と歯車・配管・星窓を配置。
- test.35で用意した青天の退室イベントが書庫奥への実際の入室で発動。錠２つ・近道・訪問先・ワープ先・青天退室は従来のversion:1セーブへ記録。旧セーブでは新フラグfalse。進行・HP強化・バディを保持。
- マップを新４区画と上下階に対応させ、探索メモも区間ごとに更新。メニューのマップは小さい画面で横スクロール可能。
- VMテストで両キャラの通常ジャンプによる連続通行、柵解除、３層昇降機、水圧の予告・ダメージ・足場の安全、近道往復、青天退室、ワープ、セーブ再開を確認。既存全機能PASS。実Canvasの描画を目視確認。スマホ実機の操作感・敵配置の難易度は今後調整。
- GitHub公開版はtest.32のまま。Sitesテスト版：https://umine-adventure-2-test.norogon323.chatgpt.site

## Sitesテスト版 test.35（2026-10-10）

- 青天さんの退室イベントを準備。書庫下階の奥の扉から実際に入室すると `flags.seitenLeftArchive=true`。以後、書庫の青天さんは描画・近接会話の両方から外れる。
- 退室フラグを既存version:1セーブで保存／読込。部屋の入り直し・死亡再開・続きを遊ぶ時も維持。旧セーブではfalse扱いで青天さんが残り、新規開始ではリセット。
- 奥の扉はまだ未開通。扉を調べただけ・昇降機利用・大広間／客室へ移動しただけでは退室しない。今回、奥の部屋そのものや解除イベントは追加しない。
- 開通準備：`MR.archive.extensionDoor` に `to:'archiveInner', at:[40,208], onEnterFlag:'seitenLeftArchive'` を設定。今後 `MR.archiveInner` を追加するとこの既存扉で入室でき、`mansionEnterDoor` が入室成功後にフラグを保存する。必要ならその時に `need` で解放条件を指定。通常の扉にも同じ入室イベントを使える。
- 実装テストでは奥の部屋を一時fixtureとして追加し、実際の「調べる」→入室→退室→書庫へ戻る→セーブ再開を確認。未開通・他の出口では発動しないこと、旧セーブ・新規開始もPASS。既存全機能テストもPASS。
- GitHub公開版はtest.32のまま。変更はSitesテスト版で確認する。

## Sitesテスト版 test.34（2026-10-10）

- 月影の書庫を512×240 → 960×480に拡張。本棚・読書机・椅子・上の足場・下階を配置。本棚や家具は背景で、衝突するのは床・足場・昇降機。
- 右奥（880,208）に青天さんを友好的なNPCとして追加。「調べる」で会話。控えめに甘える猫ちゃんとして、隣にいてほしいことや昇降機の使い方を話す。戦闘・バディ化・新能力は今回追加しない。
- 添付の黒猫・赤リボン・てんとう虫の姿を元に、新規４コマ透過待機素材を生成。627×627の共通セル・共通倍率.082・個別足元アンカー。元の添付絵は無加工で専用会話アイコンに使用。生成条件はassets/seiten-sequel-prompt.txt、描画定義はassets/seiten-sequel-idle.json。
- 奥の昇降機（x720〜784）は上階y208／下階y448を往復。「調べる」で乗り場に呼び、足場に乗ってもう一度「調べる」で反対の階へ。両キャラが乗れる。動作中もジャンプで降りられ、メニュー・会話中は停止。重なり時は安全に停止して押し潰さない。
- 下階には記録の灯り（592,448）と後の階へ繋ぐ施錠扉（918,448）を設置。新しい外部エリアはまだ接続しない。上階から施錠扉に誤反応しないよう高さも判定。
- 元の書庫入口・低い通路・水脈の紋章・客室への近道、旧進行セーブを維持。紫ワープ扉は増やさず既存２か所。test.33の回廊拡張を継承。
- VMテスト：両キャラ昇降機往復、遠隔呼出し、メニュー停止、ジャンプ離脱、安全停止、他室でのリセット、青天の友好会話・画像読込・足元・左右描画、下階記録再開、既存全機能PASS。実Canvasで描画を目視確認。スマホ実機での操作感は未確認。
- GitHub公開版はtest.32。Sitesテスト版確認後の明示指示で公開版へ反映する。

## Sitesテスト版 test.33（2026-10-10）

- 「客室の回廊」だけを改修。896×240 → 1536×400。上の渡り廊下・記録地点と、下の小ホール・階段を繋いだ往復できる道中。
- 高窓・手すり・シャンデリア・階段・家具を追加。背景小物は衝突しない。壊せる燭台・壺・箱の水滴回復を既存仕様で配置。
- 回廊だけカメラ倍率0.8（見える世界が横320×縦300、従来256×240の約1.25倍）。キャラ・武器・判定の世界座標は維持し、描画全体を同じ倍率で縮小。HUD・顔アイコン・操作パネルは従来寸法。
- 回廊内のMENU → ステータス下部「回廊の見渡し方」で通常／広い表示を切替。比較設定はセッション内だけ、進行セーブを変更しない。他の部屋は従来カメラ。
- 出口は右奥。大広間からの戻り先も右奥へ更新。回廊の旧記録（450,112）はそのまま使える。セーブキー・形式・ボス・バディ・既存２か所の紫ワープ扉を維持。
- 海音／アスターテの両方で、普通のジャンプによる左右往復と扉接続をVMテスト。カメラ境界・旧記録の再開・比較切替のセーブ非変更・既存機能もPASS。実Canvas描画を目視確認。スマートフォン実機の操作感は未確認。
- GitHub公開版はtest.32のまま。のろごんの確認後、指示があれば公開版へ反映。

## 以前の公開版（2026-10-08 / test.32）

公開URL：https://kanata-games.github.io/rockside2/ （2.0.0-test.32）

- チュートリアル後、操作パネルの交代ボタン／Cキーで海音・アスターテを切替。控えは画面外、HP共通。
- アスターテ：SHOTで鎌２段（各２ダメージ）、固有行動／Rで星弾、GUARD／Shift長押しで正面のダメージと吹き飛ばしを軽減。
- test.32を公開版へ反映。プレイヤーの通常姿と攻撃を同じ16コマシートに統一。鎌は各段40F・８コマの振り払い、各２ダメージ。前方鎌ガードと成功時の金属音、操作パネルの交代を継承。
- モーション確認：https://kanata-games.github.io/rockside2/astarte-motion.html （コマ送り・半速・左右反転。ゲーム進行に影響しない）。
- 海音：水弾１ダメージ。壁キック・壁滑り・スライドは海音専用。水脈の紋章取得で固有行動の水足場が解放される。
- 任意の本番戦・一度だけの永続HP強化・旧セーブ対応を継承。アスターテとの手合わせは海音、ダイスロールとの練習は操作中のキャラで行う。
- test.25〜27のダイスロール練習戦を公開版へ反映。談話室で「調べる」→「ダイスロールと練習する」。専用の遊戯室、現在のロルモデル、HP40、頭上のサイコロの出目による攻撃強化。
- 出目１〜３は１〜３連投、４でカードも３連射、５でサイコロ３ダメージ、６で予告付きチップの雨。HP半分以下で移動・弾速上昇。鎌・星弾・ガードの実戦確認ができる。
- 練習は何度でも再挑戦・MENUから拠点帰還可能。探索の記録と進行フラグを維持。本番戦のストーリー解放と報酬は今後の実装。
- test.19〜23の機能を公開版に反映し、test.24でMENUの表示を隠すCSSの適用範囲を修正。
- 今後もSitesテスト版で確認→ユーザーのOK後にGitHub公開版へ反映。テストURL：https://umine-adventure-2-test.norogon323.chatgpt.site
- 下のtest別記録は開発当時の履歴。現在の仕様と公開状態はこの節を優先する。

## 今回遊べる範囲

パーティーで寝落ちした海音ちゃんが、見知らぬ屋敷で目覚める冒頭から開始。右腕には謎の装備。前作で和解したポルターガイストの子は「カナタちゃん」（リネ）と呼ぶ。

客室と談話室を繋げた拠点・拠点地下室・回廊・吹き抜け・書庫・地下水路・中庭の７区画を探索する。魔法の壁キックで上階へ登り、スライディングで低い通路を抜け、書庫の封印を解除して近道と地下への道を開く。中庭の仮ボスを倒して出口へ到達するとテスト区間クリア。

- 水弾、壁滑り、壁キック、スライディング。
- ステータス／マップを切り替える一時停止メニュー、回復・記録クリスタル、チェックポイント再開。
- 屋敷背景と壁キック・滑走用の試作キャラクター素材。
- スマートフォン用の移動・SHOT・JUMP・SLIDE・MAP・調べるボタン。

## 操作

| 操作 | キー |
| --- | --- |
| 移動 | ← → / A D |
| ジャンプ・壁キック | Z / Space |
| 水弾 | X / J |
| スライディング（海音）／ガード（アスターテ） | Shift（ガードは長押し） |
| キャラ交代 | C |
| 固有行動（水足場／星弾） | R |
| 調べる・記録 | E / ↑ |
| 探索メニュー | Q / Tab |
| タイトルへ戻る | Esc（マップ表示中は閉じる） |

会話は Enter・SHOT・画面タップで進む。SKIP または Esc で会話を省略。記録は同じブラウザ内の localStorage（rockside2_mansion_v1）に保存し、タイトルの「つづきから」で再開。「はじめから」は新しい探索開始時にこの探索記録を置き換える。

## 開発

- src/04h_opening.js: 冒頭会話と演出。
- src/04i_mansion.js: 屋敷の部屋、物理、探索進行、描画。
- src/02c_sequel.js: 新モデルの表示と比較。
- assets/: 画像素材。
- tools/test-mansion.cjs: 当たり判定・登頂・封印・保存・ボス戦の回帰確認。

GitHubの固定入口index.htmlはpreview.htmlへ移動する。ゲーム本体はpreview.htmlへ生成し、固定入口をビルド出力で上書きしない。

```sh
python3 tools/build.py --out preview.html
node tools/test-mansion.cjs
```

Sites 用は `python3 tools/build.py --out dist/index.html` で生成し、assets/ を dist/assets/ に配置する。検証は `node tools/test-mansion.cjs ../dist/index.html`。dist/first-test/ は最初の訓練場を保存している。

探索の身体判定は通常14×26、滑走中14×18。立ち姿と歩行の元画像は JPEG の白背景を実行時に除去する試作素材で、追加アクションは透過 PNG。壁キック・滑走は各１ポーズ、敵とボスは仮素材。操作の感触・アニメーション・難度を今後調整する。

物理と進行は Node 上で確認済み。実機ブラウザでのタッチ操作と音声は未確認。

ステータス画面は MENU から開く。HP、能力、謎の右腕、現在地、記録地点、進行に合わせた探索メモを表示。上部タブでマップへ切り替え、「戻る」または MENU・Esc で閉じる。表示中は敵、弾、移動、各種タイマーを停止する。

スマホのメニューは下の操作エリアまで広げ、表示中は操作ボタンを隠す。タブと戻るは上部固定、中身は縦スクロール。マップもメニュー内で表示する。

拠点＋エリア選択の試作：客室右側の出口で攻略先メニューを開く。現時点の行き先は「月影の館・探索区画」の１つ。中庭の踏破後に探索を続けると拠点へ帰還。回廊を640から896へ広げ、階段状の上段寄り道と回復・記録地点を追加した。通常の移動・ジャンプ入力で上段への到達を検証。

スマホの左右移動・SHOT・JUMPを下段に、SLIDEを右側の上段へ配置。補助操作は上段にまとめた。タッチ判定も見た目のボタン位置に合わせ、空白のタップで移動や射撃が発生しないよう変更。375×650、390×700、320×568と横向き844×390でアクションボタンの重なり・画面外へのはみ出し・タッチ判定を確認した。実機操作感は引き続き確認する。

家具素材：生成済みの紺・金・月模様のベッドと木製扉を冒頭・探索画面に反映。assets/mansion-bed.png と mansion-door.png は元の透過PNGを保持し、描画時に外周余白を切り出す。寝姿の高さを寝具に合わせて調整。扉は閉じた１枚を共通使用し、施錠時は暗い色と水色の封印を重ねる。画像読み込みに失敗した場合のみ仮描画を使う。

### test.8：歩行４コマ
- `assets/umine-walk.png`：透過PNG、2×2の歩行差分。元の待機・ジャンプ素材は維持。
- 移動距離で４コマを順番に再生。停止・空中・スライドでは歩行をリセットし、メニュー中は進めない。地上で射撃しながらも足運びを継続する。
- 128pxセルに足元を合わせ、48px表示へ縮小。読み込み中は旧２コマで表示する。

### test.9：ダイスロール（ロルちゃん）
- サイコロ頭は怪人を演じる被り物。中身は前作の白髪・赤目の女の子。今回は被り物姿の友好NPCとして登場し、敵・ボスとしては扱わない。
- 冒頭で「おやおや……目覚めましたか……？」と登場。海音は声でロルちゃんと気づく。右腕の由来や屋敷へ来た理由は未確定のまま残す。
- 客室の x=180 付近で「調べる / E」。会話中は全体メニューに文章と次へボタンを表示して探索を停止。封印解除・踏破後は台詞が変わる。
- 新規 `assets/roru-masked-idle.png` は1774×887の真アルファ透過PNG、待機・一服２コマ。足元を64pxセルに合わせ48px描画。煙は別描画。

### test.10：海音の会話・ステータスアイコン
- 既存の４表情を保持し、各セル内の400px正方形で顔と帽子のつばへ寄せた切り取りに変更。
- 会話アイコンはゲームの低解像度バッファを介さず、画面の実解像度へ直接描画。ロルの顔も同じ描画経路を使用。
- ステータスは白背景の全身JPEGから、透過の笑顔アイコンへ変更。新規の画像生成や元素材の加工は行わない。

### test.11：通常探索画面の海音アイコン
- 探索画面のHP欄の左へ、会話・ステータスと同じ笑顔アイコンを表示。名前とHPを右へ移動し、部屋名・封印表示と分離。
- 会話用の高解像度描画を通常探索のHUDでも呼び出す。表情画像の読み込み中・失敗時は既存キャラ画像で代替し、空欄にしない。

### test.12：広がる拠点
- 客室を256→640pxへ拡張。元の攻略先扉（x=231）を残し、右へ歩くとアーチ越しに談話室へスクロール。ロルを談話室x=390に移動。ベッド・記録の灯り・書庫への近道は維持。
- 談話室右端の扉x=580で、安全な拠点地下室（384px）へ移動。左扉から談話室へ戻れる。記録の灯りと閉じた奥の扉を配置。攻略区画の地下水路とは別室。
- `HUB_NPCS` に部屋・座標・名前・描画・会話関数を集約。今はロルのみ。他の前作キャラは続編用の素材・会話を確認してから、この配列へ追加する。
- 新しい部屋は `MR` に追加して双方の `doors` を接続。`hub:true` が拠点区画の印。マップ訪問総数は区画数から計算。地下室の `extension` は将来の接続位置で、現段階では閉じた扉。
- セーブのキーとversion=1は維持。旧客室・既存攻略区画の記録から再開可能。新地下室も記録・再開を検証。

## test.13 — 小物素材と破壊・回復
- `assets/mansion-props.png` は生成画像を透過整理し64pxセル4列×4段へ正規化した素材。`mansion-props.json` に実際の描画矩形を保存。燭台・花瓶・箱に通常/ひび/破損、本・椅子・机・本棚・額、水滴・月の雫を収録。
- 談話室の仮家具を素材へ差し替え。椅子/机/本棚は背景装飾で移動を妨げない。
- 攻略区画に壊せる小物を配置。水弾2発で破壊、破片演出と水滴が出る。接触でHP3回復（上限16）、15秒後消滅。部屋へ入り直すと小物復活、拾い物は部屋移動で消える。メニューでは停止。
- 月の雫は素材のみ。MPと消費アクションは未実装。既存セーブ形式/本番index.html/前作は変更しない。
- 最初の回廊の入口から右へ進むと燭台がある。SHOT2発→水滴へ歩いて体力回復を確認する。
- 自動検証：破壊、弾消費、通り抜け、回復上限、メニュー停止、部屋再入場、既存探索ルート。スマホ実機の表示/操作は未確認。

## test.14 — 月影のワープ扉
- エリア選択を廃止。館の全7部屋は普通の扉で連続して繋がり、紫のワープ扉が補助移動網になる。
- 客室の普通の回廊扉はx180。旧x231扉は紫のワープ。客室/回廊は初期登録、他の扉は近づくと自動登録。全ワープ地点はMANSION_PORTALSに定義。
- 紫の扉の前で「調べる」→発見済みの行き先をタップ。メニューのワープ一覧も扉から離れている間は閲覧のみ。現在地/未発見へは飛べない。封印前でも地下の入口側へ戻れるが、封印は越えられない。
- 登録済み扉を既存version1セーブのportalsへ追記。旧セーブは客室/回廊のみを初期登録し、既存進行/記録地点を保持。
- 到着時はHP/記録地点を変更せず、短時間の接触保護。部屋の敵/小物は通常入室と同じ扱い。
- マップの紫の印は登録済みワープ。スマホ用一覧は48px以上のタップ領域、スクロール可能な既存全画面メニュー内。
- 検証：普通の扉、全地点往復、発見とセーブ再開、未発見/扉外/同地点の拒否、メニュー停止、封印を迂回しないこと。前作/本番index.htmlは変更しない。

## test.15 — アスターテの手合わせと案内役
- 前作の案内/記録担当、星導の聖堂で救出された仲間として継承。添付キャラクター絵を参照し通常姿の新規素材を生成、`astarte-sequel.png`（192×160セル、2列2段、96×80描画・足元[96,148]）、顔アイコン、フレーム規格JSONを追加。
- 旧中庭の仮番人をアスターテのチュートリアルへ置換。中庭で右へ進むと会話、読み終えると手合わせ開始。低い星=ジャンプ、高い星=スライディング、鎌は40F予告後の近距離一撃（距離を取る/ジャンプで回避）。練習ゲージ16。
- 致死ダメージ直前でアスターテが止める→回復・励まし→会話後再挑戦。通常探索の死亡/記録再開は変更なし。会話中は敵/弾も停止し、会話キャンセルで勝手に手合わせを開始しない。
- 終了は撃破ではなく練習完了。全回復、会話、門開放。既存flags.bossを再利用し、旧クリア済み記録はクリア済みとして扱い、再戦を強制しない。
- 手合わせ後は客室右奥/大広間上階/地下水路/中庭に案内役として出現。ワープ、壁キック、紋章による封印解除の説明を進行別に行う。ロルちゃんの会話・顔と切り替え可能。
- 会話/通常姿/攻撃/終了姿の土台のみ。新しい獲得能力や追加エリアはまだ実装していない。
- 検証：会話開始/停止/キャンセル、非致死再挑戦、低/高の星、鎌の地上命中/空中回避、終了保存、案内とロルの切替、全従来探索/ワープ/小物テスト。Canvasで素材配置を確認。スマホ実機操作は未確認。
- テスト導線：新しく開始→書庫で紋章→水路→中庭で右へ進む。旧クリア済みセーブは案内役だけが出るため、手合わせ確認は新しい冒険で行う。

## test.16 — 要所のワープと星詠みのボス広場
- 紫のワープ扉を客室の拠点と地下水路のボス前に限定。普通の扉の接続は保持。地下水路側は紋章取得後に発見・利用可能。旧登録から廃止地点を除き、旧中庭の記録位置y208は新しい床y256へ移行。
- アスターテの冒頭は「月は出ているか…。」から、知っている月と異なる光の伏線へ。海音への呼びかけ、練習、再挑戦、各地の案内は優しい丁寧な言葉遣いに変更。
- 中庭を640×288へ拡張、夜空と月、石造りの広場を描画。手合わせ中は入口側の境界を閉じ、ボスを意識してカメラを調整。
- 練習ゲージ32。低い/高い月弧、予告後の踏み込みと鎌（3ダメージ）、跳躍による位置変更、ゲージ半分以下で位置を予告する星屑の雨。致死直前の中断・回復と、勝利後の案内役は保持。
- 探索中の足元の常設黒帯と操作説明を撤去。調べる表示と一時通知はHUDの下へ移動し、足場を隠さない。
- 自動検証：旧記録の移行、ワープの発見・往復・封印条件、通常探索ルート、射撃での練習完了、月弧、鎌の命中/空中回避、跳躍、星雨の予告と半分到達直後の安全性、会話と案内。Canvasで広場・素材配置を確認。スマホ実機操作は未確認。

## test.17 — アスターテの追加モーションと本格的な手合わせ
- 既存の姿・顔・待機を継承し、`assets/astarte-actions.png`に12コマを追加。走行4、鎌の構え/横振り/振り上げ/戻し、跳躍の踏切/上昇/下降、詠唱。旧4コマと合わせ16コマの素材。行動に応じて切替え、移動コマは移動距離で進む。
- 4列3段、192×160共通セル、足元[96,148]、表示96×80。全ポーズを共通倍率で整理し、 crouchを拡大しない。足元/体幹基準と武器の安全余白を確保。素材は真アルファ透過で、鎌の軌跡・予兆はゲーム側の別描画。
- ゲージ40、射撃命中後18Fの短いガード。間合いを詰める走行、方向を予告時に固定した踏み込み、連続する攻撃判定、半分以下の二連鎌、海音の反対側への跳躍、予告地点へ5個の星雨。移動中の接触もダメージに。月弧と星雨の速度を調整。
- 追尾は準備段階のみ。攻撃開始後の鎌方向と星雨の着地点は固定し、ジャンプ/スライド/移動で回避可能。鎌の範囲は前方中心、予告と実際の振りを別モーションで表示。ガードは点滅で表示。
- 非致死の練習中断、会話中停止、勝利後の全回復・案内、旧クリア記録は維持。前作と本番index.htmlは変更なし。
- 検証：従来の探索/ワープ/小物/保存、12コマの両向き描画、射撃ガード、方向固定の踏み込み、二連鎌。方向を合わせて立ち撃ちする入力は867Fで再挑戦、ジャンプ/スライド/星雨からの移動を使う通常HPの入力は902Fで練習完了。難易度の感触とスマホ実機の確認は未実施。
- 素材生成：内蔵画像生成で既存アスターテを参照。「同一外見・共通サイズ・透過・4列3段、走行4/構え/横振り/振り上げ/戻し/踏切/上昇/下降/詠唱、武器までセル内、文字/焼き込みエフェクトなし」。実装用セル規格はastarte-actions.jsonに保存。

## test.18 — 半分までのチュートリアルと任意の本番戦
- 初回中庭のチュートリアルはHP40→20で終了。戦闘停止、全回復、案内役と門開放。本番戦の後半技を初回に強制しない。初回の会話でも終了条件を説明。
- クリア後、拠点の談話室（x612）にいるアスターテへ話しかけると「本番の手合わせに挑む」が出る。会話を読む/閉じるだけでは開始しない。選択で中庭へ移動しHP40→0の任意戦。既存test.17の攻撃構成・速度・ガード・後半技は保持。
- 本番の初勝利で「星詠みの護符」を自動取得し、最大HPが永続で16→18。ステータスの恒久強化欄に表示。flags.astarteFull/astarteRewardをversion1の既存保存へ追加し、全回復/復帰/水滴/雑魚回復/HUD/ステータスが最大HPを共通参照。報酬は一度だけ、再戦で無限に強化しない。
- 本番は何度でも再戦可能。勝利会話後は談話室へ戻る。敗北は友好的な練習中断と再挑戦、途中中断はメニューの「手合わせをやめて拠点へ」。勝利/中断は探索の記録地点、封印、踏破状態を保持。案内NPCと戦闘中のアスターテは重複表示しない。
- 月弧は濃紺の外縁/鮮やかな紫/明るい芯。星雨は濃紺の外縁/橙と黄/白い芯。鎌の軌跡も輪郭と芯を追加し、雨の予兆は明るい柱と金色の床印へ。攻撃判定と難易度は変更せず視認性を改善。
- 旧クリア記録はチュートリアル済みとして本番に挑める。新報酬は遡及付与せず本番初勝利で取得。未取得の古い記録は最大HP16のまま。
- 検証：HP21では続行、次の命中で初回終了。本番HP20では継続、0で報酬。拠点選択、中断/再挑戦、報酬重複防止、保存/再開/全回復/水滴/復帰、旧保存移行、従来の探索・ワープ・小物・通常入力での本番勝利。Canvasで新しい攻撃色を確認。スマホ実機の操作確認は未実施。前作と本番index.htmlは変更なし。


## GitHub Pagesの普段の入口（2026-10-07）
- 続編の `index.html` を最新 `preview.html` へ移動する固定入口に変更。普段のURLは `https://kanata-games.github.io/rockside2/`。ゲーム本体の更新は引き続きpreview.htmlとsrc/assetsへ反映し、この入口を古い前作ベースのHTMLで上書きしない。
- GitHub Pagesは有効化済み。main / (root) から公開。main更新後のPages公開処理を確認する。
- 別テストサイトは削除せず維持。前作 `kanata-games/rockside` は変更なし。続編の旧index.htmlはGit履歴から復元可能。


## test.19 — バディ操作試作（テスト版のみ）
- 控えは画面外。チュートリアル終了後、HUDの交代ボタン／Cキーで海音とアスターテを交代。HP・位置・速度・被弾無敵を共有し、交代は回復や無敵を付けない。30F再交代待ち、攻撃・スライド・会話中は交代不可。
- アスターテは既存12コマを移動・跳躍・鎌攻撃に再利用。SHOTで予備動作8F→鎌、一振りにつき各敵に2ダメージ、背後には当たらない。壊せる小物にも一振り1ヒット。今回は星魔法は未実装。移動判定と探索能力は海音と共通。
- 本人との手合わせは海音に戻し、交代不可。操作中は重複した案内役アスターテを表示しない。海音に戻せば会話できる。再開時は海音から。旧セーブを維持。
- GitHub公開版はtest.18を維持。まずSitesテストURLで確認後、承認された変更のみ公開版へ反映する。READMEのGitHub Pages入口設定はGitHub側を維持し、古いローカルREADMEで上書きしない。
- 検証：既存探索／ボス／永続強化テスト＋交代・近接・小物・両向き描画テスト。スマホ実機操作感はユーザー確認待ち。


## test.20 — アスターテ鎌２段コンボ（テスト版のみ）
- SHOT：横払い（2ダメージ）→追加入力／長押しで刈り取り（3ダメージ）。２撃目は振り下ろす既存コマと金色の軌跡を使用し、届く範囲を約13px拡大。各段は各敵に１回だけ当たる。
- １撃目後半へ２撃目を先行入力できる。２撃目後に硬直を置き、攻撃中の移動を55%に抑える。被弾で攻撃中断、メニュー中はコンボ時間停止。
- プレイヤー表示を64→80に拡大。共通足元アンカーと全コマのスケールを維持。判定・既存探索ルートは変更しない。
- 既存ゲーム／バディの検証と両方向コンボ・タップ／長押し・単発ダメージ・中断テストを実施。スマホでの見た目／操作感は確認待ち。GitHub公開版は未反映。


## test.21 — 鎌の斬撃エフェクト（テスト版のみ）
- 仮の線を、先端が尖る三日月状の斬撃へ変更。横払いは紫／白、刈り取りは金／白の広い弧。暗い輪郭・細い内側の残光・先端の星で暗い背景でも見える形にした。
- 命中位置に12Fの星の閃光と火花。準備中は刃先に小さな光、振り終わりは短い減衰。左右を鏡映し、描画だけで乱数やゲーム状態を変更しない。
- 攻撃の威力・判定・速度・セーブ形式を維持。Canvasで２段の描画を確認し、既存検証＋エフェクト寿命／メニュー停止／描画不変性を検証。スマホ実機の見え方は確認待ち。公開GitHub版へは未反映。


## test.22 — 近接バランス／キャラ固有行動（テスト版のみ）
- 海音の水弾は１ダメージ、鎌は１撃目／２撃目とも各２ダメージへ統一。２撃目の広い範囲と斬撃表現は維持。
- スマホ操作部の左上に固有行動ボタン追加（PCはR）。海音は水脈の紋章で水足場解放：前方に40×6の足場を４秒、再使用５秒。壁／既存地形へのめり込みは作成拒否。部屋移動で消える。
- アスターテは２ダメージの星弾、再使用75F。通常鎌とは別ボタン。固有行動の待ち時間は交代／部屋移動でリセットしない。新規開始／再開では待ち時間ゼロ。
- 魔法の壁キック、壁滑り、スライディングは海音専用。仲間は通常ジャンプで移動する。低い通路／壁登りでは海音へ交代する。足場は両キャラで乗れるが作成は海音だけ。
- 手合わせ中は水足場を禁止、開始時に既存足場も除去し、既存ボスのバランスを保つ。新能力は既存sealフラグで解放し、旧セーブの進行度をそのまま使う。
- 既存探索・ボス・バディ・エフェクトテストに加え、足場の解放／作成拒否／着地／消滅／メニュー停止、キャラ専用移動、星弾２ダメージ／待ち時間／部屋移動／セーブを検証。スマホ実機の固有ボタンは確認待ち。GitHub公開版は未更新。


## test.23 — アスターテの鎌ガード（テスト版のみ）
- 既存SLIDEボタンを、アスターテ操作時はGUARDへ切替。長押し（PCはShift）で地上ガード。新しいボタンは増やさない。
- 正面からの攻撃のみダメージ半減（切り捨て、最低１）、吹き飛ばし2.8→0.8、浮き上がりなし。ガード時の被弾無敵36F、通常75Fを維持。背後・真上からの攻撃は通常ダメージ。
- ガード中移動30%、鎌／星弾は不可。攻撃／詠唱中と空中ではガード成立しない。予備動作素材で鎌を構え、前方に月弧、受け止めた時に星の閃光。
- ポインターIDを追跡し別指の解放で解除しない。解放／キャンセル／フォーカス喪失／メニュー／会話／交代／部屋移動でガード保持を解除する。
- 既存テスト＋左右正面軽減／背後・垂直被弾／移動・攻撃制約／多指・キー解除／メニュー・交代・部屋・blur復帰を検証。スマホ実機の長押し感は確認待ち。GitHub公開版へは未反映。


## test.24 — 公開版へ反映
- test.19〜23をまとめて公開入口preview.htmlとsrcへ反映。既存素材を使い、前作リポジトリと続編の固定index.htmlは維持。
- MENUの非表示CSSをメニューが開いている時だけに限定。交代／固有ボタンも同じ範囲で隠す。
- 探索・ボス・保存・バディ・コンボ・固有行動・ガード・MENU適用範囲の検証を実施。実機タッチの継続確認と今後の難易度調整は残る。

## test.25（Sitesテスト版・GitHub公開版はtest.24のまま）

談話室のダイスロールに話しかけ「ダイスロールに挑む」で月影の遊戯室へ。選択中の海音／アスターテを保ち、32HPの任意ボス戦を繰り返し遊べる。歩行・サイコロ投げ・カード投げ・予告付き跳び越え・半分HPで連続投げ。鎌各２／水弾１／星弾２と正面ガードを確認できる。負けると再挑戦、勝利後は拠点へ。MENUから途中で戻れる。追加報酬や攻略フラグ変更はなく、探索の記録地点を維持する。

## test.26（Sitesのみ）

ダイスロール戦は練習戦として明示。今の拠点用モデル `roru-masked-idle.png` を戦闘でも使用し、歩行の上下動・構えと投げの傾きで動きを補う（新しい攻撃コマの生成は未実施）。旧作ボスモデルの優先使用を撤廃。HP半分からの高速化・追加投げを外し、単発の予告付き攻撃でアスターテの操作を確認する。本番戦は今後ストーリー進行に合わせて別に解放する予定。現在は本番戦への導線・報酬・解放フラグを追加していない。

## test.27（Sitesのみ）

練習という物語上の扱いを維持しつつ、本番を見据えた強さへ再調整。ロルちゃんは現在の拠点モデルを継承、HP40。毎周期で頭上のサイコロを回し、出目確定から36フレーム後に攻撃開始。１＝単投、２＝２連投、３＝３連投、４＝カードも３連射、５＝サイコロ３ダメージ、６＝予告付きチップの雨追加。後半HPでは移動・弾速が上昇。出目は１〜６ランダム、描画中は抽選しない。低いサイコロはジャンプ、高いカードは海音のスライド／アスターテの正面ガード、チップの雨は床の予告から離れて回避。探索フラグ・報酬・本番解放条件は今回追加していない。GitHub公開版はtest.24のまま。

## 公開反映記録（2026-10-08 / test.27）

ユーザー確認後、test.25〜27を `kanata-games/rockside2` のsrc・テスト・preview.htmlへ反映。固定入口index.html、全既存素材、前作rocksideは維持。公開用preview.htmlを再ビルドし、探索／保存／ボス／バディ／鎌／能力／ガード／ダイス出目６種／練習の再挑戦・中断を検証。test.25〜27の「Sitesのみ」等は当時の履歴で、現在の公開状態は冒頭の節を優先する。次は実機で難易度・攻撃の見え方を確認し、ロルの追加攻撃コマと本番戦解放を検討する。

## test.28（Sitesテスト版・GitHub公開版はtest.27）

キャラ交代ボタンをHUDから操作パネルへ移動。縦画面は固有／SLIDE・GUARDの間、横画面は操作列の中央。112px幅・44px以上のタップ領域、交代先の名前を表示。PCのCキーと既存交代条件は継承。

アスターテの鎌は各段34F、準備12F・振り14F・戻し8Fへ延長。次段受付と描画・軌跡も同期、各２ダメージと射程は維持。ガード成功時に専用の金属音＋短い火花音を再生。ガード入力だけ／背後被弾／無敵中の再接触では成功音なし、SOUND OFFを尊重。音声台詞は未追加。自動検証は既存戦闘・コンボ、ガード成功音とミュート、スマホ縦横４サイズの交代ボタン重なり確認を含む。実機で動きの見やすさと音量を確認する。

## test.29（Sitesテスト版・GitHub公開版はtest.27）

ガード用の専用立ちコマ `assets/astarte-guard.png` を追加。攻撃前の背中側の鎌を使う構えから、両手で柄を握り、身体の前方へ鎌を立てて受ける姿に変更。既存キャラクターシートを参照し内蔵画像生成で作成（透過、単一コマ、右向き、白髪・猫耳・紺の星月ローブ・同じ鎌、刃と柄を前方、背景・文字・エフェクトなし）。元画像をそのまま保存、ゲーム描画で共通倍率と足元アンカーを合わせる。左右は全身を鏡映。ガード成立時と受け止めた直後の短い閃光中に使用。読み込み前は前方横構えの既存コマで代替。防御弧と火花は前の刃・柄側へ合わせた。被弾軽減・音・攻撃コマ・ボスの構えは維持。素材の生成はbuilt-in image_gen、規格はJSON参照。

## test.30（Sitesテスト版・GitHub公開版はtest.27）

アスターテの攻撃専用８コマを追加。１段目４コマは構え・前方への振り・振り払い・戻し。２段目４コマは前へ伸ばす・伸ばした鎌を構える・引き抜いて刈る・戻す。各段34F、各２ダメージ、射程・コンボ受付は維持。２段目の命中と振り音を残り18Fの引き戻し開始へ移動（１段目は22F）。黄金の刃の軌跡も外へ伸びてから手元へ戻る形へ変更。専用シートは元の透過画像をそのまま保存し、各コマの切り出し範囲・足元アンカー・共通倍率をJSONと描画で管理。左右鏡映、読み込み前は既存攻撃コマ。ボスの攻撃コマとガード専用コマは継承。生成は内蔵image_gen、参照はastarte-actions.png、配置修正を１回実施。ゲームCanvas描画と既存戦闘の自動検証を実施。実機タッチでの視認性確認は引き続き必要。

生成プロンプト（初回）:
Use case: stylized-concept. Asset type: transparent pixel-art game sprite sheet, 8 animation frames in exactly 4 columns by 2 rows, no labels or grid lines. Reference image is identity and pixel style reference. Make the SAME white-haired blue-eyed cat-eared gentle witch Astarte, navy hood and star-pattern robe, white fluffy tail, ornate navy/gold crescent scythe. All 8 full-body sprites face RIGHT in side-view, same head size/body height, planted feet at identical baseline in each equally sized cell, hips centered at same local x. Leave ample margins, no overlap between cells, show entire scythe in every frame. Crisp pixel art matching reference, no effects or shadows. TOP ROW four sequential frames of FIRST horizontal scythe sweep: 1 windup with scythe behind shoulder; 2 midway moving long shaft forward across chest; 3 fully horizontal powerful outward sweep with blade far to right; 4 follow-through at lower front. BOTTOM ROW four sequential frames of SECOND harvesting attack: 1 reach scythe shaft diagonally forward with two hands; 2 full extension far right, crescent blade facing BACK toward her, ready to hook; 3 visibly pull the hooked crescent scythe back toward her waist using both hands, blade halfway back, leaning backward; 4 completed inward harvesting sweep with blade close in front, recovery. Distinct weapon orientations and arm poses for each frame. Keep costume, identity, proportions and weapon design invariant. Actual transparent alpha background. No text, no energy trails, no extra props. Landscape canvas.

配置修正プロンプト:
Use case: precise-object-edit. Edit this 8-frame sprite sheet ONLY to correct its game atlas layout. Preserve all eight poses, faces, costume and scythe designs. EXACT evenly divided 4-column by 2-row atlas. Every full sprite including its whole scythe MUST fit entirely within its own equal cell with 10% transparent gutter on all four sides. No weapon crosses a cell boundary and no two sprites overlap. Reduce sprite size uniformly to achieve this. All bodies same size, hips at 38% cell width and feet baseline at 85% cell height, weapon extends into empty right portion of each cell. Top row four outward sweep frames; bottom row four reach, full extension, pull-back, completed harvesting sweep frames. No labels, no lines, no shadows or effects. Actual alpha transparency.

## 公開反映記録（2026-10-08 / test.30）

ユーザー確認後、test.28〜30の交代パネル・鎌の速度／８コマ／刈取り軌跡／命中タイミング・前方鎌ガード・成功音をGitHub公開版へ反映。新規の透過PNG２点と規格JSONをassetsへ追加し、preview.htmlをsrcから再ビルド。固定入口index.htmlと前作rocksideは維持。セーブキーrockside2_mansion_v1と形式version:1を継承し、保存内容の消去・移行は実施しない。既存進行／ワープ／永続強化／旧セーブ読込を含む自動検証は通過。公開版とSitesテスト版の記録は別オリジンなので共有されない。次は公開版で実機の振り／刈取りとガードの感触を確認する。

## test.31（不採用・test.32で解除。GitHub公開版はtest.30）

アスターテの描画モデルを統一。待機・歩行４段・攻撃・ガード・ジャンプ／落下・星弾で同じBODYシートと１本の鎌を使用し、拠点NPCとボスにも同じモデルを適用。BODYは12コマ、鎌は独立した透過PNG。全動作で同じ鎌の刃／柄の形と倍率を維持し、手元の位置と角度で動かす。１段目は横への振り払い、２段目は左向きの内刃を前方に伸ばしてから手元へ引き抜いて刈る。エフェクトは実際の内刃の座標を追跡。ガードは鎌を前方に立て、柄が床下へ出ない構え。BODYの共通倍率と足元アンカー、鎌の柄基準と刃追跡点はassets/astarte-unified.jsonに記録。各段34F・各２ダメージ・射程・命中フレーム・進行・セーブは継承。新素材が読み込めるまではtest.30のモデルで代替し、旧素材は削除しない。画像は内蔵image_genで作成、元PNGのアルファを保持して保存。

検証：既存戦闘／探索／保存／報酬／バディ／ガード／ダイスロールの自動検証、共通鎌の左右反転、引き戻し時の刃の移動、前方ガード、描画による状態変更がないことを通過。実際のゲームCanvasで待機・歩行・ガード・星弾・左右２段攻撃を描画確認。ブラウザ実機の操作感と手元の細かな見え方は今後確認する。GitHub公開版はユーザー確認後に更新する。

BODY生成プロンプト（内蔵画像生成）:
Use case: stylized-concept. Asset: game pixel sprite BODY ONLY atlas, EXACT 4 columns x 3 rows, 12 equal cells with wide transparent gutters. Reference supplies character identity, costume, body proportions and pixel art style. Same gentle white-haired blue-eyed cat witch Astarte, navy hood white cat ears, navy white gold star robe, white fluffy tail. Draw NO SCYTHE, NO WEAPON, NO staff, NO effects: game renders the weapon separately. Hands grip an imaginary staff, believable hands. ALL face right, same head/body size, centered hips and feet at common baseline within cell. Full body every cell, 20% margin. Crisp SMALL game pixel-art readability, simplify tiny gold detail. Row1: idle relaxed hands together in front; walk left leg forward; walk passing legs; walk right leg forward. Row2: attack windup hands at upper chest reaching back; swing transition hands in front of chest; full forward extension BOTH arms toward right at chest height; pulling back hooked weapon BOTH hands close to waist. Row3: guard both hands grip invisible vertical pole immediately in front of torso; jumping upward; falling; spellcasting forward free hand. Maintain EXACT same body size/costume/face across poses. Transparent alpha background, no text, no weapon silhouettes.

鎌生成プロンプト（内蔵画像生成）:
Use case: stylized-concept. Asset type: one separate transparent game pixel-art weapon sprite, scythe only. Reference weapon identity: ornate navy and antique gold crescent scythe used by the cat witch. Draw ONE scythe horizontally, shaft to LEFT, entire crescent blade at RIGHT. Straight slender gold/dark-navy shaft from far left to a large ornate navy-and-gold head near far right. The LARGE bright SILVER crescent cutting EDGE is on the LEFT-facing concave inner side of the head: it visibly hooks toward the wielder at left. Single crescent cutting blade, sharp pointed tips curve left. Clearly readable white silver cutting edge, navy outer spine, restrained gold celestial ornament, matching reference style. Entire weapon visible with ample transparent margin. No hands, no person, no background, no glows, no text. Pixel art with crisp simple silhouette suited to 60px long in game. Weapon must remain a single rigid consistent object, not multiple examples.


## test.32（GitHub公開版へ反映）

プレイヤー用アスターテの頭身を基準に、通常・歩行・攻撃・空中・前方構えを同じ16コマの透過シートに揃えた。手と柄と刃を身体と一体で描画し、test.31の独立した巨大な鎌とボス/NPCまで変える処理を解除。拠点NPC・ボスは従来モデルを保持。

- １段目は振りかぶり→頭上→横への振り払い→低い振り終わり→戻し、８コマ40F。２段目は低い構えから逆順に返す振り払い、８コマ40F。引き抜きの刈取りは使わない。
- 全コマ共通倍率0.175、足元アンカー固定。通常の身体はゲーム内で約35px高（旧プレイヤー立ち姿と同程度）。しゃがみ・腕上げで輪郭の高さは自然に変わる。
- 両手と鎌に独立した拡縮・回転を加えない。エフェクトは刃先の小さな光で、鎌の形を隠さない。シート12番は後方構えなので防御に使わず、15番の前方構えを採用。
- １振り２ダメージ、射程49/62pxを保持。命中は１段目の横振り20F残り、２段目の返し28F残りに合わせた。保存キー/書式・強化・進行度を保持。
- `astarte-motion.html` は旧通常姿と新プレイヤーを並べ、再生・一時停止・コマ送り・半速・左右反転・歩き・ガードを確認できる。ゲームの記録には触れない。
- 内蔵image_genで素材生成。元RGBAを加工せず保存。シート/メタデータ：`assets/astarte-player-sweep.png` / `.json`。最終生成指示：`assets/astarte-player-sweep-prompt.txt`。
- 検証：屋敷回帰テスト全項目、２段の入力予約/各１回命中/中断/停止、全姿勢と両方向の実描画、メタデータ境界・共通倍率、セーブ互換を確認。ゲーム実描画と拡大したコマをCanvasで目視し、隣のコマの混入を避ける境界を調整。実機のタッチ操作とブラウザでの見え方は未確認。

テストURL：https://umine-adventure-2-test.norogon323.chatgpt.site
モーション確認：https://umine-adventure-2-test.norogon323.chatgpt.site/astarte-motion.html


## 公開反映記録（2026-10-08 / test.32）

ユーザーの「実装して」の指示により、Sitesで確認したtest.32をGitHubの普段遊べる版へ反映。プレイヤー用の16コマ全身シートと描画規格・生成指示、各段８コマ40Fの鎌の振り払い、前方ガード、コマ送り比較ページを追加。test.31の別体鎌とボス頭身への変更は採用しない。固定入口index.htmlは保持し、preview.htmlをsrcから再ビルドした。保存キーrockside2_mansion_v1 / version:1を変更せず、記録の消去は行わない。READMEと自動テストも更新。公開用ビルドの探索・戦闘・バディ・ガード・２段命中・保存互換を検証。ブラウザ実機のタッチ操作は未確認。前作kanata-games/rocksideには変更なし。


## 星詠みちゃん・モデル素材試作（2026-10-09）

友達の新キャラクター。確認済み設定は「星詠みちゃん」「ギャル」のみ。添付シートの黒髪/紫の差し色・赤い目・星の飾り・白い上着・黒い上下・厚底ブーツを参照し、内蔵image_genで待機２＋歩行４のゲーム向けSDシートを生成。元RGBAを加工せず`assets/hoshiyomi-idle-walk.png`へ保存。初回/修正プロンプトは同名`-prompt.txt`。

規格は`assets/hoshiyomi-idle-walk.json`。元シート1536×1024、512×512等分セル３列２段。描画時の共通倍率0.075で身体約36ゲームpx、個別足元アンカー。64×64は想定描画枠で、正確な64pxラスタ画像への書き出しは未実施。待機は通常/ウインク、歩行は踏み出し/膝上げを交互に表示。細かな足運びとゲーム内の印象は今後調整する。

素材確認ページ：`hoshiyomi-model.html`。アスターテのプレイヤー立ち姿と同じ画素で並べ、待機/歩き・コマ送り・左右を確認。星詠みをゲーム内NPCへ配置する処理、台詞、星読み能力、戦闘は未追加。ゲームはtest.32、セーブと進行は変更しない。GitHub公開版へは未反映。

## Credits
- Font: **Dela Gothic One** — Copyright 2020 The Dela Gothic Project Authors (https://github.com/syakuzen/DelaGothic). Licensed under the SIL Open Font License 1.1 (`assets/fonts/DelaGothicOne-OFL.txt`). Shipped as a subset (cut-in move/boss names only).
