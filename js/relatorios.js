/* ----- Relatório semanal ----- */
/* ----- Relatório: diário, semanal, mensal e anual ----- */
let rV='week',rOff=-1,rTab='rel';
const wkKeys=off=>{const m=addD(monday(now()),7*off);return Array.from({length:7},(_,i)=>fmt(addD(m,i)))};
const keysMin=(keys,s)=>keys.reduce((a,k)=>a+(s.days[k]||0),0);
const RN={day:'diário',week:'semanal',month:'mensal',year:'anual'},RU={day:'dia',week:'semana',month:'mês',year:'ano'},RP={day:'dias',week:'semanas',month:'meses',year:'anos'};
const pKey=(v,P)=>v+':'+P.keys[0];
/* Retrato das metas: a lista de metas do período atual é copiada a cada render e congela quando o período fecha. */
const goalsOf=(v,P)=>{const sn=(S.snap||{})[pKey(v,P)];return sn||(S.mg||[]).filter(g=>g.scope===v)};
function snapSync(){let ch=false;S.snap=S.snap||{};['day','week','month','year'].forEach(v=>{const k=pKey(v,hPeriod(v,0)),j=JSON.stringify((S.mg||[]).filter(g=>g.scope===v));if(JSON.stringify(S.snap[k])!==j){S.snap[k]=JSON.parse(j);ch=true}});return ch}
function reflHtml(v,P){const r=(S.refl||{})[pKey(v,P)];if(!r||!(r.w||r.a))return'';
 return`<div class='hrow' style='--c:var(--flame)'><div class='hh2'><b>📝 Reflexão do período</b></div>${r.w?`<p class='sub' style='margin:4px 0'><b style='color:var(--ink)'>O que funcionou:</b> ${esc(r.w)}</p>`:''}${r.a?`<p class='sub' style='margin:4px 0'><b style='color:var(--ink)'>O que ajustar:</b> ${esc(r.a)}</p>`:''}</div>`}
function repData(v,off){
 const P=hPeriod(v,off),Q=hPeriod(v,off-1),keys=P.keys,t=fmt(now()),A=S.subjects.filter(s=>!s.arch),
  act=A.map(s=>({s,m:keysMin(keys,s)})).sort((x,y)=>y.m-x.m),tot=S.subjects.reduce((a,s)=>a+keysMin(keys,s),0),
  prev=S.subjects.reduce((a,s)=>a+keysMin(Q.keys,s),0),days=new Set(),st=act.filter(o=>o.m>0);
 S.subjects.forEach(s=>keys.forEach(k=>{if(k in s.days)days.add(k)}));
 const gl=goalsOf(v,P).map(g=>({g,i:mgCalc(g,keys)})).filter(o=>!o.i.gone),old=[];
 S.subjects.forEach(s=>(s.goals||[]).forEach(g=>{if(keys.includes(g.end)){const i=goalInfo(s,g);old.push({s,g,i,ok:i.pct>=100})}}));
 const lg=(S.log||[]).filter(x=>keys.includes(x.d)&&x.f>0),T=allTasks().filter(o=>o.x.date&&keys.includes(o.x.date)&&!o.x.exam),
  noTime=keys.filter(k=>S.subjects.some(s=>k in s.days)&&S.subjects.reduce((a,s)=>a+(s.days[k]||0),0)===0).length;
 return{v,off,P,keys,tot,prev,act,days:days.size,gl,old,nfa:lg.length,fa:lg.length?lg.reduce((a,x)=>a+x.f,0)/lg.length:0,xp:Math.floor(tot*100/60+xbSum(keys[0],keys[keys.length-1])+chAdj(keys[0],keys[keys.length-1],1)),xb:Math.floor(xbSum(keys[0],keys[keys.length-1])+chAdj(keys[0],keys[keys.length-1],1)),
  most:st[0]||null,least:st.length>=2?st[st.length-1]:null,lo:act.length>1?act[act.length-1]:null,tk:{n:T.length,d:T.filter(o=>o.x.done).length},noTime,cur:keys.includes(t)}}
function repChart(d){
 const v=d.v,K=d.keys,dm=k=>S.subjects.reduce((a,s)=>a+(s.days[k]||0),0);let it,note='',extra='';
 if(v==='day'){const h=Array(24).fill(0),d0=new Date(K[0]+'T00:00:00').getTime();
  S.subjects.forEach(s=>SS(s).forEach(x=>{for(let i=0;i<24;i++){const a=d0+i*36e5,o=Math.min(x.b,a+36e5)-Math.max(x.a,a);if(o>0)h[i]+=o/6e4}}));
  const un=dm(K[0])-h.reduce((a,b)=>a+b,0);if(un>=2)note=`${hh(un)} sem horário registrado não aparecem no gráfico.`;return dayChart(h,K[0],note)}
 else if(v==='week'){it=K.map((k,i)=>[DIAS[i],dm(k)]);
  const hw=Array(24).fill(0),nd=K.filter(k=>dm(k)>0).length;
  K.forEach(k=>{const d0=new Date(k+'T00:00:00').getTime();S.subjects.forEach(s=>SS(s).forEach(x=>{for(let i=0;i<24;i++){const a=d0+i*36e5,o=Math.min(x.b,a+36e5)-Math.max(x.a,a);if(o>0)hw[i]+=o/6e4}}))});
  if(nd&&hw.some(m=>m>=1)){const av=hw.map(m=>m/nd),pk=av.indexOf(Math.max(...av));
   extra=`<h3>Horário de mais foco (média dos dias com estudo)</h3>${dayChart(av,'','')}<p class="sub" style="margin:4px 0 0;font-size:.8rem">⏰ Pico médio: <b style="color:var(--ink)">${pk}h–${pk+1}h</b> (${hh(Math.round(av[pk]))} por dia, em média). Barras = minutos por hora, média de ${nd} dia${nd===1?'':'s'} com estudo.</p>`}}
 else if(v==='month'){it=[];K.forEach((k,i)=>{const w=Math.floor(i/7);it[w]=it[w]||['S'+(w+1),0];it[w][1]+=dm(k)})}
 else{it=MESES.map(m=>[m.slice(0,3),0]);K.forEach(k=>{it[+k.slice(5,7)-1][1]+=dm(k)})}
 const mx=Math.max(...it.map(o=>o[1]),1);
 return`<div class="bars" style="height:110px;gap:${it.length>12?3:8}px;margin-top:8px">${it.map(([l,m])=>`<div title="${hh(m)}"><span style="height:${m/mx*100}%;--c:var(--flame)"></span>${l}</div>`).join('')}</div>${note?`<p class="sub" style="margin:4px 0 0;font-size:.8rem">${note}</p>`:''}${extra}`}
function dayChart(h,key,note){const mx=Math.max(...h,1),cur=key===fmt(now())?new Date().getHours():-1,sm=m=>m>=3?Math.round(m):'';
 return`<div style="display:flex;align-items:flex-end;gap:3px;height:140px;margin-top:8px">${h.map((m,i)=>`<div title="${i}h: ${hh(Math.round(m))}" style="flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center"><small style="font-size:.6rem;color:var(--muted);height:14px;line-height:14px">${sm(m)}</small><span style="display:block;width:100%;height:${m>0?Math.max(3,m/mx*84):1.5}%;background:var(--flame);opacity:${m>0?1:.25};border-radius:3px 3px 0 0;${i===cur?'outline:2px solid var(--ink);':''}"></span></div>`).join('')}</div><div style="display:flex;gap:3px;margin-top:4px">${h.map((m,i)=>`<div style="flex:1;text-align:center;font-size:.62rem;color:var(--muted)">${i%3===0?i+'h':''}</div>`).join('')}</div><p class="sub" style="margin:4px 0 0;font-size:.8rem">Minutos estudados em cada hora${cur>=0?' · contorno = hora atual':''}.</p>${note?`<p class="sub" style="margin:4px 0 0;font-size:.8rem">${note}</p>`:''}`}
function repExtra(d){const v=d.v,K=d.keys,t=fmt(now()),f=x=>x>0?hh(Math.round(x)):'0 min',T=d.tot;
 if(v==='day'){const d0=new Date(K[0]+'T00:00:00').getTime(),e0=d0+864e5,ses=[],h=Array(24).fill(0);
  S.subjects.forEach(s=>SS(s).forEach(x=>{const a=Math.max(x.a,d0),b=Math.min(x.b,e0);if(b>a){ses.push([a,b]);for(let i=0;i<24;i++){const o=Math.min(b,d0+(i+1)*36e5)-Math.max(a,d0+i*36e5);if(o>0)h[i]+=o/6e4}}}));
  if(!ses.length)return'';ses.sort((x,y)=>x[0]-y[0]);const lg=Math.max(...ses.map(x=>x[1]-x[0]))/6e4,pk=h.indexOf(Math.max(...h)),ac=h.filter(x=>x>=1).length;
  return`<div><b>${hm(new Date(ses[0][0]))}–${hm(new Date(ses[ses.length-1][1]))}</b><span>primeira e última sessão</span></div><div><b>${ses.length}</b><span>sessões · maior ${f(lg)}</span></div><div><b>${pk}h–${pk+1}h</b><span>hora de pico (${f(h[pk])})</span></div><div><b>${ac}</b><span>hora${ac===1?'':'s'} com estudo</span></div>`}
 const n=K.length,past=K.filter(k=>k<=t).length;let o=`<div><b>${f(T/n)}</b><span>média por dia${past<n?' (dias futuros contam 0)':''}</span></div>`;
 if(past<n&&past>0)o+=`<div><b>${f(T/past)}</b><span>média por dia só até hoje</span></div>`;
 if(v==='month')o+=`<div><b>${f(T/(n/7))}</b><span>média por semana${past<n?' (futuro conta 0)':''}</span></div>`;
 if(v==='year')o+=`<div><b>${f(T/12)}</b><span>média por mês${past<n?' (meses futuros contam 0)':''}</span></div>`;
 return o}
function yearMet(d){const y=+d.P.label,t=fmt(now()),r={week:[0,0],month:[0,0],year:[0,0]},t0=now();
 const f0=S.subjects.reduce((m,s)=>Object.keys(s.days).reduce((q,k)=>k<q?k:q,m),'9999'),add=(v,P)=>{if(v!=='year'&&(P.keys[P.keys.length-1]>=t||P.keys[P.keys.length-1]<f0))return;goalsOf(v,P).forEach(g=>{const i=mgCalc(g,P.keys);if(i.gone)return;r[v][1]++;if(i.ok)r[v][0]++})};
 for(let w=-260;w<=0;w++){const P=hPeriod('week',w);if(parse(P.keys[0]).getFullYear()===y&&parse(P.keys[6]).getFullYear()===y)add('week',P)}
 for(let m=0;m<12;m++)add('month',hPeriod('month',(y-t0.getFullYear())*12+m-t0.getMonth()));
 add('year',d.P);return r}
function focusTips(){
 const L=(S.log||[]).filter(x=>x.f>0&&x.h!=null),out=[],bk=BUCKETS.map(([n,a,b])=>({n,a:L.filter(x=>x.h>=a&&x.h<b)})).filter(o=>o.a.length>=2).sort((x,y)=>y.a.reduce((s,o)=>s+o.f,0)/y.a.length-x.a.reduce((s,o)=>s+o.f,0)/x.a.length)[0];
 const bs=S.subjects.map(s=>({s,a:L.filter(x=>x.sid===s.id)})).filter(o=>o.a.length>=2).sort((x,y)=>y.a.reduce((s,o)=>s+o.f,0)/y.a.length-x.a.reduce((s,o)=>s+o.f,0)/x.a.length)[0];
 if(bk)out.push(`🧠 Você rende mais na <b>${bk.n.split(' (')[0].toLowerCase()}</b>${bs?` e tem mais foco em <b>${esc(bs.s.name)}</b>`:''}. Reserve esse horário para o que é mais difícil.`);return out}
