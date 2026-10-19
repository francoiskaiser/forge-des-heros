// Découpage des blocs de statistiques en fragments : formules traduites automatiquement, reste via dictionnaire
const DT = { acid: "d’acide", bludgeoning: "contondants", cold: "de froid", fire: "de feu", force: "de force", lightning: "de foudre", necrotic: "nécrotiques", piercing: "perforants", poison: "de poison", psychic: "psychiques", radiant: "radiants", slashing: "tranchants", thunder: "de tonnerre" };
const AB = { Strength: "Force", Dexterity: "Dextérité", Constitution: "Constitution", Intelligence: "Intelligence", Wisdom: "Sagesse", Charisma: "Charisme" };
function m(ft) { const v = Math.round(ft * 0.3 * 2) / 2; return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ","); }
function len(ft) { return ft < 5 ? Math.round(ft * 30) + " cm" : m(ft) + " m"; }
function sentences(text) {
  const prot = String(text).replace(/ ft\./g, " ft§");
  const out = [];
  prot.split(/\n+/).forEach((line, li) => {
    if (li) out.push("\n");
    const parts = line.match(/[^.!?]+(?:[.!?]+["”’)]*|$)/g) || [];
    let buf = "";
    parts.forEach((p) => { buf += p; if (/\b(e\.g|i\.e|etc|vs|St|Mr)\.$/.test(buf.trim())) return; if (buf.trim()) out.push(buf.trim()); buf = ""; });
    if (buf.trim()) out.push(buf.trim());
  });
  return out;
}
const TY = "(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder)";
const D1 = "(\\d+) \\((\\d+d\\d+(?: [+−-] \\d+)?)\\) " + TY + " damage";
const D0 = "(\\d+) " + TY + " damage";
const ONE = "(?:" + D1 + "|" + D0 + ")";
const LIST = new RegExp("^(" + ONE + "(?:,? plus " + ONE + ")*)(.*)$");
function dmgFr(s) {
  return s.replace(new RegExp(D1, "g"), (_, n, d, t) => `${n} (${d.replace("-", "−")}) dégâts ${DT[t.toLowerCase()]}`)
    .replace(new RegExp(D0, "g"), (_, n, t) => `${n} dégât${+n > 1 ? "s" : ""} ${DT[t.toLowerCase()]}`)
    .replace(/,? plus /g, " plus ");
}
const rangeFr = (s) => s.replace(/(\d+)\/(\d+) ft§/g, (_, a, b) => m(+a) + "/" + m(+b) + " m").replace(/(\d+) ft§/g, (_, a) => m(+a) + " m").replace("reach", "allonge").replace(/range/g, "portée").replace(" or ", " ou ");
/* Normalise une phrase : distances et jets chiffrés deviennent {0}, {1}… (valeurs déjà converties) */
function normDist(s) {
  const vals = [];
  const put = (v) => "{" + (vals.push(v) - 1) + "}";
  let k = s.replace(/[\u2010\u2011]/g, "-").replace(/foot(wide|long)/g, "foot-$1").replace(/(\d+) \((\d+d\d+(?: [+−-] \d+)?)\)/g, (_, n, d) => put(n + " (" + d.replace("-", "−") + ")"))
    .replace(/(\d+)(?:-| )(?:feet|foot)\b/g, (_, n) => put(len(+n)))
    .replace(/(\d+) ft§/g, (_, n) => put(m(+n) + " m"))
    .replace(/\bDC (\d+)/g, (_, n) => put("DD " + n))
    .replace(/([+−-]\d+) to hit/g, (_, n) => put(n.replace("-", "−")) + " to hit")
    .replace(/(\d+) miles?\b/g, (_, n) => put(String(Math.round(+n * 1.5 * 10) / 10).replace(".", ",") + " km"));
  return { key: k, vals };
}
/* Retourne une liste de fragments : chaîne = déjà en français ; { k } = clé du dictionnaire */
function frag(s) {
  let mm = s.match(/^(Melee|Ranged|Melee or Ranged) Attack Roll: ([+−-]\d+)( \([^)]*\))?(?:, ((?:reach|range) [\d\/]+ ft§(?: or range [\d\/]+ ft§)?))?(?:,? (?!Hit:)(.*?))?(?: Hit: (.*))?$/);
  if (mm && (mm[6] || /ft§$/.test(s) || /feet\.$/.test(s))) {
    const kind = { "Melee": "au corps à corps", "Ranged": "à distance", "Melee or Ranged": "au corps à corps ou à distance" }[mm[1]];
    const out = [`Jet d’attaque ${kind} : ${mm[2].replace("-", "−")}`];
    if (mm[3]) out.push(nk(mm[3]));
    if (mm[4]) out.push(", " + rangeFr(mm[4]));
    if (mm[5]) out.push(nk(", " + mm[5]));
    if (!mm[6]) { out.push("."); return out; }
    out.push(". ");
    out.push(...hitFrag("Touché : ", mm[6]));
    return out;
  }
  mm = s.match(/^Hit: (.*)$/); if (mm) return hitFrag("Touché : ", mm[1]);
  mm = s.match(/^Failure: (.*)$/); if (mm) return hitFrag("Échec : ", mm[1]);
  mm = s.match(/^Success: (.*)$/); if (mm) return mm[1] === "Half damage." ? ["Réussite : moitié des dégâts."] : ["Réussite : ", nk(mm[1])];
  mm = s.match(/^Failure or Success: (.*)$/); if (mm) return mm[1] === "Half damage." ? ["Échec ou réussite : moitié des dégâts."] : ["Échec ou réussite : ", ...hitFrag("", mm[1])];
  mm = s.match(/^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) Saving Throw: DC (\d+)(?:\.|, (.*))?$/);
  if (mm) return [`Jet de sauvegarde de ${AB[mm[1]]} : DD ${mm[2]}`, ...(mm[3] ? [", ", nk(mm[3])] : ["."])];
  mm = s.match(/^(First Failure|Second Failure|Trigger|Response|Failure or Success|Each Failure)(: .*)$/);
  if (mm) return [{ k: mm[1] }, ...[nk(mm[2].slice(2))].map((x) => x)].reduce((a, x, i) => (i === 1 ? [...a, " : ", x] : [...a, x]), []);
  return [nk(s)];
}
function nk(x) { const r = normDist(x); return { k: r.key, v: r.vals }; }
function hitFrag(lead, rest) {
  const mm = rest.match(LIST);
  if (mm && mm[1]) {
    const tail = rest.slice(mm[1].length);
    const out = [lead + dmgFr(mm[1])];
    if (tail === ".") out.push("."); else if (tail) out.push(nk(tail));
    return out;
  }
  return [lead, nk(rest)];
}
module.exports = { sentences, frag, normDist, m, DT, AB, dmgFr, rangeFr };
