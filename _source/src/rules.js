/* Forge des Héros — moteur de règles (fonctions pures) */

const mod = (s) => Math.floor((s - 10) / 2);
const sg = (n) => (n >= 0 ? "+" + n : "−" + Math.abs(n));
const pbOf = (lv) => 2 + Math.floor((lv - 1) / 4);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const fmtM = (m) => LANG === "en" ? Math.round(m / 0.3) + " ft" : (Number.isInteger(m) ? m : m.toFixed(1).replace(".", ",")) + " m";

const STD_ARRAY = [15, 14, 13, 12, 10, 8];
const PB_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const PRIORITY = {
  barbare: ["for", "con", "dex", "sag", "cha", "int"], barde: ["cha", "dex", "con", "sag", "int", "for"],
  clerc: ["sag", "con", "for", "cha", "dex", "int"], druide: ["sag", "con", "dex", "int", "cha", "for"],
  guerrier: ["for", "con", "dex", "sag", "int", "cha"], moine: ["dex", "sag", "con", "for", "int", "cha"],
  paladin: ["for", "cha", "con", "sag", "dex", "int"], rodeur: ["dex", "sag", "con", "for", "int", "cha"],
  roublard: ["dex", "con", "int", "sag", "cha", "for"], ensorceleur: ["cha", "con", "dex", "sag", "int", "for"],
  occultiste: ["cha", "con", "dex", "sag", "int", "for"], magicien: ["int", "con", "dex", "sag", "cha", "for"],
};

function newBuild() {
  return {
    v: 1, id: uid(), name: "", level: 1, cls: null, species: null, sChoice: null, size: "Moyenne", sSpellAb: "cha",
    bg: null, bonus: { mode: "21", p2: null, p1: null },
    method: "standard", base: { for: 15, dex: 14, con: 13, int: 12, sag: 10, cha: 8 }, rolled: null,
    skillsClass: [], skillsSpecies: [], skilled: [], skillsLore: [], skillPrimal: null, expertise: [],
    humanFeat: null, magic: { bg: { list: "clr", cant: [], spell: null, ab: "sag" }, human: { list: "clr", cant: [], spell: null, ab: "sag" } },
    opts: { style: null, style2: null, order: null, strike: null, dragon: null, mastery: [], inv: [], meta: [], prey: null, land: null, lore2: [], arcanum: {}, asis: {}, boon: { id: null, a: null } },
    cant: [], prep: [], gear: { cls: "A", bg: "A" }, langs: [], align: "Neutre", subHb: null,
    details: { age: "", taille: "", divinite: "", apparence: "", personnalite: "", ideaux: "", liens: "", defauts: "", histoire: "" },
    created: Date.now(),
  };
}

function assignStandard(b) {
  const pri = PRIORITY[b.cls] || ABK;
  const pool = b.method === "roll" && b.rolled ? [...b.rolled].sort((x, y) => y - x) : STD_ARRAY;
  pri.forEach((k, i) => (b.base[k] = pool[i]));
}

const MI_LIST = { clr: "clerc", drd: "druide", mag: "magicien" };
const MI_NAME = { clr: "Clerc", drd: "Druide", mag: "Magicien" };

function featsOf(b) {
  const out = [];
  if (b.bg && BACKGROUNDS[b.bg]) out.push({ id: BACKGROUNDS[b.bg].feat, src: "bg" });
  if (b.species === "humain" && b.humanFeat) out.push({ id: b.humanFeat, src: "human" });
  activeAsiLevels(b).forEach((lv) => { const a = b.opts.asis[lv]; if (a && a.mode === "feat" && a.feat) out.push({ id: a.feat, src: "asi" + lv }); });
  return out.filter((f) => FEATS[f.id]);
}

function subActive(b) { return b.level >= 3; }
/* Sous-classe : celle du SRD, ou une sous-classe maison (b.subHb) */
function hbSub(b) { const h = b.subHb && typeof HBSUB !== "undefined" && HBSUB[b.subHb]; return h && h.cls === b.cls ? h : null; }
function srdSub(b) { return !b.subHb; }
function subName(b) { const c = CLASSES[b.cls]; if (!c) return null; const h = hbSub(b); return h ? h.n : srdSub(b) ? c.sub.n : null; }

function migrate(b) {
  const o = b.opts;
  if (!o.asis) { o.asis = {}; if (o.asi) o.asis[4] = o.asi; }
  delete o.asi;
  if (!o.boon) o.boon = { id: null, a: null };
  if (!o.lore2) o.lore2 = [];
  if (!o.arcanum) o.arcanum = {};
  ["style2", "strike", "dragon"].forEach((k) => { if (!(k in o)) o[k] = null; });
  if (b.details && !("divinite" in b.details)) b.details.divinite = "";
  if (!("subHb" in b)) b.subHb = null;
  if (b.hb && typeof hbRegister === "function") Object.values(b.hb).forEach((d) => hbRegister(d, false));
  return b;
}
function asiAt(b, lv) { if (!b.opts.asis[lv]) b.opts.asis[lv] = { mode: "2", a: null, b: null }; return b.opts.asis[lv]; }
function activeAsiLevels(b) { return asiLevels(b.cls).filter((l) => l <= b.level); }
function metaCount(b) { return b.level >= 17 ? 6 : b.level >= 10 ? 4 : b.level >= 2 ? 2 : 0; }
function martialDie(L) { return L >= 17 ? "1d12" : L >= 11 ? "1d10" : L >= 5 ? "1d8" : "1d6"; }
function attacksPerAction(b) {
  if (b.cls === "guerrier") return b.level >= 20 ? 4 : b.level >= 11 ? 3 : b.level >= 5 ? 2 : 1;
  if (["barbare", "paladin", "rodeur", "moine"].includes(b.cls) && b.level >= 5) return 2;
  if (b.cls === "occultiste" && b.opts.inv.includes("lamedevorante")) return 3;
  if (b.cls === "occultiste" && b.opts.inv.includes("lameassoiffee")) return 2;
  return 1;
}

