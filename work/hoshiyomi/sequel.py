# 星詠みちゃん sequel build: chroma key raws A/B -> 512x512 cells
import json, numpy as np
from PIL import Image
from scipy import ndimage as nd
W='/workspace/rockside2/work/hoshiyomi/'; AS='/workspace/rockside2/assets/'
CELL=512; NH=440; FEETY=500; DISP=54; SCALE=round(DISP/NH,4)
def key(path):
    a=np.array(Image.open(path).convert('RGB')).astype(float); r,g,b=a[...,0],a[...,1],a[...,2]
    sp=g-np.maximum(r,b)
    al=np.clip(1-(sp-30)/70,0,1)            # sp<=30 opaque, >=100 clear
    al=nd.median_filter(al,3)
    g2=np.minimum(g,np.maximum(r,b)+8)       # despill
    g3=np.where(sp>8,g2,g); semi=al<0.98
    edge=nd.binary_dilation(semi,iterations=2)
    g3=np.where(edge,np.minimum(g3,np.minimum(r,b)+4),g3)
    # unmix green from semi-transparent pixels: c=(obs-(1-a)*G)/a
    G=np.array([0,255,0]); aa=np.clip(al,0.15,1)[...,None]
    un=np.clip((np.dstack([r,g3,b])-(1-aa)*G*0.35)/ (1-(1-aa)*0.35),0,255)
    rgb=np.where(semi[...,None],un,np.dstack([r,g3,b]))
    rgb[...,1]=np.where(edge,np.minimum(rgb[...,1],np.minimum(rgb[...,0],rgb[...,2])+4),rgb[...,1])
    out=np.dstack([rgb,al*255]).astype(np.uint8)
    return out
def charmask(rgba):
    a=rgba[...,3]>128; f=rgba[...,:3].astype(int); r,g,b=f[...,0],f[...,1],f[...,2]
    purple=(b>g+25)&(r>g+5)&(np.maximum(r,b)>70)   # mist
    yellow=(r>170)&(g>140)&(b<120)
    return a&~purple&~yellow
def comps(rgba,cells):
    """cells: list of (x0,y0,x1,y1). assign components by centroid."""
    a=rgba[...,3]>20; lab,n=nd.label(nd.binary_dilation(a,iterations=3))
    cen=nd.center_of_mass(a,lab,range(1,n+1)); size=nd.sum(a,lab,range(1,n+1)); sl=nd.find_objects(lab)
    outs=[]
    for (x0,y0,x1,y1) in cells:
        keep=np.zeros(n+1,bool)
        for i,(cy,cx) in enumerate(cen):
            ok=x0<=cx<x1 and y0<=cy<y1
            if ok and size[i]<3000:
                ys_,xs_=sl[i]; ok=ys_.start>=y0+2 and ys_.stop<=y1-2 and xs_.start>=x0 and xs_.stop<=x1
            if size[i]>15 and ok: keep[i+1]=True
        m=keep[lab]&a; im=rgba.copy(); im[...,3]=np.where(m,im[...,3],0); outs.append(im)
    return outs
def measure(im):
    cm=charmask(im); rows=np.where(cm.sum(1)>=4)[0]; top,bot=rows[0],rows[-1]
    fx=np.where(cm[bot-25:bot+1].any(0))[0]
    return top,bot,(fx[0]+fx[-1])/2
A=key(W+'raw/A.jpg'); B=key(W+'raw/B.jpg')
Ac=comps(A,[(x,y,x+320,y+360) for y in (0,360) for x in (0,320,640,960)])
Bc=comps(B,[(x,0,x+320,720) for x in (0,320,640,960)])
# one scale per raw sheet from its standing idle
tA,bA,_=measure(Ac[0]); kA=NH/(bA-tA)
tB,bB,_=measure(Bc[2]); kB=NH/(bB-tB)
print('heights',bA-tA,bB-tB)
def place(im,k,name,shift=0):
    top,bot,fx=measure(im); ys,xs=np.where(im[...,3]>0)
    x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    crop=Image.fromarray(im[y0:y1,x0:x1]); nw,nh=round((x1-x0)*k),round((y1-y0)*k)
    crop=crop.resize((nw,nh),Image.LANCZOS)
    ax=round((fx-x0)*k); ay=round((bot-y0)*k)
    cell=Image.new('RGBA',(CELL,CELL)); px=256-ax+shift; py=FEETY-ay
    px=min(max(px,CELL-nw if nw>CELL else 0 if px<0 else px),max(0,CELL-nw)) if (px<0 or px+nw>CELL) else px
    cell.alpha_composite(crop,(0,0),(max(0,-px),max(0,-py),nw,nh)) if (px<0 or py<0) else cell.alpha_composite(crop,(px,py))
    return name,cell,[px+ax,FEETY]
def bob(cell,dy):
    nh=CELL-dy*CELL//FEETY; sq=cell.resize((CELL,nh),Image.LANCZOS); c=Image.new('RGBA',(CELL,CELL)); c.alpha_composite(sq,(0,FEETY-round(FEETY*nh/CELL))); return c
    c=Image.new('RGBA',(CELL,CELL)); top=cell.crop((0,0,CELL,FEETY-60)); bottom=cell.crop((0,FEETY-60,CELL,CELL))
    c.alpha_composite(bottom,(0,FEETY-60)); c.alpha_composite(top,(0,dy)); return c
DN=['idle','idle2','walkA','walkB','shootWindup','shootStar','starRainCast','dash']
dark=[place(Ac[i],kA,DN[i]) for i in range(8)]+[place(Bc[0],kB,'hurt'),place(Bc[1],kB,'defeat')]
norm=[place(Bc[2],kB,'idle')]; n1=('idle2',bob(norm[0][1],3),norm[0][2]); norm=[norm[0],n1,place(Bc[3],kB,'peace')]
def save(frames,png,cols):
    rows=(len(frames)+cols-1)//cols; S=Image.new('RGBA',(cols*CELL,rows*CELL)); out=[]
    for i,(n,c,anc) in enumerate(frames):
        x,y=(i%cols)*CELL,(i//cols)*CELL; S.alpha_composite(c,(x,y))
        a=np.array(c)[...,3]; ys,xs=np.where(a>0)
        out.append({"name":n,"rect":[x,y,CELL,CELL],"anchor":[int(anc[0]),int(anc[1])],"scale":SCALE,"alphaBounds":[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]})
    S.save(AS+png); return out,S
for f in dark+norm: f[1].save(W+'cell_%s_%s.png'%('d' if f in dark else 'n',f[0]))
fd,SD=save(dark,'hoshiyomi_dark-sequel.png',5); fn,SN=save(norm,'hoshiyomi-sequel.png',3)
json.dump({'fd':fd,'fn':fn,'SCALE':SCALE,'NH':NH},open(W+'_frames.json','w'))
# faces from head crops
def face(im,k,path,big):
    top,bot,fx=measure(im); cm=charmask(im); ys,xs=np.where(cm[top:top+int(130/k*k)] )
    h=int((bot-top)*0.17); hy=top; rowsx=np.where(cm[top:top+h].any(0))[0]
    cx=(rowsx[0]+rowsx[-1])/2; s=int(h*1.15); y0=int(top-s*0.05)
    c=Image.fromarray(im).crop((int(cx-s/2),y0,int(cx-s/2)+s,y0+s))
    c.resize((256,256),Image.LANCZOS).save(big); c.resize((24,24),Image.LANCZOS).save(path)
face(Ac[0],kA,AS+'hoshiyomi_dark_face.png',W+'face_dark_256.png')
face(Bc[2],kB,AS+'hoshiyomi_face.png',W+'face_256.png')
