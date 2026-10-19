/* Forge des Héros — contenu maison partagé par l’aventure.
   Les entrées sont stockées dans adventures/{code}/homebrew/{id} et visibles par les membres.
   Chaque personnage garde une copie des entrées qu’il utilise (b.hb) pour rester lisible hors ligne et par le MJ. */

const HBSUB = {};        // sous-classes maison, clé "hb_<id>"
const HBITEMS = {};      // objets maison
const HB_RAW = {};       // définitions brutes, clé "hb_<id>"
const HB_TYPES = [["sub", "Sous-classe"], ["bg", "Historique"], ["feat", "Don"], ["spell", "Sort"], ["item", "Objet"]];
const HB_CATS = ["origine", "general", "style", "faveur"];
const HB_CAT_L = { origine: "Don d’origine", general: "Don général (niveau 4 et plus)", style: "Style de combat", faveur: "Faveur épique (niveau 19)" };
/* Table où va un don selon sa catégorie */
const hbFeatTable = (d) => (d.cat === "style" ? FIGHTING_STYLES : d.cat === "faveur" ? EPIC_BOONS : FEATS);
const HB_TODO_D = "Texte à compléter depuis votre livre : touchez « Compléter ».";
const HB_TYPE_L = Object.fromEntries(HB_TYPES);
const HB_RARITY = [K("commun"), K("peu commun"), K("rare"), K("très rare"), K("légendaire"), K("artefact")];
const HB_RARITY_L = { [K("commun")]: "Commun", [K("peu commun")]: "Peu commun", [K("rare")]: "Rare", [K("très rare")]: "Très rare", [K("légendaire")]: "Légendaire", [K("artefact")]: "Artefact" };

/* Aptitudes de sous-classe du SRD sans étiquette entre parenthèses (remplacées par une sous-classe maison) */
const SUB_UNTAGGED = {
  clerc: ["Disciple de la vie", "Préservation de la vie"],
  druide: ["Sorts du cercle", "Aide de la terre"],
  moine: ["Technique de la main ouverte"],
  rodeur: ["Savoir du chasseur", "Proie du chasseur"],
  ensorceleur: ["Résilience draconique", "Sorts draconiques"],
  magicien: ["Savant en évocation", "Tour de magie puissant"],
};
function isSubFeat(cls, n) {
  const m = String(n).match(/\(([^)]*)\)$/);
  if (m && !/\d/.test(m[1])) return true;
  return (SUB_UNTAGGED[cls] || []).includes(n);
}

const hbKey = (d) => "hb_" + d.id;
/* Incantation donnée par une sous-classe : celle de l’entrée, sinon celle du catalogue */
function hbCastOf(d) {
  if (d.cast !== undefined) return d.cast && ABIL[d.cast.ab] ? d.cast : null;
  const sk = typeof PHB_RAW !== "undefined" && PHB_RAW["hb_" + d.id];
  return (sk && sk.cast) || null;
}
/* Aventure (ou appareil) où une entrée complétée est enregistrée */
function hbCodeOf(id) {
  const hit = Object.entries(HB.cache).find(([, a]) => (a.defs || []).some((x) => x.id === id));
  return hit ? hit[0] : null;
}
const clampLv = (v, lo, hi) => Math.max(lo, Math.min(hi, parseInt(v, 10) || lo));
function parseGear(txt) {
  return String(txt || "").split(/[,\n;]+/).map((x) => x.trim()).filter(Boolean).slice(0, 30).map((x) => {
    const m = x.match(/^(\d+)\s*[x×]?\s+(.+)$/i) || x.match(/^(.+?)\s*[x×]\s*(\d+)$/i);
    if (!m) return [x, 1];
    return /^\d+$/.test(m[1]) ? [m[2], +m[1]] : [m[1], +m[2]];
  });
}

/* Transforme une entrée brute en objet compatible avec les données du SRD */
function hbShape(d) {
  const base = { n: d.n || "Sans nom", hb: true, hbId: d.id, adv: d.adv || null, todo: !!d.sk };
  switch (d.type) {
    case "sub": return { ...base, cls: d.cls, d: d.d || "", feats: d.sk ? (d.feats || []).map((f) => ({ l: f.l, n: "Aptitude de sous-classe", d: HB_TODO_D })) : (d.feats || []).filter((f) => f && f.n).map((f) => ({ l: clampLv(f.l, 3, 20), n: f.n, d: f.d || "" })), spells: d.spells || {}, cast: hbCastOf(d) };
    case "bg": return { ...base, ab: (d.ab || []).slice(0, 3), skills: (d.skills || []).slice(0, 2), tool: d.tool || "—", feat: d.feat || "vigilant", featList: d.feat === "initie" ? d.featList || "clr" : undefined, desc: d.d || "", gear: parseGear(d.gear), gold: Math.max(0, parseInt(d.gold, 10) || 0) };
    case "feat": return { ...base, d: d.d || (d.sk ? HB_TODO_D : ""), cat: HB_CATS.includes(d.cat) ? d.cat : "origine", ab: d.ab || [], pre: d.pre || "" };
    case "spell": {
      const o = { ...base, l: clampLv(d.l, 0, 9), e: SC[d.e] ? d.e : "evo", t: d.t || "1 action", p: d.p || "—", c: d.c || "V, S", du: d.du || "Instantanée", co: !!d.co, ri: !!d.ri, cl: (d.cl || []).filter((k) => CLASSES[k]), d: d.d || "" };
      if (d.dmg) { o.dmg = d.dmg; o.ty = DMG[d.ty] ? d.ty : "force"; }
      if (d.heal) o.heal = d.heal;
      if (d.atk === "cac" || d.atk === "dist") o.atk = d.atk;
      else if (ABIL[d.atk]) o.sv = d.atk;
      if (d.up) o.up = d.up;
      return o;
    }
    case "item": return { ...base, d: d.d || "", rarity: d.rarity || K("peu commun"), attune: !!d.attune, kind: d.kind || "" };
  }
  return null;
}

