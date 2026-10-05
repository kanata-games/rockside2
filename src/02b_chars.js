
// =====================================================================
//  CHARACTERS (part 2): boss 闇落ち飛梅 + allies, procedural placeholders.
//  Each character has its own art function and its own draw function
//  (see 05_render.js) so real sprite sheets can replace them.
// =====================================================================

// ---- BOSS: 闇落ち飛梅 Dark Tobiume (40x40, faces right, centre x=20) ----
// pink magical girl with white angel wings; 'dark' palette = fallen, 'normal' = rescued
const TOBI_PAL = {
  dark:   { hair: '#9a3a68', hairD: '#5e1e40', hairL: '#c0608a', bow: '#7a1848', bowD: '#4a0c2c', skin: '#dcb4c0', eye: '#ff2a5a', eyeHi: '#ff9ab0',
            dressW: '#8a7890', dressP: '#6e2450', dressPL: '#9a3a70', wing: '#8e8098', wingD: '#5a4c68', glove: '#a898b0', boot: '#6e2450', gem: '#2a8a70', mouth: '#5a1a30', out: [30, 8, 24] },
  normal: { hair: '#ff8fc0', hairD: '#e0609a', hairL: '#ffc0dc', bow: '#ff4f98', bowD: '#c02a6a', skin: '#ffe4d8', eye: '#d0602a', eyeHi: '#ffffff',
            dressW: '#ffffff', dressP: '#ff8cc0', dressPL: '#ffc4de', wing: '#fffaf4', wingD: '#e0d0c8', glove: '#ffffff', boot: '#ff6aa8', gem: '#40e0b0', mouth: '#d06070', out: [110, 40, 70] },
};
const TOBI_W = 40, TOBI_H = 40;
const TOBI_POSES = ['idle', 'fly', 'attack', 'kick', 'hurt', 'defeat'];
function artTobiume(R, pose, c, f) {
  // back wing (f toggles wing up/down)
  if (f === 0) { R(c.wing, 4, 5, 12, 4); R(c.wing, 1, 8, 15, 4); R(c.wing, 2, 12, 13, 3); R(c.wing, 5, 15, 9, 2); R(c.wingD, 3, 8, 11, 1); R(c.wingD, 3, 12, 11, 1); }
  else { R(c.wing, 5, 12, 11, 4); R(c.wing, 1, 15, 14, 4); R(c.wing, 2, 19, 12, 3); R(c.wing, 5, 22, 8, 2); R(c.wingD, 3, 15, 11, 1); R(c.wingD, 3, 19, 10, 1); }
  // long hair + high ponytail behind
  R(c.hair, 13, 8, 9, 23); R(c.hair, 11, 14, 4, 15); R(c.hairD, 12, 24, 3, 7); R(c.hairD, 14, 28, 6, 3); R(c.hair, 10, 5, 5, 8);
  // legs
  if (pose === 'fly') { R(c.dressW, 17, 27, 3, 6); R(c.dressW, 21, 27, 3, 5); R(c.boot, 15, 32, 4, 3); R(c.boot, 20, 31, 4, 3); }
  else if (pose === 'kick') { R(c.dressW, 22, 26, 3, 3); R(c.dressW, 24, 28, 4, 3); R(c.dressW, 27, 30, 3, 3); R(c.boot, 29, 31, 6, 4); R(c.dressW, 17, 27, 3, 5); R(c.boot, 15, 31, 4, 3); }
  else { R(c.dressW, 19, 27, 3, 8); R(c.dressW, 23, 27, 3, 8); R(c.boot, 18, 34, 4, 4); R(c.boot, 23, 34, 4, 4); R(c.dressPL, 19, 34, 3, 1); R(c.dressPL, 23, 34, 3, 1); }
  // skirt + bodice
  R(c.dressP, 16, 22, 12, 3); R(c.dressW, 15, 25, 14, 2); R(c.dressPL, 15, 26, 14, 1);
  R(c.dressW, 19, 16, 6, 6); R(c.dressP, 20, 16, 4, 2); R(c.gem, 21, 18, 2, 1); R(c.dressP, 18, 21, 8, 1);
  // head
  R(c.skin, 19, 9, 7, 7);
  R(c.hair, 16, 5, 11, 5); R(c.hair, 19, 9, 7, 2); R(c.hair, 26, 10, 1, 6); R(c.hair, 17, 9, 2, 7); R(c.hairL, 18, 6, 4, 1);
  if (pose === 'hurt' || pose === 'defeat') R(c.mouth, 23, 13, 2, 1);
  else { R(c.eye, 23, 12, 2, 2); R(c.eyeHi, 23, 12, 1, 1); }
  R(c.mouth, 24, 15, 2, 1);
  // big bow on the back of the head
  R(c.bow, 9, 1, 6, 5); R(c.bow, 17, 1, 4, 4); R(c.bowD, 15, 2, 2, 3); R(c.bow, 12, 6, 2, 5); R(c.bowD, 10, 3, 3, 1);
  // arms
  if (pose === 'attack') { R(c.glove, 24, 17, 8, 2); R(c.skin, 32, 17, 1, 2); }
  else if (pose === 'hurt') { R(c.glove, 24, 12, 2, 6); }
  else if (pose === 'defeat') { R(c.glove, 21, 18, 4, 2); }
  else if (pose === 'kick') { R(c.glove, 24, 15, 5, 2); }
  else { R(c.glove, 24, 17, 2, 6); }
}

