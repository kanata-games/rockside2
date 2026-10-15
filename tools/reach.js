#!/usr/bin/env node
// Reachability validator for ROCKSIDE II stages (src/03b_rooms.js). No browser needed.
//   node tools/reach.js            -> summary; exit 1 on problems
//   node tools/reach.js --json F   -> also write reachable tiles per room to F (used by tools/mapview.py)
//   node tools/reach.js --quiet    -> problems only
// Movement model (conservative, Umine): body = 1 column x 2 rows, standing on a solid tile.
//   walk/fall, jump (rise <=3 tiles, reach <=4 cols; <=3 cols when rising 3), wall kick (climb any column that
//   has a solid wall beside it; each kick swings ~24px = 2 columns away from the wall, so a ceiling in those 2
//   columns stops the climb; then hop off sideways <=3 columns), slide (through 1-row tunnels), slide jump (reach <=8 cols,
//   rise <=1; <=6 cols when rising 2-3). Doors, lifts and warps connect nodes. Flags (seal, levers) are applied
//   until nothing new opens (fixpoint). Every key point must be reachable, and every reachable spot must be able
//   to walk back to the start (no one-way traps), using only the flags owned at that moment.
const path=require('path'),fs=require('fs');
const {ROOM_DEFS,MANSION_WORLD}=require(path.join(__dirname,'..','src','03b_rooms.js'));
const MR=MANSION_WORLD.MR,PORTALS=MANSION_WORLD.portals;
const args=process.argv.slice(2),QUIET=args.includes('--quiet'),jsonOut=args.includes('--json')?args[args.indexOf('--json')+1]:null;
const START={room:'bedroom',x:MR.bedroom.cp[0],y:MR.bedroom.cp[1]};
const MOVES_ALL=['jump','wallkick','slide','slidejump'];
const JUMP=[4,4,4,3],SJUMP=[8,8,6,6]; // max columns by rise 0..3 tiles
function solidFn(r,flags){const G=r.grid,H=G.length,W=G[0].length,lever=r.lever&&r.lever.flag;
 return (c,row)=>{if(c<0||c>=W||row<0)return true;if(row>=H)return false;const ch=G[row][c];return ch==='#'||ch==='='||(ch==='g'&&!flags.seal)||(ch==='k'&&!flags[lever]);};}
