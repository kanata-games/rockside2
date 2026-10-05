// Frame-accurate boss-fight bot, injected into the page (runs inside update() via window.__rocksideBot).
// Used by test.js (pattern coverage + clear) and tools/balance.js (difficulty estimate without god mode).
const BOSS = String.raw`
window.__botCfg = window.__botCfg || { fire: false, dist: 84 };
window.__botStats = { hits: 0, lastHp: -1, frames: 0, causes: [] };
window.__rocksideBot = function () {
  const R = ROCKSIDE, K = R._test.keys, I = R._test.inp, P = R.P, b = R.boss, cfg = window.__botCfg, S = window.__botStats;
  const clear = () => { K.left = K.right = K.jump = K.shoot = false; };
  if (R.state !== 'play' || b.state === 'off' || b.state === 'rescue' || P.dead) { clear(); return; }
  S.frames++; if (S.lastHp >= 0 && P.hp < S.lastHp) { S.hits++; S.causes.push(b.state + ':' + (S.near || 'contact')); } S.lastHp = P.hp; S.near = ''; { let bd = 26; for (const q of R.bullets) if (q.active) { const dd = Math.hypot(q.x + q.w / 2 - (P.x + P.w / 2), q.y + q.h / 2 - (P.y + P.h / 2)); if (dd < bd) { bd = dd; S.near = 'k' + q.kind + (P.onGround ? 'g' : 'a'); } } }
  const pcx = P.x + P.w / 2, bcx = b.x + b.w / 2, FY = R.floorY, L = R.roomX + 20, RR = R.roomX + 236;
  const d = bcx - pcx, ad = Math.abs(d), toBoss = d > 0 ? 1 : -1;
  let move = 0, jump = false, noJump = false, urgent = false;
  const want = cfg.dist;
  if (!b.hidden) { if (ad < want - 24) move = -toBoss; else if (ad > want + 30) move = toBoss; }
  if ((move < 0 && P.x < L) || (move > 0 && P.x + P.w > RR)) move = 0;           // don't hug the wall
  if (ad < 26 && !b.hidden && b.state !== 'orbs') { move = (pcx < L + 30) ? 1 : (pcx > RR - 30) ? -1 : -toBoss; if (ad < 18) jump = true; }
  // incoming bullets: simulate 26 frames of straight flight against the (static) player box
  const thorns = []; for (const q of R.bullets) if (q.active && q.kind === 16) thorns.push(q);
  const inThorn = x => thorns.some(q => x + 7 > q.x && x - 7 < q.x + q.w);           // would a player centred at x touch a patch?
  const freeDir = (pref) => { // pick a horizontal escape direction: pref first, avoid walls and thorns
    for (const d of [pref, -pref]) { const nx = pcx + d * 24; if (nx > L + 6 && nx < RR - 6 && !inThorn(nx)) return d; }
    return pref; };
  for (const q of R.bullets) {
    if (!q.active || q.kind === 16) continue;
    let th = -1;
    for (let t = 0; t <= 26; t += 2) {
      const qx = q.orbit ? q.x : q.x + q.vx * t, qy = q.orbit ? q.y : q.y + q.vy * t;
      if (qx < P.x + P.w + 2 && qx + q.w > P.x - 2 && qy < P.y + P.h && qy + q.h > P.y) { th = t; break; }
    }
    if (q.orbit) { if (Math.hypot(q.x - pcx, q.y - (P.y + P.h / 2)) < 30) { jump = true; } continue; }
    if (th < 0) continue;
    if (q.kind === 7) { move = (pcx - R.roomX < 128) ? 1 : -1; urgent = true; continue; }
    if (q.kind === 13 || q.kind === 15 || (q.kind === 14 && Math.abs(q.vy) > Math.abs(q.vx) * 0.6)) { const ix = q.x + q.w / 2 + q.vx * th; move = freeDir(ix < pcx ? 1 : -1); urgent = true; continue; } // falling / bouncing: sidestep
    const low = q.y + q.h > FY - 30, flat = Math.abs(q.vy) < 0.8;
    if (flat && !low) { noJump = true; continue; }
    if (th <= (flat ? 14 : 10)) jump = true;
  }
  if (b.rainN > 0) { // step out of marked columns
    const c0 = Math.floor(P.x / 16), c1 = Math.floor((P.x + P.w) / 16);
    let inCol = false; for (let i = 0; i < b.rainN; i++) if (b.rainC[i] === c0 || b.rainC[i] === c1) inCol = true;
    if (inCol) { let best = 0, bd = 1e9;
      for (let x = L; x <= RR; x += 4) { const a0 = Math.floor((x - 5) / 16), a1 = Math.floor((x + 5) / 16); let bad = false;
        for (let i = 0; i < b.rainN; i++) if (b.rainC[i] === a0 || b.rainC[i] === a1) bad = true;
        if (!bad && Math.abs(x - pcx) < bd) { bd = Math.abs(x - pcx); best = x; } }
      move = best > pcx ? 1 : -1; urgent = true; } else if (!urgent) move = 0;
  }
  // v5 Neenia: floor marks (lob / snare) and the locked ricochet path -> step aside
  if (b.markT) for (let i = 0; i < b.markT.length; i++) if (b.markT[i] > 0 && b.markT[i] < 44 && Math.abs(b.markX[i] - pcx) < 15) { move = freeDir(pcx >= b.markX[i] ? 1 : -1); urgent = true; }
  if (b.ricoShow && b.ricoLock) {
    let hitx = null; for (let i = 0; i < b.ricoN - 1 && hitx === null; i++) { const x0 = b.ricoPts[i * 2], y0 = b.ricoPts[i * 2 + 1], x1 = b.ricoPts[i * 2 + 2], y1 = b.ricoPts[i * 2 + 3];
      if (Math.abs(y1 - y0) < Math.abs(x1 - x0) * 0.6) continue; // shallow segment (skip shot): jump it when it arrives
      for (let k = 0; k <= 40; k++) { const x = x0 + (x1 - x0) * k / 40, y = y0 + (y1 - y0) * k / 40; if (Math.abs(x - pcx) < 14 && y > P.y - 6 && y < P.y + P.h + 4) { hitx = x; break; } } }
    if (hitx !== null) { move = freeDir(pcx >= hitx ? 1 : -1); urgent = true; }
  }
  if (b.state === 'warpWarn') { const dir = pcx < b.warnX ? -1 : 1; move = dir; if ((dir < 0 && P.x < L) || (dir > 0 && P.x + P.w > RR)) { move = -dir; jump = true; } urgent = true; }
  if (b.state === 'leap' || b.state === 'crouch') { // Seiten's landing spot
    const air = b.state === 'leap' ? Math.max(0, (FY - b.h - b.y) / 3 + (b.vy < 0 ? -b.vy / 0.25 : 0)) : 40;
    const lx = b.state === 'leap' ? bcx + b.vx * air : pcx;
    if (Math.abs(lx - pcx) < 34) { move = lx > pcx ? -1 : 1; if ((move < 0 && P.x < L) || (move > 0 && P.x + P.w > RR)) move = -move; urgent = true; }
  }
  if (b.state === 'orbs' && ad < 74) { move = -toBoss; if ((move < 0 && P.x < L) || (move > 0 && P.x + P.w > RR)) { move = toBoss; jump = true; } }
  // final area: suction (run away, hold fire so nothing gets swallowed), mimic charge (jump it), leap landing / floor marks (step aside)
  const sucking = b.suckOn || b.state === 'kSuckWarn' || b.state === 'mSuckWarn';
  if (sucking) { move = b.face; if ((move < 0 && P.x < L - 12) || (move > 0 && P.x + P.w > RR + 12)) move = 0; urgent = true; S.hold = 1; } else S.hold = 0;
  if (b.state === 'mCharge' && Math.sign(b.vx) === toBoss * -1) { const gap = ad - b.w / 2 - P.w / 2; if (gap < 34 && gap > -4) jump = true; noJump = false; }
  if (b.state === 'mChargeWind') { move = 0; }
  if ((b.state === 'mLeapWind' || b.state === 'mLeap') && b.leapX !== undefined) { const lx = b.leapX + b.w / 2; if (Math.abs(lx - pcx) < 36) { move = freeDir(pcx >= lx ? 1 : -1); urgent = true; } }
  if (b.gMarks) for (const mk of b.gMarks) if (mk.t > 0 && mk.t < 80 && Math.abs(mk.x - pcx) < 15) { move = freeDir(pcx >= mk.x ? 1 : -1); urgent = true; }
  if (noJump) jump = false;
  if (thorns.length && P.onGround) { // thorn patches: step out if standing in one; never walk into one (hop over it when in a hurry)
    if (inThorn(pcx)) { const q = thorns.find(q => pcx + 7 > q.x && pcx - 7 < q.x + q.w); const d = (pcx < q.x + q.w / 2) ? -1 : 1; move = (pcx + d * 30 > L && pcx + d * 30 < RR) ? d : -d; }
    else if (move !== 0 && inThorn(pcx + move * 4)) { if (urgent) jump = true; else move = 0; }
    else if (jump) { const air = 40 * 1.5 * (move || 0); if (move === 0 && inThorn(pcx)) jump = false; if (move !== 0 && inThorn(pcx + air)) move = 0; }
  }
  if (move === 0 && P.face !== toBoss && !b.hidden) move = toBoss;           // turn to shoot
  K.left = move < 0; K.right = move > 0;
  if (jump && P.onGround) { I.jumpPressed = true; S.jt = 18; }
  K.jump = (S.jt = (S.jt || 0) - 1) > 0;
  K.shoot = !!cfg.fire && !S.hold;
};`;
// Frame-accurate stage runner: holds right (+ shot), jumps at walls and ledges. module.exports.RUNNER
const RUNNER = String.raw`
window.__runStats = { jumps: 0 };
window.__rocksideBot = function () {
  const R = ROCKSIDE, K = R._test.keys, I = R._test.inp, P = R.P, S = window.__runStats, sol = R._test.solidAt;
  if (R.state !== 'play') { K.left = K.right = K.jump = K.shoot = false; return; }
  K.right = true; K.shoot = true;
  const feet = P.y + P.h, rFeet = Math.floor((feet + 1) / 16), cAhead = Math.floor((P.x + P.w + 3) / 16);
  const pit = !sol(cAhead, rFeet), wall = sol(Math.floor((P.x + P.w + 2) / 16), Math.floor((feet - 4) / 16));
  // low ceiling over the take-off point (e.g. a girder above a pit): wait until the front foot is at the very edge
  const rHead = Math.floor((P.y - 30) / 16), lowCeil = sol(cAhead, rHead) || sol(Math.floor((P.x + P.w / 2) / 16), rHead);
  const atEdge = !sol(Math.floor((P.x + P.w - 1) / 16), rFeet);
  if (P.onGround && (wall || (pit && (!lowCeil || atEdge)))) { I.jumpPressed = true; S.jt = 22; S.jumps++; }
  K.jump = (S.jt = (S.jt || 0) - 1) > 0;
};`;
module.exports = { BOSS, RUNNER };
