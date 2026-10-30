/* ===== V31: Coach (feed) ===== */
const CO_F=[['eq','⚖️ Equilíbrio geral'],['mat','🎯 Uma matéria específica'],['atr','🕳️ Resgatar matérias abandonadas'],['qua','🧠 Qualidade do foco'],['str','🔥 Proteger a streak'],['laz','😴 Quitar dívida de lazer']];
const CO_PH=['Constância vence intensidade: o dia comum bem feito constrói o resultado.','Você não precisa de motivação, precisa de um primeiro bloco pequeno e claro.','O que você revisa hoje é o que você não precisa reaprender na semana que vem.','Foco é decidir o que ignorar. Um bloco, uma matéria, um objetivo.','Descanso planejado faz parte do estudo; culpa não faz.','Quem estuda 40 minutos todo dia passa quem estuda 5 horas uma vez por semana.','Dificuldade sentida é sinal de aprendizado acontecendo, não de incapacidade.','Comece pelo que mais pesa. O resto do dia fica leve.','Medir é o primeiro passo para melhorar: seus números já dizem muito.','Cada bloco concluído é um voto na pessoa que você quer ser.'];
const CO_TP={freq:['Regra dos 2 dias: nunca deixe 2 dias seguidos sem estudar, nem que sejam 20 minutos. O esquecimento acelera quando a pausa passa disso.','Ancore o estudo a um gatilho fixo (depois do café, ao chegar em casa). Horário fixo reduz a decisão, e é a decisão que cansa.'],foco:['Recuperação ativa: feche o material e escreva de memória o que lembra antes de reler. Dói mais, mas fixa muito mais que reler.','Deixe o celular em outro cômodo durante o bloco. Só a presença do aparelho já reduz a atenção disponível.'],bloco:['Se o foco cai no fim do bloco, encurte: 2 blocos de 40 min com pausa de 8 rendem mais que 1 de 80.','Termine cada bloco anotando a primeira ação do próximo. Isso elimina o atrito de recomeçar.'],rev:['Revisão espaçada: reveja em 1 dia, 3 dias, 7 dias e 21 dias. É o método com melhor retorno por minuto estudado.','Intercale matérias parecidas no mesmo dia (interleaving). Parece mais difícil, mas melhora a retenção de longo prazo.'],ger:['Explique o assunto em voz alta, como se ensinasse alguém. Onde você travar, está a lacuna real.','Resolva exercícios antes de achar que está pronto: a sensação de entender engana, a questão não.']};
const coCfg=()=>{const c=S.coach=(S.coach&&typeof S.coach==='object')?S.coach:{};c.f=CO_F.some(x=>x[0]===c.f)?c.f:'eq';return c};
function coData(){
 const t=now(),T=fmt(t),A=S.subjects.filter(s=>!s.arch),dk=i=>fmt(addD(t,-i)),rng=(s,a,b)=>{let m=0;for(let i=a;i<b;i++)m+=s.days[dk(i)]||0;return m};
 const lg=(S.log||[]).filter(x=>x.f>0&&x.d>=dk(42));
 const subs=A.map(s=>{const w=impOf(s);let last=null;for(let i=0;i<120;i++)if((s.days[dk(i)]||0)>0){last=i;break}
  const L=lg.filter(x=>x.sid===s.id&&x.d>=dk(28));return{s,w,r14:rng(s,0,14),p14:rng(s,14,28),last,n:L.length,fq:L.length?L.reduce((a,x)=>a+x.f,0)/L.length:null}});
 let d14=0,d14p=0,tot14=0,tot14p=0;for(let i=0;i<28;i++){const m=A.reduce((a,s)=>a+(s.days[dk(i)]||0),0);if(i<14){tot14+=m;if(m>0)d14++}else{tot14p+=m;if(m>0)d14p++}}
 const H={};lg.filter(x=>x.h!=null&&!isNaN(x.h)).forEach(x=>{const o=H[x.h]=H[x.h]||{h:x.h,n:0,f:0,m:0};o.n++;o.f+=x.f;o.m+=x.m});
 const hours=Object.values(H).filter(o=>o.n>=2).map(o=>({h:o.h,n:o.n,fq:o.f/o.n,m:o.m})).sort((a,b)=>b.fq-a.fq||b.m-a.m);
 const B={s:[0,0],m:[0,0],l:[0,0]};lg.forEach(x=>{const k=x.m<30?'s':x.m<60?'m':'l';B[k][0]++;B[k][1]+=x.f});
 const bk=Object.entries(B).filter(([k,v])=>v[0]>=3).map(([k,v])=>({k,n:v[0],fq:v[1]/v[0]})).sort((a,b)=>b.fq-a.fq);
 const idl=bk.length?({s:25,m:45,l:75})[bk[0].k]:50;
 const W=[0,0,0,0,0,0,0],WN=[0,0,0,0,0,0,0];for(let i=0;i<28;i++){const d=addD(t,-i),wd=(d.getDay()+6)%7;W[wd]+=A.reduce((a,s)=>a+(s.days[fmt(d)]||0),0);WN[wd]++}
 const wavg=W.map((v,i)=>WN[i]?v/WN[i]:0);
 const fqAll=lg.length?lg.reduce((a,x)=>a+x.f,0)/lg.length:null;
 return{t,T,subs,d14,d14p,tot14,tot14p,hours,bk,idl,wavg,fqAll,nlog:lg.length};
}
function coSlots(D,n,dur){const nw=new Date(),H=nw.getHours()+(nw.getMinutes()>40?2:1);let hs=D.hours.slice(0,3).map(o=>o.h);if(!hs.length)hs=[9,15,20];hs=[...new Set(hs)].sort((a,b)=>a-b);
 const out=[];const today=hs.filter(h=>h>=H&&h<=22);today.forEach(h=>out.push({h,day:'hoje'}));hs.forEach(h=>out.push({h,day:'amanhã'}));while(out.length<n)out.push({h:hs[out.length%hs.length],day:'amanhã'});return out.slice(0,n)}
