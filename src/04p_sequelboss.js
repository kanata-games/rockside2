// =====================================================================
//  test.51: 青天 / ダイスロール / アスターテ signature moves (floor 256 arenas).
//  Each boss keeps its own AI; a special move takes over between normal turns.
//  All telegraphs come first; the bosses never explain how to dodge (STAGE_GUIDE §14) — only アスターテ teaches.
// =====================================================================
const SQF=256;
Object.assign(KEIKO_BOSSES,{seiten:{name:'青天',col:'#ff7fae',sub:'#fff0d0',pose:{},seq:[],rageSeq:[]},dice:{name:'ダイスロール',col:'#ffcc6f',sub:'#fff4de',pose:{},seq:[],rageSeq:[]},astarte:{name:'アスターテ',col:'#d1b3ff',sub:'#ffffff',pose:{},seq:[],rageSeq:[]}});
function sqMark(e,x,w,col,end=2){kFx(e,{type:'sqmark',x,w,col,end});}
function sqCol(e,x,w,col,end=2){kFx(e,{type:'sqcol',x,w,col,end});}
function sqWave(e,x,sp,col){for(const s of[1,-1])kb(e,{x:x+s*12,y:SQF-6,vx:s*sp,shape:'wave',col,life:200});fxSpawn(e,'shockwave',x,SQF);fxSpawn(e,'impact',x,SQF-8);}
function sqStart(e,m){e.sq=m;e.st=0;e.sqCount=0;}
function sqTouch(e,box,d){if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,box))mansionDamage(d,M.x<e.x?-1:1);}
const SQ_MOVES={
 // ---------------- 青天 ----------------
 sSkyPounce(e,t,r){if(t<=20){e.pose=2;e.y=SQF;if(t===1){e.dir=M.x<e.x?-1:1;sfx('warn');}kFx(e,{type:'glow',x:e.x,y:SQF-4,r:3+t/5,col:'#ff7fae',end:2});return;}
  if(t<=40){e.pose=3;e.y=SQF-(t-20)*15;if(t===21){sfx('swoosh');juiceShake(2,6);}return;}
  if(t<=70){e.y=-60;if(t<=54)e.tx=Math.max(KEIKO_L,Math.min(KEIKO_R,M.x));sqMark(e,e.tx,30,t>54?'#ffffff':'#ff7fae');if(!fxOf(e,'sky_beam'))sqCol(e,e.tx,24,'#ff7fae');else if(t===55)KFXL.push({ef:fxOf(e,'sky_beam'),x:e.tx,y:SQF,t:0,flip:1,sx:1,sy:2.8,row:0,loop:26});return;}
  if(t<=80){if(t===71)fxSpawn(e,'slash',e.tx,SQF-40,{rot:Math.PI/2,sx:.6,sy:.6});sqMark(e,e.tx,30,'#ffffff');e.x=e.tx;e.pose=4;e.y=Math.min(SQF,-60+(t-70)*32);sqTouch(e,[e.x-13,e.y-34,26,34],3);if(e.y>=SQF){e.y=SQF;}return;}
  if(t===81){e.y=SQF;e.pose=5;juiceShake(5,14);sfx('land');mansionBurst(e.x,SQF-3,'#ffaac5',14);sqWave(e,e.x,r?2.8:2.4,'#ff7fae');}
  if(t>(r?96:104))return true;},
 sHeartFan(e,t,r){e.y=SQF;if(t<=30){e.pose=6;if(t===1){e.dir=M.x<e.x?-1:1;sfx('warn');}for(let i=0;i<3;i++)kFx(e,{type:'glow',x:e.x+e.dir*(18+i*6),y:e.y-26-i*5,r:2,col:'#ffd4e0',end:2});return;}
  e.pose=7;const V=r?3:2;for(let v=0;v<V;v++){const at=31+v*30;if(t===at-14)e.aim=Math.atan2(M.y-14-(e.y-24),M.x-e.x);if(t>at-14&&t<at)kFx(e,{type:'seg',x0:e.x,y0:e.y-24,x1:e.x+Math.cos(e.aim)*160,y1:e.y-24+Math.sin(e.aim)*160,col:t>=at-6?'#ffffff':'#ff7fae',end:2});
   if(t===at){sfx('song');for(const k of[-2.2,-1.2,1.2,2.2]){const a=e.aim+k*.26;kb(e,{x:e.x+e.dir*10,y:e.y-24,vx:Math.cos(a)*1.9,vy:Math.sin(a)*1.9,shape:'heart',life:220});}}}
  if(t>31+V*30+20)return true;},
 sLullaby(e,t,r){ // super: ソラノコエ・ララバイ
  if(t===1){juiceCut('ソラノコエ・ララバイ','#ff7fae','青天');fxSpawn(e,'aura',e.x,e.y,{follow:true,loop:180});}
  if(t<=40){e.pose=6;e.x+=((KEIKO_L+KEIKO_R)/2-e.x)*.08;e.y=SQF-Math.min(56,t*1.6);return;}
  e.pose=7;const cy=e.y-24;for(let w=0;w<3;w++){const at=60+w*44,gap=[3,1,5][w];
   if(t>at-26&&t<at){const ga=(gap+1.5)*Math.PI*2/14;kFx(e,{type:'seg',x0:e.x,y0:cy,x1:e.x+Math.cos(ga)*300,y1:cy+Math.sin(ga)*300,col:'#9fe8ff',end:2});kFx(e,{type:'sqsafe',x:Math.max(KEIKO_L,Math.min(KEIKO_R,e.x+(SQF-cy)/Math.tan(ga))),w:36,end:2});}
   if(t===at){juiceShake(3,10);juiceFlash('#ff7fae',5);sfx('song');fxSpawn(e,'noteBurst',e.x,cy);for(let k=0;k<14;k++){if(k>=gap&&k<=gap+2)continue;const a=k*Math.PI*2/14;kb(e,{x:e.x,y:cy,vx:Math.cos(a)*1.6,vy:Math.sin(a)*1.6,shape:'note',life:260});}}}
  if(t>60+3*44+30){e.y=Math.min(SQF,e.y+3);if(e.y>=SQF)return true;}},
 // ---------------- ダイスロール ----------------
 dSlam(e,t,r){if(t<=24){e.anim='windup';if(t===1){e.dir=M.x<e.x?-1:1;e.jf=e.x;sfx('warn');}if(t<=16)e.jt=Math.max(KEIKO_L,Math.min(KEIKO_R,M.x));sqMark(e,e.jt,34,t>16?'#ffffff':'#ffcc6f');return;}
  if(t<=64){const k=(t-24)/40;e.anim='walk';e.x=e.jf+(e.jt-e.jf)*k;e.y=SQF-Math.sin(k*Math.PI)*100;sqMark(e,e.jt,34,'#ffffff');if(k>.5)sqTouch(e,[e.x-13,e.y-36,26,36],3);return;}
  if(t===65){e.y=SQF;e.anim='idle';juiceShake(5,14);sfx('land');mansionBurst(e.x,SQF-3,'#ffe2a0',14);sqWave(e,e.x,r?2.8:2.4,'#ffcc6f');fxSpawn(e,'roll_impact',e.x,SQF-20,{row:Math.floor(Math.random()*6)});for(const s of[-1,1])M.enemyShots.push({kind:'dice',x:e.x+s*8,y:SQF-30,vx:s*1.4,vy:-3,damage:2});}
  if(t>100)return true;},
 dCardWall(e,t,r){e.anim=t<30?'windup':'flickCards';e.y=SQF;if(t===1){e.dir=M.x<e.x?-1:1;e.pat=[];for(let i=0;i<5;i++)e.pat.push((i+(r?1:0))&1);sfx('warn');}
  const N=5,EV=r?24:28;if(t<30){e.pat.forEach((hi,i)=>kFx(e,{type:'glow',x:e.x+e.dir*(22+i*7),y:hi?233:250,r:2,col:hi?'#c99aff':'#ffcc6f',end:2}));return;}
  for(let i=0;i<N;i++){const at=30+i*EV,hi=e.pat[i];if(t>at-16&&t<at)kFx(e,{type:'line',x0:e.x,x1:e.x+e.dir*140,y:hi?233:250,col:t>=at-6?'#ffffff':hi?'#c99aff':'#ffcc6f',end:2});
   if(t===at){fxSpawn(e,'slash',e.x+e.dir*20,SQF-20,{flip:e.dir,sx:.5,sy:.5});M.enemyShots.push({kind:'card',x:e.x+e.dir*22,y:hi?233:250,vx:e.dir*2.7,vy:0,damage:2});sfx('shot');}}
  if(t>30+N*EV+40)return true;},
 dJackpot(e,t,r){ // super: ジャックポット・ナイト
  if(e.faces)for(let k=0;k<3;k++)kFx(e,{type:'die',x:(KEIKO_L+KEIKO_R)/2+(k-1)*56,y:100,n:e.faces[k]||1+((t>>2)+k)%6,rolling:!e.faces[k],end:2});
  if(t===1){juiceCut('ジャックポット・ナイト','#ffcc6f','ダイスロール');fxSpawn(e,'aura',e.x,e.y,{follow:true,loop:120});e.faces=[0,0,0];}
  e.anim=t<100?'windup':'throwDice';e.y=SQF;
  for(let k=0;k<3;k++){if(t===50+k*16){e.faces[k]=1+Math.floor(Math.random()*6);sfx('start');juiceShake(2,4);fxSpawn(e,'roll_impact',(KEIKO_L+KEIKO_R)/2+(k-1)*56,100,{row:e.faces[k]-1,sx:.7,sy:.7});}}
  for(let k=0;k<3;k++){const at=110+k*56;if(t===at-40){const LW=(KEIKO_R-KEIKO_L)/4,pl=Math.floor((Math.max(KEIKO_L,Math.min(KEIKO_R-1,M.x))-KEIKO_L)/LW);e.safe=Math.max(0,Math.min(3,pl+((e.faces[k]%3)-1)));}
   if(t>at-40&&t<at)for(let l=0;l<4;l++){const LW=(KEIKO_R-KEIKO_L)/4,x=KEIKO_L+l*LW+LW/2;if(l===e.safe)kFx(e,{type:'sqsafe',x,w:LW,end:2});else sqCol(e,x,LW,t>=at-12?'#ffffff':'#ffad42');}
   if(t===at){sfx('shot');for(let l=0;l<4;l++)if(l!==e.safe)for(const dx of[-16,0,16])M.enemyShots.push({kind:'chip',x:KEIKO_L+l*(KEIKO_R-KEIKO_L)/4+(KEIKO_R-KEIKO_L)/8+dx,y:96,vx:0,vy:3,damage:2});}}
  if(t>110+3*56+40)return true;},
 // ---------------- アスターテ (tutorial: slow, every attack shown long before) ----------------
 aCrescentTrio(e,t,r){e.y=SQF;e.pose=15;if(t===1){e.dir=M.x<e.x?-1:1;e.pat=[0,1,0];sfx('warn');fxSpawn(e,'aura',e.x,SQF,{follow:true,loop:150});}
  for(let i=0;i<3;i++){const at=36+i*40,hi=e.pat[i];if(t>at-30&&t<at)kFx(e,{type:'glow',x:e.x+e.dir*26,y:SQF-(hi?24:10),r:3+(t-at+30)/8,col:hi?'#9fe8ff':'#d1b3ff',end:2});
   if(t===at){fxSpawn(e,'impact',e.x+e.dir*26,SQF-(hi?24:10),{sx:.7,sy:.7});M.enemyShots.push({kind:'crescent',x:e.x+e.dir*26,y:SQF-(hi?24:10),vx:e.dir*2.1,vy:0});sfx('shot');juiceShake(1,4);}}
  if(t>36+3*40+20)return true;},
 aMoonDrop(e,t,r){e.y=SQF;e.pose=t<20?8:15;if(t===1){e.dir=M.x<e.x?-1:1;sfx('warn');e.drops=[];}
  for(let i=0;i<3;i++){const at=20+i*56;if(t===at){const x=Math.max(KEIKO_L,Math.min(KEIKO_R,M.x+[0,-8,8][i]));e.drops.push(x);fxSpawn(e,'impact',x,105,{sx:.6,sy:.6});M.enemyShots.push({kind:'star',x,y:105,vx:0,vy:2.3});sfx('tink');}}
  for(const x of e.drops)sqMark(e,x,22,'#d1b3ff');
  if(t>20+3*56+60)return true;},
};
const SQ_POSE_SEQ={seiten:['sSkyPounce','sHeartFan'],dice:['dSlam','dCardWall'],astarte:['aCrescentTrio','aMoonDrop']};
const SQ_SUPER={seiten:'sLullaby',dice:'dJackpot'};
function sqRun(e,rage){e.st++;mansionKeikoMovesUpdate(e);const done=SQ_MOVES[e.sq](e,e.st,rage);if(done){e.sq=null;return false;}return true;}
function sqPick(e,rage){if(rage&&SQ_SUPER[e.id]&&!e.superDone){e.superDone=true;return SQ_SUPER[e.id];}const L=SQ_POSE_SEQ[e.id];return L[(e.sqN=(e.sqN||0)+1)%L.length];}
// ---- 青天: a special after every two normal turns
const mansionSeitenAIBase=mansionSeitenAI;
mansionSeitenAI=function(e){if(M.seitenState!=='active')return mansionSeitenAIBase(e);e.id='seiten';const rage=e.hp<=e.maxHp/2;
 if(e.sq){e.mode='sq';e.trail=(e.trail||[]).filter(p=>++p.age<14);if(e.st%3===0&&e.y<SQF)e.trail.push({x:e.x,y:e.y,pose:e.pose,dir:e.dir,age:0});if(sqRun(e,rage))return;e.y=SQF;mansionSeitenMode(e,'recover');return;}
 mansionKeikoMovesUpdate(e);const was=e.mode;mansionSeitenAIBase(e);
 if(e.mode==='idle'&&was!=='idle'){e.turns=(e.turns||0)+1;if(e.turns>=2||(rage&&!e.superDone)){e.turns=0;sqStart(e,sqPick(e,rage));}}};
