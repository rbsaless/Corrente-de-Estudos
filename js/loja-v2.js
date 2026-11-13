/* ===== Loja v2: categorias, raridade, recomendações, extrato de Elos, Cofre e novos itens =====
   Carregar DEPOIS de lazer-loja.js (e de ligas.js), ANTES de lumi.js. Não altera a lógica antiga: estende. */
(() => {
  /* --- estilos --- */
  const css = document.createElement("style");
  css.textContent = `
#shp .sh-w{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;align-items:center}
@media(max-width:640px){#shp .sh-w{grid-template-columns:1fr}}
#shp .sh-bal{font:800 2.8rem/1 "Bricolage Grotesque","DM Sans",sans-serif}
#shp .sh-bal small{font:500 .9rem "DM Sans",sans-serif;color:var(--muted);margin-left:6px}
#shp .sh-st{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
#shp .sh-st span{background:var(--bg);border-radius:12px;padding:6px 10px;font-size:.82rem;color:var(--muted)}#shp .sh-st b{color:var(--ink)}
#shp .sh-gr{display:flex;align-items:flex-end;gap:6px;height:70px}
#shp .sh-gr div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;height:100%;font-size:.65rem;color:var(--muted)}
#shp .sh-gr i{display:block;width:100%;min-height:3px;border-radius:6px 6px 2px 2px;background:linear-gradient(var(--flame),#ffb347)}
#shp .sh-fx{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
#shp .sh-fx span{background:color-mix(in srgb,var(--flame) 16%,var(--surface));border:1px solid var(--flame);border-radius:99px;padding:4px 11px;font-size:.8rem}
#shp .sh-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 14px}
#shp .sh-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
#shp .sh-c{--rc:var(--line);background:var(--bg);border:2px solid var(--rc);border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:8px;position:relative;transition:transform .15s}
#shp .sh-c:hover{transform:translateY(-2px)}
#shp .sh-c.r1{--rc:#8b8aa8}#shp .sh-c.r2{--rc:#3b82f6}#shp .sh-c.r3{--rc:#a855f7}#shp .sh-c.r4{--rc:#f59e0b;background:color-mix(in srgb,#f59e0b 8%,var(--bg))}
#shp .sh-c.off{opacity:.55}
#shp .sh-t{display:flex;gap:10px;align-items:center}#shp .sh-e{font-size:2rem;line-height:1}
#shp .sh-t b{display:block;line-height:1.2}#shp .sh-t small{color:var(--rc);font-weight:700;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em}
#shp .sh-c p{margin:0;font-size:.85rem;color:var(--muted);flex:1}
#shp .sh-bar{height:5px;border-radius:99px;background:var(--track);overflow:hidden}#shp .sh-bar i{display:block;height:100%;background:var(--rc)}
#shp .sh-f{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
#shp .sh-pr{font:800 1.1rem "Bricolage Grotesque","DM Sans",sans-serif}#shp .sh-pips{font-size:.7rem;letter-spacing:2px;color:var(--muted)}
#shp .sh-rc{position:absolute;top:-9px;right:12px;background:var(--flame);color:#fff;font-size:.68rem;font-weight:700;padding:2px 9px;border-radius:99px}
#shp .sh-n{font-size:.76rem;color:var(--muted)}
#shp .sh-rec{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
#shp .sh-rec .chinfo{margin:0}
#shp details summary{cursor:pointer;font-weight:700}`;
  document.head.appendChild(css);

  /* --- novos itens --- */
  SHOP.push(
    {
      id: "bsx",
      e: "🚀",
      n: "Boost prolongado",
      d: "+25% de lazer por 72h. Sai mais barato por hora que o Boost comum.",
      p: 150,
      l: 2,
    },
    {
      id: "lzm",
      e: "🏖️",
      n: "Pacote de lazer",
      d: "+90 min no banco de lazer, mais barato por minuto que o Lazer extra.",
      p: 240,
      l: 2,
    },
    {
      id: "cof",
      e: "🏦",
      n: "Cofre de Elos",
      d: "Guarde Elos por 7 dias e receba 20% de volta. Elos no cofre ficam protegidos do reset de −10h.",
      p: 200,
      l: 2,
    },
    {
      id: "bau2",
      e: "👑",
      n: "Baú dourado",
      d: "Prêmios maiores: até 120 min de lazer, 500 Elos, congelamento, XP em dobro, boost ou ticket.",
      p: 450,
      l: 2,
    },
    {
      id: "tci",
      e: "🎬",
      n: "Vale-cinema",
      d: "Vale para um cinema ou evento fora de casa. Vale 30 dias e só ativa depois da meta do dia.",
      p: 350,
      l: 1,
    },
    {
      id: "tpr",
      e: "🛍️",
      n: "Vale-presente pra mim",
      d: "Uma compra pessoal sem culpa. Vale 30 dias e só ativa depois da meta do dia.",
      p: 700,
      l: 1,
    },
  );
  TK3.tci = { m: 0, e: "🎬", n: "Vale-cinema" };
  TK3.tpr = { m: 0, e: "🛍️", n: "Vale-presente pra mim" };

  const CAT = [
    ["pro", "🛡️ Proteção", ["frz", "min", "pdv", "pdl", "pmg", "pas", "dof"]],
    ["imp", "🚀 Impulso", ["bst", "bsx", "xp2", "gld", "elx", "lzx", "lzm"]],
    ["div", "🎮 Diversão", ["tjg", "tvg", "tsr", "tgl", "tci", "tpr"]],
    ["sor", "🎲 Sorte e cofre", ["bau", "bau2", "cof"]],
  ];
  const RAR = (p) =>
    p >= 700
      ? [4, "Lendário"]
      : p >= 300
        ? [3, "Épico"]
        : p >= 100
          ? [2, "Raro"]
          : [1, "Comum"];
  let shT = "all";
  const day = (n) => fmt(addD(now(), -n));

  /* --- extrato de Elos (ganhos por dia) --- */
  const _ea = elosAdd;
  elosAdd = function (n) {
    if (n > 0) {
      const e = elCfg(),
        h = (e.h = e.h && typeof e.h === "object" ? e.h : {}),
        d = fmt(now());
      h[d] = (h[d] || 0) + n;
      const lim = day(60);
      Object.keys(h).forEach((k) => {
        if (k < lim) delete h[k];
      });
    }
    return _ea(n);
  };
  const ganho = (d) => Math.round((elCfg().h || {})[d] || 0);

  /* --- Cofre --- */
  const vault = () => {
    const h = shCfg();
    h.vlt = Array.isArray(h.vlt) ? h.vlt : [];
    return h.vlt;
  };
  function vaultSettle() {
    const v = vault(),
      n = Date.now(),
      ok = v.filter((x) => x.rel <= n);
    if (!ok.length) return;
    ok.forEach((x) => {
      elCfg().g += x.back;
    });
    shCfg().vlt = v.filter((x) => x.rel > n);
    save();
    toast(
      "🏦 Cofre liberado: +" + ok.reduce((a, x) => a + x.back, 0) + " Elos!",
    );
  }
  const _r = render;
  render = function () {
    try {
      vaultSettle();
    } catch (e) {
      console.error("Cofre:", e);
    }
    return _r.apply(this, arguments);
  };

  /* --- compra dos novos itens (os antigos seguem no fluxo original) --- */
  const NEW = ["bsx", "lzm", "cof", "bau2", "tci", "tpr"],
    _sb = shBuy;
  function pick(R) {
    let r = Math.random() * 100;
    for (const o of R) {
      if (r < o[0]) return o[1];
      r -= o[0];
    }
    return R[0][1];
  }
  shBuy = function (id) {
    if (!NEW.includes(id)) return _sb(id);
    const it = SHOP.find((x) => x.id === id),
      h = shCfg(),
      n = Date.now(),
      I = shInfo(it),
      z = lzCfg();
    let msg = "";
    if (I.left <= 0) return toast("Limite semanal atingido para este item.");
    if (elBal() < I.price) return toast("Elos insuficientes.");
    if (id === "lzm" && !z.on) return toast("Ative o banco de lazer primeiro.");
    if (id === "bsx") {
      h.bst = Math.max(n, h.bst) + 72 * 36e5;
      msg = "🚀 Boost de +25% ativo até " + idHM(h.bst) + ".";
    } else if (id === "lzm") {
      z.led.push({
        id: lzId(),
        t: n,
        type: "chal",
        min: 90,
        note: "🏖️ Pacote de lazer",
      });
      msg = "🏖️ +90 min de lazer!";
    } else if (id === "cof") {
      const back = Math.round(I.price * 1.2);
      vault().push({ a: I.price, at: n, rel: n + 7 * 864e5, back });
      msg = "🏦 " + I.price + " Elos guardados. Em 7 dias voltam " + back + ".";
    } else if (TK3[id]) {
      tkGive(id);
      msg = TK3[id].e + " " + TK3[id].n + ' guardado em "Meus tickets".';
    } else if (id === "bau2") {
      const k = pick([
        [30, "lz"],
        [20, "el"],
        [15, "bst"],
        [12, "xp2"],
        [10, "frz"],
        [8, "tk"],
        [5, "big"],
      ]);
      if (k === "lz" && !z.on) k0();
      function k0() {}
      let kk = k;
      if ((kk === "lz" || kk === "big") && !z.on) kk = "el";
      if (kk === "lz") {
        z.led.push({
          id: lzId(),
          t: n,
          type: "chal",
          min: 60,
          note: "👑 Baú dourado: lazer",
        });
        msg = "👑 Baú dourado: +60 min de lazer!";
      } else if (kk === "big") {
        z.led.push({
          id: lzId(),
          t: n,
          type: "chal",
          min: 120,
          note: "👑 Baú dourado: lazer",
        });
        msg = "👑 JACKPOT: +120 min de lazer!";
      } else if (kk === "el") {
        elosAdd(500);
        msg = "👑 Baú dourado: +500 Elos!";
      } else if (kk === "bst") {
        h.bst = Math.max(n, h.bst) + 24 * 36e5;
        msg = "👑 Baú dourado: boost de +25% por 24h!";
      } else if (kk === "xp2") {
        h.xp2 = Math.max(n, h.xp2) + 24 * 36e5;
        msg = "👑 Baú dourado: XP em dobro por 24h!";
      } else if (kk === "frz") {
        stkCfg().tok = (stkCfg().tok || 0) + 1;
        msg = "👑 Baú dourado: 1 Congelamento!";
      } else {
        tkGive("tvg");
        msg = "👑 Baú dourado: um Ticket de videogame!";
      }
    }
    elCfg().s += I.price;
    h.buy.push({ id, t: n });
    h.buy = h.buy.filter((x) => x.t > n - 14 * 864e5);
    save();
    render();
    toast(msg);
  };

  /* --- recomendações conforme o estado atual --- */
  function recs() {
    const R = [],
      z = lzCfg(),
      k = stkCfg(),
      b = lzBal(),
      d = lzDebt(),
      H = shCfg(),
      n = Date.now();
    if (z.on && b <= -480)
      R.push(["pdl", "Seu saldo está perto de −10h: evite o reset da streak."]);
    if (d > 0) R.push(["pdv", "Você tem " + lzN(d) + " de dívida de estudo."]);
    if (z.on && b < -120 && !(H.elx > n))
      R.push(["elx", "Saldo de lazer negativo: estudar passa a abater 1:1."]);
    if (!(k.tok > 0))
      R.push(["frz", "Você está sem Congelamento. É o seguro da sua streak."]);
    if (elBal() >= 600 && !vault().length)
      R.push(["cof", "Elos parados rendem 20% no Cofre em 7 dias."]);
    if (!(H.xp2 > n) && stkTot(fmt(now())) > 0)
      R.push(["xp2", "Você já estudou hoje: bom momento para dobrar o XP."]);
    if (!R.length) R.push(["bau", "Tudo em ordem. Que tal uma surpresa?"]);
    return R.filter(([id]) => SHOP.some((x) => x.id === id)).slice(0, 3);
  }

  function card(it, why) {
    const I = shInfo(it),
      [r, rn] = RAR(it.p),
      bal = elBal(),
      ok = bal >= I.price && I.left > 0,
      pct = I.price ? Math.min(100, (bal / I.price) * 100) : 100;
    const ex =
      it.id === "pdl"
        ? (() => {
            const c = pdlCalc();
            return `<span class="sh-n">Agora: saldo ${lzS(c.bal).replace("+", "")}${c.drain ? " · ociosidade ≈ −" + lzN(c.drain) : ""} · crédito necessário: <b>${c.credit > 0 ? lzN(c.credit) : "nenhum"}</b></span>`;
          })()
        : "";
    return `<div class="sh-c r${r}${I.left <= 0 ? " off" : ""}">${why ? '<span class="sh-rc">Recomendado</span>' : ""}<div class="sh-t"><span class="sh-e">${it.e}</span><div><b>${it.n}</b><small>${rn}</small></div></div><p>${it.d}</p>${why ? `<span class="sh-n">💡 ${esc(why)}</span>` : ""}${ex}
 <div class="sh-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
 <div class="sh-f"><div><span class="sh-pr">${I.price ? I.price + " 🪙" : "GRÁTIS"}</span><br><span class="sh-pips" title="${I.left} de ${it.l} restantes na semana">${"●".repeat(Math.max(0, I.left))}${"○".repeat(Math.max(0, it.l - Math.max(0, I.left)))}</span>${!ok && I.left > 0 && I.price ? `<span class="sh-n"> · faltam ${I.price - bal}</span>` : ""}</div>
 <button class="btn${ok ? " main" : ""}" data-sp="buy" data-i="${it.id}" ${I.left <= 0 ? "disabled" : ""}>${I.left <= 0 ? "Esgotado" : "Comprar"}</button></div></div>`;
  }

  renderShop = function () {
    const el = $("#shp");
    if (!el || curPage !== "loja") return;
    const k = stkCfg(),
      h = shCfg(),
      n = Date.now(),
      t = fmt(now()),
      cur = stkMin(t),
      L = tkInv(),
      V = vault(),
      vt = V.reduce((a, x) => a + x.back, 0);
    const gd = Array.from({ length: 7 }, (_, i) => {
        const d = day(6 - i);
        return { d, v: ganho(d) };
      }),
      mx = Math.max(1, ...gd.map((x) => x.v)),
      w7 = gd.reduce((a, x) => a + x.v, 0);
    const fx = [
      h.bst > n ? "🚀 Boost até " + idHM(h.bst) : "",
      h.xp2 > n ? "⚡ XP em dobro até " + idHM(h.xp2) : "",
      h.gld > n ? "🌅 Hora Dourada até " + idHM(h.gld) : "",
      h.elx > n ? "🪞 Elixir até " + idHM(h.elx) : "",
      idCfg().pass > n ? "🛡️ Passe até " + idHM(idCfg().pass) : "",
      k.tok > 0 ? "🧊 " + k.tok + " congelamento" + (k.tok > 1 ? "s" : "") : "",
      k.lw > 0
        ? "⏱️ " + k.lw + " redução" + (k.lw > 1 ? "ões" : "") + " de mínimo"
        : "",
      V.length
        ? "🏦 " +
          vt +
          " Elos no cofre (libera " +
          br(fmt(new Date(Math.min(...V.map((x) => x.rel))))) +
          ")"
        : "",
    ].filter(Boolean);
    const wallet = `<div class="mgs"><div class="sh-w"><div><div class="sh-bal">🪙 ${elBal()}<small>Elos</small></div>
  <div class="sh-st"><span>Hoje <b>+${ganho(t)}</b></span><span>7 dias <b>+${w7}</b></span><span>Média/dia <b>${Math.round(w7 / 7)}</b></span></div>
  <p class="sub" style="margin:10px 0 0;font-size:.82rem">Como ganhar: 1 Elo a cada 10 min estudados (+50% com foco 5★), desafios, marcos, desafio do dia e +3 por dia que cumpre a streak.</p></div>
  <div><div class="sub" style="margin:0 0 4px;font-size:.78rem">Elos ganhos nos últimos 7 dias</div><div class="sh-gr">${gd.map((x) => `<div title="${bd(x.d)}: +${x.v}"><i style="height:${Math.max(4, (x.v / mx) * 52)}px"></i>${DIAS[(parse(x.d).getDay() + 6) % 7][0]}</div>`).join("")}</div></div></div>
  ${fx.length ? `<div class="sh-fx">${fx.map((x) => `<span>${x}</span>`).join("")}</div>` : ""}</div>`;
    const tk = `<div class="mgs"><h2>🎒 Meus tickets</h2>${
      L.length
        ? `<div class="sh-rec">${L.map((x) => {
            const D = TK3[x.k];
            return `<div class="chinfo"><b style="font-size:1.1rem">${D.e} ${D.n}</b><br><small>${D.m ? hh(D.m) + " sem custo no saldo" : "uso livre"} · vale até ${br(fmt(new Date(x.x)))}</small><br><button class="btn main" data-sp="tk" data-i="${x.id}">Usar agora</button></div>`;
          }).join("")}</div>`
        : '<p class="sub" style="margin:0">Nenhum ticket guardado. Tickets só ativam depois da meta mínima do dia e não descontam do saldo de lazer.</p>'
    }</div>`;
    const rc = recs(),
      recS = `<div class="mgs"><h2>💡 Para você agora</h2><p class="sub" style="margin:0 0 10px">Sugestões com base no seu saldo de lazer, dívida e proteções.</p><div class="sh-g">${rc
        .map(([id, w]) =>
          card(
            SHOP.find((x) => x.id === id),
            w,
          ),
        )
        .join("")}</div></div>`;
    const tabs = `<div class="sh-tabs" role="tablist">${[["all", "🛍️ Tudo"], ...CAT.map((c) => [c[0], c[1]])].map(([id, l]) => `<button type="button" class="tq${shT === id ? " on" : ""}" data-sh2="${id}" role="tab">${l}</button>`).join("")}</div>`;
    const secs = CAT.filter((c) => shT === "all" || shT === c[0])
      .map(
        ([id, nm, ids]) =>
          `${shT === "all" ? `<h3 style="margin:18px 0 10px">${nm}</h3>` : ""}<div class="sh-g">${ids
            .map((i) => SHOP.find((x) => x.id === i))
            .filter(Boolean)
            .map((it) => card(it))
            .join("")}</div>`,
      )
      .join("");
    const stk = `<details class="mgs"><summary>🔥 Mínimo da streak (hoje: ${hh(cur)})</summary><p class="sub" style="margin:8px 0">Aumentar é grátis e vale a partir de hoje. Diminuir exige uma <b>Redução de mínimo</b> (você tem ${k.lw}). Mínimo possível: 30 min. Abaixo de −10h de saldo no fim do dia, a streak, a dívida de lazer e os Elos zeram.</p><div class="mgr" style="display:flex;gap:10px;align-items:flex-end"><label style="display:flex;flex-direction:column;font-size:.85rem;color:var(--muted)">Novo mínimo (min)<input type="number" id="sk-m" min="30" max="720" step="5" value="${cur}" style="width:90px"></label><button class="btn main" data-sp="min">Salvar mínimo</button></div></details>`;
    el.innerHTML =
      wallet +
      tk +
      recS +
      `<div class="mgs"><h2>🛍️ Catálogo</h2>${tabs}${secs}</div>` +
      stk;
  };

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sh2]");
    if (!b) return;
    shT = b.dataset.sh2;
    renderShop();
  });
})();