function coPlan(D,c){
 const act=D.subs.filter(x=>x.w>0);if(!act.length)return[];
 const sw=act.reduce((a,x)=>a+x.w,0),tot=Math.max(1,D.tot14);
 const gap=x=>x.w/sw-x.r14/tot;let pick=[];
 if(c.f==='mat'){const x=act.find(y=>y.s.id===c.sid)||D.subs.find(y=>y.s.id===c.sid);if(x)pick=[{x,m:D.idl,why:`Bloco principal de ${x.s.name} no seu melhor horário de foco.`},{x,m:25,why:'Revisão ativa curta (sem consultar o material) para fixar o que viu no primeiro bloco.'}]}
 else if(c.f==='atr'){pick=act.filter(x=>x.last==null||x.last>=5).sort((a,b)=>(b.last==null?999:b.last)-(a.last==null?999:a.last)).slice(0,3).map(x=>({x,m:25,why:x.last==null?'Sem registro recente: um bloco curto só para retomar o contato.':`Há ${x.last} dias sem contato: bloco curto de retomada antes que o esquecimento aumente.`}))}
 else if(c.f==='qua'){const w=act.filter(x=>x.fq!=null).sort((a,b)=>a.fq-b.fq)[0]||act.sort((a,b)=>b.w-a.w)[0];pick=[{x:w,m:Math.min(D.idl,45),why:`Matéria com seu menor foco médio${w.fq!=null?' ('+w.fq.toFixed(1).replace('.',',')+'★)':''}: coloque no melhor horário, sem celular, e termine com 3 min de recuperação ativa.`}]}
 else if(c.f==='str'){const mn=stkMin(D.T),dn=Math.round(stkTot(D.T)),x=act.slice().sort((a,b)=>b.r14-a.r14)[0];const left=Math.max(0,mn-dn);pick=[{x,m:Math.max(25,Math.min(left||25,D.idl)),why:left>0?`Faltam ${hh(left)} para o mínimo de hoje (${hh(mn)}). Escolhi a matéria que você mais sustenta, para garantir o dia.`:`O mínimo de hoje (${hh(mn)}) já foi batido. Este bloco protege amanhã.`}]}
 else if(c.f==='laz'){const z=lzCfg(),b=lzBal();const r=z.rate*chMul()*.5/60;const need=b<0&&r>0?Math.ceil(-b/r):0;const x=act.slice().sort((a,b)=>b.w-a.w||a.s.diff-b.s.diff)[0];const n=Math.max(1,Math.min(3,Math.ceil(need/Math.max(D.idl,25))));for(let i=0;i<n;i++)pick.push({x,m:D.idl,why:need>0?`Dívida de lazer de ${lzN(b)}: foco 5★ rende mais lazer por minuto (estimativa conservadora: ${hh(need)} no total).`:'Sem dívida de lazer: use para adiantar matéria e ganhar folga.'})}
 else{pick=act.slice().sort((a,b)=>gap(b)-gap(a)).slice(0,3).map(x=>({x,m:D.idl,why:`Recebe ${Math.round(x.r14/tot*100)}% do seu tempo, mas pela importância deveria receber ~${Math.round(x.w/sw*100)}%.`}))}
 const sl=coSlots(D,pick.length,0);return pick.map((p,i)=>({...p,at:sl[i]}));
}
function coInsights(D,c){
 const I=[],f=x=>x.toFixed(1).replace('.',','),pc=(a,b)=>b>0?Math.round((a-b)/b*100):null;
 if(D.nlog<4&&D.tot14<120)I.push({p:0,t:'📊 Poucos dados ainda',b:'Registre blocos com a nota de foco (★) e o horário. Quanto mais registros, mais precisas ficam as análises de melhor hora, tamanho de bloco e foco por matéria.'});
 const dp=pc(D.tot14,D.tot14p);
 I.push({p:c.f==='str'?0:2,t:`📅 Consistência: ${D.d14} de 14 dias estudados`,b:`Total de ${hh(D.tot14)} nas últimas 2 semanas${dp!=null?` (${dp>=0?'+':''}${dp}% vs. as 2 anteriores)`:''}, média de ${hh(D.d14?D.tot14/D.d14:0)} por dia estudado. `+(D.d14<8?'O gargalo é a frequência, não a duração: os dias vazios deixam o esquecimento agir. Prefira blocos curtos todos os dias a maratonas esporádicas.':D.d14>=12?'Frequência excelente. O ganho agora está em direcionar o tempo para as matérias certas.':'Frequência razoável; faltam alguns dias para virar hábito sólido.')});
 if(D.hours.length>=2){const a=D.hours[0],z=D.hours[D.hours.length-1];I.push({p:c.f==='qua'?0:1,t:`⏰ Seu melhor horário: ${a.h}h`,b:`Foco médio de ${f(a.fq)}★ em ${a.n} blocos, contra ${f(z.fq)}★ às ${z.h}h. Reserve o melhor horário para a matéria mais pesada e deixe revisões leves para os horários fracos.`})}
 if(D.bk.length>=2){const a=D.bk[0],z=D.bk[D.bk.length-1],N={s:'menos de 30 min',m:'30 a 59 min',l:'60 min ou mais'};I.push({p:c.f==='qua'?0:2,t:`⏳ Tamanho ideal de bloco: ${N[a.k]}`,b:`Blocos de ${N[a.k]} dão ${f(a.fq)}★ de foco, enquanto os de ${N[z.k]} dão ${f(z.fq)}★. Tente padronizar seus blocos perto do tamanho mais forte.`})}
 const act=D.subs.filter(x=>x.w>0),sw=act.reduce((a,x)=>a+x.w,0),tot=Math.max(1,D.tot14);
 if(act.length>1&&D.tot14>0){const g=act.map(x=>({x,g:x.w/sw-x.r14/tot})).sort((a,b)=>b.g-a.g)[0];if(g.g>.08)I.push({p:c.f==='eq'?0:2,t:`⚖️ Desequilíbrio em ${g.x.s.name}`,b:`Ela recebe ${Math.round(g.x.r14/tot*100)}% do seu tempo, mas pela importância configurada deveria receber ~${Math.round(g.x.w/sw*100)}%. Se for de propósito, ajuste a importância; se não, é a primeira candidata ao próximo bloco.`})}
 const ab=act.filter(x=>x.last==null||x.last>=7).sort((a,b)=>(b.last==null?999:b.last)-(a.last==null?999:a.last));
 if(ab.length)I.push({p:c.f==='atr'?0:1,t:`🕳️ Matérias esquecidas: ${ab.slice(0,3).map(x=>x.s.name).join(', ')}`,b:ab.slice(0,3).map(x=>`${x.s.name} ${x.last==null?'sem registro recente':'há '+x.last+' dias'}`).join('; ')+'. Quanto maior a pausa, mais tempo custa retomar. Um bloco de 20 a 25 min de revisão ativa já interrompe a queda.'});
 const fl=act.filter(x=>x.fq!=null&&x.n>=3);if(fl.length&&D.fqAll!=null){const w=fl.slice().sort((a,b)=>a.fq-b.fq)[0];if(w.fq<D.fqAll-.4)I.push({p:c.f==='qua'?0:2,t:`🧠 Foco baixo em ${w.s.name}`,b:`Seu foco nela é ${f(w.fq)}★ (média geral ${f(D.fqAll)}★). Isso costuma indicar matéria difícil encaixada em horário ruim, ou blocos longos demais. Mova para o melhor horário e divida em blocos menores.`})}
 const dr=act.filter(x=>x.p14>=90&&x.r14<x.p14*.6).sort((a,b)=>(b.p14-b.r14)-(a.p14-a.r14))[0];
 if(dr)I.push({p:1,t:`📉 Queda em ${dr.s.name}`,b:`Foram ${hh(dr.p14)} nas 2 semanas anteriores e ${hh(dr.r14)} nas últimas 2 (${pc(dr.r14,dr.p14)}%). Confirme se é decisão sua ou se a matéria foi sendo empurrada por outras.`});
 const wn=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],av=D.wavg.reduce((a,b)=>a+b,0)/7;if(av>0){const i=D.wavg.indexOf(Math.min(...D.wavg));if(D.wavg[i]<av*.6)I.push({p:3,t:`📆 Dia mais fraco: ${wn[i]}`,b:`Você rende em média ${hh(D.wavg[i])} às ${wn[i]}, contra ${hh(av)} na média da semana. Em vez de exigir o normal, defina um mínimo pequeno e fixo para esse dia e proteja a sequência.`})}
 const z=lzCfg();if(z.on){const b=lzBal(),st=lzStep(),mn=stkMin(D.T),dn=Math.round(stkTot(D.T));I.push({p:c.f==='laz'||c.f==='str'?0:3,t:`😴 Lazer e streak hoje`,b:`Saldo de lazer ${lzS(b).replace('+','')} (degrau ${st}/5). Mínimo de estudo hoje: ${hh(mn)}; feito até agora: ${hh(dn)}.`+(b<=-480?' Atenção: abaixo de −10h no fim do dia a streak, a dívida de lazer e os Elos zeram.':st>=2?' Em degraus altos o ganho de lazer e o XP diminuem: quitar cedo compensa.':'')})}
 return I.sort((a,b)=>a.p-b.p);
}
function coTip(D,c){const T=CO_TP,i=Math.floor(Date.now()/864e5);let k='ger';if(D.d14<8)k='freq';else if(D.fqAll!=null&&D.fqAll<3.3)k='foco';else if(D.bk.length&&D.bk[0].k==='s')k='bloco';else if(i%2)k='rev';return T[k][i%T[k].length]}
function renderCoach(){
 const el=$('#coach-sec');if(!el||curPage!=='feed')return;
 const c=coCfg(),D=coData(),A=S.subjects.filter(s=>!s.arch);
 if(c.f==='mat'&&!A.some(s=>s.id===c.sid))c.sid=(A[0]||{}).id;
 const day=Math.floor(Date.now()/864e5),ph=CO_PH[day%CO_PH.length];
 const plan=coPlan(D,c),ins=coInsights(D,c);
 el.innerHTML=`<div class="mgs"><h2>🧭 Seu Coach</h2><p class="sub" style="margin:0 0 8px"><i>“${esc(ph)}”</i></p>
 <div style="display:flex;gap:10px;flex-wrap:wrap"><label style="flex:1 1 220px">O que focar agora<select id="co-f">${CO_F.map(([k,n])=>`<option value="${k}"${c.f===k?' selected':''}>${n}</option>`).join('')}</select></label>
 ${c.f==='mat'?`<label style="flex:1 1 200px">Matéria<select id="co-s">${A.map(s=>`<option value="${s.id}"${s.id===c.sid?' selected':''}>${esc(s.name)}</option>`).join('')}</select></label>`:''}</div></div>
 <div class="mgs"><h2>📌 Onde e quando estudar</h2>${plan.length?plan.map(p=>`<div class="chinfo" style="margin-bottom:8px;border-left:4px solid ${p.x.s.color}"><b>${esc(p.x.s.name)}</b> · ${p.at.day} às ${p.at.h}h · ${hh(p.m)}<br><span class="sub">${esc(p.why)}</span></div>`).join(''):'<p class="sub" style="margin:0">Sem sugestão para este foco agora (nenhuma matéria elegível). Tente outro foco.</p>'}<p class="sub" style="margin:6px 0 0;font-size:.8rem">Horários vêm dos seus registros de foco; sem dados suficientes, uso 9h, 15h e 20h.</p></div>
 <div class="mgs"><h2>🔍 Diagnóstico dos seus dados</h2>${ins.map(i=>`<div class="chinfo" style="margin-bottom:8px"><b>${esc(i.t)}</b><br><span class="sub">${esc(i.b)}</span></div>`).join('')}</div>
 <div class="mgs"><h2>🎓 Técnica para aplicar hoje</h2><p class="sub" style="margin:0">${esc(coTip(D,c))}</p></div>`;
}
document.addEventListener('change',e=>{if(e.target.id==='co-f'){coCfg().f=e.target.value;save();renderCoach()}else if(e.target.id==='co-s'){coCfg().sid=e.target.value;save();renderCoach()}});
renderFeed=(f0=>function(){f0();renderCoach()})(renderFeed);


route();

