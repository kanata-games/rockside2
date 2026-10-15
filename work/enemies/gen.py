# 海音の冒険2 雑魚敵スプライト生成（Pillow + numpy, 手続き的ドット描画）
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
OUT='/workspace/rockside2/assets/enemies'; WORK='/workspace/rockside2/work/enemies'
# 共通パレット: 素材(1-8)は3段階(明/中/暗)、20以降は固定色
MAT={1:[(96,92,176),(58,54,124),(32,30,74)],      # IND 藍
     2:[(228,232,246),(168,176,204),(106,114,148)],# SIL 月光銀
     3:[(170,108,212),(112,58,156),(64,30,94)],    # PUR 紫
     4:[(255,112,118),(206,40,64),(122,16,42)],    # RED 赤
     5:[(176,224,252),(76,152,218),(32,80,152)],   # WAT 水
     6:[(240,228,196),(214,196,160),(156,134,104)],# PAP 紙
     7:[(156,106,94),(110,70,72),(70,42,52)],      # BRN 革/木
     8:[(58,40,86),(38,26,60),(22,14,38)]}         # DRK 闇
FIX={20:(12,8,24),21:(255,255,255),22:(255,64,84),23:(255,218,112),24:(244,240,255),25:(204,146,255),26:(242,238,226),27:(92,10,34)}
IND,SIL,PUR,RED,WAT,PAP,BRN,DRK=range(1,9)
OL=20
PALETTE=[c for m in MAT.values() for c in m]+list(FIX.values())

def shade(C,lighten=False):
    h,w=C.shape; out=np.zeros((h,w,4),np.uint8)
    P=np.pad(C,1)
    for y in range(h):
        for x in range(w):
            m=C[y,x]
            if m==0: continue
            if m in MAT:
                up=P[y,x+1]; dn=P[y+2,x+1]; rt=P[y+1,x+2]
                t=1
                if up!=m: t=0
                elif dn!=m or rt==0: t=2
                if lighten:
                    col=FIX[24] if t==0 else MAT[m][t-1]
                else: col=MAT[m][t]
            else:
                col=FIX[m]
                if lighten and m==OL: col=MAT[IND][2]
            out[y,x]=(*col,255)
    return out
def outline(A):
    a=A[...,3]>0; p=np.pad(a,1)
    n=p[:-2,1:-1]|p[2:,1:-1]|p[1:-1,:-2]|p[1:-1,2:]
    o=n&~a; A=A.copy(); A[o]=(*FIX[OL],255); return A
class F:
    def __init__(s,w,h): s.im=Image.new('L',(w,h),0); s.d=ImageDraw.Draw(s.im)
    def r(s,x0,y0,x1,y1,m): s.d.rectangle([x0,y0,x1,y1],fill=m)
    def e(s,x0,y0,x1,y1,m): s.d.ellipse([x0,y0,x1,y1],fill=m)
    def p(s,pts,m): s.d.polygon(pts,fill=m)
    def l(s,x0,y0,x1,y1,m,w=1): s.d.line([x0,y0,x1,y1],fill=m,width=w)
    def px(s,x,y,m):
        if 0<=x<s.im.width and 0<=y<s.im.height: s.im.putpixel((x,y),m)
    def arr(s): return np.array(s.im)
def render(C,lighten=False): return outline(shade(C,lighten))
def shift(C,dx,dy):
    o=np.zeros_like(C); h,w=C.shape
    ys=slice(max(dy,0),h+min(dy,0)); yd=slice(max(-dy,0),h+min(-dy,0))
    xs=slice(max(dx,0),w+min(dx,0)); xd=slice(max(-dx,0),w+min(-dx,0))
    o[ys,xs]=C[yd,xd]; return o
def spark(A,x,y,c,big=False):
    h,w=A.shape[:2]
    pts=[(0,0),(1,0),(-1,0),(0,1),(0,-1)] if big else [(0,0)]
    for dx,dy in pts:
        if 0<=x+dx<w and 0<=y+dy<h: A[y+dy,x+dx]=(*FIX[c],255)