function liftCells(r){const s=new Set();if(!r.lift)return s;for(const y of r.lift.stops)for(let c=r.lift.x/16;c<(r.lift.x+r.lift.w)/16;c++)s.add(c+','+y/16);return s;}
// Build the move graph for one flag set. Node key: room|c|row (row = tile row of the feet, standing on row+1).
function graph(flags,moves){const nodes=new Map(),edges=new Map(),add=(a,b)=>{if(!edges.has(a))edges.set(a,new Set());edges.get(a).add(b);};
 const has=m=>moves.includes(m);
 for(const[id,r]of Object.entries(MR)){const S0=solidFn(r,flags),lifts=liftCells(r),S=(c,row)=>S0(c,row)||lifts.has(c+','+row);const W=r.grid[0].length,H=r.grid.length;
  const free=(c,row)=>!S0(c,row);const stand=(c,row)=>free(c,row)&&free(c,row-1)&&S(c,row+1);const K=(c,row)=>id+'|'+c+'|'+row;
  const fall=(c,row)=>{while(row<H&&free(c,row)&&free(c,row-1)){if(S(c,row+1))return K(c,row);row++;}return null;};
  const rectFree=(c0,c1,r0,r1)=>{for(let c=Math.min(c0,c1);c<=Math.max(c0,c1);c++)for(let y=r0;y<=r1;y++)if(!free(c,y))return false;return true;};
  const arc=(k,c,row,dir,table,rise)=>{for(let h=0;h<=rise;h++){const top=row-h-1-(h>=3?1:0);if(!rectFree(c,c,top,row))break;for(let dx=1;dx<=table[h];dx++){const tc=c+dir*dx,f=row-h;if(!rectFree(c,tc,top,f))break;const t=stand(tc,f)?K(tc,f):fall(tc,f);if(t&&t!==k)add(k,t);}}};
  for(let row=0;row<H;row++)for(let c=0;c<W;c++){if(!stand(c,row))continue;const k=K(c,row);nodes.set(k,{room:id,c,row});
   for(const d of[-1,1]){const n=c+d;if(free(n,row)&&free(n,row-1)){add(k,S(n,row+1)?K(n,row):fall(n,row)||k);} 
    if(has('jump')){arc(k,c,row,d,JUMP,3);for(let h=1;h<=3&&rectFree(c,c,row-h-1,row);h++)if(stand(c,row-h))add(k,K(c,row-h));}
    if(has('slidejump')&&free(c+d,row)&&free(c+d,row-1))arc(k,c,row,d,SJUMP,3);
    if(has('slide')){let x=c+d,open=0;while(x>=0&&x<W&&free(x,row)){if(!S(x,row+1)){const t=fall(x,row);if(t)add(k,t);break;}if(free(x,row-1)){add(k,K(x,row));if(++open>6)break;}else open=0;x+=d;}}
    if(has('wallkick')){// climb column c with a wall on side d; the kick pushes into column c-d (or bounces off a 1-wide shaft)
     if(S0(c+d,row-1)||S0(c+d,row-2)){const ceil=(x,y)=>free(x,y-1)&&!free(x,y-2);let y=row-1;while(y>0&&free(c,y-1)&&(S0(c+d,y)||S0(c+d,y-1))&&!ceil(c-d,y)&&!ceil(c-2*d,y)){y--;}
      for(let f=row-1;f>=y;f--){// airborne feet row f at column c
       if(stand(c,f))add(k,K(c,f));if(free(c+d,f)&&free(c+d,f-1)&&S(c+d,f+1))add(k,K(c+d,f));
       for(const s of[-1,1])for(let dx=1;dx<=3;dx++){const tc=c+s*dx;if(!rectFree(c,tc,f-1,f))break;if(stand(tc,f))add(k,K(tc,f));}}
      // top of the wall: step onto it (the last kick also swings 2 columns away, so those must be open too)
      const swingOK=(f)=>[c-d,c-2*d].every(x=>{let fr=true,so=true;for(let q=f-1;q<=y;q++){if(free(x,q))so=false;else fr=false;}return fr||so;});
      for(let f=y;f>=Math.max(0,y-3);f--)if(stand(c+d,f)&&rectFree(c,c,f-1,y)&&swingOK(f))add(k,K(c+d,f));}}
   }}
  // Doors, extension, lift stops and portals: connect to the nearest standing node.
  const near=(x,y)=>{const c=Math.floor(x/16),row=y/16-1;return stand(c,row)?K(c,row):null;};
  r._near=near;
  if(r.lift){const ks=r.lift.stops.map(y=>[...Array(r.lift.w/16).keys()].map(i=>K(r.lift.x/16+i,y/16-1)).filter(q=>{const p=q.split('|');return stand(+p[1],+p[2]);}));for(const a of ks)for(const b of ks)if(a!==b)for(const x of a)for(const y of b)add(x,y);}
 }
 for(const[id,r]of Object.entries(MR)){const doors=[...r.doors,...(r.extension&&r.extensionDoor?[{...r.extensionDoor,x:r.extension[0],y:r.extension[1]}]:[])];
  for(const d of doors){if(d.need&&!flags[d.need])continue;const a=r._near(d.x,d.y),b=MR[d.to]._near(d.at[0],d.at[1]);if(a&&b)add(a,b);}}
 return{nodes,edges};}
function bfs(G,from,portalsOk,flags){const seen=new Set([from]),q=[from];const portalNodes=Object.entries(PORTALS).filter(([id,p])=>!p.need||flags[p.need]).map(([id,p])=>MR[id]._near(p.x,p.y)).filter(Boolean);let warped=false;
 while(q.length){const k=q.shift();for(const n of G.edges.get(k)||[])if(!seen.has(n)){seen.add(n);q.push(n);}
  if(portalsOk&&!warped&&portalNodes.some(p=>seen.has(p))){/* warps link every discovered portal; approximated as: reaching any portal reaches all reached-later ones */}
  if(!q.length&&portalsOk){for(const p of portalNodes)if(!seen.has(p)&&portalNodes.some(o=>seen.has(o)&&o!==p)){/* only discovered portals warp: discovered = seen */}}}
 // Discovered portals connect to each other.
 let grew=true;while(grew){grew=false;const known=portalNodes.filter(p=>seen.has(p));for(const p of known)for(const o of known)if(!seen.has(o)){seen.add(o);grew=true;}}
 return seen;}
function points(){const pts=[];for(const[id,r]of Object.entries(MR)){const P=(kind,x,y)=>pts.push({room:id,kind,x,y});
 if(r.cp)P('save',...r.cp);if(r.seal)P('seal',r.seal[0],r.seal[1]+2);if(r.lever)P('lever',r.lever.x,r.lever.y);if(r.boss)P('boss',...r.boss);if(r.goal)P('goal',...r.goal);if(r.npc)P('npc',...r.npc);if(r.extension)P('extension',...r.extension);
 for(const d of r.doors)P('door→'+d.to,d.x,d.y);if(PORTALS[id])P('warp',PORTALS[id].x,PORTALS[id].y);for(const p of MANSION_WORLD.props[id]||[])P(p[0],p[1],p[2]);}return pts;}
