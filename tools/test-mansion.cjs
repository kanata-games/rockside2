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
run('M.x=24;mansionUse()');assert.equal(run('M.room'),'bedroom');assert.equal(run('M.x'),run('MR.hubCellar.doors[0].at[0]'));
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
clearKeys();run('mansionEnter("archive",195,208);M.enemies=[];M.h=MC.slideH;M.slideT=2;M.face=1;');ticks(3);assert.equal(run('M.h'),run('MC.slideH'));assert(run('M.slideT>0'));
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
run('while(M.talk)mansionTalkNext()');assert(run('!M.talk&&!M.map'));assert.equal(run('M.menuTab'),'status');
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
run('M.map=false;M.flags.seal=true;mansionEnter("cellar",440,208);M.enemies=[]');ticks(1);assert(run('M.portals.includes("cellar")'));run('mansionUse()');assert.equal(run('mansionWarpTo("bedroom")'),true);assert.equal(run('M.hp'),7);assert.equal(run('JSON.stringify(M.checkpoint)'),cpBefore);
run('M.transition=0;mansionUse()');assert.equal(run('mansionWarpTo("cellar")'),true);assert.equal(run('M.x'),run('MANSION_PORTALS.cellar.x'));assert(run('mansionFits(M.x,M.y)'));
run('M.map=false;M.flags.seal=false;mansionEnter("bedroom",231,208);mansionUse()');assert.equal(run('mansionWarpTo("cellar")'),false);assert.equal(run('M.room'),'bedroom');
run('M.x=300;M.map=true;M.menuTab="area"');assert.equal(run('mansionWarpTo("cellar")'),false);assert(run('mansionWarpHTML().includes("disabled")'));
assert.equal(Object.keys(run('MANSION_PORTALS')).length,5);
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
clearKeys();run(`M.poseT=0;mansionEnter("bedroom",130,208);M.actor='astarte';M.transition=0;M.face=${face};M.hurt=0;M.enemies=[{kind:'walk',x:130+${face}*30,y:208,min:0,max:600,dir:1,hp:3,t:0,flash:0},{kind:'walk',x:130-(${face})*30,y:208,min:0,max:600,dir:1,hp:3,t:0,flash:0}];M.props=[];keys.shoot=true;`);ticks(1);clearKeys();ticks(20);
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
clearKeys();run(`mansionStart(false);M.flags.boss=true;mansionEnter('bedroom',200,208);M.actor='astarte';M.transition=0;M.hurt=0;M.face=${face};M.props=[];M.enemies=[{kind:'fly',x:200+(${face})*32,y:208,baseY:208,min:0,max:600,dir:${face},hp:20,t:0,flash:0}];keys.shoot=true;`);ticks(1);clearKeys();ticks(20);assert.equal(run('M.enemies[0].hp'),18);assert.equal(run('M.scytheStage'),1);
run('inp.shootPressed=true');ticks(1);ticks(15);assert.equal(run('M.scytheStage'),2);assert.equal(run('M.poseT'),40);assert.equal(run('M.enemies[0].hp'),18);ticks(11);assert.equal(run('M.enemies[0].hp'),18,'the return swing must not hit before its main cutting pose');ticks(1);assert.equal(run('M.enemies[0].hp'),16);ticks(6);assert.equal(run('M.enemies[0].hp'),16);run('renderMansion()');ticks(22);assert.equal(run('M.scytheStage'),2);assert.equal(run('M.poseT'),0);
}
clearKeys();run("mansionEnter('bedroom',200,208);M.actor='astarte';M.face=1;M.enemies=[];M.props=[];keys.shoot=true");ticks(37);assert.equal(run('M.scytheStage'),2);clearKeys();ticks(40);assert.equal(run('M.poseT'),0);
run("mansionScythe();M.poseT=14;M.scytheQueued=true;M.hurt=0;mansionDamage(1)");assert.equal(run('M.poseT'),0);ticks(25);assert.equal(run('M.scytheStage'),1);
run("mansionEnter('bedroom',200,208);M.actor='astarte';M.face=1;M.enemies=[{kind:'fly',x:259,y:208,hp:10,flash:0}];M.props=[];mansionScythe(1);mansionScytheHit()");assert.equal(run('M.enemies[0].hp'),10);run('mansionScythe(2);mansionScytheHit();mansionScytheHit()');assert.equal(run('M.enemies[0].hp'),8);
assert.equal(run('ASTARTE_PLAYER_SIZE'),80);run('M.map=true');const remaining=run('M.poseT');ticks(10);assert.equal(run('M.poseT'),remaining);
console.log('PASS combo: buffered tap, hold, two-stage only, single damage per stage, reach, interruption, pause and mirrored rendering.');

// Visual effects are finite, freeze in the menu, and rendering is read-only.
clearKeys();run('mansionStart(false);M.actor="astarte";M.scytheFace=-1;M.fx=[];mansionScytheImpact(170,190,true);M.map=true');ticks(10);assert.equal(run('M.fx[0].life'),12);const beforeFx=run('JSON.stringify(M.fx)');run('for(let i=0;i<20;i++)renderMansion()');assert.equal(run('JSON.stringify(M.fx)'),beforeFx);run('M.map=false');ticks(6);assert.equal(run('M.fx[0].x'),170);assert.equal(run('M.fx[0].y'),190);ticks(6);assert.equal(run('M.fx.length'),0);
for(const face of [-1,1])for(const stage of [1,2])for(const remaining of [34,28,22,16,8,3])run(`M.actor='astarte';M.scytheStage=${stage};M.scytheFace=${face};M.poseT=${remaining};renderMansion()`);
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
assert(html.includes('body.mansion-menu-open #mMap,body.mansion-menu-open #mSwap,body.mansion-menu-open #mAbility,body.mansion-menu-open #mVial{visibility:hidden;pointer-events:none}'));
console.log('PASS menu CSS: hide only while open, keep MENU available in gameplay.');

// Dice practice keeps the chosen hero, progression and recorded checkpoint intact.
clearKeys();run('mansionStart(false);M.flags.boss=true;M.actor="astarte";M.x=390;mansionRoruTalk()');
const diceFlags=run('JSON.stringify(M.flags)'),diceCheckpoint=run('JSON.stringify(M.checkpoint)');
assert.equal(run('mansionDiceChallenge()'),true);assert.equal(run('M.room'),'diceArena');assert.equal(run('M.actor'),'astarte');
const diceTime=run('M.enemies[0].t');ticks(30);assert.equal(run('M.enemies[0].t'),diceTime);assert.equal(run('mansionDiceChallenge()'),false);
run('while(M.talk)mansionTalkNext();M.transition=0;M.hurt=0');assert.equal(run('M.diceState'),'active');
run('M.map=true');ticks(20);assert.equal(run('M.enemies[0].t'),0);run('M.map=false');
// Telegraphs precede volleys; jumping relocates the boss to its marked target.
run('M.enemies[0].t=70;mansionDiceAI(M.enemies[0])');assert.equal(run('M.enemies[0].anim'),'windup');assert.equal(run('M.enemyShots.length'),0);
run('M.enemies[0].t=112;mansionDiceAI(M.enemies[0]);M.enemies[0].t=225;mansionDiceAI(M.enemies[0])');assert(run('M.enemyShots.some(b=>b.kind==="dice")&&M.enemyShots.some(b=>b.kind==="card")'));
run('M.enemies[0].t=280;mansionDiceAI(M.enemies[0]);M.enemies[0].t=320;mansionDiceAI(M.enemies[0])');assert(run('M.enemies[0].y<200'));run('renderMansion()');
// Each scythe swing deals two; water one; the star action two.
run('M.enemyShots=[];M.enemies[0].x=200;M.enemies[0].y=256;M.x=160;M.y=256;M.face=1;mansionScythe(1);mansionScytheHit()');assert.equal(run('M.enemies[0].hp'),38);
run('mansionScythe(2);mansionScytheHit()');assert.equal(run('M.enemies[0].hp'),36);
run('M.poseT=0;M.shots=[{x:195.2,y:239,vx:4.8}];M.enemies[0].t=140');ticks(1);assert.equal(run('M.enemies[0].hp'),35);
run('M.shots=[{kind:"star",damage:2,x:196.6,y:239,vx:3.4}]');ticks(1);assert.equal(run('M.enemies[0].hp'),33);
// Frontal guard reduces a card from two to one, and losing never kills the hero.
run('M.enemyShots=[{kind:"card",x:163,y:233,vx:-3,vy:0}];M.ground=true;M.hurt=0;mansionGuardKeys.add("ShiftLeft")');const diceHP=run('M.hp');ticks(1);assert.equal(run('M.hp'),diceHP-1);
run('mansionGuardRelease();M.hurt=0;M.hp=1;mansionDamage(2,-1)');assert(run('M.map&&M.diceState==="ready"&&M.dead===0'));assert.equal(run('M.actor'),'astarte');
run('while(M.talk)mansionTalkNext();M.enemies[0].hp=2;M.enemies[0].x=200;M.x=160;M.face=1;mansionScythe();mansionScytheHit()');assert(run('M.diceState==="done"&&M.map&&M.enemyShots.length===0'));assert.equal(run('JSON.stringify(M.flags)'),diceFlags);
run('while(M.talk)mansionTalkNext()');assert.equal(run('M.room'),'bedroom');assert.equal(run('M.actor'),'astarte');assert.equal(run('JSON.stringify(M.checkpoint)'),diceCheckpoint);
run('M.x=390;mansionRoruTalk();mansionDiceChallenge();mansionTalkClose();M.map=false');assert.equal(run('M.room'),'bedroom');
run('M.x=390;mansionRoruTalk();mansionDiceChallenge();while(M.talk)mansionTalkNext();M.map=true;document.getElementById("mBattleLeave").handlers.click({preventDefault(){},stopPropagation(){}})');assert.equal(run('M.room'),'bedroom');
run('mansionStart(true)');assert.equal(run('M.room'),'bedroom');assert(!run('M.diceReturn'));
console.log('PASS Dice boss: optional arena, both heroes, telegraphs, attacks, guard, pause, retry, victory, abandon and safe saved checkpoint.');

