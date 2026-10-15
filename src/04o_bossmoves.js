
// =====================================================================
//  test.49: boss move sets + juice.
//  Impostors mimic the first game's DARK versions (04_game.js aiTobiume / aiNeenia / aiLily, 04b aiDisaster):
//   ハネウメ = 闇飛梅 (hovers; aimed fan, diagonal dive, tracking drop-kick)
//   ネムニア = 闇ネーニア (keeps distance; leading aim-line arrow, lobbed marked arrows, backstep/vault + volley, ricochet, quick-draw counter)
//   リリリ  = 闇リリィ (idol; wobbling song wave, hop-back hearts, moon float notes, swaying starlight rain)
//   ズターさん = 闇ディザスター (alchemy morphs; + thrown spear on a locking aim line, whip-sword lash, cannon-lance orb)
//  Shades get brand-new weapon move sets with windups, body moves (lunges/flight/warps) and one named super (cut-in).
//  Fairness: every hazard shows its line / mark / column first (lock ≥ 14f before it can hurt).
// =====================================================================
const KJ={shakeT:0,shakeA:0,flashT:0,flashC:'#fff',flashMax:1,stop:0,cut:null};
function juiceShake(a,t){KJ.shakeA=Math.max(KJ.shakeT>0?KJ.shakeA:0,a);KJ.shakeT=Math.max(KJ.shakeT,t);}
function juiceFlash(c,t){KJ.flashC=c;KJ.flashT=KJ.flashMax=t;}
function juiceStop(n){KJ.stop=Math.max(KJ.stop,n);}
// test.52: Persona-style 'カッ！' cut-in — a small slanted strip in the top-right corner (y 18..48, top 20% of the screen),
// eyes crop of the delivered cut-in art + move name. Snaps in (4f), holds, slides out; 44 frames ≈ 0.73s. No freeze, no full-screen band.
const CUT_FACE={vesper:[256,72],lavis:[232,62],nocturne:[256,70],eclipse:[256,76],hoshi:[400,92],seiten:[395,195],dice:[385,170],diceGirl:[272,200]};
const CUT_LEN=44,CUT_IN=4,CUT_OUT=8,CUT_Y=18,CUT_H=30,CUT_W=150;
function juiceCut(name,col,sub){const e=M.enemies&&M.enemies.find(e=>e.id&&e.hp>0);KJ.cut={name,col,sub:sub||'',t:0,id:e&&e.id,img:(SHADE_FX[e&&e.id]||{}).cutin?.img||null};juiceStop(2);sfx('warn');}
function juiceCutBox(c){const _=0;const t=c.t,k=t<CUT_IN?1-t/CUT_IN:t>CUT_LEN-CUT_OUT?(t-(CUT_LEN-CUT_OUT))/CUT_OUT:0,ease=k*k;return{x0:VW-CUT_W-12+Math.round(ease*(CUT_W+24)),y0:CUT_Y,w:CUT_W,h:CUT_H};}
function mansionJuiceStop(){if(KJ.shakeT>0)KJ.shakeT--;if(KJ.flashT>0)KJ.flashT--;if(KJ.cut&&++KJ.cut.t>CUT_LEN)KJ.cut=null;if(KJ.stop>0){KJ.stop--;return true;}return false;}
function mansionJuiceShakeApply(){if(KJ.shakeT>0){const a=KJ.shakeA*Math.min(1,KJ.shakeT/8);g.translate(Math.round((artH(M.t,1)%100/50-1)*a),Math.round((artH(M.t,2)%100/50-1)*a));}}
function mansionJuiceDraw(){g.save();g.setTransform(1,0,0,1,0,0);
 if(KJ.flashT>0){g.globalAlpha=.55*KJ.flashT/KJ.flashMax;g.fillStyle=KJ.flashC;g.fillRect(0,0,VW,VH);g.globalAlpha=1;}
 g.restore();}

