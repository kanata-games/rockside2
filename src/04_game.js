
// =====================================================================
//  Game objects (all pre-allocated; no per-frame allocations)
// =====================================================================
const P = { x: 0, y: 0, w: 10, h: 20, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuf: 0, jumping: false,
  shootT: 0, cool: 0, autoT: 0, shootBuf: 0, hp: 16, inv: 0, hurt: 0, knockDir: 0, dead: false, animT: 0 };
const cam = { x: 0 };
// Special magic: a single temporary water-orb foothold.
const magic = { mp: CONFIG.magicMaxMP, regen: 0, orb: null, cooldown: 0 };
const shots = []; for (let i = 0; i < CONFIG.maxShots; i++) shots.push({ active: false, x: 0, y: 0, vx: 0, w: 7, h: 5 });
// bullet kinds: 0 small, 2 heart, 3 star, 4 shockwave (Tobiume) / 6 arrow, 7 rain arrow (Neenia) /
// 8 floor sound wave, 11 note (Seiten) / 9 crescent, 10 star orb, 12 scythe slash area (Astarte)
// v5 Neenia: 13 lobbed arrow (gravity), 14 ricochet arrow (bounces off walls/ceiling/floor), 15 snare arrow (gravity) -> 16 thorn patch
// g: per-frame gravity (lobbed arrows), bnc: bounces left (ricochet)
const bullets = []; for (let i = 0; i < 40; i++) bullets.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, w: 4, h: 4, kind: 0, dmg: 2, life: 0, t: 0, ang: 0, rad: 0, spin: 0, orbit: false, baseY: 0, g: 0, bnc: 0 });
const arrows = []; for (let i = 0; i < 8; i++) arrows.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, w: 5, h: 4, life: 0 });
const parts = []; for (let i = 0; i < 128; i++) parts.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 0, kind: 0, col: '#fff' });
const enemies = [], allies = []; // rebuilt from the map by buildActors() when an area loads
function makeEnemy(s) {
  const e = { type: s.type, c: s.c, r: s.r, x: 0, y: 0, w: 12, h: 12, ox: 2, oy: 10, hurtUp: CONFIG.enemy.walker.hurtUp || 0, vx: 0, vy: 0, hp: 1, face: -1, t: 0, fireT: 0,
    alive: true, active: false, flash: 0, onGround: false, homeX: 0, homeY: 0 };
  if (s.type === 'H') { e.w = 12; e.h = 11; e.ox = 2; e.oy = 11; e.hurtUp = CONFIG.enemy.hopper.hurtUp || 0; }
  if (s.type === 'F') { e.w = 12; e.h = 9; e.ox = 2; e.oy = 4; e.hurtUp = 0; }
  return e;
}
const boss = { state: 'off', x: 0, y: 0, w: 20, h: 34, vx: 0, vy: 0, hp: 0, hpShown: 0, face: -1, t: 0, inv: 0, flash: 0,
  onGround: false, last: '', triggered: false, pose: 'idle', poseF: 0, hopY: 0, shots: 0, dark: true, tx: 0, bob: 0, fireT: 0,
  seen: [], alpha: 1, hidden: false, pvx: 0, mx: 0, my: 0, aimX: 0, aimY: 0, aimShow: false, rainC: [0, 0, 0, 0, 0, 0], rainN: 0,
  warn: 0, warnX: 0, pr: false, volleys: 0, multi: false, leapsLeft: 0, didMulti: false, warp2: false,
  // v5 Neenia telegraphs: floor marks (lob / snare landing spots: frames until impact), ricochet path (up to 5 points)
  markX: [0, 0, 0, 0, 0, 0, 0, 0], markT: [0, 0, 0, 0, 0, 0, 0, 0], markK: [0, 0, 0, 0, 0, 0, 0, 0], markMax: [1, 1, 1, 1, 1, 1, 1, 1],
  ricoPts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ricoN: 0, ricoShow: false, ricoLock: false, ricoAng: 0, combo: false, bag: [], counterCD: 0 };
// Boss registry (AREAS[].boss): texts, sheets (dark = boss sheet, normal = after rescue), hitbox, colours.
// The fight logic is BOSS_AI[type] (see below); drawing is generic (drawBoss in 05_render.js).
const BOSS_TYPES = {
  tobiume: { hud: 'TOBIUME', speaker: '飛梅', speakerColor: '#ff8cc0', line: '…ありがとう、海音ちゃん！', face: 'face_tobiume',
    clearEn: 'TOBIUME RESCUED', clearJp: '飛梅を闇から救い出した！', dark: 'tobiume', normal: 'tobiumeNormal', fly: true, w: 20, h: 34,
    aura: ['#3a1040', '#7a2a70'], sparkle: '#ff9ad8' },
  neenia: { hud: 'NENIA', speaker: 'ネーニア', speakerColor: '#8fb0ff', line: '…助かったわ。ありがとう、海音', face: 'face_neenia',
    clearEn: 'NENIA RESCUED', clearJp: 'ネーニアを闇から救い出した！', dark: 'neeniaDark', normal: 'neenia', ally: 'N', w: 14, h: 34,
    aura: ['#1c1440', '#5a3a9a'], sparkle: '#b8d0ff', dust: '#7aa0b0' },
  seiten: { hud: 'SEITEN', speaker: '青天', speakerColor: '#ff8098', line: 'うみねちゃん…ごめんね、ありがとう！', face: 'face_seiten',
    clearEn: 'SEITEN RESCUED', clearJp: '青天を闇から救い出した！', dark: 'seitenDark', normal: 'seiten', ally: 'S', w: 16, h: 30,
    aura: ['#300a18', '#8a1a3a'], sparkle: '#ffb0c0', dust: '#9a9ab4' },
  // 魔王ディザスター -> スターさん (Star, he/him). No in-stage ally letter; fallback art reuses 'A'.
  disaster: { hud: 'DISASTER', speaker: 'スターさん', speakerColor: '#71d9ff', line: '……海音、ありがとな。錬金剣に光が戻ったぜ！', face: 'face_star',
    clearEn: 'STAR RESCUED', clearJp: 'スターさんを闇から救い出した！', dark: 'disasterDark', normal: 'starNormal', ally: 'A', fly: true, w: 21, h: 35,
    aura: ['#5a1a8a', '#a51c54'], sparkle: '#72eaff', dust: '#8a6aa8' },
  // DARK シラヌイ -> シラヌイ (fox lady, oiran style, speaks archaic 'noja' Japanese: わらわ / おぬし / 〜のじゃ).
  // In-stage helper letter K (homing foxfire).
  shiranui: { hud: 'SHIRANUI', speaker: 'シラヌイ', speakerColor: '#ff8a7a', line: 'ふふ…わらわとしたことが、闇に飲まれておったのじゃな。礼を言うぞ、海音よ。', face: 'face_shiranui',
    clearEn: 'SHIRANUI RESCUED', clearJp: 'シラヌイを闇から救い出した！', dark: 'shiranuiDark', normal: 'shiranui', ally: 'K', fly: true, w: 16, h: 34,
    aura: ['#3a0a1a', '#b0203a'], sparkle: '#ffb070', dust: '#a06a6a' },
  // DARK ダイスロール -> ダイスロール (she/her; a downer, calm girl who likes her cigarettes). In-stage helper letter R (lobbed die).
  diceroll: { hud: 'DICEROLL', speaker: 'ダイスロール', speakerColor: '#ff6a7a', line: '…はぁ。負けた負けた。…助かったよ、海音。一服したら手、貸してやる。', face: 'face_diceroll',
    clearEn: 'DICEROLL RESCUED', clearJp: 'ダイスロールを闇から救い出した！', dark: 'dicerollDark', normal: 'diceroll', ally: 'R', w: 18, h: 36,
    aura: ['#2a0a14', '#c01a30'], sparkle: '#ffe080', dust: '#8a8a9a' },
  lily: { hud: 'LILY', speaker: 'リリィ', speakerColor: '#ffd2ef', line: '海音ちゃん！助けてくれてありがとうっ♪', face: 'face_lily',
    clearEn: 'LILY RESCUED', clearJp: 'リリィを闇から救い出した！', dark: 'lilyDark', normal: 'lily', w: 16, h: 34,
    aura: ['#31102f', '#8b2d6a'], sparkle: '#ffd2ef', dust: '#c9b9e8' },
  astarte: { hud: 'ASTARTHE', speaker: 'アスターテ', speakerColor: '#b0b8ff', line: '…道を見失っていた。ここからは、また照らす', face: 'face_astarte',
    clearEn: 'ASTARTHE RESCUED', clearJp: 'アスターテを闇から救い出した！', dark: 'astarteDark', normal: 'astarte', ally: 'A', fly: true, w: 16, h: 34,
    aura: ['#1a1440', '#6a4aa8'], sparkle: '#e0e0ff', dust: '#b4aee0' },
};
const bossUmimi = { active: false, state: 'off', t: 0, x: 0, y: 0, face: -1, healUsed: false, encoreUsed: false, shieldT: 0, motion: 'idle' };
const stageUmimi = { active: false, x: 0, y: 0, face: 1, t: 0, given: false, hp: 6, maxHp: 6, inv: 0, down: false, downT: 0 };
function resetStageUmimi() {
  stageUmimi.active = false; stageUmimi.given = false; stageUmimi.t = 0; stageUmimi.hp = stageUmimi.maxHp; stageUmimi.inv = 0; stageUmimi.down = false; stageUmimi.downT = 0;
  stageUmimi.x = P.x; stageUmimi.y = P.y + P.h;
}
function giveStageUmimi(a) {
  if (stageUmimi.given) return;
  stageUmimi.given = true; stageUmimi.active = true; stageUmimi.t = 0; stageUmimi.hp = stageUmimi.maxHp; stageUmimi.inv = 0; stageUmimi.down = false; stageUmimi.downT = 0;
  stageUmimi.x = a.x + 16; stageUmimi.y = a.y - 2; stageUmimi.face = 1;
  support.used = false; refreshSupportButton();
  sfx('cp');
  for (let k = 0; k < 10; k++) spawnPart(stageUmimi.x, stageUmimi.y - 14, DIR8X[k & 7] * 0.8, -0.45 - (k & 1) * 0.15, 28, 5, k & 1 ? '#ffd2ef' : '#fff1b8');
}
function stageUmimiBox() {
  const u = stageUmimi; return { x: u.x - 12, y: u.y - 25, w: 24, h: 24 };
}
function hurtStageUmimi(dmg, srcX) {
  const u = stageUmimi; if (!u.active || u.down || u.inv > 0 || support.active && support.kind === 'lily') return false;
  u.hp = Math.max(0, u.hp - Math.max(1, dmg | 0)); u.inv = 28;
  u.face = srcX < u.x ? -1 : 1;
  splashAt(u.x, u.y - 14, srcX < u.x ? -1 : 1); shake(4, 1); sfx('tink');
  if (u.hp <= 0) {
    u.down = true; u.downT = 0; support.active = false; support.used = false; refreshSupportButton();
    for (let k = 0; k < 10; k++) spawnPart(u.x, u.y - 14, (k - 4.5) * 0.18, -0.7 - (k & 1) * 0.2, 24, 5, k & 1 ? '#bcecff' : '#ffffff');
  }
  return true;
}
function updateStageUmimi() {
  const u = stageUmimi; if (!u.active || support.active && support.kind === 'lily') return;
  u.t++; if (u.inv > 0) u.inv--;
  if (u.down) { u.downT++; return; }
  const side = P.face >= 0 ? -1 : 1;
  const tx = P.x + P.w / 2 + side * 24;
  const ty = P.y + P.h - 5 + Math.sin(frame * 0.09) * 2;
  const dx = tx - u.x;
  u.x += dx * 0.12; u.y += (ty - u.y) * 0.14;
  if (Math.abs(dx) > 2) u.face = dx < 0 ? -1 : 1;
}
function drawStageUmimi(camX) {
  const u = stageUmimi; if (!u.active || support.active && support.kind === 'lily') return;
  const anim = u.down ? 'exit' : (Math.abs((P.x + P.w / 2) - u.x) > 18 ? 'swim' : 'idle');
  const fr = sheetFrame('umimi', anim, u.down ? 0 : u.t >> 3);
  if (!fr) return;
  if (u.inv > 0 && (u.inv & 2)) return;
  g.drawImage(pick(fr, u.face, false), Math.round(u.x - camX - 16), Math.round(u.y - 32));
}


function resetBossUmimi() {
  bossUmimi.active = false; bossUmimi.state = 'off'; bossUmimi.t = 0;
  bossUmimi.x = 0; bossUmimi.y = 0; bossUmimi.face = -1; bossUmimi.healUsed = false; bossUmimi.encoreUsed = false; bossUmimi.shieldT = 0; bossUmimi.motion = 'idle';
}
function setBossUmimi(st) {
  if (bossUmimi.state !== st) { bossUmimi.state = st; bossUmimi.t = 0; }
}
function updateBossUmimi(b) {
  if (curArea.boss !== 'lily') return;
  const u = bossUmimi;
  if (b.state === 'off') { u.active = false; u.state = 'off'; return; }
  if (!u.active) {
    u.active = true; u.state = 'enter'; u.t = 0;
    u.x = b.x + b.w / 2 + 46; u.y = FLOOR_Y - 8; u.face = -1;
  }
  u.t++;

  if (u.state === 'enter') {
    // Arrive from a moon glow on the outer side of Lily instead of appearing inside her.
    const tx = b.x + b.w / 2 - b.face * 42;
    u.x += (tx - u.x) * 0.09;
    u.y = FLOOR_Y - 8 - Math.min(18, u.t * 0.6);
    if (u.t > 30) setBossUmimi('idle');
    return;
  }

  if (b.state === 'rescue' && b.t > 92) {
    setBossUmimi('exit');
    u.x += -b.face * 0.35; u.y -= 1.1;
    if (u.t > 34) u.active = false;
    return;
  }

  if (u.shieldT > 0) u.shieldT--;
  if (b.state === 'lilyHeal') setBossUmimi('heal');
  else if (u.shieldT > 0) setBossUmimi('shield');
  else if (b.state === 'lilyMoon') setBossUmimi('platform');
  else if (u.state === 'heal' || u.state === 'shield' || u.state === 'platform') setBossUmimi('idle');

  if (u.state === 'platform') {
    // Umimi sits clearly under Lily's feet. The moon-disc frame reads as a mount.
    const tx = b.x + b.w / 2;
    const ty = b.y + b.h + 20;
    u.x += (tx - u.x) * 0.32;
    u.y += (ty - u.y) * 0.32;
    u.face = b.face; u.motion = 'platform';
    return;
  }

  if (u.state === 'heal' || u.state === 'shield') {
    // Move to Lily's front/outer side. The encore shield reuses Umimi's heal pose,
    // but does not restore HP.
    const tx = b.x + b.w / 2 + b.face * 40;
    const ty = Math.min(FLOOR_Y - 10, b.y + b.h - 9);
    u.x += (tx - u.x) * 0.18;
    u.y += (ty - u.y) * 0.18;
    u.face = -b.face; u.motion = 'heal';
    return;
  }

  // Normal partner position: a full character-width behind Lily, slightly floating.
  const tx = b.x + b.w / 2 - b.face * 42;
  const ty = Math.min(FLOOR_Y - 10, b.y + b.h - 7 + Math.sin(frame * 0.075) * 3);
  const moving = Math.abs(tx - u.x) > 3;
  u.x += (tx - u.x) * 0.12;
  u.y += (ty - u.y) * 0.12;
  u.face = tx < u.x ? -1 : 1;
  u.motion = moving ? 'swim' : 'idle';
}
function drawBossUmimi(camX) {
  const u = bossUmimi;
  if (!u.active || curArea.boss !== 'lily') return;
  const anim = u.state === 'enter' ? 'enter' : u.state === 'exit' ? 'exit' : u.motion;
  const fr = sheetFrame('umimi', anim, u.t >> 3);
  if (!fr) return;
  const x = Math.round(u.x - camX), y = Math.round(u.y);
  if (u.state === 'enter') {
    g.save(); g.globalAlpha = Math.min(0.45, u.t / 60);
    g.fillStyle = '#fff1d4'; g.beginPath(); g.arc(x, y - 13, 16, 0, Math.PI * 2); g.fill(); g.restore();
  }
  g.drawImage(pick(fr, u.face, false), x - 16, y - 32);
}

// ---- allies (from the map: A / N / S) ----
const ALLY_LINES = {
  A0: 'この先、道が分かれている…上を行って。',
  A1: 'ここは覚えておく。倒れても、ここから。',
  N: '援護するわ。落ち着いて進んで。',
  R: '…ん。面倒だけど、手伝ってやるよ。',
  K: 'ふふ、迷うでないぞ。わらわの狐火が道を照らしてやろう。',
  S: '青天が歌ってあげる！がんばって！',
  I: '海音ちゃん、ウミミを連れていって！きっと力になるよ♪',
};
function makeAlly(s) {
  const cp = (s.type === 'A' || s.type === 'L') && s.c === CP_C;
  const line = s.type === 'L' ? null : s.type === 'A' ? (cp ? ALLY_LINES.A1 : ALLY_LINES.A0) : ALLY_LINES[s.type];
  return { type: s.type, c: s.c, r: s.r, x: s.c * TS + TS / 2, y: (s.r + 1) * TS, face: -1, t: 0, said: false, bubbleT: 0, act: 0, cp: cp, line: line };
}
let FLOOR_Y = 0, ROOM_L = 0, ROOM_R = 0;
function buildActors() {
  enemies.length = 0; for (const sp of spawns) enemies.push(makeEnemy(sp));
  // an ally only helps in a stage once she has been rescued (or is a listed guest of this area)
  // the checkpoint Astarte is replaced by a star lantern when she can't help here (not rescued yet / her own stage)
  allies.length = 0;
  for (const sp of allySpawns) {
    if (allyAvailable(sp.type)) allies.push(makeAlly(sp));
    else if (sp.type === 'A' && sp.c === CP_C) allies.push(makeAlly({ type: 'L', c: sp.c, r: sp.r }));
  }
  // Rescued Lily appears only when selected as support, and never in her own stage.
  if (curArea.friend !== 'lily' && progress.support === 'lily' && isRescued('lily')) {
    const lc = Math.min(COLS - 2, START_C + 3);
    allies.push(makeAlly({ type: 'I', c: lc, r: START_R }));
  }
  FLOOR_Y = (BOSS_R + 1) * TS; ROOM_L = ROOM_X + TS; ROOM_R = ROOM_X + VW - TS;
}
function allyAvailable(type) {
  const area = curArea;
  if (ALLY_FRIEND[type] === area.friend) return false; // never a helper in her own DARK stage
  return (area.guests && area.guests.includes(type)) || isRescued(ALLY_FRIEND[type]);
}
let curArea = AREAS[0];
// switch the world to an area: map -> tiles/background -> actors
function loadArea(area) {
  curArea = area;
  loadMap(area.map); buildBackground(THEMES[area.theme] || THEMES.sunset); buildLevel(); buildActors();
}

let state = 'title', stateT = 0, frame = 0, hitStop = 0, shakeT = 0, shakeMag = 0;
let checkpoint = false, doorClosed = false, doorAnim = 0, introPhase = 0, titleScroll = 0;
function setState(s) { state = s; stateT = 0; if (typeof helpBtn !== 'undefined') refreshSupportButton(); }

