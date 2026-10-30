/* ===== Metas & Goals (tempo total, por matéria, dias da semana) ===== */
const SCOPE={day:'Dia',week:'Semana',month:'Mês',year:'Ano'},SCOPE_T={day:'Hoje',week:'Esta semana',month:'Este mês',year:'Este ano'};
const TYPE={total:'Tempo total de estudo',subject:'Tempo por matéria',weekdays:'Dias da semana por matéria'};
const DNAMES=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
let mgDraft=null;
function mgKeys(sc){const t=now();
 if(sc==='day')return[fmt(t)];
 if(sc==='week'){const m=monday(t);return Array.from({length:7},(_,i)=>fmt(addD(m,i)))}
 if(sc==='year')return hPeriod('year',0).keys;
 const n=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();return Array.from({length:n},(_,i)=>fmt(new Date(t.getFullYear(),t.getMonth(),i+1,12)))}
const mgSubs=g=>Array.isArray(g.sids)?S.subjects.filter(x=>g.sids.includes(x.id)):S.subjects;
function mgCalc(g,keysIn){
 const keys=keysIn||mgKeys(g.scope),t=fmt(now()),cur=keys.includes(t),elapsed=Math.max(1,keys.filter(k=>k<=t).length),daysLeft=keys.filter(k=>k>=t).length;
 if(g.type==='weekdays'){
  const s=S.subjects.find(x=>x.id===g.sid);if(!s)return{gone:true,pct:0};
  const plan=keys.filter(k=>g.wd.includes((parse(k).getDay()+6)%7)),done=plan.filter(k=>k in s.days).length,
   missed=plan.filter(k=>k<t&&!(k in s.days)).length,left=plan.filter(k=>k>=t&&!(k in s.days)).length;
  const pct=plan.length?Math.floor(done/plan.length*100):0,ok=plan.length>0&&done>=plan.length;
  const msg=ok?'Meta batida! 🎉':!plan.length?'Nenhum dia desta seleção cai neste período.':`Faltam ${plan.length-done} dia${pl(plan.length-done)} de estudo${missed?` · ${missed} já passou${missed===1?'':'ram'} sem estudo`:''}.`;
  let fc='';if(!ok&&plan.length&&cur){const mx=Math.floor((done+left)/plan.length*100);fc=mx>=100?`Estudando nos ${left} dia${pl(left)} planejado${pl(left)} que restam, você chega a 100%.`:`Pelos dias que passaram sem estudo, o máximo possível agora é ${mx}%.`}
  return{pct,ok,msg,fc,line:`${done} de ${plan.length} dia${pl(plan.length)} planejado${pl(plan.length)}`,s}}
 const s=g.type==='subject'?S.subjects.find(x=>x.id===g.sid):null;if(g.type==='subject'&&!s)return{gone:true,pct:0};
 const m=g.type==='total'?mgSubs(g).reduce((a,x)=>a+hMin(x,keys),0):hMin(s,keys),tg=g.min,pct=tg?Math.floor(m/tg*100):0,ok=m>=tg,need=tg-m;let fc='';
 if(!ok&&cur){
  if(g.scope==='day')fc=`Faltam ${hh(need)} para fechar o dia.`;
  else{const pp=Math.floor(m/elapsed*keys.length/tg*100);fc=pp>=100?'No ritmo atual você bate a meta. ✅':`No ritmo atual você chega a ${pp}% da meta ${{week:'semanal',month:'mensal',year:'anual'}[g.scope]}.`;if(daysLeft>0)fc+=` Para fechar, faltam ${hh(need/daysLeft)}/dia nos ${daysLeft} dia${pl(daysLeft)} restantes.`}}
 return{pct,ok,s,fc,line:`${hh(m)} de ${hh(tg)}`,msg:ok?'Meta batida! 🎉':`Faltam ${hh(need)}.`}}
