# **PRD — VoixDevis MVP (Version Enrichie V2)**

---

**Fichier de référence historique :** prd\_voixdevis\_mvp\_nextjs\_gemini\_2026.md  
**Version :** 2.0 — MVP Démonstration Spécifications Finales  
**Date :** Juin 2026  
**Statut :** Validé pour Implémentation

# **1\. Vision Produit**

---

VoixDevis est une application web responsive mobile-first permettant à un artisan de générer un devis professionnel simplement en parlant naturellement.  
L'utilisateur décrit son chantier comme il parlerait à un collègue. L'IA comprend le contexte métier, sélectionne les articles correspondants dans un catalogue interne mocké envoyé directement dans son contexte, construit le devis en temps réel et permet une conversation continue pour modifier le document. Le devis devient un document vivant piloté par langage naturel.  
L'objectif du MVP est de démontrer la puissance d'une UX conversationnelle fluide, la génération de devis en temps réel à l'aide du function calling de Gemini, et l'élimination de 90% des interactions manuelles clavier/souris.

# **2\. Positionnement MVP**

---

Le MVP est une démonstration fonctionnelle technique et produit rigoureuse.  
**Le but n'est PAS :** de gérer un ERP complet, de supporter le multi-compte, d'embarquer une base de données SQL lourde ou d'intégrer une logique de facturation complexe.  
**Le MVP doit démontrer :** la conversation naturelle, la précision des tool calls, la traduction métier instantanée (ex: "une journée à deux" → "Main d'œuvre : 14h"), le feedback visuel immédiat, la flexibilité d'édition et la décomposition automatique de packs d'interventions.

# **3\. Expérience Utilisateur Cible & Concept Central**

---

L'artisan dicte son chantier via une interface optimisée. L'IA analyse l'intention, sélectionne les articles ou applique des modèles d'interventions complexes (bundles) issus du catalogue, et met à jour instantanément le store global de l'application. Le document se structure visuellement sous les yeux de l'utilisateur.

# **4\. Exemples d'Usage Réels**



**Exemple 1 — Cloison \+ Verrière (Modification à la volée)**

**Artisan :** *"Bon alors ici, faut casser la cloison placo. Evacuation des gravats. Après on pose une verrière type atelier, noire, 3 partitions. Compte une journée de boulot à deux."*  
**Comportement IA attendu :** L'IA détecte une intention d'ajout multiple, map les éléments avec le catalogue mocké et calcule la main d'œuvre (2 personnes × 8h \= 16h).  
**Résultat visuel automatique :**

* Rubrique : Verrière intérieure  
  * Démolition cloison plaque de plâtre  
  * Evacuation gravats chantier  
  * Fourniture verrière atelier noire 3 partitions  
  * Pose verrière intérieure  
  * Main d'oeuvre chantier : 16h

**Itération :**  
**Artisan :** *"Ah non la verrière c'est une 4 partitions."*  
**IA :** Modifie la ligne spécifique, recalcule le prix unitaire et met à jour les totaux du devis.  
**Artisan :** *"Applique une réduction de 10%."* → **IA :** Applique la réduction globale.

**Artisan :** *"Exporter le devis en PDF."* → **IA :** Génère et télécharge le document.

## **Exemple 2 — Remplacement Bloc Évier (Intervention Composée)**

**Artisan :** *"Nouveau devis pour Mme Durand au 81 cours Vitton Lyon. Rubrique Cuisine. On fait un remplacement de bloc évier complet."*  
**Comportement IA attendu :** L'IA associe l'identité du client, Crée l'en-tête, met la date, met l'adresse , crée la rubrique "Cuisine", et détecte que "remplacement de bloc évier complet" correspond à un modèle d'intervention composé (bundle). Elle extrait l'ID du template et l'applique.  
**Résultat visuel automatique :** Le système injecte d'un coup les articles du catalogue liés à ce pack :

