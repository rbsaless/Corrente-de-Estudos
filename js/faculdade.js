/* ===== Faculdade v3: tela sobreposta (sem rota/hash) + integração com plano, Lumi, Coach e início ===== */
(()=>{
const E=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SEM=(y,n)=>y*2+(n-1),lbl=i=>Math.floor(i/2)+'/'+(i%2+1);
const parseSem=t=>{const m=/^(\d{4})\/([12])$/.exec(t||'');return m?SEM(+m[1],+m[2]):null};
const curIdx=()=>{const d=new Date();return SEM(d.getFullYear(),d.getMonth()<7?1:2)};
const nu=v=>{v=String(v==null?'':v).trim().replace(',','.');if(v==='')return null;const n=parseFloat(v);return isFinite(n)?n:null};
const f1=v=>String(Math.round(v*100)/100).replace('.',',');
const OF={todo:'Todo semestre',s1:'Só no 1º semestre (anual)',s2:'Só no 2º semestre (anual)'};
const offered=(m,i)=>m.of==='s1'?i%2===0:m.of==='s2'?i%2===1:true;
const IS='background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px;color:var(--ink)';
const F=()=>{const f=S.faculdade=(S.faculdade&&typeof S.faculdade==='object'&&!Array.isArray(S.faculdade))?S.faculdade:{};
 if(!Array.isArray(f.mats))f.mats=[];if(typeof f.fim!=='string')f.fim='';if(typeof f.dataFim!=='string')f.dataFim='';
 f.maxSem=+f.maxSem>0?+f.maxSem:6;f.minG=+f.minG>0?+f.minG:7;
 f.mats.forEach(m=>{m.dep=Array.isArray(m.dep)?m.dep:[];m.av=Array.isArray(m.av)?m.av:[];m.ent=Array.isArray(m.ent)?m.ent:[]});return f};
const subj=m=>m.sid&&S.subjects.find(x=>x.id===m.sid);

/* ---------- notas ---------- */
function gInfo(m){const f=F(),A=m.av||[],min=m.min!=null?m.min:f.minG,sc=m.max||10;if(!A.length)return{none:1,min,sc};
 const d=A.filter(a=>a.nota!=null),r=A.filter(a=>a.nota==null);
 if(m.modo==='soma'){const got=d.reduce((a,x)=>a+x.nota,0),cap=r.reduce((a,x)=>a+x.p,0),need=min-got;
  return{soma:1,cur:got,need:Math.max(0,need),cap,min,sc:A.reduce((a,x)=>a+x.p,0),nr:r.length,st:need<=0?'ok':need>cap+1e-9?'no':'go'}}
 const P=A.reduce((a,x)=>a+x.p,0)||1,got=d.reduce((a,x)=>a+x.nota*x.p,0),pd=d.reduce((a,x)=>a+x.p,0),pr=P-pd,cur=pd?got/pd:null;
 if(pr<=0){return{cur:got/P,min,sc,nr:0,need:0,st:got/P>=min?'ok':'no'}}
 const need=(min*P-got)/pr;return{cur,min,sc,nr:r.length,need:Math.max(0,need),st:need<=0?'ok':need>sc+1e-9?'no':'go'}}
const gRisk=g=>{if(g.none)return null;if(g.st==='no')return'no';if(g.st==='go'){const lim=g.soma?g.cap:g.sc;return g.need>lim*.8?'hi':null}return g.st==='ok'?'ok':null};
function gTxt(g){if(g.none)return'Sem avaliações cadastradas.';
 const s=g.st==='ok'?'✅ nota mínima garantida':g.st==='no'?'⚠️ não alcança mais a nota mínima':g.soma?`precisa de <b>${f1(g.need)}</b> dos ${f1(g.cap)} pontos restantes`:`precisa de média <b>${f1(g.need)}</b> nas ${g.nr} avaliaç${g.nr===1?'ão restante':'ões restantes'}`;
 return(g.soma?`Pontos: <b>${f1(g.cur)}</b> de ${f1(g.sc)}`:`Média atual: <b>${g.cur==null?'—':f1(g.cur)}</b>`)+` · mínimo ${f1(g.min)} · ${s}`}
const falInfo=m=>{const lim=+m.aulas>0?Math.floor(m.aulas*.25):null,fal=+m.fal||0;return lim==null?null:{lim,fal,left:lim-fal}};

/* ---------- planejamento por semestre ---------- */
function plan(f){const cur=curIdx(),fim=parseSem(f.fim),M=f.mats,by={};M.forEach(m=>by[m.id]=m);
 const P=M.filter(m=>!m.ok&&m.tipo!=='proj'),end=fim!=null?Math.max(fim,cur):cur+12,kids={};
 P.forEach(m=>m.dep.forEach(d=>{if(by[d]&&!by[d].ok)(kids[d]=kids[d]||[]).push(m.id)}));
 const desc=id=>{const s=new Set(),st=[id];while(st.length){const x=st.pop();(kids[x]||[]).forEach(k=>{if(!s.has(k)){s.add(k);st.push(k)}})}return s.size};
 const off=m=>{let n=0;for(let i=cur;i<=end;i++)if(offered(m,i))n++;return n};
 const info={};P.forEach(m=>info[m.id]={d:desc(m.id),o:off(m)});
 const sc=m=>(m.foco?100:0)+(m.cur?50:0)+(info[m.id]?info[m.id].d*10+(10-Math.min(10,info[m.id].o)):0);
 const sem={},cnt={},list={};
 P.filter(m=>m.cur).forEach(m=>{sem[m.id]=cur;cnt[cur]=(cnt[cur]||0)+1});
 for(let i=cur;i<=end;i++){
  const cand=P.filter(m=>!(m.id in sem)&&offered(m,i)&&!(m.dsem!=null&&i<=m.dsem)&&m.dep.every(d=>!by[d]||by[d].ok||(d in sem&&sem[d]<i))).sort((a,b)=>sc(b)-sc(a));
  let n=cnt[i]||0;for(const m of cand){if(n>=f.maxSem)break;sem[m.id]=i;n++}cnt[i]=n}
 P.forEach(m=>{if(m.id in sem)(list[sem[m.id]]=list[sem[m.id]]||[]).push(m)});
 const un=P.filter(m=>!(m.id in sem)),last=Math.max(cur,...Object.values(sem));
 const slack=fim!=null?fim-last:null,risk=un.length?'red':(fim==null?'none':slack<=0?'yellow':'green');
 return{cur,fim,end,sem,info,list,cnt,un,last,slack,risk,sc}}
let memo=null;const bust=()=>{memo=null};
const getPlan=()=>(memo&&memo.t>Date.now()-3000)?memo.v:(memo={t:Date.now(),v:plan(F())}).v;
const RK={red:['🔴','Prazo em risco','#e5484d'],yellow:['🟡','Sem folga','#f59e0b'],green:['🟢','No caminho','#00a878'],none:['⚪','Defina o semestre final','var(--muted)']};
const wkMin=m=>{const s=subj(m);if(!s)return null;let a=0;for(let i=0;i<7;i++)a+=s.days[fmt(addD(now(),-i))]||0;return Math.round(a)};
function why(m,P){const i=P.info[m.id]||{d:0,o:0},w=[];
 if(m.foco)w.push('🎯 é seu foco do semestre');else if(m.cur)w.push('você está cursando');
 if(i.d>0)w.push('é pré-requisito de '+i.d+' matéria'+(i.d>1?'s':''));
 if(m.tipo==='proj'){if(m.dl&&!m.ok){const n=diff(fmt(now()),m.dl);w.push(n<0?'prazo do projeto já passou':'prazo do projeto em '+n+' dia'+(n===1?'':'s'))}}else if(!(m.id in P.sem))w.push('não cabe no prazo');else if(i.o<=2)w.push('só '+i.o+' oferta'+(i.o===1?'':'s')+' até o prazo');
 if(gRisk(gInfo(m))==='hi')w.push('a nota exigida nas avaliações restantes é alta');
 return w}

/* ---------- integração: prioridade do app (plano semanal, motivos) ---------- */
function boost(s){const f=F(),m=f.mats.find(x=>x.sid===s.id&&!x.ok);if(!m)return{m:1,why:''};
 const P=getPlan(),i=P.info[m.id]||{d:0},w=[];let k=1;
 if(m.foco){k*=1.8;w.push('🎯 foco da faculdade')}else if(m.cur){k*=1.4;w.push('cursando na faculdade')}
 if(i.d>0){k*=1+Math.min(.5,.15*i.d);w.push('trava '+i.d+' matéria'+(i.d>1?'s':'')+' da faculdade')}
 if(m.tipo!=='proj'&&!(m.id in P.sem)){k*=1.3;w.push('não cabe no prazo da faculdade')}
 if(gRisk(gInfo(m))==='hi'){k*=1.25;w.push('nota mínima exige muito')}
 return{m:k,why:w.join(' · ')}}
const _sf=subjFactor;
subjFactor=function(s){const r=_sf.apply(this,arguments);try{const b=boost(s);if(b.m!==1){r.w*=b.m;r.why=(r.why?r.why+' · ':'')+b.why}}catch(e){console.error('Faculdade:',e)}return r};

/* ---------- textos para Lumi / Coach / início ---------- */
function alerts(){const f=F(),P=getPlan(),A=[],t0=fmt(now());
 if(!f.mats.length&&!f.fim)return A;
 const ask=['Como está minha faculdade?','q:Como está minha faculdade?'];
 if(P.risk==='red')A.push({id:'fac-prazo',sev:3,ic:'🎓',t:P.un.length+' matéria'+(P.un.length>1?'s':'')+' não cabe'+(P.un.length>1?'m':'')+' no prazo da faculdade',d:P.un.slice(0,3).map(m=>m.nome).join(', ')+'. Revise ofertas, pré-requisitos ou o semestre final.',act:ask});
 else if(P.risk==='yellow')A.push({id:'fac-folga',sev:1,ic:'🎓',t:'Faculdade sem folga até '+f.fim,d:'Qualquer matéria perdida empurra a formatura. Priorize os gargalos.',act:ask});
 const gar=f.mats.filter(m=>!m.ok&&(P.info[m.id]||{}).d>=2).sort((a,b)=>P.info[b.id].d-P.info[a.id].d)[0];
 if(gar)A.push({id:'fac-gar',sev:1,ic:'🚧',t:gar.nome+' trava '+P.info[gar.id].d+' matérias',d:'Planejada para '+(gar.id in P.sem?lbl(P.sem[gar.id]):'—')+'. Atrasar aqui atrasa a fila toda.',act:ask});
 f.mats.filter(m=>!m.ok&&(m.foco||m.cur)).forEach(m=>{const w=wkMin(m);
  if(m.foco&&w===0)A.push({id:'fac-foco'+m.id,sev:2,ic:'🎯',t:m.nome+' (foco) sem estudo há 7 dias',d:'É a matéria que você quer passar neste semestre.',act:ask});
  const g=gInfo(m),r=gRisk(g);if(r==='hi'||r==='no')A.push({id:'fac-nota'+m.id,sev:r==='no'?3:2,ic:'📝',t:m.nome+': '+(r==='no'?'nota mínima fora de alcance':'nota exigida alta'),d:gTxt(g).replace(/<\/?b>/g,''),act:ask});
  const fi=falInfo(m);if(fi&&fi.fal>=Math.ceil(fi.lim*.8))A.push({id:'fac-fal'+m.id,sev:fi.left<=0?3:2,ic:'🪑',t:m.nome+': '+(fi.left<=0?'limite de faltas estourado':'poucas faltas restantes'),d:fi.fal+' de '+fi.lim+' faltas permitidas.',act:null});
  m.ent.filter(e=>!e.ok&&e.dt&&diff(t0,e.dt)>=0&&diff(t0,e.dt)<=7).forEach(e=>A.push({id:'fac-ent'+e.id,sev:2,ic:'📌',t:e.n+' ('+m.nome+') em '+diff(t0,e.dt)+' dia'+(diff(t0,e.dt)===1?'':'s'),d:'Entrega da faculdade.',act:null}))});
 f.mats.filter(m=>m.tipo==='proj'&&!m.ok&&m.dl).forEach(m=>{const n=diff(t0,m.dl);if(n<=14)A.push({id:'fac-dl'+m.id,sev:n<=3?3:2,ic:'🧪',t:m.nome+(n<0?' passou do prazo':' tem prazo em '+n+' dia'+(n===1?'':'s')),d:'Projeto da faculdade.',act:null})});
 return A.slice(0,5)}
function brief(){const f=F();if(!f.mats.length&&!f.fim)return'';const P=getPlan(),pend=f.mats.filter(m=>!m.ok&&m.tipo!=='proj').length,pj=f.mats.filter(m=>!m.ok&&m.tipo==='proj').length,fc=f.mats.filter(m=>m.foco&&!m.ok).map(m=>m.nome);
 return'• Faculdade: '+(f.fim?'até '+f.fim+' · ':'')+pend+' pendente'+(pend===1?'':'s')+(pj?' + '+pj+' projeto'+(pj>1?'s':''):'')+' · '+RK[P.risk][1].toLowerCase()+(fc.length?' · foco: '+fc.join(', '):'')}
function answer(){const f=F(),P=getPlan();if(!f.mats.length&&!f.fim)return{t:'Você ainda não cadastrou nada na Faculdade. Abra o botão 🎓 Faculdade, defina o semestre final e marque as matérias.',m:'care'};
 const L=[],pend=f.mats.filter(m=>!m.ok&&m.tipo!=='proj'),ok=f.mats.filter(m=>m.ok&&m.tipo!=='proj'),left=P.fim!=null?Math.max(0,P.fim-P.cur+1):null;
 L.push('🎓 Faculdade · agora '+lbl(P.cur)+(f.fim?' · fim em '+f.fim+' ('+left+' semestre'+(left===1?'':'s')+', contando o atual)':'')+(f.dataFim?' · data final '+bd(f.dataFim):''));
 L.push(RK[P.risk][0]+' '+RK[P.risk][1]+' · '+pend.length+' pendente'+(pend.length===1?'':'s')+', '+ok.length+' concluída'+(ok.length===1?'':'s'));
 const al=f.mats.filter(m=>!m.ok),fc=al.filter(m=>m.foco),cu=al.filter(m=>m.cur&&!m.foco&&m.tipo!=='proj'),pj=al.filter(m=>m.tipo==='proj');
 if(fc.length)L.push('🎯 Foco: '+fc.map(m=>m.nome).join(', '));if(cu.length)L.push('📚 Cursando: '+cu.map(m=>m.nome).join(', '));if(pj.length)L.push('🧪 Projetos: '+pj.map(m=>m.nome+(m.cur?' (em andamento)':'')).join(', '));
 const gar=pend.filter(m=>(P.info[m.id]||{}).d>0).sort((a,b)=>P.info[b.id].d-P.info[a.id].d).slice(0,3);
 if(gar.length)L.push('🚧 Gargalos: '+gar.map(m=>m.nome+' (libera '+P.info[m.id].d+')').join(', '));
 if(P.un.length)L.push('⚠️ Não cabem no prazo: '+P.un.map(m=>m.nome).join(', '));
 al.filter(m=>m.cur||m.foco).forEach(m=>{const g=gInfo(m);if(!g.none)L.push('📝 '+m.nome+': '+gTxt(g).replace(/<\/?b>/g,''))});
 const nx=P.list[P.cur+1];if(nx&&nx.length)L.push('Próximo semestre ('+lbl(P.cur+1)+'): '+nx.map(m=>m.nome).join(', '));
 return{t:L.join('\n'),m:P.risk==='red'?'push':'care'}}
function ctx(){const f=F(),P=getPlan();return{semestre_atual:lbl(P.cur),semestre_final:f.fim||null,data_final:f.dataFim||null,risco_do_prazo:RK[P.risk][1],maximo_materias_por_semestre:f.maxSem,nota_minima_padrao:f.minG,
 materias:f.mats.map(m=>{const g=gInfo(m),fi=falInfo(m),i=P.info[m.id];return{nome:m.nome,tipo:m.tipo==='proj'?'projeto':'matéria',prazo_do_projeto:m.dl||null,concluida:!!m.ok,cursando:!!m.cur,foco:!!m.foco,reprovacoes:m.rep||0,abre:OF[m.of||'todo'],requer:m.dep.map(d=>(f.mats.find(x=>x.id===d)||{}).nome).filter(Boolean),libera_n_materias:i?i.d:0,ofertas_ate_o_prazo:i?i.o:null,semestre_planejado:m.id in P.sem?lbl(P.sem[m.id]):null,nao_cabe_no_prazo:P.un.includes(m),
  notas:g.none?null:{modo:m.modo==='soma'?'soma de pontos':'média ponderada',atual:g.cur==null?null:+g.cur.toFixed(2),minimo:g.min,situacao:g.st,necessario_nas_restantes:+g.need.toFixed(2),avaliacoes:m.av.map(a=>({nome:a.n,peso_ou_pontos:a.p,nota:a.nota,data:a.dt||null}))},
  faltas:fi?{usadas:fi.fal,limite:fi.lim}:null,entregas:m.ent.filter(e=>!e.ok).map(e=>({nome:e.n,data:e.dt||null}))}}),
 distribuicao:Object.keys(P.list).sort().map(i=>({semestre:lbl(+i),materias:P.list[i].map(m=>m.nome)}))}}

/* ---------- interface ---------- */
let ov=null,open=false;const OPEN=new Set();
function mk(){if(ov)return ov;ov=document.createElement('div');ov.id='fac-ov';
 ov.style.cssText='position:fixed;inset:0;z-index:100;background:var(--bg);color:var(--ink);overflow:auto;padding:0 14px 40px;display:none';
 document.body.appendChild(ov);ov.addEventListener('click',onClick);ov.addEventListener('change',onChange);
 ov.addEventListener('toggle',e=>{const k=e.target.dataset&&e.target.dataset.k;if(k){e.target.open?OPEN.add(k):OPEN.delete(k)}},true);return ov}
const det=(k,t,b)=>`<details data-k="${k}"${OPEN.has(k)?' open':''} style="margin-top:6px"><summary class="sub" style="cursor:pointer">${t}</summary>${b}</details>`;
const inp=(a,id,v,w,ph,extra)=>`<input type="text" data-f="${a}" data-id="${id}" ${extra||''} value="${E(v==null?'':v)}" placeholder="${ph||''}" style="width:${w}px;${IS}">`;
function bNotas(m){const g=gInfo(m),soma=m.modo==='soma',sc=m.max||10;
 return`<div style="margin:8px 0"><div class="mgr" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end"><label style="font-size:.82rem;color:var(--muted)">Como a nota é calculada<select data-f="modo" data-id="${m.id}" style="${IS}"><option value="pond"${soma?'':' selected'}>Média ponderada (nota × peso)</option><option value="soma"${soma?' selected':''}>Soma de pontos</option></select></label>
 <label style="font-size:.82rem;color:var(--muted)">Nota mínima<br>${inp('min',m.id,m.min!=null?m.min:'',70,'padrão '+F().minG)}</label>${soma?'':`<label style="font-size:.82rem;color:var(--muted)">Escala máx.<br>${inp('max',m.id,m.max||'',70,'10')}</label>`}</div>
 <p class="sub" style="margin:8px 0">${soma?'Cada avaliação vale N pontos; a nota é a soma dos pontos obtidos.':'Média = soma de (nota × peso) ÷ soma dos pesos. Peso 1 em todas equivale à média simples.'}</p>
 ${m.av.map(a=>`<div class="lzrow" style="align-items:center;gap:8px;flex-wrap:wrap"><span>${E(a.n)}<small>${soma?'vale':'peso'} ${f1(a.p)}${a.dt?' · '+bd(a.dt).slice(0,5):''}</small></span><span style="display:flex;gap:6px;align-items:center">${inp('nota',m.id,a.nota==null?'':a.nota,70,'nota','data-av="'+a.id+'"')}<button class="ghost danger" data-f="avdel" data-id="${m.id}" data-av="${a.id}">✕</button></span></div>`).join('')||''}
 <div class="mgr" style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-top:10px"><label style="font-size:.8rem;color:var(--muted)">Avaliação<br><input type="text" id="av-n-${m.id}" maxlength="40" placeholder="Ex.: Prova 1" style="width:130px;${IS}"></label><label style="font-size:.8rem;color:var(--muted)">${soma?'Pontos':'Peso'}<br><input type="text" id="av-p-${m.id}" value="1" style="width:60px;${IS}"></label><label style="font-size:.8rem;color:var(--muted)">Data<br><input type="date" id="av-d-${m.id}" style="${IS}"></label>${subj(m)?`<label class="lzck"><input type="checkbox" id="av-t-${m.id}" checked> criar prova no calendário</label>`:''}<button class="btn main" data-f="avadd" data-id="${m.id}">Adicionar</button></div>
 <p class="sub" style="margin:10px 0 0">${gTxt(g)}</p></div>`}
function bEnt(m){const sb=subj(m),T=sb?(sb.topics||[]):[],used=new Set([...m.ent,...m.av].map(x=>x.tid).filter(Boolean));
 const rows=m.ent.map(e=>{const tk=e.tid&&T.find(x=>x.id===e.tid);return{k:'e',id:e.id,n:e.n,dt:tk?tk.date:e.dt,ok:tk?!!tk.done:!!e.ok}}).concat(T.filter(x=>!used.has(x.id)).map(x=>({k:'t',id:x.id,n:x.name,dt:x.date,ok:!!x.done}))).sort((a,b)=>(a.ok-b.ok)||(a.dt||'9999').localeCompare(b.dt||'9999'));
 return`<div style="margin:8px 0">${rows.map(e=>`<div class="lzrow" style="align-items:center"><span>${e.ok?'✅ ':''}${E(e.n)}<small>${e.dt?bd(e.dt):'sem data'}${e.k==='t'?' · tarefa do app':''}</small></span><span style="display:flex;gap:6px"><button class="btn" data-f="${e.k==='t'?'topok':'entok'}" data-id="${m.id}" data-e="${e.id}">${e.ok?'Reabrir':'Feito'}</button><button class="ghost danger" data-f="${e.k==='t'?'topdel':'entdel'}" data-id="${m.id}" data-e="${e.id}">✕</button></span></div>`).join('')}
 <div class="mgr" style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-top:8px"><label style="font-size:.8rem;color:var(--muted)">Marco ou entrega<br><input type="text" id="en-n-${m.id}" maxlength="50" placeholder="Ex.: Entrega da monografia" style="width:190px;${IS}"></label><label style="font-size:.8rem;color:var(--muted)">Data<br><input type="date" id="en-d-${m.id}" style="${IS}"></label>${subj(m)?`<label class="lzck"><input type="checkbox" id="en-t-${m.id}" checked> criar tarefa no app</label>`:''}<button class="btn main" data-f="entadd" data-id="${m.id}">Adicionar</button></div></div>`}
function bOf0(m,f){const others=f.mats.filter(x=>x.id!==m.id&&x.tipo!=='proj'),free=S.subjects.filter(s=>!s.arch&&(m.sid===s.id||!f.mats.some(x=>x.sid===s.id)));
 return`<label style="display:block;margin:8px 0;font-size:.85rem;color:var(--muted)">Quando abre<br><select data-f="of" data-id="${m.id}" style="${IS}">${Object.entries(OF).map(([k,v])=>`<option value="${k}"${(m.of||'todo')===k?' selected':''}>${v}</option>`).join('')}</select></label>
 <label style="display:block;margin:8px 0;font-size:.85rem;color:var(--muted)">Ligada à matéria do app<br><select data-f="sid" data-id="${m.id}" style="${IS}"><option value="">— nenhuma —</option>${free.map(s=>`<option value="${s.id}"${m.sid===s.id?' selected':''}>${E(s.name)}</option>`).join('')}</select></label>
 <div class="mgr" style="display:flex;gap:10px;flex-wrap:wrap;margin:8px 0"><label style="font-size:.8rem;color:var(--muted)">Prova final (data)<br><input type="date" data-f="pfdt" data-id="${m.id}" value="${E(m.pfdt||'')}" style="${IS}"></label><label style="font-size:.8rem;color:var(--muted)">Média mínima c/ final<br><input type="text" data-f="fmin" data-id="${m.id}" value="${f1(m.fmin!=null?m.fmin:5)}" style="width:70px;${IS}"></label><label style="font-size:.8rem;color:var(--muted)">Questões feitas<br><input type="text" data-f="qf" data-id="${m.id}" value="${m.qf||''}" style="width:80px;${IS}"></label><label style="font-size:.8rem;color:var(--muted)">Acertos<br><input type="text" data-f="qa" data-id="${m.id}" value="${m.qa||''}" style="width:80px;${IS}"></label></div>
 ${others.length?`<div class="sub" style="margin:6px 0 4px">Depende de:</div><div class="wdc">${others.map(o=>`<label><input type="checkbox" data-f="dep" data-id="${m.id}" data-d="${o.id}"${m.dep.includes(o.id)?' checked':''}> ${E(o.nome)}</label>`).join('')}</div>`:''}`}
function bFal(m){const fi=falInfo(m);return`<div class="mgr" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin:8px 0"><label style="font-size:.82rem;color:var(--muted)">Aulas no semestre<br>${inp('aulas',m.id,m.aulas||'',80,'ex.: 60')}</label><label style="font-size:.82rem;color:var(--muted)">Faltas<br>${inp('fal',m.id,m.fal||0,80,'0')}</label></div><p class="sub" style="margin:0">${fi?`Limite de 25%: <b>${fi.lim}</b> faltas · restam <b style="color:${fi.left<=0?'#e5484d':'inherit'}">${Math.max(0,fi.left)}</b>`:'Informe o total de aulas para calcular o limite.'}</p>`}
const tipoSel=m=>`<label style="display:block;margin:8px 0;font-size:.85rem;color:var(--muted)">Tipo<br><select data-f="tipo" data-id="${m.id}" style="${IS}"><option value="">Matéria</option><option value="proj"${m.tipo==='proj'?' selected':''}>Projeto (sem oferta nem prazo de semestre)</option></select></label>`;
function bOferta(m,f){if(m.tipo!=='proj')return tipoSel(m)+bOf0(m,f);const free=S.subjects.filter(s=>!s.arch&&(m.sid===s.id||!f.mats.some(x=>x.sid===s.id)));
 return tipoSel(m)+`<label style="display:block;margin:8px 0;font-size:.85rem;color:var(--muted)">Prazo (opcional)<br><input type="date" data-f="dl" data-id="${m.id}" value="${E(m.dl||'')}" style="${IS}"></label><label style="display:block;margin:8px 0;font-size:.85rem;color:var(--muted)">Ligada à matéria do app<br><select data-f="sid" data-id="${m.id}" style="${IS}"><option value="">— nenhuma —</option>${free.map(s=>`<option value="${s.id}"${m.sid===s.id?' selected':''}>${E(s.name)}</option>`).join('')}</select></label>`}
const css=document.createElement('style');css.textContent=`
#fac-ov *{box-sizing:border-box}
.fc-w{max-width:980px;margin:0 auto}
.fc-top{position:sticky;top:0;z-index:5;background:var(--bg);padding:calc(10px + env(safe-area-inset-top,0px)) 0 10px}
.fc-hd{display:flex;align-items:center;gap:12px;margin-bottom:10px}.fc-hd h1{margin:0;font-size:clamp(1.4rem,5vw,2rem);letter-spacing:-.02em}
.fc-tabs{display:flex;gap:4px;overflow-x:auto;padding:4px;background:var(--track);border-radius:14px;scrollbar-width:none}.fc-tabs::-webkit-scrollbar{display:none}
.fc-tabs button{flex:1 0 auto;border:0;background:none;color:var(--muted);font:600 .86rem "DM Sans",sans-serif;padding:9px 13px;border-radius:10px;cursor:pointer;white-space:nowrap}
.fc-tabs button.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 5px rgba(0,0,0,.18)}
.fc-hero{--c:var(--flame);display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;background:linear-gradient(135deg,color-mix(in srgb,var(--c) 16%,var(--surface)),var(--surface) 70%);border:1px solid var(--line);border-radius:28px;padding:22px;margin-bottom:14px}
.fc-hero h2{margin:0 0 4px;font:800 1.5rem "Bricolage Grotesque","DM Sans",sans-serif;letter-spacing:-.01em}
.fc-hero p{margin:0;color:var(--muted);font-size:.92rem}
.fc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.fc-p{display:inline-flex;align-items:center;gap:4px;font-size:.74rem;font-weight:700;padding:3px 10px;border-radius:99px;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 35%,transparent);white-space:nowrap}
.fc-st{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px}
.fc-t{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px}.fc-t b{display:block;font:800 1.9rem/1 "Bricolage Grotesque","DM Sans",sans-serif}.fc-t span{font-size:.78rem;color:var(--muted)}
.fc-sec{background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:18px;margin-bottom:14px}.fc-sec>h2{margin:0 0 10px;font-size:1.1rem}
.fc-pr{border-left:5px solid var(--c);background:var(--bg);border-radius:14px;padding:11px 14px;margin-top:8px}.fc-pr small{color:var(--muted)}
.fc-ft{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.fc-ft button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:99px;padding:6px 14px;font:600 .84rem "DM Sans",sans-serif;cursor:pointer}.fc-ft button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.fc-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:12px;align-items:start}
.fc-c{--c:var(--flame);background:var(--surface);border:1px solid var(--line);border-top:5px solid var(--c);border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:9px}
.fc-c.ok{opacity:.92}.fc-c h3{margin:0;font-size:1.05rem;line-height:1.25}
.fc-row{display:flex;flex-wrap:wrap;gap:5px}.fc-sub{font-size:.82rem;color:var(--muted);margin:0}
.fc-gb{position:relative;height:8px;border-radius:99px;background:var(--track)}.fc-gb i{display:block;height:100%;border-radius:99px;background:var(--c)}.fc-gb b{position:absolute;top:-3px;width:3px;height:14px;background:var(--ink);border-radius:2px}
.fc-ac{display:flex;flex-wrap:wrap;gap:6px}
.fc-b{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:10px;padding:6px 11px;font:600 .8rem "DM Sans",sans-serif;cursor:pointer;min-height:34px}.fc-b.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}.fc-b.dng{color:#e5484d;margin-left:auto}
.fc-c details{border-top:1px solid var(--line);padding-top:6px}.fc-c summary{cursor:pointer;font-size:.84rem;color:var(--muted)}
.fc-sm{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px}
.fc-sc{flex:0 0 200px;background:var(--bg);border:1px solid var(--line);border-radius:18px;padding:12px;display:flex;flex-direction:column;gap:6px}
.fc-sc.now{border:2px solid var(--flame)}.fc-sc.end{border:2px dashed #00a878}.fc-sc.bad{border:2px solid #e5484d;background:color-mix(in srgb,#e5484d 8%,var(--bg))}
.fc-sc h4{margin:0;font-size:.95rem}.fc-sc small{color:var(--muted)}
.fc-i{--c:var(--flame);font-size:.82rem;padding:6px 9px;border-radius:10px;background:var(--surface);border-left:4px solid var(--c)}
.fc-bn{background:color-mix(in srgb,#e5484d 12%,var(--surface));border:1px solid #e5484d;border-radius:16px;padding:12px 14px;margin-bottom:14px}
.fc-em{text-align:center;padding:30px 16px;color:var(--muted)}
@media(max-width:560px){.fc-hero{grid-template-columns:1fr;justify-items:center;text-align:center}.fc-chips{justify-content:center}.fc-g{grid-template-columns:1fr}}`;
document.head.appendChild(css);
{const y=document.createElement('style');y.textContent='.fc-yl{margin-top:18px;background:color-mix(in srgb,#f5c518 22%,var(--surface));border:1px solid #f5c518;border-radius:18px;padding:14px 16px}.fc-yl h2{margin:0 0 4px;font-size:1.1rem}.fc-yr{padding:8px 0;border-top:1px solid color-mix(in srgb,#f5c518 40%,transparent)}.fc-yp{display:inline-block;padding:2px 10px;border-radius:99px;background:var(--surface);border:1px solid var(--line);font-size:.8rem}.fc-yp.pl{background:#f5c518;color:#1a1a1a;border-color:#f5c518;font-weight:700}';y.textContent+='.fc-mc{background:var(--bg);border-left:6px solid var(--c);border-radius:16px;padding:12px 14px;margin-top:10px}.fc-sf{height:8px;border-radius:99px;background:var(--track);overflow:hidden;margin-top:8px}.fc-sf i{display:block;height:100%;background:var(--c);border-radius:99px}';document.head.appendChild(y)}
const SS=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}},SG=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const hashSet=on=>{try{history.replaceState(null,'',on?'#faculdade':location.pathname+location.search)}catch(e){}};
let tab=['home','mat','proj','sem','cfg'].includes(SG('fac-tab'))?SG('fac-tab'):'home',flt='pend';
const pill=(t,c)=>`<span class="fc-p" style="--c:${c}">${t}</span>`;
const ring=(pct,col)=>`<svg viewBox="0 0 120 120" width="124" height="124" aria-label="${pct}% concluído"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--track)" stroke-width="12"/><circle cx="60" cy="60" r="50" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(pct*3.1416).toFixed(1)} 314.2" transform="rotate(-90 60 60)"/><text x="60" y="67" text-anchor="middle" font-size="26" font-weight="800" fill="var(--ink)">${pct}%</text></svg>`;
function card(m,P,f){const i=P.info[m.id]||{d:0,o:0},g=gInfo(m),sem=P.sem[m.id],pr=m.tipo==='proj',s=subj(m),w=m.ok?[]:why(m,P),fi=falInfo(m),nm=m.ent.filter(e=>!e.ok).length;
 const col=m.foco?'#f59e0b':m.ok?'#00a878':(s?s.color:'var(--flame)'),pl=[];
 if(m.ok)pl.push(pill('✅ '+(pr?'Concluído':'Concluída'),'#00a878'));
 if(m.foco)pl.push(pill('🎯 Foco','#f59e0b'));
 if(m.cur&&!m.ok)pl.push(pill(pr?'🧪 Em andamento':'📚 Cursando','#3b82f6'));
 if(!pr&&!m.ok){if(!(m.id in P.sem))pl.push(pill('⚠️ Fora do prazo','#e5484d'));else if(!m.cur)pl.push(pill('🗓️ '+lbl(sem),'var(--muted)'))}
 if(i.d>0)pl.push(pill('🚧 trava '+i.d,'#f59e0b'));
 if(!pr)pl.push(pill(OF[m.of||'todo'].replace(' (anual)',''),'var(--muted)'));
 if(m.rep)pl.push(pill('↻ '+m.rep+'×','#e5484d'));
 if(m.des&&!m.ok)pl.push(pill('🚪 Desistiu em '+lbl(m.dsem!=null?m.dsem:curIdx())+(m.des>1?' ('+m.des+'×)':''),'#f59e0b'));
 if(pr&&m.dl&&!m.ok){const n=diff(fmt(now()),m.dl);pl.push(pill('📅 '+bd(m.dl).slice(0,5)+' ('+n+'d)',n<=7?'#e5484d':'var(--muted)'))}
 if(fi&&(m.cur||fi.fal>0))pl.push(pill('🪑 '+fi.fal+'/'+fi.lim,fi.left<=0?'#e5484d':'var(--muted)'));
 const deps=m.dep.map(id=>f.mats.find(x=>x.id===id)).filter(Boolean),bt=(a,l,on)=>`<button class="fc-b${on?' on':''}" data-f="${a}" data-id="${m.id}">${l}</button>`;
 const bar=!g.none&&g.cur!=null?`<div class="fc-gb"><i style="width:${Math.min(100,g.cur/g.sc*100)}%"></i><b style="left:calc(${Math.min(100,g.min/g.sc*100)}% - 1px)"></b></div>`:'';
 return`<div class="fc-c${m.ok?' ok':''}" style="--c:${col}"><div><h3>${E(m.nome)}</h3>${deps.length&&!pr?`<p class="fc-sub">Requer: ${deps.map(d=>E(d.nome)+(d.ok?' ✓':'')).join(', ')}</p>`:''}</div>
 <div class="fc-row">${pl.join('')}</div>${w.length?`<p class="fc-sub">Por quê: ${E(w.join(' · '))}</p>`:''}${g.none?'':bar+`<p class="fc-sub">📝 ${gTxt(g)}</p>`}
 <div class="fc-ac">${m.ok?bt('ok','Reabrir'):bt('cur',pr?'🧪 Andamento':'📚 Cursando',m.cur)+bt('foco','🎯 Foco',m.foco)+bt('ok',pr?'Concluir':'Concluí')}${!pr&&(m.cur||m.ok)?bt('rep','Reprovei'):''}${!pr&&m.cur&&!m.ok?bt('des','🚪 Desisti'):''}<button class="fc-b dng" data-f="del" data-id="${m.id}" aria-label="Remover">✕</button></div>
 ${det(m.id+':n','📝 Notas e pesos'+(m.av.length?' ('+m.av.length+')':''),bNotas(m))}${det(m.id+':e','📌 Marcos e entregas'+(nm?' ('+nm+')':''),bEnt(m))}${pr?'':det(m.id+':f','🪑 Faltas',bFal(m))}${det(m.id+':o',pr?'⚙️ Tipo, prazo e matéria do app':'⚙️ Tipo, oferta, matéria do app e pré-requisitos',bOferta(m,f))}</div>`}