const JUICE_BOSS_KINDS=['keikoBoss','hoshiBoss','boss','seitenBoss','diceBoss'];
function mansionJuiceHit(e,shot){if(!JUICE_BOSS_KINDS.includes(e.kind))return;juiceStop(2);if(e.id)fxSpawn(e,'impact',shot.x,shot.y,{sx:.6,sy:.6});for(let i=0;i<5;i++)M.particles?.push?.({x:shot.x,y:shot.y,vx:(i-2)*.9,vy:-1-(i&1),life:14,col:'#ffffff'});mansionBurst(shot.x,shot.y,KEIKO_BOSSES[e.id]?.col||'#ffd',5);if(e.hp<=0){juiceStop(18);juiceShake(5,30);juiceFlash('#ffffff',16);}}
function mansionJuicePlayerHurt(){if(mansionKeikoActive()||M.hoshiState==='active'||M.sparState==='active'||M.seitenState==='active'||M.diceState==='active'){juiceStop(5);juiceShake(3,10);juiceFlash('#ff3050',6);}}
// ---- helpers
const KF=KEIKO_FLOOR,KTOP=20;
function kb(e,o){const B=KEIKO_BOSSES[e.id];const s={kind:'kShot',x:o.x,y:o.y,vx:o.vx||0,vy:o.vy||0,damage:o.dmg||2,low:o.y>KF-12,col:o.col||B.col,shape:o.shape||'orb',r:o.r||3,g:o.g||0,life:o.life||400,...o.extra};M.enemyShots.push(s);return s;}
function kAim(e,tx,ty,sp,o={}){const y0=o.y0??(e.y-(e.lift||0)-24),x0=o.x0??e.x+e.face*12,a=Math.atan2(ty-y0,tx-x0);return kb(e,{x:x0,y:y0,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,...o});}
function kFx(e,f){(e.fx||(e.fx=[])).push({t:0,...f});}
function kFaceP(e){e.face=Math.sign(M.x-e.x)||e.face;}
function kEnd(e){e.hidden=false;e.y=KF;mansionKeikoMode(e,'walk');}
function kHide(e,on){e.hidden=on;e.y=on?-999:KF;}
function kClampX(x){return Math.max(KEIKO_L+12,Math.min(KEIKO_R-12,x));}
function kPHit(box){return mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,box);}
function kShock(e,x,sp,col){for(const s of[1,-1])kb(e,{x:x+s*12,y:KF-6,vx:s*sp,shape:'wave',col});}
function kRage(e){return e.hp<=e.maxHp/2;}
// ---- the moves. each: f(e,B,t,rage) ; optional pose(e,B) ; draw handled by e.fx / e.beams
const KEIKO_MOVES={
 // ===== ハネウメ / 闇飛梅 =====
 hFan(e,B,t,r){const W=34,vol=r?2:1;e.lift+=(70-e.lift)*.1;kFaceP(e);e.x+=(Math.max(KEIKO_L+40,Math.min(KEIKO_R-40,M.x-e.face*150))-e.x)*.02;
  if(t%30===4&&t<W)kFx(e,{type:'glow',x:e.x,y:e.y-e.lift-26,end:W-t+2,col:B.col});
  for(let v=0;v<vol;v++)if(t===W+v*34){const n=r?5:3;for(let k=0;k<n;k++){const y0=e.y-e.lift-24,a=Math.atan2(M.y-14-y0,M.x-e.x)+(k-(n-1)/2)*.2;kb(e,{x:e.x+e.face*10,y:y0,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,shape:'heart'});}sfx('shot');}
  if(t>W+vol*34+16)mansionKeikoMode(e,'walk');},
 hDive(e,B,t,r){const TELE=r?34:42;if(t===1){e.sx=e.x;}
  if(t<=TELE){e.lift+=(84-e.lift)*.12;kFaceP(e);if(t<TELE-12){e.tx=kClampX(M.x);}if(t===TELE-12)sfx('tink');e.diveLine={x0:e.x,y0:e.y-e.lift-20,x1:e.tx,y1:KF-8,lock:t>=TELE-12};}
  else{const sp=r?6.4:5.6,dx=e.tx-e.x,dy=-e.lift;const len=Math.hypot(dx,(e.lift))||1;e.x+=dx/len*sp;e.lift=Math.max(0,e.lift-e.lift/len*sp);e.face=Math.sign(dx)||e.face;e.diveLine=null;
   if(e.lift<=1||Math.abs(dx)<3&&e.lift<4){e.lift=0;if(!e.landed){e.landed=t;juiceShake(3,10);mansionBurst(e.x,KF-4,B.col,10);sfx('hit');if(r)kShock(e,e.x,2.4,B.col);}}}
  if(e.landed&&t>e.landed+30){e.landed=0;mansionKeikoMode(e,'walk');}if(t>400)mansionKeikoMode(e,'walk');},
 hKick(e,B,t,r){const AIM=r?40:50,HOLD=14;if(t===1)e.lift=Math.max(e.lift,60);
  if(t<AIM){e.lift+=(120-e.lift)*.08;e.x+=Math.max(-3,Math.min(3,M.x-e.x));kFaceP(e);kFx(e,{type:'ring',x:e.x,end:2,col:'#ff6a9a'});}
  else if(t<AIM+HOLD){kFx(e,{type:'ring',x:e.x,end:2,col:(t&2)?'#ffffff':'#ff6a9a'});if(t===AIM)sfx('tink');}
  else if(e.lift>0){e.lift=Math.max(0,e.lift-9);if(!e.lift){juiceShake(5,14);sfx('hit');mansionBurst(e.x,KF-4,B.col,14);kShock(e,e.x,r?3:2.6,B.col);e.landed=t;}}
  if(e.landed&&t>e.landed+34){e.landed=0;mansionKeikoMode(e,'walk');}},
 // ===== ネムニア / 闇ネーニア =====
 nAim(e,B,t,r){const n=r?3:2,AT=36,EV=26;kFaceP(e);
  for(let i=0;i<n;i++){const fire=AT+i*EV;if(t>fire-22&&t<fire){const lead=Math.min(30,Math.abs(M.x-e.x)/4.4);e.aimX=kClampX(M.x+M.vx*lead);e.aimY=M.y-14;e.aimLine={x0:e.x+e.face*12,y0:KF-24,x1:e.aimX,y1:e.aimY,lock:t>fire-10};if(t<=fire-10){}}
   if(t===fire-10)sfx('tink');if(t===fire){kAim(e,e.aimX,e.aimY,4.4,{shape:'arrow',y0:KF-24});e.aimLine=null;}}
  if(t>AT+(n-1)*EV+24)mansionKeikoMode(e,'walk');},
 nLob(e,B,t,r){const n=r?5:4,EV=r?16:20,W=30,AIR=46,G=.16;kFaceP(e);if(t<W&&t%3===0)mansionBurst(e.x+e.face*8,KF-40,'#ff9ad0',1);
  for(let i=0;i<n;i++)if(t===W+i*EV){const tx=kClampX(M.x+M.vx*AIR*.6),x0=e.x+e.face*10,y0=KF-30,vx=(tx-x0)/AIR,vy=((KF-4)-y0-G*AIR*(AIR+1)/2)/AIR;kb(e,{x:x0,y:y0,vx,vy,g:G,shape:'arrowDown',extra:{lob:true}});kFx(e,{type:'mark',x:tx,w:18,end:AIR+2,col:'#ff6a6a'});sfx('shot');}
  if(t>W+(n-1)*EV+AIR+10)mansionKeikoMode(e,'walk');},
 nBack(e,B,t,r){if(t===1){kFaceP(e);const away=-e.face,room=away>0?KEIKO_R-e.x:e.x-KEIKO_L;e.vx=room<60?e.face*3.2:away*2.6;e.vy=room<60?-6:-4.2;e.air=0;sfx('jump');}
  if(t<60&&e.vy!=null){e.air-=e.vy;e.vy+=.28;e.x+=e.vx;e.lift=Math.max(0,e.air);if(e.air<=0&&t>3){e.lift=0;e.vy=null;e.vt=t;mansionBurst(e.x,KF-2,'#ccc',5);}}
  if(e.vt){kFaceP(e);const at=e.vt+22,vol=r?2:1;for(let v=0;v<vol;v++)if(t===at+v*28){for(const k of[-1,0,1]){const a=Math.atan2(M.y-14-(KF-24),M.x-e.x)+k*.26;kb(e,{x:e.x+e.face*10,y:KF-24,vx:Math.cos(a)*3.4,vy:Math.sin(a)*3.4,shape:'arrow'});}sfx('shot');}
   if(t===e.vt+8)kFx(e,{type:'glow',x:e.x+e.face*10,y:KF-24,end:14,col:'#fff'});
   if(t>at+vol*28+16){e.vt=0;mansionKeikoMode(e,'walk');}}
  if(t>300)mansionKeikoMode(e,'walk');},
 nRico(e,B,t,r){const n=r?2:1,AIM=46,EV=40,LOCK=16;
  for(let i=0;i<n;i++){const at=AIM+i*EV;if(t>at-34&&t<at){if(t<at-LOCK){kFaceP(e);const ty=2*KTOP-(M.y-14);e.ricoA=Math.atan2(ty-(KF-24),M.x-e.x);}if(t===at-LOCK)sfx('tink');e.rico={pts:kRicoPath(e.x+e.face*12,KF-24,e.ricoA,2),lock:t>=at-LOCK};}
   if(t===at){kb(e,{x:e.x+e.face*12,y:KF-24,vx:Math.cos(e.ricoA)*4.2,vy:Math.sin(e.ricoA)*4.2,shape:'arrow',extra:{bnc:2}});e.rico=null;sfx('shot');}}
  if(t>AIM+(n-1)*EV+60)mansionKeikoMode(e,'walk');},
 // ===== リリリ / 闇リリィ =====
 lSong(e,B,t,r){const W=r?30:36,n=r?2:1;kFaceP(e);if(t<W&&t%4===0)kFx(e,{type:'glow',x:e.x+e.face*10,y:KF-30,end:4,col:'#ff4a6a'});
  for(let i=0;i<n;i++)if(t===W+i*22){kb(e,{x:e.x+e.face*14,y:KF-10,vx:e.face*(r?2.3:2),shape:'wave',extra:{wob:4,base:KF-10,ph:i*Math.PI,low:true}});sfx('tink');juiceShake(1,6);}
  if(t>W+n*22+20)mansionKeikoMode(e,'walk');},
 lHearts(e,B,t,r){if(t===1){kFaceP(e);e.vx=-e.face*(r?1.9:1.55);e.vy=-3.9;e.air=0;}
  if(e.vy!=null){e.air-=e.vy;e.vy+=.2;e.x+=e.vx;e.vx*=.97;e.lift=Math.max(0,e.air);if(e.air<=0&&t>4){e.lift=0;e.vy=null;}}
  if((r?[12,26,40]:[14,30,46]).includes(t)){const y0=e.y-e.lift-24;kAim(e,M.x,M.y-14,2.2,{y0,x0:e.x,shape:'heart'});sfx('shot');}
  if(t>70)mansionKeikoMode(e,'walk');},
 lMoon(e,B,t,r){kFaceP(e);e.lift+=((t<70?34:0)-e.lift)*.18;const shots=r?[30,46,62,78]:[34,54,74];const k=shots.indexOf(t);
  if(k>=0){const low=k&1;kb(e,{x:e.x+e.face*12,y:low?KF-6:KF-20,vx:e.face*(r?2.6:2.3),shape:'note'});sfx('tink');}
  if(t>shots[0]-20&&t<shots[0])kFx(e,{type:'glow',x:e.x,y:e.y-e.lift-40,end:2,col:'#fff1b8'});
  if(t>100){e.lift=0;mansionKeikoMode(e,'walk');}},
 lStars(e,B,t,r){const W=30,n=r?10:7,EV=r?8:10;if(t===1)e.seed=(e.seed||0)+3;
  if(t<W)kFx(e,{type:'glow',x:e.x,y:KF-50,end:2,col:'#ffe27a'});
  for(let k=0;k<n;k++)if(t===W+k*EV){const lane=(k*3+e.seed)%7,bx=KEIKO_L+(lane+.5)*(KEIKO_R-KEIKO_L)/7;kFx(e,{type:'col',x:bx,w:16,end:26,col:'#ffe27a'});e.pend=(e.pend||[]);e.pend.push({at:t+26,x:bx});}
  for(const p of e.pend||[])if(p.at===t){kb(e,{x:p.x,y:KTOP+8,vy:1.9,shape:'star',extra:{sway:6,bx:p.x,kRain:true}});}
  if(t>W+n*EV+150){e.pend=[];mansionKeikoMode(e,'walk');}},
 // ===== ズターさん / 闇ディザスター additions =====
 dSpear(e,B,t,r){const AIM=40,LOCK=16,n=r?2:1;for(let i=0;i<n;i++){const at=AIM+i*36;if(t>at-30&&t<at){if(t<at-LOCK){kFaceP(e);e.aimX=M.x;e.aimY=M.y-14;}if(t===at-LOCK)sfx('tink');e.aimLine={x0:e.x+e.face*12,y0:KF-26,x1:e.aimX,y1:e.aimY,lock:t>=at-LOCK,long:true};}
  if(t===at){kAim(e,e.aimX,e.aimY,5.2,{shape:'spear',y0:KF-26});e.aimLine=null;juiceShake(1,4);}}
  if(t>AIM+(n-1)*36+26)mansionKeikoMode(e,'walk');},
 dWhip(e,B,t,r){const W=r?34:40,REACH=150,OUT=16,BACK=16;kFaceP(e);if(t===1)e.wf=e.face;
  if(t<W)kFx(e,{type:'line',x0:e.x,x1:e.x+e.wf*REACH,y:KF-2,end:2,col:(t>>2)&1?'#ff6ab0':'#ffffff'});
  else if(t<W+OUT+BACK){const q=t<W+OUT?(t-W)/OUT:1-(t-W-OUT)/BACK,x1=e.x+e.wf*REACH*q;e.beams=[{x0:Math.min(e.x,x1),x1:Math.max(e.x,x1),y:KF-10,h:8,col:'#ff6ab0'}];if(t===W)sfx('swing');}
  else{e.beams=[];if(r&&!e.rep){e.rep=1;e.mt=W-14;}else if(t>W+OUT+BACK+20){e.rep=0;mansionKeikoMode(e,'walk');}}},
 dLance(e,B,t,r){const CH=r?36:44,LOCK=14;if(t<CH-LOCK){kFaceP(e);e.aimX=M.x;}
  if(t<CH){kFx(e,{type:'glow',x:e.x+e.face*16,y:KF-24,end:2,col:'#b070ff',r:2+t/6});e.aimLine={x0:e.x+e.face*16,y0:KF-24,x1:e.aimX,y1:KF-4,lock:t>=CH-LOCK};if(t===CH-LOCK)sfx('tink');}
  if(t===CH){e.aimLine=null;const o=kAim(e,e.aimX,KF-4,3.4,{x0:e.x+e.face*16,y0:KF-24,shape:'bigorb',r:6,extra:{burst:true}});juiceShake(2,6);sfx('shot');}
  if(t>CH+70)mansionKeikoMode(e,'walk');},
 // ===== 黄昏翼ヴェスパー (dark orb / dive kick, flight) =====
 vOrb(e,B,t,r){const CH=48;e.lift+=(80-e.lift)*.08;kFaceP(e);if(t<CH){kFx(e,{type:'glow',x:e.x+e.face*14,y:e.y-e.lift-24,end:2,col:'#8a3aff',r:2+t/5});if(t%6===0)mansionBurst(e.x+e.face*14,e.y-e.lift-24,'#b070ff',2);}
  if(t===CH){kAim(e,M.x,M.y-14,1.9,{x0:e.x+e.face*14,y0:e.y-e.lift-24,shape:'bigorb',r:8,extra:{split:r?8:6,splitAt:56}});juiceShake(2,8);sfx('shot');}
  if(t>CH+90)mansionKeikoMode(e,'walk');},
 vWarpKick(e,B,t,r){const n=r?3:2,EV=58,FADE=10,AIM=30;const i=Math.floor((t-1)/EV),lt=(t-1)%EV;
  if(i>=n){kHide(e,false);e.lift=0;if(t>n*EV+24)mansionKeikoMode(e,'walk');return;}
  if(lt===0){kHide(e,false);mansionBurst(e.x,e.y-30,'#8a3aff',10);}
  if(lt===FADE){kHide(e,true);e.wx=kClampX(M.x+(i%2?24:-24));sfx('tink');}
  if(lt>FADE&&lt<FADE+AIM)kFx(e,{type:'ring',x:e.wx,end:2,col:lt>FADE+AIM-14?'#ffffff':'#b070ff'});
  if(lt===FADE+AIM){kHide(e,false);e.x=e.wx;e.lift=110;kFaceP(e);}
  if(lt>FADE+AIM&&e.lift>0){e.lift=Math.max(0,e.lift-12);if(!e.lift){juiceShake(5,12);juiceStop(3);sfx('hit');mansionBurst(e.x,KF-4,'#b070ff',14);kShock(e,e.x,r?3.2:2.8,'#b070ff');}}},
 vMeteor(e,B,t,r){ // super: トワイライト・メテオ
  if(t===1){juiceCut('トワイライト・メテオ',B.col,'黄昏翼ヴェスパー');e.metX=[];const n=5;for(let k=0;k<n;k++)e.metX.push(kClampX(KEIKO_L+40+((k*2+1)%n)*(KEIKO_R-KEIKO_L-80)/(n-1)));}
  if(t<30){e.lift+=6;if(t===29)kHide(e,true);return;}
  const k=Math.floor((t-30)/34),lt=(t-30)%34;if(k>=e.metX.length){if(t===30+e.metX.length*34){kHide(e,false);e.x=256;e.lift=0;juiceShake(3,8);}if(t>30+e.metX.length*34+30)kEnd(e);return;}
  const x=k===e.metX.length-1?kClampX(M.x):e.metX[k];if(lt===0)e.mx=x;
  if(lt<24)kFx(e,{type:'col',x:e.mx,w:30,end:2,col:lt>12?'#ffffff':'#ff6a9a'});
  if(lt===24){for(let q=0;q<4;q++)kb(e,{x:e.mx-9+q*6,y:KTOP,vy:7,shape:'bigorb',r:5,extra:{meteor:true,kRain:true}});}
  if(lt===27){juiceShake(4,8);sfx('hit');}},
 // ===== 霧弓ラヴィス (forward / upward bow) =====
 lvPierce(e,B,t,r){const n=r?3:2,EV=44,W=36;kFaceP(e);
  for(let i=0;i<n;i++){const at=W+i*EV,high=(i+(e.cycle||0))%2===0;if(t===at-W+1||(i>0&&t===at-30))e.ph=high;if(t>at-30&&t<at)kFx(e,{type:'line',x0:KEIKO_L-8,x1:KEIKO_R+8,y:high?KF-20:KF-6,end:2,col:t>at-14?'#ffffff':'#7fa8ff',thick:t>at-14?2:1});
   if(t===at-14)sfx('tink');if(t>=at&&t<at+8){e.beams=[{x0:KEIKO_L-8,x1:KEIKO_R+8,y:e.ph?KF-23:KF-9,h:6,col:'#bcd4ff'}];if(t===at){juiceShake(2,6);juiceFlash('#a0c0ff',4);sfx('shot');}}if(t===at+8)e.beams=[];}
  if(t>W+(n-1)*EV+24)mansionKeikoMode(e,'walk');},
 lvSky(e,B,t,r){const W=26,n=r?4:3,LOCK=18,FALL=40;if(t<W&&t%3===0)mansionBurst(e.x+e.face*6,KF-50,'#bcd4ff',1);
  if(t===W){e.cols=[];for(let k=0;k<n;k++)e.cols.push(kClampX(k===0?M.x:KEIKO_L+20+artH(t+k,e.cycle||1)%(KEIKO_R-KEIKO_L-40)));sfx('shot');}
  if(t>W&&t<W+FALL){if(t<W+FALL-LOCK&&e.cols)e.cols[0]=kClampX(e.cols[0]+(M.x-e.cols[0])*.08);for(const x of e.cols||[])kFx(e,{type:'col',x,w:22,end:2,col:t>=W+FALL-LOCK?'#ffffff':'#7fa8ff'});}
  if(t===W+FALL)for(const x of e.cols)for(const q of[-6,0,6])kb(e,{x:x+q,y:KTOP,vy:6,shape:'arrowDown',extra:{kRain:true}});
  if(t>W+FALL+40)mansionKeikoMode(e,'walk');},
 lvMist(e,B,t,r){const F=14,AP=26;if(t===1){mansionBurst(e.x,e.y-20,'#c8d8ff',12);}
  if(t===F){kHide(e,true);e.wx=M.x<256?kClampX(M.x+150):kClampX(M.x-150);}
  if(t>F&&t<F+AP)kFx(e,{type:'mist',x:e.wx,end:2});
  if(t===F+AP){kHide(e,false);e.x=e.wx;kFaceP(e);mansionBurst(e.x,e.y-20,'#c8d8ff',12);}
  if(t===F+AP+16){for(const k of(r?[-2,-1,0,1,2]:[-1,0,1])){const a=Math.atan2(M.y-14-(KF-24),M.x-e.x)+k*.3;kb(e,{x:e.x+e.face*10,y:KF-24,vx:Math.cos(a)*3.2,vy:Math.sin(a)*3.2,shape:'arrow'});}sfx('shot');}
  if(t>F+AP+50)mansionKeikoMode(e,'walk');},
 lvHunt(e,B,t,r){ // super: ミストラル・ハント
  if(t===1)juiceCut('ミストラル・ハント',B.col,'霧弓ラヴィス');const EV=46,n=4,i=Math.floor((t-12)/EV),lt=(t-12)%EV;if(t<12)return;
  if(i>=n){kHide(e,false);if(t>12+n*EV+20)kEnd(e);return;}
  if(lt===0){kHide(e,true);const spots=[KEIKO_L+20,KEIKO_R-20,140,372];e.wx=spots[(i+(M.x<256?1:0))%4];}
  if(lt===8){kHide(e,false);e.x=e.wx;kFaceP(e);mansionBurst(e.x,e.y-20,'#c8d8ff',8);}
  if(lt>8&&lt<34){if(lt<20){e.aimX=M.x;e.aimY=M.y-14;}e.aimLine={x0:e.x+e.face*12,y0:KF-24,x1:e.aimX,y1:e.aimY,lock:lt>=20,long:true};if(lt===20)sfx('tink');}
  if(lt===34){e.aimLine=null;kAim(e,e.aimX,e.aimY,5.6,{y0:KF-24,shape:'arrow'});juiceShake(2,5);}},
 // ===== 夜想ノクターン (red sound wave mic / star spin) =====
 nScreech(e,B,t,r){const W=r?30:38,n=r?3:2;kFaceP(e);
  for(let i=0;i<n;i++){const at=W+i*30,high=i%2===0;if(t>at-24&&t<at)kFx(e,{type:'line',x0:e.x,x1:e.face>0?KEIKO_R+8:KEIKO_L-8,y:high?KF-20:KF-6,end:2,col:t>at-12?'#ffffff':'#ff4a6a'});
   if(t===at){for(let q=0;q<3;q++)kb(e,{x:e.x+e.face*(14+q*8),y:high?KF-20:KF-6,vx:e.face*3.2,shape:'ring',r:4,col:'#ff4a6a'});juiceShake(2,6);sfx('tink');}}
  if(t>W+(n-1)*30+30)mansionKeikoMode(e,'walk');},
 nSpin(e,B,t,r){const W=36,DUR=r?110:90,ARMS=r?4:3;if(t<W){kFx(e,{type:'glow',x:e.x,y:KF-28,end:2,col:'#ffe27a',r:3+t/6});}
  if(t>=W&&t<W+DUR&&t%6===0){const base=(t-W)*.045;for(let a=0;a<ARMS;a++){const ang=base+a*Math.PI*2/ARMS;kb(e,{x:e.x,y:KF-26,vx:Math.cos(ang)*1.7,vy:Math.sin(ang)*1.7,shape:'star',life:180});}if(t%18===0)sfx('tink');}
  if(t>W+DUR+30)mansionKeikoMode(e,'walk');},
 nDive(e,B,t,r){const UP=24,AIM=30;if(t<UP){e.lift+=6;}if(t===UP)kHide(e,true);
  if(t>UP&&t<UP+AIM){if(t<UP+AIM-14)e.wx=kClampX(M.x);kFx(e,{type:'ring',x:e.wx,end:2,col:t>=UP+AIM-14?'#ffffff':'#ff4a6a'});}
  if(t===UP+AIM){kHide(e,false);e.x=e.wx;e.lift=120;}
  if(t>UP+AIM&&e.lift>0){e.lift=Math.max(0,e.lift-12);if(!e.lift){juiceShake(5,12);sfx('hit');for(let q=0;q<2;q++)kShock(e,e.x,2.2+q*1.2,'#ff4a6a');}}
  if(t>UP+AIM+50)mansionKeikoMode(e,'walk');},
 nEncore(e,B,t,r){ // super: ミッドナイト・アンコール — sweeping stage-light columns with a dark gap, then a double wave
  if(t===1){juiceCut('ミッドナイト・アンコール',B.col,'夜想ノクターン');e.x=256;}
  const T0=20,DUR=180;if(t<T0)return;const lt=t-T0;
  if(lt<DUR){const gapC=256+Math.sin(lt*.022)*150,GW=56,on=lt>40;e.beams=[];const cols=[];for(let x=KEIKO_L;x<KEIKO_R;x+=48)if(Math.abs(x+24-gapC)>GW/2+24)cols.push(x);
   if(!on){for(const x of cols)kFx(e,{type:'col',x:x+24,w:40,end:2,col:'#ff4a6a'});kFx(e,{type:'safe',x:gapC,w:GW,end:2});}
   else{for(const x of cols)e.beams.push({x0:x+6,x1:x+42,y:KTOP,h:KF-KTOP,col:'rgba(255,90,140,.35)',soft:true});kFx(e,{type:'safe',x:gapC,w:GW,end:2});}}
  if(lt===DUR){e.beams=[];juiceFlash('#ff4a6a',8);}
  if(lt>DUR+60)kEnd(e);},
 // ===== 蝕王エクリプス (sword with purple trail / cannon orb) =====
 eLunge(e,B,t,r){const TELE=r?28:36;if(t===1){e.edge=e.x<M.x?KEIKO_L:KEIKO_R;e.trail=[];}
  if(t<=TELE){const d=e.edge-e.x;e.x+=Math.sign(d)*Math.min(Math.abs(d),7);kFaceP(e);if(t>TELE-20)kFx(e,{type:'line',x0:e.x,x1:e.face>0?KEIKO_R+8:KEIKO_L-8,y:KF-14,end:2,col:(t&4)?'#ffffff':'#b070ff'});}
  else if(e.trail.length<200&&e.x>KEIKO_L-4&&e.x<KEIKO_R+4){e.x+=e.face*(r?8:7);if(t%2===0)e.trail.push(e.x);mansionBurst(e.x-e.face*10,KF-14,'#8a3aff',1);if(e.x<=KEIKO_L||e.x>=KEIKO_R){e.done=t;juiceShake(3,8);
    e.pillars=[];const xs=e.trail.filter((x,i)=>i%3===0);for(let i=0;i<xs.length;i++)if(i%3!==1)e.pillars.push(xs[i]);}}
  if(e.done){const lt=t-e.done;if(lt<30)for(const x of e.pillars)kFx(e,{type:'col',x,w:20,end:2,col:lt>16?'#ffffff':'#8a3aff'});
   if(lt===30){juiceShake(4,10);sfx('hit');e.beams=e.pillars.map(x=>({x0:x-10,x1:x+10,y:KTOP+40,h:KF-KTOP-40,col:'#b070ff'}));}if(lt===44)e.beams=[];if(lt>64){e.done=0;e.trail=[];mansionKeikoMode(e,'walk');}}},
 eCross(e,B,t,r){const F=12,AP=22;if(t===F){kHide(e,true);e.wx=kClampX(M.x-(M.face||1)*60);}if(t>F&&t<F+AP)kFx(e,{type:'ring',x:e.wx,end:2,col:'#b070ff'});
  if(t===F+AP){kHide(e,false);e.x=e.wx;kFaceP(e);}
  const A=F+AP+24,Bt=A+30;if(t>F+AP&&t<A)kFx(e,{type:'line',x0:e.x,x1:e.x+e.face*120,y:KF-20,end:2,col:t>A-12?'#ffffff':'#b070ff'});
  if(t>=A&&t<A+8){e.beams=[{x0:Math.min(e.x,e.x+e.face*120),x1:Math.max(e.x,e.x+e.face*120),y:KF-25,h:9,col:'#d0a0ff'}];if(t===A){juiceShake(2,6);sfx('swing');}}if(t===A+8)e.beams=[];
  if(t>A+8&&t<Bt)kFx(e,{type:'line',x0:e.x,x1:e.x+e.face*120,y:KF-6,end:2,col:t>Bt-12?'#ffffff':'#b070ff'});
  if(t>=Bt&&t<Bt+8){e.beams=[{x0:Math.min(e.x,e.x+e.face*120),x1:Math.max(e.x,e.x+e.face*120),y:KF-10,h:9,col:'#d0a0ff'}];if(t===Bt){juiceShake(2,6);sfx('swing');}}if(t===Bt+8)e.beams=[];
  if(t>Bt+30)mansionKeikoMode(e,'walk');},
 eTotal(e,B,t,r){ // super: トータル・エクリプス — darkness, falling crescents with marked gaps, then a giant high slash (slide)
  if(t===1){juiceCut('トータル・エクリプス',B.col,'蝕王エクリプス');e.x=256;}
  const T0=24,WAVES=4,EV=48;if(t<T0)return;const lt=t-T0,w=Math.floor(lt/EV),wt=lt%EV;e.dark=Math.min(.45,lt/60);
  if(w<WAVES){if(wt===0){e.gap=kClampX(KEIKO_L+40+artH(w,t)%(KEIKO_R-KEIKO_L-80));}
   if(wt<26){kFx(e,{type:'safe',x:e.gap,w:60,end:2});for(let x=KEIKO_L;x<KEIKO_R;x+=32)if(Math.abs(x+16-e.gap)>46)kFx(e,{type:'col',x:x+16,w:10,end:2,col:wt>12?'#ffffff':'#8a3aff'});}
   if(wt===26)for(let x=KEIKO_L;x<KEIKO_R;x+=32)if(Math.abs(x+16-e.gap)>46)kb(e,{x:x+16,y:KTOP,vy:6.5,shape:'crescent',r:5,extra:{kRain:true}});}
  const S=T0+WAVES*EV;if(t>S&&t<S+36)kFx(e,{type:'line',x0:KEIKO_L-8,x1:KEIKO_R+8,y:KF-20,end:2,col:t>S+22?'#ffffff':'#b070ff',thick:2});
  if(t>=S+36&&t<S+44){e.beams=[{x0:KEIKO_L-8,x1:KEIKO_R+8,y:KF-26,h:10,col:'#e0c0ff'}];if(t===S+36){juiceShake(6,16);juiceFlash('#b070ff',10);sfx('hit');}}
  if(t===S+44){e.beams=[];}if(t>S+70){e.dark=0;kEnd(e);}},
};
function kRicoPath(x,y,a,bounces){const pts=[[x,y]];let vx=Math.cos(a),vy=Math.sin(a);for(let s=0;s<=bounces;s++){const tx=vx<0?(KEIKO_L-8-x)/vx:vx>0?(KEIKO_R+8-x)/vx:1e9,ty=vy<0?(KTOP-y)/vy:vy>0?(KF-3-y)/vy:1e9,tt=Math.max(0,Math.min(tx,ty));x+=vx*tt;y+=vy*tt;pts.push([x,y]);if(tx<=ty)vx=-vx;else vy=-vy;}return pts;}
// windup poses for the new moves
const KEIKO_MOVE_POSE={hFan:t=>t<34?'telegraph':'attack',hDive:(t,e)=>e.lift>2&&!e.diveLine?'kick':t<42?'telegraph':'idle',hKick:(t,e)=>t<50?'fly':'kick',nAim:()=> 'attack',nLob:t=>t<30?'telegraph':'attack',nBack:(t,e)=>e.vy!=null?'walk':'attack',nRico:()=> 'attack',
 lSong:t=>t<36?'telegraph':'attack',lHearts:t=>t<10?'telegraph':'attack',lMoon:()=> 'attack',lStars:t=>t<30?'telegraph':'attack',dSpear:t=>t<40?'spear':'spear',dWhip:t=>t<40?'transform':'sword',dLance:t=>t<44?'transform':'bow',
 vOrb:t=>t<48?'telegraph':'attack',vWarpKick:(t,e)=>e.lift>0?'kick':'idle',vMeteor:(t,e)=>e.lift>0?'kick':'telegraph',lvPierce:()=> 'attack',lvSky:()=> 'kick',lvMist:t=>t<20?'telegraph':'attack',lvHunt:()=> 'attack',
 nScreech:t=>t<30?'telegraph':'attack',nSpin:t=>t<36?'telegraph':'kick',nDive:(t,e)=>e.lift>0?'kick':'telegraph',nEncore:()=> 'kick',eLunge:(t,e)=>t<36?'telegraph':'attack',eCross:()=> 'attack',eTotal:(t)=>t<30?'telegraph':'kick'};
