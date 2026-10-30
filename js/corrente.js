/* ===== ETAPA 5: Sobrevivência da Corrente =====
   Desafio de 7 dias seguidos com meta diária fixa (máx. 12h). Lê os minutos já registrados (soma de todas as matérias)
   e é avaliado sempre que o app abre/renderiza. Um desafio por vez; cancelar conta como falha. */
const CH_NIV={
 leve:{n:'Leve',e:'🟢',lo:30,hi:179,def:120,cred:45,xp:0,pct:.10,day:0,debt:30,cast:false,loss:0},
 forte:{n:'Forte',e:'🟠',lo:180,hi:299,def:240,cred:120,xp:0,pct:.20,day:0,debt:60,cast:true,loss:0},
 extremo:{n:'Extremo',e:'🔴',lo:300,hi:720,def:300,cred:0,xp:0,pct:.30,day:1,debt:90,cast:true,loss:.25}};
function chCfg(){const c=S.ch=(S.ch&&typeof S.ch==='object')?S.ch:{};c.since=c.since||Date.now();c.cur=c.cur&&CH_NIV[c.cur.lvl]?c.cur:null;c.hist=Array.isArray(c.hist)?c.hist:[];c.dayoff=Math.max(0,+c.dayoff||0);c.off=Array.isArray(c.off)?c.off:[];c.adj=Array.isArray(c.adj)?c.adj:[];c.pend=Array.isArray(c.pend)?c.pend:[];c.cast=c.cast||null;return c}
const chSum=d=>S.subjects.reduce((a,x)=>a+plOf(x,d),0);
function chAdj(from,to,sg){return chCfg().adj.reduce((a,x)=>x.d>=from&&x.d<=to&&x.v*sg>0?a+x.v:a,0)}
function chCast(){const c=chCfg();return !!c.cast&&fmt(now())<=c.cast}
function chMul(){return chCast()?.5:1}
const chEnd=k=>k.end||fmt(addD(parse(k.start),6));
const chList=k=>{const r=[],e=chEnd(k);for(let d=k.start;d<=e;d=fmt(addD(parse(d),1)))r.push({d,x:(k.ex||[]).includes((parse(d).getDay()+6)%7)});return r};
const chN=k=>chList(k).filter(o=>!o.x).length;
function chScale(L,n,H){const f=n/7,o=Object.assign({},L);o.cred=Math.round(L.cred*f);o.xp=(H!==undefined&&L.pct)?Math.round(H/60*100*L.pct/10)*10:Math.round(L.xp*f/10)*10;o.debt=Math.round(L.debt*f/5)*5;o.day=(L.day&&n>=7)?1:0;return o}
function chPrize(L){const a=[];if(L.cred>0)a.push(`+${L.cred} min de lazer`);if(L.xp>0)a.push(`+${L.xp} XP`);else if(L.pct)a.push(`+${Math.round(L.pct*100)}% do XP das horas pedidas`);if(L.day)a.push('1 Day Off');return a.join(' + ')}
function chPun(L,pers){const a=[`dívida de ${L.debt} min de lazer`];if(L.cast)a.push('Modo Castigo por 7 dias (lazer rende metade)');if(L.loss)a.push(`perda de até ${Math.round(L.loss*100)}% do XP da sequência`);if(pers)a.push(`compromisso pessoal: “${pers}”`);return a.join(' + ')}
const chDay=(k,d)=>k.type==='focus'?(S.log||[]).reduce((a,x)=>x.d===d&&x.f>=4&&!x.u&&impAt(S.subjects.find(y=>y.id===x.sid)||{},d)!==0?a+(x.m||0):a,0):chSum(d);
const chTot=k=>{const t=fmt(now());return chList(k).reduce((a,o)=>!o.x&&o.d<=t?a+chSum(o.d):a,0)};
const chMin=k=>k.type==='total'?k.goal:k.type==='const'?k.goal*(k.need||0):k.goal*chN(k);
function chDesc(k){const N=chN(k);return k.type==='total'?`${hh(k.goal)} no total em ${N} dia${pl(N)} válido${pl(N)}`:k.type==='focus'?`${hh(k.goal)} por dia com foco 4–5 ★ em ${N} dia${pl(N)} válido${pl(N)}`:k.type==='const'?`pelo menos ${hh(k.goal)} em ${k.need} dos ${N} dias válidos`:`${hh(k.goal)} por dia em ${N} dia${pl(N)} válido${pl(N)}`}
function chGoalErr(L,k,N){const g=k.goal,ty=k.type;if(!(g>0))return'Informe a meta.';if(ty==='total'&&!N)return'';const eq=ty==='total'?g/N:g;
 if(!(eq>=L.lo&&eq<=L.hi))return ty==='total'?`Para o nível ${L.n}, a média deve ficar entre ${hh(L.lo)} e ${hh(L.hi)} por dia (total entre ${hh(L.lo*N)} e ${hh(L.hi*N)}).`:`Para o nível ${L.n}, a meta deve ficar entre ${hh(L.lo)} e ${hh(L.hi)} por dia.`;
 if(ty==='const'&&!(k.need>=1&&k.need<=N))return`Dias necessários: de 1 a ${N}.`;return''}
