/* ===== Calendário no estilo Google Agenda =====
   Três colunas: mini calendário (esquerda) · visão mensal/semanal (centro) · Tarefas (direita).
   Substitui renderCal/renderWeek (contratos-feed.js / semana-historico.js) mantendo as mesmas
   classes e data-attributes usados por arrastar-e-soltar, criação por clique e diálogo de tarefa. */
(function () {
  "use strict";
  const ls = (k, v) => {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) {}
    return null;
  };
  const GHH = 48; /* altura de 1 hora na grade semanal (px) */
  let side = ls("corrente-gc-side"),
    tasks = ls("corrente-gc-tasks"),
    TF = "all",
    showDone = false,
    miniM = null,
    miniFor = "",
    lastView = "",
    early = 420; /* minuto inicial do scroll semanal */
  side = side === null ? window.innerWidth >= 900 : side === "1";
  tasks = tasks === null ? window.innerWidth >= 1100 : tasks === "1";

  /* ---------- utilitários ---------- */
  const I = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
    caret: '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>',
    task: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    close:
      '<svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
    addTask:
      '<svg viewBox="0 0 24 24"><path d="M22 5.18 10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c1.57 0 3.04.46 4.28 1.25l1.45-1.45A10.02 10.02 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.73 0 3.36-.44 4.78-1.22l-1.5-1.5c-1 .46-2.11.72-3.28.72zM19 15h-3v2h3v3h2v-3h3v-2h-3v-3h-2v3z"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
  };
  const caps = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const mAb = (i) => MESES[i].slice(0, 3) + ".";
  /* cor do texto legível sobre a cor da matéria */
  const ink = (c) => {
    c = String(c || "").replace("#", "");
    if (c.length === 3) c = c.replace(/./g, (x) => x + x);
    const n = parseInt(c, 16);
    if (isNaN(n)) return "#fff";
    const L =
      (0.299 * ((n >> 16) & 255) +
        0.587 * ((n >> 8) & 255) +
        0.114 * (n & 255)) /
      255;
    return L > 0.62 ? "#1f1f1f" : "#fff";
  };
  const gmt = () => {
    const o = -new Date().getTimezoneOffset(),
      a = Math.abs(o);
    return (
      "GMT" +
      (o < 0 ? "-" : "+") +
      Math.floor(a / 60) +
      (a % 60 ? ":" + p2(a % 60) : "")
    );
  };
  const shiftM = (ym, v) => {
    const [y, m] = ym.split("-").map(Number);
    return fmt(new Date(y, m - 1 + v, 1, 12)).slice(0, 7);
  };
  const stl = (s) => `--c:${s.color};--k:${ink(s.color)}`;
  const onCal = () => curPage === "relatorio" && rTab === "cal";

  /* tarefas por dia (mensal ignora subtarefas concluídas, como antes) */
  function byDay(skipDoneSubs) {
    const by = {};
    allTasksV().forEach((o) => {
      if (!o.x.date) return;
      if (skipDoneSubs && o.x.sub && o.x.done) return;
      (by[o.x.date] = by[o.x.date] || []).push(o);
    });
    return by;
  }
  /* todas as tarefas e subtarefas são arrastáveis e editáveis por clique */
  const itemAttr = (s, x) => `data-sid='${s.id}' data-tid='${x.id}'`;

  /* ---------- barra superior ---------- */
  function topbar(t) {
    const wk = calV === "week",
      nav = wk ? "wnav" : "cnav";
    let title;
    if (wk) {
      const a = parse(calW),
        b = addD(a, 6);
      title =
        a.getMonth() === b.getMonth()
          ? `${caps(MESES[b.getMonth()])} de ${b.getFullYear()}`
          : a.getFullYear() === b.getFullYear()
            ? `${mAb(a.getMonth())} – ${mAb(b.getMonth())} de ${b.getFullYear()}`
            : `${mAb(a.getMonth())} de ${a.getFullYear()} – ${mAb(b.getMonth())} de ${b.getFullYear()}`;
    } else {
      const [y, m] = calM.split("-").map(Number);
      title = `${caps(MESES[m - 1])} de ${y}`;
    }
    const opt = (v, l) =>
      `<button type='button' role='menuitemradio' aria-checked='${calV === v}' class='${calV === v ? "on" : ""}' data-a='cview' data-v='${v}'>${l}</button>`;
    return `<header class='gc-top'>
 <button type='button' class='gc-ib' data-a='gcside' aria-label='Mostrar ou ocultar o painel lateral' aria-pressed='${side}'>${I.menu}</button>
 <div class='gc-brand' aria-hidden='true'><span class='gc-logo'>${+t.slice(8)}</span><span>Agenda</span></div>
 <button type='button' class='gc-pill' data-a='${nav}' data-v='0'>Hoje</button>
 <button type='button' class='gc-ib' data-a='${nav}' data-v='-1' aria-label='${wk ? "Semana anterior" : "Mês anterior"}'>${I.prev}</button>
 <button type='button' class='gc-ib' data-a='${nav}' data-v='1' aria-label='${wk ? "Próxima semana" : "Próximo mês"}'>${I.next}</button>
 <h2 class='gc-title'>${title}</h2>
 <span class='gc-sp'></span>
 <div class='gc-dd'><button type='button' class='gc-pill gc-ddb' data-a='gcdd' aria-haspopup='menu' aria-expanded='false'>${wk ? "Semana" : "Mês"}<span class='gc-car'>${I.caret}</span></button><div class='gc-menu' role='menu' hidden>${opt("month", "Mês")}${opt("week", "Semana")}</div></div>
 <div class='gc-seg' role='group' aria-label='Alternar entre agenda e tarefas'><button type='button' class='on' aria-label='Agenda' aria-pressed='true' title='Agenda'>${I.cal}</button><button type='button' class='${tasks ? "on" : ""}' data-a='gctasks' aria-label='Tarefas' aria-pressed='${tasks}' title='Tarefas'>${I.task}</button></div>
</header>`;
  }

  /* ---------- mini calendário (esquerda) ---------- */
  function mini(t) {
    const mainM =
      calV === "week" ? fmt(addD(parse(calW), 3)).slice(0, 7) : calM;
    if (miniFor !== mainM) {
      miniFor = mainM;
      miniM = mainM;
    }
    const [y, m] = miniM.split("-").map(Number),
      first = new Date(y, m - 1, 1, 12),
      start = monday(first),
      rows = Math.ceil(
        (((first.getDay() + 6) % 7) + new Date(y, m, 0).getDate()) / 7,
      ),
      wkSet =
        calV === "week"
          ? new Set(
              Array.from({ length: 7 }, (_, i) => fmt(addD(parse(calW), i))),
            )
          : null;
    let body = "";
    for (let r = 0; r < rows; r++) {
      let row = "",
        inW = false;
      for (let c = 0; c < 7; c++) {
        const d = addD(start, r * 7 + c),
          k = fmt(d);
        if (wkSet && wkSet.has(k)) inW = true;
        row += `<button type='button' class='gc-md${d.getMonth() !== m - 1 ? " out" : ""}${k === t ? " today" : ""}${k === calSel && k !== t ? " sel" : ""}' data-a='gcgo' data-k='${k}' aria-label='${d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}'>${d.getDate()}</button>`;
      }
      body += `<div class='gc-mr${inW ? " wk" : ""}'>${row}</div>`;
    }
    return `<div class='gc-mini'>
 <div class='gc-mh'><b>${caps(MESES[m - 1])} de ${y}</b><span><button type='button' class='gc-ib sm' data-a='gcmini' data-v='-1' aria-label='Mês anterior'>${I.prev}</button><button type='button' class='gc-ib sm' data-a='gcmini' data-v='1' aria-label='Próximo mês'>${I.next}</button></span></div>
 <div class='gc-mr gc-mw' aria-hidden='true'>${["S", "T", "Q", "Q", "S", "S", "D"].map((x) => `<span>${x}</span>`).join("")}</div>${body}</div>`;
  }

  /* ---------- painel de tarefas (direita) ---------- */
  function relTxt(n) {
    if (n <= 0) return "Hoje";
    if (n === 1) return "Ontem";
    if (n < 7) return n + " dias atrás";
    if (n < 30) {
      const w = Math.floor(n / 7);
      return w + (w === 1 ? " semana atrás" : " semanas atrás");
    }
    if (n < 365) {
      const mo = Math.floor(n / 30);
      return mo + (mo === 1 ? " mês atrás" : " meses atrás");
    }
    const a = Math.floor(n / 365);
    return a + (a === 1 ? " ano atrás" : " anos atrás");
  }
  const dLong = (k, t) => {
    const d = parse(k),
      n = diff(t, k);
    if (n === 0) return "Hoje";
    if (n === 1) return "Amanhã";
    return `${d.getDate()} de ${MESES[d.getMonth()]}${d.getFullYear() !== +t.slice(0, 4) ? " de " + d.getFullYear() : ""}`;
  };
  const dShort = (k, t) => {
    const d = parse(k),
      n = diff(t, k);
    if (n === 0) return "Hoje";
    if (n === 1) return "Amanhã";
    return `${d.getDate()} de ${mAb(d.getMonth())}${d.getFullYear() !== +t.slice(0, 4) ? " de " + d.getFullYear() : ""}`;
  };
  function tRow(s, x, t, kind) {
    let chip = "";
    if (x.date) {
      const late = !x.done && x.date < t;
      chip = `<span class='gc-chp${late ? " late" : ""}'>${I.clock}${late ? relTxt(diff(x.date, t)) : dShort(x.date, t)}${x.time ? ", " + esc(x.time) : ""}</span>`;
    }
    const body = `<div class='gc-tt'>${xn(x)}</div><div class='gc-tm'>${chip}<span class='gc-ts' title='${esc(s.name)}'>${esc(s.name)}</span></div>`;
    const ck = `<button type='button' class='gc-ck wk-chk' data-a='ctog' data-id='${s.id}' data-tid='${x.id}' aria-label='${x.done ? "Reabrir tarefa" : "Concluir tarefa"}'>${x.done ? "✓" : ""}</button>`;
    return `<div class='gc-tr wk-tc${x.done ? " dn" : ""}' data-sid='${s.id}' data-tid='${x.id}' style='--c:${s.color}'>${ck}<div class='gc-tb' role='button' tabindex='0' data-sid='${s.id}' data-tid='${x.id}'>${body}</div></div>`;
  }
  function tasksPanel(t) {
    const A = S.subjects.filter((s) => !s.arch);
    if (TF !== "all" && !A.some((s) => s.id === TF)) TF = "all";
    const all = allTasksV().filter(
        (o) => !o.s.arch && (TF === "all" || o.s.id === TF),
      ),
      cmp = (a, b) =>
        (a.x.date || "9999").localeCompare(b.x.date || "9999") ||
        (a.x.time || "99").localeCompare(b.x.time || "99") ||
        String(a.x.name).localeCompare(String(b.x.name)),
      open = all.filter((o) => !o.x.done).sort(cmp),
      done = all.filter((o) => o.x.done),
      late = open.filter((o) => o.x.date && o.x.date < t),
      fut = open.filter((o) => o.x.date && o.x.date >= t),
      nod = open.filter((o) => !o.x.date);
    let list = "";
    if (late.length)
      list += `<div class='gc-tsec late'>Anteriores</div>${late.map((o) => tRow(o.s, o.x, t)).join("")}`;
    const days = [...new Set(fut.map((o) => o.x.date))];
    days.forEach((k) => {
      list += `<div class='gc-tsec'>${dLong(k, t)}</div>${fut
        .filter((o) => o.x.date === k)
        .map((o) => tRow(o.s, o.x, t))
        .join("")}`;
    });
    if (nod.length)
      list += `<div class='gc-tsec'>Sem data</div>${nod.map((o) => tRow(o.s, o.x, t)).join("")}`;
    if (!list) list = `<p class='gc-te'>Nenhuma tarefa pendente. 🎉</p>`;
    const dn = done
      .sort((a, b) =>
        String(b.x.doneAt || "").localeCompare(String(a.x.doneAt || "")),
      )
      .slice(0, 30);
    const doneSec = done.length
      ? `<details class='gc-td' data-gc-det${showDone ? " open" : ""}><summary>Concluídas (${done.length})</summary>${dn.map((o) => tRow(o.s, o.x, t)).join("")}</details>`
      : "";
    return `<aside class='gc-tasks' aria-label='Tarefas'>
 <div class='gc-th'><div><span class='gc-tl2'>TAREFAS</span><label class='gc-sel'><select id='gc-tf' aria-label='Filtrar por matéria'><option value='all'>Todas as matérias</option>${A.map((s) => `<option value='${s.id}'${s.id === TF ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select><span class='gc-car'>${I.caret}</span></label></div>
 <button type='button' class='gc-ib sm' data-a='gctasks' aria-label='Fechar tarefas'>${I.close}</button></div>
 <button type='button' class='gc-add' data-a='gcadd'>${I.addTask}<span>Adicionar uma tarefa</span></button>
 <div class='gc-tl'>${list}${doneSec}</div></aside>`;
  }

  /* ---------- visão mensal ---------- */
  function month(t) {
    const [y, m] = calM.split("-").map(Number),
      first = new Date(y, m - 1, 1, 12),
      start = monday(first),
      total =
        Math.ceil(
          (((first.getDay() + 6) % 7) + new Date(y, m, 0).getDate()) / 7,
        ) * 7,
      by = byDay(true),
      studied = (k) => S.subjects.some((s) => k in s.days);
    let cells = "";
    for (let i = 0; i < total; i++) {
      const d = addD(start, i),
        k = fmt(d),
        L = by[k] || [],
        tot = allTot(k),
        rv = revN(k),
        mk = (studied(k) ? "🔥" : "") + (rv ? "🔁" + rv : ""),
        chips = L.map(
          ({ s, x }) =>
            `<div class='gc-chip mc${x.done ? " dn" : ""}' ${itemAttr(s, x)} style='${stl(s)}' title='${esc(s.name)}: ${xn(x).replace(/<[^>]*>/g, "")}'>${x.time ? `<em>${esc(x.time)}</em> ` : ""}<span>${xn(x)}</span></div>`,
        ).join("");
      cells += `<div class='cd gc-cell${k === t ? " today" : ""}${k === calSel ? " sel" : ""}${d.getMonth() !== m - 1 ? " out" : ""}' data-a='cday' data-k='${k}' style='${tot ? `--heat:${Math.min(16, Math.max(3, Math.round((tot / 120) * 16)))}%` : ""}' aria-label='${br(k)}: ${L.length} tarefa${pl(L.length)}'>
 <div class='gc-dh'>${i < 7 ? `<span class='gc-wl'>${DIAS[i].toUpperCase()}.</span>` : ""}<span class='gc-dn'>${d.getDate() === 1 ? d.getDate() + " " + mAb(d.getMonth()) : d.getDate()}</span></div>${mk ? `<span class='gc-mk'>${mk}</span>` : ""}
 <div class='gc-cc'>${chips}</div></div>`;
    }
    return `<div class='gc-mg' style='grid-template-rows:repeat(${total / 7},minmax(0,1fr))'>${cells}</div>`;
  }

  /* ---------- visão semanal ---------- */
  function week(t) {
    const mon = parse(calW),
      days = Array.from({ length: 7 }, (_, i) => fmt(addD(mon, i))),
      by = {};
    allTasksV().forEach((o) => {
      if (o.x.date) (by[o.x.date] = by[o.x.date] || []).push(o);
    });
    const W = (wkInfo = wkStudy(days));
    TOFF = 0;
    TEND = 1440;
    wkFull = true;
    HH = GHH;
    wkHH = GHH;
    const span = 1440;
    /* primeiro horário usado na semana (define o scroll inicial) */
    let ra = 1440;
    days.forEach((k) => {
      (by[k] || [])
        .filter((o) => o.x.time)
        .forEach((o) => (ra = Math.min(ra, hmin(o.x.time))));
      (W.ss[k] || []).forEach((z) => (ra = Math.min(ra, z.a)));
    });
    early = ra < 1440 ? Math.min(ra, 8 * 60) : 7 * 60;
    const head = days
      .map(
        (k, i) =>
          `<div class='gc-wd${k === t ? " today" : ""}${k === calSel ? " sel" : ""}' data-a='wsel' data-k='${k}'><span>${DIAS[i].toUpperCase()}.</span><b>${+k.slice(8)}</b></div>`,
      )
      .join("");
    const adr = days
      .map((k) => {
        const L = (by[k] || []).filter((o) => !o.x.time),
          tk = L.map(
            ({ s, x }) =>
              `<div class='wk-chip${x.done ? " dn" : ""}' ${itemAttr(s, x)} style='${stl(s)}' title='${esc(s.name)}: ${xn(x).replace(/<[^>]*>/g, "")}'>${x.done ? "✓ " : ""}${xn(x)}</div>`,
          ).join(""),
          sd = (W.un[k] || [])
            .map(
              (u) =>
                `<div class='wk-sd' data-a='wss' data-sid='${u.s.id}' data-k='${k}' data-i='u' style='${stl(u.s)}' title='${esc(u.s.name)}: ${u.m ? hh(u.m) + " estudadas (sem hora)" : "estudo registrado (sem hora)"}'>⏱ ${u.m ? hh(u.m) + " · " : ""}${esc(u.s.name)}</div>`,
            )
            .join("");
        return `<div class='wk-ad' data-day='${k}'>${tk}${sd}</div>`;
      })
      .join("");
    const axis = Array.from(
      { length: 23 },
      (_, i) => `<span style='top:${(i + 1) * HH}px'>${p2(i + 1)}:00</span>`,
    ).join("");
    const cols = days
      .map((k) => {
        const L = (by[k] || []).filter((o) => o.x.time),
          SL = W.ss[k] || [],
          MV = Math.ceil((18 / HH) * 60),
          ovl = L.some((o) => {
            const a1 = hmin(o.x.time),
              b1 = a1 + Math.max(durOf(o.x), MV);
            return SL.some((z) => z.a < b1 && a1 < Math.max(z.b, z.a + MV));
          }),
          ln = ovl
            ? { pl: [0, 56], rl: [56, 44] }
            : { pl: [0, 100], rl: [0, 100] };
        const evs = layoutDay(L)
          .map(({ o, a, b, c, n }) => {
            const { s, x } = o,
              top = (a / 60) * HH,
              hgt = Math.max(((b - a) / 60) * HH, 16),
              w = ln.pl[1] / n,
              rng = `${mhm(a)}–${mhm(Math.min(b, 1440))}`;
            return `<div class='wk-ev${x.done ? " dn" : ""}' data-sid='${s.id}' data-tid='${x.id}' style='${stl(s)};top:${top}px;height:${hgt - 1}px;left:calc(${ln.pl[0] + c * w}% + 1px);width:calc(${w}% - 3px)' title='${esc(s.name)}: ${xn(x).replace(/<[^>]*>/g, "")}${x.done ? " (concluída)" : ""} · ${rng}'><button type='button' class='wk-chk' data-a='ctog' data-id='${s.id}' data-tid='${x.id}' aria-label='${x.done ? "Reabrir tarefa" : "Concluir tarefa"}'>${x.done ? "✓" : ""}</button><div class='wk-t'>${xn(x)}</div>${hgt >= 34 && n < 3 ? `<small>${rng} · ${esc(s.name)}</small>` : ""}<div class='wk-rs' aria-hidden='true'></div></div>`;
          })
          .join("");
        const ssh = layoutBlocks(
          SL.map((z, i) => ({ z, i, a: z.a, b: Math.min(z.b, 1440) })),
        )
          .map(({ z, i, a, b, c, n }) => {
            const top = (a / 60) * HH,
              hgt = Math.max(((b - a) / 60) * HH, 16),
              w = ln.rl[1] / n,
              rng = `${mhm(a)}–${mhm(Math.min(b, 1440))}`;
            return `<div class='wk-ss' data-a='wss' data-sid='${z.s.id}' data-k='${k}' data-i='${i}' style='${stl(z.s)};top:${top}px;height:${hgt - 1}px;left:calc(${ln.rl[0] + c * w}% + 1px);width:calc(${w}% - 3px)' title='⏱ ${esc(z.s.name)} · ${rng}'><b>${esc(z.s.name)}</b>${hgt >= 34 && n < 3 ? `<small>${rng}</small>` : ""}</div>`;
          })
          .join("");
        return `<div class='wk-col${k === t ? " today" : ""}' data-a='wslot' data-day='${k}' style='--hh:${HH}px;height:${(span / 60) * HH}px'>${evs}${ssh}${k === t ? "<div class='wk-now' id='wkNow'></div>" : ""}</div>`;
      })
      .join("");
    return `<div class='gc-wsc' id='wkSc'>
 <div class='gc-wr gc-whd'><div class='gc-gmt'>${gmt()}</div>${head}</div>
 <div class='gc-wr gc-wad'><div class='gc-adl'></div>${adr}</div>
 <div class='gc-wr gc-wb'><div class='gc-ax' style='height:${(span / 60) * HH}px'>${axis}</div>${cols}</div></div>`;
  }

  /* ---------- montagem ---------- */
  function renderCal() {
    const el = $("#cal");
    if (!el) return;
    const t = fmt(now());
    if (!calSel) calSel = t;
    if (!calM) calM = t.slice(0, 7);
    if (!calW) calW = fmt(monday(parse(calSel)));
    if (lastView !== calV) {
      lastView = calV;
      if (calV === "week") wkScroll = null;
    }
    document.body.classList.toggle("gc-full", onCal());
    const oldSc = el.querySelector("#wkSc"),
      oldTl = el.querySelector(".gc-tl"),
      keepS = oldSc ? oldSc.scrollTop : null,
      keepT = oldTl ? oldTl.scrollTop : 0;
    const wk = calV === "week",
      main = wk ? week(t) : month(t),
      legend = wk
        ? `<div class='gc-lg'><span><i></i>planejado (tarefas; concluídas ficam riscadas)</span><span><i class='r'></i>realizado (cronômetro e registros)</span></div>`
        : "";
    el.innerHTML = `<div class='gc${side ? "" : " noside"}${tasks ? "" : " notasks"}' data-v='${calV}'>
 ${topbar(t)}
 <div class='gc-body'>
  <aside class='gc-side'><button type='button' class='gc-create' data-a='gccreate'>${I.plus}<span>Criar</span></button>${mini(t)}</aside>
  <section class='gc-main' aria-label='${wk ? "Visão semanal" : "Visão mensal"}'>${main}</section>
  ${tasksPanel(t)}
  <nav class='gc-rail' aria-label='Painéis'><button type='button' class='${tasks ? "on" : ""}' data-a='gctasks' aria-label='Tarefas' aria-pressed='${tasks}' title='Tarefas'>${I.task}</button></nav>
 </div></div>
 <div class='cal gc-day'><div class='wk-day'>${dayTop()}${dayStudy()}</div>${legend}</div>`;
    const sc = el.querySelector("#wkSc"),
      tl = el.querySelector(".gc-tl");
    if (sc && keepS !== null && wkScroll !== null) sc.scrollTop = keepS;
    if (tl) tl.scrollTop = keepT;
    requestAnimationFrame(fit);
  }

  /* depois do layout: altura total, "+N mais" no mensal, scroll inicial no semanal */
  function fit() {
    const el = $("#cal"),
      g = el && el.querySelector(".gc");
    if (!g || !onCal() || !g.offsetParent) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    g.style.setProperty(
      "--gc-h",
      Math.max(520, Math.round(window.innerHeight - top - 14)) + "px",
    );
    g.querySelectorAll(".gc-cell").forEach((c) => {
      const cc = c.querySelector(".gc-cc"),
        ch = [...cc.children];
      if (!ch.length) return;
      const avail = c.clientHeight - c.querySelector(".gc-dh").offsetHeight - 6,
        cap = Math.max(1, Math.floor(avail / 22));
      if (ch.length <= cap) return;
      const vis = Math.max(0, cap - 1);
      ch.forEach((x, i) => {
        if (i >= vis) x.hidden = true;
      });
      const more = document.createElement("button");
      more.type = "button";
      more.className = "gc-more";
      more.dataset.a = "gcmore";
      more.dataset.k = c.dataset.k;
      more.textContent = `+${ch.length - vis} mais`;
      cc.appendChild(more);
    });
    const sc = $("#wkSc");
    if (sc) {
      if (wkScroll === null) {
        const k = fmt(now()),
          inWk = calW <= k && k <= fmt(addD(parse(calW), 6)),
          n = new Date().getHours() * 60 + new Date().getMinutes();
        let y = ((early - 60) / 60) * HH;
        if (
          inWk &&
          (n < early - 60 || n > early - 60 + (sc.clientHeight / HH) * 60 - 90)
        )
          y = (n / 60) * HH - sc.clientHeight * 0.4;
        sc.scrollTop = Math.max(0, y);
        wkScroll = 0;
      }
    }
    if (typeof updNow === "function") updNow();
  }
  window.addEventListener("resize", () => {
    clearTimeout(fit.t);
    fit.t = setTimeout(() => {
      if (onCal()) renderCal();
    }, 150);
  });

  /* ---------- popover "+N mais" ---------- */
  function closePop() {
    document.querySelectorAll(".gc-pop").forEach((x) => x.remove());
  }
  function openPop(b) {
    closePop();
    const k = b.dataset.k,
      L = byDay(true)[k] || [],
      host = b.closest(".gc-main"),
      cell = b.closest(".gc-cell");
    if (!host || !cell) return;
    const hr = host.getBoundingClientRect(),
      cr = cell.getBoundingClientRect(),
      d = parse(k),
      p = document.createElement("div");
    p.className = "gc-pop";
    p.setAttribute("role", "dialog");
    p.setAttribute("aria-label", "Tarefas de " + br(k));
    p.innerHTML = `<button type='button' class='gc-ib sm gc-px' data-a='gcpopx' aria-label='Fechar'>${I.close}</button><div class='gc-ph'><span>${DIAS[(d.getDay() + 6) % 7].toUpperCase()}.</span><b>${d.getDate()}</b></div>${L.map(({ s, x }) => `<div class='gc-chip${x.done ? " dn" : ""}' data-a='tedit' data-id='${s.id}' data-tid='${x.id}' style='${stl(s)}'>${x.time ? `<em>${esc(x.time)}</em> ` : ""}<span>${xn(x)}</span></div>`).join("")}`;
    host.appendChild(p);
    const w = Math.max(240, cr.width + 20);
    p.style.width = w + "px";
    p.style.left =
      Math.max(4, Math.min(hr.width - w - 4, cr.left - hr.left - 10)) + "px";
    p.style.top =
      Math.max(
        4,
        Math.min(hr.height - p.offsetHeight - 4, cr.top - hr.top - 8),
      ) + "px";
  }

  /* ---------- ações ---------- */
  function persist() {
    ls("corrente-gc-side", side ? "1" : "0");
    ls("corrente-gc-tasks", tasks ? "1" : "0");
  }
  document.addEventListener("click", (e) => {
    const pop = e.target.closest(".gc-pop");
    if (!pop && !e.target.closest('[data-a="gcmore"]')) closePop();
    const dd = document.querySelector(".gc-menu:not([hidden])");
    if (dd && !e.target.closest(".gc-dd")) dd.hidden = true;
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    if (!a.startsWith("gc") && a !== "tedit") return;
    if (a === "tedit") {
      closePop();
      return;
    }
    if (a === "gcside") {
      side = !side;
      persist();
      renderCal();
    } else if (a === "gctasks") {
      tasks = !tasks;
      persist();
      renderCal();
    } else if (a === "gcdd") {
      const m = b.parentNode.querySelector(".gc-menu");
      m.hidden = !m.hidden;
      b.setAttribute("aria-expanded", String(!m.hidden));
    } else if (a === "gcmini") {
      miniM = shiftM(miniM, +b.dataset.v);
      renderCal();
    } else if (a === "gcgo") {
      const k = b.dataset.k;
      calSel = k;
      calM = k.slice(0, 7);
      calW = fmt(monday(parse(k)));
      if (window.innerWidth < 900) side = false;
      renderCal();
    } else if (a === "gccreate") {
      if (window.innerWidth < 900) {
        side = false;
        renderCal();
      }
      openTask("", null, calSel);
    } else if (a === "gcadd") {
      openTask("", null, calSel);
    } else if (a === "gcmore") {
      openPop(b);
    } else if (a === "gcpopx") {
      closePop();
    }
  });
  /* duplo clique num dia do mês cria uma tarefa nele */
  document.addEventListener("dblclick", (e) => {
    const c = e.target.closest(".gc-cell");
    if (!c || e.target.closest(".gc-chip,.gc-more")) return;
    openTask("", null, c.dataset.k);
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "gc-tf") {
      TF = e.target.value;
      renderCal();
    }
  });
  document.addEventListener(
    "toggle",
    (e) => {
      if (e.target.matches && e.target.matches("[data-gc-det]"))
        showDone = e.target.open;
    },
    true,
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePop();
    if (
      (e.key === "Enter" || e.key === " ") &&
      e.target.classList &&
      e.target.classList.contains("gc-tb")
    ) {
      e.preventDefault();
      openTask(e.target.dataset.sid, e.target.dataset.tid);
    }
  });

  window.renderCal = renderCal;
  window.renderWeek = renderCal;
})();