def death(C,seed=1):
    rng=np.random.default_rng(seed); h,w=C.shape
    ys,xs=np.nonzero(C); cy,cx=ys.mean(),xs.mean()
    fr=[]
    A=render(C); m=(A[...,3]>0)&(np.any(A[...,:3]!=FIX[OL],axis=-1)); A[m]=(*FIX[24],255); fr.append(A)
    for k,dist in ((1,2),(2,4)):
        O=np.zeros_like(C)
        for by in range(0,h,4):
            for bx in range(0,w,4):
                blk=C[by:by+4,bx:bx+4]
                if not blk.any() or (k==2 and rng.random()<0.45): continue
                vx,vy=bx+2-cx,by+2-cy; n=math.hypot(vx,vy) or 1
                tx=int(round(bx+vx/n*dist*k*0.8)); ty=int(round(by+vy/n*dist*k*0.8-(k-1)))
                for yy in range(blk.shape[0]):
                    for xx in range(blk.shape[1]):
                        if blk[yy,xx] and 0<=ty+yy<h and 0<=tx+xx<w: O[ty+yy,tx+xx]=blk[yy,xx]
        A=render(O)
        for _ in range(3*k): spark(A,int(rng.integers(1,w-1)),int(rng.integers(1,h-1)),25 if k==1 else 23,True)
        fr.append(A)
    A=np.zeros((h,w,4),np.uint8)
    for _ in range(6): spark(A,int(np.clip(cx+rng.normal(0,w/4),1,w-2)),int(np.clip(cy+rng.normal(0,h/4)-2,1,h-2)),int(rng.choice([25,24,23])),bool(rng.random()<.5))
    fr.append(A); return fr
def hurt(C):
    return [render(shift(C,-1,0),True),render(shift(C,-1,0))]

# ---------------- ARMOR 40x36 ----------------
AW,AH=40,36
def armor(leg=0,dy=0,dx=0,spear='up',shield='front',glint=False,eye=22):
    f=F(AW,AH); b=dx
    # spear behind
    if spear=='up':
        f.l(9+b,4+dy,9+b,34,BRN); f.p([(8+b,4+dy),(10+b,4+dy),(9+b,0+dy)],SIL); f.r(8+b,5+dy,10+b,5+dy,SIL)
    elif spear=='back':
        f.l(1+b,20+dy,22+b,20+dy,BRN); f.p([(22+b,19+dy),(22+b,21+dy),(26+b,20+dy)],SIL)
    elif spear=='thrust':
        f.l(10+b,19+dy,33+b,19+dy,BRN); f.p([(33+b,17+dy),(33+b,21+dy),(39,19+dy)],SIL); f.r(32+b,17+dy,32+b,21+dy,PUR)
    # legs
    l1,l2=(12,18) if leg==0 else ((10,19) if leg==1 else (14,17))
    ly1=1 if leg==1 else 0; ly2=1 if leg==2 else 0
    f.r(l1+b,27+dy,l1+2+b,34-ly1,IND); f.r(l1-1+b,33-ly1,l1+3+b,35-ly1,DRK)
    f.r(l2+b,27+dy,l2+2+b,34-ly2,IND); f.r(l2+b,33-ly2,l2+4+b,35-ly2,DRK)
    # torso
    f.p([(11+b,16+dy),(22+b,16+dy),(21+b,27+dy),(12+b,27+dy)],IND)
    f.r(12+b,25+dy,21+b,26+dy,BRN); f.r(16+b,17+dy,17+b,24+dy,SIL)
    f.e(9+b,15+dy,15+b,20+dy,SIL)  # pauldron
    # helmet + plume
    f.p([(13+b,7+dy),(10+b,2+dy),(15+b,4+dy),(17+b,6+dy)],PUR)
    f.e(12+b,6+dy,22+b,16+dy,SIL); f.r(14+b,13+dy,21+b,16+dy,SIL)
    f.r(16+b,10+dy,22+b,11+dy,OL); f.px(19+b,10+dy,eye); f.px(20+b,10+dy,eye)
    f.r(18+b,13+dy,18+b,15+dy,OL)
    if spear=='up': f.e(8+b,19+dy,10+b,21+dy,SIL)
    elif spear in('back','thrust'): f.e((12 if spear=='back' else 20)+b,18+dy,(14 if spear=='back' else 22)+b,20+dy,SIL)
    # shield
    sx,sy={'front':(21,16),'raised':(24,12),'aside':(18,21),'pulled':(13,18)}[shield]
    sx+=b; sy+=dy
    f.p([(sx,sy),(sx+6,sy),(sx+6,sy+11),(sx+3,sy+15),(sx,sy+11)],SIL)
    f.p([(sx+1,sy+1),(sx+5,sy+1),(sx+5,sy+10),(sx+3,sy+13),(sx+1,sy+10)],PUR)
    f.r(sx+3,sy+3,sx+3,sy+9,RED); f.r(sx+2,sy+5,sx+4,sy+5,RED)
    C=f.arr()
    return C
