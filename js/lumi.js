/* ===== Lumi: bot treinadora sem IA ===== */
(()=>{const $$=x=>document.getElementById(x),LM=()=>{S.lumi=S.lumi&&typeof S.lumi==='object'?S.lumi:{};const l=S.lumi;l.h=l.h||[];l.unk=l.unk||[];const t=fmt(now());if(l.date!==t){l.date=t;l.bonus=0;l.task=null}return l},
 sd=k=>(S.subjects||[]).reduce((a,x)=>a+((x.days&&x.days[k])||0),0),
 wk=()=>{let n=0;for(let i=0;i<7;i++)n+=sd(fmt(addD(now(),-i)));return n},
 ca=()=>{const a=(S.log||[]).filter(x=>x.f&&x.d>=fmt(addD(now(),-7))).map(x=>x.f);return a.length?a.reduce((p,c)=>p+c,0)/a.length:0},
 nz=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),
 pick=a=>a[Math.floor(Math.random()*a.length)],
 FACE={power:['💡','Treinadora de estudo, no comando'],care:['🤝','Modo parceira: estou com você'],push:['😤','Modo cobrança: sem enrolação'],sus:['🤨','Desconfiada. Prove o esforço'],sleep:['😴','Já é tarde. Falando baixinho'],joy:['😄','Orgulhosa de você']},
 KW={ansioso:/ansios|estress|nervos|preocup|pressao|medo|prova|panico|sobrecarreg|muita coisa|nao vou dar conta|desespe/g,
  cansado:/cansad|exaust|esgotad|quebrad|sem energia|sem pique|moido|pesad|nao aguent|fadig|bagacad|morto|mto cansad/g,
  desanimado:/desanim|sem animo|sem vontade|preguic|desmotiv|triste|pra baixo|nao quero|sem forca|desist|largar|nao rende/g,
  foco:/sem foco|disperso|distra|celular|nao consigo (focar|concentr)|concentra|cabeca avoa|mente voa/g,
  procrastina:/procrastin|depois eu|amanha eu|adiand|enrol|deixando pra|empurr|vou deixar/g,
  lazer:/lazer|descans|relax|folga|bonus|recompensa|jogar|assistir|serie|merec|brincar|dar um tempo|um tempinho|tempo livre|me da|me libera|libera|liberar|pode me dar|quero parar|queria parar/g,
  pausa:/pausa|intervalo|respirar|alongar|parar um pouco/g,
  status:/como estou|resumo|status|saldo|quanto estudei|minha situacao|como to |como tou/g,
  divida:/divida|devo|emprestimo|pagar/g,
  feliz:/animad|feliz|motivad|otimo|consegui|bati a meta|terminei|concluid|vamos la|bora|estou bem|to bem|tou bem/g,
  obrigado:/obrigad|valeu|vlw/g,
  cumpri:/cumpri|fiz a tarefa|ja fiz|completei|terminei a tarefa/g,
  oi:/^(oi|ola|eai|e ai|opa|bom dia|boa tarde|boa noite|fala|salve)/g},
 PR=['ansioso','cansado','desanimado','foco','procrastina','cumpri','divida','status','pausa','lazer','feliz','obrigado','oi'],
 RS={ansioso:['Respira. Ansiedade quer que você resolva tudo hoje; eu quero um passo só. Qual é a menor tarefa que você consegue começar agora?','Pressão é normal. Escreva as 3 coisas mais importantes e faça só a primeira. O resto espera.','Inspira 4 segundos, segura 4, solta 6. Três vezes. Depois 10 minutos de estudo, só 10. Combinado?'],
  cansado:['Cansaço é sinal, não sentença. 5 minutos de pausa de verdade: água, alongar, sem celular. Depois a gente volta.','Seu corpo pediu freio, então respeito. Levanta, bebe água, olha pra longe por 1 minuto e volta com um bloco curto de 15 min.','Cansado e parado não rende. Cansado e se mexendo rende. Alonga o pescoço e os ombros agora, depois decide.'],
  desanimado:['Motivação não aparece antes, ela vem depois que você começa. Dá 10 minutos pra mim. Se ainda estiver ruim, a gente conversa.','Dia ruim também conta se você aparecer. Menor meta possível: 1 exercício. Só 1.','Sem ânimo é normal. Disciplina é fazer mesmo assim, em porção pequena. Escolhe a matéria mais leve e faz 15 min.'],
  foco:['Disperso? Celular em outro cômodo, fone, e cronômetro de 25 minutos. Um alvo só.','Foco treina como músculo. Fecha as abas, anota o que está te puxando num papel e volta pro bloco.','Troca de matéria por uma mais leve e usa o cronômetro do app. Foco vem do ritmo.'],
  procrastina:['Ah, a famosa "depois eu faço". Começa por 5 minutos. Se passar disso, ótimo. Se não, pelo menos começou.','Adiar não apaga a tarefa, só aumenta o juro. Qual é a primeira ação? Faz ela agora.','Reconhecer já é metade. Abre o material e liga o cronômetro agora. Eu espero.'],
  pausa:['Pausa boa: 5 minutos, água, alongar, olhar pela janela. Pausa ruim: rede social. Qual você vai fazer?','Respira fundo 5 vezes, anda um pouco e volta. Pausa tem hora de acabar: 5 minutos.'],
  feliz:['Isso! Era disso que eu estava falando. Aproveita o embalo e engata mais um bloco.','Orgulho! Mantém o ritmo e fecha o dia forte.'],
  obrigado:['Estou aqui pra isso. Agora vai lá e me dá resultado.','Sem agradecer. Agradeça estudando.'],
  oi:['Fala, campeão! Como você está hoje: cansado, sem ânimo, focado?','Oi! Pronta pra te ajudar. Me conta como está.']};

 /* ===== Perguntas sugeridas (respondidas com os dados do app) ===== */
 const DW=['segunda','terça','quarta','quinta','sexta','sábado','domingo'],f1=x=>x.toFixed(1).replace('.',','),
  actv=D=>D.subs.filter(x=>x.w>0),
  noData=t=>({t,m:'care'}),
  lgAvg=(a,b)=>{const t=now(),L=(S.log||[]).filter(x=>x.f>0&&x.d>=fmt(addD(t,-a))&&x.d<fmt(addD(t,-b)));return L.length?{v:L.reduce((p,x)=>p+x.f,0)/L.length,n:L.length}:null},
  blocks=(D,f,max)=>coPlan(D,{f}).slice(0,max||3).map(p=>'• '+p.x.s.name+' · '+hh(p.m)+' · '+p.at.day+' às '+p.at.h+'h\n  '+p.why).join('\n'),
  goalInfo=()=>{const T=fmt(now()),mn=stkMin(T),dn=Math.round(stkTot(T));return{mn,dn,left:Math.max(0,mn-dn)}},
  QG=[
  ['📍 Hoje',['Como estou hoje?','Quanto falta para a meta de hoje?','Já posso ter lazer?','Qual matéria estudei menos hoje?','Como está minha semana comparada à anterior?']],
  ['📚 Matérias',['O que estudar agora?','Qual matéria estou deixando de lado?','Qual matéria rende mais para mim?']],
  ['⏰ Foco e rotina',['Qual meu melhor horário para estudar?','Em que dia da semana eu rendo mais?','Minha concentração está melhorando?']],
  ['🔥 Streak e nível',['Como está minha sequência?','O que acontece se eu não estudar hoje?','Quanto falta para o próximo nível?','O que já conquistei?']],
  ['😴 Lazer e dívida',['Por que meu lazer está negativo?','Quanto preciso estudar para sair do negativo?','Como pago minha dívida mais rápido?']],
  ['☢️ Terminal',['Como estão meus números do Terminal?']],
  ['🗓️ Planos',['Monte meu plano de hoje','Plano de emergência (30 min)','Plano para recuperar o lazer','O que fazer nos próximos 25 minutos?']],
  ['💬 Como estou me sentindo',['Estou cansado','Sem ânimo','Procrastinando','Sem foco','Ansioso','Quero lazer','Me lembra por que estou fazendo isso']]],
  QH={
  'como estou hoje?':()=>{const c=ctx(),g=goalInfo(),D=coData();return{t:'Hoje: '+hh(c.today)+' estudados. Meta mínima: '+hh(g.mn)+(g.left>0?' (faltam '+hh(g.left)+').':' (batida ✓).')+'\nLazer: '+(c.bal<0?lzS(c.bal):lzN(c.bal))+(c.debt>0?' · dívida de estudo: '+hh(c.debt):'')+'.\n'+(g.left>0?pick(['Ainda dá tempo. Um bloco já muda o dia.','Falta pouco para fechar o dia. Bora?']):pick(['Dia garantido. O que vier agora é bônus.','Meta feita. Agora é só não largar o ritmo.'])),m:g.left>0&&c.today<30?'push':'joy'}},
  'quanto falta para a meta de hoje?':()=>{const g=goalInfo();return g.left>0?{t:'Faltam '+hh(g.left)+' para o mínimo de hoje ('+hh(g.mn)+'). Você já fez '+hh(g.dn)+'. Dois blocos curtos resolvem.',m:'push'}:{t:'A meta de hoje ('+hh(g.mn)+') já foi batida: você fez '+hh(g.dn)+'. Excelente. Quer adiantar alguma matéria?',m:'joy'}},
  'ja posso ter lazer?':()=>{const c=ctx(),d=c.d;if(c.debt>0)return{t:'Ainda não. Você deve '+hh(c.debt)+' de estudo e cada minuto estudado paga isso primeiro.',m:'sus'};if(c.bal<0)return{t:'Seu saldo está em '+lzS(c.bal)+'. Estude até voltar para o positivo e depois a gente fala de lazer.',m:'sus'};if(d.bonus>=1)return{t:'O bônus de hoje já foi usado, mas você tem saldo de '+lzN(c.bal)+' para usar normalmente.',m:'power'};return{t:'Você tem '+lzN(c.bal)+' de saldo. Pode usar. E se quiser um bônus extra, é só me pedir um descanso.',m:'joy'}},
  'qual materia estudei menos hoje?':()=>{const D=coData(),A=actv(D);if(!A.length)return noData('Não encontrei matérias ativas com importância para comparar.');const T=D.T,m=x=>x.s.days[T]||0,z=A.filter(x=>m(x)===0);if(z.length===A.length)return{t:'Hoje você ainda não estudou nenhuma matéria. Qualquer uma já é um começo.',m:'push'};if(z.length)return{t:z.length+' de '+A.length+' matérias ainda estão zeradas hoje, por exemplo: '+z.slice(0,3).map(x=>x.s.name).join(', ')+'. Escolhe a mais leve e faz 15 minutos.',m:'push'};const w=A.slice().sort((a,b)=>m(a)-m(b))[0];return{t:'Todas tiveram algum estudo hoje. A menor foi '+w.s.name+' ('+hh(m(w))+').',m:'joy'}},
  'como esta minha semana comparada a anterior?':()=>{const a=wk();let b=0;for(let i=7;i<14;i++)b+=sd(fmt(addD(now(),-i)));if(!a&&!b)return noData('Ainda não tenho estudo registrado nessas duas semanas.');const dif=b>0?Math.round((a-b)/b*100):null;return{t:'Últimos 7 dias: '+hh(a)+'. Os 7 anteriores: '+hh(b)+'.'+(dif==null?'':(dif>=0?'\nUma alta de '+dif+'%. ':'\nUma queda de '+Math.abs(dif)+'%. ')+(dif>=0?'Bom sinal.':'Dá para recuperar com um bloco extra por dia.')),m:dif!=null&&dif<0?'push':'joy'}},
  'o que estudar agora?':()=>{const D=coData(),p=coPlan(D,{f:'x'})[0];if(!p)return noData('Não achei matéria elegível. Veja se há matérias ativas com importância acima de zero.');return{t:'Eu começaria por '+p.x.s.name+', um bloco de '+hh(p.m)+'.\n'+p.why+'\nCronômetro ligado e celular longe.',m:'power'}},
  'qual materia estou deixando de lado?':()=>{const D=coData(),A=actv(D);if(!A.length)return noData('Sem matérias ativas para analisar.');const o=A.slice().sort((a,b)=>(b.last==null?999:b.last)-(a.last==null?999:a.last));const w=o[0];if(w.last==null)return{t:w.s.name+' está sem nenhum registro recente. É ela.',m:'push'};if(w.last<=1)return{t:'Nenhuma está abandonada: a mais antiga foi estudada há '+w.last+' dia(s). Parabéns.',m:'joy'};return{t:o.filter(x=>x.last==null||x.last>=3).slice(0,3).map(x=>'• '+x.s.name+': '+(x.last==null?'sem registro':'há '+x.last+' dias')).join('\n')+'\nSugiro 25 minutos na primeira da lista.',m:'push'}},
  'qual materia rende mais para mim?':()=>{const D=coData(),A=actv(D).filter(x=>x.fq!=null&&x.n>=2);if(A.length<2)return noData('Ainda não tenho registros de foco suficientes por matéria. Anote a nota de foco (★) ao registrar blocos.');const o=A.slice().sort((a,b)=>b.fq-a.fq),b=o[0],w=o[o.length-1];return{t:'Seu melhor foco é em '+b.s.name+' ('+f1(b.fq)+'★). O mais baixo é em '+w.s.name+' ('+f1(w.fq)+'★).\nDica: coloque '+w.s.name+' no seu melhor horário e sem celular.',m:'power'}},
  'qual meu melhor horario para estudar?':()=>{const D=coData();if(!D.hours.length)return noData('Ainda faltam registros com horário e nota de foco. Com mais alguns blocos eu descubro.');return{t:'Seus melhores horários: '+D.hours.slice(0,3).map(o=>o.h+'h ('+f1(o.fq)+'★)').join(', ')+'.\nReserve as matérias difíceis para essas janelas.',m:'power'}},
  'em que dia da semana eu rendo mais?':()=>{const D=coData(),w=D.wavg;if(!w.some(v=>v>0))return noData('Ainda sem estudo suficiente nas últimas semanas.');const o=w.map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v);return{t:'Nos últimos 28 dias, seu dia mais forte é '+DW[o[0].i]+' (média de '+hh(o[0].v)+'). O mais fraco é '+DW[o[6].i]+' ('+hh(o[6].v)+').',m:'power'}},
  'minha concentracao esta melhorando?':()=>{const a=lgAvg(7,0),b=lgAvg(14,7);if(!a||!b)return noData('Preciso de registros de foco nas duas últimas semanas para comparar.');const d=a.v-b.v;return{t:'Esta semana: '+f1(a.v)+'★. Semana anterior: '+f1(b.v)+'★. '+(Math.abs(d)<.15?'Estável.':d>0?'Subindo. Bom trabalho.':'Caindo um pouco. Olhe sono e celular durante os blocos.'),m:d<-.15?'push':'joy'}},
  'como esta minha sequencia?':()=>{const g=gstreak(),gi=goalInfo();return{t:'Sequência atual: '+g.c+' dia(s). Recorde: '+g.b+'.'+(g.c>=g.b&&g.c>0?'\nVocê está no seu recorde!':g.b>g.c?'\nFaltam '+(g.b-g.c)+' dia(s) para igualar o recorde.':'')+(gi.left>0?'\nHoje ainda faltam '+hh(gi.left)+' para manter a corrente.':'\nHoje já está garantido.'),m:g.c>0?'joy':'push'}},
  'o que acontece se eu nao estudar hoje?':()=>{const g=gstreak(),gi=goalInfo();if(gi.left<=0)return{t:'Nada de ruim: a meta de hoje já foi batida e a sequência está protegida.',m:'joy'};return{t:g.c>0?'Você perde a sequência de '+g.c+' dia(s) (recorde: '+g.b+'). Faltam '+hh(gi.left)+' para evitar isso.':'Sua sequência já está zerada, então o risco é não começar uma nova. Faltam '+hh(gi.left)+' para a meta.',m:'push'}},
  'quanto falta para o proximo nivel?':()=>{const R=xpRun(),L=lvInfo(R.xp);if(!L.need)return{t:'Você está no nível máximo. Respeito.',m:'joy'};return{t:'Você está no nível '+L.n+', com '+L.r+' de '+L.need+' XP. Faltam '+(L.need-L.r)+' XP para o próximo.',m:'power'}},
  'o que ja conquistei?':()=>{const R=xpRun(),L=lvInfo(R.xp),g=gstreak(),D=coData();return{t:'Nível '+L.n+' · sequência de '+g.c+' dia(s) (recorde '+g.b+') · '+hh(D.tot14)+' estudados nos últimos 14 dias em '+D.d14+' dias.\nIsso é consistência de verdade.',m:'joy'}},
  'por que meu lazer esta negativo?':()=>{const c=ctx();if(c.bal>=0&&c.debt<=0)return{t:'Seu lazer está positivo ('+lzN(c.bal)+'). Nada para explicar.',m:'joy'};const N=lzCfg().led.filter(x=>x.min<0).slice(-4).reverse();return{t:'Saldo atual: '+lzS(c.bal)+'. Últimos descontos:\n'+(N.length?N.map(x=>'• '+fmt(new Date(x.t)).slice(5).split('-').reverse().join('/')+' · '+lzS(x.min)+' · '+(x.note||x.nm||x.type)).join('\n'):'• não achei descontos recentes no histórico.')+'\nO que mais pesa é a ociosidade e as falhas no Terminal.',m:'care'}},
  'quanto preciso estudar para sair do negativo?':()=>{const c=ctx(),n=lzNeed();if(c.bal>0&&c.debt<=0)return{t:'Você não está no negativo. Saldo: '+lzN(c.bal)+'.',m:'joy'};if(n==null)return noData('A taxa de lazer está em zero, então não consigo calcular.');return{t:'Pela taxa base, uns '+hh(n)+' de estudo (incluindo a dívida de '+hh(c.debt)+'). Foco 5★ rende mais, então pode ser menos.',m:'push'}},
  'como pago minha divida mais rapido?':()=>{const c=ctx();if(c.debt<=0&&c.bal>=0)return{t:'Sem dívida e saldo positivo.',m:'joy'};return{t:(c.debt>0?'Você deve '+hh(c.debt)+' de estudo, e cada minuto estudado paga isso antes de virar lazer. ':'')+'O jeito mais rápido: blocos com foco 4 a 5★ e sem interrupções. '+(c.bal<0?'Para voltar ao positivo, faltam uns '+hh(lzNeed()||0)+'.':''),m:'push'}},
  'como estao meus numeros do terminal?':()=>{const l=S.lost||{};return{t:'Terminal: '+(l.codes||0)+' código(s) inserido(s), sequência de '+(l.streak||0)+', recorde de '+(l.best||0)+' e '+(l.fails||0)+' falha(s).',m:(l.fails||0)>(l.codes||0)?'sus':'power'}},
  'monte meu plano de hoje':()=>{const D=coData(),b=blocks(D,'x',3);return b?{t:'Plano de hoje:\n'+b+'\nFez o primeiro? Me chama.',m:'power'}:noData('Sem matérias elegíveis para montar o plano.')},
  'plano de emergencia (30 min)':()=>{const D=coData(),A=actv(D);if(!A.length)return noData('Sem matérias ativas.');const x=A.slice().sort((a,b)=>b.w-a.w||a.s.diff-b.s.diff)[0],g=goalInfo();return{t:'Dia ruim? Faz só isto: 25 minutos de '+x.s.name+' + 5 de pausa. '+(g.left>0?'Isso ajuda com os '+hh(g.left)+' que faltam hoje.':'A meta de hoje já está feita, então é bônus.')+' Só um bloco. Combinado?',m:'care'}},
  'plano para recuperar o lazer':()=>{const D=coData(),c=ctx(),b=blocks(D,'laz',3);return b?{t:(c.bal<0?'Para sair de '+lzS(c.bal)+':\n':'Seu lazer está ok. Para ganhar folga:\n')+b,m:'push'}:noData('Sem matérias elegíveis.')},
  'o que fazer nos proximos 25 minutos?':()=>{const D=coData(),A=actv(D);if(!A.length)return noData('Sem matérias ativas.');const x=A.slice().sort((a,b)=>(b.last==null?999:b.last)-(a.last==null?999:a.last))[0];return{t:'25 minutos de '+x.s.name+(x.last?', que está há '+x.last+' dia(s) sem contato':'')+'. Celular longe, cronômetro ligado. Quando acabar, 5 minutos de pausa.',m:'power'}},
  'me lembra por que estou fazendo isso':()=>{const D=coData(),g=gstreak(),L=lvInfo(xpRun().xp);return{t:'Você já está no nível '+L.n+', com '+g.c+' dia(s) seguidos e '+hh(D.tot14)+' nos últimos 14 dias. Isso foi você aparecendo quando não queria. Hoje é só mais um passo. Qual é o menor?',m:'care'}}},
  qa=raw=>{const k=nz(raw).replace(/\s+/g,' ').trim(),h=QH[k];if(!h)return null;try{return h()}catch(e){return{t:'Tive um problema para ler seus dados agora. Tenta de novo em instantes.',m:'care'}}},
  chips=()=>{const c=ctx(),g=goalInfo(),h=new Date().getHours(),o=[];
   if(c.debt>0||c.bal<0)o.push('Por que meu lazer está negativo?');
   if(c.today<=0)o.push('O que estudar agora?');
   o.push('Como estou hoje?');
   if(g.left>0)o.push('Quanto falta para a meta de hoje?');
   if(c.debt>0)o.push('Como pago minha dívida mais rápido?');else if(c.bal<0)o.push('Quanto preciso estudar para sair do negativo?');else o.push('Já posso ter lazer?');
   o.push('Como está minha sequência?');
   if(c.today<=0||g.left>0)o.push('Monte meu plano de hoje');else o.push('Qual meu melhor horário para estudar?');
   try{if(ALN())o.unshift('Quais são meus alertas?')}catch(e){}return[...new Set(o)].slice(0,6)};
