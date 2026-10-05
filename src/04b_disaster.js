
// =====================================================================
//  AREA 5  災厄の紅月城 DISASTER CASTLE - boss 魔王ディザスター (Demon Lord Disaster)
//  He is the dark-fallen form of スターさん (Star, he/him). His 錬金剣 (alchemy sword) changes shape
//  for every attack. Fairness rules for every form:
//    1. purple MORPH flash on his body + the next weapon's icon above his head (DISASTER_MORPH frames)
//    2. the weapon's own telegraph (aim line / floor mark / reach line / wind-up)
//    3. the strike, then a recovery window (best time to shoot him)
//  Forms (bossSeen names): sword, spear, axe, scythe (returns), bow, whip (whip-sword), lance (cannon-spear).
//  Tuning: CONFIG.bosses.disaster.
//  Enraged (<= 50% HP, or hard mode): shorter morphs/wind-ups and sometimes a 2nd form chained right after.
//
//  ART (assets/disaster_dark.json): every form has its own body frame with the weapon baked in (pose = form name,
//  'transform' during the morph). Muzzle points below are in the RIGHT-facing 48x48 frame (body x=23); mirrored
//  when he faces left. assets/alchemic_weapons.png icons (sword..whip, lance = cell 6) are shown above his head
//  during the morph, and replace the weapon if the body sheet is missing. Without any sheet the code-drawn
//  shapes (drawWeaponShape) are used. Projectiles use assets/disaster_bullets.png (b.dspr) when it is loaded.
// =====================================================================
const DISASTER_FORMS = ['sword', 'spear', 'axe', 'scythe', 'bow', 'whip', 'lance'];
//  icon: cell in alchemic_weapons.png (-1 = none), grip: gripNorm from alchemic_weapons.json, muz: muzzle in the body frame
const DISASTER_WEAPONS = {
  sword:  { icon: 0, grip: [0.266, 0.766], muz: [46, 27] },
  spear:  { icon: 1, grip: [0.297, 0.766], muz: [46, 23] },
  axe:    { icon: 2, grip: [0.234, 0.734], muz: [40, 30] },
  scythe: { icon: 3, grip: [0.266, 0.734], muz: [46, 27] },
  bow:    { icon: 4, grip: [0.609, 0.547], muz: [46, 22] },
  whip:   { icon: 5, grip: [0.734, 0.359], muz: [46, 20] },
  lance:  { icon: 6, grip: [0.359, 0.734], muz: [46, 24] },   // cannon-spear (alchemic_weapons.png cell 6, added 2026-10-03)
};
const DIS_SPR = { wave: 0, spear: 1, burst: 2, arrow: 3, scythe: 4, orb: 5 };   // disaster_bullets.png cells
// world position of a weapon's muzzle (falls back to an estimate when the sheet is not loaded)
function disasterMuzzle(b, form) {
  const W = DISASTER_WEAPONS[form] || DISASTER_WEAPONS.sword, D = SHEET_DEFS.disasterDark;
  return { x: b.x + b.w / 2 + b.face * (W.muz[0] - D.cx), y: b.y + b.h + b.hopY - D.fh + W.muz[1] };
}
function disasterHand(b) { return disasterMuzzle(b, b.weapon || 'sword'); }
function disasterArt() { return !!SHEETS.disasterDark && SHEETS.disasterDark.length >= 14; }
function disShot(x, y, vx, vy, kind, dmg, spr) { const q = spawnBullet(x, y, vx, vy, kind, dmg); if (q && SHEETS.disasterBullets) q.dspr = spr; return q; }
// cannon orb hits the floor: two small ground shocks (jump them)
function disasterOrbBurst(q) {
  const B = CONFIG.bosses.disaster, c = q.x + q.w / 2;
  if (q.y + q.h < FLOOR_Y - 20) return;
  shake(4, 1); sfx('boomS');
  disShot(c - 12, FLOOR_Y - 11, -B.orbShockSpeed, 0, 4, B.orbShockDamage, DIS_SPR.burst);
  disShot(c + 4, FLOOR_Y - 11, B.orbShockSpeed, 0, 4, B.orbShockDamage, DIS_SPR.burst);
}

