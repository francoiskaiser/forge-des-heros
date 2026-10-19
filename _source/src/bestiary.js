/* Forge des Héros — bestiaire et objets magiques du SRD 5.2.
   Les données (MONSTERS, MAGIC_ITEMS) sont dans srd.js, chargé à la demande pour garder l’app légère. */

const SRD = { st: "", p: null };
const srdOk = () => typeof MONSTERS !== "undefined";
function srdLoad() {
  if (srdOk()) return Promise.resolve();
  if (SRD.p) return SRD.p;
  SRD.st = "loading";
  SRD.p = new Promise((res) => {
    const s = document.createElement("script");
    s.src = "srd.js";
    s.onload = () => { SRD.st = "ok"; res(); liveRender(); };
    s.onerror = () => { SRD.st = "err"; SRD.p = null; s.remove(); res(); liveRender(); };
    document.head.appendChild(s);
  });
  return SRD.p;
}
function srdWait(what) {
  srdLoad();
  return SRD.st === "err"
    ? `<p class="mute">Impossible de charger ${what}. Vérifiez votre connexion. <button class="btn small ghost" data-a="srdRetry">Réessayer</button></p>`
    : `<p class="mute">Chargement ${what}…</p>`;
}

const crNum = (c) => (c === "1/8" ? 0.125 : c === "1/4" ? 0.25 : c === "1/2" ? 0.5 : +c);
const normQ = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'");

