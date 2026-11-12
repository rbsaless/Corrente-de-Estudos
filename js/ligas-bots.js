/* ===== Ligas: classificação com 29 bots simulados + você (30 participantes). Não guarda nada: tudo é calculado
   a partir de uma semente (liga + semana + bot), então a tabela é sempre a mesma. Carregar logo depois de ligas.js. ===== */
(() => {
  const X = window.__liga;
  if (!X) return;
  const NP = 30,
    TOUGH = 1; /* TOUGH: 1 = bots duros (padrão). Aumente para endurecer, diminua para facilitar. */
  const addK = (k, n) => fmt(addD(parse(k), n)),
    wkOf = (d) => fmt(monday(d)),
    fmtH = (h) => hh(Math.round(h * 60));
  const hash = (s) => {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  };
  const rng = (s) => {
    let a = hash(s);
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const FN = [
    "Lucas",
    "Marina",
    "Pedro",
    "Ana",
    "João",
    "Beatriz",
    "Rafael",
    "Camila",
    "Gabriel",
    "Julia",
    "Mateus",
    "Larissa",
    "Felipe",
    "Isabela",
    "Bruno",
    "Letícia",
    "Gustavo",
    "Fernanda",
    "Thiago",
    "Carol",
    "Diego",
    "Amanda",
    "Vitor",
    "Bianca",
    "Caio",
    "Renata",
    "André",
    "Paula",
    "Davi",
    "Clara",
  ];
  /* bots da liga L na semana M; frac = dias já estudados (0 a 6, segunda a sábado) */
  function bots(L, M, frac) {
    const stay = X.meta(L),
      up = L < X.LG.length ? X.meta(L + 1) : stay + 5,
      out = [];
    for (let i = 0; i < NP - 1; i++) {
      const p = rng("p|" + L + "|" + i),
        sk = p(),
        fn = FN[Math.floor(p() * FN.length)],
        f = p(),
        name =
          f < 0.45
            ? fn + "_" + (100 + Math.floor(p() * 900))
            : f < 0.8
              ? fn + " " + String.fromCharCode(65 + Math.floor(p() * 26)) + "."
              : "Estudante " + (10 + Math.floor(p() * 90)),
        w = rng("w|" + L + "|" + i + "|" + M),
        g = (0.1 + 1.6 * Math.pow(sk, 0.85)) * TOUGH + (w() - 0.5) * 0.5,
        tot = Math.max(stay * 0.4, stay + (up - stay) * g),
        dw = [0, 1, 2, 3, 4, 5].map(() => 0.5 + w()),
        sw = dw.reduce((a, b) => a + b, 0);
      let acc = 0;
      for (let d = 0; d < 6; d++)
        acc += dw[d] * Math.min(1, Math.max(0, frac - d));
      out.push({ n: name, h: (tot * acc) / sw, me: 0 });
    }
    return out;
  }
  function frac(M) {
    const t = fmt(now());
    if (wkOf(now()) !== M || t >= addK(M, 6)) return 6;
    const d = Math.round((parse(t) - parse(M)) / 864e5),
      w = new Date(),
      df = Math.min(
        1,
        Math.max(0, (w.getHours() + w.getMinutes() / 60 - 6) / 17),
      );
    return d + df;
  }
  const rank = (L, M, h) => {
    const a = bots(L, M, frac(M));
    a.push({ n: "Você", h, me: 1 });
    a.sort((x, y) => y.h - x.h || y.me - x.me);
    return a;
  };
  const ord = (n) => n + "º",
    medal = (i) => ["🥇", "🥈", "🥉"][i] || ord(i + 1);
  function build() {
    const g = X.cfg(),
      L = g.lv,
      M = wkOf(now()),
      R = rank(L, M, X.hrs(M)),
      pos = R.findIndex((x) => x.me),
      nm = X.LG[L - 1][0];
    const hist = g.hist
      .filter((x) => !x.ref)
      .slice(-8)
      .reverse()
      .map((x) => {
        const r = rank(x.from, x.w, x.h),
          p = r.findIndex((z) => z.me);
        return `<tr><td>${x.w.slice(8)}/${x.w.slice(5, 7)} a ${addK(x.w, 5).slice(8)}/${addK(x.w, 5).slice(5, 7)}</td><td>${X.LG[x.from - 1][0]}</td><td class="r"><b>${medal(p)}</b> de ${NP}</td></tr>`;
      })
      .join("");
    return `<div class="mgs" id="lg-bots"><h2>🏆 Classificação · Liga ${nm}</h2>
 <p class="sub" style="margin:0 0 6px">Sua posição: <b style="color:var(--ink)">${ord(pos + 1)} de ${NP}</b> · ${fmtH(R[pos].h)} na semana. A posição é só a classificação: subir e cair continua dependendo das metas de horas.</p>
 <div class="sc" style="max-height:none;overflow:visible"><table><thead><tr><th>#</th><th>Participante</th><th class="r">Horas</th></tr></thead><tbody>${R.map((x, i) => `<tr class="${x.me ? "me" : ""}"><td>${medal(i)}</td><td>${x.me ? "Rômulo" : x.n}</td><td class="r">${fmtH(x.h)}</td></tr>`).join("")}</tbody></table></div>
 ${hist ? `<h3>Suas posições nas últimas semanas</h3><div class="sc" style="max-height:none;overflow:visible"><table><thead><tr><th>Semana</th><th>Liga</th><th class="r">Posição</th></tr></thead><tbody>${hist}</tbody></table></div>` : ""}</div>`;
  }
  function inject() {
    if (curPage !== "ligas") return;
    const el = document.getElementById("lg");
    if (!el || !X.cfg().lv) return;
    const old = document.getElementById("lg-bots");
    if (old) old.remove();
    const f = el.querySelector(".mgs");
    if (f) f.insertAdjacentHTML("afterend", build());
  }
  render = ((f) =>
    function () {
      const r = f.apply(this, arguments);
      try {
        inject();
      } catch (e) {
        console.error("Ligas bots:", e);
      }
      return r;
    })(render);
  setInterval(() => {
    if (document.hidden || curPage !== "ligas") return;
    const e = document.getElementById("lg-bots");
    if (e && X.cfg().lv) e.outerHTML = build();
  }, 60000);
})();
