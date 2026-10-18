/* Forge des Héros — interface */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const clone = (o) => JSON.parse(JSON.stringify(o));
const ICON = {
  d20: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 3 7v10l9 5 9-5V7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 2v6m0 0-9-1m9 1 9-1M12 8l-5 8h10zM7 16l-4 1m14-1 4 1m-9 5v-6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  fire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  boot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h5v8l6 3v4H5v-4l3-1z M5 18v2h14v-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
};
const classSigil = (k) => ({ barbare: "Ba", barde: "Bd", clerc: "Cl", druide: "Dr", guerrier: "Gu", moine: "Mo", paladin: "Pa", rodeur: "Rô", roublard: "Ro", ensorceleur: "En", occultiste: "Oc", magicien: "Ma" })[k] || "?";

/* ---------------- Stockage ---------------- */
const Store = {
  mode: "local", db: null, uid: null, mem: {},
  async init() {
    try {
      if (window.claude && claude.use) {
        const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
        const id = user ? await user.id() : null;
        if (db && id) { this.db = db; this.uid = id; this.mode = "cloud"; }
      }
    } catch (e) { /* repli local */ }
  },
  col() { return this.db.collection("data/users/" + this.uid); },
  async seeded() {
    if (this.mode === "cloud") { try { const d = await this.db.doc("data/users/" + this.uid + "/_meta").get(); return d.exists; } catch (e) { return true; } }
    try { return localStorage.getItem("forge-heros-seeded") === "1"; } catch (e) { return false; }
  },
  async markSeeded() {
    if (this.mode === "cloud") { try { await this.db.doc("data/users/" + this.uid + "/_meta").set({ seeded: true }); } catch (e) { } return; }
    try { localStorage.setItem("forge-heros-seeded", "1"); } catch (e) { }
  },
  async all() {
    if (this.mode === "cloud") {
      try { const snap = await this.col().get(); return snap.docs.map((d) => d.data()).filter((d) => d && d.b); }
      catch (e) { this.mode = "local"; }
    }
    try { const raw = localStorage.getItem("forge-heros"); return raw ? JSON.parse(raw) : []; } catch (e) { return Object.values(this.mem); }
  },
  async put(ch) {
    ch.updated = Date.now();
    if (typeof cloudPut === "function") cloudPut(ch);
    if (typeof pushMember === "function") pushMember(ch);
    if (this.mode === "cloud") {
      try { await this.col().doc(ch.id).set(clone(ch)); return true; }
      catch (e) {
        if (e && (e.code === "unavailable" || e.code === "resource_exhausted")) { toast("Sauvegarde impossible pour l’instant. Réessai à la prochaine modification."); return false; }
        // Lecteur sans droit d’écriture (lien partagé) : on garde les personnages dans ce navigateur.
        this.mode = "local";
      }
    }
    this.mem[ch.id] = ch;
    try { const list = (JSON.parse(localStorage.getItem("forge-heros") || "[]")).filter((c) => c.id !== ch.id); list.push(ch); localStorage.setItem("forge-heros", JSON.stringify(list)); } catch (e) { }
    return true;
  },
  async del(id) {
    if (typeof cloudDel === "function") cloudDel(id);
    if (this.mode === "cloud") { try { await this.col().doc(id).delete(); } catch (e) { } return; }
    delete this.mem[id];
    try { localStorage.setItem("forge-heros", JSON.stringify((JSON.parse(localStorage.getItem("forge-heros") || "[]")).filter((c) => c.id !== id))); } catch (e) { }
  },
};
const saveTimers = {};
function saveSoon(ch) {
  clearTimeout(saveTimers[ch.id]);
  saveTimers[ch.id] = setTimeout(() => Store.put(ch), 500);
}

/* ---------------- État ---------------- */
const STEPS = [
  { k: "classe", n: "Classe" }, { k: "origine", n: "Origine" }, { k: "carac", n: "Caractéristiques" },
  { k: "options", n: "Aptitudes" }, { k: "sorts", n: "Sorts" }, { k: "equip", n: "Équipement" }, { k: "details", n: "Identité" },
];
const S = { view: "home", chars: [], draft: null, step: 0, editId: null, cur: null, tab: "actions", rollMode: "normal", log: [], tray: false, modal: null, spellLvl: "all", openSpell: null, trayExpr: "", trayCount: 1, loaded: false };

function stepsFor(b) { return STEPS.filter((s) => s.k !== "sorts" || (CLASSES[b.cls] && CLASSES[b.cls].caster) || !b.cls); }
const curChar = () => S.chars.find((c) => c.id === S.cur);

/* ---------------- Rendu racine ---------------- */
function render() {
  const app = $("#app");
  if (S.view === "home") app.innerHTML = viewHome();
  else if (S.view === "create") app.innerHTML = viewCreate();
  else if (S.view === "sheet") app.innerHTML = viewSheet();
  else if (S.view === "gm") app.innerHTML = viewGM();
  else if (S.view === "account") app.innerHTML = viewSettings();
  $("#overlay").innerHTML = (S.modal ? viewModal() : "") + (S.tray ? viewTray() : "");
  $("#rollbar").innerHTML = viewRollbar();
  document.body.classList.toggle("noscroll", !!S.modal || S.tray);
}

/* ---------------- Accueil ---------------- */
function viewHome() {
  const list = S.chars.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0));
  const cards = list.map((ch) => {
    const b = ch.b, c = CLASSES[b.cls], sp = SPECIES[b.species];
    const s = compute(b, ch.p);
    return `<button class="hero-card" data-a="open" data-id="${ch.id}">
      <span class="sigil">${classSigil(b.cls)}</span>
      <span class="hc-body"><span class="hc-name">${esc(b.name || "Sans nom")}</span>
      <span class="hc-line">${sp ? sp.n : ""} · ${c ? c.n : ""} ${b.level}${s.sub ? " · " + esc(s.sub) : ""}</span>
      <span class="hc-stats"><span>${ICON.heart}${ch.p.hp}/${s.hpMax}</span><span>${ICON.shield}${s.ac}</span>${ch.adv ? `<span class="hc-adv">${esc(ch.advName || ch.adv)}</span>` : ""}</span></span>
    </button>`;
  }).join("");
  return `<header class="home-head">
    ${typeof accountChip === "function" ? accountChip() : ""}
    <div class="brand"><span class="brand-mark">${ICON.d20}</span><div><h1>Forge des Héros</h1><p>Créateur de personnages et fiches pour les règles 2024</p></div></div>
  </header>
  <main class="home">
    <section class="home-intro">
      <h2>Vos personnages</h2>
      <p class="mute">${S.loaded ? (list.length ? "Touchez une fiche pour jouer, ou forgez un nouveau héros." : "Aucun personnage pour l’instant. Forgez votre premier héros en quelques minutes.") : "Chargement de vos personnages…"}</p>
    </section>
    <div class="hero-grid">
      <button class="hero-card new" data-a="new"><span class="sigil">${ICON.plus}</span><span class="hc-body"><span class="hc-name">Nouveau personnage</span><span class="hc-line">Classe, origine, caractéristiques, sorts</span></span></button>
      ${cards}
    </div>
    ${typeof homeAdventures === "function" ? homeAdventures() : ""}
    <section class="home-tools">
      <button class="btn ghost" data-a="openTray">${ICON.d20} Lancer des dés</button>
      <button class="btn ghost" data-a="importOpen">Importer un personnage</button>
    </section>
    <p class="legal">${Store.mode === "cloud" || (typeof Account !== "undefined" && FB.ok && Account.user()) ? "Vos personnages sont enregistrés dans votre compte et vous suivent d’un appareil à l’autre." : "Vos personnages sont enregistrés dans ce navigateur."}<br>Contient du contenu du System Reference Document 5.2 de Wizards of the Coast LLC, sous licence CC-BY-4.0. Traduction et résumés non officiels. Application non affiliée à Wizards of the Coast ni à D&D Beyond.</p>
  </main>`;
}

/* ---------------- Créateur ---------------- */
function viewCreate() {
  const b = S.draft, steps = stepsFor(b), st = steps[Math.min(S.step, steps.length - 1)], iss = issues(b);
  const rail = steps.map((s, i) => {
    const n = (iss[s.k] || []).length, done = n === 0 && (s.k !== "classe" || b.cls);
    return `<button class="rail-step ${i === S.step ? "on" : ""} ${done ? "done" : ""}" data-a="step" data-i="${i}">
      <span class="rs-num">${done ? ICON.check : i + 1}</span><span class="rs-label">${s.n}</span>${n && i !== S.step ? `<span class="rs-badge">${n}</span>` : ""}</button>`;
  }).join("");
  const body = { classe: stepClass, origine: stepOrigin, carac: stepAbilities, options: stepOptions, sorts: stepSpells, equip: stepEquip, details: stepDetails }[st.k](b);
  const last = S.step === steps.length - 1;
  const allIssues = Object.values(iss).flat();
  return `<header class="topbar">
    <button class="icon-btn" data-a="home" aria-label="Retour">${ICON.back}</button>
    <div class="tb-title"><span class="eyebrow">${S.editId ? "Modifier" : "Nouveau personnage"}</span><strong>${esc(b.name || "Héros sans nom")}</strong></div>
    <button class="icon-btn" data-a="openTray" aria-label="Dés">${ICON.d20}</button>
  </header>
  <nav class="rail" aria-label="Étapes">${rail}</nav>
  <div class="create-grid">
    <main class="step-main">
      <div class="step-head"><span class="eyebrow">Étape ${S.step + 1} sur ${steps.length}</span><h2>${st.n}</h2>
      ${(iss[st.k] || []).length ? `<p class="todo">À compléter : ${iss[st.k].map(esc).join(" · ")}</p>` : `<p class="ok">${ICON.check} Étape complète</p>`}</div>
      ${body}
      <div class="step-nav">
        ${S.step > 0 ? `<button class="btn ghost" data-a="step" data-i="${S.step - 1}">${ICON.back} ${steps[S.step - 1].n}</button>` : "<span></span>"}
        ${last ? `<button class="btn primary" data-a="finish" ${allIssues.length ? "aria-disabled=\"true\"" : ""}>${S.editId ? "Enregistrer les modifications" : "Forger le personnage"}</button>`
          : `<button class="btn primary" data-a="step" data-i="${S.step + 1}">${steps[S.step + 1].n} →</button>`}
      </div>
      ${last && allIssues.length ? `<p class="todo center">Il reste : ${allIssues.map(esc).join(" · ")}</p>` : ""}
    </main>
    <aside class="summary">${viewSummary(b)}</aside>
  </div>`;
}

function viewSummary(b) {
  const c = CLASSES[b.cls], sp = SPECIES[b.species], bg = BACKGROUNDS[b.bg];
  const ab = abilities(b);
  let s = null;
  try { if (c) s = compute(b, { inv: startingInventory(b).inv }); } catch (e) { s = null; }
  return `<div class="sum-card">
    <div class="sum-top"><span class="sigil big">${c ? classSigil(b.cls) : "?"}</span>
      <div><div class="sum-name">${esc(b.name || "Héros sans nom")}</div>
      <div class="mute small">${sp ? sp.n : "Espèce ?"} · ${c ? c.n : "Classe ?"} ${b.level}${bg ? " · " + bg.n : ""}</div></div></div>
    <div class="sum-abil">${ABK.map((k) => `<div><span class="lbl">${ABIL[k].s}</span><b>${sg(mod(ab[k]))}</b><span class="mute small">${ab[k]}</span></div>`).join("")}</div>
    ${s ? `<div class="sum-vitals"><div><span class="lbl">PV</span><b>${s.hpMax}</b></div><div><span class="lbl">CA</span><b>${s.ac}</b></div><div><span class="lbl">Vitesse</span><b>${fmtM(s.speed)}</b></div><div><span class="lbl">Maîtrise</span><b>${sg(s.pb)}</b></div></div>` : ""}
    ${s && s.casting ? `<div class="sum-cast"><span>DD des sorts <b>${s.casting.dc}</b></span><span>Attaque <b>${sg(s.casting.atk)}</b></span></div>` : ""}
  </div>`;
}

function chip(label, on, act, data = "", extra = "") {
  return `<button class="chip ${on ? "on" : ""}" data-a="${act}" ${data} ${extra} aria-pressed="${on}">${label}</button>`;
}

