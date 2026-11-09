/* ===== Visão semanal ===== */
const HH=52,SNAP=15,TMIN=0,TMAX=1440;
const hmin=t=>{const [a,b]=(t||'0:0').split(':').map(Number);return a*60+b};
const mhm=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const durOf=x=>Math.max(SNAP,+x.dur||+x.est||60);
const allTasks=()=>{const r=[];S.subjects.forEach(s=>(s.topics||[]).forEach(x=>r.push({s,x})));return r};
const findTask=(sid,tid)=>{const s=S.subjects.find(a=>a.id===sid),x=s&&(s.topics||[]).find(y=>y.id===tid);return x?{s,x}:null};
function viewSeg(){return `<div class='seg' role='group' aria-label='Tipo de visão'><button class='${calV==='month'?'on':''}' data-a='cview' data-v='month'>Mensal</button><button class='${calV==='week'?'on':''}' data-a='cview' data-v='week'>Semanal</button></div>`}
function layoutDay(L){
 const ev=L.map(o=>({o,a:hmin(o.x.time),b:Math.min(1440,hmin(o.x.time)+durOf(o.x))})).sort((p,q)=>p.a-q.a||q.b-p.b);
 let cl=[],ce=0;const out=[];
 const flush=()=>{cl.forEach(e=>e.n=cl.reduce((m,z)=>Math.max(m,z.c+1),1));out.push(...cl);cl=[]};
 ev.forEach(e=>{if(cl.length&&e.a>=ce)flush();
  const used=cl.filter(z=>z.b>e.a).map(z=>z.c);let c=0;while(used.includes(c))c++;e.c=c;cl.push(e);ce=Math.max(ce,e.b)});
 flush();return out}
function renderWeek(){
 const el=$('#cal');if(!el)return;
 const t=fmt(now());if(!calSel)calSel=t;
 if(!calW)calW=fmt(monday(parse(calSel)));
 const mon=parse(calW),days=Array.from({length:7},(_,i)=>fmt(addD(mon,i)));
 const old=el.querySelector('.wk-sc');if(old)wkScroll=old.scrollTop;
 const by={};allTasks().forEach(o=>{if(o.x.date)(by[o.x.date]=by[o.x.date]||[]).push(o)});
 const W=wkInfo=wkStudy(days);
 const a=addD(mon,0),b=addD(mon,6);
 const title=a.getMonth()===b.getMonth()?`${a.getDate()} – ${b.getDate()} de ${MESES[b.getMonth()]} de ${b.getFullYear()}`:`${a.getDate()} de ${MESES[a.getMonth()].slice(0,3)} – ${b.getDate()} de ${MESES[b.getMonth()].slice(0,3)} de ${b.getFullYear()}`;
 const head=days.map((k,i)=>`<div class='wk-hd${k===t?' today':''}${k===calSel?' sel':''}' data-a='wsel' data-k='${k}'>${DIAS[i]}<br><b>${+k.slice(8)}</b></div>`).join('');
 const adr=days.map(k=>{const L=(by[k]||[]).filter(o=>!o.x.time);
  const tk=L.map(({s,x})=>`<span class='wk-chip${x.done?' dn':''}' data-sid='${s.id}' data-tid='${x.id}' style='--c:${s.color}' title='${esc(s.name)}: ${xn(x)}'>${x.done?'✓ ':''}${xn(x)}</span>`).join('');
  const sd=(W.un[k]||[]).map(u=>`<span class='wk-sd' data-a='wss' data-sid='${u.s.id}' data-k='${k}' data-i='u' style='--c:${u.s.color}' title='${esc(u.s.name)}: ${u.m?hh(u.m)+' estudadas (sem hora)':'estudo registrado (sem hora)'}'>⏱ ${u.m?hh(u.m)+' · ':''}${esc(u.s.name)}</span>`).join('');
  return `<div class='wk-ad' data-day='${k}'>${tk}${sd}</div>`}).join('');
 const axis=Array.from({length:24},(_,h)=>h?`<span style='top:${h*HH}px'>${p2(h)}:00</span>`:'').join('');
 const cols=days.map(k=>{const L=(by[k]||[]).filter(o=>o.x.time),SL=W.ss[k]||[],pw=100;
  const evs=layoutDay(L).map(({o,a,b,c,n})=>{const {s,x}=o,top=a/60*HH,hgt=Math.max((b-a)/60*HH,16),w=100/n*pw/100;
   return `<div class='wk-ev${x.done?' dn':''}' data-sid='${s.id}' data-tid='${x.id}' style='--c:${s.color};top:${top}px;height:${hgt-1}px;left:calc(${c*w}% + 1px);width:calc(${w}% - 3px)' title='${esc(s.name)}: ${xn(x)}${x.done?' (concluída)':''}'><button class='wk-chk' data-a='ctog' data-id='${s.id}' data-tid='${x.id}' aria-label='${x.done?'Reabrir tarefa':'Concluir tarefa'}'>${x.done?'✓':''}</button><div class='wk-t'>${xn(x)}</div>${hgt>=34?`<small>${mhm(a)}–${mhm(Math.min(b,1440))} · ${esc(s.name)}</small>`:''}<div class='wk-rs' aria-hidden='true'></div></div>`}).join('');
  const ssh=SL.map((z,i)=>{const top=z.a/60*HH,hgt=Math.max((z.b-z.a)/60*HH,16);
   return `<div class='wk-ss' data-a='wss' data-sid='${z.s.id}' data-k='${k}' data-i='${i}' style='--c:${z.s.color};top:${top}px;height:${hgt-1}px;left:1px;right:1px' title='⏱ ${esc(z.s.name)} · ${mhm(z.a)}–${mhm(Math.min(z.b,1440))}'><b>${esc(z.s.name)}</b>${hgt>=34?`<small>${mhm(z.a)}–${mhm(Math.min(z.b,1440))}</small>`:''}</div>`}).join('');
  const nowLine=k===t?`<div class='wk-now' id='wkNow'></div>`:'';
  return `<div class='wk-col${k===t?' today':''}' data-a='wslot' data-day='${k}' style='--hh:${HH}px;height:${24*HH}px'>${evs}${ssh}${nowLine}</div>`}).join('');
 const un=allTasks().filter(o=>!o.x.done&&!o.x.date);
 const tray=un.length?`<div class='wk-tray'><h4>📥 Tarefas sem data · arraste para a agenda</h4><div class='wk-tl'>${un.map(({s,x})=>`<span class='wk-tc' data-sid='${s.id}' data-tid='${x.id}' style='--c:${s.color}' title='${esc(s.name)}'>${xn(x)}</span>`).join('')}</div></div>`:'';
 el.innerHTML=`<div class='ch'><h2 style='text-transform:none'>${title}</h2><div class='vt'>${viewSeg()}<span style='display:flex;gap:6px'><button class='btn' data-a='wnav' data-v='-1' aria-label='Semana anterior'>‹</button><button class='btn' data-a='wnav' data-v='0'>Hoje</button><button class='btn' data-a='wnav' data-v='1' aria-label='Próxima semana'>›</button></span></div></div>
 <div class='wk-box'><div class='wk-x'><div class='wk-in'>
  <div class='wk-head'><div></div>${head}</div>
  <div class='wk-adr'><div class='wk-adl'>sem hora</div>${adr}</div>
  <div class='wk-sc' id='wkSc'><div class='wk-body'><div class='wk-ax' style='height:${24*HH}px'>${axis}</div>${cols}</div></div>
 </div></div></div>
 <div class='wk-lg'><span><i></i>planejado (tarefas, concluídas ficam riscadas)</span><span><i class='r'></i>realizado (cronômetro e registros)</span></div>
 <p class='sub' style='margin:8px 0 0;font-size:.85rem'>Clique num horário vazio para criar uma tarefa · arraste para mover · puxe a borda de baixo para mudar a duração · clique na tarefa para editar · clique num bloco preenchido para ver o que estudou.</p>${tray}<div class='wk-day'>${dayTop()}${dayStudy()}</div>`;
 const sc=$('#wkSc');
 if(sc){sc.scrollTop=wkScroll!=null?wkScroll:Math.max(0,(new Date().getHours()-1)*HH);wkScroll=sc.scrollTop}
 updNow();
}
function updNow(){const n=$('#wkNow');if(!n)return;const d=new Date();n.style.top=((d.getHours()*60+d.getMinutes())/60*HH)+'px'}
setInterval(updNow,60000);