function semRange(f){const y=new Date().getFullYear(),a=curIdx()%2===0;return{a:f.sIni||(a?y+'-02-01':y+'-08-01'),b:f.sFim||(a?y+'-06-30':y+'-12-15')}}
function matInfo(m){const t=fmt(now()),g=gInfo(m),sb=subj(m),T=(sb?sb.topics||[]:[]).filter(x=>!x.exam),dn=T.filter(x=>x.done).length,pd=T.filter(x=>!x.done),
 estM=pd.reduce((a,x)=>a+(+x.est>0?+x.est:40),0),tp=T.length?dn/T.length*100:null,qa=(m.qf||0)>=5?(m.qa||0)/m.qf*100:null,fi=falInfo(m),
 nx=(m.av||[]).filter(a=>a.nota==null&&a.dt&&a.dt>=t).sort((a,b)=>a.dt<b.dt?-1:1)[0],nd=nx?diff(t,nx.dt):null,fd=m.pfdt&&m.pfdt>=t?diff(t,m.pfdt):null;
 let gs=g.none?55:g.st==='ok'?92:g.st==='no'?(m.pfdt?30:12):Math.max(15,85-g.need/(g.soma?g.cap:g.sc)*65),w=.5,sum=gs*.5;
 if(tp!=null){sum+=tp*.3;w+=.3}if(qa!=null){sum+=qa*.2;w+=.2}let sc=sum/w;
 if(nd!=null&&nd<=7&&tp!=null&&tp<50)sc-=12;if(fi){if(fi.left<=0)sc=Math.min(sc,20);else if(fi.left<=1)sc-=8}
 sc=Math.max(0,Math.min(100,Math.round(sc)));return{g,T,dn,pd,estM,tp,qa,fi,nx,nd,fd,sc}}
