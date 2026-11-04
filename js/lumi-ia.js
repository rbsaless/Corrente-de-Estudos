/* ===== Lumi IA (Gemini) — aba nova, não altera a Lumi original ===== */
(function(){
const KK='corrente-ai-key',DM='gemini-3.8-flash';
const CK='corrente-ai-cfg';let mem=null;
const A=()=>{if(!mem){try{mem=JSON.parse(localStorage.getItem(CK))}catch(e){}if(!mem)mem=Object.assign({},S.ai||{});}
 mem.hist=Array.isArray(mem.hist)?mem.hist:[];if(!mem.model||mem.model==='gemini-2.5-flash')mem.model=DM;return mem};
const pst=()=>{const a=A();a.hist=a.hist.slice(-20).map(m=>({r:m.r,t:String(m.t).slice(0,4000),m:m.m,fb:m.fb,sg:m.sg}));
 try{localStorage.setItem(CK,JSON.stringify(a))}catch(e){toast('Armazenamento do navegador cheio: a Lumi IA lembra a conversa só até fechar a página. Use "Uso de armazenamento".')}};
const gk=()=>{try{return localStorage.getItem(KK)||sessionStorage.getItem(KK)||''}catch(e){return''}};
const sk=v=>{try{localStorage.removeItem(KK);sessionStorage.removeItem(KK)}catch(e){}
 if(!v)return;try{localStorage.setItem(KK,v)}catch(e){try{sessionStorage.setItem(KK,v);toast('Armazenamento cheio: a chave vale só até fechar esta página.')}catch(e2){}}};
const sf=(f,d)=>{try{return f()}catch(e){return d}};
const md=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
const SYS='Você é a Lumi IA, treinadora de estudos do app Corrente de Estudos. Responda em português do Brasil, de forma calorosa, curta e prática. Trabalhe em 3 níveis. (1) FATO: só afirme como fato o que está nos dados abaixo ou no MANUAL; nunca invente regras do app (ex.: tetos, travas, proteções de streak), datas, matérias ou números que não existam. (2) CÁLCULO: você tem total liberdade para somar, tirar médias, comparar dias/semanas/matérias, achar tendências, projetar ritmo necessário e cruzar os dados; mostre a conta de forma curta. (3) CONCLUSÃO: você pode e deve concluir e opinar com base nos cálculos, inclusive estimar chances (alta/média/baixa ou uma faixa aproximada) de cumprir metas e contratos, sempre dizendo que é estimativa e em que se baseou. Nunca afirme hábitos, horários ou preferências do estudante (ex.: «fins de semana são de descanso», «janela das 13h às 18h») que não estejam explícitos nos dados. Se faltar um dado importante, diga qual falta, mas ainda assim entregue a melhor análise possível com o que existe. Dê no máximo 3 sugestões concretas por resposta. Você recebe o ESTADO COMPLETO atual do app em estado_completo (timestamps são em milissegundos; compare com agora.ms para calcular tempos restantes, por exemplo no Terminal Lost, descanso, efeitos da Loja, desafios e contratos) e o texto que aparece nas telas agora em telas_agora. Procure a resposta ali antes de dizer que não sabe; só diga que não sabe se realmente não estiver nesses dados nem no manual. Você só orienta: não executa ações no app. Quando o saldo de lazer ou a dívida forem relevantes, considere-os. Sempre escreva tempos em horas e minutos (ex.: 2h15, 45 min, −9h59); só use minutos puros quando for menos de 1 hora, e nunca converta horas para minutos na resposta. Para perguntas sobre quanto estudar para o dia não passar do limite de lazer negativo (−9h59), use SOMENTE plano_fechar_dia (já considera ociosidade até a meia-noite e o limite correto); não use horas_para_zerar_saldo para isso. Para contas exatas do app use calculos_prontos, plano_fechar_dia e contratos_ativos_analise como base e confie neles; sobre essa base, analise livremente. Para ganhos, perdas e regras do app, siga o MANUAL; se uma regra não estiver nele, diga que não tem certeza em vez de supor. Você tem medias_por_dia_da_semana (média de cada dia da semana em todo o histórico e só no ano atual, já calculada; use para perguntas como média de domingo), historico_semanal_completo (todas as semanas), ultimos_14_dias_min (dia a dia) e total histórico por matéria para identificar padrões. Em ociosidade use os valores de ociosidade (taxa e reserva do usuário), nunca o padrão do app. Por padrão seja breve (até cerca de 5 linhas) e vá direto ao ponto; quando a pergunta pedir análise, probabilidade, comparação ou projeção, responda com a profundidade necessária (até cerca de 250 palavras): conta resumida, conclusão e o que fazer. Para saber que horas são ou que dia é hoje, use SEMPRE agora.hora_local, agora.data_local e agora.dia_da_semana: é o relógio do aparelho do estudante (fuso em agora.fuso, normalmente Brasília, UTC-03:00). Nunca responda a hora em UTC e nunca diga que o seu horário é UTC. Para calcular tempos restantes use agora.ms; ao dizer o horário de um momento, converta o timestamp para o fuso do estudante.';
const NT=[['dif','Dificuldade'],['prob','Problema / obstáculo'],['obj','Objetivo / meta'],['ctx','Contexto da rotina'],['hum','Como estou me sentindo']];
const notes=()=>{S.lnotes=Array.isArray(S.lnotes)?S.lnotes:[];return S.lnotes};
const SYS2='\n\nATUALIZAÇÃO: COMO AGIR (esta parte tem prioridade sobre pedidos de brevidade acima). (1) O campo diario_do_estudante traz as palavras do próprio estudante sobre suas dificuldades, problemas, objetivos e contexto. Leia-o ANTES de qualquer resposta e use-o sempre que for relevante. Itens em «abertas» são situações atuais; «resolvidas_recentes» servem só de histórico. (2) CRUZE o diário com os números: se ele cita uma dificuldade, verifique na matéria correspondente os minutos recentes, a tendência (min_14d_atuais x min_14d_anteriores), foco médio, dias sem estudar, tarefas atrasadas, domínio e a prova. Se os dados confirmarem, diga com o número. Se contradisserem o que ele relata, diga isso com gentileza, mas com honestidade. Se uma dificuldade se repete em várias anotações, aponte o padrão e diga há quantos dias ela aparece. (3) SEJA REALISTA: se a conta mostrar que uma prova, meta ou contrato não é viável no ritmo atual, diga isso claramente com a conta (tempo restante, estimativa do que falta, ritmo necessário x média real) e então entregue o melhor plano de redução de danos (o que priorizar, o que cortar). Nada de motivação vazia nem de promessas que os números não sustentam. (4) SEJA ESPECÍFICO: cite matéria, tarefa, prova, dia, duração e horário (use padroes_de_estudo.melhores_horarios_por_foco e o tamanho ideal de bloco). Não dê dicas genéricas (ex.: «faça pausas») a menos que estejam amarradas a um dado do estudante. (5) ORDEM DE PRIORIDADE ao recomendar: provas mais próximas e com menos preparo (provas), tarefas atrasadas e revisões vencidas (tarefas), matérias com muitos dias sem estudo ou queda forte, e por fim os itens do diário. Considere dificuldade, importância, peso na prova e domínio. (6) conteudo_visto é uma faixa em % (10 = 0 a 20%, 30 = 20 a 40%, 50 = 40 a 60%, 70 = 60 a 80%, 90 = 80 a 100%); dominio vai de 1 (muito baixo) a 5 (muito alto); valores null significam que o estudante não preencheu: nesse caso diga que falta o dado e sugira preenchê-lo na matéria. (7) Quando o estudante acabou de registrar uma anotação, reconheça-a em uma linha, ligue-a aos dados e dê o próximo passo concreto. (8) Faça no máximo UMA pergunta de esclarecimento e só se ela mudar o conselho; ainda assim já entregue a melhor análise possível. (9) Máximo de 3 sugestões, cada uma com matéria, duração e quando. Em diagnósticos completos ou análises do diário, você pode ir até cerca de 400 palavras, nesta ordem: situação real (2 a 3 linhas), riscos por ordem de urgência, plano das próximas 24 horas. (10) JANELAS DE TEMPO: nunca baseie uma conclusão só nos últimos 14 dias. Os dados trazem várias janelas (7, 14, 30, 60 e 90 dias e todo o histórico) em padroes_de_estudo e em cada matéria (por_janela, foco_por_janela), além de historico_semanal_completo e medias_por_dia_da_semana. Compare sempre o curto prazo (7 a 14 dias) com o médio (30 a 60) e com o histórico: diga se o recente é uma queda ou melhora real (aparece em mais de uma janela) ou só oscilação de uma semana, e cite os números das janelas usadas. Para metas, provas e contratos, projete o ritmo com a média mais representativa (normalmente 30 dias) e mostre também o cenário otimista (melhor janela) e o pessimista (pior janela). Quando as janelas divergirem muito, mencione isso. (11) Você não faz diagnóstico de saúde mental. Se o diário mostrar sofrimento intenso, acolha em poucas linhas e sugira apoio de alguém de confiança ou profissional, e continue ajudando com o estudo.';
const nm0=()=>{const o={};S.subjects.forEach(s=>o[s.id]=s.name);return o};
const TH=[['foco','Foco/distração',/concentr|foco|distra|celular|dispers|redes sociais|youtube|instagram|tiktok/i],['conteudo','Conteúdo difícil',/n[aã]o entend|travo|trava|dificuldad|dif[ií]cil|conceito|n[aã]o consigo|exerc[ií]cio|n[aã]o sei|confus/i],['tempo','Tempo/organização',/tempo|rotina|organiz|atras|procrastin|prazo|correria|planej|agenda|acumul/i],['motiv','Desânimo/ansiedade',/desanim|motiva|pregui[cç]a|sem vontade|ansios|ansied|estress|desesper|medo|press[aã]o|cobran/i],['cansaco','Cansaço/sono',/cansad|sono|dorm|exaust|energia|esgotad/i],['outros','Outras demandas (TCC/trabalho)',/tcc|trabalh|est[aá]gio|emprego|projeto|outra mat[eé]ria/i]];
const temas=t=>TH.filter(x=>x[2].test(t)).map(x=>x[0]);
const thName=k=>(TH.find(x=>x[0]===k)||['',k])[1];
const thOf=x=>x.th&&x.th.length?x.th:temas(x.txt||'');
const tagsHtml=x=>{const L=thOf(x);return L.length?`<div class="sub" style="font-size:.74rem;margin-top:4px">${L.map(k=>'#'+esc(thName(k))).join(' · ')}</div>`:''};
const pf=()=>{const p=S.lperfil=(S.lperfil&&typeof S.lperfil==='object')?S.lperfil:{};p.c=+p.c||0;return p};
const sugs=()=>{S.lsug=Array.isArray(S.lsug)?S.lsug:[];return S.lsug};
const provs=()=>{S.lprovas=Array.isArray(S.lprovas)?S.lprovas:[];return S.lprovas};
const exps=()=>{S.lexp=Array.isArray(S.lexp)?S.lexp:[];return S.lexp};
const clean=t=>String(t||'').replace(/\[\[(?:SUG|EXP):[^\]]*\]\]/g,'').replace(/\[\[[^\]]*$/,'').trim();
const findSub=n=>{n=String(n||'').trim().toLowerCase();if(!n)return null;return S.subjects.find(s=>s.name.toLowerCase()===n)||S.subjects.find(s=>{const x=s.name.toLowerCase();return x.includes(n)||n.includes(x)})||null};
const minsIn=(s,end,n)=>{let m=0;for(let i=1;i<=n;i++)m+=(s.days||{})[fmt(addD(parse(end),-i))]||0;return Math.round(m)};
function pear(a,b,mn){mn=mn||5;const n=a.length;if(n<mn)return null;const ma=a.reduce((x,y)=>x+y,0)/n,mb=b.reduce((x,y)=>x+y,0)/n;let c=0,va=0,vb=0;for(let i=0;i<n;i++){c+=(a[i]-ma)*(b[i]-mb);va+=(a[i]-ma)**2;vb+=(b[i]-mb)**2}return va&&vb?+(c/Math.sqrt(va*vb)).toFixed(2):null}
const SYS3='\n\nRECURSOS NOVOS (leia com atenção). (A) perfil_do_estudante é a sua memória de longo prazo sobre ele (como estuda, o que trava, o que funciona, o que já foi tentado). Use-o; se algo novo contradisser o perfil, confie no novo. (B) sugestoes_anteriores traz suas recomendações passadas com o resultado medido nos dados (cumprida, parcial, sem estudo) e o feedback do estudante. Antes de aconselhar, confira: reforce o que funcionou, não repita o que falhou várias vezes (reduza, mude horário ou pergunte o motivo) e mude a abordagem quando o feedback for nao_util. (C) provas[].risco_calculado_pelo_app é um score de 0 a 100 calculado pelo código do app (urgência 30%, preparo pelo domínio e conteúdo visto 25%, ritmo necessário x ritmo real 20%, dias sem estudar 10%, dificuldade 5%, peso 5%, queda recente 5%). Use o score e os fatores como estão, sem recalcular, e explique os principais fatores. (D) calibragem_de_planejamento mostra o quanto as estimativas do estudante se confirmam (razão tempo real sobre estimado, taxa de conclusão, tarefas com atraso); é aproximação. Quando houver dados suficientes, corrija suas projeções por esse fator e avise quando o plano estiver otimista demais. (E) resultados_de_provas traz notas passadas, horas estudadas antes e o risco que o app previu; compare previsto x ocorrido e extraia o que funciona para ele. Com poucas provas, diga que é indicativo. (F) recorrencias_do_diario conta temas e matérias que se repetem no diário; aponte padrões com contagem e datas («apareceu 4 vezes em 3 semanas») e cruze com foco_medio_nos_dias_com_anotacao. checkins_recentes são respostas rápidas do estudante. (G) correlacoes: só cite uma correlação se |r| for pelo menos 0,3 e houver n de 10 ou mais; caso contrário diga que é fraca ou que faltam dados. Correlação não prova causa; transforme achados em hipótese testável. (H) experimentos mostra testes em andamento com base x atual; reporte o progresso e diga se há evidência de efeito, sem exagerar com poucos dias. (I) retrospectiva_semana_passada traz a semana fechada. Quando o estudante pedir retrospectiva, compare o que foi sugerido e previsto com o que aconteceu e responda nesta ordem: o que deu certo, o que falhou, causa provável (com os dados), ajustes para a semana que vem. Para retrospectiva de provas use resultados_de_provas. (J) MARCADORES: ao FINAL de respostas que tragam recomendações, escreva até 3 linhas no formato [[SUG: matéria | minutos | quando | ação curta]] com a matéria exatamente como em materias e minutos como número; e, só se você propuser testar algo por alguns dias, 1 linha [[EXP: descrição | foco ou min | dias]]. O app esconde essas linhas do estudante e as usa para acompanhar resultados: nunca as mencione nem explique, e não as escreva se não houver recomendação concreta.';
function recDiario(){const L=notes(),c30=fmt(addD(now(),-30)),nm=nm0(),T={},M={};
 L.forEach(x=>{thOf(x).forEach(k=>{const o=T[k]=T[k]||{tema:thName(k),n_total:0,n_ultimos_30_dias:0,ainda_abertas:0,primeira:x.d,ultima:x.d};o.n_total++;if(x.d>=c30)o.n_ultimos_30_dias++;if(!x.res&&!x.ck)o.ainda_abertas++;if(x.d<o.primeira)o.primeira=x.d;if(x.d>o.ultima)o.ultima=x.d});
  if(x.sid){const o=M[x.sid]=M[x.sid]||{materia:nm[x.sid]||'removida',n:0,abertas:0};o.n++;if(!x.res)o.abertas++}});
 const dias=[...new Set(L.map(x=>x.d))],fl=(S.log||[]).filter(x=>x.f>0),foc=d=>{const a=fl.filter(x=>x.d===d);return a.length?a.reduce((s,x)=>s+x.f,0)/a.length:null},fa=dias.map(foc).filter(v=>v!=null);
 return{por_tema:Object.values(T).sort((a,b)=>b.n_total-a.n_total),por_materia:Object.values(M).sort((a,b)=>b.n-a.n),foco_medio_nos_dias_com_anotacao:fa.length?+(fa.reduce((a,b)=>a+b,0)/fa.length).toFixed(2):null,foco_medio_geral:fl.length?+(fl.reduce((a,x)=>a+x.f,0)/fl.length).toFixed(2):null,minutos_medios_nos_dias_com_anotacao:dias.length?hh(dias.reduce((a,d)=>a+allTot(d),0)/dias.length):null}}
function perfilCtx(){const p=pf();return p.txt?{atualizado_em:p.d,texto:p.txt}:null}
function sugCtx(){const t=fmt(now());return sugs().slice(-25).map(g=>{const s=findSub(g.mat),h=Math.max(0,diff(g.d,t)),o={sugerida_em:g.d,ha_dias:h,materia:g.mat,minutos_sugeridos:g.min,quando:g.qd,acao:g.ac,feedback_do_estudante:g.fb===1?'util':g.fb===-1?'nao_util':null};
 if(s){let m=0,dd=0;for(let i=0;i<=h;i++){const v=(s.days||{})[fmt(addD(parse(g.d),i))]||0;m+=v;if(v>0)dd++}
  const L=(S.log||[]).filter(x=>x.sid===s.id&&x.f>0&&x.d>=g.d);let b=0;for(let i=1;i<=14;i++)b+=(s.days||{})[fmt(addD(parse(g.d),-i))]||0;
  o.min_estudados_na_materia_desde=Math.round(m);o.dias_estudados_desde=dd;o.media_min_por_dia_nos_14_dias_antes=Math.round(b/14);o.media_min_por_dia_desde=Math.round(m/(h+1));o.foco_medio_desde=L.length?+(L.reduce((a,x)=>a+x.f,0)/L.length).toFixed(2):null;
  o.resultado=h===0?'sugerida hoje; ainda sem avaliação':(g.min>0&&m>=g.min)?'cumprida (ao menos o tempo sugerido foi estudado)':m>0?'parcial':'sem estudo na matéria desde então'}else o.resultado='matéria não identificada';return o})}
const expBase=mt=>{const c=fmt(addD(now(),-14));if(mt==='foco'){const L=(S.log||[]).filter(x=>x.f>0&&x.d>=c);return L.length?+(L.reduce((a,x)=>a+x.f,0)/L.length).toFixed(2):null}let m=0;for(let i=1;i<=14;i++)m+=allTot(fmt(addD(now(),-i)));return Math.round(m/14)};
const expCur=e=>{if(e.metric==='foco'){const L=(S.log||[]).filter(x=>x.f>0&&x.d>=e.start);return L.length?+(L.reduce((a,x)=>a+x.f,0)/L.length).toFixed(2):null}const n=Math.max(1,diff(e.start,fmt(now()))+1);let m=0;for(let i=0;i<n;i++)m+=allTot(fmt(addD(parse(e.start),i)));return Math.round(m/n)};
function expCtx(){const t=fmt(now());return exps().filter(e=>e.st==='act'||e.st==='fin').slice(-8).map(e=>({experimento:e.txt,metrica:e.metric==='foco'?'foco médio (1 a 5)':'minutos estudados por dia',inicio:e.start,duracao_dias:e.days,dias_decorridos:diff(e.start,t)+1,base_nos_14_dias_antes:e.base,atual:expCur(e),situacao:e.st==='fin'?'encerrado':diff(e.start,t)+1>=e.days?'prazo cumprido, aguardando encerramento':'em andamento'}))}
function resCtx(){const L=provs(),nm=nm0();if(!L.length)return null;const x=L.map(q=>q.m30),y=L.map(q=>q.nota/q.max*100);let rel=null;
 if(L.length>=3){const md=x.slice().sort((a,b)=>a-b)[Math.floor(x.length/2)],av=a=>a.length?Math.round(a.reduce((s,q)=>s+q.nota/q.max*100,0)/a.length):null;rel={n:L.length,correlacao_minutos30d_x_nota:pear(x,y,3),nota_media_pct_com_mais_estudo:av(L.filter(q=>q.m30>md)),nota_media_pct_com_menos_estudo:av(L.filter(q=>q.m30<=md)),obs:'amostra pequena; indicativo, não conclusivo'}}
 return{provas_realizadas:L.slice(-15).map(q=>({materia:nm[q.sid]||'removida',prova:q.nome,data:q.d,nota:q.nota,nota_maxima:q.max,pct:Math.round(q.nota/q.max*100),min_estudados_14d_antes:q.m14,min_estudados_30d_antes:q.m30,min_estudados_60d_antes:q.m60,dominio_na_epoca:q.dom,conteudo_visto_na_epoca:q.cov,risco_previsto_pelo_app:q.risco,observacao:q.obs||null})),relacao_estudo_nota:rel,media_pct:Math.round(y.reduce((a,b)=>a+b,0)/y.length)}}
function snap(o,sc){const L=S.lrisk=Array.isArray(S.lrisk)?S.lrisk:[],t=fmt(now());if(L.some(e=>e.d===t&&e.sid===o.s.id&&e.n===o.x.name))return;L.push({d:t,sid:o.s.id,n:o.x.name,pd:o.x.date,sc});if(L.length>400)L.splice(0,L.length-400);save()}
function riscoProva(o){const s=o.s,x=o.x,t=fmt(now()),dias=o.n,m30=jm(s,30),m14=jm(s,14);let mp=0;for(let i=14;i<28;i++)mp+=(s.days||{})[fmt(addD(now(),-i))]||0;mp=Math.round(mp);
 const pend=(s.topics||[]).filter(y=>!y.done&&!y.exam&&(!y.date||y.date<=x.date)),est=pend.reduce((a,y)=>a+(y.est||30),0),u=lastStudy(s,t),gap=u?diff(u,t):30,F=[];
 const urg=dias<=1?1:dias<=3?.85:dias<=7?.65:dias<=14?.4:dias<=30?.2:.1,dom=s.dom!=null?(5-s.dom)/4:.5,cov=s.cov!=null?(100-s.cov)/100:.5,prep=(dom+cov)/2,need=est/Math.max(1,dias),have=m30/30,rit=est>0?Math.min(1,need/Math.max(have,10)/2):0,sem=Math.min(1,gap/10),dif=(diffOf(s)-1)/2,pw=s.pw!=null?s.pw/3:.33,queda=mp>0&&m14<mp?Math.min(1,(mp-m14)/mp):0;
 const sc=Math.round(100*(urg*.30+prep*.25+rit*.20+sem*.10+dif*.05+pw*.05+queda*.05));
 F.push('prova em '+dias+' dia'+(dias===1?'':'s'));if(s.dom==null)F.push('domínio não preenchido (assumido médio)');else if(s.dom<=2)F.push('domínio baixo ('+s.dom+'/5)');if(s.cov==null)F.push('conteúdo visto não preenchido (assumido médio)');else if(s.cov<=30)F.push('pouco conteúdo visto');
 if(est>0)F.push('tarefas pendentes até a prova somam '+hh(est)+' (precisa de '+hh(need)+'/dia; média real 30d é '+hh(have)+'/dia)');if(gap>=7)F.push(gap+' dias sem estudar a matéria');if(queda>=.3)F.push('queda de '+Math.round(queda*100)+'% nos últimos 14 dias');if(diffOf(s)===3)F.push('matéria difícil');if(s.pw>=2)F.push('peso alto na prova');
 snap(o,sc);return{score_0a100:sc,nivel:sc>=70?'crítico':sc>=50?'alto':sc>=30?'médio':'baixo',fatores:F}}
function calibAn(){const t=fmt(now()),c60=fmt(addD(now(),-60));let ag=0,cc=0,late=0,estAll=0;const G={},D={};
 S.subjects.forEach(s=>{if(s.arch)return;(s.topics||[]).forEach(x=>{if(x.exam)return;
  if(x.date&&x.date>=c60&&x.date<=t){ag++;estAll+=x.est||0;if(x.done){cc++;if(x.doneAt&&x.doneAt>x.date)late++}D[x.date]=(D[x.date]||0)+(x.est||0)}
  if(x.done&&x.est>0&&x.doneAt&&x.doneAt>=c60){const k=s.id+'|'+x.doneAt,g=G[k]=G[k]||{s,d:x.doneAt,est:0};g.est+=x.est}})});
 let re=0,es=0,n=0;Object.values(G).forEach(g=>{const r=(g.s.days||{})[g.d]||0;if(r>0){re+=r;es+=g.est;n++}});
 let ed=0,rd=0;Object.keys(D).forEach(d=>{if(d<t){ed+=D[d];rd+=allTot(d)}});
 const razao=es>0?+(re/es).toFixed(2):null;
 return{janela:'últimos 60 dias',tarefas_agendadas:ag,tarefas_concluidas:cc,taxa_de_conclusao_pct:ag?Math.round(cc/ag*100):null,concluidas_com_atraso:late,
  razao_tempo_estudado_sobre_estimado_nos_dias_de_conclusao:razao,amostra_dias_matéria:n,
  nos_dias_com_tarefas_agendadas:{estimado_agendado:hh(ed),estudado_no_dia:hh(rd),razao:ed>0?+(rd/ed).toFixed(2):null},
  fator_de_correcao_sugerido:razao&&n>=4?(razao>1.15?'estimativas costumam ficar curtas: multiplique por ~'+razao:razao<.85?'estimativas costumam ficar longas: multiplique por ~'+razao:'estimativas próximas do real'):'dados insuficientes',
  obs:'aproximação: o app não registra o tempo por tarefa; compara minutos estudados na matéria no dia da conclusão com a estimativa das tarefas concluídas'}}
function corrAn(){const L=(S.log||[]).filter(x=>x.f>0),o={n_registros_de_foco:L.length},H=L.filter(x=>x.h!=null);
 o.foco_x_duracao_do_bloco=pear(L.map(x=>x.m),L.map(x=>x.f));o.foco_x_hora_do_dia=pear(H.map(x=>x.h),H.map(x=>x.f));
 const wd=[[],[],[],[],[],[],[]],N=['dom','seg','ter','qua','qui','sex','sáb'];L.forEach(x=>wd[parse(x.d).getDay()].push(x.f));
 o.foco_medio_por_dia_da_semana={};wd.forEach((a,i)=>{if(a.length>=3)o.foco_medio_por_dia_da_semana[N[i]]=+(a.reduce((s,v)=>s+v,0)/a.length).toFixed(2)});
 const days=[...new Set(L.map(x=>x.d))],fd=d=>{const a=L.filter(x=>x.d===d);return a.reduce((s,x)=>s+x.f,0)/a.length};
 o.minutos_do_dia_x_foco_do_dia=pear(days.map(allTot),days.map(fd));
 const bad=days.filter(d=>fd(d)<=2),nx=bad.map(d=>allTot(fmt(addD(parse(d),1))));
 o.apos_dia_de_foco_baixo={dias_de_foco_baixo:bad.length,media_min_no_dia_seguinte:nx.length?hh(nx.reduce((a,b)=>a+b,0)/nx.length):null,media_min_geral_por_dia:hh(days.length?days.reduce((a,d)=>a+allTot(d),0)/days.length:0)};
 o.legenda='Pearson de -1 a 1; só vale com n suficiente; correlação não prova causa';return o}
function retroSem(){const M0=addD(monday(now()),-7),M1=addD(M0,-7),ks=m=>[...Array(7)].map((_,i)=>fmt(addD(m,i))),W=ks(M0),W1=ks(M1);
 const tot=a=>a.reduce((s,k)=>s+allTot(k),0),dias=a=>a.filter(k=>allTot(k)>0).length,foc=a=>{const L=(S.log||[]).filter(x=>x.f>0&&a.includes(x.d));return L.length?+(L.reduce((s,x)=>s+x.f,0)/L.length).toFixed(2):null};
 const por={};S.subjects.forEach(s=>{const m=W.reduce((a,k)=>a+((s.days||{})[k]||0),0);if(m>0)por[s.name]=hh(m)});
 let ag=0,cc=0;S.subjects.forEach(s=>(s.topics||[]).forEach(x=>{if(x.exam||!x.date||!W.includes(x.date))return;ag++;if(x.done)cc++}));
 const sg=sugs().filter(x=>W.includes(x.d)),nt=notes().filter(x=>W.includes(x.d)&&!x.ck),rk={};
 (S.lrisk||[]).filter(e=>e.d>=W[0]&&e.d<=W[6]).forEach(e=>{const k=e.sid+'|'+e.n,o=rk[k]=rk[k]||{prova:e.n,inicio:e.sc,fim:e.sc};o.fim=e.sc});
 return{semana:W[0]+' a '+W[6],total:hh(tot(W)),media_por_dia:hh(tot(W)/7),dias_estudados:dias(W)+' de 7',semana_anterior:{total:hh(tot(W1)),dias_estudados:dias(W1)+' de 7'},variacao_pct:tot(W1)>0?Math.round((tot(W)-tot(W1))/tot(W1)*100):null,foco_medio:foc(W),foco_medio_semana_anterior:foc(W1),por_materia:por,tarefas_agendadas_na_semana:ag,tarefas_concluidas:cc,sugestoes_feitas_na_semana:sg.length,anotacoes_no_diario:nt.length,temas_do_diario:[...new Set(nt.flatMap(x=>thOf(x).map(thName)))],risco_das_provas_no_inicio_e_fim_da_semana:Object.values(rk)}}
function proc(msg){const t=msg.t,ids=[];
 for(const m of t.matchAll(/\[\[SUG:\s*([^\]|]*)\|([^\]|]*)\|([^\]|]*)\|([^\]]*)\]\]/g)){const id='g'+Date.now().toString(36)+ids.length;sugs().push({id,t:Date.now(),d:fmt(now()),mat:m[1].trim().slice(0,60),min:parseInt(m[2])||0,qd:m[3].trim().slice(0,60),ac:m[4].trim().slice(0,160),fb:0});ids.push(id)}
 for(const m of t.matchAll(/\[\[EXP:\s*([^\]|]*)\|([^\]|]*)\|([^\]]*)\]\]/g)){exps().push({id:'x'+Date.now().toString(36)+exps().length,txt:m[1].trim().slice(0,200),metric:/foc/i.test(m[2])?'foco':'min',days:Math.max(3,Math.min(30,parseInt(m[3])||7)),st:'prop',t:Date.now()})}
 if(sugs().length>80)sugs().splice(0,sugs().length-80);if(exps().length>30)exps().splice(0,exps().length-30);
 msg.sg=ids;msg.t=clean(t);pf().c++;save()}