/* Enregistre une entrée dans les tables de l’app. force = remplace une version plus ancienne */
function hbRegister(d, force) {
  if (!d || !d.id || !d.type) return;
  const k = hbKey(d);
  if (HB_RAW[k] && !force && !HB_RAW[k].sk) return;
  if (d.sk && HB_RAW[k] && !HB_RAW[k].sk) return; // ne remplace pas un texte complété par le squelette
  const shaped = hbShape(d);
  if (!shaped) return;
  HB_RAW[k] = d;
  const tgt = { sub: HBSUB, bg: BACKGROUNDS, feat: hbFeatTable(d), spell: SPELLS, item: HBITEMS }[d.type];
  [FEATS, FIGHTING_STYLES, EPIC_BOONS].forEach((t) => { if (t !== tgt && t[k] && t[k].hb) delete t[k]; });
  if (tgt) tgt[k] = shaped;
}
function hbUnregister(k) {
  delete HB_RAW[k];
  [HBSUB, BACKGROUNDS, FEATS, FIGHTING_STYLES, EPIC_BOONS, SPELLS, HBITEMS].forEach((t) => { if (t[k] && t[k].hb) delete t[k]; });
  if (typeof PHB_RAW !== "undefined" && PHB_RAW[k]) hbRegister(PHB_RAW[k], true); // l’entrée du catalogue redevient « à compléter »
}

/* Entrées utilisées par un personnage, copiées dans b.hb */
function hbUsed(b) {
  const ids = new Set();
  const add = (k) => { if (typeof k === "string" && k.startsWith("hb_")) ids.add(k); };
  add(b.bg); add(b.humanFeat); add(b.subHb); add(b.opts.style); add(b.opts.style2); add(b.opts.boon && b.opts.boon.id);
  if (b.bg && BACKGROUNDS[b.bg]) add(BACKGROUNDS[b.bg].feat);
  Object.values(b.opts.asis || {}).forEach((a) => a && add(a.feat));
  [...(b.cant || []), ...(b.prep || []), ...(b.opts.lore2 || []), ...Object.values(b.opts.arcanum || {})].forEach(add);
  Object.values(b.magic || {}).forEach((m) => { (m.cant || []).forEach(add); add(m.spell); });
  const hs = b.subHb && HBSUB[b.subHb];
  if (hs) Object.values(hs.spells || {}).flat().forEach(add);
  return ids;
}
function hbEmbed(b) {
  if (!b || !b.opts) return;
  const out = {};
  hbUsed(b).forEach((k) => { const d = HB_RAW[k] && !HB_RAW[k].sk ? HB_RAW[k] : b.hb && b.hb[k]; if (d && !d.sk) out[k] = d; });
  if (Object.keys(out).length) b.hb = out; else delete b.hb;
}

/* Cache local : { code: { name, defs: [...] } } */
const HB = {
  cache: {},
  boot() {
    try { this.cache = JSON.parse(localStorage.getItem("forge-hb") || "{}") || {}; } catch (e) { this.cache = {}; }
    Object.values(this.cache).forEach((a) => (a.defs || []).forEach((d) => hbRegister(d, true)));
  },
  persist() { try { localStorage.setItem("forge-hb", JSON.stringify(this.cache)); } catch (e) { } },
  set(code, defs, name) {
    const prev = this.cache[code];
    (prev ? prev.defs || [] : []).forEach((d) => { if (!defs.some((x) => x.id === d.id)) hbUnregister(hbKey(d)); });
    this.cache[code] = { name: name || (prev && prev.name) || code, defs };
    defs.forEach((d) => hbRegister(d, true));
    this.persist();
  },
  codes() {
    const s = new Set();
    if (typeof GmList !== "undefined") GmList.get().forEach((x) => s.add(x.code));
    S.chars.forEach((c) => c.adv && s.add(c.adv));
    return [...s];
  },
  advName(code) {
    const g = typeof GmList !== "undefined" && GmList.get().find((x) => x.code === code);
    if (g) return g.name;
    const ch = S.chars.find((c) => c.adv === code && c.advName);
    return ch ? ch.advName : (this.cache[code] && this.cache[code].name) || code;
  },
  defs(code) { return (this.cache[code] && this.cache[code].defs) || []; },
  async refresh() {
    if (typeof FB === "undefined" || !FB.ok) return;
    await Promise.all(this.codes().map(async (code) => {
      try { const q = await FB.adv(code).collection("homebrew").get(); this.set(code, q.docs.map((d) => d.data()), this.advName(code)); } catch (e) { }
    }));
  },
};

