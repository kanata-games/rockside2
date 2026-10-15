
// =====================================================================
//  FOES (test.42): data-driven enemy kinds + sprite-sheet loader.
//  Rooms list enemies in def.foes ([kind,col,row,{opts}]) or with the
//  legacy 'w'/'f' markers. Art drops in as assets/enemies/<kind>.png +
//  <kind>.json (listed in assets/enemies/manifest.json); until then a
//  pixel placeholder is drawn. Sheet spec: docs/STAGE_GUIDE.md.
// =====================================================================
const MANSION_FOES={
 // box = [w,h] hurtbox above the feet point; contact = [dx,dy,w,h] that hurts Umine (relative to feet)
 shield:{hp:4,box:[22,40],contact:[-11,-40,22,26],dmg:2},   // gap under the shield arm: slide (h14) passes, standing (h26) does not
 crawler:{hp:2,box:[14,14],contact:[-7,-14,14,14],dmg:2},
 turret:{hp:3,box:[18,16],contact:[-8,-16,16,16],dmg:2},
 bat:{hp:1,box:[14,10],contact:[-6,-10,12,10],dmg:1},
 bookmimic:{hp:3,box:[20,16],contact:[-9,-15,18,15],dmg:2},
 slime:{hp:2,box:[18,12],contact:[-8,-11,16,11],dmg:2},
};
const MANSION_FOE_ART={};
// game kind -> sheet file in assets/enemies (manifest may also list kinds directly)
const MANSION_FOE_SHEETS={shield:'armor',crawler:'crawler',turret:'turret',bat:'bat',bookmimic:'book',slime:'slime'};
// internal AI state -> sheet animation
const MANSION_FOE_ANIM={walk:'move',guard:'guard',turn:'idle',tele:'telegraph',atk:'attack',crawl:'move',idle:'idle',charge:'telegraph',fire:'attack',sleep:'idle',fly:'move',hop:'move',land:'idle',hang:'idle',fall:'fall'};
// Normalises a sheet json (art team format: frame{w,h}, anchor{cx,feet_y}, animations{frames,ms,loop,active}, hitbox{body,attack} in frame px, all facing right)
// into foe-space boxes relative to the feet point, facing right. Left-facing boxes are mirrored by mansionFoeRel.
function mansionFoeMeta(raw){const fw=raw.frame.w??raw.frame[0],fh=raw.frame.h??raw.frame[1],body=raw.hitbox&&(raw.hitbox.body||(Array.isArray(raw.hitbox)?null:null));
 const fy=raw.anchor?.feet_y??fh,bodyBox=body||[0,0,fw,fh],px=bodyBox[0]+bodyBox[2]/2; // pivot = body centre (armor's spear pulls the nominal cx off-centre)
 const rel=b=>b&&[b[0]-px,b[1]-fy,b[2],b[3]];
 const anims={};for(const[k,a]of Object.entries(raw.animations||raw.anims||{}))anims[k]={frames:a.frames,ms:a.ms||(a.fps?1000/a.fps:120),loop:a.loop!==false,active:a.active||null};
 const m={fw,fh,px,fy,anims,body:rel(bodyBox),attack:rel(raw.hitbox?.attack),guard:rel(raw.hitbox?.guard_block),rot:raw.wall_rotation||null};
 const ps=raw.projectile_spawn?.attack;if(ps)m.spawn=[ps.x-px,ps.y-fy,ps.frame||0];
 if(raw.projectile)m.projectile={fw:raw.projectile.frame.w,fh:raw.projectile.frame.h,frames:raw.projectile.frames,ms:raw.projectile.ms||80};
 return m;}
function mansionFoeArtLoad(kind,img,raw,bulletImg){const m=mansionFoeMeta(raw);MANSION_FOE_ART[kind]={img,meta:m,bullet:bulletImg||null};const F=MANSION_FOES[kind];if(!F)return m;
 F.hb=m.body.slice();F.box=[m.body[2],-m.body[1]];
 // contact: the body, except the shield walker keeps its 14px slide gap under the shield arm
 F.contact=m.body.slice();if(kind==='shield'){const bot=F.contact[1]+F.contact[3];if(bot>-15)F.contact[3]-=bot+15;}
 if(m.attack)F.atk=m.attack.slice();
 return m;}
