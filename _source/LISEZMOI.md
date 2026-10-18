# Code source de Forge des Héros

Ce dossier n'est pas publié par GitHub Pages (les dossiers commençant par `_` sont ignorés).

- `src/` : code de l'app (données de règles, moteur, interface, aventures, comptes, réglages).
- `tools/i18n.js` + `tools/en/*.json` : traduction anglaise générée à la construction.
- `build_pwa.py` : produit `index.html` (français) et `en/index.html` (anglais).

Construction (depuis ce dossier) : `cd tools && npm i && cd .. && python3 build_pwa.py`,
puis copier `pwa/index.html` et `pwa/en/index.html` à la racine du dépôt.
