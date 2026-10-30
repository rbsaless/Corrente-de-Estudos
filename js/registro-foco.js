/* ===== V25: tempo planejado x fora do plano ===== */
let tpUnp=null;
const impU=x=>impOf(x)===0;
const impAt=(x,d)=>{let v=impOf(x);if(Array.isArray(x.imph)&&x.imph.length){v=null;x.imph.forEach(h=>{if(h.from<=d)v=h.v});if(v==null)v=x.imph[0].v}return v};
const plOf=(x,d)=>impAt(x,d)===0?0:Math.max(0,(x.days[d]||0)-((x.du&&x.du[d])||0));
const plTot=d=>S.subjects.reduce((a,x)=>a+plOf(x,d),0);
const allTot=d=>S.subjects.reduce((a,x)=>a+(x.days[d]||0),0);
function renderSplit(){const o=$('#splsec');if(o)o.remove();const pg=$('#pg-relatorio'),tp=pg&&pg.querySelector('.ptop');if(!tp||curPage!=='relatorio')return;
 const rows=[['Hoje',1],['Últimos 7 dias',7],['Últimos 30 dias',30]].map(([n,N])=>{let a=0,p=0;for(let i=0;i<N;i++){const d=fmt(addD(now(),-i));a+=allTot(d);p+=plTot(d)}
  const pc=a>0?Math.round(p/a*100):0;return`<tr><td>${n}</td><td><b>${hh(Math.round(a))}</b></td><td>${hh(Math.round(p))}</td><td>${hh(Math.round(a-p))}</td><td style="min-width:90px"><div class="bar" aria-hidden="true"><div style="width:${pc}%"></div></div></td></tr>`}).join('');
 tp.insertAdjacentHTML('afterend',`<div class="mgs" id="splsec"><h2>⏱ Total × planejado</h2><p class="sub" style="margin:0 0 6px">Só o tempo <b>planejado</b> vale para streak, XP, lazer, Elos e desafios. O tempo fora do plano entra apenas no total estudado.</p><div style="overflow-x:auto"><table style="width:100%;text-align:left"><thead><tr><th></th><th>Total</th><th>Planejado</th><th>Fora do plano</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`)}


/* ===== V26: marcar sessão salva como não planejada (definitivo) ===== */
function mkUnp(sid,ma,mb){const s=S.subjects.find(x=>x.id===sid);if(!s)return;
 const ss=(s.sessions||[]).find(q=>+new Date(q[0])===ma&&+new Date(q[1])===mb);if(!ss)return toast('Sessão não encontrada.');
 if(ss[2])return toast('Esta sessão já é não planejada.');const a=new Date(ma),b=new Date(mb);
 if(impAt(s,fmt(a))===0)return toast('A matéria estava fora do plano nesse dia.');
 const parts=[];let c=a;while(fmt(c)<fmt(b)){const n=new Date(c.getFullYear(),c.getMonth(),c.getDate()+1);parts.push([fmt(c),(n-c)/6e4]);c=n}parts.push([fmt(c),(b-c)/6e4]);
 s.du=s.du||{};parts.forEach(([d,m])=>{s.du[d]=Math.min(s.days[d]||0,(s.du[d]||0)+Math.round(m))});ss[2]=1;
 const z=lzCfg(),rt=ss[3],near=x=>x.sid===sid&&(rt?Math.abs(x.t-rt)<=8000:(x.t>=mb-6e4&&x.t<=mb+18e5)),hit=z.led.filter(x=>near(x)&&['gain','bonus','pay'].includes(x.type));
 let el=(mb-ma)/6e4/10;const gn=hit.find(x=>x.type==='gain');if(gn&&hit.some(x=>x.type==='bonus'))el+=(gn.st||0)/10*.5;
 z.led=z.led.filter(x=>!hit.includes(x));elCfg().g-=el;
 (S.log||[]).forEach(x=>{if(x.sid===sid&&x.d===fmt(a)&&x.h===a.getHours()){x.u=1;delete x.xb}});
 save();render();toast('Sessão marcada como não planejada: lazer, Elos, streak e XP foram recalculados.')}
