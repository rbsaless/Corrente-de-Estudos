/* ===== Estatísticas do Banco de lazer (V87): SOMENTE LEITURA. Lê o mesmo registro do banco (S.lz.led) e o histórico do Terminal Lost (S.lost). ===== */
(()=>{
const $$=x=>document.getElementById(x);
let tab='bank',per='7',cat='all',dFrom='',dTo='',lim=100,dlim=15;
const DAY=864e5;
const css=document.createElement('style');
css.textContent=`#lzst .fl{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin:10px 0}#lzst .fl label{display:flex;flex-direction:column;gap:4px;font-size:.85rem;color:var(--muted)}#lzst .fl select,#lzst .fl input{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--ink);min-height:40px}
#lzst .g4{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0}#lzst .k{background:var(--bg);border-radius:16px;padding:12px 14px}#lzst .k small{display:block;color:var(--muted);font-size:.78rem}#lzst .k b{font:800 1.35rem "Bricolage Grotesque","DM Sans",sans-serif}#lzst .k b.p{color:#00a878}#lzst .k b.n{color:#e5484d}#lzst .k b.v{color:#7c5cff}#lzst .k b.a{color:#3b82f6}#lzst .k b.o{color:#f59e0b}
#lzst .sc{max-height:540px;overflow:auto;border:1px solid var(--line);border-radius:14px;margin-top:10px}#lzst table{width:100%;border-collapse:collapse;font-size:.88rem}#lzst th{position:sticky;top:0;background:var(--surface);text-align:left;color:var(--muted);font-weight:600;padding:8px 10px;border-bottom:1px solid var(--line)}#lzst td{padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}#lzst td.r,#lzst th.r{text-align:right;white-space:nowrap}#lzst td small{display:block;color:var(--muted)}#lzst .p{color:#00a878}#lzst .n{color:#e5484d}
#lzst .bd{display:inline-block;padding:2px 8px;border-radius:99px;font-size:.74rem;font-weight:700;color:#fff;white-space:nowrap}#lzst .rw{display:grid;grid-template-columns:170px 1fr 90px;gap:8px;align-items:center;margin:6px 0;font-size:.86rem}#lzst .rb{height:10px;background:var(--track);border-radius:99px;overflow:hidden}#lzst .rb i{display:block;height:100%;border-radius:99px}#lzst .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}#lzst .ok{color:#00a878;font-weight:700}#lzst .rk{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--line);font-size:.88rem}#lzst .rk small{display:block;color:var(--muted)}`;
document.head.appendChild(css);
const CATS={ganho:['Conquistado','#00a878'],bonus:['Bônus','#7c5cff'],perda:['Perdido','#e5484d'],uso:['Descanso','#3b82f6'],emp:['Empréstimo','#f59e0b'],div:['Dívida paga','#14b8a6'],rst:['Reset −10h','#f97316'],tk:['Ticket','#8b8aa8']};
const num=v=>String(Math.round(v*100)/100).replace('.',',');
const dkey=t=>{const d=new Date(t);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const dt=t=>{const q=new Date(t);return p2(q.getDate())+'/'+p2(q.getMonth()+1)+'/'+q.getFullYear()+' '+p2(q.getHours())+':'+p2(q.getMinutes())};
const ago=k=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-k);return d.getTime()};
const nextD=t=>{const d=new Date(t);d.setDate(d.getDate()+1);d.setHours(0,0,0,0);return d.getTime()};
const parseD=s=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(s||'');return m?new Date(+m[1],+m[2]-1,+m[3]).getTime():null};
function range(){const end=nextD(Date.now())-1;
 if(per==='today')return[ago(0),end];if(per==='7')return[ago(6),end];if(per==='30')return[ago(29),end];
 if(per==='month'){const d=new Date();return[new Date(d.getFullYear(),d.getMonth(),1).getTime(),end]}
 if(per==='custom'){const a=parseD(dFrom),b=parseD(dTo);return[a!=null?a:0,b!=null?nextD(b)-1:end]}
 return[0,end]}