def armor_frames():
    fr=[];A={}
    def add(name,Cs):
        A[name]=list(range(len(fr),len(fr)+len(Cs)))
        for C in Cs: fr.append(C if C.ndim==3 else render(C))
    base=armor()
    add('idle',[base,armor(dy=1)])
    add('move',[armor(leg=1),armor(),armor(leg=2,dy=0),armor(dy=1)])
    add('guard',[armor(shield='raised',dy=1),armor(shield='raised',dy=1,eye=21)])
    add('telegraph',[armor(spear='back',shield='aside',dx=-1),armor(spear='back',shield='aside',dx=-2,glint=True,dy=1)])
    t2=armor(spear='back',shield='aside',dx=-2,dy=1); T=render(t2); spark(T,24,21,23,True); fr[-1]=T
    add('attack',[armor(spear='thrust',shield='pulled',dx=1,leg=2),armor(spear='thrust',shield='pulled',dx=1,leg=2),armor(spear='back',shield='front')])
    add('hurt',hurt(base)); add('death',death(base,3))
    return fr,A
# ---------------- CRAWLER 20x14 ----------------
CW,CH=20,14
def crawler(ph=0,dx=0,rear=0,snap=None):
    f=F(CW,CH); b=dx
    # legs
    for i,lx in enumerate((4,8,12)):
        o=(1 if (i+ph)%2 else -1)
        f.l(lx+b,9,lx+b+o,12,DRK); f.px(lx+b+o+o,12,DRK)
    # body segments
    f.e(1+b,4,8+b,10,PUR); f.e(5+b,3,12+b,10,IND); f.e(9+b,3-rear,15+b,9-rear,PUR)
    f.l(3+b,7,6+b,7,SIL); f.l(7+b,6,10+b,6,SIL)
    # head
    hy=6-rear*2
    f.e(13+b,hy,17+b,hy+4,IND); f.px(16+b,hy+1,22); f.px(15+b,hy+1,22)
    f.l(15+b,hy,18+b,hy-3,OL); f.px(18+b,hy-3,25)
    if snap=='open': f.px(18+b,hy+1,SIL); f.px(18+b,hy+4,SIL); f.px(18+b,hy+2,27)
    elif snap=='shut': f.l(17+b,hy+3,19+b,hy+3,SIL)
    else: f.px(18+b,hy+3,SIL)
    return f.arr()
def crawler_frames():
    fr=[];A={}
    def add(n,Cs):
        A[n]=list(range(len(fr),len(fr)+len(Cs))); fr.extend(C if C.ndim==3 else render(C) for C in Cs)
    base=crawler()
    add('idle',[base,crawler(ph=1)])
    add('move',[crawler(0),crawler(1,dx=0),crawler(0,dx=0),crawler(1)])
    add('telegraph',[crawler(rear=1,snap='open',dx=-1),crawler(rear=2,snap='open',dx=-2)])
    add('attack',[crawler(snap='shut',dx=1),crawler(snap='open',dx=0)])
    add('hurt',hurt(base)); add('death',death(base,5)); return fr,A