// ---- AI ----
function disasterPick(b, dist) {
  const pool = dist < 60 ? ['sword', 'axe', 'whip', 'scythe', 'lance'] : dist > 120 ? ['bow', 'spear', 'axe', 'scythe', 'lance'] : DISASTER_FORMS;
  const unseen = pool.filter(k => !b.seen.includes(k) && k !== b.last);
  return unseen.length && Math.random() < 0.6 ? pickPattern([unseen[(Math.random() * unseen.length) | 0]]) : pickPattern(pool);
}
function disasterMorph(b, form) { b.nextWeapon = form; b.rep = 0; bossSet('disMorph'); bossFacePlayer(); sfx('warn'); }
function disasterRecover(b, B) { b.recT = bossRage() ? B.recoverRage : B.recover; b.aimShow = false; bossSet('disRecover'); }
const DIS_STATE = { sword: 'disSword', spear: 'disSpear', axe: 'disAxe', scythe: 'disScythe', bow: 'disBow', whip: 'disWhip', lance: 'disLance' };

function aiDisaster(b, B, pcx, pcy) {
  const rage = bossRage(), cx = b.x + b.w / 2, dx = pcx - cx, dist = Math.abs(dx);
  const floatY = FLOOR_Y - b.h - B.floatGap;
  if (b.state === 'hover') {
    astarteFloat(b, B); bossFacePlayer();
    const ideal = 84, sp = rage ? 1.0 : 0.75;
    if (dist > ideal + 14) b.x += Math.sign(dx) * sp; else if (dist < ideal - 18 && dist > 2) b.x -= Math.sign(dx) * sp * 0.8;
    b.pose = dist > ideal + 14 ? 'glide' : 'idle'; b.poseF = -1;
    if (b.t >= (rage ? B.idleFramesRage : B.idleFrames)) {
      b.comboLeft = Math.random() < (rage ? B.comboChanceRage : B.comboChance) ? 1 : 0; b.rep = 0;
      disasterMorph(b, disasterPick(b, dist));
    }
    return;
  }
  if (b.state === 'disMorph') { // transform pose + purple flash: particles pull into his hand, next weapon icon above his head
    astarteFloat(b, B); b.pose = 'transform'; b.poseF = 0;
    const hd = disasterMuzzle(b, 'spear');
    if (b.t % 3 === 0) { const h = hash(b.t, 17), a = (h % 628) / 100; spawnPart(hd.x + Math.cos(a) * 20, hd.y + Math.sin(a) * 20, -Math.cos(a) * 1.4, -Math.sin(a) * 1.4, 14, 4, (h >> 9) & 1 ? '#b060ff' : '#ff4c9a'); }
    if (b.t >= (rage ? B.morphFramesRage : B.morphFrames)) {
      b.weapon = b.nextWeapon; sfx('cp');
      for (let i = 0; i < 8; i++) spawnPart(hd.x, hd.y, DIR8X[i] * 1.3, DIR8Y[i] * 1.3, 14, 0, i & 1 ? '#d8a8ff' : '#ffffff');
      bossFacePlayer(); b.warn = 0;
      bossSet(DIS_STATE[b.weapon] || 'disSword');
    }
    return;
  }
  if (b.state === 'disSword') { // low crescent along the floor (jump it); enraged: then a HIGH one (stay on the ground)
    astarteFloat(b, B); b.pose = 'sword'; b.poseF = 0;
    const wind = rage ? B.swordWindRage : B.swordWind, sp = rage ? B.waveSpeedRage : B.waveSpeed, hd = disasterMuzzle(b, 'sword');
    if (b.t === wind) { disShot(hd.x - 6, FLOOR_Y - 20, b.face * sp, 0, 9, B.waveDamage, DIS_SPR.wave); sfx('swoosh'); b.fireT = 10; }
    if (rage && b.t === wind + B.swordGap) { disShot(hd.x - 6, FLOOR_Y - 47, b.face * sp, 0, 9, B.waveDamage, DIS_SPR.wave); sfx('swoosh'); b.fireT = 10; }
    if (b.t >= wind + (rage ? B.swordGap + 12 : 14)) disasterRecover(b, B);
    return;
  }
  if (b.state === 'disSpear') { // aim line tracks Umine, locks (stops moving) for spearLock frames, then the spear bolt flies
    astarteFloat(b, B); b.pose = 'spear'; b.poseF = 0;
    const aim = rage ? B.spearAimRage : B.spearAim;
    if (b.t < aim - B.spearLock) { bossFacePlayer(); b.aimX = pcx; b.aimY = pcy; }
    const hd = disasterMuzzle(b, 'spear'); b.mx = hd.x; b.my = hd.y;
    b.aimShow = b.t < aim;
    if (b.t === aim - B.spearLock) sfx('tick');
    if (b.t === aim) {
      const ax = b.aimX - hd.x, ay = b.aimY - hd.y, len = Math.hypot(ax, ay) || 1;
      disShot(hd.x - 6, hd.y - 2, ax / len * B.spearSpeed, ay / len * B.spearSpeed, 21, B.spearDamage, DIS_SPR.spear);
      b.x -= b.face * 6; sfx('bshoot'); b.fireT = 10; b.aimShow = false;
    }
    if (b.t >= aim + 18) {
      if (rage && !b.rep) { b.rep = 1; b.t = B.spearLock + 6; } // enraged: a quicker second throw (re-aims, then locks again)
      else disasterRecover(b, B);
    }
    return;
  }
  if (b.state === 'disAxe') { // rises, a floor mark locks on Umine, he slams down there: 2 floor shockwaves
    b.pose = b.t < B.axeRise ? 'glide' : 'axe'; b.poseF = b.t < B.axeRise ? -1 : 0;
    const hang = rage ? B.axeHangRage : B.axeHang, topY = floatY - 74;
    if (b.t <= B.axeRise) { b.y += (topY - b.y) * 0.16; b.x += Math.sign(dx) * Math.min(1.6, dist); b.warnX = Math.max(ROOM_L + 14, Math.min(ROOM_R - 14, pcx)); b.warn = 1; }
    else if (b.t <= B.axeRise + hang) { const tx = b.warnX - b.w / 2; b.x += Math.sign(tx - b.x) * Math.min(3, Math.abs(tx - b.x)); }
    else {
      b.y += B.axeDrop;
      if (b.y >= floatY) {
        b.y = floatY; b.warn = 0; shake(10, 2); sfx('boomS'); bossDust(b, 8);
        const sp = rage ? B.axeWaveSpeedRage : B.axeWaveSpeed, c = b.x + b.w / 2;
        disShot(c - 12, FLOOR_Y - 11, -sp, 0, 4, B.axeDamage, DIS_SPR.burst); disShot(c + 4, FLOOR_Y - 11, sp, 0, 4, B.axeDamage, DIS_SPR.burst);
        if (rage && !b.rep) { b.rep = 1; b.t = 6; } // enraged: leaps again for a second marked slam
        else { disasterRecover(b, B); b.recT += 12; }
      }
    }
    return;
  }
  if (b.state === 'disScythe') { // one low jumpable crescent that turns around and comes back (sooner when enraged)
    astarteFloat(b, B); b.pose = 'scythe'; b.poseF = 0;
    const wind = rage ? B.scytheWind - 5 : B.scytheWind, hd = disasterMuzzle(b, 'scythe');
    if (b.t === wind) {
      const q = disShot(hd.x - 6, FLOOR_Y - 20, b.face * (rage ? B.waveSpeedRage : B.waveSpeed), 0, 9, B.waveDamage, DIS_SPR.scythe);
      if (q) q.ret = rage ? B.scytheReturn - 16 : B.scytheReturn;
      sfx('swoosh'); b.fireT = 10;
    }
    if (b.t >= wind + 16) disasterRecover(b, B);
    return;
  }
  if (b.state === 'disBow') { // backstep, draw, then a spread aimed at Umine: 2 arrows leave a safe gap, enraged 3 do not
    astarteFloat(b, B); b.pose = b.t < B.bowStep ? 'glide' : 'bow'; b.poseF = b.t < B.bowStep ? -1 : 0;
    if (b.t < B.bowStep) { b.x -= Math.sign(dx || 1) * 1.6; }
    else bossFacePlayer();
    if (b.t === B.bowStep + B.bowWind) {
      const hd = disasterMuzzle(b, 'bow'), ang = Math.atan2(pcy - hd.y, pcx - hd.x);
      for (const sp of (rage ? [-0.26, 0, 0.26] : [-0.17, 0.17])) disShot(hd.x - 4, hd.y - 2, Math.cos(ang + sp) * B.bowSpeed, Math.sin(ang + sp) * B.bowSpeed, 6, B.arrowDamage, DIS_SPR.arrow);
      sfx('arrow'); b.fireT = 10;
    }
    if (b.t >= B.bowStep + B.bowWind + 14) disasterRecover(b, B);
    return;
  }
  if (b.state === 'disWhip') { // whip-sword: dotted reach line on the floor, then a low segmented lash out and back (jump it or stay out of reach)
    astarteFloat(b, B); b.pose = 'whip'; b.poseF = 0;
    const warn = rage ? B.whipWarnRage : B.whipWarn, x0 = disasterMuzzle(b, 'whip').x;
    if (b.t === 1) b.chainReach = rage ? B.whipReachRage : B.whipReach;
    const k = b.t - warn, len = k < 0 ? 0 : k < 10 ? b.chainReach * k / 10 : k < 18 ? b.chainReach : b.chainReach * Math.max(0, 26 - k) / 8;
    if (k === 0) { b.chainB = spawnBullet(x0, FLOOR_Y - 12, 0, 0, 22, B.whipDamage); sfx('swoosh'); }
    if (b.chainB && b.chainB.active && b.chainB.kind === 22) {
      const q = b.chainB, x1 = Math.max(ROOM_L, Math.min(ROOM_R, x0 + b.face * len));
      q.x = Math.min(x0, x1); q.w = Math.max(2, Math.abs(x1 - x0)); q.y = FLOOR_Y - 12; q.h = 8; q.face = b.face;
      if (k >= 26) { q.active = false; b.chainB = null; }
    }
    if (k >= 30) disasterRecover(b, B);
    return;
  }
  if (b.state === 'disLance') { // cannon-spear: charge glow at the muzzle, aim locks, then an orb that bursts into 2 ground shocks
    astarteFloat(b, B); b.pose = 'lance'; b.poseF = 0;
    const ch = rage ? B.lanceChargeRage : B.lanceCharge;
    if (b.t < ch - B.lanceLock) { bossFacePlayer(); b.aimX = pcx; b.aimY = Math.max(pcy, FLOOR_Y - 40); }
    const hd = disasterMuzzle(b, 'lance'); b.mx = hd.x; b.my = hd.y;
    b.aimShow = b.t >= ch - B.lanceLock && b.t < ch;
    if (b.t === ch - B.lanceLock) sfx('tick');
    if (b.t < ch && b.t % 4 === 0) { const h = hash(b.t, 23), a = (h % 628) / 100; spawnPart(hd.x + Math.cos(a) * 12, hd.y + Math.sin(a) * 12, -Math.cos(a) * 0.9, -Math.sin(a) * 0.9, 12, 4, (h >> 9) & 1 ? '#b060ff' : '#ff4c9a'); }
    if (b.t === ch) {
      const base = Math.atan2(b.aimY - hd.y, b.aimX - hd.x);
      for (const sp of (rage ? [-0.2, 0, 0.2] : [0])) disShot(hd.x - 3, hd.y - 3, Math.cos(base + sp) * B.lanceSpeed, Math.sin(base + sp) * B.lanceSpeed, 23, B.orbDamage, DIS_SPR.orb);
      b.x -= b.face * 8; shake(6, 1); sfx('bshoot'); b.fireT = 10; b.aimShow = false;
    }
    if (b.t >= ch + 20) disasterRecover(b, B);
    return;
  }
  if (b.state === 'disRecover') {
    astarteFloat(b, B); b.pose = b.t < 10 && b.weapon ? b.weapon : 'idle'; b.poseF = b.t < 10 ? 0 : -1;
    if (b.t >= b.recT) {
      if (b.comboLeft > 0) { b.comboLeft--; disasterMorph(b, disasterPick(b, dist)); }
      else bossSet('hover');
    }
    return;
  }
  bossSet('hover'); // unknown state (e.g. after the intro)
}

