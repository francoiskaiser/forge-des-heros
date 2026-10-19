/* Génère src/data3.js (sorts SRD 5.2 manquants, résumés en français) et tools/en/data6.json (noms et résumés anglais).
   Source des règles : SRD 5.2, Wizards of the Coast LLC, CC-BY-4.0. */
const fs = require("fs");
const path = require("path");
const CLS = { bar: "barde", cle: "clerc", dru: "druide", sor: "ensorceleur", war: "occultiste", wiz: "magicien", pal: "paladin", ran: "rodeur" };
const A = "1 action", B = "1 action bonus", SM = "Action bonus après avoir touché", P = "Personnelle", T = "Contact", I = "Instantanée", D = "Jusqu’à dissipation";
const out = [];
/* S(id, niveau, école, temps, portée, composantes, durée, "CR", "classes", extra, nom fr, nom en, résumé fr, résumé en) */
function S(id, l, e, t, p, c, du, fl, cl, x, n, en, d, de) {
  out.push({ id, o: { n, l, e, t, p, c, du, ...(fl.includes("C") ? { co: true } : {}), ...(fl.includes("R") ? { ri: true } : {}), cl: cl.split("/").map((k) => CLS[k]), ...x, d }, en, de });
}

// Tours de magie
S("elementalisme", 0, "tra", A, "9 m", "V, S", I, "", "dru/sor/wiz", {}, "Élémentalisme", "Elementalism",
  "Petits effets élémentaires dans un cube de 1,50 m : brise qui ferme une porte, voile de poussière ou mot tracé dans le sable, braises et fumée colorée qui allument une bougie, bruine, ou petite sculpture de terre ou de glace.",
  "Minor elemental effects in a 5-foot Cube: a breeze that closes a door, dust or a word traced in sand, harmless embers and scented smoke that light a candle, a fine mist, or a small sculpture of earth or ice.");
S("decharge_sorciere", 0, "evo", A, "36 m", "V, S", I, "", "sor", { atk: "dist", dmg: "1d8", ty: "force", sc: 1 }, "Décharge ensorcelée", "Sorcerous Burst",
  "Attaque de sort à distance : 1d8 dégâts d’acide, de froid, de feu, de foudre, de poison, psychiques ou de tonnerre (au choix). Sur un 8, relancez un d8 et ajoutez-le (au maximum votre modificateur d’incantation).",
  "Ranged spell attack: 1d8 Acid, Cold, Fire, Lightning, Poison, Psychic or Thunder damage (your choice). On an 8, roll another d8 and add it (up to your spellcasting modifier in extra dice).");
S("feu_follet_stellaire", 0, "evo", A, "18 m", "V, S", I, "", "bar/dru", { atk: "dist", dmg: "1d8", ty: "radiant", sc: 1 }, "Étincelle stellaire", "Starry Wisp",
  "Attaque de sort à distance : 1d8 dégâts radiants. Jusqu’à la fin de votre prochain tour, la cible diffuse une lumière faible sur 3 m et ne peut pas profiter de l’état Invisible.",
  "Ranged spell attack: 1d8 Radiant damage. Until the end of your next turn, the target sheds Dim Light in a 10-foot radius and can't benefit from the Invisible condition.");
// Niveau 1
S("orbe_chromatique", 1, "evo", A, "27 m", "V, S, M", I, "", "sor/wiz", { atk: "dist", dmg: "3d8", ty: "feu", up: "+1d8 et un rebond de plus par niveau" }, "Orbe chromatique", "Chromatic Orb",
  "Attaque de sort à distance : 3d8 dégâts d’acide, de froid, de feu, de foudre, de poison ou de tonnerre (au choix). Si deux d8 donnent le même résultat, l’orbe rebondit sur une autre cible à 9 m ou moins. Diamant de 50 po.",
  "Ranged spell attack: 3d8 Acid, Cold, Fire, Lightning, Poison or Thunder damage (your choice). If two d8s match, the orb leaps to another target within 30 feet. Requires a 50 GP diamond.");
S("couleurs_dansantes", 1, "ill", A, "Cône de 4,50 m", "V, S, M", I, "", "bar/sor/wiz", { sv: "con" }, "Couleurs dansantes", "Color Spray",
  "Une gerbe de lumières éblouissantes : chaque créature du cône réussit un JS de Constitution ou subit l’état Aveuglé jusqu’à la fin de votre prochain tour.",
  "A dazzling spray of light: each creature in the Cone succeeds on a Constitution save or has the Blinded condition until the end of your next turn.");
S("creation_destruction_eau", 1, "tra", A, "9 m", "V, S, M", I, "", "cle/dru", { up: "+40 litres ou cube +1,50 m par niveau" }, "Création ou destruction d’eau", "Create or Destroy Water",
  "Crée jusqu’à 40 litres d’eau potable (ou une pluie dans un cube de 9 m qui éteint les flammes), ou détruit autant d’eau ou le brouillard d’un cube de 9 m.",
  "Creates up to 10 gallons of clean water (or rain in a 30-foot Cube that douses flames), or destroys as much water, or the fog in a 30-foot Cube.");
S("detection_mal_bien", 1, "div", A, P, "V, S", "10 minutes", "C", "cle/pal", {}, "Détection du mal et du bien", "Detect Evil and Good",
  "Vous percevez l’emplacement des aberrations, célestes, élémentaires, fées, fiélons et morts-vivants à 9 m ou moins, ainsi que les lieux sanctifiés. Bloqué par 30 cm de pierre ou une feuille de plomb.",
  "You sense the location of Aberrations, Celestials, Elementals, Fey, Fiends and Undead within 30 feet, and any Hallow effect. Blocked by 1 foot of stone or a thin sheet of lead.");
S("detection_poison", 1, "div", A, P, "V, S, M", "10 minutes", "CR", "cle/dru/pal/ran", {}, "Détection du poison et des maladies", "Detect Poison and Disease",
  "Vous percevez l’emplacement et la nature des poisons, des créatures venimeuses et des maladies magiques à 9 m ou moins.",
  "You sense the location and kind of poisons, venomous creatures and magical contagions within 30 feet.");
S("murmures_dissonants", 1, "enc", A, "18 m", "V", I, "", "bar", { sv: "sag", dmg: "3d6", ty: "psy", up: "+1d6 par niveau" }, "Murmures dissonants", "Dissonant Whispers",
  "JS de Sagesse : 3d6 dégâts psychiques et la cible doit utiliser sa réaction pour s’éloigner de vous au maximum (moitié des dégâts seulement si réussite).",
  "Wisdom save: 3d6 Psychic damage and the target must use its Reaction to move as far from you as it can (half damage only on a success).");
S("frappe_pieges", 1, "inv", SM, P, "V", "1 minute", "C", "ran", { sv: "for", dmg: "1d6", ty: "perforant", up: "+1d6 par niveau" }, "Frappe piégeuse", "Ensnaring Strike",
  "Après avoir touché, des lianes saisissent la cible : JS de Force (avantage si Grande ou plus) ou elle est entravée et subit 1d6 dégâts perforants au début de chacun de ses tours. Un test de Force (Athlétisme) contre votre DD la libère.",
  "After you hit, vines grasp the target: Strength save (Advantage if Large or bigger) or it is Restrained and takes 1d6 Piercing damage at the start of each of its turns. A Strength (Athletics) check against your DC frees it.");
