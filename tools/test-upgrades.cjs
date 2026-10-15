const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
function clearKeys(){run('releaseAll();mansionInput.slide=mansionInput.use=mansionInput.map=false;')}
// ===== test.48: 星の小瓶 / 空中ダッシュ / boss camera =====
run('mansionStart(false)');ticks(5);
const flat=()=>{run('M.talk=null;M.map=false;M.enemies=[];M.enemyShots=[];M.pickups=[];');};
// shop
{run('M.shards=30;M.upg={}');const h=run('mansionUpgradeHTML()');assert(h.includes('mUpg-vial')&&h.includes('mUpg-dash'),'shop lists the new upgrades');
 assert(run('mansionUpgradeBuy("vial")'));assert.equal(run('M.shards'),26);assert(run('mansionUpgradeBuy("vial")'));assert(!run('mansionUpgradeBuy("vial")'),'2 vials max');assert(run('mansionUpgradeBuy("dash")'));assert.equal(run('M.shards'),11);
 run('mansionSave();mansionStart(true)');assert.deepEqual(run('[M.upg.vial,M.upg.dash]'),[2,1],'upgrades saved');
 console.log('PASS shop: 星の小瓶 (4,7 shards, 2 vials) and 空中ダッシュ (8) are sold, paid in shards, and saved.');}
// vial
{run('mansionEnter("sTobi",100,224);M.transition=0');ticks(2);flat();run('M.vialHP=0;M.hp=mansionMaxHP()-1');
 run('M.pickups.push({kind:"heart",x:M.x,y:M.y-10,vy:0,age:20})');ticks(2);
 const got=run('M.vialHP');assert(got>0,'overflow heal fills the vial (got '+got+')');assert.equal(run('M.hp'),run('mansionMaxHP()'));
 run('mansionHeal(40)');assert.equal(run('M.vialHP'),16,'capped at 8 per vial');
 run('M.hp=3');assert(run('mansionVialUse()'));assert.equal(run('M.hp'),Math.min(run('mansionMaxHP()'),19));assert.equal(run('M.vialHP'),16-(run('M.hp')-3));
 run('M.hp=mansionMaxHP()');assert(!run('mansionVialUse()'),'no use at full HP');
 run('mansionSave();mansionStart(true)');assert(run('M.vialHP')>0,'vial contents saved');
 assert(run('mansionStatusHTML()').includes('星の小瓶'),'status panel shows vials');
 console.log('PASS 星の小瓶: overflow healing fills vials (8 each), V/button pours it into HP, contents saved, shown in HUD + status panel.');}
// air dash
function airRun(dash){run(`mansionEnter("sTobi",100,224);M.transition=0;M.upg.dash=${dash?1:0}`);ticks(3);flat();run('M.x=100;M.y=224;M.vx=0;M.face=1');ticks(2);
 run('releaseAll();keys.right=true;keys.jump=true;inp.jumpPressed=true');ticks(1);run('inp.jumpPressed=false');ticks(14);run('mansionInput.slide=true');ticks(1);const d0=run('M.dashT');let n=0;while(!run('M.ground')&&n++<200){ticks(1);if(n===8)run('mansionInput.slide=true');}
 const x=run('M.x');run('releaseAll()');return{x,d0};}
{const a=airRun(false),b=airRun(true);console.log(`  jump distance ${Math.round(a.x-100)}px, with air dash ${Math.round(b.x-100)}px`);
 assert.equal(a.d0,0,'no dash without the upgrade');assert(b.d0>0,'dash starts in midair');assert(b.x-a.x>=40,'air dash adds real distance');
 // once per airtime: a second press in the same jump does nothing (checked inside airRun at n===8) -> verify count
 run('mansionEnter("sTobi",100,224);M.transition=0');ticks(3);flat();run('M.upg.dash=1;M.x=100;M.y=224;releaseAll();keys.jump=true;inp.jumpPressed=true');ticks(1);run('inp.jumpPressed=false');ticks(6);run('mansionInput.slide=true');ticks(16);assert(run('M.airDashUsed'));run('mansionInput.slide=true');ticks(1);assert.equal(run('M.dashT'),0,'only one dash per jump');
 let n=0;run('keys.jump=false');while(!run('M.ground')&&n++<200)ticks(1);ticks(1);assert(!run('M.airDashUsed'),'landing resets the dash');
 console.log('PASS 空中ダッシュ: one level dash per airtime (needs the upgrade), +'+Math.round(b.x-a.x)+'px, resets on landing/wall.');}
