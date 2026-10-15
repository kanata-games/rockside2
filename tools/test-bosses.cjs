const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
function clearKeys(){run('releaseAll();mansionInput.slide=mansionInput.use=mansionInput.map=false;')}
// ===== test.49: every impostor and shade with its new move set, fought by the predictive bot (with upgrades) =====
const BOT=require('./bossbot.cjs');
run('mansionStart(false)');ticks(5);
const only=process.env.BOSS?process.env.BOSS.split(','):null;const res={};
for(const id of only||['tobiume','neenia','lily','disaster','vesper','lavis','nocturne','eclipse']){const B=run(`KEIKO_BOSSES.${id}`);
 run(`M.talk=null;M.map=false;M.keiko=null;M.upg={hp:4,shot:2,slide:2};M.flags.${B.flag}=false;mansionEnter("${B.room}",60,224);M.transition=0;M.hp=mansionMaxHP();`);ticks(2);run(`M.talk=null;M.map=false;mansionKeikoStart();`);
 const seen=new Set(),poses=new Set();let hurt=0,last=run('M.hp'),losses=0,frames=0,maxStop=0,shake=0,cut=null;
 while(frames<20000&&run('M.keiko.state')==='active'){if(run('!!M.talk')){losses++;run('while(M.talk)mansionTalkNext();M.map=false;if(M.keiko.state!=="active")0;');last=run('M.hp');if(losses>3)break;continue;}
  seen.add(run(BOT));ticks(1);frames++;const hp=run('M.hp');if(hp<last)hurt+=last-hp;last=hp;
  const j=run('[KJ.shakeT,KJ.cut&&KJ.cut.name,(()=>{const e=mansionKeikoBoss();return e?mansionKeikoPose(e):""})()]');if(j[0])shake++;if(j[1])cut=j[1];poses.add(j[2]);}
 run('releaseAll();while(M.talk)mansionTalkNext();M.map=false');
 const want=[...new Set([...B.seq,...B.rageSeq,...(B.super?[B.super]:[])])],miss=want.filter(m=>!seen.has(m));
 console.log(`  ${id}: ${frames}f, damage ${hurt}/${run('mansionMaxHP()')}, losses ${losses}, moves ${[...seen].filter(m=>m!=='walk').length}${miss.length?' MISSING '+miss:''}${cut?' super「'+cut+'」':''}, shake frames ${shake}`);
 assert(frames<20000,id+' fight ends');assert.equal(losses,0,id+' upgraded bot never loses');assert(!miss.length,id+' uses every move');
 if(B.super)assert(cut,id+' super cut-in shown');assert(shake>0,id+' has screen shake');res[id]=hurt;}
console.log('PASS boss move sets (test.49): impostors mimic their dark originals, shades use new weapon moves + a named super; the predictive bot wins every fight with upgrades and never loses (damage '+JSON.stringify(res)+').');
// juice + fairness: every bullet / beam spawns from a telegraph — sample: no beam appears without a line fx at the same height in the 12 frames before
{run('M.keiko=null;M.flags.shadeStar=false;mansionEnter("sStar",60,224);M.transition=0');ticks(2);run('M.talk=null;M.map=false;mansionKeikoStart();const e=mansionKeikoBoss();mansionKeikoMode(e,"eCross");');
 let lines=0,beamOk=true;for(let i=0;i<120;i++){run('releaseAll();M.hurt=999');ticks(1);const s=run('(()=>{const e=mansionKeikoBoss();return [ (e.fx||[]).filter(f=>f.type==="line").length,(e.beams||[]).length]})()');if(s[0])lines=i;if(s[1]&&i-lines>14)beamOk=false;}
 assert(beamOk,'beams are always preceded by their line telegraph');
 run('KJ.stop=0;mansionJuiceHit({kind:"keikoBoss",id:"eclipse",hp:0},{x:100,y:100})');assert(run('KJ.stop')>=10&&run('KJ.flashT')>0,'kill hit-stop + flash');
 run('M.keiko.state="done";M.enemyShots=[];KJ.stop=0');
 console.log('PASS juice: hit-stop on hits (long on the kill), screen shake on slams, white flash + cut-in banner for supers; beams always follow their telegraph line.');}
