# Architecture - VoixDevis MVP

Version: 1.0  
Date: Juin 2026  
Statut: document de cadrage avant implementation

## 1. Objectif du document

Ce document definit l'architecture cible du MVP VoixDevis a partir du PRD, du prompt systeme et du catalogue embarque.

VoixDevis n'est pas un chatbot. C'est un moteur de devis pilote par langage naturel:

- l'utilisateur parle ou ecrit une demande metier;
- Gemini traduit cette demande en tool calls stricts;
- l'application execute ces tool calls dans un store local controle;
- l'interface affiche le devis en temps reel;
- l'export PDF restitue le document final avec les informations entreprise et client.

Le document ne decrit pas une architecture cloud complete. Il cadre un MVP local-first, sans authentification, sans base de donnees et sans historique serveur.

## 2. Sources analysees

- `docs/PRD.md`: vision produit, parcours, outils metier, contraintes MVP.
- `ai/promptSystem.ts`: role systeme Gemini, regles de matching, gestion des modifications par `lineItemId`.
- `data/catalog.ts`: 60 articles plomberie, 15 templates d'intervention et helpers de resolution.
- Guides locaux Next.js 16 dans `node_modules/next/dist/docs/`: structure App Router, Server/Client Components, Route Handlers, variables d'environnement.
- Documentation officielle Gemini Function Calling consultee pour cadrer l'adapter d'appel modele.

## 3. Hypotheses et decisions non bloquantes

Les informations disponibles suffisent pour produire l'architecture. Les points suivants sont donc poses comme decisions MVP, pas comme questions bloquantes:

- Le domaine du MVP est la plomberie. L'exemple PRD "cloison + verriere" est considere comme exemple UX historique ou futur multi-metier, pas comme scope catalogue actuel.
- La cle Gemini reste uniquement cote serveur, dans une variable d'environnement non exposee au navigateur.
- Le devis actif, les parametres entreprise et la conversation sont persistants en `localStorage` via Zustand.
- Le serveur ne possede pas l'etat du devis. Il recoit un snapshot courant, demande a Gemini une interpretation, puis renvoie des tool calls au client.
- L'export PDF est genere cote client, car le devis et les parametres sont locaux.

## 4. Principes d'architecture

### 4.1 Separation des responsabilites

L'application est decoupee en quatre couches:

- UI: capture voix/texte, chat, panneaux de devis, parametres, edition manuelle, export.
- State: Zustand comme source de verite locale du devis et des preferences.
- IA: Route Handler Next.js qui appelle Gemini et renvoie des intentions structurees.
- Domaine: fonctions pures d'application des tool calls, calculs de totaux, resolution catalogue/templates.

Le LLM ne modifie jamais directement le devis. Il produit uniquement des ordres structures.

### 4.2 Local-first

Le MVP doit fonctionner sans compte utilisateur ni backend persistant. Les donnees persistantes sont:

- devis courant;
- messages de conversation utiles;
- parametres entreprise;
- taux de TVA par defaut;
- eventuellement dernier etat de clarification.

La persistance locale doit etre versionnee pour permettre des migrations simples du schema Zustand.

### 4.3 Fonctionnement deterministe du metier

Tous les calculs et mutations sont controles par le code applicatif:

- les prix viennent du catalogue ou d'une ligne custom dictee;
- les templates sont decomposes en lignes atomiques;
- les totaux HT, remise, TVA et TTC sont recalcules par selectors;
- les suppressions/modifications ciblent toujours un `lineItemId`, jamais un `articleId`.

### 4.4 Mobile-first

Mobile:

- navigation par onglets entre Conversation et Devis;
- actions tactiles larges;
- boutons de clarification sous la zone de chat.

Desktop:

- split screen fixe: conversation a gauche, devis a droite;
- devis rendu comme une page professionnelle;
- parametres accessibles depuis la zone conversation.

## 5. Architecture globale

```text
Utilisateur
  |
  | voix / texte
  v
Client Next.js
  |
  | transcription Web Speech API
  | message + catalogue + contexte devis
  v
Route Handler app/api/ai/route.ts
  |
  | prompt systeme + tools Gemini + snapshot
  v
Gemini Function Calling
  |
  | tool calls structures
  v
Client tool executor
  |
  | validation + application domaine
  v
Zustand store local
  |
  | selectors
  v
UI temps reel + export PDF
```

