
// ---------------------------------------------------------------------
//  Pre-rendered backgrounds and level tiles
// ---------------------------------------------------------------------
// Background themes (AREAS[].theme). Add a new entry for a new stage look.
//  sky: 3 gradient stops, stars: count (+ starsH band height), sun/moon: disc, band: milky-way tint,
//  far/near: parallax silhouettes {style: hills|trees|city|ruins, cols: [fill, rim]},
//  tiles: palette for the level tiles (rock, top edge, girder, cave back wall, boss-room metal).
const TILESETS = {
  sunset: { rock: ['#6e4b3a', '#57392b', '#8c654e', '#4a3024', '#3b261c'], top: ['#4fb35a', '#9be58a', '#3f8f4a'],
    girder: ['#7a4518', '#b8742c', '#e8a852', '#6b3d14'], cave: ['#241a30', '#2c2140'],
    metal: ['#1b2036', '#232a45', '#161a2c', '#2c3148', '#4d5678', '#5d6790', '#8490c0', '#aab4dd'] },
  forest: { rock: ['#3d3140', '#2c222e', '#57465a', '#221a24', '#1a141c'], top: ['#2f7a62', '#7fe0b8', '#1f5a48'],
    girder: ['#3a2618', '#6e4c2e', '#a07a4c', '#2a1a10'], cave: ['#10182a', '#18223a'],
    metal: ['#101c26', '#162834', '#0c161e', '#1e3440', '#34505e', '#42626e', '#78a4b4', '#aee0ec'] },
  city: { rock: ['#474a5c', '#383a4a', '#5c6074', '#2c2e3c', '#22242e'], top: ['#8c8ea8', '#d0d2e8', '#6a6c84'],
    girder: ['#3a1c30', '#8e3a60', '#e070a0', '#2a1224'], cave: ['#181426', '#201a32'], windows: '#ffd46a',
    metal: ['#1e1024', '#28142e', '#160a1a', '#3a1a30', '#6a2848', '#7e3456', '#c8688c', '#f4a8c8'] },
  shrine: { rock: ['#686488', '#545070', '#8a86ac', '#3e3a58', '#302c48'], top: ['#b4aee0', '#f4f0ff', '#8c86c0'],
    girder: ['#6a5020', '#b89040', '#f4d680', '#4a3810'], cave: ['#161434', '#1e1a44'],
    metal: ['#131334', '#1b1b46', '#0f0f2a', '#2a2a5a', '#46469a', '#5656b2', '#9a9aea', '#d4d4ff'] },
};
// 狐火の社: dark shrine stone with moss, vermilion (shu-iro) girders like torii beams, warm lantern-lit hall
TILESETS.foxfire = { rock: ['#4a4250', '#3a3240', '#625a6a', '#2c2632', '#221c28'], top: ['#3e6a4a', '#86c08a', '#2c4e38'],
  girder: ['#7a1a1a', '#c8382c', '#f07a50', '#5a1010'], cave: ['#1a1020', '#24162a'],
  metal: ['#1e0e14', '#2a141c', '#16080e', '#3a1a22', '#6a2a30', '#7e3438', '#c86a5a', '#f4b090'] };
// 宵闇のカジノ: red carpet, green felt edges with gold trim, chip-stack / card-table girders; the boss hall is bright
// green felt so the black harlequin suit stays readable
TILESETS.casino = { rock: ['#7a1a2a', '#5a1020', '#9a2a3a', '#3a0a14', '#2a0610'], top: ['#1e7a4a', '#f0c850', '#145a36'],
  girder: ['#2a1a10', '#d03030', '#f4f0e8', '#101010'], cave: ['#2a1030', '#381440'], chips: true,
  metal: ['#1e6a46', '#237a50', '#185a3c', '#6a1424', '#a02a3a', '#b83848', '#f0c850', '#fff0a0'] };
// 幽境の掃除館 (final): plum wallpaper rock, polished wood floor trim, haunted furniture girders (shelves with a ghost glow);
// the boss hall is a light lavender room so the black vacuum mimic and Kanata's dark maid dress stay readable
TILESETS.final = { rock: ['#4a3050', '#3a2440', '#5e4066', '#2a1a30', '#20142a'], top: ['#8a5a3a', '#d8a070', '#6a4028'],
  girder: ['#3a2018', '#7a4a2a', '#c8904a', '#2a140c'], cave: ['#1e1430', '#281a3c'], furniture: true,
  metal: ['#a49ccc', '#b2aad8', '#958dbd', '#5a4a7a', '#7a6a9a', '#8a7aac', '#d0c8ec', '#ffffff'] };