# ---------------- TURRET 24x24 ----------------
TW,TH=24,24
def turret(dy=0,fl=0,charge=0,recoil=0,flash=False):
    f=F(TW,TH); y=dy; b=-recoil
    # thruster flame
    f.p([(9+b,17+y),(13+b,17+y),(11+b,21+y+fl)],PUR); f.px(11+b,18+y,25); f.px(11+b,19+y,25)
    # barrel
    f.r(15+b,10+y,20+b,13+y,IND); f.r(19+b,9+y,20+b,14+y,SIL)
    # hull
    f.e(4+b,4+y,18+b,18+y,SIL); f.e(6+b,6+y,16+b,16+y,IND)
    f.p([(4+b,11+y),(1+b,8+y),(1+b,14+y)],PUR)   # fin
    f.p([(10+b,4+y),(12+b,1+y),(13+b,5+y)],PUR)   # spike
    # lens
    f.e(9+b,9+y,14+b,14+y,DRK); f.e(10+b,10+y,13+b,13+y,RED)
    f.px(11+b,10+y,21 if charge else 23)
    C=f.arr(); A=render(C)
    if charge: 
        for (sx,sy) in [(21,11),(21,12)][:charge]: spark(A,sx+b,sy+y,25,charge>1)
    if flash:
        for (sx,sy,c) in [(21,11,21),(21,12,21),(22,11,23),(22,12,23),(23,11,23),(23,12,23),(22,10,23),(22,13,23),(21,9,25),(21,14,25),(23,10,25),(23,13,25)]:
            A[sy+y,sx]=(*FIX[c],255)
    return C,A
def turret_frames():
    fr=[];A={}
    def add(n,As): A[n]=list(range(len(fr),len(fr)+len(As))); fr.extend(As)
    base,_=turret()
    hov=[turret(0,0)[1],turret(1,1)[1],turret(1,0)[1],turret(0,1)[1]]
    add('idle',hov[:2]); add('move',hov)
    add('telegraph',[turret(charge=1)[1],turret(charge=2,fl=1)[1]])
    add('attack',[turret(recoil=1,flash=True)[1],turret(recoil=1)[1]])
    add('hurt',hurt(base)); add('death',death(base,7)); return fr,A
def bullet():
    out=[]
    for k in range(2):
        f=F(8,8); f.e(1,1,6,6,PUR); f.e(2,2,5,5,25 if k==0 else 24); f.px(3,3,21)
        out.append(render(f.arr()))
    return out
# ---------------- BAT 20x16 ----------------
BW,BH=20,16
def bat(wing='up',dy=0,swoop=False,eye=22,fang=False):
    f=F(BW,BH); y=dy
    if swoop:
        f.p([(9,6+y),(1,3+y),(3,7+y),(6,9+y)],IND); f.p([(10,5+y),(3,1+y),(5,5+y)],PUR)
        f.e(8,6+y,15,12+y,PUR); f.p([(12,6+y),(13,3+y),(14,6+y)],PUR)
        f.px(13,8+y,eye); f.px(15,10+y,26); f.px(14,11+y,26)
        return f.arr()
    # wings
    if wing=='up':
        f.p([(8,8+y),(2,1+y),(1,5+y),(3,9+y)],IND); f.p([(12,8+y),(18,1+y),(19,5+y),(17,9+y)],IND)
    elif wing=='mid':
        f.p([(8,8+y),(1,6+y),(2,10+y),(5,10+y)],IND); f.p([(12,8+y),(19,6+y),(18,10+y),(15,10+y)],IND)
    elif wing=='down':
        f.p([(8,8+y),(3,14+y),(6,12+y),(8,13+y)],IND); f.p([(12,8+y),(17,14+y),(14,12+y),(12,13+y)],IND)
    elif wing=='spread':
        f.p([(8,7+y),(0,3+y),(1,9+y),(4,8+y),(6,11+y)],IND); f.p([(12,7+y),(19,3+y),(19,9+y),(16,8+y),(14,11+y)],IND)
    f.e(7,6+y,13,13+y,PUR); f.p([(7,7+y),(7,3+y),(9,6+y)],PUR); f.p([(13,7+y),(13,3+y),(11,6+y)],PUR)
    f.px(9,9+y,eye); f.px(11,9+y,eye)
    if fang: f.px(9,11+y,26); f.px(11,11+y,26)
    return f.arr()