function solve(moves){let flags={};const order=[];let reach,G;
 for(let it=0;it<20;it++){G=graph(flags,moves);const start=MR[START.room]._near(START.x,START.y);reach=bfs(G,start,true,flags);let added=false;
  for(const[id,r]of Object.entries(MR)){const hit=(x,y)=>{const k=r._near(x,y);return k&&reach.has(k);};
   if(r.seal&&!flags.seal&&hit(r.seal[0],r.seal[1]+2)){flags.seal=true;order.push('seal@'+id);added=true;}
   if(r.lever&&!flags[r.lever.flag]&&hit(r.lever.x,r.lever.y)){flags[r.lever.flag]=true;order.push(r.lever.flag+'@'+id);added=true;}
   if(r.boss&&!flags.boss&&hit(...r.boss)){flags.boss=true;order.push('boss@'+id);added=true;}}
  // trap check with the flags owned in this phase
  if(!G._trapChecked){}
  if(!added)break;}
 return{flags,order,reach,G};}
const problems=[],notes=[];
const full=solve(MOVES_ALL);
for(const p of points()){const k=MR[p.room]._near(p.x,p.y);if(!k)problems.push(`${p.room}: ${p.kind} at (${p.x},${p.y}) has no standing room (needs solid below and 2 free tiles)`);else if(!full.reach.has(k))problems.push(`${p.room}: ${p.kind} at (${p.x},${p.y}) is unreachable`);}
// One-way traps: in every flag phase, each reachable node must get back to the start.
{let flags={};const phases=[{}];for(const o of full.order){const f=o.split('@')[0];flags={...flags,[f]:true};phases.push({...flags});}
 for(const fl of phases){const G=graph(fl,MOVES_ALL),start=MR[START.room]._near(START.x,START.y),fw=bfs(G,start,true,fl);
  const rev=new Map();for(const[a,bs]of G.edges)for(const b of bs){if(!rev.has(b))rev.set(b,new Set());rev.get(b).add(a);}
  const back=new Set([start]),q=[start];const portalNodes=Object.entries(PORTALS).filter(([id,p])=>!p.need||fl[p.need]).map(([id,p])=>MR[id]._near(p.x,p.y)).filter(n=>n&&fw.has(n));for(const p of portalNodes)if(!back.has(p)){back.add(p);q.push(p);}
  while(q.length){const k=q.shift();for(const n of rev.get(k)||[])if(!back.has(n)){back.add(n);q.push(n);}}
  const traps=new Map();for(const k of fw)if(!back.has(k)){const room=k.split('|')[0];traps.set(room,(traps.get(room)||0)+1);}
  for(const[room,n]of traps)problems.push(`${room}: ${n} reachable tile(s) cannot return to the start with flags {${Object.keys(fl).join(',')||'none'}} (one-way trap)`);}}
// Which key points need which move? (proves the gates are real)
const gates={};for(const m of['wallkick','slide','slidejump']){const s=solve(MOVES_ALL.filter(x=>x!==m));const lost=points().filter(p=>{const k=MR[p.room]._near(p.x,p.y);return k&&full.reach.has(k)&&!s.reach.has(k);});gates[m]=lost.map(p=>`${p.room}:${p.kind}`);}
const byRoom={};for(const k of full.reach){const[r,c,row]=k.split('|');(byRoom[r]||(byRoom[r]=[])).push([+c,+row]);}
const rooms=Object.keys(MR),standable=[...full.G.nodes.keys()],unreached=standable.filter(k=>!full.reach.has(k));
const unRoom={};for(const k of unreached){const r=k.split('|')[0];unRoom[r]=(unRoom[r]||0)+1;}
if(!QUIET){console.log(`rooms ${rooms.length}, map cells ${Object.keys(MANSION_WORLD.cells).length}, standable tiles ${standable.length}, reached ${full.reach.size}`);
 console.log('unlock order: '+(full.order.join(' -> ')||'(none)'));
 for(const m in gates){const by={};for(const g of gates[m]){const[r]=g.split(':');by[r]=(by[r]||0)+1;}console.log(`needs ${m}: ${gates[m].length?gates[m].length+' key points behind it ('+Object.entries(by).map(([r,n])=>r+' '+n).join(', ')+')':'(nothing)'}`);}
 const tele=Object.keys(MR).filter(id=>!MR[id].doors.length&&!Object.values(MR).some(r=>r.doors.some(d=>d.to===id)));if(tele.length)console.log('teleport-only rooms (entered by events, not doors): '+tele.join(', '));
 const iso=Object.entries(unRoom).filter(([r])=>!tele.includes(r)).filter(([r,n])=>n).map(([r,n])=>`${r}:${n}`);if(iso.length)console.log('standable but unreached tiles (sealed-off decor/arena pockets): '+iso.join(' '));}
if(jsonOut)fs.writeFileSync(jsonOut,JSON.stringify({reach:byRoom,unreached:unreached.map(k=>k.split('|')),order:full.order,gates,problems}));
if(problems.length){console.log('PROBLEMS ('+problems.length+'):');for(const p of problems)console.log('  - '+p);process.exit(1);}
console.log('OK: every save, door, warp, lever, seal, boss, goal, NPC and breakable is reachable; no one-way traps.');
