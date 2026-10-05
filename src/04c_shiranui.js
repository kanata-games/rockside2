
// =====================================================================
//  AREA 7  狐火の社 FOXFIRE SHRINE - boss DARK シラヌイ (Shiranui, an oiran-style fox lady who speaks
//  archaic "noja" Japanese: わらわ / おぬし / 〜のじゃ). Floats; every attack starts from a readable pose
//  (fan raised = sprite frame 4, with a glow above her head in the attack's colour), then the attack's own telegraph:
//    volley    3 aimed foxfires (enraged 5) that home a little right after the throw
//    wisp      purple will-o-wisps orbit her first, then drift at Umine one by one (slow homing)
//    crescent  flame crescent along the floor (jump it); enraged: a second, faster one
//    fan       spinning fan boomerang: out LOW (jump it), back HIGH over Umine's head (enraged: back low too)
//    pillar    ember marks on the floor (Umine's spot + 1 more, enraged +2), then fire pillars erupt there
//    illusion  vanishes (blinking illusion frame), reappears blinking with 2 clones; shoot a clone to pop it;
//              everyone left throws a foxfire (enraged: 2 each)
//  Tuning: CONFIG.bosses.shiranui. Art: assets/shiranui_dark.png (+ .json), shiranui_bullets.png, shiranui_bullets_pillar.png.
// =====================================================================
const SHIRANUI_PATS = ['volley', 'wisp', 'crescent', 'fan', 'pillar', 'illusion'];
const SH_STATE = { volley: 'shVolley', wisp: 'shWisp', crescent: 'shCrescent', fan: 'shFan', pillar: 'shPillar', illusion: 'shIllusion' };
const SH_GLOW = { shVolley: '#ffa040', shCrescent: '#ff4030', shFan: '#c02040', shPillar: '#ffd060', shWisp: '#b070ff' };
// fan tip (frame 5) in world space
function shiranuiTip(b) { const D = SHEET_DEFS.shiranuiDark; return { x: b.x + b.w / 2 + b.face * (D.muzX - D.cx), y: b.y + b.h + b.hopY - D.fh + D.muzY }; }
function shiranuiPick(b) {
  const unseen = SHIRANUI_PATS.filter(k => !b.seen.includes(k) && k !== b.last);
  return unseen.length && Math.random() < 0.6 ? pickPattern([unseen[(Math.random() * unseen.length) | 0]]) : pickPattern(SHIRANUI_PATS);
}
function shiranuiRecover(b, B) { b.recT = bossRage() ? B.recoverRage : B.recover; b.blink = false; bossSet('shRecover'); }
function shiranuiStart(b, pat) { bossFacePlayer(); sfx('warn'); bossSet(SH_STATE[pat]); }

// ---- per-bullet hooks (run first in updateBullets; return true = bullet finished this frame) ----
function shSteer(q, tx, ty, speed, turn) {
  const a = Math.atan2(q.vy, q.vx), want = Math.atan2(ty - (q.y + q.h / 2), tx - (q.x + q.w / 2));
  let d = want - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  const na = a + Math.max(-turn, Math.min(turn, d)); q.vx = Math.cos(na) * speed; q.vy = Math.sin(na) * speed;
}
function shHomeHook(q) { if (q.t <= q.homeT && !P.dead) shSteer(q, P.x + P.w / 2, P.y + P.h / 2, q.spd, q.turn); return false; }
function shWispHook(q) {
  if (!q.rel) {
    if (boss.state !== 'shWisp') { q.rel = true; q.t = 0; const a = Math.atan2(P.y - q.y, P.x - q.x); q.vx = Math.cos(a) * q.spd; q.vy = Math.sin(a) * q.spd; return false; }
    q.ang += 0.09; q.rad = Math.min(q.rad + 1.2, 26);
    q.x = boss.x + boss.w / 2 + Math.cos(q.ang) * q.rad - q.w / 2; q.y = boss.y + boss.h / 2 - 6 + Math.sin(q.ang) * q.rad * 0.8 - q.h / 2; q.vx = 0; q.vy = 0;
    return false;
  }
  return shHomeHook(q);
}
function shFanHook(q) {
  const B = CONFIG.bosses.shiranui;
  if (!q.back) {
    q.vx -= q.f * B.fanDecel;
    if ((q.f > 0 && q.x + q.w > ROOM_R - 2) || (q.f < 0 && q.x < ROOM_L + 2)) q.vx = -q.f * Math.abs(q.vx) * 0.5;
    if (Math.sign(q.vx) !== q.f) { q.back = true; sfx('swoosh'); }
  } else {
    q.vx = -q.f * Math.min(B.fanSpeed, Math.abs(q.vx) + B.fanDecel);
    q.y += (q.backY - q.y) * 0.12;
    const bc = boss.x + boss.w / 2;
    if ((q.x + q.w / 2 - bc) * q.f <= 0 || q.t > 260 || boss.state === 'rescue') { q.active = false; return true; } // caught
  }
  return false;
}
function shSpawn(x, y, vx, vy, kind, dmg, spr) { const q = spawnBullet(x, y, vx, vy, kind, dmg); if (q) q.sspr = spr; return q; }
function shFoxfire(x, y, ang, B, speed, home) {
  const q = shSpawn(x - 4, y - 4, Math.cos(ang) * speed, Math.sin(ang) * speed, 24, B.foxDamage, 0);
  if (q && home) { q.hook = shHomeHook; q.homeT = home; q.spd = speed; q.turn = B.foxTurn; }
  return q;
}