// ---------------------------------------------------------------------
//  Tile collision
// ---------------------------------------------------------------------
function solid(c, r) {
  if (c < 0 || c >= COLS) return true;
  if (r < 0 || r >= ROWS) return false;
  const t = grid[r * COLS + c];
  return t === T_ROCK || t === T_GIRDER || (t === T_DOOR && doorClosed);
}
function moveX(o) {
  if (o.vx === 0) return false;
  o.x += o.vx;
  const r0 = Math.floor(o.y / TS), r1 = Math.floor((o.y + o.h - 0.01) / TS);
  if (o.vx > 0) { const c = Math.floor((o.x + o.w - 0.01) / TS); for (let r = r0; r <= r1; r++) if (solid(c, r)) { o.x = c * TS - o.w; return true; } }
  else { const c = Math.floor(o.x / TS); for (let r = r0; r <= r1; r++) if (solid(c, r)) { o.x = (c + 1) * TS; return true; } }
  return false;
}
function moveY(o) {
  o.onGround = false;
  if (o.vy === 0) return false;
  o.y += o.vy;
  const c0 = Math.floor(o.x / TS), c1 = Math.floor((o.x + o.w - 0.01) / TS);
  if (o.vy > 0) { const r = Math.floor((o.y + o.h - 0.01) / TS); for (let c = c0; c <= c1; c++) if (solid(c, r)) { o.y = r * TS - o.h; o.vy = 0; o.onGround = true; return true; } }
  else { const r = Math.floor(o.y / TS); for (let c = c0; c <= c1; c++) if (solid(c, r)) { o.y = (r + 1) * TS; o.vy = 0; return true; } }
  return false;
}
function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
// player attacks vs enemy HURTBOX (contact box extended upward by e.hurtUp)
function hitsEnemy(a, e) { return a.x < e.x + e.w && a.x + a.w > e.x && a.y < e.y + e.h && a.y + a.h > e.y - e.hurtUp; }

// ---------------------------------------------------------------------
//  Particles / effects (pooled)
// ---------------------------------------------------------------------
function spawnPart(x, y, vx, vy, life, kind, col) {
  for (let i = 0; i < parts.length; i++) { const p = parts[i]; if (!p.active) { p.active = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.kind = kind; p.col = col; return p; } }
  return null;
}
const DIR8X = [1, 0.7071, 0, -0.7071, -1, -0.7071, 0, 0.7071], DIR8Y = [0, 0.7071, 1, 0.7071, 0, -0.7071, -1, -0.7071];
function popAt(x, y, col) {
  spawnPart(x, y, 0, 0, 8, 3, '#ffffff');
  spawnPart(x, y, 0, 0, 14, 1, col);
  for (let i = 0; i < 6; i++) { const h = hash(frame + i, i * 31); spawnPart(x, y, ((h & 255) / 128 - 1) * 2, -((h >> 8) & 255) / 100 - 0.5, 20 + (h & 7), 0, i & 1 ? col : '#ffffff'); }
}
function splashAt(x, y, dir) { // water bullet impact
  spawnPart(x, y, 0, 0, 9, 1, '#bfeaff');
  for (let i = 0; i < 5; i++) { const h = hash(frame * 3 + i, i * 17); spawnPart(x, y, -dir * ((h & 127) / 64) + ((h >> 7) & 63) / 64 - 0.5, -((h >> 13) & 127) / 50 - 0.4, 14 + (h & 7), 0, i & 1 ? '#7fd6ff' : '#ffffff'); }
}
function orbBurst(x, y, speed, col) {
  for (let i = 0; i < 8; i++) {
    spawnPart(x, y, DIR8X[i] * speed, DIR8Y[i] * speed, 90, 2, col);
    spawnPart(x, y, DIR8X[i] * speed * 0.5, DIR8Y[i] * speed * 0.5, 90, 2, col);
  }
}
function shake(t, m) { if (shakeT <= 0 || m >= shakeMag) shakeMag = m; if (t > shakeT) shakeT = t; }

// ---------------------------------------------------------------------
//  Stage setup
// ---------------------------------------------------------------------
function resetStage(fromCP) {
  if (curArea.final) finalOnReset();
  const c = fromCP ? CP_C : START_C, r = fromCP ? CP_R : START_R;
  P.x = c * TS + 3; P.y = (r + 1) * TS - P.h; P.vx = 0; P.vy = 0; P.face = 1; P.onGround = true; P.coyote = 0; P.jumpBuf = 0;
  P.jumping = false; P.shootT = 0; P.cool = 0; P.autoT = 0; P.shootBuf = 0; P.hp = playerMaxHP(); P.inv = 0; P.hurt = 0; P.dead = false; P.animT = 0;
  for (const s of shots) s.active = false;
  for (const b of bullets) b.active = false;
  for (const p of parts) p.active = false;
  for (const e of enemies) {
    const def = e.type === 'W' ? CONFIG.enemy.walker : e.type === 'H' ? CONFIG.enemy.hopper : CONFIG.enemy.flyer;
    e.hp = def.hp; e.alive = true; e.active = false; e.flash = 0; e.vx = 0; e.vy = 0; e.face = -1; e.t = 0; e.fireT = 60;
    e.x = e.c * TS + (TS - e.w) / 2; e.y = e.type === 'F' ? e.r * TS : (e.r + 1) * TS - e.h; e.homeX = e.x; e.homeY = e.y;
  }
  for (const r of arrows) r.active = false;
  for (const a of allies) { a.said = false; a.bubbleT = 0; a.act = 0; a.t = 0; }
  bossReset();
  magic.mp = CONFIG.magicMaxMP; magic.regen = 0; magic.orb = null; magic.cooldown = 0;
  support.used = false; support.t = 0; support.active = false; support.hit = false; resetStageUmimi(); refreshSupportButton();
  doorClosed = false; doorAnim = 0; introPhase = 0; hitStop = 0; shakeT = 0;
  cam.x = clampCam(P.x + P.w / 2 - VW / 2);
  setState('ready');
}
function bossReset() {
  const T = bossType(), b = boss;
  resetBossUmimi();
  b.dark = true; b.pose = 'idle'; b.poseF = -1; b.hopY = 0; b.w = T.w; b.h = T.h; b.alpha = 1; b.hidden = false; b.rainN = 0; b.warn = 0;
  b.state = 'off'; b.triggered = false; b.hp = bossCfg().hp; b.hpShown = 0; b.inv = 0; b.flash = 0; b.fireT = 0; b.vx = 0; b.vy = 0;
  b.weapon = 'sword'; b.nextWeapon = ''; b.comboLeft = 0; b.chainB = null; b.chainReach = 0; b.recT = 0;
  b.clones = []; b.fanB = null; b.pillars = []; b.blink = false; b.wisps = [];
  b.fateN = 0; b.fateShow = 0; b.chipCols = []; b.allin = false; b.allinStep = 0; b.balls = 0; b.cardW = 0; b.cardAngs = null;
  b.seen.length = 0; b.last = ''; b.multi = false; b.didMulti = false; b.warp2 = false; b.eclipseFinisher = false; b.pvx = 0; b.onGround = false; b.aimShow = false;
  b.ricoShow = false; b.ricoLock = false; b.ricoN = 0; b.combo = false; b.pr = false; b.starRainT = 0; for (let i = 0; i < b.markT.length; i++) b.markT[i] = 0;
  b.bag.length = 0; b.counterCD = 0;
}
function startGame(area) {
  if (area && area !== curArea) loadArea(area);
  if (curArea.final) finalBegin();
  checkpoint = DEBUG.boss; stats.playFrames = 0; stats.kills = 0;
  sfx('start'); resetStage(checkpoint);
}

// ---------------------------------------------------------------------
//  Progress (localStorage) + STAGE SELECT (3x3, centre = final area)
// ---------------------------------------------------------------------
const PROGRESS_KEY = 'rockside2_progress_v1';

const progress = { cleared: [], rescued: [], support: null, seen: [] }; // area ids cleared / friend ids rescued (joined as allies)
function loadProgress() {
  try { const d = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
    if (d && Array.isArray(d.cleared)) progress.cleared = d.cleared.filter(id => typeof id === 'string');
    if (d && Array.isArray(d.rescued)) progress.rescued = d.rescued.filter(id => typeof id === 'string');
    if (d && SUPPORT_ROSTER.includes(d.support)) progress.support = d.support;
    if (d && Array.isArray(d.seen)) progress.seen = d.seen.filter(id => typeof id === 'string'); } catch (_) {}
  if (QS.get('supporttest') === '1') progress.support = SUPPORT_ROSTER.includes(QS.get('supportfriend')) ? QS.get('supportfriend') : 'tobiume';
}
function saveProgress() { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify({ cleared: progress.cleared, rescued: progress.rescued, support: progress.support, seen: progress.seen })); } catch (_) {} }
function markCleared(area) {
  if (!progress.cleared.includes(area.id)) progress.cleared.push(area.id);
  if (area.friend && !progress.rescued.includes(area.friend)) progress.rescued.push(area.friend);
  if (area.friend === 'tobiume' && !progress.support) progress.support = 'tobiume';
  saveProgress();
}
function eraseProgress() { progress.cleared.length = 0; progress.rescued.length = 0; progress.support = null; progress.seen.length = 0; try { localStorage.removeItem(PROGRESS_KEY); } catch (_) {} }
function isCleared(id) { return progress.cleared.includes(id); }
function isRescued(friend) { return !!friend && progress.rescued.includes(friend); }
// One equippable rescue special at a time.
const SUPPORT_ROSTER = ['tobiume', 'neenia', 'seiten', 'astarte', 'lily', 'star', 'shiranui', 'diceroll'];
const SUPPORT_NAMES = { tobiume: '飛梅', neenia: 'ネーニア', seiten: '青天', astarte: 'アスターテ', lily: 'リリィ', star: 'スターさん', shiranui: 'シラヌイ', diceroll: 'ダイスロール' };
const SUPPORT_TAGS = { tobiume: 'TOBIUME', neenia: 'NENIA', seiten: 'SEITEN', astarte: 'ASTARTHE', lily: 'LILY', star: 'STAR', shiranui: 'SHIRANUI', diceroll: 'DICEROLL' };
const support = { active: false, used: false, t: 0, hit: false, x: 0, y: -45, face: 1, kind: null, camX: 0 };
function supportUnlocked(id) { return isRescued(id) || (QS.get('supporttest') === '1' && SUPPORT_ROSTER.includes(id)); }
function equippedSupport() { return progress.support && supportUnlocked(progress.support) && curArea.friend !== progress.support ? progress.support : null; }
function refreshSupportButton() {
  const ok = (state === 'play' || state === 'ready') && !!equippedSupport() && !P.dead;
  helpBtn.style.display = ok ? 'flex' : 'none';
  const id = equippedSupport();
  const lilyReady = id !== 'lily' || (stageUmimi.given && stageUmimi.active && !stageUmimi.down && stageUmimi.hp > 0);
  helpBtn.textContent = id === 'lily' && !lilyReady ? (stageUmimi.down ? 'DOWN' : 'WAIT') : support.used ? 'USED' : ({ tobiume: 'KICK', neenia: 'RAIN', seiten: 'SONG', astarte: 'SLASH', lily: 'LIVE', star: 'MORPH', shiranui: 'FOX', diceroll: 'ROLL' }[id] || 'HELP');
  helpBtn.style.borderColor = ({ tobiume: '#ffa8cf', neenia: '#a3c6ff', seiten: '#ff98a8', astarte: '#c4b2ff', lily: '#ffd2ef', star: '#71d9ff', shiranui: '#ff8a7a', diceroll: '#ffd860' }[id] || '#ffa8cf');
  helpBtn.classList.toggle('used', support.used);
}
function cycleSupport() {
  const open = SUPPORT_ROSTER.filter(supportUnlocked);
  if (!open.length) { sfx('buzz'); selMessage('仲間を救出するとサポートが解放されるよ', 'RESCUE A FRIEND FIRST'); return; }
  const n = open.indexOf(progress.support);
  progress.support = n < 0 ? open[0] : (n + 1 === open.length ? null : open[n + 1]);
  saveProgress(); sfx('cursor');
  const name = SUPPORT_NAMES[progress.support];
  selMessage(name ? name + 'をサポートにセット！' : 'サポートを外したよ', ({ tobiume: 'SUPER ULTRA TOBIUME KICK!', neenia: 'NENIA: STARFALL ARROWS!', seiten: 'SEITEN: GUARDIAN SONG!', astarte: 'ASTARTHE: MOON CLEAVE!', lily: 'LILY & UMIMI: STARLIGHT RAIN!', star: 'STAR: ALCHEMY MORPH SLASH!', shiranui: 'SHIRANUI: FOXFIRE DANCE!', diceroll: 'DICEROLL: LUCKY ROLL!' })[progress.support] || 'SUPPORT: NONE');
}
function outerAreas() { return AREAS.filter(a => !a.final); }
function clearedCount() { return outerAreas().filter(a => isCleared(a.id)).length; }
function finalUnlocked() { return DEBUG.unlockAll || clearedCount() >= 8; }
function areaAtSlot(slot) { for (const a of AREAS) if (a.slot === slot) return a; return null; }
loadProgress();
buildActors();

// geometry of the grid in game pixels (shared with the renderer and tap handling)
const SEL = { x0: 8, y0: 23, cw: 76, ch: 70, gx: 6, gy: 3 };
function cellRect(slot) { const c = slot % 3, r = (slot / 3) | 0; return { x: SEL.x0 + c * (SEL.cw + SEL.gx), y: SEL.y0 + r * (SEL.ch + SEL.gy), w: SEL.cw, h: SEL.ch }; }
const SEL_BACK = { x: 3, y: 4, w: 36, h: 13 };
const SEL_SUPPORT = { x: 43, y: 3, w: 80, h: 15 };   // header: TITLE | SUP box | STAGES | n/8 (no overlap)
const TITLE_HARD = { x: 3, y: 3, w: 62, h: 13 };
const TITLE_RESET = { x: 186, y: 3, w: 67, h: 12 };  // "ERASE DATA" button on the title (shown when there is progress)
let selCursor = 0, selMsg = null, selMsgT = 0, introArea = null, resetArmT = 0;
function selMessage(jp, en) { selMsg = { jp: jp, en: en }; selMsgT = 110; }
function openSelect(slot) { if (slot !== undefined) selCursor = slot; selMsg = null; selMsgT = 0; setState('select'); }
function chooseSlot(slot) {
  const a = areaAtSlot(slot); selCursor = slot;
  if (!a) return;
  if (a.final && !finalUnlocked()) { sfx('buzz'); selMessage('8つのエリアをすべてクリアすると解放されます', 'CLEAR ALL 8 AREAS'); return; }
  if (a.reserved) { sfx('buzz'); selMessage('まだ見ぬ友だちの席…', '??? - COMING SOON'); return; }
  if (!a.map) { sfx('buzz'); selMessage(a.bossName + ' のステージは準備中です', 'COMING SOON'); return; }
  introArea = a; selMsg = null; sfx('select'); setState('areaIntro');
}
function updateSelect() {
  if (selMsgT > 0) { selMsgT--; if (selMsgT <= 0) selMsg = null; }
  if (stateT < 8) return;
  if (inp.supportCyclePressed) { cycleSupport(); return; }
  let c = selCursor % 3, r = (selCursor / 3) | 0, moved = false;
  // left/right walk through all 9 cells in reading order (touch d-pad has no up/down); up/down change row
  if (inp.leftPressed) { selCursor = (selCursor + 8) % 9; moved = true; }
  else if (inp.rightPressed) { selCursor = (selCursor + 1) % 9; moved = true; }
  else if (inp.upPressed) { selCursor = ((r + 2) % 3) * 3 + c; moved = true; }
  else if (inp.downPressed) { selCursor = ((r + 1) % 3) * 3 + c; moved = true; }
  if (moved) { sfx('cursor'); selMsg = null; selMsgT = 0; return; }
  if (inp.backPressed) { setState('title'); return; }
  if (inp.jumpPressed || inp.shootPressed || inp.enterPressed) {
    if (selMsg && selMsgT < 104) { selMsg = null; selMsgT = 0; return; } // a press closes the message (short debounce)
    if (!selMsg) chooseSlot(selCursor);
  }
}
function updateAreaIntro() {
  if (stateT === 30) sfx('intro');
  if (stateT >= CONFIG.introFrames || (stateT > 70 && (inp.startPressed || inp.jumpPressed || inp.shootPressed))) startGame(introArea);
}
// taps inside the game view (called from the pointer handler, game-pixel coords). true = consumed
function screenTap(x, y) {
  const inR = (R) => x >= R.x && x < R.x + R.w && y >= R.y && y < R.y + R.h;
  if (state === 'select') {
    if (stateT < 8) return true;
    if (inR(SEL_BACK)) { inp.backPressed = true; return true; }
    if (inR(SEL_SUPPORT)) { cycleSupport(); return true; }
    if (selMsg && selMsgT < 104) { selMsg = null; selMsgT = 0; return true; }
    for (let slot = 0; slot < 9; slot++) if (inR(cellRect(slot))) { if (!selMsg) { if (slot !== selCursor) sfx('cursor'); chooseSlot(slot); } return true; }
    return true; // taps between cells do nothing
  }
  if (state === 'title' && inR(TITLE_HARD)) { toggleHardMode(); return true; }
  if (state === 'title' && clearedCount() > 0 && inR({ x: TITLE_RESET.x - 4, y: 0, w: TITLE_RESET.w + 8, h: TITLE_RESET.h + 6 })) { inp.resetPressed = true; return true; }
  return false;
}
function clampCam(x) {
  if (boss.triggered && state !== 'bossIntro') return ROOM_X; // locked inside the boss room
  const max = boss.triggered ? ROOM_X : ROOM_X - VW + TS;
  return Math.max(0, Math.min(max, x));
}

