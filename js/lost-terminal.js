/* ===== Terminal Lost (V76): digitou o código = +3 Elos; não digitou = −30 min de lazer (fixo, desde 27/10/2026; antes era crescente 1h, 2h, 3h...) + zera só o XP do nível atual (você continua no nível).
   Cobra SEMPRE, acima de qualquer proteção (refeição, rotina etc.). ===== */
(()=>{const CY=108*60000,ELO=0,PUN=0,CUT=new Date(2026,9,27).getTime(),$$=x=>document.getElementById(x);
 const L=()=>{S.lost=S.lost&&typeof S.lost==='object'?S.lost:{};return S.lost};
 const GR=32000;const TR=t=>{const d=new Date(t),m0=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),wd=d.getDay();let T=m0,len=(wd===0?720:480)*60000;if((wd===3||wd===0)&&d.getHours()>=18){T=m0+18*36e5;len=240*60000}return{T,len}};
 const startEnd=l=>{const x=TR(Date.now()),e=x.T+x.len;l.sched=x.T;return Date.now()<e?e:Date.now()+CY};
 let ac=null,lastB=-1,failUntil=0,typing=false,cdOk=false,cdBusy=false,buf='',grShown=false;const U={},AC_={};
 const aud=k=>{if(!U[k])return null;if(!AC_[k]||AC_[k].s!==U[k]){if(AC_[k])AC_[k].pause();const a=new Audio(U[k]);a.s=U[k];if(k==='amb')a.loop=true;AC_[k]=a}return AC_[k]};
 const stopCd=()=>{const a=AC_.cd;if(a)a.pause();cdOk=false};
 const DB=()=>new Promise((o,e)=>{const q=indexedDB.open('ls-snd',1);q.onupgradeneeded=()=>q.result.createObjectStore('s');q.onsuccess=()=>o(q.result);q.onerror=e});
 const dbR=(k,fn)=>DB().then(d=>{const t=d.transaction('s','readwrite'),st=t.objectStore('s');fn(st,k)}).catch(()=>{});
 function snd(k,fb){if(L().mute)return true;if(U[k]){try{const a=new Audio(U[k]);a.play().catch(()=>fb&&fb())}catch(e){fb&&fb()}return true}fb&&fb();return false}
 function A(){try{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){}return ac}
 function bp(f,d,v,t){if(L().mute)return;const c=A();if(!c)return;const o=c.createOscillator(),g=c.createGain(),n=c.currentTime;o.type=t||'square';o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(v||.12,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.start(n);o.stop(n+d)}
 const mk=(id,n)=>{const e=$$(id);e.innerHTML='';for(let i=0;i<n;i++){const d=document.createElement('div');d.className='ls-d';d.textContent='0';e.appendChild(d)}};
 const setD=(id,str)=>{[...$$(id).children].forEach((d,i)=>{if(d.textContent!==str[i]){d.textContent=str[i];d.classList.remove('flp');void d.offsetWidth;d.classList.add('flp')}})};
 function scr(lines,fail,keep){const e=$$('ls-scr');e.className='ls-scr'+(fail?' fail':'');e.innerHTML=lines.map(x=>'&gt;: '+x).join('<br>')+(lines.length?'<br>':'')+'&gt;: <span id="ls-buf">'+(keep?buf:'')+'</span><span class="ls-cur"></span>'}
 function idle(){const l=L();scr(l.on?[]:['TERMINAL DESATIVADO','ATIVE PARA INICIAR O CICLO DE 108 MIN'],0,l.on)}
 function fail(late,F,q){const l=L(),T0=F||Date.now();l.fails=(l.fails||0)+1;l.streak=0;l.end=T0+CY;
  l.pn=(l.pn||0)+1;const pen=PUN;l.lastPen=pen;
  lzCfg().led.push({id:lzId(),t:T0,type:'pun',min:-pen,owe:0,note:'☢️ Terminal Lost: código não digitado (punição '+l.pn+': −30min)'});
  let lost=0;try{lost=lvInfo(xpRun().xp).r;if(lost>0)chCfg().adj.push({d:fmt(now()),v:-lost})}catch(e){}
  (l.hist=l.hist||[]).push({t:T0,r:'f',pn:l.pn,lz:pen,xp:lost,late:!!late,tst:!!l.tst});l.tst=false;if(l.hist.length>600)l.hist.splice(0,l.hist.length-600);
  save();try{if(typeof renderLvl==='function')renderLvl();if(typeof renderLazer==='function'&&curPage==='lazer')renderLazer()}catch(e){}
  const msg='−30 min de lazer'+(lost>0?' e XP do nível zerado (−'+lost+' XP; você continua no nível)':'');
  if(q)return;if(!late)toast('☢️ System Failure! '+msg+'. Cada falha: −30 min.');else toast('☢️ Terminal falhou enquanto você estava fora ('+msg+').')}
 const nextB=S0=>{const d=new Date(S0),m0=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),wd=d.getDay();return (wd===3||wd===0)&&S0===m0?m0+18*36e5:new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime()};
 /* Rotina com término ativa = Terminal parado. Guardamos as janelas das rotinas (l.pz) para o relógio ficar congelado
    também quando o app está fechado, e para continuar de onde parou quando a rotina termina. */
 function snap(){let d;try{d=idCfg()}catch(e){return}const l=L(),nw=Date.now(),rt=d.rt&&d.rt.e?d.rt:null;l.pz=Array.isArray(l.pz)?l.pz:[];
  const lp=l.pz[l.pz.length-1];let ch=false;
  if(lp&&lp.e>nw&&(!rt||rt.s!==lp.s)){lp.e=nw;ch=true}
  if(rt&&(!lp||lp.s!==rt.s)){l.pz.push({s:rt.s,e:rt.e,n:rt.n});ch=true}else if(rt&&lp&&lp.s===rt.s&&lp.e!==rt.e){lp.e=rt.e;ch=true}
  const lim=nw-8*864e5;if(l.pz.some(p=>p.e<lim)){l.pz=l.pz.filter(p=>p.e>=lim);ch=true}
  if(ch)save()}
 const pzAt=()=>{const l=L(),nw=Date.now();return l.on&&(l.pz||[]).find(p=>p.s<=nw&&nw<p.e)||null};
 const pzNow=()=>!!pzAt();
 const pzMsg=()=>{const p=pzAt();return p?'⏸ Terminal parado: '+(p.n||'rotina')+' em andamento até '+new Date(p.e).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'. O relógio volta a contar de onde parou quando ela terminar. ':''};
 /* Continua o relógio de onde ele zerou, mesmo com o app fechado. Cada ciclo vencido é uma falha (punição crescente),
    exceto se caiu num período em que a cobrança de ociosidade não contava (rotina, ausente, descanso, refeição, estudo). */
 function sim(){const l=L();if(!(l.on&&l.end&&l.sched))return;const nw=Date.now();snap();
  let c=Math.min(l.ts||nw,nw),S=l.sched,E=l.end;
  const PZ=(l.pz||[]).map(p=>[p.s,Math.min(p.e,nw)]).filter(p=>p[1]>c&&p[1]>p[0]).sort((a,b)=>a[0]-b[0]);
  if(!PZ.length&&!(E+GR<=nw||nextB(S)<=nw)){l.ts=nw;return}
  let idOn=false,lg=[],prep=false;const prepare=()=>{if(prep)return;prep=true;try{if(typeof idTick==='function')idTick(true)}catch(e){}try{const d=idCfg();idOn=!!d.on;lg=d.log||[]}catch(e){}};
  let n=0,fl=0,ex=0,lost=0,chg=false;
  while(c<nw&&n++<800){const B=nextB(S),F=E+GR,pz=PZ.find(p=>p[0]<=c&&c<p[1]);
   if(pz){const to=pz[1];if(B>c&&B<=to){const x=TR(B);S=x.T;E=x.T+x.len+(to-B);chg=true}else E+=to-c;c=to;continue}
   const np=PZ.find(p=>p[0]>c),tp=np?np[0]:Infinity;
   if(F<B&&F<=nw&&F<=tp){const late=nw-F>6000;
    if(late){prepare();if(idOn&&!lg.some(x=>F>=x.a&&F<=x.b)){ex++;(l.hist=l.hist||[]).push({t:F,r:'x'})}else{fail(true,F,true);fl++;lost+=l.lastPen||0}}
    else fail(false,F,false);
    E=F+CY;chg=true;c=Math.max(c,F);continue}
   if(B<=nw&&B<=tp){const x=TR(B);S=x.T;E=x.T+x.len;chg=true;c=Math.max(c,B);continue}
   if(tp<=nw){c=Math.max(c,tp);continue}
   c=nw;break}
  l.sched=S;l.end=E;l.ts=nw;
  if(chg){buf='';grShown=false;if(l.hist&&l.hist.length>600)l.hist.splice(0,l.hist.length-600);save();
   if(fl||ex)setTimeout(()=>toast('☢️ Terminal: enquanto você estava fora, '+(fl?fl+' ciclo'+(fl>1?'s':'')+' falhou'+(fl>1?'ram':'')+' (−'+lost+' min de lazer no total e XP do nível zerado)':'nenhum ciclo falhou')+(ex?'; '+ex+' isento'+(ex>1?'s':'')+' (a ociosidade não contava nesse período)':'')+'.'),50)}}
 /* Correção retroativa: estorna falhas do Terminal que caíram dentro do período corrigido (lazer e, quando registrado, XP). */
 window.__lsRefund=(a,b)=>{const l=L(),z=lzCfg();l.rf=Array.isArray(l.rf)?l.rf:[];let n=0,lz=0,xp=0;
  z.led.filter(x=>x.type==='pun'&&/Terminal Lost/.test(x.note||'')&&x.min<0&&x.t>=a&&x.t<=b&&!l.rf.includes(x.id)).forEach(x=>{
   const pen=-x.min;l.rf.push(x.id);z.led.push({id:lzId(),t:Date.now(),type:'idle',min:pen,note:'↩ Estorno do Terminal Lost (Correção retroativa)'});
   lz+=pen;n++;l.fails=Math.max(0,(l.fails||0)-1);l.pn=Math.max(0,(l.pn||0)-1);
   const h=(l.hist||[]).find(y=>y.r==='f'&&!y.rf&&Math.abs(y.t-x.t)<8000);
   if(h){h.rf=1;if(h.xp>0){chCfg().adj.push({d:fmt(now()),v:h.xp});xp+=h.xp}}});
  if(n)save();return{n,lz,xp}};

 /* Reajuste (27/10/2026): falhas do Terminal registradas de hoje em diante que cobraram mais de 30 min são corrigidas para −30 min (uma única vez). */
 function migr(){try{const z=lzCfg(),l=L();l.rf=Array.isArray(l.rf)?l.rf:[];let n=0,back=0;
  z.led.forEach(x=>{if(x.type==='pun'&&/Terminal Lost/.test(x.note||'')&&x.t>=CUT&&x.min<-PUN&&!x.adj&&!l.rf.includes(x.id)){
   const old=-x.min,ot=old%60===0?(old/60)+'h':old+'min';x.adj=old;x.min=-PUN;
   x.note=(x.note||'').replace(/\(punição (\d+):[^)]*\)/,'(punição $1: −30min; ajustada, era −'+ot+')');
   const h=(l.hist||[]).find(y=>y.r==='f'&&Math.abs(y.t-x.t)<8000&&y.lz===old);if(h)h.lz=PUN;
   n++;back+=old-PUN}});

  /* XP (27/10/2026): a falha zera só o XP do nível atual, sem derrubar o nível. Refaz as falhas de hoje que tinham zerado tudo. */
  let Rr=0,xr=0,nf=0;(l.hist||[]).filter(h=>h.r==='f'&&h.t>=CUT&&h.xp>0&&!h.xa&&!h.rf).sort((a,b)=>a.t-b.t).forEach(h=>{
   const nl=lvInfo(h.xp+Rr).r,add=h.xp-nl;h.xo=h.xp;h.xp=nl;h.xa=1;Rr+=add;nf++;if(add>0){chCfg().adj.push({d:fmt(now()),v:add});xr+=add}});
  if(xr>0||nf){save();try{if(typeof renderLvl==='function')renderLvl()}catch(e){}
   setTimeout(()=>{try{toast('☢️ Terminal: XP reajustado. Você voltou a ganhar '+xr+' XP e mantém o nível; só o XP do nível atual foi zerado.')}catch(e){}},1600)}
  if(n){save();try{if(typeof renderLazer==='function'&&curPage==='lazer')renderLazer()}catch(e){}
   setTimeout(()=>{try{toast('☢️ Terminal: '+n+' punição(ões) de hoje reajustada(s) para −30 min. Devolvido: '+back+' min de lazer.')}catch(e){}},800)}}catch(e){}}
 function tick(){const l=L(),ck=$$('ls-clock');if(!ck)return;let r=CY;
  if(l.on&&l.end){const x=TR(Date.now());if(!l.sched){l.ts=Date.now();l.sched=x.T;if(Date.now()<x.T+x.len){l.end=x.T+x.len;buf='';grShown=false}save()}else sim()}
  if(l.on&&l.end){r=l.end-Date.now()}
  const sec=Math.max(0,Math.ceil(r/1000)),mm=String(Math.floor(sec/60)).padStart(3,'0'),ss=String(sec%60).padStart(2,'0');
  setD('ls-m',mm);setD('ls-s',ss);
  const gr=!!(l.on&&l.end&&r<=0&&!pzNow()),f=gr,w=l.on&&sec<=900&&sec>240,c=l.on&&sec<=240;
  ck.className='ls-clock'+(f?' fail':c?' crit':w?' warn':'');
  if(gr&&!typing&&!grShown){grShown=true;scr(['SYSTEM FAILURE','SYSTEM FAILURE','SYSTEM FAILURE'],1,1);if(!(AC_.cd&&!AC_.cd.paused))snd('alarm',()=>[0,.35,.7,1.05,1.4,1.75].forEach(t=>setTimeout(()=>bp(t%.7?200:140,.3,.2,'sawtooth'),t*1000)))}
  if(!gr)grShown=false;
  const am=aud('amb'),cd=aud('cd'),want=l.on&&!l.mute&&!pzNow();
  if(am){if(want&&curPage==='lost'&&sec>250&&!f){if(am.paused)am.play().catch(()=>{})}else if(!am.paused)am.pause()}
  if(cd){if(!want){stopCd()}else if(sec>240){cdOk=false}else if(sec>0&&!cdOk&&!cdBusy){cdBusy=true;try{cd.currentTime=Math.max(0,240-sec)}catch(e){}cd.play().then(()=>{cdOk=true;cdBusy=false}).catch(()=>{cdBusy=false})}}
  if(!f&&!typing&&$$('ls-scr').className.indexOf('fail')>-1)idle();
  $$('ls-st').innerHTML='CÓDIGOS<b>'+(l.codes||0)+'</b>STREAK<b>'+(l.streak||0)+'</b>RECORDE<b>'+(l.best||0)+'</b>';
  $$('ls-on').textContent=l.on?'DESATIVAR':'ATIVAR';$$('ls-mu').textContent=l.mute?'🔇':'🔊';$$('ls-ex').disabled=!l.on;
  $$('ls-info').textContent=pzMsg()+(l.on?'O código só vale nos últimos 4 min: digite 4 8 15 16 23 42 + Enter (ou EXECUTE). Após zerar ainda há 32 s. Código = +'+ELO+' Elos. Falhas: '+(l.fails||0)+' · cada falha = −30 min de lazer (valor fixo) + zera o XP do nível atual (você NÃO perde o nível). Com uma rotina com término ativa, o Terminal fica parado e volta de onde parou quando ela acaba. Fora isso, com o app aberto ele pune sempre. Ciclos que venceram com o app fechado contam desde que zeraram, e só são isentos se caíram num período em que a ociosidade não contava (rotina, ausente, descanso, refeição) ou se você corrigir esse período em Correção retroativa. Ciclos especiais: 00h = 480 min (domingo 720) · quarta e domingo às 18h = 240 min.':'Ative para iniciar. A contagem final começa aos 4 min.')}
 function init(){;if(!$$('ls-m'))return;mk('ls-m',3);mk('ls-s',2);idle();
  $$('ls-on').onclick=()=>{const l=L();A();stopCd();l.on=!l.on;l.tst=false;l.ts=Date.now();l.end=l.on?startEnd(l):null;save();idle();tick()};
  $$('ls-mu').onclick=()=>{const l=L();l.mute=!l.mute;if(l.mute)stopCd();save();A();bp(660,.1);tick()};
  const CODE='4815162342',deny=()=>{typing=true;buf='';bp(150,.3,.15,'sawtooth');scr(['FORA DA JANELA','AGUARDE OS 4 MIN FINAIS'],1);setTimeout(()=>{typing=false;grShown=false;idle();tick()},1500)},
  run=()=>{const l=L();if(!l.on||typing)return;if(l.end-Date.now()>240000){deny();return}A();stopCd();typing=true;const t='4 8 15 16 23 42';let i=0;failUntil=0;buf='';l.end=Date.now()+CY;l.codes=(l.codes||0)+1;elosAdd(ELO);(l.hist=l.hist||[]).push({t:Date.now(),r:'o',tst:!!l.tst});l.tst=false;if(l.hist.length>600)l.hist.splice(0,l.hist.length-600);l.streak=(l.streak||0)+1;l.best=Math.max(l.best||0,l.streak);save();
   const st=setInterval(()=>{i++;bp(500+i*20,.05,.08);scr(['EXECUTANDO',t.slice(0,i)]);if(i>=t.length){clearInterval(st);snd('exec',()=>bp(1000,.25,.15));scr(['CÓDIGO ACEITO','+'+ELO+' ELOS','CICLO REINICIADO: 108:00']);toast('☢️ Código aceito: +'+ELO+' Elos.');setTimeout(()=>{typing=false;idle();tick()},1600)}},70)};
  const sub=()=>{const l=L();if(!l.on||typing)return;if(l.end-Date.now()>240000&&buf.trim()){deny();return}if(buf.replace(/\s/g,'')===CODE)run();else if(buf.trim()){typing=true;buf='';bp(150,.3,.15,'sawtooth');scr(['CÓDIGO INVÁLIDO'],1);setTimeout(()=>{typing=false;grShown=false;idle();tick()},1200)}};
  const setBuf=v=>{buf=v.replace(/[^0-9 ]/g,'').replace(/ {2,}/g,' ').slice(0,20);const e=$$('ls-buf');if(e)e.textContent=buf;const i=$$('ls-in');if(i&&i.value!==buf)i.value=buf};
  $$('ls-ex').onclick=e=>{e.currentTarget.blur();run()};
  const inp=$$('ls-in');
  inp.oninput=()=>{if(L().on&&!typing)bp(700,.03,.05);setBuf(inp.value)};
  inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();sub()}};
  $$('ls-scr').onclick=()=>inp.focus();
  document.addEventListener('keydown',e=>{if(curPage!=='lost'||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target,tn=tg.tagName;if(tg===inp||tn==='TEXTAREA'||tn==='SELECT'||(tn==='INPUT'&&tg!==inp))return;
   if(!L().on||typing)return;
   if(/^[0-9]$/.test(e.key)||e.key===' '){e.preventDefault();bp(700,.03,.05);setBuf(buf+e.key)}
   else if(e.key==='Backspace'){e.preventDefault();setBuf(buf.slice(0,-1))}
   else if(e.key==='Enter'){e.preventDefault();sub()}});
  document.addEventListener('keyup',e=>{if(curPage==='lost'&&e.key===' '&&e.target.tagName==='BUTTON')e.preventDefault()});
  Object.assign(U,window.__LSDEF||{});
  DB().then(d=>{const st=d.transaction('s').objectStore('s');['amb','cd','alarm','exec'].forEach(k=>{st.get(k).onsuccess=e=>{if(e.target.result)U[k]=URL.createObjectURL(e.target.result)}})}).catch(()=>{});
  document.querySelectorAll('[data-ls]').forEach(i=>i.onchange=()=>{const f=i.files[0],k=i.dataset.ls;if(!f)return;dbR(k,st=>st.put(f,k));U[k]=URL.createObjectURL(f);if(k==='alarm'||k==='exec')snd(k);toast('Som salvo.')});
  const test=ms=>{const l=L();A();stopCd();l.on=true;l.tst=true;l.ts=Date.now();l.end=Date.now()+ms;l.sched=TR(Date.now()).T;buf='';grShown=false;save();idle();tick();toast(ms>=300000?'Teste: relógio em 5:00. A contagem final toca aos 4:00.':'Teste: relógio em 1:00. A contagem final toca já.')};
  $$('ls-ts').onclick=()=>test(300000);$$('ls-t1').onclick=()=>test(60000);
  $$('ls-rs').onclick=()=>{['amb','cd','alarm','exec'].forEach(k=>{delete U[k];dbR(k,st=>st.delete(k))});Object.assign(U,window.__LSDEF||{});stopCd();toast('Sons padrão restaurados.')};
  tick();setInterval(tick,1000)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();

