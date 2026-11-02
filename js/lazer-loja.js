/* ===== Banco de tempo de lazer (Etapas 2 e 3) ===== */
function lzCfg(){const z=S.lz=(S.lz&&typeof S.lz==='object')?S.lz:{};z.on=!!z.on;z.since=z.since||null;z.rate=z.rate!==undefined&&z.rate!==''&&Number.isFinite(+z.rate)?+z.rate:15;z.bonus=+z.bonus>=1?+z.bonus:1.5;z.led=Array.isArray(z.led)?z.led:[];z.warn=z.warn!==false;z.ln=!!z.ln;z.li=Number.isFinite(+z.li)&&z.li!==null?+z.li:50;z.lm=+z.lm>0?+z.lm:60;z.use=z.use&&z.use.e?z.use:null;return z}
const lzBal=()=>lzCfg().led.reduce((a,x)=>a+x.min,0);
const lzDebt=()=>Math.max(0,Math.round(lzCfg().led.reduce((a,x)=>a+(x.owe||0)-(x.type==='pay'?x.st:0),0)*10)/10);
const lzN=m=>{const a=Math.abs(m);if(a>=60)return hh(Math.round(a));const r=Math.round(a*10)/10;return String(r).replace('.',',')+' min'};
const lzS=m=>(m<0?'−':m>0?'+':'')+lzN(m);
const lzId=()=>'z'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function lzGain(s,studyMin,src,blk){
 const z=lzCfg();if(!(studyMin>0))return null;elosAdd(studyMin/10);stXp(studyMin);let eff=studyMin;const d=lzDebt(),mu=blk?1.5:1;
 if(d>0){const pd=Math.round(Math.min(d,studyMin*mu)*10)/10;z.led.push({id:lzId(),t:Date.now(),type:'pay',min:0,st:pd,sid:s.id,nm:s.name});eff=studyMin-pd/mu}
 if(!z.on)return null;const hx=shCfg(),nx=Date.now();
 if(hx.elx>nx){const cr=Math.round(Math.min(Math.max(0,-lzBal()),studyMin)*10)/10;if(cr>0){z.led.push({id:lzId(),t:nx,type:'gain',min:cr,sid:s.id,nm:s.name,src:'elixir'});eff=Math.max(0,eff-cr)}}
 if(!(eff>0))return null;
 const g=Math.round(eff/60*z.rate*chMul()*(lzStep()>=2?.5:1)*(shCfg().bst>Date.now()?1.25:1)*(hx.gld>nx?2:1)*100)/100;if(!(g>0))return null;
 const e={id:lzId(),t:Date.now(),type:'gain',min:g,sid:s.id,nm:s.name,src,st:Math.round(eff*10)/10};
 z.led.push(e);return e.id}
function lzBonus(cid){
 const z=lzCfg(),b=z.led.find(x=>x.id===cid);if(b&&b.st>0)elosAdd(b.st/10*.5);if(!z.on||!b||z.bonus<=1)return;
 const g=Math.round(b.min*(z.bonus-1)*100)/100;if(!(g>0))return;
 z.led.push({id:lzId(),t:Date.now(),type:'bonus',min:g,sid:b.sid,nm:b.nm,src:'timer',ref:cid})}
function lzSettle(){const z=lzCfg(),u=z.use;if(!u||Date.now()<u.e)return false;
 z.led.push({id:lzId(),t:u.e,type:'use',min:-u.m,note:'Descanso concluído'});z.use=null;save();return true}
function lzNeed(){const z=lzCfg(),b=lzBal(),d=lzDebt();if(shCfg().elx>Date.now()&&b<0)return Math.max(d,Math.ceil(-b))+1;if(z.rate<=0)return null;return d+(b<=0?Math.floor(-b/z.rate*60)+1:0)}

/* ===== Estorno do banco ao apagar/editar estudo =====
   Remove do banco o que um estudo creditou (ganho, bônus, dívida paga, prêmio Tudo ou Nada) e os Elos dele. */
function lzGainD(s,m,src,k,tm){const id=lzGain(s,m,src),e=id&&lzCfg().led.find(x=>x.id===id);if(e){e.sd=k;e.sm=Math.round(m);if(tm)e.tm=1}return id}
function lzRefund(sid,lo,hi,min){
 const z=lzCfg(),base=z.led.filter(x=>x.t>=lo&&x.t<=hi&&((x.sid===sid&&(x.type==='gain'||x.type==='pay'))||x.type==='ton')),
  ids=new Set(base.filter(x=>x.type==='gain').map(x=>x.id)),bon=z.led.filter(x=>x.type==='bonus'&&ids.has(x.ref)),hit=base.concat(bon);
 if(!hit.length)return null;
 let el=(+min||0)/10;bon.forEach(b=>{const g=base.find(x=>x.id===b.ref);if(g&&g.st>0)el+=g.st/10*.5});
 z.led=z.led.filter(x=>!hit.includes(x));elCfg().g-=el;
 return{n:hit.length,lz:hit.reduce((a,x)=>a+(x.min||0),0),bonus:bon.length>0}}
function lzRefundSess(s,q){
 if(q[2])return null;const a=+new Date(q[0]),b=+new Date(q[1]),min=(b-a)/6e4;let lo,hi;
 if(q[3]){lo=q[3]-8000;hi=q[3]+8000}
 else{const k=fmt(new Date(a)),g=lzCfg().led.find(x=>x.type==='gain'&&x.sid===s.id&&x.tm&&x.sd===k&&Math.abs((x.sm||0)-Math.round(min))<=1);
  if(g){lo=g.t-8000;hi=g.t+8000}else{lo=b-6e4;hi=b+18e5}}
 return lzRefund(s.id,lo,hi,min)}
function lzRefundManual(s,k){let n=0,lz=0;
 lzCfg().led.filter(x=>x.type==='gain'&&x.sid===s.id&&x.sd===k&&!x.tm&&x.src!=='elixir').forEach(x=>{const r=lzRefund(s.id,x.t-8000,x.t+8000,x.sm||x.st||0);if(r){n++;lz+=r.lz}});return n?{n,lz}:null}
function lzRefundDay(s,k){let n=0;
 (s.sessions||[]).filter(q=>q[0].slice(0,10)===k).forEach(q=>{if(lzRefundSess(s,q))n++});
 if(lzRefundManual(s,k))n++;return n}
let lzAll=false,lzHide=false;
const lzClk=ms=>{const s=Math.max(0,Math.ceil(ms/1e3));return p2(Math.floor(s/60))+':'+p2(s%60)};

/* ===== V30: Plano para fechar o dia em -9h59 =====
   Só sugestão na tela. Entrar no Calendário é escolha do usuário (botão). */
const LP_T=-599;
const LP_M={fast:{n:'Rápido',e:'⚡',f:1,blk:50,gap:10,d:'Tudo com foco 5 ★ no cronômetro: rende mais por minuto, então pede menos horas.'},
 bal:{n:'Equilibrado',e:'⚖️',f:.5,blk:40,gap:10,d:'Metade das sessões com foco 5 ★ e metade normais.'},
 easy:{n:'Leve',e:'🌿',f:0,blk:25,gap:10,d:'Blocos curtos de 25 min, sem depender de foco 5 ★. Pede mais horas no total.'}};