S("appel_familier", 1, "inv", "1 heure", "3 m", "V, S, M", I, "R", "wiz", {}, "Appel de familier", "Find Familiar",
  "Vous obtenez un familier (chat, chouette, corbeau, rat, araignée… toute bête de FP 0), de type céleste, fée ou fiélon. Télépathie à 30 m, et vous pouvez voir et entendre par ses sens. Il peut transmettre vos sorts de contact. Encens de 10 po.",
  "You gain a familiar (cat, owl, raven, rat, spider… any CR 0 Beast) that is a Celestial, Fey or Fiend. Telepathy within 100 feet, and you can see and hear through it. It can deliver your touch spells. 10 GP of incense.");
S("disque_flottant", 1, "inv", A, "9 m", "V, S, M", "1 heure", "R", "wiz", {}, "Disque flottant", "Floating Disk",
  "Un disque de force de 90 cm flotte à 90 cm du sol et porte jusqu’à 250 kg. Il vous suit en restant à 6 m ou moins de vous.",
  "A 3-foot disk of force floats 3 feet off the ground and carries up to 500 pounds. It follows you, staying within 20 feet.");
S("malefice", 1, "enc", B, "27 m", "V, S, M", "1 heure", "C", "war", { dmg: "1d6", ty: "necro" }, "Maléfice", "Hex",
  "Vous maudissez une créature : +1d6 dégâts nécrotiques quand vous la touchez avec une attaque, et désavantage aux tests d’une caractéristique de votre choix. Si elle tombe à 0 PV, vous pouvez transférer la malédiction par une action bonus. Plus longue aux niveaux supérieurs.",
  "You curse a creature: +1d6 Necrotic damage when you hit it with an attack, and Disadvantage on checks with one ability of your choice. If it drops to 0 HP, you can move the curse as a Bonus Action. Lasts longer at higher levels.");
S("fou_rire", 1, "enc", A, "9 m", "V, S, M", "1 minute", "C", "bar/war/wiz", { sv: "sag", up: "+1 cible par niveau" }, "Fou rire", "Hideous Laughter",
  "JS de Sagesse ou la cible est à terre et neutralisée, secouée de rire. Elle refait le JS à la fin de chacun de ses tours et quand elle subit des dégâts (avec avantage).",
  "Wisdom save or the target is Prone and Incapacitated, laughing helplessly. It repeats the save at the end of each of its turns and when it takes damage (with Advantage).");
S("couteau_glace", 1, "inv", A, "18 m", "S, M", I, "", "dru/sor/wiz", { atk: "dist", dmg: "1d10", ty: "perforant", up: "+1d6 froid par niveau" }, "Couteau de glace", "Ice Knife",
  "Attaque de sort à distance : 1d10 dégâts perforants. Touché ou non, l’éclat explose : la cible et chaque créature à 1,50 m réussissent un JS de Dextérité ou subissent 2d6 dégâts de froid.",
  "Ranged spell attack: 1d10 Piercing damage. Hit or miss, the shard explodes: the target and each creature within 5 feet succeed on a Dexterity save or take 2d6 Cold damage.");
S("ecriture_illusoire", 1, "ill", "1 minute", T, "S, M", "10 jours", "R", "bar/war/wiz", {}, "Écriture illusoire", "Illusory Script",
  "Un texte que seuls vous et les créatures désignées pouvez lire ; pour les autres il paraît indéchiffrable ou dit autre chose. Encre de 10 po.",
  "A text only you and creatures you designate can read; to everyone else it looks unintelligible or says something else. 10 GP of ink.");
S("purification_nourriture", 1, "tra", A, "3 m", "V, S", I, "R", "cle/dru/pal", {}, "Purification de nourriture et d’eau", "Purify Food and Drink",
  "Élimine le poison et la pourriture de la nourriture et des boissons non magiques dans une sphère de 1,50 m de rayon.",
  "Removes poison and rot from nonmagical food and drink in a 5-foot-radius Sphere.");
S("chatiment_ardent", 1, "evo", SM, P, "V", "1 minute", "", "pal", { dmg: "1d6", ty: "feu", up: "+1d6 par niveau" }, "Châtiment ardent", "Searing Smite",
  "Après avoir touché au corps à corps : +1d6 dégâts de feu. Au début de chacun de ses tours, la cible subit 1d6 dégâts de feu puis fait un JS de Constitution ; une réussite met fin au sort.",
  "After a melee hit: +1d6 Fire damage. At the start of each of its turns, the target takes 1d6 Fire damage, then makes a Constitution save; a success ends the spell.");
// Niveau 2
S("fleche_acide", 2, "evo", A, "27 m", "V, S, M", I, "", "wiz", { atk: "dist", dmg: "4d4", ty: "acide", up: "+1d4 (initial et différé) par niveau" }, "Flèche acide", "Acid Arrow",
  "Attaque de sort à distance : 4d4 dégâts d’acide, puis 2d4 à la fin de son prochain tour. En cas d’échec, la moitié des dégâts initiaux seulement.",
  "Ranged spell attack: 4d4 Acid damage, then 2d4 more at the end of its next turn. On a miss, half the initial damage only.");
S("messager_animal", 2, "enc", A, "9 m", "V, S, M", "24 heures", "R", "bar/dru/ran", { up: "+48 heures par niveau" }, "Messager animal", "Animal Messenger",
  "Une très petite bête porte un message de 25 mots vers un lieu que vous avez visité et un destinataire que vous décrivez, à environ 40 km par jour (80 km si elle vole).",
  "A Tiny Beast carries a 25-word message to a place you have visited and a recipient you describe, traveling about 25 miles a day (50 if it flies).");
S("verrou_arcanique", 2, "abj", A, T, "V, S, M", D, "", "wiz", {}, "Verrou arcanique", "Arcane Lock",
  "Verrouille magiquement une porte, fenêtre ou coffre. Seuls vous, les créatures désignées ou un mot de passe peuvent l’ouvrir. Poudre d’or de 25 po.",
  "Magically locks a door, window or chest. Only you, creatures you designate, or a password can open it. 25 GP of gold dust.");
S("aura_magique_arcaniste", 2, "ill", A, T, "V, S, M", "24 heures", "", "wiz", {}, "Aura magique de l’arcaniste", "Arcanist's Magic Aura",
  "Masque : les sorts considèrent la créature comme d’un autre type. Fausse aura : un objet paraît magique, non magique ou d’une autre école aux sorts de détection. Permanent après 30 jours.",
  "Mask: spells treat a creature as a different creature type. False Aura: an object appears magical, nonmagical or of another school to detection spells. Permanent after 30 days.");
S("flamme_eternelle", 2, "evo", A, T, "V, S, M", D, "", "cle/dru/wiz", {}, "Flamme éternelle", "Continual Flame",
  "Une flamme sans chaleur jaillit d’un objet : lumière vive sur 6 m et faible sur 6 m de plus. Elle ne peut pas être étouffée. Poudre de rubis de 50 po.",
  "A heatless flame springs from an object: Bright Light in a 20-foot radius and Dim Light for 20 more feet. It can't be smothered. 50 GP of ruby dust.");
S("detection_pensees", 2, "div", A, P, "V, S, M", "1 minute", "C", "bar/sor/wiz", { sv: "sag" }, "Détection des pensées", "Detect Thoughts",
  "Vous percevez les esprits pensants à 9 m. Par une action Magie, vous lisez les pensées de surface d’une créature ; vous pouvez sonder plus loin (JS de Sagesse).",
  "You sense thinking minds within 30 feet. As a Magic action, you read one creature's surface thoughts; you can probe deeper (Wisdom save).");
