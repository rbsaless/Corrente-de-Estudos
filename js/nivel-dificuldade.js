/* ===== Dificuldade por nível =====
   Carregar DEPOIS de faculdade.js e ANTES de lumi.js.
   Nível de dificuldade (S.dif.lv) é SEMPRE igual ao nível atual (sobe e cai junto, sem atraso). O piso novo vale a partir de amanhã
   (histórico por data). Efeitos (por faixa de 5 níveis): mínimo da streak, lazer, ociosidade, preços. */
(() => {
  const minF0 = (n) =>
    Math.round(
      (60 + 540 * Math.pow((Math.max(1, Math.min(100, n)) - 1) / 99, 1.05)) / 5,
    ) * 5; /* min/dia: nível 1=60, 100=600 */
  /* Faixas de 5 níveis: dentro de cada bloco de 10, a 1ª metade usa o nível inicial do bloco e a 2ª metade usa o nível final (1–5→1, 6–10→10, 11–15→11, 16–20→20...) */
  const rep = (n) => {
    n = Math.max(1, Math.min(100, Math.round(+n) || 1));
    const b = Math.floor((n - 1) / 10) * 10;
    return (n - 1) % 10 < 5 ? b + 1 : b + 10;
  };
  const minF = (n) => minF0(rep(n));
  const tt = () => {
    const l = (S.dif && S.dif.lv) || 1;
    return (rep(l) - 1) / 99;
  };
  const MUL = () => {
    const t = tt();
    return { laz: 1 - 0.5 * t, idle: 1 + t, preco: 1 + 1.5 * t };
  };
  const f1 = (x) => x.toFixed(2).replace(/0$/, "").replace(".", ",");

  function floorAt(d) {
    let m = 0;
    if (S.dif && Array.isArray(S.dif.h))
      S.dif.h.forEach((h) => {
        if (h.from <= d) m = minF(h.lv);
      });
    return m;
  }
  function difInit() {
    if (S.dif && Array.isArray(S.dif.h)) return S.dif;
    const t = fmt(now());
    return (S.dif = {
      lv: 1,
      tg: 1,
      ok: t,
      up: t,
      h: [{ from: fmt(addD(now(), 1)), lv: 1 }],
    });
  }
  function difUpdate() {
    const d = difInit(),
      t = fmt(now());
    const cur = Math.max(1, Math.min(100, lvInfo(xpRun().xp).n));
    if (d.lv === cur && d.tg === cur) return;
    d.lv = d.tg = cur;
    const f = fmt(addD(now(), 1));
    d.h = d.h.filter((x) => x.from !== f);
    d.h.push({ from: f, lv: cur });
    if (d.h.length > 300) d.h.splice(0, d.h.length - 300);
    save();
  }

  /* 1) mínimo da streak: nunca abaixo do piso do nível (com histórico por data) */
  const _sm = stkMin;
  stkMin = function (d) {
    return Math.max(_sm.apply(this, arguments), floorAt(d));
  };

  /* 2) lazer ganho */
  const _lg = lzGain;
  lzGain = function () {
    const id = _lg.apply(this, arguments);
    if (id) {
      const e = lzCfg().led.find((x) => x.id === id),
        k = MUL().laz;
      if (e && k !== 1) e.min = Math.round(e.min * k * 100) / 100;
    }
    return id;
  };

  /* 3) ociosidade: escala temporariamente a taxa lr durante o cálculo */
  const withIdle = (fn, rate) =>
    function () {
      const d = idCfg(),
        z = lzCfg(),
        o = d.lr,
        r = z.rate,
        m = MUL();
      d.lr = o * m.idle;
      if (rate) z.rate = r * m.laz;
      try {
        return fn.apply(this, arguments);
      } finally {
        d.lr = o;
        z.rate = r;
      }
    };
  idCharge = withIdle(idCharge);
  idRetro = withIdle(idRetro);
  pdlCalc = withIdle(pdlCalc);
  lpCtx = withIdle(lpCtx, true);

  /* 4) preços da loja (itens grátis continuam grátis) */
  const _si = shInfo;
  shInfo = function () {
    const I = _si.apply(this, arguments);
    if (I.price > 0) I.price = Math.round(I.price * MUL().preco);
    return I;
  };

  /* Redução de mínimo da loja não baixa abaixo do piso */
  document.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest('[data-sp="min"]');
      if (!b) return;
      const v = parseInt((document.getElementById("sk-m") || {}).value),
        f = floorAt(fmt(now()));
      if (v < f) {
        e.stopImmediatePropagation();
        toast(
          "Seu nível exige no mínimo " +
            hh(f) +
            " por dia. Não dá para reduzir abaixo disso.",
        );
      }
    },
    true,
  );

  /* Resumo na tela inicial */
  const _rl = renderLvl;
  renderLvl = function () {
    const r = _rl.apply(this, arguments);
    try {
      const m = document.querySelector("#lvl .lvm");
      if (m && S.dif) {
        const M = MUL(),
          t = fmt(now()),
          n = fmt(addD(now(), 1));
        m.insertAdjacentHTML(
          "beforeend",
          '<div class="lvx">⚙️ Dificuldade nível ' +
            S.dif.lv +
            (S.dif.lv < S.dif.tg ? " (subindo até " + S.dif.tg + ")" : "") +
            " · mínimo " +
            hh(Math.max(stkMin(t), floorAt(n))) +
            "/dia · lazer ×" +
            f1(M.laz) +
            " · ociosidade ×" +
            f1(M.idle) +
            " · preços ×" +
            f1(M.preco) +
            "</div>",
        );
      }
    } catch (e) {}
    return r;
  };

  /* Constância: segunda streak, mínimo FIXO de 15 min/dia (independe do nível, da loja e de folgas) */
  const CST_MIN = 15;
  function cstInfo() {
    const t = fmt(now()),
      ds = new Set();
    S.subjects.forEach((s) =>
      Object.keys(s.days).forEach((k) => {
        if (k <= t) ds.add(k);
      }),
    );
    const ok = (k) => stkTot(k) >= CST_MIN,
      A = [...ds].filter(ok).sort();
    let best = 0,
      run = 0,
      prev = null;
    A.forEach((k) => {
      run = prev && fmt(addD(parse(prev), 1)) === k ? run + 1 : 1;
      prev = k;
      if (run > best) best = run;
    });
    let d = now();
    if (!ok(fmt(d))) d = addD(d, -1);
    let cur = 0;
    while (ok(fmt(d))) {
      cur++;
      d = addD(d, -1);
    }
    return { cur, best: Math.max(best, cur), hoje: Math.round(stkTot(t)) };
  }
  function cstShow() {
    const c = $("#lzb"),
      o = $("#cst");
    if (o) o.remove();
    if (!c) return;
    const i = cstInfo();
    c.insertAdjacentHTML(
      "beforeend",
      `<div id="cst" class="tbadge" style="margin-top:4px;font-size:.78em;opacity:.85">🌱 Constância ${i.cur} dia${i.cur === 1 ? "" : "s"} · recorde ${i.best} · ${i.hoje >= CST_MIN ? "hoje ✓" : "hoje " + i.hoje + "/" + CST_MIN + " min"}</div>`,
    );
  }
  const _ic = idChip;
  idChip = function () {
    const r = _ic.apply(this, arguments);
    try {
      cstShow();
    } catch (e) {
      console.error("Constância:", e);
    }
    return r;
  };

  const _r = render;
  render = function () {
    try {
      difUpdate();
    } catch (e) {
      console.error("Dificuldade:", e);
    }
    return _r.apply(this, arguments);
  };
  window.__dif = { minF, rep, floorAt, MUL, difUpdate, cstInfo };
})();
