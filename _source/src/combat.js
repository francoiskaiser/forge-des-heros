/* Forge des Héros — mode combat.
   Joueur : tout ce que le personnage peut faire pendant son tour, classé par action, action bonus et réaction.
   MJ : suivi plein écran de l’ordre de combat (tour en cours, PV, états, actions des monstres). */

/* Actions de base (glossaire SRD 5.2, résumés) : [nom, effet, compétence à lancer] */
const STD_ACTIONS = [
  ["Attaquer", "Une attaque avec une arme ou à mains nues (plus avec Attaque supplémentaire).", ""],
  ["Magie", "Lancer un sort, utiliser un objet magique ou une aptitude magique.", ""],
  ["Foncer", "Vous gagnez un déplacement supplémentaire égal à votre vitesse ce tour-ci.", ""],
  ["Se désengager", "Votre déplacement ne provoque pas d’attaque d’opportunité ce tour-ci.", ""],
  ["Esquiver", "Jusqu’à votre prochain tour, les attaques contre vous ont le désavantage et vous avez l’avantage aux JS de Dextérité.", ""],
  ["Aider", "Un allié gagne l’avantage à son prochain test, ou à sa prochaine attaque contre un ennemi à 1,50 m de vous.", ""],
  ["Se cacher", "Test de Dextérité (Discrétion) DD 15, hors de vue des ennemis.", "disc"],
  ["Chercher", "Test de Sagesse (Perception, Perspicacité, Médecine ou Survie).", "perc"],
  ["Étudier", "Test d’Intelligence (Arcanes, Histoire, Investigation, Nature ou Religion).", "inve"],
  ["Influencer", "Test de Charisme (ou Sagesse) pour influencer une créature.", "psua"],
  ["Utiliser", "Utiliser un objet non magique qui demande une action.", ""],
  ["Se tenir prêt", "Préparer une action déclenchée par un événement précis ; elle utilise votre réaction.", ""],
];
const RX_BONUS = /action bonus|bonus action/i;
const RX_REACT = /réaction|reaction/i;

const turnOf = (p) => (p.turn = p.turn || { a: 0, b: 0, r: 0, m: 0 });

/* Ordre d’initiative de l’aventure, s’il y a un combat en cours */
function fightOrder(ch) {
  if (!ch.adv || typeof Live === "undefined" || typeof FB === "undefined" || !FB.ok) return null;
  Live.watch(ch.adv);
  if (Live.code !== ch.adv || !Live.doc) return null;
  const ord = initOrder(Live.doc);
  return ord.list.length ? ord : null;
}

function combatSpellRow(x, b) {
  const dice = x.dmg ? (x.l === 0 ? scaleCantrip(x, b.level) : x.dmg) : null;
  const dmg = dice ? dice + (x.dmgBonus ? (x.dmgBonus > 0 ? "+" : "") + x.dmgBonus : "") : null;
  return `<div class="cb-row spell">
    <div class="cb-name"><b>${esc(x.n)}${x.co ? '<i class="tagc" title="Concentration">C</i>' : ""}</b><span class="mute small">${x.l ? "Niv. " + x.l : "Tour de magie"} · ${esc(x.p)}</span></div>
    <div class="cb-acts">
      ${x.atk ? `<button class="rb hit" data-a="r20" data-l="${esc(x.n)} — attaque" data-m="${x.atk}">${sg(x.atk)}</button>` : ""}
      ${x.sv ? `<span class="rb dc">DD ${x.dc}<small>${ABIL[x.sv].s}</small></span>` : ""}
      ${dmg ? `<button class="rb dmg" data-a="rDmg" data-l="${esc(x.n)}" data-e="${dmg}">${dmg}</button>` : ""}
      ${x.heal ? `<button class="rb heal" data-a="rHeal" data-l="${esc(x.n)}" data-e="${x.heal}">${x.heal}</button>` : ""}
      ${x.l > 0 ? `<button class="rb cast" data-a="castOpen" data-v="${x.id}">${T_CAST}</button>` : ""}
    </div></div>`;
}
const featCard = (f) => `<details class="cb-feat"><summary>${esc(f.n)}<span class="mute small">${esc(f.src)}</span></summary><p>${esc(f.d)}</p></details>`;

