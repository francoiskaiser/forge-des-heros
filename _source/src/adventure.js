/* Forge des Héros — aventures partagées (Firebase) et écran du maître du jeu */

const FB = {
  ok: false, db: null, auth: null, err: null,
  get uid() { return this.auth && this.auth.currentUser ? this.auth.currentUser.uid : null; },
  async init() {
    if (typeof firebase === "undefined" || typeof FIREBASE_CONFIG === "undefined" || !FIREBASE_CONFIG || !FIREBASE_CONFIG.apiKey) return;
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      // reprend la session existante (compte ou anonyme), sinon crée une session anonyme
      const user = await new Promise((res) => { const off = this.auth.onAuthStateChanged((u) => { off(); res(u); }); });
      if (!user) await this.auth.signInAnonymously();
      this.ok = true;
    } catch (e) { this.err = e && e.message; }
  },
  adv(code) { return this.db.collection("adventures").doc(code); },
  members(code) { return this.adv(code).collection("members"); },
};

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newCode() { let c = ""; for (let i = 0; i < 6; i++) c += CODE_CHARS[rollDie(CODE_CHARS.length) - 1]; return c.slice(0, 3) + "-" + c.slice(3); }
function normCode(v) { const c = String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); return c.length === 6 ? c.slice(0, 3) + "-" + c.slice(3) : null; }

/* Aventures dont je suis le MJ (mémorisées localement + requête Firestore) */
const GmList = {
  get() { try { return JSON.parse(localStorage.getItem("forge-gm") || "[]"); } catch (e) { return []; } },
  add(code, name) { const l = this.get().filter((x) => x.code !== code); l.unshift({ code, name }); try { localStorage.setItem("forge-gm", JSON.stringify(l)); } catch (e) { } },
  remove(code) { try { localStorage.setItem("forge-gm", JSON.stringify(this.get().filter((x) => x.code !== code))); } catch (e) { } },
};

/* Écoute en direct d’une aventure (une seule à la fois) */
const Live = {
  code: null, doc: null, members: [], unsub: [],
  watch(code) {
    if (this.code === code) return;
    this.stop();
    if (!FB.ok || !code) return;
    this.code = code;
    this.unsub.push(FB.adv(code).onSnapshot((d) => { this.doc = d.exists ? d.data() : null; liveRender(); }, () => { }));
    this.unsub.push(FB.members(code).onSnapshot((q) => { this.members = q.docs.map((d) => ({ id: d.id, ...d.data() })); liveRender(); }, () => { }));
  },
  stop() { this.unsub.forEach((u) => u()); this.unsub = []; this.code = null; this.doc = null; this.members = []; },
};
let pendingRender = false;
function liveRender() {
  const a = document.activeElement;
  if (a && (a.tagName === "TEXTAREA" || (a.tagName === "INPUT" && a.type !== "checkbox"))) { pendingRender = true; return; }
  render();
}
document.addEventListener("focusout", () => { if (pendingRender) { pendingRender = false; setTimeout(render, 0); } });

/* Synchronisation du personnage d’un joueur */
const pushTimers = {};
function pushMember(ch) {
  if (!FB.ok || !ch.adv) return;
  clearTimeout(pushTimers[ch.id]);
  pushTimers[ch.id] = setTimeout(() => {
    FB.members(ch.adv).doc(FB.uid + "_" + ch.id).set({ uid: FB.uid, charId: ch.id, name: ch.b.name, b: clone(ch.b), p: clone(ch.p), updated: Date.now() })
      .catch(() => toast("Synchronisation avec l’aventure impossible pour l’instant."));
  }, 700);
}

/* ---------- Onglet Aventure de la fiche joueur ---------- */
function hpBar(hp, max) {
  const pct = Math.max(0, Math.min(100, (hp / Math.max(1, max)) * 100));
  const tone = hp <= 0 ? "out" : pct <= 50 ? "low" : "ok";
  return `<div class="mhp ${tone}"><i style="width:${pct}%"></i></div>`;
}
function memberStats(m) {
  try { migrate(m.b); return compute(m.b, m.p); } catch (e) { return null; }
}
function initOrder(doc) {
  const it = (doc && doc.init) || { list: [], turn: 0, round: 1 };
  const list = (it.list || []).slice().sort((a, b) => b.v - a.v || (b.dex || 0) - (a.dex || 0));
  return { list, turn: Math.min(it.turn || 0, Math.max(0, list.length - 1)), round: it.round || 1 };
}

