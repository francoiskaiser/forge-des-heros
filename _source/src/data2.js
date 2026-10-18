/* Forge des Héros — niveaux 6 à 20 et sorts de niveau 4 à 9.
   Contenu adapté du SRD 5.2 (Wizards of the Coast LLC), licence CC-BY-4.0. */

const MAXLV = 20;
const ASI_TXT = ["Amélioration de caractéristique", "+2 à une caractéristique ou +1 à deux (max 20)."];
const BOON_TXT = ["Faveur épique", "Un don épique de votre choix et +1 à une caractéristique (max 30)."];

/* Tables d’emplacements complètes */
FULL_SLOTS.length = 0;
FULL_SLOTS.push([2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]);
HALF_SLOTS.length = 0;
HALF_SLOTS.push([2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1],
  [4, 3, 3, 2], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2]);
PACT_SLOTS.length = 0;
PACT_SLOTS.push([1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5]);

const T_CANT = (a, b, c) => Array.from({ length: 20 }, (_, i) => (i < 3 ? a : i < 9 ? b : c));
const PREP_FULL = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
const PREP_HALF = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];
Object.assign(CLASSES.barde, { cant: T_CANT(2, 3, 4), prep: PREP_FULL });
Object.assign(CLASSES.clerc, { cant: T_CANT(3, 4, 5), prep: PREP_FULL });
Object.assign(CLASSES.druide, { cant: T_CANT(2, 3, 4), prep: PREP_FULL });
Object.assign(CLASSES.magicien, { cant: T_CANT(3, 4, 5), prep: PREP_FULL });
Object.assign(CLASSES.ensorceleur, { cant: T_CANT(4, 5, 6), prep: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22] });
Object.assign(CLASSES.occultiste, { cant: T_CANT(2, 3, 4), prep: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15], inv: [1, 3, 3, 3, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10] });
Object.assign(CLASSES.paladin, { cant: Array(20).fill(0), prep: PREP_HALF });
Object.assign(CLASSES.rodeur, { cant: Array(20).fill(0), prep: PREP_HALF });

/* Niveaux d’amélioration de caractéristique (19 = faveur épique) */
const ASI_LEVELS = { def: [4, 8, 12, 16], guerrier: [4, 6, 8, 12, 14, 16], roublard: [4, 8, 10, 12, 16] };
const asiLevels = (cls) => ASI_LEVELS[cls] || ASI_LEVELS.def;

const EPIC_BOONS = {
  prouesse: { n: "Faveur de prouesse martiale", d: "Une fois par tour, quand vous ratez une attaque, vous pouvez la transformer en réussite." },
  voyage: { n: "Faveur du voyage dimensionnel", d: "Après une action d’Attaque ou de Magie, vous pouvez vous téléporter jusqu’à 9 m dans un espace que vous voyez." },
  destin: { n: "Faveur du destin", d: "Quand une créature à 18 m fait un test d20, vous pouvez lancer 2d4 et l’ajouter ou le soustraire. Récupérée à l’initiative ou au repos court." },
  offensive: { n: "Faveur de l’offensive irrésistible", d: "Vos dégâts contondants, perforants et tranchants ignorent la résistance. Sur un 20 naturel, dégâts supplémentaires égaux à la caractéristique augmentée." },
  rappel: { n: "Faveur du rappel de sort", d: "Une fois par repos long, vous lancez un sort de niveau 1 à 4 préparé sans dépenser d’emplacement." },
  vision: { n: "Faveur de vision véritable", d: "Vous gagnez la vision véritable sur 18 m." },
};

/* Choix ajoutés à haut niveau */
const STRIKE_OPTS = {
  clerc: { lvl: 7, label: "Frappes bénies", opts: {
    divine: { n: "Frappe divine", d: "Une fois par tour, quand vous touchez avec une arme, +1d8 dégâts nécrotiques ou radiants (2d8 au niv. 14)." },
    puissant: { n: "Incantation puissante", d: "Ajoutez votre mod. de Sagesse aux dégâts de vos tours de magie de clerc. Au niv. 14, octroyez des PV temporaires égaux au double." } } },
  druide: { lvl: 7, label: "Fureur élémentaire", opts: {
    primale: { n: "Frappe primale", d: "Une fois par tour, quand vous touchez avec une arme ou une attaque de bête, +1d8 dégâts de froid, feu, foudre ou tonnerre (2d8 au niv. 15)." },
    puissant: { n: "Incantation puissante", d: "Ajoutez votre mod. de Sagesse aux dégâts de vos tours de magie de druide. Au niv. 15, leur portée augmente de 90 m." } } },
};

Object.assign(INVOCATIONS, {
  sautoutremonde: { n: "Saut d’outre-monde", lv: 2, d: "Vous pouvez lancer Saut sur vous-même sans emplacement." },
  murmurestombe: { n: "Murmures de la tombe", lv: 7, d: "Vous pouvez lancer Communication avec les morts sans emplacement." },
  unombres: { n: "Un avec les ombres", lv: 5, d: "Dans la pénombre ou l’obscurité, vous pouvez lancer Invisibilité sur vous-même sans emplacement." },
  pasascendant: { n: "Pas ascendant", lv: 5, d: "Vous pouvez lancer Lévitation sur vous-même sans emplacement." },
  donabysses: { n: "Don des abysses", lv: 5, d: "Vitesse de nage égale à votre vitesse, respiration aquatique et Respiration aquatique une fois par repos long." },
  maitreformes: { n: "Maître des mille formes", lv: 5, d: "Vous pouvez lancer Altération à volonté, sans emplacement." },
  lameassoiffee: { n: "Lame assoiffée", lv: 5, d: "(Pacte de la lame) Vous attaquez deux fois avec votre arme de pacte quand vous effectuez l’action d’Attaque." },
  chatimentocculte: { n: "Châtiment occulte", lv: 5, d: "(Pacte de la lame) Quand vous touchez avec l’arme de pacte, dépensez un emplacement de pacte : +1d8 force + 1d8 par niveau d’emplacement, et la cible peut tomber à terre." },
  maitrechaines: { n: "Investiture du maître des chaînes", lv: 5, d: "(Pacte de la chaîne) Votre familier gagne vol ou nage, attaque en action bonus et utilise votre DD de sorts." },
  buveurvie: { n: "Buveur de vie", lv: 9, d: "(Pacte de la lame) Quand vous touchez avec l’arme de pacte, +1d6 nécrotique, psychique ou radiant, et vous pouvez dépenser un dé de vie pour vous soigner." },
  lamedevorante: { n: "Lame dévorante", lv: 12, d: "(Lame assoiffée) Vous attaquez trois fois avec votre arme de pacte." },
  regardsorcier: { n: "Regard de sorcier", lv: 15, d: "Vous gagnez la vision véritable sur 9 m." },
  visionsroyaumes: { n: "Visions de royaumes lointains", lv: 15, d: "Vous pouvez lancer Œil magique sans emplacement." },
});

