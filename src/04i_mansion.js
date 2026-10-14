// ROCKSIDE II mansion vertical slice: rooms, collision, magic wall-kick and slide.
const MANSION_KEY='rockside2_mansion_v1';
const MC={w:14,h:26,slideH:18,run:1.8,acc:.42,gravity:.28,fall:6.5,jump:5.8,wallFall:1.15,wallJump:5.6,wallPush:2.5,slide:4.1};
const MR={
 bedroom:{name:'目覚めの客室',hub:true,w:640,h:240,map:[0,1],tone:'#344569',floor:[[0,208,640,32]],blocks:[],doors:[{x:180,y:208,to:'gallery',at:[32,208],label:'客室の回廊'},{x:23,y:208,to:'archive',at:[472,208],need:'seal',label:'書庫への近道'},{x:580,y:208,to:'hubCellar',at:[48,208],label:'拠点の地下室'}],cp:[135,208],enemies:[]},
 hubCellar:{name:'拠点の地下室',hub:true,w:384,h:240,map:[0,2],tone:'#253746',floor:[[0,208,384,32]],blocks:[],doors:[{x:24,y:208,to:'bedroom',at:[550,208],label:'談話室へ戻る'}],cp:[110,208],extension:[350,208],enemies:[]},
 gallery:{name:'客室の回廊',w:1536,h:400,map:[1,1],tone:'#303c5c',floor:[[0,208,592,32],[560,368,976,32],[1408,208,128,32]],blocks:[[224,176,48,8],[288,144,48,8],[352,112,48,8],[416,112,96,10],[552,128,112,10],[704,112,160,12],[920,160,112,12],[1072,208,112,12],[624,256,64,10],[688,304,64,10],[1184,320,64,10],[1248,272,64,10],[1312,224,64,10]],doors:[{x:24,y:208,to:'bedroom',at:[207,208],label:'目覚めの客室'},{x:1509,y:208,to:'hall',at:[40,368],label:'吹き抜けの大広間'}],cp:[450,112],enemies:[['walk',190,208,140,220],['fly',598,76,562,654],['walk',780,112,732,834],['walk',848,368,780,930],['walk',1080,368,1000,1144],['fly',1270,184,1210,1324],['walk',1460,208,1436,1480]]},
 hall:{name:'水鏡の大広間',w:512,h:400,map:[2,1],tone:'#334d69',floor:[[0,368,512,32]],blocks:[[160,192,16,176],[224,192,16,176],[240,176,224,12],[304,288,64,12]],doors:[{x:24,y:368,to:'gallery',at:[1480,208],label:'客室の回廊'},{x:481,y:368,to:'cellar',at:[40,208],label:'地下水路'},{x:433,y:176,to:'archive',at:[40,208],label:'月影の書庫'}],cp:[76,368],enemies:[['fly',376,248,330,448]]},
 archive:{name:'月影の書庫',w:960,h:480,map:[2,0],tone:'#42374e',floor:[[0,208,720,32],[784,208,176,12],[512,448,448,32]],blocks:[[176,16,64,168],[272,160,64,10],[352,112,160,12],[560,160,64,10]],doors:[{x:24,y:208,to:'hall',at:[410,176],label:'水鏡の大広間'},{x:483,y:208,to:'bedroom',at:[48,208],need:'seal',label:'客室への近道'},{x:936,y:208,to:'starPassage',at:[540,128],need:'starShortcut',label:'星灯りの近道'}],seal:[405,190],cp:[592,448],lift:{x:720,w:64,stops:[208,448]},extension:[918,448],extensionDoor:{to:'archiveInner',at:[40,368],onEnterFlag:'seitenLeftArchive'},enemies:[['walk',330,208,280,368]]},
 archiveInner:{name:'封書の回廊',w:960,h:400,map:[3,0],tone:'#44384f',floor:[[0,368,960,32]],blocks:[[224,320,64,10],[288,272,64,10],[352,224,64,10],[416,208,160,12],[592,208,160,12]],doors:[{x:24,y:368,to:'archive',at:[892,448],label:'月影の書庫'},{x:931,y:368,to:'clockTower',at:[72,576],label:'時計塔の吹き抜け'}],cp:[112,368],lever:{x:682,y:208,flag:'archiveLatch',label:'封書の錠'},switchGate:[832,0,16,368],enemies:[['walk',180,368,144,206],['fly',530,152,474,560],['walk',724,368,666,784],['walk',886,368,870,909]]},
 clockTower:{name:'時計塔の吹き抜け',w:640,h:640,map:[3,-1],tone:'#3b3c52',floor:[[0,576,272,64],[336,576,304,64]],blocks:[[0,352,272,12],[336,352,304,12],[0,128,272,12],[336,128,304,12]],doors:[{x:24,y:576,to:'archiveInner',at:[900,368],label:'封書の回廊'},{x:607,y:128,to:'moonReservoir',at:[40,368],label:'月映しの貯水室'}],cp:[104,576],lift:{x:272,w:64,stops:[128,352,576],initialStop:2},enemies:[['walk',184,576,156,222],['walk',464,352,392,510],['fly',454,268,370,562],['walk',476,128,414,532]]},
 moonReservoir:{name:'月映しの貯水室',w:1024,h:400,map:[4,-1],tone:'#254457',floor:[[0,368,1024,32]],blocks:[[224,320,96,12],[448,320,128,12],[704,320,96,12]],doors:[{x:24,y:368,to:'clockTower',at:[576,128],label:'時計塔の吹き抜け'},{x:993,y:368,to:'starPassage',at:[40,368],label:'星灯りの渡り廊下'}],cp:[904,368],vents:[{x:288,y:368,offset:0},{x:512,y:368,offset:60},{x:752,y:368,offset:120}],enemies:[['walk',176,368,128,206],['fly',404,244,356,430],['walk',640,368,608,686],['fly',846,268,818,872]]},
 starPassage:{name:'星灯りの渡り廊下',w:1152,h:400,map:[4,0],tone:'#273754',floor:[[0,368,1152,32]],blocks:[[160,320,80,10],[208,272,80,10],[256,224,80,10],[304,176,80,10],[352,128,224,12],[640,176,128,12],[832,224,96,12]],doors:[{x:24,y:368,to:'moonReservoir',at:[958,368],label:'月映しの貯水室'},{x:540,y:128,to:'archive',at:[908,208],need:'starShortcut',label:'書庫への近道'}],cp:[940,368],lever:{x:476,y:128,flag:'starShortcut',label:'星灯りの錠'},extension:[1118,368],extensionDoor:{to:'forbiddenArchive',at:[40,368]},enemies:[['walk',128,368,84,145],['fly',596,92,550,624],['walk',692,176,670,740],['walk',728,368,660,798],['fly',862,148,830,900]]},
 forbiddenArchive:{name:'禁書庫・封じられた閲覧室',w:1024,h:400,map:[5,0],tone:'#372e49',floor:[[0,368,1024,32]],blocks:[[192,320,80,10],[240,272,80,10],[288,224,80,10],[336,208,240,12],[640,256,80,10],[688,304,80,10]],doors:[{x:24,y:368,to:'starPassage',at:[1086,368],label:'星灯りの渡り廊下'},{x:993,y:368,to:'seitenArena',at:[40,256],label:'禁書庫の奥・歌声の間'}],cp:[914,368],enemies:[['walk',140,368,96,170],['fly',420,148,380,516],['walk',448,208,390,546],['walk',626,368,590,668],['fly',806,266,778,854]]},
 seitenArena:{name:'禁書庫・歌声の間',w:512,h:288,map:[5,1],tone:'#3b2947',floor:[[0,256,512,32]],blocks:[],doors:[{x:24,y:256,to:'forbiddenArchive',at:[956,368],label:'禁書庫の閲覧室'}],extension:[484,256],enemies:[]},
 cellar:{name:'蒼い地下水路',w:512,h:240,map:[2,2],tone:'#233f52',floor:[[0,208,304,32],[352,208,160,32]],blocks:[],gate:[224,32,16,176],doors:[{x:24,y:208,to:'hall',at:[455,368],label:'水鏡の大広間'},{x:486,y:208,to:'garden',at:[40,256],label:'月明かりの中庭'}],cp:[72,208],enemies:[['walk',165,208,116,200],['fly',389,144,358,450]]},
 diceArena:{name:'月影の遊戯室',w:512,h:288,map:[1,2],tone:'#3b263f',floor:[[0,256,512,32]],blocks:[],doors:[],enemies:[]},
 garden:{name:'月影の中庭・星詠みの広場',w:640,h:288,map:[3,2],tone:'#202e4b',floor:[[0,256,640,32]],blocks:[[120,218,56,8],[560,210,48,8]],doors:[{x:24,y:256,to:'cellar',at:[460,208],label:'蒼い地下水路'}],cp:[64,256],enemies:[],boss:[500,256],goal:[613,256]}
};
// Violet moon doors form a shared fast-travel network; ordinary doors keep the map connected.
const MANSION_PORTALS={bedroom:{x:231,y:208},cellar:{x:438,y:208,need:'seal'},starPassage:{x:1000,y:368}};
const MANSION_WARP_START=['bedroom'];
function mansionAtPortal(){const p=MANSION_PORTALS[M.room];return !!p&&(!p.need||M.flags[p.need])&&Math.abs(M.x-p.x)<22&&Math.abs(M.y-p.y)<24&&!M.dead;}
function mansionPortalDiscover(){if(!mansionAtPortal()||M.portals.includes(M.room))return;M.portals.push(M.room);mansionSave();mansionSay('月影の扉が繋がった！ ほかのワープ扉から戻れるよ。');mansionBurst(M.x,M.y-25,'#c9a2ff',12);}
function mansionWarpOpen(){if(!mansionAtPortal())return;mansionPortalDiscover();M.map=true;M.menuTab='area';M.talk=null;releaseAll();mansionGuardRelease();mansionUI();}
function mansionWarpTo(room){if(!M.map||M.menuTab!=='area'||!mansionAtPortal()||!M.portals.includes(room)||room===M.room||!MANSION_PORTALS[room]||(MANSION_PORTALS[room].need&&!M.flags[MANSION_PORTALS[room].need]))return false;const p=MANSION_PORTALS[room];M.map=false;releaseAll();mansionGuardRelease();mansionEnter(room,p.x,p.y);M.hurt=Math.max(M.hurt,60);mansionBurst(p.x,p.y-22,'#c9a2ff',16);mansionSay('月影の扉：'+MR[room].name,160);sfx('start');mansionUI();return true;}
function mansionWarpHTML(){const usable=mansionAtPortal();return `<h2>月影のワープ扉</h2><p>${usable?'繋がった扉へ移動できます。':'紫の扉の前で「調べる」と移動できます。'}</p><div class="warp-list">${Object.keys(MANSION_PORTALS).map(id=>{const known=M.portals.includes(id),here=id===M.room;return `<button id="mWarp-${id}" ${!known||here||!usable||(MANSION_PORTALS[id].need&&!M.flags[MANSION_PORTALS[id].need])?'disabled':''}>${known?MR[id].name:'未発見の扉'}${known&&here?' ／ 現在地':''}</button>`;}).join('')}</div><p>ワープ扉は拠点と各エリアの要所にあります。<br>ボス前の扉を見つけると、拠点と行き来できます。</p>`;}
function mansionPortalDraw(id){const p=MANSION_PORTALS[id];if(!p)return;drawMansionDoor(p.x,p.y,64);mrect(p.x-13,p.y-53,26,51,'rgba(97,42,160,.55)');rectLine(p.x-15,p.y-56,30,56,'#c39afa');rectLine(p.x-12,p.y-53,24,53,'#9271d3');mansionDiamond(p.x,p.y-63,4,'#e2baff');mansionDiamond(p.x,p.y-26,6+Math.sin(M.t*.06),'#ddb9ff');mrect(p.x-1,p.y-31,2,10,'#fff0ff');}
// Add future friends here after their sequel art and dialogue are ready.
const HUB_NPCS=[{id:'seitenAfter',room:'seitenArena',x:370,y:256,name:'青天',enabled:()=>M.actor!=='seiten'&&M.flags.seitenDefeated&&!['active','ready'].includes(M.seitenState),draw:drawMansionSeiten,talk:mansionSeitenAfterTalk},{id:'seiten',room:'archive',x:880,y:208,name:'青天',enabled:()=>!M.flags.seitenLeftArchive,draw:drawMansionSeiten,talk:mansionSeitenTalk},{id:'roru',room:'bedroom',x:390,y:208,name:'ダイスロール',draw:drawRoru,talk:mansionRoruTalk},...['bedroom','hall','cellar','garden'].map(room=>({id:'astarte',room,x:({bedroom:612,hall:410,cellar:267,garden:500})[room],y:room==='hall'?176:room==='garden'?256:208,name:'アスターテ',enabled:()=>M.actor!=='astarte'&&M.flags.boss&&!(M.room==='garden'&&M.sparMode==='full'),draw:drawMansionAstarte,talk:mansionAstarteGuide}))];
function mansionNearbyNPC(){return HUB_NPCS.find(n=>n.room===M.room&&(!n.enabled||n.enabled())&&Math.abs(M.x-n.x)<20&&Math.abs(M.y-n.y)<24);}
function mansionLocationName(){return M.room==='bedroom'&&M.x>=280?'拠点の談話室':MR[M.room].name;}
const M={room:'bedroom',x:110,y:208,vx:0,vy:0,face:1,h:26,ground:false,wall:0,wallGrace:0,coyote:0,buffer:0,kickLock:0,slideT:0,cool:0,poseT:0,hp:16,hurt:0,dead:0,t:0,walkDistance:0,camX:0,camY:0,shots:[],enemyShots:[],enemies:[],props:[],pickups:[],fx:[],flags:{seal:false,boss:false,complete:false,seitenLeftArchive:false,archiveLatch:false,starShortcut:false,seitenDefeated:false},visited:['bedroom'],portals:[...MANSION_WARP_START],checkpoint:{room:'bedroom',x:110,y:208},message:'',messageT:0,prompt:'',near:null,map:false,talk:null,menuTab:'status',saved:false,saveError:false,transition:0};
// The reserve stays offscreen. Switching preserves position, velocity and shared HP.
function mansionGuarding(){return M.actor==='astarte'&&M.ground&&!M.dead&&!M.map&&!M.poseT&&!M.castT&&((mansionInput.guardPointer!=null)||mansionGuardKeys.size>0);}
function mansionGuardRelease(){mansionInput.guardPointer=null;mansionGuardKeys.clear();}
function mansionGuardDraw(){if(!mansionGuarding()&&!M.guardFlash)return;g.save();g.translate(M.x,M.y);g.scale(M.face,1);g.globalAlpha=M.guardFlash?1:.65;g.beginPath();g.arc(12,-25,23,-1.1,1.1);g.strokeStyle='#20162f';g.lineWidth=5;g.stroke();g.strokeStyle=M.guardFlash?'#fff2bd':'#b796e8';g.lineWidth=M.guardFlash?3:2;g.stroke();if(M.guardFlash)mansionScytheStar(35,-25,6,'#fffdf2');g.restore();}
const MANSION_ACTOR_NAMES={umine:'海音',astarte:'アスターテ',seiten:'青天'};
function mansionActors(){return ['umine',...(M.flags.boss?['astarte']:[]),...(M.flags.seitenDefeated&&!(M.room==='seitenArena'&&['active','ready'].includes(M.seitenState))?['seiten']:[])];}
function mansionNextActor(){const list=mansionActors();return list[(list.indexOf(M.actor)+1)%list.length];}
function mansionCanSwap(){return state==='mansion'&&mansionActors().length>1&&!M.map&&!M.dead&&!M.transition&&!M.slideT&&!M.stepT&&!M.poseT&&!M.castT&&!M.swapCool&&!(M.room==='garden'&&M.sparState==='active');}
function mansionSwap(){if(!mansionCanSwap())return false;mansionGuardRelease();M.actor=mansionNextActor();M.swapCool=30;M.cool=Math.max(M.cool,12);M.walkDistance=0;M.clawQueued=false;mansionBurst(M.x,M.y-18,'#e4c3ff',14);sfx('start');mansionUI();return true;}
const ASTARTE_PLAYER_SIZE=80; // Compare the body, not the weapon-inclusive cell, with Umine.
function mansionScythePose(){const t=M.poseT,k=t>34?0:t>28?1:t>24?2:t>20?3:t>14?4:t>8?5:t>4?6:7;return(M.scytheStage===2?25:17)+k;}
function mansionScythe(stage=1){M.scytheStage=stage;M.scytheQueued=false;M.cool=stage===2?48:46;M.poseT=40;M.scytheFace=M.face;M.scytheHit=false;sfx('shot');}
function mansionScytheHit(){if(M.scytheHit)return;M.scytheHit=true;const face=M.scytheFace,second=M.scytheStage===2,reach=second?62:49,height=second?44:38,box=[face>0?M.x-5:M.x-reach,M.y-(M.slideT?18:height),reach+5,height];
for(const e of M.enemies){if(e.hp<=0||e.kind==='boss'||(e.kind==='seitenBoss'&&M.seitenState!=='active')||(e.kind==='diceBoss'&&M.diceState!=='active'))continue;if(e.kind==='seitenBoss'&&e.guard>0)continue;if(mansionOverlap(e.x-(e.kind==='diceBoss'||e.kind==='seitenBoss'?14:10),e.y-(e.kind==='diceBoss'||e.kind==='seitenBoss'?38:24),e.kind==='diceBoss'||e.kind==='seitenBoss'?28:20,e.kind==='diceBoss'||e.kind==='seitenBoss'?38:24,box)){e.hp=Math.max(0,e.hp-2);e.flash=8;if(e.kind==='seitenBoss')e.guard=18;mansionScytheImpact(e.x,e.y-15,second);sfx('hit');if(e.kind==='seitenBoss'&&e.hp===0){mansionSeitenWin();return;}if(e.kind==='diceBoss'&&e.hp===0){mansionDiceWin();return;}if(e.hp===0&&M.hp<mansionMaxHP())M.hp++;}}
for(const p of M.props){if(p.hp<=0||!mansionOverlap(p.x-11,p.y-(p.kind==='candle'?36:22),22,p.kind==='candle'?36:22,box))continue;const shot={x:p.x,y:p.y-12};mansionPropsHit(shot);mansionScytheImpact(p.x,p.y-12,second);}
}
// Pixel-shaped light; deterministic render geometry never mutates combat state.
function mansionScytheStar(x,y,r,color){g.fillStyle=color;g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,d=i%2?r*.23:r;const px=Math.round(x+Math.cos(a)*d),py=Math.round(y+Math.sin(a)*d);if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.closePath();g.fill();}
function mansionScytheRibbon(cx,cy,r,start,end,width,color){
 const steps=18,point=(i,side)=>{const k=i/steps,a=start+(end-start)*k,taper=Math.sin(k*Math.PI)*width+.3,rad=r+side*taper;return[Math.round(cx+Math.cos(a)*rad),Math.round(cy+Math.sin(a)*rad)];};
 g.beginPath();for(let i=0;i<=steps;i++){const p=point(i,1);i?g.lineTo(...p):g.moveTo(...p);}for(let i=steps;i>=0;i--)g.lineTo(...point(i,-1));g.closePath();g.fillStyle=color;g.fill();
}
function mansionScytheDraw(){if(!M.poseT||M.actor!=='astarte')return;if(mansionAstartePlayerArt){mansionPlayerScytheTrail();return;}const second=M.scytheStage===2;
 g.save();g.translate(Math.round(M.x),Math.round(M.y));g.scale(M.scytheFace,1);
 if(second){
  if(M.poseT>26){mansionScytheStar(20,-38,2,'#ffe7a1');g.restore();return;}
  // The hook reaches outward first; the bright crescent then travels back toward the hands.
  const pull=M.poseT<=18,k=pull?Math.min(1,(18-M.poseT)/10):0,cx=pull?54-32*k:54,cy=-25;
  const fade=M.poseT<8?M.poseT/8:1;g.globalAlpha=fade*(pull?1:.65);
  mansionScytheRibbon(cx,cy,13,-1.35,1.35,3,'#24172e');mansionScytheRibbon(cx,cy,13,-1.35,1.35,2,'#ffc455');mansionScytheRibbon(cx,cy,13.5,-1.2,1.2,.85,'#fff3be');
  if(pull){for(let i=0;i<3;i++){g.globalAlpha=fade*(.55-i*.12);mansionScytheRibbon(cx+8+i*7,cy,13,-1.1,1.1,.65,'#ffcf75');}g.globalAlpha=fade;mansionScytheStar(cx+12,cy,3,'#fffdf2');}
  g.restore();return;
 }
 if(M.poseT>22){const k=(34-M.poseT)/12;mansionScytheStar(15,-38,2+k*3,second?'#ffe7a1':'#e8c5ff');g.restore();return;}
 const k=Math.min(1,(22-M.poseT)/14),fade=M.poseT<8?M.poseT/8:1;
 const cx=12,cy=-24,r=40,start=-.65,tip=start+1.35*(.18+.82*k),tail=Math.max(start,tip-1.15);
 const outer=second?'#734924':'#402963',rim=second?'#ffb941':'#b05cff',core=second?'#ffe699':'#ead1ff';
 g.globalAlpha=fade*.28;mansionScytheRibbon(cx,cy,r,tail-.08,tip,6,outer);
 g.globalAlpha=fade;mansionScytheRibbon(cx,cy,r,tail,tip,4,'#1c132e');mansionScytheRibbon(cx,cy,r,tail+.025,tip,3,rim);mansionScytheRibbon(cx,cy,r+.5,tail+.07,tip,1.65,core);mansionScytheRibbon(cx,cy,r+1,tail+.18,tip,.65,'#fffdf2');
 // A thin inner echo makes the swing feel fast without filling the silhouette.
 g.globalAlpha=fade*.65;mansionScytheRibbon(cx,cy,r-6,tail+.15,tip-.08,.7,rim);
 for(let i=0;i<3;i++){const a=tip-.18-i*.42,rad=r+4+(i%2)*3;if(a<start)continue;g.globalAlpha=fade*(.85-i*.2);mansionScytheStar(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad,i===0?3:2,core);}
 g.globalAlpha=fade;mansionScytheStar(cx+Math.cos(tip)*r,cy+Math.sin(tip)*r,second?4:3,'#fffdf2');g.restore();
}
function mansionScytheImpact(x,y,second){M.fx.push({kind:'scytheImpact',x,y,life:12,second,face:M.scytheFace});}
function mansionScytheImpactDraw(f){const age=12-f.life,k=age/12;g.save();g.translate(Math.round(f.x),Math.round(f.y));g.scale(f.face,1);g.globalAlpha=1-k;const r=(f.second?10:7)*(1+k*.6);
 mansionScytheStar(0,0,r+2,'#24172e');mansionScytheStar(0,0,r,f.second?'#ffd363':'#ce9bff');mansionScytheStar(0,0,r*.55,'#fffdf2');
 for(let i=0;i<4;i++){const a=-1.2+i*.8,d=4+age*1.05;g.fillStyle=f.second?'#ffcb65':'#dcc3ff';g.fillRect(Math.round(Math.cos(a)*d),Math.round(Math.sin(a)*d),2,2);}g.restore();
}
// Character-specific actions; progression unlocks Umine's platform without sharing her magic movement.
function mansionIsUmine(){return M.actor!=='astarte'&&M.actor!=='seiten';}
function mansionAbility(){
 if(state!=='mansion'||M.map||M.dead||M.transition||M.slideT||M.stepT||M.poseT||M.castT||M.abilityCool||mansionGuarding())return false;
 if(mansionIsUmine()){
  if(!M.flags.seal){mansionSay('水の足場は、水脈の紋章を得ると使えるよ。',130);return false;}
  if(M.room==='garden'&&M.sparState==='active'){mansionSay('手合わせでは、水弾で確かめよう。',100);return false;}
  const r=MR[M.room],box=[M.x+M.face*36-20,M.y-22,40,6];
  if(box[0]<0||box[0]+box[2]>r.w||box[1]<28||mansionSolids().some(b=>mansionOverlap(...box,b))){mansionSay('ここには足場を作れない。少し離れてみよう。',100);return false;}
  M.waterPlatform={box,life:240};M.abilityCool=300;M.poseT=14;mansionBurst(box[0]+20,box[1],'#a5f5ff',12);sfx('magic');return true;
 }
 if(M.shots.length>=3)return false;
 if(M.actor==='seiten'){M.castT=30;M.songFace=M.face;M.abilityCool=100;sfx('tink');return true;}
 M.shots.push({kind:'star',x:M.x+M.face*16,y:M.y-20,vx:M.face*3.4,damage:2});M.castT=18;M.abilityCool=75;mansionBurst(M.x+M.face*16,M.y-20,'#ffe7a1',8);sfx('shot');return true;
}
function mansionWaterPlatformDraw(){const p=M.waterPlatform;if(!p)return;const[x,y,w,h]=p.box;g.save();g.globalAlpha=p.life<45?.4+.6*((p.life>>2)&1):.85;mrect(x,y,w,h,'#174c78');mrect(x+1,y,w-2,2,'#d2ffff');mrect(x+2,y+2,w-4,2,'#6bddf4');for(let i=0;i<4;i++)mrect(x+4+i*9,y+5+(M.t+i*7)%3,3,1,'#92ebff');g.restore();}
// Each permanent item lists its independent one-time reward sources.
const MANSION_PERMANENT_ITEMS={starAmulet:{name:'星詠みの護符',hp:2,sources:['astarteReward','seitenReward']}};
function mansionPermanentCount(id){return MANSION_PERMANENT_ITEMS[id].sources.filter(flag=>M.flags[flag]).length;}
function mansionMaxHP(){return 16+Object.entries(MANSION_PERMANENT_ITEMS).reduce((hp,[id,item])=>hp+mansionPermanentCount(id)*(item.hp||0),0);}
function mansionPermanentHTML(){const owned=Object.entries(MANSION_PERMANENT_ITEMS).filter(([id])=>mansionPermanentCount(id)>0);return owned.length?owned.map(([id,item])=>`${item.name} ×${mansionPermanentCount(id)}：最大HP ＋${mansionPermanentCount(id)*item.hp}（取得済み）`).join('<br>'):'未取得。';}
function mansionRewardFlags(save){const f=save.flags||{};if(save.rewardVersion===2)return{astarteReward:f.astarteReward===true,seitenReward:f.seitenReward===true};return{astarteReward:f.astarteReward===true&&(f.astarteFull===true||f.seitenDefeated!==true),seitenReward:f.seitenDefeated===true};}

