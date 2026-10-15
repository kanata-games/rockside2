import json;exec(open('/workspace/rockside2/work/hoshiyomi/build.py').read())
d=render_dark();n=render_norm()
def sheet(fr,s):
    im=Image.new('RGBA',(s*len(fr),s),(0,0,0,0))
    for i,(_,f) in enumerate(fr):im.paste(f,(i*s,0))
    a=np.array(im);a[...,3]=np.where(a[...,3]>0,255,0);return Image.fromarray(a)
sheet(d,48).save(A+'hoshiyomi_dark.png');sheet(n,32).save(A+'hoshiyomi.png')
face(True).save(A+'hoshiyomi_dark_face.png');face(False).save(A+'hoshiyomi_face.png')
bn,bs,bm=bullets();bs.save(A+'star_bullets.png')
hb=lambda x0,y0,x1,y1:{'x':x0,'y':y0,'w':x1-x0,'h':y1-y0}
DJ={"image":"hoshiyomi_dark.png","frameWidth":48,"frameHeight":48,"frameCount":12,"facing":"right",
 "anchor":"bottom edge of each frame（歩行ボス：全フレーム足元が下端 y=47 に接地。撃破11はひざをついた姿勢）","cx":24,
 "character":"闇落ち星詠みちゃん（ボス）。黒髪に紫のメッシュ・赤く光る目・紫の花の髪飾り・黒いクロップトップとショートパンツ・肩を落とした白いジャケット（闇色で灰ラベンダーに）・厚底ブーツ（紫の紐）・腰の星の飾り・紫と黒のもや",
 "alignment":"全12フレームで足元の中心が x=24、足元 y=47。共通スケール：頭頂〜足 約37px（diceroll_dark と同じ）。コードでピクセル描画（work/hoshiyomi/build.py）",
 "animations":{
  "idle":{"frames":[0,1],"fps":3,"loop":True,"note":"1は1px沈み＋髪が揺れる"},
  "move":{"frames":[2,3,4],"fps":7,"loop":True,"note":"歩き（2,3,4 を 2-3-4-3 で回してもよい）"},
  "shootWindup":{"frames":[5],"loop":False,"ms":300,"note":"星を持った手を後ろへ振りかぶる（手の星 ≈(19,22)）"},
  "shootStar":{"frames":[6],"loop":False,"ms":200,"active":[6],"note":"腕を前へ突き出して星を放つ瞬間。弾は描いていない（spawn.star）"},
  "starRainCast":{"frames":[7,8],"fps":5,"loop":False,"active":[8],"note":"7 両手を上げ始める / 8 両手を掲げ頭上に星（星の雨の開始、spawn.rain）。8 を保持して詠唱ループにしてよい"},
  "dash":{"frames":[9],"loop":False,"note":"前傾の突進。後ろに紫の残像線（スプライトに含む）"},
  "hurt":{"frames":[10],"loop":False,"ms":300,"note":"のけぞり・目を閉じる。白赤の点滅はゲーム側で"},
  "defeat":{"frames":[11],"loop":False,"note":"ひざをついてうなだれる。もやが薄くなる"}},
 "ms":{"idle":333,"move":143,"shootWindup":300,"shootStar":200,"starRainCast":200,"dash":100,"hurt":300,"defeat":1000},
 "hitbox":{"body":hb(19,11,31,47),"note":"既定の当たり判定（頭〜足、腕・もや・残像は含まない）。左向きでは x → 48-x-w",
   "perFrame":{"9":hb(20,13,34,46),"10":hb(17,11,29,47),"11":hb(18,22,32,47)}},
 "attackHitbox":{"dash":{"frame":9,**hb(26,13,36,40),"note":"突進中の接触ダメージ"}},
 "spawn":{"star":{"frame":6,"x":37,"y":22,"note":"星弾（star_bullets.png の star_small_a/b）の発生点＝突き出した手の先。左向きでは x → 47-x"},
   "rain":{"frame":8,"x":24,"y":3,"note":"星の雨の詠唱点（頭上）。star_big_fall は画面上端から降らせる想定"},
   "windupHand":{"frame":5,"x":19,"y":22,"note":"振りかぶった手の星。チャージ演出用"}},
 "eyes":"赤く光る目（各2x1）は顔の右寄り、y≈15付近。前側の目の右に光る1px",
 "coordNote":"座標は右向きフレーム内のピクセル座標。左向きでは x → 47-x"}