run('M.x=390;mansionRoruTalk()');assert(run('M.talk.lines.some(l=>l.includes("本番")&&l.includes("館の謎"))'));assert.equal(elements.get('mTalkDice').style.display,'block');
assert(!run('mansionDiceDraw.toString().includes("dicerollDark")'));run('mansionDiceDraw(mansionNewDice())');
console.log('PASS Dice practice: current Roru model, full-battle story notice.');

// All six announced outcomes strengthen predictable volleys; the jackpot rain is marked.
run('M.map=false;M.diceState="active"');
for(let face=1;face<=6;face++){
 run(`M.enemies=[mansionNewDice()];M.enemies[0].roll=${face};M.enemyShots=[];for(const t of [112,136,160,225,243,261]){M.enemies[0].t=t;mansionDiceAI(M.enemies[0]);}`);
 assert.equal(run('M.enemyShots.filter(b=>b.kind==="dice").length'),Math.min(face,3));assert.equal(run('M.enemyShots.filter(b=>b.kind==="card").length'),face>=4?3:1);
 assert.equal(run('M.enemyShots[0].damage'),face>=5?3:2);
 run('M.enemies[0].t=280;mansionDiceAI(M.enemies[0]);renderMansion();M.enemies[0].t=300;mansionDiceAI(M.enemies[0]);renderMansion()');assert.equal(run('M.enemyShots.filter(b=>b.kind==="chip").length'),face===6?5:0);
}
run('M.enemies=[mansionNewDice()];M.enemies[0].t=40;mansionDiceAI(M.enemies[0])');assert.equal(run('M.enemies[0].roll'),0);run('M.map=true');const rollTimer=run('M.enemies[0].t');ticks(20);assert.equal(run('M.enemies[0].t'),rollTimer);
run('M.map=false;M.messageT=0;M.enemies[0].t=76;mansionDiceAI(M.enemies[0])');assert(run('M.enemies[0].roll>=1&&M.enemies[0].roll<=6'));assert.equal(run('M.messageT'),0,'die face conveys the roll without an attack instruction');
run('M.enemies[0].roll=6;M.enemies[0].t=90;renderMansion()');const heldRoll=run('M.enemies[0].roll');run('renderMansion()');assert.equal(run('M.enemies[0].roll'),heldRoll);
console.log('PASS Dice roll: six distinct intensities, rolling/reveal lead time, fixed attack sequence, targeted jackpot rain, pause and read-only face rendering.');

// Guard has a distinct success cue; ordinary hits and invulnerable repeats do not play it.
clearKeys();run('mansionStart(false);M.actor="astarte";M.ground=true;M.face=1;M.hurt=0;M.enemies=[];M.props=[];mansionGuardKeys.add("ShiftLeft");const guardSoundLog=[];const originalPlay=Snd.play;Snd.play=n=>guardSoundLog.push(n);mansionDamage(2,-1);mansionDamage(2,-1)');assert.equal(run('guardSoundLog.filter(n=>n==="guard").length'),1);
run('M.hurt=0;mansionDamage(2,1)');assert.equal(run('guardSoundLog.filter(n=>n==="guard").length'),1);assert.equal(run('guardSoundLog.at(-1)'),'hurt');run('Snd.play=originalPlay;mansionGuardRelease()');
// A successful guard cue is audible through the synthesizer and respects mute.
run('const oldTone=Snd.tone,oldNoise=Snd.noise;const guardSynth=[];Snd.ctx={};Snd.muted=false;Snd.tone=(...a)=>guardSynth.push(a);Snd.noise=(...a)=>guardSynth.push(a);Snd.play("guard")');assert.equal(run('guardSynth.length'),3);run('Snd.muted=true;Snd.play("guard")');assert.equal(run('guardSynth.length'),3);run('Snd.ctx=null;Snd.muted=false;Snd.tone=oldTone;Snd.noise=oldNoise');
// The panel swap target replaces the HUD target; all touch controls stay separated.
for(const[w,h]of [[320,568],[390,844],[750,1274],[844,390]]){
 run(`window.innerWidth=${w};window.innerHeight=${h};doLayout();state="mansion";M.flags.boss=true;mansionLayout()`);const rects=JSON.parse(run('JSON.stringify(mansionControlRects)'));assert(rects.swap[2]>=44&&rects.swap[3]>=44);
 if(h>w)assert(rects.swap[1]>=run('layout.gameY+layout.gameH'));
 for(const id of ['left','right','shoot','jump','slide','ability']){const a=rects.swap,b=rects[id];assert(!(a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1]),'swap overlaps '+id);}
}
console.log('PASS panel swap: portrait/landscape placement; slower combo timing; guard success-only sound and mute.');

// The dedicated guard sprite stays anchored, mirrored and confined to player defense.
const guardArt=images.find(i=>i.src==='assets/astarte-guard.png');assert(guardArt);guardArt.width=1254;guardArt.height=1254;guardArt.onload();assert(run('!!mansionAstarteGuardArt'));
clearKeys();run('mansionStart(false);M.flags.boss=true;M.actor="astarte";M.ground=true;M.hurt=0;mansionGuardKeys.add("ShiftLeft")');
for(const face of [-1,1]){run(`M.face=${face};renderMansion();drawMansionAstarte(130,208,0,${face},16,80)`);assert.equal(run('M.y'),208);}
run('M.face=1;mansionDamage(2,-1);mansionGuardRelease();renderMansion()');assert(run('M.guardFlash>0&&M.ground'));run('M.poseT=34;renderMansion()');assert(!run('mansionGuarding()'));run('drawMansionAstarte(200,208,0,-1,8,96)');
console.log('PASS dedicated guard: generated asset load, two directions, stable foot anchor, success flash, action restrictions and boss pose preservation.');

// The two attacks have distinct, ordered poses; the new atlas also works mirrored without moving the player.
const attackArt=images.find(i=>i.src==='assets/astarte-attack-combo.png');assert(attackArt);
attackArt.onload();assert(run('!!mansionAstarteAttackArt'));assert.equal(run('ASTARTE_ATTACK_FRAMES.length'),8);
for(const stage of [1,2]){
 const poses=run(`M.scytheStage=${stage};(()=>{const out=[];for(let t=40;t>0;t--){M.poseT=t;const p=mansionScythePose();if(out.at(-1)!==p)out.push(p);}return out;})()`);
 assert.equal(JSON.stringify(poses),JSON.stringify(stage===1?[17,18,19,20,21,22,23,24]:[25,26,27,28,29,30,31,32]));
}
for(const face of [-1,1])for(let pose=17;pose<=24;pose++)run(`drawMansionAstarte(200,208,0,${face},${pose},80)`);
const attackAtlas=JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../assets/astarte-attack-combo.json'),'utf8'));
assert.equal(JSON.stringify(run('ASTARTE_ATTACK_FRAMES')),JSON.stringify(attackAtlas.frames));
for(const f of attackAtlas.frames){assert(f.rect[0]>=0&&f.rect[1]>=0&&f.rect[0]+f.rect[2]<=attackAtlas.canvas[0]&&f.rect[1]+f.rect[3]<=attackAtlas.canvas[1]);assert(f.anchor[0]>=0&&f.anchor[1]>=0&&f.anchor[0]<f.rect[2]&&f.anchor[1]<f.rect[3]);}
console.log('PASS attack atlas: eight ordered sweep/extension/pull poses, frame metadata, bounds, asset loading and both facing directions.');

// Player body, grip and blade always use the same atlas and common scale.
const playerArt=images.find(i=>i.src==='assets/astarte-player-sweep.png');assert(playerArt);playerArt.onload();
const playerAtlas=JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../assets/astarte-player-sweep.json'),'utf8'));
assert.equal(JSON.stringify(run('ASTARTE_PLAYER_FRAMES')),JSON.stringify(playerAtlas.frames));
for(const f of playerAtlas.frames){assert.equal(f.scale,.175);assert(f.rect[0]>=0&&f.rect[1]>=0&&f.rect[0]+f.rect[2]<=playerAtlas.canvas[0]&&f.rect[1]+f.rect[3]<=playerAtlas.canvas[1]);assert(f.anchor[0]>=0&&f.anchor[1]>=0&&f.anchor[0]<f.rect[2]&&f.anchor[1]<f.rect[3]);}
assert.equal(run('mansionAstartePlayerFrame(16)'),playerAtlas.guardFrame);
for(const [start,seq]of [[17,playerAtlas.firstSwing],[25,playerAtlas.secondSwing]])assert.equal(JSON.stringify(run(`Array.from({length:8},(_,i)=>mansionAstartePlayerFrame(${start}+i))`)),JSON.stringify(seq));
const playerSnapshot=run('JSON.stringify(M)');for(const face of [-1,1])for(const pose of [-1,4,5,6,7,13,14,15,16,...Array.from({length:16},(_,i)=>17+i)])run(`drawMansionAstartePlayer(180,208,0,${face},${pose},80)`);assert.equal(run('JSON.stringify(M)'),playerSnapshot);
run('drawMansionAstarte(200,208,0,1,8,96)');
console.log('PASS player sweep: whole-body atlas, shared scale, 16 cells, eight poses per swing, front guard, both directions, read-only renderer and boss preserved.');

