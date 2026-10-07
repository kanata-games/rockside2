const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
function clearKeys(){run('releaseAll();mansionInput.slide=mansionInput.use=mansionInput.map=false;')}
run('mansionStart(false)');ticks(30);assert.equal(run('M.y'),208);assert(run('M.ground'));assert(run('mansionRead().checkpoint.room==="bedroom"'));
run('M.x=231;mansionInput.use=true;');ticks(1);assert.equal(run('M.room'),'bedroom');assert(run("M.map&&M.menuTab==='area'"));run("M.map=false;M.x=180;mansionUse()");assert.equal(run('M.room'),'gallery');
// Walking traverses every pose by distance, freezes in menus, and restarts after stopping.
clearKeys();run('mansionEnter("bedroom",130,208);M.enemies=[];M.hurt=0;');ticks(2);
run('keys.right=true');const walkPoses=new Set();for(let i=0;i<25;i++){ticks(1);walkPoses.add(run('sequelWalkFrame(M.walkDistance)'));}assert.equal(walkPoses.size,4);
const walkDistance=run('M.walkDistance');run('M.map=true');ticks(30);assert.equal(run('M.walkDistance'),walkDistance);
run('M.map=false');clearKeys();ticks(8);assert.equal(run('M.walkDistance'),0);
const walkImage=images.find(i=>i.src==='assets/umine-walk.png');assert(walkImage);walkImage.onload();assert.equal(run('SEQUEL_MODEL.walkFrames.length'),4);
for(const face of [-1,1])for(let i=0;i<4;i++)run(`drawSequelWalk(${i*10.8},120,208,${face},false)`);
run('keys.right=true;keys.shoot=true');ticks(10);assert(run('M.walkDistance>0&&M.poseT>0'));clearKeys();
// Continuous hub: walk beyond the area-select doorway; talking and cellar do not alter progression.
clearKeys();run('mansionEnter("bedroom",207,208);keys.right=true;');ticks(130);assert(run('M.room==="bedroom"&&M.x>400&&M.camX>100'));assert.equal(run('mansionLocationName()'),'拠点の談話室');
clearKeys();run('M.x=390;mansionUse()');assert(run('M.talk&&M.map'));run('mansionTalkClose();M.map=false');
run('M.x=580;mansionUse()');assert.equal(run('M.room'),'hubCellar');assert.equal(run('M.enemies.length'),0);assert(run('mansionMapHTML().includes("拠点地下")'));
run('M.x=110;M.hp=4;mansionUse()');assert.equal(run('M.hp'),16);assert.equal(run('M.checkpoint.room'),'hubCellar');run('mansionStart(true)');assert.equal(run('M.room'),'hubCellar');
run('M.x=350;mansionUse()');assert(run('M.message.includes("鍵")'));assert.equal(run('M.room'),'hubCellar');
run('M.x=24;mansionUse()');assert.equal(run('M.room'),'bedroom');assert.equal(run('M.x'),550);
run('M.x=231;mansionUse()');assert(run('M.map&&M.menuTab==="area"'));run('M.map=false');
// Old saves with a 256px guest-room checkpoint remain valid after expansion.
run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{},visited:["bedroom"],checkpoint:{room:"bedroom",x:110,y:208}}));mansionStart(true)');assert.equal(run('M.room'),'bedroom');assert.equal(run('M.x'),110);
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
run('mansionEnter("garden",350,256);M.enemies=[];M.sparState="active";M.hp=16;M.hurt=0;M.enemyShots=[{x:350,y:232,vx:0,vy:0}]');ticks(1);assert.equal(run('M.hp'),14);
run('M.hp=16;M.hurt=0;M.h=MC.slideH;M.slideT=10;M.enemyShots=[{x:M.x,y:232,vx:0,vy:0}]');ticks(1);assert.equal(run('M.hp'),16);

