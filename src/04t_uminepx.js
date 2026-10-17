// =====================================================================
//  test.61: pixel-art in-game Umine (素材づくり担当): assets/umine_px.png + umine_px.json — 64x64 cells, drawn 1:1,
//  nearest, mirrored for left; soles at y=59 (ground line y=60), body centre x=32. Hitbox stays MC 14x26.
//  Old painted sheets (umine-sheet.jpeg / umine-walk.png / umine-mansion-actions.png) remain the fallback, and the
//  dark style keeps the old dark sheets until a dark pixel version is approved.
// =====================================================================
const UPX={img:null,meta:null,flip:null};
(function(){if(typeof Image!=='function')return;const im=new Image();im.onload=()=>{UPX.img=im;upxBuildFlip();};im.src='assets/umine_px.png';
 if(typeof fetch==='function')fetch('assets/umine_px.json').then(r=>r.ok?r.json():null).then(j=>{if(j&&j.anims)UPX.meta=j;}).catch(()=>{});})();
function upxBuildFlip(){if(typeof mkCanvas!=='function')return;const im=UPX.img,c=mkCanvas(im.width,im.height),p=c.getContext('2d');if(!p||!p.scale)return;
 // mirror each 64px cell in place so frame coordinates stay the same
 p.imageSmoothingEnabled=false;const cw=64,cols=Math.floor(im.width/cw);for(let i=0;i<cols;i++){p.save();p.translate((i+1)*cw,0);p.scale(-1,1);p.drawImage(im,i*cw,0,cw,im.height,0,0,cw,im.height);p.restore();}UPX.flip=c;}
function upxReady(){return !!(UPX.img&&UPX.meta);}
// draw anim frame with the soles on 'feet' and the body centre on x; face<0 mirrors
function upxDraw(anim,fi,x,feet,face){const A=UPX.meta.anims[anim];if(!A)return false;const [cw,ch]=UPX.meta.cell||[64,64],[fx,fy]=UPX.meta.feet||[32,60];
 const col=(A.startFrame||0)+fi,src=face<0&&UPX.flip?UPX.flip:UPX.img,sx=col*cw,dx=Math.round(x)-(face<0?cw-fx:fx),dy=Math.round(feet)-fy;
 g.drawImage(src,sx,A.row*ch,cw,ch,dx,dy,cw,ch);return true;}
function upxLoop(anim,t){const A=UPX.meta.anims[anim];return Math.floor(t*A.fps/60)%A.frames;}
// mansion player → animation state (also tracked: landing, hurt start, wall-kick start, blink)
function upxMansionPick(){const S=M._upx||(M._upx={land:0,hurtT:99,prevHurt:0,kickT:99,prevKick:0,wasAir:false,blink:0});
 if(M.hurt>S.prevHurt+10)S.hurtT=0;else S.hurtT++;S.prevHurt=M.hurt;
 if(M.kickLock>=5&&S.prevKick<5)S.kickT=0;else S.kickT++;S.prevKick=M.kickLock;
 if(M.ground&&S.wasAir)S.land=6;else if(S.land>0)S.land--;S.wasAir=!M.ground;
 const moving=M.ground&&Math.abs(M.vx)>.1,t=M.t;
 if(S.hurtT<18)return['hurt',Math.min(1,S.hurtT>>3),1];
 if(M.slideT)return['slide',upxLoop('slide',t),1];
 if(!M.ground&&S.kickT<12)return['wallkick',Math.min(1,S.kickT/6|0),M.lastWall===-1?-1:1,true];
 if(!M.ground&&M.wall)return['wall',upxLoop('wall',t),M.wall===-1?-1:1,true];
 if(!M.ground)return M.poseT?['airshoot',upxLoop('airshoot',t),1]:M.vy<0?['jump',M.vy<-2.5?0:1,1]:['fall',upxLoop('fall',t),1];
 if(S.land>0&&!M.poseT)return['fall',2,1,false,true];
 if(moving)return M.poseT?['runshoot',upxLoop('runshoot',t),1]:['run',Math.floor(M.walkDistance/7)%6,1];
 if(M.poseT)return['shoot',upxLoop('shoot',t),1];
 const blink=(t%200)<4;return blink?['blink',0,1]:['idle',upxLoop('idle',t),1];}
// returns true when the pixel sprite was drawn (caller falls back to the old sheets otherwise)
function upxMansionDraw(){if(!upxReady()||(typeof mansionDarkOn==='function'&&mansionDarkOn()))return false;const [anim,fi,dirMode,wallSide,landing]=upxMansionPick();
 // wall art has the wall on her RIGHT: unflipped when the wall is on the right
 const face=wallSide?(dirMode===1?1:-1):M.face;if(landing){const A=UPX.meta.anims.fall;return upxDraw('fall',A.landFrame??2,M.x,M.y,face);}
 return upxDraw(anim,fi,M.x,M.y,face);}
// classic stages (first-game engine)
function upxClassicDraw(x,y,white){if(!upxReady()||white)return false;const moving=P.onGround&&Math.abs(P.vx)>.1,t=frame;
 const pick=P.hurt>0?['hurt',(t>>3)&1]:!P.onGround?(P.shootT>0?['airshoot',upxLoop('airshoot',t)]:P.vy<0?['jump',0]:['fall',upxLoop('fall',t)]):moving?(P.shootT>0?['runshoot',upxLoop('runshoot',t)]:['run',Math.floor(P.animT*1.8/7)%6]):P.shootT>0?['shoot',upxLoop('shoot',t)]:['idle',upxLoop('idle',t)];
 return upxDraw(pick[0],pick[1],x,y,P.face);}