/* arrastar / redimensionar */
let DR=null;
function setPv(pv,top,hgt,txt){pv.style.top=top+'px';pv.style.left='1px';pv.style.right='1px';pv.style.height=hgt+'px';pv.textContent=txt;pv.hidden=false}
const snap=m=>Math.round(m/SNAP)*SNAP;
function colAt(x,y){
 const ad=[...document.querySelectorAll('.wk-ad')],cs=[...document.querySelectorAll('.wk-col')];
 for(const c of ad){const r=c.getBoundingClientRect();if(x>=r.left&&x<r.right&&y>=r.top&&y<=r.bottom)return{el:c,day:c.dataset.day,allday:true}}
 for(const c of cs){const r=c.getBoundingClientRect(),sc=$('#wkSc').getBoundingClientRect();
  if(x>=r.left&&x<r.right&&y>=sc.top&&y<=sc.bottom)return{el:c,day:c.dataset.day,allday:false,top:r.top}}
 return null}
function dragStart(e){
 if(calV!=='week'||e.button>0)return;
 if(e.target.closest('.wk-chk'))return;
 const src=e.target.closest('.wk-ev,.wk-chip,.wk-tc');if(!src)return;
 const o=findTask(src.dataset.sid,src.dataset.tid);if(!o)return;
 const rs=!!e.target.closest('.wk-rs'),r=src.getBoundingClientRect();
 DR={src,o,rs,pid:e.pointerId,sx:e.clientX,sy:e.clientY,go:e.clientY-r.top,w:r.width,h:r.height,active:false,touch:e.pointerType==='touch',tgt:null,ok:false,cx:e.clientX,cy:e.clientY};
 if(DR.touch){DR.lp=setTimeout(()=>{if(DR&&!DR.active){DR.ready=true;beginDrag();if(navigator.vibrate)navigator.vibrate(15)}},320)}
 else{e.preventDefault()}
}
function beginDrag(){
 const d=DR;if(!d||d.active)return;d.active=true;
 document.body.classList.add('dragging');if(!d.rs)d.src.classList.add('src');
 try{d.src.setPointerCapture(d.pid)}catch(e){}
 if(!d.rs){const g=document.createElement('div');g.className='wk-gh';g.style.cssText=`--c:${d.o.s.color};width:${Math.min(d.w,180)}px`;g.textContent=d.o.x.name;document.body.appendChild(g);d.gh=g}
 d.pv=document.createElement('div');d.pv.className='wk-pv';d.pv.style.setProperty('--c',d.o.s.color);d.pv.hidden=true;
 d.loop=setInterval(autoScroll,30);
}
function autoScroll(){
 const d=DR;if(!d||!d.active)return;const sc=$('#wkSc');if(!sc)return;const r=sc.getBoundingClientRect();let v=0;
 if(d.cy<r.top+40&&d.cy>r.top-60)v=-12;else if(d.cy>r.bottom-40&&d.cy<r.bottom+60)v=12;
 if(v){sc.scrollTop+=v;dragUpdate()}
}
function dragMove(e){
 const d=DR;if(!d||e.pointerId!==d.pid)return;
 d.cx=e.clientX;d.cy=e.clientY;
 if(!d.active){
  if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<5)return;
  if(d.touch){clearTimeout(d.lp);DR=null;return}
  beginDrag()}
 if(e.cancelable)e.preventDefault();
 dragUpdate();
}
function dragUpdate(){
 const d=DR;if(!d||!d.active)return;
 document.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'));
 if(d.pv.parentNode)d.pv.remove();
 const t=colAt(d.cx,d.cy);d.tgt=null;d.ok=false;
 if(d.gh){d.gh.style.left=(d.cx+12)+'px';d.gh.style.top=(d.cy-12)+'px'}
 if(!t)return;
 if(d.rs){
  if(t.allday||t.day!==d.o.x.date)return;
  const start=hmin(d.o.x.time),m=snap((d.cy-t.top)/HH*60);let end=Math.min(1440,Math.max(start+SNAP,m));
  d.tgt={dur:end-start};d.ok=true;
  setPv(d.pv,start/60*HH,(end-start)/60*HH-1,`${mhm(start)}–${mhm(end)} · ${hh(end-start)}`);t.el.appendChild(d.pv);return}
 if(t.allday){t.el.classList.add('drop');d.tgt={day:t.day,time:''};d.ok=true;return}
 const dur=durOf(d.o.x);let st=snap((d.cy-d.go-t.top)/HH*60);st=Math.max(0,Math.min(1440-SNAP,st));
 if(st+dur>1440&&dur<=1440)st=Math.max(0,1440-dur);
 d.tgt={day:t.day,time:mhm(st)};d.ok=true;
 setPv(d.pv,st/60*HH,Math.max(dur/60*HH-1,16),`${mhm(st)}–${mhm(Math.min(1440,st+dur))}`);t.el.appendChild(d.pv);
}
function dragEnd(e){
 const d=DR;if(!d||(e&&e.pointerId!==d.pid))return;
 clearTimeout(d.lp);clearInterval(d.loop);DR=null;
 document.body.classList.remove('dragging');
 document.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'));
 if(d.gh)d.gh.remove();if(d.pv)d.pv.remove();d.src.classList.remove('src');
 try{d.src.releasePointerCapture(d.pid)}catch(x){}
 if(!d.active){if(e&&e.type==='pointerup')openTask(d.o.s.id,d.o.x.id);return}
 if(e&&e.type==='pointercancel'){return}
 dragEnd.skipClick=Date.now();
 if(!d.ok||!d.tgt)return;
 const x=d.o.x;
 if(d.rs){x.dur=d.tgt.dur}
 else{x.date=d.tgt.day;x.time=d.tgt.time;if(!x.time&&x.dur)delete x.dur}
 save();calSel=x.date||calSel;render();
 toast(d.rs?'Duração: '+hh(x.dur):x.time?`Movida para ${br(x.date)} às ${x.time}`:`Movida para ${br(x.date)} (sem horário)`);
}
document.addEventListener('pointerdown',dragStart);
document.addEventListener('pointermove',dragMove,{passive:false});
document.addEventListener('pointerup',dragEnd);
document.addEventListener('pointercancel',dragEnd);
document.addEventListener('touchmove',e=>{if(DR&&DR.active&&e.cancelable)e.preventDefault()},{passive:false});
document.addEventListener('contextmenu',e=>{if(DR&&DR.touch)e.preventDefault()});