// ===== test.51: 青天 / ダイスロール / アスターテ signature moves, supers, hit-stop for every boss, FX fallback =====
{const want={seiten:['sSkyPounce','sHeartFan','sLullaby'],dice:['dSlam','dCardWall','dJackpot'],astarte:['aCrescentTrio','aMoonDrop']};
 const start={seiten:'mansionStart(false);M.flags.boss=true;mansionEnter("seitenArena",40,256);mansionSeitenStart()',dice:'mansionStart(false);mansionEnter("diceArena",160,256);M.enemies=[mansionNewDice()];mansionDiceStart()',astarte:'mansionStart(false);M.flags.boss=true;mansionEnter("bedroom",612,208);mansionUse();mansionFullBattle()'};
 const res={};for(const id of Object.keys(want)){run(start[id]);run('M.talk=null;M.map=false');const seen=new Set();let cut=null,stopSeen=false;
  for(let i=0,after=0;i<5000&&after<10;i++){if(seen.size>=want[id].length)after++;run('releaseAll();M.hurt=999;M.hp=mansionMaxHP()');const e=run('(()=>{const e=M.enemies[0];return e&&[e.sq,e.hp,e.maxHp]})()');if(!e)break;if(e[0])seen.add(e[0]);
   if(i%40===39&&e[1]>3){run('(()=>{const e=M.enemies[0];e.guard=0;KJ.stop=0;e.hp-=1;mansionJuiceHit(e,{x:e.x,y:e.y-20})})()');if(run('KJ.stop')>0)stopSeen=true;}
   const c=run('KJ.cut&&KJ.cut.name');if(c)cut=c;ticks(1);}
  const miss=want[id].filter(m=>!seen.has(m));assert(!miss.length,id+' shows every signature move, missing '+miss);assert(stopSeen,id+' hit-stop on hits');if(id!=='astarte')assert(cut,id+' super cut-in');res[id]=[...seen].join('/')+(cut?' cut-in '+cut:'');}
 // FX sheets: missing sets fall back to code drawing (fxSpawn returns false); a loaded set spawns and animates
 assert.equal(run('fxSpawn({id:"seiten"},"impact",10,10)'),false);
 run('SHADE_FX.dice={impact:{img:{},frameWidth:8,frameHeight:8,frames:4,ms:[50,50,50,50],drawScale:.25,anchor:[4,4]}}');assert.equal(run('fxSpawn({id:"dice"},"impact",10,10)'),true);run('fxUpdateDraw()');assert(run('KFXL.length')>=1);run('delete SHADE_FX.dice;KFXL=[]');
 run('KJ.stop=0;KJ.cut=null;M.enemyShots=[]');
 console.log('PASS sequel bosses (test.51): '+JSON.stringify(res)+'; hit-stop on every boss; FX sheets optional with code-drawn fallback.');}
// ===== test.52: small top-corner cut-in, no long freeze =====
{run('KJ.stop=0;KJ.cut=null;juiceCut("テスト","#ff7fae","青天")');assert(run('KJ.stop')<=2,'cut-in adds at most the tiny hit-stop');
 let maxT=0,boxOk=true;for(let i=0;i<80&&run('!!KJ.cut');i++){const b=run('(()=>{const b=juiceCutBox(KJ.cut);return [b.y0,b.y0+b.h,b.x0,b.w]})()');if(b[0]<0||b[1]>48||b[2]<256/3)boxOk=false;run('mansionJuiceStop()');maxT=i;}
 assert(boxOk,'cut-in stays in the top-right corner, top 20% of the screen');assert(maxT<=48,'cut-in lasts under ~0.8s: '+maxT+' frames');
 console.log('PASS cut-in (test.52): top-right slanted strip (y '+run('CUT_Y')+'–'+run('CUT_Y+CUT_H')+' of 240), '+run('CUT_LEN')+' frames, no freeze.');}
// ===== test.53: cut-in title font (Dela Gothic One subset, OFL) =====
{const fsz=fs.statSync(require('path').resolve(__dirname,'../assets/fonts/DelaGothicOne-cutin.woff2')).size;assert(fsz<60000,'font subset stays small: '+fsz);
 assert(/SIL OPEN FONT LICENSE/i.test(fs.readFileSync(require('path').resolve(__dirname,'../assets/fonts/DelaGothicOne-OFL.txt'),'utf8')),'OFL license shipped');
 assert(html.includes("assets/fonts/DelaGothicOne-cutin.woff2"),'FontFace loads the subset');
 run('KJ.cut=null;juiceCut("テスト","#ff7fae","青天")');for(let i=0;i<6;i++){run('mansionJuiceCutHi()');run('mansionJuiceStop()');}run('KJ.cut=null');
 console.log('PASS cut-in font (test.53): Dela Gothic One subset '+fsz+' bytes + OFL text; falls back to sans-serif until loaded.');}
