
// =====================================================================
//  STAGE ART (test.42): per-area tilesets, back walls with props,
//  parallax far layers seen through windows, scenes, lighting and fog.
//  Each room is pre-rendered once into two canvases (back = wall/props,
//  front = tiles), the far layer and the lighting are drawn per frame.
// =====================================================================
const ART={
 // wall: [base, block, blockHi, mortar, trim, trimHi]  stone: [cap, capHi, capLo, face, faceHi, faceLo, mortar, deep]
 hub:{wall:['#2a2233','#352b40','#41364c','#1d1825','#7b5f4a','#c5a17a'],stone:['#b49172','#e9caa0','#6b5145','#4a3d4d','#5e4f62','#352c3a','#211b27','#18131e'],dark:.22,far:'night',win:'arch',glow:'#ffcf8a'},
 mansion:{wall:['#18233a','#203049','#2a3b58','#121a2b','#56688a','#a9c3d8'],stone:['#8fb4c8','#e1f6ff','#4d6880','#33445f','#42587a','#24314a','#151e30','#0e1524'],dark:.34,far:'night',win:'arch',glow:'#ffd49a'},
 library:{wall:['#241a2c','#2e2236','#3a2c43','#18111e','#7a5a3e','#cfa271'],stone:['#8a6342','#d4a46e','#4e3424','#3e2f47','#4f3d5a','#2c2135','#1a1320','#120d17'],dark:.42,far:'stacks',win:'slit',glow:'#ffb969'},
 tower:{wall:['#1f1f30','#29293d','#34344b','#151522','#8a7348','#e2c27c'],stone:['#a88f5c','#f0d79a','#5d4c30','#3a3a52','#4a4a66','#26263a','#17172a','#10101d'],dark:.38,far:'gears',win:'round',glow:'#ffc978'},
 water:{wall:['#102633','#15303f','#1d3d4e','#0a1a24','#3f7c7a','#9fe6dc'],stone:['#4f9a86','#a8f0d4','#28584f','#24485a','#2f5a6e','#173342','#0d212c','#08161e'],dark:.46,far:'cavern',win:'arch',glow:'#8ff2ff'},
 shade:{wall:['#140e1e','#1c1428','#2a1e3a','#0c0814','#6a4a8a','#d8c0f0'],stone:['#6a5a8a','#e0d4f4','#3a2e54','#261e3a','#30264a','#1a1430','#100c20','#08060f'],dark:.3,far:'cosmos',win:'round',glow:'#b070ff',open:true},
 keiko:{wall:['#1c2232','#252c40','#323b54','#141826','#8a94b0','#e6ecf8'],stone:['#8c96aa','#eef2f8','#4c556c','#30384c','#3c465c','#20263a','#151a2a','#0c1020'],dark:.22,far:'moonGarden',win:'arch',glow:'#e8f0ff',open:true},
 observatory:{wall:['#120f2a','#1a1638','#272250','#0b0920','#7a6ac8','#e6dcff'],stone:['#8a7ad0','#f2ecff','#4a3e8a','#2e2766','#3c3482','#1f1a4a','#141036','#0a0822'],dark:.26,far:'cosmos',win:'round',glow:'#d7b8ff',open:true},
 star:{wall:['#141a35','#1b2344','#252f57','#0e1228','#6c74b8','#d8dcff'],stone:['#7d87c9','#eef0ff','#414a86','#2c3563','#3a4579','#1e2447','#121733','#0b0f24'],dark:.3,far:'stars',win:'tall',glow:'#bfd0ff'},
 garden:{wall:null,stone:['#5f9a5a','#b8e39a','#35603a','#3c4a5e','#4b5c72','#2a3546','#1a2230','#121823'],dark:.18,far:null,win:null,glow:'#ffe7a8'},
 play:{wall:null,stone:['#b07a8e','#f4c9d4','#6a4258','#4a2b45','#5d3858','#321d30','#1e1020','#150a17'],dark:0,far:null,win:null,glow:'#ffd0e0'},
};
function artH(a,b){let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return(h^(h>>>16))>>>0;}
function artR(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);}
function artSolid(r,c,row){if(row<0||row>=r.grid.length||c<0||c>=r.grid[0].length)return true;return r.grid[row][c]==='#';}
function artFree(r,c0,r0,c1,r1){for(let y=r0;y<=r1;y++)for(let x=c0;x<=c1;x++){if(y<0||x<0||y>=r.grid.length||x>=r.grid[0].length)return false;if(r.grid[y][x]!=='.'&&!/[a-zA-Z0-9]/.test(r.grid[y][x]))return false;if(r.grid[y][x]==='#')return false;}return true;}
function artInScene(r,c,row,type){return(r.scenes||[]).some(s=>(!type||s[0]===type)&&c>=s[1]&&c<s[1]+s[3]&&row>=s[2]&&row<s[2]+s[4]);}