function abilities(b) {
  migrate(b);
  const out = {};
  ABK.forEach((k) => (out[k] = b.base[k] || 8));
  const bg = b.bg && BACKGROUNDS[b.bg];
  if (bg) {
    if (b.bonus.mode === "21") {
      if (b.bonus.p2) out[b.bonus.p2] += 2;
      if (b.bonus.p1 && b.bonus.p1 !== b.bonus.p2) out[b.bonus.p1] += 1;
    } else bg.ab.forEach((k) => (out[k] += 1));
  }
  ABK.forEach((k) => (out[k] = Math.min(out[k], 20)));
  activeAsiLevels(b).forEach((lv) => {
    const a = b.opts.asis[lv];
    if (!a) return;
    if (a.mode === "2" && a.a) out[a.a] = Math.min(20, out[a.a] + 2);
    if (a.mode === "11") { if (a.a) out[a.a] = Math.min(20, out[a.a] + 1); if (a.b && a.b !== a.a) out[a.b] = Math.min(20, out[a.b] + 1); }
    if (a.mode === "feat" && a.feat && FEATS[a.feat] && a.a && (FEATS[a.feat].ab || []).includes(a.a)) out[a.a] = Math.min(20, out[a.a] + 1);
  });
  if (b.level >= 19 && b.opts.boon.a) out[b.opts.boon.a] = Math.min(30, out[b.opts.boon.a] + 1);
  if (b.level >= 20 && b.cls === "barbare") ["for", "con"].forEach((k) => (out[k] = Math.max(out[k], Math.min(25, out[k] + 4))));
  if (b.level >= 20 && b.cls === "moine") ["dex", "sag"].forEach((k) => (out[k] = Math.max(out[k], Math.min(25, out[k] + 4))));
  return out;
}

function classSkillPool(b) {
  const c = CLASSES[b.cls];
  if (!c) return [];
  return c.skills.from === "all" ? SKK : c.skills.from;
}

function profSkills(b) {
  const s = new Set();
  if (b.bg && BACKGROUNDS[b.bg]) BACKGROUNDS[b.bg].skills.forEach((k) => s.add(k));
  b.skillsClass.forEach((k) => s.add(k));
  b.skillsSpecies.forEach((k) => s.add(k));
  featsOf(b).forEach((f) => { if (f.id === "doue") b.skilled.forEach((k) => s.add(k)); });
  if (b.cls === "barde" && b.level >= 3 && srdSub(b)) b.skillsLore.forEach((k) => s.add(k));
  if (b.cls === "barbare" && b.level >= 3 && b.skillPrimal) s.add(b.skillPrimal);
  return s;
}

function expertiseCount(b) {
  if (b.cls === "roublard") return b.level >= 6 ? 4 : 2;
  if (b.cls === "barde" && b.level >= 2) return b.level >= 9 ? 4 : 2;
  if (b.cls === "rodeur" && b.level >= 2) return b.level >= 9 ? 3 : 1;
  if (b.cls === "magicien" && b.level >= 2) return 1;
  return 0;
}
function expertisePool(b) {
  const prof = [...profSkills(b)];
  if (b.cls === "magicien") return prof.filter((k) => ["arca", "hist", "inve", "mede", "natu", "reli"].includes(k));
  return prof;
}

function weaponProf(b, w) {
  const c = CLASSES[b.cls];
  if (!c) return false;
  const cats = [...c.weapons];
  if ((b.cls === "clerc" && b.opts.order === "protecteur") || (b.cls === "druide" && b.opts.order === "gardien")) cats.push("guerre");
  if (cats.includes(w.c)) return true;
  if (w.c === "guerre" && cats.includes("guerreLegere") && w.p.includes("L")) return true;
  if (w.c === "guerre" && cats.includes("guerreFinesse") && (w.p.includes("L") || w.p.includes("F"))) return true;
  return false;
}
function armorProfs(b) {
  const c = CLASSES[b.cls];
  if (!c) return [];
  const a = [...c.armor];
  if (b.cls === "clerc" && b.opts.order === "protecteur") a.push("lourde");
  if (b.cls === "druide" && b.opts.order === "gardien") a.push("inter");
  return a;
}

function slotsOf(b) {
  const c = CLASSES[b.cls];
  if (!c || !c.caster) return null;
  const i = b.level - 1;
  if (c.caster === "full") return { type: "std", slots: FULL_SLOTS[i] };
  if (c.caster === "half") return { type: "std", slots: HALF_SLOTS[i] };
  return { type: "pact", n: PACT_SLOTS[i][0], lvl: PACT_SLOTS[i][1] };
}
function maxSpellLevel(b) {
  const s = slotsOf(b);
  if (!s) return 0;
  return s.type === "pact" ? s.lvl : s.slots.length;
}
function cantripCount(b) {
  const c = CLASSES[b.cls];
  if (!c || !c.caster) return 0;
  let n = c.cant[b.level - 1];
  if ((b.cls === "clerc" && b.opts.order === "thaumaturge") || (b.cls === "druide" && b.opts.order === "magicien")) n += 1;
  return n;
}
function prepCount(b) {
  const c = CLASSES[b.cls];
  return c && c.caster ? c.prep[b.level - 1] : 0;
}