// Readable guardian projectile can be ducked by sliding; shots defeat guardian.
clearKeys();run('M.map=false;mansionEnter("garden",350,256);mansionSparStart();M.hurt=999;keys.shoot=true;');for(let i=0;i<1200&&!run("M.flags.boss");i++){run("M.face=M.enemies[0].x<M.x?-1:1;M.hurt=999");ticks(1);}assert(run('M.flags.boss'));assert(run('mansionRead().flags.boss'));
clearKeys();run('mansionTalkClose();M.map=false;M.x=613;M.y=256;mansionUse();render()');assert.equal(run('state'),'mansionClear');assert(run('M.flags.complete'));
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
// Generated furniture loads into both renderers, with fallback only on failure.
for(const key of ['bed','door']){const img=images.find(i=>i.src==='assets/mansion-'+key+'.png');assert(img);img.onload();}
assert(run('drawMansionBed(23,176,120)'));assert(run('drawMansionDoor(232,176,80,true)'));
run('startOpening();OPENING.step=1;render();OPENING.step=3;render();mansionStart(false);render()');
// Roru is friendly, repeatable, and all conversation input paths pause exploration.
const roruImage=images.find(i=>i.src==='assets/roru-masked-idle.png');assert(roruImage);roruImage.onload();assert.equal(run('RORU_ART.frames.length'),2);
run('startOpening()');assert(run('OPEN_LINES.some(l=>l.speaker==="ダイスロール"&&l.lines[0].includes("目覚めましたか"))'));
for(let i=0;i<run('OPEN_LINES.length');i++)run(`OPENING.step=${i};render()`);
run('startOpening();OPENING.step=OPEN_LINES.length-1;OPENING.t=20;inp.startPressed=true;updateOpening();inp.startPressed=false');assert.equal(run('state'),'mansion');
run('M.x=390;M.y=208;M.transition=0;M.vx=1.8;mansionInput.use=true;');ticks(1);assert(run('M.map&&M.talk&&M.menuTab==="talk"'));const talkTimer=run('M.t');const talkX=run('M.x');ticks(45);assert.equal(run('M.t'),talkTimer);assert.equal(run('M.x'),talkX);
assert.equal(elements.get('mTalk').style.display,'block');assert.equal(elements.get('mMapTab').style.display,'none');
run('document.getElementById("mTalkNext").handlers.click({preventDefault(){},stopPropagation(){}})');assert.equal(run('M.talk.index'),1);
run('mansionInput.use=true');ticks(1);assert.equal(run('M.talk.index'),2);
run('mansionInput.use=true');ticks(1);assert(run('!M.talk&&!M.map'));assert.equal(run('M.menuTab'),'status');
run('mansionRoruTalk();document.getElementById("mMenuClose").handlers.click({preventDefault(){},stopPropagation(){}})');assert(run('!M.talk&&!M.map'));
run('M.flags.seal=true;mansionRoruTalk()');assert(run('M.talk.lines[0].includes("紋章")'));run('inp.backPressed=true');ticks(1);run('inp.backPressed=false');assert(run('!M.talk&&!M.map'));
run('M.flags.complete=true;mansionRoruTalk()');assert(run('M.talk.lines[0].includes("お帰り")'));run('mansionTalkClose();M.map=false');
run('mansionEnter("bedroom",231,208);mansionUse()');assert(run('M.map&&M.menuTab==="area"&&!M.talk'));run('M.map=false');
// Render all chambers and map. Storage failure does not stop play.
for(const id of Object.keys(run('MR')))run(`mansionEnter('${id}',64,${id==='hall'?368:id==='garden'?256:208});setState('mansion');render();M.map=true;render();M.map=false`);
run('localStorage.setItem=()=>{throw Error("quota")};mansionSave()');assert(run('M.saveError'));
console.log('PASS: room transitions, low passage collision, safe stand-up, wall fall/kick/climb, seal gates + shortcut, checkpoint/death/resume, paused map, guardian and clear, every chamber render, storage failure');

// Breakables absorb shots without blocking movement; drops heal once and pause in menus.
clearKeys();run('mansionStart(false);mansionEnter("gallery",80,208);M.enemies=[];M.transition=0;M.hp=7;');
assert(run('mansionFits(104,208)'),'candlestick must not be a movement blocker');
run('M.shots=[{x:99.2,y:191,vx:4.8}]');ticks(1);assert.equal(run('M.props[0].hp'),1);assert.equal(run('M.pickups.length'),0);assert.equal(run('M.shots.length'),0);
run('M.shots=[{x:99.2,y:191,vx:4.8}]');ticks(1);assert.equal(run('M.props[0].hp'),0);assert.equal(run('M.pickups.length'),1);
run('M.map=true');const age=run('M.pickups[0].age');ticks(20);assert.equal(run('M.pickups[0].age'),age);
run('M.map=false;M.x=104');ticks(30);assert.equal(run('M.hp'),10);assert.equal(run('M.pickups.length'),0);ticks(10);assert.equal(run('M.hp'),10);
run('M.hp=15;M.pickups=[{kind:"water",x:M.x,y:M.y-12,vy:0,age:11}]');ticks(1);assert.equal(run('M.hp'),16);
run('mansionEnter("gallery",80,208)');assert.equal(run('M.props[0].hp'),2);assert.equal(run('M.pickups.length'),0);
run('M.props[0].hp=0;M.pickups=[{kind:"water",x:100,y:180,vy:0,age:0}];mansionEnter("bedroom",430,208)');assert.equal(run('M.props.length'),0);assert.equal(run('M.pickups.length'),0);
const propImage=images.find(i=>i.src==='assets/mansion-props.png');assert(propImage);propImage.onload();run('renderMansion()');
console.log('PASS mansion props: break, heal, pause, pass-through, reentry and generated furniture.');

// Ordinary doors remain connected; only discovered portals permit fast travel.