// per-frame hazards: beams hurt while present; fx age; shot extras (gravity, wobble, split, burst, bounce, sway)
function mansionKeikoMovesUpdate(e){if(typeof mansionShadeFxTick==='function')mansionShadeFxTick(e);if(e.fx){for(const f of e.fx)f.t++;e.fx=e.fx.filter(f=>f.t<f.end);}
 for(const bm of e.beams||[])if(kPHit([bm.x0,bm.y,bm.x1-bm.x0,bm.h]))mansionDamage(2,M.x<e.x?-1:1);
 const add=[];for(const b of M.enemyShots){if(b.kind!=='kShot')continue;b.age=(b.age||0)+1;if(b.g)b.vy+=b.g;
  if(b.wob)b.y=b.base+Math.sin(b.age*.09+(b.ph||0))*b.wob;
  if(b.sway){b.x=b.bx+Math.sin(b.age*.07)*b.sway;}
  if(b.lob&&b.y>=KF-4){b.dead=true;mansionBurst(b.x,KF-4,'#ff6a6a',3);}
  if(b.kRain&&b.y>=KF-4){b.dead=true;mansionBurst(b.x,KF-4,b.col,3);if(b.meteor){juiceShake(2,4);fxSpawn(e,'impact',b.x,KF-8);}}
  if(b.bnc!=null){if(b.y<=KTOP&&b.vy<0){b.vy=-b.vy;b.bnc--;}else if(b.y>=KF-3&&b.vy>0){b.vy=-b.vy;b.bnc--;}if(b.x<=KEIKO_L-8||b.x>=KEIKO_R+8){b.vx=-b.vx;b.bnc--;}if(b.bnc<0)b.dead=true;}
  if(b.split&&b.age===b.splitAt){b.dead=true;fxSpawn(e,'impact',b.x,b.y);juiceShake(2,6);mansionBurst(b.x,b.y,'#b070ff',10);for(let k=0;k<b.split;k++){const a=k*Math.PI*2/b.split+.3;add.push({...b,split:0,shape:'orb',r:3,vx:Math.cos(a)*2,vy:Math.sin(a)*2,age:0,dead:false});}}
  if(b.burst&&b.y>=KF-6){b.dead=true;fxSpawn(e,'impact',b.x,KF-8);fxSpawn(e,'shockwave',b.x,KF);juiceShake(3,8);sfx('hit');mansionBurst(b.x,KF-4,'#b070ff',10);for(const s of[1,-1])add.push({kind:'kShot',x:b.x+s*10,y:KF-6,vx:s*2.6,vy:0,damage:2,low:true,col:b.col,shape:'wave'});}
  if(b.life&&b.age>b.life)b.dead=true;if(b.x<-40||b.x>MR[M.room].w+40||b.y<-60||b.y>300)b.dead=true;}
 M.enemyShots.push(...add);}