// ---------------------------------------------------------------------
//  Player
// ---------------------------------------------------------------------
function activeShots() { let n = 0; for (let i = 0; i < shots.length; i++) if (shots[i].active) n++; return n; }
function fireShot() {
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i]; if (s.active) continue;
    // water bullet leaves the staff tip (position depends on which art is used)
    const K = SHEETS.kanon ? SHEET_DEFS.kanon : null;
    const fw = K ? K.fw : HERO_W, fh = K ? K.fh : HERO_H, cx = K ? K.cx : HERO_CX, tipX = K ? K.tipX : 26, tipY = K ? K.tipY : 16;
    if (SEQUEL_MODEL.size !== 32 && SEQUEL_MODEL.frames.length) {
      const m = sequelMuzzle(); s.active = true; s.vx = P.face * CONFIG.shotSpeed;
      s.x = P.face > 0 ? m.x - 4 : m.x - s.w + 4; s.y = m.y - 2;
      P.cool = CONFIG.shotCooldown; P.autoT = CONFIG.autoFireInterval; P.shootT = CONFIG.shootPoseFrames; stats.shots++; sfx('shot'); return;
    }
    const tip = P.face > 0 ? P.x + P.w / 2 - cx + tipX : P.x + P.w / 2 - (fw - cx) + (fw - 1 - tipX);
    s.active = true; s.vx = P.face * CONFIG.shotSpeed; s.y = P.y + P.h - fh + tipY - 2;
    s.x = P.face > 0 ? tip - 4 : tip - s.w + 4;
    P.cool = CONFIG.shotCooldown; P.autoT = CONFIG.autoFireInterval; P.shootT = CONFIG.shootPoseFrames;
    stats.shots++; sfx('shot'); return;
  }
}
function castWaterOrb() {
  if (magic.cooldown || magic.mp < CONFIG.magicOrbCost || P.dead) { sfx('buzz'); return; }
  const x = Math.max(4, Math.min(LEVEL_W - 28, Math.round(P.x + P.w / 2 + P.face * 27 - 12)));
  const y = Math.max(44, Math.round(P.y - 14));
  // No casting into rock, doors or occupied ceiling space.
  for (const [dx, dy] of [[0, 0], [23, 0], [0, 7], [23, 7]]) {
    if (solid(Math.floor((x + dx) / TS), Math.floor((y + dy) / TS))) { sfx('buzz'); return; }
  }
  magic.orb = { x, y, w: 24, h: 8, life: CONFIG.magicOrbLife };
  magic.mp -= CONFIG.magicOrbCost; magic.regen = 0; magic.cooldown = 18;
  for (let k = 0; k < 8; k++) spawnPart(x + 12, y + 4, DIR8X[k], DIR8Y[k], 24, 0, '#89ebff');
  sfx('cp');
}
function updateMagic() {
  if (magic.cooldown > 0) magic.cooldown--;
  if (magic.orb && --magic.orb.life <= 0) magic.orb = null;
  if (magic.mp < CONFIG.magicMaxMP && ++magic.regen >= CONFIG.magicRegenFrames) {
    magic.regen = 0; magic.mp++;
  }
  if (inp.magicPressed) castWaterOrb();
}
function updatePlayer() {
  const p = P;
  if (inp.jumpPressed) p.jumpBuf = CONFIG.jumpBufferFrames;
  if (inp.shootPressed) p.shootBuf = 4;
  if (p.cool > 0) p.cool--;
  if (p.autoT > 0) p.autoT--;
  if (p.shootT > 0) p.shootT--;
  if (p.inv > 0) p.inv--;

  if (p.hurt > 0) {
    p.hurt--; p.vx = p.knockDir * CONFIG.knockbackSpeed;
  } else {
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (dir !== 0) {
      if (p.vx * dir < 0) p.vx = 0;
      p.vx += dir * (p.onGround ? CONFIG.runAccel : CONFIG.airAccel);
      if (p.vx * dir > CONFIG.runSpeed) p.vx = dir * CONFIG.runSpeed;
      p.face = dir;
    } else {
      if (Math.abs(p.vx) <= CONFIG.stopDecel) p.vx = 0; else p.vx -= Math.sign(p.vx) * CONFIG.stopDecel;
    }
    if (p.jumpBuf > 0 && (p.onGround || p.coyote > 0)) {
      p.vy = -CONFIG.jumpVel; p.onGround = false; p.coyote = 0; p.jumpBuf = 0; p.jumping = true; stats.jumps++; sfx('jump');
    }
    if (p.jumping && !inp.jump && p.vy < -CONFIG.jumpCutVel) p.vy = -CONFIG.jumpCutVel;
    const wantShot = p.shootBuf > 0 || (CONFIG.autoFire && inp.shoot && p.autoT <= 0);
    if (wantShot && p.cool <= 0 && activeShots() < CONFIG.maxShots) { fireShot(); p.shootBuf = 0; }
  }
  if (p.jumpBuf > 0) p.jumpBuf--;
  if (p.shootBuf > 0) p.shootBuf--;

  p.vy += CONFIG.gravity; if (p.vy > CONFIG.maxFall) p.vy = CONFIG.maxFall;
  const previousFeet = p.y + p.h;
  moveX(p); moveY(p);
  // Falling only: the temporary orb acts like a one-way platform.
  const orb = magic.orb;
  if (orb && p.vy >= 0 && previousFeet <= orb.y + 3 && p.y + p.h >= orb.y &&
      p.x + p.w > orb.x + 2 && p.x < orb.x + orb.w - 2) {
    p.y = orb.y - p.h; p.vy = 0; p.onGround = true;
  }
  if (p.onGround) { p.coyote = CONFIG.coyoteFrames; p.jumping = false; } else if (p.coyote > 0) p.coyote--;
  if (p.onGround && p.vx !== 0) p.animT++; else if (p.onGround) p.animT = 0;
  if (p.y > VH + 24) killPlayer(true);
}
function hurtPlayer(dmg, srcCx) {
  if (P.inv > 0 || P.dead || DEBUG.god) return;
  P.hp = Math.max(0, P.hp - dmg); stats.hits++;
  if (P.hp <= 0) { killPlayer(false); return; }
  P.inv = CONFIG.invincFrames; P.hurt = CONFIG.knockbackFrames;
  P.knockDir = srcCx < P.x + P.w / 2 ? 1 : -1; P.face = -P.knockDir;
  if (P.vy < 0) P.vy = 0; P.jumping = false; P.shootT = 0;
  hitStop = CONFIG.hurtHitStop; shake(8, CONFIG.hurtShake); sfx('hurt');
}
function killPlayer(pit) {
  if (P.dead) return;
  P.dead = true; if (pit) P.hp = 0; stats.deaths++;
  if (pit) sfx('fall'); else { orbBurst(P.x + P.w / 2, P.y + P.h / 2, 1.6, '#8fb4f5'); sfx('death'); shake(10, 2); }
  setState('dying');
}

// ---------------------------------------------------------------------
//  Enemies
// ---------------------------------------------------------------------
function updateEnemies() {
  const m = CONFIG.enemy.activateMargin, pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i]; if (!e.alive) continue;
    e.active = e.x + e.w > cam.x - m && e.x < cam.x + VW + m;
    if (!e.active) continue;
    if (e.flash > 0) e.flash--;
    e.t++;
    if (e.type === 'W') {
      const d = CONFIG.enemy.walker;
      if (e.t === 1) e.face = pcx < e.x ? -1 : 1;
      e.vx = e.face * d.speed;
      if (moveX(e)) e.face = -e.face;
      e.vy = Math.min(e.vy + CONFIG.gravity, CONFIG.maxFall); moveY(e);
      if (e.onGround) {
        const fx = e.face > 0 ? e.x + e.w + 1 : e.x - 1;
        if (!solid(Math.floor(fx / TS), Math.floor((e.y + e.h + 2) / TS))) e.face = -e.face;
      }
    } else if (e.type === 'H') {
      const d = CONFIG.enemy.hopper;
      if (e.onGround) {
        e.vx = 0;
        if (e.t >= d.waitFrames) { e.face = pcx < e.x + e.w / 2 ? -1 : 1; e.vy = -d.jumpVel; e.vx = e.face * d.hopSpeed; e.t = 0; }
      }
      const jumpedNow = e.vy < 0 && e.t === 0;
      e.vy = Math.min(e.vy + CONFIG.gravity, CONFIG.maxFall);
      if (moveX(e)) e.vx = 0;
      const wasAir = !e.onGround || jumpedNow; moveY(e);
      if (e.onGround && wasAir && !jumpedNow) e.t = 0;
    } else if (e.type === 'F') {
      const d = CONFIG.enemy.flyer;
      const dx = pcx - (e.x + e.w / 2);
      if (Math.abs(dx) > 36) e.x += dx > 0 ? d.speed : -d.speed;
      if (e.x < e.homeX - d.leash) e.x = e.homeX - d.leash;
      if (e.x > e.homeX + d.leash) e.x = e.homeX + d.leash;
      e.face = dx < 0 ? -1 : 1;
      e.y = e.homeY + Math.sin(e.t * 0.05) * d.bobAmp;
      if (--e.fireT <= 0) {
        e.fireT = d.fireInterval;
        if (!P.dead && e.x > cam.x && e.x + e.w < cam.x + VW) {
          const bx = e.x + e.w / 2, by = e.y + e.h + 2, ax = pcx - bx, ay = pcy - by, len = Math.hypot(ax, ay) || 1;
          spawnBullet(bx - 2, by, ax / len * d.bulletSpeed, ay / len * d.bulletSpeed, 0, CONFIG.enemy.bulletDamage);
        }
      }
    }
    if (e.y > VH + 16) e.alive = false;
  }
}
function spawnBullet(x, y, vx, vy, kind, dmg) {
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i]; if (b.active) continue;
    b.active = true; b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.kind = kind; b.dmg = dmg; b.life = 0; b.t = 0; b.orbit = false; b.g = 0; b.bnc = 0; b.ret = 0; b.returned = false; b.dspr = -1; b.sspr = -1; b.hook = null;
    const sz = BULLET_SIZE[kind] || BULLET_SIZE[2]; b.w = sz[0]; b.h = sz[1];
    return b;
  }
  return null;
}
const BULLET_SIZE = { 0: [4, 4], 2: [5, 5], 3: [5, 5], 4: [8, 11], 6: [5, 5], 7: [3, 10], 8: [10, 26], 9: [12, 20], 10: [8, 8], 11: [6, 6], 12: [34, 32], 17: [12, 12], 18: [10, 10], 19: [6, 6], 20: [5, 8],
  13: [4, 6], 14: [5, 5], 15: [4, 6], 16: [26, 9],
  21: [12, 4], 22: [8, 8], 23: [7, 7],  // Disaster: 21 spear bolt, 22 whip-sword lash (width set every frame), 23 cannon orb
  24: [8, 8], 25: [8, 8], 27: [14, 14], 28: [12, 38],
  29: [12, 12], 30: [8, 12], 31: [12, 12], 32: [7, 7], 33: [12, 12], 34: [6, 8] }; // DiceRoll: 29 die, 30 card, 31 chip, 32 roulette ball, 33 flaming die, 34 ember // Shiranui: 24 foxfire, 25 wisp, 27 spinning fan, 28 fire pillar (crescent = kind 9)
function killEnemy(e) { e.alive = false; popAt(e.x + e.w / 2, e.y + e.h / 2, enemyColor(e)); sfx('pop'); stats.kills++; hitStop = CONFIG.killHitStop; shake(4, 1); }
function enemyDamage(e) { return e.type === 'W' ? CONFIG.enemy.walker.damage : e.type === 'H' ? CONFIG.enemy.hopper.damage : CONFIG.enemy.flyer.damage; }
function enemyColor(e) { return e.type === 'W' ? '#ff9a3c' : e.type === 'H' ? '#5fd35a' : '#a45ee5'; }

// ---------------------------------------------------------------------
//  Bosses. Shared: boss object, enter (drop in through the ceiling hatch), HP fill, damage,
//  rescue sequence. Each type in BOSS_TYPES has its own AI (BOSS_AI[type]) for the fight.
// ---------------------------------------------------------------------
function bossSet(s) { boss.state = s; boss.t = 0; }
function bossCfg() { const c = curArea.boss === 'tobiume' ? CONFIG.boss : CONFIG.bosses[curArea.boss]; return curArea.final ? finalCfg(c) : c; }
function bossType() { return BOSS_TYPES[curArea.boss] || BOSS_TYPES.tobiume; }
function bossFacePlayer() { boss.face = (P.x + P.w / 2 < boss.x + boss.w / 2) ? -1 : 1; }
function bossRage() { return hardMode || boss.hp <= bossCfg().hp / 2; }
function bossSeen(name) { if (!boss.seen.includes(name)) boss.seen.push(name); }
// gravity for the ground bosses; returns true on the frame she lands
function bossFall(b) {
  b.vy = Math.min(b.vy + CONFIG.gravity, CONFIG.maxFall); b.y += b.vy;
  if (b.y + b.h >= FLOOR_Y) { b.y = FLOOR_Y - b.h; const was = !b.onGround; b.onGround = true; b.vy = 0; return was; }
  b.onGround = false; return false;
}
// projectile origin from the sprite (muzzle point of the dark sheet) or a fallback offset
function bossMuzzle(b, dx, dy) {
  const T = SHEET_DEFS[bossType().dark];
  if (T && SHEETS[bossType().dark] && T.muzX !== undefined) { b.mx = b.x + b.w / 2 + b.face * (T.muzX - T.cx); b.my = b.y + b.h - T.fh + T.muzY; }
  else { b.mx = b.x + b.w / 2 + b.face * dx; b.my = b.y + b.h - dy; }
}
function bossDust(b, n) { for (let i = 0; i < n; i++) spawnPart(b.x + b.w / 2, FLOOR_Y - 2, (i - (n - 1) / 2) * 0.6, -0.8 - (i & 1) * 0.6, 16, 0, bossType().dust || '#a0a0c0'); }
function updateBoss() {
  const b = boss, B = bossCfg(), T = bossType(); if (b.state === 'off') return;
  if (b.inv > 0) b.inv--;
  if (b.flash > 0) b.flash--;
  if (b.fireT > 0) b.fireT--;
  for (let i = 0; i < b.markT.length; i++) if (b.markT[i] > 0) b.markT[i]--;
  if (b.alpha < 1 && !b.hidden) b.alpha = Math.min(1, b.alpha + 0.08);
  b.t++;
  if (curArea.boss === 'lily') updateBossUmimi(b);
  b.pvx = b.pvx * 0.9 + P.vx * 0.1; // smoothed player speed (Neenia leads her aim with it)
  if (b.dark && !b.hidden && (frame % 3) === 0) { // dark aura wisps
    const h = hash(frame, 7); spawnPart(b.x - 6 + (h % (b.w + 12)), b.y + 4 + ((h >> 8) % b.h), 0, -0.45, 22, 4, (h >> 16) & 1 ? T.aura[0] : T.aura[1]);
  }
  if (b.state === 'rescue') { if (curArea.final && finalRescue(b)) return; bossRescue(b, B, T); return; }
  if (curArea.boss !== 'tobiume') {
    if (b.state === 'enter') { // drop in through the hatch (Astarte floats down)
      b.pose = T.fly ? 'glide' : 'leap'; b.poseF = T.fly ? -1 : 0;
      if (T.fly) { b.y += 1.4; if (b.y >= FLOOR_Y - b.h - B.floatGap) { b.y = FLOOR_Y - b.h - B.floatGap; sfx('land'); bossSet('fill'); } }
      else if (bossFall(b)) { shake(8, 2); sfx('land'); bossDust(b, 6); bossSet('fill'); }
      return;
    }
    if (b.state === 'fill') {
      b.pose = 'idle'; b.poseF = -1; bossFacePlayer(); if (T.fly) astarteFloat(b, B);
      if ((b.t & 1) === 0 && b.hpShown < b.hp) { b.hpShown++; sfx('tick'); }
      if (b.hpShown >= b.hp && b.t > 20) {
        if (curArea.boss === 'lily') { bossSet('lilyRain'); bossSeen('rain'); }
        else bossSet('hover');
        setState('play');
      }
      return;
    }
  }
  if (curArea.boss === 'astarte') astarteUpdateStarRain(b, B);
  BOSS_AI[curArea.boss](b, B, P.x + P.w / 2, P.y + P.h / 2);
  b.x = Math.max(ROOM_L, Math.min(ROOM_R - b.w, b.x));
  if (b.y + b.h > FLOOR_Y) b.y = FLOOR_Y - b.h;
}
function bossHittable() { const st = boss.state; return st !== 'off' && st !== 'enter' && st !== 'fill' && st !== 'rescue' && !boss.hidden; }
function damageBoss(s) {
  const b = boss;
  if (!bossHittable()) return false;
  if (b.inv > 0) { sfx('tink'); return true; }
  const hpBefore = b.hp;
  b.hp -= (arguments.length > 1 ? arguments[1] : CONFIG.shotDamage); b.hpShown = Math.max(0, b.hp); b.inv = bossCfg().iFrames; b.flash = bossCfg().iFrames; sfx('bhit');
  if (curArea.final && finalDamageHook(b)) return true;
  // Astarte phase 2: interrupt the current attack on the actual 50% HP crossing,
  // rather than waiting for a long orb animation or the next random choice.
  if (curArea.boss === 'astarte' && hpBefore > bossCfg().hp / 2 && b.hp <= bossCfg().hp / 2 && b.hp > 0 && !b.hidden) {
    bossSeen('eclipse'); b.fireT = 0;
    // Clear old orbit bullets so the transition remains readable. Delayed star rain is independent.
    for (const bb of bullets) if (bb.active && bb.orbit) bb.active = false;
    bossSet('eclipse'); sfx('warn');
  }
  if (b.hp <= 0) {
    b.hp = 0; b.hidden = false; b.alpha = 1; bossSet('rescue'); hitStop = 12; shake(16, 3); sfx('boom');
    for (const bb of bullets) bb.active = false;
    b.rainN = 0; b.warn = 0; b.starRainT = 0; b.ricoShow = false; b.aimShow = false; for (let i = 0; i < b.markT.length; i++) b.markT[i] = 0;
    P.inv = 9999;
  }
  return true;
}
// ---- rescue: flashes, the darkness leaves her, she thanks Umine (shared timeline) ----
//  0-60 dark + flashing (hurt) -> 60 collapses (defeat frame) -> 70 purified: normal sprite
//  -> 110 steps away from Umine if too close, faces her -> 150+ character pose (per type) -> STAGE CLEAR
function bossRescue(b, B, T) {
  const type = curArea.boss;
  if (type === 'tobiume') tobiumeRescuePose(b);
  else {
    b.poseF = -1; b.hopY = 0;
    if (b.t < 60) b.pose = 'hurt'; else if (b.t < 70) b.pose = 'defeat'; else b.pose = 'idle';
    if (b.t >= 150) friendRescuePose(b, type);
    if (b.t >= 110 && b.t < 150) { const dx = b.tx - b.x; if (Math.abs(dx) > 0.5) { b.x += Math.sign(dx) * Math.min(1.4, Math.abs(dx)); b.pose = 'walk'; } }
  }
  if (b.t === 110) { // keep some room from Umine for the pose
    const pc = P.x + P.w / 2, side = (b.x + b.w / 2) >= pc ? 1 : -1;
    let tx = pc + side * 56 - b.w / 2; if (tx < ROOM_L + 8 || tx + b.w > ROOM_R - 8) tx = pc - side * 56 - b.w / 2;
    b.tx = Math.max(ROOM_L + 8, Math.min(ROOM_R - 8 - b.w, tx));
  }
  if (b.t >= 110 && b.t <= 150) bossFacePlayer();
  if (b.y + b.h < FLOOR_Y) b.y = Math.min(FLOOR_Y - b.h, b.y + 0.7);
  if (b.t < 70 && b.t % 8 === 0) { const h = hash(b.t, 5); spawnPart(b.x + (h & 31) - 6, b.y + ((h >> 5) & 31) - 2, 0, -0.5, 20, 1, T.sparkle); sfx('tink'); }
  if (b.t === 70) { b.dark = false; orbBurst(b.x + b.w / 2, b.y + b.h / 2, 1.8, T.sparkle); sfx('rescue'); shake(10, 2); }
  if (b.t > 100 && ((inp.startPressed && b.t > 170) || b.t >= 100 + B.rescueLineFrames)) {
    for (const sh of shots) sh.active = false;
    markCleared(curArea); // saved as soon as the stage is cleared: area cleared + friend rescued
    setState('clear'); sfx('clear');
  }
}
function tobiumeRescuePose(b) {
  // 0-110 hurt (dark until 70) -> 110-150 flutters away / idle -> 150 kick wind-up, hop, front kick held with sparkles, flash -> idle
  b.poseF = 0; b.hopY = 0;
  if (b.t < 110) b.pose = 'hurt';
  else if (b.t < 150) b.pose = 'idle';
  else if (b.t < 158) { b.pose = 'kick'; b.poseF = 0; }
  else if (b.t < 172) { b.pose = 'kick'; b.poseF = 1; b.hopY = -Math.round(Math.sin((b.t - 158) / 14 * Math.PI) * 10); }
  else if (b.t < 222) { b.pose = 'kick'; b.poseF = 2; }
  else if (b.t < 232) { b.pose = 'kick'; b.poseF = 3; }
  else b.pose = 'idle';
  if (b.t >= 110 && b.t < 150) { const dx = b.tx - b.x; if (Math.abs(dx) > 0.5) { b.x += Math.sign(dx) * Math.min(1.6, Math.abs(dx)); b.pose = 'fly'; } }
  if (b.t === 172) { sfx('rescue'); spawnPart(b.x + b.w / 2 + b.face * 12, b.y + b.h - 16, 0, 0, 16, 1, '#ffd0e8'); for (let i = 0; i < 8; i++) spawnPart(b.x + b.w / 2 + b.face * 12, b.y + b.h - 16, DIR8X[i] * 1.2, DIR8Y[i] * 1.2 - 0.6, 26, 0, i & 1 ? '#ffffff' : '#ff8cc0'); }
  if (b.t > 172 && b.t < 222 && b.t % 6 === 0) { const h = hash(b.t, 9); spawnPart(b.x - 8 + (h % (b.w + 16)), b.y + ((h >> 8) % b.h), 0, -0.4, 24, 5, (h >> 4) & 1 ? '#ff8cc0' : '#ffd84a'); }
}
// the rescued friend's little "back to herself" moment (normal 32x32 sheet: 2 frames each)
function friendRescuePose(b, type) {
  const t = b.t - 150, cx = b.x + b.w / 2;
  if (type === 'diceroll') {      // DiceRoll (diceroll.png): stands (0) -> a smoke break (2) -> lazy wave "thanks" (3) / idle
    b.pose = 'pose'; b.poseF = t < 30 ? 0 : t < 100 ? 2 : ((t - 100) >> 5) & 1 ? 0 : 3;
    if (t >= 30 && t < 100 && t % 14 === 0) spawnPart(cx + b.face * 7, b.y + b.h - 22, b.face * 0.15, -0.35, 40, 5, (t >> 4) & 1 ? '#d8d8e0' : '#b0b0bc'); // a thin wisp of smoke
    return;
  }
  if (type === 'shiranui') {      // Shiranui (shiranui.png): bows "thanks" (3) -> happy (2) -> waves her open fan (4) / idle
    b.pose = 'pose'; b.poseF = t < 56 ? 3 : t < 104 ? 2 : ((t - 104) >> 5) & 1 ? 0 : 4;
    if (t === 8) { sfx('cp'); for (let i = 0; i < 8; i++) spawnPart(cx, b.y + 12, DIR8X[i] * 1.1, DIR8Y[i] * 1.1, 26, 0, i & 1 ? '#ffd080' : '#ffffff'); }
    if (t > 8 && t % 7 === 0) { const h = hash(t, 29); spawnPart(cx - 14 + (h % 28), b.y + 6 + ((h >> 8) % 24), 0, -0.4, 26, 4, (h >> 4) & 1 ? '#ffb070' : '#ffe0a0'); }
    return;
  }
  if (type === 'disaster') {      // Star (star.png): raises his cyan sword (6) -> bows "thanks" (4) -> happy (3) / waves (5)
    b.pose = 'pose'; b.poseF = t < 60 ? 6 : t < 104 ? 4 : ((t - 104) >> 5) & 1 ? 5 : 3;
    if (t === 8) { sfx('cp'); for (let i = 0; i < 8; i++) spawnPart(cx + b.face * 10, b.y + 10, DIR8X[i] * 1.2, DIR8Y[i] * 1.2, 24, 0, i & 1 ? '#72eaff' : '#ffffff'); }
    if (t > 8 && t % 6 === 0) { const h = hash(t, 13); spawnPart(cx + b.face * (8 + (h % 8)), b.y + 4 + ((h >> 8) % 20), 0, -0.5, 22, 4, (h >> 4) & 1 ? '#72eaff' : '#e8fbff'); }
    return;
  }
  if (type === 'neenia') {        // lowers her bow: a harmless silver arrow shot into the sky, then idle
    b.poseF = (t >= 20 && t < 44) ? 1 : 0; b.pose = 'pose';
    if (t === 20) { sfx('arrow'); for (let k = 0; k < 10; k++) spawnPart(cx + b.face * 10, b.y + 6 - k * 3, 0, -3.2, 26, 0, k & 1 ? '#e8f0ff' : '#9fd8ff'); }
  } else if (type === 'seiten') { // sings again (both frames) with colourful notes
    b.pose = 'pose'; b.poseF = (t >> 4) & 1; b.hopY = (t % 32) < 6 ? -2 : 0;
    if (t % 9 === 0) { const h = hash(t, 3), k = (h >> 6) % 3; spawnPart(cx + b.face * 6, b.y + 6, ((h & 63) / 64 - 0.5) * 0.8 + b.face * 0.3, -0.6, 50, 5, k === 0 ? '#ff6a8a' : k === 1 ? '#ffd84a' : '#8fd0ff'); }
  } else {                        // Astarte: a guiding star lights up above her
    b.pose = 'pose'; b.poseF = (t >> 5) & 1;
    if (t === 10) { sfx('cp'); for (let i = 0; i < 8; i++) spawnPart(cx, b.y - 8, DIR8X[i] * 1.1, DIR8Y[i] * 1.1, 26, 0, i & 1 ? '#fff6c0' : '#ffffff'); }
    if (t > 10 && t % 7 === 0) { const h = hash(t, 11); spawnPart(cx - 12 + (h % 24), b.y - 4 + ((h >> 8) % 10), 0, -0.3, 24, 4, (h >> 4) & 1 ? '#fff6c0' : '#b0c0ff'); }
  }
}

