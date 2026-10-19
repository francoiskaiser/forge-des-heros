/* Forge des Héros — page Compte et réglages : thème, langue, support, version */

const APP_VERSION = "1.13.0";

/* ---------- Thème ---------- */
const Theme = {
  get() { try { return localStorage.getItem("forge-theme") || "dark"; } catch (e) { return "dark"; } },
  set(v) { try { localStorage.setItem("forge-theme", v); } catch (e) { } this.apply(); },
  resolved() {
    const v = this.get();
    if (v !== "system") return v;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  },
  apply() {
    const r = this.resolved();
    document.documentElement.setAttribute("data-forge-theme", r);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", r === "light" ? "#f2ebdf" : "#15110e");
  },
};
Theme.apply();
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  const onChange = () => { if (Theme.get() === "system") Theme.apply(); };
  if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
}

/* ---------- Page Compte et réglages ---------- */
function syncLabel() {
  if (Account.status === "sync") return "Synchronisation…";
  if (Account.status === "err") return Account.errCode === "permission-denied" ? "Accès refusé par Firebase" : Account.errCode === "unavailable" ? "Hors ligne, réessai automatique" : "Synchronisation échouée";
  return "Synchronisé";
}

function accountForm() {
  const st = S.acc || { mode: "in" };
  const isNew = st.mode === "new";
  return `<div class="acc-form">
    <p class="mute">${isNew ? "Les personnages déjà présents sur cet appareil seront ajoutés à votre compte." : "Connectez-vous pour retrouver vos personnages et vos aventures sur tous vos appareils."}</p>
    <button class="btn google" data-a="accGoogle">${GOOGLE_G}Continuer avec Google</button>
    <div class="or"><span>ou</span></div>
    <label class="field"><span>E-mail</span><input id="accEmail" type="email" autocomplete="email" value="${esc(st.email || "")}" placeholder="vous@exemple.be"></label>
    <label class="field"><span>Mot de passe</span><input id="accPw" type="password" autocomplete="${isNew ? "new-password" : "current-password"}" placeholder="${isNew ? "6 caractères minimum" : ""}"></label>
    ${st.err ? `<p class="bad">${esc(st.err)}</p>` : ""}${st.info ? `<p class="ok">${esc(st.info)}</p>` : ""}
    <div class="row-btns"><button class="btn primary" data-a="accEmail">${isNew ? "Créer mon compte" : "Se connecter"}</button>
      ${isNew ? "" : '<button class="btn ghost small" data-a="accReset">Mot de passe oublié</button>'}</div>
    <p class="mute small acc-switch">${isNew ? 'Déjà un compte ? <button class="linkish" data-a="accMode" data-v="in">Se connecter</button>' : 'Pas encore de compte ? <button class="linkish" data-a="accMode" data-v="new">Créer un compte</button>'}</p>
  </div>`;
}

function accountSection() {
  if (!FB.ok) return `<section class="panel set-sec"><h3 class="ph">Compte</h3><p class="mute">La connexion n’est pas disponible dans cette version de l’app. Ouvrez l’app installée pour synchroniser vos personnages.</p></section>`;
  const u = Account.user();
  if (!u) return `<section class="panel set-sec"><h3 class="ph">${S.acc && S.acc.mode === "new" ? "Créer un compte" : "Se connecter"}</h3>${accountForm()}</section>`;
  const label = u.displayName || u.email || "Mon compte";
  const nChars = S.chars.length, nGm = GmList.get().length;
  return `<section class="panel set-sec">
    <h3 class="ph">Compte</h3>
    <div class="acc-id"><span class="acc-av big">${esc((label.trim()[0] || "?").toUpperCase())}</span>
      <div><b>${esc(label)}</b>${u.displayName && u.email ? `<span class="mute small">${esc(u.email)}</span>` : ""}<span class="small ${Account.status === "err" ? "bad" : "okc"}">${syncLabel()}</span></div></div>
    <p class="mute small">${nChars} personnage${nChars > 1 ? "s" : ""} et ${nGm} aventure${nGm > 1 ? "s" : ""} de MJ synchronisés avec ce compte.</p>
    ${Account.status === "err" ? `<div class="sync-err"><b>La synchronisation a échoué</b> (code : ${esc(Account.errCode || "inconnu")}).<br>${Account.errCode === "permission-denied" ? "Firebase refuse l’accès : les règles de sécurité de Firestore ne sont pas à jour." : "L’app réessaie automatiquement toutes les 20 secondes."}</div><div class="row-btns"><button class="btn small" data-a="accRetry">Réessayer maintenant</button></div>` : ""}
    ${S.acc && S.acc.confirmOut ? `<div class="confirm-box"><p>En vous déconnectant, vos personnages disparaissent de cet appareil. Ils restent dans votre compte et reviennent à la prochaine connexion.</p><div class="row-btns"><button class="btn dmgb" data-a="accOutDo">Se déconnecter</button><button class="btn ghost" data-a="accOutCancel">Annuler</button></div></div>`
      : `<div class="row-btns"><button class="btn ghost" data-a="accOutAsk">Se déconnecter</button></div>`}
  </section>`;
}