// Enlarged corridor is traversable in both directions with either hero, using only ordinary jumps.
for(const actor of ['umine','astarte'])for(const direction of [1,-1]){
 clearKeys();run(`M.map=false;mansionEnter('gallery',${direction===1?32:1480},208);M.actor='${actor}';M.flags.boss=true;M.enemies=[];M.hurt=0;keys.${direction===1?'right':'left'}=true;keys.jump=true;`);
 for(let i=0;i<1800;i++){run('if(M.ground)inp.jumpPressed=true');ticks(1);if(run(direction===1?'M.x>1475':'M.x<40'))break;}
 assert(run(direction===1?'M.x>1475':'M.x<40'),actor+' corridor route '+direction+' stuck at '+run('JSON.stringify([M.x,M.y])'));
}
clearKeys();run('mansionEnter("gallery",1509,368);mansionUse()');assert.equal(run('M.room'),'hall');
run('M.x=24;M.y=368;mansionUse()');assert.equal(run('M.room'),'gallery');assert.equal(run('M.x'),run('MR.hall.doors[0].at[0]'));
run('M.x=1500;M.y=368;M.galleryWide=true;mansionCamera(true)');assert.equal(run('mansionView().w'),320);assert.equal(run('mansionView().h'),300);assert.equal(run('M.camX'),1216);assert.equal(run('M.camY'),170.5);
const saveBefore=storage.get('rockside2_mansion_v1');run('M.map=true;mansionGalleryViewToggle()');assert.equal(run('mansionView().zoom'),1);assert.equal(storage.get('rockside2_mansion_v1'),saveBefore);assert(run('mansionStatusHTML().includes("mGalleryView")'));
run('mansionGalleryViewToggle()');assert.equal(run('mansionView().zoom'),.8);run('M.map=false;mansionEnter("hall",76,368)');assert.equal(run('mansionView().zoom'),1);
// Existing gallery checkpoint survives the room's expansion.
run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{seal:true,boss:true},visited:["gallery"],checkpoint:{room:"gallery",x:450,y:112}}));mansionStart(true)');ticks(3);assert.equal(run('M.room'),'gallery');assert.equal(run('M.y'),112);assert(run('M.flags.boss&&M.flags.seal'));
assert.equal(run('Object.keys(MANSION_PORTALS).length'),5);
console.log('PASS expanded corridor: ordinary jumps for both heroes, bidirectional doors, wide camera bounds, menu comparison, old checkpoint and unchanged warp count.');

// The archive elevator carries both heroes, pauses in menus, can be summoned and safely jumped off.
for(const actor of ['umine','astarte']){
 clearKeys();run(`M.map=false;mansionEnter('archive',752,208);M.actor='${actor}';M.enemies=[];`);ticks(3);
 assert(run('mansionLiftRiding()'));run('mansionUse()');assert.equal(run('M.lift.target'),448);ticks(80);assert(run('M.y>290&&M.y<320'));assert(run('Math.abs(M.y-M.lift.y)<.001'));
 const pausedLift=run('M.lift.y');run('M.map=true');ticks(40);assert.equal(run('M.lift.y'),pausedLift);run('M.map=false');ticks(125);assert.equal(run('M.lift.y'),448);assert.equal(run('M.y'),448);
 run('mansionUse()');ticks(202);assert.equal(run('M.lift.y'),208);assert.equal(run('M.y'),208);
 run('mansionUse();keys.jump=true;inp.jumpPressed=true');ticks(1);assert(run('M.vy<0&&!M.ground'));assert(run('M.y<M.lift.y'));clearKeys();
}
clearKeys();run('mansionEnter("archive",808,448);M.enemies=[];');ticks(3);run('mansionUse()');assert.equal(run('M.lift.target'),448);ticks(202);assert.equal(run('M.lift.y'),448);assert.equal(run('M.y'),448);
run('M.x=752');ticks(3);assert(run('mansionLiftRiding()'));run('mansionUse()');ticks(202);assert.equal(run('M.y'),208);
// No crush while a hero obstructs a descending platform.
run('M.x=752;M.y=448;M.ground=true;M.lift.y=420;M.lift.target=448;');const crushHP=run('M.hp');ticks(20);assert.equal(run('M.hp'),crushHP);assert(run('M.lift.y<=422'));
run('mansionEnter("hall",76,368)');assert.equal(run('M.lift'),null);
// Friendly Seiten has her own name, repeatable affectionate dialogue and no combat/progression mutation.
clearKeys();run('mansionEnter("archive",860,208);M.enemies=[];M.x=880;');ticks(3);const beforeNPC=run('JSON.stringify(M.flags)');run('mansionUse()');assert.equal(run('M.talk.speaker'),'青天');assert(run('M.talk.lines.some(l=>l.includes("隣"))'));assert(run('M.talk.lines.some(l=>l.includes("昇降機"))'));assert.equal(run('JSON.stringify(M.flags)'),beforeNPC);const npcLift=run('M.lift.y');ticks(50);assert.equal(run('M.lift.y'),npcLift);run('mansionTalkClose();M.map=false');
run('M.x=918;M.y=208;mansionUse()');assert(!run('M.message.includes("奥の部屋")'));
run('M.x=918;M.y=448;mansionUse()');assert.equal(run('M.room'),'archiveInner');run('mansionEnter("archive",592,448)');
run('M.x=592;M.y=448;M.hp=3;mansionUse()');assert.equal(run('M.checkpoint.room'),'archive');assert.equal(run('M.checkpoint.y'),448);run('mansionStart(true)');assert.equal(run('M.y'),448);assert(run('mansionFits(M.x,M.y)'));
const savedNPC=run('JSON.stringify(M)');for(const face of [-1,1])run(`drawMansionSeiten(880,208,30,${face})`);assert.equal(run('JSON.stringify(M)'),savedNPC);
console.log('PASS library: both-hero elevator round trip, remote call, menu pause, jump-off, no crush, room reset, friendly Seiten, vertical locked door and lower-floor resume.');

const seitenAtlas=JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../assets/seiten-sequel-idle.json'),'utf8'));assert.equal(JSON.stringify(run('SEITEN_NPC_FRAMES')),JSON.stringify(seitenAtlas.frames));assert.equal(seitenAtlas.frames.length,4);
const seitenImage=images.find(i=>i.src==='assets/seiten-sequel-idle.png');assert(seitenImage);seitenImage.onload();const seitenFace=images.find(i=>i.src==='assets/seiten-sequel-reference.png');assert(seitenFace);seitenFace.onload();
for(const f of seitenAtlas.frames){assert.equal(f.scale,.082);assert.deepEqual(f.rect.slice(2),[627,627]);assert(f.anchor[0]>0&&f.anchor[0]<627&&f.anchor[1]>0&&f.anchor[1]<627);}
const seitenSnapshot=run('JSON.stringify(M)');for(const face of [-1,1])for(const t of [0,45,90])run(`drawMansionSeiten(880,208,${t},${face})`);assert.equal(run('JSON.stringify(M)'),seitenSnapshot);run('mansionSeitenTalk();mansionTalkPortrait();render()');
console.log('PASS Seiten atlas: four contained equal cells, shared scale, stable foot anchors, both facing directions, own portrait and read-only rendering.');

