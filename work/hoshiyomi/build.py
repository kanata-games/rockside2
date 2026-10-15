# 星詠みちゃん sprite builder (pixel-drawn, Pillow+numpy). Run: python3 build.py
import json, math, numpy as np
from PIL import Image, ImageDraw
A='/workspace/rockside2/assets/'; W='/workspace/rockside2/work/hoshiyomi/'
PAL_N={'ol':(26,18,32),'hair':(34,26,44),'hairH':(66,52,84),'mesh':(150,80,200),'meshH':(196,140,236),
 'skin':(250,214,196),'skinS':(222,170,160),'eye':(220,30,50),'eyeH':(255,120,120),'top':(30,26,36),'topH':(70,64,84),
 'jk':(244,242,250),'jkS':(196,190,214),'belt':(110,100,120),'boot':(28,24,34),'bootH':(84,76,100),'lace':(170,100,220),
 'flw':(170,110,230),'flwC':(255,220,120),'gold':(250,206,90),'mouth':(200,70,90),'aura':(90,40,130),'aura2':(40,16,60),'glow':(255,60,80)}
PAL_D=dict(PAL_N); PAL_D.update({'skin':(206,168,180),'skinS':(164,128,148),'jk':(214,208,236),'jkS':(146,134,180),
 'hair':(22,14,30),'hairH':(52,34,66),'mesh':(126,52,180),'eye':(255,40,60),'eyeH':(255,170,170),'mouth':(130,40,80)})
class Cv:
    def __init__(s,w,h):s.w,s.h=w,h;s.a=np.zeros((h,w),object);s.a[:]=None
    def px(s,x,y,c):
        x,y=int(round(x)),int(round(y))
        if 0<=x<s.w and 0<=y<s.h:s.a[y,x]=c
    def poly(s,pts,c):
        m=Image.new('L',(s.w,s.h),0);ImageDraw.Draw(m).polygon([(round(x),round(y)) for x,y in pts],fill=1)
        s.a[np.array(m)==1]=c
    def ell(s,cx,cy,rx,ry,c):
        for y in range(s.h):
            for x in range(s.w):
                if ((x-cx)/max(rx,.5))**2+((y-cy)/max(ry,.5))**2<=1:s.a[y,x]=c
    def line(s,p,q,wd,c):
        n=int(max(abs(q[0]-p[0]),abs(q[1]-p[1]))*2)+1
        for i in range(n+1):
            t=i/n;x=p[0]+(q[0]-p[0])*t;y=p[1]+(q[1]-p[1])*t
            r=(wd-1)/2
            for dy in range(-int(r+.5),int(r+.5)+1):
                for dx in range(-int(r+.5),int(r+.5)+1):
                    if dx*dx+dy*dy<=r*r+.6:s.px(x+dx,y+dy,c)
    def outline(s,c='ol'):
        f=np.vectorize(lambda v:v is not None)(s.a);o=np.zeros_like(f)
        o[1:]|=f[:-1];o[:-1]|=f[1:];o[:,1:]|=f[:,:-1];o[:,:-1]|=f[:,1:]
        s.a[o&~f]=c
    def img(s,pal):
        im=np.zeros((s.h,s.w,4),np.uint8)
        for y in range(s.h):
            for x in range(s.w):
                v=s.a[y,x]
                if v is not None:im[y,x]=(*pal[v],255)
        return Image.fromarray(im,'RGBA')
def star(cv,x,y,R,c,ci=None,rot=-90):
    pts=[]
    for i in range(10):
        r=R if i%2==0 else R*0.45;an=math.radians(rot+36*i);pts.append((x+r*math.cos(an),y+r*math.sin(an)))
    cv.poly(pts,c)
    if ci:cv.px(x,y,ci)

