/* Forge des Héros — catalogue du Manuel des joueurs 2024 (hors SRD).
   Seulement des noms et la structure de jeu (niveaux des aptitudes, caractéristiques, compétences, don d’origine) :
   aucun texte du livre. Chaque groupe complète les effets depuis son propre livre ; le texte est enregistré
   dans l’aventure (ou sur l’appareil) et remplace l’entrée « à compléter ». */

const SUB_LEVELS = { barbare: [3, 6, 10, 14], barde: [3, 6, 14], clerc: [3, 6, 17], druide: [3, 6, 10, 14], ensorceleur: [3, 6, 14, 18], guerrier: [3, 7, 10, 15, 18], magicien: [3, 6, 10, 14], moine: [3, 6, 11, 17], occultiste: [3, 6, 10, 14], paladin: [3, 7, 15, 20], rodeur: [3, 7, 11, 15], roublard: [3, 9, 13, 17] };

const PHB_SUBS = {
  barbare: [["arbremonde", "Voie de l’Arbre-Monde"], ["coeursauvage", "Voie du Cœur sauvage"], ["zelateur", "Voie du Zélateur"]],
  barde: [["danse", "Collège de la Danse"], ["seduction", "Collège de la Séduction"], ["vaillance", "Collège de la Vaillance"]],
  clerc: [["guerre", "Domaine de la Guerre"], ["lumiere", "Domaine de la Lumière"], ["ruse", "Domaine de la Ruse"]],
  druide: [["astres", "Cercle des Astres"], ["lune", "Cercle de la Lune"], ["mers", "Cercle des Mers"]],
  ensorceleur: [["aberrante", "Sorcellerie aberrante"], ["mecanique", "Sorcellerie mécanique"], ["sauvage", "Sorcellerie sauvage"]],
  guerrier: [["chevalierocculte", "Chevalier occulte"], ["maitreguerre", "Maître de guerre"], ["soldatpsi", "Soldat psi"]],
  magicien: [["abjurateur", "Abjurateur"], ["devin", "Devin"], ["illusionniste", "Illusionniste"]],
  moine: [["elements", "Credo des Éléments"], ["misericorde", "Credo de la Miséricorde"], ["ombre", "Credo de l’Ombre"]],
  occultiste: [["archifee", "Protecteur Archifée"], ["celeste", "Protecteur Céleste"], ["grandancien", "Protecteur Grand Ancien"]],
  paladin: [["anciens", "Serment des Anciens"], ["gloire", "Serment de Gloire"], ["vengeance", "Serment de Vengeance"]],
  rodeur: [["belluaire", "Belluaire"], ["traqueur", "Traqueur des ténèbres"], ["vagabond", "Vagabond féerique"]],
  roublard: [["ameaceree", "Âme acérée"], ["arnaqueur", "Arnaqueur arcanique"], ["assassin", "Assassin"]],
};

/* Dons : [clé, nom, catégorie] */
const PHB_FEATS = [
  ["faconneur", "Façonneur", "origine"], ["guerisseur", "Guérisseur", "origine"], ["chanceux", "Chanceux", "origine"],
  ["musicien", "Musicien", "origine"], ["bagarreur", "Bagarreur de tavernes", "origine"], ["robuste", "Robuste", "origine"],
  ["comedien", "Comédien"], ["athlete", "Athlète"], ["charge", "Expert de la charge"], ["chef", "Chef cuisinier"], ["arbaletrier", "Maître-arbalétrier"],
  ["broyeur", "Broyeur"], ["dueldef", "Duelliste défensif"], ["deuxarmes", "Combattant à deux armes"], ["gaillard", "Gaillard"],
  ["adepteelem", "Adepte élémentaire"], ["feerique", "Affinité féerique"], ["maitrearmeslourdes", "Maître des armes lourdes"],
  ["protlourde", "Protection lourde"], ["maitrearmureslourdes", "Maître des armures lourdes"], ["figureproue", "Figure de proue"],
  ["espritaffute", "Esprit affûté"], ["protlegere", "Protection légère"], ["tueurmages", "Tueur de mages"],
  ["armesguerre", "Formation aux armes de guerre"], ["maitrearmuresinter", "Maître des armures intermédiaires"],
  ["protinter", "Protection intermédiaire"], ["monte", "Combattant monté"], ["observateur", "Observateur"], ["perforateur", "Perforateur"],
  ["empoisonneur", "Empoisonneur"], ["hast", "Maître d’hast"], ["resilient", "Résilient"], ["rituelle", "Magie rituelle"],
  ["sentinelle", "Sentinelle"], ["ombreuse", "Affinité ombreuse"], ["tireurelite", "Tireur d’élite"], ["boucliers", "Maître des boucliers"],
  ["expert", "Expert"], ["discret", "Discret"], ["trancheur", "Trancheur"], ["mobile", "Mobile"], ["incantelite", "Incantateur d’élite"],
  ["telekinesiste", "Télékinésiste"], ["telepathe", "Télépathe"], ["mageguerre", "Mage de guerre"], ["maitrearmes", "Maître d’armes"],
];