* Dépose évier et robinetterie existante (45 €)  
* Fourniture évier inox 2 bacs (180 €)  
* Mitigeur cuisine Grohe avec douchette (120 €)  
* Pose et raccordements plomberie (90 €)

**Itération sur le pack :**  
**Artisan :** *"Enlève le mitigeur Grohe du pack et mets un Hansgrohe moins cher à la place."*

**IA :** Supprime l'article Grohe et ajoute l'article Hansgrohe du catalogue. Le prix global du devis s'ajuste dynamiquement (somme exacte des articles réels).

## **Exemple 3 — Ligne sur mesure (Hors-Catalogue)**

**Artisan :** *"Ajoute une ligne sur mesure, mets cet article comme dicté exactement : Forfait nettoyage fin de chantier de luxe, prix 250 euros, quantité 1."*  
**Comportement IA attendu :** L'IA comprend que l'article n'existe pas dans le catalogue mocké mais que l'artisan exige une saisie exacte. Elle appelle l'outil de création sur mesure.

# **5\. Objectifs Produit MVP**

1. ---

   **Démontrer une UX conversationnelle fluide :** Sentiment d'interaction directe avec le document.  
2. **Feedback visuel en temps réel :** Affichage d'un état intermédiaire pendant le traitement pour rassurer l'utilisateur.  
3. **Function Calling Gemini rigoureux :** Le LLM n'altère pas l'état, il émet des ordres structurés.  
4. **Gestion des interventions composées modifiables :** Injection de listes d'articles atomiques interréagissant de manière fluide.  
5. **Autonomie de configuration :** Gestion intégrée des paramètres de l'entreprise. Un bouton (icone setting ) Paramètres affiche un ecran qui permet à l'artisan de configurer les données  de son entreprise (stockées en LocalStorage). Une partie de ces informations est automatiquement injectée sur le devis visuel et l'export PDF.
* **Informations Entreprise :** Nom de la société, Nom de l'artisan, Adresse, Code Postal, Ville, SIRET, Téléphone, Email.  
* **Paramètres Financiers :** Taux de TVA appliqué par défaut (5.5%, 10%, 20%).

# **6\. Stack Technique MVP**

---

| Couche | Technologie   |
| :---- | :---- |
| Frontend / Backend | Next.js App Router (TypeScript) |
| Styling & UI | TailwindCSS \+ Shadcn UI |
| State management | Zustand (Persistance via LocalStorage) |
| IA & Tool Calling | Gemini API & Gemini Function Calling |
| Speech-to-Text | Web Speech API |
| Export Document | react-pdf |
| Catalogue | Fichier TypeScript structuré (Mock embarqué dans le prompt) |



# **7\. Spécifications du Catalogue & Structures de Données**

---

Le catalogue mocké (30 à 80 articles) est envoyé directement à Gemini. Pour gérer le cas des interventions complexes décomposées, la structure intègre deux types d'éléments distincts : les articles atomiques et les templates d'interventions.

// 1\. Article unitaire du catalogue  
interface CatalogArticle {  
  id: string;  
  designation: string;  
  unit: string;  
  price: number;  
  keywords: string\[\];  
}

// 2\. Association d'un article à un modèle d'intervention  
interface InterventionTemplateItem {  
  articleId: string;  
  defaultQuantity: number;  
}

// 3\. Modèle d'intervention composée (Bundle)  
interface InterventionTemplate {  
  id: string;  
  title: string;  
  keywords: string\[\];  
  items: InterventionTemplateItem\[\]; // Liste d'articles injectés individuellement  
}

# **8\. Outils / Spécifications du Function Calling**

---

Le LLM utilise exclusivement la liste d'outils métiers ci-dessous pour modifier l'état de l'application.

### **8.1 set\_client\_info**

Ajoute ou modifie les informations du client sur le devis actif.

{ name?: string, address?: string, city?: string }