function matCard(m){const I=matInfo(m),g=I.g,col=I.sc>=75?'#00a878':I.sc>=50?'#f59e0b':'#e5484d',lab=I.sc>=75?'🟢 Segura':I.sc>=50?'🟡 Atenção':'🔴 Em risco',fm=m.fmin!=null?m.fmin:5;
 let proj;if(g.none)proj='Cadastre as avaliações em Matérias para ver a projeção.';else{proj=gTxt(g);
  if(g.st==='no'){const med=g.cur==null?0:g.cur/g.sc*10,need=Math.max(0,2*fm-med);proj+=`<br>📌 <b>Vai para a final</b>: com média ${f1(med)}, precisa de <b>${f1(need)}</b> na prova final${need>10?' (praticamente fora de alcance)':''} para fechar ${f1(fm)} (considera média entre as notas e a final).`}}
 const ex=I.nx?`📝 <b>${E(I.nx.n)}</b> em ${I.nd===0?'hoje':I.nd+' dia'+pl(I.nd)}`:'Nenhuma prova agendada',fin=I.fd!=null?` · 🏁 final em ${I.fd} dia${pl(I.fd)}`:'';
 let est='';if(I.T.length)est=`Tópicos estudados: <b>${I.dn}/${I.T.length}</b> (${Math.round(I.tp)}%)`+(I.pd.length?` · faltam ${I.pd.length} (≈${hh(I.estM)})`+(I.nd!=null?` → <b>~${hh(Math.ceil(I.estM/Math.max(1,I.nd)))}/dia</b> até a prova`:''):' · tudo visto 🎉');else est='Sem tópicos: crie tarefas/tópicos na matéria para medir seu preparo.';
 const fal=I.fi?` · 🪑 faltas ${I.fi.fal}/${I.fi.lim}`:'',qs=I.qa!=null?` · ✍️ acerto ${Math.round(I.qa)}% em ${m.qf} questões`:'';
 return`<div class="fc-mc" style="--c:${col}"><div class="dpt"><b>${E(m.nome)}</b><span class="fc-p" style="--c:${col}">${lab} · ${I.sc}%</span></div><div class="fc-sf"><i style="width:${I.sc}%"></i></div><p class="fc-sub" style="margin:6px 0">${ex}${fin}${fal}${qs}</p><p class="fc-sub" style="margin:4px 0">${proj}</p><p class="fc-sub" style="margin:4px 0">${est}</p></div>`}
