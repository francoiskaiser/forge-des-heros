# Activer le mode aventure (Firebase)

Une seule fois, par le propriétaire de l'app. Environ 10 minutes. Gratuit (offre Spark).

1. **Créer le projet** — console.firebase.google.com → *Créer un projet* → nom `forge-des-heros`
   → désactiver Google Analytics → *Créer*.
2. **Modes de connexion** — menu *Créer* (Build) → *Authentication* → *Commencer* →
   onglet *Sign-in method*. Activez :
   - **Anonyme** (utilisé avant connexion) ;
   - **Adresse e-mail/Mot de passe** (première option seulement) ;
   - **Google** (choisissez votre e-mail comme adresse d'assistance).
3. **Autoriser votre site** — toujours dans *Authentication* → onglet *Paramètres* →
   *Domaines autorisés* → *Ajouter un domaine* → `VOTRE-PSEUDO.github.io`.
4. **Base de données** — *Créer* → *Firestore Database* → *Créer une base de données* →
   emplacement en Europe (ex. `eur3` ou `europe-west1`) → *Démarrer en mode production* → *Créer*.
5. **Règles de sécurité** — onglet *Règles* de Firestore → remplacer tout le contenu par celui
   du fichier `firestore.rules` → *Publier*.
6. **Configuration** — roue crantée → *Paramètres du projet* → section *Vos applications* →
   icône Web `</>` → surnom `forge` → *Enregistrer l'application* (ne pas cocher Hosting).
   Firebase affiche un bloc `firebaseConfig = { apiKey: "...", ... }`.
7. **Coller la configuration** — ouvrez `firebase-config.js` avec le Bloc-notes et recopiez
   chaque valeur entre les guillemets correspondants (apiKey, authDomain, projectId,
   storageBucket, messagingSenderId, appId). Enregistrez.
8. **Envoyer sur GitHub** — *Add file* → *Upload files* → glissez tous les fichiers
   (dont `firebase-config.js` modifié) → *Commit changes*.

La clé `apiKey` n'est pas un secret : elle identifie le projet, et ce sont les règles
de sécurité qui protègent les données.

## Utilisation
- **MJ** : page d'accueil → *Créer une aventure* → donnez le code aux joueurs.
- **Joueurs** : ouvrir sa fiche → onglet *Aventure* → entrer le code → *Rejoindre*.
- L'écran MJ appartient à l'identité qui a créé l'aventure : l'appareil, ou votre compte si vous
  êtes connecté. Connecté à votre compte, vous retrouvez vos aventures sur tous vos appareils.
- **Clé de MJ** (écran du MJ › Groupe) : elle permet de reprendre l'aventure depuis un autre
  appareil ou compte (accueil › *Ouvrir avec un code* › entrer la clé). Les aventures créées
  avant la version 1.14.1 n'en ont pas : ouvrez l'écran du MJ sur l'appareil d'origine et
  touchez *Créer une clé*.

## Débloquer une aventure à la main (console)
Si l'écran du MJ affiche « Vous n'êtes pas le MJ de cette aventure » et que l'appareil
d'origine n'est plus disponible : copiez « Votre identifiant sur cet appareil » affiché sur
cet écran, puis console Firebase → *Firestore Database* → `adventures` → le document au code
de l'aventure (ex. `JFF-XMR`) → champ `gm` → collez l'identifiant → *Mettre à jour*.

## Mise à jour des règles
Après une mise à jour de l'app qui touche `firestore.rules` (dernière : 1.14.1, clé de MJ),
recopiez le fichier dans l'onglet *Règles* de Firestore → *Publier*.
