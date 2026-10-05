
// =====================================================================
//  AREA 8  宵闇のカジノ MIDNIGHT CASINO - boss DARK ダイスロール (DiceRoll: a downer girl with white hair and a small
//  crown, trapped inside a crowned dice-headed harlequin). Ground walker. Every attack starts from the wind-up pose
//  (sprite frame 4, hand raised) with its own telegraph:
//    fate       tosses a big die over her head; the face (1-6, drawn 2x with a label) decides the follow-up:
//               1-2 ROULETTE with N balls / 3-4 CARDS fan of N / 5-6 CHIPS rain on N-1 columns
//    dice       2 dice (enraged 3) hop once, then roll along the floor (jump them)
//    cards      card fan with a guaranteed gap on Umine's standing spot (dotted preview paths + green floor mark):
//               stay on the floor where the mark is (or walk away from her) and every card misses
//    boomerang  spinning cards fly out and come back, one at a time (the next only after she catches the last;
//               a height mark shows which): low (jump), high (stand), low [enraged: + high]
//    chips      marked columns (Umine's + others, a free lane is always next to her), then chip stacks drop
//    roulette   the ball circles her hand, then bounces around the room (limited bounces)
//    flame      (enraged) flaming die bounces toward Umine, each bounce leaves 2 embers rolling on the floor
//    allin      once, below half HP: "ALL IN!" announcement, then chips -> cards -> dice back to back
//  Tuning: CONFIG.bosses.diceroll. Art: assets/diceroll_dark.png (+ .json), diceroll_bullets.png (24x24 cells).
// =====================================================================
const DICEROLL_PATS = ['fate', 'dice', 'cards', 'boomerang', 'chips', 'roulette'];
const DR_STATE = { fate: 'drFate', dice: 'drDice', cards: 'drCards', boomerang: 'drBoom', chips: 'drChips', roulette: 'drRoulette', flame: 'drFlame' };
// sprite hand points (48x48 frame, cx 24, feet y 47)
function drHand(b, px, py) { return { x: b.x + b.w / 2 + b.face * (px - 24), y: b.y + b.h - 48 + py }; }
function drThrowPt(b) { return drHand(b, 39, 23); }
function drCardPt(b) { return drHand(b, 36, 23); }
function drWindPt(b) { return drHand(b, 10, 21); }
function dicerollPick(b) {
  const pool = bossRage() ? DICEROLL_PATS.concat(['flame']) : DICEROLL_PATS;
  const unseen = pool.filter(k => !b.seen.includes(k) && k !== b.last);
  return unseen.length && Math.random() < 0.6 ? pickPattern([unseen[(Math.random() * unseen.length) | 0]]) : pickPattern(pool);
}
function dicerollStart(b, pat) { bossFacePlayer(); sfx('warn'); bossSet(DR_STATE[pat]); }
function dicerollRecover(b, B, short) { b.recT = short ? 12 : (bossRage() ? B.recoverRage : B.recover); bossSet('drRecover'); }
function drSpawn(x, y, vx, vy, kind, dmg, spr) { const q = spawnBullet(x - (BULLET_SIZE[kind] || [8, 8])[0] / 2, y - (BULLET_SIZE[kind] || [8, 8])[1] / 2, vx, vy, kind, dmg); if (q) q.sspr = spr; return q; }