function mansionKeikoMovesDraw(e){
 if(e.dark){g.globalAlpha=e.dark;g.fillStyle='#05020c';g.fillRect(0,0,MR[M.room].w,256);g.globalAlpha=1;}
 for(const f of e.fx||[]){const c=f.col||'#fff';
  if(f.type==='glow'){g.globalAlpha=.55+.3*Math.sin(M.t*.4);g.fillStyle=c;g.beginPath();g.arc(f.x,f.y,f.r||4,0,7);g.fill();g.globalAlpha=1;}
  else if(f.type==='ring'){g.strokeStyle=c;g.globalAlpha=.8;g.beginPath();g.ellipse(f.x,KF-2,14+Math.sin(M.t*.3)*2,4,0,0,7);g.stroke();g.globalAlpha=.25;mrect(f.x-1,KTOP,2,KF-KTOP,c);g.globalAlpha=1;}
  else if(f.type==='mark'){if((M.t>>2)&1){mrect(f.x-f.w/2,KF-2,f.w,2,c);mansionDiamond(f.x,KF-10,3,c);}}
  else if(f.type==='col'){g.globalAlpha=.22;mrect(f.x-f.w/2,KTOP,f.w,KF-KTOP,c);g.globalAlpha=.8;mrect(f.x-f.w/2,KF-3,f.w,3,c);g.globalAlpha=1;}
  else if(f.type==='safe'){g.globalAlpha=.25+.1*Math.sin(M.t*.2);mrect(f.x-f.w/2,KTOP,f.w,KF-KTOP,'#9fe8ff');g.globalAlpha=1;mrect(f.x-f.w/2,KF-3,f.w,3,'#c9fbff');mansionDiamond(f.x,KF-12,4,'#ffffff');}
  else if(f.type==='line'){if((M.t&4)||c==='#ffffff')mrect(Math.min(f.x0,f.x1),f.y,Math.abs(f.x1-f.x0),f.thick||1,c);}
  else if(f.type==='seg'&&f.art&&fxOf({id:f.fxId},f.art)){const ef=fxOf({id:f.fxId},f.art),len=Math.hypot(f.x1-f.x0,f.y1-f.y0);fxDrawOne(ef,f.x0,f.y0,(M.t>>2)%ef.frames,1,Math.atan2(f.y1-f.y0,f.x1-f.x0),len/((ef.frameWidth-(ef.anchor?ef.anchor[0]:0))*(ef.drawScale||.25)),1,0);}
  else if(f.type==='seg'){g.strokeStyle=c;g.globalAlpha=c==='#ffffff'?.9:.5;g.setLineDash(c==='#ffffff'?[]:[2,3]);g.beginPath();g.moveTo(f.x0,f.y0);g.lineTo(f.x1,f.y1);g.stroke();g.setLineDash([]);g.globalAlpha=1;}
  else if(f.type==='die'){mansionRollFace(f.x,f.y,f.n,f.rolling);}
  else if(f.type==='sqmark'){if((M.t>>2)&1||c==='#ffffff'){mrect(f.x-f.w/2,253,f.w,3,c);mansionDiamond(f.x,242,3,c);}}
  else if(f.type==='sqcol'){g.globalAlpha=c==='#ffffff'?.3:.18;mrect(f.x-f.w/2,30,f.w,226,c);g.globalAlpha=.8;mrect(f.x-f.w/2,253,f.w,3,c);g.globalAlpha=1;}
  else if(f.type==='sqsafe'){g.globalAlpha=.22+.1*Math.sin(M.t*.2);mrect(f.x-f.w/2,30,f.w,226,'#9fe8ff');g.globalAlpha=1;mrect(f.x-f.w/2,253,f.w,3,'#c9fbff');mansionDiamond(f.x,240,4,'#ffffff');}
  else if(f.type==='mist'){g.globalAlpha=.35;g.fillStyle='#c8d8ff';g.beginPath();g.ellipse(f.x,KF-18,16,20,0,0,7);g.fill();g.globalAlpha=1;}}
 const L=e.diveLine||e.aimLine;if(L){g.strokeStyle=L.lock?'#ffffff':KEIKO_BOSSES[e.id].col;g.globalAlpha=L.lock?.95:.55;g.setLineDash(L.lock?[]:[3,3]);g.beginPath();g.moveTo(L.x0,L.y0);let x1=L.x1,y1=L.y1;if(L.long){const a=Math.atan2(y1-L.y0,x1-L.x0);x1=L.x0+Math.cos(a)*400;y1=L.y0+Math.sin(a)*400;}g.lineTo(x1,y1);g.stroke();g.setLineDash([]);g.globalAlpha=1;}
 if(e.rico){g.strokeStyle=e.rico.lock?'#ffffff':'#ff9ad0';g.setLineDash([2,3]);g.beginPath();e.rico.pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.setLineDash([]);}
 if(typeof fxUpdateDraw==='function')fxUpdateDraw();
 for(const bm of e.beams||[]){g.globalAlpha=bm.soft?1:.85;mrect(bm.x0,bm.y,bm.x1-bm.x0,bm.h,bm.col);if(!bm.soft){g.globalAlpha=.6;mrect(bm.x0,bm.y+Math.floor(bm.h/2)-1,bm.x1-bm.x0,2,'#ffffff');}g.globalAlpha=1;}}
