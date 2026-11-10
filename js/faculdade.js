/* ===== Faculdade v2: tela sobreposta, sem rota/hash (não interfere no app) ===== */
(()=>{
const SEM=(y,n)=>y*2+(n-1);
const parseSem=t=>{const m=/^(\d{4})\/([12])$/.test(t||'')&&t.split('/');return m?SEM(+m[0],+m[1]):null};
const lbl=i=>Math.floor(i/2)+'/'+(i%2+1);
const curIdx=()=>{const d=new Date();return SEM(d.getFullYear(),d.getMonth()<6?1:2)};
const F=()=>{const f=S.faculdade=(S.faculdade&&typeof S.faculdade==='object')?S.faculdade:{};
 if(!Array.isArray(f.mats))f.mats=[];if(typeof f.fim!=='string')f.fim='';if(typeof f.dataFim!=='string')f.dataFim='';return f};
const E=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const OF={todo:'Todo semestre',s1:'Só no 1º semestre (anual)',s2:'Só no 2º semestre (anual)'};
const offered=(m,i)=>m.of==='s1'?i%2===0:m.of==='s2'?i%2===1:true;

/* menor semestre em que dá pra cursar, respeitando pré-requisitos pendentes */
function plan(f){const cur=curIdx(),fim=parseSem(f.fim),by={},memo={};f.mats.forEach(m=>by[m.id]=m);
 const earliest=(m,seen)=>{if(m.id in memo)return memo[m.id];if(seen.has(m.id))return null;seen.add(m.id);
  let from=cur;for(const d of m.dep||[]){const x=by[d];if(!x||x.ok)continue;const e=earliest(x,seen);if(e==null){memo[m.id]=null;return null}from=Math.max(from,e+1)}
  const lim=fim!=null?fim:cur+16;let r=null;for(let i=from;i<=lim;i++)if(offered(m,i)){r=i;break}memo[m.id]=r;return r};
 const out={};f.mats.forEach(m=>{if(!m.ok){const e=earliest(m,new Set());let n=0;if(fim!=null)for(let i=cur;i<=fim;i++)if(offered(m,i))n++;out[m.id]={e,n,fits:e!=null&&(fim==null||e<=fim)}}});return out}

let ov=null,open=false;
function mk(){if(ov)return ov;ov=document.createElement('div');ov.id='fac-ov';
 ov.style.cssText='position:fixed;inset:0;z-index:100;background:var(--bg);color:var(--ink);overflow:auto;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 40px;display:none';
 document.body.appendChild(ov);
 ov.addEventListener('click',onClick);ov.addEventListener('change',onChange);return ov}

function matCard(m,P,f){const p=P[m.id]||{},by=id=>f.mats.find(x=>x.id===id),deps=(m.dep||[]).map(d=>by(d)).filter(Boolean);
 const others=f.mats.filter(x=>x.id!==m.id);
 const st=m.ok?'<b style="color:#00a878">✅ Concluída</b>':p.e==null?'<b style="color:#e5484d">⚠️ Sem oferta possível até o prazo</b>':!p.fits?`<b style="color:#e5484d">⚠️ Só dá em ${lbl(p.e)} (depois do prazo)</b>`:`Próxima chance: <b>${lbl(p.e)}</b> · ${p.n} oferta${p.n===1?'':'s'} até o fim`;
 return`<div class="mgc" style="--c:${m.foco?'#f59e0b':'var(--flame)'};${m.foco?'border:2px solid #f59e0b':''}"><div class="mgh"><div class="mgt">${m.foco?'🎯 ':''}${E(m.nome)}${m.sid?' <small>ligada à matéria do app</small>':''}<small>${OF[m.of||'todo']}${deps.length?' · Requer: '+deps.map(d=>E(d.nome)+(d.ok?' ✓':'')).join(', '):''}</small></div>
 <div class="acts"><button class="btn" data-f="ok" data-id="${m.id}">${m.ok?'Reabrir':'Concluí'}</button>${m.ok?'':`<button class="btn${m.foco?' main':''}" data-f="foco" data-id="${m.id}">🎯 Foco</button>`}<button class="ghost danger" data-f="del" data-id="${m.id}">✕</button></div></div>
 <p class="mgm" style="color:var(--ink)">${st}</p>
 <details style="margin-top:6px"><summary class="sub" style="cursor:pointer">Editar oferta e pré-requisitos</summary>
 <label style="display:block;margin:8px 0">Quando abre<select data-f="of" data-id="${m.id}">${Object.entries(OF).map(([k,v])=>`<option value="${k}"${(m.of||'todo')===k?' selected':''}>${v}</option>`).join('')}</select></label>
 ${others.length?`<div class="sub" style="margin:6px 0 4px">Depende de:</div><div class="wdc">${others.map(o=>`<label><input type="checkbox" data-f="dep" data-id="${m.id}" data-d="${o.id}"${(m.dep||[]).includes(o.id)?' checked':''}> ${E(o.nome)}</label>`).join('')}</div>`:''}</details></div>`}

function draw(){const f=F(),el=mk(),P=plan(f),cur=curIdx(),fim=parseSem(f.fim);
 const pend=f.mats.filter(m=>!m.ok).sort((a,b)=>(b.foco?1:0)-(a.foco?1:0)),ok=f.mats.filter(m=>m.ok);
 const left=fim!=null?Math.max(0,fim-cur+1):null,bad=pend.filter(m=>!(P[m.id]||{}).fits).length;
 let dl='';if(f.dataFim){const n=Math.ceil((new Date(f.dataFim+'T12:00:00')-new Date())/864e5);dl=n>=0?`${n} dias até a data final`:'data final já passou'}
 const subs=S.subjects.filter(s=>!s.arch);
 el.innerHTML=`<div style="max-width:900px;margin:0 auto"><div class="ptop" style="position:static"><button class="btn" data-f="close">← Início</button><h1>🎓 Faculdade</h1></div>
 <div class="mgs"><h2>Prazo para terminar</h2><div class="mgf"><div class="mgr"><label>Semestre final (ex.: 2028/1)<input type="text" id="fac-fim" value="${E(f.fim)}" placeholder="2028/1" maxlength="6" style="width:110px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px;color:var(--ink)"></label><label>Data final (editável)<input type="date" id="fac-dt" value="${E(f.dataFim)}" style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px;color:var(--ink)"></label></div></div>
 <p class="sub" style="margin:10px 0 0">Agora: <b>${lbl(cur)}</b>${fim!=null?` · Faltam <b>${left} semestre${left===1?'':'s'}</b> (inclui o atual)`:' · defina o semestre final'}${dl?' · '+dl:''}<br>${pend.length} pendente${pend.length===1?'':'s'} · ${ok.length} concluída${ok.length===1?'':'s'}${bad?` · <b style="color:#e5484d">${bad} não cabe${bad===1?'':'m'} no prazo</b>`:''}</p></div>
 <div class="mgs"><h2>Nova matéria</h2><div class="mgf"><div class="mgr"><label style="flex:1 1 200px">Nome<input type="text" id="fac-n" maxlength="60" style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px;color:var(--ink)"></label><label>Quando abre<select id="fac-o">${Object.entries(OF).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="lzck"><input type="checkbox" id="fac-d"> Já concluída</label></div><button class="btn main" data-f="add">Adicionar</button></div></div>
 <div class="mgs"><h2>📌 Pendentes</h2>${pend.map(m=>matCard(m,P,f)).join('')||'<p class="sub">Nada pendente.</p>'}</div>
 <div class="mgs"><h2>✅ Concluídas</h2>${ok.map(m=>matCard(m,P,f)).join('')||'<p class="sub">Nenhuma ainda.</p>'}</div>
 <div class="mgs"><h2>Matérias do app</h2><p class="sub" style="margin-top:0">Marque quais são da faculdade e se já terminou. Só as da faculdade entram na lista acima.</p>
 ${subs.map(s=>{const m=f.mats.find(x=>x.sid===s.id);return`<div class="lzrow" style="align-items:center"><span><span class="dsc" style="display:inline-block;background:${s.color};margin-right:6px"></span>${E(s.name)}</span><span style="display:flex;gap:12px"><label class="lzck"><input type="checkbox" data-f="sfac" data-id="${s.id}"${m?' checked':''}> Faculdade</label>${m?`<label class="lzck"><input type="checkbox" data-f="sfin" data-id="${s.id}"${m.ok?' checked':''}> Concluída</label>`:''}</span></div>`}).join('')||'<p class="sub">Sem matérias.</p>'}</div></div>`}

const redraw=()=>{if(open)draw()};
function setOk(m,v){m.ok=!!v;if(v)m.foco=false;const s=m.sid&&S.subjects.find(x=>x.id===m.sid);if(s)s.fin=!!v}
function onClick(e){const b=e.target.closest('[data-f]');if(!b||b.tagName==='SELECT'||b.type==='checkbox')return;const a=b.dataset.f,f=F(),m=f.mats.find(x=>x.id===b.dataset.id);
 if(a==='close'){open=false;ov.style.display='none';document.body.style.overflow='';return}
 if(a==='add'){const n=ov.querySelector('#fac-n').value.trim();if(!n){toast('Digite o nome da matéria.');return}
  const o={id:'f'+Date.now().toString(36),nome:n.slice(0,60),of:ov.querySelector('#fac-o').value,dep:[],ok:false,foco:false};setOk(o,ov.querySelector('#fac-d').checked);f.mats.push(o)}
 else if(a==='ok'&&m)setOk(m,!m.ok);
 else if(a==='foco'&&m)m.foco=!m.foco;
 else if(a==='del'&&m){if(!confirm('Remover "'+m.nome+'" da faculdade?'))return;f.mats=f.mats.filter(x=>x!==m);f.mats.forEach(x=>x.dep=(x.dep||[]).filter(d=>d!==m.id));const s=m.sid&&S.subjects.find(x=>x.id===m.sid);if(s){delete s.fac;delete s.fin}}
 else return;save();draw()}
function onChange(e){const t=e.target,a=t.dataset.f,f=F();
 if(t.id==='fac-fim'){const v=t.value.trim();if(v&&parseSem(v)==null){toast('Use o formato 2028/1 ou 2028/2.');t.value=f.fim;return}f.fim=v;save();draw();return}
 if(t.id==='fac-dt'){f.dataFim=t.value;save();draw();return}
 if(!a)return;const id=t.dataset.id,m=f.mats.find(x=>x.id===id);
 if(a==='of'&&m)m.of=t.value;
 else if(a==='dep'&&m){const d=t.dataset.d;m.dep=(m.dep||[]).filter(x=>x!==d);if(t.checked)m.dep.push(d)}
 else if(a==='sfac'){const s=S.subjects.find(x=>x.id===id);if(!s)return;
  if(t.checked){s.fac=true;if(!f.mats.some(x=>x.sid===id))f.mats.push({id:'f'+Date.now().toString(36),sid:id,nome:s.name,of:'todo',dep:[],ok:!!s.fin,foco:false})}
  else{const x=f.mats.find(y=>y.sid===id);if(x){f.mats=f.mats.filter(y=>y!==x);f.mats.forEach(y=>y.dep=(y.dep||[]).filter(d=>d!==x.id))}delete s.fac;delete s.fin}}
 else if(a==='sfin'){const x=f.mats.find(y=>y.sid===id);if(x)setOk(x,t.checked)}
 else return;save();draw()}

function openFac(){open=true;mk().style.display='block';document.body.style.overflow='hidden';draw();ov.scrollTop=0}
function addBtn(){const t=document.querySelector('.tools');if(!t||document.getElementById('fac-btn'))return;
 const b=document.createElement('button');b.className='btn';b.id='fac-btn';b.type='button';b.textContent='🎓 Faculdade';b.addEventListener('click',openFac);t.insertBefore(b,t.firstChild)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addBtn);else addBtn();
window.__faculdade={open:openFac};
})();