// ---- per-bullet hooks (run before movement: they pre-correct position so x+=vx lands exactly) ----
function drFloorBounce(q, vyOut) { q.y = FLOOR_Y - q.h - vyOut; q.vy = vyOut; }
function drDieHook(q) { // kind 29: hops once, then rolls along the floor
  if (!q.roll) {
    q.vy += 0.22;
    if (q.y + q.h + q.vy >= FLOOR_Y) {
      if (q.bnc < 1) { q.bnc++; drFloorBounce(q, -1.6); sfx('tick'); }
      else { q.roll = true; drFloorBounce(q, 0); q.vy = 0; spawnPart(q.x + q.w / 2, FLOOR_Y - 1, -q.vx * 0.3, -0.3, 8, 1, '#ffffff'); }
    }
  } else { q.y = FLOOR_Y - q.h; q.vy = 0; }
  return false;
}
function drBoomHook(q) { // kind 30 boomerang card: constant speed out (range or wall), snaps back at the same height, caught by her
  const B = CONFIG.bosses.diceroll;
  if (!q.back) {
    if (Math.abs(q.x + q.w / 2 - q.x0) >= B.boomRange || (q.f > 0 && q.x + q.w + q.vx > ROOM_R - 2) || (q.f < 0 && q.x + q.vx < ROOM_L + 2)) {
      q.back = true; q.vx = -q.vx; sfx('swoosh'); spawnPart(q.x + q.w / 2, q.y + q.h / 2, 0, 0, 8, 1, '#ffd84a');
    }
  } else {
    const bc = boss.x + boss.w / 2;
    if ((q.x + q.w / 2 - bc) * q.f <= 0 || q.t > 240 || boss.state === 'rescue') { q.active = false; return true; }
  }
  return false;
}
function drBallHook(q) { // kind 32 roulette ball: bounces off walls / floor / ceiling, limited bounces
  const B = CONFIG.bosses.diceroll;
  if (!q.rel) { // circling her raised hand until she throws
    if (boss.state !== 'drRoulette' || boss.t >= q.relT) {
      q.rel = true; const a = q.ang0; q.vx = Math.cos(a) * B.rouletteSpeed * boss.face; q.vy = Math.sin(a) * B.rouletteSpeed; sfx('bshoot');
    } else {
      const h = drWindPt(boss), a = q.t * 0.35 + q.ph;
      q.x = h.x + Math.cos(a) * 9 - q.w / 2; q.y = h.y + Math.sin(a) * 6 - q.h / 2; q.vx = 0; q.vy = 0; return false;
    }
  }
  let hit = false;
  if (q.x + q.vx < ROOM_L + 1 || q.x + q.w + q.vx > ROOM_R - 1) { q.vx = -q.vx; hit = true; }
  if (q.y + q.h + q.vy >= FLOOR_Y) { drFloorBounce(q, -Math.abs(q.vy)); hit = true; }
  else if (q.y + q.vy < 22) { q.vy = Math.abs(q.vy); hit = true; }
  if (hit) { q.bnc++; sfx('tink'); spawnPart(q.x + q.w / 2, q.y + q.h / 2, 0, 0, 6, 1, '#ffffff'); }
  if (q.bnc > B.rouletteBounces || q.t > B.rouletteLife || boss.state === 'rescue') { popAt(q.x + q.w / 2, q.y + q.h / 2, '#ffffff'); q.active = false; return true; }
  return false;
}
function drFlameHook(q) { // kind 33 flaming die: bounces toward Umine, embers on every bounce
  const B = CONFIG.bosses.diceroll;
  q.vy += 0.16;
  if (q.x + q.vx < ROOM_L + 1 || q.x + q.w + q.vx > ROOM_R - 1) q.vx = -q.vx;
  if (q.t % 3 === 0) spawnPart(q.x + q.w / 2, q.y + q.h / 2, -q.vx * 0.2, -0.4, 12, 1, (q.t & 4) ? '#ffb040' : '#ff4a2a');
  if (q.y + q.h + q.vy >= FLOOR_Y) {
    q.bnc++; sfx('boomS'); shake(4, 1);
    for (const s of [-1, 1]) { const e = drSpawn(q.x + q.w / 2, FLOOR_Y - 4, s * 1.3, 0, 34, B.emberDamage, 0); if (e) { e.life = 54; e.y = FLOOR_Y - e.h; } }
    if (q.bnc >= B.flameBounces || boss.state === 'rescue') { popAt(q.x + q.w / 2, FLOOR_Y - 6, '#ff8a3a'); q.active = false; return true; }
    drFloorBounce(q, -3.4 * Math.pow(0.8, q.bnc));
  }
  return false;
}