function repTips(d){
 const v=d.v,t=fmt(now()),dn=new Date(),mNow=dn.getHours()*60+dn.getMinutes(),u=RU[v],L=[],left=d.keys.filter(k=>k>=t).length;let act=null,def=false;
 const avgPrev=n=>{let a=0,c=0;for(let i=1;i<=n;i++){const q=hPeriod(v,d.off-i).keys,m=S.subjects.reduce((x,s)=>x+keysMin(q,s),0);if(m>0){a+=m;c++}}return c?a/c:0};
 if(!d.cur){
  const n=d.gl.length,ok=d.gl.filter(o=>o.i.ok).length;
  if(n){L.push(`🎯 Metas: <b>${ok} de ${n}</b> batida${pl(ok)}.`);d.gl.filter(o=>!o.i.ok).slice(0,3).forEach(o=>L.push(`A meta “${goalLabel(o.g)}” ficou em ${o.i.pct}%. Ajuste o valor ou reserve horários fixos.`))}
  const av=avgPrev(4);if(av&&d.tot){const p=Math.round((d.tot-av)/av*100);L.push(`📊 Tendência: ${Math.abs(p)<5?'em linha com a média':p>0?p+'% acima da média':Math.abs(p)+'% abaixo da média'} dos últimos 4 ${RP[v]} (${hh(av)}).`)}
  if(d.lo&&d.most&&d.lo.s!==d.most.s&&d.lo.m<d.most.m*.5)L.push(`Para o próximo ${u}, dê mais atenção a <b>${esc(d.lo.s.name)}</b>: ${d.lo.m?'só '+hh(d.lo.m):'não foi estudada'}.`);
  if(v==='week'&&d.days<5)L.push(`Você estudou em ${d.days} dia${pl(d.days)}. Mirar em 5 ou mais fortalece a corrente.`);
  exams().filter(o=>o.n<=14).slice(0,2).forEach(o=>L.push(`📝 Prova de <b>${esc(o.s.name)}</b> ${o.n===0?'é hoje':'em '+o.n+' dia'+pl(o.n)}: reserve tempo para ela.`));
  return{L:L.concat(focusTips()),act}}
 const sum=S.subjects.reduce((a,s)=>a+(s.days[t]||0),0),avg14=(()=>{let a=0;for(let i=1;i<=14;i++){const k=fmt(addD(now(),-i));S.subjects.forEach(s=>a+=s.days[k]||0)}return a/14})();
 const tg=d.gl.filter(o=>o.g.type!=='weekdays');
 d.gl.filter(o=>!o.i.ok).forEach(o=>{const g=o.g,i=o.i;let line=`🎯 <b>${goalLabel(g)}</b>: ${i.msg}${i.fc?' '+i.fc:''}`;def=true;
  if(g.type==='weekdays'){const pd=d.keys.filter(k=>k>=t&&g.wd.includes((parse(k).getDay()+6)%7)&&!(k in i.s.days)).map(k=>DNAMES[(parse(k).getDay()+6)%7]);if(pd.length)line+=` Dias planejados que restam: ${pd.join(', ')}.`}
  else{const m=g.type==='total'?mgSubs(g).reduce((a,x)=>a+hMin(x,d.keys),0):hMin(i.s,d.keys),need=Math.max(0,g.min-m),room=v==='day'?1440-mNow:left*960;
   if(need>room)line+=' ⚠️ Já está fora de alcance neste '+u+'. Considere ajustar a meta.';
   else if(v==='day'&&need>0){const nb=Math.floor(Math.min(need,1440-mNow)/40);line+=` Agora são ${hm(dn)}: restam ${hh(1440-mNow)} no dia e cabem ${nb} bloco${pl(nb)} de 40 min.`}}
  L.push(line)});
 if(!tg.length){const n=v==='day'?7:4,av=avgPrev(n),ref=Math.round(av/15)*15;
  if(ref>0){const need=ref-d.tot;L.push(`🎯 Sem meta de tempo neste ${u}. Usei como referência a média dos últimos ${n} ${RP[v]} (${hh(ref)}). ${need>0?`Faltam <b>${hh(need)}</b>${left>1?` (≈${hh(need/left)}/dia nos ${left} dias restantes)`:''}.`:'Você já passou dela. 👏'}`);if(need>0)def=true}}
 const pend=allTasks().filter(o=>o.x.date&&d.keys.includes(o.x.date)&&!o.x.done&&!o.x.exam),est=pend.reduce((a,o)=>a+(o.x.est||0),0),cap=Math.round(avg14*left);
 if(pend.length)L.push(`📋 ${pend.length} tarefa${pl(pend.length)} pendente${pl(pend.length)} neste ${u}${est?` (≈${hh(est)} estimados). Pelo seu ritmo (≈${hh(avg14)}/dia) cabem ≈${hh(cap)}: ${est>cap?'pode faltar tempo, priorize ou reagende':'cabe no seu ritmo'}.`:'.'}`);
 const late=allTasks().filter(o=>!o.s.arch&&!o.x.done&&!o.x.exam&&o.x.date&&o.x.date<t).length,rv=(S.rev||[]).filter(r=>!r.done&&r.date<t&&revValid(r)).length;
 if(late)L.push(`⏰ ${late} tarefa${pl(late)} atrasada${pl(late)}: reagende ou conclua.`);
 if(rv)L.push(`🔁 ${rv} revisã${rv===1?'o vencida':'ões vencidas'}.`);
 exams().filter(o=>d.keys.includes(o.x.date)).forEach(o=>L.push(`📝 Prova de <b>${esc(o.s.name)}</b> ${o.n===0?'é hoje':'em '+o.n+' dia'+pl(o.n)}.`));
 const P=planBuild(0);let under=[];
 if(P){const sc=d.keys.length/7;under=P.subj.filter(o=>!o.out&&o.m>0).map(o=>({s:o.s,g:keysMin(d.keys,o.s),w:o.m*sc})).filter(o=>o.g<o.w*.6).sort((a,b)=>b.w-b.g-(a.w-a.g)).slice(0,3);
  if(under.length){def=true;L.push(`📚 Abaixo do peso sugerido pelo Plano: ${under.map(o=>`<b>${esc(o.s.name)}</b> (${hh(o.g)} de ≈${hh(o.w)})`).join(', ')}.`)}}
 const y1=fmt(addD(now(),-1)),y2=fmt(addD(now(),-2)),any=k=>S.subjects.some(s=>k in s.days),gs=gstreak().c;
 if(!any(t)){if(!any(y1)&&any(y2))L.push(`⚡ Se hoje passar sem estudo, o XP da sequência zera. Estude hoje.`);else if(gs>0)L.push(`🔥 Sua sequência de ${gs} dia${pl(gs)} está em risco: estude hoje.`)}
 L.push(...focusTips());
 if(def&&mNow<22*60){const H=mNow<19*60?19:dn.getHours()+1,s=(under[0]&&under[0].s)||(d.lo&&d.lo.s)||S.subjects.find(x=>!x.arch);if(s&&H<=22)act={sid:s.id,h:H,name:s.name}}
 if(!L.length)L.push('Tudo em dia por enquanto. Continue assim! 💪');
 return{L,act}}
/* ===== V94: Relatório e Planejamento em 4 grupos (Planejar · Acompanhar · Objetivos · Compromissos) ===== */
const RPG=[['plan','🗓️ Planejar',[['planner','🧭 Planejador'],['tarefas','✅ Tarefas'],['plano','🗓️ Plano semanal'],['cal','📅 Calendário'],['planej','🗂️ Matérias']]],['acomp','📈 Acompanhar',[['rel','📈 Resumo'],['hist','📊 Histórico']]],['obj','🎯 Objetivos',[['metas','🎯 Metas & Goals']]],['comp','⛓️ Compromissos',[['desafio','⛓️ Desafio'],['contratos','📜 Contratos']]]],rpLast={};
function rpTabs(){const g=RPG.find(x=>x[2].some(s=>s[0]===rTab))||RPG[1];rpLast[g[0]]=rTab;
 const top=`<div class="seg" id="rp-tabs" role="group" aria-label="Seção" style="margin:0 0 ${g[2].length>1?8:14}px">${RPG.map(x=>`<button class="${x===g?'on':''}" data-a="rptab" data-v="${rpLast[x[0]]||x[2][0][0]}">${x[1]}</button>`).join('')}</div>`;
 const sub=g[2].length>1?`<div class="seg" id="rp-sub" role="group" aria-label="Subseção" style="margin:0 0 14px">${g[2].map(s=>`<button class="${rTab===s[0]?'on':''}" data-a="rptab" data-v="${s[0]}">${s[1]}</button>`).join('')}</div>`:'';
 return top+sub}
/* ===== V95: Fechar a semana (ritual guiado no Resumo semanal) ===== */
function fwPend(d){return allTasks().filter(o=>o.x.date&&d.keys.includes(o.x.date)&&!o.x.done&&!o.x.exam&&!o.s.arch)}
function fwSug(d){const n=d.gl.length,ok=d.gl.filter(o=>o.i.ok).length,p=fwPend(d).length;
 return[(`Estudei ${hh(d.tot)} em ${d.days} de ${d.keys.length} dias`+(d.most?`; mais tempo em ${d.most.s.name} (${hh(d.most.m)})`:'')+'.'+(n?` Metas: ${ok} de ${n}.`:'')).slice(0,400),
 ((d.lo?`${d.lo.s.name} ficou com ${d.lo.m?hh(d.lo.m):'0 min'}. `:'')+(p?`${p} tarefa${pl(p)} pendente${pl(p)} para reagendar.`:'')).trim().slice(0,400)]}
function fwHtml(d){const key=pKey('week',d.P),f=(S.fw||{})[key]||{},r=(S.refl||{})[key]||{},pend=fwPend(d),
 s1=!!(r.w||r.a),s2=!pend.length||!!f.carry,s3=!!f.plan,n=+s1+ +s2+ +s3,
 st=(ok,x)=>`<b style="color:var(--ink)">${ok?'✅':'⬜'} ${x}</b>`;
 return`<h3>🔒 Fechar a semana · ${n} de 3</h3><div class="bar"><div style="width:${Math.round(n/3*100)}%"></div></div>
 <p class="sub" style="margin:10px 0 4px">${st(s1,'1. Reflexão')} · escreva abaixo o que funcionou e o que ajustar.</p><button class="btn" data-a="fwsug">✨ Sugerir com os números</button>
 <p class="sub" style="margin:12px 0 4px">${st(s2,'2. Pendências')} · ${pend.length?pend.length+' tarefa'+pl(pend.length)+' não concluída'+pl(pend.length)+'. Marque as que vão para a próxima semana:':'nada pendente nesta semana.'}</p>
 ${pend.map(o=>`<label style="display:flex;gap:8px;align-items:center;margin:3px 0"><input type="checkbox" class="fw-ck" data-id="${o.x.id}" checked><span>${esc(o.x.name)} <small style="color:var(--muted)">· ${esc(o.s.name)} · ${br(o.x.date)}</small></span></label>`).join('')}
 ${pend.length&&!f.carry?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn" data-a="fwmove">➡️ Reagendar marcadas</button><button class="btn" data-a="fwskip">Deixar como está</button></div>`:''}
 <p class="sub" style="margin:12px 0 4px">${st(s3,'3. Próxima semana')} · veja o plano sugerido e adicione ao calendário.</p><button class="btn main" data-a="fwplan">🗓️ Gerar plano da próxima semana</button>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a^="fw"]');if(!b)return;const a=b.dataset.a,d=repData(rV,rOff),key=pKey('week',d.P),t=fmt(now());S.fw=S.fw||{};const f=S.fw[key]=S.fw[key]||{};
 if(a==='fwsug'){const [w,x]=fwSug(d),W=$('#rf-w'),A=$('#rf-a');if(W&&!W.value.trim())W.value=w;if(A&&!A.value.trim())A.value=x;toast('Sugestão preenchida. Revise e clique em Salvar reflexão.')}
 else if(a==='fwmove'){const ids=[...document.querySelectorAll('.fw-ck:checked')].map(x=>x.dataset.id),nm=fmt(addD(parse(d.keys[6]),1)),tg=nm>t?nm:t;let c=0;
  allTasks().forEach(o=>{if(ids.includes(o.x.id)){o.x.date=tg;c++}});f.carry=true;save();render();toast(c?c+' tarefa'+pl(c)+' reagendada'+pl(c)+' para '+br(tg)+'.':'Nenhuma tarefa marcada.')}
 else if(a==='fwskip'){f.carry=true;save();renderRep()}
 else if(a==='fwplan'){f.plan=true;save();pOff=1;rTab='plano';render()}});
