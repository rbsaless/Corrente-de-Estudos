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
 const P=M.filter(m=>!m.ok),end=fim!=null?Math.max(fim,cur):cur+12,kids={};
 P.forEach(m=>m.dep.forEach(d=>{if(by[d]&&!by[d].ok)(kids[d]=kids[d]||[]).push(m.id)}));
 const desc=id=>{const s=new Set(),st=[id];while(st.length){const x=st.pop();(kids[x]||[]).forEach(k=>{if(!s.has(k)){s.add(k);st.push(k)}})}return s.size};
 const off=m=>{let n=0;for(let i=cur;i<=end;i++)if(offered(m,i))n++;return n};
 const info={};P.forEach(m=>info[m.id]={d:desc(m.id),o:off(m)});
 const sc=m=>(m.foco?100:0)+(m.cur?50:0)+info[m.id].d*10+(10-Math.min(10,info[m.id].o));
 const sem={},cnt={},list={};
 P.filter(m=>m.cur).forEach(m=>{sem[m.id]=cur;cnt[cur]=(cnt[cur]||0)+1});
 for(let i=cur;i<=end;i++){
  const cand=P.filter(m=>!(m.id in sem)&&offered(m,i)&&m.dep.every(d=>!by[d]||by[d].ok||(d in sem&&sem[d]<i))).sort((a,b)=>sc(b)-sc(a));
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
 if(!(m.id in P.sem))w.push('não cabe no prazo');else if(i.o<=2)w.push('só '+i.o+' oferta'+(i.o===1?'':'s')+' até o prazo');
 if(gRisk(gInfo(m))==='hi')w.push('a nota exigida nas avaliações restantes é alta');
 return w}

/* ---------- integração: prioridade do app (plano semanal, motivos) ---------- */
function boost(s){const f=F(),m=f.mats.find(x=>x.sid===s.id&&!x.ok);if(!m)return{m:1,why:''};
 const P=getPlan(),i=P.info[m.id]||{d:0},w=[];let k=1;
 if(m.foco){k*=1.8;w.push('🎯 foco da faculdade')}else if(m.cur){k*=1.4;w.push('cursando na faculdade')}
 if(i.d>0){k*=1+Math.min(.5,.15*i.d);w.push('trava '+i.d+' matéria'+(i.d>1?'s':'')+' da faculdade')}
 if(!(m.id in P.sem)){k*=1.3;w.push('não cabe no prazo da faculdade')}
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
 return A.slice(0,5)}
function brief(){const f=F();if(!f.mats.length&&!f.fim)return'';const P=getPlan(),pend=f.mats.filter(m=>!m.ok).length,fc=f.mats.filter(m=>m.foco&&!m.ok).map(m=>m.nome);
 return'• Faculdade: '+(f.fim?'até '+f.fim+' · ':'')+pend+' pendente'+(pend===1?'':'s')+' · '+RK[P.risk][1].toLowerCase()+(fc.length?' · foco: '+fc.join(', '):'')}
