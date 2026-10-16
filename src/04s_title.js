// =====================================================================
//  test.59: title screen 「海音ちゃんの冒険2」 — Umine in front, the moonlit mansion behind.
//  Art from 素材づくり担当 (optional, loaded if present): assets/title/title.json + title_bg.png (+ title_bg_portrait.png),
//  title_umine.png, title_logo.png. Until they exist, a procedural fallback is drawn: night sky (twinkling stars, moon),
//  a mansion façade in the in-game 'mansion' stage-art palette (ART.mansion), garden hedges, the 48px sequel sprite
//  scaled up with an idle bob, and the logo set in Dela Gothic One (subset, SIL OFL) on the hi-res screen layer.
//  title.json (all optional): {"umine":{"x":70,"feet":226,"h":150},"logo":{"x":128,"y":40,"w":210},"bgParallax":6}
// =====================================================================
let titlePageState=null;
const TITLE_TEXT='海音ちゃんの冒険2';
const TITLE_ART={bg:null,bgPortrait:null,umine:null,logo:null,cfg:{},tried:false};
function titleArtLoad(){if(TITLE_ART.tried||typeof Image!=='function')return;TITLE_ART.tried=true;let left=4;if(typeof window!=='undefined')window.__titleArtSettled=false;const settle=()=>{if(--left<=0&&typeof window!=='undefined')window.__titleArtSettled=true;};
 const img=(k,f)=>{const im=new Image();im.onload=()=>{TITLE_ART[k]=im;titlePageBg();settle();};im.onerror=settle;im.src='assets/title/'+f;};
 img('bg','title_bg.png');img('bgPortrait','title_bg_portrait.png');img('umine','title_umine.png');img('logo','title_logo.png');
 try{if(typeof fetch==='function')fetch('assets/title/title.json').then(r=>r.ok?r.json():null).then(j=>{if(j)TITLE_ART.cfg=j;}).catch(()=>{});}catch(e){}}
function titleArtUsed(){return{bg:!!TITLE_ART.bg,bgPortrait:!!TITLE_ART.bgPortrait,umine:!!TITLE_ART.umine,logo:!!TITLE_ART.logo};}
// portrait phones: the page around the 256x240 canvas gets the same night (or title_bg_portrait.png) instead of flat black
function titlePageBg(){if(typeof document==='undefined'||!document.body||!document.body.style)return;const on=state==='title';
 document.body.classList?.toggle?.('title-screen',on);
 document.body.style.backgroundImage=on?(TITLE_ART.bgPortrait&&layout.portrait?`url(assets/title/title_bg_portrait.png)`:'radial-gradient(ellipse at 70% 18%,#3a3f7a 0%,#141a3c 38%,#070a1c 100%)'):'';
 document.body.style.backgroundSize=on?'cover':'';document.body.style.backgroundPosition=on?'center':'';}
function titleSky(t){const gr=g.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#070a20');gr.addColorStop(.55,'#1b2150');gr.addColorStop(1,'#3a3466');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
 for(let i=0;i<90;i++){const x=(artH(i,71)%VW+((t*.02*(1+i%3))%VW))%VW,y=artH(i,72)%150,tw=(t+i*23)%120;const big=tw<8;g.globalAlpha=big?1:.45+.4*((artH(i,73)%100)/100);mrect(x,y,big?2:1,big?2:1,i%6?'#bcd0ff':'#fff1c0');}g.globalAlpha=1;
 const mx=196-Math.sin(t/900)*3,my=48;g.fillStyle='rgba(255,240,200,.08)';for(const r of [44,34,27]){g.beginPath();g.arc(mx,my,r,0,7);g.fill();}g.fillStyle='#f6efd2';g.beginPath();g.arc(mx,my,20,0,7);g.fill();
 g.fillStyle='rgba(190,180,150,.35)';for(const[dx,dy,r]of[[-6,-4,4],[5,6,3],[7,-7,2]]){g.beginPath();g.arc(mx+dx,my+dy,r,0,7);g.fill();}
 g.fillStyle='rgba(150,160,200,.12)';for(let i=0;i<3;i++){const cx=((i*110+t*.08)%400)-80;g.beginPath();g.ellipse(cx,70+i*22,60,7,0,0,7);g.fill();}}