/* diálogo criar/editar */
function openTask(sid,tid,day,time){
 const o=tid?findTask(sid,tid):null,x=o?o.x:{name:'',date:day||calSel||fmt(now()),time:time||'',dur:60,prio:'media'};
 const act=S.subjects.filter(s=>!s.arch),subj=o?o.s:(act.find(s=>s.id===sid)||act.find(s=>s.id===calSub)||act[0]);
 if(!subj){toast('Adicione uma matéria antes de criar tarefas.');return}
 const opts=S.subjects.filter(s=>!s.arch||s===subj).map(s=>`<option value='${s.id}'${s.id===subj.id?' selected':''}>${esc(s.name)}${s.arch?' (arquivada)':''}</option>`).join('');
 $('#tdBody').dataset.sid=o?o.s.id:'';$('#tdBody').dataset.tid=tid||'';
 $('#tdBody').style.setProperty('--c',subj.color);
 const dur0=+(o?(x.dur||x.est||60):(x.dur||60)),qd=(l,v)=>`<button type='button' class='tq' data-tq='d' data-v='${v}'>${l}</button>`,qu=v=>`<button type='button' class='tq${dur0===v?' on':''}' data-tq='u' data-v='${v}'>${v<60?v+' min':(v/60)+' h'}</button>`;
 $('#tdBody').innerHTML=`<div class='row'><h2 style='margin:0;font-size:1.3rem'>${o?'Editar tarefa':'Nova tarefa'}</h2><button class='ghost' data-w='close'>Fechar</button></div>
 <input type='text' id='td-n' class='td-big' maxlength='80' value='${esc(x.name)}' placeholder='O que você vai estudar ou fazer?' aria-label='Tarefa'>
 <label>Matéria<select id='td-s'>${opts}</select></label>
 <div class='tq-g'><span class='tq-l'>Quando</span><div class='tq-r'>${qd('Hoje','0')}${qd('Amanhã','1')}${qd('Em 1 semana','7')}${qd('Sem data','')}</div><div class='r2'><label>Dia<input type='date' id='td-d' value='${x.date||''}'></label><label>Início (opcional)<input type='time' id='td-t' value='${x.time||''}'></label></div></div>
 <div class='tq-g'><span class='tq-l'>Duração</span><div class='tq-r'>${[15,30,45,60,90,120].map(qu).join('')}</div><label>Outro valor (min)<input type='number' id='td-u' min='15' max='1440' step='5' value='${dur0}'></label></div>
 <label>Prioridade<select id='td-p'>${Object.entries(PR).map(([k,l])=>`<option value='${k}'${x.prio===k?' selected':''}>${l}</option>`).join('')}</select></label>
 <details class='td-more'${(x.est||x.note||x.exam)?' open':''}><summary>Mais opções</summary>
  <label>⏱ Tempo da tarefa (min)<input type='number' id='td-e' min='0' max='1440' step='5' placeholder='0' value='${x.est||''}'></label>
  <label>Anotações<textarea id='td-o' rows='2' maxlength='400' placeholder='Resumo, dúvidas, links...'>${esc(x.note||'')}</textarea></label>
  <label class='ck'><input type='checkbox' id='td-x'${x.exam?' checked':''}> 📝 Prova (gera contagem regressiva)</label></details>
 ${o?`<label class='ck'><input type='checkbox' id='td-c'${x.done?' checked':''}> Concluída</label>`:''}
 <div class='row'>${o?`<button class='btn danger' data-w='del'>Excluir</button>`:'<span></span>'}<span><button class='btn' data-w='close'>Cancelar</button> <button class='btn main' data-w='save'>Salvar</button></span></div>`;
 if(!$('#tdlg').open)$('#tdlg').showModal();
 setTimeout(()=>{const n=$('#td-n');if(n&&!o)n.focus()},30);
}
$('#tdlg').addEventListener('click',e=>{
 if(e.target===e.currentTarget){e.currentTarget.close();return}
 const b=e.target.closest('[data-w]');if(!b)return;const w=b.dataset.w,B=$('#tdBody');
 if(w==='close')$('#tdlg').close();
 else if(w==='del'){const o=findTask(B.dataset.sid,B.dataset.tid);if(!o)return;
  if(!confirm(`Excluir a tarefa "${o.x.name}"?`))return;
  o.s.topics=o.s.topics.filter(y=>y!==o.x);save();$('#tdlg').close();render();toast('Tarefa excluída.')}
 else if(w==='save'){
  const n=$('#td-n').value.trim();if(!n){toast('Digite o nome da tarefa.');$('#td-n').focus();return}
  const date=$('#td-d').value,time=$('#td-t').value,dur=Math.max(SNAP,parseInt($('#td-u').value)||60),sid=$('#td-s').value,ns=S.subjects.find(s=>s.id===sid);
  if(time&&!date){toast('Escolha um dia para usar o horário.');return}
  let o=B.dataset.tid?findTask(B.dataset.sid,B.dataset.tid):null,x;
  if(o){x=o.x;if(ns&&ns!==o.s){o.s.topics=o.s.topics.filter(y=>y!==x);(ns.topics=ns.topics||[]).push(x)}}
  else{x={id:'t'+Date.now().toString(36),name:n,date,prio:'media',est:0,done:false,doneAt:'',note:''};(ns.topics=ns.topics||[]).push(x);calSub=ns.id}
  if($('#td-x').checked&&!date){toast('Escolha o dia da prova.');return}
  x.name=n;x.date=date;x.time=time;x.prio=$('#td-p').value;if($('#td-x').checked)x.exam=true;else delete x.exam;
  x.est=Math.max(0,Math.min(1440,parseInt($('#td-e').value)||0));x.note=$('#td-o').value.trim();
  if(time||x.dur||!o)x.dur=dur;
  if(!time&&!o)delete x.time;
  const c=$('#td-c');if(c&&c.checked!==!!x.done)setDone(findTask(ns.id,x.id).s,x,c.checked);
  save();if(date)calSel=date;$('#tdlg').close();render();toast(o?'Tarefa atualizada.':'Tarefa criada.')}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="tedit"]');if(b)openTask(b.dataset.id,b.dataset.tid)});
$('#tdlg').addEventListener('close',()=>{const d=$('#dlg');if(d&&d.open&&detId&&S.subjects.some(x=>x.id===detId))detail(detId)});
$('#tdlg').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='td-n')$('#tdlg').querySelector('[data-w=save]').click()});