def figure(P,S,Wd,Hd,cx,feet,dark,face_mode=None):
    """P: pose dict. S: scale (1.0 = 37px tall). local coords: x right, y up from feet."""
    cv=Cv(Wd,Hd); by=P.get('by',0); lean=P.get('lean',0)
    def T(x,y):  # local->pixel; lean shears upper body
        return (cx+(x+lean*max(y,0)/37)*S, feet-(y+by*(y>14))*S)
    hx,hy=P.get('head',(0.5,31.5)); hx+=P.get('hdx',0); hy+=P.get('hdy',0)
    sway=P.get('sway',0)
    # --- hair back mass
    hb=[T(hx-4.5,hy+4),T(hx+3.5,hy+5.5),T(hx+5,hy+1),T(hx+3+sway*.3,hy-12),T(hx-1+sway,hy-17.5),T(hx-6+sway,hy-15.5),T(hx-7+sway*.6,hy-6),T(hx-6,hy)]
    cv.poly(hb,'hair')
    for k,(a,b) in enumerate([(-5,-13),(-2.5,-15),(2,-11)]):
        cv.line(T(hx+a*.5,hy-2),T(hx+a+sway,hy+b),1,'mesh')
    # --- legs
    def leg(hip,knee,foot,front):
        cv.line(T(*hip),T(*knee),2.6*S/1,'skin' if front else 'skinS')
        cv.line(T(*knee),T(foot[0],foot[1]+4),2.3*S,'skin' if front else 'skinS')
        # boot
        fx,fy=foot
        cv.poly([T(fx-1.8,fy+5.5),T(fx+1.8,fy+5.5),T(fx+2,fy+2),T(fx+3.8,fy+1.5),T(fx+3.8,fy),T(fx-2.3,fy)],'boot')
        cv.line(T(fx-2.3,fy+0.5),T(fx+3.8,fy+0.5),1,'bootH' if front else 'boot')
        for yy in (3,5):cv.px(*T(fx+0.3,fy+yy),'lace')
        if front:cv.line(T(hip[0]*.4+knee[0]*.6-1.3,hip[1]*.4+knee[1]*.6),T(hip[0]*.4+knee[0]*.6+1.3,hip[1]*.4+knee[1]*.6),1,'boot')
    L=P.get('legs',[((-1.3,16.5),(-1.6,9),(-1.8,0)),((1.7,16.5),(2.2,9),(2.4,0))])
    leg(*L[0],False)
    # back arm
    def arm(sh,el,hd,front):
        cv.line(T(*sh),T(*el),max(2.8*S,2.6),'jk' if front else 'jkS')
        cv.line(T(*el),T(*hd),max(2.6*S,2.4),'jk' if front else 'jkS')
        cx2,cy2=T(*hd);ex_,ey_=T(*el);dx,dy=cx2-ex_,cy2-ey_;n=max(1e-3,math.hypot(dx,dy))
        cv.px(cx2-dx/n*1.2,cy2-dy/n*1.2,'top');cv.px(cx2,cy2,'skin');cv.px(cx2+dx/n,cy2+dy/n,'skin')
        cv.px(*T(*el),'jkS')
    AB=P.get('armB',((-2.5,25),(-3.8,21),(-4,17.5)));AF=P.get('armF',((3,25),(5,21.5),(5.6,18)))
    arm(*AB,False)
    if P.get('drape',True):cv.poly([T(-4.2,26),T(-1.5,26),T(-1.2,18.5),T(-5.6,17.2)],'jk'); cv.line(T(-5.4,17.6),T(-1.4,18.8),1,'jkS')
    leg(*L[1],True)
    # --- shorts + belt
    cv.poly([T(-3.6,20),T(3.8,20),T(4.2,15.6),T(0.5,16),T(-3.9,15.4)],'top')
    cv.line(T(-3.6,19.5),T(3.8,19.5),1,'belt'); cv.px(*T(0.8,19.5),'gold')
    cv.line(T(3.9,19),T(4.6,13),1,'mesh')  # hanging purple ribbon
    star(cv,*T(4.7,12),1.3*S,'gold')
    # midriff
    cv.poly([T(-3.2,22.5),T(3.4,22.5),T(3.6,19.8),T(-3.4,19.8)],'skin')
    # crop top / chest
    cv.poly([T(-3.4,26.8),T(3.8,26.8),T(4.3,24.5),T(3.6,22.3),T(-3.2,22.3)],'top')
    cv.line(T(-2,25),T(3,25),1,'topH')
    # neck & choker
    cv.line(T(hx-0.2,hy-4.2),T(hx-0.2,hy-6),2*S,'skin'); cv.line(T(hx-1.2,hy-4.8),T(hx+1,hy-4.8),1,'top')
    # off-shoulder jacket collar on shoulders
    cv.line(T(-3.5,25.5),T(-2.5,23),2.4*S,'jkS'); 
    # --- head
    hcx,hcy=T(hx,hy); r=4.6*S
    cv.ell(hcx,hcy,r,r*1.02,'skin')
    # bangs
    e=P.get('eyes','open')
    cv.poly([(hcx-r-1,hcy+r*.1),(hcx-r*.6,hcy-r-1),(hcx+r*.5,hcy-r-1.2),(hcx+r+.8,hcy-r*.3),(hcx+r+.6,hcy+0.4),(hcx+r*.55,hcy-r*.2),(hcx+r*.25,hcy+0.2),(hcx-.2,hcy-r*.4),(hcx-r*.3,hcy+0.5),(hcx-r*.6,hcy+r*.9)],'hair')
    cv.px(hcx-r*.2,hcy-r*.85,'hairH');cv.px(hcx+r*.3,hcy-r*.9,'hairH')
    cv.line((hcx-r*.75,hcy-r*.3),(hcx-r*.9,hcy+r*1.1),1,'mesh')
    # flower ornament (side of head, viewer-right/top)
    fx,fy=hcx-r*.35,hcy-r*.95
    for dx,dy in((-1,0),(1,0),(0,-1),(0,1)):cv.px(fx+dx,fy+dy,'flw')
    if S>1.3:
        for dx,dy in((-1,-1),(1,1),(1,-1),(-1,1),(-2,0),(2,0),(0,-2),(0,2)):cv.px(fx+dx,fy+dy,'flw')
    cv.px(fx,fy,'flwC')
    # eyes (facing right: front eye near right edge)
    ex,ey=int(round(hcx+r*.45)),int(round(hcy+r*.3)); ex2=int(round(hcx-r*.25))
    if e=='open':
        for x0 in (ex2,ex):
            cv.px(x0,ey-1,'ol');cv.px(x0+1,ey-1,'ol');cv.px(x0,ey,P.get('eyec','eye'))
            if S>1.3:cv.px(x0+1,ey,'eye');cv.px(x0,ey+1,'eye');cv.px(x0+1,ey+1,'eyeH')
    elif e=='wink':
        cv.px(ex2,ey-1,'ol');cv.px(ex2+1,ey-1,'ol');cv.px(ex2,ey,'eye')
        cv.px(ex,ey,'ol');cv.px(ex+1,ey,'ol')
    else:
        for x0 in (ex2,ex):cv.px(x0,ey,'ol');cv.px(x0+1,ey,'ol')
    m=P.get('mouth','smile');my=int(round(hcy+r*.75))
    if m=='open':cv.px(ex-1,my,'mouth');cv.px(ex,my,'mouth');
    elif m=='smile':cv.px(ex,my,'mouth')
    elif m=='frown':cv.px(ex-1,my,'skinS');cv.px(ex,my,'skinS')
    # front arm over body
    arm(*AF,True)
    if P.get('peace'):  # V sign
        hx2,hy2=T(*AF[2]);cv.px(hx2,hy2-1,'skin');cv.px(hx2+1,hy2-2,'skin');cv.px(hx2-1,hy2-2,'skin');cv.px(hx2+1,hy2-3,'skin');cv.px(hx2-1,hy2-3,'skin')
    for st in P.get('handstar',[]):
        star(cv,*T(*st[0]),st[1]*S,'gold','flwC')
    cv.outline()
    if face_mode: return cv
    if dark:
        # glowing eye halo + aura
        f=np.vectorize(lambda v:v is not None)(cv.a)
        rng=np.random.default_rng(P.get('seed',1))
        o=np.zeros_like(f);o[1:]|=f[:-1];o[:-1]|=f[1:];o[:,1:]|=f[:,:-1];o[:,:-1]|=f[:,1:]
        ys,xs=np.where(o&~f)
        for y,x in zip(ys,xs):
            if rng.random()<P.get('aurad',.28):cv.a[y,x]='aura' if rng.random()<.6 else 'aura2'
        for _ in range(P.get('wisps',6)):
            x=cx+rng.integers(-11,12);y=feet-rng.integers(2,34)
            if cv.a[y,x] is None:cv.px(x,y,'aura');cv.px(x,y-1,'aura2')
        # glow on front eye
        if e=='open':
            gx,gy=ex+2,ey
            if cv.a[gy,gx] in (None,'ol','aura','aura2'):cv.px(gx,gy,'glow')
    for fxp in P.get('fx',[]):fxp(cv)
    return cv