// ---------------------------------------------------------------------
//  AI: 闇落ち飛梅 Dark Tobiume (flies; no gravity)
//   a) 'fan'   : hovers, fires a fan of heart/star bullets aimed at the player
//   b) 'swoop' : flashes, then dives diagonally at the player, lands briefly, flies back up
//   c) 'kick'  : rises above the player, dive-kicks the floor -> 2 floor shockwaves (jump them)
// ---------------------------------------------------------------------
function bossPickSide() { boss.tx = (P.x + P.w / 2 < ROOM_X + VW / 2) ? ROOM_R - 40 - boss.w : ROOM_L + 40; }
function bossHover(b, B, drift) {
  b.bob++;
  const ty = B.hoverY + Math.sin(b.bob * 0.06) * B.hoverBob;
  b.y += (ty - b.y) * 0.12;
  if (drift) { const dx = b.tx - b.x; b.x += Math.abs(dx) < B.driftSpeed ? dx : Math.sign(dx) * B.driftSpeed; }
}
function pickPattern(opts) { // random, never the same pattern twice in a row
  boss.pr = bossRage(); // shot counts are fixed when a pattern starts (rage beginning mid-pattern must not change them)
  let pi = (Math.random() * opts.length) | 0;
  if (opts[pi] === boss.last) pi = (pi + 1 + ((Math.random() * (opts.length - 1)) | 0)) % opts.length;
  boss.last = opts[pi]; bossSeen(opts[pi]); return opts[pi];
}
const BOSS_OPTS = ['fan', 'swoop', 'kick'];
function bossChoose() {
  const a = pickPattern(BOSS_OPTS); bossFacePlayer();
  if (a === 'fan') { boss.shots = 0; bossSet('fan'); }
  else if (a === 'swoop') { bossSet('swoopWind'); sfx('warn'); }
  else { bossSet('kickAim'); sfx('warn'); }
}
function aiTobiume(b, B, pcx, pcy) {
  switch (b.state) {
    case 'enter':
      b.pose = 'fly'; b.y += 1.6; b.x += (b.tx - b.x) * 0.05;
      if (b.y >= B.hoverY) { b.y = B.hoverY; shake(8, 2); sfx('land'); bossSet('fill'); }
      return;
    case 'fill':
      b.pose = 'idle'; bossHover(b, B, false); bossFacePlayer();
      if ((b.t & 1) === 0 && b.hpShown < b.hp) { b.hpShown++; sfx('tick'); }
      if (b.hpShown >= b.hp && b.t > 20) { bossSet('hover'); bossPickSide(); setState('play'); }
      return;
    case 'hover':
      b.pose = 'idle'; bossFacePlayer(); bossHover(b, B, true);
      if (b.t >= (bossRage() ? B.idleFramesRage : B.idleFrames)) bossChoose();
      break;
    case 'fan': {
      b.pose = b.t > B.fanWindup - 10 ? 'attack' : 'idle'; bossFacePlayer(); bossHover(b, B, false);
      const fireAt = B.fanWindup + b.shots * 30;
      if (b.t === fireAt) {
        bossMuzzle(b, 12, 22); // magic comes from her hand (sprite-dependent)
        const mx = b.mx, my = b.my, ang = Math.atan2(pcy - my, pcx - mx), n = B.fanCount; b.fireT = 12;
        for (let k = 0; k < n; k++) { const a = ang + (k - (n - 1) / 2) * B.fanSpread; spawnBullet(mx - 3, my - 3, Math.cos(a) * B.fanSpeed, Math.sin(a) * B.fanSpeed, (k & 1) ? 3 : 2, B.bulletDamage); }
        sfx('bshoot'); b.shots++;
      }
      const total = b.pr ? B.fanVolleysRage : 1;
      if (b.shots >= total && b.t > B.fanWindup + (total - 1) * 30 + 24) { bossSet('hover'); bossPickSide(); }
      break;
    }
    case 'swoopWind':
      b.pose = 'attack'; bossFacePlayer(); b.y -= 0.3;
      if (b.t >= B.swoopTelegraph) {
        const dx = pcx - (b.x + b.w / 2); let dy = (pcy + 6) - (b.y + b.h / 2);
        if (dy < 30) dy = 30;
        const len = Math.hypot(dx, dy) || 1; b.vx = dx / len * B.swoopSpeed; b.vy = dy / len * B.swoopSpeed;
        bossSet('swoop'); sfx('swoosh');
      }
      break;
    case 'swoop':
      b.pose = 'fly'; b.face = b.vx < 0 ? -1 : 1; b.x += b.vx; b.y += b.vy;
      if ((b.t & 1) === 0) spawnPart(b.x + b.w / 2, b.y + b.h / 2, 0, 0, 12, 0, b.dark ? '#b03a7a' : '#ffb0d8');
      if (b.y + b.h >= FLOOR_Y) { b.y = FLOOR_Y - b.h; shake(6, 2); sfx('land'); bossSet('land'); }
      else if (b.x <= ROOM_L || b.x + b.w >= ROOM_R) { bossSet('recover'); bossPickSide(); }
      break;
    case 'land':
      b.pose = 'idle';
      if (b.t >= B.landFrames) { bossSet('recover'); bossPickSide(); }
      break;
    case 'recover': {
      b.pose = 'fly'; b.y -= B.recoverSpeed;
      const dx = b.tx - b.x; b.x += Math.abs(dx) < 1.4 ? dx : Math.sign(dx) * 1.4;
      if (b.y <= B.hoverY) { b.y = B.hoverY; b.bob = 0; bossSet('hover'); }
      break;
    }
    case 'kickAim': {
      b.pose = 'fly'; b.y += (B.kickRiseY - b.y) * 0.08;
      const dx = pcx - (b.x + b.w / 2); b.x += Math.max(-B.kickAimSpeed, Math.min(B.kickAimSpeed, dx)); bossFacePlayer();
      if (b.t >= B.kickAimFrames) bossSet('kickWind');
      break;
    }
    case 'kickWind':
      b.pose = 'kick';
      if (b.t >= 14) { b.vy = B.kickSpeed; bossSet('kick'); sfx('swoosh'); }
      break;
    case 'kick':
      b.pose = 'kick'; b.y += b.vy;
      if (b.y + b.h >= FLOOR_Y) {
        b.y = FLOOR_Y - b.h; shake(14, 3); sfx('land'); sfx('boomS');
        spawnBullet(b.x - 8, FLOOR_Y - 11, -B.shockSpeed, 0, 4, B.shockDamage);
        spawnBullet(b.x + b.w, FLOOR_Y - 11, B.shockSpeed, 0, 4, B.shockDamage);
        for (let i = 0; i < 6; i++) spawnPart(b.x + b.w / 2, FLOOR_Y - 2, (i - 2.5) * 0.7, -1 - (i & 1), 18, 0, '#c8a0c0');
        bossSet('land');
      }
      break;
  }
}

