/* Forge des Héros — import et export des livres et créations (Excel ou sauvegarde .json).
   Le fichier Excel liste toutes les entrées du catalogue (à compléter ou non) et les créations du groupe :
   on le remplit tranquillement, puis on l’importe en une fois. */

const XLSX_URL = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
const HBIO = { p: null, busy: false };
function xlsxLoad() {
  if (window.XLSX) return Promise.resolve();
  if (HBIO.p) return HBIO.p;
  HBIO.p = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = XLSX_URL;
    s.onload = () => res();
    s.onerror = () => { HBIO.p = null; s.remove(); rej(new Error("xlsx")); };
    document.head.appendChild(s);
  });
  return HBIO.p;
}
function downloadFile(name, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
const hbFileName = (code, ext) => "forge-livres-" + (code === "_moi" ? "appareil" : code) + "." + ext;

/* Feuilles du classeur : clé interne, nom (FR et EN acceptés à l’import), en-têtes */
const HBX_SHEETS = [
  [K("sub"), "Sous-classes", ["id", "Classe", "Sous-classe", "Niveau", "Aptitude", "Texte", "Sorts toujours préparés", "Incantation"]],
  [K("bg"), "Historiques", ["id", "Nom", "Caractéristiques", "Compétences", "Outil", "Don", "Description", "Équipement", "po"]],
  [K("feat"), "Dons", ["id", "Nom", "Catégorie", "Prérequis", "+1 parmi", "Texte"]],
  [K("spell"), "Sorts", ["id", "Nom", "Niveau", "École", "Classes", "Temps", "Portée", "Composantes", "Durée", "Concentration", "Rituel", "Jet", "Dégâts", "Type", "Soins", "Niveaux supérieurs", "Texte"]],
  [K("item"), "Objets", ["id", "Nom", "Catégorie", "Rareté", "Harmonisation", "Texte"]],
];
const HBX_NAMES = { "sous-classes": "sub", subclasses: "sub", historiques: "bg", backgrounds: "bg", dons: "feat", feats: "feat", sorts: "spell", spells: "spell", objets: "item", items: "item" };

/* Entrées à exporter : complétées dans cette aventure, sinon complétées ailleurs sur l’appareil, sinon le catalogue vide */
function hbExportDefs(code) {
  const defs = HB.defs(code);
  const ids = new Set(defs.map((d) => d.id));
  const out = [...defs];
  Object.values(PHB_RAW).forEach((sk) => {
    if (ids.has(sk.id)) return;
    const cur = HB_RAW["hb_" + sk.id];
    out.push(cur && !cur.sk ? cur : sk);
  });
  return out;
}
const yes = (v) => /^(oui|yes|x|1|true|vrai|o|y)$/i.test(String(v).trim());
const list = (v) => String(v || "").split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);

function hbRows(defs) {
  const rows = { sub: [], bg: [], feat: [], spell: [], item: [] };
  const sorted = defs.slice().sort((a, b) => (a.cls || "").localeCompare(b.cls || "") || String(a.n).localeCompare(String(b.n), "fr"));
  sorted.forEach((d) => {
    switch (d.type) {
      case "sub": {
        const cast = hbCastOf(d);
        rows.sub.push([d.id, d.cls, d.n, "", "", d.d || "", d.spellsTxt || "", cast ? cast.ab + ":" + cast.list : ""]);
        (d.feats || []).forEach((f) => rows.sub.push([d.id, d.cls, d.n, f.l, f.n || "", f.d || "", "", ""]));
        break;
      }
      case "bg": rows.bg.push([d.id, d.n, (d.ab || []).join(", "), (d.skills || []).join(", "), d.tool || "", d.feat || "", d.d || "", d.gear || "", d.gold || 0]); break;
      case "feat": rows.feat.push([d.id, d.n, d.cat || "origine", d.pre || "", (d.ab || []).join(", "), d.d || ""]); break;
      case "spell": rows.spell.push([d.id, d.n, d.l, d.e, (d.cl || []).join(", "), d.t || "", d.p || "", d.c || "", d.du || "", d.co ? "oui" : "", d.ri ? "oui" : "", d.atk || "", d.dmg || "", d.ty || "", d.heal || "", d.up || "", d.d || ""]); break;
      case "item": rows.item.push([d.id, d.n, d.kind || "", d.rarity || "", d.attune ? "oui" : "", d.d || ""]); break;
    }
  });
  return rows;
}