// Restore storage after the quota-failure check so portal migration can be verified.
sandbox.localStorage.setItem=(k,v)=>storage.set(k,v);
clearKeys();run('mansionStart(false);M.x=180;mansionUse()');assert.equal(run('M.room'),'gallery');assert.equal(run('M.map'),false);
clearKeys();run('mansionEnter("bedroom",231,208);M.hp=7;mansionUse()');assert(run('M.map&&M.menuTab==="area"'));const cpBefore=run('JSON.stringify(M.checkpoint)');
assert.equal(run('mansionWarpTo("archive")'),false);assert.equal(run('M.room'),'bedroom');
assert.equal(run('mansionWarpTo("bedroom")'),false);
assert.equal(run('mansionWarpTo("cellar")'),false);
run('M.map=false;M.flags.seal=true;mansionEnter("cellar",438,208);M.enemies=[]');ticks(1);assert(run('M.portals.includes("cellar")'));run('mansionUse()');assert.equal(run('mansionWarpTo("bedroom")'),true);assert.equal(run('M.hp'),7);assert.equal(run('JSON.stringify(M.checkpoint)'),cpBefore);
run('M.transition=0;mansionUse()');assert.equal(run('mansionWarpTo("cellar")'),true);assert.equal(run('M.x'),438);assert(run('mansionFits(M.x,M.y)'));
run('M.map=false;M.flags.seal=false;mansionEnter("bedroom",231,208);mansionUse()');assert.equal(run('mansionWarpTo("cellar")'),false);assert.equal(run('M.room'),'bedroom');
run('M.x=300;M.map=true;M.menuTab="area"');assert.equal(run('mansionWarpTo("cellar")'),false);assert(run('mansionWarpHTML().includes("disabled")'));
assert.equal(Object.keys(run('MANSION_PORTALS')).length,2);
run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{seal:true},visited:["bedroom","archive"],checkpoint:{room:"bedroom",x:110,y:208}}));mansionStart(true)');assert(run('M.flags.seal'));assert.equal(run('M.portals.length'),1);assert.equal(run('M.x'),110);
run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{seal:true,boss:true},visited:["bedroom","garden"],portals:["bedroom","gallery","hall","garden","cellar"],checkpoint:{room:"garden",x:64,y:208}}));mansionStart(true)');assert.equal(run('M.portals.length'),2);assert.equal(run('M.y'),256);assert(run('M.flags.boss'));
console.log('PASS portals: discovery, persistence, all destinations, ordinary connections, blocked misuse and seal integrity.');

