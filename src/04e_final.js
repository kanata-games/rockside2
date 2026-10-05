
// =====================================================================
//  FINAL AREA (centre cell, AREAS id 'final', ?area=9): 幽境の掃除館
//   boss room: BOSS RUSH (the 8 dark friends as shadows, 60% HP, HP refill between)
//   -> 清掃員カナタ form 1 (kanataBoss) -> 暴走ミミック form 2 (mimicRampage, Kanata's ghost assists)
//   -> climax at form-2 HP <= climaxHp: the 8 friends' cut-ins + 海音 awakens and parts the sea (海割り, finishing blow)
//   -> finale dialogue -> ending (or THE END placeholder)
//  curArea.boss is switched on the fly (rush ids, 'kanata', 'mimic') so every boss code path keeps working.
// =====================================================================
const RUSH_ORDER = ['tobiume', 'neenia', 'seiten', 'astarte', 'disaster', 'lily', 'shiranui', 'diceroll'];
const RUSH_HP_SCALE = 0.6;
const FINAL = { phase: 'rush', rushIdx: 0, swallowed: 0, line: null, lineT: 0, body: null,
  ghost: { x: 0, y: 0, t: 0, throwT: 0, face: 1, show: false }, climaxT: 0, finaleI: 0, finaleT: 0, flash: 0, rushCfg: {} };
BOSS_TYPES.kanata = { hud: 'KANATA', speaker: '清掃員カナタ', speakerColor: '#a8c8ff', line: '', face: 'face_kanata',
  clearEn: 'KANATA', clearJp: '', dark: 'kanataBoss', normal: 'kanata', fly: true, w: 22, h: 46,
  aura: ['#1a2a5a', '#5a7ac8'], sparkle: '#c8e0ff', dust: '#a0b0d0' };
BOSS_TYPES.mimic = { hud: 'MIMIC', speaker: '暴走ミミック', speakerColor: '#8ab0ff', line: '', face: 'face_kanata',
  clearEn: 'MIMIC', clearJp: '', dark: 'mimicRampage', normal: 'mimicRampage', w: 30, h: 30,
  aura: ['#101030', '#3a4a9a'], sparkle: '#c8e0ff', dust: '#8a8aa8' };
BOSS_AI.kanata = aiKanata; BOSS_AI.mimic = aiMimic;
Object.assign(BULLET_SIZE, { 35: [10, 10], 36: [8, 8], 37: [7, 5], 38: [9, 9], 39: [10, 10] });
const UMINE_SPEAKER = { name: '海音', color: '#7fd8ff', face: 'face_kanon' };
const KANATA_SPEAKER = { name: '清掃員カナタ', color: '#b8d0ff', face: 'face_kanata' };

function finalBossId() { return FINAL.phase === 'rush' ? RUSH_ORDER[FINAL.rushIdx] : FINAL.phase === 'mimic' ? 'mimic' : FINAL.phase === 'darkumine' ? 'darkumine' : 'kanata'; }
// called by startGame() when the final area is entered (debug params pick the starting phase)
function finalBegin() {
  FINAL.phase = DEBUG.mimic ? 'mimic' : DEBUG.kanata ? 'kanata' : DEBUG.darkumine ? 'darkumine' : 'rush'; FINAL.queue = null; FINAL.duMet = false; duReset();
  FINAL.rushIdx = Math.max(0, Math.min(7, DEBUG.rush | 0));
  FINAL.line = null; FINAL.body = null; FINAL.ghost.show = false; FINAL.swallowed = 0; FINAL.flash = 0;
  curArea.boss = finalBossId();
}
// rush bosses: scaled copy of the config (hp * 0.6)
function finalCfg(c) {
  if (FINAL.phase !== 'rush' || !c) return c;
  const id = curArea.boss; let s = FINAL.rushCfg[id];
  if (!s) { s = Object.assign({}, c); s.hp = Math.max(8, Math.round(c.hp * RUSH_HP_SCALE)); FINAL.rushCfg[id] = s; }
  return s;
}
function finalShadowAlpha() { return FINAL.phase === 'rush' ? 0.8 + Math.sin(frame * 0.21) * 0.1 : 1; }
function finalSay(sp, text, frames) { FINAL.line = { sp: sp, text: text }; FINAL.lineT = frames || 200; }
// on (re)start of the stage: keep the rush progress, the right boss waits in the room
function finalOnReset() {
  curArea.boss = finalBossId(); FINAL.line = null; FINAL.queue = null; duReset(); FINAL.body = null; FINAL.ghost.show = FINAL.phase === 'mimic'; FINAL.swallowed = 0;
}
function finalSpawnBoss(dropY) {
  bossReset(); boss.triggered = true;
  boss.x = BOSS_C * TS + (TS - boss.w) / 2; boss.tx = boss.x; boss.y = dropY === undefined ? -44 : dropY; boss.vx = 0; boss.vy = 0; boss.face = -1; boss.bob = 0;
  bossSet('enter'); for (const s of shots) s.active = false; P.vx = 0;
  setState('bossIntro'); introPhase = 2;
}
// the room trigger: first boss of the current phase (also used after a retry)
function finalIntroLine() {
  if (FINAL.phase === 'rush' && FINAL.rushIdx === 0) finalSay(KANATA_SPEAKER, '…ふぁ。来ちゃったんだ。…じゃあ、まずは影たちと遊んでて。', 200);
  else if (FINAL.phase === 'darkumine') { if (!FINAL.duMet) duIntroLines(); else { finalSay(DARK_SPEAKER, '……また来たの？ …いいよ。わたしは、あなただから。', 200); FINAL.queue = null; } }
  else if (FINAL.phase === 'kanata') finalSay(KANATA_SPEAKER, '…めんどくさいけど、お掃除の時間。', 200);
  else if (FINAL.phase === 'mimic') { if (DEBUG.climax) boss.hp = bossCfg().climaxHp + 1; FINAL.ghost.show = true; FINAL.ghost.x = boss.x - 30; FINAL.ghost.y = FLOOR_Y - 90; finalSay(KANATA_SPEAKER, '…この子、まだおなかぺこぺこみたい。…止めてあげて。', 200); }
}
// boss defeated while in the final: true = handled here (rush / form changes); never reaches the normal STAGE CLEAR
function finalRescue(b) {
  if (FINAL.phase === 'rush') {
    b.pose = b.t < 24 ? 'hurt' : 'defeat'; b.poseF = -1;
    if (b.t > 18) b.alpha = Math.max(0, 1 - (b.t - 18) / 34); b.hidden = b.alpha <= 0.02;
    if (b.t < 52 && b.t % 3 === 0) { const h = hash(b.t, 77); spawnPart(b.x + (h % (b.w + 16)) - 8, b.y + ((h >> 8) % b.h), 0, -0.6, 26, 4, (h >> 4) & 1 ? '#8a5ad8' : '#d8c0ff'); }
    if (b.y + b.h < FLOOR_Y && !bossType().fly) b.y = Math.min(FLOOR_Y - b.h, b.y + 1);
    if (b.t === 20) sfx('swoosh');
    if (b.t >= 56 && P.onGround && !P.dead) {
      FINAL.rushIdx++;
      P.hp = playerMaxHP(); magic.mp = CONFIG.magicMaxMP; P.inv = 0; sfx('heal');
      for (let i = 0; i < 10; i++) spawnPart(P.x + P.w / 2, P.y + P.h / 2, DIR8X[i & 7] * 1.1, DIR8Y[i & 7] * 1.1 - 0.4, 26, 5, i & 1 ? '#8fffb0' : '#ffffff');
      if (FINAL.rushIdx >= RUSH_ORDER.length) { FINAL.phase = 'darkumine'; curArea.boss = 'darkumine'; finalSpawnBoss(); duIntroLines(); }
      else { curArea.boss = RUSH_ORDER[FINAL.rushIdx]; finalSpawnBoss(); }
    }
    return true;
  }
  if (FINAL.phase === 'darkumine') return duRescue(b);
  if (FINAL.phase === 'kanata') { // she kneels (6), collapses (7), her body fades, the vacuum mimic breaks loose
    b.pose = b.t < 50 ? 'hurt' : 'defeat'; b.poseF = -1; b.suckOn = false; b.objs = null;
    if (b.y + b.h < FLOOR_Y) b.y = Math.min(FLOOR_Y - b.h, b.y + 0.8);
    if (b.t === 1) finalSay(KANATA_SPEAKER, '…あ、れ。…ちから、ぬけちゃう…', 150);
    if (b.t === 50) { sfx('land'); shake(6, 2); }
    if (b.t === 95) finalSay(KANATA_SPEAKER, '…だめ、この子……勝手に、動いて……！', 150);
    if (b.t > 95 && b.t % 4 === 0) { b.x += (b.t & 4) ? 1 : -1; }
    if (b.t >= 150 && P.onGround && !P.dead) {
      FINAL.body = { x: b.x + b.w / 2, face: b.face, t: 0 };
      FINAL.phase = 'mimic'; curArea.boss = 'mimic';
      const fx = b.x + b.w / 2;
      bossReset(); boss.triggered = true; boss.x = Math.max(ROOM_L + 4, Math.min(ROOM_R - 4 - boss.w, fx + 4 - boss.w / 2)); boss.y = FLOOR_Y - boss.h - 40; boss.vy = -2;
      boss.face = P.x + P.w / 2 < fx ? -1 : 1; boss.fi = 0; bossSet('enter'); P.vx = 0; P.inv = 0;
      P.hp = playerMaxHP(); magic.mp = CONFIG.magicMaxMP; sfx('heal'); // full refill between the two forms
      FINAL.ghost.show = true; FINAL.ghost.x = fx; FINAL.ghost.y = FLOOR_Y - 40; FINAL.ghost.t = 0; FINAL.ghost.throwT = 0;
      sfx('boom'); shake(14, 3); for (let i = 0; i < 12; i++) spawnPart(fx, FLOOR_Y - 20, DIR8X[i & 7] * 1.6, DIR8Y[i & 7] * 1.6, 30, 0, i & 1 ? '#5a7ac8' : '#c8e0ff');
      finalSay(KANATA_SPEAKER, '…暴走しちゃった。…ごめん、止めてあげて。', 200);
      setState('bossIntro'); introPhase = 2;
    }
    return true;
  }
  return false;
}
// damage hook: form 2 never dies by shots - the climax takes over at climaxHp
function finalDamageHook(b) {
  if (curArea.boss !== 'mimic' || state !== 'play') return false;
  const B = bossCfg();
  if (b.hp > B.climaxHp) return false;
  b.hp = B.climaxHp; b.hpShown = b.hp; startClimax(); return true;
}
// shots inside the suction cone are dragged into the mouth and swallowed (spat back later)
function finalShotHook(s) {
  const b = boss; if (!b.suckOn) return false;
  const m = finalMouth(b), sx = s.x + s.w / 2, sy = s.y + s.h / 2, dx = (sx - m.x) * b.face, dy = sy - m.y;
  if (dx < -8 || dx > bossCfg().suckRange + 20 || Math.abs(dy) > 56) return false;
  s.y += (m.y - sy) * 0.18; s.vx = -b.face * Math.max(Math.abs(s.vx), 3);
  if (dx < 12) { s.active = false; FINAL.swallowed = Math.min(12, FINAL.swallowed + 1); spawnPart(m.x, m.y, 0, 0, 8, 1, '#9fe8ff'); sfx('tink'); }
  return true;
}
function finalMouth(b) {
  const by = b.y + b.h + b.hopY, cx = b.x + b.w / 2;
  if (curArea.boss === 'mimic') { const M = { 0: [49, 51], 1: [57, 42], 2: [46, 47], 3: [45, 49], 4: [45, 46], 6: [49, 50] }[b.fi | 0] || [46, 47]; return { x: cx + b.face * (M[0] - 34), y: by - 64 + M[1] }; }
  if (b.state === 'kSpit') return { x: cx + b.face * (56 - 32), y: by - 64 + 30 };
  return { x: cx + b.face * (52 - 32), y: by - 64 + 41 };
}
// suction: pull Umine toward the mouth (weaker than running, so running/jumping away always works); touching the mouth bites
function finalSuction(b, pull, pullAir, range, bite) {
  const m = finalMouth(b), pcx = P.x + P.w / 2, dx = (pcx - m.x) * b.face, dy = (P.y + P.h / 2) - m.y;
  if (!P.dead && dx > -6 && dx < range && Math.abs(dy) < 70) {
    const k = Math.min(1, 0.45 + (range - dx) / range); // stronger when close
    const ov = P.vx; P.vx = -b.face * (P.onGround ? pull : pullAir) * k; moveX(P); P.vx = ov;
    if (dx < 14 && Math.abs(dy) < 18) hurtPlayer(bite, m.x);
  }
  if (frame % 2 === 0) { const h = hash(frame, 41), d = 30 + (h % Math.max(10, range - 30)); spawnPart(m.x + b.face * d, m.y - 30 + ((h >> 8) % 60), -b.face * (1.6 + ((h >> 4) & 3) * 0.4), 0, 18, 4, (h >> 3) & 1 ? '#bfe8ff' : '#7ab0ff'); }
}
// ---------------------------------------------------------------------
//  清掃員カナタ form 1
// ---------------------------------------------------------------------
const KANATA_OPTS = ['lev', 'suck', 'ghosts', 'glide'];
// thrown items: [sheet, frame] - debris + a few souvenirs of the 8 stages (dice, card, fan)
const KANATA_ITEMS = [['kanataBullets', 3], ['kanataBullets', 4], ['kanataBullets', 5], ['kanataBullets', 6], ['kanataBullets', 7],
  ['dicerollBullets', 4], ['dicerollBullets', 12], ['shiranuiBullets', 4], ['kanataBullets', 5], ['dicerollBullets', 0]];