// ---- ALLY: アスターテ Astarte - white cat girl, navy hood, big scythe (32x32) ----
function artAstarte(R, f) {
  const navy = '#232a5c', gold = '#e8c060', white = '#f2f2f8', skin = '#fff0ea', pole = '#3a2a36';
  for (let i = 0; i < 27; i++) R(pole, 9 + ((i * 0.45) | 0), 4 + i, 1, 1);       // scythe shaft
  R('#d8dce8', 2, 3, 8, 2); R('#d8dce8', 1, 5, 3, 6); R('#aeb4c8', 1, 11, 2, 3); R(gold, 9, 3, 2, 2); // blade
  R(white, 5, 17, 2, 6); R(white, 6, 22, 3, 2);                                   // tail
  R(navy, 10, 13, 13, 16); R(navy, 9, 21, 15, 8); R(white, 11, 28, 11, 1);        // cloak
  R(gold, 12, 24, 1, 1); R(gold, 19, 26, 1, 1); R(gold, 15, 20, 1, 1); R(gold, 21, 17, 1, 1);
  R('#1a1c38', 12, 29, 3, 3); R('#1a1c38', 17, 29, 3, 3);                          // boots
  R(navy, 11, 4, 11, 10); R(navy, 12, 2, 2, 2); R(navy, 19, 2, 2, 2);             // hood + ears
  R('#f0b0c0', 12, 3, 1, 1); R('#f0b0c0', 20, 3, 1, 1);
  R(skin, 15, 8, 6, 5); R(white, 14, 7, 8, 2); R(white, 14, 9, 2, 5);
  if (f) R('#6a7090', 19, 11, 2, 1); else { R('#3a6ad0', 19, 10, 1, 2); R('#3a6ad0', 20, 10, 1, 1); }
  R(skin, 18, 17, 2, 2); R(gold, 16, 13, 1, 1);
}
// ---- ALLY: ネーニア Neenia - silver-haired elf archer, navy/white dress (32x32) ----
function artNeenia(R, f) {
  const hair = '#d4d8f4', hairD = '#a0a6d0', navy = '#28305e', white = '#f4f6ff', skin = '#ffeee4', bow = '#c8a860';
  R('#6a4a30', 8, 10, 3, 9); R('#c0c8e0', 8, 8, 1, 2); R('#c0c8e0', 10, 7, 1, 3);  // quiver
  R(hair, 9, 6, 9, 21); R(hairD, 9, 21, 4, 6);                                     // long hair
  R(white, 11, 20, 11, 6); R(navy, 11, 20, 3, 6); R('#a8c0f0', 11, 25, 11, 1);     // skirt
  R(navy, 13, 14, 7, 6); R(white, 15, 14, 3, 1);                                   // bodice
  R(skin, 14, 26, 2, 3); R(skin, 17, 26, 2, 3); R(navy, 13, 29, 3, 3); R(navy, 17, 29, 3, 3);
  R(skin, 14, 7, 6, 6); R(hair, 12, 4, 9, 4); R(hair, 14, 7, 6, 1); R(hair, 13, 8, 2, 5);
  R(skin, 11, 8, 2, 1); R(skin, 10, 7, 1, 1);                                      // elf ear
  R('#5a50c0', 18, 9, 1, 2); R('#ffffff', 12, 3, 2, 2); R(navy, 11, 5, 1, 1);      // eye, flower
  R(white, 19, 13, 3, 2); R(skin, 21, 13, 2, 2);                                   // arm
  R(bow, 24, 4, 1, 2); R(bow, 25, 6, 1, 4); R(bow, 26, 10, 1, 8); R(bow, 25, 18, 1, 4); R(bow, 24, 22, 1, 2); // bow
  if (f) { R('#e8e8ff', 21, 5, 1, 18); R('#c0c8e0', 20, 13, 8, 1); R('#ffffff', 27, 13, 1, 1); }
  else R('#e8e8ff', 23, 5, 1, 18);
}
// ---- ALLY: 青天 Seiten - black cat girl, black/red gothic dress (32x32) ----
function artSeiten(R, f) {
  const hair = '#2a2228', hairD = '#171216', red = '#b0202c', black = '#1e1a20', skin = '#fff0ea';
  R(hair, 6, 20, 2, 6); R(hair, 5, 17, 2, 4); R(red, 5, 22, 3, 2);                 // tail + bow
  R(hair, 9, 6, 11, 21); R(hairD, 9, 21, 3, 6);                                    // long hair
  R(hair, 11, 1, 3, 3); R(hair, 18, 1, 3, 3); R('#f0e0e0', 12, 2, 1, 1); R('#f0e0e0', 19, 2, 1, 1); // ears
  R(black, 11, 19, 11, 6); R('#3a2e36', 11, 24, 11, 1); R(red, 10, 20, 1, 6); R(red, 22, 20, 1, 6); // skirt
  R(black, 13, 13, 7, 7); R(red, 16, 14, 1, 5);                                    // bodice
  R(skin, 14, 25, 2, 3); R(skin, 17, 25, 2, 3); R('#141014', 13, 28, 3, 4); R('#141014', 17, 28, 3, 4);
  R(skin, 14, 6, 6, 6); R(hair, 13, 5, 8, 2); R(hair, 13, 7, 2, 5); R(red, 9, 4, 3, 3);
  R('#e0203a', 18, 8, 1, 2);
  if (f) { R('#8a2030', 19, 10, 1, 1); R(black, 19, 14, 4, 2); R(skin, 23, 14, 1, 2); }
  else { R(black, 19, 13, 2, 3); R(skin, 19, 11, 2, 2); }
}
// シラヌイ (fox girl): red hair + fox ears, red/black kimono, folding fan (fallback art for ?sprites=0)
function artShiranui(R, f) {
  const hair = '#c81e2c', hairD = '#8a1020', kim = '#2a1418', red = '#d0303a', skin = '#fff0ea', white = '#f4ecec';
  R(hairD, 4, 18, 5, 8); R(red, 3, 21, 3, 4); R(white, 3, 25, 2, 1);                // fox tail
  R(hair, 9, 6, 11, 20); R(hairD, 9, 20, 3, 6);                                    // long hair
  R(hair, 11, 1, 3, 4); R(hair, 18, 1, 3, 4); R(white, 12, 2, 1, 2); R(white, 19, 2, 1, 2); // fox ears
  R(kim, 11, 18, 11, 8); R(red, 12, 20, 2, 2); R(red, 18, 22, 2, 2); R(white, 15, 18, 3, 8); // kimono skirt
  R(kim, 13, 12, 7, 7); R(white, 15, 12, 3, 3); R('#101010', 13, 17, 7, 2);         // kimono top + obi
  R(skin, 14, 26, 2, 2); R(skin, 17, 26, 2, 2); R('#1a1014', 13, 28, 3, 4); R('#1a1014', 17, 28, 3, 4);
  R(skin, 14, 6, 6, 6); R(hair, 13, 5, 8, 2); R(hair, 13, 7, 2, 5);
  R('#f0c040', 18, 8, 1, 2);                                                        // golden eye
  if (f) { R('#101010', 20, 9, 5, 3); R(red, 21, 10, 3, 1); R(skin, 19, 13, 2, 2); }   // open fan
  else { R('#101010', 19, 13, 2, 4); R(skin, 19, 12, 2, 2); }
}
// ダイスロール (the girl): white long hair, red eyes, small crown, harlequin jacket (fallback art for ?sprites=0)
function artDiceroll(R, f) {
  const hair = '#f0eef4', hairD = '#c8c4d4', blk = '#1a1620', wht = '#f4f4f8', skin = '#fff0ea', gold = '#f0c040';
  R(hair, 8, 6, 12, 21); R(hairD, 8, 20, 3, 7);                                     // long white hair
  R(gold, 12, 2, 7, 2); R(gold, 12, 1, 1, 1); R(gold, 15, 1, 1, 1); R(gold, 18, 1, 1, 1); R('#d02030', 15, 2, 1, 1); // crown
  for (let y = 12; y < 20; y++) for (let x = 12; x < 21; x++) R(((x + y) & 1) ? blk : wht, x, y, 1, 1);      // harlequin jacket
  R(blk, 12, 20, 9, 6); R('#d02030', 15, 12, 2, 2);                                 // skirt + ribbon
  R(skin, 14, 26, 2, 2); R(skin, 17, 26, 2, 2); R(blk, 13, 28, 3, 4); R(blk, 17, 28, 3, 4);
  R(skin, 14, 6, 6, 6); R(hair, 13, 5, 8, 2); R(hair, 13, 7, 2, 5); R('#e02030', 16, 9, 1, 1); R('#e02030', 18, 9, 1, 1);
  if (f) { R(skin, 20, 12, 2, 2); R(wht, 22, 12, 3, 1); R('#ff8040', 25, 12, 1, 1); }  // cigarette
  else { R(skin, 19, 18, 2, 2); }
}
const ALLY_W = 32, ALLY_H = 32;
const ALLY_INFO = {
  A: { name: 'アスターテ', color: '#5a6ad8', art: artAstarte },
  N: { name: 'ネーニア', color: '#4a60b0', art: artNeenia },
  S: { name: '青天', color: '#c0203a', art: artSeiten },
  K: { name: 'シラヌイ', color: '#d0303a', art: artShiranui },
  R: { name: 'ダイスロール', color: '#c8203a', art: artDiceroll },
};
(function buildChars() {
  for (const pal of ['dark', 'normal']) for (const p of TOBI_POSES) {
    SPR.tobi[pal][p] = [0, 1].map(f => makeSprite(TOBI_W, TOBI_H, R => artTobiume(R, p, TOBI_PAL[pal], f), TOBI_PAL[pal].out));
  }
  for (const k in ALLY_INFO) SPR.ally[k] = [0, 1].map(f => makeSprite(ALLY_W, ALLY_H, R => ALLY_INFO[k].art(R, f), [14, 12, 30]));
})();