function mansionNewAstarte(){return {kind:'boss',x:500,y:256,baseY:256,hp:40,maxHp:40,guard:0,pose:-1,walkDistance:0,t:0,dir:-1,flash:0};}
// Furniture has no movement collider; only breakable props receive player shots.
const MANSION_PROP_FRAMES={"candle":{"rect":[23,5,17,54],"cell":0},"candleCracked":{"rect":[86,7,19,52],"cell":1},"candleBroken":{"rect":[140,32,40,27],"cell":2},"vase":{"rect":[206,21,35,38],"cell":3},"vaseCracked":{"rect":[11,80,41,43],"cell":4},"vaseBroken":{"rect":[69,89,54,34],"cell":5},"box":{"rect":[134,89,52,34],"cell":6},"boxCracked":{"rect":[199,90,50,33],"cell":7},"boxBroken":{"rect":[5,153,54,34],"cell":8},"books":{"rect":[69,151,54,36],"cell":9},"chair":{"rect":[143,133,34,54],"cell":10},"table":{"rect":[200,133,48,54],"cell":11},"shelf":{"rect":[16,197,32,54],"cell":12},"picture":{"rect":[81,197,30,54],"cell":13},"water":{"rect":[143,197,33,54],"cell":14},"moon":{"rect":[201,197,46,54],"cell":15}};
let mansionPropArt=null;{const image=new Image();image.onload=()=>mansionPropArt=image;image.src='assets/mansion-props.png';}
const MANSION_PROPS={gallery:[['candle',104,208,'water'],['vase',320,144,'water'],['vase',608,128,'water'],['candle',816,112,'water'],['box',752,368,'water'],['vase',960,368,'water'],['box',1110,208,'water'],['candle',1380,368,'water']],hall:[['vase',112,368,'water'],['candle',346,176,'water']],archive:[['candle',105,208,'water'],['box',375,208,'water'],['vase',590,160,'water'],['candle',674,208,'water'],['box',650,448,'water'],['vase',852,448,'water']],cellar:[['vase',190,208,'water'],['box',420,208,'water']],garden:[['candle',180,256,'water']],archiveInner:[['vase',300,272,'water'],['candle',640,208,'water'],['box',788,368,'water']],clockTower:[['box',130,352,'water'],['vase',528,128,'water']],moonReservoir:[['vase',80,368,'water'],['box',550,320,'water'],['candle',946,368,'water']],starPassage:[['vase',472,128,'water'],['box',780,368,'water'],['candle',1056,368,'water']],forbiddenArchive:[['candle',112,368,'water'],['vase',480,208,'water'],['box',714,368,'water'],['candle',860,368,'water']]};
function mansionPropDraw(frame,x,y,height){if(!mansionPropArt)return false;const b=MANSION_PROP_FRAMES[frame].rect;const w=b[2]/b[3]*height;g.drawImage(mansionPropArt,...b,Math.round(x-w/2),Math.round(y-height),w,height);return true;}
function mansionPropsEnter(room){M.props=(MANSION_PROPS[room]||[]).map(([kind,x,y,drop])=>({kind,x,y,drop,hp:2,brokenT:0}));M.pickups=[];}
function mansionPropsHit(shot){if(shot.dead)return;for(const p of M.props){if(p.hp<=0)continue;const h=p.kind==='candle'?36:22,w=p.kind==='candle'?12:22;if(!mansionOverlap(shot.x-3,shot.y-3,6,6,[p.x-w/2,p.y-h,w,h]))continue;shot.dead=true;p.hp--;mansionBurst(p.x,p.y-12,'#d9bd86',6);sfx('hit');if(!p.hp){p.brokenT=32;M.pickups.push({kind:p.drop,x:p.x,y:p.y-14,vy:-1.8,age:0});}break;}}
function mansionPickupsUpdate(){for(const p of M.props)if(p.brokenT>0)p.brokenT--;for(const p of M.pickups){p.age++;p.vy=Math.min(3,p.vy+.12);const oldY=p.y;p.y+=p.vy;for(const b of mansionSolids())if(p.vy>=0&&p.x>b[0]&&p.x<b[0]+b[2]&&oldY<=b[1]-6&&p.y>=b[1]-6){p.y=b[1]-6;p.vy=0;}if(p.age>10&&mansionOverlap(M.x-MC.w/2-3,M.y-M.h,MC.w+6,M.h,[p.x-6,p.y-6,12,12])){M.hp=Math.min(mansionMaxHP(),M.hp+3);p.taken=true;mansionBurst(p.x,p.y,'#9df6ff',6);mansionSay('水滴を拾った！ HPが３回復。',100);sfx('heal');}}M.pickups=M.pickups.filter(p=>!p.taken&&p.age<900&&p.y<MR[M.room].h+24);}
function mansionPropsDraw(){for(const p of M.props){const h=p.kind==='candle'?36:22;if(p.hp>0){if(!mansionPropDraw(p.kind+(p.hp===1?'Cracked':''),p.x,p.y,h))mrect(p.x-5,p.y-h,10,h,'#bfa375');}else if(p.brokenT>0)mansionPropDraw(p.kind+'Broken',p.x,p.y,p.kind==='candle'?18:14);}for(const p of M.pickups){if(p.age>780&&(p.age&8))continue;if(!mansionPropDraw(p.kind,p.x,p.y+6+Math.sin(p.age*.12),12))mansionDiamond(p.x,p.y,5,'#8beeff');}}
// Astarte's first encounter is consensual, nonlethal practice; later appearances guide exploration.
let mansionAstarteActions=null;
const ASTARTE_ACTION_CROPS=Array.from({length:12},(_,i)=>[(i%4)*192,Math.floor(i/4)*160,192,160]);
{const image=new Image();image.onload=()=>{mansionAstarteActions=image;};image.src='assets/astarte-actions.png';}
let mansionAstarteArt=null;const ASTARTE_CROPS=[[0,0,192,160],[192,0,192,160],[0,160,192,160],[192,160,192,160]];
{const image=new Image();image.onload=()=>{mansionAstarteArt=image;};image.src='assets/astarte-sequel.png';}
let mansionAstarteGuardArt=null;
const ASTARTE_GUARD={anchor:[540,1144],scale:.060};
{const img=new Image();img.onload=()=>mansionAstarteGuardArt=img;img.src='assets/astarte-guard.png';}
let mansionAstarteAttackArt=null;
{const img=new Image();img.onload=()=>mansionAstarteAttackArt=img;img.src='assets/astarte-attack-combo.png';}
// Inspected atlas rectangles share body scale; individual foot anchors prevent sprite jitter.
const ASTARTE_ATTACK_FRAMES=[{"rect":[70,110,280,345],"anchor":[168,312],"scale":0.195},{"rect":[485,110,355,345],"anchor":[189,312],"scale":0.195},{"rect":[895,110,475,345],"anchor":[135,312],"scale":0.195},{"rect":[1400,110,345,345],"anchor":[145,312],"scale":0.195},{"rect":[60,490,390,340],"anchor":[134,325],"scale":0.195},{"rect":[455,490,485,340],"anchor":[136,325],"scale":0.195},{"rect":[945,490,375,340],"anchor":[149,325],"scale":0.195},{"rect":[1395,490,345,340],"anchor":[141,325],"scale":0.195}];
let mansionAstartePlayerArt=null;
{const img=new Image();img.onload=()=>mansionAstartePlayerArt=img;img.src='assets/astarte-player-sweep.png';}
const ASTARTE_PLAYER_FRAMES=[{"name":"idle","rect":[0,0,350,306],"anchor":[201,298],"scale":0.175,"edge":[73,210]},{"name":"walk1","rect":[350,0,380,306],"anchor":[208,299],"scale":0.175,"edge":[68,215]},{"name":"walk2","rect":[730,0,375,306],"anchor":[199,302],"scale":0.175,"edge":[70,228]},{"name":"walk3","rect":[1105,0,269,306],"anchor":[175,302],"scale":0.175,"edge":[53,222]},{"name":"windup","rect":[0,306,365,305],"anchor":[209,280],"scale":0.175,"edge":[40,215]},{"name":"backswing","rect":[365,306,360,305],"anchor":[193,286],"scale":0.175,"edge":[57,114]},{"name":"overhead","rect":[725,306,325,305],"anchor":[182,287],"scale":0.175,"edge":[47,153]},{"name":"downswing","rect":[1050,306,324,303],"anchor":[118,287],"scale":0.175,"edge":[305,211]},{"name":"sweep","rect":[0,611,395,252],"anchor":[131,239],"scale":0.175,"edge":[276,100]},{"name":"follow","rect":[395,611,340,263],"anchor":[109,242],"scale":0.175,"edge":[319,173]},{"name":"lowfinish","rect":[735,611,370,263],"anchor":[116,249],"scale":0.175,"edge":[351,175]},{"name":"recover","rect":[1105,611,269,263],"anchor":[141,243],"scale":0.175,"edge":[17,176]},{"name":"unusedRearGuard","rect":[0,874,370,271],"anchor":[232,256],"scale":0.175,"edge":[105,160]},{"name":"jump","rect":[370,874,355,271],"anchor":[139,205],"scale":0.175,"edge":[215,25]},{"name":"fall","rect":[725,874,355,271],"anchor":[153,233],"scale":0.175,"edge":[216,48]},{"name":"frontGuardCast","rect":[1080,874,294,271],"anchor":[125,256],"scale":0.175,"edge":[267,126]}];
function mansionAstartePlayerFrame(pose){if(pose>=17&&pose<=24)return pose-13;if(pose>=25&&pose<=32)return[10,9,8,7,6,5,4,0][pose-25];if(pose>=4&&pose<=7)return pose-4;return({13:13,14:14,15:15,16:15})[pose]??0;}
function drawMansionAstartePlayer(x,y,t,face=1,pose=-1,size=80){const f=ASTARTE_PLAYER_FRAMES[mansionAstartePlayerFrame(pose)];if(mansionAstartePlayerArt&&f){const k=f.scale*size/80;g.save();g.translate(Math.round(x),Math.round(y));g.scale(face<0?-1:1,1);g.drawImage(mansionAstartePlayerArt,...f.rect,-f.anchor[0]*k,-f.anchor[1]*k,f.rect[2]*k,f.rect[3]*k);g.restore();return;}
 if(pose>=25&&pose<=32)pose=[11,11,9,10,8,8,8,-1][pose-25];drawMansionAstarte(x,y,t,face,pose,size);
}
function mansionPlayerScytheTrail(){const f=ASTARTE_PLAYER_FRAMES[mansionAstartePlayerFrame(mansionScythePose())];if(!f?.edge)return;const p=[(f.edge[0]-f.anchor[0])*f.scale,(f.edge[1]-f.anchor[1])*f.scale],active=M.scytheStage===2?28:20;
 if(M.poseT>active)return;g.save();g.translate(Math.round(M.x),Math.round(M.y));g.scale(M.scytheFace,1);g.globalAlpha=M.poseT<8?M.poseT/8:.8;mansionScytheStar(...p,2.3,M.scytheStage===2?'#ffe8a1':'#dfc4ff');g.restore();
}
function drawMansionAstarte(x,y,t,face=1,pose=-1,size=96){if(pose>=17&&pose<=24){const f=ASTARTE_ATTACK_FRAMES[pose-17];if(mansionAstarteAttackArt&&f){const k=f.scale*size/80;g.save();g.translate(Math.round(x),Math.round(y));g.scale(face<0?-1:1,1);g.drawImage(mansionAstarteAttackArt,...f.rect,-f.anchor[0]*k,-f.anchor[1]*k,f.rect[2]*k,f.rect[3]*k);g.restore();return;}pose=[8,8,9,11,9,9,10,11][pose-17];}if(pose===16){if(mansionAstarteGuardArt){const scale=ASTARTE_GUARD.scale*size/80;g.save();g.translate(Math.round(x),Math.round(y));g.scale(face<0?-1:1,1);g.drawImage(mansionAstarteGuardArt,-ASTARTE_GUARD.anchor[0]*scale,-ASTARTE_GUARD.anchor[1]*scale,mansionAstarteGuardArt.width*scale,mansionAstarteGuardArt.height*scale);g.restore();return;}pose=9;}const fi=pose>=0?pose:((t>>5)&1),action=fi>=4&&mansionAstarteActions,image=action?mansionAstarteActions:mansionAstarteArt,b=action?ASTARTE_ACTION_CROPS[fi-4]:ASTARTE_CROPS[fi>=4?2:fi];if(image&&b){g.save();g.translate(Math.round(x),Math.round(y));if(face<0)g.scale(-1,1);g.drawImage(image,...b,-size/2,-74*size/96,size,80*size/96);g.restore();}else{const f=sheetFrame('astarte','idle',(t>>5)&1);if(f)g.drawImage(pick(f,face,false),Math.round(x-15),Math.round(y-44),44,44);}}
function mansionTalkShow(speaker,lines,after=null){M.talk={speaker,lines,index:0,after};M.map=true;M.menuTab='talk';releaseAll();mansionGuardRelease();mansionUI();document.getElementById('mTalkNext').focus?.();}
function mansionAstarteIntro(){M.sparState='ready';M.shots=[];mansionTalkShow('アスターテ',['月は出ているか…。\n……ええ。けれど、あの光は……。','私たちが知る月なら、\nこんなふうに、星の声を隠したりはしません。','……起きたんだね、海音ちゃん。\nお身体の調子はいかがですか？','その右腕のことも、気になりますね。\nよろしければ、私と少し確かめてみましょう。','怖がらなくても大丈夫。\n私が、そばにおりますから。','では、お身体が温まるまで。\n少しだけ、お付き合いくださいね。'],'sparStart');}
function mansionSparStart(){M.waterPlatform=null;M.castT=0;M.actor='umine';M.poseT=0;M.sparState='active';M.map=false;M.x=350;M.y=256;M.face=1;M.vx=M.vy=0;M.shots=[];M.enemyShots=[];M.hp=mansionMaxHP();M.hurt=60;M.dead=0;const e=M.enemies.find(e=>e.kind==='boss');if(e){e.hp=e.maxHp;e.t=0;e.flash=0;e.x=500;e.y=e.baseY=256;e.rainX=null;e.guard=0;e.pose=-1;e.walkDistance=0;e.slashDir=-1;}mansionCamera(true);M.messageT=0;}
function mansionSparWin(){const full=M.sparMode==='full',first=full&&!M.flags.astarteReward;M.sparState='done';M.flags.boss=true;M.enemyShots=[];M.shots=[];M.enemies=M.enemies.filter(e=>e.kind!=='boss');
 if(full){M.flags.astarteFull=true;if(first)M.flags.astarteReward=true;}M.hp=mansionMaxHP();mansionSave();
 if(full){mansionTalkShow('アスターテ',first?['……見事です、海音ちゃん。\n最後まで、ご自分の力で乗り越えましたね。','こちらを、お受け取りください。\n星詠みの護符――海音ちゃんを守ってくれますよ。','星詠みの護符を獲得！\n最大HPが、永続で２増えた。','また、いつでもお相手します。\nそれでは、談話室へ戻りましょう。']:['……はい。今回も、よくできました。\n何度でも、お相手しますよ。','護符の贈り物は、最初の一度だけです。\nそれでは、談話室へ戻りましょう。'],'fullReturn');return;}
 mansionTalkShow('アスターテ',['……はい、ここまで。よくできました。\nもう、ご自分の足で進めそうですね。','その右腕も、壁を蹴る魔法も。\n少しずつ、海音ちゃんの力にしていきましょう。','月のことは、私も調べてみます。\nあの光には、まだ……何かが隠れています。','本格的な手合わせは、拠点の談話室で。\nいつでも、私に声をかけてくださいね。']);}
