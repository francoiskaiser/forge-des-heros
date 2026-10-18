/* Forge des Héros — comptes et synchronisation des personnages entre appareils */

const Account = { status: "", unsub: null, busy: false, errCode: null, retry: null };
function syncFailed(e) {
  Account.status = "err"; Account.errCode = (e && e.code) || "unknown";
  clearTimeout(Account.retry);
  Account.retry = setTimeout(() => { if (Account.user()) syncAccount(); }, 20000);
}
window.addEventListener("online", () => { if (Account.user() && Account.status === "err") syncAccount(); });
Account.user = () => (FB.ok && FB.auth && FB.auth.currentUser && !FB.auth.currentUser.isAnonymous ? FB.auth.currentUser : null);

function userChars() { return FB.db.collection("users").doc(FB.uid).collection("chars"); }
function cloudDoc(ch) { return { id: ch.id, b: clone(ch.b), p: clone(ch.p), adv: ch.adv || null, advName: ch.advName || null, updated: ch.updated || Date.now() }; }
function localSaveAll() {
  try { localStorage.setItem("forge-heros", JSON.stringify(S.chars)); } catch (e) { }
  Store.mem = {}; S.chars.forEach((c) => (Store.mem[c.id] = c));
}

/* Appelés par Store.put et Store.del */
const cloudTimers = {};
function cloudPut(ch) {
  const u = Account.user();
  if (!u) return;
  ch.synced = true; ch.owner = u.uid;
  clearTimeout(cloudTimers[ch.id]);
  cloudTimers[ch.id] = setTimeout(() => {
    userChars().doc(ch.id).set(cloudDoc(ch)).then(() => { if (Account.status !== "ok") { Account.status = "ok"; liveRender(); } })
      .catch((e) => { syncFailed(e); liveRender(); });
  }, 600);
}
function cloudDel(id) { if (Account.user()) userChars().doc(id).delete().catch(() => { }); }

/* Fusion initiale : le plus récent l’emporte ; un personnage déjà synchronisé mais absent du compte a été supprimé ailleurs */
async function syncAccount() {
  const u = Account.user();
  if (!u) return;
  Account.status = "sync"; render();
  try {
    const snap = await userChars().get();
    const remote = {};
    snap.docs.forEach((d) => (remote[d.id] = d.data()));
    const uploads = [];
    // le personnage d’exemple de cet appareil n’est pas recopié dans un compte qui a déjà des personnages
    if (snap.docs.length) S.chars = S.chars.filter((ch) => !(ch.example && !remote[ch.id]));
    S.chars = S.chars.filter((ch) => {
      const r = remote[ch.id];
      if (!r) { if (ch.synced && ch.owner === u.uid) return false; uploads.push(ch); return true; }
      if ((r.updated || 0) > (ch.updated || 0)) Object.assign(ch, { b: migrate(r.b), p: r.p, adv: r.adv || null, advName: r.advName || null, updated: r.updated });
      else if ((ch.updated || 0) > (r.updated || 0)) uploads.push(ch);
      ch.synced = true; ch.owner = u.uid;
      return true;
    });
    Object.values(remote).forEach((r) => { if (!S.chars.some((c) => c.id === r.id)) S.chars.push({ id: r.id, b: migrate(r.b), p: r.p, adv: r.adv || null, advName: r.advName || null, updated: r.updated, synced: true, owner: u.uid }); });
    await Promise.all(uploads.map((ch) => { ch.synced = true; ch.owner = u.uid; return userChars().doc(ch.id).set(cloudDoc(ch)); }));
    localSaveAll();
    // aventures dont ce compte est le MJ
    try {
      const q = await FB.db.collection("adventures").where("gm", "==", u.uid).get();
      q.docs.forEach((d) => { if (!GmList.get().some((x) => x.code === d.id)) GmList.add(d.id, d.data().name); });
    } catch (e) { }
    S.chars.filter((c) => c.adv).forEach((c) => pushMember(c));
    watchAccount();
    Account.status = "ok"; Account.errCode = null;
  } catch (e) { syncFailed(e); }
  render();
}