### **8.2 apply\_intervention\_template**

Détecte une demande d'intervention composée et transmet l'ID du template. Le store Zustand se charge de résoudre le template en insérant individuellement chaque article associé.

{ templateId: string, sectionName?: string }

### **8.3 add\_article**

Ajoute un article unitaire issu du catalogue.

{ articleId: string, quantity?: number, sectionName?: string }

### **8.4 add\_custom\_line**

Ajoute une ligne de devis totalement personnalisée (Hors-catalogue), notamment lorsque l'utilisateur demande d'insérer un élément "comme dicté exactement".

{ designation: string, price: number, unit: string, quantity: number, sectionName?: string }

### **8.5 update\_article**

Modifie une ligne existante dans le devis (qu'elle provienne d'un article isolé, d'un élément de pack décomposé, ou d'une ligne personnalisée).

{ lineItemId: string, quantity?: number, price?: number, designation?: string }

### **8.6 remove\_article**

Supprime une ligne du devis à l'aide de son identifiant.

{ lineItemId: string }

### **8.7 set\_tva**

Modifie le taux de TVA du devis en cours (écrase temporairement la valeur par défaut définie dans les paramètres).

{ rate: 5.5 | 10 | 20 }

### **8.8 apply\_discount**

Applique une remise globale sur le montant total HT.

{ type: 'percent' | 'fixed', value: number }

### **8.9 unknown\_action**

Appelé si l'intention de l'artisan est hors scope. Permet de retourner une rétroaction textuelle dynamique.

{ userMessageFeedback: string }
Affichage simple :

```text
Je n'ai pas compris cette demande.
```

ou

```text
Pouvez-vous reformuler ?
```

### **8.10 request_clarification**
Appelé par l'IA lorsque l'intention de l'artisan est ambiguë, incomplète, ou lorsque plusieurs articles du catalogue correspondent à une demande générique (ex: "changement de robinet").

{
  "userMessageFeedback": "string (La question de clarification claire et courte formulée par l'IA)",
  "candidates": [
    "string (Optionnel : Tableau contenant les IDs des articles du catalogue qui provoquent le doute)"
  ]
}


### **8.11 trigger_pdf_export**
    "description": "Active instantanément la génération et le téléchargement du document au format PDF côté client."

## **détail de tools** 

