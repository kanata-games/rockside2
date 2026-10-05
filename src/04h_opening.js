// ROCKSIDE II opening. Separate simulation; inherited stage content stays intact.
const OPENING = {step:0,t:0,x:110,y:176,vx:0,vy:0,face:1,ground:true,cool:0,poseT:0,cam:0,
  shots:[],targets:[],firstShot:false,message:'',messageT:0,done:false,room:0};
const OPEN_LINES = [
 {face:0,pose:0,lines:['いっぱい歌って、楽しかったなぁ……。','……ふふ。もう、食べられないよ……。'],dark:true},
 {face:1,pose:0,lines:['……ん……？','知らない天井……。ここ、どこ？']},
 {face:3,pose:1,lines:['みんな……？ カナタちゃん……？','昨日は、みんなでパーティーをして……。']},
 {face:2,pose:1,lines:['……えっ！？','右手に、なにかついてる！']},
 {face:3,pose:1,lines:['んん……外れないよ……。','お洋服も変わってる。どうして……？']},
 {face:0,pose:1,lines:['まずは、みんなを探そう。','このお部屋の外に、誰かいるかな？']}
];
const openingArt={};
for(const [key,path] of [['poses','assets/umine-opening-poses.png'],['faces','assets/umine-expressions.png']]) {
 const img=new Image();img.onload=()=>openingArt[key]=img;img.onerror=()=>openingArt[key]=null;img.src=path;
}
function startOpening(){Object.assign(OPENING,{step:0,t:0,x:110,y:176,vx:0,vy:0,face:1,ground:true,cool:0,poseT:0,cam:0,shots:[],targets:[],firstShot:false,message:'',messageT:0,done:false,room:0});setState('opening');}
function openingExplore(){OPENING.t=0;setState('openingPlay');}
function openingHint(s){OPENING.message=s;OPENING.messageT=210;}
function updateOpening(){
 const o=OPENING;o.t++;
 if(state==='opening'){
  if(inp.backPressed){openingExplore();return;}
  if(o.t>18&&(inp.startPressed||inp.shootPressed||inp.jumpPressed)){
   o.step++;o.t=0;if(o.step>=OPEN_LINES.length)openingExplore();
  }return;
 }
 if(state==='openingDone'){
  if(stateT>25&&(inp.startPressed||inp.jumpPressed||inp.shootPressed||inp.backPressed))setState('title');return;
 }
 if(inp.backPressed){setState('title');return;}
 if(o.cool>0)o.cool--;if(o.poseT>0)o.poseT--;if(o.messageT>0)o.messageT--;
 o.vx=(inp.right?1:0)-(inp.left?1:0);o.vx*=CONFIG.runSpeed;if(o.vx)o.face=Math.sign(o.vx);
 if(inp.jumpPressed&&o.ground){o.vy=-CONFIG.jumpVel;o.ground=false;sfx('jump');}
 if(!inp.jump&&o.vy<-CONFIG.jumpCutVel)o.vy=-CONFIG.jumpCutVel;
 const oldY=o.y;o.x=Math.max(16,Math.min(o.room?934:244,o.x+o.vx));o.vy=Math.min(CONFIG.maxFall,o.vy+CONFIG.gravity);o.y+=o.vy;o.ground=false;
 const floors=o.room?[[0,330,176],[374,960,176],[480,540,150],[640,700,132]]:[[0,256,176]];
 for(const [left,right,top] of floors){if(o.x+5>left&&o.x-5<right&&o.vy>=0&&oldY<=top&&o.y>=top){o.y=top;o.vy=0;o.ground=true;}}
 if(o.y>260){o.x=280;o.y=176;o.vy=0;o.ground=true;openingHint('大丈夫。もう一度、跳んでみよう。');}
 if(inp.shoot&&o.cool===0&&o.shots.length<CONFIG.maxShots){
  const d=SEQUEL_MODEL,scale=d.size/d.cell;
  o.shots.push({x:o.x+o.face*(d.muzzleX-d.cx)*scale,y:o.y+(d.muzzleY-d.feet)*scale,vx:o.face*CONFIG.shotSpeed});
  o.cool=CONFIG.autoFireInterval;o.poseT=CONFIG.shootPoseFrames;sfx('shot');
  if(!o.firstShot){o.firstShot=true;openingHint('わっ！ 私のお水、ここから出るの？');}
 }
 for(const s of o.shots){s.x+=s.vx;for(const target of o.targets){if(target.hp&&Math.abs(s.x-target.x)<12&&Math.abs(s.y-target.y)<17){target.hp--;s.dead=true;sfx('hit');break;}}}
 o.shots=o.shots.filter(s=>!s.dead&&s.x>o.cam-30&&s.x<o.cam+VW+30);
 if(!o.room&&o.x>228){o.room=1;o.x=32;o.cam=0;o.targets=[{x:220,y:160,hp:2},{x:550,y:160,hp:2},{x:800,y:160,hp:2}];openingHint('向こうから、何か音がする……。進んでみよう。');}
 if(o.room)o.cam=Math.max(0,Math.min(704,o.x-95));
 if(o.room&&o.x>915){o.done=true;setState('openingDone');}
}
function openingRect(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),y,w,h);}
function drawOpeningRoom(){
 const o=OPENING,c=o.cam;openingRect(0,0,VW,VH,'#141c35');
 for(let x=-Math.round(c)%32;x<VW;x+=32){openingRect(x,34,1,142,'#253351');openingRect(x,172,32,4,'#668090');}
 openingRect(0,0,VW,35,'#10172b');openingRect(0,176,VW,64,'#29384b');
 for(let x=-Math.round(c)%16;x<VW;x+=16){openingRect(x,178,15,14,'#44566b');openingRect(x,195,15,14,'#344658');}
 if(!o.room){
  // Quiet guest room: window, bedside lamp, bed behind the heroine.
  openingRect(138,54,58,64,'#7186a3');openingRect(141,57,52,58,'#243b64');
  openingRect(166,57,2,58,'#a1b5ca');openingRect(141,84,52,2,'#a1b5ca');
  openingRect(151,65,4,4,'#d6f6ff');openingRect(179,94,2,2,'#d6f6ff');
  openingRect(24,126,114,14,'#56738a');openingRect(25,124,112,7,'#d0dce4');
  openingRect(23,108,5,58,'#725779');openingRect(136,134,5,32,'#725779');
  openingRect(34,120,23,7,'#edf1f4');openingRect(35,142,4,31,'#725779');openingRect(127,142,4,31,'#725779');
  openingRect(155,148,22,6,'#7e687a');openingRect(158,154,3,22,'#7e687a');
  openingRect(165,129,2,19,'#cfc7a6');openingRect(159,121,15,10,'#e6c777');
  openingRect(220,100,28,76,'#090f20');openingRect(222,102,24,74,'#304965');openingRect(225,112,18,46,'#24394f');openingRect(238,143,3,3,'#f0d58b');
 }else{
  for(let x=90;x<960;x+=160){openingRect(x-c,64,23,47,'#385577');openingRect(x+3-c,68,17,38,'#193150');openingRect(x+7-c,73,3,3,'#8beaff');}
  for(const [x,y,w] of [[480,150,60],[640,132,60]]){openingRect(x-c,y,w,6,'#86a4b4');openingRect(x-c,y+6,w,12,'#3b526b');}
  openingRect(330-c,176,44,64,'#090e20');
  for(const target of o.targets)if(target.hp){openingRect(target.x-10-c,target.y-12,20,24,'#788aa3');openingRect(target.x-7-c,target.y-8,14,14,'#49a9c6');openingRect(target.x-3-c,target.y-4,6,6,'#e4fcff');}
  openingRect(920-c,88,30,88,'#81a4b2');openingRect(923-c,91,24,85,'#163b51');openingRect(942-c,139,3,3,'#ffda77');
 }
}
function openingTextLeft(text,x,y,size,color){const scale=hiS();sctx.save();sctx.font='700 '+Math.max(11,Math.round(size*scale))+'px '+JP_FONT;sctx.textAlign='left';sctx.textBaseline='top';sctx.fillStyle=color;sctx.fillText(text,x*scale,y*scale);sctx.restore();}
function renderOpening(){
 const o=OPENING;drawOpeningRoom();
 if(state==='opening'){
  const line=OPEN_LINES[o.step];const img=openingArt.poses;
  if(img){const box=line.pose?[978,155,790,680]:[8,292,960,550];const scale=SEQUEL_MODEL.size/680;g.drawImage(img,...box,30,130-box[3]*scale,box[2]*scale,box[3]*scale);}
  else drawSequelAt(0,80,130,1,false);
  // Blanket sits in front of the sleeping body only.
  if(!line.pose){openingRect(77,124,55,10,'#819bbf');openingRect(78,125,52,2,'#c1d9ef');}
  if(line.dark){openingRect(0,0,VW,VH,'rgba(4,7,18,.75)');}
 }else{
  const fi=o.poseT?6:!o.ground?(o.vy<0?4:5):o.vx?2+((frame>>3)&1):(frame>>5)&1;
  if(SEQUEL_MODEL.frames.length)drawSequelAt(fi,o.x-o.cam,o.y,o.face,false);
  else g.drawImage(SPR.hero.stand[0].r,o.x-16-o.cam,o.y-32,32,32);
  for(const s of o.shots){openingRect(s.x-3-o.cam,Math.round(s.y)-2,6,4,'#a3f5ff');openingRect(s.x-1-o.cam,Math.round(s.y)-3,3,6,'#63c6fb');}
 }
 openingRect(0,0,VW,20,'rgba(8,13,27,.86)');drawText('ROCKSIDE II',8,7,'c',1);drawText(state==='opening'?'SKIP >':'ESC: TITLE',247,7,'b',1,'r');
 if(state==='opening'){
  openingRect(6,185,244,49,'#0b1429');rectLine(6,185,244,49,'#6d9ab7');
  const img=openingArt.faces;const fi=OPEN_LINES[o.step].face;
  if(img)g.drawImage(img,(fi%2)*627,Math.floor(fi/2)*627,627,627,9,187,44,44);
  blit();openingTextLeft('海音',61,190,7,'#91e5ff');
  OPEN_LINES[o.step].lines.forEach((s,i)=>openingTextLeft(s,61,202+i*10,6.3,'#edf7ff'));
  drawHiText('タップ / Enter / SHOTで次へ',128,230,5,'#829ab4','#0b1429');return;
 }
 if(state==='openingDone'){
  openingRect(16,72,224,88,'#0a1429');rectLine(16,72,224,88,'#8bd5e8');blit();
  drawHiText('この先に、みんながいるのかな？',128,91,8,'#eafaff','#0a1429');
  drawHiText('冒頭テストはここまで',128,116,8,'#92e0f5','#0a1429');
  drawHiText('タップでタイトルへ・もう一度遊べます',128,140,6,'#adc3db','#0a1429');return;
 }
 openingRect(0,211,VW,29,'#10192c');blit();
 drawHiText(o.room?'移動 ← →   ジャンプ Z / SPACE   水弾 X / J':'出口へ進んでみよう →',128,221,6,'#d3e9ff','#10192c');
 if(o.messageT>0){drawHiText(o.message,128,37,6.5,'#e7faff','#10192c');}
}
