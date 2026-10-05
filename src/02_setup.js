
// =====================================================================
//  Globals / setup
// =====================================================================
const VW = CONFIG.viewW, VH = CONFIG.viewH, TS = CONFIG.tile;
const ROWS = 15, SCREEN_COLS = 16;
const T_EMPTY = 0, T_ROCK = 1, T_GIRDER = 2, T_DOOR = 3;
// ---- current stage (rebuilt by loadMap when an area is chosen on the stage select) ----
let MAP = [], COLS = 0, LEVEL_W = 0, grid = new Uint8Array(0), ROOM_X = 0;
const spawns = [];     // enemies {type,c,r}
const allySpawns = []; // allies {type,c,r}
let START_C = 2, START_R = 12, CP_C = 0, CP_R = 12, ROOM_COL = 0, BOSS_C = 0, BOSS_R = 12;
const DOOR_ROWS = [];
function loadMap(screens) {
  for (let s = 0; s < screens.length; s++) {
    if (screens[s].length !== ROWS) throw new Error('Screen ' + s + ' has ' + screens[s].length + ' rows');
    for (let r = 0; r < ROWS; r++) if (screens[s][r].length !== SCREEN_COLS) throw new Error('Screen ' + s + ' row ' + r + ' bad width');
  }
  MAP = [];
  for (let r = 0; r < ROWS; r++) { let row = ''; for (let s = 0; s < screens.length; s++) row += screens[s][r]; MAP.push(row); }
  COLS = MAP[0].length; LEVEL_W = COLS * TS; grid = new Uint8Array(COLS * ROWS);
  spawns.length = 0; allySpawns.length = 0; DOOR_ROWS.length = 0;
  START_C = 2; START_R = 12; CP_C = 0; CP_R = 12; ROOM_COL = 0; BOSS_C = 0; BOSS_R = 12;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = MAP[r][c]; let t = T_EMPTY;
    if (ch === '#') t = T_ROCK; else if (ch === '=') t = T_GIRDER;
    else if (ch === 'D') { t = T_DOOR; ROOM_COL = c; DOOR_ROWS.push(r); }
    else if (ch === 'P') { START_C = c; START_R = r; }
    else if (ch === 'C') { CP_C = c; CP_R = r; }
    else if (ch === 'B') { BOSS_C = c; BOSS_R = r; }
    else if (ch === 'W' || ch === 'H' || ch === 'F') spawns.push({ type: ch, c: c, r: r });
    else if (ch === 'A' || ch === 'N' || ch === 'S' || ch === 'K' || ch === 'R') allySpawns.push({ type: ch, c: c, r: r });
    grid[r * COLS + c] = t;
  }
  ROOM_X = ROOM_COL * TS;
  spawns.sort((a, b) => a.c - b.c); // enemies ordered left -> right
  allySpawns.sort((a, b) => a.c - b.c);
  // the right-most Astarte is the checkpoint
  for (const a of allySpawns) if (a.type === 'A') { CP_C = a.c; CP_R = a.r; }
}
loadMap(AREAS[0].map);

// =====================================================================
//  Canvas: low-res buffer scaled with nearest neighbour to the screen
// =====================================================================
const screen = document.getElementById('screen');
const sctx = screen.getContext('2d', { alpha: false });
const buf = mkCanvas(VW, VH);
const g = buf.getContext('2d');
g.imageSmoothingEnabled = false;

