/* ===== Lumi IA (Gemini) — aba nova, não altera a Lumi original ===== */
(function(){
const KK='corrente-ai-key',DM='gemini-3.8-flash';
const CK='corrente-ai-cfg';let mem=null;
const A=()=>{if(!mem){try{mem=JSON.parse(localStorage.getItem(CK))}catch(e){}if(!mem)mem=Object.assign({},S.ai||{});}
 mem.hist=Array.isArray(mem.hist)?mem.hist:[];if(!mem.model||mem.model==='gemini-2.5-flash')mem.model=DM;return mem};
const pst=()=>{const a=A();a.hist=a.hist.slice(-20).map(m=>({r:m.r,t:String(m.t).slice(0,4000),m:m.m}));
 try{localStorage.setItem(CK,JSON.stringify(a))}catch(e){toast('Armazenamento do navegador cheio: a Lumi IA lembra a conversa só até fechar a página. Use "Uso de armazenamento".')}};
const gk=()=>{try{return localStorage.getItem(KK)||sessionStorage.getItem(KK)||''}catch(e){return''}};
const sk=v=>{try{localStorage.removeItem(KK);sessionStorage.removeItem(KK)}catch(e){}
 if(!v)return;try{localStorage.setItem(KK,v)}catch(e){try{sessionStorage.setItem(KK,v);toast('Armazenamento cheio: a chave vale só até fechar esta página.')}catch(e2){}}};
const sf=(f,d)=>{try{return f()}catch(e){return d}};
const md=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
const SYS='Você é a Lumi IA, treinadora de estudos do app Corrente de Estudos. Responda em português do Brasil, de forma calorosa, curta e prática. Trabalhe em 3 níveis. (1) FATO: só afirme como fato o que está nos dados abaixo ou no MANUAL; nunca invente regras do app (ex.: tetos, travas, proteções de streak), datas, matérias ou números que não existam. (2) CÁLCULO: você tem total liberdade para somar, tirar médias, comparar dias/semanas/matérias, achar tendências, projetar ritmo necessário e cruzar os dados; mostre a conta de forma curta. (3) CONCLUSÃO: você pode e deve concluir e opinar com base nos cálculos, inclusive estimar chances (alta/média/baixa ou uma faixa aproximada) de cumprir metas e contratos, sempre dizendo que é estimativa e em que se baseou. Nunca afirme hábitos, horários ou preferências do estudante (ex.: «fins de semana são de descanso», «janela das 13h às 18h») que não estejam explícitos nos dados. Se faltar um dado importante, diga qual falta, mas ainda assim entregue a melhor análise possível com o que existe. Dê no máximo 3 sugestões concretas por resposta. Você recebe o ESTADO COMPLETO atual do app em estado_completo (timestamps são em milissegundos; compare com agora.ms para calcular tempos restantes, por exemplo no Terminal Lost, descanso, efeitos da Loja, desafios e contratos) e o texto que aparece nas telas agora em telas_agora. Procure a resposta ali antes de dizer que não sabe; só diga que não sabe se realmente não estiver nesses dados nem no manual. Você só orienta: não executa ações no app. Quando o saldo de lazer ou a dívida forem relevantes, considere-os. Sempre escreva tempos em horas e minutos (ex.: 2h15, 45 min, −9h59); só use minutos puros quando for menos de 1 hora, e nunca converta horas para minutos na resposta. Para perguntas sobre quanto estudar para o dia não passar do limite de lazer negativo (−9h59), use SOMENTE plano_fechar_dia (já considera ociosidade até a meia-noite e o limite correto); não use horas_para_zerar_saldo para isso. Para contas exatas do app use calculos_prontos, plano_fechar_dia e contratos_ativos_analise como base e confie neles; sobre essa base, analise livremente. Para ganhos, perdas e regras do app, siga o MANUAL; se uma regra não estiver nele, diga que não tem certeza em vez de supor. Você tem medias_por_dia_da_semana (média de cada dia da semana em todo o histórico e só no ano atual, já calculada; use para perguntas como média de domingo), historico_semanal_completo (todas as semanas), ultimos_14_dias_min (dia a dia) e total histórico por matéria para identificar padrões. Em ociosidade use os valores de ociosidade (taxa e reserva do usuário), nunca o padrão do app. Por padrão seja breve (até cerca de 5 linhas) e vá direto ao ponto; quando a pergunta pedir análise, probabilidade, comparação ou projeção, responda com a profundidade necessária (até cerca de 250 palavras): conta resumida, conclusão e o que fazer. Para saber que horas são ou que dia é hoje, use SEMPRE agora.hora_local, agora.data_local e agora.dia_da_semana: é o relógio do aparelho do estudante (fuso em agora.fuso, normalmente Brasília, UTC-03:00). Nunca responda a hora em UTC e nunca diga que o seu horário é UTC. Para calcular tempos restantes use agora.ms; ao dizer o horário de um momento, converta o timestamp para o fuso do estudante.';
function trm(v,d){if(Array.isArray(v))return v.slice(-15).map(x=>trm(x,d+1));if(v&&typeof v==='object'){if(d>5)return'[…]';const o={};for(const k in v)o[k]=trm(v[k],d+1);return o}if(typeof v==='string')return v.length>300?v.slice(0,300)+'…':v;return v}
function telas(){const o={};['#lvl','#gst','#today','#sum','#tm','#lzp','#chb','#panel','#pg-lost'].forEach(q=>{const e=$(q);if(e){const t=(e.textContent||'').replace(/\s+/g,' ').trim();if(t)o[q]=t.slice(0,1200)}});return o}
function agoraLocal(){const d=new Date(),o=-d.getTimezoneOffset(),a=Math.abs(o),tz=sf(()=>Intl.DateTimeFormat().resolvedOptions().timeZone,'');
 return{hora_local:p2(d.getHours())+':'+p2(d.getMinutes()),data_local:p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear(),dia_da_semana:['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'][d.getDay()],fuso:(tz?tz+' ':'')+'UTC'+(o<0?'-':'+')+p2(Math.floor(a/60))+':'+p2(a%60),ms:d.getTime()}}
function semanasHist(){const w={};S.subjects.forEach(s=>Object.entries(s.days||{}).forEach(([k,m])=>{if(!(m>0))return;const d=new Date(k+'T12:00:00');if(isNaN(d))return;const mk=fmt(monday(d));const o=w[mk]=w[mk]||{m:0,n:new Set()};o.m+=m;o.n.add(k)}));return Object.keys(w).sort().map(k=>({semana_iniciada_em:k,estudo:hh(w[k].m),dias_estudados:w[k].n.size}))}
function mediasDia(){const tot={};S.subjects.forEach(s=>Object.entries(s.days||{}).forEach(([k,m])=>{if(m>0)tot[k]=(tot[k]||0)+m}));const ks=Object.keys(tot).sort();if(!ks.length)return null;
 const N=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],hoje=fmt(now());
 const calc=(ini)=>{const a=N.map(()=>({s:0,n:0,e:0}));let d=new Date(ini+'T12:00:00');const fim=new Date(hoje+'T12:00:00');while(d<=fim){const k=fmt(d),g=d.getDay(),v=tot[k]||0;a[g].s+=v;a[g].n++;if(v>0)a[g].e++;d=addD(d,1)}
  const o={};N.forEach((n,i)=>{const x=a[i];o[n]={media_contando_todos_os_dias:hh(x.n?x.s/x.n:0),media_so_dias_estudados:hh(x.e?x.s/x.e:0),dias_no_periodo:x.n,dias_estudados:x.e,total:hh(x.s)}});return o};
 const por_ano={};ks.forEach(k=>{const y=k.slice(0,4);const o=por_ano[y]=por_ano[y]||{m:0,n:0};o.m+=tot[k];o.n++});
 const y0=hoje.slice(0,4)+'-01-01',ini26=ks[0]>y0?ks[0]:y0;
 return{primeiro_registro:ks[0],todo_o_historico:calc(ks[0]),so_ano_atual:calc(ini26),por_ano:Object.keys(por_ano).map(y=>({ano:y,total:hh(por_ano[y].m),dias_estudados:por_ano[y].n,media_por_dia_estudado:hh(por_ano[y].m/por_ano[y].n)}))}}
function contratosAn(){const c=cfCfg(),dias=[...Array(14)].map((_,i)=>fmt(addD(now(),-i))),h14=dias.map(d=>allTot(d)),avg=h14.reduce((a,b)=>a+b,0)/14,mx=Math.max(...h14);
 return c.contracts.filter(k=>k.status==='active').map(k=>{const feito=S.subjects.reduce((a,s)=>a+Object.entries(s.days||{}).filter(([d])=>d>=k.start&&d<=k.end).reduce((x,[,m])=>x+m,0),0),falta=Math.max(0,k.targetMin-feito),rest=Math.max(0,(new Date(k.end+'T23:59:59').getTime()+1000-Date.now())/6e4),nd=rest/1440,rit=nd>0?falta/nd:null;
  return{nome:k.name,periodo:k.start+' a '+k.end+' (termina às 24h de '+k.end+')',meta:hh(k.targetMin),feito:hh(feito),falta:hh(falta),tempo_restante_ate_o_fim:hh(rest),ritmo_necessario_por_dia_de_24h:rit==null?null:hh(rit),media_diaria_ultimos_14_dias:hh(avg),melhor_dia_ultimos_14:hh(mx),dias_dos_ultimos_14_que_bateram_esse_ritmo:rit==null?null:h14.filter(v=>v>=rit).length+' de 14',recompensa:k.rewardMin?hh(k.rewardMin)+' de lazer':k.rewardXp?k.rewardXp+' XP':'—',penalidade_se_falhar:k.penaltyMin?hh(k.penaltyMin)+' de dívida de lazer':'—'}})}
function idleInfo(){const di=idCfg(),c=lpCfg(),n=new Date(),left=1440-(n.getHours()*60+n.getMinutes());return{cobranca_ligada:di.on,lazer_perdido_por_hora_ociosa:hh(di.lr),xp_perdido_por_hora_ociosa_sem_lazer:di.xr,reserva_refeicao_rotina_hoje:hh(c.res)+' (não conta como ociosa se você iniciar a rotina em Tempo parado)',tempo_restante_no_dia:hh(left)}}
function ctx(){
 const t=fmt(now()),days=[...Array(14)].map((_,i)=>fmt(addD(now(),-i))),nm={};S.subjects.forEach(s=>nm[s.id]=s.name);
 const {subjects:_a,log:_b,rec:_c,ai:_d,...rest}=S;
 return{agora:sf(agoraLocal,{ms:Date.now()}),estado_completo:sf(()=>trm(rest,0),null),telas_agora:sf(telas,null),hoje:t,streak_geral:sf(()=>{const g=gstreak();return{atual:g.c,recorde:g.b}},null),minimo_diario_min:sf(()=>stkMin(t),30),
  min_planejados_hoje:sf(()=>Math.round(plTot(t)),null),
  ultimos_14_dias_min:days.map(k=>({dia:k,total:sf(()=>Math.round(allTot(k)),0),planejado:sf(()=>Math.round(plTot(k)),0)})),
  saldo_lazer_min:sf(()=>Math.round(lzBal()),null),degrau_atual:sf(()=>lzStep(),null),elos:sf(()=>Math.round(elBal()),null),calculos_prontos:{minutos_de_estudo_planejado_para_zerar_saldo_de_lazer:sf(()=>{const m=simZero();return m},null),horas_para_zerar_saldo:sf(()=>(simZero()/60).toFixed(1),null),obs:'simulação com as regras atuais (taxa de lazer, degraus, castigo, boost); não inclui dívida de estudo nem bônus de foco 5★'},divida_estudo_min:sf(()=>Math.round(lzDebt()),null),
  ociosidade:sf(idleInfo,null),contratos_ativos_analise:sf(contratosAn,null),historico_semanal_completo:sf(semanasHist,null),medias_por_dia_da_semana:sf(mediasDia,null),
  plano_fechar_dia:sf(()=>{const z=lzCfg();if(!z.on)return null;const c=lpCtx(),b0=c.fin(0,0),pc=pdlCalc(),md=Object.keys(LP_M).map(k=>{const r=c.need(LP_M[k].f);return{modo:LP_M[k].n+(LP_M[k].f>=1?' (tudo com foco 5★)':LP_M[k].f>0?' (metade com foco 5★)':' (sem foco 5★)'),estudo_minimo_adicional_hoje:r.ok?hh(r.x):'não alcança até a meia-noite'}});
   return{limite_seguro_do_dia:'−9h59 (chegar a −10h não é permitido)',saldo_atual:lzS(Math.round(lzBal())),saldo_previsto_a_meia_noite_sem_estudar_mais:lzS(Math.round(b0)),ja_estudou_hoje:hh(Math.round(stkTot(fmt(now())))),estudo_minimo_adicional_hoje_por_modo:md,pocao_sem_estudar:pc.credit>0?'a Poção de perdão de dívida de lazer repõe '+lzN(pc.credit)+' e fecha o dia no limite':'não precisa',obs:'Já inclui a ociosidade até a meia-noite e desconta a reserva de refeições/rotina configurada. O menor valor entre os modos é o mínimo absoluto (exige foco 5★ no cronômetro).'}},null),
  materias:S.subjects.map(s=>({nome:s.name,arquivada:!!s.arch,dificuldade_1a3:sf(()=>diffOf(s),null),importancia_0a3:sf(()=>impOf(s),null),streak:sf(()=>streak(s),0),melhor_streak:sf(()=>best(s),0),
   min_ultimos_14_dias:Math.round(days.reduce((a,k)=>a+(s.days[k]||0),0)),min_total_historico:Math.round(Object.values(s.days||{}).reduce((a,b)=>a+(+b||0),0)),
   tarefas_pendentes:(s.topics||[]).filter(x=>!x.done).slice(0,12).map(x=>({nome:x.name,data:x.date||null,estimativa_min:x.est||x.dur||null,prioridade:x.prio,prova:!!x.exam})),
   metas_de_dias:(s.goals||[]).slice(-2).map(g=>({de:g.start,ate:g.end,dias:g.target}))})),
  anotacoes_recentes:(S.log||[]).slice(-25).map(x=>({dia:x.d,materia:nm[x.sid]||'?',min:x.m,foco_1a5:x.f||null,texto:x.w||''}))}}
const MK='corrente-ai-manual';let man=null;
const MP='Você é um engenheiro de software lendo o código-fonte COMPLETO e ATUAL de um app de estudos chamado Corrente de Estudos. Escreva um MANUAL DE REGRAS em português do Brasil que será usado por outra IA para responder dúvidas do usuário sobre o app. Regras: (1) use SOMENTE o que está no código; não invente nem complete com suposições; (2) inclua números, padrões e fórmulas EXATAS (ex.: como o ganho de lazer é calculado, com todos os multiplicadores e a ordem das condições); (3) cubra: telas e navegação; matérias e dias estudados; streak da matéria e streak geral (mínimo diário, Day Off, congelamento, quando zera); planejado x fora do plano; XP e níveis; Elos; banco de lazer (ganho, dívida, empréstimo, uso, ociosidade, degraus e seus efeitos, plano de quitação, poções); Loja (efeito e preço de cada item); desafios, desafio do dia, Modo Castigo; contratos de foco; Tudo ou Nada; cronômetro e técnicas; tarefas, provas e revisões; plano semanal; metas e recompensas; relatórios, histórico, calendário; recordes e conquistas; Terminal Lost; Coach e Lumi; backup. (4) Seja denso e conciso (até cerca de 3000 palavras), em tópicos curtos; (5) quando algo depender de configuração do usuário, diga o padrão e que é configurável.';
function src(){return [...document.scripts].map(x=>x.textContent||'').filter(t=>t.length>200&&!/Lumi IA \(Gemini\)/.test(t)).join('\n\n').replace(/[A-Za-z0-9+\/=]{300,}/g,'[dados]')}
function hsh(t){let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return t.length+':'+(h>>>0)}
const getMan=()=>{try{return JSON.parse(localStorage.getItem(MK))||man}catch(e){return man}};
async function gcall(model,body,key){
 let r,j;for(let t=0;t<4;t++){
  r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)});
  j=await r.json().catch(()=>({}));
  if(![429,500,503].includes(r.status)||t===3)break;await new Promise(z=>setTimeout(z,4000*(t+1)));}
 if(!r.ok)throw new Error((j.error&&j.error.message)||('erro '+r.status));
 const c=((j.candidates||[])[0]||{}).content;return c&&c.parts?c.parts.map(x=>x.text||'').join(''):''}
