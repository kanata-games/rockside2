
// =====================================================================
//  月下の稽古庭 (test.45): friendly sparring (腕試し) with the first game's allies
//  飛梅 / ネーニア / リリィ / スターさん — all back to normal. Each sparring partner reuses
//  attack ideas from the first game (04_game.js aiTobiume/aiNeenia/aiLily, 04b_disaster.js)
//  rebuilt on the sequel's verbs: HIGH things are slid under, LOW things are jumped over,
//  falling things show their safe gaps first. Every attack telegraphs before it can hurt.
//  Art per partner: assets/<name>-sequel.png/.json (hi-res 512 cells) → old normal sheet → placeholder.
// =====================================================================
const KEIKO_FLOOR=224,KEIKO_L=40,KEIKO_R=472;
const KEIKO_BOSSES={
 tobiume:{room:'kTobi',name:'ハネウメ',real:'飛梅',hp:130,col:'#ff8cc0',sub:'#ffd6ea',art:'tobiume',normal:'tobiume',flag:'keikoTobiume',
  seq:['volley','swoop','volley','shock'],rageSeq:['volley','shock','swoop','volley','swoop'],
  volley:{n:2,rn:3,pat:'alt',speed:2.4,kind:'heart'},swoop:{speed:5.4},shock:{},
  pose:{volley:'attack',swoop:'fly',shock:'kick',walk:'fly',idle:'idle'},
  fake:['あっ、海音ちゃーん！ 飛梅ちゃんだよ！ 迎えに来てくれたんだね！','……あれ？ 海音ちゃんって、こんなに背が低かったっけ？ まあいっか、梅干し食べる？'],pre:['……ぷぷっ、バレちゃった？ あたしは跳梅（ハネウメ）！ 本物の飛梅は、そこの檻の中だよ。','返してほしかったら、勝ってみな！ 高いハートはくぐって、低いのはジャンプ。急降下の前には線が光るからね！'],
  again:['ぴょーん、あたしの勝ち！ ……でもまだやる？ いいよ、跳ね足りないし！'],vanish:['あいたたた……負けちゃった。あたし、月の光でできた影法師なんだ。','本物は返してあげる。……じゃあね、ぴょーん！'],rematch:['あのそっくりさん、月が出てればまた出てくるみたい。もう一回、腕試ししてく？'],
  post:['海音ちゃーん！ 出られたー！ ありがとう！ あのそっくりさん、あたしのマネばっかりするんだもん！','海音ちゃんの勘、取り戻す腕試しなら、いつでも飛梅ちゃんが付き合うよ。急降下キックのあとの衝撃は、ジャンプでぴょん！ だよ。','はい、星詠みの欠片3つ！ これからは一緒に戦おうね！']},
 neenia:{room:'kNeen',name:'ネムニア',real:'ネーニア',hp:140,col:'#8fb0ff',sub:'#e4ecff',art:'neenia',normal:'neenia',flag:'keikoNeenia',
  seq:['volley','rain','volley','snare'],rageSeq:['volley','snare','rain','volley','rain'],
  volley:{n:2,rn:3,pat:'mix',speed:3.0,kind:'arrow'},rain:{w:52,rw:46},snare:{n:2,rn:3},
  pose:{volley:'attack',rain:'attack',snare:'attack',walk:'walk',idle:'idle'},
  fake:['海音……来てくれたのね。私よ、ネーニア。','さあ、こっちへ。……弓？ ああ、あれは重いから置いてきたわ。ふわぁ……'],pre:['……眠くて芝居が続かないわ。私はネムニア。本物は奥で、静かに眠ってもらってる。','高い矢はくぐって、低い矢は跳んで。茨の印には立たないこと。……私に勝てたら、返してあげる。'],
  again:['……すぅ。あら、もう眠いの？ もう一度、子守唄代わりに射ってあげる。'],vanish:['……ふぁ。久しぶりに、よく目が覚めたわ。','私は月が見せた夢。……本物は、もう起こしてあげる。'],rematch:['あの影、まだ庭のどこかで眠っているわ。……もう一度、射合ってみる？'],
  post:['海音。……あなたが、私の偽者を鎮めてくれたのね。檻の中から見ていたわ。','腕試しの相手なら、私が引き受けるわ。矢の雨は、落ちる前に隙間が光る。焦らず、立つ場所を選びなさい。','これを持っていきなさい。……背中は、私が守る。']},
 lily:{room:'kLily',name:'リリリ',real:'リリィ',hp:140,col:'#ffd2ef',sub:'#fff4fb',art:'lily',normal:'lily',flag:'keikoLily',
  seq:['wave','volley','rain','wave'],rageSeq:['wave','volley','rain','wave','volley'],
  wave:{n:1,rn:2,speed:2.6},volley:{n:2,rn:3,pat:'high',speed:2.6,kind:'note'},rain:{w:56,rw:48},
  pose:{wave:'attack',volley:'attack',rain:'attack',walk:'walk',idle:'idle'},
  fake:['海音ちゃーん！ リリィだよっ♪ 会いたかったー！','ウミミ？ えーっと……今日はお休み！ かわりにリリリ……じゃなくて、リリィが歌うね♪'],pre:['あっ、言っちゃった。そう、あたしはリリリ！ リリィちゃんは楽屋の檻で待機中でーす♪','歌の波はジャンプ、音符はスライディング！ ライブについてこれたら返してあげる♪'],
  again:['ざんねーん、アンコールはリリリにおまかせ♪ もう一回いってみよー！'],vanish:['えー、負けちゃった！ リリリ、月の光の舞台にしか立てないの。','リリィちゃんは楽屋から出してあげるね。……またね、ばいばーい♪'],rematch:['あの子、月が出たらまた歌いに来るって。もう一回、腕試ししていく？♪'],
  post:['海音ちゃん！ 助けてくれてありがとうっ♪ 楽屋に閉じこめられて、ずっと出番待ちだったの！','リリィのそっくりさん、手ごわかったでしょ？ リズムがわかれば怖くないよ。次の相手にも、その調子で！','ウミミも拍手してる！ 欠片はファンサービス、3つどうぞっ♪ これからは一緒にステージだね！']},
 disaster:{room:'kDis',name:'ズターさん',real:'スターさん',hp:170,col:'#71d9ff',sub:'#d8f6ff',art:'disaster',normal:'star',flag:'keikoStar',
  seq:['sword','spear','axe','scythe','bow'],rageSeq:['sword','scythe','spear','axe','bow','scythe'],
  sword:{n:1,rn:2,speed:3.0},spear:{speed:6},axe:{},scythe:{},bow:{n:2,rn:3,pat:'alt',speed:3.2,kind:'arrow'},
  pose:{sword:'sword',spear:'spear',axe:'axe',scythe:'scythe',bow:'bow',walk:'idle',idle:'idle'},
  fake:['よう、海音。オレだ、スターさんだぜ。','錬金剣？ ……ああ、あれな。オレ様の……いや、オレの剣は今日もピカピカだ。ククク……'],pre:['……チッ、口調がもたなかったか。オレ様は錬金のズターさん！ 本物は奥の檻だ。','武器が変わる前には紫に光り、頭の上に次の武器が出る。剣の波と斧の衝撃は跳べ、大鎌と弓はくぐれ。いくぞ！'],
  again:['フハハ、まだまだだな！ ……だが筋は悪くない。もう一本やるか？'],vanish:['ぐぬぬ……見事だ。オレ様は、月が錬金した写し身にすぎん。','本物は返してやる。……せいぜい、仲良くやるんだな！'],rematch:['あのズターとかいうやつ、月の光でまた湧くらしい。もう一戦、やってみるか？'],
  post:['よう、海音！ 助かったぜ。オレのニセモノ、片付けてくれたんだな。','武器が変わる瞬間を見る。前の旅で、オマエが一番うまかったところだ。腕試しなら、いつでも相手になるぜ。','欠片、持ってけ。これで背中は任せられるぜ。……みんなで、この館の謎を解こうな。']},
};
const KEIKO_CAGE_X=440;
const KEIKO_BY_ROOM=Object.fromEntries(Object.entries(KEIKO_BOSSES).map(([id,b])=>[b.room,id]));
const KEIKO_MORPH_ICON={sword:'剣',spear:'槍',axe:'斧',scythe:'鎌',bow:'弓'};
// ---- art: <art>-sequel → <normal> grid sheet (old 32px normal art, scaled) → placeholder
const KEIKO_GRID_META={neenia:{frameWidth:32,frameHeight:32,cx:11,animations:{idle:{frames:[0,1],ms:400}}},lily:{frameWidth:32,frameHeight:32,cx:16,animations:{idle:{frames:[0,1],ms:400}}}};
// impostor (偽者) art: assets/<art>-sequel → placeholder.  real character: assets/<normal>_real-sequel → first-game normal sheet (scaled) → placeholder.
function keikoSheetLoad(key,sequel,gridName){if(typeof fetch!=='function')return;
 const grid=()=>{if(!gridName)return;fetch('assets/'+gridName+'.json').then(r=>{if(!r.ok)throw 0;return r.json();}).catch(()=>KEIKO_GRID_META[gridName]||{frameWidth:32,frameHeight:32,animations:{idle:{frames:[0],ms:400}}}).then(meta=>{const img=new Image();img.onload=()=>{if(HOSHI_ART[key]?.mode==='sequel')return;const fh=+meta.frameHeight||32;HOSHI_ART[key]={mode:'grid',img,meta:{...meta,drawScale:meta.drawScale||Math.max(1,Math.round(54/fh*2)/2)}};};img.src='assets/'+(meta.image||gridName+'.png');});};
 fetch('assets/'+sequel+'.json').then(r=>{if(!r.ok)throw 0;return r.json();}).then(meta=>{const img=new Image();img.onload=()=>{HOSHI_ART[key]={mode:'sequel',img,meta};};img.onerror=grid;img.src='assets/'+(meta.image||sequel+'.png');}).catch(grid);}