function mgTitle(g,i){
 const s=i.s||S.subjects.find(x=>x.id===g.sid);
 if(g.type==='total'){const L=mgSubs(g);return{t:'Tempo total de estudo',sub:Array.isArray(g.sids)&&L.length<S.subjects.length?L.map(x=>esc(x.name)).join(', ')||'matérias removidas':'todas as matérias'}}
 if(g.type==='subject')return{t:`Tempo em ${s?esc(s.name):'matéria removida'}`,sub:''};
 return{t:`Estudar ${s?esc(s.name):'matéria removida'}`,sub:g.wd.slice().sort().map(d=>DNAMES[d]).join(', ')};
}
function mgCard(g){
 const i=mgCalc(g),T=mgTitle(g,i),c=i.s?i.s.color:'var(--flame)';
 if(i.gone)return`<div class="mgc"><div class="mgh"><div class="mgt">Matéria removida<small>${SCOPE[g.scope]} · ${TYPE[g.type]}</small></div><div class="acts"><button class="ghost" data-a="mgedit" data-id="${g.id}">Editar</button><button class="ghost danger" data-a="mgdel" data-id="${g.id}">Excluir</button></div></div><p class="mgm">A matéria desta meta foi excluída. Edite para escolher outra ou exclua a meta.</p></div>`;
 return`<div class="mgc${i.ok?' ok':''}" style="--c:${c}"><div class="mgh"><div class="mgt">${T.t}<small>${SCOPE[g.scope]}${T.sub?' · '+T.sub:''}</small></div><div class="acts"><button class="ghost" data-a="mgedit" data-id="${g.id}">Editar</button><button class="ghost danger" data-a="mgdel" data-id="${g.id}">Excluir</button></div></div>
 <div class="mgb"><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100,i.pct)}"><div style="width:${Math.min(100,i.pct)}%"></div></div><span class="pct">${i.pct}%</span></div>
 <p class="mgm"><b style="color:var(--ink)">${i.line}</b> · ${i.msg}${i.fc?'<br>🔮 '+i.fc:''}</p></div>`}
function mgForm(){
 const d=mgDraft||(mgDraft={id:'',scope:'week',type:'total',sid:(S.subjects[0]||{}).id||'',h:'1',m:'0',wd:[],sids:S.subjects.filter(s=>!s.arch).map(s=>s.id)});
 if(d.scope==='day'&&d.type==='weekdays')d.type='total';
 const subs=S.subjects.filter(s=>!s.arch||s.id===d.sid).map(s=>`<option value="${s.id}"${s.id===d.sid?' selected':''}>${esc(s.name)}${s.arch?' (arquivada)':''}</option>`).join('');
 const types=Object.entries(TYPE).filter(([k])=>!(k==='weekdays'&&d.scope==='day')).map(([k,l])=>`<option value="${k}"${d.type===k?' selected':''}>${l}</option>`).join('');
 const need=d.type!=='total';
 return`<div class="mgf" id="mgf"><h3 style="margin-top:0">${d.id?'Editar meta':'Nova meta'}</h3>
 <div class="mgr"><label>Período<select data-f="scope">${Object.entries(SCOPE).map(([k,l])=>`<option value="${k}"${d.scope===k?' selected':''}>${l}</option>`).join('')}</select></label>
 <label>Tipo de meta<select data-f="type">${types}</select></label>
 ${need?`<label>Matéria<select data-f="sid">${subs||'<option value="">Nenhuma matéria</option>'}</select></label>`:''}</div>
 ${d.type==='weekdays'?`<p class="sub" style="margin:0 0 8px">Dias da semana em que pretende estudar:</p><div class="wdc">${DNAMES.map((n,i)=>`<label><input type="checkbox" data-wd="${i}"${d.wd.includes(i)?' checked':''}>${n}</label>`).join('')}</div>`
 :`${d.type==='total'?`<p class="sub" style="margin:0 0 8px">Matérias que contam para esta meta (só o tempo delas entra no cálculo):</p><div class="wdc" style="margin-bottom:12px">${S.subjects.filter(s=>!s.arch).map(s=>`<label><input type="checkbox" data-sid="${s.id}"${d.sids.includes(s.id)?' checked':''}>${esc(s.name)}</label>`).join('')||'<span class="sub">Nenhuma matéria cadastrada.</span>'}</div>`:''}<div class="mgr" style="margin-bottom:0"><label>Quanto estudar ${d.scope==='day'?'no dia':d.scope==='week'?'na semana':d.scope==='year'?'no ano':'no mês'}<span class="hm"><input type="number" min="0" max="999" inputmode="numeric" data-f="h" value="${esc(d.h)}" aria-label="Horas"> h <input type="number" min="0" max="59" inputmode="numeric" data-f="m" value="${esc(d.m)}" aria-label="Minutos"> min</span></label></div>`}
 <div class="fa"><button class="btn main" data-a="mgsave">${d.id?'Salvar alterações':'Criar meta'}</button>${d.id?'<button class="btn" data-a="mgcancel">Cancelar</button>':''}</div></div>`}
