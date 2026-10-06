// Sequel-only model layer. Original body physics remain unchanged for comparison.
const SEQUEL_MODEL = {size:48, frames:[], walkFrames:[], loading:true, failure:null, cell:128, cx:64, feet:124, muzzleX:105, muzzleY:80};
try {const saved=Number(localStorage.getItem('rockside2_model_size'));if([32,40,48].includes(saved))SEQUEL_MODEL.size=saved;}catch{}
function setSequelModel(size){if(![32,40,48].includes(size))throw new Error('Unknown model size');SEQUEL_MODEL.size=size;try{localStorage.setItem('rockside2_model_size',String(size));}catch{}refreshSequelModel();}
function refreshSequelModel(){document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.model)===SEQUEL_MODEL.size)));document.getElementById('modelState').textContent=SEQUEL_MODEL.failure?'素材読込失敗':SEQUEL_MODEL.loading?'読込中':'サイズ比較';}
for(const b of document.querySelectorAll('[data-model]'))b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setSequelModel(Number(b.dataset.model));});
function sequelMuzzle(){const d=SEQUEL_MODEL,s=d.size/d.cell;return{x:P.x+P.w/2+P.face*(d.muzzleX-d.cx)*s,y:P.y+P.h+(d.muzzleY-d.feet)*s};}
function drawSequelAt(fi,cx,feet,face,white,size=SEQUEL_MODEL.size){const d=SEQUEL_MODEL,sp=d.frames[fi];if(!sp)return;const s=size/d.cell,ox=face>=0?d.cx:d.cell-d.cx;g.drawImage(pick(sp,face,white),Math.round(cx-ox*s),Math.round(feet-d.feet*s),size,size);}
// Four ordered walk poses; one cycle per 43.2 world pixels at normal speed.
function sequelWalkFrame(distance){return Math.floor(Math.max(0,distance)/10.8)%4;}
function drawSequelWalk(distance,cx,feet,face,white,size=SEQUEL_MODEL.size){
 const d=SEQUEL_MODEL,sp=d.walkFrames[sequelWalkFrame(distance)];
 if(!sp){drawSequelAt(2+(sequelWalkFrame(distance)%2),cx,feet,face,white,size);return;}
 const scale=size/d.cell;g.drawImage(pick(sp,face,white),Math.round(cx-d.cx*scale),Math.round(feet-d.feet*scale),size,size);
}
function loadSequelWalk(){const img=new Image();img.onload=()=>{
 const feet=[612,614,590,588],frames=[];
 for(let i=0;i<4;i++){const c=mkCanvas(128,128),p=c.getContext('2d');p.imageSmoothingEnabled=false;
 p.drawImage(img,(i%2)*615,Math.floor(i/2)*639,615,639,64-330*.195,124-feet[i]*.195,615*.195,639*.195);frames.push(sheetSprite(c));}
 SEQUEL_MODEL.walkFrames=frames;
 };img.src='assets/umine-walk.png';}
function drawSequelPlayer(camX,white){const x=P.x+P.w/2-camX,y=P.y+P.h;
 if(P.hurt<=0&&P.onGround&&Math.abs(P.vx)>.1){drawSequelWalk(P.animT*1.8,x,y,P.face,white);return;}
 const fi=P.hurt>0?0:!P.onGround?(P.vy<0?4:5):P.shootT>0?6:(frame>>5)&1;drawSequelAt(fi,x,y,P.face,white);}
function stripConnectedWhite(c){const p=c.getContext('2d'),data=p.getImageData(0,0,c.width,c.height),d=data.data,seen=new Uint8Array(c.width*c.height),q=new Int32Array(c.width*c.height);let head=0,tail=0;function push(x,y){const n=y*c.width+x;if(seen[n])return;seen[n]=1;const k=n*4;if(d[k]>225&&d[k+1]>225&&d[k+2]>225)q[tail++]=n;}for(let x=0;x<c.width;x++){push(x,0);push(x,c.height-1);}for(let y=0;y<c.height;y++){push(0,y);push(c.width-1,y);}while(head<tail){const n=q[head++],x=n%c.width,y=Math.floor(n/c.width);d[n*4+3]=0;if(x)push(x-1,y);if(x<c.width-1)push(x+1,y);if(y)push(x,y-1);if(y<c.height-1)push(x,y+1);}p.putImageData(data,0,0);}
function loadSequelModel(){const img=new Image();img.onload=()=>{try{const anchors=[[210,410],[208,410],[219,410],[234,410],[200,328],[205,328],[206,344],[241,344]];const frames=[];for(let i=0;i<8;i++){const c=mkCanvas(384,i<4?416:352),p=c.getContext('2d');p.drawImage(img,(i%4)*384,i<4?0:416,384,c.height,0,0,384,c.height);stripConnectedWhite(c);const cell=mkCanvas(128,128),cg=cell.getContext('2d');cg.imageSmoothingEnabled=false;cg.drawImage(c,64-anchors[i][0]*.29,124-anchors[i][1]*.29,384*.29,c.height*.29);frames.push(sheetSprite(cell));}SEQUEL_MODEL.frames=frames;SEQUEL_MODEL.loading=false;refreshSequelModel();}catch(e){SEQUEL_MODEL.failure=e.message;SEQUEL_MODEL.loading=false;refreshSequelModel();}};img.onerror=()=>{SEQUEL_MODEL.failure='Image unavailable';SEQUEL_MODEL.loading=false;refreshSequelModel();};img.src='umine-sheet.jpeg';}
refreshSequelModel();loadSequelModel();loadSequelWalk();