function tabAdventure(ch) {
  if (!FB.ok) return `<section class="panel"><p class="mute">Le mode aventure n’est pas disponible dans cette version de l’app.</p></section>`;
  if (!ch.adv) {
    return `<section class="panel adv-join"><h3 class="ph">Rejoindre une aventure</h3>
      <p class="mute">Entrez le code donné par votre maître du jeu. Votre fiche sera partagée avec lui et se mettra à jour automatiquement pendant la partie.</p>
      <div class="add-item"><label class="field"><span>Code d’aventure</span><input id="joinCode" placeholder="Ex. DRG-7K2" autocomplete="off" autocapitalize="characters" maxlength="7"></label><button class="btn primary" data-a="advJoin">Rejoindre</button></div>
    </section>`;
  }
  Live.watch(ch.adv);
  const doc = Live.doc;
  const ord = initOrder(doc);
  const mem = Live.members.map((m) => ({ m, s: memberStats(m) })).filter((x) => x.s);
  return `<div class="cols">
    <section class="panel"><div class="adv-head"><div><span class="eyebrow">Aventure</span><h3 class="ph">${esc(doc ? doc.name : "Chargement…")}</h3></div><span class="code-chip">${esc(ch.adv)}</span></div>
      <p class="lbl">Le groupe</p>
      <div class="party-mini">${mem.length ? mem.map(({ m, s }) => `<div class="pm ${m.charId === ch.id ? "me" : ""}"><div class="pm-top"><b>${esc(m.name)}</b><span class="mute small">${CLASSES[m.b.cls] ? CLASSES[m.b.cls].n : ""} ${m.b.level}</span></div>${hpBar(m.p.hp, s.hpMax)}<span class="mute small">${m.p.hp}/${s.hpMax} PV${m.p.cond && m.p.cond.length ? " · " + m.p.cond.map((x) => esc(COND_L[x] || x)).join(", ") : ""}</span></div>`).join("") : '<p class="mute small">Personne pour l’instant.</p>'}</div>
      <div class="row-btns"><button class="btn small ghost danger" data-a="advLeave">Quitter l’aventure</button></div>
    </section>
    <section class="panel"><h3 class="ph">Initiative</h3>
      ${ord.list.length ? `<p class="mute small">Round ${ord.round}</p><ol class="init-ro">${ord.list.map((e, i) => `<li class="${i === ord.turn ? "now" : ""} ${e.kind}"><span class="iv">${e.v}</span><b>${esc(e.name)}</b>${i === ord.turn ? '<span class="turn-tag">à son tour</span>' : ""}</li>`).join("")}</ol>` : '<p class="mute small">Le MJ n’a pas encore lancé de combat.</p>'}
    </section></div>`;
}

/* ---------- Accueil : section maître du jeu ---------- */
function homeAdventures() {
  if (!FB.ok) return FB.err ? `<p class="legal">Mode aventure indisponible : ${esc(FB.err)}</p>` : "";
  const list = GmList.get();
  return `${typeof accountNudge === "function" ? accountNudge() : ""}<section class="gm-home">
    <div class="gm-home-head"><div><h2>Maître du jeu</h2><p class="mute small">Créez une aventure, donnez le code à vos joueurs et suivez le groupe en direct.</p></div>
    <button class="btn" data-a="advCreateOpen">${ICON.plus} Créer une aventure</button></div>
    ${list.length ? `<div class="hero-grid">${list.map((x) => `<button class="hero-card gm" data-a="gmOpen" data-code="${esc(x.code)}"><span class="sigil">MJ</span><span class="hc-body"><span class="hc-name">${esc(x.name)}</span><span class="hc-line">Code ${esc(x.code)}</span></span></button>`).join("")}</div>` : ""}
  </section>`;
}