S("souffle_dragon", 2, "tra", B, T, "V, S, M", "1 minute", "C", "sor/wiz", { sv: "dex", dmg: "3d6", ty: "feu", up: "+1d6 par niveau" }, "Souffle du dragon", "Dragon's Breath",
  "Une créature consentante peut, par une action Magie, souffler un cône de 4,50 m d’acide, de froid, de feu, de foudre ou de poison : JS de Dextérité, 3d6 dégâts (moitié si réussite).",
  "A willing creature can use a Magic action to exhale a 15-foot Cone of Acid, Cold, Fire, Lightning or Poison: Dexterity save, 3d6 damage (half on a success).");
S("agrandir_retrecir", 2, "tra", A, "9 m", "V, S, M", "1 minute", "C", "bar/dru/sor/wiz", { sv: "con" }, "Agrandir/Rétrécir", "Enlarge/Reduce",
  "Agrandir : la cible gagne une catégorie de taille, l’avantage aux tests et JS de Force, et +1d4 aux dégâts de ses armes. Rétrécir : l’inverse (désavantage, −1d4). JS de Constitution si la cible refuse.",
  "Enlarge: the target grows one size, has Advantage on Strength checks and saves, and deals +1d4 weapon damage. Reduce: the opposite (Disadvantage, −1d4). Constitution save if unwilling.");
S("discours_captivant", 2, "enc", A, "18 m", "V, S", "1 minute", "C", "bar/war", { sv: "sag" }, "Discours captivant", "Enthrall",
  "Les créatures choisies font un JS de Sagesse (réussite automatique si vous les combattez) ou subissent −10 aux tests de Sagesse (Perception) et à leur Perception passive.",
  "Chosen creatures make a Wisdom save (automatic success if you're fighting them) or take a −10 penalty to Wisdom (Perception) checks and Passive Perception.");
S("detection_pieges", 2, "div", A, "36 m", "V, S", I, "", "cle/dru/ran", {}, "Détection des pièges", "Find Traps",
  "Vous savez si un piège se trouve dans votre champ de vision à portée, et sa nature générale, mais pas son emplacement exact.",
  "You learn whether a trap is within range and line of sight, and its general nature, but not its exact location.");
S("lame_flamme", 2, "evo", B, P, "V, S, M", "10 minutes", "C", "dru/sor", { atk: "cac", dmg: "3d6", ty: "feu", up: "+1d6 par niveau" }, "Lame de feu", "Flame Blade",
  "Une lame enflammée dans votre main libre. Par une action Magie, attaque de sort au corps à corps : 3d6 + votre modificateur d’incantation en dégâts de feu. Lumière vive sur 3 m.",
  "A fiery blade in your free hand. As a Magic action, melee spell attack: 3d6 + your spellcasting modifier Fire damage. Bright Light in a 10-foot radius.");
S("doux_repos", 2, "nec", A, T, "V, S, M", "10 jours", "R", "cle/pal/wiz", {}, "Doux repos", "Gentle Repose",
  "Un cadavre est protégé de la décomposition et ne peut pas devenir un mort-vivant. Ces jours ne comptent pas dans le délai des sorts de résurrection.",
  "A corpse is protected from decay and can't become Undead. These days don't count toward resurrection spell time limits.");
S("bourrasque", 2, "evo", A, "Ligne de 18 m", "V, S, M", "1 minute", "C", "dru/ran/sor/wiz", { sv: "for" }, "Bourrasque", "Gust of Wind",
  "Une ligne de vent de 18 m sur 3 m : JS de Force ou repoussé de 4,50 m. Se rapprocher de vous coûte le double. Disperse les gaz et éteint les flammes nues.",
  "A 60-foot by 10-foot Line of wind: Strength save or pushed 15 feet. Moving toward you costs double. Disperses gas and puts out open flames.");
S("deverrouillage", 2, "tra", A, "18 m", "V", I, "", "bar/sor/wiz", {}, "Déblocage", "Knock",
  "Ouvre une serrure, des menottes ou une porte bloquée (une seule serrure). Suspend un Verrou arcanique pendant 10 minutes. Un grand coup résonne à 90 m.",
  "Opens one lock, manacles or a stuck door. Suppresses Arcane Lock for 10 minutes. A loud knock is audible up to 300 feet away.");
S("localisation_animaux", 2, "div", A, P, "V, S, M", I, "R", "bar/dru/ran", {}, "Localisation d’animaux ou de plantes", "Locate Animals or Plants",
  "Vous apprenez la direction et la distance de la bête ou de la plante du type nommé la plus proche, à 7,5 km ou moins.",
  "You learn the direction and distance to the closest Beast or plant of the named kind within 5 miles.");
S("localisation_objet", 2, "div", A, P, "V, S, M", "10 minutes", "C", "bar/cle/dru/pal/ran/wiz", {}, "Localisation d’objet", "Locate Object",
  "Vous percevez la direction d’un objet familier, ou de l’objet le plus proche d’un type donné, à 300 m ou moins. Bloqué par le plomb.",
  "You sense the direction of a familiar object, or the nearest object of a given kind, within 1,000 feet. Blocked by lead.");
S("bouche_magique", 2, "ill", "1 minute", "9 m", "V, S, M", D, "R", "bar/wiz", {}, "Bouche magique", "Magic Mouth",
  "Un objet récite un message de 25 mots quand une condition que vous fixez se produit. Poudre de jade de 10 po.",
  "An object recites a 25-word message when a trigger you set occurs. 10 GP of jade dust.");
S("pointe_mentale", 2, "div", A, "36 m", "S", "1 heure", "C", "sor/war/wiz", { sv: "sag", dmg: "3d8", ty: "psy", up: "+1d8 par niveau" }, "Pointe mentale", "Mind Spike",
  "JS de Sagesse : 3d8 dégâts psychiques (moitié si réussite). En cas d’échec, vous connaissez sa position tant que dure le sort ; elle ne peut pas se cacher de vous.",
  "Wisdom save: 3d8 Psychic damage (half on a success). On a failure, you know its location for the duration; it can't hide from you.");
S("force_fantasmagorique", 2, "ill", A, "18 m", "V, S, M", "1 minute", "C", "bar/sor/wiz", { sv: "int", dmg: "2d8", ty: "psy" }, "Force fantasmagorique", "Phantasmal Force",
  "JS d’Intelligence ou la cible perçoit une illusion (cube de 3 m) qu’elle croit réelle. Elle peut subir 2d8 dégâts psychiques par tour à cause d’elle. Un test d’Intelligence (Investigation) la dissipe.",
  "Intelligence save or the target perceives an illusion (10-foot Cube) it believes is real. It can take 2d8 Psychic damage per turn from it. An Intelligence (Investigation) check sees through it.");
S("protection_poison", 2, "abj", A, T, "V, S", "1 heure", "", "cle/dru/pal/ran", {}, "Protection contre le poison", "Protection from Poison",
  "Met fin à l’état Empoisonné. Pendant 1 heure : avantage aux JS contre l’empoisonnement et résistance aux dégâts de poison.",
  "Ends the Poisoned condition. For 1 hour: Advantage on saves against being Poisoned and Resistance to Poison damage.");