/*LUMI-BRAIN-START*/
const LEX={cansado:['cansado','cansada','exausto','exausta','esgotado','esgotada','fadiga','sonolento','sonolenta','estafado','estafada','bagacado','derrubado'],ansioso:['ansioso','ansiosa','ansiedade','estressado','estressada','estresse','nervoso','nervosa','preocupado','preocupada','sobrecarregado','sobrecarregada','desesperado','desesperada'],desanimado:['desanimado','desanimada','desmotivado','desmotivada','preguica','preguicoso','preguicosa'],foco:['disperso','dispersa','distraido','distraida','concentracao','concentrar','dispersando'],procrastina:['procrastinando','procrastinar','procrastinei','adiando','enrolando','empurrando'],feliz:['animado','animada','motivado','motivada','empolgado','empolgada','otimo','otima'],obrigado:['obrigado','obrigada'],lazer:['descansar','descanso','relaxar','recompensa'],pausa:['intervalo','respirar','alongar']};
const lev=(a,b)=>{if(a===b)return 0;const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]};
const toks=n=>n.replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
const tkey=t=>nz(t).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const NEG=/(?:^|\s)(?:nao|nunca|nem|jamais)\s+(?:[a-z]+\s+){0,2}$/,NEGINT=['ansioso','cansado','desanimado','foco','procrastina'];
function scoreIntents(n){const sc={},ng={};
 PR.forEach(k=>{sc[k]=0;ng[k]=0;const re=new RegExp(KW[k].source,'g');let m;while((m=re.exec(n))){if(m[0]===''){re.lastIndex++;continue}
  if(NEGINT.includes(k)&&!/^(nao|nunca|nem|sem)/.test(m[0])&&NEG.test(n.slice(0,m.index)))ng[k]++;else sc[k]++}});
 const tk=toks(n);
 PR.forEach(k=>{const L=LEX[k];if(!L||sc[k]||ng[k])return;let hit=0,neg=false;
  tk.forEach((w,i)=>{if(w.length<4||hit)return;let ok=0;if(L.includes(w))ok=1;else if(w.length>=6){for(const x of L){if(x[0]===w[0]&&Math.abs(x.length-w.length)<=2&&lev(w,x)<=(w.length>=9?2:1)){ok=.8;break}}}
   if(ok){hit=ok;neg=NEGINT.includes(k)&&NEG.test(tk.slice(0,i).join(' ')+' ')}});
  if(hit){if(neg)ng[k]++;else sc[k]+=hit}});
 const pos=PR.some(k=>sc[k]>0),negd=NEGINT.some(k=>ng[k]>0);
 if(negd&&!pos)sc.feliz=(sc.feliz||0)+.6;
 return sc}
const sm=(s,keys)=>keys.reduce((a,k)=>a+((s.days&&s.days[k])||0),0);
const fav=(keys,sid)=>{const st=new Set(keys),L=(S.log||[]).filter(x=>x.f>0&&st.has(x.d)&&(!sid||x.sid===sid));return L.length?{v:L.reduce((a,x)=>a+x.f,0)/L.length,n:L.length}:null};
const dl=(a,b)=>b>0?(a>=b?'+':'')+Math.round((a-b)/b*100)+'%':null;
function pk(kind,off){const t=now();let a,b;
 if(kind==='day'){a=b=addD(t,off)}
 else if(kind==='week'){a=addD(monday(t),7*off);b=addD(a,6)}
 else if(kind==='month'){a=new Date(t.getFullYear(),t.getMonth()+off,1);b=new Date(t.getFullYear(),t.getMonth()+off+1,0)}
 else{a=new Date(t.getFullYear()+off,0,1);b=new Date(t.getFullYear()+off,11,31)}
 const keys=[];for(let d=new Date(a);d<=b;d=addD(d,1))keys.push(fmt(d));return keys}
function per(kind,off,label,N){const t=fmt(now());let keys,prev;
 if(kind==='last'){keys=[];for(let i=N-1;i>=0;i--)keys.push(fmt(addD(now(),-i)));prev=[];for(let i=2*N-1;i>=N;i--)prev.push(fmt(addD(now(),-i)))}
 else{keys=pk(kind,off);prev=pk(kind,off-1);if(off===0){keys=keys.filter(k=>k<=t);prev=prev.slice(0,keys.length)}}
 return{kind,off,N,label,keys,prev}}
function findPer(n){let m;
 if(m=n.match(/ultimos? (\d{1,3}) dias/))return per('last',0,'nos últimos '+(+m[1])+' dias',Math.max(1,Math.min(365,+m[1])));
 if(/anteontem/.test(n))return per('day',-2,'anteontem');
 if(/\bontem\b/.test(n))return per('day',-1,'ontem');
 if(/\bamanha\b/.test(n))return per('day',1,'amanhã');
 if(/\bhoje\b/.test(n))return per('day',0,'hoje');
 if(/semana (passada|anterior)|ultima semana/.test(n))return per('week',-1,'na semana passada');
 if(/\bsemana\b/.test(n))return per('week',0,'nesta semana');
 if(/mes (passado|anterior)|ultimo mes/.test(n))return per('month',-1,'no mês passado');
 if(/\bmes\b/.test(n))return per('month',0,'neste mês');
 if(/ano (passado|anterior)/.test(n))return per('year',-1,'no ano passado');
 if(/\bano\b/.test(n))return per('year',0,'neste ano');
 return null}