function viewSettings() {
  const t = Theme.get();
  const themeOpt = (k, n, d) => `<button class="theme-opt ${t === k ? "on" : ""}" data-a="setTheme" data-v="${k}" aria-pressed="${t === k}"><span class="swatch sw-${k}"><i></i><i></i><i></i></span><b>${n}</b><span class="mute small">${d}</span></button>`;
  const multi = typeof window !== "undefined" && window.FORGE_PWA;
  const langs = [[K("fr"), "Français", multi || LANG === "fr"], [K("en"), "English", multi], [K("de"), "Deutsch", false], [K("es"), "Español", false]];
  return `<header class="topbar">
    <button class="icon-btn" data-a="home" aria-label="Retour">${ICON.back}</button>
    <div class="tb-title"><strong>Compte et réglages</strong><span class="eyebrow">Forge des Héros ${APP_VERSION}</span></div>
  </header>
  <main class="sheet settings">
    <div class="set-grid">
      <div class="set-col">${accountSection()}</div>
      <div class="set-col">
        <section class="panel set-sec"><h3 class="ph">Apparence</h3>
          <div class="theme-grid">${themeOpt("dark", "Sombre", "Taverne à la chandelle")}${themeOpt("light", "Clair", "Parchemin de jour")}${themeOpt("system", "Automatique", "Suit votre appareil")}</div>
        </section>
        <section class="panel set-sec"><h3 class="ph">Langue</h3>
          <div class="chips">${langs.map(([k, n, ok]) => `<button class="chip ${k === LANG ? "on" : ""}" ${ok ? "" : 'aria-disabled="true"'} data-a="${ok ? "setLang" : "langSoon"}" data-v="${k}" aria-pressed="${k === LANG}">${n}${ok ? "" : `<small>${k === "en" ? "app installée" : "bientôt"}</small>`}</button>`).join("")}</div>
          <p class="mute small">L’allemand et l’espagnol sont en préparation.</p>
        </section>
        <section class="panel set-sec"><h3 class="ph">Livres et créations</h3><p class="mute small">Le contenu de vos livres complété hors aventure, enregistré sur cet appareil. Dans une aventure, passez par l’onglet Aventure d’une fiche ou l’écran du MJ.</p><div class="row-btns"><button class="btn small" data-a="hbOpen" data-code="_moi">Ouvrir</button></div></section>
        <section class="panel set-sec"><h3 class="ph">Support</h3>
          <p class="mute small">Votre message arrive directement chez le créateur de l’app.</p>
          <div class="support-grid">
            <button class="support-btn" data-a="fbOpen" data-v="bug"><span class="sb-ic bug">!</span><b>Signaler un problème</b><span class="mute small">Quelque chose ne marche pas ou s’affiche mal</span></button>
            <button class="support-btn" data-a="fbOpen" data-v="idea"><span class="sb-ic idea">+</span><b>Proposer une amélioration</b><span class="mute small">Une idée, une règle manquante, un souhait</span></button>
          </div>
        </section>
        <section class="panel set-sec"><h3 class="ph">À propos</h3>
          <dl class="facts"><div><dt>Version</dt><dd>${APP_VERSION}</dd></div><div><dt>Règles</dt><dd>D&D 2024 (SRD 5.2)</dd></div></dl>
          <p class="mute small">Contient du contenu du System Reference Document 5.2 de Wizards of the Coast LLC, sous licence CC-BY-4.0. Traduction et résumés non officiels. Application non affiliée à Wizards of the Coast ni à D&D Beyond.</p>
        </section>
      </div>
    </div>
  </main>`;
}

