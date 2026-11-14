/* ===== ETAPA 7: Contratos de Foco & Modo Tudo ou Nada ===== */
function cfCfg() {
  const c = (S.cf = S.cf && typeof S.cf === "object" ? S.cf : {});
  if (!window._tonInit) {
    window._tonInit = 1;
    c.allOrNothing = false;
  }
  c.allOrNothing = !!c.allOrNothing;
  c.tonPen = +c.tonPen > 0 ? +c.tonPen : 30;
  c.tonRew =
    c.tonRew === undefined ||
    c.tonRew === null ||
    !Number.isFinite(+c.tonRew) ||
    +c.tonRew < 0
      ? 25
      : +c.tonRew;
  c.contracts = Array.isArray(c.contracts) ? c.contracts : [];
  c.hist = Array.isArray(c.hist) ? c.hist : [];
  return c;
}
function cfEval() {
  const c = cfCfg(),
    t = fmt(now());
  let ch = false;
  c.contracts.forEach((k) => {
    if (k.status !== "active") return;
    const min = S.subjects.reduce(
      (a, s) =>
        a +
        Object.entries(s.days)
          .filter(([d]) => d >= k.start && d <= k.end)
          .reduce((x, [, m]) => x + m, 0),
      0,
    );
    k.currentMin = min;
    if (min >= k.targetMin) {
      k.status = "win";
      ch = true;
      if (k.rewardMin > 0)
        lzCfg().led.push({
          id: lzId(),
          t: Date.now(),
          type: "chal",
          min: k.rewardMin,
          note: `Prêmio do Contrato: ${k.name}`,
        });
      if (k.rewardXp > 0) (S.ch = chCfg()).adj.push({ d: t, v: k.rewardXp });
      c.hist.push({
        id: k.id,
        name: k.name,
        targetMin: k.targetMin,
        currentMin: min,
        res: "win",
        closedAt: t,
      });
      toast(`🏆 Contrato de Foco "${k.name}" cumprido com sucesso!`);
    } else if (t > k.end) {
      k.status = "fail";
      ch = true;
      if (k.penaltyMin > 0)
        lzCfg().led.push({
          id: lzId(),
          t: Date.now(),
          type: "pun",
          min: 0,
          owe: k.penaltyMin,
          note: `Punição do Contrato: ${k.name}`,
        });
      c.hist.push({
        id: k.id,
        name: k.name,
        targetMin: k.targetMin,
        currentMin: min,
        res: "fail",
        closedAt: t,
      });
      toast(
        `❌ Contrato de Foco "${k.name}" encerrado sem bater a meta. Punição aplicada.`,
      );
    }
  });
  if (ch) save();
  return ch;
}
function cfBanner() {
  const c = cfCfg(),
    active = c.contracts.filter((k) => k.status === "active");
  if (!active.length && !c.allOrNothing) return "";
  let html = "";
  if (c.allOrNothing) {
    html += `<div class="chband" style="background:var(--surface);color:var(--ink);border:1px solid var(--line);border-left:6px solid #e5484d"><span class="ton-badge">⚡ Modo Tudo ou Nada Ativado</span> <span>O timer exige 80%+ do tempo planejado para evitar perda de ${c.tonPen} min de lazer.</span></div>`;
  }
  if (active.length) {
    html += `<div class="pn" style="border-left:6px solid var(--flame)"><div class="dpt"><h3>📜 Contratos de Foco Ativos (${active.length})</h3><button class="btn" data-a="nav" data-p="contratos">Gerenciar contratos</button></div>`;
    active.forEach((k) => {
      const min = S.subjects.reduce(
        (a, s) =>
          a +
          Object.entries(s.days)
            .filter(([d]) => d >= k.start && d <= k.end)
            .reduce((x, [, m]) => x + m, 0),
        0,
      );
      const pct = Math.min(100, Math.floor((min / k.targetMin) * 100));
      html += `<div style="margin-top:8px"><div class="row"><b>${esc(k.name)}</b><span>${hh(min)} / ${hh(k.targetMin)} (${pct}%)</span></div><div class="goal" style="margin-top:4px"><div class="bar"><div style="width:${pct}%;height:100%;background:var(--flame);border-radius:6px"></div></div></div></div>`;
    });
    html += `</div>`;
  }
  return html;
}
function renderContratos() {
  const el = $("#cf-page");
  if (!el || curPage !== "relatorio" || !OBJ.includes(rTab)) return;
  const c = cfCfg(),
    t = fmt(now()),
    m = monday(now()),
    mEnd = fmt(addD(m, 6)),
    mStart = fmt(m);
  const active = c.contracts.filter((k) => k.status === "active");
  const form = `<div class="mgs"><h2>📜 Novo Contrato de Foco Semanal</h2><p class="sub" style="margin-top:0">Firme um compromisso formal para esta semana (${br(mStart)} a ${br(mEnd)}). Bater a meta libera prêmios; falhar aplica punições.</p>
 <div class="mgf"><div class="mgr"><label style="flex:1 1 220px">Nome do Contrato<input type="text" id="cf-n" maxlength="80" placeholder="Ex.: Contrato do Foco Total (12h na semana)" style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--ink)"></label><label>Meta de Estudo (horas)<input type="number" id="cf-h" min="1" max="100" value="10" style="width:90px"></label></div>
 <div class="mgr"><label>Recompensa ao Cumprir<select id="cf-rw"><option value="60l">+60 min de Lazer</option><option value="120l">+120 min de Lazer</option><option value="300xp">+300 XP na Sequência</option><option value="600xp">+600 XP na Sequência</option></select></label><label>Punição em caso de Falha<select id="cf-pn"><option value="30d">Dívida de 30 min de Lazer</option><option value="60d">Dívida de 60 min de Lazer</option><option value="90d">Dívida de 90 min de Lazer</option></select></label></div>
 <button class="btn main" data-cf="add">Firmar Contrato</button></div></div>`;
  const tonSec = `<div class="mgs"><h2>⚡ Modo Tudo ou Nada no Cronômetro</h2><p class="sub" style="margin-top:0">Exige que você cumpra pelo menos 80% da duração planejada em cada sessão do cronômetro. Se interromper antes, perde créditos de lazer.</p>
 <div class="mgf"><div class="mgr"><label class="lzck"><input type="checkbox" id="cf-ton" ${c.allOrNothing ? "checked" : ""}> Ativar Modo Tudo ou Nada globalmente no cronômetro</label><label>Penalidade por interrupção (min de lazer)<input type="number" id="cf-pen" min="5" max="120" step="5" value="${c.tonPen}" style="width:90px"></label><label>Prêmio por cumprir (% do tempo focado em lazer)<input type="number" id="cf-rew" min="0" max="200" step="5" value="${c.tonRew}" style="width:90px"></label></div>
 <button class="btn" data-cf="saveton">Salvar Ajustes do Modo</button></div></div>`;
  const activeCards = active.length
    ? active
        .map((k) => {
          const min = S.subjects.reduce(
            (a, s) =>
              a +
              Object.entries(s.days)
                .filter(([d]) => d >= k.start && d <= k.end)
                .reduce((x, [, m]) => x + m, 0),
            0,
          );
          const pct = Math.min(100, Math.floor((min / k.targetMin) * 100));
          return `<div class="cfc"><div class="cfh"><div class="cft">${esc(k.name)}<small>Período: ${br(k.start)} a ${br(k.end)} · Meta: ${hh(k.targetMin)}</small></div><button class="ghost danger" data-cf="cancel" data-id="${k.id}">Cancelar</button></div>
  <div class="mgb" style="display:flex;align-items:center;gap:10px;margin-top:10px"><div class="bar" style="flex:1;height:12px;background:var(--track);border-radius:8px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--flame);border-radius:8px"></div></div><span style="font-weight:800">${pct}%</span></div>
  <p class="sub" style="margin:8px 0 0">Progresso atual: <b>${hh(min)}</b> de ${hh(k.targetMin)}. ${min >= k.targetMin ? "🎉 Meta batida!" : `Faltam ${hh(k.targetMin - min)}.`}</p></div>`;
        })
        .join("")
    : '<p class="sub">Nenhum contrato ativo para esta semana.</p>';
  const activeSec = `<div class="mgs"><h2>📜 Contratos em Andamento</h2>${activeCards}</div>`;
  const histList =
    c.hist
      .slice()
      .reverse()
      .slice(0, 15)
      .map(
        (x) =>
          `<div class="lzrow"><span>${esc(x.name)}<small>Meta: ${hh(x.targetMin)} · Finalizado em ${br(x.closedAt)}</small></span><b class="${x.res === "win" ? "p" : "n"}">${x.res === "win" ? "✅ Cumprido" : "❌ Falhou"}</b></div>`,
      )
      .join("") || '<p class="sub">Nenhum contrato encerrado ainda.</p>';
  const histSec = `<div class="mgs"><h2>Histórico de Contratos</h2>${histList}</div>`;
  el.innerHTML = form + tonSec + activeSec + histSec;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cf]");
  if (!b) return;
  const a = b.dataset.cf,
    c = cfCfg();
  if (a === "add") {
    const name = ($("#cf-n").value || "").trim(),
      h = parseInt($("#cf-h").value) || 0;
    if (!name) {
      toast("Digite o nome do contrato.");
      $("#cf-n").focus();
      return;
    }
    if (h <= 0) {
      toast("Informe uma meta em horas maior que zero.");
      return;
    }
    const rw = $("#cf-rw").value,
      pn = $("#cf-pn").value;
    let rewardMin = 0,
      rewardXp = 0,
      penaltyMin = 0;
    if (rw === "60l") rewardMin = 60;
    else if (rw === "120l") rewardMin = 120;
    else if (rw === "300xp") rewardXp = 300;
    else if (rw === "600xp") rewardXp = 600;
    if (pn === "30d") penaltyMin = 30;
    else if (pn === "60d") penaltyMin = 60;
    else if (pn === "90d") penaltyMin = 90;
    const m = monday(now()),
      start = fmt(m),
      end = fmt(addD(m, 6));
    c.contracts.push({
      id: "c" + Date.now().toString(36),
      name,
      targetMin: h * 60,
      rewardMin,
      rewardXp,
      penaltyMin,
      start,
      end,
      status: "active",
      createdAt: Date.now(),
    });
    save();
    render();
    toast("Contrato de Foco firmado! Boa semana de estudos.");
  } else if (a === "saveton") {
    c.allOrNothing = $("#cf-ton").checked;
    c.tonPen = Math.max(5, parseInt($("#cf-pen").value) || 30);
    {
      const r = parseFloat($("#cf-rew").value);
      c.tonRew = Number.isFinite(r) && r >= 0 ? r : 25;
    }
    save();
    render();
    toast("Ajustes do Modo Tudo ou Nada salvos.");
  } else if (a === "cancel") {
    const k = c.contracts.find((x) => x.id === b.dataset.id);
    if (
      k &&
      confirm(`Cancelar o contrato "${k.name}"? Isso encerrará o compromisso.`)
    ) {
      k.status = "fail";
      c.hist.push({
        id: k.id,
        name: k.name,
        targetMin: k.targetMin,
        currentMin: k.currentMin || 0,
        res: "fail",
        closedAt: fmt(now()),
      });
      save();
      render();
      toast("Contrato cancelado.");
    }
  }
});