function stepClass(b) {
  const levels = Array.from({ length: MAXLV }, (_, i) => i + 1).map((l) => chip(String(l), b.level === l, "setLevel", `data-v="${l}"`)).join("");
  const cards = Object.entries(CLASSES).map(([k, c]) => `
    <button class="pick-card ${b.cls === k ? "on" : ""}" data-a="setClass" data-v="${k}">
      <span class="pc-head"><span class="sigil">${classSigil(k)}</span><span class="pc-name">${c.n}</span><span class="pc-hd">d${c.hd}</span></span>
      <span class="pc-tag">${c.tag}</span>
      <span class="pc-meta"><span>${c.prim.map((a) => ABIL[a].s).join(" · ")}</span><span class="diff" title="Complexité">${"●".repeat(c.diff)}${"○".repeat(3 - c.diff)}</span></span>
    </button>`).join("");
  const c = CLASSES[b.cls];
  let detail = "";
  if (c) {
    const feats = [];
    for (let l = 1; l <= MAXLV; l++) (c.feats[l] || []).forEach(([n, d]) => feats.push(`<details class="feat ${l > b.level ? "locked" : ""}" ${l <= b.level && l === 1 ? "open" : ""}><summary><span class="lv">Niv. ${l}</span>${n}</summary><p>${d}</p></details>`));
    detail = `<section class="panel detail">
      <h3>${c.n}</h3>
      <dl class="facts">
        <div><dt>Dé de vie</dt><dd>d${c.hd}</dd></div>
        <div><dt>Caractéristique principale</dt><dd>${c.prim.map((a) => ABIL[a].n).join(" et ")}</dd></div>
        <div><dt>Jets de sauvegarde</dt><dd>${c.saves.map((a) => ABIL[a].n).join(", ")}</dd></div>
        <div><dt>Armures</dt><dd>${compute(b, { inv: [] }).profs.armor}</dd></div>
        <div><dt>Armes</dt><dd>${compute(b, { inv: [] }).profs.weapons}</dd></div>
        <div><dt>Compétences</dt><dd>${c.skills.n} au choix ${c.skills.from === "all" ? "parmi toutes" : "parmi " + c.skills.from.map((k) => SKILLS[k].n).join(", ")}</dd></div>
        <div><dt>Sous-classe (niv. 3)</dt><dd>${c.sub.n} — ${c.sub.d}</dd></div>
      </dl>
      <h4>Aptitudes</h4><div class="feats">${feats.join("")}</div>
      <p class="mute small">Les aptitudes grisées arrivent à un niveau supérieur à celui choisi.</p>
    </section>`;
  }
  return `<section class="block"><h3 class="bh">Niveau de départ</h3><div class="chips levels">${levels}</div><p class="mute small">Niveau ${b.level} · bonus de maîtrise ${sg(pbOf(b.level))}. Vous pourrez monter de niveau plus tard depuis la fiche.</p></section>
  <section class="block"><h3 class="bh">Choisissez une classe</h3><div class="pick-grid">${cards}</div></section>${detail}`;
}

function stepOrigin(b) {
  const bgs = Object.entries(BACKGROUNDS).map(([k, g]) => `
    <button class="pick-card ${b.bg === k ? "on" : ""}" data-a="setBg" data-v="${k}">
      <span class="pc-head"><span class="pc-name">${g.n}</span></span>
      <span class="pc-tag">${g.desc}</span>
      <span class="pc-list"><span><b>Caractéristiques</b> ${g.ab.map((a) => ABIL[a].s).join(", ")}</span><span><b>Don</b> ${FEATS[g.feat].n}${g.featList ? " (" + MI_NAME[g.featList] + ")" : ""}</span><span><b>Compétences</b> ${g.skills.map((s) => SKILLS[s].n).join(", ")}</span><span><b>Outils</b> ${g.tool}</span></span>
    </button>`).join("");
  const sps = Object.entries(SPECIES).map(([k, s]) => `
    <button class="pick-card ${b.species === k ? "on" : ""}" data-a="setSpecies" data-v="${k}">
      <span class="pc-head"><span class="pc-name">${s.n}</span><span class="pc-hd">${s.size}</span></span>
      <span class="pc-tag">${s.tag}</span>
      <span class="pc-meta"><span>Vitesse ${fmtM(s.speed)}</span><span>${s.dv ? "Vision " + fmtM(s.dv) : ""}</span></span>
    </button>`).join("");
  const sp = SPECIES[b.species];
  let spDetail = "";
  if (sp) {
    const choice = sp.choice ? `<h4>${sp.choice.label}</h4><div class="opt-grid">${Object.entries(sp.choice.opts).map(([k, o]) => `
      <button class="opt ${b.sChoice === k ? "on" : ""}" data-a="setSChoice" data-v="${k}"><b>${o.n}</b><span>${o.d || "Dégâts de " + DMG[o.t]}</span></button>`).join("")}</div>` : "";
    const size = sp.sizeChoice ? `<h4>Taille</h4><div class="chips">${[K("Moyenne"), K("Petite")].map((z) => chip(SIZE_L[z], b.size === z, "setSize", `data-v="${z}"`)).join("")}</div>` : "";
    const sab = sp.spellAb ? `<h4>Caractéristique des sorts d’espèce</h4><div class="chips">${["int", "sag", "cha"].map((a) => chip(ABIL[a].n, b.sSpellAb === a, "setSAb", `data-v="${a}"`)).join("")}</div>` : "";
    spDetail = `<section class="panel detail"><h3>${sp.n}</h3><p class="mute">${sp.desc}</p>
      <div class="feats">${sp.traits.map((t) => `<details class="feat" open><summary>${t.n}</summary><p>${t.d}</p></details>`).join("")}</div>${choice}${size}${sab}</section>`;
  }
  return `<section class="block"><h3 class="bh">Historique</h3><p class="mute small">Votre passé détermine trois caractéristiques à améliorer, un don d’origine et deux compétences.</p><div class="pick-grid two">${bgs}</div></section>
  <section class="block"><h3 class="bh">Espèce</h3><div class="pick-grid">${sps}</div></section>${spDetail}`;
}

function stepAbilities(b) {
  const bg = BACKGROUNDS[b.bg], ab = abilities(b);
  const methods = [["standard", "Tableau standard"], ["points", "Achat de points"], ["roll", "Tirage 4d6"]].map(([k, n]) => chip(n, b.method === k, "setMethod", `data-v="${k}"`)).join("");
  let pool = null;
  if (b.method === "standard") pool = STD_ARRAY;
  if (b.method === "roll" && b.rolled) pool = b.rolled;
  const spent = ABK.reduce((t, k) => t + (PB_COST[b.base[k]] ?? 0), 0);
  const rows = ABK.map((k) => {
    let ctrl;
    if (b.method === "points") ctrl = `<div class="stepper"><button class="mini" data-a="pb" data-k="${k}" data-d="-1" ${b.base[k] <= 8 ? "disabled" : ""} aria-label="Diminuer">−</button><b>${b.base[k]}</b><button class="mini" data-a="pb" data-k="${k}" data-d="1" ${b.base[k] >= 15 || spent + (PB_COST[b.base[k] + 1] - PB_COST[b.base[k]]) > 27 ? "disabled" : ""} aria-label="Augmenter">+</button></div>`;
    else if (pool) ctrl = `<select id="base-${k}" data-swap="${k}" aria-label="Valeur de ${ABIL[k].n}">${pool.map((v, i) => `<option value="${v}" ${b.base[k] === v ? "selected" : ""}>${v}</option>`).join("")}</select>`;
    else ctrl = `<b class="mute">—</b>`;
    let bonus = 0;
    if (bg) { if (b.bonus.mode === "21") bonus = (b.bonus.p2 === k ? 2 : 0) + (b.bonus.p1 === k && b.bonus.p1 !== b.bonus.p2 ? 1 : 0); else bonus = bg.ab.includes(k) ? 1 : 0; }
    const asi = ab[k] - Math.min(20, (b.base[k] || 8) + bonus);
    const pri = CLASSES[b.cls] && CLASSES[b.cls].prim.includes(k);
    return `<div class="ab-row ${pri ? "pri" : ""}"><span class="ab-name">${ABIL[k].n}${pri ? '<span class="tagp">principale</span>' : ""}</span>${ctrl}<span class="ab-bonus">${bonus ? "+" + bonus : "·"}</span>${b.level >= 4 ? `<span class="ab-bonus">${asi > 0 ? "+" + asi : "·"}</span>` : ""}<span class="ab-total">${ab[k]}</span><span class="ab-mod">${sg(mod(ab[k]))}</span></div>`;
  }).join("");
  const bonusUi = bg ? `<section class="panel"><h4>Bonus d’historique (${bg.n})</h4>
    <div class="chips">${chip("+2 et +1", b.bonus.mode === "21", "setBonusMode", 'data-v="21"')}${chip("+1 à trois", b.bonus.mode === "111", "setBonusMode", 'data-v="111"')}</div>
    ${b.bonus.mode === "21" ? `<div class="bonus-pick"><span>+2</span><div class="chips">${bg.ab.map((a) => chip(ABIL[a].n, b.bonus.p2 === a, "setP2", `data-v="${a}"`)).join("")}</div></div>
    <div class="bonus-pick"><span>+1</span><div class="chips">${bg.ab.filter((a) => a !== b.bonus.p2).map((a) => chip(ABIL[a].n, b.bonus.p1 === a, "setP1", `data-v="${a}"`)).join("")}</div></div>` : `<p class="mute small">+1 en ${bg.ab.map((a) => ABIL[a].n).join(", ")}.</p>`}
  </section>` : `<p class="todo">Choisissez un historique à l’étape Origine pour répartir ses bonus.</p>`;
  const asiUi = activeAsiLevels(b).map((lv) => {
    const a = asiAt(b, lv), dl = `data-lv="${lv}"`;
    return `<section class="panel"><h4>Amélioration de caractéristique (niveau ${lv})</h4>
    <div class="chips">${chip("+2 à une", a.mode === "2", "setAsiMode", 'data-v="2" ' + dl)}${chip("+1 à deux", a.mode === "11", "setAsiMode", 'data-v="11" ' + dl)}</div>
    <div class="bonus-pick"><span>${a.mode === "2" ? "+2" : "+1"}</span><div class="chips">${ABK.map((x) => chip(ABIL[x].s, a.a === x, "setAsiA", `data-v="${x}" ${dl}`)).join("")}</div></div>
    ${a.mode === "11" ? `<div class="bonus-pick"><span>+1</span><div class="chips">${ABK.filter((x) => x !== a.a).map((x) => chip(ABIL[x].s, a.b === x, "setAsiB", `data-v="${x}" ${dl}`)).join("")}</div></div>` : ""}
  </section>`;
  }).join("") + (b.level >= 19 ? `<section class="panel"><h4>Faveur épique (niveau 19)</h4><p class="mute small">Un don épique et +1 à une caractéristique, jusqu’à 30.</p>
    <div class="opt-grid">${Object.entries(EPIC_BOONS).map(([k, x]) => `<button class="opt ${b.opts.boon.id === k ? "on" : ""}" data-a="boon" data-v="${k}"><b>${x.n}</b><span>${x.d}</span></button>`).join("")}</div>
    <div class="bonus-pick"><span>+1</span><div class="chips">${ABK.map((x) => chip(ABIL[x].s, b.opts.boon.a === x, "boonAb", `data-v="${x}"`)).join("")}</div></div></section>` : "") + (b.level >= 20 && (b.cls === "barbare" || b.cls === "moine") ? `<p class="mute small">Niveau 20 : ${b.cls === "barbare" ? "Force et Constitution" : "Dextérité et Sagesse"} +4 (max 25), déjà inclus.</p>` : "");
  return `<section class="block"><div class="chips">${methods}</div>
    <p class="mute small">${b.method === "standard" ? "Répartissez 15, 14, 13, 12, 10 et 8. Choisir une valeur l’échange avec la caractéristique qui l’avait." : b.method === "points" ? `27 points à dépenser, scores de 8 à 15. <b class="${spent > 27 ? "bad" : ""}">${27 - spent} points restants.</b>` : "Lancez 4d6 six fois et gardez les trois meilleurs dés à chaque fois."}</p>
    <div class="row-btns">${b.method === "roll" ? `<button class="btn" data-a="rollStats">${ICON.d20} ${b.rolled ? "Relancer" : "Lancer"} les dés</button>` : ""}${b.cls && b.method !== "points" ? `<button class="btn ghost" data-a="recommend">Répartition conseillée pour ${CLASSES[b.cls].n}</button>` : ""}</div>
  </section>
  <section class="panel abil-table"><div class="ab-row head"><span>Caractéristique</span><span>Base</span><span>Hist.</span>${b.level >= 4 ? "<span>Niveaux</span>" : ""}<span>Total</span><span>Mod.</span></div>${rows}</section>
  ${bonusUi}${asiUi}`;
}

function skillChips(b, pool, selected, max, act, lockSet) {
  return `<div class="chips">${pool.map((k) => {
    const locked = lockSet && lockSet.has(k) && !selected.includes(k);
    const on = selected.includes(k);
    const full = !on && selected.length >= max;
    return `<button class="chip ${on ? "on" : ""} ${locked ? "lock" : ""}" data-a="${act}" data-v="${k}" ${locked || full ? 'aria-disabled="true"' : ""} aria-pressed="${on}" title="${locked ? "Déjà maîtrisée" : ""}">${SKILLS[k].n}<small>${ABIL[SKILLS[k].a].s}</small></button>`;
  }).join("")}</div>`;
}

