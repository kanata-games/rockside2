// Difficulty estimate: the bot fights each boss N times WITHOUT god mode.  node tools/balance.js [areaNo[,areaNo..]] [runs]
// (build first). Final area: 9d = 闇海音, 9k = 清掃員カナタ form 1, 9m = 暴走ミミック form 2 (win = climax reached).
// (build first). Reports WIN/LOSE, remaining HP, hits taken and their causes per run.
const { chromium } = require('playwright'); const path = require('path');
const BOT = require('./bossbot.js');
const SERVE = require('./serve.js');
(async () => {
  const areas = process.argv[2] ? process.argv[2].split(',') : [1, 2, 3, 4, 5, 6], runs = +(process.argv[3] || 3);
  const srv = await SERVE.start(path.resolve(__dirname, '..')); const FILE = srv.url + 'index.html';
  const b = await chromium.launch();
  for (const n of areas) {
    const res = [];
    for (let r = 0; r < runs; r++) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
      await p.goto(FILE + '?area=' + parseInt(n, 10) + '&boss=1' + (/k$/.test(n) ? '&kanata=1' : /m$/.test(n) ? '&mimic=1' : /d$/.test(n) ? '&darkumine=1' : '')); await p.waitForTimeout(800);
      await p.keyboard.down('ArrowRight'); await p.waitForFunction(() => ROCKSIDE.state === 'bossIntro', null, { timeout: 15000 }); await p.keyboard.up('ArrowRight');
      await p.waitForFunction(() => ROCKSIDE.state === 'play', null, { timeout: 15000 });
      await p.evaluate(BOT.BOSS); await p.evaluate(() => { window.__botCfg.fire = true; });
      await p.waitForFunction(() => ['clear', 'dying', 'gameover', 'climax'].includes(ROCKSIDE.state) || ROCKSIDE.boss.state === 'rescue', null, { timeout: 180000, polling: 200 }).catch(() => {});
      const o = await p.evaluate(() => ({ win: ROCKSIDE.boss.state === 'rescue' || ROCKSIDE.state === 'clear' || ROCKSIDE.state === 'climax', hp: ROCKSIDE.P.hp, bossHp: ROCKSIDE.boss.hp, hits: window.__botStats.hits, causes: window.__botStats.causes.join(','), secs: Math.round(window.__botStats.frames / 60), seen: ROCKSIDE.bossSeen.join('/') }));
      res.push(o); await ctx.close();
    }
    console.log('AREA ' + n + ': ' + res.map(o => (o.win ? 'WIN hp' + o.hp : 'LOSE boss' + o.bossHp) + ' hits' + o.hits + '(' + o.causes + ') ' + o.secs + 's').join(' | '));
  }
  await b.close(); srv.close();
})();