def bat_frames():
    fr=[];A={}
    def add(n,Cs): A[n]=list(range(len(fr),len(fr)+len(Cs))); fr.extend(render(C) for C in Cs)
    fl=[bat('up',1),bat('mid',1),bat('down',2),bat('mid',1)]
    base=bat('mid',1)
    add('idle',fl); add('move',fl)
    add('telegraph',[bat('spread',0,fang=True),bat('spread',-1,eye=21,fang=True)])
    add('attack',[bat(swoop=True,dy=1),bat(swoop=True,dy=3)])
    fr_h=hurt(base); A['hurt']=[len(fr),len(fr)+1]; fr.extend(fr_h)
    d=death(base,9); A['death']=list(range(len(fr),len(fr)+4)); fr.extend(d); return fr,A
# ---------------- BOOK 20x20 ----------------
KW,KH=20,20
def book(open_=0,dy=0,dx=0,sq=0,eye='sleep'):
    f=F(KW,KH); y=dy; b=dx
    top=7+sq; bot=19
    # lower half (cover + pages)
    f.r(3+b,top+3+y,16+b,bot+y-(0 if dy==0 else 0),PUR); f.r(4+b,top+3+y,16+b,bot-1+y,PAP)
    f.r(3+b,bot+y,16+b,bot+y,PUR); f.r(2+b,top+3+y,3+b,bot+y,DRK)
    for yy in range(top+4,bot-1,2): f.l(6+b,yy+y,16+b,yy+y,PAP)
    # upper cover hinged at left (2,top+3)
    hx,hy=3+b,top+3+y; ang=math.radians([0,25,45,60][open_])
    L=15; tx=hx+L*math.cos(ang); ty=hy-L*math.sin(ang)
    nx,ny=-math.sin(ang)*-4,-math.cos(ang)*4
    if open_:
        f.p([(hx,hy),(tx,ty),(17+b,hy)],27)
        f.p([(hx,hy),(tx,ty),(tx+nx,ty+ny),(hx+nx,hy+ny)],PUR)
        for k in range(3):
            t=0.45+0.18*k; f.px(int(hx+(tx-hx)*t+1),int(hy+(ty-hy)*t+1),26)
        for k,xx in enumerate((8,11,14)): f.px(xx+b,hy,26); f.px(xx+b,hy-1,26)
        f.l(hx+2,hy-1,hx+6,hy-2-open_,RED)
        ex,ey=int(hx+(tx-hx)*0.5+nx*0.6),int(hy+(ty-hy)*0.5+ny*0.6)
        f.px(ex,ey,22); f.px(ex+1,ey,22)
        f.px(int(tx),int(ty),SIL)
    else:
        f.r(3+b,top+y,16+b,top+3+y,PUR); f.r(2+b,top+y,3+b,top+3+y,DRK); f.r(12+b,top+1+y,14+b,top+2+y,SIL)
        f.px(16+b,top+y,SIL); f.px(16+b,bot+y,SIL)
        if eye=='sleep': f.l(7+b,top+2+y,10+b,top+2+y,OL)
        else: f.r(7+b,top+1+y,10+b,top+2+y,26); f.r(8+b,top+1+y,9+b,top+2+y,22)
    return f.arr()
def book_frames():
    fr=[];A={}
    def add(n,Cs): A[n]=list(range(len(fr),len(fr)+len(Cs))); fr.extend(render(C) for C in Cs)
    base=book()
    add('idle',[base,book(sq=1)])
    add('move',[book(sq=1,eye='open'),book(dy=-4,eye='open'),book(dy=-2,eye='open'),book(sq=1,eye='open')])
    add('telegraph',[book(open_=1),book(open_=2,dy=0)])
    add('attack',[book(open_=3,dx=2,dy=-2),book(open_=1,dx=3)])
    A['hurt']=[len(fr),len(fr)+1]; fr.extend(hurt(book(eye='open')))
    A['death']=list(range(len(fr),len(fr)+4)); fr.extend(death(base,11)); return fr,A