/* Sorts « toujours préparés » ou donnés par l’espèce/les dons */
function grantedSpells(b) {
  const out = [];
  const c = CLASSES[b.cls];
  const sp = b.species && SPECIES[b.species];
  if (c) {
    if (c.always) Object.entries(c.always).forEach(([lv, ids]) => { if (b.level >= +lv) ids.forEach((id) => out.push({ id, src: "Classe", ab: c.sab, always: true, free: b.cls === "paladin" ? "smite" : b.cls === "rodeur" ? "ennemi" : null })); });
    if (b.cls === "druide") out.push({ id: "comanimaux", src: "Druidique", ab: c.sab, always: true });
    const hs = hbSub(b), subSpells = hs ? hs.spells : srdSub(b) ? c.sub.spells : null;
    if (subActive(b) && subSpells) Object.entries(subSpells).forEach(([lv, ids]) => { if (b.level >= +lv) ids.forEach((id) => out.push({ id, src: subName(b), ab: c.sab || "sag", always: true })); });
    if (b.cls === "druide" && subActive(b) && srdSub(b) && b.opts.land) Object.entries(LAND_SPELLS[b.opts.land].s).forEach(([lv, ids]) => { if (b.level >= +lv) ids.forEach((id) => out.push({ id, src: "Cercle de la Terre", ab: c.sab, always: true })); });
  }
  if (sp) {
    const opt = sp.choice && b.sChoice && sp.choice.opts[b.sChoice];
    if (opt && opt.spells) Object.entries(opt.spells).forEach(([lv, ids]) => {
      if (b.level >= +lv) ids.forEach((id) => out.push({ id, src: sp.n, ab: b.sSpellAb, always: true, free: SPELLS[id].l > 0 ? "sp_" + id : null }));
    });
    if (sp.extraSpells) sp.extraSpells.forEach((id) => out.push({ id, src: sp.n, ab: b.sSpellAb, always: true }));
  }
  if (b.cls === "barde" && b.level >= 6 && srdSub(b)) b.opts.lore2.forEach((id) => out.push({ id, src: "Découvertes magiques", ab: "cha", always: true }));
  if (b.cls === "occultiste") Object.entries(b.opts.arcanum).forEach(([lv, id]) => { if (id && b.level >= ARCANUM_LV[lv]) out.push({ id, src: "Arcanum mystique", ab: "cha", always: true, free: "arc_" + lv }); });
  featsOf(b).forEach((f) => {
    if (f.id !== "initie") return;
    const m = b.magic[f.src];
    m.cant.forEach((id) => out.push({ id, src: "Initié (" + MI_NAME[m.list] + ")", ab: m.ab, always: true }));
    if (m.spell) out.push({ id: m.spell, src: "Initié (" + MI_NAME[m.list] + ")", ab: m.ab, always: true, free: "mi_" + f.src });
  });
  // dédoublonner (garder la première source)
  const seen = new Set();
  return out.filter((s) => SPELLS[s.id] && !seen.has(s.id) && seen.add(s.id));
}

const ARCANUM_LV = { 6: 11, 7: 13, 8: 15, 9: 17 };
function poolClasses(b) { return b.cls === "barde" && b.level >= 10 ? ["barde", "clerc", "druide", "magicien"] : [b.cls]; }
function classSpellPool(b, lvl) {
  const cls = poolClasses(b);
  return Object.keys(SPELLS).filter((id) => SPELLS[id].l === lvl && SPELLS[id].cl.some((c) => cls.includes(c))).sort((x, y) => SPELLS[x].n.localeCompare(SPELLS[y].n, "fr"));
}

function speciesHPBonus(b) { return b.species === "nain" ? b.level : 0; }

function hpMax(b, ab) {
  const c = CLASSES[b.cls];
  if (!c) return 0;
  const cm = mod(ab.con);
  let hp = Math.max(1, c.hd + cm);
  for (let l = 2; l <= b.level; l++) hp += Math.max(1, c.hd / 2 + 1 + cm);
  hp += speciesHPBonus(b);
  if (b.cls === "ensorceleur" && b.level >= 3 && srdSub(b)) hp += b.level;
  return hp;
}

