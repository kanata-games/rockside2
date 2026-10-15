
// =====================================================================
//  書庫の奥 (test.44): vertical room exits, 星詠みの欠片 + upgrades,
//  boss ダーク星詠み and the hub NPC 星詠み.
//  Art: prefers assets/<name>-sequel.png/.json (hi-res 512px cells with
//  name/rect/anchor/scale per frame), falls back to the 48px sheets
//  <name>.png/.json, and draws a pixel placeholder until either loads.
// =====================================================================

// ---------------------------------------------------------------- vertical exits
function mansionVerticalExit(){const r=MR[M.room];if(!r.vexits||!r.vexits.length)return false;const c=Math.floor(M.x/16);
 let side=null;if(M.y-M.h/2<0&&M.vy<=0)side='up';else if(M.y-M.h/2>r.h)side='down';if(!side)return false;
 const v=r.vexits.find(v=>v.side===side&&c>=v.c0-1&&c<=v.c1+1);if(!v)return false;const t=MR[v.to];
 const keep={vx:M.vx,vy:M.vy,face:M.face,kickLock:M.kickLock,lastWall:M.lastWall,slideJump:M.slideJump,h:M.h,slideT:M.slideT,hurt:M.hurt};
 const nx=M.x+v.dx,ny=side==='up'?t.h+M.y:M.y-r.h;mansionEnter(v.to,nx,ny);Object.assign(M,keep);M.transition=0;M.ground=false;mansionCamera(true);
 if(!M.visitedSay?.[v.to]){(M.visitedSay||(M.visitedSay={}))[v.to]=1;mansionSay(t.name,110);}return true;}

// ---------------------------------------------------------------- art loader
const HOSHI_ART={};   // key -> {mode:'sequel'|'grid', img, meta}
function hoshiArtLoad(key,name){if(typeof fetch!=='function')return;
 const grid=()=>fetch('assets/'+name+'.json').then(r=>{if(!r.ok)throw 0;return r.json();}).then(meta=>{const img=new Image();img.onload=()=>{if(!HOSHI_ART[key]||HOSHI_ART[key].mode!=='sequel')HOSHI_ART[key]={mode:'grid',img,meta};};img.src='assets/'+(meta.image||name+'.png');}).catch(()=>{});
 fetch('assets/'+name+'-sequel.json').then(r=>{if(!r.ok)throw 0;return r.json();}).then(meta=>{const img=new Image();img.onload=()=>{HOSHI_ART[key]={mode:'sequel',img,meta};};img.onerror=grid;img.src='assets/'+(meta.image||name+'-sequel.png');}).catch(grid);}
function hoshiFaceLoad(key,name){const img=new Image();img.onload=()=>{HOSHI_ART[key]={mode:'face',img};};img.onerror=()=>{const b=new Image();b.onload=()=>{if(!HOSHI_ART[key])HOSHI_ART[key]={mode:'face',img:b};};b.src='assets/'+name+'_face.png';};img.src='assets/'+name+'-sequel-face.png';}
if(typeof fetch==='function'){hoshiArtLoad('dark','hoshiyomi_dark');hoshiArtLoad('normal','hoshiyomi');hoshiArtLoad('bullets','star_bullets');hoshiFaceLoad('darkFace','hoshiyomi_dark');hoshiFaceLoad('normalFace','hoshiyomi');}
// pose -> frame. Sequel sheets: frame names (or arrays like "idle":[0,1]); grid sheets: animations{frames,fps|ms}.
const HOSHI_POSE_ALIAS={move:['move','walk','run'],shootWindup:['shootWindup','windup','idle'],shootStar:['shootStar','shoot','attack','idle'],starRainCast:['starRainCast','cast','idle'],dash:['dash','run','move','walk'],hurt:['hurt','idle'],defeat:['defeat','down','hurt','idle'],idle:['idle'],peace:['peace','wink','idle']};
function hoshiAnimPick(list,ms,t,loop){const L=Array.isArray(ms)?ms:list.map(()=>+ms||160),tot=L.reduce((a,b)=>a+b,0),now=t*16.667;let x=loop===false?Math.min(now,tot-1):now%tot;for(let k=0;k<list.length;k++){if(x<L[k])return list[k];x-=L[k];}return list[list.length-1];}
function hoshiFrame(art,pose,t){const m=art.meta,names=HOSHI_POSE_ALIAS[pose]||[pose,'idle'],an=m.animations||{};
 if(art.mode==='sequel'){const fr=m.frames||[];for(const n of names){const a=an[n];let list=a?.frames||(Array.isArray(m[n])?m[n]:null),ms=a?.ms||160;if(!list){const i=fr.findIndex(f=>f.name===n||f.name?.startsWith(n));if(i>=0)list=[i];}if(list&&list.length)return fr[hoshiAnimPick(list,ms,t,a?.loop)];}return fr[0];}
 for(const n of names){const a=an[n];if(a)return hoshiAnimPick(a.frames,a.ms||(a.fps?1000/a.fps:(m.ms&&m.ms[n])||200),t,a.loop);}return 0;}