// Seiten leaves only after the reserved inner door really opens and is crossed; old saves retain her.
clearKeys();run('mansionStart(false);mansionEnter("archive",918,448);M.enemies=[];MR.archive.extensionDoor.need="testInnerLock";mansionUse()');assert.equal(run('M.room'),'archive');assert.equal(run('M.flags.seitenLeftArchive'),false);assert(run('M.message.includes("鍵")'));
run('mansionEnter("archive",24,208);mansionUse()');assert.equal(run('M.room'),'hall');assert.equal(run('M.flags.seitenLeftArchive'),false);
run('M.flags.seal=true;mansionEnter("archive",483,208);mansionUse()');assert.equal(run('M.room'),'bedroom');assert.equal(run('M.flags.seitenLeftArchive'),false);
// The inner stage now exists; a temporary lock verifies that the departure happens only after valid entry.
run('delete MR.archive.extensionDoor.need;mansionEnter("archive",918,448);mansionUse()');assert.equal(run('M.room'),'archiveInner');assert.equal(run('M.flags.seitenLeftArchive'),true);assert.equal(run('mansionRead().flags.seitenLeftArchive'),true);
run('mansionEnter("archive",880,208);M.enemies=[]');assert.equal(run('mansionNearbyNPC()'),undefined);
const drawCount=run('(()=>{const n=HUB_NPCS.find(n=>n.id==="seiten"),old=n.draw;let count=0;n.draw=()=>count++;render();n.draw=old;return count;})()');assert.equal(drawCount,0);
run('M.x=592;M.y=448;mansionUse();mansionStart(true)');assert.equal(run('M.room'),'archive');assert.equal(run('M.flags.seitenLeftArchive'),true);run('M.x=880;M.y=208');assert.equal(run('mansionNearbyNPC()'),undefined);
run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{seal:true,boss:true},visited:["archive"],checkpoint:{room:"archive",x:592,y:448}}));mansionStart(true);M.x=880;M.y=208');assert.equal(run('M.flags.seitenLeftArchive'),false);assert.equal(run('mansionNearbyNPC().id'),'seiten');assert(run('M.flags.seal&&M.flags.boss'));
run('M.flags.seitenLeftArchive=true;mansionStart(false)');assert.equal(run('M.flags.seitenLeftArchive'),false);
console.log('PASS Seiten departure: locked-door and other-exit safety, actual inner entry, no render/interaction afterward, reentry/resume persistence, old-save compatibility and new-game reset.');
// Four connected stages: both heroes reach the levers, ride all three clock floors and traverse the water route.
for(const actor of ['umine','astarte']){
 clearKeys();run(`mansionStart(false);M.flags.boss=true;mansionEnter('archive',918,448);mansionUse();M.actor='${actor}';M.enemies=[];`);assert.equal(run('M.room'),'archiveInner');assert(run('M.flags.seitenLeftArchive'));
 run('M.x=812;M.y=368;keys.right=true');ticks(30);assert(run('M.x<=825.01'),'closed gate blocks the main corridor');clearKeys();
 run('mansionEnter("archiveInner",200,368);M.enemies=[];keys.right=true;keys.jump=true');
 for(let i=0;i<700&&run('M.x')<680;i++){run('if(M.ground)inp.jumpPressed=true');ticks(1);}clearKeys();ticks(40);assert(run('M.x>670&&M.y===208'),'lever balcony is reachable by normal jumps: '+run('JSON.stringify({actor:M.actor,x:M.x,y:M.y,ground:M.ground})'));
 run('mansionUse()');assert(run('M.flags.archiveLatch'));assert(run('mansionRead().flags.archiveLatch'));
 run('keys.right=true;keys.jump=true');for(let i=0;i<350&&run('M.x')<915;i++){run('if(M.ground)inp.jumpPressed=true');ticks(1);}clearKeys();ticks(60);assert(run('M.x>900&&M.y===368'));
 run('M.x=931;mansionUse()');assert.equal(run('M.room'),'clockTower');run('M.enemies=[];keys.right=true');for(let i=0;i<150&&run('M.x')<304;i++)ticks(1);clearKeys();ticks(3);assert(run('mansionLiftRiding()'));
 run('mansionUse()');ticks(190);assert.equal(run('M.y'),352);run('mansionUse()');ticks(190);assert.equal(run('M.y'),128);
 run('keys.right=true');for(let i=0;i<190&&run('M.x')<600;i++)ticks(1);clearKeys();ticks(3);run('M.x=607;mansionUse()');assert.equal(run('M.room'),'moonReservoir');
 run('M.enemies=[];keys.right=true;keys.jump=true');for(let i=0;i<700&&run('M.x')<978;i++){run('if(M.ground)inp.jumpPressed=true');ticks(1);}clearKeys();ticks(60);assert(run('M.x>966&&M.y===368&&M.hp>0'),'water chamber traversable with real health');
 run('M.x=993;mansionUse()');assert.equal(run('M.room'),'starPassage');run('M.enemies=[];keys.right=true;keys.jump=true');for(let i=0;i<500&&run('M.x')<470;i++){run('if(M.ground)inp.jumpPressed=true');ticks(1);}clearKeys();ticks(35);assert(run('M.x>460&&M.y===128'),'shortcut switch reachable by ordinary jumps');
 run('mansionUse()');assert(run('M.flags.starShortcut'));run('M.x=540;mansionUse()');assert.equal(run('M.room'),'archive');assert.equal(run('mansionNearbyNPC()'),undefined);
 run('M.x=936;mansionUse()');assert.equal(run('M.room'),'starPassage');assert.equal(run('M.y'),128);
}
// Geysers have a quiet phase and a warning before a bounded burst; elevated platforms are safe.
clearKeys();run('M.map=false;mansionEnter("moonReservoir",288,368);M.enemies=[];M.hp=16;M.hurt=0;M.t=20;mansionVentUpdate()');assert.equal(run('M.hp'),16);run('M.t=100;mansionVentUpdate()');assert.equal(run('M.hp'),16);run('M.t=125;mansionVentUpdate()');assert.equal(run('M.hp'),14);
run('M.hurt=0;M.hp=16;M.y=320;mansionVentUpdate()');assert.equal(run('M.hp'),16);run('M.y=368;M.map=true');const ventT=run('M.t');ticks(40);assert.equal(run('M.t'),ventT);
run('M.map=false;mansionEnter("starPassage",1000,368);M.enemies=[];mansionUse()');assert(run('M.portals.includes("starPassage")'));assert(run('M.map&&M.menuTab==="area"'));run('mansionWarpTo("bedroom")');assert.equal(run('M.room'),'bedroom');run('M.x=231;mansionUse();mansionWarpTo("starPassage")');assert.equal(run('M.room'),'starPassage');
run('M.x=1118;M.y=368;M.map=false;mansionUse()');assert.equal(run('M.room'),'forbiddenArchive');run('M.x=24;mansionUse()');assert.equal(run('M.room'),'starPassage');
run('M.x=940;mansionUse();mansionStart(true)');assert.equal(run('M.room'),'starPassage');assert(run('M.flags.archiveLatch&&M.flags.starShortcut&&M.flags.seitenLeftArchive'));assert(run('M.portals.includes("starPassage")'));
run('M.visited=Object.keys(MR);M.menuTab="map";M.map=true;render()');assert(run('mansionMapHTML().includes("時計塔")&&mansionMapHTML().includes("貯水室")'));assert.equal(run('mansionMapBounds().minY'),-5);for(const id of Object.keys(run('MR'))){const p=run(`mansionMapPosition('${id}')`);assert(p[0]>=10&&p[0]+p[2]<=246&&p[1]>=40&&p[1]+p[3]<=197,id+' map cell outside the map panel');}
console.log('PASS four stages: both-hero continuous route, gate switch, three-level elevator, readable geysers, permanent shortcut, departure event, single added warp, saved progress and expanded map.');