// extra bullet looks
const keikoBulletDrawBase=keikoBulletDraw;
keikoBulletDraw=function(b){const c=b.col||'#fff';
 if(b.shape==='bigorb'){const r=b.r||6;g.globalAlpha=.35;g.fillStyle=c;g.beginPath();g.arc(b.x,b.y,r+3,0,7);g.fill();g.globalAlpha=1;g.fillStyle='#1a0830';g.beginPath();g.arc(b.x,b.y,r,0,7);g.fill();g.strokeStyle=c;g.beginPath();g.arc(b.x,b.y,r,0,7);g.stroke();return;}
 if(b.shape==='ring'){g.strokeStyle=c;g.globalAlpha=.9;g.beginPath();g.ellipse(b.x,b.y,3,6+Math.sin((b.age||0)*.3),0,0,7);g.stroke();g.globalAlpha=1;return;}
 if(b.shape==='spear'){const a=Math.atan2(b.vy,b.vx);g.save();g.translate(b.x,b.y);g.rotate(a);mrect(-12,-1,16,2,'#c8f4ff');mrect(4,-2,5,4,'#ffffff');g.restore();return;}
 if(b.shape==='crescent'){g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.arc(b.x,b.y-3,6,.2,Math.PI-.2);g.stroke();g.lineWidth=1;return;}
 if(b.shape==='arrow'&&b.vy){const a=Math.atan2(b.vy,b.vx);g.save();g.translate(b.x,b.y);g.rotate(a);mrect(-8,-.5,10,1,'#e8e4c8');mrect(2,-1.5,3,3,c);g.restore();return;}
 keikoBulletDrawBase(b);};