// ---------------------------------------------------------------- back wall
function artBackWall(c,r,A){artBackWall0(c,r,A);if(A.open)artOpenArches(c,r,A);}
function artBackWall0(c,r,A){const W=r.w,H=r.h,[base,blk,hi,mor,trim,trimHi]=A.wall;
 artR(c,0,0,W,H,base);
 if(r.area==='library'){ // dark panelled wood with vertical grain
  for(let x=0;x<W;x+=32){artR(c,x,0,31,H,blk);artR(c,x+31,0,1,H,mor);for(let y=0;y<H;y+=4)if(artH(x,y)%5===0)artR(c,x+4+artH(y,x)%22,y,2,1,hi);}
 }else if(r.area==='tower'){ // red-brown brick, rivetted iron bands
  for(let y=0;y<H;y+=8)for(let x=-(y/8&1)*8;x<W;x+=16){const v=artH(x,y)%4;artR(c,x+1,y+1,14,6,v===0?hi:blk);artR(c,x+1,y+1,14,1,v===1?trim+'55':hi);}
  for(let y=96;y<H;y+=160){artR(c,0,y,W,6,'#2c2b3a');artR(c,0,y,W,1,'#5b5a70');for(let x=6;x<W;x+=24)artR(c,x,y+2,2,2,'#8f8aa0');}
 }else if(r.area==='water'){ // large wet ashlar with moss streaks
  for(let y=0;y<H;y+=24)for(let x=-(y/24&1)*24;x<W;x+=48){artR(c,x+1,y+1,46,22,artH(x,y)%3?blk:hi);artR(c,x+1,y+1,46,1,'#2a5466');if(artH(y,x)%4===0)for(let k=0;k<22;k+=2)artR(c,x+8+artH(x,k)%30,y+1+k,1,2,'#2b5f52');}
 }else if(r.area==='star'){ // polished night marble with veins and glyph rings
  for(let y=0;y<H;y+=32)for(let x=0;x<W;x+=32){artR(c,x,y,31,31,artH(x,y)%3?blk:hi);artR(c,x,y,31,1,'#323d6c');}
  c.strokeStyle='#3c4a85';c.lineWidth=1;for(let i=0;i<W*H/9000;i++){const x=artH(i,7)%W,y=artH(i,9)%H;c.beginPath();c.moveTo(x,y);for(let k=1;k<6;k++)c.lineTo(x+k*9,y+((artH(i,k)%11)-5));c.stroke();}
 }else{ // hub/mansion ashlar + wallpaper above wainscot
  for(let y=0;y<H;y+=16)for(let x=-(y/16&1)*16;x<W;x+=32){const v=artH(x,y)%5;artR(c,x+1,y+1,30,14,v===0?hi:blk);artR(c,x+1,y+1,30,1,v===0?trim+'66':hi);}
  if(r.area==='hub'){for(let x=0;x<W;x+=12){artR(c,x,0,5,H,'rgba(140,100,120,.10)');}for(let y=6;y<H;y+=24)for(let x=6;x<W;x+=24)artR(c,x,y,2,2,'rgba(220,180,140,.18)');}
 }
 // depth: darker toward the ceiling, a little toward the floor
 const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(4,4,14,.5)');gr.addColorStop(.45,'rgba(4,4,14,.05)');gr.addColorStop(1,'rgba(4,4,14,.28)');c.fillStyle=gr;c.fillRect(0,0,W,H);
}
// pilasters on every 128px seam (fake architecture rhythm, skipped where solid)
function artPilasters(c,r,A){const[ ,blk,hi,mor,trim,trimHi]=A.wall;
 for(let x=128;x<r.w;x+=128){const col=x>>4;let top=null;
  for(let row=0;row<=r.grid.length;row++){const free=row<r.grid.length&&!artSolid(r,col,row)&&!artSolid(r,col-1,row);
   if(free&&top===null)top=row;if((!free||row===r.grid.length)&&top!==null){if(row-top>=4){const y0=top*16,y1=row*16;artR(c,x-7,y0,14,y1-y0,mor);artR(c,x-6,y0,12,y1-y0,blk);artR(c,x-6,y0,2,y1-y0,hi);artR(c,x+3,y0,3,y1-y0,mor);artR(c,x-9,y0+2,18,5,trim);artR(c,x-9,y0+2,18,1,trimHi);artR(c,x-9,y1-6,18,6,trim);artR(c,x-9,y1-6,18,1,trimHi);}top=null;}}}
}
// crown moulding under ceilings, wainscot / skirting above floors
function artTrims(c,r,A){const[ ,blk,hi,mor,trim,trimHi]=A.wall,rows=r.grid.length,cols=r.grid[0].length;
 for(let row=1;row<rows-1;row++)for(let col=0;col<cols;col++){if(artSolid(r,col,row))continue;const x=col*16,y=row*16;
  if(artSolid(r,col,row-1)){artR(c,x,y,16,3,trim);artR(c,x,y+3,16,1,mor);artR(c,x,y,16,1,trimHi);if(col%2===0)artR(c,x+6,y+3,4,3,trim);}
  if(artSolid(r,col,row+1)&&!artSolid(r,col,row-1)&&r.area!=='garden'){
   if(r.area==='library'||r.area==='hub'){artR(c,x,y-12,16,28,mor);artR(c,x+1,y-11,14,26,blk);artR(c,x+3,y-8,10,20,hi);artR(c,x+4,y-7,8,18,blk);artR(c,x,y-14,16,2,trim);artR(c,x,y-14,16,1,trimHi);}
   else if(r.area==='tower'){artR(c,x,y+8,16,8,'#2a2a3c');for(let k=0;k<16;k+=4)artR(c,x+k,y+9,2,6,'#3d3d55');artR(c,x,y+8,16,1,trim);}
   else if(r.area==='water'){artR(c,x,y+10,16,6,'#164046');if(artH(col,row)%3===0)artR(c,x+3,y+6,2,10,'#2c7a62');artR(c,x,y+12,16,1,'#2d6d6a');}
   else{artR(c,x,y+6,16,10,mor);artR(c,x+1,y+7,14,8,blk);artR(c,x,y+6,16,1,trimHi);artR(c,x+((col&1)?2:9),y+9,5,4,hi);}
  }}
}
// windows cut through the back wall so the far layer shows (returns light spots)
function artWindows(c,r,A,lights,shafts){if(!A.win)return;const kind=A.win,cfg={arch:[40,80],slit:[16,56],round:[64,64],tall:[48,112]}[kind],[ww,wh]=cfg;
 for(let band=0;band<r.h;band+=240)for(let x=64;x<r.w;x+=128){if(kind==='slit'&&artH(x,band)%2)continue;
  const wx=x-ww/2,wy=band+40,c0=(wx>>4)-1,c1=((wx+ww)>>4)+1,r0=(wy>>4)-1,r1=((wy+wh)>>4)+1;if(!artFree(r,c0,r0,c1,r1))continue;
  c.save();c.globalCompositeOperation='destination-out';c.beginPath();
  if(kind==='round'){c.arc(x,wy+wh/2,ww/2,0,7);}else{c.moveTo(wx,wy+wh);c.lineTo(wx,wy+ww/2);c.arc(x,wy+ww/2,ww/2,Math.PI,0);c.lineTo(wx+ww,wy+wh);c.closePath();}
  c.fill();c.restore();
  // frame + mullions
  c.strokeStyle=A.wall[4];c.lineWidth=4;c.beginPath();if(kind==='round')c.arc(x,wy+wh/2,ww/2+1,0,7);else{c.moveTo(wx-1,wy+wh);c.lineTo(wx-1,wy+ww/2);c.arc(x,wy+ww/2,ww/2+1,Math.PI,0);c.lineTo(wx+ww+1,wy+wh);}c.stroke();
  c.strokeStyle=A.wall[5];c.lineWidth=1;c.stroke();
  c.fillStyle=A.wall[3];
  if(kind==='round'){for(let i=0;i<8;i++){const a=i*Math.PI/4;c.save();c.translate(x,wy+wh/2);c.rotate(a);c.fillRect(-1,0,2,ww/2);c.restore();}c.beginPath();c.arc(x,wy+wh/2,6,0,7);c.fill();}
  else{c.fillRect(x-1,wy+4,2,wh-4);for(let yy=wy+ww/2+12;yy<wy+wh;yy+=22)c.fillRect(wx,yy,ww,2);}
  artR(c,wx-5,wy+wh,ww+10,5,A.wall[4]);artR(c,wx-5,wy+wh,ww+10,1,A.wall[5]);
  if(kind==='arch'&&r.area!=='water'){ // curtains
   for(const s of[-1,1]){const cxp=s<0?wx-4:wx+ww-4;for(let k=0;k<8;k++)artR(c,cxp+(k&1),wy-4+k*12,8,12,k&1?'#4b1f36':'#5d2843');artR(c,cxp,wy-6,8,3,A.wall[5]);}}
  lights.push({x,y:wy+wh/2,r:kind==='round'?90:70,cool:1});shafts.push({x:wx+3,y:wy+ww/3,w:ww-6,h:wh});
 }
}
// floor props, wall props (sconces, shelves, pipes, gears, crystals) -- deterministic per room
function artProps(c,r,A,lights){const rows=r.grid.length,cols=r.grid[0].length,area=r.area;
 // floor runs: [row, c0, c1] where row is the free row standing on solid
 const runs=[];for(let row=1;row<rows;row++){let s=null;for(let col=0;col<=cols;col++){const ok=col<cols&&!artSolid(r,col,row)&&artSolid(r,col,row+1)&&!artSolid(r,col,row-1)&&!artSolid(r,col,row-2);if(ok&&s===null)s=col;if(!ok&&s!==null){runs.push([row,s,col-1]);s=null;}}}
 for(const[row,a,b]of runs){const y=(row+1)*16;
  for(let col=a+1;col<b;col+=3){const hsh=artH(col*3+1,row*7),x=col*16+8;if(artInScene(r,col,row))continue;
   let headroom=0;while(headroom<8&&!artSolid(r,col,row-headroom))headroom++;
   if(area==='library'&&headroom>=6&&hsh%3===0&&col+2<=b){artShelf(c,x+8,y,40,Math.min(headroom-1,6)*16);col+=2;continue;}
   if(area==='mansion'&&hsh%5===0&&headroom>=5){artStatue(c,x,y);continue;}
   if((area==='mansion'||area==='hub')&&hsh%5===1){artCandelabra(c,x,y);lights.push({x,y:y-30,r:56,warm:1,flick:1});continue;}
   if(area==='tower'&&hsh%4===0){artCrates(c,x,y,hsh);continue;}
   if(area==='tower'&&hsh%4===1&&headroom>=4){artGearPile(c,x,y);continue;}
   if(area==='water'&&hsh%3===0){artValve(c,x,y);continue;}
   if(area==='water'&&hsh%3===1){artR(c,x-10,y-2,22,2,'#5ad0d8');artR(c,x-6,y-3,12,1,'#b6fbff');continue;}
   if(area==='star'&&hsh%3===0){artCrystal(c,x,y,A);lights.push({x,y:y-14,r:48,blue:1});continue;}
   if(area==='library'&&hsh%3===1){artBooks(c,x,y,hsh);continue;}
   if(area==='library'&&hsh%5===2&&headroom>=4){artReadingLamp(c,x,y);lights.push({x,y:y-26,r:52,warm:1});continue;}
  }}
 // wall sconces at pilaster seams, two tiles above floors
 for(let x=128;x<r.w;x+=128)for(let row=2;row<rows;row++){const col=x>>4;if(!artSolid(r,col,row+1)||artSolid(r,col,row)||artSolid(r,col,row-1)||artSolid(r,col,row-3))continue;if(area==='garden'||area==='play')continue;
  const y=(row-2)*16+4;if(area==='water'){artPipeLamp(c,x,y);lights.push({x,y:y+4,r:60,blue:1});}else{artSconce(c,x,y,A);lights.push({x,y:y-4,r:64,warm:1,flick:1});}}
 // area set-pieces on big blank walls
 if(area==='water'){for(let x=40;x<r.w;x+=176){const col=x>>4;let y0=0;while(y0<rows&&artSolid(r,col,y0))y0++;let y1=y0;while(y1<rows&&!artSolid(r,col,y1))y1++;if(y1-y0>=5&&!artInScene(r,col,y0))artPipeRun(c,x,y0*16,(y1-y0)*16,artH(x,1));}}
 if(area==='tower'){for(let x=96;x<r.w;x+=224)for(let band=0;band<r.h;band+=240){const cx0=x>>4,ry=(band+150)>>4;if(artFree(r,cx0-3,ry-3,cx0+3,ry+3))artGear(c,x,band+150,34,12,0,'#2f2f45','#4a4a66');}}
 if(area==='library'){for(let x=200;x<r.w;x+=256)for(let band=0;band<r.h;band+=240){const cx0=x>>4,ry=(band+56)>>4;if(artFree(r,cx0-2,ry-1,cx0+2,ry+2))artPortrait(c,x,band+56);}}
 if(area==='star'){for(let x=160;x<r.w;x+=256)for(let band=0;band<r.h;band+=240){const cx0=x>>4,ry=(band+140)>>4;if(artFree(r,cx0-2,ry-2,cx0+2,ry+2))artOrrery(c,x,band+140);}}
}
function artShelf(c,x,y,w,h){artR(c,x-w/2-2,y-h-4,w+4,h+4,'#3a2618');artR(c,x-w/2,y-h,w,h,'#1c120f');for(let yy=y-h+4;yy<y-6;yy+=20){for(let k=0;k<w-4;){const bw=3+artH(k,yy)%3,bh=11+artH(yy,k)%5;artR(c,x-w/2+2+k,yy+16-bh,bw,bh,['#6d3b45','#3f5d6e','#7a6a3e','#3d5a42','#5b3d6b','#8a4a32'][artH(k+x,yy)%6]);artR(c,x-w/2+2+k,yy+16-bh+2,bw,1,'rgba(255,230,180,.25)');k+=bw+(artH(k,yy+x)%5===0?3:0);}artR(c,x-w/2,yy+16,w,3,'#6b4a2c');artR(c,x-w/2,yy+16,w,1,'#a87a4c');}artR(c,x-w/2-3,y-h-6,w+6,3,'#8f6a42');}
function artBooks(c,x,y,h){for(let i=0;i<4;i++)artR(c,x-8+(i&1)*2,y-4-i*4,16-(i&2)*2,4,['#6d3b45','#3f5d6e','#7a6a3e','#5b3d6b'][(h+i)%4]);artR(c,x+9,y-10,3,10,'#8a4a32');}
function artReadingLamp(c,x,y){artR(c,x-1,y-24,2,24,'#6b5338');artR(c,x-5,y-2,10,2,'#8f6a42');artR(c,x-6,y-30,12,6,'#c98a3a');artR(c,x-4,y-31,8,1,'#ffd28a');}
function artStatue(c,x,y){artR(c,x-9,y-10,18,10,'#4b5a74');artR(c,x-10,y-12,20,2,'#8ea3bf');artR(c,x-5,y-40,10,28,'#6c7f9a');artR(c,x-4,y-48,8,8,'#8ea3bf');artR(c,x-8,y-36,3,16,'#56677f');artR(c,x+5,y-38,3,14,'#56677f');artR(c,x-3,y-40,2,26,'#a9bdd5');}
function artCandelabra(c,x,y){artR(c,x-1,y-26,2,26,'#8a7346');artR(c,x-6,y-2,12,2,'#b39a5e');artR(c,x-9,y-27,18,2,'#b39a5e');for(const dx of[-8,0,8]){artR(c,x+dx-1,y-33,2,6,'#efe6cf');artR(c,x+dx-1,y-36,2,3,'#ffcf6a');}}
function artCrates(c,x,y,h){const n=1+h%2;for(let i=0;i<n;i++){const yy=y-14-i*14,xx=x-8+i*3;artR(c,xx,yy,16,14,'#5d4630');artR(c,xx,yy,16,2,'#8b6a45');artR(c,xx+1,yy+2,2,12,'#3f2f22');artR(c,xx+13,yy+2,2,12,'#3f2f22');artR(c,xx+3,yy+6,10,2,'#3f2f22');}}
function artGear(c,x,y,rad,teeth,rot,col,hi){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=col;c.beginPath();for(let i=0;i<teeth*2;i++){const a=i*Math.PI/teeth,rr=i%2?rad:rad*1.16;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.fillStyle=hi;c.beginPath();c.arc(0,0,rad*.62,0,7);c.fill();c.fillStyle=col;c.beginPath();c.arc(0,0,rad*.5,0,7);c.fill();for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);c.fillStyle=hi;c.fillRect(-2,0,4,rad*.55);c.restore();}c.fillStyle=hi;c.beginPath();c.arc(0,0,rad*.16,0,7);c.fill();c.restore();}
function artGearPile(c,x,y){artGear(c,x-4,y-8,8,8,.3,'#6b5a3a','#a88f5c');artGear(c,x+7,y-6,6,7,.1,'#5d4c30','#8a7348');}
function artValve(c,x,y){artR(c,x-3,y-22,6,22,'#2f5a5e');artR(c,x-2,y-22,1,22,'#6fb8b0');artR(c,x-8,y-26,16,3,'#a46b45');artR(c,x-1,y-30,2,4,'#a46b45');artR(c,x-6,y-4,12,4,'#244548');}
function artCrystal(c,x,y,A){artR(c,x-7,y-6,14,6,'#2c3563');artR(c,x-8,y-7,16,1,'#6c74b8');c.fillStyle='#9fb8ff';c.beginPath();c.moveTo(x,y-28);c.lineTo(x+6,y-14);c.lineTo(x,y-6);c.lineTo(x-6,y-14);c.closePath();c.fill();c.fillStyle='#eef4ff';c.fillRect(x-1,y-24,2,10);}
function artSconce(c,x,y,A){artR(c,x-4,y,8,6,A.wall[4]);artR(c,x-1,y+6,2,4,A.wall[4]);artR(c,x-5,y-1,10,2,A.wall[5]);artR(c,x-2,y-7,4,6,'#efe6cf');artR(c,x-2,y-11,4,4,'#ffcf6a');artR(c,x-1,y-13,2,2,'#fff6c8');}
function artPipeLamp(c,x,y){artR(c,x-6,y-2,12,10,'#1f4a50');artR(c,x-5,y-1,10,8,'#7fe8f0');artR(c,x-3,y+1,6,4,'#e6ffff');artR(c,x-7,y-3,14,2,'#a46b45');artR(c,x-7,y+8,14,2,'#a46b45');}
function artPipeRun(c,x,y,h,s){const w=10+(s%2)*4;artR(c,x-w/2,y,w,h,'#24484e');artR(c,x-w/2+2,y,2,h,'#4f8f8c');artR(c,x+w/2-3,y,2,h,'#132c31');for(let yy=y+20+s%30;yy<y+h-8;yy+=64){artR(c,x-w/2-2,yy,w+4,5,'#a46b45');artR(c,x-w/2-2,yy,w+4,1,'#e3a676');}}
function artPortrait(c,x,y){artR(c,x-17,y-20,34,40,'#8f6a42');artR(c,x-15,y-18,30,36,'#2a1d2f');artR(c,x-8,y-12,16,14,'#5b4560');artR(c,x-10,y+2,20,14,'#3e2f47');artR(c,x-17,y-20,34,1,'#e6bc84');}
function artOrrery(c,x,y){c.strokeStyle='#6c74b8';c.lineWidth=1;for(const rr of[14,22,30]){c.beginPath();c.ellipse(x,y,rr,rr*.42,-.3,0,7);c.stroke();}c.fillStyle='#ffe8a8';c.beginPath();c.arc(x,y,4,0,7);c.fill();c.fillStyle='#9fb8ff';c.fillRect(x+20,y-8,3,3);c.fillRect(x-28,y+6,3,3);}