let pbusy=false;
async function atualizarPerfil(force){const p=pf();if(pbusy||!gk()||!A().ok){if(force)toast('Salve a chave e aceite o aviso de privacidade antes.');return}pbusy=true;
 try{const dados={perfil_anterior:p.txt||null,anotacoes_novas:notes().filter(x=>x.t>(p.t||0)).slice(-20).map(x=>({dia:x.d,tipo:x.tp,texto:x.txt})),conversa_recente:A().hist.filter(m=>m.r!=='err').slice(-12).map(m=>({quem:m.r==='user'?'estudante':'lumi',texto:String(m.t).slice(0,600)})),recorrencias_do_diario:sf(recDiario,null),sugestoes_e_resultados:sf(sugCtx,[]).slice(-12),resultados_de_provas:sf(resCtx,null),padroes:sf(padroesAn,null),calibragem:sf(calibAn,null),correlacoes:sf(corrAn,null)};
  const pr='Você mantém o PERFIL de um estudante para uma treinadora de estudos. Reescreva o perfil atualizado em português do Brasil, em até 200 palavras, em tópicos curtos, com estas seções: Como estuda; O que costuma travar; O que funciona; O que já foi tentado e o resultado; Rotina e contexto de vida; Pontos de atenção. Regras: use SOMENTE o que está nos dados; mantenha do perfil anterior o que continua válido e remova o que os dados novos contradizem; marque como (hipótese) o que for suposição; não invente fatos; não faça diagnósticos de saúde.\n\nDADOS:\n'+JSON.stringify(dados);
  const tx=await gcall(A().model,{contents:[{role:'user',parts:[{text:pr}]}],generationConfig:{temperature:.3,maxOutputTokens:2500}},gk());
  if(tx&&tx.trim().length>40){p.txt=tx.trim().slice(0,2500);p.d=fmt(now());p.t=Date.now();p.c=0;save();dside();if(force)toast('Perfil atualizado.')}else if(force)toast('O Gemini devolveu um perfil vazio.')}
 catch(e){if(force)toast('Não consegui atualizar o perfil: '+e.message)}pbusy=false}
