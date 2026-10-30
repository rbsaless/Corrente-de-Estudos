/* ----- Painel do dia (compartilhado pelas visões mensal e semanal) ----- */
const taskCmp=(a,b)=>(+!!a.x.done-+!!b.x.done)||(a.x.time||'99').localeCompare(b.x.time||'99');
function taskRow(s,x,withDate){
 const t=fmt(now()),late=!x.done&&x.date&&x.date<t;
 return`<div class='tp${x.done?' dn':''}' style='--c:${s.color}'><button class='chk' data-a='ctog' data-id='${s.id}' data-tid='${x.id}' aria-label='${x.done?'Reabrir tarefa':'Concluir tarefa'}'>${x.done?'✓':''}</button><div class='tb'><div class='tn'>${xn(x)}</div><div class='tm'><span class='sd'>${esc(s.name)}</span><span class='est'>${x.time?'🕒 '+x.time+' · ':''}${PR[x.prio]||''}${x.est?' · '+x.est+' min':''}${x.spent?' · ⏱ '+hh(x.spent):''}</span>${late&&withDate?`<span class='lt'>Atrasada · ${br(x.date)}</span>`:''}</div></div></div>`}
function dayTop(){
 const t=fmt(now()),D=allTasks().filter(o=>o.x.date===calSel).sort(taskCmp),dn=D.filter(o=>o.x.done).length;
 const title=parse(calSel).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 const ends=[];S.subjects.forEach(s=>(s.goals||[]).forEach(g=>{if(g.end===calSel){const i=goalInfo(s,g);ends.push(`<p class='sub'>🎯 Termina a meta de ${esc(s.name)}: ${i.c} de ${g.target} dias</p>`)}}));
 const st=S.subjects.filter(s=>calSel in s.days).map(s=>esc(s.name)+(s.days[calSel]?` (${s.days[calSel]} min)`:'')).join(', ');
 const rows=D.map(o=>taskRow(o.s,o.x,false)).join('');
 const A=S.subjects.filter(s=>!s.arch),cs=A.some(s=>s.id===calSub)?calSub:(A[0]||{}).id;
 const form=A.length?`<div class='tform'><select id='cd-s' aria-label='Matéria'>${A.map(s=>`<option value='${s.id}'${s.id===cs?' selected':''}>${esc(s.name)}</option>`).join('')}</select><input type='text' id='cd-n' placeholder='Nova tarefa para este dia' maxlength='80' aria-label='Nova tarefa'><label class='sub' style='display:flex;align-items:center;gap:6px;margin:0'><input type='checkbox' id='cd-d'${calSel<t?' checked':''}> Já concluída</label><label class='sub' style='display:flex;align-items:center;gap:6px;margin:0'><input type='checkbox' id='cd-x'> 📝 Prova</label><button class='btn main' data-a='cadd'>Adicionar</button></div>`:`<p class='sub'>Adicione uma matéria ativa para planejar tarefas nos dias.</p>`;
 return`<div class='dp top'><div class='dpt'><h3>${title}${calSel===t?' (hoje)':''}</h3><div><button class='btn' data-a='dnav' data-v='-1' aria-label='Dia anterior'>‹</button><button class='btn' data-a='dnav' data-v='0'>Hoje</button><button class='btn' data-a='dnav' data-v='1' aria-label='Próximo dia'>›</button></div></div>
 ${D.length?`<p class='sub'>${D.length} tarefa${pl(D.length)}, ${dn} concluída${pl(dn)}</p>`:`<p class='sub'>Nenhuma tarefa neste dia.</p>`}
 ${st?`<p class='sub'>🔥 Estudado: ${st}</p>`:''}${ends.join('')}
 <div class='tl'>${rows}</div>${rvDay(calSel)}${form}</div>`}