S("corde_enchantee", 2, "tra", A, T, "V, S, M", "1 heure", "", "wiz", {}, "Corde enchantée", "Rope Trick",
  "Une corde se dresse vers un espace extradimensionnel invisible pouvant accueillir huit créatures de taille Moyenne. Rien ne peut y entrer ou en sortir, sauf par la corde.",
  "A rope rises to an Invisible extradimensional space that holds up to eight Medium creatures. Nothing can pass in or out except by the rope.");
S("voir_invisible", 2, "div", A, P, "V, S, M", "1 heure", "", "bar/sor/wiz", {}, "Voir l’invisible", "See Invisibility",
  "Vous voyez les créatures et objets invisibles, et vous voyez dans le plan Éthéré.",
  "You see Invisible creatures and objects, and you can see into the Ethereal Plane.");
S("chatiment_lumineux", 2, "tra", SM, P, "V", "1 minute", "C", "pal", { dmg: "2d6", ty: "radiant", up: "+1d6 par niveau" }, "Châtiment lumineux", "Shining Smite",
  "Après avoir touché au corps à corps : +2d6 dégâts radiants. La cible diffuse une lumière vive sur 1,50 m, les attaques contre elle ont l’avantage et elle ne peut pas profiter de l’état Invisible.",
  "After a melee hit: +2d6 Radiant damage. The target sheds Bright Light in a 5-foot radius, attacks against it have Advantage, and it can't benefit from the Invisible condition.");
S("croissance_epines", 2, "tra", A, "45 m", "V, S, M", "10 minutes", "C", "dru/ran", { dmg: "2d4", ty: "perforant" }, "Croissance d’épines", "Spike Growth",
  "Le sol d’une sphère de 6 m de rayon se couvre d’épines camouflées : terrain difficile, et 2d4 dégâts perforants par tranche de 1,50 m parcourue.",
  "The ground in a 20-foot-radius Sphere sprouts camouflaged spikes: Difficult Terrain, and 2d4 Piercing damage for every 5 feet traveled.");
S("lien_protecteur", 2, "abj", A, T, "V, S, M", "1 heure", "", "cle/pal", {}, "Lien protecteur", "Warding Bond",
  "La cible gagne +1 à la CA et aux JS et la résistance à tous les dégâts tant qu’elle est à 18 m ou moins de vous ; vous subissez autant de dégâts qu’elle. Deux anneaux de platine de 50 po.",
  "The target gains +1 to AC and saves and Resistance to all damage while within 60 feet of you; you take the same damage it takes. Two 50 GP platinum rings.");
// Niveau 3
S("animation_morts", 3, "nec", "1 minute", "3 m", "V, S, M", I, "", "cle/wiz", { up: "+2 morts-vivants par niveau" }, "Animation des morts", "Animate Dead",
  "Des ossements ou un cadavre deviennent un squelette ou un zombi sous vos ordres (action bonus, 18 m). Le contrôle dure 24 heures ; relancez le sort pour le maintenir.",
  "Bones or a corpse rise as a Skeleton or Zombie that you command (Bonus Action, 60 feet). Control lasts 24 hours; recast to keep it.");
S("clignotement", 3, "tra", A, P, "V, S", "1 minute", "", "sor/wiz", {}, "Clignotement", "Blink",
  "À la fin de chacun de vos tours, lancez 1d6 : sur 4 à 6, vous passez dans le plan Éthéré jusqu’au début de votre prochain tour.",
  "At the end of each of your turns, roll 1d6: on a 4–6, you vanish to the Ethereal Plane until the start of your next turn.");
S("clairvoyance", 3, "div", "10 minutes", "1,5 km", "V, S, M", "10 minutes", "C", "bar/cle/sor/wiz", {}, "Clairvoyance", "Clairvoyance",
  "Un capteur invisible dans un lieu connu ou évident : vous voyez ou entendez à travers lui. Focaliseur de 100 po.",
  "An invisible sensor in a familiar or obvious location: you see or hear through it. 100 GP focus.");
S("creation_nourriture", 3, "inv", A, "9 m", "V, S", I, "", "cle/pal", {}, "Création de nourriture et d’eau", "Create Food and Water",
  "Crée 20 kg de nourriture fade mais nourrissante et 120 litres d’eau potable, de quoi nourrir quinze personnes pendant 24 heures.",
  "Creates 45 pounds of bland but nourishing food and 30 gallons of fresh water, enough for fifteen people for 24 hours.");
S("forme_gazeuse", 3, "tra", A, T, "V, S, M", "1 heure", "C", "sor/war/wiz", { up: "+1 cible par niveau" }, "Forme gazeuse", "Gaseous Form",
  "La cible devient une brume : vol 3 m (surplace), résistance aux dégâts contondants, perforants et tranchants, avantage aux JS de For, Dex et Con, passe par les interstices. Elle ne peut ni attaquer ni lancer de sorts.",
  "The target becomes mist: Fly Speed 10 feet (hover), Resistance to Bludgeoning, Piercing and Slashing, Advantage on Str, Dex and Con saves, and passes through cracks. It can't attack or cast spells.");
S("glyphe_garde", 3, "abj", "1 heure", T, "V, S, M", "Jusqu’à déclenchement", "", "bar/cle/wiz", { sv: "dex", dmg: "5d8", ty: "feu", up: "+1d8 par niveau" }, "Glyphe de garde", "Glyph of Warding",
  "Un glyphe presque invisible se déclenche selon une condition : rune explosive (JS de Dextérité, 5d8 dégâts d’acide, de froid, de feu, de foudre ou de tonnerre sur 6 m) ou sort stocké. Diamant de 200 po.",
  "A nearly invisible glyph triggers on a condition you set: explosive rune (Dexterity save, 5d8 Acid, Cold, Fire, Lightning or Thunder damage in 20 feet) or a stored spell. 200 GP of diamond.");
S("cercle_magique", 3, "abj", "1 minute", "3 m", "V, S, M", "1 heure", "", "cle/pal/war/wiz", { up: "+1 heure par niveau" }, "Cercle magique", "Magic Circle",
  "Un cylindre de 3 m de rayon que les célestes, élémentaires, fées, fiélons ou morts-vivants choisis ne peuvent franchir ; ils ont le désavantage contre les créatures à l’intérieur. Peut être inversé pour les y piéger.",
  "A 10-foot-radius Cylinder that chosen Celestials, Elementals, Fey, Fiends or Undead can't enter; they have Disadvantage against creatures inside. Can be reversed to trap them.");
S("image_majeure", 3, "ill", A, "36 m", "V, S, M", "10 minutes", "C", "bar/sor/war/wiz", {}, "Image majeure", "Major Image",
  "Une illusion réaliste (cube de 6 m) avec sons, odeurs et température. Vous la déplacez par une action Magie. Permanente si lancée au niveau 4 ou plus.",
  "A realistic illusion (20-foot Cube) with sound, smell and temperature. You move it as a Magic action. Permanent if cast at level 4 or higher.");
S("fusion_pierre", 3, "tra", A, T, "V, S", "8 heures", "R", "cle/dru/ran", {}, "Fusion dans la pierre", "Meld into Stone",
  "Vous fusionnez avec la pierre, indétectable. Vous pouvez lancer des sorts sur vous-même. Si la pierre est détruite, vous êtes expulsé et subissez 6d6 dégâts de force.",
  "You merge into stone, undetectable. You can cast spells on yourself. If the stone is destroyed, you are expelled and take 6d6 Force damage.");