// ---------------------------------------------------------------------
//  AI: DARK ネーニア (calm elf archer, stays on the ground and keeps her distance)
//   a) 'aim'      : draws (frame 4) and looses an arrow at where the player WILL be (leads by player speed)
//   b) 'rain'     : shoots into the sky; 3 (5) columns are marked (+ one aimed arrow meanwhile), then arrows rain down in them
//   c) 'backstep' : jumps back (vaults over the player when cornered), then a triple volley
//                   (v5 enraged: followed straight away by one ricochet arrow)
//  v5 (harder, still readable):
//   d) 'rico'  : aims at the ceiling - the full dotted bounce path is shown and follows the player, then LOCKS
//                (turns bright) ~0.27 s before release; the arrow bounces ceiling -> floor. Then a 2nd low "skip
//                shot" off the floor (enraged: a 3rd ceiling shot). Dodge: step out of each locked path.
//   e) 'lob'   : bow raised to the sky, then 5 (6) arcing arrows, each landing where the player stood when it was
//                loosed (a floor mark shows the spot until impact, so the marks trail behind a moving player).
//                Dodge: keep moving, don't turn back into the marks. Enraged: the last arrow is a thorn snare.
//   f) 'snare' : 2 marked lobbed arrows (on the player + between her and Neenia) that plant thorn patches on the
//                floor (~2.5 s). Enraged: then straight into 2 quick aimed arrows (combo). Dodge: leave the marks
//                (away from her), then jump the arrows without landing in the thorns.
//   g) 'counter' (reactive, cooldown 2.7 s / 1.7 s enraged): if Umine jumps while Neenia is idle, an eye glint + aim line
//                at the landing spot, then a quick arrow. Dodge: steer in the air (or don't jump needlessly).
// ---------------------------------------------------------------------
function neeniaArrow(b, tx, ty, speed, dmg) {
  const a = Math.atan2(ty - b.my, tx - b.mx); spawnBullet(b.mx - 2, b.my - 2, Math.cos(a) * speed, Math.sin(a) * speed, 6, dmg);
  return a;
}
function neeniaBackstep(b, B) {
  bossFacePlayer(); const away = -b.face, room = away > 0 ? ROOM_R - (b.x + b.w) : b.x - ROOM_L;
  if (room < 52) { b.vx = b.face * 2.7; b.vy = -5.6; } // cornered: vault over the player
  else { b.vx = away * B.backstepVx; b.vy = -B.backstepVy; }
  b.onGround = false; b.volleys = 0; b.pr = bossRage(); bossSet('backstep'); sfx('swoosh');
}
const NENIA_OPTS = ['aim', 'rain', 'backstep', 'rico', 'lob', 'snare'];
// shuffle bag: every pattern once per round of 6 (never the same twice in a row) -> the new attacks show up every round
function neeniaPick() {
  const neeniaBag = boss.bag;
  if (!neeniaBag.length) {
    for (const o of NENIA_OPTS) neeniaBag.push(o);
    for (let i = neeniaBag.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0, t = neeniaBag[i]; neeniaBag[i] = neeniaBag[j]; neeniaBag[j] = t; }
    if (neeniaBag[neeniaBag.length - 1] === boss.last) { const t = neeniaBag[0]; neeniaBag[0] = neeniaBag[neeniaBag.length - 1]; neeniaBag[neeniaBag.length - 1] = t; }
  }
  const a = neeniaBag.pop(); boss.pr = bossRage(); boss.last = a; bossSeen(a); return a;
}
function neeniaChoose(b, B) {
  const a = neeniaPick(); bossFacePlayer(); b.combo = false;
  if (a === 'aim') { b.shots = 0; bossSet('aim'); }
  else if (a === 'rain') bossSet('rain');
  else if (a === 'rico' || a === 'lob' || a === 'snare') { b.shots = 0; bossSet(a); if (a !== 'rico') sfx('warn'); }
  else neeniaBackstep(b, B);
}
function bossMark(x, t, k) { // floor mark: landing spot of a lobbed / snare arrow, shown until impact
  const b = boss; for (let i = 0; i < b.markT.length; i++) if (b.markT[i] <= 0) { b.markX[i] = x; b.markT[i] = t; b.markMax[i] = t; b.markK[i] = k; return; }
}
// arcing arrow from the muzzle that lands (centre) on (tx, floor) after exactly T frames (gravity g applied before each move)
function neeniaLob(b, tx, T, g, kind, dmg) {
  const w = BULLET_SIZE[kind][0], h = BULLET_SIZE[kind][1], ty = FLOOR_Y - h / 2;
  const vx = (tx - b.mx) / T, vy = (ty - b.my - g * T * (T + 1) / 2) / T;
  const o = spawnBullet(b.mx - w / 2, b.my - h / 2, vx, vy, kind, dmg); if (o) o.g = g;
  bossMark(tx, T, kind === 15 ? 1 : 0);
  return o;
}
// ricochet bounds (arrow centre): the room's walls, ceiling and floor
function ricoXL() { return ROOM_L + 3; } function ricoXR() { return ROOM_R - 3; }
function ricoYT() { return TS + 3; } function ricoYB() { return FLOOR_Y - 3; }
// fills b.ricoPts with the bounce path from the muzzle along angle a (bounces + 1 segments; the last point is where it breaks)
function neeniaRicoPath(b, a, bounces) {
  let x = b.mx, y = b.my, vx = Math.cos(a), vy = Math.sin(a); const XL = ricoXL(), XR = ricoXR(), YT = ricoYT(), YB = ricoYB();
  b.ricoPts[0] = x; b.ricoPts[1] = y; b.ricoN = 1;
  for (let sgi = 0; sgi <= bounces; sgi++) {
    const tx = vx < -1e-6 ? (XL - x) / vx : vx > 1e-6 ? (XR - x) / vx : 1e9, ty = vy < -1e-6 ? (YT - y) / vy : vy > 1e-6 ? (YB - y) / vy : 1e9;
    const t = Math.max(0, Math.min(tx, ty)); x += vx * t; y += vy * t;
    b.ricoPts[b.ricoN * 2] = x; b.ricoPts[b.ricoN * 2 + 1] = y; b.ricoN++;
    if (tx <= ty) vx = -vx; else vy = -vy;
  }
}
function neeniaRicoAim(b, pcx, pcy, floorShot) { // mirror the target in the ceiling (or floor for the skip shot)
  const ty = floorShot ? 2 * ricoYB() - pcy : 2 * ricoYT() - pcy;
  return Math.atan2(ty - b.my, pcx - b.mx);
}
function aiNeenia(b, B, pcx, pcy) {
  const bcx = b.x + b.w / 2, dist = Math.abs(pcx - bcx), rage = bossRage();
  if (b.counterCD > 0) b.counterCD--;
  b.aimShow = false; if (b.state !== 'rico') { b.ricoShow = false; b.ricoLock = false; }
  switch (b.state) {
    case 'hover': {
      bossFacePlayer(); bossFall(b);
      let mv = 0;
      if (dist < B.keepMin) mv = -b.face; else if (dist > B.keepMax) mv = b.face;
      if (mv < 0 && ((b.face > 0 && b.x <= ROOM_L + 2) || (b.face < 0 && b.x + b.w >= ROOM_R - 2))) mv = 0; // back to the wall
      b.x += mv * B.walkSpeed; b.pose = mv ? 'walk' : 'idle'; b.poseF = -1;
      if (dist < 30 && b.t > 16) { bossSeen('backstep'); b.last = 'backstep'; neeniaBackstep(b, B); break; }
      if (b.counterCD <= 0 && b.t > 3 && !P.onGround && P.vy < -1 && !P.dead) { // quick-draw: answers a jump
        bossSeen('counter'); b.counterCD = rage ? B.counterCooldownRage : B.counterCooldown; bossSet('counter'); sfx('tink'); break;
      }
      if (b.t >= (rage ? B.idleFramesRage : B.idleFrames)) neeniaChoose(b, B);
      break;
    }
    case 'counter': { // quick-draw (cooldown; shorter when enraged): eye glint + short aim line at where the jump will come down, then a fast arrow
      bossFall(b); bossFacePlayer(); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      if (b.t === 1) spawnPart(bcx + b.face * 3, b.y + 6, 0, 0, 12, 3, '#ffffff');
      if (b.t <= B.counterDraw) {
        bossMuzzle(b, 18, 24);
        const T = Math.min(24, Math.abs(pcx - b.mx) / B.counterSpeed), py = Math.min(FLOOR_Y - P.h / 2, pcy + P.vy * T + 0.5 * CONFIG.gravity * T * T);
        b.aimX = Math.max(ROOM_L, Math.min(ROOM_R, pcx + P.vx * T)); b.aimY = py; b.aimShow = true;
      }
      if (b.t === B.counterDraw) { neeniaArrow(b, b.aimX, b.aimY, B.counterSpeed, B.arrowDamage); b.fireT = 12; sfx('arrow'); }
      if (b.t > B.counterDraw + 16) { b.t = 0; b.state = 'hover'; }
      break;
    }
    case 'aim': {
      bossFall(b); bossFacePlayer(); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      const total = b.combo ? 2 : b.pr ? B.aimShotsRage : 1, fireAt = B.aimFrames + b.shots * 24;
      bossMuzzle(b, 18, 24);
      const lead = Math.min(B.leadMax, Math.abs(pcx - b.mx) / B.arrowSpeed);
      b.aimX = Math.max(ROOM_L, Math.min(ROOM_R, pcx + b.pvx * lead)); b.aimY = pcy;
      b.aimShow = b.shots < total && b.t > fireAt - 22 && b.t < fireAt;
      if (b.t === fireAt && b.shots < total) { neeniaArrow(b, b.aimX, b.aimY, B.arrowSpeed, B.arrowDamage); b.fireT = 12; sfx('arrow'); b.shots++; }
      if (b.shots >= total && b.t > B.aimFrames + (total - 1) * 24 + 22) { b.combo = false; bossSet('hover'); }
      break;
    }
    case 'rico': { // ricochet: tracking dotted bounce path -> locks -> release
      bossFall(b); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      const total = b.combo ? 1 : b.pr ? B.ricoShotsRage : B.ricoShots, at = B.ricoAim + b.shots * B.ricoAimRage2;
      if (b.shots < total) {
        const lock = b.t > at - B.ricoLock;
        if (!lock) { bossFacePlayer(); bossMuzzle(b, 18, 24); b.ricoAng = neeniaRicoAim(b, pcx, pcy, b.shots === 1) /* 2nd = skip shot off the floor */; neeniaRicoPath(b, b.ricoAng, B.ricoBounces); }
        if (lock && !b.ricoLock) sfx('tink');
        b.ricoShow = true; b.ricoLock = lock;
        if (b.t === at) {
          const o = spawnBullet(b.mx - 2.5, b.my - 2.5, Math.cos(b.ricoAng) * B.ricoSpeed, Math.sin(b.ricoAng) * B.ricoSpeed, 14, B.ricoDamage);
          if (o) o.bnc = B.ricoBounces;
          b.fireT = 12; sfx('arrow'); b.shots++; b.ricoShow = false; b.ricoLock = false;
        }
      }
      if (b.shots >= total && b.t > B.ricoAim + (total - 1) * B.ricoAimRage2 + 34) { b.combo = false; bossSet('hover'); }
      break;
    }
    case 'lob': { // bow to the sky, then arcing arrows onto where the player stands (marks until impact)
      bossFall(b); bossFacePlayer(); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      const n = b.pr ? B.lobCountRage : B.lobCount, every = b.pr ? B.lobEveryRage : B.lobEvery, at = B.lobWind + b.shots * every;
      if (b.t < B.lobWind && b.t % 3 === 0) { bossMuzzle(b, 18, 24); spawnPart(b.mx, b.my - 4, 0, -1.6, 16, 0, (b.t & 4) ? '#ff9ad0' : '#ffffff'); }
      if (b.t === at && b.shots < n) {
        bossMuzzle(b, 18, 24);
        const last = b.pr && b.shots === n - 1; // enraged: the last arrow of the volley is a thorn snare
        neeniaLob(b, Math.max(ROOM_L + (last ? 14 : 6), Math.min(ROOM_R - (last ? 14 : 6), pcx + b.pvx * B.lobAir * B.lobLead)), B.lobAir, B.lobGrav, last ? 15 : 13, last ? B.snareArrowDamage : B.lobDamage);
        b.fireT = 10; sfx('arrow'); b.shots++;
      }
      if (b.shots >= n && b.t > B.lobWind + (n - 1) * every + B.lobAir + 8) bossSet('hover');
      break;
    }
    case 'snare': { // thorn snare: marked lobbed arrow(s) -> thorn patch; enraged: 2 snares + a quick aimed arrow
      bossFall(b); bossFacePlayer(); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      const n = 2;
      if (b.t < B.snareWind && b.t % 3 === 0) { bossMuzzle(b, 18, 24); const h = hash(b.t, 23); spawnPart(b.mx + (h & 7) - 3, b.my + ((h >> 3) & 7) - 3, 0, -0.4, 14, 0, (h >> 6) & 1 ? '#7aff9a' : '#d0ffd8'); }
      if (b.t === B.snareWind || (n > 1 && b.t === B.snareWind + 8)) {
        bossMuzzle(b, 18, 24);
        let tx = pcx;
        if (b.t !== B.snareWind) { // 2nd snare: between the player and Neenia (she keeps the far side open)
          const toB = bcx > pcx ? 1 : -1; tx = pcx + toB * B.snareSecondGap;
          if (Math.abs(tx - bcx) < 28) tx = pcx + toB * 30;
        }
        neeniaLob(b, Math.max(ROOM_L + 14, Math.min(ROOM_R - 14, tx)), B.snareAir, B.lobGrav, 15, B.snareArrowDamage);
        b.fireT = 10; sfx('arrow'); b.shots++;
      }
      if (b.t > B.snareWind + (n - 1) * 8 + B.snareAir + 6) {
        if (b.pr) { b.combo = true; b.shots = 0; bossSet('aim'); } // combo: straight into 2 quick aimed arrows
        else bossSet('hover');
      }
      break;
    }
    case 'rain': {
      bossFall(b); bossFacePlayer(); b.pose = 'attack'; b.poseF = (b.t >= 14 && b.t < 30) ? 1 : 0;
      const T0 = 14 + B.rainWarn;
      if (b.t === 14) { // loose into the sky + mark the columns (always one on the player)
        bossMuzzle(b, 18, 24); sfx('arrow');
        for (let k = 0; k < 8; k++) spawnPart(b.mx, b.my - k * 4, 0, -4, 30, 0, k & 1 ? '#c070ff' : '#ffffff');
        const n = rage ? B.rainColsRage : B.rainCols, c0 = ROOM_COL + 1, c1 = ROOM_COL + 14;
        b.rainN = 0; b.rainC[b.rainN++] = Math.max(c0, Math.min(c1, Math.floor(pcx / TS)));
        for (let tries = 0; tries < 60 && b.rainN < n; tries++) {
          const c = c0 + ((Math.random() * (c1 - c0 + 1)) | 0); let okc = true;
          for (let i = 0; i < b.rainN; i++) if (Math.abs(b.rainC[i] - c) < 3) okc = false;
          if (okc) b.rainC[b.rainN++] = c;
        }
        b.warn = B.rainWarn; sfx('warn');
      }
      if (b.warn > 0) b.warn--;
      if (b.t >= 14 + B.rainAimAt - 18 && b.t < 14 + B.rainAimAt) { bossMuzzle(b, 18, 24); b.aimX = pcx + b.pvx * Math.min(B.leadMax, Math.abs(pcx - b.mx) / B.arrowSpeed); b.aimY = pcy; b.aimShow = true; }
      if (b.t === 14 + B.rainAimAt) { bossMuzzle(b, 18, 24); neeniaArrow(b, b.aimX, b.aimY, B.arrowSpeed, B.arrowDamage); b.fireT = 12; sfx('arrow'); }
      if (b.t > 30) b.poseF = b.fireT > 0 ? 1 : 0;
      if (b.t === T0 || b.t === T0 + 9) { for (let i = 0; i < b.rainN; i++) spawnBullet(b.rainC[i] * TS + 6, TS + 1, 0, B.rainSpeed, 7, B.rainDamage); if (b.t === T0) sfx('bshoot'); }
      if (b.t === T0 + 9) b.rainN = 0;
      if (b.t > T0 + 40) bossSet('hover');
      break;
    }
    case 'backstep':
      b.x += b.vx; b.pose = 'walk'; b.poseF = 1; bossFacePlayer();
      if (b.x <= ROOM_L || b.x + b.w >= ROOM_R) b.vx = 0;
      if (bossFall(b)) { bossDust(b, 4); sfx('land'); b.vx = 0; bossSet('volley'); }
      break;
    case 'volley': {
      bossFall(b); bossFacePlayer(); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      const total = b.pr ? B.volleysRage : 1, at = B.volleyWind + b.volleys * 26;
      if (b.t === at && b.volleys < total) {
        bossMuzzle(b, 18, 24); const a = Math.atan2(pcy - b.my, pcx - b.mx);
        for (let k = -1; k <= 1; k++) spawnBullet(b.mx - 2, b.my - 2, Math.cos(a + k * B.volleySpread) * B.volleySpeed, Math.sin(a + k * B.volleySpread) * B.volleySpeed, 6, B.arrowDamage);
        b.fireT = 12; sfx('arrow'); b.volleys++;
      }
      if (b.volleys >= total && b.t > B.volleyWind + (total - 1) * 26 + 24) {
        if (b.pr) { b.combo = true; b.shots = 0; bossSet('rico'); } // enraged combo: backstep volleys -> one ricochet
        else bossSet('hover');
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------
//  AI: DARK 青天 (black cat girl; clingy - she keeps jumping at Umine; loves singing)
//   a) 'pounce' : crouch (frame 3) -> cat leap at the player (frame 2) -> landing crouch, twice
//   b) 'song'   : inhale (frame 4) -> cursed song (frame 5): a floor sound wave (jump it);
//                 enraged: 2 waves, each led by a fast wobbling note above head height (stay down, then jump the wave)
//   c) 'multi'  : (below 50% HP) 3 rapid pounces in a row
// ---------------------------------------------------------------------
function seitenChoose(b, B) {
  const rage = bossRage();
  let a;
  if (rage && !b.didMulti) { a = 'multi'; b.last = a; bossSeen(a); b.pr = true; }
  else a = pickPattern(rage ? ['pounce', 'song', 'multi'] : ['pounce', 'song']);
  bossFacePlayer();
  if (a === 'pounce') { b.multi = false; b.leapsLeft = B.pounceLeaps; bossSet('crouch'); }
  else if (a === 'multi') { b.multi = true; b.leapsLeft = B.multiLeaps; b.didMulti = true; bossSet('crouch'); sfx('warn'); }
  else { b.shots = 0; bossSet('inhale'); }
}
function aiSeiten(b, B, pcx, pcy) {
  const bcx = b.x + b.w / 2, rage = bossRage();
  switch (b.state) {
    case 'hover':
      bossFall(b); bossFacePlayer(); b.pose = 'idle'; b.poseF = -1;
      if (Math.abs(pcx - bcx) > 100) { b.x += b.face * 0.5; }
      if (b.t >= (rage ? B.idleFramesRage : B.idleFrames)) seitenChoose(b, B);
      break;
    case 'crouch': {
      bossFall(b); bossFacePlayer(); b.pose = 'leap'; b.poseF = 1;
      if (b.t < 8 && (b.t & 1)) spawnPart(bcx - b.face * 8, FLOOR_Y - 3, -b.face * 0.6, -0.4, 10, 0, '#ff5a7a');
      if (b.t >= (b.multi ? B.multiCrouch : B.crouchFrames)) {
        const vy = b.multi ? B.multiVy : B.leapVy, air = 2 * vy / CONFIG.gravity;
        const tx = Math.max(ROOM_L + 12, Math.min(ROOM_R - 12, pcx + b.pvx * air * 0.4));
        b.vx = Math.max(-B.leapMaxVx, Math.min(B.leapMaxVx, (tx - bcx) / air)); b.vy = -vy; b.onGround = false;
        bossSet('leap'); sfx('swoosh');
      }
      break;
    }
    case 'leap':
      b.x += b.vx; b.pose = 'leap'; b.poseF = 0; if (Math.abs(b.vx) > 0.1) b.face = b.vx < 0 ? -1 : 1;
      if ((b.t & 3) === 0) spawnPart(bcx, b.y + b.h / 2, 0, 0, 12, 0, b.dark ? '#a0203a' : '#ffb0c0');
      if (bossFall(b)) { shake(5, 1); sfx('land'); bossDust(b, 5); bossSet('land'); }
      break;
    case 'land':
      bossFall(b); b.pose = 'leap'; b.poseF = 1;
      if (b.t >= (b.multi ? B.multiLand : B.landFrames)) {
        if (--b.leapsLeft > 0) bossSet('crouch'); else { b.multi = false; bossSet('hover'); }
      }
      break;
    case 'inhale':
      bossFall(b); bossFacePlayer(); b.pose = 'attack'; b.poseF = 0;
      if (b.t % 5 === 0) { bossMuzzle(b, 12, 22); const h = hash(b.t, 13), ang = (h & 255) / 255 * Math.PI * 2; spawnPart(b.mx + Math.cos(ang) * 20, b.my + Math.sin(ang) * 20, -Math.cos(ang) * 0.9, -Math.sin(ang) * 0.9, 20, 5, '#ff5a7a'); }
      if (b.t >= B.inhaleFrames) bossSet('sing');
      break;
    case 'sing': { // enraged: a quick note flies over head height first (stay down), then the wave (jump it)
      bossFall(b); b.pose = 'attack'; b.poseF = 1;
      const n = b.pr ? B.wavesRage : 1, gap = b.pr ? 14 : 0, at = 1 + b.shots * 48; // (t is already 1 on the first frame)
      if (b.pr && b.t === at && b.shots < n) {
        bossMuzzle(b, 12, 22);
        for (let k = 0; k < B.notesRage; k++) { const nb = spawnBullet(b.mx - 3 - b.face * k * 22, FLOOR_Y - 44, b.face * B.noteSpeed, 0, 11, B.noteDamage); if (nb) { nb.baseY = FLOOR_Y - 44; nb.ang = k * 2.2; } }
        spawnPart(b.mx, b.my, 0, 0, 16, 1, '#ff9ab0'); sfx('tink');
      }
      if (b.t === at + gap && b.shots < n) {
        bossMuzzle(b, 12, 22);
        spawnBullet(b.face > 0 ? b.x + b.w : b.x - 10, FLOOR_Y - 26, b.face * B.waveSpeed, 0, 8, B.waveDamage);
        spawnPart(b.mx, b.my, 0, 0, 16, 1, '#ff3a5a'); spawnPart(b.mx, b.my, 0, 0, 24, 1, '#ff9ab0');
        sfx('song'); shake(4, 1); b.shots++;
      }
      if (b.shots >= n && b.t > (n - 1) * 48 + gap + 40) bossSet('hover');
      break;
    }
  }
}

// ---------------------------------------------------------------------
//  AI: DARK アスターテ (quiet white cat guide with a scythe; floats just above the floor)
//   a) 'slash' : glides, winds up (frame 4) and slashes (frame 5) -> a crescent wave along the
//                floor (jump it); enraged a second, HIGH crescent follows (stay on the ground)
//   b) 'warp'  : fades out, a red mark appears behind the player (short warning), she reappears there and slashes
//   c) 'orbs'  : star orbs circle her while she drifts toward the player, then fly outwards
// ---------------------------------------------------------------------
function astarteFloat(b, B) { b.bob++; const ty = FLOOR_Y - b.h - B.floatGap - (Math.sin(b.bob * 0.07) + 1) * 2; b.y += (ty - b.y) * 0.2; }
// Controlled pursuit: the boss keeps her face toward Umine and avoids overlapping her.
function astarteOrbitAdvance(b, B, pcx, gap, speed) {
  const dx = pcx - (b.x + b.w / 2), ad = Math.abs(dx);
  if (ad > gap + 5) b.x += Math.sign(dx) * Math.min(speed, ad - gap);
  else if (ad < gap - 12 && ad > 1) b.x -= Math.sign(dx) * Math.min(speed * 0.6, gap - 12 - ad);
  bossFacePlayer();
}
// Spell persists independently of the current attack state: stars keep falling during scythe attacks.
function astarteUpdateStarRain(b, B) {
  if (!b.starRainT || !b.dark) return;
  const t = ++b.starRainT;
  for (let n = 0; n < 3; n++) {
    const at = B.starWarning + n * B.starInterval;
    if (t !== at) continue;
    const k = n === 0 ? 1 : n === 1 ? 0 : 2;
    const star = spawnBullet(b.starX[k] - 5, TS + 4, 0, B.starSpeed, 18, B.starDamage);
    if (star) star.life = 75;
    spawnPart(b.starX[k], TS + 4, 0, 0.6, 18, 5, '#ffe0a0');
    sfx('bshoot');
  }
  if (t > B.starWarning + 2 * B.starInterval + Math.ceil((FLOOR_Y - TS) / B.starSpeed) + 2) b.starRainT = 0;
}
function astarteChoose(b, B) {
  // Show the newly introduced mechanics reliably before the boss can be defeated.
  // Starfall debuts on the first attack, Eclipse on the first decision after reaching half HP.
  const pool = (bossRage() ? ['slash', 'warp', 'orbs', 'cleave', 'shadow', 'starfall', 'eclipse'] : ['slash', 'warp', 'orbs', 'cleave', 'shadow', 'starfall']).filter(k => k !== 'starfall' || !b.starRainT);
  const a = !b.seen.includes('starfall') ? pickPattern(['starfall']) :
    bossRage() && !b.seen.includes('eclipse') ? pickPattern(['eclipse']) : pickPattern(pool);
  bossFacePlayer();
  if (a === 'slash') { b.shots = 0; bossSet('slash'); }
  else if (a === 'warp') { b.warp2 = false; b.eclipseFinisher = false; bossSet('warpOut'); sfx('warn'); }
  else if (a === 'cleave') { bossSet('cleave'); sfx('warn'); }
  else if (a === 'shadow') { bossSet('shadowOut'); sfx('warn'); }
  else if (a === 'starfall') { bossSet('starCast'); sfx('warn'); }
  else if (a === 'eclipse') { bossSet('eclipse'); sfx('warn'); }
  else bossSet('orbs');
}
function aiAstarte(b, B, pcx, pcy) {
  const bcx = b.x + b.w / 2, rage = bossRage();
  switch (b.state) {
    case 'hover': {
      astarteFloat(b, B); bossFacePlayer();
      const side = bcx < pcx ? -1 : 1; let tx = pcx + side * B.keepDist;
      if (tx < ROOM_L + 12 || tx > ROOM_R - 12) tx = Math.max(ROOM_L + 12, Math.min(ROOM_R - 12, tx));
      const dx = tx - bcx, mv = Math.abs(dx) > 2 ? Math.sign(dx) * Math.min(B.glideSpeed, Math.abs(dx)) : 0;
      b.x += mv; b.pose = mv ? 'glide' : 'idle'; b.poseF = -1;
      if (b.t >= (rage ? B.idleFramesRage : B.idleFrames)) astarteChoose(b, B);
      break;
    }
    case 'slash': {
      astarteFloat(b, B); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      const n = b.pr ? 2 : 1, at = B.windFrames + b.shots * 32;
      if (b.fireT === 0 && b.t < at) bossFacePlayer();
      if (b.shots < n && b.t < at && b.t % 4 === 0) { const h = hash(b.t, 17); spawnPart(bcx - b.face * 10 + (h & 7) - 3, b.y + 2 + ((h >> 3) & 7), 0, -0.3, 14, 5, '#ff4a6a'); }
      if (b.t === at && b.shots < n) {
        const high = b.shots === 1;
        spawnBullet(b.face > 0 ? b.x + b.w : b.x - 12, high ? FLOOR_Y - 60 : FLOOR_Y - 21, b.face * B.crescentSpeed, 0, 9, B.crescentDamage);
        b.fireT = 14; sfx('swoosh'); shake(3, 1); b.shots++;
      }
      if (b.shots >= n && b.t > B.windFrames + (n - 1) * 32 + 26) bossSet('hover');
      break;
    }
    case 'starCast': { // short spell animation; the separate rain scheduler handles delayed impacts
      astarteFloat(b, B); bossFacePlayer(); b.pose = 'attack'; b.poseF = 0;
      if (b.t === 1) {
        const target = Math.max(ROOM_L + 15, Math.min(ROOM_R - 15, pcx));
        b.starX = [0, 1, 2].map(k => Math.max(ROOM_L + 9, Math.min(ROOM_R - 9, target + (k - 1) * 52)));
        b.starRainT = 1;
      }
      if (b.t % 4 === 0) spawnPart(bcx, b.y - 2, (b.t % 3 - 1) * 0.3, -0.6, 20, 5, '#ffe0a0');
      if (b.t >= B.starCast) { b.shots = 0; bossFacePlayer(); bossSet('slash'); }
      break;
    }
    case 'eclipse': { // enraged-only: low then high crescents, then one teleport scythe finisher
      astarteFloat(b, B); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      if (b.t < B.eclipseWind && b.t % 4 === 0) spawnPart(bcx + b.face * 8, b.y + 12, 0, -0.4, 16, 5, '#ff4a8a');
      if (b.t === B.eclipseWind || b.t === B.eclipseWind + B.eclipseGap) {
        bossFacePlayer(); const high = b.t > B.eclipseWind;
        spawnBullet(b.face > 0 ? b.x + b.w : b.x - 12, high ? FLOOR_Y - 60 : FLOOR_Y - 21, b.face * B.crescentSpeed, 0, 9, B.crescentDamage);
        b.fireT = 15; sfx('swoosh'); shake(4, 1);
      }
      if (b.t >= B.eclipseWind + B.eclipseGap + B.eclipseRecover) {
        b.warp2 = true; b.eclipseFinisher = true; bossSet('warpOut'); sfx('warn');
      }
      break;
    }
    case 'cleave': { // telegraphed diagonal moon-blade, aimed at the player's current height
      astarteFloat(b, B); b.pose = 'attack'; b.poseF = b.t < B.cleaveWind ? 0 : 1;
      if (b.t < B.cleaveWind && b.t % 4 === 0) spawnPart(bcx, b.y + 12, b.face * 0.35, -0.4, 15, 5, '#b0b8ff');
      if (b.t === B.cleaveWind) {
        bossFacePlayer();
        const sx = b.x + b.w / 2 + b.face * 10, sy = b.y + b.h / 2 - 5;
        const dx = pcx - sx, dy = pcy - sy, len = Math.hypot(dx, dy) || 1;
        const wave = spawnBullet(sx - 6, sy - 6, dx / len * B.cleaveSpeed, dy / len * B.cleaveSpeed, 17, B.cleaveDamage);
        if (wave) wave.life = 95;
        sfx('swoosh'); shake(4, 1);
      }
      if (b.t > B.cleaveWind + B.cleaveRecovery) bossSet('hover');
      break;
    }
    case 'shadowOut': {
      astarteFloat(b, B); b.pose = 'glide'; b.poseF = -1;
      b.alpha = Math.max(0, 1 - b.t / B.shadowFade);
      if (b.t % 3 === 0) spawnPart(bcx, b.y + b.h / 2, (b.t % 5 - 2) * 0.2, -0.6, 18, 5, '#c090ff');
      if (b.t >= B.shadowFade) {
        b.warnX = Math.max(ROOM_L + b.w / 2 + 8, Math.min(ROOM_R - b.w / 2 - 8, pcx));
        b.warn = rage ? B.shadowWarningRage : B.shadowWarning;
        b.hidden = true; b.alpha = 0; bossSet('shadowWarn'); sfx('warn');
      }
      break;
    }
    case 'shadowWarn': {
      if (--b.warn <= 0) {
        b.x = b.warnX - b.w / 2; b.y = FLOOR_Y - b.h - 76;
        b.hidden = false; b.alpha = 1; b.pose = 'attack'; b.poseF = 0;
        bossSet('shadowDive'); sfx('swoosh');
      }
      break;
    }
    case 'shadowDive': {
      b.pose = 'attack'; b.poseF = 1;
      b.y = Math.min(FLOOR_Y - b.h - B.floatGap, b.y + B.shadowDropSpeed);
      if (b.y >= FLOOR_Y - b.h - B.floatGap) {
        b.fireT = 16; shake(7, 2); sfx('land');
        for (let i = 0; i < 8; i++) spawnPart(b.x + b.w / 2, FLOOR_Y - 3, DIR8X[i] * 1.2, -Math.abs(DIR8Y[i]) * 1.3, 18, 0, i & 1 ? '#e0c0ff' : '#ff4a6a');
        // Two outward ground waves leave a safe gap for a jump or a well-timed retreat.
        spawnBullet(b.x - 8, FLOOR_Y - 21, -B.crescentSpeed, 0, 9, B.crescentDamage);
        spawnBullet(b.x + b.w, FLOOR_Y - 21, B.crescentSpeed, 0, 9, B.crescentDamage);
        bossSet('shadowRecover');
      }
      break;
    }
    case 'shadowRecover': {
      b.pose = 'attack'; b.poseF = b.t < 15 ? 1 : 0;
      if (b.t >= B.shadowRecovery) bossSet('hover');
      break;
    }
    case 'warpOut':
      astarteFloat(b, B); b.pose = 'glide'; b.poseF = -1; b.alpha = Math.max(0, 1 - b.t / B.fadeFrames);
      if (b.t % 3 === 0) { const h = hash(b.t, 19); spawnPart(b.x + (h % b.w), b.y + ((h >> 8) % b.h), 0, -0.6, 18, 5, '#c090ff'); }
      if (b.t >= B.fadeFrames) {
        b.hidden = true; b.alpha = 0;
        let tx;
        if (b.eclipseFinisher) {
          // The finale prioritizes a rear landing, with an occasional front feint.
          // Flip to the other side only when the intended position would be outside the arena.
          const side = Math.random() < 0.9 ? -P.face : P.face;
          const minX = ROOM_L + b.w / 2 + 4, maxX = ROOM_R - b.w / 2 - 4;
          tx = pcx + side * 29;
          if (tx < minX || tx > maxX) tx = pcx - side * 29;
          b.warnX = Math.max(minX, Math.min(maxX, tx));
        } else {
          // Ordinary warp also prefers the player's rear, while sometimes attacking from the front.
          const side = Math.random() < 0.8 ? -P.face : P.face;
          tx = pcx + side * 40; if (tx < ROOM_L + 14 || tx > ROOM_R - 14) tx = pcx - side * 40;
          b.warnX = Math.max(ROOM_L + 14, Math.min(ROOM_R - 14, tx));
        }
        b.warn = rage ? B.warnFramesRage : B.warnFrames;
        bossSet('warpWarn'); sfx('warn');
      }
      break;
    case 'warpWarn':
      if (b.warn > 0) b.warn--;
      if (b.warn <= 0) {
        b.hidden = false; b.alpha = 1; b.x = b.warnX - b.w / 2; b.x = Math.max(ROOM_L, Math.min(ROOM_R - b.w, b.x));
        b.y = FLOOR_Y - b.h - B.floatGap; bossFacePlayer(); b.fireT = 16;
        const s = spawnBullet(b.face > 0 ? b.x + b.w - 6 : b.x + 6 - 34, FLOOR_Y - 34, 0, 0, 12, B.slashDamage);
        if (s) { s.w = 34; s.h = 32; s.life = 12; s.ang = b.face; }
        for (let i = 0; i < 8; i++) spawnPart(b.x + b.w / 2, b.y + b.h / 2, DIR8X[i] * 1.4, DIR8Y[i] * 1.4, 16, 0, i & 1 ? '#ff4a6a' : '#e0c0ff');
        sfx('swoosh'); shake(5, 2); bossSet('warpSlash');
      }
      break;
    case 'warpSlash':
      astarteFloat(b, B); b.pose = 'attack'; b.poseF = b.fireT > 0 ? 1 : 0;
      if (b.t >= B.warpRecover) { if (rage && !b.warp2) { b.warp2 = true; bossSet('warpOut'); } else { b.eclipseFinisher = false; bossSet('hover'); } }
      break;
    case 'orbs': {
      astarteFloat(b, B); const T1 = 16 + B.orbFrames;
      b.pose = b.t < 22 ? 'attack' : 'glide'; b.poseF = b.t < 22 ? 0 : -1;
      if (b.t === 16) {
        const n = rage ? B.orbCountRage : B.orbCount;
        for (let k = 0; k < n; k++) { const o = spawnBullet(bcx, b.y, 0, 0, 10, B.orbDamage); if (o) { o.orbit = true; o.ang = k * Math.PI * 2 / n; o.rad = 6; o.spin = rage ? B.orbSpinRage : B.orbSpin; } }
        sfx('cp');
      }
      if (b.t > 16 && b.t < T1) astarteOrbitAdvance(b, B, pcx, 38, B.orbDrift);
      if (b.t === T1) { for (const o of bullets) if (o.active && o.orbit) { o.orbit = false; o.vx = Math.cos(o.ang) * B.orbSpeed; o.vy = Math.sin(o.ang) * B.orbSpeed * 0.72; } sfx('bshoot'); }
      if (b.t > T1 + 30) bossSet('hover');
      break;
    }
  }
}
function lilySongFxActive(b) {
  if (curArea.boss !== 'lily' || b.state !== 'lilySong') return false;
  const B = bossCfg(), rage = bossRage();
  const wind = rage ? B.songWind - 6 : B.songWind;
  const second = rage ? wind + 18 : -999;
  return (b.t >= wind && b.t <= wind + 2) || (rage && b.t >= second && b.t <= second + 2);
}
function spawnLilyNote(x, y, dir, speed, dmg) {
  const n = spawnBullet(x, y, dir * speed, 0, 19, dmg);
  if (n) n.life = 150;
  return n;
}
function lilyLaneCenter(i, n = 5) { return ROOM_L + (i + 0.5) * (ROOM_R - ROOM_L) / n; }
function lilyNearestLane(x, n = 5) {
  let best = 0, dist = Infinity;
  for (let i = 0; i < n; i++) { const d = Math.abs(x - lilyLaneCenter(i, n)); if (d < dist) { dist = d; best = i; } }
  return best;
}
function lilyLineTimes(rage) { return rage ? [24, 50, 76] : [28, 62]; }
function lilyLineHighAt(b, idx) { return !!(b.lilyLineStartHigh ^ (idx & 1)); }
function aiLily(b, B, pcx, pcy) {
  const rage = bossRage(), cx = b.x + b.w / 2, dx = pcx - cx, ad = Math.abs(dx);

  if (b.state === 'hover') {
    if (!bossUmimi.healUsed && b.hp <= B.healTriggerHP) {
      bossUmimi.healUsed = true; bossSet('lilyHeal'); sfx('warn'); return;
    }
    if (!bossUmimi.encoreUsed && b.hp <= 5) {
      // Encore: no healing. Umimi shields Lily while Lily immediately launches
      // her signature Starlight Rain for one final live-show sequence.
      bossUmimi.encoreUsed = true;
      bossUmimi.shieldT = 128;
      setBossUmimi('shield');
      bossSet('lilyRain');
      bossSeen('rain');
      sfx('warn');
      return;
    }
    bossFacePlayer(); b.poseF = -1;
    if (ad < 58) {
      b.x -= Math.sign(dx) * 0.72;
      b.pose = 'idle';
      b.hopY = 0;
    } else if (ad > 118) {
      b.x += Math.sign(dx) * 0.58;
      b.pose = 'idle';
      b.hopY = 0;
    } else {
      // Idle means idle: use only the two standing frames with no bob or creeping.
      b.pose = 'idle';
      b.hopY = 0;
      b.vx = 0;
    }
    if (b.t >= (rage ? B.idleFramesRage : B.idleFrames)) {
      const opts = rage
        ? ['song','notes','hearts','moon','rain','line','notes']
        : ['song','notes','hearts','moon','rain','line'];
      const a = pickPattern(opts);
      bossSet(a === 'song' ? 'lilySong'
        : a === 'notes' ? 'lilyNotes'
        : a === 'hearts' ? 'lilyHearts'
        : a === 'rain' ? 'lilyRain'
        : a === 'line' ? 'lilyLine'
        : 'lilyMoon');
      sfx('warn');
    }
    return;
  }

  if (b.state === 'lilySong') {
    bossFacePlayer();
    const wind = rage ? B.songWind - 6 : B.songWind;
    const second = rage ? wind + 18 : -999;
    const firing = lilySongFxActive(b);
    // Rebuilt sheet: frames 2/3 are the attack wind-up. Frame 4 is the stable casting body;
    // the red wave remains a separate overlay so Lily's silhouette does not jump.
    if (b.t < Math.max(8, wind - 7) || (rage && b.t > wind + 3 && b.t < second - 7)) {
      b.pose = 'windup'; b.poseF = (b.t >> 3) & 1;
    } else {
      b.pose = 'attack'; b.poseF = 0;
    }
    b.hopY = 0;
    if (b.t === wind || (rage && b.t === second)) {
      const sx = b.face > 0 ? b.x + b.w + 2 : b.x - 10;
      const wave = spawnBullet(sx, FLOOR_Y - 29, b.face * (rage ? 2.2 : 1.9), 0, 8, B.noteDamage);
      if (wave) {
        // Lily's basic song wave is intentionally a little tight to jump,
        // but it now travels as a real vertical wave instead of a flat wall.
        wave.h = 25;
        wave.baseY = FLOOR_Y - 29;
        wave.wobbleAmp = 4;
        wave.wobbleRate = 0.09;
        wave.wobblePhase = (rage && b.t === second) ? Math.PI : 0;
      }
      for (let i = 0; i < 6; i++) spawnPart(cx, b.y + 8, b.face * (0.4 + i * 0.08), -0.9 + i * 0.12, 30, 5, i & 1 ? '#ffd2ef' : '#fff1b8');
      sfx('song');
    }
    if (b.t > wind + (rage ? 38 : 24)) bossSet('hover');
    return;
  }

  if (b.state === 'lilyNotes') {
    bossFacePlayer(); b.hopY = 0;
    const wind = rage ? B.starWind - 5 : B.starWind;
    const gap = rage ? 28 : 34;
    const count = rage ? 4 : 3;
    if (b.t < Math.max(8, wind - 7)) { b.pose = 'windup'; b.poseF = (b.t >> 3) & 1; }
    else { b.pose = 'attack'; b.poseF = 0; }

    // One note at a time. Low notes are jumped; high notes pass above a standing Umine.
    for (let k = 0; k < count; k++) if (b.t === wind + k * gap) {
      const low = (k & 1) === 0;
      const y = low ? FLOOR_Y - 16 : FLOOR_Y - 46;
      const sx = b.face > 0 ? b.x + b.w + 2 : b.x - 8;
      spawnLilyNote(sx, y, b.face, rage ? 2.35 : 2.05, B.noteDamage);
      for (let i = 0; i < 4; i++) spawnPart(sx, y + 3, b.face * (0.25 + i * 0.08), -0.35 + i * 0.18, 22, 5, i & 1 ? '#ffd2ef' : '#fff1b8');
      sfx('song');
    }
    if (b.t > wind + (count - 1) * gap + 30) bossSet('hover');
    return;
  }

  if (b.state === 'lilyHearts') {
    if (b.t === 1) { bossFacePlayer(); b.vy = -3.9; b.vx = -b.face * (rage ? 1.9 : 1.55); }
    const shotTimes = rage ? [12, 26, 40] : [14, 30, 46];
    const heartBeat = shotTimes.includes(b.t);
    if (b.t < 10) { b.pose = 'windup'; b.poseF = (b.t >> 2) & 1; }
    else { b.pose = 'attack'; b.poseF = 0; }
    b.hopY = 0; b.x += b.vx; b.vx *= 0.97;
    const landed = bossFall(b);
    if (heartBeat) {
      const sx = b.x + b.w / 2, sy = b.y + 8;
      const a = Math.atan2((P.y + P.h / 2) - sy, (P.x + P.w / 2) - sx);
      spawnBullet(sx, sy, Math.cos(a) * 2.15, Math.sin(a) * 2.15, 2, B.heartDamage);
      sfx('bshoot');
    }
    if ((landed && b.t > 44) || b.t > 68) bossSet('hover');
    return;
  }

  if (b.state === 'lilyMoon') {
    bossFacePlayer(); b.hopY = 0; b.vx = 0; b.vy = 0;
    if (b.t < 22) { b.pose = 'windup'; b.poseF = (b.t >> 3) & 1; }
    else { b.pose = 'attack'; b.poseF = 0; }
    const high = FLOOR_Y - b.h - 20;
    if (b.t < 24) b.y += (high - b.y) * 0.22;
    else if (b.t < 64) b.y += (high - b.y) * 0.3;
    else b.y += ((FLOOR_Y - b.h) - b.y) * 0.18;
    const moonShots = rage ? [32, 46, 60, 74] : [34, 52, 70];
    const mk = moonShots.indexOf(b.t);
    if (mk >= 0) {
      const low = (mk & 1) === 1;
      const y = low ? FLOOR_Y - 18 : FLOOR_Y - 42;
      const sx = b.face > 0 ? b.x + b.w + 2 : b.x - 8;
      spawnLilyNote(sx, y, b.face, rage ? 2.55 : 2.25, B.noteDamage);
      for (let i = 0; i < 6; i++) spawnPart(sx, y + 3, (i - 2.5) * 0.12, -0.7 + (i & 1) * 0.2, 28, 5, i & 1 ? '#fff1b8' : '#c9c6ff');
      sfx('song');
    }
    if (b.t > 92) { b.y = FLOOR_Y - b.h; bossSet('hover'); }
    return;
  }

  if (b.state === 'lilyRain') {
    bossFacePlayer(); b.hopY = 0; b.vx = 0; b.vy = 0;
    const hardRain = hardMode;
    const wind = hardRain ? 24 : 30;
    const count = hardRain ? 14 : (rage ? 9 : 7);
    const interval = hardRain ? 5 : (rage ? 7 : 8);
    const fallSpeed = hardRain ? 2.35 : (rage ? 1.95 : 1.7);
    if (b.t === 1) b.lilyRainSeed = (frame >> 2) % 7;
    if (b.t < wind) { b.pose = 'windup'; b.poseF = (b.t >> 3) & 1; }
    else { b.pose = 'attack'; b.poseF = 0; }

    // Starlight Rain: live-show confetti. Hard mode turns the number and speed up,
    // but each piece still sways independently so the attack remains readable.
    for (let k = 0; k < count; k++) if (b.t === wind + k * interval) {
      const lane = (k * 3 + b.lilyRainSeed) % 7;
      const baseX = ROOM_L + (lane + 0.5) * (ROOM_R - ROOM_L) / 7 - 2;
      const n = spawnBullet(baseX, 31, 0, fallSpeed, 20, B.noteDamage);
      if (n) {
        n.life = hardRain ? 120 : 150;
        n.baseX = baseX;
        n.swayAmp = hardRain ? (8 + (k % 3) * 2) : (7 + (k % 3) * 2);
        n.swayRate = hardRain ? (0.075 + (k % 2) * 0.014) : (0.065 + (k % 2) * 0.012);
        n.swayPhase = k * 1.37 + b.lilyRainSeed * 0.41;
      }
      for (let j = 0; j < 3; j++) spawnPart(baseX + 2, 34, (j - 1) * 0.18, 0.25 + j * 0.08, 20, j === 1 ? 5 : 0, j & 1 ? '#ffd2ef' : '#fff1b8');
      sfx('song');
    }
    if (b.t > wind + (count - 1) * interval + (hardRain ? 86 : 106)) bossSet('hover');
    return;
  }

  if (b.state === 'lilyLine') {
    bossFacePlayer(); b.hopY = 0; b.vx = 0; b.vy = 0;
    if (b.t === 1) b.lilyLineStartHigh = ((frame >> 2) & 1) !== 0;
    const times = lilyLineTimes(rage);
    let casting = false;
    for (let i = 0; i < times.length; i++) {
      if (b.t >= times[i] - 12 && b.t <= times[i] + 3) casting = true;
      if (b.t === times[i]) {
        const high = lilyLineHighAt(b, i);
        const y = high ? FLOOR_Y - 46 : FLOOR_Y - 17;
        const sx = b.face > 0 ? b.x + b.w + 2 : b.x - 10;
        const st = spawnBullet(sx, y, b.face * (rage ? 2.75 : 2.45), 0, 10, B.starDamage);
        if (st) st.life = 130;
        sfx('bshoot');
      }
    }
    b.pose = casting ? 'attack' : 'windup';
    b.poseF = casting ? 0 : ((b.t >> 3) & 1);
    if (b.t > times[times.length - 1] + 38) bossSet('hover');
    return;
  }

  if (b.state === 'lilyHeal') {
    b.pose = 'idle'; b.poseF = -1; b.hopY = 0; bossFacePlayer(); b.vx = 0; b.vy = 0;
    if (b.t === 34) {
      b.hp = Math.min(B.hp, b.hp + B.healAmount); b.hpShown = b.hp;
      sfx('heal');
      const hx = bossUmimi.x, hy = bossUmimi.y - 14;
      for (let i = 0; i < 12; i++) spawnPart(hx + (i % 4 - 1.5) * 4, hy, 0, -0.45 - (i % 3) * 0.12, 38, i % 3 === 0 ? 5 : 0, i & 1 ? '#ffd2ef' : '#fff4b8');
    }
    // Keep Umimi in front long enough to clearly read and test the water-shot shield.
    if (b.t > 128) bossSet('hover');
  }
}

const BOSS_AI = { tobiume: aiTobiume, neenia: aiNeenia, seiten: aiSeiten, astarte: aiAstarte, lily: aiLily, disaster: aiDisaster, shiranui: aiShiranui, diceroll: aiDiceroll };

function castSupport() {
  if (support.used || support.active || !equippedSupport() || state !== 'play' || P.dead) { sfx('buzz'); return; }
  if (equippedSupport() === 'lily' && (!stageUmimi.given || !stageUmimi.active || stageUmimi.down || stageUmimi.hp <= 0)) { sfx('buzz'); return; }
  support.used = true; support.active = true; support.hit = false; support.t = 0;
  support.kind = equippedSupport(); support.camX = cam.x;
  const bossVisible = bossHittable() && boss.x + boss.w > cam.x && boss.x < cam.x + VW;
  let target = bossVisible ? boss.x + boss.w / 2 : P.x + P.w / 2 + P.face * 46;
  if (!bossVisible) for (const e of enemies) {
    if (e.alive && e.active && e.x + e.w > cam.x && e.x < cam.x + VW) { target = e.x + e.w / 2; break; }
  }
  support.x = Math.max(cam.x + 28, Math.min(cam.x + VW - 28, target));
  support.y = support.kind === 'tobiume' ? -42 : FLOOR_Y - 32;
  if (support.kind === 'seiten') { support.x = P.x + P.w / 2 + (P.face < 0 ? 20 : -20); support.y = P.y; }
  if (support.kind === 'lily') { support.x = P.x + P.w / 2; support.y = FLOOR_Y - 32; support.face = P.face; }
  if (support.kind === 'star') { support.x = P.x + P.w / 2 - P.face * 16; support.y = P.y; }
  if (support.kind === 'shiranui') { support.x = P.x + P.w / 2 - P.face * 20; support.y = P.y; support.fx = []; }
  if (support.kind === 'diceroll') { support.x = P.x + P.w / 2 - P.face * 20; support.y = P.y; support.fx = []; support.n = 1 + ((Math.random() * 6) | 0); }
  if (support.kind === 'astarte') {
    if (bossVisible) support.x = Math.max(cam.x + 22, Math.min(cam.x + VW - 22, boss.x + boss.w / 2 - (boss.face || 1) * 22));
    support.y = bossVisible ? boss.y + boss.h / 2 : P.y;
  }
  support.face = P.face; sfx('warn'); refreshSupportButton();
}
function updateSupport() {
  if (!support.active) return;
  support.t++;
  const t = support.t;
  if (support.kind === 'star') { updateStarSupport(t); return; }
  if (support.kind === 'shiranui') { updateShiranuiSupport(t); return; }
  if (support.kind === 'diceroll') { updateDicerollSupport(t); return; }
  if (support.kind === 'lily') {
    // Idol support: spotlight entrance, then a friendly Starlight Rain over the whole viewport.
    if (t === 28 || t === 44 || t === 60 || t === 76) {
      sfx('arrow'); shake(4, 1);
      for (const e of enemies) {
        if (!e.alive || !e.active || e.x + e.w < cam.x || e.x > cam.x + VW) continue;
        e.hp -= 1; e.flash = 8;
        spawnPart(e.x + e.w / 2, e.y - 4, 0, -0.5, 16, 5, (t + Math.floor(e.x)) & 1 ? '#ffd2ef' : '#fff1b8');
        if (e.hp <= 0) killEnemy(e);
      }
      if (bossHittable() && boss.x + boss.w > cam.x && boss.x < cam.x + VW) {
        boss.inv = 0; damageBoss(null, 1);
      }
    }
    if (t >= 104) { support.active = false; if (stageUmimi.given) stageUmimi.active = true; }
    return;
  }
  if (support.kind === 'seiten') {
    // A single burst of restorative song; the shield then stays active for two seconds.
    support.x += (P.x + P.w / 2 + (P.face < 0 ? 20 : -20) - support.x) * 0.22;
    support.y += (P.y - support.y) * 0.22;
    if (t === 24) {
      const gained = Math.min(6, playerMaxHP() - P.hp);
      P.hp += gained; stats.heals += gained;
      P.inv = Math.max(P.inv, 120); sfx('song'); sfx('heal');
      for (let i = 0; i < 16; i++) spawnPart(P.x + P.w / 2 + DIR8X[i % 8] * 12, P.y + P.h / 2 + DIR8Y[i % 8] * 12, DIR8X[i % 8] * 0.6, -0.65, 45, i % 4 === 0 ? 5 : 0, i % 2 ? '#ffb3cb' : '#ffe99b');
    }
    if (t >= 96) support.active = false;
    return;
  }
  if (support.kind === 'astarte') {
    if (t === 29 && !support.hit) {
      support.hit = true; shake(13, 2); sfx('swoosh'); sfx('bhit');
      const hitX = support.x;
      if (bossHittable() && boss.x + boss.w > cam.x && boss.x < cam.x + VW) {
        boss.inv = 0; damageBoss(null, 4);
      } else {
        let best = null, bd = 80;
        for (const e of enemies) {
          if (!e.alive || !e.active || e.x + e.w < cam.x || e.x > cam.x + VW) continue;
          const d = Math.abs(e.x + e.w / 2 - hitX);
          if (d < bd) { best = e; bd = d; }
        }
        if (best) {
          best.hp -= 4; best.flash = 13;
          if (best.hp <= 0) killEnemy(best);
        }
      }
      for (let i = 0; i < 20; i++) spawnPart(hitX + (i % 5 - 2) * 4, support.y + (i % 4 - 2) * 6, (i % 5 - 2) * 0.75, (i % 4 - 2) * 0.9, 20, 0, i % 3 ? '#c5b3ff' : '#fffaff');
    }
    if (t >= 63) support.active = false;
    return;
  }
  if (support.kind === 'neenia') {
    if (t === 41 || t === 61 || t === 81) {
      // Three visible waves, each deals damage once across the active viewport.
      sfx('arrow'); shake(5, 1);
      for (const e of enemies) {
        if (!e.alive || !e.active || e.x + e.w < cam.x || e.x > cam.x + VW) continue;
        e.hp -= 1; e.flash = 8;
        spawnPart(e.x + e.w / 2, e.y, 0, -0.7, 13, 3, '#b8d6ff');
        if (e.hp <= 0) { killEnemy(e); stats.arrowKills++; }
      }
      if (bossHittable() && boss.x + boss.w > cam.x && boss.x < cam.x + VW) {
        boss.inv = 0; damageBoss(null, 1);
      }
    }
    if (t >= 112) support.active = false;
    return;
  }
  // Approach from beyond the upper edge, then descend into the fight.
  support.y = t < 13 ? -42 + t * 3.4 : t < 40 ? 2 + (t - 13) * 5.6 : FLOOR_Y - 32;
  if (t === 40 && !support.hit) {
    support.hit = true; shake(17, 3); sfx('boomS'); sfx('rescue');
    for (const e of enemies) {
      if (!e.alive || !e.active || e.x + e.w < cam.x || e.x > cam.x + VW) continue;
      e.hp -= 5; e.flash = 12;
      if (e.hp <= 0) killEnemy(e);
    }
    if (bossHittable() && boss.x + boss.w > cam.x && boss.x < cam.x + VW) {
      boss.inv = 0; damageBoss(null, 5);
    }
    for (let k = 0; k < 24; k++) {
      const ang = k * Math.PI / 12;
      spawnPart(support.x, FLOOR_Y - 13, Math.cos(ang) * (0.7 + k % 3), Math.sin(ang) * 1.4 - 0.6, 29, 0, k % 3 ? '#ff9dcc' : '#ffffff');
    }
  }
  if (t > 89) support.active = false;
}
function drawSupport(camX) {
  if (!support.active) return;
  const t = support.t, x = Math.round(support.x - camX), y = Math.round(support.y);
  if (support.kind === 'star') { drawStarSupport(t, x, y, camX); return; }
  if (support.kind === 'shiranui') { drawShiranuiSupport(t, x, y, camX); return; }
  if (support.kind === 'diceroll') { drawDicerollSupport(t, x, y, camX); return; }
  if (support.kind === 'lily') {
    const pulse = 0.16 + 0.08 * Math.sin(frame * 0.14);
    g.save();
    g.globalAlpha = pulse;
    g.fillStyle = '#fff1cf';
    g.beginPath(); g.moveTo(x - 7, 34); g.lineTo(x - 34, FLOOR_Y); g.lineTo(x + 34, FLOOR_Y); g.lineTo(x + 7, 34); g.closePath(); g.fill();
    g.restore();
    const L = SHEETS.lily, U = SHEETS.umimi;
    if (L) g.drawImage(pick(L[(t >> 4) & 1], support.face, false), x - 16, FLOOR_Y - 32);
    if (U) {
      const uf = sheetFrame('umimi', t < 24 ? 'enter' : 'idle', t >> 3);
      if (uf) g.drawImage(pick(uf, -support.face, false), x + 16, FLOOR_Y - 28);
    }
    for (let i = 0; i < 11; i++) {
      const phase = (i * 17 + t * (3 + (i & 1))) % 118;
      if (phase > 92) continue;
      const px = (i * 23 + 7) % VW;
      const py = 26 + phase;
      g.fillStyle = i & 1 ? '#ffd2ef' : '#fff1b8';
      g.fillRect(px, py, 2, 7); g.fillStyle = '#ffffff'; g.fillRect(px, py + 1, 1, 3);
    }
    return;
  }
  if (support.kind === 'seiten') {
    const fr = SHEETS.seiten, d = SHEET_DEFS.seiten, im = fr ? fr[(t >> 4) & 1] : SPR.ally.S[(t >> 4) & 1];
    g.drawImage(pick(im, support.face, false), x - (fr ? (support.face > 0 ? d.cx : d.fw - d.cx) : 16), y - 23);
    for (let i = 0; i < 5; i++) {
      const px = x - 19 + i * 10, py = y - 30 - (i & 1) * 6 + Math.round(Math.sin(frame * 0.17 + i) * 4);
      g.fillStyle = i & 1 ? '#fff4ab' : '#ff8ea8';
      g.fillRect(px, py + 3, 3, 3); g.fillRect(px + 2, py - 3, 2, 8); g.fillRect(px + 4, py - 3, 3, 1);
    }
    if (t >= 24) {
      const rad = (t - 24) * 2;
      g.strokeStyle = '#ffe4aa'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(Math.round(P.x + P.w / 2 - camX), Math.round(P.y + P.h / 2), Math.min(28, rad), Math.min(27, rad), 0, 0, Math.PI * 2); g.stroke();
    }
    return;
  }
  if (support.kind === 'astarte') {
    const fr = SHEETS.astarte, d = SHEET_DEFS.astarte, sp = fr ? fr[t < 29 ? 0 : 1] : SPR.ally.A[t < 29 ? 0 : 1];
    g.drawImage(pick(sp, support.face, t >= 29 && t < 36 && (frame & 2)), x - (fr ? (support.face > 0 ? d.cx : d.fw - d.cx) : 16), y - 20);
    if (t >= 23 && t <= 47) {
      const w = Math.min(75, (t - 22) * 6);
      g.strokeStyle = t & 2 ? '#eae2ff' : '#9c80fa'; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y - 3, w, -1.25, 0.65); g.stroke();
      g.fillStyle = '#ffffff'; g.fillRect(x + Math.min(28, w), y - 12, 3, 3);
    }
    return;
  }
  if (support.kind === 'neenia') {
    const N = SHEETS.neenia, face = support.face;
    if (N) {
      const d = SHEET_DEFS.neenia, sp = N[(frame >> 4) & 1];
      g.drawImage(pick(sp, face, false), x - (face >= 0 ? d.cx : d.fw - d.cx), FLOOR_Y - d.fh);
    } else g.drawImage(pick(SPR.ally.N[(frame >> 4) & 1], face, false), x - 16, FLOOR_Y - 32);
    // Light-filled volleys sweep the whole screen; they are scenery, not enemy bullets.
    for (const beat of [28, 48, 68]) {
      const dt = t - beat;
      if (dt < -10 || dt > 17) continue;
      for (let i = 0; i < 17; i++) {
        const px = i * 15 + ((i * 7 + beat) % 11);
        const py = Math.round(-18 + (dt + 10) * (8 + (i & 1)));
        g.fillStyle = i & 1 ? '#a9c3ff' : '#f6e7ff';
        g.fillRect(px, py, 2, 14); g.fillRect(px - 2, py + 9, 6, 2);
        g.fillStyle = '#ffffff'; g.fillRect(px, py + 2, 1, 8);
      }
    }
    return;
  }
  const fr = SHEETS.tobiumeNormal;
  if (fr) {
    const D = SHEET_DEFS.tobiumeNormal, anim = D.map.special_dive_kick || D.map.kick || D.map.fly;
    const index = anim[0] + Math.min(anim[1] - 1, Math.floor(t / 10));
    const sp = fr[index];
    if (sp) g.drawImage(pick(sp, support.face, t >= 40 && t < 48 && (frame & 2)), x - (support.face >= 0 ? D.cx : D.fw - D.cx), y - D.fh + 20);
  } else {
    const pose = t < 30 ? 'fly' : 'kick';
    g.drawImage(pick(SPR.tobi.normal[pose][(t >> 3) & 1], support.face, t >= 40 && t < 48 && (frame & 2)), x - 20, y - 20);
  }
  if (t >= 40 && t < 64) {
    g.fillStyle = t & 2 ? '#fff4df' : '#ffa3d2';
    for (let i = 0; i < 2; i++) { const r = (t - 40) * 5 + i * 12; g.fillRect(x - r, FLOOR_Y - 12 - i * 4, r * 2, 2); }
  }
}


// ---------------------------------------------------------------------
//  Allies: アスターテ (guide + checkpoint), ネーニア (support arrows), 青天 (healing song)
// ---------------------------------------------------------------------
function setCheckpoint(a) {
  checkpoint = true; sfx('cp'); a.said = true; say(a);
  for (let i = 0; i < 6; i++) spawnPart(a.x, a.y - 16, DIR8X[i] * 1.2, DIR8Y[i] * 1.2 - 0.5, 24, 0, i & 1 ? '#e8c060' : '#ffffff');
}
// one speech bubble at a time: a new speaker fades out whoever was talking
function say(a) {
  if (!a.line) return;
  for (const o of allies) if (o !== a && o.bubbleT > 20) o.bubbleT = 20;
  a.bubbleT = CONFIG.allies.bubbleFrames;
}
function updateAllies() {
  const A = CONFIG.allies, pcx = P.x + P.w / 2, pfeet = P.y + P.h;
  for (let i = 0; i < allies.length; i++) {
    const a = allies[i];
    a.t++; if (a.bubbleT > 0) a.bubbleT--; if (a.act > 0) a.act--;
    const dx = pcx - a.x, adx = Math.abs(dx), near = Math.abs(pfeet - a.y) < 44;
    if (a.act <= 0) a.face = dx < 0 ? -1 : 1;
    if (P.dead) continue;
    if (a.type === 'L') { // star lantern checkpoint (no speech)
      if (!checkpoint && ((adx < 14 && near) || P.x > a.x + 8)) { checkpoint = true; sfx('cp'); a.said = true;
        for (let k = 0; k < 8; k++) spawnPart(a.x, a.y - 14, DIR8X[k] * 1.2, DIR8Y[k] * 1.2, 24, 0, k & 1 ? '#ffe080' : '#ffffff'); }
    } else if (a.type === 'A') {
      if (a.cp) { if (!checkpoint && ((adx < 14 && near) || P.x > a.x + 8)) setCheckpoint(a); }
      else if (!a.said && adx < A.talkRange && near) { a.said = true; say(a); }
    } else if (a.type === 'N') {
      if (adx < A.neeniaRange) {
        if (!a.said) { a.said = true; say(a); }
        if (a.t % A.neeniaInterval === 0) {
          let best = null, bd = A.neeniaTargetRange;
          for (let j = 0; j < enemies.length; j++) {
            const e = enemies[j]; if (!e.alive || !e.active) continue;
            const d = Math.hypot(e.x + e.w / 2 - a.x, e.y + e.h / 2 - (a.y - 16)); if (d < bd) { bd = d; best = e; }
          }
          if (best) {
            const ax = a.x + (best.x + best.w / 2 < a.x ? -12 : 12), ay = a.y - 18, tx = best.x + best.w / 2 - ax, ty = best.y + best.h / 2 - ay, len = Math.hypot(tx, ty) || 1;
            for (let k = 0; k < arrows.length; k++) {
              const r = arrows[k]; if (r.active) continue;
              r.active = true; r.fox = null; r.die = 0; r.x = ax - 2; r.y = ay - 2; r.vx = tx / len * A.arrowSpeed; r.vy = ty / len * A.arrowSpeed; r.life = 90; break;
            }
            a.face = tx < 0 ? -1 : 1; a.act = 18; stats.arrows++; sfx('arrow');
          }
        }
      }
    } else if (a.type === 'R') { // ダイスロール: lobs a die at an enemy near Umine
      if (adx < A.dieRange) {
        if (!a.said) { a.said = true; say(a); }
        if (a.t % A.dieInterval === 0) {
          let best = null, bd = A.dieTargetRange;
          for (let j = 0; j < enemies.length; j++) {
            const e = enemies[j]; if (!e.alive || !e.active) continue;
            const d = Math.hypot(e.x + e.w / 2 - a.x, e.y + e.h / 2 - (a.y - 16)); if (d < bd) { bd = d; best = e; }
          }
          if (best) {
            const T = 36, sx = a.x, sy = a.y - 24, tx = best.x + best.w / 2, ty = best.y + best.h / 2;
            for (let k = 0; k < arrows.length; k++) {
              const r = arrows[k]; if (r.active) continue;
              r.active = true; r.fox = null; r.die = 1 + ((Math.random() * 6) | 0); r.x = sx - 2; r.y = sy - 2; r.vx = (tx - sx) / T; r.vy = (ty - sy) / T - 0.5 * 0.18 * T; r.life = 120; break;
            }
            a.face = tx < a.x ? -1 : 1; a.act = 18; sfx('arrow');
          }
        }
      }
    } else if (a.type === 'K') { // シラヌイ: slow homing foxfire at enemies near Umine
      if (adx < A.foxRange) {
        if (!a.said) { a.said = true; say(a); }
        if (a.t % A.foxInterval === 0) {
          let best = null, bd = A.foxTargetRange;
          for (let j = 0; j < enemies.length; j++) {
            const e = enemies[j]; if (!e.alive || !e.active) continue;
            const d = Math.hypot(e.x + e.w / 2 - a.x, e.y + e.h / 2 - (a.y - 16)); if (d < bd) { bd = d; best = e; }
          }
          if (best) {
            const f = best.x + best.w / 2 < a.x ? -1 : 1;
            for (let k = 0; k < arrows.length; k++) {
              const r = arrows[k]; if (r.active) continue;
              r.active = true; r.die = 0; r.fox = best; r.x = a.x + f * 8 - 2; r.y = a.y - 20; r.vx = f * A.foxSpeed; r.vy = -0.6; r.life = 150; break;
            }
            a.face = f; a.act = 18; sfx('arrow');
          }
        }
      }
    } else if (a.type === 'I') {
      if (!a.said && adx < A.talkRange && near) { a.said = true; say(a); giveStageUmimi(a); }
    } else if (a.type === 'S') {
      if (adx < A.seitenRange && near) {
        if (!a.said) { a.said = true; say(a); }
        a.act = 12;
        if (a.t % 10 === 0) { const h = hash(a.t, 3), k = (h >> 6) % 3; spawnPart(a.x + a.face * 6, a.y - 22, ((h & 63) / 64 - 0.5) * 0.8, -0.55, 50, 5, k === 0 ? '#ff6a8a' : k === 1 ? '#ffd84a' : '#8fd0ff'); }
        if (P.hp < playerMaxHP() && a.t % A.seitenHealEvery === 0) { P.hp++; stats.heals++; sfx('heal'); }
      }
    }
  }
}
function updateArrows() {
  for (let i = 0; i < arrows.length; i++) {
    const r = arrows[i]; if (!r.active) continue;
    if (r.fox) { // シラヌイ's foxfire steers toward its target
      const e = r.fox; if (e.alive) { const tx = e.x + e.w / 2 - r.x - 2, ty = e.y + e.h / 2 - r.y - 2, l = Math.hypot(tx, ty) || 1; r.vx += (tx / l * CONFIG.allies.foxSpeed - r.vx) * 0.12; r.vy += (ty / l * CONFIG.allies.foxSpeed - r.vy) * 0.12; }
    }
    if (r.die) r.vy += 0.18;   // ダイスロール's lobbed die
    r.x += r.vx; r.y += r.vy;
    if (--r.life <= 0 || r.x < cam.x - 24 || r.x > cam.x + VW + 24 || r.y > VH || r.y < -24) { r.active = false; continue; }
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j]; if (!e.alive || !e.active) continue;
      if (hitsEnemy(r, e)) {
        r.active = false; e.hp -= r.fox ? CONFIG.allies.foxDamage : r.die ? CONFIG.allies.dieDamage : CONFIG.allies.arrowDamage; e.flash = 6;
        spawnPart(r.x + 2, r.y + 2, 0, 0, 6, 3, '#e8e8ff');
        if (e.hp <= 0) { killEnemy(e); stats.arrowKills++; } else sfx('ehit');
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------
//  Shots, bullets, collisions
// ---------------------------------------------------------------------
function updateShots() {
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i]; if (!s.active) continue;
    s.x += s.vx;
    if (s.x < cam.x - 16 || s.x > cam.x + VW + 16) { s.active = false; continue; }
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j]; if (!e.alive || !e.active) continue;
      if (hitsEnemy(s, e)) {
        s.active = false; e.hp -= CONFIG.shotDamage; e.flash = 6; splashAt(s.x + (s.vx > 0 ? s.w : 0), s.y + 2, s.vx > 0 ? 1 : -1);
        if (e.hp <= 0) killEnemy(e);
        else sfx('ehit');
        break;
      }
    }
    if (s.active && curArea.boss === 'lily' && bossUmimi.active && (bossUmimi.state === 'heal' || bossUmimi.state === 'shield')) {
      // Umimi is a living water shield during Lily's heal and encore. Umine's
      // water shots splash harmlessly against her instead of reaching Lily.
      const uShield = { x: bossUmimi.x - 14, y: bossUmimi.y - 29, w: 28, h: 28 };
      if (overlap(s, uShield)) {
        s.active = false;
        splashAt(s.x + (s.vx > 0 ? s.w : 0), s.y + 2, s.vx > 0 ? 1 : -1);
        for (let k = 0; k < 5; k++) spawnPart(bossUmimi.x + (k - 2) * 3, bossUmimi.y - 16, (k - 2) * 0.18, -0.55 - (k & 1) * 0.18, 16, 5, k & 1 ? '#c8f6ff' : '#ffffff');
        sfx('tink');
      }
    }
    if (s.active && curArea.final && finalShotHook(s)) continue;
    if (s.active && boss.state !== 'off' && overlap(s, boss)) { if (damageBoss(s)) { s.active = false; splashAt(s.x + (s.vx > 0 ? s.w : 0), s.y + 2, s.vx > 0 ? 1 : -1); } }
  }
}
function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i]; if (!b.active) continue;
    b.t++;
    if (b.hook && b.hook(b)) continue;   // per-bullet behaviour (Shiranui homing / orbit / boomerang); true = finished
    if (b.orbit) { // star orb circling Astarte (ellipse, so it skims the floor)
      if (boss.state !== 'orbs') { b.orbit = false; b.vx = Math.cos(b.ang) * 1.5; b.vy = Math.sin(b.ang) * 1.1; }
      else { b.ang += b.spin; b.rad = Math.min(b.rad + 0.7, CONFIG.bosses.astarte.orbRadius);
        b.x = boss.x + boss.w / 2 + Math.cos(b.ang) * b.rad - b.w / 2; b.y = boss.y + boss.h / 2 - 8 + Math.sin(b.ang) * b.rad * 0.72 - b.h / 2; }
    }
    if (b.g) b.vy += b.g;
    if (!b.orbit) { b.x += b.vx; b.y += b.vy; }
    if (b.kind === 11) b.y = b.baseY + Math.sin(b.t * 0.12 + b.ang) * 12; // note wobble
    if (b.kind === 8 && b.wobbleAmp) {
      b.y = b.baseY + Math.sin(b.t * b.wobbleRate + b.wobblePhase) * b.wobbleAmp;
    } // Lily song wave: collision and drawing move together
    if (b.kind === 20 && b.swayAmp) {
      b.x = b.baseX + Math.sin(b.t * b.swayRate + b.swayPhase) * b.swayAmp;
    } // Lily confetti: visible sprite and hitbox sway together
    if (b.life > 0 && --b.life === 0) { b.active = false; continue; }
    if (b.ret && !b.returned && (b.t >= b.ret || b.x < ROOM_L + 4 || b.x + b.w > ROOM_R - 4)) { b.returned = true; b.vx = -b.vx; } // Disaster's returning scythe
    if (b.kind >= 13 && b.kind <= 15 && neeniaArrowUpdate(b)) continue;
    if (b.x < cam.x - 16 || b.x > cam.x + VW + 16 || b.y < -16 || b.y > VH + 16) { b.active = false; continue; }
    if ((b.kind === 4 || b.kind === 8 || b.kind === 9) && (b.x < ROOM_L - 4 || b.x + b.w > ROOM_R + 4)) { b.active = false; continue; } // waves hit the wall
    if (!b.orbit && b.kind !== 12 && b.kind !== 8 && b.kind !== 9 && b.kind !== 22 && b.kind !== 25 && b.kind !== 27 && b.kind !== 28 && b.kind !== 32 && b.kind !== 33 && solid(Math.floor((b.x + b.w / 2) / TS), Math.floor((b.y + b.h / 2) / TS))) { if (b.kind === 23) disasterOrbBurst(b); b.active = false; spawnPart(b.x + b.w / 2, b.y + b.h / 2, 0, 0, 5, 3, '#ffffff'); continue; }
    if (b.kind === 16 && b.t < 6) continue; // thorns sprouting: harmless for a few frames
    if (stageUmimi.active && stageUmimi.given && !stageUmimi.down && stageUmimi.inv <= 0 && !(support.active && support.kind === 'lily') &&
        b.kind !== 4 && b.kind !== 8 && b.kind !== 9 && b.kind !== 12 && b.kind !== 16 && b.kind !== 20 && b.kind !== 22 && b.kind !== 27 && b.kind !== 28 && overlap(b, stageUmimiBox())) {
      if (hurtStageUmimi(b.dmg || 1, b.x + b.w / 2)) {
        b.active = false; continue;
      }
    }
    if (stageUmimi.active && stageUmimi.given && !stageUmimi.down && stageUmimi.inv <= 0 && !(support.active && support.kind === 'lily') &&
        (b.kind === 4 || b.kind === 8 || b.kind === 9 || b.kind === 12 || b.kind === 16 || b.kind === 20 || b.kind === 22 || b.kind === 27 || b.kind === 28) && overlap(b, stageUmimiBox())) {
      hurtStageUmimi(b.dmg || 1, b.x + b.w / 2);
    }
    if (!P.dead && P.inv <= 0 && overlap(b, P)) { hurtPlayer(b.dmg, b.kind === 12 ? boss.x + boss.w / 2 : b.x + b.w / 2 - b.vx * 4); if (b.kind !== 12 && b.kind !== 16 && b.kind !== 22 && b.kind !== 27 && b.kind !== 28) b.active = false; }
  }
}
// v5 Neenia arrows: lob (13) breaks on the floor, ricochet (14) bounces, snare (15) plants a thorn patch (16).
// returns true when the bullet is finished for this frame
function neeniaArrowUpdate(b) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  if (b.kind === 14) {
    if ((b.t & 1) === 0) spawnPart(cx, cy, 0, 0, 10, 4, (b.t & 2) ? '#7fe8ff' : '#c090ff');
    const XL = ricoXL(), XR = ricoXR(), YT = ricoYT(), YB = ricoYB(); let hitX = cx < XL ? XL : cx > XR ? XR : 0, hitY = cy < YT ? YT : cy > YB ? YB : 0;
    if (hitX || hitY) {
      if (b.bnc <= 0) { b.active = false; spawnPart(cx, cy, 0, 0, 8, 3, '#ffffff'); for (let i = 0; i < 4; i++) spawnPart(cx, cy, DIR8X[i * 2] * 0.8, DIR8Y[i * 2] * 0.8, 12, 0, '#7fe8ff'); return true; }
      b.bnc--; if (hitX) { b.x += 2 * (hitX - cx); b.vx = -b.vx; } if (hitY) { b.y += 2 * (hitY - cy); b.vy = -b.vy; }
      spawnPart(hitX || cx, hitY || cy, 0, 0, 8, 1, '#7fe8ff'); sfx('tink');
    }
    return false;
  }
  if (b.y + b.h >= FLOOR_Y) { // lobbed / snare arrow reaches the floor
    if (b.kind === 13) { b.active = false; spawnPart(cx, FLOOR_Y - 2, 0, 0, 7, 3, '#ffffff'); for (let i = 0; i < 3; i++) spawnPart(cx, FLOOR_Y - 2, (i - 1) * 0.7, -1, 14, 0, '#c8a0ff'); return true; }
    const W = CONFIG.bosses.neenia.snareW;
    b.kind = 16; b.w = W; b.h = 9; b.x = Math.max(ROOM_L, Math.min(ROOM_R - W, cx - W / 2)); b.y = FLOOR_Y - 9; b.vx = b.vy = 0; b.g = 0; b.t = 0;
    b.dmg = CONFIG.bosses.neenia.snareDamage; b.life = bossRage() ? CONFIG.bosses.neenia.snareLifeRage : CONFIG.bosses.neenia.snareLife;
    for (let i = 0; i < 6; i++) spawnPart(cx, FLOOR_Y - 3, (i - 2.5) * 0.6, -1 - (i & 1) * 0.6, 16, 0, i & 1 ? '#5aff8a' : '#b070ff');
    sfx('land'); return true;
  }
  return false;
}
function playerContacts() {
  if (!P.dead && P.inv <= 0) {
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i]; if (!e.alive || !e.active) continue;
      if (overlap(P, e)) { hurtPlayer(enemyDamage(e), e.x + e.w / 2); break; }
    }
    const b = boss;
    if (bossHittable() && overlap(P, b)) hurtPlayer(bossCfg().contactDamage, b.x + b.w / 2);
  }
  if (stageUmimi.active && stageUmimi.given && !stageUmimi.down && stageUmimi.inv <= 0 && !(support.active && support.kind === 'lily')) {
    const ub = stageUmimiBox();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i]; if (!e.alive || !e.active) continue;
      if (overlap(ub, e)) { hurtStageUmimi(enemyDamage(e), e.x + e.w / 2); break; }
    }
    if (bossHittable() && overlap(ub, boss)) hurtStageUmimi(bossCfg().contactDamage, boss.x + boss.w / 2);
  }
}
function updateParticles() {
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]; if (!p.active) continue;
    p.x += p.vx; p.y += p.vy;
    if (p.kind === 0) p.vy += 0.12; else if (p.kind === 5) p.x += Math.sin(p.life * 0.2) * 0.3;
    if (--p.life <= 0) p.active = false;
  }
}
function updateCamera() {
  const target = clampCam(P.x + P.w / 2 - VW / 2);
  cam.x += (target - cam.x) * CONFIG.cameraLerp;
  if (Math.abs(target - cam.x) < 0.05) cam.x = target;
  cam.x = clampCam(cam.x);
}
function checkTriggers() {
  if (!boss.triggered && P.x > ROOM_X + 4 && !P.dead) {
    boss.triggered = true; introPhase = 0; P.vx = 0; P.hurt = 0;
    for (const s of shots) s.active = false;
    for (const b of bullets) b.active = false;
    setState('bossIntro');
  }
}
function updateBossIntro() {
  // phase 0: scroll the camera into the room while the hero walks in
  if (introPhase === 0) {
    cam.x = Math.min(ROOM_X, cam.x + CONFIG.bossScrollSpeed);
    if (P.x < ROOM_X + 30) { P.vx = 1; P.face = 1; moveX(P); P.animT++; } else { P.vx = 0; P.animT = 0; }
    P.vy = Math.min(P.vy + CONFIG.gravity, CONFIG.maxFall); moveY(P);
    if (cam.x >= ROOM_X && P.x >= ROOM_X + 30) { introPhase = 1; stateT = 0; sfx('door'); }
  } else if (introPhase === 1) {       // phase 1: shutter closes behind the hero
    doorAnim = Math.min(1, stateT / 16);
    if (doorAnim >= 1) {
      doorClosed = true; introPhase = 2;
      bossReset(); boss.triggered = true;
      boss.x = BOSS_C * TS + (TS - boss.w) / 2; boss.tx = boss.x; boss.y = -44; boss.vx = 0; boss.vy = 0; boss.face = -1; boss.bob = 0;
      bossSet('enter');
      if (curArea.final) { if (FINAL.phase === 'mimic') { boss.y = FLOOR_Y - boss.h - 60; } finalIntroLine(); }
    }
  } else {                             // phase 2: boss flies in through the ceiling hatch, HP bar fills, then fight
    updateBoss();
  }
  if (P.shootT > 0) P.shootT--;
  if (P.inv > 0) P.inv--;
}