// Astarte introduces a friendly spar, never attacks during dialogue, and stops before lethal damage.
sandbox.localStorage.setItem=(k,v)=>storage.set(k,v);
clearKeys();run('mansionStart(false);mansionEnter("garden",350,256);M.hurt=0');ticks(1);assert(run('M.talk.speaker==="アスターテ"&&M.sparState==="ready"'));const sparTime=run('M.enemies[0].t');ticks(50);assert.equal(run('M.enemies[0].t'),sparTime);
run('mansionTalkClose();M.map=false');assert.equal(run('M.sparState'),'waiting');ticks(1);assert(run('M.talk'));
run('for(let i=0;i<6;i++)mansionTalkNext()');assert.equal(run('M.sparState'),'active');assert.equal(run('M.map'),false);
run('M.hp=1;M.hurt=0;mansionDamage(2)');assert.equal(run('M.dead'),0);assert.equal(run('M.hp'),16);assert.equal(run('M.flags.boss'),false);assert(run('M.talk&&M.talk.after==="sparStart"'));
run('mansionTalkNext();mansionTalkNext()');assert.equal(run('M.sparState'),'active');assert.equal(run('M.enemies[0].hp'),40);
run('M.enemies[0].t=39;M.hurt=999');ticks(1);assert(run('M.enemyShots.some(s=>s.y===246)'));
run('M.enemyShots=[];M.enemies[0].t=129');ticks(1);assert(run('M.enemyShots.some(s=>s.y===232)'));
run('M.enemyShots=[];M.enemies[0].t=219;M.enemies[0].slashDir=-1;M.x=460;M.y=256;M.hurt=0');ticks(1);assert.equal(run('M.hp'),13);
run('M.enemyShots=[];M.enemies[0].t=219;M.x=460;M.y=210;M.vy=0;M.hurt=0');ticks(1);assert.equal(run('M.hp'),13);
// Leap changes sides, and second-half rain is telegraphed at a captured position.
run('M.enemies[0].t=249;M.shots=[];M.enemyShots=[]');ticks(1);const leapFrom=run('M.enemies[0].x');ticks(22);assert(run('M.enemies[0].y<200'));ticks(23);assert(Math.abs(run('M.enemies[0].x')-leapFrom)>100);assert.equal(run('M.enemies[0].y'),256);
run('M.enemies[0].hp=20;M.enemies[0].t=299;M.x=400;M.y=256');ticks(1);const rainX=run('M.enemies[0].rainX');assert.equal(rainX,400);run('M.x=450');ticks(30);assert.equal(run('M.enemyShots.filter(s=>s.kind==="star").length'),5);assert(run('M.enemyShots.every(s=>Number.isFinite(s.x))'));assert.equal(run('M.enemies[0].rainX'),null);
run('M.enemyShots=[];M.enemies[0].hp=21;M.enemies[0].t=299');ticks(1);run('M.enemies[0].hp=20;M.enemies[0].t=329');ticks(1);assert.equal(run('M.enemyShots.length'),0);
run('M.enemies[0].x=500;M.enemies[0].y=256;M.enemies[0].t=0');
// Victory grants guide role and survives resume, without killing the friend.
run('M.enemies[0].hp=21;M.shots=[{x:495.2,y:239,vx:4.8}];M.hurt=999');ticks(1);assert(run('M.flags.boss&&M.sparState==="done"&&M.talk.speaker==="アスターテ"'));assert.equal(run('M.hp'),16);assert.equal(run('M.enemyShots.length'),0);assert(run('mansionRead().flags.boss'));
run('mansionTalkClose();M.map=false;mansionEnter("garden",500,256);mansionUse()');assert(run('M.talk.speaker==="アスターテ"'));assert.equal(run('M.enemies.length'),0);
run('mansionTalkClose();M.map=false;mansionEnter("bedroom",612,208);mansionUse()');assert(run('M.talk.lines[0].includes("行き先")'));
run('mansionTalkClose();M.map=false;M.flags.seal=false;mansionEnter("cellar",267,208);mansionUse()');assert(run('M.talk.lines[0].includes("紋章がない")'));
run('mansionTalkClose();M.map=false;mansionEnter("bedroom",390,208);mansionUse()');assert.equal(run('M.talk.speaker'),'ダイスロール');
for(const key of ['astarte-sequel.png','astarte-sequel-face.png']){const img=images.find(i=>i.src==='assets/'+key);assert(img);img.onload();}
run('mansionTalkClose();M.map=false;mansionEnter("garden",350,256);renderMansion();mansionAstarteGuide();mansionUI()');
console.log('PASS Astarte: introduction, pause/cancel, safe retry, telegraphed attacks, spar victory and later guides.');
// Extra frames are loaded as their own sheet; all action poses support both directions.
const actionImage=images.find(i=>i.src==='assets/astarte-actions.png');assert(actionImage);actionImage.onload();assert.equal(run('ASTARTE_ACTION_CROPS.length'),12);
for(const face of [-1,1])for(let pose=4;pose<16;pose++)run(`drawMansionAstarte(120,208,0,${face},${pose})`);
// A brief guard prevents point-blank rapid-fire stacking; the recovery window remains hittable.
clearKeys();run('mansionStart(false);mansionEnter("garden",350,256);mansionSparStart();M.enemies[0].guard=10;M.hurt=999;M.shots=[{x:495.2,y:239,vx:4.8}]');ticks(1);assert.equal(run('M.enemies[0].hp'),40);assert.equal(run('M.shots.length'),0);
run('M.enemies[0].guard=0;M.shots=[{x:M.enemies[0].x-4.8,y:239,vx:4.8}]');ticks(1);assert.equal(run('M.enemies[0].hp'),39);
// Locked-direction dash stays predictable even when the hero passes behind her.
run('M.enemies[0].t=174;M.enemies[0].x=500;M.x=350;M.enemyShots=[]');ticks(1);assert.equal(run('M.enemies[0].pose'),8);assert.equal(run('M.enemies[0].slashDir'),-1);
run('M.x=560;M.enemies[0].t=195');const dashX=run('M.enemies[0].x');ticks(20);assert(run('M.enemies[0].x')<dashX-70);assert.equal(run('M.enemies[0].dir'),-1);
run('M.enemies[0].hp=20;M.enemies[0].t=234');ticks(1);assert(run('M.enemies[0].striking'));assert.equal(run('M.enemies[0].pose'),10);
// No movement or dodge input: full battle still requires dodging.
clearKeys();run('mansionStart(false);M.flags.boss=true;mansionEnter("bedroom",612,208);mansionUse();mansionFullBattle();M.hurt=0;keys.shoot=true');let idleFrames=0;
for(;idleFrames<2400&&!run('M.talk||M.sparState==="done"');idleFrames++){run('M.face=M.enemies[0].x<M.x?-1:1');ticks(1);}
assert(run('M.talk&&M.talk.after==="sparStart"&&!M.flags.astarteFull'),'full battle standing fire should require dodging');
console.log('PASS action boss: 12 new poses, shot guard, locked dash, second slash, stationary-fire retry in '+idleFrames+' frames.');
for(const style of [0]){
clearKeys();run('mansionStart(false);M.flags.boss=true;mansionEnter("bedroom",612,208);mansionUse();mansionFullBattle();M.hurt=0;keys.shoot=true');let frameCount=0;
for(;frameCount<5000&&!run('M.talk||M.sparState==="done"');frameCount++){
run(`{const botE=M.enemies[0],botP=botE.t%360;keys.left=keys.right=keys.jump=false;M.face=botE.x<M.x?-1:1;
const approaching=M.enemyShots.filter(s=>(s.x-M.x)*s.vx<0&&Math.abs(s.x-M.x)<${style===0?50:65});
if(M.ground&&!M.slideT&&approaching.some(s=>s.kind==='crescent'&&s.y>240)){keys.jump=true;inp.jumpPressed=true;}
if(M.ground&&!M.slideT&&approaching.some(s=>s.kind==='crescent'&&s.y<240)){mansionInput.slide=true;}
if(M.ground&&!M.slideT&&botP>=${style===2?190:195}&&botP<=215&&Math.abs(M.x-botE.x)<155){keys.jump=true;inp.jumpPressed=true;}
const rain=M.enemyShots.find(s=>s.kind==='star'&&Math.abs(s.x-M.x)<40&&s.y<M.y&&s.y>M.y-110);
if((botE.rainX!=null&&Math.abs(M.x-botE.rainX)<48)||rain){if(M.x<420)keys.right=true;else keys.left=true;}
}`);ticks(1);
}
assert(run('M.flags.astarteFull'),'normal dodge inputs must clear full battle without health overrides');console.log('PASS fair boss: jump/slide/rain movement with normal health clears in '+frameCount+' frames.');
}
// Tutorial stops exactly at half, without granting the full-battle reward.
clearKeys();run('mansionStart(false);mansionEnter("garden",350,256);mansionSparStart();M.hurt=999');
for(let hit=0;hit<19;hit++){run('M.enemies[0].guard=0;M.enemies[0].x=500;M.enemies[0].t=0;M.shots=[{x:495.2,y:239,vx:4.8}]');ticks(1);}
assert.equal(run('M.enemies[0].hp'),21);assert.equal(run('M.flags.boss'),false);
run('M.enemies[0].guard=0;M.enemies[0].x=500;M.shots=[{x:495.2,y:239,vx:4.8}]');ticks(1);
assert(run('M.flags.boss&&!M.flags.astarteReward&&!M.flags.astarteFull'));assert.equal(run('mansionMaxHP()'),16);assert.equal(run('M.enemies.length'),0);assert.equal(run('M.enemyShots.length'),0);
// Hub dialogue offers an explicit choice: reading or cancelling never starts a battle.
run('mansionTalkClose();M.map=false;mansionEnter("bedroom",612,208);mansionUse()');assert.equal(elements.get('mTalkBattle').style.display,'block');assert.equal(run('M.room'),'bedroom');run('mansionTalkClose();M.map=false');assert.equal(run('M.room'),'bedroom');
run('mansionUse()');const trialCheckpoint=run('JSON.stringify(M.checkpoint)');run('document.getElementById("mTalkBattle").handlers.click({preventDefault(){},stopPropagation(){}})');assert(run('M.sparMode==="full"&&M.sparState==="active"'));assert.equal(run('M.enemies[0].hp'),40);assert.equal(run('mansionNearbyNPC()'),undefined);
run('M.enemies[0].hp=21;M.enemies[0].x=500;M.enemies[0].t=0;M.enemies[0].guard=0;M.hurt=999;M.shots=[{x:495.2,y:239,vx:4.8}]');ticks(1);assert.equal(run('M.enemies[0].hp'),20);assert.equal(run('M.sparState'),'active');assert(!run('M.flags.astarteReward'));
// Abandonment and a stopped losing fight never grant a reward or alter exploration progress.
run('M.map=true;mansionUI()');assert.equal(elements.get('mBattleLeave').style.display,'block');run('document.getElementById("mBattleLeave").handlers.click({preventDefault(){},stopPropagation(){}})');assert.equal(run('M.room'),'bedroom');assert.equal(run('JSON.stringify(M.checkpoint)'),trialCheckpoint);assert(!run('M.flags.astarteReward'));
run('mansionUse();mansionFullBattle();M.hp=1;M.hurt=0;mansionDamage(2)');assert(run('M.talk.after==="sparStart"'));const retryT=run('M.enemies[0].t');ticks(50);assert.equal(run('M.enemies[0].t'),retryT);run('mansionTalkClose();M.map=false');assert.equal(run('M.room'),'bedroom');assert(!run('M.flags.astarteReward'));
// Full victory grants the permanent item once, then conversation returns to the hub.
run('mansionUse();mansionFullBattle();M.enemies[0].hp=1;M.enemies[0].guard=0;M.enemies[0].x=500;M.enemies[0].t=0;M.hurt=999;M.shots=[{x:495.2,y:239,vx:4.8}]');ticks(1);
assert(run('M.flags.astarteFull&&M.flags.astarteReward&&M.talk.after==="fullReturn"'));assert.equal(run('mansionMaxHP()'),18);assert.equal(run('M.hp'),18);assert(run('mansionStatusHTML().includes("星詠みの護符")&&mansionStatusHTML().includes("HP 18 / 18")'));assert(run('mansionRead().flags.astarteReward'));
run('mansionTalkClose()');assert.equal(run('M.room'),'bedroom');assert.equal(run('JSON.stringify(M.checkpoint)'),trialCheckpoint);
run('mansionUse();mansionFullBattle();M.enemies[0].hp=1;M.enemies[0].guard=0;M.enemies[0].x=500;M.enemies[0].t=0;M.hurt=999;M.shots=[{x:495.2,y:239,vx:4.8}]');ticks(1);assert.equal(run('mansionMaxHP()'),18);assert(run('M.talk.lines[1].includes("最初の一度")'));
run('for(let i=0;i<2;i++)mansionTalkNext()');assert.equal(run('M.room'),'bedroom');assert.equal(run('M.map'),false);
run('mansionStart(true)');assert.equal(run('mansionMaxHP()'),18);assert.equal(run('M.hp'),18);
run('M.map=false;mansionEnter("bedroom",135,208);M.hp=3;mansionUse()');assert.equal(run('M.hp'),18);
run('M.hp=17;M.pickups=[{kind:"water",x:M.x,y:M.y-12,vy:0,age:11}]');ticks(1);assert.equal(run('M.hp'),18);
run('M.hp=1;M.hurt=0;mansionDamage(2)');ticks(65);assert.equal(run('M.hp'),18);
// Old records unlock repeat fights but never receive the new reward retroactively.
run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{boss:true,seal:true,complete:true},visited:["bedroom"],checkpoint:{room:"bedroom",x:110,y:208}}));mansionStart(true)');assert.equal(run('mansionMaxHP()'),16);assert(!run('M.flags.astarteReward'));run('mansionEnter("bedroom",612,208);mansionUse()');assert(run('M.talk.offerFull'));assert.equal(run('mansionFullBattle()'),true);run('mansionFullReturn()');assert(run('M.flags.seal&&M.flags.complete'));
console.log('PASS trial/reward: half-stop, full-zero goal, hub choice, abandon/retry, one-time permanent item, resume/heal/respawn, old-record migration.');

