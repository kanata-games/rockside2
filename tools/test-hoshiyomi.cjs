const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
function clearKeys(){run('releaseAll();mansionInput.slide=mansionInput.use=mansionInput.map=false;')}
// ===== test.44: 書庫の奥 / ダーク星詠み / 星詠みの欠片 =====
run('mansionStart(false)');ticks(5);
// --- vertical exits: hub chimney, hub hatch → cellar, archiveInner ↔ obsStair
{clearKeys();run('M.flags.seal=true;mansionEnter("bedroom",616,100);M.vy=-6;M.y=10;M.transition=0;');ticks(3);assert.equal(run('M.room'),'hubLoft');assert(run('mansionFits(M.x,M.y)'));
 run('mansionEnter("hubLoft",616,150);M.transition=0;');ticks(80);assert.equal(run('M.room'),'bedroom','falling down the chimney returns to the bedroom');
 clearKeys();run('mansionEnter("bedroom",344,208);M.transition=0;');ticks(10);assert.equal(run('M.room'),'bedroom','closed hatch is solid');assert(run('mansionHatchNear()'));run('mansionUse()');ticks(40);assert.equal(run('M.room'),'hubCellar','opened hatch drops into the cellar');
 run('mansionEnter("archiveInner",224,40);M.y=10;M.vy=-6;M.transition=0;');ticks(2);assert.equal(run('M.room'),'obsStair');
 console.log('PASS vertical exits: chimney up/down, hatch to cellar, archiveInner → obsStair.');}
// --- shards: fixed pickup, drop counter, save round-trip
{clearKeys();run('mansionEnter("obsStair",0,0);const s=MR.obsStair.shards[0];M.x=s[0];M.y=s[1];M.enemies=[];M.transition=0;M.shards=0;M.shardsTaken=[];');ticks(3);assert.equal(run('M.shards'),1);assert.equal(run('M.shardsTaken.length'),1);
 ticks(3);assert.equal(run('M.shards'),1,'fixed shard is taken once');
 run('M.dropCount=0;mansionFoeDropShard({kind:"bat",x:M.x,y:M.y});mansionFoeDropShard({kind:"bat",x:M.x,y:M.y});');assert.equal(run('M.pickups.filter(p=>p.kind==="shard").length'),1);ticks(30);assert.equal(run('M.shards'),2);
 run('M.upg={hp:1};mansionSave();mansionStart(true)');assert.equal(run('M.shards'),2);assert.equal(run('M.shardsTaken.length'),1);assert.equal(run('M.upg.hp'),1);assert.equal(run('mansionMaxHP()'),18);
 run('mansionEnter("obsStair",0,0)');assert.equal(run('MR.obsStair.shards.filter(s=>!M.shardsTaken.includes(s[2])).length'),run('MR.obsStair.shards.length')-1);
 console.log('PASS shards: fixed pickups once, 1-in-2 enemy drops, save/load keeps shards, taken list and upgrades.');}
// --- upgrades
{run('M.shards=30;M.upg={};M.flags.hoshiyomiDefeated=true;mansionEnter("bedroom",520,208);M.transition=0;');ticks(2);const npc=run('mansionNearbyNPC()&&mansionNearbyNPC().id');assert.equal(npc,'hoshiyomi');
 run('mansionUse()');assert(run('M.talk&&M.talk.speaker==="星詠み"'));for(let i=0;i<5&&run('!!M.talk');i++)run('mansionTalkNext()');assert.equal(run('M.menuTab'),'upgrade');assert(run('M.map'));
 assert(run('mansionUpgradeHTML().includes("mUpg-hp")&&mansionUpgradeHTML().includes("mUpg-shot")&&mansionUpgradeHTML().includes("mUpg-slide")'));
 assert(run('mansionUpgradeBuy("hp")'));assert.equal(run('mansionMaxHP()'),18);assert.equal(run('M.hp'),18);assert(run('mansionUpgradeBuy("shot")'));assert(run('mansionUpgradeBuy("slide")'));assert.equal(run('M.shards'),30-2-3-2);
 run('M.map=false;M.talk=null;M.cool=0;keys.shoot=true');ticks(1);assert.equal(run('M.shots[0].damage'),2);clearKeys();ticks(12);
 run('M.ground=true;M.slideT=0;mansionInput.slide=true');ticks(1);assert(run('M.slideT>=29'),'slide is longer');clearKeys();ticks(40);
 run('M.shards=0');assert.equal(run('mansionUpgradeBuy("hp")'),false,'cannot buy without shards');run('M.upg.shot=2;M.shards=99');assert.equal(run('mansionUpgradeBuy("shot")'),false,'max level');
 run('mansionSave();mansionStart(true)');assert.equal(run('M.upg.slide'),1);assert.equal(run('M.upg.shot'),2);
 console.log('PASS upgrades: hub NPC talk opens menu, HP/shot/slide effects, costs, max level, saved.');}