/* ===== Feed Dedicado de Aprendizados ===== */ /* NOVO v20 */
let feedSub = "all",
  feedSearch = "";
function renderFeed() {
  const el = $("#feed-sec");
  if (!el || curPage !== "feed") return;
  const A = S.subjects;
  const items = [];
  (S.log || []).forEach((x) => {
    if (!x.w) return;
    const s = A.find((sub) => sub.id === x.sid);
    if (!s) return;
    if (feedSub !== "all" && s.id !== feedSub) return;
    if (
      feedSearch &&
      !x.w.toLowerCase().includes(feedSearch.toLowerCase()) &&
      !s.name.toLowerCase().includes(feedSearch.toLowerCase())
    )
      return;
    items.push({ type: "log", d: x.d, h: x.h, m: x.m, f: x.f, w: x.w, s });
  });
  A.forEach((s) => {
    (s.topics || []).forEach((x) => {
      if (!x.note && !x.done) return;
      if (feedSub !== "all" && s.id !== feedSub) return;
      const text = x.name + (x.note ? " — " + x.note : "");
      if (
        feedSearch &&
        !text.toLowerCase().includes(feedSearch.toLowerCase()) &&
        !s.name.toLowerCase().includes(feedSearch.toLowerCase())
      )
        return;
      const d = x.doneAt || x.date || "";
      if (d)
        items.push({
          type: "topic",
          d,
          h: null,
          m: x.est || 0,
          f: 0,
          w: x.name + (x.note ? "\n" + x.note : ""),
          s,
          done: x.done,
        });
    });
  });
  items.sort((a, b) =>
    b.d > a.d ? 1 : b.d < a.d ? -1 : (b.h || 0) - (a.h || 0),
  );
  const opts =
    `<option value="all">Todas as matérias</option>` +
    A.map(
      (s) =>
        `<option value="${s.id}"${s.id === feedSub ? " selected" : ""}>${esc(s.name)}</option>`,
    ).join("");
  const list =
    items
      .map((item) => {
        return `<div class="mgc" style="--c:${item.s.color};margin-top:10px">
   <div class="mgh">
    <div class="mgt"><span class="sd">${esc(item.s.name)}</span> · ${bd(item.d)}${item.h != null ? " " + p2(item.h) + "h" : ""}${item.m ? " (" + hh(item.m) + ")" : ""}${item.f ? " · " + item.f + "★" : ""}</div>
   </div>
   <div style="font-weight:600;font-size:1.02rem;margin-top:6px;color:var(--ink);white-space:pre-wrap">${esc(item.w)}</div>
  </div>`;
      })
      .join("") ||
    '<p class="sub">Nenhum aprendizado encontrado com esses filtros.</p>';
  el.innerHTML = `<div class="mgs">
  <h2>💡 Feed Contínuo de Aprendizados</h2>
  <p class="sub" style="margin-top:0">Linha do tempo contínua com todas as sínteses do que você estudou e anotações para revisão rápida.</p>
  <div class="mgf"><div class="mgr">
   <label style="flex:1 1 200px">Filtrar por matéria<select id="fd-s">${opts}</select></label>
   <label style="flex:2 1 260px">Buscar nos aprendizados<input type="text" id="fd-q" value="${esc(feedSearch)}" placeholder="Digite uma palavra-chave..." style="background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--ink)"></label>
  </div></div>
  <p class="sub" style="margin-top:10px"><b>${items.length}</b> registro${pl(items.length)} de aprendizado encontrado${pl(items.length)}.</p>
  ${list}
 </div>`;
}
document.addEventListener("input", (e) => {
  if (e.target.id === "fd-q") {
    feedSearch = e.target.value;
    renderFeed();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "fd-s") {
    feedSub = e.target.value;
    renderFeed();
  }
});