// ---- ダイスロール & アスターテ: phase-clock AIs; the special runs at phase 0 of every other cycle and freezes the clock
function sqPhaseWrap(base,id,activeKey){return function(e){if(M[activeKey]!=='active')return base(e);e.id=id;const rage=e.hp<=e.maxHp/2;
 if(e.sq){e.t--;if(sqRun(e,rage))return;e.y=SQF;e.sqAt=e.t;return;}
 mansionKeikoMovesUpdate(e);
 if(e.t%360===0&&e.t>0&&e.sqAt!==e.t){e.cyc=(e.cyc||0)+1;if(e.cyc%2===1||(rage&&SQ_SUPER[id]&&!e.superDone)){sqStart(e,sqPick(e,rage));e.t--;return;}}
 base(e);};}
mansionDiceAI=sqPhaseWrap(mansionDiceAI,'dice','diceState');
mansionAstarteAI=sqPhaseWrap(mansionAstarteAI,'astarte','sparState');
// test.56 one-screen arena: アスターテ keeps her distance (backs off when crowded) and her body hurts on touch like every other boss
{const base=mansionAstarteAI;mansionAstarteAI=function(e){base(e);if(M.sparState!=='active'||e.sq||e.striking)return;const d=M.x-e.x;if(Math.abs(d)<56){const away=d>0?-1:1,nx=Math.max(KEIKO_L,Math.min(KEIKO_R,e.x+away*1.4));if(nx===e.x&&Math.abs(d)<30)e.x=Math.max(KEIKO_L,Math.min(KEIKO_R,e.x-away*2.2));else e.x=nx;}
 if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.x-11,e.y-34,22,34]))mansionDamage(2,M.x<e.x?-1:1);};}
// ---- draw: telegraphs/bullets fx on top of each boss
for(const [fn,key] of [['mansionSeitenBossDraw','seitenState'],['mansionDiceDraw','diceState']]){const base=globalThis[fn]||window[fn];if(typeof base!=='function')continue;const w=function(e){if(e.id&&M[key]==='active'){if(e.sq&&e.y<-20){mansionKeikoMovesDraw(e);return;}base(e);mansionKeikoMovesDraw(e);}else base(e);};globalThis[fn]=w;}
// room change / fight start clears leftover juice (hit-stop, shake, cut-in)
{const base=mansionEnter;mansionEnter=function(...a){KJ.stop=0;KJ.shakeT=0;KJ.cut=null;KJ.flashT=0;return base.apply(this,a);};}
{const base=mansionSparStart;mansionSparStart=function(...a){KJ.stop=0;return base.apply(this,a);};}
