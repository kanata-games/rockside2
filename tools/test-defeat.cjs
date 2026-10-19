const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{},elements=new Map(),listeners={},writes=[];function el(){const e={width:256,height:240,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},handlers:{},addEventListener:function(k,f){this.handlers[k]=f},setAttribute:noop,getBoundingClientRect:()=>({left:0,top:0,width:390,height:366}),setPointerCapture:noop};const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(e.width*e.height*4)}),measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});e.getContext=()=>context;return e;}const document={getElementById:k=>{if(!elements.has(k))elements.set(k,el());return elements.get(k)},createElement:()=>el(),querySelectorAll:()=>[],body:el(),addEventListener:noop};const images=[];class Image{constructor(){images.push(this);}set src(v){this._src=v;}get src(){return this._src;}}
const storage=new Map();const win={innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:(k,fn)=>(listeners[k] ||= []).push(fn)};const sandbox={window:win,document,Image,location:{search:'',href:'https://example.com/'},navigator:{userAgent:'test'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes.push(k);storage.set(k,v)},removeItem:k=>storage.delete(k)},URLSearchParams,requestAnimationFrame:noop,setTimeout:noop,performance:{now:()=>0},console,Uint8Array,Uint8ClampedArray,Int32Array,Math};vm.createContext(sandbox);const html=fs.readFileSync(require('path').resolve(__dirname,process.argv[2]||'../preview.html'),'utf8');vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox,{timeout:10000});const run=s=>vm.runInContext(s,sandbox,{timeout:10000});
function ticks(n){run(`for(let i=0;i<${n};i++)update()`)}
// test.63: losing a boss fight never chains into a re-fight.
run('setState("mansion");mansionStart(false)');
function viaDoor(room){return JSON.parse(run(`JSON.stringify((()=>{for(const [id,r] of Object.entries(MR))for(const d of (r.doors||[]))if(d.to===${JSON.stringify(room)}&&id!==${JSON.stringify(room)}&&mansionDoorAvailable(d))return{id,d};return null})())`));}
function defeat(label,room,start){const v=viaDoor(room);assert(v,label+': a door leads into '+room);
 run(`M.talk=null;M.map=false;M.keiko=null;mansionEnter(${JSON.stringify(v.id)},${v.d.x},${v.d.y});M.transition=0;`);
 run(`mansionEnterDoor(${JSON.stringify(v.d)});M.transition=0;M.talk=null;${start}`);assert.equal(run('M.room'),room,label+' entered');
 run('M.hurt=0;M.hp=1;mansionDamage(3,1)');
 const st=JSON.parse(run('JSON.stringify({room:M.room,talk:!!M.talk,hp:M.hp,max:mansionMaxHP(),hurt:M.hurt,face:M.face,x:M.x,w:MR[M.room].w,keiko:mansionKeikoActive(),hoshi:M.hoshiState,cam:!!M.bossCam,dice:M.diceState,spar:M.sparState,seiten:M.seitenState})'));
 assert.equal(st.room,v.id,label+': respawn outside, in the room the door came from');assert(!st.talk,label+': no retry dialogue');assert.equal(st.hp,st.max,label+': HP restored');
 assert(st.hurt>=60,label+': brief invulnerability');assert.equal(st.face,st.x<st.w/2?1:-1,label+': facing into the room, away from the door');
 assert(!st.keiko&&st.hoshi!=='active'&&!st.cam&&st.dice!=='active'&&st.spar!=='active'&&st.seiten!=='active',label+': no fight / arena lock');
 for(let i=0;i<180;i++){ticks(1);if(run('!!M.talk'))break;}
 assert(!run('M.talk')&&run('M.room')===v.id&&!run('mansionKeikoActive()')&&run('M.hoshiState')!=='active',label+': nothing auto-triggers after respawn');
 console.log(`  ${label}: lost in ${room} -> ${v.id} x=${Math.round(st.x)} face ${st.face}`);}
defeat('shade 霧弓ラヴィス','sNeen','M.flags[KEIKO_BOSSES.lavis.flag]=false;mansionKeikoEnter("sNeen");mansionKeikoStart();');
defeat('impostor リリリ','kLily','M.flags.keikoLily=false;mansionKeikoEnter("kLily");mansionKeikoStart();');
defeat('boss ダーク星詠み','obsDome','M.flags.hoshiyomiDefeated=false;mansionHoshiEnter("obsDome");M.hoshiState="active";');
// walking back in restarts the fight normally
{const v=viaDoor('kLily');run(`mansionEnterDoor(${JSON.stringify(v.d)});M.transition=0;`);run('keys.right=true');ticks(60);run('releaseAll()');assert(run('!!M.talk')||run('mansionKeikoActive()'),'walking back in starts the fight again');}
console.log('PASS boss defeat: shade / impostor / boss -> respawn outside the boss room, full HP, i-frames, facing away, no auto re-fight; walking back in restarts.');