const THEMES = {
  sunset: { sky: ['#181238', '#55306e', '#e8845c'], stars: 40, sun: { x: 190, y: 120, r: 20, cols: ['#ffcf7a', '#ffe9b0'] },
    far: { style: 'hills', cols: ['#6a4a82', '#7d5a95'] }, near: { style: 'hills', cols: ['#3c2c56', '#4b3868'] }, tiles: TILESETS.sunset },
  forest: { sky: ['#040816', '#0e2038', '#2a4c62'], stars: 70, moon: { x: 62, y: 46, r: 17, cols: ['#dfe8ff', '#f6f8ff', '#b8c6e4'] },
    far: { style: 'trees', cols: ['#173a50', '#24506a'] }, near: { style: 'trees', cols: ['#0b1e2c', '#143246'] }, tiles: TILESETS.forest },
  city: { sky: ['#0a0618', '#2a1640', '#6a2a5a'], stars: 30, moon: { x: 200, y: 38, r: 12, crescent: true, cols: ['#ffe6a8', '#fff4d0', '#e8c880'] },
    far: { style: 'city', cols: ['#2e1e48', '#3e2a5c'], lights: '#c89a5a' }, near: { style: 'city', cols: ['#160e26', '#241838'], lights: '#ffd46a' }, tiles: TILESETS.city },
  lily: { sky: ['#120b2e', '#4d2d67', '#b65f91'], stars: 120, starsH: 150, moon: { x: 196, y: 45, r: 20, cols: ['#fff4dd', '#ffd8ef', '#d89bd2'] },
    far: { style: 'ruins', cols: ['#5d376f', '#86598f'] }, near: { style: 'city', cols: ['#241834', '#3a2548'], lights: '#ffd6ef' }, tiles: TILESETS.shrine },
  disaster: { sky: ['#160719', '#4a102c', '#a22b45'], stars: 70, moon: { x: 188, y: 54, r: 32, cols: ['#ff3a58', '#ff8495', '#c5264b'] },
    far: { style: 'ruins', cols: ['#36102d', '#581b3f'] }, near: { style: 'ruins', cols: ['#1a0c22', '#300d30'] }, tiles: TILESETS.shrine, castle: true },
  casino: { sky: ['#1c0a34', '#561a6e', '#d84a7a'], stars: 30,
    far: { style: 'city', cols: ['#3e1a58', '#62307a'], lights: '#ffd060' }, near: { style: 'city', cols: ['#26123a', '#40205a'], lights: '#ff7ad8' }, tiles: TILESETS.casino, casino: true },
  foxfire: { sky: ['#07061a', '#1e1240', '#5a2448'], stars: 90, moon: { x: 196, y: 52, r: 20, cols: ['#fff2d8', '#fffaf0', '#e8d0b0'] },
    far: { style: 'trees', cols: ['#1c1434', '#2a1e48'] }, near: { style: 'trees', cols: ['#0e0a1c', '#1c1230'] }, tiles: TILESETS.foxfire, foxShrine: true },
  final: { sky: ['#0c0618', '#2a1440', '#5a2a6a'], stars: 60, moon: { x: 210, y: 34, r: 11, crescent: true, cols: ['#d8e8ff', '#f4f8ff', '#a8b8e0'] },
    far: { style: 'ruins', cols: ['#2a1a40', '#3e2858'] }, near: { style: 'ruins', cols: ['#160c24', '#24163a'] }, tiles: TILESETS.final },
  shrine: { sky: ['#06061e', '#1c1450', '#44307c'], stars: 150, starsH: 170, band: '#8a7ae0',
    far: { style: 'ruins', cols: ['#2a2460', '#3a347a'] }, near: { style: 'ruins', cols: ['#151238', '#221e50'] }, tiles: TILESETS.shrine },
};
const skyCv = mkCanvas(VW, VH), farCv = mkCanvas(512, VH), nearCv = mkCanvas(512, VH);
let curTiles = TILESETS.sunset;
function disc(g2, cx, cy, r, col) { g2.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g2.fillRect(cx - w, cy + y, w * 2, 1); } }
// one silhouette layer, tiling horizontally every 512px; base = ground line (larger = lower)
function drawLayer(lg, L, base, amp, seed) {
  const col = L.cols[0], rim = L.cols[1], F = (x, y, w, h, c) => { lg.fillStyle = c; lg.fillRect(x, y, w, h); };
  if (L.style === 'hills') {
    for (let x = 0; x < 512; x++) {
      const t = x / 512 * Math.PI * 2;
      const hh = (seed === 1 ? 128 : 162) + (seed === 1 ? Math.sin(t * 3) * 14 + Math.sin(t * 7 + 1) * 8 + Math.sin(t * 17) * 3 : Math.sin(t * 4 + 2) * 12 + Math.sin(t * 9) * 7 + (hash(x >> 2, 3) & 3));
      F(x, Math.round(hh), 1, VH, col); F(x, Math.round(hh), 1, seed === 1 ? 2 : 1, rim);
    }
  } else if (L.style === 'trees') {       // conifer tree line (pointy tops), overlapping trees
    F(0, base, 512, VH, col);
    for (let x = 0; x < 512; x += 2) { const hh = base - 2 - (hash(x >> 3, seed) & 3); F(x, hh, 2, VH, col); }
    for (let i = 0; i < 40; i++) {
      const h = hash(i, 50 + seed), tx = (i * 13 + (h & 7)) % 512, th = amp * 0.55 + (h >> 4) % Math.round(amp * 0.6), tw = 5 + ((h >> 9) & 3);
      for (let y = 0; y < th; y++) {
        const w = Math.max(1, Math.round((y / th) * tw + ((y % 6) < 2 ? 1 : 0)));
        for (const ox of [0, 512, -512]) F(tx - w + ox, base - th + y, w * 2 + 1, 1, col);
      }
      for (const ox of [0, 512, -512]) F(tx + ox, base - th - 1, 1, 2, rim);
    }
    for (let x = 0; x < 512; x += 3) if (hash(x, seed + 9) % 5 === 0) F(x, base + 2 + (hash(x, 4) % 8), 1, 1, rim);
  } else if (L.style === 'city') {        // skyline of blocks with lit windows / antennas
    let x = 0, i = 0;
    while (x < 512) {
      const h = hash(i++, 70 + seed), w = 14 + (h & 15) + (seed === 2 ? 6 : 0), bh = amp * 0.35 + ((h >> 5) % Math.round(amp * 0.8));
      const top = Math.round(base - bh), ww = Math.min(w, 512 - x);
      F(x, top, ww, VH, col); F(x, top, ww, 1, rim);
      if ((h >> 12) % 3 === 0) F(x + (w >> 1), top - 6 - ((h >> 14) & 3), 1, 6 + ((h >> 14) & 3), col);          // antenna
      if ((h >> 16) % 4 === 0 && seed === 2) { F(x + 3, top - 5, 6, 5, col); F(x + 4, top - 7, 4, 2, col); }       // water tank
      for (let wy = top + 4; wy < base + 30; wy += 5) for (let wx = x + 2; wx < x + ww - 2; wx += 4) {
        const hw = hash(wx, wy + seed * 7); if (hw % 7 < 2) F(wx, wy, 2, 2, L.lights);
      }
      x += w + ((h >> 20) & 1);
    }
  } else {                                 // ruins: colonnade pillars, some broken, and arches
    F(0, base, 512, VH, col);
    for (let i = 0; i < 22; i++) {
      const h = hash(i, 90 + seed), px = i * 24 + (h & 7), ph = amp * 0.4 + ((h >> 4) % Math.round(amp * 0.7)), pw = seed === 2 ? 9 : 6;
      const top = Math.round(base - ph);
      F(px, top, pw, ph + 2, col); F(px - 1, top, pw + 2, 2, col); F(px, top, 1, ph, rim);
      if ((h >> 10) & 1) { F(px + pw - 3, top - 3, 3, 3, col); F(px, top - 1, 2, 1, col); } // broken top
      else F(px - 2, top - 3, pw + 4, 3, col);                                            // capital
      if ((h >> 12) % 3 === 0) { const wh = 6 + ((h >> 14) & 7); F(px + pw, base - wh, 24 - pw, wh, col); F(px + pw, base - wh, 24 - pw, 1, rim); } // low broken wall
    }
    for (let x = 0; x < 512; x += 2) if (hash(x, seed + 3) % 6 === 0) F(x, base - 1, 2, 1, rim);
  }
}
function buildBackground(th) {
  const sg = skyCv.getContext('2d');
  curTiles = th.tiles || TILESETS.sunset;
  sg.clearRect(0, 0, VW, VH); farCv.getContext('2d').clearRect(0, 0, 512, VH); nearCv.getContext('2d').clearRect(0, 0, 512, VH);
  // gradient on a scratch canvas (read back once), banded into flat pixel-art steps
  const tmp = mkCanvas(VW, VH), tg = tmp.getContext('2d'), grad = tg.createLinearGradient(0, 0, 0, 190);
  grad.addColorStop(0, th.sky[0]); grad.addColorStop(0.55, th.sky[1]); grad.addColorStop(1, th.sky[2]);
  tg.fillStyle = grad; tg.fillRect(0, 0, VW, VH);
  if (th.band) { // soft diagonal milky way
    tg.globalAlpha = 0.28; tg.fillStyle = th.band;
    for (let x = -60; x < VW + 60; x++) { const y = 150 - x * 0.55, w = 26 + Math.sin(x * 0.07) * 8; tg.fillRect(x, y - w / 2, 1, w); }
    tg.globalAlpha = 1;
  }
  const id = tg.getImageData(0, 0, VW, VH), dd = id.data;
  for (let i = 0; i < dd.length; i += 4) { dd[i] = dd[i] & 0xF0; dd[i + 1] = dd[i + 1] & 0xF0; dd[i + 2] = dd[i + 2] & 0xF0; }
  sg.putImageData(id, 0, 0);
  sg.fillStyle = '#ffffff';
  const sh = th.starsH || 90;
  for (let i = 0; i < (th.stars || 0); i++) { const h = hash(i, 7); sg.fillStyle = (h >> 20) % 5 === 0 ? '#ffe8a0' : (h >> 22) % 4 === 0 ? '#a8c0ff' : '#ffffff'; sg.fillRect(h % VW, (h >>> 9) % sh, 1, 1); }
  if (th.band) { sg.fillStyle = '#ffffff'; for (let i = 0; i < 9; i++) { const h = hash(i, 77), x = 8 + h % (VW - 16), y = 6 + (h >>> 9) % 110; sg.fillRect(x - 2, y, 5, 1); sg.fillRect(x, y - 2, 1, 5); sg.fillStyle = '#fff6c0'; sg.fillRect(x - 1, y - 1, 3, 3); sg.fillStyle = '#ffffff'; } }
  if (th.sun) { const S = th.sun; disc(sg, S.x, S.y, S.r, S.cols[0]); disc(sg, S.x, S.y, Math.round(S.r * 0.7), S.cols[1]); }
  if (th.moon) {
    const M = th.moon;
    sg.globalAlpha = 0.18; disc(sg, M.x, M.y, M.r + 6, M.cols[1]); sg.globalAlpha = 1;
    disc(sg, M.x, M.y, M.r, M.cols[0]);
    if (M.crescent) disc(sg, M.x + Math.round(M.r * 0.45), M.y - Math.round(M.r * 0.25), M.r, th.sky[0]);
    else { disc(sg, M.x - 3, M.y - 3, Math.round(M.r * 0.6), M.cols[1]); sg.fillStyle = M.cols[2]; sg.fillRect(M.x + 4, M.y + 2, 4, 3); sg.fillRect(M.x - 7, M.y + 6, 3, 2); sg.fillRect(M.x + 1, M.y - 8, 2, 2); }
  }
  drawLayer(farCv.getContext('2d'), th.far, 132, 44, 1);
  drawLayer(nearCv.getContext('2d'), th.near, 168, 40, 2);
  if (th.castle) { drawCrimsonCastle(farCv.getContext('2d'), false); drawCrimsonCastle(nearCv.getContext('2d'), true); }
  if (th.casino) { drawCasino(farCv.getContext('2d'), false); drawCasino(nearCv.getContext('2d'), true); }
  if (th.foxShrine) { drawFoxShrine(farCv.getContext('2d'), false); drawFoxShrine(nearCv.getContext('2d'), true); }
}
// MIDNIGHT CASINO parallax: neon suit signs + roulette wheel (far), slot machines with lit reels and marquee bulbs (near)
function drawCasino(cg, near) {
  const F = (x, y, w, h, c) => { cg.fillStyle = c; cg.fillRect(x, y, w, h); };
  const SUIT = { s: ['..#..', '.###.', '#####', '#####', '..#..'], h: ['##.##', '#####', '#####', '.###.', '..#..'],
    d: ['..#..', '.###.', '#####', '.###.', '..#..'], c: ['.#.#.', '#####', '#####', '..#..', '.###.'] };
  const suit = (x, y, k, s, col) => { const P = SUIT[k]; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (P[r][c] === '#') F(x + c * s, y + r * s, s, s, col); };
  if (!near) {
    for (const ox of [60, 316]) { // roulette wheel on the far wall
      const cx = ox + 30, cy = 70, R = 24;
      for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) { const d = Math.hypot(x, y); if (d > R) continue;
        const a = Math.atan2(y, x), seg = Math.floor((a + Math.PI) / (Math.PI * 2) * 18);
        F(cx + x, cy + y, 1, 1, d > R - 2 ? '#c8a040' : d > R - 9 ? (seg % 9 === 0 ? '#1e8a4a' : seg & 1 ? '#c02030' : '#1a1418') : d > 5 ? '#6a3a1a' : '#f0c850'); }
    }
    for (let i = 0; i < 4; i++) { // neon suit signs
      const x = 150 + i * 28 + (i > 1 ? 256 - 112 : 0), col = ['#ff5ad0', '#ff4a4a', '#5af0ff', '#ffe060'][i];
      F(x - 3, 44, 22, 22, '#20102c'); F(x - 3, 44, 22, 1, col); F(x - 3, 65, 22, 1, col); F(x - 3, 44, 1, 22, col); F(x + 18, 44, 1, 22, col);
      suit(x + 1, 48, 'shdc'[i], 3, col);
    }
    return;
  }
  for (let x = 20; x < 512; x += 96) { // slot machines
    const y = 116, ink = '#2a1238';
    F(x, y, 34, 52, ink); F(x + 2, y - 8, 30, 10, '#5a1a6a'); F(x, y + 52, 34, 4, '#1a0a24');
    for (let k = 0; k < 7; k++) F(x + 3 + k * 4, y - 6, 2, 2, ((k + (x >> 5)) & 1) ? '#ffe060' : '#ff7ad8'); // marquee bulbs
    F(x + 4, y + 8, 26, 14, '#f4f0e8');
    for (let k = 0; k < 3; k++) { F(x + 5 + k * 8, y + 9, 7, 12, k === 1 ? '#fffaf0' : '#e8e0d8'); F(x + 7 + k * 8, y + 12, 3, 6, '#d02030'); F(x + 6 + k * 8, y + 12, 5, 1, '#d02030'); } // 7 7 7
    F(x + 6, y + 26, 22, 3, '#ffd060'); F(x + 4, y + 34, 26, 10, '#3a1a48'); F(x + 35, y + 10, 2, 14, '#b0b0c0'); F(x + 34, y + 8, 4, 4, '#ff3040'); // lever
  }
  for (let i = 0; i < 16; i++) { const h = hash(i, 71), x = h % 512, y = 30 + ((h >> 9) % 70); F(x, y, 1, 1, ['#ffe060', '#ff7ad8', '#5af0ff'][(h >> 20) % 3]); } // sparkles
}
// FOXFIRE SHRINE parallax: rows of vermilion torii, stone lanterns with warm light, a shrine roof, drifting foxfire dots
function drawFoxShrine(cg, near) {
  const F = (x, y, w, h, c) => { cg.fillStyle = c; cg.fillRect(x, y, w, h); };
  const base = near ? 168 : 132, red = near ? '#8a1c22' : '#5a1a2e', redHi = near ? '#c83a30' : '#7a2a3e', ink = near ? '#120a16' : '#1e1430';
  if (!near) { // distant shrine hall on the hill
    for (const ox of [96, 352]) {
      F(ox, base - 34, 64, 34, ink); for (let k = 0; k < 10; k++) F(ox - 10 + k * 2, base - 44 + k, 84 - k * 4, 1, ink);
      F(ox - 12, base - 35, 88, 2, ink); F(ox + 8, base - 26, 48, 8, '#3a1a20');
      for (let k = 0; k < 6; k++) F(ox + 10 + k * 8, base - 25, 4, 6, (k & 1) ? '#ffb060' : '#ff8a40');
    }
  }
  const step = near ? 128 : 64;
  for (let x = near ? 40 : 10, n = 0; x < 512; x += step, n++) { // torii gates
    const w = near ? 46 : 26, h = near ? 52 : 30, top = base - h;
    F(x, top + 4, near ? 4 : 2, h, red); F(x + w - (near ? 4 : 2), top + 4, near ? 4 : 2, h, red);          // pillars
    F(x - 6, top, w + 12, near ? 4 : 2, red); F(x - 7, top - 1, w + 14, 1, redHi);                      // kasagi (top beam)
    F(x - 2, top + (near ? 10 : 6), w + 4, near ? 3 : 2, red);                                           // nuki
    F(x + (w >> 1) - 2, top + 4, 4, near ? 6 : 3, red);                                                   // gakuzuka
    if (near) { F(x, top + 4, 1, h, redHi); F(x + w - 4, top + 4, 1, h, redHi);
      for (let k = 0; k < 3; k++) { const lx = x + 6 + k * 15, ly = top + 15; // 紅提灯 (red paper lanterns) hanging from the nuki
        F(lx + 2, ly - 2, 1, 2, ink); F(lx, ly, 6, 8, '#d0302a'); F(lx + 1, ly - 1, 4, 10, '#d0302a'); F(lx + 1, ly + 2, 4, 1, '#ff9a60'); F(lx + 1, ly + 5, 4, 1, '#ff9a60'); F(lx + 1, ly, 1, 7, '#ff7048'); F(lx, ly - 1, 6, 1, ink); F(lx, ly + 8, 6, 1, ink); }
    }
  }
  for (let x = near ? 100 : 40, n = 0; x < 512; x += near ? 128 : 64, n++) { // stone lanterns (tōrō) with light
    const s = near ? 2 : 1, y = base;
    F(x - 3 * s, y - 4 * s, 6 * s, 4 * s, ink); F(x - 1 * s, y - 12 * s, 2 * s, 8 * s, ink);
    F(x - 4 * s, y - 17 * s, 8 * s, 5 * s, ink); F(x - 5 * s, y - 19 * s, 10 * s, 2 * s, ink); F(x - 1 * s, y - 21 * s, 2 * s, 2 * s, ink);
    F(x - 2 * s, y - 16 * s, 4 * s, 3 * s, near ? '#ffb85a' : '#d07a40');
  }
  for (let i = 0; i < (near ? 14 : 22); i++) { // foxfire dots (red / orange / pale)
    const h = hash(i, near ? 61 : 63), x = h % 512, y = 40 + ((h >> 9) % (base - 60)), c = (h >> 20) % 3;
    F(x, y, near ? 2 : 1, near ? 2 : 1, c === 0 ? '#ff5a3a' : c === 1 ? '#ffb060' : '#c08aff');
    if (near) { cg.globalAlpha = 0.3; F(x - 1, y - 1, 4, 4, c === 0 ? '#ff5a3a' : '#ffb060'); cg.globalAlpha = 1; }
  }
}
// DISASTER CASTLE parallax towers (scenery only, no collision): drawn into the far/near background layers.
function drawCrimsonCastle(cg, foreground) {
  const ink = foreground ? '#170b1e' : '#371026', rim = foreground ? '#4a1937' : '#712441', glow = foreground ? '#a72c54' : '#df4263';
  const y0 = foreground ? 158 : 121;
  cg.save();
  for (let x = -14, n = 0; x < 530; x += 74, n++) {
    const ht = (n % 3 === 1 ? 65 : n % 3 === 2 ? 41 : 52), top = y0 - ht;
    cg.fillStyle = ink; cg.fillRect(x + 10, top, 32, ht + 40); cg.fillRect(x + 5, top + 13, 42, 5);
    for (let k = 0; k < 12; k++) cg.fillRect(x + 10 + k, top - 12 + k, 32 - k * 2, 1);   // stepped pointed roof
    cg.fillStyle = rim; cg.fillRect(x + 12, top + 3, 1, ht - 3); cg.fillRect(x + 39, top + 3, 1, ht - 3);
    for (let wy = top + 20; wy < y0 - 8; wy += 18) {
      cg.fillStyle = glow; cg.fillRect(x + 20, wy, 4, 7); cg.fillRect(x + 28, wy, 4, 7);
      cg.fillStyle = ink; cg.fillRect(x + 21, wy, 1, 6);
    }
    cg.fillStyle = ink; cg.fillRect(x + 43, y0 - 9, 31, 22);
    for (let b = 0; b < 5; b++) cg.fillRect(x + 43 + b * 7, y0 - 14, 4, 5);
    cg.fillStyle = rim; cg.fillRect(x + 43, y0 - 9, 31, 1);
  }
  cg.restore();
}
buildBackground(THEMES.sunset);