function perfilAuto(){const p=pf();if(p.c>=6||(!p.txt&&p.c>=3)||(p.c>=2&&notes().filter(x=>x.t>(p.t||0)&&!x.ck).length>=3))atualizarPerfil(false)}
const fbHtml=(m,i)=>m.r==='model'&&m.t&&!(busy&&i===A().hist.length-1)?`<div class="lia-fb"><button type="button" class="ghost${m.fb===1?' on':''}" data-fb="1" data-i="${i}" aria-label="Resposta útil">👍</button><button type="button" class="ghost${m.fb===-1?' on':''}" data-fb="-1" data-i="${i}" aria-label="Resposta não útil">👎</button></div>`:'';
function saveCk(c,reason){const t=fmt(now()),L={bem:'rendeu bem',ok:'foi normal',mal:'foi ruim',nada:'não estudei'};
 notes().push({id:'n'+Date.now().toString(36),d:t,t:Date.now(),tp:'hum',sid:'',txt:'Check-in: meu último dia de estudo '+(L[c.mood]||'')+'.'+(reason&&reason!=='nada'?' O que mais atrapalhou: '+thName(reason)+'.':reason==='nada'?' Nada atrapalhou.':''),res:0,th:reason&&reason!=='nada'?[reason]:[],ck:1});
 c.done=1;save();dck();dnotes();toast('Check-in registrado.')}