function answer(){const f=F(),P=getPlan();if(!f.mats.length&&!f.fim)return{t:'Você ainda não cadastrou nada na Faculdade. Abra o botão 🎓 Faculdade, defina o semestre final e marque as matérias.',m:'care'};
 const L=[],pend=f.mats.filter(m=>!m.ok),ok=f.mats.filter(m=>m.ok),left=P.fim!=null?Math.max(0,P.fim-P.cur+1):null;
 L.push('🎓 Faculdade · agora '+lbl(P.cur)+(f.fim?' · fim em '+f.fim+' ('+left+' semestre'+(left===1?'':'s')+', contando o atual)':'')+(f.dataFim?' · data final '+bd(f.dataFim):''));
 L.push(RK[P.risk][0]+' '+RK[P.risk][1]+' · '+pend.length+' pendente'+(pend.length===1?'':'s')+', '+ok.length+' concluída'+(ok.length===1?'':'s'));
 const fc=pend.filter(m=>m.foco),cu=pend.filter(m=>m.cur&&!m.foco);
 if(fc.length)L.push('🎯 Foco: '+fc.map(m=>m.nome).join(', '));if(cu.length)L.push('📚 Cursando: '+cu.map(m=>m.nome).join(', '));
 const gar=pend.filter(m=>(P.info[m.id]||{}).d>0).sort((a,b)=>P.info[b.id].d-P.info[a.id].d).slice(0,3);
 if(gar.length)L.push('🚧 Gargalos: '+gar.map(m=>m.nome+' (libera '+P.info[m.id].d+')').join(', '));
 if(P.un.length)L.push('⚠️ Não cabem no prazo: '+P.un.map(m=>m.nome).join(', '));
 pend.filter(m=>m.cur||m.foco).forEach(m=>{const g=gInfo(m);if(!g.none)L.push('📝 '+m.nome+': '+gTxt(g).replace(/<\/?b>/g,''))});
 const nx=P.list[P.cur+1];if(nx&&nx.length)L.push('Próximo semestre ('+lbl(P.cur+1)+'): '+nx.map(m=>m.nome).join(', '));
 return{t:L.join('\n'),m:P.risk==='red'?'push':'care'}}
function ctx(){const f=F(),P=getPlan();return{semestre_atual:lbl(P.cur),semestre_final:f.fim||null,data_final:f.dataFim||null,risco_do_prazo:RK[P.risk][1],maximo_materias_por_semestre:f.maxSem,nota_minima_padrao:f.minG,
 materias:f.mats.map(m=>{const g=gInfo(m),fi=falInfo(m),i=P.info[m.id];return{nome:m.nome,concluida:!!m.ok,cursando:!!m.cur,foco:!!m.foco,reprovacoes:m.rep||0,abre:OF[m.of||'todo'],requer:m.dep.map(d=>(f.mats.find(x=>x.id===d)||{}).nome).filter(Boolean),libera_n_materias:i?i.d:0,ofertas_ate_o_prazo:i?i.o:null,semestre_planejado:m.id in P.sem?lbl(P.sem[m.id]):null,nao_cabe_no_prazo:P.un.includes(m),
  notas:g.none?null:{modo:m.modo==='soma'?'soma de pontos':'média ponderada',atual:g.cur==null?null:+g.cur.toFixed(2),minimo:g.min,situacao:g.st,necessario_nas_restantes:+g.need.toFixed(2),avaliacoes:m.av.map(a=>({nome:a.n,peso_ou_pontos:a.p,nota:a.nota,data:a.dt||null}))},
  faltas:fi?{usadas:fi.fal,limite:fi.lim}:null,entregas:m.ent.filter(e=>!e.ok).map(e=>({nome:e.n,data:e.dt||null}))}}),
 distribuicao:Object.keys(P.list).sort().map(i=>({semestre:lbl(+i),materias:P.list[i].map(m=>m.nome)}))}}