function magicPicker(b, src) {
  const m = b.magic[src], cls = MI_LIST[m.list];
  const cants = Object.keys(SPELLS).filter((id) => SPELLS[id].l === 0 && SPELLS[id].cl.includes(cls)).sort((x, y) => SPELLS[x].n.localeCompare(SPELLS[y].n, "fr"));
  const l1 = Object.keys(SPELLS).filter((id) => SPELLS[id].l === 1 && SPELLS[id].cl.includes(cls)).sort((x, y) => SPELLS[x].n.localeCompare(SPELLS[y].n, "fr"));
  return `<div class="subpanel"><h4>Initié à la magie ${src === "bg" ? "(historique)" : "(don humain)"}</h4>
    ${src === "human" ? `<div class="chips">${Object.entries(MI_NAME).map(([k, n]) => chip("Liste " + n, m.list === k, "miList", `data-src="${src}" data-v="${k}"`)).join("")}</div>` : `<p class="mute small">Liste de sorts : ${MI_NAME[m.list]}</p>`}
    <div class="bonus-pick"><span>Carac.</span><div class="chips">${["int", "sag", "cha"].map((a) => chip(ABIL[a].n, m.ab === a, "miAb", `data-src="${src}" data-v="${a}"`)).join("")}</div></div>
    <p class="lbl">Deux tours de magie (${m.cant.length}/2)</p>
    <div class="chips">${cants.map((id) => chip(SPELLS[id].n, m.cant.includes(id), "miCant", `data-src="${src}" data-v="${id}"`, !m.cant.includes(id) && m.cant.length >= 2 ? 'aria-disabled="true"' : "")).join("")}</div>
    <p class="lbl">Un sort de niveau 1</p>
    <div class="chips">${l1.map((id) => chip(SPELLS[id].n, m.spell === id, "miSpell", `data-src="${src}" data-v="${id}"`)).join("")}</div></div>`;
}

function stepOptions(b) {
  const c = CLASSES[b.cls], sp = SPECIES[b.species], bg = BACKGROUNDS[b.bg];
  if (!c) return `<p class="todo">Choisissez d’abord une classe.</p>`;
  const bgSkills = new Set(bg ? bg.skills : []);
  const fromOthers = (exclude) => { const s = profSkills(b); exclude.forEach((k) => s.delete(k)); return s; };
  const out = [];
  out.push(`<section class="panel"><h4>Compétences de ${c.n} — ${b.skillsClass.length}/${c.skills.n}</h4>
    ${bg ? `<p class="mute small">Déjà acquises par l’historique : ${bg.skills.map((k) => SKILLS[k].n).join(", ")}.</p>` : ""}
    ${skillChips(b, classSkillPool(b), b.skillsClass, c.skills.n, "skClass", fromOthers(b.skillsClass))}</section>`);
  if (sp && sp.skillPick) out.push(`<section class="panel"><h4>Compétence d’espèce (${sp.n})</h4>${skillChips(b, sp.skillPick.from === "all" ? SKK : sp.skillPick.from, b.skillsSpecies, sp.skillPick.n, "skSpecies", fromOthers(b.skillsSpecies))}</section>`);
  if (sp && sp.bonusFeat) out.push(`<section class="panel"><h4>Don d’origine (humain)</h4><div class="opt-grid">${Object.entries(FEATS).map(([k, f]) => `<button class="opt ${b.humanFeat === k ? "on" : ""}" data-a="humanFeat" data-v="${k}"><b>${f.n}</b><span>${f.d}</span></button>`).join("")}</div></section>`);
  featsOf(b).forEach((f) => {
    if (f.id === "doue") out.push(`<section class="panel"><h4>Don Doué — ${b.skilled.length}/3</h4>${skillChips(b, SKK, b.skilled, 3, "skSkilled", fromOthers(b.skilled))}</section>`);
    if (f.id === "initie") out.push(`<section class="panel">${magicPicker(b, f.src)}</section>`);
  });
  if (b.cls === "barde" && b.level >= 3) out.push(`<section class="panel"><h4>Collège du Savoir : trois compétences — ${b.skillsLore.length}/3</h4>${skillChips(b, SKK, b.skillsLore, 3, "skLore", fromOthers(b.skillsLore))}</section>`);
  if (b.cls === "barbare" && b.level >= 3) out.push(`<section class="panel"><h4>Savoir primitif : une compétence de barbare</h4>${skillChips(b, c.skills.from, b.skillPrimal ? [b.skillPrimal] : [], 1, "skPrimal", fromOthers(b.skillPrimal ? [b.skillPrimal] : []))}</section>`);
  const ex = expertiseCount(b);
  if (ex) out.push(`<section class="panel"><h4>Expertise — ${b.expertise.length}/${ex}</h4><p class="mute small">Bonus de maîtrise doublé.</p><div class="chips">${expertisePool(b).map((k) => chip(SKILLS[k].n, b.expertise.includes(k), "expertise", `data-v="${k}"`, !b.expertise.includes(k) && b.expertise.length >= ex ? 'aria-disabled="true"' : "")).join("")}</div></section>`);
  if (b.cls === "clerc") out.push(`<section class="panel"><h4>Ordre divin</h4><div class="opt-grid">
    <button class="opt ${b.opts.order === "protecteur" ? "on" : ""}" data-a="order" data-v="protecteur"><b>Protecteur</b><span>Maîtrise des armes de guerre et des armures lourdes.</span></button>
    <button class="opt ${b.opts.order === "thaumaturge" ? "on" : ""}" data-a="order" data-v="thaumaturge"><b>Thaumaturge</b><span>Un tour de magie de plus et + mod. Sag en Arcanes et Religion.</span></button></div></section>`);
  if (b.cls === "druide") out.push(`<section class="panel"><h4>Ordre primitif</h4><div class="opt-grid">
    <button class="opt ${b.opts.order === "magicien" ? "on" : ""}" data-a="order" data-v="magicien"><b>Magicien</b><span>Un tour de magie de plus et + mod. Sag en Arcanes et Nature.</span></button>
    <button class="opt ${b.opts.order === "gardien" ? "on" : ""}" data-a="order" data-v="gardien"><b>Gardien</b><span>Maîtrise des armes de guerre et des armures intermédiaires.</span></button></div></section>`);
  if (b.cls === "guerrier" || (["paladin", "rodeur"].includes(b.cls) && b.level >= 2))
    out.push(`<section class="panel"><h4>Style de combat</h4><div class="opt-grid">${Object.entries(FIGHTING_STYLES).map(([k, f]) => `<button class="opt ${b.opts.style === k ? "on" : ""}" data-a="style" data-v="${k}"><b>${f.n}</b><span>${f.d}</span></button>`).join("")}</div></section>`);
  if (c.mastery) {
    const ws = Object.entries(WEAPONS).filter(([k, w]) => weaponProf(b, w) && (b.cls !== "barbare" || w.k === "cac"));
    out.push(`<section class="panel"><h4>Maîtrise d’arme — ${b.opts.mastery.length}/${c.mastery}</h4><p class="mute small">Vous utilisez la propriété spéciale de ces armes. Touchez une arme pour voir son effet.</p>
      <div class="chips">${ws.map(([k, w]) => chip(w.n + `<small>${MASTERY[w.m].split(" — ")[0]}</small>`, b.opts.mastery.includes(k), "mastery", `data-v="${k}"`, (!b.opts.mastery.includes(k) && b.opts.mastery.length >= c.mastery ? 'aria-disabled="true"' : "") + ` title="${esc(MASTERY[w.m])}"`)).join("")}</div>
      ${b.opts.mastery.length ? `<ul class="plain small">${b.opts.mastery.map((k) => `<li><b>${WEAPONS[k].n}</b> · ${MASTERY[WEAPONS[k].m]}</li>`).join("")}</ul>` : ""}</section>`);
  }
  if (b.cls === "occultiste") {
    const n = c.inv[b.level - 1];
    out.push(`<section class="panel"><h4>Manifestations occultes — ${b.opts.inv.length}/${n}</h4><div class="opt-grid">${Object.entries(INVOCATIONS).filter(([, v]) => v.lv <= b.level).map(([k, v]) => `<button class="opt ${b.opts.inv.includes(k) ? "on" : ""}" data-a="inv" data-v="${k}" ${!b.opts.inv.includes(k) && b.opts.inv.length >= n ? 'aria-disabled="true"' : ""}><b>${v.n}</b><span>${v.d}</span></button>`).join("")}</div></section>`);
  }
  if (b.cls === "ensorceleur" && b.level >= 2) { const mc = metaCount(b); out.push(`<section class="panel"><h4>Métamagie — ${b.opts.meta.length}/${mc}</h4><div class="opt-grid">${Object.entries(METAMAGIC).map(([k, v]) => `<button class="opt ${b.opts.meta.includes(k) ? "on" : ""}" data-a="meta" data-v="${k}" ${!b.opts.meta.includes(k) && b.opts.meta.length >= mc ? 'aria-disabled="true"' : ""}><b>${v.n}</b><span>${v.d}</span></button>`).join("")}</div></section>`); }
  if (b.cls === "ensorceleur" && b.level >= 6) out.push(`<section class="panel"><h4>Affinité élémentaire : type de dégâts</h4><p class="mute small">Celui de votre ascendance draconique.</p><div class="chips">${[K("acide"), K("froid"), K("feu"), K("foudre"), K("poison")].map((t) => chip(DMG[t][0].toUpperCase() + DMG[t].slice(1), b.opts.dragon === t, "dragon", `data-v="${t}"`)).join("")}</div></section>`);
  if (b.cls === "guerrier" && b.level >= 7) out.push(`<section class="panel"><h4>Second style de combat (Champion)</h4><div class="opt-grid">${Object.entries(FIGHTING_STYLES).filter(([k]) => k !== b.opts.style).map(([k, f]) => `<button class="opt ${b.opts.style2 === k ? "on" : ""}" data-a="style2" data-v="${k}"><b>${f.n}</b><span>${f.d}</span></button>`).join("")}</div></section>`);
  if (STRIKE_OPTS[b.cls] && b.level >= STRIKE_OPTS[b.cls].lvl) { const so = STRIKE_OPTS[b.cls]; out.push(`<section class="panel"><h4>${so.label} (niveau ${so.lvl})</h4><div class="opt-grid">${Object.entries(so.opts).map(([k, o]) => `<button class="opt ${b.opts.strike === k ? "on" : ""}" data-a="strike" data-v="${k}"><b>${o.n}</b><span>${o.d}</span></button>`).join("")}</div></section>`); }
  if (b.cls === "rodeur" && b.level >= 3) out.push(`<section class="panel"><h4>Proie du chasseur</h4><div class="opt-grid">
    <button class="opt ${b.opts.prey === "colosse" ? "on" : ""}" data-a="prey" data-v="colosse"><b>Tueur de colosses</b><span>Une fois par tour, +1d8 dégâts contre une cible blessée.</span></button>
    <button class="opt ${b.opts.prey === "horde" ? "on" : ""}" data-a="prey" data-v="horde"><b>Briseur de hordes</b><span>Une attaque de plus contre une autre créature proche de la cible.</span></button></div></section>`);
  if (b.cls === "druide" && b.level >= 3) out.push(`<section class="panel"><h4>Cercle de la Terre : votre terre</h4><div class="opt-grid">${Object.entries(LAND_SPELLS).map(([k, l]) => `<button class="opt ${b.opts.land === k ? "on" : ""}" data-a="land" data-v="${k}"><b>${l.n}</b><span>${Object.values(l.s).flat().map((id) => SPELLS[id].n).join(", ")}</span></button>`).join("")}</div></section>`);
  out.push(`<section class="panel"><h4>Langues — ${b.langs.length}/2</h4><p class="mute small">Vous parlez le commun et deux autres langues.</p><div class="chips">${LANGS.map((l) => chip(LANG_L[l], b.langs.includes(l), "lang", `data-v="${esc(l)}"`, !b.langs.includes(l) && b.langs.length >= 2 ? 'aria-disabled="true"' : "")).join("")}</div></section>`);
  return out.join("");
}

function spellRow(id, on, act, disabled, locked, src) {
  const s = SPELLS[id];
  const open = S.openSpell === id;
  return `<div class="spell-row ${on ? "on" : ""} ${locked ? "lock" : ""}">
    <button class="sr-main" data-a="${locked ? "toggleSpell" : act}" data-v="${id}" ${disabled && !on && !locked ? 'aria-disabled="true"' : ""} aria-pressed="${on}">
      <span class="sr-check">${on || locked ? ICON.check : ""}</span>
      <span class="sr-name">${s.n}${s.co ? '<i class="tagc" title="Concentration">C</i>' : ""}${s.ri ? '<i class="tagc" title="Rituel">R</i>' : ""}</span>
      <span class="sr-meta">${src ? esc(src) : SC[s.e]}</span>
    </button>
    <button class="sr-info" data-a="toggleSpell" data-v="${id}" aria-label="Détails" aria-expanded="${open}">${open ? "−" : "i"}</button>
    ${open ? `<div class="sr-body">${spellDetail(s)}</div>` : ""}
  </div>`;
}
function spellDetail(s) {
  return `<dl class="spell-facts"><div><dt>Incantation</dt><dd>${s.t}</dd></div><div><dt>Portée</dt><dd>${s.p}</dd></div><div><dt>Composantes</dt><dd>${s.c}</dd></div><div><dt>Durée</dt><dd>${s.co ? "Concentration, " : ""}${s.du}</dd></div></dl><p>${s.d}</p>${s.up ? `<p class="mute small">Niveau supérieur : ${s.up}</p>` : ""}`;
}