// ---- drawing: weapon icons, morph FX, telegraphs, projectiles ----
// code-drawn alchemy weapons (fallback without art), pointing right from the hand at (0,0). col = main, hi = highlight.
function drawWeaponShape(k, col, hi) {
  const F = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  if (k === 'sword') { F(-3, -1, 4, 3, '#3a1030'); F(1, -3, 2, 7, col); F(3, -1, 20, 3, col); F(23, 0, 3, 1, col); F(4, 0, 18, 1, hi); }
  else if (k === 'spear') { F(-8, 0, 30, 1, '#5a2040'); F(-8, -1, 30, 1, col); F(22, -3, 3, 7, col); F(25, -2, 3, 5, col); F(28, -1, 3, 3, hi); }
  else if (k === 'axe') { F(-4, 0, 22, 2, '#5a2040'); F(14, -9, 4, 20, col); F(18, -8, 3, 18, col); F(21, -6, 2, 14, hi); }
  else if (k === 'scythe') { F(-4, 0, 22, 2, '#5a2040'); F(16, -12, 3, 14, col); for (let i = 0; i < 9; i++) F(16 - i * 2, -12 - Math.round(Math.sin(i / 8 * Math.PI) * 4), 3, 2, i & 1 ? hi : col); }
  else if (k === 'bow') { for (let i = -10; i <= 10; i++) F(4 + Math.round((1 - (i * i) / 100) * 6), i, 2, 1, col); F(4, -10, 1, 21, hi); F(-2, 0, 14, 1, hi); }
  else if (k === 'lance') { F(-6, -1, 14, 3, '#5a2040'); F(6, -4, 6, 9, col); F(12, -3, 10, 7, col); F(22, -2, 6, 5, col); F(28, -1, 3, 3, hi); F(13, -1, 12, 1, hi); }
  else { F(-3, -1, 4, 3, '#3a1030'); for (let i = 0; i < 4; i++) F(2 + i * 5, -1 + (i & 1), 4, 2, i & 1 ? hi : col); F(22, -2, 4, 4, col); }   // whip-sword
}
// alchemic_weapons.png icon with its grip at (hx, hy) (gripNorm per weapon); code shape when there is no icon
function drawDisasterWeapon(k, hx, hy, face, size, col, hi) {
  const W = DISASTER_WEAPONS[k] || DISASTER_WEAPONS.sword, S = SHEETS.alchemicWeapons;
  g.save(); g.translate(Math.round(hx), Math.round(hy)); if (face < 0) g.scale(-1, 1); g.imageSmoothingEnabled = false;
  if (S && W.icon >= 0 && S[W.icon]) g.drawImage(S[W.icon].r, Math.round(-size * W.grip[0]), Math.round(-size * W.grip[1]), size, size);
  else drawWeaponShape(k, col || '#ff376c', hi || '#ffd0dc');
  g.restore();
}
function drawDisasterWeaponLayer(b, mx, by) {
  const st = b.state;
  if (st === 'disMorph') {
    const M = bossRage() ? CONFIG.bosses.disaster.morphFramesRage : CONFIG.bosses.disaster.morphFrames;
    // transform_fx flash at the raised hand (frame 4 of the body sheet)
    const hx = mx + b.face * (DISASTER_WEAPONS.spear.muz[0] - 23 - 8), hy = by - 48 + 16;
    if (SHEETS.transformFx) { const fi = Math.min(3, (b.t * 4 / M) | 0); g.drawImage(pick(SHEETS.transformFx[fi], b.face, false), hx - 12, hy - 12); }
    else { g.save(); g.globalAlpha = 0.25 + 0.15 * ((b.t >> 2) & 1); g.fillStyle = '#9a40ff'; g.beginPath(); g.arc(hx, hy, 14 - (b.t % 10), 0, Math.PI * 2); g.fill(); g.restore(); }
    // next weapon icon above his head (blinks): tells which attack comes
    const iy = by - 46 - 14, W = DISASTER_WEAPONS[b.nextWeapon];
    if ((b.t >> 2) & 1 || b.t > M - 8) {
      if (SHEETS.alchemicWeapons && W && W.icon >= 0) g.drawImage(SHEETS.alchemicWeapons[W.icon].r, mx - 12, iy - 12, 24, 24);
      else { g.save(); g.translate(mx - 12, iy); drawWeaponShape(b.nextWeapon, '#c080ff', '#ffffff'); g.restore(); }
    }
    return;
  }
  if (disasterArt()) return;   // weapons are baked into the body frames
  if (!st.startsWith('dis') || st === 'disRecover' && b.t > 12) return;
  drawDisasterWeapon(b.weapon, mx + b.face * 10, by - 22, b.face, 32);
}
function drawDisasterMarks(b, camX, blink) {
  if (b.state === 'disAxe' && b.warn) { // slam landing mark on the floor
    const x = Math.round(b.warnX - camX), locked = b.t > CONFIG.bosses.disaster.axeRise;
    g.fillStyle = locked ? (blink ? '#ff3a6a' : '#ffd0dc') : '#9a40ff';
    g.fillRect(x - 10, FLOOR_Y - 2, 21, 2); g.fillRect(x - 1, FLOOR_Y - 8, 3, 6);
    if (locked) { g.globalAlpha = 0.18; g.fillRect(x - 10, b.y + b.h, 21, FLOOR_Y - b.y - b.h); g.globalAlpha = 1; }
  }
  if (b.state === 'disWhip') { // reach line along the floor
    const warn = bossRage() ? CONFIG.bosses.disaster.whipWarnRage : CONFIG.bosses.disaster.whipWarn;
    if (b.t < warn) {
      const x0 = disasterMuzzle(b, 'whip').x, x1 = Math.max(ROOM_L, Math.min(ROOM_R, x0 + b.face * b.chainReach));
      g.fillStyle = blink ? '#ff3a6a' : '#b060ff';
      for (let x = Math.min(x0, x1); x < Math.max(x0, x1); x += 4) g.fillRect(Math.round(x - camX), FLOOR_Y - 8, 2, 1);
      g.fillRect(Math.round(x1 - camX) - 1, FLOOR_Y - 12, 2, 9);
    }
  }
  if (b.state === 'disLance') { // charge glow at the cannon muzzle
    const ch = bossRage() ? CONFIG.bosses.disaster.lanceChargeRage : CONFIG.bosses.disaster.lanceCharge;
    if (b.t < ch) { g.save(); g.globalAlpha = 0.5; g.fillStyle = blink ? '#ff4c9a' : '#b060ff'; g.beginPath(); g.arc(Math.round(b.mx - camX), Math.round(b.my), 1 + b.t * 6 / ch, 0, Math.PI * 2); g.fill(); g.restore(); }
  }
}
// disaster_bullets.png sprite (cells face right, centre 12,12)
function drawDisasterBulletSprite(q, camX) {
  const S = SHEETS.disasterBullets, i = q.dspr, cx = Math.round(q.x + q.w / 2 - camX), cy = Math.round(q.y + q.h / 2), f = q.vx < 0 ? -1 : 1;
  if (!S[i]) return;
  if (i === DIS_SPR.burst) { g.drawImage(pick(S[i], f, false), cx - 12, Math.round(q.y + q.h) - 16); return; }   // bottom (y=16) on the floor
  if (i === DIS_SPR.spear || i === DIS_SPR.arrow || i === DIS_SPR.orb) {
    g.save(); g.translate(cx, cy); g.rotate(Math.atan2(q.vy, q.vx)); g.drawImage(S[i].r, -12, -12); g.restore(); return;
  }
  g.drawImage(pick(S[i], f, false), cx - 12, cy - 12);   // sword / scythe crescents
}
// fallback drawing (no bullet sheet) + the whip lash (always code-drawn: its length changes every frame)
function drawDisasterBullet(q, x, y) {
  if (q.kind === 21) { // thrown alchemy spear along its flight direction
    const a = Math.atan2(q.vy, q.vx); g.save(); g.translate(x + q.w / 2, y + q.h / 2); g.rotate(a);
    drawWeaponShape('spear', (frame & 2) ? '#ff376c' : '#ff7aa0', '#ffffff'); g.restore();
  } else if (q.kind === 23) { // cannon orb
    g.fillStyle = (frame & 2) ? '#ff4c9a' : '#b060ff'; g.fillRect(x, y + 1, 7, 5); g.fillRect(x + 1, y, 5, 7); g.fillStyle = '#ffffff'; g.fillRect(x + 2, y + 2, 2, 2);
  } else { // whip-sword lash: blade segments
    for (let i = 0; i < q.w; i += 5) { g.fillStyle = (i / 5) & 1 ? '#ffd0dc' : '#c0204a'; g.fillRect(x + i, y + 2 + ((i / 5) & 1), 4, 3); }
    const tip = q.face > 0 ? x + q.w - 4 : x; g.fillStyle = (frame & 2) ? '#ff376c' : '#ffffff'; g.fillRect(tip, y, 5, 7);
  }
}