function renderMG(){
 const el=$('#mg');if(!el||curPage!=='relatorio'||!OBJ.includes(rTab))return;
 const ae=document.activeElement,keep=ae&&el.contains(ae)&&ae.dataset&&(ae.dataset.f||ae.dataset.wd!=null||ae.dataset.sid)?(ae.dataset.f?`[data-f="${ae.dataset.f}"]`:ae.dataset.sid?`[data-sid="${ae.dataset.sid}"]`:`[data-wd="${ae.dataset.wd}"]`):null;
 const gs=S.mg||[];
 const sec=sc=>{const L=gs.filter(g=>g.scope===sc);return`<h3>${SCOPE_T[sc]}</h3>${L.length?L.map(mgCard).join(''):`<p class="sub" style="margin:0">Nenhuma meta de ${SCOPE[sc].toLowerCase()}.</p>`}`};
 const t=fmt(now());
 const old=[];S.subjects.forEach(s=>(s.goals||[]).forEach(g=>old.push({s,g})));
 const oc=({s,g})=>{const i=goalInfo(s,g);return`<div class="mgc${i.pct>=100?' ok':''}" style="--c:${s.color}"><div class="mgh"><div class="mgt">${esc(s.name)}<small>${br(g.start)} a ${br(g.end)} · dias estudados</small></div><div class="acts"><button class="ghost" data-a="mgopen" data-id="${s.id}">Gerenciar</button></div></div><div class="mgb"><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor(i.pct)}"><div style="width:${i.pct}%"></div></div><span class="pct">${Math.floor(i.pct)}%</span></div><p class="mgm"><b style="color:var(--ink)">${i.c} de ${g.target} dias</b> · ${i.msg}</p></div>`};
 const cur=old.filter(o=>o.g.end>=t).sort((a,b)=>a.g.end<b.g.end?-1:1),past=old.filter(o=>o.g.end<t).sort((a,b)=>a.g.end<b.g.end?1:-1);
 el.innerHTML=`<div class="mgs"><h2>Suas metas</h2><p class="sub" style="margin-top:0">O progresso é calculado automaticamente com o tempo já registrado no app.</p>${mgForm()}${sec('day')}${sec('week')}${sec('month')}${sec('year')}</div>${rwSection()}
 <div class="mgs"><h2>Metas por matéria (dias estudados)</h2><p class="sub" style="margin-top:0">As metas criadas dentro de cada matéria continuam funcionando aqui. Use Gerenciar para criar, editar ou excluir.</p>${cur.length?cur.map(oc).join(''):'<p class="sub">Nenhuma meta de dias em andamento.</p>'}${past.length?`<details style="margin-top:12px"><summary style="cursor:pointer;color:var(--muted)">${past.length} encerrada${pl(past.length)}</summary>${past.map(oc).join('')}</details>`:''}</div>`;
 if(keep){const n=el.querySelector(keep);if(n)n.focus({preventScroll:true})}
}
function mgSync(t){
 const d=mgDraft;if(!d)return;
 if(t.dataset.f){d[t.dataset.f]=t.value;if(['scope','type'].includes(t.dataset.f))renderMG()}
 else if(t.dataset.sid){const n=t.dataset.sid;d.sids=t.checked?[...new Set([...d.sids,n])]:d.sids.filter(x=>x!==n)}
 else if(t.dataset.wd!=null){const n=+t.dataset.wd;d.wd=t.checked?[...new Set([...d.wd,n])]:d.wd.filter(x=>x!==n)}
}
document.addEventListener('input',e=>{if(e.target.closest('#mgf')&&e.target.dataset.f&&e.target.tagName==='INPUT')mgSync(e.target)});
document.addEventListener('change',e=>{if(e.target.closest('#mgf'))mgSync(e.target)});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a^="mg"]');if(!b)return;const a=b.dataset.a,id=b.dataset.id;
 if(a==='mgsave'){
  const d=mgDraft;if(!d)return;let g;
  if(d.type==='weekdays'){
   if(!S.subjects.find(x=>x.id===d.sid)){toast('Escolha uma matéria.');return}
   if(!d.wd.length){toast('Marque pelo menos um dia da semana.');return}
   g={scope:d.scope,type:'weekdays',sid:d.sid,wd:d.wd.slice().sort()}}
  else{
   const min=(parseInt(d.h)||0)*60+(parseInt(d.m)||0);
   if(min<=0){toast('Informe um tempo maior que zero.');return}
   if(d.type==='subject'&&!S.subjects.find(x=>x.id===d.sid)){toast('Escolha uma matéria.');return}
   if(d.type==='total'&&!d.sids.some(id=>S.subjects.some(x=>x.id===id))){toast('Marque pelo menos uma matéria.');return}
   g={scope:d.scope,type:d.type,min};if(d.type==='subject')g.sid=d.sid;if(d.type==='total')g.sids=d.sids.filter(id=>S.subjects.some(x=>x.id===id))}
  if(d.id){const i=S.mg.findIndex(x=>x.id===d.id);if(i>=0)S.mg[i]={id:d.id,...g}}else S.mg.push({id:'m'+Date.now().toString(36),...g});
  mgDraft=null;save();render();toast(d.id?'Meta atualizada.':'Meta criada.')}
 else if(a==='mgedit'){const g=S.mg.find(x=>x.id===id);if(!g)return;
  mgDraft={id:g.id,scope:g.scope,type:g.type,sid:g.sid||(S.subjects[0]||{}).id||'',h:String(Math.floor((g.min||0)/60)),m:String((g.min||0)%60),wd:(g.wd||[]).slice(),sids:(Array.isArray(g.sids)?g.sids:S.subjects.map(x=>x.id)).filter(id=>S.subjects.some(x=>x.id===id&&!x.arch))};
  renderMG();$('#mgf').scrollIntoView({behavior:'smooth',block:'center'})}
 else if(a==='mgcancel'){mgDraft=null;renderMG()}
 else if(a==='mgdel'){if(confirm('Excluir esta meta?')){S.mg=S.mg.filter(x=>x.id!==id);if(mgDraft&&mgDraft.id===id)mgDraft=null;save();render();toast('Meta excluída.')}}
 else if(a==='mgopen'){tab='goals';detail(id)}
});