function mansionFullBattle(){if(!M.flags.boss||M.room!=='bedroom'||M.talk?.speaker!=='アスターテ'||!M.talk.offerFull)return false;const origin={room:M.room,x:612,y:208};mansionTalkClose(true);M.map=false;releaseAll();mansionGuardRelease();mansionEnter('garden',350,256);M.sparMode='full';M.sparReturn=origin;M.enemies=[mansionNewAstarte()];mansionSparStart();M.messageT=0;mansionUI();return true;}
function mansionFullReturn(){if(!M.sparReturn)return false;const origin=M.sparReturn;M.map=false;M.talk=null;M.menuTab='status';releaseAll();mansionGuardRelease();mansionEnter(origin.room,origin.x,origin.y);M.hp=mansionMaxHP();mansionSay('談話室に戻った。アスターテさんには何度でも挑めるよ。',180);mansionUI();return true;}
function mansionSparRetry(){M.sparState='ready';M.hp=mansionMaxHP();M.enemyShots=[];M.shots=[];M.hurt=60;mansionTalkShow('アスターテ',['……少し、休みましょうか。\n焦らなくても大丈夫。私はここにおりますよ。','もう一度、ゆっくり。\n海音ちゃんなら、きっとできますよ。'],'sparStart');}
function mansionAstarteGuide(){const lines=M.room==='cellar'?(M.flags.seal?['紋章をお持ちなら、封印の先へ進めますよ。\n水路の途切れには、気をつけてくださいね。']:['この先は、水脈の紋章がないと通れません。\n大広間の上階から、書庫を探してみましょう。']):M.room==='hall'?['上へ進むには、魔法の壁キックですね。\n壁へ向かって押しながら、跳んでみてください。']:M.room==='garden'?['お身体は、もう大丈夫そうですね。\nあの月のことは、私も少し調べておきます。']:['紫の扉の前で「調べる」と、行き先を選べますよ。\n拠点と、探索先の要所を繋ぐ扉です。','まだ通れない道は、覚えておくといいですね。\n新しい力を得たら、一緒に確かめましょう。'];if(M.room==='bedroom')lines.push(M.flags.astarteReward?'本番の手合わせも、いつでもどうぞ。\n護符の力が、海音ちゃんを支えてくれますよ。':'もっと確かめたいときは、本番の手合わせを。\n最後までできたら、護符をお贈りしますね。');if(M.room==='bedroom')lines.push('探索には、私もご一緒しますね。\n画面上の交代ボタンで、いつでも呼んでください。');mansionTalkShow('アスターテ',lines);if(M.room==='bedroom'){M.talk.offerFull=true;mansionUI();}}
// Ground attack directions and rain targets are locked when telegraphed, never homing during strikes.
function mansionAstarteAI(e){if(M.sparState!=='active')return;const phase=e.t%360,rage=e.hp<=e.maxHp/2,oldX=e.x;e.dir=M.x<e.x?-1:1;e.pose=-1;e.striking=false;
 if((phase<25||(phase>55&&phase<110)||(phase>145&&phase<165))&&Math.abs(M.x-e.x)>85){e.x=Math.max(250,Math.min(590,e.x+e.dir*(rage?1.65:1.25)));e.walkDistance=(e.walkDistance||0)+Math.abs(e.x-oldX);e.pose=4+(Math.floor(e.walkDistance/8)%4);}
 if((phase>=25&&phase<=44)||(phase>=115&&phase<=134))e.pose=15;
 if(phase===40||phase===130){const high=phase===130;M.enemyShots.push({kind:'crescent',x:e.x+e.dir*26,y:256-(high?24:10),vx:e.dir*(rage?2.7:2.2),vy:0});sfx('shot');}
 if(phase===175){e.slashDir=e.dir;sfx('warn');}
 if(phase>=175&&phase<=195){e.dir=e.slashDir||e.dir;e.pose=8;}
 if(phase>195&&phase<=215){e.dir=e.slashDir||e.dir;e.x=Math.max(250,Math.min(590,e.x+e.dir*(rage?4.6:4)));e.walkDistance=(e.walkDistance||0)+Math.abs(e.x-oldX);e.pose=4+(Math.floor(e.walkDistance/8)%4);}
 if(phase>=216&&phase<=225){e.dir=e.slashDir||e.dir;e.pose=9;e.striking=true;}
 if(phase===216){mansionBurst(e.x+e.dir*35,237,'#d1b3ff',12);sfx('shot');}
 if(phase>225&&phase<245){e.dir=e.slashDir||e.dir;e.pose=rage&&phase<235?8:11;}
 if(rage&&phase>=235&&phase<=242){e.dir=e.slashDir||e.dir;e.pose=10;e.striking=true;e.x=Math.max(250,Math.min(590,e.x+e.dir*1.5));}
 if(e.striking){const front=(M.x-e.x)*e.dir;if(front>-10&&front<72&&M.y>230)mansionDamage(3,e.dir);}
 if(phase>=245&&phase<=250)e.pose=12;
 if(phase===250){e.leapFrom=e.x;e.leapTo=Math.max(260,Math.min(590,M.x+(e.x>M.x?-110:110)));sfx('warn');}
 if(phase>250&&phase<=295&&Number.isFinite(e.leapFrom)){const k=(phase-250)/45;e.x=e.leapFrom+(e.leapTo-e.leapFrom)*k;e.y=256-Math.sin(k*Math.PI)*72;e.pose=k<.5?13:14;}else e.y=256;
 if(phase>295&&phase<305)e.pose=12;
 if(rage&&phase===300){e.rainX=Math.max(248,Math.min(590,M.x));sfx('warn');}
 if(rage&&phase>305&&phase<=334)e.pose=15;
 if(rage&&phase===330&&Number.isFinite(e.rainX)){for(const dx of [-24,-12,0,12,24])M.enemyShots.push({kind:'star',x:e.rainX+dx,y:105,vx:0,vy:2.7});e.rainX=null;}
 if((phase>195&&phase<=215)||(phase>250&&phase<=295)){if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.x-13,e.y-34,26,34]))mansionDamage(2,M.x<e.x?-1:1);}
}
function mansionTalkPortrait(){const c=document.getElementById('mTalkPortrait'),p=c.getContext('2d');p.clearRect(0,0,96,96);const asta=M.talk?.speaker==='アスターテ',seiten=M.talk?.speaker==='青天';c.setAttribute('aria-label',seiten?'青天':asta?'アスターテ':'被り物姿のダイスロール');p.imageSmoothingEnabled=true;if(seiten){if(mansionSeitenPortrait)p.drawImage(mansionSeitenPortrait,275,230,655,655,0,0,96,96);else{const f=sheetFrame('seiten','idle',0);if(f)p.drawImage(pick(f,1,false),0,0,96,96);}}else if(asta){if(mansionAstarteFace)p.drawImage(mansionAstarteFace,0,0,96,96);else{const f=sheetFrame('astarte','idle',0);if(f)p.drawImage(pick(f,1,false),0,0,96,96);}}else if(RORU_ART.image)p.drawImage(RORU_ART.image,305,0,380,440,0,0,96,96);}

let mansionAstarteFace=null;{const img=new Image();img.onload=()=>mansionAstarteFace=img;img.src='assets/astarte-sequel-face.png';}
const mansionGuardKeys=new Set();
const mansionInput={slide:false,map:false,use:false,guardPointer:null};
let mansionActionArt=null,mansionBackdrop=null;
for(const [name,url] of [['actions','assets/umine-mansion-actions.png'],['background','assets/mansion-background.png']]){const image=new Image();image.onload=()=>{if(name==='actions')mansionActionArt=image;else mansionBackdrop=image;};image.src=url;}
function mansionRead(){try{const s=JSON.parse(localStorage.getItem(MANSION_KEY));if(!s||s.version!==1||!MR[s.checkpoint?.room]||!Number.isFinite(s.checkpoint.x)||!Number.isFinite(s.checkpoint.y))return null;const r=MR[s.checkpoint.room];if(s.checkpoint.x<8||s.checkpoint.x>r.w-8||s.checkpoint.y<0||s.checkpoint.y>r.h)return null;return{flags:{seal:s.flags?.seal===true,boss:s.flags?.boss===true,complete:s.flags?.complete===true,astarteFull:s.flags?.astarteFull===true,...mansionRewardFlags(s),seitenLeftArchive:s.flags?.seitenLeftArchive===true,archiveLatch:s.flags?.archiveLatch===true,starShortcut:s.flags?.starShortcut===true,seitenDefeated:s.flags?.seitenDefeated===true},visited:Array.isArray(s.visited)?s.visited.filter(x=>MR[x]):['bedroom'],checkpoint:s.checkpoint.room==='garden'&&s.checkpoint.y===208?{...s.checkpoint,y:256}:s.checkpoint,portals:Array.isArray(s.portals)?[...new Set([...MANSION_WARP_START,...s.portals.filter(id=>MANSION_PORTALS[id])])]:[...MANSION_WARP_START]};}catch{return null;}}
function mansionSave(){try{localStorage.setItem(MANSION_KEY,JSON.stringify({version:1,rewardVersion:2,flags:M.flags,visited:M.visited,portals:M.portals,checkpoint:M.checkpoint}));M.saved=true;M.saveError=false;}catch{M.saveError=true;}}
function mansionSay(text,time=220){M.message=text;M.messageT=time;}
function mansionStart(resume=false){mansionGuardRelease();M.guardFlash=0;const saved=resume?mansionRead():null;M.actor='umine';M.swapCool=0;M.abilityCool=0;M.castT=0;Object.assign(M,{hp:16,hurt:0,dead:0,t:0,flags:saved?.flags||{seal:false,boss:false,complete:false,seitenLeftArchive:false,archiveLatch:false,starShortcut:false,seitenDefeated:false},visited:saved?.visited||['bedroom'],portals:saved?.portals||[...MANSION_WARP_START],checkpoint:saved?.checkpoint||{room:'bedroom',x:110,y:208},map:false,talk:null,menuTab:'status',saved:!!saved,saveError:false});M.hp=mansionMaxHP();mansionEnter(M.checkpoint.room,M.checkpoint.x,M.checkpoint.y);setState('mansion');mansionSay(resume?'また、ここから探してみよう。':'紫の扉はワープ。普通の扉からも回廊へ進めるよ。');mansionUI();}
function mansionEnter(room,x,y){mansionGuardRelease();M.guardFlash=0;Object.assign(M,{room,x,y,waterPlatform:null,castT:0,sparState:'waiting',sparMode:'tutorial',sparReturn:null,diceReturn:null,diceState:'waiting',seitenState:M.flags.seitenDefeated?'done':'waiting',stepT:0,stepCool:0,clawQueued:false,walkDistance:0,vx:0,vy:0,h:MC.h,ground:false,wall:0,wallGrace:0,coyote:0,buffer:0,kickLock:0,slideT:0,cool:0,poseT:0,shots:[],enemyShots:[],fx:[],transition:16,near:null,prompt:''});mansionLiftEnter(room);mansionPropsEnter(room);M.enemies=MR[room].enemies.map((e,i)=>({kind:e[0],x:e[1],y:e[2],baseY:e[2],min:e[3],max:e[4],dir:i%2?-1:1,hp:e[0]==='fly'?2:3,t:0,flash:0}));if(room==='seitenArena'&&!M.flags.seitenDefeated)M.enemies.push(mansionNewSeiten());if(MR[room].boss&&!M.flags.boss)M.enemies.push(mansionNewAstarte());if(!M.visited.includes(room))M.visited.push(room);mansionCamera(true);mansionSave();}
function mansionSolids(){const r=MR[M.room];return [...r.floor,...r.blocks,...(M.waterPlatform?[M.waterPlatform.box]:[]),...(M.lift?[mansionLiftBox()]:[]),...(r.switchGate&&!M.flags[r.lever.flag]?[r.switchGate]:[]),[0,-16,r.w,16],[-16,0,16,r.h],[r.w,0,16,r.h],...(r.gate&&!M.flags.seal?[r.gate]:[]),...(M.room==='seitenArena'&&M.seitenState==='active'?[[0,0,40,256],[472,0,40,256]]:[]),...(M.room==='garden'&&M.sparState==='active'?[[208,0,12,288]]:[])];}
function mansionOverlap(x,y,w,h,b){return x<b[0]+b[2]&&x+w>b[0]&&y<b[1]+b[3]&&y+h>b[1];}
function mansionFits(x,y,h=MC.h){return !mansionSolids().some(b=>mansionOverlap(x-MC.w/2,y-h,MC.w,h,b));}
function mansionBurst(x,y,color='#8beeff',n=9){for(let i=0;i<n;i++)M.fx.push({x,y,vx:Math.cos(i/n*6.28)*(1+i%3),vy:Math.sin(i/n*6.28)*(1+i%3),life:20+i%7,color});}
function mansionDamage(n,dir=0){if(M.hurt||M.dead)return;const blocked=mansionGuarding()&&dir===-M.face;if(blocked){n=Math.max(1,Math.floor(n/2));M.guardFlash=10;mansionBurst(M.x+M.face*20,M.y-22,'#ffe6ab',8);}if(M.seitenState==='active'&&M.hp-n<=0){mansionSeitenRetry();return;}if(M.diceState==='active'&&M.hp-n<=0){mansionDiceRetry();return;}if(M.room==='garden'&&M.sparState==='active'&&M.hp-n<=0){mansionSparRetry();return;}M.hp=Math.max(0,M.hp-n);if(!mansionIsUmine())M.poseT=M.castT=M.stepT=0;M.stepT=0;M.hurt=blocked?36:75;M.vx=dir*(blocked?.8:2.8);M.vy=blocked?0:-3;M.kickLock=blocked?4:10;M.slideT=0;mansionBurst(M.x,M.y-14,'#ff9abb');sfx(blocked?'guard':'hurt');if(!M.hp){M.dead=65;mansionSay('……もう一度、あの灯りのところから。',100);}}
// Door events run only after a valid destination is entered.
function mansionDoorAvailable(d){return !!d&&!!MR[d.to]&&Array.isArray(d.at)&&d.at.length===2&&d.at.every(Number.isFinite)&&(!d.need||M.flags[d.need]);}
function mansionEnterDoor(d){if(!mansionDoorAvailable(d))return false;mansionEnter(d.to,...d.at);if(d.onEnterFlag==='seitenLeftArchive'){M.flags.seitenLeftArchive=true;mansionSave();}return true;}
function mansionUse(){if(M.sparMode==='full'||M.diceReturn)return;if(M.seitenState==='active')return;const npc=mansionNearbyNPC();if(npc){if(npc.id==='astarte'){M.actor='umine';M.poseT=0;}npc.talk();return;}const r=MR[M.room];if(mansionLeverUse())return;if(mansionLiftUse())return;if(mansionAtPortal()){mansionWarpOpen();return;}if(r.extension&&Math.abs(M.x-r.extension[0])<24&&Math.abs(M.y-r.extension[1])<24){if(!mansionEnterDoor(r.extensionDoor))mansionSay('奥の部屋は、まだ鍵がかかっている。');else mansionSay(MR[M.room].name,110);return;}if(r.seal&&!M.flags.seal&&Math.hypot(M.x-r.seal[0],M.y-18-r.seal[1])<34){M.flags.seal=true;mansionSave();mansionBurst(r.seal[0],r.seal[1],'#ffe48f',18);mansionSay('水脈の紋章！ 封印が解けた。固有行動で水の足場も使えるよ。',280);sfx('start');return;}
 if(r.cp&&Math.abs(M.x-r.cp[0])<24&&Math.abs(M.y-r.cp[1])<24){M.hp=mansionMaxHP();M.checkpoint={room:M.room,x:r.cp[0],y:r.cp[1]};mansionSave();mansionSay(M.saveError?'回復したよ。記録できないため、この画面を閉じないでね。':'水の灯りに記録したよ。体力も回復！');sfx('heal');return;}
 for(const d of r.doors)if(Math.abs(M.x-d.x)<25&&Math.abs(M.y-d.y)<28){if(d.need&&!M.flags[d.need]){mansionSay('向こう側から、鍵がかかっているみたい。');return;}if(mansionEnterDoor(d))mansionSay(MR[d.to].name,110);return;}
 if(r.goal&&M.flags.boss&&Math.abs(M.x-r.goal[0])<28){M.flags.complete=true;mansionSave();setState('mansionClear');mansionUI();}}