// draws at feet (x,y); returns false when no art is loaded
function hoshiDrawArt(key,x,y,pose,t,dir,alpha=1){const art=HOSHI_ART[key];if(!art)return false;const f=hoshiFrame(art,pose,t);g.save();g.globalAlpha=alpha;g.translate(Math.round(x),Math.round(y));if(dir<0)g.scale(-1,1);
 if(art.mode==='sequel'){if(!f){g.restore();return false;}const sc=f.scale||art.meta.scale||.105,[rx,ry,rw,rh]=f.rect;let[ax,ay]=f.anchor||[rw/2,rh];if(ax>=rw||ay>=rh){ax-=rx;ay-=ry;}g.imageSmoothingEnabled=true;g.drawImage(art.img,rx,ry,rw,rh,-ax*sc,-ay*sc,rw*sc,rh*sc);}
 else{const m=art.meta,fw=+m.frameWidth||48,fh=+m.frameHeight||48,cx=+m.cx||fw/2,k=+m.drawScale||1;g.drawImage(art.img,f*fw,0,fw,fh,-cx*k,-fh*k,fw*k,fh*k);}
 g.restore();return true;}
// sequel anchors are absolute in the sheet; relative anchors (<= rect size) are also accepted
function hoshiDrawPlaceholder(x,y,pose,t,dir,dark){const f=dir<0?-1:1,R=(a,b,w,h,c)=>mrect(f>0?x+a:x-a-w,y+b,w,h,c),bob=pose==='idle'?((t>>5)&1):0,dash=pose==='dash';
 const hair=dark?'#1a1424':'#2a2234',streak=dark?'#9a4adf':'#b878ff',jacket=dark?'#b8b0cc':'#f4f2fa',eye=dark?'#ff3a4a':'#ff7a8a';
 if(dark){g.globalAlpha=.25;g.fillStyle='#7a3abf';g.beginPath();g.ellipse(x,y-22,18,26,0,0,7);g.fill();g.globalAlpha=1;}
 R(-10,-44+bob,12,30,hair);R(-11,-36+bob,3,22,streak);R(-4,-30+bob,2,14,streak);                     // long hair behind
 R(-5,-8,5,8,'#1a1420');R(2,-8,5,8,'#1a1420');R(-6,-3,6,3,'#3a2a48');R(1,-3,7,3,'#3a2a48');R(-5,-6,5,1,streak);R(2,-6,5,1,streak);   // platform boots
 R(-4,-17,4,9,'#f0d0c4');R(1,-17,4,9,'#f0d0c4');R(-5,-21,11,5,'#1c1826');R(-5,-19,11,1,'#6a5a7a');     // legs, shorts, belt
 R(-4,-27,9,6,'#f0d0c4');R(-4,-31,9,5,'#141018');                                                  // midriff, crop top
 R(-8,-32,4,14,jacket);R(5,-32,4,12,jacket);R(-8,-32,17,2,jacket);R(-8,-20,4,2,'#2a2234');          // white jacket off-shoulder
 R(-4,-41+bob,9,9,'#f4dcd0');R(-5,-44+bob,11,5,hair);R(-5,-42+bob,2,8,hair);R(2,-38+bob,2,1,eye);R(3,-35+bob,2,1,'#c84a6a');  // face, red eyes
 R(4,-45+bob,4,4,streak);R(5,-44+bob,2,2,'#ffe0ff');                                                 // flower ornament
 if(pose==='shootWindup'||pose==='shootStar'){R(pose==='shootStar'?9:-12,-30,4,3,jacket);mansionDiamond(f>0?x+(pose==='shootStar'?15:-12):x-(pose==='shootStar'?15:-12),y-30,4,'#ffe27a');}
 if(pose==='starRainCast'){R(-9,-50,3,10,jacket);R(7,-50,3,10,jacket);mansionDiamond(x,y-56,5,'#ffe27a');}
 if(dash){g.globalAlpha=.4;R(-26,-26,16,2,streak);R(-22,-18,12,2,streak);g.globalAlpha=1;}
 if(pose==='peace'){R(7,-44,2,5,'#f4dcd0');R(9,-45,2,5,'#f4dcd0');}}