// Card fan geometry. The gap is centred on Umine's STANDING box at her x when the fan locks (not where she is mid-jump),
// and widened until both gap cards clear that box (+ margin) over its whole width: standing still on the floor is always
// safe; the other cards fan out from there (upper side gets the extra card). Angles in screen space (y down).
function drCardLine(tp, a, x) { const c = Math.cos(a); if (Math.abs(c) < 1e-3 || (x - tp.x) * c <= 0) return null; return tp.y + (x - tp.x) * Math.tan(a); }
function drCardClear(tp, a, px, B) {
  const cy = FLOOR_Y - P.h / 2, half = (BULLET_SIZE[30][1] + P.h) / 2 + B.cardGapMargin, xs = [px - (BULLET_SIZE[30][0] + P.w) / 2, px + (BULLET_SIZE[30][0] + P.w) / 2];
  let side = 0;
  for (const x of xs) { const y = drCardLine(tp, a, x); if (y === null) continue; const d = y - cy; if (Math.abs(d) < half) return false; const sg = Math.sign(d); if (side && sg !== side) return false; side = sg; }
  return true;
}
function drCardFan(tp, px, face, n, B) {
  let tx = px; if ((tx - tp.x) * face < 40) tx = tp.x + face * 40;       // hugging her: aim just ahead
  const aim = Math.atan2(FLOOR_Y - P.h / 2 - tp.y, tx - tp.x);
  let half = B.cardGapMin;
  while (half < 1.2 && !(drCardClear(tp, aim - half, px, B) && drCardClear(tp, aim + half, px, B))) half += 0.01;
  const up = face > 0 ? -1 : 1, nUp = Math.ceil(n / 2), nDown = n - nUp, out = [];
  for (let k = 0; k < nUp; k++) out.push(aim + up * (half + k * B.cardSpread));
  for (let k = 0; k < nDown; k++) out.push(aim - up * (half + k * B.cardSpread));
  return out;
}

