// ROCKSIDE II mansion vertical slice: rooms, collision, magic wall-kick and slide.
const MANSION_KEY='rockside2_mansion_v1';
const MC={w:14,h:26,slideH:18,run:1.8,acc:.42,gravity:.28,fall:6.5,jump:5.8,wallFall:1.15,wallJump:5.6,wallPush:2.5,slide:4.1};
const MR={
 bedroom:{name:'目覚めの客室',w:256,h:240,map:[0,1],tone:'#344569',floor:[[0,208,256,32]],blocks:[],doors:[{x:231,y:208,to:'gallery',at:[32,208],label:'攻略先を選ぶ'},{x:23,y:208,to:'archive',at:[472,208],need:'seal',label:'書庫への近道'}],cp:[135,208],enemies:[]},
 gallery:{name:'客室の回廊',w:896,h:240,map:[1,1],tone:'#41466c',floor:[[0,208,480,32],[528,208,368,32]],blocks:[[224,176,48,8],[288,144,48,8],[352,112,48,8],[416,112,96,10],[688,16,64,168]],doors:[{x:24,y:208,to:'bedroom',at:[207,208],label:'目覚めの客室'},{x:869,y:208,to:'hall',at:[40,368],label:'吹き抜けの大広間'}],cp:[450,112],enemies:[['walk',190,208,140,220],['fly',370,68,340,395],['walk',604,208,560,640],['walk',814,208,775,850]]},
 hall:{name:'水鏡の大広間',w:512,h:400,map:[2,1],tone:'#334d69',floor:[[0,368,512,32]],blocks:[[160,192,16,176],[224,192,16,176],[240,176,224,12],[304,288,64,12]],doors:[{x:24,y:368,to:'gallery',at:[842,208],label:'客室の回廊'},{x:481,y:368,to:'cellar',at:[40,208],label:'地下水路'},{x:433,y:176,to:'archive',at:[40,208],label:'月影の書庫'}],cp:[76,368],enemies:[['fly',376,248,330,448]]},
 archive:{name:'月影の書庫',w:512,h:240,map:[2,0],tone:'#56425d',floor:[[0,208,512,32]],blocks:[[176,16,64,168]],doors:[{x:24,y:208,to:'hall',at:[410,176],label:'水鏡の大広間'},{x:483,y:208,to:'bedroom',at:[48,208],need:'seal',label:'客室への近道'}],seal:[405,190],enemies:[['walk',330,208,280,368]]},
 cellar:{name:'蒼い地下水路',w:512,h:240,map:[2,2],tone:'#233f52',floor:[[0,208,304,32],[352,208,160,32]],blocks:[],gate:[224,32,16,176],doors:[{x:24,y:208,to:'hall',at:[455,368],label:'水鏡の大広間'},{x:486,y:208,to:'garden',at:[40,208],label:'月明かりの中庭'}],cp:[72,208],enemies:[['walk',165,208,116,200],['fly',389,144,358,450]]},
 garden:{name:'月明かりの中庭',w:512,h:240,map:[3,2],tone:'#293958',floor:[[0,208,512,32]],blocks:[[120,176,48,10],[232,160,48,10]],doors:[{x:24,y:208,to:'cellar',at:[460,208],label:'蒼い地下水路'}],cp:[64,208],enemies:[],boss:[379,208],goal:[477,208]}
};
const M={room:'bedroom',x:110,y:208,vx:0,vy:0,face:1,h:26,ground:false,wall:0,wallGrace:0,coyote:0,buffer:0,kickLock:0,slideT:0,cool:0,poseT:0,hp:16,hurt:0,dead:0,t:0,camX:0,camY:0,shots:[],enemyShots:[],enemies:[],fx:[],flags:{seal:false,boss:false,complete:false},visited:['bedroom'],checkpoint:{room:'bedroom',x:110,y:208},message:'',messageT:0,prompt:'',near:null,map:false,menuTab:'status',saved:false,saveError:false,transition:0};
const mansionInput={slide:false,map:false,use:false};
let mansionActionArt=null,mansionBackdrop=null;
for(const [name,url] of [['actions','assets/umine-mansion-actions.png'],['background','assets/mansion-background.png']]){const image=new Image();image.onload=()=>{if(name==='actions')mansionActionArt=image;else mansionBackdrop=image;};image.src=url;}
function mansionRead(){try{const s=JSON.parse(localStorage.getItem(MANSION_KEY));if(!s||s.version!==1||!MR[s.checkpoint?.room]||!Number.isFinite(s.checkpoint.x)||!Number.isFinite(s.checkpoint.y))return null;const r=MR[s.checkpoint.room];if(s.checkpoint.x<8||s.checkpoint.x>r.w-8||s.checkpoint.y<0||s.checkpoint.y>r.h)return null;return{flags:{seal:s.flags?.seal===true,boss:s.flags?.boss===true,complete:s.flags?.complete===true},visited:Array.isArray(s.visited)?s.visited.filter(x=>MR[x]):['bedroom'],checkpoint:s.checkpoint};}catch{return null;}}
function mansionSave(){try{localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,flags:M.flags,visited:M.visited,checkpoint:M.checkpoint}));M.saved=true;M.saveError=false;}catch{M.saveError=true;}}
function mansionSay(text,time=220){M.message=text;M.messageT=time;}
function mansionStart(resume=false){const saved=resume?mansionRead():null;Object.assign(M,{hp:16,hurt:0,dead:0,t:0,flags:saved?.flags||{seal:false,boss:false,complete:false},visited:saved?.visited||['bedroom'],checkpoint:saved?.checkpoint||{room:'bedroom',x:110,y:208},map:false,menuTab:'status',saved:!!saved,saveError:false});mansionEnter(M.checkpoint.room,M.checkpoint.x,M.checkpoint.y);setState('mansion');mansionSay(resume?'また、ここから探してみよう。':'まずは出口へ。扉の前で「調べる」。');mansionUI();}
function mansionEnter(room,x,y){Object.assign(M,{room,x,y,vx:0,vy:0,h:MC.h,ground:false,wall:0,wallGrace:0,coyote:0,buffer:0,kickLock:0,slideT:0,cool:0,poseT:0,shots:[],enemyShots:[],fx:[],transition:16,near:null,prompt:''});M.enemies=MR[room].enemies.map((e,i)=>({kind:e[0],x:e[1],y:e[2],baseY:e[2],min:e[3],max:e[4],dir:i%2?-1:1,hp:e[0]==='fly'?2:3,t:0,flash:0}));if(MR[room].boss&&!M.flags.boss)M.enemies.push({kind:'boss',x:379,y:208,baseY:208,hp:16,maxHp:16,t:0,dir:-1,flash:0});if(!M.visited.includes(room))M.visited.push(room);mansionCamera(true);mansionSave();}
function mansionSolids(){const r=MR[M.room];return [...r.floor,...r.blocks,[0,-16,r.w,16],[-16,0,16,r.h],[r.w,0,16,r.h],...(r.gate&&!M.flags.seal?[r.gate]:[])];}
function mansionOverlap(x,y,w,h,b){return x<b[0]+b[2]&&x+w>b[0]&&y<b[1]+b[3]&&y+h>b[1];}
function mansionFits(x,y,h=MC.h){return !mansionSolids().some(b=>mansionOverlap(x-MC.w/2,y-h,MC.w,h,b));}
function mansionBurst(x,y,color='#8beeff',n=9){for(let i=0;i<n;i++)M.fx.push({x,y,vx:Math.cos(i/n*6.28)*(1+i%3),vy:Math.sin(i/n*6.28)*(1+i%3),life:20+i%7,color});}
function mansionDamage(n,dir=0){if(M.hurt||M.dead)return;M.hp=Math.max(0,M.hp-n);M.hurt=75;M.vx=dir*2.8;M.vy=-3;M.kickLock=10;M.slideT=0;mansionBurst(M.x,M.y-14,'#ff9abb');sfx('hurt');if(!M.hp){M.dead=65;mansionSay('……もう一度、あの灯りのところから。',100);}}
function mansionUse(){const r=MR[M.room];if(r.seal&&!M.flags.seal&&Math.hypot(M.x-r.seal[0],M.y-18-r.seal[1])<34){M.flags.seal=true;mansionSave();mansionBurst(r.seal[0],r.seal[1],'#ffe48f',18);mansionSay('水脈の紋章！ 地下の封印と、近道が開いた。',280);sfx('start');return;}
 if(r.cp&&Math.abs(M.x-r.cp[0])<24&&Math.abs(M.y-r.cp[1])<24){M.hp=16;M.checkpoint={room:M.room,x:r.cp[0],y:r.cp[1]};mansionSave();mansionSay(M.saveError?'回復したよ。記録できないため、この画面を閉じないでね。':'水の灯りに記録したよ。体力も回復！');sfx('heal');return;}
 for(const d of r.doors)if(Math.abs(M.x-d.x)<25&&Math.abs(M.y-d.y)<28){if(d.need&&!M.flags[d.need]){mansionSay('向こう側から、鍵がかかっているみたい。');return;}if(M.room==='bedroom'&&d.to==='gallery'){M.menuTab='area';M.map=true;releaseAll();mansionUI();return;}mansionEnter(d.to,...d.at);mansionSay(MR[d.to].name,110);return;}
 if(r.goal&&M.flags.boss&&Math.abs(M.x-r.goal[0])<28){M.flags.complete=true;mansionSave();setState('mansionClear');mansionUI();}}