// ---------------------------------------------------------------- scenes
// def.scenes: [type,col,row,w,h] in tiles -- make the room's gate read as a real place.
function artScenesBack(c,r,A){for(const[type,col,row,w,h]of r.scenes||[]){const x=col*16,y=row*16,W=w*16,H=h*16;
 if(type==='stairwell'){ // collapsed grand staircase: ghost of the old flight running up the wall
  c.fillStyle='#2a3a56';c.beginPath();c.moveTo(x-96,y+H);for(let k=0;k<9;k++){c.lineTo(x-96+k*16,y+H-k*14);c.lineTo(x-80+k*16,y+H-k*14);}c.lineTo(x+48,y+H);c.closePath();c.fill();
  for(let k=1;k<9;k++){artR(c,x-96+k*16,y+H-k*14-2,16,3,'#8fb4c8');artR(c,x-96+k*16,y+H-k*14+1,16,1,'#1a2438');if(k<8)artR(c,x-90+k*16,y+H-k*14-24,2,22,'#6f8aa6');if(k<8)artR(c,x-91+k*16,y+H-k*14-26,4,2,'#a9c3d8');}
  c.strokeStyle='#a9c3d8';c.lineWidth=2;c.beginPath();c.moveTo(x-96,y+H-28);c.lineTo(x+24,y+H-133);c.stroke();artR(c,x-110,y-40,2,40,'rgba(160,180,200,.28)');for(let k=0;k<5;k++)artR(c,x-120+k*6,y-46+k*2,10,2,'rgba(160,180,200,.2)'); // broken hand-rail
 }else if(type==='spiral'){ // broken spiral stair column against the east wall
  artR(c,x+W-12,y-32,12,H+32,'rgba(10,12,24,.6)');for(let yy=y-24;yy<y+H;yy+=12)artR(c,x+W-14,yy,14,2,'rgba(170,190,215,.25)');
  c.strokeStyle='rgba(170,190,215,.25)';c.lineWidth=2;c.beginPath();for(let yy=y-30;yy<y+H;yy+=4){const px=x+W-8+Math.sin(yy*.09)*26;yy===y-30?c.moveTo(px,yy):c.lineTo(px,yy);}c.stroke();
 }else if(type==='shaft'){ // chimney / elevator shaft: soot brick, guide rails, hanging chain
  artR(c,x,y,W,H,'#120f18');for(let yy=y;yy<y+H;yy+=8)for(let xx=x-(yy/8&1)*6;xx<x+W;xx+=12)artR(c,xx+1,yy+1,10,6,artH(xx,yy)%4?'#1c1722':'#272030');
  const g2=c.createLinearGradient(0,y,0,y+H);g2.addColorStop(0,'rgba(0,0,0,.6)');g2.addColorStop(1,'rgba(40,30,20,.1)');c.fillStyle=g2;c.fillRect(x,y,W,H);
  artR(c,x+5,y,3,H,'#4a4a5e');artR(c,x+W-8,y,3,H,'#4a4a5e');artR(c,x+6,y,1,H,'#8a8aa0');artR(c,x+W-7,y,1,H,'#8a8aa0');
  for(let yy=y;yy<y+H;yy+=6)artR(c,x+W/2-1+((yy/6)&1),yy,2,4,'#6b6b80');
  for(let yy=y+40;yy<y+H;yy+=56)artR(c,x+8,yy,W-16,3,'#3a2a20');
 }else if(type==='pipes'){ // service pipe chase behind a climb
  artR(c,x,y,W,H,'rgba(5,15,20,.55)');for(let i=0;i<3;i++)artPipeRun(c,x+10+i*((W-20)/2),y,H,i);
 }else if(type==='bridge'){ // broken bridge: stubs and hanging planks over a gap
  for(let i=0;i<5;i++){const px=x+8+i*(W-16)/4,len=10+artH(i,col)%22;c.save();c.translate(px,y+4);c.rotate((artH(i,row)%7-3)*.08);artR(c,-3,0,6,len,'#6b4a2c');artR(c,-3,0,6,1,'#a87a4c');c.restore();}
  c.strokeStyle='#8f6a42';c.lineWidth=1;c.beginPath();c.moveTo(x-8,y+2);c.quadraticCurveTo(x+W*.25,y+30,x+W*.4,y+46);c.moveTo(x+W+8,y+2);c.quadraticCurveTo(x+W*.75,y+24,x+W*.62,y+40);c.stroke();
 }}}
