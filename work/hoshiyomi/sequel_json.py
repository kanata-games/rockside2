import json,numpy as np
from PIL import Image,ImageDraw
exec(open('sequel.py').read().split("A=key(")[0])
J=json.load(open(W+'_frames.json')); fd,fn=J['fd'],J['fn']
SD=Image.open(AS+'hoshiyomi_dark-sequel.png'); SN=Image.open(AS+'hoshiyomi-sequel.png')
def cell(S,f):x,y,w,h=f['rect'];return np.array(S.crop((x,y,x+w,y+h)))
def body(S,f):
    cm=charmask(cell(S,f)); ys,xs=np.where(cm)
    # trim outliers (hair tips / arms) with percentiles
    x0,x1=np.percentile(xs,[4,96]);y0=ys.min()
    return [int(x0),int(y0),int(x1-x0),int(f['anchor'][1]-y0)]
def yel(S,f,ymax=512):
    c=cell(S,f);r,g,b,a=[c[...,i].astype(int) for i in range(4)]
    m=(a>128)&(r>200)&(g>180)&(b<170); m[ymax:]=False; ys,xs=np.where(m)
    return [int(xs.mean()),int(ys.mean())],[int(xs.min()),int(ys.min()),int(xs.max()-xs.min()),int(ys.max()-ys.min())]
for f in fd+fn: f['hitbox']=body(SD if f in fd else SN,f)
wind,_=yel(SD,fd[4]); shot,_=yel(SD,fd[5]); rain,rbox=yel(SD,fd[6],200)
D={"image":"hoshiyomi_dark-sequel.png","frameWidth":512,"frameHeight":512,"scale":J['SCALE'],
 "displayHeight":"立ち姿 頭頂〜足 %dpx（ネイティブ）× %.4f ≈ 54px"%(J['NH'],J['SCALE']),
 "facing":"right","anchorNote":"anchor＝足元（ブーツ底の中心）。全フレーム anchor.y=500、立ち姿の頭頂〜足は約440px にそろえてある。座標はすべてネイティブのセル内座標（左向きは x → 511-x）",
 "character":"闇落ち星詠みちゃん。黒髪に紫のメッシュ・赤く光る目・花の髪飾り・黒いクロップトップとショートパンツ・肩を落としたジャケット（灰ラベンダー）・厚底ブーツ・紫の闇のもや",
 "frames":fd,
 "animations":{
  "idle":{"frames":[0,1],"ms":[420,420],"loop":True},
  "walk":{"frames":[2,3],"ms":[220,220],"loop":True,"note":"原画2枚のみ。歩きは2コマ交互"},
  "shootWindup":{"frames":[4],"ms":[360],"loop":False,"note":"手元に紫のもやと星をためる（予備動作）"},
  "shootStar":{"frames":[5],"ms":[260],"loop":False,"active":[5],"note":"星弾を放つ瞬間。手先の星はスプライトに描かれている（弾を出したらゲーム側で消す演出は不要、すぐ次に戻してよい）"},
  "starRainCast":{"frames":[6],"ms":[700],"loop":False,"active":[6],"note":"両手を掲げ、頭上に星。保持して詠唱にする"},
  "dash":{"frames":[7],"ms":[120],"loop":True,"active":[7],"note":"突進。後ろに紫のもやの尾"},
  "hurt":{"frames":[8],"ms":[320],"loop":False},
  "defeat":{"frames":[9],"ms":[1200],"loop":False,"note":"ひざをつく"}},
 "spawn":{"starShot":{"frame":5,"x":shot[0],"y":shot[1],"note":"star_small_a/b の発生点（突き出した手の先の星の中心）"},
   "windupHand":{"frame":4,"x":wind[0],"y":wind[1],"note":"ためている星の位置（チャージ演出用）"},
   "starRain":{"frame":6,"x":rain[0],"y":rain[1],"box":rbox,"note":"頭上の星の群れの中心。star_big_fall は画面上端から降らせる想定"}},
 "hitboxes":{"body":"各フレームの hitbox [x,y,w,h]（ネイティブ。もや・髪先・星は含まない）",
   "dashContact":{"frame":7,"rect":fd[7]['hitbox'],"note":"突進中の接触ダメージ"}},
 "source":"work/hoshiyomi/raw/A.jpg（0-7）, raw/B.jpg（8-9）→ work/hoshiyomi/sequel.py"}