## 6. Organisation cible des dossiers

Structure recommandee:

```text
app/
  api/
    ai/
      route.ts
  layout.tsx
  page.tsx
  globals.css

ai/
  promptSystem.ts
  tools.ts
  geminiClient.ts
  promptBuilder.ts

components/
  app-shell/
    AppShell.tsx
    MobileTabs.tsx
    DesktopSplit.tsx
  chat/
    ChatPanel.tsx
    MessageList.tsx
    Composer.tsx
    VoiceRecorder.tsx
    ClarificationActions.tsx
  quote/
    QuotePreview.tsx
    QuoteHeader.tsx
    QuoteSection.tsx
    QuoteLineItem.tsx
    QuoteTotals.tsx
  settings/
    SettingsDialog.tsx
    CompanyForm.tsx
  pdf/
    QuotePdfDocument.tsx
    ExportPdfButton.tsx
  ui/
    ...

data/
  catalog.ts

domain/
  quoteTypes.ts
  catalogTypes.ts
  toolTypes.ts
  quoteActions.ts
  quoteCalculations.ts
  catalogLookup.ts
  toolExecutor.ts
  validation.ts

store/
  useQuoteStore.ts
  persistConfig.ts
  selectors.ts

hooks/
  useSpeechRecognition.ts
  useAiConversation.ts
  usePdfExport.ts

lib/
  ids.ts
  money.ts
  dates.ts
```

Raison de ce decoupage:

- `app/` reste centre sur le routage Next.js.
- `components/` porte l'interface.
- `domain/` contient les regles testables sans React.
- `store/` contient Zustand et la persistance.
- `ai/` contient le contrat avec Gemini et la construction de prompt.
- `data/` contient le catalogue mock.

## 7. Frontend Next.js

### 7.1 Server Components et Client Components

Par defaut, `app/page.tsx` peut rester un Server Component minimal qui rend un composant interactif principal:

```text
app/page.tsx
  -> components/app-shell/AppShell.tsx ("use client")
```

Les composants qui utilisent Zustand, `localStorage`, Web Speech API, edition de formulaire ou interactions doivent etre Client Components.

Composants client obligatoires:

- `AppShell`;
- `ChatPanel`;
- `Composer`;
- `VoiceRecorder`;
- `QuotePreview`;
- `QuoteLineItem`;
- `SettingsDialog`;
- `ExportPdfButton`;
- providers eventuels.

Les modules server-only:

- `ai/geminiClient.ts`;
- lecture de `process.env.GEMINI_API_KEY`;
- Route Handler `app/api/ai/route.ts`.

### 7.2 Route Handler IA

Endpoint cible:

```text
POST /api/ai
```

Responsabilites:

- valider le payload client;
- construire le prompt avec:
  - `SYSTEM_PROMPT`;
  - `[CATALOGUE_DISPONIBLE]`;
  - `[CONTEXTE_DEVIS_ACTUEL]`;
  - message utilisateur;
- declarer les function tools Gemini;
- appeler Gemini cote serveur;
- normaliser la reponse en format interne;
- renvoyer les tool calls au client.

Le Route Handler ne doit pas:

- executer les tool calls metier;
- stocker le devis;
- exposer la cle API;
- produire un PDF;
- faire confiance a des `lineItemId` sans validation cote client.

Contrat de reponse recommande:

```ts
type AiRouteResponse = {
  assistantMessage?: string;
  toolCalls: AiToolCall[];
  rawModel?: {
    model: string;
    functionCallIds?: string[];
  };
};
```

La propriete `rawModel` est optionnelle et reservee au debug local. Elle ne doit pas afficher de donnees sensibles.

## 8. Contrats de donnees

### 8.1 Catalogue

Le catalogue actuel expose:

```ts
type CatalogArticle = {
  id: string;
  designation: string;
  unit: string;
  price: number;
  keywords: string[];
};

type InterventionTemplate = {
  id: string;
  title: string;
  keywords: string[];
  items: {
    articleId: string;
    defaultQuantity: number;
  }[];
};
```