/* ===== V96: Planejador (visão única para planejar semana/mês; só lê e edita os dados atuais) ===== */
let pnM='',pnSel='',pnV='week';const WD=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
function pnAvg(){let a=0;for(let i=1;i<=14;i++){const k=fmt(addD(now(),-i));S.subjects.forEach(s=>a+=s.days[k]||0)}return a/14}
function pnHtml(){
 const t=fmt(now());if(!pnSel)pnSel=t;if(!pnM)pnM=pnSel.slice(0,7);pOff=0;
 const [y,m]=pnM.split('-').map(Number),first=new Date(y,m-1,1,12),start=monday(first),total=Math.ceil(((first.getDay()+6)%7+new Date(y,m,0).getDate())/7)*7,
  wk=Array.from({length:7},(_,i)=>fmt(addD(monday(parse(pnSel)),i))),A=S.subjects.filter(s=>!s.arch),
  T=allTasks().filter(o=>o.x.date&&!o.s.arch&&!o.x.done),dots={};
 T.forEach(o=>{const d=dots[o.x.date]=dots[o.x.date]||{};if(o.x.exam)d.e=1;else d.n=1});
 const dot=c=>`<b style="width:6px;height:6px;border-radius:50%;background:${c}"></b>`;
 let cells=WD.map(d=>`<div class="cw">${d}</div>`).join('');
 for(let i=0;i<total;i++){const d=addD(start,i),k=fmt(d),o=dots[k]||{};
  cells+=`<button class="cd${d.getMonth()!==m-1?' out':''}${k===t?' today':''}${k===pnSel?' sel':''}" data-a="pnday" data-k="${k}" style="${wk.includes(k)?'outline:1px solid var(--flame);':''}"><span>${d.getDate()}</span><i style="display:flex;gap:2px;justify-content:center;min-height:7px">${o.n?dot('#2fa84f'):''}${o.e?dot('#e5484d'):''}</i></button>`}
 const avg=pnAvg(),ld=wk.map(k=>T.filter(o=>o.x.date===k&&!o.x.exam).reduce((a,o)=>a+(o.x.est||0),0)),
  strip=`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px">${wk.map((k,i)=>`<div style="text-align:center;font-size:.72rem;padding:4px 2px;border-radius:8px;border:1px solid ${avg&&ld[i]>avg*1.3?'#e5484d':'var(--line)'};${k===pnSel?'background:var(--bg)':''}"><b>${WD[i]}</b><br>${ld[i]?hh(ld[i]):'—'}</div>`).join('')}</div><p class="sub" style="font-size:.78rem;margin:4px 0 0">Tempo estimado por dia da semana selecionada (seu ritmo médio: ${hh(Math.round(avg))}). Borda vermelha = bem acima do ritmo.</p>`;
 const seg=`<div class="seg" role="group">${[['week','Semana'],['month','Mês']].map(([k,l])=>`<button class="${pnV===k?'on':''}" data-a="pnv" data-v="${k}">${l}</button>`).join('')}</div>`;
 const vis=o=>!o.x.done&&!o.x.exam&&(!o.x.date||o.x.date<t||(pnV==='week'?wk.includes(o.x.date):o.x.date.slice(0,7)===pnM));
 const subs=A.map(s=>{const L=(s.topics||[]).filter(x=>vis({s,x})).sort((a,b)=>(a.date||'9')<(b.date||'9')?-1:1);
  return`<div class="pn-sub" style="--c:${s.color}"><b style="color:${s.color}">● ${esc(s.name)}</b>${L.map(x=>`<div class="pn-t"><div>${esc(x.name)} <small style="color:var(--muted)">${x.est?'· '+hh(x.est):''}${x.date&&x.date<t?' · ⏰ atrasada':''}${!x.date?' · sem dia':''}</small></div>${pnV==='week'?`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${wk.map((k,i)=>`<button class="btn${x.date===k?' main':''}" style="padding:2px 7px;font-size:.72rem" data-a="pnset" data-id="${x.id}" data-k="${k}">${WD[i]}</button>`).join('')}</div>`:`<input type="date" value="${x.date||''}" data-pndate="${x.id}" style="margin-top:4px">`}</div>`).join('')}
  <div style="display:flex;gap:6px;margin-top:8px"><input id="pn-n-${s.id}" placeholder="Nova tarefa" maxlength="80" style="flex:1;min-width:0"><input id="pn-e-${s.id}" type="number" min="0" step="5" placeholder="min" style="width:64px"><button class="btn" data-a="pnadd" data-sid="${s.id}">+</button></div></div>`}).join('')||'<p class="sub">Adicione uma matéria na aba Matérias.</p>';
 const P=planBuild(0),g=weeklyGoals().find(x=>x.type==='total'),gm=g?g.min:(P?P.Teff:0),ex=exams().slice(0,6);
 const cfg=(ti,body,op)=>`<details class="mgs"${op?' open':''}><summary><b>${ti}</b></summary><div style="margin-top:10px">${body}</div></details>`;
 return`<div class="mgs"><div class="ch"><h2 style="text-transform:none">🧭 Planejador</h2>${seg}</div>
 <p class="sub" style="margin-top:0">Escolha um dia no calendário e distribua as tarefas. Tudo aqui é o mesmo dado do Calendário, do Plano semanal e das Matérias: mudou aqui, mudou lá. Bolinhas: 🟢 tarefas pendentes · 🔴 provas.</p>
 <div class="pn-lay"><div class="pn-cal"><div class="ch"><b>${MESES[m-1]} de ${y}</b><span style="display:flex;gap:6px"><button class="btn" data-a="pnnav" data-v="-1" aria-label="Mês anterior">‹</button><button class="btn" data-a="pnnav" data-v="0">Hoje</button><button class="btn" data-a="pnnav" data-v="1" aria-label="Próximo mês">›</button></span></div><div class="cg">${cells}</div>${strip}</div>
 <div class="pn-tk"><b>${pnV==='week'?'Semana de '+br(wk[0])+' a '+br(wk[6]):MESES[m-1]+' de '+y}</b><p class="sub" style="margin:2px 0 0;font-size:.8rem">Pendentes, atrasadas e sem dia. Tarefa nova entra em ${br(pnSel)}.</p><div class="pn-grid">${subs}</div></div></div></div>
 ${cfg('🎯 Meta e plano da semana',(P?`<p class="sub" style="margin-top:0">Meta atual: <b style="color:var(--ink)">${hh(P.Teff)}</b> (${P.T.src}) · estudado <b style="color:var(--ink)">${hh(P.doneNow)}</b> · falta <b style="color:var(--ink)">${hh(P.remWeek)}</b>.</p>`:'')+`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">Meta semanal de tempo total: <input id="pn-gh" type="number" min="0" value="${Math.floor(gm/60)}" style="width:60px">h <input id="pn-gm" type="number" min="0" max="59" value="${gm%60}" style="width:60px">min <button class="btn" data-a="pngoal">Salvar meta</button></div><div style="margin-top:10px"><button class="btn main" data-a="plapply">➕ Adicionar plano sugerido ao calendário</button></div>`,1)}
 ${cfg('📝 Provas próximas',ex.length?ex.map(o=>`<div>📝 <b>${esc(o.s.name)}</b> · ${esc(o.x.name)} · ${br(o.x.date)} (${o.n===0?'hoje':'em '+o.n+' dia'+pl(o.n)})</div>`).join(''):'<p class="sub" style="margin:0">Nenhuma prova marcada.</p>')}
 ${cfg('⚙️ Ajustes em outras telas',`<div style="display:flex;gap:8px;flex-wrap:wrap">${[['plano','🗓️ Plano semanal'],['cal','📅 Calendário'],['planej','🗂️ Matérias (e peso por matéria no Plano semanal)'],['metas','🎯 Metas']].map(([v,l])=>`<button class="btn" data-a="rptab" data-v="${v}">${l}</button>`).join('')}</div>`)}`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a^="pn"]');if(!b)return;const a=b.dataset.a;
 if(a==='pnday'){pnSel=b.dataset.k;pnM=pnSel.slice(0,7);renderRep()}
 else if(a==='pnnav'){const v=+b.dataset.v;if(!v){pnSel=fmt(now());pnM=pnSel.slice(0,7)}else{const [y,m]=pnM.split('-').map(Number);pnM=fmt(new Date(y,m-1+v,1,12)).slice(0,7)}renderRep()}
 else if(a==='pnv'){pnV=b.dataset.v;renderRep()}
 else if(a==='pnset'){const o=allTasks().find(o=>o.x.id===b.dataset.id);if(!o)return;o.x.date=o.x.date===b.dataset.k?'':b.dataset.k;save();render()}
 else if(a==='pnadd'){const s=S.subjects.find(x=>x.id===b.dataset.sid),n=$('#pn-n-'+b.dataset.sid),m=$('#pn-e-'+b.dataset.sid);if(!s||!n||!n.value.trim()){toast('Digite o nome da tarefa.');return}const est=Math.max(0,parseInt(m.value)||0);(s.topics=s.topics||[]).push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:n.value.trim(),date:pnSel,time:'',prio:'media',est,dur:est,done:false,doneAt:'',note:''});save();render();toast('Tarefa adicionada em '+br(pnSel)+'.')}
 else if(a==='pngoal'){const min=(parseInt($('#pn-gh').value)||0)*60+(parseInt($('#pn-gm').value)||0);if(min<=0){toast('Informe um tempo maior que zero.');return}const g=weeklyGoals().find(x=>x.type==='total');S.mg=S.mg||[];if(g)g.min=min;else S.mg.push({id:'m'+Date.now().toString(36),scope:'week',type:'total',min,sids:S.subjects.filter(s=>!s.arch).map(s=>s.id)});save();render();toast('Meta semanal salva.')}});
document.addEventListener('change',e=>{const i=e.target.dataset&&e.target.dataset.pndate;if(!i)return;const o=allTasks().find(o=>o.x.id===i);if(o){o.x.date=e.target.value;save();render()}});
/* ===== V97: Resumo detalhado (ritmo, projeção, aproveitamento, comparações, dicas de pausa e extrato) ===== */
const rdAv=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,
 rdDp=(a,b)=>b>0?Math.round((a-b)/b*100):null,
 rdS=x=>x==null?'—':(x>0?'▲ +':x<0?'▼ −':'= ')+Math.abs(x)+'%',
 rdCd=(b,s)=>`<div><b>${b}</b><span>${s}</span></div>`,
 rdLn=(x,m)=>`<p class="sub" style="margin:${m==null?4:m}px 0 0">${x}</p>`,
 rdRow=(l,r,sub)=>`<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:6px 0;border-bottom:1px dashed var(--line)"><span style="min-width:0;overflow-wrap:anywhere">${l}${sub?`<small style="display:block;color:var(--muted)">${sub}</small>`:''}</span><b style="white-space:nowrap">${r}</b></div>`,
 rdBar=(l,m,mx,c,o,txt)=>`<div style="margin:10px 0"><div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-size:.9rem;overflow-wrap:anywhere">${l}</span><b>${txt||hh(m)}</b></div><div style="height:9px;background:var(--track);border-radius:6px;overflow:hidden;margin-top:4px"><div style="height:100%;background:${c};opacity:${o||1};border-radius:6px;width:${m>0?Math.max(2,Math.round(m/mx*100)):0}%"></div></div></div>`,
 rdWd=k=>DIAS[(parse(k).getDay()+6)%7],
 rdDt=k=>rdWd(k)+' '+br(k);
let rdExOpen=false;document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='rd-ex')rdExOpen=e.target.open},true);
function allDayMap(){const m={};S.subjects.forEach(s=>Object.keys(s.days).forEach(k=>{m[k]=(m[k]||0)+(s.days[k]||0)}));return m}
function daySes(k){const d0=new Date(k+'T00:00:00').getTime(),e0=d0+864e5,L=[];
 S.subjects.forEach(s=>SS(s).forEach(x=>{const a=Math.max(+x.a,d0),b=Math.min(+x.b,e0);if(b>a)L.push({a,b,s})}));return L.sort((x,y)=>x.a-y.a)}