// boss-sized hit radius for big orbs
function keikoShotBox(b){const r=b.r||3;return[b.x-r,b.y-r,r*2,r*2];}

// =====================================================================
//  test.50: shade FX sheets (assets/fx/shade_<n>_*.png, 4 frames in a row, drawScale .25) + cut-in portraits.
//  fallback: the code-drawn effects above keep working when a sheet is missing.
// =====================================================================
const SHADE_FX_KEY={vesper:'tobi',lavis:'neen',nocturne:'lily',eclipse:'star'};const SHADE_FX={};
function fxLoadSet(id,json,prefix){if(typeof fetch!=='function')return;fetch('assets/fx/'+json).then(r=>r.ok?r.json():null).then(d=>{if(!d)return;const set=SHADE_FX[id]||(SHADE_FX[id]={});
 for(const [k0,ef] of Object.entries(d.effects||{})){const k=prefix&&k0.startsWith(prefix)?k0.slice(prefix.length):k0;const img=new Image();img.onload=()=>{set[k]={...ef,img};};img.src='assets/fx/'+ef.file;}
 if(d.cutin){const img=new Image();img.onload=()=>{set.cutin={...d.cutin,img};};img.src='assets/fx/'+d.cutin.file;}}).catch(()=>{});}
for(const [id,n] of Object.entries(SHADE_FX_KEY))fxLoadSet(id,'shade_'+n+'_fx.json');
// test.51: sequel bosses use the same format; a missing json just means code-drawn effects only.
// delivered names: hoshiyomi_fx.json (hoshi_*), seiten_fx.json (seiten_*), diceroll_fx.json (diceroll_* + dice_roll_impact), astarte_fx.json (astarte_*)
fxLoadSet('hoshi','hoshiyomi_fx.json','hoshi_');fxLoadSet('seiten','seiten_fx.json','seiten_');fxLoadSet('dice','diceroll_fx.json','diceroll_');fxLoadSet('dice','diceroll_fx.json','dice_');fxLoadSet('astarte','astarte_fx.json','astarte_');
let KFXL=[];
function fxOf(e,name){const s=SHADE_FX[e&&e.id];return s&&s[name]||null;}
function fxSpawn(e,name,x,y,o={}){const ef=fxOf(e,name);if(!ef)return false;KFXL.push({ef,x,y,t:0,flip:o.flip||1,rot:o.rot||0,sx:o.sx||1,sy:o.sy||1,row:o.row||0,follow:o.follow?e:null,loop:o.loop||0});if(KFXL.length>60)KFXL.shift();return true;}
function fxFrame(ef,t,loop){const ms=t*16.7;let acc=0,total=ef.ms.reduce((a,b)=>a+b,0);let m=ef.loop||loop?ms%total:ms;if(m>=total)return -1;for(let i=0;i<ef.ms.length;i++){acc+=ef.ms[i];if(m<acc)return i;}return ef.frames-1;}
function fxDrawOne(ef,x,y,fi,flip,rot,sx,sy,row){const fw=ef.frameWidth,fh=ef.frameHeight,s=ef.drawScale||.25,[ax,ay]=ef.anchor||[fw/2,fh/2];g.save();if(ef.blend==='lighter')g.globalCompositeOperation='lighter';g.translate(x,y);if(rot)g.rotate(rot);if(flip<0)g.scale(-1,1);g.scale(sx||1,sy||1);g.drawImage(ef.img,fi*fw,(row||0)*fh,fw,fh,-ax*s,-ay*s,fw*s,fh*s);g.restore();}
function fxUpdateDraw(){KFXL=KFXL.filter(f=>{f.t++;if(f.follow){f.x=f.follow.x;f.y=f.follow.y-(f.follow.lift||0);}const fi=fxFrame(f.ef,f.t,f.loop);if(fi<0||(f.loop&&f.t>f.loop))return false;fxDrawOne(f.ef,f.x,f.y,fi,f.flip,f.rot,f.sx,f.sy,f.row);return true;});}
// hook the FX into the shade moves: wrap kShock (landing shockwaves), kb bursts and beams
const kShockBase=kShock;kShock=function(e,x,sp,col){kShockBase(e,x,sp,col);if(fxSpawn(e,'shockwave',x,KF)){}fxSpawn(e,'impact',x,KF-8);};
function mansionShadeFxTick(e){if(!SHADE_FX[e.id])return;const m=e.mode,t=e.mt;
 if(t===1&&(m===KEIKO_BOSSES[e.id].super||m==='vOrb'||m==='nSpin'||m==='dLance'))fxSpawn(e,'aura',e.x,e.y,{follow:true,loop:m===KEIKO_BOSSES[e.id].super?60:40});
 for(const bm of e.beams||[])if(!bm.fx){bm.fx=1;const w=bm.x1-bm.x0;if(e.id==='eclipse'&&fxOf(e,'beam')){const ef=fxOf(e,'beam');KFXL.push({ef,x:bm.x0,y:bm.y+bm.h/2,t:0,flip:1,sx:w/(ef.frameWidth*.25),loop:10});}else fxSpawn(e,'slash',(bm.x0+bm.x1)/2,bm.y+bm.h/2,{flip:e.face,sx:Math.max(.6,Math.min(2.5,w/64))});}
 if(e.id==='lavis'&&m==='lvSky'&&t===66&&fxOf(e,'arrowRain'))for(const x of e.cols||[])KFXL.push({ef:fxOf(e,'arrowRain'),x,y:KF,t:0,flip:1,loop:30});
 for(const b of M.enemyShots){if(b.fxDone)continue;if(b.meteor&&e.id==='vesper'){b.fxDone=1;b.art='meteor';}if(b.shape==='ring'&&e.id==='nocturne'){b.fxDone=1;b.art='soundRings';}}}