function keikoArtLoad(id){const B=KEIKO_BOSSES[id];keikoSheetLoad('k_'+id,B.art+'-sequel',null);keikoSheetLoad('r_'+id,B.normal+'_real-sequel',B.normal);
 if(typeof Image!=='function')return;const f=new Image();f.onload=()=>{HOSHI_ART['r_'+id+'Face']={mode:'face',img:f};};f.onerror=()=>{const b=new Image();b.onload=()=>{if(!HOSHI_ART['r_'+id+'Face'])HOSHI_ART['r_'+id+'Face']={mode:'face',img:b};};b.src='assets/'+B.normal+'_face.png';};f.src='assets/'+B.normal+'_real-sequel-face.png';}
for(const id of Object.keys(KEIKO_BOSSES))keikoArtLoad(id);
const KEIKO_ALIAS={attack:['attackA','attack','shoot','idle'],kick:['attackB','kick','special_dive_kick','attack','fly','idle'],fly:['move','fly','walk','idle'],walk:['move','walk','fly','idle'],telegraph:['telegraph','transform','attack','idle'],
 sword:['attackA','sword','attack','idle'],spear:['attackB','spear','attack','idle'],axe:['attackB','axe','attack','idle'],scythe:['attackA','scythe','attack','idle'],bow:['attackA','bow','attack','idle'],transform:['telegraph','transform','attack','idle'],hurt:['hurt','idle']};