Regle importante: les templates ne sont jamais stockes comme une ligne unique dans le devis. Ils sont resolus en lignes atomiques avec un lien optionnel vers le template source.

### 8.2 Devis

Modele cible:

```ts
type Quote = {
  id: string;
  status: "draft";
  createdAt: string;
  updatedAt: string;
  quoteNumber?: string;
  client: ClientInfo;
  sections: QuoteSection[];
  discount?: Discount;
  tvaRate: 5.5 | 10 | 20;
};

type ClientInfo = {
  name?: string;
  address?: string;
  city?: string;
};

type QuoteSection = {
  id: string;
  name: string;
  lineItems: QuoteLineItem[];
};

type QuoteLineItem = {
  lineItemId: string;
  source: "catalog" | "template" | "custom";
  articleId?: string;
  templateId?: string;
  designation: string;
  unit: string;
  quantity: number;
  unitPriceHt: number;
};

type Discount = {
  type: "percent" | "fixed";
  value: number;
};
```

Decisions:

- `lineItemId` est l'identifiant de mutation UI/IA.
- `articleId` est uniquement une reference catalogue.
- `templateId` permet d'indiquer qu'une ligne vient d'un pack, mais ne rend pas la ligne dependante du pack apres insertion.
- Les prix sont copies au moment de l'insertion pour permettre l'edition manuelle ulterieure.

### 8.3 Parametres entreprise

```ts
type CompanySettings = {
  companyName?: string;
  artisanName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  siret?: string;
  phone?: string;
  email?: string;
  defaultTvaRate: 5.5 | 10 | 20;
};
```

Ces donnees sont:

- editees dans l'ecran Parametres;
- stockees en `localStorage`;
- injectees dans le devis visuel;
- injectees dans l'export PDF;
- utilisees pour initialiser `quote.tvaRate` lors d'un nouveau devis.

## 9. Store Zustand

### 9.1 Slices recommandees

```text
useQuoteStore
  quoteSlice
    currentQuote
    createNewQuote()
    resetQuote()
    setClientInfo()
    addArticle()
    applyInterventionTemplate()
    addCustomLine()
    updateArticle()
    removeArticle()
    deleteSection()
    setTva()
    applyDiscount()

  settingsSlice
    companySettings
    updateCompanySettings()

  conversationSlice
    messages
    isProcessing
    liveTranscript
    clarification
    addUserMessage()
    addAssistantMessage()
    setClarification()
    clearClarification()
```

### 9.2 Selectors

Selectors purs:

- `selectSubtotalHt`;
- `selectDiscountAmount`;
- `selectTotalAfterDiscountHt`;
- `selectTvaAmount`;
- `selectTotalTtc`;
- `selectQuoteContextForPrompt`;
- `selectCompanySettingsForPdf`;
- `selectLineItemById`;
- `selectArticlesByCandidateIds`.

Les totaux ne doivent pas etre stockes si possible. Ils sont derives pour eviter les incoherences.

### 9.3 Persistance

La persistance Zustand doit stocker:

- `currentQuote`;
- `companySettings`;
- `messages` si utile pour l'UX;
- schema version.

Elle ne doit pas stocker:

- `isProcessing`;
- `liveTranscript`;
- erreurs transitoires;
- reponses brutes Gemini;
- donnees sensibles serveur.

## 10. Tool calls et execution metier

### 10.1 Liste des tools MVP

Le contrat effectif doit couvrir:

- `set_client_info`;
- `apply_intervention_template`;
- `add_article`;
- `add_custom_line`;
- `update_article`;
- `remove_article`;
- `delete_section`;
- `set_tva`;
- `apply_discount`;
- `answer_question`;
- `trigger_pdf_export`;
- `reset_quote`;
- `request_clarification`;
- `unknown_action`.

Le PRD liste certains tools en deux endroits. L'implementation doit retenir la liste complete du bloc "detail de tools", car elle inclut `delete_section`, `answer_question` et `reset_quote`, deja references par le prompt systeme.

### 10.2 Format interne des tool calls