S("antidetection", 3, "abj", A, T, "V, S, M", "8 heures", "", "bar/ran/wiz", {}, "Antidétection", "Nondetection",
  "Une créature, un objet ou un lieu ne peut pas être ciblé par les sorts de divination ni perçu par les capteurs magiques. Poudre de diamant de 25 po.",
  "A creature, object or place can't be targeted by Divination spells or perceived through scrying sensors. 25 GP of diamond dust.");
S("monture_fantome", 3, "ill", "1 minute", "9 m", "V, S", "1 heure", "R", "wiz", {}, "Monture fantôme", "Phantom Steed",
  "Un cheval quasi réel avec sa selle apparaît : vitesse 30 m, il parcourt 20 km par heure. Il disparaît s’il subit des dégâts.",
  "A quasi-real horse with saddle appears: Speed 100 feet, it travels 13 miles an hour. It vanishes if it takes damage.");
S("protection_energie", 3, "abj", A, T, "V, S", "1 heure", "C", "cle/dru/ran/sor/wiz", {}, "Protection contre l’énergie", "Protection from Energy",
  "Une créature consentante obtient la résistance à l’acide, au froid, au feu, à la foudre ou au tonnerre (au choix).",
  "A willing creature gains Resistance to Acid, Cold, Fire, Lightning or Thunder damage (your choice).");
S("delivrance_maledictions", 3, "abj", A, T, "V, S", I, "", "cle/pal/war/wiz", {}, "Délivrance des malédictions", "Remove Curse",
  "Met fin à toutes les malédictions d’une créature ou d’un objet. Un objet maudit le reste, mais l’harmonisation est rompue et il peut être retiré.",
  "Ends all curses on a creature or object. A cursed item stays cursed, but Attunement ends so it can be removed.");
S("communication_distance", 3, "div", A, "Illimitée", "V, S, M", I, "", "bar/cle/wiz", {}, "Communication à distance", "Sending",
  "Vous envoyez un message de 25 mots à une créature connue, à n’importe quelle distance ; elle peut répondre aussitôt. 5 % d’échec vers un autre plan.",
  "You send a 25-word message to a known creature at any distance; it can reply at once. 5% failure to another plane.");
S("communication_plantes", 3, "tra", A, P, "V, S", "10 minutes", "", "bar/dru/ran", {}, "Communication avec les plantes", "Speak with Plants",
  "Les plantes dans une émanation de 9 m vous parlent de ce qu’elles ont perçu depuis un jour, obéissent à des ordres simples, et vous pouvez créer ou supprimer un terrain difficile végétal.",
  "Plants in a 30-foot Emanation tell you what they've sensed in the past day, follow simple commands, and you can create or remove plant-based Difficult Terrain.");
S("petite_hutte", 3, "evo", "1 minute", P, "V, S, M", "8 heures", "R", "bar/wiz", {}, "Petite hutte", "Tiny Hut",
  "Un dôme de 3 m vous abrite, confortable et sec. Seules les créatures présentes au lancement le traversent ; les sorts de niveau 3 ou moins ne passent pas.",
  "A 10-foot dome shelters you, comfortable and dry. Only creatures inside at casting can pass; spells of level 3 or lower can't get through.");
S("caresse_vampirique", 3, "nec", A, P, "V, S", "1 minute", "C", "sor/war/wiz", { atk: "cac", dmg: "3d6", ty: "necro", up: "+1d6 par niveau" }, "Caresse vampirique", "Vampiric Touch",
  "Attaque de sort au corps à corps : 3d6 dégâts nécrotiques et vous récupérez la moitié en PV. Vous pouvez recommencer à chaque tour par une action Magie.",
  "Melee spell attack: 3d6 Necrotic damage and you regain half as HP. You can repeat it each turn as a Magic action.");
S("respiration_aquatique", 3, "tra", A, "9 m", "V, S, M", "24 heures", "R", "dru/ran/sor/wiz", {}, "Respiration aquatique", "Water Breathing",
  "Jusqu’à dix créatures consentantes peuvent respirer sous l’eau.",
  "Up to ten willing creatures can breathe underwater.");
S("marche_onde", 3, "tra", A, "9 m", "V, S, M", "1 heure", "R", "cle/dru/ran/sor", {}, "Marche sur l’onde", "Water Walk",
  "Jusqu’à dix créatures marchent sur l’eau, la boue, la neige, les sables mouvants ou la lave comme sur un sol ferme.",
  "Up to ten creatures walk on water, mud, snow, quicksand or lava as if on solid ground.");
S("mur_vent", 3, "evo", A, "36 m", "V, S, M", "1 minute", "C", "dru/ran", { sv: "for", dmg: "4d8", ty: "contondant" }, "Mur de vent", "Wind Wall",
  "Un mur de vent de 15 m de long : JS de Force, 4d8 dégâts contondants (moitié si réussite). Il bloque les gaz, les petites créatures volantes et les projectiles ordinaires.",
  "A 50-foot wall of wind: Strength save, 4d8 Bludgeoning damage (half on a success). It blocks gases, small flyers and ordinary projectiles.");
// Niveau 4
S("charme_monstre", 4, "enc", A, "9 m", "V, S", "1 heure", "", "bar/dru/sor/war/wiz", { sv: "sag", up: "+1 cible par niveau" }, "Charme-monstre", "Charm Monster",
  "JS de Sagesse (avantage si vous la combattez) ou la créature est charmée et amicale jusqu’à ce que vous ou vos alliés la blessiez.",
  "Wisdom save (Advantage if you're fighting it) or the creature is Charmed and Friendly until you or your allies harm it.");
S("contrainte", 4, "enc", A, "9 m", "V, S", "1 minute", "C", "bar", { sv: "sag" }, "Contrainte", "Compulsion",
  "JS de Sagesse ou les cibles sont charmées : par une action bonus, vous désignez une direction et elles doivent s’y déplacer à leur tour.",
  "Wisdom save or targets are Charmed: as a Bonus Action you choose a direction and they must move that way on their turn.");
S("invocation_elementaires_mineurs", 4, "inv", A, P, "V, S", "10 minutes", "C", "dru/wiz", { dmg: "2d8", ty: "feu", up: "+1d8 par niveau" }, "Invocation d’élémentaires mineurs", "Conjure Minor Elementals",
  "Des esprits élémentaires tourbillonnent dans une émanation de 4,50 m : vos attaques infligent +2d8 dégâts d’acide, de froid, de feu ou de foudre aux créatures dans la zone, qui est un terrain difficile pour vos ennemis.",
  "Elemental spirits swirl in a 15-foot Emanation: your attacks deal +2d8 Acid, Cold, Fire or Lightning damage to creatures in it, and it is Difficult Terrain for your enemies.");
S("invocation_etres_sylvestres", 4, "inv", A, P, "V, S", "10 minutes", "C", "dru/ran", { sv: "sag", dmg: "5d8", ty: "force", up: "+1d8 par niveau" }, "Invocation d’êtres sylvestres", "Conjure Woodland Beings",
  "Des esprits de la nature vous entourent (émanation de 3 m) : une créature qui y entre ou y finit son tour fait un JS de Sagesse, 5d8 dégâts de force (moitié si réussite). Désengagement par une action bonus.",
  "Nature spirits surround you (10-foot Emanation): a creature that enters or ends its turn there makes a Wisdom save, 5d8 Force damage (half on a success). Disengage as a Bonus Action.");
