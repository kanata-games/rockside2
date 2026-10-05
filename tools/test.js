// Headless test for ROCKSIDE (build first: python3 tools/build.py):  node tools/test.js
// Serves the repo root over a local http server (same origin as GitHub Pages; sprites load from assets/).
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
let FILE = null; // set once the local server is up
const SERVE = require('./serve.js');
const { execFileSync } = require('child_process');
const SHOTS = path.join(ROOT, 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
const results = []; const errors = []; const assetMisses = [];
const ok = (name, cond, info) => { results.push({ name, pass: !!cond, info }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function newPage(browser, w, h, url) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('console', m => {
    if (m.type() !== 'error' && m.type() !== 'warning') return;
    const loc = (m.location() && m.location().url) || '';
    if (loc.includes('/assets/')) { assetMisses.push(loc); return; } // optional sprite sheets not present
    errors.push(`[${w}x${h}] console.${m.type()}: ${m.text()} ${loc}`);
  });
  page.on('pageerror', e => errors.push(`[${w}x${h}] pageerror: ${e.message}`));
  page.on('requestfailed', r => { if (r.url().includes('/assets/')) assetMisses.push(r.url()); else errors.push(`[${w}x${h}] requestfailed: ${r.url()}`); });
  await page.goto(url || FILE); await sleep(500);
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, cdp };
}
const G = (page, fn, arg) => page.evaluate(fn, arg);
async function waitFor(page, fn, timeout = 8000, arg) { const t0 = Date.now(); while (Date.now() - t0 < timeout) { if (await G(page, fn, arg)) return true; await sleep(30); } return false; }
const waitState = (page, st, timeout) => waitFor(page, s => ROCKSIDE.state === s, timeout, st);
async function center(page, id) { return page.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, top: r.top, left: r.left, right: r.right, bottom: r.bottom }; }, id); }
// title -> STAGE SELECT -> area 1 (cursor starts there) -> boss-intro flash (skipped after ~1.2 s) -> play
async function startArea1(pg, pressFn) {
  const press = pressFn || (() => pg.keyboard.press('Enter'));
  await press(); await waitState(pg, 'select', 3000); await sleep(200);
  await press(); await waitState(pg, 'areaIntro', 3000);
  await waitFor(pg, () => ROCKSIDE.stateT > 100, 4000); await press();
  return waitState(pg, 'play', 5000);
}
// game-pixel coords -> client coords (for taps on the stage-select cells)
async function gameToClient(pg, gx, gy) { const L = await G(pg, () => ROCKSIDE.layout); return { x: L.gameX + gx / 256 * L.gameW, y: L.gameY + gy / 240 * L.gameH }; }
async function cellCenter(pg, slot) { const r = await G(pg, s => ROCKSIDE.cellRect(s), slot); return gameToClient(pg, r.x + r.w / 2, r.y + r.h / 2); }
async function touches(cdp, type, pts) { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: p.id ?? i + 1, radiusX: 8, radiusY: 8, force: 1 })) }); }