function upTo(k,mm){const d0=new Date(k+'T00:00:00').getTime(),c=d0+mm*6e4;let m=0;daySes(k).forEach(x=>{const o=Math.min(x.b,c)-x.a;if(o>0)m+=o/6e4});return m}
const rdSum=L=>L.reduce((a,x)=>a+(x.b-x.a)/6e4,0);
/* Modelo de projeção do dia: usa o seu histórico (dias com horários registrados) e o ritmo de hoje */
function rdModel(k){
 const dn=new Date(),mNow=dn.getHours()*60+dn.getMinutes(),map=allDayMap(),tot=map[k]||0,ses=daySes(k),sesMin=rdSum(ses),H=[];
 for(let i=1;i<=45&&H.length<20;i++){const p=fmt(addD(parse(k),-i)),m=map[p]||0;if(m<=0)continue;const sp=daySes(p);
  if(sp.length&&rdSum(sp)>=m*.8)H.push({p,m,pre:upTo(p,mNow),end:(sp[sp.length-1].b-new Date(p+'T00:00:00').getTime())/6e4})}
 const act=[];for(let i=1;i<=30;i++){const m=map[fmt(addD(parse(k),-i))]||0;if(m>0)act.push(m)}
 const ok=H.length>=3,rem=ok?rdAv(H.map(h=>Math.max(0,h.m-h.pre))):null,preT=ok?rdAv(H.map(h=>h.pre)):null,endT=ok?Math.round(rdAv(H.map(h=>h.end))):22*60,
  room=Math.max(0,1440-mNow),A=rem!=null?tot+Math.min(rem,room):null,
  win=ses.length?(Date.now()-ses[0].a)/6e4:0,rate=ses.length&&win>=15?Math.min(1,sesMin/win):null,
  remAct=Math.max(0,Math.min(endT,1380)-mNow),B=rate!=null?tot+rate*remAct:null,F=Math.max(tot,rdAv(act.slice(0,7))),
  proj=Math.round(A!=null?A:B!=null?B:F);
 return{tot,ses,sesMin,H,rem,preT,endT,A,B,F,proj,rate,win,mNow,remAct,avgAct:rdAv(act)}}
/* ---------- DIÁRIO ---------- */
function rdDay(d){
 const k=d.keys[0],cur=d.cur,map=allDayMap(),tot=d.tot,ses=daySes(k),dn=new Date(),hr=dn.getHours(),nowMs=Date.now(),sesMin=rdSum(ses),
  ps=n=>fmt(addD(parse(k),-n));
 if(!cur&&!tot&&!ses.length)return'';
 const avg7=rdAv([1,2,3,4,5,6,7].map(i=>map[ps(i)]||0)),yest=map[ps(1)]||0,act=[];
 for(let i=1;i<=30;i++){const m=map[ps(i)]||0;if(m>0)act.push(m)}
 const avgAct=rdAv(act),wdA=rdAv([1,2,3,4,5,6,7,8].map(i=>map[fmt(addD(parse(k),-7*i))]||0));
 let bk=null,bm=0;Object.keys(map).forEach(x=>{if(x!==k&&x<=fmt(new Date())&&map[x]>bm){bm=map[x];bk=x}});
 const gT=d.gl.filter(o=>o.g.type==='total').map(o=>o.g.min).sort((a,b)=>b-a)[0],ref=gT||Math.round(avgAct/15)*15||0,
  src=gT?'meta do dia':'média dos seus dias de estudo',pct=ref?Math.round(tot/ref*100):null,isBest=tot>bm&&tot>0;
 const M=cur?rdModel(k):null,proj=M?M.proj:tot,
  hi=Array(24).fill(0);ses.forEach(x=>{for(let i=0;i<24;i++){const o=Math.min(x.b,new Date(k+'T00:00:00').getTime()+(i+1)*36e5)-Math.max(x.a,new Date(k+'T00:00:00').getTime()+i*36e5);if(o>0)hi[i]+=o/6e4}});
 let o='';
 /* 1. Ritmo, projeção e aproveitamento */
 o+=`<h3>${cur?'⏱️ Ritmo, projeção e aproveitamento':'🎯 Aproveitamento do dia'}</h3><div class="hsum">`;
 o+=rdCd(pct==null?'—':pct+'%',ref?`de aproveitamento · ${src} (${hh(ref)})`:'sem meta nem histórico para calcular');
 if(ses.length){const w=cur?M.win:(ses[ses.length-1].b-ses[0].a)/6e4,den=w>0?Math.min(100,Math.round(sesMin/w*100)):0;
  o+=rdCd(den+'%',`do tempo em estudo entre ${hm(new Date(ses[0].a))} e ${cur?'agora':hm(new Date(ses[ses.length-1].b))}`)}
 if(cur){o+=rdCd('≈ '+hh(proj),'projeção até o fim do dia');
  if(ref)o+=rdCd(tot>=ref?'🎉 batida':hh(ref-tot),tot>=ref?'referência do dia cumprida':'faltam para a referência')}
 else if(ref&&tot<ref)o+=rdCd(hh(ref-tot),'faltaram para a referência');
 o+='</div>';
 if(cur){
  if(!ses.length&&tot>0)o+=rdLn('ℹ️ O estudo de hoje não tem horário registrado, então a projeção usa a sua média recente.');
  if(M.A!=null)o+=rdLn(`📚 <b style="color:var(--ink)">Pelo seu padrão:</b> até ${hm(dn)} você costuma ter ${hh(M.preT)} e ainda estuda ≈${hh(M.rem)} depois disso → fecha em ≈<b style="color:var(--ink)">${hh(M.A)}</b>.`);
  else if(ses.length)o+=rdLn('📚 Ainda não há 3 dias com horário registrado para projetar pelo seu padrão histórico.');
  if(M.B!=null)o+=rdLn(`⚡ <b style="color:var(--ink)">Mantendo o ritmo de hoje</b> (${Math.round(M.rate*60)} min de estudo por hora) até ${hm(new Date(0,0,0,Math.floor(Math.min(M.endT,1380)/60),Math.min(M.endT,1380)%60))}, seu horário usual de encerrar: ≈<b style="color:var(--ink)">${hh(M.B)}</b>.`);
  if(M.preT!=null&&M.preT>0){const x=rdDp(tot,M.preT);if(x!=null)o+=rdLn(`🕐 Neste horário você costuma ter ${hh(M.preT)}; hoje tem ${hh(tot)} → <b style="color:var(--ink)">${Math.abs(x)<5?'dentro do normal':x>0?x+'% à frente':Math.abs(x)+'% atrás'}</b>.`)}
  if(ref&&tot<ref&&hr<22){const room=Math.max(0,22*60-(hr*60+dn.getMinutes())),nb=Math.floor(room/50);o+=rdLn(`⏳ Até as 22h restam ${hh(room)}: cabem ${nb} ciclo${pl(nb)} de 40 min + 10 de pausa${nb?` (≈${hh(nb*40)} de estudo)`:''}.`)}}
 /* 2. Comparações */
 const rows=[[cur?'Hoje (até agora)':'Este dia',tot,'var(--flame)',1]];
 if(cur&&proj>tot)rows.push(['Projeção do dia',proj,'var(--flame)',.4]);
 rows.push(['Ontem',yest,'#7c83d6',1],['Média dos últimos 7 dias',avg7,'#7c83d6',1],['Média do mesmo dia da semana',wdA,'#7c83d6',1],['Média dos dias de estudo',avgAct,'#7c83d6',1]);
 if(bk)rows.push(['🏆 Melhor dia de todos: '+rdDt(bk),bm,'#e0a31b',1]);
 const mx=Math.max(...rows.map(r=>r[1]),1);
 o+=`<h3>⚖️ Comparação com outros dias</h3>`+rows.map(r=>rdBar(r[0],r[1],mx,r[2],r[3])).join('');
 const cmp=[];
 if(yest>0)cmp.push(`vs ontem ${rdS(rdDp(tot,yest))}`);if(avg7>0)cmp.push(`vs média dos 7 dias ${rdS(rdDp(tot,avg7))}`);if(wdA>0)cmp.push(`vs ${['segundas','terças','quartas','quintas','sextas','sábados','domingos'][(parse(k).getDay()+6)%7]} típicas ${rdS(rdDp(tot,wdA))}`);
 if(cmp.length)o+=rdLn('📊 '+cmp.join(' · '));
 {let hi_=0,c=0;for(let i=1;i<=60;i++){const m=map[ps(i)]||0;if(m>0){c++;if(m>tot)hi_++}}
  if(c>=3&&tot>0)o+=rdLn(`🏅 ${cur?'Até agora, hoje ocupa':'Foi'} o <b style="color:var(--ink)">${hi_+1}º lugar</b> entre ${c+1} dias com estudo nos últimos 60.`)}
 if(isBest)o+=rdLn(`🏆 <b style="color:var(--ink)">${cur?'Hoje já é':'Foi'} o seu melhor dia</b>${bk?` (supera ${hh(bm)} de ${rdDt(bk)})`:''}.`);
 else if(bk){const x=Math.round(tot/bm*100);o+=rdLn(`🏆 ${cur?'Hoje está em':'Foi'} <b style="color:var(--ink)">${x}%</b> do melhor dia (${hh(bm)} em ${rdDt(bk)}).${cur?` Para igualar faltam <b style="color:var(--ink)">${hh(bm-tot)}</b>${proj>=bm?' — pela projeção você chega lá. 🔥':proj>0?` e a projeção chega a ${Math.round(proj/bm*100)}% dele.`:'.'}`:''}`);
  if(cur){const ts=daySes(bk);if(ts.length&&rdSum(ts)>=bm*.8){const b0=upTo(bk,M.mNow);o+=rdLn(`⏰ No seu melhor dia, até ${hm(dn)} você já tinha ${hh(b0)}${b0>0?` (hoje ${rdS(rdDp(tot,b0))})`:''}.`)}}}
 /* 3. Pausa ou continuar / leitura do dia */
 if(cur){
  const last=ses[ses.length-1],since=last?(nowMs-last.b)/6e4:null,brk=S.brk&&S.brk.end>nowMs;let blk=0;
  if(last&&since<=10){let i=ses.length-1,st=last.a;while(i>0&&ses[i].a-ses[i-1].b<=3e5){i--;st=ses[i].a}blk=(last.b-st)/6e4}
  const l2=ses.reduce((a,x)=>{const q=Math.min(x.b,nowMs)-Math.max(x.a,nowMs-72e5);return q>0?a+q/6e4:a},0),T=[];
  let V;const nb=ref&&tot<ref?Math.ceil((ref-tot)/40):0;
  if(hr>=23||hr<5)V=['🌙','Encerrar o dia','Já é tarde. Dormir bem consolida o que você estudou e rende mais amanhã do que mais um bloco agora.'];
  else if(brk)V=['☕','Pausa em andamento','Levante, beba água e evite telas. Volte quando o cronômetro acabar.'];
  else if(blk>=90||l2>=105)V=['⏸️','Faça uma pausa agora',`${hh(blk>=90?blk:l2)} de estudo quase sem intervalo. Pare 15–20 min: caminhe, hidrate-se e olhe longe da tela.`];
  else if(blk>=50)V=['☕','Pausa de 10 minutos',`Você está há ${hh(blk)} em foco. Uma pausa curta agora mantém a qualidade do próximo bloco.`];
  else if(blk>0)V=['▶️','Continue',`Você está em foco há ${hh(blk)}. Siga até uns 50 min e então faça 10 de pausa.`];
  else if(since!=null&&since<=25)V=['☕','Pausa ideal para retomar',`Você parou há ${hh(since)}. Retome em até ${Math.max(5,25-Math.round(since))} min para não perder o embalo.`];
  else if(ref&&tot>=ref)V=['✅','Meta do dia batida',hr>=20?'Pode encerrar com tranquilidade. Se ainda tiver energia, revise o que viu hoje por 15 min.':'Continuar agora é bônus. Se o foco estiver bom, faça mais um bloco; senão, descanse.'];
  else if(!tot)V=['🚀','Comece com um bloco curto','Só 25 minutos já quebram a inércia. Escolha a matéria mais fácil de começar e inicie o cronômetro.'];
  else V=['▶️','Hora de retomar',since!=null?`Você está parado há ${hh(since)}. ${nb?`Faltam ≈${hh(ref-tot)}: ${nb} bloco${pl(nb)} de 40 min.`:'Retome com um bloco de 25–40 min.'}`:'Retome com um bloco de 25–40 min.'];
  if(M.preT!=null&&tot<M.preT*.7&&hr<21&&!brk&&blk===0)T.push(`🐢 Você está atrás do seu ritmo usual para este horário. Um bloco de 40 min agora recupera boa parte.`);
  if(blk>=25&&blk<50)T.push(`⏱️ Faltam ≈${Math.round(50-blk)} min para completar 50 de foco e fazer a pausa.`);
  if(proj>=bm&&bm>0&&!isBest)T.push(`🏆 No seu ritmo você pode bater o recorde (${hh(bm)}). Mantenha as pausas curtas e regulares.`);
  else if(bm>0&&tot>=bm*.85&&!isBest)T.push(`🏆 Você está a ${hh(bm-tot)} do seu recorde. Mais um bloco e ele cai.`);
  if(isBest&&hr>=20)T.push('🛌 Dia de recorde: cuidado para não se esgotar. Fechar agora protege a sequência dos próximos dias.');
  const lf=(S.log||[]).filter(x=>x.d===k&&x.f>0);if(lf.length>=2&&rdAv(lf.map(x=>x.f))<3)T.push('🧠 Seu foco está baixo hoje. Faça pausa de 15 min ou troque para uma matéria mais leve.');
  if(avg7>0&&tot>avg7*1.6&&hr>=18)T.push('📈 Você já passou bastante da sua média. Rendimento cai com fadiga: priorize revisão leve.');
  if(!brk&&blk<50)T.push('🍅 Sugestão de ciclo: 40 min de foco + 10 de pausa; a cada 3 ciclos, uma pausa longa de 20–30 min.');
  {const pk=hi.indexOf(Math.max(...hi));if(ses.length&&hi[pk]>=5)T.push(`⏰ Seu pico de hoje foi às ${pk}h–${pk+1}h (${hh(hi[pk])}).`)}
  T.push(...focusTips());
  o+=`<h3>💡 Pausar ou continuar?</h3><div class="hrow" style="--c:var(--flame)"><div class="hh2"><b>${V[0]} ${V[1]}</b></div><span style="font-size:.9rem">${V[2]}</span></div><ul style="margin:8px 0 0;padding-left:20px">${T.map(x=>`<li style="margin-bottom:4px">${x}</li>`).join('')}</ul>`}
 else{const T=[];
  if(pct!=null)T.push(pct>=100?`✅ Você cumpriu a referência do dia (${pct}%).`:`Você chegou a ${pct}% da referência do dia.`);
  if(ses.length>=2){const gs=[];for(let i=1;i<ses.length;i++)gs.push((ses[i].a-ses[i-1].b)/6e4);const lng=Math.max(...ses.map(x=>(x.b-x.a)/6e4));
   if(lng>=100)T.push(`⏸️ Sua maior sessão teve ${hh(lng)} sem parar. Tente quebrar em blocos de 40–50 min com pausas.`);
   else if(lng<20)T.push('🧩 As sessões foram muito curtas. Blocos de 25–40 min costumam render mais.');
   if(gs.length&&gs.every(g=>g>90))T.push('💤 Houve longos intervalos entre as sessões; pausas de 10–15 min mantêm o embalo.')}
  const pk=hi.indexOf(Math.max(...hi));if(ses.length&&hi[pk]>=5)T.push(`⏰ Hora de pico: ${pk}h–${pk+1}h (${hh(hi[pk])}).`);
  if(T.length)o+=`<h3>💡 Leitura do dia</h3><ul style="margin:0;padding-left:20px">${T.map(x=>`<li style="margin-bottom:4px">${x}</li>`).join('')}</ul>`}
 /* 4. Extrato */
 const lg=(S.log||[]).filter(x=>x.d===k&&x.f>0),ex=[];let prevEnd=null,pause=0;
 ses.forEach(x=>{if(prevEnd!=null){const g=(x.a-prevEnd)/6e4;if(g>=1){const p=g<=90;if(p)pause+=g;ex.push(`<div style="color:var(--muted);font-size:.82rem;padding:2px 0 2px 16px">${p?'⏸ pausa':'💤 intervalo'} de ${hh(g)}</div>`)}}
  const m=(x.b-x.a)/6e4,L=lg.filter(z=>z.sid===x.s.id&&z.h===new Date(x.a).getHours()),f=L.length?L[0].f:null;
  ex.push(rdRow(`<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${x.s.color};margin-right:6px"></span>${esc(x.s.name)}`,hh(m),`${hm(new Date(x.a))}–${hm(new Date(x.b))}${f?` · foco ${f}/5`:''}${L[0]&&L[0].w?` · “${esc(L[0].w)}”`:''}`));prevEnd=x.b});
 const un=S.subjects.map(s=>({s,u:keysMin([k],s)-rdSum(ses.filter(x=>x.s===s))})).filter(r=>r.u>=2);
 un.forEach(r=>ex.push(rdRow(`<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${r.s.color};margin-right:6px"></span>${esc(r.s.name)}`,hh(r.u),'sem horário registrado')));
 const by=S.subjects.map(s=>({s,m:keysMin([k],s)})).filter(r=>r.m>0).sort((a,b)=>b.m-a.m),done=allTasks().filter(q=>q.x.done&&q.x.doneAt===k);
 o+=`<details id="rd-ex"${rdExOpen?' open':''} style="margin-top:16px"><summary style="cursor:pointer;font-weight:800;font-size:1.05rem">🧾 Extrato do dia <small style="font-weight:500;color:var(--muted)">· toque para mostrar/recolher</small></summary><div style="margin-top:8px">`;
 if(!ex.length)o+=rdLn('Nenhuma sessão registrada neste dia.',0);
 else{o+=ex.join('');
  o+=`<div class="hsum" style="margin-top:10px">${rdCd(hh(tot),'tempo total de estudo')}${ses.length?rdCd(ses.length,`sessõe${ses.length===1?'':'s'} · média ${hh(sesMin/ses.length)}`)+rdCd(hh(Math.max(...ses.map(x=>(x.b-x.a)/6e4))),'maior sessão'):''}${pause>0?rdCd(hh(pause),'em pausas entre sessões'):''}${d.nfa?rdCd(d.fa.toFixed(1).replace('.',',')+'/5','concentração média'):''}${rdCd('+'+d.xp,'XP do dia')}${rdCd(d.tk.d+' de '+d.tk.n,'tarefas planejadas feitas')}</div>`;
  if(by.length>1)o+=`<p class="sub" style="margin:10px 0 2px"><b style="color:var(--ink)">Por matéria</b></p>`+by.map(r=>rdBar(esc(r.s.name),r.m,by[0].m,r.s.color,1,hh(r.m)+' · '+Math.round(r.m/tot*100)+'%')).join('');
  if(done.length)o+=rdLn(`✅ <b style="color:var(--ink)">Tarefas concluídas:</b> ${done.map(q=>esc(q.x.name)).join(', ')}.`,10)}
 o+='</div></details>';return o}