(function(){if(typeof fetch!=='function')return;const base='assets/enemies/';
 fetch(base+'manifest.json').then(r=>r.ok?r.json():{kinds:{}}).then(man=>{const list=Array.isArray(man.kinds)?man.kinds.map(k=>[k,MANSION_FOE_SHEETS[k]||k]):Object.entries(man.kinds||{});
  for(const[kind,file]of list)fetch(base+file+'.json').then(r=>r.json()).then(raw=>{const img=new Image();img.onload=()=>{if(raw.projectile){const b=new Image();b.onload=()=>mansionFoeArtLoad(kind,img,raw,b);b.onerror=()=>mansionFoeArtLoad(kind,img,raw);b.src=base+raw.projectile.image;}else mansionFoeArtLoad(kind,img,raw);};img.src=base+(raw.image||file+'.png');}).catch(()=>{});}).catch(()=>{});})();

function mansionFoeSpawn(e,i){const[kind,x,y,min,max,o={}]=e;
 if(kind==='walk'||kind==='fly')return[{kind,x,y,baseY:y,min,max,dir:i%2?-1:1,hp:kind==='fly'?2:3,t:0,flash:0}];
 const base=(k,xx,yy,extra)=>Object.assign({kind:k,x:xx,y:yy,homeX:xx,homeY:yy,baseY:yy,min,max,dir:i%2?-1:1,face:i%2?-1:1,hp:(MANSION_FOES[k]||{hp:2}).hp,t:(i*37)%60,flash:0,vx:0,vy:0,state:'idle',st:0},extra||{});
 if(kind==='bats'){const n=o.n||3;return Array.from({length:n},(_,k)=>base('bat',x-((n-1)*9)+k*18,y-((y/16|0)?0:0)-0+(k%2)*3-(o.hang===false?0:0),{state:'sleep',t:k*13}));}
 if(kind==='slime'||kind==='bat')return[base(kind,x,y-0,{state:kind==='slime'?'hang':'sleep'})];
 if(kind==='turret')return[base(kind,x,y-(o.alt??40),{baseY:y-(o.alt??40)})];
 if(kind==='crawler'){const r=MR[M.room],c=x>>4,row=(y>>4)-1,side=o.wall??(artSolid(r,c+1,row)?1:artSolid(r,c-1,row)?-1:0);let top=row,bot=row;if(side){while(top>0&&!artSolid(r,c,top-1)&&artSolid(r,c+side,top-1))top--;while(bot<r.grid.length-1&&!artSolid(r,c,bot+1)&&artSolid(r,c+side,bot+1))bot++;}
  return[base(kind,side?c*16+8+side*1:x,y,{side,minY:top*16+14,maxY:(bot+1)*16,dir:-1})];}
 return[base(kind,x,y)];}

function mansionFoeRel(e,b){const f=e.face||1;return f>0?[e.x+b[0],e.y+b[1],b[2],b[3]]:[e.x-b[0]-b[2],e.y+b[1],b[2],b[3]];}
function mansionFoeBox(e){const F=MANSION_FOES[e.kind];if(F.hb)return mansionFoeRel(e,F.hb);return[e.x-F.box[0]/2,e.y-F.box[1],F.box[0],F.box[1]];}
function mansionFoeHit(e,x,y,w,h){return mansionOverlap(x,y,w,h,mansionFoeBox(e));}
// true when the attack comes from the side the shield faces (fromDir = sign(attacker.x - e.x))
function mansionFoeBlock(e,fromDir){if(e.kind!=='shield'||e.hp<=0)return false;if(fromDir!==e.face)return false;e.blockT=10;mansionBurst(e.x+e.face*12,e.y-26,'#dfe8f5',4);return true;}
function mansionFoeSolid(x,y,w,h,solids){return solids.some(b=>mansionOverlap(x,y,w,h,b));}
function mansionFoeBody(e,solids,w,h){e.vy=Math.min(5,e.vy+.28);
 const nx=e.x+e.vx;if(!mansionFoeSolid(nx-w/2,e.y-h,w,h-1,solids))e.x=nx;else e.vx=0;
 const ny=e.y+e.vy;if(!mansionFoeSolid(e.x-w/2,ny-h,w,h,solids)){e.y=ny;e.ground=false;}else{if(e.vy>0){e.ground=true;while(!mansionFoeSolid(e.x-w/2,e.y-h+1,w,h,solids))e.y++;}e.vy=0;}}