(async () => {
  const srv = await SERVE.start(ROOT); FILE = srv.url + 'index.html';
  const browser = await chromium.launch();
  let ctx, page, cdp;

  // ---------------- 1. portrait: title, layout, keyboard ----------------
  ({ ctx, page } = await newPage(browser, 390, 844));
  await sleep(700);
  await page.screenshot({ path: path.join(SHOTS, 'title.png') });
  { const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    ok('hero name is UMINE (title + HUD), no KANON label', html.includes("drawTextShadow('UMINE'") && html.includes("drawBar(8, 8, 'UMINE'") && !/'KANON'/.test(html));
    ok('page title / lang', (await page.title()) === 'ROCKSIDE – 海音の冒険' && html.includes('<html lang="ja">'), await page.title());
    const ver = await G(page, () => ({ v: GAME_VERSION, hint: document.getElementById('hint').textContent }));
    ok('version label (GAME_VERSION in footer, no PROTOTYPE text)', /^\d+\.\d+\.\d+$/.test(ver.v) && ver.hint.includes('v' + ver.v) && !html.includes('PROTOTYPE V'), ver); }
  const lay = await G(page, () => ROCKSIDE.layout);
  const btns = {}; for (const id of ['bL', 'bR', 'bS', 'bJ']) btns[id] = await center(page, id);
  ok('game view fills width', lay.gameW === 390, { gameW: lay.gameW, gameH: lay.gameH });
  ok('buttons >= 70px', Math.min(...Object.values(btns).map(b => Math.min(b.w, b.h))) >= 70);
  ok('buttons below game view & inside viewport', Object.values(btns).every(b => b.top >= lay.gameH && b.left >= 0 && b.right <= 390 && b.bottom <= 844));
  ok('fixed-step ~60 updates/s', await (async () => { const a = await G(page, () => ROCKSIDE.stats.updates); await sleep(1000); const b = await G(page, () => ROCKSIDE.stats.updates); return b - a > 50 && b - a < 70; })());
  ok('Enter -> stage select -> area 1 -> play', await startArea1(page));
  const x0 = await G(page, () => ROCKSIDE.P.x);
  await page.keyboard.down('ArrowRight'); await sleep(600); await page.keyboard.up('ArrowRight');
  ok('keyboard ArrowRight moves', (await G(page, () => ROCKSIDE.P.x)) - x0 > 40);
  await page.evaluate(() => { window.__minY = 1e9; setInterval(() => { window.__minY = Math.min(window.__minY, ROCKSIDE.P.y); }, 4); });
  const yG = await G(page, () => ROCKSIDE.P.y);
  await page.keyboard.down('KeyZ'); await sleep(60); await page.keyboard.up('KeyZ'); await sleep(700);
  const tapH = yG - await G(page, () => window.__minY);
  await page.evaluate(() => { window.__minY = 1e9; });
  await page.keyboard.down('Space'); await sleep(600); await page.keyboard.up('Space'); await sleep(600);
  const holdH = yG - await G(page, () => window.__minY);
  ok('variable jump height', tapH > 5 && holdH > tapH + 15, { tapH, holdH });
  const s0 = await G(page, () => ROCKSIDE.stats.shots);
  await page.keyboard.press('KeyX'); await sleep(200); await page.keyboard.press('KeyJ'); await sleep(200);
  ok('keyboard X/J shoot water', (await G(page, () => ROCKSIDE.stats.shots)) - s0 >= 2);
  // water shot leaves the staff tip of the real Kanon sprite (tip ~ frame (30,17) -> about P.x+20, P.y+3 on spawn)
  await page.evaluate(() => { window.__shot = null; const f = () => { const s = ROCKSIDE.shots.find(q => q.active);
    if (s && !window.__shot) window.__shot = { dx: s.x - ROCKSIDE.P.x, dy: s.y - ROCKSIDE.P.y, face: ROCKSIDE.P.face }; if (!window.__shot) requestAnimationFrame(f); }; setTimeout(f, 450); });
  await sleep(500); await page.keyboard.press('KeyX'); await sleep(200);
  const sp = await G(page, () => window.__shot);
  ok('shots spawn at the staff tip (sheet)', sp && sp.face === 1 && sp.dx >= 16 && sp.dx <= 34 && sp.dy >= 0 && sp.dy <= 8, sp);
  ok('real sprite sheets active (assets/, incl. normal tobiume.png)', await G(page, () => ['kanon', 'tobiume', 'tobiumeNormal', 'neenia', 'seiten', 'astarte'].every(k => ROCKSIDE.SHEETS_LOADED.includes(k))), await G(page, () => ROCKSIDE.SHEETS_LOADED));
  ok('normal tobiume.png sliced via tobiume.json (32x32 x15)', await G(page, () => { const d = ROCKSIDE.SHEET_DEFS.tobiumeNormal; return d.fw === 32 && d.frames === 15 && d.map.kick[0] === 7 && d.map.special_dive_kick[0] === 11; }));
  ok('Astarte (start) speech bubble triggered', await G(page, () => ROCKSIDE.allies[0].type === 'A' && ROCKSIDE.allies[0].said));
  await page.evaluate(() => ROCKSIDE.teleport(2 * 256 + 5 * 16 + 20, 140));
  ok('pit fall -> game over', await waitState(page, 'gameover', 5000));
  await sleep(700); await page.keyboard.press('Enter');
  ok('retry restarts stage', await waitState(page, 'ready', 3000));
  await ctx.close();

  // ---------------- 2. portrait: touch + v2_gameplay (ally bubble) ----------------
  ({ ctx, page, cdp } = await newPage(browser, 390, 844));
  const b = {}; for (const id of ['bL', 'bR', 'bS', 'bJ']) b[id] = await center(page, id);
  await touches(cdp, 'touchStart', [{ x: 195, y: 180 }]); await touches(cdp, 'touchEnd', []);
  ok('tap on title -> stage select', await waitState(page, 'select', 3000));
  await sleep(250);
  { const c = await cellCenter(page, 0); await touches(cdp, 'touchStart', [c]); await touches(cdp, 'touchEnd', []); }
  ok('tap on area-1 cell -> boss intro', await waitState(page, 'areaIntro', 3000));
  await waitFor(page, () => ROCKSIDE.stateT > 100, 4000);
  await touches(cdp, 'touchStart', [{ x: 195, y: 180 }]); await touches(cdp, 'touchEnd', []);
  ok('tap skips intro -> play', await waitState(page, 'play', 5000));
  await touches(cdp, 'touchStart', [{ x: b.bR.x, y: b.bR.y, id: 1 }]);
  await sleep(120);
  ok('touch RIGHT pressed state', await G(page, () => document.getElementById('bR').classList.contains('on')));
  await waitFor(page, () => ROCKSIDE.P.x > 226, 5000);
  await touches(cdp, 'touchStart', [{ x: b.bR.x, y: b.bR.y, id: 1 }, { x: b.bJ.x, y: b.bJ.y, id: 2 }]);
  await touches(cdp, 'touchStart', [{ x: b.bR.x, y: b.bR.y, id: 1 }, { x: b.bJ.x, y: b.bJ.y, id: 2 }, { x: b.bS.x, y: b.bS.y, id: 3 }]);
  await sleep(300);
  const st = await G(page, () => ({ air: !ROCKSIDE.P.onGround, j: ROCKSIDE.stats.jumps, s: ROCKSIDE.stats.shots, bubble: ROCKSIDE.allies[0].bubbleT }));
  const cls = await G(page, () => ['bL', 'bR', 'bS', 'bJ'].map(id => document.getElementById(id).classList.contains('on')));
  await page.screenshot({ path: path.join(SHOTS, 'v2_gameplay.png') });
  ok('multi-touch right+jump+shot', cls[1] && cls[2] && cls[3] && !cls[0] && st.air && st.j > 0 && st.s > 0, { cls, st });
  ok('ally bubble visible in v2_gameplay', st.bubble > 0, st);
  await touches(cdp, 'touchStart', [{ x: b.bR.x, y: b.bR.y, id: 1 }]);
  await waitFor(page, () => ROCKSIDE.enemies[0].x - ROCKSIDE.P.x < 95, 6000);
  await touches(cdp, 'touchStart', [{ x: b.bR.x, y: b.bR.y, id: 1 }, { x: b.bJ.x, y: b.bJ.y, id: 2 }]);
  await touches(cdp, 'touchStart', [{ x: b.bR.x, y: b.bR.y, id: 1 }, { x: b.bJ.x, y: b.bJ.y, id: 2 }, { x: b.bS.x, y: b.bS.y, id: 3 }]);
  await sleep(320);
  await page.screenshot({ path: path.join(SHOTS, 'gameplay.png') });
  await touches(cdp, 'touchEnd', []); await sleep(80);
  ok('buttons release', !(await G(page, () => ['bL', 'bR', 'bS', 'bJ'].some(id => document.getElementById(id).classList.contains('on')))));
  await touches(cdp, 'touchStart', [{ x: b.bL.x, y: b.bL.y, id: 5 }]); await sleep(60);
  const l1 = await G(page, () => document.getElementById('bL').classList.contains('on'));
  await touches(cdp, 'touchMove', [{ x: b.bR.x, y: b.bR.y, id: 5 }]); await sleep(60);
  const r1 = await G(page, () => document.getElementById('bR').classList.contains('on') && !document.getElementById('bL').classList.contains('on'));
  await touches(cdp, 'touchEnd', []);
  ok('finger slide LEFT->RIGHT', l1 && r1);
  const m = await center(page, 'mute');
  await touches(cdp, 'touchStart', [{ x: m.x, y: m.y }]); await touches(cdp, 'touchEnd', []); await sleep(50);
  ok('mute toggles', (await G(page, () => document.getElementById('mute').textContent)) === 'SOUND OFF');
  ok('page did not scroll', (await G(page, () => scrollY + scrollX)) === 0);
  await ctx.close();

  // ---------------- 3. allies: Neenia support fire, checkpoint Astarte, Seiten heal ----------------
  ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?god=1'));
  await startArea1(page);
  await page.evaluate(() => ROCKSIDE.teleport(5 * 256 + 2 * 16, 150));   // ground left of the pit, below Neenia's perch
  ok('Neenia fires arrows at enemies', await waitFor(page, () => ROCKSIDE.stats.arrows >= 2, 5000), await G(page, () => ROCKSIDE.stats.arrows));
  await sleep(250);
  await page.screenshot({ path: path.join(SHOTS, 'v2_neenia.png') });
  ok('Neenia line shown', await G(page, () => ROCKSIDE.allies.find(a => a.type === 'N').said));
  ok('arrows can defeat enemies', await waitFor(page, () => ROCKSIDE.stats.arrowKills >= 1, 5000), await G(page, () => ({ kills: ROCKSIDE.stats.arrowKills })));
  const cpA = await G(page, () => ROCKSIDE.allies.find(a => a.cp).x);
  await page.evaluate(x => ROCKSIDE.teleport(x - 40, 150), cpA);
  ok('checkpoint not yet set', !(await G(page, () => ROCKSIDE.checkpoint)));
  await page.keyboard.down('ArrowRight');
  ok('touching Astarte sets checkpoint (and she does not block)', await waitFor(page, x => ROCKSIDE.checkpoint && ROCKSIDE.P.x > x, 3000, cpA));
  const seX = await G(page, () => ROCKSIDE.allies.find(a => a.type === 'S').x);
  await waitFor(page, x => ROCKSIDE.P.x + 5 > x - 4, 3000, seX);
  await page.keyboard.up('ArrowRight');
  await page.evaluate(() => { ROCKSIDE.P.hp = 3; });
  ok('Seiten song heals to full', await waitFor(page, () => ROCKSIDE.P.hp === ROCKSIDE.CONFIG.playerMaxHP, 4000), await G(page, () => ({ hp: ROCKSIDE.P.hp, heals: ROCKSIDE.stats.heals })));
  await page.screenshot({ path: path.join(SHOTS, 'v2_seiten.png') });
  await ctx.close();

  // ---------------- 3b. standing shots hit small ground enemies (hurtbox) ----------------
  // Place Umine on the same floor as the enemy, facing it, freeze the enemy, fire once and
  // check the enemy took damage (the shot spawn height itself is unchanged).
  async function groundShotTest(type, label, shotFile, side) { // side: -1 = Umine left of enemy facing right, +1 = right of it facing left
    const r = await newPage(browser, 390, 844, FILE + '?god=1'); const pg = r.page;
    await startArea1(pg);
    const setup = await G(pg, ([t, side]) => {
      const R = ROCKSIDE; R.CONFIG.enemy.walker.speed = 0; R.CONFIG.enemy.hopper.waitFrames = 1e9;
      const e = R.enemies.find(en => en.type === t && en.alive); if (!e) return null;
      const P = R.P; R.teleport(side < 0 ? e.x - 34 - P.w : e.x + e.w + 34, e.y + e.h - P.h); P.face = -side;
      return { idx: R.enemies.indexOf(e) };
    }, [type, side]);
    if (!setup) { ok(label, false, 'enemy not found'); await r.ctx.close(); return; }
    await waitFor(pg, i => { const R = ROCKSIDE, e = R.enemies[i]; return R.P.onGround && e.onGround !== false && e.active; }, 3000, setup.idx);
    await sleep(150);
    const before = await G(pg, i => { const R = ROCKSIDE, e = R.enemies[i], P = R.P;
      return { hp: e.hp, eh: e.h, hurtUp: e.hurtUp, sameFloor: Math.abs((P.y + P.h) - (e.y + e.h)) < 0.5, ground: !!e.onGround || e.type === 'W', dist: Math.round(Math.max(e.x - (P.x + P.w), P.x - (e.x + e.w))), face: P.face }; }, setup.idx);
    await pg.keyboard.down('KeyX'); await sleep(40); await pg.keyboard.up('KeyX'); // one shot
    let shotInfo = null;
    const t0 = Date.now();
    while (Date.now() - t0 < 2000) {
      shotInfo = await G(pg, i => { const R = ROCKSIDE, e = R.enemies[i]; const s = R.shots.find(q => q.active);
        return { hp: e.hp, alive: e.alive, s: s ? { x: s.x, y: s.y, h: s.h } : null, ex: e.x, ey: e.y }; }, setup.idx);
      if (shotFile && shotInfo.s && Math.abs(shotInfo.s.x + 3 - (shotInfo.ex + 6)) < 16) { await pg.screenshot({ path: path.join(SHOTS, shotFile) }); shotFile = null; }
      if (shotInfo.hp < before.hp || !shotInfo.alive) break;
      await sleep(16);
    }
    ok(label, before.sameFloor && before.ground && (shotInfo.hp < before.hp || !shotInfo.alive),
      { ...before, hpAfter: shotInfo.hp, shotY: shotInfo.s && shotInfo.s.y, enemyTop: shotInfo.ey });
    ok(label + ': contact box unchanged', before.eh === (type === 'W' ? 12 : 11), { h: before.eh, hurtUp: before.hurtUp });
    await r.ctx.close();
  }
  await groundShotTest('W', 'standing shot hits walker on same floor', 'v2_enemy_hit.png', -1);
  await groundShotTest('H', 'standing shot hits grounded hopper on same floor', null, 1);

  // ---------------- 4. boss: Dark Tobiume (?boss=1&god=1) ----------------
  ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?boss=1&god=1'));
  await startArea1(page);
  await page.keyboard.down('ArrowRight');
  ok('boss room triggers intro', await waitState(page, 'bossIntro', 8000));
  await page.keyboard.up('ArrowRight');
  ok('boss intro -> fight', await waitState(page, 'play', 12000));
  ok('camera locked in room', await G(page, () => Math.round(ROCKSIDE.cam.x) === ROCKSIDE.roomX));
  // the bot first dodges (no shooting) until all three patterns were observed, then fights
  let firing = false;
  let rescuedShot = false, rescuedInfo = null;
  let bossShot = false, rescueShot = false; const seen = new Set(); let shock = false, fanSeen = false; const hp0 = await G(page, () => ROCKSIDE.boss.hp); const tb = Date.now(); let n = 0;
  while (Date.now() - tb < 150000) {
    const s = await G(page, () => ({ st: ROCKSIDE.state, bx: ROCKSIDE.boss.x, by: ROCKSIDE.boss.y, px: ROCKSIDE.P.x, py: ROCKSIDE.P.y, face: ROCKSIDE.P.face, hp: ROCKSIDE.boss.hp, bs: ROCKSIDE.boss.state, bt: ROCKSIDE.boss.t, shock: ROCKSIDE.bullets.some(b => b.active && b.kind === 4), fan: ROCKSIDE.bullets.filter(b => b.active && (b.kind === 2 || b.kind === 3)).length, flash: ROCKSIDE.boss.flash }));
    seen.add(s.bs); if (s.shock) shock = true; if (s.fan >= 3) fanSeen = true;
    if (!firing && ((fanSeen && seen.has('swoop') && seen.has('kick') && shock) || Date.now() - tb > 60000)) { firing = true; await page.keyboard.down('KeyX'); }
    if (s.st === 'clear') break;
    if (s.bs === 'rescue') {
      if (!rescueShot && s.bt >= 135) { await page.screenshot({ path: path.join(SHOTS, 'v2_clear.png') }); rescueShot = true; }
      if (!rescuedShot && s.bt >= 186) { rescuedInfo = await G(page, () => ({ dark: ROCKSIDE.boss.dark, pose: ROCKSIDE.boss.pose, f: ROCKSIDE.boss.poseF }));
        await page.screenshot({ path: path.join(SHOTS, 'v3_rescued.png') }); rescuedShot = true; }
      await sleep(60); continue;
    }
    const want = s.bx + 10 < s.px + 5 ? 'ArrowLeft' : 'ArrowRight';
    if ((want === 'ArrowLeft') !== (s.face < 0)) { await page.keyboard.down(want); await sleep(40); await page.keyboard.up(want); }
    if (n % 5 === 0 || s.shock) { await page.keyboard.down('KeyZ'); await sleep(260); await page.keyboard.up('KeyZ'); }
    if (!bossShot && firing && s.flash === 0 && (((s.fan >= 2 || s.shock) && Math.abs(s.bx - s.px) > 40) || s.hp <= 3)) { await page.screenshot({ path: path.join(SHOTS, 'v2_boss.png') }); bossShot = true; }
    n++; await sleep(50);
  }
  await page.keyboard.up('KeyX');
  ok('boss patterns used (fan/swoop/kick)', fanSeen && seen.has('swoop') && seen.has('kick'), [...seen]);
  ok('kick produces floor shockwaves', shock);
  ok('v2_boss.png captured', bossShot);
  ok('defeat -> rescue line shown', rescueShot && seen.has('rescue'));
  ok('rescue -> STAGE CLEAR', await waitState(page, 'clear', 8000));
  ok('rescued Tobiume = normal sheet doing her kick pose (v3_rescued.png)', rescuedShot && rescuedInfo && !rescuedInfo.dark && rescuedInfo.pose === 'kick', rescuedInfo);
  ok('clear saves progress (area cleared + friend rescued)', await G(page, () => { const d = JSON.parse(localStorage.getItem(ROCKSIDE.PROGRESS_KEY) || '{}'); return d.cleared.includes('sunset') && d.rescued.includes('tobiume'); }));
  await sleep(1300); await page.screenshot({ path: path.join(SHOTS, 'v2_clear_screen.png') });
  await page.keyboard.press('Enter');
  ok('STAGE CLEAR -> back to stage select, cursor on area 1', await waitState(page, 'select', 3000) && (await G(page, () => ROCKSIDE.selCursor)) === 0);
  await sleep(300); await page.screenshot({ path: path.join(SHOTS, 'v3_select_cleared.png') });
  await page.reload(); await sleep(600);
  ok('progress persists after reload (1/8, mark shown)', (await G(page, () => ROCKSIDE.clearedCount())) === 1);
  // title "ERASE DATA": tap twice
  { const R = await G(page, () => ROCKSIDE.TITLE_RESET); const c = await gameToClient(page, R.x + R.w / 2, R.y + R.h / 2);
    await page.mouse.click(c.x, c.y); await sleep(100);
    const armed = await G(page, () => ROCKSIDE.resetArmed && ROCKSIDE.state === 'title');
    await page.mouse.click(c.x, c.y); await sleep(100);
    ok('title ERASE DATA (tap twice) resets progress', armed && (await G(page, () => ROCKSIDE.clearedCount() === 0 && !localStorage.getItem(ROCKSIDE.PROGRESS_KEY) && ROCKSIDE.state === 'title')), { armed }); }
  await ctx.close();

  // ---------------- 5. landscape ----------------
  ({ ctx, page, cdp } = await newPage(browser, 844, 390));
  const L = await G(page, () => ROCKSIDE.layout);
  const lb = {}; for (const id of ['bL', 'bR', 'bS', 'bJ']) lb[id] = await center(page, id);
  ok('landscape: game centred full height', !L.portrait && L.gameH === 390 && Math.abs(L.gameX - (844 - L.gameW) / 2) <= 1);
  await startArea1(page);
  await touches(cdp, 'touchStart', [{ x: lb.bR.x, y: lb.bR.y, id: 1 }]);
  await waitFor(page, () => ROCKSIDE.P.x > 110, 5000);
  await touches(cdp, 'touchStart', [{ x: lb.bR.x, y: lb.bR.y, id: 1 }, { x: lb.bS.x, y: lb.bS.y, id: 3 }]); await sleep(200);
  await touches(cdp, 'touchStart', [{ x: lb.bR.x, y: lb.bR.y, id: 1 }, { x: lb.bS.x, y: lb.bS.y, id: 3 }, { x: lb.bJ.x, y: lb.bJ.y, id: 2 }]); await sleep(260);
  ok('landscape touch works', (await G(page, () => ROCKSIDE.stats.shots)) > 0 && (await G(page, () => ROCKSIDE.stats.jumps)) > 0);
  await page.screenshot({ path: path.join(SHOTS, 'landscape.png') });
  await touches(cdp, 'touchEnd', []);
  await ctx.close();


  // ---------------- 7. STAGE SELECT: keys, locked cells, taps, d-pad, unlock ----------------
  ({ ctx, page, cdp } = await newPage(browser, 390, 844));
  await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(300);
  await page.screenshot({ path: path.join(SHOTS, 'v3_select.png') });
  const cur = () => G(page, () => ROCKSIDE.selCursor);
  const nav = [];
  for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowUp']) { await page.keyboard.press(k); await sleep(60); nav.push(await cur()); }
  ok('select: arrow keys move the cursor (0 ->1 ->4 ->3 ->0 ->6 wrap)', nav.join(',') === '1,4,3,0,6', nav);
  const tryKey = async (slot) => { await page.evaluate(s => { /* move by keys */ }, slot);
    while ((await cur()) !== slot) { await page.keyboard.press('ArrowRight'); await sleep(40); }
    await page.keyboard.press('Enter'); await sleep(120); return G(page, () => ({ st: ROCKSIDE.state, msg: ROCKSIDE.selMsg })); };
  let r7 = await tryKey(4);
  ok('centre (final) cell locked: CLEAR ALL 8 AREAS message, stays on select', r7.st === 'select' && r7.msg && r7.msg.en === 'CLEAR ALL 8 AREAS', r7);
  await sleep(200); await page.screenshot({ path: path.join(SHOTS, 'v3_select_msg.png') });
  await page.keyboard.press('Enter'); await sleep(80);
  r7 = await tryKey(2);
  ok('DARK ネーニア cell (v4: playable) -> her boss intro', r7.st === 'areaIntro' && !r7.msg, r7);
  await waitFor(page, () => ROCKSIDE.stateT >= 112, 4000); await page.screenshot({ path: path.join(SHOTS, 'v4_intro_neenia.png') });
  ok('intro -> 月影の森 starts', await waitState(page, 'ready', 5000) && (await G(page, () => ROCKSIDE.curArea)) === 'neenia');
  await page.reload(); await sleep(500); await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(200);
  r7 = await tryKey(7);
  ok('DARK ダイスロール cell (v9: last ??? cell, now playable) -> her boss intro', r7.st === 'areaIntro' && !r7.msg && !(await G(page, () => ROCKSIDE.finalUnlocked())), r7);
  ok('v9: no reserved cells left (8 outer areas all have a stage)', await G(page, () => ROCKSIDE.AREAS.filter(a => !a.final).length === 8 && ROCKSIDE.AREAS.filter(a => !a.final).every(a => a.map)));
  await page.reload(); await sleep(500); await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(200);
  // touch: d-pad RIGHT moves the cursor, direct taps choose a cell
  const c0 = await cur(); const bR = await center(page, 'bR');
  await touches(cdp, 'touchStart', [{ x: bR.x, y: bR.y }]); await touches(cdp, 'touchEnd', []); await sleep(80);
  ok('touch d-pad moves the cursor', (await cur()) === (c0 + 1) % 9, { from: c0, to: await cur() });
  { const c = await cellCenter(page, 4); await touches(cdp, 'touchStart', [c]); await touches(cdp, 'touchEnd', []); await sleep(100); }
  r7 = await G(page, () => ({ c: ROCKSIDE.selCursor, msg: ROCKSIDE.selMsg, st: ROCKSIDE.state }));
  ok('tap on the locked centre: cursor + CLEAR ALL 8 AREAS', r7.c === 4 && r7.st === 'select' && r7.msg && r7.msg.en === 'CLEAR ALL 8 AREAS', r7);
  await touches(cdp, 'touchStart', [{ x: 195, y: 180 }]); await touches(cdp, 'touchEnd', []); await sleep(80); // closes the message
  { const c = await cellCenter(page, 0); await touches(cdp, 'touchStart', [c]); await touches(cdp, 'touchEnd', []); }
  ok('tap on area 1 -> boss intro flash', await waitState(page, 'areaIntro', 2000));
  await waitFor(page, () => ROCKSIDE.stateT >= 112, 4000);
  await page.screenshot({ path: path.join(SHOTS, 'v3_intro.png') });
  ok('intro -> area 1 starts (sunset, allies = guests A/N/S)', await waitState(page, 'ready', 5000) && (await G(page, () => ROCKSIDE.curArea === 'sunset' && ROCKSIDE.allies.length === 4)));
  // ally gating: without the guest exception an ally appears only once rescued
  const gate = await G(page, () => { const T = ROCKSIDE._test, a0 = ROCKSIDE.AREAS[0], g0 = a0.guests;
    a0.guests = []; T.loadArea(a0); const none = ROCKSIDE.allies.length;
    ROCKSIDE.progress.rescued.push('neenia'); T.loadArea(a0); const withN = ROCKSIDE.allies.map(a => a.type).sort().join('');
    ROCKSIDE.progress.rescued.pop(); a0.guests = g0; T.loadArea(a0); return { none, withN, back: ROCKSIDE.allies.length }; });
  ok('allies only help after being rescued (guest exception for area 1; checkpoint Astarte -> lantern)', gate.none === 1 && gate.withN === 'LN' && gate.back === 4, gate);
  await ctx.close();
  // Escape / TITLE button goes back to the title
  ({ ctx, page } = await newPage(browser, 390, 844));
  await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(200);
  { const B = await G(page, () => ROCKSIDE.SEL_BACK); const c = await gameToClient(page, B.x + B.w / 2, B.y + B.h / 2); await page.mouse.click(c.x, c.y); }
  ok('select TITLE button -> title', await waitState(page, 'title', 2000));
  // all 8 outer areas cleared -> centre unlocked (fake progress); keyboard Delete twice erases it
  const ROCKSIDE_OUTER_IDS = await G(page, () => ROCKSIDE.AREAS.filter(a => !a.final).map(a => a.id));
  await page.evaluate(([k, ROCKSIDE_OUTER_IDS]) => localStorage.setItem(k, JSON.stringify({ cleared: ROCKSIDE_OUTER_IDS, rescued: [] })), [await G(page, () => ROCKSIDE.PROGRESS_KEY), ROCKSIDE_OUTER_IDS]);
  await page.reload(); await sleep(600);
  ok('centre unlocks after all 8 are cleared', await G(page, () => ROCKSIDE.finalUnlocked() && ROCKSIDE.clearedCount() === 8));
  // v10: with all 8 cleared the centre opens and launches the final area (幽境の掃除館)
  await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(250);
  await page.screenshot({ path: path.join(SHOTS, 'v10_select_allclear_test.png') });
  r7 = await tryKey(4);
  ok('all 8 cleared: centre unlocked, Enter -> final area intro (幽境の掃除館)', r7.st === 'areaIntro' && !r7.msg && (await G(page, () => ROCKSIDE.finalUnlocked() && ROCKSIDE.AREAS.filter(a => !a.final).every(a => ROCKSIDE._test.isCleared(a.id)))), r7);
  ok('final area intro -> stage starts (curArea final)', await waitState(page, 'play', 8000) && (await G(page, () => ROCKSIDE.curArea)) === 'final');
  await page.reload(); await sleep(600);
  await page.keyboard.press('Delete'); await sleep(60); await page.keyboard.press('Delete'); await sleep(60);
  ok('Delete x2 on title erases progress', await G(page, () => ROCKSIDE.clearedCount() === 0 && !ROCKSIDE.finalUnlocked()));
  await ctx.close();
  // ?unlockall=1: centre unlocked without progress (not saved); its stage is not built yet -> COMING SOON
  ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?unlockall=1'));
  await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(200);
  for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowRight'); await sleep(40); }
  await page.keyboard.press('Enter'); await sleep(120);
  r7 = await G(page, () => ({ un: ROCKSIDE.finalUnlocked(), c: ROCKSIDE.selCursor, msg: ROCKSIDE.selMsg, saved: localStorage.getItem(ROCKSIDE.PROGRESS_KEY) }));
  r7.st = await G(page, () => ROCKSIDE.state);
  ok('?unlockall=1 unlocks the centre (final area launches, nothing saved)', r7.un && r7.c === 4 && !r7.msg && r7.st === 'areaIntro' && !r7.saved, r7);
  await sleep(250);
  await page.screenshot({ path: path.join(SHOTS, 'v3_select_unlockall.png') });
  await ctx.close();
  // landscape: select screen fits, cell taps work
  ({ ctx, page, cdp } = await newPage(browser, 844, 390));
  await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(250);
  { const c = await cellCenter(page, 6); await touches(cdp, 'touchStart', [c]); await touches(cdp, 'touchEnd', []); await sleep(100); }
  ok('landscape: tap on a cell selects it', (await G(page, () => ROCKSIDE.selCursor)) === 6);
  await page.keyboard.press('Enter'); await sleep(150);
  await page.screenshot({ path: path.join(SHOTS, 'v3_select_landscape.png') });
  await ctx.close();

  // ---------------- 8. v4: friend DARK stages (?area=N), bosses, rescue -> select face ----------------
  const BOT = require('./bossbot.js');
  const ROCKSIDE_CFG = await (async () => { const pg = await browser.newPage(); await pg.goto(FILE); await sleep(200); const c = await pg.evaluate(() => ROCKSIDE.CONFIG.bosses); await pg.close(); return c; })();
  // v5: HP bar scales with max HP: one pip per HP, never wider than the cap, never overlapping the player bar
  { const pg = await browser.newPage(); await pg.goto(FILE); await sleep(200);
    const bars = await pg.evaluate(() => { const C = ROCKSIDE.CONFIG, G = ROCKSIDE._test.barGeom, me = G(C.playerMaxHP), out = {};
      for (const [k, hp] of [['tobiume', C.boss.hp], ['neenia', C.bosses.neenia.hp], ['seiten', C.bosses.seiten.hp], ['astarte', C.bosses.astarte.hp], ['lily', C.bosses.lily.hp], ['disaster', C.bosses.disaster.hp], ['shiranui', C.bosses.shiranui.hp], ['diceroll', C.bosses.diceroll.hp]]) { const g = G(hp); out[k] = { hp, w: g.w, step: g.step, pip: g.pip, gap: (256 - 8 - g.w - 2) - (8 + me.w + 2) }; }
      return out; });
    await pg.close();
    ok('boss HP bars scale to max HP (<=124px, 1 pip per HP, no overlap with UMINE bar)', Object.values(bars).every(b => b.w <= 124 && b.w === b.hp * b.step + 3 && b.pip >= 2 && b.gap > 8) && bars.astarte.hp === 40, bars); }
  // hud = romanized name shown in game (ids stay neenia/astarte for saves + files). screens/minEn/allies = stage expectations.
  const V4 = [{ no: 2, id: 'neenia', slot: 2, hud: 'NENIA', screens: 9, minEn: 8, allies: 'L', pats: ['aim', 'rain', 'backstep', 'rico', 'lob', 'snare'], shot: 'v4_neenia_boss.png', stage: 'v4_stage2.png' },
              { no: 3, id: 'seiten', slot: 6, hud: 'SEITEN', screens: 9, minEn: 8, allies: 'L', pats: ['pounce', 'song', 'multi'], shot: 'v4_seiten_boss.png', stage: 'v4_stage3.png' },
              { no: 4, id: 'astarte', slot: 8, hud: 'ASTARTHE', screens: 9, minEn: 8, allies: 'L', pats: ['slash', 'warp', 'orbs'], shot: 'v4_astarte_boss.png', stage: 'v4_stage4.png' },
              { no: 5, id: 'disaster', friend: 'star', slot: 1, hud: 'DISASTER', screens: 7, minEn: 8, allies: 'L', pats: ['sword', 'spear', 'axe', 'scythe', 'bow', 'whip', 'lance'], shot: 'v7_disaster_boss_test.png', stage: 'v7_disaster_stage_test.png' },
              { no: 6, id: 'lily', slot: 3, hud: 'LILY', screens: 6, minEn: 4, allies: 'L', pats: ['rain', 'song', 'notes', 'hearts', 'moon', 'line'], shot: 'v6_lily_boss.png', stage: 'v6_stage_lily.png' },
              { no: 7, id: 'shiranui', slot: 5, hud: 'SHIRANUI', screens: 9, minEn: 8, allies: 'L', pats: ['volley', 'wisp', 'crescent', 'fan', 'pillar', 'illusion'], shot: 'v8_shiranui_boss_test.png', stage: 'v8_shiranui_stage_test.png' },
              { no: 8, id: 'diceroll', slot: 7, hud: 'DICEROLL', screens: 9, minEn: 8, allies: 'L', pats: ['fate', 'dice', 'cards', 'boomerang', 'chips', 'roulette'], shot: 'v9_diceroll_boss_test.png', stage: 'v9_casino_stage_test.png' }];
  const ONLY = process.env.AREAS ? process.env.AREAS.split(',') : null; // e.g. AREAS=lily node tools/test.js (still runs everything else)
  for (const A of V4) {
    if (ONLY && !ONLY.includes(A.id)) continue;
    // 8a. launch + a gameplay screenshot (god mode, holding right + shot for a few seconds)
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=' + A.no + '&god=1'));
    ok(`?area=${A.no} launches ${A.id} stage`, await waitState(page, 'play', 4000) && (await G(page, () => ROCKSIDE.curArea)) === A.id);
    const info = await G(page, () => ({ allies: ROCKSIDE.allies.map(a => a.type).join(''), levelW: ROCKSIDE.levelW, en: ROCKSIDE.enemies.length }));
    ok(`${A.id}: no helpers before any rescue (checkpoint = lantern), ${info.en} enemies, ${A.screens} screens`, info.allies === A.allies && info.levelW === A.screens * 256 && info.en >= A.minEn, info);
    await G(page, BOT.RUNNER); const t0 = Date.now(); let shotTaken = false;
    while (Date.now() - t0 < 40000) { // frame-accurate runner (hold right + shot, jump at walls/ledges) until the boss door
      const s = await G(page, () => ({ x: ROCKSIDE.P.x, st: ROCKSIDE.state, rx: ROCKSIDE.roomX }));
      if (s.st !== 'play' || s.x > s.rx - 40) break;
      if (!shotTaken && Date.now() - t0 > 2500 && (Date.now() - t0 > 14000 || await G(page, () => ROCKSIDE.enemies.some(e => e.alive && e.active && e.x > ROCKSIDE.cam.x + 8 && e.x < ROCKSIDE.cam.x + 248 && Math.abs(e.x - ROCKSIDE.P.x) > 50)))) { await page.screenshot({ path: path.join(SHOTS, A.stage) }); shotTaken = true; }
      await sleep(50);
    }
    await G(page, () => { window.__rocksideBot = null; });
    const jumps = await G(page, () => window.__runStats.jumps);
    const end = await G(page, () => ({ x: Math.round(ROCKSIDE.P.x), rx: ROCKSIDE.roomX, st: ROCKSIDE.state, cp: ROCKSIDE.checkpoint }));
    ok(`${A.id}: stage traversable to the boss door by a simple runner (lantern checkpoint lit)`, (end.x > end.rx - 60 || end.st === 'bossIntro') && end.cp, { ...end, jumps });
    await ctx.close();
    // 8b. boss: dodge (bot) until all 3 patterns were seen, then fire; rescue -> clear -> saved -> select face
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=' + A.no + '&boss=1&god=1'));
    await waitState(page, 'play', 4000);
    await page.keyboard.down('ArrowRight');
    ok(`${A.id}: boss room triggers intro`, await waitState(page, 'bossIntro', 10000));
    await page.keyboard.up('ArrowRight');
    ok(`${A.id}: boss intro -> fight (HUD ${A.hud})`, await waitState(page, 'play', 15000) && (await G(page, () => ROCKSIDE.BOSS_TYPES[ROCKSIDE.AREAS.find(a => a.id === ROCKSIDE.curArea).boss].hud)) === A.hud);
    await G(page, BOT.BOSS);
    // v5: per-frame recorder of the new Neenia attacks (projectile kinds, bounces, floor marks, ricochet path, thorn patches)
    await G(page, () => { const R = ROCKSIDE, rec = window.__rec = { kinds: {}, bounced: false, marksLob: 0, marksSnare: 0, ricoPath: 0, ricoLock: false, thorns: 0, maxHp: 0, hpShownMax: 0 };
      const f = () => { const b = R.boss; rec.maxHp = Math.max(rec.maxHp, b.hp); rec.hpShownMax = Math.max(rec.hpShownMax, b.hpShown);
        for (const q of R.bullets) if (q.active) { rec.kinds[q.kind] = (rec.kinds[q.kind] || 0) + 1; if (q.kind === 14 && q.bnc < R.CONFIG.bosses.neenia.ricoBounces) rec.bounced = true; if (q.kind === 16) rec.thorns = Math.max(rec.thorns, q.w); }
        if (b.markT) for (let i = 0; i < b.markT.length; i++) if (b.markT[i] > 0) { if (b.markK[i]) rec.marksSnare++; else rec.marksLob++; }
        if (b.ricoShow) { rec.ricoPath = Math.max(rec.ricoPath, b.ricoN); if (b.ricoLock) rec.ricoLock = true; }
        requestAnimationFrame(f); }; requestAnimationFrame(f); });
    let shot = false, rescueShot = null; const tb = Date.now();
    while (Date.now() - tb < 150000) {
      const s = await G(page, a => ({ st: ROCKSIDE.state, bs: ROCKSIDE.boss.state, bt: ROCKSIDE.boss.t, seen: ROCKSIDE.bossSeen, hp: ROCKSIDE.boss.hp, flash: ROCKSIDE.boss.flash, n: ROCKSIDE.bullets.filter(b => b.active).length, good: (() => { const b = ROCKSIDE.boss, act = k => ROCKSIDE.bullets.some(q => q.active && q.kind === k);
        return a === 'neenia' ? (b.rainN > 0 && b.warn < 40) || (act(6) && ROCKSIDE.bullets.filter(q => q.active && q.kind === 6).length >= 2)
          : a === 'seiten' ? (b.state === 'sing' && b.t > 24 && act(8)) || (b.state === 'leap' && b.t > 10)
          : a === 'astarte' ? (b.state === 'orbs' && b.t > 70) || (b.state === 'warpWarn' && b.warn < 24) || act(9)
          : a === 'disaster' ? (['disSpear', 'disChain', 'disAxe', 'disMorph'].includes(b.state) && b.t > 10) || act(9) || act(21) || act(22)
          : a === 'shiranui' ? act(24) || act(25) || act(27) || act(28) || act(9)
          : a === 'diceroll' ? act(29) || act(30) || act(31) || act(32) || act(33) || (b.state === 'drFate' && b.fateN > 0)
          : ROCKSIDE.bullets.filter(q => q.active).length >= 3; })(), bx: ROCKSIDE.boss.x, px: ROCKSIDE.P.x }), A.id);
      const pre = A.id === 'seiten' ? A.pats.slice(0, 2) : A.pats;
      if (pre.every(p => s.seen.includes(p))) await G(page, () => { window.__botCfg.fire = true; });
      if (s.st === 'clear') break;
      if (!shot && s.flash === 0 && s.bs !== 'rescue' && s.good && Math.abs(s.bx - s.px) > 36 && s.seen.length >= 2) { await page.screenshot({ path: path.join(SHOTS, A.shot) }); shot = true; }
      if (s.bs === 'rescue' && !rescueShot && s.bt >= 190) { rescueShot = await G(page, () => ({ dark: ROCKSIDE.boss.dark, pose: ROCKSIDE.boss.pose })); await page.screenshot({ path: path.join(SHOTS, 'v4_' + A.id + '_rescued.png') }); }
      await sleep(80);
    }
    const seen = await G(page, () => ROCKSIDE.bossSeen);
    ok(`${A.id}: all ${A.pats.length} boss patterns seen (${A.pats.join('/')})`, A.pats.every(p => seen.includes(p)), seen);
    const rec = await G(page, () => window.__rec);
    if (A.id === 'neenia') { // v5: each new pattern actually observed in the fight (its projectiles + its telegraph)
      ok('neenia v5 ricochet: dotted bounce path shown, locked, arrow fired and bounced', rec.ricoPath >= 3 && rec.ricoLock && rec.kinds[14] > 0 && rec.bounced, { path: rec.ricoPath, lock: rec.ricoLock, n: rec.kinds[14], bounced: rec.bounced });
      ok('neenia v5 lobbed volley: floor marks + arcing arrows observed', rec.marksLob > 0 && rec.kinds[13] > 0, { marks: rec.marksLob, n: rec.kinds[13] });
      ok('neenia v5 thorn snare: marked snare arrow -> thorn patch on the floor', rec.marksSnare > 0 && rec.kinds[15] > 0 && rec.kinds[16] > 0 && rec.thorns === ROCKSIDE_CFG.neenia.snareW, { marks: rec.marksSnare, arrow: rec.kinds[15], patch: rec.kinds[16], w: rec.thorns });
      ok('neenia v5 max HP 34 (was 28), HP bar filled to 34', rec.maxHp === 34 && rec.hpShownMax === 34 && ROCKSIDE_CFG.neenia.hp === 34, { maxHp: rec.maxHp, shown: rec.hpShownMax });
    }
    if (A.id === 'astarte') {
      ok('astarte v5 max HP 40 (was 28), HP bar filled to 40', rec.maxHp === 40 && rec.hpShownMax === 40 && ROCKSIDE_CFG.astarte.hp === 40, { maxHp: rec.maxHp, shown: rec.hpShownMax });
    }
    ok(`${A.id}: ${A.shot} captured`, shot);
    ok(`${A.id}: defeat -> returns to normal + thank-you line`, !!rescueShot && !rescueShot.dark, rescueShot);
    ok(`${A.id}: rescue -> STAGE CLEAR`, await waitState(page, 'clear', 8000));
    ok(`${A.id}: clear saved (area cleared + ${A.friend || A.id} rescued)`, await G(page, a => { const d = JSON.parse(localStorage.getItem(ROCKSIDE.PROGRESS_KEY) || '{}'); return d.cleared.includes(a[0]) && d.rescued.includes(a[1]); }, [A.id, A.friend || A.id]));
    await sleep(1400); await page.keyboard.press('Enter');
    ok(`${A.id}: clear -> select, cursor on its cell`, await waitState(page, 'select', 3000) && (await G(page, () => ROCKSIDE.selCursor)) === A.slot);
    const face = await G(page, a => ROCKSIDE._test.portraitFace(ROCKSIDE.AREAS.find(x => x.id === a)), A.id);
    ok(`${A.id}: select shows the rescued (normal) face + CLEAR`, face === 'face_' + (A.friend || A.id) && (await G(page, a => ROCKSIDE._test.isCleared(a), A.id)), face);
    await ctx.close();
  }
  // 8c. select with faces: dark faces for uncleared bosses (fresh), normal faces once cleared (all 4)
  ({ ctx, page } = await newPage(browser, 390, 844));
  await page.keyboard.press('Enter'); await waitState(page, 'select');
  const PLAYABLE = await G(page, () => ROCKSIDE.AREAS.filter(a => a.map).map(a => [a.id, a.face, a.faceRescued]));
  const faces0 = await G(page, () => ROCKSIDE.AREAS.filter(a => a.map).map(a => ROCKSIDE._test.portraitFace(a)));
  ok('select: dark face icons for uncleared bosses', faces0.join() === PLAYABLE.map(a => a[1]).join() && (await G(page, () => ['face_neenia_dark', 'face_tobiume', 'neeniaDark', 'seitenDark', 'astarteDark'].every(k => ROCKSIDE.SHEETS_LOADED.includes(k)))), faces0);
  await sleep(300); await page.screenshot({ path: path.join(SHOTS, 'v4_select.png') });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['sunset', 'neenia'], rescued: ['tobiume', 'neenia'] })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.reload(); await sleep(500); await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(300);
  const faces1 = await G(page, () => ROCKSIDE.AREAS.filter(a => a.map).map(a => ROCKSIDE._test.portraitFace(a)));
  ok('select: normal faces once cleared/rescued (2/8)', faces1.join() === PLAYABLE.map(a => a[0] === 'sunset' || a[0] === 'neenia' ? a[2] : a[1]).join() && (await G(page, () => ROCKSIDE.clearedCount())) === 2, faces1);
  await page.screenshot({ path: path.join(SHOTS, 'v4_select_cleared.png') });
  // 8d. helpers in the new stages follow the rescue rule; never in their own stage
  const helpers = await G(page, () => { const T = ROCKSIDE._test, A = id => ROCKSIDE.AREAS.find(a => a.id === id), out = {};
    const pr = ROCKSIDE.progress.rescued; pr.length = 0; pr.push('tobiume', 'neenia', 'seiten', 'astarte', 'shiranui', 'diceroll');
    for (const id of ['neenia', 'seiten', 'astarte', 'shiranui', 'disaster', 'diceroll']) { T.loadArea(A(id)); out[id] = ROCKSIDE.allies.map(a => a.type).sort().join(''); }
    pr.length = 0; pr.push('neenia'); T.loadArea(A('seiten')); out.seitenWithN = ROCKSIDE.allies.map(a => a.type).sort().join('');
    pr.length = 0; T.loadArea(A('sunset')); out.sunset = ROCKSIDE.allies.length;
    pr.push('tobiume', 'neenia', 'seiten', 'astarte', 'lily'); T.loadArea(A('lily')); out.lily = ROCKSIDE.allies.map(a => a.type).sort().join('');
    ROCKSIDE.progress.support = 'lily'; T.loadArea(A('neenia')); out.neeniaLilySup = ROCKSIDE.allies.map(a => a.type).sort().join('');
    T.loadArea(A('lily')); out.lilyLilySup = ROCKSIDE.allies.map(a => a.type).sort().join('');
    ROCKSIDE.progress.support = null; pr.length = 0; return out; });
  ok('helpers: all rescued -> each stage has the others (never herself; Shiranui K joins Night City / Star Shrine / Disaster Castle / Casino, DiceRoll R joins Moon Forest / Foxfire Shrine / Lily stage), area 1 guests kept; Lily joins only as equipped support, never in her own stage', helpers.neenia === 'ARS' && helpers.seiten === 'AKN' && helpers.astarte === 'KLNS' && helpers.shiranui === 'ANRS' && helpers.disaster === 'AK' && helpers.diceroll === 'AKS' && helpers.seitenWithN === 'LN' && helpers.sunset === 4 && helpers.lily === 'AS' && helpers.neeniaLilySup === 'AIS' && helpers.lilyLilySup === 'AS', helpers);
  await ctx.close();

  // ---------------- 6. sprite sheets: --embed standalone build, ?sprites=folder, ?sprites=0 ----------------
  const tmp = '/tmp/rockside_sheet_test'; fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  execFileSync('python3', [path.join(ROOT, 'tools/build.py'), '--embed', '--out', tmp + '/index.html']);
  const srvT = await SERVE.start(tmp);
  // 6a. the --embed single file alone (no assets/ folder) still shows the legacy cast from embedded data URIs;
  //     only the newer folder-only sheets (Lily / Umimi / ...) may be missing
  let missBefore = assetMisses.length;
  ({ ctx, page } = await newPage(browser, 390, 844, srvT.url + 'index.html'));
  await sleep(400);
  let loaded = await G(page, () => ROCKSIDE.SHEETS_LOADED.slice().sort());
  const newMiss = assetMisses.slice(missBefore);
  ok('--embed standalone file uses embedded sheets (no assets/ folder)', ['astarte', 'kanon', 'neenia', 'seiten', 'tobiume'].every(k => loaded.includes(k)) && newMiss.every(u => /lily|umimi|disaster|star|alchemic|transform_fx|shiranui|diceroll|kanata|mimic|party|sea_split|umine_spell|umine_dark/.test(u)), { loaded, misses: newMiss.length });
  await page.screenshot({ path: path.join(SHOTS, 'v2_standalone_title.png') });
  await ctx.close();
  // 6b. default build + a dummy assets/ folder: the folder sheets are used
  fs.copyFileSync(path.join(ROOT, 'index.html'), tmp + '/index.html');
  fs.mkdirSync(tmp + '/assets', { recursive: true });
  { const p2 = await browser.newPage();
    const sheets = await p2.evaluate(() => {
      const mk = (fw, fh, n, col) => { const c = document.createElement('canvas'); c.width = fw * n; c.height = fh; const g = c.getContext('2d');
        for (let i = 0; i < n; i++) { g.fillStyle = col; g.fillRect(i * fw + fw * 0.25, fh * 0.2, fw * 0.5, fh * 0.8); g.fillStyle = '#fff'; g.font = 'bold 10px sans-serif'; g.fillText(String(i), i * fw + fw * 0.35, fh * 0.6); }
        return c.toDataURL('image/png').split(',')[1]; };
      return { kanon: mk(32, 32, 14, '#2a60ff'), tobiume_dark: mk(48, 48, 8, '#802050'), neenia: mk(32, 32, 2, '#c0c8ff'), seiten: mk(32, 32, 2, '#301018'), astarte: mk(32, 32, 2, '#202860') };
    });
    for (const k in sheets) fs.writeFileSync(`${tmp}/assets/${k}.png`, Buffer.from(sheets[k], 'base64'));
    await p2.close(); }
  ({ ctx, page } = await newPage(browser, 390, 844, srvT.url + 'index.html?sprites=folder'));
  await sleep(400);
  loaded = await G(page, () => ROCKSIDE.SHEETS_LOADED.slice().sort());
  ok('?sprites=folder picks up assets/*.png', ['astarte', 'kanon', 'neenia', 'seiten', 'tobiume'].every(k => loaded.includes(k)), loaded);
  await startArea1(page);
  await page.keyboard.down('ArrowRight'); await sleep(700); await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: path.join(SHOTS, 'v2_sheet_loader_test.png') });
  await ctx.close();
  // 6c. ?sprites=0 = procedural art only, nothing requested
  missBefore = assetMisses.length;
  ({ ctx, page } = await newPage(browser, 390, 844, srvT.url + 'index.html?sprites=0'));
  await sleep(300);
  ok('?sprites=0 disables sheets', (await G(page, () => ROCKSIDE.SHEETS_LOADED.length)) === 0 && assetMisses.length === missBefore);
  await startArea1(page); await sleep(300);
  await page.screenshot({ path: path.join(SHOTS, 'v2_procedural.png') });
  await ctx.close();
  srvT.close();

  // ---------------- 9. v6 systems: header layout, saves, support/HELP, Umimi + LIVE, ORB magic, hard mode ----------------
  ({ ctx, page } = await newPage(browser, 390, 844));
  { const hdr = await G(page, () => { const SB = ROCKSIDE.SEL_SUPPORT, B = ROCKSIDE.SEL_BACK, tw = (s, k) => s.length * 6 * k - k;
      const stagesL = 170 - (tw('STAGES', 2) >> 1), counterL = 251 - tw('8/8', 1);
      const fit = ROCKSIDE.AREAS.filter(a => a.map).map(a => [a.id, tw(ROCKSIDE._test.cellLabel(a), 1)]);
      return { backR: B.x + B.w, supL: SB.x, supR: SB.x + SB.w, stagesL, stagesR: stagesL + tw('STAGES', 2), counterL, supTextW: tw('SUP:ASTARTHE', 1), fit, cw: 76 }; });
    ok('select header: TITLE | SUP | STAGES | n/8 do not overlap, longest SUP tag fits', hdr.backR < hdr.supL && hdr.supR + 2 < hdr.stagesL && hdr.stagesR + 2 < hdr.counterL && hdr.supTextW <= hdr.supR - hdr.supL - 4, hdr);
    ok('select: every English cell label fits its cell', hdr.fit.every(([, w]) => w <= hdr.cw - 4), hdr.fit); }
  // old (v5) save format {cleared, rescued} without "support" still loads; new saves keep the same key
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['sunset', 'neenia'], rescued: ['tobiume', 'neenia'] })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.reload(); await sleep(500);
  ok('v5 save data (no support field) loads unchanged under rockside_progress_v1', await G(page, () => ROCKSIDE.PROGRESS_KEY === 'rockside_progress_v1' && ROCKSIDE.clearedCount() === 2 && ROCKSIDE.progress.rescued.join() === 'tobiume,neenia' && ROCKSIDE.progress.support === null));
  // SUP box cycles rescued friends and is saved
  await page.keyboard.press('Enter'); await waitState(page, 'select'); await sleep(200);
  await page.keyboard.press('KeyV'); await sleep(80);
  ok('SUP cycle (V) equips a rescued friend and saves it', await G(page, () => ROCKSIDE.progress.support === 'tobiume' && JSON.parse(localStorage.getItem(ROCKSIDE.PROGRESS_KEY)).support === 'tobiume'));
  await page.keyboard.press('Enter'); await sleep(80); // close message
  await page.screenshot({ path: path.join(SHOTS, 'v6_select_header.png') });
  await ctx.close();
  // HELP button + Lily support -> Umimi follows (6 HP), LIVE usable once; Umimi down -> LIVE disabled
  ({ ctx, page } = await newPage(browser, 390, 844));
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['lily'], rescued: ['lily'], support: 'lily' })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.goto(FILE + '?area=2&god=1'); await waitState(page, 'play', 4000);
  ok('Lily support: Lily appears at the start of another stage', await G(page, () => ROCKSIDE.allies.some(a => a.type === 'I')));
  await page.keyboard.down('ArrowRight'); await sleep(900); await page.keyboard.up('ArrowRight');
  ok('Lily hands over Umimi (6 HP follower) and HELP shows LIVE', await waitFor(page, () => ROCKSIDE.stageUmimi.given && ROCKSIDE.stageUmimi.hp === 6, 3000) && (await G(page, () => document.getElementById('bSupport').textContent)) === 'LIVE');
  await page.keyboard.press('KeyB'); await sleep(100);
  ok('LIVE cast (B) uses the support once', await G(page, () => ROCKSIDE.support.used && ROCKSIDE.support.active && ROCKSIDE.support.kind === 'lily'));
  await waitFor(page, () => !ROCKSIDE.support.active, 4000);
  await page.evaluate(() => { const R = ROCKSIDE; R.support.used = false; R.stageUmimi.hp = 1; R.stageUmimi.inv = 0; });
  await page.evaluate(() => { const u = ROCKSIDE.stageUmimi; const b = ROCKSIDE.bullets.find(q => !q.active); Object.assign(b, { active: true, kind: 2, x: u.x - 3, y: u.y - 16, w: 6, h: 6, vx: 0, vy: 0, dmg: 2, t: 0, life: 0, orbit: false, g: 0, bnc: 0 }); });
  await sleep(150);
  ok('Umimi at 0 HP -> DOWN, LIVE unavailable', await G(page, () => ROCKSIDE.stageUmimi.down && document.getElementById('bSupport').textContent === 'DOWN'));
  await page.keyboard.press('KeyB'); await sleep(80);
  ok('LIVE cannot be cast while Umimi is down', await G(page, () => !ROCKSIDE.support.active));
  // ORB magic: costs MP, creates a temporary foothold
  const mp0 = await G(page, () => ROCKSIDE.magic.mp);
  await page.keyboard.press('KeyC'); await sleep(80);
  ok('ORB (C) spends MP and creates a water-orb foothold', await G(page, m => ROCKSIDE.magic.orb && ROCKSIDE.magic.mp === m - ROCKSIDE.CONFIG.magicOrbCost, mp0));
  await ctx.close();
  // スターさん support (MORPH): sword slash + spear thrust damage enemies ahead
  ({ ctx, page } = await newPage(browser, 390, 844));
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['disaster'], rescued: ['star'], support: 'star' })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.goto(FILE + '?area=1&god=1'); await waitState(page, 'play', 4000);
  ok('Star support equipped: HELP shows MORPH', await waitFor(page, () => document.getElementById('bSupport').textContent === 'MORPH', 2000));
  const sw = await G(page, () => { const R = ROCKSIDE, e = R.enemies.find(q => q.alive); R.teleport(e.x - 60, e.y + e.h - R.P.h); R.P.face = 1; return R.enemies.indexOf(e); });
  await sleep(200); const ehp = await G(page, i => ROCKSIDE.enemies[i].hp, sw);
  await page.keyboard.press('KeyB'); await sleep(1400);
  ok('MORPH slash/thrust damages the enemy ahead and ends', await G(page, ([i, h]) => { const e = ROCKSIDE.enemies[i]; return (!e.alive || e.hp < h) && ROCKSIDE.support.used && !ROCKSIDE.support.active; }, [sw, ehp]));
  await ctx.close();
  // シラヌイ support (FOX): homing foxfires damage the enemy ahead
  ({ ctx, page } = await newPage(browser, 390, 844));
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['shiranui'], rescued: ['shiranui'], support: 'shiranui' })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.goto(FILE + '?area=1&god=1'); await waitState(page, 'play', 4000);
  ok('Shiranui support equipped: HELP shows FOX', await waitFor(page, () => document.getElementById('bSupport').textContent === 'FOX', 2000));
  const sf = await G(page, () => { const R = ROCKSIDE, e = R.enemies.find(q => q.alive); R.teleport(e.x - 70, e.y + e.h - R.P.h); R.P.face = 1; return R.enemies.indexOf(e); });
  await sleep(200); const fhp = await G(page, i => ROCKSIDE.enemies[i].hp, sf);
  await page.keyboard.press('KeyB'); await sleep(2600);
  ok('FOX foxfires home in, damage the enemy and the move ends', await G(page, ([i, h]) => { const e = ROCKSIDE.enemies[i]; return (!e.alive || e.hp < h) && ROCKSIDE.support.used && !ROCKSIDE.support.active; }, [sf, fhp]));
  // シラヌイ helper (K) in Night City once rescued: shoots homing foxfire
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['shiranui'], rescued: ['shiranui'], support: null })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.goto(FILE + '?area=3&god=1'); await waitState(page, 'play', 4000);
  const kInfo = await G(page, () => { const R = ROCKSIDE, k = R.allies.find(a => a.type === 'K'); if (!k) return null; R.teleport(k.x - 20, k.y - R.P.h); return { x: k.x }; });
  await sleep(2500);
  ok('Shiranui helper (K) appears in Night City after her rescue and fires foxfire', !!kInfo && (await G(page, () => ROCKSIDE.allies.find(a => a.type === 'K').said)), kInfo);
  await ctx.close();
  // ダイスロール support (ROLL): die face N shown, N homing cards damage the enemy ahead
  ({ ctx, page } = await newPage(browser, 390, 844));
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['diceroll'], rescued: ['diceroll'], support: 'diceroll' })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.goto(FILE + '?area=1&god=1'); await waitState(page, 'play', 4000);
  ok('DiceRoll support equipped: HELP shows ROLL', await waitFor(page, () => document.getElementById('bSupport').textContent === 'ROLL', 2000));
  const sr = await G(page, () => { const R = ROCKSIDE, e = R.enemies.find(q => q.alive); R.teleport(e.x - 70, e.y + e.h - R.P.h); R.P.face = 1; return R.enemies.indexOf(e); });
  await sleep(200); const rhp = await G(page, i => ROCKSIDE.enemies[i].hp, sr);
  await page.keyboard.press('KeyB'); await sleep(300);
  const rollN = await G(page, () => ROCKSIDE.support.kind === 'diceroll' ? ROCKSIDE.support.n : 0);
  await sleep(2700);
  ok('ROLL: die shows a face 1-6, cards home in, damage the enemy and the move ends', rollN >= 1 && rollN <= 6 && await G(page, ([i, h]) => { const e = ROCKSIDE.enemies[i]; return (!e.alive || e.hp < h) && ROCKSIDE.support.used && !ROCKSIDE.support.active; }, [sr, rhp]), { rollN });
  // ダイスロール helper (R) in Moon Forest once rescued: lobs dice
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['diceroll'], rescued: ['diceroll'], support: null })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.goto(FILE + '?area=2&god=1'); await waitState(page, 'play', 4000);
  const rInfo = await G(page, () => { const R = ROCKSIDE, k = R.allies.find(a => a.type === 'R'); if (!k) return null; R.teleport(k.x - 20, k.y - R.P.h); return { x: k.x }; });
  await sleep(2500);
  ok('DiceRoll helper (R) appears in Moon Forest after her rescue and greets Umine', !!rInfo && (await G(page, () => ROCKSIDE.allies.find(a => a.type === 'R').said)), rInfo);
  await ctx.close();
  // v9b: DiceRoll card fans always leave a safe gap on Umine's standing spot (fate 3-4, normal 4/5, ALL IN 5):
  //      Umine stands still on the floor at several distances on both sides -> no card hits her
  ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=8&boss=1'));
  await waitState(page, 'play', 4000); await page.keyboard.down('ArrowRight'); await waitState(page, 'bossIntro', 10000); await page.keyboard.up('ArrowRight');
  await waitState(page, 'play', 15000);
  await G(page, () => { const R = ROCKSIDE; (function f() { const b = R.boss; if (b.state === 'drRecover' || b.state === 'hover') { b.state = 'drRecover'; b.recT = 1e9; b.comboLeft = 0; } requestAnimationFrame(f); })(); });
  const fanRes = [];
  for (const [n, dx] of [[3, -90], [4, 60], [4, -130], [5, 90], [5, -45], [5, 150]]) {
    fanRes.push(await G(page, async ([n, dx]) => { const R = ROCKSIDE, b = R.boss, P = R.P; for (const q of R.bullets) q.active = false;
      b.x = R.roomX + 128 - b.w / 2; b.allin = true; b.allinStep = 0; R.teleport(b.x + b.w / 2 + dx - P.w / 2, R.floorY - P.h); P.hp = 99; P.inv = 0;
      await new Promise(r => setTimeout(r, 100));
      b.fateCount = n; b.cardW = 0; b.cardAngs = null; b.state = 'drCards'; b.t = 0; let spawned = 0;
      const t0 = performance.now(); await new Promise(res => { (function f() { spawned = Math.max(spawned, R.bullets.filter(q => q.active && q.kind === 30).length); if (performance.now() - t0 > 3200) return res(); requestAnimationFrame(f); })(); });
      return { n, dx, cards: spawned, dmg: 99 - P.hp }; }, [n, dx]));
  }
  ok('DiceRoll card fans (3/4/5 cards): standing still on the green mark is always safe (gap aimed at the standing spot)', fanRes.every(r => r.dmg === 0 && r.cards === r.n), fanRes);
  await ctx.close();
  // v9b: boomerang cards (one at a time, constant speed, snap back): a stand/jump schedule exists at every distance
  { const B = ROCKSIDE_CFG.diceroll, Cg = 0.25, JV = 5, CUT = 1.0, PH = 20, PW = 10, CW = 8, CH = 12, bad = [];
    for (const wall of [999, 70, 110]) for (const n of [3, 4]) {
      const pos = []; let i = 0, next = 18, c = null;
      for (let t = 0; t < 500; t++) { const fr = [];
        if (!c && i < n && t >= next) { c = { y: (i & 1) ? -40 : -9, x: 12, vx: B.boomSpeed, back: false }; i++; }
        if (c) { if (!c.back && (c.x - 12 >= B.boomRange || c.x >= wall)) { c.back = true; c.vx = -c.vx; } c.x += c.vx; if (c.back && c.x <= 0) { c = null; next = t + B.boomGap; } else fr.push([c.x, c.y]); }
        pos.push(fr); }
      const hit = (fr, d, h) => fr.some(([x, y]) => Math.abs(x - d) < (CW + PW) / 2 && y + CH / 2 > -h - PH && y - CH / 2 < -h);
      for (let d = 14; d <= 170; d += 4) { const memo = new Map();
        const go = (t, h, vy, gr, hold) => { if (t >= pos.length) return true; const k = t + '|' + Math.round(h * 2) + '|' + Math.round(vy * 4) + '|' + (gr ? 1 : 0) + (hold ? 1 : 0); if (memo.has(k)) return memo.get(k);
          const opts = gr ? [[false, false], [true, false]] : [[false, false], ...(hold && vy < 0 ? [[false, true]] : [])]; let r = false;
          for (const [jump, cut] of opts) { let nh = h, nv = vy, ng = gr, nhold = hold;
            if (jump) { nv = -JV; ng = false; nhold = true; } if (cut) { nv = Math.max(nv, -CUT); nhold = false; }
            if (!ng) { nv = Math.min(nv + Cg, 7); nh -= nv; if (nh <= 0) { nh = 0; nv = 0; ng = true; nhold = false; } }
            if (!hit(pos[t], d, nh) && go(t + 1, nh, nv, ng, nhold)) { r = true; break; } }
          memo.set(k, r); return r; };
        if (!go(0, 0, 0, true, false)) bad.push(wall + '/' + n + '/' + d); } }
    ok('DiceRoll boomerang cards: a jump/stand answer exists at every distance (one card at a time, low=jump / high=stay down)', bad.length === 0, bad.slice(0, 10)); }

  // ===== v10 FINAL AREA: stage, boss rush, 清掃員カナタ (2 forms), climax, finale, save =====
  if (!ONLY || ONLY.includes('final')) {
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=9&god=1'));
    ok('?area=9 launches the final area', await waitState(page, 'play', 4000) && (await G(page, () => ROCKSIDE.curArea)) === 'final');
    let fi = await G(page, () => ({ allies: ROCKSIDE.allies.map(a => a.type).join(''), levelW: ROCKSIDE.levelW, en: ROCKSIDE.enemies.length, f: ROCKSIDE.final }));
    ok(`final: 9 screens, ${fi.en} enemies, rush starts with the shadow of Tobiume`, fi.levelW === 9 * 256 && fi.en >= 10 && fi.f.phase === 'rush' && fi.f.boss === 'tobiume', fi);
    await G(page, BOT.RUNNER); { const t0 = Date.now(); while (Date.now() - t0 < 50000) { const s = await G(page, () => ({ x: ROCKSIDE.P.x, st: ROCKSIDE.state, rx: ROCKSIDE.roomX })); if (s.st !== 'play' || s.x > s.rx - 40) break; await sleep(60); } }
    ok('final stage: runner bot reaches the boss hall', await G(page, () => ROCKSIDE.P.x > ROCKSIDE.roomX - 60));
    await G(page, () => { window.__rocksideBot = null; }); await ctx.close();
    // boss rush (god mode, bot firing): 8 shadows at 60% HP, HP refill between, then Kanata enters
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=9&god=1&boss=1'));
    await waitState(page, 'play', 4000); await page.keyboard.down('ArrowRight'); await waitState(page, 'bossIntro', 15000); await page.keyboard.up('ArrowRight');
    await waitState(page, 'play', 20000);
    const hp0 = await G(page, () => ({ hp: ROCKSIDE.boss.hp, cfg: ROCKSIDE.CONFIG.boss.hp }));
    ok('rush shadow HP = 60% of the original boss (Tobiume)', hp0.hp === Math.round(hp0.cfg * 0.6), hp0);
    await G(page, BOT.BOSS); await G(page, () => { window.__botCfg.fire = true; });
    const order = []; let refillOk = true;
    { const t0 = Date.now(); let last = -1;
      while (Date.now() - t0 < 300000) { const s = await G(page, () => ({ f: ROCKSIDE.final, hp: ROCKSIDE.P.hp, max: ROCKSIDE.playerMaxHP, st: ROCKSIDE.state }));
        if (s.f.rushIdx !== last) { if (last >= 0 && s.hp !== s.max) refillOk = false; last = s.f.rushIdx; order.push(s.f.boss); if (s.f.phase === 'rush') await G(page, () => { ROCKSIDE.P.hp = 6; }); }
        if (s.f.phase !== 'rush') break; await sleep(80); } }
    const fr = await G(page, () => ROCKSIDE.final);
    ok('boss rush: all 8 shadows in order, then 闇海音 (DARK UMINE)', fr.phase === 'darkumine' && fr.boss === 'darkumine' && order.slice(0, 8).join() === 'tobiume,neenia,seiten,astarte,disaster,lily,shiranui,diceroll', { order, fr });
    ok('boss rush: HP refilled after every shadow', refillOk && (await G(page, () => ROCKSIDE.P.hp === ROCKSIDE.playerMaxHP)));
    await ctx.close();
    // v12 闇海音 DARK UMINE: after the rush, before Kanata (placeholder shadow-tinted kanon sheet)
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=9&god=1&boss=1&darkumine=1'));
    await waitState(page, 'play', 4000); await page.keyboard.down('ArrowRight'); await waitState(page, 'bossIntro', 15000); await page.keyboard.up('ArrowRight');
    await waitState(page, 'play', 20000);
    ok('?darkumine=1: 闇海音 (HP 38) with the shadow sheet + face icon', await G(page, () => ROCKSIDE.final.boss === 'darkumine' && ROCKSIDE.boss.hp === 38 && ROCKSIDE.BOSS_TYPES.darkumine.dark === 'umineDark' && ROCKSIDE.SHEETS_LOADED.includes('umineDark') && ROCKSIDE.SHEETS_LOADED.includes('face_umine_dark')));
    await G(page, BOT.BOSS); await G(page, () => { window.__botCfg.fire = true; });
    let duAim = false, duKinds = new Set();
    { const t0 = Date.now(); while (Date.now() - t0 < 120000) {
        const r = await G(page, () => ({ st: ROCKSIDE.boss.state, aim: ROCKSIDE.boss.aimShow, k: ROCKSIDE.bullets.filter(q => q.active && q.kind >= 40 && q.kind <= 43).map(q => q.kind), seen: ROCKSIDE.bossSeen, ph: ROCKSIDE.final.phase }));
        if (r.st === 'duCharge' && r.aim) duAim = true; r.k.forEach(k => duKinds.add(k));
        if (r.st === 'rescue' || r.ph !== 'darkumine') break; await sleep(50); } }
    const seenD = await G(page, () => ROCKSIDE.bossSeen);
    ok('闇海音: shots / charge (aim line) / jump / dark Umimi all appear', ['shots', 'charge', 'jump', 'umimi'].every(p => seenD.includes(p)) && duAim && [40, 41, 43].every(k => duKinds.has(k)), { seenD, duAim, kinds: [...duKinds] });
    ok('闇海音 defeated -> fades back into 海音 -> 清掃員カナタ, HP refilled', await waitFor(page, () => ROCKSIDE.final.phase === 'kanata' && ROCKSIDE.final.boss === 'kanata' && ROCKSIDE.P.hp === ROCKSIDE.playerMaxHP, 40000));
    await ctx.close();
    // checkpoint: dying against Kanata restarts at Kanata (no replay of 闇海音)
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=9&boss=1&darkumine=1'));
    await waitState(page, 'play', 4000); await page.keyboard.down('ArrowRight'); await waitState(page, 'bossIntro', 15000); await page.keyboard.up('ArrowRight');
    await waitState(page, 'play', 20000);
    await G(page, () => { ROCKSIDE.boss.hp = 1; ROCKSIDE.boss.inv = 0; ROCKSIDE.P.inv = 9999; });
    await G(page, BOT.BOSS); await G(page, () => { window.__botCfg.fire = true; });
    await waitFor(page, () => ROCKSIDE.final.phase === 'kanata' && ROCKSIDE.state === 'play', 40000);
    await G(page, () => { window.__rocksideBot = null; ROCKSIDE.P.inv = 0; ROCKSIDE.P.y = 400; });
    await waitState(page, 'gameover', 8000); await sleep(700); await page.keyboard.press('Enter');
    let back = await waitFor(page, () => ROCKSIDE.state === 'play' && !ROCKSIDE.P.dead && ROCKSIDE.final.phase === 'kanata' && ROCKSIDE.final.boss === 'kanata' && ROCKSIDE.P.x < ROCKSIDE.roomX, 8000);
    if (back) { await page.keyboard.down('ArrowRight'); back = await waitState(page, 'bossIntro', 15000); await page.keyboard.up('ArrowRight'); back = back && await waitState(page, 'play', 20000) && (await G(page, () => ROCKSIDE.final.boss === 'kanata' && ROCKSIDE.boss.hp === 40)); }
    ok('death in the Kanata fight keeps the checkpoint (phase stays kanata, no 闇海音 replay)', back, await G(page, () => ({ f: ROCKSIDE.final, st: ROCKSIDE.state })));
    await ctx.close();
    // form 1: patterns + suction swallows a shot that comes back
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=9&god=1&boss=1&kanata=1'));
    await waitState(page, 'play', 4000); await page.keyboard.down('ArrowRight'); await waitState(page, 'bossIntro', 15000); await page.keyboard.up('ArrowRight');
    await waitState(page, 'play', 20000);
    ok('?kanata=1: 清掃員カナタ (HP 40) in the boss hall', await G(page, () => ROCKSIDE.final.boss === 'kanata' && ROCKSIDE.boss.hp === 40 && ROCKSIDE.BOSS_TYPES.kanata.dark === 'kanataBoss' && ROCKSIDE.SHEETS_LOADED.includes('kanataBoss')));
    await G(page, BOT.BOSS);
    let swallowed = 0, spat = false;
    { const t0 = Date.now(); while (Date.now() - t0 < 60000) {
        const r = await G(page, () => { const b = ROCKSIDE.boss, f = ROCKSIDE.final; if (b.state === 'kSuck' && b.t > 10 && b.t < 60 && f.swallowed === 0) { const s = ROCKSIDE.shots[0]; s.active = true; s.x = b.x + b.w / 2 + b.face * 60; s.y = b.y + b.h - 26; s.vx = -b.face * 3; s.w = 7; s.h = 5; }
          return { sw: f.swallowed, st: b.state, k37: ROCKSIDE.bullets.some(q => q.active && q.kind === 37), seen: ROCKSIDE.bossSeen }; });
        swallowed = Math.max(swallowed, r.sw); if (r.k37) spat = true;
        if (spat && ['lev', 'suck', 'ghosts', 'glide'].every(p => r.seen.includes(p))) break; await sleep(50); } }
    const seenK = await G(page, () => ROCKSIDE.bossSeen);
    ok('Kanata: levitate / suction / ghost fireballs / glide all appear', ['lev', 'suck', 'ghosts', 'glide'].every(p => seenK.includes(p)), seenK);
    ok('Kanata suction swallows Umine\'s shot and spits it back (kind 37)', swallowed > 0 && spat, { swallowed, spat });
    await G(page, () => { window.__botCfg.fire = true; });
    { const t0 = Date.now(); while (Date.now() - t0 < 90000) { if (await G(page, () => ROCKSIDE.final.phase === 'mimic' && ROCKSIDE.state === 'play')) break; await sleep(100); } }
    ok('Kanata defeated -> collapses, 暴走ミミック form 2 starts (HP 40, full HP refill)', await G(page, () => ROCKSIDE.final.boss === 'mimic' && ROCKSIDE.boss.hp === 40 && ROCKSIDE.P.hp === ROCKSIDE.playerMaxHP));
    await ctx.close();
    // form 2: patterns, climax at the threshold, sea split, finale, THE END, save
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=9&god=1&boss=1&mimic=1'));
    await waitState(page, 'play', 4000); await page.keyboard.down('ArrowRight'); await waitState(page, 'bossIntro', 15000); await page.keyboard.up('ArrowRight');
    await waitState(page, 'play', 20000);
    await G(page, BOT.BOSS);
    { const t0 = Date.now(); while (Date.now() - t0 < 60000) { if (await G(page, () => ['charge', 'bigsuck', 'leap'].every(p => ROCKSIDE.bossSeen.includes(p)))) break; await sleep(100); } }
    const seenM = await G(page, () => ROCKSIDE.bossSeen);
    ok('mimic: charge / big-mouth suction / leap all appear', ['charge', 'bigsuck', 'leap'].every(p => seenM.includes(p)), seenM);
    await G(page, () => { window.__botCfg.fire = true; });
    ok('mimic HP reaches the threshold -> climax (friends + 海音 awakens: 海割り)', await waitState(page, 'climax', 90000) && (await G(page, () => ROCKSIDE.boss.hp <= ROCKSIDE.CONFIG.bosses.mimic.climaxHp)));
    await G(page, () => { window.__rocksideBot = null; });
    await page.keyboard.press('Enter'); await sleep(400);
    ok('first climax cannot be skipped', await G(page, () => ROCKSIDE.state === 'climax' && ROCKSIDE.final.climaxT > 20));
    ok('climax lasts ~10-15 s and ends in the finale', await waitState(page, 'finale', 16000));
    for (let i = 0; i < 8 && (await G(page, () => ROCKSIDE.state)) === 'finale'; i++) { await sleep(900); await page.keyboard.press('Enter'); }
    ok('finale dialogue -> ending party', await waitFor(page, () => ROCKSIDE.state === 'ending', 6000));
    const sv = await G(page, () => JSON.parse(localStorage.getItem(ROCKSIDE.PROGRESS_KEY) || '{}'));
    ok('game clear saved (cleared: final, climax seen)', sv.cleared && sv.cleared.includes('final') && sv.seen && sv.seen.includes('climax'), sv);
    await ctx.close();
    // second time: the climax is skippable by tap
    ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?area=9&god=1&boss=1&mimic=1&climax=1'));
    await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['final'], rescued: [], seen: ['climax'] })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
    await page.reload(); await waitState(page, 'play', 4000); await page.keyboard.down('ArrowRight'); await waitState(page, 'bossIntro', 15000); await page.keyboard.up('ArrowRight');
    await waitState(page, 'play', 20000); await G(page, BOT.BOSS); await G(page, () => { window.__botCfg.fire = true; });
    await waitState(page, 'climax', 30000); await G(page, () => { window.__rocksideBot = null; }); await sleep(600);
    await page.keyboard.press('Enter');
    ok('climax skippable by tap after the first view', await waitState(page, 'finale', 3000));
    await ctx.close();
  }
  // ===== v11 ENDING: party + karaoke + credits (?ending=1), THANK YOU + teaser, back to the title =====
  ({ ctx, page } = await newPage(browser, 390, 844, FILE + '?ending=1'));
  ok('?ending=1 jumps to the ending party', await waitState(page, 'ending', 4000) && (await G(page, () => ['partyBg', 'partyProps', 'kanata'].every(k => ROCKSIDE.SHEETS_LOADED.includes(k)) && !ROCKSIDE.SHEETS_LOADED.some(k => /owner/i.test(k)))));
  { const e0 = await G(page, () => ROCKSIDE.ending); await sleep(1500); const e1 = await G(page, () => ROCKSIDE.ending);
    ok('credits scroll upward over the party (one editable CREDITS list incl. Created by 清掃員カナタ)', e1.credY < e0.credY && e1.phase === 'credits' && (await G(page, () => CREDITS.some(c => c.text === 'Created by 清掃員カナタ') && CREDITS.some(c => c.title && c.title.includes('ROCKSIDE')) && !CREDITS.some(c => /中の人|OWNER/.test(c.text || '')) && typeof OWNER_NAME === 'undefined')), { e0, e1 }); }
  ok('karaoke: Kanata takes a turn at the mic (sing frame)', await G(page, () => KARAOKE_TURNS.some(t => t.includes('kanata')) && KARAOKE_TURNS.some(t => t.includes('seiten')) && KARAOKE_TURNS.some(t => t.includes('lily'))));
  await page.keyboard.press('Enter'); // fast-forward
  ok('credits end -> THANK YOU FOR PLAYING', await waitFor(page, () => ROCKSIDE.ending.phase === 'thanks', 40000));
  await waitFor(page, () => ROCKSIDE.ending.thanksT > 160, 6000); await page.keyboard.press('Enter');
  ok('tap after THANK YOU -> title', await waitState(page, 'title', 3000));
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ cleared: ['final'], rescued: [], seen: ['climax', 'ending'] })), await G(page, () => ROCKSIDE.PROGRESS_KEY));
  await page.goto(FILE); await sleep(500); // plain URL (a reload would keep ?ending=1)
  ok('title knows the game is cleared (clear mark)', await G(page, () => ROCKSIDE.state === 'title' && ROCKSIDE._test.isCleared('final')));
  await ctx.close();
  // hard mode: title toggle halves HP
  ({ ctx, page } = await newPage(browser, 390, 844));
  await page.keyboard.press('KeyH'); await sleep(60);
  ok('hard mode (H on title) halves max HP', await G(page, () => ROCKSIDE.hardMode && ROCKSIDE.playerMaxHP === Math.floor(ROCKSIDE.CONFIG.playerMaxHP / 2)));
  await ctx.close();

  srv.close();
  await browser.close();
  console.log('\nConsole errors/warnings: ' + (errors.length ? '\n  ' + errors.join('\n  ') : 'none'));
  console.log(`(asset 'file not found' messages: ${assetMisses.length} - only from the standalone/?sprites=folder tests, whose temp folder has few or no sheets)`);
  const fails = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - fails}/${results.length} checks passed`);
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