// The warp-adjacent door leads through the new archive to a separate boss chamber; no extra warp.
for(const actor of ['umine','astarte']){
 clearKeys();run(`mansionStart(false);M.flags.boss=true;M.flags.seitenLeftArchive=true;M.actor='${actor}';mansionEnter('starPassage',1118,368);mansionUse();M.enemies=[];keys.right=true;keys.jump=true`);assert.equal(run('M.room'),'forbiddenArchive');
 for(let i=0;i<750&&run('M.x')<984;i++){run('if(M.ground)inp.jumpPressed=true');ticks(1);}clearKeys();ticks(70);assert(run('M.x>974&&M.y===368'),'both heroes can reach the boss door with normal jumps');
 run('M.x=914;mansionUse()');assert.equal(run('M.checkpoint.room'),'forbiddenArchive');run('M.x=993;mansionUse()');assert.equal(run('M.room'),'seitenArena');assert.equal(run('M.actor'),actor);assert.equal(run('M.seitenState'),'waiting');
 run('M.x=120');ticks(1);assert(run('M.map&&M.talk.speaker==="青天"&&M.talk.after==="seitenStart"'));run('mansionTalkClose();M.map=false');assert.equal(run('M.x'),70);ticks(1);assert.equal(run('M.map'),false);
 run('M.x=24;mansionUse()');assert.equal(run('M.room'),'forbiddenArchive');assert.equal(run('M.y'),368);
}
assert.equal(run('Object.keys(MANSION_PORTALS).length'),5);
// Do not hurt the waiting cat. Combat damage is 1 for water, 2 for scythe, with a short boss hit cooldown.
clearKeys();run('mansionEnter("seitenArena",100,256);M.shots=[{x:365,y:238,vx:0}];M.hurt=0');ticks(1);assert.equal(run('M.enemies[0].hp'),64);
run('mansionSeitenStart();M.hurt=0;M.enemies[0].x=150;M.shots=[{x:145,y:238,vx:0},{x:146,y:238,vx:0}]');ticks(1);assert.equal(run('M.enemies[0].hp'),63);
run('M.enemies[0].guard=0;M.actor="astarte";M.scytheStage=1;M.scytheFace=1;M.scytheHit=false;mansionScytheHit()');assert.equal(run('M.enemies[0].hp'),61);
run('M.map=true;M.menuTab="status"');const catPaused=run('JSON.stringify([M.t,M.enemies,M.enemyShots,M.hp])');ticks(50);assert.equal(run('JSON.stringify([M.t,M.enemies,M.enemyShots,M.hp])'),catPaused);run('M.map=false;M.poseT=M.castT=0;M.swapCool=0;M.transition=0');assert(run('mansionSwap()'),'buddy can swap during Seiten battle');
run('M.x=24;mansionUse()');assert.equal(run('M.room'),'seitenArena');run('M.map=true;mansionUI()');assert(elements.get('mBattleLeave').textContent.includes('禁書庫'));run('mansionSeitenLeave()');assert.equal(run('M.room'),'forbiddenArchive');assert.equal(run('M.seitenState'),'waiting');assert.equal(run('M.enemyShots.length'),0);assert.equal(run('M.checkpoint.room'),'forbiddenArchive');
// Normal two pounces, rage three; each target is fixed during its warning, followed by the song pattern.
for(const rage of [false,true]){
 run(`mansionEnter('seitenArena',120,256);mansionSeitenStart();M.hurt=9999;M.x=250;M.enemies[0].hp=${rage?32:64}`);
 let leaps=0,waves=0,notes=0,previous='idle';for(let i=0;i<700;i++){
  run('mansionSeitenAI(M.enemies[0])');const mode=run('M.enemies[0].mode');if(mode==='leap'&&previous==='crouch')leaps++;
  if(mode==='crouch'&&previous!=='crouch'){const locked=run('M.enemies[0].targetX');run('M.x=M.x===250?310:250;mansionSeitenAI(M.enemies[0])');assert.equal(run('M.enemies[0].targetX'),locked);}
  for(const b of run('M.enemyShots')){if(b.kind==='songWave')waves++;if(b.kind==='songNote')notes++;}run('M.enemyShots=[]');if(mode==='idle'&&previous==='sing')break;previous=mode;
 }
 assert.equal(leaps,rage?3:2);assert.equal(waves,rage?3:2);assert.equal(notes,rage?3:0);
}
// Actual note / wave hitboxes: standing clears the high note, jumping clears the low wave, guard reduces a front hit.
clearKeys();run('mansionSeitenStart();M.enemies[0].x=420;M.x=200;M.hurt=0;M.hp=16;M.enemyShots=[{kind:"songNote",x:200,y:214,baseY:214,vx:-.1,vy:0,age:0,damage:2}]');ticks(1);assert.equal(run('M.hp'),16);
run('M.hurt=0;M.enemyShots=[{kind:"songWave",x:200,y:246,vx:-.1,vy:0,damage:2}]');ticks(1);assert.equal(run('M.hp'),14);
run('M.hurt=0;M.x=200;M.y=220;M.vx=M.vy=0;M.kickLock=0;M.enemyShots=[{kind:"songWave",x:200,y:246,vx:-.1,vy:0,damage:2}]');ticks(1);assert.equal(run('M.hp'),14);
run('M.hurt=0;M.actor="astarte";M.x=200;M.y=256;M.vx=M.vy=0;M.kickLock=0;M.ground=true;M.face=1;M.poseT=0;mansionGuardKeys.add("ShiftLeft");M.enemyShots=[{kind:"songWave",x:200,y:246,vx:-.1,vy:0,damage:2}]');ticks(1);assert.equal(run('M.hp'),13);assert(run('M.guardFlash>0'));clearKeys();
// Standing fire is pressured into a safe retry, while ordinary movement and timing win at normal maximum HP.
run('mansionStart(false);M.flags.boss=true;mansionEnter("seitenArena",40,256);mansionSeitenStart();keys.shoot=true');for(let i=0;i<2500&&run('M.seitenState')==='active';i++)ticks(1);assert.equal(run('M.seitenState'),'ready');assert.equal(run('M.flags.seitenDefeated'),false);assert(run('M.map&&M.dead===0'));assert.equal(run('M.hp'),16);clearKeys();
for(const actor of ['umine','astarte']){
 run(`var catEvade=1,catCross=1,catCrossUntil=0;mansionStart(false);M.flags.boss=true;M.flags.archiveLatch=true;M.flags.starShortcut=true;M.flags.seitenLeftArchive=true;mansionEnter('forbiddenArchive',914,368);mansionUse();mansionEnter('seitenArena',40,256);mansionSeitenStart();M.actor='${actor}'`);
 let steps=0,minHP=16,seenSong=false,seenRage=false;
 for(;steps<6500&&run('M.seitenState')==='active';steps++){
  run(`(()=>{const e=M.enemies[0],d=e.x-M.x;mansionGuardKeys.clear();keys.shoot=true;keys.jump=true;keys.left=keys.right=false;if(!M.hurt)M.face=d<0?-1:1;if(M.actor==='astarte'&&!M.abilityCool)mansionAbility();
   const evade=e.mode==='crouch'||e.mode==='leap';
   if(evade){if(e.mode==='crouch'&&e.modeT<=1){catEvade=M.x<e.fromX?-1:1;if(M.x<120)catEvade=1;if(M.x>392)catEvade=-1;}const safe=M.actor==='umine'&&Math.abs(M.x-e.targetX)>75&&Math.abs(d)>65;keys.left=!safe&&catEvade<0;keys.right=!safe&&catEvade>0;}
   else if(['rushWind','rush','clawWind','claw'].includes(e.mode)){
    if(M.actor==='astarte'){if(Math.abs(d)<90){keys.left=d>0&&M.x>60;keys.right=d<0&&M.x<452;}if(M.ground&&((e.mode==='rush'&&Math.abs(d)<90)||(e.mode==='clawWind'&&e.modeT>=7&&Math.abs(d)<90)))inp.jumpPressed=true;}
    else {if(e.mode==='rushWind'&&e.modeT<=1)catCross=d<0?-1:1;
    if(M.t<catCrossUntil){keys.left=catCross<0;keys.right=catCross>0;}
    else{if(Math.abs(d)<90){keys.left=d>0&&M.x>60;keys.right=d<0&&M.x<452;}if(M.ground&&((e.mode==='rush'&&Math.abs(d)<80)||(e.mode==='clawWind'&&e.modeT>=7&&Math.abs(d)<90))){inp.jumpPressed=true;catCross=d<0?-1:1;catCrossUntil=M.t+38;keys.left=catCross<0;keys.right=catCross>0;}}}
   }
   else if(M.actor==='astarte'?Math.abs(d)>40:Math.abs(d)<100){if(M.actor==='astarte'){keys.right=d>0;keys.left=d<0;}else{keys.left=d>0&&M.x>65;keys.right=d<0&&M.x<447;}}
   const wave=M.enemyShots.find(b=>b.kind==='songWave'&&(b.x-M.x)*b.vx<0&&Math.abs(b.x-M.x)<(M.actor==='astarte'?50:36));if(M.ground&&wave)inp.jumpPressed=true;if(M.actor==='umine'&&e.mode==='sing'&&M.y<232)keys.jump=false;})()`);
  if(run('M.enemies[0]?.mode')==='sing')seenSong=true;if(run('M.enemies[0]?.hp')<=32)seenRage=true;ticks(1);minHP=Math.min(minHP,run('M.hp'));
 }
 clearKeys();assert.equal(run('M.seitenState'),'done',actor+' completes normal-HP battle without immunity');assert(seenSong&&seenRage);assert(minHP>0&&minHP<16);assert.equal(run('mansionRead().flags.seitenDefeated'),true);assert.equal(run('mansionRead().checkpoint.room'),'forbiddenArchive');
 run('mansionTalkClose(true);M.map=false;M.x=24;M.y=256;mansionUse();mansionStart(true)');assert.equal(run('M.room'),'forbiddenArchive');assert(run('M.flags.boss&&M.flags.starShortcut&&M.flags.archiveLatch&&M.flags.seitenLeftArchive&&M.flags.seitenDefeated'));
 run('mansionEnter("seitenArena",355,256)');assert.equal(run('M.enemies.length'),0);assert.equal(run('mansionNearbyNPC().id'),'seitenAfter');run('mansionUse()');assert.equal(run('M.talk.speaker'),'青天');run('mansionTalkClose(true);M.map=false;mansionEnter("archive",880,208)');assert.equal(run('mansionNearbyNPC()'),undefined);
 console.log('PASS Seiten normal-HP movement battle:',actor,steps,'frames, lowest HP',minHP);
}
const catAtlas=JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../assets/seiten-sequel-combat.json'),'utf8'));assert.equal(JSON.stringify(run('SEITEN_COMBAT_FRAMES')),JSON.stringify(catAtlas.frames));assert.equal(catAtlas.frames.length,8);const combatImage=images.find(i=>i.src==='assets/seiten-sequel-combat.png');assert(combatImage);combatImage.onload();
for(const f of catAtlas.frames){assert.deepEqual(f.rect.slice(2),[450,400]);assert.equal(f.scale,.125);assert(f.alphaBounds[0]>=0&&f.alphaBounds[2]<=450&&f.alphaBounds[1]>=0&&f.alphaBounds[3]<=400);assert(f.anchor[0]>0&&f.anchor[0]<450&&f.anchor[1]>0&&f.anchor[1]<400);}
run('mansionEnter("seitenArena",100,256);mansionSeitenStart()');for(const face of [-1,1])for(let pose=0;pose<8;pose++){const before=run('JSON.stringify(M)');run(`mansionSeitenBossDraw({...M.enemies[0],dir:${face},pose:${pose}})`);assert.equal(run('JSON.stringify(M)'),before);}run('M.visited=Object.keys(MR);M.map=true;M.menuTab="map";render()');assert(run('mansionMapHTML().includes("禁書庫")'));for(const id of Object.keys(run('MR'))){const p=run(`mansionMapPosition('${id}')`);assert(p[0]+p[2]<=246&&p[1]+p[3]<=197);}
run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{boss:true,starShortcut:true},visited:["starPassage"],checkpoint:{room:"starPassage",x:940,y:368}}));mansionStart(true)');assert.equal(run('M.flags.seitenDefeated'),false);assert(run('M.flags.boss&&M.flags.starShortcut'));assert.equal(run('M.room'),'starPassage');
console.log('PASS forbidden archive / Seiten: connected approach, checkpoint, intro cancel, active damage, hit cooldown, two / three locked pounces, timed low waves / high notes, guard, pause, safe retry / retreat, both-hero fair wins, persistent victory / friendly NPC, equal-scale eight-pose atlas, larger map and old saves.');
// EX story is a continuation of the archive conversation; bosses no longer coach the player's dodges.
clearKeys();run('mansionStart(false);mansionEnter("seitenArena",120,256);mansionSeitenIntro()');assert(run('M.talk.lines.join(" ").includes("隣にいてね")'));assert(run('M.talk.lines.join(" ").includes("一緒にいてくれなかった")'));
for(const fn of ['mansionSeitenIntro','mansionSeitenRetry','mansionAstarteIntro','mansionSparRetry']){run(`${fn}()`);assert(!/ジャンプ|滑って|距離を取|星の高さ|着地する場所|跳んで/.test(run('M.talk.lines.join(" ")')),fn+' contains story rather than dodge instructions');}
run('mansionTalkClose(true);M.map=false;mansionEnter("bedroom",390,208);mansionRoruTalk();mansionDiceChallenge()');assert(!/跳んで|滑って|ガードもお試し/.test(run('M.talk.lines.join(" ")')));run('mansionDiceRetry()');assert(!/間合い|投げる合図/.test(run('M.talk.lines.join(" ")')));
// Both rush directions lock their endpoint before release; rage uses a shorter warning and quicker movement.
for(const rage of [false,true])for(const dir of [-1,1]){
 clearKeys();run(`mansionStart(false);mansionEnter('seitenArena',40,256);mansionSeitenStart();M.hurt=9999;M.x=${dir<0?80:430};M.enemies[0].x=256;M.enemies[0].hp=${rage?32:64};mansionSeitenMode(M.enemies[0],'rushWind')`);
 const target=run('M.enemies[0].targetX');assert.equal(run('M.enemies[0].dir'),dir);run(`M.x=${dir<0?430:80};for(let i=0;i<${rage?21:27};i++)mansionSeitenAI(M.enemies[0])`);assert.equal(run('M.enemies[0].mode'),'rushWind');assert.equal(run('M.enemies[0].targetX'),target);
 run('mansionSeitenAI(M.enemies[0])');assert.equal(run('M.enemies[0].mode'),'rush');let last=256,travel=0;
 while(run('M.enemies[0].mode')==='rush'&&travel<50){run('mansionSeitenAI(M.enemies[0])');const x=run('M.enemies[0].x');assert((x-last)*dir>=0);assert(x>=54&&x<=458);last=x;travel++;}assert.equal(run('M.enemies[0].mode'),'clawWind');assert.equal(last,target);assert(run('M.enemies[0].trail.length>0'));
 const before=run('JSON.stringify(M)');run('mansionSeitenBossDraw(M.enemies[0])');assert.equal(run('JSON.stringify(M)'),before);run('M.map=true');const paused=run('JSON.stringify([M.enemies,M.fx,M.t])');ticks(30);assert.equal(run('JSON.stringify([M.enemies,M.fx,M.t])'),paused);run('M.map=false');
 run('for(let i=0;i<13;i++)mansionSeitenAI(M.enemies[0])');assert.equal(run('M.enemies[0].mode'),'clawWind');run('mansionSeitenAI(M.enemies[0])');assert.equal(run('M.enemies[0].mode'),'claw');assert.equal(run('M.enemies[0].dir'),dir);
 // The visible forward claw is the hazardous region; its tell and recovery are safe at that distance.
 run(`M.x=M.enemies[0].x+${dir}*45;M.y=256;M.hp=16;M.hurt=0;M.vx=M.vy=0;for(let i=0;i<4;i++)mansionSeitenAI(M.enemies[0])`);assert.equal(run('M.hp'),16);run('mansionSeitenAI(M.enemies[0])');assert.equal(run('M.hp'),13);
 run('M.hp=16;M.hurt=0;M.y=226;mansionSeitenAI(M.enemies[0])');assert.equal(run('M.hp'),16,'a timed jump clears the claw');
 run(`M.y=256;M.ground=true;M.actor='astarte';M.poseT=0;M.face=${-dir};mansionGuardKeys.add('ShiftLeft');M.hurt=0;mansionSeitenAI(M.enemies[0])`);assert.equal(run('M.hp'),15);clearKeys();run('M.hurt=9999;for(let i=0;i<11;i++)mansionSeitenAI(M.enemies[0])');assert.equal(run('M.enemies[0].mode'),'recover');run('M.hp=16;M.hurt=0;mansionSeitenAI(M.enemies[0])');assert.equal(run('M.hp'),16);
}
// A recorded EX clear is replayable without clearing exploration / reward flags or adding an NPC during combat.
clearKeys();run('mansionStart(false);M.flags.boss=true;M.flags.complete=true;M.flags.astarteReward=true;M.flags.archiveLatch=true;M.flags.starShortcut=true;M.flags.seitenDefeated=true;M.flags.seitenLeftArchive=true;mansionEnter("forbiddenArchive",914,368);mansionUse();mansionEnter("seitenArena",355,256);mansionUse()');assert(run('M.talk.offerSeiten'));assert.equal(elements.get('mTalkSeiten').style.display,'block');const snapshotExFlags=()=>JSON.parse(run('JSON.stringify(Object.fromEntries(Object.keys(mansionRead().flags).map(k=>[k,M.flags[k]===true])))'));const exFlags=snapshotExFlags(),exCheckpoint=run('JSON.stringify(M.checkpoint)');
run('document.getElementById("mTalkSeiten").handlers.click({preventDefault(){},stopPropagation(){}})');assert.equal(run('M.seitenState'),'ready');assert.equal(run('mansionNearbyNPC()'),undefined);run('mansionTalkClose();M.map=false');assert.equal(run('M.seitenState'),'done');assert.equal(run('M.enemies.length'),0);ticks(20);assert(!run('M.map'));
run('M.x=355;M.y=256;mansionUse();mansionSeitenChallenge();mansionTalkNext()');assert.equal(run('M.seitenState'),'active');assert.equal(run('M.enemies[0].hp'),64);assert.equal(run('mansionNearbyNPC()'),undefined);assert.deepStrictEqual(snapshotExFlags(),exFlags);run('mansionSeitenRetry();mansionTalkClose();M.map=false;M.x=355;M.y=256;mansionUse();mansionSeitenChallenge();mansionTalkNext();mansionSeitenLeave();mansionStart(true)');assert.deepStrictEqual(snapshotExFlags(),exFlags);assert.equal(run('JSON.stringify(M.checkpoint)'),exCheckpoint);assert.equal(run('M.room'),'forbiddenArchive');
run('mansionEnter("seitenArena",355,256);mansionUse();mansionSeitenChallenge();mansionTalkNext();mansionSeitenWin()');assert.deepStrictEqual(snapshotExFlags(),exFlags);assert.equal(run('JSON.stringify(M.checkpoint)'),exCheckpoint);assert(run('M.talk.lines.join(" ").includes("また帰ってきて")'));assert(!run('mansionStatusHTML().includes("EX：")'));assert.equal(run('mansionMaxHP()'),20);
run('mansionStart(false);mansionEnter("seitenArena",40,256);mansionSeitenStart();mansionSeitenWin()');assert.equal(run('M.flags.boss'),false);assert.equal(run('M.flags.complete'),false,'EX victory does not advance the main story');
console.log('PASS EX38: story-only boss dialogue, abandonment/reconciliation, stronger HP64 fight, locked ground rush / readable timed claw / jump and guard in both directions, rage tempo, paused trails, repeatable saved EX with no duplicate NPC, preserved main progress and checkpoint.');