function keikoDraw(id,e,pose,real){const key=(real?'r_':'k_')+id,save=HOSHI_POSE_ALIAS[pose];if(KEIKO_ALIAS[pose])HOSHI_POSE_ALIAS[pose]=KEIKO_ALIAS[pose];const ok=hoshiDrawArt(key,e.x,e.y-(e.lift||0),pose,e.t,e.face,e.flash>0&&(e.flash&2)?.55:1);if(save)HOSHI_POSE_ALIAS[pose]=save;else delete HOSHI_POSE_ALIAS[pose];if(ok)return;keikoPlaceholder(id,e.x,e.y-(e.lift||0),pose,e.t,e.face,!real);}
function keikoPlaceholder(id,x,y,pose,t,dir,fake){const B=KEIKO_BOSSES[id],f=dir<0?-1:1,R=(a,b,w,h,c)=>mrect(f>0?x+a:x-a-w,y+b,w,h,c),bob=(t>>5)&1;
 const hair={tobiume:'#ff8cc0',neenia:'#e8ecf4',lily:'#ffe6a8',disaster:'#2a3a6a'}[id],dress={tobiume:'#c8406a',neenia:'#2a3a7a',lily:'#ff9ad8',disaster:'#1c2a4a'}[id];
 R(-5,-8,4,8,'#2a2030');R(2,-8,4,8,'#2a2030');R(-6,-26,13,18,dress);R(-6,-12,13,3,B.sub);R(-4,-37+bob,9,10,'#f4dcd0');R(-6,-40+bob,13,5,hair);R(-6,-38+bob,3,12,hair);R(4,-38+bob,3,9,hair);R(2,-33+bob,2,1,'#3a2a48');
 if(id==='neenia'){R(8,-30,2,18,'#a07a4a');R(9,-29,1,16,'#e8e4c8');}if(id==='lily'){R(-3,-44+bob,7,3,'#ffe27a');}if(id==='tobiume'){R(-12,-28,6,10,'#ffd6ea');R(-14,-24,6,6,'#ffb0d0');}
 if(id==='disaster'&&pose!=='idle'){R(8,-30,16,3,'#71d9ff');R(8,-30,3,8,'#c8f4ff');}
 if(fake){g.globalAlpha=.25;g.fillStyle='#c8b0ff';g.fillRect(x-10,y-46,20,46);g.globalAlpha=1;}}