function artScenesFront(c,r,A){for(const[type,col,row,w,h]of r.scenes||[]){const x=col*16,y=row*16,W=w*16,H=h*16;
 if(type==='stairwell'){ // the block itself is the stair core: marble flight sheared off, rubble at its foot
  for(let k=0;k<h;k++){const yy=y+k*16;artR(c,x+W-6,yy+4,6,2,'#9fb8cc');artR(c,x+W-5,yy+6,5,8,'#56708c');}
  c.fillStyle='rgba(225,246,255,.5)';c.beginPath();c.moveTo(x+16,y);c.lineTo(x+22,y+6);c.lineTo(x+28,y+2);c.lineTo(x+40,y+9);c.lineTo(x+46,y+1);c.lineTo(x+56,y+4);c.lineTo(x+56,y+1);c.lineTo(x+16,y-1);c.fill();
  for(let i=0;i<6;i++){const rx=x-30+artH(i,3)%26,ry=y+H-4-artH(i,5)%4;artR(c,rx,ry,4+artH(i,9)%5,4,'#56708c');artR(c,rx,ry,3,1,'#9fb8cc');}
  artR(c,x+W+2,y-2,2,8,'#a9c3d8');artR(c,x+W-2,y-6,10,2,'#a9c3d8');
 }else if(type==='fallen'){ // fallen bookcase wedged across the corridor, crawl gap below
  c.save();c.beginPath();c.rect(x,y,W,H);c.clip();artR(c,x,y,W,H,'#2a1a14');for(let yy=y+4;yy<y+H-4;yy+=18){for(let k=0;k<W-6;k+=5)artR(c,x+3+k,yy,4,14-artH(k,yy)%4,['#6d3b45','#3f5d6e','#7a6a3e','#3d5a42','#5b3d6b'][artH(k,yy)%5]);artR(c,x,yy+14,W,3,'#6b4a2c');}
  artR(c,x,y,4,H,'#8f6a42');artR(c,x+W-4,y,4,H,'#8f6a42');artR(c,x,y+H-5,W,5,'#8f6a42');artR(c,x,y+H-5,W,1,'#d4a46e');c.restore();
  for(let i=0;i<5;i++)artR(c,x-6+artH(i,1)%(W+12),y+H+2+(artH(i,2)%3)*2,6,3,['#6d3b45','#3f5d6e','#7a6a3e'][i%3]);
 }}}