/* ---------- interface ---------- */
let ov=null,open=false;const OPEN=new Set();
function mk(){if(ov)return ov;ov=document.createElement('div');ov.id='fac-ov';
 ov.style.cssText='position:fixed;inset:0;z-index:100;background:var(--bg);color:var(--ink);overflow:auto;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 40px;display:none';
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
function bEnt(m){return`<div style="margin:8px 0">${m.ent.map(e=>`<div class="lzrow" style="align-items:center"><span>${e.ok?'✅ ':''}${E(e.n)}<small>${e.dt?bd(e.dt):'sem data'}</small></span><span style="display:flex;gap:6px"><button class="btn" data-f="entok" data-id="${m.id}" data-e="${e.id}">${e.ok?'Reabrir':'Feito'}</button><button class="ghost danger" data-f="entdel" data-id="${m.id}" data-e="${e.id}">✕</button></span></div>`).join('')}
 <div class="mgr" style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-top:8px"><label style="font-size:.8rem;color:var(--muted)">Marco ou entrega<br><input type="text" id="en-n-${m.id}" maxlength="50" placeholder="Ex.: Entrega da monografia" style="width:190px;${IS}"></label><label style="font-size:.8rem;color:var(--muted)">Data<br><input type="date" id="en-d-${m.id}" style="${IS}"></label>${subj(m)?`<label class="lzck"><input type="checkbox" id="en-t-${m.id}" checked> criar tarefa no app</label>`:''}<button class="btn main" data-f="entadd" data-id="${m.id}">Adicionar</button></div></div>`}
function bOferta(m,f){const others=f.mats.filter(x=>x.id!==m.id),free=S.subjects.filter(s=>!s.arch&&(m.sid===s.id||!f.mats.some(x=>x.sid===s.id)));
 return`<label style="display:block;margin:8px 0;font-size:.85rem;color:var(--muted)">Quando abre<br><select data-f="of" data-id="${m.id}" style="${IS}">${Object.entries(OF).map(([k,v])=>`<option value="${k}"${(m.of||'todo')===k?' selected':''}>${v}</option>`).join('')}</select></label>
 <label style="display:block;margin:8px 0;font-size:.85rem;color:var(--muted)">Ligada à matéria do app<br><select data-f="sid" data-id="${m.id}" style="${IS}"><option value="">— nenhuma —</option>${free.map(s=>`<option value="${s.id}"${m.sid===s.id?' selected':''}>${E(s.name)}</option>`).join('')}</select></label>
 ${others.length?`<div class="sub" style="margin:6px 0 4px">Depende de:</div><div class="wdc">${others.map(o=>`<label><input type="checkbox" data-f="dep" data-id="${m.id}" data-d="${o.id}"${m.dep.includes(o.id)?' checked':''}> ${E(o.nome)}</label>`).join('')}</div>`:''}`}
function bFal(m){const fi=falInfo(m);return`<div class="mgr" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin:8px 0"><label style="font-size:.82rem;color:var(--muted)">Aulas no semestre<br>${inp('aulas',m.id,m.aulas||'',80,'ex.: 60')}</label><label style="font-size:.82rem;color:var(--muted)">Faltas<br>${inp('fal',m.id,m.fal||0,80,'0')}</label></div><p class="sub" style="margin:0">${fi?`Limite de 25%: <b>${fi.lim}</b> faltas · restam <b style="color:${fi.left<=0?'#e5484d':'inherit'}">${Math.max(0,fi.left)}</b>`:'Informe o total de aulas para calcular o limite.'}</p>`}
function card(m,P,f){const i=P.info[m.id]||{d:0,o:0},g=gInfo(m),sem=P.sem[m.id],by=id=>f.mats.find(x=>x.id===id),deps=m.dep.map(by).filter(Boolean),w=m.ok?[]:why(m,P);
 let st;if(m.ok)st=`<b style="color:#00a878">✅ Concluída</b>${m.rep?' · repetida '+m.rep+'×':''}`;
 else if(!(m.id in P.sem))st='<b style="color:#e5484d">⚠️ Não cabe no prazo</b> · '+i.o+' oferta'+(i.o===1?'':'s')+' possíveis';
 else st=(m.cur?'📚 <b>Cursando agora</b>':'Planejada para <b>'+lbl(sem)+'</b>')+' · '+i.o+' oferta'+(i.o===1?'':'s')+' até o fim'+(m.rep?' · repetida '+m.rep+'×':'');
 const fi=falInfo(m),nm=m.ent.filter(e=>!e.ok).length;
 return`<div class="mgc" style="--c:${m.foco?'#f59e0b':'var(--flame)'};${m.foco?'border:2px solid #f59e0b':''}"><div class="mgh"><div class="mgt">${m.foco?'🎯 ':''}${E(m.nome)}${m.sid?' <small>ligada à matéria do app</small>':''}<small>${OF[m.of||'todo']}${deps.length?' · Requer: '+deps.map(d=>E(d.nome)+(d.ok?' ✓':'')).join(', '):''}</small></div>
 <div class="acts" style="flex-wrap:wrap">${m.ok?'':`<button class="btn${m.cur?' main':''}" data-f="cur" data-id="${m.id}">📚 Cursando</button><button class="btn${m.foco?' main':''}" data-f="foco" data-id="${m.id}">🎯 Foco</button>`}<button class="btn" data-f="ok" data-id="${m.id}">${m.ok?'Reabrir':'Concluí'}</button>${m.cur||m.ok?`<button class="ghost" data-f="rep" data-id="${m.id}">Reprovei</button>`:''}<button class="ghost danger" data-f="del" data-id="${m.id}">✕</button></div></div>
 <p class="mgm" style="color:var(--ink)">${st}${w.length&&!m.ok?'<br><span class="sub">Por quê: '+E(w.join(' · '))+'</span>':''}${!g.none?'<br><span class="sub">📝 '+gTxt(g)+'</span>':''}${fi&&(m.cur||fi.fal>0)?`<br><span class="sub">🪑 ${fi.fal}/${fi.lim} faltas</span>`:''}</p>
 ${det(m.id+':n','📝 Notas e pesos'+(m.av.length?' ('+m.av.length+')':''),bNotas(m))}${det(m.id+':e','📌 Marcos e entregas'+(nm?' ('+nm+')':''),bEnt(m))}${det(m.id+':f','🪑 Faltas',bFal(m))}${det(m.id+':o','⚙️ Oferta, matéria do app e pré-requisitos',bOferta(m,f))}</div>`}

function draw(){const f=F(),el=mk(),P=plan(f);memo={t:Date.now(),v:P};const cur=P.cur,M=f.mats,pend=M.filter(m=>!m.ok).sort((a,b)=>P.sc(b)-P.sc(a)),ok=M.filter(m=>m.ok);
 const left=P.fim!=null?Math.max(0,P.fim-cur+1):null,rk=RK[P.risk];let dl='';
 if(f.dataFim){const n=Math.ceil((new Date(f.dataFim+'T12:00:00')-new Date())/864e5);dl=n>=0?n+' dias até a data final':'data final já passou'}
 const prio=pend.map(m=>({m,w:why(m,P)})).filter(o=>o.w.length).slice(0,4);
 const rows=[];for(let i=cur;i<=Math.min(P.end,cur+11);i++){const L=P.list[i]||[],full=L.length>=f.maxSem;
  rows.push(`<div class="lzrow"><span><b>${lbl(i)}</b>${i===cur?' (atual)':''}${i===P.fim?' · 🏁 final':''}<small>${L.length}/${f.maxSem} matérias${full?' · cheio':''}</small></span><span style="text-align:right;max-width:62%">${L.map(m=>(m.foco?'🎯 ':'')+E(m.nome)).join(', ')||'<small>livre</small>'}</span></div>`)}
 const subs=S.subjects.filter(s=>!s.arch);
 el.innerHTML=`<div style="max-width:900px;margin:0 auto"><div class="ptop" style="position:static"><button class="btn" data-f="close">← Início</button><h1>🎓 Faculdade</h1></div>
 <div class="mgs" style="border-left:6px solid ${rk[2]}"><h2>${rk[0]} ${rk[1]}</h2><div class="mgf"><div class="mgr"><label>Semestre final (ex.: 2028/1)<input type="text" id="fac-fim" value="${E(f.fim)}" placeholder="2028/1" maxlength="6" style="width:110px;${IS}"></label><label>Data final (editável)<input type="date" id="fac-dt" value="${E(f.dataFim)}" style="${IS}"></label><label>Máx. matérias por semestre<input type="number" id="fac-mx" min="1" max="12" value="${f.maxSem}" style="width:80px"></label><label>Nota mínima padrão<input type="text" id="fac-mg" value="${f1(f.minG)}" style="width:80px;${IS}"></label></div></div>
 <p class="sub" style="margin:10px 0 0">Agora: <b>${lbl(cur)}</b>${P.fim!=null?` · Faltam <b>${left} semestre${left===1?'':'s'}</b> (inclui o atual)${P.slack!=null&&!P.un.length?` · folga de ${P.slack} semestre${P.slack===1?'':'s'}`:''}`:' · defina o semestre final'}${dl?' · '+dl:''}<br>${pend.length} pendente${pend.length===1?'':'s'} · ${ok.length} concluída${ok.length===1?'':'s'}${P.un.length?` · <b style="color:#e5484d">${P.un.length} não cabe${P.un.length===1?'':'m'} no prazo</b>`:''}</p></div>
 ${prio.length?`<div class="mgs"><h2>📚 Estude por causa da faculdade</h2><p class="sub" style="margin-top:0">Essas prioridades já entram no plano semanal e nos alertas da Lumi.</p>${prio.map(o=>{const w7=wkMin(o.m);return`<div class="chinfo"><b>${E(o.m.nome)}</b>${w7!=null?` <small>· ${hh(w7)} estudados em 7 dias</small>`:''}<br><span class="sub">${E(o.w.join(' · '))}</span></div>`}).join('')}</div>`:''}
 <div class="mgs"><h2>🗓️ Distribuição pelos semestres</h2>${rows.join('')||'<p class="sub">Defina o semestre final.</p>'}${P.un.length?`<div class="chinfo bad"><b>Não encaixam até o prazo:</b> ${P.un.map(m=>E(m.nome)).join(', ')}</div>`:''}<p class="sub" style="margin:8px 0 0;font-size:.8rem">Respeita pré-requisitos, quando cada matéria abre e o máximo por semestre. Cursando e foco entram primeiro; gargalos têm prioridade.</p></div>
 <div class="mgs"><h2>Nova matéria</h2><div class="mgf"><div class="mgr"><label style="flex:1 1 200px">Nome<input type="text" id="fac-n" maxlength="60" style="${IS}"></label><label>Quando abre<select id="fac-o" style="${IS}">${Object.entries(OF).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="lzck"><input type="checkbox" id="fac-d"> Já concluída</label></div><button class="btn main" data-f="add">Adicionar</button></div></div>
 <div class="mgs"><h2>📌 Pendentes</h2>${pend.map(m=>card(m,P,f)).join('')||'<p class="sub">Nada pendente.</p>'}</div>
 <div class="mgs"><h2>✅ Concluídas</h2>${ok.map(m=>card(m,P,f)).join('')||'<p class="sub">Nenhuma ainda.</p>'}</div>
 <div class="mgs"><h2>Matérias do app</h2><p class="sub" style="margin-top:0">Marque quais são da faculdade e se já terminou. Só as da faculdade entram na lista acima.</p>
 ${subs.map(s=>{const m=M.find(x=>x.sid===s.id);return`<div class="lzrow" style="align-items:center"><span><span class="dsc" style="display:inline-block;background:${s.color};margin-right:6px"></span>${E(s.name)}</span><span style="display:flex;gap:12px"><label class="lzck"><input type="checkbox" data-f="sfac" data-id="${s.id}"${m?' checked':''}> Faculdade</label>${m?`<label class="lzck"><input type="checkbox" data-f="sfin" data-id="${s.id}"${m.ok?' checked':''}> Concluída</label>`:''}</span></div>`}).join('')||'<p class="sub">Sem matérias.</p>'}</div></div>`}

function setOk(m,v){m.ok=!!v;if(v){m.foco=false;m.cur=false}const s=subj(m);if(s)s.fin=!!v}
function mkTask(m,name,date,exam){const s=subj(m);if(!s)return'';const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);(s.topics=s.topics||[]).push({id,name,date:date||'',prio:'media',est:0,done:false,doneAt:'',note:'',exam:!!exam});return id}
const done=()=>{bust();save();draw();try{render()}catch(e){}};
function onClick(e){const b=e.target.closest('[data-f]');if(!b||/^(INPUT|SELECT|TEXTAREA)$/.test(b.tagName))return;const a=b.dataset.f,f=F(),m=f.mats.find(x=>x.id===b.dataset.id),q=id=>ov.querySelector('#'+id);
 if(a==='close'){open=false;ov.style.display='none';document.body.style.overflow='';try{render()}catch(x){}return}
 if(a==='add'){const n=q('fac-n').value.trim();if(!n){toast('Digite o nome da matéria.');return}
  const o={id:'f'+Date.now().toString(36),nome:n.slice(0,60),of:q('fac-o').value,dep:[],av:[],ent:[],ok:false,foco:false,cur:false};setOk(o,q('fac-d').checked);f.mats.push(o)}
 else if(!m)return;
 else if(a==='ok')setOk(m,!m.ok);
 else if(a==='foco'){m.foco=!m.foco;if(m.foco)m.cur=true}
 else if(a==='cur'){m.cur=!m.cur;if(!m.cur)m.foco=false}
 else if(a==='rep'){if(!confirm('Marcar "'+m.nome+'" como reprovada? Ela volta a pendente, as notas e faltas deste semestre são zeradas e o prazo é recalculado.'))return;m.rep=(m.rep||0)+1;setOk(m,false);m.cur=false;m.foco=false;m.av=[];m.fal=0}
 else if(a==='del'){if(!confirm('Remover "'+m.nome+'" da faculdade?'))return;f.mats=f.mats.filter(x=>x!==m);f.mats.forEach(x=>x.dep=x.dep.filter(d=>d!==m.id));const s=subj(m);if(s){delete s.fac;delete s.fin}}
 else if(a==='avadd'){const n=q('av-n-'+m.id).value.trim(),p=nu(q('av-p-'+m.id).value),d=q('av-d-'+m.id).value,c=q('av-t-'+m.id);
  if(!n){toast('Dê um nome à avaliação.');return}if(!(p>0)){toast('Informe um peso (ou pontos) maior que zero.');return}
  const av={id:'a'+Date.now().toString(36),n:n.slice(0,40),p,nota:null,dt:d||''};if(c&&c.checked&&d)av.tid=mkTask(m,n+' ('+m.nome+')',d,true);m.av.push(av)}
 else if(a==='avdel')m.av=m.av.filter(x=>x.id!==b.dataset.av);
 else if(a==='entadd'){const n=q('en-n-'+m.id).value.trim(),d=q('en-d-'+m.id).value,c=q('en-t-'+m.id);if(!n){toast('Dê um nome ao marco.');return}
  const en={id:'e'+Date.now().toString(36),n:n.slice(0,50),dt:d||'',ok:false};if(c&&c.checked)en.tid=mkTask(m,n,d,false);m.ent.push(en)}
 else if(a==='entok'){const en=m.ent.find(x=>x.id===b.dataset.e);if(en)en.ok=!en.ok}
 else if(a==='entdel')m.ent=m.ent.filter(x=>x.id!==b.dataset.e);
 else return;done()}