// Reserve-only buddy: switch preserves all movement/health, locks during actions and menus.
clearKeys();run('mansionStart(false);M.transition=0');assert.equal(run('mansionSwap()'),false);
run('M.flags.boss=true;M.hp=7;M.x=130;M.y=208;M.vx=1.2;M.vy=-1;M.hurt=50');
assert.equal(run('mansionSwap()'),true);assert.equal(run('M.actor'),'astarte');assert.equal(run('M.hp'),7);assert.equal(run('M.x'),130);assert.equal(run('M.vx'),1.2);assert.equal(run('M.hurt'),50);assert.equal(run('mansionSwap()'),false);
run('M.swapCool=0;M.map=true');assert.equal(run('mansionSwap()'),false);run('M.map=false;M.slideT=1');assert.equal(run('mansionSwap()'),false);run('M.slideT=0;M.poseT=1');assert.equal(run('mansionSwap()'),false);
for(const face of [-1,1]){
clearKeys();run(`M.poseT=0;mansionEnter("bedroom",130,208);M.actor='astarte';M.transition=0;M.face=${face};M.hurt=0;M.enemies=[{kind:'walk',x:130+${face}*30,y:208,min:0,max:600,dir:1,hp:3,t:0,flash:0},{kind:'walk',x:130-(${face})*30,y:208,min:0,max:600,dir:1,hp:3,t:0,flash:0}];M.props=[];keys.shoot=true;`);ticks(1);clearKeys();ticks(8);
assert.equal(run('M.enemies[0].hp'),1);assert.equal(run('M.enemies[1].hp'),3);assert.equal(run('M.shots.length'),0);ticks(4);assert.equal(run('M.enemies[0].hp'),1);
run('M.map=true');const pose=run('M.poseT');ticks(5);assert.equal(run('M.poseT'),pose);run('M.map=false');
for(const image of images.filter(i=>i.src==='assets/astarte-sequel-face.png'))image.onload();run('renderMansion()');
}
clearKeys();run('mansionEnter("bedroom",130,208);M.actor="astarte";M.face=1;M.enemies=[];M.props=[{kind:"vase",x:160,y:208,drop:"water",hp:2,brokenT:0}];mansionScythe();mansionScytheHit();mansionScytheHit()');assert.equal(run('M.props[0].hp'),1);run('mansionScythe();mansionScytheHit()');assert.equal(run('M.props[0].hp'),0);assert.equal(run('M.pickups.length'),1);
run('M.poseT=0;M.swapCool=0;M.transition=0;M.hp=9;M.hurt=0');assert.equal(run('mansionSwap()'),true);assert.equal(run('M.hp'),9);assert.equal(run('M.actor'),'umine');run('M.cool=0;keys.shoot=true');ticks(1);assert(run('M.shots.length>0'));clearKeys();
run('M.actor="astarte";mansionEnter("gallery",42,208)');assert.equal(run('M.actor'),'astarte');run('mansionEnter("garden",350,256);mansionSparStart()');assert.equal(run('M.actor'),'umine');assert.equal(run('mansionSwap()'),false);
run('mansionStart(true)');assert.equal(run('M.actor'),'umine');
console.log('PASS buddy: unlock, shared HP/momentum, cooldown/action/menu locks, two-direction single-hit scythe, props, rendering, water-shot return, rooms and spar safety.');