// ---- AI ----
function aiDiceroll(b, B, pcx, pcy) {
  bossFall(b);
  const rage = bossRage(), cx = b.x + b.w / 2, dx = pcx - cx, dist = Math.abs(dx);
  b.x = Math.max(ROOM_L + 4, Math.min(ROOM_R - b.w - 4, b.x));
  if (!b.allin && b.hp <= B.hp / 2 && (b.state === 'hover' || b.state === 'drRecover')) { // one-time desperation combo
    b.allin = true; b.allinStep = 0; bossSeen('allin'); bossFacePlayer(); sfx('warn'); shake(8, 2); bossSet('drAllin'); return;
  }
  if (b.state === 'hover') { // walk: keep ~90 px from Umine
    bossFacePlayer(); b.fateN = 0; b.fateCount = 0;
    const ideal = 90, sp = rage ? B.walkSpeedRage : B.walkSpeed; let moving = false;
    if (dist > ideal + 14) { b.x += Math.sign(dx) * sp; moving = true; }
    else if (dist < ideal - 24 && dist > 2) { const nx = b.x - Math.sign(dx) * sp; if (nx > ROOM_L + 6 && nx + b.w < ROOM_R - 6) { b.x = nx; moving = true; } }
    b.pose = moving ? 'walk' : 'idle'; b.poseF = -1;
    if (b.t >= (rage ? B.idleFramesRage : B.idleFrames)) { b.comboLeft = Math.random() < (rage ? B.comboChanceRage : B.comboChance) ? 1 : 0; dicerollStart(b, dicerollPick(b)); }
    return;
  }
  if (b.state === 'drAllin') { // "ALL IN!" then chips -> cards -> dice
    b.pose = 'windup'; b.poseF = 0;
    if (b.t % 6 === 0) spawnPart(cx + (hash(b.t, 3) % 40) - 20, b.y - 4, 0, -0.6, 18, 1, (b.t & 8) ? '#ffd84a' : '#ff4a5a');
    if (b.t >= B.allinAnnounce) { b.allinStep = 1; b.fateCount = rage ? 5 : 4; dicerollStart(b, 'chips'); }
    return;
  }
  if (b.state === 'drFate') { // big die over her head decides the next attack
    const show = rage ? B.fateShowRage : B.fateShow;
    if (b.t < 12) { b.pose = 'windup'; b.poseF = 0; bossFacePlayer(); }
    else if (b.t < 12 + B.fateRoll) { b.pose = 'throwDice'; b.poseF = 0; if (b.t === 12) sfx('swoosh'); if (b.t % 5 === 0) sfx('tick'); }
    else { b.pose = 'idle'; b.poseF = 0; }
    if (b.t === 12 + B.fateRoll) {
      let n = 1 + ((Math.random() * 6) | 0); if (n === b.fateLast) n = 1 + ((n + ((Math.random() * 5) | 0)) % 6); b.fateLast = n;
      b.fateN = n; sfx('cp'); shake(3, 1); popAt(cx, b.y - 22, '#ffffff');
    }
    if (b.t >= 12 + B.fateRoll + show) {
      const n = b.fateN;
      if (n <= 2) { b.fateCount = n; bossSet('drRoulette'); }
      else if (n <= 4) { b.fateCount = n; bossSet('drCards'); }
      else { b.fateCount = n - 1; bossSet('drChips'); }
      bossFacePlayer(); b.fateN = 0; b.fateShown = n;
    }
    return;
  }
  if (b.state === 'drDice') { // dice hop once, then roll along the floor
    const wind = rage ? B.diceWindRage : B.diceWind, n = b.allinStep === 3 ? 3 : (rage ? B.diceCountRage : B.diceCount);
    const k = b.t - wind;
    if (k < 0) { b.pose = 'windup'; b.poseF = 0; bossFacePlayer(); }
    else { const i = Math.floor(k / B.diceGap), kk = k % B.diceGap; b.pose = i < n && kk < 10 ? 'throwDice' : 'idle'; b.poseF = 0; }
    if (k >= 0 && k % B.diceGap === 0 && k / B.diceGap < n) {
      const tp = drThrowPt(b), sp = (rage ? B.diceSpeedRage : B.diceSpeed) * (1 + (k / B.diceGap) * 0.12);
      const q = drSpawn(tp.x, tp.y, b.face * sp, -2.4, 29, B.diceDamage, 0);
      if (q) { q.hook = drDieHook; q.face = (Math.random() * 6) | 0; } sfx('bshoot');
    }
    if (k >= n * B.diceGap + 6) dicerollRecover(b, B, b.allinStep > 0);
    return;
  }
  if (b.state === 'drCards') { // card fan with a guaranteed safe gap where Umine stands (preview lines + green floor mark)
    if (!b.cardW) { b.cardW = b.fateCount ? B.cardWindFate : (rage ? B.cardWindRage : B.cardWind); b.cardN = b.fateCount || (rage ? B.cardCountRage : B.cardCount); b.cardAngs = null; }
    const wind = b.cardW, n = b.cardN, lock = wind - B.cardPreview;
    b.pose = b.t < wind ? 'windup' : 'flickCards'; b.poseF = 0;
    if (b.t < lock) bossFacePlayer();
    if (b.t === Math.max(1, lock)) { const tp = drCardPt(b); b.cardSafeX = pcx; b.cardAngs = drCardFan(tp, pcx, b.face, n, B); }
    if (b.t === wind && b.cardAngs) {
      const tp = drCardPt(b);
      for (const a of b.cardAngs) drSpawn(tp.x, tp.y, Math.cos(a) * B.cardSpeed, Math.sin(a) * B.cardSpeed, 30, B.cardDamage, 0);
      sfx('swoosh');
    }
    if (b.t >= wind + 22) { b.fateCount = 0; b.cardW = 0; b.cardAngs = null; if (b.allinStep === 2) { b.allinStep = 3; dicerollStart(b, 'dice'); } else dicerollRecover(b, B, false); }
    return;
  }
  if (b.state === 'drBoom') { // boomerang cards one at a time (next one only after she catches the last): low (jump) / high (stand) / low [enraged: + high]
    const wind = rage ? B.boomWindRage : B.boomWind, n = b.pr ? 4 : 3;
    if (b.t <= 1 || b.boomI === undefined) { b.boomI = 0; b.boomAt = wind; b.boomFlick = -99; }
    const flying = bullets.some(q => q.active && q.boom);
    if (flying) b.boomAt = Math.max(b.boomAt, b.t + B.boomGap);
    else if (b.boomI < n && b.t < b.boomAt) bossFacePlayer();
    if (!flying && b.boomI < n && b.t >= b.boomAt) {
      const high = (b.boomI & 1) === 1, y = high ? FLOOR_Y - 40 : FLOOR_Y - 9;
      const q = drSpawn(cx + b.face * 12, y, b.face * B.boomSpeed, 0, 30, B.boomDamage, 1);
      if (q) { q.hook = drBoomHook; q.f = b.face; q.back = false; q.boom = true; q.x0 = q.x + q.w / 2; }
      b.boomI++; b.boomFlick = b.t; sfx('swoosh');
    }
    b.poseF = 0; b.pose = b.t - b.boomFlick < 10 ? 'flickCards' : (!flying && b.boomI < n ? 'windup' : 'idle');
    if ((b.boomI >= n && !flying && b.t - b.boomFlick > 10) || b.t > 420) { b.boomI = undefined; dicerollRecover(b, B, false); }
    return;
  }
  if (b.state === 'drChips') { // marked columns, then chip stacks fall there
    const warn = b.allinStep === 1 ? 36 : (rage ? B.chipWarnRage : B.chipWarn), n = b.fateCount || (rage ? B.chipColsRage : B.chipCols);
    b.pose = b.t < warn ? 'windup' : 'flickCards'; b.poseF = 0;
    if (b.t === 1) {
      const lanes = 8, lw = (ROOM_R - ROOM_L) / lanes, pl = Math.max(0, Math.min(lanes - 1, Math.floor((pcx - ROOM_L) / lw)));
      const nb = [pl - 1, pl + 1].filter(v => v >= 0 && v < lanes), safe = nb[(Math.random() * nb.length) | 0];
      const cand = []; for (let i = 0; i < lanes; i++) if (i !== pl && i !== safe) cand.push(i);
      for (let i = cand.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = cand[i]; cand[i] = cand[j]; cand[j] = t; }
      const cols = [pl].concat(cand.slice(0, Math.min(n, 6) - 1));
      b.chipCols = cols.map(c => ROOM_L + (c + 0.5) * lw); sfx('warn');
    }
    const k = b.t - warn;
    if (k >= 0 && k % 7 === 0 && k / 7 < 3) {
      for (const x of b.chipCols) { const q = drSpawn(x, -4, 0, B.chipSpeed, 31, B.chipDamage, (k / 7 + (x | 0)) & 1); if (q) q.chip = true; }
      if (k === 0) sfx('bshoot');
    }
    if (k >= 3 * 7 + 34) { b.chipCols = []; b.fateCount = 0; if (b.allinStep === 1) { b.allinStep = 2; b.fateCount = 5; dicerollStart(b, 'cards'); } else dicerollRecover(b, B, false); }
    return;
  }
  if (b.state === 'drRoulette') { // ball(s) circle her hand, then bounce around the room
    const wind = b.fateCount ? 18 : B.rouletteWind, n = b.fateCount || (rage ? 2 : 1);
    b.pose = b.t < wind ? 'windup' : (b.t < wind + 10 ? 'throwDice' : 'idle'); b.poseF = 0;
    if (b.t < wind - 6) bossFacePlayer();
    if (b.t === 1) for (let i = 0; i < n; i++) {
      const q = drSpawn(cx, b.y, 0, 0, 32, B.rouletteDamage, 0);
      if (q) { q.hook = drBallHook; q.rel = false; q.relT = wind + i * 8; q.ph = i * Math.PI; q.ang0 = i ? -1.05 : -0.45; q.ball = true; }
    }
    if (b.t >= wind + n * 8 + 30) { b.fateCount = 0; dicerollRecover(b, B, false); b.recT += 20; }
    return;
  }
  if (b.state === 'drFlame') { // enraged: flaming die bounces toward Umine
    const wind = B.flameWind;
    b.pose = b.t < wind ? 'windup' : (b.t < wind + 12 ? 'throwDice' : 'idle'); b.poseF = 0;
    if (b.t < wind - 4) bossFacePlayer();
    if (b.t === wind) {
      const tp = drThrowPt(b), T = 46, vx = Math.max(-2.6, Math.min(2.6, (pcx - tp.x) / T));
      const q = drSpawn(tp.x, tp.y, vx || b.face * 1.2, -3.6, 33, B.flameDamage, 0); if (q) q.hook = drFlameHook; sfx('boomS');
    }
    if (b.t >= wind + 40) dicerollRecover(b, B, false);
    return;
  }
  if (b.state === 'drRecover') {
    b.pose = 'idle'; b.poseF = -1;
    if (b.t >= b.recT) {
      if (b.comboLeft > 0) { b.comboLeft--; dicerollStart(b, dicerollPick(b)); }
      else bossSet('hover');
    }
    return;
  }
  bossSet('hover');
}