function drawHoshi(key,x,y,pose,t,dir,alpha){if(hoshiDrawArt(key,x,y,pose,t,dir,alpha))return;g.globalAlpha=alpha??1;hoshiDrawPlaceholder(x,y,pose,t,dir,key==='dark');g.globalAlpha=1;}
function hoshiBulletDraw(b){const a=HOSHI_ART.bullets;if(a&&a.mode==='grid'){const fr=b.kind==='hStarRain'?2:(M.t>>3)&1;g.drawImage(a.img,fr*24,0,24,24,Math.round(b.x-12),Math.round(b.y-12),24,24);return;}
 mansionDiamond(b.x,b.y,b.kind==='hStarRain'?7:6,'#2a1040');mansionDiamond(b.x,b.y,b.kind==='hStarRain'?5:4,b.low?'#ff8ad8':'#c99aff');mansionDiamond(b.x,b.y,2,'#fff6c8');}

// ---------------------------------------------------------------- 星詠みの欠片 + upgrades
const MANSION_UPGRADES=[ // extensible: {id,name,desc,cost:[per level]} ; effect lookups use mansionUpg(id)
 {id:'hp',name:'最大HPアップ',desc:'最大HPが2増える',cost:[2,3,5,7]},
 {id:'shot',name:'水弾の威力アップ',desc:'ショットの威力が1上がる',cost:[3,6]},
 {id:'slide',name:'スライディング延長',desc:'スライディングが長く滑る',cost:[2,4]},
 {id:'vial',name:'星の小瓶',desc:'満タン時の回復をためておき、小瓶ボタン（V）でHPに注ぐ。1本に8',cost:[4,7]},
 {id:'dash',name:'空中ダッシュ',desc:'空中でスライド（↓+ジャンプ）すると横にダッシュ。着地か壁で回復',cost:[8]},
];
function mansionUpg(id){return(M.upg&&M.upg[id])||0;}
function mansionShardGain(n,quiet){M.shards=(M.shards||0)+n;mansionBurst(M.x,M.y-20,'#d7b8ff',10);sfx('heal');if(!quiet)mansionSay('星詠みの欠片を拾った！（所持 '+M.shards+'）',110);}
function mansionShardsUpdate(){const r=MR[M.room];for(const[x,y,id]of r.shards||[]){if((M.shardsTaken||[]).includes(id))continue;if(mansionOverlap(M.x-MC.w/2-2,M.y-M.h,MC.w+4,M.h,[x-7,y-22,14,18])){(M.shardsTaken||(M.shardsTaken=[])).push(id);mansionShardGain(1);mansionSave();}}}
function mansionShardIcon(x,y,s=1){mansionDiamond(x,y,7*s,'#24113e');mansionDiamond(x,y,5*s,'#b07aff');mansionDiamond(x-1,y-1,2*s,'#fff2ff');}
function mansionShardsDraw(){const r=MR[M.room];for(const[x,y,id]of r.shards||[]){if((M.shardsTaken||[]).includes(id))continue;const yy=y-14+Math.sin(M.t*.06+x)*2;g.globalAlpha=.3;g.fillStyle='#c99aff';g.beginPath();g.arc(x,yy,10,0,7);g.fill();g.globalAlpha=1;mansionShardIcon(x,yy);}}
function mansionFoeDropShard(e){if(e.dropped||!MANSION_FOES[e.kind]||MANSION_FOES[e.kind].custom)return;e.dropped=true;M.dropCount=(M.dropCount||0)+1;if(M.dropCount%2===1)M.pickups.push({kind:'shard',x:e.x,y:e.y-10,vy:-2,age:0});}
function mansionUpgradeBuy(id){const u=MANSION_UPGRADES.find(u=>u.id===id);if(!u)return false;const lv=mansionUpg(id),cost=u.cost[lv];if(cost==null||(M.shards||0)<cost)return false;
 M.shards-=cost;M.upg={...(M.upg||{}),[id]:lv+1};if(id==='hp')M.hp=mansionMaxHP();mansionSave();sfx('start');mansionUI();return true;}