function viewCombat() {
  const ch = curChar();
  if (!ch) return "";
  const b = ch.b, p = ch.p, s = compute(b, p), c = CLASSES[b.cls];
  const t = turnOf(p);
  const hpPct = Math.max(0, Math.min(100, (p.hp / s.hpMax) * 100));
  const ord = fightOrder(ch);
  const me = typeof FB !== "undefined" && FB.uid ? FB.uid + "_" + ch.id : null;
  const myTurn = ord && ord.list[ord.turn] && ord.list[ord.turn].ref === me;
  const parts = actionParts(ch, s);
  const spells = s.spells.filter((x) => !x.ri || x.l === 0);
  const castT = (x) => String(x.t || "");
  const spA = spells.filter((x) => /action/i.test(castT(x)) && !RX_BONUS.test(castT(x)) && !RX_REACT.test(castT(x)) && !(x.l === 0 && (x.atk || x.sv || x.dmg)));
  const spB = spells.filter((x) => RX_BONUS.test(castT(x)) || /après avoir touché|after hitting/i.test(castT(x)));
  const spR = spells.filter((x) => RX_REACT.test(castT(x)));
  const feats = s.features.filter((f) => f.d && !/^(Incantation|Spellcasting)/.test(f.n));
  const fB = feats.filter((f) => RX_BONUS.test(f.d));
  const fR = feats.filter((f) => RX_REACT.test(f.d) && !RX_BONUS.test(f.d));
  const skill = (k) => (s.skills.find((x) => x.k === k) || {}).v;
  const tok = (k, label, ic) => `<button class="tok ${t[k] ? "used" : ""}" data-a="turnTok" data-v="${k}" aria-pressed="${!!t[k]}"><span class="tok-ic">${ic}</span><span>${label}</span></button>`;
  const slots = slotPips(ch, s);

  const initStrip = ord ? `<section class="panel cb-init ${myTurn ? "mine" : ""}">
      <div class="adv-head"><h3 class="ph">${myTurn ? "À vous de jouer !" : "Ordre de combat"}</h3><span class="mute small">Round ${ord.round}</span></div>
      <ol class="init-chips">${ord.list.map((e, i) => `<li class="${i === ord.turn ? "now" : ""} ${e.ref === me ? "me" : ""} ${e.kind}"><span class="iv">${e.v}</span>${esc(e.name)}</li>`).join("")}</ol>
    </section>` : `<section class="panel cb-init"><div class="adv-head"><h3 class="ph">Initiative</h3><button class="btn small" data-a="r20" data-l="Initiative" data-m="${s.init}">${ICON.d20} ${T_ROLL} ${sg(s.init)}</button></div>
      <p class="mute small">${ch.adv ? "Quand le MJ lance le combat, l’ordre des tours apparaît ici." : "Rejoignez une aventure pour voir l’ordre des tours en direct."}</p></section>`;

  return `<header class="topbar cb-top" style="--cc:${classColor(b.cls)}">
    <button class="icon-btn" data-a="combatExit" aria-label="Retour à la fiche">${ICON.back}</button>
    <div class="tb-title"><strong>${ICON.sword}Combat</strong><span class="eyebrow">${esc(b.name)} · ${c.n} ${b.level}</span></div>
    <button class="btn small primary" data-a="newTurn">Nouveau tour</button>
  </header>
  <main class="sheet combat">
    <div class="cb-left">
      <section class="panel cb-vitals o1 ${p.hp <= 0 ? "down" : ""}">
        <div class="cb-hp"><button class="hp-num" data-a="hpModal"><b>${p.hp}</b><span>/ ${s.hpMax}</span></button>${p.temp ? `<span class="temp">+${p.temp} temp.</span>` : ""}</div>
        <div class="hp-bar"><i style="width:${hpPct}%"></i></div>
        <div class="cb-hpq"><button class="mini dmg" data-a="hpQuick" data-v="-1">−1</button><button class="btn small dmgb" data-a="hpModal">Dégâts / soins</button><button class="mini heal" data-a="hpQuick" data-v="1">+1</button></div>
        <div class="cb-stats"><div><span class="lbl">CA</span><b>${s.ac}</b></div><div><span class="lbl">Vitesse</span><b>${fmtM(s.speed)}</b></div><div><span class="lbl">Init.</span><b>${sg(s.init)}</b></div><div><span class="lbl">Perc. passive</span><b>${10 + s.perc}</b></div></div>
      </section>
      ${p.hp <= 0 ? deathSaves(p) : ""}
      <section class="panel cb-turn o3"><h3 class="ph">Votre tour</h3>
        <div class="toks">${tok("a", "Action", ICON.sword)}${tok("b", "Action bonus", ICON.spark)}${tok("m", "Mouvement", ICON.boot || ICON.flag)}${tok("r", "Réaction", ICON.shield)}</div>
        <p class="mute small">Touchez pour marquer ce que vous avez utilisé. « Nouveau tour » remet tout à zéro.</p>
        ${p.conc ? `<div class="conc-bar">Concentration : <b>${SPELLS[p.conc] ? esc(SPELLS[p.conc].n) : ""}</b><button class="btn small ghost" data-a="endConc">Terminer</button></div>` : ""}
      </section>
      ${initStrip.replace('class="panel cb-init', 'class="panel o4 cb-init')}
      ${s.resources.length || slots ? `<section class="panel o6"><h3 class="ph">Ressources</h3>${slots ? `<div class="slots">${slots}</div>` : ""}${s.resources.map((r) => resRow(ch, r)).join("")}</section>` : ""}
      <section class="panel o7"><div class="cond-pick"><span class="lbl">États</span><div class="chips">${CONDITIONS.map((x) => chip(COND_L[x], p.cond.includes(x), "cond", `data-v="${x}"`)).join("")}</div></div></section>
    </div>
    <div class="cb-right o5">
      <section class="panel cb-sec ${t.a ? "spent" : ""}"><div class="cb-head"><span class="cb-badge a">${ICON.sword}</span><h3 class="ph">Action</h3><span class="mute small">Attaques par action : ${s.apa}</span></div>
        ${parts.atk}${parts.cantHtml}
        ${spA.length ? `<p class="lvl-sep">Sorts (1 action)</p>${spA.map((x) => combatSpellRow(x, b)).join("")}` : ""}
        ${parts.extras.length ? `<div class="extras">${parts.extras.join("")}</div>` : ""}
        <p class="lvl-sep">Actions de base</p>
        <div class="std-acts">${STD_ACTIONS.map(([n, d, k]) => `<details class="std"><summary>${n}</summary><p>${d}</p>${k && skill(k) != null ? `<button class="rb hit" data-a="r20" data-l="${n} — ${SKILLS[k].n}" data-m="${skill(k)}">${SKILLS[k].n} ${sg(skill(k))}</button>` : ""}</details>`).join("")}</div>
      </section>
      <section class="panel cb-sec ${t.b ? "spent" : ""}"><div class="cb-head"><span class="cb-badge b">${ICON.spark}</span><h3 class="ph">Action bonus</h3></div>
        ${spB.map((x) => combatSpellRow(x, b)).join("")}${fB.map(featCard).join("")}
        ${!spB.length && !fB.length ? `<p class="mute small">Aucune action bonus pour l’instant.</p>` : ""}
      </section>
      <section class="panel cb-sec ${t.r ? "spent" : ""}"><div class="cb-head"><span class="cb-badge r">${ICON.shield}</span><h3 class="ph">Réaction</h3></div>
        <details class="cb-feat"><summary>Attaque d’opportunité<span class="mute small">Règle de base</span></summary><p>Quand une créature hostile que vous voyez sort de votre allonge, vous pouvez faire une attaque au corps à corps contre elle.</p></details>
        ${spR.map((x) => combatSpellRow(x, b)).join("")}${fR.map(featCard).join("")}
      </section>
    </div>
  </main>`;
}