// ---- state
function mansionKeikoNew(id){const B=KEIKO_BOSSES[id];return{kind:'keikoBoss',id,x:200,y:KEIKO_FLOOR,face:-1,hp:B.hp,maxHp:B.hp,t:0,flash:0,mode:'idle',mt:0,cycle:0,gaps:[],nextGaps:null,marks:[],lift:0};}
function mansionKeikoEnter(room){M.keiko=null;const id=KEIKO_BY_ROOM[room];if(!id)return;const B=KEIKO_BOSSES[id];M.keiko={id,state:'waiting'};M.enemies.push(mansionKeikoNew(id));}
function mansionKeikoBoss(){return M.enemies.find(e=>e.kind==='keikoBoss');}
function mansionKeikoTrigger(){const k=M.keiko;if(!k||k.state!=='waiting'||M.map||M.x<64)return;const B=KEIKO_BOSSES[k.id];
 if(M.flags[B.flag]){k.state='idleDone';return;}k.state='ready';mansionTalkShow(B.real+'？',B.fake,()=>{mansionBurst(mansionKeikoBoss().x,KEIKO_FLOOR-24,'#c8b0ff',16);mansionTalkShow(B.name,B.pre,mansionKeikoStart);});}
function mansionKeikoStart(){const k=M.keiko;if(!k)return;k.state='active';const e=mansionKeikoBoss();Object.assign(e,mansionKeikoNew(k.id));e.x=M.x<256?400:112;e.mode='walk';M.enemyShots=[];M.map=false;}
function mansionKeikoRematch(){const k=M.keiko;if(!k)return;M.flags[KEIKO_BOSSES[k.id].flag+'Rematch']=true;mansionKeikoStart();}
function mansionKeikoActive(){return !!(M.keiko&&M.keiko.state==='active');}
function mansionKeikoArenaSolids(){return mansionKeikoActive()?[[0,0,24,256],[MR[M.room].w-24,0,24,256]]:[];}
function mansionKeikoMode(e,m){e.mode=m;e.mt=0;e.lift=0;}
function mansionKeikoGaps(e,n,w){const out=[],span=KEIKO_R-KEIKO_L-w;for(let i=0;i<n;i++){let x=KEIKO_L+((artH(e.cycle*7+i,(e.seed||0)+i*3)%1000)/1000)*span;for(let k=0;k<6&&out.some(g=>Math.abs(g-x)<w*2.2);k++)x=KEIKO_L+((x-KEIKO_L+span*.37)%span);out.push(Math.round(x));}return out.map(x=>[x,x+w]);}
function keikoShot(e,o){M.enemyShots.push({kind:'kShot',x:e.x+e.face*16,y:KEIKO_FLOOR-(o.low?6:20),vx:e.face*o.speed,vy:0,damage:2,low:!!o.low,col:KEIKO_BOSSES[e.id].col,shape:o.shape||'orb',...o.extra});sfx('shot');}
// ---- AI
function mansionKeikoAI(e){const k=M.keiko;if(!k||k.state!=='active'){e.mode='idle';return;}const B=KEIKO_BOSSES[e.id],rage=e.hp<=e.maxHp/2,t=++e.mt,dx=M.x-e.x;
 if(rage&&!e.raged){e.raged=true;mansionSay('「'+B.name+'：まだまだ、ここからが本番！」',140);mansionBurst(e.x,e.y-30,B.col,16);}
 for(const m of e.marks)m.t++;e.marks=e.marks.filter(m=>m.t<m.end);
 const m=e.mode;
 if(m==='walk'){e.face=Math.sign(dx)||e.face;const d=Math.abs(dx);if(d>180)e.x+=e.face*(rage?1.3:1);else if(d<140)e.x-=e.face*1.2;
  if(t>(rage?40:64)){const seq=rage?B.rageSeq:B.seq;mansionKeikoMode(e,seq[e.cycle%seq.length]);e.cycle++;e.fromX=e.x;}}
 else if(m==='volley'||m==='bow'||m==='sword'){const P=B[m],WIND=m==='volley'?36:44,GAP=rage?42:46,n=rage?P.rn:P.n;if(t<WIND)e.face=Math.sign(dx)||e.face;
  if(t===1)e.pattern=Array.from({length:n},(_,i)=>m==='sword'?true:P.pat==='high'?false:P.pat==='low'?true:P.pat==='alt'?(i%2===1):((artH(e.cycle,i)&1)===1));
  if(t>=WIND&&(t-WIND)%GAP===0&&(t-WIND)/GAP<n){const low=e.pattern[(t-WIND)/GAP];keikoShot(e,{low,speed:P.speed+(rage?.3:0),shape:m==='sword'?'wave':P.kind});}
  if(t>WIND+GAP*n+20)mansionKeikoMode(e,'walk');}
 else if(m==='wave'){const P=B.wave,WIND=40,GAP=44,n=rage?P.rn:P.n;if(t<WIND)e.face=Math.sign(dx)||e.face;
  if(t>=WIND&&(t-WIND)%GAP===0&&(t-WIND)/GAP<n){for(const s of rage?[1,-1]:[e.face])M.enemyShots.push({kind:'kShot',x:e.x+s*14,y:KEIKO_FLOOR-6,vx:s*P.speed,vy:0,damage:2,low:true,col:B.col,shape:'wave'});sfx('tink');}
  if(t>WIND+GAP*n+30)mansionKeikoMode(e,'walk');}
 else if(m==='swoop'||m==='spear'){const air=m==='swoop',TELE=rage?30:40,sp=(B[m].speed||5.2)+(rage?.6:0);
  if(t===1){e.dashes=rage?2:1;e.edge=e.x<M.x?KEIKO_L:KEIKO_R;}
  if(t<=TELE){if(e.edge!=null){const d=e.edge-e.x;e.x+=Math.sign(d)*Math.min(Math.abs(d),6);if(Math.abs(d)<1)e.edge=null;}e.face=Math.sign(M.x-e.x)||e.face;e.lift=air?Math.min(22,t):0;}
  else{e.lift=air?22:0;e.x+=e.face*sp;if(e.x<KEIKO_L||e.x>KEIKO_R){e.x=Math.max(KEIKO_L,Math.min(KEIKO_R,e.x));e.dashes--;if(e.dashes>0){e.face*=-1;e.mt=TELE-22;}else mansionKeikoMode(e,'walk');}}}
 else if(m==='shock'||m==='axe'){const AIM=40,UP=24,DOWN=14;
  if(t===1){e.fromX=e.x;e.toX=Math.max(KEIKO_L+20,Math.min(KEIKO_R-20,M.x));}
  if(t<=AIM){e.toX+=(Math.max(KEIKO_L+20,Math.min(KEIKO_R-20,M.x))-e.toX)*(t<AIM-14?.08:0);e.lift=Math.min(10,t/2);}
  else if(t<=AIM+UP){const q=(t-AIM)/UP;e.x=e.fromX+(e.toX-e.fromX)*q;e.lift=10+Math.sin(q*Math.PI/2)*80;}
  else if(t<=AIM+UP+DOWN){e.lift=90*(1-(t-AIM-UP)/DOWN);}
  if(t===AIM+UP+DOWN){e.lift=0;mansionBurst(e.x,KEIKO_FLOOR-4,B.col,12);sfx('hit');for(const s of[1,-1])M.enemyShots.push({kind:'kShot',x:e.x+s*12,y:KEIKO_FLOOR-6,vx:s*(rage?2.8:2.4),vy:0,damage:2,low:true,col:B.col,shape:'wave'});}
  if(t>AIM+UP+DOWN+40)mansionKeikoMode(e,'walk');}
 else if(m==='scythe'){const WIND=44;if(t<WIND)e.face=Math.sign(dx)||e.face;
  if(t===WIND){M.enemyShots.push({kind:'kShot',x:e.x+e.face*16,y:KEIKO_FLOOR-20,vx:e.face*(rage?3.8:3.3),vy:0,damage:2,low:false,col:B.col,shape:'scythe',boom:e.face,home:e.x});sfx('shot');}
  if(t>WIND&&!M.enemyShots.some(b=>b.shape==='scythe'))mansionKeikoMode(e,'walk');if(t>WIND+400)mansionKeikoMode(e,'walk');}
 else if(m==='rain'){const RISE=20,TELE=60,RAIN=rage?120:84,P=B.rain,W=rage?P.rw:P.w;
  if(t===1){e.seed=(e.seed||0)+5;e.gaps=mansionKeikoGaps(e,2,W);e.nextGaps=null;e.shiftAt=rage?RISE+TELE+50:null;}
  e.lift=e.id==='neenia'?0:t<RISE?t*2:t>RISE+TELE+RAIN+30?Math.max(0,40-(t-RISE-TELE-RAIN-30)*2):40;
  if(e.shiftAt&&t===e.shiftAt-40){e.nextGaps=mansionKeikoGaps({cycle:e.cycle+5,seed:e.seed+9},2,W);}
  if(e.shiftAt&&t===e.shiftAt){e.gaps=e.nextGaps;e.nextGaps=null;}
  if(t>RISE+TELE&&t<RISE+TELE+RAIN&&t%4===0){const safe=[...e.gaps,...(e.nextGaps||[])];let x=null;for(let q=0;q<8&&x==null;q++){const c=KEIKO_L-20+artH(t,q+e.cycle)%(KEIKO_R-KEIKO_L+40);if(!safe.some(([a,b])=>c>a-8&&c<b+8))x=c;}if(x!=null)M.enemyShots.push({kind:'kRain',x,y:14,vx:0,vy:3.4,damage:2,col:B.col,shape:e.id==='lily'?'star':'arrowDown'});}
  if(t>RISE+TELE+RAIN+50){e.gaps=[];mansionKeikoMode(e,'walk');}}
 else if(m==='snare'){const TELE=50,n=rage?B.snare.rn:B.snare.n;if(t===1){e.marks=[];const xs=[M.x];for(let i=1;i<n;i++)xs.push(M.x+(i%2?1:-1)*(60+i*20));for(const x of xs)e.marks.push({x:Math.max(KEIKO_L+10,Math.min(KEIKO_R-10,x)),w:28,t:0,arm:TELE,end:TELE+110});sfx('tink');}
  if(t>TELE+40)mansionKeikoMode(e,'walk');}
 for(const mk of e.marks)if(mk.t>=mk.arm&&M.ground&&Math.abs(M.x-mk.x)<mk.w/2+MC.w/2-2)mansionDamage(2,M.x<mk.x?-1:1);
 e.x=Math.max(KEIKO_L-8,Math.min(KEIKO_R+8,e.x));
 const box=e.mode==='spear'&&e.mt>(rage?30:40)?[e.x-9,e.y-34,18,27]:e.lift>0?[e.x-8,e.y-40-e.lift+(e.mode==='swoop'?0:0),16,22]:[e.x-8,e.y-40,16,40];
 if(e.mode==='swoop'&&e.lift>=22){box[1]=e.y-46;box[3]=26;}
 if(mansionOverlap(M.x-MC.w/2,M.y-M.h,MC.w,M.h,box))mansionDamage(2,M.x<e.x?-1:1);}
