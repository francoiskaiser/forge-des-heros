# Activer le mode aventure (Firebase)

Une seule fois, par le propriétaire de l'app. Environ 10 minutes. Gratuit (offre Spark).

1. **Créer le projet** — console.firebase.google.com → *Créer un projet* → nom `forge-des-heros`
   → désactiver Google Analytics → *Créer*.
2. **Connexion anonyme** — menu *Créer* (Build) → *Authentication* → *Commencer* →
   onglet *Sign-in method* → *Anonyme* → activer → *Enregistrer*.
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
- L'écran MJ est lié à l'appareil sur lequel l'aventure a été créée.