function mansionUpgradeHTML(){return `<h2>星詠みの強化</h2><p>「欠片ちょーだい☆ うちが強くしたげる！」<br>所持：星詠みの欠片 <b>${M.shards||0}</b></p><div class="warp-list">${MANSION_UPGRADES.map(u=>{const lv=mansionUpg(u.id),cost=u.cost[lv],max=cost==null;return `<button id="mUpg-${u.id}" ${max||(M.shards||0)<cost?'disabled':''}>${u.name}　Lv ${lv}/${u.cost.length}<br><small>${u.desc}${max?'（最大）':'　必要：欠片 '+cost}</small></button>`;}).join('')}</div>`;}
function mansionUpgradeOpen(){M.map=true;M.menuTab='upgrade';M.talk=null;releaseAll();mansionUI();}

// ---------------------------------------------------------------- boss ダーク星詠み
const HOSHI_FLOOR=224,HOSHI_L=40,HOSHI_R=472;
function mansionNewHoshi(){return{kind:'hoshiBoss',x:400,y:HOSHI_FLOOR,face:-1,dir:-1,hp:100,maxHp:100,t:0,st:0,flash:0,mode:'idle',mt:0,cycle:0,gaps:[],nextGaps:null};}
function mansionHoshiEnter(room){if(room!=='obsDome')return;if(M.flags.hoshiyomiDefeated){M.hoshiState='done';return;}M.hoshiState='waiting';M.enemies=M.enemies.filter(e=>e.kind!=='hoshiBoss');M.enemies.push(mansionNewHoshi());}
function mansionHoshiTrigger(){if(M.room!=='obsDome'||M.hoshiState!=='waiting'||M.map||M.x<70)return;M.hoshiState='ready';const again=M.hoshiTries>0;M.hoshiTries=(M.hoshiTries||0)+1;
 const lines=again?['……また来たんだ。しつこいじゃん。','いいよ、何回でも星降らせたげる。キャハッ☆']:['……あれ？ 誰か来たじゃん。うち、今ちょー星読んでんだけど。','ねえ、聞こえる？ 星がさ……「全部うちのもの」って言ってんの。マジで。','邪魔すんなら、星ごと降らせちゃうけど……いいよね？ キャハッ☆'];
 mansionTalkShow('ダーク星詠み',lines,mansionHoshiStart);M.talk.afterClose=mansionHoshiStart;}