// telegraph/attack lengths follow the sheet (ms -> 60fps frames); placeholders use the same defaults
function mansionFoeLen(kind,anim,def){const m=MANSION_FOE_ART[kind]?.meta,a=m&&m.anims[anim];return a?Math.max(6,Math.round(a.frames.length*a.ms*.06)):def;}
function mansionFoeActive(e){const m=MANSION_FOE_ART[e.kind]?.meta,a=m&&m.anims.attack;if(!a||!a.active)return e.st<12;const k=Math.floor(e.st/(a.ms*.06));return a.active.includes(k);}
const MANSION_FOE_ATK={shield:[8,-22,16,7],crawler:[4,-12,6,9],bat:[-2,-10,9,8],bookmimic:[1,-18,9,14],slime:[0,-12,9,10]};
function mansionFoeGo(e,s){e.state=s;e.st=0;}
function mansionFoeUpdate(e,solids){const F=MANSION_FOES[e.kind],dx=M.x-e.x,dy=(M.y-13)-(e.y-F.box[1]/2),ad=Math.abs(dx);e.st++;if(e.blockT)e.blockT--;if(e.cool)e.cool--;
 const TELE=mansionFoeLen(e.kind,'telegraph',24),ATK=mansionFoeLen(e.kind,'attack',12),go=s=>mansionFoeGo(e,s);
 if(e.state==='tele'){if(e.st>=TELE){go('atk');if(e.kind==='bat'){const a=Math.atan2((M.y-12)-(e.y-6),M.x-e.x);e.vx=Math.cos(a)*3;e.vy=Math.sin(a)*3;}if(e.kind==='slime'){e.vx=e.face*2;e.vy=-2.6;}if(e.kind==='bookmimic'){e.vx=e.face*2;e.vy=-2.2;}}}
 else if(e.state==='atk'){if(e.kind==='bat'){if(!mansionFoeSolid(e.x+e.vx-5,e.y+e.vy-10,10,10,solids)){e.x+=e.vx;e.y+=e.vy;}}if(e.kind==='slime'||e.kind==='bookmimic')mansionFoeBody(e,solids,14,12);
  if(e.st>=ATK+(e.kind==='bat'?14:0)){go(e.kind==='bat'?'fly':e.kind==='shield'?'guard':e.kind==='slime'?'crawl':e.kind==='crawler'?'crawl':'idle');e.cool=e.kind==='shield'?70:60;}}
 else if(e.kind==='shield'){const want=Math.sign(dx)||e.face;
  if(ad<130&&Math.abs(M.y-e.y)<40){if(want!==e.face){e.turnT=(e.turnT||0)+1;if(e.turnT>42){e.face=want;e.turnT=0;}e.state='turn';}else{e.turnT=0;if(ad<46&&!e.cool){go('tele');}else{e.x+=e.face*.45;e.state='guard';}}}
  else{e.x+=e.face*.35;e.state='walk';if(e.x<e.min){e.x=e.min;e.face=1;}if(e.x>e.max){e.x=e.max;e.face=-1;}}
  e.x=Math.max(e.min-24,Math.min(e.max+24,e.x));
  if(mansionFoeSolid(e.x+e.face*12-1,e.y-30,2,20,solids)||!mansionFoeSolid(e.x+e.face*12-1,e.y+1,2,2,solids)){e.x-=e.face*.6;}}
 else if(e.kind==='crawler'){if(ad<34&&Math.abs(dy)<34&&!e.cool){go('tele');}else{if(e.side){e.y+=e.dir*.6;if(e.y<e.minY){e.y=e.minY;e.dir=1;}if(e.y>e.maxY){e.y=e.maxY;e.dir=-1;}}else{e.x+=e.face*.5;if(e.x<e.min||e.x>e.max)e.face*=-1;}e.state='crawl';}}
 else if(e.kind==='turret'){e.y=e.baseY+Math.sin(e.t*.04)*5;e.x=e.homeX+Math.sin(e.t*.017)*10;e.face=Math.sign(dx)||1;
  const near=ad<150&&Math.abs(dy)<120;if(e.state==='idle'&&near&&e.st>90){e.state='charge';e.st=0;}
  if(e.state==='charge'&&e.st>=Math.max(TELE,30)){const m=MANSION_FOE_ART.turret?.meta,sp=m&&m.spawn?mansionFoeRel(e,[m.spawn[0],m.spawn[1],0,0]):[e.x+e.face*10,e.y-8];const a=Math.atan2((M.y-14)-sp[1],M.x-sp[0]);M.enemyShots.push({kind:'tbullet',x:sp[0],y:sp[1],vx:Math.cos(a)*2.1,vy:Math.sin(a)*2.1,damage:2,age:0});sfx('shot');e.state='fire';e.st=0;}
  if(e.state==='fire'&&e.st>Math.max(ATK,12)){e.state='idle';e.st=0;}}
 else if(e.kind==='bat'){if(e.state==='sleep'){if(ad<92&&Math.abs(dy)<110){e.state='fly';e.st=0;e.vx=0;e.vy=1.2;}}
  else{if(e.st>40&&!e.cool&&Math.hypot(dx,dy)<54){go('tele');e.vx*=.2;e.vy*=.2;}else{const home=Math.hypot(e.x-e.homeX,e.y-e.homeY)>220,tx=home?e.homeX:M.x+Math.sin(e.t*.07+e.homeX)*30,ty=home?e.homeY:M.y-40+Math.cos(e.t*.09)*10;
   e.vx+=Math.sign(tx-e.x)*.08;e.vy+=Math.sign(ty-e.y)*.07;const sp=Math.hypot(e.vx,e.vy);if(sp>1.6){e.vx*=1.6/sp;e.vy*=1.6/sp;}
   if(!mansionFoeSolid(e.x+e.vx-5,e.y-10,10,10,solids))e.x+=e.vx;else e.vx*=-.5;if(!mansionFoeSolid(e.x-5,e.y+e.vy-10,10,10,solids))e.y+=e.vy;else e.vy*=-.5;
   e.face=Math.sign(e.vx)||e.face;if(home&&Math.hypot(e.x-e.homeX,e.y-e.homeY)<6){e.state='sleep';e.x=e.homeX;e.y=e.homeY;e.vx=e.vy=0;}}}}
 else if(e.kind==='bookmimic'){mansionFoeBody(e,solids,16,14);if(e.ground){e.vx*=.6;e.awake=ad<120&&Math.abs(M.y-e.y)<60;
   if(e.awake&&ad<30&&!e.cool){e.face=Math.sign(dx)||1;go('tele');}
   else if(e.awake&&e.st>46){e.vy=-4.2;e.vx=1.5*(Math.sign(dx)||1);e.face=Math.sign(dx)||1;e.st=0;e.ground=false;e.state='hop';}
   else if(e.state==='hop')e.state='land';}else if(e.state!=='hop')e.state='hop';}
 else if(e.kind==='slime'){if(e.state==='hang'){if(ad<18&&M.y>e.y){e.state='fall';e.st=0;e.vy=0;sfx('hit');}}
  else{mansionFoeBody(e,solids,14,10);if(e.ground){e.face=Math.sign(dx)||1;if(ad<30&&Math.abs(M.y-e.y)<20&&!e.cool)go('tele');else{e.state='crawl';e.vx=e.face*.35;}}}}
 const C=F.contact,body=F.hb?mansionFoeRel(e,C):[e.x+C[0],e.y+C[1],C[2],C[3]],pb=[M.x-MC.w/2,M.y-M.h,MC.w,M.h];
 if(mansionOverlap(...pb,body))mansionDamage(F.dmg,M.x<e.x?-1:1);
 else if(e.state==='atk'&&mansionFoeActive(e)){const ab=F.atk||MANSION_FOE_ATK[e.kind];if(ab&&mansionOverlap(...pb,mansionFoeRel(e,ab)))mansionDamage(F.dmg,M.x<e.x?-1:1);}}