// ---------------------------------------------------------------- tiles
function artDist(r){const rows=r.grid.length,cols=r.grid[0].length,d=[];for(let y=0;y<rows;y++){d.push(new Array(cols).fill(9));for(let x=0;x<cols;x++)if(!artSolid(r,x,y))d[y][x]=0;}
 for(let pass=1;pass<=3;pass++)for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(d[y][x]===9){const n=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const yy=y+b,xx=x+a;return yy>=0&&xx>=0&&yy<rows&&xx<cols&&d[yy][xx]===pass-1;});if(n)d[y][x]=pass;}return d;}
function artTiles(c,r,A){const S=A.stone,[cap,capHi,capLo,face,faceHi,faceLo,mor,deep]=S,rows=r.grid.length,cols=r.grid[0].length,D=artDist(r),area=r.area;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const ch=r.grid[row][col],x=col*16,y=row*16,h=artH(col,row);
  if(ch==='#'){const d=D[row][col];
   const top=!artSolid(r,col,row-1),bot=!artSolid(r,col,row+1),lf=!artSolid(r,col-1,row),rt=!artSolid(r,col+1,row);
   artR(c,x,y,16,16,mor);
   // bricks 16x8 staggered, varied tone, top-left highlight
   for(let b=0;b<2;b++){const yy=y+b*8,off=((row*2+b)&1)?8:0;for(let k=-1;k<2;k++){const bx=x+off+k*16;const v=artH(bx+1,yy);const L=Math.max(bx,x),R=Math.min(bx+15,x+16);if(R<=L)continue;artR(c,L,yy+1,R-L,7,v%4===0?faceHi:v%4===1?faceLo:face);artR(c,L,yy+1,R-L,1,faceHi);}}
   if(area==='tower'&&h%6===0){artR(c,x+2,y+2,12,12,'#4a4a62');artR(c,x+2,y+2,12,1,'#7a7a96');for(const[a,b]of[[3,3],[12,3],[3,12],[12,12]])artR(c,x+a,y+b,1,1,'#b4b4cc');}
   if(h%13===0&&!top){artR(c,x+5,y+3,6,5,deep);artR(c,x+5,y+3,6,1,mor);} // missing brick
   if(h%7===0){c.strokeStyle=deep;c.lineWidth=1;c.beginPath();c.moveTo(x+3+h%9,y+(top?4:0));c.lineTo(x+6+h%7,y+7);c.lineTo(x+4+h%5,y+12);c.lineTo(x+8+h%6,y+16);c.stroke();}
   if(d===2){c.fillStyle='rgba(6,6,16,.3)';c.fillRect(x,y,16,16);}else if(d>=3){c.fillStyle='rgba(6,6,16,.52)';c.fillRect(x,y,16,16);}
   if(lf){artR(c,x,y,2,16,faceHi);artR(c,x,y,1,16,capLo);}if(rt){artR(c,x+14,y,2,16,faceLo);artR(c,x+15,y,1,16,deep);}
   if(bot){artR(c,x,y+13,16,3,faceLo);artR(c,x,y+15,16,1,deep);if(area==='water'&&h%3===0){artR(c,x+5+h%6,y+16,2,3+h%4,'#3d8f7a');}if(area==='library'&&h%4===0)artR(c,x+3+h%9,y+16,1,4+h%5,'#5a4a3a');}
   if(top){ // per-area cap
    if(area==='garden'){artR(c,x,y,16,5,cap);artR(c,x,y,16,1,capHi);for(let k=0;k<16;k+=3)artR(c,x+k,y-2+(artH(k,col)%3),1,3,capHi);artR(c,x,y+5,16,1,capLo);}
    else if(area==='water'){artR(c,x,y,16,4,cap);artR(c,x,y,16,1,capHi);for(let k=0;k<16;k+=4)if(artH(col,k)%2)artR(c,x+k,y+4,3,2+artH(k,row)%3,cap);artR(c,x,y+1,16,1,'#d6fff0');}
    else if(area==='tower'){artR(c,x,y,16,5,cap);artR(c,x,y,16,1,capHi);artR(c,x,y+4,16,1,capLo);artR(c,x+3,y+2,1,1,'#fff1c2');artR(c,x+12,y+2,1,1,'#fff1c2');}
    else if(area==='library'){artR(c,x,y,16,5,cap);artR(c,x,y,16,1,capHi);for(let k=2;k<16;k+=5)artR(c,x+k,y+1,3,1,'#b98a58');artR(c,x,y+5,16,1,capLo);}
    else if(area==='star'){artR(c,x,y,16,4,cap);artR(c,x,y,16,1,capHi);artR(c,x,y+4,16,1,'#c9a858');if(h%5===0)artR(c,x+7,y+1,2,2,'#ffffff');}
    else{artR(c,x,y,16,4,cap);artR(c,x,y,16,1,capHi);artR(c,x,y+4,16,1,capLo);if(h%3===0)artR(c,x+2+h%10,y+1,4,1,capHi);}
    if(lf){artR(c,x,y,2,5,capHi);}if(rt){artR(c,x+14,y,2,5,capLo);}}
  }else if(ch==='='){const L=r.grid[row][col-1]!=='=',R=r.grid[row][col+1]!=='=';
   if(area==='library'||area==='hub'){artR(c,x,y,16,7,'#6b4a2c');artR(c,x,y,16,2,'#d4a46e');artR(c,x,y+6,16,1,'#3a2618');if(L||R){const bx=L?x+1:x+11;artR(c,bx,y+7,4,8,'#4e3424');artR(c,bx,y+7,4,1,'#8f6a42');}}
   else if(area==='tower'){artR(c,x,y,16,6,'#3a3a52');artR(c,x,y,16,2,'#c7ae78');for(let k=2;k<16;k+=4)artR(c,x+k,y+2,2,4,'#17172a');artR(c,x,y+6,16,2,'#26263a');if(col%2===0){c.strokeStyle='#4a4a66';c.beginPath();c.moveTo(x,y+8);c.lineTo(x+8,y+13);c.lineTo(x+16,y+8);c.stroke();}}
   else if(area==='water'){artR(c,x,y,16,6,'#2f5a6e');artR(c,x,y,16,2,'#7fd3df');for(let k=1;k<16;k+=3)artR(c,x+k,y+2,1,4,'#173342');artR(c,x,y+6,16,4,'#24484e');artR(c,x,y+7,16,1,'#4f8f8c');if(L||R)artR(c,L?x:x+12,y+6,4,4,'#a46b45');}
   else if(area==='star'){artR(c,x,y,16,6,'#3a4579');artR(c,x,y,16,2,'#eef0ff');artR(c,x+1,y+6,14,2,'rgba(150,180,255,.45)');artR(c,x+3,y+8,10,1,'rgba(150,180,255,.25)');}
   else{artR(c,x,y,16,7,faceLo);artR(c,x,y,16,3,cap);artR(c,x,y,16,1,capHi);artR(c,x,y+7,16,1,deep);if(L||R){const bx=L?x+1:x+10;artR(c,bx,y+7,5,4,face);artR(c,bx+1,y+11,3,3,face);artR(c,bx,y+7,5,1,faceHi);}}
  }}
}