function findSubj(n){let best=null,bs=0;const tk=toks(n);
 (S.subjects||[]).forEach(s=>{const nm=tkey(s.name);if(!nm)return;let sc=0;
  if((' '+n.replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ')+' ').includes(' '+nm+' '))sc=10+nm.length;
  else nm.split(' ').filter(w=>w.length>=4).forEach(w=>tk.forEach(t=>{if(t.length>=4&&(t===w||(w.length>=6&&t[0]===w[0]&&lev(t,w)<=1)))sc+=w.length}));
  if(s.arch)sc*=.5;if(sc>bs){bs=sc;best=s}});
 return bs>=4?best:null}
const ctxOf=(k,o)=>Object.assign({k},o);
const pctx=p=>p?{kind:p.kind,off:p.off,N:p.N,label:p.label}:null,perOf=c=>c?per(c.kind,c.off,c.label,c.N):null;
function aResumo(p,deep){const A=S.subjects||[],keys=p.keys,rows=A.map(s=>({s,m:sm(s,keys)})).filter(r=>r.m>0).sort((a,b)=>b.m-a.m),T=rows.reduce((a,r)=>a+r.m,0),PT=A.reduce((a,s)=>a+sm(s,p.prev),0),dd=keys.filter(k=>A.some(s=>k in s.days)).length,f=fav(keys),st=new Set(keys),dn=allTasks().filter(o=>o.x.done&&o.x.doneAt&&st.has(o.x.doneAt)).length,c=ctxOf('res',{p:pctx(p)});
 c.why='Somei os minutos registrados em cada matéria '+p.label+' e comparei com o período anterior de mesmo tamanho. O foco vem das notas ★ que você anotou.';
 if(!T&&!dd)return{t:'Não encontrei estudo registrado '+p.label+'.',m:'care',c};
 let t=(p.label.charAt(0).toUpperCase()+p.label.slice(1))+': '+hh(T)+' em '+dd+' dia'+(dd===1?'':'s')+(rows.length?' e '+rows.length+' matéria'+(rows.length===1?'':'s'):'')+'.\n'+rows.slice(0,deep?20:4).map(r=>'• '+r.s.name+' · '+hh(r.m)).join('\n');
 if(PT>0)t+='\nComparado ao período anterior ('+hh(PT)+'): '+dl(T,PT)+'.';else if(T>0&&p.off!==0||p.kind==='last')t+='\nSem base de comparação no período anterior.';
 if(f)t+='\nFoco médio: '+f1(f.v)+'★ ('+f.n+' registro'+(f.n===1?'':'s')+').';
 if(dn)t+='\n'+dn+' tarefa'+(dn===1?'':'s')+' concluída'+(dn===1?'':'s')+'.';
 if(deep&&keys.length<=31){t+='\n\nDia a dia:\n'+keys.map(k=>{const m=A.reduce((a,s)=>a+(s.days[k]||0),0);return '• '+k.slice(8)+'/'+k.slice(5,7)+' · '+(m?hh(m):'—')}).join('\n')}
 return{t,m:PT>0&&T>=PT?'joy':'power',c}}
function aMateria(s,p,deep){const t0=fmt(now()),m=sm(s,p.keys),pm=sm(s,p.prev),dd=p.keys.filter(k=>k in s.days).length,ag=ago(s),f=fav(p.keys,s.id),T=(s.topics||[]).filter(x=>!x.done),late=T.filter(x=>x.date&&x.date<t0).sort((a,b)=>a.date<b.date?-1:1),nx=T.filter(x=>x.date&&x.date>=t0).sort((a,b)=>a.date<b.date?-1:1)[0],ex=T.filter(x=>x.exam&&x.date&&x.date>=t0).sort((a,b)=>a.date<b.date?-1:1)[0],m7=sm(s,per('last',0,'',7).keys),c=ctxOf('mat',{sid:s.id,p:pctx(p)});
 c.why='Somei os minutos de '+s.name+' '+p.label+', comparei com o período anterior e cruzei com as suas tarefas, provas e notas de foco.';
 let t=s.name+' '+p.label+': '+(m?hh(m):'sem minutos registrados')+' em '+dd+' dia'+(dd===1?'':'s')+'.\nSequência: '+streak(s)+' dia(s) · último estudo: '+(ag==null?'nunca':ag===0?'hoje':'há '+ag+' dia(s)')+'.';
 if(pm>0)t+='\nPeríodo anterior: '+hh(pm)+' ('+dl(m,pm)+').';
 if(f)t+='\nFoco médio: '+f1(f.v)+'★ ('+f.n+' registro'+(f.n===1?'':'s')+').';
 t+='\nTarefas: '+T.length+' pendente'+(T.length===1?'':'s')+(late.length?' ('+late.length+' atrasada'+(late.length===1?'':'s')+')':'')+(nx?' · próxima: '+nx.name+' ('+br(nx.date)+')':'')+'.';
 if(ex)t+='\nProva: '+ex.name+' em '+diff(t0,ex.date)+' dia(s).';
 t+='\nImportância: '+IMP[impOf(s)]+' · Dificuldade: '+DIFF[diffOf(s)]+'.';
 let tip,mo='power';
 if(impOf(s)===0){tip='Está marcada como sem importância, então fica fora do plano semanal.'}
 else if(late.length){tip='Comece pela atrasada mais antiga: "'+late[0].name+'" ('+br(late[0].date)+').';mo='push'}
 else if(ex&&diff(t0,ex.date)<=14&&m7<120){tip='Prova em '+diff(t0,ex.date)+' dia(s) e só '+hh(m7)+' nos últimos 7 dias. Hora de aumentar o ritmo.';mo='push'}
 else if(ag!=null&&ag>=5){tip='Está há '+ag+' dias parada. Um bloco de 25 min já reativa.';mo='sus'}
 else if(pm>0&&m>pm*1.2){tip='Ritmo subindo. Mantém.';mo='joy'}
 else if(pm>0&&m<pm*.7&&p.off!==0||pm>0&&m<pm*.7&&p.kind==='last'){tip='O ritmo caiu em relação ao período anterior.';mo='care'}
 else tip='Ritmo estável.';
 t+='\n\n'+tip;
 if(deep){const wk=Array(7).fill(0),cn=Array(7).fill(0);for(let i=1;i<=56;i++){const d=addD(now(),-i),k=fmt(d),w=(d.getDay()+6)%7;cn[w]++;wk[w]+=s.days[k]||0}
  const o=wk.map((v,i)=>({v:v/Math.max(1,cn[i]),i})).sort((a,b)=>b.v-a.v);
  if(o[0].v>0)t+='\n\nNas últimas 8 semanas, seu melhor dia nessa matéria é '+DW[o[0].i]+' (média de '+hh(o[0].v)+') e o mais fraco é '+DW[o[6].i]+'.';
  if(p.keys.length<=14)t+='\n\nDia a dia:\n'+p.keys.map(k=>'• '+k.slice(8)+'/'+k.slice(5,7)+' · '+(s.days[k]?hh(s.days[k]):'—')).join('\n')}
 return{t,m:mo,c}}
function aTarefas(sj,p){const t0=fmt(now());let L=allTasks().filter(o=>!o.x.done&&!o.s.arch&&(!sj||o.s===sj));
 if(p&&p.kind==='day'){const d=p.keys[0];L=L.filter(o=>o.x.date===d||(d===t0&&o.x.date&&o.x.date<t0))}
 else if(p&&p.kind==='week'){const a=p.keys[0],b=fmt(addD(parse(a),6));L=L.filter(o=>o.x.date&&(o.x.date<t0||(o.x.date>=a&&o.x.date<=b)))}
 L.sort((a,b)=>(a.x.date||'9999')<(b.x.date||'9999')?-1:1);
 const late=L.filter(o=>o.x.date&&o.x.date<t0).length,est=L.reduce((a,o)=>a+(o.x.est||0),0),c=ctxOf('tar',{sid:sj?sj.id:null,p:pctx(p)});
 c.why='Listei as tarefas não concluídas do calendário'+(sj?' de '+sj.name:'')+', com as atrasadas primeiro.';
 if(!L.length)return{t:'Nenhuma tarefa pendente'+(sj?' em '+sj.name:'')+(p?' '+p.label:'')+'. Quer planejar algo novo?',m:'joy',c};
 return{t:L.length+' tarefa'+(L.length===1?'':'s')+' pendente'+(L.length===1?'':'s')+(sj?' em '+sj.name:'')+(p?' '+p.label:'')+(late?' ('+late+' atrasada'+(late===1?'':'s')+')':'')+(est?' · ~'+hh(est)+' estimados':'')+':\n'+L.slice(0,7).map(o=>'• '+(o.x.date&&o.x.date<t0?'⚠️ ':'')+o.x.name+' · '+o.s.name+(o.x.date?' · '+br(o.x.date):'')+(o.x.est?' · '+o.x.est+' min':'')).join('\n')+(L.length>7?'\n… e mais '+(L.length-7)+'.':'')+(late?'\n\nComece pela mais antiga.':''),m:late?'push':'power',c}}
function aProvas(sj){const t0=fmt(now());const L=allTasks().filter(o=>o.x.exam&&!o.x.done&&o.x.date&&o.x.date>=t0&&(!sj||o.s===sj)).sort((a,b)=>a.x.date<b.x.date?-1:1),c=ctxOf('prv',{sid:sj?sj.id:null});
 c.why='Usei as tarefas marcadas como prova, o estudo dos últimos 7 dias da matéria e os tópicos que ainda faltam.';
 if(!L.length)return{t:'Não há provas futuras cadastradas'+(sj?' em '+sj.name:'')+'.',m:'care',c};
 const k7=per('last',0,'',7).keys;let warn=false;
 const lines=L.slice(0,5).map(o=>{const d=diff(t0,o.x.date),m7=sm(o.s,k7),pend=(o.s.topics||[]).filter(x=>!x.done&&!x.exam),pe=pend.reduce((a,x)=>a+(x.est||0),0),al=d<=7&&m7<120;if(al)warn=true;
  return '• '+(al?'⚠️ ':'')+o.s.name+' · '+o.x.name+' · '+br(o.x.date)+' (em '+d+' dia'+(d===1?'':'s')+')\n   estudou '+hh(m7)+' em 7 dias · '+pend.length+' tópico'+(pend.length===1?'':'s')+' pendente'+(pend.length===1?'':'s')+(pe&&d>0?' · ~'+hh(Math.ceil(pe/d))+'/dia para fechar':'')});
 return{t:'Próximas provas:\n'+lines.join('\n')+(warn?'\n\n⚠️ Prova perto e pouco estudo recente. Priorize essa matéria.':''),m:warn?'push':'power',c}}
const QW=/quanto|quantas|quantos|resum|desempenho|andamento|progresso|situacao|estudei|estudado|estou indo|ando indo|como (estou|ando|foi|foram|esta|estao|vai|vao|anda)|me (fala|mostra|conta)|mostr|balanco|relatorio/,TQ=/tarefa|pendenc|pendente|atrasad|a fazer|afazer/,PQ=/\b(prova|provas|exame|exames)\b/,PA=/quando|qual|quais|proxima|proximas|tenho|falta|faltam|quantas|quantos|como esta|como estao|marcad/,EMO=/ansios|nervos|medo|preocup|panico|desesper|cansad|desanim|procrastin|exaust/,GUARD=/falta|meta|lazer|nivel|divida|streak|sequencia|saldo|descans|plano/;
function analyze(n){const dp=(typeof deepAsk==='function')?deepAsk(n):null;if(dp)return dp;const sj=findSubj(n),p=findPer(n);if(EMO.test(n))return null;
 if(PQ.test(n)&&PA.test(n))return aProvas(sj);
 if(TQ.test(n)&&(sj||/tenho|quais|minhas|pendentes|atrasadas|hoje|amanha|semana/.test(n)))return aTarefas(sj,p);
 if(QW.test(n)&&(sj||!GUARD.test(n))){if(sj)return aMateria(sj,p||per('week',0,'nesta semana'));if(p)return aResumo(p)}
 return null}
function follow(n){const l=LM(),c=l.ctx;if(!c||!c.k)return null;const tk=toks(n);if(tk.length>9)return null;
 if(/^(por ?que|pq|como (voce )?calcul|de onde (veio|saiu))/.test(n))return{t:c.why||'Calculei com os seus registros de estudo, foco e tarefas. Nada é chute.',m:'power',c};
 const sj0=c.sid?(S.subjects||[]).find(x=>x.id===c.sid):null,p0=perOf(c.p);
 if(/^(mais|detalha|detalhe|detalhar|me conta mais|explica melhor|aprofunda|mais detalhes)/.test(n)){
  if(c.k==='mat'&&sj0)return aMateria(sj0,p0||per('week',0,'nesta semana'),true);
  if(c.k==='res'&&p0)return aResumo(p0,true);
  if(c.k==='diag')return diag(true);
  if(c.k==='ins')return one(c.id);
  return{t:'Esse já foi o detalhe completo que eu tenho. Quer olhar outra matéria ou outro período?',m:'care',c}}
 const sj=findSubj(n),p=findPer(n);
 if((sj||p)&&(/^(e|mas|entao|e se|e quanto|e como|agora|me fala d)\b/.test(n)||(tk.length<=3&&!QW.test(n)))){
  if(c.k==='prv')return aProvas(sj||sj0);
  if(c.k==='tar')return aTarefas(sj||sj0,p||p0);
  if(sj||(c.k==='mat'&&sj0))return aMateria(sj||sj0,p||p0||per('week',0,'nesta semana'));
  if(p)return aResumo(p)}
 return null}
const TL={cansado:'Estou cansado',ansioso:'Estou ansioso',desanimado:'Sem ânimo',foco:'Sem foco',procrastina:'Procrastinando',cumpri:'Cumpri a tarefa',divida:'Falar da dívida',status:'Como estou (status)',pausa:'Quero uma pausa',lazer:'Quero lazer',feliz:'Estou animado',obrigado:'Agradecimento',oi:'Cumprimento'};
function teachLookup(raw){const l=LM(),T=l.teach||{},k=tkey(raw);if(!k)return null;let tg=T[k];
 if(!tg){const a=new Set(k.split(' ').filter(w=>w.length>2));if(a.size>=2){let bj=0;for(const q in T){const b=new Set(q.split(' ').filter(w=>w.length>2));let i=0;a.forEach(w=>{if(b.has(w))i++});const j=i/(a.size+b.size-i);if(j>bj&&j>=.75){bj=j;tg=T[q]}}}}
 if(!tg)return null;return tg.indexOf('q:')===0?{q:tg.slice(2)}:{i:tg}}
const teachOpts=()=>'<optgroup label="Como estou">'+Object.entries(TL).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</optgroup><optgroup label="Perguntas">'+QG.flatMap(g=>g[1]).filter(x=>QH[nz(x).replace(/\s+/g,' ').trim()]).map(x=>'<option value="q:'+esc(nz(x).replace(/\s+/g,' ').trim())+'">'+esc(x)+'</option>').join('')+'</optgroup>';
function teachLabel(v){return v.indexOf('q:')===0?'pergunta':(TL[v]||v)}
/*LUMI-BRAIN-END*/
/*LUMI-INSIGHTS-START*/
const ALL=()=>S.subjects||[],ACT=()=>ALL().filter(s=>!s.arch),DK=i=>fmt(addD(now(),-i)),
 avg=a=>a.length?a.reduce((p,c)=>p+c,0)/a.length:null,
 med=a=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y),m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2},
 cf=n=>n>=15?'alta':n>=6?'média':'baixa',
 slope=ys=>{const n=ys.length;if(n<3)return null;const mx=(n-1)/2,my=avg(ys);let a=0,b=0;ys.forEach((y,i)=>{a+=(i-mx)*(y-my);b+=(i-mx)*(i-mx)});return a/b},
 dayMin=(i)=>ALL().reduce((a,s)=>a+(s.days[DK(i)]||0),0),
 rngMin=(a,b)=>{let m=0;for(let i=a;i<b;i++)m+=dayMin(i);return m},
 lgs=(n,f)=>(S.log||[]).filter(x=>x.d>=DK(n)&&x.d<=fmt(now())&&(!f||x.f>0)),
 wdOf=k=>(new Date(k+'T00:00:00').getDay()+6)%7,
 PP={madrugada:'de madrugada',manhã:'de manhã',tarde:'à tarde',noite:'à noite'},
 PERIODS=[['madrugada',0,5],['manhã',5,12],['tarde',12,18],['noite',18,24]],
 mk=(id,ic,t,d,sev,n,why)=>({id,ic,t,d,sev,n,why});
const I={};
I.estim=()=>{const L=[];ALL().forEach(s=>(s.topics||[]).forEach(x=>{if(x.done&&x.est>0&&x.spent>0)L.push(x)}));if(L.length<3)return null;
 const E=L.reduce((a,x)=>a+x.est,0),Sp=L.reduce((a,x)=>a+x.spent,0),r=Sp/E,pc=Math.round(r*100);
 const t=r>1.25?'Você subestima o tempo das tarefas':r<.8?'Você superestima o tempo das tarefas':'Suas estimativas de tempo são boas';
 const d=(r>1.25?'As tarefas levam em média '+pc+'% do tempo que você estimou. Ao planejar, multiplique a estimativa por ~'+f1(r)+'.':r<.8?'As tarefas levam em média só '+pc+'% do estimado. Dá para planejar blocos menores e encaixar mais coisa.':'O tempo real fica em '+pc+'% do estimado. Pode confiar nas suas estimativas.')+'\nBase: '+L.length+' tarefas concluídas com tempo medido ('+hh(Sp)+' reais contra '+hh(E)+' estimados).';
 return mk('estim','⏱️',t,d,r>1.5||r<.6?2:r>1.25||r<.8?1:0,L.length,'Comparei o tempo estimado (est) com o tempo medido no cronômetro (spent) das tarefas concluídas.')};
I.bloco=()=>{const L=lgs(56,1).filter(x=>x.m>0),B=[['até 30 min',0,30],['30 a 59 min',30,60],['60 a 89 min',60,90],['90 min ou mais',90,9999]].map(([l,a,b])=>{const z=L.filter(x=>x.m>=a&&x.m<b);return{l,n:z.length,f:avg(z.map(x=>x.f))}}).filter(o=>o.n>=3);
 if(B.length<2)return null;const o=B.slice().sort((a,b)=>b.f-a.f),b=o[0],w=o[o.length-1],g=b.f-w.f;
 return mk('bloco','🧩','Seu bloco ideal: '+b.l,'Seu foco médio é maior em blocos de '+b.l+' ('+f1(b.f)+'★) e menor em '+w.l+' ('+f1(w.f)+'★).'+(g<.3?' A diferença é pequena, então o tamanho do bloco importa pouco para você.':'')+'\nBase: '+B.map(x=>x.l+': '+x.n).join(' · ')+'.',g>=.6?1:0,L.length,'Agrupei suas sessões com nota de foco (★) por duração e comparei a média de foco de cada grupo.')};
