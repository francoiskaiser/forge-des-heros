/* K() marque une valeur enregistrée (clé) : elle n’est jamais traduite. */
const K = (x) => x;
const LANG = "fr";
/* Forge des Héros — données de règles.
   Contenu adapté du SRD 5.2 (Wizards of the Coast LLC), licence CC-BY-4.0.
   Traduction et résumés originaux. */

const ABIL = {
  for: { n: "Force", s: "FOR" }, dex: { n: "Dextérité", s: "DEX" }, con: { n: "Constitution", s: "CON" },
  int: { n: "Intelligence", s: "INT" }, sag: { n: "Sagesse", s: "SAG" }, cha: { n: "Charisme", s: "CHA" },
};
const ABK = ["for", "dex", "con", "int", "sag", "cha"];

const SKILLS = {
  acro: { n: "Acrobaties", a: "dex" }, arca: { n: "Arcanes", a: "int" }, athl: { n: "Athlétisme", a: "for" },
  disc: { n: "Discrétion", a: "dex" }, dres: { n: "Dressage", a: "sag" }, esca: { n: "Escamotage", a: "dex" },
  hist: { n: "Histoire", a: "int" }, inti: { n: "Intimidation", a: "cha" }, inve: { n: "Investigation", a: "int" },
  mede: { n: "Médecine", a: "sag" }, natu: { n: "Nature", a: "int" }, perc: { n: "Perception", a: "sag" },
  pspi: { n: "Perspicacité", a: "sag" }, psua: { n: "Persuasion", a: "cha" }, reli: { n: "Religion", a: "int" },
  repr: { n: "Représentation", a: "cha" }, surv: { n: "Survie", a: "sag" }, trom: { n: "Tromperie", a: "cha" },
};
const SKK = Object.keys(SKILLS).sort((a, b) => SKILLS[a].n.localeCompare(SKILLS[b].n, "fr"));

const LANG_PAIRS = [[K("Commun des signes"), "Commun des signes"], [K("Draconique"), "Draconique"], [K("Elfique"), "Elfique"], [K("Géant"), "Géant"], [K("Gnome"), "Gnome"], [K("Gobelin"), "Gobelin"], [K("Halfelin"), "Halfelin"], [K("Nain"), "Nain"], [K("Orc"), "Orc"]];
const LANGS = LANG_PAIRS.map((p) => p[0]), LANG_L = Object.fromEntries(LANG_PAIRS);
const ALIGN_PAIRS = [[K("Loyal bon"), "Loyal bon"], [K("Neutre bon"), "Neutre bon"], [K("Chaotique bon"), "Chaotique bon"], [K("Loyal neutre"), "Loyal neutre"], [K("Neutre"), "Neutre"], [K("Chaotique neutre"), "Chaotique neutre"], [K("Loyal mauvais"), "Loyal mauvais"], [K("Neutre mauvais"), "Neutre mauvais"], [K("Chaotique mauvais"), "Chaotique mauvais"]];
const ALIGN = ALIGN_PAIRS.map((p) => p[0]), ALIGN_L = Object.fromEntries(ALIGN_PAIRS);
const SIZE_L = Object.fromEntries([[K("Moyenne"), "Moyenne"], [K("Petite"), "Petite"]]);

const DMG = { acide: "acide", contondant: "contondants", feu: "feu", force: "force", foudre: "foudre", froid: "froid", necro: "nécrotiques", perforant: "perforants", poison: "poison", psy: "psychiques", radiant: "radiants", tranchant: "tranchants", tonnerre: "tonnerre" };

/* ---------- Armes (maîtrise 2024) ---------- */
const MASTERY = {
  affaiblir: "Affaiblir — si vous touchez, la cible a le désavantage à son prochain jet d’attaque avant le début de votre prochain tour.",
  effleurer: "Effleurer — si vous ratez, la cible subit quand même des dégâts égaux à votre modificateur de caractéristique.",
  enchainer: "Enchaîner — l’attaque supplémentaire de l’arme légère se fait dans votre action d’Attaque plutôt qu’en action bonus (une fois par tour).",
  fendre: "Fendre — si vous touchez, vous pouvez attaquer une seconde créature à 1,50 m de la première (une fois par tour), sans ajouter votre modificateur aux dégâts.",
  harceler: "Harceler — si vous touchez et infligez des dégâts, vous avez l’avantage à votre prochaine attaque contre cette cible avant la fin de votre prochain tour.",
  ralentir: "Ralentir — si vous touchez et infligez des dégâts, la vitesse de la cible diminue de 3 m jusqu’au début de votre prochain tour.",
  renverser: "Renverser — si vous touchez, la cible fait un jet de sauvegarde de Constitution (DD 8 + mod. + maîtrise) ou tombe à terre.",
  repousser: "Repousser — si vous touchez, vous pouvez repousser une cible de taille Grande ou inférieure de 3 m.",
};
// p: propriétés  F finesse, L légère, LD lancer, P polyvalente, DM deux mains, LO lourde, AL allonge, M munitions, R rechargement
const WEAPONS = {
  baton: { n: "Bâton", c: "simple", k: "cac", d: "1d6", t: "contondant", p: ["P"], v: "1d8", m: "renverser", w: 2, cost: "2 pa" },
  dague: { n: "Dague", c: "simple", k: "cac", d: "1d4", t: "perforant", p: ["F", "L", "LD"], r: "6/18 m", m: "enchainer", w: 0.5, cost: "2 po" },
  gourdin: { n: "Gourdin", c: "simple", k: "cac", d: "1d4", t: "contondant", p: ["L"], m: "ralentir", w: 1, cost: "1 pa" },
  massue: { n: "Massue", c: "simple", k: "cac", d: "1d8", t: "contondant", p: ["DM"], m: "repousser", w: 5, cost: "2 pa" },
  hachette: { n: "Hachette", c: "simple", k: "cac", d: "1d6", t: "tranchant", p: ["L", "LD"], r: "6/18 m", m: "harceler", w: 1, cost: "5 po" },
  javeline: { n: "Javeline", c: "simple", k: "cac", d: "1d6", t: "perforant", p: ["LD"], r: "9/36 m", m: "ralentir", w: 1, cost: "5 pa" },
  marteauleger: { n: "Marteau léger", c: "simple", k: "cac", d: "1d4", t: "contondant", p: ["L", "LD"], r: "6/18 m", m: "enchainer", w: 1, cost: "2 po" },
  masse: { n: "Masse d’armes", c: "simple", k: "cac", d: "1d6", t: "contondant", p: [], m: "affaiblir", w: 2, cost: "5 po" },
  serpe: { n: "Serpe", c: "simple", k: "cac", d: "1d4", t: "tranchant", p: ["L"], m: "enchainer", w: 1, cost: "1 po" },
  lance: { n: "Lance", c: "simple", k: "cac", d: "1d6", t: "perforant", p: ["LD", "P"], v: "1d8", r: "6/18 m", m: "affaiblir", w: 1.5, cost: "1 po" },
  arbaleteleg: { n: "Arbalète légère", c: "simple", k: "dist", d: "1d8", t: "perforant", p: ["M", "R", "DM"], r: "24/96 m", m: "ralentir", w: 2.5, cost: "25 po" },
  arccourt: { n: "Arc court", c: "simple", k: "dist", d: "1d6", t: "perforant", p: ["M", "DM"], r: "24/96 m", m: "harceler", w: 1, cost: "25 po" },
  flechette: { n: "Fléchette", c: "simple", k: "dist", d: "1d4", t: "perforant", p: ["F", "LD"], r: "6/18 m", m: "harceler", w: 0.1, cost: "5 pc" },
  fronde: { n: "Fronde", c: "simple", k: "dist", d: "1d4", t: "contondant", p: ["M"], r: "9/36 m", m: "ralentir", w: 0, cost: "1 pa" },
  hachedebataille: { n: "Hache d’armes", c: "guerre", k: "cac", d: "1d8", t: "tranchant", p: ["P"], v: "1d10", m: "renverser", w: 2, cost: "10 po" },
  fleau: { n: "Fléau d’armes", c: "guerre", k: "cac", d: "1d8", t: "contondant", p: [], m: "affaiblir", w: 1, cost: "10 po" },
  coutille: { n: "Coutille", c: "guerre", k: "cac", d: "1d10", t: "tranchant", p: ["LO", "AL", "DM"], m: "effleurer", w: 3, cost: "20 po" },
  hachea2mains: { n: "Hache à deux mains", c: "guerre", k: "cac", d: "1d12", t: "tranchant", p: ["LO", "DM"], m: "fendre", w: 3.5, cost: "30 po" },
  epeea2mains: { n: "Épée à deux mains", c: "guerre", k: "cac", d: "2d6", t: "tranchant", p: ["LO", "DM"], m: "effleurer", w: 3, cost: "50 po" },
  hallebarde: { n: "Hallebarde", c: "guerre", k: "cac", d: "1d10", t: "tranchant", p: ["LO", "AL", "DM"], m: "fendre", w: 3, cost: "20 po" },
  epeelongue: { n: "Épée longue", c: "guerre", k: "cac", d: "1d8", t: "tranchant", p: ["P"], v: "1d10", m: "affaiblir", w: 1.5, cost: "15 po" },
  maillet: { n: "Maillet d’armes", c: "guerre", k: "cac", d: "2d6", t: "contondant", p: ["LO", "DM"], m: "renverser", w: 5, cost: "10 po" },
  morgenstern: { n: "Morgenstern", c: "guerre", k: "cac", d: "1d8", t: "perforant", p: [], m: "affaiblir", w: 2, cost: "15 po" },
  pique: { n: "Pique", c: "guerre", k: "cac", d: "1d10", t: "perforant", p: ["LO", "AL", "DM"], m: "repousser", w: 9, cost: "5 po" },
  rapiere: { n: "Rapière", c: "guerre", k: "cac", d: "1d8", t: "perforant", p: ["F"], m: "harceler", w: 1, cost: "25 po" },
  cimeterre: { n: "Cimeterre", c: "guerre", k: "cac", d: "1d6", t: "tranchant", p: ["F", "L"], m: "enchainer", w: 1.5, cost: "25 po" },
  epeecourte: { n: "Épée courte", c: "guerre", k: "cac", d: "1d6", t: "perforant", p: ["F", "L"], m: "harceler", w: 1, cost: "10 po" },
  trident: { n: "Trident", c: "guerre", k: "cac", d: "1d8", t: "perforant", p: ["LD", "P"], v: "1d10", r: "6/18 m", m: "renverser", w: 2, cost: "5 po" },
  marteaudeguerre: { n: "Marteau de guerre", c: "guerre", k: "cac", d: "1d8", t: "contondant", p: ["P"], v: "1d10", m: "repousser", w: 2.5, cost: "15 po" },
  picdeguerre: { n: "Pic de guerre", c: "guerre", k: "cac", d: "1d8", t: "perforant", p: ["P"], v: "1d10", m: "affaiblir", w: 1, cost: "5 po" },
  fouet: { n: "Fouet", c: "guerre", k: "cac", d: "1d4", t: "tranchant", p: ["F", "AL"], m: "ralentir", w: 1.5, cost: "2 po" },
  arbaletepoing: { n: "Arbalète de poing", c: "guerre", k: "dist", d: "1d6", t: "perforant", p: ["M", "L", "R"], r: "9/36 m", m: "harceler", w: 1.5, cost: "75 po" },
  arbaletelourde: { n: "Arbalète lourde", c: "guerre", k: "dist", d: "1d10", t: "perforant", p: ["M", "LO", "R", "DM"], r: "30/120 m", m: "repousser", w: 9, cost: "50 po" },
  arclong: { n: "Arc long", c: "guerre", k: "dist", d: "1d8", t: "perforant", p: ["M", "LO", "DM"], r: "45/180 m", m: "ralentir", w: 1, cost: "50 po" },
};
/* « Lancer » a trois sens : lancer un sort, lancer un dé, propriété d’arme */
const T_CAST = LANG === "en" ? "Cast" : "Lancer", T_ROLL = LANG === "en" ? "Roll" : "Lancer";
const WPROP = { F: "Finesse", L: "Légère", LD: LANG === "en" ? "Thrown" : "Lancer", P: "Polyvalente", DM: "Deux mains", LO: "Lourde", AL: "Allonge", M: "Munitions", R: "Rechargement" };

const ARMORS = {
  matelassee: { n: "Armure matelassée", t: "legere", ac: 11, dex: 99, st: true, w: 4, cost: "5 po" },
  cuir: { n: "Armure de cuir", t: "legere", ac: 11, dex: 99, w: 5, cost: "10 po" },
  cuirclout: { n: "Cuir clouté", t: "legere", ac: 12, dex: 99, w: 6.5, cost: "45 po" },
  peaux: { n: "Armure de peaux", t: "inter", ac: 12, dex: 2, w: 6, cost: "10 po" },
  chemise: { n: "Chemise de mailles", t: "inter", ac: 13, dex: 2, w: 10, cost: "50 po" },
  ecailles: { n: "Armure d’écailles", t: "inter", ac: 14, dex: 2, st: true, w: 22.5, cost: "50 po" },
  cuirasse: { n: "Cuirasse", t: "inter", ac: 14, dex: 2, w: 10, cost: "400 po" },
  demiplate: { n: "Demi-plate", t: "inter", ac: 15, dex: 2, st: true, w: 20, cost: "750 po" },
  broigne: { n: "Broigne", t: "lourde", ac: 14, dex: 0, st: true, w: 20, cost: "30 po" },
  cottemailles: { n: "Cotte de mailles", t: "lourde", ac: 16, dex: 0, str: 13, st: true, w: 27.5, cost: "75 po" },
  clibanion: { n: "Clibanion", t: "lourde", ac: 17, dex: 0, str: 15, st: true, w: 30, cost: "200 po" },
  harnois: { n: "Harnois", t: "lourde", ac: 18, dex: 0, str: 15, st: true, w: 32.5, cost: "1 500 po" },
  bouclier: { n: "Bouclier", t: "bouclier", ac: 2, w: 3, cost: "10 po" },
};

