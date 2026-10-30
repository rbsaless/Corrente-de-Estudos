const K='corrente-estudos-v1';
const COLORS=['#6C5CE7','#00A878','#E8478B','#2D8CFF','#F59E0B','#14B8A6','#EF4444','#C026D3','#84CC16','#64748B'];
const MARKS=[3,7,14,30,60,90,100,120,150,180,200,250,300,365,400,500,600,700,800,900,1000].map(n=>[n,n>=500?'👑':n>=100?'💎':n>=30?'🏆':n>=14?'⚡':n>=7?'🔥':'🌱']);
const DIAS=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
let RK={},S=load(),showArch=false,showNoImp=false,tmSel='',tmLast=0,sel=COLORS[0],popId=null,tab='topics',filt='all',calM=null,calSel=null,calSub=null,calV=(()=>{try{return localStorage.getItem('corrente-cal-view')==='week'?'week':'month'}catch(e){return'month'}})(),calW=null,wkScroll=null;

function load(){try{const d=JSON.parse(localStorage.getItem(K));if(d&&Array.isArray(d.subjects))return d}catch(e){}return{subjects:[]}}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast('Não foi possível salvar neste navegador. Use o backup.')}}
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p2=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const parse=k=>new Date(k+'T12:00:00');
const now=()=>{const d=new Date();d.setHours(12,0,0,0);return d};
const monday=d=>addD(d,-((d.getDay()+6)%7));

function streak(s){let d=now();if(!(fmt(d) in s.days))d=addD(d,-1);let c=0;while(fmt(d) in s.days){c++;d=addD(d,-1)}return c}
function gstreak(){const {std,days}=stkSets();let d=now();if(!days.has(fmt(d)))d=addD(d,-1);let c=0;while(days.has(fmt(d))){if(std.has(fmt(d)))c++;d=addD(d,-1)}
 let b=0,r=0,p=null;[...days].sort().forEach(k=>{r=p&&fmt(addD(parse(p),1))===k?(std.has(k)?r+1:r):(std.has(k)?1:0);p=k;if(r>b)b=r});const h=S.rec&&S.rec.gstreak?S.rec.gstreak.v:0;return{c,b:Math.max(b,h,c)}}
function best(s){const k=Object.keys(s.days).sort();let b=0,c=0,prev=null;for(const x of k){c=prev&&fmt(addD(prev,1))===x?c+1:1;prev=parse(x);b=Math.max(b,c)}return b}
function weekCount(s,start){let c=0;for(let i=0;i<7;i++)if(fmt(addD(start,i)) in s.days)c++;return c}
const SS=s=>(s.sessions||[]).map(([a,b])=>({a:new Date(a),b:new Date(b),s}));
const mins=x=>(x.b-x.a)/6e4,hm=d=>p2(d.getHours())+':'+p2(d.getMinutes());
const iso=d=>fmt(d)+'T'+p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds());
const hh=m=>{m=Math.round(m);return m>=60?Math.floor(m/60)+'h'+p2(m%60):m+' min'};
const bd=k=>k.split('-').reverse().join('/');
function regDay(s,k,m,tm){
 if(!tm){s.days[k]=m;if(s.du&&s.du[k]>m)s.du[k]=m;return''}
 if(!(m>0))return'Informe os minutos para usar a hora de início.';
 const a=new Date(k+'T'+tm+':00'),b=new Date(a.getTime()+m*6e4);
 if(isNaN(a))return'Hora de início inválida.';
 if(b>new Date())return'Esse bloco terminaria no futuro. Ajuste a hora ou os minutos.';
 (s.sessions=s.sessions||[]).push([iso(a),iso(b)]);
 const ad=(d,x)=>s.days[fmt(d)]=(s.days[fmt(d)]||0)+Math.round(x);let c=a;
 while(fmt(c)<fmt(b)){const n=new Date(c.getFullYear(),c.getMonth(),c.getDate()+1);ad(c,(n-c)/6e4);c=n}
 if(b>c)ad(c,(b-c)/6e4);
 return''}
function clearDay(s,k){delete s.days[k];S.log=(S.log||[]).filter(x=>!(x.sid===s.id&&x.d===k));if(s.sessions)s.sessions=s.sessions.filter(x=>x[0].slice(0,10)!==k)}
function ago(s){const k=Object.keys(s.days).sort().pop();return k?diff(k,fmt(now())):null}
const agoTxt=s=>{const a=ago(s);return a==null?'Nunca estudado':a===0?'Estudado hoje':`Estudado há ${a} dia${pl(a)}`};

const diff=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const br=k=>k.split('-').reverse().slice(0,2).join('/');
const pl=n=>n===1?'':'s';
const cnt=(s,g)=>Object.keys(s.days).filter(k=>k>=g.start&&k<=g.end).length;

