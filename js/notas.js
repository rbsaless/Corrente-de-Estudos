/* ===== Notas: pastas + páginas em Markdown. Carregar depois de como-funciona.js e antes de lumi.js ===== */
(()=>{
const ID=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let mode='ler',q='',tm=null,shown=false;
const N=()=>{const n=S.notas=(S.notas&&typeof S.notas==='object')?S.notas:{};n.items=Array.isArray(n.items)?n.items:[];n.sel=n.sel||null;return n};
const get=id=>N().items.find(x=>x.id===id);
const kids=p=>N().items.filter(x=>(x.p||null)===(p||null)).sort((a,b)=>(a.k===b.k?0:a.k==='f'?-1:1)||String(a.t).localeCompare(String(b.t),'pt'));
const desc=id=>{const r=[];const w=p=>kids(p).forEach(x=>{r.push(x.id);if(x.k==='f')w(x.id)});w(id);return r};
const path=it=>{const r=[];let p=it.p;while(p){const x=get(p);if(!x)break;r.unshift(x.t);p=x.p}return r.join(' / ')};
function flush(){clearTimeout(tm);tm=null;save()}
function later(){clearTimeout(tm);tm=setTimeout(flush,400)}

/* ---------- Markdown ---------- */
function inl(s){const st=[];
 s=esc(s).replace(/`([^`]+)`/g,(m,c)=>{st.push('<code>'+c+'</code>');return '\u0000'+(st.length-1)+'\u0000'});
 s=s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/~~(.+?)~~/g,'<s>$1</s>')
  .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g,'$1<i>$2</i>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
 return s.replace(/\u0000(\d+)\u0000/g,(m,i)=>st[i])}
function md(src){
 const L=String(src||'').replace(/\r/g,'').split('\n'),o=[],LI=/^\s*([-*]|\d+\.)\s+/;let i=0;
 const bl=l=>/^(```|#{1,3}\s|>|---+\s*$)/.test(l)||LI.test(l);
 while(i<L.length){const l=L[i];let m;
  if(m=l.match(/^```\s*([\w+#-]*)/)){const c=[];i++;while(i<L.length&&!/^```\s*$/.test(L[i]))c.push(L[i++]);i++;
   o.push(`<div class="nt-cb"><div class="nt-ch"><span>${esc(m[1]||'código')}</span><button type="button" data-nt="copy">Copiar</button></div><pre><code${m[1]?` class="language-${esc(m[1])}"`:''}>${esc(c.join('\n'))}</code></pre></div>`)}
  else if(m=l.match(/^(#{1,3})\s+(.*)/)){o.push(`<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`);i++}
  else if(/^---+\s*$/.test(l)){o.push('<hr>');i++}
  else if(/^>/.test(l)){const c=[];while(i<L.length&&/^>/.test(L[i]))c.push(L[i++].replace(/^>\s?/,''));o.push('<blockquote>'+c.map(inl).join('<br>')+'</blockquote>')}
  else if(m=l.match(LI)){const t=/\d/.test(m[1])?'ol':'ul',c=[];while(i<L.length&&LI.test(L[i]))c.push(L[i++].replace(LI,''));o.push(`<${t}>${c.map(x=>'<li>'+inl(x)+'</li>').join('')}</${t}>`)}
  else if(!l.trim())i++;
  else{const c=[L[i++]];while(i<L.length&&L[i].trim()&&!bl(L[i]))c.push(L[i++]);o.push('<p>'+c.map(inl).join('<br>')+'</p>')}}
 return o.join('')}

/* ---------- Desenho ---------- */
function treeH(p,d){return kids(p).map(x=>{const on=x.id===N().sel?' on':'',pad=`style="padding-left:${8+d*14}px"`;
 if(x.k==='f')return `<div class="nt-r${on}" ${pad} data-nt="sel" data-id="${x.id}"><span class="nt-ar" data-nt="tg" data-id="${x.id}">${x.o?'▾':'▸'}</span>${x.o?'📂':'📁'} <span class="nt-tt">${esc(x.t)}</span></div>`+(x.o?treeH(x.id,d+1):'');
 return `<div class="nt-r${on}" ${pad} data-nt="sel" data-id="${x.id}"><span class="nt-ar"></span>📄 <span class="nt-tt">${esc(x.t)}</span></div>`}).join('')}
function drawTree(){const el=$('#nt-tree');if(!el)return;
 if(q){const s=q.toLowerCase(),r=N().items.filter(x=>String(x.t).toLowerCase().includes(s)||(x.k==='p'&&String(x.c).toLowerCase().includes(s)));
  el.innerHTML=r.map(x=>`<div class="nt-r${x.id===N().sel?' on':''}" data-nt="sel" data-id="${x.id}">${x.k==='f'?'📁':'📄'} <span class="nt-tt">${esc(x.t)}</span></div>`).join('')||'<p class="sub">Nada encontrado.</p>';return}
 el.innerHTML=treeH(null,0)||'<p class="sub">Nenhuma nota ainda. Crie uma pasta ou página acima.</p>'}
function hl(){if(!window.hljs)return;document.querySelectorAll('#nt-md pre code').forEach(b=>{try{hljs.highlightElement(b)}catch(e){}})}
function drawMain(){const el=$('#nt-main');if(!el)return;const it=get(N().sel);
 if(!it){el.innerHTML='<button class="btn nt-menu" data-nt="menu">☰ Pastas</button><div class="nt-empty">Escolha uma nota na lateral ou crie uma nova.</div>';return}
 const hd=`<div class="nt-hd"><button class="btn nt-menu" data-nt="menu">☰ Pastas</button><input id="nt-t" class="nt-title" value="${esc(it.t)}" maxlength="80" aria-label="Título"><button class="btn" data-nt="mv">Mover</button><button class="btn" data-nt="del" aria-label="Apagar">🗑</button></div>${path(it)?`<p class="sub" style="margin:0 0 10px">${esc(path(it))}</p>`:''}`;
 if(it.k==='f'){const k=kids(it.id);
  el.innerHTML=hd+`<div class="nt-bar" style="margin-bottom:10px"><button class="btn" data-nt="addf">📁 Subpasta</button><button class="btn main" data-nt="addp">📄 Página aqui</button></div>`+(k.map(x=>`<div class="nt-r" data-nt="sel" data-id="${x.id}">${x.k==='f'?'📁':'📄'} <span class="nt-tt">${esc(x.t)}</span></div>`).join('')||'<p class="sub">Pasta vazia.</p>');return}
 const tb=[['h1','H1'],['h2','H2'],['b','<b>B</b>'],['i','<i>I</i>'],['ul','• Lista'],['ol','1. Lista'],['q','❝'],['code','{ } Código'],['ic','`código`'],['link','🔗'],['hr','—']].map(([f,t])=>`<button type="button" class="btn" data-nt="fmt" data-f="${f}">${t}</button>`).join('');
 el.innerHTML=hd+`<div class="nt-tabs"><button class="btn${mode==='esc'?' main':''}" data-nt="m" data-m="esc">✏️ Escrever</button><button class="btn${mode==='ler'?' main':''}" data-nt="m" data-m="ler">👁 Ler</button></div>`+
  (mode==='esc'?`<div class="nt-tb">${tb}</div><textarea id="nt-x" spellcheck="false" placeholder="Escreva em Markdown. # Título, ## Subtítulo, \`\`\` para código">${esc(it.c)}</textarea>`
  :`<div class="nt-md" id="nt-md">${md(it.c)||'<p class="sub">Página vazia. Clique em Escrever.</p>'}</div>`);
 if(mode==='ler')hl()}
function drawAll(){drawTree();drawMain()}
function shell(){const r=$('#nt-root');if(!r||r.firstChild)return;
 r.innerHTML=`<div class="nt${N().sel?'':' op'}" id="nt"><aside class="nt-side"><div class="nt-bar"><button class="btn" data-nt="addf">📁 Pasta</button><button class="btn main" data-nt="addp">📄 Página</button></div><input id="nt-q" type="search" placeholder="Buscar…" aria-label="Buscar nas notas"><div id="nt-tree"></div></aside><div class="nt-main" id="nt-main"></div></div><dialog id="nt-dlg"><div class="dl" id="nt-db"></div></dialog>`}

/* ---------- Ações ---------- */
function select(id){const it=get(id);if(!it)return;N().sel=id;if(it.k==='p'){mode=it.c?'ler':'esc';$('#nt')&&$('#nt').classList.remove('op')}else it.o=it.o?0:1;save();drawAll()}
function add(k){const s=get(N().sel),p=s?(s.k==='f'?s.id:(s.p||null)):null;if(p)get(p).o=1;q='';const qi=$('#nt-q');if(qi)qi.value='';
 const it={id:ID(),t:k==='f'?'Nova pasta':'Nova página',k,p,c:'',u:Date.now(),o:0};N().items.push(it);N().sel=it.id;mode='esc';
 const n=$('#nt');if(n&&k==='p')n.classList.remove('op');save();drawAll();const t=$('#nt-t');if(t){t.focus();t.select()}}
function del(){const it=get(N().sel);if(!it)return;const ds=desc(it.id);
 if(!confirm(`Apagar “${it.t}”${ds.length?` e tudo dentro (${ds.length} ${ds.length===1?'item':'itens'})`:''}? Não dá para desfazer.`))return;
 const rm=new Set([it.id,...ds]);N().items=N().items.filter(x=>!rm.has(x.id));N().sel=it.p&&get(it.p)?it.p:null;save();drawAll()}
function openMv(){const it=get(N().sel);if(!it)return;const ex=new Set([it.id,...desc(it.id)]),o=[];
 const w=(p,d)=>kids(p).forEach(x=>{if(x.k==='f'&&!ex.has(x.id)){o.push(`<option value="${x.id}"${(it.p||null)===x.id?' selected':''}>${'\u00A0\u00A0'.repeat(d)}📁 ${esc(x.t)}</option>`);w(x.id,d+1)}});w(null,0);
 $('#nt-db').innerHTML=`<h2 style="margin-top:0">Mover “${esc(it.t)}”</h2><select id="nt-mvs" style="width:100%;padding:10px;border-radius:10px;background:var(--bg);color:var(--ink);border:1px solid var(--line)"><option value="">📚 Raiz</option>${o.join('')}</select><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn" data-nt="mvx">Cancelar</button><button class="btn main" data-nt="mvok">Mover</button></div>`;
 $('#nt-dlg').showModal()}
function fmtIns(f){const x=$('#nt-x');if(!x)return;const a=x.selectionStart,b=x.selectionEnd,v=x.value,s=v.slice(a,b);
 const wrap=(l,r,ph)=>{const t=s||ph;x.setRangeText(l+t+r,a,b,'end');x.setSelectionRange(a+l.length,a+l.length+t.length)};
 const ln=p=>{const ls=v.lastIndexOf('\n',a-1)+1;x.setRangeText(p,ls,ls,'preserve');x.setSelectionRange(a+p.length,b+p.length)};
 if(f==='h1')ln('# ');else if(f==='h2')ln('## ');else if(f==='ul')ln('- ');else if(f==='ol')ln('1. ');else if(f==='q')ln('> ');
 else if(f==='b')wrap('**','**','texto');else if(f==='i')wrap('*','*','texto');else if(f==='ic')wrap('`','`','código');
 else if(f==='link')wrap('[',`](https://)`,'texto');
 else if(f==='hr'){x.setRangeText('\n\n---\n\n',a,b,'end')}
 else if(f==='code'){const t=s||'código';x.setRangeText('\n```js\n'+t+'\n```\n',a,b,'end');x.setSelectionRange(a+7,a+7+t.length)}
 x.focus();x.dispatchEvent(new Event('input',{bubbles:true}))}

document.addEventListener('click',e=>{
 const b=e.target.closest('#pg-notas [data-nt]');if(!b)return;const a=b.dataset.nt;
 if(a==='tg'){e.stopPropagation();const it=get(b.dataset.id);if(it){it.o=it.o?0:1;save();drawTree()}}
 else if(a==='sel')select(b.dataset.id);
 else if(a==='addf')add('f');else if(a==='addp')add('p');
 else if(a==='del')del();else if(a==='mv')openMv();
 else if(a==='mvx')$('#nt-dlg').close();
 else if(a==='mvok'){const it=get(N().sel),v=$('#nt-mvs').value||null;if(it){it.p=v;if(v)get(v).o=1;save()}$('#nt-dlg').close();drawAll()}
 else if(a==='m'){flush();mode=b.dataset.m;drawMain()}
 else if(a==='fmt')fmtIns(b.dataset.f);
 else if(a==='menu'){const n=$('#nt');n&&n.classList.toggle('op')}
 else if(a==='copy'){const c=b.closest('.nt-cb').querySelector('code').textContent;
  const ok=()=>{b.textContent='Copiado ✓';setTimeout(()=>b.textContent='Copiar',1500)};
  if(navigator.clipboard)navigator.clipboard.writeText(c).then(ok,()=>toast('Não foi possível copiar.'));else toast('Não foi possível copiar.')}
});
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.id)return;
 if(t.id==='nt-x'){const it=get(N().sel);if(it){it.c=t.value;it.u=Date.now();later()}}
 else if(t.id==='nt-t'){const it=get(N().sel);if(it){it.t=t.value;drawTree();later()}}
 else if(t.id==='nt-q'){q=t.value.trim();drawTree()}});
document.addEventListener('change',e=>{if(e.target.id==='nt-t'){const it=get(N().sel);if(it&&!it.t.trim()){it.t=it.k==='f'?'Nova pasta':'Nova página';e.target.value=it.t;drawTree();save()}}});
document.addEventListener('keydown',e=>{if(e.target.id==='nt-x'&&e.key==='Tab'){e.preventDefault();const x=e.target;x.setRangeText('  ',x.selectionStart,x.selectionEnd,'end');x.dispatchEvent(new Event('input',{bubbles:true}))}});
addEventListener('pagehide',()=>{if(tm)flush()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&tm)flush()});