function stepSpells(b) {
  const c = CLASSES[b.cls];
  if (!c || !c.caster) return `<p class="mute">Cette classe ne lance pas de sorts.</p>`;
  const nc = cantripCount(b), np = prepCount(b), max = maxSpellLevel(b);
  const granted = grantedSpells(b);
  const gIds = new Set(granted.map((g) => g.id));
  let html = "";
  if (granted.length) html += `<section class="panel"><h4>Toujours préparés</h4><p class="mute small">Ces sorts ne comptent pas dans vos sorts préparés.</p>${granted.map((g) => spellRow(g.id, true, "", false, true, g.src + (SPELLS[g.id].l ? " · niv. " + SPELLS[g.id].l : " · tour"))).join("")}</section>`;
  if (nc) html += `<section class="panel"><h4>Tours de magie — ${b.cant.length}/${nc}</h4>${classSpellPool(b, 0).filter((id) => !gIds.has(id)).map((id) => spellRow(id, b.cant.includes(id), "pickCant", b.cant.length >= nc)).join("")}</section>`;
  const lvTabs = ["all", ...Array.from({ length: max }, (_, i) => i + 1)].map((l) => chip(l === "all" ? "Tous" : "Niveau " + l, S.spellLvl == l, "spellLvl", `data-v="${l}"`)).join("");
  const pool = [];
  for (let l = 1; l <= max; l++) if (S.spellLvl === "all" || S.spellLvl == l) pool.push(`<p class="lvl-sep">Niveau ${l}</p>` + classSpellPool(b, l).filter((id) => !gIds.has(id)).map((id) => spellRow(id, b.prep.includes(id), "pickPrep", b.prep.length >= np)).join(""));
  if (b.cls === "barde" && b.level >= 6) {
    const lp = []; for (let l = 0; l <= max; l++) lp.push(...Object.keys(SPELLS).filter((id) => SPELLS[id].l === l && !SPELLS[id].cl.includes("barde") && SPELLS[id].cl.some((x) => ["clerc", "druide", "magicien"].includes(x)) && !gIds.has(id) || b.opts.lore2.includes(id) && SPELLS[id].l === l));
    const uniq = [...new Set(lp)].sort((x, y) => SPELLS[x].l - SPELLS[y].l || SPELLS[x].n.localeCompare(SPELLS[y].n, "fr"));
    html += `<section class="panel"><h4>Découvertes magiques — ${b.opts.lore2.length}/2</h4><p class="mute small">Deux sorts de clerc, druide ou magicien, toujours préparés.</p>${uniq.map((id) => spellRow(id, b.opts.lore2.includes(id), "lore2", b.opts.lore2.length >= 2, false, SPELLS[id].l ? "niv. " + SPELLS[id].l : "tour")).join("")}</section>`;
  }
  if (b.cls === "occultiste") Object.entries(ARCANUM_LV).forEach(([sl, lv]) => {
    if (b.level < lv) return;
    html += `<section class="panel"><h4>Arcanum mystique — niveau ${sl}</h4><p class="mute small">Une fois par repos long, sans emplacement.</p>${Object.keys(SPELLS).filter((id) => SPELLS[id].l === +sl && SPELLS[id].cl.includes("occultiste")).map((id) => spellRow(id, b.opts.arcanum[sl] === id, "arcanum\" data-lv=\"" + sl, false)).join("")}</section>`;
  });
  html += `<section class="panel"><h4>Sorts préparés — ${b.prep.length}/${np}</h4><p class="mute small">${b.cls === "magicien" ? "Votre grimoire contient ces sorts ; vous en changez lors d’un repos long." : b.cls === "barde" && b.level >= 10 ? "Secrets magiques : les listes du clerc, du druide et du magicien sont ouvertes." : c.caster === "pact" ? "Vos emplacements de pacte reviennent après un repos court." : "Vous pourrez changer de sorts préparés après un repos long."}</p><div class="chips">${lvTabs}</div>${pool.join("")}</section>`;
  return html;
}

function gearList(list) {
  return `<ul class="gear">${list.map(([ref, q]) => {
    const n = ref.startsWith("w:") ? WEAPONS[ref.slice(2)].n : ref.startsWith("a:") ? ARMORS[ref.slice(2)].n : GEAR[ref];
    return `<li>${q && q > 1 ? `<b>${q}×</b> ` : ""}${n}</li>`;
  }).join("")}</ul>`;
}
function stepEquip(b) {
  const c = CLASSES[b.cls], bg = BACKGROUNDS[b.bg];
  if (!c || !bg) return `<p class="todo">Choisissez une classe et un historique.</p>`;
  const clsOpts = [["A", "Équipement de classe", gearList(c.gearA) + `<p class="gold">+ ${c.goldA} po</p>`]];
  if (c.gearB) clsOpts.push(["B", "Équipement alternatif", gearList(c.gearB) + `<p class="gold">+ ${c.goldBg} po</p>`]);
  clsOpts.push([c.gearB ? "C" : "B", "Or uniquement", `<p class="gold big">${c.goldB} po</p><p class="mute small">Achetez votre équipement vous-même.</p>`]);
  const st = startingInventory(b);
  return `<section class="block"><h3 class="bh">${c.n}</h3><div class="opt-grid">${clsOpts.map(([k, n, h]) => `<button class="opt tall ${b.gear.cls === k ? "on" : ""}" data-a="gearCls" data-v="${k}"><b>${n}</b>${h}</button>`).join("")}</div></section>
  <section class="block"><h3 class="bh">${bg.n}</h3><div class="opt-grid">
    <button class="opt tall ${b.gear.bg === "A" ? "on" : ""}" data-a="gearBg" data-v="A"><b>Équipement d’historique</b>${gearList(bg.gear)}<p class="gold">+ ${bg.gold} po</p></button>
    <button class="opt tall ${b.gear.bg === "B" ? "on" : ""}" data-a="gearBg" data-v="B"><b>Or uniquement</b><p class="gold big">50 po</p></button></div></section>
  <section class="panel"><h4>Votre sac au départ</h4><p class="mute small">${st.inv.length} objets · ${st.gold} po. Les armes et la meilleure armure maîtrisée sont équipées automatiquement.</p></section>`;
}

function stepDetails(b) {
  const d = b.details;
  const field = (k, label, ph, area) => `<label class="field"><span>${label}</span>${area ? `<textarea id="d-${k}" data-f="details.${k}" rows="3" placeholder="${ph}">${esc(d[k])}</textarea>` : `<input id="d-${k}" data-f="details.${k}" value="${esc(d[k])}" placeholder="${ph}">`}</label>`;
  return `<section class="panel"><label class="field big"><span>Nom du personnage</span><input id="d-name" data-f="name" value="${esc(b.name)}" placeholder="Ex. Aldric Brisefer" autocomplete="off"></label>
    <div class="field"><span>Alignement</span><div class="align-grid">${ALIGN.map((a) => chip(ALIGN_L[a], b.align === a, "align", `data-v="${a}"`)).join("")}</div></div>
    <div class="two-col">${field("age", "Âge", "Ex. 27 ans")}${field("taille", "Taille et poids", "Ex. 1,80 m, 75 kg")}</div>
    ${["clerc", "paladin"].includes(b.cls) ? `<div class="deity-hint">${b.cls === "clerc" ? "Un clerc tire ses pouvoirs d’une divinité ou d’une force sacrée : choisissez-la avec votre MJ." : "Un paladin est lié par un serment, souvent prêté devant une divinité : précisez-la si c’est le cas."}</div>` : ""}
    ${field("divinite", "Divinité ou foi", "Nom du dieu, du panthéon ou de la force que vous servez (facultatif)")}
    ${field("apparence", "Apparence", "Cheveux, yeux, signes distinctifs…", true)}
    ${field("personnalite", "Traits de personnalité", "Comment vous comportez-vous ?", true)}
    <div class="two-col">${field("ideaux", "Idéaux", "Ce en quoi vous croyez", true)}${field("liens", "Liens", "Ce qui vous attache au monde", true)}</div>
    ${field("defauts", "Défauts", "Vos faiblesses", true)}
    ${field("histoire", "Histoire", "D’où venez-vous ?", true)}
  </section>`;
}