function cls(x){const m=x.min||0,n=x.note||'',t=x.type,nm=esc(x.nm||'');
 if(t==='gain')return{c:'ganho',o:x.src==='elixir'?'Elixir do Reembolso':x.src==='timer'?'Estudo no cronômetro':'Estudo (registro manual)',d:nm+(x.st?' · '+lzN(x.st)+' estudados':'')};
 if(t==='bonus')return{c:'bonus',o:'Bônus de foco 5 ★',d:nm};
 if(t==='chal'&&/Reset de −10h/.test(n))return{c:'rst',o:'Reset de −10h',d:esc(n)};
 if(t==='chal'){if(/Ticket:/.test(n))return{c:'tk',o:'Ticket de descanso',d:esc(n)};
  return{c:'bonus',o:/Contrato/.test(n)?'Contratos':/Marco|esafio/.test(n)?'Desafios':/Baú/.test(n)?'Baú misterioso':/Loja/.test(n)?'Loja':'Prêmios',d:esc(n)}}
 if(t==='ton')return{c:'bonus',o:'Tudo ou Nada',d:esc(n)};
 if(t==='lumi')return{c:'bonus',o:'Lumi',d:esc(n)};
 if(t==='loan')return{c:'emp',o:'Empréstimo',d:'Deve '+lzN(x.owe||0)+' de estudo'};
 if(t==='pay')return{c:'div',o:/Loja|Baú|Poção|Reset/.test(x.nm||'')?x.nm:'Estudo',d:'Abateu '+lzN(x.st||0)+' de dívida'+(x.nm?' · '+nm:'')};
 if(t==='pun')return{c:'perda',o:/Terminal Lost/.test(n)?'Terminal Dharma':/Tudo ou Nada/.test(n)?'Tudo ou Nada':/Contrato/.test(n)?'Contratos':/esafio/.test(n)?'Desafios':'Punições',d:esc(n)+((x.owe||0)>0?' · gera dívida de '+lzN(x.owe):'')};
 if(t==='idle'&&/Estorno do Terminal/.test(n))return{c:'ganho',o:'Estorno do Terminal Dharma',d:esc(n)};
 if(t==='idle')return m<0?{c:'perda',o:'Ociosidade',d:esc(n||'Ociosidade')}:{c:'ganho',o:'Estorno de ociosidade',d:esc(n||'Correção retroativa')};
 if(t==='use')return{c:'uso',o:'Descanso',d:esc(n||'Descanso')};
 return{c:m<0?'perda':'ganho',o:'Outros',d:esc(n||t||'')}}
function build(){const A=lzCfg().led.map((x,i)=>({x,i})).sort((a,b)=>a.x.t-b.x.t||a.i-b.i);let run=0;
 return A.map(({x})=>{run=Math.round((run+(x.min||0))*1000)/1000;const c=cls(x);return{x,t:x.t,m:x.min||0,run,c:c.c,o:c.o,d:c.d}})}
function sum(R){const s={ganho:0,bonus:0,emp:0,perda:0,uso:0,tk:0,rst:0,net:0,dg:0,dp:0,n:R.length};
 R.forEach(r=>{const x=r.x;s.net+=r.m;if(r.c==='ganho')s.ganho+=r.m;else if(r.c==='bonus')s.bonus+=r.m;else if(r.c==='emp')s.emp+=r.m;else if(r.c==='perda')s.perda-=r.m;else if(r.c==='uso')s.uso-=r.m;else if(r.c==='tk')s.tk+=r.m;else if(r.c==='rst')s.rst+=r.m;
  if(x.type==='pun'||x.type==='loan')s.dg+=x.owe||0;if(x.type==='pay')s.dp+=x.st||0});
 s.desc=s.uso-s.tk;return s}