// Exploration wings use a wider view. HUD, portraits and touch targets keep their size.
function mansionView(){const zoom=(M.room==='gallery'&&M.galleryWide!==false)||['archiveInner','clockTower','moonReservoir','starPassage','forbiddenArchive','seitenArena'].includes(M.room)?.8:1;return{zoom,w:VW/zoom,h:VH/zoom};}
function mansionGalleryViewToggle(){if(M.room!=='gallery'||!M.map)return;M.galleryWide=M.galleryWide===false;mansionCamera(true);mansionUI();}
function mansionCamera(snap=false){const r=MR[M.room],v=mansionView(),diceFocus=(M.diceState==='active'||M.seitenState==='active')?M.x+Math.max(-90,Math.min(90,((M.enemies.find(e=>e.kind===(M.seitenState==='active'?'seitenBoss':'diceBoss'))?.x||M.x)-M.x)*.5)):null,focus=diceFocus??(M.room==='garden'&&M.sparState==='active'?(M.x*.65+(M.enemies.find(e=>e.kind==='boss')?.x||M.x)*.35):M.x),tx=Math.max(0,Math.min(r.w-v.w,focus-v.w*(diceFocus==null?.43:.5))),ty=Math.max(0,Math.min(r.h-v.h,M.y-158/v.zoom));M.camX=snap?tx:M.camX+(tx-M.camX)*.17;M.camY=snap?ty:M.camY+(ty-M.camY)*.14;}