function dck(){const el=$('#lia-ck');if(!el)return;const c=S.lchk=(S.lchk&&typeof S.lchk==='object')?S.lchk:{},t=fmt(now());
 if(c.d===t&&c.done){el.innerHTML='';return}
 const st=c.d===t?c.step||1:1,B=(a,L)=>L.map(([k,n])=>`<button type="button" class="ghost" data-${a}="${k}">${n}</button>`).join('');
 el.innerHTML=`<div class="lia-n" style="border-left-color:#3b82f6;white-space:normal"><b>Check-in rápido</b> · ${st===1?'como foi seu último dia de estudo?':'o que mais atrapalhou?'}<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${st===1?B('ck1',[['bem','😀 Rendeu'],['ok','😐 Normal'],['mal','😣 Foi ruim'],['nada','⏸️ Não estudei']]):B('ck2',[['foco','Foco/distração'],['conteudo','Conteúdo difícil'],['tempo','Tempo/organização'],['cansaco','Cansaço/sono'],['motiv','Desânimo/ansiedade'],['outros','TCC/trabalho'],['nada','Nada, foi tranquilo']])}<button type="button" class="ghost" data-cksk="1">Pular hoje</button></div></div>`}
function addProva(retro){const sid=$('#lia-prs').value,s=S.subjects.find(x=>x.id===sid),d=$('#lia-prd').value||fmt(now()),nota=parseFloat($('#lia-prt').value),max=parseFloat($('#lia-prm').value)||10;
 if(!s){toast('Escolha a matéria.');return}if(!Number.isFinite(nota)||nota<0){toast('Informe a nota.');return}
 const nome=($('#lia-prn').value||'Prova').trim().slice(0,40),rk=(S.lrisk||[]).filter(e=>e.sid===sid&&e.d<=d).slice(-1)[0];
 provs().push({id:'p'+Date.now().toString(36),sid,d,nome,nota,max,obs:($('#lia-pro').value||'').trim().slice(0,200),m14:minsIn(s,d,14),m30:minsIn(s,d,30),m60:minsIn(s,d,60),dom:s.dom==null?null:s.dom,cov:s.cov==null?null:s.cov,risco:rk?rk.sc:null});
 ['#lia-prt','#lia-pro','#lia-prn'].forEach(q=>{$(q).value=''});save();dside();toast('Resultado salvo.');
 if(retro)ask('Faça a retrospectiva da prova de '+s.name+' ('+nome+'): compare o risco previsto pelo app com a nota que tirei, minha preparação nos 30 dias antes e o que mudar nas próximas provas.')}