$('#sdlg').addEventListener('click',e=>{const b=e.target.closest('[data-mku]');if(!b)return;mkUnp(b.dataset.mku,+b.dataset.ma,+b.dataset.mb);if($('#sdlg').open)$('#sdlg').close()});

/* ----- Registro do que estudei + foco ----- */
const FOCUS_OPT='<option value="">Foco</option>'+[1,2,3,4,5].map(n=>`<option value="${n}">${n} ★</option>`).join('');
function addLog(s,k,m,tm,w,f){
 w=(w||'').trim().slice(0,120);f=+f||0;if(!w&&!f)return;
 const e={id:'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),sid:s.id,d:k,h:tm?parseInt(tm):null,m:Math.round(m)||0,w,f};(S.log=S.log||[]).push(e);return e}
let sPend=null;
function askSession(s,a,min,tid,cid,unp){
 const tk=tid&&(s.topics||[]).find(x=>x.id===tid);
 sPend={sid:s.id,d:fmt(a),h:a.getHours(),m:Math.max(1,Math.round(min)),f:0,tid:tk?tk.id:'',cid:cid||'',u:!!unp};
 $('#sBody').innerHTML=`<div class="row"><h2 style="margin:0;font-size:1.3rem">Como foi a sessão?</h2></div><p class="sub" style="margin:0">${esc(s.name)} · ${hh(sPend.m)}</p>
 <label>O que estudei<input type="text" id="sess-w" maxlength="120" placeholder="Ex.: Funções do 2º grau, exercícios 1 a 10" value="${tk?esc(tk.name):''}"></label>${tk?`<label>Concluiu a tarefa “${esc(tk.name)}”?<select id="sess-c"><option value="0">Ainda não</option><option value="1">Sim, concluí</option></select></label>`:''}
 <div><div class="sub" style="margin:0 0 6px;font-size:.85rem">Concentração (1 = muito dispersa · 5 = foco total)</div><div class="fr" role="group" aria-label="Concentração">${[1,2,3,4,5].map(n=>`<button type="button" data-sf="${n}" aria-pressed="false">${n}</button>`).join('')}</div></div>
 <div class="row"><button class="btn" data-sd="skip">Pular</button><button class="btn main" data-sd="save">Salvar</button></div>`;
 if(!$('#sdlg').open)$('#sdlg').showModal();setTimeout(()=>{const n=$("#sess-w");if(n)n.focus()},30)}
$('#sdlg').addEventListener('click',e=>{
 if(e.target===e.currentTarget){e.currentTarget.close();return}
 const f=e.target.closest('[data-sf]');
 if(f){sPend.f=sPend.f===+f.dataset.sf?0:+f.dataset.sf;document.querySelectorAll('#sBody [data-sf]').forEach(x=>{const on=+x.dataset.sf===sPend.f;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});return}
 const b=e.target.closest('[data-sd]');if(!b)return;
 if(b.dataset.sd==='save'&&sPend&&sPend.m<10&&sPend.f!==1&&!sPend.warned){
  sPend.warned=true;sPend.f=0;
  document.querySelectorAll('#sBody [data-sf]').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});
  if(!$('#sBody .minwarn')){const w=document.createElement('p');w.className='sub minwarn';w.setAttribute('role','alert');w.style.cssText='margin:0;padding:8px 10px;border:1px solid var(--line);border-left:6px solid #e5484d;border-radius:8px;color:var(--ink)';w.textContent='⚠️ Sessão abaixo do mínimo de 10 minutos. Recomendamos salvar com concentração 1. Escolha o nível novamente e salve (pode manter o 1 sugerido ou escolher outro).';const fr=$('#sBody .fr');fr.parentNode.appendChild(w)}
  return}
 if(b.dataset.sd==='save'&&sPend){const s=S.subjects.find(x=>x.id===sPend.sid);if(s){const lg=addLog(s,sPend.d,sPend.m,String(sPend.h),$("#sess-w").value,sPend.f);if(lg){if(sPend.u)lg.u=1;else lg.xb=xbCalc(sPend.m)}if(sPend.f===5&&sPend.cid)lzBonus(sPend.cid);save();render();toast('Registro salvo.')}}
 $('#sdlg').close()});