# ================= poses =================
def fx_glow(pt,big=False):
    def f(cv):
        x,y=pt
        for dx,dy in((0,-1),(0,1),(-1,0),(1,0)):cv.px(x+dx,y+dy,'flw')
        if big:
            for dx,dy in((0,-2),(0,2),(-2,0),(2,0)):cv.px(x+dx,y+dy,'mesh')
        cv.px(x,y,'flwC')
    return f
def fx_rain(cv):
    for (x,y,r) in((9,6,2.2),(24,3,2.6),(39,7,2.2),(16,1,1.4),(33,2,1.4)):
        star(cv,x,y,r,'gold','flwC') if r>2 else (cv.px(x,y,'flwC'),cv.px(x-1,y,'mesh'),cv.px(x+1,y,'mesh'),cv.px(x,y-1,'mesh'),cv.px(x,y+1,'mesh'))
def fx_trail(cv):
    for y,x0,x1 in((17,3,11),(22,1,9),(27,4,12),(32,2,10),(37,5,11)):
        for x in range(x0,x1):
            if cv.a[y,x] is None:cv.a[y,x]='aura' if x>(x0+x1)//2 else 'aura2'
WALK=[[((-1.3,16.5),(-3,9),(-4.5,0)),((1.7,16.5),(4,9.5),(5,0.6))],
      [((-1.3,16.5),(-0.8,9),(-0.5,1.5)),((1.7,16.5),(2.6,9),(1.6,0))],
      [((-1.3,16.5),(1,9.5),(3.5,0.5)),((1.7,16.5),(0,9),(-2.8,0))]]