// Each boss gifts its own amulet once; existing clears can receive it by talking, without redoing the fight.
clearKeys();run('mansionStart(false);M.flags.boss=true;M.flags.starShortcut=true;mansionEnter("forbiddenArchive",914,368);mansionUse();mansionEnter("seitenArena",40,256);mansionSeitenStart();mansionSeitenWin()');assert.equal(run('mansionMaxHP()'),18);assert.equal(run('M.hp'),18);assert(run('M.talk.lines.includes(SEITEN_AMULET_LINE)'));assert(run('mansionRead().flags.seitenReward'));assert.equal(run('M.flags.astarteFull'),undefined);assert.equal(run('M.checkpoint.room'),'forbiddenArchive');
run('mansionTalkClose(true);M.map=false;mansionStart(true)');assert.equal(run('mansionMaxHP()'),18);assert(run('M.flags.starShortcut&&M.flags.boss&&M.flags.seitenDefeated'));run('mansionEnter("seitenArena",355,256);mansionUse()');assert(!run('M.talk.lines.includes(SEITEN_AMULET_LINE)'));
run('mansionSeitenChallenge();mansionTalkNext();mansionSeitenWin()');assert.equal(run('mansionMaxHP()'),18);assert(!run('M.talk.lines.includes(SEITEN_AMULET_LINE)'));assert(!/EX|再戦/.test(run('M.talk.lines.join(" ")+mansionStatusHTML()')));assert(html.includes('>一緒に遊ぶ</button>'));assert(!html.includes('（EX再戦）'));
run('mansionStart(false);M.flags.seitenDefeated=true;M.flags.seitenLeftArchive=true;mansionEnter("seitenArena",355,256);mansionSave();mansionStart(true);mansionEnter("seitenArena",355,256);mansionUse()');assert.equal(run('mansionMaxHP()'),18);assert(run('M.talk.lines.includes(SEITEN_AMULET_LINE)'));assert(run('mansionRead().flags.seitenReward'));assert.equal(run('M.flags.boss'),false);assert.equal(run('M.flags.complete'),false);
run('mansionTalkClose(true);M.map=false;M.hp=10;mansionUse()');assert.equal(run('M.hp'),10,'repeat conversations do not heal or grant another amulet');assert(!run('M.talk.lines.includes(SEITEN_AMULET_LINE)'));
run('mansionStart(false);M.flags.boss=true;M.flags.astarteReward=true;mansionEnter("seitenArena",40,256);mansionSeitenStart();mansionSeitenWin()');assert.equal(run('mansionMaxHP()'),20);assert(run('M.talk.lines.includes(SEITEN_AMULET_LINE)'),'each boss grants a separate amulet');
run('mansionTalkClose(true);M.map=false;mansionEnter("bedroom",612,208);mansionUse();mansionFullBattle();mansionSparWin()');assert.equal(run('mansionMaxHP()'),20);assert(run('M.flags.astarteFull'),'full Astarte victory remains recorded independently');
console.log('PASS reward40: independently stacking permanent amulets, first-win gift / heal / save / resume, reward for an existing clear, no repeat healing or duplicate reward, both boss orders and natural conversation labels.');