/* Écoute en direct : les modifications faites sur un autre appareil arrivent ici */
function watchAccount() {
  if (Account.unsub) Account.unsub();
  Account.unsub = userChars().onSnapshot((q) => {
    let changed = false;
    q.docChanges().forEach((chg) => {
      const r = chg.doc.data(), i = S.chars.findIndex((c) => c.id === chg.doc.id);
      if (chg.type === "removed") {
        if (i >= 0) { S.chars.splice(i, 1); changed = true; if (S.cur === chg.doc.id && S.view === "sheet") S.view = "home"; }
        return;
      }
      if (i < 0) { S.chars.push({ id: r.id, b: migrate(r.b), p: r.p, adv: r.adv || null, advName: r.advName || null, updated: r.updated, synced: true, owner: FB.uid }); changed = true; }
      else if ((r.updated || 0) > (S.chars[i].updated || 0)) { Object.assign(S.chars[i], { b: migrate(r.b), p: r.p, adv: r.adv || null, advName: r.advName || null, updated: r.updated }); changed = true; }
    });
    if (changed) { localSaveAll(); liveRender(); }
  }, () => { });
}

/* Passage vers un compte existant : le compte anonyme de cet appareil change d’identifiant.
   On retire ses fiches des aventures et on prépare le transfert des aventures dont il est MJ. */
async function switchAccount(signIn) {
  const oldUid = FB.uid;
  await Promise.all(S.chars.filter((c) => c.adv).map((c) => FB.members(c.adv).doc(oldUid + "_" + c.id).delete().catch(() => { })));
  const claims = {};
  for (const g of GmList.get()) {
    const t = uid() + uid() + uid();
    try { const d = await FB.adv(g.code).get(); if (d.exists && d.data().gm === oldUid) { await FB.adv(g.code).update({ claim: t }); claims[g.code] = t; } } catch (e) { }
  }
  await signIn();
  for (const [code, t] of Object.entries(claims)) {
    try { await FB.adv(code).update({ gm: FB.uid, claimProof: t, claim: firebase.firestore.FieldValue.delete() }); } catch (e) { }
  }
}

const AUTH_ERR = {
  "auth/invalid-email": "Adresse e-mail invalide.",
  "auth/missing-password": "Saisissez un mot de passe.",
  "auth/weak-password": "Mot de passe trop court : 6 caractères minimum.",
  "auth/email-already-in-use": "Un compte existe déjà avec cette adresse. Utilisez « Se connecter ».",
  "auth/credential-already-in-use": "Ce compte est déjà utilisé.",
  "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
  "auth/wrong-password": "E-mail ou mot de passe incorrect.",
  "auth/user-not-found": "Aucun compte avec cette adresse. Utilisez « Créer un compte ».",
  "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/popup-closed-by-user": "Fenêtre de connexion fermée avant la fin.",
  "auth/popup-blocked": "La fenêtre de connexion a été bloquée. Autorisez les fenêtres pop-up ou utilisez l’e-mail.",
  "auth/operation-not-supported-in-this-environment": "La connexion Google ne fonctionne pas dans ce mode. Utilisez l’e-mail et le mot de passe.",
  "auth/operation-not-allowed": "Ce mode de connexion n’est pas activé dans Firebase (Authentication › Sign-in method).",
  "auth/unauthorized-domain": "Ce site n’est pas autorisé dans Firebase (Authentication › Paramètres › Domaines autorisés).",
  "auth/network-request-failed": "Pas de connexion internet.",
};
const authMsg = (e) => AUTH_ERR[e && e.code] || "Connexion impossible" + (e && e.code ? " (" + e.code + ")" : "") + ".";

async function afterLogin(kind) {
  S.modal = null; S.acc = { mode: "in" };
  toast(kind === "new" ? "Compte créé. Vos personnages sont synchronisés." : "Connecté. Synchronisation de vos personnages…");
  await syncAccount();
}

