
// =====================================================================
//  ENDING: party in the hall (party_bg_wide + party_props), karaoke on the stage, credits scroll
//  (CREDITS in 01_head.html), a clean THANK YOU FOR PLAYING screen, then back to the title.
//  ?ending=1 jumps here.
// =====================================================================
// props: [name, x, y, w, h] in party_props.png (bottom anchor = bottom centre of the cell)
const PARTY_PROPS = { table_round: [0, 0, 48, 32], table_long: [48, 8, 64, 24], mic_stand: [112, 0, 16, 32], roast_chicken: [128, 8, 24, 24], cake: [152, 8, 24, 24],
  sushi: [176, 8, 24, 24], pizza: [200, 8, 24, 24], fruit_bowl: [224, 8, 24, 24], beer_mug: [248, 16, 16, 16], wine_glass: [264, 16, 16, 16], juice: [280, 16, 16, 16],
  bottle: [296, 16, 16, 16], balloons: [312, 0, 16, 32], plates: [328, 8, 24, 24], speaker: [352, 0, 24, 32] };
// scene layout in party_bg_wide coordinates (384x240; stage top y=157, front floor y=175-240). [prop, x, bottomY]
const PARTY_LAYOUT = [
  ['balloons', 14, 186], ['balloons', 372, 182], ['speaker', 188, 158], ['speaker', 340, 158], ['mic_stand', 232, 158],
  ['table_round', 78, 214], ['cake', 70, 192], ['roast_chicken', 90, 193], ['beer_mug', 60, 193],
  ['table_round', 168, 232], ['pizza', 160, 211], ['juice', 180, 211], ['wine_glass', 150, 211],
  ['table_long', 300, 236], ['sushi', 284, 214], ['fruit_bowl', 308, 214], ['plates', 328, 214], ['bottle', 270, 214],
];
// party guests: [id, x, feetY, face, mode]  (mode: idle | toast | smoke | fly | float)
const PARTY_GUESTS = [
  ['umine', 112, 212, -1, 'idle'], ['tobiume', 132, 196, -1, 'fly'],
  ['neenia', 140, 230, 1, 'idle'], ['astarte', 196, 230, -1, 'idle'], ['star', 214, 218, -1, 'happy'],
  ['umimi', 258, 204, 1, 'float'], ['shiranui', 346, 230, -1, 'happy'], ['diceroll', 376, 210, -1, 'smoke'],
];
// karaoke turns: who stands on the stage; the others wait at their spots ([x, feetY, face])
const PARTY_SINGERS = { seiten: [222, 158, 1, 266, 232, -1], lily: [244, 158, -1, 238, 236, 1], kanata: [214, 158, 1, 30, 232, 1] };
const KARAOKE_TURNS = [['seiten'], ['lily'], ['kanata'], ['seiten', 'lily']];
const KARAOKE_TURN = 300;
const ENDING = { t: 0, credY: 0, fast: false, phase: 'credits', thanksT: 0 };
const SPRITE_CX = { umine: ['kanon', 11], tobiume: ['tobiumeNormal', 13], neenia: ['neenia', 11], seiten: ['seiten', 14], astarte: ['astarte', 10],
  star: ['starNormal', 16], lily: ['lily', 16], umimi: ['umimi', 16], shiranui: ['shiranui', 16], diceroll: ['diceroll', 16], kanata: ['kanata', 16] };