function chMarco(c,k){const L=chScale(CH_NIV[k.lvl],chN(k),chMin(k)),cr=Math.round(L.cred*.1),xp=Math.round(L.xp*.1),t=fmt(now());
 if(cr>0)lzCfg().led.push({id:lzId(),t:Date.now(),type:'chal',min:cr,note:`Marco de 50% do desafio ${L.n}`});
 if(xp>0)c.adj.push({d:t,v:xp});k.m50=1;elosAdd(10);save();
 toast(`🎯 Marco de 50%! Bônus: ${[cr>0?'+'+cr+' min de lazer':'',xp>0?'+'+xp+' XP':''].filter(Boolean).join(' + ')||'—'} (fica mesmo se falhar depois).`)}
function chWin(c,k){const L=chScale(CH_NIV[k.lvl],chN(k),chMin(k)),t=fmt(now());elosAdd(Math.max(10,Math.round(({leve:30,forte:80,extremo:200})[k.lvl]*chN(k)/7)));
 if(L.cred>0)lzCfg().led.push({id:lzId(),t:Date.now(),type:'chal',min:L.cred,note:`Prêmio do desafio ${L.n}`});
 if(L.xp>0)c.adj.push({d:t,v:L.xp});
 if(L.day)c.dayoff=Math.min(1,c.dayoff+1);
 c.hist.push({id:lzId(),lvl:k.lvl,goal:k.goal,start:k.start,end:t,res:'win',type:k.type,m50:k.m50||0});c.cur=null;save();
 toast(`🏆 Desafio ${L.n} concluído! Prêmio: ${chPrize(L)}.`)}
function chFail(c,k,why){const L=chScale(CH_NIV[k.lvl],chN(k),chMin(k)),t=fmt(now());let loss=0;
 lzCfg().led.push({id:lzId(),t:Date.now(),type:'pun',min:0,owe:L.debt,note:`Punição do desafio ${L.n}`});
 if(L.cast){const n=fmt(addD(now(),6));c.cast=c.cast&&c.cast>n?c.cast:n}
 if(L.loss){const x=xpRun().xp;loss=Math.floor(x*L.loss);if(loss>0)c.adj.push({d:t,v:-loss})}
 if(k.pers)c.pend.push({id:lzId(),text:k.pers,t:Date.now()});
 c.hist.push({id:lzId(),lvl:k.lvl,goal:k.goal,start:k.start,end:t,res:'fail',why,loss,type:k.type,m50:k.m50||0});c.cur=null;save();
 toast(`💀 Desafio ${L.n} falhou${why==='cancel'?' (cancelado)':''}. Punição aplicada.`)}