$('#sdlg').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='sess-w')$('#sdlg').querySelector('[data-sd=save]').click()});
const lgLine=x=>`${bd(x.d).slice(0,5)}${x.h!=null?' '+p2(x.h)+'h':''}${x.m?' · '+hh(x.m):''}${x.w?' · '+esc(x.w):''}${x.f?' · '+x.f+'/5 ★':''}${x.xb>0?' · ⚡+25% XP':''}`;
const BUCKETS=[['Madrugada (0h–6h)',0,6],['Manhã (6h–12h)',6,12],['Tarde (12h–18h)',12,18],['Noite (18h–24h)',18,24]];
function renderFocus(){
 const el=$('#fc');if(!el||curPage!=='relatorio'||rTab!=='hist')return;
 const L=(S.log||[]).filter(x=>x.f>0&&revValid({sid:x.sid}));
 if(!L.length){el.innerHTML=`<h2 style="text-transform:none">🧠 Foco e concentração</h2><p class="sub">Dê uma nota de 1 a 5 de concentração ao fim de cada sessão do cronômetro ou ao registrar o estudo. Com o tempo, aqui aparece em quais horários e matérias você rende mais.</p>`;return}
 const avg=a=>a.reduce((x,y)=>x+y.f,0)/a.length,fm=v=>v.toFixed(1).replace('.',','),
  row=(lab,a,c)=>`<div class="hrow" style="--c:${c||'var(--flame)'}"><div class="hh2"><b>${lab}</b><span class="hv">${fm(avg(a))}</span></div><div class="hbar" aria-hidden="true"><div style="width:${avg(a)/5*100}%"></div></div><div class="hmeta"><span>${a.length} registro${pl(a.length)}</span></div></div>`;
 const bs=S.subjects.map(s=>({s,a:L.filter(x=>x.sid===s.id)})).filter(o=>o.a.length).sort((x,y)=>avg(y.a)-avg(x.a));
 const bk=BUCKETS.map(([n,a,b])=>({n,a:L.filter(x=>x.h!=null&&x.h>=a&&x.h<b)})).filter(o=>o.a.length);
 const bestS=bs[0],bestB=bk.slice().sort((x,y)=>avg(y.a)-avg(x.a))[0],few=L.length<5?' (poucos registros ainda, a tendência melhora com o tempo)':'';
 el.innerHTML=`<h2 style="text-transform:none">🧠 Foco e concentração</h2><p class="sub" style="margin-top:0">Média das notas de 1 a 5 que você deu.${bestS?` Você rende mais em <b style="color:var(--ink)">${esc(bestS.s.name)}</b> (${fm(avg(bestS.a))})`:''}${bestB?` e no período <b style="color:var(--ink)">${bestB.n.split(' (')[0].toLowerCase()}</b> (${fm(avg(bestB.a))})`:''}.${few}</p>
 <h3>Por matéria</h3><div class="hs">${bs.map(o=>row(esc(o.s.name),o.a,o.s.color)).join('')}</div>
 ${bk.length?`<h3>Por horário do dia</h3><div class="hs">${bk.map(o=>row(o.n,o.a)).join('')}</div>`:'<p class="sub">Para ver por horário, use o cronômetro ou informe a hora de início ao registrar.</p>'}`}

/* ----- Metas: previsão, recompensas ----- */
function weeklyGoals(){return(S.mg||[]).filter(g=>g.scope==='week')}
function goalLabel(g){const s=S.subjects.find(x=>x.id===g.sid),nm=s?esc(s.name):'matéria removida';
 return g.type==='total'?`Tempo total${Array.isArray(g.sids)&&mgSubs(g).length<S.subjects.length?' ('+mgSubs(g).map(x=>esc(x.name)).join(', ')+')':''} · ${hh(g.min)}`:g.type==='subject'?`${nm} · ${hh(g.min)}`:`${nm} · ${g.wd.map(d=>DNAMES[d]).join(', ')}`}