// =====================================================================
//  Fixed-step update (60Hz)
// =====================================================================
function update() {
  frame++; stats.updates++; stateT++;
  if (window.__rocksideBot) window.__rocksideBot(); // test hook (tools/bossbot.js)
  inp.left = keys.left || touch.left; inp.right = keys.right || touch.right;
  inp.jump = keys.jump || touch.jump; inp.shoot = keys.shoot || touch.shoot;
  if (hitStop > 0) { hitStop--; }
  else {
    switch (state) {
      case 'title':
        titleScroll += 0.5;
        if (resetArmT > 0) resetArmT--;
        if (inp.resetPressed && clearedCount() > 0) {   // erase progress: press/tap twice within 3 s
          if (resetArmT > 0) { eraseProgress(); resetArmT = 0; sfx('erase'); } else { resetArmT = 180; sfx('buzz'); }
        } else if (inp.startPressed && stateT > 10) { sfx('start'); openSelect(selCursor); }
        break;
      case 'select':
        titleScroll += 0.25;
        updateSelect();
        break;
      case 'areaIntro':
        updateAreaIntro();
        break;
      case 'ready':
        updateCamera();
        if (stateT >= 50) setState('play');
        break;
      case 'play':
        stats.playFrames++;
        updateMagic(); updatePlayer();
        if (inp.supportPressed) castSupport();
        if (state !== 'play') break;
        updateEnemies(); updateAllies(); updateBoss(); updateSupport(); updateStageUmimi(); updateShots(); updateArrows(); updateBullets(); playerContacts();
        updateCamera(); checkTriggers();
        break;
      case 'bossIntro':
        updateBossIntro();
        break;
      case 'dying':
        if (stateT >= 100) setState('gameover');
        break;
      case 'gameover':
        if (inp.startPressed && stateT > 30) resetStage(checkpoint);
        break;
      case 'climax': case 'finale': case 'theEnd': case 'ending':
        updateFinalState();
        break;
      case 'clear':  // back to the stage select, cursor on the cleared area (now marked)
        if (inp.startPressed && stateT > 60) { resetStage(false); openSelect(curArea.slot); }
        break;
    }
    updateParticles();
    if (shakeT > 0) shakeT--;
  }
  inp.magicPressed = false; inp.supportPressed = false; inp.supportCyclePressed = false; inp.jumpPressed = false; inp.shootPressed = false; inp.startPressed = false; inp.enterPressed = false; inp.resetPressed = false; inp.backPressed = false;
  inp.leftPressed = false; inp.rightPressed = false; inp.upPressed = false; inp.downPressed = false;
}