const hbTag = (o) => (o && o.todo ? `<span class="hb-tag todo" title="Texte à compléter depuis votre livre">À compléter</span>` : "");
/* Où enregistrer le texte : l’aventure du personnage, sinon l’unique aventure connue, sinon cet appareil (« _moi ») */
function hbHome() {
  const ch = S.view === "create" ? S.editId && S.chars.find((c) => c.id === S.editId) : curChar();
  if (ch && ch.adv) return ch.adv;
  const codes = HB.codes();
  return codes.length === 1 ? codes[0] : "_moi";
}
const hbLocal = (code) => code === "_moi" || typeof FB === "undefined" || !FB.ok;
/* Encadré « à compléter » pour une liste de clés */
function hbTodoNote(keys) {
  const uniq = [...new Set(keys)].filter((k) => k && HB_RAW[k]);
  const todo = uniq.filter((k) => HB_RAW[k].sk);
  const done = uniq.filter((k) => !HB_RAW[k].sk);
  const edit = done.length ? `<div class="hb-edit">${done.map((k) => `<button class="btn small ghost" data-a="hbFill" data-k="${k}">${ICON.edit || ""}Modifier : ${esc(HB_RAW[k].n)}</button>`).join("")}</div>` : "";
  if (!todo.length) return edit;
  return edit + `<div class="hb-todo"><p><b>À compléter depuis votre livre.</b> Le texte n’est pas fourni par l’app : recopiez-le une fois, il apparaîtra pour ${hbHome() === "_moi" ? "vos personnages" : "toute l’aventure"}.</p><div class="row-btns">${todo.map((k) => `<button class="btn small" data-a="hbFill" data-k="${k}">${ICON.edit || ""}Compléter : ${esc(HB_RAW[k].n)}</button>`).join("")}</div></div>`;
}
function hbCanEdit(d, code) {
  if (d.sk || code === "_moi") return true;
  if (typeof FB === "undefined" || !FB.ok) return false;
  if (d.by === FB.uid) return true;
  return !!(Live.code === code && Live.doc && Live.doc.gm === FB.uid);
}

/* ---------- Écran « Contenu maison » ---------- */
function hbMeta(d) {
  const o = hbShape(d);
  if (!o) return "";
  switch (d.type) {
    case "sub": return (CLASSES[o.cls] ? CLASSES[o.cls].n : "") + " · " + (d.sk ? "niveaux " + o.feats.map((x) => x.l).join(", ") : o.feats.length + " aptitude" + (o.feats.length > 1 ? "s" : ""));
    case "bg": return o.ab.map((a) => ABIL[a].s).join(", ") + " · " + o.skills.map((k) => SKILLS[k] ? SKILLS[k].n : k).join(", ") + (FEATS[o.feat] ? " · " + FEATS[o.feat].n : "");
    case "feat": return HB_CAT_L[o.cat] || HB_CAT_L.origine;
    case "spell": return (o.l ? "Niveau " + o.l : "Tour de magie") + " · " + SC[o.e] + (o.cl.length ? " · " + o.cl.map((k) => CLASSES[k].n).join(", ") : "");
    case "item": return (o.kind ? o.kind + " · " : "") + (HB_RARITY_L[o.rarity] || o.rarity) + (o.attune ? " · harmonisation" : "");
  }
  return "";
}