function chEval(){const r=chDayEval();return chEval0()||r}
function chEval0(){const c=chCfg(),k=c.cur;if(!k)return false;const t=fmt(now()),ty=k.type||'day',N=chN(k),L=chList(k);let ok=0,ratio=0;
 if(ty==='total'){const sum=chTot(k);if(sum>=k.goal){chWin(c,k);return true}if(t>chEnd(k)){chFail(c,k,'miss');return true}ratio=sum/k.goal}
 else if(ty==='const'){let rem=0;for(const o of L){if(o.x)continue;if(o.d<=t&&chDay(k,o.d)>=k.goal)ok++;else if(o.d>=t)rem++}
  if(ok>=k.need){chWin(c,k);return true}if(ok+rem<k.need){chFail(c,k,'miss');return true}ratio=ok/k.need}
 else{for(const o of L){if(o.x)continue;const d=o.d;if(d<=t&&chDay(k,d)>=k.goal){ok++;continue}if(d<t){chFail(c,k,'miss');return true}break}
  if(ok===N){chWin(c,k);return true}ratio=ok/N}
 if(!k.m50&&N>=4&&ratio>=.5&&lzStep()<3){chMarco(c,k);return true}return false}
/* ----- Desafio do dia: 1 dia, sem punição, roda junto com o desafio longo ----- */
const CH_DP=[{n:'Fácil',e:'🟢',m:1.1,x:.15,z:.10},{n:'Médio',e:'🟡',m:1.2,x:.25,z:.15},{n:'Difícil',e:'🔴',m:1.4,x:.40,z:.25}];
function chAvg(){let a=0;for(let i=1;i<=7;i++)a+=chSum(fmt(addD(now(),-i)));return a/7}
function chDayOpts(){const av=Math.max(chAvg(),60);let prev=0;return CH_DP.map(P=>{let g=Math.round(av*P.m/5)*5;g=Math.max(30,Math.min(720,g));if(g<prev+30)g=Math.min(720,prev+30);prev=g;const h=g/60;return{n:P.n,e:P.e,g,xp:Math.round(h*100*P.x/5)*5,lz:Math.round(h*60*P.z/5)*5}})}
function chDc(){const c=chCfg(),t=fmt(now());
 if(c.dc&&c.dc.d!==t){if(c.dc.acc!=null){if(c.dc.st==='open')c.dc.st='lost';c.dh=(Array.isArray(c.dh)?c.dh:[]).concat({d:c.dc.d,g:c.dc.opts[c.dc.acc].g,st:c.dc.st}).slice(-30)}c.dc=null}
 if(!c.dc)c.dc={d:t,opts:chDayOpts(),acc:null,st:'open'};return c.dc}
function chDayEval(){const c=chCfg(),dc=chDc(),t=fmt(now());
 if(dc.acc!=null&&dc.st==='open'){const o=dc.opts[dc.acc];if(chSum(t)>=o.g){dc.st='won';elosAdd([15,25,40][dc.acc]||15);
  lzCfg().led.push({id:lzId(),t:Date.now(),type:'chal',min:o.lz,note:`Desafio do dia (${o.n})`});c.adj.push({d:t,v:o.xp});save();
  toast(`☀️ Desafio do dia concluído! +${o.xp} XP + ${o.lz} min de lazer.`);return true}}return false}
function renderChBar(){const el=$('#chb');if(!el)return;const c=chCfg(),t=fmt(now()),k=c.cur;let h='';
 c.pend.forEach(p=>h+=`<div class="chband" role="alert"><span>🔴 <b>Compromisso pessoal:</b> ${esc(p.text)}</span><button class="btn" data-ch="done" data-id="${p.id}">Cumpri</button></div>`);
 if(k){const L=CH_NIV[k.lvl],ls=chList(k),i=Math.min(ls.length-1,Math.max(0,diff(k.start,t)));
  h+=`<div class="lzb"><button type="button" data-a="nav" data-p="desafio">⛓️ Desafio ${L.n} · dia ${i+1}/${ls.length} · ${k.type==='total'?hh(chTot(k))+' de '+hh(k.goal)+' no total':'hoje '+hh(chDay(k,t))+' de '+hh(k.goal)}</button></div>`;
  if(k.pers)h+=`<div class="chband" role="alert" style="margin-top:8px"><span>🔴 <b>Se falhar:</b> ${esc(k.pers)}</span></div>`}
 {const dc=c.dc;if(dc&&dc.d===t&&dc.acc!=null&&dc.st==='open'){const o=dc.opts[dc.acc];h+=`<div class="lzb"><button type="button" data-a="nav" data-p="desafio">☀️ Desafio do dia · hoje ${hh(chSum(t))} de ${hh(o.g)}</button></div>`}}
 if(chCast())h+=`<div class="lzb">😈 Modo Castigo até ${br(c.cast)}: lazer rende metade</div>`;
 el.innerHTML=h}
