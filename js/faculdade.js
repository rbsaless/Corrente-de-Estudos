/* ===== Área da Faculdade: Gerenciador Acadêmico, Previsão de Nota, Caminho Crítico (2028/1) e Foco Semestral =====
   Novo arquivo independente para extensão do Corrente de Estudos.
   Correção de clique duplo / conflito de roteamento com o core.js. */
(()=>{
  /* --- 1. Injeção Dinâmica de Estilos CSS --- */
  const css = document.createElement('style');
  css.textContent = `
    #pg-faculdade .fc-header {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 20px;
    }
    #pg-faculdade .fc-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 14px;
    }
    .fc-stat-card {
      background: var(--bg);
      border-radius: 16px;
      padding: 12px 16px;
      border-left: 5px solid var(--line);
    }
    .fc-stat-card.ok { border-left-color: #2a9d6f; }
    .fc-stat-card.warn { border-left-color: #f59e0b; }
    .fc-stat-card.danger { border-left-color: #e5484d; }
    .fc-stat-card.info { border-left-color: var(--flame); }
    .fc-stat-card b {
      display: block;
      font: 800 1.6rem "Bricolage Grotesque", "DM Sans", sans-serif;
      line-height: 1.1;
    }
    .fc-stat-card span {
      font-size: 0.8rem;
      color: var(--muted);
    }

    /* Halo dynamic por card */
    .fc-card {
      background: var(--surface);
      border: 2px solid var(--line);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .fc-card:hover {
      transform: translateY(-2px);
    }

    /* Status dos Halos */
    .fc-card.halo-green {
      border-color: #2a9d6f;
      box-shadow: 0 0 12px rgba(42, 157, 111, 0.25);
    }
    .fc-card.halo-yellow {
      border-color: #f59e0b;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
    }
    .fc-card.halo-red {
      border-color: #e5484d;
      box-shadow: 0 0 16px rgba(229, 72, 77, 0.35);
      animation: fcPulseRed 2s infinite;
    }
    .fc-card.halo-off {
      border-color: var(--line);
      opacity: 0.72;
      background: var(--bg);
    }
    .fc-card.halo-done {
      border-color: #2a9d6f;
      opacity: 0.85;
      background: color-mix(in srgb, #2a9d6f 6%, var(--surface));
    }

    @keyframes fcPulseRed {
      0% { box-shadow: 0 0 6px rgba(229, 72, 77, 0.2); }
      50% { box-shadow: 0 0 16px rgba(229, 72, 77, 0.5); }
      100% { box-shadow: 0 0 6px rgba(229, 72, 77, 0.2); }
    }

    .fc-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }
    .fc-card-title {
      font: 800 1.15rem "Bricolage Grotesque", "DM Sans", sans-serif;
      margin: 0;
      line-height: 1.2;
    }
    .fc-card-sub {
      font-size: 0.78rem;
      color: var(--muted);
      margin-top: 2px;
    }

    .fc-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .fc-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 8px;
      background: var(--bg);
      color: var(--ink);
      border: 1px solid var(--line);
    }
    .fc-badge.gargalo {
      background: rgba(229, 72, 77, 0.15);
      color: #e5484d;
      border-color: rgba(229, 72, 77, 0.4);
    }
    .fc-badge.passar {
      background: rgba(42, 157, 111, 0.15);
      color: #2a9d6f;
      border-color: rgba(42, 157, 111, 0.4);
    }
    .fc-badge.adiada {
      background: var(--track);
      color: var(--muted);
    }

    .fc-toggle-passar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 8px 12px;
      font-size: 0.85rem;
      cursor: pointer;
      user-select: none;
      transition: background 0.2s, border-color 0.2s;
    }
    .fc-toggle-passar:hover {
      border-color: var(--muted);
    }
    .fc-toggle-passar input[type=checkbox] {
      width: 18px;
      height: 18px;
      accent-color: var(--flame);
      cursor: pointer;
    }

    .fc-grade-box {
      background: var(--bg);
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .fc-grade-val {
      font: 800 1.3rem "Bricolage Grotesque", "DM Sans", sans-serif;
    }
    .fc-grade-val.green { color: #2a9d6f; }
    .fc-grade-val.yellow { color: #f59e0b; }
    .fc-grade-val.red { color: #e5484d; }
    .fc-grade-val.gray { color: var(--muted); }

    .fc-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }
    .fc-form-grid label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.82rem;
      color: var(--muted);
    }
    .fc-form-grid input, .fc-form-grid select {
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 8px 10px;
      color: var(--ink);
      font: inherit;
    }
    .fc-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(css);

  /* --- 2. Gerenciamento de Estado no localStorage --- */
  const STORAGE_KEY = 'ce_faculdade_v1';

  function getFcData() {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = {
        targetSem: '2028/1',
        subs: [
          {
            id: 'fc_' + Date.now() + '_1',
            name: 'Análise de Algoritmos',
            pretendePassar: true,
            status: 'cursando',
            oferta: 'sem2',
            gargalo: true,
            prereq: 'Estrutura de Dados',
            tentativas: 1,
            provaData: '2026-11-25',
            notaAlvo: 7.0,
            horasMeta: 40,
            horasEstudadas: 22
          },
          {
            id: 'fc_' + Date.now() + '_2',
            name: 'Sistemas Operacionais',
            pretendePassar: true,
            status: 'cursando',
            oferta: 'sem2',
            gargalo: false,
            prereq: 'Arq. de Computadores',
            tentativas: 1,
            provaData: '2026-12-02',
            notaAlvo: 7.0,
            horasMeta: 35,
            horasEstudadas: 18
          },
          {
            id: 'fc_' + Date.now() + '_3',
            name: 'Compiladores',
            pretendePassar: false,
            status: 'pendente',
            oferta: 'sem1',
            gargalo: true,
            prereq: 'Linguagens Formais',
            tentativas: 0,
            provaData: '',
            notaAlvo: 7.0,
            horasMeta: 45,
            horasEstudadas: 0
          },
          {
            id: 'fc_' + Date.now() + '_4',
            name: 'Trabalho de Conclusão de Curso (TCC II)',
            pretendePassar: false,
            status: 'pendente',
            oferta: 'todosem',
            gargalo: true,
            prereq: 'TCC I',
            tentativas: 0,
            provaData: '',
            notaAlvo: 8.0,
            horasMeta: 60,
            horasEstudadas: 0
          }
        ]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(raw);
    } catch(e) {
      console.error('Erro ao ler ce_faculdade_v1:', e);
      return { targetSem: '2028/1', subs: [] };
    }
  }

  function saveFcData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /* --- 3. Motor de Cálculo de Nota Prevista & Status do Halo --- */
  function calcPrevisao(sub) {
    if (sub.status === 'concluida') {
      return { nota: 10.0, label: 'Aprovado ✓', color: 'green', halo: 'halo-done', alertMsg: 'Matéria concluída com sucesso.' };
    }
    if (!sub.pretendePassar) {
      return { nota: null, label: 'Adiada p/ sem. futuro', color: 'gray', halo: 'halo-off', alertMsg: 'Sem cobrança ativa neste semestre.' };
    }

    const meta = sub.horasMeta || 30;
    const est = sub.horasEstudadas || 0;
    const ratio = Math.min(1.2, est / meta);
    
    let notaBase = ratio * sub.notaAlvo;

    let diasAteProva = null;
    if (sub.provaData) {
      const pDate = new Date(sub.provaData + 'T00:00:00');
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      diasAteProva = Math.ceil((pDate - hoje) / (1000 * 60 * 60 * 24));

      if (diasAteProva >= 0 && diasAteProva <= 7 && ratio < 0.5) {
        notaBase *= 0.8;
      }
    }

    let notaFinal = Math.min(10.0, Math.max(0.0, notaBase)).toFixed(1);
    let color = 'gray';
    let halo = 'halo-off';
    let alertMsg = '';

    if (notaFinal >= sub.notaAlvo) {
      color = 'green';
      halo = 'halo-green';
      alertMsg = 'Ritmo excelente! Na zona de aprovação.';
    } else if (notaFinal >= 5.0) {
      color = 'yellow';
      halo = 'halo-yellow';
      alertMsg = 'Alerta: Ritmo no limite (risco de final). Aumente o foco!';
    } else {
      color = 'red';
      halo = 'halo-red';
      alertMsg = sub.gargalo 
        ? 'PERIGO CRÍTICO: Matéria Gargalo com nota prevista baixa!' 
        : 'Atenção: Previsão abaixo da média de aprovação.';
    }

    return {
      nota: notaFinal,
      label: `${notaFinal} / 10.0 (Alvo: ${sub.notaAlvo.toFixed(1)})`,
      color,
      halo,
      alertMsg,
      diasAteProva
    };
  }

  /* --- 4. Injeção da Aba no Header e da Página no DOM --- */
  function ensureDOM() {
    const toolsContainer = document.querySelector('.tools');
    if (toolsContainer && !document.querySelector('[data-p="faculdade"]')) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.setAttribute('data-a', 'nav');
      btn.setAttribute('data-p', 'faculdade');
      btn.innerHTML = '🎓 Área Faculdade';

      const lojaBtn = toolsContainer.querySelector('[data-p="loja"]');
      if (lojaBtn) {
        lojaBtn.after(btn);
      } else {
        toolsContainer.appendChild(btn);
      }
    }

    const wrap = document.querySelector('.wrap');
    if (wrap && !document.getElementById('pg-faculdade')) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page';
      pageDiv.id = 'pg-faculdade';
      pageDiv.hidden = true;

      pageDiv.innerHTML = `
        <div class="ptop">
          <button class="btn" data-a="back" aria-label="Voltar para a tela inicial">← Início</button>
          <h1>🎓 Área da Faculdade</h1>
        </div>

        <section class="fc-header" aria-label="Painel da Faculdade">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
            <div>
              <h2 style="margin:0; font-size:1.4rem;">Sobrevivência Acadêmica & Linha do Tempo</h2>
              <p class="sub" style="margin:4px 0 0;">Prazo final de formatura fixado em <b><span id="fc-target-sem-display">2028/1</span></b>. Monitore matérias gargalo e foco semestral.</p>
            </div>
            <button class="btn main" id="fc-btn-nova-materia">+ Nova Matéria</button>
          </div>
          <div class="fc-summary-grid" id="fc-summary"></div>
        </section>

        <!-- Formulário de Adicionar / Editar Matéria -->
        <div class="mgs" id="fc-form-box" hidden>
          <h3 id="fc-form-title" style="margin:0 0 12px;">Adicionar Matéria da Faculdade</h3>
          <form id="fc-form">
            <input type="hidden" id="fc-id">
            <div class="fc-form-grid">
              <label>
                Nome da Matéria
                <input type="text" id="fc-name" required placeholder="Ex.: Análise de Algoritmos" maxlength="50">
              </label>
              <label>
                Oferta no Departamento
                <select id="fc-oferta">
                  <option value="todosem">Todo Semestre</option>
                  <option value="sem1">Apenas 1º Semestre</option>
                  <option value="sem2">Apenas 2º Semestre</option>
                </select>
              </label>
              <label>
                Nota Alvo
                <input type="number" id="fc-nota-alvo" min="5" max="10" step="0.5" value="7.0">
              </label>
              <label>
                Horas de Estudo Alvo (Meta)
                <input type="number" id="fc-horas-meta" min="5" max="200" step="5" value="35">
              </label>
              <label>
                Horas Estudadas Atuais
                <input type="number" id="fc-horas-est" min="0" max="200" step="1" value="0">
              </label>
              <label>
                Data da Próxima Prova
                <input type="date" id="fc-prova-data">
              </label>
              <label>
                Pré-requisitos
                <input type="text" id="fc-prereq" placeholder="Ex.: Estrutura de Dados">
              </label>
              <label style="flex-direction:row; align-items:center; gap:8px; margin-top:20px;">
                <input type="checkbox" id="fc-gargalo">
                <b>Matéria Gargalo / Caminho Crítico</b>
              </label>
              <label style="flex-direction:row; align-items:center; gap:8px; margin-top:20px;">
                <input type="checkbox" id="fc-pretende" checked>
                <b>Pretendo Passar Neste Semestre</b>
              </label>
            </div>
            <div class="fc-actions">
              <button type="button" class="btn" id="fc-btn-cancelar">Cancelar</button>
              <button type="submit" class="btn main">Salvar Matéria</button>
            </div>
          </form>
        </div>

        <!-- Grade de Matérias Cadastradas -->
        <div style="margin-top:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
            <h2 style="margin:0; font-size:1.25rem;">Matérias do Curso</h2>
            <div class="seg" id="fc-filter-seg">
              <button class="on" data-fc-filter="todos">Todas</button>
              <button data-fc-filter="semestre">Foco do Semestre</button>
              <button data-fc-filter="gargalos">🚨 Gargalos</button>
            </div>
          </div>
          <div class="sh-g" id="fc-grid"></div>
        </div>
      `;
      wrap.appendChild(pageDiv);
    }
  }

  /* --- 5. Renderização da Interface --- */
  let currentFilter = 'todos';

  function renderFaculdadeUI() {
    ensureDOM();
    const data = getFcData();
    const grid = document.getElementById('fc-grid');
    const summary = document.getElementById('fc-summary');
    const semDisplay = document.getElementById('fc-target-sem-display');

    if (!grid || !summary) return;

    if (semDisplay) semDisplay.textContent = data.targetSem || '2028/1';

    const totalMat = data.subs.length;
    const focoSemestre = data.subs.filter(s => s.pretendePassar && s.status !== 'concluida');
    const gargalosAtivos = data.subs.filter(s => s.gargalo && s.status !== 'concluida');
    const concluidas = data.subs.filter(s => s.status === 'concluida').length;

    let riscoStatus = 'ok';
    let riscoText = 'Linha do Tempo Segura';
    if (gargalosAtivos.length > 3) {
      riscoStatus = 'danger';
      riscoText = 'ALERTA: Muitos gargalos em aberto!';
    } else if (gargalosAtivos.some(g => !g.pretendePassar)) {
      riscoStatus = 'warn';
      riscoText = 'Gargalo Adiado: Risco de 2028/1';
    }

    summary.innerHTML = `
      <div class="fc-stat-card info">
        <b>${focoSemestre.length}</b>
        <span>Foco Neste Semestre</span>
      </div>
      <div class="fc-stat-card ${gargalosAtivos.length > 0 ? 'danger' : 'ok'}">
        <b>${gargalosAtivos.length}</b>
        <span>Gargalos Pendentes</span>
      </div>
      <div class="fc-stat-card ok">
        <b>${concluidas} / ${totalMat}</b>
        <span>Concluídas</span>
      </div>
      <div class="fc-stat-card ${riscoStatus}">
        <b>${riscoStatus === 'ok' ? '100%' : 'Atenção'}</b>
        <span>${riscoText}</span>
      </div>
    `;

    let subsFiltered = data.subs;
    if (currentFilter === 'semestre') {
      subsFiltered = data.subs.filter(s => s.pretendePassar);
    } else if (currentFilter === 'gargalos') {
      subsFiltered = data.subs.filter(s => s.gargalo);
    }

    if (!subsFiltered.length) {
      grid.innerHTML = `
        <div class="empty" style="grid-column:1/-1;">
          <b>🎓</b>
          <p>Nenhuma matéria encontrada com o filtro selecionado.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = subsFiltered.map(sub => {
      const prev = calcPrevisao(sub);

      const ofertaText = {
        'todosem': 'Todo Semestre',
        'sem1': 'Apenas 1º Semestre',
        'sem2': 'Apenas 2º Semestre'
      }[sub.oferta] || 'Todo Semestre';

      return `
        <div class="fc-card ${prev.halo}">
          <div class="fc-card-header">
            <div>
              <h3 class="fc-card-title">${sub.name}</h3>
              <div class="fc-card-sub">Oferta: <b>${ofertaText}</b> ${sub.prereq ? '· Req: ' + sub.prereq : ''}</div>
            </div>
            <button class="ghost" data-fc-edit="${sub.id}" title="Editar">✏️</button>
          </div>

          <div class="fc-badges">
            ${sub.gargalo ? '<span class="fc-badge gargalo">🚨 Caminho Crítico</span>' : ''}
            ${sub.pretendePassar 
                ? '<span class="fc-badge passar">🎯 Pretendo Passar Este Semestre</span>' 
                : '<span class="fc-badge adiada">⏸️ Adiada / Sem Cobre neste sem.</span>'}
            ${sub.status === 'concluida' ? '<span class="fc-badge passar">✓ Concluída</span>' : ''}
          </div>

          <label class="fc-toggle-passar">
            <span>Passar neste semestre?</span>
            <input type="checkbox" data-fc-toggle-id="${sub.id}" ${sub.pretendePassar ? 'checked' : ''} ${sub.status === 'concluida' ? 'disabled' : ''}>
          </label>

          <div class="fc-grade-box">
            <div>
              <small style="color:var(--muted); font-size:0.75rem; display:block;">Previsão de Nota</small>
              <span class="fc-grade-val ${prev.color}">${prev.label}</span>
            </div>
            ${sub.provaData ? `
              <div style="text-align:right;">
                <small style="color:var(--muted); font-size:0.75rem; display:block;">Prova</small>
                <b style="font-size:0.85rem;">${sub.provaData.split('-').reverse().join('/')}</b>
                ${prev.diasAteProva !== null ? `<br><small style="color:${prev.diasAteProva <= 7 ? '#e5484d' : 'var(--muted)'};">(${prev.diasAteProva}d restantes)</small>` : ''}
              </div>
            ` : ''}
          </div>

          ${sub.pretendePassar && sub.status !== 'concluida' ? `
            <div style="font-size:0.8rem; color:var(--muted); display:flex; justify-content:space-between; align-items:center;">
              <span>Horas: <b>${sub.horasEstudadas || 0}h</b> / ${sub.horasMeta}h</span>
              <div>
                <button class="btn" style="padding:2px 8px; font-size:0.75rem;" data-fc-addh="${sub.id}" data-fc-val="-1">-1h</button>
                <button class="btn main" style="padding:2px 8px; font-size:0.75rem;" data-fc-addh="${sub.id}" data-fc-val="1">+1h</button>
              </div>
            </div>
          ` : ''}

          <div style="font-size:0.78rem; color:var(--muted); font-style:italic;">
            ${prev.alertMsg}
          </div>
        </div>
      `;
    }).join('');
  }

  /* --- 6. Roteador de Navegação Autônomo e Handlers de Eventos --- */
  // USAMOS FASE DE CAPTURA (useCapture = true) E stopImmediatePropagation() PARA EVITAR INTERFERÊNCIA DO CORE.JS
  document.addEventListener('click', e => {
    // A) NAVEGAÇÃO AUTÔNOMA: Clique no botão "🎓 Área Faculdade" do topo
    const navBtn = e.target.closest('[data-p="faculdade"]');
    if (navBtn) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      window.curPage = 'faculdade';

      // Esconder a home e todas as outras páginas
      const home = document.getElementById('home');
      if (home) home.hidden = true;
      document.querySelectorAll('.page').forEach(p => p.hidden = true);

      // Mostrar a página da faculdade
      ensureDOM();
      const pgFc = document.getElementById('pg-faculdade');
      if (pgFc) pgFc.hidden = false;

      renderFaculdadeUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // B) NAVEGAÇÃO AUTÔNOMA: Clique no botão "← Início" dentro da Área da Faculdade
    const backBtn = e.target.closest('#pg-faculdade [data-a="back"]');
    if (backBtn) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      window.curPage = 'home';

      const pgFc = document.getElementById('pg-faculdade');
      if (pgFc) pgFc.hidden = true;

      const home = document.getElementById('home');
      if (home) home.hidden = false;

      if (typeof window.render === 'function') {
        window.render();
      }
      return;
    }

    // C) Filtros de Matérias
    const filterBtn = e.target.closest('[data-fc-filter]');
    if (filterBtn) {
      currentFilter = filterBtn.dataset.fcFilter;
      document.querySelectorAll('#fc-filter-seg button').forEach(b => b.classList.remove('on'));
      filterBtn.classList.add('on');
      renderFaculdadeUI();
      return;
    }

    // D) Toggle "Pretendo Passar"
    const toggleInput = e.target.closest('[data-fc-toggle-id]');
    if (toggleInput) {
      const id = toggleInput.dataset.fcToggleId;
      const data = getFcData();
      const sub = data.subs.find(s => s.id === id);
      if (sub) {
        sub.pretendePassar = toggleInput.checked;
        saveFcData(data);
        if (typeof window.toast === 'function') {
          window.toast(sub.pretendePassar ? `🎯 ${sub.name}: Marcada para passar este semestre!` : `⏸️ ${sub.name}: Adiada para semestres futuros.`);
        }
        renderFaculdadeUI();
      }
      return;
    }

    // E) Ajuste Rápido de Horas (+1h / -1h)
    const addHBtn = e.target.closest('[data-fc-addh]');
    if (addHBtn) {
      const id = addHBtn.dataset.fcAddh;
      const delta = parseInt(addHBtn.dataset.fcVal, 10) || 0;
      const data = getFcData();
      const sub = data.subs.find(s => s.id === id);
      if (sub) {
        sub.horasEstudadas = Math.max(0, (sub.horasEstudadas || 0) + delta);
        saveFcData(data);
        renderFaculdadeUI();
      }
      return;
    }

    // F) Abrir Formulário de Adicionar
    if (e.target.closest('#fc-btn-nova-materia')) {
      const formBox = document.getElementById('fc-form-box');
      const form = document.getElementById('fc-form');
      if (formBox && form) {
        form.reset();
        document.getElementById('fc-id').value = '';
        document.getElementById('fc-form-title').textContent = 'Adicionar Matéria da Faculdade';
        formBox.hidden = false;
        formBox.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // G) Cancelar Formulário
    if (e.target.closest('#fc-btn-cancelar')) {
      const formBox = document.getElementById('fc-form-box');
      if (formBox) formBox.hidden = true;
      return;
    }

    // H) Editar Matéria
    const editBtn = e.target.closest('[data-fc-edit]');
    if (editBtn) {
      const id = editBtn.dataset.fcEdit;
      const data = getFcData();
      const sub = data.subs.find(s => s.id === id);
      if (sub) {
        document.getElementById('fc-id').value = sub.id;
        document.getElementById('fc-name').value = sub.name;
        document.getElementById('fc-oferta').value = sub.oferta || 'todosem';
        document.getElementById('fc-nota-alvo').value = sub.notaAlvo || 7.0;
        document.getElementById('fc-horas-meta').value = sub.horasMeta || 35;
        document.getElementById('fc-horas-est').value = sub.horasEstudadas || 0;
        document.getElementById('fc-prova-data').value = sub.provaData || '';
        document.getElementById('fc-prereq').value = sub.prereq || '';
        document.getElementById('fc-gargalo').checked = !!sub.gargalo;
        document.getElementById('fc-pretende').checked = !!sub.pretendePassar;

        const formBox = document.getElementById('fc-form-box');
        document.getElementById('fc-form-title').textContent = 'Editar Matéria';
        formBox.hidden = false;
        formBox.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
  }, true); // true = Use Capture (executa ANTES de qualquer outro listener da página)

  // Evento de Submissão do Formulário
  document.addEventListener('submit', e => {
    if (e.target && e.target.id === 'fc-form') {
      e.preventDefault();
      const data = getFcData();
      const id = document.getElementById('fc-id').value;
      const name = document.getElementById('fc-name').value.trim();

      if (!name) return;

      const subData = {
        id: id || ('fc_' + Date.now()),
        name,
        oferta: document.getElementById('fc-oferta').value,
        notaAlvo: parseFloat(document.getElementById('fc-nota-alvo').value) || 7.0,
        horasMeta: parseInt(document.getElementById('fc-horas-meta').value, 10) || 35,
        horasEstudadas: parseInt(document.getElementById('fc-horas-est').value, 10) || 0,
        provaData: document.getElementById('fc-prova-data').value,
        prereq: document.getElementById('fc-prereq').value.trim(),
        gargalo: document.getElementById('fc-gargalo').checked,
        pretendePassar: document.getElementById('fc-pretende').checked,
        status: 'cursando'
      };

      if (id) {
        const idx = data.subs.findIndex(s => s.id === id);
        if (idx !== -1) data.subs[idx] = { ...data.subs[idx], ...subData };
      } else {
        data.subs.push(subData);
      }

      saveFcData(data);
      document.getElementById('fc-form-box').hidden = true;
      if (typeof window.toast === 'function') {
        window.toast('🎓 Matéria salva com sucesso!');
      }
      renderFaculdadeUI();
    }
  });

  /* --- 7. Sobrescrita Segura da Função render() do Sistema --- */
  const _origRender = window.render;
  window.render = function() {
    if (typeof _origRender === 'function') {
      try {
        _origRender.apply(this, arguments);
      } catch (err) {
        console.error('Erro na renderização original:', err);
      }
    }
    try {
      if (window.curPage === 'faculdade') {
        renderFaculdadeUI();
      }
    } catch (err) {
      console.error('Erro na renderização da Faculdade:', err);
    }
  };

  // Executar imediatamente e também ao carregar a página
  ensureDOM();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDOM);
  }
})();
