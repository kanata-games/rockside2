// =====================================================================
//  test.54: ダイスロール sequel art (gentleman sheet) + the serious late-game fight with the girl inside (中身の女の子).
//  Gentleman fights are practice (he holds back). After all four shades (flags.darkStyleUnlocked) the bedroom offer
//  becomes the real fight in 月影の遊戯室. Candy / sweet-smoke motifs only (no cigarettes). No dodge tips (§14).
// =====================================================================
function sheetLoad(json,dst){if(typeof fetch!=='function')return;fetch(json).then(r=>r.ok?r.json():null).then(d=>{if(!d)return;const img=new Image();img.onload=()=>{dst.img=img;dst.d=d;dst.by={};for(const f of d.frames)dst.by[f.name]=f;};img.src='assets/'+d.image;}).catch(()=>{});}
const DICE_SEQ={},GIRL_SEQ={};sheetLoad('assets/diceroll-sequel.json',DICE_SEQ);sheetLoad('assets/diceroll_girl-sequel.json',GIRL_SEQ);
let GIRL_FACE=null;{const im=new Image();im.onload=()=>GIRL_FACE=im;im.src='assets/diceroll_girl_face.png';}
const GIRL_TALK={};sheetLoad('assets/diceroll_girl_talk-sequel.json',GIRL_TALK);
function sheetDraw(S,name,x,feet,dir,alpha=1){const f=S.by&&(S.by[name]||S.by.idle0);if(!f)return false;const s=f.scale||S.d.scale,[ax,ay]=f.anchor;g.save();g.globalAlpha*=alpha;g.translate(Math.round(x),Math.round(feet));if(dir<0)g.scale(-1,1);g.imageSmoothingEnabled=true;g.drawImage(S.img,f.rect[0],f.rect[1],f.rect[2],f.rect[3],-ax*s,-ay*s,f.rect[2]*s,f.rect[3]*s);g.restore();return true;}
// spawn points from the json (native px relative to the 256,500 anchor → game px)
function diceSpawn(S,anim,dir){const sp=S.d&&S.d.spawn&&S.d.spawn[anim];const s=(S.d&&S.d.scale)||.1227;return sp?[(sp.x-256)*s*dir,(sp.y-500)*s]:[20*dir,-30];}
function diceGentPose(e){if(!e)return'idle'+((M.t>>5)&1);if(e.flash>0&&!e.sq)return'hurt';const air=e.y<SQF-2;
 if(e.sq==='dSlam')return e.st<=24?'telegraph':air?'jump':'attackA';if(e.sq==='dCardWall')return e.st<30?'telegraph':'attackB';if(e.sq==='dJackpot')return e.st<100?'telegraph':'attackB';
 if(air)return'jump';return{walk:'move'+((e.t>>3)&1),windup:'telegraph',throwDice:'attackB',flickCards:'attackB'}[e.anim]||'idle'+((e.t>>5)&1);}