/* objets simples de l’équipement de départ */
const GEAR = {
  sacexplo: "Sac d’explorateur", sacexplor: "Sac d’exploration souterraine", sacpretre: "Sac d’ecclésiastique", sacerudit: "Sac d’érudit",
  sacartiste: "Sac d’artiste", saccambrio: "Sac de cambrioleur", symbole: "Symbole sacré", focaldruid: "Focaliseur druidique (gui)",
  focalarc: "Focaliseur arcanique (cristal)", orbe: "Focaliseur arcanique (orbe)", grimoire: "Grimoire", robe: "Robe",
  instrument: "Instrument de musique", herbo: "Matériel d’herboriste", voleur: "Outils de voleur", fleches: "Flèches (20)",
  carquois: "Carquois", calli: "Matériel de calligraphe", livreprieres: "Livre (prières)", livrehist: "Livre (histoire)",
  livreocc: "Livre (savoir occulte)", parchemin: "Parchemin (feuilles)", pied: "Pied-de-biche", bourse: "Bourse",
  vetvoyage: "Vêtements de voyage", jeu: "Jeu (cartes ou dés)", soins: "Trousse de soins", outilartisan: "Outils d’artisan ou instrument",
};

/* matériel d’aventurier (catalogue de recherche de l’inventaire) */
const GEAR_MORE = {
  sacados: "Sac à dos", couchage: "Sac de couchage", couverture: "Couverture", tente: "Tente", rations: "Rations (1 jour)", gourde: "Outre",
  corde: "Corde (15 m)", grappin: "Grappin", torche: "Torche", lanterne: "Lanterne à capuchon", lanternesourde: "Lanterne sourde", bougie: "Bougie",
  huile: "Huile (flasque)", amadou: "Briquet à amadou", chaine: "Chaîne (3 m)", cadenas: "Cadenas", menottes: "Menottes", pitons: "Pitons (10)",
  pelle: "Pelle", perche: "Perche (3 m)", echelle: "Échelle (3 m)", miroir: "Miroir", longuevue: "Longue-vue", loupe: "Loupe", sablier: "Sablier",
  craie: "Craie", encre: "Encre (fiole)", plume: "Plume d’écriture", livre: "Livre", carte: "Carte", fiole: "Fiole", flasque: "Flasque", coffre: "Coffre",
  seau: "Seau", panier: "Panier", sacgrande: "Sac de toile", sifflet: "Sifflet", cloche: "Clochette", billes: "Billes (sac)", chaussetrappes: "Chausse-trappes (sac)",
  piege: "Piège de chasse", filet: "Filet", acide: "Acide (fiole)", feugregeois: "Feu grégeois (flasque)", eaubenite: "Eau bénite (flasque)",
  antitoxine: "Antitoxine (fiole)", poison: "Poison basique (fiole)", carreaux: "Carreaux (20)", billesfronde: "Billes de fronde (20)", aiguilles: "Aiguilles de sarbacane (50)",
  vetfins: "Vêtements fins", costume: "Costume", cape: "Cape", baguette: "Baguette (focaliseur arcanique)", batonarc: "Bâton (focaliseur arcanique)",
  amulette: "Amulette (symbole sacré)", embleme: "Emblème (symbole sacré)", reliquaire: "Reliquaire (symbole sacré)", branche: "Branche d’if (focaliseur druidique)",
  deguisement: "Matériel de déguisement", contrefacon: "Matériel de contrefaçon", empoisonneur: "Matériel d’empoisonneur", forgeron: "Outils de forgeron",
  cartographe: "Outils de cartographe", navigation: "Instruments de navigation", luth: "Luth", flute: "Flûte", tambour: "Tambour",
};
/* effets en jeu, en quelques mots (pour le détail de l’objet) */
const GEAR_D = {
  poison: "Action bonus : enduisez une arme ou jusqu’à trois munitions. Pendant 1 minute, une cible touchée subit 1d4 dégâts de poison en plus.",
  acide: "Action d’attaque : lancez la fiole jusqu’à 6 m. La cible fait un JS de Dextérité (DD 8 + mod. Dex + maîtrise) ou subit 2d6 dégâts d’acide.",
  feugregeois: "Action d’attaque : lancez la flasque jusqu’à 6 m. La cible fait un JS de Dextérité (DD 8 + mod. Dex + maîtrise) ou subit 1d4 dégâts de feu et prend feu.",
  eaubenite: "Action d’attaque : lancez la flasque jusqu’à 6 m. Un fiélon ou un mort-vivant fait un JS de Dextérité (DD 8 + mod. Dex + maîtrise) ou subit 2d8 dégâts radiants.",
  antitoxine: "Action bonus : vous avez l’avantage aux JS contre l’état empoisonné pendant 1 heure.",
  huile: "Action d’attaque : lancez la flasque jusqu’à 6 m, ou versez-la au sol (1,50 m). Si elle s’enflamme, 5 dégâts de feu.",
  chaussetrappes: "Action : couvrez un carré de 1,50 m. Qui y entre fait un JS de Dextérité DD 15 ou subit 1 dégât perforant et voit sa vitesse réduite à 0 jusqu’au début de son prochain tour.",
  billes: "Action : couvrez un carré de 3 m. Qui y entre fait un JS de Dextérité DD 10 ou tombe à terre.",
  torche: "Lumière vive sur 6 m et faible sur 6 m de plus, pendant 1 heure. Peut servir d’arme : 1 dégât de feu.",
  lanterne: "Lumière vive sur 9 m et faible sur 9 m de plus, pendant 6 heures par flasque d’huile.",
  menottes: "Entravent une créature de taille Petite ou Moyenne. S’en libérer : Dextérité (Escamotage) DD 20 ; les briser : Force (Athlétisme) DD 25.",
  filet: "Action d’attaque : une créature à 4,50 m fait un JS de Dextérité (DD 8 + mod. Dex + maîtrise) ou est entravée.",
  piege: "Action : armez-le. Qui marche dessus fait un JS de Dextérité DD 13 ou subit 1d4 dégâts perforants, vitesse 0 jusqu’à ce qu’il se libère.",
  grappin: "Action d’attaque : accrochez-le à 15 m (avec une corde) en réussissant un test de Dextérité (Acrobaties) DD 13.",
};

/* ---------- Espèces ---------- */
const SPECIES = {
  drakeide: {
    n: "Drakéide", size: "Moyenne", speed: 9, dv: 18, tag: "Souffle draconique et résistance élémentaire",
    desc: "Descendants des dragons, les drakéides portent dans le sang la puissance de leurs ancêtres écailleux.",
    choice: { k: "ancestry", label: "Ascendance draconique", opts: {
      noir: { n: "Noir", t: "acide" }, bleu: { n: "Bleu", t: "foudre" }, airain: { n: "Airain", t: "feu" }, bronze: { n: "Bronze", t: "foudre" },
      cuivre: { n: "Cuivre", t: "acide" }, or: { n: "Or", t: "feu" }, vert: { n: "Vert", t: "poison" }, rouge: { n: "Rouge", t: "feu" },
      argent: { n: "Argent", t: "froid" }, blanc: { n: "Blanc", t: "froid" } } },
    traits: [
      { n: "Souffle", d: "Quand vous effectuez l’action d’Attaque, vous pouvez remplacer une attaque par une exhalaison en cône de 4,50 m ou en ligne de 9 m. Chaque créature dans la zone fait un JS de Dextérité (DD 8 + mod. Con + maîtrise) et subit 1d10 dégâts du type de votre ascendance (moitié si réussite). Passe à 2d10 au niveau 5." },
      { n: "Résistance draconique", d: "Vous avez la résistance au type de dégâts de votre ascendance." },
      { n: "Vision dans le noir", d: "Vous voyez dans la pénombre jusqu’à 18 m comme en lumière vive." },
      { n: "Vol draconique (niv. 5)", d: "Par une action bonus, des ailes spectrales vous donnent une vitesse de vol égale à votre vitesse pendant 10 minutes. Une fois par repos long." },
    ],
  },
  nain: {
    n: "Nain", size: "Moyenne", speed: 9, dv: 36, tag: "Robuste, +1 PV par niveau",
    desc: "Façonnés par la roche et la forge, les nains sont endurants et attachés à leurs traditions.",
    traits: [
      { n: "Vision dans le noir", d: "Vous voyez dans la pénombre jusqu’à 36 m." },
      { n: "Résilience naine", d: "Résistance aux dégâts de poison et avantage aux JS pour éviter ou terminer l’état empoisonné." },
      { n: "Ténacité naine", d: "Vos points de vie maximum augmentent de 1 par niveau." },
      { n: "Connaissance de la pierre", d: "Par une action bonus, vous gagnez une perception des vibrations de 18 m pendant 10 minutes, si vous êtes sur une surface de pierre. Utilisations = bonus de maîtrise par repos long." },
    ],
  },
  elfe: {
    n: "Elfe", size: "Moyenne", speed: 9, dv: 18, tag: "Sens aiguisés, magie de lignée",
    desc: "Peuple ancien lié à la magie féerique, l’elfe vit des siècles et voit le monde avec patience.",
    choice: { k: "lineage", label: "Lignée elfique", opts: {
      drow: { n: "Drow", d: "Vision dans le noir portée à 36 m. Tour de magie Lumières dansantes ; Lueurs féeriques au niv. 3 ; Ténèbres au niv. 5.", spells: { 1: ["lumieresdansantes"], 3: ["lueursfeeriques"], 5: ["tenebres"] }, dv: 36 },
      haut: { n: "Haut-elfe", d: "Tour de magie Prestidigitation ; Détection de la magie au niv. 3 ; Foulée brumeuse au niv. 5.", spells: { 1: ["prestidigitation"], 3: ["detectionmagie"], 5: ["fouleebrumeuse"] } },
      sylvestre: { n: "Elfe sylvestre", d: "Vitesse portée à 10,50 m. Tour de magie Druidisme ; Grande foulée au niv. 3 ; Passage sans trace au niv. 5.", spells: { 1: ["druidisme"], 3: ["grandefoulee"], 5: ["passagesanstrace"] }, speed: 10.5 },
    } },
    spellAb: true,
    traits: [
      { n: "Ascendance féerique", d: "Avantage aux JS pour éviter ou terminer l’état charmé." },
      { n: "Sens aiguisés", d: "Maîtrise de Perspicacité, Perception ou Survie (au choix)." },
      { n: "Transe", d: "Un repos long ne vous demande que 4 heures de méditation consciente. On ne peut pas vous endormir par magie." },
    ],
    skillPick: { n: 1, from: ["pspi", "perc", "surv"] },
  },
  gnome: {
    n: "Gnome", size: "Petite", speed: 9, dv: 18, tag: "Ruse gnome, avantage contre la magie mentale",
    desc: "Curieux et inventifs, les gnomes mêlent vivacité d’esprit et goût de la malice.",
    choice: { k: "lineage", label: "Lignée gnome", opts: {
      foret: { n: "Gnome des forêts", d: "Tour de magie Illusion mineure. Vous connaissez Communication avec les animaux, lançable sans emplacement (bonus de maîtrise fois par repos long).", spells: { 1: ["illusionmineure", "comanimaux"] } },
      roches: { n: "Gnome des roches", d: "Tours de magie Réparation et Prestidigitation. Vous pouvez fabriquer de petits mécanismes inoffensifs en 10 minutes.", spells: { 1: ["reparation", "prestidigitation"] } },
    } },
    spellAb: true,
    traits: [
      { n: "Vision dans le noir", d: "Vous voyez dans la pénombre jusqu’à 18 m." },
      { n: "Ruse gnome", d: "Avantage aux JS d’Intelligence, de Sagesse et de Charisme." },
    ],
  },
  goliath: {
    n: "Goliath", size: "Moyenne", speed: 10.5, dv: 0, tag: "Ascendance de géant, carrure puissante",
    desc: "Lointains parents des géants, les goliaths sont grands, forts et attirés par les sommets.",
    choice: { k: "giant", label: "Ascendance de géant", opts: {
      nuages: { n: "Géant des nuages", d: "Par une action bonus, vous vous téléportez jusqu’à 9 m dans un espace que vous voyez." },
      feu: { n: "Géant du feu", d: "Quand vous touchez une cible, vous infligez 1d10 dégâts de feu supplémentaires." },
      givre: { n: "Géant du givre", d: "Quand vous touchez une cible, 1d6 dégâts de froid supplémentaires et sa vitesse baisse de 3 m." },
      collines: { n: "Géant des collines", d: "Quand vous touchez une créature Grande ou plus petite, vous la faites tomber à terre." },
      pierre: { n: "Géant des pierres", d: "En réaction à des dégâts, vous lancez 1d12 + mod. Con et réduisez les dégâts d’autant." },
      tempete: { n: "Géant des tempêtes", d: "En réaction à des dégâts d’une créature à 18 m ou moins, vous lui infligez 1d8 dégâts de tonnerre." },
    } },
    traits: [
      { n: "Ascendance de géant", d: "Le pouvoir de votre ascendance s’utilise un nombre de fois égal à votre bonus de maîtrise par repos long." },
      { n: "Forme imposante (niv. 5)", d: "Par une action bonus, vous devenez de taille Grande pendant 10 minutes : avantage aux tests de Force et +3 m de vitesse. Une fois par repos long." },
      { n: "Carrure puissante", d: "Avantage aux tests pour mettre fin à l’état agrippé. Vous comptez comme une taille de plus pour la charge transportable." },
    ],
  },
  halfelin: {
    n: "Halfelin", size: "Petite", speed: 9, dv: 0, tag: "Chanceux, brave et discret",
    desc: "Petits, chaleureux et étonnamment chanceux, les halfelins se faufilent là où d’autres échouent.",
    traits: [
      { n: "Brave", d: "Avantage aux JS pour éviter ou terminer l’état effrayé." },
      { n: "Agilité halfeline", d: "Vous pouvez traverser l’espace de toute créature d’une taille supérieure à la vôtre." },
      { n: "Chanceux", d: "Quand vous obtenez un 1 sur le d20 d’un test, vous pouvez relancer le dé et devez garder le nouveau résultat." },
      { n: "Discrétion naturelle", d: "Vous pouvez effectuer l’action Se cacher même si seule une créature plus grande que vous vous masque." },
    ],
  },
  humain: {
    n: "Humain", size: "Moyenne ou Petite", speed: 9, dv: 0, tag: "Polyvalent : un don et une compétence en plus",
    desc: "Les plus répandus et les plus variés des peuples, les humains s’adaptent à tout.",
    sizeChoice: true,
    traits: [
      { n: "Ingénieux", d: "Vous gagnez l’Inspiration héroïque à chaque repos long." },
      { n: "Doué", d: "Vous gagnez la maîtrise d’une compétence de votre choix." },
      { n: "Polyvalent", d: "Vous gagnez un don d’origine de votre choix." },
    ],
    skillPick: { n: 1, from: "all" }, bonusFeat: true,
  },
  orc: {
    n: "Orc", size: "Moyenne", speed: 9, dv: 36, tag: "Endurance implacable, poussée d’adrénaline",
    desc: "Bâtis pour l’endurance, les orcs portent la ténacité de leur dieu Gruumsh.",
    traits: [
      { n: "Poussée d’adrénaline", d: "Vous pouvez Foncer par une action bonus et gagnez alors des PV temporaires égaux à votre bonus de maîtrise. Utilisations = bonus de maîtrise par repos court ou long." },
      { n: "Vision dans le noir", d: "Vous voyez dans la pénombre jusqu’à 36 m." },
      { n: "Endurance implacable", d: "Quand vous tombez à 0 PV sans être tué, vous pouvez passer à 1 PV à la place. Une fois par repos long." },
    ],
  },
  tieffelin: {
    n: "Tieffelin", size: "Moyenne ou Petite", speed: 9, dv: 18, tag: "Héritage fiélon et magie innée",
    desc: "Marqués par un lien avec les plans inférieurs, les tieffelins forgent leur propre destin.",
    sizeChoice: true,
    choice: { k: "legacy", label: "Héritage fiélon", opts: {
      abyssal: { n: "Abyssal", d: "Résistance au poison. Tour de magie Bouffée de poison ; Rayon empoisonné au niv. 3 ; Immobilisation de personne au niv. 5.", spells: { 1: ["bouffeepoison"], 3: ["rayonempoisonne"], 5: ["immobilisation"] } },
      chthonien: { n: "Chthonien", d: "Résistance aux dégâts nécrotiques. Tour de magie Contact glacial ; Simulacre de vie au niv. 3 ; Rayon affaiblissant au niv. 5.", spells: { 1: ["contactglacial"], 3: ["simulacredevie"], 5: ["rayonaffaiblissant"] } },
      infernal: { n: "Infernal", d: "Résistance au feu. Tour de magie Trait de feu ; Représailles infernales au niv. 3 ; Ténèbres au niv. 5.", spells: { 1: ["traitdefeu"], 3: ["represailles"], 5: ["tenebres"] } },
    } },
    spellAb: true, extraSpells: ["thaumaturgie"],
    traits: [
      { n: "Vision dans le noir", d: "Vous voyez dans la pénombre jusqu’à 18 m." },
      { n: "Présence d’outre-monde", d: "Vous connaissez le tour de magie Thaumaturgie." },
    ],
  },
};

