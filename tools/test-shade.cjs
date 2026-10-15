const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
function clearKeys(){run('releaseAll();mansionInput.slide=mansionInput.use=mansionInput.map=false;')}
// ===== test.45: 月下の稽古庭 — friendly sparring =====
run('mansionStart(false)');ticks(5);
function bot(){return run(`(()=>{const e=M.enemies.find(e=>e.kind==='keikoBoss');if(!e)return 'gone';releaseAll();if(!M.ground&&M.vy<0)keys.jump=true;const dx=e.x-M.x,ad=Math.abs(dx);let want=null;
 const tele=e.hp<=e.maxHp/2?30:40;
 if(e.mode==='rain'){const gs=(e.nextGaps&&e.nextGaps.length?e.nextGaps:e.gaps)||[];if(gs.length){let best=gs[0];for(const g of gs)if(Math.abs((g[0]+g[1])/2-M.x)<Math.abs((best[0]+best[1])/2-M.x))best=g;want=(best[0]+best[1])/2;}}
 if(want==null){want=e.x+(M.x<e.x?-150:150);if(want<60)want=e.x+150;if(want>450)want=e.x-150;}
 for(const mk of e.marks){if(Math.abs(want-mk.x)<mk.w/2+14)want=mk.x+(want<mk.x?-1:1)*(mk.w/2+22);if(Math.abs(M.x-mk.x)<mk.w/2+14)want=mk.x+(M.x<mk.x?-1:1)*(mk.w/2+24);}
 if((e.mode==='shock'||e.mode==='axe')&&e.toX!=null&&Math.abs(M.x-e.toX)<60)want=e.toX+(M.x<e.toX?-90:90);
 let jump=false,slide=false;
 if(e.mode==='spear'||e.mode==='swoop'){want=null;const toward=Math.sign(M.x-e.x)===e.face;if(e.mt>tele&&toward){if(e.mode==='spear'&&ad<84&&ad>40)jump=true;if(e.mode==='swoop'&&ad<50)slide=true;}}
 for(const b of M.enemyShots){if(b.kind!=='kShot')continue;const d=(b.x-M.x)*Math.sign(-b.vx);if(d>0&&d<70){if(b.low||ad<120){if(d<(b.low?64:76)&&(b.low||!slide))jump=true;}else if(d<34)slide=true;}}
 if(want!=null&&!M.slideT){if(want>M.x+4)keys.right=true;else if(want<M.x-4)keys.left=true;}
 if(jump&&M.ground){keys.jump=true;inp.jumpPressed=true;}else if(slide&&M.ground&&!M.slideT){mansionInput.slide=true;M.face=e.mode==='swoop'?-e.face:(Math.sign(e.x-M.x)||1);}
 if(!keys.right&&!keys.left&&!M.slideT)M.face=Math.sign(e.x-M.x)||M.face;
 keys.shoot=(M.t&1)===0&&(M.face===Math.sign(e.x-M.x));return e.mode;})()`);}
// ===== test.47: 影の四騎 + ダーク海音ちゃん =====
function fight(id,upg){const B=run(`KEIKO_BOSSES.${id}`);
 run(`M.talk=null;M.keiko=null;M.map=false;M.upg=${JSON.stringify(upg)};M.flags.${B.flag}=false;mansionEnter("${B.room}",40,224);M.transition=0;M.hp=mansionMaxHP();M.shards=0;`);clearKeys();run('keys.right=true');ticks(40);clearKeys();
 assert(run(`M.talk&&M.talk.speaker===${JSON.stringify(B.name)}`),id+' shade introduces itself '+run('JSON.stringify([M.room,M.x,M.y,M.keiko,M.transition,M.map,state,M.messageT])'));for(let i=0;i<6&&run('!!M.talk');i++)run('mansionTalkNext()');
 assert(run('mansionKeikoActive()'),id+' fight starts '+run('JSON.stringify([M.keiko,M.talk&&M.talk.speaker,M.dead,M.hp])'));
 const seen=new Set();let hurt=0,last=run('M.hp'),losses=0,frames=0;
 while(frames<16000&&(run('M.keiko.state')==='active'||run('!!M.talk')&&run('M.keiko.state')!=='done')){if(run('!!M.talk')){losses++;if(losses>3)break;run('mansionTalkNext()');last=run('M.hp');continue;}
  seen.add(bot());ticks(1);frames++;const hp=run('M.hp');if(hp<last)hurt+=last-hp;last=hp;}
 run('releaseAll()');return{B,seen,hurt,losses,frames,won:run('M.keiko.state')==='done'};}