function mansionCamera(snap=false){const r=MR[M.room],tx=Math.max(0,Math.min(r.w-VW,M.x-VW*.43)),ty=Math.max(0,Math.min(r.h-VH,M.y-158));M.camX=snap?tx:M.camX+(tx-M.camX)*.17;M.camY=snap?ty:M.camY+(ty-M.camY)*.14;}
function updateMansion(){
 mansionUI();
 if(state==='mansionClear'){if(stateT>25&&(inp.startPressed||inp.shootPressed||mansionInput.use)){setState('mansion');M.checkpoint={room:'bedroom',x:110,y:208};mansionEnter('bedroom',110,208);mansionSay('拠点に戻ったよ。攻略先は客室の出口から選べる。');}if(inp.backPressed)setState('title');mansionInput.use=mansionInput.slide=mansionInput.map=false;return;}
 if(mansionInput.map){mansionMenuToggle();}mansionInput.map=false;
 if(inp.backPressed){if(M.map){M.map=false;releaseAll();mansionUI();}else{mansionSave();setState('title');}mansionInput.slide=mansionInput.use=false;return;}
 if(M.map){mansionInput.slide=mansionInput.use=false;return;}
 M.t++;
 if(M.transition>0)M.transition--;if(M.messageT>0)M.messageT--;if(M.hurt>0)M.hurt--;if(M.cool>0)M.cool--;if(M.poseT>0)M.poseT--;
 for(const f of M.fx){f.x+=f.vx;f.y+=f.vy;f.vy+=.07;f.life--;}M.fx=M.fx.filter(f=>f.life>0);
 if(M.dead){if(--M.dead===0){M.hp=16;M.hurt=90;mansionEnter(M.checkpoint.room,M.checkpoint.x,M.checkpoint.y);}mansionInput.slide=mansionInput.use=false;return;}
 if(M.slideT&&M.t%3===0)M.fx.push({x:M.x-M.face*13,y:M.y-3,vx:-M.face,vy:-.1,life:8,color:'#80dfff'});
 const use=mansionInput.use||inp.magicPressed||inp.upPressed; mansionInput.use=false;
 if(use&&!M.transition){mansionUse();if(M.transition||state!=='mansion')return;}
 const dx=(inp.right?1:0)-(inp.left?1:0);if(M.ground)M.coyote=6;else if(M.coyote>0)M.coyote--;
 if(inp.jumpPressed)M.buffer=7;else if(M.buffer>0)M.buffer--;
 if(M.wall)M.wallGrace=6;else if(M.wallGrace>0)M.wallGrace--;
 const slideRequest=mansionInput.slide||(keys.down&&inp.jumpPressed);mansionInput.slide=false;
 if(slideRequest&&M.ground&&!M.slideT){M.slideT=24;M.h=MC.slideH;M.buffer=0;if(dx)M.face=dx;mansionBurst(M.x-M.face*8,M.y-3,'#9ae5ff',6);sfx('jump');}
 if(M.slideT){M.slideT--;M.vx=M.face*MC.slide;if(!M.slideT&&!mansionFits(M.x,M.y,MC.h))M.slideT=1;M.h=M.slideT?MC.slideH:MC.h;}
 else if(M.kickLock>0)M.kickLock--;
 else {const target=dx*MC.run;M.vx+=Math.max(-MC.acc,Math.min(MC.acc,target-M.vx));if(dx)M.face=dx;}
 if(M.buffer&&!M.slideT){if(M.ground||M.coyote){M.vy=-MC.jump;M.buffer=M.coyote=0;M.ground=false;sfx('jump');}else if(M.wall||M.wallGrace){const away=-(M.wall||M.lastWall||1);M.vx=away*MC.wallPush;M.face=away;M.vy=-MC.wallJump;M.kickLock=6;M.buffer=M.wallGrace=0;mansionBurst(M.x-away*9,M.y-8);sfx('jump');}}
 if(!inp.jump&&M.vy<-2&&M.kickLock===0)M.vy=-2;
 M.vy=Math.min(MC.fall,M.vy+MC.gravity);const solids=mansionSolids();
 M.x+=M.vx;M.wall=0;
 for(const b of solids)if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,b)){if(M.vx>0){M.x=b[0]-MC.w/2;M.wall=1;}else if(M.vx<0){M.x=b[0]+b[2]+MC.w/2;M.wall=-1;}M.vx=0;}
 // Keep wall contact stable while holding against a wall; tolerate subpixel positions.
 for(const side of [-1,1])if(dx===side&&solids.some(b=>mansionOverlap(M.x-MC.w/2+side*.7,M.y-M.h+2,MC.w,M.h-3,b)))M.wall=side;
 if(M.wall){M.lastWall=M.wall;if(!M.ground&&M.vy>MC.wallFall)M.vy=MC.wallFall;}
 M.y+=M.vy;M.ground=false;
 for(const b of solids)if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,b)){if(M.vy>0){M.y=b[1];M.ground=true;M.coyote=6;}else if(M.vy<0)M.y=b[1]+b[3]+M.h;M.vy=0;}
 if(M.ground)M.wallGrace=0;
 if(M.y>MR[M.room].h+40){M.hp=Math.max(1,M.hp-3);const cp=M.checkpoint;mansionEnter(cp.room,cp.x,cp.y);M.hurt=90;mansionSay('水の灯りまで戻ってきた。');return;}
 if(inp.shoot&&M.cool===0&&M.shots.length<3){M.shots.push({x:M.x+M.face*13,y:M.y-(M.slideT?7:17),vx:M.face*4.8});M.cool=10;M.poseT=14;sfx('shot');}
 for(const shot of M.shots){shot.x+=shot.vx;if(solids.some(b=>mansionOverlap(shot.x-2,shot.y-2,4,4,b))){shot.dead=true;mansionBurst(shot.x,shot.y,'#96eaff',3);}for(const e of M.enemies){if(!shot.dead&&e.hp>0&&Math.abs(shot.x-e.x)<(e.kind==='boss'?19:12)&&shot.y>e.y-(e.kind==='boss'?35:24)&&shot.y<e.y+2){e.hp--;e.flash=6;shot.dead=true;mansionBurst(shot.x,shot.y,'#b1f8ff',4);sfx('hit');if(e.hp<=0){mansionBurst(e.x,e.y-12,'#ffdca1',14);if(e.kind==='boss'){M.flags.boss=true;M.enemyShots=[];mansionSave();mansionSay('道が開いた……！ 門の向こうへ行ってみよう。',260);}else if(M.hp<16)M.hp++;}}}}
 M.shots=M.shots.filter(s=>!s.dead&&Math.abs(s.x-M.x)<300);
 for(const e of M.enemies){if(e.hp<=0)continue;e.t++;if(e.flash)e.flash--;
  if(e.kind==='walk'){e.x+=e.dir*.55;if(e.x<e.min||e.x>e.max)e.dir*=-1;}
  if(e.kind==='fly'){e.x+=e.dir*.55;if(e.x<e.min||e.x>e.max)e.dir*=-1;e.y=e.baseY+Math.sin(e.t*.055)*14;}
  if(e.kind==='boss'){e.dir=M.x<e.x?-1:1;if(e.t%120===90){M.enemyShots.push({x:e.x+e.dir*22,y:e.y-24,vx:e.dir*2.4,vy:0});sfx('shot');}if(e.hp<8&&e.t%120===110)M.enemyShots.push({x:e.x+e.dir*22,y:e.y-34,vx:e.dir*2,vy:0});}
  if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.x-(e.kind==='boss'?16:9),e.y-(e.kind==='boss'?32:21),e.kind==='boss'?32:18,e.kind==='boss'?32:21]))mansionDamage(e.kind==='boss'?3:2,M.x<e.x?-1:1);
 }
 for(const b of M.enemyShots){b.x+=b.vx;b.y+=b.vy;if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[b.x-3,b.y-3,6,6])){mansionDamage(2,Math.sign(b.vx));b.dead=true;}if(solids.some(s=>mansionOverlap(b.x-2,b.y-2,4,4,s)))b.dead=true;}
 M.enemyShots=M.enemyShots.filter(b=>!b.dead&&b.x>0&&b.x<MR[M.room].w);
 M.near=null;M.prompt='';const r=MR[M.room];
 if(r.cp&&Math.abs(M.x-r.cp[0])<24&&Math.abs(M.y-r.cp[1])<24)M.prompt='調べる：記録・全回復';
 for(const d of r.doors)if(Math.abs(M.x-d.x)<25&&Math.abs(M.y-d.y)<28)M.prompt=d.need&&!M.flags[d.need]?'鍵がかかっている':'調べる：'+d.label;
 if(r.seal&&!M.flags.seal&&Math.abs(M.x-r.seal[0])<30)M.prompt='調べる：水脈の紋章';
 if(r.goal&&M.flags.boss&&Math.abs(M.x-r.goal[0])<28)M.prompt='調べる：屋敷の外へ';
 mansionCamera();
}
function mrect(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);}
function mansionTile(x,y,w,h){for(let yy=0;yy<h;yy+=16)for(let xx=0;xx<w;xx+=16){const tw=Math.min(16,w-xx),th=Math.min(16,h-yy),light=yy===0; mrect(x+xx,y+yy,tw,th,'#111d32');mrect(x+xx+1,y+yy+1,Math.max(1,tw-2),Math.max(1,th-2),((xx/16+yy/16)&1)?'#39475e':'#344158');mrect(x+xx+1,y+yy+1,Math.max(1,tw-2),light?3:1,light?'#98bcc8':'#55657b');if(th>8){mrect(x+xx+3,y+yy+6,2,2,'#6b7485');mrect(x+xx+tw-4,y+yy+th-4,2,2,'#18263d');}}}
function mansionDiamond(x,y,size,color){g.fillStyle=color;g.beginPath();g.moveTo(x,y-size);g.lineTo(x+size*.65,y);g.lineTo(x,y+size);g.lineTo(x-size*.65,y);g.closePath();g.fill();}
function mansionRoomDraw(){const r=MR[M.room],cx=Math.round(M.camX),cy=Math.round(M.camY);
 mrect(0,0,VW,VH,r.tone);
 if(mansionBackdrop){const bw=320,bh=240,off=-Math.round(cx*.18)%bw;g.globalAlpha=.64;for(let i=-1;i<2;i++)g.drawImage(mansionBackdrop,off+i*bw,-Math.round(cy*.15),bw,bh);g.globalAlpha=1;}
 mrect(0,0,VW,VH,'rgba(6,12,29,.26)');if(M.room==='cellar')mrect(0,0,VW,VH,'rgba(0,35,52,.34)');
 if(M.room==='garden'){mrect(0,0,VW,75,'#121c35');for(let i=0;i<28;i++)mrect((i*47+13)%256,(i*23)%70,1,1,i%2?'#8cadc0':'#ffe9a0');g.fillStyle='#dfddb7';g.beginPath();g.arc(202-cx*.06,53,19,0,7);g.fill();}
 g.save();g.translate(-cx,-cy);
 for(const b of [...r.floor,...r.blocks])mansionTile(...b);
 if(r.gate&&!M.flags.seal){const b=r.gate;mrect(...b,'#263556');for(let yy=38;yy<208;yy+=14){mrect(b[0]+5,yy,6,8,'#80e8ed');mrect(b[0],yy+2,16,2,'#b5e8d9');}}
 for(const d of r.doors){const locked=d.need&&!M.flags[d.need];if(drawMansionDoor(d.x,d.y,64,locked))continue;mrect(d.x-12,d.y-53,24,53,'#101424');mrect(d.x-14,d.y-55,28,3,locked?'#746375':'#a1b9c9');mrect(d.x-14,d.y-53,3,53,'#7c899f');mrect(d.x+11,d.y-53,3,53,'#596a84');mrect(d.x-8,d.y-47,16,44,locked?'#44344d':'#294663');mrect(d.x+5,d.y-24,3,3,locked?'#c68d90':'#ffe5a0');if(!locked){mrect(d.x-5,d.y-41,10,1,'#6faebc');mrect(d.x-5,d.y-36,10,1,'#496f91');}}
 if(r.cp){const [x,y]=r.cp;mansionTile(x-12,y-6,24,6);mansionDiamond(x,y-27+Math.sin(M.t*.05)*2,11,'#305876');mansionDiamond(x,y-27+Math.sin(M.t*.05)*2,7,'#95f3ff');mrect(x-1,y-34,2,8,'#efffff');}
 if(r.seal&&!M.flags.seal){const[x,y]=r.seal;g.strokeStyle='#dfc77d';g.lineWidth=2;g.beginPath();g.arc(x,y-8,13,0,7);g.stroke();mansionDiamond(x,y-8+Math.sin(M.t*.06)*2,9,'#97f4ff');}
 if(M.room==='bedroom'&&!drawMansionBed(34,208,90)){mrect(34,168,83,15,'#657f9f');mrect(36,165,79,6,'#d2dfe9');mrect(32,150,4,55,'#8b7281');mrect(115,174,4,31,'#8b7281');mrect(40,161,19,6,'#f4f1ee');mrect(65,168,47,13,'#8fa8ca');mrect(42,183,4,25,'#705b72');}
 if(M.room==='hall'){for(let y=208;y<360;y+=24){mansionDiamond(157,y,3,'#80e4ee');mansionDiamond(243,y,3,'#80e4ee');}}
 if(r.goal){const[x,y]=r.goal;mrect(x-17,y-75,34,75,'#0b142a');for(let z=-14;z<=14;z+=7)if(!M.flags.boss)mrect(x+z,y-72,3,72,'#c6b37c');mrect(x-19,y-77,38,4,'#f0dbaa');}
 for(const e of M.enemies){if(e.hp<=0)continue;const white=e.flash>0;if(e.kind==='fly'){g.drawImage(pick(SPR.flyer[(frame>>3)&1],e.dir,white),Math.round(e.x-12),Math.round(e.y-22),24,24);}else{const sz=e.kind==='boss'?38:24;g.drawImage(pick(SPR.walker[(frame>>3)&1],e.dir,white),Math.round(e.x-sz/2),Math.round(e.y-sz),sz,sz);if(e.kind==='boss'){if(e.t%120>=54&&e.t%120<90){g.strokeStyle=(e.t&4)?'#ffb86e':'#fff3b3';g.lineWidth=2;g.beginPath();g.arc(e.x,e.y-22,24,0,7);g.stroke();}mrect(e.x-21,e.y-47,42,4,'#111a2c');mrect(e.x-20,e.y-46,40*e.hp/e.maxHp,2,'#ffb78c');}}}
 if(!M.dead||M.dead%8<4){if(!M.hurt||M.hurt%6<3){
 const action=M.slideT?'slide':(!M.ground&&(M.wall||M.kickLock))?'wall':null;
 if(action&&mansionActionArt){const box=action==='slide'?[887,290,873,560]:[55,75,810,685],height=action==='slide'?24:42,width=box[2]/box[3]*height;const facing=action==='wall'?(M.wall?-M.wall:M.face):M.face;const flip=action==='wall'?facing===1:facing===-1;g.save();g.translate(Math.round(M.x),Math.round(M.y));if(flip)g.scale(-1,1);g.drawImage(mansionActionArt,...box,-width/2,-height,width,height);g.restore();}
 else {const fi=M.poseT?6:!M.ground?(M.vy<0?4:5):Math.abs(M.vx)>.1?2+((frame>>3)&1):(frame>>5)&1;drawSequelAt(fi,M.x,M.y,M.face,false,SEQUEL_MODEL.size);}
 }}
 if(M.wall&&!M.ground){mansionDiamond(M.x+M.wall*8,M.y-5,4,'#99faff');}

 for(const s of M.shots){mrect(s.x-4,s.y-2,8,4,'#5ec9f1');mrect(s.x-2,s.y-1,4,2,'#e2ffff');}
 for(const s of M.enemyShots){mansionDiamond(s.x,s.y,5,'#ffbc79');mansionDiamond(s.x,s.y,2,'#fff4d0');}
 for(const f of M.fx){g.globalAlpha=Math.min(1,f.life/12);mrect(f.x,f.y,2,2,f.color);}g.globalAlpha=1;g.restore();
 // Dark edge vignette uses stepped pixel bars; all solid surfaces keep bright top edges.
 mrect(0,0,VW,27,'rgba(5,10,24,.94)');drawText('UMINE',7,6,'c',1);for(let i=0;i<16;i++)mrect(7+i*4,17,3,6,i<M.hp?'#8de5f9':'#303b54');
 drawText(M.flags.seal?'SEAL':'----',VW-8,17,M.flags.seal?'y':'b',1,'r');
 if(M.messageT>0||M.prompt)mrect(3,204,250,33,'rgba(6,14,29,.93)');
}
function mansionMapDraw(){mrect(10,40,236,157,'rgba(5,13,29,.97)');rectLine(10,40,236,157,'#86beca');const pos=id=>[34+MR[id].map[0]*53,78+MR[id].map[1]*35];
 for(const [id,r] of Object.entries(MR))for(const d of r.doors){if(!M.visited.includes(id))continue;const a=pos(id),b=pos(d.to);g.strokeStyle=d.need&&!M.flags[d.need]?'#64536a':'#536f83';g.lineWidth=2;g.beginPath();g.moveTo(a[0]+16,a[1]+9);g.lineTo(b[0]+16,b[1]+9);g.stroke();}
 for(const [id,r] of Object.entries(MR)){const p=pos(id),seen=M.visited.includes(id);mrect(p[0],p[1],35,20,seen?'#335f76':'#18283f');rectLine(p[0],p[1],35,20,id===M.room?'#fff1aa':seen?'#92c9db':'#3e4b64');if(id===M.room)mansionDiamond(p[0]+17,p[1]+10,4,'#fff2b3');if(r.cp&&seen)mrect(p[0]+3,p[1]+3,3,3,'#95f3ff');} }