// Legacy shared flags migrate by recorded boss clears, and resaving is idempotent.
for(const [flags,hp,a,b] of [[{astarteFull:true,astarteReward:true},18,true,false],[{seitenDefeated:true,astarteReward:true},18,false,true],[{seitenDefeated:true,astarteFull:true,astarteReward:true},20,true,true],[{seitenDefeated:true},18,false,true]]){
 run(`localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:${JSON.stringify(flags)},visited:['bedroom'],checkpoint:{room:'bedroom',x:110,y:208}}));mansionStart(true)`);
 assert.equal(run('mansionMaxHP()'),hp);assert.equal(run('M.flags.astarteReward'),a);assert.equal(run('M.flags.seitenReward'),b);
 run('mansionSave();mansionStart(true)');assert.equal(run('mansionMaxHP()'),hp);
}
clearKeys();run("mansionStart(false);M.flags.boss=true;M.flags.seitenDefeated=true;mansionEnter('bedroom',130,208);M.transition=0;M.swapCool=0");
assert(run('mansionSwap()'));assert.equal(run('M.actor'),'astarte');run('M.swapCool=0');assert(run('mansionSwap()'));assert.equal(run('M.actor'),'seiten');assert(run('mansionStatusHTML().includes("青天")'));assert(!run('mansionIsUmine()'));
run('M.swapCool=0;M.map=true');assert(!run('mansionSwap()'));run('M.map=false;mansionEnter("hall",380,368);M.enemies=[];M.transition=0;M.hurt=0');assert.equal(run('M.actor'),'seiten');ticks(25);
// One hit per swing, two distinct swings; no Umine water shot while holding attack.
run("M.face=1;M.enemies=[{kind:'walk',x:M.x+25,y:M.y,hp:10}];mansionSeitenClaw();mansionSeitenClawHit();mansionSeitenClawHit()");assert.equal(run('M.enemies[0].hp'),8);run('mansionSeitenClaw(2);mansionSeitenClawHit()');assert.equal(run('M.enemies[0].hp'),6);
run('M.enemies=[];M.poseT=M.cool=0;keys.shoot=true');ticks(48);assert.equal(run('M.clawStage'),2);assert.equal(run('M.shots.length'),0);clearKeys();ticks(35);
// Song has a real windup and freezes with the menu; hurt cancels a pending note.
run('M.abilityCool=0;M.poseT=0');assert(run('mansionAbility()'));ticks(11);assert.equal(run('M.shots.length'),0);run('M.map=true');ticks(20);assert.equal(run('M.castT'),19);run('M.map=false');ticks(1);assert.equal(run('M.shots[0].kind'),'song');assert.equal(run('M.shots[0].damage'),2);
run('M.shots=[];M.castT=0;M.abilityCool=0;mansionAbility();M.hurt=0;mansionDamage(1,1)');ticks(15);assert.equal(run('M.shots.length'),0);
run('M.hurt=0;M.kickLock=0;M.poseT=M.castT=0;M.y=368;M.ground=true;M.face=1;M.stepCool=0;mansionInput.slide=true');const beforeStep=run('M.x');ticks(1);assert(run('M.stepT>0'));assert(run('M.x')<beforeStep);assert.equal(run('M.hurt'),0);assert(!run('mansionSwap()'));run('M.map=true');const stepTimer=run('M.stepT');ticks(15);assert.equal(run('M.stepT'),stepTimer);
run('M.map=false;mansionDiceStart()');assert.equal(run('M.actor'),'seiten');assert.equal(run('M.stepT'),0);run('M.poseT=12;M.stepT=8;mansionDiceRetry()');assert.equal(run('M.stepT'),0);
run('mansionTalkClose(true);M.map=false;mansionEnter("seitenArena",110,256);mansionSeitenStart()');assert.equal(run('M.actor'),'umine');assert(!run('mansionActors().includes("seiten")'));
console.log('PASS buddy40: legacy reward migration / idempotent save, three-way swap and locks, shared status / room continuity, 2+2 claws, no water shot, delayed song / pause / interruption, backstep / pause / retry, no self-boss.');

// Stage phase 1: the tile-room movement model matches the real physics (tools/reach.js relies on these numbers).
{
 const kickClimb=(room,x,y,side,topY)=>{clearKeys();run(`M.map=false;M.actor='umine';mansionEnter('${room}',${x},${y});M.enemies=[];M.hurt=0;M.transition=0;keys.${side>0?'right':'left'}=true;keys.jump=true;`);
  for(let i=0;i<900;i++){if(run(`M.y<${topY}-2`)){run(`keys.${side>0?'right':'left'}=false;keys.${side>0?'left':'right'}=true;`);}else run('if(M.ground || (M.wall && M.kickLock===0))inp.jumpPressed=true');ticks(1);if(run(`M.ground&&M.y===${topY}`))break;}
  return run('JSON.stringify([M.x,M.y,M.ground])');};
 // Wall kick up one wall (east wall of the clock tower) through the 2-tile floor hole.
 let p=JSON.parse(kickClimb('clockTower',616,576,1,352));assert(p[1]===352&&p[2]&&p[0]<592,'clock tower wall-kick shaft: '+p);
 // Wall kick past a ledge using the 1-column gap, then hop onto the secret ledge.
 p=JSON.parse(kickClimb('moonReservoir',1000,368,1,96));assert(p[1]===96&&p[2]&&p[0]<960,'reservoir wall-kick secret: '+p);
 // Slide jump crosses the 6-tile gap in the star passage; a normal running jump does not.
 clearKeys();run('M.map=false;mansionEnter("starPassage",840,224);M.enemies=[];M.hurt=0;M.transition=0;M.face=1;');ticks(2);run('keys.right=true;mansionInput.slide=true');ticks(1);assert(run('M.slideT>0'));
 for(let i=0;i<40&&run('M.x<918');i++)ticks(1);run('keys.jump=true;inp.jumpPressed=true');ticks(1);assert(run('M.slideJump&&M.vy<0'),'slide jump starts');
 for(let i=0;i<120&&!run('M.ground');i++){if(run('M.x>1024'))run('keys.right=false');ticks(1);}assert(run('M.ground&&M.y===224&&M.x>1024'),'slide jump lands on the far ledge: '+run('JSON.stringify([M.x,M.y])'));
 clearKeys();run('mansionEnter("starPassage",918,224);M.enemies=[];M.hurt=0;M.transition=0;');ticks(2);run('keys.right=true;keys.jump=true;inp.jumpPressed=true');for(let i=0;i<160&&!(run('M.ground')&&i>3);i++)ticks(1);assert(run('M.y')>224,'a normal jump must not reach the slide-jump ledge');clearKeys();
 // Slide tunnel: exactly one free row over the floor; standing is blocked, sliding passes.
 run('mansionEnter("archive",145,208);M.enemies=[]');assert(!run('mansionFits(200,208,MC.h)')&&run('mansionFits(200,208,MC.slideH)'));
 // Generated data: doors pair both ways, markers stand on ground, warps and props come from the tile grid.
 for(const id of run('Object.keys(MR)'))for(const i of run(`Object.keys(MR.${id}.doors)`)){const d=`MR.${id}.doors[${i}]`;assert(run(`!!MR[${d}.to]&&mansionFitsIn(${d}.to,${d}.at[0],${d}.at[1])`),id+' door '+i+' arrives inside a wall');assert(run(`MR[${d}.to].doors.some(b=>b.to==='${id}')||MR[${d}.to].extensionDoor?.to==='${id}'`),id+' door '+i+' has no way back');}
 // Old saves whose checkpoint no longer stands on the new grid snap to that room's save altar.
 run('localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:{seal:true},visited:["bedroom","gallery"],checkpoint:{room:"gallery",x:900,y:140}}));mansionStart(true)');assert.equal(run('M.room'),'gallery');assert.equal(run('M.x'),run('MR.gallery.cp[0]'));assert.equal(run('M.y'),run('MR.gallery.cp[1]'));
 // Hall way back west: climb the broken spiral stair stubs on the east wall to the balcony, then cross the stair core (no one-way trap).
 const route=(pts)=>{for(const[tx,ty,jd=40]of pts){let ok=false;for(let i=0;i<400&&!ok;i++){const s=JSON.parse(run('JSON.stringify([M.x,M.y,M.ground])'));const dx=tx-s[0];clearKeys();if(Math.abs(dx)>3)run('keys.'+(dx>0?'right':'left')+'=true');if(ty<s[1]-2){run('keys.jump=true');if(s[2]&&Math.abs(dx)<jd)run('inp.jumpPressed=true');}ticks(1);const n=JSON.parse(run('JSON.stringify([M.x,M.y,M.ground])'));ok=n[2]&&Math.abs(n[1]-ty)<1&&Math.abs(n[0]-tx)<8;}if(!ok)return run('JSON.stringify([M.x,M.y,'+tx+','+ty+'])');}clearKeys();return 'ok';};
 run('M.map=false;M.actor="umine";mansionEnter("hall",440,368);M.enemies=[];M.hurt=0;M.transition=0;');ticks(2);
 assert.equal(route([[472,320],[456,272],[478,224],[430,176,60],[200,192]]),'ok','hall spiral stair route');
 clearKeys();run('keys.left=true');for(let i=0;i<300&&run('M.x>150');i++)ticks(1);clearKeys();assert(run('M.x<=150'),'hall east-to-west return: '+run('JSON.stringify([M.x,M.y])'));
 console.log('PASS stage tiles: wall-kick shaft and ledge gap, slide jump reach vs normal jump, one-row slide tunnel, hall way back west, paired doors, stale checkpoint snapping.');
}