# ---------------- SLIME 18x18 ----------------
SW,SH=18,18
def slime(w=6,h=6,dy=0,tip=4,eye='norm',dx=0):
    f=F(SW,SH); cx=8+dx; bot=17+dy
    f.e(cx-w,bot-2*h,cx+w,bot,WAT)
    f.p([(cx-w+2,bot-h-1),(cx,bot-h-tip-h//2),(cx+w-2,bot-h-1)],WAT)
    f.px(cx-w+2,bot-h-1,21); f.px(cx-w+3,bot-h-2,21); f.px(cx-w+2,bot-h,21)
    ey=bot-h+1
    if eye=='angry': f.px(cx+1,ey,22); f.px(cx+4,ey,22); f.px(cx,ey-1,OL); f.px(cx+5,ey-1,OL)
    elif eye=='shut': f.l(cx,ey,cx+1,ey,OL); f.l(cx+3,ey,cx+4,ey,OL)
    else: f.r(cx+1,ey-1,cx+1,ey,OL); f.r(cx+4,ey-1,cx+4,ey,OL)
    return f.arr()
def slime_frames():
    fr=[];A={}
    def add(n,Cs): A[n]=list(range(len(fr),len(fr)+len(Cs))); fr.extend(render(C) for C in Cs)
    base=slime()
    add('idle',[base,slime(w=7,h=5,tip=4)])
    add('move',[slime(w=7,h=4,tip=3),slime(w=5,h=6,dy=-4,tip=5),slime(w=6,h=5,dy=-2),slime(w=7,h=4,tip=3)])
    add('fall',[slime(w=3,h=4,dy=-6,tip=6),slime(w=4,h=5,dy=-3,tip=5),slime(w=8,h=3,tip=2,eye='shut')])
    add('telegraph',[slime(w=7,h=4,tip=2,eye='angry'),slime(w=8,h=3,tip=2,eye='angry')])
    add('attack',[slime(w=5,h=6,dy=-4,tip=6,eye='angry',dx=2),slime(w=7,h=4,eye='angry',dx=2,tip=3)])
    A['hurt']=[len(fr),len(fr)+1]; fr.extend(hurt(slime(eye='shut')))
    A['death']=list(range(len(fr),len(fr)+4)); fr.extend(death(base,13)); return fr,A

def bbox(A):
    ys,xs=np.nonzero(A[...,3]); return int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())
MS={'idle':(220,True),'move':(110,True),'guard':(160,True),'fall':(90,False),'telegraph':(180,False),'attack':(90,False),'hurt':(70,False),'death':(90,False)}
SPEC={
 'armor':dict(fn=armor_frames,ground=True,attack_box=[30,16,10,7],active=[0,1],notes='spear thrust; shield blocks from the front during guard'),
 'crawler':dict(fn=crawler_frames,ground=True,attack_box=[14,2,6,9],active=[0],notes='drawn on the floor facing right. For walls/ceilings the game rotates the frame 90/180/270 deg around (cx, feet_y).',rotate=True),
 'turret':dict(fn=turret_frames,ground=False,attack_box=None,active=[],notes='flying; idle/move = hover. Fires turret_bullet.png from projectile_spawn on attack frame 0.',spawn={'attack':{'frame':0,'x':22,'y':11,'sprite':'turret_bullet.png','dir':'facing'}}),
 'bat':dict(fn=bat_frames,ground=False,attack_box=[8,6,9,8],active=[0,1],notes='flying; swoop = game moves it diagonally down toward the hero during attack'),
 'book':dict(fn=book_frames,ground=True,attack_box=[10,2,9,14],active=[0],notes='mimic book; idle closed (sleepy eye), move = hop, telegraph opens jaws'),
 'slime':dict(fn=slime_frames,ground=True,attack_box=[8,6,9,10],active=[0],notes='water drop; fall = drop from ceiling (play once, then idle)'),
}
def main():
    sheets={}
    for name,s in SPEC.items():
        fr,A=s['fn'](); h,w=fr[0].shape[:2]
        sheet=np.concatenate(fr,axis=1); Image.fromarray(sheet,'RGBA').save(f'{OUT}/{name}.png')
        x0,y0,x1,y1=bbox(fr[A['idle'][0]])
        anims={k:{'frames':v,'ms':MS[k][0],'loop':MS[k][1]} for k,v in A.items()}
        anims['attack']['active']=s['active']
        j={'image':f'{name}.png','frame':{'w':w,'h':h},'count':len(fr),
           'anchor':{'cx':(x0+x1+1)//2,'feet_y':y1+1,'note':'feet_y = first empty row under the feet' if s['ground'] else 'flyer: anchor is body bottom-centre; place by centre'},
           'facing':'right (house convention: all frames face right, flip for left — see src/02b_chars.js)',
           'animations':anims,
           'hitbox':{'body':[x0+2,y0+2,x1-x0-3,y1-y0-3],'attack':s['attack_box'],'format':'[x,y,w,h] in frame px, mirror x when flipped'},
           'notes':s['notes']}
        if s.get('spawn'): j['projectile_spawn']=s['spawn']; j['projectile']={'image':'turret_bullet.png','frame':{'w':8,'h':8},'frames':[0,1],'ms':80,'loop':True,'hitbox':[2,2,4,4]}
        if s.get('rotate'): j['wall_rotation']={'floor':0,'right_wall':-90,'ceiling':180,'left_wall':90,'pivot':'cx,feet_y'}
        if name=='armor': j['hitbox']['guard_block']=[22,10,8,18]
        json.dump(j,open(f'{OUT}/{name}.json','w'),ensure_ascii=False,indent=1)
        sheets[name]=(sheet,A,w,h)
    b=bullet(); Image.fromarray(np.concatenate(b,axis=1),'RGBA').save(f'{OUT}/turret_bullet.png')
    # preview 6x
    S=6; k=Image.open('/workspace/rockside2/assets/kanon.png').convert('RGBA').crop((0,0,32,32))
    rows=[('kanon (hero)',np.array(k))]+[(n,v[0]) for n,v in sheets.items()]+[('turret_bullet',np.concatenate(b,axis=1))]
    W=max(r[1].shape[1] for r in rows)*S+20; H=sum(r[1].shape[0]*S+30 for r in rows)+10
    P=Image.new('RGBA',(W,H),(70,66,96,255)); d=ImageDraw.Draw(P); y=10
    for n,a in rows:
        d.text((10,y),n+(f'  frames {a.shape[1]//sheets[n][2]} @ {sheets[n][2]}x{sheets[n][3]}' if n in sheets else ''),fill=(255,255,255))
        im=Image.fromarray(a,'RGBA').resize((a.shape[1]*S,a.shape[0]*S),Image.NEAREST)
        P.alpha_composite(im,(10,y+14))
        if n in sheets:
            fw=sheets[n][2]
            for i in range(a.shape[1]//fw): d.rectangle([10+i*fw*S,y+14,10+(i+1)*fw*S-1,y+14+a.shape[0]*S-1],outline=(100,96,130))
        y+=a.shape[0]*S+30
    P.save(f'{WORK}/preview_6x.png')
    # 1x preview on dark bg
    Q=Image.new('RGBA',(400,40),(40,36,60,255)); x=2
    for n,a in rows[:-1]:
        f=a[:, :sheets[n][2]] if n in sheets else a
        Q.alpha_composite(Image.fromarray(np.ascontiguousarray(f),'RGBA'),(x,38-f.shape[0])); x+=f.shape[1]+4
    Q.resize((800,80),Image.NEAREST).save(f'{WORK}/preview_1x_x2.png')
main()