/* ---------- Aptitudes des niveaux 6 à 20 ---------- */
const F = (n, d) => [n, d];
const HIGH = {
  barbare: {
    6: [F("Rage aveugle (Berserker)", "En rage, vous êtes immunisé contre les états charmé et effrayé ; ces états prennent fin quand vous entrez en rage.")],
    7: [F("Instinct sauvage", "Avantage aux jets d’initiative."), F("Bond instinctif", "Quand vous entrez en rage, vous pouvez vous déplacer de la moitié de votre vitesse.")],
    8: [ASI_TXT],
    9: [F("Frappe brutale", "Quand vous utilisez l’Attaque téméraire, vous pouvez renoncer à l’avantage d’une attaque : si elle touche, +1d10 dégâts et un effet (Frappe percutante : poussée de 4,50 m ; Frappe incapacitante : -4,50 m de vitesse).")],
    10: [F("Représailles (Berserker)", "En réaction aux dégâts d’une créature à 1,50 m, vous effectuez une attaque au corps à corps contre elle.")],
    11: [F("Rage implacable", "En rage, si vous tombez à 0 PV, un JS de Constitution DD 10 vous ramène à un nombre de PV égal au double de votre niveau. Le DD augmente de 5 à chaque usage (repos court ou long).")],
    12: [ASI_TXT],
    13: [F("Frappe brutale améliorée", "Nouveaux effets : Frappe sidérante (désavantage au prochain JS, pas d’attaque d’opportunité) et Frappe déchirante (+5 au prochain jet d’attaque contre la cible).")],
    14: [F("Présence intimidante (Berserker)", "Par une action bonus, les créatures de votre choix à 9 m font un JS de Sagesse ou sont effrayées pendant 1 minute. Une fois par repos long, ou en dépensant une Rage.")],
    15: [F("Rage persistante", "À l’initiative, vous récupérez toutes vos Rages (une fois par repos long). Votre rage dure 10 minutes sans avoir besoin d’être entretenue.")],
    16: [ASI_TXT],
    17: [F("Frappe brutale améliorée", "Les dégâts supplémentaires passent à 2d10 et vous pouvez appliquer deux effets.")],
    18: [F("Puissance indomptable", "Si le total d’un test ou JS de Force est inférieur à votre valeur de Force, utilisez cette valeur.")],
    19: [BOON_TXT],
    20: [F("Champion primitif", "Votre Force et votre Constitution augmentent de 4 (max 25).")],
  },
  barde: {
    6: [F("Découvertes magiques (Savoir)", "Vous apprenez deux sorts des listes du clerc, du druide ou du magicien. Ils sont toujours préparés.")],
    7: [F("Contre-charme", "En réaction quand une créature à 9 m rate un JS contre charmé ou effrayé, elle peut le relancer avec avantage.")],
    8: [ASI_TXT],
    9: [F("Expertise", "Vous gagnez l’expertise dans deux compétences supplémentaires.")],
    10: [F("Secrets magiques", "Vous pouvez préparer des sorts des listes du barde, du clerc, du druide et du magicien."), F("Inspiration bardique d10", "Votre dé d’inspiration devient un d10.")],
    12: [ASI_TXT],
    14: [F("Talent sans égal (Savoir)", "Quand vous ratez un test, vous pouvez dépenser une Inspiration bardique et ajouter le dé au résultat.")],
    15: [F("Inspiration bardique d12", "Votre dé d’inspiration devient un d12.")],
    16: [ASI_TXT],
    18: [F("Inspiration supérieure", "À l’initiative, vous récupérez des Inspirations bardiques jusqu’à en avoir deux.")],
    19: [BOON_TXT],
    20: [F("Mots de création", "Mot de guérison suprême et Mot de pouvoir mortel sont toujours préparés ; vous pouvez viser une seconde créature à 3 m de la première.")],
  },
  clerc: {
    6: [F("Guérisseur béni (Vie)", "Quand vous soignez une autre créature avec un sort, vous regagnez 2 + le niveau de l’emplacement en PV."), F("Conduit divin (3)", "Vous avez trois utilisations de Conduit divin.")],
    7: [F("Frappes bénies", "Frappe divine ou Incantation puissante, selon votre choix.")],
    8: [ASI_TXT],
    10: [F("Intervention divine", "Par une action, vous lancez un sort de clerc de niveau 5 ou moins sans emplacement ni composante matérielle. Une fois par repos long.")],
    12: [ASI_TXT],
    14: [F("Frappes bénies améliorées", "Frappe divine passe à 2d8, ou Incantation puissante octroie des PV temporaires.")],
    16: [ASI_TXT],
    17: [F("Guérison suprême (Vie)", "Quand vous lancez des dés pour rendre des PV avec un sort, utilisez le maximum de chaque dé.")],
    18: [F("Conduit divin (4)", "Vous avez quatre utilisations de Conduit divin.")],
    19: [BOON_TXT],
    20: [F("Intervention divine supérieure", "Votre Intervention divine peut lancer Souhait. Vous devez ensuite attendre 2d4 repos longs avant de la réutiliser.")],
  },
  druide: {
    6: [F("Récupération naturelle (Terre)", "Lancez un sort de cercle sans emplacement une fois par repos long, et récupérez des emplacements au repos court (total des niveaux ≤ moitié de votre niveau)."), F("Forme sauvage (3)", "Vous avez trois utilisations de Forme sauvage.")],
    7: [F("Fureur élémentaire", "Frappe primale ou Incantation puissante, selon votre choix.")],
    8: [ASI_TXT],
    10: [F("Protection de la nature (Terre)", "Immunité contre l’état empoisonné et résistance à un type de dégâts lié à votre terre.")],
    12: [ASI_TXT],
    14: [F("Sanctuaire naturel (Terre)", "Dépensez une Forme sauvage pour faire surgir des arbres spectraux dans un cube de 4,50 m : abri partiel et résistance pour vos alliés.")],
    15: [F("Fureur élémentaire améliorée", "Frappe primale passe à 2d8, ou la portée de vos tours de magie augmente de 90 m.")],
    16: [ASI_TXT],
    17: [F("Forme sauvage (4)", "Vous avez quatre utilisations de Forme sauvage.")],
    18: [F("Sorts de bête", "Vous pouvez lancer des sorts sous Forme sauvage, sauf ceux à composante matérielle coûteuse.")],
    19: [BOON_TXT],
    20: [F("Archidruide", "À l’initiative, vous récupérez une Forme sauvage. Vous pouvez convertir des Formes sauvages en emplacements de sorts, et vous vieillissez dix fois moins vite.")],
  },
  guerrier: {
    6: [ASI_TXT],
    7: [F("Style de combat supplémentaire (Champion)", "Vous choisissez un second style de combat.")],
    8: [ASI_TXT],
    9: [F("Inflexible", "Relancez un JS raté en ajoutant votre niveau de guerrier. Une fois par repos long (deux au niv. 13, trois au niv. 17)."), F("Maître tacticien", "Quand vous attaquez avec une arme dont vous utilisez la maîtrise, vous pouvez remplacer sa propriété par Repousser, Affaiblir ou Ralentir.")],
    10: [F("Guerrier héroïque (Champion)", "Au début de chacun de vos tours en combat, vous gagnez l’Inspiration héroïque si vous ne l’avez pas.")],
    11: [F("Deux attaques supplémentaires", "Vous attaquez trois fois quand vous effectuez l’action d’Attaque.")],
    12: [ASI_TXT],
    13: [F("Attaques étudiées", "Quand vous ratez une attaque, vous avez l’avantage à votre prochaine attaque contre cette créature avant la fin de votre prochain tour.")],
    14: [ASI_TXT],
    15: [F("Critique supérieur (Champion)", "Vos attaques sont critiques sur 18, 19 ou 20.")],
    16: [ASI_TXT],
    17: [F("Fougue (2)", "Deux utilisations de Fougue par repos, une seule par tour.")],
    18: [F("Survivant (Champion)", "Avantage aux jets contre la mort. Quand vous êtes en péril (moitié des PV ou moins), vous regagnez 5 + mod. Con PV au début de chaque tour.")],
    19: [BOON_TXT],
    20: [F("Trois attaques supplémentaires", "Vous attaquez quatre fois quand vous effectuez l’action d’Attaque.")],
  },
  moine: {
    6: [F("Frappes surpuissantes", "Vos frappes à mains nues peuvent infliger des dégâts de force."), F("Plénitude du corps (Main ouverte)", "Par une action bonus, regagnez dé d’arts martiaux + mod. Sag PV. Utilisations = mod. Sag par repos long.")],
    7: [F("Dérobade", "Quand un effet permet un JS de Dextérité pour moitié des dégâts, vous n’en subissez aucun en cas de réussite, et la moitié en cas d’échec.")],
    8: [ASI_TXT],
    9: [F("Déplacement acrobatique", "Sans armure ni bouclier, vous pouvez courir sur les surfaces verticales et sur les liquides pendant votre déplacement.")],
    10: [F("Focalisation accrue", "Déluge de coups porte trois frappes ; Défense patiente et Pas du vent gagnent des bonus."), F("Restauration de soi", "À la fin de votre tour, vous mettez fin à l’état charmé, effrayé ou empoisonné. Pas de fatigue due à la faim ou la soif.")],
    11: [F("Pas fluide (Main ouverte)", "Après une action bonus autre que Pas du vent, vous pouvez utiliser Pas du vent immédiatement.")],
    12: [ASI_TXT],
    13: [F("Parade d’énergie", "Votre Parade des attaques fonctionne contre tous les types de dégâts d’attaque.")],
    14: [F("Survivant discipliné", "Maîtrise de tous les jets de sauvegarde. Relancez un JS raté pour 1 point de focalisation.")],
    15: [F("Focalisation parfaite", "À l’initiative, si vous avez 3 points ou moins, vous remontez à 4.")],
    16: [ASI_TXT],
    17: [F("Paume vibratoire (Main ouverte)", "Quand vous touchez, dépensez 4 points pour lancer des vibrations ; vous pouvez ensuite y mettre fin : JS de Constitution ou 10d12 dégâts de force (moitié si réussite).")],
    18: [F("Défense supérieure", "Dépensez 3 points pour gagner la résistance à tous les dégâts sauf de force pendant 1 minute.")],
    19: [BOON_TXT],
    20: [F("Corps et esprit", "Votre Dextérité et votre Sagesse augmentent de 4 (max 25).")],
  },
  paladin: {
    6: [F("Aura de protection", "Vous et vos alliés à 3 m ajoutez votre mod. de Charisme (min. +1) à vos jets de sauvegarde.")],
    7: [F("Aura de dévotion (Dévotion)", "Vous et vos alliés dans votre aura êtes immunisés contre l’état charmé.")],
    8: [ASI_TXT],
    9: [F("Abjuration des ennemis", "Conduit divin : des créatures de votre choix à 18 m font un JS de Sagesse ou sont effrayées et ne peuvent qu’agir ou se déplacer.")],
    10: [F("Aura de courage", "Vous et vos alliés dans votre aura êtes immunisés contre l’état effrayé.")],
    11: [F("Frappes radieuses", "Vos attaques au corps à corps avec une arme ou à mains nues infligent 1d8 dégâts radiants supplémentaires.")],
    12: [ASI_TXT],
    14: [F("Toucher restaurateur", "Quand vous utilisez Imposition des mains, vous pouvez aussi mettre fin à un état (aveuglé, charmé, assourdi, effrayé, paralysé, étourdi) pour 5 PV de la réserve.")],
    15: [F("Châtiment protecteur (Dévotion)", "Quand vous lancez Châtiment divin, vous et vos alliés dans l’aura bénéficiez d’un abri partiel jusqu’à votre prochain tour.")],
    16: [ASI_TXT],
    18: [F("Expansion d’aura", "Vos auras s’étendent à 9 m.")],
    19: [BOON_TXT],
    20: [F("Nimbe sacré (Dévotion)", "Par une action bonus, pendant 10 minutes : avantage aux JS contre fiélons et morts-vivants, et dégâts radiants de mod. Cha + maîtrise aux ennemis qui commencent leur tour dans l’aura.")],
  },
  rodeur: {
    6: [F("Vagabond", "Votre vitesse augmente de 3 m sans armure lourde, et vous gagnez une vitesse d’escalade et de nage égale à votre vitesse.")],
    7: [F("Tactiques défensives (Chasseur)", "Échapper à la horde (les attaques d’opportunité contre vous ont le désavantage) ou Défense contre les attaques multiples.")],
    8: [ASI_TXT],
    9: [F("Expertise", "Vous gagnez l’expertise dans deux compétences maîtrisées.")],
    10: [F("Infatigable", "Par une action Magie, gagnez 1d8 + mod. Sag PV temporaires (mod. Sag fois par repos long). Un repos court réduit votre épuisement de 1.")],
    11: [F("Proie supérieure (Chasseur)", "Quand vous infligez les dégâts de la Marque du chasseur, une autre créature à 9 m de la cible subit les mêmes dégâts.")],
    12: [ASI_TXT],
    13: [F("Chasseur implacable", "Les dégâts ne peuvent pas rompre votre concentration sur la Marque du chasseur.")],
    14: [F("Voile de la nature", "Par une action bonus, vous devenez invisible jusqu’à la fin de votre prochain tour. Utilisations = mod. Sag par repos long.")],
    15: [F("Défense supérieure (Chasseur)", "En réaction à des dégâts, vous gagnez la résistance à ce type de dégâts jusqu’à la fin du tour.")],
    16: [ASI_TXT],
    17: [F("Chasseur précis", "Avantage aux attaques contre la créature marquée par votre Marque du chasseur.")],
    18: [F("Sens sauvages", "Vous gagnez la vision aveugle sur 9 m.")],
    19: [BOON_TXT],
    20: [F("Tueur d’ennemis", "Le dé de dégâts de votre Marque du chasseur devient un d10.")],
  },
  roublard: {
    6: [F("Expertise", "Vous gagnez l’expertise dans deux compétences maîtrisées.")],
    7: [F("Talent fiable", "Quand vous faites un test avec une compétence ou un outil maîtrisé, un résultat de 9 ou moins sur le d20 compte comme un 10."), F("Dérobade", "Réussite à un JS de Dextérité pour moitié des dégâts : aucun dégât ; échec : moitié.")],
    8: [ASI_TXT],
    9: [F("Furtivité suprême (Voleur)", "Nouvelle option de Frappe rusée : Attaque furtive (1d6) — vous restez caché si vous l’étiez.")],
    10: [ASI_TXT],
    11: [F("Frappe rusée améliorée", "Vous pouvez utiliser deux effets de Frappe rusée par attaque sournoise.")],
    12: [ASI_TXT],
    13: [F("Utilisation d’objets magiques (Voleur)", "Vous pouvez vous lier à quatre objets magiques, ignorer leurs restrictions de classe, et utiliser les parchemins de sorts.")],
    14: [F("Frappes sournoises", "Nouvelles options de Frappe rusée : Hébéter (2d6), Assommer (6d6), Obscurcir (3d6).")],
    15: [F("Esprit fuyant", "Maîtrise des jets de sauvegarde de Sagesse et de Charisme.")],
    16: [ASI_TXT],
    17: [F("Réflexes de voleur (Voleur)", "Au premier round d’un combat, vous jouez deux tours : un à votre initiative, un autre à votre initiative - 10.")],
    18: [F("Insaisissable", "Aucun jet d’attaque n’a l’avantage contre vous tant que vous n’êtes pas neutralisé.")],
    19: [BOON_TXT],
    20: [F("Coup de chance", "Une fois par repos, quand vous ratez un test d20, vous pouvez obtenir 20 à la place.")],
  },
  ensorceleur: {
    6: [F("Affinité élémentaire (Draconique)", "Résistance au type de dégâts de votre ascendance draconique, et vous ajoutez votre mod. de Charisme aux dégâts de ce type infligés par vos sorts.")],
    7: [F("Incarnation ensorcelée", "Si vous n’avez plus de Sorcellerie innée, vous pouvez l’activer pour 2 points de sorcellerie. Pendant qu’elle est active, vous pouvez utiliser deux options de Métamagie par sort.")],
    8: [ASI_TXT],
    10: [F("Métamagie", "Vous choisissez deux options de Métamagie supplémentaires.")],
    12: [ASI_TXT],
    14: [F("Ailes de dragon (Draconique)", "Par une action bonus, des ailes vous donnent une vitesse de vol de 18 m pendant 1 heure. Une fois par repos long, ou pour 3 points de sorcellerie.")],
    16: [ASI_TXT],
    17: [F("Métamagie", "Vous choisissez deux options de Métamagie supplémentaires.")],
    18: [F("Compagnon draconique (Draconique)", "Vous pouvez invoquer un esprit de dragon sans composante matérielle, une fois par repos long sans emplacement.")],
    19: [BOON_TXT],
    20: [F("Apothéose arcanique", "Pendant votre Sorcellerie innée, une option de Métamagie par tour ne coûte aucun point.")],
  },
  occultiste: {
    6: [F("Chance du ténébreux (Fiélon)", "Ajoutez 1d10 à un test ou un JS que vous faites. Utilisations = mod. Cha (min. 1) par repos long.")],
    8: [ASI_TXT],
    9: [F("Contacter le protecteur", "Vous pouvez lancer Contact avec un autre plan sans emplacement pour joindre votre protecteur. Une fois par repos long.")],
    10: [F("Résilience fiélonne (Fiélon)", "Après un repos, choisissez un type de dégâts (sauf force) : vous y gagnez la résistance.")],
    11: [F("Arcanum mystique (niv. 6)", "Choisissez un sort d’occultiste de niveau 6 que vous lancez une fois par repos long sans emplacement.")],
    12: [ASI_TXT],
    13: [F("Arcanum mystique (niv. 7)", "Un sort de niveau 7, une fois par repos long.")],
    14: [F("Jeter en enfer (Fiélon)", "Une fois par tour, quand vous touchez, la cible fait un JS de Charisme ou traverse les plans inférieurs : 8d10 dégâts psychiques. Une fois par repos long.")],
    15: [F("Arcanum mystique (niv. 8)", "Un sort de niveau 8, une fois par repos long.")],
    16: [ASI_TXT],
    17: [F("Arcanum mystique (niv. 9)", "Un sort de niveau 9, une fois par repos long.")],
    19: [BOON_TXT],
    20: [F("Maître occulte", "Votre Astuce magique vous rend tous vos emplacements de pacte.")],
  },
  magicien: {
    6: [F("Sculpter les sorts (Évocateur)", "Quand vous lancez un sort d’évocation, des créatures de votre choix réussissent automatiquement leur JS et ne subissent aucun dégât.")],
    8: [ASI_TXT],
    10: [F("Évocation surpuissante (Évocateur)", "Ajoutez votre mod. d’Intelligence à un jet de dégâts de vos sorts d’évocation de magicien.")],
    12: [ASI_TXT],
    14: [F("Surcharge (Évocateur)", "Un sort de magicien de niveau 1 à 5 qui inflige des dégâts inflige le maximum. Les usages suivants avant un repos long vous infligent des dégâts nécrotiques.")],
    16: [ASI_TXT],
    18: [F("Maîtrise des sorts", "Choisissez un sort de niveau 1 et un sort de niveau 2 de votre grimoire : vous les lancez à volonté, à leur niveau de base.")],
    19: [BOON_TXT],
    20: [F("Sorts de prédilection", "Deux sorts de niveau 3 sont toujours préparés ; vous lancez chacun une fois sans emplacement par repos court ou long.")],
  },
};
for (const [k, lv] of Object.entries(HIGH)) Object.assign(CLASSES[k].feats, lv);
// L’amélioration du niveau 6 du guerrier et du 10 du roublard sont incluses ci-dessus.