// Two-stage combo buffers taps and hold; each stage hits once with its own range and damage.
for(const face of [-1,1]){
clearKeys();run(`mansionStart(false);M.flags.boss=true;mansionEnter('bedroom',200,208);M.actor='astarte';M.transition=0;M.hurt=0;M.face=${face};M.props=[];M.enemies=[{kind:'fly',x:200+(${face})*32,y:208,baseY:208,min:0,max:600,dir:1,hp:20,t:0,flash:0}];keys.shoot=true;`);ticks(1);clearKeys();ticks(8);assert.equal(run('M.enemies[0].hp'),18);assert.equal(run('M.scytheStage'),1);
run('inp.shootPressed=true');ticks(1);ticks(8);assert.equal(run('M.scytheStage'),2);assert.equal(run('M.poseT'),22);assert.equal(run('M.enemies[0].hp'),18);ticks(8);assert.equal(run('M.enemies[0].hp'),16);ticks(6);assert.equal(run('M.enemies[0].hp'),16);run('renderMansion()');ticks(20);assert.equal(run('M.scytheStage'),2);assert.equal(run('M.poseT'),0);
}
clearKeys();run("mansionEnter('bedroom',200,208);M.actor='astarte';M.face=1;M.enemies=[];M.props=[];keys.shoot=true");ticks(26);assert.equal(run('M.scytheStage'),2);clearKeys();ticks(40);assert.equal(run('M.poseT'),0);
run("mansionScythe();M.poseT=14;M.scytheQueued=true;M.hurt=0;mansionDamage(1)");assert.equal(run('M.poseT'),0);ticks(25);assert.equal(run('M.scytheStage'),1);
run("mansionEnter('bedroom',200,208);M.actor='astarte';M.face=1;M.enemies=[{kind:'fly',x:259,y:208,hp:10,flash:0}];M.props=[];mansionScythe(1);mansionScytheHit()");assert.equal(run('M.enemies[0].hp'),10);run('mansionScythe(2);mansionScytheHit();mansionScytheHit()');assert.equal(run('M.enemies[0].hp'),8);
assert.equal(run('ASTARTE_PLAYER_SIZE'),80);run('M.map=true');const remaining=run('M.poseT');ticks(10);assert.equal(run('M.poseT'),remaining);
console.log('PASS combo: buffered tap, hold, two-stage only, single damage per stage, reach, interruption, pause and mirrored rendering.');