let dsOpen=false;
function dayStudy(){
 const t=fmt(now());if(calSel>t||!S.subjects.length)return'';
 const k=calSel,W=wkStudy([k]),ss=W.ss[k]||[],un=W.un[k]||[],tot=allTot(k),pn=plTot(k),mn=stkMin(k);
 wkInfo=wkInfo||{ss:{},un:{}};wkInfo.ss[k]=W.ss[k];wkInfo.un[k]=W.un[k];
 const L=S.subjects.filter(s=>k in s.days),A=S.subjects.filter(s=>!s.arch);
 const sum=`<div class='hsum'><div><b>${tot?hh(tot):'0 min'}</b><span>estudado</span></div><div><b>${hh(pn)}</b><span>planejado</span></div><div><b>${hh(Math.max(0,tot-pn))}</b><span>fora do plano</span></div><div><b>${pn>=mn?'✓ batido':'faltam '+hh(mn-pn)}</b><span>mínimo do dia (${hh(mn)})</span></div></div>`;
 const tl=ss.map((z,i)=>({z,i})).sort((p,q)=>p.z.a-q.z.a).map(({z,i})=>`<button type='button' class='srow dsb' style='--c:${z.s.color}' data-a='wss' data-sid='${z.s.id}' data-k='${k}' data-i='${i}'><span class='dsc'></span><b>${mhm(z.a)}–${mhm(Math.min(z.b,1440))}</b><span class='sd'>${esc(z.s.name)}</span><span class='est'>${hh(Math.round(z.b-z.a))}</span></button>`).join('');
 const cards=L.map(s=>{const m=s.days[k]||0,u=un.find(o=>o.s.id===s.id),n=ss.filter(z=>z.s.id===s.id).length;
  return`<div class='srow' style='--c:${s.color}'><span class='dsc'></span><span class='sd'>${esc(s.name)}${s.arch?' (arquivada)':''}</span><span class='est'>${m?hh(m):'registrado'}${n?' · '+n+' bloco'+pl(n):''}${u&&u.m?' · '+hh(u.m)+' sem horário':''}</span><button class='ghost' data-a='dsdel' data-id='${s.id}'>Desmarcar dia</button></div>`}).join('');
 const form=dsOpen&&A.length?`<div class='srow dsf'><select id='ds-s' aria-label='Matéria'>${A.map(s=>`<option value='${s.id}'>${esc(s.name)}</option>`).join('')}</select><div class='dsq'>${[25,30,45,60,90].map(v=>`<button type='button' class='ghost' data-a='dsq' data-v='${v}'>${v}</button>`).join('')}<input type='number' id='ds-m' min='0' max='1440' placeholder='min' aria-label='Minutos estudados'></div><details class='dsm'><summary>Mais detalhes</summary><label class='est'>Início (opcional) <input type='time' id='ds-h' aria-label='Hora de início (opcional)'></label><input type='text' id='ds-w' maxlength='120' placeholder='O que estudei (opcional)' aria-label='O que estudei'><select id='ds-f' aria-label='Concentração (1 a 5)'>${FOCUS_OPT}</select></details><button class='btn main' data-a='dsreg'>Marcar estudo</button></div>`:'';
 return`<div class='dp bot'><div class='sr'><div class='dpt'><h4 style='margin:0'>Estudo neste dia</h4>${A.length?`<button class='btn${dsOpen?'':' main'}' data-a='dsopen'>${dsOpen?'Fechar':'＋ Registrar estudo'}</button>`:''}</div>${sum}${form}${L.length?`${tl?`<h4>Linha do tempo</h4>${tl}`:''}<h4>Por matéria</h4>${cards}`:`<p class='sub'>Nenhum estudo registrado neste dia.</p>`}</div></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="dsopen"],[data-a="dsq"],[data-a="dsreg"],[data-a="dsdel"]');if(!b)return;const a=b.dataset.a;
 if(a==='dsopen'){dsOpen=!dsOpen;render();return}
 if(a==='dsq'){const i=$('#ds-m');if(i)i.value=b.dataset.v;return}
 if(a==='dsdel'){const s=S.subjects.find(x=>x.id===b.dataset.id);if(!s)return;const m=s.days[calSel]||0,n=SS(s).filter(x=>fmt(x.a)===calSel).length;
  if(!confirm('Desmarcar '+s.name+' em '+br(calSel)+'?\n\nSerão apagados: '+(m?hh(m):'o registro')+', '+n+' bloco'+pl(n)+' com horário e as anotações do dia.\nLazer e Elos já creditados não são desfeitos.'))return;
  clearDay(s,calSel);save();render();toast('Registro de '+br(calSel)+' removido.');return}
 if(a==='dsreg'){if(calSel>fmt(now()))return;const s=S.subjects.find(x=>x.id===($('#ds-s')||{}).value);if(!s)return;
  const mm=parseInt(($('#ds-m')||{}).value)||0,hr=($('#ds-h')||{}).value,er=regDay(s,calSel,mm,hr);if(er){toast(er);return}
  addLog(s,calSel,mm,hr,($('#ds-w')||{}).value,($('#ds-f')||{}).value);(impU(s)?null:lzGain(s,mm,'manual'));dsOpen=false;save();render();toast('Estudo registrado em '+br(calSel)+'. Streak atualizado.')}});

/* ----- Cópia das tarefas na tela principal: hoje + atrasadas, só matérias ativas ----- */
function renderHomeTasks(){
 const el=$('#htk');if(!el)return;
 if(!S.subjects.some(s=>!s.arch)){el.innerHTML='';return}
 const t=fmt(now());
 const L=allTasks().filter(o=>!o.s.arch&&o.x.date&&(o.x.date===t||(o.x.date<t&&!o.x.done)))
  .sort((a,b)=>(+!!a.x.done-+!!b.x.done)||(a.x.date<b.x.date?-1:a.x.date>b.x.date?1:0)||(a.x.time||'99').localeCompare(b.x.time||'99'));
 const pend=L.filter(o=>!o.x.done).length,late=L.filter(o=>!o.x.done&&o.x.date<t).length,V=L.slice(0,5);
 el.innerHTML=`<div class='pn'><div class='dpt'><h3>✅ Tarefas de hoje e atrasadas</h3><button class='btn' data-a='tall'>📅 Abrir calendário</button></div>
 <p class='sub' style='margin:6px 0 0;font-size:.85rem'>${L.length?`${pend} pendente${pl(pend)}${late?` · ${late} atrasada${pl(late)}`:''}`:'Nenhuma tarefa para hoje. Planeje no calendário.'}</p>
 ${V.length?`<div class='tl'>${V.map(o=>taskRow(o.s,o.x,true)).join('')}</div>`:''}
 ${L.length>5?`<button class='btn more' data-a='tall'>Ver todas (${L.length})</button>`:''}</div>`}

/* ----- Estudos realizados para a visão semanal ----- */
let wkInfo={ss:{},un:{}};
function wkStudy(days){
 const ss={},un={};days.forEach(k=>{ss[k]=[];un[k]=[]});
 S.subjects.forEach(s=>{const sm={};
  SS(s).forEach(x=>{
   const put=(a,b)=>{const k=fmt(a);if(!(k in ss))return;const m0=a.getHours()*60+a.getMinutes(),m1=fmt(b)===k?b.getHours()*60+b.getMinutes():1440;
    ss[k].push({s,a:m0,b:Math.max(m1,m0+1),oa:x.a,ob:x.b});sm[k]=(sm[k]||0)+(m1-m0)};
   let c=x.a;while(fmt(c)<fmt(x.b)){const n=new Date(c.getFullYear(),c.getMonth(),c.getDate()+1);put(c,n);c=n}put(c,x.b)});
  days.forEach(k=>{if(!(k in s.days))return;const tot=s.days[k],rest=tot-(sm[k]||0);
   if(rest>=2)un[k].push({s,m:Math.round(rest)});else if(!tot&&!sm[k])un[k].push({s,m:0})})});
 return{ss,un}}
function studyDetail(sid,k,i){
 const s=S.subjects.find(x=>x.id===sid);if(!s)return;let ttl,body;
 if(i==='u'){const u=(wkInfo.un[k]||[]).find(z=>z.s.id===sid),L=(S.log||[]).filter(x=>x.sid===sid&&x.d===k&&x.h==null);
  ttl='Estudo sem horário';
  body=`<p class='sub' style='margin:0'>${esc(s.name)} · ${bd(k)} · ${u&&u.m?hh(u.m):'registrado, sem tempo'}</p><p class='sub' style='margin:0;font-size:.85rem'>Foi registrado sem hora de início, por isso não tem posição na agenda.</p><h3>O que estudei</h3>${L.length?ul(L.map(lgLine)):`<p class='sub' style='margin:0'>Sem anotação para este registro.</p>`}`}
 else{const z=(wkInfo.ss[k]||[])[+i];if(!z)return;const m=(z.ob-z.oa)/6e4,L=(S.log||[]).filter(x=>x.sid===sid&&x.d===fmt(z.oa)&&x.h===z.oa.getHours());
  ttl='⏱ Estudo realizado';
  body=`<p class='sub' style='margin:0'>${esc(s.name)} · ${bd(fmt(z.oa))} · ${hm(z.oa)}–${hm(z.ob)} · ${hh(m)}</p><h3>O que estudei</h3>${L.length?ul(L.map(lgLine)):`<p class='sub' style='margin:0'>Sem anotação do que foi estudado nesta sessão.</p>`}${(()=>{const sx=(s.sessions||[]).find(q=>+new Date(q[0])===+z.oa&&+new Date(q[1])===+z.ob);if(impAt(s,fmt(z.oa))===0)return`<p class='sub' style='margin:8px 0 0'>🚫 Matéria fora do plano neste dia: não planejada.</p>`;if(sx&&sx[2])return`<p class='sub' style='margin:8px 0 0'>🚫 Sessão não planejada.</p>`;return`<p class='sub' style='margin:8px 0 0;font-size:.85rem'>Se foi um estudo fora do plano, você pode marcar. É definitivo: não dá para voltar a planejada.</p><button class='btn' data-mku='${sid}' data-ma='${+z.oa}' data-mb='${+z.ob}'>🚫 Marcar como não planejada</button>`})()}`}
 $('#sBody').style.setProperty('--c',s.color);
 $('#sBody').innerHTML=`<div class='row'><h2 style='margin:0;font-size:1.3rem'>${ttl}</h2></div>${body}<div class='row'><span></span><button class='btn main' data-sd='skip'>Fechar</button></div>`;
 if(!$('#sdlg').open)$('#sdlg').showModal()}
const PR={alta:'Alta',media:'Média',baixa:'Baixa'};
const tsort=(a,b)=>{const x=a.date||'9999',y=b.date||'9999';return x<y?-1:x>y?1:0};
function setDone(s,x,v){
 const t=fmt(now());x.done=v;
 if(v){const k=x.date&&x.date<=t?x.date:t;x.doneAt=k;if(!x.exam){if(!(k in s.days))s.days[k]=x.est||0;schedRev(s,x,k)}}
 else{const k=x.doneAt;x.doneAt='';
  if(!x.exam){unsched(x);if(k&&k in s.days&&s.days[k]===(x.est||0)&&!(s.topics||[]).some(y=>y!==x&&y.done&&y.doneAt===k))delete s.days[k]}}
}
function topicCard(s){const T=s.topics||[];if(!T.length)return'';const p=T.filter(x=>!x.done);
 if(!p.length)return`<div class='nt'>✅ Todos os ${T.length} tópicos concluídos</div>`;
 const n=p.slice().sort(tsort)[0];
 return`<div class='nt'>📚 ${T.length-p.length} de ${T.length} tópicos · próximo: <b>${esc(n.name)}</b>${n.date?' ('+br(n.date)+')':''}</div>`}
function topicsBlock(s){
 const T=s.topics||[],t=fmt(now()),dn=T.filter(x=>x.done).length;
 const left=T.filter(x=>!x.done).reduce((a,x)=>a+(x.est||0),0);
 const lt=left>=60?Math.floor(left/60)+'h'+(left%60?' '+left%60+'min':''):left+' min';
 const at=(x,f)=>`data-f='${f}' data-sid='${s.id}' data-tid='${x.id}'`;
 const rows=T.filter(x=>filt==='all'||(filt==='done')===!!x.done).sort((a,b)=>(+!!a.done-+!!b.done)||tsort(a,b)).map(x=>{
  const late=!x.done&&x.date&&x.date<t,tod=x.date===t;
  return`<div class='tp${x.done?' dn':''}'><button class='chk' data-a='ttog' data-id='${s.id}' data-tid='${x.id}' aria-label='${x.done?'Reabrir tópico':'Concluir tópico'}'>${x.done?'✓':''}</button>
  <div class='tb'><div class='tn'>${xn(x)}</div>
  <div class='tm'><input type='date' class='td${late?' late':tod?' tod':''}' value='${x.date||''}' ${at(x,'date')} aria-label='Dia planejado'>
  <select class='pr ${x.prio}' ${at(x,'prio')} aria-label='Prioridade'>${Object.entries(PR).map(([k,l])=>`<option value='${k}'${x.prio===k?' selected':''}>${l}</option>`).join('')}</select>
  <input type='number' class='td' min='0' max='600' placeholder='min' style='width:78px' value='${x.est||''}' ${at(x,'est')} aria-label='Tempo da tarefa (min)' title='Tempo da tarefa (min)'>${late?'<span class="lt">Atrasado</span>':tod&&!x.done?'<span class="tdy">Hoje</span>':''}</div>
  <details><summary>Anotações${x.note?' •':''}</summary><textarea ${at(x,'note')} placeholder='Resumo, dúvidas, links...'>${esc(x.note||'')}</textarea></details></div>
  <button class='ghost' data-a='tedit' data-id='${s.id}' data-tid='${x.id}' aria-label='Editar tarefa'>✎</button><button class='ghost' data-a='tdel' data-id='${s.id}' data-tid='${x.id}' aria-label='Excluir tópico'>✕</button></div>`}).join('')
  ||`<p class='sub'>${T.length?'Nada neste filtro.':'Nenhum tópico ainda. Liste o que precisa estudar e dê um dia para cada um.'}</p>`;
 return`<div class='tform'><input type='text' id='nt-n' placeholder='Novo tópico (ex.: Present Perfect)' maxlength='80' aria-label='Nome do tópico'><input type='date' id='nt-d' aria-label='Dia planejado'><select id='nt-p' aria-label='Prioridade'><option value='alta'>Alta</option><option value='media' selected>Média</option><option value='baixa'>Baixa</option></select><input type='number' id='nt-e' min='0' max='600' placeholder='min' aria-label='Minutos estimados'><label class='sub' style='display:flex;align-items:center;gap:6px;margin:0'><input type='checkbox' id='nt-x'> 📝 Prova</label><button class='btn main' data-a='tadd' data-id='${s.id}'>Adicionar</button></div>
 ${T.length?`<div class='goal'><p><span><b>${dn} de ${T.length} tópicos concluídos</b></span><span>${left?'~'+lt+' restantes':''}</span></p><div class='bar'><div style='width:${dn/T.length*100}%'></div></div></div>
 <div class='tools2'><div class='seg'>${[['all','Todos'],['todo','Pendentes'],['done','Concluídos']].map(([k,l])=>`<button class='${filt===k?'on':''}' data-a='tfil' data-id='${s.id}' data-v='${k}'>${l}</button>`).join('')}</div><button class='btn' data-a='tspread' data-id='${s.id}'>Distribuir nos dias da meta</button></div>`:''}
 <div class='tl'>${rows}</div>`}
function goalsBlock(s){
 const t=fmt(now());
 const list=(s.goals||[]).slice().sort((a,b)=>a.start<b.start?1:-1).map(g=>{const i=goalInfo(s,g);return`<div class="gi"><div><b>${br(g.start)} a ${br(g.end)}</b> · ${i.c} de ${g.target} dias<div class="bar"><div style="width:${i.pct}%"></div></div><small>${i.msg}</small></div><button class="ghost" data-a="gdel" data-id="${s.id}" data-gid="${g.id}" aria-label="Excluir meta">✕</button></div>`}).join('')||'<p class="sub">Nenhuma meta ainda.</p>';
 return`<div><h3>Metas</h3>${list}<div class="gform">de <input type="date" id="ng-s" value="${t}"> até <input type="date" id="ng-e"> estudar <input type="number" id="ng-t" min="1" max="366" value="5"> dias <button class="btn" data-a="gadd" data-id="${s.id}">Adicionar meta</button></div></div>`}

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2600)}

function render(){
 chEval();cfEval();stkSettle();
 const g=$('#grid');renderHomeTasks();renderCal();renderHist();renderMG();renderLvl();renderPanel();renderRvc();renderFocus();renderRep();renderLazer();renderIdle();renderShop();renderSplit();renderChBar();renderCh();renderContratos();renderFeed();renderDD(); /* ALTERADO v27 */if(snapSync()||rwSync())save();drawTm();const NA=S.subjects.filter(s=>s.arch).length;$('#arq').hidden=!NA;$('#arq').textContent=showArch?'Ocultar arquivadas':`Mostrar arquivadas (${NA})`;const NN=S.subjects.filter(s=>!s.arch&&impOf(s)===0).length;$('#nimp').hidden=!NN;$('#nimp').textContent=showNoImp?'Ocultar sem importância':`Mostrar sem importância (${NN})`;
 const G0=gstreak(),gs=G0.c,ge=$('#gst');ge.classList.toggle('hot',gs>0);ge.innerHTML=`<i>🔥</i><span>${gs} ${gs===1?'dia':'dias'} seguido${gs===1?'':'s'}</span><small>no geral · recorde histórico: ${G0.b} ${G0.b===1?'dia':'dias'} seguido${G0.b===1?'':'s'} · hoje ${stkToday()}</small>`;
 const t=fmt(now());
 {const tm=Math.round(plTot(t)),h=Math.floor(tm/60),m=tm%60;$('#today').innerHTML=`⏱ Hoje: <b>${h}h ${p2(m)}min</b> planejados`}
 const A=S.subjects.filter(s=>!s.arch),doneToday=A.filter(s=>t in s.days).length;
 $('#sum').textContent=S.subjects.length?`${doneToday} de ${A.length} matéria${A.length>1?'s':''} estudada${doneToday===1?'':'s'} hoje. Não quebre a corrente.`:'Cada dia estudado vira um elo. Quanto mais elos seguidos, maior a corrente.';
 if(!S.subjects.length){g.innerHTML='<div class="empty"><b>🔗</b>Nenhuma matéria ainda.<br>Adicione a primeira acima para começar sua corrente.</div>';return}
 const mon=monday(now());
 if(!S.subjects.filter(visSubj).length){g.innerHTML='<div class="empty"><b>🗂️</b>Nenhuma matéria visível com esses filtros.<br>Use os botões acima para mostrar arquivadas ou sem importância.</div>';popId=null;return}
 g.innerHTML=S.subjects.filter(visSubj).map(s=>({s,st:streak(s),a:ago(s)??1e9,b:best(s),w:Math.round(subjFactor(s).w*1000)})).sort((x,y)=>(x.s.arch?1:0)-(y.s.arch?1:0)||y.w-x.w||(y.st>0)-(x.st>0)||(x.st>0?y.st-x.st:x.a-y.a)||y.b-x.b).map(({s,st})=>{
  const bs=best(s),done=t in s.days;
  const chain=DIAS.map((n,i)=>{const d=addD(mon,i),k=fmt(d);return`<div class="link${k in s.days?' on':''}${k===t?' now':''}"><b></b>${n}</div>`}).join('');
  return`<article class="card${st>0?' hot':''}${s.arch?' arq':''}${popId===s.id?' pop':''}" style="--c:${s.color}" data-a="det" data-id="${s.id}">
  <div class="top"><h2>${esc(s.name)}</h2><button class="ghost" data-a="det" data-id="${s.id}">Detalhes</button></div>
  <div class="streak"><div class="num">${st}<i>🔥</i></div><small>${st===1?'dia seguido':'dias seguidos'}<br>recorde: ${bs}<br><b>${agoTxt(s)}</b></small></div>
  <div class="chain" aria-label="Semana atual">${chain}</div>
  ${goalCard(s)}${topicCard(s)}${prioBadge(s)}
  <div class="qt"><input type="text" id="qn-${s.id}" maxlength="80" placeholder="＋ Nova tarefa" aria-label="Nova tarefa de ${esc(s.name)}"><input type="date" id="qd-${s.id}" aria-label="Dia planejado"><input type="number" id="qe-${s.id}" min="0" max="600" placeholder="min" aria-label="Minutos"><button class="btn" data-a="qtadd" data-id="${s.id}">Adicionar</button></div>
  <div class="act">${done?'':`<input type="number" min="0" max="1440" placeholder="min" aria-label="Minutos estudados" id="m-${s.id}"><input type="time" id="h-${s.id}" title="Hora de início (opcional)" aria-label="Hora de início (opcional)">`}
  <button class="done-btn" data-a="do" data-id="${s.id}" ${done?'disabled':''}>${done?'Estudado hoje ✓':'Estudei hoje'}</button></div>
  ${done?'':`<div class="act2"><input type="text" id="w-${s.id}" maxlength="120" placeholder="O que estudei (opcional)" aria-label="O que estudei"><select id="f-${s.id}" aria-label="Concentração (1 a 5)">${FOCUS_OPT}</select></div>`}
  ${done?`<button class="undo" data-a="undo" data-id="${s.id}">Desfazer registro de hoje</button>`:''}
 </article>`}).join('');
 popId=null;
}

document.addEventListener('click',e=>{const b=e.target.closest('[data-a="qtadd"]');if(!b)return;const s=S.subjects.find(x=>x.id===b.dataset.id);if(!s)return;const ne=$('#qn-'+s.id),n=(ne.value||'').trim();if(!n){toast('Digite o nome da tarefa.');ne.focus();return}
 (s.topics=s.topics||[]).push({id:'t'+Date.now().toString(36),name:n,date:$('#qd-'+s.id).value,prio:'media',est:Math.max(0,parseInt($('#qe-'+s.id).value)||0),done:false,doneAt:'',note:''});save();render();toast('Tarefa adicionada em '+s.name+'.')});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&/^qn-/.test(e.target.id)){const b=e.target.closest('.qt').querySelector('[data-a="qtadd"]');if(b)b.click()}});
function mark(id){
 const s=S.subjects.find(x=>x.id===id),k=fmt(now());if(!s||k in s.days)return;
 const m=parseInt(($('#m-'+id)||{}).value)||0;
 const before=streak(s);
 const er=regDay(s,k,m,($('#h-'+id)||{}).value);if(er){toast(er);return}
 addLog(s,k,m,($('#h-'+id)||{}).value,($('#w-'+id)||{}).value,($('#f-'+id)||{}).value);(impU(s)?null:lzGain(s,m,'manual'));
 const after=streak(s);
 save();popId=id;render();
 const hit=MARKS.find(([n])=>n===after);
 toast(hit?`${hit[1]} ${after} dias seguidos em ${s.name}! Novo marco.`:after>before&&after>1?`Corrente de ${after} dias. Continue assim!`:'Primeiro elo da corrente. Bora!');
}

let detId='';function detail(id){detId=id;
 const s=S.subjects.find(x=>x.id===id);if(!s)return;
 const st=streak(s),bs=best(s),total=Object.keys(s.days).length,mins=Object.values(s.days).reduce((a,b)=>a+b,0);
 const t=now(),start=addD(monday(t),-7*19);let heat='';
 for(let i=0;i<20*7;i++){const d=addD(start,i),k=fmt(d);heat+=`<i class="${d>t?'fut':k in s.days?'on':''}" title="${k}"></i>`}
 const cur=monday(t);let bars='',vals=[];
 for(let w=7;w>=0;w--){const ws=addD(cur,-7*w);vals.push([weekCount(s,ws),p2(ws.getDate())+'/'+p2(ws.getMonth()+1)])}
 bars=vals.map(([v,l])=>`<div><span style="height:${v/7*100}%"></span>${v}<small>${l}</small></div>`).join('');
 const bl={};SS(s).forEach(x=>(bl[fmt(x.a)]=bl[fmt(x.a)]||[]).push(x));
 const notes=Object.entries(s.days).sort().reverse().slice(0,30).map(([k,m])=>{const L=(bl[k]||[]).sort((x,y)=>x.a-y.a);return`<li>${bd(k)}${m?` · ${m} min`:''}${L.length?` · ${L.length} bloco${pl(L.length)}: ${L.map(x=>hm(x.a)+'–'+hm(x.b)).join(', ')}`:''}</li>`}).join('');
 $('#dlBody').style.setProperty('--c',s.color);
 $('#dlBody').innerHTML=`<div class="row"><h2 style="margin:0">${esc(s.name)}</h2><button class="ghost" data-a="close">Fechar</button></div>
 <div class='gform'><label>Dificuldade da matéria ${diffSel(s)}</label><label>Importância da matéria ${impSel(s)}</label></div>
 <div class='tabs'>${[['topics','Tópicos'],['prog','Progresso'],['goals','Metas']].map(([k,l])=>`<button class='${tab===k?'on':''}' data-a='tab' data-t='${k}'>${l}</button>`).join('')}</div>
 <div class='pane${tab==='topics'?' on':''}' data-p='topics'>${topicsBlock(s)}</div>
 <div class='pane${tab==='prog'?' on':''}' data-p='prog'><div class='stats'><div><b>${st}</b><span>streak atual</span></div><div><b>${bs}</b><span>melhor streak</span></div><div><b>${total}</b><span>dias estudados${mins?` · ${mins} min`:''}</span></div></div>
 <div><h3>Registrar estudo de um dia anterior</h3><div class='gform'><input type='date' id='pd-d' max='${fmt(now())}' value='${fmt(addD(now(),-1))}' aria-label='Dia'><input type='number' id='pd-m' min='0' max='1440' placeholder='min' aria-label='Minutos'><label>Início (opcional) <input type='time' id='pd-h' aria-label='Hora de início (opcional)'></label><input type='text' id='pd-w' maxlength='120' placeholder='O que estudei (opcional)' aria-label='O que estudei'><select id='pd-f' aria-label='Concentração (1 a 5)'>${FOCUS_OPT}</select><button class='btn' data-a='pday' data-id='${s.id}'>Registrar</button></div></div>
 <div><h3>Últimas 20 semanas</h3><div class="scroll"><div class="heat">${heat}</div></div></div>
 <div><h3>Dias estudados por semana</h3><div class="bars">${bars}</div></div>
 <div><h3>Conquistas</h3><div class="badges">${MARKS.map(([n,e])=>`<span class="badge${bs>=n?' got':''}">${e} ${n} dias</span>`).join('')}</div></div>
 ${notes?`<div><h3>Histórico recente</h3><ul class="notes">${notes}</ul></div>`:''}
 </div>
 <div class='pane${tab==='goals'?' on':''}' data-p='goals'>${goalsBlock(s)}</div>
 <div class='row'><span></span>
 <span><button class="btn" data-a="ren" data-id="${s.id}">Renomear</button> <button class="btn" data-a="arq" data-id="${s.id}">${s.arch?'Desarquivar':'Arquivar'}</button> <button class="btn danger" data-a="del" data-id="${s.id}">Excluir</button></span></div>`;
 if(!$('#dlg').open)$('#dlg').showModal();
 
}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a]');if(!b)return;
 if(b.dataset.a==='det'&&e.target.closest('input,select'))return;
 const id=b.dataset.id,a=b.dataset.a,s=S.subjects.find(x=>x.id===id);
 if(a==='do')mark(id);
 else if(a==='tplay'||a==='tplay0'){tmSel=$('#tm-s').value;if(a==='tplay0'||S.tmPref==='none')tStart(tmSel,'');else askTask(tmSel)}
 else if(a==='tpref'){delete S.tmPref;save();drawTm();toast('O app vai perguntar a tarefa ao iniciar.')}
 else if(a==='tpause')tpause();
 else if(a==='tnext'){const B=S.brk;if(B&&S.subjects.some(x=>x.id===B.sid)){tmSel=B.sid;tStart(B.sid,B.tid&&(S.subjects.find(x=>x.id===B.sid).topics||[]).some(x=>x.id===B.tid)?B.tid:'')}}
 else if(a==='tskip'){S.brk=null;save();drawTm()}
 else if(a==='rd')recDet(b.dataset.k);
 else if(a==='rback')records();
 else if(a==='arq'){s.arch=!s.arch;save();$('#dlg').close();render();toast(s.arch?'Matéria arquivada.':'Matéria desarquivada.')}
 else if(a==='undo'){clearDay(s,fmt(now()));save();render()}
 else if(a==='det'){tab='topics';filt='all';detail(id)}
 else if(a==='close')$('#dlg').close();
 else if(a==='tab'){tab=b.dataset.t;document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===tab));document.querySelectorAll('.pane').forEach(x=>x.classList.toggle('on',x.dataset.p===tab))}
 else if(a==='tfil'){filt=b.dataset.v;detail(id)}
 else if(a==='cday'){calSel=b.dataset.k;calM=calSel.slice(0,7);renderCal()}
 else if(a==='mday'){if(calSel>fmt(now()))return;const mm=parseInt(($('#dm-'+id)||{}).value)||0,er=regDay(s,calSel,mm,($('#dh-'+id)||{}).value);if(er){toast(er);return}addLog(s,calSel,mm,($('#dh-'+id)||{}).value,($('#dw-'+id)||{}).value,($('#df-'+id)||{}).value);(impU(s)?null:lzGain(s,mm,'manual'));save();render();toast('Estudo registrado em '+br(calSel)+'. Streak atualizado.')}
 else if(a==='dday'){clearDay(s,calSel);save();render();toast('Registro de '+br(calSel)+' removido.')}
 else if(a==='pday'){const d=$('#pd-d').value;if(!d||d>fmt(now())){toast('Escolha um dia até hoje.');return}const mm=parseInt($('#pd-m').value)||0,er=regDay(s,d,mm,$('#pd-h').value);if(er){toast(er);return}addLog(s,d,mm,$('#pd-h').value,$('#pd-w').value,$('#pd-f').value);(impU(s)?null:lzGain(s,mm,'manual'));save();render();detail(id);toast('Estudo registrado em '+br(d)+'. Streak atualizado.')}
 else if(a==='cnav'){const v=+b.dataset.v,tm=fmt(now()).slice(0,7);
  if(v===0){calM=tm;calSel=fmt(now())}
  else{const [y,m]=calM.split('-').map(Number),nd=new Date(y,m-1+v,1,12);calM=fmt(nd).slice(0,7);calSel=calM===tm?fmt(now()):calM+'-01'}
  renderCal()}
 else if(a==='ctog'){const x=(s.topics||[]).find(y=>y.id===b.dataset.tid);if(!x)return;setDone(s,x,!x.done);save();render();if(x.done)toast('Tarefa concluída. Bom trabalho!')}
 else if(a==='cadd'){const n=$('#cd-n').value.trim(),sid=$('#cd-s').value,cs=S.subjects.find(x=>x.id===sid);calSub=sid;
  if(!n){toast('Digite o nome da tarefa.');$('#cd-n').focus();return}
  const dd=$('#cd-d').checked,ex=$('#cd-x').checked;(cs.topics=cs.topics||[]).push({id:'t'+Date.now().toString(36),name:n,date:calSel,prio:ex?'alta':'media',est:0,done:false,doneAt:'',note:'',exam:ex||undefined});if(dd)setDone(cs,cs.topics[cs.topics.length-1],true);
  save();render();$('#cd-n').focus()}
 else if(a==='tadd'){const n=$('#nt-n').value.trim();if(!n){toast('Digite o nome do tópico.');$('#nt-n').focus();return}
  const ex=$('#nt-x').checked;if(ex&&!$('#nt-d').value){toast('Escolha o dia da prova.');return}
  (s.topics=s.topics||[]).push({id:'t'+Date.now().toString(36),name:n,date:$('#nt-d').value,prio:$('#nt-p').value,est:parseInt($('#nt-e').value)||0,done:false,note:'',exam:ex||undefined});
  save();render();detail(id);$('#nt-n').focus()}
 else if(a==='ttog'){const x=(s.topics||[]).find(y=>y.id===b.dataset.tid);if(!x)return;setDone(s,x,!x.done);save();render();detail(id);
  if(x.done)toast(s.topics.every(y=>y.done)?'🎉 Todos os tópicos de '+s.name+' concluídos!':'Tópico concluído. Bom trabalho!')}
 else if(a==='tdel'){s.topics=(s.topics||[]).filter(y=>y.id!==b.dataset.tid);save();render();detail(id)}
 else if(a==='tspread'){const g=pickGoal(s),t=fmt(now());
  if(!g||g.end<t){toast('Crie uma meta com prazo futuro para distribuir os tópicos.');return}
  const p=(s.topics||[]).filter(x=>!x.done&&!x.date);if(!p.length){toast('Nenhum tópico pendente sem data.');return}
  const a0=g.start>t?g.start:t,n=diff(a0,g.end)+1;p.forEach((x,i)=>x.date=fmt(addD(parse(a0),Math.floor(i*n/p.length))));
  save();render();detail(id);toast('Datas distribuídas dentro da meta.')}
 else if(a==='gadd'){const r=mkGoal($('#ng-s').value,$('#ng-e').value,$('#ng-t').value);if(r.err){toast(r.err);return}(s.goals=s.goals||[]).push(r.g);save();render();detail(id);toast('Meta adicionada.')}
 else if(a==='gdel'){s.goals=(s.goals||[]).filter(g=>g.id!==b.dataset.gid);save();render();detail(id)}
 else if(a==='ren'){const n=prompt('Novo nome da matéria:',s.name);if(n&&n.trim()){s.name=n.trim().slice(0,40);save();render();detail(id)}}
 else if(a==='del'){if(confirm(`Excluir "${s.name}" e todo o histórico?`)){S.subjects=S.subjects.filter(x=>x.id!==id);save();$('#dlg').close();render()}}
});
$('#dlg').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close()});

$('#sw').innerHTML=COLORS.map((c,i)=>`<label><input type="radio" name="col" value="${c}" ${i?'':'checked'}><span style="--c:${c}"></span></label>`).join('');
$('#sw').addEventListener('change',e=>sel=e.target.value);
function add(){
 const n=$('#name').value.trim();if(!n){toast('Digite o nome da matéria.');$('#name').focus();return}
 
 
 S.subjects.push({id:'s'+Date.now().toString(36),name:n,color:sel,goals:[],days:{}});
 $('#name').value='';save();render();
}
$('#addBtn').onclick=add;
$('#name').addEventListener('keydown',e=>{if(e.key==='Enter')add()});

$('#exp').onclick=()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=`backup-corrente-${fmt(now())}.json`;a.click();URL.revokeObjectURL(url);
 toast('Backup baixado. Guarde o arquivo.');
};
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=e=>{
 const f=e.target.files[0];if(!f)return;
 const r=new FileReader();
 r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.subjects))throw 0;
  if(confirm('Importar vai substituir os dados atuais. Continuar?')){S=d;migrate();save();render();toast('Backup restaurado.')}}
  catch(x){toast('Arquivo inválido. Escolha um backup .json deste app.')}};
 r.readAsText(f);e.target.value='';
};
$('#theme').onclick=()=>{
 const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
 r.dataset.theme=dark?'light':'dark';
};
document.addEventListener('change',e=>{const el=e.target,f=el.dataset.f;if(!f)return;
 const s=S.subjects.find(x=>x.id===el.dataset.sid),x=s&&(s.topics||[]).find(y=>y.id===el.dataset.tid);if(!x)return;
 if(f==='est'){x.est=Math.max(0,Math.min(600,parseInt(el.value)||0));if(x.dur&&x.est>0)x.dur=Math.max(SNAP,x.est)}else x[f]=el.value;save();if(f!=='note'){render();detail(s.id)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&/^(nt-n|cd-n)$/.test(e.target.id))e.target.closest('.tform').querySelector('[data-a=tadd],[data-a=cadd]').click()});
function tkName(T){const s=S.subjects.find(x=>x.id===T.sid),x=s&&(s.topics||[]).find(y=>y.id===T.tid);return x?`<span class="sub" style="margin:0">📌 ${esc(x.name)}</span>`:''}
const TECH={none:{n:'Sem técnica',d:'Cronômetro livre'},pom:{n:'Pomodoro',f:25,b:5,i:'🍅'},d52:{n:'52/17',f:52,b:17,i:'⏳'},d90:{n:'Método 90/20',f:90,b:20,i:'🧠'}};
const techId=()=>TECH[S.tmTech]?S.tmTech:'none';
function techOpts(){return Object.entries(TECH).map(([k,v])=>`<option value="${k}"${k===techId()?' selected':''}>${v.f?v.i+' '+v.n+' ('+v.f+'/'+v.b+')':'⏱ '+v.n}</option>`).join('')}
function beep(){try{const C=window.AudioContext||window.webkitAudioContext,c=new C();[0,.25,.5].forEach(t=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=880;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.2,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.2);o.start(c.currentTime+t);o.stop(c.currentTime+t+.2)})}catch(e){}}
function notify(t){beep();toast(t);try{if('Notification' in window&&Notification.permission==='granted')new Notification('Corrente de Estudos',{body:t})}catch(e){}}
function tStart(sid,tid){
 idStudy();
 const s=S.subjects.find(x=>x.id===sid),tk=tid&&s&&(s.topics||[]).find(x=>x.id===tid);
 const th=TECH[techId()],tech=th.f?{id:techId(),f:th.f,b:th.b}:null,unp=!!tpUnp||impU(s||{});tpUnp=null;
 const plannedMin=tech?tech.f:(tk?(tk.dur||tk.est||45):45);
 S.brk=null;
 S.timer={sid,start:Date.now(),tid:tid||'',allOrNothing:!!(S.cf&&S.cf.allOrNothing),plannedMin};
 if(tech)S.timer.tech=tech;if(unp)S.timer.unp=1;
 if(tech)try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(e){}
 save();drawTm();
}
let tpSid=null;
function askTask(sid){
 const s=S.subjects.find(x=>x.id===sid);if(!s)return;const t=fmt(now());tpSid=sid;tpUnp=null;
 const L=(s.topics||[]).filter(x=>!x.done&&!x.exam&&x.date&&x.date<=t).sort((a,b)=>(+(a.date<t)-+(b.date<t))||a.date.localeCompare(b.date)||(a.time||'99').localeCompare(b.time||'99'));
 $('#sBody').style.setProperty('--c',s.color);
 $('#sBody').innerHTML=`<div class="row"><h2 style="margin:0;font-size:1.3rem">Iniciar ${esc(s.name)}</h2></div><p class="sub" style="margin:0">Estudar com qual tarefa?</p>
 ${L.length?`<div class="tl">${L.map(x=>`<button class="btn" style="text-align:left" data-tp="${x.id}">${xn(x)}<small style="display:block;color:var(--muted)">${x.date<t?'Atrasada · '+br(x.date):'Hoje'}${x.est?' · '+x.est+' min':''}</small></button>`).join('')}</div>`:`<p class="sub" style="margin:0">Nenhuma tarefa de hoje ou atrasada nesta matéria.</p>`}
 <label>Ou crie uma nova<input type="text" id="tp-n" maxlength="80" placeholder="Título da tarefa"></label><button class="btn main" data-tp="new">➕ Criar e iniciar</button>
 <button class="btn" data-tp="none">Iniciar sem tarefa</button>
 <label style="flex-direction:row;align-items:center;gap:8px;font-size:.9rem"><input type="checkbox" id="tp-u" style="width:auto"> Não planejada (só entra no total: sem streak, XP, lazer nem desafios; conta como ocioso)${impU(s)?'<br><small>Esta matéria está fora do plano e conta como não planejada de qualquer forma.</small>':''}</label>
 <div class="tech" role="radiogroup" aria-label="Técnica de estudo"><span class="sub" style="margin:0">Técnica de estudo</span><div class="tq">${Object.entries(TECH).map(([k,v])=>`<label><input type="radio" name="tp-tech" value="${k}"${k===techId()?' checked':''}>${v.f?v.i+' '+v.n:'⏱ '+v.n}<small>${v.f?v.f+' min foco · '+v.b+' min pausa':v.d}</small></label>`).join('')}</div></div>
 <label style="flex-direction:row;align-items:center;gap:8px;font-size:.9rem"><input type="checkbox" id="tp-r" style="width:auto"> Lembrar: ao escolher “sem tarefa”, não perguntar mais</label>`;
 $('#sdlg').showModal()}
$('#sdlg').addEventListener('change',e=>{if(e.target.name==='tp-tech'){S.tmTech=e.target.value;save();drawTm()}if(e.target.id==='tp-u')tpUnp=e.target.checked;});
$('#sdlg').addEventListener('click',e=>{const b=e.target.closest('[data-tp]');if(!b||!tpSid)return;
 const sid=tpSid,s=S.subjects.find(x=>x.id===sid);if(!s)return;let id=b.dataset.tp;
 if(id==='new'){const n=$('#tp-n').value.trim();if(!n){toast('Digite o título da tarefa.');return}id='t'+Date.now().toString(36);(s.topics=s.topics||[]).push({id,name:n.slice(0,80),date:fmt(now()),prio:'media',est:0,dur:0,done:false,doneAt:'',note:''})}
 if(id==='none'&&$('#tp-r').checked)S.tmPref='none';
 tpSid=null;$('#sdlg').close();tStart(sid,id==='none'?'':id);render()});
$('#sdlg').addEventListener('click',e=>{const b=e.target.closest('[data-sd]');if(!b||!sPend||!sPend.tid)return;
 const s=S.subjects.find(x=>x.id===sPend.sid),x=s&&(s.topics||[]).find(y=>y.id===sPend.tid),c=$('#sess-c');sPend.tid='';
 if(x&&c&&c.value==='1'&&!x.done){x.done=true;x.doneAt=fmt(now());if(!x.exam)schedRev(s,x,x.doneAt);save();render();toast('Tarefa concluída. ✅')}});
function drawTm(){const el=$('#tm'),T=S.timer,A=S.subjects.filter(s=>!s.arch);
 if(!A.length){el.hidden=true;return}el.hidden=false;
 el.innerHTML=`<span aria-hidden="true">⏱</span><select id="tm-s" aria-label="Matéria do cronômetro"${T?' disabled':''}>${A.map(s=>`<option value="${s.id}"${s.id===(T?T.sid:tmSel)?' selected':''}>${esc(s.name)}</option>`).join('')}</select><span class="clk" id="clk">${clk()}</span>${T&&T.tid?tkName(T):''}${T&&T.unp?'<span class="tbadge">🚫 Fora do plano: conta como ocioso</span>':''}${T&&T.tech?`<span class="tbadge">${TECH[T.tech.id].i} ${TECH[T.tech.id].n} ${T.tech.f}/${T.tech.b} · <span class="tbrk" id="trem">${remTxt()}</span></span>`:''}${!T&&S.brk?`<span class="tbadge" id="tbrkw">${brkHtml()}</span><button class="btn main" data-a="tnext">▶ Próximo bloco</button><button class="ghost" data-a="tskip">Pular pausa</button>`:''}${!T?`<select id="tm-tech" aria-label="Técnica de estudo" title="Técnica de estudo">${techOpts()}</select>`:''}${T?'<button class="btn main" data-a="tpause">⏸ Pausar e salvar</button>':`<button class="btn main" data-a="tplay">▶ ${tmLast?'Retomar (novo bloco)':'Iniciar'}</button>${S.tmPref==='none'?'<button class="ghost" data-a="tpref">Perguntar a tarefa</button>':'<button class="ghost" data-a="tplay0" title="Iniciar sem escolher tarefa">⚡ Sem tarefa</button>'} <label style="display:inline-flex;align-items:center;gap:6px;font-size:.85rem;cursor:pointer;color:var(--muted)" title="Exige cumprir 80% da meta de tempo para evitar perda de lazer"><input type="checkbox" id="tm-ton" ${S.cf&&S.cf.allOrNothing?'checked':''}> ⚡ Tudo ou Nada</label>`}`}
const clk=()=>{const t=S.timer?Math.floor((Date.now()-S.timer.start)/1e3):tmLast;return p2(Math.floor(t/3600))+':'+p2(Math.floor(t%3600/60))+':'+p2(t%60)};
setInterval(()=>{const c=$('#clk');if(c)c.textContent=clk()},500);
$('#tm').addEventListener('change',e=>{if(e.target.id==='tm-s')tmSel=e.target.value;if(e.target.id==='tm-tech'){S.tmTech=e.target.value;save()}});
const mmss=ms=>{const t=Math.max(0,Math.ceil(ms/1e3));return p2(Math.floor(t/60))+':'+p2(t%60)};
function remTxt(){const T=S.timer;return T&&T.tech?'restam '+mmss(T.start+T.tech.f*6e4-Date.now()):''}
function brkHtml(){const B=S.brk;if(!B)return'';const r=B.end-Date.now();return r>0?'☕ Pausa: <span class="tbrk">'+mmss(r)+'</span>':'✅ Pausa concluída'}
function techTick(){
 const T=S.timer,B=S.brk,r=$('#trem');if(r&&T)r.textContent=remTxt();
 if(T&&T.tech){const endAt=T.start+T.tech.f*6e4;
  if(Date.now()>=endAt){const th=T.tech,sid=T.sid,tid=T.tid,bEnd=endAt+th.b*6e4;
   S.brk={end:bEnd,sid,tid,tech:th.id,notified:bEnd<Date.now()-6e4};
   notify(`${TECH[th.id].i} Foco concluído (${th.f} min)! Hora da pausa de ${th.b} min.`);
   tpause(endAt);drawTm();return}}
 if(!T&&B){const w=$('#tbrkw');if(w)w.innerHTML=brkHtml();
  if(!B.notified&&Date.now()>=B.end){B.notified=true;save();notify('☕ Pausa terminou! Pronto para o próximo bloco?')}}
}
setInterval(techTick,1000);setTimeout(techTick,300);
document.addEventListener('change',e=>{
 if(e.target.id==='tm-ton'){S.cf=cfCfg();S.cf.allOrNothing=e.target.checked;save();render();toast(S.cf.allOrNothing?'Modo Tudo ou Nada ativado no cronômetro ⚡':'Modo Tudo ou Nada desativado.')}
});

function tpause(endAt){const u=S.timer&&S.timer.unp,r=tpause0(endAt);if(u)idTick(true);else idSet(endAt||Date.now());return r}
function tpause0(endAt){const T=S.timer,s=S.subjects.find(x=>x.id===T.sid),e=endAt||Date.now(),a=new Date(T.start),b=new Date(e);S.timer=null;
 if(s){(s.sessions=s.sessions||[]).push([iso(a),iso(b),T.unp?1:0,Date.now()]);const add=(d,m)=>{s.days[fmt(d)]=(s.days[fmt(d)]||0)+Math.round(m);if(T.unp){s.du=s.du||{};s.du[fmt(d)]=(s.du[fmt(d)]||0)+Math.round(m)}};let c=a;
  while(fmt(c)<fmt(b)){const n=new Date(c.getFullYear(),c.getMonth(),c.getDate()+1);add(c,(n-c)/6e4);c=n}add(c,(b-c)/6e4)}
 const tk=T.tid&&s&&(s.topics||[]).find(x=>x.id===T.tid);if(tk)tk.spent=(tk.spent||0)+Math.max(1,Math.round((e-T.start)/6e4));
 const cid=(s&&!T.unp)?lzGain(s,(e-T.start)/6e4,'timer',!!(T.tech&&(e-T.start)>=T.tech.f*6e4-2000)):null;
 tmLast=Math.floor((e-T.start)/1e3);S.nt=(S.nt||0)+1;
if(T.allOrNothing&&T.plannedMin>0){
 const elapsedMin=(e-T.start)/6e4;
 if(elapsedMin<0.8*T.plannedMin){
  const pen=cfCfg().tonPen;
  lzCfg().led.push({id:lzId(),t:Date.now(),type:'pun',min:-pen,owe:0,note:`Interrupção Tudo ou Nada (${hh(elapsedMin)} de ${hh(T.plannedMin)})`});
  toast(`⚠️ Tudo ou Nada: sessão encerrada em ${hh(elapsedMin)} (<80% de ${hh(T.plannedMin)}). Penalidade de ${pen} min de lazer descontada!`);
 }else{
  const rw=Math.round(elapsedMin*cfCfg().tonRew/100*100)/100;
  if(rw>0&&lzCfg().on&&!T.unp)lzCfg().led.push({id:lzId(),t:Date.now(),type:'ton',min:rw,note:`🎯 Prêmio Tudo ou Nada (${hh(elapsedMin)} de ${hh(T.plannedMin)})`});
  toast(`🎯 Modo Tudo ou Nada cumprido com sucesso! (${hh(elapsedMin)} de ${hh(T.plannedMin)})${rw>0?' Prêmio: +'+rw.toFixed(1).replace('.',',')+' min de lazer.':''}`);
 }
}
if(S.cf)S.cf.allOrNothing=false;
save();render();toast('Bloco salvo: '+clk());if(s)askSession(s,a,(e-T.start)/6e4,T.tid,cid,T.unp)}
$('#arq').onclick=()=>{showArch=!showArch;render()};
$('#nimp').onclick=()=>{showNoImp=!showNoImp;render()};
const ul=a=>'<ul class="notes" style="max-height:none">'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
const UF={yh:hh,yd:v=>v+' dias',ya:v=>hh(v)+'/dia',ys:v=>v+' dias',ym:hh,yb:hh,yk:v=>v+' blocos',gstreak:v=>v+' dias',streak:v=>v+' dias',day:hh,focus:hh,week:v=>hh(v)+'/dia',month:v=>hh(v)+'/dia',pol:v=>v+' matérias',iron:v=>v+' dias',tot:hh};
function recDet(k){const o=S.rec[k],T={yh:'Ano mais estudado',yd:'Ano com mais dias estudados',ya:'Maior média diária do ano',ys:'Maior streak dentro de um ano',ym:'Matéria do ano',yb:'Melhor mês de um ano',yk:'Ano com mais blocos',gstreak:'Streak geral',streak:'Maior streak',day:'Maratona',focus:'Foco absoluto',week:'Maior média semanal',month:'Maior média mensal',pol:'Polímata',iron:'Hábito de ferro',tot:'Tempo total acumulado'},h=o.hist||[],v=h.map(x=>x[0]).concat(o.v);
 $('#dlBody').innerHTML=`<div class="row"><h2 style="margin:0">🏆 ${T[k]}: ${UF[k](o.v)}</h2><span><button class="btn" data-a="rback">← Voltar</button> <button class="ghost" data-a="close">Fechar</button></span></div>${o.h||'<p class="sub">Sem detalhes para este recorde.</p>'}${RK[k]||''}${h.length?`<div><h3>Histórico de recordes</h3>${ul(h.map((x,i)=>`${bd(x[1])}: ${UF[k](v[i])} → ${UF[k](v[i+1])}`).reverse())}</div>`:''}`}
function records(q){
 const D={},ev=[],hr={},grp={},first={};let tot=0,bs=[0,''],fav=[0,''],tp=0;
 S.subjects.forEach(s=>{const b=best(s);if(b>bs[0])bs=[b,s.name];let m=0;
  for(const[k,v]of Object.entries(s.days)){(D[k]=D[k]||{m:0,n:new Set()}).m+=v;D[k].n.add(s.id);m+=v}
  tot+=m;if(m>fav[0])fav=[m,s.name];tp+=(s.topics||[]).filter(x=>x.done).length;ev.push(...SS(s))});
 const ks=Object.keys(D).sort();if(!ks.length){if(!q)toast('Registre estudos para ver os recordes.');return}
 const mx=(f,a)=>a.reduce((r,k)=>f(k)>f(r)?k:r,a[0]),W={},M={};
 ks.forEach(k=>{const w=fmt(monday(parse(k))),o=k.slice(0,7);W[w]=(W[w]||0)+D[k].m;M[o]=(M[o]||0)+D[k].m});
 const bw=mx(k=>W[k],Object.keys(W)),bm=mx(k=>M[k],Object.keys(M)),day=mx(k=>D[k].m,ks),pol=mx(k=>D[k].n.size,ks),dim=o=>new Date(+o.slice(0,4),+o.slice(5),0).getDate();
 const fw=ks.filter(k=>parse(k).getDay()===6&&D[fmt(addD(parse(k),1))]).length;
 let top=null;const early=new Set(),night=new Set();
 ev.forEach(x=>{const k=fmt(x.a),h=x.a.getHours();if(!top||mins(x)>mins(top))top=x;if(h>=4&&h<6)early.add(k);if(h<4)night.add(k);
  (hr[h]=hr[h]||new Set()).add(k);if(!first[k]||x.a<first[k])first[k]=x.a;
  const g=x.s.id+k,o=grp[g]=grp[g]||{n:0,m:0,a:x.a,b:x.b};o.n++;o.m+=mins(x);if(x.a<o.a)o.a=x.a;if(x.b>o.b)o.b=x.b});
 let iron=0,ih=0,ie='';Object.entries(hr).forEach(([h,set])=>{let r=0,p=null;[...set].sort().forEach(k=>{r=p&&diff(p,k)===1?r+1:1;p=k;if(r>iron){iron=r;ih=h;ie=k}})});
 const G=Object.values(grp),pz=G.filter(o=>o.n>1),gap=pz.reduce((a,o)=>a+(o.b-o.a)/6e4-o.m,0),evm=ev.reduce((a,x)=>a+mins(x),0);
 const volta=Object.keys(first).some(k=>first[k].getHours()>=20&&D[k]&&D[k].m>=60);
 const C=(v,l,k)=>`<div${k?` data-a="rd" data-k="${k}" style="cursor:pointer" role="button"`:''}><b>${v}</b><small>${l}${k?' ›':''}</small></div>`;
 const wdc={},mdc={},tr={},pom={},U=u=>x=>Math.floor(x).toLocaleString('pt-BR')+(u?' '+u:''),H=x=>x>=60?Math.floor(x/60).toLocaleString('pt-BR')+' h':Math.floor(x)+' min',nm=(o,f)=>Object.keys(o).filter(f).length;
 ks.forEach(k=>{const w=fmt(monday(parse(k))),o=k.slice(0,7);wdc[w]=(wdc[w]||0)+1;mdc[o]=(mdc[o]||0)+1});
 ev.forEach(x=>{const k=fmt(x.a),h=x.a.getHours(),m=mins(x);(tr[k]=tr[k]||new Set()).add(h<12?0:h<18?1:2);if(m>=25&&m<=35)pom[k]=(pom[k]||0)+1});
 const ld=(a,...r)=>{const o=[a];let x=a;for(const[m,st]of r)while(x+st<=m){x+=st;o.push(x)}return o},hrs=(a,b)=>Array.from({length:b-a+1},(_,i)=>(a+i)*60),LD=ld(1,[10,1],[50,5],[100,10],[250,25],[500,50],[1000,100]),NT=[1].concat(ld(5,[100,5],[200,10],[500,25],[1000,50]));
const yl=y=>+y%4===0&&(+y%100!==0||+y%400===0)?366:365,YR=[...new Set(ks.map(k=>k.slice(0,4)))].sort(),YM={},YD={},YB={},YL={},YS={},YMo={},curY=fmt(now()).slice(0,4);
 ks.forEach(k=>{const y=k.slice(0,4);YM[y]=(YM[y]||0)+D[k].m;YD[y]=(YD[y]||0)+1});
 ev.forEach(x=>{const y=fmt(x.a).slice(0,4);YB[y]=(YB[y]||0)+1});
 YR.forEach(y=>{YL[y]=y===curY?diff(y+'-01-01',fmt(now()))+1:yl(y)});
 Object.keys(M).forEach(o=>{const y=o.slice(0,4);if(!YMo[y]||M[o]>YMo[y][0])YMo[y]=[M[o],o]});
 {let c=0,st='',p=null;const fl=()=>{if(!p)return;for(let y=+st.slice(0,4);y<=+p.slice(0,4);y++){const a=st>y+'-01-01'?st:y+'-01-01',b=p<y+'-12-31'?p:y+'-12-31',n=diff(a,b)+1;if(!YS[y]||n>YS[y][0])YS[y]=[n,a,b]}};
  ks.forEach(k=>{if(p&&diff(p,k)===1)c++;else{fl();c=1;st=k}p=k});fl()}
 const YP=S.subjects.flatMap(s=>YR.map(y=>[s.name,y,Object.entries(s.days).filter(([k])=>k.startsWith(y)).reduce((a,[,v])=>a+v,0)])).filter(x=>x[2]>0);
 const CAT=[['✅','Tópicos concluídos',tp,[1,5,10,25,50,100,250,500,1000],U('')],['⏳','Horas acumuladas',tot/60,ld(1,[10,1],[50,5],[100,10],[250,25],[500,50],[1000,100],[2000,250],[5000,500],[20000,100]),U('h')],
 ['🔥','Streak',bs[0],[3,7,14,30,45,60,75,90,100,120,150,180,200,250,300,365,400,500,600,700,800,900,1000],U('dias')],['📅','Dias estudados',ks.length,[1,3,7].concat(ld(10,[100,5],[200,25],[500,50],[1000,100],[2000,250],[5000,500])),U('dias')],
 ['🧱','Blocos registrados',ev.length,[1,5].concat(ld(10,[100,10],[500,50],[1000,100],[5000,500],[10000,1000],[50000,10000])),U('blocos')],['⏱','Cronometrista (blocos pelo cronômetro)',S.nt||0,[1,5].concat(ld(10,[100,10],[500,50],[1000,100],[2000,250],[5000,500],[10000,1000])),U('blocos')],
 ['🧲','Hábito de Ferro (mesmo horário)',iron,ld(3,[10,1],[30,5],[100,10],[200,25],[500,50],[1000,100],[2000,250],[5000,500]),U('dias')],['🎭','Polímata (matérias no dia)',D[pol].n.size,ld(3,[10,1],[50,5]),U('matérias')],
 ['🏃','Maratona (tempo num dia)',D[day].m,hrs(1,24),H],['🎯','Foco absoluto (bloco contínuo)',top?mins(top):0,[30].concat(hrs(1,24)),H],
 ['📈','Média diária numa semana',W[bw]/7,[30].concat(hrs(1,24)),H],['🌅','Madrugador (início 4h–6h)',early.size,NT,U('dias')],['🦉','Coruja (início 0h–4h)',night.size,NT,U('dias')],
 ['🗓','Semana cheia (7 de 7 dias)',nm(wdc,w=>wdc[w]===7),LD,U('semanas')],['🌕','Mês perfeito (todos os dias)',nm(mdc,o=>mdc[o]===dim(o)),[1,2,3,4,5,6,9,12,18,24,36,48,60],U('meses')],
 ['🎉','Fim de semana produtivo',fw,LD,U('')],['📚','Especialista (horas numa matéria)',fav[0],ld(1,[10,1],[50,5],[100,10],[250,25],[500,50],[1000,100],[2500,250],[5000,500],[10000,1000]).map(h=>h*60),H],
 ['🏛','Ano dedicado (dias estudados no ano)',Math.max(...Object.values(YD)),[50,100,150,200,250,300,330,365],U('dias')]];
 const SP=[['👣','Primeiro Passo','registrar o primeiro estudo',1],['💪','Volta por Cima','1º bloco após 20h e 60+ min no dia',volta],['🌞','Três Turnos','manhã, tarde e noite no mesmo dia',Object.values(tr).some(t=>t.size===3)],
 ['🌙','Virada','bloco que passa da meia-noite',ev.some(x=>fmt(x.a)!==fmt(x.b))],['🍽','Hora do Almoço','bloco começando entre 12h e 14h',ev.some(x=>[12,13].includes(x.a.getHours()))],
 ['🍅','Pomodoro','4+ blocos de 25–35 min no dia',Object.values(pom).some(n=>n>=4)],['🎆','Primeiro de Janeiro','estudar em 1º de janeiro',ks.some(k=>k.slice(5)==='01-01')],
 ['🎂','Aniversário','1 ano desde o primeiro registro',diff(ks[0],ks[ks.length-1])>=365],['🧹','Faxineiro','arquivar uma matéria',S.subjects.some(s=>s.arch)]];
 const R=S.rec=S.rec||{},nw=[],CUM=['tot','yh','yd','ya','ym','yb','yk'],keep=(k,v,l,n,fn)=>{const o=R[k];if(!o||v>o.v){if(o&&!CUM.includes(k))nw.push('🏆 Novo recorde de '+n+'!');R[k]={v,l,h:fn?fn():'',hist:o?(CUM.includes(k)?o.hist||[]:(o.hist||[]).concat([[o.v,fmt(now())]])):[]}}else if(!o.h&&fn&&v===o.v)o.h=fn()};
 const bySub=z=>S.subjects.map(s=>[s.name,z.reduce((a,k)=>a+(s.days[k]||0),0)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).slice(0,6),
  sl=z=>ul(bySub(z).map(([n,m])=>`<b>${esc(n)}</b> · ${hh(m)}`)),bl=k=>ev.filter(x=>fmt(x.a)===k).sort((a,b)=>a.a-b.a),li=x=>`${hm(x.a)}–${hm(x.b)} · ${hh(mins(x))} · ${esc(x.s.name)}`;
 const dayDet=k=>{const L=bl(k),sm=L.reduce((a,x)=>a+mins(x),0),sp=L.length?(L[L.length-1].b-L[0].a)/6e4:0;
  return `<p class="sub">${parse(k).toLocaleDateString('pt-BR',{weekday:'long'})}, ${bd(k)} · ${hh(D[k].m)} no total</p><h3>Por matéria</h3>${sl([k])}${L.length?`<h3>Blocos (${L.length})</h3>${ul(L.map(li))}<p class="sub">Tempo direto: ${hh(sm)} · do 1º ao último bloco: ${hh(sp)} · pausas e trocas: ${hh(Math.max(0,sp-sm))}</p>`:'<p class="sub">Registro manual, sem horários.</p>'}`};
 const foc=x=>`<p class="sub">${esc(x.s.name)} · ${bd(fmt(x.a))} · ${hm(x.a)}–${hm(x.b)} · ${hh(mins(x))} sem pausa</p><h3>Contexto do dia</h3>${ul(bl(fmt(x.a)).map(y=>(y===x?'🏆 ':'')+li(y)))}`;
 const per=(z,t)=>{const mv=Math.max(...z.map(k=>D[k]?D[k].m:0),1);return `<p class="sub">${t}</p><div class="scroll"><div class="bars" style="min-width:${z.length*40}px">${z.map(k=>`<div><span style="height:${(D[k]?D[k].m:0)/mv*100}%"></span>${D[k]?hh(D[k].m):'–'}<small>${k.slice(8)}</small></div>`).join('')}</div></div><h3>Matérias que mais pesaram</h3>${sl(z)}`};
 const gks=[...new Set([...ks, ...chCfg().off])].sort();
 const gr=(()=>{const r=[];let c=0,st='',p=null;gks.forEach(k=>{if(p&&diff(p,k)===1){if(D[k])c++;}else{if(p)r.push([st,p,c]);c=D[k]?1:0;st=k}p=k});if(p)r.push([st,p,c]);return r.length?r:[[fmt(now()),fmt(now()),0]]})(),gb=gr.reduce((a,x)=>x[2]>a[2]?x:a,gr[0]);
 const gD=()=>{const z=Array.from({length:gb[2]},(_,i)=>fmt(addD(parse(gb[0]),i))),t=z.reduce((a,k)=>a+D[k].m,0),mk=z.reduce((r,k)=>D[k].m>D[r].m?k:r,z[0]);
  return `<p class="sub">${bd(gb[0])} a ${bd(gb[1])} · qualquer matéria conta</p>${ul([`${gb[2]} dias seguidos`,`Total na sequência: ${hh(t)} (média ${hh(t/gb[2])}/dia)`,`Dia mais forte: ${bd(mk)} · ${hh(D[mk].m)}`])}<h3>Matérias que mais pesaram</h3>${sl(z)}`};
 const runD=()=>{const sb=S.subjects.find(x=>x.name===bs[1]);if(!sb)return'';let b=[0,'',''],c=0,st='',p=null;
  Object.keys(sb.days).sort().forEach(k=>{if(p&&diff(p,k)===1)c++;else{c=1;st=k}p=k;if(c>b[0])b=[c,st,k]});
  const z=Array.from({length:b[0]},(_,i)=>fmt(addD(parse(b[1]),i))),t=z.reduce((a,k)=>a+sb.days[k],0),mk=z.reduce((r,k)=>sb.days[k]>sb.days[r]?k:r,z[0]);
  return `<p class="sub">${esc(sb.name)} · ${bd(b[1])} a ${bd(b[2])}</p>${ul([`${b[0]} dias seguidos`,`Total na sequência: ${hh(t)} (média ${hh(t/b[0])}/dia)`,`Dia mais forte: ${bd(mk)} · ${hh(sb.days[mk])}`])}`};
 const irD=()=>{const ds=Array.from({length:iron},(_,i)=>fmt(addD(parse(ie),i-iron+1)));return `<p class="sub">${bd(ds[0])} a ${bd(ie)} · começando por volta das ${ih}h</p>${ul(ds.map(k=>{const x=ev.filter(y=>fmt(y.a)===k&&y.a.getHours()==ih).sort((a,b)=>a.a-b.a)[0];return bd(k)+(x?' · início '+hm(x.a)+' · '+esc(x.s.name):'')}))}`};
 const totD=()=>{let c=0,i=0;const H=[10,50,100,500,1000,2000],r=[];ks.forEach(k=>{c+=D[k].m;while(i<H.length&&c>=H[i]*60)r.push(H[i++]+' h atingidas em '+bd(k))});return `<h3>Marcos de tempo</h3>${ul(r.length?r:['Ainda sem marcos'])}<h3>Por matéria</h3>${sl(ks)}`};

 const yDet=Y=>{const z=ks.filter(k=>k.startsWith(Y)),mo=Object.keys(M).filter(o=>o.startsWith(Y)).sort();return `<p class="sub">${Y} · ${hh(YM[Y])} no total · ${YD[Y]} dias estudados de ${YL[Y]}${YB[Y]?` · ${YB[Y]} blocos`:''}</p><h3>Mês a mês</h3>${ul(mo.map(o=>`<b>${o.split('-').reverse().join('/')}</b> · ${hh(M[o])} · ${wdc2(o)} dias estudados`))}<h3>Matérias que mais pesaram</h3>${sl(z)}`};
 const wdc2=o=>ks.filter(k=>k.startsWith(o)).length;
 const yb1=f=>YR.reduce((r,y)=>f(y)>f(r)?y:r,YR[0]);
 {const a=yb1(y=>YM[y]);keep('yh',YM[a],a,'ano mais estudado',()=>yDet(a));
  const b=yb1(y=>YD[y]);keep('yd',YD[b],`${b} (${Math.round(YD[b]/YL[b]*100)}%)`,'ano com mais dias estudados',()=>yDet(b));
  const c=yb1(y=>YM[y]/YL[y]);keep('ya',YM[c]/YL[c],c,'maior média diária do ano',()=>yDet(c));
  const d=yb1(y=>YS[y]?YS[y][0]:0);if(YS[d])keep('ys',YS[d][0],`${d}: ${bd(YS[d][1])} a ${bd(YS[d][2])}`,'maior streak dentro de um ano',()=>{const z=Array.from({length:YS[d][0]},(_,i)=>fmt(addD(parse(YS[d][1]),i))),t=z.reduce((q,k)=>q+D[k].m,0);return `<p class="sub">${bd(YS[d][1])} a ${bd(YS[d][2])} · dentro de ${d}</p>${ul([`${YS[d][0]} dias seguidos`,`Total na sequência: ${hh(t)} (média ${hh(t/YS[d][0])}/dia)`])}<h3>Matérias que mais pesaram</h3>${sl(z)}`});
  const e=YP.reduce((r,x)=>x[2]>r[2]?x:r,YP[0]);if(e)keep('ym',e[2],`${esc(e[0])}, ${e[1]}`,'matéria do ano',()=>{const sb=S.subjects.find(x=>x.name===e[0]),mo={};Object.entries(sb.days).filter(([k])=>k.startsWith(e[1])).forEach(([k,v])=>{mo[k.slice(0,7)]=(mo[k.slice(0,7)]||0)+v});return `<p class="sub">${esc(e[0])} · ${e[1]} · ${hh(e[2])} no ano</p><h3>Mês a mês</h3>${ul(Object.keys(mo).sort().map(o=>`<b>${o.split('-').reverse().join('/')}</b> · ${hh(mo[o])}`))}`});
  const f=yb1(y=>YMo[y]?YMo[y][0]:0),fo=YMo[f]&&YMo[f][1];if(fo)keep('yb',YMo[f][0],fo.split('-').reverse().join('/'),'melhor mês de um ano',()=>per(Array.from({length:dim(fo)},(_,i)=>fo+'-'+p2(i+1)),`${fo.split('-').reverse().join('/')} · ${hh(YMo[f][0])} no total`));
  if(ev.length){const g=yb1(y=>YB[y]||0);keep('yk',YB[g],g,'ano com mais blocos',()=>yDet(g))}}
 keep('gstreak',gb[2],`${bd(gb[0])} a ${bd(gb[1])}`,'streak geral',gD);keep('streak',bs[0],bs[1],'maior streak',runD);keep('day',D[day].m,bd(day),'maratona',()=>dayDet(day));if(top)keep('focus',mins(top),esc(top.s.name)+', '+bd(fmt(top.a)),'foco absoluto',()=>foc(top));
 keep('week',W[bw]/7,bd(bw),'maior média semanal',()=>per(Array.from({length:7},(_,i)=>fmt(addD(parse(bw),i))),`Semana de ${bd(bw)} · ${hh(W[bw])} no total`));
 keep('month',M[bm]/dim(bm),bm.split('-').reverse().join('/'),'maior média mensal',()=>per(Array.from({length:dim(bm)},(_,i)=>bm+'-'+p2(i+1)),`${bm.split('-').reverse().join('/')} · ${hh(M[bm])} no total`));
 keep('pol',D[pol].n.size,bd(pol),'polímata',()=>dayDet(pol));if(iron>1)keep('iron',iron,ih+'h','hábito de ferro',irD);keep('tot',tot,'','tempo total acumulado',totD);
 {const rk=(a,f)=>{const t=a.sort((x,y)=>y[1]-x[1]||(y[2]||0)-(x[2]||0)).slice(0,50);return t.length?`<div><h3>🏅 Top ${t.length}</h3><ol class="rk">${t.map((x,i)=>`<li${i===0?' class="first"':''}><span class="pos">${['🥇','🥈','🥉'][i]||(i+1)+'º'}</span><span class="rl">${x[0]}</span><b>${f(x[1])}</b></li>`).join('')}</ol></div>`:''},
  runsOf=ds=>{const r=[];let c=0,st='',p=null;const fl=()=>{if(p)r.push([st,p,c])};ds.slice().sort().forEach(k=>{if(p&&diff(p,k)===1)c++;else{fl();c=1;st=k}p=k});fl();return r},
  wd=k=>parse(k).toLocaleDateString('pt-BR',{weekday:'short'});
  RK={
  yh:rk(YR.map(y=>[`<b>${y}</b> · ${YD[y]} dias estudados`,YM[y]]),UF.yh),
  yd:rk(YR.map(y=>[`<b>${y}</b> · ${Math.round(YD[y]/YL[y]*100)}% dos ${YL[y]} dias${y===curY?' (até hoje)':''}`,YD[y],YM[y]]),UF.yd),
  ya:rk(YR.map(y=>[`<b>${y}</b> · ${hh(YM[y]/YD[y])} por dia estudado`,YM[y]/YL[y]]),UF.ya),
  ys:rk(YR.filter(y=>YS[y]).map(y=>[`<b>${y}</b> · ${bd(YS[y][1])} a ${bd(YS[y][2])}`,YS[y][0]]),UF.ys),
  ym:rk(YP.map(x=>[`<b>${esc(x[0])}</b> · ${x[1]}`,x[2]]),UF.ym),
  yb:rk(YR.filter(y=>YMo[y]).map(y=>[`<b>${YMo[y][1].split('-').reverse().join('/')}</b> · melhor de ${y}`,YMo[y][0]]),UF.yb),
  yk:rk(YR.filter(y=>YB[y]).map(y=>[`<b>${y}</b>`,YB[y]]),UF.yk),
  gstreak:rk(gr.map(([a,b,c])=>[`<b>${bd(a)} a ${bd(b)}</b>${diff(b,fmt(now()))<=1?' · em andamento':''}`,c]),UF.gstreak),
  streak:rk(S.subjects.flatMap(s=>runsOf(Object.keys(s.days)).map(([a,b,c])=>[`<b>${esc(s.name)}</b> · ${bd(a)} a ${bd(b)}`,c])),UF.streak),
  day:rk(ks.map(k=>[`<b>${bd(k)}</b> · ${wd(k)}`,D[k].m]),UF.day),
  focus:rk(ev.map(x=>[`<b>${esc(x.s.name)}</b> · ${bd(fmt(x.a))} · ${hm(x.a)}–${hm(x.b)}`,mins(x)]),UF.focus),
  week:rk(Object.keys(W).map(w=>[`Semana de <b>${bd(w)}</b> · ${hh(W[w])} no total`,W[w]/7]),UF.week),
  month:rk(Object.keys(M).map(o=>[`<b>${o.split('-').reverse().join('/')}</b> · ${hh(M[o])} no total`,M[o]/dim(o)]),UF.month),
  pol:rk(ks.map(k=>[`<b>${bd(k)}</b> · ${wd(k)} · ${hh(D[k].m)}`,D[k].n.size,D[k].m]),UF.pol),
  iron:rk(Object.entries(hr).flatMap(([h,set])=>runsOf([...set]).filter(r=>r[2]>1).map(([a,b,c])=>[`<b>~${h}h</b> · ${bd(a)} a ${bd(b)}`,c])),UF.iron),
  tot:rk(S.subjects.map(s=>[`<b>${esc(s.name)}</b>${s.arch?' (arquivada)':''}`,Object.values(s.days).reduce((a,b)=>a+b,0)]).filter(x=>x[1]>0),UF.tot)}}
 S.bd=S.bd||{};const had=S.bdv===4;S.bdv=4;const TH=[.05,.1,.2,.3,.4,.5,.6,.75,.9,1],LV=['Sem nível','Bronze','Prata','Ouro','Platina','Esmeralda','Safira','Rubi','Ametista','Diamante','Lendário'],LE=['⚪','🥉','🥈','🥇','💿','💚','🔷','❤️','🟣','💎','👑'];let totU=0,totN=0;
 const unl=(key,ok,name)=>{if(ok&&!S.bd[key]){S.bd[key]=1;if(had)nw.push('🏅 Conquista desbloqueada: '+name)}return !!(ok||S.bd[key])};
 const gcat=CAT.map(([e,n,v,st,f])=>{const u=st.map(x=>unl(n+' '+x,v>=x,n+' '+f(x))),c=u.filter(Boolean).length,i=u.indexOf(false),lv=TH.filter(t=>c>0&&c>=Math.ceil(t*st.length)).length;totU+=c;totN+=st.length;
  return `<div class="cat"><div class="row"><b>${e} ${n}</b><span>${LE[lv]} ${LV[lv]} · ${c}/${st.length}</span></div><div class="goal"><div class="bar"><div style="width:${i<0?100:Math.min(100,v/st[i]*100)}%"></div></div></div><small class="sub">${i<0?'Completo! 🎉':f(v)+' de '+f(st[i])+' para o próximo degrau'}</small><div class="badges">${st.map((x,j)=>`<span class="badge${u[j]?' got':''}">${f(x)}</span>`).join('')}</div></div>`}).join('');
 const gsp=SP.map(([e,n,d,ok])=>{const g=unl(n,ok,n);totU+=g?1:0;totN++;return `<span class="badge${g?' got':''}">${e} ${n}<small> · ${d}</small></span>`}).join('');
 const gal=`<p class="sub">${totU} de ${totN} conquistas desbloqueadas</p><div class="gal">${gcat}<div class="cat"><b>⭐ Especiais</b><div class="badges">${gsp}</div></div></div>`;
 if(q){if(nw.length)setTimeout(()=>toast(nw.join(' · ')),2800);return}
 $('#dlBody').style.setProperty('--c','var(--flame)');
 $('#dlBody').innerHTML=`<div class="row"><h2 style="margin:0">🏆 Recordes</h2><button class="ghost" data-a="close">Fechar</button></div>
 <div><h3>Destaques</h3><div class="tro">${C(R.gstreak.v+' dias',`Streak geral · ${R.gstreak.l}`,'gstreak')}${C(R.streak.v+' dias',`Maior streak por matéria · ${esc(R.streak.l)}`,'streak')}${C(hh(R.day.v),`Maratona · ${R.day.l}`,'day')}${R.focus?C(hh(R.focus.v),`Foco absoluto (bloco contínuo) · ${R.focus.l}`,'focus'):''}${C(hh(R.week.v)+'/dia',`Maior média semanal · sem. de ${R.week.l}`,'week')}${C(hh(R.month.v)+'/dia',`Maior média mensal · ${R.month.l}`,'month')}${C(esc(fav[1]),`Matéria favorita · ${hh(fav[0])}`)}${C(R.pol.v+' matérias',`Polímata · ${R.pol.l}`,'pol')}${R.iron?C(R.iron.v+' dias',`Hábito de ferro · por volta das ${R.iron.l}`,'iron'):''}</div></div>
 <div><h3>Estatísticas gerais</h3><div class="tro">${C(hh(R.tot.v),'Tempo total acumulado','tot')}${C(hh(tot/ks.length),'Média por dia estudado')}${C(ks.length,'Dias estudados')}${C(ev.length,'Blocos registrados')}${ev.length?C(hh(evm/ev.length),'Bloco médio'):''}${C(G.length-pz.length,'Matéria-dias sem pausa (1 bloco)')}${C(pz.length,'Matéria-dias com pausas')}${C(hh(gap),'Tempo total em pausas')}${C(early.size+' / '+night.size,'Dias madrugador / coruja')}${C(fw,'Fins de semana produtivos')}${C(tp,'Tópicos concluídos')}</div></div>
 <div><h3>Estatísticas anuais</h3><div class="tro">${C(hh(R.yh.v),`Ano mais estudado · ${R.yh.l}`,'yh')}${C(R.yd.v+' dias',`Ano com mais dias estudados · ${R.yd.l}`,'yd')}${C(hh(R.ya.v)+'/dia',`Maior média diária do ano · ${R.ya.l}`,'ya')}${R.ys?C(R.ys.v+' dias',`Maior streak num ano · ${R.ys.l}`,'ys'):''}${R.ym?C(hh(R.ym.v),`Matéria do ano · ${R.ym.l}`,'ym'):''}${R.yb?C(hh(R.yb.v),`Melhor mês de um ano · ${R.yb.l}`,'yb'):''}${R.yk?C(R.yk.v+' blocos',`Ano com mais blocos · ${R.yk.l}`,'yk'):''}</div>
 <h3>Comparativo ano a ano</h3>${ul(YR.slice().reverse().map(y=>{const pos=YR.slice().sort((a,b)=>YM[b]-YM[a]).indexOf(y);return `${['🥇','🥈','🥉'][pos]||(pos+1)+'º'} <b>${y}</b> · ${hh(YM[y])} · ${YD[y]} dias (${Math.round(YD[y]/YL[y]*100)}%) · ${hh(YM[y]/YL[y])}/dia · streak ${YS[y]?YS[y][0]:0}${YB[y]?' · '+YB[y]+' blocos':''}`}))}<p class="sub">Medalha = classificação do ano por tempo total.</p></div>
 <div><h3>Galeria de conquistas</h3>${gal}</div>`;
 if(!$('#dlg').open)$('#dlg').showModal()}

