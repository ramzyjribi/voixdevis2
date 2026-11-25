// types/catalog.ts
export interface CatalogArticle {
  id: string;
  designation: string;
  unit: string;
  price: number;
  keywords: string[];
}

export interface InterventionTemplateItem {
  articleId: string;
  defaultQuantity: number;
}

export interface InterventionTemplate {
  id: string;
  title: string;
  keywords: string[];
  items: InterventionTemplateItem[];
}



// --- 1. BASE DE DONNÉES DES ARTICLES (60 Articles - Spécial Plomberie) ---
export const Articles: CatalogArticle[] = [
  // MO & Déplacements
  { id: 'ART_MO_PLOMB', designation: 'Main d\'oeuvre technicien plombier', unit: 'h', price: 65, keywords: ['main d\'oeuvre', 'heure', 'taux', 'horaire', 'intervention'] },
  { id: 'ART_DEP_ZONE1', designation: 'Forfait déplacement Zone 1 (< 15km)', unit: 'forfait', price: 45, keywords: ['déplacement', 'frais', 'trajet', 'véhicule'] },
  { id: 'ART_DEP_ZONE2', designation: 'Forfait déplacement Zone 2 (15km à 30km)', unit: 'forfait', price: 80, keywords: ['déplacement', 'frais', 'trajet', 'loin'] },
  { id: 'ART_URGENCE', designation: 'Majoration urgence / week-end', unit: 'forfait', price: 60, keywords: ['majoration', 'urgence', 'soir', 'dimanche', 'nuit'] },
  { id: 'ART_CONSOMMABLES', designation: 'Petites fournitures et consommables', unit: 'forfait', price: 15, keywords: ['consommable', 'joint', 'teflon', 'filasse', 'vis'] },

  // Tuyauterie & Réseaux
  { id: 'ART_VANNE_GEN', designation: 'Remplacement vanne d\'arrêt générale avec vidange', unit: 'u', price: 155, keywords: ['vanne', 'arrêt', 'générale', 'compteur', 'coupure'] },
  { id: 'ART_REDUCTEUR_PRESSION', designation: 'Remplacement d\'un réducteur de pression 3/4', unit: 'u', price: 225, keywords: ['réducteur', 'pression', 'manomètre', 'régulateur'] },
  { id: 'ART_TUBE_CUIVRE_ML', designation: 'Fourniture et pose tuyauterie cuivre 14/16', unit: 'ml', price: 28, keywords: ['cuivre', 'tuyau', 'tube', 'soudure', 'brasure'] },
  { id: 'ART_TUBE_MULTI_ML', designation: 'Fourniture et pose tuyauterie multicouche', unit: 'ml', price: 18, keywords: ['multicouche', 'tuyau', 'sertissage', 'réseau'] },
  { id: 'ART_TUBE_PER_ML', designation: 'Fourniture et pose tuyauterie PER', unit: 'ml', price: 12, keywords: ['per', 'tuyau', 'plastique', 'glissement'] },
  { id: 'ART_TIRAGE_EAU_FORFAIT', designation: 'Tirage réseau alimentation eau (forfait < 20m)', unit: 'forfait', price: 860, keywords: ['tirage', 'réseau', 'alimentation', 'création'] },
  { id: 'ART_PVC_40_ML', designation: 'Création réseau évacuation PVC Ø40', unit: 'ml', price: 15, keywords: ['pvc', 'évacuation', '40', 'tube', 'collage'] },
  { id: 'ART_PVC_100_ML', designation: 'Création réseau évacuation PVC Ø100', unit: 'ml', price: 35, keywords: ['pvc', 'évacuation', '100', 'colonne', 'chute'] },
  { id: 'ART_CURAGE_HP', designation: 'Curage canalisation haute pression hydrocureur', unit: 'forfait', price: 350, keywords: ['curage', 'camion', 'hydrocureur', 'haute pression', 'assainissement'] },
  { id: 'ART_ROB_PUISAGE', designation: 'Installation robinet de puisage extérieur', unit: 'u', price: 160, keywords: ['puisage', 'extérieur', 'jardin', 'arrosage', 'robinet'] },

  // Robinetterie
  { id: 'ART_MIT_EVIER_STD', designation: 'Remplacement mitigeur évier cuisine standard', unit: 'u', price: 125, keywords: ['mitigeur', 'évier', 'cuisine', 'standard', 'robinet'] },
  { id: 'ART_MIT_EVIER_DOUCHETTE', designation: 'Remplacement mitigeur évier cuisine avec douchette (Grohe)', unit: 'u', price: 229, keywords: ['mitigeur', 'évier', 'douchette', 'grohe', 'cuisine'] },
  { id: 'ART_MIT_LAVABO', designation: 'Remplacement mitigeur lavabo standard', unit: 'u', price: 115, keywords: ['mitigeur', 'lavabo', 'vasque', 'salle de bain', 'robinet'] },
  { id: 'ART_MIT_THERMO_DOUCHE', designation: 'Remplacement mitigeur thermostatique douche', unit: 'u', price: 180, keywords: ['mitigeur', 'thermostatique', 'douche', 'régulateur'] },
  { id: 'ART_MIT_THERMO_BAIN', designation: 'Remplacement mitigeur thermostatique baignoire', unit: 'u', price: 210, keywords: ['mitigeur', 'thermostatique', 'baignoire', 'bain'] },
  { id: 'ART_TETE_THERMO', designation: 'Remplacement tête thermostatique radiateur', unit: 'u', price: 49, keywords: ['tête', 'thermostatique', 'radiateur', 'chauffage', 'danfoss'] },
  { id: 'ART_COLONNE_DOUCHE_SIMPLE', designation: 'Fourniture et pose colonne de douche non thermostatique', unit: 'u', price: 250, keywords: ['colonne', 'douche', 'pommeau', 'simple'] },
  { id: 'ART_COLONNE_DOUCHE_ENC', designation: 'Fourniture et pose colonne de douche encastrée', unit: 'u', price: 580, keywords: ['colonne', 'douche', 'encastrée', 'mur', 'design'] },
  { id: 'ART_MECANISME_CHASSE', designation: 'Remplacement mécanisme chasse d\'eau complet', unit: 'u', price: 180, keywords: ['mécanisme', 'chasse d\'eau', 'bouton', 'poussoir', 'fuite wc'] },
  { id: 'ART_ROB_FLOTTEUR', designation: 'Remplacement robinet flotteur WC', unit: 'u', price: 95, keywords: ['robinet', 'flotteur', 'remplissage', 'wc'] },

  // Sanitaires - WC & Lavabos
  { id: 'ART_WC_POSER', designation: 'Fourniture et remplacement WC à poser classique', unit: 'u', price: 405, keywords: ['wc', 'poser', 'toilette', 'classique', 'remplacement'] },
  { id: 'ART_BATI_SUSPENDU', designation: 'Fourniture et pose bâti-support WC suspendu', unit: 'u', price: 450, keywords: ['bâti', 'support', 'bâti-support', 'suspendu', 'geberit'] },
  { id: 'ART_CUVETTE_SUSPENDU', designation: 'Fourniture et pose cuvette WC suspendu + abattant', unit: 'u', price: 250, keywords: ['cuvette', 'wc', 'suspendu', 'abattant', 'céramique'] },
  { id: 'ART_SANIBROYEUR', designation: 'Installation sanibroyeur type SFA', unit: 'u', price: 750, keywords: ['sanibroyeur', 'sfa', 'broyeur', 'pompe'] },
  { id: 'ART_DEPOSE_WC', designation: 'Dépose WC existant et mise en déchetterie', unit: 'forfait', price: 80, keywords: ['dépose', 'enlever', 'wc', 'gravats', 'destruction'] },
  { id: 'ART_LAVABO_COLONNE', designation: 'Remplacement d\'un lavabo sur colonne', unit: 'u', price: 285, keywords: ['lavabo', 'colonne', 'pied', 'céramique'] },
  { id: 'ART_MEUBLE_VASQUE_60', designation: 'Fourniture et pose meuble vasque 60cm', unit: 'u', price: 450, keywords: ['meuble', 'vasque', '60cm', 'salle de bain', 'tiroir'] },
  { id: 'ART_MEUBLE_VASQUE_120', designation: 'Fourniture et pose meuble double vasque 120cm', unit: 'u', price: 850, keywords: ['meuble', 'double', 'vasque', '120cm', 'salle de bain'] },
  { id: 'ART_RECEVEUR_XP', designation: 'Fourniture et pose receveur douche extra-plat résine', unit: 'u', price: 550, keywords: ['receveur', 'bac', 'douche', 'extra-plat', 'résine'] },
  { id: 'ART_PAROI_VERRE', designation: 'Fourniture et pose paroi de douche fixe verre trempé', unit: 'u', price: 350, keywords: ['paroi', 'verre', 'vitre', 'douche', 'trempé'] },

  // Sanitaires - Bains & Douches
  { id: 'ART_BAIGNOIRE_ACRYL', designation: 'Remplacement baignoire acrylique standard', unit: 'u', price: 650, keywords: ['baignoire', 'acrylique', 'bain', 'remplacement'] },
  { id: 'ART_SIPHON_SOL', designation: 'Fourniture et pose siphon de sol 90mm + grille inox', unit: 'u', price: 95, keywords: ['siphon', 'sol', 'italienne', 'douche', 'grille', 'inox'] },
  { id: 'ART_JOINT_BAIN', designation: 'Réfection joint silicone baignoire', unit: 'forfait', price: 180, keywords: ['joint', 'silicone', 'baignoire', 'étanchéité', 'mastic'] },
  { id: 'ART_JOINT_DOUCHE', designation: 'Réfection joint silicone douche', unit: 'forfait', price: 180, keywords: ['joint', 'silicone', 'douche', 'étanchéité', 'mastic'] },
  { id: 'ART_DEPOSE_RECEVEUR', designation: 'Dépose receveur de douche et évacuation', unit: 'forfait', price: 120, keywords: ['dépose', 'receveur', 'bac', 'casser'] },
  { id: 'ART_VIDAGE_BAIN', designation: 'Remplacement de vidage de baignoire (accessible)', unit: 'u', price: 160, keywords: ['vidage', 'siphon', 'baignoire', 'évacuation', 'bouchon'] },
  
  // Chauffage & Chauffe-eau
  { id: 'ART_CE_BLINDE_100L', designation: 'Remplacement chauffe-eau 100L blindé mural', unit: 'u', price: 700, keywords: ['chauffe-eau', 'cumulus', '100l', 'blindé', 'ballon'] },
  { id: 'ART_CE_STEATITE_200L', designation: 'Remplacement chauffe-eau 200L stéatite mural', unit: 'u', price: 1300, keywords: ['chauffe-eau', 'cumulus', '200l', 'stéatite', 'ballon'] },
  { id: 'ART_CE_THERMO_200L', designation: 'Pose et fourniture d\'un ballon thermodynamique 200L', unit: 'u', price: 2500, keywords: ['thermodynamique', 'chauffe-eau', 'pac', 'écologique'] },
  { id: 'ART_SECHE_SERVIETTE', designation: 'Pose d\'un sèche-serviette à eau avec raccordement', unit: 'u', price: 280, keywords: ['sèche-serviette', 'radiateur', 'salle de bain', 'chauffage'] },
  { id: 'ART_DEPOSE_RADIATEUR', designation: 'Dépose et enlèvement ancien radiateur fonte/acier', unit: 'u', price: 100, keywords: ['dépose', 'radiateur', 'chauffage', 'lourd', 'fonte'] },
  { id: 'ART_POSE_RADIATEUR', designation: 'Installation nouveau radiateur à eau', unit: 'u', price: 250, keywords: ['installation', 'radiateur', 'eau', 'chauffage'] },
  { id: 'ART_CHAUDIERE_GAZ', designation: 'Fourniture et pose chaudière gaz condensation murale', unit: 'u', price: 2800, keywords: ['chaudière', 'gaz', 'condensation', 'murale', 'chauffage'] },
  { id: 'ART_ENTRETIEN_CHAUDIERE', designation: 'Entretien annuel chaudière gaz', unit: 'forfait', price: 170, keywords: ['entretien', 'chaudière', 'révision', 'gaz', 'annuel'] },
  { id: 'ART_GROUPE_SECURITE', designation: 'Remplacement groupe de sécurité chauffe-eau', unit: 'u', price: 189, keywords: ['groupe', 'sécurité', 'chauffe-eau', 'fuite', 'pression'] },
  { id: 'ART_DIAG_PANN_CE', designation: 'Diagnostic panne chauffe-eau', unit: 'forfait', price: 140, keywords: ['diagnostic', 'panne', 'chauffe-eau', 'cumulus', 'froid'] },

  // Dépannage, Fuites & Débouchage
  { id: 'ART_RECH_FUITE_SIMPLE', designation: 'Recherche de fuite d\'eau simple (visuelle)', unit: 'forfait', price: 150, keywords: ['recherche', 'fuite', 'visuelle', 'simple', 'eau'] },
  { id: 'ART_RECH_FUITE_ND', designation: 'Recherche de fuite non destructive (caméra thermique / gaz)', unit: 'forfait', price: 420, keywords: ['recherche', 'fuite', 'caméra', 'thermique', 'gaz', 'destructive'] },
  { id: 'ART_REP_FUITE_CUIVRE', designation: 'Réparation d\'une fuite sur tuyau cuivre (brasure)', unit: 'forfait', price: 180, keywords: ['réparation', 'fuite', 'cuivre', 'brasure', 'soudure'] },
  { id: 'ART_REP_FUITE_PER', designation: 'Réparation d\'une fuite sur tuyau PER / Multicouche', unit: 'forfait', price: 150, keywords: ['réparation', 'fuite', 'per', 'multicouche', 'raccord'] },
  { id: 'ART_REP_FUITE_PVC', designation: 'Réparation d\'une fuite tuyau évacuation PVC', unit: 'forfait', price: 140, keywords: ['réparation', 'fuite', 'pvc', 'évacuation', 'colle'] },
  { id: 'ART_DEBOUCH_EVIER', designation: 'Débouchage évier / lavabo / douche (manuel/pompe)', unit: 'forfait', price: 145, keywords: ['débouchage', 'évier', 'lavabo', 'douche', 'bouchon', 'pompe'] },
  { id: 'ART_DEBOUCH_WC', designation: 'Débouchage WC avec furet professionnel', unit: 'forfait', price: 180, keywords: ['débouchage', 'wc', 'toilette', 'furet', 'bouchon'] },
  { id: 'ART_DEBOUCH_CAMION', designation: 'Débouchage colonne avec passage camion hydrocureur', unit: 'forfait', price: 390, keywords: ['débouchage', 'camion', 'hydrocureur', 'colonne', 'bouché'] },
  { id: 'ART_DEGEL_TUBE', designation: 'Gel de tuyauterie pour intervention en charge (par élément)', unit: 'u', price: 159, keywords: ['gel', 'tuyauterie', 'glace', 'bouchon', 'charge'] },
  { id: 'ART_CREA_ALIM_LV', designation: 'Création alimentation et évacuation lave-linge/vaisselle', unit: 'forfait', price: 135, keywords: ['création', 'alimentation', 'évacuation', 'lave-linge', 'lave-vaisselle', 'machine'] }
];

