/* ===== Aba "Tarefas": lista enxuta por data (estilo Google Tasks) + atalhos do formulário de tarefas ===== */
let tkF='all',tkDate=null,tkShowDone=false,tkDraft='';
const tkDay=k=>{const t=fmt(now()),n=diff(t,k);if(n===0)return'Hoje';if(n===1)return'Amanhã';
 const w=parse(k).toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','');
 return w.charAt(0).toUpperCase()+w.slice(1)+', '+k.slice(8)+'/'+k.slice(5,7)+(k.slice(0,4)!==t.slice(0,4)?'/'+k.slice(0,4):'')};
function tkRow(s,x,showDate){
 const late=!x.done&&x.date&&x.date<fmt(now()),meta=[`<span class="sd">${esc(s.name)}</span>`];
 if(x.time)meta.push('🕒 '+esc(x.time));
 if(x.est)meta.push(hh(x.est));
 if(showDate&&x.date)meta.push(`<span class="${late?'lt':''}">${late?'Atrasada · ':''}${bd(x.date).slice(0,5)}</span>`);
 return`<div class="tk-r${x.done?' dn':''}" style="--c:${s.color}"><button type="button" class="tk-ck" data-a="ctog" data-id="${s.id}" data-tid="${x.id}" aria-label="${x.done?'Reabrir tarefa':'Concluir tarefa'}">${x.done?'✓':''}</button><div class="tk-b" role="button" tabindex="0" data-a="tedit" data-id="${s.id}" data-tid="${x.id}"><div class="tk-t">${xn(x)}</div><div class="tk-m">${meta.join('')}</div></div></div>`}
function tkHtml(){
 const t=fmt(now()),tm=fmt(addD(now(),1)),A=S.subjects.filter(s=>!s.arch);
 if(tkDate===null)tkDate=t;
 if(tkF!=='all'&&!A.some(s=>s.id===tkF))tkF='all';
 const all=allTasks().filter(o=>!o.s.arch&&(tkF==='all'||o.s.id===tkF)),
  open=all.filter(o=>!o.x.done),dn=all.filter(o=>o.x.done),cs=A.some(s=>s.id===calSub)?calSub:(A[0]||{}).id,
  cmp=(a,b)=>(a.x.date||'9999').localeCompare(b.x.date||'9999')||(a.x.time||'99').localeCompare(b.x.time||'99')||String(a.x.name).localeCompare(String(b.x.name));
 open.sort(cmp);
 const late=open.filter(o=>o.x.date&&o.x.date<t),nod=open.filter(o=>!o.x.date),by={};
 open.filter(o=>o.x.date&&o.x.date>=t).forEach(o=>(by[o.x.date]=by[o.x.date]||[]).push(o));
 const sec=(ti,L,cls,sd)=>L.length?`<section class="tk-sec ${cls||''}"><h3>${ti}<span>${L.length}</span></h3>${L.map(o=>tkRow(o.s,o.x,sd)).join('')}</section>`:'';
 let body=sec('Atrasadas',late,'late',true);
 Object.keys(by).sort().forEach(k=>{body+=sec(tkDay(k),by[k],k===t?'today':'')});
 body+=sec('Sem data',nod,'');
 const dS=dn.slice().sort((a,b)=>String(b.x.doneAt||'').localeCompare(String(a.x.doneAt||''))).slice(0,30),
  doneSec=dn.length?`<details class="tk-done" data-tk-det${tkShowDone?' open':''}><summary>Concluídas (${dn.length})</summary>${dS.map(o=>tkRow(o.s,o.x,true)).join('')}</details>`:'',
  chip=(l,v,on)=>`<button type="button" class="tq${on?' on':''}" data-tk="dt" data-v="${v}">${l}</button>`,
  add=A.length?`<div class="tk-add"><div class="tk-line"><input type="text" id="tk-n" maxlength="80" placeholder="＋ Adicionar tarefa" value="${esc(tkDraft)}" aria-label="Nova tarefa"><button type="button" class="btn main" data-tk="add">Adicionar</button></div>
   <div class="tk-opts"><select id="tk-s" aria-label="Matéria">${A.map(s=>`<option value="${s.id}"${s.id===cs?' selected':''}>${esc(s.name)}</option>`).join('')}</select>${chip('Hoje',0,tkDate===t)}${chip('Amanhã',1,tkDate===tm)}${chip('Sem data','',tkDate==='')}<input type="date" id="tk-d" value="${tkDate}" aria-label="Dia"></div></div>`
   :`<p class="sub">Adicione uma matéria ativa em Planejar › Matérias para criar tarefas.</p>`;
 return`<div class="mgs tk"><div class="tk-hd"><div><h2>✅ Tarefas</h2><p class="sub" style="margin:2px 0 0">${open.length} pendente${pl(open.length)}${late.length?` · <span class="lt">${late.length} atrasada${pl(late.length)}</span>`:''}</p></div>
  <select id="tk-f" aria-label="Filtrar por matéria"><option value="all">Todas as matérias</option>${A.map(s=>`<option value="${s.id}"${s.id===tkF?' selected':''}>${esc(s.name)}</option>`).join('')}</select></div>
  ${add}${body||'<p class="sub tk-empty">Nenhuma tarefa pendente. 🎉</p>'}${doneSec}</div>`}