function vNow(X){const{f,P,C}=X,cs=C.filter(m=>m.cur&&!m.ok),R=semRange(f),t=fmt(now()),tot=Math.max(1,diff(R.a,R.b)),el=Math.max(0,Math.min(tot,diff(R.a,t))),pct=Math.round(el/tot*100),left=Math.max(0,diff(t,R.b)),I=cs.map(m=>matInfo(m)),avg=I.length?Math.round(I.reduce((a,x)=>a+x.sc,0)/I.length):null,rk=I.filter(x=>x.sc<50).length;
 return`<div class="fc-hero" style="--c:var(--flame)">${ring(pct,'var(--flame)')}<div><h2>Semestre ${lbl(P.cur)}</h2><p>${left>0?'Faltam <b>'+left+' dia'+pl(left)+'</b> para acabar ('+bd(R.b).slice(0,5)+')':'Semestre encerrado em '+bd(R.b).slice(0,5)} · ${pct}% do tempo decorrido</p><div class="fc-chips">${pill(cs.length+' cursando','var(--muted)')}${avg!=null?pill('segurança média '+avg+'%',avg>=75?'#00a878':avg>=50?'#f59e0b':'#e5484d'):''}${rk?pill('⚠️ '+rk+' em risco','#e5484d'):''}</div></div></div>
 <div class="fc-sec"><h2>📅 Matérias do semestre</h2><p class="fc-sub" style="margin:0 0 8px">Projeção de nota, próxima prova, preparo pelos tópicos e segurança (nota 50%, tópicos 30%, questões 20%). Ajuste datas do semestre em Ajustes e prova final, questões e acertos dentro de cada matéria.</p>${cs.map(matCard).join('')||'<p class="fc-em">Marque matérias como 📚 Cursando para acompanhar aqui.</p>'}</div>`}