function mansionKeikoBulletUpdate(){if(!M.keiko)return;const e=mansionKeikoBoss();for(const b of M.enemyShots){if(b.kind==='kRain'&&b.y>KEIKO_FLOOR-4){b.dead=true;mansionBurst(b.x,KEIKO_FLOOR-4,b.col,3);}
 if(b.shape==='scythe'){b.age=(b.age||0)+1;if(b.boom&&(b.x<KEIKO_L-8||b.x>KEIKO_R+8)){b.vx=-b.vx;b.boom=0;b.back=true;}if(b.back&&e&&Math.abs(b.x-e.x)<10)b.dead=true;}}}
function mansionKeikoPose(e){const B=KEIKO_BOSSES[e.id];if(e.flash>0)return'hurt';if(e.id==='disaster'&&KEIKO_MORPH_ICON[e.mode]&&e.mt<18)return'transform';const wind={volley:36,bow:44,sword:44,wave:40,scythe:44,snare:30,shock:40,axe:40,swoop:e.hp<=e.maxHp/2?30:40,spear:e.hp<=e.maxHp/2?30:40,rain:60}[e.mode];if(wind&&e.mt<wind)return'telegraph';if(e.mode==='rain')return'kick';return B.pose[e.mode]||'idle';}
function mansionKeikoDraw(e){const B=KEIKO_BOSSES[e.id],rage=e.hp<=e.maxHp/2;if(!M.keiko||!['active','ready','waiting'].includes(M.keiko.state))return;
 if(e.mode==='rain'){for(const[a,b]of e.gaps||[]){g.globalAlpha=.28+.12*Math.sin(M.t*.2);mrect(a,20,b-a,KEIKO_FLOOR-20,'#9fe8ff');g.globalAlpha=1;mrect(a,KEIKO_FLOOR-3,b-a,3,'#c9fbff');mansionDiamond((a+b)/2,KEIKO_FLOOR-12,4,'#ffffff');}
  for(const[a,b]of e.nextGaps||[]){if((M.t>>3)&1){mrect(a,KEIKO_FLOOR-3,b-a,3,'#ffe27a');mansionDiamond((a+b)/2,KEIKO_FLOOR-14,4,'#ffe27a');}}}
 for(const mk of e.marks){const armed=mk.t>=mk.arm;if(armed){for(let x=mk.x-mk.w/2;x<mk.x+mk.w/2;x+=5)mrect(x,KEIKO_FLOOR-6-((x*7)&3),2,6+((x*7)&3),'#6ab070');}else if((M.t>>2)&1){mrect(mk.x-mk.w/2,KEIKO_FLOOR-2,mk.w,2,'#ff6a6a');mansionDiamond(mk.x,KEIKO_FLOOR-10,3,'#ff6a6a');}}
 const dashTele=(e.mode==='swoop'||e.mode==='spear')&&e.mt<=(rage?30:40);
 if(dashTele&&(M.t&4)){const x0=e.face>0?e.x:KEIKO_L-8,x1=e.face>0?KEIKO_R+8:e.x,h=e.mode==='swoop'?KEIKO_FLOOR-34:KEIKO_FLOOR-20;mrect(Math.min(x0,x1),h,Math.abs(x1-x0),2,e.mode==='swoop'?'#9fe8ff':'#ff6ab0');}
 if((e.mode==='shock'||e.mode==='axe')&&e.mt<64&&(M.t&4)){mrect(e.toX-14,KEIKO_FLOOR-2,28,2,'#ff6ab0');mansionDiamond(e.toX,KEIKO_FLOOR-10,3,'#ff6ab0');}
 if(e.pattern&&(e.mode==='volley'||e.mode==='bow'||e.mode==='sword')&&e.mt<(e.mode==='volley'?36:44))e.pattern.forEach((low,i)=>mansionDiamond(e.x+e.face*(22+i*9),KEIKO_FLOOR-(low?6:20),3,(M.t&4)?'#ffffff':low?'#ff8ad8':'#9fe8ff'));
 if(e.mode==='wave'&&e.mt<40&&(M.t&4))mrect(e.x-30,KEIKO_FLOOR-2,60,2,'#ff8ad8');
 if(e.mode==='scythe'&&e.mt<44&&(M.t&4))mrect(Math.min(e.x,e.face>0?KEIKO_R:KEIKO_L),KEIKO_FLOOR-21,Math.abs((e.face>0?KEIKO_R:KEIKO_L)-e.x),2,'#9fe8ff');
 if(e.id==='disaster'&&KEIKO_MORPH_ICON[e.mode]&&e.mt<40){g.globalAlpha=.5;g.fillStyle='#b070ff';g.beginPath();g.ellipse(e.x,e.y-22,14,24,0,0,7);g.fill();g.globalAlpha=1;mrect(e.x-8,e.y-74,16,14,'#1a1030');drawText(KEIKO_MORPH_ICON[e.mode]==='剣'?'SW':KEIKO_MORPH_ICON[e.mode]==='槍'?'SP':KEIKO_MORPH_ICON[e.mode]==='斧'?'AX':KEIKO_MORPH_ICON[e.mode]==='鎌'?'SC':'BW',e.x,e.y-71,'w',1,'c');}
 keikoDraw(e.id,e,mansionKeikoPose(e));
 if(mansionKeikoActive()){mrect(e.x-28,e.y-66-e.lift,56,5,'#160e27');mrect(e.x-27,e.y-65-e.lift,54*Math.max(0,e.hp)/e.maxHp,3,rage?'#ff6ab0':B.col);}}