let levelCv = mkCanvas(LEVEL_W, VH);
function tileAt(c, r) { if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return T_EMPTY; return grid[r * COLS + c]; }
function buildLevel() {
  if (levelCv.width !== LEVEL_W) levelCv = mkCanvas(LEVEL_W, VH);
  const lg = levelCv.getContext('2d'); lg.clearRect(0, 0, LEVEL_W, VH);
  const F = (col, x, y, w, h) => { lg.fillStyle = col; lg.fillRect(x, y, w, h); };
  const TT = curTiles, RK = TT.rock, TP = TT.top, GD = TT.girder, CV = TT.cave, MT = TT.metal;
  for (let c = 0; c < COLS; c++) {
    const interior = c >= ROOM_COL || tileAt(c, 0) === T_ROCK;
    const metal = c >= ROOM_COL;
    for (let r = 0; r < ROWS; r++) {
      const t = grid[r * COLS + c], x = c * TS, y = r * TS, h = hash(c, r);
      if (t === T_EMPTY || t === T_DOOR) {
        if (interior) {
          if (metal) { F(MT[0], x, y, 16, 16); F(MT[1], x + 1, y + 1, 14, 14); F(MT[2], x + 7, y, 2, 16); }
          else { F(CV[0], x, y, 16, 16); F(CV[1], x + (h & 7), y + ((h >> 3) & 7), 5, 3); }
        }
      } else if (t === T_ROCK) {
        if (metal) {
          F(MT[3], x, y, 16, 16); F(MT[4], x, y, 15, 15); F(MT[5], x + 1, y + 1, 13, 13);
          F(MT[6], x, y, 15, 1); F(MT[6], x, y, 1, 15);
          F(MT[7], x + 2, y + 2, 1, 1); F(MT[7], x + 12, y + 2, 1, 1); F(MT[7], x + 2, y + 12, 1, 1); F(MT[7], x + 12, y + 12, 1, 1);
        } else {
          F(RK[0], x, y, 16, 16);
          for (let k = 0; k < 6; k++) { const hh = hash(c * 7 + k, r * 13 + k); F((hh >> 8) & 1 ? RK[1] : RK[2], x + (hh & 15), y + ((hh >> 4) & 15), 2 + ((hh >> 9) & 1), 1); }
          if (TT.windows && (h & 3) === 0 && r > 0 && r < ROWS - 2 && tileAt(c, r - 1) === T_ROCK) { F('#1a1a24', x + 4, y + 5, 3, 4); F(TT.windows, x + 4, y + 5, 3, 3); F('#1a1a24', x + 9, y + 5, 3, 4); F((h >> 3) & 1 ? TT.windows : '#2a2c3a', x + 9, y + 5, 3, 3); }
          if (c > 0 && tileAt(c - 1, r) !== T_ROCK) F(RK[3], x, y, 1, 16);
          if (c < COLS - 1 && tileAt(c + 1, r) !== T_ROCK) F(RK[3], x + 15, y, 1, 16);
          if (r < ROWS - 1 && tileAt(c, r + 1) !== T_ROCK) F(RK[4], x, y + 15, 16, 1);
          if (r > 0 && tileAt(c, r - 1) !== T_ROCK) {
            F(TP[0], x, y, 16, 4); F(TP[1], x, y, 16, 1);
            for (let k = 0; k < 4; k++) { const hh = hash(c * 5 + k, r * 3 + 1); F(TP[2], x + (hh & 15), y + 4, 2, 1 + ((hh >> 5) & 1)); }
          }
        }
      } else if (t === T_GIRDER && TT.chips) { // casino: card tables (green felt, wood rim) or chip stacks, chosen per platform run
        let c0 = c; while (c0 > 0 && tileAt(c0 - 1, r) === T_GIRDER) c0--;
        if (hash(c0, r) & 1) {
          F('#5a3418', x, y, 16, 16); F('#1e7a4a', x, y, 16, 6); F('#2a9a5e', x, y, 16, 1); F('#f0c850', x, y + 6, 16, 1); F('#3a2010', x, y + 7, 16, 9);
          if (c === c0 || tileAt(c + 1, r) !== T_GIRDER) F('#2a1408', x + (c === c0 ? 2 : 11), y + 7, 3, 9);
        } else {
          const cols = ['#d03030', '#1a1a1a', '#1e8a4a', '#2a5ad0'];
          for (let k = 0; k < 4; k++) { const cc = cols[(k + c + r) % 4]; F(cc, x + 1, y + k * 4, 14, 4); F('#f4f0e8', x + 3 + ((c + k) & 1) * 6, y + k * 4 + 1, 3, 2); F('#000000', x + 1, y + k * 4 + 3, 14, 1); }
          F('#f0c850', x + 1, y, 14, 1);
        }
      } else if (t === T_GIRDER && TT.furniture) { // haunted furniture: a floating bookshelf / sideboard top, ghost-blue glow under it
        let c0 = c; while (c0 > 0 && tileAt(c0 - 1, r) === T_GIRDER) c0--;
        F('#2a140c', x, y, 16, 12); F('#7a4a2a', x, y, 16, 3); F('#c8904a', x, y, 16, 1); F('#4a2a1a', x, y + 3, 16, 9);
        const bk = ['#a03040', '#3a6aa0', '#c8a040', '#4a8a5a', '#8a5ab0'];
        if (hash(c0, r) & 1) { for (let k = 0; k < 4; k++) F(bk[(c + k + r) % 5], x + 1 + k * 4, y + 5 + ((c + k) & 1), 3, 6 - ((c + k) & 1)); }
        else { F('#5a3420', x + 2, y + 5, 12, 6); F('#e8c060', x + 7, y + 7, 2, 2); }
        F('#2a140c', x, y + 11, 16, 1);
        F('rgba(120,170,255,0.35)', x, y + 12, 16, 2); F('rgba(120,170,255,0.15)', x, y + 14, 16, 2);
      } else if (t === T_GIRDER) {
        F(GD[0], x, y, 16, 16); F(GD[1], x, y, 16, 14); F(GD[2], x, y, 16, 2);
        F(GD[3], x, y + 2, 1, 12); F(GD[3], x + 15, y + 2, 1, 12);
        for (let i = 0; i < 11; i++) { F(GD[3], x + 2 + i, y + 3 + i, 1, 1); F(GD[3], x + 13 - i, y + 3 + i, 1, 1); }
      }
    }
  }
}
buildLevel();