/* Sorts de sous-classe et de terre de haut niveau */
Object.assign(CLASSES.clerc.sub.spells, { 7: ["protectionmort", "gardienfoi"], 9: ["restaurationsup", "soinsgroupe"] });
Object.assign(CLASSES.paladin.sub.spells, { 9: ["lueurespoir", "dissipation"], 13: ["libertemouvement", "gardienfoi"], 17: ["communion", "colonneflammes"] });
Object.assign(CLASSES.ensorceleur.sub.spells, { 7: ["oeilmagique"], 9: ["legende"] });
Object.assign(CLASSES.occultiste.sub.spells, { 7: ["bouclierfeu", "murdefeu"], 9: ["mission", "fleauinsectes"] });
Object.assign(CLASSES.barde, { always: { 20: ["motguerisonsup", "motmortel"] } });
Object.assign(LAND_SPELLS.aride.s, { 7: ["fletrissement"], 9: ["murpierre"] });
Object.assign(LAND_SPELLS.polaire.s, { 7: ["tempetegrele"], 9: ["conefroid"] });
Object.assign(LAND_SPELLS.temperee.s, { 7: ["libertemouvement"], 9: ["voyagearbres"] });
Object.assign(LAND_SPELLS.tropicale.s, { 7: ["metamorphose"], 9: ["fleauinsectes"] });