function keikoBulletDraw(b){const c=b.col||'#fff';
 if(b.shape==='wave'){mrect(b.x-5,b.y-4,10,10,'#1a1030');mrect(b.x-4,b.y-3,8,8,c);mrect(b.x-2,b.y-1,4,4,'#ffffff');return;}
 if(b.shape==='arrow'||b.shape==='arrowDown'){if(b.shape==='arrow'){mrect(b.x-8,b.y-1,16,2,'#e8e4c8');mrect(b.vx>0?b.x+6:b.x-9,b.y-2,3,4,c);}else{mrect(b.x-1,b.y-8,2,16,'#e8e4c8');mrect(b.x-2,b.y+6,4,3,c);}return;}
 if(b.shape==='scythe'){g.save();g.translate(b.x,b.y);g.rotate(M.t*.4);g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(0,0,7,0,4.2);g.stroke();g.restore();return;}
 if(b.shape==='heart'){mansionDiamond(b.x,b.y,6,'#2a1030');mrect(b.x-4,b.y-3,3,3,c);mrect(b.x+1,b.y-3,3,3,c);mansionDiamond(b.x,b.y+1,3,c);return;}
 if(b.shape==='note'){mrect(b.x-3,b.y,5,4,c);mrect(b.x+1,b.y-7,2,8,c);mrect(b.x+1,b.y-7,4,2,c);return;}
 mansionDiamond(b.x,b.y,6,'#1a1030');mansionDiamond(b.x,b.y,4,c);mansionDiamond(b.x,b.y,2,'#fff6c8');}