/* ===================== ETAPA 2 ===================== */
const ATOS=[
 ['Ato I: Iniciação','Quem está começando, ainda sem profissão.'],
 ['Ato II: Estrada','Já viaja, luta e sobrevive por conta própria.'],
 ['Ato III: Ofício','Escolhe um caminho e começa a se especializar na magia e no conhecimento.'],
 ['Ato IV: Ordem','Entra para uma ordem de cavaleiros-estudiosos e sobe na hierarquia.'],
 ['Ato V: Fama','Seu nome já é conhecido em vários reinos.'],
 ['Ato VI: Nobreza','Recebe terras, títulos e passa a governar.'],
 ['Ato VII: Arcano Supremo','Volta ao estudo da magia, agora em nível de poder máximo.'],
 ['Ato VIII: Ascensão','Deixa de ser mortal e se aproxima do divino.'],
 ['Ato IX: Cosmos','Seu poder ultrapassa o mundo e alcança a própria realidade.'],
 ['Ato X: Lenda','A fase final: seu nome vira história, mito e eternidade.']];
const NOMES=['Curioso','Aprendiz','Noviço','Escudeiro','Recruta','Explorador','Pupilo da Guilda','Aspirante','Iniciado','Aventureiro',
 'Andarilho','Batedor','Rastreador','Caçador','Mercenário','Guerreiro do Saber','Veterano de Estrada','Capitão de Grupo','Herói Local','Campeão da Vila',
 'Estudante de Magia','Mago Aprendiz','Mago Iniciante','Mago','Mago Adepto','Mago Veterano','Mago Mestre','Feiticeiro','Feiticeiro Mestre','Arcanista',
 'Postulante da Ordem','Escudeiro da Ordem','Cavaleiro Erudito','Cavaleiro Sênior','Cavaleiro Condecorado','Comandante de Esquadrão','Capitão da Ordem','Marechal','Cavaleiro Lendário','Grão-Cavaleiro',
 'Renomado','Célebre','Estimado','Honrado','Glorioso','Campeão do Reino','Herói do Reino','Defensor da Coroa','Lenda Regional','Lenda da Sabedoria',
 'Barão','Visconde','Conde','Marquês','Duque','Arquiduque','Príncipe','Regente','Rei','Imperador',
 'Mago da Corte','Mago Real','Mago Imperial','Mestre das Runas','Mestre dos Elementos','Mestre do Tempo','Oráculo','Profeta','Arquimago','Arquimago Supremo',
 'Abençoado','Escolhido','Ascendente','Semideus','Arauto','Guardião Celestial','Titã','Divindade Menor','Divindade','Deus do Saber',
 'Viajante das Estrelas','Navegador Cósmico','Guardião dos Planos','Senhor das Estrelas','Forjador de Mundos','Tecelão do Destino','Arquiteto da Realidade','Senhor do Cosmos','Mestre do Multiverso','Entidade Eterna',
 'Imortal','Mito Vivo','Herói de Todas as Eras','Lenda Viva','Lenda Imortal','Lenda Primordial','Guardião de Todas as Eras','Sábio Supremo','Grão-Mestre Absoluto','Lenda Eterna da Sabedoria'];
/* ===== ETAPA 4: bônus de +25% de XP =====
   Só vale para sínteses salvas depois da ativação (S.xb.since). Fica guardado no registro da síntese (x.xb, em XP),
   então apagar a sessão apaga o bônus. Não entra em horas, médias, relatórios de tempo nem metas. */
const XB_RATE=.25;
const xbCalc=m=>Math.round(Math.max(0,+m||0)*100/60*XB_RATE*100)/100;
function xbSum(from,to){const ids=new Set(S.subjects.map(s=>s.id));let b=0;(S.log||[]).forEach(x=>{if(x.xb>0&&ids.has(x.sid)&&x.d>=from&&x.d<=to){const sb=S.subjects.find(y=>y.id===x.sid);if(sb&&impAt(sb,x.d)!==0)b+=x.xb}});return b}
/* XP: 100 por hora estudada. Custo do nível n para n+1 cresce 25% do custo base a cada nível. */
const XPC=n=>Math.round(100*(1+(n-1)*.25));
/* XP da sequência: conta só o tempo desde a última pausa de 2 dias seguidos sem estudar.
   Estudou no dia D, faltou D+1 e D+2 => zera ao virar para D+3. No dia D+2 o XP está em risco. */
