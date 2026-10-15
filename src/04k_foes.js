
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
function mansionFoeArtLoad(kind,img,meta){MANSION_FOE_ART[kind]={img,meta};if(meta.hitbox&&MANSION_FOES[kind]){MANSION_FOES[kind].box=[meta.hitbox[2],meta.hitbox[3]];}if(meta.contact&&MANSION_FOES[kind])MANSION_FOES[kind].contact=meta.contact.slice();}
(function(){if(typeof fetch!=='function')return;fetch('assets/enemies/manifest.json').then(r=>r.ok?r.json():{kinds:[]}).then(m=>{for(const kind of m.kinds||[])fetch('assets/enemies/'+kind+'.json').then(r=>r.json()).then(meta=>{const img=new Image();img.onload=()=>mansionFoeArtLoad(kind,img,meta);img.src='assets/enemies/'+kind+'.png';}).catch(()=>{});}).catch(()=>{});})();

function mansionFoeSpawn(e,i){const[kind,x,y,min,max,o={}]=e;
 if(kind==='walk'||kind==='fly')return[{kind,x,y,baseY:y,min,max,dir:i%2?-1:1,hp:kind==='fly'?2:3,t:0,flash:0}];
 const base=(k,xx,yy,extra)=>Object.assign({kind:k,x:xx,y:yy,homeX:xx,homeY:yy,baseY:yy,min,max,dir:i%2?-1:1,face:i%2?-1:1,hp:(MANSION_FOES[k]||{hp:2}).hp,t:(i*37)%60,flash:0,vx:0,vy:0,state:'idle',st:0},extra||{});
 if(kind==='bats'){const n=o.n||3;return Array.from({length:n},(_,k)=>base('bat',x-((n-1)*9)+k*18,y-((y/16|0)?0:0)-0+(k%2)*3-(o.hang===false?0:0),{state:'sleep',t:k*13}));}
 if(kind==='slime'||kind==='bat')return[base(kind,x,y-0,{state:kind==='slime'?'hang':'sleep'})];
 if(kind==='turret')return[base(kind,x,y-(o.alt??40),{baseY:y-(o.alt??40)})];
 if(kind==='crawler'){const r=MR[M.room],c=x>>4,row=(y>>4)-1,side=o.wall??(artSolid(r,c+1,row)?1:artSolid(r,c-1,row)?-1:0);let top=row,bot=row;if(side){while(top>0&&!artSolid(r,c,top-1)&&artSolid(r,c+side,top-1))top--;while(bot<r.grid.length-1&&!artSolid(r,c,bot+1)&&artSolid(r,c+side,bot+1))bot++;}
  return[base(kind,side?c*16+8+side*1:x,y,{side,minY:top*16+14,maxY:(bot+1)*16,dir:-1})];}
 return[base(kind,x,y)];}

function mansionFoeBox(e){const F=MANSION_FOES[e.kind];return[e.x-F.box[0]/2,e.y-F.box[1],F.box[0],F.box[1]];}
function mansionFoeHit(e,x,y,w,h){return mansionOverlap(x,y,w,h,mansionFoeBox(e));}
// true when the attack comes from the side the shield faces (fromDir = sign(attacker.x - e.x))
function mansionFoeBlock(e,fromDir){if(e.kind!=='shield'||e.hp<=0)return false;if(fromDir!==e.face)return false;e.blockT=10;mansionBurst(e.x+e.face*12,e.y-26,'#dfe8f5',4);return true;}
function mansionFoeSolid(x,y,w,h,solids){return solids.some(b=>mansionOverlap(x,y,w,h,b));}
function mansionFoeBody(e,solids,w,h){e.vy=Math.min(5,e.vy+.28);
 const nx=e.x+e.vx;if(!mansionFoeSolid(nx-w/2,e.y-h,w,h-1,solids))e.x=nx;else e.vx=0;
 const ny=e.y+e.vy;if(!mansionFoeSolid(e.x-w/2,ny-h,w,h,solids)){e.y=ny;e.ground=false;}else{if(e.vy>0){e.ground=true;while(!mansionFoeSolid(e.x-w/2,e.y-h+1,w,h,solids))e.y++;}e.vy=0;}}