function sideClick(b){const d=b.dataset,t=fmt(now());
 if(d.ck1){const c=S.lchk=(S.lchk&&typeof S.lchk==='object')?S.lchk:{};c.d=t;c.mood=d.ck1;c.done=0;if(d.ck1==='bem')saveCk(c,'nada');else{c.step=2;save();dck()}return true}
 if(d.ck2){const c=S.lchk||{};saveCk(c,d.ck2);return true}
 if(d.cksk){const c=S.lchk=(S.lchk&&typeof S.lchk==='object')?S.lchk:{};c.d=t;c.done=1;save();dck();return true}
 if(d.fb){const m=A().hist[+d.i];if(m){const v=+d.fb;m.fb=m.fb===v?0:v;(m.sg||[]).forEach(id=>{const g=sugs().find(x=>x.id===id);if(g)g.fb=m.fb});save();pst();draw();dside()}return true}
 if(d.exa||d.exd||d.exf){const e=exps().find(x=>x.id===(d.exa||d.exd||d.exf));if(e){if(d.exa){e.st='act';e.start=t;e.base=expBase(e.metric)}else if(d.exd)e.st='desc';else e.st='fin';save();dside()}return true}
 if(b.id==='lia-pra'||b.id==='lia-prar'){addProva(b.id==='lia-prar');return true}
 if(d.prdel){if(confirm('Excluir este resultado?')){S.lprovas=provs().filter(x=>x.id!==d.prdel);save();dside()}return true}
 if(b.id==='lia-pfs'){const p=pf();p.txt=$('#lia-pft').value.trim().slice(0,2500);p.d=t;p.t=Date.now();save();dside();toast('Perfil salvo.');return true}
 if(b.id==='lia-pfu'){atualizarPerfil(true);return true}
 return false}
function dside(){const nm=nm0();
 const pr=$('#lia-prl');if(pr){const L=provs().slice().reverse();pr.innerHTML=L.length?L.slice(0,15).map(q=>`<div class="lia-n"><div class="sub" style="font-size:.78rem;margin:0 0 3px">${bd(q.d)} · ${esc(nm[q.sid]||'matéria removida')} · ${esc(q.nome)}</div><div><b>${q.nota}/${q.max}</b> (${Math.round(q.nota/q.max*100)}%) · estudou ${hh(q.m30)} nos 30 dias antes${q.risco!=null?' · risco previsto '+q.risco+'/100':''}</div>${q.obs?`<div class="sub">${esc(q.obs)}</div>`:''}<div style="margin-top:6px"><button type="button" class="ghost danger" data-prdel="${q.id}">Excluir</button></div></div>`).join(''):'<p class="sub" style="margin:8px 0 0">Nenhum resultado registrado.</p>'}
 const p=pf(),pt=$('#lia-pft');if(pt&&document.activeElement!==pt)pt.value=p.txt||'';
 const pd=$('#lia-pfd');if(pd)pd.textContent=p.txt?'Atualizado em '+bd(p.d)+'; '+p.c+' interação(ões) desde então. Você pode editar e salvar.':'Ainda não gerado. Ele é criado depois de algumas conversas e anotações, ou clique em Atualizar agora.';
 const sg=$('#lia-sgl');if(sg){const L=sf(sugCtx,[]).slice().reverse().slice(0,8);sg.innerHTML='<b>Sugestões recentes</b>'+(L.length?L.map(o=>`<div class="lia-n"><div class="sub" style="font-size:.78rem;margin:0 0 3px">${bd(o.sugerida_em)} · ${esc(o.materia)} · ${o.minutos_sugeridos} min · ${esc(o.quando)}</div><div>${esc(o.acao)}</div><div class="sub" style="margin-top:4px">${esc(o.resultado)}${o.feedback_do_estudante?' · '+(o.feedback_do_estudante==='util'?'👍':'👎'):''}</div></div>`).join(''):'<p class="sub" style="margin:6px 0">Nenhuma sugestão acompanhada ainda. Elas aparecem aqui conforme a Lumi IA recomenda.</p>')}
 const ex=$('#lia-exl');if(ex){const L=exps().filter(e=>e.st!=='desc').slice().reverse().slice(0,8);ex.innerHTML='<b style="display:block;margin-top:10px">Experimentos</b>'+(L.length?L.map(e=>{const mt=e.metric==='foco'?'foco médio':'min/dia',b=e.st==='prop'?`<button type="button" class="btn main" data-exa="${e.id}">Aceitar e iniciar hoje</button><button type="button" class="ghost" data-exd="${e.id}">Descartar</button>`:e.st==='act'?`<button type="button" class="ghost" data-exf="${e.id}">Encerrar</button>`:'';
  const info=e.st==='prop'?'Proposto por '+e.days+' dias · mede '+mt:'Início '+bd(e.start)+' · '+e.days+' dias · '+mt+': base '+(e.base==null?'—':e.base)+' → atual '+(expCur(e)==null?'—':expCur(e))+(e.st==='fin'?' · encerrado':'');
  return`<div class="lia-n"><div>${esc(e.txt)}</div><div class="sub" style="margin-top:4px">${esc(info)}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${b}</div></div>`}).join(''):'<p class="sub" style="margin:6px 0">Nenhum experimento. Quando a Lumi IA propuser um teste de alguns dias, ele aparece aqui para você aceitar.</p>')}}
function extraHtml(){return`<details id="lia-prv"><summary style="cursor:pointer;font-weight:600">🎓 Resultados das minhas provas</summary>
   <p class="sub" style="margin:6px 0 0">Registre a nota depois de cada prova. O app guarda quanto você estudou antes e o risco que ele tinha previsto, e a Lumi IA aprende o que funciona para você.</p>
   <div class="lia-nf"><select id="lia-prs" aria-label="Matéria">${S.subjects.filter(s=>!s.arch).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select><input type="date" id="lia-prd" value="${fmt(now())}" aria-label="Data da prova"><input type="text" id="lia-prn" maxlength="40" placeholder="Nome (ex.: P1)"></div>
   <div class="lia-nf"><input type="number" id="lia-prt" step="0.1" min="0" placeholder="Nota"><input type="number" id="lia-prm" step="0.1" min="1" value="10" placeholder="Nota máxima"><input type="text" id="lia-pro" maxlength="200" placeholder="O que funcionou / o que faltou"></div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0"><button type="button" class="btn" id="lia-pra">Salvar resultado</button><button type="button" class="btn main" id="lia-prar">Salvar e fazer retrospectiva</button></div><div id="lia-prl"></div></details>
  <details id="lia-pfd2"><summary style="cursor:pointer;font-weight:600">🧠 O que a Lumi IA sabe sobre mim</summary>
   <p class="sub" id="lia-pfd" style="margin:6px 0"></p><textarea id="lia-pft" maxlength="2500" aria-label="Perfil do estudante" placeholder="O perfil aparece aqui depois de algumas conversas."></textarea>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0"><button type="button" class="btn" id="lia-pfs">Salvar edição</button><button type="button" class="btn main" id="lia-pfu">Atualizar agora</button></div></details>
  <details id="lia-trk"><summary style="cursor:pointer;font-weight:600">🎯 Acompanhamento (sugestões e experimentos)</summary><div id="lia-sgl" style="margin-top:6px"></div><div id="lia-exl"></div></details>
  `}