function xpRun(){
 const t=fmt(now()),days=new Set();S.subjects.forEach(s=>Object.keys(s.days).forEach(k=>{if(k<=t&&plOf(s,k)>0)days.add(k)}));chCfg().off.forEach(k=>{if(k<=t)days.add(k)});
 const ks=[...days].sort();if(!ks.length)return{xp:0,xb:0,lo:0,last:null,gap:null};
 const last=ks[ks.length-1],gap=diff(last,t);if(gap>=3)return{xp:0,xb:0,lo:0,last,gap};
 let i=ks.length-1;while(i>0&&diff(ks[i-1],ks[i])<=2)i--;
 const start=ks[i];let min=0;S.subjects.forEach(s=>Object.keys(s.days).forEach(k=>{if(k>=start&&k<=t)min+=plOf(s,k)}));
 const xb=xbSum(start,t),pos=chAdj(start,t,1),neg=chAdj(start,t,-1);return{xp:Math.max(0,Math.floor(min*100/60+xb+pos+neg)),xb:Math.floor(xb+pos),lo:Math.floor(-neg),last,gap}}
function lvInfo(xp){let n=1,r=xp;while(n<100&&r>=XPC(n)){r-=XPC(n);n++}return{n,r,need:n<100?XPC(n):0}}
function renderLvl(){
 const el=$('#lvl');if(!el)return;
 const R=xpRun(),xp=R.xp,L=lvInfo(xp),ato=ATOS[Math.floor((L.n-1)/10)],pct=L.need?Math.floor(L.r/L.need*100):100,risk=R.gap===2&&xp>0;
 el.title=ato[1];el.classList.toggle('risk',risk);
 el.innerHTML=`<div class="lvb" aria-hidden="true">Nível<b>${L.n}</b></div><div class="lvm"><div class="lvn">Nível ${L.n}/${NOMES.length} · ${esc(NOMES[L.n-1])}</div><div class="lva">${ato[0]}</div>
 <div class="bar" role="progressbar" aria-label="Progresso do nível" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div style="width:${pct}%"></div></div>
 <div class="lvx">${L.need?`${L.r} / ${L.need} XP · faltam ${L.need-L.r} para ${esc(NOMES[L.n])}`:'Nível máximo alcançado'} · ${xp} XP na sequência${R.xb>0?` · inclui +${R.xb} de bônus ⚡`:''}${R.lo>0?` · −${R.lo} por punição`:''}</div>
 ${risk?`<div class="lvr" role="alert">⚠️ Seu XP está em risco! Estude hoje ou ele zera à meia-noite.</div>`:xp===0?`<div class="lvx">Estude hoje para começar a ganhar XP. Ele zera após 2 dias sem estudar.</div>`:''}</div>`;
 if(S.xpv!==2){S.xpv=2;S.lvSeen=L.n;save()}
 else if(L.n!==S.lvSeen){const up=L.n>S.lvSeen;S.lvSeen=L.n;save();toast(up?`⬆️ Nível ${L.n}: ${NOMES[L.n-1]}!`:(xp===0?'💥 XP zerado: 2 dias sem estudar. Recomece sua jornada!':'📉 Você perdeu XP e caiu para o nível '+L.n+'.'))}
}

/* ----- Dificuldade, prioridade e peso ----- */
const DIFF=['','Fácil','Média','Difícil'];
const IMP=['Nenhuma (fora do plano)','Baixa','Normal','Alta'];
const IMPW=[0,.6,1,1.5];
const diffOf=s=>s.diff===4?2:(s.diff||2);
const impOf=s=>s.imp!=null?s.imp:(s.diff===4?0:2);
const visSubj=s=>s.arch?showArch:(showNoImp||impOf(s)>0);
const diffSel=s=>`<select data-diff="${s.id}" aria-label="Dificuldade de ${esc(s.name)}">${[1,2,3].map(n=>`<option value="${n}"${diffOf(s)===n?' selected':''}>${DIFF[n]}</option>`).join('')}</select>`;
const impSel=s=>`<select data-imp="${s.id}" aria-label="Importância de ${esc(s.name)}">${[0,1,2,3].map(n=>`<option value="${n}"${impOf(s)===n?' selected':''}>${IMP[n]}</option>`).join('')}</select>`;
const pSel=(s,k,lab,opts)=>`<label style="font-size:.8rem;color:var(--muted);display:flex;flex-direction:column;gap:2px">${lab}<select data-pf="${k}" data-sid="${s.id}" aria-label="${lab} de ${esc(s.name)}"><option value="">—</option>${opts.map(([v,l])=>`<option value="${v}"${s[k]===v?' selected':''}>${l}</option>`).join('')}</select></label>`;
const planExtra=s=>`<label style="font-size:.8rem;color:var(--muted);display:flex;flex-direction:column;gap:2px">Prazo de entrega<input type="date" data-pd="${s.id}" value="${s.dl||''}" aria-label="Prazo de ${esc(s.name)}"></label>`+pSel(s,'cov','Conteúdo visto',[[10,'0–20%'],[30,'20–40%'],[50,'40–60%'],[70,'60–80%'],[90,'80–100%']])+pSel(s,'dom','Domínio',[[1,'Muito baixo'],[2,'Baixo'],[3,'Médio'],[4,'Alto'],[5,'Muito alto']])+pSel(s,'pw','Peso na prova',[[0,'Baixo'],[1,'Normal'],[2,'Alto'],[3,'Muito alto']]);
document.addEventListener('change',e=>{const t=e.target.dataset;if(!t||!t.pd)return;const s=S.subjects.find(x=>x.id===t.pd);if(!s)return;if(e.target.value)s.dl=e.target.value;else delete s.dl;save();render()});
document.addEventListener('change',e=>{const t=e.target.dataset;if(!t||!t.pf)return;const s=S.subjects.find(x=>x.id===t.sid);if(!s)return;
 if(e.target.value==='')delete s[t.pf];else s[t.pf]=+e.target.value;save();render()});