// --- sequel art loader preference
{run(`globalThis.__req=[];globalThis.fetch=u=>{__req.push(u);const ok=u.includes('-sequel');return Promise.resolve({ok,json:()=>Promise.resolve(ok?{frames:[{name:'idle_0',rect:[0,0,512,512],anchor:[256,500],scale:.105},{name:'dash_0',rect:[512,0,512,512],anchor:[768,500],scale:.105}],idle:[0],dash:[1]}:{})});};hoshiArtLoad('tst','hoshiyomi_dark');`);
 assert.equal(run('__req[0]'),'assets/hoshiyomi_dark-sequel.json');
 run(`HOSHI_ART.tst2={mode:'sequel',img:{},meta:{frames:[{name:'idle_0',rect:[0,0,512,512],anchor:[256,500]},{name:'dash_0',rect:[512,0,512,512],anchor:[768,500]}],idle:[0],dash:[1]}};HOSHI_ART.tst3={mode:'grid',img:{},meta:{frameWidth:48,animations:{idle:{frames:[0,1],ms:200},dash:{frames:[9],ms:80}}}}`);
 assert.equal(run('hoshiFrame(HOSHI_ART.tst2,"dash",0).name'),'dash_0');assert.equal(run('hoshiFrame(HOSHI_ART.tst2,"shootWindup",0).name'),'idle_0');assert.equal(run('hoshiFrame(HOSHI_ART.tst3,"dash",0)'),9);
 run('delete globalThis.fetch');console.log('PASS art loader: -sequel json requested first, sequel frames by name/list, 48px grid fallback.');}