/* ---------- SEMANAL ---------- */
function rdWeek(d){
 const K=d.keys,t=fmt(new Date()),map=allDayMap(),cur=d.cur,tot=d.tot,tots=K.map(k=>map[k]||0),ti=K.indexOf(t),pastK=K.filter(k=>k<=t),
  wk={};Object.keys(map).forEach(k=>{const m=fmt(monday(parse(k)));wk[m]=(wk[m]||0)+map[k]});
 let bw=null,bwm=0;Object.keys(wk).forEach(m=>{if(m!==K[0]&&m<=t&&wk[m]>bwm){bwm=wk[m];bw=m}});
 const pw=n=>fmt(addD(parse(K[0]),-7*n)),prevW=[1,2,3,4].map(i=>wk[pw(i)]||0),avg4=rdAv(prevW),prev=wk[pw(1)]||0,
  gT=d.gl.filter(o=>o.g.type==='total').map(o=>o.g.min).sort((a,b)=>b-a)[0],ref=gT||Math.round(avg4/30)*30||0,src=gT?'meta semanal':'média das 4 semanas anteriores',
  nAct=tots.filter(x=>x>0).length,avgAct=nAct?tot/nAct:0;
 const M=cur&&ti>=0?rdModel(t):null;let proj=null;
 if(cur){const add=M?Math.max(0,M.proj-tots[ti]):0;let fut=0;K.forEach(k=>{if(k>t)fut+=rdAv([1,2,3,4,5,6,7,8].map(j=>map[fmt(addD(parse(k),-7*j))]||0))});proj=Math.round(tot+add+fut)}
 const pct=ref?Math.round(tot/ref*100):null;let o='';
 o+=`<h3>⏱️ ${cur?'Ritmo, projeção e aproveitamento':'Aproveitamento da semana'}</h3><div class="hsum">`;
 o+=rdCd(pct==null?'—':pct+'%',ref?`de aproveitamento · ${src} (${hh(ref)})`:'sem meta nem histórico para calcular');
 o+=rdCd(nAct?hh(avgAct):'—','média por dia com estudo');
 o+=rdCd(nAct+' de '+pastK.length,`dia${pastK.length===1?'':'s'} com estudo${cur?' até hoje':''}`);
 if(cur){o+=rdCd('≈ '+hh(proj),'projeção para fechar a semana');
  if(ref)o+=rdCd(tot>=ref?'🎉 batida':hh(ref-tot),tot>=ref?'referência da semana cumprida':'faltam para a referência')}
 o+='</div>';
 if(cur){const left=K.filter(k=>k>t).length;
  o+=rdLn(`📐 Projeção = ${hh(tot)} já feitos${M?` + ≈${hh(Math.max(0,M.proj-tots[ti]))} que você ainda costuma estudar hoje`:''}${left?` + ≈${hh(Math.max(0,proj-tot-(M?Math.max(0,M.proj-tots[ti]):0)))} dos ${left} dia${pl(left)} restantes (pela média de cada dia da semana nas últimas 8 semanas)`:''}.`);
  if(ref)o+=rdLn(`🎯 Projeção = <b style="color:var(--ink)">${Math.round(proj/ref*100)}%</b> da referência.`)}
 /* Comparação */
 const rows=[[cur?'Esta semana (até agora)':'Esta semana',tot,'var(--flame)',1]];
 if(cur&&proj>tot)rows.push(['Projeção',proj,'var(--flame)',.4]);
 rows.push(['Semana anterior',prev,'#7c83d6',1],['Média 4 semanas',avg4,'#7c83d6',1]);if(bw)rows.push(['🏆 Melhor semana de todas (início '+br(bw)+')',bwm,'#e0a31b',1]);
 const mx=Math.max(...rows.map(r=>r[1]),1);
 o+=`<h3>⚖️ Comparação com outras semanas</h3>`+rows.map(r=>rdBar(r[0],r[1],mx,r[2],r[3])).join('');
 const cm=[];if(prev>0)cm.push(`vs semana anterior ${rdS(rdDp(tot,prev))}`);if(avg4>0)cm.push(`vs média de 4 semanas ${rdS(rdDp(tot,avg4))}`);if(cm.length)o+=rdLn('📊 '+cm.join(' · '));
 if(cur&&ti>=0){const pt=K.reduce((a,k,i)=>i<=ti?a+(map[fmt(addD(parse(k),-7))]||0):a,0);if(pt>0)o+=rdLn(`🕐 Até ${rdWd(t)}, a semana passada tinha ${hh(pt)}. Hoje você está <b style="color:var(--ink)">${rdS(rdDp(tot,pt))}</b> nesse mesmo ponto.`)}
 if(bw){const x=Math.round(tot/bwm*100);o+=rdLn(`🏆 Melhor semana: ${hh(bwm)} (${br(bw)}). Esta está em <b style="color:var(--ink)">${x}%</b>${cur&&proj?`; a projeção chega a ${Math.round(proj/bwm*100)}%${proj>=bwm?' — recorde à vista! 🔥':''}`:''}.`)}
 /* Dicas */
 const T=[],left=K.filter(k=>k>=t).length;
 if(cur&&left){const need=prev-tot;if(prev>0&&need>0)T.push(`➡️ Para igualar a semana passada faltam <b>${hh(need)}</b> (≈${hh(need/left)} por dia nos ${left} dia${pl(left)} restantes, contando hoje).`);
  else if(prev>0)T.push('✅ Você já passou da semana passada. O restante é bônus: mantenha a regularidade.');
  if(bwm>0&&tot<bwm){const nb=bwm-tot;if(nb/left<=Math.max(avgAct,60)*1.3)T.push(`🏆 Para bater o recorde faltam ${hh(nb)} (≈${hh(nb/left)}/dia): está ao seu alcance.`)}}
 const mxI=tots.indexOf(Math.max(...tots));if(tot>0)T.push(`📅 Melhor dia: <b>${rdDt(K[mxI])}</b> (${hh(tots[mxI])}).`);
 if(nAct>0&&tots[mxI]>=tot*.5&&nAct>=3)T.push('⚖️ Mais da metade do tempo ficou em um único dia. Distribuir melhor ajuda a fixar o conteúdo.');
 const rest=pastK.filter(k=>!(map[k]>0)).length;
 if(nAct>=6&&!rest)T.push('🛌 Você estudou quase todos os dias. Planeje um dia mais leve para recuperar a energia.');
 else if(pastK.length>=4&&nAct<=pastK.length-3)T.push(`📆 ${rest} dias sem estudo na semana. Mirar em 5 ou mais fortalece a corrente.`);
 if(cur&&M){const v=M.rem!=null?`hoje ainda deve render ≈${hh(M.rem)}`:'';if(v&&tots[ti]<M.proj)T.push(`🔎 ${v[0].toUpperCase()+v.slice(1)} pelo seu padrão; abra o Diário para ver o ritmo do dia.`)}
 T.push(...focusTips());
 o+=`<h3>💡 ${cur?'Dicas para o restante da semana':'Leitura da semana'}</h3><ul style="margin:0;padding-left:20px">${T.map(x=>`<li style="margin-bottom:4px">${x}</li>`).join('')}</ul>`;
 /* Extrato */
 const R=K.map((k,i)=>{const m=tots[i],ses=daySes(k),by=S.subjects.map(s=>({s,m:keysMin([k],s)})).filter(r=>r.m>0).sort((a,b)=>b.m-a.m)[0],L=(S.log||[]).filter(x=>x.d===k&&x.f>0);return{k,i,m,n:ses.length,by,f:L.length?rdAv(L.map(x=>x.f)):null,fut:k>t,today:k===t}}),mxD=Math.max(...tots,1);
 o+=`<h3>🧾 Extrato da semana</h3>`;
 R.forEach(r=>{const best=r.m>0&&r.m===Math.max(...tots),sub=r.fut?'dia futuro':(r.m?`${r.n?r.n+' sessõe'+(r.n===1?'':'s')+' · ':''}${r.by?esc(r.by.s.name)+(r.by.m<r.m?' em destaque':''):''}${r.f?` · foco ${r.f.toFixed(1).replace('.',',')}/5`:''}${nAct>1&&avgAct?` · ${rdS(rdDp(r.m,avgAct))} vs média`:''}`:'descanso');
  o+=`<div style="opacity:${r.fut?.5:1}">${rdBar((r.today?'● ':'')+rdDt(r.k)+(best?' 🏆':''),r.m,mxD,r.fut?'var(--muted)':'var(--flame)',1,r.fut?'—':hh(r.m))}<small style="display:block;margin:-4px 0 6px 0;color:var(--muted)">${sub}</small></div>`});
 const all=S.subjects.map(s=>({s,m:keysMin(K,s)})).filter(r=>r.m>0).sort((a,b)=>b.m-a.m);
 o+=`<div class="hsum" style="margin-top:10px">${rdCd(hh(tot),'total da semana')}${rdCd(d.tk.d+' de '+d.tk.n,'tarefas planejadas feitas')}${rdCd('+'+d.xp,'XP da semana')}${d.nfa?rdCd(d.fa.toFixed(1).replace('.',',')+'/5','concentração média'):''}</div>`;
 if(all.length)o+=`<p class="sub" style="margin:10px 0 2px"><b style="color:var(--ink)">Por matéria</b></p>`+all.map(r=>rdBar(esc(r.s.name),r.m,all[0].m,r.s.color,1,hh(r.m)+' · '+Math.round(r.m/tot*100)+'%')).join('');
 return o}