I.horario=()=>{const L=lgs(56,1).filter(x=>x.h!=null&&!isNaN(x.h)),P=PERIODS.map(([l,a,b])=>{const z=L.filter(x=>x.h>=a&&x.h<b);return{l,n:z.length,f:avg(z.map(x=>x.f)),m:z.reduce((s,x)=>s+x.m,0)}}).filter(o=>o.n>=3);
 if(P.length<2)return null;const o=P.slice().sort((a,b)=>b.f-a.f),b=o[0],w=o[o.length-1],g=b.f-w.f;
 return mk('horario','🕒','Você rende mais '+PP[b.l],'Foco médio de '+f1(b.f)+'★ '+PP[b.l]+' contra '+f1(w.f)+'★ '+PP[w.l]+'.'+(g>=.5?' Deixe as matérias difíceis para o seu horário forte ('+b.l+') e use o período fraco só para revisão leve.':' A diferença é pequena.')+'\nBase: '+P.map(x=>x.l+': '+x.n+' sessões').join(' · ')+'.',g>=.8?1:0,L.length,'Agrupei as sessões com horário de início e nota de foco por período do dia.')};
I.constancia=()=>{const t=now();let dd=0,gap=0,mg=0;const W=[0,0,0,0,0,0,0],WN=[0,0,0,0,0,0,0];
 for(let i=0;i<56;i++){const m=dayMin(i),w=(addD(t,-i).getDay()+6)%7;W[w]+=m;WN[w]++;if(i<28){if(m>0){dd++;gap=0}else{gap++;mg=Math.max(mg,gap)}}}
 if(rngMin(0,56)<60)return null;const av=W.map((v,i)=>v/Math.max(1,WN[i])),o=av.map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v),pc=Math.round(dd/28*100),weak=o[6],str=o[0];
 const ws=str.v>0&&weak.v<str.v*.35;
 return mk('constancia','📆','Constância: '+pc+'% dos dias','Você estudou em '+dd+' dos últimos 28 dias. Maior sequência sem estudar: '+mg+' dia'+(mg===1?'':'s')+'.\nDia mais forte: '+DW[str.i]+' ('+hh(str.v)+' de média). Mais fraco: '+DW[weak.i]+' ('+hh(weak.v)+').'+(ws?' Um bloco curto fixo de 25 min '+(weak.i<5?'na ':'no ')+DW[weak.i]+' já equilibra a semana.':''),pc<50?2:pc<70||mg>=4?1:0,dd,'Contei os dias com estudo nos últimos 28 dias e a média por dia da semana nas últimas 8 semanas.')};
I.tendencia=()=>{const ys=[];for(let i=6;i>=1;i--)ys.push(pk('week',-i).reduce((a,k)=>a+ALL().reduce((b,s)=>b+(s.days[k]||0),0),0));
 if(ys.filter(v=>v>0).length<3)return null;const sl=slope(ys),av=avg(ys),rel=sl/Math.max(30,av),cur=pk('week',0).filter(k=>k<=fmt(now())).reduce((a,k)=>a+ALL().reduce((b,s)=>b+(s.days[k]||0),0),0);
 let subj='';const ss=ACT().map(s=>{const z=[];for(let i=6;i>=1;i--)z.push(pk('week',-i).reduce((a,k)=>a+(s.days[k]||0),0));return{s,sl:slope(z),av:avg(z)}}).filter(o=>o.sl!=null&&o.av>=30);
 const dn=ss.filter(o=>o.sl/o.av<-.15).sort((a,b)=>a.sl/a.av-b.sl/b.av)[0],up=ss.filter(o=>o.sl/o.av>.15).sort((a,b)=>b.sl/b.av-a.sl/a.av)[0];
 if(dn)subj+='\nEm queda: '+dn.s.name+' ('+(Math.round(dn.sl)>0?'+':'')+Math.round(dn.sl)+' min por semana).';if(up)subj+='\nEm alta: '+up.s.name+' (+'+Math.round(up.sl)+' min por semana).';
 const lab=rel>.08?'subindo':rel<-.08?'caindo':'estável';
 return mk('tendencia','📈','Ritmo semanal '+lab,'Últimas 6 semanas: '+ys.map(v=>hh(v)).join(' → ')+' (esta semana até agora: '+hh(cur)+').\nMédia de '+hh(av)+' por semana, variando '+(Math.round(sl)>0?'+':'')+Math.round(sl)+' min por semana.'+subj,rel<-.15?2:rel<-.08?1:0,ys.filter(v=>v>0).length,'Ajustei uma reta (regressão linear) sobre o total de minutos das últimas 6 semanas completas.')};
I.esquecimento=()=>{const R=[];ACT().filter(s=>impOf(s)>0).forEach(s=>{const ks=Object.keys(s.days).filter(k=>s.days[k]>0&&k>=DK(60)).sort();if(ks.length<4)return;const g=[];for(let i=1;i<ks.length;i++)g.push(diff(ks[i-1],ks[i]));const m=med(g),cur=ago(s);if(cur==null||m==null)return;if(cur>=Math.max(3,m*2))R.push({s,cur,m,r:cur/Math.max(1,m)})});
 if(!R.length)return null;R.sort((a,b)=>b.r-a.r);
 return mk('esquecimento','🧠','Matérias esfriando','Você costuma voltar a cada matéria em intervalos típicos, mas estas passaram do seu padrão:\n'+R.slice(0,4).map(o=>'• '+o.s.name+': '+o.cur+' dias parada (seu normal: a cada ~'+Math.round(o.m)+')').join('\n')+'\nUm bloco curto de revisão evita perder o que já foi aprendido.',R[0].r>=3?2:1,R.length,'Comparei há quantos dias cada matéria está parada com a mediana do seu próprio intervalo entre estudos nos últimos 60 dias.')};
I.esgot=()=>{const l7=rngMin(0,7),pv=rngMin(7,28)/3;if(l7<=0||pv<=0)return null;const ratio=l7/pv,f1_=avg(lgs(7,1).map(x=>x.f)),f0=avg((S.log||[]).filter(x=>x.f>0&&x.d>=DK(28)&&x.d<DK(7)).map(x=>x.f));
 let rest=0;for(let i=0;i<14;i++)if(dayMin(i)===0)rest++;
 let sc=0;const why=[];if(ratio>1.3){sc++;why.push('carga '+Math.round((ratio-1)*100)+'% acima do seu normal')}
 if(f1_!=null&&f0!=null&&f0-f1_>=.5){sc++;why.push('foco caiu de '+f1(f0)+'★ para '+f1(f1_)+'★')}
 if(rest===0){sc++;why.push('nenhum dia de descanso nos últimos 14 dias')}
 const t=sc>=2?'Risco de esgotamento: atenção':sc===1?'Sinal de alerta leve':'Sem sinais de esgotamento';
 return mk('esgot','🔋',t,sc?'Sinais: '+why.join(', ')+'.\n'+(sc>=2?'Antes de forçar mais, reduza a carga por 2 a 3 dias, mantenha só o mínimo da streak e durma bem.':'Fique de olho: se o foco continuar caindo, vale um dia mais leve.'):'Carga dos últimos 7 dias: '+hh(l7)+' (seu normal: '+hh(pv)+' por semana)'+(f1_!=null?'. Foco recente: '+f1(f1_)+'★':'')+'. Siga assim.',sc>=2?3:sc,Math.max(lgs(7,1).length,1),'Comparei os últimos 7 dias com a média semanal das 3 semanas anteriores, o foco médio e a ausência de dias de descanso.')};
I.carga=()=>{const t0=fmt(now()),lim=fmt(addD(now(),6)),cap=rngMin(0,28)/4;if(cap<=0)return null;
 const L=allTasks().filter(o=>!o.x.done&&!o.s.arch&&o.x.date&&o.x.date<=lim),sem=L.filter(o=>!(o.x.est>0)).length,need=L.reduce((a,o)=>a+(o.x.est||30),0);if(!L.length)return mk('carga','⚖️','Carga da semana: leve','Nenhuma tarefa com data até os próximos 7 dias.',0,0,'Somei as tarefas pendentes até daqui a 6 dias.');
 const r=need/cap,by={};L.forEach(o=>{const k=o.x.date<t0?t0:o.x.date;by[k]=(by[k]||0)+(o.x.est||30)});const dc=cap/7,heavy=Object.entries(by).filter(([k,v])=>v>Math.max(120,dc*1.8)).sort((a,b)=>b[1]-a[1]).slice(0,3);
 return mk('carga','⚖️',r>1.25?'Carga da semana acima da sua capacidade':r>.9?'Carga da semana no limite':'Carga da semana viável','Tarefas até '+br(lim)+': '+hh(need)+' ('+L.length+' tarefa'+(L.length===1?'':'s')+', '+Math.round(r*100)+'% do que você costuma estudar por semana, '+hh(cap)+').'+(sem?'\n'+sem+' sem tempo estimado (contei 30 min cada).':'')+(heavy.length?'\nDias pesados: '+heavy.map(([k,v])=>br(k)+' ('+hh(v)+')').join(', ')+'.':'')+(r>1.25?'\nDá para: adiar as de menor prioridade ou espalhar nos dias mais leves.':''),r>1.5?3:r>1.25?2:r>.9?1:0,L.length,'Somei o tempo estimado das tarefas pendentes até 6 dias à frente (inclui atrasadas) e comparei com sua média semanal dos últimos 28 dias.')};
I.procr=()=>{const t0=fmt(now()),T=allTasks().filter(o=>!o.s.arch),od=T.filter(o=>!o.x.done&&o.x.date&&o.x.date<t0),dn=T.filter(o=>o.x.done&&o.x.date&&o.x.doneAt&&o.x.doneAt>=DK(30)),lt=dn.filter(o=>o.x.doneAt>o.x.date);
 if(!od.length&&dn.length<4)return null;const age=od.length?avg(od.map(o=>diff(o.x.date,t0))):0,sh=dn.length?lt.length/dn.length:0,by={};od.concat(lt).forEach(o=>by[o.s.name]=(by[o.s.name]||0)+1);const w=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
 const sev=od.length>=6||sh>.6?2:od.length>=3||sh>.4?1:0;
 return mk('procr','⏳',sev?'Tarefas escorregando':'Você cumpre seus prazos','Atrasadas agora: '+od.length+(od.length?' (idade média '+Math.round(age)+' dia'+(Math.round(age)===1?'':'s')+')':'')+'.\n'+(dn.length?'Das '+dn.length+' concluídas nos últimos 30 dias, '+Math.round(sh*100)+'% foram feitas depois da data.':'Poucas tarefas concluídas nos últimos 30 dias para medir.')+(w&&sev?'\nMatéria com mais atrasos: '+w[0]+'.':'')+(sev?'\nDica: planeje menos tarefas por dia e dê a cada uma o tempo real (veja a análise de estimativa).':''),sev,od.length+dn.length,'Contei tarefas pendentes com data vencida e, entre as concluídas nos últimos 30 dias, as feitas depois da data planejada.')};
I.provas=()=>{const t0=fmt(now()),k14=per('last',0,'',14).keys,L=allTasks().filter(o=>o.x.exam&&!o.x.done&&o.x.date&&o.x.date>=t0&&diff(t0,o.x.date)<=45).sort((a,b)=>a.x.date<b.x.date?-1:1);if(!L.length)return null;
 const rows=L.slice(0,4).map(o=>{const s=o.s,d=diff(t0,o.x.date),cov=s.cov!=null?s.cov/100:null,dom=s.dom!=null?s.dom/5:null,tp=(s.topics||[]).filter(x=>!x.exam),dr=tp.length?tp.filter(x=>x.done).length/tp.length:null,m14=sm(s,k14),rec=Math.min(1,m14/240);
  const sc=Math.round(100*((cov!=null?cov:.5)*.3+(dom!=null?dom:.5)*.2+(dr!=null?dr:(cov!=null?cov:.5))*.2+rec*.3)),miss=[cov==null?'conteúdo visto':null,dom==null?'domínio':null].filter(Boolean);
  return{o,d,sc,m14,miss}});
 const w=rows.slice().sort((a,b)=>a.sc-b.sc)[0],crit=rows.some(r=>r.sc<40&&r.d<=14);
 return mk('provas','🎯',crit?'Prova perto e preparo baixo':'Prontidão para as provas',rows.map(r=>'• '+r.o.s.name+' · '+br(r.o.x.date)+' (em '+r.d+'d): '+r.sc+'/100 '+(r.sc<40?'🔴':r.sc<65?'🟡':'🟢')+' · '+hh(r.m14)+' em 14 dias'+(r.miss.length?' · preencha '+r.miss.join(' e ')+' na matéria para melhorar a nota':'')).join('\n')+'\nA nota mistura conteúdo visto (30%), estudo recente (30%), domínio (20%) e tópicos concluídos (20%).',crit?3:w.sc<65?1:0,rows.length,'Nota de 0 a 100: conteúdo visto 30%, estudo dos últimos 14 dias 30% (meta de 4h), domínio 20%, tópicos concluídos 20%. Campos vazios valem 50%.')};
I.equilibrio=()=>{const A=ACT().filter(s=>impOf(s)>0),tot=A.reduce((a,s)=>a+sm(s,per('last',0,'',14).keys),0);if(A.length<2||tot<120)return null;const k14=per('last',0,'',14).keys,df=[0,.85,1,1.2],tg=A.map(s=>IMPW[impOf(s)]*df[diffOf(s)||2]),tt=tg.reduce((a,b)=>a+b,0),R=A.map((s,i)=>({s,sh:sm(s,k14)/tot,tg:tg[i]/tt}));
 const lo=R.filter(r=>r.sh<r.tg*.5).sort((a,b)=>a.sh/a.tg-b.sh/b.tg),hi=R.filter(r=>r.sh>r.tg*1.8&&r.sh>.25).sort((a,b)=>b.sh/b.tg-a.sh/a.tg);
 return mk('equilibrio','🎚️',lo.length||hi.length?'Estudos desequilibrados':'Estudos equilibrados',(lo.length?'Pouco tempo para o que importa: '+lo.slice(0,3).map(r=>r.s.name+' ('+Math.round(r.sh*100)+'% do seu tempo, ideal ~'+Math.round(r.tg*100)+'%)').join(', ')+'.':'')+(hi.length?(lo.length?'\n':'')+'Tempo demais: '+hi.slice(0,2).map(r=>r.s.name+' ('+Math.round(r.sh*100)+'%, ideal ~'+Math.round(r.tg*100)+'%)').join(', ')+'.':'')+(!lo.length&&!hi.length?'A divisão do seu tempo nas últimas 2 semanas acompanha a importância e a dificuldade das matérias.':''),lo.length?2:hi.length?1:0,A.length,'Comparei a fatia de tempo de cada matéria nos últimos 14 dias com a fatia ideal, proporcional à importância e à dificuldade.')};
I.revisoes=()=>{const L=revDue();if(!L.length)return null;const late=L.filter(r=>r.date<fmt(now())).length,n=L.length,w=n===1?'revisão':'revisões';
 return mk('revisoes','🔁',n+' '+w+' esperando','Você tem '+n+' '+w+' espaçada'+(n===1?'':'s')+' para hoje ('+late+' atrasada'+(late===1?'':'s')+'). Revisar no dia certo fixa o conteúdo com muito menos tempo.',late>=3?2:1,n,'Contei as revisões de 1, 7 e 30 dias que venceram.')};