function kanataNext(b, B, after) {
  b.combo = !after && Math.random() < (bossRage() ? B.comboChanceRage : B.comboChance);
  if (b.combo) { kanataChoose(b, B); return; }
  bossSet('hover'); b.wait = bossRage() ? B.idleFramesRage : B.idleFrames;
}
function kanataChoose(b, B) {
  const pcx = P.x + P.w / 2, near = Math.abs(pcx - (b.x + b.w / 2)) < 44;
  let p = pickPattern(KANATA_OPTS);
  if (near && p === 'suck' && Math.random() < 0.5) p = 'glide';
  b.last = p; bossSeen(p); bossFacePlayer();
  if (p === 'lev') { bossSet('kLev'); kanataMakeObjs(b, B); sfx('swoosh'); }
  else if (p === 'suck') { bossSet('kSuckWarn'); sfx('warn'); }
  else if (p === 'ghosts') { bossSet('kGhosts'); }
  else { bossSet('kGlide'); b.gx0 = b.x; b.gy0 = b.y; b.gx1 = (b.x + b.w / 2 < (ROOM_L + ROOM_R) / 2) ? ROOM_R - 30 - b.w : ROOM_L + 30; }
}
function kanataMakeObjs(b, B) {
  const n = b.pr ? B.levCountRage : B.levCount, cx = b.x + b.w / 2; b.objs = [];
  const slots = [[-30, -62], [0, -76], [30, -62], [-46, -40], [46, -40]];
  for (let i = 0; i < n; i++) {
    const it = KANATA_ITEMS[(Math.random() * KANATA_ITEMS.length) | 0], s = slots[i];
    b.objs.push({ sheet: it[0], f: it[1], x0: cx + (i - (n - 1) / 2) * 24, y0: FLOOR_Y - 6, ox: s[0], oy: s[1], x: cx, y: FLOOR_Y - 6, thrown: false, rot: 0, aimX: 0, aimY: 0, lock: false });
  }
  b.objI = 0;
}
function aiKanata(b, B, pcx, pcy) {
  b.fi = 0;
  if (b.state !== 'kGlide') astarteFloat(b, B);
  const rage = bossRage();
  switch (b.state) {
    case 'hover':
      b.pose = 'idle'; bossFacePlayer(); b.suckOn = false;
      if (b.wait === undefined) b.wait = B.idleFrames;
      if (b.t >= b.wait) kanataChoose(b, B);
      break;
    case 'kLev': { // objects rise (wind-up), aim lines, then thrown one at a time
      b.pose = 'levitate'; bossFacePlayer();
      const wind = b.pr ? B.levWindRage : B.levWind, gap = b.pr ? B.levGapRage : B.levGap, cx = b.x + b.w / 2, top = b.y + b.h - 64;
      for (let i = 0; i < b.objs.length; i++) {
        const o = b.objs[i]; if (o.thrown) continue;
        const k = Math.min(1, b.t / wind), e = 1 - Math.pow(1 - k, 3);
        const tx = cx + o.ox, ty = top + 20 + o.oy + Math.sin((b.t + i * 9) * 0.12) * 2;
        o.x = o.x0 + (tx - o.x0) * e; o.y = o.y0 + (ty - o.y0) * e; o.rot = Math.sin((b.t + i * 5) * 0.2) * 0.3;
      }
      if (b.t > wind) {
        const i = b.objI, st = wind + i * gap;
        if (i < b.objs.length) {
          const o = b.objs[i];
          if (!o.lock) { o.aimX = pcx; o.aimY = P.y + P.h - 8; }
          if (b.t >= st + gap - 8) o.lock = true;          // aim locks shortly before the throw
          if (b.t >= st + gap) {
            const dx = o.aimX - o.x, dy = o.aimY - o.y, d = Math.hypot(dx, dy) || 1;
            const q = spawnBullet(o.x - 5, o.y - 5, dx / d * B.levSpeed, dy / d * B.levSpeed, 35, B.levDamage);
            if (q) { q.icon = o.sheet; q.iconF = o.f; q.spin = (Math.random() < 0.5 ? -1 : 1) * 0.2; }
            o.thrown = true; b.objI++; sfx('bshoot');
          }
        } else if (b.t >= st + 16) { b.objs = null; kanataNext(b, B); }
      }
      break; }
    case 'kSuckWarn':
      b.pose = 'suck'; b.fi = 4;
      if (b.t % 3 === 0) { const m = finalMouth(b), h = hash(b.t, 3); spawnPart(m.x + b.face * (20 + (h % 40)), m.y - 12 + ((h >> 6) % 24), -b.face * 0.9, 0, 16, 4, '#bfe8ff'); }
      if (b.t >= (b.pr ? B.suckWarnRage : B.suckWarn)) { bossSet('kSuck'); b.suckOn = true; FINAL.swallowed = 0; sfx('swoosh'); }
      break;
    case 'kSuck':
      b.pose = 'suck'; b.fi = 4; b.suckOn = true;
      finalSuction(b, B.suckPull, B.suckPullAir, B.suckRange, B.suckBite);
      if (b.t % 20 === 0) sfx('swoosh');
      if (b.t >= (b.pr ? B.suckFramesRage : B.suckFrames)) { b.suckOn = false; bossSet('kSpit'); sfx('warn'); }
      break;
    case 'kSpit': { // hose raised (telegraph), ghost-bullet fan with a gap on Umine, then her swallowed shots one by one (jump them)
      b.pose = 'spit'; b.fi = 5;
      const m = finalMouth(b);
      if (b.t === B.spitWind) {
        const n = b.pr ? B.spitCountRage : B.spitCount, a0 = Math.atan2((P.y + P.h / 2) - m.y, pcx - m.x), d = Math.max(30, Math.hypot(pcx - m.x, P.y + P.h / 2 - m.y));
        const gapHalf = Math.max(B.spitSpread, Math.atan2(P.h / 2 + 10, d) + 0.02);
        const half = (n / 2) | 0;
        for (let i = 0; i < half; i++) for (const sg of [-1, 1]) {
          const a = a0 + sg * (gapHalf + i * B.spitSpread);
          spawnBullet(m.x - 4, m.y - 4, Math.cos(a) * B.spitSpeed, Math.sin(a) * B.spitSpeed, 36, B.spitDamage);
        }
        sfx('bshoot'); shake(4, 1);
      }
      const back = Math.min(B.spitBackMax, FINAL.swallowed), t2 = b.t - B.spitWind - 30;
      if (t2 >= 0 && t2 % 22 === 0 && t2 / 22 < back) { // returned shot: low, aimed along the floor at Umine's side
        const q = spawnBullet(m.x - 3, FLOOR_Y - 12, b.face * B.spitBackSpeed, 0, 37, B.spitDamage); if (q) sfx('shot');
      }
      if (b.t >= B.spitWind + 30 + back * 22 + 20) { FINAL.swallowed = 0; kanataNext(b, B, true); }
      break; }
    case 'kGhosts': { // ghost fireballs rise over floor marks, hover, then dive one after another
      b.pose = 'levitate'; bossFacePlayer();
      const n = rage ? B.ghostCountRage : B.ghostCount;
      if (b.t === 10) {
        const base = Math.max(ROOM_L + 20, Math.min(ROOM_R - 20, pcx)); b.gMarks = [];
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * 44 + (n % 2 ? 0 : 0), tx = Math.max(ROOM_L + 12, Math.min(ROOM_R - 12, base + off));
          const q = spawnBullet(b.x + b.w / 2 - 4, b.y + 10, 0, 0, 38, B.ghostDamage);
          if (q) { q.tx = tx; q.sx = q.x; q.sy = q.y; q.delay = B.ghostHover + i * 14; q.hook = ghostFireHook; }
          b.gMarks.push({ x: tx, t: B.ghostHover + i * 14 + 30 + 62 });
        }
        sfx('swoosh');
      }
      if (b.gMarks) for (const mk of b.gMarks) mk.t--;
      if (b.t >= 10 + B.ghostHover + n * 14 + 70) { b.gMarks = null; kanataNext(b, B); }
      break; }
    case 'kGlide': { // floats up and over Umine to the other side (high enough to stand under)
      b.pose = 'float'; const D = 76, k = Math.min(1, b.t / D), e = k * k * (3 - 2 * k);
      b.x = b.gx0 + (b.gx1 - b.gx0) * e; b.y = (FLOOR_Y - b.h - B.floatGap) - Math.sin(k * Math.PI) * 74;
      b.face = b.gx1 > b.gx0 ? 1 : -1;
      if (rage && b.t === 38) { const q = spawnBullet(b.x + b.w / 2 - 4, b.y + b.h, 0, 1.6, 36, B.ghostDamage); if (q) sfx('bshoot'); }
      if (b.t >= D) { b.y = FLOOR_Y - b.h - B.floatGap; bossFacePlayer(); kanataNext(b, B); }
      break; }
    default: bossSet('hover');
  }
}
function ghostFireHook(q) {
  if (q.t < 30) { const k = q.t / 30, e = 1 - Math.pow(1 - k, 2); q.x = q.sx + (q.tx - 4.5 - q.sx) * e; q.y = q.sy + (46 - q.sy) * e; return false; }
  if (q.t < 30 + q.delay) { q.vx = 0; q.vy = 0; q.y = 46 + Math.sin(q.t * 0.2) * 2; if (q.t % 6 === 0) spawnPart(q.x + 4, q.y + 4, 0, -0.3, 12, 4, '#9fd0ff'); return false; }
  if (q.t === 30 + q.delay) sfx('swoosh');
  q.vy = Math.min(q.vy + 0.25, bossCfg().ghostSpeed || 3);
  if (q.y + q.h >= FLOOR_Y) { q.active = false; for (let i = 0; i < 5; i++) spawnPart(q.x + 4, FLOOR_Y - 2, (i - 2) * 0.6, -1 - (i & 1) * 0.5, 16, 0, '#9fd0ff'); sfx('land'); return true; }
  return false;
}
// ---------------------------------------------------------------------
//  暴走ミミック form 2 (+ Kanata's ghost)
// ---------------------------------------------------------------------
const MIMIC_OPTS = ['charge', 'bigsuck', 'leap', 'charge', 'bigsuck', 'leap'];
function mimicNext(b, B, after) {
  b.combo = !after && Math.random() < (bossRage() ? B.comboChanceRage : B.comboChance);
  if (b.combo) { mimicChoose(b, B); return; }
  bossSet('hover'); b.wait = bossRage() ? B.idleFramesRage : B.idleFrames;
}
function mimicChoose(b, B) {
  const p = pickPattern(MIMIC_OPTS); bossFacePlayer();
  if (p === 'charge') { bossSet('mChargeWind'); sfx('warn'); }
  else if (p === 'bigsuck') { bossSet('mSuckWarn'); sfx('warn'); }
  else { bossSet('mLeapWind'); b.leapX = Math.max(ROOM_L + 4, Math.min(ROOM_R - 4 - b.w, P.x + P.w / 2 - b.w / 2)); }
}
function aiMimic(b, B, pcx, pcy) {
  const rage = bossRage();
  if (b.state !== 'mLeap') bossFall(b);
  finalGhostUpdate(b, B);
  switch (b.state) {
    case 'hover':
      b.fi = ((frame >> 4) & 1) ? 6 : 0; bossFacePlayer(); b.suckOn = false;
      if (b.wait === undefined) b.wait = B.idleFrames;
      if (b.t >= b.wait) mimicChoose(b, B);
      break;
    case 'mChargeWind': // shakes, red eye flashes, dust: then lunges along the floor (jump over it)
      b.fi = 0; b.hopY = (b.t & 2) ? -1 : 0; bossFacePlayer();
      if (b.t % 5 === 0) bossDust(b, 2);
      if (b.t >= (b.pr ? B.chargeWindRage : B.chargeWind)) { bossSet('mCharge'); b.vx = b.face * (b.pr ? B.chargeSpeedRage : B.chargeSpeed); sfx('swoosh'); }
      break;
    case 'mCharge':
      b.fi = 1; b.hopY = -Math.abs(Math.sin(b.t * 0.35)) * 3; b.x += b.vx;
      if (b.t % 4 === 0) bossDust(b, 1);
      if (b.x <= ROOM_L || b.x + b.w >= ROOM_R) { b.x = Math.max(ROOM_L, Math.min(ROOM_R - b.w, b.x)); b.vx = 0; b.hopY = 0; shake(10, 2); sfx('land'); bossDust(b, 6); bossSet('mBonk'); }
      break;
    case 'mBonk':
      b.fi = 4; if (b.t >= (b.pr ? B.recoverRage : B.recover) + 6) { bossFacePlayer(); mimicNext(b, B); }
      break;
    case 'mSuckWarn':
      b.fi = 2; bossFacePlayer();
      if (b.t % 3 === 0) { const m = finalMouth(b), h = hash(b.t, 5); spawnPart(m.x + b.face * (20 + (h % 50)), m.y - 14 + ((h >> 6) % 28), -b.face, 0, 16, 4, '#bfe8ff'); }
      if (b.t >= B.suckWarn) { bossSet('mSuck'); b.suckOn = true; FINAL.swallowed = 0; sfx('swoosh'); }
      break;
    case 'mSuck':
      b.fi = 2; b.suckOn = true; finalSuction(b, B.suckPull, B.suckPullAir, B.suckRange, B.suckBite);
      if (b.t % 20 === 0) sfx('swoosh');
      if (b.t >= B.suckFrames + (rage ? 20 : 0)) { b.suckOn = false; bossSet('mSpit'); }
      break;
    case 'mSpit': { // debris arcs onto marked floor spots + the swallowed shots come back along the floor
      b.fi = 3; const m = finalMouth(b);
      if (b.t === 14) {
        const n = b.pr ? B.spitCountRage : B.spitCount; b.gMarks = [];
        for (let i = 0; i < n; i++) {
          const tx = Math.max(ROOM_L + 10, Math.min(ROOM_R - 10, m.x + b.face * (34 + i * 46 + ((b.t * 7 + i * 13) % 9)))), T = 46 + i * 4, gg = 0.16;
          const vx = (tx - m.x) / T, vy = ((FLOOR_Y - 6) - m.y - 0.5 * gg * T * T) / T;
          const q = spawnBullet(m.x - 5, m.y - 5, vx, vy, 39, B.spitDamage);
          if (q) { q.g = gg; const it = KANATA_ITEMS[(i * 3 + b.t) % 5]; q.icon = it[0]; q.iconF = it[1]; q.spin = 0.25; }
          b.gMarks.push({ x: tx, t: T + 2 });
        }
        sfx('bshoot'); shake(5, 1);
      }
      if (b.gMarks) for (const mk of b.gMarks) mk.t--;
      const back = Math.min(6, FINAL.swallowed), t2 = b.t - 70;
      if (t2 >= 0 && t2 % 22 === 0 && t2 / 22 < back) spawnBullet(m.x - 3, FLOOR_Y - 12, b.face * 2.6, 0, 37, B.spitDamage);
      if (b.t >= 70 + back * 22 + 24) { b.gMarks = null; FINAL.swallowed = 0; mimicNext(b, B, true); }
      break; }
    case 'mLeapWind':
      b.fi = 0; b.hopY = b.t > 12 ? 2 : 0; bossFacePlayer();
      if (b.t < 20) b.leapX = Math.max(ROOM_L + 4, Math.min(ROOM_R - 4 - b.w, P.x + P.w / 2 - b.w / 2)); // marker tracks, then locks
      if (b.t >= B.leapWind) { bossSet('mLeap'); b.hopY = 0; b.lx0 = b.x; b.ly0 = b.y; sfx('jump'); }
      break;
    case 'mLeap': {
      b.fi = 1; const k = Math.min(1, b.t / B.leapAir);
      b.x = b.lx0 + (b.leapX - b.lx0) * k; b.y = b.ly0 - Math.sin(k * Math.PI) * 90;
      if (k >= 1) {
        b.y = FLOOR_Y - b.h; b.onGround = true; shake(12, 3); sfx('boom'); bossDust(b, 8);
        for (const d of [-1, 1]) spawnBullet(b.x + b.w / 2 - 4 + d * 14, FLOOR_Y - 11, d * B.waveSpeed, 0, 4, B.waveDamage);
        bossSet('mLand');
      }
      break; }
    case 'mLand':
      b.fi = 4; if (b.t >= (b.pr ? B.recoverRage : B.recover)) { bossFacePlayer(); mimicNext(b, B); }
      break;
    default: bossSet('hover');
  }
}
function finalGhostUpdate(b, B) { // Kanata's ghost floats behind the mimic and throws an object now and then
  const G = FINAL.ghost; if (!G.show) return;
  G.t++; const tx = b.x + b.w / 2 - b.face * 40, ty = FLOOR_Y - 92 + Math.sin(G.t * 0.05) * 6;
  G.x += (Math.max(ROOM_L + 14, Math.min(ROOM_R - 14, tx)) - G.x) * 0.03; G.y += (ty - G.y) * 0.05;
  G.face = P.x + P.w / 2 < G.x ? -1 : 1;
  if (state !== 'play' || b.state === 'rescue') return;
  G.throwT++;
  const every = bossRage() ? B.ghostEveryRage : B.ghostEvery;
  if (G.throwT >= every && b.state !== 'mLeap') {
    const ox = G.x + G.face * 11, oy = G.y - 16 + 16; // orb spawn (27,16) of the 32x32 frame (feet ~y30)
    const dx = P.x + P.w / 2 - ox, dy = P.y + P.h / 2 - oy, d = Math.hypot(dx, dy) || 1;
    const it = KANATA_ITEMS[(G.t >> 3) % KANATA_ITEMS.length];
    const q = spawnBullet(ox - 5, oy - 5, dx / d * B.ghostSpeed, dy / d * B.ghostSpeed, 35, B.ghostDamage);
    if (q) { q.icon = it[0]; q.iconF = it[1]; q.spin = 0.2; } sfx('bshoot'); G.throwT = 0;
  }
}
// ---------------------------------------------------------------------
//  CLIMAX: friends' cut-ins, then 海音 awakens (覚醒) and parts the sea herself (海割り)
// ---------------------------------------------------------------------
const CLIMAX_FRIENDS = [
  { id: 'tobiume', name: '飛梅', color: '#ff8cc0', face: 'face_tobiume', line: '海音ちゃん、いっくよー！ 飛梅ちゃんキック！' },
  { id: 'neenia', name: 'ネーニア', color: '#8fb0ff', face: 'face_neenia', line: '星降る矢雨…受けなさい。' },
  { id: 'seiten', name: '青天', color: '#ff8098', face: 'face_seiten', line: 'みんなを守る歌、届けっ！' },
  { id: 'astarte', name: 'アスターテ', color: '#b0b8ff', face: 'face_astarte', line: '月影の一閃。…道は、照らす。' },
  { id: 'star', name: 'スターさん', color: '#71d9ff', face: 'face_star', line: '錬金モーフスラッシュ！ いくぜ！' },
  { id: 'lily', name: 'リリィ', color: '#ffd2ef', face: 'face_lily', line: 'ウミミといっしょに、スターライトレイン♪' },
  { id: 'shiranui', name: 'シラヌイ', color: '#ff8a7a', face: 'face_shiranui', line: '狐火の舞じゃ。とくと見よ！' },
  { id: 'diceroll', name: 'ダイスロール', color: '#ff6a7a', face: 'face_diceroll', line: '…運命のダイス。ほら、出目は最高だ。' },
];
const CLIMAX_STEP = 40, CLIMAX_UMINE = CLIMAX_FRIENDS.length * CLIMAX_STEP, CLIMAX_SLAM = CLIMAX_UMINE + 250, CLIMAX_END = CLIMAX_UMINE + 330;
function startClimax() {
  for (const q of bullets) q.active = false; for (const s of shots) s.active = false;
  boss.suckOn = false; boss.hopY = 0; boss.state = 'climaxHold'; boss.t = 0; boss.flash = 0; boss.gMarks = null; P.inv = 9999; P.vx = 0; FINAL.line = null;
  if (boss.y + boss.h < FLOOR_Y) boss.y = FLOOR_Y - boss.h;
  FINAL.climaxT = 0; FINAL.flash = 0; FINAL.skippable = progress.seen && progress.seen.includes('climax');
  setState('climax'); sfx('warn');
}
function updateClimax() {
  const t = ++FINAL.climaxT, b = boss;
  // Umine settles on the floor and watches
  P.vy = Math.min(P.vy + CONFIG.gravity, CONFIG.maxFall); moveY(P); P.vx = 0; P.face = (b.x + b.w / 2 > P.x + P.w / 2) ? 1 : -1; P.hurt = 0;
  if (FINAL.flash > 0) FINAL.flash--;
  if (b.flash > 0) b.flash--;
  b.fi = (frame >> 4) & 1 ? 6 : 0;
  if (FINAL.skippable && inp.startPressed && t > 20 && t < CLIMAX_SLAM) { FINAL.climaxT = CLIMAX_SLAM; return; }
  if (t < CLIMAX_UMINE) {
    const i = (t / CLIMAX_STEP) | 0, lt = t % CLIMAX_STEP;
    if (lt === 0) sfx('cp');
    if (lt === 22) { b.flash = 10; b.hp = Math.max(2, b.hp - 1); b.hpShown = b.hp; sfx('bhit'); shake(6, 2); climaxHitFx(i); }
    if (lt > 22) b.fi = 4;
  } else {
    const o = t - CLIMAX_UMINE;
    // 海音 awakens (覚醒) and gathers the sea's power, then parts the sea herself (海割り)
    if (o === 1) sfx('rescue');
    if (o >= 60 && o < 150 && o % 10 === 0) sfx('cursor');
    if (o >= 60 && o < 150 && o % 3 === 0) { const h = hash(t, 29), a = (h % 628) / 100, r = 26 + (h >> 10) % 10, sx = P.x + P.w / 2, sy = P.y + 8;
      spawnPart(sx + Math.cos(a) * r, sy + Math.sin(a) * r, -Math.cos(a) * r / 16, -Math.sin(a) * r / 16, 16, 5, (h >> 4) & 1 ? '#c8f6ff' : '#5ac8ff'); }
    if (o === 150) { FINAL.flash = 12; sfx('clear'); shake(10, 2); }
    if (o >= 170 && o < 250 && o % 12 === 0) sfx('swoosh');
    if (o >= 172 && o < 250) b.fi = 4;
    if (t === CLIMAX_SLAM) { FINAL.flash = 20; shake(24, 4); sfx('boom'); b.hp = 0; b.hpShown = 0; }
    if (t >= CLIMAX_SLAM) b.fi = 5;
    if (t > CLIMAX_SLAM && t < CLIMAX_SLAM + 50 && t % 3 === 0) { const h = hash(t, 17); spawnPart(b.x + (h % 60) - 10, FLOOR_Y - 4 - ((h >> 8) % 40), ((h >> 4) & 7) * 0.3 - 1, -1.5 - ((h >> 7) & 3) * 0.4, 30, 5, (h >> 3) & 1 ? '#c8f0ff' : '#ffffff'); }
    if (t >= CLIMAX_END) {
      if (!progress.seen.includes('climax')) { progress.seen.push('climax'); saveProgress(); }
      startFinale();
    }
  }
}
function climaxHitFx(i) {
  const b = boss, cx = b.x + b.w / 2, cy = b.y + b.h / 2, cols = ['#ff8cc0', '#b8d0ff', '#ffd84a', '#e0e0ff', '#72eaff', '#fff1cf', '#ffb070', '#ffe080'];
  for (let k = 0; k < 10; k++) spawnPart(cx, cy, DIR8X[k & 7] * (1 + (k >> 3)), DIR8Y[k & 7] * (1 + (k >> 3)), 24, k & 1 ? 0 : 5, k & 1 ? '#ffffff' : cols[i]);
}
// ---------------------------------------------------------------------
//  FINALE: everyone calm again, a short talk, then the ending
// ---------------------------------------------------------------------
const FINALE_LINES = [
  [KANATA_SPEAKER, '……ふぁ。負けちゃった。でも、ミミック使いは私だけじゃないよ……あと12人いるから。……ま、今日はいっか。'],
  [KANATA_SPEAKER, 'この子（掃除機のミミック）、いつもおなかぺこぺこで…。みんなの元気、ちょっとずつ吸わせてたら、止まらなくなっちゃって。…ごめんね。'],
  [UMINE_SPEAKER, 'ううん、もう大丈夫！ みんな元に戻ったし、カナタさんもミミックさんも無事で…ほんとによかった！'],
  [UMINE_SPEAKER, 'カナタさんも、いっしょに遊ぼう！ みんなで、ね？'],
  [KANATA_SPEAKER, '…めんどくさいけど。…うん。たまには、いいかも。'],
  [UMINE_SPEAKER, 'それじゃあ…みんなでパーティーしよう！ ごちそうも、カラオケもあるよ♪'],
];
function startFinale() {
  markCleared(curArea);
  FINAL.finaleI = 0; FINAL.finaleT = 0; FINAL.ghost.show = false; FINAL.body = null; boss.dark = false; boss.hp = 0; boss.hpShown = 0;
  boss.state = 'calm'; boss.fi = 0; boss.y = FLOOR_Y - boss.h; boss.hopY = 0;
  // calm line-up: mimic, Kanata | Umine
  boss.x = ROOM_L + 62 - boss.w / 2; boss.face = 1; FINAL.kanataX = ROOM_L + 104;
  P.x = ROOM_L + 146 - P.w / 2; P.vx = 0; P.face = -1;
  FINAL.flash = 14;
  for (let i = 0; i < 12; i++) spawnPart(FINAL.kanataX, FLOOR_Y - 16, DIR8X[i & 7] * 1.2, DIR8Y[i & 7] * 1.2, 30, 5, i & 1 ? '#c8e0ff' : '#ffffff');
  setState('finale');
}
function updateFinale() {
  FINAL.finaleT++; if (FINAL.flash > 0) FINAL.flash--;
  P.vy = Math.min(P.vy + CONFIG.gravity, CONFIG.maxFall); moveY(P); P.vx = 0; P.inv = 9999;
  P.face = (FINAL.kanataX > P.x + P.w / 2) ? 1 : -1;
  boss.fi = (frame >> 5) & 1 ? 6 : 0;
  if (FINAL.finaleT < 40) return;
  const lt = FINAL.finaleT - 40;
  if ((inp.startPressed && lt > 20) || lt > 420) {
    FINAL.finaleI++; FINAL.finaleT = 40; sfx('cursor');
    if (FINAL.finaleI >= FINALE_LINES.length) { if (typeof startEnding === 'function') startEnding(); else setState('theEnd'); }
  }
}
function updateFinalState() {
  if (state === 'climax') updateClimax();
  else if (state === 'finale') updateFinale();
  else if (state === 'theEnd') { if (inp.startPressed && stateT > 60) { resetStage(false); setState('title'); } }
  else if (state === 'ending' && typeof updateEnding === 'function') updateEnding();
}