function tkAdd(){
 const n=(($('#tk-n')||{}).value||'').trim(),s=S.subjects.find(x=>x.id===($('#tk-s')||{}).value);
 if(!n){toast('Digite o nome da tarefa.');const i=$('#tk-n');if(i)i.focus();return}if(!s)return;
 const d=($('#tk-d')||{}).value||'';calSub=s.id;tkDate=d;tkDraft='';
 (s.topics=s.topics||[]).push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,4),name:n,date:d,prio:'media',est:0,done:false,doneAt:'',note:''});
 save();render();toast('Tarefa adicionada.');setTimeout(()=>{const i=$('#tk-n');if(i)i.focus()},0)}
const tkKeep=()=>{tkDraft=(($('#tk-n')||{}).value)||''};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-tk]');if(!b)return;const a=b.dataset.tk;
 if(a==='dt'){tkKeep();const v=b.dataset.v;tkDate=v===''?'':fmt(addD(now(),+v));render();setTimeout(()=>{const i=$('#tk-n');if(i)i.focus()},0)}
 else if(a==='add')tkAdd();
 else if(a==='new'){const v=(($('#cd-n')||{}).value)||'';openTask('',null,calSel);const n=$('#td-n');if(n&&v)n.value=v}});
document.addEventListener('change',e=>{const i=e.target.id;
 if(i==='tk-f'){tkKeep();tkF=e.target.value;render()}
 else if(i==='tk-d'){tkKeep();tkDate=e.target.value;render()}
 else if(i==='tk-s')calSub=e.target.value});
document.addEventListener('toggle',e=>{if(e.target.matches&&e.target.matches('[data-tk-det]'))tkShowDone=e.target.open},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&e.target.id==='tk-n'){e.preventDefault();tkAdd();return}
 if(e.key==='Enter'&&e.target.id==='cd-n'){e.preventDefault();const b=document.querySelector('[data-a="cadd"]');if(b)b.click();return}
 if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('tk-b')){e.preventDefault();openTask(e.target.dataset.id,e.target.dataset.tid)}});
/* atalhos do diálogo de tarefa: dia e duração */
$('#tdlg').addEventListener('click',e=>{const b=e.target.closest('[data-tq]');if(!b)return;const k=b.dataset.tq,v=b.dataset.v;
 if(k==='d'){$('#td-d').value=v===''?'':fmt(addD(now(),+v));if(v==='')$('#td-t').value=''}
 else if(k==='u')$('#td-u').value=v;
 b.parentNode.querySelectorAll('[data-tq]').forEach(x=>x.classList.toggle('on',x===b))});