function mansionHoshiStart(){if(M.hoshiState==='active')return;M.hoshiState='active';const e=M.enemies.find(e=>e.kind==='hoshiBoss')||(M.enemies.push(mansionNewHoshi()),M.enemies.at(-1));Object.assign(e,mansionNewHoshi());e.mode='walk';e.mt=0;M.enemyShots=[];M.map=false;}
function mansionHoshiMode(e,m){e.mode=m;e.mt=0;}
function mansionHoshiGaps(e,n,w){const out=[],span=HOSHI_R-HOSHI_L-w;for(let i=0;i<n;i++){let x=HOSHI_L+((artH(e.cycle*7+i,M.t>>4)%1000)/1000)*span;for(let k=0;k<6&&out.some(g=>Math.abs(g-x)<w*2.2);k++)x=HOSHI_L+((x-HOSHI_L+span*.37)%span);out.push(Math.round(x));}return out.map(x=>[x,x+w]);}
function mansionHoshiAI(e){if(M.hoshiState!=='active'){e.mode='idle';return;}const rage=e.hp<=e.maxHp/2,t=++e.mt,dx=M.x-e.x;e.st++;
 if(rage&&!e.raged){e.raged=true;mansionSay('「ちょ、マジ痛いんだけど！ 本気出すし！」',150);mansionBurst(e.x,e.y-30,'#c99aff',16);}
 if(e.mode==='walk'){e.face=Math.sign(dx)||e.face;const d=Math.abs(dx);if(d>180)e.x+=e.face*(rage?1.3:1);else if(d<140)e.x-=e.face*1.2;
  if(t>(rage?40:64)){const seq=['shoot','dash','shoot','rain'];mansionHoshiMode(e,seq[e.cycle%4]);e.cycle++;if(e.mode==='rain'){e.fromX=e.x;e.fromY=e.y;}}}
 else if(e.mode==='shoot'){const WIND=36,GAP=rage?32:36,n=rage?3:2;e.face=t<WIND?Math.sign(dx)||e.face:e.face;
  if(t===1)e.pattern=Array.from({length:n},(_,i)=>rage?(i%2===1):false);  // false = high (slide under), true = low (jump over)
  if(t>=WIND&&(t-WIND)%GAP===0&&(t-WIND)/GAP<n){const low=e.pattern[(t-WIND)/GAP];M.enemyShots.push({kind:'hStar',low,x:e.x+e.face*16,y:HOSHI_FLOOR-(low?6:20),vx:e.face*(rage?2.8:2.4),vy:0,damage:2});sfx('shot');}
  if(t>WIND+GAP*n+20)mansionHoshiMode(e,'walk');}
 else if(e.mode==='dash'){const TELE=rage?30:40;if(t===1){e.dashes=rage?2:1;e.edge=e.x<M.x?HOSHI_L:HOSHI_R;}
  if(t<=TELE){/* telegraph: back off to the far edge, then crouch with a floor line */if(e.edge!=null){const d=e.edge-e.x;e.x+=Math.sign(d)*Math.min(Math.abs(d),6);if(Math.abs(d)<1)e.edge=null;}e.face=Math.sign(M.x-e.x)||e.face;}
  else{e.x+=e.face*(rage?6:5.2);if(e.x<HOSHI_L||e.x>HOSHI_R){e.x=Math.max(HOSHI_L,Math.min(HOSHI_R,e.x));e.dashes--;if(e.dashes>0){e.face*=-1;e.mt=TELE-22;}else mansionHoshiMode(e,'walk');}}}
 else if(e.mode==='rain'){const RISE=24,TELE=60,RAIN=rage?120:84,W=rage?44:52,n=2,cx=(HOSHI_L+HOSHI_R)/2;
  if(t===1){e.gaps=mansionHoshiGaps(e,n,W);e.nextGaps=null;e.shiftAt=rage?RISE+TELE+50:null;}
  if(t<=RISE){const k=t/RISE;e.x=e.fromX+(cx-e.fromX)*k;e.y=HOSHI_FLOOR-Math.sin(k*Math.PI/2)*80;}
  if(e.shiftAt&&t===e.shiftAt-40){e.nextGaps=mansionHoshiGaps({cycle:e.cycle+5},n,W);}            // telegraph the moved gaps 40 frames early
  if(e.shiftAt&&t===e.shiftAt){e.gaps=e.nextGaps;e.nextGaps=null;}
  if(t>RISE+TELE&&t<RISE+TELE+RAIN&&t%4===0){const safe=[...e.gaps,...(e.nextGaps||[])];let x=null;for(let k=0;k<8&&x==null;k++){const c=HOSHI_L-20+artH(t,k)%(HOSHI_R-HOSHI_L+40);if(!safe.some(([a,b])=>c>a-8&&c<b+8))x=c;}if(x!=null)M.enemyShots.push({kind:'hStarRain',x,y:14,vx:0,vy:3.4,damage:2});}
  if(t>RISE+TELE+RAIN+50){const k=Math.min(1,(t-RISE-TELE-RAIN-50)/20);e.y=HOSHI_FLOOR-80*(1-k);if(k>=1){e.y=HOSHI_FLOOR;e.gaps=[];mansionHoshiMode(e,'walk');}}}
 e.x=Math.max(HOSHI_L-8,Math.min(HOSHI_R+8,e.x));
 const box=e.mode==='dash'&&e.mt>(rage?30:40)?[e.x-9,e.y-34,18,27]:[e.x-8,e.y-40,16,40];
 if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,box))mansionDamage(2,M.x<e.x?-1:1);}