function janMin(get,Ns){const t=fmt(now()),dk=i=>fmt(addD(now(),-i)),sum=(a,b)=>{let m=0,d=0;for(let i=a;i<b;i++){const v=get(dk(i))||0;m+=v;if(v>0)d++}return{m,d}},o={};
 (Ns||[7,14,30,60,90]).forEach(n=>{const c=sum(0,n),p=sum(n,2*n);o['ultimos_'+n+'_dias']={total:hh(c.m),media_por_dia:hh(c.m/n),dias_estudados:c.d+' de '+n,media_por_dia_estudado:hh(c.d?c.m/c.d:0),periodo_anterior_equivalente:hh(p.m),variacao_pct_vs_anterior:p.m>0?Math.round((c.m-p.m)/p.m*100):null}});
 let first=null;S.subjects.forEach(s=>Object.keys(s.days||{}).forEach(k=>{if(k<=t&&(!first||k<first)&&get(k)>0)first=k}));
 if(first){const n=diff(first,t)+1;let m=0,d=0;for(let i=0;i<n;i++){const v=get(dk(i))||0;m+=v;if(v>0)d++}o.todo_o_historico={desde:first,dias_no_periodo:n,total:hh(m),media_por_dia:hh(m/n),dias_estudados:d+' de '+n,media_por_dia_estudado:hh(d?m/d:0)}}
 return o}
function focoJan(sid){const o={};[[14,'ultimos_14_dias'],[30,'ultimos_30_dias'],[60,'ultimos_60_dias'],[99999,'todo_o_historico']].forEach(([n,k])=>{const c=fmt(addD(now(),-n)),L=(S.log||[]).filter(x=>x.f>0&&(!sid||x.sid===sid)&&x.d>=c);o[k]=L.length?{media_1a5:+(L.reduce((a,x)=>a+x.f,0)/L.length).toFixed(2),registros:L.length}:null});return o}
const jm=(s,n)=>{let m=0;for(let i=0;i<n;i++)m+=(s.days||{})[fmt(addD(now(),-i))]||0;return Math.round(m)};
function notasCtx(){const L=notes(),hoje=fmt(now()),nm=nm0();
 const f=x=>({registrada_em:x.d,ha_dias:diff(x.d,hoje),tipo:(NT.find(t=>t[0]===x.tp)||['',x.tp])[1],materia:x.sid?(nm[x.sid]||'matéria removida'):'geral',texto:x.txt});
 const N=L.filter(x=>!x.ck);return{abertas:N.filter(x=>!x.res).slice(-30).map(f),resolvidas_recentes:N.filter(x=>x.res).slice(-8).map(f),total_abertas:N.filter(x=>!x.res).length,checkins_recentes:L.filter(x=>x.ck).slice(-10).map(x=>({dia:x.d,texto:x.txt}))}}
function lastStudy(s,t){let u=null;Object.keys(s.days||{}).forEach(k=>{if(s.days[k]>0&&k<=t&&(!u||k>u))u=k});return u}
function matExtra(s){const t=fmt(now()),dk=i=>fmt(addD(now(),-i)),r=(a,b)=>{let m=0;for(let i=a;i<b;i++)m+=(s.days||{})[dk(i)]||0;return Math.round(m)};
 const u=lastStudy(s,t),L=(S.log||[]).filter(x=>x.sid===s.id&&x.f>0&&x.d>=dk(28)),T=(s.topics||[]).filter(x=>!x.done&&!x.exam);
 const late=T.filter(x=>x.date&&x.date<t),rv=(S.rev||[]).filter(x=>x.sid===s.id&&!x.done&&x.date<t).length;
 return{por_janela:janMin(k=>(s.days||{})[k],[14,30,60]),foco_por_janela:focoJan(s.id),dias_sem_estudar:u?diff(u,t):null,min_14d_atuais:r(0,14),min_14d_anteriores:r(14,28),foco_medio_28d:L.length?+(L.reduce((a,x)=>a+x.f,0)/L.length).toFixed(1):null,registros_de_foco_28d:L.length,
  conteudo_visto_faixa:s.cov==null?null:s.cov,dominio_1a5:s.dom==null?null:s.dom,peso_na_prova_0a3:s.pw==null?null:s.pw,prazo_de_entrega:s.dl||null,
  tarefas_atrasadas:late.length,estimativa_das_atrasadas:hh(late.reduce((a,x)=>a+(x.est||30),0)),revisoes_vencidas:rv,
  tarefas_concluidas_ultimos_14_dias:(s.topics||[]).filter(x=>x.done&&x.doneAt&&x.doneAt>=dk(14)).length}}
function provasAn(){const t=fmt(now()),dk=i=>fmt(addD(now(),-i));
 return exams().map(o=>{const s=o.s,x=o.x,m14=Math.round([...Array(14)].reduce((a,_,i)=>a+((s.days||{})[dk(i)]||0),0)),
  pend=(s.topics||[]).filter(y=>!y.done&&!y.exam&&(!y.date||y.date<=x.date)),est=pend.reduce((a,y)=>a+(y.est||30),0),u=lastStudy(s,t);
  return{materia:s.name,prova:x.name,data:x.date,dias_restantes:o.n,dificuldade_1a3:diffOf(s),importancia_0a3:impOf(s),conteudo_visto_faixa:s.cov==null?null:s.cov,dominio_1a5:s.dom==null?null:s.dom,peso_na_prova_0a3:s.pw==null?null:s.pw,
   min_estudados_ultimos_14_dias:m14,min_estudados_ultimos_30_dias:jm(s,30),min_estudados_ultimos_60_dias:jm(s,60),media_min_por_dia_ultimos_30:Math.round(jm(s,30)/30),media_min_por_dia_ultimos_60:Math.round(jm(s,60)/60),media_min_por_dia_ultimos_14:Math.round(m14/14),dias_desde_ultimo_estudo:u?diff(u,t):null,
   tarefas_pendentes_ate_a_prova:pend.length,estimativa_dessas_tarefas:hh(est),ritmo_para_concluir_tarefas_por_dia:hh(est/Math.max(1,o.n)),
   revisoes_vencidas:(S.rev||[]).filter(r=>r.sid===s.id&&!r.done&&r.date<t).length,risco_calculado_pelo_app:riscoProva(o)}})}
function tarefasAn(){const t=fmt(now()),mon=monday(now()),wk=[...Array(7)].map((_,i)=>fmt(addD(mon,i))),L=[];
 S.subjects.forEach(s=>{if(s.arch)return;(s.topics||[]).forEach(x=>{if(!x.done&&!x.exam)L.push({s,x})})});
 const fm=o=>({materia:o.s.name,tarefa:o.x.name,data:o.x.date||null,prioridade:o.x.prio||null,estimativa:o.x.est?hh(o.x.est):null}),sm=a=>hh(a.reduce((n,o)=>n+(o.x.est||0),0)),
  late=L.filter(o=>o.x.date&&o.x.date<t),hj=L.filter(o=>o.x.date===t),sem=L.filter(o=>o.x.date&&o.x.date>t&&wk.includes(o.x.date)),sd=L.filter(o=>!o.x.date);
 let rv=0;try{rv=(S.rev||[]).filter(r=>!r.done&&r.date<t&&revValid(r)).length}catch(e){}
 return{atrasadas:{qtd:late.length,estimativa_total:sm(late),itens:late.slice(0,15).map(fm)},para_hoje:{qtd:hj.length,estimativa_total:sm(hj),itens:hj.slice(0,10).map(fm)},
  restante_da_semana:{qtd:sem.length,estimativa_total:sm(sem),itens:sem.slice(0,12).map(fm)},sem_data:{qtd:sd.length,estimativa_total:sm(sd)},revisoes_vencidas_total:rv}}
function progAn(){const R=xpRun(),L=lvInfo(R.xp),o={xp_da_sequencia:R.xp,nivel:L.n,nome_do_nivel:NOMES[L.n-1],xp_para_o_proximo_nivel:L.need?L.need-L.r:0,xp_em_risco_hoje:R.gap===2&&R.xp>0,dias_desde_o_ultimo_estudo:R.gap};
 sf(()=>{const g=window.__liga,c=g.cfg();if(c.lv){const h=g.hrs(fmt(monday(now())));o.liga={nome:g.LG[c.lv-1][0],nivel:c.lv,horas_nesta_semana_seg_a_sab:hh(h*60),meta_para_permanecer:g.meta(c.lv)+'h',meta_para_subir:c.lv<g.LG.length?g.meta(c.lv+1)+'h':null}}});return o}