/* ---------- Encaixe no app ---------- */
function ensure(){
 if(!document.getElementById('pg-notas')){const pg=document.createElement('div');pg.className='page';pg.id='pg-notas';pg.hidden=true;
  pg.innerHTML='<div class="ptop"><button class="btn" data-a="back" aria-label="Voltar para a tela inicial">← Início</button><h1>📝 Notas</h1></div><div id="nt-root"></div>';
  const ref=document.getElementById('pg-feed');(ref&&ref.parentNode?ref.parentNode:document.querySelector('.wrap')).appendChild(pg)}
 if(!document.getElementById('nt-btn')){const t=document.querySelector('.tools'),b=document.createElement('button');b.className='btn';b.id='nt-btn';b.dataset.a='nav';b.dataset.p='notas';b.textContent='📝 Notas';
  if(t){const ex=document.getElementById('exp');t.insertBefore(b,ex||null)}}
 if(!PAGES.includes('notas'))PAGES.push('notas')}
function draw(){if(curPage!=='notas'){shown=false;return}
 shell();if(!shown){shown=true;drawAll()}}
ensure();
const _r=render;render=function(){const r=_r.apply(this,arguments);try{draw()}catch(e){console.error('Notas:',e)}return r};
try{if(decodeURIComponent(location.hash.slice(1))==='notas')route()}catch(e){}
})();