```ts
type AiToolCall =
  | { name: "set_client_info"; args: SetClientInfoArgs }
  | { name: "apply_intervention_template"; args: ApplyInterventionTemplateArgs }
  | { name: "add_article"; args: AddArticleArgs }
  | { name: "add_custom_line"; args: AddCustomLineArgs }
  | { name: "update_article"; args: UpdateArticleArgs }
  | { name: "remove_article"; args: RemoveArticleArgs }
  | { name: "delete_section"; args: DeleteSectionArgs }
  | { name: "set_tva"; args: SetTvaArgs }
  | { name: "apply_discount"; args: ApplyDiscountArgs }
  | { name: "answer_question"; args: AnswerQuestionArgs }
  | { name: "trigger_pdf_export"; args: Record<string, never> }
  | { name: "reset_quote"; args: Record<string, never> }
  | { name: "request_clarification"; args: RequestClarificationArgs }
  | { name: "unknown_action"; args: UnknownActionArgs };
```

### 10.3 Executor client

`domain/toolExecutor.ts` recoit une liste de tool calls et applique les effets dans l'ordre.

Regles:

- valider le nom du tool;
- valider les arguments;
- ignorer/refuser les `articleId` inconnus;
- refuser les `templateId` inconnus;
- refuser les `lineItemId` absents du devis;
- creer automatiquement une section si `sectionName` est fourni et absent;
- utiliser une section par defaut si aucune section n'est fournie;
- executer `trigger_pdf_export` comme un evenement UI, pas comme mutation du devis;
- executer `answer_question`, `unknown_action` et `request_clarification` comme messages assistant ou etat UI;
- ne pas appliquer d'action metier apres une clarification si le modele demande explicitement un choix utilisateur.

### 10.4 Application des templates

Algorithm:

```text
apply_intervention_template(templateId, sectionName)
  1. chercher le template
  2. trouver ou creer la section
  3. pour chaque item:
     - chercher l'article catalogue
     - creer un lineItemId
     - copier designation, unit, price
     - appliquer defaultQuantity
     - definir source = "template"
     - definir templateId = template.id
  4. recalculer l'UI via selectors
```

### 10.5 Clarification

Quand Gemini appelle `request_clarification`:

- le store conserve `userMessageFeedback`;
- le store conserve les `candidates`;
- l'UI mappe chaque ID vers le catalogue;
- des boutons tactiles apparaissent sous le chat;
- clic sur un candidat execute directement `add_article` avec l'ID choisi;
- reponse vocale ou texte renvoie un nouveau message a Gemini avec le contexte de clarification.

## 11. Construction du prompt

`ai/promptBuilder.ts` doit produire un contenu compact mais complet:

```text
[SYSTEM_PROMPT]

[CATALOGUE_DISPONIBLE]
Articles: [...]
InterventionTemplates: [...]

[CONTEXTE_DEVIS_ACTUEL]
Client: ...
Sections:
- Section ...
  - lineItemId=... articleId=... designation=... quantity=... unitPriceHt=...
Totaux: ...
Remise: ...
TVA: ...

[MESSAGE_UTILISATEUR]
...
```

Principes:

- le catalogue doit inclure les IDs stricts;
- le contexte devis doit inclure les `lineItemId`;
- les donnees envoyees au modele doivent rester utiles et courtes;
- les parametres entreprise ne sont pas necessaires pour le matching sauf demande explicite;
- l'historique complet de chat n'est pas requis pour le MVP si le devis courant est bien injecte.

## 12. Gemini adapter

### 12.1 SDK et modele

L'architecture prevoit un adapter `ai/geminiClient.ts` pour isoler l'application du SDK exact.

Responsabilites:

- initialiser le client avec `GEMINI_API_KEY`;
- declarer les function tools;
- appeler le modele configure;
- extraire les `functionCalls`;
- normaliser les arguments;
- gerer les erreurs reseau ou quota.

Le modele exact doit etre configure via variable d'environnement:

```text
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.5-flash
```

Le nom du modele reste configurable pour ne pas coupler le code MVP a une version Gemini precise.

### 12.2 Gestion des function call IDs

Les APIs Gemini recentes peuvent associer un `id` aux function calls. Le MVP peut simplement renvoyer ces IDs en metadata de debug si aucune boucle `functionResponse` n'est utilisee.

Si une future version veut renvoyer les resultats d'execution a Gemini dans la meme conversation serveur, l'adapter devra conserver l'ID du function call et le rattacher au `functionResponse` correspondant.