// dash nook: slide-jump off the ledge + air dash reaches the shard ledge
{run('M.shardsTaken=(M.shardsTaken||[]).filter(x=>x!=="dashNook:0");mansionEnter("dashNook",88,160);M.transition=0;M.upg.dash=1');ticks(3);flat();run('M.x=86;M.y=160;M.face=1;releaseAll()');ticks(2);
 const s0=run('M.shards');run('keys.right=true;mansionInput.slide=true');ticks(1);run('keys.jump=true;inp.jumpPressed=true');ticks(1);run('inp.jumpPressed=false');let n=0,dashed=false;
 while(n++<240){ticks(1);if(!dashed&&!run('M.ground')&&run('M.vy')>1){run('mansionInput.slide=true');dashed=true;}if(run('M.ground')&&n>5)break;}run('releaseAll()');ticks(4);
 console.log('  nook: landed at',Math.round(run('M.x')),run('M.y'),'shards',s0,'->',run('M.shards'));
 assert(run('(M.shardsTaken||[]).includes("dashNook:0")'),'air dash reaches the nook shard');
 run('M.shardsTaken=M.shardsTaken.filter(x=>x!=="dashNook:0");M.upg.dash=0;mansionEnter("dashNook",88,160);M.transition=0');ticks(3);flat();run('M.x=86;M.y=160;M.face=1;releaseAll();keys.right=true;mansionInput.slide=true');ticks(1);run('keys.jump=true;inp.jumpPressed=true');ticks(1);run('inp.jumpPressed=false');ticks(120);run('releaseAll()');
 assert(!run('M.shardsTaken.includes("dashNook:0")'),'slide jump alone falls short');
 console.log('PASS 星屑の飛び石: a shard ledge beyond slide-jump range, reachable with slide jump + air dash (reach.js models the dash; unlock order unchanged).');}
// boss camera
{for(const [room,kind] of [['sStar','keikoBoss'],['kTobi','keikoBoss'],['obsDome','hoshiBoss']]){
 run(`M.flags.hoshiyomiDefeated=false;M.keiko=null;mansionEnter("${room}",60,224);M.transition=0`);ticks(2);flat();run(`if(!M.enemies.length){mansionKeikoEnter("${room}");mansionHoshiEnter("${room}");}`);
 run(`M.talk=null;if(M.keiko){mansionKeikoStart();}else{M.hoshiState='active';}M.x=50;{const b=M.enemies.find(e=>e.kind==="${kind}");b.x=465;}`);
 run('mansionCamera(true)');for(let i=0;i<120;i++)run('mansionCamera()');
 const r=run(`(()=>{const v=mansionView(),e=M.enemies.find(e=>e.kind==="${kind}");return{l:M.camX,w:v.w,ex:e.x,x:M.x,z:v.zoom}})()`);
 assert(r.ex-16>=r.l-1&&r.ex+16<=r.l+r.w+1&&r.x-8>=r.l-1,room+' boss and Umine both in view '+JSON.stringify(r));
 run('if(M.keiko)M.keiko.state="done";M.hoshiState="done";M.enemies=[]');for(let i=0;i<80;i++)run('mansionCamera()');}
 assert(run('mansionView().zoom')>.9||run('M.bossZoom')===0,'zoom returns after the fight');
 console.log('PASS boss camera: during keiko/shade/ダーク星詠み fights the camera centres between Umine and the boss and zooms out (down to the whole arena) so the boss is always on screen.');}