function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hash(a, b) { let h = Math.imul(a, 73856093) ^ Math.imul(b, 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; }

// ---------------------------------------------------------------------
//  Pixel font (5x5 bitmap), pre-rendered to a colour atlas
// ---------------------------------------------------------------------
const GLYPHS = {
A:'0111010001111111000110001',B:'1111010001111101000111110',C:'0111110000100001000001111',D:'1111010001100011000111110',
E:'1111110000111101000011111',F:'1111110000111101000010000',G:'0111110000100111000101111',H:'1000110001111111000110001',
I:'1111100100001000010011111',J:'0011100001000011000101110',K:'1000110010111001001010001',L:'1000010000100001000011111',
M:'1000111011101011000110001',N:'1000111001101011001110001',O:'0111010001100011000101110',P:'1111010001111101000010000',
Q:'0111010001101011001001101',R:'1111010001111101001010001',S:'0111110000011100000111110',T:'1111100100001000010000100',
U:'1000110001100011000101110',V:'1000110001100010101000100',W:'1000110001101011101110001',X:'1000101010001000101010001',
Y:'1000101010001000010000100',Z:'1111100010001000100011111',
'0':'0111010011101011100101110','1':'0010001100001000010001110','2':'1111000001011101000011111','3':'1111000001011100000111110',
'4':'1001010010111110001000010','5':'1111110000111100000111110','6':'0111010000111101000101110','7':'1111100001000100010000100',
'8':'0111010001011101000101110','9':'0111010001011110000101110',
' ':'0000000000000000000000000','!':'0010000100001000000000100','.':'0000000000000000000000100',':':'0000000100000000010000000',
'-':'0000000000011100000000000','/':'0000100010001000100010000','?':'0111010001001100000000100',"'":'0010000100000000000000000',
',':'0000000000000000010001000','>':'0100000100000100010001000','(':'0001000100001000010000010',')':'0100000100001000010001000',
'+':'0000000100011100010000000'
};
const FONT_CHARS = Object.keys(GLYPHS).join('');
const FONT_IDX = new Int16Array(128).fill(-1);
for (let i = 0; i < FONT_CHARS.length; i++) FONT_IDX[FONT_CHARS.charCodeAt(i)] = i;
const FONT_COLORS = { w: '#ffffff', y: '#ffd84a', c: '#7ff0ff', r: '#ff5d5d', k: '#120e24', g: '#8be07a', b: '#8fa2d8' };
const FONT_CI = {};
const fontAtlas = mkCanvas(FONT_CHARS.length * 6, Object.keys(FONT_COLORS).length * 6);
(function buildFont() {
  const fg = fontAtlas.getContext('2d'); let ci = 0;
  for (const k in FONT_COLORS) {
    FONT_CI[k] = ci; fg.fillStyle = FONT_COLORS[k];
    for (let i = 0; i < FONT_CHARS.length; i++) {
      const bits = GLYPHS[FONT_CHARS[i]];
      for (let p = 0; p < 25; p++) if (bits.charCodeAt(p) === 49) fg.fillRect(i * 6 + (p % 5), ci * 6 + ((p / 5) | 0), 1, 1);
    }
    ci++;
  }
})();
function textWidth(str, s) { return str.length * 6 * s - s; }
function drawText(str, x, y, col, s, align) {
  s = s || 1; const ci = FONT_CI[col] * 6;
  if (align === 'c') x -= (textWidth(str, s) / 2) | 0; else if (align === 'r') x -= textWidth(str, s);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i); const gi = code < 128 ? FONT_IDX[code] : -1;
    if (gi >= 0) g.drawImage(fontAtlas, gi * 6, ci, 5, 5, x + i * 6 * s, y, 5 * s, 5 * s);
  }
}
function drawTextShadow(str, x, y, col, s, align) { drawText(str, x + s, y + s, 'k', s, align); drawText(str, x, y, col, s, align); }

// ---------------------------------------------------------------------
//  Sprite helpers: programmatic pixel art -> small canvases
//  (Procedural fallback art, one function per character: artHero / artWalker /
//   artHopper / artFlyer here, artTobiume / artAstarte / artNeenia / artSeiten in
//   02b_chars.js. Real sprite sheets (assets/*.png, embedded at build time) replace
//   them via SHEET_DEFS/loadSheets and drawPlayer / drawBoss / drawAllySprite.)
// ---------------------------------------------------------------------
function outlineCanvas(c, rgb) {
  const cg = c.getContext('2d'), w = c.width, h = c.height;
  const id = cg.getImageData(0, 0, w, h), d = id.data, a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (a[i]) continue;
    if ((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w])) {
      d[i * 4] = rgb[0]; d[i * 4 + 1] = rgb[1]; d[i * 4 + 2] = rgb[2]; d[i * 4 + 3] = 255;
    }
  }
  cg.putImageData(id, 0, 0);
}
function flipCanvas(c) { const f = mkCanvas(c.width, c.height), fg = f.getContext('2d'); fg.translate(c.width, 0); fg.scale(-1, 1); fg.drawImage(c, 0, 0); return f; }
function whiteCanvas(c) { const f = mkCanvas(c.width, c.height), fg = f.getContext('2d'); fg.drawImage(c, 0, 0); fg.globalCompositeOperation = 'source-in'; fg.fillStyle = '#fff'; fg.fillRect(0, 0, c.width, c.height); return f; }
function makeSprite(w, h, artFn, outline) {
  const c = mkCanvas(w, h), cg = c.getContext('2d');
  const R = (col, x, y, ww, hh) => { cg.fillStyle = col; cg.fillRect(x, y, ww, hh); };
  artFn(R, cg);
  if (outline) outlineCanvas(c, outline);
  const wr = whiteCanvas(c);
  return { r: c, l: flipCanvas(c), wr: wr, wl: flipCanvas(wr), w: w, h: h };
}
function pick(spr, face, white) { return face >= 0 ? (white ? spr.wr : spr.r) : (white ? spr.wl : spr.l); }