let lpMode='bal';
function lpCfg(){const c=S.lzp=(S.lzp&&typeof S.lzp==='object')?S.lzp:{};c.lim=/^\d\d:\d\d$/.test(c.lim||'')?c.lim:'23:30';c.res=Number.isFinite(+c.res)&&+c.res>=0?Math.min(300,Math.round(+c.res/5)*5):60;return c}
const lpHM=m=>p2(Math.floor((m%1440)/60))+':'+p2(Math.round(m%60))+(m>=1440?' (+1d)':'');
function lpCtx(){const z=lzCfg(),di=idCfg(),c=lpCfg(),n=new Date(),nowM=n.getHours()*60+n.getMinutes()+n.getSeconds()/60,left=Math.max(0,1440-nowM),
 lr=di.on?di.lr/60:0,b=lzBal(),d=lzDebt(),base=z.rate*chMul()*(shCfg().bst>Date.now()?1.25:1)/60,startM=Math.ceil(nowM/5)*5,
 lm=c.lim.split(':').map(Number),limM=lm[0]*60+lm[1];
 /* saldo previsto à meia-noite se estudar x min (fração f com foco 5 ★). Estimativa conservadora. */
 const fin=(f,x)=>{const mu=1+.5*f,bm=1+(z.bonus-1)*f,dr=Math.max(0,left-c.res-x)*lr,pd=Math.min(d,x*mu),eff=Math.max(0,x-pd/mu);let sb=b-dr;
  for(let i=0;i<eff;i++){const q=Math.min(1,eff-i);sb+=base*(sb<-60?.5:1)*bm*q}return sb};
 const need=f=>{const mx=Math.floor(Math.max(0,left-c.res)/5)*5;for(let x=0;x<=mx;x+=5)if(fin(f,x)>=LP_T)return{ok:true,x};return{ok:false,x:mx}};
 return{fin,need,startM,limM,left,nowM}}
function lpSubj(x){const A=S.subjects.filter(s=>!s.arch&&impOf(s)!==0);if(!A.length||x<=0)return[{s:null,n:'Estudo livre',m:x}];
 const P=planBuild(0),t=fmt(now()),D=P&&P.days.find(d=>d.k===t),out=[];let left=x;
 if(D)D.plan.map(c=>({s:c.s,m:Math.max(0,c.m-(c.s.days[t]||0))})).filter(c=>c.m>0).sort((a,b)=>b.m-a.m).forEach(c=>{if(left<=0)return;const m=Math.min(left,Math.ceil(c.m/5)*5);out.push({s:c.s,n:c.s.name,m});left-=m});
 if(left>0){const W=A.map(s=>({s,w:subjFactor(s).w})),tw=W.reduce((a,o)=>a+o.w,0)||1;let g=0;
  W.forEach((o,i)=>{let m=i===W.length-1?left-g:Math.round(left*o.w/tw/5)*5;m=Math.max(0,Math.min(m,left-g));g+=m;if(m>0){const e=out.find(y=>y.s===o.s);if(e)e.m+=m;else out.push({s:o.s,n:o.s.name,m})}})}
 return out}
function lpSched(ctx,M,x){if(!(x>0))return[];const q=lpSubj(x).map(o=>({...o})),bl=[],res=lpCfg().res;let i=0;
 while(q.some(o=>o.m>0)){for(const o of q){if(o.m<=0)continue;const len=Math.min(M.blk,o.m);bl.push({s:o.s,n:o.n,m:len,foc:M.f>=1||(M.f>0&&i%2===0)});o.m-=len;i++}}
 const ri=Math.ceil(bl.length/2),out=[];let t=ctx.startM;
 bl.forEach((b,k)=>{if(k===ri&&res>0){out.push({r:1,a:t,b:t+res});t+=res}out.push({...b,a:t,b:t+b.m});t+=b.m;if(k<bl.length-1&&k+1!==ri)t+=M.gap});
 if(res>0&&ri>=bl.length){out.push({r:1,a:t,b:t+res})}
 return out}