DARK=[
 ('idle',dict(seed=1)),
 ('idle',dict(seed=2,by=-0.6,sway=-1,wisps=8)),
 ('move',dict(seed=3,legs=WALK[0],armF=((3,25),(3.6,21),(2.5,17.5)),armB=((-2.5,25),(-2.4,21),(-1,18)))),
 ('move',dict(seed=4,legs=WALK[1],by=0.6,sway=-1)),
 ('move',dict(seed=5,legs=WALK[2],armF=((3,25),(6,21.5),(7.5,18.5)),armB=((-2.5,25),(-5,21.5),(-6.5,18.5)))),
 ('shoot_windup',dict(seed=6,lean=-1.5,armF=((3,25),(-1,23),(-5,24)),mouth='frown',handstar=[((-5,24.5),1.6)])),
 ('shoot_release',dict(seed=7,lean=2,mouth='open',legs=[((-1.3,16.5),(-2.5,9),(-3.5,0)),((1.7,16.5),(4,9),(4.5,0))],armF=((3,25),(7,25),(11,25.2)),fx=[fx_glow((24+12.5,47-25.3),True)])),
 ('star_rain_cast',dict(seed=8,armF=((3,25),(5,29),(5.5,33)),armB=((-2.5,25),(-4.5,29),(-4,33)),mouth='open',hdy=0.3,fx=[fx_glow((30,13)),fx_glow((20,13))])),
 ('star_rain_cast',dict(seed=9,armF=((3,25),(4,30),(3.5,35)),armB=((-2.5,25),(-3,30),(-2,35)),mouth='open',hdy=0.6,wisps=10,aurad=.4,fx=[fx_rain,fx_glow((27.5,10),True)])),
 ('dash',dict(seed=10,lean=6,by=-1.5,sway=-4,legs=[((-1.3,16.5),(-5,10),(-9,4.5)),((1.7,16.5),(5,10.5),(5.5,1.5))],armF=((3,25),(1,21.5),(-2,19)),armB=((-2.5,25),(-6,23),(-9,22)),fx=[fx_trail])),
 ('hurt',dict(seed=11,lean=-3.5,eyes='closed',mouth='open',hdx=-0.5,armF=((3,25),(6,27),(8,29)),armB=((-2.5,25),(-6,26),(-8,28)),aurad=.15)),
 ('defeat',None),
]
def defeat_frame(dark):
    # kneeling, slumped, head down: built from figure with folded legs then lowered
    P=dict(seed=12,eyes='closed',mouth='frown',by=-7,hdx=1.5,hdy=-1.2,lean=2.5,sway=2,wisps=3,aurad=.1,
           legs=[((-1.3,16.5),(3.5,9.5),(-4.5,9.8)),((1.7,16.5),(6,9.8),(0,9.5))],
           armF=((3,25),(5,21),(6.5,17.5)),armB=((-2.5,25),(-2,21),(0,18)))
    return P