/* ---------------- Fiche ---------------- */
function viewSheet() {
  const ch = curChar();
  if (!ch) return "";
  const b = ch.b, p = ch.p, s = compute(b, p), c = CLASSES[b.cls], sp = SPECIES[b.species];
  const hpPct = Math.max(0, Math.min(100, (p.hp / s.hpMax) * 100));
  const down = p.hp <= 0;
  const tabs = [["actions", "Actions"], ["carac", "Compétences"], ...(s.spells.length ? [["sorts", "Sorts"]] : []), ["inv", "Inventaire"], ["traits", "Aptitudes"], ...(typeof FB !== "undefined" && FB.ok ? [["adv", ch.adv ? "Aventure ●" : "Aventure"]] : []), ["notes", "Notes"]];
  const tabBody = { actions: tabActions, carac: tabSkills, sorts: tabSpells, inv: tabInventory, traits: tabTraits, notes: tabNotes, adv: typeof tabAdventure === "function" ? tabAdventure : tabActions }[S.tab] || tabActions;
  return `<header class="topbar sheet-top">
    <button class="icon-btn" data-a="home" aria-label="Retour">${ICON.back}</button>
    <div class="tb-title"><strong>${esc(b.name)}</strong><span class="eyebrow">${sp.n} · ${c.n} ${b.level}${s.sub ? " · " + esc(s.sub) : ""}</span></div>
    <div class="tb-actions">
      <button class="btn small ghost" data-a="rest" data-v="short">${ICON.fire}<span class="hide-s">Repos court</span></button>
      <button class="btn small ghost" data-a="rest" data-v="long">${ICON.moon}<span class="hide-s">Repos long</span></button>
      ${b.level < MAXLV ? `<button class="btn small" data-a="levelUp">Niveau ${b.level + 1}</button>` : ""}
      <button class="icon-btn" data-a="edit" aria-label="Modifier le personnage">${ICON.edit}</button>
    </div>
  </header>
  <main class="sheet">
    <section class="vitals">
      <div class="hp-card ${down ? "down" : ""}">
        <div class="hp-top"><span class="lbl">Points de vie</span>${p.temp ? `<span class="temp">+${p.temp} temp.</span>` : ""}</div>
        <button class="hp-num" data-a="hpModal"><b>${p.hp}</b><span>/ ${s.hpMax}</span></button>
        <div class="hp-bar"><i style="width:${hpPct}%"></i></div>
        <div class="hp-quick"><button class="mini dmg" data-a="hpQuick" data-v="-1" aria-label="Retirer 1 PV">−1</button><button class="mini" data-a="hpModal">Ajuster</button><button class="mini heal" data-a="hpQuick" data-v="1" aria-label="Ajouter 1 PV">+1</button></div>
      </div>
      <div class="stat-tiles">
        <div class="tile"><span class="lbl">CA</span><b>${s.ac}</b><span class="tsub">${esc(s.acNote)}</span>${s.armorWarn ? '<span class="warn">non maîtrisée</span>' : ""}</div>
        <button class="tile roll" data-a="r20" data-l="Initiative" data-m="${s.init}"><span class="lbl">Initiative</span><b>${sg(s.init)}</b><span class="tsub">${ICON.d20}</span></button>
        <div class="tile"><span class="lbl">Vitesse</span><b>${fmtM(s.speed)}</b><span class="tsub">${s.darkvision ? "Vision " + fmtM(s.darkvision) : "&nbsp;"}</span></div>
        <div class="tile"><span class="lbl">Maîtrise</span><b>${sg(s.pb)}</b><span class="tsub">Perc. passive ${10 + s.perc}</span></div>
        <button class="tile ${p.insp ? "lit" : ""}" data-a="insp" aria-pressed="${p.insp}"><span class="lbl">Inspiration</span><b>${p.insp ? "★" : "☆"}</b><span class="tsub">héroïque</span></button>
      </div>
    </section>
    ${down ? deathSaves(p) : ""}
    <section class="abil-strip">${ABK.map((k) => {
      const sv = s.saves.find((x) => x.k === k);
      return `<div class="abil"><button class="ab-main" data-a="r20" data-l="Test de ${ABIL[k].n}" data-m="${s.m[k]}"><span class="lbl">${ABIL[k].n}</span><b>${sg(s.m[k])}</b><span class="ab-score">${s.ab[k]}</span></button>
        <button class="ab-save ${sv.pr ? "pr" : ""}" data-a="r20" data-l="Sauvegarde de ${ABIL[k].n}" data-m="${sv.v}"><i></i>JS ${sg(sv.v)}</button></div>`;
    }).join("")}</section>
    ${p.cond.length ? `<div class="conds">${p.cond.map((x) => `<button class="cond" data-a="cond" data-v="${esc(x)}">${esc(COND_L[x] || x)} ${ICON.close}</button>`).join("")}</div>` : ""}
    <nav class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" class="tab ${S.tab === k ? "on" : ""}" data-a="tab" data-v="${k}" aria-selected="${S.tab === k}">${n}</button>`).join("")}</nav>
    <section class="tab-body">${tabBody(ch, s)}</section>
  </main>`;
}

function deathSaves(p) {
  const dots = (n, k) => [0, 1, 2].map((i) => `<button class="ds ${i < n ? "on" : ""} ${k}" data-a="ds" data-k="${k}" data-i="${i}" aria-label="${k === "s" ? "Réussite" : "Échec"} ${i + 1}"></button>`).join("");
  return `<section class="panel death"><div><span class="lbl">Jets contre la mort</span><p class="mute small">À 0 PV : lancez un d20 au début de votre tour. 10 ou plus = réussite.</p></div>
    <div class="ds-row"><span>Réussites</span>${dots(p.ds.s, "s")}</div><div class="ds-row"><span>Échecs</span>${dots(p.ds.f, "f")}</div>
    <button class="btn small" data-a="deathRoll">${ICON.d20} Lancer</button></section>`;
}

function resRow(ch, r) {
  const used = ch.p.res[r.k] || 0, left = r.max - used;
  const reset = r.reset === "long" ? "repos long" : r.reset === "short" ? "repos court" : "1 au repos court";
  if (r.max > 6) return `<div class="res"><div><b>${r.n}</b><span class="mute small">${left}/${r.max} · ${reset}${r.note ? " · " + r.note : ""}</span></div>
    <div class="res-pool"><button class="mini" data-a="resPool" data-k="${r.k}" data-d="1" aria-label="Dépenser">−</button><b>${left}</b><button class="mini" data-a="resPool" data-k="${r.k}" data-d="-1" aria-label="Récupérer">+</button></div></div>`;
  return `<div class="res"><div><b>${r.n}</b><span class="mute small">${reset}${r.note ? " · " + r.note : ""}</span></div>
    <div class="pips">${Array.from({ length: r.max }, (_, i) => `<button class="pip ${i < left ? "on" : ""}" data-a="resPip" data-k="${r.k}" data-i="${i}" aria-label="${r.n} ${i + 1}"></button>`).join("")}</div></div>`;
}

function tabActions(ch, s) {
  const b = ch.b;
  const atk = s.attacks.map((a) => `<div class="atk">
    <div class="atk-name"><b>${esc(a.n)}</b><span class="mute small">${a.range}${a.props ? " · " + a.props : ""}${a.mastery ? ` · <span class="mast" title="${esc(MASTERY[a.mastery])}">${MASTERY[a.mastery].split(" — ")[0]}</span>` : ""}${a.prof ? "" : " · <span class='bad'>non maîtrisée</span>"}</span></div>
    <button class="rb hit" data-a="r20" data-l="${esc(a.n)} — attaque" data-m="${a.hit}" data-crit="${a.crit}">${sg(a.hit)}</button>
    <button class="rb dmg" data-a="rDmg" data-l="${esc(a.n)} — dégâts ${a.ty}" data-e="${a.dmg}${a.rage ? "" : ""}">${esc(a.dmg)}<small>${a.ty}</small></button>
    ${a.alt ? `<button class="rb dmg alt" data-a="rDmg" data-l="${esc(a.n)} à deux mains" data-e="${a.alt}">${esc(a.alt)}<small>2 mains</small></button>` : ""}
  </div>`).join("");
  const cantrips = s.spells.filter((x) => x.l === 0 && (x.atk || x.sv || x.dmg));
  const cantHtml = cantrips.map((x) => {
    const dice = x.dmg ? scaleCantrip(x, b.level) : null;
    return `<div class="atk spell">
      <div class="atk-name"><b>${x.n}</b><span class="mute small">${x.p} · tour de magie</span></div>
      ${x.atk ? `<button class="rb hit" data-a="r20" data-l="${esc(x.n)} — attaque" data-m="${x.atk}">${sg(x.atk)}</button>` : `<span class="rb dc">DD ${x.dc}<small>${ABIL[x.sv].s}</small></span>`}
      ${dice ? `<button class="rb dmg" data-a="rDmg" data-l="${esc(x.n)} — ${DMG[x.ty]}" data-e="${dice}${x.dmgBonus ? (x.dmgBonus > 0 ? "+" : "") + x.dmgBonus : ""}">${dice}${x.dmgBonus ? sg(x.dmgBonus) : ""}<small>${x.beams ? beams(b.level) + " rayon" + (beams(b.level) > 1 ? "s" : "") : DMG[x.ty]}</small></button>` : ""}
    </div>`;
  }).join("");
  const extras = [];
  if (s.sneak) extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Attaque sournoise" data-e="${s.sneak}">Attaque sournoise ${s.sneak}</button>`);
  if (b.cls === "barbare") extras.push(`<span class="chipline">En rage : +${s.rageDmg} aux dégâts de Force</span>`);
  if (b.cls === "guerrier") extras.push(`<button class="rb dmg wide" data-a="rHeal" data-l="Second souffle" data-e="1d10+${b.level}">Second souffle 1d10+${b.level}</button>`);
  if (b.cls === "barde") { const bd = bardDie(b.level); extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Inspiration bardique" data-e="1${bd}">Inspiration ${bd}</button>`); }
  if (b.cls === "clerc" && b.level >= 7 && b.opts.strike === "divine") extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Frappe divine" data-e="${b.level >= 14 ? "2d8" : "1d8"}">Frappe divine ${b.level >= 14 ? "2d8" : "1d8"}</button>`);
  if (b.cls === "druide" && b.level >= 7 && b.opts.strike === "primale") extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Frappe primale" data-e="${b.level >= 15 ? "2d8" : "1d8"}">Frappe primale ${b.level >= 15 ? "2d8" : "1d8"}</button>`);
  if (b.cls === "paladin" && b.level >= 11) extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Frappes radieuses" data-e="1d8">Frappes radieuses +1d8</button>`);
  if (b.cls === "barbare" && b.level >= 9) extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Frappe brutale" data-e="${b.level >= 17 ? "2d10" : "1d10"}">Frappe brutale ${b.level >= 17 ? "2d10" : "1d10"}</button>`);
  if (b.cls === "moine" && b.level >= 6) extras.push(`<button class="rb heal wide" data-a="rHeal" data-l="Plénitude du corps" data-e="${s.maDie}+${s.m.sag}">Plénitude du corps ${s.maDie}${sg(s.m.sag)}</button>`);
  if (b.cls === "rodeur" && b.level >= 10) extras.push(`<button class="rb heal wide" data-a="rHeal" data-l="Infatigable (PV temporaires)" data-e="1d8+${s.m.sag}">Infatigable 1d8${sg(s.m.sag)}</button>`);
  if (b.cls === "clerc" && b.level >= 2) extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Étincelle divine" data-e="1d8+${s.m.sag}">Étincelle divine 1d8${sg(s.m.sag)}</button>`);
  if (b.species === "drakeide") extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Souffle (JS Dex DD ${8 + s.m.con + s.pb})" data-e="${b.level >= 5 ? "2d10" : "1d10"}">Souffle ${b.level >= 5 ? "2d10" : "1d10"} · DD ${8 + s.m.con + s.pb}</button>`);
  if (b.cls === "rodeur" || s.spells.some((x) => x.id === "marquechasseur")) { const hm = b.cls === "rodeur" && b.level >= 20 ? "1d10" : "1d6"; extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Marque du chasseur" data-e="${hm}">Marque du chasseur +${hm}</button>`); }
  if (b.cls === "rodeur" && b.opts.prey === "colosse" && b.level >= 3) extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Tueur de colosses" data-e="1d8">Tueur de colosses +1d8</button>`);
  if (b.cls === "barbare" && b.level >= 3) extras.push(`<button class="rb dmg wide" data-a="rDmg" data-l="Frénésie" data-e="${s.rageDmg}d6">Frénésie ${s.rageDmg}d6</button>`);
  return `<div class="cols">
    <section class="panel"><h3 class="ph">Attaques</h3><p class="mute small">Attaques par action : ${s.apa}${s.crit < 20 ? " · critique sur " + s.crit + "-20" : ""}${b.cls === "moine" ? " · arts martiaux " + s.maDie.slice(1) : ""}</p>
      ${atk}${cantHtml}${extras.length ? `<div class="extras">${extras.join("")}</div>` : ""}</section>
    <section class="panel"><h3 class="ph">Ressources</h3>${s.resources.length ? s.resources.map((r) => resRow(ch, r)).join("") : '<p class="mute small">Aucune ressource limitée.</p>'}
      <div class="hd-row"><div><b>Dés de vie</b><span class="mute small">d${s.hd} · ${b.level - ch.p.hdUsed}/${b.level} restants</span></div><button class="btn small" data-a="spendHD" ${ch.p.hdUsed >= b.level ? "disabled" : ""}>Dépenser un dé</button></div>
      <div class="cond-pick"><span class="lbl">États</span><div class="chips">${CONDITIONS.map((x) => chip(COND_L[x], ch.p.cond.includes(x), "cond", `data-v="${x}"`)).join("")}</div></div>
    </section></div>`;
}
function cantripTier(lvl) { return lvl >= 17 ? 4 : lvl >= 11 ? 3 : lvl >= 5 ? 2 : 1; }
function beams(lvl) { return cantripTier(lvl); }
function scaleCantrip(x, lvl) {
  if (x.beams) return x.dmg; // un dé par rayon
  if (!x.sc) return x.dmg;
  const [n, f] = x.dmg.split("d");
  return (+n * cantripTier(lvl)) + "d" + f;
}

function tabSkills(ch, s) {
  const prof = profSkills(ch.b);
  return `<div class="cols">
  <section class="panel"><h3 class="ph">Compétences</h3><div class="skills">${s.skills.map((k) => `<button class="skill ${k.pr ? "pr" + k.pr : ""}" data-a="r20" data-l="${k.n}" data-m="${k.v}"><i class="dot"></i><span>${k.n}</span><small>${ABIL[k.a].s}</small><b>${sg(k.v)}</b></button>`).join("")}</div>
    <p class="mute small legend"><i class="dot pr1"></i> maîtrisée <i class="dot pr2"></i> expertise</p></section>
  <section class="panel"><h3 class="ph">Sens et maîtrises</h3>
    <dl class="facts"><div><dt>Perception passive</dt><dd>${10 + s.perc}</dd></div>
    <div><dt>Investigation passive</dt><dd>${10 + s.skills.find((x) => x.k === "inve").v}</dd></div>
    <div><dt>Perspicacité passive</dt><dd>${10 + s.skills.find((x) => x.k === "pspi").v}</dd></div>
    ${s.darkvision ? `<div><dt>Vision dans le noir</dt><dd>${fmtM(s.darkvision)}</dd></div>` : ""}
    <div><dt>Armures</dt><dd>${s.profs.armor}</dd></div><div><dt>Armes</dt><dd>${s.profs.weapons}</dd></div>
    <div><dt>Outils</dt><dd>${esc(s.profs.tools)}</dd></div><div><dt>Langues</dt><dd>${s.langs.map(esc).join(", ")}</dd></div></dl>
    ${s.stealthDis ? '<p class="warn">Votre armure impose le désavantage en Discrétion.</p>' : ""}
  </section></div>`;
}

function tabSpells(ch, s) {
  const b = ch.b, p = ch.p, cast = s.casting;
  let slots = "";
  if (cast && cast.slots.type === "std") slots = cast.slots.slots.map((n, i) => {
    const lv = i + 1, used = p.slots[lv] || 0;
    return `<div class="slot-lv"><span class="lbl">Niv. ${lv}</span><div class="pips">${Array.from({ length: n }, (_, j) => `<button class="pip arc ${j < n - used ? "on" : ""}" data-a="slotPip" data-lv="${lv}" data-i="${j}" data-max="${n}" aria-label="Emplacement ${lv}"></button>`).join("")}</div></div>`;
  }).join("");
  if (cast && cast.slots.type === "pact") slots = `<div class="slot-lv"><span class="lbl">Pacte niv. ${cast.slots.lvl}</span><div class="pips">${Array.from({ length: cast.slots.n }, (_, j) => `<button class="pip arc ${j < cast.slots.n - (p.pact || 0) ? "on" : ""}" data-a="pactPip" data-i="${j}" data-max="${cast.slots.n}" aria-label="Emplacement de pacte"></button>`).join("")}</div><span class="mute small">repos court</span></div>`;
  const byLv = {};
  s.spells.forEach((x) => (byLv[x.l] = byLv[x.l] || []).push(x));
  const groups = Object.keys(byLv).sort((a, b2) => a - b2).map((l) => `<p class="lvl-sep">${l == 0 ? "Tours de magie" : "Niveau " + l}</p>` + byLv[l].map((x) => {
    const open = S.openSpell === x.id;
    const dmg = x.dmg ? (x.l === 0 ? scaleCantrip(x, b.level) : x.dmg) + (x.dmgBonus ? (x.dmgBonus > 0 ? "+" : "") + x.dmgBonus : "") : null;
    const heal = x.heal ? x.heal + (x.id === "simulacredevie" ? "" : (x.mod >= 0 ? "+" : "") + x.mod) : null;
    return `<div class="spell-row sheet-spell ${p.conc === x.id ? "conc" : ""}">
      <button class="sr-main" data-a="toggleSpell" data-v="${x.id}" aria-expanded="${open}">
        <span class="sr-name">${x.n}${x.co ? '<i class="tagc" title="Concentration">C</i>' : ""}${x.ri ? '<i class="tagc" title="Rituel">R</i>' : ""}</span>
        <span class="sr-meta">${x.t} · ${x.p}${x.always ? " · " + esc(x.src) : ""}</span>
      </button>
      <div class="sr-acts">
        ${x.atk ? `<button class="rb hit" data-a="r20" data-l="${esc(x.n)} — attaque" data-m="${x.atk}">${sg(x.atk)}</button>` : ""}
        ${x.sv ? `<span class="rb dc">DD ${x.dc}<small>${ABIL[x.sv].s}</small></span>` : ""}
        ${dmg ? `<button class="rb dmg" data-a="rDmg" data-l="${esc(x.n)}" data-e="${dmg}">${dmg}</button>` : ""}
        ${heal ? `<button class="rb heal" data-a="rHeal" data-l="${esc(x.n)}" data-e="${heal}">${heal}</button>` : ""}
        ${x.l > 0 ? `<button class="rb cast" data-a="castOpen" data-v="${x.id}">Lancer</button>` : ""}
      </div>
      ${open ? `<div class="sr-body">${spellDetail(x)}<p class="mute small">Source : ${esc(x.src)} · ${ABIL[x.ab].n} · DD ${x.dc} · attaque ${sg(x.atk)}${x.dmgWhy && x.dmgWhy.length ? " · bonus de dégâts : " + x.dmgWhy.join(", ") : ""}</p></div>` : ""}
    </div>`;
  }).join("")).join("");
  return `<section class="panel">
    ${cast ? `<div class="cast-head"><div><span class="lbl">Caractéristique</span><b>${ABIL[cast.ab].n}</b></div><div><span class="lbl">DD des sorts</span><b>${cast.dc}</b></div><div><span class="lbl">Attaque de sort</span><b>${sg(cast.atk)}</b></div></div><div class="slots">${slots}</div>` : ""}
    ${p.conc ? `<div class="conc-bar">Concentration : <b>${SPELLS[p.conc].n}</b><button class="btn small ghost" data-a="endConc">Terminer</button></div>` : ""}
    ${groups}
  </section>`;
}

function tabInventory(ch) {
  const p = ch.p;
  const rows = p.inv.map((i) => {
    const w = i.ref && i.ref.startsWith("w:") && WEAPONS[i.ref.slice(2)];
    const a = i.ref && i.ref.startsWith("a:") && ARMORS[i.ref.slice(2)];
    const sub = w ? `${w.d} ${DMG[w.t]}${w.p.length ? " · " + w.p.map((x) => WPROP[x]).join(", ") : ""}` : a ? (a.t === "bouclier" ? "+2 CA" : `CA ${a.ac}${a.dex === 99 ? " + Dex" : a.dex ? " + Dex (max 2)" : ""}`) : "";
    return `<div class="item">
      ${w || a ? `<button class="eq ${i.eq ? "on" : ""}" data-a="equip" data-u="${i.uid}" aria-pressed="${i.eq}" title="${i.eq ? "Équipé" : "Équiper"}">${i.eq ? ICON.check : ""}</button>` : '<span class="eq none"></span>'}
      <div class="it-name"><b>${esc(itemName(i))}</b>${sub ? `<span class="mute small">${sub}</span>` : ""}</div>
      <div class="qty"><button class="mini" data-a="qty" data-u="${i.uid}" data-d="-1" aria-label="Moins">−</button><b>${i.q}</b><button class="mini" data-a="qty" data-u="${i.uid}" data-d="1" aria-label="Plus">+</button></div>
    </div>`;
  }).join("");
  const addables = [...Object.entries(WEAPONS).map(([k, w]) => ["w:" + k, w.n + " (arme)"]), ...Object.entries(ARMORS).map(([k, a]) => ["a:" + k, a.n + " (armure)"])].sort((x, y) => x[1].localeCompare(y[1], "fr"));
  return `<div class="cols">
  <section class="panel"><h3 class="ph">Sac</h3>${rows || '<p class="mute">Inventaire vide.</p>'}
    <div class="add-item"><label class="field"><span>Ajouter un objet</span><input id="newItem" placeholder="Ex. Corde de chanvre (15 m)"></label><button class="btn small" data-a="addItem">Ajouter</button></div>
    <div class="add-item"><label class="field"><span>Ajouter une arme ou armure</span><select id="newRef">${addables.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></label><button class="btn small" data-a="addRef">Ajouter</button></div>
  </section>
  <section class="panel"><h3 class="ph">Bourse</h3>
    <div class="gold-row"><b class="gold big">${p.gold} po</b></div>
    <div class="add-item"><label class="field"><span>Montant (po)</span><input id="goldAmt" type="number" inputmode="numeric" placeholder="10"></label><button class="btn small" data-a="gold" data-d="1">Gagner</button><button class="btn small ghost" data-a="gold" data-d="-1">Dépenser</button></div>
    <p class="mute small">Équipez une armure ou un bouclier pour mettre à jour votre CA, et une arme pour l’afficher dans les attaques.</p>
  </section></div>`;
}

function tabTraits(ch, s) {
  const groups = {};
  s.features.forEach((f) => (groups[f.src] = groups[f.src] || []).push(f));
  return `<section class="panel">${Object.entries(groups).map(([src, fs]) => `<p class="lvl-sep">${esc(src)}</p>${fs.map((f) => `<details class="feat"><summary>${esc(f.n)}</summary><p>${esc(f.d)}</p></details>`).join("")}`).join("")}</section>`;
}

function tabNotes(ch) {
  const d = ch.b.details;
  const show = [["Alignement", ALIGN_L[ch.b.align] || ch.b.align], ["Divinité ou foi", d.divinite], ["Âge", d.age], ["Taille et poids", d.taille], ["Apparence", d.apparence], ["Personnalité", d.personnalite], ["Idéaux", d.ideaux], ["Liens", d.liens], ["Défauts", d.defauts], ["Histoire", d.histoire]].filter(([, v]) => v);
  return `<div class="cols"><section class="panel"><h3 class="ph">Notes de partie</h3><textarea id="notes" class="notes" data-pf="notes" rows="12" placeholder="Quêtes, PNJ, indices, trésors…">${esc(ch.p.notes)}</textarea></section>
    <section class="panel"><h3 class="ph">Identité</h3><dl class="facts">${show.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    <div class="row-btns"><button class="btn small ghost" data-a="exportOpen">Exporter</button><button class="btn small ghost danger" data-a="delAsk">${ICON.trash} Supprimer</button></div></section></div>`;
}

/* ---------------- Modales ---------------- */
function viewModal() {
  const m = S.modal, ch = curChar();
  let inner = "";
  const ax = typeof advModal === "function" ? advModal(m) : null;
  if (ax) inner = ax;
  else if (m.k === "hp") {
    const s = compute(ch.b, ch.p);
    inner = `<h3>Points de vie</h3><p class="mute">${ch.p.hp} / ${s.hpMax}${ch.p.temp ? ` · ${ch.p.temp} temporaires` : ""}</p>
      <label class="field big"><span>Montant</span><input id="hpAmt" type="number" inputmode="numeric" placeholder="0" autofocus></label>
      <div class="row-btns"><button class="btn dmgb" data-a="hpApply" data-v="dmg">Dégâts</button><button class="btn healb" data-a="hpApply" data-v="heal">Soins</button><button class="btn ghost" data-a="hpApply" data-v="temp">PV temporaires</button></div>`;
  } else if (m.k === "rest") {
    const s = compute(ch.b, ch.p);
    inner = m.v === "long" ? `<h3>Repos long</h3><p>Vous récupérez tous vos PV, vos dés de vie, vos emplacements de sorts et vos ressources. Les PV temporaires disparaissent.</p><div class="row-btns"><button class="btn primary" data-a="restDo" data-v="long">Se reposer</button><button class="btn ghost" data-a="closeModal">Annuler</button></div>`
      : `<h3>Repos court</h3><p>Une heure de répit. Dépensez des dés de vie pour regagner des PV (d${s.hd} + ${sg(s.m.con)} chacun). ${CLASSES[ch.b.cls].caster === "pact" ? "Vos emplacements de pacte reviennent." : ""}</p>
        <p class="mute">Dés de vie restants : ${ch.b.level - ch.p.hdUsed}/${ch.b.level} · PV ${ch.p.hp}/${s.hpMax}</p>
        <div class="row-btns"><button class="btn" data-a="spendHD" ${ch.p.hdUsed >= ch.b.level ? "disabled" : ""}>Dépenser un dé de vie</button><button class="btn primary" data-a="restDo" data-v="short">Terminer le repos</button></div>`;
  } else if (m.k === "cast") {
    const sp = SPELLS[m.v], s = compute(ch.b, ch.p), cast = s.casting;
    const entry = s.spells.find((x) => x.id === m.v);
    const opts = [];
    if (cast && cast.slots.type === "std") cast.slots.slots.forEach((n, i) => { const lv = i + 1; if (lv >= sp.l) opts.push(`<button class="btn ${n - (ch.p.slots[lv] || 0) > 0 ? "" : "off"}" data-a="castDo" data-v="${m.v}" data-lv="${lv}" ${n - (ch.p.slots[lv] || 0) > 0 ? "" : "disabled"}>Emplacement niv. ${lv} <small>(${n - (ch.p.slots[lv] || 0)}/${n})</small></button>`); });
    if (cast && cast.slots.type === "pact" && cast.slots.lvl >= sp.l) { const left = cast.slots.n - (ch.p.pact || 0); opts.push(`<button class="btn" data-a="castDo" data-v="${m.v}" data-lv="pact" ${left > 0 ? "" : "disabled"}>Emplacement de pacte niv. ${cast.slots.lvl} <small>(${left}/${cast.slots.n})</small></button>`); }
    if (entry && entry.free) { const r = s.resources.find((x) => x.k === entry.free); if (r) { const left = r.max - (ch.p.res[r.k] || 0); opts.push(`<button class="btn ghost" data-a="castDo" data-v="${m.v}" data-lv="free" data-k="${r.k}" ${left > 0 ? "" : "disabled"}>Gratuit <small>(${left}/${r.max} par repos)</small></button>`); } }
    if (sp.ri) opts.push(`<button class="btn ghost" data-a="castDo" data-v="${m.v}" data-lv="ritual">En rituel (+10 minutes, sans emplacement)</button>`);
    inner = `<h3>Lancer ${sp.n}</h3>${spellDetail(sp)}<div class="cast-opts">${opts.join("") || '<p class="mute">Aucun emplacement disponible pour ce sort.</p>'}</div>`;
  } else if (m.k === "del") {
    inner = `<h3>Supprimer ${esc(ch.b.name)} ?</h3><p>Le personnage sera effacé définitivement. Exportez-le d’abord si vous voulez le garder.</p><div class="row-btns"><button class="btn dmgb" data-a="delDo">Supprimer définitivement</button><button class="btn ghost" data-a="closeModal">Annuler</button></div>`;
  } else if (m.k === "export") {
    inner = `<h3>Exporter</h3><p class="mute">Copiez ce texte pour sauvegarder votre personnage ou l’importer sur un autre appareil.</p><textarea id="exportTxt" class="code" rows="8" readonly>${esc(JSON.stringify({ forge: 1, b: ch.b, p: ch.p }))}</textarea><div class="row-btns"><button class="btn primary" data-a="copyExport">Copier</button></div>`;
  } else if (m.k === "import") {
    inner = `<h3>Importer un personnage</h3><p class="mute">Collez le texte exporté depuis Forge des Héros.</p><textarea id="importTxt" class="code" rows="8" placeholder='{"forge":1,…}'></textarea>${m.err ? `<p class="bad">${esc(m.err)}</p>` : ""}<div class="row-btns"><button class="btn primary" data-a="importDo">Importer</button></div>`;
  }
  return `<div class="modal-back" data-a="closeModal"></div><div class="modal" role="dialog" aria-modal="true"><button class="icon-btn mclose" data-a="closeModal" aria-label="Fermer">${ICON.close}</button>${inner}</div>`;
}

/* ---------------- Dés ---------------- */
function viewRollbar() {
  const last = S.log[0];
  return `<div class="rb-inner">
    <div class="advseg" role="group" aria-label="Mode de jet">${[["dis", "Désav."], ["normal", "Normal"], ["adv", "Avantage"]].map(([k, n]) => `<button class="${S.rollMode === k ? "on " + k : ""}" data-a="rollMode" data-v="${k}" aria-pressed="${S.rollMode === k}">${n}</button>`).join("")}</div>
    ${last ? `<button class="last-roll ${last.cls || ""}" data-a="openTray"><span class="lr-label">${esc(last.label)}</span><b>${last.total}</b></button>` : `<span class="mute small hide-s">Touchez un bonus pour lancer</span>`}
    <button class="tray-btn" data-a="openTray" aria-label="Plateau de dés">${ICON.d20}</button>
  </div>`;
}
function viewTray() {
  const dice = [4, 6, 8, 10, 12, 20, 100];
  return `<div class="modal-back" data-a="closeTray"></div><div class="tray" role="dialog" aria-label="Plateau de dés">
    <div class="tray-head"><h3>Plateau de dés</h3><button class="icon-btn" data-a="closeTray" aria-label="Fermer">${ICON.close}</button></div>
    <div class="tray-count"><span class="lbl">Nombre</span><div class="stepper"><button class="mini" data-a="trayN" data-d="-1">−</button><b>${S.trayCount}</b><button class="mini" data-a="trayN" data-d="1">+</button></div></div>
    <div class="dice-grid">${dice.map((f) => `<button class="die" data-a="trayDie" data-f="${f}"><span>d${f}</span></button>`).join("")}</div>
    <div class="add-item"><label class="field"><span>Formule libre</span><input id="trayExpr" value="${esc(S.trayExpr)}" placeholder="Ex. 2d6+3" autocomplete="off"></label><button class="btn" data-a="trayExpr">Lancer</button></div>
    <h4>Historique</h4>
    <div class="log">${S.log.length ? S.log.map(logRow).join("") : '<p class="mute small">Aucun jet pour l’instant.</p>'}</div>
  </div>`;
}
function logRow(r) {
  return `<div class="log-row ${r.cls || ""}"><div><b>${esc(r.label)}</b><span class="mute small">${esc(r.detail)}</span></div><span class="log-total">${r.total}</span></div>`;
}

function pushRoll(r) {
  S.log.unshift(r);
  S.log = S.log.slice(0, 40);
  showRollToast(r);
}
function showRollToast(r) {
  const el = $("#rolltoast");
  el.innerHTML = `<div class="rt ${r.cls || ""}"><span class="rt-label">${esc(r.label)}</span><span class="rt-total">${r.total}</span><span class="rt-detail">${esc(r.detail)}</span>${r.note ? `<span class="rt-note">${esc(r.note)}</span>` : ""}</div>`;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(showRollToast.t);
  showRollToast.t = setTimeout(() => el.classList.remove("show"), 4200);
}
function doD20(label, m, critOn = 20) {
  const r = rollD20(m, S.rollMode);
  let cls = "", note = "";
  if (r.kept >= critOn) { cls = "crit"; note = "Critique !"; }
  else if (r.kept === 1) { cls = "fumble"; note = "Échec critique"; }
  const modeTxt = r.mode === "adv" ? " (avantage)" : r.mode === "dis" ? " (désavantage)" : "";
  pushRoll({ label: label + modeTxt, total: r.total, detail: `d20 [${r.dice.join(", ")}] ${sg(m)}`, cls, note });
}
function doExpr(label, expr, kind) {
  const r = rollExpr(expr);
  if (!r.parts.length && !r.mod) { toast("Formule non reconnue. Exemple : 2d6+3"); return; }
  const detail = r.parts.map((p) => `${p.sgn < 0 ? "−" : ""}${p.r.length}d${p.d} [${p.r.join(", ")}]`).join(" ") + (r.mod ? " " + sg(r.mod) : "");
  pushRoll({ label, total: Math.max(kind === "dmg" || kind === "heal" ? 0 : -999, r.total), detail, cls: kind === "heal" ? "healr" : kind === "dmg" ? "dmgr" : "" });
  return r;
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("show"), 3000);
}

