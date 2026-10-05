
// =====================================================================
//  FINAL AREA: 闇海音 DARK UMINE - after the boss rush, before 清掃員カナタ.
//  Kanata's mimic copied Umine's shadow. A mirror of Umine: water shots, a charge shot with an aim line,
//  a jump over Umine with a gap fan (+ floor ripples when enraged), and a dark Umimi that drops water on floor marks.
//  Placeholder art: umine_dark.png = shadow-tinted kanon.png (same 32x32 frames), umine_dark_face.png.
//  ?darkumine=1 starts here (with ?area=9&boss=1). Dying against Kanata never sends you back to her (FINAL.phase checkpoint).
// =====================================================================
BOSS_TYPES.darkumine = { hud: 'DARK UMINE', speaker: '闇海音', speakerColor: '#c8a0ff', line: '', face: 'face_umine_dark',
  clearEn: 'DARK UMINE', clearJp: '', dark: 'umineDark', normal: 'umineDark', w: 12, h: 24,
  aura: ['#1a0828', '#6a3ab0'], sparkle: '#c8e8ff', dust: '#8a7aa8' };
BOSS_AI.darkumine = aiDarkUmine;
Object.assign(BULLET_SIZE, { 40: [6, 4], 41: [12, 12], 42: [10, 8], 43: [6, 8] }); // 40 dark water shot, 41 charge orb, 42 floor ripple, 43 Umimi drop
const DARK_SPEAKER = { name: '闇海音', color: '#c8a0ff', face: 'face_umine_dark' };
const DU_OPTS = ['shots', 'charge', 'jump', 'umimi'];
const DU = { umimi: null, spr: null };   // dark Umimi helper {x, y, a, t, out}
function duReset() { DU.umimi = null; if (boss) boss.dodgeCD = 0; }
function duNext(b, B) { bossSet('hover'); b.wait = (b.pr = bossRage()) ? B.idleFramesRage : B.idleFrames; if (Math.random() < (b.pr ? B.comboChanceRage : B.comboChance)) b.wait = 8; }
function duChoose(b, B) {
  let p = pickPattern(DU_OPTS); bossFacePlayer(); b.shots = 0; b.aimShow = false;
  if (p === 'umimi' && DU.umimi) p = 'charge';
  b.last = p; bossSeen(p);
  if (p === 'shots') bossSet('duShots');
  else if (p === 'charge') { bossSet('duCharge'); sfx('warn'); }
  else if (p === 'jump') { bossSet('duJumpWind'); }
  else { bossSet('duSummon'); sfx('warn'); }
}
function duShot(b, B, vx, vy, kind, dmg) { bossMuzzle(b, 19, 15); const sz = BULLET_SIZE[kind]; return spawnBullet(b.mx - sz[0] / 2, b.my - sz[1] / 2, vx, vy, kind, dmg); }
function aiDarkUmine(b, B, pcx, pcy) {
  const bcx = b.x + b.w / 2, dist = Math.abs(pcx - bcx), rage = bossRage();
  if (b.gMarks) { for (const mk of b.gMarks) mk.t--; b.gMarks = b.gMarks.filter(mk => mk.t > -4); if (!b.gMarks.length) b.gMarks = null; }
  duUpdateUmimi(b, B);
  switch (b.state) {
    case 'hover': { // keeps a mid distance like Umine would, then picks a move
      bossFacePlayer(); bossFall(b); b.aimShow = false;
      let mv = 0;
      if (dist < B.keepMin) mv = -b.face; else if (dist > B.keepMax) mv = b.face;
      if (mv < 0 && ((b.face > 0 && b.x <= ROOM_L + 4) || (b.face < 0 && b.x + b.w >= ROOM_R - 4))) mv = 0;
      b.x += mv * B.walkSpeed; b.pose = mv ? 'run' : 'idle'; b.poseF = -1;
      if (b.dodgeCD > 0) b.dodgeCD--;
      if (b.onGround && !(b.dodgeCD > 0) && shots.some(s => s.active && Math.sign(s.vx) === Math.sign(bcx - s.x) && Math.abs(bcx - s.x) < 44)) { // hops over Umine's shots, like Umine would
        b.vy = -B.dodgeVel; b.onGround = false; b.y -= 1; b.dodgeCD = rage ? B.dodgeCDRage : B.dodgeCD; bossSeen('dodge'); b.dodgeShot = true;
      }
      if (b.dodgeShot && !b.onGround && b.vy >= -0.5) { // jump shot at the apex, aimed at Umine
        b.dodgeShot = false; bossFacePlayer(); bossMuzzle(b, 19, 15); const dx = pcx - b.mx, dy = pcy - b.my, d = Math.hypot(dx, dy) || 1;
        spawnBullet(b.mx - 3, b.my - 2, dx / d * B.shotSpeed, dy / d * B.shotSpeed, 40, B.shotDamage); sfx('shoot');
      }
      if (!b.onGround) { b.pose = b.vy < 0 ? 'jump' : 'fall'; b.poseF = -1; }
      if (b.wait === undefined) b.wait = B.idleFrames;
      if (b.t >= b.wait && b.onGround) duChoose(b, B);
      break; }
    case 'duShots': { // staff glint, then a volley of straight water shots at her staff height (jump them)
      bossFall(b); bossFacePlayer(); b.pose = 'shoot'; b.poseF = -1;
      const n = b.pr ? B.shotCountRage : B.shotCount, at = B.shotWind + b.shots * B.shotGap;
      if (b.t < B.shotWind && b.t % 4 === 0) { bossMuzzle(b, 19, 15); spawnPart(b.mx, b.my, 0, 0, 8, 3, (b.t & 4) ? '#c8a0ff' : '#ffffff'); }
      if (b.t === B.shotWind - 12) sfx('tink');
      if (b.shots < n && b.t === at) { duShot(b, B, b.face * B.shotSpeed, 0, 40, B.shotDamage); b.shots++; sfx('shoot'); }
      if (b.shots >= n && b.t > at + 14) duNext(b, B);
      break; }
    case 'duCharge': { // dark water gathers at the staff + dotted aim line that locks before the big orb flies
      bossFall(b); b.pose = 'shoot'; b.poseF = -1;
      const wind = b.shots === 0 ? (b.pr ? B.chargeWindRage : B.chargeWind) : B.chargeWind2, n = b.pr ? 2 : 1;
      bossMuzzle(b, 19, 15);
      if (b.t < wind - B.chargeLock) { bossFacePlayer(); b.aimX = pcx; b.aimY = Math.min(FLOOR_Y - 6, pcy); }
      b.aimShow = b.t < wind; b.chargeK = Math.min(1, b.t / wind);
      if (b.t % 3 === 0 && b.t < wind) { const h = hash(b.t, 31), a = (h % 628) / 100; spawnPart(b.mx + Math.cos(a) * 14, b.my + Math.sin(a) * 14, -Math.cos(a) * 0.9, -Math.sin(a) * 0.9, 14, 4, (h >> 4) & 1 ? '#6a3ab0' : '#c8a0ff'); }
      if (b.t === wind - B.chargeLock) sfx('tink');
      if (b.t === wind) {
        const dx = b.aimX - b.mx, dy = b.aimY - b.my, d = Math.hypot(dx, dy) || 1;
        duShot(b, B, dx / d * B.chargeSpeed, dy / d * B.chargeSpeed, 41, B.chargeDamage); sfx('bshoot'); shake(4, 1); b.aimShow = false; b.chargeK = 0; b.shots++;
      }
      if (b.t > wind + 16) { if (b.shots < n) { b.t = 0; } else duNext(b, B); }
      break; }
    case 'duJumpWind': { // crouch flash, landing mark beyond Umine
      bossFall(b); bossFacePlayer(); b.pose = 'idle'; b.poseF = 0;
      if (b.t === 1) {
        const side = pcx >= bcx ? 1 : -1; let lx = pcx + side * B.jumpPast - b.w / 2;
        if (lx < ROOM_L + 8 || lx + b.w > ROOM_R - 8) lx = pcx - side * B.jumpPast - b.w / 2; // no room behind Umine: short hop back
        b.leapX = Math.max(ROOM_L + 8, Math.min(ROOM_R - 8 - b.w, lx));
        b.gMarks = [{ x: b.leapX + b.w / 2, t: B.jumpWind + B.jumpAir }];
      }
      if (b.t < B.jumpWind && (b.t & 2)) b.flash = Math.max(b.flash, 1);
      if (b.t >= B.jumpWind) { b.vy = -B.jumpVel; b.vx = (b.leapX - b.x) / B.jumpAir; b.onGround = false; b.y -= 1; b.fired = false; bossSet('duJump'); sfx('jump'); }
      break; }
    case 'duJump': {
      b.x += b.vx; b.pose = b.vy < 0 ? 'jump' : 'fall'; b.poseF = -1;
      if (!b.fired && b.vy >= -0.4) { // apex: fan aimed at Umine with the gap on her (standing still is safe)
        b.fired = true; bossFacePlayer(); b.pose = 'shoot'; bossMuzzle(b, 19, 15);
        const base = Math.atan2(pcy - b.my, pcx - b.mx), offs = b.pr ? [-0.62, -0.31, 0.31, 0.62] : [-0.34, 0.34];
        for (const o of offs) spawnBullet(b.mx - 3, b.my - 2, Math.cos(base + o) * B.fanSpeed, Math.sin(base + o) * B.fanSpeed, 40, B.shotDamage);
        sfx('shoot');
      }
      if (bossFall(b)) {
        b.x = b.leapX; b.vx = 0; sfx('land'); bossDust(b, 6); shake(5, 1);
        for (const d of (b.pr ? [-1, 1] : [b.face])) { const q = spawnBullet(b.x + b.w / 2 - 5 + d * 6, FLOOR_Y - 8, d * B.rippleSpeed, 0, 42, B.rippleDamage); if (q) q.life = 160; }
        bossSet('duLand');
      }
      break; }
    case 'duLand': bossFall(b); b.pose = 'idle'; b.poseF = -1; if (b.t > B.recover) duNext(b, B); break;
    case 'duSummon': { // raises the staff: a dark Umimi appears and drops water on marked spots, one by one
      bossFall(b); bossFacePlayer(); b.pose = 'shoot'; b.poseF = -1;
      if (b.t === 20) {
        const n = b.pr ? B.dropCountRage : B.dropCount, xs = [];
        const lo = ROOM_L + 20, hi = ROOM_R - 20, c = Math.max(lo, Math.min(hi, pcx)), dir = c < (ROOM_L + ROOM_R) / 2 ? 1 : -1;
        for (let i = 0; i < n; i++) xs.push(Math.max(lo, Math.min(hi, c + dir * (i === 0 ? 0 : (i % 2 ? 1 : -1) * Math.ceil(i / 2) * B.dropGapX))));
        b.gMarks = xs.map((x, i) => ({ x, t: B.dropFirst + i * B.dropEvery, drop: true }));
        DU.umimi = { x: xs[0], y: FLOOR_Y - 104, a: 0, t: 0, out: false };
        for (let i = 0; i < 10; i++) spawnPart(xs[0], FLOOR_Y - 96, DIR8X[i & 7] * 1.2, DIR8Y[i & 7] * 1.2, 22, 0, i & 1 ? '#6a3ab0' : '#c8a0ff');
        sfx('swoosh');
      }
      if (b.t >= 50 && (b.t - 50) % B.summonShotGap === 0 && (b.t - 50) / B.summonShotGap < (b.pr ? 3 : 2)) { duShot(b, B, b.face * B.shotSpeed, 0, 40, B.shotDamage); sfx('shoot'); } // keeps shooting while Umimi works
      if (b.t > 20 && !b.gMarks) { if (DU.umimi) DU.umimi.out = true; duNext(b, B); }
      break; }
  }
}
// dark Umimi: floats to the next mark, drops a water ball that lands exactly when the mark runs out
function duUpdateUmimi(b, B) {
  const U = DU.umimi; if (!U) return;
  U.t++;
  if (U.out || b.state === 'rescue') { U.a -= 0.05; if (U.a <= 0) DU.umimi = null; return; }
  U.a = Math.min(1, U.a + 0.08);
  const next = b.gMarks && b.gMarks.find(mk => mk.drop && !mk.done);
  if (next) {
    U.x += Math.max(-3, Math.min(3, next.x - U.x)); U.y = FLOOR_Y - 104 + Math.sin(U.t * 0.12) * 2;
    if (next.t <= 4) next.done = true; // too late to drop (never happens with the default spacing)
    else if (next.t <= B.dropFall && Math.abs(next.x - U.x) < 4) {
      next.done = true; const q = spawnBullet(next.x - 3, U.y + 8, 0, 0, 43, B.dropDamage); if (q) q.g = 2 * (FLOOR_Y - 4 - (U.y + 12)) / (next.t * next.t || 1);
      sfx('tink');
    }
  } else U.y = FLOOR_Y - 104 + Math.sin(U.t * 0.12) * 2;
}
function duUmimiSprites() {
  if (DU.spr || !SHEETS.umimi) return DU.spr;
  DU.spr = SHEETS.umimi.map(fr => sheetSprite(tintCanvas(fr.r, '#1a0828', 0.62)));
  return DU.spr;
}
function drawDarkUmineWorld(camX) {
  const b = boss, U = DU.umimi;
  if (b.gMarks) drawFinalMarks(camX, b.gMarks, b.state === 'duJumpWind' || b.state === 'duJump' ? '#b07aff' : '#c8a0ff');
  if (b.chargeK > 0 && b.state === 'duCharge') { // dark charge orb at the staff
    const r = 2 + b.chargeK * 5 + Math.sin(frame * 0.5), x = Math.round(b.mx - camX), y = Math.round(b.my);
    g.globalAlpha = 0.4; g.fillStyle = '#6a3ab0'; g.beginPath(); g.arc(x, y, r + 3, 0, 6.283); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#2a1040'; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.fillStyle = '#c8a0ff'; g.fillRect(x - 1, y - 1, 2, 2);
  }
  if (U && U.a > 0) {
    const S = duUmimiSprites(), x = Math.round(U.x - camX), y = Math.round(U.y);
    g.globalAlpha = U.a;
    if (S) g.drawImage(S[Math.min(S.length - 1, 2 + ((U.t >> 3) & 1))].r, x - 16, y - 16);
    else { g.fillStyle = '#3a2058'; g.fillRect(x - 6, y - 6, 12, 12); }
    g.globalAlpha = 1;
  }
}
function drawDarkUmineBullet(q, camX) {
  const x = Math.round(q.x + q.w / 2 - camX), y = Math.round(q.y + q.h / 2), d = q.vx >= 0 ? 1 : -1;
  if (q.kind === 40) { // dark water shot (mirror of Umine's)
    g.fillStyle = '#1a0828'; g.fillRect(x - 4, y - 3, 8, 6);
    g.fillStyle = (frame & 4) ? '#8a5ad8' : '#b890ff'; g.fillRect(x - 3, y - 2, 6, 4);
    g.fillStyle = '#ffffff'; g.fillRect(x + d * 1, y - 1, 2, 2);
  } else if (q.kind === 41) { // charge orb
    g.globalAlpha = 0.45; g.fillStyle = '#8a5ad8'; g.beginPath(); g.arc(x, y, 9 + Math.sin(frame * 0.6), 0, 6.283); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#2a1040'; g.beginPath(); g.arc(x, y, 6, 0, 6.283); g.fill();
    g.fillStyle = '#c8a0ff'; g.beginPath(); g.arc(x - 1, y - 1, 3, 0, 6.283); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 3, 2, 2);
  } else if (q.kind === 42) { // floor ripple
    const h = 6 + ((q.t >> 2) & 1);
    g.fillStyle = '#3a1a60'; g.fillRect(x - 5, FLOOR_Y - h, 10, h); g.fillStyle = '#9a6ae8'; g.fillRect(x - 4, FLOOR_Y - h, 8, 2); g.fillStyle = '#ffffff'; g.fillRect(x - 1 + d * 2, FLOOR_Y - h, 2, 1);
  } else { // Umimi's water drop
    g.fillStyle = '#2a1040'; g.fillRect(x - 3, y - 2, 6, 6); g.fillRect(x - 2, y - 4, 4, 2); g.fillRect(x - 1, y - 5, 2, 1);
    g.fillStyle = '#b890ff'; g.fillRect(x - 2, y - 1, 2, 3);
  }
}
// story: intro after the rush, retry line, defeat (she fades back into Umine) -> 清掃員カナタ
function duIntroLines() {
  FINAL.duMet = true;
  finalSay(KANATA_SPEAKER, '…はぁ。影たち、全部やっつけちゃった。…じゃあ次は、この子。ミミックが映した、あなたの影。', 210);
  FINAL.queue = [[DARK_SPEAKER, '……わたしは、あなた。あなたの「こわい」や「さみしい」から、生まれたの。', 200],
    [UMINE_SPEAKER, 'わたしの…影？ …うん。にげないで、ちゃんと向き合うね！', 180]];
}
function duRescue(b) {
  b.poseF = -1; b.aimShow = false; b.gMarks = null; b.chargeK = 0;
  b.pose = b.t < 60 ? 'hurt' : 'idle';
  if (b.y + b.h < FLOOR_Y) b.y = Math.min(FLOOR_Y - b.h, b.y + 1.2);
  if (b.t === 1) { FINAL.queue = null; finalSay(DARK_SPEAKER, '……あったかい。…ねえ、あなたの中に、帰っても…いい？', 150); }
  if (b.t === 120) finalSay(UMINE_SPEAKER, 'うん。こわいのも、さみしいのも…ぜんぶ、わたしだもん。おかえり。', 160);
  if (b.t > 60 && b.t < 120) bossFacePlayer();
  if (b.t >= 150) { b.alpha = Math.max(0, 1 - (b.t - 150) / 50); b.hidden = b.alpha <= 0.02; }
  if (b.t >= 150 && b.t < 210 && b.t % 2 === 0) { // light drifts from her into Umine
    const h = hash(b.t, 53), sx = b.x + (h % (b.w + 8)) - 4, sy = b.y + ((h >> 8) % b.h), tx = P.x + P.w / 2, ty = P.y + P.h / 2;
    spawnPart(sx, sy, (tx - sx) / 24, (ty - sy) / 24, 24, 4, (h >> 4) & 1 ? '#c8e8ff' : '#ffffff');
  }
  if (b.t === 150) sfx('rescue');
  if (b.t >= 300 && P.onGround && !P.dead) {
    P.hp = playerMaxHP(); magic.mp = CONFIG.magicMaxMP; P.inv = 0; sfx('heal');
    for (let i = 0; i < 10; i++) spawnPart(P.x + P.w / 2, P.y + P.h / 2, DIR8X[i & 7] * 1.1, DIR8Y[i & 7] * 1.1 - 0.4, 26, 5, i & 1 ? '#8fffb0' : '#ffffff');
    duReset(); FINAL.phase = 'kanata'; curArea.boss = 'kanata'; finalSpawnBoss();
    finalSay(KANATA_SPEAKER, '…へえ。自分の影と、仲直りしちゃった。…めんどくさいけど、お掃除の時間。', 220);
  }
  return true;
}