/* ---------- MENSAL e ANUAL ---------- */
function rdPer(d){
 const v=d.v,K=d.keys,t=fmt(new Date()),map=allDayMap(),tot=d.tot,pastN=K.filter(k=>k<=t).length,n=K.length,cur=d.cur,
  grp={};Object.keys(map).forEach(k=>{const g=v==='month'?k.slice(0,7):k.slice(0,4);grp[g]=(grp[g]||0)+map[k]});
 const me=v==='month'?K[0].slice(0,7):K[0].slice(0,4),pg=v==='month'?(()=>{const f=parse(K[0]);return fmt(new Date(f.getFullYear(),f.getMonth()-1,1,12)).slice(0,7)})():String(+me-1),prev=grp[pg]||0;
 let bg=null,bgm=0;Object.keys(grp).forEach(g=>{if(g!==me&&g<=t.slice(0,v==='month'?7:4)&&grp[g]>bgm){bgm=grp[g];bg=g}});
 const nAct=K.filter(k=>map[k]>0).length,avgAct=nAct?tot/nAct:0,pace=pastN?tot/pastN:0,proj=cur?Math.round(tot+pace*(n-pastN)):tot,
  gT=d.gl.filter(o=>o.g.type==='total').map(o=>o.g.min).sort((a,b)=>b-a)[0],ref=gT||prev||0,src=gT?'meta de tempo':v==='month'?'mês anterior':'ano anterior',pct=ref?Math.round(tot/ref*100):null,
  lab=g=>v==='month'?MESES[+g.slice(5,7)-1].slice(0,3)+'/'+g.slice(2,4):g;
 let bd=null,bdm=0;K.forEach(k=>{if((map[k]||0)>bdm){bdm=map[k];bd=k}});
 let o=`<h3>⏱️ ${cur?'Ritmo, projeção e aproveitamento':'Aproveitamento do '+RU[v]}</h3><div class="hsum">`;
 o+=rdCd(pct==null?'—':pct+'%',ref?`de aproveitamento · ${src} (${hh(ref)})`:'sem meta nem período anterior');
 o+=rdCd(nAct?hh(avgAct):'—','média por dia com estudo')+rdCd(nAct+' de '+pastN,'dias com estudo'+(cur?' até hoje':''))+rdCd(pastN?hh(pace):'—','média por dia (todos os dias)');
 if(cur)o+=rdCd('≈ '+hh(proj),`projeção para fechar o ${RU[v]}`);
 o+='</div>';
 if(cur){const left=n-pastN;o+=rdLn(`📐 Projeção: seu ritmo médio de ${hh(pace)} por dia${left?` aplicado aos ${left} dias restantes`:''}.${ref?` Isso seria <b style="color:var(--ink)">${Math.round(proj/ref*100)}%</b> da referência.`:''}`);
  if(prev>0&&tot<prev&&left)o+=rdLn(`➡️ Para igualar o ${RU[v]} anterior faltam <b style="color:var(--ink)">${hh(prev-tot)}</b> (≈${hh((prev-tot)/left)} por dia).`)}
 const rows=[[cur?'Até agora':'Total',tot,'var(--flame)',1]];if(cur&&proj>tot)rows.push(['Projeção',proj,'var(--flame)',.4]);
 rows.push([v==='month'?'Mês anterior':'Ano anterior',prev,'#7c83d6',1]);if(bg)rows.push(['🏆 Melhor '+RU[v]+' de todos: '+lab(bg),bgm,'#e0a31b',1]);
 const mx=Math.max(...rows.map(r=>r[1]),1);
 o+=`<h3>⚖️ Comparação</h3>`+rows.map(r=>rdBar(r[0],r[1],mx,r[2],r[3])).join('');
 if(prev>0)o+=rdLn(`📊 vs ${RU[v]} anterior ${rdS(rdDp(tot,prev))}`);
 if(bg)o+=rdLn(`🏆 Melhor ${RU[v]}: ${hh(bgm)} (${lab(bg)}). Este está em <b style="color:var(--ink)">${Math.round(tot/bgm*100)}%</b>${cur&&proj?`; projeção ${Math.round(proj/bgm*100)}%`:''}.`);
 if(bd)o+=rdLn(`📅 Melhor dia do ${RU[v]}: <b style="color:var(--ink)">${rdDt(bd)}</b> (${hh(bdm)}).`);
 const T=[];if(v==='month'&&pastN>=7&&nAct<pastN*.6)T.push(`📆 Você estudou em ${nAct} de ${pastN} dias. Subir a regularidade rende mais que aumentar o tamanho dos blocos.`);
 if(avgAct>0&&pace<avgAct*.6&&pastN>=7)T.push('🔁 Seus dias de estudo são bons; o que falta é frequência. Defina dias fixos.');
 if(!T.length&&tot>0)T.push('👍 Ritmo consistente. Reveja metas e objetivos para o próximo período.');
 if(T.length)o+=`<h3>💡 ${cur?'Dicas':'Leitura do '+RU[v]}</h3><ul style="margin:0;padding-left:20px">${T.map(x=>`<li style="margin-bottom:4px">${x}</li>`).join('')}</ul>`;
 /* Extrato por sub-período */
 const S_=[];if(v==='month'){for(let i=0;i<n;i+=7){const ks=K.slice(i,i+7),m=ks.reduce((a,k)=>a+(map[k]||0),0);S_.push({l:`Sem ${i/7+1} · ${br(ks[0])}–${br(ks[ks.length-1])}`,m,a:ks.filter(k=>map[k]>0).length,N:ks.length,fut:ks[0]>t})}}
 else for(let i=0;i<12;i++){const ks=K.filter(k=>+k.slice(5,7)===i+1),m=ks.reduce((a,k)=>a+(map[k]||0),0);S_.push({l:MESES[i][0].toUpperCase()+MESES[i].slice(1),m,a:ks.filter(k=>map[k]>0).length,N:ks.length,fut:ks[0]>t})}
 const mxS=Math.max(...S_.map(x=>x.m),1);
 o+=`<h3>🧾 Extrato do ${RU[v]}</h3>`+S_.map(x=>`<div style="opacity:${x.fut?.5:1}">${rdBar(x.l,x.m,mxS,x.fut?'var(--muted)':'var(--flame)',1,x.fut?'—':hh(x.m))}<small style="display:block;margin:-4px 0 6px 0;color:var(--muted)">${x.fut?'período futuro':x.a+' de '+x.N+' dias com estudo'}</small></div>`).join('');
 o+=`<div class="hsum" style="margin-top:10px">${rdCd(hh(tot),'total')}${rdCd(d.tk.d+' de '+d.tk.n,'tarefas planejadas feitas')}${rdCd('+'+d.xp,'XP')}${d.nfa?rdCd(d.fa.toFixed(1).replace('.',',')+'/5','concentração média'):''}</div>`;
 return o}