async function mkManual(force){
 const code=src(),h=hsh(code),m=getMan();
 if(!force&&m&&m.h===h&&m.t)return m.t;
 bm='Lendo o código do app para aprender as regras (só na 1ª vez e quando o app for atualizado; pode levar cerca de 1 minuto)…';draw();
 const nav=[...new Set([...document.querySelectorAll('[data-a="nav"][data-p]')].map(b=>b.textContent.trim()))].join(' | ');
 const t=await gcall(A().model,{contents:[{role:'user',parts:[{text:MP+'\n\nATALHOS DA TELA INICIAL: '+nav+'\n\n===== CÓDIGO-FONTE =====\n'+code}]}],generationConfig:{temperature:.2,maxOutputTokens:8192}},gk());
 if(!t||t.length<500)throw new Error('o Gemini devolveu um manual vazio ou curto demais.');
 man={h,t,d:new Date().toISOString()};try{localStorage.setItem(MK,JSON.stringify(man))}catch(e){}
 return t}
function rules(){let o='';
 sf(()=>{const z=lzCfg();o+='\nPARÂMETROS ATUAIS: lazer rende '+z.rate+' min por hora de estudo planejado; bônus de foco 5★ x'+z.bonus+'; juros do empréstimo '+z.li+'%; empréstimo máximo '+z.lm+' min.'});
 sf(()=>{o+='\nLOJA ATUAL: '+SHOP.map(x=>x.n+' ('+x.p+' Elos, limite '+x.l+'/semana: '+x.d+')').join('; ')});
 sf(()=>{o+='\nNÍVEIS DE DESAFIO: '+Object.values(CH_NIV).map(n=>n.n+' '+n.lo+'-'+n.hi+' min/dia').join('; ')});
 sf(()=>{o+='\nTÉCNICAS: '+Object.values(TECH).filter(t=>t.f).map(t=>t.n+' (foco '+t.f+'/pausa '+t.b+')').join(', ')});
 return o}