function migrate() {
  chCfg();
  cfCfg();
  if (!S.xb || !S.xb.since) S.xb = { since: Date.now() };
  S.lz = lzCfg();
  S.mg = Array.isArray(S.mg) ? S.mg : [];
  S.rev = Array.isArray(S.rev) ? S.rev : [];
  S.log = Array.isArray(S.log) ? S.log : [];
  S.rw = Array.isArray(S.rw) ? S.rw : [];
  S.subjects.forEach((s) => {
    if (!s.goals) {
      const m = monday(now());
      s.goals = s.goal
        ? [
            {
              id: "g0",
              start: fmt(m),
              end: fmt(addD(m, 6)),
              target: Math.min(7, +s.goal || 5),
            },
          ]
        : [];
      delete s.goal;
    }
  });
}
function mkGoal(a, b, c) {
  const t = parseInt(c);
  if (!a || !b || !t)
    return { err: "Preencha início, fim e quantidade de dias." };
  if (b < a)
    return { err: "A data final precisa ser igual ou depois da inicial." };
  const span = diff(a, b) + 1;
  if (t > span)
    return {
      err: `Esse período tem só ${span} dia${pl(span)}. Reduza a meta.`,
    };
  return {
    g: { id: "g" + Date.now().toString(36), start: a, end: b, target: t },
  };
}
function goalInfo(s, g) {
  const t = fmt(now()),
    c = cnt(s, g),
    pct = Math.min(100, (c / g.target) * 100),
    need = g.target - c;
  let msg;
  if (need <= 0) msg = "Meta batida! 🎉";
  else if (t > g.end) msg = `Prazo encerrado. Faltaram ${need} dia${pl(need)}.`;
  else if (t < g.start) {
    const n = diff(t, g.start);
    msg = `Começa em ${n} dia${pl(n)}.`;
  } else {
    const av = diff(t, g.end) + (t in s.days ? 0 : 1);
    msg =
      need > av
        ? `Fora de alcance: faltam ${need} e restam ${av} dia${pl(av)}.`
        : `Faltam ${need} dia${pl(need)} de estudo em ${av} dia${pl(av)} restante${pl(av)}.`;
  }
  return { c, pct, msg };
}
function pickGoal(s) {
  const t = fmt(now()),
    gs = s.goals || [];
  const act = gs
    .filter((g) => g.start <= t && t <= g.end)
    .sort((a, b) => (a.end < b.end ? -1 : 1));
  if (act.length) return act[0];
  const up = gs
    .filter((g) => g.start > t)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  if (up.length) return up[0];
  return gs.slice().sort((a, b) => (a.end < b.end ? 1 : -1))[0];
}
function goalCard(s) {
  const g = pickGoal(s);
  if (!g)
    return '<div class="goal"><p><span>Sem meta definida. Crie uma ao abrir a matéria, na aba Metas.</span></p></div>';
  const i = goalInfo(s, g);
  return `<div class="goal"><p><span><b>${i.c} de ${g.target} dias</b> · ${br(g.start)} a ${br(g.end)}</span></p><div class="bar"><div style="width:${i.pct}%"></div></div><p class="gm">${i.msg}</p></div>`;
}
const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
function renderCal() {
  const el = $("#cal");
  if (!el) return;
  if (calV === "week") {
    renderWeek();
    return;
  }
  const t = fmt(now());
  if (!calM) calM = t.slice(0, 7);
  if (!calSel) calSel = t;
  const [y, m] = calM.split("-").map(Number),
    first = new Date(y, m - 1, 1, 12),
    start = monday(first);
  const total =
    Math.ceil((((first.getDay() + 6) % 7) + new Date(y, m, 0).getDate()) / 7) *
    7;
  const by = {};
  S.subjects.forEach((s) =>
    (s.topics || []).forEach((x) => {
      if (x.date) (by[x.date] = by[x.date] || []).push({ s, x });
    }),
  );
  const studied = (k) => S.subjects.some((s) => k in s.days);
  let cells = DIAS.map((d) => `<div class='cw'>${d}</div>`).join("");
  for (let i = 0; i < total; i++) {
    const d = addD(start, i),
      k = fmt(d),
      L = by[k] || [];
    cells += `<button class='cd${d.getMonth() !== m - 1 ? " out" : ""}${k === t ? " today" : ""}${k === calSel ? " sel" : ""}' data-a='cday' data-k='${k}' style='${allTot(k) ? `background:color-mix(in srgb,var(--flame) ${Math.min(34, Math.round((allTot(k) / 120) * 34))}%,var(--bg))` : ""}' aria-label='${br(k)}: ${L.length} tarefa${pl(L.length)}'><b>${d.getDate()}${studied(k) ? " 🔥" : ""}${revN(k) ? " 🔁" + revN(k) : ""}</b><span class='cc'>${L.slice(
      0,
      3,
    )
      .map(
        ({ s, x }) =>
          `<i class='mc${x.done ? " dn" : ""}' data-sid='${s.id}' data-tid='${x.id}' style='--c:${s.color}' title='${esc(s.name)}: ${xn(x)}'>${x.time ? x.time + " " : ""}${xn(x)}</i>`,
      )
      .join(
        "",
      )}${L.length > 3 ? `<em>+${L.length - 3} mais</em>` : ""}</span></button>`;
  }
  el.innerHTML = `<div class='cal-lay'><div class='cal-main'><div class='ch'><h2>${MESES[m - 1]} de ${y}</h2><div class='vt'>${viewSeg()}<span style='display:flex;gap:6px'><button class='btn' data-a='cnav' data-v='-1' aria-label='Mês anterior'>‹</button><button class='btn' data-a='cnav' data-v='0'>Hoje</button><button class='btn' data-a='cnav' data-v='1' aria-label='Próximo mês'>›</button></span></div></div>
 <div class='cg'>${cells}</div></div><aside class='cal-side'>${dayTop()}${dayStudy()}</aside></div>`;
}