let DICE_DRAW_E=null;
{const base=drawRoru;drawRoru=function(x,feet,time,face=-1){if(DICE_SEQ.img&&sheetDraw(DICE_SEQ,diceGentPose(DICE_DRAW_E),x,feet,face))return;base(x,feet,time,face);};}
// ---------------- the girl ----------------
KEIKO_BOSSES.diceGirl={name:'ダイスロール（素顔）',col:'#ff6a9a',sub:'#f3e9ff',pose:{},seq:[],rageSeq:[]};
const GIRL_COL='#ff6a9a',GIRL_SMOKE='#cdb6e8';
function mansionNewDiceGirl(){return{kind:'diceBoss',girl:true,id:'diceGirl',x:380,y:SQF,hp:200,maxHp:200,t:0,dir:-1,flash:0,anim:'idle',mode:'walk',mt:0,cycle:0,lift:0,hidden:false};}
function girlMode(e,m){e.mode=m;e.mt=0;e.hidden=false;e.aimLine=null;}
function girlClamp(x){return Math.max(52,Math.min(460,x));}
function girlFace(e){e.dir=M.x<e.x?-1:1;}
const GIRL_MOVES={
 // candy rush: locked dash line, after-images, drops lollipop bombs that pop
 gCandyRush(e,t,r){const W=r?16:20;if(t===1){girlFace(e);e.tx=girlClamp(M.x+e.dir*70);e.bombs=0;sfx('warn');}
  if(t<W){kFx(e,{type:'line',x0:e.x,x1:e.tx,y:SQF-3,thick:2,col:t>W-7?'#ffffff':GIRL_COL,end:2});e.pose='telegraph';return;}
  if(Math.abs(e.tx-e.x)>2){const st=Math.sign(e.tx-e.x)*Math.min(Math.abs(e.tx-e.x),r?8:7);e.x+=st;e.pose='move';(e.trail||(e.trail=[])).push({x:e.x,y:e.y,age:0});
   if(++e.bombs%6===0)kb(e,{x:e.x,y:SQF-8,shape:'bigorb',r:4,col:'#ffb3d1',life:999,extra:{candyBomb:r?36:44}});juiceShake(1,2);return;}
  e.pose='attackA';if(!e.landT){e.landT=t;juiceShake(3,8);sfx('land');sqWave(e,e.x,2.6,GIRL_COL);}
  if(t-e.landT>(r?24:32)){e.landT=0;return true;}},
 // sweet-smoke veil: smoke puffs, vanishes, reappears behind with an uppercut + sugar shards
 gSmokeVeil(e,t,r){if(t===1){girlFace(e);fxSpawn(e,'smoke',e.x,SQF-24);for(let k=0;k<5;k++)kFx(e,{type:'glow',x:e.x+(k-2)*12,y:SQF-20-(k&1)*10,r:7+(k&1)*3,col:GIRL_SMOKE,end:60});sfx('swoosh');}
  if(t<20){e.pose='telegraph';return;}if(t===20){e.hidden=true;}
  if(t<56){if(t===24)e.tx=girlClamp(M.x-(M.face||1)*34);if(t>=24)sqMark(e,e.tx,26,t>46?'#ffffff':GIRL_COL);return;}
  if(t===56){e.hidden=false;e.x=e.tx;fxSpawn(e,'smoke',e.x,SQF-24);girlFace(e);e.pose='attackB';juiceShake(3,8);sfx('shot');fxSpawn(e,'slash',e.x,SQF-24);for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.34;kb(e,{x:e.x,y:SQF-28,vx:Math.cos(a)*2.3,vy:Math.sin(a)*2.3,g:.06,shape:'star',col:'#ffe0f0'});}}
  if(t>=56&&t<64&&kPHit([e.x-12,SQF-48,24,48]))mansionDamage(3,e.dir);
  if(t>(r?84:96))return true;},
 // lollipop orbit: six candies circle her while she stalks, then fling outward
 gLolliSpin(e,t,r){const n=6,REL=r?80:96;if(t===1){fxSpawn(e,'card_storm',e.x,e.y-24,{follow:true,loop:REL});e.orbs=[];for(let i=0;i<n;i++)e.orbs.push(kb(e,{x:e.x,y:e.y-24,shape:'bigorb',r:4,col:i&1?'#ffe27a':'#ff9ad0',life:999,extra:{orbit:true}}));sfx('tink');}
  girlFace(e);if(t<REL){e.pose=t&8?'move':'telegraph';e.x=girlClamp(e.x+e.dir*(r?1.3:1));}
  const rad=Math.min(32,t*.8),ang=t*(r?.11:.09);e.orbs.forEach((o,i)=>{if(o.orbit){const a=ang+i*Math.PI*2/n;o.x=e.x+Math.cos(a)*rad;o.y=e.y-24+Math.sin(a)*rad*.8;o.vx=o.vy=0;}});
  if(t>REL-18&&t<REL)kFx(e,{type:'glow',x:e.x,y:e.y-24,r:4+(t-REL+18)/2,col:'#ffffff',end:2});
  if(t===REL){e.pose='attackB';juiceShake(2,6);sfx('shot');e.orbs.forEach((o,i)=>{o.orbit=false;const a=Math.atan2(o.y-(e.y-24),o.x-e.x);o.vx=Math.cos(a)*2.2;o.vy=Math.sin(a)*2.2;o.life=200;});}
  if(t>REL+40)return true;},
 // loaded dice: shows the roll, then that many bouncing dice in alternating arcs
 gLoadedDice(e,t,r){if(t===1){girlFace(e);e.roll=3+Math.floor(Math.random()*(r?4:3));sfx('start');const [sx,sy]=diceSpawn(GIRL_SEQ,'roulette_ruin',e.dir);fxSpawn(e,'roulette',e.x+sx,e.y+sy,{loop:30});}
  if(t<30){e.pose='telegraph';kFx(e,{type:'die',x:e.x,y:e.y-70,n:t<18?1+((t>>2)%6):e.roll,rolling:t<18,end:2});return;}
  kFx(e,{type:'die',x:e.x,y:e.y-70,n:e.roll,end:2});const EV=r?12:15;for(let i=0;i<e.roll;i++)if(t===30+i*EV){e.pose='attackB';girlFace(e);const [hx,hy]=diceSpawn(GIRL_SEQ,'crimson_dice_barrage',e.dir);M.enemyShots.push({kind:'dice',girl:1,x:e.x+hx,y:SQF+hy,vx:e.dir*(2+(i&1)*.9),vy:i&1?-3.2:-1.6,damage:2});sfx('shot');}
  if(t>30+e.roll*EV+30)return true;},
 // sugar rain: hops up, sweeping columns of falling candy with one open lane that moves
 gSugarRain(e,t,r){if(t===1){e.lift=0;sfx('swoosh');}if(t<20){e.lift=t*3;e.pose='jump';return;}e.pose='telegraph';
  const W=6,LW=72,base=40,EV=r?40:48;for(let w=0;w<3;w++){const at=40+w*EV;if(t===at-30)e.safe=Math.max(0,Math.min(W-1,Math.floor((M.x-base)/LW)+(w%2?1:-1)));
   if(t>at-30&&t<at)for(let l=0;l<W;l++){const x=base+l*LW+LW/2;if(l===e.safe)kFx(e,{type:'sqsafe',x,w:LW,end:2});else sqCol(e,x,LW,t>at-10?'#ffffff':GIRL_COL);}
   if(t===at){sfx('shot');for(let l=0;l<W;l++)if(l!==e.safe)for(const dx of[-22,0,22])kb(e,{x:base+l*LW+LW/2+dx,y:40,vy:3.2,shape:'heart',col:'#ffb3d1',life:90});}}
  if(t>40+3*EV+10){e.lift=Math.max(0,e.lift-4);if(!e.lift)return true;}},
 // super: スウィート・オールイン — three rolls; odd = candy walls from both sides (jump / slide), even = smoke ring with a floor-side gap
 gAllIn(e,t,r){if(t===1){juiceCut('スウィート・オールイン',GIRL_COL,'ダイスロール（素顔）');fxSpawn(e,'aura',e.x,e.y,{follow:true,loop:260});e.rolls=[];}
  if(t<30){e.x+=(256-e.x)*.1;e.pose='telegraph';return;}
  for(let k=0;k<3;k++){const at=60+k*70;if(t===at-30){e.rolls[k]=1+Math.floor(Math.random()*6);sfx('start');fxSpawn(e,'roll_impact',e.x,e.y-70,{row:e.rolls[k]-1});}
   const n=e.rolls[k];if(t>at-30&&t<at+40&&n)kFx(e,{type:'die',x:e.x,y:e.y-70,n,end:2});
   if(n&&n%2===1){const hi=[0,1,0];for(let j=0;j<3;j++){const ft=at+j*14,y=hi[(j+k)%3]?233:250;if(t>ft-14&&t<ft)for(const s of[-1,1])kFx(e,{type:'line',x0:s<0?40:472,x1:s<0?120:392,y,col:t>ft-5?'#ffffff':GIRL_COL,end:2});
     if(t===ft){sfx('shot');for(const s of[-1,1])M.enemyShots.push({kind:'card',x:s<0?40:472,y,vx:s<0?2.6:-2.6,vy:0,damage:2});}}}
   else if(n){const cy=e.y-24,gap=1+(k*2)%5;if(t>at-26&&t<at){const ga=(gap+1)*Math.PI*2/14;kFx(e,{type:'seg',x0:e.x,y0:cy,x1:e.x+Math.cos(ga)*300,y1:cy+Math.sin(ga)*300,col:'#9fe8ff',end:2});kFx(e,{type:'sqsafe',x:girlClamp(e.x+(SQF-cy)/Math.tan(ga)),w:36,end:2});}
    if(t===at){juiceShake(3,10);sfx('song');for(let q=0;q<14;q++){if(q>=gap&&q<=gap+2)continue;const a=q*Math.PI*2/14;kb(e,{x:e.x,y:cy,vx:Math.cos(a)*1.5,vy:Math.sin(a)*1.5,shape:'bigorb',r:4,col:GIRL_SMOKE,life:220});}}}}
  if(t>60+3*70+30)return true;},
};
const GIRL_SEQ_N=['gCandyRush','gLoadedDice','gSmokeVeil','gLolliSpin','gSugarRain'],GIRL_SEQ_R=['gSmokeVeil','gCandyRush','gSugarRain','gLolliSpin','gLoadedDice','gCandyRush'];
function mansionDiceGirlAI(e){if(M.diceState!=='active')return;const rage=e.hp<=e.maxHp/2,t=++e.mt;mansionKeikoMovesUpdate(e);
 e.trail=(e.trail||[]).filter(p=>++p.age<12);
 // candy bombs blink then pop into four sweets
 for(const b of M.enemyShots)if(b.candyBomb&&b.kind==='kShot'){b.vx=0;b.vy=0;if(--b.candyBomb<=0){b.dead=true;mansionBurst(b.x,b.y,'#ffb3d1',6);for(let k=0;k<4;k++){const a=-Math.PI/2+(k-1.5)*.5;M.enemyShots.push({kind:'kShot',x:b.x,y:b.y,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.6,g:.08,damage:2,col:'#ffe0f0',shape:'star',r:3,life:120});}}}
 if(rage&&!e.raged){e.raged=true;e.cycle=0;juiceFlash(GIRL_COL,8);juiceShake(3,12);}
 if(e.mode==='walk'){e.y=SQF;girlFace(e);const d=Math.abs(M.x-e.x);if(d>110)e.x=girlClamp(e.x+e.dir*(rage?1.9:1.6));else if(d<60)e.x=girlClamp(e.x-e.dir*1.4);e.pose='move'+((e.t>>3)&1);
  if(t>=(rage?18:26)){if(rage&&!e.superDone){e.superDone=true;girlMode(e,'gAllIn');return;}const L=rage?GIRL_SEQ_R:GIRL_SEQ_N;girlMode(e,L[e.cycle++%L.length]);}return;}
 if(GIRL_MOVES[e.mode](e,t,rage)){e.lift=0;e.hidden=false;e.y=SQF;girlMode(e,'walk');}
 e.y=e.hidden?-999:SQF-(e.lift||0);}
