# Historique des versions — Forge des Héros

Chaque version correspond à un commit Git dont le message commence par son numéro. Pour revenir en arrière, voir la section en bas.

## 1.10.0 — 19 octobre 2026
- **Incantation de sous-classe** : l'Arnaqueur arcanique et le Chevalier occulte lancent des sorts (progression de tiers-lanceur : emplacements, tours de magie, sorts préparés, liste du magicien). Option disponible pour toute sous-classe créée.
- Les **sorts toujours préparés** d'une sous-classe apparaissent dans l'onglet Sorts (une ligne sans niveau compte pour le niveau 3).
- Bouton **Modifier** sur une sous-classe, un historique ou un don déjà complété (créateur et onglet Aptitudes).
- **Import / export** dans Livres et créations : fichier Excel (toutes les entrées du Manuel des joueurs à compléter et les créations) et sauvegarde .json. Les lignes vides sont ignorées.
- Livres et créations accessibles hors aventure depuis Compte et réglages.

## 1.9.0 — 19 octobre 2026
- **Catalogue du Manuel des joueurs intégré** : les 36 autres sous-classes, 12 historiques et 47 dons apparaissent dans le créateur comme les options du SRD, avec leurs niveaux, caractéristiques, compétences et don d'origine.
- Leur texte n'est pas fourni : un bouton **Compléter** permet de le recopier une fois depuis son livre. Il est partagé avec toute l'aventure (ou gardé sur l'appareil hors aventure).
- « Contenu maison » devient **Livres et créations**, avec un filtre « À compléter » ; l'étiquette « Maison » disparaît, le contenu de l'aventure est au même rang que le reste.

## 1.8.0 — 19 octobre 2026
- **Contenu maison partagé par l'aventure** : sous-classes, historiques, dons, sorts et objets à ajouter depuis l'onglet Aventure d'une fiche ou l'écran du MJ. Ils apparaissent dans le créateur et sur les fiches de tous les membres (nouvelles règles Firestore nécessaires).
- **Bestiaire du SRD 5.2** dans l'écran du MJ : 330+ créatures en français, recherche, blocs de statistiques avec jets cliquables, ajout direct au combat (PV moyens ou lancés).
- **Objets magiques** du SRD dans l'inventaire : recherche, description, harmonisation (3 maximum).
- **109 sorts du SRD ajoutés** (Maléfice, Châtiment ardent, Orbe chromatique, Appel de familier…) : 341 sorts au total.

## 1.7.1 — 18 octobre 2026
- Champ **Divinité ou foi** dans l'identité du personnage (mis en avant pour les clercs et les paladins), visible dans les notes et par le MJ.

## 1.7.0 — 18 octobre 2026
- **Version anglaise** complète (interface et contenu SRD 5.2 avec la terminologie officielle, distances en pieds).
- Choix de la langue dans Compte et réglages ; détection automatique de la langue du téléphone à la première visite.
- Les personnages, aventures et comptes sont partagés entre les deux langues.
- Code source ajouté au dépôt (dossier `_source`).

## 1.6.0 — 18 octobre 2026
- Page **Compte et réglages** (bouton en haut à droite de l'accueil).
- **Mode clair** « parchemin », mode sombre et mode automatique.
- **Support** : signaler un problème ou proposer une amélioration (messages dans Firebase › Firestore › `feedback`).
- Choix de la langue préparé (français ; anglais, allemand et espagnol à venir).

## 1.5.1 — 18 octobre 2026
- Cause précise affichée si la synchronisation échoue, réessai automatique.

## 1.5.0 — 18 octobre 2026
- **Comptes** (Google ou e-mail) et synchronisation des personnages entre appareils.

## 1.4.0 — 17 octobre 2026
- **Mode aventure** : code d'aventure, écran du maître du jeu, initiative, notes de campagne.
- Niveaux 1 à 20, sorts jusqu'au niveau 9.

## Revenir à une version précédente
Demandez simplement à Claude : « reviens à la version 1.5.1 ». Il publie l'ancienne version
comme une nouvelle mise à jour ; l'historique est conservé et l'on peut revenir en avant à tout moment.
