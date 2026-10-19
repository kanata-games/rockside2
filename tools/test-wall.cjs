// test.57: wall counters — a bot that only clings / wall-kicks gets punished by every boss's wall move; leaving the wall in time is safe.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
function clearKeys(){run('releaseAll();mansionInput.slide=mansionInput.use=mansionInput.map=false;')}
// ===== test.45: 月下の稽古庭 — friendly sparring =====
run('mansionStart(false)');ticks(5);
const BOT=require('./bossbot.cjs');function bot(){return run(BOT);}
// ===== test.47: 影の四騎 + ダーク海音ちゃん =====
function fight(id,upg){const B=run(`KEIKO_BOSSES.${id}`);
 run(`M.talk=null;M.keiko=null;M.map=false;M.upg=${JSON.stringify(upg)};M.flags.${B.flag}=false;mansionEnter("${B.room}",40,224);M.transition=0;M.hp=mansionMaxHP();M.shards=0;`);clearKeys();run('keys.right=true');ticks(40);clearKeys();
 assert(run(`M.talk&&M.talk.speaker===${JSON.stringify(B.name)}`),id+' shade introduces itself '+run('JSON.stringify([M.room,M.x,M.y,M.keiko,M.transition,M.map,state,M.messageT])'));for(let i=0;i<6&&run('!!M.talk');i++)run('mansionTalkNext()');
 assert(run('mansionKeikoActive()'),id+' fight starts '+run('JSON.stringify([M.keiko,M.talk&&M.talk.speaker,M.dead,M.hp])'));
 const seen=new Set();let hurt=0,last=run('M.hp'),losses=0,frames=0;
 while(frames<16000&&(['active','lost'].includes(run('M.keiko?M.keiko.state:"lost"'))||run('!!M.talk')&&run('M.keiko?M.keiko.state:"lost"')!=='done')){if(!run('M.keiko')){losses++;if(losses>3)break;run(`mansionEnter("${B.room}",40,224);M.transition=0;mansionKeikoStart();M.talk=null`);last=run('M.hp');continue;}if(run('!!M.talk')){if(losses>3)break;run('mansionTalkNext()');last=run('M.hp');continue;}
  seen.add(CUR());ticks(1);frames++;const hp=run('M.hp');if(hp<last){hurt+=last-hp;if(process.env.DBG&&id==="eclipse")console.log("hit",run("(()=>{const e=M.enemies.find(e=>e.kind===\"keikoBoss\");return e.mode+\" \"+e.mt+\" ex\"+Math.round(e.x)+\" x\"+Math.round(M.x)+\" y\"+Math.round(M.y)})()"));}last=hp;}
 run('releaseAll()');return{B,seen,hurt,losses,frames,won:run('M.keiko?M.keiko.state:"lost"')==='done'};}
let CUR=bot;
const CLING=`(()=>{const e=M.enemies.find(e=>e.kind==='keikoBoss');releaseAll();const side=M.x<(KEIKO_L+KEIKO_R)/2?-1:1;if(side<0)keys.left=true;else keys.right=true;
 if(M.ground||M.wall&&M.t%40===0){keys.jump=true;inp.jumpPressed=true;}else if(M.vy<0)keys.jump=true;M.face=-side;keys.shoot=(M.t&1)===0;return 'cling';})()`;
// 1) fight-level: the clinging bot gets hit by the wall move in a shade fight; the normal bot is untouched by it
for(const id of ['vesper','lavis','nocturne','eclipse']){CUR=()=>run(CLING);const r=fight(id,{hp:4,shot:2,slide:2});const w=run('M.wc?[M.wc.used,M.wc.hits]:[0,0]');
 console.log(`  ${id} cling bot: ${r.frames}f, damage ${r.hurt}, wall moves ${w[0]}, wall hits ${w[1]}, losses ${r.losses}`);
 assert(w[0]>=2&&w[1]>=1,id+' wall-clinging gets punished by the wall counter');
 CUR=bot;const n=fight(id,{hp:4,shot:2,slide:2});const w2=run('M.wc?[M.wc.used,M.wc.hits]:[0,0]');
 console.log(`  ${id} normal bot: ${n.frames}f, damage ${n.hurt}, wall moves ${w2[0]}, wall hits ${w2[1]}, losses ${n.losses}`);
 assert(n.won&&n.losses===0,id+' normal bot still wins');assert(w2[0]>=1,id+' wall move appears in a normal fight');}
console.log('PASS wall counters: shades punish wall-clinging, the dodge bot still wins and sees the move.');
// 2) every boss: hold Umine on the wall → hit (アスターテ only pushes); step off the wall after the telegraph → safe
const KINDS={tobiume:'keikoBoss',neenia:'keikoBoss',lily:'keikoBoss',disaster:'keikoBoss',vesper:'keikoBoss',lavis:'keikoBoss',nocturne:'keikoBoss',eclipse:'keikoBoss',hoshi:'hoshiBoss',seiten:'seitenBoss',dice:'diceBoss',diceGirl:'diceBoss',astarte:'boss'};
for(const id of Object.keys(KINDS)){for(const dodge of [false,true]){
 const out=run(`(()=>{const fake={kind:${JSON.stringify(KINDS[id])},id:${JSON.stringify(id)},girl:${id==='diceGirl'},hp:9,x:256};const of=mansionBossFocus;mansionBossFocus=()=>fake;M.talk=null;M.dead=false;M.hp=99;arenaSet(128);wcReset();M.wc.cool=0;M.wc.cling=40;
  const fl=wcFloor(fake);let hits=0,minX=999,maxT=0;M.x=KEIKO_L;for(let t=0;t<160;t++){M.hurt=0;const h=M.wc.haz[0];if(h)maxT=Math.max(maxT,h.t);
   if(${dodge}&&h&&h.t>=WC_TELE-14){M.x=Math.min(M.x+3,(KEIKO_L+KEIKO_R)/2);M.ground=true;M.wall=0;M.y=fl;}else if(!(${dodge}&&M.x>KEIKO_L+WC_STRIP)){M.ground=false;M.wall=-1;M.y=fl-70;M.x=Math.max(M.x,KEIKO_L);}
   const before=M.wc.hits;M.hp=99;wcTick();if(M.wc.hits>before)hits++;minX=Math.max(minX===999?0:minX,M.x);}
  mansionBossFocus=of;arenaSet(null);return {hits,used:M.wc.used,pushed:minX,name:WC_STYLE[${JSON.stringify(id)}].name};})()`);
 if(id==='astarte'){if(!dodge)assert(out.hits===0&&out.pushed>run('KEIKO_L')+0,'アスターテ stays gentle: push only');}
 else if(dodge)assert.equal(out.hits,0,id+' wall move is dodgeable by leaving the wall');else assert(out.hits>=1,id+' wall move hits a clinger ('+out.name+')');
 if(!dodge)console.log(`  ${id}: 「${out.name}」 clinger hits ${out.hits}`);}}
console.log('PASS wall counters: all 13 bosses threaten the wall Umine clings to; each is dodged by leaving the wall in time; アスターテ only pushes.');