document.addEventListener('change',e=>{const t=e.target.dataset;if(!t||(!t.diff&&!t.imp))return;const s=S.subjects.find(x=>x.id===(t.diff||t.imp));if(!s)return;
 if(s.imp==null)s.imp=impOf(s);
 if(t.diff)s.diff=+e.target.value||2;else{const nv=+e.target.value,td=fmt(now());if(!Array.isArray(s.imph)||!s.imph.length)s.imph=[{from:'0000-00-00',v:impOf(s)}];s.imph=s.imph.filter(h=>h.from!==td).concat({from:td,v:nv});s.imp=nv}
 save();render()});
function subjFactor(s){
 const d=diffOf(s),im=impOf(s),ex=exams().find(o=>o.s.id===s.id);let b=1;const why=[];
 if(d===3)why.push('difícil');else if(d===1)why.push('fácil');if(im===3)why.push('importância alta');else if(im===1)why.push('importância baixa');else if(im===0)why.push('sem importância');
 if(ex){if(ex.n<=7)b=2;else if(ex.n<=14)b=1.6;else if(ex.n<=30)b=1.25;if(ex.n<=30)why.push(`prova ${ex.n===0?'hoje':'em '+ex.n+' dia'+pl(ex.n)}`)}
 return{w:[.7,1,1.5][d-1]*IMPW[im]*b,why:why.join(' · '),ex,d,im}}
/* Plano semanal: fatores extras (tarefas atrasadas/pendentes, revisões vencidas, dias sem estudar, defasagem). Só usado no plano. */
function planFactor(s){
 const f=subjFactor(s),t=fmt(now()),mon=monday(now()),wk=[0,1,2,3,4,5,6].map(i=>fmt(addD(mon,i))),why=f.why?[f.why]:[];
 const T0=()=>(s.topics||[]).filter(x=>!x.done&&!x.exam),T=(s.topics||[]).filter(x=>!x.done&&!x.exam&&x.date),late=T.filter(x=>x.date<t),pend=T.filter(x=>x.date>=t&&wk.includes(x.date));
 const lateMin=late.reduce((a,x)=>a+(x.est||30),0);
 let m=1;
 if(late.length){m*=Math.min(2.5,1+.25*late.length);why.push(`${late.length} tarefa${late.length>1?'s':''} atrasada${late.length>1?'s':''}`)}
 if(pend.length){m*=Math.min(1.3,1+.08*pend.length);why.push(`${pend.length} tarefa${pend.length>1?'s':''} na semana`)}
 let urgent=false,pendMin=0;
 if(s.dl){const dd=Math.round((parse(s.dl)-parse(t))/864e5);
  if(dd>=0&&dd<=21){const k=dd<=1?3:dd<=3?2.2:dd<=7?1.6:dd<=14?1.3:1.1;m*=k;urgent=dd<=3;why.push(`prazo ${dd===0?'hoje':dd===1?'amanhã':'em '+dd+' dias'}`);
   if(urgent)pendMin=T0().reduce((a,x)=>a+(x.est||30),0)}}
 const rv=(S.rev||[]).filter(r=>r.sid===s.id&&!r.done&&r.date<t).length;
 if(rv){m*=Math.min(1.4,1+.1*rv);why.push(`${rv} revisã${rv>1?'ões vencidas':'o vencida'}`)}
 let last=null;Object.keys(s.days||{}).forEach(k=>{if(s.days[k]>0&&k<=t&&(!last||k>last))last=k});
 if(last){const gap=Math.round((parse(t)-parse(last))/864e5);if(gap>=5){m*=Math.min(1.3,1+.04*(gap-4));why.push(`${gap} dias sem estudar`)}}
 const A=S.subjects.filter(x=>!x.arch&&impOf(x)!==0),rec=x=>{let v=0;for(let i=1;i<=28;i++)v+=(x.days||{})[fmt(addD(now(),-i))]||0;return v},tot=A.reduce((a,x)=>a+rec(x),0);
 if(tot>=120&&A.some(x=>x.id===s.id)){const bw=A.reduce((a,x)=>a+subjFactor(x).w,0)||1,exp=f.w/bw,act=rec(s)/tot,df=Math.max(.85,Math.min(1.4,1+(exp-act)*1.5));
  if(df>=1.08)why.push('defasada nas últimas semanas');else if(df<=.92)why.push('já bem atendida');m*=df}
 m=Math.min(3.5,m);
 if(s.cov!=null){const c=Math.max(.8,Math.min(1.35,1+(50-s.cov)/130));if(c>=1.08)why.push(`só ${s.cov}% do conteúdo visto`);else if(c<=.92)why.push(`${s.cov}% do conteúdo visto`);m*=c}
 if(s.dom!=null){const c=Math.max(.8,Math.min(1.3,1+(3-s.dom)*.15));if(c>1)why.push('domínio baixo');else if(c<1)why.push('domínio alto');m*=c}
 if(s.pw!=null&&s.pw!==1){m*=[.85,1,1.25,1.5][s.pw];if(s.pw>1)why.push('pesa mais na prova');else why.push('pesa menos na prova')}
 return{...f,w:f.w*m,why:why.join(' · '),floor:Math.max(lateMin,pendMin),urgent}}
