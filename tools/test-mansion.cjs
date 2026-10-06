const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
function clearKeys(){run('releaseAll();mansionInput.slide=mansionInput.use=mansionInput.map=false;')}
run('mansionStart(false)');ticks(30);assert.equal(run('M.y'),208);assert(run('M.ground'));assert(run('mansionRead().checkpoint.room==="bedroom"'));
run('M.x=231;mansionInput.use=true;');ticks(1);assert.equal(run('M.room'),'bedroom');assert(run("M.map&&M.menuTab==='area'"));run("document.getElementById('mAreaGo').handlers.click({preventDefault(){},stopPropagation(){}})");assert.equal(run('M.room'),'gallery');
// Expanded gallery branch is reachable by ordinary jumps and provides a checkpoint.
clearKeys();run('mansionEnter("gallery",208,208);M.enemies=[];');ticks(2);
run('keys.right=true;keys.jump=true');
for(let i=0;i<180&&run('M.x')<440;i++){run('if(M.ground)inp.jumpPressed=true');ticks(1);}
clearKeys();ticks(25);assert(run('M.x>416&&M.y===112'),'upper gallery checkpoint route must be reachable');
run('M.x=450;mansionUse()');assert.equal(run('M.checkpoint.room'),'gallery');
// A standing hero is blocked; a slide clears the low corridor and stands safely.
run('mansionEnter("archive",145,208);M.enemies=[];keys.right=true;');ticks(25);assert(run('M.x<=169.01'));assert(!run('mansionFits(200,208,MC.h)'));
run('mansionInput.slide=true');ticks(30);assert(run('M.x>247'));assert.equal(run('M.h'),26);assert(run('mansionFits(M.x,M.y,M.h)'));
// Slide cancellation under a ceiling must keep the reduced collider.
clearKeys();run('mansionEnter("archive",195,208);M.enemies=[];M.h=MC.slideH;M.slideT=2;M.face=1;');ticks(3);assert.equal(run('M.h'),18);assert(run('M.slideT>0'));
// Wall contact slows descent and jumping kicks away with upward momentum.
clearKeys();run('mansionEnter("hall",153,310);M.enemies=[];M.vy=4;keys.right=true;');ticks(1);assert.equal(run('M.wall'),1);assert(run('M.vy<=MC.wallFall'));
run('keys.jump=true;inp.jumpPressed=true');ticks(1);assert(run('M.vx<0'));assert(run('M.vy<0'));assert(run('M.x<153'));
// Repeated player inputs reach the upper balcony from the ground.
clearKeys();run('mansionEnter("hall",145,368);M.enemies=[];keys.right=true;keys.jump=true;');let minY=368;
for(let i=0;i<320;i++){run('if(M.ground || (M.wall && M.kickLock===0))inp.jumpPressed=true;');ticks(1);minY=Math.min(minY,run('M.y'));if(run('M.y<180'))break;}
assert(minY<180,'magic wall jumps must climb to upper floor, got '+minY);
// Bidirectional rooms, seal, shortcut, locked and unlocked basement.
clearKeys();run('mansionEnter("cellar",205,208);M.enemies=[];keys.right=true;');ticks(25);assert(run('M.x<=217.01'));
clearKeys();run('mansionEnter("archive",405,208);mansionUse();');assert(run('M.flags.seal'));assert(run('mansionRead().flags.seal'));
run('M.x=483;mansionUse()');assert.equal(run('M.room'),'bedroom');run('M.x=23;mansionUse()');assert.equal(run('M.room'),'archive');
run('mansionEnter("cellar",205,208);M.enemies=[];keys.right=true;');ticks(30);assert(run('M.x>240'));
// Checkpoint, respawn and resume preserve progression.
clearKeys();run('mansionEnter("hall",76,368);M.hp=3;mansionUse();');assert.equal(run('M.hp'),16);assert.equal(run('mansionRead().checkpoint.room'),'hall');
run('M.hp=1;M.hurt=0;mansionDamage(2)');ticks(65);assert.equal(run('M.hp'),16);assert.equal(run('M.room'),'hall');run('mansionStart(true)');assert(run('M.flags.seal'));assert.equal(run('M.room'),'hall');
// Map pauses simulation and renderer does not mutate the world.
run('mansionInput.map=true');ticks(1);const xx=run('M.x');run('keys.right=true');ticks(20);assert.equal(run('M.x'),xx);const fx=run('M.fx.length');run('for(let i=0;i<20;i++)render()');assert.equal(run('M.fx.length'),fx);