function mansionKeikoWin(){const k=M.keiko,B=KEIKO_BOSSES[k.id],first=!M.flags[B.flag];k.state='done';M.messageT=0;M.enemyShots=[];M.shots=[];const e=mansionKeikoBoss();if(e){mansionBurst(e.x,e.y-24,'#c8b0ff',20);e.hp=e.maxHp;e.mode='idle';e.marks=[];e.lift=0;}M.hp=mansionMaxHP();
 const meet=()=>{const was=!M.flags[B.flag];M.flags[B.flag]=true;if(was)mansionShardGain(3,true);mansionSave();mansionBurst(256,KEIKO_FLOOR-24,B.col,18);sfx('heal');mansionTalkShow(B.real,was?B.post:['お疲れさま、海音！ いい腕試しだったよ。']);};
 mansionTalkShow(B.name,B.vanish,meet);M.talk.afterClose=meet;}
function mansionKeikoRetry(){const k=M.keiko,B=KEIKO_BOSSES[k.id];k.state='ready';M.enemyShots=[];M.shots=[];M.hp=mansionMaxHP();M.hurt=60;M.poseT=M.castT=M.stepT=0;M.x=80;M.y=KEIKO_FLOOR;M.vx=M.vy=0;const e=mansionKeikoBoss();if(e)Object.assign(e,mansionKeikoNew(k.id));mansionTalkShow(B.name,B.again,mansionKeikoStart);}
function mansionKeikoPortrait(p,c){const sp=M.talk?.speaker;let real=false,id=Object.keys(KEIKO_BOSSES).find(id=>KEIKO_BOSSES[id].name===sp||KEIKO_BOSSES[id].real+'？'===sp);if(!id){id=Object.keys(KEIKO_BOSSES).find(id=>KEIKO_BOSSES[id].real===sp);real=!!id;}if(!id)return false;c.setAttribute('aria-label',sp);const B=KEIKO_BOSSES[id],f=real&&HOSHI_ART['r_'+id+'Face'];
 if(f){p.imageSmoothingEnabled=f.img.width>64;p.drawImage(f.img,0,0,f.img.width,f.img.height,0,0,96,96);return true;}
 const a=HOSHI_ART[(real?'r_':'k_')+id];if(a&&a.mode==='sequel'){const fr=a.meta.frames[0],[rx,ry,rw]=fr.rect;p.imageSmoothingEnabled=true;p.drawImage(a.img,rx+rw*.3,ry+40,rw*.4,rw*.4,0,0,96,96);if(!real){p.fillStyle='rgba(120,90,200,.25)';p.fillRect(0,0,96,96);}return true;}
 p.fillStyle=real?'#1a1030':'#2a1a50';p.fillRect(0,0,96,96);p.fillStyle=B.col;p.fillRect(20,14,56,40);p.fillStyle='#f4dcd0';p.fillRect(28,26,40,36);p.fillStyle=B.sub;p.fillRect(16,66,64,30);if(!real){p.fillStyle='#fff';p.font='bold 28px sans-serif';p.fillText('?',60,40);}return true;}