function titleMansion(t,par){const W=(ART.mansion||{}).wall||['#18233a','#203049','#2a3b58','#121a2b','#56688a','#a9c3d8'],ox=-par;
 const body='#141c33',roof='#0e1426',edge=W[4];g.save();g.translate(ox,0);
 const blk=(x,y,w,h)=>{mrect(x,y,w,h,body);mrect(x,y,w,1,edge);};
 // wings + main hall + towers
 blk(60,120,200,92);blk(110,96,100,116);mrect(104,92,112,6,roof);
 for(const[x,w,h]of[[78,26,118],[214,26,128]]){blk(x,212-h,w,h);g.fillStyle=roof;g.beginPath();g.moveTo(x-4,212-h);g.lineTo(x+w/2,212-h-30);g.lineTo(x+w+4,212-h);g.fill();mrect(x+w/2,212-h-36,1,7,edge);}
 g.fillStyle=roof;g.beginPath();g.moveTo(104,96);g.lineTo(160,70);g.lineTo(216,96);g.fill();mrect(159,62,2,9,edge);
 // windows: warm, some flicker
 const win=(x,y,w,h,i)=>{const on=(artH(i,91)%5)!==0,fl=on&&((t>>3)+i)%37===0;mrect(x-1,y-1,w+2,h+2,W[3]);mrect(x,y,w,h,on?(fl?'#ffcf7a':'#e9a94a'):'#26304c');if(on){mrect(x,y,w,1,'#ffe2a8');mrect(x+w/2|0,y,1,h,'#7a4a2a');g.globalAlpha=.10;mrect(x-4,y-3,w+8,h+6,'#ffc070');g.globalAlpha=1;}};
 let i=0;for(let r=0;r<2;r++)for(let c=0;c<6;c++)win(68+c*30+(c>2?12:0),132+r*30,8,14,i++);for(let c=0;c<3;c++)win(126+c*26,104,10,16,i++);
 for(const x of[86,222])for(let r=0;r<3;r++)win(x+2,124-(x>200?10:0)+r*26,8,12,i++);
 // round window + door
 g.fillStyle='#ffd88a';g.beginPath();g.arc(160,84,4,0,7);g.fill();mrect(150,186,20,26,'#3a2418');mrect(151,187,18,25,'#e9a94a');mrect(160,187,1,25,'#7a4a2a');
 g.restore();}
function titleGarden(t,par){const S=(ART.garden||{}).stone||['#5f9a5a','#b8e39a','#35603a'];g.save();g.translate(-par,0);
 mrect(-20,206,VW+40,34,'#1d2436');mrect(-20,206,VW+40,2,'#3c4a5e');for(let x=-20;x<VW+20;x+=16)mrect(x+((x/16)&1)*8,214,14,1,'#2a3348');
 for(let k=0;k<9;k++){const x=k*34-10,h=12+artH(k,5)%8;g.fillStyle='#16301f';g.beginPath();g.ellipse(x+14,206-h/2,18,h/2+2,0,0,7);g.fill();g.fillStyle=S[2];g.beginPath();g.ellipse(x+12,205-h/2,14,h/2,0,0,7);g.fill();if(artH(k,8)%3===0)mrect(x+8+artH(k,9)%10,204-h,2,2,'#f0b8d0');}
 for(const x of [40,232]){mrect(x,170,3,40,'#2a2a3a');mrect(x-4,164,11,8,'#3a3a4e');const fl=.75+.25*Math.sin(t/7+x);g.globalAlpha=fl;mrect(x-2,166,7,4,'#ffd27a');g.globalAlpha=.12*fl;g.fillStyle='#ffc070';g.beginPath();g.arc(x+1,168,16,0,7);g.fill();g.globalAlpha=1;}
 g.restore();}
function titleUmine(t){const C=TITLE_ART.cfg.umine||{},bob=Math.round(Math.sin(t/22)*1.5),x=C.x??64,feet=(C.feet??226)+bob;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,(C.feet??226)-1,22-bob,4,0,0,7);g.fill();
 if(TITLE_ART.umine){const im=TITLE_ART.umine,h=C.h??150,w=im.width*h/im.height;g.drawImage(im,Math.round(x-w/2),Math.round(feet-h),Math.round(w),Math.round(h));return;}
 if(SEQUEL_MODEL.frames.length)drawSequelAt(0,x,feet,1,false,120);}