```text
[
  {
    "name": "set_client_info",
    "description": "Ajoute ou écrase les coordonnées du client sur le devis.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "name": { "type": "STRING", "description": "Nom complet du client" },
        "address": { "type": "STRING", "description": "Adresse postale du chantier ou de facturation" },
        "city": { "type": "STRING", "description": "Code postal et Ville" }
      }
    }
  },
  {
    "name": "apply_intervention_template",
    "description": "Injecte un lot complet d'articles liés à un pack d'intervention type issu du catalogue.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "templateId": { "type": "STRING", "description": "ID strict du template (ex: TMP_WC_POSER_REMPL, TMP_CE_200L_REMPL)" },
        "sectionName": { "type": "STRING", "description": "Optionnel : Nom de la rubrique cible (ex: WC, Salle de Bain)" }
      },
      "required": ["templateId"]
    }
  },
  {
    "name": "add_article",
    "description": "Ajoute un article unitaire référencé au catalogue de plomberie dans le devis.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "articleId": { "type": "STRING", "description": "ID strict de l'article (ex: ART_MO_PLOMB, ART_VANNE_GEN)" },
        "quantity": { "type": "NUMBER", "description": "Quantité spécifiée (défaut à 1 si non précisé)" },
        "sectionName": { "type": "STRING", "description": "Optionnel : Nom de la rubrique pour l'organisation" }
      },
      "required": ["articleId"]
    }
  },
  {
    "name": "add_custom_line",
    "description": "Ajoute une ligne de devis sur mesure, totalement hors-catalogue.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "designation": { "type": "STRING", "description": "Libellé de la prestation dictée par l'artisan" },
        "price": { "type": "NUMBER", "description": "Prix unitaire Hors Taxe (HT)" },
        "unit": { "type": "STRING", "description": "Unité de mesure (ex: u, ml, forfait, h)" },
        "quantity": { "type": "NUMBER", "description": "Quantité appliquée" },
        "sectionName": { "type": "STRING", "description": "Optionnel : Rubrique d'insertion" }
      },
      "required": ["designation", "price", "unit", "quantity"]
    }
  },
  {
    "name": "update_article",
    "description": "Modifie la quantité, le prix ou la désignation d'une ligne existante via son identifiant unique temporaire.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "lineItemId": { "type": "STRING", "description": "L'identifiant unique de la ligne généré par le store (extrait du contexte du devis actuel fourni dans le prompt système)" },
        "quantity": { "type": "NUMBER", "description": "Nouvelle quantité de remplacement" },
        "price": { "type": "NUMBER", "description": "Nouveau prix unitaire appliqué" },
        "designation": { "type": "STRING", "description": "Modification éventuelle de l'intitulé" }
      },
      "required": ["lineItemId"]
    }
  },
  {
    "name": "remove_article",
    "description": "Supprime une ligne de devis ciblée via son identifiant unique.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "lineItemId": { "type": "STRING", "description": "L'ID unique de la ligne (lineItemId) à supprimer" }
      },
      "required": ["lineItemId"]
    }
  },
  {
    "name": "delete_section",
    "description": "Supprime une section entière du devis avec toutes ses lignes d'un seul coup.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "sectionName": { "type": "STRING", "description": "Le nom exact de la rubrique à purger" }
      },
      "required": ["sectionName"]
    }
  },
  {
    "name": "set_tva",
    "description": "Modifie le taux de TVA appliqué globalement au devis.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "rate": { 
          "type": "NUMBER", 
          "enum": [5.5, 10, 20],
          "description": "Taux réglementaire strict à appliquer" 
        }
      },
      "required": ["rate"]
    }
  },
  {
    "name": "apply_discount",
    "description": "Applique une réduction commerciale sur le devis global.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "type": { 
          "type": "STRING", 
          "enum": ["percent", "fixed"],
          "description": "Format de la remise : 'percent' (pourcentage) ou 'fixed' (montant fixe en euros)" 
        },
        "value": { "type": "NUMBER", "description": "La valeur chiffrée de la remise (ex: 10 pour 10% ou 150 pour 150€)" }
      },
      "required": ["type", "value"]
    }
  },
  {
    "name": "answer_question",
    "description": "Utilisé pour formuler des réponses textuelles directes à l'artisan au sujet du devis (calculs de prix, récapitulatifs, relecture de lignes) sans modifier l'état.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "userMessageFeedback": { "type": "STRING", "description": "La réponse textuelle métier claire et concise à restituer à l'artisan." }
      },
      "required": ["userMessageFeedback"]
    }
  },
  {
    "name": "trigger_pdf_export",
    "description": "Active instantanément la génération et le téléchargement du document au format PDF côté client.",
    "parameters": {
      "type": "OBJECT",
      "properties": {}
    }
  },
  {
    "name": "reset_quote",
    "description": "Réinitialise l'application à l'état d'origine en vidant l'intégralité du document en cours.",
    "parameters": {
      "type": "OBJECT",
      "properties": {}
    }
  },
  {
    "name": "request_clarification",
    "description": "Intercepte une intention ambiguë nécessitant un arbitrage entre plusieurs articles proches du catalogue.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "userMessageFeedback": { "type": "STRING", "description": "Question courte posée à l'artisan pour lui demander de préciser sa pensée." },
        "candidates": {
          "type": "ARRAY",
          "items": { "type": "STRING" },
          "description": "Liste des IDs d'articles du catalogue impliqués dans le conflit pour affichage immédiat de boutons cliquables."
        }
      },
      "required": ["userMessageFeedback"]
    }
  },
  {
    "name": "unknown_action",
    "description": "Déclenché en cas de propos hors-sujet, incompréhensibles ou en dehors du spectre de l'application.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "userMessageFeedback": { "type": "STRING", "description": "Message invitant poliment l'artisan à reformuler sa demande concernant le chantier." }
      },
      "required": ["userMessageFeedback"]
    }
  }
]
```    