I.focomat=()=>{const R=ACT().map(s=>{const z=lgs(28,1).filter(x=>x.sid===s.id);return{s,n:z.length,f:avg(z.map(x=>x.f))}}).filter(o=>o.n>=3);if(R.length<2)return null;R.sort((a,b)=>b.f-a.f);const b=R[0],w=R[R.length-1],g=b.f-w.f;
 return mk('focomat','🔍','Foco por matéria',b.s.name+' é onde você mais se concentra ('+f1(b.f)+'★) e '+w.s.name+' onde menos ('+f1(w.f)+'★).'+(g>=.6?' Em '+w.s.name+' vale blocos mais curtos, em horário de pico e sem celular.':''),g>=.9?1:0,R.reduce((a,o)=>a+o.n,0),'Média das notas de foco por matéria nos últimos 28 dias (mínimo de 3 registros).')};
const IORD=['esgot','provas','carga','procr','esquecimento','equilibrio','tendencia','constancia','estim','revisoes','horario','bloco','focomat'];
function INS(){const o=[];IORD.forEach(k=>{try{const r=I[k]();if(r)o.push(r)}catch(e){}});return o.sort((a,b)=>b.sev-a.sev||IORD.indexOf(a.id)-IORD.indexOf(b.id))}
const SEVI=['🟢','🔵','🟡','🔴'],fIns=(r,full)=>r.ic+' '+r.t+'\n'+r.d+'\nConfiança: '+cf(r.n)+' ('+r.n+' registro'+(r.n===1?'':'s')+')';
const baseTxt=()=>{const d=ALL().length?Array.from({length:56},(_,i)=>dayMin(i)>0).filter(Boolean).length:0;return d+' dia'+(d===1?'':'s')+' com estudo e '+lgs(56,1).length+(lgs(56,1).length===1?' sessão':' sessões')+' com foco nos últimos 56 dias'};
const NOD={estim:'Preciso de pelo menos 3 tarefas concluídas com tempo estimado e cronômetro usado para comparar estimativa e realidade.',bloco:'Preciso de sessões com nota de foco (★) em pelo menos 2 tamanhos de bloco (3 de cada).',horario:'Preciso de sessões com horário de início e nota de foco em pelo menos 2 períodos do dia.',constancia:'Preciso de pelo menos 1h de estudo registrado nas últimas 8 semanas.',tendencia:'Preciso de estudo em pelo menos 3 das últimas 6 semanas completas.',esquecimento:'Não vejo matéria fora do seu padrão agora. Bom sinal (ou ainda faltam registros em 60 dias).',esgot:'Preciso de estudo nos últimos 7 dias e nas 3 semanas anteriores para comparar.',carga:'Preciso de estudo nas últimas 4 semanas para saber sua capacidade.',procr:'Poucas tarefas para avaliar. Planeje no calendário e eu acompanho.',provas:'Não há provas nos próximos 45 dias. Cadastre uma tarefa como prova e eu avalio o preparo.',equilibrio:'Preciso de 2 matérias ativas com importância e pelo menos 2h de estudo nas últimas 2 semanas.',revisoes:'Nenhuma revisão esperando agora.',focomat:'Preciso de 3 sessões com foco em pelo menos 2 matérias nos últimos 28 dias.'};
const one=id=>{let r=null;try{r=I[id]()}catch(e){}return r?{t:fIns(r)+'\n\nPor quê: '+r.why,m:r.sev>=3?'push':r.sev===2?'care':r.sev===0?'joy':'power',c:{k:'ins',id}}:{t:NOD[id]||'Sem dados suficientes.',m:'care',c:{k:'ins',id}}};
function diag(deep){const L=INS();if(!L.length)return{t:'Ainda tenho pouco estudo registrado para uma análise séria. Registre sessões com horário e nota de foco (★) por uns dias e eu volto com um raio-X.',m:'care',c:{k:'diag'}};
 const top=L.slice(0,deep?L.length:5);return{t:'Raio-X dos seus dados\nBase: '+baseTxt()+'.\n\n'+top.map(r=>SEVI[r.sev]+' '+r.ic+' '+r.t+(deep?'\n'+r.d.split('\n').map(x=>'   '+x).join('\n')+'\n   Confiança: '+cf(r.n):'')).join(deep?'\n\n':'\n')+(deep?'':'\n\nDiga "mais" para ver os detalhes ou pergunte por um tema (ex.: "estou me esgotando?").'),m:L[0].sev>=3?'push':L[0].sev>=2?'care':'joy',c:{k:'diag'}}}
function revisao(){const p=per('week',-1,'na semana passada'),a=aResumo(p),L=INS(),ok=L.filter(r=>r.sev<=1&&['tendencia','constancia','horario','bloco','estim','focomat'].includes(r.id)).slice(0,2),aj=L.filter(r=>r.sev>=2).slice(0,3);
 return{t:'Revisão da semana\n'+a.t+'\n\n✅ O que funcionou:\n'+(ok.length?ok.map(r=>'• '+r.t+'. '+r.d.split('\n')[0]).join('\n'):'• Ainda não há um padrão claro. Registre foco (★) para eu enxergar.')+'\n\n🔧 O que ajustar:\n'+(aj.length?aj.map(r=>'• '+r.t+'. '+r.d.split('\n')[0]).join('\n'):'• Nada crítico agora.'),m:aj.length?'care':'joy',c:{k:'diag'}}}
const addQ=(l,f)=>{QH[nz(l).replace(/\s+/g,' ').trim()]=f};
[['Faça um diagnóstico geral',()=>diag()],['Estou me esgotando?',()=>one('esgot')],['Minha estimativa de tempo é boa?',()=>one('estim')],['Qual tamanho de bloco funciona melhor para mim?',()=>one('bloco')],['Em que período do dia eu rendo mais?',()=>one('horario')],['Como está minha constância?',()=>one('constancia')],['Meu ritmo está subindo ou caindo?',()=>one('tendencia')],['Estou esquecendo alguma matéria?',()=>one('esquecimento')],['Minha carga da semana é viável?',()=>one('carga')],['Estou pronto para as provas?',()=>one('provas')],['Estou procrastinando?',()=>one('procr')],['Meus estudos estão equilibrados?',()=>one('equilibrio')],['Em qual matéria eu me concentro mais?',()=>one('focomat')],['Faça a revisão da semana',()=>revisao()]].forEach(([l,f])=>addQ(l,f));
QG.splice(QG.length-1,0,['🔬 Análises profundas',['Faça um diagnóstico geral','Faça a revisão da semana','Estou me esgotando?','Minha carga da semana é viável?','Estou pronto para as provas?','Meus estudos estão equilibrados?','Estou esquecendo alguma matéria?','Meu ritmo está subindo ou caindo?','Como está minha constância?','Em que período do dia eu rendo mais?','Qual tamanho de bloco funciona melhor para mim?','Em qual matéria eu me concentro mais?','Minha estimativa de tempo é boa?','Estou procrastinando?']]);
const PAT=[[/faculdade|\bufes\b|formatura|\bformar\b|semestres?\b|pre ?requisit|gargalo|reprov|nota minima|quanto (eu )?(preciso|falta) (tirar|pra passar|para passar)|minhas (notas|faltas)/,()=>window.__fac?window.__fac.answer():null],[/diagnostic|raio ?x|me analis|analis[ae] (os |meus )?(meus )?dados|insights?\b|o que (voce )?(percebeu|notou|ve nos|acha dos) (meus )?(dados|estudos)|visao geral/,()=>diag()],
 [/revisao da semana|retrospectiva|como foi minha semana|balanco da semana/,()=>revisao()],
 [/burnout|me esgotando|risco de esgot|sobrecarregando|exagerando nos estudos/,()=>one('esgot')],
 [/estimativa|estimo|subestimo|superestimo|meu tempo previsto/,()=>one('estim')],
 [/tamanho (do |de )?bloco|bloco ideal|duracao ideal|quanto tempo (seguido|por bloco)/,()=>one('bloco')],
 [/periodo do dia|melhor horario|horario (que )?rendo|rendo mais (de|no|na)/,()=>one('horario')],
 [/constancia|consistencia|regularidade|dias que (eu )?(falto|nao estudo)/,()=>one('constancia')],
 [/(ritmo|desempenho|evolucao|tendencia) (esta )?(subindo|caindo|melhorando|piorando)|estou (melhorando|piorando|evoluindo)/,()=>one('tendencia')],
 [/esquec(endo|i) (de )?alguma|materia(s)? (esfriando|abandonada)|abandonei/,()=>one('esquecimento')],
 [/carga|da conta de tudo|cabe na semana|viavel|tarefas demais/,()=>one('carga')],
 [/(pront|preparad)[oa]s? (para|pra) (as |a )?provas?|(vou|chance) (ir bem|passar)|prontidao/,()=>one('provas')],
 [/(estou|to|ando) procrastinando\?|eu procrastino muito|quanto (eu )?procrastino/,()=>one('procr')],
 [/equilibr|distribuicao do (meu )?tempo|tempo por materia|balanceado/,()=>one('equilibrio')],
 [/(onde|qual materia).*(concentro|foco) (mais|melhor)|foco por materia/,()=>one('focomat')]];
function deepAsk(n){for(const [re,fn] of PAT)if(re.test(n)){try{return fn()}catch(e){return null}}return null}
/*LUMI-INSIGHTS-END*/
/*LUMI-ACT-START*/
/* ===== Fase 3: Lumi proativa (alertas, resumo ao abrir) e ações com confirmação ===== */
const td3=()=>fmt(now()),DAYN3=['dom','seg','ter','qua','qui','sex','sáb'],
 dlab3=k=>DAYN3[parse(k).getDay()]+' '+br(k),
 rel3=k=>{const d=diff(td3(),k);return d===0?'hoje':d===1?'amanhã':dlab3(k)},
 rk3=x=>x.prio==='alta'?0:x.prio==='baixa'?2:1,
 eo3=x=>x.est>0?x.est:(x.dur>0?x.dur:30),
 pend3=()=>allTasks().filter(o=>!o.x.done&&!o.s.arch),
 cap3=()=>Math.max(90,Math.round(rngMin(0,28)/28*1.2/15)*15),
 nx3=k=>fmt(addD(parse(k),1)),
 ps3=(n,a,b)=>n===1?a:b,
 al3=n=>n+' alteraç'+(n===1?'ão':'ões'),
 sj3=id=>id?((S.subjects||[]).find(s=>s.id===id)||null):null,
 dl3=s=>{const t0=td3(),E=(s.topics||[]).filter(x=>x.exam&&!x.done&&x.date&&x.date>=t0).map(x=>x.date).sort()[0];return E?(E>t0?fmt(addD(parse(E),-1)):t0):null},
 lastN3=n=>Array.from({length:n},(_,i)=>fmt(addD(now(),-i)));

function load3(skip){const L={};pend3().forEach(o=>{const x=o.x;if(x.exam||!x.date||(skip&&skip.has(x)))return;L[x.date]=(L[x.date]||0)+eo3(x)});return L}
function place3(items,cap,load){const t0=td3();items.forEach(it=>{const e=eo3(it.o?it.o.x:it.x),from=it.from&&it.from>t0?it.from:t0;let to=it.to||fmt(addD(parse(from),21));if(to<from)to=from;
  let best=null,bl=1e9,k=from,i=0;
  while(k<=to&&i<150){const l=load[k]||0;if(l===0||l+e<=cap){best=k;break}if(l<bl){bl=l;best=k}k=nx3(k);i++}
  it.at=best||from;load[it.at]=(load[it.at]||0)+e})}
function show3(p){const L=p.lines.slice(0,14);return 'Proposta: '+p.title+'\n'+L.join('\n')+(p.lines.length>14?'\n… e mais '+(p.lines.length-14):'')+'\n\nNada muda até você confirmar.'}
function offer3(p,m){const l=LM();p.t=Date.now();l.plan=p;save();return{t:show3(p),m:m||'power',b:[['✅ Confirmar','p:ok'],['✖ Agora não','p:no']],c:{k:'plan',why:p.why||''}}}
const newT3=(s,name,date,est,note)=>({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,date,prio:'alta',est,done:false,doneAt:'',note:note||'Criada pela Lumi',lumi:1});

function planAtr3(){const t0=td3(),L=pend3().filter(o=>!o.x.exam&&o.x.date&&o.x.date<t0).sort((a,b)=>rk3(a.x)-rk3(b.x)||(a.x.date<b.x.date?-1:1));
 if(!L.length)return{t:'Você não tem nenhuma tarefa atrasada. Tudo em dia. 🎉',m:'joy'};
 const cap=cap3(),load=load3(new Set(L.map(o=>o.x))),it=L.map(o=>({o,from:t0,to:dl3(o.s)||fmt(addD(now(),14))}));place3(it,cap,load);
 const ops=it.map(i=>({sid:i.o.s.id,tid:i.o.x.id,set:{date:i.at,time:null}})),lines=it.map(i=>'• '+i.o.x.name+' ('+i.o.s.name+'): '+br(i.o.x.date)+' → '+rel3(i.at));
 return offer3({kind:'atr',title:'reagendar '+L.length+' tarefa'+ps3(L.length,'','s')+' atrasada'+ps3(L.length,'','s'),ops,lines,why:'Ordenei por prioridade e data original e distribuí nos próximos dias sem passar de ~'+hh(cap)+' por dia (sua média real dos últimos 28 dias +20%). Se a matéria tem prova, as tarefas ficam antes dela.'},L.length>=6?'care':'power')}

function planProva3(sj){const t0=td3(),ex=allTasks().filter(o=>o.x.exam&&!o.x.done&&!o.s.arch&&o.x.date&&o.x.date>=t0&&(!sj||o.s===sj)).sort((a,b)=>a.x.date<b.x.date?-1:1);
 if(!ex.length)return{t:(sj?'Não achei prova futura de '+sj.name+'. ':'Não achei nenhuma prova futura cadastrada. ')+'Crie uma tarefa marcada como 📝 Prova, com a data, e eu monto o plano de preparo.',m:'care'};
 const e=ex[0],s=e.s,E=e.x.date,d=diff(t0,E);
 if(d<=0)return{t:'A prova de '+s.name+' é hoje. Já não dá para montar plano: faça uma revisão leve, descanse e chegue tranquilo.',m:'care'};
 const last=fmt(addD(parse(E),-1)),cap=cap3(),tp=(s.topics||[]).filter(x=>!x.done&&!x.exam),mv=tp.filter(x=>!x.date||x.date<t0||x.date>last),
  load=load3(new Set(mv)),m14=sm(s,lastN3(14)),it=[],ops=[],lines=[];
 mv.forEach(x=>it.push({o:{s,x},from:t0,to:last,mv:1}));
 const D=coData(),est=Math.max(30,Math.min(90,D.idl||45)),hasFin=tp.some(x=>/^revis[aã]o (final|geral)/i.test(x.name));
 if(!tp.length){const n=Math.min(6,Math.max(2,Math.floor(d/3)));for(let i=0;i<n;i++){const off=n>1?Math.round(i*(d-1)/(n-1)):0,k=fmt(addD(now(),off)),x=newT3(s,i===n-1?'Revisão final: '+s.name:'Revisão '+(i+1)+'/'+n+': '+s.name,'',est,'Criada pela Lumi para a prova de '+br(E));it.push({o:{s,x},from:k,to:i===n-1?last:(fmt(addD(parse(k),2))>last?last:fmt(addD(parse(k),2))),nw:1})}}
 else if(!hasFin&&d>=3){it.push({o:{s,x:newT3(s,'Revisão final: '+s.name,'',60,'Criada pela Lumi para a prova de '+br(E))},from:last,to:last,nw:1})}
 place3(it,cap,load);
 it.forEach(i=>{if(i.nw){i.o.x.date=i.at;ops.push({sid:s.id,n:i.o.x});lines.push('• (nova) '+i.o.x.name+': '+rel3(i.at))}else{ops.push({sid:s.id,tid:i.o.x.id,set:{date:i.at,time:null}});lines.push('• '+i.o.x.name+': '+(i.o.x.date?br(i.o.x.date)+' → ':'')+rel3(i.at))}});
 if(!ops.length)return{t:'Os tópicos de '+s.name+' já estão todos datados antes da prova ('+br(E)+') e já há uma revisão final. Seu plano está completo. Foque em executar.',m:'joy'};
 lines.unshift('Prova de '+s.name+' em '+d+' dia'+ps3(d,'','s')+' ('+br(E)+'). Estudo nos últimos 14 dias: '+hh(m14)+'.');
 return offer3({kind:'prv',title:'plano para a prova de '+s.name,ops,lines,why:'Espalhei os tópicos pendentes entre hoje e o dia anterior à prova, sem passar de ~'+hh(cap)+' por dia, e deixei uma revisão final na véspera.'},d<=7?'push':'power')}

