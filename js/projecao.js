/* ===== Aba "Projeção" (Relatório → Acompanhar → Projeção) =====
   Projeção do dia detalhada:
   • padrão (ao vivo): o que você já estudou + o que costuma estudar daqui até o fim do dia
   • otimista: como se o resto do dia fosse tão bom quanto os seus 25% melhores dias
   • piso: como se fosse um dia mais fraco (25% piores)
   • congelada às 12:00: gravada ao meio-dia e NUNCA mais atualizada; serve para comparar
     com o que realmente aconteceu (histórico de acertos).
   Usa os mesmos dados do Resumo; só grava S.projFrz (as projeções congeladas). */
(function () {
  const NOON = 720,
    DAY = 1440;
  let pjOff = 0;
  const fx = (n) => n.toFixed(1).replace(".", ","),
    avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0),
    dayMs = (k) => +new Date(k + "T00:00:00"),
    hmm = (m) =>
      String(Math.floor(m / 60)).padStart(2, "0") +
      ":" +
      String(Math.round(m % 60)).padStart(2, "0"),
    b = (t) => `<b style="color:var(--ink)">${t}</b>`,
    sgn = (m) => (m > 0 ? "+" : m < 0 ? "−" : "±") + hh(Math.abs(m)),
    note = (t) =>
      `<p class="sub" style="margin:6px 0 0;font-size:.85rem">${t}</p>`;
  function pctl(a, p) {
    if (!a.length) return 0;
    const s = a.slice().sort((x, y) => x - y),
      i = (s.length - 1) * p,
      lo = Math.floor(i),
      hi = Math.ceil(i);
    return s[lo] + (s[hi] - s[lo]) * (i - lo);
  }

  /* ---------- índice de blocos por dia (calculado uma vez por renderização) ---------- */
  function index() {
    const ix = {};
    S.subjects.forEach((s) =>
      (s.sessions || []).forEach((q) => {
        let a = +new Date(q[0]);
        const e = +new Date(q[1]);
        if (!(e > a)) return;
        while (a < e) {
          const d = new Date(a),
            k = fmt(d),
            n = +new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
            z = Math.min(e, n);
          (ix[k] = ix[k] || []).push([a, z]);
          a = z;
        }
      }),
    );
    Object.values(ix).forEach((L) => L.sort((x, y) => x[0] - y[0]));
    return ix;
  }
  function upTo(ix, k, mm) {
    const c = dayMs(k) + mm * 6e4;
    let m = 0;
    (ix[k] || []).forEach(([a, z]) => {
      const o = Math.min(z, c) - a;
      if (o > 0) m += o / 6e4;
    });
    return m;
  }
  const sesSum = (ix, k) =>
    (ix[k] || []).reduce((a, [x, y]) => a + (y - x) / 6e4, 0);

  /* ---------- modelo de projeção (mNow = minuto do dia em que a projeção é feita) ---------- */
  function model(ix, map, k, mNow, tot) {
    const room = Math.max(0, DAY - mNow),
      H = [];
    for (let i = 1; i <= 45 && H.length < 20; i++) {
      const p = fmt(addD(parse(k), -i)),
        m = map[p] || 0;
      if (m <= 0) continue;
      const sp = ix[p] || [],
        ss = sesSum(ix, p);
      if (sp.length && ss >= m * 0.8)
        H.push({
          p,
          m,
          ss,
          pre: upTo(ix, p, mNow),
          end: (sp[sp.length - 1][1] - dayMs(p)) / 6e4,
        });
    }
    const act = [];
    for (let i = 1; i <= 30; i++) {
      const m = map[fmt(addD(parse(k), -i))] || 0;
      if (m > 0) act.push(m);
    }
    const ok = H.length >= 3,
      F = Math.max(tot, avg(act.slice(0, 7))),
      rems = H.map((h) => Math.max(0, h.m - h.pre)),
      endT = ok ? Math.round(avg(H.map((h) => h.end))) : 22 * 60,
      sm = upTo(ix, k, mNow),
      first = (ix[k] || [])[0],
      win = first ? (dayMs(k) + mNow * 6e4 - first[0]) / 6e4 : 0,
      rate = first && win >= 15 ? Math.min(1, sm / win) : null,
      remAct = Math.max(0, Math.min(endT, 1380) - mNow),
      B = rate != null ? tot + rate * remAct : null;
    let std, low, opt;
    if (ok) {
      std = tot + Math.min(avg(rems), room);
      low = tot + Math.min(pctl(rems, 0.25), room);
      opt = tot + Math.min(pctl(rems, 0.75), room);
    } else {
      std = B != null ? B : F;
      low = Math.max(tot, std * 0.8);
      opt = std * 1.25;
    }
    std = Math.round(Math.max(tot, std));
    low = Math.round(Math.min(std, Math.max(tot, low)));
    opt = Math.round(Math.max(std, opt));
    return {
      ok,
      H,
      rems,
      mNow,
      tot,
      std,
      low,
      opt,
      B: B != null ? Math.round(B) : null,
      rate,
      endT,
      preT: ok ? avg(H.map((h) => h.pre)) : null,
      F,
      den: H.length ? avg(H.map((h) => Math.max(0, h.ss - h.pre))) : 0,
    };
  }
  /* forma do resto do dia (0 em mNow → 1 no fim): como seus dias costumam se distribuir */
  function shapeFn(ix, M) {
    return (t) => {
      if (t >= DAY) return 1;
      if (t <= M.mNow) return 0;
      if (M.H.length && M.den > 0) {
        const num = avg(M.H.map((h) => Math.max(0, upTo(ix, h.p, t) - h.pre)));
        return Math.max(0, Math.min(1, num / M.den));
      }
      return (t - M.mNow) / (DAY - M.mNow);
    };
  }

  /* ---------- projeção congelada ao meio-dia ---------- */
  let dirty = false;
  function freeze(ix, map, k) {
    S.projFrz = S.projFrz || {};
    if (S.projFrz[k]) return S.projFrz[k];
    const t = fmt(new Date()),
      nowMs = Date.now();
    if (k > t || (k === t && nowMs < dayMs(k) + NOON * 6e4)) return null;
    const tot = Math.round(upTo(ix, k, NOON)),
      M = model(ix, map, k, NOON, tot),
      sh = shapeFn(ix, M),
      rec = {
        at: NOON,
        saved: nowMs,
        rec: nowMs - (dayMs(k) + NOON * 6e4) > 45 * 6e4 ? 1 : 0,
        tot,
        low: M.low,
        std: M.std,
        opt: M.opt,
        n: M.H.length,
        sh: Array.from({ length: 13 }, (_, i) => +sh(NOON + i * 60).toFixed(3)),
      };
    S.projFrz[k] = rec;
    const ks = Object.keys(S.projFrz).sort();
    while (ks.length > 400) delete S.projFrz[ks.shift()];
    dirty = true;
    return rec;
  }
  const flush = () => {
    if (dirty) {
      dirty = false;
      save();
    }
  };
  function auto() {
    try {
      const dn = new Date();
      if (dn.getHours() * 60 + dn.getMinutes() < NOON) return;
      freeze(index(), allDayMap(), fmt(dn));
      flush();
    } catch (e) {
      console.error("projecao auto", e);
    }
  }
  setInterval(auto, 6e4);
  setTimeout(auto, 3000);

  /* ---------- gráfico ---------- */
  function chart(o) {
    const W = 720,
      Hh = 280,
      L = 46,
      R = 14,
      T = 14,
      Bm = 30,
      x0 = o.x0,
      X = (t) => L + ((t - x0) / (DAY - x0)) * (W - L - R),
      Y = (v) => T + (1 - v / o.ymax) * (Hh - T - Bm),
      P = (pts) =>
        pts
          .map(
            ([t, v], i) =>
              (i ? "L" : "M") + X(t).toFixed(1) + " " + Y(v).toFixed(1),
          )
          .join(" "),
      step = o.ymax <= 360 ? 60 : o.ymax <= 720 ? 120 : 180;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;height:auto;display:block" role="img" aria-label="Gráfico da projeção do dia">`;
    for (let v = 0; v <= o.ymax; v += step)
      s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)" stroke-width="1"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" style="fill:var(--muted)">${v ? hh(v) : "0"}</text>`;
    for (let t = Math.ceil(x0 / 180) * 180; t <= DAY; t += 180)
      s += `<text x="${X(t)}" y="${Hh - 10}" text-anchor="middle" font-size="11" style="fill:var(--muted)">${t === DAY ? "24h" : t / 60 + "h"}</text>`;
    if (o.low && o.opt)
      s += `<path d="${P(o.low)} ${o.opt
        .slice()
        .reverse()
        .map(([t, v]) => "L" + X(t).toFixed(1) + " " + Y(v).toFixed(1))
        .join(" ")} Z" style="fill:var(--flame);opacity:.14"/>`;
    if (o.ref)
      s += `<line x1="${L}" x2="${W - R}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" stroke="#e0a31b" stroke-width="1.5" stroke-dasharray="2 4"/><text x="${W - R}" y="${Y(o.ref) - 4}" text-anchor="end" font-size="10.5" fill="#e0a31b">referência ${hh(o.ref)}</text>`;
    s += `<line x1="${X(NOON)}" x2="${X(NOON)}" y1="${T}" y2="${Hh - Bm}" style="stroke:var(--muted)" stroke-width="1" stroke-dasharray="1 4"/><text x="${X(NOON) + 4}" y="${T + 10}" font-size="10.5" style="fill:var(--muted)">🔒 12h</text>`;
    if (o.typ)
      s += `<path d="${P(o.typ)}" fill="none" stroke="#9a9cc0" stroke-width="1.6"/>`;
    if (o.low)
      s += `<path d="${P(o.low)}" fill="none" style="stroke:var(--muted)" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    if (o.frz)
      s += `<path d="${P(o.frz)}" fill="none" stroke="#a06be9" stroke-width="2.2" stroke-dasharray="2 3"/>`;
    if (o.std)
      s += `<path d="${P(o.std)}" fill="none" style="stroke:var(--ink)" stroke-width="2" stroke-dasharray="7 3"/>`;
    if (o.opt)
      s += `<path d="${P(o.opt)}" fill="none" stroke="#00A878" stroke-width="2" stroke-dasharray="7 3"/>`;
    s += `<path d="${P(o.real)}" fill="none" style="stroke:var(--flame)" stroke-width="3" stroke-linejoin="round"/>`;
    if (o.now != null)
      s += `<line x1="${X(o.now)}" x2="${X(o.now)}" y1="${T}" y2="${Hh - Bm}" style="stroke:var(--flame)" stroke-width="1" opacity=".5"/><circle cx="${X(o.now)}" cy="${Y(o.nowV)}" r="5" style="fill:var(--flame);stroke:var(--surface)" stroke-width="2"/>`;
    s += "</svg>";
    const lg = (c, t, d) =>
      `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;white-space:nowrap"><svg width="22" height="8"><line x1="0" x2="22" y1="4" y2="4" stroke="${c}" stroke-width="2.4" ${d ? 'stroke-dasharray="5 3"' : ""}/></svg>${t}</span>`;
    return `<div style="overflow-x:auto"><div style="min-width:480px">${s}</div></div><div class="sub" style="font-size:.78rem;margin-top:4px;line-height:1.9">${lg("var(--flame)", "Estudado")}${o.std ? lg("var(--ink)", "Padrão", 1) : ""}${o.opt ? lg("#00A878", "Otimista", 1) : ""}${o.low ? lg("var(--muted)", "Piso", 1) : ""}${o.frz ? lg("#a06be9", "🔒 Congelada às 12h", 1) : ""}${o.typ ? lg("#9a9cc0", "Seu dia típico") : ""}</div>`;
  }
  function realCurve(ix, k, until, tot) {
    const pts = [];
    for (let t = 0; t < until; t += 15) pts.push([t, upTo(ix, k, t)]);
    pts.push([until, Math.max(tot, upTo(ix, k, until))]);
    return pts;
  }
  function typCurve(ix, M) {
    if (!M.H.length) return null;
    const pts = [];
    for (let t = 0; t <= DAY; t += 30)
      pts.push([t, avg(M.H.map((h) => upTo(ix, h.p, t)))]);
    return pts;
  }
  function fwdCurve(M, sh, target) {
    const pts = [];
    for (let t = M.mNow; t < DAY; t += 30)
      pts.push([t, M.tot + (target - M.tot) * sh(t)]);
    pts.push([DAY, target]);
    return pts;
  }
  function frzCurve(f, target) {
    return f.sh.map((v, i) => [NOON + i * 60, f.tot + (target - f.tot) * v]);
  }
  function chartRange(ix, k, M, extra) {
    let minS = 360;
    const fs = (ix[k] || [])[0];
    if (fs) minS = Math.min(minS, (fs[0] - dayMs(k)) / 60000);
    const ty = M && typCurve(ix, M);
    if (ty) {
      const f = ty.find((p) => p[1] > 1);
      if (f) minS = Math.min(minS, f[0]);
    }
    const x0 = Math.max(0, Math.floor(minS / 60) * 60 - 60),
      mv = Math.max(60, ...extra, ty ? ty[ty.length - 1][1] : 0),
      st = mv * 1.08 <= 360 ? 60 : mv * 1.08 <= 720 ? 120 : 180;
    return { x0, ymax: Math.max(120, Math.ceil((mv * 1.08) / st) * st), ty };
  }

  /* ---------- referência do dia (mesma regra do Resumo) ---------- */
  function refOf(map, k) {
    let gT = 0;
    try {
      gT =
        repData("day", Math.round((parse(k) - parse(fmt(new Date()))) / 864e5))
          .gl.filter((o) => o.g.type === "total")
          .map((o) => o.g.min)
          .sort((a, c) => c - a)[0] || 0;
    } catch (e) {}
    const act = [];
    for (let i = 1; i <= 30; i++) {
      const m = map[fmt(addD(parse(k), -i))] || 0;
      if (m > 0) act.push(m);
    }
    return {
      ref: gT || Math.round(avg(act) / 15) * 15 || 0,
      src: gT ? "meta do dia" : "média dos seus dias de estudo",
    };
  }

  /* ---------- histórico: congelada × resultado ---------- */
  function history(ix, map) {
    const t = fmt(new Date()),
      rows = [];
    for (let i = 0; i <= 14; i++) {
      const k = fmt(addD(parse(t), -i)),
        act = map[k] || 0;
      let f = (S.projFrz || {})[k];
      if (!f && i > 0 && act > 0) f = freeze(ix, map, k);
      if (!f) continue;
      rows.push({ k, f, act, today: i === 0 });
    }
    flush();
    return rows;
  }
  function histHtml(rows) {
    let o = `<h3>📜 Histórico: projeção das 12h × resultado</h3>`;
    const done = rows.filter((r) => !r.today);
    if (!rows.length)
      return (
        o +
        note(
          "Ainda não há projeções congeladas. A de hoje é gravada às 12:00 e aparece aqui; os dias anteriores com estudo são reconstruídos a partir dos blocos com horário.",
        )
      );
    o += rows
      .map((r) => {
        const d = r.act - r.f.std,
          inside = r.act >= r.f.low && r.act <= r.f.opt,
          st = r.today
            ? "em andamento"
            : inside
              ? "✅ dentro da faixa"
              : r.act > r.f.opt
                ? "🚀 acima do otimista"
                : "⚠️ abaixo do piso";
        return `<button type="button" class="pj-row" data-a="pjday" data-k="${r.k}"><span class="pj-d">${rdDt(r.k)}${r.today ? " · hoje" : ""}</span><span class="pj-n">🔒${r.f.rec ? "↺" : ""} ≈${hh(r.f.std)} <small>(${hh(r.f.low)}–${hh(r.f.opt)})</small></span><span class="pj-n">${r.today ? "até agora " + hh(r.act) : "fez " + b(hh(r.act))}</span><span class="pj-s">${r.today ? st : sgn(d) + " · " + st}</span></button>`;
      })
      .join("");
    if (done.length >= 3) {
      const mae = avg(done.map((r) => Math.abs(r.act - r.f.std))),
        bias = avg(done.map((r) => r.act - r.f.std)),
        ins = done.filter((r) => r.act >= r.f.low && r.act <= r.f.opt).length,
        tt = avg(done.map((r) => r.act));
      o += `<div class="hsum" style="margin-top:10px">${rdCd(ins + " de " + done.length, "dias dentro da faixa (piso–otimista)")}${rdCd(hh(mae), "erro médio da projeção das 12h" + (tt ? " (" + Math.round((mae / tt) * 100) + "% do dia médio)" : ""))}${rdCd(sgn(bias), bias > 10 ? "você tende a superar a projeção" : bias < -10 ? "você tende a ficar abaixo da projeção" : "viés quase zero")}</div>`;
      o += note(
        bias > 10
          ? "A projeção padrão das 12h costuma ser conservadora para você: olhe mais para a otimista."
          : bias < -10
            ? "A projeção padrão das 12h costuma ser otimista demais para você: olhe mais para o piso."
            : mae > tt * 0.2
              ? "Na média a projeção das 12h acerta, mas o seu dia varia bastante: use a faixa piso–otimista, não só o número padrão."
              : "A projeção padrão das 12h costuma acertar bem o seu dia.",
      );
    }
    if (rows.some((r) => r.f.rec))
      o += note(
        "Dias com ↺ foram reconstruídos: o app não estava aberto ao meio-dia, então a projeção foi recalculada com os blocos registrados até as 12:00 (e congelada a partir daí).",
      );
    return o;
  }

  /* ---------- teste retroativo: quão confiável é a projeção? ---------- */
  const CPS = [540, 720, 900, 1080, 1260];
  let pjHc = 720,
    pjHw = 60,
    btC = null;
  function backtest(ix, map, W) {
    const t = fmt(new Date()),
      key =
        t +
        "|" +
        W +
        "|" +
        Object.keys(map).length +
        "|" +
        Object.values(map).reduce((a, v) => a + v, 0) +
        "|" +
        Object.keys(S.projFrz || {}).length;
    if (btC && btC.key === key) return btC.rows;
    const rows = [];
    for (let i = 1; i <= W; i++) {
      const k = fmt(addD(parse(t), -i)),
        a = map[k] || 0;
      if (a <= 0 || sesSum(ix, k) < a * 0.8) continue;
      const r = { k, a, c: {} };
      CPS.forEach((c) => {
        const tot = upTo(ix, k, c),
          M = model(ix, map, k, c, tot),
          f = c === NOON ? (S.projFrz || {})[k] : null,
          real = !!(f && f.n >= 3);
        r.c[c] = {
          ok: real ? true : M.ok,
          fz: real ? 1 : 0,
          tot,
          low: real ? f.low : M.low,
          std: real ? f.std : M.std,
          opt: real ? f.opt : M.opt,
          B: M.B,
          F: Math.round(M.F),
        };
      });
      rows.push(r);
    }
    btC = { key, rows };
    return rows;
  }
  function stats(rows, c, get) {
    const L = rows
      .map((r) => ({ k: r.k, a: r.a, o: r.c[c] }))
      .filter((x) => x.o && x.o.ok && get(x.o) != null);
    if (!L.length) return { n: 0, L };
    const e = L.map((x) => x.a - get(x.o));
    return {
      n: L.length,
      L,
      mae: avg(e.map(Math.abs)),
      mape: avg(L.map((x) => Math.abs(x.a - get(x.o)) / Math.max(x.a, 15))),
      bias: avg(e),
      hit:
        L.filter((x) => Math.abs(x.a - get(x.o)) <= Math.max(20, 0.2 * x.a))
          .length / L.length,
      ge: L.filter((x) => x.a >= get(x.o)).length / L.length,
      le: L.filter((x) => x.a <= get(x.o)).length / L.length,
    };
  }
  const gStd = (o) => o.std,
    gLow = (o) => o.low,
    gOpt = (o) => o.opt,
    gB = (o) => o.B,
    gF = (o) => o.F;
  function cover(S0) {
    const L = S0.L,
      n = L.length;
    return n
      ? {
          inn: L.filter((x) => x.a >= x.o.low && x.a <= x.o.opt).length / n,
          up: L.filter((x) => x.a > x.o.opt).length / n,
          dn: L.filter((x) => x.a < x.o.low).length / n,
        }
      : { inn: 0, up: 0, dn: 0 };
  }
  function verdict(sp, sn, cv, h) {
    if (!sp.n || sp.n < 8)
      return {
        e: "⚪",
        l: "Poucos dias para avaliar",
        c: "var(--muted)",
        t: `Só ${sp.n || 0} dia${pl(sp.n || 0)} com horário registrado e histórico suficiente para testar a projeção das ${h}h. Com 8 ou mais dias a nota fica firme.`,
      };
    const sk = sn.mae > 0 ? Math.round((1 - sp.mae / sn.mae) * 100) : 0,
      skill = sk / 100,
      cal =
        cv.inn > 0.65
          ? " A faixa piso–otimista está larga demais (quase sempre acerta)."
          : cv.inn < 0.35
            ? " A faixa piso–otimista está estreita demais (muitos dias fora dela)."
            : " A faixa piso–otimista está bem calibrada.";
    if (skill >= 0.25 && sp.mape <= 0.35)
      return {
        e: "✅",
        l: "Confiável",
        c: "#00A878",
        t: `A projeção das ${h}h erra em média ${Math.round(sp.mape * 100)}% (${hh(sp.mae)}) e é ${sk}% mais precisa que simplesmente usar a média dos últimos 7 dias.${cal}`,
      };
    if (skill >= 0.05)
      return {
        e: "🟡",
        l: "Razoável",
        c: "#e0a31b",
        t: `Erro médio de ${Math.round(sp.mape * 100)}% (${hh(sp.mae)}); só ${sk}% melhor que a média simples dos últimos 7 dias. Use mais a faixa do que o número exato.${cal}`,
      };
    return {
      e: "🔴",
      l: "Pouco confiável neste horário",
      c: "#d33",
      t: `Erro médio de ${Math.round(sp.mape * 100)}% (${hh(sp.mae)}) e ${skill < 0 ? "pior" : "praticamente igual"} à média simples dos últimos 7 dias. Neste horário, olhe a faixa ou espere um horário mais tarde (veja a tabela por horário).${cal}`,
    };
  }
  function trustLine(ix, map) {
    const rows = backtest(ix, map, pjHw),
      sp = stats(rows, pjHc, gStd),
      sn = stats(rows, pjHc, gF),
      v = verdict(sp, sn, cover(sp), pjHc / 60);
    return `<p class="sub" style="margin:10px 0 0">🧪 ${b("Confiabilidade")} (projeção das ${pjHc / 60}h, últimos ${pjHw} dias): <span style="color:${v.c};font-weight:700">${v.e} ${v.l}</span>${sp.n >= 8 ? ` · erro médio ${Math.round(sp.mape * 100)}% · ${Math.round(cover(sp).inn * 100)}% dos dias dentro da faixa` : ""} <span role="button" tabindex="0" data-a="pjgo" style="color:var(--flame);cursor:pointer;text-decoration:underline">ver teste completo ↓</span></p>`;
  }
  function btChart(L) {
    const D = L.slice().sort((x, y) => (x.k < y.k ? -1 : 1)),
      W = 720,
      Hh = 250,
      Lm = 46,
      R = 10,
      T = 12,
      Bm = 26,
      mv = Math.max(60, ...D.map((x) => Math.max(x.a, x.o.opt))) * 1.06,
      st = mv <= 360 ? 60 : mv <= 720 ? 120 : 180,
      ym = Math.ceil(mv / st) * st,
      n = D.length,
      bw = (W - Lm - R) / n,
      X = (i) => Lm + bw * (i + 0.5),
      Y = (v) => T + (1 - v / ym) * (Hh - T - Bm);
    let s = `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;height:auto;display:block" role="img" aria-label="Projeção das ${pjHc / 60}h comparada com o resultado de cada dia">`;
    for (let v = 0; v <= ym; v += st)
      s += `<line x1="${Lm}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)"/><text x="${Lm - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" style="fill:var(--muted)">${v ? hh(v) : "0"}</text>`;
    const every = Math.max(1, Math.ceil(n / 8));
    D.forEach((x, i) => {
      const inn = x.a >= x.o.low && x.a <= x.o.opt,
        col = inn ? "#00A878" : x.a > x.o.opt ? "#e0a31b" : "#d33",
        w = Math.max(3, Math.min(14, bw * 0.7));
      s += `<g><title>${rdDt(x.k)}: projeção ${hh(x.o.std)} (${hh(x.o.low)}–${hh(x.o.opt)}) · fez ${hh(x.a)}</title><rect x="${X(i) - w / 2}" y="${Y(x.o.opt)}" width="${w}" height="${Math.max(1, Y(x.o.low) - Y(x.o.opt))}" rx="2" style="fill:var(--flame);opacity:.22"/><line x1="${X(i) - w / 2 - 1}" x2="${X(i) + w / 2 + 1}" y1="${Y(x.o.std)}" y2="${Y(x.o.std)}" style="stroke:var(--ink)" stroke-width="2"/><circle cx="${X(i)}" cy="${Y(x.a)}" r="${Math.max(2.4, Math.min(4.5, bw * 0.4))}" fill="${col}"/></g>`;
      if (i % every === 0 || i === n - 1)
        s += `<text x="${X(i)}" y="${Hh - 8}" text-anchor="middle" font-size="10" style="fill:var(--muted)">${br(x.k)}</text>`;
    });
    s += "</svg>";
    const lg = (c, t) =>
      `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;white-space:nowrap"><i style="width:9px;height:9px;border-radius:50%;background:${c};display:inline-block"></i>${t}</span>`;
    return `<div style="overflow-x:auto"><div style="min-width:520px">${s}</div></div><div class="sub" style="font-size:.78rem;margin-top:4px;line-height:1.9">${lg("#00A878", "Resultado dentro da faixa")}${lg("#e0a31b", "Acima do otimista")}${lg("#d33", "Abaixo do piso")}<span style="white-space:nowrap"><span style="display:inline-block;width:16px;height:0;border-top:2px solid var(--ink);vertical-align:middle;margin-right:5px"></span>Projeção padrão</span><span style="white-space:nowrap;margin-left:12px"><span style="display:inline-block;width:12px;height:10px;background:var(--flame);opacity:.3;vertical-align:middle;margin-right:5px;border-radius:2px"></span>Faixa piso–otimista</span></div>`;
  }
  function reliab(ix, map) {
    const rows = backtest(ix, map, pjHw),
      hrs = pjHc / 60,
      sp = stats(rows, pjHc, gStd),
      sn = stats(rows, pjHc, gF),
      cv = cover(sp),
      v = verdict(sp, sn, cv, hrs),
      seg = (items, cur, a) =>
        `<div class="seg" role="group" style="margin:4px 0">${items.map(([val, lab]) => `<button class="${val === cur ? "on" : ""}" data-a="${a}" data-v="${val}">${lab}</button>`).join("")}</div>`;
    let o = `<h3 id="pj-rel">🧪 Quão confiável é a projeção? (teste com dias anteriores)</h3>`;
    o += `<p class="sub" style="margin:0 0 4px">Para cada dia passado o app refaz a projeção como ela seria naquele horário, usando só os dias anteriores a ele, e compara com o que você realmente estudou.</p>`;
    o += `<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center"><span class="sub" style="font-size:.85rem">Projeção feita às</span>${seg(
      CPS.map((c) => [c, c / 60 + "h"]),
      pjHc,
      "pjhc",
    )}<span class="sub" style="font-size:.85rem">Período</span>${seg(
      [
        [30, "30 dias"],
        [60, "60 dias"],
        [90, "90 dias"],
      ],
      pjHw,
      "pjhw",
    )}</div>`;
    o += `<div class="pj-vd" style="border-color:${v.c}"><b style="color:${v.c}">${v.e} ${v.l}</b><span>${v.t}</span></div>`;
    if (!sp.n)
      return (
        o +
        `<p class="sub" style="margin:6px 0 0">Nenhum dia do período tem horário registrado e histórico suficiente para este horário.</p>`
      );
    const skill = sn.mae > 0 ? Math.round((1 - sp.mae / sn.mae) * 100) : 0;
    o += `<div class="hsum" style="margin-top:10px">${rdCd(String(sp.n), "dias testados (de " + rows.length + " com horário)")}${rdCd(hh(sp.mae) + " · " + Math.round(sp.mape * 100) + "%", "erro médio da projeção padrão")}${rdCd(Math.round(cv.inn * 100) + "%", "dos dias dentro da faixa piso–otimista (ideal ≈ 50%)")}${rdCd((skill > 0 ? "+" : "") + skill + "%", "mais precisa que a média simples de 7 dias")}</div>`;
    o += `<p class="sub" style="margin:8px 0 0">Resultado ficou ${b(Math.round(cv.up * 100) + "% das vezes acima")} do otimista e ${b(Math.round(cv.dn * 100) + "% abaixo")} do piso (o ideal é cerca de 25% de cada lado). Viés da padrão: ${b(sgn(sp.bias))} ${sp.bias > 10 ? "(você tende a estudar mais do que o previsto)" : sp.bias < -10 ? "(você tende a estudar menos do que o previsto)" : "(sem tendência clara)"}.</p>`;
    /* por horário */
    o += `<p class="sub" style="margin:14px 0 4px">${b("Por horário em que a projeção é feita")} <small>(projeção padrão)</small></p>`;
    o += `<div style="overflow-x:auto"><table class="pj-tb"><thead><tr><th>Às</th><th>Dias</th><th>Erro médio</th><th>Erro %</th><th>Acerta ±20%</th><th>Na faixa</th><th>vs média simples</th></tr></thead><tbody>${CPS.map(
      (c) => {
        const a = stats(rows, c, gStd),
          f = stats(rows, c, gF),
          k2 = a.n && f.mae > 0 ? Math.round((1 - a.mae / f.mae) * 100) : null,
          e =
            !a.n || a.n < 8
              ? "⚪"
              : k2 >= 25 && a.mape <= 0.35
                ? "✅"
                : k2 >= 5
                  ? "🟡"
                  : "🔴";
        return a.n
          ? `<tr class="${c === pjHc ? "on" : ""}"><td>${e} ${c / 60}h</td><td>${a.n}</td><td>${hh(a.mae)}</td><td>${Math.round(a.mape * 100)}%</td><td>${Math.round(a.hit * 100)}%</td><td>${Math.round(cover(a).inn * 100)}%</td><td>${k2 > 0 ? "+" : ""}${k2}%</td></tr>`
          : `<tr><td>⚪ ${c / 60}h</td><td colspan="6" class="sub">sem dias suficientes</td></tr>`;
      },
    ).join("")}</tbody></table></div>`;
    o += `<p class="sub" style="margin:4px 0 0;font-size:.82rem">Normalmente o erro cai ao longo do dia: quanto mais tarde, mais do dia já aconteceu.</p>`;
    /* por tipo */
    const M = [
        [
          "🧱 Piso",
          gLow,
          (s) => `real ≥ piso em ${Math.round(s.ge * 100)}% (ideal 75%)`,
        ],
        [
          "📚 Padrão",
          gStd,
          (s) => `real ≥ padrão em ${Math.round(s.ge * 100)}% (ideal ≈50%)`,
        ],
        [
          "🚀 Otimista",
          gOpt,
          (s) => `real ≤ otimista em ${Math.round(s.le * 100)}% (ideal 75%)`,
        ],
        ["⚡ Ritmo de hoje", gB, () => "supõe que o ritmo atual se mantém"],
        ["📆 Média simples 7 dias", gF, () => "referência: ignora o horário"],
      ],
      sOf = M.map(([n, g, d]) => [n, stats(rows, pjHc, g), d]);
    o += `<p class="sub" style="margin:14px 0 4px">${b("Por tipo de projeção")} <small>(feitas às ${hrs}h)</small></p>`;
    o += `<div style="overflow-x:auto"><table class="pj-tb"><thead><tr><th>Projeção</th><th>Dias</th><th>Erro médio</th><th>Erro %</th><th>Acerta ±20%</th><th>Calibração</th></tr></thead><tbody>${sOf
      .map(([n, s, d]) =>
        s.n
          ? `<tr><td>${n}</td><td>${s.n}</td><td>${hh(s.mae)}</td><td>${Math.round(s.mape * 100)}%</td><td>${Math.round(s.hit * 100)}%</td><td class="sub">${d(s)}</td></tr>`
          : `<tr><td>${n}</td><td colspan="5" class="sub">sem dias suficientes</td></tr>`,
      )
      .join("")}</tbody></table></div>`;
    const best = sOf
      .filter(([n, s]) => s.n >= 8 && !/Piso|Otimista/.test(n))
      .sort((a, c) => a[1].mae - c[1].mae)[0];
    if (best)
      o += `<p class="sub" style="margin:6px 0 0">🏅 Neste horário, a que mais acertou o número foi ${b(best[0].replace(/^\S+\s/, ""))} (erro médio ${hh(best[1].mae)}). Piso e otimista não competem por precisão: marcam os limites da faixa.</p>`;
    /* gráfico + lista */
    o += `<p class="sub" style="margin:14px 0 4px">${b("Dia a dia")}: projeção das ${hrs}h × resultado</p>${btChart(sp.L)}`;
    const list = sp.L.slice()
      .sort((x, y) => (x.k < y.k ? 1 : -1))
      .map((x) => {
        const inn = x.a >= x.o.low && x.a <= x.o.opt,
          d = x.a - x.o.std;
        return `<button type="button" class="pj-row" data-a="pjday" data-k="${x.k}"><span class="pj-d">${rdDt(x.k)}</span><span class="pj-n">${x.o.fz ? "🔒" : "↺"} ≈${hh(x.o.std)} <small>(${hh(x.o.low)}–${hh(x.o.opt)})</small></span><span class="pj-n">fez ${b(hh(x.a))}</span><span class="pj-s">${sgn(d)} · ${inn ? "✅ na faixa" : x.a > x.o.opt ? "🚀 acima" : "⚠️ abaixo"}</span></button>`;
      })
      .join("");
    o += `<details style="margin-top:10px"><summary class="sub" style="cursor:pointer">Ver os ${sp.n} dias testados</summary>${list}<p class="sub" style="font-size:.8rem;margin:6px 0 0">🔒 = projeção realmente congelada às 12h · ↺ = refeita agora com os dados que existiam até aquele horário.</p></details>`;
    o += `<p class="sub" style="margin:10px 0 0;font-size:.8rem">Só entram dias em que os blocos com horário cobrem pelo menos 80% do tempo estudado e em que havia 3 ou mais dias anteriores com horário. Dias sem estudo não entram.</p>`;
    return o;
  }

  /* ---------- corpo da aba ---------- */
  function body() {
    const ix = index(),
      map = allDayMap(),
      t = fmt(new Date()),
      k = fmt(addD(parse(t), pjOff)),
      dn = new Date(),
      mNow = dn.getHours() * 60 + dn.getMinutes();
    return pjOff === 0 ? bodyToday(ix, map, k, dn, mNow) : bodyPast(ix, map, k);
  }
  function bodyToday(ix, map, k, dn, mNow) {
    const tot = map[k] || 0,
      M = model(ix, map, k, mNow, tot),
      sh = shapeFn(ix, M),
      fz = mNow >= NOON ? freeze(ix, map, k) : null,
      { ref, src } = refOf(map, k);
    flush();
    let bm = 0,
      bk = null;
    Object.keys(map).forEach((x) => {
      if (x !== k && x <= k && map[x] > bm) {
        bm = map[x];
        bk = x;
      }
    });
    let o = "";
    const left = NOON - mNow,
      cardFz = fz
        ? rdCd(
            "🔒 ≈ " + hh(fz.std),
            `congelada às 12:00${fz.rec ? " (reconstruída)" : ""} · não muda mais`,
          )
        : rdCd(
            "🔓 ≈ " + hh(M.std),
            `provisória · congela às 12:00 (faltam ${hh(left)})`,
          );
    o += `<div class="hsum">${rdCd(hh(tot), "estudado até agora (" + hmm(mNow) + ")")}${rdCd("≈ " + hh(M.std), "projeção padrão · ao vivo")}${rdCd("≈ " + hh(M.opt), "projeção otimista")}${cardFz}</div>`;
    /* faixa */
    const mx = Math.max(M.opt, tot, ref, fz ? fz.opt : 0, 1) * 1.05,
      pos = (v) => Math.min(100, (v / mx) * 100).toFixed(1);
    o += `<div class="pj-band" title="Faixa provável do dia"><i class="pj-rng" style="left:${pos(M.low)}%;width:${Math.max(0.5, pos(M.opt) - pos(M.low)).toFixed(1)}%"></i><i class="pj-fill" style="width:${pos(tot)}%"></i><i class="pj-mk" style="left:${pos(M.std)}%"></i>${ref ? `<i class="pj-ref" style="left:${pos(ref)}%" title="referência ${hh(ref)}"></i>` : ""}${fz ? `<i class="pj-frz" style="left:${pos(fz.std)}%" title="congelada ${hh(fz.std)}"></i>` : ""}</div><div class="sub" style="font-size:.8rem;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><span>Piso ${hh(M.low)}</span><span>Padrão ${hh(M.std)}</span><span>Otimista ${hh(M.opt)}</span>${ref ? `<span style="color:#e0a31b">Referência ${hh(ref)}</span>` : ""}</div>`;
    if (!M.ok)
      o += note(
        "ℹ️ Ainda não há 3 dias com horário registrado para projetar pelo seu padrão; por enquanto a projeção usa uma estimativa simples (ritmo de hoje ou média recente) e as faixas são aproximadas.",
      );
    o += trustLine(ix, map);
    if (M.std - tot < 15 && mNow >= 18 * 60)
      o += note(
        "💡 Por que a projeção quase não passa do que você já estudou? Ela é o que você já estudou somando o que costuma estudar depois deste horário. À noite essa sobra é pequena; se você estudar mais, a projeção sobe junto, porque o total subiu.",
      );
    /* gráfico */
    const R0 = chartRange(ix, k, M, [M.opt, tot, ref, fz ? fz.opt : 0]),
      curves = {
        x0: R0.x0,
        ymax: R0.ymax,
        typ: R0.ty,
        real: realCurve(ix, k, mNow, tot),
        std: fwdCurve(M, sh, M.std),
        opt: fwdCurve(M, sh, M.opt),
        low: fwdCurve(M, sh, M.low),
        frz: fz ? frzCurve(fz, fz.std) : null,
        ref,
        now: mNow,
        nowV: tot,
      };
    o += `<h3>📈 Como o dia deve se desenhar</h3>${chart(curves)}`;
    /* leitura */
    o += `<h3>🔎 Leitura detalhada</h3>`;
    if (M.ok) {
      o += rdLn(
        `📚 ${b("Padrão:")} até ${hmm(mNow)} você costuma ter ${hh(M.preT)} e depois ainda estuda ≈${hh(avg(M.rems))} (média de ${M.H.length} dias) → fecha em ≈${b(hh(M.std))}.`,
      );
      o += rdLn(
        `🚀 ${b("Otimista:")} nos 25% melhores dos ${M.H.length} dias usados, depois deste horário você estudou ≈${hh(pctl(M.rems, 0.75))} ou mais → fecha em ≈${b(hh(M.opt))}.`,
      );
      o += rdLn(
        `🧱 ${b("Piso:")} nos dias mais fracos você estudou só ≈${hh(pctl(M.rems, 0.25))} depois deste horário → ≈${b(hh(M.low))}.`,
      );
      if (M.preT > 0) {
        const x = Math.round(((tot - M.preT) / M.preT) * 100);
        o += rdLn(
          `🕐 Neste horário você costuma ter ${hh(M.preT)}; hoje tem ${hh(tot)} → ${b(Math.abs(x) < 5 ? "dentro do normal" : x > 0 ? x + "% à frente" : Math.abs(x) + "% atrás")}.`,
        );
      }
    }
    if (M.B != null)
      o += rdLn(
        `⚡ ${b("Mantendo o ritmo de hoje")} (${Math.round(M.rate * 60)} min de estudo por hora) até ${hmm(Math.min(M.endT, 1380))}, seu horário usual de encerrar: ≈${b(hh(M.B))}. Esse é o cenário de ritmo, não de padrão.`,
      );
    if (M.ok) {
      const ch = (need) =>
        need <= 0
          ? 100
          : Math.round(
              (M.rems.filter((r) => r >= need).length / M.rems.length) * 100,
            );
      if (ref) {
        const need = ref - tot;
        o += rdLn(
          need <= 0
            ? `🎉 Referência do dia (${hh(ref)} · ${src}) já batida.`
            : `🎯 Referência do dia: ${hh(ref)} (${src}). Faltam ${b(hh(need))}; em ${b(ch(need) + "%")} dos dias parecidos você estudou isso ou mais depois deste horário.`,
        );
      }
      if (bk && bm > tot) {
        const need = bm - tot;
        o += rdLn(
          `🏆 Para igualar o seu melhor dia (${hh(bm)} em ${rdDt(bk)}) faltam ${b(hh(need))}; chance histórica: ${b(ch(need) + "%")}.`,
        );
      }
      const goal = ref && tot < ref ? ref - tot : bm > tot ? bm - tot : 0;
      if (goal > 0 && mNow < 22 * 60) {
        const hl = (22 * 60 - mNow) / 60;
        o += rdLn(
          `⏳ Ritmo necessário até as 22h: ≈${b(Math.round(goal / hl) + " min por hora")} para fechar ${ref && tot < ref ? "a referência" : "o melhor dia"}.`,
        );
      }
    }
    /* marcos */
    const marks = [15, 18, 21, 24].filter((h) => h * 60 > mNow + 20);
    if (marks.length) {
      o += `<h3>⏱️ Quanto você deve ter até…</h3>`;
      o += marks
        .map((h) => {
          const v = (T) => Math.round(tot + (T - tot) * sh(h * 60));
          return rdRow(
            `Até ${h === 24 ? "o fim do dia" : h + "h"}`,
            `${b("≈" + hh(v(M.std)))} <small style="color:var(--muted)">piso ${hh(v(M.low))} · otimista ${hh(v(M.opt))}</small>`,
          );
        })
        .join("");
    }
    o += `<p class="sub" style="margin:8px 0 0;font-size:.8rem">Atualizado às ${dn.toTimeString().slice(0, 8)} · a projeção padrão e a otimista se atualizam sozinhas a cada 30 s.</p>`;
    o += explain();
    o += reliab(ix, map) + histHtml(history(ix, map));
    return o;
  }
  function bodyPast(ix, map, k) {
    const act = map[k] || 0,
      f = freeze(ix, map, k);
    flush();
    let o = "";
    if (!f)
      return (
        note("Não foi possível reconstruir a projeção deste dia.") +
        histHtml(history(ix, map))
      );
    const d = act - f.std,
      inside = act >= f.low && act <= f.opt;
    o += `<div class="hsum">${rdCd(hh(act), "resultado final do dia")}${rdCd("🔒 ≈ " + hh(f.std), "projeção padrão das 12:00" + (f.rec ? " (reconstruída)" : ""))}${rdCd(hh(f.low) + " – " + hh(f.opt), "faixa provável (piso–otimista)")}${rdCd(sgn(d), inside ? "✅ dentro da faixa" : act > f.opt ? "🚀 acima do otimista" : "⚠️ abaixo do piso")}</div>`;
    const M = model(ix, map, k, NOON, f.tot),
      R0 = chartRange(ix, k, M, [f.opt, act, f.tot]);
    o += `<h3>📈 Projeção das 12h × o que aconteceu</h3>${chart({
      x0: R0.x0,
      ymax: R0.ymax,
      typ: R0.ty,
      real: realCurve(ix, k, DAY, act),
      std: frzCurve(f, f.std),
      opt: frzCurve(f, f.opt),
      low: frzCurve(f, f.low),
      ref: 0,
      now: null,
    })}`;
    o += rdLn(
      `A projeção foi congelada às 12:00 com ${hh(f.tot)} já estudados e ${f.n} dias de histórico. O dia terminou em ${b(hh(act))}, ${b(sgn(d))} em relação à padrão.`,
      8,
    );
    o += explain();
    o += reliab(ix, map) + histHtml(history(ix, map));
    return o;
  }
  const explain = () =>
    `<details style="margin-top:12px"><summary class="sub" style="cursor:pointer">Como cada projeção é calculada</summary><div class="sub" style="font-size:.85rem;line-height:1.5;margin-top:6px"><p style="margin:4px 0"><b style="color:var(--ink)">Padrão:</b> o que você já estudou hoje + a média do que, nos seus últimos dias com horário registrado (até 20), foi estudado depois deste mesmo horário. É a mesma do Resumo, e muda sempre que o total ou a hora muda.</p><p style="margin:4px 0"><b style="color:var(--ink)">Otimista:</b> o que você já estudou + o que os seus 25% melhores dias estudaram depois deste horário.</p><p style="margin:4px 0"><b style="color:var(--ink)">Piso:</b> o mesmo, com os 25% mais fracos. O trecho entre piso e otimista é a faixa provável do dia.</p><p style="margin:4px 0"><b style="color:var(--ink)">Congelada às 12:00:</b> a projeção padrão calculada com o que você tinha às 12:00 (e a faixa piso–otimista). Depois disso ela não é recalculada: serve para você ver, no fim do dia, o quanto a previsão acertou.</p><p style="margin:4px 0">Sem 3 dias com horário registrado, o app usa uma estimativa simples (ritmo de hoje ou média recente).</p></div></details>`;

  /* ---------- encaixe na aba Acompanhar ---------- */
  const acomp = RPG.find((g) => g[0] === "acomp");
  if (acomp && !acomp[2].some((s) => s[0] === "proj"))
    acomp[2].splice(1, 0, ["proj", "🔮 Projeção"]);
  const _rr = renderRep;
  renderRep = function () {
    if (rTab !== "proj") return _rr.apply(this, arguments);
    const el = $("#rp");
    if (!el || curPage !== "relatorio") return;
    ["rp-subj", "rp-obj", "rp-hist", "rp-cal"].forEach((i) => {
      const x = document.getElementById(i);
      if (x) x.hidden = true;
    });
    const t = fmt(new Date()),
      k = fmt(addD(parse(t), pjOff)),
      lab = parse(k).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    let inner;
    try {
      inner = body();
    } catch (e) {
      console.error("projecao", e);
      inner = note("Não foi possível montar a projeção agora.");
    }
    el.innerHTML =
      rpTabs() +
      `<div class="mgs"><div class="ch"><h2 style="text-transform:none">🔮 Projeção · ${esc(lab)}${pjOff === 0 ? ' <span style="font-weight:500;font-size:1rem;color:var(--muted)">· ao vivo</span>' : ""}</h2><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" data-a="pjnav" data-v="-1" aria-label="Dia anterior">‹</button><button class="btn" data-a="pjnav" data-v="0">Hoje</button><button class="btn" data-a="pjnav" data-v="1" aria-label="Próximo dia"${pjOff === 0 ? " disabled" : ""}>›</button></span></div><div id="pj-root">${inner}</div></div>`;
  };
  document.addEventListener("click", (e) => {
    const x = e.target.closest('[data-a^="pj"]');
    if (!x) return;
    const a = x.dataset.a;
    if (a === "pjgo") {
      const h = document.getElementById("pj-rel");
      if (h && h.scrollIntoView)
        h.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (a === "pjhc" || a === "pjhw") {
      if (a === "pjhc") pjHc = +x.dataset.v;
      else pjHw = +x.dataset.v;
      const r = document.getElementById("pj-root");
      if (r) {
        r.innerHTML = body();
        const h = document.getElementById("pj-rel");
        if (h && h.scrollIntoView) h.scrollIntoView({ block: "start" });
      }
      return;
    }
    if (a === "pjnav") {
      const v = +x.dataset.v;
      pjOff = v === 0 ? 0 : Math.min(0, pjOff + v);
    } else if (a === "pjday")
      pjOff = Math.round((parse(x.dataset.k) - parse(fmt(new Date()))) / 864e5);
    else return;
    renderRep();
    const top = document.getElementById("rp");
    if (top && top.scrollIntoView && a === "pjday")
      top.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  setInterval(() => {
    try {
      if (
        curPage !== "relatorio" ||
        rTab !== "proj" ||
        pjOff !== 0 ||
        document.hidden
      )
        return;
      const e = document.getElementById("pj-root");
      if (e) e.innerHTML = body();
    } catch (x) {}
  }, 3e4);
})();