function mansionHoshiPose(e){if(e.flash>0)return'hurt';if(e.mode==='shoot')return e.mt<36?'shootWindup':'shootStar';if(e.mode==='rain')return'starRainCast';if(e.mode==='dash')return e.mt>(e.hp<=e.maxHp/2?30:40)?'dash':'shootWindup';if(e.mode==='walk')return'move';return'idle';}
function mansionHoshiDraw(e){const pose=mansionHoshiPose(e);
 // telegraphs first (under her)
 if(e.mode==='rain'){for(const[a,b]of e.gaps||[]){g.globalAlpha=.28+.12*Math.sin(M.t*.2);mrect(a,20,b-a,HOSHI_FLOOR-20,'#9fe8ff');g.globalAlpha=1;mrect(a,HOSHI_FLOOR-3,b-a,3,'#c9fbff');mansionDiamond((a+b)/2,HOSHI_FLOOR-12,4,'#ffffff');}
  for(const[a,b]of e.nextGaps||[]){if((M.t>>3)&1){mrect(a,HOSHI_FLOOR-3,b-a,3,'#ffe27a');mansionDiamond((a+b)/2,HOSHI_FLOOR-14,4,'#ffe27a');}}}
 if(e.mode==='dash'&&e.mt<=(e.hp<=e.maxHp/2?30:40)&&(M.t&4)){const x0=e.face>0?e.x:HOSHI_L-8,x1=e.face>0?HOSHI_R+8:e.x;mrect(Math.min(x0,x1),HOSHI_FLOOR-20,Math.abs(x1-x0),2,'#ff6ab0');}
 if(e.mode==='shoot'&&e.mt<36&&e.pattern){e.pattern.forEach((low,i)=>mansionDiamond(e.x+e.face*(22+i*9),HOSHI_FLOOR-(low?6:20),3,(M.t&4)?'#ffffff':low?'#ff8ad8':'#c99aff'));}
 drawHoshi('dark',e.x,e.y,pose,e.t,e.face,e.flash>0&&(e.flash&2)?.55:1);
 if(M.hoshiState==='active'){mrect(e.x-28,e.y-66,56,5,'#160e27');mrect(e.x-27,e.y-65,54*Math.max(0,e.hp)/e.maxHp,3,e.hp<=e.maxHp/2?'#ff6ab0':'#c99aff');}}
function mansionHoshiWin(){M.hoshiState='done';M.messageT=0;M.flags.hoshiyomiDefeated=true;M.enemyShots=[];M.shots=[];M.enemies=M.enemies.filter(e=>e.kind!=='hoshiBoss');M.hp=mansionMaxHP();mansionShardGain(3,true);mansionSave();
 mansionTalkShow('星詠み',['……っ、いったぁ……。あれ、うち……何してたんだっけ？','え、マジ？ うちが襲ったの？ ……ごめん、ほんとごめんじゃん……。','なんか黒いもやもやに、星の声ジャックされてたっぽい。……助けてくれてありがと、マジ感謝！','これお礼の欠片、3つあげる☆ 拠点の客室で待ってるね。欠片集めたら、うちが強くしたげるから！']);}
function mansionHoshiDefeatCheck(){if(M.hoshiState!=='active')return;const e=M.enemies.find(e=>e.kind==='hoshiBoss');if(e&&e.hp<=0)mansionHoshiWin();}
function mansionHoshiBulletUpdate(){if(M.room!=='obsDome')return;for(const b of M.enemyShots)if((b.kind==='hStarRain'&&b.y>HOSHI_FLOOR-4)){b.dead=true;mansionBurst(b.x,HOSHI_FLOOR-4,'#c99aff',3);}}
function mansionHoshiPortrait(p,c){const sp=M.talk?.speaker;if(sp!=='ダーク星詠み'&&sp!=='星詠み')return false;const dark=sp==='ダーク星詠み',f=HOSHI_ART[dark?'darkFace':'normalFace'];c.setAttribute('aria-label',sp);
 if(f){p.imageSmoothingEnabled=f.img.width>64;p.drawImage(f.img,0,0,f.img.width,f.img.height,0,0,96,96);return true;}
 const F=(x,y,w,h,c)=>{p.fillStyle=c;p.fillRect(x*4,y*4,w*4,h*4);},hair=dark?'#1a1424':'#2a2234',st=dark?'#9a4adf':'#b878ff';
 p.fillStyle=dark?'#1a0e30':'#2a2050';p.fillRect(0,0,96,96);F(3,4,18,20,hair);F(6,8,12,12,'#f4dcd0');F(5,4,14,5,hair);F(5,6,2,12,st);F(17,6,2,10,st);F(8,13,3,2,dark?'#ff3a4a':'#ff7a8a');F(13,13,3,2,dark?'#ff3a4a':'#ff7a8a');F(10,17,4,1,'#c84a6a');F(16,3,4,4,st);F(17,4,2,2,'#ffe0ff');F(4,20,16,4,dark?'#b8b0cc':'#f4f2fa');F(9,20,6,4,'#141018');return true;}