// ---- HERO: 海音 UMINE - blue-haired water witch (28x30, faces right) ----
// Placeholder pixel art evoking her silhouette: big navy witch hat with
// lavender band, long light-blue hair, white dress, navy cape, moon staff.
const HERO_W = 28, HERO_H = 30, HERO_CX = 16; // HERO_CX = body centre x in the right-facing frame
function artHero(R, pose, shoot) {
  const hat = '#2a2856', hatD = '#1a1838', band = '#b9adf5', gold = '#f0c860', hair = '#8fb4f5', hairD = '#5a7ed0',
    skin = '#ffe2cf', eye = '#6a4fd0', dress = '#f6f6ff', dressS = '#c9d2ee', hem = '#a9d8ff', cape = '#24244a',
    capeIn = '#8f86d8', boot = '#2a2438', crys = '#4fa8ff', rib = '#4a4ab0';
  const hurt = pose === 'hurt', jump = pose === 'jump';
  const by = pose === 'run1' ? -1 : 0; // body bob
  // long hair behind
  R(hair, 8, 11 + by, 7, 9); R(hair, 7, 14 + by, 3, 8); R(hairD, 7, 20 + by, 3, 2); R(hairD, 9, 13 + by, 1, 7);
  // cape behind body (flutters up when airborne)
  if (jump || hurt) { R(cape, 5, 15 + by, 9, 7); R(capeIn, 4, 15 + by, 2, 5); R(gold, 7, 17 + by, 1, 1); R(gold, 10, 19 + by, 1, 1); }
  else { R(cape, 9, 15 + by, 6, 10); R(cape, 7, 20 + by, 4, 6); R(capeIn, 6, 23 + by, 2, 3); R(gold, 9, 22 + by, 1, 1); R(gold, 11, 18 + by, 1, 1); }
  // legs + boots
  if (pose === 'stand') { R(skin, 14, 25, 2, 2); R(skin, 17, 25, 2, 2); R(boot, 13, 27, 3, 3); R(boot, 17, 27, 3, 3); }
  else if (pose === 'run0') { R(skin, 12, 25, 2, 2); R(skin, 19, 25, 2, 2); R(boot, 10, 27, 4, 3); R(boot, 19, 27, 4, 3); }
  else if (pose === 'run1') { R(skin, 15, 24, 2, 2); R(boot, 14, 26, 4, 3); }
  else if (pose === 'run2') { R(skin, 14, 25, 2, 2); R(skin, 17, 25, 2, 2); R(boot, 13, 27, 3, 3); R(boot, 18, 27, 4, 3); }
  else if (jump) { R(skin, 13, 24, 2, 2); R(skin, 18, 23, 2, 2); R(boot, 12, 26, 3, 3); R(boot, 18, 25, 4, 3); }
  else if (hurt) { R(skin, 12, 25, 2, 2); R(skin, 19, 25, 2, 2); R(boot, 11, 27, 3, 3); R(boot, 19, 27, 3, 3); }
  // white dress with navy corset + blue hem
  R(dress, 13, 16 + by, 6, 5); R(rib, 15, 16 + by, 2, 1);
  R(cape, 13, 19 + by, 6, 1); R(gold, 15, 19 + by, 1, 1);
  R(dress, 12, 20 + by, 8, 3); R(dress, 11, 22 + by, 10, 2); R(dressS, 11, 23 + by, 10, 1); R(hem, 11, 24 + by, 10, 1);
  // head: face, bangs, eye
  R(skin, 14, 11 + by, 6, 5);
  R(hair, 13, 10 + by, 8, 2); R(hair, 13, 12 + by, 2, 4); R(hair, 20, 11 + by, 1, 5);
  if (hurt) R('#6a4a5a', 17, 13 + by, 2, 1);
  else { R(eye, 17, 12 + by, 2, 2); R('#ffffff', 17, 12 + by, 1, 1); }
  R('#ffb6c8', 18, 14 + by, 1, 1);
  // witch hat (tip bends backwards) with lavender band, star and crystal charm
  R(hat, 5, 0 + by, 2, 1); R(hat, 6, 1 + by, 3, 1); R(hat, 8, 2 + by, 4, 1); R(hat, 9, 3 + by, 5, 1);
  R(hat, 10, 4 + by, 6, 1); R(hat, 10, 5 + by, 7, 1); R(band, 10, 6 + by, 9, 2);
  R(hat, 6, 8 + by, 18, 1); R(hatD, 7, 9 + by, 17, 1); R(gold, 13, 4 + by, 1, 1);
  R(gold, 4, 1 + by, 1, 2); R(crys, 3, 3 + by, 2, 2);
  // arm + crescent-moon staff
  if (shoot) {
    R(dress, 18, 16 + by, 4, 2); R(skin, 22, 16 + by, 1, 2);
    R(gold, 19, 17 + by, 6, 1);
    R(gold, 24, 14 + by, 2, 1); R(gold, 26, 15 + by, 1, 4); R(gold, 24, 19 + by, 2, 1); R(crys, 24, 16 + by, 2, 2);
  } else {
    if (jump || hurt) { R(dress, 18, 14 + by, 2, 4); R(skin, 20, 14 + by, 1, 2); }
    else { R(dress, 18, 16 + by, 2, 4); R(skin, 20, 19 + by, 1, 2); }
    R(gold, 21, 9 + by, 1, 18);
    R(gold, 21, 3 + by, 2, 1); R(gold, 23, 4 + by, 1, 4); R(gold, 21, 8 + by, 2, 1); R(crys, 21, 5 + by, 2, 2);
  }
}
// ---- WALKER: "TRUNDLEBOT" (16x22): body + treads in the bottom 16px, sensor mast on top ----
function artWalker(R, f) {
  const T = 6; // body offset (mast/sensor head live in the top 6px)
  R('#6b7288', 4, 3, 2, 4 + T - 3); R('#9aa3b8', 4, 3, 1, 4 + T - 3);             // mast
  R('#5b6278', 2, 0, 6, 3); R('#9aa3b8', 3, 0, 4, 1); R('#ff5d5d', 5, 1, 2, 1);  // sensor head + lamp
  if ((f & 1) === 0) R('#ffd08a', 6, 1, 1, 1);
  R('#ff9a3c', 2, 3 + T, 12, 8); R('#c8621e', 2, 9 + T, 12, 2); R('#ffd08a', 3, 4 + T, 5, 1);
  R('#ffffff', 7, 5 + T, 5, 4); R('#10223a', 10, 6 + T, 2, 2);
  R('#3b3b4f', 1, 11 + T, 14, 5); R('#5a5a75', 2, 11 + T, 12, 1);
  for (let i = 0; i < 3; i++) R('#b0b0cc', 2 + i * 4 + f * 2, 13 + T, 2, 2);
}
// ---- HOPPER: "SPRINGO" (16x22), f=0 crouch, f=1 airborne; eyes on stalks ----
function artHopper(R, f) {
  const T = 6, dy = f ? -4 : 0, ey = f ? 0 : 3; // body offset, airborne lift, eyeball top
  R('#3a9a3a', 4, ey + 3, 2, 8 + T - ey - 3 + dy); R('#3a9a3a', 10, ey + 3, 2, 8 + T - ey - 3 + dy); // stalks
  R('#5fd35a', 3, ey, 4, 4); R('#5fd35a', 9, ey, 4, 4);                                            // eyeballs
  R('#ffffff', 4, ey + 1, 2, 2); R('#ffffff', 10, ey + 1, 2, 2); R('#10223a', 5, ey + 1, 1, 2); R('#10223a', 11, ey + 1, 1, 2);
  R('#5fd35a', 2, 7 + T + dy, 12, 6); R('#3a9a3a', 2, 11 + T + dy, 12, 2); R('#b6f5a0', 3, 8 + T + dy, 4, 1);
  R('#1d4a1d', 6, 10 + T + dy, 4, 1);
  if (!f) { R('#9aa3b8', 5, 13 + T, 6, 1); R('#5b6278', 5, 14 + T, 6, 1); R('#9aa3b8', 5, 15 + T, 6, 1); }
  else { for (let i = 0; i < 7; i++) R(i & 1 ? '#5b6278' : '#9aa3b8', 6, 9 + T + i, 4, 1); }
}
// ---- FLYER: "BUZZKITE" (16x14) ----
function artFlyer(R, f) {
  R('#9aa3b8', 7, 2, 2, 3);
  if (f) R('#e6ecff', 1, 1, 14, 1); else R('#e6ecff', 4, 1, 8, 1);
  R('#a45ee5', 3, 5, 10, 6); R('#7a3cb8', 3, 9, 10, 2); R('#d6a8ff', 4, 6, 4, 1);
  R('#ffffff', 8, 6, 4, 3); R('#ff3b3b', 10, 7, 2, 1);
  R('#6b7288', 7, 11, 2, 2);
}
const SPR = { hero: {}, walker: [], hopper: [], flyer: [], tobi: { dark: {}, normal: {} }, ally: {} };
const OUT = [16, 14, 40];
(function buildSprites() {
  const poses = ['stand', 'run0', 'run1', 'run2', 'jump', 'hurt'];
  for (const p of poses) SPR.hero[p] = [makeSprite(HERO_W, HERO_H, R => artHero(R, p, 0), OUT), makeSprite(HERO_W, HERO_H, R => artHero(R, p, 1), OUT)];
  for (let f = 0; f < 2; f++) {
    SPR.walker.push(makeSprite(16, 22, R => artWalker(R, f), [26, 15, 10]));
    SPR.hopper.push(makeSprite(16, 22, R => artHopper(R, f), [12, 30, 14]));
    SPR.flyer.push(makeSprite(16, 14, R => artFlyer(R, f), [30, 12, 44]));
  }
  // water bullet (droplet pointing right; flipped copy used for left)
  SPR.shot = makeSprite(8, 6, R => { R('#bfeaff', 0, 2, 2, 2); R('#3a8fd8', 2, 1, 5, 4); R('#3a8fd8', 3, 0, 3, 6); R('#7fd6ff', 3, 1, 4, 4); R('#ffffff', 5, 1, 1, 2); }, null);
  SPR.ebullet = makeSprite(5, 5, R => { R('#ff7ad9', 1, 0, 3, 5); R('#ff7ad9', 0, 1, 5, 3); R('#ffffff', 2, 1, 1, 3); R('#ffffff', 1, 2, 3, 1); }, null);
  // Dark Tobiume's magic: heart + star bullets (8x7 / 7x7)
  SPR.heart = makeSprite(8, 7, R => { R('#c0206a', 1, 0, 2, 1); R('#c0206a', 5, 0, 2, 1); R('#c0206a', 0, 1, 8, 3); R('#c0206a', 1, 4, 6, 1); R('#c0206a', 2, 5, 4, 1); R('#c0206a', 3, 6, 2, 1); R('#ff7ab8', 1, 1, 2, 2); R('#ffffff', 1, 1, 1, 1); }, [40, 6, 30]);
  SPR.star = makeSprite(7, 7, R => { R('#a040d0', 3, 0, 1, 7); R('#a040d0', 0, 3, 7, 1); R('#a040d0', 2, 1, 3, 5); R('#a040d0', 1, 2, 5, 3); R('#ff9ad8', 3, 2, 1, 3); R('#ff9ad8', 2, 3, 3, 1); R('#ffffff', 3, 3, 1, 1); }, [30, 6, 40]);
})();
