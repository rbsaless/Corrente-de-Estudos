/* ===== Awards: premiação anual. Carregar depois de como-funciona.js (e depois de ligas.js) =====
   Dados desde o 1º ano com estudo. Data de corte = dia anterior à cerimônia (padrão: cerimônia em 1º/jan do ano seguinte).
   Parciais congelam 60 dias antes da cerimônia. Resultado final fica salvo em S.aw.res[ano]. */
(() => {
  const MN = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const WDN = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];
  const GEN0 = [
    "outros",
    "others",
    "others (language)",
    "uf(outros)",
    "class",
    "curso",
  ];
  const SHN = {
    bst: "Boost",
    frz: "Congelar streak",
    min: "Reduzir mínimo",
    pdv: "Perdão de dívida",
    lzx: "Lazer extra",
  };
  const LANG0 = [
    "korean",
    "english",
    "japanese",
    "arabic",
    "chinese",
    "italian",
    "spanish",
    "french",
    "indu",
  ];
  const LV = ["", "Leve", "Forte", "Extremo"],
    LVR = { leve: 1, forte: 2, extremo: 3 };
  const FRZ = 60; /* dias antes da cerimônia em que as parciais congelam */
  const MEMO = {};
  const memo = (k, fn) => {
    const n = Date.now(),
      e = MEMO[k];
    if (e && n - e.t < 12e4) return e.v;
    const v = fn();
    MEMO[k] = { t: n, v };
    return v;
  };
  const clr = () => Object.keys(MEMO).forEach((k) => delete MEMO[k]);
  const addK = (k, n) => fmt(addD(parse(k), n)),
    mnS = (a, b) => (a < b ? a : b),
    mxS = (a, b) => (a > b ? a : b);
  const pn = (n, a, b) => Math.round(n) + " " + (Math.round(n) === 1 ? a : b);
  const F = {
    min: (v) => hh(Math.round(v)),
    md: (v) => hh(Math.round(v)) + "/dia",
    d: (v) => pn(v, "dia", "dias"),
    b: (v) => pn(v, "bloco", "blocos"),
    t: (v) => pn(v, "tarefa", "tarefas"),
    mt: (v) => pn(v, "matéria", "matérias"),
    id: (v) => pn(v, "idioma", "idiomas"),
    st: (v) => (Math.round(v * 100) / 100 + "").replace(".", ",") + " ★",
    lv: (v) => "nível " + Math.round(v),
    up: (v) => "+" + pn(v, "liga", "ligas"),
    el: (v) => pn(v, "Elo", "Elos"),
    cp: (v) => pn(v, "compra", "compras"),
    vt: (v) => pn(v, "vitória", "vitórias"),
    rk: (v) => LV[Math.round(v)] || "—",
    dh: (v) => "+" + hh(Math.round(v)),
  };
  const sn = (id) =>
    (S.subjects.find((s) => s.id === id) || { name: "Matéria removida" }).name;
  const LGN = (i) =>
    window.__liga && window.__liga.LG[i - 1]
      ? window.__liga.LG[i - 1][0]
      : "Liga " + i;
  let awTab = "",
    awCer = null;

  function cfg() {
    const a = (S.aw = S.aw && typeof S.aw === "object" ? S.aw : {});
    a.cer = a.cer || {};
    a.res = a.res || {};
    a.seen = a.seen || {};
    if (!Array.isArray(a.gen))
      a.gen = S.subjects
        .filter((s) => GEN0.includes(String(s.name).trim().toLowerCase()))
        .map((s) => s.id);
    if (!Array.isArray(a.lang))
      a.lang = S.subjects
        .filter(
          (s) =>
            !a.gen.includes(s.id) &&
            LANG0.some((n) => String(s.name).toLowerCase().includes(n)),
        )
        .map((s) => s.id);
    if (!a.init) {
      a.init = 1;
      const cy = now().getFullYear();
      for (let y = 2000; y < cy; y++) a.seen[y] = 1;
      save();
    }
    return a;
  }
  const cerDate = (Y) => cfg().cer[Y] || Y + 1 + "-01-01";
  const cutoff = (Y) => mnS(addK(cerDate(Y), -1), Y + "-12-31");
  const toFor = (Y) => mnS(fmt(now()), cutoff(Y));
  const first = () =>
    memo("first", () => {
      let f = "";
      S.subjects.forEach((s) =>
        Object.keys(s.days).forEach((k) => {
          if ((s.days[k] || 0) > 0 && (!f || k < f)) f = k;
        }),
      );
      return f;
    });
  const yrs = () => {
    const f = first();
    if (!f) return [];
    const r = [];
    for (let y = +f.slice(0, 4); y <= now().getFullYear(); y++) r.push(y);
    return r;
  };
  const lvOf = (xp) => {
    let n = 1,
      r = xp;
    while (n < 100) {
      const c = 100 * (1 + 0.25 * (n - 1));
      if (r < c) break;
      r -= c;
      n++;
    }
    return n;
  };
  function runs(keys, D) {
    const r = [];
    let a = null,
      p = null,
      n = 0,
      m = 0;
    keys.forEach((k) => {
      if (p && diff(p, k) === 1) {
        n++;
        m += D[k] || 0;
      } else {
        if (a) r.push({ a, b: p, n, m });
        a = k;
        n = 1;
        m = D[k] || 0;
      }
      p = k;
    });
    if (a) r.push({ a, b: p, n, m });
    return r;
  }

  /* ---------- preparação dos dados de um ano (conta TODO o estudo, planejado ou não) ---------- */
  function prep(Y, to) {
    const from = Y + "-01-01",
      gen = cfg().gen,
      FS = first(),
      D = {},
      SB = [],
      ses = [];
    S.subjects.forEach((s) => {
      const days = {};
      let tot = 0,
        n = 0,
        before = false,
        prevTot = 0;
      Object.keys(s.days).forEach((k) => {
        const m = s.days[k] || 0;
        if (m <= 0) return;
        if (k >= from && k <= to) {
          days[k] = m;
          tot += m;
          n++;
          D[k] = (D[k] || 0) + m;
        } else if (k < from) before = true;
        if (k.slice(0, 4) === String(Y - 1)) prevTot += m;
      });
      const o = {
        s,
        id: s.id,
        nm: s.name,
        gen: gen.includes(s.id),
        days,
        tot,
        n,
        before,
        prevTot,
        blocks: 0,
      };
      SB.push(o);
      SS(s).forEach((x) => {
        const k = fmt(x.a);
        if (k < from || k > to) return;
        const m = (x.b - x.a) / 6e4;
        if (m > 0) {
          ses.push({ o, a: x.a, b: x.b, m, k, h: x.a.getHours() });
          o.blocks++;
        }
      });
    });
    const dk = Object.keys(D).sort(),
      mo = Array.from({ length: 12 }, () => ({ m: 0, d: 0, b: 0 })),
      W = {},
      wd = Array.from({ length: 7 }, () => ({ m: 0, n: 0 }));
    dk.forEach((k) => {
      const i = +k.slice(5, 7) - 1;
      mo[i].m += D[k];
      mo[i].d++;
      const w = fmt(monday(parse(k))),
        o = (W[w] = W[w] || { m: 0, d: 0 });
      o.m += D[k];
      o.d++;
      wd[(parse(k).getDay() + 6) % 7].m += D[k];
    });
    ses.forEach((x) => mo[+x.k.slice(5, 7) - 1].b++);
    const end = mnS(to, Y + "-12-31");
    for (let k = mxS(from, FS || from); k <= end; k = addK(k, 1))
      wd[(parse(k).getDay() + 6) % 7].n++;
    const H = Array(24).fill(0);
    ses.forEach((x) => {
      let a = +x.a;
      const b = +x.b;
      while (a < b) {
        const d = new Date(a),
          e = Math.min(
            b,
            new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate(),
              d.getHours() + 1,
            ).getTime(),
          );
        H[d.getHours()] += (e - a) / 6e4;
        a = e;
      }
    });
    const R = runs(dk, D);
    const stat = {
      m: dk.reduce((a, k) => a + D[k], 0),
      d: dk.length,
      st: R.reduce((a, r) => Math.max(a, r.n), 0),
      b: ses.length,
      day: Math.max(0, ...dk.map((k) => D[k])),
      wk: Math.max(0, ...Object.values(W).map((o) => o.m)),
      mon: Math.max(0, ...mo.map((o) => o.m)),
      blk: ses.reduce((a, x) => Math.max(a, x.m), 0),
    };
    return {
      Y,
      from,
      to,
      D,
      SB,
      ses,
      dk,
      mo,
      W,
      wd,
      H,
      R,
      stat,
      full: to >= Y + "-12-31",
      FS,
    };
  }
  const P = (Y, to) =>
    memo(
      "p" +
        Y +
        "|" +
        to +
        "|" +
        cfg().gen.join(",") +
        "|" +
        cfg().lang.join(","),
      () => prep(Y, to),
    );

  /* ---------- auxiliares das categorias ---------- */
  const monthsC = (p) => {
    const r = [];
    for (let i = 0; i < 12; i++) {
      const e = fmt(new Date(p.Y, i + 1, 0, 12));
      if (e <= p.to && e >= p.FS) r.push(i);
    }
    return r;
  };
  const dim = (Y, i) => new Date(Y, i + 1, 0).getDate();
  const lg = (p) =>
    p.SB.filter((o) => cfg().lang.includes(o.id) && !o.gen && o.tot > 0);
  const ng = (p) => p.SB.filter((o) => !o.gen && o.tot > 0);
  const LOGY = (p) =>
    (S.log || []).filter((x) => x.f > 0 && x.d >= p.from && x.d <= p.to);
  const grp = (L, key) => {
    const m = {};
    L.forEach((x) => {
      const k = key(x);
      if (k == null) return;
      (m[k] = m[k] || []).push(x);
    });
    return Object.entries(m);
  };
  const avg = (a) => a.reduce((s, x) => s + x.f, 0) / a.length;
  const DONE = (p) => {
    const r = [];
    S.subjects.forEach((s) =>
      (s.topics || []).forEach((x) => {
        if (x.done && !x.exam && x.doneAt >= p.from && x.doneAt <= p.to)
          r.push({ s, x });
      }),
    );
    return r;
  };
  const LGH = (p) =>
    ((S.leg && S.leg.hist) || []).filter(
      (x) => x.w >= p.from && x.w <= p.to && !x.ref,
    );
  const CHH = (p) =>
    ((S.ch && S.ch.hist) || []).filter((x) => x.end >= p.from && x.end <= p.to);
  const LED = (p) =>
    ((S.lz && S.lz.led) || []).filter((x) => {
      const k = fmt(new Date(x.t));
      return k >= p.from && k <= p.to;
    });
  const mcount = (L, key, f) => {
    const o = Array.from({ length: 12 }, () => ({ v: 0, t: 0 }));
    L.forEach((x) => {
      o[+key(x).slice(5, 7) - 1].v += f(x);
    });
    return o;
  };
  const sem = (p, h1) =>
    ng(p).map((o) => ({
      l: o.nm,
      v: Object.keys(o.days).reduce(
        (a, k) => (+k.slice(5, 7) <= 6 === h1 ? a + o.days[k] : a),
        0,
      ),
      t: o.n,
    }));
  const chTot = (x) =>
    x.type === "total" ? x.goal : x.goal * (diff(x.start, x.end) + 1);

  /* ---------- categorias ---------- */
  const G = {
    t: "📅 Tempo e constância",
    h: "⏰ Horários e blocos",
    m: "📚 Matérias",
    i: "🌍 Idiomas",
    g: "🌐 Prêmios gerais",
    f: "🧠 Foco",
    k: "✅ Tarefas",
    s: "⚙️ Sistema do app",
  };
  const CATS = [
    {
      id: "dwa",
      g: "t",
      e: "📊",
      n: "Dia da semana com maior média",
      f: F.md,
      tn: "maior acúmulo no ano",
      fn: (p) =>
        p.wd.map((w, i) => ({ l: WDN[i], v: w.n ? w.m / w.n : 0, t: w.m })),
    },
    {
      id: "dwt",
      g: "t",
      e: "🗓️",
      n: "Dia da semana com maior acúmulo",
      f: F.min,
      tn: "maior média",
      fn: (p) =>
        p.wd.map((w, i) => ({ l: WDN[i], v: w.m, t: w.n ? w.m / w.n : 0 })),
    },
    {
      id: "mes",
      g: "t",
      e: "🌙",
      n: "Melhor mês",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) => p.mo.map((o, i) => ({ l: MN[i], v: o.m, t: o.d })),
    },
    {
      id: "sem",
      g: "t",
      e: "⚡",
      n: "Melhor semana",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) =>
        Object.keys(p.W).map((k) => ({
          l: br(k) + " a " + br(addK(k, 6)),
          v: p.W[k].m,
          t: p.W[k].d,
        })),
    },
    {
      id: "mar",
      g: "t",
      e: "🏃",
      n: "Maratona do ano (melhor dia)",
      f: F.min,
      tn: "dia mais recente",
      fn: (p) =>
        p.dk.map((k) => ({
          l: DIAS[(parse(k).getDay() + 6) % 7] + " " + bd(k),
          v: p.D[k],
          t: +k.replace(/-/g, ""),
        })),
    },
    {
      id: "str",
      g: "t",
      e: "🔥",
      n: "Maior streak do ano",
      f: F.d,
      tn: "mais horas na sequência",
      fn: (p) =>
        p.R.map((r) => ({ l: "Começou em " + bd(r.a), v: r.n, t: r.m })),
    },
    {
      id: "mco",
      g: "t",
      e: "🧲",
      n: "Mês mais constante",
      f: F.d,
      tn: "mais horas no mês",
      fn: (p) => p.mo.map((o, i) => ({ l: MN[i], v: o.d, t: o.m })),
    },
    {
      id: "spf",
      g: "t",
      e: "💯",
      n: "Semana perfeita (7 de 7 dias)",
      f: F.min,
      tn: "mais horas",
      fn: (p) =>
        Object.keys(p.W)
          .filter((k) => p.W[k].d === 7 && k >= p.from && addK(k, 6) <= p.to)
          .map((k) => ({
            l: br(k) + " a " + br(addK(k, 6)),
            v: p.W[k].m,
            t: 0,
          })),
    },
    {
      id: "mpf",
      g: "t",
      e: "🌕",
      n: "Mês perfeito (todos os dias)",
      f: F.min,
      tn: "mais horas",
      fn: (p) =>
        monthsC(p)
          .filter(
            (i) =>
              p.mo[i].d === dim(p.Y, i) &&
              p.Y + "-" + p2(i + 1) + "-01" >= p.FS,
          )
          .map((i) => ({ l: MN[i], v: p.mo[i].m, t: 0 })),
    },
    {
      id: "vir",
      g: "t",
      e: "🚀",
      n: "Virada do ano (2º semestre sobre o 1º)",
      f: F.dh,
      tn: "—",
      fn: (p) => {
        if (!p.full) return [];
        const a = p.mo.slice(0, 6).reduce((s, o) => s + o.m, 0),
          b = p.mo.slice(6).reduce((s, o) => s + o.m, 0);
        return a > 0 && b > a
          ? [
              {
                l: "2º semestre vs 1º semestre",
                v: b - a,
                t: 0,
                x: hh(a) + " → " + hh(b),
              },
            ]
          : [];
      },
    },
    {
      id: "hib",
      g: "t",
      e: "🧸",
      n: "Hibernação (mês mais fraco)",
      f: F.min,
      asc: 1,
      tn: "menos dias estudados",
      fn: (p) =>
        monthsC(p).map((i) => ({ l: MN[i], v: p.mo[i].m, t: -p.mo[i].d })),
    },
    {
      id: "pic",
      g: "h",
      e: "🕐",
      n: "Horário de pico do ano",
      f: F.min,
      tn: "—",
      fn: (p) =>
        p.H.map((m, i) => ({ l: i + "h–" + (i + 1) + "h", v: m, t: 0 })),
    },
    {
      id: "mad",
      g: "h",
      e: "🌅",
      n: "Mês Madrugador (início entre 4h e 6h)",
      f: F.d,
      tn: "mais horas",
      fn: (p) => {
        const E = Array.from({ length: 12 }, () => new Set());
        p.ses
          .filter((x) => x.h >= 4 && x.h < 6)
          .forEach((x) => E[+x.k.slice(5, 7) - 1].add(x.k));
        return E.map((s, i) => ({ l: MN[i], v: s.size, t: p.mo[i].m }));
      },
    },
    {
      id: "cor",
      g: "h",
      e: "🦉",
      n: "Mês Coruja (início entre 0h e 4h)",
      f: F.d,
      tn: "mais horas",
      fn: (p) => {
        const E = Array.from({ length: 12 }, () => new Set());
        p.ses
          .filter((x) => x.h < 4)
          .forEach((x) => E[+x.k.slice(5, 7) - 1].add(x.k));
        return E.map((s, i) => ({ l: MN[i], v: s.size, t: p.mo[i].m }));
      },
    },
    {
      id: "foa",
      g: "h",
      e: "🎯",
      n: "Foco absoluto (maior bloco contínuo)",
      f: F.min,
      tn: "bloco mais recente",
      fn: (p) => {
        const b =
          {}; /* um bloco por matéria/dia (o maior), para não repetir a mesma linha sem o horário */
        p.ses.forEach((x) => {
          const k = x.o.id + "|" + x.k;
          if (!b[k] || x.m > b[k].m) b[k] = x;
        });
        return Object.values(b).map((x) => ({
          l: x.o.nm + " · " + bd(x.k),
          v: x.m,
          t: +x.a,
        }));
      },
    },
    {
      id: "cro",
      g: "h",
      e: "⏱️",
      n: "Mês do Cronometrista (mais blocos)",
      f: F.b,
      tn: "mais horas",
      fn: (p) => p.mo.map((o, i) => ({ l: MN[i], v: o.b, t: o.m })),
    },
    {
      id: "fer",
      g: "h",
      e: "🧱",
      n: "Hábito de Ferro (mesmo horário, dias seguidos)",
      f: F.d,
      tn: "mais recente",
      fn: (p) => {
        const S_ = Array.from({ length: 24 }, () => new Set());
        p.ses.forEach((x) => S_[x.h].add(x.k));
        const r = [];
        S_.forEach((s, h) =>
          runs([...s].sort(), {}).forEach((q) => {
            if (q.n > 1)
              r.push({
                l: "~" + h + "h · " + bd(q.a) + " a " + bd(q.b),
                v: q.n,
                t: +q.b.replace(/-/g, ""),
              });
          }),
        );
        return r;
      },
    },
    {
      id: "mul",
      g: "h",
      e: "🎭",
      n: "Dia mais multitarefa (matérias no mesmo dia)",
      f: F.mt,
      tn: "mais horas no dia",
      fn: (p) => {
        const m = {};
        p.SB.filter((o) => !o.gen).forEach((o) =>
          Object.keys(o.days).forEach((k) =>
            (m[k] = m[k] || new Set()).add(o.id),
          ),
        );
        return Object.keys(m).map((k) => ({
          l: DIAS[(parse(k).getDay() + 6) % 7] + " " + bd(k),
          v: m[k].size,
          t: p.D[k],
        }));
      },
    },
    {
      id: "mai",
      g: "m",
      e: "🏔️",
      n: "Maioral (mais horas acumuladas)",
      ds: "Matéria com mais horas somadas desde o seu primeiro estudo até o fim deste ano.",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) =>
        S.subjects
          .filter((s) => !cfg().gen.includes(s.id))
          .map((s) => {
            let m = 0,
              n = 0;
            Object.keys(s.days).forEach((k) => {
              if (k <= p.to && (s.days[k] || 0) > 0) {
                m += s.days[k];
                n++;
              }
            });
            return { l: s.name, v: m, t: n };
          }),
    },
    {
      id: "mat",
      g: "m",
      e: "👑",
      n: "Matéria do Ano",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) => ng(p).map((o) => ({ l: o.nm, v: o.tot, t: o.n })),
    },
    {
      id: "mco2",
      g: "m",
      e: "🧭",
      n: "Matéria mais constante",
      f: F.d,
      tn: "mais horas",
      fn: (p) => ng(p).map((o) => ({ l: o.nm, v: o.n, t: o.tot })),
    },
    {
      id: "cbk",
      g: "m",
      e: "🔁",
      n: "Comeback (voltou a ser estudada)",
      f: F.dh,
      tn: "mais horas no ano",
      fn: (p) =>
        ng(p)
          .filter((o) => o.before && o.tot > o.prevTot)
          .map((o) => ({
            l: o.nm,
            v: o.tot - o.prevTot,
            t: o.tot,
            x: hh(o.prevTot) + " → " + hh(o.tot),
          })),
    },
    {
      id: "rev",
      g: "m",
      e: "🌟",
      n: "Revelação (matéria nova do ano)",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) =>
        ng(p)
          .filter((o) => !o.before)
          .map((o) => ({ l: o.nm, v: o.tot, t: o.n })),
    },
    {
      id: "qda",
      g: "m",
      e: "📉",
      n: "Queda livre (maior queda sobre o ano anterior)",
      f: F.min,
      tn: "maior volume no ano anterior",
      fn: (p) =>
        p.SB.filter((o) => !o.gen && o.prevTot > o.tot).map((o) => ({
          l: o.nm,
          v: o.prevTot - o.tot,
          t: o.prevTot,
          x: hh(o.prevTot) + " → " + hh(o.tot),
        })),
    },
    {
      id: "s1",
      g: "m",
      e: "🥇",
      n: "Matéria de Ouro do 1º semestre",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) => sem(p, true),
    },
    {
      id: "s2",
      g: "m",
      e: "🥇",
      n: "Matéria de Ouro do 2º semestre",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) => sem(p, false),
    },
    {
      id: "mmr",
      g: "m",
      e: "🏋️",
      n: "Maratona de matéria (maior dia numa matéria)",
      f: F.min,
      tn: "—",
      fn: (p) => {
        const r = [];
        ng(p).forEach((o) =>
          Object.keys(o.days).forEach((k) =>
            r.push({
              l: o.nm + " · " + bd(k),
              v: o.days[k],
              t: +k.replace(/-/g, ""),
            }),
          ),
        );
        return r;
      },
    },
    {
      id: "idi",
      g: "i",
      e: "🌍",
      n: "Idioma do Ano",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) => lg(p).map((o) => ({ l: o.nm, v: o.tot, t: o.n })),
    },
    {
      id: "idc",
      g: "i",
      e: "🗣️",
      n: "Idioma mais constante",
      f: F.d,
      tn: "mais horas",
      fn: (p) => lg(p).map((o) => ({ l: o.nm, v: o.n, t: o.tot })),
    },
    {
      id: "ipo",
      g: "i",
      e: "🎌",
      n: "Poliglota (mais idiomas no mesmo dia)",
      f: F.id,
      tn: "mais horas no dia",
      fn: (p) => {
        const m = {};
        lg(p).forEach((o) =>
          Object.keys(o.days).forEach((k) =>
            (m[k] = m[k] || new Set()).add(o.id),
          ),
        );
        return Object.keys(m).map((k) => ({
          l: DIAS[(parse(k).getDay() + 6) % 7] + " " + bd(k),
          v: m[k].size,
          t: p.D[k],
        }));
      },
    },
    {
      id: "ire",
      g: "i",
      e: "🌱",
      n: "Idioma Revelação (novo do ano)",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) =>
        lg(p)
          .filter((o) => !o.before)
          .map((o) => ({ l: o.nm, v: o.tot, t: o.n })),
    },
    {
      id: "icb",
      g: "i",
      e: "🔄",
      n: "Idioma Comeback (voltou a ser estudado)",
      f: F.dh,
      tn: "mais horas no ano",
      fn: (p) =>
        lg(p)
          .filter((o) => o.before && o.tot > o.prevTot)
          .map((o) => ({
            l: o.nm,
            v: o.tot - o.prevTot,
            t: o.tot,
            x: hh(o.prevTot) + " → " + hh(o.tot),
          })),
    },
    {
      id: "imm",
      g: "i",
      e: "📖",
      n: "Maratona de idiomas (melhor dia)",
      f: F.min,
      tn: "dia mais recente",
      fn: (p) => {
        const m = {};
        lg(p).forEach((o) =>
          Object.keys(o.days).forEach((k) => (m[k] = (m[k] || 0) + o.days[k])),
        );
        return Object.keys(m).map((k) => ({
          l: DIAS[(parse(k).getDay() + 6) % 7] + " " + bd(k),
          v: m[k],
          t: +k.replace(/-/g, ""),
        }));
      },
    },
    {
      id: "av1",
      g: "g",
      e: "🧩",
      n: "Atividade avulsa do ano (Outros, Curso…)",
      f: F.min,
      tn: "mais dias estudados",
      fn: (p) =>
        p.SB.filter((o) => o.gen && o.tot > 0).map((o) => ({
          l: o.nm,
          v: o.tot,
          t: o.n,
        })),
    },
    {
      id: "av2",
      g: "g",
      e: "📦",
      n: "Mais blocos registrados (qualquer atividade)",
      f: F.b,
      tn: "mais horas",
      fn: (p) =>
        p.SB.filter((o) => o.blocks > 0).map((o) => ({
          l: o.nm,
          v: o.blocks,
          t: o.tot,
        })),
    },
    {
      id: "fma",
      g: "f",
      e: "🧠",
      n: "Matéria com mais foco",
      f: F.st,
      tn: "mais registros",
      fn: (p) =>
        grp(
          LOGY(p).filter((x) => !cfg().gen.includes(x.sid)),
          (x) => x.sid,
        ).map(([id, a]) => ({
          l: sn(id),
          v: avg(a),
          t: a.length,
          x: pn(a.length, "registro", "registros"),
        })),
    },
    {
      id: "fme",
      g: "f",
      e: "🔆",
      n: "Mês com mais foco",
      f: F.st,
      tn: "mais registros",
      fn: (p) =>
        grp(LOGY(p), (x) => x.d.slice(5, 7)).map(([k, a]) => ({
          l: MN[+k - 1],
          v: avg(a),
          t: a.length,
          x: pn(a.length, "registro", "registros"),
        })),
    },
    {
      id: "fpe",
      g: "f",
      e: "🌤️",
      n: "Período do dia com mais concentração",
      f: F.st,
      tn: "mais registros",
      fn: (p) => {
        const N = [
          "Madrugada (0h–6h)",
          "Manhã (6h–12h)",
          "Tarde (12h–18h)",
          "Noite (18h–24h)",
        ];
        return grp(
          LOGY(p).filter((x) => x.h != null),
          (x) => (x.h < 6 ? 0 : x.h < 12 ? 1 : x.h < 18 ? 2 : 3),
        ).map(([k, a]) => ({
          l: N[k],
          v: avg(a),
          t: a.length,
          x: pn(a.length, "registro", "registros"),
        }));
      },
    },
    {
      id: "fse",
      g: "f",
      e: "💎",
      n: "Sessão mais produtiva (foco e duração)",
      f: F.st,
      tn: "maior duração",
      fn: (p) =>
        LOGY(p).map((x) => ({
          l: sn(x.sid) + " · " + bd(x.d) + (x.h != null ? " " + x.h + "h" : ""),
          v: x.f,
          t: x.m || 0,
          x: hh(x.m || 0),
        })),
    },
    {
      id: "tma",
      g: "k",
      e: "✅",
      n: "Matéria com mais tarefas concluídas",
      f: F.t,
      tn: "—",
      fn: (p) =>
        grp(
          DONE(p).filter((o) => !cfg().gen.includes(o.s.id)),
          (o) => o.s.id,
        ).map(([id, a]) => ({ l: sn(id), v: a.length, t: 0 })),
    },
    {
      id: "tme",
      g: "k",
      e: "📋",
      n: "Mês mais produtivo em tarefas",
      f: F.t,
      tn: "—",
      fn: (p) =>
        grp(DONE(p), (o) => o.x.doneAt.slice(5, 7)).map(([k, a]) => ({
          l: MN[+k - 1],
          v: a.length,
          t: 0,
        })),
    },
    {
      id: "lsu",
      g: "s",
      e: "🏅",
      n: "Maior subida de liga",
      f: F.up,
      tn: "mais horas na semana",
      fn: (p) =>
        LGH(p)
          .filter((x) => x.r === "up")
          .map((x) => ({
            l: LGN(x.from) + " → " + LGN(x.to) + " · sem. " + br(x.w),
            v: x.to - x.from,
            t: x.h,
          })),
    },
    {
      id: "lpi",
      g: "s",
      e: "📈",
      n: "Semana de pico na liga",
      f: F.min,
      tn: "—",
      fn: (p) =>
        LGH(p).map((x) => ({
          l: br(x.w) + " a " + br(addK(x.w, 5)),
          v: x.h * 60,
          t: 0,
        })),
    },
    {
      id: "lfi",
      g: "s",
      e: "🎖️",
      n: "Liga final do ano",
      f: F.lv,
      tn: "—",
      fn: (p) =>
        LGH(p)
          .slice(-1)
          .map((x) => ({ l: LGN(x.to), v: x.to, t: 0 })),
    },
    {
      id: "dfi",
      g: "s",
      e: "⛓️",
      n: "Desafio mais difícil concluído",
      f: F.rk,
      tn: "maior meta total",
      fn: (p) =>
        CHH(p)
          .filter((x) => x.res === "win")
          .map((x) => ({
            l:
              "Desafio " +
              LV[LVR[x.lvl] || 1] +
              " · " +
              br(x.start) +
              " a " +
              br(x.end),
            v: LVR[x.lvl] || 1,
            t: chTot(x),
          })),
    },
    {
      id: "dvi",
      g: "s",
      e: "🛡️",
      n: "Nível de desafio mais vencido",
      f: F.vt,
      tn: "nível mais alto",
      fn: (p) =>
        [1, 2, 3].map((r) => ({
          l: "Desafio " + LV[r],
          v: CHH(p).filter((x) => x.res === "win" && (LVR[x.lvl] || 1) === r)
            .length,
          t: r,
        })),
    },
    {
      id: "dsq",
      g: "s",
      e: "⚔️",
      n: "Maior sequência de desafios vencidos",
      f: F.vt,
      tn: "—",
      fn: (p) => {
        const r = [];
        let n = 0,
          a = null,
          b = null;
        CHH(p).forEach((x) => {
          if (x.res === "win") {
            if (!n) a = x.start;
            n++;
            b = x.end;
          } else {
            if (n) r.push({ l: br(a) + " a " + br(b), v: n, t: 0 });
            n = 0;
          }
        });
        if (n) r.push({ l: br(a) + " a " + br(b), v: n, t: 0 });
        return r;
      },
    },
    {
      id: "lzm",
      g: "s",
      e: "😴",
      n: "Mês que mais rendeu lazer",
      f: F.min,
      tn: "—",
      fn: (p) =>
        mcount(
          LED(p).filter((x) => x.min > 0 && x.type !== "loan"),
          (x) => fmt(new Date(x.t)),
          (x) => x.min,
        ).map((o, i) => ({ l: MN[i], v: o.v, t: 0 })),
    },
    {
      id: "lzd",
      g: "s",
      e: "🧘",
      n: "Mês mais disciplinado (menor perda por ociosidade)",
      f: F.min,
      asc: 1,
      tn: "mais lazer ganho",
      fn: (p) => {
        const L = LED(p),
          K = (x) => fmt(new Date(x.t)),
          g = mcount(
            L.filter((x) => x.type === "gain" && x.min > 0),
            K,
            (x) => x.min,
          ),
          i2 = mcount(
            L.filter((x) => x.type === "idle" && x.min < 0),
            K,
            (x) => -x.min,
          );
        return g
          .map((o, i) => ({ l: MN[i], v: i2[i].v, t: o.v }))
          .filter((c) => c.t > 0);
      },
    },
    {
      id: "lzu",
      g: "s",
      e: "🛋️",
      n: "Maior descanso do ano",
      f: F.min,
      tn: "—",
      fn: (p) =>
        LED(p)
          .filter((x) => x.type === "use" && x.min < 0)
          .map((x) => ({
            l: bd(fmt(new Date(x.t))) + " " + hm(new Date(x.t)),
            v: -x.min,
            t: 0,
          })),
    },
    {
      id: "elo",
      g: "s",
      e: "🪙",
      n: "Mês com mais Elos ganhos",
      f: F.el,
      tn: "—",
      fn: (p) => {
        const o = Array(12).fill(0);
        Object.entries((S.elos && S.elos.h) || {}).forEach(([k, v]) => {
          if (k >= p.from && k <= p.to) o[+k.slice(5, 7) - 1] += Math.max(0, v);
        });
        return o.map((v, i) => ({ l: MN[i], v, t: 0 }));
      },
    },
    {
      id: "loj",
      g: "s",
      e: "🛒",
      n: "Item mais comprado na Loja",
      f: F.cp,
      tn: "—",
      fn: (p) =>
        grp(
          ((S.shop && S.shop.buy) || []).filter((x) => {
            const k = fmt(new Date(x.t));
            return k >= p.from && k <= p.to;
          }),
          (x) => x.id,
        ).map(([id, a]) => ({
          l: SHN[id] || String(id).toUpperCase(),
          v: a.length,
          t: 0,
        })),
    },
    {
      id: "xpl",
      g: "s",
      e: "📈",
      n: "Sequência com maior nível de XP (estimado)",
      ds: "Cada sequência de dias seguidos de estudo acumula XP (100 XP por hora estudada). Vence a sequência que chegou ao maior nível.",
      f: F.lv,
      tn: "mais XP",
      fn: (p) =>
        p.R.map((r) => {
          const xp = (r.m / 60) * 100;
          return {
            l: "Sequência iniciada em " + bd(r.a),
            v: lvOf(xp),
            t: xp,
            x: Math.round(xp) + " XP",
          };
        }),
    },
  ];
  const CBY = {};
  CATS.forEach((c) => (CBY[c.id] = c));

  /* ---------- Estudante do Ano, recordes e construção do resultado ---------- */
  const HK = [
    ["m", "Horas", "min"],
    ["d", "Dias estudados", "d"],
    ["st", "Maior streak", "d"],
    ["b", "Blocos", "b"],
  ];
  function hero(Y, to) {
    const S_ = yrs().map((y) => ({ y, s: P(y, y === Y ? to : toFor(y)).stat })),
      mx = (k) => Math.max(1, ...S_.map((o) => o.s[k])),
      sc = (o) =>
        Math.round(
          (HK.reduce((a, [k]) => a + o.s[k] / mx(k), 0) / HK.length) * 100,
        ),
      me = S_.find((o) => o.y === Y);
    return {
      sc: sc(me),
      rk:
        S_.slice()
          .sort((a, b) => sc(b) - sc(a))
          .findIndex((o) => o.y === Y) + 1,
      n: S_.length,
      p: HK.map(([k, n, f]) => ({ n, f, v: me.s[k], mx: mx(k) })),
    };
  }
  const RM = [
    ["day", "Maratona (melhor dia)", "min"],
    ["wk", "Melhor semana", "min"],
    ["mon", "Melhor mês", "min"],
    ["st", "Maior streak", "d"],
    ["blk", "Maior bloco contínuo", "min"],
    ["m", "Ano com mais horas", "min"],
  ];
  function records(Y, to) {
    const ys = yrs().filter((y) => y < Y);
    if (!ys.length) return [];
    const me = P(Y, to).stat,
      r = [];
    RM.forEach(([k, n, f]) => {
      const pm = Math.max(0, ...ys.map((y) => P(y, toFor(y)).stat[k]));
      if (pm > 0 && me[k] > pm) r.push({ n, f, v: me[k], p: pm });
    });
    return r.sort((a, b) => b.v / b.p - a.v / a.p);
  }
  function build(Y, to) {
    const p = P(Y, to),
      out = [];
    CATS.forEach((c) => {
      let a;
      try {
        a = c.fn(p) || [];
      } catch (e) {
        console.error("Awards", c.id, e);
        a = [];
      }
      a = a.filter((x) => x && isFinite(x.v) && (x.v > 0 || c.asc));
      if (!a.length) return;
      a.sort(
        (x, y) => (c.asc ? x.v - y.v : y.v - x.v) || (y.t || 0) - (x.t || 0),
      );
      out.push({
        id: c.id,
        n: a.slice(0, 5).map((x) => ({ l: x.l, v: x.v, x: x.x || "" })),
      });
    });
    return {
      v: 4,
      Y,
      to,
      at: Date.now(),
      c: out,
      stat: p.stat,
      hero: p.stat.m > 0 ? hero(Y, to) : null,
      rec: records(Y, to),
    };
  }
  function resFor(Y) {
    const a = cfg(),
      C = cerDate(Y),
      t = fmt(now()),
      cut = cutoff(Y),
      fr = addK(C, -FRZ),
      gk = a.gen.join(",") + "|" + a.lang.join(",");
    if (t >= C) {
      if (!a.res[Y] || a.res[Y].v !== 4) {
        a.res[Y] = build(Y, cut);
        save();
      }
      return { st: "final", R: a.res[Y], C };
    }
    const to = t >= fr ? mnS(addK(fr, -1), cut) : mnS(t, cut);
    return {
      st: t >= fr ? "frozen" : "live",
      R: memo("b" + Y + "|" + to + "|" + gk, () => build(Y, to)),
      C,
      fr,
      to,
    };
  }

  /* ---------- P e S ao lado do vencedor ----------
     P = quantas vezes esse vencedor já ganhou ESTA categoria (contando o ano Y).
     S = quantos anos seguidos ele vem ganhando, terminando em Y (só é mostrado a partir de 2).
     Só vale para vencedores que podem se repetir; rótulos com data (ex.: "Sábado 12/03") nunca repetem e ficam sem selo.
     Calculado na hora a partir dos resultados já salvos dos anos encerrados (nada novo é salvo). */
  function wins(Y, c) {
    const w = c.n && c.n[0];
    if (!w || !w.l || /\d{1,2}\/\d{1,2}/.test(w.l)) return null;
    const won = (y) => {
      const r = resFor(y);
      if (r.st !== "final") return false;
      const k = r.R.c.find((x) => x.id === c.id);
      return !!(k && k.n[0] && k.n[0].l === w.l);
    };
    let P = 0,
      S = 0,
      run = true;
    yrs()
      .filter((y) => y <= Y)
      .reverse()
      .forEach((y) => {
        if (won(y)) {
          P++;
          if (run) S++;
        } else run = false;
      });
    return { P, S };
  }
  const badge = (Y, c) => {
    const t = wins(Y, c);
    return t && t.P ? "P" + t.P + (t.S >= 2 ? " · S" + t.S : "") : "";
  };

  /* ---------- Maiores vencedores da noite ----------
     Classificação única de quem levou mais prêmios. Só entram 3 tipos de vencedor: dia da semana, mês e matéria
     (idiomas contam como matéria). "Mesmo vencedor" = mesmo rótulo (ex.: "Terça", "Março", "Matemática").
     Só entra quem levou 2+ prêmios. Calculado a partir de R.c (nada novo é salvo). */
  const TOPN = 5;
  const kindOf = (l) =>
    WDN.includes(l)
      ? "Dia da semana"
      : MN.includes(l)
        ? "Mês"
        : S.subjects.some((s) => s.name === l)
          ? "Matéria"
          : "";
  function tally(R) {
    const m = new Map();
    R.c.forEach((c, i) => {
      const w = c.n && c.n[0];
      if (!w || !w.l || !CBY[c.id]) return;
      const k = kindOf(w.l);
      if (!k) return;
      const e = m.get(w.l) || { l: w.l, k, cats: [], i };
      e.cats.push(c.id);
      m.set(w.l, e);
    });
    return [...m.values()];
  }
  function topWinners(R) {
    return tally(R)
      .filter((e) => e.cats.length >= 2)
      .sort((a, b) => b.cats.length - a.cats.length || a.i - b.i)
      .slice(0, TOPN);
  }
  function topCards(T) {
    return `<div class="aw-sc"><table><thead><tr><th>#</th><th>Vencedor</th><th>Tipo</th><th>Prêmios</th><th>Categorias</th></tr></thead><tbody>${T.map(
      (e, i) =>
        `<tr><td>${["🥇", "🥈", "🥉"][i] || i + 1 + "º"}</td><td><b>${esc(e.l)}</b></td><td>${e.k}</td><td><b>${e.cats.length}</b></td><td><span class="sub">${e.cats.map((id) => CBY[id].e + " " + esc(CBY[id].n)).join(" · ")}</span></td></tr>`,
    ).join("")}</tbody></table></div>`;
  }
  function topHtml(R) {
    const T = topWinners(R);
    return T.length
      ? `<div class="aw-sec"><h2>🏅 Maiores vencedores da noite</h2>${topCards(T)}</div>`
      : "";
  }
  /* itens da cerimônia: categorias → Estudante do Ano → maiores vencedores (só se houver) */
  const cerItems = (R) =>
    R.c.concat([{ hero: 1 }], topWinners(R).length ? [{ top: 1 }] : []);

  /* ---------- HTML ---------- */
  const marg = (d, n) =>
    n.length < 2
      ? "único indicado"
      : Math.abs(n[0].v - n[1].v) < 1e-9
        ? "empate em " + d.f(n[0].v) + " · desempate: " + d.tn
        : "vantagem de " + d.f(Math.abs(n[0].v - n[1].v));
  const nom = (d, n) =>
    n
      .slice(1, 3)
      .map(
        (x, i) =>
          `<div class="aw-n">${i ? "🥉" : "🥈"} ${esc(x.l)} <b>${d.f(x.v)}</b></div>`,
      )
      .join("");
  const rankAll = (d, n) =>
    n
      .slice(1)
      .map(
        (x, i) =>
          `<div class="aw-n">${["🥈", "🥉", "4º", "5º"][i]} ${esc(x.l)} <b>${d.f(x.v)}</b>${x.x ? " · " + esc(x.x) : ""}</div>`,
      )
      .join("");
  const noms = (d, n) =>
    `<div class="aw-noms"><div class="aw-m">${n.length > 1 ? "Indicados" : "Único indicado"}</div>${n
      .slice()
      .sort((a, b) => a.l.localeCompare(b.l, "pt"))
      .map((x) => `<div class="aw-nm">${esc(x.l)}</div>`)
      .join("")}</div>`;
  function card(c, lead, Y) {
    const d = CBY[c.id],
      w = c.n[0],
      bg = !lead && Y ? badge(Y, c) : "";
    return `<div class="aw-card${lead ? " lead" : ""}"><div class="aw-ct"><span>${d.e}</span>${esc(d.n)}</div>${d.ds ? `<div class="aw-m">${esc(d.ds)}</div>` : ""}<div class="aw-w">${lead ? "👑" : "🥇"} ${esc(w.l)}${bg ? ` <span style="font-size:.6em;font-weight:600;opacity:.85;white-space:nowrap">${bg}</span>` : ""}</div><div class="aw-v">${d.f(w.v)}${w.x ? " · " + esc(w.x) : ""}</div>${lead ? '<div class="aw-m">líder na parcial</div>' : `<div class="aw-m">${marg(d, c.n)}</div>${nom(d, c.n)}`}</div>`;
  }
  function heroHtml(R, lead) {
    const h = R.hero;
    if (!h) return "";
    return `<div class="aw-hero"><div class="aw-ht">🎓 Estudante do Ano${lead ? " (parcial)" : ""}</div><div class="aw-big aw-shine">${h.sc}<small>/100</small></div><div class="aw-m">${h.rk}º melhor ano entre ${h.n} anos com dados</div><div class="aw-bars">${h.p.map((q) => `<div><span>${q.n}</span><div class="aw-bar"><i style="width:${Math.max(3, Math.round((q.v / q.mx) * 100))}%"></i></div><b>${F[q.f](q.v)}</b></div>`).join("")}</div></div>`;
  }
  function recHtml(R) {
    if (!R.rec || !R.rec.length) return "";
    return `<div class="aw-sec"><h2>🔨 Recordes quebrados no ano</h2><div class="aw-grid">${R.rec.map((r, i) => `<div class="aw-card"><div class="aw-ct"><span>${i ? "🔨" : "👑"}</span>${r.n}${i ? "" : " · Recorde do Ano"}</div><div class="aw-w">${F[r.f](r.v)}</div><div class="aw-m">antes: ${F[r.f](r.p)} (+${Math.round((r.v / r.p - 1) * 100)}%)</div></div>`).join("")}</div></div>`;
  }
  function stage(Y, R) {
    const it = cerItems(R),
      N = it.length,
      i = awCer.i,
      c = it[i],
      last = i + 1 >= N;
    let h = `<div class="aw-stage"><div class="aw-prog">Cerimônia ${Y} · ${i + 1} de ${N}</div>`;
    if (c.top) {
      h += `<div class="aw-ct big">🏅 Maiores vencedores da noite</div><div class="aw-sec">${topCards(topWinners(R))}</div>`;
    } else if (c.hero) {
      h +=
        `<div class="aw-ct big">🎓 Prêmio principal</div>` +
        (awCer.open
          ? heroHtml(R, false)
          : `<div class="aw-env">✉️</div><button class="btn main" data-aw="open">Abrir envelope</button>`);
    } else {
      const d = CBY[c.id],
        w = c.n[0],
        bg = awCer.open ? badge(Y, c) : "";
      h += `<div class="aw-ct big"><span>${d.e}</span>${esc(d.n)}</div>`;
      if (d.ds) h += `<div class="aw-m">${esc(d.ds)}</div>`;
      h += awCer.open
        ? `<div class="aw-win"><div class="aw-sparks">✨ 🎉 ✨</div><div class="aw-wbig aw-shine">${esc(w.l)}</div>${bg ? `<div class="aw-m"><b>${bg}</b> <span style="opacity:.7">(P = vezes que ganhou · S = anos seguidos)</span></div>` : ""}<div class="aw-vbig">${d.f(w.v)}${w.x ? " · " + esc(w.x) : ""}</div><div class="aw-m">${marg(d, c.n)}</div>${rankAll(d, c.n)}</div>`
        : `${noms(d, c.n)}<div class="aw-env">✉️</div><button class="btn main" data-aw="open">Abrir envelope</button>`;
    }
    if (awCer.open || c.top)
      h += `<div class="aw-act"><button class="btn main" data-aw="next">${last ? "Ver resultado final" : "Próxima categoria →"}</button></div>`;
    return (
      h +
      `<div class="aw-act"><button class="btn" data-aw="skip" data-y="${Y}">Pular cerimônia</button></div></div>`
    );
  }
  const days = (a, b) => Math.max(0, diff(a, b));
  function yearHtml(Y) {
    const a = cfg(),
      r = resFor(Y),
      R = r.R,
      t = fmt(now());
    if (awCer && awCer.Y === Y) return stage(Y, R);
    if (r.st === "final" && !a.seen[Y] && R.c.length)
      return `<div class="aw-stage"><div class="aw-ct big">🏆 Awards ${Y}</div><p class="aw-m">A cerimônia chegou! ${R.c.length} categorias, uma por vez.</p><div class="aw-env">🎬</div><div class="aw-act"><button class="btn main" data-aw="start" data-y="${Y}">▶ Começar cerimônia</button> <button class="btn" data-aw="skip" data-y="${Y}">Ver tudo de uma vez</button></div></div>`;
    const to = r.st === "final" ? R.to : r.to,
      lead = r.st !== "final";
    let st =
      r.st === "final"
        ? `🏆 Resultado oficial · cerimônia em ${bd(r.C)} · dados até ${bd(R.to)}`
        : r.st === "frozen"
          ? `🔒 Parciais congeladas em ${bd(r.fr)} (dados até ${bd(r.to)}). Faltam ${days(t, r.C)} dia(s) para a cerimônia de ${bd(r.C)}: os líderes podem mudar!`
          : `⏳ Parciais ao vivo até ${bd(r.to)}. Faltam ${days(t, r.C)} dia(s) para a cerimônia (${bd(r.C)}). Elas congelam em ${bd(r.fr)}.`;
    let h = `<div class="aw-hd"><div class="aw-st">${st}</div></div>`;
    if (!R.c.length)
      return (
        h +
        `<p class="sub">Sem dados suficientes em ${Y} para premiar.</p>` +
        cfgHtml(Y, r)
      );
    if (!lead)
      h += `<p class="sub">Ao lado dos vencedores: P = vezes que ganhou a categoria · S = anos seguidos vencendo (só aparece a partir de 2).</p>`;
    h += heroHtml(R, lead);
    Object.keys(G).forEach((g) => {
      const L = R.c.filter((c) => CBY[c.id].g === g);
      if (L.length)
        h += `<div class="aw-sec"><h2>${G[g]}</h2><div class="aw-grid">${L.map((c) => card(c, lead, Y)).join("")}</div></div>`;
    });
    if (!lead) h += recHtml(R) + topHtml(R);
    return h + cfgHtml(Y, r);
  }
  function cfgHtml(Y, r) {
    const a = cfg();
    return `<details class="aw-cfg"><summary>⚙️ Configurar ${Y}</summary><div class="aw-row"><label>Data da cerimônia <input type="date" id="aw-cd" data-y="${Y}" value="${cerDate(Y)}"></label><span class="sub">Os dados contam até o dia anterior.</span></div>
 <div class="aw-row">${r.st === "final" ? `<button class="btn" data-aw="redo" data-y="${Y}">🎬 Rever cerimônia</button><button class="btn" data-aw="recalc" data-y="${Y}">♻️ Recalcular resultado</button>` : ""}</div>
 <details><summary>🧩 Atividades que não são matérias (ficam fora das categorias de matéria)</summary><div class="aw-gen">${S.subjects.map((s) => `<label><input type="checkbox" data-awgen="${s.id}"${a.gen.includes(s.id) ? " checked" : ""}> ${esc(s.name)}</label>`).join("")}</div><p class="sub">Depois de mudar, use "Recalcular" nos anos já encerrados.</p></details>
 <details><summary>🌍 Matérias que contam como idioma</summary><div class="aw-gen">${S.subjects.map((s) => `<label><input type="checkbox" data-awlang="${s.id}"${a.lang.includes(s.id) ? " checked" : ""}> ${esc(s.name)}</label>`).join("")}</div></details></details>`;
  }
  function hof(ys) {
    const rows = ys
      .slice()
      .reverse()
      .map((y) => {
        const r = resFor(y),
          R = r.R,
          w = (id) => {
            const c = R.c.find((x) => x.id === id);
            return c ? esc(c.n[0].l) : "—";
          },
          s = R.stat || {};
        return `<tr><td><button class="btn" data-aw="tab" data-v="${y}">${y}</button></td><td>${hh(s.m || 0)}</td><td>${s.d || 0}</td><td>${s.st || 0}</td><td>${R.hero ? R.hero.sc + "/100" : "—"}</td><td>${w("mat")}</td><td>${w("mes")}</td><td>${(R.rec || []).length}</td><td>${r.st === "final" ? "🏆" : r.st === "frozen" ? "🔒" : "⏳"}</td></tr>`;
      })
      .join("");
    return `<div class="aw-sec"><h2>🏛️ Hall da fama</h2><div class="aw-sc"><table><thead><tr><th>Ano</th><th>Horas</th><th>Dias</th><th>Streak</th><th>Estudante do Ano</th><th>Matéria do Ano</th><th>Melhor mês</th><th>Recordes</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>${hofRecs(ys)}${hofCats(ys)}`;
  }
  /* recordes das premiações, somando só as cerimônias já encerradas */
  function hofRecs(ys) {
    const fin = ys
      .map((y) => ({ y, r: resFor(y) }))
      .filter((o) => o.r.st === "final");
    if (!fin.length) return "";
    const best = (arr, key) => {
      if (!arr.length) return [];
      const mx = Math.max(...arr.map(key));
      return arr.filter(
        (x) => key(x) === mx,
      ); /* todos que empatam no recorde */
    };
    const lst = (L, f) =>
      L.slice(0, 3).map(f).join("<br>") +
      (L.length > 3 ? "<br>+" + (L.length - 3) : "");
    const rows = [];
    /* 1) vencedor com mais prêmios numa única noite */
    const nights = [];
    fin.forEach(({ y, r }) =>
      tally(r.R).forEach((e) => nights.push({ y, l: e.l, n: e.cats.length })),
    );
    const a = best(nights, (x) => x.n);
    if (a.length && a[0].n >= 2)
      rows.push([
        "🏅 Mais prêmios numa noite",
        lst(a, (x) => `<b>${esc(x.l)}</b> · ${x.y}`),
        pn(a[0].n, "prêmio", "prêmios"),
      ]);
    /* 2) e 3) o mesmo vencedor na mesma categoria, em vários anos (rótulos com data nunca repetem, ficam de fora) */
    const byCat = new Map();
    fin.forEach(({ y, r }) =>
      r.R.c.forEach((c) => {
        const w = c.n && c.n[0];
        if (!w || !w.l || !CBY[c.id] || /\d{1,2}\/\d{1,2}/.test(w.l)) return;
        const k = c.id + "\u0001" + w.l,
          e = byCat.get(k) || { id: c.id, l: w.l, ys: [] };
        e.ys.push(y);
        byCat.set(k, e);
      }),
    );
    const reps = [...byCat.values()].map((e) => {
      e.ys.sort((x, z) => x - z);
      let run = 1,
        rs = e.ys[0],
        bn = 1,
        bs = e.ys[0];
      for (let i = 1; i < e.ys.length; i++) {
        if (e.ys[i] === e.ys[i - 1] + 1) run++;
        else {
          run = 1;
          rs = e.ys[i];
        }
        if (run > bn) {
          bn = run;
          bs = rs;
        }
      }
      return { id: e.id, l: e.l, P: e.ys.length, S: bn, from: bs };
    });
    const who = (x) =>
      `<b>${esc(x.l)}</b> · ${CBY[x.id].e} ${esc(CBY[x.id].n)}`;
    const b = best(reps, (x) => x.P);
    if (b.length && b[0].P >= 2)
      rows.push([
        "🔁 Mais vitórias na mesma categoria",
        lst(b, who),
        b[0].P + "×",
      ]);
    const c = best(reps, (x) => x.S);
    if (c.length && c[0].S >= 2)
      rows.push([
        "🔥 Maior sequência de anos seguidos",
        lst(c, (x) => who(x) + " · " + x.from + "–" + (x.from + x.S - 1)),
        c[0].S + " anos",
      ]);
    /* 4) maior nota de Estudante do Ano */
    const hs = fin
      .filter((o) => o.r.R.hero)
      .map((o) => ({ y: o.y, sc: o.r.R.hero.sc }));
    const d = best(hs, (x) => x.sc);
    if (d.length)
      rows.push([
        "🎓 Maior nota de Estudante do Ano",
        lst(d, (x) => String(x.y)),
        d[0].sc + "/100",
      ]);
    if (!rows.length) return "";
    return `<div class="aw-sec"><h2>🏛️ Recordes das premiações</h2><p class="sub">Conta só cerimônias já encerradas (${fin.length} ${fin.length === 1 ? "ano" : "anos"}).</p><div class="aw-sc"><table><thead><tr><th>Recorde</th><th>Quem</th><th>Valor</th></tr></thead><tbody>${rows.map((q) => `<tr><td>${q[0]}</td><td>${q[1]}</td><td><b>${q[2]}</b></td></tr>`).join("")}</tbody></table></div></div>`;
  }
  /* maiores vencedores de cada categoria, somando só as cerimônias já encerradas */
  function hofCats(ys) {
    const fin = ys.map((y) => resFor(y)).filter((r) => r.st === "final");
    if (!fin.length) return "";
    const out = [];
    Object.keys(G).forEach((g) => {
      const part = [];
      CATS.filter((c) => c.g === g).forEach((c) => {
        const m = new Map();
        fin.forEach((r) => {
          const k = r.R.c.find((x) => x.id === c.id),
            w = k && k.n[0];
          if (w) m.set(w.l, (m.get(w.l) || 0) + 1);
        });
        if (!m.size) return;
        const mx = Math.max(...m.values()),
          T = [...m].filter(([, n]) => n === mx).map(([l]) => l);
        let who, cnt;
        if (mx === 1 && fin.length > 1) {
          who =
            '<span class="sub">sem repetição (um vencedor diferente por ano)</span>';
          cnt = "—";
        } else {
          who =
            "<b>" +
            T.slice(0, 3).map(esc).join(", ") +
            "</b>" +
            (T.length > 3 ? " +" + (T.length - 3) : "");
          cnt = mx + "×";
        }
        part.push(
          `<tr><td>${c.e} ${esc(c.n)}</td><td>${who}</td><td>${cnt}</td></tr>`,
        );
      });
      if (part.length)
        out.push(`<tr><th colspan="3">${G[g]}</th></tr>` + part.join(""));
    });
    if (!out.length) return "";
    return `<div class="aw-sec"><h2>🏆 Maiores vencedores de cada categoria</h2><p class="sub">Conta só cerimônias já encerradas (${fin.length} ${fin.length === 1 ? "ano" : "anos"}).</p><div class="aw-sc"><table><thead><tr><th>Categoria</th><th>Maior vencedor</th><th>Vitórias</th></tr></thead><tbody>${out.join("")}</tbody></table></div></div>`;
  }
  function draw() {
    if (curPage !== "awards") return;
    const el = document.getElementById("aw");
    if (!el) return;
    const ys = yrs();
    if (!ys.length) {
      el.innerHTML =
        '<p class="sub">Registre estudos para começar a premiação.</p>';
      return;
    }
    if (!awTab || (awTab !== "hof" && !ys.includes(+awTab)))
      awTab = String(ys[ys.length - 1]);
    let h = `<div class="aw-tabs">${["hof"]
      .concat(ys.slice().reverse())
      .map(
        (v) =>
          `<button class="${String(v) === awTab ? "on" : ""}" data-aw="tab" data-v="${v}">${v === "hof" ? "🏛️ Hall da fama" : v}</button>`,
      )
      .join("")}</div>`;
    h += awTab === "hof" ? hof(ys) : yearHtml(+awTab);
    if (el._h !== h) {
      el.innerHTML = h;
      el._h = h;
    }
  }

  /* ---------- eventos ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-aw]");
    if (!b) return;
    const a = b.dataset.aw,
      Y = +(b.dataset.y || awTab);
    if (a === "tab") {
      awTab = b.dataset.v;
      awCer = null;
    } else if (a === "start" || a === "redo") awCer = { Y, i: 0, open: false };
    else if (a === "open") {
      if (awCer) awCer.open = true;
    } else if (a === "next") {
      if (awCer) {
        const N = cerItems(resFor(awCer.Y).R).length;
        if (awCer.i + 1 >= N) {
          cfg().seen[awCer.Y] = 1;
          save();
          awCer = null;
        } else {
          awCer.i++;
          awCer.open = false;
        }
      }
    } else if (a === "skip") {
      cfg().seen[Y] = 1;
      save();
      awCer = null;
    } else if (a === "recalc") {
      if (
        !confirm(
          "Recalcular o resultado de " +
            Y +
            " com os dados atuais? O resultado salvo será substituído.",
        )
      )
        return;
      delete cfg().res[Y];
      clr();
      save();
    }
    render();
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === "aw-cd") {
      const Y = +t.dataset.y,
        a = cfg();
      if (t.value && t.value > Y + "-01-01") a.cer[Y] = t.value;
      else delete a.cer[Y];
      delete a.res[Y];
      clr();
      save();
      render();
      toast("Data da cerimônia de " + Y + " atualizada.");
    } else if (t.dataset && t.dataset.awlang) {
      const a = cfg(),
        id = t.dataset.awlang;
      a.lang = a.lang.filter((x) => x !== id);
      if (t.checked) a.lang.push(id);
      clr();
      save();
      render();
    } else if (t.dataset && t.dataset.awgen) {
      const a = cfg(),
        id = t.dataset.awgen;
      a.gen = a.gen.filter((x) => x !== id);
      if (t.checked) a.gen.push(id);
      clr();
      save();
      render();
    }
  });

  /* ---------- integração (mesmo padrão da aba "Como funciona") ---------- */
  function ensure() {
    if (!document.getElementById("pg-awards")) {
      const pg = document.createElement("div");
      pg.className = "page";
      pg.id = "pg-awards";
      pg.hidden = true;
      pg.innerHTML =
        '<div class="ptop"><button class="btn" data-a="back" aria-label="Voltar para a tela inicial">← Início</button><h1>🏆 Awards</h1></div><section id="aw" aria-label="Premiação anual"></section>';
      const ref = document.getElementById("pg-feed");
      (ref && ref.parentNode
        ? ref.parentNode
        : document.querySelector(".wrap")
      ).appendChild(pg);
    }
    if (!document.getElementById("aw-btn")) {
      const t = document.querySelector(".tools"),
        b = document.createElement("button");
      b.className = "btn";
      b.id = "aw-btn";
      b.dataset.a = "nav";
      b.dataset.p = "awards";
      b.textContent = "🏆 Awards";
      if (t) {
        const ex = document.getElementById("exp");
        t.insertBefore(b, ex || null);
      }
    }
    if (!PAGES.includes("awards")) PAGES.push("awards");
  }
  ensure();
  const _r = render;
  render = function () {
    const r = _r.apply(this, arguments);
    try {
      draw();
    } catch (e) {
      console.error("Awards:", e);
    }
    return r;
  };
  window.__aw = { build, resFor, CATS, prep, P, cfg, yrs };
  if (decodeURIComponent(location.hash.slice(1)) === "awards") route();
})();