function chForm(){const a=($('#ch-s')||{}).value||fmt(now()),b=($('#ch-e')||{}).value||fmt(addD(parse(a),6));return{start:a,end:b,ex:[...document.querySelectorAll('.ch-ex:checked')].map(x=>+x.value),type:($('#ch-t')||{}).value||'day',goal:parseInt(($('#ch-g')||{}).value)||0,need:parseInt(($('#ch-n')||{}).value)||0}}
function chErr(k){if(k.start<fmt(now()))return'O início não pode ser no passado.';if(k.end<k.start)return'O fim precisa ser igual ou depois do início.';if(diff(k.start,k.end)+1>30)return'O período pode ter no máximo 30 dias.';if(chN(k)<1)return'É necessário pelo menos 1 dia válido (sem contar as folgas).';return''}
function chFormSync(){const L=CH_NIV[($('#ch-l')||{}).value],ty=($('#ch-t')||{}).value||'day',g=$('#ch-g'),lb=$('#ch-gl'),nw=$('#ch-nw');if(!L||!g||!lb||!nw)return;
 const N=Math.max(1,chN(chForm()));lb.textContent={day:'Meta por dia (min)',focus:'Meta por dia com foco 4–5 ★ (min)',const:'Mínimo por dia (min)',total:'Meta total no período (min)'}[ty];
 nw.style.display=ty==='const'?'':'none';g.value=ty==='total'?L.def*N:L.def;const n=$('#ch-n');if(n&&ty==='const')n.value=Math.max(1,Math.ceil(N*.7))}
function chPv(){const el=$('#ch-pv');if(!el)return;const l=($('#ch-l')||{}).value,L=CH_NIV[l];if(!L)return;const pers=(($('#ch-p')||{}).value||'').trim(),k=chForm(),er=chErr(k),n=er?0:chN(k),st='style="color:#e5484d;margin:0 0 6px"';
 let bad=er?`<p ${st}>${er}</p>`:'';const ge=er?'':chGoalErr(L,k,n);if(ge)bad+=`<p ${st}>${ge}</p>`;
 const SL=chScale(L,n,(er||ge)?0:chMin(k));
 el.innerHTML=`${bad}<p class="sub" style="margin:0 0 6px">${n} dia${pl(n)} válido${pl(n)} · prêmio e punição proporcionais (${n}/7).${n>=4?' 🎯 Aos 50% você ganha 10% do prêmio na hora, e esse bônus fica mesmo se falhar depois.':''}</p><div class="chinfo good">🏆 <b>Prêmio:</b> ${esc(chPrize(SL)||'—')}</div><div class="chinfo bad">⚠️ <b>Se falhar:</b> ${esc(chPun(SL,pers))}</div>${pers?`<div class="chband" style="margin:8px 0 0">🔴 <span>${esc(pers)}</span></div>`:''}`}