const inCat=(r,c)=>c==='all'||(c==='uso'?(r.c==='uso'||r.c==='tk'):c==='emp'?(r.c==='emp'||r.c==='div'||r.c==='rst'):r.c===c);
function dharma(){const l=S.lost&&typeof S.lost==='object'?S.lost:{},H=Array.isArray(l.hist)?l.hist:[],used=new Set();
 const fails=lzCfg().led.filter(x=>x.type==='pun'&&/Terminal Lost/.test(x.note||'')).sort((a,b)=>a.t-b.t).map(x=>{
  let k=-1;H.forEach((y,i)=>{if(k<0&&y.r==='f'&&!used.has(i)&&Math.abs(y.t-x.t)<8000)k=i});if(k>=0)used.add(k);const h=k>=0?H[k]:null,pm=/punição (\d+)/.exec(x.note||'');
  return{t:x.t,r:'f',ref:(l.rf||[]).includes(x.id),lz:-(x.min||0),pn:h&&h.pn?h.pn:(pm?+pm[1]:null),xp:h?h.xp:null,tst:!!(h&&h.tst),late:!!(h&&h.late)}});
 const oks=H.filter(y=>y.r==='o').map(y=>({t:y.t,r:'o',elo:3,tst:!!y.tst}));
 const ex=H.filter(y=>y.r==='x').map(y=>({t:y.t,r:'x'})),okT=l.codes||0,failT=l.fails||0,okTest=oks.filter(y=>y.tst).length,failTest=fails.filter(y=>y.tst).length;
 const okR=Math.max(0,okT-okTest),failR=Math.max(0,failT-failTest);
 return{l,fails,oks,okT,failT,okTest,failTest,okR,failR,rate:okR+failR>0?okR/(okR+failR):null,undated:Math.max(0,okT-oks.length),
  lzLost:fails.filter(y=>!y.ref).reduce((a,y)=>a+y.lz,0),xpKnown:fails.filter(y=>!y.ref).reduce((a,y)=>a+(y.xp>0?y.xp:0),0),xpUnk:fails.filter(y=>!y.ref&&y.xp==null).length,
  ev:fails.concat(oks,ex).sort((a,b)=>b.t-a.t)}}