// =====================================================================
//  Audio: tiny WebAudio synth (started on first user interaction)
// =====================================================================
const Snd = {
  ctx: null, master: null, noiseBuf: null, muted: false,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try {
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.3; this.master.connect(this.ctx.destination);
      const n = this.ctx.sampleRate * 0.5; this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
  },
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.3; },
  tone(type, f0, f1, dur, vol, delay) {
    const c = this.ctx; if (!c || this.muted) return;
    const t = c.currentTime + (delay || 0), o = c.createOscillator(), gn = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(gn); gn.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol, freq, delay) {
    const c = this.ctx; if (!c || this.muted) return;
    const t = c.currentTime + (delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), gn = c.createGain();
    s.buffer = this.noiseBuf; f.type = 'lowpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.2), t + dur);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(this.master); s.start(t); s.stop(t + dur + 0.02);
  },
  play(name) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'jump': this.tone('square', 260, 560, 0.09, 0.14); break;
      case 'shot': this.tone('square', 1100, 620, 0.05, 0.09); break;
      case 'ehit': this.tone('square', 320, 180, 0.05, 0.12); break;
      case 'pop': this.noise(0.2, 0.35, 3000); this.tone('square', 700, 90, 0.15, 0.1); break;
      case 'hurt': this.tone('sawtooth', 460, 110, 0.22, 0.16); this.noise(0.12, 0.2, 1500); break;
      case 'death': for (let i = 0; i < 5; i++) this.tone('square', 700 - i * 110, 500 - i * 90, 0.09, 0.13, i * 0.09); break;
      case 'fall': this.tone('triangle', 800, 90, 0.5, 0.2); break;
      case 'land': this.noise(0.18, 0.4, 500); break;
      case 'bhit': this.tone('square', 200, 110, 0.08, 0.16); this.noise(0.06, 0.2, 2500); break;
      case 'tink': this.tone('triangle', 1800, 1500, 0.04, 0.1); break;
      case 'door': for (let i = 0; i < 4; i++) this.tone('square', 110, 90, 0.05, 0.12, i * 0.07); break;
      case 'tick': this.tone('square', 900, 900, 0.03, 0.06); break;
      case 'cp': this.tone('triangle', 660, 660, 0.08, 0.15); this.tone('triangle', 990, 990, 0.12, 0.15, 0.08); break;
      case 'bshoot': this.tone('square', 520, 240, 0.1, 0.12); break;
      case 'warn': this.tone('sawtooth', 140, 320, 0.3, 0.12); break;
      case 'boom': this.noise(0.6, 0.5, 2000); this.tone('sawtooth', 200, 40, 0.6, 0.15); break;
      case 'start': this.tone('square', 523, 523, 0.08, 0.12); this.tone('square', 784, 784, 0.12, 0.12, 0.08); break;
      case 'arrow': this.noise(0.08, 0.15, 6000); this.tone('triangle', 1400, 700, 0.07, 0.06); break;
      case 'song': { const n = [466, 440, 415, 392]; for (let i = 0; i < 4; i++) this.tone('sawtooth', n[i], n[i] * 0.97, 0.12, 0.09, i * 0.08); break; }
      case 'swoosh': this.noise(0.25, 0.25, 4000); break;
      case 'boomS': this.noise(0.3, 0.4, 1200); this.tone('sawtooth', 160, 50, 0.3, 0.12); break;
      case 'heal': { const n = [523, 587, 659, 784, 880, 1047]; const f = n[(this.hc = ((this.hc || 0) + 1) % n.length)]; this.tone('triangle', f, f, 0.12, 0.07); break; }
      case 'rescue': { const n = [659, 784, 988, 1319]; for (let i = 0; i < n.length; i++) this.tone('triangle', n[i], n[i], 0.25, 0.12, i * 0.09); break; }
      case 'cursor': this.tone('square', 880, 880, 0.035, 0.08); break;
      case 'select': for (let i = 0; i < 6; i++) this.tone('square', 660 + (i & 1) * 330, 660 + (i & 1) * 330, 0.05, 0.1, i * 0.06); break;
      case 'buzz': this.tone('square', 160, 150, 0.14, 0.12); break;
      case 'erase': this.tone('sawtooth', 600, 80, 0.4, 0.12); break;
      case 'intro': { const n = [392, 523, 659, 784, 659, 784, 1047]; for (let i = 0; i < n.length; i++) this.tone('square', n[i], n[i], i === 6 ? 0.4 : 0.1, 0.11, i * 0.11); break; }
      case 'clear': { const n = [523, 659, 784, 1047, 784, 1047]; for (let i = 0; i < n.length; i++) this.tone('square', n[i], n[i], i === 5 ? 0.5 : 0.12, 0.12, i * 0.13); break; }
    }
  }
};
function sfx(n) { Snd.play(n); }