function planDist3(sj){const t0=td3(),L=pend3().filter(o=>!o.x.exam&&!o.x.date&&(!sj||o.s===sj));
 if(!L.length)return{t:sj?'Não há tópicos sem data em '+sj.name+'.':'Todos os seus tópicos pendentes já têm data. Nada a distribuir.',m:'joy'};
 L.sort((a,b)=>{const da=dl3(a.s)||'9',db=dl3(b.s)||'9';return da<db?-1:da>db?1:rk3(a.x)-rk3(b.x)});
 const lim=L.slice(0,30),cap=cap3(),load=load3(null),it=lim.map(o=>({o,from:t0,to:dl3(o.s)||fmt(addD(now(),45))}));place3(it,cap,load);
 const ops=it.map(i=>({sid:i.o.s.id,tid:i.o.x.id,set:{date:i.at}})),lines=it.map(i=>'• '+i.o.x.name+' ('+i.o.s.name+'): '+rel3(i.at));
 if(L.length>lim.length)lines.push('(Distribuí os primeiros '+lim.length+' de '+L.length+'. Peça de novo para o restante.)');
 return offer3({kind:'dist',title:'dar data a '+lim.length+' tópico'+ps3(lim.length,'','s')+(sj?' de '+sj.name:''),ops,lines,why:'Matérias com prova mais próxima vêm primeiro, depois a prioridade. Respeitei ~'+hh(cap)+' por dia e a data das provas.'})}

function planBlk3(){const t0=td3(),days=[0,1,2].map(i=>fmt(addD(now(),i))),
 L=pend3().filter(o=>!o.x.exam&&o.x.date&&days.includes(o.x.date)&&!o.x.time).sort((a,b)=>a.x.date<b.x.date?-1:a.x.date>b.x.date?1:rk3(a.x)-rk3(b.x));
 if(!L.length)return{t:'Não há tarefas dos próximos 3 dias sem horário. Tudo já está encaixado, ou ainda não há tarefas planejadas.',m:'power'};
 const D=coData(),pref=D.hours.slice(0,3).map(o=>o.h),P=pref.length?pref:[9,15,20],busy={};
 allTasks().forEach(o=>{const x=o.x;if(x.done||o.s.arch||!x.date||!x.time||!days.includes(x.date))return;const q=String(x.time).split(':').map(Number),st=q[0]*60+(q[1]||0);(busy[x.date]=busy[x.date]||[]).push([st,st+(x.dur||x.est||60)])});
 const nw=new Date(),minToday=nw.getHours()*60+nw.getMinutes()+15,ops=[],lines=[],hm=m=>p2(Math.floor(m/60))+':'+p2(m%60);
 L.forEach(o=>{const x=o.x,dur=Math.max(15,Math.min(120,Math.round((x.dur||x.est||45)/15)*15)),B=busy[x.date]=busy[x.date]||[];let best=null,bd=1e9;
  for(let st=420;st+dur<=1380;st+=15){if(x.date===t0&&st<minToday)continue;if(B.some(r=>st<r[1]&&st+dur>r[0]))continue;const dist=Math.min(...P.map(h=>Math.abs(st-h*60)));if(dist<bd){bd=dist;best=st}}
  if(best==null){lines.push('• '+x.name+': sem janela livre em '+rel3(x.date)+' (não mexi)');return}
  B.push([best,best+dur]);ops.push({sid:o.s.id,tid:x.id,set:{time:hm(best),dur}});lines.push('• '+x.name+' ('+o.s.name+'): '+rel3(x.date)+' '+hm(best)+'–'+hm(best+dur))});
 if(!ops.length)return{t:'Tentei encaixar, mas não achei janelas livres entre 7h e 23h nos próximos 3 dias.\n'+lines.join('\n'),m:'care'};
 return offer3({kind:'blk',title:'bloquear horário para '+ops.length+' tarefa'+ps3(ops.length,'','s'),ops,lines,why:(pref.length?'Usei os horários em que seu foco é maior ('+pref.map(h=>h+'h').join(', ')+')':'Ainda não conheço seu melhor horário, então usei 9h, 15h e 20h')+', sem sobrepor outras tarefas com horário. Tarefas mais prioritárias ficam com os melhores horários.'})}

function planSem3(){const t0=td3(),cap=cap3(),load=load3(null),days=Array.from({length:7},(_,i)=>fmt(addD(now(),i))),P=pend3(),moved=new Set(),ops=[],lines=[];
 days.forEach(k=>{let g=0;while((load[k]||0)>cap&&g++<25){const C=P.filter(o=>!o.x.exam&&o.x.date===k&&!o.x.time&&!moved.has(o.x)).sort((a,b)=>rk3(b.x)-rk3(a.x)||eo3(b.x)-eo3(a.x));let ok=false;
   for(const o of C){const e=eo3(o.x),dl=dl3(o.s)||fmt(addD(now(),14));let tg=null;
    for(let j=diff(t0,k)+1;j<=14;j++){const d2=fmt(addD(now(),j));if(d2>dl)break;if((load[d2]||0)+e<=cap){tg=d2;break}}
    if(tg){load[k]-=e;load[tg]=(load[tg]||0)+e;moved.add(o.x);ops.push({sid:o.s.id,tid:o.x.id,set:{date:tg}});lines.push('• '+o.x.name+' ('+o.s.name+'): '+rel3(k)+' → '+rel3(tg));ok=true;break}}
   if(!ok)break}});
 if(!ops.length){const mx=Math.max(0,...days.map(k=>load[k]||0));return{t:mx>cap?'Alguns dias passam de ~'+hh(cap)+', mas as tarefas pesadas têm horário marcado, são provas ou não têm dia livre antes do prazo. Não dá para mover sem estragar algo. Veja o calendário.':'Sua semana cabe na sua capacidade (~'+hh(cap)+' por dia). Nada a mover.',m:mx>cap?'care':'joy'}}
 return offer3({kind:'sem',title:'aliviar a semana movendo '+ops.length+' tarefa'+ps3(ops.length,'','s'),ops,lines,why:'Tirei das dias acima de ~'+hh(cap)+' (sua média real +20%) as tarefas de menor prioridade e sem horário marcado, levando para o dia mais leve antes do prazo/prova. Provas e tarefas com horário não são movidas.'})}

function planRet3(sid){const s=sj3(sid);if(!s)return{t:'Não achei essa matéria.',m:'care'};const h=new Date().getHours(),from=fmt(addD(now(),h>=20?1:0)),cap=cap3(),load=load3(null),x=newT3(s,'Retomada: '+s.name,'',25,'Bloco curto criado pela Lumi para retomar a matéria'),it=[{o:{s,x},from,to:fmt(addD(parse(from),3))}];place3(it,cap,load);x.date=it[0].at;
 return offer3({kind:'ret',title:'bloco de retomada de '+s.name,ops:[{sid:s.id,n:x}],lines:['• (nova) '+x.name+': 25 min, '+rel3(x.date)],why:'Matéria parada há '+(ago(s)==null?'muito':ago(s))+' dia(s). Um bloco curto de revisão ativa interrompe o esquecimento sem custar muito.'})}

function apply3(p){const undo=[];let n=0,miss=0;
 p.ops.forEach(op=>{if(op.n){const s=sj3(op.sid);if(!s){miss++;return}(s.topics=s.topics||[]).push(Object.assign({},op.n));undo.push({del:[op.sid,op.n.id]});n++;return}
  const o=findTask(op.sid,op.tid);if(!o||o.x.done){miss++;return}const prev={};
  Object.keys(op.set).forEach(k=>{prev[k]=(k in o.x)?{v:o.x[k]}:null;if(op.set[k]===null)delete o.x[k];else o.x[k]=op.set[k]});undo.push({sid:op.sid,tid:op.tid,prev});n++});
 const l=LM();l.undo={t:Date.now(),label:p.title,list:undo};l.acts=l.acts||[];l.acts.push({t:Date.now(),k:p.kind,n});l.acts=l.acts.slice(-30);return{n,miss}}
function confirm3(){const l=LM(),p=l.plan;
 if(!p)return{t:'Não há nenhuma proposta esperando confirmação. Peça uma, por exemplo: "reagende minhas tarefas atrasadas".',m:'care'};
 l.plan=null;if(Date.now()-(p.t||0)>3*36e5){save();return{t:'Essa proposta ficou velha e seus dados podem ter mudado. Peça de novo que eu refaço na hora.',m:'care'}}
 const fb=l.fb=l.fb||{};(fb[p.kind]=fb[p.kind]||{ok:0,no:0}).ok++;
 const r=apply3(p);save();try{render()}catch(e){}try{toast('💡 Lumi: '+al3(r.n)+' ('+(r.n===1?'aplicada':'aplicadas')+').')}catch(e){}
 return{t:'Feito: '+p.title+' ('+al3(r.n)+')'+(r.miss?'. '+(r.miss===1?'1 item ficou de fora':r.miss+' itens ficaram de fora')+' porque já mudou ou foi concluído':'')+'.\nSe não gostou, é só desfazer.',m:'joy',b:[['↩ Desfazer','p:undo']]}}
function cancel3(){const l=LM(),p=l.plan;if(p){const fb=l.fb=l.fb||{};(fb[p.kind]=fb[p.kind]||{ok:0,no:0}).no++}l.plan=null;save();return{t:'Tudo bem, não mudei nada. Se quiser outra versão, é só pedir de novo.',m:'power'}}
function undo3(){const l=LM(),u=l.undo;if(!u||!u.list||!u.list.length)return{t:'Não tenho nenhuma ação recente para desfazer.',m:'care'};let n=0;
 u.list.slice().reverse().forEach(r=>{if(r.del){const s=sj3(r.del[0]);if(s){const i=(s.topics||[]).findIndex(x=>x.id===r.del[1]);if(i>=0){s.topics.splice(i,1);n++}}return}
  const o=findTask(r.sid,r.tid);if(!o)return;Object.keys(r.prev).forEach(k=>{if(r.prev[k]===null)delete o.x[k];else o.x[k]=r.prev[k].v});n++});
 l.undo=null;save();try{render()}catch(e){}return{t:'Desfeito: '+al3(n)+' de "'+u.label+'" '+(n===1?'voltou':'voltaram')+' ao que era.',m:'power'}}

/* ---- Alertas ---- */
function ALR(){const l=LM(),t0=td3(),h=new Date().getHours(),A=[],dis=l.dis||{},add=(id,sev,ic,t,d,act)=>{if(dis[id]===t0)return;A.push({id,sev,ic,t,d,act})},P=pend3();
 const od=P.filter(o=>!o.x.exam&&o.x.date&&o.x.date<t0);
 if(od.length){const old=Math.max(...od.map(o=>diff(o.x.date,t0)));add('atr',od.length>=6||old>=14?3:od.length>=3||old>=7?2:1,'⏳',od.length+' tarefa'+ps3(od.length,'','s')+' atrasada'+ps3(od.length,'','s'),'A mais antiga está '+old+' dia'+ps3(old,'','s')+' atrasada. Posso redistribuir nos próximos dias respeitando sua capacidade.',['Reagendar atrasadas','p:atr'])}
 const ex=allTasks().filter(o=>o.x.exam&&!o.x.done&&!o.s.arch&&o.x.date&&o.x.date>=t0).sort((a,b)=>a.x.date<b.x.date?-1:1),exS=new Set();
 ex.slice(0,3).forEach(o=>{const s=o.s,E=o.x.date,d=diff(t0,E);if(d>21)return;const last=fmt(addD(parse(E),-1)),m7=sm(s,lastN3(7)),m14=sm(s,lastN3(14)),tp=(s.topics||[]).filter(x=>!x.done&&!x.exam),un=tp.filter(x=>!x.date||x.date<t0||x.date>last).length;
  if(!(d<=3||un>0||(d<=14&&m7<150)))return;exS.add(s.id);
  const sev=d<=3?(m7<90?3:2):d<=7?(m7<120?3:un>0?2:1):(m14<180?2:1);
  add('prv'+s.id,sev,'🎯','Prova de '+s.name+' em '+d+' dia'+ps3(d,'','s'),'Estudo: '+hh(m7)+' nos últimos 7 dias, '+hh(m14)+' em 14.'+(un?' '+un+' tópico'+ps3(un,'','s')+' sem data antes da prova.':'')+' Posso montar o plano de preparo.',['Montar plano da prova','p:prv:'+s.id])});
 ACT().filter(s=>impOf(s)>0&&!exS.has(s.id)).map(s=>({s,a:ago(s)})).filter(o=>o.a!=null&&o.a>=10).sort((a,b)=>b.a-a.a).slice(0,2).forEach(o=>add('frio'+o.s.id,o.a>=21?2:1,'🧊',o.s.name+' está há '+o.a+' dias parada','Quanto maior a pausa, mais custa retomar. Posso criar um bloco curto de retomada.',['Bloco de retomada','p:ret:'+o.s.id]));
 try{const g=goalInfo();if(g.left>0&&h>=17){const st=gstreak();add('meta',h>=21?3:h>=19?2:1,'🎯','Faltam '+hh(g.left)+' para a meta de hoje',(st.c>0?'Sua sequência de '+st.c+' dia'+ps3(st.c,'','s')+' está em risco. ':'')+'Um bloco agora resolve.',['Montar plano de hoje','q:Monte meu plano de hoje'])}}catch(e){}
 try{const c=ctx();if(c.debt>0||c.bal<0)add('laz',c.step>=3?2:1,'😴','Lazer no vermelho','Saldo '+(c.bal<0?lzS(c.bal):lzN(c.bal))+(c.debt>0?' e dívida de '+hh(c.debt)+' de estudo':'')+'.',['Plano para recuperar','q:Plano para recuperar o lazer'])}catch(e){}
 try{const rv=revDue();if(rv.length){const late=rv.filter(r=>r.date<t0).length;add('rev',late>=3?2:1,'🔁',rv.length+' revisã'+ps3(rv.length,'o','ões')+' esperando',late+' atrasada'+ps3(late,'','s')+'. Revisar no dia certo fixa o conteúdo com pouco tempo. Marque como feitas no calendário.',null)}}catch(e){}
 try{const r=I.carga();if(r&&r.sev>=2)add('car',r.sev,'⚖️',r.t,r.d.split('\n')[0],['Equilibrar a semana','p:sem'])}catch(e){}
 try{const r=I.esgot();if(r&&r.sev>=2)add('esg',3,'🔋',r.t,r.d.split('\n')[0],['Ver detalhes','q:Estou me esgotando?'])}catch(e){}
 const sh=P.filter(o=>!o.x.exam&&o.x.date&&diff(t0,o.x.date)>=0&&diff(t0,o.x.date)<=1&&!o.x.time).length;
 if(sh>=2)add('blk',0,'🕒',sh+' tarefas de hoje/amanhã sem horário','Posso encaixar nos seus melhores horários, sem conflito.',['Bloquear horários','p:blk']);
 const ud=P.filter(o=>!o.x.exam&&!o.x.date).length;if(ud>=3)add('dist',0,'🗂️',ud+' tópicos sem data','Posso distribuir nos dias, priorizando matérias com prova.',['Distribuir nos dias','p:dist:']);
 try{const o=elxInfo3();if(!o.act&&o.b<=-120&&o.ok)add('elx',1,'🪞','Elixir do Reembolso vale a pena','Lazer em '+lzS(o.b)+(o.d>0?' e dívida de '+hh(o.d):'')+': com o Elixir você zera estudando cerca de '+hh(o.com)+', em vez de '+(o.sem!=null?hh(o.sem):'muito mais')+'.',['Ver a conta','q:Vale a pena comprar o Elixir do Reembolso?'])}catch(e){}
 try{(window.__fac?window.__fac.alerts():[]).forEach(x=>add(x.id,x.sev,x.ic,x.t,x.d,x.act))}catch(e){}
 return A.sort((a,b)=>b.sev-a.sev)}
