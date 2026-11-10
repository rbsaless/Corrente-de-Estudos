/* ===== Dificuldade por nível =====
   Carregar DEPOIS de faculdade.js e ANTES de lumi.js.
   Nível de dificuldade (S.dif.lv) é separado do nível de XP: sobe 1 a cada RAMPA dias até o maior nível de XP
   já alcançado (S.dif.tg) e cai 1 por semana sem bater o mínimo. Efeitos: mínimo da streak, lazer, ociosidade, preços. */
(()=>{
const RAMPA=3; /* dias entre cada subida do nível de dificuldade */
const minF=n=>Math.round((60+540*Math.pow((Math.max(1,Math.min(100,n))-1)/99,1.05))/5)*5; /* min/dia: nível 1=60, 100=600 */
const tt=()=>{const l=S.dif&&S.dif.lv||1;return(Math.max(1,Math.min(100,l))-1)/99};
const MUL=()=>{const t=tt();return{laz:1-.5*t,idle:1+t,preco:1+1.5*t}};
const f1=x=>x.toFixed(2).replace(/0$/,'').replace('.',',');

function floorAt(d){let m=0;if(S.dif&&Array.isArray(S.dif.h))S.dif.h.forEach(h=>{if(h.from<=d)m=minF(h.lv)});return m}
function difInit(){if(S.dif&&Array.isArray(S.dif.h))return S.dif;const t=fmt(now());return S.dif={lv:1,tg:1,ok:t,up:t,h:[{from:fmt(addD(now(),1)),lv:1}]}}
function difUpdate(){const d=difInit(),t=fmt(now());let ch=false,lc=false;
 const cur=lvInfo(xpRun().xp).n;
 if(stkQ(t)&&d.ok!==t){d.ok=t;ch=true}
 if(cur>d.tg&&diff(d.ok,t)<7){d.tg=cur;ch=true}
 let g=0;while(diff(d.ok,t)>=7&&g++<100){d.ok=fmt(addD(parse(d.ok),7));d.tg=Math.max(1,d.tg-1);ch=true}
 if(d.lv>d.tg){d.lv=d.tg;lc=true}
 else if(d.lv<d.tg&&diff(d.up,t)>=RAMPA){d.lv++;d.up=t;lc=true}
 if(lc){const f=fmt(addD(now(),1));d.h=d.h.filter(x=>x.from!==f);d.h.push({from:f,lv:d.lv});if(d.h.length>300)d.h.splice(0,d.h.length-300);ch=true}
 if(ch)save()}

/* 1) mínimo da streak: nunca abaixo do piso do nível (com histórico por data) */
const _sm=stkMin;stkMin=function(d){return Math.max(_sm.apply(this,arguments),floorAt(d))};

/* 2) lazer ganho */
const _lg=lzGain;lzGain=function(){const id=_lg.apply(this,arguments);
 if(id){const e=lzCfg().led.find(x=>x.id===id),k=MUL().laz;if(e&&k!==1)e.min=Math.round(e.min*k*100)/100}return id};

/* 3) ociosidade: escala temporariamente a taxa lr durante o cálculo */
const withIdle=(fn,rate)=>function(){const d=idCfg(),z=lzCfg(),o=d.lr,r=z.rate,m=MUL();d.lr=o*m.idle;if(rate)z.rate=r*m.laz;
 try{return fn.apply(this,arguments)}finally{d.lr=o;z.rate=r}};
idCharge=withIdle(idCharge);idRetro=withIdle(idRetro);pdlCalc=withIdle(pdlCalc);lpCtx=withIdle(lpCtx,true);

/* 4) preços da loja (itens grátis continuam grátis) */
const _si=shInfo;shInfo=function(){const I=_si.apply(this,arguments);if(I.price>0)I.price=Math.round(I.price*MUL().preco);return I};

/* Redução de mínimo da loja não baixa abaixo do piso */
document.addEventListener('click',e=>{const b=e.target.closest('[data-sp="min"]');if(!b)return;
 const v=parseInt((document.getElementById('sk-m')||{}).value),f=floorAt(fmt(now()));
 if(v<f){e.stopImmediatePropagation();toast('Seu nível exige no mínimo '+hh(f)+' por dia. Não dá para reduzir abaixo disso.')}},true);

/* Resumo na tela inicial */
const _rl=renderLvl;renderLvl=function(){const r=_rl.apply(this,arguments);
 try{const m=document.querySelector('#lvl .lvm');if(m&&S.dif){const M=MUL(),t=fmt(now()),n=fmt(addD(now(),1));
  m.insertAdjacentHTML('beforeend','<div class="lvx">⚙️ Dificuldade nível '+S.dif.lv+(S.dif.lv<S.dif.tg?' (subindo até '+S.dif.tg+')':'')+' · mínimo '+hh(Math.max(stkMin(t),floorAt(n)))+'/dia · lazer ×'+f1(M.laz)+' · ociosidade ×'+f1(M.idle)+' · preços ×'+f1(M.preco)+'</div>')}}catch(e){}
 return r};

const _r=render;render=function(){try{difUpdate()}catch(e){console.error('Dificuldade:',e)}return _r.apply(this,arguments)};
window.__dif={minF,floorAt,MUL,difUpdate};
})();