def render_dark():
    fr=[]
    for name,P in DARK:
        if P is None:P=defeat_frame(True)
        fr.append((name,figure(P,1.0,48,48,24,47,True).img(PAL_D)))
    return fr
NORM=[('idle',dict()),('idle',dict(by=-0.6,sway=-1)),
 ('peace',dict(armF=((3,25),(7.5,24),(7.5,29)),peace=True,mouth='open')),
 ('peace',dict(armF=((3,25),(7.5,24),(7.5,29)),peace=True,mouth='open',eyes='wink',fx=[lambda cv:(cv.px(27,6,'gold'),cv.px(26,6,'flwC'),cv.px(28,6,'flwC'),cv.px(27,5,'flwC'),cv.px(27,7,'flwC'))]))]
def render_norm():
    return [(n,figure(P,29/37,32,32,16,31,False).img(PAL_N)) for n,P in NORM]

def face(dark):
    S=2.1; cv=figure(dict(drape=False,mouth='smile' if not dark else 'frown'),S,80,120,40,110,dark,face_mode=True)
    hcx=40+0.5*S; hcy=110-31.5*S
    x0=int(round(hcx-12));y0=int(round(hcy-11))
    sub=Cv(24,24);sub.a=cv.a[y0:y0+24,x0:x0+24].copy()
    if dark:
        rng=np.random.default_rng(5)
        for (x,y) in [(1,3),(2,9),(22,5),(21,14),(0,17),(23,20),(3,1)]:
            if sub.a[y,x] is None:sub.a[y,x]='aura'
        ys,xs=np.where(np.vectorize(lambda v:v=='eye')(sub.a))
        for y,x in zip(ys,xs):
            if x+1<24 and sub.a[y,x+1] in(None,'ol','skin'):sub.a[y,x+1]='glow';break
    return sub.img(PAL_D if dark else PAL_N)

def bullets():
    names=['star_small_a','star_small_b','star_big_fall','twinkle_a','twinkle_b','hit_sparkle_a','hit_sparkle_b']
    cells=[]
    def mk():return Cv(24,24)
    c=mk();star(c,12,12,5,'gold','flwC');c.outline('aura2');cells.append(c)
    c=mk();star(c,12,12,5,'mesh','meshH',rot=-54);c.outline('aura2');cells.append(c)
    c=mk()
    for i,(dx,dy) in enumerate([(-6,-7),(-4,-5),(-8,-4),(-3,-8)]):c.line((12+dx,12+dy),(12+dx-3,12+dy-4),1,'mesh' if i%2 else 'flw')
    star(c,13,14,8,'gold','flwC');star(c,13,14.5,3.5,'flwC');c.outline('aura2');cells.append(c)
    for R in (5,3):
        c=mk()
        for k in range(-R,R+1):c.px(12+k,12,'flw' if abs(k)>1 else 'flwC');c.px(12,12+k,'flw' if abs(k)>1 else 'flwC')
        c.px(12,12,'flwC');c.px(11,11,'meshH');c.px(13,13,'meshH');c.px(13,11,'meshH');c.px(11,13,'meshH');cells.append(c)
    for R,ph in((6,0),(9,1)):
        c=mk()
        for i in range(8):
            an=math.radians(i*45+ph*22.5);r1=R-2 if ph==0 else R-4
            for r in np.linspace(r1,R,4):c.px(12+r*math.cos(an),12+r*math.sin(an),'gold' if i%2 else 'mesh')
        if ph==0:star(c,12,12,2.5,'flwC')
        cells.append(c)
    sheet=Image.new('RGBA',(24*len(cells),24),(0,0,0,0))
    meta={}
    for i,(n,c) in enumerate(zip(names,cells)):
        im=c.img(PAL_N);sheet.paste(im,(i*24,0));bb=im.getbbox()
        meta[n]={'frame':i,'bboxInCell':list(bb)}
    return names,sheet,meta