function lpHtml(){const z=lzCfg();if(!z.on)return'';const ctx=lpCtx(),b0=ctx.fin(0,0);if(b0>=LP_T)return'';
 const res=Object.keys(LP_M).map(k=>{const M=LP_M[k],r=ctx.need(M.f),s=r.ok?lpSched(ctx,M,r.x):[],end=s.length?s[s.length-1].b:ctx.startM;return{k,M,r,s,end}});
 const cur=res.find(o=>o.k===lpMode)||res[1],c=lpCfg(),pc=pdlCalc(),pi=SHOP.find(x=>x.id==='pdl'),pr=shInfo(pi),done=Math.round(stkTot(fmt(now())));
 const fits=cur.r.ok&&cur.end<=ctx.limM,len=cur.s.length?cur.end-ctx.startM:0,last=ctx.limM-len;
 const sum=res.map(o=>`<button type="button" data-lp="mode" data-k="${o.k}" aria-pressed="${o.k===cur.k}">${o.M.e} ${o.M.n}<b>${o.r.ok?hh(o.r.x)+' de estudo':'Não alcança'}</b><small>${o.r.ok?'termina às '+lpHM(o.end):'nem estudando até a meia-noite'}</small></button>`).join('')
  +`<button type="button" data-lp="mode" data-k="pot" aria-pressed="${cur.k==='pot'}">🧪 Poção<b>${pc.credit>0?'+'+lzN(pc.credit)+' de lazer':'não precisa'}</b><small>${pr.price?pr.price+' Elos':'1ª compra grátis'} · sem estudar</small></button>`;
 let body='';
 if(lpMode==='pot'){body=`<p class="sub" style="margin:0">A poção sobe o saldo só o necessário para o dia terminar em até −9h58, mesmo sem estudar mais. Compre na <a href="#loja">Loja</a>${pr.price?` (${pr.price} Elos)`:' (a primeira é grátis)'}.</p><button class="btn" data-a="nav" data-p="loja" style="margin-top:8px">🛒 Abrir a Loja</button>`}
 else{
  body=`<p class="sub" style="margin:0 0 6px">${cur.M.d}</p>`;
  if(!cur.r.ok)body+=`<div class="lpw" role="alert">⚠️ Neste modo não dá para chegar a −9h59 até a meia-noite, mesmo estudando o resto do dia. Veja a 🧪 Poção ou ajuste a taxa de ganho em Ajustes.</div>`;
  else{
   if(!fits)body+=`<div class="lpw" role="alert">⚠️ Esse plano termina às <b>${lpHM(cur.end)}</b>, depois do seu horário limite (${c.lim}). Comece já, aumente o limite ou escolha outro modo. A 🧪 Poção resolve sem estudar.</div>`;
   else body+=`<p class="sub" style="margin:0 0 6px">Último horário viável para começar: <b>${lpHM(Math.max(ctx.startM,last))}</b>${last<=ctx.startM?' (ou seja, agora)':''}.</p>`;
   body+=cur.s.map(b=>b.r?`<div class="lprow rs"><b>${lpHM(b.a)}–${lpHM(b.b)}</b><span>🍽️ Reserva para refeição/rotina · ${hh(b.b-b.a)}<small style="display:block">Inicie a rotina em Tempo parado, senão esse tempo conta como ocioso.</small></span></div>`:`<div class="lprow"><b>${lpHM(b.a)}–${lpHM(b.b)}</b><span>${esc(b.n)} · ${hh(b.m)}${b.foc?' · foco 5 ★ no cronômetro':''}</span></div>`).join('');
   body+=`<div class="fa" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-lp="cal">📅 Adicionar ao calendário (opcional)</button></div><p class="sub" style="margin:6px 0 0;font-size:.8rem">Os blocos são só uma sugestão. Se adicionar, entra uma tarefa por matéria no dia de hoje.</p>`}}
 return`<div class="mgs" id="lpsec"><h2>🎯 Plano para fechar o dia em −9h59</h2><p style="margin:0 0 4px">Sem estudar mais, o dia termina em <b class="neg">${lzS(Math.round(b0))}</b> (já contando a ociosidade até a meia-noite). Você já estudou <b>${hh(done)}</b> hoje.</p><p class="sub" style="margin:0">Escolha o foco de hoje. O cálculo é uma estimativa conservadora e se atualiza sozinho conforme você estuda.</p><div class="lpg">${sum}</div>${body}
  <details style="margin-top:10px"><summary>Ajustar horário limite e reserva</summary><div class="mgf"><div class="mgr"><label>Horário limite para estudar<input type="time" id="lp-lim" value="${c.lim}"></label><label>Reserva para refeições/rotinas (min)<input type="number" id="lp-res" min="0" max="300" step="5" value="${c.res}"></label></div><button class="btn" data-lp="cfg">Salvar</button></div></details></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-lp]');if(!b)return;const a=b.dataset.lp;
 if(a==='mode'){lpMode=b.dataset.k;renderLazer();return}
 if(a==='cfg'){const l=$('#lp-lim').value,r=parseFloat($('#lp-res').value);if(!/^\d\d:\d\d$/.test(l)||!(r>=0&&r<=300)){toast('Confira o horário limite e a reserva (0 a 300 min).');return}const c=lpCfg();c.lim=l;c.res=Math.round(r/5)*5;save();renderLazer();toast('Plano atualizado.');return}
 if(a==='cal'){const ctx=lpCtx(),M=LP_M[lpMode];if(!M)return;const r=ctx.need(M.f);if(!r.ok)return;const t=fmt(now()),agg={};
  lpSched(ctx,M,r.x).forEach(x=>{if(x.r||!x.s)return;agg[x.s.id]=agg[x.s.id]||{s:x.s,m:0};agg[x.s.id].m+=x.m});let n=0;
  Object.values(agg).forEach(o=>{const m=Math.floor(o.m/15)*15;if(m<15)return;const nm='Estudar '+o.s.name,T=o.s.topics=o.s.topics||[];if(T.some(y=>y.name===nm&&y.date===t))return;
   T.push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:nm,date:t,prio:'media',est:m,dur:m,done:false,doneAt:'',note:''});n++});
  if(!n){toast('Esses blocos já estão no calendário de hoje.');return}save();render();toast(`${n} bloco${pl(n)} adicionado${pl(n)} ao calendário.`)}});

function renderLazer(){
 const z=lzCfg();if(lzSettle()){toast('⏳ Descanso terminado. Hora de voltar a estudar!');try{if('Notification' in window&&Notification.permission==='granted')new Notification('Descanso terminado',{body:'Hora de voltar a estudar!'})}catch(x){}}
 const b=lzBal(),d=lzDebt(),c=$('#lzb'),pe=$('#lzp');
 if(c)c.innerHTML=z.use?`<button type="button" data-a="nav" data-p="lazer">😴 Descansando: <b class="lzcd" data-e="${z.use.e}" style="font-size:1.15rem">${lzClk(z.use.e-Date.now())}</b></button>`:z.on?`<button type="button" data-a="nav" data-p="lazer">⏳ Lazer disponível: <b class="${b<0?'neg':''}">${lzS(b).replace('+','')}</b>${d>0?` · deve ${lzN(d)} de estudo`:''}</button>`:`<button type="button" data-a="nav" data-p="lazer">⏳ Banco de lazer: ative para ganhar tempo livre estudando</button>`;
 if(pe){const show=z.on&&z.warn&&b<=0&&!z.use&&!lzHide,n=lzNeed();
  pe.innerHTML=show?`<div class="lzp" role="alert"><h2>⛔ PROIBIDO</h2><p><b>Sem lazer${b<0?' (saldo '+lzS(b).replace('−','−')+')':''}.</b> ${n==null?'A taxa de ganho está em 0. Ajuste em Banco de lazer.':`Estude pelo menos <b>${lzN(n)}</b> para liberar${d>0?` (inclui ${lzN(d)} de dívida)`:''}.`} Isto é só um aviso: você pode registrar estudos e usar o cronômetro normalmente.</p><button class="btn" data-lz="hide">Entendi</button></div>`:''}
 const el=$('#lz');if(!el||curPage!=='lazer')return;
 const L=z.led.slice().sort((x,y)=>y.t-x.t),V=lzAll?L:L.slice(0,40),dt=t=>{const q=new Date(t);return`${p2(q.getDate())}/${p2(q.getMonth()+1)} ${p2(q.getHours())}:${p2(q.getMinutes())}`};
 const lab=x=>x.type==='bonus'?`Bônus de foco 5 ★ · ${esc(x.nm||'')}`:x.type==='gain'?`${x.src==='elixir'?'🪞 Elixir do Reembolso':x.src==='timer'?'Cronômetro':'Registro manual'} · ${esc(x.nm||'')}${x.st?' · '+lzN(x.st)+' estudados':''}`:x.type==='pay'?`Estudo pagou dívida · ${esc(x.nm||'')}`:x.type==='loan'?`Empréstimo · deve ${lzN(x.owe)} de estudo`:esc(x.note||x.type);
 const right=x=>x.type==='pun'?`<b class="n">deve ${lzN(x.owe)}</b>`:x.type==='pay'?`<b class="p">−${lzN(x.st)} dívida</b>`:`<b class="${x.min<0?'n':'p'}">${lzS(x.min)}</b>`;
 const maxU=Math.floor(b),dm=Math.max(1,Math.min(15,maxU)),lm=Math.min(30,z.lm);
 const useBox=z.use?`<p class="sub" style="margin:10px 0 0">Descanso em andamento (continua contando com a aba fechada)</p><div class="lzcd" data-e="${z.use.e}">${lzClk(z.use.e-Date.now())}</div><button class="btn" data-lz="stop">Encerrar descanso agora</button>`:z.on?(b>=1?`<div class="lzf"><label>Descansar por (min)<input type="number" id="lz-u" min="1" max="${maxU}" step="1" value="${dm}"></label><button class="btn main" data-lz="use">😴 Usar lazer</button></div>`:`<p class="sub">Sem saldo para descansar. Estude para acumular lazer.</p>`):'';
 const loanBox=z.ln&&z.on&&!z.use?(d>0?`<p class="sub">Você ainda deve <b>${lzN(d)}</b> de estudo. Pague antes de pegar outro empréstimo. Os minutos estudados abatem a dívida primeiro e, enquanto pagam, não geram lazer.</p>`:`<div class="lzf"><label>Pegar emprestado (min, até ${z.lm})<input type="number" id="lz-ln" min="1" max="${z.lm}" step="1" value="${lm}"></label><button class="btn" data-lz="loan">Pedir empréstimo</button></div><p class="sub" style="margin:6px 0 0">Com ${z.li}% de juros: 30 min de lazer viram ${lzN(30*(1+z.li/100))} de estudo a pagar.</p>`):'';
 el.innerHTML=`${lpHtml()}${chCast()?`<div class="chcast">😈 <b>Modo Castigo</b> até ${br(chCfg().cast)}: seus ganhos de lazer rendem só a metade.</div>`:''}<div class="mgs"><h2>Saldo de lazer</h2>
  ${z.on?`<div class="lzbig ${b<0?'neg':''}">${b<0?'−':''}${lzN(b)}</div>${d>0?`<p style="color:#e5484d;font-weight:700;margin:0">Dívida: ${lzN(d)} de estudo a pagar</p>`:''}<p class="sub" style="margin-top:6px">Ativo desde ${dt(z.since)}. Só conta estudo registrado depois da ativação; apagar ou editar um estudo depois não muda este saldo.</p>${useBox}${loanBox}<div style="margin-top:12px"><button class="btn" data-lz="off">Pausar ganhos</button></div>`
  :`<p class="sub" style="margin-top:0">Ganhe tempo livre estudando: a cada hora de estudo você acumula minutos de lazer. O saldo começa zerado ao ativar e não soma o histórico antigo.</p>${z.led.length?`<div class="lzbig">${lzS(b).replace('+','')}</div>`:''}${useBox}<button class="btn main" data-lz="on">${z.led.length?'Reativar banco de lazer':'Ativar banco de lazer'}</button>`}</div>
 <div class="mgs"><h2>Ajustes</h2><p class="sub" style="margin-top:0">Cronômetro: ganha pela taxa, com bônus quando a concentração for 5 ★. Registros manuais ganham pela taxa, sem bônus. Mudanças valem só para o futuro.</p>
  <div class="mgf"><div class="mgr"><label>Min de lazer por hora estudada<input type="number" id="lz-r" min="0" max="60" step="1" value="${z.rate}"></label><label>Bônus com foco 5 (multiplicador)<input type="number" id="lz-b" min="1" max="3" step="0.1" value="${z.bonus}"></label></div>
  <div class="mgr"><label class="lzck"><input type="checkbox" id="lz-w" ${z.warn?'checked':''}> Mostrar aviso PROIBIDO quando o saldo zerar</label></div>
  <div class="mgr"><label class="lzck"><input type="checkbox" id="lz-l" ${z.ln?'checked':''}> Permitir empréstimo de lazer com juros</label><label>Juros (%)<input type="number" id="lz-i" min="0" max="300" step="5" value="${z.li}"></label><label>Limite por empréstimo (min)<input type="number" id="lz-m" min="5" max="240" step="5" value="${z.lm}"></label></div>
  <button class="btn main" data-lz="cfg">Salvar ajustes</button></div></div>
 <div class="mgs"><h2>Histórico de lançamentos</h2>${V.map(x=>`<div class="lzrow"><span>${lab(x)}<small>${dt(x.t)}</small></span>${right(x)}${['gain','bonus','pay'].includes(x.type)?`<button class="ghost danger" data-lz="del" data-id="${x.id}" title="Remover este lançamento do banco" aria-label="Remover lançamento">🗑</button>`:''}</div>`).join('')||'<p class="sub">Nenhum lançamento ainda.</p>'}${L.length>40?`<button class="btn" style="margin-top:10px" data-lz="more">${lzAll?'Mostrar menos':'Mostrar todos ('+L.length+')'}</button>`:''}</div>`}
setInterval(()=>{const z=lzCfg();if(z.use&&Date.now()>=z.use.e){render();return}document.querySelectorAll('.lzcd[data-e]').forEach(n=>n.textContent=lzClk(+n.dataset.e-Date.now()))},1000);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-lz]');if(!b)return;const z=lzCfg(),a=b.dataset.lz;
 if(a==='on'){z.on=true;if(!z.led.length)z.since=Date.now();z.since=z.since||Date.now();save();render();toast('Banco de lazer ativado. Começa a contar a partir de agora.')}
 else if(a==='off'){z.on=false;save();render();toast('Ganhos pausados. O saldo foi mantido.')}
 else if(a==='more'){lzAll=!lzAll;renderLazer()}
 else if(a==='del'){const x=z.led.find(y=>y.id===b.dataset.id);if(!x)return;
  if(!confirm('Remover este lançamento do banco?\n\n'+(x.type==='gain'?'O ganho, o bônus e a dívida paga por esse mesmo estudo também saem, e os Elos dele são estornados.':'Só este lançamento será removido.')+'\nO saldo é recalculado.'))return;
  if(x.type==='gain'&&x.src!=='elixir'){if(!lzRefund(x.sid,x.t-8000,x.t+8000,x.sm||x.st||0))z.led=z.led.filter(y=>y!==x)}else z.led=z.led.filter(y=>y!==x);
  save();render();toast('Lançamento removido. Saldo recalculado.')}
 else if(a==='hide'){lzHide=true;renderLazer()}
 else if(a==='cfg'){const r=parseFloat($('#lz-r').value),m=parseFloat($('#lz-b').value),i=parseFloat($('#lz-i').value),l=parseFloat($('#lz-m').value);if(!(r>=0&&r<=60)||!(m>=1&&m<=3)||!(i>=0&&i<=300)||!(l>=5&&l<=240)){toast('Confira os valores: taxa 0–60, bônus 1–3, juros 0–300%, limite 5–240.');return}z.rate=r;z.bonus=m;z.li=i;z.lm=l;z.warn=$('#lz-w').checked;z.ln=$('#lz-l').checked;save();render();toast('Ajustes salvos.')}
 else if(a==='use'){const m=parseFloat($('#lz-u').value),bl=lzBal();if(!(m>=1)||m>bl){toast('Escolha de 1 min até o seu saldo ('+lzN(bl)+').');return}z.use={s:Date.now(),e:Date.now()+m*6e4,m};save();try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(x){}render();toast('Descanso de '+lzN(m)+' iniciado.')}
 else if(a==='stop'){const u=z.use;if(!u)return;const used=u.tk?u.m:Math.round(Math.min((Date.now()-u.s)/6e4,u.m)*10)/10;if(used>0)z.led.push({id:lzId(),t:Date.now(),type:'use',min:-used,note:'Descanso encerrado antes do fim'});z.use=null;save();render();toast('Descanso encerrado. Foram descontados '+lzN(used)+'.')}
 else if(a==='loan'){const m=parseFloat($('#lz-ln').value);if(!z.ln||lzDebt()>0)return;if(!(m>=1&&m<=z.lm)){toast('Empréstimo de 1 a '+z.lm+' min por vez.');return}const owe=Math.round(m*(1+z.li/100)*10)/10;
  if(!confirm(`Pegar ${lzN(m)} de lazer agora e dever ${lzN(owe)} de estudo? Esses minutos de estudo pagam a dívida primeiro e não geram lazer enquanto isso.`))return;
  z.led.push({id:lzId(),t:Date.now(),type:'loan',min:m,owe});save();render();toast('Empréstimo feito: +'+lzN(m)+'. Deve '+lzN(owe)+' de estudo.')}
});


/* ===== Cobrança de ociosidade (V20) =====
   Estados: estudando (cronômetro ligado) · rotina (com término) · ocupado/fora · ocioso.
   Ocioso: o lazer diminui; com o lazer em zero ele segue negativo e o XP também cai (o nível acompanha o XP). */
const idN=(v,d)=>v===null||v===''||v===undefined||!Number.isFinite(+v)?d:+v;
function idCfg(){const d=S.idl=(S.idl&&typeof S.idl==='object')?S.idl:{};d.on=!!d.on;d.last=d.last||null;d.lr=Math.max(0,idN(d.lr,60));d.xr=Math.max(0,idN(d.xr,100));d.rt=d.rt&&d.rt.e?d.rt:null;d.aw=d.aw&&d.aw.s?d.aw:null;d.log=Array.isArray(d.log)?d.log:[];return d}
const idHM=t=>new Date(t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
function idSet(t){const d=idCfg();if(d.on){d.last=t;save()}}
function idStudy(){const d=idCfg();if(!d.on)return;idTick(true);d.rt=null;d.aw=null;d.last=Date.now()}
function idCharge(a,n){
 const d=idCfg(),m=(n-a)/6e4;if(!(m>0))return;
 const lz=m*d.lr/60,bal=lzBal(),over=lz-Math.max(0,bal);
 let mo=0;if(d.lr>0){if(over>0)mo=Math.min(m,over*60/d.lr)}else if(bal<=0)mo=m;
 let xp=mo*d.xr/60;xp=Math.max(0,Math.min(xp,xpRun().xp));
 const day=fmt(new Date(n)),led=lzCfg().led;
 if(lz>0){let e=led.slice().reverse().find(x=>x.type==='idle'&&x.agg&&x.d===day);if(!e){e={id:lzId(),t:n,type:'idle',agg:1,d:day,min:0,note:'Ociosidade · '+br(day)};led.push(e)}e.min=Math.round((e.min-lz)*1000)/1000}
 if(xp>0){const adj=chCfg().adj;let e=adj.find(x=>x.idle&&x.d===day);if(!e){e={d:day,v:0,idle:1};adj.push(e)}e.v=Math.round((e.v-xp)*1000)/1000}
 const L=d.log,l=L[L.length-1];
 if(l&&l.b===a&&l.d===day){l.b=n;l.lz+=lz;l.xp+=xp}else L.push({a,b:n,lz,xp,d:day});
 const lim=n-7*864e5;d.log=L.filter(x=>x.b>lim);
 return xp}
function idTick(quiet){
 const d=idCfg();if(!d.on)return;const n=Date.now();if(!d.last){d.last=n;save();return}
 let a=d.last,z=lzCfg();
 if(d.rt&&d.rt.e<=n){a=Math.max(a,d.rt.e);const nm=d.rt.n;d.rt=null;if(!quiet)notify('⏰ '+nm+' terminou. A cobrança de ociosidade voltou.')}
 if(z.use&&z.use.e<=n){a=Math.max(a,z.use.e);lzSettle()}
 if(S.brk&&S.brk.end>a){if(S.brk.end>n){d.last=n;save();return}a=S.brk.end}
 if(d.pass&&d.pass>a){if(d.pass>n){d.last=n;save();return}a=d.pass}
 if(d.rt||(S.timer&&!S.timer.unp)||z.use||d.aw){d.last=n;save();return}
 const xp=idCharge(a,n);d.last=n;save();
 if(!quiet){if(curPage!=='lazer')renderLazer();idChip();idLive();if(xp>0)renderLvl()}}
function idState(){const d=idCfg(),b=lzBal();
 if(S.timer&&!S.timer.unp)return'📚 Estudando';if(S.timer)return'🚫 Fora do plano: contando como ocioso';if(lzCfg().use)return'😴 Usando lazer';if(d.rt)return`${esc(d.rt.n)} até ${idHM(d.rt.e)}`;if(d.aw)return'🚶 Ocupado/Fora desde '+idHM(d.aw.s);
 if(S.brk&&S.brk.end>Date.now())return'☕ Pausa da técnica';
 return`🔻 Ocioso · lazer ${lzS(b).replace('+','')}${b<=0?' · XP caindo':''}`}
function idChip(){stkChip();const c=$('#lzb'),o=$('#idchip');if(o)o.remove();if(!c||!idCfg().on)return;c.insertAdjacentHTML('beforeend',`<div id="idchip" class="tbadge" style="margin-top:4px">${idState()}</div>`)}
function idLive(){const e=$('#idlive');if(e)e.innerHTML=idState()}
function idHtml(){
 const d=idCfg(),pl='<p class="sub" style="margin-top:0">Quando o cronômetro de estudo não está ligado (e você não está em rotina nem ocupado/fora), o lazer diminui. Zerou, ele continua negativo e o XP também cai; o nível acompanha o XP.</p>';
 if(!d.on)return`<div class="mgs" id="idsec"><h2>🔻 Cobrança de ociosidade</h2>${pl}<p class="sub">Ao ativar, vale só a partir de agora e o banco de lazer também é ativado.</p><button class="btn main" data-ix="on">Ativar cobrança</button></div>`;
 const rtBox=d.rt?`<p class="sub">${esc(d.rt.n)} em andamento: termina às ${idHM(d.rt.e)} (<b class="lzcd" data-e="${d.rt.e}">${lzClk(d.rt.e-Date.now())}</b>)</p><button class="btn" data-ix="rtx">Encerrar rotina agora</button>`:
 `<div class="mgr"><label>Rotina<select id="id-n"><option>😴 Dormir</option><option>🍽️ Refeição</option><option>🏋️ Treino</option><option>✏️ Outra</option></select></label><label>Duração (min)<input type="number" id="id-m" min="1" max="1440" placeholder="ex.: 480"></label><label>ou termina às<input type="time" id="id-t"></label></div><button class="btn main" data-ix="rt">Iniciar rotina</button>`;
 return`<div class="mgs" id="idsec"><h2>🔻 Cobrança de ociosidade</h2>${pl}<div class="lzbig" id="idlive" style="font-size:1.1rem">${idState()}</div>
 <div class="mgf"><h3 style="margin:10px 0 4px;font-size:1rem">Rotina com término</h3>${rtBox}
 <h3 style="margin:14px 0 4px;font-size:1rem">Ocupado/Fora</h3><p class="sub" style="margin:0 0 6px">Pausa a cobrança até você voltar.</p><button class="btn" data-ix="aw">${d.aw?'✅ Voltei (encerrar)':'🚶 Estou ocupado/fora'}</button>
 <h3 style="margin:14px 0 4px;font-size:1rem">Correção retroativa</h3><p class="sub" style="margin:0 0 6px">Devolve o lazer e o XP cobrados nesse intervalo (até 7 dias atrás).</p><div class="mgr"><label>De<input type="datetime-local" id="fx-a"></label><label>Até<input type="datetime-local" id="fx-b"></label></div><button class="btn" data-ix="fix">Corrigir período</button>
 <h3 style="margin:14px 0 4px;font-size:1rem">Ajustes</h3><div class="mgr"><label>Lazer perdido por hora ociosa (min)<input type="number" id="id-lr" min="0" max="600" step="5" value="${d.lr}"></label><label>XP perdido por hora ociosa sem lazer<input type="number" id="id-xr" min="0" max="1000" step="10" value="${d.xr}"></label></div>
 <div class="row"><button class="btn main" data-ix="cfg">Salvar ajustes</button><button class="ghost" data-ix="off">Desativar cobrança</button></div></div></div>`}
function renderIdle(){idChip();const el=$('#lz');if(!el||curPage!=='lazer')return;const o=$('#idsec');if(o)o.remove();const q=$('#qtsec');if(q)q.remove();el.insertAdjacentHTML('afterbegin',qtHtml()+idHtml())}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-ix]');if(!b)return;const d=idCfg(),a=b.dataset.ix,n=Date.now(),v=id=>{const x=document.getElementById(id);return x?x.value:''};
 if(a==='on'){const z=lzCfg();if(!z.on){z.on=true;z.since=z.since||n}d.on=true;d.last=n;save();render();toast('Cobrança de ociosidade ativada, a partir de agora.');return}
 if(!d.on)return;idTick(true);
 if(a==='off'){d.on=false;d.rt=null;d.aw=null}
 else if(a==='cfg'){d.lr=Math.max(0,idN(v('id-lr'),60));d.xr=Math.max(0,idN(v('id-xr'),100));toast('Ajustes salvos.')}
 else if(a==='rt'){
  if(S.timer){toast('Pause o cronômetro de estudo antes de iniciar uma rotina.');return}
  const nm=v('id-n')||'Rotina',def=/Dormir/.test(nm)?480:60,t=v('id-t'),m=idN(v('id-m'),0);let end;
  if(t){const [h,mi]=t.split(':').map(Number),x=new Date();x.setHours(h,mi,0,0);end=x.getTime();if(end<=n+6e4)end+=864e5}
  else end=n+(m>0?m:def)*6e4;
  d.rt={n:nm,s:n,e:end};d.aw=null;d.last=n}
 else if(a==='rtx'){d.rt=null;d.last=n}
 else if(a==='aw'){if(d.aw)d.aw=null;else{if(S.timer){toast('Pause o cronômetro antes.');return}d.aw={s:n};d.rt=null}d.last=n}
 else if(a==='fix'){const x=new Date(v('fx-a')).getTime(),y=new Date(v('fx-b')).getTime();
  if(!(x<y)||y>n||x<n-7*864e5){toast('Período inválido. Use datas passadas, até 7 dias atrás, com início antes do fim.');return}
  const r=idFix(x,y);save();render();toast((r.rl>0?`Correção: +${lzN(r.rl)} de lazer e +${Math.round(r.rx)} XP devolvidos.`:'Nada foi cobrado de ociosidade nesse período.')+(r.tn?` ☢️ ${r.tn} falha${r.tn>1?'s':''} do Terminal estornada${r.tn>1?'s':''}: +${lzN(r.tl)} de lazer${r.tx>0?' e +'+Math.round(r.tx)+' XP':''}.`:''));return}
 save();render()});
function idFix(a,b){
 const d=idCfg();let rl=0,rx=0;const out=[];
 d.log.forEach(x=>{const s=Math.max(a,x.a),e=Math.min(b,x.b);if(!(e>s)){out.push(x);return}
  const L=x.b-x.a,f=(e-s)/L,px=x.xp*f;rl+=x.lz*f;rx+=px;
  const ad=chCfg().adj.find(y=>y.idle&&y.d===x.d);if(ad)ad.v=Math.min(0,Math.round((ad.v+px)*1000)/1000);
  if(s>x.a){const g=(s-x.a)/L;out.push({a:x.a,b:s,lz:x.lz*g,xp:x.xp*g,d:x.d})}
  if(e<x.b){const g=(x.b-e)/L;out.push({a:e,b:x.b,lz:x.lz*g,xp:x.xp*g,d:x.d})}});
 d.log=out;if(rl>0)lzCfg().led.push({id:lzId(),t:Date.now(),type:'idle',min:Math.round(rl*100)/100,note:'Correção retroativa'});
 const tf=window.__lsRefund?window.__lsRefund(a,b):{n:0,lz:0,xp:0};return{rl,rx,tn:tf.n,tl:tf.lz,tx:tf.xp}}
setInterval(()=>idTick(),15000);setTimeout(()=>{idTick();renderIdle()},600);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)idTick()});


/* ===== V24: Elos, Loja, mínimo da streak, escada do saldo negativo ===== */
const STEPN=['','Só aviso','O lazer rende metade','Desafio do dia e marcos bloqueados','XP ganho cai pela metade','Streak zera ao fim do dia'];
const lzStep=()=>{const b=lzBal();return b>=-60?1:b>=-180?2:b>=-360?3:b>=-600?4:5};
function elCfg(){const e=S.elos=(S.elos&&typeof S.elos==='object')?S.elos:{};e.g=+e.g||0;e.s=+e.s||0;return e}
const elBal=()=>Math.floor(elCfg().g-elCfg().s+1e-9);
function elosAdd(n){if(n>0)elCfg().g+=n}
function shCfg(){const h=S.shop=(S.shop&&typeof S.shop==='object')?S.shop:{};h.buy=Array.isArray(h.buy)?h.buy:[];h.bst=+h.bst||0;h.xp2=+h.xp2||0;return h}
function stXp(m){const c=chCfg(),t=fmt(now()),x=m*100/60;let v=0;if(shCfg().xp2>Date.now())v+=x;if(lzStep()>=4)v-=x/2;if(!v)return;
 let e=c.adj.find(y=>y.sh&&y.d===t);if(!e){e={d:t,v:0,sh:1};c.adj.push(e)}e.v=Math.round((e.v+v)*100)/100}
function stkCfg(){const k=S.stk=(S.stk&&typeof S.stk==='object')?S.stk:{};if(!k.since)k.since=fmt(now());if(!Array.isArray(k.hist)||!k.hist.length)k.hist=[{from:k.since,min:30}];
 k.tok=+k.tok||0;k.lw=+k.lw||0;k.fz=Array.isArray(k.fz)?k.fz:[];k.sv=Array.isArray(k.sv)?k.sv:[];k.bal=k.bal||{};k.zeroAt=k.zeroAt||'';return k}
const stkTot=d=>S.subjects.reduce((a,x)=>a+plOf(x,d),0);
function stkMin(d){const k=stkCfg();if(d<k.since)return 1;let m=30;k.hist.forEach(h=>{if(h.from<=d)m=h.min});return m}
const stkQ=d=>stkTot(d)>=stkMin(d)&&stkTot(d)>0;
function stkSets(){const k=stkCfg(),std=new Set();S.subjects.forEach(s=>Object.keys(s.days).forEach(d=>{if(d>k.zeroAt&&stkQ(d))std.add(d)}));
 const days=new Set(std);chCfg().off.concat(k.fz).forEach(d=>{if(d>k.zeroAt)days.add(d)});return{std,days}}
function stkToday(){const t=fmt(now()),m=Math.round(stkTot(t)),n=stkMin(t);return`${m}/${n} min${m>=n?' ✓':''}`}
/* V92: dia terminou abaixo de −10h => streak (acima), dívida de lazer (saldo negativo + dívida de estudo) e Elos zerados */
function stkWipe(d,sk){const z=lzCfg(),n=Date.now(),db=lzDebt(),cr=Math.max(0,-lzBal()),el=elBal(),e=elCfg();
 if(db>0)z.led.push({id:lzId(),t:n,type:'pay',min:0,st:db,nm:'Reset de −10h'});
 if(cr>0)z.led.push({id:lzId(),t:n,type:'chal',min:Math.round(cr*1000)/1000,note:'Reset de −10h: saldo de lazer zerado (o dia '+br(d)+' terminou abaixo de −10h)'});
 e.s=e.g;
 toast('💥 '+br(d)+' terminou abaixo de −10h: '+(sk?'streak, ':'')+'dívida de lazer'+(cr>0||db>0?' ('+(cr>0?lzN(cr)+' de saldo negativo':'')+(cr>0&&db>0?' e ':'')+(db>0?lzN(db)+' de estudo':'')+')':'')+' e '+(el>0?el+' Elos':'Elos')+' zerados.')}
function stkSettle(){const k=stkCfg(),t=fmt(now()),y=fmt(addD(now(),-1));k.bal[t]=Math.round(lzBal());
 Object.keys(k.bal).forEach(d=>{if(d<fmt(addD(now(),-12)))delete k.bal[d]});
 if(!k.last){k.last=y;save();return}if(k.last>=y)return;
 const off=new Set(chCfg().off),fz=new Set(k.fz),ok=d=>d>k.zeroAt&&(stkQ(d)||off.has(d)||fz.has(d));
 for(let d=fmt(addD(parse(k.last),1));d<=y;d=fmt(addD(parse(d),1))){
  const pv=fmt(addD(parse(d),-1));
  if(d>=k.since&&stkQ(d))elosAdd(3);
  if(!ok(d)&&ok(pv)&&k.tok>0){k.tok--;k.fz.push(d);fz.add(d);toast('🧊 Congelamento usado para proteger '+br(d)+'.')}
  const b=k.bal[d];
  if(b!==undefined&&b<-600){if(ok(d)&&k.tok>0){k.tok--;k.sv.push(d);toast('🧊 Congelamento evitou o reset de −10h (streak, dívida de lazer e Elos preservados).')}else{const sk=ok(d);if(sk)k.zeroAt=d;stkWipe(d,sk)}}}
 k.last=y;save()}
setInterval(()=>{const k=stkCfg(),t=fmt(now()),b=Math.round(lzBal());if(k.bal[t]!==b){k.bal[t]=b;save()}},15000);
function stkChip0(){const o=$('#stkchip');if(o)o.remove();const c=$('#lzb');if(!c)return;const b=lzBal(),st=lzStep();if(st<2&&b>-480)return;
 const m=b<=-570?`🚨 Streak, dívida de lazer e Elos zeram se o dia terminar abaixo de −10h (saldo ${lzS(b).replace('+','')}).`:b<=-480?`⚠️ Atenção: abaixo de −10h no fim do dia a streak, a dívida de lazer e os Elos zeram (saldo ${lzS(b).replace('+','')}).`:`📉 Degrau ${st}/5: ${STEPN[st]}.`;
 c.insertAdjacentHTML('beforeend',`<div id="stkchip" class="tbadge" style="margin-top:4px">${m}</div>`)}
function qtHtml(){const b=lzBal(),st=lzStep(),z=lzCfg();let pl='';
 if(st>=2&&z.rate>0){const th=st===2?-60:st===3?-180:st===4?-360:-600,r=z.rate*chMul()*.5/60,need=Math.ceil(lzDebt()+(th-b)/r);pl=`<p style="margin:6px 0 0"><b>Plano:</b> estude cerca de <b>${hh(need)}</b> para voltar ao degrau ${st-1} (inclui a dívida de estudo, no ritmo atual; foco 5 ★ ajuda).</p>`}
 return`<div class="mgs" id="qtsec"><h2>📋 Modo Quitação · Degrau ${st}/5</h2><p class="sub" style="margin:0">${STEPN[st]}. Os efeitos se acumulam: degraus 2 a 4 reduzem o ganho de lazer, travam desafio do dia e marcos, e cortam o XP ganho. Abaixo de −10h no fim do dia a streak, a dívida de lazer e os Elos zeram.</p>${pl}</div>`}

const SHOP=[
 {id:'frz',e:'🧊',n:'Congelar streak',d:'Protege 1 dia perdido ou o reset de −10h: streak, dívida de lazer e Elos (usado automaticamente).',p:120,l:1},
 {id:'min',e:'⏱️',n:'Reduzir mínimo da streak',d:'Permite baixar o mínimo diário uma vez (mínimo 30 min).',p:100,l:1},
 {id:'lzx',e:'😴',n:'Lazer extra',d:'+30 min no banco de lazer.',p:90,l:3},
 {id:'pdv',e:'🧾',n:'Perdão de dívida',d:'−30 min de dívida de estudo.',p:80,l:2},
 {id:'bst',e:'🚀',n:'Boost de ganho',d:'+25% de lazer por 24h.',p:60,l:2},
 {id:'xp2',e:'⚡',n:'XP em dobro',d:'XP dobrado por 24h.',p:120,l:2},
 {id:'pas',e:'🛡️',n:'Passe de ociosidade',d:'1h sem cobrança de ociosidade.',p:40,l:4},
 {id:'dof',e:'🏖️',n:'Day Off',d:'+1 Day Off (guarda no máximo 1).',p:400,l:1},
 {id:'pdl',e:'🧪',n:'Poção de perdão de dívida de lazer',d:'Sobe o saldo de lazer só o necessário para que, mesmo sem estudar mais e com a ociosidade descontando até meia-noite, o dia termine no máximo em −9h58 e a streak não zere. 1ª compra grátis; depois é o item mais raro e caro da loja.',p:2000,l:1},
 {id:'pmg',e:'✨',n:'Poção mágica',d:'Perdoa tudo: zera o saldo de lazer negativo e toda a dívida de estudo (punições e empréstimos). 1ª compra grátis; depois custa 10.000 Elos.',p:10000,l:1}];
/*LOJA-V74-START*/
/* ===== V74: Loja com tickets, Elixir do Reembolso, Hora Dourada e Baú ===== */
SHOP.push(
 {id:'elx',e:'🪞',n:'Elixir do Reembolso',d:'Por 5 horas, cada minuto estudado (tempo bruto) abate 1 minuto da dívida de estudo E 1 minuto do lazer negativo, ao mesmo tempo. Com −4h de lazer, estudar 4h zera. Depois de zerar, o ganho volta ao normal. Dura 5h; comprar de novo soma +5h.',p:600,l:2},
 {id:'gld',e:'🌅',n:'Hora Dourada',d:'Por 2 horas, o lazer ganho estudando vale em dobro (soma com o Boost).',p:150,l:3},
 {id:'tjg',e:'🎟️',n:'Ingresso de jogo',d:'Ticket de 2h para assistir a um jogo, sem gastar saldo de lazer. Vale 30 dias e só ativa depois de bater a meta mínima do dia.',p:400,l:2},
 {id:'tvg',e:'🎮',n:'Ticket de videogame',d:'Ticket de 45 min para uma partida, sem gastar saldo de lazer. Vale 30 dias e só ativa depois da meta do dia.',p:150,l:3},
 {id:'tsr',e:'🍿',n:'Sessão de série',d:'Ticket de 50 min para um episódio, sem gastar saldo de lazer. Vale 30 dias e só ativa depois da meta do dia.',p:160,l:3},
 {id:'tgl',e:'🍕',n:'Vale-guloseima',d:'Vale para aquele lanche ou doce sem culpa. Vale 30 dias e só ativa depois da meta do dia.',p:60,l:3},
 {id:'bau',e:'🎁',n:'Baú misterioso',d:'Prêmio surpresa: lazer, Elos, passe de ociosidade, boost, perdão de dívida ou até um ticket de videogame.',p:110,l:3});
const TK3={tjg:{m:120,e:'🎟️',n:'Ingresso de jogo'},tvg:{m:45,e:'🎮',n:'Ticket de videogame'},tsr:{m:50,e:'🍿',n:'Sessão de série'},tgl:{m:0,e:'🍕',n:'Vale-guloseima'}};
function tkInv(){const h=shCfg();h.inv=(Array.isArray(h.inv)?h.inv:[]).filter(x=>x.x>Date.now()&&TK3[x.k]);return h.inv}
function tkAdd(k){tkInv().push({id:'k'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),k,t:Date.now(),x:Date.now()+30*864e5})}
function shBuy(id){if(!['elx','gld','tjg','tvg','tsr','tgl','bau'].includes(id))return shBuy0(id);
 const it=SHOP.find(x=>x.id===id),h=shCfg(),n=Date.now(),I=shInfo(it),z=lzCfg();let msg='';
 if(I.left<=0)return toast('Limite semanal atingido para este item.');if(elBal()<I.price)return toast('Elos insuficientes.');
 if((id==='elx'||id==='gld')&&!z.on)return toast('Ative o banco de lazer primeiro.');
 if(id==='elx'&&lzBal()>=0&&lzDebt()<=0)return toast('Você não tem lazer negativo nem dívida. O elixir não foi usado.');
 if(id==='elx'){h.elx=Math.max(n,h.elx||0)+5*36e5;msg='🪞 Elixir ativo até '+idHM(h.elx)+': estudar abate dívida e lazer negativo 1:1.'}
 else if(id==='gld'){h.gld=Math.max(n,h.gld||0)+2*36e5;msg='🌅 Hora Dourada até '+idHM(h.gld)+': lazer ganho em dobro.'}
 else if(TK3[id]){tkAdd(id);msg=TK3[id].e+' '+TK3[id].n+' guardado em "Meus tickets".'}
 else if(id==='bau'){const R=[[30,'lz'],[20,'el'],[20,'pas'],[15,'bst'],[10,'pdv'],[5,'tvg']];let r=Math.random()*100,k='lz';for(const o of R){if(r<o[0]){k=o[1];break}r-=o[0]}
  if(k==='pdv'&&lzDebt()<=0)k='lz';if(k==='lz'&&!z.on)k='el';
  if(k==='lz'){z.led.push({id:lzId(),t:n,type:'chal',min:20,note:'🎁 Baú misterioso: lazer'});msg='🎁 Baú: +20 min de lazer!'}
  else if(k==='el'){elosAdd(150);msg='🎁 Baú: +150 Elos!'}
  else if(k==='pas'){const d=idCfg();d.pass=Math.max(n,d.pass||0)+36e5;msg='🎁 Baú: 1h de passe de ociosidade!'}
  else if(k==='bst'){h.bst=Math.max(n,h.bst)+6*36e5;msg='🎁 Baú: boost de +25% por 6h!'}
  else if(k==='pdv'){z.led.push({id:lzId(),t:n,type:'pay',min:0,st:Math.min(30,lzDebt()),nm:'Baú misterioso'});msg='🎁 Baú: −30 min de dívida de estudo!'}
  else{tkAdd('tvg');msg='🎁 Baú: um Ticket de videogame!'}}
 elCfg().s+=I.price;h.buy.push({id,t:n});h.buy=h.buy.filter(x=>x.t>n-14*864e5);save();render();toast(msg)}
function tkUse(id){const h=shCfg(),L=tkInv(),i=L.findIndex(x=>x.id===id);if(i<0)return;const it=L[i],D=TK3[it.k],z=lzCfg(),n=Date.now(),t=fmt(now()),mn=stkMin(t),dn=Math.round(stkTot(t));
 if(dn<mn)return toast('Primeiro bata a meta mínima de hoje ('+hh(dn)+' de '+hh(mn)+'). O ticket espera por você.');
 if(D.m>0){if(!z.on)return toast('Ative o banco de lazer para usar este ticket.');if(z.use)return toast('Você já está em um descanso. Termine ou encerre antes.');
  z.led.push({id:lzId(),t:n,type:'chal',min:D.m,note:D.e+' Ticket: '+D.n+' (sem custo no saldo)'});z.use={s:n,e:n+D.m*6e4,m:D.m,tk:1}}
 h.inv.splice(i,1);h.tku=(h.tku||0)+1;save();render();toast(D.m>0?D.e+' '+D.n+' ativado: '+hh(D.m)+' de diversão sem custo. Aproveite!':D.e+' '+D.n+' usado. Aproveite sem culpa!')}
function renderShop(){renderShop0();const el=$('#shp');if(!el||curPage!=='loja'||!el.children||!el.children[0])return;const h=shCfg(),n=Date.now(),L=tkInv();
 const fx=[h.elx>n?'🪞 Elixir do Reembolso até '+idHM(h.elx):'',h.gld>n?'🌅 Hora Dourada até '+idHM(h.gld):''].filter(Boolean);
 el.children[0].insertAdjacentHTML('afterend','<div class="mgs"><h2>🎒 Meus tickets e efeitos</h2>'+(fx.length?'<p style="margin:0 0 8px"><b>Ativos:</b> '+fx.join(' · ')+'</p>':'')+
  (L.length?'<div class="mgr" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">'+L.map(x=>{const D=TK3[x.k];return'<div class="chinfo"><b style="font-size:1.2rem;line-height:1.3">'+D.e+' '+D.n+'</b><br><small>'+(D.m?hh(D.m)+' sem custo no saldo':'uso livre')+' · vale até '+br(fmt(new Date(x.x)))+'</small><br><button class="btn main" data-sp="tk" data-i="'+x.id+'">Usar agora</button></div>'}).join('')+'</div>':'<p class="sub" style="margin:0">Nenhum ticket guardado. Compre abaixo: o ticket só ativa depois de bater a meta mínima do dia, e não desconta do seu saldo de lazer.</p>')+'</div>')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-sp="tk"]');if(b)tkUse(b.dataset.i)});
function stkChip(){stkChip0();const o=$('#fxchip');if(o)o.remove();const c=$('#lzb');if(!c)return;const h=shCfg(),n=Date.now(),m=[];
 if(h.elx>n)m.push('🪞 Elixir até '+idHM(h.elx)+': estudar abate dívida e lazer negativo 1:1');if(h.gld>n)m.push('🌅 Hora Dourada até '+idHM(h.gld)+': lazer em dobro');
 if(m.length)c.insertAdjacentHTML('beforeend','<div id="fxchip" class="tbadge" style="margin-top:4px">'+m.join(' · ')+'</div>')}
/*LOJA-V74-END*/
const PDL_FLOOR=-598;
function pdlCalc(){const z=lzCfg(),d=idCfg(),n=new Date(),end=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,0),left=Math.max(0,(end-n)/6e4),drain=d.on?left*d.lr/60:0,bal=lzBal(),credit=Math.ceil((PDL_FLOOR+drain-bal)*10)/10;return{bal,drain:Math.round(drain*10)/10,left,credit:Math.max(0,credit)}}
function shInfo(it){const n=Date.now(),c=shCfg().buy.filter(x=>x.id===it.id&&x.t>n-7*864e5).length;return{c,price:(it.id==='pdl'||it.id==='pmg')?(shCfg()[it.id]?it.p:0):Math.round(it.p*(1+.2*c)),left:it.l-c}}
function shBuy0(id){const it=SHOP.find(x=>x.id===id);if(!it)return;const h=shCfg(),n=Date.now(),I=shInfo(it),k=stkCfg(),z=lzCfg();
 if(I.left<=0)return toast('Limite semanal atingido para este item.');if(elBal()<I.price)return toast('Elos insuficientes.');
 if(id==='lzx'&&!z.on)return toast('Ative o banco de lazer primeiro.');if(id==='pdv'&&lzDebt()<=0)return toast('Você não tem dívida de estudo.');if(id==='dof'&&chCfg().dayoff>=1)return toast('Você já tem um Day Off guardado.');
 if(id==='pmg'&&lzBal()>=0&&lzDebt()<=0)return toast('Você não tem dívidas nem saldo negativo. A poção não foi usada.');
 let pc=null;if(id==='pdl'){pc=pdlCalc();if(pc.credit<=0)return toast('Seu saldo já aguenta até o fim do dia sem zerar a streak. A poção não foi usada.')}
 if(id==='frz')k.tok++;else if(id==='min')k.lw++;
 else if(id==='lzx')z.led.push({id:lzId(),t:n,type:'chal',min:30,note:'Loja: lazer extra'});
 else if(id==='pdv')z.led.push({id:lzId(),t:n,type:'pay',min:0,st:Math.min(30,lzDebt()),nm:'Loja'});
 else if(id==='bst')h.bst=Math.max(n,h.bst)+864e5;else if(id==='xp2')h.xp2=Math.max(n,h.xp2)+864e5;
 else if(id==='pas'){const d=idCfg();d.pass=Math.max(n,d.pass||0)+36e5}
 else if(id==='dof'){const c=chCfg();c.dayoff=(c.dayoff||0)+1}
 else if(id==='pmg'){const db=lzDebt();pc={credit:Math.max(0,-lzBal()),debt:db};if(db>0)z.led.push({id:lzId(),t:n,type:'pay',min:0,st:db,nm:'Poção mágica'});if(pc.credit>0)z.led.push({id:lzId(),t:n,type:'chal',min:pc.credit,note:'Loja: Poção mágica (saldo de lazer zerado)'});h.pmg=(h.pmg||0)+1}
 else if(id==='pdl'){z.led.push({id:lzId(),t:n,type:'chal',min:pc.credit,note:'Loja: Poção de perdão de dívida de lazer'});h.pdl=(h.pdl||0)+1}
 elCfg().s+=I.price;h.buy.push({id,t:n});h.buy=h.buy.filter(x=>x.t>n-14*864e5);save();render();toast(id==='pmg'?`✨ Poção mágica usada${I.price?'':' (grátis)'}: ${pc.credit>0?'saldo de lazer zerado (+'+lzN(pc.credit)+')':'sem saldo negativo'}${pc.debt>0?' e '+lzN(pc.debt)+' de dívida de estudo perdoados':''}.`:id==='pdl'?`🧪 Poção usada: +${lzN(pc.credit)} de lazer${I.price?'':' (grátis)'}. Mesmo sem estudar mais, o dia termina em até −9h58.`:`${it.e} ${it.n} comprado por ${I.price} Elos.`)}
function renderShop0(){const el=$('#shp');if(!el||curPage!=='loja')return;const k=stkCfg(),h=shCfg(),n=Date.now(),t=fmt(now()),cur=stkMin(t);
 const act=[h.bst>n?`🚀 Boost até ${idHM(h.bst)}`:'',h.xp2>n?`⚡ XP em dobro até ${idHM(h.xp2)}`:'',idCfg().pass>n?`🛡️ Passe até ${idHM(idCfg().pass)}`:'',k.tok>0?`🧊 ${k.tok} congelamento${k.tok>1?'s':''}`:'',k.lw>0?`⏱️ ${k.lw} redução${k.lw>1?'ões':''} de mínimo`:''].filter(Boolean);
 el.innerHTML=`<div class="mgs"><h2>🪙 Elos: <b>${elBal()}</b></h2><p class="sub" style="margin:0">Ganhe estudando (1 Elo a cada 10 min, +50% com foco 5 ★), concluindo desafios, marcos e desafio do dia, e +3 por dia que cumpre a streak.</p>${act.length?`<p style="margin:8px 0 0">${act.join(' · ')}</p>`:''}</div>
 <div class="mgs"><h2>🔥 Mínimo da streak</h2><p class="sub" style="margin:0 0 8px">Hoje vale <b>${hh(cur)}</b> de estudo por dia (mínimo possível: 30 min). Aumentar é grátis e vale a partir de hoje. Diminuir exige uma <b>Redução de mínimo</b> da loja (você tem ${k.lw}). Abaixo de −10h de saldo no fim do dia a streak, a dívida de lazer e os Elos zeram.</p><div class="mgr"><label>Novo mínimo (min)<input type="number" id="sk-m" min="30" max="720" step="5" value="${cur}"></label></div><button class="btn main" data-sp="min">Salvar mínimo</button></div>
 <div class="mgs"><h2>🛍️ Itens</h2><div class="mgr" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">${SHOP.map(it=>{const I=shInfo(it);return`<div class="chinfo"><b style="font-size:1.2rem;line-height:1.3">${it.e} ${it.n}</b><br><span class="sub">${it.d}</span><br><small>${I.price?I.price+' Elos':'GRÁTIS (1ª compra)'} · ${I.left} de ${it.l} restante${I.left===1?'':'s'} na semana</small>${it.id==='pdl'?(()=>{const c=pdlCalc();return`<br><small>Agora: saldo ${lzS(c.bal).replace('+','')}${c.drain?` · ociosidade até meia-noite ≈ −${lzN(c.drain)}`:''} · crédito necessário: <b>${c.credit>0?lzN(c.credit):'nenhum'}</b></small>`})():''}<br><button class="btn${elBal()>=I.price&&I.left>0?' main':''}" data-sp="buy" data-i="${it.id}" ${I.left<=0?'disabled':''}>Comprar</button></div>`}).join('')}</div></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-sp]');if(!b||b.disabled)return;
 if(b.dataset.sp==='buy')shBuy(b.dataset.i);
 else if(b.dataset.sp==='min'){const v=parseInt(($('#sk-m')||{}).value),k=stkCfg(),t=fmt(now()),cur=stkMin(t);
  if(!(v>=30)){toast('O mínimo da streak é de 30 minutos.');return}if(v===cur)return;
  if(v<cur){if(k.lw<=0){toast('Para diminuir, compre "Reduzir mínimo da streak" na loja.');return}k.lw--}
  k.hist=k.hist.filter(x=>x.from!==t).concat({from:t,min:v});save();render();toast(`Mínimo da streak: ${hh(v)} por dia, a partir de hoje.`)}});


