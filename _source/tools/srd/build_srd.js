/* Construit les données SRD 5.2 (bestiaire et objets magiques) en français et en anglais.
   Source : 5e-bits/5e-database (src/2024/en), contenu SRD 5.2 de Wizards of the Coast LLC, CC-BY-4.0.
   Sortie : out/srd.fr.js et out/srd.en.js  (const MONSTERS, MAGIC_ITEMS) */
const fs = require("fs");
const path = require("path");
const { sentences, frag, m: ftToM } = require("./split");
const ROOT = "/home/claude/5e-bits/5e-database/src/2024/en/";
const M = require(ROOT + "5e-SRD-Monsters.json");
const I = require(ROOT + "5e-SRD-Magic-Items.json");
const NAMES = require("./fr/names.js");
const ACTS = require("./fr/acts.json");
const MISC = require("./fr/misc.json");
const INAMES = fs.existsSync(path.join(__dirname, "fr/inames.json")) ? require("./fr/inames.json") : {};

/* Dictionnaire des phrases : todo/<lot>.json (anglais) aligné avec fr/<lot>.json (français) */
function loadPairs(prefix) {
  const map = {};
  for (const f of fs.readdirSync(path.join(__dirname, "todo")).filter((f) => f.startsWith(prefix + "-"))) {
    const frf = path.join(__dirname, "fr", f);
    if (!fs.existsSync(frf)) continue;
    const en = JSON.parse(fs.readFileSync(path.join(__dirname, "todo", f), "utf8"));
    const fr = JSON.parse(fs.readFileSync(frf, "utf8"));
    if (en.length !== fr.length) throw new Error(`${f} : ${en.length} anglais / ${fr.length} français`);
    en.forEach((k, i) => {
      const ph = (s) => (s.match(/\{\d+\}/g) || []).sort().join("");
      if (ph(k) !== ph(fr[i])) throw new Error(`${f}[${i}] repères différents :\n  ${k}\n  ${fr[i]}`);
      map[k] = fr[i];
    });
  }
  return map;
}
const SENT = loadPairs("sent");
const ISENT = loadPairs("isent");
const missing = { sent: new Set(), isent: new Set() };

const fill = (tpl, vals) => tpl.replace(/\{(\d+)\}/g, (_, i) => vals[+i]);
function trText(text, dict, miss) {
  const out = [];
  sentences(text).forEach((s) => {
    if (s === "\n") { out.push("\n"); return; }
    const parts = frag(s);
    let ok = true, res = "";
    parts.forEach((p) => {
      if (typeof p === "string") { res += p; return; }
      const t = dict[p.k];
      if (t == null) { ok = false; miss.add(p.k); return; }
      res += fill(t, p.v);
    });
    out.push(ok ? res : s.replace(/ ft§/g, " ft."));
  });
  return out.join(" ").replace(/ ?\n ?/g, "\n").replace(/ ([,.])/g, "$1").trim();
}

/* Traductions des champs fixes */
const SIZE = { Tiny: "Très petite", Small: "Petite", Medium: "Moyenne", Large: "Grande", Huge: "Très grande", Gargantuan: "Gigantesque", "Medium or small": "Moyenne ou Petite" };
const TYPE = { aberration: "Aberration", elemental: "Élémentaire", construct: "Créature artificielle", monstrosity: "Créature monstrueuse", humanoid: "Humanoïde", plant: "Plante", fiend: "Fiélon", dragon: "Dragon", ooze: "Vase", fey: "Fée", giant: "Géant", celestial: "Céleste", "swarm of tiny undead": "Nuée de très petits morts-vivants", undead: "Mort-vivant", beast: "Bête", "swarm of tiny beasts": "Nuée de très petites bêtes" };
const ALIGN = { "lawful evil": "Loyal mauvais", neutral: "Neutre", unaligned: "Sans alignement", "lawful neutral": "Loyal neutre", "chaotic evil": "Chaotique mauvais", "neutral evil": "Neutre mauvais", "lawful good": "Loyal bon", "chaotic good": "Chaotique bon", "neutral good": "Neutre bon", "chaotic neutral": "Chaotique neutre" };
const DMGW = { acid: "acide", bludgeoning: "contondant", cold: "froid", fire: "feu", force: "force", lightning: "foudre", necrotic: "nécrotique", piercing: "perforant", poison: "poison", psychic: "psychique", radiant: "radiant", slashing: "tranchant", thunder: "tonnerre" };
const COND = { Exhaustion: "Épuisement", Grappled: "Agrippé", Paralyzed: "Paralysé", Petrified: "Pétrifié", Poisoned: "Empoisonné", Prone: "À terre", Restrained: "Entravé", Unconscious: "Inconscient", Charmed: "Charmé", Deafened: "Assourdi", Frightened: "Effrayé", Incapacitated: "Neutralisé", Stunned: "Étourdi", Blinded: "Aveuglé" };
const SPEED = { walk: ["", ""], swim: ["nage", "swim"], fly: ["vol", "fly"], climb: ["escalade", "climb"], burrow: ["creusement", "burrow"] };
const SENSE = { darkvision: ["vision dans le noir", "darkvision"], blindsight: ["vision aveugle", "blindsight"], tremorsense: ["perception des vibrations", "tremorsense"], truesight: ["vision véritable", "truesight"] };
const SKILL = { History: "hist", Perception: "perc", Acrobatics: "acro", Stealth: "disc", Athletics: "athl", Deception: "trom", Insight: "pspi", Persuasion: "psua", Survival: "surv", Religion: "reli", Medicine: "mede", Nature: "natu", Performance: "repr", Arcana: "arca", Investigation: "inve", "Sleight of Hand": "esca", Intimidation: "inti", "Animal Handling": "dres" };
const ABK = { STR: "for", DEX: "dex", CON: "con", INT: "int", WIS: "sag", CHA: "cha" };
const ftTxt = (v, lang) => { const n = parseInt(v, 10); return lang === "fr" ? ftToM(n) + " m" : n + " ft."; };
const crTxt = (c) => (c === 0.125 ? "1/8" : c === 0.25 ? "1/4" : c === 0.5 ? "1/2" : String(c));

