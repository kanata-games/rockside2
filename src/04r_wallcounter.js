// =====================================================================
//  test.57: wall counters (X-style). One-screen arenas made wall-cling/wall-kick a near-universal dodge.
//  Wall kicks stay; instead every boss owns ONE in-character move that threatens the wall Umine is on.
//  Fair: ≥40f telegraph on the wall strip (WC_STRIP px), leaving the strip (or dropping to the floor for waves) is always safe.
//  Used on a slow timer in every fight, and much sooner when Umine keeps clinging (M.wc.cling).
//  アスターテ is gentle: her counter is a harmless gust that only pushes Umine off the wall.
// =====================================================================
const WC_STRIP=30,WC_TELE=44,WC_SLOW=600;
const WC_STYLE={
 tobiume:{type:'rise',name:'壁走り羽',col:'#ff9a4a'}, neenia:{type:'col',name:'壁縫いの矢',col:'#7ad06a'},
 lily:{type:'wave',name:'壁鳴りソング',col:'#ff7ac8'}, disaster:{type:'col',name:'錬成の柱',col:'#c08aff'},
 vesper:{type:'rise',name:'黄昏の壁走り',col:'#ffb04a'}, lavis:{type:'col',name:'壁縫いスナイプ',col:'#5ad0a0'},
 nocturne:{type:'wave',name:'夜想の音壁',col:'#e070ff'}, eclipse:{type:'rise',name:'蝕の昇り斬り',col:'#9a6aff'},
 hoshi:{type:'wave',name:'星屑の壁',col:'#8ab0ff'}, seiten:{type:'rise',name:'青天クロー・ウォールラン',col:'#6ad8ff'},
 dice:{type:'col',name:'カードウォール',col:'#ffd04a'}, diceGirl:{type:'wave',name:'紫煙の壁',col:'#c8b8d8'},
 astarte:{type:'push',name:'そよ風',col:'#c8ffe0'}};
function wcBossId(e){if(e.kind==='boss')return 'astarte';if(e.kind==='hoshiBoss')return 'hoshi';if(e.kind==='seitenBoss')return 'seiten';if(e.kind==='diceBoss')return e.girl?'diceGirl':'dice';return e.id;}
function wcFloor(e){return (e.kind==='seitenBoss'||e.kind==='diceBoss'||e.kind==='boss')?SQF:KF;}
function wcOnWall(){return !M.ground&&(M.wall||M.x<=KEIKO_L+3||M.x>=KEIKO_R-3);}
function wcReset(){M.wc={cling:0,cool:240,slow:0,haz:[],hits:0,used:0};}
function wcStart(e,force){const id=wcBossId(e),S=WC_STYLE[id];if(!S)return null;const fl=wcFloor(e),side=M.x<(KEIKO_L+KEIKO_R)/2?-1:1;
 const h={id,type:S.type,name:S.name,col:S.col,side,t:0,floor:fl,top:fl-204,wx:side<0?KEIKO_L:KEIKO_R,hit:false,y:fl,x:side<0?KEIKO_L:KEIKO_R};
 if(S.type==='wave'){h.gap0=fl-34;}// gap: floor height, 34px — standing / sliding Umine fits, a wall-clinger does not
 M.wc.haz.push(h);M.wc.used++;sfx('warn');return h;}