// ---------------------------------------------------------------- build & cache
const ART_CACHE={};
function artBuild(id){const r=MR[id];if(ART_CACHE[id])return ART_CACHE[id];const A=ART[r.area]||ART.mansion,lights=[],shafts=[];
 const back=mkCanvas(r.w,r.h),front=mkCanvas(r.w,r.h),bc=back.getContext('2d'),fc=front.getContext('2d');bc.imageSmoothingEnabled=fc.imageSmoothingEnabled=false;
 if(A.wall){artBackWall(bc,r,A);artWindows(bc,r,A,lights,shafts);artPilasters(bc,r,A);artTrims(bc,r,A);}
 artScenesBack(bc,r,A);if(A.wall)artProps(bc,r,A,lights);
 artTiles(fc,r,A);artScenesFront(fc,r,A);
 for(const[k,x,y]of r.decor||[])if(k==='C')lights.push({x,y:y-8,r:70,warm:1});
 for(const p of MANSION_PROPS[id]||[])if(p[0]==='candle')lights.push({x:p[1],y:p[2]-14,r:46,warm:1,flick:1});
 if(r.cp)lights.push({x:r.cp[0],y:r.cp[1]-27,r:64,blue:1});
 if(MANSION_PORTALS[id])lights.push({x:MANSION_PORTALS[id].x,y:MANSION_PORTALS[id].y-24,r:72,blue:1});
 for(const d of r.doors)lights.push({x:d.x,y:d.y-40,r:34,warm:1});
 return ART_CACHE[id]={back,front,lights,shafts,A,motes:Array.from({length:Math.ceil(r.w*r.h/9000)},(_,i)=>[artH(i,1)%r.w,artH(i,2)%r.h,(artH(i,3)%100)/100])};}

// open-sky arches: cut tall arched openings out of the cached back wall so the far layer shows (observatory / keiko)
function artOpenArches(c,r,A){const W=r.w,H=r.h,[,,hi,mor,trim,trimHi]=A.wall;c.save();
 for(let y0=0;y0<H;y0+=240)for(let x0=24;x0<W-40;x0+=128){const w=Math.min(88,W-x0-24),top=y0+40,bot=Math.min(H,y0+176);if(w<40)continue;const rr=w/2;
  c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(x0,bot);c.lineTo(x0,top+rr);c.arc(x0+rr,top+rr,rr,Math.PI,0);c.lineTo(x0+w,bot);c.closePath();c.fill();
  c.globalCompositeOperation='source-over';c.strokeStyle=trim;c.lineWidth=4;c.stroke();c.strokeStyle=trimHi+'88';c.lineWidth=1;c.stroke();
  if(r.area==='keiko'&&artH(x0,y0)%3===0){c.fillStyle=mor;for(let k=0;k<6;k++)c.fillRect(x0+artH(k,x0)%w,top+rr*.6+artH(x0,k)%40,6+artH(k,y0)%10,5);} // crumbled stones
  c.fillStyle=hi;c.fillRect(x0-4,bot-6,w+8,6);}
 c.restore();}