/* ---------- Support ---------- */
function feedbackModal(m) {
  if (m.k !== "feedback") return null;
  if (m.sent) return `<h3>Merci !</h3><p>${m.type === "bug" ? "Votre signalement a bien été envoyé. Il sera examiné rapidement." : "Votre idée a bien été envoyée. Merci de contribuer à la Forge !"}</p><div class="row-btns"><button class="btn primary" data-a="closeModal">Fermer</button></div>`;
  const bug = m.type === "bug";
  const u = typeof Account !== "undefined" && FB.ok ? Account.user() : null;
  return `<h3>${bug ? "Signaler un problème" : "Proposer une amélioration"}</h3>
    <div class="chips">${chip("Problème", bug, "fbType", 'data-v="bug"')}${chip("Amélioration", !bug, "fbType", 'data-v="idea"')}</div>
    <label class="field fb-msg"><span>${bug ? "Que s’est-il passé ?" : "Votre idée"}</span><textarea id="fbMsg" rows="6" maxlength="4000" placeholder="${bug ? "Ce que vous faisiez, ce qui s’est passé, ce que vous attendiez…" : "Décrivez ce qui vous serait utile…"}">${esc(m.msg || "")}</textarea></label>
    <label class="field"><span>E-mail pour vous répondre (facultatif)</span><input id="fbEmail" type="email" value="${esc(m.email != null ? m.email : (u && u.email) || "")}" placeholder="vous@exemple.be"></label>
    ${bug ? `<label class="check"><input type="checkbox" id="fbTech" checked> Joindre les infos techniques (version, appareil, écran ouvert)</label>` : ""}
    ${m.err ? `<p class="bad">${esc(m.err)}</p>` : ""}
    <div class="row-btns"><button class="btn primary" data-a="fbSend">Envoyer</button><button class="btn ghost" data-a="closeModal">Annuler</button></div>`;
}

async function settingsAct(a, d) {
  switch (a) {
    case "openSettings": S.view = "account"; S.acc = { mode: "in" }; S.modal = null; window.scrollTo(0, 0); return true;
    case "setTheme": Theme.set(d.v); return true;
    case "langSoon": toast(d.v === "en" ? "L’anglais est disponible dans l’app installée." : "Cette langue arrive bientôt."); return false;
    case "setLang": {
      if (d.v === LANG) return false;
      try { localStorage.setItem("forge-lang", d.v); } catch (e) { }
      location.href = LANG === "fr" ? "en/" : "../";
      return false;
    }
    case "noop": return false;
    case "accOutAsk": S.acc = Object.assign({}, S.acc, { confirmOut: true }); return true;
    case "accOutCancel": S.acc = { mode: "in" }; return true;
    case "fbOpen": S.modal = { k: "feedback", type: d.v }; return true;
    case "fbType": { const msg = ($("#fbMsg") || {}).value, email = ($("#fbEmail") || {}).value; S.modal = { k: "feedback", type: d.v, msg, email }; return true; }
    case "fbSend": {
      const msg = ($("#fbMsg").value || "").trim(), email = ($("#fbEmail").value || "").trim(), type = S.modal.type;
      if (msg.length < 5) { S.modal = Object.assign({}, S.modal, { msg, email, err: "Décrivez en quelques mots, s’il vous plaît." }); return true; }
      if (!FB.ok) { S.modal = Object.assign({}, S.modal, { msg, email, err: "L’envoi n’est possible que dans l’app installée, connectée à internet." }); return true; }
      const tech = $("#fbTech") ? $("#fbTech").checked : false;
      const ch = curChar();
      const doc = { type, message: msg, email: email || null, uid: FB.uid, version: APP_VERSION, created: Date.now(),
        device: tech ? { ua: navigator.userAgent.slice(0, 300), screen: window.innerWidth + "x" + window.innerHeight, theme: Theme.resolved(), standalone: !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) } : null,
        context: tech ? { view: S.view, tab: S.tab, cls: ch ? ch.b.cls : null, level: ch ? ch.b.level : null } : null };
      try { await FB.db.collection("feedback").add(doc); S.modal = { k: "feedback", type, sent: true }; }
      catch (e) { S.modal = Object.assign({}, S.modal, { msg, email, err: "Envoi impossible (" + ((e && e.code) || "erreur") + "). Vérifiez votre connexion." }); }
      return true;
    }
  }
  return false;
}