## 13. Speech-to-Text

Le hook `useSpeechRecognition.ts` encapsule la Web Speech API.

Etat attendu:

- `isSupported`;
- `isListening`;
- `transcript`;
- `interimTranscript`;
- `error`;
- `start()`;
- `stop()`;
- `reset()`.

UX:

- push-to-talk;
- transcription live dans le chat;
- validation manuelle possible;
- la voix remplit le champ de saisie mais ne déclenche jamais automatiquement Gemini;
- l'utilisateur peut corriger la transcription avant de l'envoyer;
- fallback texte si API indisponible;
- indication claire de traitement apres envoi.

La Web Speech API etant dependante du navigateur, aucun code STT ne doit etre execute dans un Server Component.

## 14. UI et experience

### 14.1 AppShell

`AppShell` orchestre:

- layout mobile/desktop;
- etat de l'onglet actif;
- ouverture des parametres;
- nouveau devis;
- feedback global de traitement.

### 14.2 Conversation

`ChatPanel` contient:

- en-tete avec Parametres et Nouveau devis;
- liste des messages;
- zone de transcription live;
- boutons de clarification;
- input texte;
- bouton micro.

Lorsqu'un message est envoye:

1. la voix, si utilisee, a seulement rempli le champ de saisie;
2. l'utilisateur valide explicitement avec Envoyer ou une action equivalente;
3. le message utilisateur apparait immediatement;
4. `isProcessing` passe a `true`;
5. le champ est vide;
6. l'appel `/api/ai` est lance;
7. les tool calls sont appliques;
8. un message assistant court est affiche si pertinent;
9. `isProcessing` repasse a `false`.

### 14.3 Devis

`QuotePreview` affiche un rendu proche PDF:

- informations entreprise;
- informations client;
- date;
- numero de devis si disponible;
- sections;
- lignes;
- quantites;
- unites;
- prix unitaires HT;
- totaux par ligne;
- remise;
- total HT;
- TVA;
- total TTC.

Chaque ligne doit offrir:

- edition manuelle;
- suppression;
- indication discrete si ligne custom ou issue du catalogue si utile.

### 14.4 Parametres

`SettingsDialog` ou une route modale locale permet de modifier:

- societe;
- artisan;
- adresse;
- code postal;
- ville;
- SIRET;
- telephone;
- email;
- TVA par defaut.

Au changement de TVA par defaut:

- les nouveaux devis utilisent cette valeur;
- le devis courant conserve sa TVA si l'utilisateur l'a deja modifiee, sauf choix explicite d'appliquer au devis courant.

## 15. Export PDF

Bibliotheque prevue: `react-pdf`.

Flux:

```text
Utilisateur clique Export PDF
  ou Gemini appelle trigger_pdf_export
    -> usePdfExport()
      -> construit QuotePdfDocument
      -> genere le fichier
      -> declenche le telechargement
```

Le PDF doit recevoir un snapshot immutable:

```ts
type PdfQuoteSnapshot = {
  quote: Quote;
  companySettings: CompanySettings;
  totals: QuoteTotals;
};
```

Regles:

- ne pas recalculer differemment les totaux dans le PDF;
- utiliser les memes selectors que l'UI;
- formater les montants de maniere centralisee;
- generer un nom de fichier stable, par exemple `devis-YYYY-MM-DD-client.pdf`.

## 16. Calculs financiers

Les calculs doivent etre centralises dans `domain/quoteCalculations.ts`.

Formules:

```text
lineTotalHt = quantity * unitPriceHt
subtotalHt = somme(lineTotalHt)

discountAmount =
  type percent: subtotalHt * value / 100
  type fixed: min(value, subtotalHt)

totalAfterDiscountHt = subtotalHt - discountAmount
tvaAmount = totalAfterDiscountHt * tvaRate / 100
totalTtc = totalAfterDiscountHt + tvaAmount
```

Regles:

- les montants internes restent en nombres;
- l'arrondi d'affichage est fait au dernier moment;
- une remise fixe ne peut pas rendre le total negatif;
- une TVA hors enum est refusee.

## 17. Validation et robustesse