function chart(R,a,b){const first=R.length?R[0].t:Date.now(),e=Math.min(b,Date.now());let s=(per==='all'||per==='custom')?Math.max(a,first):a;s=Math.max(s,ago(29));
 const days=[];for(let t=new Date(s).setHours(0,0,0,0);t<=e;t=nextD(t))days.push({t,k:dkey(t),pos:0,neg:0});
 const ix={};days.forEach((d,i)=>ix[d.k]=i);R.forEach(r=>{const i=ix[dkey(r.t)];if(i==null)return;if(r.c==='ganho'||r.c==='bonus'||r.c==='emp')days[i].pos+=r.m;else if(r.c==='perda')days[i].neg-=r.m});
 if(!days.length||!days.some(d=>d.pos||d.neg))return'<p class="sub">Sem movimentos neste período.</p>';
 const W=700,H=190,pl=40,pb=24,pt=12,n=days.length,mx=Math.max(1,...days.map(d=>Math.max(d.pos,d.neg))),bw=(W-pl)/n,h=H-pb-pt;let g='';
 days.forEach((d,i)=>{const x=pl+i*bw,w=Math.max(2,bw*.38),hp=d.pos/mx*h,hn=d.neg/mx*h,lb=d.k.slice(8)+'/'+d.k.slice(5,7);
  g+=`<rect x="${x+bw*.08}" y="${pt+h-hp}" width="${w}" height="${hp}" fill="#00a878" rx="2"><title>${lb}: +${lzN(d.pos)}</title></rect><rect x="${x+bw*.08+w+1}" y="${pt+h-hn}" width="${w}" height="${hn}" fill="#e5484d" rx="2"><title>${lb}: −${lzN(d.neg)}</title></rect>`;
  if(n<=12||i%Math.ceil(n/10)===0)g+=`<text x="${x+bw/2}" y="${H-8}" text-anchor="middle" font-size="10" style="fill:var(--muted)">${lb}</text>`});
 return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="Ganhos e perdas de lazer por dia"><line x1="${pl}" y1="${pt+h}" x2="${W}" y2="${pt+h}" style="stroke:var(--line)"/><text x="4" y="${pt+8}" font-size="10" style="fill:var(--muted)">${lzN(mx)}</text><text x="4" y="${pt+h}" font-size="10" style="fill:var(--muted)">0</text>${g}</svg><p class="sub" style="margin:4px 0 0"><span class="p">■</span> ganhos (conquistado + bônus + empréstimo) · <span class="n">■</span> perdas · últimos ${n} dia${n>1?'s':''} do período</p>`}
function bars(map,color){const E=Object.entries(map).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]),mx=E.length?E[0][1]:1,tot=E.reduce((a,e)=>a+e[1],0);
 return E.length?E.map(([k,v])=>`<div class="rw"><span>${esc(k)}</span><div class="rb"><i style="width:${Math.max(2,v/mx*100)}%;background:${color}"></i></div><b style="text-align:right">${lzN(v)} <small style="color:var(--muted);font-weight:400">${Math.round(v/tot*100)}%</small></b></div>`).join(''):'<p class="sub">Nada neste período.</p>'}
function streaks(R){const D={};R.forEach(r=>{const k=dkey(r.t);D[k]=(D[k]||0)+r.m});const ks=Object.keys(D).sort();if(!ks.length)return{cur:0,best:0};
 let best=0,run=0,prev=null;ks.forEach(k=>{const pos=D[k]>0;const consec=prev&&nextD(parseD(prev))===parseD(k);if(pos)run=consec&&run>0?run+1:1;else run=0;best=Math.max(best,run);prev=k});
 let cur=0,k=ago(0);if(D[dkey(k)]==null)k=ago(1);while(D[dkey(k)]>0){cur++;const d=new Date(k);d.setDate(d.getDate()-1);k=d.getTime()}return{cur,best}}
const rowV=r=>r.x.type==='pun'&&(r.x.owe||0)>0&&!r.m?`<b class="n">deve ${lzN(r.x.owe)}</b>`:r.x.type==='pay'?`<b class="p">−${lzN(r.x.st)} dívida</b>`:`<b class="${r.m<0?'n':r.m>0?'p':''}">${lzS(r.m)}</b>`;
const badge=c=>`<span class="bd" style="background:${CATS[c][1]}">${CATS[c][0]}</span>`;
function view(){const all=build(),[a,b]=range(),P=all.filter(r=>r.t>=a&&r.t<=b),F=P.filter(r=>inCat(r,cat)),S0=sum(P),z=lzCfg();return{all,a,b,P,F,S0,z}}
function renderStats(){const el=$$('lzst');if(!el||tab!=='st'||curPage!=='lazer')return;
 const{all,a,b,P,F,S0,z}=view(),D=dharma(),bal=lzBal(),deb=lzDebt(),sk=streaks(all);
 const gm={},lm={};P.forEach(r=>{if(r.c==='ganho'||r.c==='bonus'||r.c==='emp')gm[r.o]=(gm[r.o]||0)+r.m;else if(r.c==='perda'&&r.m<0)lm[r.o]=(lm[r.o]||0)-r.m});
 const dm={};P.forEach(r=>{const k=dkey(r.t);dm[k]=(dm[k]||0)+r.m});const dks=Object.keys(dm).sort(),ndays=Math.max(1,Math.round((Math.min(b,Date.now())-Math.max(a,all.length?all[0].t:Date.now()))/DAY)+1);
 const best=dks.reduce((o,k)=>!o||dm[k]>dm[o]?k:o,null),worst=dks.reduce((o,k)=>!o||dm[k]<dm[o]?k:o,null),fmtK=k=>k.slice(8)+'/'+k.slice(5,7)+'/'+k.slice(0,4);
 const top=P.filter(r=>r.m>0&&r.c!=='tk').sort((x,y)=>y.m-x.m).slice(0,5),low=P.filter(r=>r.m<0&&r.c==='perda').sort((x,y)=>x.m-y.m).slice(0,5);
 const rk=(L,neg)=>L.length?L.map(r=>`<div class="rk"><span>${esc(r.o)}<small>${dt(r.t)} · ${r.d}</small></span><b class="${neg?'n':'p'}">${lzS(r.m)}</b></div>`).join(''):'<p class="sub">Nada neste período.</p>';
 const ok=Math.abs(all.reduce((s,r)=>s+r.m,0)-bal)<.01;
 const dP=D.ev.filter(y=>y.t>=a&&y.t<=b),dPF=D.fails.filter(y=>!y.ref&&y.t>=a&&y.t<=b);
 const l=D.l,nextP=(l.pn||0)+1;
 const evRows=D.ev.slice(0,dlim).map(y=>y.r==='x'?`<tr><td>${dt(y.t)}</td><td><span class="bd" style="background:#8b8aa8">Ciclo isento</span> <small>ociosidade não contava</small></td><td class="r">sem punição</td></tr>`:y.r==='o'?`<tr><td>${dt(y.t)}</td><td><span class="bd" style="background:#00a878">Código aceito</span>${y.tst?' <small>🧪 teste</small>':''}</td><td class="r p">+${y.elo} Elos</td></tr>`
  :`<tr><td>${dt(y.t)}</td><td><span class="bd" style="background:#e5484d">Falha${y.pn?' nº '+y.pn:''}</span>${y.ref?' <small>↩ estornada (Correção retroativa)</small>':''}${y.tst?' <small>🧪 teste (punição real aplicada)</small>':''}${y.late?' <small>enquanto você estava fora</small>':''}</td><td class="r n">−${lzN(y.lz)} de lazer${y.xp>0?' · −'+y.xp+' XP':y.xp==null?' · XP não registrado':''}</td></tr>`).join('');
 el.innerHTML=`<div class="mgs"><h2>📊 Extrato do lazer</h2><p class="sub" style="margin:0">Somente leitura: tudo aqui vem do mesmo registro do banco, então sempre bate com o saldo. Para ajustar taxas, empréstimos ou descansos, use a aba Banco.</p>
 <div class="fl"><label>Período<select id="lzs-per">${[['all','Tudo'],['today','Hoje'],['7','Últimos 7 dias'],['30','Últimos 30 dias'],['month','Este mês'],['custom','Personalizado']].map(([v,n])=>`<option value="${v}"${per===v?' selected':''}>${n}</option>`).join('')}</select></label>
 ${per==='custom'?`<label>De<input type="date" id="lzs-from" value="${esc(dFrom)}"></label><label>Até<input type="date" id="lzs-to" value="${esc(dTo)}"></label>`:''}
 <label>Categoria<select id="lzs-cat">${[['all','Todas'],['ganho','Conquistados'],['bonus','Bônus'],['perda','Perdidos'],['uso','Descansos e tickets'],['emp','Empréstimos e dívidas']].map(([v,n])=>`<option value="${v}"${cat===v?' selected':''}>${n}</option>`).join('')}</select></label>
 <button class="btn" data-lzs="csv" type="button">⬇ Baixar CSV</button><button class="btn" data-lzs="print" type="button">🖨 Imprimir</button></div>
 <div class="g4"><div class="k"><small>Saldo atual do banco</small><b class="${bal<0?'n':''}">${bal<0?'−':''}${lzN(bal)}</b></div>
 <div class="k"><small>Conquistado (estudo)</small><b class="p">+${lzN(S0.ganho)}</b></div><div class="k"><small>Bônus</small><b class="v">+${lzN(S0.bonus)}</b></div>
 <div class="k"><small>Perdido</small><b class="n">−${lzN(S0.perda)}</b></div><div class="k"><small>Emprestado</small><b class="o">+${lzN(S0.emp)}</b></div>
 <div class="k"><small>Descansos (líquido)</small><b class="a">−${lzN(Math.max(0,S0.desc))}</b></div>${S0.rst>0?`<div class="k"><small>Perdão do reset de −10h</small><b class="o">+${lzN(S0.rst)}</b></div>`:''}
 <div class="k"><small>Dívida de estudo (gerada / paga)</small><b>${lzN(S0.dg)} / ${lzN(S0.dp)}</b></div><div class="k"><small>Variação no período</small><b class="${S0.net<0?'n':'p'}">${lzS(Math.round(S0.net*100)/100)}</b></div></div>
 <p class="sub" style="margin:0 0 6px">${per==='all'?(ok?'<span class="ok">✔ Conferência:</span> a soma de todas as linhas é igual ao saldo do banco.':'⚠ A soma das linhas difere do saldo atual do banco.'):'Conferência com o saldo só aparece no período “Tudo”.'}${deb>0?` Dívida em aberto agora: <b>${lzN(deb)}</b> de estudo.`:''} Tickets de descanso entram só no cálculo líquido de descansos.</p>
 <div class="sc"><table><thead><tr><th>Data e hora</th><th>Categoria</th><th>Descrição</th><th class="r">Valor</th><th class="r">Saldo após</th></tr></thead><tbody>
 ${F.slice().reverse().slice(0,lim).map(r=>`<tr><td>${dt(r.t)}</td><td>${badge(r.c)}<small>${esc(r.o)}</small></td><td>${r.d}</td><td class="r">${rowV(r)}</td><td class="r">${r.run<0?'−':''}${lzN(r.run)}</td></tr>`).join('')||'<tr><td colspan="5"><span class="sub">Nenhum lançamento neste filtro.</span></td></tr>'}
 </tbody></table></div>${F.length>lim?`<button class="btn" style="margin-top:10px" data-lzs="more" type="button">Mostrar mais (${F.length-lim} restantes)</button>`:''}<p class="sub" style="margin:8px 0 0">${F.length} lançamento${F.length===1?'':'s'} neste filtro.</p></div>
 <div class="mgs"><h2>📈 Análises do período</h2>${chart(P,a,b)}
 <div class="cols" style="margin-top:14px"><div><h3 style="margin-top:0">De onde vem o tempo</h3>${bars(gm,'#00a878')}</div><div><h3 style="margin-top:0">Para onde ele vai (perdas)</h3>${bars(lm,'#e5484d')}</div></div>
 <div class="g4"><div class="k"><small>Média diária líquida</small><b class="${S0.net<0?'n':'p'}">${lzS(Math.round(S0.net/ndays*10)/10)}</b></div>
 <div class="k"><small>Melhor dia</small><b class="p">${best?lzS(Math.round(dm[best]*10)/10):'—'}</b><small>${best?fmtK(best):''}</small></div>
 <div class="k"><small>Pior dia</small><b class="n">${worst?lzS(Math.round(dm[worst]*10)/10):'—'}</b><small>${worst?fmtK(worst):''}</small></div>
 <div class="k"><small>Dias seguidos no positivo</small><b>${sk.cur}</b><small>recorde: ${sk.best}</small></div></div>
 <div class="cols"><div><h3>🏆 Maiores ganhos</h3>${rk(top,0)}</div><div><h3>💥 Maiores perdas</h3>${rk(low,1)}</div></div></div>
 <div class="mgs"><h2>☢️ Terminal Dharma (Lost)</h2><p class="sub" style="margin:0">Visão só de leitura. Para ativar, desativar ou digitar o código, use o Terminal.</p>
 <div class="g4"><div class="k"><small>Situação</small><b>${l.on?'Ativo':'Desativado'}</b><small>${l.on&&l.end?'ciclo termina '+dt(l.end):''}</small></div>
 <div class="k"><small>Códigos aceitos</small><b class="p">${D.okR}</b><small>${D.okTest?D.okTest+' em testes não contam':''}</small></div>
 <div class="k"><small>Falhas</small><b class="n">${D.failR}</b><small>${D.failTest?D.failTest+' em testes não contam':''}</small></div>
 <div class="k"><small>Taxa de acerto</small><b>${D.rate==null?'—':Math.round(D.rate*100)+'%'}</b></div>
 <div class="k"><small>Sequência atual / recorde</small><b>${l.streak||0} / ${l.best||0}</b></div>
 <div class="k"><small>Elos ganhos</small><b class="v">+${D.okT*3}</b><small>3 por código</small></div>
 <div class="k"><small>Lazer perdido (total)</small><b class="n">−${lzN(D.lzLost)}</b></div>
 <div class="k"><small>XP perdido (registrado)</small><b class="n">−${Math.round(D.xpKnown)}</b><small>${D.xpUnk?D.xpUnk+' falha'+(D.xpUnk>1?'s':'')+' antiga'+(D.xpUnk>1?'s':'')+' sem XP registrado':''}</small></div>
 <div class="k"><small>Próxima falha custa</small><b class="n">−30min</b><small>+ XP do nível atual zerado</small></div>
 <div class="k"><small>No período: falhas / lazer perdido</small><b>${dPF.length} / −${lzN(dPF.reduce((s,y)=>s+y.lz,0))}</b></div></div>
 <h3>Histórico de ciclos</h3><div class="sc"><table><thead><tr><th>Data e hora</th><th>Resultado</th><th class="r">Impacto</th></tr></thead><tbody>${evRows||'<tr><td colspan="3"><span class="sub">Nenhum ciclo registrado ainda.</span></td></tr>'}</tbody></table></div>
 ${D.ev.length>dlim?`<button class="btn" style="margin-top:10px" data-lzs="dmore" type="button">Mostrar mais ciclos (${D.ev.length-dlim} restantes)</button>`:''}
 <p class="sub" style="margin:8px 0 0">As falhas antigas foram reconstruídas do extrato do lazer (data, lazer perdido e número da punição). ${D.undated?`Existem <b>${D.undated}</b> código${D.undated>1?'s':''} aceito${D.undated>1?'s':''} de antes desta atualização, contado${D.undated>1?'s':''} nos totais mas sem data. `:''}Ciclos que venceram com o app fechado contam desde que zeraram; os que caíram em período sem cobrança de ociosidade aparecem como isentos, e falhas dentro de uma Correção retroativa aparecem como estornadas. A partir de agora, cada código e cada falha são registrados com data, lazer e XP. Ciclos de teste ficam marcados e não entram na taxa de acerto, mas a punição de uma falha em teste é real e aparece no extrato.</p></div>`}
function csv(){const{F}=view(),q=s=>'"'+String(s).replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/"/g,'""')+'"';
 const L=['Data;Hora;Categoria;Origem;Descrição;Valor (min);Dívida gerada (min);Dívida paga (min);Saldo após (min)'];
 F.forEach(r=>{const d=new Date(r.t);L.push([p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear(),p2(d.getHours())+':'+p2(d.getMinutes()),CATS[r.c][0],q(r.o),q(r.d),num(r.m),num(r.x.type==='pun'||r.x.type==='loan'?(r.x.owe||0):0),num(r.x.type==='pay'?(r.x.st||0):0),num(r.run)].join(';'))});
 const blob=new Blob(['\ufeff'+L.join('\r\n')],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='extrato-lazer-'+dkey(Date.now())+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Extrato exportado em CSV ('+F.length+' linhas).')}
function prn(){const{F,S0}=view(),D=dharma(),f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);
 const d=f.contentWindow.document;d.open();d.write(`<!doctype html><meta charset="utf-8"><title>Extrato do banco de lazer</title><style>body{font:12px/1.4 sans-serif;color:#111;margin:20px}h1{font-size:18px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ccc;padding:4px 6px;text-align:left;vertical-align:top}.r{text-align:right;white-space:nowrap}.s td{border:0;padding:2px 6px}small{color:#666}</style>
 <h1>Extrato do banco de lazer</h1><p>Gerado em ${dt(Date.now())} · saldo atual: ${lzS(lzBal())}</p>
 <table class="s"><tr><td>Conquistado: +${lzN(S0.ganho)}</td><td>Bônus: +${lzN(S0.bonus)}</td><td>Perdido: −${lzN(S0.perda)}</td><td>Emprestado: +${lzN(S0.emp)}</td><td>Descansos (líquido): −${lzN(Math.max(0,S0.desc))}</td><td>Variação: ${lzS(Math.round(S0.net*100)/100)}</td></tr></table>
 <p>Terminal Dharma: ${D.okR} códigos aceitos · ${D.failR} falhas · lazer perdido −${lzN(D.lzLost)} · Elos +${D.okT*3}</p>
 <table><thead><tr><th>Data e hora</th><th>Categoria</th><th>Descrição</th><th class="r">Valor</th><th class="r">Saldo após</th></tr></thead><tbody>${F.slice().reverse().map(r=>`<tr><td>${dt(r.t)}</td><td>${CATS[r.c][0]}<br><small>${esc(r.o)}</small></td><td>${r.d}</td><td class="r">${r.x.type==='pun'&&(r.x.owe||0)>0&&!r.m?'deve '+lzN(r.x.owe):r.x.type==='pay'?'−'+lzN(r.x.st)+' dívida':lzS(r.m)}</td><td class="r">${r.run<0?'−':''}${lzN(r.run)}</td></tr>`).join('')}</tbody></table>`);d.close();
 setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){toast('Não consegui abrir a impressão.')}setTimeout(()=>f.remove(),1500)},300)}
function setTab(v){tab=v;const a=$$('lz'),b=$$('lzst');if(a)a.hidden=v==='st';if(b)b.hidden=v!=='st';document.querySelectorAll('[data-lzt]').forEach(x=>x.classList.toggle('on',x.dataset.lzt===v));if(v==='st')renderStats()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-lzt]');if(t){setTab(t.dataset.lzt);return}
 const b=e.target.closest('[data-lzs]');if(!b)return;const a=b.dataset.lzs;
 if(a==='more'){lim+=100;renderStats()}else if(a==='dmore'){dlim+=20;renderStats()}else if(a==='csv')csv();else if(a==='print')prn()});
document.addEventListener('change',e=>{const id=e.target.id;
 if(id==='lzs-per'){per=e.target.value;lim=100;renderStats()}else if(id==='lzs-cat'){cat=e.target.value;lim=100;renderStats()}
 else if(id==='lzs-from'){dFrom=e.target.value;lim=100;renderStats()}else if(id==='lzs-to'){dTo=e.target.value;lim=100;renderStats()}});
renderLazer=(f=>function(){const r=f.apply(this,arguments);try{renderStats()}catch(e){console.error('Estatísticas:',e)}return r})(renderLazer);
window.__lzst={cls,build,sum,dharma,view,renderStats,setTab,csv};
})();