function resources(b, ab) {
  const L = b.level, pb = pbOf(L), r = [], std = srdSub(b);
  const add = (k, n, max, reset, note) => max > 0 && r.push({ k, n, max, reset, note });
  switch (b.cls) {
    case "barbare": add("rage", "Rage", L >= 17 ? 6 : L >= 12 ? 5 : L >= 6 ? 4 : L >= 3 ? 3 : 2, "short1", "+" + rageDmg(L) + " dégâts"); if (L >= 11) add("relent", "Rage implacable (DD 10, +5 par usage)", 1, "short"); if (L >= 14 && std) add("intim", "Présence intimidante", 1, "long"); if (L >= 15) add("persist", "Rage persistante", 1, "long"); break;
    case "barde": add("insp", "Inspiration bardique", Math.max(1, mod(ab.cha)), L >= 5 ? "short" : "long", bardDie(L)); break;
    case "clerc": if (L >= 2) add("cd", "Conduit divin", L >= 18 ? 4 : L >= 6 ? 3 : 2, "short1"); if (L >= 10) add("interv", "Intervention divine", 1, "long"); break;
    case "druide": if (L >= 2) add("ws", "Forme sauvage", L >= 17 ? 4 : L >= 6 ? 3 : 2, "short1"); if (L >= 6 && std && b.opts.land) add("natrec", "Récupération naturelle", 1, "long"); break;
    case "guerrier": add("sw", "Second souffle", L >= 10 ? 4 : L >= 4 ? 3 : 2, "short1", "1d10+" + L); if (L >= 2) add("surge", "Fougue", L >= 17 ? 2 : 1, "short"); if (L >= 9) add("indom", "Inflexible", L >= 17 ? 3 : L >= 13 ? 2 : 1, "long", "+" + L); break;
    case "moine": if (L >= 2) add("focus", "Points de focalisation", L, "short"); if (L >= 2) add("meta", "Métabolisme extraordinaire", 1, "long"); if (L >= 6 && std) add("whole", "Plénitude du corps", Math.max(1, mod(ab.sag)), "long"); break;
    case "paladin": add("loh", "Imposition des mains (PV)", 5 * L, "long", "réserve"); if (L >= 2) add("smite", "Châtiment gratuit", 1, "long"); if (L >= 3) add("cd", "Conduit divin", L >= 11 ? 3 : 2, "short1"); if (L >= 5) add("steed", "Destrier gratuit", 1, "long"); if (L >= 20 && std) add("nimbe", "Nimbe sacré", 1, "long"); break;
    case "rodeur": add("ennemi", "Marque du chasseur gratuite", L >= 17 ? 6 : L >= 13 ? 5 : L >= 9 ? 4 : L >= 5 ? 3 : 2, "long", L >= 20 ? "d10" : "d6"); if (L >= 10) add("tireless", "Infatigable", Math.max(1, mod(ab.sag)), "long"); if (L >= 14) add("veil", "Voile de la nature", Math.max(1, mod(ab.sag)), "long"); break;
    case "roublard": if (L >= 20) add("luck", "Coup de chance", 1, "short"); break;
    case "ensorceleur": add("innate", "Sorcellerie innée", 2, "long"); if (L >= 2) add("sp", "Points de sorcellerie", L, "long"); if (L >= 5) add("sorcrest", "Restauration ensorcelante", 1, "long"); if (L >= 14 && std) add("wings", "Ailes de dragon", 1, "long"); break;
    case "occultiste": if (L >= 2) add("cunning", "Astuce magique", 1, "long"); if (L >= 6 && std) add("darkluck", "Chance du ténébreux", Math.max(1, mod(ab.cha)), "long", "1d10"); if (L >= 9) add("patron", "Contacter le protecteur", 1, "long"); if (L >= 14 && std) add("hurl", "Jeter en enfer", 1, "long", "8d10"); break;
    case "magicien": add("arcrec", "Restauration arcanique", 1, "long"); break;
  }
  switch (b.species) {
    case "drakeide": add("breath", "Souffle", pb, "long", L >= 5 ? "2d10" : "1d10"); if (L >= 5) add("flight", "Vol draconique", 1, "long"); break;
    case "nain": add("stone", "Connaissance de la pierre", pb, "long"); break;
    case "orc": add("adren", "Poussée d’adrénaline", pb, "short"); add("relent", "Endurance implacable", 1, "long"); break;
    case "goliath": add("giant", "Ascendance de géant", pb, "long"); if (L >= 5) add("large", "Forme imposante", 1, "long"); break;
    case "gnome": if (b.sChoice === "foret") add("sp_comanimaux", "Communication avec les animaux", pb, "long"); break;
  }
  grantedSpells(b).forEach((s) => { if (s.free && s.free.startsWith("sp_") && s.id !== "comanimaux") add(s.free, SPELLS[s.id].n + " (gratuit)", 1, "long"); });
  featsOf(b).forEach((f) => { if (f.id === "initie" && b.magic[f.src].spell) add("mi_" + f.src, SPELLS[b.magic[f.src].spell].n + " (gratuit)", 1, "long"); });
  if (b.cls === "occultiste") Object.entries(b.opts.arcanum).forEach(([lv, id]) => { if (id && L >= ARCANUM_LV[lv]) add("arc_" + lv, SPELLS[id].n + " (arcanum)", 1, "long"); });
  if (L >= 19 && b.opts.boon.id === "destin") add("boonfate", "Faveur du destin", 1, "short", "2d4");
  if (b.cls === "barde" && L >= 3 && std) r.forEach((x) => { if (x.k === "insp") x.note += " · Mots cinglants"; });
  return r;
}

function rageDmg(L) { return L >= 16 ? 4 : L >= 9 ? 3 : 2; }
function bardDie(L) { return L >= 15 ? "d12" : L >= 10 ? "d10" : L >= 5 ? "d8" : "d6"; }