async function accAct(a, d) {
  if (typeof settingsAct === "function" && (await settingsAct(a, d))) return true;
  switch (a) {
    case "accOpen": S.view = "account"; S.acc = { mode: "in" }; window.scrollTo(0, 0); return true;
    case "accMode": S.acc = { mode: d.v }; return true;
    case "accGoogle": {
      if (Account.busy) return true;
      Account.busy = true;
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        const cur = FB.auth.currentUser;
        try {
          if (cur && cur.isAnonymous) await cur.linkWithPopup(provider);
          else await FB.auth.signInWithPopup(provider);
        } catch (e) {
          if (e.code === "auth/credential-already-in-use" && e.credential) await switchAccount(() => FB.auth.signInWithCredential(e.credential));
          else throw e;
        }
        await afterLogin();
      } catch (e) { S.acc = { mode: "in", err: authMsg(e) }; }
      Account.busy = false;
      return true;
    }
    case "accEmail": {
      if (Account.busy) return true;
      const email = ($("#accEmail").value || "").trim(), pw = $("#accPw").value || "", mode = (S.acc && S.acc.mode) || "in";
      if (!email || !pw) { S.acc = { mode, err: "Saisissez votre e-mail et votre mot de passe.", email }; return true; }
      Account.busy = true;
      try {
        const cur = FB.auth.currentUser;
        if (mode === "new") {
          const cred = firebase.auth.EmailAuthProvider.credential(email, pw);
          if (cur && cur.isAnonymous) await cur.linkWithCredential(cred);
          else await FB.auth.createUserWithEmailAndPassword(email, pw);
          await afterLogin("new");
        } else {
          if (cur && cur.isAnonymous) await switchAccount(() => FB.auth.signInWithEmailAndPassword(email, pw));
          else await FB.auth.signInWithEmailAndPassword(email, pw);
          await afterLogin();
        }
      } catch (e) { S.acc = { mode, err: authMsg(e), email }; }
      Account.busy = false;
      return true;
    }
    case "accReset": {
      const email = ($("#accEmail").value || "").trim();
      if (!email) { S.acc = { mode: "in", err: "Saisissez d’abord votre adresse e-mail." }; return true; }
      try { await FB.auth.sendPasswordResetEmail(email); S.acc = { mode: "in", info: "E-mail envoyé à " + email + ". Suivez le lien pour choisir un nouveau mot de passe.", email }; }
      catch (e) { S.acc = { mode: "in", err: authMsg(e), email }; }
      return true;
    }
    case "accRetry": S.modal = null; await syncAccount(); toast(Account.status === "ok" ? "Synchronisé" : "Échec : " + (Account.errCode || "inconnu")); return true;
    case "accOutDo": {
      if (Account.unsub) { Account.unsub(); Account.unsub = null; }
      Live.stop();
      // Les personnages du compte quittent cet appareil ; ceux créés hors connexion restent.
      S.chars = S.chars.filter((c) => !c.synced);
      localSaveAll();
      try { localStorage.removeItem("forge-gm"); } catch (e) { }
      await FB.auth.signOut();
      try { await FB.auth.signInAnonymously(); } catch (e) { }
      Account.status = ""; S.modal = null; S.acc = { mode: "in" };
      toast("Déconnecté. Vos personnages restent dans votre compte.");
      return true;
    }
  }
  return false;
}

function accountChip() {
  const u = FB.ok ? Account.user() : null;
  if (!u) return `<button class="acc-chip" data-a="openSettings">${ICON.boot}<span>${FB.ok ? "Se connecter" : "Réglages"}</span></button>`;
  const label = u.displayName || u.email || "Mon compte";
  return `<button class="acc-chip on" data-a="openSettings" title="Compte et réglages"><span class="acc-av">${esc((label.trim()[0] || "?").toUpperCase())}</span><span class="acc-txt"><b>${esc(label)}</b><small class="${Account.status === "err" ? "bad" : ""}">${syncLabel()}</small></span></button>`;
}
function accountNudge() {
  if (!FB.ok || Account.user()) return "";
  return `<section class="acc-nudge"><div><b>Retrouvez vos personnages partout</b><p class="mute small">Connectez-vous pour synchroniser vos fiches et vos aventures entre votre téléphone, votre tablette et votre ordinateur.</p></div><button class="btn primary" data-a="openSettings">Se connecter</button></section>`;
}

function accountModal(m) { return typeof feedbackModal === "function" ? feedbackModal(m) : null; }
const GOOGLE_G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

function accountStart() { if (Account.user()) syncAccount(); }