// ---- test.42 foes: data-driven kinds, shield rules, wake/drop/fire behaviours, sprite-sheet loader.
{
 const prep=(room,x,y)=>{clearKeys();run(`M.map=false;M.actor='umine';mansionEnter('${room}',${x},${y});M.hurt=0;M.transition=0;M.hp=mansionMaxHP();`);};
 // every room's foe list spawns and runs without throwing; kinds come from data
 for(const id of run('Object.keys(MR)')){prep(id,MR_cp(id)[0],MR_cp(id)[1]);ticks(120);}
 function MR_cp(id){return run(`JSON.stringify(MR.${id}.cp||MR.${id}.doors[0]&&[MR.${id}.doors[0].x,MR.${id}.doors[0].y]||[64,64])`).replace(/[\[\]]/g,'').split(',').map(Number);}
 const kinds=run('JSON.stringify([...new Set(Object.values(MR).flatMap(r=>r.enemies.map(e=>e[0])))])');for(const k of ['shield','crawler','turret','bats','bookmimic','slime'])assert(kinds.includes(k),'room data uses foe kind '+k);
 // shield walker: front shots are deflected, shots from behind hurt
 prep('hall',260,368);run('M.enemies=M.enemies.filter(e=>e.kind==="shield");{const e=M.enemies[0];e.x=330;e.face=-1;e.min=200;e.max=420;}');
 run('M.shots.push({x:316,y:350,vx:4})');ticks(2);assert.equal(run('M.enemies[0].hp'),4,'shield blocks a frontal shot');
 run('M.enemies[0].face=-1;M.shots.push({x:346,y:350,vx:-4})');ticks(2);assert.equal(run('M.enemies[0].hp'),3,'shot from behind hurts the shield walker');
 // standing contact hurts, a slide passes underneath the shield arm
 run('{const e=M.enemies[0];e.x=330;e.face=-1;M.hp=mansionMaxHP();M.hurt=0;M.x=330;M.y=368;M.ground=true;M.h=MC.h}');ticks(1);assert(run('M.hp<mansionMaxHP()'),'standing into the shield walker hurts');
 run('{const e=M.enemies[0];e.x=330;e.face=-1;e.turnT=0;M.hp=mansionMaxHP();M.hurt=0;M.x=300;M.y=368;M.vx=0;M.vy=0;M.knock=0;M.ground=true;M.h=MC.h;M.face=1;}');ticks(1);run('mansionInput.slide=true');let under=false;for(let i=0;i<30;i++){ticks(1);run('mansionInput.slide=false');if(process.env.DBG)console.log(run('JSON.stringify([M.x,M.y,M.h,M.slideT,M.hp,M.enemies[0].x,M.enemies[0].face])'));if(run('Math.abs(M.x-M.enemies[0].x)<4&&M.h===MC.slideH'))under=true;}
 assert(under,'slide reaches under the shield walker');assert.equal(run('M.hp'),run('mansionMaxHP()'),'sliding under the shield walker does no damage');assert(run('M.x>M.enemies[0].x'),'slide ends behind the shield walker');
 // bats sleep until Umine comes close, then swoop
 prep('archiveInner',100,368);assert(run('M.enemies.filter(e=>e.kind==="bat").length===4'),'bats swarm spawns 4 bats');ticks(5);assert(run('M.enemies.filter(e=>e.kind==="bat").every(b=>b.state==="sleep")'));
 run('M.x=488;M.y=96;M.ground=false');ticks(3);run('M.x=488;M.y=96');assert(run('M.enemies.some(e=>e.kind==="bat"&&e.state==="fly")'),'bats wake when Umine is near');
 // slime drips down when Umine walks beneath
 prep('cellar',60,208);run('M.enemies=M.enemies.filter(e=>e.kind==="slime").slice(0,1);M.x=M.enemies[0].x+40');ticks(3);assert.equal(run('M.enemies[0].state'),'hang');run('M.x=M.enemies[0].x+4');ticks(2);assert.equal(run('M.enemies[0].state'),'fall');run('M.x=M.enemies[0].x+120');ticks(140);assert.equal(run('M.enemies[0].state'),'crawl','slime lands and crawls');
 // hover turret telegraphs then fires an aimed shot
 prep('starPassage',900,224);run('M.enemies=M.enemies.filter(e=>e.kind==="turret");M.enemyShots=[];M.x=M.enemies[0].x-60;M.y=224;M.hurt=999');let fired=false,charged=false;for(let i=0;i<200&&!fired;i++){ticks(1);if(run('M.enemies[0].state==="charge"'))charged=true;fired=run('M.enemyShots.length>0');}assert(charged&&fired,'turret charges then fires');
 // book mimic hops toward Umine
 prep('archive',60,208);run('M.enemies=M.enemies.filter(e=>e.kind==="bookmimic");M.x=M.enemies[0].x+70;M.hurt=999');const bx=run('M.enemies[0].x');let hopped=false;for(let i=0;i<120;i++){ticks(1);if(run('M.enemies[0].state==="hop"'))hopped=true;}assert(hopped&&run('M.enemies[0].x')>bx,'book mimic hops toward Umine');
 // wall crawler rides the shaft wall
 prep('clockTower',560,576);run('M.enemies=M.enemies.filter(e=>e.kind==="crawler");M.hurt=999');const cy0=run('M.enemies[0].y');ticks(60);assert(run('M.enemies[0].side===1&&Math.abs(M.enemies[0].y-'+cy0+')>20&&M.enemies[0].x===39*16+9'),'crawler climbs along the east shaft wall');
 // sprite-sheet loader: the art team's sheets (frame{w,h}, anchor{cx,feet_y}, hitbox{body,attack}, facing right) map onto the behaviours
 const ED=require('path').join(__dirname,'..','assets','enemies');const man=JSON.parse(fs.readFileSync(ED+'/manifest.json','utf8'));
 for(const[kind,file]of Object.entries(man.kinds)){const raw=fs.readFileSync(ED+'/'+file+'.json','utf8');assert(fs.existsSync(ED+'/'+file+'.png'),file+'.png');run(`mansionFoeArtLoad(${JSON.stringify(kind)},{width:${require('zlib')&&0||1000}},${raw},{width:16})`);}
 assert.equal(Object.keys(man.kinds).length,6);
 for(const k of ['shield','crawler','turret','bat','bookmimic','slime'])for(const an of ['idle','move','telegraph','attack','hurt','death'])assert(run(`!!MANSION_FOE_ART.${k}.meta.anims.${an}`),k+' has '+an);
 assert(run('!!MANSION_FOE_ART.shield.meta.anims.guard&&!!MANSION_FOE_ART.slime.meta.anims.fall'));
 assert.equal(run('MANSION_FOES.shield.hb.join()'),'-9,-34,18,32','armor body is centred on the body, not the spear');
 assert(run('MANSION_FOES.shield.contact[1]+MANSION_FOES.shield.contact[3]<=-15'),'armor contact keeps the slide gap');
 assert.equal(run('JSON.stringify(mansionFoeBox({kind:"shield",x:100,y:200,face:-1}))'),'[91,166,18,32]','left-facing hitbox x is mirrored');
 assert.equal(run('mansionFoeLen("shield","telegraph",0)'),22,'telegraph length follows the sheet ms');
 assert(run('MANSION_FOE_ART.turret.meta.spawn[0]>0'),'turret projectile_spawn read');
 assert(run('mansionFoeDrawSheet({kind:"bat",x:10,y:10,state:"fly",t:5,st:0,face:-1,flash:0})&&mansionFoeDrawSheet({kind:"crawler",x:10,y:10,state:"tele",t:5,st:3,face:1,side:1,flash:0})'),'sheet draw path');
 // with the real boxes: armor still blocks from the front and can be slid under, and its telegraph precedes a spear thrust
 prep('hall',260,368);run('M.enemies=M.enemies.filter(e=>e.kind==="shield");{const e=M.enemies[0];e.x=330;e.face=-1;e.min=200;e.max=420;}');run('M.shots.push({x:316,y:350,vx:4})');ticks(2);assert.equal(run('M.enemies[0].hp'),4,'armor blocks a frontal shot (sheet boxes)');
 run('{const e=M.enemies[0];e.x=330;e.face=-1;e.turnT=0;e.cool=999;M.hp=mansionMaxHP();M.hurt=0;M.x=300;M.y=368;M.vx=0;M.vy=0;M.knock=0;M.ground=true;M.h=MC.h;M.face=1;}');ticks(1);run('mansionInput.slide=true');for(let i=0;i<30;i++){ticks(1);run('mansionInput.slide=false');}assert.equal(run('M.hp'),run('mansionMaxHP()'),'slide under armor (sheet boxes)');
 run('{const e=M.enemies[0];e.x=330;e.face=-1;e.cool=0;e.turnT=0;e.state="guard";M.x=296;M.y=368;M.vx=0;M.ground=true;M.h=MC.h;M.hurt=999;}');const seen=[];for(let i=0;i<60;i++){ticks(1);run('M.x=296;M.vx=0');const st=run('M.enemies[0].state');if(seen.at(-1)!==st)seen.push(st);}assert(seen.indexOf('tele')>=0&&seen.indexOf('atk')>seen.indexOf('tele'),'armor telegraphs before the thrust: '+seen);
 run('{const e=M.enemies[0];e.x=330;e.face=-1;e.state="atk";e.st=0;M.hurt=0;M.hp=mansionMaxHP();M.x=307;M.y=368;M.ground=true;M.h=MC.h;}');ticks(2);assert(run('M.hp<mansionMaxHP()'),'spear hitbox hurts during active frames');
 console.log('PASS foes: 6 data-driven kinds spawn from room data; shield blocks front shots, hurts standing contact, slide passes under; bats wake, slime drops, turret fires, mimic hops, crawler climbs; sheet loader maps the art team sheets (mirrored hitboxes, telegraph timing, projectile spawn, armor slide gap).');
}