function simZero(){const z=lzCfg(),hx=shCfg(),n=Date.now(),cm=chMul(),bs=hx.bst>n?1.25:1,gd=hx.gld>n?2:1;let b=lzBal(),m=0;if(b>=0)return 0;
 while(b<0&&m<100000){const st=b>=-60?1:b>=-180?2:b>=-360?3:b>=-600?4:5;b+=z.rate/60*cm*(st>=2?.5:1)*bs*gd;m++}return m}
let busy=false,bm='';
function draw(){
 const a=A(),lg=$('#lia-log');if(!lg)return;
 lg.innerHTML=a.hist.length?a.hist.map(m=>`<div class="lia-m ${m.r}">${md(m.t)}</div>`+(m.m?`<div class="sub" style="font-size:.75rem;margin:-4px 0 6px">${esc(m.m)}</div>`:'')).join('')+(busy&&(!a.hist.length||a.hist[a.hist.length-1].r!=='model')?'<div class="lia-m model">'+(bm||'Pensando…')+'</div>':''):'<p class="sub">Oi! Eu analiso seus dados de estudo e respondo de forma personalizada. Escolha uma pergunta ou escreva a sua.</p>';
 lg.scrollTop=lg.scrollHeight;
 const g=$('#lia-go');if(g)g.disabled=busy;
}
async function ask(q){
 const a=A();
 {const ki=$('#lia-key'),mo=$('#lia-mod'),ck=$('#lia-ok');if(ki&&ki.value.trim()!==gk())sk(ki.value.trim());if(mo&&mo.value.trim())a.model=mo.value.trim();if(ck)a.ok=ck.checked}
 const k=gk();
 if(!k){toast('Cole sua chave do Gemini em Configurações.');$('#lia-cfg').open=true;return}
 if(!a.ok){toast('Marque o aviso de privacidade para continuar.');$('#lia-cfg').open=true;return}
 if(busy||!q.trim())return;
 a.hist.push({r:'user',t:q.trim()});a.hist=a.hist.slice(-40);busy=true;pst();draw();
 let mt='';try{mt=await mkManual(false)}catch(e){a.hist.push({r:'err',t:'Não consegui montar o manual do app a partir do código: '+e.message});bm='';busy=false;pst();draw();return}
 bm='';draw();
 const mk=th=>JSON.stringify({systemInstruction:{parts:[{text:SYS+'\n\nMANUAL DO APP (gerado a partir do código atual; confie nele):\n'+mt+rules()+'\n\nDADOS DO ESTUDANTE (JSON, atualizados agora):\n'+JSON.stringify(ctx())}]},
  contents:a.hist.filter(m=>m.r!=='err').slice(-12).map(m=>({role:m.r==='user'?'user':'model',parts:[{text:m.t}]})),
  generationConfig:Object.assign({temperature:.7,maxOutputTokens:an?2000:800},th?{thinkingConfig:th}:{})});
 const an=/probab|chance|an[aá]lis|c[aá]lcul|quanto|consig|alcan|projet|m[eé]dia|tend[eê]n|compar|contrato|meta|por que|porque|vale a pena|devo|conclu|hist[oó]ric/i.test(q),ths=[{thinkingLevel:an?'low':'minimal'},{thinkingBudget:an?1024:0},null],sl=ms=>new Promise(z=>setTimeout(z,ms));
 let msg=null;const t0=performance.now();let nat=0,tf=0,tu=null;
 try{
  let r,ti=0,t=0;
  while(true){
   nat++;r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(a.model)+':streamGenerateContent?alt=sse',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':k},body:mk(ths[ti])});
   if(r.ok)break;
   const j=await r.json().catch(()=>({})),m=(j.error&&j.error.message)||('erro '+r.status);
   if(r.status===400&&ti<2&&/think/i.test(m)){ti++;continue}
   if([429,500,503].includes(r.status)&&t<3){t++;bm='Servidor do Google ocupado, tentando de novo ('+t+'/3)…';draw();await sl(3000*t);continue}
   throw new Error(r.status===503||/high demand|overloaded/i.test(m)?'o modelo do Google está sobrecarregado agora. Já tentei 4 vezes; tente de novo em alguns minutos ou troque o modelo em Configurações.':m);
  }
  bm='';
  const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
  while(true){
   const{done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});
   let n;while((n=buf.indexOf('\n'))>=0){const line=buf.slice(0,n).trim();buf=buf.slice(n+1);
    if(!line.startsWith('data:'))continue;
    try{const d=JSON.parse(line.slice(5)),c=(d.candidates||[])[0],tx=c&&c.content&&c.content.parts?c.content.parts.map(x=>x.text||'').join(''):'';
     if(d.usageMetadata)tu=d.usageMetadata;if(tx){if(!msg){msg={r:'model',t:''};a.hist.push(msg);tf=performance.now()}msg.t+=tx;draw()}}catch(e){}}
  }
  if(!msg)a.hist.push({r:'model',t:'(Sem resposta. Tente reformular a pergunta.)'});
  else{const f=x=>((x-t0)/1000).toFixed(1)+'s';msg.m='⏱ total '+f(performance.now())+' · 1ª palavra '+f(tf)+' · chamadas '+nat+' · raciocínio '+[an?'baixo':'minimal',an?'budget 1024':'budget 0','padrão'][ti]+(tu?' · tokens: entrada '+(tu.promptTokenCount||0)+', pensamento '+(tu.thoughtsTokenCount||0)+', saída '+(tu.candidatesTokenCount||0):'')}
 }catch(e){a.hist.push({r:'err',t:'Não consegui falar com o Gemini: '+e.message})}
 bm='';busy=false;pst();draw();
}
function build(el){
 const a=A(),Q=['Como foi minha semana?','O que devo priorizar hoje?','Qual matéria estou deixando de lado?','Monte um plano de estudo para hoje','Estou cansado, o que faço?'];
 el.innerHTML=`<style>
 #lia-face svg{width:72px;height:72px}
 #lia .lia-m{width:fit-content;padding:10px 14px;border-radius:16px;margin:8px 0;max-width:88%;line-height:1.45;word-wrap:break-word}
 #lia .lia-m.user{background:var(--flame);color:#fff;margin-left:auto;border-bottom-right-radius:4px}
 #lia .lia-m.model{background:var(--bg);border:1px solid var(--line);border-bottom-left-radius:4px}
 #lia .lia-m.err{background:rgba(239,68,68,.12);border:1px solid #ef4444;font-size:.9rem}
 #lia #lia-log{height:min(52vh,460px);overflow-y:auto;padding:4px 2px}
 #lia .lia-q{display:flex;gap:8px;margin-top:10px}#lia .lia-q textarea{flex:1;min-height:44px;max-height:120px;resize:vertical;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit}
 #lia .lia-ch{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}#lia .lia-ch .ghost{padding:5px 10px;font-size:.85rem}
 #lia details{margin-bottom:12px}#lia details label{display:block;margin:8px 0 2px;font-size:.85rem;color:var(--muted)}#lia details input[type=password],#lia details input[type=text]{width:100%}
 </style>
 <div class="mgs">
  <details id="lia-cfg"${gk()&&a.ok?'':' open'}><summary style="cursor:pointer;font-weight:600">⚙️ Configurações</summary>
   <label for="lia-key">Chave da API do Google Gemini (fica só neste navegador e não entra no backup)</label><input type="password" id="lia-key" autocomplete="off" value="${esc(gk())}" placeholder="Cole sua chave do Google AI Studio">
   <label for="lia-mod">Modelo</label><input type="text" id="lia-mod" value="${esc(a.model)}">
   <label class="ck" style="display:flex;gap:8px;align-items:flex-start;margin-top:10px"><input type="checkbox" id="lia-ok"${a.ok?' checked':''}><span>Entendo que, a cada pergunta, um resumo dos meus dados de estudo (matérias, tempos, tarefas, anotações, lazer) é enviado ao Google. No plano gratuito do Gemini o Google pode usar esses dados para melhorar seus produtos.</span></label>
   <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn main" id="lia-save">Salvar</button><button class="btn" id="lia-rm">Remover chave</button><button class="ghost" id="lia-dg">Uso de armazenamento</button><button class="ghost" id="lia-mn">Atualizar manual do app</button><button class="ghost" id="lia-mv">Ver manual</button><button class="ghost" id="lia-ml">Ver modelos disponíveis</button></div><div class="lia-ch" id="lia-mlo"></div><p class="sub" id="lia-dgo" style="margin:8px 0 0"></p>
  </details>
  <div id="lia-log" aria-live="polite"></div>
  <div class="lia-ch">${Q.map(q=>`<button type="button" class="ghost" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  <div class="lia-q"><textarea id="lia-q" rows="1" maxlength="1000" placeholder="Pergunte algo sobre seus estudos…" aria-label="Pergunta para a Lumi IA"></textarea><button class="btn main" id="lia-go">Enviar</button></div>
  <div style="margin-top:8px"><button class="ghost" id="lia-clr">Limpar conversa</button></div>
 </div>`;
 el.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.q){ask(b.dataset.q);return}
  if(b.id==='lia-go'){const t=$('#lia-q');const v=t.value;t.value='';ask(v)}
  else if(b.id==='lia-save'){const a=A();sk($('#lia-key').value.trim());a.model=$('#lia-mod').value.trim()||DM;a.ok=$('#lia-ok').checked;pst();toast('Configurações salvas.');if(gk()&&a.ok)$('#lia-cfg').open=false}
  else if(b.dataset.mod){$('#lia-mod').value=b.dataset.mod;A().model=b.dataset.mod;pst();toast('Modelo selecionado: '+b.dataset.mod)}
  else if(b.id==='lia-ml'){const o=$('#lia-mlo'),kv=($('#lia-key').value.trim()||gk());if(!kv){toast('Cole a chave primeiro.');return}o.textContent='Buscando modelos…';
   fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100',{headers:{'x-goog-api-key':kv}}).then(r=>r.json()).then(j=>{if(j.error)throw new Error(j.error.message);
    const L=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')&&/gemini/.test(m.name)).map(m=>m.name.replace('models/','')).sort((x,y)=>(/flash/.test(y)-/flash/.test(x))||x.localeCompare(y)).slice(0,30);
    o.innerHTML=L.length?L.map(n=>`<button type="button" class="ghost" data-mod="${esc(n)}">${esc(n)}</button>`).join(''):'Nenhum modelo Gemini disponível para esta chave.'}).catch(e=>{o.textContent='Não consegui listar: '+e.message})}
  else if(b.id==='lia-dg'){let t=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);t+=k.length+(localStorage.getItem(k)||'').length}}catch(e){}
   const pr=Object.entries(S).map(([k,v])=>[k,JSON.stringify(v==null?0:v).length]).sort((x,y)=>y[1]-x[1]).slice(0,5);
   $('#lia-dgo').textContent='Total no navegador: '+(t/1e6).toFixed(2)+' milhões de caracteres (limite típico: 5 milhões). Maiores partes dos seus dados: '+pr.map(([k,n])=>k+' '+Math.round(n/1024)+' KB').join(', ')+'.'}
  else if(b.id==='lia-mn'){if(!gk()||busy){toast('Salve a chave antes (ou aguarde a resposta atual).');return}
   busy=true;draw();mkManual(true).then(()=>toast('Manual atualizado a partir do código atual.')).catch(e=>toast('Falhou: '+e.message)).finally(()=>{bm='';busy=false;draw()})}
  else if(b.id==='lia-mv'){const m=getMan(),o=$('#lia-dgo');o.style.whiteSpace='pre-wrap';o.textContent=m?'Manual gerado em '+new Date(m.d).toLocaleString()+' a partir do código:\n\n'+m.t:'Ainda não gerado. Ele é criado sozinho na primeira pergunta.'}
  else if(b.id==='lia-rm'){sk('');$('#lia-key').value='';toast('Chave removida deste navegador.')}
  else if(b.id==='lia-clr'){if(!A().hist.length||confirm('Apagar toda a conversa com a Lumi IA?')){A().hist=[];pst();draw()}}
 });
 el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&e.target.id==='lia-q'){e.preventDefault();$('#lia-go').click()}});
 draw();
}
function icons(){[['lm-ico','lia-ico'],['lm-ico2','lia-ico2'],['lm-ico2','lia-face']].forEach(([a,b])=>{const x=$('#'+a),y=$('#'+b);if(!x||!y||!x.innerHTML)return;let h=x.innerHTML;[...h.matchAll(/id="([^"]+)"/g)].forEach(m=>{const i=m[1];h=h.split('id="'+i+'"').join('id="'+i+'-ia"').split('#'+i+')').join('#'+i+'-ia)')});if(y.innerHTML!==h)y.innerHTML=h})}
function lia(){icons();if(curPage!=='lumiia')return;const el=$('#lia');if(!el)return;if(!el.dataset.b){el.dataset.b=1;build(el)}}
const _r=window.render;window.render=function(){const x=_r.apply(this,arguments);try{lia()}catch(e){console.error(e)}return x};
lia();setTimeout(icons,0);
})();