/* ---------- Écran du maître du jeu ---------- */
function viewGM() {
  const code = S.gmCode;
  Live.watch(code);
  const doc = Live.doc;
  if (doc && doc.gm !== FB.uid) return `<header class="topbar"><button class="icon-btn" data-a="home" aria-label="Retour">${ICON.back}</button><div class="tb-title"><strong>Accès refusé</strong></div></header><main class="sheet"><p class="mute">Seul le maître du jeu qui a créé cette aventure peut ouvrir cet écran, depuis l’appareil où il l’a créée.</p></main>`;
  const tabs = [["groupe", "Groupe"], ["init", "Initiative"], ["notes", "Notes"]];
  const body = { groupe: gmParty, init: gmInit, notes: gmNotes }[S.gmTab || "groupe"](doc);
  return `<header class="topbar">
    <button class="icon-btn" data-a="home" aria-label="Retour">${ICON.back}</button>
    <div class="tb-title"><strong>${esc(doc ? doc.name : "Chargement…")}</strong><span class="eyebrow">Écran du maître du jeu</span></div>
    <button class="code-chip big" data-a="copyCode" title="Copier le code">${esc(code)}</button>
  </header>
  <main class="sheet">
    <nav class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" class="tab ${(S.gmTab || "groupe") === k ? "on" : ""}" data-a="gmTab" data-v="${k}">${n}</button>`).join("")}</nav>
    <section class="tab-body">${body}</section>
  </main>`;
}

function gmParty() {
  const mem = Live.members.map((m) => ({ m, s: memberStats(m) })).filter((x) => x.s).sort((a, b) => a.m.name.localeCompare(b.m.name, "fr"));
  if (!mem.length) return `<section class="panel empty-state"><h3 class="ph">En attente des joueurs</h3><p>Donnez le code <b class="code-inline">${esc(S.gmCode)}</b> à vos joueurs. Dans leur fiche, onglet <b>Aventure</b>, ils l’entrent pour rejoindre le groupe.</p></section>`;
  const totalHp = mem.reduce((t, x) => t + Math.max(0, x.m.p.hp), 0), totalMax = mem.reduce((t, x) => t + x.s.hpMax, 0);
  return `<div class="party-sum"><span><b>${mem.length}</b> personnage${mem.length > 1 ? "s" : ""}</span><span>PV du groupe <b>${totalHp}/${totalMax}</b></span><span>Perception passive max <b>${Math.max(...mem.map((x) => 10 + x.s.perc))}</b></span></div>
  <div class="party-grid">${mem.map(({ m, s }) => {
    const b = m.b, p = m.p, c = CLASSES[b.cls], sp = SPECIES[b.species];
    const slots = s.casting ? (s.casting.slots.type === "std" ? s.casting.slots.slots.map((n, i) => `<span class="sl"><small>${i + 1}</small>${n - ((p.slots || {})[i + 1] || 0)}/${n}</span>`).join("") : `<span class="sl"><small>P${s.casting.slots.lvl}</small>${s.casting.slots.n - (p.pact || 0)}/${s.casting.slots.n}</span>`) : "";
    const down = p.hp <= 0;
    return `<article class="pcard ${down ? "down" : ""}">
      <div class="pc-top"><span class="sigil">${classSigil(b.cls)}</span><div class="pc-id"><b>${esc(b.name)}</b><span class="mute small">${sp ? sp.n : ""} · ${c ? c.n : ""} ${b.level}</span></div>${p.insp ? '<span class="insp-dot" title="Inspiration héroïque">★</span>' : ""}</div>
      <div class="pc-hp"><div class="pc-hpnum"><b>${p.hp}</b>/${s.hpMax}${p.temp ? ` <span class="temp">+${p.temp}</span>` : ""}</div>${hpBar(p.hp, s.hpMax)}</div>
      <div class="pc-stats"><div><span class="lbl">CA</span><b>${s.ac}</b></div><div><span class="lbl">Init.</span><b>${sg(s.init)}</b></div><div><span class="lbl">Perc.</span><b>${10 + s.perc}</b></div><div><span class="lbl">Vit.</span><b>${fmtM(s.speed)}</b></div>${s.casting ? `<div><span class="lbl">DD</span><b>${s.casting.dc}</b></div>` : ""}</div>
      ${down ? `<p class="pc-alert">À terre · réussites ${p.ds ? p.ds.s : 0}/3 · échecs ${p.ds ? p.ds.f : 0}/3</p>` : ""}
      ${p.cond && p.cond.length ? `<div class="pc-cond">${p.cond.map((x) => `<span>${esc(COND_L[x] || x)}</span>`).join("")}</div>` : ""}
      ${p.conc && SPELLS[p.conc] ? `<p class="pc-conc">Concentration : ${SPELLS[p.conc].n}</p>` : ""}
      ${slots ? `<div class="pc-slots">${slots}</div>` : ""}
      <button class="btn small ghost" data-a="gmDetail" data-id="${esc(m.id)}">Voir la fiche</button>
    </article>`;
  }).join("")}</div>`;
}

function gmDetailModal(m) {
  const s = memberStats(m);
  if (!s) return "<p>Fiche illisible.</p>";
  const b = m.b, p = m.p;
  const byLv = {};
  s.spells.forEach((x) => (byLv[x.l] = byLv[x.l] || []).push(x.n));
  return `<h3>${esc(b.name)}</h3><p class="mute">${SPECIES[b.species].n} · ${CLASSES[b.cls].n} ${b.level}${s.sub ? " · " + esc(s.sub) : ""} · ${esc(ALIGN_L[b.align] || b.align)}</p>
    <div class="ro-abil">${ABK.map((k) => { const sv = s.saves.find((x) => x.k === k); return `<div><span class="lbl">${ABIL[k].s}</span><b>${sg(s.m[k])}</b><small>${s.ab[k]} · JS ${sg(sv.v)}${sv.pr ? "●" : ""}</small></div>`; }).join("")}</div>
    <dl class="facts"><div><dt>PV</dt><dd>${p.hp}/${s.hpMax}${p.temp ? " (+" + p.temp + " temp.)" : ""} · dés de vie ${b.level - (p.hdUsed || 0)}/${b.level}</dd></div>
      <div><dt>Défense</dt><dd>CA ${s.ac} (${esc(s.acNote)}) · initiative ${sg(s.init)} · vitesse ${fmtM(s.speed)}</dd></div>
      <div><dt>Sens</dt><dd>Perception passive ${10 + s.perc}${s.darkvision ? " · vision dans le noir " + fmtM(s.darkvision) : ""}</dd></div>
      <div><dt>Compétences maîtrisées</dt><dd>${s.skills.filter((k) => k.pr).map((k) => k.n + " " + sg(k.v) + (k.pr === 2 ? " (exp.)" : "")).join(", ") || "—"}</dd></div>
      <div><dt>Attaques</dt><dd>${s.attacks.map((a) => `${esc(a.n)} ${sg(a.hit)} (${esc(a.dmg)})`).join(" · ")}</dd></div>
      ${s.casting ? `<div><dt>Sorts</dt><dd>DD ${s.casting.dc} · attaque ${sg(s.casting.atk)}</dd></div>` : ""}
      ${Object.keys(byLv).sort((x, y) => x - y).map((l) => `<div><dt>${l == 0 ? "Tours de magie" : "Niveau " + l}</dt><dd>${byLv[l].join(", ")}</dd></div>`).join("")}
      <div><dt>Ressources</dt><dd>${s.resources.map((r) => `${r.n} ${r.max - ((p.res || {})[r.k] || 0)}/${r.max}`).join(" · ") || "—"}</dd></div>
      <div><dt>Inventaire</dt><dd>${(p.inv || []).map((i) => (i.q > 1 ? i.q + "× " : "") + esc(itemName(i)) + (i.eq ? " ✓" : "")).join(", ")} · ${p.gold} po</dd></div>
      <div><dt>Langues</dt><dd>${s.langs.map(esc).join(", ")}</dd></div>
      ${b.details.divinite ? `<div><dt>Divinité ou foi</dt><dd>${esc(b.details.divinite)}</dd></div>` : ""}
      ${b.details.histoire ? `<div><dt>Histoire</dt><dd>${esc(b.details.histoire)}</dd></div>` : ""}
      ${p.notes ? `<div><dt>Notes du joueur</dt><dd>${esc(p.notes)}</dd></div>` : ""}
    </dl>
    <details class="feat"><summary>Aptitudes (${s.features.length})</summary><div class="ro-feats">${s.features.map((f) => `<p><b>${esc(f.n)}</b> — ${esc(f.d)}</p>`).join("")}</div></details>
    <div class="row-btns"><button class="btn small ghost danger" data-a="gmKick" data-id="${esc(m.id)}">Retirer du groupe</button></div>`;
}

function gmInit(doc) {
  const ord = initOrder(doc);
  const memById = {};
  Live.members.forEach((m) => (memById[m.id] = m));
  const rows = ord.list.map((e, i) => {
    let hp = "";
    if (e.kind === "pc" && memById[e.ref]) { const m = memById[e.ref], s = memberStats(m); if (s) hp = `<span class="ihp">${m.p.hp}/${s.hpMax}</span>${hpBar(m.p.hp, s.hpMax)}`; }
    if (e.kind === "monstre") hp = `<span class="ihp">${e.hp}/${e.max}</span>${hpBar(e.hp, e.max)}<div class="ihp-btns"><button class="mini dmg" data-a="monHp" data-id="${e.id}" data-d="-1" aria-label="Dégâts">−</button><input class="mon-amt" id="mon-${e.id}" type="number" inputmode="numeric" placeholder="PV"><button class="mini heal" data-a="monHp" data-id="${e.id}" data-d="1" aria-label="Soins">+</button></div>`;
    return `<li class="irow ${i === ord.turn ? "now" : ""} ${e.kind} ${e.kind === "monstre" && e.hp <= 0 ? "dead" : ""}">
      <div class="iv-ctl"><button class="mini" data-a="initAdj" data-id="${e.id}" data-d="1" aria-label="Augmenter">▲</button><span class="iv">${e.v}</span><button class="mini" data-a="initAdj" data-id="${e.id}" data-d="-1" aria-label="Diminuer">▼</button></div>
      <div class="i-main"><b>${esc(e.name)}</b>${e.kind === "monstre" ? `<span class="mute small">CA ${e.ac}</span>` : ""}<div class="i-hp">${hp}</div></div>
      <button class="icon-btn" data-a="initDel" data-id="${e.id}" aria-label="Retirer">${ICON.close}</button>
    </li>`;
  }).join("");
  return `<div class="cols">
    <section class="panel"><div class="adv-head"><h3 class="ph">Ordre de combat</h3>${ord.list.length ? `<span class="mute">Round <b>${ord.round}</b></span>` : ""}</div>
      ${ord.list.length ? `<ol class="init-list">${rows}</ol><div class="row-btns"><button class="btn primary" data-a="initNext">Tour suivant →</button><button class="btn ghost" data-a="initPrev">← Précédent</button><button class="btn ghost danger" data-a="initClear">Terminer le combat</button></div>` : '<p class="mute">Aucun combat en cours. Lancez l’initiative du groupe et ajoutez des monstres.</p>'}
    </section>
    <section class="panel"><h3 class="ph">Préparer le combat</h3>
      <button class="btn" data-a="initParty">${ICON.d20} Lancer l’initiative du groupe</button>
      <p class="mute small">Lance d20 + initiative pour chaque personnage du groupe et remplace leurs entrées.</p>
      <h4>Ajouter des monstres</h4>
      <label class="field"><span>Nom</span><input id="monName" placeholder="Ex. Gobelin"></label>
      <div class="mon-grid">
        <label class="field"><span>Nombre</span><input id="monN" type="number" inputmode="numeric" value="1" min="1" max="20"></label>
        <label class="field"><span>Bonus d’init.</span><input id="monInit" type="number" inputmode="numeric" value="0"></label>
        <label class="field"><span>PV</span><input id="monHp" type="number" inputmode="numeric" value="7"></label>
        <label class="field"><span>CA</span><input id="monAc" type="number" inputmode="numeric" value="13"></label>
      </div>
      <button class="btn" data-a="monAdd">${ICON.plus} Ajouter et lancer l’initiative</button>
    </section></div>`;
}

function gmNotes(doc) {
  return `<section class="panel"><h3 class="ph">Notes de campagne</h3><p class="mute small">Visibles uniquement par vous. Enregistrées automatiquement.</p>
    <textarea id="gmNotes" class="notes" data-gmnotes="1" rows="16" placeholder="Intrigues, PNJ, lieux, trésors à distribuer…">${esc(doc ? doc.notes || "" : "")}</textarea>
    <div class="row-btns"><button class="btn small ghost danger" data-a="advDeleteAsk">Supprimer l’aventure</button></div></section>`;
}

/* ---------- Actions ---------- */
async function saveInit(mutator) {
  const doc = Live.doc;
  if (!doc) return;
  const it = clone(doc.init || { list: [], turn: 0, round: 1 });
  it.list = it.list || [];
  mutator(it);
  try { await FB.adv(S.gmCode).update({ init: it }); } catch (e) { toast("Enregistrement impossible. Vérifiez votre connexion."); }
}
function sortedIds(it) { return it.list.slice().sort((a, b) => b.v - a.v || (b.dex || 0) - (a.dex || 0)).map((e) => e.id); }

async function advAct(a, d, el) {
  if (typeof accAct === "function" && (await accAct(a, d, el))) return true;
  const ch = curChar();
  switch (a) {
    case "advJoin": {
      const code = normCode($("#joinCode").value);
      if (!code) { toast("Le code fait 6 caractères, par exemple DRG-7K2."); return true; }
      try {
        const snap = await FB.adv(code).get();
        if (!snap.exists) { toast("Aucune aventure avec ce code. Vérifiez auprès du MJ."); return true; }
        ch.adv = code; ch.advName = snap.data().name;
        await Store.put(ch);
        pushMember(ch);
        toast("Vous avez rejoint « " + snap.data().name + " »");
      } catch (e) { toast("Connexion impossible. Vérifiez votre réseau."); }
      return true;
    }
    case "advLeave": {
      const code = ch.adv;
      try { await FB.members(code).doc(FB.uid + "_" + ch.id).delete(); } catch (e) { }
      ch.adv = null; ch.advName = null; await Store.put(ch); Live.stop();
      toast("Vous avez quitté l’aventure");
      return true;
    }
    case "advCreateOpen": S.modal = { k: "advCreate" }; return true;
    case "advCreate": {
      const name = ($("#advName").value || "").trim();
      if (!name) { toast("Donnez un nom à l’aventure."); return true; }
      try {
        let code, tries = 0;
        do { code = newCode(); tries++; } while ((await FB.adv(code).get()).exists && tries < 5);
        await FB.adv(code).set({ name, gm: FB.uid, created: Date.now(), notes: "", init: { list: [], turn: 0, round: 1 } });
        GmList.add(code, name);
        S.modal = null; S.gmCode = code; S.gmTab = "groupe"; S.view = "gm";
        toast("Aventure créée. Code : " + code);
      } catch (e) { toast("Création impossible : vérifiez la configuration Firebase."); }
      return true;
    }
    case "gmOpen": S.gmCode = d.code; S.gmTab = "groupe"; S.view = "gm"; window.scrollTo(0, 0); return true;
    case "gmTab": S.gmTab = d.v; return true;
    case "copyCode": { try { await navigator.clipboard.writeText(S.gmCode); toast("Code copié : " + S.gmCode); } catch (e) { toast("Code : " + S.gmCode); } return false; }
    case "gmDetail": S.modal = { k: "gmDetail", id: d.id }; return true;
    case "gmKick": { try { await FB.members(S.gmCode).doc(d.id).delete(); toast("Personnage retiré du groupe"); } catch (e) { toast("Suppression impossible."); } S.modal = null; return true; }
    case "advDeleteAsk": S.modal = { k: "advDelete" }; return true;
    case "advDelete": {
      try {
        const q = await FB.members(S.gmCode).get();
        await Promise.all(q.docs.map((x) => x.ref.delete()));
        await FB.adv(S.gmCode).delete();
      } catch (e) { }
      GmList.remove(S.gmCode); Live.stop(); S.modal = null; S.view = "home"; toast("Aventure supprimée");
      return true;
    }
    case "initParty": {
      const mem = Live.members.map((m) => ({ m, s: memberStats(m) })).filter((x) => x.s);
      if (!mem.length) { toast("Aucun joueur dans le groupe pour l’instant."); return true; }
      await saveInit((it) => {
        it.list = it.list.filter((e) => e.kind !== "pc");
        mem.forEach(({ m, s }) => { const r = rollD20(s.init, "normal"); it.list.push({ id: "pc_" + m.id, kind: "pc", ref: m.id, name: m.name, v: r.total, dex: s.m.dex }); });
        it.turn = 0; it.round = 1;
      });
      toast("Initiative lancée pour le groupe");
      return true;
    }
    case "monAdd": {
      const name = ($("#monName").value || "").trim() || "Monstre";
      const n = Math.max(1, Math.min(20, parseInt($("#monN").value, 10) || 1));
      const bonus = parseInt($("#monInit").value, 10) || 0, hp = Math.max(1, parseInt($("#monHp").value, 10) || 1), ac = parseInt($("#monAc").value, 10) || 10;
      await saveInit((it) => {
        for (let i = 0; i < n; i++) { const r = rollD20(bonus, "normal"); it.list.push({ id: "m_" + uid(), kind: "monstre", name: n > 1 ? `${name} ${i + 1}` : name, v: r.total, dex: bonus, hp, max: hp, ac }); }
      });
      return true;
    }
    case "monHp": {
      const amt = Math.abs(parseInt(($("#mon-" + d.id) || {}).value, 10) || 1);
      await saveInit((it) => { const e = it.list.find((x) => x.id === d.id); if (e) e.hp = Math.max(0, Math.min(e.max, e.hp + amt * +d.d)); });
      return true;
    }
    case "initAdj": await saveInit((it) => { const e = it.list.find((x) => x.id === d.id); if (e) e.v += +d.d; }); return true;
    case "initDel": await saveInit((it) => { const ids = sortedIds(it), cur = ids[it.turn]; it.list = it.list.filter((x) => x.id !== d.id); const ni = sortedIds(it).indexOf(cur); it.turn = ni >= 0 ? ni : Math.min(it.turn, Math.max(0, it.list.length - 1)); }); return true;
    case "initNext": await saveInit((it) => { if (!it.list.length) return; it.turn = (it.turn || 0) + 1; if (it.turn >= it.list.length) { it.turn = 0; it.round = (it.round || 1) + 1; } }); return true;
    case "initPrev": await saveInit((it) => { if (!it.list.length) return; it.turn = (it.turn || 0) - 1; if (it.turn < 0) { it.turn = it.list.length - 1; it.round = Math.max(1, (it.round || 1) - 1); } }); return true;
    case "initClear": await saveInit((it) => { it.list = []; it.turn = 0; it.round = 1; }); return true;
  }
  return false;
}

/* Modales propres au mode aventure */
function advModal(m) {
  const am = typeof accountModal === "function" ? accountModal(m) : null;
  if (am) return am;
  if (m.k === "advCreate") return `<h3>Nouvelle aventure</h3><p class="mute">Vous en serez le maître du jeu. Un code sera créé pour vos joueurs.</p><label class="field big"><span>Nom de l’aventure</span><input id="advName" placeholder="Ex. La Mine perdue" autocomplete="off"></label><div class="row-btns"><button class="btn primary" data-a="advCreate">Créer</button></div>`;
  if (m.k === "gmDetail") { const mm = Live.members.find((x) => x.id === m.id); return mm ? gmDetailModal(mm) : "<p>Ce personnage a quitté le groupe.</p>"; }
  if (m.k === "advDelete") return `<h3>Supprimer l’aventure ?</h3><p>Le groupe, l’initiative et vos notes seront effacés. Les fiches des joueurs restent sur leurs appareils.</p><div class="row-btns"><button class="btn dmgb" data-a="advDelete">Supprimer définitivement</button><button class="btn ghost" data-a="closeModal">Annuler</button></div>`;
  return null;
}

let gmNotesTimer;
document.addEventListener("input", (e) => {
  if (e.target.dataset && e.target.dataset.gmnotes && FB.ok && S.gmCode) {
    const v = e.target.value;
    clearTimeout(gmNotesTimer);
    gmNotesTimer = setTimeout(() => FB.adv(S.gmCode).update({ notes: v }).catch(() => { }), 800);
  }
});