function updateMansion(){
 mansionUI();
 if(state==='mansionClear'){if(stateT>25&&(inp.startPressed||inp.shootPressed||mansionInput.use)){setState('mansion');M.checkpoint={room:'bedroom',x:110,y:208};mansionEnter('bedroom',110,208);mansionSay('拠点に戻ったよ。紫の扉で繋がった場所へ戻れるよ。');}if(inp.backPressed)setState('title');mansionInput.use=mansionInput.slide=mansionInput.map=false;return;}
 if(mansionInput.map){mansionMenuToggle();}mansionInput.map=false;
 if(inp.backPressed){if(M.map){mansionTalkClose();M.map=false;releaseAll();mansionGuardRelease();mansionUI();}else if(M.diceReturn){mansionDiceReturn();}else if(M.sparReturn){mansionFullReturn();}else{mansionSave();setState('title');}mansionInput.slide=mansionInput.use=false;return;}
 if(M.map){if(M.talk&&(mansionInput.use||inp.startPressed||inp.shootPressed||inp.jumpPressed))mansionTalkNext();mansionInput.slide=mansionInput.use=false;return;}
 if(M.room==='seitenArena'&&!M.flags.seitenDefeated&&M.seitenState==='waiting'&&M.x>=120){mansionSeitenIntro();return;}
 if(M.room==='garden'&&!M.flags.boss&&M.sparState==='waiting'&&M.x>=300){mansionAstarteIntro();return;}
 M.t++;
 if(M.stepT>0)M.stepT--;if(M.stepCool>0)M.stepCool--;if(M.guardFlash>0)M.guardFlash--;if(M.abilityCool>0)M.abilityCool--;if(M.castT>0)M.castT--;if(M.waterPlatform&&--M.waterPlatform.life<=0)M.waterPlatform=null;if(M.swapCool>0)M.swapCool--;if(M.transition>0)M.transition--;if(M.messageT>0)M.messageT--;if(M.hurt>0)M.hurt--;if(M.cool>0)M.cool--;if(M.poseT>0)M.poseT--;
 for(const f of M.fx){if(f.kind!=='scytheImpact'){f.x+=f.vx;f.y+=f.vy;f.vy+=.07;}f.life--;}M.fx=M.fx.filter(f=>f.life>0);
 if(M.dead){if(--M.dead===0){M.hp=mansionMaxHP();M.hurt=90;mansionEnter(M.checkpoint.room,M.checkpoint.x,M.checkpoint.y);}mansionInput.slide=mansionInput.use=false;return;}
 if(M.slideT&&M.t%3===0)M.fx.push({x:M.x-M.face*13,y:M.y-3,vx:-M.face,vy:-.1,life:8,color:'#80dfff'});
 const use=mansionInput.use||inp.magicPressed||inp.upPressed; mansionInput.use=false;
 if(use&&!M.transition){mansionUse();if(M.transition||M.map||state!=='mansion')return;}
 mansionLiftUpdate();mansionVentUpdate();
 const dx=(inp.right?1:0)-(inp.left?1:0);if(M.ground)M.coyote=6;else if(M.coyote>0)M.coyote--;
 if(inp.jumpPressed)M.buffer=7;else if(M.buffer>0)M.buffer--;
 if(M.wall)M.wallGrace=6;else if(M.wallGrace>0)M.wallGrace--;
 const slideRequest=mansionInput.slide||(keys.down&&inp.jumpPressed);mansionInput.slide=false;
 if(slideRequest&&mansionIsUmine()&&M.ground&&!M.slideT){M.slideT=24;M.h=MC.slideH;M.buffer=0;if(dx)M.face=dx;mansionBurst(M.x-M.face*8,M.y-3,'#9ae5ff',6);sfx('jump');}
 if(slideRequest&&M.actor==='seiten'&&M.ground&&!M.stepT&&!M.stepCool&&!M.poseT&&!M.castT){M.stepT=14;M.stepCool=55;M.stepFace=M.face;M.vy=-2.4;M.ground=false;M.buffer=M.coyote=0;mansionBurst(M.x,M.y-3,'#ffb4ca',6);sfx('jump');}
 if(M.slideT){M.slideT--;M.vx=M.face*MC.slide;if(!M.slideT&&!mansionFits(M.x,M.y,MC.h))M.slideT=1;M.h=M.slideT?MC.slideH:MC.h;}
 else if(M.stepT){M.vx=-M.stepFace*3.2;}
 else if(M.kickLock>0)M.kickLock--;
 else {const target=dx*(M.actor==='seiten'?2.2:MC.run)*(mansionGuarding()?.3:M.actor==='astarte'&&M.poseT?.55:1);M.vx+=Math.max(-MC.acc,Math.min(MC.acc,target-M.vx));if(dx)M.face=dx;}
 if(M.buffer&&!M.slideT){if(M.ground||M.coyote){M.vy=-(M.actor==='seiten'?6.2:MC.jump);M.buffer=M.coyote=0;M.ground=false;sfx('jump');}else if(mansionIsUmine()&&(M.wall||M.wallGrace)){const away=-(M.wall||M.lastWall||1);M.vx=away*MC.wallPush;M.face=away;M.vy=-MC.wallJump;M.kickLock=6;M.buffer=M.wallGrace=0;mansionBurst(M.x-away*9,M.y-8);sfx('jump');}}
 if(!inp.jump&&M.vy<-2&&M.kickLock===0)M.vy=-2;
 M.vy=Math.min(MC.fall,M.vy+MC.gravity);const solids=mansionSolids();
 const walkStartX=M.x;M.x+=M.vx;M.wall=0;
 for(const b of solids)if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,b)){if(M.vx>0){M.x=b[0]-MC.w/2;M.wall=1;}else if(M.vx<0){M.x=b[0]+b[2]+MC.w/2;M.wall=-1;}M.vx=0;}
 // Keep wall contact stable while holding against a wall; tolerate subpixel positions.
 for(const side of [-1,1])if(dx===side&&solids.some(b=>mansionOverlap(M.x-MC.w/2+side*.7,M.y-M.h+2,MC.w,M.h-3,b)))M.wall=side;
 if(M.wall){M.lastWall=M.wall;if(mansionIsUmine()&&!M.ground&&M.vy>MC.wallFall)M.vy=MC.wallFall;}
 M.y+=M.vy;M.ground=false;
 for(const b of solids)if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,b)){if(M.vy>0){M.y=b[1];M.ground=true;M.coyote=6;}else if(M.vy<0)M.y=b[1]+b[3]+M.h;M.vy=0;}
 if(M.ground)M.wallGrace=0;
 if(M.ground&&!M.slideT&&!M.hurt&&Math.abs(M.x-walkStartX)>.1)M.walkDistance+=Math.abs(M.x-walkStartX);else M.walkDistance=0;
 if(M.y>MR[M.room].h+40){M.hp=Math.max(1,M.hp-3);const cp=M.checkpoint;mansionEnter(cp.room,cp.x,cp.y);M.hurt=90;mansionSay('水の灯りまで戻ってきた。');return;}
 if(M.actor==='astarte'&&M.poseT){
 if(M.scytheStage===1&&(inp.shootPressed||(inp.shoot&&M.poseT<=34)))M.scytheQueued=true;
 if(M.poseT===(M.scytheStage===2?28:20)){mansionScytheHit();sfx('swoosh');}
 if(M.poseT===4&&M.scytheStage===1&&M.scytheQueued)mansionScythe(2);
 }
 if(inp.shoot&&M.cool===0&&M.actor==='astarte'&&!mansionGuarding()){mansionScythe();}
 if(inp.shoot&&M.cool===0&&mansionIsUmine()&&M.shots.length<3){M.shots.push({x:M.x+M.face*13,y:M.y-(M.slideT?7:17),vx:M.face*4.8});M.cool=10;M.poseT=14;sfx('shot');}
 if(M.actor==='seiten'){mansionSeitenPlayerUpdate();if(M.map)return;}
 for(const shot of M.shots){shot.x+=shot.vx;if(solids.some(b=>mansionOverlap(shot.x-2,shot.y-2,4,4,b))){shot.dead=true;mansionBurst(shot.x,shot.y,'#96eaff',3);}mansionPropsHit(shot);for(const e of M.enemies){if(!shot.dead&&e.hp>0&&(e.kind!=='boss'||M.sparState==='active')&&(e.kind!=='diceBoss'||M.diceState==='active')&&(e.kind!=='seitenBoss'||M.seitenState==='active')&&Math.abs(shot.x-e.x)<(e.kind==='boss'||e.kind==='diceBoss'||e.kind==='seitenBoss'?19:12)&&shot.y>e.y-(e.kind==='boss'||e.kind==='diceBoss'||e.kind==='seitenBoss'?38:24)&&shot.y<e.y+2){shot.dead=true;if((e.kind==='boss'||e.kind==='seitenBoss')&&e.guard>0){mansionBurst(shot.x,shot.y,'#baa5ed',2);continue;}e.hp-=shot.damage||1;e.flash=6;if(e.kind==='boss'||e.kind==='seitenBoss')e.guard=18;mansionBurst(shot.x,shot.y,'#b1f8ff',4);sfx('hit');if(e.kind==='seitenBoss'&&e.hp<=0){mansionSeitenWin();return;}if(e.kind==='diceBoss'&&e.hp<=0){mansionDiceWin();return;}if(e.kind==='boss'&&e.hp<=(M.sparMode==='full'?0:e.maxHp/2)){mansionBurst(e.x,e.y-12,'#ffdca1',14);mansionSparWin();}else if(e.hp<=0){mansionBurst(e.x,e.y-12,'#ffdca1',14);if(M.hp<mansionMaxHP())M.hp++;}}}}
 M.shots=M.shots.filter(s=>!s.dead&&Math.abs(s.x-M.x)<300);
 if(M.map)return;
 mansionPickupsUpdate();
 for(const e of M.enemies){if(e.hp<=0)continue;e.t++;if(e.flash)e.flash--;if(e.guard)e.guard--;
  if(e.kind==='walk'){e.x+=e.dir*.55;if(e.x<e.min||e.x>e.max)e.dir*=-1;}
  if(e.kind==='fly'){e.x+=e.dir*.55;if(e.x<e.min||e.x>e.max)e.dir*=-1;e.y=e.baseY+Math.sin(e.t*.055)*14;}
  if(e.kind==='seitenBoss'){mansionSeitenAI(e);if(M.map)return;continue;}
  if(e.kind==='boss')mansionAstarteAI(e);
  if(e.kind==='diceBoss'){mansionDiceAI(e);if(M.diceState==='active'&&mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.x-13,e.y-36,26,36]))mansionDamage(2,M.x<e.x?-1:1);if(M.map)return;continue;}
  if(e.kind!=='boss'&&mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.x-(e.kind==='boss'?16:9),e.y-(e.kind==='boss'?32:21),e.kind==='boss'?32:18,e.kind==='boss'?32:21]))mansionDamage(e.kind==='boss'?3:2,M.x<e.x?-1:1);
 }
 for(const b of M.enemyShots){if(b.kind==='songNote'){b.age=(b.age||0)+1;b.y=b.baseY+Math.sin(b.age*.12)*2;}if(b.kind==='dice'){b.vy+=.12;if(b.y+b.vy>=248){b.y=248;b.vy=-2.4;}}b.x+=b.vx;b.y+=b.vy;if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,(b.kind==='songWave'||b.kind==='songNote'?mansionSeitenShotBox(b):[b.x-3,b.y-3,6,6]))){mansionDamage(b.damage||2,Math.sign(b.vx));b.dead=true;if(M.map)return;}if(solids.some(s=>mansionOverlap(b.x-2,b.y-2,4,4,s)))b.dead=true;}
 M.enemyShots=M.enemyShots.filter(b=>!b.dead&&b.x>0&&b.x<MR[M.room].w&&b.y<MR[M.room].h+16);
 M.near=null;M.prompt='';const r=MR[M.room];
 if(r.cp&&Math.abs(M.x-r.cp[0])<24&&Math.abs(M.y-r.cp[1])<24)M.prompt='調べる：記録・全回復';
 for(const d of r.doors)if(Math.abs(M.x-d.x)<25&&Math.abs(M.y-d.y)<28)M.prompt=d.need&&!M.flags[d.need]?'鍵がかかっている':'調べる：'+d.label;
 if(r.seal&&!M.flags.seal&&Math.abs(M.x-r.seal[0])<30)M.prompt='調べる：水脈の紋章';
 if(r.goal&&M.flags.boss&&Math.abs(M.x-r.goal[0])<28)M.prompt='調べる：屋敷の外へ';
 const lever=MR[M.room].lever;if(lever&&Math.abs(M.x-lever.x)<24&&Math.abs(M.y-lever.y)<24)M.prompt=M.flags[lever.flag]?'錠は開いている':'調べる：'+lever.label+'を開く';
 const npc=mansionNearbyNPC();if(npc)M.prompt='調べる：'+npc.name+'と話す';
 if(r.extension&&Math.abs(M.x-r.extension[0])<24&&Math.abs(M.y-r.extension[1])<24)M.prompt='調べる：奥の部屋';
 const liftPrompt=mansionLiftPrompt();if(liftPrompt)M.prompt=liftPrompt;
 mansionPortalDiscover();
 if(mansionAtPortal())M.prompt='調べる：ワープ先を選ぶ';
 mansionCamera();
}
function mrect(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);}
function mansionTile(x,y,w,h){for(let yy=0;yy<h;yy+=16)for(let xx=0;xx<w;xx+=16){const tw=Math.min(16,w-xx),th=Math.min(16,h-yy),light=yy===0; mrect(x+xx,y+yy,tw,th,'#111d32');mrect(x+xx+1,y+yy+1,Math.max(1,tw-2),Math.max(1,th-2),((xx/16+yy/16)&1)?'#39475e':'#344158');mrect(x+xx+1,y+yy+1,Math.max(1,tw-2),light?3:1,light?'#98bcc8':'#55657b');if(th>8){mrect(x+xx+3,y+yy+6,2,2,'#6b7485');mrect(x+xx+tw-4,y+yy+th-4,2,2,'#18263d');}}}
function mansionDiamond(x,y,size,color){g.fillStyle=color;g.beginPath();g.moveTo(x,y-size);g.lineTo(x+size*.65,y);g.lineTo(x,y+size);g.lineTo(x-size*.65,y);g.closePath();g.fill();}
function mansionHubDecor(){
 if(M.room==='bedroom'){
  // A tall open arch separates the guest room from the continuous lounge.
  for(const x of [270,300]){mrect(x,35,6,173,'#7f718b');mrect(x+1,38,3,166,'#4f516e');mrect(x-3,190,12,18,'#7a8298');}mrect(268,30,40,6,'#a09bb4');
  // Carpet, framed moon painting, two chairs, and a low table are scenery, not blockers.
  mrect(330,203,175,5,'#856373');mrect(334,204,167,2,'#c19b79');
  mansionPropDraw('picture',455,124,48);
  for(const x of [353,485])mansionPropDraw('chair',x,208,44);
  mansionPropDraw('table',433,208,31);mansionPropDraw('books',433,177,8);
  mansionPropDraw('shelf',535,208,67);
 }else if(M.room==='hubCellar'){
  // Workshop/storage shell; later rooms attach via MR doors, not the combat waterway.
  for(let y=28;y<208;y+=24)for(let x=0;x<384;x+=32){const off=(y/24|0)%2?16:0;mrect(x-off,y,31,23,'#283444');mrect(x-off+1,y+1,29,2,'#526274');}
  for(const x of [184,221]){mrect(x,137,27,66,'#527283');mrect(x+3,140,21,57,'#1b354b');mrect(x+4,169,19,25,'#437c93');mrect(x+4,166+Math.sin(M.t*.03)*2,19,2,'#89d6df');mrect(x+10,144,3,17,'#8eafbe');}mrect(182,129,69,7,'#909b9e');
  for(const x of [280,309])mansionPropDraw('box',x,208,23);
 }
}
function mansionGalleryDecor(){
 // Tall moonlit windows and two distinct floor levels make the space readable.
 for(let x=80;x<1536;x+=192){
  mrect(x-34,32,68,146,'#101d36');rectLine(x-36,30,72,150,'#778195');
  mrect(x-30,36,60,138,'#263c59');mrect(x-26,40,24,130,'#42617b');mrect(x+3,40,24,130,'#3c5370');
  mrect(x-26,116,53,2,'#98b4c4');mrect(x-1,38,3,136,'#a6acb0');
  for(let i=0;i<7;i++)mrect(x-23+i*8,45+i*11,2,2,'#8fbed1');
  mrect(x-43,28,7,153,'#4a435c');mrect(x+36,28,7,153,'#4a435c');mrect(x-39,178,79,4,'#b6a584');
 }
 mrect(0,242,1536,6,'#746075');mrect(0,248,1536,2,'#b39b82');
 for(let x=576;x<1536;x+=96){mrect(x,272,88,84,'#1c2941');rectLine(x+6,278,76,66,'#495975');mrect(x+10,282,68,2,'#7b7081');}
 for(const x of [176,784,1152]){mrect(x-1,0,2,43,'#b0986b');mrect(x-20,43,40,3,'#b99f72');for(const dx of [-18,0,18]){mrect(x+dx-2,37,4,6,'#dbcdb0');mansionDiamond(x+dx,34,3,'#ffe5a2');}}
 // Balcony rails sit behind sprites; repeated pillars are decorative, never colliders.
 for(const [x,y,w] of [[416,112,96],[552,128,112],[704,112,160],[920,160,112],[1072,208,112]]){
  mrect(x,y-24,w,3,'#b8a689');for(let n=x+4;n<x+w;n+=16)mrect(n,y-21,2,21,'#63657b');
 }
 for(const x of [544,1168]){mrect(x,254,10,114,'#59637a');mrect(x-4,250,18,5,'#a59f97');}
 mansionPropDraw('shelf',888,368,44);mansionPropDraw('table',990,368,30);mansionPropDraw('chair',1030,368,32);
 mansionPropDraw('picture',400,84,30);mansionPropDraw('picture',1344,136,36);
 // Stair risers are scenery; collision uses the explicit platform list above.
 for(const [x,y] of [[624,256],[688,304],[1184,320],[1248,272],[1312,224]]){
  mrect(x,y+10,64,368-y-10,'#202e46');for(let yy=y+14;yy<368;yy+=16)mrect(x+4,yy,56,1,'#3e4d64');
 }
}
// Archive elevator: ordinary transport, not a warp. Future stops can extend the room's stop list.
function mansionLiftEnter(room){const l=MR[room].lift;M.lift=l?{y:l.stops[l.initialStop||0],target:l.stops[l.initialStop||0],direction:-1}:null;}
function mansionLiftBox(){const l=MR[M.room].lift;return[l.x,M.lift.y,l.w,8];}
function mansionLiftLanding(){const l=MR[M.room].lift;if(!l||!M.lift)return null;return l.stops.find(y=>Math.abs(M.y-y)<22&&Math.abs(M.x-(l.x+l.w/2))<66)??null;}
function mansionLiftRiding(){const l=MR[M.room].lift;return !!l&&!!M.lift&&M.ground&&Math.abs(M.y-M.lift.y)<1&&M.x-MC.w/2>=l.x&&M.x+MC.w/2<=l.x+l.w;}
function mansionLiftPrompt(){const y=mansionLiftLanding();if(y==null)return '';return M.lift.y!==M.lift.target?'昇降機が移動中':mansionLiftRiding()?'調べる：昇降機で'+(MR[M.room].lift.stops.length>2?'次の階へ':y===MR[M.room].lift.stops[0]?'下階へ':'上階へ'):'調べる：昇降機を呼ぶ';}
function mansionLiftUse(){const y=mansionLiftLanding();if(y==null)return false;if(M.lift.y!==M.lift.target){mansionSay('昇降機が移動中。乗り場で待ってみよう。',100);return true;}const stops=MR[M.room].lift.stops;if(mansionLiftRiding()){const i=stops.indexOf(y);if(i===0)M.lift.direction=1;else if(i===stops.length-1)M.lift.direction=-1;M.lift.target=stops[i+M.lift.direction];}else M.lift.target=y;sfx('start');mansionSay(M.lift.target===y?'昇降機を呼んだ。足場に乗って「調べる」で移動。':'昇降機が動き出した。途中で飛び降りることもできるよ。',150);return true;}
function mansionLiftUpdate(){if(!M.lift||M.lift.y===M.lift.target)return;const l=MR[M.room].lift,oldY=M.lift.y,dy=Math.max(-1.2,Math.min(1.2,M.lift.target-oldY)),riding=mansionLiftRiding(),next=[l.x,oldY+dy,l.w,8];
 // Stop safely for obstructions instead of crushing or pushing the hero through geometry.
 const staticSolids=mansionSolids().filter(b=>!(b[0]===l.x&&b[1]===oldY&&b[2]===l.w&&b[3]===8));
 if(riding?staticSolids.some(b=>mansionOverlap(M.x-MC.w/2,oldY+dy-M.h+.001,MC.w,M.h-.002,b)):mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,next))return;
 M.lift.y=Math.abs(M.lift.target-oldY)<=1.2?M.lift.target:oldY+dy;if(riding)M.y=M.lift.y;
}
function mansionLiftDraw(){if(!M.lift)return;const l=MR[M.room].lift,top=l.stops[0],bottom=l.stops.at(-1),y=M.lift.y;
 for(const x of [l.x-5,l.x+l.w+3]){mrect(x,top-92,3,bottom-top+92,'#8b7d6f');mrect(x+1,top-92,1,bottom-top+92,'#d5c5a1');}
 for(const x of [l.x+3,l.x+l.w-5]){mrect(x,top-92,2,y-top+92,'#665764');for(let yy=top-88;yy<y;yy+=8)mrect(x-1,yy,4,2,'#ac947d');}
 mrect(l.x-3,y-58,l.w+6,4,'#b5a17c');for(const x of [l.x-2,l.x+l.w-1])mrect(x,y-54,3,54,'#80738a');
 mansionTile(l.x,y,l.w,8);mrect(l.x+2,y+7,l.w-4,3,'#b99862');
 for(const stop of l.stops){mrect(l.x+l.w+16,stop-27,8,16,'#212239');rectLine(l.x+l.w+15,stop-28,10,18,'#beac83');mansionDiamond(l.x+l.w+20,stop-21,3,Math.abs(y-stop)<1?'#ffe7a2':'#678999');}
}
let mansionSeitenArt=null,mansionSeitenPortrait=null;
{const img=new Image();img.onload=()=>mansionSeitenArt=img;img.src='assets/seiten-sequel-idle.png';const face=new Image();face.onload=()=>mansionSeitenPortrait=face;face.src='assets/seiten-sequel-reference.png';}
// Frame rectangles and common game scale are filled from the inspected sequel atlas.
const SEITEN_NPC_FRAMES=[{"name":"idle1","rect":[0,0,627,627],"anchor":[406,586],"scale":0.082},{"name":"idle2","rect":[627,0,627,627],"anchor":[363,585],"scale":0.082},{"name":"shy","rect":[0,627,627,627],"anchor":[415,559],"scale":0.082},{"name":"smile","rect":[627,627,627,627],"anchor":[379,560],"scale":0.082}];
function drawMansionSeiten(x,y,t,face=1){if(mansionSeitenArt&&SEITEN_NPC_FRAMES.length){const fi=M.talk?.speaker==='青天'?2:Math.floor(t/45)%2,f=SEITEN_NPC_FRAMES[fi];g.save();g.translate(Math.round(x),Math.round(y));g.scale(face,1);g.drawImage(mansionSeitenArt,...f.rect,-f.anchor[0]*f.scale,-f.anchor[1]*f.scale,f.rect[2]*f.scale,f.rect[3]*f.scale);g.restore();return;}const f=sheetFrame('seiten','idle',Math.floor(t/30)%2);if(f)g.drawImage(pick(f,face,false),x-24,y-48,48,48);}
function mansionSeitenTalk(){mansionTalkShow('青天',['……海音ちゃん。来てくれた。\nこっち……隣、空いてるよ。','本を読んでたんだけど……\nひとりだと、ちょっと寂しくて。\nもう少し、ここにいてくれない？','奥にあるのは、書庫の昇降機。\n足場に乗って「調べる」と、下の階へ行けるよ。\n離れた乗り場からも呼べるみたい。','下の扉は、書庫の奥へ繋がってる。\n……先へ行く前に、また会いに来て。\n待ってるから。']);}
function mansionArchiveDecor(){
 // Repeated packed bookcases provide a coherent library identity, behind all collision geometry.
 for(const [begin,end,y] of [[40,152,208],[256,688,208],[824,960,208],[536,944,448]])for(let x=begin;x<end;x+=64){
  mrect(x-25,y-112,50,110,'#221d2d');rectLine(x-27,y-114,54,114,'#a28b65');mrect(x-29,y-117,58,5,'#c1a37c');
  for(let row=0;row<4;row++){const yy=y-104+row*25;for(let n=0;n<7;n++){const color=['#725269','#47677a','#88764e','#546858','#815057'][(n+row+Math.floor(x/64))%5];mrect(x-21+n*6,yy+(n%3),5,18-(n%3),color);mrect(x-20+n*6,yy+5,3,1,'#beac84');}mrect(x-23,yy+20,46,3,'#ab8c66');}
 }
 for(const x of [40,256,688,944]){mrect(x-1,16,2,20,'#aa8e62');mrect(x-12,36,24,4,'#b39a75');for(const dx of [-10,10])mansionDiamond(x+dx,32,3,'#ffe7a0');}
 mrect(16,198,690,5,'#856779');mrect(20,199,682,1,'#d5b494');mrect(516,439,436,6,'#856779');mrect(520,440,428,1,'#d5b494');
 mansionPropDraw('table',610,208,34);mansionPropDraw('books',610,174,9);mansionPropDraw('chair',918,208,38);
 for(const [x,y,w]of [[352,112,160],[560,160,64]]){mrect(x,y-20,w,2,'#b3a17e');for(let xx=x+4;xx<x+w;xx+=18)mrect(xx,y-18,2,18,'#71627a');}
 // Elevator housing stays visually separate from purple fast-travel doors.
 mrect(711,113,82,4,'#d0b88c');mansionDiamond(752,101,6,'#e0c797');
}
function mansionLeverUse(){const l=MR[M.room].lever;if(!l||Math.abs(M.x-l.x)>=24||Math.abs(M.y-l.y)>=24)return false;if(M.flags[l.flag]){mansionSay('錠は開いている。',90);return true;}M.flags[l.flag]=true;mansionSave();mansionBurst(l.x,l.y-22,'#ffe4a0',12);sfx('start');mansionSay(l.flag==='starShortcut'?'書庫への近道が開いた！ 上の扉から戻れるよ。':'封書の錠が開いた！ 奥の扉へ進もう。',160);return true;}
function mansionVentPhase(v){return(M.t+v.offset)%180;}
function mansionVentUpdate(){for(const v of MR[M.room].vents||[]){const phase=mansionVentPhase(v);if(phase>=120&&phase<156&&mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[v.x-13,v.y-44,26,44]))mansionDamage(2,M.x<v.x?-1:1);}}
function mansionMechanismsDraw(){const r=MR[M.room],l=r.lever;if(l){const open=M.flags[l.flag];mrect(l.x-7,l.y-24,14,24,'#24213b');rectLine(l.x-8,l.y-26,16,26,'#b29b78');mansionDiamond(l.x,l.y-33,5,open?'#b0ffe0':'#ffe6a0');mrect(l.x-1,l.y-23,2,13,open?'#83ddb9':'#d0a56b');}
 if(r.switchGate&&!M.flags[l.flag]){const[x,y,w,h]=r.switchGate;mrect(x,y,w,h,'#2d2c45');for(let yy=y+8;yy<y+h;yy+=16){mrect(x+3,yy,w-6,3,'#b6a181');mansionDiamond(x+w/2,yy+6,3,'#e6b576');}}
 for(const v of r.vents||[]){const p=mansionVentPhase(v),active=p>=120&&p<156,warn=p>=84&&p<120;mrect(v.x-17,v.y-5,34,5,'#8cb8c0');for(let x=-12;x<=12;x+=6)mrect(v.x+x,v.y-4,3,3,'#19394c');if(warn){mrect(v.x-14,v.y-8,28,2,(M.t&8)?'#ffdd82':'#9ac9d6');mansionDiamond(v.x,v.y-18,4,'#ffe6a0');}if(active){mrect(v.x-13,v.y-44,26,40,'#1b5478');mrect(v.x-9,v.y-44,18,40,'#62d5ea');mrect(v.x-4,v.y-44,8,40,'#e6ffff');for(let i=0;i<5;i++)mrect(v.x-11+i*5,v.y-48+(M.t+i)%4,3,5,'#a9f6ff');}}
}
function mansionNewWingDecor(){const r=MR[M.room];if(!['archiveInner','clockTower','moonReservoir','starPassage','forbiddenArchive','seitenArena'].includes(M.room))return;
 if(M.room==='archiveInner'){for(let x=96;x<960;x+=160){mrect(x-26,82,52,110,'#251e33');rectLine(x-28,80,56,114,'#a58c73');for(let row=0;row<4;row++){for(let i=0;i<6;i++)mrect(x-22+i*8,90+row*24,6,18,['#5e677d','#78566e','#826e50'][(i+row)%3]);mrect(x-23,110+row*24,46,3,'#a58c73');}mansionPropDraw('picture',x,298,40);}mrect(0,360,960,6,'#7f6676');for(const[x,y,w]of r.blocks){mrect(x,y-22,w,2,'#b39c7b');for(let n=x;n<x+w;n+=16)mrect(n,y-20,2,20,'#796878');}}
 if(M.room==='clockTower'){for(const y of [82,306,530])for(const x of [128,480]){g.fillStyle='#252435';g.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,rad=i%2?47:55;const xx=x+Math.cos(a)*rad,yy=y+Math.sin(a)*rad;i?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.closePath();g.fill();g.strokeStyle='#a28b68';g.lineWidth=3;g.beginPath();g.arc(x,y,39,0,7);g.stroke();g.beginPath();g.moveTo(x,y-31);g.lineTo(x,y);g.lineTo(x+24,y+12);g.stroke();mansionDiamond(x,y,5,'#d1ba85');}for(const x of [20,600])for(let y=20;y<620;y+=24){mrect(x,y,8,20,'#4e526b');mrect(x+1,y+3,6,2,'#91969f');}}
 if(M.room==='moonReservoir'){for(let x=48;x<1024;x+=128){mrect(x-15,48,30,320,'#375d6f');mrect(x-11,52,22,312,'#203d51');for(let y=64;y<360;y+=64)mrect(x-18,y,36,5,'#8bafb1');}mrect(0,348,1024,18,'#1f5063');for(let x=0;x<1024;x+=16)mrect(x,350+Math.sin((x+M.t)*.08)*2,10,1,'#6aaeba');}
 if(M.room==='starPassage'){for(let x=80;x<1152;x+=160){mrect(x-37,28,74,274,'#14223d');rectLine(x-39,26,78,278,'#7884a3');mrect(x-1,28,3,270,'#a4aab8');mrect(x-37,140,74,3,'#7786a5');for(let i=0;i<16;i++)mrect(x-28+(i*19)%56,40+(i*31)%252,1,1,i%3?'#8cbed9':'#ffe3a0');}for(const x of [104,608,1088]){mrect(x,288,7,80,'#626c88');mrect(x-6,280,19,8,'#a9aec4');}mrect(0,359,1152,6,'#6f6886');}
}
function mansionRoomDraw(){const r=MR[M.room],cx=Math.round(M.camX),cy=Math.round(M.camY),view=mansionView();g.save();g.scale(view.zoom,view.zoom);
 mrect(0,0,view.w,view.h,r.tone);
 if(mansionBackdrop){const bw=320,bh=240,off=-Math.round(cx*.18)%bw;g.globalAlpha=.64;for(let i=-1;i<2;i++)g.drawImage(mansionBackdrop,off+i*bw,-Math.round(cy*.15),bw,bh);g.globalAlpha=1;}
 mrect(0,0,view.w,view.h,'rgba(6,12,29,.26)');if(M.room==='cellar'||M.room==='hubCellar')mrect(0,0,view.w,view.h,'rgba(0,35,52,.34)');
 if(M.room==='garden'){mrect(0,0,view.w,view.h,'#17233e');for(let i=0;i<50;i++)mrect((i*47+13)%256,(i*23)%165,1,1,i%2?'#8cadc0':'#ffe9a0');g.fillStyle='#d8d8c2';g.beginPath();g.arc(195-cx*.035,68-cy*.12,24,0,7);g.fill();for(let i=0;i<8;i++){const x=i*48-(cx*.18)%48;mrect(x,165-cy*.15,30,75,'#202b47');mrect(x+3,154-cy*.15,24,12,'#2d3c59');}}

 g.save();g.translate(-cx,-cy);
 mansionHubDecor();if(M.room==='gallery')mansionGalleryDecor();if(M.room==='archive')mansionArchiveDecor();mansionNewWingDecor();if(M.room==='forbiddenArchive'||M.room==='seitenArena')mansionForbiddenDecor();if(M.room==='diceArena')mansionDiceDecor();
 if(M.room==='garden'){mrect(0,230,640,26,'#35435b');for(let x=0;x<640;x+=40){mrect(x,227,32,4,'#97a2b7');mrect(x+4,236,24,18,'#26334e');}for(const x of [204,624]){mrect(x,97,12,159,'#64718c');mrect(x-4,91,20,8,'#aab5c6');}if(M.sparState==='active'){mrect(210,112,2,144,'#c9a5fc');const e=M.enemies.find(e=>e.kind==='boss');if(e?.rainX!=null){mrect(e.rainX-28,252,56,3,'#ffc34e');for(let y=125;y<244;y+=12)mrect(e.rainX-1,y,2,5,'#d673ff');}}}

 for(const b of [...r.floor,...r.blocks])mansionTile(...b);mansionLiftDraw();mansionMechanismsDraw();
 if(r.extension)drawMansionDoor(r.extension[0],r.extension[1],64,!mansionDoorAvailable(r.extensionDoor));
 if(r.gate&&!M.flags.seal){const b=r.gate;mrect(...b,'#263556');for(let yy=38;yy<208;yy+=14){mrect(b[0]+5,yy,6,8,'#80e8ed');mrect(b[0],yy+2,16,2,'#b5e8d9');}}
 for(const d of r.doors){const locked=d.need&&!M.flags[d.need];if(drawMansionDoor(d.x,d.y,64,locked))continue;mrect(d.x-12,d.y-53,24,53,'#101424');mrect(d.x-14,d.y-55,28,3,locked?'#746375':'#a1b9c9');mrect(d.x-14,d.y-53,3,53,'#7c899f');mrect(d.x+11,d.y-53,3,53,'#596a84');mrect(d.x-8,d.y-47,16,44,locked?'#44344d':'#294663');mrect(d.x+5,d.y-24,3,3,locked?'#c68d90':'#ffe5a0');if(!locked){mrect(d.x-5,d.y-41,10,1,'#6faebc');mrect(d.x-5,d.y-36,10,1,'#496f91');}}
 mansionPortalDraw(M.room);
 if(r.cp){const [x,y]=r.cp;mansionTile(x-12,y-6,24,6);mansionDiamond(x,y-27+Math.sin(M.t*.05)*2,11,'#305876');mansionDiamond(x,y-27+Math.sin(M.t*.05)*2,7,'#95f3ff');mrect(x-1,y-34,2,8,'#efffff');}
 if(r.seal&&!M.flags.seal){const[x,y]=r.seal;g.strokeStyle='#dfc77d';g.lineWidth=2;g.beginPath();g.arc(x,y-8,13,0,7);g.stroke();mansionDiamond(x,y-8+Math.sin(M.t*.06)*2,9,'#97f4ff');}
 if(M.room==='bedroom'&&!drawMansionBed(34,208,90)){mrect(34,168,83,15,'#657f9f');mrect(36,165,79,6,'#d2dfe9');mrect(32,150,4,55,'#8b7281');mrect(115,174,4,31,'#8b7281');mrect(40,161,19,6,'#f4f1ee');mrect(65,168,47,13,'#8fa8ca');mrect(42,183,4,25,'#705b72');}
 mansionPropsDraw();
 for(const n of HUB_NPCS)if(n.room===M.room&&(!n.enabled||n.enabled()))n.draw(n.x,n.y,M.t,M.x<n.x?-1:1);
 if(M.room==='hall'){for(let y=208;y<360;y+=24){mansionDiamond(157,y,3,'#80e4ee');mansionDiamond(243,y,3,'#80e4ee');}}
 if(r.goal){const[x,y]=r.goal;mrect(x-17,y-75,34,75,'#0b142a');for(let z=-14;z<=14;z+=7)if(!M.flags.boss)mrect(x+z,y-72,3,72,'#c6b37c');mrect(x-19,y-77,38,4,'#f0dbaa');}
 for(const e of M.enemies){if(e.hp<=0)continue;if(e.kind==='seitenBoss'){mansionSeitenBossDraw(e);continue;}if(e.kind==='diceBoss'){mansionDiceDraw(e);continue;}if(e.kind==='boss'){const wind=M.sparState==='active'&&(e.pose===8||e.striking);g.globalAlpha=e.guard>0&&(e.guard&2)?0.6:1;drawMansionAstarte(e.x,e.y,M.t,e.dir,e.pose??-1);g.globalAlpha=1;if(M.sparState==='active'){mrect(e.x-26,e.y-64,52,4,'#182039');mrect(e.x-25,e.y-63,50*e.hp/e.maxHp,2,'#c7a2f6');if(e.striking){g.beginPath();g.arc(e.x+e.dir*24,e.y-20,30,e.dir>0?-1.3:1.8,e.dir>0?1.3:4.5);g.strokeStyle='#170b34';g.lineWidth=6;g.stroke();g.strokeStyle='#cf63ff';g.lineWidth=4;g.stroke();g.strokeStyle='#fff4ae';g.lineWidth=1;g.stroke();}else if(wind){mansionDiamond(e.x+e.dir*35,e.y-35,4,'#f4d6ff');}}continue;}const sz=24;g.drawImage(pick(e.kind==='fly'?SPR.flyer[(frame>>3)&1]:SPR.walker[(frame>>3)&1],e.dir,e.flash>0),Math.round(e.x-12),Math.round(e.y-24),sz,sz);}
 if(!M.dead||M.dead%8<4){if(!M.hurt||M.hurt%6<3){
 if(M.actor==='astarte'){g.save();if(M.slideT){g.translate(M.x,M.y);g.scale(1,.65);g.translate(-M.x,-M.y);}drawMansionAstartePlayer(M.x,M.y,M.t,M.poseT?M.scytheFace:M.face,(mansionGuarding()||M.guardFlash&&M.ground&&!M.poseT&&!M.castT)?16:M.castT?15:M.poseT?mansionScythePose():!M.ground?(M.vy<0?13:14):Math.abs(M.vx)>.1&&!M.hurt?4+Math.floor(M.walkDistance/8)%4:-1,ASTARTE_PLAYER_SIZE);g.restore();mansionScytheDraw();mansionGuardDraw();}else if(M.actor==='seiten'){mansionSeitenPlayerDraw();}else{
 const action=M.slideT?'slide':(!M.ground&&(M.wall||M.kickLock))?'wall':null;
 if(action&&mansionActionArt){const box=action==='slide'?[887,290,873,560]:[55,75,810,685],height=action==='slide'?24:42,width=box[2]/box[3]*height;const facing=action==='wall'?(M.wall?-M.wall:M.face):M.face;const flip=action==='wall'?facing===1:facing===-1;g.save();g.translate(Math.round(M.x),Math.round(M.y));if(flip)g.scale(-1,1);g.drawImage(mansionActionArt,...box,-width/2,-height,width,height);g.restore();}
 else if(M.ground&&Math.abs(M.vx)>.1&&!M.hurt)drawSequelWalk(M.walkDistance,M.x,M.y,M.face,false);
 else {const fi=M.poseT?6:!M.ground?(M.vy<0?4:5):(frame>>5)&1;drawSequelAt(fi,M.x,M.y,M.face,false,SEQUEL_MODEL.size);}
 }}}
 if(mansionIsUmine()&&M.wall&&!M.ground){mansionDiamond(M.x+M.wall*8,M.y-5,4,'#99faff');}

 mansionWaterPlatformDraw();
 for(const s of M.shots){if(s.kind==='song'){mansionSeitenBulletDraw(s);continue;}if(s.kind==='star'){mansionScytheStar(s.x-s.vx*2,s.y,4,'#826438');mansionScytheStar(s.x,s.y,6,'#271d39');mansionScytheStar(s.x,s.y,5,'#ffd05b');mansionScytheStar(s.x,s.y,2,'#fffdf2');continue;}mrect(s.x-4,s.y-2,8,4,'#5ec9f1');mrect(s.x-2,s.y-1,4,2,'#e2ffff');}
 for(const s of M.enemyShots){if(s.kind==='songWave'||s.kind==='songNote'){mansionSeitenBulletDraw(s);continue;}if(s.kind==='dice'||s.kind==='card'||s.kind==='chip'){mansionDiceBulletDraw(s);continue;}if(s.kind==='crescent'){g.beginPath();g.arc(s.x,s.y,5,-1.2,1.2);g.strokeStyle='#170b34';g.lineWidth=5;g.stroke();g.strokeStyle='#b54dff';g.lineWidth=3;g.stroke();g.strokeStyle='#fff4ae';g.lineWidth=1;g.stroke();}else{mansionDiamond(s.x,s.y,6,'#170b34');mansionDiamond(s.x,s.y,5,'#ffb52e');mansionDiamond(s.x,s.y,3,'#ffe55d');mansionDiamond(s.x,s.y,1,'#ffffff');}}
 for(const f of M.fx){if(f.kind==='scytheImpact'){mansionScytheImpactDraw(f);continue;}g.globalAlpha=Math.min(1,f.life/12);mrect(f.x,f.y,2,2,f.color);}g.globalAlpha=1;g.restore();
 g.restore();
 // Dark edge vignette uses stepped pixel bars; all solid surfaces keep bright top edges.
 mrect(0,0,VW,27,'rgba(5,10,24,.94)');rectLine(4,2,23,23,'#6688a2');drawText(M.actor==='seiten'?'SEITEN':M.actor==='astarte'?'ASTARTE':'UMINE',34,6,'c',1);for(let i=0;i<mansionMaxHP();i++)mrect(34+i*4,17,3,6,i<M.hp?'#8de5f9':'#303b54');
 drawText(M.flags.seal?'SEAL':'----',VW-8,17,M.flags.seal?'y':'b',1,'r');
 // Notices are outlined text below the HUD; no foot-level black strip.
}
const MANSION_MAP_NAMES={bedroom:'拠点',hubCellar:'拠点地下',gallery:'回廊',hall:'大広間',archive:'書庫',cellar:'地下',garden:'中庭',diceArena:'遊戯室',archiveInner:'封書',clockTower:'時計塔',moonReservoir:'貯水室',starPassage:'星灯り',forbiddenArchive:'禁書庫',seitenArena:'歌声の間'};
function mansionMapBounds(){const points=Object.values(MR).map(r=>r.map);return{minX:Math.min(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxX:Math.max(...points.map(p=>p[0])),maxY:Math.max(...points.map(p=>p[1]))};}
function mansionRoomDoors(r){return[...r.doors,...(r.extensionDoor&&MR[r.extensionDoor.to]?[r.extensionDoor]:[])];}
function mansionMapPosition(id,html=false){const b=mansionMapBounds(),p=MR[id].map;return html?[12+(p[0]-b.minX)*72,18+(p[1]-b.minY)*66]:[24+(p[0]-b.minX)*Math.min(44,186/Math.max(1,b.maxX-b.minX)),82+(p[1]-b.minY)*26];}
function mansionMapDraw(){mrect(10,40,236,157,'rgba(5,13,29,.97)');rectLine(10,40,236,157,'#86beca');
 for(const[id,r]of Object.entries(MR))for(const d of mansionRoomDoors(r)){if(!M.visited.includes(id)||!MR[d.to])continue;const a=mansionMapPosition(id),b=mansionMapPosition(d.to);g.strokeStyle=d.need&&!M.flags[d.need]?'#64536a':'#536f83';g.lineWidth=2;g.beginPath();g.moveTo(a[0]+18,a[1]+9);g.lineTo(b[0]+18,b[1]+9);g.stroke();}
 for(const[id,r]of Object.entries(MR)){const p=mansionMapPosition(id),seen=M.visited.includes(id);mrect(p[0],p[1],36,18,seen?'#335f76':'#18283f');rectLine(p[0],p[1],36,18,id===M.room?'#fff1aa':seen?'#92c9db':'#3e4b64');if(r.cp&&seen)mrect(p[0]+2,p[1]+2,2,2,'#95f3ff');if(M.portals.includes(id))mansionDiamond(p[0]+31,p[1]+4,2,'#c39afa');}
}

function renderMansion(){mansionRoomDraw();if(M.map&&M.menuTab==='map')mansionMapDraw();if(state==='mansionClear'){mrect(14,63,228,102,'rgba(6,14,30,.96)');rectLine(14,63,228,102,'#b9d8d2');}blit();
 if(M.actor==='seiten'&&mansionSeitenPortrait){sctx.save();sctx.imageSmoothingEnabled=true;const scale=hiS();sctx.drawImage(mansionSeitenPortrait,275,230,655,655,5*scale,3*scale,21*scale,21*scale);sctx.restore();}else if(M.actor==='astarte'&&mansionAstarteFace){sctx.save();sctx.imageSmoothingEnabled=true;const scale=hiS();sctx.drawImage(mansionAstarteFace,5*scale,3*scale,21*scale,21*scale);sctx.restore();}else drawOpeningPortrait({face:0},5,3,21);
 drawHiText(mansionLocationName(),165,5,6.5,'#d9edf5','#0c1528');
 if(M.map&&M.menuTab!=='map')return;
 if(M.map){drawHiText('屋敷の見取り図',128,64,9,'#d9f3fb','#0b1528');drawHiText('金色：現在地　 水色：記録の灯り',128,183,6,'#a6c8d8','#0b1528');for(const[id,r]of Object.entries(MR))if(M.visited.includes(id)){const p=mansionMapPosition(id);drawHiText(MANSION_MAP_NAMES[id]||r.name,p[0]+18,p[1]+6,4.5,'#d5e5ee','#0b1528');}return;}
 if(state==='mansionClear'){drawHiText('屋敷の外へ',128,77,12,'#e3f8fb','#0b1528');drawHiText('カナタちゃん、みんな……どこにいるの？',128,102,6.5,'#d3e8f5','#0b1528');drawHiText('探索テスト区間 踏破！',128,123,8,'#ffe6a3','#0b1528');drawHiText('タップで探索を続ける / Escでタイトル',128,147,6,'#a9c9db','#0b1528');return;}
 const catBoss=M.enemies.find(e=>e.kind==='seitenBoss');if(M.seitenState==='active'&&catBoss){sctx.save();const k=hiS();sctx.fillStyle='#271d34';sctx.fillRect(128*k,38*k,112*k,5*k);sctx.fillStyle=catBoss.hp<=catBoss.maxHp/2?'#ff799f':'#ffb1ca';sctx.fillRect(129*k,39*k,110*k*catBoss.hp/catBoss.maxHp,3*k);sctx.restore();drawHiText('青天 ／ SEITEN',184,29,6,'#ffbfd1','#191126');}
 if(M.prompt)drawHiText(M.prompt,128,33,6.5,'#fff2bd','#0b1528');
 if(M.messageT>0)drawHiText(M.message,128,M.seitenState==='active'?49:M.prompt?47:34,6,'#c0e9f6','#0b1528');

}
const mansionSlideBtn=document.getElementById('mSlide'),mansionMapBtn=document.getElementById('mMap'),mansionTitle=document.getElementById('mTitle');
mansionMapBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Snd.init();mansionInput.map=true;});
mansionSlideBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Snd.init();if(M.map)return;if(M.actor!=='astarte')mansionInput.slide=true;else{mansionInput.guardPointer=e.pointerId;mansionSlideBtn.setPointerCapture?.(e.pointerId);}});
const mansionGuardPointerUp=e=>{if(mansionInput.guardPointer===e.pointerId)mansionInput.guardPointer=null;};
for(const name of ['pointerup','pointercancel','lostpointercapture'])mansionSlideBtn.addEventListener(name,mansionGuardPointerUp);
window.addEventListener('pointerup',mansionGuardPointerUp);window.addEventListener('pointercancel',mansionGuardPointerUp);
window.addEventListener('blur',mansionGuardRelease);document.addEventListener('visibilitychange',()=>{if(document.hidden)mansionGuardRelease();});
window.addEventListener('keyup',e=>{mansionGuardKeys.delete(e.code);});
document.getElementById('mContinue').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Snd.init();mansionStart(true);});
document.getElementById('mNew').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();Snd.init();startOpening();});
window.addEventListener('keydown',e=>{if(state!=='mansion'&&state!=='mansionClear')return;if(['ShiftLeft','ShiftRight','KeyQ','Tab','KeyE','KeyC','KeyR'].includes(e.code)){e.preventDefault();if(e.repeat)return;if(e.code==='KeyR')mansionAbility();else if(e.code==='KeyC')mansionSwap();else if(e.code==='KeyQ'||e.code==='Tab')mansionInput.map=true;else if(e.code==='KeyE')mansionInput.use=true;else if(M.actor!=='astarte')mansionInput.slide=true;else if(!M.map)mansionGuardKeys.add(e.code);}});
function mansionMenuToggle(){mansionTalkClose();M.map=!M.map;releaseAll();mansionGuardRelease();mansionInput.slide=mansionInput.use=false;mansionUI();if(M.map)mansionStatusTab.focus?.();}
const mansionAreaContent=document.getElementById('mAreaContent'),mansionAreaTab=document.getElementById('mAreaTab');
const mansionMapContent=document.getElementById('mMapContent');
const mansionMenu=document.getElementById('mMenu'),mansionStatus=document.getElementById('mStatus'),mansionStatusTab=document.getElementById('mStatusTab'),mansionMapTab=document.getElementById('mMapTab');
for(const[button,tab]of [[mansionStatusTab,'status'],[mansionMapTab,'map'],[mansionAreaTab,'area']])button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();M.menuTab=tab;releaseAll();mansionGuardRelease();mansionUI();});
document.getElementById('mMenuClose').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mansionTalkClose();M.map=false;releaseAll();mansionGuardRelease();mansionUI();mansionMapBtn.focus?.();});
mansionMenu.addEventListener('pointerdown',e=>{e.stopPropagation();});
function mansionTalkClose(advance=false){if(!advance&&M.talk?.after==='seitenStart'){M.seitenState=M.flags.seitenDefeated?'done':'waiting';M.enemies=M.flags.seitenDefeated?[]:[mansionNewSeiten()];M.x=70;M.y=256;M.vx=M.vy=0;M.enemyShots=[];M.shots=[];M.poseT=M.castT=M.stepT=0;mansionCamera(true);}if(!advance&&M.diceReturn&&['diceStart','diceReturn'].includes(M.talk?.after)){mansionDiceReturn();return;}if(!advance&&M.sparReturn&&(M.talk?.after==='fullReturn'||M.talk?.after==='sparStart')){mansionFullReturn();return;}if(M.talk?.after==='sparStart'&&M.sparState==='ready')M.sparState='waiting';M.talk=null;if(M.menuTab==='talk')M.menuTab='status';}
function mansionRoruTalk(){
 const lines=M.flags.complete?['おやおや……お帰りなさい。\n探索は、お楽しみいただけましたか？','……その呼び方は、ここまでにして。\nお疲れ、海音。一服したら話を聞くよ。']:
 M.flags.seal?['おや。水脈の紋章をお持ちですねえ。\n地下の道も、通れるようになったでしょう。','書庫から客室への近道もありますよ。\nひと息ついてから、次へどうぞ……。']:
 ['おやおや……もうお出かけですか……？\n右の扉は拠点の地下室ですよ……。','紫に輝く扉から、繋がった場所へ戻れますよ。\n回廊の上段には、記録の灯りもございます。','……ふう。ここなら、一服できる。\n無理するなよ、海音。'];
 lines.push('おやおや……腕試しはいかがですか？\n遊戯室で、まずは軽く練習しましょう。\n本番のお相手は、この館の謎がもう少し解けてから……。');M.talk={speaker:'ダイスロール',lines,index:0,offerDice:true};M.map=true;M.menuTab='talk';releaseAll();mansionGuardRelease();mansionUI();document.getElementById('mTalkNext').focus?.();
}
function mansionTalkNext(){if(!M.talk)return;if(++M.talk.index>=M.talk.lines.length){const after=M.talk.after;mansionTalkClose(true);M.map=false;releaseAll();mansionGuardRelease();if(after==='seitenStart')mansionSeitenStart();else if(after==='sparStart')mansionSparStart();else if(after==='fullReturn')mansionFullReturn();else if(after==='diceStart')mansionDiceStart();else if(after==='diceReturn')mansionDiceReturn();}mansionUI();}
document.getElementById('mTalkBattle').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mansionFullBattle();});
document.getElementById('mBattleLeave').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(M.room==='seitenArena')mansionSeitenLeave();else if(M.diceReturn)mansionDiceReturn();else mansionFullReturn();});
document.getElementById('mTalkSeiten').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mansionSeitenChallenge();});
document.getElementById('mTalkDice').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mansionDiceChallenge();});
document.getElementById('mTalkNext').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mansionTalkNext();});
function mansionStatusHTML(){const memo=M.flags.seitenDefeated?'禁書庫の青天ちゃんと仲直りした。歌声の間で、また会って遊べるよ。':M.visited.includes('forbiddenArchive')?'禁書庫の奥から青天ちゃんの歌が聞こえる。':M.flags.starShortcut?'星灯りの渡り廊下から書庫への近道が開いた。紫の扉で拠点にも戻れるよ。':M.visited.includes('starPassage')?'星灯りの上階に、書庫への近道を開ける錠がある。':M.visited.includes('moonReservoir')?'貯水室の水は光ってから噴き出す。足場の上で様子を見よう。':M.visited.includes('clockTower')?'時計塔の昇降機は３層を繋ぐ。上階から貯水室へ進もう。':M.flags.archiveLatch?'封書の錠が開いた。回廊の右奥から時計塔へ進める。':M.visited.includes('archiveInner')?'封書の回廊の上階に錠がある。段差を登って調べてみよう。':M.flags.complete?'門の先へ出られた！ みんなを探す旅は、まだ続く。':M.flags.boss?'アスターテさんとの手合わせを終えた。奥の門を調べてみよう。':M.flags.seal?'水脈の紋章で地下の封印が解けた。客室への近道も使えるよ。':'館の出口を探そう。大広間の上階に、何かあるかも。';return `<div class="status-top"><div class="portrait ${M.actor==='seiten'?'seiten':M.actor==='astarte'?'astarte':''}" role="img" aria-label="${MANSION_ACTOR_NAMES[M.actor]||'海音'}"></div><div><h2>${MANSION_ACTOR_NAMES[M.actor]||'海音'}</h2><div>${M.actor==='seiten'?'歌と、誰かの隣が好きな猫の女の子':M.actor==='astarte'?'月と星を見守る、優しいお姉さん':'水魔法が得意な、旅好きの魔女'}</div><strong>HP ${M.hp} / ${mansionMaxHP()}</strong><div class="hp-track"><div class="hp-fill" style="width:${M.hp/mansionMaxHP()*100}%"></div></div></div></div><div class="status-row"><strong>バディ</strong><br>${mansionActors().length>1?mansionActors().slice(1).map(id=>MANSION_ACTOR_NAMES[id]).join('・')+'と一緒に探索中。交代ボタン／Cキーで順に交代。HPはみんなで共通。':'今は海音ひとり。'}<br>操作中：${MANSION_ACTOR_NAMES[M.actor]||'海音'}</div><div class="status-row"><strong>謎の右腕</strong>　正体不明<br>水弾を放てる。どうして付いているのかな……？</div><div class="status-row"><strong>使える能力</strong><br>${M.actor==='seiten'?'爪の２段攻撃（各２ダメージ）／歌声／バックステップ。少し速く走り、高く跳べる。':mansionIsUmine()?'水弾 ／ 魔法の壁キック ／ 壁滑り ／ スライディング':'鎌２段攻撃（各２ダメージ）／星弾／鎌ガード（長押しで正面のダメージ・吹き飛ばし軽減）。魔法の壁キック・壁滑り・スライドは海音専用。'}</div><div class="status-row"><strong>海音の習得能力</strong><br>${M.flags.seal?'水の足場：固有行動ボタン／Rキーで４秒間の足場。再使用５秒。':'水の足場：未習得（水脈の紋章で解放）'}</div><div class="status-row"><strong>恒久強化</strong><br>${mansionPermanentHTML()}</div><div class="status-row note"><strong>探索メモ</strong><br>${memo}</div>${M.room==='gallery'?`<div class="status-row"><strong>回廊の見渡し方</strong><br><button id="mGalleryView">${M.galleryWide===false?'通常表示 → 広く見渡す':'広く見渡す → 通常表示'}</button></div>`:''}<div class="status-row">現在地：${mansionLocationName()}<br>記録地点：${MR[M.checkpoint.room].name} ・ 訪問 ${M.visited.length} / ${Object.keys(MR).length} 部屋</div>`;}
function mansionMapHTML(){const bounds=mansionMapBounds(),width=84+(bounds.maxX-bounds.minX)*72,height=66+(bounds.maxY-bounds.minY)*66;let paths='',rooms='';const links=new Set();for(const[id,r]of Object.entries(MR)){if(!M.visited.includes(id))continue;const[x,y]=mansionMapPosition(id,true);for(const d of mansionRoomDoors(r)){if(!MR[d.to])continue;const key=[id,d.to].sort().join(':');if(links.has(key))continue;links.add(key);const[a,b]=mansionMapPosition(d.to,true);paths+=`<path d="M ${x+30} ${y+20} L ${a+30} ${b+20}" fill="none" stroke="${d.need&&!M.flags[d.need]?'#685269':'#6b8b9b'}" stroke-width="3"/>`;}}for(const[id,r]of Object.entries(MR)){const[x,y]=mansionMapPosition(id,true),seen=M.visited.includes(id);rooms+=`<rect x="${x}" y="${y}" width="60" height="40" rx="3" fill="${seen?'#264c63':'#182337'}" stroke="${id===M.room?'#ffe89e':'#667b92'}" stroke-width="${id===M.room?3:1}"/><text x="${x+30}" y="${y+25}" text-anchor="middle" fill="${id===M.room?'#fff0bb':'#d0e5ed'}" font-size="11">${seen?MANSION_MAP_NAMES[id]||r.name:'？'}</text>${M.portals.includes(id)?`<path d="M ${x+50} ${y+7} l 4 4 -4 4 -4 -4 Z" fill="#c39afa"/>`:''}${seen&&r.cp?`<circle cx="${x+7}" cy="${y+7}" r="3" fill="#95f3ff"/>`:''}`;}return `<h2>月影の館・見取り図</h2><div>現在地：${mansionLocationName()}</div><div class="map-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="館の部屋と通路">${paths}${rooms}</svg></div><div>金の枠：現在地 ／ 水色：記録 ／ 紫：ワープ</div><div>訪問 ${M.visited.length} / ${Object.keys(MR).length} 部屋<br>記録地点：${MR[M.checkpoint.room].name}</div><p>${M.flags.starShortcut?'星灯りから書庫へ戻る近道が開いている。':M.visited.includes('archiveInner')?'書庫の先に探索区画が続いている。時計塔から上へ進もう。':M.flags.seal?'水脈の封印は解除済み。客室と書庫の近道が使える。':'攻略区画の地下水路は封印中。拠点の地下室とは別の場所だよ。'}</p>`;}