function viewHB() {
  const code = S.hbCode;
  const local = code === "_moi";
  if (!local && (typeof FB === "undefined" || !FB.ok)) return `<header class="topbar"><button class="icon-btn" data-a="hbBack" aria-label="Retour">${ICON.back}</button><div class="tb-title"><strong>Livres et créations</strong></div></header><main class="sheet"><p class="mute">Le contenu de l’aventure demande une connexion.</p></main>`;
  if (!local) Live.watch(code);
  if (S.hbf) return viewHBForm();
  const todo = Object.values(PHB_RAW).filter((d) => HB_RAW["hb_" + d.id] && HB_RAW["hb_" + d.id].sk);
  const defs = HB.defs(code).slice().sort((a, b) => (a.type === b.type ? (a.n || "").localeCompare(b.n || "", "fr") : HB_TYPES.findIndex((t) => t[0] === a.type) - HB_TYPES.findIndex((t) => t[0] === b.type)));
  const f = S.hbFilter || "all";
  const shown = f === "todo" ? todo.slice().sort((a, b) => HB_TYPES.findIndex((t) => t[0] === a.type) - HB_TYPES.findIndex((t) => t[0] === b.type) || (a.cls || "").localeCompare(b.cls || "") || a.n.localeCompare(b.n, "fr")) : defs.filter((d) => f === "all" || d.type === f);
  const counts = {}; defs.forEach((d) => (counts[d.type] = (counts[d.type] || 0) + 1));
  return `<header class="topbar">
    <button class="icon-btn" data-a="hbBack" aria-label="Retour">${ICON.back}</button>
    <div class="tb-title"><strong>Livres et créations</strong><span class="eyebrow">${local ? "Sur cet appareil" : esc(HB.advName(code)) + " · " + esc(code)}</span></div>
    <button class="btn small primary" data-a="hbNew">${ICON.plus}<span class="hide-s">Ajouter</span></button>
  </header>
  <main class="sheet hb-page">
    <section class="panel hb-intro"><p>Les sous-classes, historiques et dons du Manuel des joueurs sont déjà dans le créateur : il ne manque que leur texte, à recopier une fois depuis votre livre. Vous pouvez aussi ajouter vos propres créations.</p>
      <p class="mute small">${local ? "Ce contenu est enregistré sur cet appareil et dans les personnages qui l’utilisent." : "Ce contenu n’est visible que par les personnes qui ont le code de l’aventure. Chacun peut compléter ou ajouter des entrées ; seuls leur auteur et le MJ peuvent les modifier."}</p></section>
    ${typeof hbioPanel === "function" ? hbioPanel(code) : ""}
    <div class="chips hb-filter">${chip("À compléter (" + todo.length + ")", f === "todo", "hbFilter", 'data-v="todo"')}${chip("Tout (" + defs.length + ")", f === "all", "hbFilter", 'data-v="all"')}${HB_TYPES.map(([k, n]) => chip(n + (counts[k] ? " (" + counts[k] + ")" : ""), f === k, "hbFilter", `data-v="${k}"`)).join("")}</div>
    ${f === "todo" ? (shown.length ? `<div class="hb-list">${shown.map((d) => `<article class="hb-card todo">
      <div class="hb-top"><span class="hb-type">${HB_TYPE_L[d.type] || ""}</span><b>${esc(d.n)}</b></div>
      <span class="mute small">${esc(hbMeta(d))}</span>
      <div class="hb-foot"><span></span><button class="btn small" data-a="hbFill" data-k="hb_${esc(d.id)}">Compléter</button></div>
    </article>`).join("")}</div>` : `<section class="panel empty-state"><h3 class="ph">Tout est complété</h3><p>Le contenu du Manuel des joueurs est entièrement renseigné.</p></section>`) : shown.length ? `<div class="hb-list">${shown.map((d) => `<article class="hb-card">
      <div class="hb-top"><span class="hb-type">${HB_TYPE_L[d.type] || ""}</span><b>${esc(d.n)}</b></div>
      <span class="mute small">${esc(hbMeta(d))}</span>
      ${d.d ? `<p class="hb-desc">${esc(d.d.length > 220 ? d.d.slice(0, 220) + "…" : d.d)}</p>` : ""}
      <div class="hb-foot"><span class="mute small">${d.byName ? "Par " + esc(d.byName) : ""}</span>${hbCanEdit(d, code) ? `<span class="row-btns"><button class="btn small ghost" data-a="hbEdit" data-id="${esc(d.id)}">Modifier</button><button class="btn small ghost danger" data-a="hbDelAsk" data-id="${esc(d.id)}">Supprimer</button></span>` : ""}</div>
    </article>`).join("")}</div>` : `<section class="panel empty-state"><h3 class="ph">${defs.length ? "Rien dans cette catégorie" : "Aucun contenu maison"}</h3><p>Touchez <b>Ajouter</b> pour créer votre première entrée.</p></section>`}
  </main>`;
}

function hbBlank(type) {
  return { type, n: "", d: "", castMode: "", castAb: "int", castList: "magicien", cls: S.hbCls || "barbare", feats: [{ l: 3, n: "", d: "" }], spellsTxt: "", ab: [], skills: [], tool: "", feat: "vigilant", featList: "clr", gear: "", gold: 15, cat: "origine", pre: "", fab: [], l: 1, e: "evo", t: "1 action", p: "18 m", c: "V, S", du: "Instantanée", co: false, ri: false, cl: [], dmg: "", ty: "feu", heal: "", atk: "", up: "", rarity: K("peu commun"), attune: false, kind: "" };
}
function hbFormFrom(d) {
  const f = { ...hbBlank(d.type), ...clone(d) };
  delete f.sk; delete f.src;
  const cast = d.type === "sub" ? hbCastOf(d) : null;
  if (cast) Object.assign(f, { castMode: "third", castAb: cast.ab, castList: cast.list });
  delete f.cast;
  if (d.type === "feat") f.fab = d.ab || [];
  if (d.type === "sub" && (!f.feats || !f.feats.length)) f.feats = [{ l: 3, n: "", d: "" }];
  return f;
}