function renderMansion(){mansionRoomDraw();if(M.map&&M.menuTab==='map')mansionMapDraw();if(state==='mansionClear'){mrect(14,63,228,102,'rgba(6,14,30,.96)');rectLine(14,63,228,102,'#b9d8d2');}blit();
 drawHiText(MR[M.room].name,165,5,6.5,'#d9edf5','#0c1528');
 if(M.map&&M.menuTab!=='map')return;
 if(M.map){drawHiText('屋敷の見取り図',128,64,9,'#d9f3fb','#0b1528');drawHiText('金色：現在地　 水色：記録の灯り',128,183,6,'#a6c8d8','#0b1528');for(const[id,r]of Object.entries(MR))if(M.visited.includes(id)){const names={bedroom:'客室',gallery:'回廊',hall:'大広間',archive:'書庫',cellar:'地下',garden:'中庭'};drawHiText(names[id],51+r.map[0]*53,100+r.map[1]*35,5,'#d5e5ee','#0b1528');}return;}
 if(state==='mansionClear'){drawHiText('屋敷の外へ',128,77,12,'#e3f8fb','#0b1528');drawHiText('カナタちゃん、みんな……どこにいるの？',128,102,6.5,'#d3e8f5','#0b1528');drawHiText('探索テスト区間 踏破！',128,123,8,'#ffe6a3','#0b1528');drawHiText('タップで探索を続ける / Escでタイトル',128,147,6,'#a9c9db','#0b1528');return;}
 if(M.prompt)drawHiText(M.prompt,128,207,7,'#fff2bd','#0b1528');
 if(M.messageT>0)drawHiText(M.message,128,M.prompt?223:213,6,'#c0e9f6','#0b1528');
 else if(!M.prompt){let hint='扉の前で 調べる / E・↑';if(M.room==='gallery'||M.room==='archive')hint='低い通路：SLIDE / Shift・↓＋ジャンプ';if(M.room==='hall')hint='壁へ押しながらジャンプ：魔法の壁キック';if(M.room==='cellar'&&!M.flags.seal)hint='地下の封印……上階に手がかりがあるかも';drawHiText(hint,128,230,6,'#bad7e6','#0b1528');}
}
const mansionSlideBtn=document.getElementById('mSlide'),mansionMapBtn=document.getElementById('mMap'),mansionTitle=document.getElementById('mTitle');
for(const [button,key]of [[mansionSlideBtn,'slide'],[mansionMapBtn,'map']])button.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Snd.init();mansionInput[key]=true;});
document.getElementById('mContinue').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Snd.init();mansionStart(true);});
document.getElementById('mNew').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Snd.init();startOpening();});
window.addEventListener('keydown',e=>{if(state!=='mansion'&&state!=='mansionClear')return;if(['ShiftLeft','ShiftRight','KeyQ','Tab','KeyE'].includes(e.code)){e.preventDefault();if(e.repeat)return;if(e.code==='KeyQ'||e.code==='Tab')mansionInput.map=true;else if(e.code==='KeyE')mansionInput.use=true;else mansionInput.slide=true;}});
function mansionMenuToggle(){M.map=!M.map;releaseAll();mansionInput.slide=mansionInput.use=false;mansionUI();if(M.map)mansionStatusTab.focus?.();}
const mansionAreaContent=document.getElementById('mAreaContent'),mansionAreaTab=document.getElementById('mAreaTab');
const mansionMapContent=document.getElementById('mMapContent');
const mansionMenu=document.getElementById('mMenu'),mansionStatus=document.getElementById('mStatus'),mansionStatusTab=document.getElementById('mStatusTab'),mansionMapTab=document.getElementById('mMapTab');
for(const[button,tab]of [[mansionStatusTab,'status'],[mansionMapTab,'map'],[mansionAreaTab,'area']])button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();M.menuTab=tab;releaseAll();mansionUI();});
document.getElementById('mMenuClose').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();M.map=false;releaseAll();mansionUI();mansionMapBtn.focus?.();});
mansionMenu.addEventListener('pointerdown',e=>{e.stopPropagation();});
function mansionStatusHTML(){const memo=M.flags.complete?'門の先へ出られた！ みんなを探す旅は、まだ続く。':M.flags.boss?'中庭の番人を倒したよ。奥の門を調べてみよう。':M.flags.seal?'水脈の紋章で地下の封印が解けた。客室への近道も使えるよ。':'館の出口を探そう。大広間の上階に、何かあるかも。';return `<div class="status-top"><div class="portrait" role="img" aria-label="海音ちゃん"></div><div><h2>海音 ／ うみね</h2><div>水魔法が得意な、旅好きの魔女</div><strong>HP ${M.hp} / 16</strong><div class="hp-track"><div class="hp-fill" style="width:${M.hp/16*100}%"></div></div></div></div><div class="status-row"><strong>謎の右腕</strong>　正体不明<br>水弾を放てる。どうして付いているのかな……？</div><div class="status-row"><strong>使える能力</strong><br>水弾 ／ 魔法の壁キック ／ 壁滑り ／ スライディング</div><div class="status-row note"><strong>探索メモ</strong><br>${memo}</div><div class="status-row">現在地：${MR[M.room].name}<br>記録地点：${MR[M.checkpoint.room].name} ・ 訪問 ${M.visited.length} / 6 部屋</div>`;}
function mansionMapHTML(){const names={bedroom:'客室',gallery:'回廊',hall:'大広間',archive:'書庫',cellar:'地下',garden:'中庭'};const pos=id=>[12+MR[id].map[0]*72,18+MR[id].map[1]*66];let paths='',rooms='';const links=new Set();for(const[id,r]of Object.entries(MR)){if(!M.visited.includes(id))continue;const[x,y]=pos(id);for(const d of r.doors){const key=[id,d.to].sort().join(':');if(links.has(key))continue;links.add(key);const[a,b]=pos(d.to);paths+=`<path d="M ${x+30} ${y+20} L ${a+30} ${b+20}" fill="none" stroke="${d.need&&!M.flags[d.need]?'#685269':'#6b8b9b'}" stroke-width="3"/>`;} }for(const[id,r]of Object.entries(MR)){const[x,y]=pos(id),seen=M.visited.includes(id);rooms+=`<rect x="${x}" y="${y}" width="60" height="40" rx="3" fill="${seen?'#264c63':'#182337'}" stroke="${id===M.room?'#ffe89e':'#667b92'}" stroke-width="${id===M.room?3:1}"/><text x="${x+30}" y="${y+25}" text-anchor="middle" fill="${id===M.room?'#fff0bb':'#d0e5ed'}" font-size="11">${seen?names[id]:'？'}</text>${seen&&r.cp?`<circle cx="${x+7}" cy="${y+7}" r="3" fill="#95f3ff"/>`:''}`;}return `<h2>月影の館・見取り図</h2><div>現在地：${MR[M.room].name}</div><svg viewBox="0 0 306 204" role="img" aria-label="館の部屋と通路">${paths}${rooms}</svg><div>金の枠：現在地 ／ 水色の点：記録の灯り</div><div>訪問 ${M.visited.length} / 6 部屋<br>記録地点：${MR[M.checkpoint.room].name}</div><p>${M.flags.seal?'水脈の封印は解除済み。客室と書庫の近道が使える。':'地下の封印はまだ閉じている。上階を探してみよう。'}</p>`;}
let mansionControlsActive=false;
function mansionUI(){const active=state==='mansion'||state==='mansionClear';mansionSlideBtn.style.display=active?'flex':'none';mansionMapBtn.style.display=active?'block':'none';orbBtn.textContent=active?'調べる':'ORB';mansionTitle.style.display=state==='title'?'flex':'none';if(state==='title')document.getElementById('mContinue').style.display=mansionRead()?'block':'none';document.getElementById('modelPicker').style.display=active?'none':'flex';if(active!==mansionControlsActive){mansionControlsActive=active;doLayout();}const open=state==='mansion'&&M.map;mansionMenu.style.display=open?'flex':'none';document.body.classList.toggle('mansion-menu-open',open);mansionMapContent.style.display=M.menuTab==='map'?'block':'none';mansionAreaContent.style.display=M.menuTab==='area'?'block':'none';mansionAreaTab.setAttribute('aria-selected',String(M.menuTab==='area'));document.getElementById('mAreaGo').disabled=M.room!=='bedroom';document.getElementById('mAreaHint').textContent=M.room==='bedroom'?(M.flags.complete?'この区画は踏破済み。再探索できるよ。':'新しい攻略先は、今後ここに増えていくよ。'):'攻略先は拠点の客室から選べるよ。';if(open&&M.menuTab==='map'){const map=mansionMapHTML();if(mansionMapContent.innerHTML!==map)mansionMapContent.innerHTML=map;}mansionStatus.style.display=M.menuTab==='status'?'block':'none';mansionStatusTab.setAttribute('aria-selected',String(M.menuTab==='status'));mansionMapTab.setAttribute('aria-selected',String(M.menuTab==='map'));if(open&&M.menuTab==='status'){const html=mansionStatusHTML();if(mansionStatus.innerHTML!==html)mansionStatus.innerHTML=html;} }
function mansionLayout(){const p=layout.portrait,top=layout.gameY+layout.gameH;place(mansionSlideBtn,p?layout.W/2-28:layout.W-70,p?top+77:layout.H*.42,56,56);place(mansionMapBtn,p?14:14,p?top+14:52,72,34);mansionTitle.style.top=(p?top+76:layout.gameY+layout.gameH*.64)+'px';mansionTitle.style.left=(layout.gameX+layout.gameW/2)+'px';const unit=Math.max(1,Math.min(2,layout.W/256));const margin=8;place(mansionMenu,margin,layout.gameY+8,layout.W-margin*2,Math.max(120,layout.H-layout.gameY-16));mansionMenu.style.setProperty?.('--mu',unit+'px');if(state==='mansion'||state==='mansionClear')mansionControlsLayout();}
document.getElementById('mAreaGo').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(M.room!=='bedroom')return;M.map=false;releaseAll();mansionEnter('gallery',32,208);mansionSay('上段の灯りに寄り道して、記録してみよう。');mansionUI();});
const mansionControlRects={};
function mansionControlsLayout(){const {W,H,portrait,gameY,gameH}=layout;const rect=(id,x,y,w,h)=>{mansionControlRects[id]=[x,y,w,h];place(id==='slide'?mansionSlideBtn:BTN[id],x,y,w,h);};if(portrait){const top=gameY+gameH,space=H-top;const margin=12,gap=8,size=Math.max(44,Math.min(74,(W-2*margin-3*gap)/4)),small=Math.max(44,Math.min(54,space*.19));const row=top+Math.max(70,Math.min(space-96,space*.54));rect('left',margin,row,size,size);rect('right',margin+size+gap,row,size,size);rect('shoot',W-margin-2*size-gap,row,size,size);rect('jump',W-margin-size,row,size,size);rect('slide',W-margin-small,row-small-12,small,small);place(mansionMapBtn,margin,top+12,72,36);place(orbBtn,W/2-27,top+10,54,44);place(muteBtn,W-margin-100,top+12,100,32);}else{const size=Math.max(44,Math.min(68,H*.19)),margin=12,gap=8,row=H-size-24;rect('left',margin,row,size,size);rect('right',margin+size+gap,row,size,size);rect('shoot',W-margin-2*size-gap,row,size,size);rect('jump',W-margin-size,row,size,size);rect('slide',W-margin-48,row-58,48,48);place(mansionMapBtn,12,52,72,36);} }
window.MANSION_TOUCH_ZONE=(x,y)=>{if(M.map)return null;for(const id of ['left','right','shoot','jump']){const r=mansionControlRects[id];if(r&&x>=r[0]-3&&x<=r[0]+r[2]+3&&y>=r[1]-3&&y<=r[1]+r[3]+3)return id;}return null;};
window.MANSION_LAYOUT=mansionLayout;mansionLayout();