// after the fight, the partner stays in her/his arena: talk to rematch
function mansionKeikoTalkNPC(){const k=M.keiko,B=KEIKO_BOSSES[k.id];mansionTalkShow(B.real,B.rematch,()=>{mansionTalkShow(B.name,['……呼んだ？ じゃあ、もう一回勝負！'],mansionKeikoStart);});}
for(const [id,B] of Object.entries(KEIKO_BOSSES))HUB_NPCS.push({id:'keiko_'+id,room:B.room,x:KEIKO_CAGE_X,y:KEIKO_FLOOR,name:B.real,enabled:()=>!!M.flags[B.flag]&&M.keiko&&M.keiko.state!=='active'&&M.keiko.state!=='ready',draw:(x,y,t,dir)=>keikoDraw(id,{x,y,t,face:dir,flash:0,lift:0},'idle',true),talk:mansionKeikoTalkNPC});

// the real friend's cage at the right end of each captive room (drawn behind actors)
function mansionKeikoCageDraw(){const k=M.keiko;if(!k)return;const B=KEIKO_BOSSES[k.id],freed=!!M.flags[B.flag],x=KEIKO_CAGE_X,y=KEIKO_FLOOR;
 if(!freed){g.globalAlpha=.85;keikoDraw(k.id,{x,y,t:M.t,face:-1,flash:0,lift:0},'idle',true);g.globalAlpha=1;
  mrect(x-30,y-70,60,4,'#8a8fa8');mrect(x-30,y-2,60,4,'#8a8fa8');for(let i=0;i<=6;i++)mrect(x-30+i*10,y-70,2,70,'#b8bdd0');g.globalAlpha=.18+.08*Math.sin(M.t*.1);mrect(x-30,y-70,60,70,'#b070ff');g.globalAlpha=1;}
 else{mrect(x-30,y-2,60,4,'#6a6f88');for(let i=0;i<=6;i+=6)mrect(x-30+i*10,y-24,2,24,'#8a8fa8');}}
