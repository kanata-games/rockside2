
// =====================================================================
//  影の四騎 (test.47): ヴェスパー / ラヴィス / ノクターン / エクリプス — original dark bosses
//  built on the 04m keiko engine (shade:true → no fake/cage). Beating all four unlocks
//  the ダーク海音ちゃん style: a saved toggle in the status panel.
//  Dark twist: shadow shots pierce (each enemy hit once per shot) and fly faster,
//  but the fire cooldown is longer (14f vs 10f). Visual: assets/umine_dark_style-sequel*.png
//  (same layout as Umine's sheets) → fallback hue-shifted Umine.
// =====================================================================
const SHADE_IDS=Object.keys(KEIKO_BOSSES).filter(id=>KEIKO_BOSSES[id].shade);
function mansionShadeCount(){return SHADE_IDS.filter(id=>M.flags[KEIKO_BOSSES[id].flag]).length;}
function mansionShadeWin(k,B){k.state='done';M.messageT=0;M.enemyShots=[];M.shots=[];const e=mansionKeikoBoss();if(e){mansionBurst(e.x,e.y-24,B.col,24);e.marks=[];e.lift=0;}M.hp=mansionMaxHP();
 const first=!M.flags[B.flag];M.flags[B.flag]=true;if(first)mansionShardGain(3,true);
 const unlock=first&&mansionShadeCount()===SHADE_IDS.length&&!M.flags.darkStyleUnlocked;if(unlock)M.flags.darkStyleUnlocked=true;mansionSave();sfx('heal');
 mansionTalkShow(B.name,first?B.post:['……また、影に還るだけ。'],unlock?()=>mansionTalkShow('海音',['……四つの影が、わたしの中に溶けていく……！','（スタイル「ダーク海音ちゃん」が解放された！ ステータス画面でいつでも切り替えられる）'],()=>{mansionDarkSet(true);}):null);}
function mansionDarkOn(){return !!(M.flags&&M.flags.darkStyleUnlocked&&M.flags.darkStyle);}
function mansionDarkSet(on){if(!M.flags.darkStyleUnlocked)return false;M.flags.darkStyle=!!on;mansionBurst(M.x,M.y-20,on?'#b070ff':'#7fd8ff',18);sfx('heal');mansionSave();if(typeof mansionSay==='function')mansionSay(on?'ダーク海音ちゃんに変身！ 影の弾は敵を貫くよ。':'いつもの海音に戻ったよ。');return true;}
function mansionDarkToggle(){return mansionDarkSet(!mansionDarkOn());}
// dark sheets: same cut layout as Umine's, loaded through the parametric 02c loaders
const DARK_MODEL={frames:[],walkFrames:[]};let mansionDarkActionArt=null;
if(typeof Image==='function'){loadSequelModel('assets/umine_dark_style-sequel.png',DARK_MODEL);loadSequelWalk('assets/umine_dark_style-sequel_walk.png',DARK_MODEL);const a=new Image();a.onload=()=>{mansionDarkActionArt=a;};a.src='assets/umine_dark_style-sequel_mansion_actions.png';}
function mansionDarkSwap(begin,saved){
 if(begin){if(!mansionDarkOn())return null;const sv={f:SEQUEL_MODEL.frames,w:SEQUEL_MODEL.walkFrames,filter:false};
  g.save();g.globalAlpha=.22+.08*Math.sin(M.t*.15);g.fillStyle='#8a40ff';g.beginPath();g.ellipse(M.x,M.y-18,15,24,0,0,Math.PI*2);g.fill();g.restore();
  if(DARK_MODEL.frames.length){SEQUEL_MODEL.frames=DARK_MODEL.frames;if(DARK_MODEL.walkFrames.length)SEQUEL_MODEL.walkFrames=DARK_MODEL.walkFrames;}
  else if('filter' in g){g.save();g.filter='hue-rotate(230deg) saturate(1.4) brightness(.72)';sv.filter=true;}
  return sv;}
 if(!saved)return;SEQUEL_MODEL.frames=saved.f;SEQUEL_MODEL.walkFrames=saved.w;if(saved.filter)g.restore();}
let mansionDarkFace=null;if(typeof Image==='function'){const f=new Image();f.onload=()=>{mansionDarkFace=f;};f.src='assets/umine_dark_face.png';}
function mansionUminePortrait(p,c){if(M.talk?.speaker!=='海音')return false;c.setAttribute('aria-label','海音');p.fillStyle='#1a1030';p.fillRect(0,0,96,96);if(mansionDarkFace){p.imageSmoothingEnabled=true;p.drawImage(mansionDarkFace,0,0,mansionDarkFace.width,mansionDarkFace.height,0,0,96,96);}else{p.fillStyle='#4a6ad8';p.fillRect(18,12,60,46);p.fillStyle='#f4dcd0';p.fillRect(28,28,40,34);}return true;}