// ---- AI ----
function aiShiranui(b, B, pcx, pcy) {
  const rage = bossRage(), cx = b.x + b.w / 2, dx = pcx - cx, dist = Math.abs(dx);
  if (b.state === 'hover') {
    astarteFloat(b, B); bossFacePlayer(); b.blink = false;
    const ideal = 92, sp = rage ? 1.0 : 0.8;
    if (dist > ideal + 14) b.x += Math.sign(dx) * sp; else if (dist < ideal - 20 && dist > 2) b.x -= Math.sign(dx) * sp;
    b.x = Math.max(ROOM_L + 4, Math.min(ROOM_R - b.w - 4, b.x));
    b.pose = Math.abs(dist - ideal) > 16 ? 'glide' : 'idle'; b.poseF = -1;
    if (b.t >= (rage ? B.idleFramesRage : B.idleFrames)) { b.comboLeft = Math.random() < (rage ? B.comboChanceRage : B.comboChance) ? 1 : 0; shiranuiStart(b, shiranuiPick(b)); }
    return;
  }
  if (b.state === 'shVolley') { // fan raised (glow) -> throws N foxfires at Umine, each homes briefly
    astarteFloat(b, B);
    const wind = rage ? B.volleyWindRage : B.volleyWind, n = rage ? B.volleyCountRage : B.volleyCount;
    b.pose = 'attack'; b.poseF = b.t < wind ? 0 : 1;
    if (b.t < wind) bossFacePlayer();
    const k = b.t - wind;
    if (k >= 0 && k % B.volleyGap === 0 && k / B.volleyGap < n) {
      const tp = shiranuiTip(b), i = k / B.volleyGap, a = Math.atan2(pcy - tp.y, pcx - tp.x) + (i - (n - 1) / 2) * 0.22;
      shFoxfire(tp.x, tp.y, a, B, B.foxSpeed, B.foxHome); sfx('bshoot'); b.fireT = 8;
    }
    if (k >= n * B.volleyGap + 14) shiranuiRecover(b, B);
    return;
  }
  if (b.state === 'shWisp') { // wisps gather and orbit her, then drift at Umine one by one
    astarteFloat(b, B); bossFacePlayer(); b.pose = 'idle'; b.poseF = 1;
    const n = rage ? B.wispCountRage : B.wispCount, gap = rage ? B.wispGapRage : B.wispGap;
    if (b.t === 1) {
      b.wisps.length = 0;
      for (let i = 0; i < n; i++) { const q = shSpawn(cx, b.y + b.h / 2, 0, 0, 25, B.wispDamage, 2); if (q) { q.hook = shWispHook; q.ang = i * Math.PI * 2 / n; q.rad = 0; q.rel = false; q.spd = B.wispSpeed; q.homeT = B.wispHome; q.turn = B.wispTurn; b.wisps.push(q); } }
      sfx('cp');
    }
    const k = b.t - B.wispOrbit;
    if (k >= 0 && k % gap === 0) {
      const i = k / gap, q = b.wisps[i];
      if (q && q.active && q.kind === 25 && !q.rel) { q.rel = true; q.t = 0; const a = Math.atan2(pcy - q.y, pcx - q.x); q.vx = Math.cos(a) * q.spd; q.vy = Math.sin(a) * q.spd; sfx('arrow'); }
      if (i >= n - 1) { b.wisps.length = 0; shiranuiRecover(b, B); }
    }
    return;
  }
  if (b.state === 'shCrescent') { // flame crescent along the floor (jump); enraged: a second faster one
    astarteFloat(b, B);
    const wind = rage ? B.crescentWindRage : B.crescentWind, sp = rage ? B.crescentSpeedRage : B.crescentSpeed;
    b.pose = 'attack'; b.poseF = b.t < wind || (rage && b.t >= wind + 10 && b.t < wind + B.crescentGap) ? 0 : 1;
    if (b.t < wind) bossFacePlayer();
    const tp = shiranuiTip(b);
    if (b.t === wind) { shSpawn(tp.x - 6, FLOOR_Y - 20, b.face * sp, 0, 9, B.crescentDamage, 3); sfx('swoosh'); b.fireT = 10; }
    if (rage && b.t === wind + B.crescentGap) { shSpawn(tp.x - 6, FLOOR_Y - 20, b.face * (sp + 0.5), 0, 9, B.crescentDamage, 3); sfx('swoosh'); b.fireT = 10; }
    if (b.t >= wind + (rage ? B.crescentGap + 14 : 16)) shiranuiRecover(b, B);
    return;
  }
  if (b.state === 'shFan') { // spinning fan boomerang: out low (jump), back high (enraged: back low too)
    astarteFloat(b, B);
    const wind = rage ? B.fanWindRage : B.fanWind;
    b.pose = 'attack'; b.poseF = b.t < wind ? 0 : 1;
    if (b.t < wind) bossFacePlayer();
    if (b.t === wind) {
      const tp = shiranuiTip(b), q = shSpawn(tp.x - 7, FLOOR_Y - 16, b.face * B.fanSpeed, 0, 27, B.fanDamage, 4);
      if (q) { q.hook = shFanHook; q.f = b.face; q.back = false; q.backY = rage ? FLOOR_Y - 16 : FLOOR_Y - 48; b.fanB = q; }
      sfx('swoosh'); b.fireT = 10;
    }
    if (b.t > wind) { b.pose = 'idle'; b.poseF = -1; }
    if (b.t > wind + 10 && (!b.fanB || !b.fanB.active || b.fanB.kind !== 27 || b.t > wind + 240)) { b.fanB = null; shiranuiRecover(b, B); }
    return;
  }
  if (b.state === 'shPillar') { // ember marks on the floor, then fire pillars erupt there
    astarteFloat(b, B);
    const warn = rage ? B.pillarWarnRage : B.pillarWarn, n = rage ? B.pillarCountRage : B.pillarCount;
    b.pose = 'attack'; b.poseF = b.t < warn ? 0 : 1;
    if (b.t === 1) {
      const clamp = x => Math.max(ROOM_L + 10, Math.min(ROOM_R - 10, x)), side = Math.random() < 0.5 ? -1 : 1;
      b.pillars = [clamp(pcx)];
      if (n >= 2) b.pillars.push(clamp(pcx + side * B.pillarGap));
      if (n >= 3) b.pillars.push(clamp(pcx - side * B.pillarGap));
      sfx('tick');
    }
    if (b.t === warn) {
      for (const x of b.pillars) { const q = shSpawn(x - 6, FLOOR_Y - 38, 0, 0, 28, B.pillarDamage, -1); if (q) q.life = B.pillarLife; }
      shake(8, 2); sfx('boomS'); b.fireT = 10;
    }
    if (b.t >= warn + B.pillarLife) { b.pillars = []; shiranuiRecover(b, B); }
    return;
  }
  if (b.state === 'shIllusion') { // vanish -> hidden -> reappear blinking with 2 clones -> everyone throws a foxfire
    const V = B.illusionVanish, H = V + B.illusionHidden, blinkT = rage ? B.illusionBlinkRage : B.illusionBlink, A = H + blinkT;
    astarteFloat(b, B); b.pose = 'vanish'; b.poseF = 0;
    if (b.t < V) { b.blink = true; if (b.t === 1) sfx('swoosh'); }
    else if (b.t === V) { b.hidden = true; b.blink = false; }
    else if (b.t === H) {
      const slots = [ROOM_L + 36, (ROOM_L + ROOM_R) / 2, ROOM_R - 36].map(x => x + (Math.random() - 0.5) * 16), real = (Math.random() * 3) | 0;
      // never right on top of Umine: push slots away from her
      for (let i = 0; i < 3; i++) if (Math.abs(slots[i] - pcx) < 34) slots[i] = pcx + (slots[i] < pcx ? -34 : 34);
      b.x = Math.max(ROOM_L + 2, Math.min(ROOM_R - b.w - 2, slots[real] - b.w / 2));
      b.clones = slots.filter((_, i) => i !== real).map(x => ({ x: Math.max(ROOM_L + 2, Math.min(ROOM_R - b.w - 2, x - b.w / 2)), alive: true }));
      b.hidden = false; b.blink = true; bossFacePlayer(); sfx('swoosh');
      for (const s of [{ x: b.x }, ...b.clones]) for (let i = 0; i < 6; i++) spawnPart(s.x + b.w / 2, b.y + b.h / 2, DIR8X[i] * 1.2, DIR8Y[i] * 1.2, 16, 0, i & 1 ? '#b070ff' : '#ff6a4a');
    } else if (b.t > H && b.t < A) {
      bossFacePlayer();
      for (const c of b.clones) { // a water shot pops a clone
        if (!c.alive) continue;
        const box = { x: c.x, y: b.y, w: b.w, h: b.h };
        for (const s of shots) if (s.active && overlap(s, box)) { s.active = false; c.alive = false; popAt(c.x + b.w / 2, b.y + b.h / 2, '#b070ff'); sfx('pop'); break; }
      }
    } else if (b.t === A) {
      b.blink = false; b.pose = 'attack'; b.poseF = 1;
      const shooters = [b.x, ...b.clones.filter(c => c.alive).map(c => c.x)];
      for (const sx of shooters) {
        const f = pcx < sx + b.w / 2 ? -1 : 1, tx = sx + b.w / 2 + f * 14, ty = b.y + b.h - 48 + 24, a = Math.atan2(pcy - ty, pcx - tx);
        for (const sp of (rage ? [-0.14, 0.14] : [0])) shFoxfire(tx, ty, a + sp, { foxDamage: B.illusionDamage, foxTurn: 0 }, B.illusionSpeed, 0);
      }
      sfx('bshoot'); b.fireT = 10;
    }
    if (b.t > A) { b.pose = 'attack'; b.poseF = 1; }
    if (b.t >= A + 16) { b.clones = []; shiranuiRecover(b, B); }
    return;
  }
  if (b.state === 'shRecover') {
    astarteFloat(b, B); b.pose = 'idle'; b.poseF = -1; b.blink = false; b.hidden = false;
    if (b.t >= b.recT) {
      if (b.comboLeft > 0) { b.comboLeft--; shiranuiStart(b, shiranuiPick(b)); }
      else bossSet('hover');
    }
    return;
  }
  bossSet('hover');
}