async function combatAct(a, d) {
  const ch = curChar();
  switch (a) {
    case "combatOpen": S.view = "combat"; window.scrollTo(0, 0); return true;
    case "combatExit": S.view = "sheet"; window.scrollTo(0, 0); return true;
    case "turnTok": { if (!ch) return true; const t = turnOf(ch.p); t[d.v] = t[d.v] ? 0 : 1; saveSoon(ch); return true; }
    case "newTurn": { if (!ch) return true; ch.p.turn = { a: 0, b: 0, r: 0, m: 0 }; saveSoon(ch); toast("Nouveau tour"); return true; }
    // --- MJ ---
    case "fightOpen": S.view = "gmfight"; S.fightSel = null; window.scrollTo(0, 0); if (typeof srdLoad === "function") srdLoad(); return true;
    case "fightExit": S.view = "gm"; S.gmTab = "init"; window.scrollTo(0, 0); return true;
    case "fightSel": S.fightSel = S.fightSel === d.id ? null : d.id; return true;
    case "fightHp": {
      const amt = Math.max(0, parseInt(($("#fightAmt") || {}).value, 10) || 0) || 1;
      await saveInit((it) => { const e = it.list.find((x) => x.id === d.id); if (e) e.hp = Math.max(0, Math.min(e.max, e.hp + amt * +d.d)); });
      return true;
    }
    case "fightCond": await saveInit((it) => { const e = it.list.find((x) => x.id === d.id); if (e) { e.cond = e.cond || []; const i = e.cond.indexOf(d.v); if (i >= 0) e.cond.splice(i, 1); else e.cond.push(d.v); } }); return true;
  }
  return false;
}

