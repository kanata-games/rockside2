// test.58: UI checks — 48px only (no size-comparison picker), phone map viewport, opening uses stage art.
const fs=require('fs'),assert=require('assert');const html=fs.readFileSync(require('path').join(__dirname,'..','preview.html'),'utf8');
assert(!/modelPicker|data-model=|set_sequel_model|サイズ比較/.test(html),'size comparison picker is gone');
assert(/SEQUEL_MODEL = \{size:48/.test(html)&&/Only the 48px model exists/.test(html),'48px is the only model');
assert(/id="mMapView"/.test(html)&&/data-mz="in"/.test(html)&&/data-mz="out"/.test(html)&&/data-mz="me"/.test(html)&&/data-mz="fit"/.test(html),'map has pan/zoom viewport with ＋/－/現在地/全体');
assert(/pointermove/.test(html)&&/MAPV\.pinch/.test(html)&&/'wheel'/.test(html),'map supports drag, pinch and wheel zoom');
assert(/function openingArtDraw/.test(html)&&/like:'bedroom'/.test(html)&&/like:'gallery'/.test(html)&&/artDrawBack\(r,X,Y,view\)/.test(html),'opening draws the in-game stage art');
console.log('PASS ui: 48px-only, phone map viewport, opening on stage art.');
// test.59: title 「海音ちゃんの冒険2」
assert(/<title>海音ちゃんの冒険2/.test(html),'<title> is 海音ちゃんの冒険2');
assert(/const TITLE_TEXT='海音ちゃんの冒険2'/.test(html)&&/assets\/title\/title_bg\.png|'title_bg\.png'/.test(html)&&/title_umine\.png/.test(html)&&/title_logo\.png/.test(html)&&/assets\/title\/title\.json/.test(html),'title art wired with fallback');
assert(/GAME_VERSION\.toUpperCase\(\)/.test(html)&&!/drawText\('VER ' \+ GAME_VERSION,/.test(html),'version line uses glyphs the pixel font has');
const j=JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','assets','title','title.json'),'utf8'));assert(j.landscape&&j.portrait,'title.json has landscape + portrait layouts');
console.log('PASS ui: title 海音ちゃんの冒険2 with art + fallback, readable version line.');
// test.61: two-phase boot + pixel Umine
assert(/early=\/assets\\\/title\\\/\|assets\\\/fonts\\\//.test(html)&&/B\.release=function/.test(html)&&/window\.__bootArmed = true/.test(html)&&/window\.__bootLoading\) acc = 0/.test(html),'boot holds game images until start, then NOW LOADING freezes the loop');
assert(/function titleArtOn\(\)\{return state==='title'&&\(!!TITLE_ART\.bg\|\|TITLE_ART\.failed===true\)/.test(html),'old in-canvas title never shown');
const um=JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','assets','umine_px.json'),'utf8'));for(const a of ['idle','run','jump','fall','shoot','slide','wall','wallkick','hurt','airshoot','runshoot','blink'])assert(um.anims[a],'umine_px anim '+a);
assert(/upxMansionDraw\(\)\)\{\}else\{const darkSw/.test(html)&&/mansionDarkOn\(\)\)\)return false/.test(html),'pixel Umine with old-sheet + dark fallback');
console.log('PASS ui: title-first boot, NOW LOADING after start, pixel Umine mapped with fallbacks.');