function onChange(e){const t=e.target,a=t.dataset.f,f=F();
 if(t.id==='fac-fim'){const v=t.value.trim();if(v&&parseSem(v)==null){toast('Use o formato 2028/1 ou 2028/2.');t.value=f.fim;return}f.fim=v;done();return}
 if(t.id==='fac-dt'){f.dataFim=t.value;done();return}
 if(t.id==='fac-mx'){f.maxSem=Math.max(1,Math.min(12,parseInt(t.value)||6));done();return}
 if(t.id==='fac-mg'){const v=nu(t.value);if(v>0)f.minG=v;done();return}
 if(!a)return;const id=t.dataset.id,m=f.mats.find(x=>x.id===id);
 if(a==='sfac'){const s=S.subjects.find(x=>x.id===id);if(!s)return;
  if(t.checked){s.fac=true;if(!f.mats.some(x=>x.sid===id))f.mats.push({id:'f'+Date.now().toString(36),sid:id,nome:s.name,of:'todo',dep:[],av:[],ent:[],ok:!!s.fin,foco:false,cur:false})}
  else{const x=f.mats.find(y=>y.sid===id);if(x){f.mats=f.mats.filter(y=>y!==x);f.mats.forEach(y=>y.dep=y.dep.filter(d=>d!==x.id))}delete s.fac;delete s.fin}done();return}
 if(a==='sfin'){const x=f.mats.find(y=>y.sid===id);if(x)setOk(x,t.checked);done();return}
 if(!m)return;
 if(a==='of')m.of=t.value;
 else if(a==='modo')m.modo=t.value;
 else if(a==='dep'){const d=t.dataset.d;m.dep=m.dep.filter(x=>x!==d);if(t.checked)m.dep.push(d)}
 else if(a==='sid'){const old=subj(m);if(old){delete old.fac;delete old.fin}m.sid=t.value||undefined;const s=subj(m);if(s){s.fac=true;s.fin=!!m.ok}}
 else if(a==='min'){const v=nu(t.value);if(v==null)delete m.min;else m.min=v}
 else if(a==='max'){const v=nu(t.value);if(v>0)m.max=v;else delete m.max}
 else if(a==='aulas'){const v=nu(t.value);m.aulas=v>0?Math.round(v):0}
 else if(a==='fal'){const v=nu(t.value);m.fal=v>0?Math.round(v):0}
 else if(a==='nota'){const av=m.av.find(x=>x.id===t.dataset.av);if(!av)return;const v=nu(t.value);av.nota=v==null?null:Math.max(0,v)}
 else return;done()}

