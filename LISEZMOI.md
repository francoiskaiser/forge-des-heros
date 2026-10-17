# Forge des Héros — version PWA

Application installable (icône sur l’écran d’accueil) qui fonctionne hors ligne après la première ouverture.
Les personnages sont enregistrés dans le navigateur de l’appareil. Utilisez **Exporter** / **Importer**
(onglet Notes de la fiche, et page d’accueil) pour les transférer d’un appareil à l’autre ou depuis la version en ligne.

## Mettre en ligne gratuitement avec GitHub Pages

1. Créez un compte sur github.com si besoin, puis un nouveau dépôt public (ex. `forge-des-heros`).
2. Dans le dépôt : **Add file → Upload files**, glissez tous les fichiers de ce dossier
   (`index.html`, `sw.js`, `manifest.webmanifest`, les 4 images `.png`), puis **Commit changes**.
3. **Settings → Pages** : sous *Build and deployment*, choisissez *Deploy from a branch*,
   branche `main`, dossier `/ (root)`, puis **Save**.
4. Après une à deux minutes, l’app est disponible à `https://VOTRE-NOM.github.io/forge-des-heros/`.

## Installer l’app

- **Android (Chrome)** : ouvrez l’adresse, menu ⋮ → *Installer l’application*.
- **iPhone / iPad (Safari)** : bouton Partager → *Sur l’écran d’accueil*.
- **Ordinateur (Chrome ou Edge)** : icône d’installation dans la barre d’adresse.

## Mettre à jour

Remplacez `index.html` dans le dépôt et changez le numéro de version (ex. `forge-v2` en `forge-v3`) dans `sw.js`
pour que les appareils récupèrent la nouvelle version.

## Mentions

Contient du contenu du System Reference Document 5.2 de Wizards of the Coast LLC,
sous licence Creative Commons Attribution 4.0 (CC-BY-4.0). Traduction et résumés non officiels.
Application non affiliée à Wizards of the Coast ni à D&D Beyond.