function prioBadge(s){
 const f=subjFactor(s),d=f.d,im=f.im,near=f.ex&&f.ex.n<=14;
 if(im===0)return`<div class="nt">⚖️ Importância nenhuma — fora do plano semanal sugerido</div>`;
 if(d===2&&im===2&&!near)return'';
 const tags=[d!==2?DIFF[d]:'',im!==2?'importância '+IMP[im].toLowerCase():'',near?`📝 prova ${f.ex.n===0?'hoje':'em '+f.ex.n+' dia'+pl(f.ex.n)}`:''].filter(Boolean).join(' · ');
 const up=d===3||im===3||near,down=!near&&(d===1||im===1)&&d!==3&&im!==3;
 return`<div class="nt">⚖️ ${tags}${up?' — priorize esta matéria':down?' — pode dedicar menos tempo':''}</div>`}

/* ----- Provas e contagem regressiva ----- */
const xn=x=>(x.exam?'📝 ':'')+esc(x.name);
function exams(){const t=fmt(now()),L=[];S.subjects.forEach(s=>(s.topics||[]).forEach(x=>{if(x.exam&&!x.done&&x.date&&x.date>=t)L.push({s,x,n:diff(t,x.date)})}));return L.sort((a,b)=>a.n-b.n||a.x.name.localeCompare(b.x.name))}
let exOpen=false;
document.addEventListener('toggle',e=>{if(e.target.id==='exf')exOpen=e.target.open},true);
function examsHtml(){
 const L=exams(),t=fmt(now());
 const cards=L.map(({s,x,n})=>{const big=n===0?'Hoje':n===1?'Amanhã':n,sm=n>1?'dias restantes':n===0?'é hoje!':'falta 1 dia';
  return`<div class="exc${n<=3?' u3':n<=7?' u7':''}"${n>7?` style="--c:${s.color}"`:''}><div class="exn"><b${n<2?' class="w"':''}>${big}</b><span>${sm}</span></div><div class="exi"><div class="tn">📝 ${esc(x.name)}</div><div class="sub" style="margin:0;font-size:.85rem">${esc(s.name)} · ${parse(x.date).toLocaleDateString('pt-BR',{weekday:'short',day:'numeric',month:'short'})}</div><div class="exa"><button class="ghost" data-a="exdone" data-id="${s.id}" data-tid="${x.id}">Concluir</button><button class="ghost" data-a="exdel" data-id="${s.id}" data-tid="${x.id}" aria-label="Excluir prova">✕</button></div></div></div>`}).join('');
 const A=S.subjects.filter(s=>!s.arch);
 const form=A.length?`<details class="exf" id="exf"${exOpen?' open':''}><summary>➕ Cadastrar prova</summary><div class="gform" style="margin-top:8px"><select id="ex-s" aria-label="Matéria">${A.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select><input type="text" id="ex-n" maxlength="80" placeholder="Nome (ex.: Prova de Matemática)" aria-label="Nome da prova" style="flex:1 1 180px"><input type="date" id="ex-d" min="${t}" aria-label="Data da prova"><button class="btn main" data-a="exadd">Cadastrar</button></div></details>`:'';
 return`<div class="pn"><h3>📝 Provas${L.length?` · contagem regressiva`:''}</h3>${L.length?`<div class="exg">${cards}</div>`:'<p class="sub" style="margin:0 0 6px">Nenhuma prova cadastrada. Cadastre uma e a contagem regressiva aparece aqui.</p>'}${form}</div>`}

