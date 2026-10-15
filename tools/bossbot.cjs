// Predictive dodge bot for boss tests (test.49). Runs inside the game vm: returns JS source for a per-frame step.
// It looks at bullets, beams and the on-screen telegraphs (lines / columns / rings / marks / safe zones), simulates
// 9 simple manoeuvres 48 frames ahead and picks the one that collides least, then faces the boss and shoots.
module.exports=`(()=>{const e=M.enemies.find(e=>e.kind==='keikoBoss'||e.kind==='hoshiBoss');if(!e)return 'gone';releaseAll();
 const F=224,L=KEIKO_L,R=KEIKO_R,H=48;const bul=M.enemyShots.filter(b=>!b.dead).map(b=>({x:b.x,y:b.y,vx:b.vx||0,vy:b.vy||0,g:b.g||0,r:Math.max(3,b.r||3)+1}));
 const haz=[];// {x0,x1,y0,y1,f0,f1}
 for(const bm of e.beams||[])haz.push({x0:bm.x0,x1:bm.x1,y0:bm.y,y1:bm.y+bm.h,f0:0,f1:10});
 for(const f of e.fx||[]){const lock=f.col==='#ffffff';
  if(f.type==='line'){const low=f.y>=F-12;haz.push({x0:Math.min(f.x0,f.x1),x1:Math.max(f.x0,f.x1),y0:low?F-14:F-28,y1:low?F:F-17,f0:lock?6:14,f1:lock?26:40});}
  else if(f.type==='col')haz.push({x0:f.x-f.w/2-4,x1:f.x+f.w/2+4,y0:0,y1:F,f0:4,f1:70});
  else if(f.type==='ring')haz.push({x0:f.x-34,x1:f.x+34,y0:0,y1:F,f0:4,f1:60});
  else if(f.type==='mark')haz.push({x0:f.x-f.w/2-6,x1:f.x+f.w/2+6,y0:F-10,y1:F,f0:4,f1:70});}
 for(const mk of e.marks||[])haz.push({x0:mk.x-mk.w/2-6,x1:mk.x+mk.w/2+6,y0:F-8,y1:F,f0:mk.t>=mk.arm?0:Math.max(0,mk.arm-mk.t-4),f1:200});
 for(const h of (M.wc&&M.wc.haz)||[]){const a=h.t-44,f0=Math.max(0,-a-3),sx0=h.side<0?KEIKO_L-20:KEIKO_R-34,sx1=h.side<0?KEIKO_L+34:KEIKO_R+20;
  if(h.type==='col')haz.push({x0:sx0,x1:sx1,y0:0,y1:F+40,f0,f1:f0+26});
  else if(h.type==='rise')haz.push({x0:sx0,x1:sx1,y0:0,y1:F+40,f0,f1:f0+40});
  else if(h.type==='wave'){const x=a<0?h.wx:h.x;haz.push({x0:Math.min(x,x-h.side*60)-10,x1:Math.max(x,x-h.side*60)+10,y0:0,y1:h.gap0+2,f0,f1:f0+30});}}
 const safes=(e.fx||[]).filter(f=>f.type==='safe');const gaps=e.mode==='rain'?((e.nextGaps&&e.nextGaps.length?e.nextGaps:e.gaps)||[]):[];
 if(e.mode==='rain')for(let x=L;x<R;x+=8)if(gaps.length&&!gaps.some(([a,b])=>x>a+6&&x<b-6))haz.push({x0:x,x1:x+8,y0:0,y1:F,f0:20,f1:200});
 for(const s of safes)for(let x=L;x<R;x+=8)if(x+8<s.x-s.w/2+4||x>s.x+s.w/2-4)haz.push({x0:x,x1:x+8,y0:0,y1:F,f0:8,f1:60});
 const dashTele=(e.mode==='swoop'||e.mode==='spear')&&e.mt<=(e.hp<=e.maxHp/2?30:40);
 const ex=e.x,ey=e.y-(e.lift||0),air=M.ground?0:1;
 const moves=[];for(const dx of[0,-1,1])for(const act of['none','jump','slide'])moves.push([dx,act]);
 let best=null,bs=1e9;
 for(const [dx,act] of moves){if(act==='slide'&&(!M.ground||M.slideT))continue;if(act==='jump'&&!M.ground)continue;
  let x=M.x,y=M.y,vy=M.ground?0:M.vy,sl=M.slideT?M.slideT:0,score=0,face=dx||M.face;
  if(act==='jump')vy=-5.8;if(act==='slide')sl=24+6*mansionUpg('slide');
  for(let t=1;t<=H;t++){const vx=sl>0?face*4.1:dx*1.8;x=Math.max(L,Math.min(R,x+vx));if(sl>0)sl--;
   if(y<F||vy<0){vy=Math.min(6.5,vy+.28);y=Math.min(F,y+vy);if(y>=F)vy=0;}
   const h=sl>0?14:26,px0=x-7,px1=x+7,py0=y-h,py1=y;const w=1/(1+t*.04);
   for(const b of bul){const bx=b.x+b.vx*t,by=b.y+b.vy*t+b.g*t*(t+1)/2;if(bx+b.r>px0&&bx-b.r<px1&&by+b.r>py0&&by-b.r<py1){score+=10*w;}}
   for(const z of haz)if(t>=z.f0&&t<=z.f1&&z.x1>px0&&z.x0<px1&&z.y1>py0&&z.y0<py1)score+=6*w;
   if(t<26&&Math.abs(x-ex)<20&&py0<ey+2&&py1>ey-40)score+=8*w;
   if(dashTele&&t>8&&t<40){const hy=e.mode==='swoop'?[F-46,F-20]:[F-34,F-7];const ahead=(x-ex)*e.face>-10;if(ahead&&py0<hy[1]&&py1>hy[0])score+=5*w;}}
  const d=Math.abs(x-ex);score+=d<60?(60-d)*.05:d>200?.4:0;if(act!=='none')score+=.15;if(dx!==0)score+=.05;
  if(score<bs){bs=score;best=[dx,act];}}
 const [dx,act]=best;if(dx>0)keys.right=true;else if(dx<0)keys.left=true;
 if(act==='jump'){keys.jump=true;inp.jumpPressed=true;}else if(act==='slide'){mansionInput.slide=true;M.face=dx||(Math.sign(M.x>256?-1:1));}
 if(!M.ground&&M.vy<0)keys.jump=true;
 if(!dx&&!M.slideT)M.face=Math.sign(ex-M.x)||M.face;
 keys.shoot=(M.t&1)===0&&M.face===Math.sign(ex-M.x)&&!e.hidden;return e.mode;})()`;