function vHome(X){const{f,P,M,C,pend,ok,pj,rk,left,dl}=X;
 if(!M.length&&!f.fim)return`<div class="fc-sec fc-em"><h2 style="color:var(--ink)">Vamos começar 🎓</h2><p>Defina o semestre final e marque quais matérias do app são da faculdade.</p><button class="btn main" data-f="tab" data-v="cfg">Ir para Ajustes</button></div>`;
 const tot=C.length,pct=tot?Math.round(ok.length/tot*100):0,act=pj.filter(m=>!m.ok).length,cu=pend.filter(m=>m.cur).length;
 const prio=M.filter(m=>!m.ok).sort((a,b)=>P.sc(b)-P.sc(a)).map(m=>({m,w:why(m,P)})).filter(o=>o.w.length).slice(0,4),nx=P.list[P.cur+1]||[];

 return vNow(X)+`<div class="fc-hero" style="--c:${rk[2]}">${ring(pct,rk[2]==='var(--muted)'?'var(--flame)':rk[2])}<div><h2>${f.fim?'Rumo a '+E(f.fim):'Defina o semestre final'}</h2><p>${ok.length} de ${tot} matéria${tot===1?'':'s'} concluída${ok.length===1?'':'s'}${P.fim!=null?' · faltam '+left+' semestre'+(left===1?'':'s')+' (inclui o atual)':''}</p>
 <div class="fc-chips">${pill(rk[0]+' '+rk[1],rk[2])}${P.slack!=null&&!P.un.length?pill('folga de '+P.slack+' sem.','var(--muted)'):''}${dl?pill('📅 '+dl,'var(--muted)'):''}</div></div></div>
 ${P.un.length?`<div class="fc-bn"><b>⚠️ Não cabem até o prazo:</b> ${P.un.map(m=>E(m.nome)).join(', ')}<br><span class="fc-sub">Revise ofertas, pré-requisitos, o máximo por semestre ou o semestre final.</span></div>`:''}
 <div class="fc-st"><div class="fc-t"><b>${pend.length}</b><span>Pendentes</span></div><div class="fc-t"><b>${cu}</b><span>Cursando</span></div><div class="fc-t"><b>${act}</b><span>Projetos ativos</span></div><div class="fc-t"><b style="color:${P.un.length?'#e5484d':'inherit'}">${P.un.length}</b><span>Fora do prazo</span></div></div>
 ${prio.length?`<div class="fc-sec"><h2>📚 Estude por causa da faculdade</h2><p class="fc-sub">Essas prioridades já entram no plano semanal e nos alertas da Lumi.</p>${prio.map(o=>{const w7=wkMin(o.m);return`<div class="fc-pr" style="--c:${o.m.foco?'#f59e0b':'var(--flame)'}"><b>${E(o.m.nome)}</b>${w7!=null?` <small>· ${hh(w7)} em 7 dias</small>`:''}<br><small>${E(o.w.join(' · '))}</small></div>`}).join('')}</div>`:''}
 ${nx.length?`<div class="fc-sec"><h2>➡️ Próximo semestre (${lbl(P.cur+1)})</h2><div class="fc-row">${nx.map(m=>pill(E(m.nome),'var(--flame)')).join('')}</div></div>`:''}`}