// ---- drawing ----
const SHIRANUI_RED = {};   // red hit-flash copies per frame
function shiranuiRedFrame(sh, fi, face) {
  if (!SHIRANUI_RED[fi]) { const c = tintCanvas(sh[fi].r, '#ff2a40', 0.65); SHIRANUI_RED[fi] = { r: c, l: flipCanvas(c) }; }
  return face >= 0 ? SHIRANUI_RED[fi].r : SHIRANUI_RED[fi].l;
}
function drawShiranuiBody(b, sh, D, fi, mx, by, camX) {
  if (b.blink && (frame & 2)) return;            // illusion blink
  const red = b.flash > 0 && (b.flash & 2) && b.state !== 'rescue', ox = b.face >= 0 ? D.cx : D.fw - D.cx;
  const img = red ? shiranuiRedFrame(sh, fi, b.face) : pick(sh[fi], b.face, b.state === 'rescue' && b.t < 70 && (b.t & 4) !== 0);
  g.drawImage(img, mx - ox, by - D.fh);
  for (const c of (b.state === 'shIllusion' ? b.clones : [])) if (c.alive) g.drawImage(pick(sh[fi], b.face, false), Math.round(c.x + b.w / 2 - camX) - ox, by - D.fh);
}
function drawShiranuiMarks(b, camX, blink) {
  const glow = SH_GLOW[b.state];
  if (glow && b.pose === 'attack' && b.poseF === 0 || b.state === 'shWisp' && b.t < 20) { // wind-up glow above her raised fan
    const x = Math.round(b.x + b.w / 2 - camX + b.face * 6), y = Math.round(b.y + b.h - 46), r = 3 + ((frame >> 2) & 1) * 2;
    g.save(); g.globalAlpha = 0.45; g.fillStyle = glow; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 0.9; g.fillStyle = '#fff0d0'; g.fillRect(x - 1, y - 1, 2, 2); g.restore();
  }
  if (b.state === 'shPillar' && b.pillars.length) { // ember marks; the last frames show a faint pillar preview
    const warn = bossRage() ? CONFIG.bosses.shiranui.pillarWarnRage : CONFIG.bosses.shiranui.pillarWarn;
    if (b.t < warn) for (const px of b.pillars) {
      const x = Math.round(px - camX);
      g.fillStyle = blink ? '#ff5a2a' : '#ffd070'; g.fillRect(x - 7, FLOOR_Y - 2, 14, 2);
      for (let k = 0; k < 3; k++) { const h = hash(frame + k * 7, px | 0); g.fillRect(x - 6 + (h % 12), FLOOR_Y - 4 - ((h >> 6) % 6), 1, 1); }
      if (warn - b.t < 14 && SHEETS.shiranuiPillar && blink) { g.save(); g.globalAlpha = 0.4; g.drawImage(SHEETS.shiranuiPillar[0].r, 0, 32, 24, 16, x - 12, FLOOR_Y - 13, 24, 16); g.restore(); }
    }
  }
}
// foxfire sprite (cell faces right, hit centre at (16,12)); used by the boss, the helper and the support move
function drawFoxfire(x, y, vx, vy, f, scale) {
  const S = SHEETS.shiranuiBullets;
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(Math.atan2(vy, vx || 0.0001)); if (scale !== 1) g.scale(scale, scale);
  if (S) g.drawImage(S[f & 1].r, -16, -12);
  else { g.fillStyle = '#ff6a2a'; g.fillRect(-8, -2, 8, 4); g.fillStyle = '#ffd070'; g.fillRect(-3, -3, 6, 6); g.fillStyle = '#ffffff'; g.fillRect(-1, -1, 2, 2); }
  g.restore();
}
function drawShiranuiBullet(q, camX) {
  const S = SHEETS.shiranuiBullets, cx = q.x + q.w / 2 - camX, cy = q.y + q.h / 2;
  if (q.kind === 24) { drawFoxfire(cx, cy, q.vx, q.vy, (q.t >> 2) & 1, 1); return; }
  if (q.kind === 25) {
    const a = q.rel ? Math.atan2(q.vy, q.vx) : q.ang + Math.PI / 2;
    g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(a);
    if (S) g.drawImage(S[2].r, -15, -12); else { g.fillStyle = '#b070ff'; g.fillRect(-4, -4, 8, 8); }
    g.restore(); return;
  }
  if (q.kind === 27) {
    g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(((q.t >> 2) & 3) * Math.PI / 2);
    if (S) g.drawImage(S[4].r, -12, -12); else { g.fillStyle = '#201014'; g.fillRect(-7, -7, 14, 14); g.fillStyle = '#c02040'; g.fillRect(-5, -1, 10, 2); }
    g.restore(); return;
  }
  if (q.kind === 28) {
    const PS = SHEETS.shiranuiPillar;
    if (PS) g.drawImage(PS[(q.t >> 2) & 1].r, Math.round(cx) - 12, FLOOR_Y - 45);
    else { g.fillStyle = (q.t & 2) ? '#ff5a2a' : '#ffb040'; g.fillRect(Math.round(q.x - camX), q.y, q.w, q.h); }
    return;
  }
  // kind 9 + sspr 3: flame crescent (hit centre at (15,12) of the right-facing cell)
  const f = q.vx < 0 ? -1 : 1;
  if (S) g.drawImage(pick(S[3], f, false), Math.round(cx) - (f > 0 ? 15 : 9), Math.round(cy) - 12);
  else { g.fillStyle = '#ff4030'; g.fillRect(Math.round(q.x - camX), q.y, q.w, q.h); }
}