const keikoBulletDrawFx=keikoBulletDraw;
keikoBulletDraw=function(b){const e=b.fxId?{id:b.fxId}:mansionKeikoBoss();if(b.art&&e){const ef=fxOf(e,b.art);if(ef){fxDrawOne(ef,b.x,b.y,fxFrame(ef,b.age||0,1),b.vx<0?-1:1,b.art==='meteor'?Math.PI/2:0,b.art==='soundRings'?.6:b.artS||.5);return;}}keikoBulletDrawFx(b);};

// =====================================================================
//  test.50: ダーク星詠み — signature star-reader moves on the same move engine (B = KEIKO_BOSSES.hoshi, never placed in a room)
// =====================================================================
KEIKO_BOSSES.hoshi={name:'ダーク星詠み',col:'#c99aff',sub:'#ffe6ff',pose:{},seq:[],rageSeq:[]};
Object.assign(KEIKO_MOVES,{
 hsConstel(e,B,t,r){const n=r?6:5,LOCK=40,POP=56;kFaceP(e);
  if(t===1){e.stars=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2+artH(e.cycle,i)%60/60;e.stars.push([kClampX(M.x+Math.cos(a)*(70+i%2*30)),Math.max(KTOP+30,Math.min(KF-34,M.y-40+Math.sin(a)*50))]);}sfx('tink');}
  if(t<POP){const lk=t>=LOCK;for(let i=0;i<e.stars.length;i++){const[a,b]=e.stars[i],[c,d]=e.stars[(i+1)%e.stars.length];kFx(e,{type:'seg',x0:a,y0:b,x1:c,y1:d,end:2,col:lk?'#ffffff':'#c99aff',art:lk?'constellation_link':null,fxId:e.id});kFx(e,{type:'glow',x:a,y:b,end:2,col:lk?'#ffffff':'#ffe27a',r:lk?4:3});}if(t===LOCK)sfx('tink');}
  if(t===POP){juiceShake(2,8);sfx('shot');for(const[x,y]of e.stars){fxSpawn(e,'starburst',x,y);}for(const[x,y]of e.stars)for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;kb(e,{x,y,vx:Math.cos(a)*1.3,vy:Math.sin(a)*1.3,shape:'star',life:150});}}
  if(t>POP+70)mansionKeikoMode(e,'walk');},
 hsComet(e,B,t,r){KEIKO_MOVES.hDive(e,B,t,r);if(e.diveLine&&e.diveLine.lock&&!e.cometFx){e.cometFx=1;const L=e.diveLine;fxSpawn(e,'comet_trail',e.x,e.y-(e.lift||0)-20,{rot:Math.atan2(L.y1-L.y0,L.x1-L.x0),loop:24,follow:false});}if(e.landed===t)e.cometFx=0;if(e.landed===t){juiceShake(4,10);fxSpawn(e,'impact',e.x,KF-8);fxSpawn(e,'shockwave',e.x,KF);for(let k=0;k<(r?4:3);k++)kb(e,{x:e.x,y:KF-20,vx:(k-(r?1.5:1))*1.1,vy:-3.6-(k&1)*.6,g:.14,shape:'star',extra:{kRain:true}});}},
 hsOrbit(e,B,t,r){const n=r?5:4,SUM=30,REL=50,EV=r?14:18;kFaceP(e);
  if(t===1){e.orbs=[];for(let i=0;i<n;i++)e.orbs.push(kb(e,{x:e.x,y:e.y-24,shape:'bigorb',r:4,life:999,extra:{orbit:true,art:'orbit_orb',fxId:e.id,artS:.25}}));sfx('tink');}
  const ang=t*.08;e.orbs.forEach((o,i)=>{if(o.orbit){const a=ang+i*Math.PI*2/n,rad=Math.min(28,t);o.x=e.x+Math.cos(a)*rad;o.y=e.y-(e.lift||0)-24+Math.sin(a)*rad*.7;o.vx=o.vy=0;}});
  for(let i=0;i<n;i++){const at=REL+i*EV;const o=e.orbs[i];if(!o)continue;if(t>at-16&&t<at){e.aimLine={x0:o.x,y0:o.y,x1:M.x,y1:M.y-14,lock:t>=at-8};}
   if(t===at){o.orbit=false;const a=Math.atan2(M.y-14-o.y,M.x-o.x);o.vx=Math.cos(a)*2.8;o.vy=Math.sin(a)*2.8;o.life=200;e.aimLine=null;sfx('shot');}}
  if(t>REL+n*EV+30){for(const o of e.orbs)o.orbit=false;mansionKeikoMode(e,'walk');}},
 hsNova(e,B,t,r){ // super: スターダスト・ノヴァ
  if(t===1){juiceCut('スターダスト・ノヴァ',B.col,'ダーク星詠み');fxSpawn(e,'aura',e.x,e.y,{follow:true,loop:150});}
  if(t<30){e.x+=(256-e.x)*.1;e.lift=Math.min(70,(e.lift||0)+3);return;}
  const W0=70,WAVES=3,EV=36;if(t<W0)kFx(e,{type:'glow',x:e.x,y:e.y-e.lift-24,end:2,col:'#ffe27a',r:3+(t-30)/4});
  for(let w=0;w<WAVES;w++){const at=W0+w*EV,gap=1+(w*3+artH(e.cycle,w))%5; // gaps always open downward, toward the floor
   if(t>at-26&&t<at){const ga=(gap+1)*Math.PI*2/16;kFx(e,{type:'seg',x0:e.x,y0:e.y-e.lift-24,x1:e.x+Math.cos(ga)*300,y1:e.y-e.lift-24+Math.sin(ga)*300,end:2,col:'#9fe8ff'});}
   if(t===at){fxSpawn(e,'nova_ring',e.x,e.y-e.lift-24);juiceShake(3,10);juiceFlash('#ffe27a',5);sfx('shot');for(let k=0;k<16;k++){if(k>=gap&&k<=gap+2)continue;const a=k*Math.PI*2/16;kb(e,{x:e.x,y:e.y-e.lift-24,vx:Math.cos(a)*1.7,vy:Math.sin(a)*1.7,shape:'star',life:260});}}}
  if(t>W0+WAVES*EV+40){e.lift=Math.max(0,e.lift-4);if(!e.lift)kEnd(e);}},
});
Object.assign(KEIKO_MOVE_POSE,{hsConstel:t=>t<56?'telegraph':'attack',hsComet:(t,e)=>e.lift>2&&!e.diveLine?'kick':'telegraph',hsOrbit:t=>t<50?'telegraph':'attack',hsNova:t=>t<70?'telegraph':'attack'});
const HOSHI_POSE_MAP={telegraph:'shootWindup',attack:'shootStar',kick:'dash',fly:'move',walk:'move',idle:'idle'};