// ---------------------------------------------------------------- per-frame layers
function artFar(r,cx,cy,view){const A=ART[r.area]||ART.mansion,W=view.w,H=view.h,t=M.t;
 if(!A.far)return false;
 if(A.far==='night'||A.far==='stars'){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,A.far==='stars'?'#0a0d26':'#0b1530');gr.addColorStop(1,A.far==='stars'?'#26205a':'#2a3a62');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<70;i++){const x=((artH(i,11)%997)-cx*.04)%W,y=(artH(i,12)%(H*.8))-cy*.03;const tw=(t+i*17)%90<6;mrect((x+W)%W,y,tw?2:1,tw?2:1,i%5?'#9fb4e0':'#ffe9b0');}
  if(A.far==='stars'){g.globalAlpha=.25;for(let i=0;i<4;i++){g.fillStyle=['#6a4aa8','#2f6aa8','#8a4a9a','#3a5ab0'][i];g.beginPath();g.ellipse((artH(i,5)%W)-cx*.05,60+i*40-cy*.04,70,22,.3,0,7);g.fill();}g.globalAlpha=1;}
  g.fillStyle='#e8e4c8';g.beginPath();g.arc(W*.72-cx*.02,48-cy*.02,18,0,7);g.fill();g.fillStyle='rgba(232,228,200,.15)';g.beginPath();g.arc(W*.72-cx*.02,48-cy*.02,30,0,7);g.fill();
  if(mansionBackdrop&&A.far==='night'){g.globalAlpha=.55;const bw=320,off=-Math.round(cx*.18)%bw;for(let i=-1;i<2;i++)g.drawImage(mansionBackdrop,off+i*bw,-Math.round(cy*.12),bw,240);g.globalAlpha=1;}
  else{g.fillStyle='#10142e';for(let i=0;i<12;i++){const x=((i*70-cx*.2)%(W+70)+W+70)%(W+70)-35,h=60+artH(i,4)%70;g.fillRect(x,H-h-cy*.06+40,26,h+80);g.beginPath();g.moveTo(x-4,H-h-cy*.06+40);g.lineTo(x+13,H-h-cy*.06+12);g.lineTo(x+30,H-h-cy*.06+40);g.fill();}}
 }else if(A.far==='moonGarden'){const far=artBgImg('wander_far'),mid=artBgImg('wander_mid');
  if(far){const iw=far.width*(H/far.height),off=-((cx*.06)%iw);for(let x=off;x<W;x+=iw)g.drawImage(far,x,-cy*.02,iw,H);}
  else{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0a1028');gr.addColorStop(1,'#2a3456');g.fillStyle=gr;g.fillRect(0,0,W,H);for(let i=0;i<60;i++){const x=(((artH(i,31)%997)-cx*.04)%W+W)%W;mrect(x,artH(i,32)%(H*.7),1,1,i%3?'#c8d4f0':'#fff2c8');}
   g.fillStyle='#f4f0d8';g.beginPath();g.arc(W*.7-cx*.02,52,22,0,7);g.fill();g.fillStyle='rgba(244,240,216,.12)';g.beginPath();g.arc(W*.7-cx*.02,52,40,0,7);g.fill();}
  if(mid){const ih=H,iw=mid.width*(ih/mid.height),off=-((cx*.2)%iw);for(let x=off;x<W;x+=iw)g.drawImage(mid,x,-((cy*.05)%40),iw,ih);}
  else{for(let i=-1;i<8;i++){const x=((i*90-cx*.2)%90+90)%90+i*90-90,y=H-110-cy*.06;g.fillStyle='#161c34';g.fillRect(x,y,12,160);g.fillRect(x+50,y+20,12,140);g.beginPath();g.arc(x+31,y+6,31,Math.PI,0);g.lineTo(x+62,y+10);g.lineTo(x,y+10);g.fill();g.fillStyle='#1d2a3e';for(let k=0;k<5;k++){g.beginPath();g.arc(x+artH(i,k)%80,H-40-cy*.06+artH(k,i)%20,14+artH(i,k+3)%10,0,7);g.fill();}g.fillStyle='#e8a8c8';for(let k=0;k<4;k++)mrect(x+artH(k,i+2)%80,H-56-cy*.06+artH(i,k+5)%24,2,2,'#f0b8d0');}}
 }else if(A.far==='cosmos'){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#070620');gr.addColorStop(.6,'#1a1246');gr.addColorStop(1,'#2a1a52');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<90;i++){const x=(((artH(i,21)%997)-cx*.05)%W+W)%W,y=(artH(i,22)%(H*.9))-cy*.03;const tw=(t+i*13)%100<7;mrect(x,y,tw?2:1,tw?2:1,i%4?'#b8b0ff':'#fff0c0');}
  const ox=W*.5-cx*.08,oy=H*.42-cy*.05;g.strokeStyle='rgba(190,160,255,.22)';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.ellipse(ox,oy,46*k,18*k,-.25,0,7);g.stroke();}
  g.save();g.translate(ox,oy);g.rotate(t*.002);g.strokeStyle='rgba(255,226,140,.18)';for(let k=0;k<12;k++){g.rotate(Math.PI/6);g.beginPath();g.moveTo(30,0);g.lineTo(150,0);g.stroke();}g.restore();
  g.strokeStyle='rgba(215,184,255,.45)';for(let c=0;c<3;c++){const bx=((c*150-cx*.12)%(W+150)+W+150)%(W+150)-60,by=30+c*34-cy*.04;g.beginPath();for(let j=0;j<5;j++){const px=bx+artH(c,j)%60,py=by+artH(j,c+7)%40;j?g.lineTo(px,py):g.moveTo(px,py);}g.stroke();for(let j=0;j<5;j++)mrect(bx+artH(c,j)%60-1,by+artH(j,c+7)%40-1,3,3,'#fff6d0');}
  g.fillStyle='#0e0a26';for(let i=-1;i<9;i++){const x=((i*72-cx*.25)%72+72)%72+i*72-72;g.fillRect(x,H-90-cy*.08,52,140);for(let yy=H-84;yy<H+40;yy+=16)mrect(x+3,yy-cy*.08,46,2,'#241c4a');g.beginPath();g.arc(x+26,H-90-cy*.08,26,Math.PI,0);g.fill();}
 }else if(A.far==='stacks'){mrect(0,0,W,H,'#120b16');for(let L=0;L<2;L++){const sp=L?.35:.18,col=L?'#251a2c':'#1a1220';for(let i=-1;i<10;i++){const x=((i*60-cx*sp)%60+60)%60+i*60-60;g.fillStyle=col;g.fillRect(x,20-cy*sp*.3,44,H+40);for(let yy=30;yy<H;yy+=18)mrect(x+2,yy-cy*sp*.3,40,2,L?'#3a2a35':'#2a1d2a');}}
  g.globalAlpha=.08;mrect(0,0,W,H,'#ffb060');g.globalAlpha=1;
 }else if(A.far==='gears'){mrect(0,0,W,H,'#14142a');const gr=g.createRadialGradient(W/2,H*.4,10,W/2,H*.4,W);gr.addColorStop(0,'rgba(120,90,40,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<6;i++){const x=((i*110-cx*.25)%660+660)%660-120,y=(i%3)*90+40-cy*.2,rad=28+(i%3)*14;artGear(g,x,y,rad,10+i%3*2,t*.004*(i%2?1:-1)*(40/rad),'#262640','#34344e');}
  for(let i=0;i<3;i++){const x=((i*170+60-cx*.35)%510+510)%510-60;mrect(x,0,2,H,'#3a3a52');mrect(x-6,(t*.6+i*80)%(H+40)-20,14,10,'#4a4a66');}
 }else if(A.far==='cavern'){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#06121a');gr.addColorStop(1,'#0e3140');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=-1;i<6;i++){const x=((i*96-cx*.22)%96+96)%96+i*96-96;g.fillStyle='#0b2230';g.fillRect(x,30-cy*.1,14,H);g.beginPath();g.arc(x+55,90-cy*.1,48,Math.PI,0);g.lineTo(x+103,30-cy*.1);g.lineTo(x+7,30-cy*.1);g.fill();}
  for(let i=0;i<4;i++){const x=((i*80+30-cx*.3)%320+320)%320;g.globalAlpha=.35;mrect(x,0,3,H,'#6fd0e0');g.globalAlpha=1;for(let k=0;k<6;k++)mrect(x,((t*2+k*41+i*13)%H),3,6,'#c8faff');}
  g.globalAlpha=.4;for(let x=0;x<W;x+=8)mrect(x,H-26+Math.sin((x+t)*.05)*2,8,1,'#7fe0ec');g.globalAlpha=1;
 }
 return true;}