// ---------------------------------------------------------------- drawing
function mansionFoeDrawSheet(e,forceAnim,forceT){const a=MANSION_FOE_ART[e.kind];if(!a)return false;const m=a.meta;
 let name=forceAnim||(e.flash>0?'hurt':MANSION_FOE_ANIM[e.state]||'idle');if(!m.anims[name])name=name==='guard'?'idle':name==='fall'?'move':'idle';const an=m.anims[name]||{frames:[0],ms:200,loop:true};
 const el=(forceT!=null?forceT:name==='hurt'?8-e.flash:an.loop?e.t:e.st)*16.667,n=an.frames.length,k=an.loop?Math.floor(el/an.ms)%n:Math.min(n-1,Math.floor(el/an.ms)),f=an.frames[k],per=Math.max(1,Math.floor(a.img.width/m.fw));
 g.save();g.translate(Math.round(e.x),Math.round(e.y));
 if(e.kind==='crawler'&&e.side){const r=m.rot||{right_wall:-90,left_wall:90};g.rotate((e.side>0?r.right_wall:r.left_wall)*Math.PI/180);}
 else if(e.kind==='slime'&&e.state==='hang'){g.translate(0,-10);g.scale(1,-1);g.translate(0,-8);}
 else if(e.kind==='bat'&&e.state==='sleep'){g.translate(0,-12);g.scale(1,-1);g.translate(0,-4);}
 if((e.face||1)<0)g.scale(-1,1);
 g.drawImage(a.img,(f%per)*m.fw,Math.floor(f/per)*m.fh,m.fw,m.fh,-m.px,-m.fy,m.fw,m.fh);g.restore();return true;}