function padroesAn(){const D=coData(),f=x=>x==null?null:+x.toFixed(2),wn=['seg','ter','qua','qui','sex','sáb','dom'],w={};D.wavg.forEach((v,i)=>w[wn[i]]=hh(v));
 return{estudo_total_por_janela:janMin(k=>allTot(k)),estudo_planejado_por_janela:janMin(k=>plTot(k)),foco_geral_por_janela:focoJan(null),dias_estudados_ultimos_14:D.d14,dias_estudados_nos_14_anteriores:D.d14p,total_ultimos_14:hh(D.tot14),total_14_anteriores:hh(D.tot14p),foco_medio_6_semanas:f(D.fqAll),registros_de_foco:D.nlog,
  melhores_horarios_por_foco:D.hours.slice(0,4).map(h=>({hora:h.h,foco_medio:f(h.fq),blocos:h.n})),pior_horario_por_foco:D.hours.length>1?(h=>({hora:h.h,foco_medio:f(h.fq),blocos:h.n}))(D.hours[D.hours.length-1]):null,
  tamanho_ideal_de_bloco_min:D.idl,media_por_dia_da_semana_ultimas_4_semanas:w,diagnostico_do_coach:coInsights(D,coCfg()).map(i=>i.t+' | '+i.b)}}
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
  return{nome:k.name,periodo:k.start+' a '+k.end+' (termina às 24h de '+k.end+')',meta:hh(k.targetMin),feito:hh(feito),falta:hh(falta),tempo_restante_ate_o_fim:hh(rest),ritmo_necessario_por_dia_de_24h:rit==null?null:hh(rit),media_diaria_ultimos_14_dias:hh(avg),media_diaria_ultimos_30_dias:hh([...Array(30)].reduce((a,_,i)=>a+allTot(fmt(addD(now(),-i))),0)/30),media_diaria_ultimos_60_dias:hh([...Array(60)].reduce((a,_,i)=>a+allTot(fmt(addD(now(),-i))),0)/60),melhor_dia_ultimos_14:hh(mx),dias_dos_ultimos_14_que_bateram_esse_ritmo:rit==null?null:h14.filter(v=>v>=rit).length+' de 14',recompensa:k.rewardMin?hh(k.rewardMin)+' de lazer':k.rewardXp?k.rewardXp+' XP':'—',penalidade_se_falhar:k.penaltyMin?hh(k.penaltyMin)+' de dívida de lazer':'—'}})}
function idleInfo(){const di=idCfg(),c=lpCfg(),n=new Date(),left=1440-(n.getHours()*60+n.getMinutes());return{cobranca_ligada:di.on,lazer_perdido_por_hora_ociosa:hh(di.lr),xp_perdido_por_hora_ociosa_sem_lazer:di.xr,reserva_refeicao_rotina_hoje:hh(c.res)+' (não conta como ociosa se você iniciar a rotina em Tempo parado)',tempo_restante_no_dia:hh(left)}}
function ctx(){
 const t=fmt(now()),days=[...Array(14)].map((_,i)=>fmt(addD(now(),-i))),nm={};S.subjects.forEach(s=>nm[s.id]=s.name);
 const {subjects:_a,log:_b,rec:_c,ai:_d,lnotes:_e,lsug:_f,lprovas:_g,lperfil:_h,lexp:_i,lchk:_j,lrisk:_k,...rest}=S;
 return{agora:sf(agoraLocal,{ms:Date.now()}),perfil_do_estudante:sf(perfilCtx,null),diario_do_estudante:sf(notasCtx,null),recorrencias_do_diario:sf(recDiario,null),sugestoes_anteriores:sf(sugCtx,null),experimentos:sf(expCtx,null),resultados_de_provas:sf(resCtx,null),calibragem_de_planejamento:sf(calibAn,null),correlacoes:sf(corrAn,null),retrospectiva_semana_passada:sf(retroSem,null),provas:sf(provasAn,null),tarefas:sf(tarefasAn,null),progresso:sf(progAn,null),padroes_de_estudo:sf(padroesAn,null),estado_completo:sf(()=>trm(rest,0),null),telas_agora:sf(telas,null),hoje:t,streak_geral:sf(()=>{const g=gstreak();return{atual:g.c,recorde:g.b}},null),minimo_diario_min:sf(()=>stkMin(t),30),
  min_planejados_hoje:sf(()=>Math.round(plTot(t)),null),
  ultimos_14_dias_min:days.map(k=>({dia:k,total:sf(()=>Math.round(allTot(k)),0),planejado:sf(()=>Math.round(plTot(k)),0)})),
  saldo_lazer_min:sf(()=>Math.round(lzBal()),null),degrau_atual:sf(()=>lzStep(),null),elos:sf(()=>Math.round(elBal()),null),calculos_prontos:{minutos_de_estudo_planejado_para_zerar_saldo_de_lazer:sf(()=>{const m=simZero();return m},null),horas_para_zerar_saldo:sf(()=>(simZero()/60).toFixed(1),null),obs:'simulação com as regras atuais (taxa de lazer, degraus, castigo, boost); não inclui dívida de estudo nem bônus de foco 5★'},divida_estudo_min:sf(()=>Math.round(lzDebt()),null),
  ociosidade:sf(idleInfo,null),contratos_ativos_analise:sf(contratosAn,null),historico_semanal_completo:sf(semanasHist,null),medias_por_dia_da_semana:sf(mediasDia,null),
  plano_fechar_dia:sf(()=>{const z=lzCfg();if(!z.on)return null;const c=lpCtx(),b0=c.fin(0,0),pc=pdlCalc(),md=Object.keys(LP_M).map(k=>{const r=c.need(LP_M[k].f);return{modo:LP_M[k].n+(LP_M[k].f>=1?' (tudo com foco 5★)':LP_M[k].f>0?' (metade com foco 5★)':' (sem foco 5★)'),estudo_minimo_adicional_hoje:r.ok?hh(r.x):'não alcança até a meia-noite'}});
   return{limite_seguro_do_dia:'−9h59 (chegar a −10h não é permitido)',saldo_atual:lzS(Math.round(lzBal())),saldo_previsto_a_meia_noite_sem_estudar_mais:lzS(Math.round(b0)),ja_estudou_hoje:hh(Math.round(stkTot(fmt(now())))),estudo_minimo_adicional_hoje_por_modo:md,pocao_sem_estudar:pc.credit>0?'a Poção de perdão de dívida de lazer repõe '+lzN(pc.credit)+' e fecha o dia no limite':'não precisa',obs:'Já inclui a ociosidade até a meia-noite e desconta a reserva de refeições/rotina configurada. O menor valor entre os modos é o mínimo absoluto (exige foco 5★ no cronômetro).'}},null),
  materias:S.subjects.map(s=>({nome:s.name,...sf(()=>matExtra(s),{}),arquivada:!!s.arch,dificuldade_1a3:sf(()=>diffOf(s),null),importancia_0a3:sf(()=>impOf(s),null),streak:sf(()=>streak(s),0),melhor_streak:sf(()=>best(s),0),
   min_ultimos_14_dias:Math.round(days.reduce((a,k)=>a+(s.days[k]||0),0)),min_total_historico:Math.round(Object.values(s.days||{}).reduce((a,b)=>a+(+b||0),0)),
   tarefas_pendentes:(s.topics||[]).filter(x=>!x.done).slice(0,12).map(x=>({nome:x.name,data:x.date||null,estimativa_min:x.est||x.dur||null,prioridade:x.prio,prova:!!x.exam})),
   metas_de_dias:(s.goals||[]).slice(-2).map(g=>({de:g.start,ate:g.end,dias:g.target}))})),
  anotacoes_recentes:(S.log||[]).slice(-40).map(x=>({dia:x.d,materia:nm[x.sid]||'?',min:x.m,foco_1a5:x.f||null,texto:x.w||''}))}}
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
 lg.innerHTML=a.hist.length?a.hist.map((m,i)=>`<div class="lia-m ${m.r}">${md(clean(m.t))}</div>`+fbHtml(m,i)+(m.m?`<div class="sub" style="font-size:.75rem;margin:-4px 0 6px">${esc(m.m)}</div>`:'')).join('')+(busy&&(!a.hist.length||a.hist[a.hist.length-1].r!=='model')?'<div class="lia-m model">'+(bm||'Pensando…')+'</div>':''):'<p class="sub">Oi! Eu analiso seus dados de estudo e respondo de forma personalizada. Escolha uma pergunta ou escreva a sua.</p>';
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
 const mk=th=>JSON.stringify({systemInstruction:{parts:[{text:SYS+SYS2+SYS3+'\n\nMANUAL DO APP (gerado a partir do código atual; confie nele):\n'+mt+rules()+'\n\nDADOS DO ESTUDANTE (JSON, atualizados agora):\n'+JSON.stringify(ctx())}]},
  contents:a.hist.filter(m=>m.r!=='err').slice(-12).map(m=>({role:m.r==='user'?'user':'model',parts:[{text:m.t}]})),
  generationConfig:Object.assign({temperature:.7,maxOutputTokens:an?3500:900},th?{thinkingConfig:th}:{})});
 const an=/probab|chance|an[aá]lis|c[aá]lcul|quanto|consig|alcan|projet|m[eé]dia|tend[eê]n|compar|contrato|meta|por que|porque|vale a pena|devo|conclu|hist[oó]ric|diagn|risco|atrasad|dificuldad|di[aá]rio|prioriz|plano|anota|retrospec|prova|experiment|check/i.test(q),ths=[{thinkingLevel:an?'low':'minimal'},{thinkingBudget:an?1024:0},null],sl=ms=>new Promise(z=>setTimeout(z,ms));
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
 if(msg)sf(()=>proc(msg));bm='';busy=false;pst();draw();sf(dside);sf(perfilAuto);
}
function dnotes(){const el=$('#lia-nl');if(!el)return;const L=notes().slice().reverse(),nm=nm0(),ab=notes().filter(x=>!x.res&&!x.ck).length;
 const c=$('#lia-nc');if(c)c.textContent='· '+ab+' aberta'+(ab===1?'':'s');
 el.innerHTML=L.length?L.slice(0,40).map(x=>`<div class="lia-n${x.res?' rs':''}"><div class="sub" style="font-size:.78rem;margin:0 0 3px">${bd(x.d)} · ${esc((NT.find(q=>q[0]===x.tp)||['',x.tp])[1])}${x.sid?' · '+esc(nm[x.sid]||'matéria removida'):''}${x.res?' · ✅ resolvida':''}</div><div>${esc(x.txt)}</div>${tagsHtml(x)}<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button type="button" class="ghost" data-nres="${x.id}">${x.res?'Reabrir':'Marcar como resolvida'}</button><button type="button" class="ghost danger" data-ndel="${x.id}">Excluir</button></div></div>`).join(''):'<p class="sub" style="margin:8px 0 0">Nenhuma anotação ainda.</p>'}