S("domination_bete", 4, "enc", A, "18 m", "V, S", "1 minute", "C", "dru/ran/sor", { sv: "sag" }, "Domination de bête", "Dominate Beast",
  "JS de Sagesse ou la bête est charmée et vous obéit par télépathie. Elle refait le JS quand elle subit des dégâts. Dure plus longtemps aux niveaux supérieurs.",
  "Wisdom save or the Beast is Charmed and obeys your telepathic commands. It repeats the save when it takes damage. Lasts longer at higher levels.");
S("fabrication", 4, "tra", "10 minutes", "36 m", "V, S", I, "", "wiz", {}, "Fabrication", "Fabricate",
  "Transforme des matières premières en objet fini (pont, corde, vêtements) jusqu’à la taille Grande, ou Moyenne pour le métal et la pierre.",
  "Turns raw materials into a finished product (bridge, rope, clothes) up to Large size, or Medium for metal and stone.");
S("chien_fidele", 4, "inv", A, "9 m", "V, S, M", "8 heures", "", "wiz", { sv: "dex", dmg: "4d8", ty: "force" }, "Chien de garde", "Faithful Hound",
  "Un chien fantôme invisible aboie si un intrus approche à 9 m sans le mot de passe. Au début de vos tours, il mord un ennemi à 1,50 m : JS de Dextérité ou 4d8 dégâts de force.",
  "An invisible phantom hound barks if an intruder comes within 30 feet without the password. At the start of your turns, it bites an enemy within 5 feet: Dexterity save or 4d8 Force damage.");
S("insecte_geant", 4, "inv", A, "18 m", "V, S", "10 minutes", "C", "dru", {}, "Insecte géant", "Giant Insect",
  "Vous invoquez un mille-pattes, une araignée ou une guêpe géante (bloc de statistiques Insecte géant : CA 11 + niveau, 30 PV + 10 par niveau au-delà de 4). Il agit juste après vous.",
  "You summon a giant centipede, spider or wasp (Giant Insect stat block: AC 11 + level, 30 HP + 10 per level above 4). It acts right after you.");
S("terrain_hallucinatoire", 4, "ill", "10 minutes", "90 m", "V, S, M", "24 heures", "", "bar/dru/war/wiz", {}, "Terrain hallucinatoire", "Hallucinatory Terrain",
  "Un terrain naturel (cube de 45 m) ressemble à un autre : un champ devient marais, un précipice une pente douce. Le toucher n’est pas modifié.",
  "Natural terrain in a 150-foot Cube looks like another kind: a field becomes a swamp, a cliff a gentle slope. Touch is unchanged.");
S("sanctuaire_prive", 4, "abj", "10 minutes", "36 m", "V, S, M", "24 heures", "", "wiz", { up: "+30 m de côté par niveau" }, "Sanctuaire privé", "Private Sanctum",
  "Une zone (cube de 1,50 m à 30 m) protégée au choix contre le son, la vue, la divination et la téléportation.",
  "An area (5- to 100-foot Cube) warded as you choose against sound, sight, Divination and teleportation.");
S("coffre_secret", 4, "inv", A, T, "V, S, M", D, "", "wiz", {}, "Coffre secret", "Secret Chest",
  "Vous cachez un coffre et son contenu dans le plan Éthéré et le rappelez par une action Magie grâce à sa réplique miniature. Coffre de 5 000 po.",
  "You hide a chest and its contents on the Ethereal Plane and recall it as a Magic action using its miniature replica. 5,000 GP chest.");
S("sphere_vitriolique", 4, "evo", A, "45 m", "V, S, M", I, "", "sor/wiz", { sv: "dex", dmg: "10d4", ty: "acide", up: "+2d4 par niveau" }, "Sphère vitriolique", "Vitriolic Sphere",
  "Une boule d’acide explose (sphère de 6 m) : JS de Dextérité, 10d4 dégâts d’acide puis 5d4 à la fin de son prochain tour (moitié des dégâts initiaux seulement si réussite).",
  "A ball of acid bursts (20-foot Sphere): Dexterity save, 10d4 Acid damage then 5d4 more at the end of its next turn (half the initial damage only on a success).");
// Niveau 5
S("bouclier_antivie", 5, "abj", A, P, "V, S", "1 heure", "C", "dru", {}, "Bouclier antivie", "Antilife Shell",
  "Une barrière de 3 m autour de vous empêche les créatures autres que les morts-vivants et créatures artificielles de passer ou de vous atteindre au corps à corps.",
  "A 10-foot barrier around you keeps creatures other than Undead and Constructs from passing through or reaching you in melee.");
S("contact_autre_plan", 5, "div", "1 minute", P, "V", "1 minute", "R", "war/wiz", { dmg: "6d6", ty: "psy" }, "Contact avec un autre plan", "Contact Other Plane",
  "JS d’Intelligence DD 15 : en cas de réussite, posez cinq questions à une entité d’un autre plan (réponses en un mot). En cas d’échec, 6d6 dégâts psychiques et neutralisé jusqu’à un repos long.",
  "DC 15 Intelligence save: on a success, ask an otherworldly entity five questions (one-word answers). On a failure, 6d6 Psychic damage and Incapacitated until a Long Rest.");
S("contagion", 5, "nec", A, T, "V, S", "7 jours", "", "cle/dru", { sv: "con", dmg: "11d8", ty: "necro" }, "Contagion", "Contagion",
  "JS de Constitution ou 11d8 dégâts nécrotiques et empoisonné, avec désavantage aux JS d’une caractéristique choisie. Trois échecs : l’effet dure 7 jours.",
  "Constitution save or 11d8 Necrotic damage and Poisoned, with Disadvantage on saves of a chosen ability. Three failures: it lasts 7 days.");
S("creation", 5, "ill", "1 minute", "9 m", "V, S, M", "Spéciale", "", "sor/wiz", { up: "Cube +1,50 m par niveau" }, "Création", "Creation",
  "Vous créez un objet non vivant (cube de 1,50 m) en matière d’ombre ; sa durée dépend du matériau (12 heures pour la pierre, 1 minute pour l’or).",
  "You create a nonliving object (5-foot Cube) from shadow; its duration depends on the material (12 hours for stone, 1 minute for gold).");
S("sanctification", 5, "abj", "24 heures", T, "V, S, M", D, "", "cle", {}, "Sanctification", "Hallow",
  "Une zone de 18 m de rayon interdite aux créatures de types choisis, avec un effet au choix (courage, lumière, ténèbres, silence, langues, résistance ou vulnérabilité à un type de dégâts…). Encens de 1 000 po.",
  "A 60-foot-radius area that chosen creature types can't enter, with an extra effect (courage, light, darkness, silence, tongues, resistance or vulnerability to a damage type…). 1,000 GP of incense.");
S("double_illusoire", 5, "ill", A, P, "S", "1 heure", "C", "bar/war/wiz", {}, "Double illusoire", "Mislead",
  "Vous devenez invisible et un double illusoire apparaît. Vous le déplacez et le faites parler, et percevez par ses sens. L’invisibilité cesse si vous attaquez ou lancez un sort.",
  "You turn Invisible and an illusory double appears. You move it, make it speak, and sense through it. Invisibility ends if you attack or cast a spell.");