### 17.1 Validation des entrees IA

Chaque tool call venant du modele doit etre traite comme une entree non fiable.

Validations minimales:

- `articleId` existe dans `Articles`;
- `templateId` existe dans `InterventionTemplates`;
- `lineItemId` existe dans le devis courant;
- `quantity` est positive;
- `price` est positif ou nul selon decision produit;
- `rate` est dans `5.5 | 10 | 20`;
- `discount.value` est positif;
- `sectionName` est nettoye;
- `designation` custom est non vide.

### 17.2 Gestion des erreurs

Erreurs attendues:

- Gemini indisponible;
- API key absente;
- tool call inconnu;
- argument invalide;
- article/template introuvable;
- Web Speech API non supportee;
- generation PDF echouee;
- localStorage indisponible ou plein.

UX:

- afficher un message court cote chat;
- ne pas corrompre le devis;
- conserver le message utilisateur pour permettre une relance;
- journaliser en console seulement en developpement.

## 18. Securite et confidentialite

Pour le MVP:

- aucune authentification;
- aucune persistance cloud;
- cle Gemini uniquement cote serveur;
- pas de variable `NEXT_PUBLIC_` pour les secrets;
- pas de donnees client stockees cote serveur;
- pas de logs serveur contenant le devis complet en production.

Le client envoie toutefois le devis courant a Gemini pour permettre les modifications naturelles. L'UX ou les mentions produit devront l'assumer si l'application sort du cadre demo.

## 19. Tests recommandes

### 19.1 Tests unitaires domaine

Couvrir:

- calculs financiers;
- application d'un article;
- application d'un template;
- suppression par `lineItemId`;
- modification par `lineItemId`;
- remise percent/fixed;
- TVA;
- validations d'arguments.

### 19.2 Tests integration IA sans appel reseau

Couvrir avec fixtures:

- reponse Gemini avec `add_article`;
- reponse Gemini avec plusieurs tool calls;
- clarification avec candidates;
- unknown action;
- trigger PDF.

Le parsing de reponse modele doit etre testable sans appeler Gemini.

### 19.3 Tests UI

Couvrir:

- nouveau devis;
- saisie texte;
- boutons de clarification;
- edition/suppression manuelle;
- affichage mobile par onglets;
- desktop split screen;
- ouverture/enregistrement parametres.

## 20. Etapes d'implementation recommandees

Le plan operationnel detaille est maintenu dans `docs/PLAN.md`.

Cette architecture conserve les principes et contraintes de reference. `docs/PLAN.md` est la source de verite pour l'ordre d'implementation, les milestones, les dependances, les tests et les criteres d'acceptation par phase.

## 21. Risques techniques

| Risque | Impact | Mitigation |
|---|---|---|
| Gemini choisit un mauvais ID catalogue | Ligne incorrecte | Prompt strict, catalogue avec keywords, clarification si doute, edition manuelle |
| Gemini utilise `articleId` au lieu de `lineItemId` pour modifier | Mutation impossible | Prompt deja strict, validation executor, contexte devis avec `lineItemId` visible |
| Web Speech API non supportee | Perte voix | Fallback texte obligatoire |
| API key exposee par erreur | Risque securite | Route Handler serveur, aucune variable `NEXT_PUBLIC_` |
| Totaux divergents UI/PDF | Perte confiance | Selectors/calculs centralises |
| LocalStorage corrompu | App bloquee | version de schema, fallback reset local |
| Catalogue trop long dans prompt | Cout/latence | Format compact, champs utiles uniquement, futur indexation si besoin |

## 22. Definition of Done architecture MVP

L'implementation sera conforme a cette architecture si:

- Gemini ne modifie jamais directement le store;
- chaque modification du devis passe par un tool call valide ou une action UI equivalente;
- le devis est la source de verite locale;
- les templates sont decomposes en lignes atomiques;
- les modifications/suppressions utilisent `lineItemId`;
- le PDF reprend les memes donnees et totaux que l'UI;
- la cle Gemini n'est jamais disponible dans le bundle client;
- mobile et desktop proposent les workflows prevus;
- les parametres entreprise alimentent le devis visuel et le PDF;
- les erreurs IA/STT/PDF ne corrompent pas le devis courant.