N={"image":"hoshiyomi-sequel.png","frameWidth":512,"frameHeight":512,"scale":J['SCALE'],"facing":"right",
 "anchorNote":"anchor＝足元。anchor.y=500、頭頂〜足 約440px（×scale ≈ 54px）","character":"星詠みちゃん（正気に戻った姿・広間の強化役）。白いジャケット",
 "frames":fn,"animations":{"idle":{"frames":[0,1],"ms":[500,500],"loop":True,"note":"1は0を縦に約3px縮めた呼吸の上下"},
   "peace":{"frames":[2],"ms":[900],"loop":False,"note":"ピース＋ウインク＋キラッ"}},
 "source":"work/hoshiyomi/raw/B.jpg（列3・4）"}
json.dump(D,open(AS+'hoshiyomi_dark-sequel.json','w'),ensure_ascii=False,indent=1)
json.dump(N,open(AS+'hoshiyomi-sequel.json','w'),ensure_ascii=False,indent=1)
print('spawn',shot,wind,rain)
# contact sheet
U=Image.open(AS+'umine-walk.png'); us=0.195*48/128
sc=J['SCALE']
C=Image.new('RGBA',(1900,1400),(52,50,70,255));d=ImageDraw.Draw(C)
d.text((10,5),'native (1/4 size shown) - dark-sequel 10 frames / sequel 3 frames, cyan=feet y500, red=hitbox, yellow=spawn',fill='white')
allf=[(SD,f) for f in fd]+[(SN,f) for f in fn]
for i,(S,f) in enumerate(allf):
    x,y=(i%7)*270+5,(i//7)*290+25
    c=Image.fromarray(cell(S,f)).resize((256,256),Image.LANCZOS);C.alpha_composite(c,(x,y))
    d.rectangle([x,y,x+255,y+255],outline=(90,90,110));d.line([x,y+250,x+255,y+250],fill='cyan')
    hx,hy,hw,hh=f['hitbox'];d.rectangle([x+hx/2,y+hy/2,x+(hx+hw)/2,y+(hy+hh)/2],outline='red')
    d.text((x+3,y+258),'%s %d %s'%('dark' if S is SD else 'norm',i if S is SD else i-10,f['name']),fill='white')
for p in (shot,wind,rain):
    pass
# true display size row: umine-walk frame0 + all frames at scale, also x3 nearest
y0=620;d.text((10,y0),'TRUE DISPLAY SIZE (1x) and 4x nearest: umine-walk (game scale %.4f) | hoshiyomi scale %.4f'%(us,sc),fill='white')
row=Image.new('RGBA',(14*60,80),(40,38,56,255))
uw=U.crop((0,0,615,639));uw=uw.resize((round(615*us),round(639*us)),Image.LANCZOS)
row.alpha_composite(uw,(5,80-4-round(612*us)))
for i,(S,f) in enumerate(allf):
    c=Image.fromarray(cell(S,f)).resize((round(512*sc),round(512*sc)),Image.LANCZOS)
    row.alpha_composite(c,(60+i*58-round(256*sc)+30,76-round(500*sc)))
C.alpha_composite(row,(10,y0+20));C.alpha_composite(row.resize((row.width*2,row.height*2),0) ,(10,y0+110))
r4=row.crop((0,0,300,80)).resize((1200,320),0);C.alpha_composite(r4,(10,y0+280))
for k,p in enumerate(['face_dark_256.png','face_256.png']):
    C.alpha_composite(Image.open(W+p).resize((128,128)),(1260+k*140,y0+280))
    fc=Image.open(AS+['hoshiyomi_dark_face.png','hoshiyomi_face.png'][k]);C.alpha_composite(fc,(1260+k*140,y0+420));C.alpha_composite(fc.resize((96,96),0),(1290+k*140,y0+420))
C.save(W+'contact_sequel.png')
# measure umine height
ua=np.array(U.crop((0,0,615,639)))[...,3];ys=np.where(ua.any(1))[0];print('umine native h',ys.max()-ys.min(),'disp',(ys.max()-ys.min())*us)