// ---------------------------------------------------------------- hub NPC
function drawHoshiNPC(x,y,t,dir){drawHoshi('normal',x,y,((t/150|0)%4===3)?'peace':'idle',t,dir);}
function mansionHoshiTalk(){const first=!M.flags.hoshiyomiHub;M.flags.hoshiyomiHub=true;
 mansionTalkShow('星詠み',first?['やっほー☆ 来てくれたじゃん！ さっきはマジごめんね。','星詠みの欠片、館の敵とか書庫の奥に落ちてるっぽい。','持ってきてくれたら、うちが星の力で強くしたげる！ 任せて☆']:['欠片持ってきた？ 見せて見せて☆'],mansionUpgradeOpen);}
HUB_NPCS.push({id:'hoshiyomi',room:'bedroom',x:520,y:208,name:'星詠み',enabled:()=>!!M.flags.hoshiyomiDefeated,draw:drawHoshiNPC,talk:mansionHoshiTalk});
function mansionHoshiRetry(){M.hoshiState='ready';M.enemyShots=[];M.shots=[];M.hp=mansionMaxHP();M.hurt=60;M.poseT=M.castT=M.stepT=0;M.x=110;M.y=HOSHI_FLOOR;M.vx=M.vy=0;M.hoshiTries=(M.hoshiTries||0)+1;
 const e=M.enemies.find(e=>e.kind==='hoshiBoss');if(e)Object.assign(e,mansionNewHoshi());
 mansionTalkShow('ダーク星詠み',['キャハッ☆ もう終わり？ 弱すぎじゃん。','……でも、なんか胸がざわつく。……もっかい来なよ。'],mansionHoshiStart);}
// trapdoor hatches over downward vertical exits in walk paths (bedroom → hubCellar).
// Solid only from above while closed; 調べる on top opens it for a moment.
const MANSION_HATCHES={bedroom:[320,208,48,8]};
function mansionHatchNear(){const h=MANSION_HATCHES[M.room];return !!h&&M.ground&&M.x>h[0]-4&&M.x<h[0]+h[2]+4&&Math.abs(M.y-h[1])<3;}
function mansionHatchSolids(){const h=MANSION_HATCHES[M.room];if(!h)return[];if(M.hatchT>0&&M.hatchRoom===M.room)return[];return M.y<=h[1]+1?[h]:[];}
function mansionHatchUse(){if(!mansionHatchNear())return false;M.hatchT=40;M.hatchRoom=M.room;M.x=Math.max(MANSION_HATCHES[M.room][0]+8,Math.min(MANSION_HATCHES[M.room][0]+MANSION_HATCHES[M.room][2]-8,M.x));M.ground=false;sfx('tink');return true;}
function mansionHatchDraw(){const h=MANSION_HATCHES[M.room];if(!h)return;if(M.hatchT>0){M.hatchT--;mrect(h[0],h[1],4,h[3],'#4a3420');return;}mrect(h[0],h[1],h[2],h[3],'#6a4a2c');mrect(h[0],h[1],h[2],2,'#9a744a');for(let x=h[0]+15;x<h[0]+h[2];x+=16)mrect(x,h[1]+2,1,h[3]-2,'#3a2614');mrect(h[0]+h[2]/2-4,h[1]+3,8,2,'#d9b56a');}