function wcStrip(h){return h.side<0?M.x<=KEIKO_L+WC_STRIP:M.x>=KEIKO_R-WC_STRIP;}
function wcHurt(h,n){if(h.hit)return;h.hit=true;M.wc.hits++;mansionDamage(n,-h.side);M.vx=-h.side*2.2;}
function wcTick(){const e=typeof mansionBossFocus==='function'?mansionBossFocus():null;
 if(!e||M.talk||M.dead){if(M.wc&&(M.wc.haz.length||!e))M.wc.haz=[];if(!e)M.wc=null;return;}
 if(!M.wc)wcReset();const W=M.wc;
 if(wcOnWall())W.cling=Math.min(240,W.cling+1);else W.cling=Math.max(0,W.cling-.34);
 if(W.cool>0)W.cool--;
 W.slow=(W.slow||0)+1;const ready=W.cool<=0&&!W.haz.length&&!KJ.cut;
 if(ready&&(W.cling>=36||W.slow>=WC_SLOW)){const clung=W.cling>=36;if(wcStart(e)){W.cool=clung?170:120;W.slow=0;W.cling*=.4;}}
 for(const h of W.haz){h.t++;const a=h.t-WC_TELE,top=h.top;
  if(h.type==='col'){if(a>=0&&a<18&&wcStrip(h))wcHurt(h,2);if(a===0)juiceShake(2,8);h.done=a>=24;}
  else if(h.type==='rise'){h.y=h.floor-Math.max(0,a)*7;if(a>=0&&h.y>top-20&&wcStrip(h)&&M.y>h.y-18&&M.y-M.h<h.y+18)wcHurt(h,2);h.done=h.y<top-24;}
  else if(h.type==='wave'){if(a>=0){h.x=h.wx-h.side*a*3.2;const inX=Math.abs(M.x-h.x)<10,inY=M.y-M.h<h.gap0+2;if(inX&&inY)wcHurt(h,2);}h.done=a>=0&&(h.x<KEIKO_L-12||h.x>KEIKO_R+12);}
  else if(h.type==='push'){if(a>=0&&a<20&&wcStrip(h)&&!M.ground){M.x-=h.side*2.4;if(M.vy<0)M.vy*=.6;}h.done=a>=24;}}
 W.haz=W.haz.filter(h=>!h.done);}
function wcDraw(){if(!M.wc||!M.wc.haz.length)return;const ox=M.camX||0,oy=M.camY||0;g.save();g.setTransform(1,0,0,1,0,0);
 for(const h of M.wc.haz){const a=h.t-WC_TELE,blink=(h.t&4)?'#ffffff':h.col,x0=(h.side<0?KEIKO_L-MC.w/2-2:KEIKO_R-WC_STRIP+MC.w/2-4)-ox,w=WC_STRIP+6,top=h.top-oy,fl=h.floor-oy;
  g.fillStyle=h.col;
  if(a<0){g.globalAlpha=.16+.12*((h.t>>2)&1);
   if(h.type==='wave'){g.fillRect(h.wx-ox-6,top,12,h.gap0-h.top);g.globalAlpha=.9;g.fillStyle=blink;g.fillRect(h.wx-ox-8,h.gap0-oy,16,2);}
   else{g.fillRect(x0,top,w,fl-top);g.globalAlpha=.9;g.fillStyle=blink;g.fillRect(x0,fl-3,w,3);g.fillRect(x0,top,w,2);}
   g.globalAlpha=1;g.font='bold 9px sans-serif';g.fillStyle=blink;g.textAlign='center';g.fillText('！ '+h.name,Math.max(40,Math.min(VW-40,x0+w/2+(h.side<0?24:-24))),top+46);}
  else if(h.type==='col'){g.globalAlpha=Math.max(0,1-a/24);g.fillRect(x0,top,w,fl-top);g.fillStyle='#ffffff';g.fillRect(x0+w/2-3,top,6,fl-top);}
  else if(h.type==='rise'){g.globalAlpha=.9;g.fillRect(x0,h.y-oy-18,w,36);g.fillStyle='#ffffff';g.fillRect(x0+4,h.y-oy-4,w-8,8);g.globalAlpha=.35;g.fillStyle=h.col;g.fillRect(x0,h.y-oy,w,fl-h.y);}
  else if(h.type==='wave'){g.globalAlpha=.85;g.fillRect(h.x-ox-7,top,14,h.gap0-h.top);g.fillStyle='#ffffff';g.fillRect(h.x-ox-2,top,4,h.gap0-h.top);}
  else if(h.type==='push'){g.globalAlpha=.4*Math.max(0,1-a/24);for(let i=0;i<6;i++)g.fillRect(x0+((a*5+i*13)%w),top+20+i*28,10,2);}
  g.globalAlpha=1;}
 g.restore();}
