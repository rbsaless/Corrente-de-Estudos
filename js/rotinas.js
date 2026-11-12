/* ===== Rotinas de personalidades: aba em Relatório e Planejamento (grupo Planejar) + agenda na tela inicial.
   Carregar depois de notas.js e antes de lumi.js. Não altera outros arquivos. ===== */
(() => {
  const ICON = { s: "😴", f: "🎯", e: "🏃", r: "🍽️", l: "☕", o: "📌" },
    TN = {
      s: "Sono",
      f: "Foco",
      e: "Exercício",
      r: "Refeição",
      l: "Descanso",
      o: "Outro",
    };
  const CF = {
    a: [
      "🟢",
      "Confiança alta",
      "Documentada pela própria pessoa (autobiografia, entrevistas)",
    ],
    m: [
      "🟡",
      "Confiança média",
      "Relatos de biógrafos e entrevistas, com variações",
    ],
    b: ["🟠", "Confiança baixa", "Anedotas e lendas, pouco verificáveis"],
    x: [
      "🔴",
      "Muito baixa",
      "Quase nada documentado: reconstrução fictícia, só inspiração",
    ],
  };
  const tm = (s) => {
      const [h, m] = s.split(":");
      return +h * 60 + +m;
    },
    dur = (a, z) => (tm(z) - tm(a) + 1440) % 1440 || 1440;
  const P = (id, e, n, c, f, r, L) => ({
    id,
    e,
    n,
    c,
    f,
    r,
    b: L.map((s, i) => {
      const m = s.match(/^(\d\d:\d\d)-(\d\d:\d\d) (\w) (.+)$/);
      return { i, a: m[1], z: m[2], t: m[3], n: m[4], d: dur(m[1], m[2]) };
    }),
  });
  const dv = [];
  {
    const H = (x) => String(x % 24).padStart(2, "0");
    [0, 4, 8, 12, 16, 20].forEach((h) => {
      dv.push(`${H(h)}:00-${H(h)}:15 s Cochilo de 15 min`);
      dv.push(`${H(h)}:15-${H(h + 4)}:00 f Estudo, desenho e invenções`);
    });
  }
  const ROT = [
    P(
      "musk",
      "🚀",
      "Elon Musk",
      "a",
      "Autorrelato em entrevistas",
      "Agenda em blocos de 5 min, ~6h de sono e semanas de 80 a 100h.",
      [
        "01:00-07:00 s Sono (~6h)",
        "07:00-08:00 o Manhã e e-mails",
        "08:00-12:00 f Trabalho profundo (engenharia)",
        "12:00-13:00 r Almoço (trabalhando)",
        "13:00-18:00 f Reuniões e projetos",
        "18:00-19:00 r Jantar",
        "19:00-23:00 f Segundo turno de trabalho",
        "23:00-01:00 o E-mails e redes",
      ],
    ),
    P(
      "franklin",
      "⚡",
      "Benjamin Franklin",
      "a",
      "Autobiografia",
      'Horário escrito por ele mesmo, com a pergunta diária "que bem farei hoje?".',
      [
        "05:00-07:00 f Planejar o dia, resolver e estudar",
        "07:00-08:00 r Café da manhã",
        "08:00-12:00 f Trabalho",
        "12:00-14:00 r Almoço, leitura e contas",
        "14:00-18:00 f Trabalho",
        '18:00-22:00 l Arrumar, jantar, música e conversa; "que bem fiz hoje?"',
        "22:00-05:00 s Sono",
      ],
    ),
    P(
      "kant",
      "🧠",
      "Immanuel Kant",
      "a",
      "Biógrafos contemporâneos",
      "Rotina rígida: a vizinhança acertava o relógio pela caminhada dele.",
      [
        "05:00-07:00 f Preparar aulas e escrever",
        "07:00-11:00 f Dar aulas",
        "11:00-13:00 f Escrever",
        "13:00-15:30 r Almoço longo com convidados",
        "15:30-16:30 e Caminhada diária",
        "16:30-22:00 l Leitura leve e conversa",
        "22:00-05:00 s Sono",
      ],
    ),
    P(
      "darwin",
      "🐢",
      "Charles Darwin",
      "a",
      "Cartas e biografia da família",
      "Três blocos de ~90 min de trabalho e caminhadas no Sandwalk.",
      [
        "07:00-07:45 e Caminhada matinal",
        "07:45-08:00 r Café da manhã",
        "08:00-09:30 f Primeiro bloco de trabalho",
        "09:30-10:30 o Cartas",
        "10:30-12:00 f Segundo bloco de trabalho",
        "12:00-13:00 e Caminhada no Sandwalk",
        "13:00-14:00 r Almoço e cartas",
        "14:00-15:00 l Soneca e leitura de romance",
        "15:00-16:00 e Passeio",
        "16:30-17:30 f Terceiro bloco de trabalho",
        "17:30-19:30 l Descanso",
        "19:30-20:30 r Jantar",
        "20:30-22:30 l Gamão, leitura e música",
        "22:30-07:00 s Sono",
      ],
    ),
    P(
      "murakami",
      "🏃",
      "Haruki Murakami",
      "a",
      "Memórias e entrevistas",
      "Acorda às 4h, escreve 5 a 6h, corre 10 km e dorme às 21h.",
      [
        "21:00-04:00 s Sono",
        "04:00-09:30 f Escrever",
        "09:30-10:30 e Correr 10 km ou nadar",
        "10:30-13:00 o Tarefas, traduções e correspondência",
        "13:00-14:00 r Almoço",
        "14:00-17:00 l Ler e ouvir música",
        "17:00-21:00 l Jantar e tempo livre",
      ],
    ),
    P(
      "angelou",
      "✍️",
      "Maya Angelou",
      "a",
      "Entrevistas",
      "Escrevia num quarto de hotel alugado, sem enfeites, até o início da tarde.",
      [
        "05:30-06:30 r Café com o marido",
        "06:30-14:00 f Escrever no quarto de hotel",
        "14:00-15:30 o Revisar o texto do dia",
        "15:30-18:00 o Casa e cozinha",
        "18:00-20:00 r Jantar e ler o dia ao marido",
        "20:00-22:00 l Descanso",
        "22:00-05:30 s Sono",
      ],
    ),
    P(
      "hemingway",
      "🎣",
      "Ernest Hemingway",
      "a",
      "Entrevista à Paris Review",
      "Escrevia ao amanhecer, em pé, e parava no meio de uma cena para continuar no dia seguinte.",
      [
        "05:30-12:00 f Escrever em pé, ao amanhecer",
        "12:00-13:00 e Nadar",
        "13:00-14:00 r Almoço",
        "14:00-17:00 l Pesca, leitura e cartas",
        "17:00-20:00 l Amigos e conversa",
        "20:00-22:00 r Jantar",
        "22:00-05:30 s Sono",
      ],
    ),
    P(
      "king",
      "📚",
      "Stephen King",
      "a",
      'Livro "Sobre a escrita"',
      "Meta de 2.000 palavras por dia, porta fechada, e muita leitura.",
      [
        "07:00-08:00 e Caminhada",
        "08:00-11:30 f Escrever (meta: 2.000 palavras)",
        "11:30-13:00 o Cartas e e-mails",
        "13:00-14:00 r Almoço",
        "14:00-17:00 l Soneca, leitura e família",
        "17:00-19:00 f Leitura",
        "19:00-23:00 l Jantar, TV e família",
        "23:00-07:00 s Sono",
      ],
    ),
    P(
      "churchill",
      "🎩",
      "Winston Churchill",
      "m",
      "Biografias e relatos de assessores",
      "Trabalhava na cama de manhã, tirava soneca à tarde e ia até de madrugada.",
      [
        "07:30-11:00 f Trabalhar na cama: despachos e leitura",
        "11:00-13:00 l Banho, jardim e pintura",
        "13:00-15:00 r Almoço longo",
        "15:00-17:00 s Soneca",
        "17:00-18:00 o Banho e troca de roupa",
        "18:00-20:15 f Trabalho e ditados",
        "20:15-23:00 r Jantar longo com conversa",
        "23:00-02:00 f Trabalho noturno",
        "02:00-07:30 s Sono",
      ],
    ),
    P(
      "bezos",
      "📦",
      "Jeff Bezos",
      "m",
      "Entrevistas",
      "Sem despertador, manhã sem pressa e decisões difíceis antes do almoço.",
      [
        "06:00-09:30 r Café, jornal e família (sem despertador)",
        "09:30-12:30 f Reuniões de decisões difíceis",
        "12:30-13:30 r Almoço",
        "13:30-17:00 f Reuniões e projetos",
        "17:00-22:00 l Jantar e família",
        "22:00-06:00 s Sono (8h)",
      ],
    ),
    P(
      "beethoven",
      "🎼",
      "Ludwig van Beethoven",
      "m",
      "Relatos de Schindler e conhecidos",
      "Contava 60 grãos de café, compunha de manhã e caminhava com um caderno.",
      [
        "06:00-07:00 r Café (60 grãos contados)",
        "07:00-14:00 f Compor, com pausas e passeios",
        "14:30-15:30 r Almoço",
        "15:30-18:00 e Longa caminhada com caderno",
        "18:00-21:30 l Taverna, jornais e conversa",
        "22:00-06:00 s Sono",
      ],
    ),
    P(
      "einstein",
      "🔭",
      "Albert Einstein",
      "m",
      "Biografias (Isaacson)",
      "Dormia ~10h, ia caminhando ao instituto e relaxava com violino e barco.",
      [
        "22:30-08:30 s Sono (~10h)",
        "08:30-09:30 r Café",
        "09:30-10:15 e Caminhada até o instituto",
        "10:15-13:00 f Pensar, pesquisar e escrever",
        "13:00-14:30 r Almoço em casa",
        "14:30-15:30 s Soneca",
        "15:30-17:30 f Trabalho em casa e correspondência",
        "17:30-19:00 l Violino ou barco a vela",
        "19:00-20:00 r Jantar",
        "20:00-22:30 l Leitura leve",
      ],
    ),
    P(
      "mozart",
      "🎹",
      "Wolfgang A. Mozart",
      "m",
      "Carta ao pai (Viena)",
      "Compunha cedo e à noite, e dava aulas e concertos durante o dia.",
      [
        "01:00-06:00 s Sono",
        "06:00-07:00 o Arrumar-se",
        "07:00-09:00 f Compor",
        "09:00-13:00 o Dar aulas",
        "13:00-14:00 r Almoço",
        "14:00-17:30 f Compor",
        "17:30-21:00 l Concertos e vida social",
        "21:00-01:00 f Compor à noite",
      ],
    ),
    P(
      "jobs",
      "🍎",
      "Steve Jobs",
      "m",
      "Biografia (Isaacson) e entrevistas",
      "Pergunta ao espelho, caminhadas para reuniões e foco em poucas coisas.",
      [
        '06:30-07:30 o Espelho ("e se hoje fosse o último dia?") e meditação',
        "07:30-08:30 r Café",
        "08:30-12:00 f Design e produto",
        "12:00-13:00 e Caminhada-reunião",
        "13:00-18:00 f Reuniões e revisões de produto",
        "18:00-19:30 r Jantar em família",
        "19:30-22:30 l Família e música",
        "22:30-06:30 s Sono",
      ],
    ),
    P(
      "gates",
      "💻",
      "Bill Gates",
      "m",
      "Blog e entrevistas",
      'Lê cerca de 50 livros por ano e faz as "Think Weeks" de leitura.',
      [
        "07:00-08:00 e Esteira com aulas em vídeo",
        "08:00-12:00 f Trabalho",
        "12:00-13:00 r Almoço",
        "13:00-18:00 f Trabalho e reuniões",
        "18:00-20:00 r Jantar e lavar a louça",
        "20:00-22:00 f Leitura",
        "22:00-23:00 l Leitura leve antes de dormir",
        "23:00-07:00 s Sono",
      ],
    ),
    P(
      "tesla",
      "🔋",
      "Nikola Tesla",
      "b",
      "Biografias e lendas",
      "Dizem que dormia 2 a 4h e trabalhava de madrugada; muito dos relatos é folclore.",
      [
        "03:00-07:00 s Sono curto (lenda: 2 a 4h)",
        "07:00-09:00 e Longas caminhadas",
        "09:00-12:00 l Nadar e descansar",
        "12:00-20:00 f Laboratório",
        "20:00-21:30 r Jantar no hotel",
        "21:30-03:00 f Trabalho noturno",
      ],
    ),
    P(
      "newton",
      "🍎",
      "Isaac Newton",
      "b",
      "Anedotas de conhecidos",
      "Dizem que esquecia as refeições quando estava absorvido; pouco verificável.",
      [
        "01:00-05:00 s Sono curto",
        "05:00-12:00 f Estudo e experimentos",
        "12:00-13:00 r Refeição (às vezes esquecida)",
        "13:00-19:00 f Escrita e cálculos",
        "19:00-22:00 l Leitura",
        "22:00-01:00 f Alquimia e teologia",
      ],
    ),
    P(
      "davinci",
      "🎨",
      "Leonardo da Vinci",
      "b",
      'Lenda do "sono polifásico"',
      "Dizem que dormia 15 min a cada 4h; provavelmente é mito moderno.",
      dv,
    ),
    P(
      "curie",
      "⚛️",
      "Marie Curie",
      "b",
      "Biografias (rotina pouco detalhada)",
      "Vida centrada no laboratório e na família; sem agenda documentada.",
      [
        "07:00-08:30 r Café e filhas",
        "08:30-12:00 f Laboratório",
        "12:00-13:00 r Almoço",
        "13:00-18:00 f Laboratório e pesquisa",
        "18:00-20:00 l Família",
        "20:00-22:00 f Anotações e leitura científica",
        "22:00-07:00 s Sono",
      ],
    ),
    P(
      "shakespeare",
      "🎭",
      "William Shakespeare",
      "x",
      "Nenhuma (pouquíssimo se sabe da vida dele)",
      "Reconstrução fictícia, só inspiração: não há registro de uma rotina real.",
      [
        "07:00-08:00 r Café",
        "08:00-12:00 f Escrever peças",
        "12:00-13:00 r Almoço",
        "13:00-14:00 o Ensaio",
        "14:00-17:00 o Apresentação no teatro",
        "17:00-19:00 l Taverna e conversa",
        "19:00-21:00 f Revisar falas e copiar manuscritos",
        "21:00-23:00 l Jantar e leitura à luz de vela",
        "23:00-07:00 s Sono",
      ],
    ),
  ];
  const pOf = (id) => ROT.find((p) => p.id === id),
    srt = (p) => [...p.b].sort((x, y) => tm(x.a) - tm(y.a));
  let rtView = null,
    rtMap = {},
    rtWd = "all",
    rtOpen = false;
  const act = () => S.subjects.filter((s) => !s.arch);
  const nowMin = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  /* ---------- CSS ---------- */
  {
    const st = document.createElement("style");
    st.textContent = `.rt-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-top:12px}.rt-c{background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}.rt-c h4{margin:0;font-size:1.05rem}.rt-c p{margin:0}.rt-bd{display:inline-block;font-size:.72rem;padding:2px 8px;border-radius:99px;border:1px solid var(--line);width:fit-content}.rt-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:7px 4px;border-bottom:1px solid var(--line)}.rt-row.f{border-left:4px solid var(--flame);padding-left:8px}.rt-row.now{background:color-mix(in srgb,var(--flame) 14%,transparent);border-radius:8px}.rt-h{font-variant-numeric:tabular-nums;color:var(--muted);min-width:96px;font-size:.85rem}.rt-row select{max-width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:4px 6px;color:var(--ink)}.rt-warn{margin:8px 0;padding:8px 10px;border:1px solid var(--line);border-left:6px solid #e5484d;border-radius:8px}.rt-ag summary{cursor:pointer}`;
    document.head.appendChild(st);
  }

  /* ---------- Tarefas geradas (blocos de foco vinculados a matérias) ---------- */
  function gen() {
    const r = S.rot,
      p = r && pOf(r.pid);
    if (!p) return 0;
    let n = 0;
    const nm = nowMin();
    for (let d = 0; d < 7; d++) {
      const dt = addD(now(), d),
        date = fmt(dt),
        wk = (dt.getDay() + 6) % 7;
      if (r.wd === "wk" && wk > 4) continue;
      p.b.forEach((b) => {
        if (b.t !== "f") return;
        const s = act().find((x) => x.id === (r.map || {})[b.i]);
        if (!s) return;
        const T = (s.topics = s.topics || []),
          parts = Math.ceil(b.d / 90);
        for (let k = 0; k < parts; k++) {
          const off = k * 90,
            len = Math.min(90, b.d - off),
            abs = tm(b.a) + off,
            st = abs % 1440,
            dd = Math.floor(abs / 1440);
          if (d === 0 && dd === 0 && st < nm) continue;
          const time = p2(Math.floor(st / 60)) + ":" + p2(st % 60),
            dt2 = fmt(addD(dt, dd)),
            name = `${p.e} ${b.n}${parts > 1 ? ` (${k + 1}/${parts})` : ""} · ${p.n}`;
          if (
            T.some(
              (x) =>
                x.rot === p.id &&
                x.date === dt2 &&
                x.time === time &&
                x.name === name,
            )
          )
            continue;
          T.push({
            id:
              "t" +
              Date.now().toString(36) +
              Math.random().toString(36).slice(2, 5),
            name,
            date: dt2,
            time,
            prio: "media",
            est: len,
            dur: len,
            done: false,
            doneAt: "",
            note: "Rotina de " + p.n,
            rot: p.id,
          });
          n++;
        }
      });
    }
    return n;
  }
  function strip(pid) {
    const t = fmt(now());
    S.subjects.forEach((s) => {
      s.topics = (s.topics || []).filter(
        (x) => !(x.rot === pid && !x.done && x.date >= t),
      );
    });
  }
  function adopt() {
    const p = pOf(rtView);
    if (!p) return;
    if (S.rot && S.rot.on && S.rot.pid !== p.id) {
      if (
        !confirm(
          "Você já tem a rotina de " +
            (pOf(S.rot.pid) || { n: "outra pessoa" }).n +
            " ativa. Substituir? As tarefas futuras dela serão removidas.",
        )
      )
        return;
      strip(S.rot.pid);
    }
    S.rot = { pid: p.id, map: { ...rtMap }, wd: rtWd, on: 1, t0: fmt(now()) };
    const n = gen();
    save();
    render();
    toast(
      `Rotina de ${p.n} adotada. ${n} tarefa${n === 1 ? "" : "s"} criada${n === 1 ? "" : "s"} nos próximos 7 dias.`,
    );
  }

  /* ---------- Agenda na tela inicial ---------- */
  function rtAg() {
    const r = S.rot,
      p = r && r.on && pOf(r.pid);
    if (!p) return "";
    const nm = nowMin(),
      L = srt(p),
      cur = L.find((b) => (nm - tm(b.a) + 1440) % 1440 < b.d),
      nx = L.filter((b) => b !== cur).sort(
        (x, y) =>
          ((tm(x.a) - nm + 1440) % 1440) - ((tm(y.a) - nm + 1440) % 1440),
      )[0],
      sj = (b) => {
        const s = act().find((x) => x.id === (r.map || {})[b.i]);
        return s
          ? ` <span style="color:${s.color}">→ ${esc(s.name)}</span>`
          : "";
      },
      rows = L.map(
        (b) =>
          `<div class="rt-row${b === cur ? " now" : ""}${b.t === "f" ? " f" : ""}"><span class="rt-h">${b === cur ? "▶ " : ""}${b.a}–${b.z}</span><span>${ICON[b.t]} ${esc(b.n)}${b.t === "f" ? sj(b) : ""}</span></div>`,
      ).join("");
    return `<div class="pn rt-ag"><details${rtOpen ? " open" : ""}><summary>${p.e} <b>Rotina de ${esc(p.n)}</b> · agora: ${cur ? `${ICON[cur.t]} ${esc(cur.n)} (${cur.a}–${cur.z})` : "livre"}${nx ? ` · próximo: ${nx.a} ${esc(nx.n)}` : ""}</summary><div style="margin-top:8px">${rows}</div><div style="margin-top:8px"><button class="btn" data-rt="go" data-a="nav" data-p="relatorio">🌅 Abrir Rotinas</button></div></details></div>`;
  }

  /* ---------- Aba Rotinas ---------- */
  function rtList() {
    const r = S.rot,
      ap = r && r.on && pOf(r.pid);
    return `<div class="mgs"><h2 style="text-transform:none">🌅 Rotinas de personalidades</h2><p class="sub" style="margin-top:0">Veja como grandes nomes organizavam o dia e adote uma como modelo. Os blocos de <b>foco</b> viram tarefas nas suas matérias (e aparecem no Calendário, Tarefas e Planejador); a agenda do dia aparece na tela inicial. As rotinas são aproximadas: confira o selo de confiança.</p>
 ${ap ? `<div class="mgc ok"><div class="mgh"><div class="mgt">${ap.e} Rotina ativa: ${esc(ap.n)}<small>${r.wd === "wk" ? "só dias úteis" : "todos os dias"} · tarefas dos próximos 7 dias</small></div><div class="acts"><button class="btn" data-rt="renew">🔄 Renovar 7 dias</button><button class="ghost danger" data-rt="stop">Encerrar</button></div></div></div>` : ""}
 <div class="rt-g">${ROT.map((p) => `<div class="rt-c"><h4>${p.e} ${esc(p.n)}</h4><span class="rt-bd" title="${CF[p.c][2]}">${CF[p.c][0]} ${CF[p.c][1]}</span><p class="sub">${esc(p.r)}</p><button class="btn${ap && ap.id === p.id ? " main" : ""}" data-rt="open" data-id="${p.id}">${ap && ap.id === p.id ? "✅ Ativa · ver" : "Ver rotina"}</button></div>`).join("")}</div></div>`;
  }
  function rtDetail() {
    const p = pOf(rtView),
      r = S.rot,
      A = act(),
      nf = p.b.filter((b) => b.t === "f").length,
      opts = (sel) =>
        `<option value="">— só referência —</option>` +
        A.map(
          (s) =>
            `<option value="${s.id}"${s.id === sel ? " selected" : ""}>${esc(s.name)}</option>`,
        ).join("");
    const rows = srt(p)
      .map(
        (b) =>
          `<div class="rt-row${b.t === "f" ? " f" : ""}"><span class="rt-h">${b.a}–${b.z}</span><span>${ICON[b.t]} <b>${esc(b.n)}</b> <small style="color:var(--muted)">${hh(b.d)} · ${TN[b.t]}</small></span>${b.t === "f" ? `<select data-rtsel="${b.i}" aria-label="Matéria do bloco">${opts(rtMap[b.i])}</select>` : ""}</div>`,
      )
      .join("");
    return `<div class="mgs"><div class="ch"><h2 style="text-transform:none">${p.e} ${esc(p.n)}</h2><button class="btn" data-rt="back">← Todas</button></div>
 <span class="rt-bd">${CF[p.c][0]} ${CF[p.c][1]}</span> <span class="sub">${CF[p.c][2]}. Fonte: ${esc(p.f)}.</span>
 ${p.c === "b" || p.c === "x" ? `<div class="rt-warn" role="alert">⚠️ <b>${p.c === "x" ? "Reconstrução fictícia" : "Pouco confiável"}.</b> ${esc(p.r)} Use só como inspiração.</div>` : `<p class="sub">${esc(p.r)} Horários aproximados.</p>`}
 <div>${rows}</div>
 <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">${nf && A.length ? `<label class="sub">Vincular todos os blocos de foco a: <select data-rtall style="background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:4px 6px;color:var(--ink)"><option value="">escolher…</option>${A.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></label>` : ""}
 <label class="sub">Dias: <select data-rtwd style="background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:4px 6px;color:var(--ink)"><option value="all"${rtWd === "all" ? " selected" : ""}>Todos os dias</option><option value="wk"${rtWd === "wk" ? " selected" : ""}>Só dias úteis</option></select></label></div>
 ${A.length ? "" : '<p class="sub">Adicione uma matéria ativa para vincular os blocos de foco.</p>'}
 <div style="margin-top:12px"><button class="btn main" data-rt="adopt">${r && r.on && r.pid === p.id ? "💾 Salvar alterações e renovar" : "✅ Adotar esta rotina"}</button></div>
 <p class="sub" style="font-size:.8rem;margin:8px 0 0">Ao adotar, os blocos de foco com matéria escolhida viram tarefas com hora e duração nos próximos 7 dias (os outros blocos ficam só na agenda). Use "Renovar 7 dias" quando quiser gerar mais.</p></div>`;
  }
  const rtHtml = () => (rtView && pOf(rtView) ? rtDetail() : rtList());

  /* ---------- Encaixe ---------- */
  RPG[0][2].push(["rotinas", "🌅 Rotinas"]);
  const _rr = renderRep;
  renderRep = function () {
    if (rTab !== "rotinas") return _rr.apply(this, arguments);
    const el = $("#rp");
    if (!el || curPage !== "relatorio") return;
    ["rp-subj", "rp-obj", "rp-hist", "rp-cal"].forEach((i) => {
      const x = document.getElementById(i);
      if (x) x.hidden = true;
    });
    el.innerHTML = rpTabs() + rtHtml();
  };
  const _rp = renderPanel;
  renderPanel = function () {
    const r = _rp.apply(this, arguments);
    const el = $("#panel");
    if (el)
      el.insertAdjacentHTML(
        "afterbegin",
        '<div id="rt-ag">' + rtAg() + "</div>",
      );
    return r;
  };

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rt]");
    if (!b) return;
    const a = b.dataset.rt;
    if (a === "go") {
      rTab = "rotinas";
      rtView = null;
      render();
    } else if (a === "open") {
      rtView = b.dataset.id;
      const r = S.rot;
      if (r && r.on && r.pid === rtView) {
        rtMap = { ...(r.map || {}) };
        rtWd = r.wd || "all";
      } else {
        rtMap = {};
        rtWd = "all";
      }
      renderRep();
    } else if (a === "back") {
      rtView = null;
      renderRep();
    } else if (a === "adopt") adopt();
    else if (a === "renew") {
      const n = gen();
      save();
      render();
      toast(
        n
          ? n +
              " tarefa" +
              (n === 1 ? "" : "s") +
              " criada" +
              (n === 1 ? "" : "s") +
              "."
          : "Os próximos 7 dias já estão gerados.",
      );
    } else if (a === "stop") {
      if (
        confirm(
          "Encerrar a rotina? As tarefas futuras não concluídas dela serão removidas.",
        )
      ) {
        strip(S.rot.pid);
        S.rot = null;
        save();
        render();
        toast("Rotina encerrada.");
      }
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target,
      d = t.dataset;
    if (!d) return;
    if (d.rtsel !== undefined) rtMap[d.rtsel] = t.value;
    else if (d.rtwd !== undefined) rtWd = t.value;
    else if (d.rtall !== undefined && t.value) {
      const p = pOf(rtView);
      if (p) {
        p.b.forEach((b) => {
          if (b.t === "f") rtMap[b.i] = t.value;
        });
        renderRep();
      }
    }
  });
  document.addEventListener(
    "toggle",
    (e) => {
      if (e.target.closest && e.target.closest("#rt-ag"))
        rtOpen = e.target.open;
    },
    true,
  );
  setInterval(() => {
    if (document.hidden) return;
    const e = document.getElementById("rt-ag");
    if (e) e.innerHTML = rtAg();
  }, 30000);
  try {
    renderPanel();
  } catch (e) {
    console.error("Rotinas:", e);
  }
})();