function openFac(){open=true;mk().style.display='block';document.body.style.overflow='hidden';draw();ov.scrollTop=0}
function addBtn(){const t=document.querySelector('.tools');if(!t||document.getElementById('fac-btn'))return;
 const b=document.createElement('button');b.className='btn';b.id='fac-btn';b.type='button';b.textContent='🎓 Faculdade';b.addEventListener('click',openFac);t.insertBefore(b,t.firstChild)}
function home(){const f=F(),a=document.getElementById('panel'),old=document.getElementById('fac-home');
 if(!a||(!f.mats.length&&!f.fim)){if(old)old.remove();return}
 const P=getPlan(),rk=RK[P.risk],pend=f.mats.filter(m=>!m.ok),fc=pend.filter(m=>m.foco).map(m=>m.nome),left=P.fim!=null?Math.max(0,P.fim-P.cur+1):null;
 let el=old;if(!el){el=document.createElement('div');el.id='fac-home';a.parentNode.insertBefore(el,a);el.addEventListener('click',openFac)}
 el.innerHTML=`<div class="pn" style="cursor:pointer;border-left:6px solid ${rk[2]}"><div class="dpt"><h3>🎓 Faculdade · ${rk[0]} ${rk[1]}</h3><span class="sub">${f.fim?'até '+E(f.fim)+' · '+left+' sem.':''}</span></div><p class="sub" style="margin:6px 0 0">${pend.length} pendente${pend.length===1?'':'s'}${fc.length?' · 🎯 '+E(fc.join(', ')):''}${P.un.length?' · <b style="color:#e5484d">'+P.un.length+' fora do prazo</b>':''}</p></div>`}
/* ganchos no app */
const _r=render;render=function(){const r=_r.apply(this,arguments);try{home()}catch(e){console.error('Faculdade:',e)}return r};
const _rf=renderFeed;renderFeed=function(){_rf.apply(this,arguments);try{const el=document.getElementById('coach-sec');if(!el||curPage!=='feed')return;const f=F();if(!f.mats.length&&!f.fim)return;
 const P=getPlan(),pend=f.mats.filter(m=>!m.ok).sort((a,b)=>P.sc(b)-P.sc(a)).slice(0,3);
 el.insertAdjacentHTML('afterbegin',`<div class="mgs"><h2>🎓 Prioridades da faculdade</h2>${pend.map(m=>`<div class="chinfo" style="border-left:4px solid ${m.foco?'#f59e0b':'var(--line)'}"><b>${E(m.nome)}</b><br><span class="sub">${E(why(m,P).join(' · ')||'Sem urgência especial.')}</span></div>`).join('')||'<p class="sub">Tudo concluído. 🎉</p>'}</div>`)}catch(e){console.error('Faculdade:',e)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addBtn);else addBtn();
window.__fac={open:openFac,alerts,brief,answer,ctx};
})();