// ---- rescued スターさん as support: ALCHEMY MORPH SLASH (HELP button "MORPH") ----
//  t18: sword slash in front (enemies 3 dmg, boss 2) -> t30-43 purple->cyan morph -> t44: spear thrust across the
//  screen ahead (every enemy ahead 2 dmg, boss 2). Total vs a boss: 4 (same as Astarthe's MOON CLEAVE).
function starHitAhead(range, dmgE, dmgB) {
  const x0 = support.x, f = support.face;
  for (const e of enemies) {
    if (!e.alive || !e.active || e.x + e.w < cam.x || e.x > cam.x + VW) continue;
    const ex = e.x + e.w / 2, ahead = (ex - x0) * f;
    if (ahead > -10 && ahead < range) { e.hp -= dmgE; e.flash = 10; spawnPart(ex, e.y + 4, f * 0.6, -0.5, 14, 0, '#72eaff'); if (e.hp <= 0) killEnemy(e); }
  }
  if (bossHittable() && boss.x + boss.w > cam.x && boss.x < cam.x + VW) {
    const bx = boss.x + boss.w / 2, ahead = (bx - x0) * f;
    if (ahead > -14 && ahead < range + 12) { boss.inv = 0; damageBoss(null, dmgB); }
  }
}
function updateStarSupport(t) {
  support.x += (P.x + P.w / 2 - P.face * 20 - support.x) * 0.25; support.y += (P.y - support.y) * 0.25;
  if (t < 30) support.face = P.face;
  if (t === 18) { sfx('swoosh'); shake(6, 1); starHitAhead(84, 3, 2); }
  if (t === 30) sfx('warn');
  if (t === 44) { sfx('bshoot'); sfx('bhit'); shake(10, 2); starHitAhead(VW, 2, 2); }
  if (t >= 72) support.active = false;
}
function drawStarSupport(t, x, y, camX) {
  const fr = SHEETS.starNormal, d = SHEET_DEFS.starNormal, f = support.face;
  if (t < 12) { g.globalAlpha = t / 12; }
  // star.png: 0-1 idle, 6 sword raise (cyan sword baked in) while attacking, 5 wave at the end
  const fi = t < 14 ? (t >> 3) & 1 : t < 58 ? 6 : 5;
  if (fr) g.drawImage(pick(fr[Math.min(fi, fr.length - 1)], f, false), x - (f > 0 ? d.cx : d.fw - d.cx), y - 12);
  else { g.fillStyle = '#3a6ad8'; g.fillRect(x - 6, y - 8, 12, 28); }
  g.globalAlpha = 1;
  const hx = x + f * 10, hy = y + 6, sw = SHEETS.starWeapon;
  if (!fr || t >= 30 && t < 58) { // sword (no sheet) / morph to the spear and the thrust: code-drawn
    g.save(); g.translate(hx, hy); if (f < 0) g.scale(-1, 1);
    if (t < 30) drawWeaponShape('sword', '#5ad8ff', '#e8fbff'); else if (t < 44) drawWeaponShape((t >> 2) & 1 ? 'sword' : 'spear', '#b060ff', '#ffffff'); else drawWeaponShape('spear', '#5ad8ff', '#e8fbff');
    g.restore();
  }
  if (t >= 18 && t < 27 && sw) { // star_weapon.png cyan slash arc, 2x, in front of him
    g.save(); g.translate(hx + f * 14, hy - 4); if (f < 0) g.scale(-1, 1); g.imageSmoothingEnabled = false;
    g.globalAlpha = t < 24 ? 1 : (27 - t) / 3; g.drawImage(sw[1].r, -32, -32, 64, 64); g.restore();
  } else if (t >= 18 && t < 27) { g.strokeStyle = t & 2 ? '#e8fbff' : '#5ad8ff'; g.lineWidth = 3; g.beginPath(); g.arc(hx, hy, Math.min(60, (t - 16) * 9), f > 0 ? -1.1 : Math.PI - 0.6, f > 0 ? 0.6 : Math.PI + 1.1); g.stroke(); }
  if (t >= 30 && t < 44) { g.save(); g.globalAlpha = 0.35; g.fillStyle = (t >> 1) & 1 ? '#9a40ff' : '#5ad8ff'; g.beginPath(); g.arc(hx, hy, 16 - (t - 30), 0, Math.PI * 2); g.fill(); g.restore(); }
  if (t >= 44 && t < 56) { const w = f > 0 ? VW - hx : hx; g.fillStyle = t & 2 ? '#e8fbff' : '#5ad8ff'; g.fillRect(f > 0 ? hx : 0, hy - 2, w, 4); g.fillStyle = '#ffffff'; g.fillRect(f > 0 ? hx : 0, hy - 1, w, 1); }
}