function hbInput(k, label, ph, opts = {}) {
  const v = S.hbf[k];
  return `<label class="field ${opts.big ? "big" : ""}"><span>${label}</span>${opts.area ? `<textarea data-hbf="${k}" rows="${opts.rows || 4}" placeholder="${ph}">${esc(v)}</textarea>` : `<input data-hbf="${k}" value="${esc(v)}" placeholder="${ph}" ${opts.num ? 'type="number" inputmode="numeric"' : ""} autocomplete="off">`}</label>`;
}

function viewHBForm() {
  const f = S.hbf;
  const t = f.type;
  const multi = (key, opts, max, label) => `<div class="field"><span>${label}${max ? ` — ${f[key].length}/${max}` : ""}</span><div class="chips">${opts.map(([k, n]) => chip(n, f[key].includes(k), "hbToggle", `data-k="${key}" data-v="${k}" data-max="${max || ""}"`, !f[key].includes(k) && max && f[key].length >= max ? 'aria-disabled="true"' : "")).join("")}</div></div>`;
  const one = (key, opts, label) => `<div class="field"><span>${label}</span><div class="chips">${opts.map(([k, n]) => chip(n, String(f[key]) === String(k), "hbSet", `data-k="${key}" data-v="${k}"`)).join("")}</div></div>`;
  let body = "";
  if (t === "sub") {
    body = `${one("cls", Object.entries(CLASSES).map(([k, c]) => [k, c.n]), "Classe")}
      <p class="mute small">Les aptitudes de la sous-classe du SRD (${esc(CLASSES[f.cls].sub.n)}) seront remplacées par celles-ci. Les aptitudes de base de la classe restent.</p>
      ${CLASSES[f.cls].caster ? "" : `${one("castMode", [["", "Aucune"], ["third", "Oui, à partir du niveau 3"]], "La sous-classe donne-t-elle l’incantation ?")}
      ${f.castMode === "third" ? `<p class="mute small">Progression de tiers-lanceur (comme le chevalier occulte ou l’arnaqueur arcanique) : emplacements, tours de magie et sorts préparés sont calculés.</p>${one("castAb", ["int", "sag", "cha"].map((k) => [k, ABIL[k].n]), "Caractéristique d’incantation")}${one("castList", Object.entries(CLASSES).filter(([, c]) => c.caster).map(([k, c]) => [k, c.n]), "Liste de sorts")}` : ""}`}
      <div class="field"><span>Aptitudes</span></div>
      ${f.feats.map((x, i) => `<div class="hb-feat"><div class="hb-feat-top"><label class="field lv"><span>Niveau</span><input data-hbf="feats.${i}.l" type="number" inputmode="numeric" min="3" max="20" value="${esc(x.l)}"></label><label class="field"><span>Nom</span><input data-hbf="feats.${i}.n" value="${esc(x.n)}" placeholder="Ex. Frappe tonitruante" autocomplete="off"></label><button class="icon-btn" data-a="hbFeatDel" data-i="${i}" aria-label="Retirer l’aptitude">${ICON.close}</button></div>
        <label class="field"><span>Effet</span><textarea data-hbf="feats.${i}.d" rows="3" placeholder="Ce que fait l’aptitude">${esc(x.d)}</textarea></label></div>`).join("")}
      <button class="btn small ghost" data-a="hbFeatAdd">${ICON.plus} Ajouter une aptitude</button>
      ${hbInput("spellsTxt", "Sorts toujours préparés (facultatif)", "Une ligne par niveau de personnage, par exemple : 3 : Bénédiction, Soins", { area: true, rows: 4 })}
      <p class="mute small">Ces sorts s’ajoutent à l’onglet Sorts de la fiche, sans compter dans les sorts préparés. Une ligne sans niveau compte pour le niveau 3.</p>
      ${f.spellsTxt ? `<p class="mute small">${hbSpellPreview(f.spellsTxt)}</p>` : ""}`;
  } else if (t === "bg") {
    const origin = Object.entries(FEATS).filter(([, x]) => x.cat !== "general");
    body = `${multi("ab", ABK.map((k) => [k, ABIL[k].n]), 3, "Trois caractéristiques")}
      ${multi("skills", SKK.map((k) => [k, SKILLS[k].n]), 2, "Deux compétences")}
      ${one("feat", origin.map(([k, x]) => [k, x.n]), "Don d’origine")}
      ${f.feat === "initie" ? one("featList", Object.entries(MI_NAME), "Liste de sorts du don") : ""}
      ${hbInput("tool", "Outil maîtrisé", "Ex. Outils de menuisier")}
      ${hbInput("gear", "Équipement", "Séparez par des virgules : Outils de menuisier, Vêtements de voyage, 2 Torches", { area: true, rows: 3 })}
      ${hbInput("gold", "Pièces d’or", "15", { num: true })}`;
  } else if (t === "feat") {
    body = `${one("cat", HB_CATS.map((k) => [k, HB_CAT_L[k]]), "Catégorie")}
      <p class="mute small">${f.cat === "general" ? "Proposé à la place d’une amélioration de caractéristique, à partir du niveau 4." : f.cat === "style" ? "Proposé dans le choix du style de combat (guerrier, paladin, rôdeur)." : f.cat === "faveur" ? "Proposé dans le choix de la faveur épique, au niveau 19." : "Proposé aux historiques et au don d’origine des humains."}</p>
      ${hbInput("pre", "Prérequis (facultatif)", "Ex. Force 13 ou plus")}
      ${multi("fab", ABK.map((k) => [k, ABIL[k].n]), 0, "+1 à une caractéristique au choix parmi (facultatif)")}`;
  } else if (t === "spell") {
    body = `${one("l", Array.from({ length: 10 }, (_, i) => [i, i ? String(i) : "Tour"]), "Niveau")}
      ${one("e", Object.entries(SC), "École")}
      ${multi("cl", Object.entries(CLASSES).filter(([, c]) => c.caster).map(([k, c]) => [k, c.n]), 0, "Classes qui y ont accès")}
      <div class="two-col">${hbInput("t", "Temps d’incantation", "1 action")}${hbInput("p", "Portée", "18 m")}</div>
      <div class="two-col">${hbInput("c", "Composantes", "V, S, M")}${hbInput("du", "Durée", "Instantanée")}</div>
      <div class="chips">${chip("Concentration", f.co, "hbFlag", 'data-k="co"')}${chip("Rituel", f.ri, "hbFlag", 'data-k="ri"')}</div>
      ${one("atk", [["", "Aucun jet"], ["cac", "Attaque au corps à corps"], ["dist", "Attaque à distance"], ...ABK.map((k) => [k, "JS de " + ABIL[k].n])], "Jet")}
      <div class="two-col">${hbInput("dmg", "Dégâts (facultatif)", "Ex. 3d6")}${hbInput("heal", "Soins (facultatif)", "Ex. 2d8")}</div>
      ${f.dmg ? `<label class="field"><span>Type de dégâts</span><select data-hbf="ty">${Object.entries(DMG).map(([k, n]) => `<option value="${k}" ${f.ty === k ? "selected" : ""}>${n}</option>`).join("")}</select></label>` : ""}
      ${hbInput("up", "Aux niveaux supérieurs (facultatif)", "Ex. +1d6 par niveau")}`;
  } else if (t === "item") {
    body = `${hbInput("kind", "Catégorie", "Ex. Anneau, Arme (épée longue), Objet merveilleux")}
      ${one("rarity", HB_RARITY.map((r) => [r, HB_RARITY_L[r]]), "Rareté")}
      <div class="chips">${chip("Harmonisation requise", f.attune, "hbFlag", 'data-k="attune"')}</div>`;
  }
  return `<header class="topbar">
    <button class="icon-btn" data-a="hbCancel" aria-label="Retour">${ICON.back}</button>
    <div class="tb-title"><strong>${f.id ? "Modifier" : "Nouveau contenu"}</strong><span class="eyebrow">${esc(HB.advName(S.hbCode))}</span></div>
  </header>
  <main class="sheet hb-page"><section class="panel hb-form">
    ${f.id ? `<p class="lbl">${HB_TYPE_L[t]}</p>` : `<div class="field"><span>Type</span><div class="chips">${HB_TYPES.map(([k, n]) => chip(n, t === k, "hbType", `data-v="${k}"`)).join("")}</div></div>`}
    ${hbInput("n", "Nom", t === "sub" ? "Ex. Voie du Zélateur" : t === "bg" ? "Ex. Artisan" : t === "feat" ? "Ex. Robuste" : t === "spell" ? "Ex. Lame tonnerre" : "Ex. Anneau de protection", { big: true })}
    ${hbInput("d", "Description", t === "sub" ? "Présentation de la sous-classe" : t === "item" ? "Effets de l’objet" : t === "spell" ? "Effet du sort" : "Description", { area: true, rows: t === "sub" || t === "bg" ? 3 : 6 })}
    ${body}
    ${f.err ? `<p class="bad">${esc(f.err)}</p>` : ""}
    <div class="row-btns"><button class="btn primary" data-a="hbSave">${f.id ? "Enregistrer" : "Ajouter à l’aventure"}</button><button class="btn ghost" data-a="hbCancel">Annuler</button></div>
  </section></main>`;
}