/* ---------- Dons d’origine ---------- */
const FEATS = {
  vigilant: { n: "Vigilant", d: "Vous ajoutez votre bonus de maîtrise à l’initiative. Après le jet d’initiative, vous pouvez échanger votre résultat avec celui d’un allié consentant." },
  initie: { n: "Initié à la magie", d: "Vous apprenez deux tours de magie et un sort de niveau 1 d’une liste (clerc, druide ou magicien). Vous pouvez lancer ce sort une fois par repos long sans emplacement, ou avec vos emplacements.", magic: true },
  sauvage: { n: "Attaquant sauvage", d: "Une fois par tour, quand vous touchez avec une arme, vous pouvez relancer ses dés de dégâts et garder le résultat de votre choix." },
  doue: { n: "Doué", d: "Vous gagnez la maîtrise de trois compétences de votre choix.", skills: 3 },
  // Don général (niveau 4 et plus, à la place d’une amélioration de caractéristique)
  lutteur: { n: "Lutteur", cat: "general", ab: ["for", "dex"], d: "+1 en Force ou en Dextérité (max 20). Quand vous touchez avec une frappe à mains nues lors de l’action d’Attaque, vous pouvez infliger les dégâts et agripper (une fois par tour). Avantage aux attaques contre une créature que vous agrippez, et la déplacer ne vous coûte pas de mouvement supplémentaire si elle est de votre taille ou plus petite." },
};

/* ---------- Historiques ---------- */
const BACKGROUNDS = {
  acolyte: {
    n: "Acolyte", ab: ["int", "sag", "cha"], feat: "initie", featList: "clr", skills: ["pspi", "reli"], tool: "Matériel de calligraphe",
    desc: "Vous avez servi dans un temple, appris les rites et les prières de votre foi.",
    gear: [["calli"], ["livreprieres"], ["symbole"], ["parchemin", 10], ["robe"]], gold: 8,
  },
  criminel: {
    n: "Criminel", ab: ["dex", "con", "int"], feat: "vigilant", skills: ["esca", "disc"], tool: "Outils de voleur",
    desc: "Vous avez gagné votre vie dans les ruelles, entre larcins et affaires louches.",
    gear: [["w:dague", 2], ["voleur"], ["pied"], ["bourse", 2], ["vetvoyage"]], gold: 16,
  },
  sage: {
    n: "Sage", ab: ["con", "int", "sag"], feat: "initie", featList: "mag", skills: ["arca", "hist"], tool: "Matériel de calligraphe",
    desc: "Vous avez passé des années à étudier dans des bibliothèques et auprès de maîtres.",
    gear: [["w:baton"], ["calli"], ["livrehist"], ["parchemin", 8], ["robe"]], gold: 8,
  },
  soldat: {
    n: "Soldat", ab: ["for", "dex", "con"], feat: "sauvage", skills: ["athl", "inti"], tool: "Jeu (au choix)",
    desc: "Vous avez été formé au combat et avez servi dans une armée ou une milice.",
    gear: [["w:lance"], ["w:arccourt"], ["fleches"], ["jeu"], ["soins"], ["carquois"], ["vetvoyage"]], gold: 14,
  },
};

/* ---------- Classes ---------- */
// caster : full | half | pact ; prep : sorts préparés par niveau 1..5 ; cant : tours de magie par niveau
const FULL_SLOTS = [[2], [3], [4, 2], [4, 3], [4, 3, 2]];
const HALF_SLOTS = [[2], [2], [3], [3], [4, 2]];
const PACT_SLOTS = [[1, 1], [2, 1], [2, 2], [2, 2], [2, 3]]; // [nombre, niveau]

const FIGHTING_STYLES = {
  archerie: { n: "Archerie", d: "+2 aux jets d’attaque avec les armes à distance." },
  defense: { n: "Défense", d: "+1 à la CA quand vous portez une armure légère, intermédiaire ou lourde." },
  armesdeuxmains: { n: "Armes à deux mains", d: "Avec une arme à deux mains ou polyvalente tenue à deux mains, un 1 ou un 2 sur un dé de dégâts compte comme un 3." },
  deuxarmes: { n: "Combat à deux armes", d: "Vous ajoutez votre modificateur de caractéristique aux dégâts de l’attaque supplémentaire d’une arme légère." },
};
const INVOCATIONS = {
  armureombres: { n: "Armure des ombres", lv: 1, d: "Vous pouvez lancer Armure de mage sur vous-même sans emplacement." },
  espritocculte: { n: "Esprit occulte", lv: 1, d: "Avantage aux JS de Constitution pour maintenir la concentration." },
  pactelame: { n: "Pacte de la lame", lv: 1, d: "Par une action bonus, vous invoquez une arme de pacte. Vous l’utilisez avec votre Charisme et pouvez infliger des dégâts nécrotiques, psychiques ou radiants." },
  pactechaine: { n: "Pacte de la chaîne", lv: 1, d: "Vous apprenez Appel de familier et pouvez le lancer comme un rituel. Votre familier peut prendre des formes spéciales (diablotin, pseudodragon, quasit…)." },
  pactetome: { n: "Pacte du tome", lv: 1, d: "Un Livre des ombres vous donne trois tours de magie et deux sorts rituels de niveau 1 de n’importe quelle classe." },
  dechiree: { n: "Décharge déchirante", lv: 2, d: "Ajoutez votre mod. de Charisme aux dégâts d’un tour de magie d’occultiste qui inflige des dégâts (ex. Décharge occulte)." },
  repoussante: { n: "Décharge repoussante", lv: 2, d: "Quand votre tour de magie d’attaque touche, vous pouvez repousser la cible de 3 m." },
  visiondiable: { n: "Vision du diable", lv: 2, d: "Vous voyez normalement dans les ténèbres, magiques ou non, jusqu’à 36 m." },
  vigueur: { n: "Vigueur fiélonne", lv: 2, d: "Vous pouvez lancer Simulacre de vie sur vous-même sans emplacement ; vous obtenez le maximum de PV temporaires." },
  masque: { n: "Masque aux mille visages", lv: 2, d: "Vous pouvez lancer Déguisement à volonté, sans emplacement." },
  lanceocculte: { n: "Lance occulte", lv: 2, d: "La portée d’un tour de magie d’occultiste qui inflige des dégâts augmente de 9 m × votre niveau d’occultiste." },
};
const METAMAGIC = {
  prudent: { n: "Sort prudent", d: "1 point : des créatures de votre choix réussissent automatiquement leur JS contre votre sort." },
  distant: { n: "Sort distant", d: "1 point : double la portée du sort (ou 9 m pour un sort de contact)." },
  renforce: { n: "Sort renforcé", d: "1 point : relancez jusqu’à votre mod. de Charisme dés de dégâts." },
  etendu: { n: "Sort étendu", d: "1 point : double la durée du sort et avantage aux JS de concentration." },
  intensifie: { n: "Sort intensifié", d: "2 points : une cible a le désavantage à son JS contre le sort." },
  rapide: { n: "Sort rapide", d: "2 points : un sort d’une action se lance en action bonus." },
  cherchant: { n: "Sort cherchant", d: "1 point : relancez le d20 d’une attaque de sort ratée." },
  subtil: { n: "Sort subtil", d: "1 point : lancez le sort sans composantes verbales, somatiques ni matérielles non consommées." },
  transmute: { n: "Sort transmuté", d: "1 point : changez le type de dégâts (acide, froid, feu, foudre, poison, tonnerre)." },
  jumeau: { n: "Sort jumeau", d: "1 point : un sort qui pourrait viser une créature supplémentaire en lançant à un niveau supérieur gagne ce bonus." },
};