function vMat(X){const{f,P,C,pend,ok}=X,L=flt==='pend'?pend:flt==='foco'?pend.filter(m=>m.cur||m.foco):flt==='ok'?ok:C.slice().sort((a,b)=>(a.ok-b.ok)||P.sc(b)-P.sc(a)),
 ch=(k,l,n)=>`<button data-f="flt" data-v="${k}" class="${flt===k?'on':''}">${l} (${n})</button>`;
 return`<div class="fc-ft">${ch('pend','Pendentes',pend.length)}${ch('foco','Cursando e foco',pend.filter(m=>m.cur||m.foco).length)}${ch('ok','Concluídas',ok.length)}${ch('all','Todas',C.length)}</div><div class="fc-g">${L.map(m=>card(m,P,f)).join('')||'<p class="fc-em">Nada por aqui.</p>'}</div>`}
function vProj(X){const{f,P,pj}=X;return`<p class="fc-sub" style="margin:0 0 12px">Projetos (TCC, iniciação científica etc.) não têm oferta, pré-requisito nem entram no prazo dos semestres. O prazo é opcional.</p><div class="fc-g">${pj.map(m=>card(m,P,f)).join('')||'<p class="fc-em">Nenhum projeto. Marque "Projeto" em Ajustes › Matérias do app, ou crie um novo.</p>'}</div>`}
function yel(f,P){const L=f.mats.filter(m=>!m.ok&&m.tipo!=='proj'),top=Math.min(P.end,P.cur+11);
 const rows=L.map(m=>{const ops=[];for(let i=P.cur;i<=top;i++)if(offered(m,i)&&!(m.dsem!=null&&i<=m.dsem))ops.push(i);
  return`<div class="fc-yr"><b>${E(m.nome)}</b>${m.des?' <small>🚪 desistida</small>':''}<div class="fc-row">${ops.length?ops.map(i=>`<span class="fc-yp${i===P.sem[m.id]?' pl':''}">${lbl(i)}</span>`).join(''):'<span style="color:#e5484d;font-weight:700">Nenhuma oferta até o prazo</span>'}</div></div>`}).join('');
 return`<div class="fc-yl"><h2>🟡 Onde cada matéria ainda pode ser feita</h2><p class="fc-sub" style="margin:0 0 8px">Semestres em que a matéria é oferecida até o prazo. O destaque é o semestre planejado.${L.some(m=>m.des)?' Desistidas só voltam depois do semestre da desistência.':''}</p>${rows||'<p class="fc-em">Nenhuma matéria pendente.</p>'}</div>`}
function vSem(X){const{f,P}=X,cols=[];
 const PD=f.mats.filter(m=>!m.ok&&m.tipo!=='proj');
 for(let i=P.cur;i<=Math.min(P.end,P.cur+11);i++){const L=P.list[i]||[],Y=PD.filter(m=>P.sem[m.id]!==i&&offered(m,i)&&!(m.dsem!=null&&i<=m.dsem));cols.push(`<div class="fc-sc${i===P.cur?' now':''}${i===P.fim?' end':''}"><h4>${lbl(i)}</h4><small>${i===P.cur?'atual · ':''}${i===P.fim?'🏁 final · ':''}${L.length}/${f.maxSem}</small>${L.map(m=>{const s=subj(m);return`<div class="fc-i" style="--c:${m.foco?'#f59e0b':s?s.color:'var(--flame)'}">${m.foco?'🎯 ':''}${E(m.nome)}</div>`}).join('')}${Y.map(m=>`<div class="fc-i" title="Pode ser feita neste semestre" style="--c:#f5c518;background:color-mix(in srgb,#f5c518 28%,var(--surface));opacity:.9">${E(m.nome)}</div>`).join('')}${L.length||Y.length?'':'<small>livre</small>'}</div>`)}
 if(P.un.length)cols.push(`<div class="fc-sc bad"><h4>⚠️ Fora do prazo</h4><small>${P.un.length} matéria${P.un.length>1?'s':''}</small>${P.un.map(m=>`<div class="fc-i" style="--c:#e5484d">${E(m.nome)}</div>`).join('')}</div>`);
 return`<p class="fc-sub" style="margin:0 0 8px">Respeita pré-requisitos, quando cada matéria abre e o máximo por semestre. Cursando e foco entram primeiro; gargalos têm prioridade.</p><div class="fc-sm">${cols.join('')}</div>`}