// draw: sheet → fallback code art (white long hair, red eyes, checkered coat, lollipop)
function girlFallback(x,feet,dir,pose,t){const air=pose==='jump';g.save();g.translate(Math.round(x),Math.round(feet));if(dir<0)g.scale(-1,1);
 const bob=pose.startsWith('move')?((t>>3)&1):0,lean=pose==='attackB'?2:pose==='telegraph'?-1:0;
 mrect(-7,-14,6,14,'#1d1324');mrect(2,-14,6,14,'#1d1324');mrect(-7,-2,6,2,'#d8b06a');mrect(2,-2,6,2,'#d8b06a');
 for(let i=0;i<4;i++)for(let j=0;j<3;j++)mrect(-8+j*5+lean,-30+i*4-bob,5,4,(i+j)&1?'#f2eef6':'#2a1b33');mrect(-9+lean,-31-bob,18,2,'#b5223f');
 mrect(-10+lean,-44-bob,20,15,'#f4f2f8');mrect(-7+lean,-41-bob,14,10,'#f7d9cf');mrect(-4+lean,-37-bob,2,2,'#e01f3d');mrect(2+lean,-37-bob,2,2,'#e01f3d');mrect(-5+lean,-38-bob,4,1,'#2a1b33');mrect(1+lean,-38-bob,4,1,'#2a1b33');
 mrect(-11+lean,-44-bob,3,24,'#f4f2f8');mrect(8+lean,-44-bob,3,20,'#f4f2f8');mrect(1+lean,-33-bob,3,1,'#c06070');
 const hx=pose==='attackB'?14:pose==='telegraph'?10:8,hy=pose==='attackB'?-34:-26;mrect(lean+hx-1,hy-bob,1,8,'#ffffff');g.fillStyle='#ff6a9a';g.beginPath();g.arc(lean+hx-.5,hy-3-bob,3,0,7);g.fill();mrect(lean+hx-2,hy-4-bob,3,1,'#ffe27a');
 if(pose==='hurt'){g.globalAlpha=.5;mrect(-10,-44,20,44,'#ffffff');}g.restore();
 if(pose==='telegraph'){g.globalAlpha=.4;g.fillStyle=GIRL_SMOKE;g.beginPath();g.arc(x+dir*6,feet-46-((t>>2)%6),3+((t>>2)%3),0,7);g.fill();g.globalAlpha=1;}}