let mansionControlsActive=false;
const mansionAbilityBtn=document.getElementById('mAbility');mansionAbilityBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();mansionAbility();});
const mansionSwapBtn=document.getElementById('mSwap');mansionSwapBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();mansionSwap();});
function mansionUI(){const active=state==='mansion'||state==='mansionClear',cat=M.actor==='seiten';mansionAbilityBtn.style.display=active&&!M.map?'flex':'none';mansionAbilityBtn.textContent=M.abilityCool?'待ち '+Math.ceil(M.abilityCool/60):cat?'歌声':mansionIsUmine()?(M.flags.seal?'水足場':'未習得'):'星弾';mansionAbilityBtn.setAttribute('aria-label',cat?'固有行動：歌声':mansionIsUmine()?'固有行動：水の足場':'固有行動：星弾');mansionSlideBtn.disabled=cat&&!!M.stepCool;mansionSlideBtn.textContent=cat?'STEP':mansionIsUmine()?'SLIDE':'GUARD';mansionSlideBtn.setAttribute('aria-label',cat?'バックステップ':mansionIsUmine()?'スライディング':'鎌でガード（長押し）');mansionSwapBtn.style.display=active&&mansionActors().length>1&&!M.map?'block':'none';mansionSwapBtn.disabled=!mansionCanSwap();const next=MANSION_ACTOR_NAMES[mansionNextActor()];mansionSwapBtn.setAttribute('aria-label',next+'に交代');mansionSwapBtn.textContent=next+'へ ↔';mansionSlideBtn.style.display=active?'flex':'none';mansionMapBtn.style.display=active?'block':'none';orbBtn.textContent=active?'調べる':'ORB';mansionTitle.style.display=state==='title'?'flex':'none';if(state==='title')document.getElementById('mContinue').style.display=mansionRead()?'block':'none';document.getElementById('modelPicker').style.display=active?'none':'flex';if(active!==mansionControlsActive){mansionControlsActive=active;doLayout();}const open=state==='mansion'&&M.map;const talking=open&&M.menuTab==='talk'&&!!M.talk;for(const b of [mansionStatusTab,mansionMapTab,mansionAreaTab])b.style.display=talking?'none':'';document.getElementById('mTalk').style.display=talking?'block':'none';document.getElementById('mTalkBattle').style.display=talking&&M.talk.offerFull&&M.room==='bedroom'?'block':'none';document.getElementById('mTalkDice').style.display=talking&&M.talk.offerDice&&M.room==='bedroom'?'block':'none';document.getElementById('mTalkSeiten').style.display=talking&&M.talk.offerSeiten&&M.room==='seitenArena'?'block':'none';document.getElementById('mBattleLeave').textContent=M.room==='seitenArena'?'戦闘をやめて禁書庫へ戻る':'手合わせをやめて拠点へ';document.getElementById('mBattleLeave').style.display=open&&(M.sparReturn||M.diceReturn||M.seitenState==='active'||M.seitenState==='ready')?'block':'none';if(talking){document.getElementById('mTalkName').textContent=M.talk.speaker||'ダイスロール';mansionTalkPortrait();document.getElementById('mTalkText').textContent=M.talk.lines[M.talk.index];document.getElementById('mTalkNext').textContent=M.talk.index===M.talk.lines.length-1?'話を終える':'次へ';}mansionMenu.style.display=open?'flex':'none';document.body.classList.toggle('mansion-menu-open',open);mansionMapContent.style.display=M.menuTab==='map'?'block':'none';mansionAreaContent.style.display=M.menuTab==='area'?'block':'none';mansionAreaTab.setAttribute('aria-selected',String(M.menuTab==='area'));if(open&&M.menuTab==='area'){const html=mansionWarpHTML();if(mansionAreaContent.innerHTML!==html){mansionAreaContent.innerHTML=html;for(const id of Object.keys(MANSION_PORTALS))document.getElementById('mWarp-'+id).addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mansionWarpTo(id);});}}if(open&&M.menuTab==='map'){const map=mansionMapHTML();if(mansionMapContent.innerHTML!==map)mansionMapContent.innerHTML=map;}mansionStatus.style.display=M.menuTab==='status'?'block':'none';mansionStatusTab.setAttribute('aria-selected',String(M.menuTab==='status'));mansionMapTab.setAttribute('aria-selected',String(M.menuTab==='map'));if(open&&M.menuTab==='status'){const html=mansionStatusHTML();if(mansionStatus.innerHTML!==html){mansionStatus.innerHTML=html;if(M.room==='gallery')document.getElementById('mGalleryView').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mansionGalleryViewToggle();});}} }
function mansionLayout(){const p=layout.portrait,top=layout.gameY+layout.gameH;place(mansionSlideBtn,p?layout.W/2-28:layout.W-70,p?top+77:layout.H*.42,56,56);place(mansionMapBtn,p?14:14,p?top+14:52,72,34);mansionTitle.style.top=(p?top+76:layout.gameY+layout.gameH*.64)+'px';mansionTitle.style.left=(layout.gameX+layout.gameW/2)+'px';const unit=Math.max(1,Math.min(2,layout.W/256));const margin=8;place(mansionMenu,margin,layout.gameY+8,layout.W-margin*2,Math.max(120,layout.H-layout.gameY-16));mansionMenu.style.setProperty?.('--mu',unit+'px');if(state==='mansion'||state==='mansionClear')mansionControlsLayout();}