/* ---------------- Actions ---------------- */
function toggleIn(arr, v, max) {
  const i = arr.indexOf(v);
  if (i >= 0) arr.splice(i, 1);
  else if (max == null || arr.length < max) arr.push(v);
  else if (max === 1) { arr.splice(0, 1, v); }
}

function setClass(b, k) {
  if (b.cls === k) return;
  b.cls = k;
  b.skillsClass = []; b.expertise = []; b.skillsLore = []; b.skillPrimal = null;
  b.opts = { style: null, style2: null, order: null, strike: null, dragon: null, mastery: [], inv: [], meta: [], prey: null, land: null, lore2: [], arcanum: {}, asis: b.opts.asis || {}, boon: b.opts.boon || { id: null, a: null } };
  b.cant = []; b.prep = []; b.gear.cls = "A";
  if (b.method !== "points") assignStandard(b);
}

function cleanBuild(b) {
  // retirer les choix devenus invalides après un changement de niveau ou d’option
  const c = CLASSES[b.cls];
  if (!c) return;
  const pool = classSkillPool(b);
  b.skillsClass = b.skillsClass.filter((k) => pool.includes(k)).slice(0, c.skills.n);
  const ex = expertiseCount(b), ep = expertisePool(b);
  b.expertise = b.expertise.filter((k) => ep.includes(k)).slice(0, ex);
  if (c.caster) {
    b.cant = b.cant.slice(0, cantripCount(b));
    const max = maxSpellLevel(b);
    b.prep = b.prep.filter((id) => SPELLS[id] && SPELLS[id].l <= max).slice(0, prepCount(b));
  } else { b.cant = []; b.prep = []; }
  if (c.inv) b.opts.inv = b.opts.inv.filter((k) => INVOCATIONS[k].lv <= b.level).slice(0, c.inv[b.level - 1]);
  b.opts.meta = b.opts.meta.slice(0, metaCount(b));
}