/* ações do calendário */
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a==='cview'){calV=b.dataset.v;try{localStorage.setItem('corrente-cal-view',calV)}catch(x){}
  if(calV==='week'){calW=fmt(monday(parse(calSel||fmt(now()))));wkScroll=null}
  else{calM=(calSel||fmt(now())).slice(0,7)}
  renderCal()}
 else if(a==='wnav'){const v=+b.dataset.v;
  if(v===0){calW=fmt(monday(now()));calSel=fmt(now());wkScroll=null}
  else{calW=fmt(addD(parse(calW),7*v));const k=fmt(addD(parse(calSel),7*v));calSel=k}
  renderCal()}
 else if(a==='wsel'){calSel=b.dataset.k;renderCal()}
 else if(a==='dnav'){const v=+b.dataset.v;calSel=v===0?fmt(now()):fmt(addD(parse(calSel||fmt(now())),v));calM=calSel.slice(0,7);calW=fmt(monday(parse(calSel)));renderCal()}
 else if(a==='wss'){studyDetail(b.dataset.sid,b.dataset.k,b.dataset.i)}
 else if(a==='tall'){calSel=fmt(now());calM=calSel.slice(0,7);calW=fmt(monday(now()));fromHome=true;location.hash='calendario'}
 else if(a==='wslot'){
  if(e.target.closest('.wk-ev,.wk-chip,.wk-pv'))return;
  if(Date.now()-(dragEnd.skipClick||0)<60)return;
  const r=b.getBoundingClientRect(),m=Math.max(0,Math.min(1440-30,Math.floor((e.clientY-r.top)/HH*60/30)*30));
  calSel=b.dataset.day;openTask('',null,b.dataset.day,mhm(m))}
});


/* ===== Histórico ===== */
let hV=(()=>{try{const v=localStorage.getItem('corrente-hist-view');return['day','week','month','year'].includes(v)?v:'week'}catch(e){return'week'}})(),hOff=0;
function hPeriod(v,off){
 const t=now();
 if(v==='day'){const d=addD(t,off);return{keys:[fmt(d)],label:d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}}
 if(v==='week'){const m=addD(monday(t),7*off),keys=Array.from({length:7},(_,i)=>fmt(addD(m,i))),a=parse(keys[0]),b=parse(keys[6]);
  return{keys,label:a.getMonth()===b.getMonth()?`${a.getDate()} – ${b.getDate()} de ${MESES[b.getMonth()]} de ${b.getFullYear()}`:`${a.getDate()} de ${MESES[a.getMonth()].slice(0,3)} – ${b.getDate()} de ${MESES[b.getMonth()].slice(0,3)} de ${b.getFullYear()}`}}
 if(v==='year'){const y=t.getFullYear()+off,n=(y%4===0&&(y%100!==0||y%400===0))?366:365;return{keys:Array.from({length:n},(_,i)=>fmt(new Date(y,0,i+1,12))),label:String(y)}}
 const f=new Date(t.getFullYear(),t.getMonth()+off,1,12),n=new Date(f.getFullYear(),f.getMonth()+1,0).getDate();
 return{keys:Array.from({length:n},(_,i)=>fmt(new Date(f.getFullYear(),f.getMonth(),i+1,12))),label:MESES[f.getMonth()][0].toUpperCase()+MESES[f.getMonth()].slice(1)+' de '+f.getFullYear()}}