/* Historiques : clé, nom, caractéristiques, compétences, outil, don (clé de FEATS), liste du don Initié */
const PHB_BGS = [
  ["artisan", "Artisan", ["for", "dex", "int"], ["inve", "psua"], "Outils d’artisan (au choix)", "hb_phb_faconneur"],
  ["charlatan", "Charlatan", ["dex", "con", "cha"], ["trom", "esca"], "Matériel de contrefaçon", "doue"],
  ["artiste", "Artiste", ["for", "dex", "cha"], ["acro", "repr"], "Instrument de musique (au choix)", "hb_phb_musicien"],
  ["fermier", "Fermier", ["for", "con", "sag"], ["dres", "natu"], "Outils de charpentier", "hb_phb_robuste"],
  ["garde", "Garde", ["for", "int", "sag"], ["athl", "perc"], "Jeu (au choix)", "vigilant"],
  ["guide", "Guide", ["dex", "con", "sag"], ["disc", "surv"], "Outils de cartographe", "initie", "drd"],
  ["ermite", "Ermite", ["con", "sag", "cha"], ["mede", "reli"], "Matériel d’herboriste", "hb_phb_guerisseur"],
  ["marchand", "Marchand", ["con", "int", "cha"], ["dres", "psua"], "Instruments de navigation", "hb_phb_chanceux"],
  ["noble", "Noble", ["for", "int", "cha"], ["hist", "psua"], "Jeu (au choix)", "doue"],
  ["marin", "Marin", ["for", "dex", "sag"], ["acro", "perc"], "Instruments de navigation", "hb_phb_bagarreur"],
  ["scribe", "Scribe", ["dex", "int", "sag"], ["inve", "perc"], "Matériel de calligraphe", "doue"],
  ["voyageur", "Voyageur", ["dex", "sag", "cha"], ["pspi", "disc"], "Outils de voleur", "hb_phb_chanceux"],
];

/* Styles de combat et faveurs épiques (hors SRD) */
const PHB_STYLES = [["aveugle", "Combat en aveugle"], ["duel", "Duel"], ["interception", "Interception"], ["protection", "Protection"], ["lancer", "Arme de lancer"], ["mainsnues", "Combat à mains nues"], ["beni", "Combattant béni"], ["druidique", "Combattant druidique"]];
const PHB_BOONS = [["energies", "Faveur de résistance aux énergies"], ["vigueur", "Faveur de vigueur"], ["recuperation", "Faveur de récupération"], ["competence", "Faveur de compétence"], ["vitesse", "Faveur de vitesse"]];

const PHB_RAW = {};
(function phbBoot() {
  const add = (d) => { d.sk = true; d.src = "phb"; PHB_RAW["hb_" + d.id] = d; };
  Object.entries(PHB_SUBS).forEach(([cls, list]) => list.forEach(([k, n]) => add({ id: "phb_" + cls + "_" + k, type: "sub", n, cls, d: "", feats: SUB_LEVELS[cls].map((l) => ({ l, n: "", d: "" })), spellsTxt: "" })));
  PHB_FEATS.forEach(([k, n, cat]) => add({ id: "phb_" + k, type: "feat", n, cat: cat || "general", pre: cat ? "" : "Niveau 4", ab: [], d: "" }));
  PHB_STYLES.forEach(([k, n]) => add({ id: "phb_style_" + k, type: "feat", n, cat: "style", pre: "Aptitude Style de combat", ab: [], d: "" }));
  PHB_BOONS.forEach(([k, n]) => add({ id: "phb_faveur_" + k, type: "feat", n, cat: "faveur", pre: "Niveau 19", ab: [], d: "" }));
  PHB_BGS.forEach(([k, n, ab, skills, tool, feat, featList]) => add({ id: "phb_" + k, type: "bg", n, ab, skills, tool, feat, featList: featList || "clr", d: "", gear: "", gold: 0 }));
  // sous-classes qui donnent l’incantation (règle de jeu, pas de texte)
  PHB_RAW.hb_phb_guerrier_chevalierocculte.cast = { ab: "int", list: "magicien" };
  PHB_RAW.hb_phb_roublard_arnaqueur.cast = { ab: "int", list: "magicien" };
  Object.values(PHB_RAW).forEach((d) => hbRegister(d, true));
})();