// ---- drawing ----
const DICEROLL_RED = {};
function dicerollRedFrame(sh, fi, face) {
  if (!DICEROLL_RED[fi]) { const c = tintCanvas(sh[fi].r, '#ff2a40', 0.65); DICEROLL_RED[fi] = { r: c, l: flipCanvas(c) }; }
  return face >= 0 ? DICEROLL_RED[fi].r : DICEROLL_RED[fi].l;
}
// one 24x24 cell of diceroll_bullets centred at (x,y) (cell hit centre cxo,12), integer position, optional rotation/scale
function drCell(idx, x, y, scale, rot, flip, cxo) {
  const S = SHEETS.dicerollBullets; cxo = cxo || 12;
  g.save(); g.translate(Math.round(x), Math.round(y)); if (rot) g.rotate(rot); if (scale && scale !== 1) g.scale(scale, scale);
  if (S && S[idx]) g.drawImage(flip ? S[idx].l : S[idx].r, flip ? -(24 - cxo) : -cxo, -12);
  else { g.fillStyle = idx === 13 ? '#e03040' : idx === 14 ? '#202020' : idx >= 10 && idx <= 12 ? '#f0e8d8' : '#ffffff'; g.fillRect(-6, -6, 12, 12); }
  g.restore();
}
// die face (0-5) - used by the helper's lobbed die and the support move
function drawDie(x, y, faceIdx, scale, rot) { drCell(Math.max(0, Math.min(5, faceIdx | 0)), x, y, scale || 1, rot ? Math.round(rot / (Math.PI / 2)) * (Math.PI / 2) : 0); }
function drFateLabel(n) { return n <= 2 ? 'ROULETTE X' + n : n <= 4 ? 'CARDS X' + n : 'CHIPS X' + (n - 1); }
function drawDicerollOverlay(b, mx, by, camX) {
  const B = CONFIG.bosses.diceroll, headY = by - 66;
  if (b.state === 'drFate') {
    if (b.t >= 12 && b.t < 12 + B.fateRoll) { // tumbling up from her hand
      const p = (b.t - 12) / B.fateRoll, e = 1 - (1 - p) * (1 - p), hx = mx + b.face * 15, hy = by - 25;
      drCell(6 + ((b.t >> 2) & 3), hx + (mx - hx) * e, hy + (headY - hy) * e, 2, 0);
    } else if (b.fateN) { // the shown face, 2x, with what it means
      const k = b.t - 12 - B.fateRoll;
      if (k < 4) { g.fillStyle = '#ffffff'; g.fillRect(mx - 16, headY - 16, 32, 32); }
      drCell(b.fateN - 1, mx, headY, 2, 0);
      if ((k >> 2) & 1 || k > 12) drawTextShadow(drFateLabel(b.fateN), mx, headY - 24, b.fateN <= 2 ? 'w' : b.fateN <= 4 ? 'y' : 'r', 1, 'c');
    }
  }
  if (b.state === 'drAllin') {
    const s = 2 + ((b.t >> 3) & 1) * 0; if ((b.t >> 2) & 1 || b.t > 24) drawTextShadow('ALL IN!', mx, by - 70, (b.t >> 3) & 1 ? 'r' : 'y', s, 'c');
    for (let i = 0; i < 3; i++) drCell(13 + (i & 1), mx - 14 + i * 14, by - 52 + Math.round(Math.sin((b.t + i * 9) * 0.2) * 3), 1, 0);
  }
  const w = drWindPt(b), wx = w.x - camX;
  if (b.pose === 'windup') { // what's in the raised hand
    if (b.state === 'drDice' || b.state === 'drFate') drCell(6 + ((frame >> 3) & 3), wx, w.y - 4, 1, 0);
    else if (b.state === 'drCards' || b.state === 'drBoom') drCell(12, wx, w.y - 4, 1, 0);
    else if (b.state === 'drChips') drCell(13, wx, w.y - 4, 1, 0);
    else if (b.state === 'drFlame') { drCell(16, wx, w.y - 4, 1, 0); if (frame & 2) spawnPart(w.x, w.y - 8, 0, -0.5, 10, 1, '#ffb040'); }
  }
  if (b.state === 'drChips' && b.t > 1 && b.fateCount && b.t < 30 && ((b.t >> 2) & 1)) drawTextShadow('CHIPS X' + b.chipCols.length, mx, by - 62, 'r', 1, 'c');
  if (b.state === 'rescue' && b.t >= 60 && b.t < 70) { // dice head cracks
    for (let i = 0; i < 4; i++) { const h = hash(b.t + i * 5, 9); g.fillStyle = (i & 1) ? '#ffffff' : '#d8d8e0'; g.fillRect(mx - 8 + (h % 16), by - 44 - ((h >> 4) % 10) - (b.t - 60), 2, 2); }
  }
}
function drawDicerollMarks(b, camX, blink) {
  const B = CONFIG.bosses.diceroll;
  if (b.state === 'drChips' && b.chipCols && b.chipCols.length) {
    const warn = b.allinStep === 1 ? 36 : (bossRage() ? B.chipWarnRage : B.chipWarn);
    if (b.t < warn) for (const px of b.chipCols) {
      const x = Math.round(px - camX);
      g.save(); g.globalAlpha = blink ? 0.34 : 0.2; g.fillStyle = '#ff2a3a'; g.fillRect(x - 8, 20, 16, FLOOR_Y - 20); g.restore();
      g.fillStyle = blink ? '#ff3a4a' : '#ffd84a'; g.fillRect(x - 8, FLOOR_Y - 2, 16, 2);
      drCell(13, x, 30, 1, 0);
    }
  }
  if (b.state === 'drCards' && b.cardAngs && b.t < b.cardW) { // preview: dotted card paths + green SAFE mark where the gap is
    const tp = drCardPt(b), x0 = Math.round(tp.x - camX);
    g.fillStyle = blink ? '#ffffff' : '#ff4a5a';
    for (const a of b.cardAngs) for (let d = 12; d < 170; d += 6) { const y = Math.round(tp.y + Math.sin(a) * d); if (y > FLOOR_Y - 1 || y < 18) break; g.fillRect(x0 + Math.round(Math.cos(a) * d), y, 2, 2); }
    const sx = Math.round(b.cardSafeX - camX);
    g.fillStyle = blink ? '#7dff9a' : '#3ad06a';
    g.fillRect(sx - 9, FLOOR_Y - 2, 18, 2); g.fillRect(sx - 9, FLOOR_Y - 6, 2, 4); g.fillRect(sx + 7, FLOOR_Y - 6, 2, 4);
  }
  if (b.state === 'drBoom' && b.pose === 'windup' && b.boomI !== undefined) { // height hint for the NEXT card: low (jump) or high (stay down)
    const x = Math.round(b.x + b.w / 2 - camX + b.face * 16), y = (b.boomI & 1) ? FLOOR_Y - 41 : FLOOR_Y - 10;
    g.fillStyle = blink ? '#ffd84a' : '#ffffff'; g.fillRect(x - (b.face < 0 ? 10 : 0), y, 10, 2);
  }
}
function drawDicerollBullet(q, camX) {
  const cx = q.x + q.w / 2 - camX, cy = q.y + q.h / 2;
  if (q.kind === 29) { // die: tumbling face in the air, rolling loop on the floor
    if (q.roll) drCell(6 + (((q.t >> 2) & 3) ^ (q.vx < 0 ? 0 : 0)), cx, cy, 1, 0, q.vx < 0);
    else drCell(q.face, cx, cy, 1, ((q.t >> 3) & 3) * Math.PI / 2);
    return;
  }
  if (q.kind === 30) { const seq = [10, 11, 12, 11]; drCell(seq[(q.t >> 2) & 3], cx, cy, 1, 0); return; }
  if (q.kind === 31) { drCell(13 + (q.sspr & 1), cx, cy, 1, 0); return; }
  if (q.kind === 32) { // roulette ball (cell hit centre 15,12; trail behind it)
    if (!q.rel) { drCell(15, cx, cy, 1, 0, false, 15); return; }
    drCell(15, cx, cy, 1, Math.atan2(q.vy, q.vx), false, 15); return;
  }
  if (q.kind === 33) { drCell(16, cx, cy, 1, 0, q.vx < 0, 13); return; }
  if (q.kind === 34) { // ember (code-drawn flicker)
    const x = Math.round(cx), y = Math.round(q.y), f = (q.t >> 2) & 1;
    g.fillStyle = '#ff4a2a'; g.fillRect(x - 3, y + 2, 6, 6); g.fillStyle = '#ffb040'; g.fillRect(x - 2, y + 3 - f, 4, 4); g.fillStyle = '#fff0b0'; g.fillRect(x - 1, y + 5 - f, 2, 2);
  }
}