function titleDraw(){titleArtLoad();const t=frame,P=TITLE_ART.cfg.bgParallax??6,par=Math.sin(t/240)*P;
 if(TITLE_ART.bg){const im=TITLE_ART.bg,s=Math.max((VW+P*2)/im.width,VH/im.height),w=im.width*s,h=im.height*s;g.drawImage(im,Math.round((VW-w)/2-par),Math.round((VH-h)/2),Math.round(w),Math.round(h));
  for(let i=0;i<30;i++){const tw=(t+i*41)%150;if(tw<10)mrect(artH(i,81)%VW,artH(i,82)%110,2,2,'#fff6d0');}}
 else{titleSky(t);titleMansion(t,par*.5);titleGarden(t,par);}
 titleUmine(t);
 g.fillStyle='rgba(6,8,22,.55)';g.fillRect(0,0,VW,14);}
// hi-res layer (after blit): logo, subtitle, prompts — crisp on phones
function titleDrawHi(){const s=hiS(),t=frame,L=TITLE_ART.cfg.logo||{},lx=(L.x??150)*s,ly=(L.y??44)*s;sctx.save();
 if(TITLE_ART.logo){const im=TITLE_ART.logo,w=(L.w??200)*s,h=im.height*w/im.width;sctx.drawImage(im,Math.round(lx-w/2),Math.round(ly-h/2),Math.round(w),Math.round(h));}
 else{const font=(typeof CUT_FONT_OK!=='undefined'&&CUT_FONT_OK)?'"DelaCut",'+JP_FONT:'900 '+JP_FONT;let px=Math.round(21*s);sctx.font=px+'px '+font;const maxW=(L.w??196)*s;const mw=sctx.measureText(TITLE_TEXT).width;if(mw>maxW){px=Math.floor(px*maxW/mw);sctx.font=px+'px '+font;}
  sctx.textAlign='center';sctx.textBaseline='middle';sctx.lineJoin='round';
  sctx.lineWidth=Math.max(3,px*.28);sctx.strokeStyle='#120a2a';sctx.strokeText(TITLE_TEXT,lx,ly+px*.06);
  sctx.lineWidth=Math.max(2,px*.14);sctx.strokeStyle='#6a8cff';sctx.strokeText(TITLE_TEXT,lx,ly);
  const gr=sctx.createLinearGradient(0,ly-px/2,0,ly+px/2);gr.addColorStop(0,'#ffffff');gr.addColorStop(.55,'#cfe8ff');gr.addColorStop(1,'#8fd0ff');sctx.fillStyle=gr;sctx.fillText(TITLE_TEXT,lx,ly);
  const sp=(t%180)/180;if(sp<.25){sctx.globalAlpha=1-sp*4;sctx.fillStyle='#fff6c8';const sx=lx-maxW/2+maxW*sp*4;sctx.fillRect(sx-1*s,ly-px*.6,2*s,px*1.2);sctx.fillRect(sx-px*.3,ly-1*s,px*.6,2*s);sctx.globalAlpha=1;}}
 sctx.textAlign='center';sctx.textBaseline='middle';
 const sub=(k,txt,x,y,col,size)=>{sctx.font='700 '+Math.round(size*s)+'px '+JP_FONT;sctx.lineWidth=Math.max(2,2.2*s);sctx.strokeStyle='#0a0c1e';sctx.strokeText(txt,x*s,y*s);sctx.fillStyle=col;sctx.fillText(txt,x*s,y*s);};
 sub(0,'〜 知らない天井と、ふしぎな右手 〜',(L.x??150),(L.y??44)+19,'#ffd6ec',7.5);
 sub(0,'ROCKSIDE II',(L.x??150),(L.y??44)-18,'#ffd84a',6);
 if(((t>>4)&3)!==3)sub(0,'TAP TO START',176,150,'#ffffff',10);sub(0,'OR PRESS ENTER',176,163,'#9fb4e0',6);
 sub(0,'VER '+GAME_VERSION.toUpperCase(),VW-34,233,'#9fb4e0',5.5);
 sctx.restore();}