/* « 3 : Bénédiction, Soins » → { 3: ["benediction", "soins"] } */
const normName = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
function hbParseSpells(txt) {
  const out = {}, unknown = [];
  const byName = {};
  Object.entries(SPELLS).forEach(([id, s]) => (byName[normName(s.n)] = id));
  String(txt || "").split("\n").forEach((line) => {
    if (!line.trim()) return;
    const m = line.match(/^\s*(?:niv(?:eau)?\.?\s*)?(\d+)\s*[:\-–.)]\s*(.+)$/i) || [null, "3", line];
    const lv = clampLv(m[1], 1, 20);
    m[2].split(/[,;]/).map((x) => x.trim()).filter(Boolean).forEach((n) => {
      const id = byName[normName(n)];
      if (id) (out[lv] = out[lv] || []).push(id); else unknown.push(n);
    });
  });
  return { spells: out, unknown };
}
function hbSpellPreview(txt) {
  const r = hbParseSpells(txt);
  const ok = Object.values(r.spells).flat().length;
  return `${ok} sort${ok > 1 ? "s" : ""} reconnu${ok > 1 ? "s" : ""}${r.unknown.length ? ` · introuvables : ${r.unknown.map(esc).join(", ")} (créez-les d’abord comme sorts maison, ou vérifiez l’orthographe)` : ""}`;
}

