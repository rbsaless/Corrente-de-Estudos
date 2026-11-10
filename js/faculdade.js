/* ===== Módulo Faculdade (Roteamento Seguro & Gestão de Matérias UFES) ===== */
(() => {
  const $$ = id => document.getElementById(id);
  const PAGE_ID = 'pg-faculdade';
  const ROUTE_HASH = '#faculdade';

  // State local e integração com o estado global S
  const getFaculdadeData = () => {
    if (typeof window.S === 'undefined') window.S = {};
    if (!window.S.faculdade || typeof window.S.faculdade !== 'object') {
      window.S.faculdade = {
        materias: [
          { id: 'tcc2', nome: 'TCC II', codigo: 'DCOMP', periodo: '8º', status: 'em_andamento', progresso: 65, nota: 0 },
          { id: 'ic_nilm', nome: 'Iniciação Científica (NILM)', codigo: 'IC', periodo: '8º', status: 'em_andamento', progresso: 80, nota: 0 }
        ]
      };
    }
    return window.S.faculdade;
  };

  // Helper de salvamento
  const saveData = () => {
    if (typeof window.save === 'function') {
      window.save();
    } else {
      localStorage.setItem('corrente_estudos_data', JSON.stringify(window.S));
    }
  };

  // 1. Renderização da Interface Interna da Faculdade
  function renderFaculdadeUI() {
    const container = $$('faculdade-content') || $$(PAGE_ID);
    if (!container) return;

    const data = getFaculdadeData();

    // Se a estrutura base do container não existir, monta o layout
    let listEl = $$('faculdade-list');
    if (!listEl) {
      container.innerHTML = `
        <div class="faculdade-container" style="padding: 16px;">
          <header class="faculdade-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; font-size: 1.4rem;">🎓 Área Acadêmica - Faculdade</h2>
              <p style="margin: 4px 0 0; opacity: 0.8; font-size: 0.9rem;">Acompanhamento de matérias, trabalhos e projetos</p>
            </div>
            <button id="btn-add-materia" class="btn main" type="button">+ Nova Matéria</button>
          </header>

          <div id="faculdade-alerts"></div>

          <main id="faculdade-list" class="faculdade-grid" style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          </main>
        </div>
      `;
      listEl = $$('faculdade-list');
    }

    // Renderiza a lista de matérias
    if (listEl) {
      if (!data.materias || data.materias.length === 0) {
        listEl.innerHTML = `<p class="sub" style="grid-column: 1/-1; text-align: center; padding: 20px;">Nenhuma matéria cadastrada ainda.</p>`;
      } else {
        listEl.innerHTML = data.materias.map(m => `
          <div class="card materia-card" data-id="${m.id}" style="border: 1px solid var(--line, #444); border-radius: 12px; padding: 14px; background: var(--bg-card, rgba(255,255,255,0.03));">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <h3 style="margin: 0; font-size: 1.1rem;">${m.nome}</h3>
              <span class="badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.1);">${m.periodo || 'UFES'}</span>
            </div>
            <p style="margin: 0 0 10px; font-size: 0.85rem; opacity: 0.75;">Código/Proc: ${m.codigo || '-'}</p>
            <div class="progress-bar-bg" style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 10px;">
              <div class="progress-bar-fill" style="width: ${m.progresso || 0}%; height: 100%; background: #ffb347; transition: width 0.3s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
              <span>Progresso: <b>${m.progresso || 0}%</b></span>
              <button class="btn ghost btn-detalhes-materia" data-id="${m.id}" type="button">Ver Detalhes</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // 2. Controle Único e Seguro de Rota (Evita Piscada e Suporta F5)
  function checkAndRenderRoute() {
    const isTargetPage = (location.hash === ROUTE_HASH);
    const targetEl = $$(PAGE_ID);

    if (!targetEl) return;

    if (isTargetPage) {
      // Oculta todas as outras páginas sem passar pelo fallback do core.js
      document.querySelectorAll('.page').forEach(page => {
        if (page.id !== PAGE_ID) {
          page.hidden = true;
        }
      });

      // Exibe a página da faculdade de forma limpa e direta
      targetEl.hidden = false;

      // Executa a atualização da interface
      renderFaculdadeUI();
    }
  }

  // 3. Delegation de Eventos de Clique (Evita múltiplos listeners e conflito de duplo clique)
  document.addEventListener('click', (e) => {
    // Intercepta o clique no menu de navegação da faculdade
    const navBtn = e.target.closest('a[href="#faculdade"], [data-route="faculdade"]');
    if (navBtn) {
      e.preventDefault();
      if (location.hash !== ROUTE_HASH) {
        location.hash = ROUTE_HASH;
      } else {
        checkAndRenderRoute();
      }
      return;
    }

    // Botão Adicionar Matéria
    if (e.target.closest('#btn-add-materia')) {
      const nome = prompt('Nome da Matéria:');
      if (nome && nome.trim()) {
        const data = getFaculdadeData();
        const newId = 'mat_' + Date.now().toString(36);
        data.materias.push({
          id: newId,
          nome: nome.trim(),
          codigo: 'UFES',
          periodo: '2026/2',
          status: 'em_andamento',
          progresso: 0,
          nota: 0
        });
        saveData();
        renderFaculdadeUI();
      }
    }
  });

  // 4. Escuta Mudanças de Rota (Hashchange)
  window.addEventListener('hashchange', () => {
    setTimeout(() => {
      checkAndRenderRoute();
    }, 10);
  });

  // 5. Inicialização (Suporta recarregamento F5)
  const init = () => {
    checkAndRenderRoute();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