function repDeep(d){try{return d.v==='day'?rdDay(d):d.v==='week'?rdWeek(d):rdPer(d)}catch(e){console.error('repDeep',e);return''}}
setInterval(()=>{try{if(curPage!=='relatorio'||rTab!=='rel'||rV!=='day'||rOff!==0||document.hidden)return;const e=document.getElementById('rp-deep');if(e)e.innerHTML=repDeep(repData(rV,rOff))}catch(x){}},6e4);
function renderRep(){
 const el=$('#rp');if(!el||curPage!=='relatorio')return;
 const tabs=rpTabs();
 {const sw=$('#rp-subj');if(sw)sw.hidden=rTab!=='planej'}
 {const ow=$('#rp-obj');if(ow)ow.hidden=!OBJ.includes(rTab);const hw0=$('#rp-hist');if(hw0)hw0.hidden=rTab!=='hist';const cw=$('#rp-cal');if(cw)cw.hidden=rTab!=='cal'}
 if(rTab==='cal'||rTab==='planej'){el.innerHTML=tabs;return}
 if(OBJ.includes(rTab)){objShow();el.innerHTML=tabs;return}
 {const hw=$('#rp-hist');if(hw)hw.hidden=rTab!=='hist'}
 if(rTab==='hist'){el.innerHTML=tabs;return}
 if(rTab==='tarefas'){el.innerHTML=tabs+tkHtml();return}
 if(rTab==='planner'){el.innerHTML=tabs+pnHtml();return}
 if(rTab==='plano'){el.innerHTML=tabs+planHtml();return}
 const lk=wkKeys(-1)[0];if(rV==='week'&&rOff===-1&&S.repSeen!==lk){S.repSeen=lk;save()}
 
 const d=repData(rV,rOff),v=rV,key=pKey(v,d.P),r=(S.refl||{})[key]||{},tp=repTips(d),nd=d.keys.length;
 const dl=d.prev?Math.round((d.tot-d.prev)/d.prev*100):null,gOk=d.gl.filter(o=>o.i.ok).length+d.old.filter(o=>o.ok).length,gT=d.gl.length+d.old.length;
 const ym=v==='year'?yearMet(d):null,ta='style="width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--ink);font:inherit"';
 const seg=`<div class="seg" role="group" aria-label="Tipo de relatório">${Object.entries(RN).map(([k,l])=>`<button class="${v===k?'on':''}" data-a="rptype" data-v="${k}">${l[0].toUpperCase()+l.slice(1)}</button>`).join('')}</div>`;
 const gc=o=>`<div class="mgc${o.i.ok?' ok':''}" style="--c:${o.i.s?o.i.s.color:'var(--flame)'}"><div class="mgh"><div class="mgt">${goalLabel(o.g)}</div><span class="pct">${o.i.pct}%</span></div><div class="mgb"><div class="bar"><div style="width:${Math.min(100,o.i.pct)}%"></div></div></div></div>`;
 el.innerHTML=tabs+`<div class="mgs"><div class="ch"><h2 style="text-transform:none">${esc(d.P.label)}${d.cur?' <span style="font-weight:500;font-size:1rem;color:var(--muted)">· em andamento</span>':''}</h2><span style="display:flex;gap:6px;flex-wrap:wrap">${seg}<button class="btn" data-a="rpnav" data-v="-1" aria-label="Período anterior">‹</button><button class="btn" data-a="rpnav" data-v="0">Atual</button><button class="btn" data-a="rpnav" data-v="1" aria-label="Próximo período"${rOff>=0?' disabled':''}>›</button></span></div>
 <div class="hsum"><div><b>${d.tot?hh(d.tot):'0 min'}</b><span>total estudado</span></div><div><b>${dl==null?'—':(dl>0?'▲ +':dl<0?'▼ −':'= ')+Math.abs(dl)+'%'}</b><span>${d.prev?'vs '+RU[v]+' anterior ('+hh(d.prev)+')':'sem '+RU[v]+' anterior para comparar'}</span></div><div><b>${v==='day'?(d.days?'Estudou':'Não estudou'):d.days+' de '+nd}</b><span>${v==='day'?'no dia':'dias com estudo'}</span></div>${repExtra(d)}<div><b>+${d.xp}</b><span>XP ganho${d.xb>0?` (inclui +${d.xb} de bônus)`:''}</span></div><div><b>${d.tk.d} de ${d.tk.n}</b><span>tarefas concluídas (planejadas)</span></div></div>
 ${d.noTime?`<p class="sub" style="margin:8px 0 0">⚠️ ${d.noTime} dia${pl(d.noTime)} sem tempo registrado (tarefa concluída sem estimativa). Os números e dicas podem estar incompletos.</p>`:''}
 <div id="rp-deep">${repDeep(d)}</div>
 <h3>Gráfico</h3>${repChart(d)}
 <h3>Matérias</h3>${v==='day'?S.subjects.map(s=>({s,m:keysMin(d.keys,s)})).filter(o=>o.m>0).sort((a,b)=>b.m-a.m).map(o=>`<div style="display:flex;align-items:center;gap:8px;margin:5px 0"><span style="width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(o.s.name)}</span><div class="bar" style="flex:1"><div style="--c:${o.s.color};background:${o.s.color};width:${Math.max(3,Math.round(o.m/d.tot*100))}%"></div></div><b>${hh(o.m)}</b></div>`).join(''):''}${d.tot?`<p class="sub" style="margin:0">📈 Mais estudada: <b style="color:var(--ink)">${d.most?esc(d.most.s.name)+' ('+hh(d.most.m)+')':'—'}</b></p>${d.least?`<p class="sub" style="margin:4px 0 0">📉 Menos estudada: <b style="color:var(--ink)">${esc(d.least.s.name)} (${hh(d.least.m)})</b></p>`:''}`:`<p class="sub" style="margin:0">Nenhum estudo registrado neste ${RU[v]}.</p>`}
 ${d.nfa?`<p class="sub" style="margin:4px 0 0">🧠 Concentração média: <b style="color:var(--ink)">${d.fa.toFixed(1).replace('.',',')}/5</b> (${d.nfa} registro${pl(d.nfa)})</p>`:''}
 <h3>Metas cumpridas</h3>${ym?`<p class="sub" style="margin:0 0 6px">No ano: semanais <b style="color:var(--ink)">${ym.week[0]} de ${ym.week[1]}</b> · mensais <b style="color:var(--ink)">${ym.month[0]} de ${ym.month[1]}</b> · anuais <b style="color:var(--ink)">${ym.year[0]} de ${ym.year[1]}</b> (períodos encerrados)</p>`:''}${gT?`<p class="sub" style="margin:0 0 6px"><b style="color:var(--ink)">${gOk} de ${gT}</b> meta${pl(gT)} ${v==='year'?'anuais e de dias':'deste '+RU[v]}</p>${d.gl.map(gc).join('')}${d.old.map(o=>`<div class="mgc${o.ok?' ok':''}" style="--c:${o.s.color}"><div class="mgh"><div class="mgt">${esc(o.s.name)}<small>meta de dias · ${o.i.c} de ${o.g.target}</small></div><span class="pct">${Math.floor(o.i.pct)}%</span></div><div class="mgb"><div class="bar"><div style="width:${o.i.pct}%"></div></div></div></div>`).join('')}`:(ym?'':`<p class="sub" style="margin:0">Nenhuma meta para este ${RU[v]}. Crie em Metas &amp; Goals.</p>`)}
 <h3>${d.cur?'Para fechar '+({day:'hoje',week:'a semana',month:'o mês',year:'o ano'})[v]:'Análise e sugestões'}</h3><ul style="margin:0;padding-left:20px">${tp.L.map(x=>`<li style="margin-bottom:5px">${x}</li>`).join('')}</ul>
 ${tp.act?`<button class="btn main" style="margin-top:8px" data-a="rpblk" data-sid="${tp.act.sid}" data-h="${tp.act.h}">➕ Adicionar bloco de 40 min hoje às ${tp.act.h}h (${esc(tp.act.name)}) ao calendário</button>`:''}
 ${v==='week'?fwHtml(d):''}<h3>Reflexão do período</h3><label class="sub" style="display:block;margin:0 0 8px">O que funcionou?<textarea id="rf-w" rows="2" maxlength="400" ${ta}>${esc(r.w||'')}</textarea></label><label class="sub" style="display:block;margin:0 0 8px">O que ajustar?<textarea id="rf-a" rows="2" maxlength="400" ${ta}>${esc(r.a||'')}</textarea></label><button class="btn" data-a="rpsave">Salvar reflexão</button></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a^="rp"]');if(!b)return;const a=b.dataset.a;
 if(a==='rpnav'){const v=+b.dataset.v;rOff=v===0?0:Math.min(0,rOff+v);renderRep()}
 else if(a==='rptab'){const n=b.dataset.v;if(rTab==='rel'&&n==='hist'){hV=rV;hOff=rOff}else if(rTab==='hist'&&n==='rel'){rV=hV;rOff=hOff}rTab=n;render()}
 else if(a==='rptype'){rV=b.dataset.v;rOff=rV==='week'?-1:0;renderRep()}
 else if(a==='rpsave'){const w=$('#rf-w').value.trim(),x=$('#rf-a').value.trim(),k=pKey(rV,hPeriod(rV,rOff));S.refl=S.refl||{};if(w||x)S.refl[k]={w,a:x};else delete S.refl[k];save();renderHist();toast('Reflexão salva.');renderRep()}
 else if(a==='rpblk'){const s=S.subjects.find(x=>x.id===b.dataset.sid),t=fmt(now()),tm=p2(+b.dataset.h)+':00';if(!s)return;const T=s.topics=s.topics||[],nm='Estudar '+s.name;
  if(T.some(x=>x.name===nm&&x.date===t&&x.time===tm)){toast('Esse bloco já está no calendário.');return}
  T.push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:nm,date:t,time:tm,prio:'media',est:40,dur:40,done:false,doneAt:'',note:''});save();render();toast('Bloco de 40 min adicionado ao calendário.')}});
function repBanner(){
 const lk=wkKeys(-1)[0];if(S.repSeen===lk)return'';
 const tot=S.subjects.reduce((a,s)=>a+keysMin(wkKeys(-1),s),0);if(!tot)return'';
 return`<div class="pn"><div class="row" style="align-items:center"><span>📈 Seu <b>relatório da semana passada</b> está pronto.</span><button class="btn" data-a="nav" data-p="relatorio">Ver relatório</button></div></div>`}

/* ----- Plano semanal sugerido ----- */
let pOff=0;
function weekTarget(){
 const g=weeklyGoals().filter(x=>x.type==='total').map(x=>x.min).sort((a,b)=>b-a)[0];if(g)return{m:g,src:'sua meta semanal de tempo total'};
 let tot=0;for(let w=1;w<=4;w++)wkKeys(-w).forEach(k=>S.subjects.forEach(s=>tot+=s.days[k]||0));
 const a=Math.round(tot/4/30)*30;if(a>0)return{m:Math.max(a,120),src:'a média das suas últimas 4 semanas'};return{m:420,src:'uma sugestão inicial de 7h'}}
function wdHist(s){const c=Array(7).fill(0),t=now();for(let i=1;i<=56;i++){const d=addD(t,-i);if(fmt(d) in s.days)c[(d.getDay()+6)%7]++}return c}
/* Média de minutos estudados em cada dia da semana (Seg..Dom), últimas 8 semanas completas */
function wdStrength(){const c=Array(7).fill(0);for(let w=1;w<=8;w++)wkKeys(-w).forEach((k,i)=>S.subjects.forEach(s=>c[i]+=s.days[k]||0));return c.map(v=>v/8)}

/* Distribui U blocos (de 15 min) entre as posições, proporcional aos pesos w e respeitando o teto cap[i].
   Posições com peso 0 só recebem o que sobrar (excedente) e o que não couber volta em "left". */
function plFill(U,w,cap){
 const n=w.length,x=Array(n).fill(0);let left=U;
 for(const tier of [0,1]){
  let act=[];for(let i=0;i<n;i++)if((tier?w[i]<=0:w[i]>0)&&cap[i]>0)act.push(i);
  while(left>0&&act.length){
   const wt=i=>tier?1:w[i],sw=act.reduce((a,i)=>a+wt(i),0);
   const over=act.filter(i=>left*wt(i)/sw>cap[i]-x[i]+1e-9);
   if(over.length){over.forEach(i=>{left-=cap[i]-x[i];x[i]=cap[i]});act=act.filter(i=>!over.includes(i));continue}
   const al=act.map(i=>({i,v:left*wt(i)/sw}));let used=0;
   al.forEach(o=>{const f=Math.floor(o.v+1e-9);x[o.i]+=f;used+=f});
   al.sort((p,q)=>(q.v-Math.floor(q.v))-(p.v-Math.floor(p.v)));
   for(let k=0;used<left&&k<al.length*2;k++){const o=al[k%al.length];if(x[o.i]<cap[o.i]){x[o.i]++;used++}}
   left-=used;break}}
 return{x,left}}