function hbReadme() {
  const codes = (o, f) => Object.entries(o).map(([k, v]) => k + " = " + (f ? f(v) : v)).join(" · ");
  return [
    ["Forge des Héros — livres et créations"],
    ["Remplissez les colonnes Texte, Aptitude ou Description, puis importez ce fichier dans l’app (Livres et créations › Importer)."],
    ["Les lignes laissées vides sont ignorées : vous pouvez importer un fichier à moitié rempli et le compléter plus tard."],
    ["Ne modifiez pas la colonne id d’une ligne existante. Pour une nouvelle création, laissez id vide."],
    ["Sous-classes : la ligne sans niveau porte la description, les sorts toujours préparés (ex. « 3 : Bénédiction, Soins ») et l’incantation (ex. int:magicien)."],
    ["Sous-classes : plusieurs aptitudes au même niveau ? Copiez la ligne et changez le nom de l’aptitude."],
    [""],
    ["Codes des classes", codes(CLASSES, (c) => c.n)],
    ["Codes des caractéristiques", codes(ABIL, (a) => a.n)],
    ["Codes des compétences", codes(SKILLS, (s) => s.n)],
    ["Codes des écoles", codes(SC)],
    ["Codes des dons d’origine", Object.entries(FEATS).filter(([, f]) => f.cat !== "general").map(([k, f]) => k + " = " + f.n).join(" · ")],
    ["Jet d’un sort", "cac = attaque au corps à corps · dist = attaque à distance · for, dex, con, int, sag, cha = jet de sauvegarde"],
    ["Codes des dégâts", codes(DMG)],
    [""],
    ["Le texte des livres n’est pas fourni par l’app : il reste privé, dans votre aventure."],
  ];
}