async function act(a, d, el) {
  const b = S.draft, ch = curChar();
  switch (a) {
    /* navigation */
    case "home": S.view = "home"; S.modal = null; S.openSpell = null; if (typeof Live !== "undefined") Live.stop(); break;
    case "new": S.draft = newBuild(); S.editId = null; S.step = 0; S.view = "create"; window.scrollTo(0, 0); break;
    case "open": S.cur = d.id; S.view = "sheet"; S.tab = "actions"; S.openSpell = null; window.scrollTo(0, 0); break;
    case "edit": S.draft = migrate(clone(ch.b)); S.editId = ch.id; S.step = 0; S.view = "create"; window.scrollTo(0, 0); break;
    case "step": S.step = +d.i; S.openSpell = null; window.scrollTo(0, 0); break;
    case "tab": S.tab = d.v; S.openSpell = null; break;
    /* créateur */
    case "setLevel": b.level = +d.v; cleanBuild(b); break;
    case "setClass": setClass(b, d.v); break;
    case "setBg": if (b.bg !== d.v) { b.bg = d.v; b.bonus = { mode: "21", p2: null, p1: null }; const g = BACKGROUNDS[d.v]; if (g.featList) b.magic.bg = { list: g.featList, cant: [], spell: null, ab: g.featList === "mag" ? "int" : "sag" }; const pri = CLASSES[b.cls] ? PRIORITY[b.cls] : ABK; const sorted = g.ab.slice().sort((x, y) => pri.indexOf(x) - pri.indexOf(y)); b.bonus.p2 = sorted[0]; b.bonus.p1 = sorted[1]; b.skillsClass = b.skillsClass.filter((k) => !g.skills.includes(k)); } break;
    case "setSpecies": if (b.species !== d.v) { b.species = d.v; b.sChoice = null; b.skillsSpecies = []; b.humanFeat = null; b.size = d.v === "gnome" || d.v === "halfelin" ? K("Petite") : K("Moyenne"); } break;
    case "setSChoice": b.sChoice = d.v; break;
    case "setSize": b.size = d.v; break;
    case "setSAb": b.sSpellAb = d.v; break;
    case "setMethod": b.method = d.v; if (d.v === "points") ABK.forEach((k) => (b.base[k] = 8)); else if (d.v === "standard") assignStandard(b); else if (d.v === "roll" && b.rolled) assignStandard(b); break;
    case "pb": { const k = d.k, nv = b.base[k] + +d.d; if (nv >= 8 && nv <= 15) b.base[k] = nv; break; }
    case "rollStats": {
      b.rolled = Array.from({ length: 6 }, () => { const r = [1, 2, 3, 4].map(() => rollDie(6)).sort((x, y) => y - x); return r[0] + r[1] + r[2]; });
      assignStandard(b);
      pushRoll({ label: "Tirage des caractéristiques", total: b.rolled.reduce((x, y) => x + y, 0), detail: "4d6 (3 meilleurs) : " + b.rolled.join(", ") });
      break;
    }
    case "recommend": assignStandard(b); break;
    case "setBonusMode": b.bonus.mode = d.v; break;
    case "setP2": b.bonus.p2 = d.v; if (b.bonus.p1 === d.v) b.bonus.p1 = null; break;
    case "setP1": b.bonus.p1 = d.v; break;
    case "setAsiMode": b.opts.asis[d.lv] = { mode: d.v, a: null, b: null }; break;
    case "setAsiA": { const x = asiAt(b, d.lv); x.a = d.v; if (x.b === d.v) x.b = null; break; }
    case "setAsiB": asiAt(b, d.lv).b = d.v; break;
    case "boon": b.opts.boon.id = d.v; break;
    case "boonAb": b.opts.boon.a = d.v; break;
    case "style2": b.opts.style2 = d.v; break;
    case "strike": b.opts.strike = d.v; break;
    case "dragon": b.opts.dragon = d.v; break;
    case "lore2": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.opts.lore2, d.v, 2); break;
    case "arcanum": b.opts.arcanum[d.lv] = b.opts.arcanum[d.lv] === d.v ? null : d.v; break;
    case "levelUp": { const nb = migrate(clone(ch.b)); nb.level = Math.min(MAXLV, nb.level + 1); cleanBuild(nb); S.draft = nb; S.editId = ch.id; const st = stepsFor(nb), iss = issues(nb); const first = st.findIndex((x) => (iss[x.k] || []).length); S.step = first >= 0 ? first : st.length - 1; S.view = "create"; window.scrollTo(0, 0); toast("Niveau " + nb.level + " : complétez les nouveaux choix"); break; }
    case "skClass": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.skillsClass, d.v, CLASSES[b.cls].skills.n); cleanBuild(b); break;
    case "skSpecies": if (el.getAttribute("aria-disabled") === "true" && !b.skillsSpecies.includes(d.v)) { if (SPECIES[b.species].skillPick.n === 1 && !profSkills(b).has(d.v)) { b.skillsSpecies = [d.v]; break; } return; } toggleIn(b.skillsSpecies, d.v, SPECIES[b.species].skillPick.n); break;
    case "skSkilled": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.skilled, d.v, 3); break;
    case "skLore": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.skillsLore, d.v, 3); break;
    case "skPrimal": b.skillPrimal = b.skillPrimal === d.v ? null : d.v; break;
    case "expertise": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.expertise, d.v, expertiseCount(b)); break;
    case "humanFeat": b.humanFeat = d.v; if (d.v === "initie") b.magic.human = { list: "clr", cant: [], spell: null, ab: "sag" }; if (d.v !== "doue" && BACKGROUNDS[b.bg] && BACKGROUNDS[b.bg].feat !== "doue") b.skilled = []; break;
    case "miList": b.magic[d.src] = { list: d.v, cant: [], spell: null, ab: b.magic[d.src].ab }; break;
    case "miAb": b.magic[d.src].ab = d.v; break;
    case "miCant": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.magic[d.src].cant, d.v, 2); break;
    case "miSpell": b.magic[d.src].spell = d.v; break;
    case "order": b.opts.order = d.v; cleanBuild(b); break;
    case "style": b.opts.style = d.v; break;
    case "mastery": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.opts.mastery, d.v, CLASSES[b.cls].mastery); break;
    case "inv": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.opts.inv, d.v, CLASSES[b.cls].inv[b.level - 1]); break;
    case "meta": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.opts.meta, d.v, 2); break;
    case "prey": b.opts.prey = d.v; break;
    case "land": b.opts.land = d.v; break;
    case "lang": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.langs, d.v, 2); break;
    case "pickCant": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.cant, d.v, cantripCount(b)); break;
    case "pickPrep": if (el.getAttribute("aria-disabled") === "true") return; toggleIn(b.prep, d.v, prepCount(b)); break;
    case "spellLvl": S.spellLvl = d.v; break;
    case "toggleSpell": S.openSpell = S.openSpell === d.v ? null : d.v; break;
    case "gearCls": b.gear.cls = d.v; break;
    case "gearBg": b.gear.bg = d.v; break;
    case "align": b.align = d.v; break;
    case "finish": {
      const all = Object.values(issues(b)).flat();
      if (all.length) { toast("Il reste : " + all[0]); return; }
      if (S.editId) {
        const old = S.chars.find((c) => c.id === S.editId);
        const oldMax = compute(old.b, old.p).hpMax;
        const gearChanged = old.b.cls !== b.cls || old.b.bg !== b.bg || old.b.gear.cls !== b.gear.cls || old.b.gear.bg !== b.gear.bg;
        old.b = clone(b);
        if (gearChanged) { const st = startingInventory(b); old.p.inv = st.inv; old.p.gold = st.gold; }
        const newMax = compute(old.b, old.p).hpMax;
        old.p.hp = Math.max(1, Math.min(newMax, old.p.hp + (newMax - oldMax)));
        old.p.hdUsed = Math.min(old.p.hdUsed, b.level);
        await Store.put(old);
        S.cur = old.id;
        toast("Personnage mis à jour");
      } else {
        const chNew = { id: b.id, b: clone(b), p: newPlay(b) };
        S.chars.push(chNew);
        await Store.put(chNew);
        S.cur = chNew.id;
        toast(b.name + " est prêt à partir à l’aventure");
      }
      S.view = "sheet"; S.tab = "actions"; S.draft = null; window.scrollTo(0, 0);
      break;
    }
    /* fiche */
    case "hpModal": S.modal = { k: "hp" }; render(); setTimeout(() => { const i = $("#hpAmt"); i && i.focus(); }, 30); return;
    case "hpQuick": { const s = compute(ch.b, ch.p); if (+d.v < 0) applyDamage(ch, 1); else ch.p.hp = Math.min(s.hpMax, ch.p.hp + 1); if (ch.p.hp > 0) ch.p.ds = { s: 0, f: 0 }; saveSoon(ch); break; }
    case "hpApply": {
      const n = Math.abs(parseInt($("#hpAmt").value, 10) || 0);
      if (!n) { toast("Saisissez un nombre de points de vie."); return; }
      const s = compute(ch.b, ch.p);
      if (d.v === "dmg") applyDamage(ch, n);
      if (d.v === "heal") { ch.p.hp = Math.min(s.hpMax, Math.max(0, ch.p.hp) + n); ch.p.ds = { s: 0, f: 0 }; }
      if (d.v === "temp") ch.p.temp = Math.max(ch.p.temp, n);
      S.modal = null; saveSoon(ch); break;
    }
    case "insp": ch.p.insp = !ch.p.insp; saveSoon(ch); break;
    case "ds": { const k = d.k, i = +d.i; ch.p.ds[k] = ch.p.ds[k] === i + 1 ? i : i + 1; saveSoon(ch); break; }
    case "deathRoll": {
      const r = rollD20(0, "normal"), v = r.kept;
      let note = "";
      if (v === 20) { ch.p.hp = 1; ch.p.ds = { s: 0, f: 0 }; note = "20 naturel : vous revenez à 1 PV !"; }
      else if (v === 1) { ch.p.ds.f = Math.min(3, ch.p.ds.f + 2); note = "1 naturel : deux échecs"; }
      else if (v >= 10) ch.p.ds.s = Math.min(3, ch.p.ds.s + 1); else ch.p.ds.f = Math.min(3, ch.p.ds.f + 1);
      if (ch.p.ds.s >= 3) note = "Trois réussites : vous êtes stable.";
      if (ch.p.ds.f >= 3) note = "Trois échecs : votre personnage meurt.";
      pushRoll({ label: "Jet contre la mort", total: v, detail: v >= 10 ? "réussite" : "échec", cls: v >= 10 ? "healr" : "dmgr", note });
      saveSoon(ch); break;
    }
    case "cond": toggleIn(ch.p.cond, d.v); saveSoon(ch); break;
    case "resPip": { const s = compute(ch.b, ch.p), r = s.resources.find((x) => x.k === d.k), left = r.max - (ch.p.res[d.k] || 0), i = +d.i; ch.p.res[d.k] = i < left ? r.max - i : r.max - i - 1; ch.p.res[d.k] = Math.max(0, Math.min(r.max, ch.p.res[d.k])); saveSoon(ch); break; }
    case "resPool": { const s = compute(ch.b, ch.p), r = s.resources.find((x) => x.k === d.k); ch.p.res[d.k] = Math.max(0, Math.min(r.max, (ch.p.res[d.k] || 0) + +d.d)); saveSoon(ch); break; }
    case "slotPip": { const lv = d.lv, max = +d.max, i = +d.i, left = max - (ch.p.slots[lv] || 0); ch.p.slots[lv] = i < left ? max - i : max - i - 1; ch.p.slots[lv] = Math.max(0, Math.min(max, ch.p.slots[lv])); saveSoon(ch); break; }
    case "pactPip": { const max = +d.max, i = +d.i, left = max - (ch.p.pact || 0); ch.p.pact = Math.max(0, Math.min(max, i < left ? max - i : max - i - 1)); saveSoon(ch); break; }
    case "spendHD": {
      if (ch.p.hdUsed >= ch.b.level) return;
      const s = compute(ch.b, ch.p);
      const r = rollExpr("1d" + s.hd);
      const gain = Math.max(1, r.total + s.m.con);
      ch.p.hdUsed += 1; ch.p.hp = Math.min(s.hpMax, Math.max(0, ch.p.hp) + gain);
      pushRoll({ label: "Dé de vie", total: gain, detail: `d${s.hd} [${r.parts[0].r[0]}] ${sg(s.m.con)}`, cls: "healr" });
      saveSoon(ch); break;
    }
    case "rest": S.modal = { k: "rest", v: d.v }; break;
    case "restDo": restDo(ch, d.v); S.modal = null; toast(d.v === "long" ? "Repos long terminé. Ressources restaurées." : "Repos court terminé."); saveSoon(ch); break;
    case "castOpen": S.modal = { k: "cast", v: d.v }; break;
    case "castDo": {
      const sp = SPELLS[d.v];
      if (d.lv === "pact") ch.p.pact = (ch.p.pact || 0) + 1;
      else if (d.lv === "free") ch.p.res[d.k] = (ch.p.res[d.k] || 0) + 1;
      else if (d.lv !== "ritual") ch.p.slots[d.lv] = (ch.p.slots[d.lv] || 0) + 1;
      if (sp.co) ch.p.conc = d.v;
      S.modal = null;
      toast(`${sp.n} lancé${d.lv === "ritual" ? " en rituel" : ""}${sp.co ? " · concentration" : ""}`);
      saveSoon(ch); break;
    }
    case "endConc": ch.p.conc = null; saveSoon(ch); break;
    case "equip": {
      const it = ch.p.inv.find((i) => i.uid === d.u);
      if (!it) return;
      const isBody = it.ref.startsWith("a:") && it.ref !== "a:bouclier";
      if (!it.eq && isBody) ch.p.inv.forEach((i) => { if (i.ref.startsWith("a:") && i.ref !== "a:bouclier") i.eq = false; });
      it.eq = !it.eq; saveSoon(ch); break;
    }
    case "qty": { const it = ch.p.inv.find((i) => i.uid === d.u); it.q += +d.d; if (it.q <= 0) ch.p.inv = ch.p.inv.filter((i) => i.uid !== d.u); saveSoon(ch); break; }
    case "addItem": { const v = $("#newItem").value.trim(); if (!v) { toast("Saisissez le nom de l’objet."); return; } ch.p.inv.push({ uid: uid(), ref: null, n: v, q: 1, eq: false }); saveSoon(ch); break; }
    case "addRef": { const v = $("#newRef").value; const it = itemFrom([v, 1]); ch.p.inv.push(it); saveSoon(ch); toast(itemName(it) + " ajouté"); break; }
    case "gold": { const n = Math.abs(parseInt($("#goldAmt").value, 10) || 0); if (!n) { toast("Saisissez un montant."); return; } ch.p.gold = Math.max(0, ch.p.gold + n * +d.d); saveSoon(ch); break; }
    case "delAsk": S.modal = { k: "del" }; break;
    case "delDo": if (ch.adv && typeof FB !== "undefined" && FB.ok) { try { await FB.members(ch.adv).doc(FB.uid + "_" + ch.id).delete(); } catch (e) { } } await Store.del(ch.id); S.chars = S.chars.filter((c) => c.id !== ch.id); S.modal = null; S.view = "home"; toast("Personnage supprimé"); break;
    case "exportOpen": S.modal = { k: "export" }; break;
    case "copyExport": { const t = $("#exportTxt"); try { await navigator.clipboard.writeText(t.value); toast("Copié dans le presse-papiers"); } catch (e) { t.focus(); t.select(); toast("Sélectionné : copiez avec Ctrl+C ou un appui long"); } return; }
    case "importOpen": S.modal = { k: "import" }; break;
    case "importDo": {
      try {
        const o = JSON.parse($("#importTxt").value);
        if (!o || !o.b || !o.p || !CLASSES[o.b.cls]) throw new Error();
        o.b.id = uid(); migrate(o.b); delete o.adv;
        const chNew = { id: o.b.id, b: o.b, p: o.p };
        S.chars.push(chNew); await Store.put(chNew);
        S.modal = null; S.cur = chNew.id; S.view = "sheet"; toast(o.b.name + " importé");
      } catch (e) { S.modal = { k: "import", err: "Ce texte n’est pas un export valide de Forge des Héros." }; }
      break;
    }
    case "closeModal": S.modal = null; break;
    /* dés */
    case "rollMode": S.rollMode = d.v; break;
    case "r20": doD20(d.l, +d.m, d.crit ? +d.crit : 20); break;
    case "rDmg": doExpr(d.l, d.e, "dmg"); break;
    case "rHeal": doExpr(d.l, d.e, "heal"); break;
    case "openTray": S.tray = true; break;
    case "closeTray": S.tray = false; break;
    case "trayN": S.trayCount = Math.max(1, Math.min(20, S.trayCount + +d.d)); break;
    case "trayDie": {
      const f = +d.f;
      if (f === 20 && S.trayCount === 1) doD20("d20", 0);
      else doExpr(`${S.trayCount}d${f}`, `${S.trayCount}d${f}`);
      break;
    }
    case "trayExpr": { const v = $("#trayExpr").value.trim(); S.trayExpr = v; if (v) doExpr(v, v); break; }
    default: if (typeof advAct === "function" && (await advAct(a, d, el))) break; return;
  }
  render();
}