function ALN(){return ALR().filter(a=>a.sev>=1).length}
function renderAl(){const e=$$('lm-al');if(!e)return;const A=ALR(),SV=['🟢','🔵','🟡','🔴'];
 e.innerHTML=A.length?A.map(a=>'<div class="lm-al s'+a.sev+'"><div><b>'+SV[a.sev]+' '+a.ic+' '+esc(a.t)+'</b><div class="lm-ad">'+esc(a.d)+'</div></div><div class="lm-aa">'+(a.act?'<button class="btn main" data-lm="'+esc(a.act[1])+'" type="button">'+esc(a.act[0])+'</button>':'')+'<button class="ghost" data-lm="p:dsm:'+esc(a.id)+'" type="button" aria-label="Dispensar por hoje" title="Dispensar por hoje">✕</button></div></div>').join(''):'<p class="sub" style="margin:0">Nenhum alerta agora. Tudo sob controle. 💡</p>'}
function badge3(){const e=$$('lm-bd');if(!e)return;let n=0;try{n=ALN()}catch(x){}e.textContent=n;e.hidden=!n}

/* ---- Resumo ao abrir ---- */
function briefObj3(){const t0=td3(),h=new Date().getHours(),c=ctx(),A=ALR(),P=pend3(),T=P.filter(o=>!o.x.exam&&o.x.date===t0),od=P.filter(o=>!o.x.exam&&o.x.date&&o.x.date<t0).length,L=[];
 L.push((h<5?'Já é madrugada.':h<12?'Bom dia!':h<18?'Boa tarde!':'Boa noite!')+' Resumo de hoje ('+dlab3(t0)+'):');
 try{const g=goalInfo();L.push('• Meta: '+(g.left>0?'faltam '+hh(g.left)+' (feito '+hh(g.dn)+' de '+hh(g.mn)+')':'batida ✓ ('+hh(g.dn)+' estudados)'))}catch(e){L.push('• Estudado hoje: '+hh(c.today))}
 L.push('• Tarefas de hoje: '+(T.length?T.length+' ('+hh(T.reduce((a,o)=>a+eo3(o.x),0))+')':'nenhuma')+(od?' · atrasadas: '+od:''));
 const ex=allTasks().filter(o=>o.x.exam&&!o.x.done&&!o.s.arch&&o.x.date&&o.x.date>=t0).sort((a,b)=>a.x.date<b.x.date?-1:1)[0];if(ex&&diff(t0,ex.x.date)<=30)L.push('• Próxima prova: '+ex.s.name+' em '+diff(t0,ex.x.date)+' dia'+ps3(diff(t0,ex.x.date),'','s'));
 try{const fb=window.__fac&&window.__fac.brief();if(fb)L.push(fb)}catch(e){}
 L.push('• Lazer: '+(c.bal<0?lzS(c.bal):lzN(c.bal))+(c.debt>0?' · dívida '+hh(c.debt):''));
 const top=A.filter(a=>a.sev>=1).slice(0,3),SV=['🟢','🔵','🟡','🔴'];
 if(top.length){L.push('','Atenção:');top.forEach(a=>L.push(SV[a.sev]+' '+a.ic+' '+a.t))}else L.push('','Nenhum alerta. É só seguir o plano. 💡');
 const b=top.filter(a=>a.act).slice(0,3).map(a=>a.act);if(top.length)b.push(['Dispensar por hoje','p:dsmall']);
 return{t:L.join('\n'),m:top[0]&&top[0].sev>=3?'push':top.length?'care':'joy',b:b.length?b:null,c:{k:'alr',why:'Montei o resumo lendo suas tarefas, provas, estudo e lazer de agora. Cada alerta vem de uma regra com os seus números, e você pode dispensar por hoje.'}}}
function brief3(force){const l=LM(),t0=td3(),st=l.bf||{};if(!force&&st.d===t0&&Date.now()-(st.t||0)<6*36e5)return false;
 const o=briefObj3();l.h.push({r:'b',t:o.t});l.h=l.h.slice(-40);l.b=o.b||[];l.bf={d:t0,t:Date.now()};save();render_();face(o.m);return true}

/* ---- Ações (botões) e pedidos em texto ---- */
function act3(a){const l=LM();if(a.indexOf('q:')===0){send(a.slice(2));return}
 const m=a.match(/^p:([a-z]+):?(.*)$/)||[],k=m[1],arg=m[2]||'';let o=null;
 if(k==='ok')o=confirm3();else if(k==='no')o=cancel3();else if(k==='undo')o=undo3();
 else if(k==='dsm'){l.dis=l.dis||{};l.dis[arg]=td3();save();renderAl();badge3();return}
 else if(k==='dsmall'){l.dis=l.dis||{};ALR().forEach(x=>{l.dis[x.id]=td3()});save();renderAl();badge3();o={t:'Ok, silenciei os alertas por hoje. Amanhã eu volto a avisar.',m:'power'}}
 else if(k==='atr')o=planAtr3();else if(k==='prv')o=planProva3(sj3(arg));else if(k==='dist')o=planDist3(sj3(arg));else if(k==='blk')o=planBlk3();else if(k==='sem')o=planSem3();else if(k==='ret')o=planRet3(arg);
 if(!o)return;say(o);try{const g=$$('lm-log');if(g&&g.scrollIntoView)g.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}}
function gate3(n){const l=LM(),m=n.replace(/[.!?,;]+$/,'').trim();if(!l.plan)return null;
 if(/^(sim|confirmo|confirmar|confirma|pode|pode ser|pode fazer|ok|beleza|bora|manda ver|faz isso|faca isso|aceito|isso mesmo|fechado)$/.test(m))return confirm3();
 if(/^(nao|cancela|cancelar|deixa|deixa pra la|agora nao|melhor nao)$/.test(m))return cancel3();
 l.plan=null;save();return null}
function ask3(n){const m=n.replace(/[.!?,;]+$/,'').trim();
 if(/^(desfaz|desfazer|desfaca|volta atras|voltar atras)/.test(m)||/desfaz.{0,12}(ultim|acao)/.test(m))return undo3();
 if(/(reagend|remarc|reorganiz|reprogram|arrum|organiz|redistribu|replaneja|empurr|resolv).{0,30}atrasad|atrasad.{0,30}(reagend|remarc|reorganiz|arrum|organiz|redistribu)/.test(m))return planAtr3();
 if(/(plano|prepar|monte|montar|cronograma|organiz).{0,25}(prova|exame)|(prova|exame).{0,20}(plano|cronograma|preparar)/.test(m))return planProva3(findSubj(m));
 if(/(distribu|espalh).{0,25}(topico|tarefa|conteudo)|(topicos|tarefas) sem data|dar data (aos|as|para)/.test(m))return planDist3(findSubj(m));
 if(/(bloque|reserv|marc|agend|encaix|coloc|ponh).{0,25}(horario|bloco|calendario|agenda)|horarios? de estudo no|blocos? no calendario/.test(m))return planBlk3();
 if(/(equilibr|alivi|desafog|redistribu|reorganiz|organiz|ajust|balanc).{0,25}semana|semana.{0,20}(pesada|cheia|apertada|sobrecarregada)/.test(m))return planSem3();
 if(/\balertas?\b|\bavisos?\b|resumo do dia|briefing|me atualiza|o que (eu )?(tenho|preciso) (pra|para) hoje|panorama|o que (esta|ta) pegando/.test(m))return briefObj3();
 return null}
{const Q3=[['Quais são meus alertas?',()=>briefObj3()],['Reagende minhas tarefas atrasadas',()=>planAtr3()],['Monte o plano para minha próxima prova',()=>planProva3(null)],['Distribua meus tópicos sem data',()=>planDist3(null)],['Bloqueie horários de estudo no calendário',()=>planBlk3()],['Equilibre minha semana',()=>planSem3()],['Desfazer a última ação',()=>undo3()]];
 Q3.forEach(([lb,f])=>addQ(lb,f));QG.splice(QG.length-1,0,['⚡ Alertas e ações (eu proponho, você confirma)',Q3.map(x=>x[0])])}
/*LUMI-ELX*/
/* Loja x Lumi (V74) */
function elxInfo3(){const b=lzBal(),d=lzDebt(),it=SHOP.find(x=>x.id==='elx'),I=shInfo(it),z=lzCfg(),act=shCfg().elx>Date.now();
 const sem=(()=>{try{const r=z.rate*chMul()*.5/60;return z.rate>0?Math.ceil(d+(b<0?-b/(z.rate/60*chMul()*(lzStep()>=2?.5:1)):0)):null}catch(e){return null}})(),com=Math.max(d,Math.ceil(Math.max(0,-b)));return{b,d,I,act,sem,com,ok:elBal()>=I.price&&I.left>0}}
function elxAsk3(){const o=elxInfo3();if(o.act)return{t:'O Elixir já está ativo até '+idHM(shCfg().elx)+'. Cada minuto estudado abate dívida e lazer negativo 1:1. Aproveite para estudar o máximo agora.',m:'power'};
 if(o.b>=0&&o.d<=0)return{t:'Você não tem lazer negativo nem dívida, então o Elixir não teria o que abater. Guarde seus Elos para outra coisa.',m:'joy'};
 const eco=o.sem!=null?Math.max(0,o.sem-o.com):null;
 return{t:'Hoje: lazer '+(o.b<0?lzS(o.b):lzN(o.b))+(o.d>0?' e dívida de '+hh(o.d):'')+'.\nSem o Elixir: cerca de '+(o.sem!=null?hh(o.sem):'?')+' de estudo para zerar. Com o Elixir: cerca de '+hh(o.com)+' (dentro das 5h de duração).'+(eco>0?'\nEconomia estimada: '+hh(eco)+' de estudo.':'')+'\nPreço: '+o.I.price+' Elos; você tem '+elBal()+(o.ok?'. Dá para comprar.':'. Ainda não dá.')+(o.com>300?'\nAtenção: o Elixir dura 5h, então use quando tiver tempo de estudar bastante.':''),m:o.ok?'power':'care',c:{k:'elx',why:'Comparei o estudo necessário pela taxa normal de lazer com o estudo 1:1 do Elixir, usando seu saldo e sua dívida de agora.'}}}
addQ('Vale a pena comprar o Elixir do Reembolso?',elxAsk3);{const g=QG.find(x=>x[0].indexOf('⚡')===0);if(g)g[1].push('Vale a pena comprar o Elixir do Reembolso?')}
window.addEventListener('hashchange',()=>setTimeout(()=>{try{if(location.hash==='#lumi')brief3(false)}catch(e){}badge3()},60));
{const init3=()=>{badge3();setInterval(badge3,6e4);document.addEventListener('click',()=>{clearTimeout(init3.t);init3.t=setTimeout(badge3,500)},true);
  setTimeout(()=>{try{const A=ALR().filter(a=>a.sev>=3),l=LM();if(A.length&&l.ts!==td3()){l.ts=td3();save();toast('💡 Lumi: '+A[0].t)}if(location.hash==='#lumi')brief3(false)}catch(e){}},1200)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init3);else setTimeout(init3,0)}