const artLightCv=mkCanvas(330,310),artLc=artLightCv.getContext('2d');
function artLighting(r,cx,cy,view){const art=artBuild(M.room),A=art.A,W=Math.ceil(view.w),H=Math.ceil(view.h),t=M.t;
 // god-rays from windows
 g.globalCompositeOperation='lighter';
 for(const s of art.shafts){if(s.x>cx+W||s.x+s.w+70<cx)continue;g.fillStyle='rgba(120,150,255,.07)';g.beginPath();g.moveTo(s.x,s.y);g.lineTo(s.x+s.w,s.y);g.lineTo(s.x+s.w+50,s.y+s.h+80);g.lineTo(s.x+34,s.y+s.h+80);g.closePath();g.fill();}
 // dust motes drifting through the light
 for(const[x0,y0,p]of art.motes){const x=x0+Math.sin(t*.01+p*9)*14,y=(y0-t*(.1+p*.15)%r.h+r.h)%r.h;if(x<cx||x>cx+W||y<cy||y>cy+H)continue;g.fillStyle=r.area==='water'?'rgba(150,255,240,.35)':'rgba(255,230,180,.28)';g.fillRect(Math.round(x),Math.round(y),1,1);}
 // colored glows
 for(const L of art.lights){const x=L.x,y=L.y,rr=L.r*.8*(L.flick?1+Math.sin(t*.13+L.x)*.06:1);if(x<cx-rr||x>cx+W+rr||y<cy-rr||y>cy+H+rr)continue;
  const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,L.warm?'rgba(255,160,70,.2)':L.blue?'rgba(90,200,255,.2)':'rgba(110,140,255,.1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}
 g.globalCompositeOperation='source-over';
 // darkness with holes punched by lights and the player
 if(A.dark>0){const lc=artLc;lc.globalCompositeOperation='source-over';lc.clearRect(0,0,330,310);lc.fillStyle='rgba(4,4,16,'+A.dark+')';lc.fillRect(0,0,W,H);lc.globalCompositeOperation='destination-out';
  const all=art.lights.concat([{x:M.x,y:M.y-14,r:84,s:.8}]);
  for(const L of all){const x=L.x-cx,y=L.y-cy,rr=L.r*(L.flick?1+Math.sin(t*.11+L.x)*.05:1);if(x<-rr||x>W+rr||y<-rr||y>H+rr)continue;const gr=lc.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(0,0,0,'+(L.s||.95)+')');gr.addColorStop(.55,'rgba(0,0,0,'+((L.s||.95)*.5)+')');gr.addColorStop(1,'rgba(0,0,0,0)');lc.fillStyle=gr;lc.fillRect(x-rr,y-rr,rr*2,rr*2);}
  g.drawImage(artLightCv,0,0,W,H,cx,cy,W,H);}
 // low fog
 if(r.area==='water'||r.area==='garden'||r.area==='library'){const col=r.area==='water'?'120,220,230':r.area==='garden'?'170,190,220':'180,140,200';
  for(let band=0;band<r.h;band+=240){const fy=band+200;if(fy<cy-40||fy>cy+H+40)continue;const gr=g.createLinearGradient(0,fy-40,0,fy+40);gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(.6,'rgba('+col+',.12)');gr.addColorStop(1,'rgba('+col+',.04)');g.fillStyle=gr;g.fillRect(cx,fy-40,W,80);
   for(let i=0;i<5;i++){const x=cx+((i*83+t*(.15+i*.05))%(W+120))-60;g.fillStyle='rgba('+col+',.06)';g.beginPath();g.ellipse(x,fy+6+Math.sin(t*.01+i)*4,50,9,0,0,7);g.fill();}}}
}
// entry points called by mansionRoomDraw
const ART_BG={};function artBgImg(n){if(ART_BG[n]===undefined){ART_BG[n]=null;if(typeof Image==='function'){const im=new Image();im.onload=()=>{ART_BG[n]=im;};im.src='assets/bg/'+n+'.png';}}return ART_BG[n];}
function artDrawFar(r,cx,cy,view){return artFar(r,cx,cy,view);}
function artDrawBack(r,cx,cy,view){const a=artBuild(M.room),w=Math.min(Math.ceil(view.w)+1,r.w-Math.max(0,cx)),h=Math.min(Math.ceil(view.h)+1,r.h-Math.max(0,cy));if(w>0&&h>0)g.drawImage(a.back,Math.max(0,cx),Math.max(0,cy),w,h,Math.max(0,cx),Math.max(0,cy),w,h);}
function artDrawFront(r,cx,cy,view){const a=artBuild(M.room),w=Math.min(Math.ceil(view.w)+1,r.w-Math.max(0,cx)),h=Math.min(Math.ceil(view.h)+1,r.h-Math.max(0,cy));if(w>0&&h>0)g.drawImage(a.front,Math.max(0,cx),Math.max(0,cy),w,h,Math.max(0,cx),Math.max(0,cy),w,h);}