// =====================================================================
//  Input: keyboard + multi-touch pointer zones
// =====================================================================
const keys = { left: false, right: false, jump: false, shoot: false, up: false, down: false }; // up/down: stage-select cursor only
const touch = { left: false, right: false, jump: false, shoot: false };
const inp = { left: false, right: false, jump: false, shoot: false, magicPressed: false, supportPressed: false, supportCyclePressed: false, jumpPressed: false, shootPressed: false, startPressed: false,
  enterPressed: false, backPressed: false, leftPressed: false, rightPressed: false, upPressed: false, downPressed: false, resetPressed: false };
const stats = { updates: 0, jumps: 0, shots: 0, kills: 0, hits: 0, deaths: 0, touchDowns: 0, playFrames: 0, arrows: 0, arrowKills: 0, heals: 0 };

const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyZ: 'jump', Space: 'jump', KeyK: 'jump', KeyX: 'shoot', KeyJ: 'shoot',
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down' };
window.addEventListener('keydown', e => {
  Snd.init();
  if (e.code === 'Enter' || e.code === 'NumpadEnter') { inp.startPressed = true; inp.enterPressed = true; e.preventDefault(); return; }
  if (e.code === 'KeyM') { toggleMute(); return; }
  if (e.code === 'KeyH' && state === 'title') { toggleHardMode(); e.preventDefault(); return; }
  if (e.code === 'KeyC') { if (!e.repeat) inp.magicPressed = true; e.preventDefault(); return; }
  if (e.code === 'KeyB') { if (!e.repeat) inp.supportPressed = true; e.preventDefault(); return; }
  if (e.code === 'KeyV') { if (!e.repeat) inp.supportCyclePressed = true; e.preventDefault(); return; }
  if (e.code === 'Escape') { inp.backPressed = true; return; } // stage select -> title
  if (e.code === 'Delete' || e.code === 'Backspace') { inp.resetPressed = true; e.preventDefault(); return; } // title: erase progress (press twice)
  const b = KEYMAP[e.code]; if (!b) return;
  e.preventDefault();
  if (!keys[b]) {
    keys[b] = true;
    if (b === 'jump') { inp.jumpPressed = true; inp.startPressed = true; } if (b === 'shoot') inp.shootPressed = true;
    if (b === 'left') inp.leftPressed = true; if (b === 'right') inp.rightPressed = true; if (b === 'up') inp.upPressed = true; if (b === 'down') inp.downPressed = true;
  }
  refreshButtons();
});
window.addEventListener('keyup', e => { const b = KEYMAP[e.code]; if (!b) return; e.preventDefault(); keys[b] = false; refreshButtons(); });