// ---- full-window art title (used when assets/title/title_bg.png is present): follows title.json (normalised layout,
// separate landscape / portrait sets). Drawn on a viewport-sized canvas behind the DOM buttons; the 256x240 game canvas
// is hidden on the title, and the HARD / ERASE chips are redrawn here at their tap positions.
let titleCv=null,titleCtx=null;
function titleArtOn(){return state==='title'&&!!TITLE_ART.bg;}
function titleCvEnsure(){if(titleCv||typeof document==='undefined'||!document.createElement||!document.body||typeof document.body.appendChild!=='function')return titleCv;const c=document.createElement('canvas');if(!c.getContext)return null;
 c.id='titleCv';Object.assign(c.style,{position:'fixed',left:'0',top:'0',width:'100%',height:'100%',zIndex:'1',pointerEvents:'none',display:'none'});document.body.appendChild(c);titleCv=c;titleCtx=c.getContext('2d');return c;}
function titleCfgSet(port){const c=TITLE_ART.cfg||{},d=port?{logo:{pos:[.5,.06],anchor:[.5,0],widthRatio:.9},umine:{pos:[.5,.9],anchor:[.5,1],heightRatio:.48},pressStart:{pos:[.5,.95],fontHeightRatio:.03}}:{logo:{pos:[.5,.04],anchor:[.5,0],widthRatio:.52},umine:{pos:[.24,1],anchor:[.5,1],heightRatio:.8},pressStart:{pos:[.68,.86],fontHeightRatio:.05}};
 const s=(port?c.portrait:c.landscape)||{};const lo={...d.logo,...(s.logo||{})};if(!port){lo.pos=[Math.max(lo.pos[0],.6),lo.pos[1]];lo.widthRatio=Math.min(lo.widthRatio,.5);}return{logo:lo,umine:{...d.umine,...(s.umine||{})},pressStart:{...d.pressStart,...(s.pressStart||{})}};}