/* ---------- Sorts de niveau 4 à 9 ---------- */
const BR = ["barde"], CL = "clerc", DR = "druide", EN = "ensorceleur", OC = "occultiste", MA = "magicien", PA = "paladin", RO = "rodeur", BA = "barde";
Object.assign(SPELLS, {
  // Niveau 4
  bannissement: { n: "Bannissement", l: 4, e: "abj", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: [CL, PA, EN, OC, MA], sv: "cha", d: "JS de Charisme ou la créature est envoyée dans un demi-plan inoffensif. Si elle est originaire d’un autre plan et que le sort dure 1 minute, elle y retourne définitivement." },
  fletrissement: { n: "Flétrissement", l: 4, e: "nec", t: A, p: "9 m", c: "V, S", du: "Instantanée", cl: [DR, EN, OC, MA], sv: "con", dmg: "8d8", ty: "necro", up: "+1d8 par niveau", d: "JS de Constitution : 8d8 dégâts nécrotiques (moitié si réussite). Les plantes ont le désavantage et subissent le maximum." },
  confusion: { n: "Confusion", l: 4, e: "enc", t: A, p: "27 m", c: "V, S, M", du: "1 minute", co: true, cl: [BA, DR, EN, MA], sv: "sag", d: "Les créatures d’une sphère de 3 m font un JS de Sagesse ou agissent au hasard (d10 chaque tour)." },
  portedimensionnelle: { n: "Porte dimensionnelle", l: 4, e: "inv", t: A, p: "150 m", c: "V", du: "Instantanée", cl: [BA, EN, OC, MA], d: "Vous vous téléportez jusqu’à 150 m, avec une créature consentante à 1,50 m de vous." },
  libertemouvement: { n: "Liberté de mouvement", l: 4, e: "abj", t: A, p: "Contact", c: "V, S, M", du: "1 heure", cl: [BA, CL, DR, RO], d: "Le terrain difficile et la magie ne réduisent pas la vitesse de la créature, ni ne la paralysent ou l’entravent." },
  invisibilitesup: { n: "Invisibilité supérieure", l: 4, e: "ill", t: A, p: "Contact", c: "V, S", du: "1 minute", co: true, cl: [BA, EN, MA], d: "La créature devient invisible, même quand elle attaque ou lance des sorts." },
  tempetegrele: { n: "Tempête de grêle", l: 4, e: "evo", t: A, p: "90 m", c: "V, S, M", du: "Instantanée", cl: [DR, EN, MA], sv: "dex", dmg: "2d10+4d6", ty: "froid", up: "+1d10 contondants par niveau", d: "Un cylindre de 6 m de rayon : JS de Dextérité, 2d10 contondants + 4d6 froid (moitié si réussite). Le sol devient terrain difficile." },
  murdefeu: { n: "Mur de feu", l: 4, e: "evo", t: A, p: "36 m", c: "V, S, M", du: "1 minute", co: true, cl: [DR, EN, MA], sv: "dex", dmg: "5d8", ty: "feu", up: "+1d8 par niveau", d: "Un mur de flammes de 18 m de long : JS de Dextérité à l’apparition, 5d8 dégâts de feu. Un côté brûle les créatures qui y finissent leur tour." },
  peaupierre: { n: "Peau de pierre", l: 4, e: "tra", t: A, p: "Contact", c: "V, S, M", du: "1 heure", co: true, cl: [DR, RO, EN, MA], d: "Résistance aux dégâts contondants, perforants et tranchants. Consomme 100 po de poussière de diamant." },
  gardienfoi: { n: "Gardien de la foi", l: 4, e: "inv", t: A, p: "9 m", c: "V", du: "8 heures", cl: [CL], sv: "dex", dmg: "20", ty: "radiant", d: "Un gardien spectral : un ennemi qui arrive à 3 m fait un JS de Dextérité et subit 20 dégâts radiants (moitié si réussite). Disparaît après 60 dégâts." },
  metamorphose: { n: "Métamorphose", l: 4, e: "tra", t: A, p: "18 m", c: "V, S, M", du: "1 heure", co: true, cl: [BA, DR, EN, MA], sv: "sag", d: "JS de Sagesse ou la créature devient une bête de FP inférieur ou égal au sien, avec des PV temporaires égaux aux PV de la bête." },
  oeilmagique: { n: "Œil magique", l: 4, e: "div", t: A, p: "9 m", c: "V, S, M", du: "1 heure", co: true, cl: [MA], d: "Un œil invisible se déplace à 9 m par round et vous transmet ce qu’il voit, avec vision dans le noir." },
  bouclierfeu: { n: "Bouclier de feu", l: 4, e: "evo", t: AB_, p: "Personnelle", c: "V, S, M", du: "10 minutes", cl: [DR, EN, MA], dmg: "2d8", ty: "feu", d: "Flammes chaudes (résistance au froid) ou froides (résistance au feu). Qui vous touche au corps à corps subit 2d8 dégâts." },
  tentacules: { n: "Tentacules noirs", l: 4, e: "inv", t: A, p: "27 m", c: "V, S, M", du: "1 minute", co: true, cl: [MA], sv: "for", dmg: "3d6", ty: "contondant", d: "Des tentacules couvrent un carré de 6 m : JS de Force ou 3d6 dégâts contondants et entravé." },
  protectionmort: { n: "Protection contre la mort", l: 4, e: "abj", t: A, p: "Contact", c: "V, S", du: "8 heures", cl: [CL, PA], d: "La première fois que la créature tomberait à 0 PV, elle passe à 1 PV à la place." },
  divination: { n: "Divination", l: 4, e: "div", t: A, p: "Personnelle", c: "V, S, M", du: "Instantanée", ri: true, cl: [CL, DR, MA], d: "Vous posez une question sur un événement des 7 prochains jours et recevez une réponse véridique." },
  controleeau: { n: "Contrôle de l’eau", l: 4, e: "tra", t: A, p: "90 m", c: "V, S, M", du: "10 minutes", co: true, cl: [CL, DR, MA], d: "Inondation, séparation des eaux, redirection d’un courant ou tourbillon dans un cube de 30 m." },
  faconnagepierre: { n: "Façonnage de la pierre", l: 4, e: "tra", t: A, p: "Contact", c: "V, S, M", du: "Instantanée", cl: [CL, DR, MA], d: "Vous modelez un morceau de pierre de taille moyenne selon la forme voulue." },
  assassinimaginaire: { n: "Assassin imaginaire", l: 4, e: "ill", t: A, p: "36 m", c: "V, S", du: "1 minute", co: true, cl: [BA, MA], sv: "sag", dmg: "4d10", ty: "psy", up: "+1d10 par niveau", d: "JS de Sagesse ou 4d10 dégâts psychiques et désavantage aux tests d20. Elle refait le JS à chaque tour." },
  localisercreature: { n: "Localiser une créature", l: 4, e: "div", t: A, p: "Personnelle", c: "V, S, M", du: "1 heure", co: true, cl: [BA, CL, DR, PA, RO, MA], d: "Vous sentez la direction d’une créature connue à 300 m ou moins." },
  spherresiliente: { n: "Sphère résiliente", l: 4, e: "abj", t: A, p: "9 m", c: "V, S, M", du: "1 minute", co: true, cl: [MA], sv: "dex", d: "Une sphère de force enferme une créature : rien ne peut entrer ni sortir." },
  auravie: { n: "Aura de vie", l: 4, e: "abj", t: A, p: "Personnelle", c: "V", du: "10 minutes", co: true, cl: [CL, PA], d: "Aura de 9 m : résistance aux dégâts nécrotiques, PV max non réduits, et un allié à 0 PV regagne 1 PV au début de son tour." },
  // Niveau 5
  fleauinsectes: { n: "Fléau d’insectes", l: 5, e: "inv", t: A, p: "90 m", c: "V, S, M", du: "10 minutes", co: true, cl: [CL, DR, EN], sv: "con", dmg: "4d10", ty: "perforant", up: "+1d10 par niveau", d: "Une nuée de 6 m de rayon : JS de Constitution, 4d10 dégâts perforants (moitié si réussite)." },
  conefroid: { n: "Cône de froid", l: 5, e: "evo", t: A, p: "Cône de 18 m", c: "V, S, M", du: "Instantanée", cl: [DR, EN, MA], sv: "con", dmg: "8d8", ty: "froid", up: "+1d8 par niveau", d: "JS de Constitution : 8d8 dégâts de froid (moitié si réussite)." },
  colonneflammes: { n: "Colonne de flamme", l: 5, e: "evo", t: A, p: "18 m", c: "V, S, M", du: "Instantanée", cl: [CL], sv: "dex", dmg: "5d6+5d6", ty: "feu", up: "+1d6 par niveau", d: "Un cylindre de 3 m de rayon : JS de Dextérité, 5d6 feu + 5d6 radiants (moitié si réussite)." },
  soinsgroupe: { n: "Soins de groupe", l: 5, e: "abj", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: [BA, CL, DR], heal: "5d8", up: "+1d8 par niveau", d: "Jusqu’à six créatures dans une sphère de 9 m regagnent 5d8 + votre mod. d’incantation PV." },
  rappelvie: { n: "Rappel à la vie", l: 5, e: "nec", t: "1 heure", p: "Contact", c: "V, S, M", du: "Instantanée", cl: [BA, CL, PA], d: "Une créature morte depuis moins de 10 jours revient avec 1 PV et un malus de -4 qui diminue à chaque repos long. Consomme un diamant de 500 po." },
  immobilisationmonstre: { n: "Immobilisation de monstre", l: 5, e: "enc", t: A, p: "27 m", c: "V, S, M", du: "1 minute", co: true, cl: [BA, EN, OC, MA], sv: "sag", d: "JS de Sagesse ou n’importe quelle créature est paralysée. Elle refait le JS à chaque tour." },
  dominationpersonne: { n: "Domination de personne", l: 5, e: "enc", t: A, p: "18 m", c: "V, S", du: "1 minute", co: true, cl: [BA, EN, MA], sv: "sag", d: "JS de Sagesse ou un humanoïde est charmé et suit vos ordres télépathiques." },
  murpierre: { n: "Mur de pierre", l: 5, e: "evo", t: A, p: "36 m", c: "V, S, M", du: "10 minutes", co: true, cl: [DR, EN, MA], d: "Un mur de pierre de dix panneaux de 3 m. Permanent si la concentration est maintenue toute la durée." },
  murforce: { n: "Mur de force", l: 5, e: "evo", t: A, p: "36 m", c: "V, S, M", du: "10 minutes", co: true, cl: [MA], d: "Un mur invisible et indestructible que rien ne peut traverser physiquement." },
  scrutation: { n: "Scrutation", l: 5, e: "div", t: "10 minutes", p: "Personnelle", c: "V, S, M", du: "10 minutes", co: true, cl: [BA, CL, DR, OC, MA], sv: "sag", d: "Vous voyez et entendez une créature sur le même plan (JS de Sagesse modifié par votre connaissance d’elle)." },
  communion: { n: "Communion", l: 5, e: "div", t: "1 minute", p: "Personnelle", c: "V, S, M", du: "1 minute", ri: true, cl: [CL], d: "Vous posez jusqu’à trois questions fermées à votre divinité." },
  comnature: { n: "Communion avec la nature", l: 5, e: "div", t: "1 minute", p: "Personnelle", c: "V, S", du: "Instantanée", ri: true, cl: [DR, RO], d: "Vous apprenez trois faits sur le terrain environnant (5 km en extérieur)." },
  restaurationsup: { n: "Restauration supérieure", l: 5, e: "abj", t: A, p: "Contact", c: "V, S, M", du: "Instantanée", cl: [BA, CL, DR, PA, RO], d: "Retire un niveau d’épuisement, l’état charmé ou pétrifié, une malédiction, une réduction de caractéristique ou de PV max." },
  nuagemortel: { n: "Nuage mortel", l: 5, e: "inv", t: A, p: "36 m", c: "V, S", du: "10 minutes", co: true, cl: [EN, MA], sv: "con", dmg: "5d8", ty: "poison", up: "+1d8 par niveau", d: "Un nuage de 6 m de rayon qui s’éloigne de vous : JS de Constitution, 5d8 dégâts de poison (moitié si réussite)." },
  mainarcanique: { n: "Main arcanique", l: 5, e: "evo", t: A, p: "36 m", c: "V, S, M", du: "1 minute", co: true, cl: [EN, MA], atk: "cac", dmg: "5d8", ty: "force", up: "+2d8 par niveau", d: "Une grande main de force : poing (5d8 force), bousculade, empoignade ou protection." },
  telekinesie: { n: "Télékinésie", l: 5, e: "tra", t: A, p: "18 m", c: "V, S", du: "10 minutes", co: true, cl: [EN, MA], sv: "for", d: "Vous déplacez par la pensée une créature (JS de Force) ou un objet jusqu’à 500 kg." },
  modifmemoire: { n: "Modification de mémoire", l: 5, e: "enc", t: A, p: "9 m", c: "V, S", du: "1 minute", co: true, cl: [BA, MA], sv: "sag", d: "JS de Sagesse ou vous modifiez ou effacez jusqu’à 10 minutes de souvenirs des dernières 24 heures." },
  passemuraille: { n: "Passe-muraille", l: 5, e: "tra", t: A, p: "9 m", c: "V, S, M", du: "1 heure", cl: [MA], d: "Un passage de 1,50 m sur 2,40 m s’ouvre dans un mur de bois, plâtre ou pierre." },
  cercleteleport: { n: "Cercle de téléportation", l: 5, e: "inv", t: "1 minute", p: "3 m", c: "V, M", du: "1 round", cl: [BA, EN, MA], d: "Un portail relie un cercle permanent dont vous connaissez la séquence de sigils." },
  eveil: { n: "Éveil", l: 5, e: "tra", t: "8 heures", p: "Contact", c: "V, S, M", du: "Instantanée", cl: [BA, DR], d: "Une bête ou une plante gagne une Intelligence de 10 et la parole, et est charmée par vous pendant 30 jours." },
  dissipationmal: { n: "Dissipation du mal et du bien", l: 5, e: "abj", t: A, p: "Personnelle", c: "V, S, M", du: "1 minute", co: true, cl: [CL, PA], d: "Les célestes, élémentaires, fées, fiélons et morts-vivants ont le désavantage pour vous attaquer ; vous pouvez rompre un enchantement ou les renvoyer." },
  reve: { n: "Rêve", l: 5, e: "ill", t: "1 minute", p: "Spéciale", c: "V, S, M", du: "8 heures", cl: [BA, OC, MA], sv: "sag", d: "Vous façonnez les rêves d’une créature connue pour lui transmettre un message, ou un cauchemar (3d6 psychiques)." },
  similitude: { n: "Similitude", l: 5, e: "ill", t: A, p: "9 m", c: "V, S", du: "8 heures", cl: [BA, EN, MA], sv: "cha", d: "Vous changez l’apparence de créatures que vous voyez (JS de Charisme si non consentantes)." },
  vaguedestructrice: { n: "Vague destructrice", l: 5, e: "evo", t: A, p: "Personnelle", c: "V", du: "Instantanée", cl: [PA], sv: "con", dmg: "5d6+5d6", ty: "tonnerre", d: "Une onde de 9 m : JS de Constitution, 5d6 tonnerre + 5d6 radiants ou nécrotiques et à terre (moitié si réussite)." },
  invocationelementaire: { n: "Invocation d’élémentaire", l: 5, e: "inv", t: A, p: "18 m", c: "V, S", du: "10 minutes", co: true, cl: [DR, MA], sv: "dex", dmg: "8d8", ty: "force", d: "Un esprit élémentaire occupe un cube de 3 m : les créatures qui y entrent font un JS de Dextérité, 8d8 dégâts du type de l’élément, et peuvent être entravées." },
  animerobjets: { n: "Animation d’objets", l: 5, e: "tra", t: A, p: "36 m", c: "V, S", du: "1 minute", co: true, cl: [BA, EN, MA], d: "Des objets non tenus prennent vie et attaquent sur votre ordre (action bonus)." },
  mission: { n: "Mission", l: 5, e: "enc", t: "1 minute", p: "18 m", c: "V", du: "30 jours", cl: [BA, CL, DR, PA, MA], sv: "sag", d: "JS de Sagesse ou la créature doit accomplir une tâche, sous peine de 5d10 dégâts psychiques par jour." },
  legende: { n: "Légende", l: 5, e: "div", t: "10 minutes", p: "Personnelle", c: "V, S, M", du: "Instantanée", cl: [BA, CL, MA], d: "Vous apprenez les légendes importantes sur une personne, un lieu ou un objet." },
  voyagearbres: { n: "Voyage par les arbres", l: 5, e: "inv", t: A, p: "Personnelle", c: "V, S", du: "1 minute", co: true, cl: [DR, RO], d: "Vous entrez dans un arbre et ressortez d’un autre de même espèce à 150 m ou moins." },
  // Niveau 6
  desintegration: { n: "Désintégration", l: 6, e: "tra", t: A, p: "18 m", c: "V, S, M", du: "Instantanée", cl: [EN, MA], sv: "dex", dmg: "10d6+40", ty: "force", up: "+3d6 par niveau", d: "Un rayon vert : JS de Dextérité ou 10d6 + 40 dégâts de force. Une créature réduite à 0 PV est réduite en poussière." },
  chaineeclairs: { n: "Chaîne d’éclairs", l: 6, e: "evo", t: A, p: "45 m", c: "V, S, M", du: "Instantanée", cl: [EN, MA], sv: "dex", dmg: "10d8", ty: "foudre", up: "+1 cible par niveau", d: "Un éclair frappe une cible puis jusqu’à trois autres : JS de Dextérité, 10d8 dégâts de foudre (moitié si réussite)." },
  guerison: { n: "Guérison", l: 6, e: "abj", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: [CL, DR], heal: "70", up: "+10 PV par niveau", d: "La créature regagne 70 PV et est guérie de la cécité, de la surdité et de l’état empoisonné." },
  miseamal: { n: "Mise à mal", l: 6, e: "nec", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: [CL], sv: "con", dmg: "14d6", ty: "necro", d: "JS de Constitution : 14d6 dégâts nécrotiques (moitié si réussite). Ses PV max baissent d’autant." },
  globeinvulnerabilite: { n: "Globe d’invulnérabilité", l: 6, e: "abj", t: A, p: "Personnelle", c: "V, S, M", du: "1 minute", co: true, cl: [EN, MA], d: "Une barrière de 3 m : les sorts de niveau 5 ou moins lancés de l’extérieur n’y ont aucun effet." },
  cerclemort: { n: "Cercle de mort", l: 6, e: "nec", t: A, p: "45 m", c: "V, S, M", du: "Instantanée", cl: [EN, OC, MA], sv: "con", dmg: "8d8", ty: "necro", up: "+2d8 par niveau", d: "Une sphère de 18 m de rayon : JS de Constitution, 8d8 dégâts nécrotiques (moitié si réussite)." },
  festinheros: { n: "Festin des héros", l: 6, e: "inv", t: "10 minutes", p: "Contact", c: "V, S, M", du: "Instantanée", cl: [BA, CL, DR], d: "Jusqu’à douze convives : +2d10 PV max, immunité contre la peur et le poison pendant 24 heures." },
  murglace: { n: "Mur de glace", l: 6, e: "evo", t: A, p: "36 m", c: "V, S, M", du: "10 minutes", co: true, cl: [MA], sv: "dex", dmg: "10d6", ty: "froid", d: "Un mur de glace ; les créatures dans sa zone d’apparition font un JS de Dextérité, 10d6 dégâts de froid." },
  suggestiongroupe: { n: "Suggestion de groupe", l: 6, e: "enc", t: A, p: "18 m", c: "V, M", du: "24 heures", cl: [BA, EN, OC, MA], sv: "sag", d: "Jusqu’à douze créatures font un JS de Sagesse ou suivent une suggestion raisonnable." },
  visionsupreme: { n: "Vision suprême", l: 6, e: "div", t: A, p: "Contact", c: "V, S, M", du: "1 heure", cl: [BA, CL, EN, OC, MA], d: "La créature gagne la vision véritable sur 36 m." },
  barrierelames: { n: "Barrière de lames", l: 6, e: "evo", t: A, p: "27 m", c: "V, S", du: "10 minutes", co: true, cl: [CL], sv: "dex", dmg: "6d10", ty: "force", d: "Un mur de lames tourbillonnantes : JS de Dextérité, 6d10 dégâts de force pour qui y entre." },
  rayonsoleil: { n: "Rayon de soleil", l: 6, e: "evo", t: A, p: "Ligne de 18 m", c: "V, S, M", du: "1 minute", co: true, cl: [CL, DR, EN, MA], sv: "con", dmg: "6d8", ty: "radiant", d: "Une ligne de lumière : JS de Constitution, 6d8 dégâts radiants et aveuglé (moitié si réussite). Répétable à chaque tour." },
  danseirresistible: { n: "Danse irrésistible", l: 6, e: "enc", t: A, p: "9 m", c: "V", du: "1 minute", co: true, cl: [BA, MA], sv: "sag", d: "JS de Sagesse ou la créature danse : désavantage aux JS de Dex et attaques, avantage pour l’attaquer." },
  rappelsacre: { n: "Rappel", l: 6, e: "inv", t: A, p: "1,50 m", c: "V", du: "Instantanée", cl: [CL], d: "Vous et jusqu’à cinq créatures êtes téléportés vers un sanctuaire préparé." },
  quete: { n: "Quête du chemin", l: 6, e: "div", t: "1 minute", p: "Personnelle", c: "V, S, M", du: "1 jour", co: true, cl: [BA, CL, DR], d: "Vous connaissez l’itinéraire le plus direct vers un lieu fixe sur le même plan." },
  oeildumal: { n: "Mauvais œil", l: 6, e: "nec", t: A, p: "Personnelle", c: "V, S", du: "1 minute", co: true, cl: [BA, EN, OC, MA], sv: "sag", d: "À chaque tour, une créature à 18 m fait un JS de Sagesse ou est endormie, paniquée ou malade." },
  creationmortvivant: { n: "Création de mort-vivant", l: 6, e: "nec", t: "1 minute", p: "3 m", c: "V, S, M", du: "Instantanée", cl: [CL, OC, MA], d: "De nuit, jusqu’à trois cadavres deviennent des goules sous votre contrôle." },
  chairpierre: { n: "Chair en pierre", l: 6, e: "tra", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: [EN, OC, MA], sv: "con", d: "JS de Constitution répétés : après trois échecs, la créature est pétrifiée." },
  // Niveau 7
  doigtmort: { n: "Doigt de mort", l: 7, e: "nec", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: [EN, OC, MA], sv: "con", dmg: "7d8+30", ty: "necro", d: "JS de Constitution : 7d8 + 30 dégâts nécrotiques (moitié si réussite). Un humanoïde tué devient un zombi." },
  bouleretardement: { n: "Boule de feu à retardement", l: 7, e: "evo", t: A, p: "45 m", c: "V, S, M", du: "1 minute", co: true, cl: [EN, MA], sv: "dex", dmg: "12d6", ty: "feu", up: "+1d6 par niveau", d: "Une perle de feu qui gagne 1d6 par round d’attente, puis explose : JS de Dextérité, 12d6 dégâts de feu ou plus." },
  teleportation: { n: "Téléportation", l: 7, e: "inv", t: A, p: "3 m", c: "V", du: "Instantanée", cl: [BA, EN, MA], d: "Vous et jusqu’à huit créatures êtes transportés vers une destination connue sur le même plan." },
  changementplan: { n: "Changement de plan", l: 7, e: "inv", t: A, p: "Contact", c: "V, S, M", du: "Instantanée", cl: [CL, DR, EN, OC, MA], sv: "cha", d: "Vous et jusqu’à huit créatures voyagez vers un autre plan, ou vous bannissez une créature (JS de Charisme)." },
  regeneration: { n: "Régénération", l: 7, e: "tra", t: "1 minute", p: "Contact", c: "V, S, M", du: "1 heure", cl: [BA, CL, DR], heal: "4d8+15", d: "La créature regagne 4d8 + 15 PV, puis 1 PV par tour, et ses membres repoussent." },
  resurrection: { n: "Résurrection", l: 7, e: "nec", t: "1 heure", p: "Contact", c: "V, S, M", du: "Instantanée", cl: [BA, CL], d: "Une créature morte depuis moins d’un siècle revient à la vie avec tous ses PV. Consomme un diamant de 1 000 po." },
  rayonsprismatiques: { n: "Rayons prismatiques", l: 7, e: "evo", t: A, p: "Cône de 18 m", c: "V, S", du: "Instantanée", cl: [BA, EN, MA], sv: "dex", dmg: "12d6", ty: "force", d: "Huit rayons multicolores : chaque créature fait un JS de Dextérité et subit 12d6 dégâts d’un type aléatoire, ou un effet." },
  inversiongravite: { n: "Inversion de la gravité", l: 7, e: "tra", t: A, p: "30 m", c: "V, S, M", du: "1 minute", co: true, cl: [DR, EN, MA], sv: "dex", d: "Dans un cylindre de 15 m, la gravité s’inverse et les créatures tombent vers le haut." },
  formeetheree: { n: "Forme éthérée", l: 7, e: "inv", t: A, p: "Personnelle", c: "V, S", du: "8 heures", cl: [BA, CL, EN, OC, MA], d: "Vous passez dans le plan éthéré, d’où vous voyez le plan matériel sans pouvoir l’affecter." },
  tempetefeu: { n: "Tempête de feu", l: 7, e: "evo", t: A, p: "45 m", c: "V, S", du: "Instantanée", cl: [CL, DR, EN], sv: "dex", dmg: "7d10", ty: "feu", d: "Dix cubes de 3 m de flammes : JS de Dextérité, 7d10 dégâts de feu (moitié si réussite)." },
  symbole: { n: "Symbole", l: 7, e: "abj", t: "1 minute", p: "Contact", c: "V, S, M", du: "Jusqu’à déclenchement", cl: [BA, CL, DR, MA], d: "Un glyphe qui libère un effet (mort, sommeil, terreur, folie…) quand il est déclenché." },
  epeearcanique: { n: "Épée arcanique", l: 7, e: "evo", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: [BA, MA], atk: "cac", dmg: "4d12", ty: "force", d: "Une épée de force : attaque de sort au corps à corps, 4d12 + mod. d’incantation dégâts de force." },
  projectionimage: { n: "Projection d’image", l: 7, e: "ill", t: A, p: "800 km", c: "V, S, M", du: "1 jour", co: true, cl: [BA, MA], d: "Un double illusoire à travers lequel vous voyez, entendez et lancez des sorts." },
  paroledivine: { n: "Parole divine", l: 7, e: "evo", t: AB_, p: "9 m", c: "V", du: "Instantanée", cl: [CL], sv: "cha", d: "JS de Charisme : selon leurs PV restants, les créatures sont assourdies, aveuglées, étourdies ou tuées." },
  cageforce: { n: "Cage de force", l: 7, e: "evo", t: A, p: "30 m", c: "V, S, M", du: "1 heure", co: true, cl: [BA, OC, MA], d: "Une prison de force invisible enferme une zone ; la téléportation pour en sortir exige un JS de Charisme." },
  // Niveau 8
  espritfaible: { n: "Esprit faible", l: 8, e: "enc", t: A, p: "45 m", c: "V, S, M", du: "Instantanée", cl: [BA, DR, OC, MA], sv: "int", dmg: "10d6", ty: "psy", d: "JS d’Intelligence : 10d6 dégâts psychiques ; en cas d’échec, Intelligence et Charisme tombent à 1." },
  dominationmonstre: { n: "Domination de monstre", l: 8, e: "enc", t: A, p: "18 m", c: "V, S", du: "1 heure", co: true, cl: [BA, EN, OC, MA], sv: "sag", d: "JS de Sagesse ou n’importe quelle créature est charmée et obéit à vos ordres." },
  tremblementterre: { n: "Tremblement de terre", l: 8, e: "tra", t: A, p: "150 m", c: "V, S, M", du: "1 minute", co: true, cl: [CL, DR, EN], sv: "dex", d: "La terre tremble dans un cercle de 30 m : chutes, fissures, effondrements." },
  motetourdissant: { n: "Mot de pouvoir étourdissant", l: 8, e: "enc", t: A, p: "18 m", c: "V", du: "Instantanée", cl: [BA, EN, OC, MA], d: "Une créature de 150 PV ou moins est étourdie (JS de Constitution à chaque tour). Au-delà, sa vitesse tombe à 0." },
  nuageincendiaire: { n: "Nuage incendiaire", l: 8, e: "inv", t: A, p: "45 m", c: "V, S", du: "1 minute", co: true, cl: [EN, MA], sv: "dex", dmg: "10d8", ty: "feu", d: "Un nuage de braises de 6 m de rayon qui se déplace : JS de Dextérité, 10d8 dégâts de feu." },
  eclatsoleil: { n: "Éclat du soleil", l: 8, e: "evo", t: A, p: "45 m", c: "V, S, M", du: "Instantanée", cl: [CL, DR, EN, MA], sv: "con", dmg: "12d6", ty: "radiant", d: "Une sphère de 18 m de rayon : JS de Constitution, 12d6 dégâts radiants et aveuglé (moitié si réussite)." },
  aurasacree: { n: "Aura sacrée", l: 8, e: "abj", t: A, p: "Personnelle", c: "V, S, M", du: "1 minute", co: true, cl: [CL], d: "Vos alliés à 9 m ont l’avantage aux JS et les attaques contre eux ont le désavantage." },
  labyrinthe: { n: "Labyrinthe", l: 8, e: "inv", t: A, p: "18 m", c: "V, S", du: "10 minutes", co: true, cl: [MA], d: "Une créature est bannie dans un demi-plan labyrinthique (test d’Intelligence DD 20 pour s’échapper)." },
  espritimpenetrable: { n: "Esprit impénétrable", l: 8, e: "abj", t: A, p: "Contact", c: "V, S", du: "24 heures", cl: [BA, MA], d: "Immunité contre les dégâts psychiques, l’état charmé, la divination et la lecture des pensées." },
  controleclimat: { n: "Contrôle du climat", l: 8, e: "tra", t: "10 minutes", p: "Personnelle", c: "V, S, M", du: "8 heures", co: true, cl: [CL, DR, MA], d: "Vous modifiez la météo dans un rayon de 8 km." },
  antimagie: { n: "Champ antimagie", l: 8, e: "abj", t: A, p: "Personnelle", c: "V, S, M", du: "1 heure", co: true, cl: [CL, MA], d: "Une sphère de 3 m autour de vous où la magie ne fonctionne pas." },
  demiplan: { n: "Demi-plan", l: 8, e: "inv", t: A, p: "18 m", c: "S", du: "1 heure", cl: [OC, MA], d: "Une porte s’ouvre sur une pièce vide de 9 m de côté, dans un demi-plan." },
  formesanimales: { n: "Formes animales", l: 8, e: "tra", t: A, p: "9 m", c: "V, S", du: "24 heures", cl: [DR], d: "Des créatures consentantes se transforment en bêtes de FP 4 ou moins." },
  // Niveau 9
  souhait: { n: "Souhait", l: 9, e: "inv", t: A, p: "Personnelle", c: "V", du: "Instantanée", cl: [EN, MA], d: "Le sort le plus puissant : reproduire un sort de niveau 8 ou moins, ou modifier la réalité, avec des risques." },
  arrettemps: { n: "Arrêt du temps", l: 9, e: "tra", t: A, p: "Personnelle", c: "V", du: "Instantanée", cl: [EN, MA], d: "Le temps s’arrête pour tous sauf vous : 1d4 + 1 tours d’affilée." },
  pluiemeteores: { n: "Pluie de météores", l: 9, e: "evo", t: A, p: "1,5 km", c: "V, S", du: "Instantanée", cl: [EN, MA], sv: "dex", dmg: "20d6+20d6", ty: "feu", d: "Quatre sphères de 12 m : JS de Dextérité, 20d6 feu + 20d6 contondants (moitié si réussite)." },
  motmortel: { n: "Mot de pouvoir mortel", l: 9, e: "enc", t: A, p: "18 m", c: "V", du: "Instantanée", cl: [BA, EN, OC, MA], dmg: "12d12", ty: "psy", d: "Une créature de 100 PV ou moins meurt. Sinon, elle subit 12d12 dégâts psychiques." },
  motguerisonsup: { n: "Mot de guérison suprême", l: 9, e: "enc", t: A, p: "18 m", c: "V", du: "Instantanée", cl: [BA, CL], d: "La créature regagne tous ses PV et se libère des états charmé, effrayé, paralysé, empoisonné et étourdi." },
  resurrectionsup: { n: "Résurrection suprême", l: 9, e: "nec", t: "1 heure", p: "Contact", c: "V, S, M", du: "Instantanée", cl: [CL, DR], d: "Une créature morte depuis moins de 200 ans revient avec tous ses PV, même sans corps. Diamant de 25 000 po." },
  portail: { n: "Portail", l: 9, e: "inv", t: A, p: "18 m", c: "V, S, M", du: "1 minute", co: true, cl: [CL, EN, MA], d: "Un portail relie un autre plan ; vous pouvez y attirer une créature nommée." },
  premonition: { n: "Prémonition", l: 9, e: "div", t: "1 minute", p: "Contact", c: "V, S, M", du: "8 heures", cl: [BA, DR, OC, MA], d: "Avantage aux tests d20 et désavantage aux attaques contre la créature pendant la durée." },
  metamorphosesup: { n: "Métamorphose suprême", l: 9, e: "tra", t: A, p: "9 m", c: "V, S, M", du: "1 heure", co: true, cl: [BA, OC, MA], sv: "sag", d: "Une créature ou un objet se transforme en autre créature ou objet ; permanent si la concentration est maintenue 1 heure." },
  projectionastrale: { n: "Projection astrale", l: 9, e: "nec", t: "1 heure", p: "3 m", c: "V, S, M", du: "Spéciale", cl: [CL, OC, MA], d: "Vous et jusqu’à huit compagnons projetez votre forme astrale dans le plan astral." },
  changementforme: { n: "Changement de forme", l: 9, e: "tra", t: A, p: "Personnelle", c: "V, S, M", du: "1 heure", co: true, cl: [DR, MA], d: "Vous prenez la forme d’une créature de FP égal ou inférieur à votre niveau, et pouvez en changer à chaque tour." },
  tempetevengeresse: { n: "Tempête vengeresse", l: 9, e: "inv", t: A, p: "Vue", c: "V, S", du: "1 minute", co: true, cl: [DR], sv: "con", d: "Un orage de 90 m de rayon : tonnerre, pluie acide, foudre, grêle et vent glacial au fil des rounds." },
  murprismatique: { n: "Mur prismatique", l: 9, e: "abj", t: A, p: "18 m", c: "V, S", du: "10 minutes", cl: [MA], d: "Un mur de sept couches colorées, chacune avec son effet destructeur." },
  emprisonnement: { n: "Emprisonnement", l: 9, e: "abj", t: "1 minute", p: "9 m", c: "V, S, M", du: "Jusqu’à dissipation", cl: [OC, MA], sv: "sag", d: "JS de Sagesse ou la créature est emprisonnée de la façon choisie (enchaînement, sommeil, minuscule…)." },
  guerisongroupe: { n: "Guérison de groupe", l: 9, e: "abj", t: A, p: "18 m", c: "V, S", du: "Instantanée", cl: [CL], heal: "700", d: "Vous répartissez jusqu’à 700 PV entre des créatures que vous voyez, qui sont aussi guéries de plusieurs maux." },
});