const hMin=(s,keys)=>keys.reduce((a,k)=>a+(s.days[k]||0),0);
function hDelta(cur,prev,unit,pr){
 if(!prev&&!cur)return`<span class='eq'>—</span>`;
 if(!prev)return`<span class='up'>▲ novo</span> <span>(sem estudo ${pr} ${unit} anterior)</span>`;
 const p=Math.round((cur-prev)/prev*100);
 if(p===0)return`<span class='eq'>= igual ${pr==='na'?'à':'ao'} ${unit} anterior</span> <span>(${hh(prev)})</span>`;
 return`<span class='${p>0?'up':'dw'}'>${p>0?'▲ +':'▼ −'}${Math.abs(p)}%</span> <span>vs ${unit} anterior (${hh(prev)})</span>`}
function renderHist(){
 const el=$('#hist');if(!el)return;
 const P=hPeriod(hV,hOff),Q=hPeriod(hV,hOff-1),unit={day:'dia',week:'semana',month:'mês',year:'ano'}[hV],pr=hV==='week'?'na':'no',ths=hV==='week'?'nesta':'neste';
 const rows=S.subjects.map(s=>({s,c:hMin(s,P.keys),q:hMin(s,Q.keys),d:P.keys.filter(k=>k in s.days).length,
  done:(s.topics||[]).filter(x=>x.done&&P.keys.includes(x.doneAt||x.date||'')),lg:(S.log||[]).filter(x=>x.sid===s.id&&P.keys.includes(x.d)).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:(a.h||0)-(b.h||0))})).filter(r=>r.c>0||r.q>0||r.d>0||r.done.length||r.lg.length);
 rows.sort((a,b)=>b.c-a.c||b.q-a.q);
 const tot=rows.reduce((a,r)=>a+r.c,0),totQ=rows.reduce((a,r)=>a+r.q,0),
  allDays=new Set();S.subjects.forEach(s=>P.keys.forEach(k=>{if(k in s.days)allDays.add(k)}));
 const nDone=rows.reduce((a,r)=>a+r.done.length,0),t=fmt(now());
 const seg=`<div class='seg' role='group' aria-label='Período do histórico'>${[['day','Diário'],['week','Semanal'],['month','Mensal'],['year','Anual']].map(([k,l])=>`<button class='${hV===k?'on':''}' data-a='hview' data-v='${k}'>${l}</button>`).join('')}</div>`;
 const nav=`<span style='display:flex;gap:6px'><button class='btn' data-a='hnav' data-v='-1' aria-label='Período anterior'>‹</button><button class='btn' data-a='hnav' data-v='0'>Hoje</button><button class='btn' data-a='hnav' data-v='1' aria-label='Próximo período'${hOff>=0?' disabled':''}>›</button></span>`;
 let body;
 if(!rows.length)body=`<p class='sub'>Nenhum estudo registrado ${ths} ${unit}.</p>`;
 else{
  const sum=`<div class='hsum'><div><b>${tot?hh(tot):'0 min'}</b><span>estudado ${pr} ${unit}</span></div><div><b>${hDelta(tot,totQ,unit,pr).replace(/<span>.*?<\/span>/g,'')}</b><span>${totQ?'vs '+unit+' anterior ('+hh(totQ)+')':'sem '+unit+' anterior para comparar'}</span></div><div><b>${allDays.size}${hV==='day'?'':' de '+P.keys.length}</b><span>${hV==='day'?'dia com estudo':'dias com estudo'}</span></div><div><b>${nDone}</b><span>tarefa${pl(nDone)} concluída${pl(nDone)}</span></div></div>`;
  const stack=tot?`<div class='hstack' role='img' aria-label='Divisão do tempo entre matérias'>${rows.filter(r=>r.c>0).map(r=>`<i style='--c:${r.s.color};width:${r.c/tot*100}%' title='${esc(r.s.name)}: ${Math.round(r.c/tot*100)}%'></i>`).join('')}</div>`:'';
  const list=rows.map(r=>{
   const share=tot?Math.round(r.c/tot*100):0;
   const tasks=r.done.length?`<details><summary>${r.done.length} tarefa${pl(r.done.length)} concluída${pl(r.done.length)}</summary><ul>${r.done.slice().sort((a,b)=>(a.doneAt||'')<(b.doneAt||'')?-1:1).map(x=>`<li>${esc(x.name)}${hV==='day'?'':' · '+br(x.doneAt||x.date)}${x.est?' · '+hh(x.est):''}</li>`).join('')}</ul></details>`:'';
   return `<div class='hrow' style='--c:${r.s.color}'><div class='hh2'><b>${esc(r.s.name)}${r.s.arch?' (arquivada)':''}</b><span class='hv'>${r.c?hh(r.c):(r.d?'sem tempo registrado':'0 min')}</span></div>
   <div class='hbar' aria-hidden='true'><div style='width:${share}%'></div></div>
   <div class='hmeta'><span>${tot&&r.c?`<b style='color:var(--ink)'>${share}%</b> do tempo estudado${tot===r.c?' (só ela)':''}`:'sem tempo '+ths+' '+unit}</span><span>${hDelta(r.c,r.q,unit,pr)}</span>${hV!=='day'?`<span>${r.d} dia${pl(r.d)} estudado${pl(r.d)}</span>`:''}</div>${tasks}${r.lg.length?`<details class='hlog' open><summary>${r.lg.length} registro${pl(r.lg.length)} do que estudei</summary><ul>${r.lg.map(x=>`<li>${lgLine(x)}</li>`).join('')}</ul></details>`:''}</div>`}).join('');
  body=sum+stack+`<div class='hs'>${list}</div>`}
 el.innerHTML=`<div class='ch'><h2 style='text-transform:none'>📊 Histórico <span style='font-weight:500;font-size:1rem;color:var(--muted)'>· ${esc(P.label)}${hOff===0?' (atual)':''}</span></h2><div class='vt'>${seg}${nav}</div></div>${body}${reflHtml(hV,P)}`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a==='hview'){hV=b.dataset.v;hOff=0;try{localStorage.setItem('corrente-hist-view',hV)}catch(x){}renderHist()}
 else if(a==='hnav'){const v=+b.dataset.v;hOff=v===0?0:Math.min(0,hOff+v);renderHist()}
});