NJ={"image":"hoshiyomi.png","frameWidth":32,"frameHeight":32,"frameCount":4,"facing":"right",
 "anchor":"bottom edge of each frame（足元は下端 y=31）","cx":16,
 "character":"星詠みちゃん（正気に戻った姿・広間の強化役）。黒髪に紫のメッシュ・赤い目・紫の花の髪飾り・黒いトップスとショートパンツ・白いジャケット・厚底ブーツ・星の飾り",
 "alignment":"全4フレームで足元の中心が x=16、足元 y=31。頭頂〜足 約29px（diceroll と同じスケール）",
 "animations":{"idle":{"frames":[0,1],"fps":3,"loop":True},
   "peace":{"frames":[2,3],"fps":3,"loop":True,"note":"2 顔の横でピース / 3 ピース＋ウインク＋キラッ（強化を渡すとき用）"}},
 "hitbox":{"body":hb(12,2,21,32)}}
BJ={"image":"star_bullets.png","frameWidth":24,"frameHeight":24,"facing":"right",
 "description":"星詠みちゃん（ボス）の弾。コードでピクセル描画、紫と金。各弾はセル中央 (12,12) が中心（star_big_fall は星の中心 (13,14)、尾は左上へ伸びる＝右下へ落ちる向き）","order":bn,"frames":bm,
 "hitboxSuggest":{"star_small_a":hb(8,8,16,16),"star_small_b":hb(8,8,16,16),"star_big_fall":hb(7,8,19,20)},
 "usage":{"shootStar":"star_small_a/b を交互に表示して回転に見せる","starRain":"star_big_fall を上から落とし、点滅前に twinkle_a/b を予告として出す","hit":"hit_sparkle_a → b（各 80ms）"}}
for f,j in((A+'hoshiyomi_dark.json',DJ),(A+'hoshiyomi.json',NJ),(A+'star_bullets.json',BJ)):json.dump(j,open(f,'w'),ensure_ascii=False,indent=1)
# contact sheet 6x
from PIL import ImageFont
F=ImageFont.load_default()
items=[('diceroll_dark 0 (scale)',Image.open(A+'diceroll_dark.png').crop((0,0,48,48)))]
items+=[(f'dark {i} {nm}',im) for i,(nm,im) in enumerate(d)]
items+=[('diceroll 0',Image.open(A+'diceroll.png').crop((0,0,32,32)))]+[(f'norm {i} {nm}',im) for i,(nm,im) in enumerate(n)]
items+=[('dark_face',Image.open(A+'hoshiyomi_dark_face.png')),('face',Image.open(A+'hoshiyomi_face.png')),('diceroll_dark_face',Image.open(A+'diceroll_dark_face.png'))]
items+=[(nm,bs.crop((i*24,0,i*24+24,24))) for i,nm in enumerate(bn)]
cols=7;cw=300;ch=310;rows=(len(items)+cols-1)//cols
C=Image.new('RGBA',(cols*cw,rows*ch),(52,50,70,255));dr=ImageDraw.Draw(C)
for k,(lab,im) in enumerate(items):
    x=(k%cols)*cw;y=(k//cols)*ch;big=im.resize((im.width*6,im.height*6),0)
    C.paste(big,(x+6,y+6+288-big.height),big);dr.text((x+6,y+296),lab,fill='white',font=F)
C.save(W+'contact_6x.png')
# 1x scene + ref compare
S1=Image.new('RGBA',(260,60),(40,36,56,255))
for i,(_,im) in enumerate(d[:5]):S1.paste(im,(i*50,6),im)
S1.resize((1040,240),0).save(W+'preview_1x_4x.png')
ref=Image.open('/workspace/rockside2/refs/hoshiyomi_ref.png').convert('RGBA').resize((341,512))
R=Image.new('RGBA',(341+400,512),(40,36,56,255));R.paste(ref,(0,0))
a=d[0][1].resize((288,288),0);R.paste(a,(345,0),a);b=n[0][1].resize((192,192),0);R.paste(b,(345,300),b)
f2=Image.open(A+'hoshiyomi_face.png').resize((144,144),0);R.paste(f2,(560,330),f2);R.save(W+'compare_ref.png')