# **9. Architecture Flux**

```text
Utilisateur
↓
Voix ou texte
↓
Speech-to-Text
↓
Prompt utilisateur
↓
Gemini + Function Calling
↓
Tool Call structuré
↓
Store Zustand
↓
Mise à jour devis
↓
UI temps réel
```


---
# **10. Fonctionnalités MVP**

# 10.1 Conversation IA

## Entrées supportées

### Voix

- Push-to-talk
- Transcription temps réel
- Validation manuelle possible
- La voix ne déclenche jamais automatiquement l'appel Gemini. Elle remplit uniquement le champ de saisie/chat.
- L'utilisateur garde toujours le contrôle final via le bouton Envoyer ou une validation manuelle avant traitement IA.

---

### Texte

- Input texte classique
- Fallback clavier

---

# 10.2 Feedback Visuel Temps Réel

Pendant la dictée :

- le texte apparaît en live ( coté chat ),
- l'utilisateur peut corriger la transcription avant envoi,
- après validation / envoi manuel :
  - les lignes devis apparaissent ( coté devis ) ,
  - les totaux se mettent à jour,
  - les rubriques se créent.

---

# 10.3 Catalogue Mock

## Source

Fichier TypeScript statique.



---

## Taille MVP

60  articles réalistes et 15 interventions composés .

---

## Domaines couverts

### Plomberie

- douche,
- WC,
- évier,
- robinetterie,
- chauffe-eau.

---



# 10.4 Matching Sémantique IA



Le LLM :

- comprend l'intention,
- sélectionne les articles les plus proches du catalogue.

Exemple :

```text
"changer douche"
```

→

```text
"réparation WC"
```

---


# 10.6 Edition Manuelle

Même si l'IA est prioritaire.

Chaque ligne possède :

- bouton éditer,
- bouton supprimer.

---

# 10.7 Export PDF

## Contenu
- information d'entreprise de l'artisant
- informations client,
- date,
- rubriques,
- lignes,
- totaux,
- TVA,
- réduction.

---

## Déclenchement

Conversationnel.

Exemple :

```text
"Exporter le devis en PDF"
```

ou bouton UI.


---
# 10.8 Gestion intégrée des paramètres de l'entreprise. 
Un bouton (icone setting ) "Paramètres. " affiche un ecran qui permet à l'artisan de configurer les données  de son entreprise (stockées en LocalStorage). Une partie de ces informations est automatiquement injectée sur le devis visuel et l'export PDF.
* **Informations Entreprise :** Nom de la société, Nom de l'artisan, Adresse, Code Postal, Ville, SIRET, Téléphone, Email.  
* **Paramètres Financiers :** Taux de TVA appliqué par défaut (5.5%, 10%, 20%).

# 11. Gestion Conversationnelle

## 11.1 Le système doit supporter les corrections naturelles.

Exemples :

```text
"Finalement enlève le siphon"
```

```text
"Mets du Hansgrohe"
```

```text
"Ajoute une réduction"
```

## 11.2 Interception des clarifications 
 Lorsque le store Zustand intercepte un tool call de type request_clarification contenant un tableau candidates, l'interface utilisateur (sur mobile comme sur desktop) doit mapper ces IDs avec le fichier du catalogue pour afficher instantanément des boutons d'action rapides et tactiles sous la zone de chat / transcription.

L'artisan doit pouvoir résoudre l'ambiguïté de deux manières équivalentes :