function addNote(an){const t=$('#lia-nt'),v=(t.value||'').trim();if(!v){toast('Escreva algo no diário primeiro.');t.focus();return}
 notes().push({id:'n'+Date.now().toString(36),d:fmt(now()),t:Date.now(),tp:$('#lia-ntp').value,sid:$('#lia-nsb').value||'',txt:v.slice(0,800),res:0,th:temas(v)});
 if(notes().length>150)notes().splice(0,notes().length-150);
 t.value='';save();dnotes();toast('Anotação salva no diário.');
 if(an)ask('Acabei de registrar uma nova anotação no meu diário. Leia-a junto com meus dados (provas, tarefas, matérias e padrões) e me diga, de forma realista, o que isso significa e o que fazer primeiro.')}
function build(el){
 const a=A(),Q=['Faça um diagnóstico completo dos meus estudos','Analise meu diário de dificuldades','Estou em risco nas provas?','O que está atrasado e o que faço primeiro?','Monte um plano de estudo para hoje','Faça a retrospectiva da minha semana','Faça a retrospectiva das minhas provas','Quais padrões e correlações você encontra nos meus dados?','Qual matéria estou deixando de lado?','Estou cansado, o que faço?'];
 el.innerHTML=`<style>
 #lia-face svg{width:72px;height:72px}
 #lia .lia-m{width:fit-content;padding:10px 14px;border-radius:16px;margin:8px 0;max-width:88%;line-height:1.45;word-wrap:break-word}
 #lia .lia-m.user{background:var(--flame);color:#fff;margin-left:auto;border-bottom-right-radius:4px}
 #lia .lia-m.model{background:var(--bg);border:1px solid var(--line);border-bottom-left-radius:4px}
 #lia .lia-m.err{background:rgba(239,68,68,.12);border:1px solid #ef4444;font-size:.9rem}
 #lia #lia-log{height:min(52vh,460px);overflow-y:auto;padding:4px 2px}
 #lia .lia-q{display:flex;gap:8px;margin-top:10px}#lia .lia-q textarea{flex:1;min-height:44px;max-height:120px;resize:vertical;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit}
 #lia .lia-ch{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}#lia .lia-ch .ghost{padding:5px 10px;font-size:.85rem}
 #lia .lia-n{background:var(--bg);border:1px solid var(--line);border-left:4px solid var(--flame);border-radius:12px;padding:8px 12px;margin:8px 0;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}#lia .lia-n.rs{opacity:.6;border-left-color:#00a878}
 #lia .lia-nf{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}#lia .lia-nf select{flex:1 1 160px}#lia .lia-fb{margin:-2px 0 6px;display:flex;gap:6px}#lia .lia-fb .ghost{padding:2px 8px;font-size:.8rem}#lia .lia-fb .on{outline:2px solid var(--flame)}#lia .lia-nf input{flex:1 1 140px;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit}
 #lia #lia-nt,#lia #lia-pft{width:100%;min-height:80px;resize:vertical;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit}#lia #lia-nl{max-height:280px;overflow-y:auto}
 #lia details{margin-bottom:12px}#lia details label{display:block;margin:8px 0 2px;font-size:.85rem;color:var(--muted)}#lia details input[type=password],#lia details input[type=text]{width:100%}
 </style>
 <div class="mgs">
  <details id="lia-cfg"${gk()&&a.ok?'':' open'}><summary style="cursor:pointer;font-weight:600">⚙️ Configurações</summary>
   <label for="lia-key">Chave da API do Google Gemini (fica só neste navegador e não entra no backup)</label><input type="password" id="lia-key" autocomplete="off" value="${esc(gk())}" placeholder="Cole sua chave do Google AI Studio">
   <label for="lia-mod">Modelo</label><input type="text" id="lia-mod" value="${esc(a.model)}">
   <label class="ck" style="display:flex;gap:8px;align-items:flex-start;margin-top:10px"><input type="checkbox" id="lia-ok"${a.ok?' checked':''}><span>Entendo que, a cada pergunta, um resumo dos meus dados de estudo (matérias, tempos, tarefas, provas, anotações, diário de dificuldades, lazer) é enviado ao Google. No plano gratuito do Gemini o Google pode usar esses dados para melhorar seus produtos.</span></label>
   <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn main" id="lia-save">Salvar</button><button class="btn" id="lia-rm">Remover chave</button><button class="ghost" id="lia-dg">Uso de armazenamento</button><button class="ghost" id="lia-mn">Atualizar manual do app</button><button class="ghost" id="lia-mv">Ver manual</button><button class="ghost" id="lia-ml">Ver modelos disponíveis</button></div><div class="lia-ch" id="lia-mlo"></div><p class="sub" id="lia-dgo" style="margin:8px 0 0"></p>
  </details>
  <div id="lia-ck"></div><details id="lia-dry" open><summary style="cursor:pointer;font-weight:600">📝 Meu diário para a Lumi IA <span id="lia-nc" class="sub"></span></summary>
   <p class="sub" style="margin:6px 0 0">Conte o que está difícil, o que te atrapalha, o que você quer alcançar ou como anda sua rotina. Escreva quantas vezes quiser: a Lumi IA lê tudo a cada resposta, cruza com seus números (provas, tarefas, matérias, foco) e passa a dar conselhos mais precisos. Marque como resolvida quando superar.</p>
   <div class="lia-nf"><select id="lia-ntp" aria-label="Tipo da anotação">${NT.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select><select id="lia-nsb" aria-label="Matéria relacionada"><option value="">Geral (nenhuma matéria)</option>${S.subjects.filter(s=>!s.arch).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
   <textarea id="lia-nt" maxlength="800" placeholder="Ex.: Trava em recorrências; perco o foco depois de 30 min; só consigo estudar à noite; prova de PAA na quinta e não terminei a Lista 2…" aria-label="Nova anotação"></textarea>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0"><button type="button" class="btn" id="lia-na">Salvar no diário</button><button type="button" class="btn main" id="lia-nan">Salvar e pedir análise</button></div>
   <div id="lia-nl"></div>
  </details>
  ${extraHtml()}<div id="lia-log" aria-live="polite"></div>
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
  else if(sideClick(b)){}
  else if(b.id==='lia-na'||b.id==='lia-nan'){addNote(b.id==='lia-nan')}
  else if(b.dataset.nres){const n=notes().find(x=>x.id===b.dataset.nres);if(n){n.res=n.res?0:1;save();dnotes()}}
  else if(b.dataset.ndel){if(confirm('Excluir esta anotação do diário?')){S.lnotes=notes().filter(x=>x.id!==b.dataset.ndel);save();dnotes()}}
  else if(b.id==='lia-rm'){sk('');$('#lia-key').value='';toast('Chave removida deste navegador.')}
  else if(b.id==='lia-clr'){if(!A().hist.length||confirm('Apagar toda a conversa com a Lumi IA?')){A().hist=[];pst();draw()}}
 });
 el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&e.target.id==='lia-q'){e.preventDefault();$('#lia-go').click()}});
 draw();dnotes();dside();dck();
}
function icons(){[['lm-ico','lia-ico'],['lm-ico2','lia-ico2'],['lm-ico2','lia-face']].forEach(([a,b])=>{const x=$('#'+a),y=$('#'+b);if(!x||!y||!x.innerHTML)return;let h=x.innerHTML;[...h.matchAll(/id="([^"]+)"/g)].forEach(m=>{const i=m[1];h=h.split('id="'+i+'"').join('id="'+i+'-ia"').split('#'+i+')').join('#'+i+'-ia)')});if(y.innerHTML!==h)y.innerHTML=h})}
function lia(){icons();if(curPage!=='lumiia')return;const el=$('#lia');if(!el)return;if(!el.dataset.b){el.dataset.b=1;build(el)}}
const _r=window.render;window.render=function(){const x=_r.apply(this,arguments);try{lia()}catch(e){console.error(e)}return x};
lia();setTimeout(icons,0);
})();