async function hbExportXlsx(code) {
  await xlsxLoad();
  const wb = XLSX.utils.book_new();
  const readme = XLSX.utils.aoa_to_sheet(hbReadme());
  readme["!cols"] = [{ wch: 28 }, { wch: 120 }];
  XLSX.utils.book_append_sheet(wb, readme, "À lire");
  const rows = hbRows(hbExportDefs(code));
  const widths = { sub: [26, 12, 26, 7, 28, 80, 30, 14], bg: [18, 18, 16, 16, 26, 22, 60, 50, 6], feat: [24, 26, 10, 18, 12, 80], spell: [18, 22, 6, 6, 22, 14, 10, 12, 12, 8, 8, 6, 8, 10, 8, 18, 80], item: [18, 26, 20, 12, 8, 80] };
  HBX_SHEETS.forEach(([k, name, head]) => {
    const ws = XLSX.utils.aoa_to_sheet([head, ...rows[k]]);
    ws["!cols"] = widths[k].map((w) => ({ wch: w }));
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadFile(hbFileName(code, "xlsx"), new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
}
function hbExportJson(code) {
  const data = { app: "forge-des-heros", kind: "livres", v: 1, exported: new Date().toISOString(), entries: HB.defs(code) };
  downloadFile(hbFileName(code, "json"), new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
}

/* ---------- Import ---------- */
const slugId = (s) => "x" + normName(s).replace(/[^a-z0-9]+/g, "").slice(0, 24) + "_" + uid().slice(0, 5);
function hbFromSheets(sheets, report) {
  const docs = [];
  const cell = (r, i) => String(r[i] == null ? "" : r[i]).trim();
  const skOf = (id) => PHB_RAW["hb_" + id];
  // Sous-classes : regroupées par id (ou par nom)
  const subs = new Map();
  (sheets.sub || []).forEach((r, i) => {
    const id = cell(r, 0) || "", name = cell(r, 2);
    if (!id && !name) return;
    const key = id || "new:" + cell(r, 1) + ":" + name;
    if (!subs.has(key)) subs.set(key, { id, cls: cell(r, 1).toLowerCase(), n: name, d: "", spellsTxt: "", cast: undefined, feats: [], line: i + 2 });
    const s = subs.get(key);
    const lv = parseInt(cell(r, 3), 10);
    if (!lv) { s.d = cell(r, 5) || s.d; s.spellsTxt = cell(r, 6) || s.spellsTxt; const c = cell(r, 7); if (c) { const [ab, li] = c.toLowerCase().split(/[:\/ ]+/); s.cast = ABIL[ab] && CLASSES[li] ? { ab, list: li } : null; } else if (s.cast === undefined) s.cast = undefined; }
    else s.feats.push({ l: clampLv(lv, 3, 20), n: cell(r, 4), d: cell(r, 5) });
  });
  subs.forEach((s) => {
    const sk = s.id && skOf(s.id);
    const named = s.feats.filter((f) => f.n);
    if (!named.length) { report.skip++; return; }
    const cls = CLASSES[s.cls] ? s.cls : sk ? sk.cls : null;
    if (!cls) { report.bad.push("Sous-classe « " + s.n + " » : classe inconnue (" + s.cls + ")."); return; }
    const doc = { id: s.id || slugId(s.n), type: "sub", n: (s.n || (sk && sk.n) || "").slice(0, 120), d: s.d.slice(0, 6000), cls, feats: named.slice(0, 30).map((f) => ({ l: f.l, n: f.n.slice(0, 120), d: f.d.slice(0, 3000) })), spellsTxt: s.spellsTxt.slice(0, 2000) };
    doc.spells = hbParseSpells(doc.spellsTxt).spells;
    if (s.cast !== undefined) doc.cast = s.cast; else if (sk && sk.cast) doc.cast = sk.cast;
    docs.push(doc);
  });
  (sheets.bg || []).forEach((r, i) => {
    const id = cell(r, 0), n = cell(r, 1); if (!id && !n) return;
    const sk = id && skOf(id);
    const d = cell(r, 6), gear = cell(r, 7);
    if (sk && !d && !gear) { report.skip++; return; }
    const ab = list(cell(r, 2)).filter((a) => ABIL[a]), skills = list(cell(r, 3)).filter((k) => SKILLS[k]);
    if (ab.length !== 3 || skills.length !== 2) { report.bad.push("Historique « " + n + " » (ligne " + (i + 2) + ") : il faut 3 caractéristiques et 2 compétences."); return; }
    const feat = FEATS[cell(r, 5)] ? cell(r, 5) : sk ? sk.feat : "vigilant";
    docs.push({ id: id || slugId(n), type: "bg", n: (n || sk.n).slice(0, 120), d: d.slice(0, 6000), ab, skills, tool: cell(r, 4).slice(0, 120), feat, featList: sk ? sk.featList : "clr", gear: gear.slice(0, 1000), gold: Math.max(0, parseInt(cell(r, 8), 10) || 0) });
  });
  (sheets.feat || []).forEach((r) => {
    const id = cell(r, 0), n = cell(r, 1); if (!id && !n) return;
    const sk = id && skOf(id), d = cell(r, 5);
    if (!d) { report.skip++; return; }
    docs.push({ id: id || slugId(n), type: "feat", n: (n || sk.n).slice(0, 120), d: d.slice(0, 6000), cat: /^g/i.test(cell(r, 2)) ? "general" : "origine", pre: cell(r, 3).slice(0, 200), ab: list(cell(r, 4)).filter((a) => ABIL[a]) });
  });
  (sheets.spell || []).forEach((r, i) => {
    const n = cell(r, 1); if (!n) return;
    const cl = list(cell(r, 4)).filter((k) => CLASSES[k]);
    if (!cl.length) { report.bad.push("Sort « " + n + " » (ligne " + (i + 2) + ") : indiquez au moins une classe."); return; }
    const atk = cell(r, 11).toLowerCase();
    docs.push({ id: cell(r, 0) || slugId(n), type: "spell", n: n.slice(0, 120), l: clampLv(cell(r, 2), 0, 9), e: SC[cell(r, 3)] ? cell(r, 3) : "evo", cl, t: cell(r, 5) || "1 action", p: cell(r, 6) || "—", c: cell(r, 7) || "V, S", du: cell(r, 8) || "Instantanée", co: yes(cell(r, 9)), ri: yes(cell(r, 10)), atk: atk === "cac" || atk === "dist" || ABIL[atk] ? atk : "", dmg: cell(r, 12).replace(/\s/g, ""), ty: DMG[cell(r, 13)] ? cell(r, 13) : "force", heal: cell(r, 14).replace(/\s/g, ""), up: cell(r, 15).slice(0, 200), d: cell(r, 16).slice(0, 6000) });
  });
  (sheets.item || []).forEach((r) => {
    const n = cell(r, 1); if (!n) return;
    docs.push({ id: cell(r, 0) || slugId(n), type: "item", n: n.slice(0, 120), kind: cell(r, 2).slice(0, 120), rarity: HB_RARITY.includes(cell(r, 3).toLowerCase()) ? cell(r, 3).toLowerCase() : K("peu commun"), attune: yes(cell(r, 4)), d: cell(r, 5).slice(0, 6000) });
  });
  return docs;
}

async function hbImportFile(file, code) {
  const report = { ok: 0, skip: 0, bad: [], refused: 0 };
  let docs = [];
  try {
    if (/\.json$/i.test(file.name)) {
      const data = JSON.parse(await file.text());
      const entries = Array.isArray(data) ? data : data && data.entries;
      if (!Array.isArray(entries)) throw new Error("format");
      docs = entries.filter((d) => d && d.id && d.type && HB_TYPE_L[d.type] && typeof d.n === "string").map((d) => ({ ...d, n: d.n.slice(0, 120), d: String(d.d || "").slice(0, 6000) }));
    } else {
      await xlsxLoad();
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheets = {};
      wb.SheetNames.forEach((name, i) => {
        const k = HBX_NAMES[normName(name)] || (HBX_SHEETS[i - 1] && HBX_SHEETS[i - 1][0]);
        if (!k || name === wb.SheetNames[0] && !HBX_NAMES[normName(name)]) return;
        sheets[k] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "", raw: false }).slice(1);
      });
      if (!Object.keys(sheets).length) throw new Error("format");
      docs = hbFromSheets(sheets, report);
    }
  } catch (e) {
    return { ...report, fail: e && e.message === "xlsx" ? "Impossible de charger le lecteur Excel. Vérifiez votre connexion." : "Ce fichier n’est pas un export de Forge des Héros." };
  }
  const prevAll = HB.defs(code);
  const done = [];
  for (const raw of docs) {
    const prev = prevAll.find((x) => x.id === raw.id);
    if (prev && !hbCanEdit(prev, code)) { report.refused++; continue; }
    const doc = JSON.parse(JSON.stringify({ ...raw, adv: code, updated: Date.now(), by: prev ? prev.by : (typeof FB !== "undefined" && FB.uid) || "local", byName: prev ? prev.byName : hbAuthorName() }));
    done.push(doc);
  }
  if (!hbLocal(code)) {
    const res = await Promise.allSettled(done.map((doc) => FB.adv(code).collection("homebrew").doc(doc.id).set(doc)));
    const okDocs = done.filter((_, i) => res[i].status === "fulfilled");
    report.refused += done.length - okDocs.length;
    done.length = 0; done.push(...okDocs);
  }
  HB.set(code, [...prevAll.filter((x) => !done.some((d) => d.id === x.id)), ...done], code === "_moi" ? "Cet appareil" : undefined);
  report.ok = done.length;
  return report;
}

/* Actions et fenêtre de résultat */
async function hbioAct(a, d) {
  switch (a) {
    case "hbExportX": try { toast("Préparation du fichier…"); await hbExportXlsx(S.hbCode); toast("Fichier Excel téléchargé"); } catch (e) { toast("Impossible de charger le module Excel. Vérifiez votre connexion."); } return true;
    case "hbExportJ": hbExportJson(S.hbCode); toast("Sauvegarde téléchargée"); return true;
  }
  return false;
}
function hbioModal(m) {
  if (m.k !== "hbIo") return null;
  const r = m.r;
  if (r.fail) return `<h3>Import impossible</h3><p>${esc(r.fail)}</p><div class="row-btns"><button class="btn primary" data-a="closeModal">OK</button></div>`;
  return `<h3>Import terminé</h3>
    <dl class="facts"><div><dt>Importées</dt><dd><b>${r.ok}</b> ${r.ok > 1 ? "entrées" : "entrée"}</dd></div>
    <div><dt>Encore vides</dt><dd>${r.skip} (ignorées, à compléter plus tard)</dd></div>
    ${r.refused ? `<div><dt>Refusées</dt><dd>${r.refused} (entrées d’un autre joueur : seul le MJ peut les remplacer)</dd></div>` : ""}</dl>
    ${r.bad.length ? `<p class="bad small">${r.bad.slice(0, 8).map(esc).join("<br>")}${r.bad.length > 8 ? "<br>…" : ""}</p>` : ""}
    <div class="row-btns"><button class="btn primary" data-a="closeModal">OK</button></div>`;
}
function hbioPanel(code) {
  return `<section class="panel hb-io"><h4>Importer ou exporter</h4>
    <p class="mute small">Le fichier Excel contient toutes les entrées du Manuel des joueurs (vides tant qu’elles ne sont pas complétées) et vos créations. Remplissez-le à votre rythme, puis importez-le : les lignes vides sont ignorées. La sauvegarde .json garde une copie exacte de ${code === "_moi" ? "ce contenu" : "l’aventure"}.</p>
    <div class="row-btns"><button class="btn small" data-a="hbExportX">${ICON.down || ""}Exporter en Excel</button><button class="btn small ghost" data-a="hbExportJ">Sauvegarde .json</button>
    <label class="btn small ghost hb-file">Importer un fichier<input type="file" id="hbImport" accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"></label></div>
  </section>`;
}
document.addEventListener("change", async (e) => {
  if (e.target.id !== "hbImport" || !e.target.files || !e.target.files[0]) return;
  const f = e.target.files[0]; e.target.value = "";
  if (HBIO.busy) return; HBIO.busy = true;
  toast("Import en cours…");
  try { S.modal = { k: "hbIo", r: await hbImportFile(f, S.hbCode) }; } finally { HBIO.busy = false; }
  render();
});