// ---- rescued ダイスロール as support: LUCKY ROLL (HELP button "ROLL") ----
//  t14 she tosses a die (frame 4) -> t40 face N shows -> t52+ flicks N homing cards (frame 5).
//  vs a boss: total damage by face [2,3,4,4,5,6] (avg 4): every card 1, the first card carries the bonus.
//  vs enemies: 2 per card.
const DR_ROLL_DMG = [2, 3, 4, 4, 5, 6];
function updateDicerollSupport(t) {
  support.x += (P.x + P.w / 2 - P.face * 20 - support.x) * 0.25; support.y += (P.y - support.y) * 0.25;
  if (t < 14) support.face = P.face;
  const f = support.face, fxs = support.fx || (support.fx = []), n = support.n || 4;
  if (t === 14) sfx('swoosh');
  if (t === 40) { sfx('cp'); popAt(support.x, support.y - 26, '#ffffff'); }
  if (t >= 52 && (t - 52) % 5 === 0 && (t - 52) / 5 < n) {
    const i = (t - 52) / 5;
    fxs.push({ x: support.x + f * 6, y: support.y + 4, vx: f * 2.6, vy: -1.6 + i * 0.5, t: 0, alive: true, first: i === 0 }); sfx('swoosh');
  }
  for (const q of fxs) {
    if (!q.alive) continue;
    q.t++;
    const tg = shiranuiSupportTarget(q);
    if (tg && q.t > 5) { const tx = tg.x - q.x, ty = tg.y - q.y, l = Math.hypot(tx, ty) || 1; q.vx += (tx / l * 4 - q.vx) * 0.2; q.vy += (ty / l * 4 - q.vy) * 0.2; }
    q.x += q.vx; q.y += q.vy;
    if (tg && Math.abs(tg.x - q.x) < 9 && Math.abs(tg.y - q.y) < 12) {
      q.alive = false; popAt(q.x, q.y, '#ffd860');
      if (tg.boss) { boss.inv = 0; damageBoss(null, 1 + (q.first ? DR_ROLL_DMG[n - 1] - n : 0)); }
      else { tg.e.hp -= 2; tg.e.flash = 10; if (tg.e.hp <= 0) killEnemy(tg.e); else sfx('ehit'); }
    }
    if (q.t > 110 || q.x < cam.x - 20 || q.x > cam.x + VW + 20 || q.y < -20 || q.y > VH) q.alive = false;
  }
  if ((t > 52 + n * 5 && !fxs.some(q => q.alive)) || t > 200) support.active = false;
}
function drawDicerollSupport(t, x, y, camX) {
  const fr = SHEETS.diceroll, d = SHEET_DEFS.diceroll, f = support.face, n = support.n || 4;
  const fi = t < 14 ? (t >> 3) & 1 : t < 52 ? (t < 30 ? 4 : 0) : 5;
  if (t < 12) g.globalAlpha = t / 12;
  if (fr) g.drawImage(pick(fr[Math.min(fi, fr.length - 1)], f, false), x - (f > 0 ? d.cx : d.fw - d.cx), y - 12);
  else g.drawImage(pick(SPR.ally.R[fi === 5 ? 1 : 0], f, false), x - 16, y - 12);
  g.globalAlpha = 1;
  if (t >= 14 && t < 40) { const p = (t - 14) / 26; drCell(6 + ((t >> 2) & 3), x, y - 6 - p * 22, 1, 0); }
  else if (t >= 40 && t < 80) { drCell(n - 1, x, y - 28, 1.5, 0); if (t < 70) drawTextShadow(n + '!', x + 14, y - 40, 'y', 1, 'c'); }
  const seq = [10, 11, 12, 11];
  for (const q of (support.fx || [])) if (q.alive) drCell(seq[(q.t >> 2) & 3], q.x - camX, q.y, 1, 0);
}