function features(b) {
  const out = [];
  const c = CLASSES[b.cls], sp = SPECIES[b.species];
  if (sp) {
    sp.traits.forEach((t) => {
      const m = t.n.match(/\(niv\. (\d)\)/);
      if (m && b.level < +m[1]) return;
      out.push({ n: t.n.replace(/ \(niv\. \d\)/, ""), d: t.d, src: sp.n });
    });
    const opt = sp.choice && b.sChoice && sp.choice.opts[b.sChoice];
    if (opt) out.push({ n: sp.choice.label + " : " + opt.n, d: opt.d || ("Dégâts de " + DMG[opt.t] + "."), src: sp.n });
  }
  const hs = hbSub(b);
  if (c) for (let l = 1; l <= b.level; l++) {
    (c.feats[l] || []).forEach(([n, d]) => { if (b.subHb && isSubFeat(b.cls, n)) return; out.push({ n, d, src: c.n + " " + l, lvl: l }); });
    if (hs && l >= 3) hs.feats.filter((f) => f.l === l).forEach((f) => out.push({ n: f.n + " (" + hs.n + ")", d: f.d, src: c.n + " " + l, lvl: l }));
  }
  featsOf(b).forEach((f) => out.push({ n: FEATS[f.id].n, d: FEATS[f.id].d, src: f.src === "bg" ? "Historique" : f.src === "human" ? "Humain" : "Don (niv. " + f.src.slice(3) + ")" }));
  if (b.opts.style && FIGHTING_STYLES[b.opts.style]) out.push({ n: "Style : " + FIGHTING_STYLES[b.opts.style].n, d: FIGHTING_STYLES[b.opts.style].d, src: c.n });
  if (b.cls === "guerrier" && b.level >= 7 && srdSub(b) && b.opts.style2 && FIGHTING_STYLES[b.opts.style2]) out.push({ n: "Style : " + FIGHTING_STYLES[b.opts.style2].n, d: FIGHTING_STYLES[b.opts.style2].d, src: "Champion" });
  const so = STRIKE_OPTS[b.cls];
  if (so && b.level >= so.lvl && b.opts.strike && so.opts[b.opts.strike]) out.push({ n: so.label + " : " + so.opts[b.opts.strike].n, d: so.opts[b.opts.strike].d, src: c.n });
  if (b.cls === "ensorceleur" && b.level >= 6 && srdSub(b) && b.opts.dragon) out.push({ n: "Affinité : " + DMG[b.opts.dragon], d: "Résistance aux dégâts de " + DMG[b.opts.dragon] + " ; + mod. Cha aux dégâts de ce type de vos sorts.", src: "Sorcellerie draconique" });
  if (b.level >= 19 && b.opts.boon.id) out.push({ n: EPIC_BOONS[b.opts.boon.id].n, d: EPIC_BOONS[b.opts.boon.id].d, src: "Faveur épique" });
  if (b.cls === "rodeur" && b.level >= 3 && srdSub(b) && b.opts.prey) out.push({ n: b.opts.prey === "colosse" ? "Tueur de colosses" : "Briseur de hordes", d: b.opts.prey === "colosse" ? "Une fois par tour, +1d8 dégâts contre une créature qui n’a pas tous ses PV." : "Une fois par tour, attaque supplémentaire contre une autre créature à 1,50 m de la cible initiale.", src: "Chasseur" });
  if (b.cls === "druide" && b.level >= 3 && srdSub(b) && b.opts.land) out.push({ n: "Terre : " + LAND_SPELLS[b.opts.land].n, d: "Sorts du cercle toujours préparés.", src: "Cercle de la Terre" });
  b.opts.inv.forEach((k) => INVOCATIONS[k] && out.push({ n: INVOCATIONS[k].n, d: INVOCATIONS[k].d, src: "Manifestation" }));
  b.opts.meta.forEach((k) => METAMAGIC[k] && out.push({ n: METAMAGIC[k].n, d: METAMAGIC[k].d, src: "Métamagie" }));
  return out;
}