// =====================================================================
//  OPTIONAL SPRITE SHEETS  (assets/*.png next to index.html)
//  Frames are read left->right, top->bottom (a single row strip or a grid).
//  All frames face right; flipped + white-flash copies are made at load.
//  If a file is missing, the procedural art above is used instead.
// =====================================================================
// cx = x of the body centre in the right-facing frame (measured: tools/measure_sheets.js);
// frames are anchored with their bottom edge on the hitbox bottom (feet) and cx on the hitbox centre.
const SHEET_DEFS = {
  // kanon.png 32x32: idle2, run4, jump1, fall1, shoot1, runshoot4, hurt1. Staff tip at (30,17).
  kanon:   { file: 'assets/kanon.png', fw: 32, fh: 32, frames: 14, cx: 11, tipX: 30, tipY: 17, map: { idle: [0, 2], run: [2, 4], jump: [6, 1], fall: [7, 1], shoot: [8, 1], runshoot: [9, 4], hurt: [13, 1] } },
  // tobiume_dark.png 48x48: idle2, fly2, attack2 (5 = firing), hurt1, defeat1. Magic hand light ~(46,30).
  tobiume: { file: 'assets/tobiume_dark.png', fw: 48, fh: 48, frames: 8, cx: 20, muzX: 46, muzY: 30, map: { idle: [0, 2], fly: [2, 2], attack: [4, 2], hurt: [6, 1], defeat: [7, 1] } },
  // tobiume.png = NORMAL (pre-dark) Tobiume, used after she is rescued. 32x32 x15; layout comes from
  // assets/tobiume.json (embedded at build time as EMBEDDED_META), these values are the fallback.
  // If the file is missing a pink-tinted copy of the dark sheet is used.
  tobiumeNormal: { file: 'assets/tobiume.png', fw: 32, fh: 32, frames: 15, cx: 13,
    map: { idle: [0, 2], fly: [2, 2], attack: [4, 2], hurt: [6, 1], kick: [7, 4], special_dive_kick: [11, 4] } },
  // eyes: [x, y] of each eye in the right-facing frame (used by the shadow / DARK render mode)
  neenia:  { file: 'assets/neenia.png', fw: 32, fh: 32, frames: 2, cx: 11, eyes: [[11, 9], [14, 9]] },
  seiten:  { file: 'assets/seiten.png', fw: 32, fh: 32, frames: 2, cx: 14, eyes: [[12, 10], [15, 10]] },
  astarte: { file: 'assets/astarte.png', fw: 32, fh: 32, frames: 2, cx: 10, eyes: [[10, 10], [14, 10]] },
  lily:    { file: 'assets/lily.png', fw: 32, fh: 32, frames: 2, cx: 16 },
  umimi:   { file: 'assets/umimi.png', fw: 32, fh: 32, frames: 10, cx: 16,
    map: { idle: [0, 2], swim: [2, 2], enter: [4, 1], platform: [5, 2], heal: [7, 2], exit: [9, 1] } },
  // v4 DARK friend bosses, 48x48 x8 (layout from the .json, embedded). cx = body centre in the right-facing
  // frame; cxF overrides per frame (Astarte's attack frames are drawn further right). muz = projectile origin.
  neeniaDark:  { file: 'assets/neenia_dark.png', fw: 48, fh: 48, frames: 8, cx: 20, muzX: 45, muzY: 22,   // 2026-10-03 redraw: body x=20, arrow tip (45,22)
    map: { idle: [0, 2], walk: [2, 2], attack: [4, 2], hurt: [6, 1], defeat: [7, 1] } },
  seitenDark:  { file: 'assets/seiten_dark.png', fw: 48, fh: 48, frames: 8, cx: 20, muzX: 32, muzY: 20,
    map: { idle: [0, 2], leap: [2, 2], attack: [4, 2], hurt: [6, 1], defeat: [7, 1] } },   // leap: 2 = airborne pounce, 3 = landing crouch
  lilyDark: { file: 'assets/lily_dark.png', fw: 48, fh: 48, frames: 8, cx: 24,
    cxF: [24, 24, 24, 24, 24, 24, 24, 24], muzX: 39, muzY: 24,
    map: { idle: [0, 2], windup: [2, 2], attack: [4, 2], hurt: [6, 1], defeat: [7, 1] } },
  // Frame 6's red song wave isolated from Lily's body. Drawn on top of attack frame 5.
  lilySongWave: { file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABXElEQVR4nO3Wv0rDQBwH8EtFERRNLqNIGtHLm1RfQF/AxdXBVUj6FNlMT8cUX8DB1aGggtKKIk7i4iIOtfB1ynGtCWK0+SO/z5Ij3CW/3939cmGMEEJ+q8kM5B3b+MtA8to1nbJDmK7AcnOvEEmzaMz+eEZPzPXUMaXUwBs+jLT7e0srKsiwtV3/bdNedlQSlVoBxhgLrKYKqMOFaktrQ7XdxtzYmMj2viRRWALJy5Pr4etj6jbS+8/vH2Q+p3D9oxht08HLeQ+SC0S2h3BzB5ILjJ5uEfshBlEXo4crSC7wft3D8O4SkgtILjC8v0E/6iKyPfja1ipMUpTJDHZsD6rNBQLLRWC5iP1Q9RvI07EaiLQxpUk7lLJq4FhrJwlMP8IctlbXUgPTvzxZX6HKmpzt2iUwqZIJ6Cfvv1bZ4tU9n11UP0hSF7X/lW7NLNQ7AUIIIYQQQgghhHzvEx2NkYPhZI2wAAAAAElFTkSuQmCC', fw: 48, fh: 48, frames: 1, cx: 15 },
  // 魔王ディザスター 48x48 x14 (assets/disaster_dark.json): body x=23, floating feet y~45. One frame per weapon form;
  // 4 = transform (before any form). Muzzle points per form: DISASTER_WEAPONS in 04b_disaster.js.
  disasterDark: { file: 'assets/disaster_dark.png', fw: 48, fh: 48, frames: 14, cx: 23,
    map: { idle: [0, 2], glide: [2, 2], transform: [4, 1], sword: [5, 1], spear: [6, 1], axe: [7, 1], scythe: [8, 1], bow: [9, 1],
      whip: [10, 1], lance: [11, 1], hurt: [12, 1], defeat: [13, 1] } },
  // スターさん (rescued, he/him) 32x32 x7: 0-1 idle, 2 joy jump, 3 happy, 4 thanks, 5 wave, 6 sword raise
  starNormal: { file: 'assets/star.png', fw: 32, fh: 32, frames: 7, cx: 16,
    map: { idle: [0, 2], joy: [2, 1], happy: [3, 1], thanks: [4, 1], wave: [5, 1], sword: [6, 1] } },
  // Disaster fight FX sheets (assets/alchemic_weapons.json, assets/disaster_bullets.json)
  alchemicWeapons: { file: 'assets/alchemic_weapons.png', fw: 32, fh: 32, frames: 7, cx: 16 },  // sword spear axe scythe bow whip lance (tip up-right)
  // シラヌイ (fox girl) NORMAL 32x32 x6: 0-1 idle, 2 happy, 3 thanks (bow), 4 wave (open fan), 5 foxfire in palm (21,14)
  shiranui: { file: 'assets/shiranui.png', fw: 32, fh: 32, frames: 6, cx: 16,
    map: { idle: [0, 2], happy: [2, 1], thanks: [3, 1], wave: [4, 1], foxfire: [5, 1] } },
  // DARK シラヌイ 48x48 x8: body x=24, floating feet y=44. 3 = illusion (blinked in code), 4 fan wind-up, 5 throw (fan tip 38,24)
  shiranuiDark: { file: 'assets/shiranui_dark.png', fw: 48, fh: 48, frames: 8, cx: 24, muzX: 38, muzY: 24,
    map: { idle: [0, 2], glide: [2, 1], vanish: [3, 1], attack: [4, 2], hurt: [6, 1], defeat: [7, 1] } },
  shiranuiBullets: { file: 'assets/shiranui_bullets.png', fw: 24, fh: 24, frames: 5, cx: 12 },       // foxfire a/b, wisp, flame crescent, fan (face right)
  // ダイスロール (girl) NORMAL 32x32 x6: 0-1 idle, 2 cigarette, 3 lazy wave (thanks), 4 toss die up, 5 card
  diceroll: { file: 'assets/diceroll.png', fw: 32, fh: 32, frames: 6, cx: 16,
    map: { idle: [0, 2], smoke: [2, 1], thanks: [3, 1], toss: [4, 1], card: [5, 1] } },
  // DARK ダイスロール 48x48 x9 (ground walker, feet y=47): 0-1 idle, 2-3 walk, 4 wind-up (hand 10,21), 5 throw (die 39,23),
  // 6 fling cards (36,23), 7 hit, 8 defeat (dice head cracks)
  dicerollDark: { file: 'assets/diceroll_dark.png', fw: 48, fh: 48, frames: 9, cx: 24, muzX: 39, muzY: 23,
    map: { idle: [0, 2], walk: [2, 2], windup: [4, 1], throwDice: [5, 1], flickCards: [6, 1], hurt: [7, 1], defeat: [8, 1] } },
  // dice 1-6 (0-5), rolling die (6-9), card back/edge/front (10-12), chips red/black (13-14), roulette ball (15), flaming die (16)
  dicerollBullets: { file: 'assets/diceroll_bullets.png', fw: 24, fh: 24, frames: 17, cx: 12 },
  // FINAL: 清掃員カナタ 64x64 x9 (body x=32, feet y=63): 0-1 idle (1 eyes closed), 2 move, 3 levitate (hand 50,24; object 54,6),
  // 4 suck (mouth 52,41), 5 spit (mouth 56,30), 6 hit, 7 collapse, 8 float. Mirror: x -> 63-x
  kanataBoss: { file: 'assets/kanata_boss.png', fw: 64, fh: 64, frames: 9, cx: 32, muzX: 52, muzY: 41,
    map: { idle: [0, 2], move: [2, 1], levitate: [3, 1], suck: [4, 1], spit: [5, 1], hurt: [6, 1], defeat: [7, 1], float: [8, 1] } },
  // 暴走ミミック 64x64 x7 (body x=34, feet y=63): 0 idle, 1 lunge, 2 big-mouth suck, 3 spit, 4 hit, 5 destroyed, 6 idle2 (idle = 0/6)
  mimicRampage: { file: 'assets/mimic_rampage.png', fw: 64, fh: 64, frames: 7, cx: 34, muzX: 46, muzY: 47,
    map: { idle: [0, 1], lunge: [1, 1], suck: [2, 1], spit: [3, 1], hurt: [4, 1], defeat: [5, 1], idle2: [6, 1] } },
  kanataGhost: { file: 'assets/kanata_ghost.png', fw: 32, fh: 32, frames: 3, cx: 16, map: { float: [0, 2], throw: [2, 1] } }, // orb 27,16
  kanata: { file: 'assets/kanata.png', fw: 32, fh: 32, frames: 5, cx: 16, map: { idle: [0, 1], blink: [1, 1], wave: [2, 1], happy: [3, 1], sing: [4, 1] } },
  // 0-1 ghost bullet, 2 ghost fireball, 3 paper, 4 plank, 5 can, 6 rock, 7 plate shard (face right; debris centre 12,12)
  kanataBullets: { file: 'assets/kanata_bullets.png', fw: 24, fh: 24, frames: 8, cx: 12 },
  kanataWind: { file: 'assets/kanata_bullets_wind.png', fw: 48, fh: 24, frames: 3, cx: 4 },      // suction streaks; converge at (4,12)
  umineDark: { file: 'assets/umine_dark.png', fw: 32, fh: 32, frames: 14, cx: 11, muzX: 30, muzY: 17,   // placeholder: shadow-tinted kanon.png
    map: { idle: [0, 2], run: [2, 4], walk: [2, 4], jump: [6, 1], fall: [7, 1], leap: [6, 1], shoot: [8, 1], attack: [8, 1], runshoot: [9, 4], hurt: [13, 1], defeat: [13, 1] } },
  seaSplit: { file: 'assets/sea_split.png', fw: 48, fh: 96, frames: 5, cx: 45 },                  // LEFT wall; 4 = tileable body (32px)
  umineSpell: { file: 'assets/umine_spell.png', fw: 48, fh: 48, frames: 6, cx: 24 },              // 海音's awakening: 0 ready .. 5 staff up + circle (feet y=46)
  partyProps: { file: 'assets/party_props.png', fw: 376, fh: 32, frames: 1, cx: 0 },              // cut by PARTY_PROPS rects
  partyBg: { file: 'assets/party_bg_wide.png', fw: 384, fh: 240, frames: 1, cx: 0 },
  shiranuiPillar:  { file: 'assets/shiranui_bullets_pillar.png', fw: 24, fh: 48, frames: 2, cx: 12 }, // fire pillar, floor line y=45
  transformFx:     { file: 'assets/transform_fx.png', fw: 24, fh: 24, frames: 4, cx: 12 },      // purple morph flash, 4 steps
  starWeapon:      { file: 'assets/star_weapon.png', fw: 32, fh: 32, frames: 2, cx: 16 },       // 0 cyan sword, 1 cyan slash arc
  disasterBullets: { file: 'assets/disaster_bullets.png', fw: 24, fh: 24, frames: 6, cx: 12 },  // sword wave, spear bolt, ground burst, arrow, scythe wave, orb
  astarteDark: { file: 'assets/astarte_dark.png', fw: 48, fh: 48, frames: 8, cx: 22, muzX: 44, muzY: 30,   // 2026-10-03 redraw: body x=22 on every frame (no cxF)
    map: { idle: [0, 2], glide: [2, 2], attack: [4, 2], hurt: [6, 1], defeat: [7, 1] } },
};
// 24x24 face icons (stage select + rescue dialogue)
for (const f of ['kanon', 'tobiume', 'tobiume_dark', 'neenia', 'neenia_dark', 'seiten', 'seiten_dark', 'astarte', 'astarte_dark', 'lily', 'lily_dark', 'umimi', 'disaster_dark', 'star', 'shiranui', 'shiranui_dark', 'diceroll', 'diceroll_dark', 'kanata', 'umine_dark'])
  SHEET_DEFS['face_' + f] = { file: 'assets/' + f + '_face.png', fw: 24, fh: 24, frames: 1, cx: 12, face: true };
const SHEETS = {};           // key -> array of sprite objects {r,l,wr,wl}
const SHEETS_LOADED = [];
function tintCanvas(c, col, alpha) {
  const f = mkCanvas(c.width, c.height), fg = f.getContext('2d');
  fg.drawImage(c, 0, 0); fg.globalCompositeOperation = 'source-atop'; fg.globalAlpha = alpha; fg.fillStyle = col; fg.fillRect(0, 0, c.width, c.height);
  return f;
}
// ---- generic SHADOW render mode (for DARK <friend> bosses / locked portraits) ----
// Any sheet frame -> dark silhouette with a purple rim light and glowing eyes.
// shadowFrames(key) caches {r,l,wr,wl} sprites for every frame of SHEETS[key].
function shadowCanvas(c, eyes) {
  const w = c.width, h = c.height, f = mkCanvas(w, h), fg = f.getContext('2d');
  const src = c.getContext('2d').getImageData(0, 0, w, h).data, id = fg.createImageData(w, h), d = id.data;
  const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (op(x, y)) {
      const lum = (src[i] * 0.3 + src[i + 1] * 0.59 + src[i + 2] * 0.11) / 255;        // keep a hint of the shading
      const rim = !op(x, y - 1) || !op(x - 1, y);
      d[i] = rim ? 120 : 16 + lum * 22; d[i + 1] = rim ? 70 : 8 + lum * 12; d[i + 2] = rim ? 170 : 30 + lum * 34; d[i + 3] = 255;
    } else if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) {        // faint dark aura outline
      d[i] = 40; d[i + 1] = 10; d[i + 2] = 60; d[i + 3] = 170;
    }
  }
  fg.putImageData(id, 0, 0);
  if (eyes) for (const [ex, ey] of eyes) {
    fg.fillStyle = 'rgba(255,60,110,0.45)'; fg.fillRect(ex - 1, ey - 1, 3, 3);
    fg.fillStyle = '#ff3a6a'; fg.fillRect(ex, ey, 2, 1); fg.fillStyle = '#ffe0ea'; fg.fillRect(ex, ey, 1, 1);
  }
  return f;
}
const SHADOW_CACHE = {};
function shadowFrames(key) {
  if (SHADOW_CACHE[key]) return SHADOW_CACHE[key];
  const fr = SHEETS[key]; if (!fr) return null;
  const eyes = SHEET_DEFS[key] && SHEET_DEFS[key].eyes;
  try { return (SHADOW_CACHE[key] = fr.map(s => sheetSprite(shadowCanvas(s.r, eyes)))); }
  catch (e) { // pixel readback blocked (e.g. ?sprites=folder over file://): flat silhouette via compositing
    return (SHADOW_CACHE[key] = fr.map(s => { const c = tintCanvas(s.r, '#1a0e2e', 1), cg = c.getContext('2d');
      if (eyes) for (const [ex, ey] of eyes) { cg.fillStyle = '#ff3a6a'; cg.fillRect(ex, ey, 2, 1); } return sheetSprite(c); }));
  }
}
function sheetSprite(c) { const wr = whiteCanvas(c); return { r: c, l: flipCanvas(c), wr: wr, wl: flipCanvas(wr), w: c.width, h: c.height }; }
function sliceSheet(img, d) {
  const cols = Math.max(1, Math.floor(img.width / d.fw)), frames = [];
  for (let i = 0; i < d.frames; i++) {
    const sx = (i % cols) * d.fw, sy = Math.floor(i / cols) * d.fh;
    if (sy + d.fh > img.height) break;
    const c = mkCanvas(d.fw, d.fh); c.getContext('2d').drawImage(img, sx, sy, d.fw, d.fh, 0, 0, d.fw, d.fh);
    frames.push(sheetSprite(c));
  }
  return frames.length === d.frames ? frames : null;
}
function sheetFrame(key, anim, i) { // anim name from SHEET_DEFS[key].map, i = running counter
  const fr = SHEETS[key]; if (!fr) return null;
  const m = SHEET_DEFS[key].map; if (!m) return fr[i % fr.length];
  const a = m[anim]; if (!a) return fr[0];
  return fr[a[0] + (i % a[1])];
}
// Source priority: sheets embedded in index.html at build time (no requests) ->
// otherwise assets/*.png next to index.html. ?sprites=folder forces the folder
// (artists can drop new PNGs without rebuilding); ?sprites=0 = procedural art only.
// apply {frameWidth, frameHeight, animations:{name:{frames:[..]}}} (tobiume.json format) to a sheet def
function applySheetMeta(d, m) {
  if (!m) return;
  if (m.frameWidth) d.fw = m.frameWidth; if (m.frameHeight) d.fh = m.frameHeight;
  if (m.animations) { let mx = 0; const map = {};
    for (const n in m.animations) { const f = m.animations[n].frames; if (!f || !f.length) continue; map[n] = [f[0], f.length]; mx = Math.max(mx, f[f.length - 1]); }
    d.map = map; d.frames = mx + 1; }
}
function loadSheets() {
  if (!CONFIG.useSpriteSheets || DEBUG.noSprites) return;
  if (typeof EMBEDDED_META !== 'undefined') for (const k in EMBEDDED_META) if (SHEET_DEFS[k]) applySheetMeta(SHEET_DEFS[k], EMBEDDED_META[k]);
  const emb = (typeof EMBEDDED_SHEETS !== 'undefined' && QS.get('sprites') !== 'folder') ? EMBEDDED_SHEETS : null;
  const useFolder = !emb || Object.keys(emb).length === 0;
  // sheets never embedded by build.py --embed: always loaded from assets/ (Lily, Umimi, Disaster / Star)
  const LILY_FOLDER_SHEETS = new Set(['lily', 'lilyDark', 'lilySongWave', 'umimi', 'face_lily', 'face_lily_dark', 'face_umimi', 'disasterDark', 'starNormal', 'face_disaster_dark', 'face_star',
    'alchemicWeapons', 'transformFx', 'starWeapon', 'disasterBullets',
    'shiranui', 'shiranuiDark', 'shiranuiBullets', 'shiranuiPillar', 'face_shiranui', 'face_shiranui_dark',
    'diceroll', 'dicerollDark', 'dicerollBullets', 'face_diceroll', 'face_diceroll_dark',
    'kanataBoss', 'mimicRampage', 'kanataGhost', 'kanata', 'kanataBullets', 'kanataWind', 'umineDark', 'face_umine_dark', 'seaSplit', 'umineSpell', 'partyProps', 'partyBg', 'face_kanata']);
  for (const k in SHEET_DEFS) {
    if (!useFolder && !emb[k] && !LILY_FOLDER_SHEETS.has(k)) continue;
    const d = SHEET_DEFS[k], img = new Image();
    img.onload = () => {
      const fr = sliceSheet(img, d); if (!fr) { console.warn('ROCKSIDE: sheet ' + d.file + ' has an unexpected size'); return; }
      SHEETS[k] = fr; SHEETS_LOADED.push(k);
      if (k === 'tobiume') SHEETS.tobiumeTint = fr.map(s => sheetSprite(tintCanvas(s.r, '#ffb8dc', 0.42)));
    };
    img.onerror = () => {}; // missing file -> keep procedural art
    img.src = (useFolder || LILY_FOLDER_SHEETS.has(k)) ? d.file : emb[k];
  }
}