const pad = document.getElementById('pad'), muteBtn = document.getElementById('mute'), hintEl = document.getElementById('hint');
hintEl.textContent = 'ROCKSIDE II  v' + GAME_VERSION;
const orbBtn = document.getElementById('bM');
const helpBtn = document.getElementById('bSupport');
helpBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Snd.init(); inp.supportPressed = true; helpBtn.classList.add('on'); });
helpBtn.addEventListener('pointerup', e => { e.preventDefault(); e.stopPropagation(); helpBtn.classList.remove('on'); });
helpBtn.addEventListener('pointercancel', () => helpBtn.classList.remove('on'));
helpBtn.addEventListener('lostpointercapture', () => helpBtn.classList.remove('on'));
orbBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Snd.init(); inp.magicPressed = true; orbBtn.classList.add('on'); });
orbBtn.addEventListener('pointerup', e => { e.preventDefault(); e.stopPropagation(); orbBtn.classList.remove('on'); });
orbBtn.addEventListener('pointercancel', () => orbBtn.classList.remove('on'));
orbBtn.addEventListener('lostpointercapture', () => orbBtn.classList.remove('on'));
const BTN = { left: document.getElementById('bL'), right: document.getElementById('bR'), shoot: document.getElementById('bS'), jump: document.getElementById('bJ') };
const BTN_ON = { left: false, right: false, shoot: false, jump: false };
const ptrs = new Map(); // pointerId -> zone name
const layout = { portrait: true, W: 390, H: 844, gameX: 0, gameY: 0, gameW: 390, gameH: 366, dpadMid: 100, shotX: 0, shotY: 0, jumpX: 0, jumpY: 0 };

