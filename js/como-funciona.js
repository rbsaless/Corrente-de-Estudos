/* ===== Aba "Como funciona": explica as regras do app. Carregar depois de nivel-dificuldade.js ===== */
(() => {
  const D = (t, b, o) =>
    `<details class="mgs"${o ? " open" : ""}><summary style="cursor:pointer;font-weight:800;font-size:1.05rem">${t}</summary><div style="margin-top:10px;line-height:1.5">${b}</div></details>`;
  const U = (a) =>
    '<ul style="margin:6px 0;padding-left:20px">' +
    a.map((x) => '<li style="margin-bottom:4px">' + x + "</li>").join("") +
    "</ul>";
  const P = (x) => '<p style="margin:6px 0">' + x + "</p>";
  const mm = (m) => hh(m);
  function difTable() {
    const rows = Array.from({ length: 20 }, (_, i) => i * 5 + 1)
      .map((n) => {
        const r = window.__dif ? window.__dif.rep(n) : n,
          t = (r - 1) / 99;
        return `<tr><td>${n}–${n + 4}</td><td>${mm(window.__dif ? window.__dif.minF(n) : 60)}</td><td>×${(1 - 0.5 * t).toFixed(2).replace(".", ",")}</td><td>×${(1 + t).toFixed(2).replace(".", ",")}</td><td>×${(1 + 1.5 * t).toFixed(2).replace(".", ",")}</td></tr>`;
      })
      .join("");
    return `<div style="overflow-x:auto"><table class="chtb"><thead><tr><th>Nível de dificuldade</th><th>Mínimo por dia</th><th>Lazer ganho</th><th>Ociosidade</th><th>Preços</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function build() {
    const dv = S.dif ? S.dif.lv : 1,
      tg = S.dif ? S.dif.tg : 1;
    return (
      `<div class="mgs"><p class="sub" style="margin:0">Aqui está como o app funciona, sem código. Tudo vale só para o estudo <b>planejado</b> (o estudo fora do plano entra apenas no total). Seu nível de dificuldade agora: <b>${dv}</b> (igual ao seu nível).</p></div>` +
      D(
        "📈 Níveis, XP e dificuldade",
        P(
          "<b>XP:</b> você ganha 100 XP por hora planejada. Sessões salvas com o bônus ativo valem +25% de XP. Subir de nível custa cerca de 26 horas de estudo por nível (2600 XP, +4 por nível); até o nível que você tinha ao ativar essa regra, vale o custo antigo. Em média, estudando 3h30 a 4h por dia, sobe ~1 nível por semana. São 100 níveis, divididos em 10 atos de RPG (Iniciação, Estrada, Ofício… até Lenda).",
        ) +
          P(
            "<b>O XP acumula e não zera por pausa.</b> Sem estudar, o tempo ocioso gasta primeiro o lazer e, com o lazer zerado, passa a tirar XP. Quando o XP do nível chega a zero, você cai para o nível anterior (com o XP quase cheio) e assim por diante, nunca de uma vez para o 1. Ociosidade e punições tiram XP.",
          ) +
          P(
            "<b>Dificuldade por nível:</b> quanto mais alto o nível, mais o app exige. A dificuldade acompanha o seu nível (sobe e cai junto), em faixas de 5 níveis: todos os níveis da mesma faixa têm o mesmo mínimo e os mesmos efeitos. O novo mínimo vale a partir do dia seguinte; dias passados não mudam. Em cada nível mudam quatro coisas:",
          ) +
          difTable() +
          U([
            "<b>Mínimo por dia:</b> estudo planejado necessário para o dia contar na streak (nunca abaixo do mínimo que você mesmo configurou).",
            "<b>Lazer ganho:</b> multiplica os minutos de lazer que cada hora de estudo rende.",
            "<b>Ociosidade:</b> multiplica o lazer e o XP perdidos por hora parado.",
            "<b>Preços:</b> multiplica o custo em Elos de tudo na Loja (itens grátis continuam grátis).",
          ]),
        1,
      ) +
      D(
        "🔥 Streak e mínimo do dia",
        U([
          "O dia conta na <b>streak geral</b> quando o estudo planejado de todas as matérias soma pelo menos o mínimo do dia. O mínimo padrão é 30 min e o do seu nível pode ser maior.",
          "Cada matéria também tem a própria streak (qualquer dia com estudo naquela matéria).",
          "Você pode <b>aumentar</b> o mínimo de graça (vale a partir de hoje). <b>Diminuir</b> exige o item “Reduzir mínimo” da Loja, e nunca fica abaixo do mínimo do seu nível.",
          "<b>Day Off</b> (máx. 1 guardado) e <b>Congelamento</b> protegem um dia sem estudo. O Congelamento é usado automaticamente.",
          "Se o dia terminar com o saldo de lazer abaixo de −10h, a streak, a dívida de lazer e os Elos zeram (o Congelamento evita isso).",
          "O recorde histórico da streak fica salvo.",
        ]),
      ) +
      D(
        "😴 Banco de lazer",
        U([
          "<b>Ganho:</b> a cada hora de estudo planejado você ganha 15 min de lazer (taxa configurável), multiplicada pelo nível. Cronômetro com foco 5 ★ ganha bônus (padrão ×1,5). Registro manual não tem bônus.",
          "<b>Dívida de estudo:</b> empréstimos e punições geram dívida. Cada minuto estudado paga a dívida primeiro e, enquanto paga, não gera lazer.",
          "<b>Descanso:</b> você gasta o saldo num descanso com cronômetro. Tickets da Loja dão descanso sem gastar saldo e só ativam depois de bater o mínimo do dia.",
          "<b>Empréstimo</b> (opcional): pega lazer agora com juros (padrão 50%) e paga estudando.",
          "<b>Ociosidade:</b> com a cobrança ligada, cada hora com o cronômetro parado (fora de rotina, ocupado/fora ou pausa) tira 60 min de lazer (× o nível). Zerado o lazer, ele continua negativo e o XP também cai (100 XP por hora).",
          "<b>Modo Castigo:</b> depois de falhar num desafio forte ou extremo, o lazer rende metade por 7 dias.",
        ]),
      ) +
      D(
        "📉 Escada do saldo negativo (degraus)",
        P("Quanto mais negativo o saldo, mais efeitos se somam:") +
          U([
            "<b>Degrau 1</b> (até −1h): só aviso.",
            "<b>Degrau 2</b> (até −3h): o lazer ganho rende metade.",
            "<b>Degrau 3</b> (até −6h): desafio do dia e marcos de desafio ficam bloqueados.",
            "<b>Degrau 4</b> (até −10h): o XP ganho cai pela metade.",
            "<b>Degrau 5</b> (abaixo de −10h): a streak zera ao fim do dia.",
          ]) +
          P(
            "O <b>Modo Quitação</b> (em Banco de lazer) mostra quanto estudar para voltar um degrau.",
          ),
      ) +
      D(
        "🪙 Elos e Loja",
        U([
          "<b>Elos:</b> 1 a cada 10 min estudados (+50% com foco 5 ★), +3 por dia que cumpre a streak, mais prêmios de desafios, marcos e desafio do dia.",
          "Cada item tem limite semanal. O preço sobe 20% a cada compra do mesmo item nos últimos 7 dias e é multiplicado pelo nível.",
          "<b>Proteção:</b> Congelar streak, Reduzir mínimo, Perdão de dívida, Passe de ociosidade, Day Off, Poção de perdão de dívida de lazer e Poção mágica (a primeira de cada poção é grátis).",
          "<b>Impulso:</b> Boost (+25% de lazer), XP em dobro, Hora Dourada (lazer em dobro por 2h), Elixir do Reembolso (estudar abate dívida e saldo negativo 1:1), Lazer extra.",
          "<b>Diversão:</b> tickets de jogo, videogame, série, guloseima, cinema e vale-presente.",
          "<b>Sorte e cofre:</b> baús com prêmios aleatórios e o Cofre de Elos (guarda por 7 dias e devolve 20% a mais; protegido do reset de −10h).",
        ]),
      ) +
      D(
        "⛓️ Desafios, contratos e Tudo ou Nada",
        U([
          "<b>Desafio de sobrevivência</b> (1 a 30 dias, um por vez): níveis Leve, Forte e Extremo, com metas por dia, total, foco 4–5 ★ ou constância. Bater dá prêmio em lazer, XP e Elos; falhar (ou cancelar) gera dívida de lazer e, nos mais fortes, Modo Castigo e perda de XP. Aos 50% você já recebe 10% do prêmio.",
          "<b>Desafio do dia:</b> meta de 1 dia baseada na sua média dos últimos 7 dias. Sem punição.",
          "<b>Contratos de foco:</b> meta de horas na semana com recompensa (lazer ou XP) e punição (dívida de lazer).",
          "<b>Tudo ou Nada:</b> no cronômetro, cumprir 80% do tempo planejado dá um prêmio; parar antes custa lazer (padrão 30 min).",
        ]),
      ) +
      D(
        "🏅 Ligas semanais",
        U([
          "18 ligas, de Ferro a Imortal, fechadas toda semana de segunda a sábado (domingo não conta).",
          "Cada liga tem uma meta de horas: bater a da liga de cima faz subir, ficar abaixo da sua faz cair uma liga. Só conta estudo planejado.",
          "A liga inicial vem da média das últimas 4 semanas, e a primeira semana não rebaixa.",
        ]),
      ) +
      D(
        "⏱ Cronômetro, foco e registros",
        U([
          "O cronômetro cria blocos com horário. Ao pausar, você anota o que estudou e dá uma nota de foco de 1 a 5.",
          "Técnicas: Pomodoro (25/5), 52/17 e 90/20, com aviso de pausa.",
          "Sessões “não planejadas” só entram no total: sem streak, XP, lazer, Elos ou desafios.",
          "Matérias com importância “nenhuma” ficam fora do plano e contam como não planejadas.",
        ]),
      ) +
      D(
        "🗓️ Planejamento, tarefas e provas",
        U([
          "<b>Plano semanal:</b> distribui a meta da semana pelos dias em que você mais estuda (máx. 12h por dia), considerando importância, dificuldade, provas, tarefas atrasadas e revisões.",
          "<b>Tarefas</b> têm data, horário, duração e estimativa. Concluir tarefa cria revisões espaçadas (1, 3, 7 e 21 dias) se ativado.",
          "<b>Provas:</b> cadastre como tarefa de prova e o app faz a contagem regressiva e aumenta o peso da matéria quando a data chega perto.",
          "<b>Metas & Goals</b> (dia, semana, mês, ano) e Recompensas desbloqueadas ao cumprir as metas da semana.",
        ]),
      ) +
      D(
        "☢️ Terminal Lost",
        U([
          "Ciclo de 108 min. Digitar o código nos últimos 4 min dá +3 Elos e reinicia o ciclo.",
          "Se o relógio zerar (mais 32 s de tolerância), a falha custa −30 min de lazer e zera só o XP do nível atual (você mantém o nível).",
          "Rotinas com término ativas pausam o terminal. Ciclos especiais: 00h = 480 min (domingo 720) e quarta/domingo às 18h = 240 min.",
        ]),
      ) +
      D(
        "💡 Lumi, Coach e Faculdade",
        U([
          "<b>Lumi:</b> treinadora sem IA que responde com seus dados, propõe planos (você confirma antes de mudar algo) e dá alertas.",
          "<b>Lumi IA:</b> versão com Gemini (precisa da sua chave). Lê seus dados a cada pergunta e usa o diário que você escreve.",
          "<b>Coach:</b> mostra onde e quando estudar, diagnóstico dos seus dados e uma técnica do dia.",
          "<b>Faculdade:</b> semestres, pré-requisitos, notas e faltas; influencia o peso das matérias no plano.",
        ]),
      ) +
      D(
        "💾 Dados e backup",
        U([
          "Tudo fica salvo no navegador. Use <b>Exportar backup</b> e <b>Importar backup</b> para guardar ou mover os dados.",
          "A chave da Lumi IA não entra no backup.",
        ]),
      )
    );
  }
  function ensure() {
    if (!document.getElementById("pg-ajuda")) {
      const pg = document.createElement("div");
      pg.className = "page";
      pg.id = "pg-ajuda";
      pg.hidden = true;
      pg.innerHTML =
        '<div class="ptop"><button class="btn" data-a="back" aria-label="Voltar para a tela inicial">← Início</button><h1>📖 Como funciona</h1></div><section id="aj" aria-label="Como o app funciona"></section>';
      const ref = document.getElementById("pg-feed");
      (ref && ref.parentNode
        ? ref.parentNode
        : document.querySelector(".wrap")
      ).appendChild(pg);
    }
    if (!document.getElementById("aj-btn")) {
      const t = document.querySelector(".tools"),
        b = document.createElement("button");
      b.className = "btn";
      b.id = "aj-btn";
      b.dataset.a = "nav";
      b.dataset.p = "ajuda";
      b.textContent = "📖 Como funciona";
      if (t) {
        const ex = document.getElementById("exp");
        t.insertBefore(b, ex || null);
      }
    }
    if (!PAGES.includes("ajuda")) PAGES.push("ajuda");
  }
  function draw() {
    if (curPage !== "ajuda") return;
    const el = document.getElementById("aj");
    if (!el) return;
    const k = S.dif ? S.dif.lv + "/" + S.dif.tg : "0";
    if (el.dataset.k === k && el.children.length) return;
    el.dataset.k = k;
    el.innerHTML = build();
  }
  ensure();
  const _r = render;
  render = function () {
    const r = _r.apply(this, arguments);
    try {
      draw();
    } catch (e) {
      console.error("Ajuda:", e);
    }
    return r;
  };
  if (decodeURIComponent(location.hash.slice(1)) === "ajuda") route();
})();
