/* ===== V93: Ligas semanais (segunda a sábado). Subir / permanecer / cair. Liga inicial calculada pelo histórico. ===== */
(()=>{
const LG=[['Ferro','#8b8aa8'],['Bronze','#cd7f32'],['Prata','#aab4c2'],['Ouro','#f5b301'],['Platina','#4fb8b2'],['Esmeralda','#10b981'],['Safira','#3b82f6'],['Rubi','#e5484d'],['Ametista','#9b5cff'],['Diamante','#38bdf8'],['Mestre','#f97316'],['Grão-Mestre','#dc2626'],['Desafiante','#14b8a6'],['Épica','#a855f7'],['Lendária','#eab308'],['Mítica','#ec4899'],['Celestial','#6366f1'],['Imortal','#f43f5e']];
const NL=LG.length,meta=L=>10+5*L;
const css=document.createElement('style');
css.textContent=`#lg .g4{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0}#lg .k{background:var(--bg);border-radius:16px;padding:12px 14px}#lg .k small{display:block;color:var(--muted);font-size:.78rem}#lg .k b{font:800 1.3rem "Bricolage Grotesque","DM Sans",sans-serif}
#lg .zb{position:relative;height:22px;border-radius:99px;overflow:hidden;display:flex;margin:14px 0 4px}#lg .zb i{display:block;height:100%}#lg .mk{position:absolute;top:-4px;width:4px;height:30px;background:var(--ink);border-radius:2px;box-shadow:0 0 0 2px var(--surface)}
#lg table{width:100%;border-collapse:collapse;font-size:.88rem}#lg th{text-align:left;color:var(--muted);font-weight:600;padding:7px 10px;border-bottom:1px solid var(--line)}#lg td{padding:6px 10px;border-bottom:1px solid var(--line)}#lg td.r,#lg th.r{text-align:right;white-space:nowrap}#lg tr.me td{background:var(--bg);font-weight:700}
#lg .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:middle}#lg .up{color:#00a878;font-weight:700}#lg .dn{color:#e5484d;font-weight:700}#lg .st{color:var(--muted);font-weight:700}#lg .sc{max-height:360px;overflow:auto;border:1px solid var(--line);border-radius:14px;margin-top:8px}`;
document.head.appendChild(css);
const addK=(k,n)=>fmt(addD(parse(k),n));
const wkOf=d=>fmt(monday(d));
const hrs=M=>{let m=0;for(let i=0;i<6;i++)m+=stkTot(addK(M,i));return m/60};   /* segunda a sábado; domingo não conta */
const lastDone=()=>{const M=wkOf(now());return fmt(now())>=addK(M,6)?M:addK(M,-7)};
const fmtH=h=>hh(Math.round(h*60));
const dm=k=>k.slice(8)+'/'+k.slice(5,7);
function cfg(){const g=S.leg=(S.leg&&typeof S.leg==='object')?S.leg:{};g.hist=Array.isArray(g.hist)?g.hist:[];g.lv=+g.lv||0;return g}
function firstStudy(){let f='';S.subjects.forEach(x=>Object.keys(x.days||{}).forEach(d=>{if((x.days[d]||0)>0&&(!f||d<f))f=d}));return f}
function init(){const g=cfg(),ld=lastDone(),fs=firstStudy(),fm=fs?wkOf(parse(fs)):'',ws=[];
 for(let i=0;i<4;i++){const M=addK(ld,-7*i);if(fm&&M>=fm)ws.push(M)}
 const hs=ws.map(M=>({w:M,h:Math.round(hrs(M)*100)/100})),avg=hs.length?hs.reduce((a,x)=>a+x.h,0)/hs.length:0;
 let lv=1;for(let L=1;L<=NL;L++)if(meta(L)<=avg)lv=L;
 g.lv=lv;g.wk=ld;g.safe=1;g.ini={avg:Math.round(avg*100)/100,n:hs.length};
 g.hist=hs.reverse().map(x=>({w:x.w,h:x.h,ref:1}));save();
 setTimeout(()=>toast('🏅 Você entrou na liga '+LG[lv-1][0]+(hs.length?' (média de '+fmtH(avg)+' por semana nas últimas '+hs.length+' semanas).':'.')),400)}
function settle(){const g=cfg();if(!g.lv)init();const ld=lastDone();let n=0,last=null;
 while(n++<60){const nx=addK(g.wk,7);if(nx>ld)break;
  const h=hrs(nx),L=g.lv;let to=L,r='stay',sp=0;
  if(L<NL&&h>=meta(L+1)){to=L+1;r='up'}else if(L>1&&h<meta(L)){if(g.safe)sp=1;else{to=L-1;r='down'}}
  const e={w:nx,h:Math.round(h*100)/100,from:L,to,r};if(sp)e.sp=1;g.hist.push(e);g.lv=to;g.wk=nx;g.safe=0;last={e,c:n}}
 if(last){if(g.hist.length>80)g.hist.splice(0,g.hist.length-80);save();const e=last.e,nm=LG[e.to-1][0];
  toast((last.c>1?last.c+' semanas fechadas. ':'')+'🏅 '+(e.r==='up'?'Subiu para '+nm+'! ('+fmtH(e.h)+')':e.r==='down'?'Caiu para '+nm+' ('+fmtH(e.h)+').':'Permaneceu na '+nm+' ('+fmtH(e.h)+').'+(e.sp?' Proteção da primeira semana.':'')))}}
function ligaRender(){const g=cfg();if(!g.lv)return;const L=g.lv,b=document.getElementById('lg-btn');if(b)b.textContent='🏅 Ligas · '+LG[L-1][0];
 const el=document.getElementById('lg');if(!el||curPage!=='ligas')return;
 const M=wkOf(now()),sun=fmt(now())>=addK(M,6),h=hrs(M),[nm,col]=LG[L-1],up=L<NL?meta(L+1):null,stay=meta(L),sc=Math.max(up||stay*1.2,h*1.05)||1,pc=v=>Math.min(100,v/sc*100);
 const zone=up&&h>=up?'up':h>=stay?'stay':L>1?'down':'low';
 const zt={up:'🟢 Zona de subida',stay:'🟡 Zona de permanência',down:'🔴 Zona de queda',low:'🟡 Abaixo da meta, mas a Ferro não tem liga abaixo'}[zone];
 let proj='';if(!sun){const d=Math.floor((parse(fmt(now()))-parse(M))/864e5),w0=new Date(),fr=(w0.getHours()+w0.getMinutes()/60)/24,n=Math.min(6,d+Math.max(.25,fr)),p=h/n*6;proj=`<div class="k"><small>Projeção no ritmo atual</small><b>${fmtH(p)}</b><small>estimativa até sábado</small></div>`}
 const need=zone==='up'?'':(zone==='stay'?(up?`Faltam <b>${fmtH(up-h)}</b> para subir.`:''):`Faltam <b>${fmtH(stay-h)}</b> para permanecer e <b>${fmtH(up?up-h:0)}</b> para subir.`);
 const lastE=g.hist.filter(x=>!x.ref).slice(-1)[0],res=sun&&lastE&&lastE.w===M?lastE:null;
 el.innerHTML=`<div class="mgs"><h2 style="display:flex;align-items:center;gap:10px"><span class="dot" style="background:${col};width:16px;height:16px"></span>Liga ${nm} <small style="color:var(--muted);font-weight:400">nível ${L} de ${NL}</small></h2>
 <p class="sub" style="margin:0">${sun?'Domingo: as ligas descansam. A semana de segunda a sábado já fechou.':'Semana de '+dm(M)+' a '+dm(addK(M,5))+' (fecha no sábado às 23:59).'}${g.ini&&!g.hist.some(x=>!x.ref)?' Liga inicial pela sua média de '+fmtH(g.ini.avg)+' por semana ('+g.ini.n+' sema'+(g.ini.n===1?'na':'nas')+'); a primeira semana não rebaixa.':''}</p>
 <div class="g4"><div class="k"><small>Horas na semana</small><b>${fmtH(h)}</b></div><div class="k"><small>Para permanecer</small><b>${fmtH(stay)}</b></div><div class="k"><small>Para subir${up?' ('+LG[L][0]+')':''}</small><b>${up?fmtH(up):'—'}</b></div>${proj}</div>
 <div class="zb"><i style="width:${pc(stay)}%;background:#e5484d"></i><i style="width:${up?pc(up)-pc(stay):100-pc(stay)}%;background:#f5b301"></i>${up?`<i style="flex:1;background:#00a878"></i>`:''}<span class="mk" style="left:calc(${pc(h)}% - 2px)"></span></div>
 <p class="sub" style="margin:2px 0 0">${zt}. ${need}${res?` <b>Resultado: ${res.r==='up'?'subiu':res.r==='down'?'caiu':'permaneceu'}.</b>`:''}</p></div>
 <div class="mgs"><h2>📜 Semanas</h2>${g.hist.length?`<div class="sc"><table><thead><tr><th>Semana</th><th class="r">Horas</th><th>Resultado</th></tr></thead><tbody>${g.hist.slice().reverse().slice(0,24).map(x=>`<tr><td>${dm(x.w)} a ${dm(addK(x.w,5))}</td><td class="r">${fmtH(x.h)}</td><td>${x.ref?'<span class="sub">referência da liga inicial</span>':x.r==='up'?`<span class="up">⬆ Subiu: ${LG[x.from-1][0]} → ${LG[x.to-1][0]}</span>`:x.r==='down'?`<span class="dn">⬇ Caiu: ${LG[x.from-1][0]} → ${LG[x.to-1][0]}</span>`:`<span class="st">➡ Permaneceu na ${LG[x.to-1][0]}</span>${x.sp?' <small>(proteção da 1ª semana)</small>':''}`}</td></tr>`).join('')}</tbody></table></div>`:'<p class="sub">Ainda não há semanas fechadas.</p>'}</div>
 <div class="mgs"><h2>🏅 Tabela das ligas</h2><div class="sc"><table><thead><tr><th>Nível</th><th>Liga</th><th class="r">Meta (seg a sáb)</th></tr></thead><tbody>${LG.map(([n,c],i)=>`<tr class="${i+1===L?'me':''}"><td>${i+1}</td><td><span class="dot" style="background:${c}"></span>${n}${i+1===L?' ← você':''}</td><td class="r">${meta(i+1)}h</td></tr>`).join('')}</tbody></table></div>
 <p class="sub" style="margin:10px 0 0"><b>Como funciona:</b> a meta da sua liga é o mínimo para <b>permanecer</b>; a meta da liga de cima é o que você precisa para <b>subir</b>; abaixo da sua meta você <b>cai</b>. Sempre uma liga por semana, sem outra punição. Só conta o estudo planejado de segunda a sábado.</p></div>`}
render=(f=>function(){try{settle()}catch(e){console.error('Ligas:',e)}const r=f.apply(this,arguments);try{ligaRender()}catch(e){console.error('Ligas:',e)}return r})(render);
window.__liga={cfg,settle,ligaRender,init,hrs,meta,LG};
})();