// Whole left half of the pad = d-pad (split at the gap between the arrows);
// right half = nearest of SHOT / JUMP. Big forgiving thumb zones.
function zoneAt(x, y) {
  if (layout.portrait && y < layout.gameY + layout.gameH) return null;
  if (x < layout.W / 2) return x < layout.dpadMid ? 'left' : 'right';
  const ds = (x - layout.shotX) * (x - layout.shotX) + (y - layout.shotY) * (y - layout.shotY);
  const dj = (x - layout.jumpX) * (x - layout.jumpX) + (y - layout.jumpY) * (y - layout.jumpY);
  return ds < dj ? 'shoot' : 'jump';
}
function recomputeTouch() {
  const wasJ = touch.jump, wasS = touch.shoot, wasL = touch.left, wasR = touch.right;
  touch.left = touch.right = touch.jump = touch.shoot = false;
  ptrs.forEach(z => { if (z) touch[z] = true; });
  if (touch.jump && !wasJ) inp.jumpPressed = true;
  if (touch.shoot && !wasS) inp.shootPressed = true;
  if (touch.left && !wasL) inp.leftPressed = true;
  if (touch.right && !wasR) inp.rightPressed = true;
  refreshButtons();
}
function refreshButtons() {
  for (const k in BTN) {
    const on = touch[k] || keys[k];
    if (on !== BTN_ON[k]) { BTN_ON[k] = on; BTN[k].classList.toggle('on', on); }
  }
}
pad.addEventListener('pointerdown', e => {
  e.preventDefault(); Snd.init();
  if (e.target === muteBtn) { toggleMute(); return; }
  stats.touchDowns++;
  // taps inside the game view on the stage select / title go to those screens (cells, reset button)
  const gx = (e.clientX - layout.gameX) / layout.gameW * VW, gy = (e.clientY - layout.gameY) / layout.gameH * VH;
  if (gx >= 0 && gx < VW && gy >= 0 && gy < VH && screenTap(gx, gy)) return;
  inp.startPressed = true;
  try { pad.setPointerCapture(e.pointerId); } catch (_) {}
  ptrs.set(e.pointerId, zoneAt(e.clientX, e.clientY)); recomputeTouch();
});
pad.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return; e.preventDefault();
  const z = zoneAt(e.clientX, e.clientY); if (ptrs.get(e.pointerId) !== z) { ptrs.set(e.pointerId, z); recomputeTouch(); }
});
function ptrUp(e) { if (ptrs.delete(e.pointerId)) recomputeTouch(); }
pad.addEventListener('pointerup', ptrUp); pad.addEventListener('pointercancel', ptrUp); pad.addEventListener('lostpointercapture', ptrUp);
// Block scrolling, pinch/double-tap zoom, long-press menus
const stopEv = e => { if(e.target?.closest?.('#mMenu'))return; if (e.cancelable) e.preventDefault(); };
document.addEventListener('touchstart', stopEv, { passive: false });
document.addEventListener('touchmove', stopEv, { passive: false });
document.addEventListener('touchend', stopEv, { passive: false });
document.addEventListener('gesturestart', stopEv, { passive: false });
document.addEventListener('dblclick', stopEv, { passive: false });
document.addEventListener('contextmenu', stopEv);
function releaseAll() { ptrs.clear(); keys.left = keys.right = keys.jump = keys.shoot = keys.up = keys.down = false; recomputeTouch(); }
window.addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