/* ---------- MJ : combat plein écran ---------- */
function viewGMFight() {
  const doc = Live.doc;
  const ord = doc ? initOrder(doc) : { list: [], turn: 0, round: 1 };
  const memById = {};
  Live.members.forEach((m) => (memById[m.id] = m));
  if (!ord.list.length) return `<header class="topbar"><button class="icon-btn" data-a="fightExit" aria-label="Retour">${ICON.back}</button><div class="tb-title"><strong>Combat</strong></div></header>
    <main class="sheet"><section class="panel empty-state"><h3 class="ph">Aucun combat en cours</h3><p>Lancez l’initiative du groupe et ajoutez des monstres depuis l’onglet Initiative.</p><button class="btn primary" data-a="fightExit">Préparer le combat</button></section></main>`;
  const cur = ord.list[ord.turn];
  const sel = ord.list.find((e) => e.id === S.fightSel) || cur;
  const info = (e) => {
    if (e.kind === "pc" && memById[e.ref]) { const m = memById[e.ref], st = memberStats(m); return { hp: m.p.hp, max: st ? st.hpMax : m.p.hp, ac: st ? st.ac : "?", cond: m.p.cond || [], pc: true, m }; }
    return { hp: e.hp, max: e.max, ac: e.ac, cond: e.cond || [], pc: false };
  };
  const hpCls = (hp, max) => (hp <= 0 ? "dead" : hp / max <= 0.25 ? "crit" : hp / max <= 0.5 ? "hurt" : "");
  const si = info(sel);
  const mon = !si.pc && sel.mk && typeof MONSTERS !== "undefined" ? MONSTERS[sel.mk] : null;
  const monActs = mon ? [["Actions", mon.act], ["Actions bonus", mon.ba], ["Réactions", mon.re], ["Actions légendaires", mon.la]].filter(([, a]) => a && a.length).map(([h, arr]) => `<h4 class="sb-h">${h}</h4>${arr.map(([n, dd]) => `<p class="sb-p"><b>${esc(n)}.</b> ${sbText(dd, mon.n + " — " + n.replace(/ \(.*$/, ""))}</p>`).join("")}`).join("") : "";
  return `<header class="topbar fight-top">
    <button class="icon-btn" data-a="fightExit" aria-label="Retour">${ICON.back}</button>
    <div class="tb-title"><strong>Round ${ord.round}</strong><span class="eyebrow">Tour de ${esc(cur.name)}</span></div>
    <button class="btn small ghost" data-a="initPrev" aria-label="Tour précédent">←</button>
    <button class="btn primary" data-a="initNext">Tour suivant →</button>
  </header>
  <main class="sheet fight">
    <ol class="fight-order">${ord.list.map((e, i) => { const x = info(e); return `<li><button class="fo ${i === ord.turn ? "now" : ""} ${e.id === sel.id ? "sel" : ""} ${e.kind} ${hpCls(x.hp, x.max)}" data-a="fightSel" data-id="${e.id}">
      <span class="iv">${e.v}</span><span class="fo-name">${esc(e.name)}</span>
      <span class="fo-hp">${x.pc && !memById[e.ref] ? "" : x.hp + "/" + x.max}</span>${x.max ? hpBar(x.hp, x.max) : ""}
      ${x.cond.length ? `<span class="fo-cond">${x.cond.map((k) => esc(COND_L[k] || k)).join(" · ")}</span>` : ""}</button></li>`; }).join("")}</ol>
    <section class="panel fight-card ${sel.kind} ${hpCls(si.hp, si.max)}">
      <div class="fc-head"><div><span class="eyebrow">${sel.id === cur.id ? "Tour en cours" : "Sélection"} · initiative ${sel.v}</span><h2>${esc(sel.name)}</h2></div>
        <div class="fc-ac"><span class="lbl">CA</span><b>${si.ac}</b></div></div>
      <div class="fc-hp"><b>${si.hp}</b><span>/ ${si.max}</span>${hpBar(si.hp, si.max)}</div>
      ${si.pc ? `<p class="mute small">Les PV et les états des personnages sont gérés par leurs joueurs.</p>${si.cond.length ? `<p>États : <b>${si.cond.map((k) => esc(COND_L[k] || k)).join(", ")}</b></p>` : ""}`
        : `<div class="fc-ctl"><button class="btn dmgb" data-a="fightHp" data-id="${sel.id}" data-d="-1">Dégâts</button><input id="fightAmt" type="number" inputmode="numeric" min="1" placeholder="PV" aria-label="Montant"><button class="btn healb" data-a="fightHp" data-id="${sel.id}" data-d="1">Soins</button></div>
        <div class="cond-pick"><span class="lbl">États</span><div class="chips">${CONDITIONS.map((k) => chip(COND_L[k], si.cond.includes(k), "fightCond", `data-id="${sel.id}" data-v="${k}"`)).join("")}</div></div>
        ${mon ? `<div class="fc-acts">${monActs}</div><button class="btn small ghost" data-a="monView" data-k="${esc(sel.mk)}">Fiche complète</button>` : sel.mk ? `<p class="mute small">${srdWait ? srdWait("du bestiaire") : ""}</p>` : ""}`}
    </section>
  </main>`;
}