function compute(b, p) {
  const c = CLASSES[b.cls], sp = SPECIES[b.species], bg = BACKGROUNDS[b.bg];
  const L = b.level, pb = pbOf(L), std = srdSub(b);
  const ab = abilities(b), m = {};
  ABK.forEach((k) => (m[k] = mod(ab[k])));
  const feats = featsOf(b).map((f) => f.id);
  const inv = (p && p.inv) || [];

  // Compétences
  const prof = profSkills(b), exp = new Set(b.expertise);
  const skills = SKK.map((k) => {
    const s = SKILLS[k];
    let v = m[s.a], pr = 0;
    if (prof.has(k)) { pr = exp.has(k) ? 2 : 1; v += pb * pr; }
    else if (b.cls === "barde" && L >= 2) v += Math.floor(pb / 2);
    if (b.cls === "clerc" && b.opts.order === "thaumaturge" && (k === "arca" || k === "reli")) v += Math.max(1, m.sag);
    if (b.cls === "druide" && b.opts.order === "magicien" && (k === "arca" || k === "natu")) v += Math.max(1, m.sag);
    return { k, n: s.n, a: s.a, v, pr };
  });
  const saveProf = new Set(c ? c.saves : []);
  if (b.cls === "moine" && L >= 14) ABK.forEach((k) => saveProf.add(k));
  if (b.cls === "roublard" && L >= 15) { saveProf.add("sag"); saveProf.add("cha"); }
  const aura = b.cls === "paladin" && L >= 6 ? Math.max(1, m.cha) : 0;
  const saves = ABK.map((k) => ({ k, v: m[k] + (saveProf.has(k) ? pb : 0) + aura, pr: saveProf.has(k) }));

  // Armure & CA
  const eqArmor = inv.find((i) => i.eq && i.ref && i.ref.startsWith("a:") && ARMORS[i.ref.slice(2)] && ARMORS[i.ref.slice(2)].t !== "bouclier");
  const eqShield = inv.find((i) => i.eq && i.ref === "a:bouclier");
  const armor = eqArmor && ARMORS[eqArmor.ref.slice(2)];
  const aprof = armorProfs(b);
  let ac, acNote;
  if (armor) {
    ac = armor.ac + Math.min(m.dex, armor.dex); acNote = armor.n;
    if ((b.opts.style === "defense" && (b.cls === "guerrier" || b.cls === "paladin" || b.cls === "rodeur")) || (b.cls === "guerrier" && L >= 7 && std && b.opts.style2 === "defense")) ac += 1;
  } else {
    const opts = [{ v: 10 + m.dex, n: "Sans armure" }];
    if (b.cls === "barbare") opts.push({ v: 10 + m.dex + m.con, n: "Défense sans armure" });
    if (b.cls === "moine" && !eqShield) opts.push({ v: 10 + m.dex + m.sag, n: "Défense sans armure" });
    if (b.cls === "ensorceleur" && L >= 3 && std) opts.push({ v: 10 + m.dex + m.cha, n: "Résilience draconique" });
    const best = opts.sort((x, y) => y.v - x.v)[0];
    ac = best.v; acNote = best.n;
  }
  if (eqShield) { ac += 2; acNote += " + " + ARMORS.bouclier.n.toLowerCase(); }
  const armorWarn = (armor && !aprof.includes(armor.t)) || (eqShield && !aprof.includes("bouclier"));
  const stealthDis = armor && armor.st;

  // Vitesse
  let speed = sp ? sp.speed : 9;
  const opt = sp && sp.choice && b.sChoice && sp.choice.opts[b.sChoice];
  if (opt && opt.speed) speed = opt.speed;
  if (b.cls === "barbare" && L >= 5 && !(armor && armor.t === "lourde")) speed += 3;
  if (b.cls === "moine" && L >= 2 && !armor && !eqShield) speed += L >= 18 ? 9 : L >= 14 ? 7.5 : L >= 10 ? 6 : L >= 6 ? 4.5 : 3;
  if (b.cls === "rodeur" && L >= 6 && !(armor && armor.t === "lourde")) speed += 3;
  if (armor && armor.str && ab.for < armor.str) speed -= 3;
  let darkvision = sp ? sp.dv : 0;
  if (opt && opt.dv) darkvision = opt.dv;

  // Attaques
  const attacks = [];
  const maDie = martialDie(L);
  const archery = b.opts.style === "archerie" || (b.cls === "guerrier" && L >= 7 && std && b.opts.style2 === "archerie");
  const crit = b.cls === "guerrier" && std ? (L >= 15 ? 18 : L >= 3 ? 19 : 20) : 20;
  inv.filter((i) => i.eq && i.ref && i.ref.startsWith("w:")).forEach((i) => {
    const w = WEAPONS[i.ref.slice(2)];
    if (!w) return;
    const isMonkW = b.cls === "moine" && w.k === "cac" && (w.c === "simple" || w.p.includes("L"));
    let a = w.k === "dist" ? "dex" : "for";
    if (w.p.includes("F") || isMonkW) a = m.dex > m.for ? "dex" : "for";
    const proficient = weaponProf(b, w);
    let hit = m[a] + (proficient ? pb : 0) + (archery && w.k === "dist" ? 2 : 0);
    let die = w.d;
    if (isMonkW && dieAvg(maDie) > dieAvg(die)) die = maDie;
    const mastery = c && c.mastery && b.opts.mastery.includes(i.ref.slice(2)) ? w.m : null;
    const props = w.p.map((x) => WPROP[x]).join(", ");
    attacks.push({
      n: w.n, hit, dmg: die + (m[a] ? sg(m[a]).replace("−", "-") : ""), alt: w.v ? w.v + (m[a] ? sg(m[a]).replace("−", "-") : "") : null,
      ty: DMG[w.t], range: w.r || (w.p.includes("AL") ? "3 m" : "1,50 m"), props, mastery, prof: proficient, crit,
      rage: b.cls === "barbare" && a === "for",
    });
  });
  const unarmedA = b.cls === "moine" && m.dex > m.for ? "dex" : "for";
  attacks.push({ n: "Frappe à mains nues", hit: m[unarmedA] + pb, dmg: b.cls === "moine" ? maDie + (m[unarmedA] ? sg(m[unarmedA]).replace("−", "-") : "") : String(Math.max(1, 1 + m.for)), ty: DMG.contondant, range: "1,50 m", props: "", prof: true, crit, rage: b.cls === "barbare" });

  // Incantation
  let casting = null;
  const granted = grantedSpells(b);
  if (c && c.caster) {
    casting = { ab: c.sab, dc: 8 + pb + m[c.sab], atk: pb + m[c.sab], slots: slotsOf(b), max: maxSpellLevel(b) };
  }
  const spellList = [];
  const potent = (b.cls === "clerc" || b.cls === "druide") && L >= 7 && b.opts.strike === "puissant";
  const dmgBonus = (s) => {
    let v = 0, why = [];
    if (s.l === 0 && potent && s.cl.includes(b.cls)) { v += m.sag; why.push("Incantation puissante"); }
    if (b.cls === "magicien" && L >= 10 && std && s.e === "evo" && s.l > 0 && s.cl.includes("magicien")) { v += m.int; why.push("Évocation surpuissante"); }
    if (b.cls === "ensorceleur" && L >= 6 && std && b.opts.dragon && s.ty === b.opts.dragon) { v += m.cha; why.push("Affinité élémentaire"); }
    if (b.cls === "occultiste" && s.id === "dechargeocculte" && b.opts.inv.includes("dechiree")) { v += m.cha; why.push("Décharge déchirante"); }
    return { v, why };
  };
  const pushSpell = (id, src, abk, always, free) => {
    const s = SPELLS[id];
    if (!s || spellList.some((x) => x.id === id)) return;
    const db = s.dmg ? dmgBonus({ ...s, id }) : { v: 0, why: [] };
    spellList.push({ id, ...s, src, ab: abk, dc: 8 + pb + m[abk], atk: pb + m[abk], mod: m[abk], always, free, dmgBonus: db.v, dmgWhy: db.why });
  };
  b.cant.forEach((id) => pushSpell(id, c.n, c.sab, false));
  b.prep.forEach((id) => pushSpell(id, c.n, c.sab, false));
  granted.forEach((g) => pushSpell(g.id, g.src, g.ab, true, g.free));
  spellList.sort((x, y) => x.l - y.l || x.n.localeCompare(y.n, "fr"));

  const init = m.dex + (feats.includes("vigilant") ? pb : 0);
  const perc = skills.find((s) => s.k === "perc").v;

  const langs = ["Commun", ...b.langs.map((l) => LANG_L[l] || l)];
  if (b.cls === "roublard") langs.push("Argot des voleurs");
  if (b.cls === "druide") langs.push("Druidique");

  return {
    L, pb, ab, m, skills, saves, ac, acNote, armorWarn, stealthDis, speed, darkvision, init, perc,
    hpMax: hpMax(b, ab), hd: c ? c.hd : 8, attacks, casting, spells: spellList,
    resources: resources(b, ab), features: features(b), langs,
    sneak: b.cls === "roublard" ? Math.ceil(L / 2) + "d6" : null, rageDmg: b.cls === "barbare" ? rageDmg(L) : 0,
    apa: attacksPerAction(b), crit, aura, maDie,
    profs: {
      armor: aprof.map((a) => ({ legere: "Légères", inter: "Intermédiaires", lourde: "Lourdes", bouclier: "Boucliers" })[a]).join(", ") || "Aucune",
      weapons: c ? c.weapons.map((w) => ({ simple: "Armes simples", guerre: "Armes de guerre", guerreLegere: "Armes de guerre légères", guerreFinesse: "Armes de guerre (finesse ou légères)" })[w]).join(", ") + ((b.cls === "clerc" && b.opts.order === "protecteur") || (b.cls === "druide" && b.opts.order === "gardien") ? ", armes de guerre" : "") : "",
      tools: [c && c.tools !== "—" ? c.tools : null, bg ? bg.tool : null].filter(Boolean).join(", ") || "Aucun",
    },
    sub: c && L >= 3 ? subName(b) : null,
  };
}