// ---- rescued シラヌイ as support: FOXFIRE DANCE (HELP button "FOX") ----
//  t20/30/40/50: four homing foxfires from her palm; each seeks the nearest enemy on screen (2 dmg) or the boss (1 dmg).
//  Total vs a boss: 4 (same as Star's MORPH / Astarthe's MOON CLEAVE).
function shiranuiSupportTarget(fx) {
  if (bossHittable() && boss.x + boss.w > cam.x && boss.x < cam.x + VW) return { boss: true, x: boss.x + boss.w / 2, y: boss.y + boss.h / 2 };
  let best = null, bd = 1e9;
  for (const e of enemies) {
    if (!e.alive || !e.active || e.x + e.w < cam.x || e.x > cam.x + VW) continue;
    const d = Math.hypot(e.x + e.w / 2 - fx.x, e.y + e.h / 2 - fx.y); if (d < bd) { bd = d; best = e; }
  }
  return best ? { e: best, x: best.x + best.w / 2, y: best.y + best.h / 2 } : null;
}
function updateShiranuiSupport(t) {
  support.x += (P.x + P.w / 2 - P.face * 20 - support.x) * 0.25; support.y += (P.y - support.y) * 0.25;
  if (t < 20) support.face = P.face;
  const f = support.face, fxs = support.fx || (support.fx = []);
  if (t === 20 || t === 30 || t === 40 || t === 50) {
    fxs.push({ x: support.x + f * 5, y: support.y + 2, vx: f * 2.2, vy: -1.4, t: 0, alive: true }); sfx('bshoot');
  }
  for (const q of fxs) {
    if (!q.alive) continue;
    q.t++;
    const tg = shiranuiSupportTarget(q);
    if (tg && q.t > 6) { const tx = tg.x - q.x, ty = tg.y - q.y, l = Math.hypot(tx, ty) || 1; q.vx += (tx / l * 3.4 - q.vx) * 0.18; q.vy += (ty / l * 3.4 - q.vy) * 0.18; }
    q.x += q.vx; q.y += q.vy;
    if (q.t % 3 === 0) spawnPart(q.x, q.y, -q.vx * 0.2, -q.vy * 0.2, 12, 4, (q.t >> 2) & 1 ? '#ffb060' : '#ff5a3a');
    if (tg && Math.abs(tg.x - q.x) < 9 && Math.abs(tg.y - q.y) < 12) {
      q.alive = false; popAt(q.x, q.y, '#ff8a4a');
      if (tg.boss) { boss.inv = 0; damageBoss(null, 1); }
      else { tg.e.hp -= 2; tg.e.flash = 10; if (tg.e.hp <= 0) killEnemy(tg.e); else sfx('ehit'); }
    }
    if (q.t > 110 || q.x < cam.x - 20 || q.x > cam.x + VW + 20 || q.y < -20 || q.y > VH) q.alive = false;
  }
  if ((t > 56 && !fxs.some(q => q.alive)) || t > 170) support.active = false;
}
function drawShiranuiSupport(t, x, y, camX) {
  const fr = SHEETS.shiranui, d = SHEET_DEFS.shiranui, f = support.face;
  const fi = t < 16 ? (t >> 3) & 1 : t < 56 ? 5 : 4;   // idle -> foxfire in palm -> waves her fan
  if (t < 12) g.globalAlpha = t / 12;
  if (fr) g.drawImage(pick(fr[Math.min(fi, fr.length - 1)], f, false), x - (f > 0 ? d.cx : d.fw - d.cx), y - 12);
  else g.drawImage(pick(SPR.ally.K[fi === 4 ? 1 : 0], f, false), x - 16, y - 12);
  g.globalAlpha = 1;
  for (const q of (support.fx || [])) if (q.alive) drawFoxfire(q.x - camX, q.y, q.vx, q.vy, (q.t >> 2) & 1, 1);
}