const CLASSES = {
  barbare: {
    n: "Barbare", hd: 12, prim: ["for"], saves: ["for", "con"], diff: 1,
    tag: "Combattant en première ligne, porté par une rage primitive.",
    skills: { n: 2, from: ["dres", "athl", "inti", "natu", "perc", "surv"] },
    armor: ["legere", "inter", "bouclier"], weapons: ["simple", "guerre"], tools: "—", mastery: 2,
    sub: { n: "Voie du Berserker", d: "Une fureur sans retenue qui transforme chaque coup en déchaînement." },
    gearA: [["w:hachea2mains"], ["w:hachette", 4], ["sacexplo"]], goldA: 15, goldB: 75,
    feats: {
      1: [["Rage", "Par une action bonus, vous entrez en rage pendant 10 minutes (sans armure lourde) : résistance aux dégâts contondants, perforants et tranchants, +2 aux dégâts des attaques de Force, avantage aux tests et JS de Force. Vous ne pouvez ni lancer ni maintenir de sorts."],
          ["Défense sans armure", "Sans armure, votre CA est égale à 10 + mod. Dex + mod. Con. Vous pouvez utiliser un bouclier."],
          ["Maîtrise d’arme", "Vous utilisez la propriété de maîtrise de deux types d’armes de corps à corps."]],
      2: [["Sens du danger", "Avantage aux JS de Dextérité, sauf si vous êtes neutralisé."],
          ["Attaque téméraire", "Lors de votre première attaque du tour, vous pouvez avoir l’avantage à vos attaques de Force ce tour-ci ; les attaques contre vous ont l’avantage jusqu’à votre prochain tour."]],
      3: [["Savoir primitif", "Vous gagnez une compétence de barbare supplémentaire. En rage, vous pouvez utiliser la Force pour certains tests (Acrobaties, Discrétion, Intimidation, Perception, Survie)."],
          ["Frénésie (Berserker)", "Si vous utilisez l’Attaque téméraire en rage, la première cible touchée subit des dégâts supplémentaires : autant de d6 que votre bonus de dégâts de rage."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Attaque supplémentaire", "Vous attaquez deux fois quand vous effectuez l’action d’Attaque."],
          ["Déplacement rapide", "Votre vitesse augmente de 3 m sans armure lourde."]],
    },
  },
  barde: {
    n: "Barde", hd: 8, prim: ["cha"], saves: ["dex", "cha"], diff: 2,
    tag: "Magicien des mots et de la musique, soutien polyvalent.",
    skills: { n: 3, from: "all" },
    armor: ["legere"], weapons: ["simple"], tools: "Trois instruments de musique", mastery: 0,
    caster: "full", sab: "cha", cant: [2, 2, 2, 3, 3], prep: [4, 5, 6, 7, 9],
    sub: { n: "Collège du Savoir", d: "Des bardes érudits qui collectionnent les secrets et les mots qui blessent." },
    gearA: [["a:cuir"], ["w:dague", 2], ["instrument"], ["sacartiste"]], goldA: 19, goldB: 90,
    feats: {
      1: [["Inspiration bardique", "Par une action bonus, une créature à 18 m reçoit un dé d’inspiration (d6) qu’elle peut ajouter à un test raté dans l’heure. Utilisations = mod. Cha (min. 1) par repos long."],
          ["Incantation", "Vous lancez des sorts de barde avec le Charisme. Un instrument peut vous servir de focaliseur."]],
      2: [["Expertise", "Votre bonus de maîtrise est doublé pour deux compétences maîtrisées."],
          ["Touche-à-tout", "Vous ajoutez la moitié de votre bonus de maîtrise aux tests de compétences que vous ne maîtrisez pas."]],
      3: [["Maîtrises supplémentaires (Savoir)", "Vous gagnez la maîtrise de trois compétences de votre choix."],
          ["Mots cinglants (Savoir)", "En réaction, vous dépensez une Inspiration bardique pour soustraire le dé à l’attaque, au test ou aux dégâts d’une créature à 18 m."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Source d’inspiration", "Vous récupérez vos Inspirations bardiques lors d’un repos court. Votre dé passe au d8."]],
    },
  },
  clerc: {
    n: "Clerc", hd: 8, prim: ["sag"], saves: ["sag", "cha"], diff: 2,
    tag: "Champion d’un dieu, soigneur et combattant sacré.",
    skills: { n: 2, from: ["hist", "pspi", "mede", "psua", "reli"] },
    armor: ["legere", "inter", "bouclier"], weapons: ["simple"], tools: "—", mastery: 0,
    caster: "full", sab: "sag", cant: [3, 3, 3, 4, 4], prep: [4, 5, 6, 7, 9],
    sub: { n: "Domaine de la Vie", d: "La puissance divine qui guérit les blessures et repousse la mort.", spells: { 3: ["aide", "benediction", "soins", "restaurationpartielle"], 5: ["motguerisongroupe", "retouralavie"] } },
    gearA: [["a:chemise"], ["a:bouclier"], ["w:masse"], ["symbole"], ["sacpretre"]], goldA: 7, goldB: 110,
    feats: {
      1: [["Incantation", "Vous lancez des sorts de clerc avec la Sagesse. Un symbole sacré vous sert de focaliseur."],
          ["Ordre divin", "Protecteur (armes de guerre et armures lourdes) ou Thaumaturge (un tour de magie de plus, + mod. Sag aux tests d’Arcanes et de Religion)."]],
      2: [["Conduit divin", "Deux utilisations (une récupérée au repos court, toutes au repos long). Étincelle divine : soigne ou blesse (1d8 + mod. Sag) une créature à 9 m. Renvoi des morts-vivants : les morts-vivants à 9 m font un JS de Sagesse ou sont effrayés."]],
      3: [["Disciple de la vie", "Vos sorts de soins rendent 2 + le niveau de l’emplacement PV supplémentaires."],
          ["Préservation de la vie", "Conduit divin : répartissez 5 × votre niveau de clerc en PV entre des créatures à 9 m (jusqu’à la moitié de leurs PV max)."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Incinération des morts-vivants", "Quand vous Renvoyez les morts-vivants, ceux qui échouent subissent aussi des dégâts radiants (autant de d8 que votre mod. Sag)."]],
    },
  },
  druide: {
    n: "Druide", hd: 8, prim: ["sag"], saves: ["int", "sag"], diff: 3,
    tag: "Gardien de la nature qui change de forme.",
    skills: { n: 2, from: ["arca", "dres", "pspi", "mede", "natu", "perc", "reli", "surv"] },
    armor: ["legere", "bouclier"], weapons: ["simple"], tools: "Matériel d’herboriste", mastery: 0,
    caster: "full", sab: "sag", cant: [2, 2, 2, 3, 3], prep: [4, 5, 6, 7, 9],
    sub: { n: "Cercle de la Terre", d: "Des druides liés à un territoire, dont ils tirent leurs sorts." },
    gearA: [["a:cuir"], ["a:bouclier"], ["w:serpe"], ["focaldruid"], ["sacexplo"], ["herbo"]], goldA: 9, goldB: 50,
    feats: {
      1: [["Incantation", "Vous lancez des sorts de druide avec la Sagesse."],
          ["Druidique", "Vous connaissez la langue secrète des druides et le sort Communication avec les animaux est toujours préparé."],
          ["Ordre primitif", "Magicien (un tour de magie de plus, + mod. Sag aux tests d’Arcanes et de Nature) ou Gardien (armes de guerre et armures intermédiaires)."]],
      2: [["Forme sauvage", "Par une action bonus, vous prenez la forme d’une bête connue (FP 1/4, sans vol). Deux utilisations (une récupérée au repos court, toutes au repos long)."],
          ["Compagnon sauvage", "Vous pouvez dépenser une Forme sauvage pour lancer Appel de familier sans composante matérielle."]],
      3: [["Sorts du cercle", "Selon votre terre (aride, polaire, tempérée, tropicale), certains sorts sont toujours préparés."],
          ["Aide de la terre", "Dépensez une Forme sauvage : une sphère de 3 m à 18 m inflige 2d6 dégâts nécrotiques (JS Con) et soigne une créature de 2d6 PV."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Renouveau sauvage", "Sans Forme sauvage, vous pouvez dépenser un emplacement pour en récupérer une, ou une Forme sauvage pour un emplacement de niveau 1 (une fois par repos long)."]],
    },
  },
  guerrier: {
    n: "Guerrier", hd: 10, prim: ["for", "dex"], saves: ["for", "con"], diff: 1,
    tag: "Maître des armes et des armures, solide et fiable.",
    skills: { n: 2, from: ["acro", "dres", "athl", "hist", "pspi", "inti", "perc", "psua", "surv"] },
    armor: ["legere", "inter", "lourde", "bouclier"], weapons: ["simple", "guerre"], tools: "—", mastery: 3,
    sub: { n: "Champion", d: "Un athlète martial qui cherche la perfection physique." },
    gearA: [["a:cottemailles"], ["w:epeea2mains"], ["w:fleau"], ["w:javeline", 8], ["sacexplor"]], goldA: 4,
    gearB: [["a:cuirclout"], ["w:cimeterre"], ["w:epeecourte"], ["w:arclong"], ["fleches"], ["carquois"], ["sacexplor"]], goldBg: 11, goldB: 155,
    feats: {
      1: [["Style de combat", "Vous choisissez un style de combat."],
          ["Second souffle", "Par une action bonus, vous regagnez 1d10 + votre niveau de guerrier PV. Utilisations récupérées : une au repos court, toutes au repos long."],
          ["Maîtrise d’arme", "Vous utilisez la propriété de maîtrise de trois types d’armes."]],
      2: [["Fougue", "Une fois par repos, vous effectuez une action supplémentaire à votre tour."],
          ["Esprit tactique", "Quand un test de caractéristique échoue, dépensez un Second souffle pour ajouter 1d10 au résultat (rien n’est dépensé si l’échec persiste)."]],
      3: [["Critique amélioré (Champion)", "Vos attaques avec arme et à mains nues sont critiques sur 19 ou 20."],
          ["Athlète remarquable (Champion)", "Avantage à l’initiative et aux tests de Force (Athlétisme). Après un critique, vous vous déplacez de la moitié de votre vitesse sans provoquer d’attaque d’opportunité."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Attaque supplémentaire", "Vous attaquez deux fois quand vous effectuez l’action d’Attaque."],
          ["Repositionnement tactique", "Quand vous utilisez Second souffle, vous pouvez vous déplacer de la moitié de votre vitesse sans provoquer d’attaque d’opportunité."]],
    },
  },
  moine: {
    n: "Moine", hd: 8, prim: ["dex", "sag"], saves: ["for", "dex"], diff: 2,
    tag: "Artiste martial rapide, qui canalise son énergie intérieure.",
    skills: { n: 2, from: ["acro", "athl", "hist", "pspi", "reli", "disc"] },
    armor: [], weapons: ["simple", "guerreLegere"], tools: "Un outil d’artisan ou un instrument", mastery: 0,
    sub: { n: "Voie de la Main ouverte", d: "Des maîtres du combat à mains nues qui déséquilibrent leurs adversaires." },
    gearA: [["w:lance"], ["w:dague", 5], ["outilartisan"], ["sacexplo"]], goldA: 11, goldB: 50,
    feats: {
      1: [["Arts martiaux", "Sans armure ni bouclier, avec une arme de moine ou à mains nues : vous pouvez utiliser la Dex, votre dé d’arts martiaux (d6, d8 au niv. 5) remplace les dégâts de l’arme s’il est supérieur, et vous pouvez frapper à mains nues par une action bonus."],
          ["Défense sans armure", "Sans armure ni bouclier, votre CA est égale à 10 + mod. Dex + mod. Sag."]],
      2: [["Focalisation du moine", "Points de focalisation = niveau de moine (repos court). Déluge de coups (1 pt : deux frappes à mains nues en action bonus), Défense patiente (Désengagement gratuit, ou Esquive pour 1 pt), Pas du vent (Foncer gratuit, ou les deux + saut doublé pour 1 pt)."],
          ["Déplacement sans armure", "Votre vitesse augmente de 3 m sans armure ni bouclier."],
          ["Métabolisme extraordinaire", "À l’initiative, vous pouvez récupérer tous vos points de focalisation et des PV (dé d’arts martiaux + niveau). Une fois par repos long."]],
      3: [["Parade des attaques", "En réaction à une attaque qui vous touche, réduisez les dégâts de 1d10 + mod. Dex + niveau. À 0 dégât, vous pouvez renvoyer l’attaque pour 1 point."],
          ["Technique de la main ouverte", "Quand vous touchez avec le Déluge de coups, vous pouvez : empêcher les réactions de la cible, la repousser de 4,50 m (JS For) ou la faire tomber à terre (JS Dex)."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."],
          ["Chute ralentie", "En réaction à une chute, réduisez les dégâts de 5 × votre niveau de moine."]],
      5: [["Attaque supplémentaire", "Vous attaquez deux fois quand vous effectuez l’action d’Attaque."],
          ["Frappe étourdissante", "Une fois par tour, quand vous touchez, dépensez 1 point : la cible fait un JS de Constitution ou est étourdie jusqu’au début de votre prochain tour."]],
    },
  },
  paladin: {
    n: "Paladin", hd: 10, prim: ["for", "cha"], saves: ["sag", "cha"], diff: 2,
    tag: "Guerrier sacré lié par un serment, mêlant armes et miracles.",
    skills: { n: 2, from: ["athl", "pspi", "inti", "mede", "psua", "reli"] },
    armor: ["legere", "inter", "lourde", "bouclier"], weapons: ["simple", "guerre"], tools: "—", mastery: 2,
    caster: "half", sab: "cha", cant: [0, 0, 0, 0, 0], prep: [2, 3, 4, 5, 6],
    always: { 2: ["chatimentdivin"] },
    sub: { n: "Serment de dévotion", d: "L’idéal du chevalier : honnêteté, courage et compassion.", spells: { 3: ["protectionmal", "bouclierfoi"], 5: ["aide", "zoneverite"] } },
    gearA: [["a:cottemailles"], ["a:bouclier"], ["w:epeelongue"], ["w:javeline", 6], ["symbole"], ["sacpretre"]], goldA: 9, goldB: 150,
    feats: {
      1: [["Imposition des mains", "Réserve de PV égale à 5 × votre niveau (repos long). Par une action bonus, touchez une créature pour lui rendre des PV de la réserve, ou dépensez 5 PV pour la guérir de l’état empoisonné."],
          ["Incantation", "Vous lancez des sorts de paladin avec le Charisme."],
          ["Maîtrise d’arme", "Vous utilisez la propriété de maîtrise de deux types d’armes."]],
      2: [["Style de combat", "Vous choisissez un style de combat."],
          ["Châtiment du paladin", "Châtiment divin est toujours préparé, et vous pouvez le lancer une fois par repos long sans emplacement."]],
      3: [["Conduit divin", "Deux utilisations (une au repos court, toutes au repos long). Sens divin : par une action bonus, vous détectez célestes, fiélons et morts-vivants à 18 m pendant 10 minutes."],
          ["Arme sacrée (Dévotion)", "Conduit divin : pendant 10 minutes, ajoutez votre mod. Cha aux jets d’attaque d’une arme, qui émet de la lumière et peut infliger des dégâts radiants."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Attaque supplémentaire", "Vous attaquez deux fois quand vous effectuez l’action d’Attaque."],
          ["Destrier fidèle", "Appel de destrier est toujours préparé ; vous pouvez le lancer une fois par repos long sans emplacement."]],
    },
  },
  rodeur: {
    n: "Rôdeur", hd: 10, prim: ["dex", "sag"], saves: ["for", "dex"], diff: 2,
    tag: "Chasseur des terres sauvages, archer et pisteur.",
    skills: { n: 3, from: ["dres", "athl", "pspi", "inve", "natu", "perc", "disc", "surv"] },
    armor: ["legere", "inter", "bouclier"], weapons: ["simple", "guerre"], tools: "—", mastery: 2,
    caster: "half", sab: "sag", cant: [0, 0, 0, 0, 0], prep: [2, 3, 4, 5, 6],
    always: { 1: ["marquechasseur"] },
    sub: { n: "Chasseur", d: "Un traqueur qui protège la civilisation des menaces les plus terribles." },
    gearA: [["a:cuirclout"], ["w:cimeterre"], ["w:epeecourte"], ["w:arclong"], ["fleches"], ["carquois"], ["focaldruid"], ["sacexplo"]], goldA: 7, goldB: 150,
    feats: {
      1: [["Incantation", "Vous lancez des sorts de rôdeur avec la Sagesse."],
          ["Ennemi juré", "Marque du chasseur est toujours préparée. Vous pouvez la lancer deux fois par repos long sans emplacement (trois au niv. 5)."],
          ["Maîtrise d’arme", "Vous utilisez la propriété de maîtrise de deux types d’armes."]],
      2: [["Explorateur adroit", "Expertise dans une compétence maîtrisée et deux langues supplémentaires."],
          ["Style de combat", "Vous choisissez un style de combat."]],
      3: [["Savoir du chasseur", "Tant qu’une créature est marquée par votre Marque du chasseur, vous connaissez ses immunités, résistances et vulnérabilités."],
          ["Proie du chasseur", "Tueur de colosses (1d8 de plus une fois par tour contre une cible blessée) ou Briseur de hordes (une attaque de plus contre une autre créature à 1,50 m de la première)."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Attaque supplémentaire", "Vous attaquez deux fois quand vous effectuez l’action d’Attaque."]],
    },
  },
  roublard: {
    n: "Roublard", hd: 8, prim: ["dex"], saves: ["dex", "int"], diff: 1,
    tag: "Expert discret qui frappe là où ça fait mal.",
    skills: { n: 4, from: ["acro", "athl", "trom", "pspi", "inti", "inve", "perc", "psua", "esca", "disc"] },
    armor: ["legere"], weapons: ["simple", "guerreFinesse"], tools: "Outils de voleur", mastery: 2,
    sub: { n: "Voleur", d: "Un cambrioleur agile, rapide des mains et à l’aise sur les toits." },
    gearA: [["a:cuir"], ["w:dague", 2], ["w:epeecourte"], ["w:arccourt"], ["fleches"], ["carquois"], ["voleur"], ["saccambrio"]], goldA: 8, goldB: 100,
    feats: {
      1: [["Expertise", "Votre bonus de maîtrise est doublé pour deux compétences maîtrisées."],
          ["Attaque sournoise", "Une fois par tour, +1d6 dégâts (augmente aux niveaux impairs) avec une arme de finesse ou à distance si vous avez l’avantage, ou si un allié est à 1,50 m de la cible."],
          ["Argot des voleurs", "Vous connaissez l’argot des voleurs et une langue supplémentaire."],
          ["Maîtrise d’arme", "Vous utilisez la propriété de maîtrise de deux types d’armes."]],
      2: [["Ruse", "Par une action bonus : Foncer, Se désengager ou Se cacher."]],
      3: [["Visée stable", "Par une action bonus, si vous ne vous êtes pas déplacé, vous avez l’avantage à votre prochaine attaque ce tour-ci (vitesse 0 jusqu’à la fin du tour)."],
          ["Mains lestes (Voleur)", "L’action bonus de Ruse permet aussi un test d’Escamotage, d’utiliser des outils de voleur ou d’Utiliser un objet."],
          ["Monte-en-l’air (Voleur)", "Vous gagnez une vitesse d’escalade égale à votre vitesse ; vos sauts utilisent la Dextérité."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Frappe rusée", "Renoncez à des dés d’attaque sournoise pour des effets : Empoisonner (1d6), Faire trébucher (1d6), Se retirer (1d6)."],
          ["Esquive instinctive", "En réaction, divisez par deux les dégâts d’une attaque que vous voyez."]],
    },
  },
  ensorceleur: {
    n: "Ensorceleur", hd: 6, prim: ["cha"], saves: ["con", "cha"], diff: 3,
    tag: "Magie innée dans le sang, qu’il plie à sa volonté.",
    skills: { n: 2, from: ["arca", "trom", "pspi", "inti", "psua", "reli"] },
    armor: [], weapons: ["simple"], tools: "—", mastery: 0,
    caster: "full", sab: "cha", cant: [4, 4, 4, 5, 5], prep: [2, 4, 6, 7, 9],
    sub: { n: "Sorcellerie draconique", d: "Le souffle des dragons coule dans vos veines.", spells: { 3: ["alteration", "injonction"], 5: ["terreur", "vol"] } },
    gearA: [["w:lance"], ["w:dague", 2], ["focalarc"], ["sacexplor"]], goldA: 28, goldB: 50,
    feats: {
      1: [["Incantation", "Vous lancez des sorts d’ensorceleur avec le Charisme."],
          ["Sorcellerie innée", "Par une action bonus, pendant 1 minute : +1 au DD de vos sorts d’ensorceleur et avantage à vos attaques de sorts. Deux fois par repos long."]],
      2: [["Source de magie", "Points de sorcellerie = niveau d’ensorceleur (repos long). Convertissez-les en emplacements ou l’inverse."],
          ["Métamagie", "Vous choisissez deux options de Métamagie."]],
      3: [["Résilience draconique", "Vos PV max augmentent de 3 puis de 1 par niveau suivant. Sans armure, votre CA est égale à 10 + mod. Dex + mod. Cha."],
          ["Sorts draconiques", "Certains sorts sont toujours préparés."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Restauration ensorcelante", "Lors d’un repos court, récupérez des points de sorcellerie jusqu’à la moitié de votre niveau (une fois par repos long)."]],
    },
  },
  occultiste: {
    n: "Occultiste", hd: 8, prim: ["cha"], saves: ["sag", "cha"], diff: 3,
    tag: "Lié par un pacte à une entité, avec une magie qui revient au repos court.",
    skills: { n: 2, from: ["arca", "trom", "hist", "inti", "inve", "natu", "reli"] },
    armor: ["legere"], weapons: ["simple"], tools: "—", mastery: 0,
    caster: "pact", sab: "cha", cant: [2, 2, 2, 3, 3], prep: [2, 3, 4, 5, 6], inv: [1, 3, 3, 3, 5],
    sub: { n: "Protecteur fiélon", d: "Un pacte avec un diable ou un démon, source de flammes et de résilience.", spells: { 3: ["mainsbrulantes", "injonction", "rayonardent", "suggestion"], 5: ["bouledefeu", "nuagepuant"] } },
    gearA: [["a:cuir"], ["w:serpe"], ["w:dague", 2], ["orbe"], ["livreocc"], ["sacerudit"]], goldA: 15, goldB: 100,
    feats: {
      1: [["Manifestations occultes", "Vous choisissez des manifestations, des dons mystiques de votre protecteur."],
          ["Magie de pacte", "Vous lancez des sorts d’occultiste avec le Charisme. Vos emplacements sont peu nombreux mais toujours du niveau maximal et reviennent au repos court."]],
      2: [["Astuce magique", "Par un rite d’une minute, vous récupérez jusqu’à la moitié (arrondie au supérieur) de vos emplacements de pacte. Une fois par repos long."]],
      3: [["Bénédiction du ténébreux (Fiélon)", "Quand une créature ennemie tombe à 0 PV près de vous (3 m) ou par vos soins, vous gagnez des PV temporaires égaux à mod. Cha + niveau d’occultiste."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Manifestations supplémentaires", "Vous connaissez désormais cinq manifestations."]],
    },
  },
  magicien: {
    n: "Magicien", hd: 6, prim: ["int"], saves: ["int", "sag"], diff: 3,
    tag: "Érudit des arcanes au grimoire bien rempli.",
    skills: { n: 2, from: ["arca", "hist", "pspi", "inve", "mede", "natu", "reli"] },
    armor: [], weapons: ["simple"], tools: "—", mastery: 0,
    caster: "full", sab: "int", cant: [3, 3, 3, 4, 4], prep: [4, 5, 6, 7, 9],
    sub: { n: "Évocateur", d: "Spécialiste des énergies destructrices : feu, foudre, froid." },
    gearA: [["w:dague", 2], ["w:baton"], ["robe"], ["grimoire"], ["sacerudit"]], goldA: 5, goldB: 55,
    feats: {
      1: [["Incantation", "Vous lancez des sorts de magicien avec l’Intelligence. Votre grimoire contient six sorts de niveau 1 et en gagne deux par niveau."],
          ["Adepte rituel", "Vous pouvez lancer comme rituel tout sort rituel de votre grimoire, même non préparé."],
          ["Restauration arcanique", "Lors d’un repos court, récupérez des emplacements dont le total des niveaux ne dépasse pas la moitié de votre niveau (arrondie au supérieur). Une fois par repos long."]],
      2: [["Érudit", "Expertise dans une compétence parmi Arcanes, Histoire, Investigation, Médecine, Nature ou Religion."]],
      3: [["Savant en évocation", "Vous ajoutez gratuitement deux sorts d’évocation à votre grimoire, puis un à chaque niveau d’emplacement débloqué."],
          ["Tour de magie puissant", "Vos tours de magie à jet de sauvegarde infligent la moitié des dégâts en cas de réussite."]],
      4: [["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."]],
      5: [["Mémorisation de sort", "Lors d’un repos court, vous pouvez échanger un sort préparé contre un autre sort de votre grimoire."]],
    },
  },
};

const LAND_SPELLS = {
  aride: { n: "Aride", s: { 3: ["flou", "mainsbrulantes", "traitdefeu"], 5: ["bouledefeu"] } },
  polaire: { n: "Polaire", s: { 3: ["nappebrouillard", "immobilisation", "rayondegivre"], 5: ["tempeteneige"] } },
  temperee: { n: "Tempérée", s: { 3: ["fouleebrumeuse", "poigneelectrique", "sommeil"], 5: ["eclair"] } },
  tropicale: { n: "Tropicale", s: { 3: ["aspersionacide", "rayonempoisonne", "toile"], 5: ["nuagepuant"] } },
};

/* ---------- Sorts ----------
 l: niveau, e: école, t: temps, p: portée, c: composantes, du: durée, co: concentration, ri: rituel,
 cl: classes, d: description, atk: "dist"|"cac", sv: caractéristique de JS, dmg: dégâts, ty: type, heal: soin, sc: tour qui progresse */
const SC = { abj: "Abjuration", div: "Divination", enc: "Enchantement", evo: "Évocation", ill: "Illusion", inv: "Invocation", nec: "Nécromancie", tra: "Transmutation" };
const A = "1 action", AB_ = "1 action bonus", RE = "1 réaction";
const SPELLS = {
  // Tours de magie
  aspersionacide: { n: "Aspersion acide", l: 0, e: "evo", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], sv: "dex", dmg: "1d6", ty: "acide", sc: 1, d: "Une bulle d’acide éclate en sphère de 1,50 m. Chaque créature dans la zone réussit un JS de Dextérité ou subit 1d6 dégâts d’acide." },
  contactglacial: { n: "Contact glacial", l: 0, e: "nec", t: A, p: "Contact", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "occultiste", "magicien"], atk: "cac", dmg: "1d10", ty: "necro", sc: 1, d: "Attaque de sort au corps à corps : 1d10 dégâts nécrotiques, et la cible ne peut pas regagner de PV jusqu’à la fin de votre prochain tour." },
  lumieresdansantes: { n: "Lumières dansantes", l: 0, e: "ill", t: A, p: "36 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "ensorceleur", "magicien"], d: "Jusqu’à quatre lumières de la taille d’une torche flottent et éclairent dans un rayon de 3 m. Vous les déplacez de 18 m par une action bonus." },
  druidisme: { n: "Druidisme", l: 0, e: "tra", t: A, p: "9 m", c: "V, S", du: "Instantanée", cl: ["druide"], d: "Petits effets naturels : prédire la météo, faire éclore une fleur, produire un effet sensoriel inoffensif ou allumer/éteindre une petite flamme." },
  dechargeocculte: { n: "Décharge occulte", l: 0, e: "evo", t: A, p: "36 m", c: "V, S", du: "Instantanée", cl: ["occultiste"], atk: "dist", dmg: "1d10", ty: "force", beams: true, d: "Un rayon d’énergie crépitante : attaque de sort à distance, 1d10 dégâts de force. Deux rayons au niveau 5 (attaques séparées)." },
  traitdefeu: { n: "Trait de feu", l: 0, e: "evo", t: A, p: "36 m", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], atk: "dist", dmg: "1d10", ty: "feu", sc: 1, d: "Attaque de sort à distance : 1d10 dégâts de feu. Un objet inflammable touché prend feu s’il n’est ni porté ni tenu." },
  assistance: { n: "Assistance", l: 0, e: "div", t: A, p: "Contact", c: "V, S", du: "1 minute", co: true, cl: ["clerc", "druide"], d: "Choisissez une compétence : la créature touchée ajoute 1d4 à tous ses tests de cette compétence pendant la durée." },
  lumiere: { n: "Lumière", l: 0, e: "evo", t: A, p: "Contact", c: "V, M", du: "1 heure", cl: ["barde", "clerc", "ensorceleur", "magicien"], d: "Un objet émet une lumière vive sur 6 m et faible sur 6 m de plus." },
  maindemage: { n: "Main de mage", l: 0, e: "inv", t: A, p: "9 m", c: "V, S", du: "1 minute", cl: ["barde", "ensorceleur", "occultiste", "magicien"], d: "Une main spectrale manipule un objet de 5 kg maximum, ouvre une porte ou un contenant. Elle ne peut pas attaquer." },
  reparation: { n: "Réparation", l: 0, e: "tra", t: "1 minute", p: "Contact", c: "V, S, M", du: "Instantanée", cl: ["barde", "clerc", "druide", "ensorceleur", "magicien"], d: "Répare une seule cassure ou déchirure d’un objet (maillon brisé, clé cassée, accroc)." },
  message: { n: "Message", l: 0, e: "tra", t: A, p: "36 m", c: "S, M", du: "1 round", cl: ["barde", "druide", "ensorceleur", "magicien"], d: "Vous chuchotez un message qu’une créature est seule à entendre ; elle peut répondre de la même façon." },
  illusionmineure: { n: "Illusion mineure", l: 0, e: "ill", t: A, p: "9 m", c: "S, M", du: "1 minute", cl: ["barde", "ensorceleur", "occultiste", "magicien"], d: "Vous créez un son ou une image immobile d’un cube de 1,50 m. Une Investigation réussie contre votre DD révèle l’illusion." },
  bouffeepoison: { n: "Bouffée de poison", l: 0, e: "nec", t: A, p: "9 m", c: "V, S", du: "Instantanée", cl: ["druide", "ensorceleur", "occultiste", "magicien"], atk: "dist", dmg: "1d12", ty: "poison", sc: 1, d: "Attaque de sort à distance : 1d12 dégâts de poison." },
  prestidigitation: { n: "Prestidigitation", l: 0, e: "tra", t: A, p: "3 m", c: "V, S", du: "1 heure", cl: ["barde", "ensorceleur", "occultiste", "magicien"], d: "Petits tours de magie : effet sensoriel, allumer une bougie, nettoyer un objet, réchauffer ou parfumer, faire apparaître un petit symbole." },
  flammes: { n: "Flammes", l: 0, e: "inv", t: AB_, p: "Personnelle", c: "V, S", du: "10 minutes", cl: ["druide"], atk: "dist", dmg: "1d8", ty: "feu", sc: 1, d: "Une flamme dans votre main éclaire sur 6 m. Par une action Magie, lancez-la (18 m) : attaque de sort à distance, 1d8 dégâts de feu." },
  rayondegivre: { n: "Rayon de givre", l: 0, e: "evo", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], atk: "dist", dmg: "1d8", ty: "froid", sc: 1, d: "Attaque de sort à distance : 1d8 dégâts de froid et la vitesse de la cible baisse de 3 m jusqu’au début de votre prochain tour." },
  resistance: { n: "Résistance", l: 0, e: "abj", t: A, p: "Contact", c: "V, S", du: "1 minute", co: true, cl: ["clerc", "druide"], d: "Choisissez un type de dégâts : une fois par tour, la créature touchée réduit de 1d4 les dégâts de ce type qu’elle subit." },
  flammesacree: { n: "Flamme sacrée", l: 0, e: "evo", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: ["clerc"], sv: "dex", dmg: "1d8", ty: "radiant", sc: 1, d: "Une flamme radiante descend sur une créature : JS de Dextérité ou 1d8 dégâts radiants. Les abris n’aident pas." },
  gourdinmagique: { n: "Gourdin magique", l: 0, e: "tra", t: AB_, p: "Contact", c: "V, S, M", du: "1 minute", cl: ["druide"], d: "Votre gourdin ou bâton utilise votre caractéristique d’incantation pour l’attaque et les dégâts, et son dé passe au d8 (d10 au niv. 5). Dégâts de force possibles." },
  poigneelectrique: { n: "Poigne électrique", l: 0, e: "evo", t: A, p: "Contact", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], atk: "cac", dmg: "1d8", ty: "foudre", sc: 1, d: "Attaque de sort au corps à corps : 1d8 dégâts de foudre, et la cible ne peut pas faire d’attaque d’opportunité jusqu’à son prochain tour." },
  epargnermourants: { n: "Épargner les mourants", l: 0, e: "nec", t: A, p: "4,50 m", c: "V, S", du: "Instantanée", cl: ["clerc", "druide"], d: "Une créature à 0 PV devient stable." },
  thaumaturgie: { n: "Thaumaturgie", l: 0, e: "tra", t: A, p: "9 m", c: "V", du: "1 minute", cl: ["clerc"], d: "Signes de puissance surnaturelle : voix tonitruante, flammes qui vacillent, tremblements inoffensifs, yeux changeants, portes qui claquent." },
  coupaubut: { n: "Coup au but", l: 0, e: "div", t: A, p: "Personnelle", c: "S, M", du: "Instantanée", cl: ["barde", "ensorceleur", "occultiste", "magicien"], d: "Vous attaquez avec une arme maîtrisée en utilisant votre caractéristique d’incantation. Dégâts radiants possibles ; +1d6 radiants au niveau 5." },
  moquerie: { n: "Moquerie cruelle", l: 0, e: "enc", t: A, p: "18 m", c: "V", du: "Instantanée", cl: ["barde"], sv: "sag", dmg: "1d6", ty: "psy", sc: 1, d: "Des insultes magiques : JS de Sagesse ou 1d6 dégâts psychiques et désavantage à sa prochaine attaque avant la fin de son prochain tour." },

  // Niveau 1
  alarme: { n: "Alarme", l: 1, e: "abj", t: "1 minute", p: "9 m", c: "V, S, M", du: "8 heures", ri: true, cl: ["rodeur", "magicien"], d: "Une alarme mentale ou sonore vous prévient quand une créature entre dans une zone d’un cube de 6 m." },
  amitieanimaux: { n: "Amitié avec les animaux", l: 1, e: "enc", t: A, p: "9 m", c: "V, S, M", du: "24 heures", cl: ["barde", "druide", "rodeur"], sv: "sag", d: "Une bête que vous voyez réussit un JS de Sagesse ou est charmée par vous pendant la durée." },
  fleau: { n: "Fléau", l: 1, e: "enc", t: A, p: "9 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "clerc", "occultiste"], sv: "cha", d: "Jusqu’à trois créatures font un JS de Charisme. En cas d’échec, elles soustraient 1d4 à leurs jets d’attaque et de sauvegarde." },
  benediction: { n: "Bénédiction", l: 1, e: "enc", t: A, p: "9 m", c: "V, S, M", du: "1 minute", co: true, cl: ["clerc", "paladin"], d: "Jusqu’à trois créatures ajoutent 1d4 à leurs jets d’attaque et de sauvegarde." },
  mainsbrulantes: { n: "Mains brûlantes", l: 1, e: "evo", t: A, p: "Cône de 4,50 m", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], sv: "dex", dmg: "3d6", ty: "feu", up: "+1d6 par niveau", d: "Un cône de flammes : JS de Dextérité, 3d6 dégâts de feu (moitié si réussite)." },
  charmepersonne: { n: "Charme-personne", l: 1, e: "enc", t: A, p: "9 m", c: "V, S", du: "1 heure", cl: ["barde", "druide", "ensorceleur", "occultiste", "magicien"], sv: "sag", d: "Un humanoïde réussit un JS de Sagesse (avec avantage si vous le combattez) ou est charmé et vous considère comme un ami." },
  injonction: { n: "Injonction", l: 1, e: "enc", t: A, p: "18 m", c: "V", du: "Instantanée", cl: ["barde", "clerc", "paladin"], sv: "sag", d: "Un ordre d’un mot (Approche, Lâche, Fuis, Rampe, Halte) : JS de Sagesse ou la créature obéit à son prochain tour." },
  comprehensionlangues: { n: "Compréhension des langues", l: 1, e: "div", t: A, p: "Personnelle", c: "V, S, M", du: "1 heure", ri: true, cl: ["barde", "ensorceleur", "occultiste", "magicien"], d: "Vous comprenez toutes les langues parlées que vous entendez et les textes que vous touchez." },
  soins: { n: "Soins", l: 1, e: "abj", t: A, p: "Contact", c: "V, S", du: "Instantanée", cl: ["barde", "clerc", "druide", "paladin", "rodeur"], heal: "2d8", up: "+2d8 par niveau", d: "La créature touchée regagne 2d8 + votre modificateur d’incantation PV." },
  detectionmagie: { n: "Détection de la magie", l: 1, e: "div", t: A, p: "Personnelle", c: "V, S", du: "10 minutes", co: true, ri: true, cl: ["barde", "clerc", "druide", "paladin", "rodeur", "ensorceleur", "occultiste", "magicien"], d: "Vous percevez la magie à 9 m et pouvez voir l’aura d’un objet ou d’une créature magique et son école." },
  deguisement: { n: "Déguisement", l: 1, e: "ill", t: A, p: "Personnelle", c: "V, S", du: "1 heure", cl: ["barde", "ensorceleur", "magicien"], d: "Vous modifiez votre apparence et vos vêtements. Une Investigation contre votre DD révèle l’illusion." },
  faveurdivine: { n: "Faveur divine", l: 1, e: "tra", t: AB_, p: "Personnelle", c: "V, S", du: "1 minute", cl: ["paladin"], dmg: "1d4", ty: "radiant", d: "Vos attaques avec une arme infligent 1d4 dégâts radiants supplémentaires." },
  chatimentdivin: { n: "Châtiment divin", l: 1, e: "evo", t: "Action bonus après avoir touché", p: "Personnelle", c: "V", du: "Instantanée", cl: ["paladin"], dmg: "2d8", ty: "radiant", up: "+1d8 par niveau", d: "Quand vous touchez avec une arme ou à mains nues : +2d8 dégâts radiants (+1d8 contre un fiélon ou un mort-vivant)." },
  enchevetrement: { n: "Enchevêtrement", l: 1, e: "inv", t: A, p: "27 m", c: "V, S", du: "1 minute", co: true, cl: ["druide", "rodeur"], sv: "for", d: "Des plantes poussent dans un carré de 6 m (terrain difficile). Chaque créature dans la zone réussit un JS de Force ou est entravée." },
  repliexpeditif: { n: "Repli expéditif", l: 1, e: "tra", t: AB_, p: "Personnelle", c: "V, S", du: "10 minutes", co: true, cl: ["ensorceleur", "occultiste", "magicien"], d: "Vous pouvez Foncer en action bonus à chacun de vos tours." },
  lueursfeeriques: { n: "Lueurs féeriques", l: 1, e: "evo", t: A, p: "18 m", c: "V", du: "1 minute", co: true, cl: ["barde", "druide"], sv: "dex", d: "Les créatures d’un cube de 6 m qui ratent un JS de Dextérité brillent : les attaques contre elles ont l’avantage et elles ne peuvent être invisibles." },
  simulacredevie: { n: "Simulacre de vie", l: 1, e: "nec", t: A, p: "Personnelle", c: "V, S, M", du: "Instantanée", cl: ["ensorceleur", "magicien"], heal: "2d4+4", up: "+5 PV temp. par niveau", d: "Vous gagnez 2d4 + 4 points de vie temporaires." },
  feuillemorte: { n: "Feuille morte", l: 1, e: "tra", t: RE, p: "18 m", c: "V, M", du: "1 minute", cl: ["barde", "ensorceleur", "magicien"], d: "Jusqu’à cinq créatures qui tombent descendent doucement (18 m par round) et ne subissent pas de dégâts de chute." },
  nappebrouillard: { n: "Nappe de brouillard", l: 1, e: "inv", t: A, p: "36 m", c: "V, S", du: "1 heure", co: true, cl: ["druide", "rodeur", "ensorceleur", "magicien"], d: "Une sphère de brouillard de 6 m de rayon crée une zone de visibilité nulle." },
  baies: { n: "Baies nourricières", l: 1, e: "inv", t: A, p: "Personnelle", c: "V, S, M", du: "24 heures", cl: ["druide", "rodeur"], d: "Dix baies apparaissent. Manger une baie (action bonus) rend 1 PV et nourrit pour la journée." },
  graisse: { n: "Graisse", l: 1, e: "inv", t: A, p: "18 m", c: "V, S, M", du: "1 minute", cl: ["ensorceleur", "magicien"], sv: "dex", d: "Un carré de 3 m devient glissant (terrain difficile). Les créatures dedans réussissent un JS de Dextérité ou tombent à terre." },
  eclairtracant: { n: "Éclair traçant", l: 1, e: "evo", t: A, p: "36 m", c: "V, S", du: "1 round", cl: ["clerc"], atk: "dist", dmg: "4d6", ty: "radiant", up: "+1d6 par niveau", d: "Attaque de sort à distance : 4d6 dégâts radiants, et la prochaine attaque contre la cible avant la fin de votre prochain tour a l’avantage." },
  motguerison: { n: "Mot de guérison", l: 1, e: "abj", t: AB_, p: "18 m", c: "V", du: "Instantanée", cl: ["barde", "clerc", "druide"], heal: "2d4", up: "+2d4 par niveau", d: "Une créature que vous voyez regagne 2d4 + votre modificateur d’incantation PV." },
  represailles: { n: "Représailles infernales", l: 1, e: "evo", t: RE, p: "18 m", c: "V, S", du: "Instantanée", cl: ["occultiste"], sv: "dex", dmg: "2d10", ty: "feu", up: "+1d10 par niveau", d: "En réaction aux dégâts d’une créature, elle fait un JS de Dextérité et subit 2d10 dégâts de feu (moitié si réussite)." },
  heroisme: { n: "Héroïsme", l: 1, e: "enc", t: A, p: "Contact", c: "V, S", du: "1 minute", co: true, cl: ["barde", "paladin"], d: "La créature est immunisée contre l’état effrayé et gagne des PV temporaires égaux à votre mod. d’incantation au début de chacun de ses tours." },
  marquechasseur: { n: "Marque du chasseur", l: 1, e: "div", t: AB_, p: "27 m", c: "V", du: "1 heure", co: true, cl: ["rodeur"], dmg: "1d6", ty: "force", d: "Vous marquez une créature : +1d6 dégâts de force quand vous la touchez avec une attaque, et avantage aux tests pour la trouver. Vous pouvez déplacer la marque si elle tombe à 0 PV." },
  identification: { n: "Identification", l: 1, e: "div", t: "1 minute", p: "Contact", c: "V, S, M", du: "Instantanée", ri: true, cl: ["barde", "magicien"], d: "Vous apprenez les propriétés d’un objet magique ou les sorts qui affectent une créature." },
  blessure: { n: "Blessure", l: 1, e: "nec", t: A, p: "Contact", c: "V, S", du: "Instantanée", cl: ["clerc"], sv: "con", dmg: "2d10", ty: "necro", up: "+1d10 par niveau", d: "JS de Constitution : 2d10 dégâts nécrotiques (moitié si réussite)." },
  saut: { n: "Saut", l: 1, e: "tra", t: AB_, p: "Contact", c: "V, S, M", du: "1 minute", cl: ["druide", "rodeur", "ensorceleur", "magicien"], d: "Une fois par tour, la créature peut sauter jusqu’à 9 m en dépensant 3 m de mouvement." },
  grandefoulee: { n: "Grande foulée", l: 1, e: "tra", t: A, p: "Contact", c: "V, S, M", du: "1 heure", cl: ["barde", "druide", "rodeur", "magicien"], d: "La vitesse de la créature augmente de 3 m." },
  armuremage: { n: "Armure de mage", l: 1, e: "abj", t: A, p: "Contact", c: "V, S, M", du: "8 heures", cl: ["ensorceleur", "magicien"], d: "Une créature sans armure a une CA de base de 13 + son mod. de Dextérité." },
  projectile: { n: "Projectile magique", l: 1, e: "evo", t: A, p: "36 m", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], dmg: "3d4+3", ty: "force", up: "+1 fléchette par niveau", d: "Trois fléchettes touchent automatiquement, 1d4 + 1 dégâts de force chacune." },
  protectionmal: { n: "Protection contre le mal et le bien", l: 1, e: "abj", t: A, p: "Contact", c: "V, S, M", du: "10 minutes", co: true, cl: ["clerc", "paladin", "occultiste", "magicien"], d: "Contre les aberrations, célestes, élémentaires, fées, fiélons et morts-vivants : désavantage à leurs attaques contre la cible, qui ne peut être charmée, effrayée ou possédée par eux." },
  sanctuaire: { n: "Sanctuaire", l: 1, e: "abj", t: AB_, p: "9 m", c: "V, S, M", du: "1 minute", cl: ["clerc"], d: "Une créature qui veut attaquer la cible doit réussir un JS de Sagesse ou choisir une autre cible." },
  bouclier: { n: "Bouclier", l: 1, e: "abj", t: RE, p: "Personnelle", c: "V, S", du: "1 round", cl: ["ensorceleur", "magicien"], d: "Quand vous êtes touché, +5 à la CA jusqu’au début de votre prochain tour, y compris contre l’attaque déclenchante. Immunité contre Projectile magique." },
  bouclierfoi: { n: "Bouclier de la foi", l: 1, e: "abj", t: AB_, p: "18 m", c: "V, S, M", du: "10 minutes", co: true, cl: ["clerc", "paladin"], d: "Une créature gagne +2 à la CA." },
  imagesilencieuse: { n: "Image silencieuse", l: 1, e: "ill", t: A, p: "18 m", c: "V, S, M", du: "10 minutes", co: true, cl: ["barde", "ensorceleur", "magicien"], d: "Image visuelle d’un objet ou d’une créature tenant dans un cube de 4,50 m, que vous pouvez déplacer." },
  sommeil: { n: "Sommeil", l: 1, e: "enc", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "ensorceleur", "magicien"], sv: "sag", d: "Les créatures d’une sphère de 1,50 m font un JS de Sagesse ou sont neutralisées, puis tombent inconscientes si elles ratent un second JS." },
  comanimaux: { n: "Communication avec les animaux", l: 1, e: "div", t: A, p: "Personnelle", c: "V, S", du: "10 minutes", ri: true, cl: ["barde", "druide", "rodeur"], d: "Vous comprenez les bêtes et pouvez communiquer verbalement avec elles." },
  vaguetonnante: { n: "Vague tonnante", l: 1, e: "evo", t: A, p: "Cube de 4,50 m", c: "V, S", du: "Instantanée", cl: ["barde", "druide", "ensorceleur", "magicien"], sv: "con", dmg: "2d8", ty: "tonnerre", up: "+1d8 par niveau", d: "JS de Constitution : 2d8 dégâts de tonnerre et la créature est repoussée de 3 m (moitié et pas de poussée si réussite)." },
  serviteur: { n: "Serviteur invisible", l: 1, e: "inv", t: A, p: "18 m", c: "V, S, M", du: "1 heure", ri: true, cl: ["barde", "occultiste", "magicien"], d: "Une force invisible et sans esprit accomplit des tâches simples à votre commande." },
  rayonempoisonne: { n: "Rayon empoisonné", l: 1, e: "nec", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], atk: "dist", dmg: "2d8", ty: "poison", up: "+1d8 par niveau", d: "Attaque de sort à distance : 2d8 dégâts de poison et la cible est empoisonnée jusqu’à la fin de votre prochain tour." },

  // Niveau 2
  aide: { n: "Aide", l: 2, e: "abj", t: A, p: "9 m", c: "V, S, M", du: "8 heures", cl: ["barde", "clerc", "druide", "paladin", "rodeur"], d: "Jusqu’à trois créatures voient leurs PV max et actuels augmenter de 5." },
  augure: { n: "Augure", l: 2, e: "div", t: "1 minute", p: "Personnelle", c: "V, S, M", du: "Instantanée", ri: true, cl: ["clerc"], d: "Vous recevez un présage (bonheur, malheur, les deux ou rien) sur une action prévue dans les 30 prochaines minutes." },
  peauecorce: { n: "Peau d’écorce", l: 2, e: "tra", t: AB_, p: "Contact", c: "V, S, M", du: "1 heure", cl: ["druide", "rodeur"], d: "La CA de la créature ne peut pas être inférieure à 17." },
  cecite: { n: "Cécité/Surdité", l: 2, e: "tra", t: A, p: "36 m", c: "V", du: "1 minute", cl: ["barde", "clerc", "ensorceleur", "magicien"], sv: "con", d: "JS de Constitution ou la créature est aveuglée ou assourdie (au choix). Elle refait le JS à la fin de chacun de ses tours." },
  flou: { n: "Flou", l: 2, e: "ill", t: A, p: "Personnelle", c: "V", du: "1 minute", co: true, cl: ["ensorceleur", "magicien"], d: "Votre silhouette devient floue : les attaques contre vous ont le désavantage." },
  apaisement: { n: "Apaisement des émotions", l: 2, e: "enc", t: A, p: "18 m", c: "V, S", du: "1 minute", co: true, cl: ["barde", "clerc"], sv: "cha", d: "Les humanoïdes d’une sphère de 6 m qui ratent un JS de Charisme ne sont plus charmés ou effrayés, ou deviennent indifférents." },
  tenebres: { n: "Ténèbres", l: 2, e: "evo", t: A, p: "18 m", c: "V, M", du: "10 minutes", co: true, cl: ["ensorceleur", "occultiste", "magicien"], d: "Des ténèbres magiques remplissent une sphère de 4,50 m. La vision dans le noir ne les perce pas." },
  visionnoir: { n: "Vision dans le noir", l: 2, e: "tra", t: A, p: "Contact", c: "V, S, M", du: "8 heures", cl: ["druide", "rodeur", "ensorceleur", "magicien"], d: "La créature gagne la vision dans le noir jusqu’à 45 m." },
  ameliorationcarac: { n: "Caractéristique améliorée", l: 2, e: "tra", t: A, p: "Contact", c: "V, S, M", du: "1 heure", co: true, cl: ["barde", "clerc", "druide", "rodeur", "ensorceleur", "magicien"], d: "Choisissez une caractéristique : la créature a l’avantage aux tests de cette caractéristique." },
  spherefeu: { n: "Sphère de feu", l: 2, e: "inv", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: ["druide", "ensorceleur", "magicien"], sv: "dex", dmg: "2d6", ty: "feu", up: "+1d6 par niveau", d: "Une sphère de feu de 1,50 m : les créatures qui finissent leur tour à côté font un JS de Dextérité, 2d6 dégâts de feu. Vous la déplacez par une action bonus." },
  chaufferetal: { n: "Chauffer le métal", l: 2, e: "tra", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "druide"], dmg: "2d8", ty: "feu", up: "+1d8 par niveau", d: "Un objet métallique devient brûlant : 2d8 dégâts de feu à qui le touche ; vous recommencez par une action bonus." },
  immobilisation: { n: "Immobilisation de personne", l: 2, e: "enc", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "clerc", "druide", "ensorceleur", "occultiste", "magicien"], sv: "sag", d: "Un humanoïde réussit un JS de Sagesse ou est paralysé. Il refait le JS à la fin de chacun de ses tours." },
  invisibilite: { n: "Invisibilité", l: 2, e: "ill", t: A, p: "Contact", c: "V, S, M", du: "1 heure", co: true, cl: ["barde", "ensorceleur", "occultiste", "magicien"], d: "La créature devient invisible jusqu’à ce qu’elle attaque, inflige des dégâts ou lance un sort." },
  restaurationpartielle: { n: "Restauration partielle", l: 2, e: "abj", t: AB_, p: "Contact", c: "V, S", du: "Instantanée", cl: ["barde", "clerc", "druide", "paladin", "rodeur"], d: "Met fin à un état : aveuglé, assourdi, paralysé ou empoisonné." },
  levitation: { n: "Lévitation", l: 2, e: "tra", t: A, p: "18 m", c: "V, S, M", du: "10 minutes", co: true, cl: ["ensorceleur", "magicien"], sv: "con", d: "Une créature ou un objet s’élève jusqu’à 6 m et y reste suspendu. Une créature non consentante peut réussir un JS de Constitution." },
  armemagique: { n: "Arme magique", l: 2, e: "tra", t: AB_, p: "Contact", c: "V, S", du: "1 heure", cl: ["paladin", "rodeur", "ensorceleur", "occultiste", "magicien"], d: "Une arme non magique devient une arme magique +1." },
  imagemiroir: { n: "Image miroir", l: 2, e: "ill", t: A, p: "Personnelle", c: "V, S", du: "1 minute", cl: ["barde", "ensorceleur", "occultiste", "magicien"], d: "Trois doubles illusoires vous entourent. Quand vous êtes la cible d’une attaque, un d6 peut détourner l’attaque sur un double." },
  fouleebrumeuse: { n: "Foulée brumeuse", l: 2, e: "inv", t: AB_, p: "Personnelle", c: "V", du: "Instantanée", cl: ["ensorceleur", "occultiste", "magicien"], d: "Vous vous téléportez jusqu’à 9 m dans un espace que vous voyez." },
  rayonlune: { n: "Rayon de lune", l: 2, e: "evo", t: A, p: "36 m", c: "V, S, M", du: "1 minute", co: true, cl: ["druide"], sv: "con", dmg: "2d10", ty: "radiant", up: "+1d10 par niveau", d: "Un cylindre de lumière de 1,50 m de rayon : JS de Constitution, 2d10 dégâts radiants (moitié si réussite). Vous le déplacez par une action bonus." },
  passagesanstrace: { n: "Passage sans trace", l: 2, e: "abj", t: A, p: "Personnelle", c: "V, S, M", du: "1 heure", co: true, cl: ["druide", "rodeur"], d: "Vous et les créatures à 9 m de vous gagnez +10 aux tests de Dextérité (Discrétion) et ne laissez pas de traces." },
  prieregueris: { n: "Prière de guérison", l: 2, e: "abj", t: A, p: "9 m", c: "V", du: "Instantanée", cl: ["clerc"], heal: "2d8", up: "+1d8 par niveau", d: "Jusqu’à cinq créatures regagnent 2d8 + votre mod. d’incantation PV." },
  rayonardent: { n: "Rayon ardent", l: 2, e: "evo", t: A, p: "36 m", c: "V, S", du: "Instantanée", cl: ["ensorceleur", "magicien"], atk: "dist", dmg: "2d6", ty: "feu", up: "+1 rayon par niveau", d: "Trois rayons de feu : une attaque de sort à distance pour chacun, 2d6 dégâts de feu par rayon." },
  fracassement: { n: "Fracassement", l: 2, e: "evo", t: A, p: "18 m", c: "V, S, M", du: "Instantanée", cl: ["barde", "ensorceleur", "occultiste", "magicien"], sv: "con", dmg: "3d8", ty: "tonnerre", up: "+1d8 par niveau", d: "Un bruit assourdissant dans une sphère de 3 m : JS de Constitution, 3d8 dégâts de tonnerre (moitié si réussite)." },
  silence: { n: "Silence", l: 2, e: "ill", t: A, p: "36 m", c: "V, S", du: "10 minutes", co: true, ri: true, cl: ["barde", "clerc", "rodeur"], d: "Aucun son ne naît ni ne traverse une sphère de 6 m. Impossible d’y lancer des sorts à composante verbale." },
  pattesaraignee: { n: "Pattes d’araignée", l: 2, e: "tra", t: A, p: "Contact", c: "V, S, M", du: "1 heure", co: true, cl: ["ensorceleur", "occultiste", "magicien"], d: "La créature peut se déplacer sur les murs et les plafonds, mains libres, avec une vitesse d’escalade égale à sa vitesse." },
  armespirituelle: { n: "Arme spirituelle", l: 2, e: "evo", t: AB_, p: "18 m", c: "V, S", du: "1 minute", co: true, cl: ["clerc"], atk: "cac", dmg: "1d8", ty: "force", up: "+1d8 par niveau", d: "Une arme spectrale flotte : attaque de sort au corps à corps, 1d8 + mod. d’incantation dégâts de force. Déplacez-la et attaquez par une action bonus." },
  suggestion: { n: "Suggestion", l: 2, e: "enc", t: A, p: "9 m", c: "V, M", du: "8 heures", co: true, cl: ["barde", "ensorceleur", "occultiste", "magicien"], sv: "sag", d: "Vous suggérez une action raisonnable (25 mots max) : JS de Sagesse ou la créature la suit au mieux." },
  toile: { n: "Toile d’araignée", l: 2, e: "inv", t: A, p: "18 m", c: "V, S, M", du: "1 heure", co: true, cl: ["ensorceleur", "magicien"], sv: "dex", d: "Des toiles remplissent un cube de 6 m : JS de Dextérité ou la créature est entravée." },
  zoneverite: { n: "Zone de vérité", l: 2, e: "enc", t: A, p: "18 m", c: "V, S", du: "10 minutes", cl: ["barde", "clerc", "paladin"], sv: "cha", d: "Dans une sphère de 4,50 m, une créature qui rate un JS de Charisme ne peut pas mentir délibérément." },
  appeldestrier: { n: "Appel de destrier", l: 2, e: "inv", t: A, p: "9 m", c: "V, S", du: "Instantanée", cl: ["paladin"], d: "Vous invoquez un esprit qui prend la forme d’un destrier loyal, intelligent et télépathiquement lié à vous." },
  rayonaffaiblissant: { n: "Rayon affaiblissant", l: 2, e: "nec", t: A, p: "18 m", c: "V, S", du: "1 minute", co: true, cl: ["occultiste", "magicien"], sv: "con", d: "JS de Constitution ou la créature a le désavantage aux tests et attaques de Force, et ses attaques infligent 1d8 dégâts de moins." },
  alteration: { n: "Altération", l: 2, e: "tra", t: A, p: "Personnelle", c: "V, S", du: "1 heure", co: true, cl: ["ensorceleur", "magicien"], d: "Adaptation aquatique, changement d’apparence ou armes naturelles (1d6, magiques)." },

  // Niveau 3
  malediction: { n: "Malédiction", l: 3, e: "nec", t: A, p: "Contact", c: "V, S", du: "1 minute", co: true, cl: ["barde", "clerc", "magicien"], sv: "sag", d: "JS de Sagesse ou la cible subit une malédiction au choix (désavantage, dégâts nécrotiques supplémentaires, perte d’action…)." },
  appelfoudre: { n: "Appel de la foudre", l: 3, e: "inv", t: A, p: "36 m", c: "V, S", du: "10 minutes", co: true, cl: ["druide"], sv: "dex", dmg: "3d10", ty: "foudre", up: "+1d10 par niveau", d: "Un nuage d’orage : par une action, la foudre frappe un point (sphère de 1,50 m) : JS de Dextérité, 3d10 dégâts de foudre." },
  contresort: { n: "Contresort", l: 3, e: "abj", t: RE, p: "18 m", c: "S", du: "Instantanée", cl: ["ensorceleur", "occultiste", "magicien"], sv: "con", d: "En réaction à une créature qui lance un sort : elle fait un JS de Constitution ou le sort échoue sans effet." },
  lumierejour: { n: "Lumière du jour", l: 3, e: "evo", t: A, p: "18 m", c: "V, S", du: "1 heure", cl: ["clerc", "druide", "paladin", "rodeur", "ensorceleur"], d: "Une sphère de lumière vive de 18 m de rayon, qui dissipe les ténèbres magiques de niveau 3 ou moins." },
  dissipation: { n: "Dissipation de la magie", l: 3, e: "abj", t: A, p: "36 m", c: "V, S", du: "Instantanée", cl: ["barde", "clerc", "druide", "paladin", "rodeur", "ensorceleur", "occultiste", "magicien"], d: "Met fin aux sorts de niveau 3 ou moins sur une cible. Pour un sort plus puissant : test de caractéristique d’incantation DD 10 + niveau du sort." },
  terreur: { n: "Terreur", l: 3, e: "ill", t: A, p: "Cône de 9 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "ensorceleur", "occultiste", "magicien"], sv: "sag", d: "JS de Sagesse ou les créatures lâchent ce qu’elles tiennent, sont effrayées et doivent fuir." },
  bouledefeu: { n: "Boule de feu", l: 3, e: "evo", t: A, p: "45 m", c: "V, S, M", du: "Instantanée", cl: ["ensorceleur", "magicien"], sv: "dex", dmg: "8d6", ty: "feu", up: "+1d6 par niveau", d: "Une explosion dans une sphère de 6 m : JS de Dextérité, 8d6 dégâts de feu (moitié si réussite)." },
  vol: { n: "Vol", l: 3, e: "tra", t: A, p: "Contact", c: "V, S, M", du: "10 minutes", co: true, cl: ["ensorceleur", "occultiste", "magicien"], d: "La créature gagne une vitesse de vol de 18 m." },
  hate: { n: "Hâte", l: 3, e: "tra", t: A, p: "9 m", c: "V, S, M", du: "1 minute", co: true, cl: ["ensorceleur", "magicien"], d: "Vitesse doublée, +2 à la CA, avantage aux JS de Dex et une action limitée supplémentaire. À la fin, la cible perd un tour." },
  motifhypnotique: { n: "Motif hypnotique", l: 3, e: "ill", t: A, p: "36 m", c: "S, M", du: "1 minute", co: true, cl: ["barde", "ensorceleur", "occultiste", "magicien"], sv: "sag", d: "Un motif coloré dans un cube de 9 m : JS de Sagesse ou les créatures sont charmées et neutralisées." },
  eclair: { n: "Éclair", l: 3, e: "evo", t: A, p: "Ligne de 30 m", c: "V, S, M", du: "Instantanée", cl: ["ensorceleur", "magicien"], sv: "dex", dmg: "8d6", ty: "foudre", up: "+1d6 par niveau", d: "Une ligne de foudre de 30 m sur 1,50 m : JS de Dextérité, 8d6 dégâts de foudre (moitié si réussite)." },
  motguerisongroupe: { n: "Mot de guérison de groupe", l: 3, e: "abj", t: AB_, p: "18 m", c: "V", du: "Instantanée", cl: ["barde", "clerc"], heal: "2d4", up: "+1d4 par niveau", d: "Jusqu’à six créatures regagnent 2d4 + votre mod. d’incantation PV." },
  retouralavie: { n: "Retour à la vie", l: 3, e: "nec", t: A, p: "Contact", c: "V, S, M", du: "Instantanée", cl: ["clerc", "druide", "paladin", "rodeur"], d: "Une créature morte depuis moins d’une minute revient à la vie avec 1 PV. Consomme un diamant de 300 po." },
  tempeteneige: { n: "Tempête de neige", l: 3, e: "inv", t: A, p: "45 m", c: "V, S, M", du: "1 minute", co: true, cl: ["druide", "ensorceleur", "magicien"], sv: "dex", d: "Un cylindre de 12 m de rayon de grésil : terrain difficile, visibilité réduite, JS de Dextérité ou chute, concentration difficile." },
  espritsgardiens: { n: "Esprits gardiens", l: 3, e: "inv", t: A, p: "Personnelle", c: "V, S, M", du: "10 minutes", co: true, cl: ["clerc"], sv: "sag", dmg: "3d8", ty: "radiant", up: "+1d8 par niveau", d: "Des esprits vous entourent sur 4,50 m : vitesse des ennemis divisée par deux, et JS de Sagesse ou 3d8 dégâts radiants ou nécrotiques quand ils entrent ou finissent leur tour dans la zone." },
  nuagepuant: { n: "Nuage puant", l: 3, e: "inv", t: A, p: "27 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "ensorceleur", "magicien"], sv: "con", d: "Une sphère de gaz de 6 m : JS de Constitution ou la créature est empoisonnée et perd son action." },
  donlangues: { n: "Don des langues", l: 3, e: "div", t: A, p: "Contact", c: "V, M", du: "1 heure", cl: ["barde", "clerc", "ensorceleur", "occultiste", "magicien"], d: "La créature comprend toutes les langues parlées et se fait comprendre de tous." },
  lenteur: { n: "Lenteur", l: 3, e: "tra", t: A, p: "36 m", c: "V, S, M", du: "1 minute", co: true, cl: ["barde", "ensorceleur", "magicien"], sv: "sag", d: "Jusqu’à six créatures : JS de Sagesse ou vitesse divisée par deux, -2 CA et JS de Dex, une seule action ou action bonus par tour." },
  parlermorts: { n: "Communication avec les morts", l: 3, e: "nec", t: A, p: "3 m", c: "V, S, M", du: "10 minutes", cl: ["barde", "clerc", "magicien"], d: "Un cadavre répond à cinq questions selon ce qu’il savait de son vivant." },
  croissance: { n: "Croissance végétale", l: 3, e: "tra", t: A, p: "45 m", c: "V, S", du: "Instantanée", cl: ["barde", "druide", "rodeur"], d: "La végétation devient très dense (terrain difficile coûteux) ou les cultures sont enrichies pour un an." },
  invocationanimaux: { n: "Invocation d’animaux", l: 3, e: "inv", t: A, p: "18 m", c: "V, S", du: "10 minutes", co: true, cl: ["druide", "rodeur"], sv: "dex", dmg: "3d10", ty: "tranchant", up: "+1d10 par niveau", d: "Une meute d’esprits bestiaux vous suit : quand une créature entre près d’elle, JS de Dextérité ou 3d10 dégâts tranchants." },
  lueurespoir: { n: "Lueur d’espoir", l: 3, e: "abj", t: A, p: "9 m", c: "V, S", du: "1 minute", co: true, cl: ["clerc"], d: "Les créatures choisies ont l’avantage aux JS de Sagesse et contre la mort, et regagnent le maximum possible avec les soins." },
};

const COND_PAIRS = [[K("À terre"), "À terre"], [K("Agrippé"), "Agrippé"], [K("Assourdi"), "Assourdi"], [K("Aveuglé"), "Aveuglé"], [K("Charmé"), "Charmé"], [K("Effrayé"), "Effrayé"], [K("Empoisonné"), "Empoisonné"], [K("Entravé"), "Entravé"], [K("Étourdi"), "Étourdi"], [K("Inconscient"), "Inconscient"], [K("Invisible"), "Invisible"], [K("Neutralisé"), "Neutralisé"], [K("Paralysé"), "Paralysé"], [K("Pétrifié"), "Pétrifié"]];
const CONDITIONS = COND_PAIRS.map((p) => p[0]), COND_L = Object.fromEntries(COND_PAIRS);