function dieAvg(d) { const [n, f] = d.split("d").map(Number); return n * (f + 1) / 2; }

/* Équipement de départ → inventaire */
function itemFrom(entry) {
  const [ref, q] = entry;
  if (ref.startsWith("w:")) return { uid: uid(), ref, n: WEAPONS[ref.slice(2)].n, q: q || 1, eq: false };
  if (ref.startsWith("a:")) return { uid: uid(), ref, n: ARMORS[ref.slice(2)].n, q: 1, eq: false };
  return { uid: uid(), ref: "g:" + ref, n: GEAR[ref] || ref, q: q || 1, eq: false };
}
function itemName(i) {
  if (i.ref && i.ref.startsWith("w:") && WEAPONS[i.ref.slice(2)]) return WEAPONS[i.ref.slice(2)].n;
  if (i.ref && i.ref.startsWith("a:") && ARMORS[i.ref.slice(2)]) return ARMORS[i.ref.slice(2)].n;
  if (i.ref && i.ref.startsWith("g:") && GEAR[i.ref.slice(2)]) return GEAR[i.ref.slice(2)];
  if (i.ref && i.ref.startsWith("mi:") && typeof MAGIC_ITEMS !== "undefined" && MAGIC_ITEMS[i.ref.slice(3)]) return MAGIC_ITEMS[i.ref.slice(3)].n;
  return i.n;
}
function startingInventory(b) {
  const c = CLASSES[b.cls], bg = BACKGROUNDS[b.bg];
  let inv = [], gold = 0;
  if (c) {
    if (b.gear.cls === "A") { inv.push(...c.gearA.map(itemFrom)); gold += c.goldA; }
    else if (b.gear.cls === "B" && c.gearB) { inv.push(...c.gearB.map(itemFrom)); gold += c.goldBg; }
    else gold += c.goldB;
  }
  if (bg) { if (b.gear.bg === "A") { inv.push(...bg.gear.map(itemFrom)); gold += bg.gold; } else gold += 50; }
  // équiper automatiquement : meilleure armure maîtrisée, bouclier, armes
  const aprof = armorProfs(b);
  const armors = inv.filter((i) => i.ref.startsWith("a:") && i.ref !== "a:bouclier" && aprof.includes(ARMORS[i.ref.slice(2)].t));
  if (armors.length) armors.sort((x, y) => ARMORS[y.ref.slice(2)].ac - ARMORS[x.ref.slice(2)].ac)[0].eq = true;
  const sh = inv.find((i) => i.ref === "a:bouclier");
  if (sh && aprof.includes("bouclier")) sh.eq = true;
  inv.filter((i) => i.ref.startsWith("w:")).forEach((i) => (i.eq = true));
  // fusionner les doublons
  const merged = [];
  inv.forEach((i) => { const f = merged.find((x) => x.ref === i.ref); if (f) f.q += i.q; else merged.push(i); });
  return { inv: merged, gold };
}

function newPlay(b) {
  const s = startingInventory(b);
  const p = { hp: 0, temp: 0, hdUsed: 0, slots: {}, pact: 0, res: {}, ds: { s: 0, f: 0 }, cond: [], insp: b.species === "humain", inv: s.inv, gold: s.gold, notes: "", conc: null };
  p.hp = compute(b, p).hpMax;
  return p;
}