function hbAuthorName() {
  const u = typeof Account !== "undefined" && Account.user ? Account.user() : null;
  if (u && u.displayName) return u.displayName;
  if (Live.doc && Live.doc.gm === FB.uid) return "MJ";
  const ch = S.chars.find((c) => c.adv === S.hbCode);
  return ch ? ch.b.name : "Joueur";
}

function hbValidate(f) {
  if (!f.n.trim()) return "Donnez un nom.";
  if (f.type === "sub" && !f.feats.some((x) => x.n.trim())) return "Ajoutez au moins une aptitude.";
  if (f.type === "bg" && f.ab.length !== 3) return "Choisissez trois caractéristiques.";
  if (f.type === "bg" && f.skills.length !== 2) return "Choisissez deux compétences.";
  if (f.type === "spell" && !f.cl.length) return "Choisissez au moins une classe.";
  if (f.type === "spell" && f.dmg && !/^\d*d\d+([+-]\d+)?$/i.test(f.dmg.replace(/\s/g, ""))) return "Dégâts : utilisez une formule comme 3d6 ou 2d8+2.";
  if (f.type === "spell" && f.heal && !/^\d*d\d+([+-]\d+)?$/i.test(f.heal.replace(/\s/g, ""))) return "Soins : utilisez une formule comme 2d8.";
  return null;
}
function hbToDoc(f) {
  const d = { id: f.id || uid(), type: f.type, n: f.n.trim().slice(0, 120), d: (f.d || "").slice(0, 6000), adv: S.hbCode, updated: Date.now() };
  if (f.type === "sub") { d.cls = f.cls; d.feats = f.feats.filter((x) => x.n.trim()).slice(0, 30).map((x) => ({ l: clampLv(x.l, 3, 20), n: x.n.trim().slice(0, 120), d: (x.d || "").slice(0, 3000) })); d.spellsTxt = (f.spellsTxt || "").slice(0, 2000); d.spells = hbParseSpells(f.spellsTxt).spells; d.cast = !CLASSES[f.cls].caster && f.castMode === "third" ? { ab: f.castAb, list: f.castList } : null; }
  if (f.type === "bg") Object.assign(d, { ab: f.ab, skills: f.skills, tool: f.tool.slice(0, 120), feat: f.feat, featList: f.featList, gear: f.gear.slice(0, 1000), gold: Math.max(0, parseInt(f.gold, 10) || 0) });
  if (f.type === "feat") Object.assign(d, { cat: f.cat, pre: f.pre.slice(0, 200), ab: f.fab });
  if (f.type === "spell") Object.assign(d, { l: +f.l, e: f.e, cl: f.cl, t: f.t.slice(0, 80), p: f.p.slice(0, 80), c: f.c.slice(0, 200), du: f.du.slice(0, 80), co: !!f.co, ri: !!f.ri, atk: f.atk, dmg: f.dmg.replace(/\s/g, ""), ty: f.ty, heal: f.heal.replace(/\s/g, ""), up: f.up.slice(0, 200) });
  if (f.type === "item") Object.assign(d, { kind: f.kind.slice(0, 120), rarity: f.rarity, attune: !!f.attune });
  return d;
}