/* ----- Revisão espaçada (1, 7 e 30 dias) ----- */
function schedRev(s,x,k){
 S.rev=(S.rev||[]).filter(r=>!(r.tid===x.id&&!r.done));
 [1,7,30].forEach(n=>S.rev.push({id:'r'+Date.now().toString(36)+n+Math.random().toString(36).slice(2,5),sid:s.id,tid:x.id,name:x.name,date:fmt(addD(parse(k),n)),n,done:false}))}
const unsched=x=>{S.rev=(S.rev||[]).filter(r=>!(r.tid===x.id&&!r.done))};
const revValid=r=>S.subjects.some(s=>s.id===r.sid);
const revDue=()=>{const t=fmt(now());return(S.rev||[]).filter(r=>!r.done&&r.date<=t&&revValid(r)).sort((a,b)=>a.date<b.date?-1:1)};
const revN=k=>(S.rev||[]).filter(r=>r.date===k&&!r.done&&revValid(r)).length;
function revItem(r,showDate){
 const s=S.subjects.find(x=>x.id===r.sid);if(!s)return'';
 const late=r.date<fmt(now())?diff(r.date,fmt(now())):0;
 return`<div class="tp rv${r.done?' dn':''}" style="--c:${s.color}"><button class="chk" data-a="rvdone" data-rid="${r.id}" aria-label="${r.done?'Reabrir revisão':'Marcar revisão como feita'}">${r.done?'✓':''}</button><div class="tb"><div class="tn">${esc(r.name)}</div><div class="tm"><span class="sd">${esc(s.name)}</span><span class="est">Revisão de ${r.n} dia${pl(r.n)}${late?` · atrasada ${late} dia${pl(late)}`:''}${showDate?' · '+br(r.date):''}</span></div></div><button class="ghost" data-a="rvdel" data-rid="${r.id}" aria-label="Apagar revisão" title="Não preciso mais revisar">🗑</button></div>`}
function revHtml(always){
 const L=revDue();if(!L.length&&!always)return'';
 return`<div class="pn"><h3>🔁 Revisar hoje${L.length?` (${L.length})`:''}</h3>${L.length?`<div class="tl">${L.map(r=>revItem(r,false)).join('')}</div><p class="sub" style="margin:8px 0 0;font-size:.8rem">Marque ✓ ao revisar ou 🗑 se não precisa mais revisar.</p>`:'<p class="sub" style="margin:0">Nada para revisar hoje. 🎉</p>'}</div>`}
function rvDay(k){const L=(S.rev||[]).filter(r=>r.date===k&&revValid(r));return L.length?`<div class="sr"><h4>🔁 Revisões deste dia</h4><div class="tl">${L.map(r=>revItem(r,false)).join('')}</div></div>`:''}
function renderRvc(){const el=$('#rvc');if(el&&curPage==='relatorio'&&rTab==='cal')el.innerHTML=revHtml(true)}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a^="rv"]');if(!b)return;const a=b.dataset.a,r=(S.rev||[]).find(x=>x.id===b.dataset.rid);if(!r)return;
 if(a==='rvdone'){r.done=!r.done;save();render();if(r.done)toast('Revisão feita. Boa!')}
 else if(a==='rvdel'){S.rev=S.rev.filter(x=>x!==r);save();render();toast('Revisão apagada.')}
});

/* ----- Provas: ações ----- */
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a^="ex"]');if(!b)return;const a=b.dataset.a,s=S.subjects.find(x=>x.id===(b.dataset.id||($('#ex-s')||{}).value));
 if(a==='exadd'){
  const d=$('#ex-d').value;if(!s)return;if(!d){toast('Escolha a data da prova.');return}
  if(d<fmt(now())){toast('A data da prova precisa ser hoje ou depois.');return}
  const n=$('#ex-n').value.trim()||('Prova de '+s.name);
  (s.topics=s.topics||[]).push({id:'t'+Date.now().toString(36),name:n,date:d,prio:'alta',est:0,done:false,doneAt:'',note:'',exam:true});
  exOpen=false;save();render();toast('Prova cadastrada. Contagem regressiva ativada.')}
 else if(a==='exdone'&&s){const x=(s.topics||[]).find(y=>y.id===b.dataset.tid);if(x){setDone(s,x,true);save();render();toast('Prova concluída.')}}
 else if(a==='exdel'&&s){if(confirm('Excluir esta prova?')){s.topics=(s.topics||[]).filter(y=>y.id!==b.dataset.tid);save();render()}}
});