function applyDamage(ch, n) {
  let rest = n;
  if (ch.p.temp) { const t = Math.min(ch.p.temp, rest); ch.p.temp -= t; rest -= t; }
  ch.p.hp = Math.max(0, ch.p.hp - rest);
  if (ch.p.hp === 0 && ch.p.conc) ch.p.conc = null;
}
function restDo(ch, kind) {
  const s = compute(ch.b, ch.p);
  if (kind === "long") {
    ch.p.hp = s.hpMax; ch.p.temp = 0; ch.p.hdUsed = 0; ch.p.slots = {}; ch.p.pact = 0; ch.p.res = {}; ch.p.ds = { s: 0, f: 0 }; ch.p.conc = null;
    if (ch.b.species === "humain") ch.p.insp = true;
  } else {
    ch.p.pact = 0;
    s.resources.forEach((r) => {
      if (r.reset === "short") ch.p.res[r.k] = 0;
      if (r.reset === "short1") ch.p.res[r.k] = Math.max(0, (ch.p.res[r.k] || 0) - 1);
    });
  }
}

function refreshCreateMeta() {
  const b = S.draft, iss = issues(b), st = stepsFor(b)[S.step], all = Object.values(iss).flat();
  const fin = $('[data-a="finish"]');
  if (fin) { if (all.length) fin.setAttribute("aria-disabled", "true"); else fin.removeAttribute("aria-disabled"); }
  const head = $(".step-head p");
  if (head) head.outerHTML = (iss[st.k] || []).length ? `<p class="todo">À compléter : ${iss[st.k].map(esc).join(" · ")}</p>` : `<p class="ok">${ICON.check} Étape complète</p>`;
  const bottom = $(".step-main > .todo.center");
  if (bottom) { if (all.length) bottom.textContent = "Il reste : " + all.join(" · "); else bottom.remove(); }
}

/* ---------------- Événements ---------------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-a]");
  if (!t) return;
  if (t.matches(".modal-back") && e.target !== t) return;
  e.preventDefault();
  act(t.dataset.a, t.dataset, t);
});
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.f && S.draft) {
    const path = t.dataset.f.split(".");
    let o = S.draft;
    for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
    o[path[path.length - 1]] = t.value;
    if (t.dataset.f === "name") {
      const sum = $(".summary"); if (sum) sum.innerHTML = viewSummary(S.draft);
      const tb = $(".tb-title strong"); if (tb) tb.textContent = t.value || "Héros sans nom";
      refreshCreateMeta();
    }
  }
  if (t.dataset.pf) { const ch = curChar(); if (ch) { ch.p[t.dataset.pf] = t.value; saveSoon(ch); } }
  if (t.id === "trayExpr") S.trayExpr = t.value;
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.swap && S.draft) {
    const k = t.dataset.swap, v = +t.value, b = S.draft;
    const other = ABK.find((x) => x !== k && b.base[x] === v);
    if (other) b.base[other] = b.base[k];
    b.base[k] = v;
    render();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && (S.modal || S.tray)) { S.modal = null; S.tray = false; render(); }
  if (e.key === "Enter" && e.target.id === "hpAmt") act("hpApply", { v: "dmg" });
  if (e.key === "Enter" && e.target.id === "trayExpr") act("trayExpr", {});
});

/* ---------------- Démarrage ---------------- */
async function boot() {
  render();
  await Store.init();
  S.chars = (await Store.all()).map((c) => { migrate(c.b); return c; });
  S.loaded = true;
  if (!S.chars.length && !(await Store.seeded())) {
    // personnage d’exemple pour découvrir la fiche
    const ex = exampleCharacter();
    ex.example = true;
    S.chars.push(ex);
    await Store.put(ex);
    await Store.markSeeded();
  }
  render();
  if (typeof FB !== "undefined") FB.init().then(() => { if (FB.ok) { S.chars.filter((c) => c.adv).forEach((c) => pushMember(c)); render(); if (typeof accountStart === "function") accountStart(); } else if (FB.err) render(); });
}
function exampleCharacter() {
  const b = newBuild();
  Object.assign(b, { name: "Ysolde (exemple)", level: 3, cls: "clerc", species: "nain", bg: "acolyte", langs: [K("Nain"), K("Draconique")], align: K("Loyal bon") });
  b.bonus = { mode: "21", p2: "sag", p1: "cha" };
  assignStandard(b);
  b.skillsClass = ["mede", "hist"];
  b.opts.order = "protecteur";
  b.magic.bg = { list: "clr", cant: ["assistance", "lumiere"], spell: "benediction", ab: "sag" };
  b.cant = ["flammesacree", "thaumaturgie", "epargnermourants"];
  b.prep = ["eclairtracant", "motguerison", "bouclierfoi", "armespirituelle", "silence", "injonction"];
  b.details.apparence = "Tresses grises, armure gravée de runes de la forge.";
  b.details.histoire = "Gardienne d’un temple de montagne, partie à la recherche d’une relique volée. Ceci est un personnage d’exemple : modifiez-le ou supprimez-le.";
  const p = newPlay(b);
  p.inv.push({ uid: uid(), ref: "a:cottemailles", n: "Cotte de mailles", q: 1, eq: true });
  p.inv.forEach((i) => { if (i.ref === "a:chemise") i.eq = false; });
  return { id: b.id, b, p };
}