const PL_CAP=48; /* teto diário: 12h = 48 blocos de 15 min, somando todas as matérias */
function planBuild(off){
 const A=S.subjects.filter(s=>!s.arch);if(!A.length)return null;
 const T=weekTarget(),fixed={},E=A.filter(s=>impOf(s)!==0),wg=weeklyGoals();
 wg.forEach(g=>{if(g.type==='subject'&&E.some(s=>s.id===g.sid))fixed[g.sid]=(fixed[g.sid]||0)+g.min});
 const fs=Object.values(fixed).reduce((a,b)=>a+b,0),W=E.filter(s=>!(s.id in fixed)).reduce((a,s)=>a+planFactor(s).w,0),rest=Math.max(0,T.m-fs);
 /* meta semanal de cada matéria (mesma regra de antes) */
 const subj=A.map(s=>{
  if(impOf(s)===0)return{s,m:0,days:[],f:subjFactor(s),fx:false,gd:false,out:true,allow:null};
  const f=planFactor(s),fx=s.id in fixed;let m=fx?fixed[s.id]:(W?rest*f.w/W:0);m=Math.round(m/15)*15;
  if(!fx){const fl=Math.min(Math.round(f.floor/15)*15,Math.round(T.m*(f.urgent?.7:.4)/15)*15);if(fl>m)m=fl;if(T.m>=E.length*90&&m<45)m=45}
  const w2=wg.filter(g=>g.type==='weekdays'&&g.sid===s.id),allow=w2.length?[...new Set(w2.flatMap(g=>g.wd))]:null;
  return{s,m,days:[],f,fx,gd:!!allow,allow,lm:Math.min(Math.round(f.floor/15)*15,Math.round(T.m*(f.urgent?.7:.4)/15)*15)}});
 const Teff=Math.max(T.m,subj.reduce((a,o)=>a+o.m,0));
 const mon=addD(monday(now()),7*off),keys=Array.from({length:7},(_,i)=>fmt(addD(mon,i))),t=fmt(now());
 const ti=off===0?(now().getDay()+6)%7:0,hist=wdStrength();
 const doneTo=(i,s)=>{let v=0;for(let j=0;j<i;j++)v+=s.days[keys[j]]||0;return v};
 const totTo=i=>S.subjects.reduce((a,s)=>a+doneTo(i,s),0);
 const memo={};
 /* Redistribui o que falta a partir do dia i (só conta o que foi estudado ANTES do dia i) */
 const dist=i=>{if(memo[i])return memo[i];
  const days=[];for(let d=i;d<7;d++)days.push(d);
  const el=subj.filter(o=>!o.out&&o.m>0),grid=subj.map(()=>Array(7).fill(0));
  let U=Math.round(Math.max(0,Teff-totTo(i))/15);if(!el.length)U=0;
  const debt=subj.map(o=>(!o.out&&o.m>0)?Math.max(0,o.m-doneTo(i,o.s),(o.lm||0)-(o.s.days[keys[i]]||0)):0);
  const wsub=debt.some(v=>v>0)?debt:subj.map(o=>(!o.out&&o.m>0)?o.f.w:0);
  const r=plFill(U,wsub,subj.map(()=>1e9)).x;
  const D=plFill(U,days.map(d=>hist[d]),days.map(()=>PL_CAP)).x,placed=Array(7).fill(0);let short=0;
  const ord=subj.map((o,ix)=>ix).filter(ix=>r[ix]>0).sort((p,q)=>(subj[q].f.urgent?1:0)-(subj[p].f.urgent?1:0)||(subj[q].allow?1:0)-(subj[p].allow?1:0)||r[q]-r[p]);
  ord.forEach(ix=>{
   const o=subj[ix];let ad=o.allow?days.filter(d=>o.allow.includes(d)):days;if(o.f.urgent){const di=keys.indexOf(o.s.dl),u=di>=0?days.filter(d=>d<=di):days;ad=u.length?u:days}if(!ad.length)ad=days;
   const res=plFill(r[ix],ad.map(d=>Math.max(0,D[d-i]-placed[d])),ad.map(d=>PL_CAP-placed[d]));
   ad.forEach((d,k)=>{grid[ix][d]+=res.x[k];placed[d]+=res.x[k]});let left=res.left;
   if(left>0){const od=days.filter(d=>!ad.includes(d)),r2=plFill(left,od.map(d=>Math.max(0,D[d-i]-placed[d])),od.map(d=>PL_CAP-placed[d]));
    od.forEach((d,k)=>{grid[ix][d]+=r2.x[k];placed[d]+=r2.x[k]});left=r2.left}
   short+=left});
  return memo[i]={grid,short}};
 const snapW=(off===0&&S.planSnap&&S.planSnap[fmt(mon)])||{};
 const col=(i,d)=>subj.map((o,ix)=>({s:o.s,m:dist(i).grid[ix][d]*15})).filter(c=>c.m>0);
 const dayList=keys.map((k,d)=>{
  const st=off===0?(d<ti?'past':d===ti?'today':'future'):'future';
  let plan;
  if(st==='past'&&snapW[k]){plan=Object.entries(snapW[k]).map(([id,m])=>({s:S.subjects.find(x=>x.id===id)||{id,name:'Matéria removida',color:'#64748B',days:{}},m})).filter(c=>c.m>0)}
  else plan=col(st==='past'?d:ti,d);
  const snap={};plan.forEach(c=>snap[c.s.id]=c.m);
  const real=S.subjects.map(s=>({s,m:s.days[k]||0})).filter(c=>c.m>0);
  return{k,st,plan,planTot:plan.reduce((a,c)=>a+c.m,0),real,realTot:real.reduce((a,c)=>a+c.m,0),snap}});
 subj.forEach((o,ix)=>{const g=dist(ti).grid[ix];o.days=g.map((u,d)=>u>0?d:-1).filter(d=>d>=0);
  o.done=off===0?keys.slice(0,ti+1).reduce((a,k)=>a+(o.s.days[k]||0),0):0;o.rem=Math.max(0,o.m-o.done)});
 const doneNow=off===0?totTo(ti+1):0;
 return{T,subj,days:dayList,mon,off,ti,Teff,doneNow,remWeek:Math.max(0,Teff-doneNow),short:dist(ti).short*15}}

/* Guarda o plano de cada dia (hoje é atualizado; dias passados ficam congelados) */
function planSnapSync(P){
 if(P.off!==0)return false;const wk=fmt(P.mon);S.planSnap=S.planSnap||{};const w=S.planSnap[wk]=S.planSnap[wk]||{};let ch=false;
 P.days.forEach(D=>{if(D.st==='future')return;if(D.st==='past'&&w[D.k])return;if(JSON.stringify(w[D.k])!==JSON.stringify(D.snap)){w[D.k]=D.snap;ch=true}});
 const ks=Object.keys(S.planSnap).sort();while(ks.length>26){delete S.planSnap[ks.shift()];ch=true}
 return ch}

function planHtml(){
 const P=planBuild(pOff),seg=`<div class="seg" role="group" aria-label="Semana"><button class="${pOff===0?'on':''}" data-a="plnav" data-v="0">Esta semana</button><button class="${pOff===1?'on':''}" data-a="plnav" data-v="1">Próxima semana</button></div>`;
 if(!P)return`<div class="mgs"><h2>Plano semanal</h2><p class="sub">Adicione uma matéria para montar o plano.</p></div>`;
 if(planSnapSync(P))save();
 const t=fmt(now()),ex=exams(),cur=P.days[P.ti];
 const days=P.days.map((D,i)=>{const d=addD(P.mon,i),k=D.k,exs=ex.filter(o=>o.x.date===k),rv=revN(k);
  let chips,sub='';
  if(D.st==='future'){chips=D.plan.map(c=>`<span class="pc" style="--c:${c.s.color}">${esc(c.s.name)} · ${hh(c.m)}</span>`).join('')}
  else{
   const ids=[...new Set(D.plan.map(c=>c.s.id).concat(D.real.map(c=>c.s.id)))];
   chips=ids.map(id=>{const p=D.plan.find(c=>c.s.id===id),r=D.real.find(c=>c.s.id===id),s=(p||r).s,pm=p?p.m:0,rm=r?r.m:0;
    const txt=pm?(D.st==='today'?(rm>=pm?`${hh(rm)} ✓`:`${hh(rm)} de ${hh(pm)}`):`${hh(rm)} de ${hh(pm)}`):`${hh(rm)} (extra)`;
    return`<span class="pc${pm?'':' ex'}" style="--c:${s.color}">${esc(s.name)} · ${txt}</span>`}).join('');
   sub=`<span class="pst">Planejado ${hh(D.planTot)} · Realizado ${hh(D.realTot)}${D.st==='past'&&D.planTot?(D.realTot>=D.planTot?' ✅':' ⚠️'):''}</span>`}
  const head=D.st==='future'&&D.planTot?` <span style="font-weight:400;color:var(--muted)">· ${hh(D.planTot)}</span>`:'';
  return`<div class="pd${k===t?' today':''}${D.st==='past'?' past':''}"><h4>${DIAS[i]} ${p2(d.getDate())}/${p2(d.getMonth()+1)}${head}</h4>${sub}${chips||(D.st==='future'?'<span class="sub" style="font-size:.8rem;margin:0">Descanso</span>':'')}${exs.map(o=>`<span class="pe">📝 ${esc(o.x.name)}</span>`).join('')}${rv?`<span class="pe">🔁 ${rv} revisã${rv===1?'o':'ões'}</span>`:''}</div>`}).join('');
 let obj='';
 if(pOff===0){
  const st=cur.realTot,pt=cur.planTot,rem=Math.max(0,pt-st),pct=pt?Math.min(100,Math.round(st/pt*100)):100,ok=rem===0;
  obj=`<div class="pobj${ok?' ok':''}"><div class="pot">🎯 Objetivo de hoje</div>`+
   (pt?`<div class="pov">${ok?'✅ Cumprido':'Faltam '+hh(rem)}</div><div class="pos">${hh(st)} estudados de ${hh(pt)} planejados para hoje${ok&&st>pt?` · ${hh(st-pt)} além do plano`:''}</div><div class="pbar"><i style="width:${pct}%"></i></div>`
    :`<div class="pov">${P.remWeek?'Dia livre':'✅ Meta da semana cumprida'}</div><div class="pos">${P.remWeek?'O plano não reservou tempo para hoje. O que falta foi distribuído nos próximos dias.':'Você já estudou o que a meta da semana pedia.'}</div>`)+`</div>`}
 const warn=P.short>0?`<div class="pwarn" role="alert">⚠️ <b>Meta fora de alcance.</b> Mesmo estudando 12h por dia até domingo, ainda faltariam <b>${hh(P.short)}</b> para fechar ${hh(P.Teff)} nesta semana. Sugestão: reduza a meta da semana para cerca de <b>${hh(Math.floor((P.Teff-P.short)/15)*15)}</b> ou reajuste as metas de matéria.<br><button class="btn" data-a="nav" data-p="metas">Ajustar metas</button></div>`:'';
 const intro=pOff===0
  ?`Meta de <b style="color:var(--ink)">${hh(P.Teff)}</b> na semana (${P.T.src}). Já estudado: <b style="color:var(--ink)">${hh(P.doneNow)}</b> · falta <b style="color:var(--ink)">${hh(P.remWeek)}</b>. Todo dia, o que falta é redistribuído de hoje até domingo, mais nos dias em que você costuma estudar mais (últimas 8 semanas), com no máximo 12h por dia. Dias passados ficam congelados.`
  :`Projeção para a semana que vem: meta de <b style="color:var(--ink)">${hh(P.Teff)}</b> (${P.T.src}), distribuída pelos dias em que você costuma estudar mais, com no máximo 12h por dia. Ela é recalculada todo dia quando a semana começar.`;
 return`<div class="mgs"><div class="ch"><h2 style="text-transform:none">Plano semanal sugerido</h2>${seg}</div>
 ${obj}${warn}
 <p class="sub" style="margin-top:0">${intro}</p>
 <div class="pg">${days}</div>
 <div class="fa" style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn main" data-a="plapply">Adicionar ao calendário</button></div>
 <p class="sub" style="margin:8px 0 0;font-size:.8rem">Só entram os blocos que ainda não existem no calendário; os já criados mantêm o tempo. Para hoje, entra o que ainda falta.</p></div>
 <div class="mgs"><h2>Peso por matéria</h2><p class="sub" style="margin-top:0">Ajuste a dificuldade, a importância, o conteúdo já visto, o domínio e o peso na prova de cada matéria (campos extras valem só para o plano; "—" = não informado). O plano e as sugestões se atualizam.</p>
 ${P.subj.map(o=>`<div class="mgc" style="--c:${o.s.color}"><div class="mgh"><div class="mgt">${esc(o.s.name)}<small>${o.out?'fora do plano semanal · sem importância':(o.m?hh(o.m)+'/semana':'sem tempo sugerido')+(pOff===0&&o.m?` · feito ${hh(o.done)} · falta ${hh(o.rem)}`:'')+(o.days.length?' · '+o.days.map(d=>DNAMES[d]).join(', '):'')+(o.fx?' · meta de tempo':'')+(o.f.why?' · '+o.f.why:'')}</small></div><label style="font-size:.8rem;color:var(--muted);display:flex;flex-direction:column;gap:2px">Dificuldade${diffSel(o.s)}</label><label style="font-size:.8rem;color:var(--muted);display:flex;flex-direction:column;gap:2px">Importância${impSel(o.s)}</label></div>${o.out?'':`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">${planExtra(o.s)}</div>`}</div>`).join('')}</div>`}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a="plnav"],[data-a="plapply"]');if(!b)return;
 if(b.dataset.a==='plnav'){pOff=+b.dataset.v;renderRep();return}
 const P=planBuild(pOff);if(!P)return;const t=fmt(now());let n=0;
 P.days.forEach(D=>{if(D.k<t)return;D.plan.forEach(c=>{
  let m=D.k===t?c.m-(c.s.days[t]||0):c.m;m=Math.floor(m/15)*15;if(m<15)return;
  const nm='Estudar '+c.s.name,T=c.s.topics=c.s.topics||[];
  if(T.some(x=>x.name===nm&&x.date===D.k))return;
  T.push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:nm,date:D.k,prio:'media',est:m,dur:m,done:false,doneAt:'',note:''});n++})});
 if(!n){toast('Esses blocos já estão no calendário.');return}
 save();render();toast(`${n} bloco${pl(n)} adicionado${pl(n)} ao calendário.`)});

/* ----- Painel da tela inicial ----- */
function renderPanel(){const el=$('#panel');if(el)el.innerHTML=examsHtml()+revHtml(false)+rwBanner()+repBanner()+cfBanner()}

$('#rec').onclick=()=>records();
const save0=save,chkRec=()=>{if(chkRec.b)return;chkRec.b=1;try{records(true);save0()}catch(e){}finally{chkRec.b=0}};
save=()=>{save0();chkRec()};
migrate();chkRec();
