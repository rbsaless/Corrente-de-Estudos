/* ===== Notas v2: editor estilo Notion (escreve direto na página, "/" para comandos, cores, destaque,
   código colorido, callouts, tarefas, imagens) + backup .zip + importar .md/.zip (inclui export do Notion).
   Carregar depois de como-funciona.js e antes de lumi.js ===== */
(() => {
  const ID = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  let q = "",
    tm = null,
    shown = false,
    ed = null,
    curId = null;
  let hist = [],
    hi = -1,
    hTm = null,
    lastRange = null,
    slash = null;
  const N = () => {
    const n = (S.notas = S.notas && typeof S.notas === "object" ? S.notas : {});
    n.items = Array.isArray(n.items) ? n.items : [];
    n.sel = n.sel || null;
    return n;
  };
  const get = (id) => N().items.find((x) => x.id === id);
  const kids = (p) =>
    N()
      .items.filter((x) => (x.p || null) === (p || null))
      .sort(
        (a, b) =>
          (a.k === b.k ? 0 : a.k === "f" ? -1 : 1) ||
          (b.s | 0) - (a.s | 0) ||
          String(a.t).localeCompare(String(b.t), "pt"),
      );
  const desc = (id) => {
    const r = [];
    const w = (p) =>
      kids(p).forEach((x) => {
        r.push(x.id);
        if (x.k === "f") w(x.id);
      });
    w(id);
    return r;
  };
  const path = (it) => {
    const r = [];
    let p = it.p;
    while (p) {
      const x = get(p);
      if (!x) break;
      r.unshift(x.t);
      p = x.p;
    }
    return r.join(" / ");
  };
  const exec = (c, v) => document.execCommand(c, false, v == null ? null : v);
  const unwrap = (el) => {
    while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
    el.remove();
  };

  /* ---------- Cores (classes, funcionam em qualquer tema) ---------- */
  const COL = {
    red: ["Vermelho", "#e5484d"],
    orange: ["Laranja", "#f76808"],
    yellow: ["Amarelo", "#d9a400"],
    green: ["Verde", "#30a46c"],
    teal: ["Turquesa", "#12a594"],
    blue: ["Azul", "#3e63dd"],
    purple: ["Roxo", "#8e4ec6"],
    pink: ["Rosa", "#d6409f"],
    gray: ["Cinza", "#8b8d98"],
  };
  const BGC = {
    red: "rgba(229,72,77,.28)",
    orange: "rgba(247,104,8,.28)",
    yellow: "rgba(255,213,0,.38)",
    green: "rgba(48,164,108,.28)",
    teal: "rgba(18,165,148,.28)",
    blue: "rgba(62,99,221,.28)",
    purple: "rgba(142,78,198,.28)",
    pink: "rgba(214,64,159,.28)",
    gray: "rgba(139,141,152,.28)",
  };
  const LANGS = [
    "",
    "js",
    "ts",
    "python",
    "html",
    "css",
    "sql",
    "bash",
    "json",
    "java",
    "c",
    "cpp",
    "csharp",
    "php",
    "go",
    "rust",
    "yaml",
  ];
  const LANGN = {
    "": "texto",
    js: "JavaScript",
    ts: "TypeScript",
    python: "Python",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    bash: "Bash",
    json: "JSON",
    java: "Java",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    php: "PHP",
    go: "Go",
    rust: "Rust",
    yaml: "YAML",
  };
  const EMO = ["💡", "⚠️", "✅", "❗", "📌", "ℹ️"];

  /* ---------- Colorizador de código (não depende de biblioteca) ---------- */
  const KW = new Set(
    "abstract and as async await break case catch class const continue def default del delete do elif else enum except export extends false final finally fn for from func function global if implements import in instanceof interface is lambda let match new nonlocal not null None of or package pass private protected pub public raise return self static struct super switch this throw throws true True False try type typeof undefined use var void while with yield select insert update create table where join group order by limit values into set from SELECT INSERT UPDATE DELETE CREATE TABLE WHERE JOIN GROUP ORDER BY LIMIT VALUES INTO SET FROM AND OR NOT NULL echo print int float double string bool boolean char long short begin end then fi done esac".split(
      " ",
    ),
  );
  const HASH = /^(python|py|bash|sh|shell|yaml|yml|ruby|rb|r|toml)$/;
  function tokens(text, lang) {
    lang = String(lang || "").toLowerCase();
    let cm;
    if (HASH.test(lang)) cm = "#[^\\n]*";
    else if (lang === "sql") cm = "--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
    else if (lang === "html" || lang === "xml") cm = "<!--[\\s\\S]*?-->";
    else if (lang === "json") cm = "(?!)";
    else cm = "\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*";
    const tag =
      lang === "html" || lang === "xml"
        ? "|(<\\/?[A-Za-z][\\w:-]*|\\/?>)"
        : "|()";
    const rx = new RegExp(
      "(" +
        cm +
        ")|(\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'|`(?:\\\\.|[^`\\\\])*`)|(\\b\\d[\\d_.]*\\b)|([A-Za-z_$\\u00C0-\\u00FF][\\w$\\u00C0-\\u00FF]*)" +
        tag,
      "g",
    );
    let o = "",
      last = 0,
      m;
    while ((m = rx.exec(text))) {
      if (m[0] === "") {
        rx.lastIndex++;
        continue;
      }
      o += esc(text.slice(last, m.index));
      last = m.index + m[0].length;
      let c = "";
      if (m[1]) c = "tk-c";
      else if (m[2]) c = "tk-s";
      else if (m[3]) c = "tk-n";
      else if (m[5]) c = "tk-k";
      else if (m[4]) {
        if (KW.has(m[4])) c = "tk-k";
        else if (text[last] === "(") c = "tk-f";
        else if (/^[A-Z]/.test(m[4]) && /[a-z]/.test(m[4])) c = "tk-t";
      }
      o += c ? `<span class="${c}">${esc(m[0])}</span>` : esc(m[0]);
    }
    return o + esc(text.slice(last));
  }
  const preText = (pre) =>
    (pre.innerText || pre.textContent || "")
      .replace(/\u200b/g, "")
      .replace(/\n$/, "");
  function paintCode(cb) {
    const pre = cb.querySelector("pre");
    if (!pre) return;
    const t = preText(pre);
    pre.innerHTML = t ? tokens(t, cb.dataset.lang) : "";
  }
  function mkCb(lang, text) {
    const d = document.createElement("div");
    d.className = "nt-cb";
    d.dataset.lang = lang || "";
    d.contentEditable = "false";
    d.innerHTML = `<div class="nt-ch"><select class="nt-lg" aria-label="Linguagem">${LANGS.map((l) => `<option value="${l}"${l === (lang || "") ? " selected" : ""}>${LANGN[l]}</option>`).join("")}</select><button type="button" data-nt="copy">Copiar</button></div><pre class="nt-code" spellcheck="false"></pre>`;
    const pre = d.querySelector("pre");
    try {
      pre.contentEditable = "plaintext-only";
    } catch (e) {
      pre.contentEditable = "true";
    }
    pre.textContent = text || "";
    paintCode(d);
    return d;
  }

  /* ---------- Imagens (IndexedDB) ---------- */
  let dbp = null;
  const U = {};
  const DB = () =>
    dbp ||
    (dbp = new Promise((res, rej) => {
      const r = indexedDB.open("nt-img", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("i");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
  const tx = (m, f) =>
    DB().then(
      (d) =>
        new Promise((res, rej) => {
          const t = d.transaction("i", m),
            r = f(t.objectStore("i"));
          t.oncomplete = () => res(r.result);
          t.onerror = () => rej(t.error);
        }),
    );
  const idbPut = (id, b) => tx("readwrite", (s) => s.put(b, id));
  const idbGet = (id) => tx("readonly", (s) => s.get(id));
  const idbDel = (id) => tx("readwrite", (s) => s.delete(id));
  const idbKeys = () => tx("readonly", (s) => s.getAllKeys());
  const refs = (c) =>
    (String(c || "").match(/\(img:(\w+)\)/g) || []).map((r) => r.slice(5, -1));
  const refsH = (h) =>
    (String(h || "").match(/data-img="(\w+)"/g) || []).map((r) =>
      r.slice(10, -1),
    );
  const refsOf = (x) => [...refsH(x.h), ...refs(x.c)];
  const usedImgs = () => {
    const s = new Set();
    N().items.forEach((x) => refsOf(x).forEach((r) => s.add(r)));
    return [...s];
  };
  async function url(id) {
    if (U[id]) return U[id];
    const b = await idbGet(id);
    if (!b) return null;
    return (U[id] = URL.createObjectURL(b));
  }
  function hydrate() {
    if (!ed) return;
    ed.querySelectorAll("img[data-img]").forEach((im) => {
      if (im.getAttribute("src")) return;
      url(im.dataset.img)
        .then((u) => {
          if (u) im.src = u;
          else {
            im.classList.add("nt-miss");
            im.alt = "[imagem não encontrada neste navegador]";
          }
        })
        .catch(() => {});
    });
  }
  async function comp(f) {
    if (f.type === "image/gif" || f.type === "image/svg+xml") return f;
    try {
      const bm = await createImageBitmap(f),
        sc = Math.min(1, 1280 / Math.max(bm.width, bm.height)),
        c = document.createElement("canvas");
      c.width = Math.round(bm.width * sc);
      c.height = Math.round(bm.height * sc);
      c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
      let b = await new Promise((r) => c.toBlob(r, "image/webp", 0.82));
      if (!b || b.type !== "image/webp")
        b = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
      return b && !(sc === 1 && b.size > f.size) ? b : f;
    } catch (e) {
      return f;
    }
  }
  async function addImgs(fs) {
    if (!ed) return;
    let html = "";
    for (const f of fs) {
      if (!/^image\//.test(f.type)) continue;
      try {
        const b = await comp(f),
          id = ID();
        await idbPut(id, b);
        U[id] = URL.createObjectURL(b);
        html += `<p><img class="nt-im" data-img="${id}" alt="${esc((f.name || "imagem").replace(/\.[^.]+$/, ""))}" src="${U[id]}"></p>`;
      } catch (e) {
        toast("Não foi possível adicionar a imagem.");
      }
    }
    if (!html) return;
    snap();
    ensureSel();
    exec("insertHTML", html);
    fixTop();
    touch();
    flush();
  }
  async function gc() {
    try {
      const ks = await idbKeys(),
        used = new Set(usedImgs());
      for (const k of ks) if (!used.has(k)) await idbDel(k);
    } catch (e) {}
  }
  function zoom(src, alt) {
    const d = document.createElement("div");
    d.className = "nt-lb";
    d.innerHTML = `<img src="${src}" alt="${esc(alt || "")}">`;
    d.onclick = () => d.remove();
    document.body.appendChild(d);
  }

  /* ---------- Markdown -> HTML (importar / colar / migrar notas antigas) ---------- */
  function inl(s) {
    const st = [];
    s = esc(s).replace(/`([^`]+)`/g, (m, c) => {
      st.push("<code>" + c + "</code>");
      return "\u0000" + (st.length - 1) + "\u0000";
    });
    s = s
      .replace(
        /!\[([^\]]*)\]\(img:(\w+)\)/g,
        '<img class="nt-im" data-img="$2" alt="$1">',
      )
      .replace(
        /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)/g,
        '<img class="nt-im" src="$2" alt="$1">',
      )
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/~~(.+?)~~/g, "<s>$1</s>")
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<i>$2</i>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      );
    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => st[i]);
  }
  const LI = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
  function parseList(L, i, base) {
    const m0 = L[i].match(LI),
      ord = /\d/.test(m0[2]),
      todo = !ord && /^\[( |x|X)\](\s|$)/.test(m0[3]),
      items = [];
    while (i < L.length) {
      const m = L[i].match(LI);
      if (!m) break;
      const ind = m[1].replace(/\t/g, "  ").length;
      if (ind < base) break;
      if (ind > base) {
        const [h, ni] = parseList(L, i, ind);
        if (items.length) items[items.length - 1].sub += h;
        else items.push({ t: "", ck: false, sub: h });
        i = ni;
        continue;
      }
      let t = m[3],
        ck = false;
      const k = t.match(/^\[( |x|X)\]\s?(.*)$/);
      if (k) {
        ck = k[1] !== " ";
        t = k[2];
      }
      items.push({ t, ck, sub: "" });
      i++;
    }
    const tag = ord ? "ol" : "ul";
    return [
      `<${tag}${todo ? ' class="nt-todo"' : ""}>` +
        items
          .map(
            (x) =>
              `<li${todo ? ` data-ck="${x.ck ? 1 : 0}"` : ""}>${inl(x.t)}${x.sub}</li>`,
          )
          .join("") +
        `</${tag}>`,
      i,
    ];
  }
  function md(src) {
    const L = String(src || "")
        .replace(/\r/g, "")
        .split("\n"),
      o = [];
    let i = 0;
    const bl = (l) => /^(```|#{1,3}\s|>|---+\s*$)/.test(l) || LI.test(l);
    while (i < L.length) {
      const l = L[i];
      let m;
      if ((m = l.match(/^\s*```\s*([\w+#-]*)/))) {
        const c = [];
        i++;
        while (i < L.length && !/^\s*```\s*$/.test(L[i])) c.push(L[i++]);
        i++;
        o.push(
          `<div class="nt-cb" data-lang="${esc(m[1] || "")}"><pre>${esc(c.join("\n"))}</pre></div>`,
        );
      } else if ((m = l.match(/^(#{1,6})\s+(.*)/))) {
        const n = Math.min(3, m[1].length);
        o.push(`<h${n}>${inl(m[2])}</h${n}>`);
        i++;
      } else if (/^\s*(---+|\*\*\*+)\s*$/.test(l)) {
        o.push("<hr>");
        i++;
      } else if (/^>/.test(l)) {
        const c = [];
        while (i < L.length && /^>/.test(L[i]))
          c.push(L[i++].replace(/^>\s?/, ""));
        const e = c[0] && EMO.find((x) => c[0].startsWith(x));
        if (e) c[0] = c[0].slice(e.length).trim();
        o.push(
          `<div class="${e ? "nt-callout" : "nt-quote"}"${e ? ` data-ic="${e}"` : ""}>` +
            c
              .filter((x) => x.trim() || c.length === 1)
              .map((x) => "<p>" + inl(x) + "</p>")
              .join("") +
            "</div>",
        );
      } else if (LI.test(l)) {
        const [h, ni] = parseList(
          L,
          i,
          l.match(LI)[1].replace(/\t/g, "  ").length,
        );
        o.push(h);
        i = ni;
      } else if (!l.trim()) i++;
      else {
        const c = [L[i++]];
        while (i < L.length && L[i].trim() && !bl(L[i])) c.push(L[i++]);
        o.push("<p>" + c.map(inl).join("<br>") + "</p>");
      }
    }
    return o.join("");
  }
  const plainOf = (h) => {
    const d = new DOMParser().parseFromString(
      "<body>" + h + "</body>",
      "text/html",
    ).body;
    d.querySelectorAll("p,h1,h2,h3,li,pre,div,hr").forEach((e) =>
      e.append("\n"),
    );
    return d.textContent.replace(/\n{3,}/g, "\n\n").trim();
  };

  /* ---------- HTML -> Markdown (backup .md) ---------- */
  const hexOf = (c) => {
    const m = String(c).match(/^nt-(c|bg)-(\w+)$/);
    return m && m[2] !== "def"
      ? [m[1], m[1] === "c" ? (COL[m[2]] || [])[1] : BGC[m[2]]]
      : null;
  };
  function inMd(n, ctx) {
    let s = "";
    n.childNodes.forEach((c) => {
      if (c.nodeType === 3) {
        s += c.data;
        return;
      }
      if (c.nodeType !== 1) return;
      const t = c.tagName;
      if (t === "BR") {
        s += "  \n";
        return;
      }
      if (t === "IMG") {
        const id = c.dataset.img;
        s += `![${c.getAttribute("alt") || ""}](${id ? ctx.img(id) : c.getAttribute("src") || ""})`;
        return;
      }
      const x = inMd(c, ctx);
      if (!x) return;
      if (t === "B" || t === "STRONG") s += "**" + x + "**";
      else if (t === "I" || t === "EM") s += "*" + x + "*";
      else if (t === "S" || t === "STRIKE" || t === "DEL") s += "~~" + x + "~~";
      else if (t === "U") s += "<u>" + x + "</u>";
      else if (t === "CODE") s += "`" + x + "`";
      else if (t === "A")
        s += "[" + x + "](" + (c.getAttribute("href") || "") + ")";
      else if (t === "SPAN") {
        const h = hexOf(c.className);
        s +=
          h && h[1]
            ? `<span style="${h[0] === "c" ? "color" : "background-color"}:${h[1]}">${x}</span>`
            : x;
      } else s += x;
    });
    return s;
  }
  function listMd(el, ctx, ind) {
    const ord = el.tagName === "OL",
      todo = el.classList.contains("nt-todo");
    let n = 0,
      o = [];
    [...el.children].forEach((li) => {
      if (li.tagName !== "LI") return;
      n++;
      const own = document.createElement("div"),
        subs = [];
      [...li.childNodes].forEach((c) => {
        if (c.nodeType === 1 && (c.tagName === "UL" || c.tagName === "OL"))
          subs.push(c);
        else own.appendChild(c.cloneNode(true));
      });
      const mk = todo
        ? li.dataset.ck === "1"
          ? "- [x] "
          : "- [ ] "
        : ord
          ? n + ". "
          : "- ";
      o.push(" ".repeat(ind) + mk + inMd(own, ctx).trim());
      subs.forEach((sb) => o.push(listMd(sb, ctx, ind + (ord ? 3 : 2))));
    });
    return o.join("\n");
  }
  function blkMd(el, ctx) {
    const t = el.tagName;
    if (/^H[1-3]$/.test(t))
      return "#".repeat(+t[1]) + " " + inMd(el, ctx).trim();
    if (t === "UL" || t === "OL") return listMd(el, ctx, 0);
    if (t === "HR") return "---";
    if (el.classList.contains("nt-cb")) {
      const pre = el.querySelector("pre");
      return (
        "```" +
        (el.getAttribute("data-lang") || "") +
        "\n" +
        (pre ? pre.textContent : "") +
        "\n```"
      );
    }
    if (
      el.classList.contains("nt-quote") ||
      el.classList.contains("nt-callout")
    ) {
      const inner = [...el.children]
        .map((c) => blkMd(c, ctx))
        .filter((x) => x !== "");
      const body = (inner.length ? inner : [inMd(el, ctx).trim()]).join("\n\n");
      const pre = el.classList.contains("nt-callout")
        ? (el.dataset.ic || "💡") + " "
        : "";
      return (pre + body)
        .split("\n")
        .map((l) => "> " + l)
        .join("\n");
    }
    return inMd(el, ctx).trim();
  }
  function toMd(h, ctx) {
    const d = new DOMParser().parseFromString(
      "<body>" + (h || "") + "</body>",
      "text/html",
    ).body;
    return [...d.childNodes]
      .map((n) => {
        if (n.nodeType === 3) return n.data.trim();
        return n.nodeType === 1 ? blkMd(n, ctx) : "";
      })
      .filter((x) => x !== "")
      .join("\n\n");
  }
  const htmlOf = (it) => (it.h != null ? it.h : md(it.c || ""));

  /* ---------- ZIP (sem biblioteca) ---------- */
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (u) => {
    let c = -1;
    for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
  async function makeZip(files) {
    const enc = new TextEncoder(),
      parts = [],
      cen = [],
      d = new Date();
    let off = 0;
    const dt =
        (((d.getFullYear() - 1980) << 9) |
          ((d.getMonth() + 1) << 5) |
          d.getDate()) &
        0xffff,
      tmv =
        ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) &
        0xffff;
    for (const f of files) {
      const u =
          typeof f.data === "string"
            ? enc.encode(f.data)
            : f.data instanceof Blob
              ? new Uint8Array(await f.data.arrayBuffer())
              : f.data,
        nm = enc.encode(f.name),
        crc = crc32(u);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true);
      lh.setUint16(4, 20, true);
      lh.setUint16(6, 0x0800, true);
      lh.setUint16(10, tmv, true);
      lh.setUint16(12, dt, true);
      lh.setUint32(14, crc, true);
      lh.setUint32(18, u.length, true);
      lh.setUint32(22, u.length, true);
      lh.setUint16(26, nm.length, true);
      parts.push(lh.buffer, nm, u);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true);
      ch.setUint16(4, 20, true);
      ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true);
      ch.setUint16(12, tmv, true);
      ch.setUint16(14, dt, true);
      ch.setUint32(16, crc, true);
      ch.setUint32(20, u.length, true);
      ch.setUint32(24, u.length, true);
      ch.setUint16(28, nm.length, true);
      ch.setUint32(42, off, true);
      cen.push(ch.buffer, nm);
      off += 30 + nm.length + u.length;
    }
    const cs = cen.reduce((a, b) => a + b.byteLength, 0),
      end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, cs, true);
    end.setUint32(16, off, true);
    return new Blob([...parts, ...cen, end.buffer], {
      type: "application/zip",
    });
  }
  async function readZip(blob) {
    const buf = new Uint8Array(await blob.arrayBuffer()),
      dv = new DataView(buf.buffer),
      dec = new TextDecoder(),
      out = [];
    let e = buf.length - 22;
    while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error("zip inválido");
    const n = dv.getUint16(e + 10, true);
    let p = dv.getUint32(e + 16, true);
    for (let i = 0; i < n; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const meth = dv.getUint16(p + 10, true),
        csz = dv.getUint32(p + 20, true),
        nl = dv.getUint16(p + 28, true),
        el = dv.getUint16(p + 30, true),
        cl = dv.getUint16(p + 32, true),
        lo = dv.getUint32(p + 42, true),
        name = dec.decode(buf.subarray(p + 46, p + 46 + nl));
      p += 46 + nl + el + cl;
      if (name.endsWith("/")) continue;
      out.push({
        name,
        async data() {
          const s =
              lo +
              30 +
              dv.getUint16(lo + 26, true) +
              dv.getUint16(lo + 28, true),
            raw = buf.subarray(s, s + csz);
          if (meth === 0) return raw;
          if (meth === 8) {
            const ds = new Blob([raw])
              .stream()
              .pipeThrough(new DecompressionStream("deflate-raw"));
            return new Uint8Array(await new Response(ds).arrayBuffer());
          }
          throw new Error("compressão não suportada");
        },
      });
    }
    return out;
  }
  const MIME = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  const EXT = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const safe = (s) =>
    String(s || "")
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "sem título";
  const download = (blob, name) => {
    const a = document.createElement("a"),
      u = URL.createObjectURL(blob);
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  };
  const blobData = (b) =>
    new Promise((r) => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result);
      fr.readAsDataURL(b);
    });

  /* ---------- Backup de todas as notas (.zip) ---------- */
  async function backupAll() {
    flush();
    const items = N().items;
    if (!items.length) return toast("Ainda não há notas para baixar.");
    toast("Preparando o backup…");
    const files = [],
      imgs = new Map(),
      used = {};
    const folderPath = (it) => {
      const r = [];
      let p = it.p;
      while (p) {
        const x = get(p);
        if (!x) break;
        r.unshift(safe(x.t));
        p = x.p;
      }
      return r;
    };
    for (const it of items.filter((x) => x.k === "p")) {
      const fp = folderPath(it);
      let base = "notas/" + fp.concat(safe(it.t)).join("/"),
        name = base,
        n = 1;
      while (used[name.toLowerCase()]) name = base + " (" + ++n + ")";
      used[name.toLowerCase()] = 1;
      const rel = "../".repeat(fp.length);
      const body = toMd(htmlOf(it), {
        img: (id) => {
          imgs.set(id, 1);
          return rel + "_imagens/" + id + ".IMG";
        },
      });
      files.push({
        name: name + ".md",
        data: "# " + it.t + "\n\n" + body + "\n",
        imgs: [...new Set(body.match(/_imagens\/\w+\.IMG/g) || [])],
      });
    }
    const ext = {};
    for (const id of imgs.keys()) {
      try {
        const b = await idbGet(id);
        if (!b) continue;
        ext[id] = EXT[b.type] || "bin";
        files.push({ name: "notas/_imagens/" + id + "." + ext[id], data: b });
      } catch (e) {}
    }
    files.forEach((f) => {
      if (f.imgs)
        f.data = f.data.replace(
          /_imagens\/(\w+)\.IMG/g,
          (m, id) => "_imagens/" + id + "." + (ext[id] || "bin"),
        );
    });
    files.push({
      name: "notas.json",
      data: JSON.stringify({
        v: 2,
        exportado: new Date().toISOString(),
        items,
      }),
    });
    files.push({
      name: "LEIA-ME.txt",
      data: "Backup das notas do Corrente de Estudos.\r\n\r\n- Pasta notas/: uma pasta para cada pasta, um .md para cada página (abre em qualquer editor).\r\n- notas/_imagens/: imagens usadas nas páginas.\r\n- notas.json: cópia completa (cores, destaques etc.). Use 'Importar' na aba Notas para restaurar este .zip.\r\n",
    });
    files.forEach((f) => delete f.imgs);
    const z = await makeZip(files);
    download(z, "notas-corrente-" + fmt(new Date()) + ".zip");
    toast(
      `Backup baixado: ${items.filter((x) => x.k === "p").length} páginas.`,
    );
  }

  /* ---------- Importar (.md, .zip do app ou do Notion) ---------- */
  const noHash = (s) =>
    String(s)
      .replace(/\s[0-9a-f]{32}$/i, "")
      .trim();
  function ensureFolder(parent, name) {
    let f = N().items.find(
      (x) => x.k === "f" && (x.p || null) === (parent || null) && x.t === name,
    );
    if (!f) {
      f = {
        id: ID(),
        t: name,
        k: "f",
        p: parent || null,
        c: "",
        u: Date.now(),
        o: 0,
      };
      N().items.push(f);
    }
    return f.id;
  }
  function newPage(title, parent, html) {
    const it = {
      id: ID(),
      t: title.slice(0, 80) || "Sem título",
      k: "p",
      p: parent || null,
      h: html,
      c: plainOf(html),
      u: Date.now(),
      o: 0,
    };
    N().items.push(it);
    return it;
  }
  async function importZip(file, parent) {
    const es = await readZip(file),
      byName = new Map(es.map((e) => [e.name, e])),
      stat = { pages: 0, csv: 0 };
    const js = byName.get("notas.json");
    if (js) {
      let d;
      try {
        d = JSON.parse(new TextDecoder().decode(await js.data()));
      } catch (e) {}
      if (d && Array.isArray(d.items)) {
        if (
          !confirm(
            `Este .zip é um backup do app (${d.items.filter((x) => x.k === "p").length} páginas). Substituir TODAS as notas atuais por ele?`,
          )
        )
          return stat;
        for (const e of es) {
          const m = e.name.match(/^notas\/_imagens\/(\w+)\.\w+$/);
          if (m) {
            const u = await e.data(),
              ex = e.name.split(".").pop().toLowerCase();
            await idbPut(
              m[1],
              new Blob([u], { type: MIME[ex] || "application/octet-stream" }),
            );
          }
        }
        N().items = d.items;
        N().sel = null;
        stat.pages = d.items.filter((x) => x.k === "p").length;
        stat.restored = true;
        return stat;
      }
    }
    for (const e of es) {
      if (/\.zip$/i.test(e.name)) {
        const s = await importZip(new Blob([await e.data()]), parent);
        stat.pages += s.pages;
        stat.csv += s.csv;
        continue;
      }
      if (/\.csv$/i.test(e.name)) stat.csv++;
      if (!/\.(md|markdown)$/i.test(e.name) || /(^|\/)__MACOSX\//.test(e.name))
        continue;
      const parts = e.name.split("/").map(noHash),
        file = parts.pop().replace(/\.(md|markdown)$/i, ""),
        title = noHash(file);
      let p = parent;
      parts.forEach((seg) => {
        if (seg) p = ensureFolder(p, seg);
      });
      let text = new TextDecoder().decode(await e.data());
      const dir = e.name.split("/").slice(0, -1);
      const found = [];
      text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
        if (/^(https?:|data:)/i.test(src)) return m;
        let rel;
        try {
          rel = decodeURIComponent(src);
        } catch (x) {
          rel = src;
        }
        const segs = dir.slice();
        rel
          .split("/")
          .forEach((s) =>
            s === ".." ? segs.pop() : s !== "." && segs.push(s),
          );
        const hit = byName.get(segs.join("/"));
        if (!hit) return m;
        const id = ID();
        found.push([id, hit, rel]);
        return `![${alt}](img:${id})`;
      });
      for (const [id, hit, rel] of found) {
        const ex = rel.split(".").pop().toLowerCase();
        await idbPut(
          id,
          new Blob([await hit.data()], {
            type: MIME[ex] || "application/octet-stream",
          }),
        );
      }
      text = text.replace(/^#\s+.*\n+/, (h) =>
        noHash(h.replace(/^#\s+/, "").trim()) === title ? "" : h,
      );
      newPage(title, p, md(text));
      stat.pages++;
    }
    return stat;
  }
  async function importFiles(fs) {
    const s = get(N().sel),
      parent = s ? (s.k === "f" ? s.id : s.p || null) : null;
    let pages = 0,
      csv = 0,
      restored = false;
    flush();
    for (const f of fs) {
      try {
        if (/\.zip$/i.test(f.name)) {
          const r = await importZip(f, parent);
          pages += r.pages;
          csv += r.csv;
          restored = restored || r.restored;
        } else if (/\.(md|markdown|txt)$/i.test(f.name)) {
          let t = await f.text();
          const title = noHash(f.name.replace(/\.[^.]+$/, ""));
          t = t.replace(/^#\s+(.*)\n+/, (h, a) =>
            noHash(a.trim()) === title ? "" : h,
          );
          newPage(title, parent, md(t));
          pages++;
        }
      } catch (e) {
        console.error(e);
        toast("Não consegui importar “" + f.name + "”.");
      }
    }
    if (pages) {
      if (parent) get(parent).o = 1;
      save();
      curId = null;
      ed = null;
      drawAll();
    }
    toast(
      pages
        ? `${pages} ${pages === 1 ? "página importada" : "páginas importadas"}${csv ? ` (${csv} tabelas .csv ignoradas)` : ""}.`
        : "Nada para importar (use .md ou .zip).",
    );
  }

  /* ---------- Editor ---------- */
  const BLOCK = (n) =>
    n.nodeType === 1 &&
    (/^(P|H1|H2|H3|UL|OL|HR|PRE)$/.test(n.tagName) ||
      /\b(nt-cb|nt-callout|nt-quote)\b/.test(n.className) ||
      n.tagName === "DIV");
  const topBlk = () => {
    const s = getSelection();
    if (!ed || !s.rangeCount) return null;
    let n = s.anchorNode;
    if (!n || n === ed || !ed.contains(n)) return null;
    while (n && n.parentNode !== ed) n = n.parentNode;
    return n && n.nodeType === 1 ? n : null;
  };
  const innerBlk = () => {
    const s = getSelection();
    if (!ed || !s.rangeCount) return null;
    let n = s.anchorNode;
    if (!n || !ed.contains(n)) return null;
    if (n.nodeType === 3) n = n.parentNode;
    while (n && n !== ed) {
      if (/^(P|H1|H2|H3|LI)$/.test(n.tagName)) return n;
      if (
        n.tagName === "DIV" &&
        !/\b(nt-cb|nt-callout|nt-quote)\b/.test(n.className)
      )
        return n;
      n = n.parentNode;
    }
    return null;
  };
  const isEmpty = (b) =>
    !b.textContent.replace(/\u200b/g, "").trim() && !b.querySelector("img,hr");
  const hasSel = () => {
    const s = getSelection();
    return !!(ed && s.rangeCount && ed.contains(s.anchorNode));
  };
  function place(node, end) {
    const r = document.createRange(),
      s = getSelection();
    r.selectNodeContents(node);
    r.collapse(!end);
    s.removeAllRanges();
    s.addRange(r);
  }
  function ensureSel() {
    if (!ed) return;
    if (!hasSel()) {
      if (lastRange && ed.contains(lastRange.commonAncestorContainer)) {
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(lastRange);
      } else {
        ed.focus();
        place(ed.lastElementChild || ed, true);
      }
    }
  }
  function caretOff() {
    const s = getSelection();
    if (!ed || !s.rangeCount || !ed.contains(s.anchorNode)) return null;
    const r = document.createRange();
    r.selectNodeContents(ed);
    r.setEnd(s.anchorNode, s.anchorOffset);
    return r.toString().length;
  }
  function setCaret(off) {
    if (off == null) return;
    const tw = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
    let n,
      acc = 0;
    while ((n = tw.nextNode())) {
      if (acc + n.length >= off) {
        const r = document.createRange(),
          s = getSelection();
        r.setStart(n, off - acc);
        r.collapse(true);
        s.removeAllRanges();
        s.addRange(r);
        return;
      }
      acc += n.length;
    }
  }
  function tidy(c) {
    c.querySelectorAll("[style]").forEach((e) => e.removeAttribute("style"));
    c.querySelectorAll("font").forEach(unwrap);
    c.querySelectorAll("span[class*='-def']").forEach((sp) => {
      const k = sp.className.includes("nt-bg-") ? "nt-bg-" : "nt-c-";
      const a =
        sp.parentElement &&
        sp.parentElement.closest(`span[class*='${k}']:not([class*='-def'])`);
      if (!a) unwrap(sp);
    });
    c.querySelectorAll("span:not([class])").forEach(unwrap);
    c.querySelectorAll("span:empty").forEach((x) => x.remove());
  }
  function serialize() {
    const texts = [...ed.querySelectorAll(".nt-cb pre")].map(preText),
      c = ed.cloneNode(true);
    c.querySelectorAll(".nt-cb").forEach((cb, i) => {
      const lang = cb.getAttribute("data-lang") || "";
      cb.removeAttribute("contenteditable");
      cb.innerHTML = "";
      const pre = document.createElement("pre");
      pre.textContent = texts[i] || "";
      cb.appendChild(pre);
      cb.setAttribute("data-lang", lang);
    });
    c.querySelectorAll("img[data-img]").forEach((im) => {
      im.removeAttribute("src");
      im.classList.remove("nt-miss");
    });
    c.querySelectorAll("[contenteditable],[spellcheck],[id]").forEach((x) => {
      x.removeAttribute("contenteditable");
      x.removeAttribute("spellcheck");
      x.removeAttribute("id");
    });
    c.removeAttribute("class");
    tidy(c);
    const h = c.innerHTML;
    c.querySelectorAll("p,h1,h2,h3,li,pre,div,hr").forEach((e) =>
      e.append("\n"),
    );
    return { h, t: c.textContent.replace(/\n{3,}/g, "\n\n").trim() };
  }
  function readEditor() {
    const it = get(curId);
    if (!ed || !it || it.k !== "p" || !document.body.contains(ed)) return;
    const { h, t } = serialize();
    if (h !== (it.h || "")) {
      it.h = h;
      it.c = t;
      it.u = Date.now();
    }
  }
  function flush() {
    clearTimeout(tm);
    tm = null;
    readEditor();
    save();
  }
  function later() {
    clearTimeout(tm);
    tm = setTimeout(flush, 500);
  }
  /* histórico próprio (desfazer/refazer também para cores, blocos etc.) */
  function snap() {
    if (!ed) return;
    const h = serialize().h;
    if (hist[hi] && hist[hi].h === h) return;
    hist = hist.slice(0, hi + 1);
    hist.push({ h, o: caretOff() });
    if (hist.length > 150) hist.shift();
    hi = hist.length - 1;
  }
  function restoreSnap(s) {
    ed.innerHTML = s.h || "<p><br></p>";
    decorate();
    ed.focus();
    setCaret(s.o);
    blank();
    later();
    info();
  }
  function undo() {
    snap();
    if (hi > 0) {
      hi--;
      restoreSnap(hist[hi]);
    }
  }
  function redo() {
    if (hi < hist.length - 1) {
      hi++;
      restoreSnap(hist[hi]);
    }
  }
  function blank() {
    if (ed)
      ed.classList.toggle(
        "nt-blank",
        ed.children.length === 1 &&
          ed.firstElementChild.tagName === "P" &&
          isEmpty(ed.firstElementChild),
      );
  }
  function info() {
    const it = get(curId),
      el = $("#nt-info");
    if (!it || it.k !== "p" || !el || !ed) return;
    const c = (ed.innerText || "").trim(),
      w = (c.match(/\S+/g) || []).length;
    el.textContent = `${w} ${w === 1 ? "palavra" : "palavras"} · ${c.length} caracteres · ~${Math.max(1, Math.ceil(w / 200))} min de leitura · editado ${new Date(it.u || Date.now()).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`;
  }
  function touch() {
    const it = get(curId);
    if (it) it.u = Date.now();
    blank();
    later();
    clearTimeout(hTm);
    hTm = setTimeout(() => {
      snap();
      info();
    }, 400);
  }
  function fixTop() {
    if (!ed) return;
    const sel = getSelection(),
      an =
        sel.rangeCount && ed.contains(sel.anchorNode) ? sel.anchorNode : null,
      ao = sel.anchorOffset;
    let moved = false;
    ed.querySelectorAll(
      "p > ul, p > ol, p > div, p > p, p > hr, p > h1, p > h2, p > h3",
    ).forEach((n) => {
      const par = n.parentNode;
      if (par && par.tagName === "P" && par !== ed) {
        unwrap(par);
        moved = true;
      }
    });
    ed.querySelectorAll("li > p:only-child").forEach((n) => {
      unwrap(n);
      moved = true;
    });
    const bad = [...ed.childNodes].some((n) =>
      n.nodeType === 3 ? n.data.trim() : n.nodeType === 1 && !BLOCK(n),
    );
    if (bad || !ed.firstChild) {
      if (!ed.firstChild) ed.innerHTML = "<p><br></p>";
      let run = null;
      [...ed.childNodes].forEach((n) => {
        const inline =
          n.nodeType === 3
            ? !!n.data.trim() || !!run
            : n.nodeType === 1 && !BLOCK(n);
        if (inline) {
          if (!run) {
            run = document.createElement("p");
            n.before(run);
          }
          run.appendChild(n);
        } else {
          if (n.nodeType === 3) n.remove();
          run = null;
        }
      });
      moved = true;
    }
    if (moved && an && ed.contains(an)) {
      try {
        sel.collapse(
          an,
          Math.min(ao, an.nodeType === 3 ? an.length : an.childNodes.length),
        );
      } catch (e) {}
    }
  }
  function ensureTail() {
    const l = ed.lastElementChild;
    if (!l || l.tagName === "HR" || l.classList.contains("nt-cb")) {
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      ed.appendChild(p);
    }
  }
  function decorate() {
    if (!ed) return;
    ed.querySelectorAll(".nt-cb").forEach((cb) => {
      const pre = cb.querySelector("pre");
      cb.replaceWith(
        mkCb(cb.getAttribute("data-lang") || "", pre ? preText(pre) : ""),
      );
    });
    ed.querySelectorAll("ul.nt-todo > li").forEach(
      (li) => li.hasAttribute("data-ck") || li.setAttribute("data-ck", "0"),
    );
    ed.querySelectorAll("a").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener";
    });
    hydrate();
    fixTop();
    ensureTail();
    blank();
  }
  function mount(it) {
    curId = it.id;
    ed = $("#nt-ed");
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch (e) {}
    if (it.h == null) {
      it.h = md(it.c || "");
      if (it.c) it.c = plainOf(it.h);
    }
    ed.innerHTML = it.h || "<p><br></p>";
    decorate();
    hist = [{ h: serialize().h, o: null }];
    hi = 0;
    info();
  }

  /* pintar texto (cor / marca-texto) por classe */
  function paint(kind, name) {
    const s = getSelection();
    if (!hasSel() && lastRange) {
      s.removeAllRanges();
      s.addRange(lastRange);
    }
    if (
      !s.rangeCount ||
      s.isCollapsed ||
      !ed.contains(s.getRangeAt(0).commonAncestorContainer)
    ) {
      toast("Selecione o texto primeiro.");
      return;
    }
    snap();
    const r = s.getRangeAt(0),
      root =
        r.commonAncestorContainer.nodeType === 3
          ? r.commonAncestorContainer.parentNode
          : r.commonAncestorContainer,
      tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT),
      list = [];
    let n;
    while ((n = tw.nextNode())) {
      if (!r.intersectsNode(n) || n.parentNode.closest(".nt-cb")) continue;
      const a = n === r.startContainer ? r.startOffset : 0,
        b = n === r.endContainer ? r.endOffset : n.length;
      if (b > a) list.push([n, a, b]);
    }
    const cls = `nt-${kind}-${name || "def"}`,
      made = [];
    list.forEach(([t, a, b]) => {
      if (b < t.length) t.splitText(b);
      if (a > 0) t = t.splitText(a);
      const p = t.parentNode;
      let tgt = null;
      for (
        let e = p;
        e && e.tagName === "SPAN" && e.childNodes.length === 1;
        e = e.parentNode
      )
        if (e.className.startsWith(`nt-${kind}-`)) {
          tgt = e;
          break;
        }
      if (tgt) {
        tgt.className = cls;
        made.push(tgt);
      } else {
        const sp = document.createElement("span");
        sp.className = cls;
        p.insertBefore(sp, t);
        sp.appendChild(t);
        made.push(sp);
      }
    });
    if (made.length) {
      const nr = document.createRange();
      nr.setStartBefore(made[0]);
      nr.setEndAfter(made[made.length - 1]);
      s.removeAllRanges();
      s.addRange(nr);
    }
    touch();
  }

  /* ações de formatação (barra, menu "/" e atalhos) */
  function box(cls) {
    const b = innerBlk();
    if (!b || b.tagName === "LI") return;
    const ex = b.closest(".nt-callout,.nt-quote");
    if (ex) {
      if (ex.classList.contains(cls)) unwrap(ex);
      else {
        ex.className = cls;
        cls === "nt-callout"
          ? (ex.dataset.ic = "💡")
          : ex.removeAttribute("data-ic");
      }
      place(b, true);
      return;
    }
    const w = document.createElement("div");
    w.className = cls;
    if (cls === "nt-callout") w.dataset.ic = "💡";
    b.replaceWith(w);
    w.appendChild(b);
    place(b, true);
  }
  function focusPre(cb) {
    const pre = cb.querySelector("pre");
    pre.focus();
    place(pre, true);
  }
  function insCode(lang, text) {
    let b = topBlk();
    const cb = mkCb(lang || "", text || "");
    if (b && b.tagName === "P" && isEmpty(b)) b.replaceWith(cb);
    else if (b) b.after(cb);
    else ed.appendChild(cb);
    ensureTail();
    focusPre(cb);
  }
  function insHr() {
    const b = topBlk(),
      hr = document.createElement("hr");
    if (b && b.tagName === "P" && isEmpty(b)) b.replaceWith(hr);
    else if (b) b.after(hr);
    else ed.appendChild(hr);
    ensureTail();
    place(hr.nextElementSibling, false);
  }
  function act(f) {
    if (!ed) return;
    ensureSel();
    snap();
    const b = innerBlk(),
      inLi = b && b.tagName === "LI";
    if (f === "p" || /^h[1-3]$/.test(f)) {
      if (inLi) return toast("Saia da lista para mudar o tipo do texto.");
      const tag = f.toUpperCase();
      exec(
        "formatBlock",
        "<" + (b && b.tagName === tag && f !== "p" ? "P" : tag) + ">",
      );
    } else if (f === "b") exec("bold");
    else if (f === "i") exec("italic");
    else if (f === "u") exec("underline");
    else if (f === "s") exec("strikeThrough");
    else if (f === "ic") {
      const s = getSelection(),
        cd =
          s.anchorNode &&
          (s.anchorNode.nodeType === 3
            ? s.anchorNode.parentNode
            : s.anchorNode
          ).closest("code");
      if (cd) unwrap(cd);
      else {
        const t = s.toString();
        exec("insertHTML", "<code>" + esc(t || "código") + "</code>&#8203;");
      }
    } else if (f === "link") {
      const s = getSelection();
      const r = s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
      const u = prompt("Endereço do link (https://…):", "https://");
      if (!u || u === "https://") return;
      if (r) {
        s.removeAllRanges();
        s.addRange(r);
      }
      if (s.isCollapsed)
        exec(
          "insertHTML",
          `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`,
        );
      else exec("createLink", u);
      ed.querySelectorAll("a").forEach((a) => {
        a.target = "_blank";
        a.rel = "noopener";
      });
    } else if (f === "ul" || f === "ol" || f === "ck") {
      const todo = f === "ck",
        tag = f === "ol" ? "ol" : "ul",
        clr = (l) => {
          l.classList.remove("nt-todo");
          l.querySelectorAll(":scope > li").forEach((x) =>
            x.removeAttribute("data-ck"),
          );
        },
        mk = (l) => {
          l.classList.add("nt-todo");
          l.querySelectorAll(":scope > li").forEach(
            (x) => x.hasAttribute("data-ck") || x.setAttribute("data-ck", "0"),
          );
        };
      if (inLi) {
        const list = b.parentNode,
          isTodo = list.classList.contains("nt-todo");
        if (todo) {
          if (isTodo) clr(list);
          else {
            if (list.tagName === "OL") exec("insertUnorderedList");
            const l2 = innerBlk(),
              ul = l2 && l2.closest("ul");
            if (ul) mk(ul);
          }
        } else if (isTodo) {
          clr(list);
          if (f === "ol") exec("insertOrderedList");
        } else exec(f === "ul" ? "insertUnorderedList" : "insertOrderedList");
      } else if (b) {
        const l = document.createElement(tag),
          li = document.createElement("li");
        if (todo) {
          l.className = "nt-todo";
          li.setAttribute("data-ck", "0");
        }
        while (b.firstChild) li.appendChild(b.firstChild);
        if (isEmpty(li)) li.innerHTML = "<br>";
        l.appendChild(li);
        b.replaceWith(l);
        place(li, true);
      } else exec(f === "ol" ? "insertOrderedList" : "insertUnorderedList");
    } else if (f === "q") box("nt-quote");
    else if (f === "callout") box("nt-callout");
    else if (f === "code") {
      const s = getSelection(),
        t = s.isCollapsed ? "" : s.toString();
      if (t) exec("delete");
      insCode("", t);
    } else if (f === "hr") insHr();
    else if (f === "img") {
      const fl = $("#nt-file");
      if (fl) fl.click();
      return;
    } else if (f === "clear") {
      exec("removeFormat");
      paint("c", null);
      paint("bg", null);
    } else if (f === "undo") return undo();
    else if (f === "redo") return redo();
    fixTop();
    ensureTail();
    touch();
  }

  /* menu "/" */
  const CMDS = [
    ["Texto", "p", "Parágrafo comum", "texto paragrafo"],
    ["Título 1", "h1", "Título grande", "titulo h1 heading"],
    ["Título 2", "h2", "Título médio", "titulo h2"],
    ["Título 3", "h3", "Título pequeno", "titulo h3"],
    ["Lista", "ul", "Lista com marcadores", "lista bullet"],
    ["Lista numerada", "ol", "1, 2, 3…", "lista numerada"],
    ["Tarefa", "ck", "Caixinha de marcar", "tarefa checklist todo"],
    ["Citação", "q", "Texto de citação", "citacao quote"],
    [
      "Destaque",
      "callout",
      "Caixa colorida com emoji",
      "destaque callout aviso",
    ],
    ["Código", "code", "Bloco de código colorido", "codigo code programacao"],
    ["Divisor", "hr", "Linha separadora", "divisor linha hr"],
    ["Imagem", "img", "Enviar uma imagem", "imagem foto img"],
  ];
  const norm = (s) =>
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function slashClose() {
    slash = null;
    const m = $("#nt-slash");
    if (m) m.remove();
  }
  function slashDraw() {
    let m = $("#nt-slash");
    if (!m) {
      m = document.createElement("div");
      m.id = "nt-slash";
      document.body.appendChild(m);
    }
    m.innerHTML =
      slash.list
        .map(
          (c, i) =>
            `<div class="nt-si${i === slash.i ? " on" : ""}" data-nt="sl" data-i="${i}"><b>${c[0]}</b><span>${c[2]}</span></div>`,
        )
        .join("") || '<div class="nt-si"><span>Nada encontrado</span></div>';
    const r = slash.rect();
    m.style.left = Math.max(8, Math.min(r.left, innerWidth - 270)) + "px";
    m.style.top = Math.min(r.bottom + 6, innerHeight - 280) + "px";
    const on = m.querySelector(".on");
    if (on) on.scrollIntoView({ block: "nearest" });
  }
  function slashCheck() {
    const s = getSelection();
    if (!s.rangeCount || !s.isCollapsed) return slashClose();
    const n = s.anchorNode;
    if (
      !n ||
      n.nodeType !== 3 ||
      !ed.contains(n) ||
      n.parentNode.closest(".nt-cb")
    )
      return slashClose();
    const t = n.data.slice(0, s.anchorOffset),
      m = t.match(/(?:^|\s)\/([\wÀ-ÿ]{0,14})$/);
    if (!m) return slashClose();
    const qq = norm(m[1]),
      list = CMDS.filter((c) => !qq || norm(c[0] + " " + c[3]).includes(qq));
    if (!list.length && qq.length > 3) return slashClose();
    slash = {
      node: n,
      start: s.anchorOffset - m[1].length - 1,
      end: s.anchorOffset,
      list,
      i: 0,
      rect: () => {
        const r = s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
        let b = r && r.getBoundingClientRect();
        if (!b || (!b.width && !b.height && !b.top))
          b = (n.parentNode.getBoundingClientRect &&
            n.parentNode.getBoundingClientRect()) || { left: 20, bottom: 100 };
        return b;
      },
    };
    slashDraw();
  }
  function slashPick(i) {
    if (!slash || !slash.list[i]) return;
    const { node, start, end } = slash,
      f = slash.list[i][1];
    slashClose();
    snap();
    const r = document.createRange();
    r.setStart(node, start);
    r.setEnd(node, end);
    r.deleteContents();
    place(node.parentNode, true);
    r.collapse(true);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    act(f);
  }

  /* atalhos tipo Markdown ao digitar */
  const SHORT = {
    "#": "h1",
    "##": "h2",
    "###": "h3",
    "-": "ul",
    "*": "ul",
    "1.": "ol",
    "[]": "ck",
    "[ ]": "ck",
    ">": "q",
    "!": "callout",
  };
  function before(b) {
    const s = getSelection();
    if (!s.rangeCount) return "";
    const r = document.createRange();
    r.selectNodeContents(b);
    r.setEnd(s.anchorNode, s.anchorOffset);
    return r.toString();
  }
  function onKey(e) {
    const t = e.target;
    if (!t.closest || !t.closest("#nt-ed")) return false;
    const inPre = !!t.closest("pre.nt-code");
    if (slash) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const L = slash.list.length || 1;
        slash.i = (slash.i + (e.key === "ArrowDown" ? 1 : L - 1)) % L;
        slashDraw();
        return true;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (slash.list.length) {
          e.preventDefault();
          slashPick(slash.i);
          return true;
        }
      }
      if (e.key === "Escape") {
        slashClose();
        return true;
      }
    }
    const mod = e.ctrlKey || e.metaKey,
      k = e.key.toLowerCase();
    if (mod && k === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return true;
    }
    if (mod && k === "y") {
      e.preventDefault();
      redo();
      return true;
    }
    if (mod && k === "s") {
      e.preventDefault();
      flush();
      toast("Nota salva.");
      return true;
    }
    if (inPre) {
      if (e.key === "Tab") {
        e.preventDefault();
        exec("insertText", "  ");
      } else if (e.key === "Backspace" && !preText(t.closest("pre"))) {
        e.preventDefault();
        const cb = t.closest(".nt-cb"),
          p = document.createElement("p");
        p.innerHTML = "<br>";
        cb.replaceWith(p);
        ensureTail();
        place(p, false);
        touch();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        const pre = t.closest("pre"),
          s = getSelection();
        if (s.isCollapsed && s.anchorNode && pre.contains(s.anchorNode)) {
          const r = document.createRange();
          r.selectNodeContents(pre);
          r.setStart(s.anchorNode, s.anchorOffset);
          if (!r.toString().replace(/\n$/, "").length) {
            const nx = pre.closest(".nt-cb").nextElementSibling;
            if (nx) {
              e.preventDefault();
              place(nx, false);
            }
          }
        }
      }
      return true;
    }
    if (mod && k === "k") {
      e.preventDefault();
      act("link");
      return true;
    }
    if (mod && k === "e") {
      e.preventDefault();
      act("ic");
      return true;
    }
    if (e.key === "Tab") {
      const b = innerBlk();
      e.preventDefault();
      if (b && b.tagName === "LI") exec(e.shiftKey ? "outdent" : "indent");
      else if (!e.shiftKey) exec("insertText", "  ");
      touch();
      return true;
    }
    const b = innerBlk();
    if (
      e.key === " " &&
      b &&
      (b.tagName === "P" || b.tagName === "DIV") &&
      !b.closest(".nt-callout,.nt-quote")
    ) {
      const tx = before(b);
      if (SHORT[tx] && b.textContent.trim() === tx) {
        e.preventDefault();
        snap();
        b.innerHTML = "<br>";
        place(b, false);
        act(SHORT[tx]);
        return true;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && b) {
      const tx = before(b),
        full = b.textContent.trim();
      let m;
      if (
        b.tagName === "P" &&
        (m = full.match(/^```\s*([\w+#-]*)$/)) &&
        tx === b.textContent
      ) {
        e.preventDefault();
        snap();
        const cb = mkCb(m[1].toLowerCase(), "");
        b.replaceWith(cb);
        ensureTail();
        focusPre(cb);
        touch();
        return true;
      }
      if (
        b.tagName === "P" &&
        /^(---|\*\*\*)$/.test(full) &&
        tx === b.textContent
      ) {
        e.preventDefault();
        snap();
        b.innerHTML = "<br>";
        place(b, false);
        insHr();
        touch();
        return true;
      }
      const bx = b.closest(".nt-callout,.nt-quote");
      if (bx && isEmpty(b) && b.parentNode === bx) {
        e.preventDefault();
        snap();
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        bx.after(p);
        if (bx.children.length > 1) b.remove();
        else bx.remove();
        place(p, false);
        touch();
        return true;
      }
      if (b.tagName === "LI") {
        setTimeout(() => {
          const li = innerBlk();
          if (
            li &&
            li.tagName === "LI" &&
            li.parentNode.classList.contains("nt-todo")
          )
            li.setAttribute("data-ck", "0");
        }, 0);
      }
    }
    if (
      e.key === "Backspace" &&
      b &&
      b.parentNode &&
      /\b(nt-callout|nt-quote)\b/.test(b.parentNode.className) &&
      b.parentNode.children.length === 1 &&
      isEmpty(b)
    ) {
      e.preventDefault();
      snap();
      b.parentNode.replaceWith(b);
      place(b, false);
      touch();
      return true;
    }
    return false;
  }

  /* ---------- Árvore e telas ---------- */
  const row = (x) =>
    `<div class="nt-r${x.id === N().sel ? " on" : ""}" data-nt="sel" data-id="${x.id}">${x.k === "f" ? "📁" : "📄"} <span class="nt-tt">${esc(x.t)}</span></div>`;
  function treeH(p, d) {
    return kids(p)
      .map((x) => {
        const on = x.id === N().sel ? " on" : "",
          pad = `style="padding-left:${8 + d * 14}px"`,
          st = x.s ? " ⭐" : "";
        if (x.k === "f")
          return (
            `<div class="nt-r${on}" ${pad} data-nt="sel" data-id="${x.id}"><span class="nt-ar" data-nt="tg" data-id="${x.id}">${x.o ? "▾" : "▸"}</span>${x.o ? "📂" : "📁"} <span class="nt-tt">${esc(x.t)}${st}</span></div>` +
            (x.o ? treeH(x.id, d + 1) : "")
          );
        return `<div class="nt-r${on}" ${pad} data-nt="sel" data-id="${x.id}"><span class="nt-ar"></span>📄 <span class="nt-tt">${esc(x.t)}${st}</span></div>`;
      })
      .join("");
  }
  function drawTree() {
    const el = $("#nt-tree");
    if (!el) return;
    if (q) {
      const s = q.toLowerCase(),
        r = N().items.filter(
          (x) =>
            String(x.t).toLowerCase().includes(s) ||
            (x.k === "p" && String(x.c).toLowerCase().includes(s)),
        );
      el.innerHTML =
        r.map(row).join("") || '<p class="sub">Nada encontrado.</p>';
      return;
    }
    const pins = N()
      .items.filter((x) => x.s)
      .sort((a, b) => String(a.t).localeCompare(String(b.t), "pt"));
    el.innerHTML =
      (pins.length
        ? '<div class="nt-pin">⭐ Fixadas</div>' +
          pins.map(row).join("") +
          '<div class="nt-pin">Todas</div>'
        : "") +
      (treeH(null, 0) ||
        '<p class="sub">Nenhuma nota ainda. Crie uma pasta ou página acima.</p>');
  }
  const TB = [
    ["h1", "H1", "Título 1"],
    ["h2", "H2", "Título 2"],
    ["h3", "H3", "Título 3"],
    "|",
    ["b", "<b>B</b>", "Negrito (Ctrl+B)"],
    ["i", "<i>I</i>", "Itálico (Ctrl+I)"],
    ["u", "<u>U</u>", "Sublinhado (Ctrl+U)"],
    ["s", "<s>S</s>", "Riscado"],
    ["ic", "&lt;/&gt;", "Código no meio do texto (Ctrl+E)"],
    "|",
    ["pal:c", '<span class="nt-pa">A</span>', "Cor do texto"],
    ["pal:bg", '<span class="nt-pb">A</span>', "Marca-texto (cor de fundo)"],
    "|",
    ["ul", "• Lista", "Lista"],
    ["ol", "1. Lista", "Lista numerada"],
    ["ck", "☑ Tarefa", "Tarefa"],
    ["q", "❝", "Citação"],
    ["callout", "💡", "Destaque (callout)"],
    ["code", "{ }", "Bloco de código"],
    ["hr", "—", "Divisor"],
    ["link", "🔗", "Link (Ctrl+K)"],
    ["img", "🖼", "Imagem"],
    "|",
    ["undo", "↶", "Desfazer (Ctrl+Z)"],
    ["redo", "↷", "Refazer"],
    ["clear", "Tx", "Limpar cores e formatação"],
  ];
  function drawMain() {
    const el = $("#nt-main");
    if (!el) return;
    flush();
    ed = null;
    curId = null;
    const it = get(N().sel);
    if (!it) {
      el.innerHTML =
        '<button class="btn nt-menu" data-nt="menu">☰ Pastas</button><div class="nt-empty">Escolha uma nota na lateral ou crie uma nova.</div>';
      return;
    }
    const hd = `<div class="nt-hd"><button class="btn nt-menu" data-nt="menu">☰ Pastas</button><input id="nt-t" class="nt-title" value="${esc(it.t)}" maxlength="80" aria-label="Título"><button class="btn" data-nt="pin" aria-label="Fixar">${it.s ? "⭐" : "☆"}</button>${it.k === "p" ? '<button class="btn" data-nt="exp" title="Baixar esta página como .md">⬇ .md</button>' : ""}<button class="btn" data-nt="mv">Mover</button><button class="btn" data-nt="del" aria-label="Apagar">🗑</button></div>${path(it) ? `<p class="sub" style="margin:0 0 10px">${esc(path(it))}</p>` : ""}`;
    if (it.k === "f") {
      const k = kids(it.id);
      el.innerHTML =
        hd +
        `<div class="nt-bar" style="margin-bottom:10px"><button class="btn" data-nt="addf">📁 Subpasta</button><button class="btn main" data-nt="addp">📄 Página aqui</button></div>` +
        (k.map(row).join("") || '<p class="sub">Pasta vazia.</p>');
      return;
    }
    const tb = TB.map((x) =>
      x === "|"
        ? '<span class="nt-sep"></span>'
        : x[0].startsWith("pal:")
          ? `<button type="button" class="btn" data-nt="pal" data-k="${x[0].slice(4)}" title="${x[2]}">${x[1]}</button>`
          : `<button type="button" class="btn" data-nt="fmt" data-f="${x[0]}" title="${x[2]}">${x[1]}</button>`,
    ).join("");
    el.innerHTML =
      hd +
      `<div class="nt-tb" id="nt-tb">${tb}</div><div id="nt-ed" class="nt-ed" contenteditable="true" spellcheck="true"></div><div class="nt-info" id="nt-info"></div>`;
    mount(it);
  }
  function drawAll() {
    drawTree();
    drawMain();
  }
  function shell() {
    const r = $("#nt-root");
    if (!r || r.firstChild) return;
    r.innerHTML = `<div class="nt${N().sel ? "" : " op"}" id="nt"><aside class="nt-side"><div class="nt-bar"><button class="btn" data-nt="addf">📁 Pasta</button><button class="btn main" data-nt="addp">📄 Página</button></div><input id="nt-q" type="search" placeholder="Buscar…" aria-label="Buscar nas notas"><div id="nt-tree"></div><div class="nt-bar nt-bk"><button class="btn" data-nt="bk" title="Baixa todas as notas em .zip (um .md por página + imagens)">⬇ Backup de tudo</button><button class="btn" data-nt="imp" title="Importar .md ou .zip (inclui export do Notion)">⬆ Importar</button></div></aside><div class="nt-main" id="nt-main"></div></div><dialog id="nt-dlg"><div class="dl" id="nt-db"></div></dialog><input type="file" id="nt-file" accept="image/*" multiple hidden><input type="file" id="nt-imp" accept=".md,.markdown,.txt,.zip" multiple hidden>`;
  }

  /* ---------- Ações ---------- */
  function select(id) {
    const it = get(id);
    if (!it) return;
    flush();
    N().sel = id;
    if (it.k === "p") {
      const n = $("#nt");
      n && n.classList.remove("op");
    } else it.o = it.o ? 0 : 1;
    save();
    drawAll();
  }
  function add(k) {
    flush();
    const s = get(N().sel),
      p = s ? (s.k === "f" ? s.id : s.p || null) : null;
    if (p) get(p).o = 1;
    q = "";
    const qi = $("#nt-q");
    if (qi) qi.value = "";
    const it = {
      id: ID(),
      t: k === "f" ? "Nova pasta" : "Nova página",
      k,
      p,
      c: "",
      h: "",
      u: Date.now(),
      o: 0,
    };
    N().items.push(it);
    N().sel = it.id;
    const n = $("#nt");
    if (n && k === "p") n.classList.remove("op");
    save();
    drawAll();
    const t = $("#nt-t");
    if (t) {
      t.focus();
      t.select();
    }
  }
  function del() {
    const it = get(N().sel);
    if (!it) return;
    const ds = desc(it.id);
    if (
      !confirm(
        `Apagar “${it.t}”${ds.length ? ` e tudo dentro (${ds.length} ${ds.length === 1 ? "item" : "itens"})` : ""}? Não dá para desfazer.`,
      )
    )
      return;
    const rm = new Set([it.id, ...ds]);
    curId = null;
    ed = null;
    N()
      .items.filter((x) => rm.has(x.id))
      .forEach((x) =>
        refsOf(x).forEach((r) => {
          idbDel(r).catch(() => {});
          delete U[r];
        }),
      );
    N().items = N().items.filter((x) => !rm.has(x.id));
    N().sel = it.p && get(it.p) ? it.p : null;
    save();
    drawAll();
  }
  function openMv() {
    const it = get(N().sel);
    if (!it) return;
    const ex = new Set([it.id, ...desc(it.id)]),
      o = [];
    const w = (p, d) =>
      kids(p).forEach((x) => {
        if (x.k === "f" && !ex.has(x.id)) {
          o.push(
            `<option value="${x.id}"${(it.p || null) === x.id ? " selected" : ""}>${"\u00A0\u00A0".repeat(d)}📁 ${esc(x.t)}</option>`,
          );
          w(x.id, d + 1);
        }
      });
    w(null, 0);
    $("#nt-db").innerHTML =
      `<h2 style="margin-top:0">Mover “${esc(it.t)}”</h2><select id="nt-mvs" style="width:100%;padding:10px;border-radius:10px;background:var(--bg);color:var(--ink);border:1px solid var(--line)"><option value="">📚 Raiz</option>${o.join("")}</select><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn" data-nt="mvx">Cancelar</button><button class="btn main" data-nt="mvok">Mover</button></div>`;
    $("#nt-dlg").showModal();
  }
  async function exportMd() {
    flush();
    const it = get(N().sel);
    if (!it || it.k !== "p") return;
    const imgs = {};
    const body = toMd(htmlOf(it), { img: (id) => "\u0001" + id + "\u0001" });
    for (const id of new Set(
      [...body.matchAll(/\u0001(\w+)\u0001/g)].map((m) => m[1]),
    ))
      try {
        const b = await idbGet(id);
        if (b) imgs[id] = await blobData(b);
      } catch (e) {}
    const t = body.replace(/\u0001(\w+)\u0001/g, (m, id) => imgs[id] || "");
    download(
      new Blob(["# " + it.t + "\n\n" + t + "\n"], { type: "text/markdown" }),
      safe(it.t) + ".md",
    );
  }
  function openPal(k, btn) {
    let pop = $("#nt-pop");
    if (pop) {
      const same = pop.dataset.k === k;
      pop.remove();
      if (same) return;
    }
    pop = document.createElement("div");
    pop.id = "nt-pop";
    pop.dataset.k = k;
    const names = Object.keys(COL);
    pop.innerHTML =
      `<div class="nt-pt">${k === "c" ? "Cor do texto" : "Marca-texto"}</div><div class="nt-pg">` +
      `<button type="button" class="nt-sw nt-sw0" data-nt="paint" data-k="${k}" data-v="" title="Padrão (sem cor)">∅</button>` +
      names
        .map(
          (n) =>
            `<button type="button" class="nt-sw" data-nt="paint" data-k="${k}" data-v="${n}" title="${COL[n][0]}" style="${k === "c" ? `color:${COL[n][1]};border-color:${COL[n][1]}` : `background:${BGC[n]}`}">A</button>`,
        )
        .join("") +
      "</div>";
    btn.parentNode.appendChild(pop);
  }

  document.addEventListener("mousedown", (e) => {
    const t = e.target;
    if (
      t.closest &&
      t.closest("#nt-tb,#nt-pop,#nt-slash") &&
      !/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)
    )
      e.preventDefault();
  });
  document.addEventListener("selectionchange", () => {
    const s = getSelection();
    if (ed && s.rangeCount && ed.contains(s.anchorNode))
      lastRange = s.getRangeAt(0).cloneRange();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest) return;
    if (!e.target.closest("#nt-pop") && !e.target.closest('[data-nt="pal"]')) {
      const p = $("#nt-pop");
      if (p) p.remove();
    }
    if (slash && !e.target.closest("#nt-slash")) slashClose();
    /* cliques dentro do editor */
    if (ed && ed.contains(e.target)) {
      const t = e.target;
      if (t === ed) {
        const l = ed.lastElementChild;
        if (!l || l.tagName !== "P" || !isEmpty(l)) {
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          ed.appendChild(p);
          place(p, false);
        } else place(l, false);
        return;
      }
      if (t.tagName === "IMG" && t.classList.contains("nt-im")) {
        zoom(t.currentSrc || t.src, t.alt);
        return;
      }
      const li = t.closest("ul.nt-todo > li");
      if (
        li &&
        t.tagName === "LI" &&
        e.clientX < li.getBoundingClientRect().left + 24
      ) {
        snap();
        li.setAttribute(
          "data-ck",
          li.getAttribute("data-ck") === "1" ? "0" : "1",
        );
        touch();
        return;
      }
      const co = t.closest(".nt-callout");
      if (co && t === co && e.clientX < co.getBoundingClientRect().left + 40) {
        snap();
        co.dataset.ic = EMO[(EMO.indexOf(co.dataset.ic) + 1) % EMO.length];
        touch();
        return;
      }
    }
    const b = e.target.closest("#pg-notas [data-nt]");
    if (!b) return;
    const a = b.dataset.nt;
    if (a === "tg") {
      e.stopPropagation();
      const it = get(b.dataset.id);
      if (it) {
        it.o = it.o ? 0 : 1;
        save();
        drawTree();
      }
    } else if (a === "sel") select(b.dataset.id);
    else if (a === "addf") add("f");
    else if (a === "addp") add("p");
    else if (a === "del") del();
    else if (a === "mv") openMv();
    else if (a === "pin") {
      const it = get(N().sel);
      if (it) {
        flush();
        it.s = it.s ? 0 : 1;
        save();
        drawAll();
      }
    } else if (a === "exp") exportMd();
    else if (a === "bk")
      backupAll().catch(
        (x) => (console.error(x), toast("Não foi possível gerar o backup.")),
      );
    else if (a === "imp") $("#nt-imp").click();
    else if (a === "mvx") $("#nt-dlg").close();
    else if (a === "mvok") {
      const it = get(N().sel),
        v = $("#nt-mvs").value || null;
      if (it) {
        flush();
        it.p = v;
        if (v) get(v).o = 1;
        save();
      }
      $("#nt-dlg").close();
      drawAll();
    } else if (a === "fmt") act(b.dataset.f);
    else if (a === "pal") openPal(b.dataset.k, b);
    else if (a === "paint") {
      paint(b.dataset.k, b.dataset.v || null);
      const p = $("#nt-pop");
      if (p) p.remove();
    } else if (a === "menu") {
      const n = $("#nt");
      n && n.classList.toggle("op");
    } else if (a === "copy") {
      const c = preText(b.closest(".nt-cb").querySelector("pre"));
      const ok = () => {
        b.textContent = "Copiado ✓";
        setTimeout(() => (b.textContent = "Copiar"), 1500);
      };
      if (navigator.clipboard)
        navigator.clipboard
          .writeText(c)
          .then(ok, () => toast("Não foi possível copiar."));
      else toast("Não foi possível copiar.");
    }
  });
  document.addEventListener("mousedown", (e) => {
    const s = e.target.closest && e.target.closest("#nt-slash .nt-si[data-i]");
    if (s) {
      e.preventDefault();
      slashPick(+s.dataset.i);
    }
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === "nt-t") {
      const it = get(N().sel);
      if (it) {
        it.t = t.value;
        drawTree();
        later();
        save();
      }
    } else if (t.id === "nt-q") {
      q = t.value.trim();
      drawTree();
    } else if (t.closest && t.closest("#nt-ed")) {
      fixTop();
      touch();
      slashCheck();
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "nt-t") {
      const it = get(N().sel);
      if (it && !it.t.trim()) {
        it.t = it.k === "f" ? "Nova pasta" : "Nova página";
        t.value = it.t;
        drawTree();
        save();
      }
    } else if (t.id === "nt-file") {
      const fs = [...t.files];
      t.value = "";
      addImgs(fs);
    } else if (t.id === "nt-imp") {
      const fs = [...t.files];
      t.value = "";
      importFiles(fs);
    } else if (t.classList && t.classList.contains("nt-lg")) {
      const cb = t.closest(".nt-cb");
      snap();
      cb.dataset.lang = t.value;
      paintCode(cb);
      touch();
    }
  });
  document.addEventListener("focusout", (e) => {
    const t = e.target;
    if (t && t.classList && t.classList.contains("nt-code")) {
      paintCode(t.closest(".nt-cb"));
    }
  });
  document.addEventListener("paste", (e) => {
    if (!ed || !e.target.closest || !e.target.closest("#nt-ed")) return;
    const cd = e.clipboardData;
    if (!cd) return;
    const fs = [...cd.files].filter((f) => /^image\//.test(f.type));
    if (fs.length) {
      e.preventDefault();
      addImgs(fs);
      return;
    }
    const t = cd.getData("text/plain");
    if (!t) return;
    e.preventDefault();
    snap();
    if (e.target.closest("pre.nt-code")) return void exec("insertText", t);
    if (t.includes("\n") && /^(#{1,3} |```|\s*[-*] |\s*\d+\. |> )/m.test(t)) {
      exec("insertHTML", md(t));
      decorate();
    } else if (t.includes("\n"))
      exec(
        "insertHTML",
        t
          .replace(/\r/g, "")
          .split("\n")
          .map((l) => "<p>" + (esc(l) || "<br>") + "</p>")
          .join(""),
      );
    else exec("insertText", t);
    fixTop();
    touch();
  });
  document.addEventListener("dragover", (e) => {
    if (
      ed &&
      e.target.closest &&
      e.target.closest("#nt-ed") &&
      e.dataTransfer &&
      [...e.dataTransfer.types].includes("Files")
    )
      e.preventDefault();
  });
  document.addEventListener("drop", (e) => {
    if (!ed || !e.target.closest || !e.target.closest("#nt-ed")) return;
    const fs = [...(e.dataTransfer ? e.dataTransfer.files : [])].filter((f) =>
      /^image\//.test(f.type),
    );
    if (fs.length) {
      e.preventDefault();
      addImgs(fs);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const lb = document.querySelector(".nt-lb");
      if (lb) {
        lb.remove();
        return;
      }
    }
    if (e.target && e.target.id === "nt-t" && e.key === "Enter") {
      e.preventDefault();
      if (ed) {
        ed.focus();
        place(ed.firstElementChild || ed, false);
      }
      return;
    }
    onKey(e);
  });
  document.addEventListener("keyup", (e) => {
    if (
      slash &&
      (e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End")
    )
      slashCheck();
  });
  addEventListener("pagehide", () => {
    if (ed) flush();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && ed) flush();
  });

  /* ---------- Encaixe no app ---------- */
  function ensure() {
    if (!document.getElementById("pg-notas")) {
      const pg = document.createElement("div");
      pg.className = "page";
      pg.id = "pg-notas";
      pg.hidden = true;
      pg.innerHTML =
        '<div class="ptop"><button class="btn" data-a="back" aria-label="Voltar para a tela inicial">← Início</button><h1>📝 Notas</h1></div><div id="nt-root"></div>';
      const ref = document.getElementById("pg-feed");
      (ref && ref.parentNode
        ? ref.parentNode
        : document.querySelector(".wrap")
      ).appendChild(pg);
    }
    if (!document.getElementById("nt-btn")) {
      const t = document.querySelector(".tools"),
        b = document.createElement("button");
      b.className = "btn";
      b.id = "nt-btn";
      b.dataset.a = "nav";
      b.dataset.p = "notas";
      b.textContent = "📝 Notas";
      if (t) {
        const ex = document.getElementById("exp");
        t.insertBefore(b, ex || null);
      }
    }
    if (!PAGES.includes("notas")) PAGES.push("notas");
  }
  let gcd = false;
  function draw() {
    if (curPage !== "notas") {
      if (shown && ed) flush();
      shown = false;
      return;
    }
    shell();
    if (!shown) {
      shown = true;
      drawAll();
      if (!gcd) {
        gcd = true;
        setTimeout(gc, 3000);
      }
    }
  }
  ensure();
  const _r = render;
  render = function () {
    const r = _r.apply(this, arguments);
    try {
      draw();
    } catch (e) {
      console.error("Notas:", e);
    }
    return r;
  };
  /* usado por nuvem.js (salvar/restaurar no Google Drive) */
  window.NT = {
    flush: () => {
      if (ed) flush();
    },
    imgIds: usedImgs,
    imgGet: (id) => idbGet(id),
    imgPut: (id, b) => idbPut(id, b),
    reload: () => {
      curId = null;
      ed = null;
      shown = false;
      const r = document.getElementById("nt-root");
      if (r) r.innerHTML = "";
    },
    _t: { md, toMd, tokens, makeZip, readZip, htmlOf },
  };
  try {
    if (decodeURIComponent(location.hash.slice(1)) === "notas") route();
  } catch (e) {}
})();