async function hbAct(a, d, el) {
  switch (a) {
    case "hbOpen": S.hbCode = d.code; S.hbBack = { view: S.view, tab: S.tab, gmTab: S.gmTab }; S.hbf = null; S.hbDirect = false; S.hbFilter = HB.defs(d.code).length ? "all" : "todo"; S.view = "hb"; window.scrollTo(0, 0); return true;
    case "hbFill": {
      const filled = HB_RAW[d.k] && !HB_RAW[d.k].sk ? HB_RAW[d.k] : null;
      const raw = filled || PHB_RAW[d.k]; if (!raw) return true;
      const where = filled ? hbCodeOf(filled.id) || filled.adv || hbHome() : null;
      if (filled && !hbCanEdit(filled, where)) { toast("Seuls l’auteur de cette entrée et le MJ peuvent la modifier."); return true; }
      if (S.view !== "hb") { S.hbCode = where || hbHome(); S.hbBack = { view: S.view, tab: S.tab, gmTab: S.gmTab, y: window.scrollY }; S.hbDirect = true; S.view = "hb"; }
      S.hbf = hbFormFrom(raw); window.scrollTo(0, 0); return true;
    }
    case "hbBack": { const bk = S.hbBack || { view: "home" }; S.view = bk.view; if (bk.tab) S.tab = bk.tab; if (bk.gmTab) S.gmTab = bk.gmTab; S.hbf = null; S.hbDirect = false; setTimeout(() => window.scrollTo(0, bk.y || 0), 0); return true; }
    case "hbFilter": S.hbFilter = d.v; return true;
    case "hbNew": S.hbf = hbBlank(HB_TYPE_L[S.hbFilter] ? S.hbFilter : "sub"); window.scrollTo(0, 0); return true;
    case "hbType": { const keep = { n: S.hbf.n, d: S.hbf.d }; S.hbf = { ...hbBlank(d.v), ...keep }; return true; }
    case "hbEdit": { const def = HB.defs(S.hbCode).find((x) => x.id === d.id); if (def) { S.hbf = hbFormFrom(def); window.scrollTo(0, 0); } return true; }
    case "hbCancel": S.hbf = null; if (S.hbDirect) return hbAct("hbBack", {}); return true;
    case "hbSet": { const f = S.hbf; f[d.k] = d.k === "l" ? +d.v : d.v; if (d.k === "cls") S.hbCls = d.v; return true; }
    case "hbFlag": S.hbf[d.k] = !S.hbf[d.k]; return true;
    case "hbToggle": { if (el && el.getAttribute("aria-disabled") === "true") return true; toggleIn(S.hbf[d.k], d.v, d.max ? +d.max : null); return true; }
    case "hbFeatAdd": { const last = S.hbf.feats[S.hbf.feats.length - 1]; S.hbf.feats.push({ l: last ? last.l : 3, n: "", d: "" }); return true; }
    case "hbFeatDel": S.hbf.feats.splice(+d.i, 1); if (!S.hbf.feats.length) S.hbf.feats.push({ l: 3, n: "", d: "" }); return true;
    case "hbSave": {
      const f = S.hbf, err = hbValidate(f);
      if (err) { f.err = err; return true; }
      const doc = hbToDoc(f);
      const prev = HB.defs(S.hbCode).find((x) => x.id === doc.id);
      doc.by = prev ? prev.by : FB.uid;
      doc.byName = prev ? prev.byName : hbAuthorName();
      try {
        if (!hbLocal(S.hbCode)) await FB.adv(S.hbCode).collection("homebrew").doc(doc.id).set(doc);
        HB.set(S.hbCode, [...HB.defs(S.hbCode).filter((x) => x.id !== doc.id), doc], S.hbCode === "_moi" ? "Cet appareil" : undefined);
        S.hbf = null; S.hbFilter = doc.id.startsWith("phb_") ? "todo" : doc.type;
        const ch = curChar(); if (ch && S.hbBack && S.hbBack.view === "sheet") { hbEmbed(ch.b); saveSoon(ch); }
        toast(prev ? "Modifications enregistrées" : doc.id.startsWith("phb_") ? "« " + doc.n + " » complété" : "« " + doc.n + " » ajouté");
        if (S.hbDirect) return hbAct("hbBack", {});
      } catch (e) { f.err = e && e.code === "permission-denied" ? "Enregistrement refusé : publiez les nouvelles règles Firestore (voir FIREBASE.md)." : "Enregistrement impossible. Vérifiez votre connexion."; }
      return true;
    }
    case "hbDelAsk": S.modal = { k: "hbDel", id: d.id }; return true;
    case "hbDel": {
      try {
        if (!hbLocal(S.hbCode)) await FB.adv(S.hbCode).collection("homebrew").doc(d.id).delete();
        HB.set(S.hbCode, HB.defs(S.hbCode).filter((x) => x.id !== d.id));
        toast("Entrée supprimée");
      } catch (e) { toast("Suppression impossible."); }
      S.modal = null; return true;
    }
    case "setSub": { const b = S.draft; b.subHb = d.v || null; cleanBuild(b); return true; }
  }
  return false;
}

function hbModal(m) {
  if (m.k === "hbDel") {
    const def = HB.defs(S.hbCode).find((x) => x.id === m.id);
    return `<h3>Supprimer « ${esc(def ? def.n : "")} » ?</h3><p>L’entrée disparaît de l’aventure. Les personnages qui l’utilisent déjà en gardent une copie.</p><div class="row-btns"><button class="btn dmgb" data-a="hbDel" data-id="${esc(m.id)}">Supprimer</button><button class="btn ghost" data-a="closeModal">Annuler</button></div>`;
  }
  return null;
}

document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t.dataset || !t.dataset.hbf || !S.hbf) return;
  const path = t.dataset.hbf.split(".");
  let o = S.hbf;
  for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
  o[path[path.length - 1]] = t.value;
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset && t.dataset.hbf === "ty" && S.hbf) S.hbf.ty = t.value;
  if (t.dataset && (t.dataset.hbf === "dmg" || t.dataset.hbf === "spellsTxt") && S.hbf) render();
});