function mansionDiceGirlDraw(e){if(M.diceState==='active')mansionKeikoMovesDraw(e);if(e.hidden)return;let pose=e.flash>0&&e.mode==='walk'?'hurt':(e.pose||'idle0');if(pose==='move')pose='move'+((e.t>>3)&1);const feet=e.y;
 for(const p of e.trail||[]){g.globalAlpha=(1-p.age/12)*.3;if(!(GIRL_SEQ.img&&sheetDraw(GIRL_SEQ,'move0',p.x,p.y,e.dir)))girlFallback(p.x,p.y,e.dir,'move0',0);}g.globalAlpha=e.flash>0&&(e.flash&2)?.55:1;
 if(!(GIRL_SEQ.img&&sheetDraw(GIRL_SEQ,pose,e.x,feet,e.dir)))girlFallback(e.x,feet,e.dir,pose,e.t);g.globalAlpha=1;
 if(M.diceState==='active'){mrect(e.x-28,feet-66,56,5,'#160e27');mrect(e.x-27,feet-65,54*e.hp/e.maxHp,3,e.hp<=e.maxHp/2?'#ff3d7a':GIRL_COL);}}
{const baseAI=mansionDiceAI;mansionDiceAI=function(e){if(e.girl)return mansionDiceGirlAI(e);return baseAI(e);};}
{const baseD=mansionDiceDraw;mansionDiceDraw=function(e){if(e.girl)return mansionDiceGirlDraw(e);DICE_DRAW_E=e;try{baseD(e);}finally{DICE_DRAW_E=null;}};}
// ---------------- story flow ----------------
MANSION_PERMANENT_ITEMS.moonCandy={name:'月影の飴玉',hp:2,sources:['diceGirlReward']};
function mansionDiceRealReady(){return !!(M.flags.darkStyleUnlocked);}
{const base=mansionRoruTalk;mansionRoruTalk=function(){base();if(!M.talk)return;const L=M.talk.lines;L.pop();
 if(mansionDiceRealReady()&&!M.flags.diceGirlDefeated)L.push('おやおや……影を四つ、越えられましたか。','……ふう。もう、練習のふりはいいか。\n遊戯室においで、海音。\n今度は被り物なしで、相手してあげる。');
 else if(M.flags.diceGirlDefeated)L.push('おやおや……また遊戯室へ？\n紳士の練習でも、素顔の本番でも。お好きな方を。');
 else L.push('おやおや……腕試しはいかがですか？\n遊戯室で、まずは軽く練習しましょう。\n本番のお相手は、この館の謎がもう少し解けてから……。');};}
{const base=mansionDiceChallenge;mansionDiceChallenge=function(){if(M.room!=='bedroom'||!M.talk?.offerDice)return false;const real=mansionDiceRealReady()&&(!M.flags.diceGirlDefeated||M.diceRealNext);M.diceReal=real;M.diceRealNext=!M.diceRealNext;
 if(!base())return false;if(!real)return true;M.enemies=[mansionNewDiceGirl()];
 mansionTalkShow('ダイスロール（素顔）',['……ふう。被り物、外すね。暑いんだ、あれ。\n（棒付きの飴を、口にくわえ直す）','練習のときは、出目に任せてた。\n今日は違う。私が決める。','甘い匂いの煙、吸い込まないでね。\n……じゃ、始めよっか。'],'diceStart');M.talk.faces=['sigh','neutral','smirk'];return true;};}
{const base=mansionDiceStart;mansionDiceStart=function(){base();if(M.diceReal)M.enemies=[mansionNewDiceGirl()];};}
{const base=mansionDiceRetry;mansionDiceRetry=function(){if(!M.diceReal)return base();M.diceState='ready';M.enemyShots=[];M.shots=[];M.hp=mansionMaxHP();M.hurt=60;M.poseT=M.castT=M.stepT=0;
 mansionTalkShow('ダイスロール（素顔）',['……はい、そこまで。立てる？\n飴、ひとつあげる。いちご味。','もう一回やる？\n私は、何回でも付き合うけど。'],'diceStart');M.talk.faces=['annoyed','smirk'];};}
{const base=mansionDiceWin;mansionDiceWin=function(){if(!M.diceReal){base();if(M.talk&&M.talk.lines)M.talk.lines.splice(1,0,'……今宵の出目は、伏せたままにしておきましょう。\n本気の札は、また今度。');return;}
 const first=!M.flags.diceGirlDefeated;M.diceState='done';M.enemies=[];M.shots=[];M.enemyShots=[];M.poseT=M.castT=M.stepT=0;M.flags.diceGirlDefeated=true;if(first)M.flags.diceGirlReward=true;M.hp=mansionMaxHP();mansionBurst(256,220,GIRL_COL,18);mansionSave();
 const lines=['……はー。負けた負けた。\n本気でやって負けたの、久しぶり。','強くなったね、海音。\n……ちょっとだけ、嬉しい。'];if(first)lines.push('これ、あげる。月影の飴玉。\n舐めてると、ちょっとだけ頑張れるやつ。\n（最大HPが2増えた）');lines.push('……さ、被り物かぶるか。\nおやおや……紳士に戻る時間ですねえ。');mansionTalkShow('ダイスロール（素顔）',lines,'diceReturn');M.talk.faces=['sigh','smirk','neutral','neutral'];};}
{const base=mansionDiceReturn;mansionDiceReturn=function(){M.diceReal=false;return base();};}
// talk portrait for the girl: delivered face → talk pose crop → code face
{const base=mansionTalkPortrait;mansionTalkPortrait=function(){if(M.talk?.speaker!=='ダイスロール（素顔）')return base();const c=document.getElementById('mTalkPortrait'),p=c.getContext('2d');p.clearRect(0,0,96,96);c.setAttribute('aria-label','ダイスロール（素顔）');p.imageSmoothingEnabled=true;
 const ex=(M.talk.faces||[])[M.talk.index]||'neutral',tf=GIRL_TALK.by&&(GIRL_TALK.by[ex]||GIRL_TALK.by.neutral);if(tf){p.drawImage(GIRL_TALK.img,tf.rect[0]+166,tf.rect[1]+50,180,180,0,0,96,96);return;}if(GIRL_FACE){p.drawImage(GIRL_FACE,0,0,96,96);return;}
 p.fillStyle='#241830';p.fillRect(0,0,96,96);p.fillStyle='#f4f2f8';p.fillRect(14,8,68,80);p.fillStyle='#f7d9cf';p.fillRect(24,24,48,46);p.fillStyle='#f4f2f8';p.fillRect(20,14,56,16);p.fillStyle='#e01f3d';p.fillRect(32,44,8,6);p.fillRect(56,44,8,6);p.fillStyle='#2a1b33';p.fillRect(30,41,12,3);p.fillRect(54,41,12,3);p.fillStyle='#ffffff';p.fillRect(56,60,2,22);p.fillStyle='#ff6a9a';p.beginPath();p.arc(57,84,7,0,7);p.fill();};}

fxLoadSet('diceGirl','diceroll_girl_fx.json','diceroll_girl_');
{const base=mansionDiceBulletDraw;mansionDiceBulletDraw=function(b){if(b.girl&&b.kind==='dice'){const ef=fxOf({id:'diceGirl'},'red_dice');if(ef){b.age=(b.age||0)+1;fxDrawOne(ef,b.x,b.y,fxFrame(ef,b.age,1),b.vx<0?-1:1,0,.6,.6,0);return;}}base(b);};}