À la voix / au clavier : En répondant directement ("Prends le Grohe", "Le premier").

Au clic : En tapant directement sur l'un des boutons générés à l'écran, ce qui envoie immédiatement l'action add_article correspondante au store.

---

# 12. Gestion des Exceptions

## Cas possibles

### 1. Aucun article pertinent

Réponse :

```text
Je n'ai trouvé aucun article correspondant.
```

---

### 2. Ambiguïté

Exemple :

```text
"supprime le robinet"
```

mais plusieurs robinets existent.

Réponse :

```text
Quel robinet souhaitez-vous supprimer ?
```

---

### 3. Aucune action détectée

Tool :

```text
unknown_action
```

---




---

# 13. Hors Scope MVP

- Authentification
- Multi-utilisateurs
- Backend complexe
- Base de données SQL
- Historique cloud
- Paiement
- Signature électronique
- Catalogue dynamique
- Multi-métiers complet
- OCR facture
- Photo IA
- Offline

---

# 14. Vision Future

## Evolutions possibles

- vrai catalogue dynamique,
- Supabase,
- historique devis,
- IA photo chantier,
- mode offline,
- suggestions intelligentes,
- apprentissage habitudes artisan,
- multi-corps de métier,
- synchronisation cloud,
- mode tablette chantier.

---

# 15. Philosophie Architecture Finale

VoixDevis n'est PAS un chatbot.

VoixDevis est :

- un moteur de devis,
- piloté par conversation naturelle,
- assisté par IA,
- avec un état structuré,
- et des actions métier contrôlées.

Le LLM sert à comprendre l'humain.

L'application conserve la maîtrise métier.


# **16. Architecture Mobile/Desktop**

## Mobile-first

Partie Gauche: Le Chat (L'Assistant)
C'est la que l'artisan balance ses infos en langage naturel (texte ou voix via le micro du PC , bouton micro) 
Il peut écrire aussi .
Partie Droite: Le Devis (Le Rendu)
C'est le document final qui se construit en temps reel sous ses yeux.
Il ressemble à un vrai PDF, propre, structuré

- lorsque l'utilisateur envoi le prompt , le text apparais dans la zone chat , un signe de traitement apparait (load) coté chat jusqu'au fin de traitement et changement coté devis et enfin le champs de saisie redeviens vide 

- en haut dans le coté gauche il y a aussi le bouton "paramétres" qui nous fais acceder la ou on peut fournir les données de l'entreprise de l'artisan.

- il y a aussi le bouton " nouveau devis" qui connecte l'application au llm si elle n'est pas connecté  et renitialise le devis en localstorage et affiche le greeting message "Nouveau devis prêt. Je vous écoute pour le client ou le premier article " et attends le request de l'artisan .

### Mobile

Navigation par onglets.( entre ecran de prompt/voix/chat et ecran de devis )

### Desktop

Mode split screen ( ecran de prompt/voix/chat coté gauche  et ecran de devis de l'autre coté droite ).




# **17\. Critères de Succès du MVP**

* ---

  Précision du matching sémantique avec le catalogue mocké transmis à Gemini.  
* Décomposition instantanée et modifications fluides en langage naturel des articles issus d'un modèle d'intervention.  
* Robustesse de la saisie libre via l'outil add\_custom\_line.  
* Affichage correct et professionnel des coordonnées de l'entreprise issues des Paramètres sur le PDF final.  
* Stabilité de la captation vocale en environnement semi-bruyant via l'API STT sélectionnée.



| Critère | Objectif |
|---|---|
| Ajout article vocal | Fonctionnel |
| Conversation naturelle | Fonctionnelle |
| Mise à jour devis temps réel | Fonctionnelle |
| Function calling Gemini | Fonctionnel |
| Export PDF | Fonctionnel |
| Responsive mobile | Fonctionnel |
| Feedback live transcription | Fonctionnel |