// =====================================================================
//  Drawing (final area)
// =====================================================================
function finalIcon(sheet, f, x, y, rot, scale) {
  const S = SHEETS[sheet]; g.save(); g.translate(Math.round(x), Math.round(y)); if (rot) g.rotate(rot); if (scale && scale !== 1) g.scale(scale, scale);
  if (S && S[f]) g.drawImage(S[f].r, -12, -12); else { g.fillStyle = '#c8b090'; g.fillRect(-5, -5, 10, 10); g.fillStyle = '#6a5040'; g.fillRect(-5, 4, 10, 1); }
  g.restore();
}
function drawFinalBullet(q, camX) {
  const cx = q.x + q.w / 2 - camX, cy = q.y + q.h / 2;
  if (q.kind === 35 || q.kind === 39) { finalIcon(q.icon || 'kanataBullets', q.iconF === undefined ? 3 : q.iconF, cx, cy, q.t * (q.spin || 0.2), 1); return; }
  const S = SHEETS.kanataBullets;
  if (q.kind === 36) { // ghost bullet (cell 0/1, centre 16,12) along its velocity
    g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(Math.atan2(q.vy, q.vx || 0.0001));
    if (S) g.drawImage(S[(q.t >> 3) & 1].r, -16, -12); else { g.fillStyle = '#8ab8ff'; g.fillRect(-4, -4, 8, 8); g.fillStyle = '#ffffff'; g.fillRect(-1, -2, 3, 3); }
    g.restore(); return;
  }
  if (q.kind === 38) { // ghost fireball (cell 2, centre 17,13); points down while diving
    g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(q.vy > 0.5 ? Math.PI / 2 : -Math.PI / 2 + Math.sin(q.t * 0.2) * 0.2);
    if (S) g.drawImage(S[2].r, -17, -13); else { g.fillStyle = '#6ab0ff'; g.fillRect(-5, -5, 10, 10); }
    g.restore(); return;
  }
  if (q.kind === 37) { // Umine's swallowed shot, spat back: her water shot tinted ghost blue
    const x = Math.round(cx), y = Math.round(cy), d = q.vx >= 0 ? 1 : -1;
    g.fillStyle = '#2a2a6a'; g.fillRect(x - 5, y - 3, 10, 6);
    g.fillStyle = (frame & 4) ? '#7ab0ff' : '#a8d8ff'; g.fillRect(x - 4, y - 2, 8, 4);
    g.fillStyle = '#ffffff'; g.fillRect(x + d * 2 - 1, y - 1, 2, 2);
    g.fillStyle = '#5a6ac8'; g.fillRect(x - d * 7 - 1, y - 1, 3, 2);
  }
}
function drawFinalMarks(camX, list, col) {
  if (!list) return;
  for (const mk of list) {
    if (mk.t <= 0) continue;
    const x = Math.round(mk.x - camX), blink = (frame >> 2) & 1, w = mk.t < 20 ? 7 : 5;
    g.fillStyle = blink ? col : '#ffffff'; g.fillRect(x - w, FLOOR_Y - 2, w * 2 + 1, 2);
    g.fillRect(x, FLOOR_Y - 6, 1, 3);
  }
}
function drawKanataGhost(camX) {
  const G = FINAL.ghost; if (!G.show) return;
  const S = SHEETS.kanataGhost, throwing = (bossCfg() && G.throwT > (bossRage() ? CONFIG.bosses.mimic.ghostEveryRage : CONFIG.bosses.mimic.ghostEvery) - 15);
  const fi = throwing ? 2 : (frame >> 4) & 1, x = Math.round(G.x - camX), y = Math.round(G.y + Math.sin(frame * 0.07) * 2);
  g.globalAlpha = 0.68;
  if (S) g.drawImage(pick(S[fi], G.face, false), x - (G.face >= 0 ? 16 : 16), y - 30);
  else { g.fillStyle = '#c8e0ff'; g.fillRect(x - 6, y - 24, 12, 18); }
  g.globalAlpha = 1;
  if (throwing && (frame & 4)) { g.fillStyle = '#c8e0ff'; g.fillRect(x + G.face * 11 - 1, y - 15, 3, 3); }
}
function drawSuctionWind(b, camX) {
  const W = SHEETS.kanataWind, m = finalMouth(b), mx = Math.round(m.x - camX), my = Math.round(m.y), R = curArea.boss === 'mimic' ? 4 : 3;
  for (let i = 0; i < R; i++) {
    const fi = ((frame >> 2) + i) % 3, off = i * 40 - ((frame * 2) % 40) + 40;
    g.globalAlpha = Math.max(0.2, 0.85 - i * 0.2);
    if (W) { if (b.face >= 0) g.drawImage(W[fi].r, mx - 4 + off * 0.0 + i * 40, my - 12); else g.drawImage(W[fi].l, mx - 43 - i * 40, my - 12); }
    else { g.fillStyle = '#bfe8ff'; g.fillRect(mx + b.face * (8 + off), my - 1, 12 * b.face, 2); }
  }
  g.globalAlpha = 1;
}
// Kanata / mimic body + levitated objects + suction wind + marks
function drawFinalBoss(camX) {
  const b = boss, isM = curArea.boss === 'mimic' || b.state === 'calm';
  // collapsed body of Kanata fading out while the mimic rampages
  if (FINAL.body && state !== 'finale') {
    FINAL.body.t++; const a = Math.max(0, 1 - FINAL.body.t / 90);
    if (a > 0 && SHEETS.kanataBoss) { g.globalAlpha = a; g.drawImage(pick(SHEETS.kanataBoss[7], FINAL.body.face, false), Math.round(FINAL.body.x - camX - 32), FLOOR_Y - 64); g.globalAlpha = 1; }
  }
  drawFinalMarks(camX, b.gMarks, isM ? '#ffb040' : '#9fd0ff');
  if (b.hidden || b.alpha <= 0) return;
  const key = isM ? 'mimicRampage' : 'kanataBoss', sh = SHEETS[key], D = SHEET_DEFS[key];
  let fi;
  if (isM) fi = b.state === 'rescue' ? 5 : (b.fi | 0);
  else {
    const st = b.state;
    fi = st === 'rescue' ? (b.t < 50 ? 6 : 7) : st === 'kLev' || st === 'kGhosts' ? 3 : st === 'kSuck' || st === 'kSuckWarn' ? 4 : st === 'kSpit' ? 5 : st === 'kGlide' ? 8 : st === 'enter' ? 8 : ((frame % 150) > 140 ? 1 : 0);
    if (b.flash > 6 && st !== 'rescue' && st !== 'kSuck' && st !== 'kSpit') fi = 6;
  }
  if (isM && b.flash > 6 && fi !== 5 && state === 'play') fi = 4;
  b.fi = fi;
  let white = b.flash > 0 && (b.flash & 2) && b.state !== 'calm';
  if (!isM && b.state === 'rescue' && b.t < 40) white = (b.t & 4) !== 0;
  if (isM && b.state === 'mChargeWind' && (b.t & 4)) white = true;
  const mx = Math.round(b.x + b.w / 2 - camX), by = Math.round(b.y + b.h + b.hopY);
  if (b.suckOn || b.state === 'kSuckWarn' || b.state === 'mSuckWarn') { if (b.suckOn) drawSuctionWind(b, camX); }
  if (sh) fi = Math.max(0, Math.min(sh.length - 1, fi | 0));
  if (sh) g.drawImage(pick(sh[fi], b.face, white), mx - (b.face >= 0 ? D.cx : D.fw - D.cx), by - D.fh);
  else { g.fillStyle = isM ? '#202030' : '#e0e0f0'; g.fillRect(mx - b.w / 2, by - b.h, b.w, b.h); }
  if (isM && b.state === 'mChargeWind') { // red eye / exclamation
    if ((b.t >> 2) & 1) { g.fillStyle = '#ff3040'; g.fillRect(mx + b.face * 14 - 1, by - 30, 3, 2); }
    drawText('!', mx, by - 50, 'r', 2, 'c');
  }
  if (isM && b.state === 'mLeapWind') { const x = Math.round(b.leapX + b.w / 2 - camX); g.fillStyle = (frame & 4) ? '#ffb040' : '#ffffff'; g.fillRect(x - 16, FLOOR_Y - 2, 33, 2); g.fillRect(x - 1, FLOOR_Y - 8, 3, 4); }
  if (isM && b.state === 'mLeap') { const x = Math.round(b.leapX + b.w / 2 - camX); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - 14, FLOOR_Y - 3, 29, 3); }
  // levitated objects + aim line on the next throw
  if (b.objs) for (let i = 0; i < b.objs.length; i++) {
    const o = b.objs[i]; if (o.thrown) continue;
    const ox = o.x - camX, glow = (frame >> 2) & 1;
    g.fillStyle = glow ? 'rgba(150,200,255,0.45)' : 'rgba(150,200,255,0.25)'; g.fillRect(Math.round(ox) - 8, Math.round(o.y) - 8, 16, 16);
    finalIcon(o.sheet, o.f, ox + (i === b.objI && o.lock ? ((frame & 2) ? 1 : -1) : 0), o.y, o.rot, 1);
    if (i === b.objI && b.t > (b.pr ? CONFIG.bosses.kanata.levWindRage : CONFIG.bosses.kanata.levWind) - 6) {
      const dx = o.aimX - o.x, dy = o.aimY - o.y, len = Math.hypot(dx, dy) || 1, n = Math.min(40, Math.floor(len / 6));
      g.fillStyle = o.lock ? ((frame & 2) ? '#ff5a8a' : '#ffffff') : '#9fd0ff';
      for (let k = 2; k <= n; k++) g.fillRect(Math.round(o.x + dx / len * k * 6 - camX), Math.round(o.y + dy / len * k * 6), 1, 1);
    }
  }
}
// background: floating paintings (one motif per screen), drifting haunted debris
const FINAL_PAINTINGS = [];
function finalPainting(i) {
  if (FINAL_PAINTINGS[i]) return FINAL_PAINTINGS[i];
  const W = 44, H = 32, c = mkCanvas(W + 6, H + 6), p = c.getContext('2d'), F = (col, x, y, w, h) => { p.fillStyle = col; p.fillRect(x + 3, y + 3, w, h); };
  const skies = [['#2a1a4a', '#c85a5a', '#ffb070'], ['#06102a', '#12284a', '#24486a'], ['#140a26', '#3a1a4a', '#6a2a5a'], ['#0a0a2a', '#22205a', '#4a3a8a'],
    ['#1a0612', '#4a1028', '#a02a40'], ['#1a0e30', '#5a2d67', '#c06a9a'], ['#08061a', '#24123a', '#5a2440'], ['#1c0a34', '#4a1a5e', '#2a7a4a']];
  const s = skies[i]; F(s[0], 0, 0, W, 11); F(s[1], 0, 11, W, 11); F(s[2], 0, 22, W, 10);
  if (i === 0) { F('#ffd070', 26, 14, 8, 8); F('#ffe9b0', 28, 16, 4, 4); F('#4a2a5a', 0, 24, W, 8); F('#3a2048', 8, 22, 14, 3); }
  if (i === 1) { F('#e8f0ff', 6, 4, 7, 7); F('#06102a', 9, 4, 4, 4); for (let k = 0; k < 6; k++) { F('#0a2030', 4 + k * 7, 16 + (k & 1) * 3, 5, 16); F('#143246', 5 + k * 7, 14 + (k & 1) * 3, 3, 3); } }
  if (i === 2) { for (let k = 0; k < 7; k++) { const h = 10 + ((k * 37) % 14); F('#1a1028', k * 6 + 1, H - h, 5, h); F('#ffd46a', k * 6 + 2, H - h + 3, 1, 1); F('#ffd46a', k * 6 + 4, H - h + 6, 1, 1); } F('#ffe6a8', 34, 4, 4, 4); }
  if (i === 3) { for (let k = 0; k < 14; k++) F(k & 1 ? '#ffffff' : '#b0a8ff', (k * 13) % W, (k * 7) % 22, 1, 1); F('#8a7ae0', 0, 12, W, 2); F('#b4aee0', 16, 18, 12, 14); F('#f4f0ff', 20, 14, 4, 4); }
  if (i === 4) { F('#ff3a58', 28, 3, 10, 10); F('#ff8495', 30, 5, 4, 4); F('#1a0612', 6, 14, 22, 18); F('#1a0612', 8, 10, 4, 4); F('#1a0612', 20, 8, 4, 6); F('#ffb040', 14, 20, 2, 2); }
  if (i === 5) { F('#fff4dd', 30, 4, 8, 8); F('#2a1638', 4, 16, 36, 16); F('#2a1638', 10, 8, 3, 8); F('#2a1638', 20, 5, 4, 11); F('#2a1638', 31, 9, 3, 7); F('#ffd6ef', 21, 18, 2, 3); }
  if (i === 6) { F('#c8382c', 8, 10, 28, 3); F('#c8382c', 10, 15, 24, 2); F('#7a1a1a', 12, 12, 3, 20); F('#7a1a1a', 29, 12, 3, 20); F('#ffb070', 4, 22, 3, 3); F('#ffb070', 38, 20, 3, 3); F('#ffe0a0', 5, 23, 1, 1); }
  if (i === 7) { F('#5a3418', 10, 4, 24, 24); F('#1e7a4a', 12, 6, 20, 20); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; F(k & 1 ? '#d03030' : '#101010', 21 + Math.round(Math.cos(a) * 7), 15 + Math.round(Math.sin(a) * 7), 3, 3); } F('#f0c850', 21, 15, 3, 3); }
  // gilded frame
  p.fillStyle = '#6a4a1a'; p.fillRect(0, 0, W + 6, 3); p.fillRect(0, H + 3, W + 6, 3); p.fillRect(0, 0, 3, H + 6); p.fillRect(W + 3, 0, 3, H + 6);
  p.fillStyle = '#e8c060'; p.fillRect(1, 1, W + 4, 1); p.fillRect(1, 1, 1, H + 4); p.fillStyle = '#a07a2a'; p.fillRect(1, H + 4, W + 4, 1); p.fillRect(W + 4, 1, 1, H + 4);
  FINAL_PAINTINGS[i] = c; return c;
}
function drawFinalBackdrop(camX) {
  const K = 0.7;
  for (let i = 0; i < 8; i++) {
    const sx = i * 256 * K + 120 - camX * K; if (sx < -70 || sx > VW + 20) continue;
    const bob = Math.sin(frame * 0.03 + i * 1.7) * 4, rot = Math.sin(frame * 0.02 + i) * 0.06;
    g.save(); g.translate(Math.round(sx + 25), Math.round(58 + (i % 3) * 12 + bob)); g.rotate(rot);
    g.globalAlpha = 0.25; g.fillStyle = '#9fd0ff'; g.fillRect(-27, -21, 54, 42); g.globalAlpha = 1;
    g.drawImage(finalPainting(i), -25, -19); g.restore();
  }
  // drifting debris + chairs (poltergeist), behind the tiles
  const S = SHEETS.kanataBullets;
  for (let k = 0; k < 10; k++) {
    const h = hash(k, 91), px = ((h % 900) + k * 37) - camX * 0.85, wx = ((px % 900) + 900) % 900 - 60; if (wx < -20 || wx > VW + 20) continue;
    const y = 40 + ((h >> 10) % 110) + Math.sin(frame * 0.04 + k) * 5, f = 3 + (k % 5);
    g.globalAlpha = 0.55;
    if (k % 4 === 3) { // floating chair
      g.save(); g.translate(Math.round(wx), Math.round(y)); g.rotate(Math.sin(frame * 0.03 + k) * 0.25);
      g.fillStyle = '#4a2a1a'; g.fillRect(-5, -10, 2, 18); g.fillRect(3, -2, 2, 10); g.fillRect(-5, -2, 10, 2); g.fillStyle = '#7a4a2a'; g.fillRect(-5, -10, 2, 1); g.restore();
    } else if (S) { g.save(); g.translate(Math.round(wx), Math.round(y)); g.rotate(frame * 0.01 * ((k & 1) ? 1 : -1) + k); g.drawImage(S[f].r, -12, -12); g.restore(); }
    g.globalAlpha = 1;
  }
}
// ghost reskin for the flyers in the final area
function drawFinalGhostEnemy(e, camX, white) {
  const x = Math.round(e.x + e.w / 2 - camX), y = Math.round(e.y + e.h / 2 + Math.sin(e.t * 0.1) * 2), f = (e.t >> 3) & 1;
  g.globalAlpha = 0.85;
  g.fillStyle = white ? '#ffffff' : '#d8e8ff'; g.fillRect(x - 6, y - 7, 12, 11); g.fillRect(x - 5, y - 8, 10, 1);
  g.fillStyle = white ? '#ffffff' : '#a8c0f0'; for (let k = 0; k < 4; k++) g.fillRect(x - 6 + k * 3, y + 4, 2, ((k + f) & 1) ? 3 : 2);
  g.fillStyle = '#1a1a3a'; g.fillRect(x + (e.face > 0 ? -1 : -4), y - 4, 2, 3); g.fillRect(x + (e.face > 0 ? 3 : 0), y - 4, 2, 3);
  g.fillStyle = '#5a6ac8'; g.fillRect(x - 6, y - 7, 1, 11); g.fillRect(x + 5, y - 7, 1, 11);
  g.globalAlpha = 1;
}
// world-space layer after the particles (climax art)
function drawFinalWorld(camX) {
  if (state === 'climax') drawClimaxWorld(camX);
  if (state === 'finale') drawFinaleWorld(camX);
  if (curArea.boss === 'mimic' || state === 'climax') drawKanataGhost(camX);
  if (curArea.boss === 'darkumine') drawDarkUmineWorld(camX);
}
function drawFriendSprite(id, x, y, f, face, scale) {
  const map = { tobiume: ['tobiumeNormal', 13], neenia: ['neenia', 11], seiten: ['seiten', 14], astarte: ['astarte', 10], star: ['starNormal', 16], lily: ['lily', 16], shiranui: ['shiranui', 16], diceroll: ['diceroll', 16], umimi: ['umimi', 16], kanata: ['kanata', 16] };
  const m = map[id]; if (!m) return; const S = SHEETS[m[0]]; if (!S) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(x) - 5, Math.round(y) - 24, 10, 24); return; }
  const fr = S[Math.min(f, S.length - 1)], cx = face >= 0 ? m[1] : 32 - m[1];
  if (scale && scale !== 1) g.drawImage(face >= 0 ? fr.r : fr.l, Math.round(x - cx * scale), Math.round(y - 32 * scale), 32 * scale, 32 * scale);
  else g.drawImage(face >= 0 ? fr.r : fr.l, Math.round(x - cx), Math.round(y - 32));
}
function drawClimaxWorld(camX) {
  const t = FINAL.climaxT, b = boss, bx = b.x + b.w / 2 - camX, by = b.y + b.h / 2;
  if (t < CLIMAX_UMINE) {
    const i = (t / CLIMAX_STEP) | 0, lt = t % CLIMAX_STEP, F = CLIMAX_FRIENDS[i];
    const side = (i & 1) ? 1 : -1, fx = Math.max(10, Math.min(VW - 10, bx + side * 58)), fy = FLOOR_Y;
    const pop = Math.min(1, lt / 6), air = F.id === 'tobiume' || F.id === 'astarte' || F.id === 'shiranui' || F.id === 'star';
    const yy = air ? fy - 34 + Math.sin(frame * 0.1) * 2 : fy, face = side > 0 ? -1 : 1;
    // light pillar where the friend appears
    g.globalAlpha = 0.25 * (1 - lt / CLIMAX_STEP); g.fillStyle = F.color; g.fillRect(Math.round(fx) - 10, 0, 20, FLOOR_Y); g.globalAlpha = 1;
    let f = (frame >> 4) & 1;
    if (F.id === 'tobiume') f = lt > 12 && lt < 26 ? 11 + ((lt >> 2) & 3) : 0;
    if (F.id === 'neenia') f = lt > 14 && lt < 26 ? 1 : 0;
    if (F.id === 'star') f = lt > 14 ? 6 : 0;
    if (F.id === 'shiranui') f = lt > 12 ? 5 : 0;
    if (F.id === 'diceroll') f = lt > 12 ? 4 : 0;
    let px = fx, py = yy;
    if (F.id === 'tobiume' && lt > 12 && lt < 24) { const k = (lt - 12) / 12; px = fx + (bx - fx) * k; py = yy + (by + 10 - yy) * k; }
    g.globalAlpha = pop; drawFriendSprite(F.id, px, py, f, face, 1); g.globalAlpha = 1;
    // move effect
    const k = Math.max(0, Math.min(1, (lt - 10) / 12));
    if (lt >= 10 && lt < 30) {
      if (F.id === 'neenia') { g.fillStyle = '#e8f0ff'; for (let a = 0; a < 7; a++) { const ax = bx - 24 + a * 8, ay = -10 + k * (by + 10) + (a % 3) * 6; g.fillRect(Math.round(ax), Math.round(ay), 1, 8); g.fillStyle = '#9fd8ff'; g.fillRect(Math.round(ax) - 1, Math.round(ay) + 7, 3, 2); g.fillStyle = '#e8f0ff'; } }
      if (F.id === 'seiten') { const cols = ['#ff6a8a', '#ffd84a', '#8fd0ff']; for (let a = 0; a < 5; a++) { const nx = fx + (bx - fx) * Math.min(1, k + a * 0.08), ny = yy - 20 + Math.sin(a + lt * 0.4) * 6; g.fillStyle = cols[a % 3]; g.fillRect(Math.round(nx), Math.round(ny), 3, 3); g.fillRect(Math.round(nx) + 2, Math.round(ny) - 6, 1, 6); } }
      if (F.id === 'astarte' || F.id === 'star') { // crescent / cyan slash across the mimic
        if (F.id === 'star' && SHEETS.starWeapon) { g.save(); g.translate(Math.round(bx), Math.round(by)); g.rotate(-0.6 + k * 1.2); g.drawImage(SHEETS.starWeapon[1].r, -32, -32, 64, 64); g.restore(); }
        else { g.strokeStyle = F.id === 'star' ? '#72eaff' : '#e8e0ff'; g.lineWidth = 3; g.beginPath(); g.arc(Math.round(bx), Math.round(by), 22, -1.2 + k * 0.6, 1.2 + k * 0.6); g.stroke(); g.lineWidth = 1; }
      }
      if (F.id === 'lily') { for (let a = 0; a < 8; a++) { const sx = bx - 30 + a * 9, sy = -10 + ((k * 1.2 + a * 0.13) % 1) * (by + 20); g.fillStyle = a & 1 ? '#fff1cf' : '#ffd2ef'; g.fillRect(Math.round(sx), Math.round(sy), 3, 3); g.fillRect(Math.round(sx) + 1, Math.round(sy) - 1, 1, 5); } drawFriendSprite('umimi', fx - side * 16, yy - 22, 2 + ((frame >> 3) & 1), face, 1); }
      if (F.id === 'shiranui' && typeof drawFoxfire === 'function') for (let a = 0; a < 3; a++) { const ang = a * 2.1 + lt * 0.3, r = 28 * (1 - k) + 6; drawFoxfire(bx + Math.cos(ang) * r, by + Math.sin(ang) * r * 0.6, -Math.sin(ang), Math.cos(ang), (frame >> 2) & 1, 1); }
      if (F.id === 'diceroll' && typeof drCell === 'function') for (let a = 0; a < 3; a++) drCell(a * 2, bx - 16 + a * 16, -10 + k * (by + 6) - a * 6, 1, lt * 0.4 + a, false);
    }
  } else {
    drawUmineAwaken(t - CLIMAX_UMINE, camX);
  }
}
// 海音 awakens (覚醒): spell sheet (umine_spell 48x48: 0 ready, 1-4 water gathers, 5 staff raised + magic circle),
// glowing aura and a power gauge, then she parts the sea herself (海割り).
function umineSpellFrame(o) { return o < 20 ? 0 : o < 60 ? 1 : o < 100 ? 2 : o < 125 ? 3 : o < 150 ? 4 : o < 300 ? 5 : 0; }
function drawUmineAwaken(o, camX) {
  const b = boss, bx = b.x + b.w / 2 - camX, ux = Math.round(P.x + P.w / 2 - camX), uy = Math.round(P.y + P.h);
  if (o < 40) { g.globalAlpha = 0.3 * (1 - o / 40); g.fillStyle = '#9ae6ff'; g.fillRect(ux - 12, 0, 24, FLOOR_Y); g.globalAlpha = 1; }
  // aura: pulsing glow + rising sparkles
  const k = Math.min(1, o / 150), pulse = Math.sin(frame * 0.25) * 2;
  if (o < 300) {
    g.globalAlpha = 0.18 + 0.22 * k; g.fillStyle = '#5ac8ff'; g.beginPath(); g.ellipse(ux, uy - 16, 14 + k * 8 + pulse, 20 + k * 8 + pulse, 0, 0, 6.283); g.fill();
    g.globalAlpha = 0.25 + 0.3 * k; g.fillStyle = '#c8f6ff'; g.beginPath(); g.ellipse(ux, uy - 16, 9 + k * 4, 15 + k * 4, 0, 0, 6.283); g.fill(); g.globalAlpha = 1;
    for (let a = 0; a < 6; a++) { const h = hash(a, 77), yy = uy - ((frame * (1 + (h & 1)) + h) % 44), xx = ux - 14 + (h >> 4) % 28; g.fillStyle = a & 1 ? '#ffffff' : '#9ae6ff'; g.fillRect(xx, yy, 1, 2); }
  }
  // power gauge
  if (o >= 60 && o < 175) {
    const q = Math.min(1, (o - 60) / 90), gx = ux - 20, gy = uy - 54;
    g.fillStyle = '#10142a'; g.fillRect(gx - 1, gy - 1, 42, 6); g.fillStyle = q >= 1 && (frame & 4) ? '#ffffff' : '#5ac8ff'; g.fillRect(gx, gy, Math.round(40 * q), 4);
  }
  // the sea parts: walls rise at both screen edges, then crash together on the mimic
  if (o >= 160) drawSeaWalls(o, bx);
  // her spell sprite, in front of the walls (the sea parts around her) (replaces the normal player sprite during the awakening)
  const S = SHEETS.umineSpell, f = umineSpellFrame(o), face = bx >= ux ? 1 : -1;
  if (S) { const fr = S[Math.min(f, S.length - 1)]; g.drawImage(face >= 0 ? fr.r : fr.l, ux - 24, uy - 46); }
  else { const K = SHEETS.kanon && sheetFrame('kanon', 'shoot', 0); if (K) g.drawImage(pick(K, face, false), ux - (face >= 0 ? 11 : 21), uy - 32); }
}
function drawSeaWall(x, top, fi, flip) { // x = face (inner edge) in screen px; top = crest top
  const S = SHEETS.seaSplit; if (!S) { g.fillStyle = '#2a6ac8'; g.fillRect(flip ? x : x - 45, top, 45, VH - top); return; }
  const left = flip ? x - (47 - 45) : x - 45; // left wall: face x=45 in the frame; right wall mirrored (face at 47-45=2)
  const img = (k) => flip ? S[k].l : S[k].r;
  g.drawImage(img(fi), left, top);
  for (let y = top + 95; y < VH; y += 32) { g.drawImage(img(4), 0, 0, 48, 32, left, y, 48, 32); }
  // foam on the tile seams
  for (let y = top + 95; y < VH; y += 32) {
    for (let k = 0; k < 6; k++) { const fx = flip ? x + 2 + k * 6 : x - 8 - k * 6, wob = Math.round(Math.sin((frame + k * 7 + y) * 0.3) * 1.5); g.fillStyle = k & 1 ? '#ffffff' : '#c8f0ff'; g.fillRect(fx, y - 1 + wob, 5, 2); }
  }
}
function drawSeaWalls(o, bx) {
  const rise = Math.min(1, (o - 160) / 70), h = 40 + rise * 150, top = Math.round(FLOOR_Y - h);
  const crest = rise < 0.35 ? 0 : rise < 0.7 ? 1 : 2 + ((frame >> 3) & 1);
  let lx = 44, rx = VW - 44; // faces of the walls
  if (o >= 250 - 0) {
    const k = Math.min(1, (o - 236) / 14), e = k * k;
    lx = 44 + (Math.max(44, bx - 4) - 44) * e; rx = VW - 44 - ((VW - 44) - Math.min(VW - 44, bx + 4)) * e;
  } else if (o >= 236) { const k = (o - 236) / 14, e = k * k; lx = 44 + (Math.max(44, bx - 4) - 44) * e; rx = VW - 44 - ((VW - 44) - Math.min(VW - 44, bx + 4)) * e; }
  const fade = o > 290 ? Math.max(0, 1 - (o - 290) / 40) : 1;
  g.globalAlpha = fade;
  const drop = o > 290 ? (o - 290) * 4 : 0;
  // fill behind the walls (the parted sea continues off-screen)
  const gr = g.createLinearGradient(0, top + 30 + drop, 0, VH); gr.addColorStop(0, '#3a7ad8'); gr.addColorStop(0.35, '#1e4aa8'); gr.addColorStop(1, '#0e2260');
  g.fillStyle = gr; const lw = Math.max(0, Math.round(lx) - 40), rw = Math.round(rx) + 40;
  g.fillRect(0, top + 30 + drop, lw, VH); g.fillRect(rw, top + 30 + drop, VW - rw, VH);
  g.fillStyle = 'rgba(200,240,255,0.35)';
  for (let k = 0; k < 10; k++) { const yy = top + 44 + drop + k * 17 + ((frame >> 1) + k * 5) % 9; if (lw > 0) g.fillRect((k * 23 + frame) % Math.max(1, lw), yy, 8, 1); if (rw < VW) g.fillRect(rw + (k * 31 + frame) % Math.max(1, VW - rw), yy, 8, 1); }
  drawSeaWall(Math.round(lx), top + drop, crest, false);
  drawSeaWall(Math.round(rx), top + drop, crest, true);
  g.globalAlpha = 1;
  // spray along the crests
  if (rise > 0.3 && o < 290) for (let k = 0; k < 4; k++) { const h2 = hash(frame + k, 13); g.fillStyle = '#ffffff'; g.fillRect(Math.round(lx) - 20 + (h2 % 24), top + 2 + ((h2 >> 6) % 10), 2, 2); g.fillRect(Math.round(rx) - 4 + ((h2 >> 3) % 24), top + 2 + ((h2 >> 9) % 10), 2, 2); }
}
function drawFinaleWorld(camX) {
  const kx = FINAL.kanataX - camX, t = FINAL.finaleT;
  const speaking = FINAL.finaleI < FINALE_LINES.length ? FINALE_LINES[FINAL.finaleI][0] : null;
  const kf = speaking === KANATA_SPEAKER ? ((t >> 5) & 1 ? 2 : 0) : ((frame % 160) > 150 ? 1 : 0);
  const kface = (P.x + P.w / 2 > FINAL.kanataX) ? 1 : -1;
  g.globalAlpha = Math.min(1, t / 30); drawFriendSprite('kanata', kx, FLOOR_Y, FINAL.finaleI >= 4 && FINAL.finaleI < 5 ? 3 : kf, kface, 1); g.globalAlpha = 1;
}
// pixel-level overlay before blit (rush label, flashes)
function drawFinalOverlay() {
  if (FINAL.phase === 'rush' && (state === 'play' || state === 'bossIntro') && boss.triggered) drawTextShadow('BOSS RUSH ' + (FINAL.rushIdx + 1) + '/8', VW / 2, 38, 'c', 1, 'c');
  if (state === 'climax') {
    const t = FINAL.climaxT, o = t - CLIMAX_UMINE;
    g.fillStyle = '#05060f'; g.fillRect(0, 0, VW, 10); g.fillRect(0, VH - 10, VW, 10); // letterbox
    if (o >= 150 && o < 172 && (frame & 4)) drawTextShadow('FULL POWER!', VW / 2, 72, 'y', 2, 'c');
    if (FINAL.skippable && t < CLIMAX_SLAM && (frame >> 5) & 1) drawText('TAP: SKIP', VW - 4, VH - 8, 'b', 1, 'r');
  }
  if (FINAL.flash > 0) { g.fillStyle = 'rgba(255,255,255,' + Math.min(0.9, FINAL.flash / 14) + ')'; g.fillRect(0, 0, VW, VH); }
  if (state === 'finale' && FINAL.finaleT > 40 && (frame >> 5) & 1) drawText('TAP', VW - 6, VH - 10, 'b', 1, 'r');
}
// hi-res overlay after blit (lines)
function drawFinalHi() {
  if (state === 'climax') {
    const t = FINAL.climaxT;
    if (t < CLIMAX_UMINE) { const i = (t / CLIMAX_STEP) | 0, lt = t % CLIMAX_STEP, F = CLIMAX_FRIENDS[i]; drawDialogue(F.name, F.color, F.line, Math.min(1, lt / 5), 14, F.face); }
    else {
      const o = t - CLIMAX_UMINE;
      if (o > 20 && o < 90) drawDialogue(UMINE_SPEAKER.name, UMINE_SPEAKER.color, 'みんな、ありがとう…！ あったかい力が、あふれてくる…！', Math.min(1, (o - 20) / 8), 14, UMINE_SPEAKER.face);
      else if (o >= 90 && o < 175) drawDialogue(UMINE_SPEAKER.name, UMINE_SPEAKER.color, 'みんなの想い、ぜんぶ乗せて…！ 海よ、割れてっ！', 1, 14, UMINE_SPEAKER.face);
      if (o >= 4 && o < 40) drawHiText('覚醒！', VW / 2, 40, 14, '#e8fbff', '#1a3a8a');
      if (o >= 172 && o < 250) drawHiText('海割り！', VW / 2, 40, 14, '#e8fbff', '#1a3a8a');
    }
    return;
  }
  if (state === 'finale' && FINAL.finaleT > 40 && FINAL.finaleI < FINALE_LINES.length) {
    const L = FINALE_LINES[FINAL.finaleI]; drawDialogue(L[0].name, L[0].color, L[1], Math.min(1, (FINAL.finaleT - 40) / 8), 30, L[0].face); return;
  }
  if ((!FINAL.line || FINAL.lineT <= 0) && FINAL.queue && FINAL.queue.length && (state === 'play' || state === 'bossIntro')) { const q = FINAL.queue.shift(); finalSay(q[0], q[1], q[2]); }
  if (FINAL.line && FINAL.lineT > 0 && (state === 'play' || state === 'bossIntro')) {
    FINAL.lineT--; drawDialogue(FINAL.line.sp.name, FINAL.line.sp.color, FINAL.line.text, Math.min(1, FINAL.lineT / 15), 30, FINAL.line.sp.face);
  }
}
function renderTheEnd() {
  g.fillStyle = '#05060f'; g.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 40; i++) { const h = hash(i, 5); g.fillStyle = (h >> 8) & 1 ? '#3a4270' : '#8a90c0'; g.fillRect(h % VW, (h >>> 9) % VH, 1, 1); }
  drawTextShadow('THE END', VW / 2, 90, 'y', 3, 'c');
  if (stateT > 60 && (frame >> 5) & 1) drawText('TAP TO RETURN TO TITLE', VW / 2, 200, 'b', 1, 'c');
  blit();
  drawHiText('…つづく？', VW / 2, 130, 10, '#c8d8ff', '#05060f');
}
