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
const results={};
for(const id of ['tobiume','neenia','lily','disaster']){const B=run(`KEIKO_BOSSES.${id}`);
 run(`M.upg={};M.flags.${B.flag}=false;mansionEnter("${B.room}",40,224);M.transition=0;M.hp=mansionMaxHP();M.shards=0;`);clearKeys();run('keys.right=true');ticks(40);clearKeys();
 assert(run(`M.talk&&M.talk.speaker===${JSON.stringify(B.real+'？')}`),id+' impostor greets as the friend');run('mansionTalkNext();mansionTalkNext()');assert(run(`M.talk&&M.talk.speaker===${JSON.stringify(B.name)}`),id+' impostor reveals itself');for(let i=0;i<6&&run('!!M.talk');i++)run('mansionTalkNext()');assert.equal(run('M.keiko.state'),'active');
 const seen=new Set(),tel=new Set();let hurt=0,last=run('M.hp'),retries=0,frames=0;
 while(frames<12000&&run('M.keiko.state')==='active'||run('!!M.talk')&&run('M.keiko.state')!=='done'){if(run('!!M.talk')){retries++;run('mansionTalkNext()');continue;}
  seen.add(bot());ticks(1);frames++;
  const tl=run(`(()=>{const e=M.enemies.find(e=>e.kind==='keikoBoss');const r=[];if(e.mode==='rain'&&e.gaps.length===2&&e.mt>25&&e.mt<80)r.push('rain');if((e.mode==='swoop'||e.mode==='spear')&&e.mt<20)r.push(e.mode);if(e.pattern&&e.mt<30)r.push(e.mode);if(e.marks.some(m=>m.t<m.arm))r.push('snare');if((e.mode==='shock'||e.mode==='axe')&&e.mt<30)r.push(e.mode);if(e.mode==='wave'&&e.mt<40)r.push('wave');if(e.mode==='scythe'&&e.mt<44)r.push('scythe');return r.join(',')})()`);for(const x of tl.split(',').filter(Boolean))tel.add(x);
  const hp=run('M.hp');if(hp<last){hurt+=last-hp;if(process.env.DBG)console.log(id,'hit',run('(()=>{const e=M.enemies.find(e=>e.kind==="keikoBoss");return JSON.stringify({m:e.mode,mt:e.mt,ex:Math.round(e.x),lift:e.lift,x:Math.round(M.x),y:Math.round(M.y),sh:M.enemyShots.map(b=>b.shape+(b.low?"L":"H")+Math.round(b.x))})})()'));}last=hp;}
 run('releaseAll()');
 console.log(`  ${id}: ${frames} frames, damage ${hurt}, retries ${retries}, modes ${[...seen].join('/')}, telegraphs ${[...tel].join('/')}`);
 assert.equal(run('M.keiko.state'),'done',id+' bot wins');assert.equal(retries,0,id+' bot never loses');assert(hurt<=8,id+' readable: took '+hurt);
 for(const m of [...new Set([...B.seq,...B.rageSeq])]){assert(seen.has(m),id+' uses '+m);assert(tel.has(m)||(m==='snare'&&tel.has('snare')),id+' telegraphs '+m);}
 assert(run(`M.talk&&M.talk.speaker===${JSON.stringify(B.name)}`),'impostor fades');assert(!run(`M.flags.${B.flag}`));run('mansionTalkNext();mansionTalkNext()');assert(run(`M.flags.${B.flag}`),'real friend freed');assert.equal(run('M.shards'),3,id+' gives 3 shards');assert(run(`M.talk&&M.talk.speaker===${JSON.stringify(B.real)}&&M.talk.lines.length===3`),'real friend talks');run('mansionTalkClose(true);M.map=false');
 run(`mansionEnter("${B.room}",430,224);M.transition=0`);ticks(3);assert(!run('M.talk'),'no repeat fight on re-entry');assert.equal(run('mansionNearbyNPC()&&mansionNearbyNPC().id'),'keiko_'+id);
 run('mansionUse()');for(let i=0;i<4&&run('!!M.talk');i++)run('mansionTalkNext()');assert(run('mansionKeikoActive()'),'rematch');run('M.keiko.state="done";M.enemyShots=[]');
 run('mansionSave();');assert(run(`JSON.parse(localStorage.getItem(MANSION_KEY)).flags.${B.flag}===true`));
 results[id]=hurt;}
console.log('PASS impostor bosses: ハネウメ / ネムニア / リリリ / ズターさん greet as the friend, reveal themselves, telegraph every attack; the bot dodges from the warnings and wins; the real friend is freed (damage '+JSON.stringify(results)+'), 3 shards, post-fight talk, rematch NPC, saved flags.');
// retry after a loss + arena locks + save round trip
{run('M.flags.keikoLily=false;mansionEnter("kLily",40,224);M.transition=0;mansionKeikoStart();M.talk=null;M.map=false;M.hurt=0;M.hp=1;mansionDamage(2,1)');assert(run('M.talk&&M.talk.speaker==="リリリ"'));assert.equal(run('M.hp'),run('mansionMaxHP()'));run('mansionTalkNext()');assert(run('mansionKeikoActive()'));
 assert.equal(run('mansionSolids().filter(b=>b[2]===24).length'),2,'arena doors are sealed during a spar');
 run('M.keiko.state="done";mansionSave();mansionStart(true)');assert(run('M.flags.keikoTobiume&&M.flags.keikoNeenia&&M.flags.keikoStar'));
 console.log('PASS impostor retry: losing restores HP with a friendly line and restarts; arena seals during the fight; flags survive save/load.');}
// garden door + art loader order
{run('M.flags.boss=true;M.flags.seal=true;mansionEnter("garden",328,256);M.transition=0;M.enemies=[]');ticks(2);const d=run('MR.garden.doors.find(d=>d.to==="kGate")');assert(d,'garden has a door to 稽古庭');
 run(`globalThis.__req=[];globalThis.fetch=u=>{__req.push(u);return Promise.resolve({ok:false})};keikoArtLoad('neenia');`);assert.equal(run('__req[0]'),'assets/neenia-sequel.json');assert(run('__req.includes("assets/neenia_real-sequel.json")'),'real friend art requests <normal>_real-sequel');
 console.log('PASS garden door to 月下の稽古庭; impostor art requests <name>-sequel, the real friend <normal>_real-sequel (then the first-game normal sheet).');}