/* Validation par étape : liste de messages manquants */
function issues(b) {
  const out = { classe: [], origine: [], carac: [], options: [], sorts: [], equip: [], details: [] };
  const c = CLASSES[b.cls], sp = SPECIES[b.species], bg = BACKGROUNDS[b.bg];
  if (!c) out.classe.push("Choisissez une classe");
  if (!sp) out.origine.push("Choisissez une espèce");
  if (sp && sp.choice && !b.sChoice) out.origine.push(sp.choice.label);
  if (!bg) out.origine.push("Choisissez un historique");
  if (c && b.subHb && !hbSub(b)) out.classe.push("Sous-classe maison introuvable");
  if (bg && b.bonus.mode === "21" && (!b.bonus.p2 || !b.bonus.p1 || b.bonus.p1 === b.bonus.p2)) out.carac.push("Répartissez les bonus d’historique");
  if (b.method === "points") { const spent = ABK.reduce((t, k) => t + (PB_COST[b.base[k]] ?? 99), 0); if (spent > 27) out.carac.push("Trop de points dépensés"); }
  if (b.method === "roll" && !b.rolled) out.carac.push("Lancez les dés");
  migrate(b);
  activeAsiLevels(b).forEach((lv) => {
    const a = b.opts.asis[lv];
    if (a && a.mode === "feat") { const f = FEATS[a.feat]; if (!f || ((f.ab || []).length && !a.a)) out.carac.push("Don (niv. " + lv + ")"); return; }
    if (!a || !a.a || (a.mode === "11" && (!a.b || a.b === a.a))) out.carac.push("Amélioration (niv. " + lv + ")");
  });
  if (b.level >= 19 && (!b.opts.boon.id || !b.opts.boon.a)) out.carac.push("Faveur épique (niv. 19)");
  if (c) {
    const need = c.skills.n;
    if (b.skillsClass.length < need) out.options.push(`Compétences de classe (${b.skillsClass.length}/${need})`);
    if (sp && sp.skillPick && b.skillsSpecies.length < sp.skillPick.n) out.options.push("Compétence d’espèce");
    if (featsOf(b).some((f) => f.id === "doue") && b.skilled.length < 3) out.options.push(`Don Doué (${b.skilled.length}/3)`);
    if (b.species === "humain" && !b.humanFeat) out.options.push("Don d’origine (humain)");
    featsOf(b).forEach((f) => { if (f.id === "initie") { const mm = b.magic[f.src]; if (mm.cant.length < 2 || !mm.spell) out.options.push("Sorts d’Initié à la magie"); } });
    const ex = expertiseCount(b); if (b.expertise.length < ex) out.options.push(`Expertise (${b.expertise.length}/${ex})`);
    if (b.cls === "barde" && b.level >= 3 && srdSub(b) && b.skillsLore.length < 3) out.options.push("Compétences du Collège du Savoir");
    if (b.cls === "barbare" && b.level >= 3 && !b.skillPrimal) out.options.push("Savoir primitif");
    if (c.mastery && b.opts.mastery.length < c.mastery) out.options.push(`Maîtrise d’arme (${b.opts.mastery.length}/${c.mastery})`);
    if ((b.cls === "guerrier" || (["paladin", "rodeur"].includes(b.cls) && b.level >= 2)) && !b.opts.style) out.options.push("Style de combat");
    if ((b.cls === "clerc" || b.cls === "druide") && !b.opts.order) out.options.push(b.cls === "clerc" ? "Ordre divin" : "Ordre primitif");
    if (b.cls === "occultiste" && b.opts.inv.length < c.inv[b.level - 1]) out.options.push(`Manifestations (${b.opts.inv.length}/${c.inv[b.level - 1]})`);
    if (b.cls === "ensorceleur" && b.level >= 2 && b.opts.meta.length < metaCount(b)) out.options.push(`Métamagie (${b.opts.meta.length}/${metaCount(b)})`);
    if (b.cls === "ensorceleur" && b.level >= 6 && srdSub(b) && !b.opts.dragon) out.options.push("Affinité élémentaire");
    if (b.cls === "guerrier" && b.level >= 7 && srdSub(b) && !b.opts.style2) out.options.push("Second style de combat");
    if (STRIKE_OPTS[b.cls] && b.level >= STRIKE_OPTS[b.cls].lvl && !b.opts.strike) out.options.push(STRIKE_OPTS[b.cls].label);
    if (b.cls === "rodeur" && b.level >= 3 && srdSub(b) && !b.opts.prey) out.options.push("Proie du chasseur");
    if (b.cls === "druide" && b.level >= 3 && srdSub(b) && !b.opts.land) out.options.push("Type de terre");
    if (c.caster) {
      if (b.cant.length < cantripCount(b)) out.sorts.push(`Tours de magie (${b.cant.length}/${cantripCount(b)})`);
      if (b.prep.length < prepCount(b)) out.sorts.push(`Sorts préparés (${b.prep.length}/${prepCount(b)})`);
      if (b.cls === "barde" && b.level >= 6 && srdSub(b) && b.opts.lore2.length < 2) out.sorts.push(`Découvertes magiques (${b.opts.lore2.length}/2)`);
      if (b.cls === "occultiste") Object.entries(ARCANUM_LV).forEach(([sl, lv]) => { if (b.level >= lv && !b.opts.arcanum[sl]) out.sorts.push("Arcanum de niveau " + sl); });
    }
  }
  if (!b.name.trim()) out.details.push("Donnez un nom");
  return out;
}

/* ---------- Dés ---------- */
function rollDie(f) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) { const a = new Uint32Array(1); crypto.getRandomValues(a); return (a[0] % f) + 1; }
  return Math.floor(Math.random() * f) + 1;
}
// "2d6+1d4+3" → { total, parts:[{d:6, r:[..]}], mod }
function rollExpr(expr, opts = {}) {
  const clean = String(expr).replace(/\s/g, "").replace(/−/g, "-").toLowerCase();
  const re = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g;
  let mt, total = 0, parts = [], modv = 0;
  while ((mt = re.exec(clean))) {
    if (mt[3]) {
      const sgn = mt[1] === "-" ? -1 : 1, n = Math.min(+(mt[2] || 1) * (opts.crit ? 2 : 1), 100), f = +mt[3];
      const r = Array.from({ length: n }, () => rollDie(f));
      parts.push({ d: f, r, sgn });
      total += sgn * r.reduce((a, x) => a + x, 0);
    } else if (mt[5]) { const v = (mt[4] === "-" ? -1 : 1) * +mt[5]; modv += v; total += v; }
  }
  return { total, parts, mod: modv };
}
function rollD20(modv, mode) {
  const a = rollDie(20), b2 = mode !== "normal" ? rollDie(20) : null;
  let kept = a;
  if (mode === "adv") kept = Math.max(a, b2);
  if (mode === "dis") kept = Math.min(a, b2);
  return { dice: b2 == null ? [a] : [a, b2], kept, total: kept + modv, mod: modv, mode };
}

if (typeof module !== "undefined") module.exports = { migrate, metaCount, compute, newBuild, newPlay, issues, abilities, assignStandard, rollExpr, rollD20, grantedSpells, cantripCount, prepCount, classSpellPool, maxSpellLevel, profSkills, expertisePool, expertiseCount };