S("lien_planaire", 5, "abj", "1 heure", "18 m", "V, S, M", "24 heures", "", "bar/cle/dru/war/wiz", { sv: "cha" }, "Lien planaire", "Planar Binding",
  "JS de Charisme ou un céleste, élémentaire, fée ou fiélon est lié à votre service et suit vos ordres. Durée plus longue aux niveaux supérieurs. Joyau de 1 000 po.",
  "Charisma save or a Celestial, Elemental, Fey or Fiend is bound to serve you and follow your commands. Lasts longer at higher levels. 1,000 GP jewel.");
S("reincarnation", 5, "nec", "1 hour".replace("1 hour", "1 heure"), T, "V, S, M", I, "", "dru", {}, "Réincarnation", "Reincarnate",
  "Une créature humanoïde morte depuis 10 jours au plus revient dans un nouveau corps d’une espèce tirée au hasard (1d10). Huiles de 1 000 po.",
  "A Humanoid dead no longer than 10 days returns in a new body of a random species (1d10). 1,000 GP of oils.");
S("invocation_dragon", 5, "inv", A, "18 m", "V, S, M", "1 heure", "C", "wiz", {}, "Invocation de dragon", "Summon Dragon",
  "Un esprit draconique (CA 14 + niveau, 50 PV + 10 par niveau au-delà de 5, vol 18 m) combat pour vous, avec morsures et souffle. Il agit juste après vous.",
  "A Draconic Spirit (AC 14 + level, 50 HP + 10 per level above 5, Fly 60 feet) fights for you with bites and a breath weapon. It acts right after you.");
S("lien_telepathique", 5, "div", A, "9 m", "V, S, M", "1 heure", "R", "bar/wiz", {}, "Lien télépathique", "Telepathic Bond",
  "Jusqu’à huit créatures consentantes communiquent par télépathie, à n’importe quelle distance sur le même plan.",
  "Up to eight willing creatures communicate telepathically at any distance on the same plane.");
// Niveau 6
S("invocation_fee", 6, "inv", A, "18 m", "V, S", "10 minutes", "C", "dru", { atk: "cac", dmg: "3d12", ty: "psy", up: "+1d12 par niveau" }, "Invocation de fée", "Conjure Fey",
  "Un esprit féerique apparaît et attaque (attaque de sort au corps à corps) : 3d12 + votre modificateur d’incantation en dégâts psychiques, et la cible est effrayée. Vous le téléportez de 9 m par une action bonus pour attaquer de nouveau.",
  "A fey spirit appears and attacks (melee spell attack): 3d12 + your spellcasting modifier Psychic damage, and the target is Frightened. Teleport it 30 feet as a Bonus Action to attack again.");
S("contingence", 6, "abj", "10 minutes", P, "V, S, M", "10 jours", "", "wiz", {}, "Contingence", "Contingency",
  "Vous associez un sort de niveau 5 ou moins qui peut vous cibler à une condition de déclenchement ; il prend effet dès qu’elle se produit. Statuette de 1 500 po.",
  "You pair a spell of level 5 or lower that can target you with a trigger; it takes effect as soon as the trigger occurs. 1,500 GP statuette.");
S("interdiction", 6, "abj", "10 minutes", T, "V, S, M", "1 jour", "R", "cle", { dmg: "5d10", ty: "radiant" }, "Interdiction", "Forbiddance",
  "Une vaste zone est protégée contre la téléportation et le voyage planaire. Les créatures de types choisis qui y entrent ou y commencent leur tour subissent 5d10 dégâts radiants ou nécrotiques. Rubis de 1 000 po.",
  "A large area is warded against teleportation and planar travel. Chosen creature types that enter or start their turn there take 5d10 Radiant or Necrotic damage. 1,000 GP of ruby dust.");
S("sphere_glaciale", 6, "evo", A, "90 m", "V, S, M", I, "", "sor/wiz", { sv: "con", dmg: "10d6", ty: "froid", up: "+1d6 par niveau" }, "Sphère glaciale", "Freezing Sphere",
  "Un globe glacé explose (sphère de 18 m) : JS de Constitution, 10d6 dégâts de froid (moitié si réussite). Gèle une étendue d’eau. Vous pouvez le garder en main pour le lancer plus tard.",
  "A frigid globe explodes (60-foot Sphere): Constitution save, 10d6 Cold damage (half on a success). Freezes water. You can hold it to throw later.");
S("garde_et_protection", 6, "abj", "1 heure", T, "V, S, M", "24 heures", "", "bar/wiz", {}, "Garde et protection", "Guards and Wards",
  "Protège un bâtiment : couloirs embrumés, portes verrouillées et masquées, escaliers couverts de toiles, et un effet au choix. Baguette d’argent de 10 po.",
  "Wards a building: fog-filled corridors, locked and hidden doors, webbed stairs, and an extra effect of your choice. 10 GP silver rod.");
S("convocation_instantanee", 6, "inv", "1 minute", T, "V, S, M", D, "R", "wiz", {}, "Convocation instantanée", "Instant Summons",
  "Vous marquez un objet de 5 kg au plus ; en brisant le saphir, il apparaît dans votre main, où qu’il soit. Saphir de 1 000 po.",
  "You mark an object of 10 pounds or less; crushing the sapphire brings it to your hand from anywhere. 1,000 GP sapphire.");
S("possession", 6, "nec", "1 minute", P, "V, S, M", D, "", "wiz", { sv: "cha" }, "Possession", "Magic Jar",
  "Votre âme passe dans un réceptacle, d’où elle peut tenter de posséder un humanoïde à 30 m (JS de Charisme). Réceptacle de 500 po.",
  "Your soul moves into a container, from which it can try to possess a Humanoid within 100 feet (Charisma save). 500 GP container.");
S("glissement_terrain", 6, "tra", A, "36 m", "V, S, M", "2 heures", "C", "dru/sor/wiz", {}, "Glissement de terrain", "Move Earth",
  "Vous remodelez la terre, le sable ou l’argile d’une zone de 12 m de côté : élever, creuser, former un mur ou un pilier. Chaque changement prend 10 minutes.",
  "You reshape dirt, sand or clay in a 40-foot square: raise, dig, form a wall or pillar. Each change takes 10 minutes.");
S("allie_planaire", 6, "inv", "10 minutes", "18 m", "V, S", I, "", "cle", {}, "Allié planaire", "Planar Ally",
  "Une entité que vous connaissez vous envoie un céleste, un élémentaire ou un fiélon ; il accomplit un service contre un paiement à négocier.",
  "An entity you know sends a Celestial, Elemental or Fiend; it performs a service in exchange for negotiated payment.");
S("illusion_programmee", 6, "ill", A, "36 m", "V, S, M", D, "", "bar/wiz", {}, "Illusion programmée", "Programmed Illusion",
  "Une illusion (cube de 9 m) de 5 minutes au plus se déclenche selon une condition, puis se réactive après 10 minutes. Poudre de jade de 25 po.",
  "An illusion (30-foot Cube) up to 5 minutes long plays when a trigger occurs, then resets after 10 minutes. 25 GP of jade dust.");
S("voyage_plantes", 6, "inv", A, "3 m", "V, S", "1 minute", "", "dru", {}, "Voyage par les plantes", "Transport via Plants",
  "Une grande plante devient un passage vers une autre plante déjà vue, à n’importe quelle distance sur le même plan.",
  "A large plant becomes a passage to another plant you've seen, at any distance on the same plane.");