/* ===== V27: Feitas do dia (Histórico) ===== */
let ddK=null;
const sessParts=(a,b)=>{const p=[];let c=a;while(fmt(c)<fmt(b)){const n=new Date(c.getFullYear(),c.getMonth(),c.getDate()+1);p.push([fmt(c),(n-c)/6e4]);c=n}p.push([fmt(c),(b-c)/6e4]);return p};
function ddSessDay(s,k){let tot=0,unp=0;(s.sessions||[]).forEach(q=>{sessParts(new Date(q[0]),new Date(q[1])).forEach(([d,m])=>{if(d===k){tot+=Math.round(m);if(q[2])unp+=Math.round(m)}})});return{tot,unp}}
function renderDD(){
 const el=$('#dd');if(!el||curPage!=='relatorio'||rTab!=='hist')return;
 const t=fmt(now());if(!ddK||ddK>t)ddK=t;
 const k=ddK,title=parse(k).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const rows=[];
 S.subjects.forEach(s=>{
  const sd=ddSessDay(s,k);
  (s.sessions||[]).forEach(q=>{const a=new Date(q[0]),b=new Date(q[1]);if(fmt(a)!==k)return;rows.push({t:'s',s,q,a,b,o:a.getHours()*60+a.getMinutes()})});
  if(k in s.days){const res=Math.max(0,(s.days[k]||0)-sd.tot);if(res>=1||sd.tot===0)rows.push({t:'m',s,res,ru:Math.max(0,Math.min(res,((s.du&&s.du[k])||0)-sd.unp)),o:2000})}
 });
 rows.sort((x,y)=>x.o-y.o);
 const T=[];S.subjects.forEach(s=>(s.topics||[]).forEach(x=>{if(x.done&&(x.doneAt||x.date)===k)T.push({s,x})}));
 const lgs=(s,h)=>(S.log||[]).filter(x=>x.sid===s.id&&x.d===k&&(h==null?x.h==null:x.h===h));
 const lgH=L=>L.length?`<div class="sub" style="margin:2px 0 0;font-size:.85rem">${L.map(x=>'📝 '+(x.w?esc(x.w):'sem descrição')+(x.f?' · '+x.f+'/5 ★':'')).join(' · ')}</div>`:'';
 const R=rows.map(r=>{
  const s=r.s,off=impAt(s,k)===0;
  if(r.t==='s'){
   const m=Math.round((r.b-r.a)/6e4),unp=!!r.q[2]||off,span=fmt(r.b)!==k?` · termina em ${br(fmt(r.b))}`:'',at=`data-sid="${s.id}" data-ma="${+r.a}" data-mb="${+r.b}"`;
   return`<div class="hrow ddr" style="--c:${s.color}"><div class="hh2"><b>${esc(s.name)}${s.arch?' (arquivada)':''}</b><span class="est">${r.q[3]?'⏱ Cronômetro':'🕒 Registro com horário'}${span}</span></div>
   <div class="ddf"><label>Início<input type="time" data-dd="st" ${at} value="${hm(r.a)}"></label><label>Duração (min)<input type="number" min="1" max="1440" data-dd="du" ${at} value="${m}"></label><label>Tipo<select data-dd="pl" ${at}${off?' disabled':''}><option value="1"${unp?'':' selected'}>Planejada</option><option value="0"${unp?' selected':''}>Não planejada</option></select></label><button class="ghost danger" data-dd="delsess" ${at} aria-label="Excluir bloco">🗑 Excluir</button></div>
   ${off?'<div class="sub" style="margin:2px 0 0;font-size:.8rem">Matéria fora do plano neste dia: conta sempre como não planejada.</div>':''}${lgH(lgs(s,r.a.getHours()))}</div>`}
  const unp=off||(r.res>0&&r.ru>=r.res-.5),mix=!off&&r.ru>.5&&r.ru<r.res-.5,at=`data-sid="${s.id}"`;
  return`<div class="hrow ddr" style="--c:${s.color}"><div class="hh2"><b>${esc(s.name)}${s.arch?' (arquivada)':''}</b><span class="est">✍️ Registro manual (sem horário)</span></div>
  <div class="ddf"><label>Tempo (min)<input type="number" min="0" max="1440" data-dd="rm" ${at} value="${Math.round(r.res)}"></label><label>Tipo<select data-dd="rp" ${at}${off?' disabled':''}><option value="1"${unp||mix?'':' selected'}>Planejada</option><option value="0"${unp&&!mix?' selected':''}>Não planejada</option>${mix?`<option value="" selected disabled>Misto (${Math.round(r.ru)} min fora do plano)</option>`:''}</select></label><button class="ghost danger" data-dd="delman" ${at} aria-label="Excluir registro">🗑 Excluir</button></div>
  ${lgH(lgs(s,null))}</div>`}).join('');
 const TR=T.map(({s,x})=>{
  const at=`data-sid="${s.id}" data-tid="${x.id}"`,pb=x.exam?'📝 Prova':x.date?'📅 Planejada'+(x.date!==k?' para '+br(x.date):'')+(x.time?' às '+x.time:''):'Avulsa (sem data planejada)';
  return`<div class="hrow ddr" style="--c:${s.color}"><div class="hh2"><b>✓ ${xn(x)}</b><span class="est">${esc(s.name)}</span></div>
  <div class="ddf"><label>Tempo (min)<input type="number" min="0" max="1440" data-dd="tm" ${at} value="${x.est||0}"></label><span class="est">${pb}${x.spent?' · ⏱ cronometrado '+hh(x.spent):''}</span><button class="ghost" data-dd="reopen" ${at}>Reabrir</button></div></div>`}).join('');
 const tot=allTot(k),pn=plTot(k);
 el.innerHTML=`<div class='ch'><h2 style='text-transform:none'>✅ Feitas do dia <span style='font-weight:500;font-size:1rem;color:var(--muted)'>· ${esc(title)}${k===t?' (hoje)':''}</span></h2><div class='vt'><span style='display:flex;gap:6px;align-items:center;flex-wrap:wrap'><button class='btn' data-dd='nav' data-v='-1' aria-label='Dia anterior'>‹</button><input type='date' data-dd='date' value='${k}' max='${t}' aria-label='Escolher dia' style='background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;color:var(--ink)'><button class='btn' data-dd='nav' data-v='0'>Hoje</button><button class='btn' data-dd='nav' data-v='1' aria-label='Próximo dia'${k>=t?' disabled':''}>›</button></span></div></div>
 <div class='hsum'><div><b>${hh(Math.round(tot))}</b><span>total do dia</span></div><div><b>${hh(Math.round(pn))}</b><span>planejado</span></div><div><b>${hh(Math.round(tot-pn))}</b><span>fora do plano</span></div><div><b>${T.length}</b><span>tarefa${pl(T.length)} concluída${pl(T.length)}</span></div></div>
 <p class='sub' style='margin:8px 0 0;font-size:.8rem'>Edite início, duração e tipo direto aqui. Tempo, streak e XP se recalculam. Lazer e Elos já creditados não são refeitos, exceto ao marcar uma sessão como não planejada.</p>
 <div class='hs' style='margin-top:10px'>${R||''}${TR||''}${!R&&!TR?'<p class="sub">Nada registrado neste dia.</p>':''}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest('button[data-dd]');if(!b||b.disabled)return;const a=b.dataset.dd;
 if(a==='nav'){const v=+b.dataset.v,t=fmt(now());ddK=v===0?t:fmt(addD(parse(ddK||t),v));if(ddK>t)ddK=t;renderDD()}
 else if(a==='reopen'){const s=S.subjects.find(x=>x.id===b.dataset.sid),x=s&&(s.topics||[]).find(y=>y.id===b.dataset.tid);if(!x)return;setDone(s,x,false);save();render();toast('Tarefa reaberta.')}
 else if(a==='delsess'){const s=S.subjects.find(x=>x.id===b.dataset.sid);if(!s)return;const ma=+b.dataset.ma,mb=+b.dataset.mb,q=(s.sessions||[]).find(x=>+new Date(x[0])===ma&&+new Date(x[1])===mb);if(!q){toast('Sessão não encontrada.');render();return}
  const a0=new Date(ma),b0=new Date(mb),dur=Math.round((mb-ma)/6e4);
  if(!confirm('Excluir este bloco de '+s.name+' ('+hh(dur)+')?\n\nO tempo sai do dia e lazer, Elos, XP e streak são recalculados.'))return;
  const r=lzRefundSess(s,q),unp=!!q[2];s.du=s.du||{};
  sessParts(a0,b0).forEach(([d,m])=>{s.days[d]=Math.max(0,(s.days[d]||0)-Math.round(m));if(unp)s.du[d]=Math.max(0,(s.du[d]||0)-Math.round(m))});
  Object.keys(s.days).forEach(d=>{if(!(s.days[d]>0))delete s.days[d]});
  Object.keys(s.du).forEach(d=>{if(!(d in s.days)||s.du[d]>s.days[d])s.du[d]=s.days[d]||0;if(!s.du[d])delete s.du[d]});
  s.sessions=s.sessions.filter(x=>x!==q);
  const L=(S.log||[]).filter(x=>x.sid===s.id&&x.d===fmt(a0)&&x.h===a0.getHours());if(L.length){const g=L.reduce((p,x)=>Math.abs(x.m-dur)<Math.abs(p.m-dur)?x:p);S.log=S.log.filter(x=>x!==g)}
  save();render();toast('Bloco excluído.'+(r?' Lazer e Elos estornados ('+lzS(-r.lz).replace('+','−')+').':''))}
 else if(a==='delman'){const s=S.subjects.find(x=>x.id===b.dataset.sid);if(!s)return;const k=ddK,sd=ddSessDay(s,k),cur=Math.max(0,(s.days[k]||0)-sd.tot);
  if(!confirm('Excluir o registro manual de '+s.name+' ('+hh(cur)+') neste dia?\n\nO tempo sai do dia e lazer, Elos, XP e streak são recalculados.'))return;
  const r=lzRefundManual(s,k);s.days[k]=sd.tot;s.du=s.du||{};const du=Math.min(s.days[k],sd.unp);if(du>0)s.du[k]=du;else delete s.du[k];if(!(s.days[k]>0)){delete s.days[k];delete s.du[k]}
  S.log=(S.log||[]).filter(x=>!(x.sid===s.id&&x.d===k&&x.h==null));
  save();render();toast('Registro excluído.'+(r?' Lazer e Elos estornados.':''))}});
document.addEventListener('change',e=>{const el=e.target,a=el.dataset&&el.dataset.dd;if(!a||a==='nav'||a==='reopen'||a==='delsess'||a==='delman')return;
 if(a==='date'){const t=fmt(now());ddK=el.value&&el.value<=t?el.value:t;renderDD();return}
 const s=S.subjects.find(x=>x.id===el.dataset.sid);if(!s)return;const k=ddK,row=el.closest('.ddr');
 if(a==='st'||a==='du'||a==='pl'){
  const ma=+el.dataset.ma,mb=+el.dataset.mb,q=(s.sessions||[]).find(x=>+new Date(x[0])===ma&&+new Date(x[1])===mb);if(!q){toast('Sessão não encontrada.');render();return}
  const a0=new Date(ma),b0=new Date(mb);
  if(a==='pl'){
   const toPl=el.value==='1';
   if(!toPl){if(q[2]){render();return}mkUnp(s.id,ma,mb);return}
   if(!q[2]){render();return}
   if(!confirm('Voltar esta sessão para planejada? O tempo volta a valer para streak e XP, mas o lazer e os Elos que foram removidos não são devolvidos.')){render();return}
   s.du=s.du||{};sessParts(a0,b0).forEach(([d,m])=>{s.du[d]=Math.max(0,(s.du[d]||0)-Math.round(m))});q[2]=0;
   (S.log||[]).forEach(x=>{if(x.sid===s.id&&x.d===fmt(a0)&&x.h===a0.getHours()&&x.u){delete x.u;x.xb=xbCalc(x.m)}});
   save();render();toast('Sessão marcada como planejada.');return}
  const hhmm=row.querySelector('[data-dd="st"]').value,dur=Math.round(+row.querySelector('[data-dd="du"]').value);
  if(!hhmm||!(dur>=1&&dur<=1440)){toast('Informe início e duração válidos (1 a 1440 min).');render();return}
  const na=new Date(fmt(a0)+'T'+hhmm+':00'),nb=new Date(+na+dur*6e4);
  if(isNaN(na)||nb>new Date()){toast('Esse bloco terminaria no futuro. Ajuste o início ou a duração.');render();return}
  const oldDur=Math.round((mb-ma)/6e4),rf=dur!==oldDur?lzRefundSess(s,q):null,oldP=sessParts(a0,b0),newP=sessParts(na,nb),unp=!!q[2];s.du=s.du||{};
  oldP.forEach(([d,m])=>{s.days[d]=Math.max(0,(s.days[d]||0)-Math.round(m));if(unp)s.du[d]=Math.max(0,(s.du[d]||0)-Math.round(m))});
  newP.forEach(([d,m])=>{s.days[d]=(s.days[d]||0)+Math.round(m);if(unp)s.du[d]=(s.du[d]||0)+Math.round(m)});
  oldP.forEach(([d])=>{if(!(s.days[d]>0)&&!newP.some(p=>p[0]===d)){delete s.days[d];if(s.du)delete s.du[d]}});
  Object.keys(s.du).forEach(d=>{if(!(d in s.days)||s.du[d]>s.days[d])s.du[d]=s.days[d]||0;if(!s.du[d])delete s.du[d]});
  const L=(S.log||[]).filter(x=>x.sid===s.id&&x.d===fmt(a0)&&x.h===a0.getHours());
  if(L.length===1){const x=L[0];x.d=fmt(na);x.h=na.getHours();x.m=dur;if(x.xb>0)x.xb=xbCalc(dur)}
  q[0]=iso(na);q[1]=iso(nb);
  if(rf&&!unp&&impAt(s,fmt(na))!==0){const nid=q[3]?lzGain(s,dur,'timer'):lzGainD(s,dur,'manual',fmt(na),true),ne=nid&&lzCfg().led.find(x=>x.id===nid);if(ne&&q[3])q[3]=ne.t;if(nid&&rf.bonus)lzBonus(nid)}
  save();render();toast(fmt(na)!==k?'Sessão movida para '+br(fmt(na))+'.':'Sessão atualizada.');return}
 if(a==='rm'||a==='rp'){
  const sd=ddSessDay(s,k),cur=Math.max(0,(s.days[k]||0)-sd.tot),curU=Math.max(0,Math.min(cur,((s.du&&s.du[k])||0)-sd.unp));let nr=cur,nu=curU;
  if(a==='rm'){nr=Math.max(0,Math.round(+el.value||0));nu=cur>0?(curU>=cur-.5?nr:Math.min(nr,Math.round(curU))):0}
  else{if(el.value==='')return;nu=el.value==='1'?0:cur}
  const rm=a==='rm'&&nr!==cur?lzRefundManual(s,k):null;
  s.days[k]=sd.tot+nr;s.du=s.du||{};const du=Math.min(s.days[k],sd.unp+nu);if(du>0)s.du[k]=du;else delete s.du[k];
  if(!(s.days[k]>0)){delete s.days[k];delete s.du[k];S.log=(S.log||[]).filter(x=>!(x.sid===s.id&&x.d===k&&x.h==null))}
  if(rm){const pm=Math.max(0,nr-nu);if(pm>0&&impAt(s,k)!==0)lzGainD(s,pm,'manual',k,false)}
  save();render();toast('Registro atualizado.'+(rm?' Lazer e Elos recalculados.':''));return}
 if(a==='tm'){
  const x=(s.topics||[]).find(y=>y.id===el.dataset.tid);if(!x)return;
  const old=x.est||0,nv=Math.max(0,Math.min(1440,Math.round(+el.value||0))),sd=ddSessDay(s,k);x.est=nv;if(x.dur&&nv>0)x.dur=Math.max(SNAP,nv);
  if(!x.exam&&old>0&&(s.days[k]||0)===old&&sd.tot===0&&!(s.topics||[]).some(y=>y!==x&&y.done&&y.doneAt===k)){s.days[k]=nv;if(s.du&&s.du[k]>nv)s.du[k]=nv}
  save();render();toast('Tempo da tarefa atualizado.')}
});

/* ===== Navegação entre páginas ===== */
const OBJ=['metas','desafio','contratos'];let objTab='metas';
function objShow(){OBJ.forEach(n=>{const e=$('#obj-'+n);if(e)e.hidden=n!==rTab})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="objtab"]');if(!b)return;objTab=b.dataset.v;objShow()});
const PAGES=['relatorio','lazer','lost','lumi','feed','loja','lumiia','ligas']; /* ALTERADO v20 */let curPage='',fromHome=false;
function route(){
 let h=decodeURIComponent(location.hash.slice(1));if(OBJ.includes(h)){rTab=h;h='relatorio'}if(h==='planejamento'){rTab='planej';h='relatorio'}if(h==='objetivos'){rTab='metas';h='relatorio'}if(h==='calendario'){rTab='cal';h='relatorio'}if(h==='tarefas'){rTab='tarefas';h='relatorio'}if(h==='historico'){rTab='hist';h='relatorio'}const p=PAGES.includes(h)?h:'',ch=p!==curPage;curPage=p;
 $('#home').hidden=!!p;PAGES.forEach(n=>{const e=$('#pg-'+n);if(e)e.hidden=n!==p});
 if(ch)window.scrollTo(0,0);
 objShow();render();
}
window.addEventListener('hashchange',route);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a="nav"],[data-a="back"]');if(!b)return;
 if(b.dataset.a==='nav'){fromHome=true;let pg=b.dataset.p;if(OBJ.includes(pg)){rTab=pg;pg='relatorio'}else if(pg==='planejamento'){rTab='planej';pg='relatorio'}else if(pg==='objetivos'){rTab='metas';pg='relatorio'}else if(pg==='calendario'){rTab='cal';pg='relatorio'}else if(pg==='historico'){rTab='hist';pg='relatorio'}else if(pg==='relatorio')rTab='rel';if(location.hash==='#'+pg)route();else location.hash=pg}
 else if(fromHome)history.back();
 else{history.replaceState(null,'',location.pathname+location.search);route()}
});