/*LUMI-ACT-END*/

 function parseMin(n){let m=null,x;
  if(/meia hora/.test(n))m=30;else if(x=n.match(/(\d+)\s*(?:h|hora|horas)(?![a-z])(?:\s*e?\s*(\d+))?/))m=+x[1]*60+(+x[2]||0);
  else if(x=n.match(/(duas|dois|tres|uma|um)\s+horas?/))m={uma:60,um:60,dois:120,duas:120,tres:180}[x[1]];
  else if(x=n.match(/(\d+)\s*(?:min|mins|minuto|minutos|m)\b/))m=+x[1];
  return m?Math.max(5,Math.min(240,Math.round(m/5)*5)):null}
 const LONG=/mais longo|tempo maior|tempo mais longo|mais tempo|bastante tempo|muito tempo|descanso (maior|longo)|pausa (longa|grande)|intervalo (longo|grande)|um tempo maior|descansar mais|preciso de um tempo|quero um tempo/;
 function ctx(){const t=fmt(now()),d=LM(),z=lzCfg();return{d,t,today:sd(t),week:wk(),bal:lzBal(),debt:lzDebt(),step:lzStep(),ca:ca(),fails:(S.lost&&S.lost.fails)||0}}
 function drawFace(m,sfx,sz){sfx=sfx||'';sz=sz||72;const k='#2b1a0a',st=`fill="none" stroke="${k}" stroke-width="3.5" stroke-linecap="round"`,dots=(rr)=>`<circle cx="38" cy="46" r="${rr}" fill="${k}"/><circle cx="62" cy="46" r="${rr}" fill="${k}"/>`;
  const E={power:dots(5),care:dots(5.5)+'<circle cx="40" cy="44" r="1.8" fill="#fff"/><circle cx="64" cy="44" r="1.8" fill="#fff"/>',push:dots(4.5),sus:dots(3.5),sleep:`<path d="M32 46 Q38 52 44 46 M56 46 Q62 52 68 46" ${st}/>`,joy:`<path d="M32 49 Q38 40 44 49 M56 49 Q62 40 68 49" ${st}/>`};
  const B={power:'M30 36 L45 40 M70 36 L55 40',care:'M31 39 L45 35 M69 39 L55 35',push:'M29 32 L46 41 M71 32 L54 41',sus:'M30 37 L45 37 M56 30 L70 36'};
  const M={power:`<path d="M38 63 Q50 74 62 63" ${st}/>`,care:`<path d="M40 64 Q50 71 60 64" ${st}/>`,push:`<path d="M40 68 Q52 66 62 62" ${st}/>`,sus:`<path d="M41 67 L59 67" ${st}/>`,sleep:`<ellipse cx="50" cy="67" rx="4" ry="3" fill="${k}"/>`,joy:`<path d="M34 60 Q50 82 66 60 Z" fill="#7a2a14" stroke="${k}" stroke-width="3" stroke-linejoin="round"/>`};
  m=E[m]?m:'power';const col=m==='sleep'?'#c9a86a':m==='push'?'#ff8a3d':'#ffb347';
  return `<svg viewBox="0 0 100 100" width="${sz}" height="${sz}" role="img" aria-label="Rosto da Lumi"><defs><radialGradient id="lmg${sfx}"><stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient><radialGradient id="lmb${sfx}" cx=".4" cy=".35"><stop offset="0" stop-color="#ffe29a"/><stop offset="1" stop-color="${col}"/></radialGradient></defs><circle cx="50" cy="48" r="48" fill="url(#lmg${sfx})"/><rect x="38" y="82" width="24" height="10" rx="3" fill="#8b8b8b"/><rect x="41" y="90" width="18" height="5" rx="2" fill="#5a5a5a"/><circle cx="50" cy="50" r="36" fill="url(#lmb${sfx})" stroke="#2b1a0a" stroke-width="3"/>${(m==='care'||m==='joy')?'<circle cx="30" cy="58" r="5" fill="#ff7a7a" opacity=".45"/><circle cx="70" cy="58" r="5" fill="#ff7a7a" opacity=".45"/>':''}${E[m]}${B[m]?`<path d="${B[m]}" ${st}/>`:''}${M[m]}${m==='sleep'?'<text x="72" y="26" font-size="16" font-weight="700" fill="#888">z</text><text x="80" y="14" font-size="11" font-weight="700" fill="#888">z</text>':''}</svg>`}
 function face(m){const e=$$('lm-face'),f=FACE[m]||FACE.power;if(!e)return;e.innerHTML=drawFace(m);e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');$$('lm-sub').textContent=f[1];LM().m=m}
 function status(){const c=ctx(),e=$$('lm-st');if(e)e.textContent='Hoje: '+hh(c.today)+' · Semana: '+hh(c.week)+' · Lazer: '+(c.bal<0?lzS(c.bal):lzN(c.bal))+(c.debt>0?' · Dívida: '+hh(c.debt):'')}
 function offer(M){M=M||10;const c=ctx(),d=c.d;M=Math.max(5,Math.min(240,Math.round(M/5)*5));
  if(d.task)return{t:'Você já tem uma tarefa em andamento. Terminou? Clique em "Cumpri a tarefa".',m:'push',b:[['Cumpri a tarefa','done']]};
  if(d.bonus>=1)return{t:'O bônus de hoje já foi usado. Lazer a gente conquista, um por dia. Amanhã tem mais, se merecer.',m:'sus'};
  if(c.debt>0)return{t:'Você está devendo '+hh(c.debt)+' de estudo. Pague a dívida primeiro, depois conversamos sobre lazer.',m:'sus'};
  if(c.step>=3)return{t:'Seu saldo de lazer está muito negativo ('+(c.bal<0?lzS(c.bal):lzN(c.bal))+'). Antes de ganhar mais, recupere o que já está no vermelho.',m:'sus'};
  const Mt=Math.min(M,60),need=Math.max(25,Math.round(Mt*2.5/5)*5),cap=c.today>=30?Math.min(60,10*Math.floor(c.today/30)):0,L=Math.min(Mt,cap);
  d.pt=Mt;d.pn=need;d.pl=L;const big=M>60?' O máximo que libero de uma vez é 1h.':'';
  if(cap<10)return{t:'Você pediu '+hh(M)+' de descanso, mas hoje estudou só '+hh(c.today)+'. Lazer a gente conquista. Proposta: pausa de 5 min agora, depois '+hh(need)+' de estudo, e eu libero +'+hh(Mt)+'.'+big,m:'sus',b:[['Aceito a tarefa (+'+hh(Mt)+')','task'],['Agora não','no']]};
  return{t:'Você pediu '+hh(M)+' de descanso. Com '+hh(c.today)+' estudados hoje, posso emprestar '+hh(L)+(L<Mt?' (é o que o seu estudo sustenta agora)':'')+': você usa já e fica devendo '+hh(L)+' de estudo, pagos no próximo estudo. Ou faça a tarefa: pausa de 5 min + '+hh(need)+' de estudo e eu libero +'+hh(Mt)+'.'+big,m:'power',b:[['Empréstimo (+'+hh(L)+', devo '+hh(L)+')','loan'],['Prefiro a tarefa (+'+hh(Mt)+')','task'],['Agora não','no']]}}
  function reply(raw){const o=reply0(raw);LM().ctx=o&&o.c?o.c:null;return o}
 function reply0(raw){{const g3=gate3(nz(raw));if(g3)return g3}const qq=qa(raw);if(qq)return qq;{const a3=ask3(nz(raw));if(a3)return a3}const n=nz(raw),c=ctx(),h=new Date().getHours();let forced=null;
  const tz=teachLookup(raw);if(tz){if(tz.q){const hq=QH[tz.q];if(hq){try{return hq()}catch(e){}}}else forced=tz.i}
  if(!forced){const fu=follow(n);if(fu)return fu;const an=analyze(n);if(an)return an}
  let best=forced||null,bs=0;if(!best){const SC=scoreIntents(n);PR.forEach(k=>{if(SC[k]>bs){bs=SC[k];best=k}})}
  const M=parseMin(n),LG=LONG.test(n);if((M||LG)&&(!best||['cansado','pausa','desanimado','lazer','ansioso'].includes(best))&&!(M&&M<=5&&best==='pausa'))best='lazer';
  let o={t:'',m:'power',b:null};
  if(!best){const u=LM().unk,rw=raw.slice(0,200);if(!u.includes(rw))u.push(rw);if(u.length>50)u.shift();o={t:pick(['Não peguei essa. Me diz em uma palavra: cansado, sem ânimo, sem foco, procrastinando ou ansioso?','Anotei isso para aprender. Enquanto isso, me conta: o que está pegando mais, energia, ânimo ou foco?'])+'\nSe quiser, me ensine em "Frases que a Lumi não entendeu" (lá embaixo).',m:'care'}}
  else if(best==='lazer'){o=offer(M||(LG?30:10))}
  else if(best==='status'){o={t:'Hoje: '+hh(c.today)+'. Semana: '+hh(c.week)+'. Lazer: '+(c.bal<0?lzS(c.bal):lzN(c.bal))+(c.debt>0?'. Dívida de estudo: '+hh(c.debt):'. Sem dívidas')+(c.ca?'. Concentração média: '+c.ca.toFixed(1).replace('.',',')+'/5':'')+(c.fails?'. Falhas no Terminal: '+c.fails:'')+'.\n'+(c.today<30?'Ainda dá tempo de fazer o dia valer. Bora?':'Bom ritmo. Mantém.'),m:c.today<30?'push':'joy'}}
  else if(best==='divida'){o={t:c.debt>0?'Você deve '+hh(c.debt)+' de estudo. Cada minuto estudado paga a dívida primeiro, e só depois vira lazer.':'Sem dívidas abertas. Mantém assim.',m:c.debt>0?'push':'joy'}}
  else if(best==='cumpri'){o=done()}
  else{const mm={ansioso:'care',cansado:'care',desanimado:'care',foco:'push',procrastina:'push',pausa:'care',feliz:'joy',obrigado:'power',oi:'power'};o={t:pick(RS[best]),m:mm[best]};
   if(best==='cansado'||best==='desanimado'||best==='ansioso'){const f=offer();if(f.b){o.t+='\n\n'+f.t;o.b=f.b}else if(c.d.bonus>=1||c.debt>0){}}
   if(best==='oi'&&c.debt>0)o.t+='\nAh, e lembrando: você deve '+hh(c.debt)+' de estudo.';if(best==='oi'&&c.fails)o.t+=' O Terminal falhou '+c.fails+'x, hein.'}
  if(h<5&&best!=='lazer'){o.t+='\n\nJá é madrugada. Estudo cansado rende pouco. Dormir também é treino.';o.m='sleep'}
  return o}
 function done(){const c=ctx(),d=c.d;if(!d.task)return{t:'Você não tem nenhuma tarefa em andamento. Quer propor uma? Peça um descanso.',m:'power'};
  const el=(Date.now()-d.task.t)/6e4,ms=c.today-d.task.base,need=d.task.need||25,m=d.task.m||10;
  if(el<5)return{t:'Calma. Passaram só '+Math.floor(el)+' min. A pausa tem que durar 5 minutos de verdade.',m:'sus',b:[['Cumpri a tarefa','done']]};
  if(ms<need)return{t:'Faltam '+hh(need-ms)+' de estudo. Liga o cronômetro e volta aqui.',m:'push',b:[['Cumpri a tarefa','done']]};
  lzCfg().led.push({id:lzId(),t:Date.now(),type:'lumi',min:m,note:'💡 Bônus da Lumi: tarefa cumprida'});d.bonus=1;d.task=null;save();render();return{t:'Cumpriu! +'+hh(m)+' de lazer liberados. É isso que eu chamo de merecer.',m:'joy'}}
  function act(a){if(/^[pq]:/.test(a))return act3(a);const c=ctx(),d=c.d;let o;
  if(a==='loan'){if(d.bonus>=1||c.debt>0){o=offer()}else{const L=d.pl||10;lzCfg().led.push({id:lzId(),t:Date.now(),type:'loan',min:L,owe:L});d.bonus=1;save();render();o={t:'Feito: +'+hh(L)+' de lazer. Você deve '+hh(L)+' de estudo, que o seu próximo estudo paga primeiro. Combinado é combinado.',m:'power'}}}
  else if(a==='task'){const need=d.pn||25;d.task={t:Date.now(),base:c.today,m:d.pt||10,need};save();o={t:'Combinado. Passo 1: 5 minutos de pausa agora, água, alongar, sem celular. Passo 2: estudar '+hh(need)+'. Quando terminar, volte e clique em "Cumpri a tarefa" para liberar +'+hh(d.pt||10)+'.',m:'push',b:[['Cumpri a tarefa','done']]}}
  else if(a==='done')o=done();
  else o={t:'Tudo bem. Se mudar de ideia, estou aqui. Agora, qual é a próxima tarefa do dia?',m:'power'};
  say(o)}
 function say(o){const l=LM();l.h.push({r:'b',t:o.t});l.h=l.h.slice(-40);l.b=o.b||[];save();render_();face(o.m)}
 function send(t){t=(t||'').trim();if(!t)return;const l=LM();l.h.push({r:'u',t});l.h=l.h.slice(-40);l.b=[];save();render_();
  setTimeout(()=>say(reply(t)),400)}
 function render_(){const l=LM(),g=$$('lm-log');{const ic=(id,z)=>{const e=$$(id);if(e)e.innerHTML=drawFace('power','-'+id,z)};ic('lm-ico',22);ic('lm-ico2',30)}if(!g)return;
  {const pn=$$('lm-ins');if(pn){let L=[];try{L=INS()}catch(e){}pn.innerHTML=L.length?L.slice(0,4).map(r=>'<div style="margin:6px 0;padding:8px 10px;border-radius:10px;border:1px solid var(--line,#444)"><b>'+['🟢','🔵','🟡','🔴'][r.sev]+' '+r.ic+' '+esc(r.t)+'</b><div style="font-size:.85rem;opacity:.85;white-space:pre-wrap">'+esc(r.d.split('\n')[0])+'</div><small style="opacity:.7">confiança '+cf(r.n)+'</small></div>').join('')+'<button class="btn" data-lq="Faça um diagnóstico geral" type="button">Diagnóstico completo</button>':'<p class="sub" style="margin:0">Registre alguns dias de estudo, com horário e nota de foco (★), e eu monto seu raio-X.</p>'}}
  if(!l.h.length){const h=new Date().getHours(),sd_=h<5?'Já é madrugada, hein?':h<12?'Bom dia!':h<18?'Boa tarde!':'Boa noite!';const c=ctx();l.h.push({r:'b',t:sd_+' Eu sou a Lumi, sua treinadora. Me conta como você está e eu te ajudo a render, sem enrolação.'+(c.debt>0?'\nVocê está devendo '+hh(c.debt)+' de estudo.':'')})}
  g.innerHTML=l.h.map(x=>`<div class="lm-m ${x.r}">${esc(x.t)}</div>`).join('');g.scrollTop=g.scrollHeight;
  $$('lm-ch').innerHTML=(l.b&&l.b.length?l.b.map(x=>`<button class="btn main" data-lm="${x[1]}" type="button">${esc(x[0])}</button>`):chips().map(x=>`<button class="btn" data-lq="${esc(x)}" type="button">${esc(x)}</button>`)).join('');
  const mb=$$('lm-moreb');if(mb&&!mb.dataset.f){mb.dataset.f=1;mb.innerHTML=QG.map(([t,a])=>`<p style="margin:8px 0 4px;font-weight:700">${t}</p><div class="lm-ch" style="margin:0">${a.map(x=>`<button class="btn" data-lq="${esc(x)}" type="button">${esc(x)}</button>`).join('')}</div>`).join('')}
  l.teach=l.teach||{};{const op=teachOpts(),tg=Object.entries(l.teach);$$('lm-u').innerHTML=(l.unk.length?l.unk.map((x,i)=>'<div style="margin:8px 0"><div>“'+esc(x)+'”</div><select data-lts="'+i+'" aria-label="O que isso significa">'+op+'</select> <button class="btn" data-lt="'+i+'" type="button">Ensinar</button> <button class="ghost" data-ltd="'+i+'" type="button" aria-label="Descartar">✕</button></div>').join(''):'Nenhuma ainda.')+(tg.length?'<p style="margin:12px 0 4px;font-weight:700">Já ensinadas ('+tg.length+')</p>'+tg.map(([k,v])=>'<div>“'+esc(k)+'” → '+esc(teachLabel(v))+' <button class="ghost" data-ltx="'+esc(k)+'" type="button" aria-label="Esquecer">✕</button></div>').join(''):'')}try{renderAl()}catch(e){}status();$$('lm-face').innerHTML=drawFace(l.m||'power')}
 document.addEventListener('click',e=>{const t=e.target.closest('#pg-lumi [data-lm],#pg-lumi [data-lq],#lm-s');if(!t)return;
  if(t.id==='lm-s'){const i=$$('lm-i');const v=i.value;i.value='';send(v)}else if(t.dataset.lq)send(t.dataset.lq);else act(t.dataset.lm)});
 document.addEventListener('click',e=>{const t=e.target.closest('#lm-u [data-lt],#lm-u [data-ltd],#lm-u [data-ltx]');if(!t)return;const l=LM();l.teach=l.teach||{};
  if(t.dataset.ltx!==undefined){delete l.teach[t.dataset.ltx];save();render_();return}
  const i=+(t.dataset.lt!==undefined?t.dataset.lt:t.dataset.ltd),tx=l.unk[i];if(tx===undefined)return;
  if(t.dataset.ltd!==undefined){l.unk.splice(i,1);save();render_();return}
  const v=($$('lm-u').querySelector('[data-lts="'+i+'"]')||{}).value;if(!v)return;
  const ks=Object.keys(l.teach);if(ks.length>=150)delete l.teach[ks[0]];l.teach[tkey(tx)]=v;l.unk.splice(i,1);l.h.push({r:'u',t:tx});save();say(reply(tx))});
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='lm-i'){const i=e.target,v=i.value;i.value='';send(v)}});
 window.addEventListener('hashchange',()=>{render_()});
 const init=()=>render_();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();