const res={};
for(const id of ['vesper','lavis','nocturne','eclipse']){
 const r=fight(id,{hp:4,shot:2,slide:2});
 console.log(`  ${id}: ${r.frames} frames, damage ${r.hurt}, losses ${r.losses}, modes ${[...r.seen].join('/')}`);
 assert(r.won,id+' upgraded bot wins');assert.equal(r.losses,0,id+' fair with upgrades');
 for(const m of new Set([...r.B.seq,...r.B.rageSeq]))assert(r.seen.has(m),id+' uses '+m);
 assert(r.B.hp>=220,'shade is beefy');
 assert(run(`M.flags.${r.B.flag}`),'flag set');assert.equal(run('M.shards'),3,'3 shards');
 for(let i=0;i<6&&run('!!M.talk');i++)run('mansionTalkNext()');
 run(`mansionEnter("${r.B.room}",40,224);M.transition=0`);run('keys.right=true');ticks(40);clearKeys();assert(!run('mansionKeikoActive()'),'no refight on re-entry');
 res[id]=r.hurt;}
// harder than the impostors: same bot without upgrades takes far more damage
const up={};{const r=fight('eclipse',{hp:4,shot:2,slide:2});up.f=r.frames;}
{const r=fight('eclipse',{});console.log(`  eclipse w/o upgrades: ${r.frames} frames (vs ${up.f}), damage ${r.hurt}, losses ${r.losses}`);assert(r.frames>up.f*2.4,'without shot upgrades the fight lasts far longer');
 run('M.upg={};M.keiko.state="active";M.hurt=0;M.hp=mansionMaxHP();mansionDamage(2,1)');const lost=run('mansionMaxHP()-M.hp');assert(lost>=3,'shade hits are heavy');console.log(`  one shade hit = ${lost} of ${run('mansionMaxHP()')} HP without upgrades`);
 run('M.keiko.state="done";M.talk=null;M.flags.shadeStar=true;M.enemyShots=[]');}
console.log('PASS shade bosses: 黄昏翼ヴェスパー / 霧弓ラヴィス / 夜想ノクターン / 蝕王エクリプス — upgraded bot wins each with no loss (damage '+JSON.stringify(res)+'); every attack used; 3 shards each; tougher without upgrades.');
// dark style
assert(run('M.flags.darkStyleUnlocked'),'all four unlock dark style');assert(run('mansionDarkOn()'),'auto-equipped on unlock');
run('mansionSave();mansionStart(true)');assert(run('M.flags.darkStyleUnlocked&&M.flags.darkStyle'),'dark style saved');
run('mansionEnter("sTobi",100,224);M.transition=0;M.enemies=[];M.talk=null;M.map=false;M.cool=0;M.shots=[];keys.shoot=true');ticks(1);run('releaseAll()');
assert(run('M.shots.length===1&&M.shots[0].pierce===true&&M.cool>=12'),'dark shots pierce '+run('JSON.stringify([M.shots,M.cool,M.map,M.actor,M.talk&&M.talk.speaker,state])'));
run('M.shots=[{x:200,y:200,vx:5,damage:1,pierce:true}];M.enemies=[{kind:"bat",x:205,y:210,hp:5,maxHp:5,t:0,flash:0},{kind:"bat",x:212,y:210,hp:5,maxHp:5,t:0,flash:0}]');
const before=run('M.enemies.map(e=>e.hp).join()');ticks(3);const after=run('M.enemies.map(e=>e.hp).join()');console.log('  pierce hp',before,'->',after);
assert(run('M.enemies.filter(e=>e.hp===4).length')===2,'one shadow shot hits both foes once each');
const sh=run('mansionStatusHTML()');assert(sh.includes('mDarkStyle'),'status toggle button');
run('mansionDarkToggle()');assert(!run('mansionDarkOn()'));run('mansionStart(true)');assert(!run('M.flags.darkStyle')&&run('M.flags.darkStyleUnlocked'),'toggle off saved');
run('M.flags.darkStyleUnlocked=false;M.flags.darkStyle=false');assert(!run('mansionDarkSet(true)'),'locked before the four shades');
console.log('PASS ダーク海音ちゃん: unlocked by all four shades, auto-equipped, saved; status-panel toggle; shadow shots pierce (each foe once) with a longer cooldown.');