function vCfg(X){const{f,P,M}=X,subs=S.subjects.filter(s=>!s.arch);
 return`<div class="fc-sec"><h2>Prazo para terminar</h2><div class="mgf"><div class="mgr"><label>Semestre final (ex.: 2028/1)<input type="text" id="fac-fim" value="${E(f.fim)}" placeholder="2028/1" maxlength="6" style="width:110px;${IS}"></label><label>Data final (editável)<input type="date" id="fac-dt" value="${E(f.dataFim)}" style="${IS}"></label><label>Início do semestre atual<input type="date" id="fac-si" value="${E(f.sIni||'')}" style="${IS}"></label><label>Fim do semestre atual<input type="date" id="fac-sf" value="${E(f.sFim||'')}" style="${IS}"></label><label>Máx. matérias por semestre<input type="number" id="fac-mx" min="1" max="12" value="${f.maxSem}" style="width:80px"></label><label>Nota mínima padrão<input type="text" id="fac-mg" value="${f1(f.minG)}" style="width:80px;${IS}"></label></div></div></div>
 <div class="fc-sec"><h2>Matérias do app</h2><p class="fc-sub" style="margin:0 0 8px">Marque quais são da faculdade, quais são projetos e quais já foram concluídas.</p>
 ${subs.map(s=>{const m=M.find(x=>x.sid===s.id);return`<div class="lzrow" style="align-items:center;flex-wrap:wrap"><span><span class="dsc" style="display:inline-block;background:${s.color};margin-right:6px"></span>${E(s.name)}</span><span style="display:flex;gap:12px;flex-wrap:wrap"><label class="lzck"><input type="checkbox" data-f="sfac" data-id="${s.id}"${m?' checked':''}> Faculdade</label>${m?`<label class="lzck"><input type="checkbox" data-f="sproj" data-id="${s.id}"${m.tipo==='proj'?' checked':''}> Projeto</label><label class="lzck"><input type="checkbox" data-f="sfin" data-id="${s.id}"${m.ok?' checked':''}> Concluída</label>`:''}</span></div>`}).join('')||'<p class="fc-sub">Sem matérias.</p>'}</div>
 <div class="fc-sec"><h2>Nova matéria ou projeto (fora do app)</h2><div class="mgf"><div class="mgr"><label style="flex:1 1 200px">Nome<input type="text" id="fac-n" maxlength="60" style="${IS}"></label><label>Tipo<select id="fac-t" style="${IS}"><option value="">Matéria</option><option value="proj">Projeto</option></select></label><label>Quando abre<select id="fac-o" style="${IS}">${Object.entries(OF).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="lzck"><input type="checkbox" id="fac-d"> Já concluída</label></div><button class="btn main" data-f="add">Adicionar</button></div></div>`}