S("mur_epines", 6, "inv", A, "36 m", "V, S, M", "10 minutes", "C", "dru", { sv: "dex", dmg: "7d8", ty: "perforant", up: "+1d8 par niveau" }, "Mur d’épines", "Wall of Thorns",
  "Un mur de ronces épineuses (18 m de long ou cercle de 6 m) : JS de Dextérité, 7d8 dégâts perforants (moitié si réussite). Le traverser coûte 4 fois plus de mouvement et inflige 7d8 tranchants.",
  "A wall of thorny brush (60 feet long or a 20-foot circle): Dexterity save, 7d8 Piercing damage (half on a success). Moving through costs 4 times the movement and deals 7d8 Slashing.");
S("marche_vent", 6, "tra", "1 minute", "9 m", "V, S, M", "8 heures", "", "dru", {}, "Marche sur le vent", "Wind Walk",
  "Vous et dix créatures prenez une forme de nuage : vol 90 m, résistance aux dégâts physiques. Reprendre forme normale demande 1 minute.",
  "You and up to ten creatures become clouds: Fly Speed 300 feet, Resistance to physical damage. Reverting takes 1 minute.");
// Niveau 7
S("invocation_celeste", 7, "inv", A, "27 m", "V, S", "10 minutes", "C", "cle", { sv: "dex", dmg: "6d12", ty: "radiant", heal: "4d12", up: "+1d12 par niveau" }, "Invocation de céleste", "Conjure Celestial",
  "Un pilier de lumière (cylindre de 3 m de rayon) : chaque créature y récupère 4d12 + votre modificateur d’incantation en PV, ou fait un JS de Dextérité contre 6d12 dégâts radiants. Vous le déplacez de 9 m à votre tour.",
  "A pillar of light (10-foot-radius Cylinder): each creature in it regains 4d12 + your spellcasting modifier HP, or makes a Dexterity save against 6d12 Radiant damage. Move it 30 feet on your turn.");
S("manoir_magnifique", 7, "inv", "1 minute", "90 m", "V, S, M", "24 heures", "", "bar/wiz", {}, "Manoir somptueux", "Magnificent Mansion",
  "Une porte mène à une demeure extradimensionnelle meublée, avec un festin pour cent personnes et des serviteurs invisibles. Porte miniature de 15 po.",
  "A door leads to a furnished extradimensional dwelling with a feast for a hundred and invisible servants. 15 GP miniature door.");
S("mirage_arcanique", 7, "ill", "10 minutes", "Vue", "V, S", "10 jours", "", "bar/dru/wiz", {}, "Mirage arcanique", "Mirage Arcane",
  "Un terrain de 1,5 km de côté ressemble à un autre, jusqu’au toucher : il peut créer ou supprimer un terrain difficile et ajouter de fausses structures.",
  "Terrain up to 1 mile square looks and even feels like another kind: it can create or remove Difficult Terrain and add false structures.");
S("sequestre", 7, "tra", A, T, "V, S, M", D, "", "wiz", {}, "Séquestre", "Sequester",
  "Une créature ou un objet devient invisible et indétectable par la divination ; une créature est plongée dans un sommeil sans âge jusqu’à une condition choisie. Poudre de gemme de 5 000 po.",
  "A creature or object becomes Invisible and undetectable by Divination; a creature sleeps without aging until a condition you choose. 5,000 GP of gem dust.");
S("simulacre", 7, "ill", "12 heures", T, "V, S, M", D, "", "wiz", {}, "Simulacre", "Simulacrum",
  "Vous créez un double de neige d’une bête ou d’un humanoïde : mêmes statistiques avec la moitié des PV, il vous obéit. Poudre de rubis de 1 500 po.",
  "You create a snow duplicate of a Beast or Humanoid: same statistics with half the HP, and it obeys you. 1,500 GP of ruby dust.");
// Niveau 8
S("antipathie_sympathie", 8, "enc", "1 heure", "18 m", "V, S, M", "10 jours", "", "bar/dru/wiz", { sv: "sag" }, "Antipathie/Sympathie", "Antipathy/Sympathy",
  "Un objet ou une créature repousse (effrayé) ou attire (charmé) un type de créature choisi qui arrive à 36 m (JS de Sagesse).",
  "An object or creature repels (Frightened) or attracts (Charmed) a chosen kind of creature that comes within 120 feet (Wisdom save).");
S("embrouillamini", 8, "enc", A, "45 m", "V, S, M", I, "", "bar/dru/war/wiz", { sv: "int", dmg: "10d12", ty: "psy" }, "Esprit brisé", "Befuddlement",
  "JS d’Intelligence ou 10d12 dégâts psychiques, et la cible ne peut plus lancer de sorts ni effectuer l’action Magie (nouveau JS tous les 30 jours). Moitié des dégâts seulement si réussite.",
  "Intelligence save or 10d12 Psychic damage, and the target can't cast spells or take the Magic action (new save every 30 days). Half damage only on a success.");
S("clone", 8, "nec", "1 heure", T, "V, S, M", I, "", "wiz", {}, "Clone", "Clone",
  "Un double inerte de la créature grandit en 120 jours ; si elle meurt, son âme y passe. Diamant de 1 000 po et réceptacle de 2 000 po.",
  "An inert duplicate grows in 120 days; if the creature dies, its soul moves into it. 1,000 GP diamond and 2,000 GP vessel.");
S("eloquence", 8, "enc", A, P, "V", "1 heure", "", "bar/war", {}, "Éloquence", "Glibness",
  "Vous pouvez remplacer le résultat de vos tests de Charisme par 15, et la magie qui détecte le mensonge vous dit sincère.",
  "You can replace your Charisma check rolls with 15, and magic that detects lies says you are truthful.");
S("tsunami", 8, "inv", "1 minute", "1,5 km", "V, S", "6 rounds", "C", "dru", { sv: "for", dmg: "6d10", ty: "contondant" }, "Tsunami", "Tsunami",
  "Un mur d’eau de 90 m : JS de Force, 6d10 dégâts contondants (moitié si réussite). Il avance de 15 m par tour et frappe de nouveau (5d10).",
  "A 300-foot wall of water: Strength save, 6d10 Bludgeoning damage (half on a success). It moves 50 feet each turn and strikes again (5d10).");
// Niveau 9
S("ennemi_subconscient", 9, "ill", A, "36 m", "V, S", "1 minute", "C", "war/wiz", { sv: "sag", dmg: "10d10", ty: "psy" }, "Ennemi subconscient", "Weird",
  "Les créatures choisies dans une sphère de 9 m font un JS de Sagesse : 10d10 dégâts psychiques et effrayées (moitié si réussite). À chaque tour, nouvel échec : 5d10 dégâts.",
  "Chosen creatures in a 30-foot Sphere make a Wisdom save: 10d10 Psychic damage and Frightened (half on a success). Each turn, another failure deals 5d10.");

/* Sorties */
const head = "/* Forge des Héros — sorts du SRD 5.2 (Wizards of the Coast LLC, CC-BY-4.0), résumés non officiels. Fichier généré par tools/spells3.js. */\n";
const body = "Object.assign(SPELLS, {\n" + out.map((x) => "  " + x.id + ": " + JSON.stringify(x.o) + ",").join("\n") + "\n});\n";
fs.writeFileSync(path.join(__dirname, "../src/data3.js"), head + body);
const en = {};
out.forEach((x) => { en[x.o.n] = x.en; en[x.o.d] = x.de; });
fs.writeFileSync(path.join(__dirname, "en/data6.json"), JSON.stringify(en, null, 0).replace(/","/g, '",\n"'));
console.log(out.length, "sorts");