const mansionControlRects={};
function mansionControlsLayout(){const {W,H,portrait,gameY,gameH}=layout;const rect=(id,x,y,w,h)=>{mansionControlRects[id]=[x,y,w,h];place(id==='slide'?mansionSlideBtn:id==='ability'?mansionAbilityBtn:id==='swap'?mansionSwapBtn:BTN[id],x,y,w,h);};if(portrait){const top=gameY+gameH,space=H-top;const margin=12,gap=8,size=Math.max(44,Math.min(74,(W-2*margin-3*gap)/4)),small=Math.max(44,Math.min(54,space*.19));const row=top+Math.max(70,Math.min(space-96,space*.54));rect('left',margin,row,size,size);rect('right',margin+size+gap,row,size,size);rect('shoot',W-margin-2*size-gap,row,size,size);rect('jump',W-margin-size,row,size,size);rect('slide',W-margin-small,row-small-12,small,small);rect('ability',margin,row-small-12,small,small);rect('swap',W/2-56,row-small-12,112,44);place(mansionMapBtn,margin,top+12,72,36);place(orbBtn,W/2-27,top+10,54,44);place(muteBtn,W-margin-100,top+12,100,32);}else{const size=Math.max(44,Math.min(68,H*.19)),margin=12,gap=8,row=H-size-24;rect('left',margin,row,size,size);rect('right',margin+size+gap,row,size,size);rect('shoot',W-margin-2*size-gap,row,size,size);rect('jump',W-margin-size,row,size,size);rect('slide',W-margin-48,row-58,48,48);rect('ability',margin,row-58,48,48);rect('swap',W/2-56,row,112,48);place(mansionMapBtn,12,52,72,36);} }
window.MANSION_TOUCH_ZONE=(x,y)=>{if(M.map)return null;for(const id of ['left','right','shoot','jump']){const r=mansionControlRects[id];if(r&&x>=r[0]-3&&x<=r[0]+r[2]+3&&y>=r[1]-3&&y<=r[1]+r[3]+3)return id;}return null;};
window.MANSION_LAYOUT=mansionLayout;mansionLayout();

// Optional friendly match: current hero and exploration checkpoint remain intact.
function mansionDiceChallenge(){
 if(M.room!=='bedroom'||!M.talk?.offerDice)return false;
 const origin={room:M.room,x:365,y:208};mansionTalkClose(true);M.map=false;mansionEnter('diceArena',160,256);M.diceReturn=origin;M.diceState='ready';M.enemies=[mansionNewDice()];M.hp=mansionMaxHP();M.dead=0;
 mansionTalkShow('ダイスロール',['おやおや……ようこそ、月影の遊戯室へ。\n今回は、身体の動きを確かめる練習です。\nそのお姿のままで、どうぞお相手ください。','さて、今宵の運命は、どちらに微笑むでしょう？\nふふ……その腕の秘密、少し気になりましてね。','……怪我する前に止めるから、気楽に。\nさあ、始めようか。'],'diceStart');return true;
}
function mansionNewDice(){return{kind:'diceBoss',x:350,y:256,hp:40,maxHp:40,roll:1,rainX:null,t:0,dir:-1,flash:0,anim:'idle',jumpFrom:0,jumpTo:0};}
function mansionDiceStart(){M.diceState='active';M.map=false;M.enemies=[mansionNewDice()];M.x=160;M.y=256;M.vx=M.vy=0;M.ground=true;M.hp=mansionMaxHP();M.hurt=60;M.dead=0;M.poseT=M.castT=M.stepT=M.cool=M.abilityCool=M.slideT=0;M.h=MC.h;M.waterPlatform=null;M.shots=[];M.enemyShots=[];mansionCamera(true);M.messageT=0;}
function mansionDiceReturn(){if(!M.diceReturn)return false;const origin=M.diceReturn;M.talk=null;M.map=false;M.menuTab='status';releaseAll();mansionEnter(origin.room,origin.x,origin.y);M.hp=mansionMaxHP();M.hurt=60;M.dead=0;mansionUI();return true;}
function mansionDiceRetry(){M.diceState='ready';M.enemyShots=[];M.shots=[];M.hp=mansionMaxHP();M.hurt=60;M.poseT=M.castT=M.stepT=0;mansionTalkShow('ダイスロール',['おっと……ここまで。少し休みましょう。\n紅茶でも飲みます？……ああ、私は一服で。','もう一度、いかがです？\nまだ夜は長いですからねえ。'],'diceStart');}
function mansionDiceWin(){M.diceState='done';M.enemies=[];M.shots=[];M.enemyShots=[];M.poseT=M.castT=M.stepT=0;M.hp=mansionMaxHP();mansionTalkShow('ダイスロール',['おやおや……見事に、出目を覆されましたねえ。','……いい動きだった。お疲れ！\nまた試したくなったら、いつでも声かけて。'],'diceReturn');}
function mansionDiceAI(e){
 if(M.diceState!=='active')return;
 const p=e.t%360,rage=e.hp<=e.maxHp/2;
 if(p<40){e.y=256;e.dir=M.x<e.x?-1:1;const d=Math.abs(M.x-e.x);if(d>85)e.x+=e.dir*(rage?1.55:1.25);else if(d<52)e.x-=e.dir*1.2;e.anim='walk';}
 else if(p<112){e.anim='windup';if(p===40){e.roll=0;e.rainX=null;e.dir=M.x<e.x?-1:1;}if(p===76){e.roll=1+Math.floor(Math.random()*6);sfx('start');}}
 else if(p<184){e.anim='throwDice';const count=e.roll>=3?3:e.roll===2?2:1,spacing=24;if(p>=112&&(p-112)%spacing===0&&(p-112)/spacing<count){M.enemyShots.push({kind:'dice',x:e.x+e.dir*25,y:e.y-22,vx:e.dir*(2.3+e.roll*.12+(rage?.25:0)),vy:-1.2,damage:e.roll>=5?3:2});sfx('shot');}}
 else if(p<225){if(p===184)e.dir=M.x<e.x?-1:1;e.anim='windup';}
 else if(p<270){e.anim='flickCards';const count=e.roll>=4?3:1;if((p-225)%18===0&&(p-225)/18<count){M.enemyShots.push({kind:'card',x:e.x+e.dir*25,y:233,vx:e.dir*(3.1+(rage?.3:0)),vy:0,damage:2});sfx('shot');}}
 else if(p<300){e.anim='windup';if(p===280){e.jumpFrom=e.x;e.jumpTo=Math.max(40,Math.min(472,M.x+(M.x<e.x?-65:65)));e.rainX=e.roll===6?Math.max(54,Math.min(458,M.x)):null;}}
 else if(p<340){if(p===300&&e.rainX!=null){for(const dx of [-56,-28,0,28,56])M.enemyShots.push({kind:'chip',x:e.rainX+dx,y:100,vx:0,vy:3.1,damage:3});}const k=(p-300)/40;e.x=e.jumpFrom+(e.jumpTo-e.jumpFrom)*k;e.y=256-Math.sin(k*Math.PI)*85;e.dir=M.x<e.x?-1:1;e.anim='walk';}
 else {e.y=256;e.anim='idle';}
 e.x=Math.max(32,Math.min(480,e.x));
}
// High contrast face and pips stay readable at the game's native resolution.
function mansionRollFace(x,y,n,rolling=false){
 mrect(x-12,y-12,24,24,'#1a1029');mrect(x-10,y-10,20,20,rolling?'#cab3ff':n>=5?'#ffe2a0':'#fff4de');rectLine(x-10,y-10,20,20,n>=5?'#ffad42':'#a97cbe');
 const dots={1:[[0,0]],2:[[-5,-5],[5,5]],3:[[-5,-5],[0,0],[5,5]],4:[[-5,-5],[5,-5],[-5,5],[5,5]],5:[[-5,-5],[5,-5],[0,0],[-5,5],[5,5]],6:[[-5,-5],[5,-5],[-5,0],[5,0],[-5,5],[5,5]]};for(const[dx,dy]of dots[n]||[])mrect(x+dx-1,y+dy-1,3,3,n>=5?'#8a2445':'#38213f');
}
function mansionDiceDecor(){
 for(let x=0;x<512;x+=64){mrect(x,28,64,225,'#2a1e35');rectLine(x+5,36,54,180,'#71516d');mrect(x+8,38,48,5,'#bd9262');mrect(x+10,44,10,166,'#5e2841');mrect(x+44,44,10,166,'#5e2841');mansionDiamond(x+32,115,13,'#aa8560');mansionDiamond(x+32,115,9,'#392941');}
 mrect(0,249,512,7,'#a68056');for(let x=0;x<512;x+=16)mrect(x,253,15,3,x%32?'#e3c991':'#53394e');
 for(const x of [80,256,432]){mrect(x-1,28,2,30,'#af8b60');mrect(x-18,58,36,3,'#d8b778');for(const dx of [-16,0,16]){mrect(x+dx-2,51,4,7,'#eee1b4');mansionDiamond(x+dx,48,3,'#ffeaaa');}}
}
function mansionDiceDraw(e){
 // Use the sequel's masked Roru in both the hub and arena, with grounded pose motion.
 const wind=e.anim==='windup',throwing=e.anim==='throwDice'||e.anim==='flickCards';
 const bob=e.anim==='walk'&&e.y===256?Math.sin(e.t*.5)*1.2:0;
 g.save();g.translate(e.x,e.y+bob);g.rotate((wind?-.055:throwing?.07:0)*e.dir);
 g.globalAlpha=e.flash>0&&(e.flash&2)?.55:1;drawRoru(0,0,e.t,e.dir);g.restore();
 if(M.diceState==='active'){mrect(e.x-28,e.y-76,56,5,'#160e27');mrect(e.x-27,e.y-75,54*e.hp/e.maxHp,3,'#ffcc6f');if(e.anim==='windup'){mansionDiamond(e.x+e.dir*28,e.y-42,6,'#27142a');mansionDiamond(e.x+e.dir*28,e.y-42,4,'#ffe495');}const p=e.t%360;if(p>=40&&p<340)mansionRollFace(e.x,e.y-94,p<76?1+Math.floor(e.t/4)%6:e.roll||1,p<76);if(p>=280&&p<340){mrect(e.jumpTo-16,252,32,3,'#ffcf74');if(e.rainX!=null&&p<300){for(const dx of [-56,-28,0,28,56]){mrect(e.rainX+dx-5,252,10,3,'#ffad42');mansionDiamond(e.rainX+dx,110,4,'#fff0bb');}}}}
}
function mansionDiceBulletDraw(b){const f=sheetFrame('dicerollBullets','idle',b.kind==='dice'?6+Math.floor(M.t/4)%4:b.kind==='chip'?13:12);mansionDiamond(b.x,b.y,8,'#20122d');if(f)g.drawImage(pick(f,b.vx>0?1:-1,false),Math.round(b.x-10),Math.round(b.y-10),20,20);else {mrect(b.x-5,b.y-5,10,10,'#fff1c4');mrect(b.x-1,b.y-1,2,2,'#7b2349');}}

