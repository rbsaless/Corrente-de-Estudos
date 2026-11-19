/* ===== Resumo extra (Relatório → Acompanhar → Resumo) =====
   Quatro seções que se somam às que já existiam:
   1) Planejado × realizado por matéria   2) Mapa de calor de horários
   3) Calendário de intensidade (mês/ano)  4) Qualidade dos blocos
   Tudo é calculado na hora a partir do que já está salvo; nada novo é gravado. */
(function () {
  const fx = (n) => n.toFixed(1).replace(".", ","),
    pc = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0),
    h3 = (t) => `<h3>${t}</h3>`,
    note = (t) =>
      `<p class="sub" style="margin:6px 0 0;font-size:.85rem">${t}</p>`,
    bold = (t) => `<b style="color:var(--ink)">${t}</b>`;
  const BANDS = [
    ["🌙", "Madrugada", 0, 5],
    ["🌅", "Manhã", 6, 11],
    ["☀️", "Tarde", 12, 17],
    ["🌆", "Noite", 18, 23],
  ];
  const band = (h) => BANDS.findIndex((b) => h >= b[2] && h <= b[3]);

  /* blocos com horário que COMEÇAM dentro do período */
  function blocks(keys) {
    const set = new Set(keys),
      L = [];
    S.subjects.forEach((s) =>
      (s.sessions || []).forEach((q) => {
        const a = new Date(q[0]),
          b = new Date(q[1]);
        if (isNaN(a) || isNaN(b) || b <= a || !set.has(fmt(a))) return;
        L.push({ a, b, m: (b - a) / 6e4, s, u: !!q[2], k: fmt(a) });
      }),
    );
    return L.sort((x, y) => x.a - y.a);
  }
  const logs = (keys) =>
    (S.log || []).filter((x) => keys.includes(x.d) && x.f > 0);

  /* ---------- 1) Planejado × realizado por matéria ---------- */
  function secPlan(d) {
    const keys = d.keys,
      t = fmt(new Date()),
      past = keys.filter((k) => k <= t),
      snaps = S.planSnap || {},
      meta = {};
    let cov = 0;
    past.forEach((k) => {
      const w = snaps[fmt(monday(parse(k)))],
        ds = w && w[k];
      if (ds) {
        cov++;
        Object.keys(ds).forEach((id) => (meta[id] = (meta[id] || 0) + ds[id]));
      }
    });
    const rows = S.subjects
      .map((s) => {
        const real = keysMin(keys, s),
          pl = keys.reduce((a, k) => a + plOf(s, k), 0);
        return {
          s,
          real,
          fora: Math.max(0, real - pl),
          meta: meta[s.id] || 0,
        };
      })
      .filter((r) => r.real > 0 || r.meta > 0)
      .sort((a, b) => Math.max(b.real, b.meta) - Math.max(a.real, a.meta));
    let o = h3("🎯 Planejado × realizado por matéria");
    if (!rows.length)
      return o + note("Nenhum estudo nem meta de plano neste período.");
    const tot = rows.reduce((a, r) => a + r.real, 0),
      fora = rows.reduce((a, r) => a + r.fora, 0),
      wm = rows.filter((r) => r.meta > 0),
      mT = wm.reduce((a, r) => a + r.meta, 0),
      okT = wm.reduce((a, r) => a + Math.min(r.real, r.meta), 0),
      mx = Math.max(...rows.map((r) => Math.max(r.real, r.meta)), 1);
    o += `<div class="hsum">${rdCd(hh(tot), "estudado")}${cov && mT ? rdCd(hh(mT), "meta do plano") + rdCd(pc(okT, mT) + "%", "do plano cumprido") : ""}${rdCd(hh(fora), "fora do plano (" + pc(fora, tot) + "%)")}</div>`;
    o += rows
      .map((r) => {
        const cmp =
          cov && r.meta
            ? `<span class="sub" style="font-size:.82rem">meta ${hh(r.meta)} · ${rdS(rdDp(r.real, r.meta))}</span>`
            : "";
        return `<div style="margin:10px 0"><div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-size:.9rem;overflow-wrap:anywhere"><i class="rx-dot" style="background:${r.s.color}"></i>${esc(r.s.name)}</span><b>${hh(r.real)}</b>${cmp}</div><div class="rx-pb"><div style="width:${r.real > 0 ? Math.max(2, Math.round((r.real / mx) * 100)) : 0}%;background:${r.s.color}"></div>${cov && r.meta ? `<i style="left:${Math.min(99, Math.round((r.meta / mx) * 100))}%" title="meta do plano: ${hh(r.meta)}"></i>` : ""}</div>${r.fora > 0 && r.real ? `<small style="display:block;color:var(--muted);margin-top:2px">${hh(r.fora)} fora do plano</small>` : ""}</div>`;
      })
      .join("");
    if (cov && mT) {
      const over = wm.filter((r) => r.real >= r.meta).map((r) => esc(r.s.name)),
        under = wm
          .filter((r) => r.real < r.meta)
          .sort((a, b) => b.meta - b.real - (a.meta - a.real))
          .slice(0, 3);
      if (over.length)
        o += rdLn(`✅ Meta batida em: ${bold(over.join(", "))}.`);
      if (under.length)
        o += rdLn(
          `⚠️ Ficaram devendo: ${under.map((r) => bold(esc(r.s.name)) + " (−" + hh(r.meta - r.real) + ")").join(", ")}.`,
        );
      o += note(
        "▏ A marca em cada barra é a meta que o plano semanal definiu.",
      );
    }
    const exp = past.length;
    if (!cov)
      o += note(
        "Ainda não há plano gravado neste período, então só aparece o que foi estudado. O plano de cada dia é gravado quando você abre Planejar → Plano semanal; a partir daí a comparação com a meta aparece aqui.",
      );
    else if (cov < exp)
      o += note(
        `Plano gravado em ${cov} de ${exp} dias do período; os demais ficam sem meta para comparar.`,
      );
    return o;
  }

  /* ---------- 2) Mapa de calor de horários ---------- */
  function secHeat(d) {
    if (d.v === "day") return "";
    const B = blocks(d.keys),
      grid = Array.from({ length: 7 }, () => Array(24).fill(0)),
      hr = Array(24).fill(0);
    let sm = 0;
    B.forEach((x) => {
      let c = new Date(x.a);
      while (c < x.b) {
        const nx = new Date(
            c.getFullYear(),
            c.getMonth(),
            c.getDate(),
            c.getHours() + 1,
          ),
          e = nx < x.b ? nx : x.b,
          m = (e - c) / 6e4;
        grid[(c.getDay() + 6) % 7][c.getHours()] += m;
        hr[c.getHours()] += m;
        sm += m;
        c = e;
      }
    });
    let o = h3("🔥 Mapa de calor: quando você estuda");
    if (sm < 1)
      return (
        o +
        note(
          "Ainda não há blocos com horário neste período. Estudos registrados só com o total do dia não entram no mapa.",
        )
      );
    const mx = Math.max(...grid.flat(), 1);
    let hm = `<div class="rx-hm"><span></span>${Array.from({ length: 24 }, (_, h) => `<small>${h % 3 === 0 ? h : ""}</small>`).join("")}`;
    grid.forEach((row, wd) => {
      hm += `<small class="rx-wd">${DIAS[wd]}</small>`;
      row.forEach((m, h) => {
        hm += `<span class="rx-c${m > 0 ? " on" : ""}" style="--o:${m > 0 ? (0.18 + 0.82 * (m / mx)).toFixed(2) : 0}" title="${DIAS[wd]} ${String(h).padStart(2, "0")}h: ${m > 0 ? hh(m) : "sem estudo"}"></span>`;
      });
    });
    o += `<div style="overflow-x:auto;padding-bottom:4px">${hm}</div>${note("Quanto mais forte a cor, mais tempo estudado naquela hora (linhas: dia da semana · colunas: hora do dia).")}`;
    /* melhor janela de 3 horas */
    let bi = 0,
      bv = -1;
    for (let i = 0; i <= 21; i++) {
      const v = hr[i] + hr[i + 1] + hr[i + 2];
      if (v > bv) {
        bv = v;
        bi = i;
      }
    }
    if (sm >= 30)
      o += rdLn(
        `⏰ Seu horário mais forte: ${bold(String(bi).padStart(2, "0") + "h às " + String(bi + 3).padStart(2, "0") + "h")} (${pc(bv, sm)}% do tempo com horário registrado).`,
        8,
      );
    if (d.v !== "week") {
      const map = allDayMap(),
        wd = Array(7).fill(0),
        wn = Array(7).fill(0);
      d.keys.forEach((k) => {
        const m = map[k] || 0;
        if (m > 0) {
          wd[(parse(k).getDay() + 6) % 7] += m;
          wn[(parse(k).getDay() + 6) % 7]++;
        }
      });
      const tw = wd.reduce((a, b) => a + b, 0);
      if (tw > 0) {
        const bi2 = wd.indexOf(Math.max(...wd)),
          av = wd.map((m, i) => (wn[i] ? m / wn[i] : 0)),
          bj = av.indexOf(Math.max(...av));
        o += rdLn(
          `📅 Dia da semana em que mais estuda: ${bold(DIAS[bi2])} (${pc(wd[bi2], tw)}% do total). Maior média por dia estudado: ${bold(DIAS[bj])} (${hh(av[bj])}).`,
        );
      }
    }
    /* concentração por faixa do dia */
    const lg = logs(d.keys).filter((x) => x.h != null && !isNaN(+x.h)),
      bs = BANDS.map((b, i) => {
        const L = lg.filter((x) => band(+x.h) === i);
        return {
          b,
          n: L.length,
          f: L.length ? L.reduce((a, x) => a + x.f, 0) / L.length : 0,
          m: hr.slice(b[2], b[3] + 1).reduce((a, v) => a + v, 0),
        };
      });
    if (lg.length) {
      o += `<p class="sub" style="margin:12px 0 2px">${bold("Concentração por faixa do dia")}</p>`;
      o += bs
        .filter((x) => x.n || x.m)
        .map((x) =>
          rdBar(
            `${x.b[0]} ${x.b[1]} <span class="sub" style="font-size:.8rem">· ${hh(x.m)} estudados${x.n ? " · " + x.n + " registro" + pl(x.n) : ""}</span>`,
            x.f,
            5,
            "var(--flame)",
            1,
            x.n ? fx(x.f) + "/5" : "—",
          ),
        )
        .join("");
      const ok = bs.filter((x) => x.n >= 2).sort((a, b) => b.f - a.f),
        most = bs.slice().sort((a, b) => b.m - a.m)[0];
      if (ok.length) {
        o += rdLn(
          `🧠 Você rende melhor ${bold(ok[0].b[0] + " " + ok[0].b[1].toLowerCase())} (concentração ${fx(ok[0].f)}/5).`,
        );
        if (most && most.m > 0 && most.b[1] !== ok[0].b[1])
          o += rdLn(
            `💡 Mas é ${bold(most.b[1].toLowerCase())} que você mais estuda. Se der, mova as matérias mais difíceis para ${ok[0].b[1].toLowerCase()}.`,
          );
      }
    }
    const cov = d.tot > 0 ? pc(sm, d.tot) : 100;
    if (cov < 90)
      o += note(
        `⏱️ Só ${cov}% do tempo deste período tem horário registrado; o resto (registros manuais sem hora) não aparece no mapa.`,
      );
    return o;
  }

  /* ---------- 3) Calendário de intensidade (mês e ano) ---------- */
  function secCal(d) {
    if (d.v !== "month" && d.v !== "year") return "";
    const keys = d.keys,
      map = allDayMap(),
      t = fmt(new Date()),
      vals = keys.map((k) => map[k] || 0),
      mx = Math.max(...vals, 1),
      cell = (k, big) => {
        const m = map[k] || 0,
          fut = k > t,
          o = m > 0 ? (0.2 + 0.8 * (m / mx)).toFixed(2) : 0,
          ttl = `${rdDt(k)}${fut ? " (futuro)" : ": " + (m ? hh(m) : "sem estudo")}`,
          cls = `rx-d${m > 0 ? " on" : ""}${fut ? " fut" : ""}${k === t ? " today" : ""}${big ? " big" : ""}`,
          inner = big
            ? `<b>${+k.slice(8)}</b>${m ? `<small>${hh(m)}</small>` : ""}`
            : "";
        return fut
          ? `<span class="${cls}" style="--o:0" title="${ttl}">${inner}</span>`
          : `<button type="button" class="${cls}" style="--o:${o}" title="${ttl}" data-a="rpgoday" data-k="${k}">${inner}</button>`;
      },
      lead = (parse(keys[0]).getDay() + 6) % 7;
    let o = h3(
      d.v === "month"
        ? "🗓️ Calendário de intensidade"
        : "🗓️ Ano em quadradinhos",
    );
    if (d.v === "month") {
      o += `<div class="rx-cal">${DIAS.map((x) => `<small>${x}</small>`).join("")}${'<span class="rx-d blank"></span>'.repeat(lead)}${keys.map((k) => cell(k, true)).join("")}</div>`;
    } else {
      const W = Math.ceil((lead + keys.length) / 7),
        labs = [];
      for (let m = 0; m < 12; m++) {
        const i = keys.findIndex((k) => +k.slice(5, 7) === m + 1);
        if (i >= 0)
          labs.push(
            `<small style="grid-column:${Math.floor((lead + i) / 7) + 1}">${MESES[m][0].toUpperCase() + MESES[m].slice(1, 3)}</small>`,
          );
      }
      o += `<div style="overflow-x:auto;padding-bottom:6px"><div style="min-width:${W * 13}px"><div class="rx-yl" style="grid-template-columns:repeat(${W},minmax(11px,1fr))">${labs.join("")}</div><div class="rx-yr" style="grid-template-columns:repeat(${W},minmax(11px,1fr))">${'<span class="rx-d blank"></span>'.repeat(lead)}${keys.map((k) => cell(k, false)).join("")}</div></div></div>`;
    }
    o += `<div class="rx-leg"><small>menos</small>${[0, 0.25, 0.5, 0.75, 1].map((v) => `<span class="rx-d${v ? " on" : ""}" style="--o:${v ? (0.2 + 0.8 * v).toFixed(2) : 0}"></span>`).join("")}<small>mais</small><small style="margin-left:8px">Toque em um dia para abrir o relatório dele.</small></div>`;
    const past = keys.filter((k) => k <= t),
      st = past.filter((k) => (map[k] || 0) > 0);
    let run = 0,
      best = 0;
    past.forEach((k) => {
      run = (map[k] || 0) > 0 ? run + 1 : 0;
      best = Math.max(best, run);
    });
    const bd = past.reduce(
      (p, k) => ((map[k] || 0) > (map[p] || 0) ? k : p),
      past[0],
    );
    if (st.length) {
      const tt = st.reduce((a, k) => a + map[k], 0);
      o += `<div class="hsum" style="margin-top:10px">${rdCd(st.length + " de " + past.length, "dias com estudo (" + pc(st.length, past.length) + "%)")}${rdCd(best + (best === 1 ? " dia" : " dias"), "maior sequência no período")}${rdCd(hh(tt / st.length), "média por dia estudado")}${rdCd(hh(map[bd]), "melhor dia · " + br(bd))}</div>`;
    } else o += note("Nenhum dia com estudo neste período.");
    return o;
  }

  /* ---------- 4) Qualidade dos blocos ---------- */
  function secQual(d) {
    const keys = d.keys,
      B = blocks(keys),
      lg = logs(keys);
    let o = h3("🧩 Qualidade dos blocos");
    if (!B.length && !lg.length)
      return (
        o +
        note(
          "Ainda não há blocos com horário nem registros de concentração neste período.",
        )
      );
    if (B.length) {
      const tot = B.reduce((a, x) => a + x.m, 0),
        big = B.reduce((p, x) => (x.m > p.m ? x : p)),
        deep = B.filter((x) => x.m >= 25).reduce((a, x) => a + x.m, 0),
        short = B.filter((x) => x.m < 10).length,
        fora = B.filter((x) => x.u).reduce((a, x) => a + x.m, 0);
      o += `<div class="hsum">${rdCd(String(B.length), "bloco" + pl(B.length) + " com horário")}${rdCd(hh(tot / B.length), "duração média")}${rdCd(hh(big.m), "maior bloco · " + esc(big.s.name) + (keys.length > 1 ? " · " + br(big.k) : ""))}${rdCd(pc(deep, tot) + "%", "do tempo em blocos de 25 min ou mais")}</div>`;
      const tiers = [
          ["Curtos (menos de 10 min)", (m) => m < 10, "var(--muted)"],
          ["Médios (10 a 24 min)", (m) => m >= 10 && m < 25, "var(--flame)"],
          ["Bons (25 a 49 min)", (m) => m >= 25 && m < 50, "var(--flame)"],
          ["Longos (50 min ou mais)", (m) => m >= 50, "var(--flame)"],
        ].map(([l, f, c]) => {
          const L = B.filter((x) => f(x.m));
          return { l, c, n: L.length, m: L.reduce((a, x) => a + x.m, 0) };
        }),
        mt = Math.max(...tiers.map((x) => x.m), 1);
      o += tiers
        .map((x) =>
          rdBar(
            `${x.l} <span class="sub" style="font-size:.8rem">· ${x.n} bloco${pl(x.n)}</span>`,
            x.m,
            mt,
            x.c,
            1,
            hh(x.m),
          ),
        )
        .join("");
      if (short >= 3 && short / B.length > 0.3)
        o += rdLn(
          `⚡ ${bold(pc(short, B.length) + "% dos blocos têm menos de 10 min")}. Juntar esses toques rápidos em blocos maiores costuma render mais.`,
        );
      if (fora > 0)
        o += rdLn(
          `🚫 Em blocos marcados como fora do plano: ${bold(hh(fora))} (${pc(fora, tot)}% do tempo com horário).`,
        );
    }
    /* concentração × duração e por matéria */
    const sh = lg.filter((x) => x.m > 0 && x.m < 25),
      lo = lg.filter((x) => x.m >= 25),
      av = (L) => L.reduce((a, x) => a + x.f, 0) / L.length;
    if (sh.length >= 2 && lo.length >= 2)
      o += rdLn(
        `🧠 Concentração média: ${bold(fx(av(lo)) + "/5")} em blocos de 25 min ou mais, contra ${bold(fx(av(sh)) + "/5")} nos mais curtos${av(lo) > av(sh) + 0.2 ? ". Blocos longos estão funcionando melhor para você." : av(sh) > av(lo) + 0.2 ? ". Blocos curtos estão funcionando melhor para você." : "."}`,
        10,
      );
    const by = S.subjects
      .map((s) => {
        const L = lg.filter((x) => x.sid === s.id);
        return { s, n: L.length, f: L.length ? av(L) : 0 };
      })
      .filter((x) => x.n)
      .sort((a, b) => b.f - a.f);
    if (by.length) {
      o += `<p class="sub" style="margin:12px 0 2px">${bold("Concentração média por matéria")}</p>`;
      o += by
        .map((x) =>
          rdBar(
            `<i class="rx-dot" style="background:${x.s.color}"></i>${esc(x.s.name)} <span class="sub" style="font-size:.8rem">· ${x.n} registro${pl(x.n)}</span>`,
            x.f,
            5,
            x.s.color,
            1,
            fx(x.f) + "/5",
          ),
        )
        .join("");
      const lw = by.filter((x) => x.n >= 2);
      if (lw.length >= 2 && lw[0].f - lw[lw.length - 1].f >= 0.8)
        o += rdLn(
          `💡 ${bold(esc(lw[lw.length - 1].s.name))} é onde você mais perde foco (${fx(lw[lw.length - 1].f)}/5). Vale tentar blocos mais curtos ou outro horário para ela.`,
        );
    }
    return o;
  }

  window.rxExtras = function (d) {
    let o = "";
    [secPlan, secHeat, secCal, secQual].forEach((f) => {
      try {
        o += f(d);
      } catch (e) {
        console.error("resumo-extras", f.name, e);
      }
    });
    return o;
  };
})();