function mansionFoeDeathDraw(e){if(!MANSION_FOE_ART[e.kind])return;e.deadT=(e.deadT||0)+1;if(e.deadT<34)mansionFoeDrawSheet(e,'death',e.deadT);}
function mansionFoeBulletDraw(s){const a=MANSION_FOE_ART.turret;if(!a||!a.bullet||!a.meta.projectile)return false;const p=a.meta.projectile;s.age=(s.age||0)+1;const f=p.frames[Math.floor(s.age*16.667/p.ms)%p.frames.length];g.drawImage(a.bullet,f*p.fw,0,p.fw,p.fh,Math.round(s.x-p.fw/2),Math.round(s.y-p.fh/2),p.fw,p.fh);return true;}
function mansionFoeDraw(e){if(mansionFoeDrawSheet(e))return;const x=Math.round(e.x),y=Math.round(e.y),f=e.face||1,t=e.t,fl=e.flash&&e.flash%2;const R=(a,b,w,h,c)=>mrect(f>0?x+a:x-a-w,y+b,w,h,fl?'#ffffff':c);
 if(e.state==='tele'&&(e.t&4)){mrect(x-2,y-(MANSION_FOES[e.kind].box[1]+8),4,4,'#ffd06a');}
 if(e.kind==='shield'){const step=e.state==='walk'?((t>>4)&1):0;
  R(-9,-12+step,4,12-step,'#3a4258');R(4,-12+(1-step),4,12-(1-step),'#3a4258');R(-10,-2,6,2,'#8d98b0');R(3,-2,6,2,'#8d98b0');                 // legs (open gap underneath)
  R(-10,-34,18,22,'#4f5a78');R(-9,-33,16,3,'#a9b6d0');R(-8,-27,12,2,'#2c3248');R(-6,-42,12,9,'#5d6a8a');R(-5,-41,10,2,'#c9d4ea');R(0,-38,5,2,e.state==='guard'?'#ff6a5a':'#ffcf6a'); // torso + helm visor
  R(8,-40,6,30,'#7d6a4a');R(9,-39,4,28,'#c9a65c');R(10,-30,2,8,'#fff1b8');R(7,-41,8,2,'#e6cf8a');                                   // tower shield on the facing side
  if(e.blockT)R(14,-36,2,20,'#ffffff');if(e.state==='turn'&&(t&4))R(-4,-46,2,3,'#ffd06a');}
 else if(e.kind==='crawler'){g.save();g.translate(x,y-7);if(e.side)g.rotate(e.side*Math.PI/2);const w=(t>>3)&1;mrect(-7,-4,14,8,fl?'#fff':'#5a3a6a');mrect(-6,-5,12,2,'#9a6aa8');for(let k=-6;k<=4;k+=5){mrect(k,4+(w^(k&1)),2,3,'#c9a0d0');mrect(k,-7-(w^(k&1)),2,3,'#c9a0d0');}mrect(-2,-2,4,4,'#ff6a8a');mrect(-1,-1,1,1,'#fff');g.restore();}
 else if(e.kind==='turret'){const ch=e.state==='charge';mrect(x-9,y-14,18,12,fl?'#fff':'#3a4662');mrect(x-8,y-15,16,2,'#8ea3bf');mrect(x-3,y-2,6,3,'#2a3348');for(let k=0;k<3;k++)mrect(x-6+k*5,y+1+((t>>2)+k)%3,2,2,'#7fe8f0');
  const a=Math.atan2((M.y-14)-(y-8),M.x-x);g.save();g.translate(x,y-8);g.rotate(a);mrect(0,-2,11,4,'#5d6a8a');mrect(9,-2,2,4,ch&&(t&2)?'#ffffff':'#ff7a5a');g.restore();mrect(x-2,y-11,4,4,ch?'#ffef9a':'#7fe8f0');
  if(ch){g.globalAlpha=.35;g.fillStyle='#ffd06a';g.beginPath();g.arc(x,y-8,6+e.st/6,0,7);g.fill();g.globalAlpha=1;}}
 else if(e.kind==='bat'){if(e.state==='sleep'){mrect(x-3,y-11,6,9,fl?'#fff':'#2a1f3a');mrect(x-4,y-12,8,2,'#4a3a5e');mrect(x-1,y-12,2,1,'#7a6a8e');mrect(x-2,y-5,1,1,'#ff5a7a');mrect(x+1,y-5,1,1,'#ff5a7a');}
  else{const w=(t>>2)&1;mrect(x-3,y-8,6,6,fl?'#fff':'#2a1f3a');mrect(x-2,y-6,1,1,'#ff5a7a');mrect(x+1,y-6,1,1,'#ff5a7a');mrect(x-9,y-8+(w?-3:2),6,3,'#4a3a5e');mrect(x+3,y-8+(w?-3:2),6,3,'#4a3a5e');mrect(x-10,y-7+(w?-4:3),2,2,'#6a5a7e');mrect(x+8,y-7+(w?-4:3),2,2,'#6a5a7e');}}
 else if(e.kind==='bookmimic'){const open=e.state==='hop'||e.awake&&(t>>4)%3===0,o=open?5:0;
  R(-10,-8,20,8,'#5b2f3a');R(-10,-8,20,2,'#a8565a');R(-9,-2,18,2,'#efe2c4');                                           // lower cover + pages
  R(-10,-16-o,20,8,'#6d3b45');R(-10,-16-o,20,2,'#c97a6a');R(-2,-14-o,4,4,'#d4a46e');R(-1,-13-o,2,2,'#fff1c2');           // upper cover with clasp
  if(open){for(let k=-8;k<8;k+=3){R(k,-8-o+1,2,3,'#ffffff');R(k+1,-8,2,2,'#ffffff');}R(-9,-8-o,18,o,'#2a0f18');R(4,-12-o,2,2,'#ffef5a');}else R(8,-10,2,2,'#ffef5a');}
 else if(e.kind==='slime'){const sq=e.state==='crawl'?Math.sin(t*.2)*2:0;if(e.state==='hang'){const dr=(t%90)/90;mrect(x-6,y-10,12,8,fl?'#fff':'#2f8fa0');mrect(x-4,y-11,8,2,'#7fe8f0');mrect(x-2,y-3,4,3+Math.floor(dr*3),'#2f8fa0');mrect(x-2,y-7,1,1,'#fff');mrect(x+2,y-7,1,1,'#fff');if(dr>.8)mrect(x-1,y+2+(dr-.8)*40,2,3,'#7fe8f0');}
  else{mrect(x-8-sq,y-8+sq,16+sq*2,8-sq,fl?'#fff':'#2f8fa0');mrect(x-6-sq,y-9+sq,12+sq*2,2,'#7fe8f0');mrect(x-3,y-6,2,2,'#fff');mrect(x+2,y-6,2,2,'#fff');mrect(x-8,y-1,16,1,'#1d5f6e');}}
}