function renderCh(){
 const el=$('#ch');if(!el||curPage!=='relatorio'||!OBJ.includes(rTab))return;const c=chCfg(),k=c.cur,t=fmt(now()),cast=chCast();
 const dv=d=>{const q=new Date(d);return`${p2(q.getDate())}/${p2(q.getMonth()+1)}`};
 const futOffs = c.off.filter(d => d >= t).sort();
 const offInfo = futOffs.length ? ' · <b>Agendados:</b> ' + futOffs.map(d => d === t ? 'Hoje' : br(d)).join(', ') + ' (a sequência não quebra)' : '';
 let top=`<div class="mgs"><h2>Painel</h2><p class="sub" style="margin-top:0">Ativo desde ${dv(c.since)}. O desafio lê os minutos já registrados (soma de todas as matérias) e é avaliado toda vez que o app abre.</p>
 <div class="chinfo">🏖️ Day Offs guardados: <b>${c.dayoff}</b> (máximo 1)${offInfo}</div>
 ${cast?`<div class="chcast" style="margin:8px 0 0">😈 <b>Modo Castigo</b> até ${br(c.cast)}: ganhos de lazer pela metade.</div>`:''}
 ${c.dayoff>0?`<div style="margin-top:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap"><input type="date" id="do-date" min="${t}" value="${t}" style="background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;color:var(--ink)" ${k?'disabled':''}><button class="btn" data-ch="dayoff" ${k?'disabled title="Não dá para usar Day Off durante um desafio"':''}>Agendar Day Off</button>${k?'<p class="sub" style="margin:0; width:100%">Indisponível enquanto há um desafio em andamento.</p>':''}</div>`:''}</div>`;
 let main='';
 if(k){const L=CH_NIV[k.lvl],cells=[],SL=chScale(L,chN(k),chMin(k)),LS=chList(k);let ok=0;
  for(let i=0;i<LS.length;i++){const d=LS[i].d,m=chDay(k,d),dn=DIAS[(parse(d).getDay()+6)%7];
   if(LS[i].x)cells.push(`<div class="elo fut" aria-label="Dia ${i+1}: folga"><span>${dn}</span><b>${i+1}</b><span>🏖️ folga</span></div>`);
   else if(d<=t&&m>=k.goal){ok++;cells.push(`<div class="elo ok" aria-label="Dia ${i+1}: cumprido"><span>${dn}</span><b>${i+1}</b><span>✓ ${hh(m)}</span></div>`)}
   else if(d===t)cells.push(`<div class="elo now" aria-label="Dia ${i+1}: em andamento"><span>${dn}</span><b>${i+1}</b><span>⏳ ${hh(m)}</span><span>de ${hh(k.goal)}</span></div>`);
   else cells.push(`<div class="elo fut" aria-label="Dia ${i+1}: futuro"><span>${dn}</span><b>${i+1}</b><span>${dv(parse(d))}</span></div>`)}
  main=`<div class="mgs"><h2>${L.e} Desafio ${L.n} em andamento</h2><p class="sub" style="margin-top:0">Meta: <b>${chDesc(k)}</b>, de ${dv(parse(k.start))} a ${dv(parse(chEnd(k)))}${LS.some(o=>o.x)?' (folgas não contam)':''}. ${k.type==='total'?hh(chTot(k))+' de '+hh(k.goal):k.type==='const'?ok+' de '+k.need+' dias necessários':ok+' de '+chN(k)+' elos cumpridos'}.${k.m50?' 🎯 Marco de 50% já recebido.':''}</p>
  ${k.type==='total'?`<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100,Math.floor(chTot(k)/k.goal*100))}" style="margin:10px 0"><div style="width:${Math.min(100,Math.floor(chTot(k)/k.goal*100))}%"></div></div>`:`<div class="chl" role="list">${cells.join('')}</div>`}
  <p class="sub" style="margin:0 0 8px">✓ cumprido · ⏳ em andamento · cinza = futuro</p>
  <div class="chinfo good">🏆 <b>Prêmio:</b> ${esc(chPrize(SL)||'—')}</div><div class="chinfo bad">⚠️ <b>Se falhar:</b> ${esc(chPun(SL,k.pers))}</div>
  <div style="margin-top:12px"><button class="btn" data-ch="cancel">Cancelar desafio (conta como falha)</button></div></div>`}
 else main=`<div class="mgs"><h2>Começar um desafio</h2><p class="sub" style="margin-top:0">Um desafio por vez. Se começar hoje, já conta o que você registrou hoje. Escolha início e fim (1 a 30 dias) e marque dias de folga. Se qualquer dia válido ficar abaixo da meta, ou se você cancelar, o desafio falha. Prêmio e punição são proporcionais aos dias válidos (÷7). Tipos de meta: horas por dia, total no período, foco 4–5 ★ ou constância (X dias de Y necessários). Em desafios de 4 dias ou mais, ao chegar a 50% você ganha 10% do prêmio, e esse bônus fica mesmo se falhar depois.</p>
  <div class="mgf"><div class="mgr"><label>Nível<select id="ch-l">${Object.entries(CH_NIV).map(([id,L])=>`<option value="${id}">${L.e} ${L.n}</option>`).join('')}</select></label>
  <label>Tipo de meta<select id="ch-t"><option value="day">Horas por dia</option><option value="total">Total no período</option><option value="focus">Foco 4–5 ★ por dia</option><option value="const">Constância</option></select></label></div>
  <div class="mgr"><label><span id="ch-gl">Meta por dia (min)</span><input type="number" id="ch-g" min="1" step="5" value="${CH_NIV.leve.def}"></label><label id="ch-nw" style="display:none">Dias necessários<input type="number" id="ch-n" min="1" max="30" value="5"></label></div>
  <div class="mgr"><label>Início<input type="date" id="ch-s" min="${t}" value="${t}"></label><label>Fim<input type="date" id="ch-e" min="${t}" value="${fmt(addD(now(),6))}"></label></div>
  <div class="mgr"><div><span class="sub" style="display:block;margin-bottom:6px">Dias de folga (não contam):</span><div class="wdc">${DNAMES.map((n,i)=>`<label><input type="checkbox" class="ch-ex" value="${i}">${n}</label>`).join('')}</div></div></div>
  <div class="mgr"><label style="flex:1">Punição pessoal opcional (faixa vermelha)<input type="text" id="ch-p" maxlength="100" placeholder="Ex.: sem redes sociais no domingo"></label></div>
  <div id="ch-pv"></div>
  <button class="btn main" data-ch="start">Começar desafio</button></div></div>`;
 const tb=`<div class="mgs"><h2>Níveis</h2><div style="overflow-x:auto"><table class="chtb"><thead><tr><th>Nível</th><th>Meta por dia</th><th>Prêmio</th><th>Punição se falhar</th></tr></thead><tbody>${Object.values(CH_NIV).map(L=>`<tr><td><b>${L.e} ${L.n}</b></td><td>${L.hi>=720?'a partir de '+hh(L.lo):L.lo<=30?'até '+hh(L.hi):hh(L.lo)+' a '+hh(L.hi)}</td><td>${esc(chPrize(L))}</td><td>${esc(chPun(L,''))}</td></tr>`).join('')}</tbody></table></div></div>`;
 const hs=c.hist.slice().reverse().slice(0,15).map(x=>{const L=CH_NIV[x.lvl]||{n:x.lvl,e:''};return`<div class="lzrow"><span>${L.e} Desafio ${L.n} · ${x.type==='total'?hh(x.goal)+' no total':hh(x.goal)+'/dia'}<small>${dv(parse(x.start))} a ${dv(parse(x.end))}${x.res==='fail'?(x.why==='cancel'?' · cancelado':' · não bateu a meta'):''}${x.loss>0?` · −${x.loss} XP`:''}${x.m50?' · 🎯 marco 50%':''}</small></span><b class="${x.res==='win'?'p':'n'}">${x.res==='win'?'✅ concluído':'❌ falhou'}</b></div>`}).join('');
 const dc=chDc();let dh;
 if(dc.acc==null&&lzStep()>=3)dh='<p class="sub" style="margin-top:0">🔒 Bloqueado enquanto o saldo de lazer estiver abaixo de −3h.</p>';else if(dc.acc==null)dh=`<p class="sub" style="margin-top:0">Sem punição: se não cumprir, só não ganha o prêmio. Baseado na sua média dos últimos 7 dias (${hh(Math.round(chAvg()))}/dia). Já conta o que você registrou hoje. Pode rodar junto com um desafio longo.</p><div class="mgr">${dc.opts.map((o,i)=>`<button class="btn" data-ch="dc" data-i="${i}">${o.e} ${o.n}: ${hh(o.g)}<br><small>+${o.xp} XP + ${o.lz} min de lazer</small></button>`).join('')}</div>`;
 else{const o=dc.opts[dc.acc],m=chSum(t),p=Math.min(100,Math.floor(m/o.g*100));dh=`<p class="sub" style="margin-top:0">${o.e} ${o.n}: <b>${hh(m)} de ${hh(o.g)}</b> · ${dc.st==='won'?'✅ concluído!':'⏳ vale até meia-noite'} · prêmio: +${o.xp} XP + ${o.lz} min de lazer</p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><div style="width:${p}%"></div></div>`}
 const dsec=`<div class="mgs"><h2>☀️ Desafio do dia</h2>${dh}</div>`;
 el.innerHTML=top+dsec+main+tb+`<div class="mgs"><h2>Histórico de desafios</h2>${hs||'<p class="sub">Nenhum desafio ainda.</p>'}</div>`;
 if(!k)chPv()}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.id)return;
 if(t.id==='ch-l'||t.id==='ch-t')chFormSync();
 if(t.id==='ch-s'){const e=$('#ch-e');if(e){if(!e.value||e.value<t.value||diff(t.value,e.value)>29)e.value=fmt(addD(parse(t.value),6));e.min=t.value}}
 if(['ch-l','ch-t','ch-n','ch-g','ch-p','ch-s','ch-e'].includes(t.id))chPv()});
document.addEventListener('change',e=>{if(e.target.classList&&e.target.classList.contains('ch-ex'))chPv();else if(e.target.id==='ch-s'||e.target.id==='ch-e')chPv()});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-ch]');if(!b||b.disabled)return;const c=chCfg(),a=b.dataset.ch,t=fmt(now());
 if(a==='start'){if(c.cur)return;const l=$('#ch-l').value,L=CH_NIV[l],g=parseInt($('#ch-g').value),pers=($('#ch-p').value||'').trim().slice(0,100);
  const f=chForm(),er=chErr(f);if(er){toast(er);return}
  const ge=L?chGoalErr(L,f,chN(f)):'Nível inválido.';if(ge){toast(ge);return}
  const SL=chScale(L,chN(f),chMin(f));
  if(!confirm(`Começar o desafio ${L.n}: ${chDesc(f)}, de ${br(f.start)} a ${br(f.end)} (${chN(f)} dias válidos).\n\nPrêmio: ${chPrize(SL)||'—'}\nSe falhar: ${chPun(SL,pers)}\n\nConfirmar?`))return;
  c.cur={id:lzId(),lvl:l,goal:f.goal,type:f.type,need:f.type==='const'?f.need:0,start:f.start,end:f.end,ex:f.ex,pers,created:Date.now()};save();render();toast('Desafio iniciado. Boa sorte!')}
 else if(a==='cancel'){const k=c.cur;if(!k)return;const L=CH_NIV[k.lvl];
  if(!confirm(`Cancelar conta como FALHA.\n\nSe falhar: ${chPun(chScale(L,chN(k),chMin(k)),k.pers)}\n\nCancelar mesmo assim?`))return;
  chFail(c,k,'cancel');render()}
 else if(a==='dayoff'){
  if(c.cur||c.dayoff<1)return;
  const dt=$('#do-date').value;if(!dt||dt<t){toast('Escolha hoje ou uma data futura.');return}
  if(c.off.includes(dt)){toast('Day Off já agendado para esta data.');return}
  c.dayoff--;c.off.push(dt);save();render();toast(`Day Off ativado para ${dt===t?'hoje':br(dt)}. Sua sequência está protegida.`)}
 else if(a==='dc'){const dc=chDc();if(dc.acc!=null)return;if(lzStep()>=3){toast('Desafio do dia bloqueado: saldo de lazer abaixo de −3h.');return}dc.acc=+b.dataset.i;dc.st='open';save();chDayEval();render();toast('Desafio do dia aceito. Boa!')}
 else if(a==='done'){c.pend=c.pend.filter(p=>p.id!==b.dataset.id);save();render()}
});