/* Noms de sorts : anglais → français, d’après l’app (data.js + dictionnaire anglais) et les sorts ajoutés */
function spellNames() {
  const src = fs.readFileSync("/home/claude/forge/src/data.js", "utf8") + fs.readFileSync("/home/claude/forge/src/data2.js", "utf8") + (fs.existsSync("/home/claude/forge/src/data3.js") ? fs.readFileSync("/home/claude/forge/src/data3.js", "utf8") : "");
  const SP = new Function(src + ";return SPELLS;")();
  const dict = {};
  for (const f of fs.readdirSync("/home/claude/forge/tools/en")) Object.assign(dict, JSON.parse(fs.readFileSync("/home/claude/forge/tools/en/" + f, "utf8")));
  const map = {};
  Object.values(SP).forEach((s) => { if (dict[s.n]) map[dict[s.n].toLowerCase().replace(/[’']/g, "'")] = s.n; });
  return map;
}
const SPN = spellNames();
const spFr = (en) => SPN[en.toLowerCase().replace(/[’']/g, "'")] || en;

function usageTxt(u, lang) {
  if (!u) return "";
  const fr = lang === "fr";
  if (u.type === "per day") return ` (${u.times}/${fr ? "jour" : "Day"}${u.times_in_lair ? fr ? `, ${u.times_in_lair}/jour dans son antre` : `, or ${u.times_in_lair}/Day in Lair` : ""})`;
  if (u.type === "recharge on roll") return ` (Recharge ${u.min_value === 6 ? "6" : u.min_value + "–6"})`;
  if (u.type === "recharge after rest") return fr ? " (Recharge après un repos court ou long)" : " (Recharges after a Short or Long Rest)";
  return "";
}
function spellList(sc, lang) {
  if (!sc || !sc.spells || !sc.spells.length) return "";
  const groups = {};
  sc.spells.forEach((s) => {
    const u = s.usage || { type: "at will" };
    const key = u.type === "at will" ? (lang === "fr" ? "À volonté" : "At will") : u.type === "per day" ? `${u.times}/${lang === "fr" ? "jour chacun" : "Day each"}` : u.type;
    (groups[key] = groups[key] || []).push(lang === "fr" ? spFr(s.name) : s.name);
  });
  return "\n" + Object.entries(groups).map(([k, v]) => `${k} : ${v.join(", ")}`.replace(lang === "fr" ? /^/ : / : /, lang === "fr" ? "" : ": ")).join("\n");
}

function monster(mo, lang) {
  const fr = lang === "fr";
  const T = (k, d) => (fr ? d[k] || k : k);
  const sp = Object.entries(mo.speed).filter(([k]) => k !== "hover").map(([k, v]) => (SPEED[k] ? (SPEED[k][fr ? 0 : 1] ? SPEED[k][fr ? 0 : 1] + " " : "") : k + " ") + ftTxt(v, lang) + (k === "fly" && mo.speed.hover ? (fr ? " (stationnaire)" : " (hover)") : "")).join(", ");
  const sen = Object.entries(mo.senses).filter(([k]) => k !== "passive_perception").map(([k, v]) => (SENSE[k] ? SENSE[k][fr ? 0 : 1] : k) + " " + ftTxt(v, lang) + (/blind beyond/.test(String(v)) ? (fr ? " (aveugle au-delà)" : " (blind beyond this radius)") : ""));
  const sv = [], sk = [];
  (mo.proficiencies || []).forEach((p) => {
    const n = p.proficiency.name;
    let mm = n.match(/^Saving Throw: (\w+)/); if (mm && ABK[mm[1]]) sv.push([ABK[mm[1]], p.value]);
    mm = n.match(/^Skill: (.+)$/); if (mm && SKILL[mm[1]]) sk.push([SKILL[mm[1]], p.value]);
  });
  const block = (arr) => (arr || []).map((a) => {
    let d = fr ? trText(a.desc, SENT, missing.sent) : a.desc;
    if (a.spellcasting) d += spellList(a.spellcasting, lang);
    return [(fr ? ACTS[a.name] || a.name : a.name) + usageTxt(a.usage, lang), d];
  });
  const acArmor = (mo.armor_class[0].armor || []).map((x) => x.name).join(", ");
  const out = {
    n: fr ? NAMES[mo.name] || mo.name : mo.name,
    sz: fr ? SIZE[mo.size] || mo.size : mo.size,
    ty: fr ? TYPE[mo.type] || mo.type : mo.type[0].toUpperCase() + mo.type.slice(1),
    al: fr ? ALIGN[mo.alignment] || mo.alignment : mo.alignment[0].toUpperCase() + mo.alignment.slice(1),
    ac: mo.armor_class[0].value, hp: mo.hit_points, hd: (mo.hit_points_roll || mo.hit_dice).replace(/\s/g, ""),
    sp, ab: [mo.strength, mo.dexterity, mo.constitution, mo.intelligence, mo.wisdom, mo.charisma],
    cr: crTxt(mo.challenge_rating), xp: mo.xp, pb: mo.proficiency_bonus, pp: mo.senses.passive_perception,
  };
  if (mo.name !== out.n) out.en = mo.name;
  if (sv.length) out.sv = sv;
  if (sk.length) out.sk = sk;
  if (sen.length) out.sen = sen.join(", ");
  const dl = (arr) => arr.map((x) => (fr ? DMGW[x] || MISC[x] || x : x)).join(", ");
  if (mo.damage_vulnerabilities.length) out.vul = dl(mo.damage_vulnerabilities);
  if (mo.damage_resistances.length) out.res = dl(mo.damage_resistances);
  if (mo.damage_immunities.length) out.imm = dl(mo.damage_immunities);
  if (mo.condition_immunities.length) out.ci = mo.condition_immunities.map((c) => { const n = c.name || c; return fr ? COND[n] || n : n; }).join(", ");
  if (mo.languages) out.lang = fr ? MISC[mo.languages] || mo.languages : mo.languages;
  if (mo.gear) out.gear = fr ? MISC[mo.gear] || mo.gear : mo.gear;
  if (acArmor && !fr) out.acn = acArmor;
  const keys = { special_abilities: "tr", actions: "act", bonus_actions: "ba", reactions: "re", legendary_actions: "la" };
  Object.entries(keys).forEach(([k, o]) => { const b = block(mo[k]); if (b.length) out[o] = b; });
  return out;
}

const RAR = { Common: "commun", Uncommon: "peu commun", Rare: "rare", "Very Rare": "très rare", Legendary: "légendaire", Artifact: "artefact" };
function item(it, lang) {
  const fr = lang === "fr";
  const lines = String(it.desc).split(/\n/).map((x) => x.trim()).filter(Boolean);
  const head = lines.shift() || "";
  const body = lines.join("\n");
  const rk = (it.rarity.name.match(/^(Common|Uncommon|Rare|Very Rare|Legendary|Artifact)/) || [])[1] || "";
  const o = {
    n: fr ? INAMES[it.name] || it.name : it.name,
    h: fr ? trText(head, ISENT, missing.isent) : head,
    r: RAR[rk] || "",
    d: fr ? trText(body, ISENT, missing.isent) : body,
  };
  if (it.attunement || /Requires Attunement/i.test(head)) o.at = 1;
  if (fr && o.n !== it.name) o.en = it.name;
  if (it.variants && it.variants.length) o.vg = 1; // entrée générique qui regroupe des variantes
  return o;
}

fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
for (const lang of ["fr", "en"]) {
  const mons = {}, items = {};
  M.forEach((mo) => (mons[mo.index] = monster(mo, lang)));
  I.forEach((it) => (items[it.index] = item(it, lang)));
  const head = `/* Forge des Héros — bestiaire et objets magiques du SRD 5.2 (Wizards of the Coast LLC, CC-BY-4.0)${lang === "fr" ? ", traduction non officielle" : ""}. Fichier généré. */\n`;
  fs.writeFileSync(path.join(__dirname, "out", `srd.${lang}.js`), head + "const MONSTERS = " + JSON.stringify(mons) + ";\nconst MAGIC_ITEMS = " + JSON.stringify(items) + ";\n");
}
console.log("phrases non traduites : monstres", missing.sent.size, "· objets", missing.isent.size, "· noms d’objets", I.filter((x) => !INAMES[x.name]).length);
console.log("tailles", fs.statSync(path.join(__dirname, "out/srd.fr.js")).size, fs.statSync(path.join(__dirname, "out/srd.en.js")).size);