function titleOverlayDraw(){const on=titleArtOn();if(typeof document!=='undefined'&&document.body?.classList)document.body.classList.toggle('title-art',on);
 if(!titleCvEnsure())return;titleCv.style.display=on?'block':'none';if(!on)return;
 const dpr=Math.min(3,window.devicePixelRatio||1),W=window.innerWidth,H=window.innerHeight,cw=Math.round(W*dpr),ch=Math.round(H*dpr);if(titleCv.width!==cw||titleCv.height!==ch){titleCv.width=cw;titleCv.height=ch;}
 const c=titleCtx,t=frame,port=H>W*1.05,L=titleCfgSet(port);c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;
 // background: cover + slow parallax sway
 // test.60: pixel art — nearest-neighbour, integer scale in device pixels (cover: ceil, so no seams), pixel-snapped sway
 const bg=port&&TITLE_ART.bgPortrait?TITLE_ART.bgPortrait:TITLE_ART.bg;c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;
 {const k=Math.max(1,Math.ceil(Math.max(cw/bg.width,ch/bg.height))),bw=bg.width*k,bh=bg.height*k,sw=Math.round(Math.sin(t/300)*Math.min(k*2,(bw-cw)/2));c.drawImage(bg,Math.round((cw-bw)/2)+sw,Math.round((ch-bh)/2),bw,bh);}
 c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;
 for(let i=0;i<34;i++){const tw=(t+i*37)%160;if(tw>=14)continue;const a=1-Math.abs(tw-7)/7,x=artH(i,61)%1000/1000*W,y=artH(i,62)%1000/1000*H*(port?.38:.5),r=(1.2+a*1.6)*(W>700?1.2:1);
  c.globalAlpha=a;c.fillStyle='#fff6d6';c.fillRect(x-r*2,y-.5,r*4,1);c.fillRect(x-.5,y-r*2,1,r*4);c.beginPath();c.arc(x,y,r*.6,0,7);c.fill();}c.globalAlpha=1;
 // logo
 const lg=L.logo;let logoBottom=H*.2;
 if(TITLE_ART.logo){const im=TITLE_ART.logo,want=Math.min(W*lg.widthRatio,H*(port?.3:.42)*im.width/im.height)*dpr,k=Math.max(1,Math.floor(want/im.width)+(want/im.width%1>.8?1:0)),w=im.width*k/dpr,h=im.height*k/dpr,x=Math.round((W*lg.pos[0]-w*lg.anchor[0])*dpr)/dpr,y=Math.round((H*lg.pos[1]-h*lg.anchor[1]+Math.round(Math.sin(t/60)*1.5))*dpr)/dpr;c.drawImage(im,x,y,w,h);logoBottom=y+h;}
 else{const px=Math.min(W*lg.widthRatio/8,H*.11);c.font=`${Math.round(px)}px ${CUT_FONT_OK?'"DelaCut",':''}${JP_FONT}`;c.textAlign='center';c.textBaseline='top';c.lineJoin='round';c.lineWidth=px*.22;c.strokeStyle='#160c34';c.strokeText(TITLE_TEXT,W*lg.pos[0],H*lg.pos[1]);c.fillStyle='#eaf4ff';c.fillText(TITLE_TEXT,W*lg.pos[0],H*lg.pos[1]);logoBottom=H*lg.pos[1]+px*1.2;}
 const txt=(s,x,y,px,col,stroke,al='center')=>{c.font=`700 ${Math.round(px)}px ${JP_FONT}`;c.textAlign=al;c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(3,px*.3);c.strokeStyle=stroke;c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);};
 txt('〜 知らない天井と、ふしぎな右手 〜',W*lg.pos[0],logoBottom+Math.max(12,H*.022),Math.max(12,Math.min(22,H*.026)),'#ffe0f0','#2a0f3a');
 // Umine: idle bob + soft shadow
 const um=L.umine;if(TITLE_ART.umine){const im=TITLE_ART.umine,h=H*um.heightRatio,w=h*im.width/im.height,bob=Math.round(Math.sin(t/26)*2),x=W*um.pos[0]-w*um.anchor[0],y=H*um.pos[1]-h*um.anchor[1];
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x+w/2,y+h-h*.015,w*.28,h*.025,0,0,7);c.fill();c.drawImage(im,x,y+bob,w,h);}
 // press start (slow blink)
 const ps=L.pressStart,fp=Math.max(14,H*ps.fontHeightRatio);c.globalAlpha=.78+.22*Math.sin(t/22);txt('TAP TO START',W*ps.pos[0],H*ps.pos[1],fp,'#ffffff','#5a2a9a');c.globalAlpha=1;
 txt('VER '+GAME_VERSION.toUpperCase(),W-10,H-10-(port?0:0),Math.max(10,Math.min(13,H*.016)),'#c8d6f0','#0a0c1e','right');
 // HARD / ERASE chips at their tap rectangles on the (hidden) game canvas
 const sx=layout.gameW/VW,sy=layout.gameH/VH,chip=(R,label,hot)=>{const x=layout.gameX+R.x*sx,y=layout.gameY+R.y*sy,w=R.w*sx,h=R.h*sy;c.fillStyle=hot?'rgba(110,20,40,.9)':'rgba(12,10,34,.78)';c.fillRect(x,y,w,h);c.strokeStyle=hot?'#ff8aa0':'#7d8ac0';c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);txt(label,x+w/2,y+h/2,Math.max(10,h*.55),hot?'#ffd0d8':'#c8d6f0','#0a0c1e');};
 chip(TITLE_HARD,hardMode?'HARD ON':'HARD OFF',hardMode);if(clearedCount()>0)chip(TITLE_RESET,resetArmT>0?'TAP AGAIN':'ERASE DATA',resetArmT>0);
 // menu buttons: between logo and Umine (portrait) / under the press-start line (landscape)
 const mt=document.getElementById('mTitle');if(mt&&mt.style){mt.style.left=(port?W/2:W*ps.pos[0])+'px';mt.style.top=(port?Math.round(Math.min(H*.42-50,logoBottom+H*.06)):Math.round(H*ps.pos[1]-fp*2.6-40))+'px';}}