// test.53: cut-in title font — Dela Gothic One (SIL OFL 1.1), self-hosted subset assets/fonts/DelaGothicOne-cutin.woff2 (tools/font-subset.py)
let CUT_FONT_OK=false;
if(typeof FontFace==='function'&&typeof document!=='undefined'&&document.fonts){try{const f=new FontFace('DelaCut',"url(assets/fonts/DelaGothicOne-cutin.woff2) format('woff2')");f.load().then(ff=>{document.fonts.add(ff);CUT_FONT_OK=true;}).catch(()=>{});}catch(e){}}
// skewed, punchy title: scale-punch on entry, thick ink outline, boss-colour stroke, offset colour shadow, white fill
function cutTitle(g,c,x,y,maxW){const pun=c.t<CUT_IN?1.35-.35*c.t/CUT_IN:c.t<CUT_IN+3?1-.04*(CUT_IN+3-c.t):1;
 g.save();g.translate(x,y);g.transform(1,0,-.22,1,0,0);g.scale(pun,pun);g.textAlign='left';g.textBaseline='middle';g.lineJoin='round';
 g.font=(CUT_FONT_OK?"11px 'DelaCut',":'bold 10px ')+'sans-serif';const mw=g.measureText(c.name).width||1,sx=Math.min(1,maxW/mw);g.scale(sx,1);
 g.fillStyle=c.col;g.fillText(c.name,2,2);
 g.strokeStyle='#05020a';g.lineWidth=3.2;g.strokeText(c.name,0,0);g.strokeStyle=c.col;g.lineWidth=1.3;g.strokeText(c.name,0,0);
 g.fillStyle='#ffffff';g.fillText(c.name,0,0);g.globalAlpha=.35;g.fillStyle=c.col;g.fillRect(0,1,mw,1.2);g.restore();}
// cut-in is drawn on the hi-res overlay after everything else (crisp text, above HUD bars)
function mansionJuiceCutHi(){const c=KJ.cut;if(!c||typeof sctx==='undefined')return;const g=sctx;g.save();const kk=hiS();g.setTransform(kk,0,0,kk,0,0);{const B=juiceCutBox(c),sk=10,{x0,y0,w,h}=B;
  const poly=(dx,dy,ww,hh)=>{g.beginPath();g.moveTo(dx+sk,dy);g.lineTo(dx+ww+sk,dy);g.lineTo(dx+ww,dy+hh);g.lineTo(dx,dy+hh);g.closePath();};
  g.globalAlpha=1;g.fillStyle=c.col;poly(x0-4,y0-2,w+8,h+4);g.fill();g.fillStyle='#07030f';poly(x0,y0,w,h);g.fill();
  const pw=70;if(c.img){const [fx,fy]=CUT_FACE[c.id]||[256,80],sw=220,sh=sw*h/pw;g.save();poly(x0,y0,pw,h);g.clip();g.imageSmoothingEnabled=true;g.drawImage(c.img,fx-sw/2,fy-sh/2,sw,sh,x0,y0,pw+sk,h);g.restore();}
  else{g.fillStyle=c.col;g.globalAlpha=.5;poly(x0,y0,pw,h);g.fill();g.globalAlpha=1;}
  g.fillStyle=c.col;g.beginPath();g.moveTo(x0+pw+sk,y0);g.lineTo(x0+pw+sk+3,y0);g.lineTo(x0+pw+3,y0+h);g.lineTo(x0+pw,y0+h);g.fill();
  if(c.t<CUT_IN+3){g.globalAlpha=1-(c.t/(CUT_IN+3));g.fillStyle='#ffffff';poly(x0,y0,w,h);g.fill();g.globalAlpha=1;}
  for(let i=0;i<3;i++){g.globalAlpha=.35;g.fillStyle=c.col;g.fillRect(x0+pw+14+((c.t*6+i*37)%(w-pw-14)),y0+4+i*9,12,1);}g.globalAlpha=1;
  const tx=x0+pw+9;cutTitle(g,c,tx,y0+10,w-pw-14);
  if(c.sub){g.font=(CUT_FONT_OK?"7px 'DelaCut',":'bold 8px ')+'sans-serif';g.textAlign='left';g.fillStyle='#000';g.fillText(c.sub,tx+5,y0+h-4);g.fillStyle=c.col;g.fillText(c.sub,tx+4,y0+h-5);}g.textBaseline='alphabetic';}g.restore();}
{const base=renderMansion;renderMansion=function(){base();mansionJuiceCutHi();};}