function draw(){const f=F(),el=mk(),P=plan(f);memo={t:Date.now(),v:P};const M=f.mats,C=M.filter(m=>m.tipo!=='proj'),
 pend=C.filter(m=>!m.ok).sort((a,b)=>P.sc(b)-P.sc(a)),ok=C.filter(m=>m.ok),pj=M.filter(m=>m.tipo==='proj').sort((a,b)=>(a.ok-b.ok)||P.sc(b)-P.sc(a)),
 rk=RK[P.risk],left=P.fim!=null?Math.max(0,P.fim-P.cur+1):null;let dl='';
 if(f.dataFim){const n=Math.ceil((new Date(f.dataFim+'T12:00:00')-new Date())/864e5);dl=n>=0?n+' dias até a data final':'data final já passou'}
 const X={f,P,M,C,pend,ok,pj,rk,left,dl},TB=[['home','🏠 Visão geral'],['mat','📚 Matérias ('+C.length+')'],['proj','🧪 Projetos ('+pj.length+')'],['sem','🗓️ Semestres'],['cfg','⚙️ Ajustes']];
 el.innerHTML=`<div class="fc-w"><div class="fc-top"><div class="fc-hd"><button class="btn" data-f="close">← Início</button><h1>🎓 Faculdade</h1></div><div class="fc-tabs" role="tablist">${TB.map(([k,l])=>`<button type="button" role="tab" data-f="tab" data-v="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div></div>
 ${({home:vHome,mat:vMat,proj:vProj,sem:vSem,cfg:vCfg})[tab](X)}</div>`}
function setTipo(m,p){if(p){m.tipo='proj';m.dep=[];m.of='todo';F().mats.forEach(x=>x.dep=x.dep.filter(d=>d!==m.id))}else delete m.tipo}
function setOk(m,v){m.ok=!!v;if(v){m.foco=false;m.cur=false}const s=subj(m);if(s)s.fin=!!v}
function mkTask(m,name,date,exam){const s=subj(m);if(!s)return'';const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);(s.topics=s.topics||[]).push({id,name,date:date||'',prio:'media',est:0,done:false,doneAt:'',note:'',exam:!!exam});return id}
const tkOf=(m,id)=>{const sb=subj(m);return sb&&(sb.topics||[]).find(x=>x.id===id)},tgl=(tk,v)=>{tk.done=!!v;tk.doneAt=v?fmt(now()):''},rmTk=(m,id)=>{const sb=subj(m);if(sb)sb.topics=(sb.topics||[]).filter(x=>x.id!==id)};
const done=()=>{bust();save();draw();try{render()}catch(e){}};
function onClick(e){const b=e.target.closest('[data-f]');if(!b||/^(INPUT|SELECT|TEXTAREA)$/.test(b.tagName))return;const a=b.dataset.f,f=F(),m=f.mats.find(x=>x.id===b.dataset.id),q=id=>ov.querySelector('#'+id);
 if(a==='close'){open=false;ov.style.display='none';document.body.style.overflow='';SS('fac-open',null);hashSet(false);try{render()}catch(x){}return}
 if(a==='tab'){tab=b.dataset.v;SS('fac-tab',tab);draw();ov.scrollTop=0;return}
 if(a==='flt'){flt=b.dataset.v;draw();return}
 if(a==='add'){const n=q('fac-n').value.trim();if(!n){toast('Digite o nome da matéria.');return}
  const o={id:'f'+Date.now().toString(36),nome:n.slice(0,60),of:q('fac-o').value,dep:[],av:[],ent:[],ok:false,foco:false,cur:false};if(q('fac-t').value==='proj')o.tipo='proj';setOk(o,q('fac-d').checked);f.mats.push(o)}
 else if(!m)return;
 else if(a==='ok')setOk(m,!m.ok);
 else if(a==='foco'){m.foco=!m.foco;if(m.foco)m.cur=true}
 else if(a==='cur'){m.cur=!m.cur;if(!m.cur)m.foco=false}
 else if(a==='des'){if(!confirm('Desistir de "'+m.nome+'" neste semestre? Ela volta a pendente e será replanejada a partir do próximo semestre em que for oferecida.'))return;m.des=(m.des||0)+1;m.dsem=curIdx();setOk(m,false);m.cur=false;m.foco=false;m.av=[];m.fal=0}
 else if(a==='rep'){if(!confirm('Marcar "'+m.nome+'" como reprovada? Ela volta a pendente, as notas e faltas deste semestre são zeradas e o prazo é recalculado.'))return;m.rep=(m.rep||0)+1;setOk(m,false);m.cur=false;m.foco=false;m.av=[];m.fal=0}
 else if(a==='del'){if(!confirm('Remover "'+m.nome+'" da faculdade?'))return;f.mats=f.mats.filter(x=>x!==m);f.mats.forEach(x=>x.dep=x.dep.filter(d=>d!==m.id));const s=subj(m);if(s){delete s.fac;delete s.fin}}
 else if(a==='avadd'){const n=q('av-n-'+m.id).value.trim(),p=nu(q('av-p-'+m.id).value),d=q('av-d-'+m.id).value,c=q('av-t-'+m.id);
  if(!n){toast('Dê um nome à avaliação.');return}if(!(p>0)){toast('Informe um peso (ou pontos) maior que zero.');return}
  const av={id:'a'+Date.now().toString(36),n:n.slice(0,40),p,nota:null,dt:d||''};if(c&&c.checked&&d)av.tid=mkTask(m,n+' ('+m.nome+')',d,true);m.av.push(av)}
 else if(a==='avdel'){const av=m.av.find(x=>x.id===b.dataset.av);if(av&&av.tid)rmTk(m,av.tid);m.av=m.av.filter(x=>x.id!==b.dataset.av)}
 else if(a==='entadd'){const n=q('en-n-'+m.id).value.trim(),d=q('en-d-'+m.id).value,c=q('en-t-'+m.id);if(!n){toast('Dê um nome ao marco.');return}
  const en={id:'e'+Date.now().toString(36),n:n.slice(0,50),dt:d||'',ok:false};if(c&&c.checked)en.tid=mkTask(m,n,d,false);m.ent.push(en)}
 else if(a==='entok'){const en=m.ent.find(x=>x.id===b.dataset.e);if(en){const tk=en.tid&&tkOf(m,en.tid);en.ok=tk?!tk.done:!en.ok;if(tk)tgl(tk,en.ok)}}
 else if(a==='topok'){const tk=tkOf(m,b.dataset.e);if(tk)tgl(tk,!tk.done)}
 else if(a==='topdel'){const sb=subj(m);if(sb)sb.topics=(sb.topics||[]).filter(x=>x.id!==b.dataset.e)}
 else if(a==='entdel'){const en=m.ent.find(x=>x.id===b.dataset.e);if(en&&en.tid)rmTk(m,en.tid);m.ent=m.ent.filter(x=>x.id!==b.dataset.e)}
 else return;done()}
function onChange(e){const t=e.target,a=t.dataset.f,f=F();
 if(t.id==='fac-fim'){const v=t.value.trim();if(v&&parseSem(v)==null){toast('Use o formato 2028/1 ou 2028/2.');t.value=f.fim;return}f.fim=v;done();return}
 if(t.id==='fac-si'||t.id==='fac-sf'){if(t.id==='fac-si')f.sIni=t.value;else f.sFim=t.value;done();return}
  if(t.id==='fac-dt'){f.dataFim=t.value;done();return}
 if(t.id==='fac-mx'){f.maxSem=Math.max(1,Math.min(12,parseInt(t.value)||6));done();return}
 if(t.id==='fac-mg'){const v=nu(t.value);if(v>0)f.minG=v;done();return}
 if(!a)return;const id=t.dataset.id,m=f.mats.find(x=>x.id===id);
 if(a==='sfac'){const s=S.subjects.find(x=>x.id===id);if(!s)return;
  if(t.checked){s.fac=true;if(!f.mats.some(x=>x.sid===id))f.mats.push({id:'f'+Date.now().toString(36),sid:id,nome:s.name,of:'todo',dep:[],av:[],ent:[],ok:!!s.fin,foco:false,cur:false})}
  else{const x=f.mats.find(y=>y.sid===id);if(x){f.mats=f.mats.filter(y=>y!==x);f.mats.forEach(y=>y.dep=y.dep.filter(d=>d!==x.id))}delete s.fac;delete s.fin}done();return}
 if(a==='sproj'){const x=f.mats.find(y=>y.sid===id);if(x)setTipo(x,t.checked);done();return}
 if(a==='sfin'){const x=f.mats.find(y=>y.sid===id);if(x)setOk(x,t.checked);done();return}
 if(!m)return;
 if(a==='of')m.of=t.value;
 else if(a==='modo')m.modo=t.value;
 else if(a==='tipo')setTipo(m,t.value==='proj');
 else if(a==='dl'){if(t.value)m.dl=t.value;else delete m.dl}
  else if(a==='pfdt'){if(t.value)m.pfdt=t.value;else delete m.pfdt}
  else if(a==='fmin'){const v=nu(t.value);if(v>0)m.fmin=v;else delete m.fmin}
  else if(a==='qf'){const v=nu(t.value);m.qf=v>0?Math.round(v):0;if(m.qa>m.qf)m.qa=m.qf}
  else if(a==='qa'){const v=nu(t.value);m.qa=v>0?Math.min(Math.round(v),m.qf||Math.round(v)):0}
 else if(a==='dep'){const d=t.dataset.d;m.dep=m.dep.filter(x=>x!==d);if(t.checked)m.dep.push(d)}
 else if(a==='sid'){const old=subj(m);if(old){delete old.fac;delete old.fin}m.sid=t.value||undefined;const s=subj(m);if(s){s.fac=true;s.fin=!!m.ok}}
 else if(a==='min'){const v=nu(t.value);if(v==null)delete m.min;else m.min=v}
 else if(a==='max'){const v=nu(t.value);if(v>0)m.max=v;else delete m.max}
 else if(a==='aulas'){const v=nu(t.value);m.aulas=v>0?Math.round(v):0}
 else if(a==='fal'){const v=nu(t.value);m.fal=v>0?Math.round(v):0}
 else if(a==='nota'){const av=m.av.find(x=>x.id===t.dataset.av);if(!av)return;const v=nu(t.value);av.nota=v==null?null:Math.max(0,v)}
 else return;done()}

function openFac(){open=true;SS('fac-open','1');hashSet(true);mk().style.display='block';document.body.style.overflow='hidden';draw();ov.scrollTop=0}
function addBtn(){const t=document.querySelector('.tools');if(!t||document.getElementById('fac-btn'))return;
 const b=document.createElement('button');b.className='btn';b.id='fac-btn';b.type='button';b.textContent='🎓 Faculdade';b.addEventListener('click',openFac);const th=document.getElementById('theme');t.insertBefore(b,th?th.nextSibling:t.firstChild)}
function home(){const f=F(),a=document.getElementById('panel'),old=document.getElementById('fac-home');
 if(!a||(!f.mats.length&&!f.fim)){if(old)old.remove();return}
 const P=getPlan(),rk=RK[P.risk],pend=f.mats.filter(m=>!m.ok&&m.tipo!=='proj'),pj=f.mats.filter(m=>!m.ok&&m.tipo==='proj').length,fc=f.mats.filter(m=>!m.ok&&m.foco).map(m=>m.nome),left=P.fim!=null?Math.max(0,P.fim-P.cur+1):null;
 let el=old;if(!el){el=document.createElement('div');el.id='fac-home';a.parentNode.insertBefore(el,a);el.addEventListener('click',openFac)}
 el.innerHTML=`<div class="pn" style="cursor:pointer;border-left:6px solid ${rk[2]}"><div class="dpt"><h3>🎓 Faculdade · ${rk[0]} ${rk[1]}</h3><span class="sub">${f.fim?'até '+E(f.fim)+' · '+left+' sem.':''}</span></div><p class="sub" style="margin:6px 0 0">${pend.length} pendente${pend.length===1?'':'s'}${pj?' · '+pj+' projeto'+(pj===1?'':'s'):''}${fc.length?' · 🎯 '+E(fc.join(', ')):''}${P.un.length?' · <b style="color:#e5484d">'+P.un.length+' fora do prazo</b>':''}</p></div>`}
/* ganchos no app */
const _r=render;render=function(){const r=_r.apply(this,arguments);try{home()}catch(e){console.error('Faculdade:',e)}return r};
const _rf=renderFeed;renderFeed=function(){_rf.apply(this,arguments);try{const el=document.getElementById('coach-sec');if(!el||curPage!=='feed')return;const f=F();if(!f.mats.length&&!f.fim)return;
 const P=getPlan(),pend=f.mats.filter(m=>!m.ok).sort((a,b)=>P.sc(b)-P.sc(a)).slice(0,3);
 el.insertAdjacentHTML('afterbegin',`<div class="mgs"><h2>🎓 Prioridades da faculdade</h2>${pend.map(m=>`<div class="chinfo" style="border-left:4px solid ${m.foco?'#f59e0b':'var(--line)'}"><b>${E(m.nome)}</b><br><span class="sub">${E(why(m,P).join(' · ')||'Sem urgência especial.')}</span></div>`).join('')||'<p class="sub">Tudo concluído. 🎉</p>'}</div>`)}catch(e){console.error('Faculdade:',e)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addBtn);else addBtn();
if(SG('fac-open')==='1'||location.hash==='#faculdade')setTimeout(openFac,0);
window.__fac={open:openFac,alerts,brief,answer,ctx};
})();