// --- boss: telegraphs exist, bot dodges and wins
function bossBot(){return run(`(()=>{const e=M.enemies.find(e=>e.kind==='hoshiBoss');if(!e)return 'gone';releaseAll();if(!M.ground&&M.vy<0)keys.jump=true;const dx=e.x-M.x,ad=Math.abs(dx);let want=null;
 if(e.mode==='rain'){const gs=(e.nextGaps&&e.nextGaps.length?e.nextGaps:e.gaps)||[];if(gs.length){let best=gs[0];for(const g of gs)if(Math.abs((g[0]+g[1])/2-M.x)<Math.abs((best[0]+best[1])/2-M.x))best=g;want=(best[0]+best[1])/2;}}
 if(want==null){want=e.x+(M.x<e.x?-110:110);if(want<60)want=e.x+110;if(want>450)want=e.x-110;}
 if(e.mode==='dash'){const tele=e.hp<=e.maxHp/2?30:40;want=null;const toward=Math.sign(M.x-e.x)===e.face;if(toward&&e.mt>tele&&ad<84&&ad>40&&M.ground){keys.jump=true;inp.jumpPressed=true;};}
 let jump=false,slide=false;for(const b of M.enemyShots){if(b.kind!=='hStar')continue;const d=(b.x-M.x)*Math.sign(-b.vx);if(d>0&&d<70){if(b.low||ad<120){if(d<(b.low?64:76))jump=true;}else if(d<34)slide=true;}}
 if(want!=null&&!M.slideT){if(want>M.x+4)keys.right=true;else if(want<M.x-4)keys.left=true;}
 if(jump&&M.ground){keys.jump=true;inp.jumpPressed=true;};if(slide&&M.ground&&!M.slideT){mansionInput.slide=true;M.face=Math.sign(e.x-M.x)||1;}
 if(!keys.right&&!keys.left&&!M.slideT)M.face=Math.sign(e.x-M.x)||M.face;
 keys.shoot=(M.t&1)===0&&(M.face===Math.sign(e.x-M.x));return e.mode;})()`);}
{run('M.upg={};M.shards=0;M.flags.hoshiyomiDefeated=false;M.hoshiTries=0;mansionEnter("obsDome",40,224);M.transition=0;M.hp=mansionMaxHP();');assert(run('M.enemies.some(e=>e.kind==="hoshiBoss")'));run('keys.right=true');ticks(40);clearKeys();
 assert(run('M.talk&&M.talk.speaker==="ダーク星詠み"'),'intro talk');for(let i=0;i<6&&run('!!M.talk');i++)run('mansionTalkNext()');assert.equal(run('M.hoshiState'),'active');
 const seen=new Set();let tele={rain:false,dash:false,shoot:false},hurt=0,lastHp=run('M.hp'),retries=0,frames=0;
 while(frames<9000&&run('M.hoshiState')!=='done'){if(run('!!M.talk')){if(run('M.talk.speaker')==='ダーク星詠み'){retries++;}run('mansionTalkNext()');continue;}
  const mode=run(require('./bossbot.cjs'));seen.add(mode);ticks(1);frames++;
  if(run('(()=>{const e=M.enemies.find(e=>e.kind==="hoshiBoss");return e&&e.mode==="rain"&&e.mt>30&&e.mt<80&&e.gaps.length===2})()'))tele.rain=true;
  if(run('(()=>{const e=M.enemies.find(e=>e.kind==="hoshiBoss");return e&&e.mode==="dash"&&e.mt<20})()'))tele.dash=true;
  if(run('(()=>{const e=M.enemies.find(e=>e.kind==="hoshiBoss");return e&&e.mode==="shoot"&&e.mt<36&&e.pattern})()'))tele.shoot=true;
  const hp=run('M.hp');if(hp<lastHp){hurt+=lastHp-hp;if(process.env.DBG)console.log('hit',run('(()=>{const e=M.enemies.find(e=>e.kind==="hoshiBoss");return JSON.stringify({m:e.mode,mt:e.mt,ex:Math.round(e.x),ey:Math.round(e.y),x:Math.round(M.x),y:Math.round(M.y),h:M.h,sl:M.slideT,vy:M.vy.toFixed(1),hp:e.hp})})()'));}lastHp=hp;}
 run('releaseAll()');
 console.log(`  bot: ${frames} frames, damage taken ${hurt}, retries ${retries}, modes ${[...seen].join('/')}`);
 assert.equal(run('M.hoshiState'),'done','bot beats ダーク星詠み');assert(retries===0,'bot never dies');assert(hurt<=12,'fight is readable: bot took '+hurt);['hsConstel','hsOrbit','hsComet','hsNova'].forEach(m=>assert(seen.has(m),'signature move shown: '+m));
 assert(tele.rain&&tele.dash&&tele.shoot,'every attack telegraphs');for(const m of['walk','shoot','dash','rain'])assert(seen.has(m),m);
 assert(run('M.flags.hoshiyomiDefeated'));assert(run('M.talk&&M.talk.speaker==="星詠み"'),'post-fight talk');assert(run('M.shards>=3'));
 run('mansionTalkClose(true);M.map=false;mansionEnter("obsDome",100,224)');assert(!run('M.enemies.some(e=>e.kind==="hoshiBoss")'),'stays defeated');
 run('mansionEnter("bedroom",520,208)');assert.equal(run('mansionNearbyNPC().id'),'hoshiyomi');
 console.log('PASS boss bot: ダーク星詠み telegraphs star shots / star rain gaps / dash, bot dodges and wins, then she joins the hub.');}
// --- retry after a loss
{run('M.flags.hoshiyomiDefeated=false;mansionEnter("obsDome",40,224);M.transition=0;M.hoshiState="active";M.talk=null;M.map=false;M.hurt=0;M.hp=1;mansionDamage(2,1)');assert(run('M.talk&&M.talk.speaker==="ダーク星詠み"'));assert.equal(run('M.hp'),run('mansionMaxHP()'));run('mansionTalkNext();mansionTalkNext()');assert.equal(run('M.hoshiState'),'active');assert.equal(run('M.enemies.find(e=>e.kind==="hoshiBoss").hp'),130);
 console.log('PASS boss retry: losing restores HP, she taunts, and the fight restarts from full.');}