function toggleMute() {
  Snd.init(); Snd.setMuted(!Snd.muted);
  muteBtn.textContent = Snd.muted ? 'SOUND OFF' : 'SOUND ON'; muteBtn.classList.toggle('off', Snd.muted);
  try { localStorage.setItem('rockside2_muted', Snd.muted ? '1' : '0'); } catch (_) {}
}
try { if (localStorage.getItem('rockside2_muted') === '1') { Snd.muted = true; muteBtn.textContent = 'SOUND OFF'; muteBtn.classList.add('off'); } } catch (_) {}

// ---------------------------------------------------------------------
//  Layout: portrait = game on top, pad below; landscape = centred game,
//  semi-transparent buttons on the side edges.
// ---------------------------------------------------------------------
function place(el, x, y, w, h) { el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px'; el.style.width = Math.round(w) + 'px'; el.style.height = Math.round(h) + 'px'; }
function doLayout() {
  const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 3);
  const portrait = H >= W * 1.1;
  layout.W = W; layout.H = H; layout.portrait = portrait;
  document.body.classList.toggle('land', !portrait);
  let gw, gh, gx, gy;
  if (portrait) {
    gw = W; gh = Math.round(W * VH / VW);
    if (gh > H * 0.56) { gh = Math.round(H * 0.56); gw = Math.round(gh * VW / VH); }
    gx = Math.round((W - gw) / 2); gy = 0;
  } else {
    gh = H; gw = Math.round(H * VW / VH); if (gw > W) { gw = W; gh = Math.round(W * VH / VW); }
    gx = Math.round((W - gw) / 2); gy = Math.round((H - gh) / 2);
  }
  document.getElementById('modelPicker').style.top = (portrait ? Math.min(H - 78, gy + gh + 121) : 4) + 'px';
  layout.gameX = gx; layout.gameY = gy; layout.gameW = gw; layout.gameH = gh;
  screen.style.left = gx + 'px'; screen.style.top = gy + 'px'; screen.style.width = gw + 'px'; screen.style.height = gh + 'px';
  const pw = Math.round(gw * dpr), ph = Math.round(gh * dpr);
  if (screen.width !== pw || screen.height !== ph) { screen.width = pw; screen.height = ph; }
  sctx.imageSmoothingEnabled = false;

  let bs, gap = 10, cy, margin;
  if (portrait) {
    const ctrlTop = gy + gh, ctrlH = H - ctrlTop;
    bs = Math.max(72, Math.min(96, Math.floor((W / 2 - 34) / 2), ctrlH * 0.3));
    margin = Math.max(12, Math.round(W * 0.035));
    cy = ctrlTop + ctrlH * 0.52;
    place(muteBtn, W - margin - 100, ctrlTop + 14, 100, 30);
    place(orbBtn, Math.round(W / 2 - 24), ctrlTop + 12, 48, 48);
    place(helpBtn, Math.round(W / 2 - 24), ctrlTop + 67, 48, 48);
    hintEl.style.top = (H - 26) + 'px';
  } else {
    bs = Math.max(64, Math.min(92, H * 0.23));
    margin = 14; cy = H * 0.64; gap = 8;
    place(muteBtn, 10, 10, 96, 30);
    place(orbBtn, W - 62, 10, 48, 48);
    place(helpBtn, W - 62, 66, 48, 48);
  }
  const lx = margin, rx = margin + bs + gap;
  place(BTN.left, lx, cy - bs / 2, bs, bs); place(BTN.right, rx, cy - bs / 2, bs, bs);
  layout.dpadMid = rx - gap / 2;
  const jx = W - margin - bs, sx = jx - bs - gap + 4, off = bs * 0.28;
  place(BTN.jump, jx, cy - bs / 2 - off, bs, bs); place(BTN.shoot, sx, cy - bs / 2 + off, bs, bs);
  layout.jumpX = jx + bs / 2; layout.jumpY = cy - off; layout.shotX = sx + bs / 2; layout.shotY = cy + off;
  if(window.MANSION_LAYOUT)window.MANSION_LAYOUT();
}
window.addEventListener('resize', doLayout);
window.addEventListener('orientationchange', () => setTimeout(doLayout, 100));
doLayout();