function startEnding() {
  ENDING.t = 0; ENDING.credY = VH + 10; ENDING.phase = 'credits'; ENDING.thanksT = 0; ENDING.fast = false;
  for (const q of bullets) q.active = false; for (const s of shots) s.active = false; for (const p of parts) p.active = false;
  if (!progress.seen.includes('ending')) { progress.seen.push('ending'); saveProgress(); }
  setState('ending'); sfx('clear');
}
function creditsHeight() { let h = 0; for (const c of CREDITS) h += c.gap || (c.head ? 18 : c.title ? 26 : 13); return h; }
function updateEnding() {
  ENDING.t++;
  if (ENDING.phase === 'credits') {
    if (inp.startPressed && ENDING.t > 30) ENDING.fast = !ENDING.fast;
    ENDING.credY -= ENDING.fast ? 1.6 : 0.4;
    if (ENDING.credY < -creditsHeight() + 20) { ENDING.phase = 'thanks'; ENDING.thanksT = 0; sfx('rescue'); }
  } else {
    ENDING.thanksT++;
    if (ENDING.thanksT % 50 === 1 && ENDING.thanksT < 300) sfx('cp');
    if ((inp.startPressed && ENDING.thanksT > 150) || ENDING.thanksT > 1500) { resetStage(false); setState('title'); }
  }
}
function partyCamX() { return Math.round(64 + Math.sin(ENDING.t * 0.004) * 64); } // slow pan across the 384px hall
function drawPartyProp(name, x, by, camX) {
  const S = SHEETS.partyProps, r = PARTY_PROPS[name]; if (!r) return;
  const dx = Math.round(x - r[2] / 2 - camX), dy = Math.round(by - r[3]);
  if (S) g.drawImage(S[0].r, r[0], r[1], r[2], r[3], dx, dy, r[2], r[3]);
  else { g.fillStyle = '#8a5a3a'; g.fillRect(dx, dy, r[2], r[3]); }
}
function drawPartyChar(id, x, by, face, f, camX, alpha) {
  const m = SPRITE_CX[id]; if (!m) return; const S = SHEETS[m[0]]; const dx = Math.round(x - camX);
  if (alpha !== undefined) g.globalAlpha = alpha;
  if (S) { const fr = S[Math.min(f, S.length - 1)]; g.drawImage(face >= 0 ? fr.r : fr.l, dx - (face >= 0 ? m[1] : 32 - m[1]), Math.round(by) - 32); }
  else { g.fillStyle = '#ffffff'; g.fillRect(dx - 5, Math.round(by) - 24, 10, 24); }
  g.globalAlpha = 1;
}
function guestFrame(id, mode, t, thanks) {
  const blink = (t + id.length * 37) % 200 > 190;
  if (thanks) { // everyone happy for the finale
    return { umine: (t >> 3) & 1 ? 6 : 8, tobiume: 2 + ((t >> 3) & 1), star: (t >> 4) & 1 ? 2 : 3, shiranui: 2, diceroll: 3, kanata: (t >> 4) & 1 ? 3 : 2, umimi: 2 + ((t >> 3) & 1), lily: (t >> 4) & 1, seiten: (t >> 4) & 1 }[id] ?? ((t >> 4) & 1);
  }
  if (mode === 'toast') return ((t >> 5) % 3) === 0 ? 5 : (t >> 4) & 1 ? 2 : 0;
  if (mode === 'smoke') return ((t >> 6) & 3) === 0 ? 0 : 2;
  if (mode === 'fly') return 2 + ((t >> 3) & 1);
  if (mode === 'float') return 2 + ((t >> 4) & 1);
  if (id === 'star') return ((t >> 5) & 3) === 0 ? 3 : (t >> 5) & 1;
  if (id === 'shiranui') return ((t >> 6) & 3) === 1 ? 4 : ((t >> 6) & 3) === 2 ? 2 : 0;
  if (id === 'neenia') return 0;
  if (id === 'umine') return blink ? 1 : (t >> 5) & 1;
  return (t >> 5) & 1;
}
function renderEnding() {
  const t = ENDING.t, camX = partyCamX(), thanks = ENDING.phase === 'thanks';
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (SHEETS.partyBg) g.drawImage(SHEETS.partyBg[0].r, -camX, 0); else { g.fillStyle = '#2a1a14'; g.fillRect(0, 0, VW, VH); g.fillStyle = '#5a3a24'; g.fillRect(0, 157, VW, 83); }
  // spotlight on the singer(s)
  const turn = KARAOKE_TURNS[((t / KARAOKE_TURN) | 0) % KARAOKE_TURNS.length];
  g.globalAlpha = 0.12 + Math.sin(t * 0.08) * 0.04; g.fillStyle = '#fff4c0';
  for (const id of thanks ? [] : turn) { const P0 = PARTY_SINGERS[id]; g.beginPath(); g.moveTo(P0[0] - camX - 6, 0); g.lineTo(P0[0] - camX - 22, 158); g.lineTo(P0[0] - camX + 22, 158); g.lineTo(P0[0] - camX + 6, 0); g.closePath(); g.fill(); }
  g.globalAlpha = 1;
  // draw back to front (by feet y)
  const items = [];
  for (const L of PARTY_LAYOUT) items.push({ y: L[2], fn: () => drawPartyProp(L[0], L[1], L[2], camX) });
  for (const G0 of PARTY_GUESTS) {
    const bob = G0[4] === 'fly' || G0[4] === 'float' ? Math.sin(t * 0.06 + G0[1]) * 2 : 0;
    const hop = thanks ? -Math.abs(Math.sin((ENDING.thanksT + G0[1]) * 0.09)) * 5 : 0;
    items.push({ y: G0[2] + 0.5, fn: () => drawPartyChar(G0[0], G0[1], G0[2] + bob + hop, G0[3], guestFrame(G0[0], G0[4], t, thanks), camX) });
    if (G0[4] === 'smoke' && !thanks && ((t >> 6) & 3) !== 0 && t % 12 === 0) spawnPart(G0[1] + G0[3] * 7 + 0, G0[2] - 22, 0.1 * G0[3], -0.35, 44, 5, (t >> 4) & 1 ? '#d8d8e0' : '#b0b0bc');
    if (G0[4] === 'toast' && ((t >> 5) % 3) === 0 && t % 16 === 0) spawnPart(G0[1] + G0[3] * 10, G0[2] - 22, 0, -0.4, 20, 5, '#ffe080');
  }
  for (const id in PARTY_SINGERS) {
    const S0 = PARTY_SINGERS[id], on = !thanks && turn.includes(id);
    const x = on ? S0[0] : S0[3], y = on ? S0[1] : S0[4], face = on ? S0[2] : S0[5];
    const f = id === 'kanata' ? (on ? 4 : thanks ? guestFrame('kanata', 'idle', t, true) : ((t % 160) > 150 ? 1 : (t >> 6) % 4 === 1 ? 2 : 0)) : thanks ? (t >> 4) & 1 : on ? (t >> 4) & 1 : 0;
    const hop = on && id !== 'kanata' && (t % 32) < 6 ? -2 : thanks ? -Math.abs(Math.sin((ENDING.thanksT + x) * 0.09)) * 5 : 0;
    items.push({ y: y + 0.3, fn: () => drawPartyChar(id, x, y + hop, face, f, camX) });
    if (on && t % 14 === 0) { const h = hash(t, x), k = (h >> 6) % 3; spawnPart(x + face * 8, y - 26, ((h & 63) / 64 - 0.5) * 0.8 + face * 0.3, -0.6, 54, 5, k === 0 ? '#ff6a8a' : k === 1 ? '#ffd84a' : '#8fd0ff'); }
  }
  items.sort((a, b) => a.y - b.y); for (const it of items) it.fn();
  if (!thanks) for (let i = 0; i < 3; i++) { // music notes over the stage
    const nx = 236 - camX + Math.sin(t * 0.03 + i * 2) * 30, ny = 120 - ((t * 0.5 + i * 30) % 90);
    g.fillStyle = ['#ff8ac0', '#ffd84a', '#8fd0ff'][i]; g.fillRect(Math.round(nx), Math.round(ny), 3, 3); g.fillRect(Math.round(nx) + 2, Math.round(ny) - 6, 1, 6); g.fillRect(Math.round(nx) + 2, Math.round(ny) - 6, 3, 1);
  }
  drawParticles(camX);
  if (!thanks) { // translucent band behind the credits (upper wall area)
    const grd = g.createLinearGradient(0, 0, 0, 150); grd.addColorStop(0, 'rgba(8,6,20,0.62)'); grd.addColorStop(0.85, 'rgba(8,6,20,0.45)'); grd.addColorStop(1, 'rgba(8,6,20,0)');
    g.fillStyle = grd; g.fillRect(0, 0, VW, 150);
    if (ENDING.fast && (t >> 4) & 1) drawText('>>', VW - 4, VH - 8, 'w', 1, 'r');
  } else {
    const k = Math.min(1, ENDING.thanksT / 40);
    g.fillStyle = 'rgba(8,6,20,' + 0.5 * k + ')'; g.fillRect(0, 40, VW, 64);
    if (ENDING.thanksT > 10) { drawTextShadow('THANK YOU', VW / 2, 50, 'y', 3, 'c'); drawTextShadow('FOR PLAYING!', VW / 2, 74, 'y', 3, 'c'); }
    if (ENDING.thanksT > 150 && (frame >> 5) & 1) drawText('TAP: TITLE', VW / 2, VH - 9, 'w', 1, 'c');
  }
  blit();
  if (!thanks) { // hi-res credits (clipped to the band)
    let y = ENDING.credY; const s = hiS();
    sctx.save(); sctx.beginPath(); sctx.rect(0, 0, screen.width, 146 * s); sctx.clip();
    for (const c of CREDITS) {
      const h = c.gap || (c.head ? 18 : c.title ? 26 : 13);
      if (y > -30 && y < 160) {
        if (c.title) drawHiText(c.title, VW / 2, y, 13, '#ffe08a', '#2a1020');
        else if (c.head) drawHiText(c.head, VW / 2, y + 4, 8, '#9fd8ff', '#081020');
        else if (c.text) drawHiText(c.text, VW / 2, y, 8, '#ffffff', '#120e24');
      }
      y += h;
    }
    sctx.restore();
  }
}
