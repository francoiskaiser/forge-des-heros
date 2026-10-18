/* Forge des Héros — traduction à la construction.
   node i18n.js extract <fichiers…>            → liste des textes affichés (JSON)
   node i18n.js build <dict.json> <in> <out>    → copie traduite du fichier, rapport des manques sur stderr */
const fs = require("fs");
const acorn = require("acorn");
const walk = require("acorn-walk");

// Propriétés dont la valeur est une clé interne, jamais un texte affiché
const SKIP_PROPS = new Set(["ty", "sv", "e", "m", "k", "c", "a", "ab", "sab", "cls", "ref", "id", "list", "mode", "type", "kind", "reset", "free", "src_key"]);
const ATTRS = ["title", "placeholder", "aria-label", "alt"];
const LETTER = /[A-Za-zÀ-ÖØ-öø-ÿŒœ]/;
const EDGE = /^[\s·,:;()—–\/+\-.!?«»"'’…×|]+|[\s·,:;()—–\/+\-.!?«»"'’…×|]+$/g;

function core(seg) {
  // garde la ponctuation finale utile dans la clé (« . » d’une phrase) si la phrase contient des espaces
  const t = seg.trim();
  if (!t) return null;
  let c = t.replace(EDGE, "");
  if (!c || !LETTER.test(c)) return null;
  // une phrase complète garde sa ponctuation finale
  if (/\s/.test(c) && /[.!?…]$/.test(t.replace(/[\s»"]+$/, ""))) {
    c = t.replace(/^[\s·,:;()—–\/+\-|]+/, "").replace(/\s+$/, "");
  }
  return c;
}

function isCodeLike(c) {
  if (/[À-ÿŒœ’]/.test(c)) return false;
  if (/\s/.test(c)) return false;
  return /^[a-z0-9_\-.:#\/=\[\]"]+$/.test(c) || /^\d+d\d+/.test(c) || /^[A-Z]$/.test(c);
}

/* Découpe un texte (éventuellement HTML) en segments traduisibles ; state = "text" | "tag" partagé entre quasis */
function segments(raw, state, onSeg) {
  let i = 0, out = "", buf = "", st = state.v;
  const flush = () => { if (buf) { out += onSeg(buf); buf = ""; } };
  while (i < raw.length) {
    const ch = raw[i];
    if (st === "text") {
      if (ch === "<" && /[A-Za-z\/!]/.test(raw[i + 1] || "")) { flush(); st = "tag"; out += ch; i++; continue; }
      buf += ch; i++; continue;
    }
    // dans une balise : traduire les valeurs d’attributs visibles
    if (ch === ">") { st = "text"; out += ch; i++; continue; }
    let matched = false;
    for (const a of ATTRS) {
      const pre = a + '="';
      if (raw.startsWith(pre, i) && (i === 0 || /\s/.test(raw[i - 1]))) {
        out += pre; i += pre.length;
        let j = raw.indexOf('"', i);
        const dollar = raw.indexOf("${", i);
        if (j < 0 || (dollar >= 0 && dollar < j)) j = dollar >= 0 && (j < 0 || dollar < j) ? dollar : (j < 0 ? raw.length : j);
        out += onSeg(raw.slice(i, j)); i = j; matched = true; break;
      }
    }
    if (!matched) { out += ch; i++; }
  }
  flush();
  state.v = st;
  return out;
}

function collect(src, file, visit) {
  const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "script", locations: true });
  const edits = [];
  walk.fullAncestor(ast, (node, _s, anc) => {
    if (node.type !== "Literal" && node.type !== "TemplateLiteral") return;
    if (node.type === "Literal" && typeof node.value !== "string") return;
    const parent = anc[anc.length - 2];
    if (!parent) return;
    if (parent.type === "CallExpression" && parent.callee.type === "Identifier" && parent.callee.name === "K") return;
    if (parent.type === "Property" && parent.key === node && !parent.computed) return;
    if (parent.type === "Property" && parent.value === node) {
      const kn = parent.key.name || parent.key.value;
      if (SKIP_PROPS.has(kn)) return;
      if (kn === "t" && node.type === "Literal" && !/\s/.test(node.value)) return;
    }
    if (parent.type === "BinaryExpression" && /^[!=]==?$/.test(parent.operator)) return;
    if (parent.type === "SwitchCase") return;
    if (parent.type === "MemberExpression" && parent.property === node) return;
    if (parent.type === "TaggedTemplateExpression") return;
    // n’entre pas dans une TemplateLiteral déjà parente (gérée globalement)
    if (node.type === "Literal") {
      const state = { v: "text" };
      let changed = false;
      const nv = segments(node.value, state, (seg) => { const r = visit(seg, file, node.loc.start.line); if (r !== seg) changed = true; return r; });
      if (changed) edits.push({ start: node.start, end: node.end, text: JSON.stringify(nv) });
    } else {
      const state = { v: "text" };
      node.quasis.forEach((q) => {
        let changed = false;
        const nv = segments(q.value.raw, state, (seg) => { const r = visit(seg, file, q.loc.start.line, true); if (r !== seg) changed = true; return r; });
        if (changed) edits.push({ start: q.start, end: q.end, text: nv });
      });
    }
  });
  return edits;
}

function applyEdits(src, edits) {
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);
  return src;
}

const [mode, ...args] = process.argv.slice(2);
if (mode === "extract") {
  const found = {};
  for (const f of args) {
    const src = fs.readFileSync(f, "utf8");
    collect(src, f, (seg, file, line) => {
      const c = core(seg);
      if (c && (!isCodeLike(c) || process.env.ALL)) { if (!found[c]) found[c] = []; if (found[c].length < 2) found[c].push(file.split("/").pop() + ":" + line); }
      return seg;
    });
  }
  process.stdout.write(JSON.stringify(found, null, 1));
} else if (mode === "build") {
  const [dictFile, inFile, outFile] = args;
  const dict = JSON.parse(fs.readFileSync(dictFile, "utf8"));
  const src = fs.readFileSync(inFile, "utf8");
  const missing = new Set();
  const edits = collect(src, inFile, (seg, file, line, inTemplate) => {
    const c = core(seg);
    if (!c) return seg;
    const tr = dict[c];
    if (tr == null) { if (!isCodeLike(c)) missing.add(c); return seg; }
    let t = tr;
    if (inTemplate) t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    const idx = seg.indexOf(c);
    // typographie anglaise : pas d’espace avant : ; ! ?
    return (seg.slice(0, idx) + t + seg.slice(idx + c.length)).replace(/[ \u00a0]+([:;!?])(?=\s|$|<)/g, "$1").replace(/&nbsp;([:;!?])/g, "$1");
  });
  fs.writeFileSync(outFile, applyEdits(src, edits));
  if (missing.size) process.stderr.write(JSON.stringify([...missing], null, 1) + "\n");
}