// Visual effects are finite, freeze in the menu, and rendering is read-only.
clearKeys();run('mansionStart(false);M.actor="astarte";M.scytheFace=-1;M.fx=[];mansionScytheImpact(170,190,true);M.map=true');ticks(10);assert.equal(run('M.fx[0].life'),12);const beforeFx=run('JSON.stringify(M.fx)');run('for(let i=0;i<20;i++)renderMansion()');assert.equal(run('JSON.stringify(M.fx)'),beforeFx);run('M.map=false');ticks(6);assert.equal(run('M.fx[0].x'),170);assert.equal(run('M.fx[0].y'),190);ticks(6);assert.equal(run('M.fx.length'),0);
for(const face of [-1,1])for(const stage of [1,2])for(const remaining of [22,18,14,10,6,3])run(`M.actor='astarte';M.scytheStage=${stage};M.scytheFace=${face};M.poseT=${remaining};renderMansion()`);
console.log('PASS scythe effects: finite lifetime, stable impact position, pause, read-only rendering and every swing stage in both directions.');

// Exclusive movement and progression-gated actions keep the two heroes distinct.
clearKeys();run('mansionStart(false);M.transition=0;M.flags.seal=false');assert.equal(run('mansionAbility()'),false);assert(!run('M.waterPlatform'));run('M.flags.seal=true;M.x=130;M.y=208');assert.equal(run('mansionAbility()'),true);assert.equal(run('M.waterPlatform.life'),240);assert.equal(run('M.abilityCool'),300);const platformBox=run('JSON.stringify(M.waterPlatform.box)');assert(run('mansionSolids().some(b=>b===M.waterPlatform.box)'));assert.equal(run('mansionAbility()'),false);
run('M.map=true');ticks(10);assert.equal(run('M.waterPlatform.life'),240);assert.equal(run('M.abilityCool'),300);run('M.map=false;M.poseT=0;M.x=M.waterPlatform.box[0]+20;M.y=M.waterPlatform.box[1]-8;M.vy=1;M.enemies=[]');ticks(10);assert(run('M.ground&&M.y===M.waterPlatform.box[1]'),'water platform must support landing');run('renderMansion()');ticks(230);assert(!run('M.waterPlatform'));run('M.abilityCool=0;M.poseT=0;mansionEnter("bedroom",14,208);M.face=-1;M.transition=0');assert.equal(run('mansionAbility()'),false);assert.equal(run('M.abilityCool'),0);
clearKeys();run('mansionEnter("hall",153,310);M.actor="astarte";M.enemies=[];M.vy=4;keys.right=true');ticks(1);assert(run('M.vy>MC.wallFall'));run('keys.jump=true;inp.jumpPressed=true');ticks(1);assert(run('M.vy>0'),'Astarte cannot magic wall-kick');
clearKeys();run('mansionEnter("bedroom",130,208);M.actor="astarte";M.enemies=[];M.ground=true;mansionInput.slide=true');ticks(1);assert.equal(run('M.slideT'),0);assert.equal(run('M.h'),26);
run('M.flags.boss=true;M.transition=0;M.abilityCool=0;M.poseT=0;M.hurt=0;M.face=1;M.enemies=[{kind:"walk",x:174,y:208,min:0,max:600,dir:1,hp:6,t:0,flash:0}];M.props=[]');assert.equal(run('mansionAbility()'),true);assert.equal(run('M.shots[0].kind'),'star');assert.equal(run('M.abilityCool'),75);assert.equal(run('mansionAbility()'),false);ticks(12);assert.equal(run('M.enemies[0].hp'),4);run('renderMansion()');const abilityTimer=run('M.abilityCool');run('M.map=true');ticks(15);assert.equal(run('M.abilityCool'),abilityTimer);run('M.map=false;M.castT=0;M.swapCool=0;M.poseT=0');assert.equal(run('mansionSwap()'),true);assert.equal(run('M.abilityCool'),abilityTimer);
run('M.abilityCool=0;M.poseT=0;mansionEnter("bedroom",130,208);M.transition=0;M.flags.seal=true;mansionAbility();mansionEnter("gallery",40,208)');assert(!run('M.waterPlatform'));assert.equal(run('M.abilityCool'),300);run('mansionStart(true)');assert(run('M.flags.seal'));assert.equal(run('M.abilityCool'),0);
console.log('PASS abilities: progression gate, platform placement/landing/expiry/pause/room reset, exclusive wall/slide movement, star damage/cooldown, swap and old saves.');

