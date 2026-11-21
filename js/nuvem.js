/* ===== Salvar: baixa o backup E guarda no seu Google Drive (pasta privada do app) =====
   - Só a sua conta Google enxerga: usa a pasta "appDataFolder", escondida, que nem aparece no Drive.
   - Precisa de um "ID do cliente" (Client ID) gratuito do Google Cloud. Passo a passo no botão ☁ Nuvem.
   Carregar depois de notas.js. */
(() => {
  const LS = (k, v) => {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch (e) {}
    return null;
  };
  const KCID = "corrente-gd-cid",
    KMT = "corrente-gd-mt",
    KHAS = "corrente-gd-has",
    KLAST = "corrente-gd-last";
  const SC = "https://www.googleapis.com/auth/drive.appdata";
  const MAIN = "corrente-save.json";
  let tok = null,
    texp = 0,
    busy = false;
  const fdt = (d) =>
    new Date(d).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  function loadGsi() {
    return new Promise((res, rej) => {
      if (window.google && google.accounts && google.accounts.oauth2)
        return res();
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = () => res();
      s.onerror = () =>
        rej(
          new Error("Não consegui carregar o login do Google (sem internet?)."),
        );
      document.head.appendChild(s);
    });
  }
  async function token() {
    if (tok && Date.now() < texp - 60000) return tok;
    const cid = LS(KCID);
    if (!cid) throw new Error("Configure o ID do cliente em ☁ Nuvem.");
    await loadGsi();
    return new Promise((res, rej) => {
      const c = google.accounts.oauth2.initTokenClient({
        client_id: cid,
        scope: SC,
        callback: (r) => {
          if (r.error) return rej(new Error(r.error_description || r.error));
          tok = r.access_token;
          texp = Date.now() + (r.expires_in || 3600) * 1000;
          LS(KHAS, "1");
          res(tok);
        },
        error_callback: (e) =>
          rej(
            new Error(
              e.type === "popup_closed"
                ? "Login cancelado."
                : e.type === "popup_failed_to_open"
                  ? "O navegador bloqueou a janela de login. Permita pop-ups e tente de novo."
                  : e.message || e.type || "Falha no login",
            ),
          ),
      });
      c.requestAccessToken({ prompt: LS(KHAS) ? "" : "consent" });
    });
  }
  async function api(url, opt) {
    opt = opt || {};
    const t = await token();
    const r = await fetch(url, {
      ...opt,
      headers: { Authorization: "Bearer " + t, ...(opt.headers || {}) },
    });
    if (r.status === 401) {
      tok = null;
      throw new Error("A sessão do Google expirou. Tente de novo.");
    }
    if (!r.ok) {
      let m = "";
      try {
        m = (await r.json()).error.message;
      } catch (e) {}
      throw new Error("Google Drive: " + (m || r.status));
    }
    return r;
  }
  async function list() {
    let out = [],
      pt = "";
    do {
      const u =
        "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1000&fields=nextPageToken,files(id,name,modifiedTime)" +
        (pt ? "&pageToken=" + encodeURIComponent(pt) : "");
      const j = await (await api(u)).json();
      out = out.concat(j.files || []);
      pt = j.nextPageToken || "";
    } while (pt);
    return out;
  }
  async function put(name, body, mime, id) {
    const meta = id ? { name } : { name, parents: ["appDataFolder"] },
      b = "cdb" + Math.random().toString(36).slice(2),
      blob = new Blob([
        `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: ${mime}\r\n\r\n`,
        body,
        `\r\n--${b}--`,
      ]);
    const u =
      (id
        ? `https://www.googleapis.com/upload/drive/v3/files/${id}`
        : "https://www.googleapis.com/upload/drive/v3/files") +
      "?uploadType=multipart&fields=id,modifiedTime";
    return (
      await api(u, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "multipart/related; boundary=" + b },
        body: blob,
      })
    ).json();
  }
  const getF = (id) =>
    api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`);
  const delF = (id) =>
    api(`https://www.googleapis.com/drive/v3/files/${id}`, {
      method: "DELETE",
    });

  /* ---------- backup em arquivo (com imagens) ---------- */
  const blobData = (b) =>
    new Promise((r) => {
      const f = new FileReader();
      f.onload = () => r(f.result);
      f.readAsDataURL(b);
    });
  async function downloadLocal() {
    if (window.NT) NT.flush();
    const out = Object.assign({}, S, { _imgs: {} });
    if (window.NT)
      for (const id of NT.imgIds()) {
        try {
          const b = await NT.imgGet(id);
          if (b) out._imgs[id] = await blobData(b);
        } catch (e) {}
      }
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(out)], { type: "application/json" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = `backup-corrente-${fmt(now())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  async function restoreImgs(imgs) {
    for (const id in imgs || {}) {
      try {
        const r = await fetch(imgs[id]);
        await NT.imgPut(id, await r.blob());
      } catch (e) {}
    }
  }

  /* ---------- nuvem ---------- */
  async function saveCloud() {
    if (busy) return;
    busy = true;
    try {
      status("Enviando para o Google Drive…");
      if (window.NT) NT.flush();
      const files = await list(),
        main = files.find((f) => f.name === MAIN),
        mt = LS(KMT);
      if (main && main.modifiedTime !== mt) {
        const ok = confirm(
          mt
            ? `O save na nuvem foi alterado em ${fdt(main.modifiedTime)} (talvez em outro aparelho) e este aparelho ainda não tem essa versão.\n\nSobrescrever mesmo assim com os dados DESTE aparelho?`
            : `Já existe um save na nuvem (de ${fdt(main.modifiedTime)}).\n\nSobrescrever com os dados DESTE aparelho? (Se quiser pegar o da nuvem, cancele e use “Restaurar da nuvem”.)`,
        );
        if (!ok) {
          status("Envio cancelado. Nada foi alterado na nuvem.");
          return false;
        }
      }
      const ids = window.NT ? NT.imgIds() : [],
        have = new Set(files.map((f) => f.name));
      for (const id of ids) {
        if (have.has("img-" + id)) continue;
        const b = await NT.imgGet(id);
        if (b) await put("img-" + id, b, b.type || "application/octet-stream");
      }
      const r = await put(
        MAIN,
        JSON.stringify({
          v: 1,
          savedAt: new Date().toISOString(),
          imgs: ids,
          data: S,
        }),
        "application/json",
        main && main.id,
      );
      LS(KMT, r.modifiedTime);
      LS(KLAST, new Date().toISOString());
      const keep = new Set(ids.map((i) => "img-" + i));
      for (const f of files)
        if (f.name.startsWith("img-") && !keep.has(f.name))
          delF(f.id).catch(() => {});
      status("Salvo no Google Drive ✓ " + fdt(r.modifiedTime));
      return true;
    } finally {
      busy = false;
    }
  }
  async function restoreCloud() {
    if (busy) return;
    busy = true;
    try {
      status("Procurando o save na nuvem…");
      const files = await list(),
        main = files.find((f) => f.name === MAIN);
      if (!main) {
        status(
          "Ainda não existe save na nuvem. Use “Salvar agora” no aparelho que tem seus dados.",
        );
        return;
      }
      if (
        !confirm(
          `Restaurar o save da nuvem (${fdt(main.modifiedTime)})?\n\nIsso SUBSTITUI os dados deste aparelho.`,
        )
      ) {
        status("Restauração cancelada.");
        return;
      }
      const d = JSON.parse(await (await getF(main.id)).text());
      if (!d || !d.data || !Array.isArray(d.data.subjects))
        throw new Error("O save da nuvem está em formato inesperado.");
      status("Baixando imagens…");
      for (const id of d.imgs || []) {
        if (await NT.imgGet(id)) continue;
        const f = files.find((x) => x.name === "img-" + id);
        if (f) await NT.imgPut(id, await (await getF(f.id)).blob());
      }
      S = d.data;
      migrate();
      save();
      if (window.NT) NT.reload();
      render();
      LS(KMT, main.modifiedTime);
      LS(KLAST, new Date().toISOString());
      status("Restaurado ✓ (save de " + fdt(main.modifiedTime) + ")");
      toast("Save da nuvem restaurado.");
    } finally {
      busy = false;
    }
  }
  const fail = (e) => {
    console.error(e);
    status("⚠ " + (e && e.message ? e.message : e));
    toast(e && e.message ? e.message : "Falha ao falar com o Google Drive.");
  };

  /* ---------- tela ☁ Nuvem ---------- */
  function status(t) {
    const el = document.getElementById("gd-st");
    if (el) el.textContent = t;
  }
  function dlg() {
    let d = document.getElementById("gd-dlg");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "gd-dlg";
      d.innerHTML = '<div class="dl" id="gd-db"></div>';
      document.body.appendChild(d);
      d.addEventListener("click", (e) => {
        const b = e.target.closest("[data-gd]");
        if (!b) return;
        const a = b.dataset.gd;
        if (a === "x") d.close();
        else if (a === "cid") {
          const v = document.getElementById("gd-cid").value.trim();
          if (v && !/\.apps\.googleusercontent\.com$/.test(v))
            return status(
              "Esse ID parece errado: ele termina com .apps.googleusercontent.com",
            );
          LS(KCID, v || null);
          tok = null;
          if (!v) LS(KHAS, null);
          draw();
          if (v)
            status(
              "ID salvo. Agora clique em “Salvar agora” para entrar com o Google.",
            );
        } else if (a === "save") saveCloud().catch(fail);
        else if (a === "rest") restoreCloud().catch(fail);
        else if (a === "out") {
          try {
            if (tok && window.google)
              google.accounts.oauth2.revoke(tok, () => {});
          } catch (e) {}
          tok = null;
          LS(KHAS, null);
          LS(KMT, null);
          status("Desconectado deste aparelho.");
        }
      });
    }
    return d;
  }
  function draw() {
    const cid = LS(KCID) || "",
      last = LS(KLAST);
    document.getElementById("gd-db").innerHTML =
      `<h2 style="margin-top:0">☁ Nuvem (Google Drive)</h2>
<p class="sub" style="margin-top:0">Seu save fica numa pasta escondida do app no <b>seu</b> Google Drive. Só a sua conta Google consegue ler. Em outro aparelho: abra o app, entre com a mesma conta e clique em <b>Restaurar da nuvem</b>.</p>
<p id="gd-st" style="font-weight:700;margin:8px 0">${cid ? (last ? "Último envio/restauração neste aparelho: " + fdt(last) : "ID configurado. Falta o primeiro envio.") : "Ainda não configurado."}</p>
<label class="sub" for="gd-cid">ID do cliente (Client ID) do Google</label>
<div style="display:flex;gap:8px;margin:4px 0 10px"><input id="gd-cid" type="text" value="${cid.replace(/"/g, "&quot;")}" placeholder="123456-abc.apps.googleusercontent.com" style="flex:1;min-width:0;padding:9px;border-radius:10px;background:var(--bg);color:var(--ink);border:1px solid var(--line)"><button class="btn" data-gd="cid">Guardar ID</button></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="btn main" data-gd="save"${cid ? "" : " disabled"}>☁ Salvar agora</button><button class="btn" data-gd="rest"${cid ? "" : " disabled"}>⬇ Restaurar da nuvem</button><button class="btn" data-gd="out"${cid ? "" : " disabled"}>Desconectar</button></div>
<details><summary style="cursor:pointer;font-weight:700">Como pegar o ID do cliente (uma vez só, grátis)</summary>
<ol style="line-height:1.55;padding-left:20px;margin:8px 0 0">
<li>Abra <b>console.cloud.google.com</b> e crie um projeto (ex.: “Corrente”).</li>
<li>Menu <b>APIs e serviços › Biblioteca</b>: procure <b>Google Drive API</b> e clique em <b>Ativar</b>.</li>
<li><b>Tela de permissão OAuth</b> (ou “Google Auth Platform”): tipo <b>Externo</b>, preencha o nome do app e seu e-mail. Em <b>Usuários de teste</b>, adicione o seu e-mail do Google. Em escopos, adicione <code>.../auth/drive.appdata</code>.</li>
<li><b>Credenciais › Criar credenciais › ID do cliente OAuth</b>, tipo <b>Aplicativo da Web</b>. Em <b>Origens JavaScript autorizadas</b> coloque exatamente: <code>${location.origin}</code> (sem barra no final e sem o nome do repositório).</li>
<li>Copie o <b>ID do cliente</b>, cole acima e clique em <b>Guardar ID</b>.</li>
</ol>
<p class="sub">Ao entrar, o Google pode avisar “app não verificado”: é normal, o app é seu. Clique em Avançado › continuar.</p></details>
<div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn" data-gd="x">Fechar</button></div>`;
  }
  function openDlg() {
    const d = dlg();
    draw();
    d.showModal();
  }

  /* ---------- botão Salvar (antigo Exportar) ---------- */
  function setup() {
    const exp = document.getElementById("exp");
    if (!exp) return;
    exp.textContent = "💾 Salvar";
    exp.title =
      "Baixa o backup e também guarda no seu Google Drive (se configurado)";
    exp.onclick = async () => {
      try {
        await downloadLocal();
      } catch (e) {
        return toast("Não foi possível gerar o backup.");
      }
      if (!LS(KCID))
        return toast(
          "Backup baixado. Para salvar online também, configure em ☁ Nuvem.",
        );
      toast("Backup baixado. Enviando para o Drive…");
      try {
        const ok = await saveCloud();
        if (ok) toast("Salvo no arquivo e no Google Drive ✓");
      } catch (e) {
        fail(e);
        toast(
          "Backup baixado, mas o envio ao Drive falhou: " + (e.message || e),
        );
      }
    };
    if (!document.getElementById("gd-btn")) {
      const b = document.createElement("button");
      b.className = "btn";
      b.id = "gd-btn";
      b.textContent = "☁ Nuvem";
      b.onclick = openDlg;
      exp.after(b);
    }
    /* importar: também restaura as imagens que vêm dentro do arquivo */
    const f = document.getElementById("file");
    if (f)
      f.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = async () => {
          try {
            const d = JSON.parse(r.result);
            if (!Array.isArray(d.subjects)) throw 0;
            if (
              confirm("Importar vai substituir os dados atuais. Continuar?")
            ) {
              const imgs = d._imgs;
              delete d._imgs;
              if (imgs && window.NT) await restoreImgs(imgs);
              S = d;
              migrate();
              save();
              if (window.NT) NT.reload();
              render();
              toast("Backup restaurado.");
            }
          } catch (x) {
            toast("Arquivo inválido. Escolha um backup .json deste app.");
          }
        };
        r.readAsText(file);
        e.target.value = "";
      };
    if (LS(KCID)) setTimeout(() => loadGsi().catch(() => {}), 2000);
  }
  setup();
})();