// =====================================================================
//  High-resolution text overlay (Japanese lines, speech bubbles).
//  Drawn on the full-resolution screen canvas after the pixel buffer is
//  scaled up, so kanji stay crisp. Uses a Japanese-capable system font.
// =====================================================================
const JP_FONT = '"Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP","Noto Sans CJK JP","Yu Gothic UI","Yu Gothic","Meiryo",sans-serif';
const wrapCache = new Map();
function hiS() { return screen.width / VW; }
function wrapText(text, maxW) { // per-character wrapping (works for Japanese), cached
  const key = sctx.font + '|' + maxW + '|' + text; let lines = wrapCache.get(key);
  if (lines) return lines;
  lines = []; let cur = '';
  for (const ch of text) { if (cur && sctx.measureText(cur + ch).width > maxW) { lines.push(cur); cur = ch; } else cur += ch; }
  if (cur) lines.push(cur);
  wrapCache.set(key, lines); return lines;
}
function roundRect(x, y, w, h, r) {
  sctx.beginPath(); sctx.moveTo(x + r, y); sctx.lineTo(x + w - r, y); sctx.quadraticCurveTo(x + w, y, x + w, y + r);
  sctx.lineTo(x + w, y + h - r); sctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); sctx.lineTo(x + r, y + h);
  sctx.quadraticCurveTo(x, y + h, x, y + h - r); sctx.lineTo(x, y + r); sctx.quadraticCurveTo(x, y, x + r, y); sctx.closePath();
}
function fontPx(gameUnits) { const dpr = screen.width / Math.max(1, layout.gameW); return Math.round(Math.max(gameUnits * hiS(), 12 * dpr)); }
// speech bubble pointing at (gx, gy) in game coords
function drawBubble(gx, gy, name, nameColor, text, alpha) {
  const s = hiS(), fs = fontPx(7.2), nfs = Math.round(fs * 0.8), pad = Math.round(fs * 0.55);
  sctx.save(); sctx.globalAlpha = alpha;
  sctx.font = '700 ' + fs + 'px ' + JP_FONT;
  const lines = wrapText(text, Math.min(175 * s, screen.width - 8 * s - pad * 2));
  let w = 0; for (let i = 0; i < lines.length; i++) w = Math.max(w, sctx.measureText(lines[i]).width);
  sctx.font = '700 ' + nfs + 'px ' + JP_FONT; w = Math.max(w, sctx.measureText(name).width);
  const bw = Math.ceil(w + pad * 2), lh = Math.round(fs * 1.3), bh = pad * 2 + nfs + Math.round(fs * 0.25) + lh * lines.length;
  const tipX = gx * s, tipY = gy * s;
  let bx = Math.round(tipX - bw / 2); bx = Math.max(Math.round(3 * s), Math.min(screen.width - bw - Math.round(3 * s), bx));
  let by = Math.round(tipY - bh - 7 * s); if (by < 27 * s) by = Math.round(27 * s);
  const lw = Math.max(2, Math.round(s * 0.9));
  // never hide the player: the bubble turns see-through while Umine's sprite is behind it
  const px = (P.x - cam.x - 8) * s, py = (P.y + P.h - 32) * s;
  if (px < bx + bw && px + 32 * s > bx && py < by + bh && py + 32 * s > by) sctx.globalAlpha = alpha * 0.35;
  sctx.fillStyle = '#fffaf2'; sctx.strokeStyle = '#1a1830'; sctx.lineWidth = lw;
  // tail
  const tx = Math.max(bx + 10 * s, Math.min(bx + bw - 10 * s, tipX));
  if (tipY > by + bh) {
    sctx.beginPath(); sctx.moveTo(tx - 4 * s, by + bh - lw); sctx.lineTo(tipX, tipY); sctx.lineTo(tx + 4 * s, by + bh - lw); sctx.closePath(); sctx.fill(); sctx.stroke();
  }
  roundRect(bx, by, bw, bh, Math.round(4 * s)); sctx.fill(); sctx.stroke();
  if (tipY > by + bh) { sctx.fillRect(tx - 4 * s + lw, by + bh - lw * 1.5, 8 * s - lw * 2, lw * 2); }
  sctx.textBaseline = 'top'; sctx.textAlign = 'left';
  sctx.fillStyle = nameColor; sctx.fillText(name, bx + pad, by + pad);
  sctx.font = '700 ' + fs + 'px ' + JP_FONT; sctx.fillStyle = '#1a1830';
  for (let i = 0; i < lines.length; i++) sctx.fillText(lines[i], bx + pad, by + pad + nfs + Math.round(fs * 0.25) + i * lh);
  sctx.restore();
}
// dialogue box along the bottom of the game view
function drawDialogue(name, nameColor, text, alpha, topY, faceKey) { // topY (game px) = box top; default: along the bottom
  const s = hiS(), fs = fontPx(8), nfs = Math.round(fs * 0.85), pad = Math.round(fs * 0.7);
  const bx = Math.round(8 * s), bw = Math.round(240 * s);
  const face = faceKey && SHEETS[faceKey] ? SHEETS[faceKey][0].r : null, fz = face ? 24 * Math.max(1, Math.round(s * 1.2)) : 0; // speaker face (integer scale)
  const tx = bx + pad + (face ? fz + pad : 0);
  sctx.save(); sctx.globalAlpha = alpha;
  sctx.font = '700 ' + fs + 'px ' + JP_FONT;
  const lines = wrapText(text, bw - (tx - bx) - pad), lh = Math.round(fs * 1.35);
  const bh = Math.max(pad * 2 + nfs + Math.round(fs * 0.35) + lh * lines.length, fz + pad * 2), by = topY !== undefined ? Math.round(topY * s) : Math.round(232 * s - bh);
  sctx.fillStyle = 'rgba(16,12,36,0.92)'; sctx.strokeStyle = nameColor || '#ff8cc0'; sctx.lineWidth = Math.max(2, Math.round(s));
  roundRect(bx, by, bw, bh, Math.round(3 * s)); sctx.fill(); sctx.stroke();
  if (face) { sctx.imageSmoothingEnabled = false; sctx.fillStyle = '#080a16'; sctx.fillRect(bx + pad - 2, by + Math.round((bh - fz) / 2) - 2, fz + 4, fz + 4); sctx.drawImage(face, bx + pad, by + Math.round((bh - fz) / 2), fz, fz); }
  sctx.textBaseline = 'top'; sctx.textAlign = 'left';
  sctx.font = '700 ' + nfs + 'px ' + JP_FONT; sctx.fillStyle = nameColor; sctx.fillText(name, tx, by + pad);
  sctx.font = '700 ' + fs + 'px ' + JP_FONT; sctx.fillStyle = '#ffffff';
  for (let i = 0; i < lines.length; i++) sctx.fillText(lines[i], tx, by + pad + nfs + Math.round(fs * 0.35) + i * lh);
  sctx.restore();
}
// centred single line of high-res text (title subtitle etc.)
function drawHiText(text, gx, gy, gsize, color, outline) {
  const s = hiS(), fs = Math.round(Math.max(gsize * s, 11));
  sctx.save(); sctx.font = '700 ' + fs + 'px ' + JP_FONT; sctx.textAlign = 'center'; sctx.textBaseline = 'top';
  if (outline) { sctx.lineWidth = Math.max(2, Math.round(s * 1.2)); sctx.strokeStyle = outline; sctx.lineJoin = 'round'; sctx.strokeText(text, gx * s, gy * s); }
  sctx.fillStyle = color; sctx.fillText(text, gx * s, gy * s); sctx.restore();
}