// Optional EX encounter: affection turned to sulking, independent of the mansion's story flags.
function mansionNewSeiten(){return{kind:'seitenBoss',x:370,y:256,dir:-1,hp:64,maxHp:64,t:0,flash:0,guard:0,mode:'idle',modeT:0,turn:0,pose:-1,leaps:0,multi:false,targetX:null,walkDistance:0,trail:[]};}
function mansionSeitenIntro(){M.seitenState='ready';M.shots=[];M.enemyShots=[];M.messageT=0;mansionTalkShow('青天',['……隣にいてねって、言ったのに。\nどうして……一緒にいてくれなかったの？','ずっと待ってた。\n本を閉じても、歌をうたっても……\n海音ちゃん、戻ってこなかった。','だから、今度は私が追いかけるの。\n……もう少しだけ、こっちを見て。'],'seitenStart');}
function mansionSeitenStart(){if(M.actor==='seiten')M.actor='umine';M.stepT=0;mansionGuardRelease();releaseAll();M.map=false;M.seitenState='active';M.x=110;M.y=256;M.vx=M.vy=0;M.face=1;M.h=MC.h;M.ground=true;M.hp=mansionMaxHP();M.hurt=45;M.dead=0;M.poseT=M.castT=M.cool=M.slideT=M.abilityCool=0;M.waterPlatform=null;M.shots=[];M.enemyShots=[];M.enemies=[mansionNewSeiten()];M.messageT=0;mansionCamera(true);}
function mansionSeitenRetry(){M.seitenState='ready';M.hp=mansionMaxHP();M.hurt=60;M.poseT=M.castT=M.stepT=0;M.shots=[];M.enemyShots=[];M.vx=M.vy=0;M.messageT=0;mansionTalkShow('青天',['……痛かった？\nごめんね。こんなことが言いたかったんじゃ、ないの。','少しだけ、ここにいて。\n……まだ、寂しいままなんだ。'],'seitenStart');}
function mansionSeitenLeave(){M.map=false;M.talk=null;M.menuTab='status';releaseAll();mansionGuardRelease();mansionEnter('forbiddenArchive',956,368);M.hp=mansionMaxHP();M.hurt=60;mansionSay('禁書庫の入口側へ戻った。',100);mansionUI();}
// One amulet per friend; existing victory records restore their respective reward on load.
const SEITEN_AMULET_LINE='これ、持っていって。星詠みの護符。\n離れている間も、海音ちゃんを守ってくれるよ。';
function mansionSeitenAmulet(){if(M.flags.seitenReward)return false;M.flags.seitenReward=true;M.hp=mansionMaxHP();sfx('heal');return true;}
function mansionSeitenWin(){const gift=mansionSeitenAmulet();M.seitenState='done';M.flags.seitenDefeated=true;M.flags.seitenLeftArchive=true;M.enemies=[];M.enemyShots=[];M.shots=[];M.poseT=M.castT=M.stepT=0;M.waterPlatform=null;M.hp=mansionMaxHP();mansionBurst(370,226,'#ffb5c9',18);mansionSave();const lines=['……ほんとは、困らせたいんじゃなくて。\n隣にいてくれたら、それでよかったの。','ずっと一緒じゃ、いられないんだよね。\n海音ちゃんには、行きたいところがあるんだもん。'];if(gift)lines.push(SEITEN_AMULET_LINE);lines.push('……じゃあ、また帰ってきて。\nここ、空けておくから。\n今度はちゃんと、おかえりって言うね。','それと……海音ちゃんがよければ、\n私も一緒に行きたいな。\n今度は、隣を歩かせて。');mansionTalkShow('青天',lines);}
function mansionSeitenAfterTalk(){const gift=M.flags.seitenDefeated&&mansionSeitenAmulet(),lines=['海音ちゃん……おかえり。\n今日は、少しだけ隣にいてくれる？'];if(gift){lines.push('渡したかったもの、まだ持ってたの。\n……受け取ってくれる？',SEITEN_AMULET_LINE);mansionSave();}lines.push('お出かけなら、私も連れていって。\n海音ちゃんの隣なら、寂しくないから。','……また追いかけっこ、する？\n今度は、拗ねてるんじゃないよ。\n海音ちゃんと遊びたいだけ。');mansionTalkShow('青天',lines);M.talk.offerSeiten=true;mansionUI();}
function mansionSeitenChallenge(){if(M.room!=='seitenArena'||M.talk?.speaker!=='青天'||!M.talk.offerSeiten||!M.flags.seitenDefeated)return false;mansionTalkClose(true);M.seitenState='ready';M.enemies=[mansionNewSeiten()];M.messageT=0;mansionTalkShow('青天',['……ふふ。今日は、置いていかれなかった。\nじゃあ、いっぱい遊ぼうね。'],'seitenStart');return true;}
// Aim and facing lock at the start of each windup. Released attacks never follow the player.
function mansionSeitenMode(e,mode){e.mode=mode;e.modeT=0;if(mode==='crouch'||mode==='rushWind'){e.fromX=e.x;const max=mode==='rushWind'?(e.hp<=e.maxHp/2?260:220):(e.multi?270:220);e.targetX=Math.max(54,Math.min(458,Math.max(e.x-max,Math.min(e.x+max,M.x+M.vx*8))));e.dir=e.targetX<e.x?-1:1;}
 if(mode==='inhale'){e.dir=M.x<e.x?-1:1;e.singingRage=e.hp<=e.maxHp/2;e.targetX=null;}if(mode==='idle')e.targetX=null;
}
function mansionSeitenAI(e){if(M.seitenState!=='active')return;const rage=e.hp<=e.maxHp/2,t=++e.modeT;e.trail=e.trail.filter(p=>++p.age<14);
 if(e.mode==='idle'){e.y=256;e.dir=M.x<e.x?-1:1;e.pose=-1;if(Math.abs(M.x-e.x)>80){const old=e.x;e.x=Math.max(54,Math.min(458,e.x+e.dir*(rage?2:1.65)));e.walkDistance+=Math.abs(e.x-old);e.pose=Math.floor(e.walkDistance/5)%2;}if(t>=(rage?16:22)){e.turn++;const next=['crouch','inhale','rushWind','crouch'][((e.turn-1)%4)];e.multi=rage;e.leaps=rage?3:2;mansionSeitenMode(e,next);sfx('warn');}}
 else if(e.mode==='crouch'){e.pose=2;e.y=256;if(t>=(e.multi?20:26)){mansionSeitenMode(e,'leap');sfx('swoosh');}}
 else if(e.mode==='leap'){const duration=e.multi?30:36,k=Math.min(1,t/duration);e.x=e.fromX+(e.targetX-e.fromX)*k;e.y=256-Math.sin(k*Math.PI)*(e.multi?90:80);e.pose=k<.36?3:4;if(t%4===0)e.trail.push({x:e.x,y:e.y,pose:e.pose,dir:e.dir,age:0});if(k===1){e.y=256;mansionSeitenMode(e,'land');mansionBurst(e.x,253,'#f7adbb',8);sfx('land');}}
 else if(e.mode==='land'){e.pose=5;e.y=256;if(t>=(e.multi?12:16)){if(--e.leaps>0){mansionSeitenMode(e,'crouch');sfx('warn');}else mansionSeitenMode(e,'idle');}}
 else if(e.mode==='rushWind'){e.pose=2;e.y=256;if(t>=(rage?22:28)){mansionSeitenMode(e,'rush');sfx('swoosh');}}
 else if(e.mode==='rush'){e.y=256;const d=e.targetX-e.x,step=Math.min(Math.abs(d),rage?7:6);e.x+=Math.sign(d)*step;e.walkDistance+=step;e.pose=Math.floor(e.walkDistance/5)%2;if(t%3===0){e.trail.push({x:e.x,y:e.y,pose:e.pose,dir:e.dir,age:0});mansionBurst(e.x-e.dir*14,253,'#ffaac5',2);}if(Math.abs(e.targetX-e.x)<1)mansionSeitenMode(e,'clawWind');}
 else if(e.mode==='clawWind'){e.pose=2;e.y=256;if(t>=14){mansionSeitenMode(e,'claw');sfx('swoosh');}}
 else if(e.mode==='claw'){const k=Math.min(1,t/18);e.pose=t<5?3:t<13?4:5;e.y=256-Math.sin(k*Math.PI)*12;if(t===5)mansionBurst(e.x+e.dir*40,237,'#ff9dbc',8);if(t>=5&&t<=13&&mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.dir>0?e.x-6:e.x-56,230,62,26]))mansionDamage(3,e.dir);if(t>=18){e.y=256;mansionSeitenMode(e,'recover');}}
 else if(e.mode==='recover'){e.pose=5;e.y=256;if(t>=(rage?20:26))mansionSeitenMode(e,'idle');}
 else if(e.mode==='inhale'){e.pose=6;e.y=256;if(t>=(e.singingRage?28:35)){mansionSeitenMode(e,'sing');sfx('song');}}
 else if(e.mode==='sing'){e.pose=7;e.y=256;const waves=e.singingRage?3:2,delay=e.singingRage?20:12,spacing=e.singingRage?40:46;
  for(let i=0;i<waves;i++){const at=1+i*spacing;if(e.singingRage&&t===at){M.enemyShots.push({kind:'songNote',x:e.x+e.dir*24,y:214,baseY:214,vx:e.dir*3.4,vy:0,age:0,damage:2});sfx('tink');}if(t===at+delay){M.enemyShots.push({kind:'songWave',x:e.x+e.dir*24,y:246,vx:e.dir*(e.singingRage?3.35:3),vy:0,damage:2});mansionBurst(e.x+e.dir*24,244,'#ff93bd',4);sfx('song');}}
  if(t>(waves-1)*spacing+delay+30)mansionSeitenMode(e,'idle');
 }
 if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,[e.x-13,(e.mode==='claw'?256:e.y)-34,26,34]))mansionDamage(['leap','rush'].includes(e.mode)?3:2,M.x<e.x?-1:1);
}
function mansionSeitenShotBox(b){return b.kind==='songWave'?[b.x-6,b.y-9,12,18]:[b.x-4,b.y-4,8,8];}
function mansionSeitenBulletDraw(b){if(b.kind==='songWave'){g.save();g.translate(b.x,b.y);g.scale(Math.sign(b.vx)||1,1);g.beginPath();g.arc(-2,0,8,-1.25,1.25);g.strokeStyle='#25162f';g.lineWidth=7;g.stroke();g.strokeStyle='#ff639e';g.lineWidth=5;g.stroke();g.strokeStyle='#fff2d0';g.lineWidth=2;g.stroke();g.restore();}else{mansionDiamond(b.x,b.y,7,'#23182e');mrect(b.x-4,b.y,5,4,'#ffe28e');mrect(b.x,b.y-8,2,11,'#ffe28e');mrect(b.x+1,b.y-8,4,2,'#fff0b8');}}
let mansionSeitenCombatArt=null;
{const img=new Image();img.onload=()=>mansionSeitenCombatArt=img;img.src='assets/seiten-sequel-combat.png';}
const SEITEN_COMBAT_FRAMES=[{"name":"run1","rect":[12,60,450,400],"anchor":[308,388],"scale":0.125,"alphaBounds":[20,25,395,387]},{"name":"run2","rect":[460,60,450,400],"anchor":[287,388],"scale":0.125,"alphaBounds":[35,24,384,388]},{"name":"crouch","rect":[898,60,450,400],"anchor":[266,386],"scale":0.125,"alphaBounds":[17,115,414,386]},{"name":"rise","rect":[1324,60,450,400],"anchor":[292,388],"scale":0.125,"alphaBounds":[39,24,421,370]},{"name":"pounce","rect":[33,475,450,400],"anchor":[327,361],"scale":0.125,"alphaBounds":[1,68,449,315]},{"name":"land","rect":[500,475,450,400],"anchor":[290,361],"scale":0.125,"alphaBounds":[39,107,391,361]},{"name":"inhale","rect":[910,475,450,400],"anchor":[278,361],"scale":0.125,"alphaBounds":[68,12,370,361]},{"name":"sing","rect":[1324,475,450,400],"anchor":[291,361],"scale":0.125,"alphaBounds":[71,14,414,361]}];
function mansionSeitenPoseDraw(x,y,pose,dir,t){const f=SEITEN_COMBAT_FRAMES[pose];if(mansionSeitenCombatArt&&f){g.save();g.translate(Math.round(x),Math.round(y));g.scale(dir,1);g.drawImage(mansionSeitenCombatArt,...f.rect,-f.anchor[0]*f.scale,-f.anchor[1]*f.scale,f.rect[2]*f.scale,f.rect[3]*f.scale);g.restore();}else drawMansionSeiten(x,y,t,dir);}
function mansionSeitenBossDraw(e){for(const p of e.trail||[]){g.globalAlpha=(1-p.age/14)*.22;mansionSeitenPoseDraw(p.x,p.y,p.pose,p.dir,e.t);}g.globalAlpha=e.flash>0&&(e.flash&2)?.55:1;mansionSeitenPoseDraw(e.x,e.y,e.pose,e.dir,e.t);g.globalAlpha=1;
 if(M.seitenState!=='active')return;if(e.mode==='crouch'){mrect(e.targetX-16,252,32,3,'#f4c978');mansionDiamond(e.targetX,239,4,'#fff1b5');mansionDiamond(e.x+e.dir*17,e.y-31,4,'#ffa0bd');}if(e.mode==='inhale'){for(let i=0;i<3;i++)mansionDiamond(e.x+e.dir*(20+i*5),e.y-24-i*7,2,'#ffd4e0');}
 if(e.mode==='rushWind'){mrect(Math.min(e.x,e.targetX),253,Math.abs(e.targetX-e.x),2,'#aa6483');mansionDiamond(e.x+e.dir*18,e.y-24,5,'#fff1b5');mrect(e.targetX-5,251,10,4,'#ff9bc6');}
 if(e.mode==='clawWind'){for(let i=0;i<3;i++)mansionDiamond(e.x+e.dir*(23+i*6),e.y-25+i*6,2,'#fff1b5');}
 if(e.mode==='claw'&&e.modeT>=5&&e.modeT<=13){g.save();g.translate(e.x,e.y);g.scale(e.dir,1);const k=(e.modeT-5)/8;for(let i=0;i<3;i++){g.beginPath();g.moveTo(14,-36+i*6);g.quadraticCurveTo(35+10*k,-23+i*4,56,-12+i*5);g.strokeStyle='#27152d';g.lineWidth=5;g.stroke();g.strokeStyle='#ff609d';g.lineWidth=3;g.stroke();g.strokeStyle='#fff2c6';g.lineWidth=1;g.stroke();}g.restore();}
}
function mansionForbiddenDecor(){const r=MR[M.room],arena=M.room==='seitenArena';mrect(0,0,r.w,r.h,'#201b31');for(let x=64;x<r.w;x+=128){mrect(x-40,48,80,206,'#171525');rectLine(x-42,46,84,210,'#8d738b');mrect(x-44,41,88,6,'#b6987b');for(let row=0;row<6;row++){for(let i=0;i<10;i++){const xx=x-35+i*7,yy=57+row*31;mrect(xx,yy,5,23,['#69596f','#7c4657','#516373','#8e785a'][(i+row)%4]);mrect(xx+1,yy+5,3,1,'#c9b193');}mrect(x-36,82+row*31,72,3,'#a28970');}if(!arena){mrect(x-30,72,60,3,'#a68572');mrect(x-3,48,6,198,'#977887');mansionDiamond(x,148,6,'#f1c98b');}}
 if(arena){mrect(52,249,408,7,'#783852');mrect(56,250,400,2,'#d6ae85');for(const x of [28,484]){mrect(x,38,5,213,'#71576e');mrect(x-6,32,17,6,'#c5a18b');}if(M.seitenState==='active')for(const x of [36,472])for(let y=48;y<256;y+=18)mansionDiamond(x,y,5,'#e891b8');mansionPropDraw('picture',256,106,50);}else{mrect(0,358,r.w,6,'#7e6578');for(const x of [88,592,832]){mansionPropDraw('table',x,368,32);mansionPropDraw('books',x,336,10);}for(const[x,y,w]of r.blocks){mrect(x,y-18,w,2,'#a9957f');for(let xx=x+3;xx<x+w;xx+=16)mrect(xx,y-16,2,16,'#655c77');}}
}

function mansionSeitenClaw(stage=1){M.clawStage=stage;M.clawFace=M.face;M.clawHit=false;M.clawQueued=false;M.poseT=28;M.cool=32;sfx('swoosh');}
function mansionSeitenClawHit(){if(M.clawHit)return;M.clawHit=true;const reach=M.clawStage===2?42:35,box=[M.clawFace>0?M.x-4:M.x-reach,M.y-32,reach+4,32];
 for(const e of M.enemies){if(e.hp<=0||e.kind==='boss'||(e.kind==='seitenBoss'&&(M.seitenState!=='active'||e.guard>0))||(e.kind==='diceBoss'&&M.diceState!=='active'))continue;if(!mansionOverlap(e.x-13,e.y-34,26,34,box))continue;e.hp=Math.max(0,e.hp-2);e.flash=8;if(e.kind==='seitenBoss')e.guard=18;mansionBurst(e.x,e.y-18,'#ffb4cf',6);sfx('hit');if(e.hp===0){if(e.kind==='diceBoss'){mansionDiceWin();return;}if(e.kind==='seitenBoss'){mansionSeitenWin();return;}if(M.hp<mansionMaxHP())M.hp++;}}
 for(const p of M.props){if(p.hp>0&&mansionOverlap(p.x-11,p.y-(p.kind==='candle'?36:22),22,p.kind==='candle'?36:22,box))mansionPropsHit({x:p.x,y:p.y-12});}
}
function mansionSeitenPlayerUpdate(){if(M.stepT)return;if(M.castT===18){M.shots.push({kind:'song',x:M.x+M.songFace*17,y:M.y-20,vx:M.songFace*3.8,damage:2});mansionBurst(M.x+M.songFace*17,M.y-20,'#ffe2a0',5);sfx('song');}
 if(M.poseT){if(M.clawStage===1&&(inp.shootPressed||(inp.shoot&&M.poseT<=14)))M.clawQueued=true;if(M.poseT===18)mansionSeitenClawHit();if(M.map)return;if(M.poseT===4&&M.clawStage===1&&M.clawQueued)mansionSeitenClaw(2);}
 if(inp.shoot&&!M.cool&&!M.poseT&&!M.castT)mansionSeitenClaw();
}
function mansionSeitenPlayerDraw(){const face=M.castT?M.songFace:M.poseT?M.clawFace:M.face,pose=M.stepT?2:M.castT?(M.castT>18?6:7):M.poseT?(M.poseT>23?2:M.poseT>18?3:M.poseT>9?4:5):!M.ground?(M.vy<0?3:4):Math.abs(M.vx)>.1&&!M.hurt?Math.floor(M.walkDistance/7)%2:-1;
 if(pose<0)drawMansionSeiten(M.x,M.y,M.t,face);else mansionSeitenPoseDraw(M.x,M.y,pose,face,M.t);
 if(M.poseT<=18&&M.poseT>=10){g.save();g.translate(M.x,M.y);g.scale(face,1);const k=(18-M.poseT)/8,reach=M.clawStage===2?42:35;for(let i=0;i<3;i++){g.beginPath();g.moveTo(11,-30+i*6);g.quadraticCurveTo(reach-10,-28+i*5,reach,-22+i*5+k*7);g.strokeStyle='#26132e';g.lineWidth=5;g.stroke();g.strokeStyle='#ff679e';g.lineWidth=3;g.stroke();g.strokeStyle='#fff2cc';g.lineWidth=1;g.stroke();}g.restore();}
}