function rwEval(r){
 const wk=fmt(monday(now())),L=r.gid==='all'?weeklyGoals():weeklyGoals().filter(g=>g.id===r.gid);
 const ok=L.filter(g=>{const i=mgCalc(g);return !i.gone&&i.ok}).length;return{total:L.length,ok,met:L.length>0&&ok===L.length,wk}}
function rwSync(){let ch=false;(S.rw||[]).forEach(r=>{const e=rwEval(r);r.un=r.un||{};r.cl=r.cl||{};if(e.met&&!r.un[e.wk]){r.un[e.wk]=1;ch=true}});return ch}
const rwPend=r=>Object.keys(r.un||{}).filter(k=>!(r.cl||{})[k]).sort();
function rwCard(r){
 const e=rwEval(r),p=rwPend(r),cl=(r.cl||{})[e.wk];let st,act='';
 if(p.length){st=`🎉 <b>Desbloqueado!</b>${p.length>1?` (${p.length} semanas para resgatar)`:''}`;act=`<button class="btn main" data-a="mgrwclaim" data-id="${r.id}">Resgatar</button>`}
 else if(cl)st='✅ Resgatado esta semana';
 else st=e.total?`🔒 Bloqueado · ${e.ok} de ${e.total} meta${pl(e.total)} semana${e.total===1?'l':'is'} cumprida${pl(e.ok)}`:'🔒 Crie uma meta semanal para desbloquear';
 return`<div class="mgc${p.length?' ok':''}"><div class="mgh"><div class="mgt">🎁 ${esc(r.name)}<small>${r.gid==='all'?'Todas as metas semanais':(()=>{const g=(S.mg||[]).find(x=>x.id===r.gid);return g?goalLabel(g):'meta removida'})()}</small></div><div class="acts">${act}<button class="ghost danger" data-a="mgrwdel" data-id="${r.id}">Excluir</button></div></div><p class="mgm" style="color:var(--ink)">${st}</p></div>`}
function rwSection(){
 const R=S.rw||[],W=weeklyGoals();
 return`<div class="mgs"><h2>🎁 Recompensas</h2><p class="sub" style="margin-top:0">Defina um prêmio. Ele desbloqueia quando você cumpre a meta da semana.</p>${R.map(rwCard).join('')||'<p class="sub">Nenhum prêmio definido ainda.</p>'}
 <div class="mgf"><div class="mgr"><label style="flex:1 1 200px">Prêmio<input type="text" id="rw-n" maxlength="60" placeholder="Ex.: assistir a um filme" style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--ink);min-height:40px"></label><label>Desbloqueia ao cumprir<select id="rw-g"><option value="all">Todas as metas semanais</option>${W.map(g=>`<option value="${g.id}">${goalLabel(g)}</option>`).join('')}</select></label></div><button class="btn main" data-a="mgrwadd">Criar prêmio</button></div></div>`}
function rwBanner(){
 const P=(S.rw||[]).filter(r=>rwPend(r).length);if(!P.length)return'';
 return`<div class="pn rwb">${P.map(r=>`<div class="row" style="align-items:center"><span>🎁 <b>Prêmio desbloqueado:</b> ${esc(r.name)}</span><button class="btn main" data-a="mgrwclaim" data-id="${r.id}">Resgatar</button></div>`).join('')}</div>`}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a^="mgrw"]');if(!b)return;const a=b.dataset.a,r=(S.rw||[]).find(x=>x.id===b.dataset.id);
 if(a==='mgrwadd'){const n=$('#rw-n').value.trim();if(!n){toast('Digite o prêmio.');$('#rw-n').focus();return}
  (S.rw=S.rw||[]).push({id:'w'+Date.now().toString(36),name:n.slice(0,60),gid:$('#rw-g').value,un:{},cl:{}});rwSync();save();render();toast('Prêmio criado.')}
 else if(a==='mgrwclaim'&&r){const k=rwPend(r)[0];if(k){r.cl[k]=1;save();render();toast('🎉 Aproveite: '+r.name+'!')}}
 else if(a==='mgrwdel'&&r){if(confirm('Excluir este prêmio?')){S.rw=S.rw.filter(x=>x!==r);save();render()}}
});