/* ---------- Bestiaire (écran du MJ) ---------- */
function monMatches() {
  const q = normQ(S.monQ), ty = S.monTy || "";
  return Object.entries(MONSTERS)
    .filter(([, m]) => (!ty || m.ty === ty) && (!q || normQ(m.n).includes(q) || (m.en && normQ(m.en).includes(q))))
    .sort((a, b) => (S.monSort === "cr" ? crNum(a[1].cr) - crNum(b[1].cr) : 0) || a[1].n.localeCompare(b[1].n, "fr"));
}
function monRows() {
  const list = monMatches();
  if (!list.length) return `<p class="mute">Aucune créature ne correspond.</p>`;
  return list.slice(0, 120).map(([k, m]) => `<button class="mon-row" data-a="monView" data-k="${k}"><b>${esc(m.n)}</b><span class="mute small">${esc(m.ty)} · ${esc(m.sz)}</span><span class="mon-cr">FP ${esc(m.cr)}</span><span class="mon-vit">CA ${m.ac} · PV ${m.hp}</span></button>`).join("") + (list.length > 120 ? `<p class="mute small">${list.length - 120} autres résultats : affinez la recherche.</p>` : "");
}
function gmBestiary() {
  if (!srdOk()) return `<section class="panel">${srdWait("du bestiaire")}</section>`;
  const types = [...new Set(Object.values(MONSTERS).map((m) => m.ty))].sort((a, b) => a.localeCompare(b, "fr"));
  return `<section class="panel"><div class="adv-head"><h3 class="ph">Bestiaire</h3><span class="mute small">${Object.keys(MONSTERS).length} créatures du SRD 5.2</span></div>
    <div class="mon-filters">
      <label class="field"><span>Rechercher</span><input id="monQ" value="${esc(S.monQ || "")}" placeholder="Ex. gobelin, dragon, loup…" autocomplete="off"></label>
      <label class="field"><span>Type</span><select id="monTy"><option value="">Tous</option>${types.map((t) => `<option ${S.monTy === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>
    </div>
    <div class="chips">${chip("Par nom", S.monSort !== "cr", "monSort", 'data-v="name"')}${chip("Par facteur de puissance", S.monSort === "cr", "monSort", 'data-v="cr"')}</div>
    <div class="mon-list" id="monList">${monRows()}</div>
  </section>`;
}

/* Texte d’un bloc : dés et bonus d’attaque deviennent des boutons de jet */
function sbText(t, label) {
  return esc(t)
    .replace(/((?:Jet d’attaque[^:<]*?|Attack Roll) ?: )([+−-]\d+)/g, (_, a, b) => `${a}<button class="sb-roll" data-a="r20" data-l="${esc(label)} — attaque" data-m="${b.replace("−", "-")}">${b}</button>`)
    .replace(/(\d+) \((\d+d\d+(?: [+−-] \d+)?)\)/g, (_, n, d) => `<button class="sb-roll dmg" data-a="rDmg" data-l="${esc(label)}" data-e="${d.replace(/\s/g, "").replace("−", "-")}">${n} (${d})</button>`)
    .replace(/\n/g, "<br>");
}
function statBlock(k, inGM) {
  const m = MONSTERS[k];
  if (!m) return "<p>Créature introuvable.</p>";
  const mods = m.ab.map((v) => mod(v));
  const sv = Object.fromEntries((m.sv || []).map(([a, v]) => [a, v]));
  const sec = (title, arr) => (arr && arr.length ? `<h4 class="sb-h">${title}</h4>${arr.map(([n, d]) => `<p class="sb-p"><b>${esc(n)}.</b> ${sbText(d, m.n + " — " + n.replace(/ \(.*$/, ""))}</p>`).join("")}` : "");
  const imm = [m.imm, m.ci].filter(Boolean).join(" ; ");
  return `<div class="statblock">
    <h3>${esc(m.n)}</h3><p class="mute sb-sub">${esc(m.sz)} · ${esc(m.ty)} · ${esc(m.al)}</p>
    <div class="sb-vit"><div><span class="lbl">CA</span><b>${m.ac}</b>${m.acn ? `<small>${esc(m.acn)}</small>` : ""}</div>
      <div><span class="lbl">PV</span><b>${m.hp}</b><button class="sb-roll" data-a="rDmg" data-l="${esc(m.n)} — PV" data-e="${esc(m.hd.replace("−", "-"))}">${esc(m.hd)}</button></div>
      <div><span class="lbl">Initiative</span><button class="sb-roll big" data-a="r20" data-l="${esc(m.n)} — initiative" data-m="${mods[1]}">${sg(mods[1])}</button></div>
      <div><span class="lbl">FP</span><b>${esc(m.cr)}</b><small>${m.xp.toLocaleString(LANG === "en" ? "en" : "fr")} PX</small></div></div>
    <p class="sb-speed"><span class="lbl">Vitesse</span> ${esc(m.sp)}</p>
    <div class="ro-abil">${ABK.map((a, i) => `<div><span class="lbl">${ABIL[a].s}</span><button class="sb-roll" data-a="r20" data-l="${esc(m.n)} — ${ABIL[a].n}" data-m="${mods[i]}">${sg(mods[i])}</button><small>${m.ab[i]} · JS <button class="sb-roll" data-a="r20" data-l="${esc(m.n)} — sauvegarde de ${ABIL[a].n}" data-m="${sv[a] != null ? sv[a] : mods[i]}">${sg(sv[a] != null ? sv[a] : mods[i])}</button></small></div>`).join("")}</div>
    <dl class="facts sb-facts">
      ${m.sk ? `<div><dt>Compétences</dt><dd>${m.sk.map(([s, v]) => `${SKILLS[s].n} <button class="sb-roll" data-a="r20" data-l="${esc(m.n)} — ${SKILLS[s].n}" data-m="${v}">${sg(v)}</button>`).join(", ")}</dd></div>` : ""}
      ${m.vul ? `<div><dt>Vulnérabilités</dt><dd>${esc(m.vul)}</dd></div>` : ""}
      ${m.res ? `<div><dt>Résistances</dt><dd>${esc(m.res)}</dd></div>` : ""}
      ${imm ? `<div><dt>Immunités</dt><dd>${esc(imm)}</dd></div>` : ""}
      <div><dt>Sens</dt><dd>${m.sen ? esc(m.sen) + " ; " : ""}Perception passive ${m.pp}</dd></div>
      <div><dt>Langues</dt><dd>${esc(m.lang || "—")}</dd></div>
      <div><dt>Maîtrise</dt><dd>${sg(m.pb)}</dd></div>
      ${m.gear ? `<div><dt>Équipement</dt><dd>${esc(m.gear)}</dd></div>` : ""}
    </dl>
    ${sec("Traits", m.tr)}${sec("Actions", m.act)}${sec("Actions bonus", m.ba)}${sec("Réactions", m.re)}${sec("Actions légendaires", m.la)}
    ${inGM ? `<div class="mon-add"><label class="field"><span>Nombre</span><input id="monAddN" type="number" inputmode="numeric" value="${esc(S.monAddN || 1)}" min="1" max="20"></label>
      <div class="field"><span>Points de vie</span><div class="chips">${chip("Moyenne (" + m.hp + ")", !S.monHpRoll, "monHpMode", 'data-v="avg"')}${chip("Lancer " + esc(m.hd), !!S.monHpRoll, "monHpMode", 'data-v="roll"')}</div></div>
      <button class="btn primary" data-a="monAddSrd" data-k="${k}">${ICON.plus} Ajouter au combat</button></div>` : ""}
    <p class="legal">SRD 5.2 · Wizards of the Coast LLC · CC-BY-4.0${LANG === "fr" ? " · traduction non officielle" : ""}</p>
  </div>`;
}

/* ---------- Objets magiques (inventaire) ---------- */
const RAR_L = { [K("commun")]: "commun", [K("peu commun")]: "peu commun", [K("rare")]: "rare", [K("très rare")]: "très rare", [K("légendaire")]: "légendaire", [K("artefact")]: "artefact" };
function miAll() {
  const out = [];
  if (srdOk()) Object.entries(MAGIC_ITEMS).forEach(([k, x]) => { if (!x.vg) out.push({ ref: "mi:" + k, n: x.n, en: x.en, r: x.r, at: x.at, h: x.h }); });
  Object.entries(HBITEMS).forEach(([k, x]) => out.push({ ref: "hb:" + k, n: x.n, r: x.rarity, at: x.attune, h: x.kind, hb: true }));
  return out;
}
function miRows() {
  const q = normQ(S.miQ);
  if (!q) return `<p class="mute small">Tapez quelques lettres : potion, anneau, épée…</p>`;
  const list = miAll().filter((x) => normQ(x.n).includes(q) || (x.en && normQ(x.en).includes(q))).sort((a, b) => a.n.localeCompare(b.n, "fr"));
  if (!list.length) return `<p class="mute small">Aucun objet ne correspond.</p>`;
  return list.slice(0, 40).map((x) => `<button class="mi-row" data-a="miAdd" data-ref="${esc(x.ref)}"><b>${esc(x.n)}${x.hb ? hbTag({ hb: 1 }) : ""}</b><span class="mute small">${esc(x.h || "")}${x.r ? " · " + esc(RAR_L[x.r] || x.r) : ""}${x.at ? " · harmonisation" : ""}</span><span class="mi-plus">${ICON.plus}</span></button>`).join("");
}
function miInfo(i) {
  if (i.ref && i.ref.startsWith("mi:")) { const x = srdOk() && MAGIC_ITEMS[i.ref.slice(3)]; return x ? { h: x.h, r: x.r, at: x.at, d: x.d } : { h: "", r: i.r, at: i.at, d: null }; }
  if (i.ref && i.ref.startsWith("hb:")) { const x = HBITEMS[i.ref.slice(3)]; return { h: x ? x.kind : i.h, r: x ? x.rarity : i.r, at: x ? x.attune : i.at, d: x ? x.d : i.d, hb: true }; }
  return null;
}
function invMagicPanel(ch) {
  const att = ch.p.inv.filter((i) => i.att).length;
  return `<section class="panel"><h3 class="ph">Objets magiques</h3>
    ${att ? `<p class="mute small">Harmonisation : <b class="${att > 3 ? "bad" : ""}">${att}/3</b></p>` : ""}
    <label class="field"><span>Ajouter un objet magique</span><input id="miQ" value="${esc(S.miQ || "")}" placeholder="Rechercher dans le SRD${typeof HB !== "undefined" ? " et vos créations" : ""}" autocomplete="off"></label>
    <div class="mi-list" id="miList">${srdOk() ? miRows() : srdWait("des objets magiques")}</div>
  </section>`;
}

async function srdAct(a, d, el) {
  switch (a) {
    case "srdRetry": SRD.st = ""; srdLoad(); return true;
    case "monSort": S.monSort = d.v; return true;
    case "monView": S.modal = { k: "mon", key: d.k }; return true;
    case "monHpMode": S.monHpRoll = d.v === "roll"; return true;
    case "monAddSrd": {
      const m = MONSTERS[d.k];
      const n = Math.max(1, Math.min(20, parseInt(($("#monAddN") || {}).value, 10) || 1));
      const bonus = mod(m.ab[1]);
      await saveInit((it) => {
        for (let i = 0; i < n; i++) {
          const hp = S.monHpRoll ? Math.max(1, rollExpr(m.hd).total) : m.hp;
          const r = rollD20(bonus, "normal");
          it.list.push({ id: "m_" + uid(), kind: "monstre", mk: d.k, name: n > 1 ? `${m.n} ${i + 1}` : m.n, v: r.total, dex: bonus, hp, max: hp, ac: m.ac });
        }
      });
      S.modal = null; S.gmTab = "init"; S.monAddN = 1;
      toast(n > 1 ? n + " × " + m.n + " ajoutés au combat" : m.n + " ajouté au combat");
      return true;
    }
    case "miAdd": {
      const ch = curChar(); if (!ch) return true;
      let it = null;
      if (d.ref.startsWith("mi:")) { const x = MAGIC_ITEMS[d.ref.slice(3)]; if (x) it = { uid: uid(), ref: d.ref, n: x.n, q: 1, eq: false, r: x.r, at: x.at ? 1 : 0 }; }
      if (d.ref.startsWith("hb:")) { const x = HBITEMS[d.ref.slice(3)]; if (x) it = { uid: uid(), ref: d.ref, n: x.n, q: 1, eq: false, r: x.rarity, at: x.attune ? 1 : 0, h: x.kind, d: x.d }; }
      if (!it) return true;
      const same = ch.p.inv.find((i) => i.ref === it.ref);
      if (same) same.q += 1; else ch.p.inv.push(it);
      S.miQ = ""; saveSoon(ch); toast(it.n + " ajouté");
      return true;
    }
    case "itemOpen": S.openItem = S.openItem === d.u ? null : d.u; return true;
    case "attune": { const ch = curChar(), it = ch && ch.p.inv.find((i) => i.uid === d.u); if (it) { it.att = it.att ? 0 : 1; saveSoon(ch); } return true; }
  }
  return false;
}
function srdModal(m) {
  if (m.k === "mon") return srdOk() ? statBlock(m.key, S.view === "gm") : srdWait("du bestiaire");
  return null;
}

/* Recherche en direct sans tout redessiner */
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.id === "monQ") { S.monQ = t.value; const l = $("#monList"); if (l && srdOk()) l.innerHTML = monRows(); }
  if (t.id === "monAddN") S.monAddN = t.value;
  if (t.id === "miQ") { S.miQ = t.value; const l = $("#miList"); if (l && srdOk()) l.innerHTML = miRows(); }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "monTy") { S.monTy = e.target.value; const l = $("#monList"); if (l && srdOk()) l.innerHTML = monRows(); }
});