function mansionFoeUpdate(e,solids){const F=MANSION_FOES[e.kind],dx=M.x-e.x,dy=(M.y-13)-(e.y-F.box[1]/2),ad=Math.abs(dx);e.st++;if(e.blockT)e.blockT--;
 if(e.kind==='shield'){const want=Math.sign(dx)||e.face;
  if(ad<130&&Math.abs(M.y-e.y)<40){if(want!==e.face){e.turnT=(e.turnT||0)+1;if(e.turnT>42){e.face=want;e.turnT=0;}}else{e.turnT=0;e.x+=e.face*.45;}e.state=e.turnT?'turn':'guard';}
  else{e.x+=e.face*.35;e.state='walk';if(e.x<e.min){e.x=e.min;e.face=1;}if(e.x>e.max){e.x=e.max;e.face=-1;}}
  e.x=Math.max(e.min-24,Math.min(e.max+24,e.x));
  if(mansionFoeSolid(e.x+e.face*12-1,e.y-30,2,20,solids)||!mansionFoeSolid(e.x+e.face*12-1,e.y+1,2,2,solids)){e.x-=e.face*.6;}}
 else if(e.kind==='crawler'){if(e.side){e.y+=e.dir*.6;if(e.y<e.minY){e.y=e.minY;e.dir=1;}if(e.y>e.maxY){e.y=e.maxY;e.dir=-1;}}else{e.x+=e.face*.5;if(e.x<e.min||e.x>e.max)e.face*=-1;}e.state='crawl';}
 else if(e.kind==='turret'){e.y=e.baseY+Math.sin(e.t*.04)*5;e.x=e.homeX+Math.sin(e.t*.017)*10;e.face=Math.sign(dx)||1;
  const near=ad<150&&Math.abs(dy)<120;if(e.state==='idle'&&near&&e.st>90){e.state='charge';e.st=0;}
  if(e.state==='charge'&&e.st>36){const a=Math.atan2((M.y-14)-(e.y-8),M.x-e.x);M.enemyShots.push({x:e.x,y:e.y-8,vx:Math.cos(a)*2.1,vy:Math.sin(a)*2.1,damage:2});sfx('shot');e.state='fire';e.st=0;}
  if(e.state==='fire'&&e.st>14){e.state='idle';e.st=0;}}
 else if(e.kind==='bat'){if(e.state==='sleep'){if(ad<92&&Math.abs(dy)<110){e.state='fly';e.st=0;e.vx=0;e.vy=1.2;}}
  else{const home=Math.hypot(e.x-e.homeX,e.y-e.homeY)>220,tx=home?e.homeX:M.x+Math.sin(e.t*.07+e.homeX)*18,ty=home?e.homeY:M.y-18+Math.cos(e.t*.09)*10;
   e.vx+=Math.sign(tx-e.x)*.08;e.vy+=Math.sign(ty-e.y)*.07;const sp=Math.hypot(e.vx,e.vy);if(sp>1.6){e.vx*=1.6/sp;e.vy*=1.6/sp;}
   if(!mansionFoeSolid(e.x+e.vx-5,e.y-10,10,10,solids))e.x+=e.vx;else e.vx*=-.5;if(!mansionFoeSolid(e.x-5,e.y+e.vy-10,10,10,solids))e.y+=e.vy;else e.vy*=-.5;
   e.face=Math.sign(e.vx)||e.face;if(home&&Math.hypot(e.x-e.homeX,e.y-e.homeY)<6){e.state='sleep';e.x=e.homeX;e.y=e.homeY;e.vx=e.vy=0;}}}
 else if(e.kind==='bookmimic'){mansionFoeBody(e,solids,16,14);if(e.ground){e.vx*=.6;if(ad<120&&Math.abs(M.y-e.y)<60&&e.st>46){e.vy=-4.2;e.vx=1.5*(Math.sign(dx)||1);e.face=Math.sign(dx)||1;e.st=0;e.ground=false;}
   const awake=ad<120;e.state=awake?(e.st<10?'land':'idle'):'idle';e.awake=awake;}else e.state='hop';}
 else if(e.kind==='slime'){if(e.state==='hang'){if(ad<18&&M.y>e.y){e.state='fall';e.vy=0;sfx('hit');}}
  else{mansionFoeBody(e,solids,14,10);if(e.ground){e.state='crawl';e.vx=(Math.sign(dx)||1)*.35;e.face=Math.sign(dx)||1;}}}
 const C=F.contact;if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.x+C[0],e.y+C[1],C[2],C[3]]))mansionDamage(F.dmg,M.x<e.x?-1:1);}

// ---------------------------------------------------------------- drawing
function mansionFoeDrawSheet(e){const a=MANSION_FOE_ART[e.kind];if(!a)return false;const m=a.meta,an=(m.anims||{})[e.state]||(m.anims||{}).idle||{frames:[0],fps:1};
 const fw=m.frame[0],fh=m.frame[1],[ax,ay]=m.anchor||[fw/2,fh],n=an.frames.length,k=an.loop===false?Math.min(n-1,Math.floor(e.st*(an.fps||8)/60)):Math.floor(e.t*(an.fps||8)/60)%n,f=an.frames[k],per=Math.max(1,Math.floor(a.img.width/fw));
 const flip=(e.face||1)!==(m.facing||1);g.save();g.translate(Math.round(e.x),Math.round(e.y));if(e.kind==='crawler'&&e.side){g.rotate(-e.side*Math.PI/2);}if(flip)g.scale(-1,1);if(e.flash&&e.flash%2)g.globalAlpha=.55;
 g.drawImage(a.img,(f%per)*fw,Math.floor(f/per)*fh,fw,fh,-ax,-ay,fw,fh);g.restore();return true;}
function mansionFoeDraw(e){if(mansionFoeDrawSheet(e))return;const x=Math.round(e.x),y=Math.round(e.y),f=e.face||1,t=e.t,fl=e.flash&&e.flash%2;const R=(a,b,w,h,c)=>mrect(f>0?x+a:x-a-w,y+b,w,h,fl?'#ffffff':c);
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
