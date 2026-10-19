/* Produit les listes de textes à traduire (todo/*.json), par lots */
const fs = require("fs");
const { sentences, frag, normDist } = require("./split");
const M = require("/home/claude/5e-bits/5e-database/src/2024/en/5e-SRD-Monsters.json");
const I = require("/home/claude/5e-bits/5e-database/src/2024/en/5e-SRD-Magic-Items.json");
const SEC = ["special_abilities", "actions", "bonus_actions", "reactions", "legendary_actions"];
const sets = { names: new Set(), acts: new Set(), sent: new Set(), misc: new Set(), inames: new Set(), isent: new Set() };
M.forEach((mo) => {
  sets.names.add(mo.name);
  if (mo.languages) sets.misc.add(mo.languages);
  if (mo.gear) sets.misc.add(mo.gear);
  [...mo.damage_vulnerabilities, ...mo.damage_resistances].forEach((x) => { if (/ /.test(x)) sets.misc.add(x); });
  SEC.forEach((k) => (mo[k] || []).forEach((a) => {
    sets.acts.add(a.name);
    sentences(a.desc).forEach((s) => { if (s === "\n") return; frag(s).forEach((f) => { if (typeof f !== "string") sets.sent.add(f.k); }); });
  }));
});
I.forEach((it) => {
  sets.inames.add(it.name);
  sentences(it.desc).forEach((s) => { if (s === "\n") return; sets.isent.add(normDist(s).key); });
});
fs.mkdirSync("todo", { recursive: true });
const batch = (name, arr, size) => { for (let i = 0; i < arr.length; i += size) fs.writeFileSync(`todo/${name}-${String(i / size + 1).padStart(2, "0")}.json`, JSON.stringify(arr.slice(i, i + size), null, 0).replace(/","/g, '",\n"')); return Math.ceil(arr.length / size); };
const out = {};
out.names = batch("names", [...sets.names], 400);
out.acts = batch("acts", [...sets.acts], 450);
out.misc = batch("misc", [...sets.misc], 200);
// phrases : lots d’environ 9000 caractères
const lot = (name, arr) => { const lots = []; let cur = [], n = 0; arr.forEach((s) => { if (n + s.length > 9000 && cur.length) { lots.push(cur); cur = []; n = 0; } cur.push(s); n += s.length; }); if (cur.length) lots.push(cur); lots.forEach((l, i) => fs.writeFileSync(`todo/${name}-${String(i + 1).padStart(2, "0")}.json`, JSON.stringify(l, null, 0).replace(/","/g, '",\n"'))); return lots.length; };
out.sent = lot("sent", [...sets.sent]);
out.inames = batch("inames", [...sets.inames], 300);
out.isent = lot("isent", [...sets.isent]);
console.log(out, Object.fromEntries(Object.entries(sets).map(([k, v]) => [k, v.size])));