// --- 2. BASE DE DONNÉES DES INTERVENTIONS COMPOSÉES (15 Templates) ---
export const InterventionTemplates: InterventionTemplate[] = [
  {
    id: 'TMP_WC_POSER_REMPL',
    title: 'Remplacement complet WC à poser',
    keywords: ['remplacement', 'wc', 'poser', 'toilette', 'complet', 'classique'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_DEPOSE_WC', defaultQuantity: 1 },
      { articleId: 'ART_WC_POSER', defaultQuantity: 1 },
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 1 }
    ]
  },
  {
    id: 'TMP_WC_SUSPENDU_CREA',
    title: 'Création WC suspendu complet',
    keywords: ['création', 'wc', 'suspendu', 'bâti', 'complet'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_DEPOSE_WC', defaultQuantity: 1 },
      { articleId: 'ART_BATI_SUSPENDU', defaultQuantity: 1 },
      { articleId: 'ART_CUVETTE_SUSPENDU', defaultQuantity: 1 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 4 } // 4h de MO pour coffrage/pose
    ]
  },
  {
    id: 'TMP_CE_200L_REMPL',
    title: 'Remplacement chauffe-eau 200L stéatite',
    keywords: ['remplacement', 'chauffe-eau', 'cumulus', '200l', 'stéatite', 'ballon'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_CE_STEATITE_200L', defaultQuantity: 1 },
      { articleId: 'ART_GROUPE_SECURITE', defaultQuantity: 1 },
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 1 }
    ]
  },
  {
    id: 'TMP_DOUCHE_ITALIENNE',
    title: 'Création douche à l\'italienne (Receveur extra-plat)',
    keywords: ['création', 'douche', 'italienne', 'extra-plat', 'receveur', 'paroi'],
    items: [
      { articleId: 'ART_RECEVEUR_XP', defaultQuantity: 1 },
      { articleId: 'ART_SIPHON_SOL', defaultQuantity: 1 },
      { articleId: 'ART_PAROI_VERRE', defaultQuantity: 1 },
      { articleId: 'ART_COLONNE_DOUCHE_ENC', defaultQuantity: 1 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 8 }
    ]
  },
  {
    id: 'TMP_REMPL_BAIN_DOUCHE',
    title: 'Remplacement baignoire par douche',
    keywords: ['remplacement', 'baignoire', 'douche', 'rénovation', 'senior'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_BAIGNOIRE_ACRYL', defaultQuantity: 1 }, // Sera mis en négatif ou supprimé par l'artisan, utilisé ici pour contexte
      { articleId: 'ART_RECEVEUR_XP', defaultQuantity: 1 },
      { articleId: 'ART_PAROI_VERRE', defaultQuantity: 1 },
      { articleId: 'ART_COLONNE_DOUCHE_SIMPLE', defaultQuantity: 1 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 12 }
    ]
  },
  {
    id: 'TMP_RENO_MEUBLE_VASQUE',
    title: 'Rénovation point d\'eau (Meuble double vasque)',
    keywords: ['rénovation', 'meuble', 'vasque', 'double', 'lavabo', 'salle de bain'],
    items: [
      { articleId: 'ART_LAVABO_COLONNE', defaultQuantity: 1 }, // Représente la dépose
      { articleId: 'ART_MEUBLE_VASQUE_120', defaultQuantity: 1 },
      { articleId: 'ART_MIT_LAVABO', defaultQuantity: 2 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 3 }
    ]
  },
  {
    id: 'TMP_MITIGEUR_CUISINE_REMPL',
    title: 'Remplacement mitigeur cuisine douchette (Pack)',
    keywords: ['remplacement', 'mitigeur', 'cuisine', 'douchette', 'évier'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_MIT_EVIER_DOUCHETTE', defaultQuantity: 1 },
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 1 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 1 }
    ]
  },
  {
    id: 'TMP_DEBOUCHAGE_SDB',
    title: 'Pack débouchage complet Salle de Bain',
    keywords: ['débouchage', 'complet', 'salle de bain', 'douche', 'lavabo', 'bouchon'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_DEBOUCH_EVIER', defaultQuantity: 2 }, // Lavabo + Douche
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 1 }
    ]
  },
  {
    id: 'TMP_RECH_REP_FUITE_ENC',
    title: 'Intervention fuite encastrée (Recherche + Réparation)',
    keywords: ['recherche', 'réparation', 'fuite', 'encastrée', 'mur', 'destructive'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_RECH_FUITE_ND', defaultQuantity: 1 },
      { articleId: 'ART_REP_FUITE_CUIVRE', defaultQuantity: 1 },
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 1 }
    ]
  },
  {
    id: 'TMP_ENTRETIEN_CHAUD_ANNUEL',
    title: 'Entretien annuel chaudière gaz complet',
    keywords: ['entretien', 'chaudière', 'gaz', 'annuel', 'révision'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_ENTRETIEN_CHAUDIERE', defaultQuantity: 1 },
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 1 }
    ]
  },
  {
    id: 'TMP_REMPL_RADIATEUR',
    title: 'Remplacement radiateur chauffage central',
    keywords: ['remplacement', 'radiateur', 'chauffage', 'eau', 'fonte'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_DEPOSE_RADIATEUR', defaultQuantity: 1 },
      { articleId: 'ART_POSE_RADIATEUR', defaultQuantity: 1 },
      { articleId: 'ART_TETE_THERMO', defaultQuantity: 1 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 2 }
    ]
  },
  {
    id: 'TMP_POSE_SANIBROYEUR',
    title: 'Installation sanibroyeur avec création réseau',
    keywords: ['installation', 'pose', 'sanibroyeur', 'broyeur', 'sfa', 'réseau'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_SANIBROYEUR', defaultQuantity: 1 },
      { articleId: 'ART_PVC_40_ML', defaultQuantity: 5 }, // 5 mètres de PVC par défaut
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 4 }
    ]
  },
  {
    id: 'TMP_REMPL_RESEAU_EAU_SDB',
    title: 'Rénovation réseau plomberie salle de bain',
    keywords: ['rénovation', 'réseau', 'plomberie', 'salle de bain', 'cuivre', 'multicouche'],
    items: [
      { articleId: 'ART_VANNE_GEN', defaultQuantity: 1 },
      { articleId: 'ART_TUBE_MULTI_ML', defaultQuantity: 15 },
      { articleId: 'ART_PVC_40_ML', defaultQuantity: 8 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 10 },
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 2 }
    ]
  },
  {
    id: 'TMP_REMPL_RAD_SECHE_SERV',
    title: 'Remplacement radiateur par sèche-serviette',
    keywords: ['remplacement', 'radiateur', 'sèche-serviette', 'salle de bain', 'chauffage'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_DEPOSE_RADIATEUR', defaultQuantity: 1 },
      { articleId: 'ART_SECHE_SERVIETTE', defaultQuantity: 1 },
      { articleId: 'ART_MO_PLOMB', defaultQuantity: 3 }
    ]
  },
  {
    id: 'TMP_REFECTION_JOINTS_SDB',
    title: 'Pack réfection joints silicone complet SDB',
    keywords: ['réfection', 'joints', 'silicone', 'salle de bain', 'étanchéité', 'mastic'],
    items: [
      { articleId: 'ART_DEP_ZONE1', defaultQuantity: 1 },
      { articleId: 'ART_JOINT_BAIN', defaultQuantity: 1 },
      { articleId: 'ART_JOINT_DOUCHE', defaultQuantity: 1 },
      { articleId: 'ART_CONSOMMABLES', defaultQuantity: 1 }
    ]
  }
];

export const getArticleById = (id: string): CatalogArticle | undefined => {
  return Articles.find(article => article.id === id);
};

export const getTemplateById = (id: string): InterventionTemplate | undefined => {
  return InterventionTemplates.find(template => template.id === id);
};