// Keyboard wall-climbing route reaches the archive balcony.
clearKeys();run('M.map=false;mansionEnter("hall",145,368);M.enemies=[];keys.right=true;keys.jump=true;');
for(let i=0;i<650&&run('M.x')<420;i++){run('if(M.ground || (M.wall && M.kickLock===0))inp.jumpPressed=true');ticks(1);}
clearKeys();ticks(70);assert(run('M.x>410 && M.y===176'),'upper balcony must be reachable through normal inputs');
// Sliding ducks the guardian projectile that hits a standing player.
run('mansionEnter("garden",290,208);M.enemies=[];M.hp=16;M.hurt=0;M.enemyShots=[{x:290,y:184,vx:0,vy:0}]');ticks(1);assert.equal(run('M.hp'),14);
run('M.hp=16;M.hurt=0;M.h=MC.slideH;M.slideT=10;M.enemyShots=[{x:M.x,y:184,vx:0,vy:0}]');ticks(1);assert.equal(run('M.hp'),16);

// Readable guardian projectile can be ducked by sliding; shots defeat guardian.
clearKeys();run('M.map=false;mansionEnter("garden",310,208);M.hurt=999;keys.shoot=true;');ticks(220);assert(run('M.flags.boss'));assert(run('mansionRead().flags.boss'));
clearKeys();run('M.x=477;mansionUse();render()');assert.equal(run('state'),'mansionClear');assert(run('M.flags.complete'));
// Menu reflects live status, pauses all encounter timers, and preserves progression.
clearKeys();run('mansionStart(false);M.hp=9;mansionMenuToggle()');
assert(run("M.map&&M.menuTab==='status'"));assert(run("mansionStatusHTML().includes('HP 9 / 16')"));
assert(run("mansionMapHTML().includes('現在地：目覚めの客室')"));
run('layout.W=390;layout.H=700;layout.gameY=0;layout.gameW=390;mansionLayout()');
assert.equal(run("mansionMenu.style.height"),'684px');
assert.equal(run("mansionMenu.style.width"),'374px');
const menuTime=run('M.t'),menuHP=run('M.hp');ticks(30);assert.equal(run('M.t'),menuTime);assert.equal(run('M.hp'),menuHP);
run("M.menuTab='map';render();M.menuTab='status';render();M.flags.seal=true");assert(run("mansionStatusHTML().includes('地下の封印が解けた')"));
run('mansionMenuToggle()');assert.equal(run('M.map'),false);ticks(1);assert(run('M.t')>menuTime);
// Touch controls stay apart and within the viewport at phone sizes.
for(const [w,h]of [[375,650],[390,700],[320,568],[844,390]]){
run(`window.innerWidth=${w};window.innerHeight=${h};M.map=false;doLayout()`);
const rects=run('JSON.stringify(mansionControlRects)'),rs=JSON.parse(rects);
for(const [id,r]of Object.entries(rs)){assert(r[0]>=0&&r[1]>=0&&r[0]+r[2]<=w+1&&r[1]+r[3]<=h+1,id+' off viewport');for(const[id2,b]of Object.entries(rs))if(id!==id2)assert(!(r[0]<b[0]+b[2]&&r[0]+r[2]>b[0]&&r[1]<b[1]+b[3]&&r[1]+r[3]>b[1]),id+' overlaps '+id2);}
for(const id of ['left','right','shoot','jump']){const r=rs[id];assert.equal(run(`zoneAt(${r[0]+r[2]/2},${r[1]+r[3]/2})`),id);}
run('M.map=true');assert.equal(run('zoneAt(30,500)'),null);
}
// Render all chambers and map. Storage failure does not stop play.
for(const id of ['bedroom','gallery','hall','archive','cellar','garden'])run(`mansionEnter('${id}',64,${id==='hall'?368:208});setState('mansion');render();M.map=true;render();M.map=false`);
run('localStorage.setItem=()=>{throw Error("quota")};mansionSave()');assert(run('M.saveError'));
console.log('PASS: room transitions, low passage collision, safe stand-up, wall fall/kick/climb, seal gates + shortcut, checkpoint/death/resume, paused map, guardian and clear, every chamber render, storage failure');