// Directional guard chips HP; neither a rear hit nor falling stars are blocked.
for(const face of [-1,1]){
clearKeys();run(`mansionStart(false);M.flags.boss=true;M.actor='astarte';M.ground=true;M.face=${face};M.hurt=0;M.hp=10;mansionInput.guardPointer=7;`);assert.equal(run('mansionGuarding()'),true);run(`mansionDamage(2,${-face})`);assert.equal(run('M.hp'),9);assert.equal(run('M.vy'),0);assert.equal(run('Math.abs(M.vx)'),.8);assert.equal(run('M.hurt'),36);assert.equal(run('M.guardFlash'),10);run('renderMansion()');run('M.hurt=0;M.ground=true');run(`mansionDamage(2,${face})`);assert.equal(run('M.hp'),7);assert.equal(run('M.vy'),-3);run('M.hurt=0;M.ground=true;mansionDamage(2,0)');assert.equal(run('M.hp'),5);
}
clearKeys();run('mansionStart(false);M.flags.boss=true;mansionEnter("bedroom",130,208);M.actor="astarte";M.transition=0;M.ground=true;M.enemies=[];M.props=[];mansionInput.guardPointer=7;keys.shoot=true');ticks(4);assert.equal(run('M.poseT'),0);assert.equal(run('M.shots.length'),0);assert.equal(run('mansionAbility()'),false);clearKeys();run('M.ground=false');assert.equal(run('mansionGuarding()'),false);run('M.ground=true;M.poseT=10');assert.equal(run('mansionGuarding()'),false);run('M.poseT=0;M.castT=5');assert.equal(run('mansionGuarding()'),false);run('M.castT=0;mansionMenuToggle()');assert.equal(run('mansionInput.guardPointer'),null);assert.equal(run('mansionGuarding()'),false);
run('M.map=false;M.actor="astarte";M.ground=true;mansionInput.guardPointer=7');elements.get('mSlide').handlers.pointerup({pointerId:8});assert.equal(run('mansionGuarding()'),true);elements.get('mSlide').handlers.pointercancel({pointerId:7});assert.equal(run('mansionGuarding()'),false);
run('mansionGuardKeys.add("ShiftLeft");mansionGuardKeys.add("ShiftRight")');for(const fn of listeners.keyup)fn({code:'ShiftLeft'});assert.equal(run('mansionGuarding()'),true);for(const fn of listeners.blur)fn({});assert.equal(run('mansionGuarding()'),false);
run('M.ground=true;mansionInput.guardPointer=7;M.swapCool=0;M.transition=0');assert.equal(run('mansionSwap()'),true);assert.equal(run('mansionInput.guardPointer'),null);assert.equal(run('M.actor'),'umine');assert.equal(run('mansionGuarding()'),false);run('mansionUI()');assert.equal(elements.get('mSlide').textContent,'SLIDE');run('M.actor="astarte";mansionUI()');assert.equal(elements.get('mSlide').textContent,'GUARD');run('mansionInput.guardPointer=7;mansionEnter("gallery",40,208)');assert.equal(run('mansionInput.guardPointer'),null);
console.log('PASS guard: front chip/knockback, rear/vertical vulnerability, ground/action restrictions, blocked offense, cancel/menu/swap/room/blur release and button labels.');

// MENU visibility must be scoped to the open menu, including new buddy controls.
assert(!html.includes('#mMap{visibility:hidden'));
assert(html.includes('body.mansion-menu-open #mMap,body.mansion-menu-open #mSwap,body.mansion-menu-open #mAbility{visibility:hidden;pointer-events:none}'));
console.log('PASS menu CSS: hide only while open, keep MENU available in gameplay.');