// ===== test.54: ダイスロール sequel sheet + the serious fight with the girl inside =====
{run('mansionStart(false);M.flags.boss=true;M.flags.darkStyleUnlocked=false;mansionEnter("bedroom",365,208);M.transition=0;mansionRoruTalk()');
 assert(/練習/.test(run('M.talk.lines.join("")')),'before the shades: practice offer, he holds back');run('for(let i=0;i<9&&M.talk&&M.talk.index<M.talk.lines.length-1;i++)M.talk.index++;mansionDiceChallenge()');
 assert.equal(run('M.enemies[0].girl||false'),false,'early fights are the gentleman');run('M.talk=null;M.map=false;mansionDiceReturn()');
 run('M.upg={hp:4,shot:2,slide:2,vial:2,dash:1};M.flags.darkStyleUnlocked=true;M.flags.diceGirlDefeated=false;mansionEnter("bedroom",365,208);M.transition=0;mansionRoruTalk()');
 assert(/練習のふり/.test(run('M.talk.lines.join("")')),'after the shades he drops the act');run('mansionDiceChallenge()');
 assert(run('M.enemies[0].girl'),'serious fight is the girl');assert.equal(run('M.talk.speaker'),'ダイスロール（素顔）');assert(!/避け|ジャンプして|スライディングで/.test(run('M.talk.lines.join("")')),'no dodge tips');
 run('M.talk.index=M.talk.lines.length-1;mansionTalkNext()');assert.equal(run('M.diceState'),'active');assert(run('M.enemies[0].girl'));
 const GBOT=`(()=>{const e=M.enemies[0];if(!e)return'gone';releaseAll();keys.shoot=true;M.face=e.x<M.x?-1:1;const fx=e.fx||[];
  const go=x=>{if(Math.abs(M.x-x)>5){keys.left=M.x>x;keys.right=M.x<x;}};
  const safe=fx.find(f=>f.type==='sqsafe');if(safe)go(safe.x);
  else{const m=fx.find(f=>f.type==='sqmark');const ln=fx.find(f=>f.type==='line'&&f.y>=250&&e.mode==='gCandyRush');
   if(m&&Math.abs(M.x-m.x)<40)go(m.x+(m.x>256?-70:70));else if(ln){const a=Math.min(ln.x0,ln.x1),b=Math.max(ln.x0,ln.x1);if(M.x>a-20&&M.x<b+20&&M.ground)inp.jumpPressed=true,keys.jump=true;}
   else{const d=M.x-e.x;if(Math.abs(d)<90)go(M.x+Math.sign(d||1)*40);}}
  const near=M.enemyShots.filter(b=>(b.x-M.x)*(b.vx||0)<0&&Math.abs(b.x-M.x)<42&&Math.abs(b.vy||0)<.5&&b.y>M.y-34&&b.y<M.y+4);
  for(const b of near){if(b.y<M.y-18)mansionInput.slide=true;else if(M.ground){inp.jumpPressed=true;keys.jump=true;}}
  const fall=M.enemyShots.find(b=>(b.vy||0)>.5&&Math.abs(b.x-M.x)<16&&b.y<M.y&&b.y>M.y-90);if(fall&&!safe){keys.left=b=>0;go(M.x+(fall.x>M.x?-30:30));}
  if(e.mode==='gSmokeVeil'&&e.mt>=50&&e.mt<64&&M.ground){inp.jumpPressed=true;keys.jump=true;}
  return e.mode;})()`;
 const seen=new Set();let hurt=0,last=run('M.hp'),retries=0,f=0;
 for(;f<12000&&run('M.diceState')!=='done';f++){if(run('!!M.talk')){if(run('M.diceState')==='ready')retries++;run('M.talk.index=M.talk.lines.length-1;mansionTalkNext()');last=run('M.hp');continue;}
  seen.add(run(GBOT));ticks(1);const h=run('M.hp');if(h<last){hurt+=last-h;if(process.env.DBG)console.log('hit',run('JSON.stringify([M.enemies[0]?.mode,M.enemies[0]?.mt,Math.round(M.x),Math.round(M.y),Math.round(M.enemies[0]?.x)])'));}last=h;}
 console.log('  girl bot: '+f+' frames, damage '+hurt+', retries '+retries+', modes '+[...seen].join('/'));
 assert.equal(run('M.diceState'),'done','upgraded bot beats the serious ダイスロール');
 for(const m of ['gCandyRush','gLoadedDice','gSmokeVeil','gLolliSpin','gSugarRain','gAllIn'])assert(seen.has(m),'girl shows '+m);
 assert(run('M.flags.diceGirlDefeated&&M.flags.diceGirlReward'));assert.equal(run('mansionPermanentCount("moonCandy")'),1);
 run('M.talk=null;M.map=false;mansionDiceReturn()');
 console.log('PASS ダイスロール本気 (test.54): gentleman = practice until the four shades, then the girl inside fights for real (6 new moves + super スウィート・オールイン); reward 月影の飴玉 (+2 max HP).');}
