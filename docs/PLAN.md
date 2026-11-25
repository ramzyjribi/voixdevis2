# Plan d'implementation - VoixDevis MVP

Version: 1.0  
Date: Juin 2026  
Source: `docs/ARCHITECTURE.md`, section 20 initiale  
Statut: plan operationnel de reference

## 1. Objectif du plan

Ce document transforme les etapes d'implementation recommandees de l'architecture en milestones coherentes, testables et ordonnees.

Chaque phase doit apporter une valeur metier ou technique identifiable, sans introduire de dependance circulaire. Le plan reste volontairement local-first: pas d'authentification, pas de base de donnees serveur, pas de persistance cloud.

## 2. Principes d'execution

- Lire les guides Next.js locaux dans `node_modules/next/dist/docs/` avant toute implementation Next.js significative.
- Conserver Gemini comme traducteur d'intention: l'IA produit des tool calls, l'application garde la maitrise de l'etat.
- Construire d'abord le moteur de devis sans IA, puis brancher l'IA.
- Garder la voix en mode "texte-first avec dictee assistee": la voix remplit le champ, l'utilisateur corrige puis envoie explicitement.
- Centraliser les calculs financiers pour que l'UI et le PDF utilisent les memes resultats.
- Valider tous les tool calls comme des entrees non fiables.
- Executer les phases dans l'ordre, car chaque phase depend des contrats stabilises par la precedente.

## 3. Vue d'ensemble des phases

| Phase | Milestone | Valeur livree | Depend de |
|---|---|---|---|
| 0 | Preparation du socle projet | Ambiguites levees, conventions confirmees | Aucune |
| 1 | Fondations domaine et store | Moteur de devis local deterministe | Phase 0 |
| 2 | UI devis, edition et parametres | App utilisable sans IA | Phase 1 |
| 3 | Conversation texte et dictee assistee | Saisie naturelle controlee | Phase 2 |
| 4 | Gemini Function Calling | IA connectee au moteur metier | Phases 1, 3 |
| 5 | Clarifications et edge cases | Corrections naturelles robustes | Phase 4 |
| 6 | Export PDF | Devis professionnel exportable | Phases 1, 2, 5 |
| 7 | Durcissement, QA et polish | MVP stable et demonstrable | Phases 0 a 6 |

## 4. Matrice des dependances

| Element | Introduit en phase | Utilise par |
|---|---:|---|
| Types domaine devis/catalogue/tools | 1 | 1 a 7 |
| Calculs financiers centralises | 1 | UI, IA context, PDF, tests |
| Store Zustand persistant | 1 | UI, conversation, executor, PDF |
| Rendu devis interactif | 2 | Conversation, IA, PDF validation |
| Parametres entreprise | 2 | Devis visuel, PDF, nouveau devis |
| Chat et composer controle | 3 | IA, clarifications |
| Web Speech API encapsulee | 3 | Chat uniquement |
| Route Handler Gemini | 4 | Conversation IA |
| Tool executor client | 4 | IA, clarifications, PDF trigger |
| Clarification candidates | 5 | UX mobile/desktop, matching ambigu |
| Snapshot PDF | 6 | Export et tests finaux |
| Suites de tests | 7 | Validation MVP |

## 5. Phase 0 - Preparation du socle projet

### Objectif

Securiser les conventions et les contrats avant de produire du code applicatif.

### Prerequis

- `docs/PRD.md`, `docs/ARCHITECTURE.md`, `ai/promptSystem.ts` et `data/catalog.ts` disponibles.
- `package-lock.json` present: `npm` est le gestionnaire de paquets de reference.
- Next.js 16.2.9 deja installe dans le projet.

### Taches detaillees

- Relire les guides Next.js locaux pertinents avant implementation:
  - structure App Router;
  - Server/Client Components;
  - Route Handlers;
  - variables d'environnement.
- Confirmer la liste officielle des tools a implementer:
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
- Acter que le catalogue est disponible sous `data/catalog.ts`.
- Acter la regle UX voix:
  - la voix ne declenche jamais Gemini automatiquement;
  - la dictee remplit le champ de saisie;
  - l'utilisateur corrige si besoin;
  - l'utilisateur envoie explicitement.
- Acter que le MVP est plomberie uniquement.
- Acter que la cle Gemini reste cote serveur.

### Fichiers/dossiers concernes

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `ai/promptSystem.ts`
- `data/catalog.ts`
- `package.json`
- `tsconfig.json`
- `node_modules/next/dist/docs/`

### Dependances a installer

Aucune.

### Criteres d'acceptation

- Les conventions de dossier et de runtime Next.js sont confirmees.
- La liste des tools officielle est unique.
- La strategie STT "texte-first avec dictee assistee" est consideree non negociable.
- Le catalogue est disponible sous un nom TypeScript exploitable: `data/catalog.ts`.
- Aucun code applicatif n'est encore necessaire pour valider cette phase.

### Tests a prevoir

- Verification documentaire: les sections PRD et architecture ne se contredisent pas sur STT, tools et scope plomberie.
- Verification manuelle: `package.json` et `tsconfig.json` confirment Next.js App Router, TypeScript strict et alias `@/*`.

### Risques

- Oublier de renommer le catalogue peut compliquer les imports TypeScript.
- Ajouter des tools non documentes peut rendre le prompt et l'executor incoherents.
- Laisser une ambiguite sur le declenchement vocal peut produire des modifications de devis non voulues.

### Resultat attendu en fin de phase

Le projet a un socle contractuel clair: scope, tools, conventions Next.js, strategie STT et dependances futures sont connus.

## 6. Phase 1 - Fondations domaine et store

### Objectif

Construire un moteur de devis local, deterministe et testable, sans UI complexe et sans IA.

### Prerequis

- Phase 0 terminee.
- Liste officielle des tools confirmee.
- Catalogue plomberie disponible.

### Taches detaillees

- Creer les types domaine:
  - client;
  - entreprise;
  - devis;
  - section;
  - ligne;
  - remise;
  - totaux;
  - tool calls.
- Creer les helpers catalogue:
  - lookup article par ID;
  - lookup template par ID;
  - resolution d'un template en articles atomiques.
- Creer les calculs financiers centralises:
  - total ligne HT;
  - sous-total HT;
  - remise percent/fixed;
  - total HT apres remise;
  - TVA;
  - total TTC.
- Creer les generateurs d'identifiants locaux:
  - `quote.id`;
  - `section.id`;
  - `lineItemId`.
- Creer le store Zustand persistant:
  - devis courant;
  - parametres entreprise;
  - messages conversation si retenus;
  - version de schema de persistence.
- Implementer les actions de devis sans IA:
  - nouveau devis;
  - reset;
  - set client;
  - add article;
  - apply template;
  - add custom line;
  - update line;
  - remove line;
  - delete section;
  - set TVA;
  - apply discount.
- Valider les arguments metier avec une couche de validation dediee.

### Fichiers/dossiers concernes

- `data/catalog.ts`
- `domain/quoteTypes.ts`
- `domain/catalogTypes.ts`
- `domain/toolTypes.ts`
- `domain/catalogLookup.ts`
- `domain/quoteCalculations.ts`
- `domain/quoteActions.ts`
- `domain/validation.ts`
- `store/useQuoteStore.ts`
- `store/selectors.ts`
- `store/persistConfig.ts`
- `lib/ids.ts`
- `lib/money.ts`
- `lib/dates.ts`

### Dependances a installer

- `zustand`
- `zod`

`zod` est retenu des la Phase 1 pour valider les tool args et les donnees restaurees depuis `localStorage`.

### Criteres d'acceptation

- Un devis peut etre cree, modifie, remis a zero et persiste localement.
- Un article catalogue peut etre ajoute avec quantite et section.
- Un template est decompose en lignes atomiques.
- Une ligne est modifiable/supprimable uniquement via `lineItemId`.
- Les totaux sont derives par selectors et non dupliques dans l'etat.
- Une TVA hors `5.5 | 10 | 20` est refusee.
- Une remise fixe ne peut pas rendre le total negatif.

### Tests a prevoir

- Calculs financiers: HT, remise, TVA, TTC.
- Ajout article catalogue.
- Ajout ligne custom.
- Application template.
- Update/remove par `lineItemId`.
- Suppression section.
- Reset devis.
- Persistence Zustand avec version.
- Validation d'IDs inconnus et quantites invalides.

### Risques

- Stocker les totaux au lieu de les deriver peut creer des divergences UI/PDF.
- Confondre `articleId` et `lineItemId` rendra les corrections IA fragiles.
- Ne pas copier les prix catalogue dans les lignes rendra les modifications futures ambigues.

### Resultat attendu en fin de phase

Le moteur de devis fonctionne localement et peut etre teste sans interface finale, sans Gemini et sans PDF.

## 7. Phase 2 - UI devis, edition manuelle et parametres

### Objectif

Obtenir une application utilisable sans IA: l'utilisateur peut voir, organiser et modifier un devis local.

### Prerequis

- Phase 1 terminee.
- Store Zustand disponible.
- Selectors de totaux disponibles.

### Taches detaillees

- Remplacer la page starter par l'AppShell VoixDevis.
- Construire le layout responsive:
  - split screen desktop;
  - onglets mobile Conversation / Devis.
- Construire le rendu devis:
  - informations entreprise;
  - informations client;
  - date;
  - sections;
  - lignes;
  - totaux;
  - TVA;
  - remise.
- Ajouter l'edition manuelle:
  - quantite;
  - prix unitaire HT;
  - designation;
  - suppression ligne;
  - suppression section si disponible.
- Ajouter l'ecran Parametres:
  - nom societe;
  - nom artisan;
  - adresse;
  - code postal;
  - ville;
  - SIRET;
  - telephone;
  - email;
  - TVA par defaut.
- Ajouter le bouton Nouveau devis.
- Connecter les parametres entreprise au devis visuel.
- Preparer les composants UI reutilisables pour chat, clarifications et PDF.

### Fichiers/dossiers concernes

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `components/app-shell/`
- `components/quote/`
- `components/settings/`
- `components/ui/`
- `store/useQuoteStore.ts`
- `store/selectors.ts`

### Dependances a installer

- `lucide-react`
- shadcn/ui via CLI officielle
- Dependances Radix ajoutees par les composants shadcn necessaires

Composants shadcn cibles:

- `button`
- `input`
- `textarea`
- `dialog`
- `tabs`
- `select`
- `tooltip`
- `table`
- `separator`
- `skeleton`
- `sheet` si l'ecran parametres mobile est mieux servi par un panneau lateral.

### Criteres d'acceptation

- Sur desktop, la conversation est a gauche et le devis a droite.
- Sur mobile, l'utilisateur peut basculer entre Conversation et Devis par onglets.
- Le devis ressemble a un document professionnel lisible.
- Les parametres entreprise sont persistants et visibles sur le devis.
- Une ligne peut etre modifiee et supprimee manuellement.
- Le bouton Nouveau devis cree un devis vide avec la TVA par defaut.
- L'UI ne depend pas encore de Gemini.

### Tests a prevoir

- Rendu initial sans devis rempli.
- Rendu avec sections et lignes.
- Edition quantite/prix/designation.
- Suppression ligne.
- Persistence parametres entreprise.
- Creation nouveau devis.
- Responsive mobile/desktop.

### Risques

- Construire une UI trop decorative peut nuire a l'usage chantier.
- Des composants trop couples au store rendront les tests UI plus lourds.
- Une mauvaise gestion mobile peut bloquer l'usage principal du MVP.

### Resultat attendu en fin de phase

VoixDevis est une application locale fonctionnelle sans IA: le devis peut etre visualise, edite et configure.

## 8. Phase 3 - Conversation texte et dictee assistee

### Objectif

Permettre une saisie naturelle controlee par l'utilisateur, en texte et en voix, sans encore appeler Gemini.

### Prerequis

- Phase 2 terminee.
- AppShell et zones Conversation / Devis disponibles.
- Store conversation ou slice conversation pret a recevoir les messages.

### Taches detaillees

- Creer le panneau conversation:
  - liste de messages;
  - etat vide;
  - indicateur de traitement;
  - zone de transcription live;
  - composer texte;
  - bouton micro;
  - bouton envoyer.
- Implementer `useSpeechRecognition.ts` autour de la Web Speech API:
  - detection support;
  - start;
  - stop;
  - reset;
  - transcript final;
  - transcript intermediaire;
  - erreurs micro.
- Appliquer la regle UX:
  - la voix remplit seulement le champ;
  - l'utilisateur peut corriger;
  - l'appel IA ne part qu'apres envoi explicite.
- Ajouter fallback texte si Web Speech API absente.
- Ajouter messages utilisateur localement lors de l'envoi.
- Simuler une reponse assistant locale courte tant que Gemini n'est pas branche.

### Fichiers/dossiers concernes

- `components/chat/ChatPanel.tsx`
- `components/chat/MessageList.tsx`
- `components/chat/Composer.tsx`
- `components/chat/VoiceRecorder.tsx`
- `hooks/useSpeechRecognition.ts`
- `store/useQuoteStore.ts`
- `store/selectors.ts`

### Dependances a installer

Aucune obligatoire.

### Criteres d'acceptation

- L'utilisateur peut envoyer un message texte.
- Le message apparait dans la conversation.
- Le micro remplit le champ si la Web Speech API est disponible.
- La dictee ne declenche jamais d'action automatiquement.
- L'utilisateur peut corriger le texte dicte avant envoi.
- Si la voix est indisponible ou refusee, le texte reste pleinement utilisable.
- Le champ est vide apres envoi manuel.

### Tests a prevoir

- Saisie texte classique.
- Envoi au clavier et au bouton.
- Web Speech API absente.
- Permission micro refusee.
- Transcript intermediaire puis final.
- Correction manuelle avant envoi.
- Verification que Gemini n'est pas appele par `stop()` micro.

### Risques

- Chrome peut couper une session de reconnaissance apres silence.
- Le support navigateur est variable.
- Une transcription approximative en chantier peut produire des erreurs si la validation manuelle est mal visible.

### Resultat attendu en fin de phase

L'application offre une experience conversationnelle controlee, avec texte fiable et dictee assistee prete a etre branchee a Gemini.

## 9. Phase 4 - Gemini Function Calling

### Objectif

Brancher l'IA comme traducteur d'intention vers le moteur metier, sans lui confier l'etat du devis.

### Prerequis

- Phase 1 terminee pour les actions metier.
- Phase 3 terminee pour l'envoi conversationnel.
- Variable d'environnement Gemini disponible en local.

### Taches detaillees

- Creer la declaration officielle des tools Gemini.
- Creer `promptBuilder`:
  - prompt systeme;
  - catalogue compact;
  - contexte devis actuel;
  - message utilisateur.
- Creer l'adapter Gemini cote serveur:
  - initialisation client;
  - choix modele via variable d'environnement;
  - appel Function Calling;
  - normalisation des tool calls.
- Creer le Route Handler `POST /api/ai`.
- Creer `useAiConversation` cote client:
  - prend le message utilisateur;
  - recupere le contexte devis;
  - appelle `/api/ai`;
  - transmet les tool calls a l'executor.
- Creer `toolExecutor` cote client:
  - valide chaque tool call;
  - applique les actions store;
  - traite les messages assistant;
  - refuse les IDs inconnus.
- Ajouter la gestion des erreurs Gemini:
  - API key absente;
  - reseau;
  - reponse sans tool call;
  - tool inconnu;
  - arguments invalides.

### Fichiers/dossiers concernes

- `ai/tools.ts`
- `ai/geminiClient.ts`
- `ai/promptBuilder.ts`
- `ai/promptSystem.ts`
- `app/api/ai/route.ts`
- `domain/toolExecutor.ts`
- `domain/toolTypes.ts`
- `domain/validation.ts`
- `hooks/useAiConversation.ts`
- `components/chat/ChatPanel.tsx`

### Dependances a installer

- SDK Gemini officiel courant: `@google/genai`, sous reserve de verification de la documentation officielle au moment de l'implementation.
- `zod` si non installe en Phase 1.

Variables d'environnement a prevoir:

```text
GEMINI_API_KEY=...
GEMINI_MODEL=...
```

### Criteres d'acceptation

- La cle Gemini n'est jamais exposee au client.
- Un message utilisateur peut produire un tool call `add_article`.
- Plusieurs tool calls peuvent etre appliques dans l'ordre.
- Un `templateId` valide applique un template en lignes atomiques.
- Un `lineItemId` invalide est refuse sans corrompre le devis.
- Le devis courant est toujours modifie par le store, jamais par Gemini directement.
- Les erreurs affichent un message court cote chat.

### Tests a prevoir

- Parsing d'une reponse Gemini fixture avec `add_article`.
- Parsing de plusieurs tool calls.
- Tool inconnu.
- Arguments invalides.
- `articleId` inconnu.
- `templateId` inconnu.
- `lineItemId` introuvable.
- Erreur API key absente.
- Erreur reseau.

### Risques

- Le SDK Gemini peut changer rapidement: isoler l'adapter evite de propager les changements.
- Un prompt trop long peut augmenter latence et cout.
- Une validation insuffisante peut laisser Gemini creer un etat incoherent.

### Resultat attendu en fin de phase

La conversation peut modifier le devis via Gemini Function Calling, avec une frontiere claire entre interpretation IA et mutations applicatives.

## 10. Phase 5 - Clarifications et edge cases metier

### Objectif

Rendre les corrections naturelles et les intentions ambigues robustes dans l'UX reelle.

### Prerequis

- Phase 4 terminee.
- Tool executor operationnel.
- Catalogue accessible cote client pour mapper les candidats.

### Taches detaillees

- Implementer `request_clarification`:
  - stocker `userMessageFeedback`;
  - stocker `candidates`;
  - mapper les IDs vers les articles catalogue;
  - afficher des boutons tactiles.
- Implementer le clic candidat:
  - execute `add_article` localement;
  - nettoie l'etat de clarification;
  - ajoute un message assistant court.
- Gerer la resolution vocale/texte d'une clarification:
  - envoyer la reponse utilisateur a Gemini avec le contexte courant;
  - conserver les candidats dans le contexte si utile.
- Implementer `answer_question`:
  - afficher la reponse assistant;
  - ne pas modifier le devis.
- Implementer `unknown_action`:
  - afficher un message court;
  - ne pas modifier le devis.
- Implementer `reset_quote`:
  - demander une confirmation UI si declenchement manuel;
  - appliquer directement si le flux produit le permet cote IA, selon garde-fou retenu.
- Verifier et couvrir en non-regression `delete_section`, deja implemente en Phase 4.
- Verifier les corrections naturelles:
  - suppression d'un article existant;
  - changement de quantite;
  - remplacement d'article;
  - modification de rubrique.

### Fichiers/dossiers concernes

- `components/chat/ClarificationActions.tsx`
- `components/chat/ChatPanel.tsx`
- `components/chat/MessageList.tsx`
- `domain/toolExecutor.ts`
- `domain/catalogLookup.ts`
- `store/useQuoteStore.ts`
- `store/selectors.ts`

### Dependances a installer

Aucune nouvelle dependance obligatoire.

### Criteres d'acceptation

- Une ambiguite entre deux articles affiche des boutons de choix.
- Un clic candidat ajoute le bon article.
- Une reponse "le premier" ou "prends le Grohe" peut etre traitee par le flux conversationnel.
- `answer_question` ne modifie jamais le devis.
- `unknown_action` ne modifie jamais le devis.
- `reset_quote` vide le devis et restaure un etat propre.
- `delete_section` supprime toutes les lignes de la section cible.

### Tests a prevoir

- Ambiguite mitigeur douche/baignoire.
- Affichage candidats.
- Clic candidat.
- Reponse texte a une clarification.
- Question "on en est a combien ?".
- Propos hors scope.
- Reset devis.
- Delete section.

### Risques

- Si les candidats ne sont pas mappes au catalogue client, les boutons seront incomprehensibles.
- Une clarification non nettoyee peut polluer le message suivant.
- `reset_quote` est destructif pour l'utilisateur: l'UX doit etre claire.

### Resultat attendu en fin de phase

L'application gere les intentions ambigues, les questions simples et les commandes hors scope sans casser le flux de devis.

## 11. Phase 6 - Export PDF

### Objectif

Produire un devis professionnel exportable, coherent avec l'UI et declenchable par bouton ou par conversation.

### Prerequis

- Phase 1 terminee pour les calculs.
- Phase 2 terminee pour les donnees entreprise et client.
- Phase 5 terminee pour le tool `trigger_pdf_export`.

### Taches detaillees

- Installer la bibliotheque PDF.
- Creer un snapshot PDF immutable:
  - devis courant;
  - parametres entreprise;
  - totaux derives.
- Construire le document PDF:
  - header entreprise;
  - client;
  - date;
  - sections;
  - lignes;
  - remise;
  - total HT;
  - TVA;
  - total TTC.
- Creer `usePdfExport`.
- Ajouter un bouton Export PDF dans l'UI.
- Brancher le tool `trigger_pdf_export` a l'evenement d'export.
- Generer un nom de fichier stable:
  - date;
  - nom client si disponible;
  - fallback devis.

### Fichiers/dossiers concernes

- `components/pdf/QuotePdfDocument.tsx`
- `components/pdf/ExportPdfButton.tsx`
- `hooks/usePdfExport.ts`
- `domain/quoteCalculations.ts`
- `store/selectors.ts`
- `components/quote/QuotePreview.tsx`
- `domain/toolExecutor.ts`

### Dependances a installer

- `@react-pdf/renderer`

### Criteres d'acceptation

- Le bouton Export PDF telecharge un fichier.
- Le tool `trigger_pdf_export` declenche le meme export.
- Les donnees entreprise apparaissent dans le PDF.
- Les donnees client apparaissent dans le PDF.
- Les sections et lignes correspondent au devis visuel.
- Les totaux PDF correspondent aux selectors utilises par l'UI.
- La remise et la TVA sont correctement affichees.

### Tests a prevoir

- Export avec devis vide ou minimal.
- Export avec plusieurs sections.
- Export avec ligne custom.
- Export avec template.
- Export avec remise percent.
- Export avec remise fixed.
- Export avec TVA 5.5, 10 et 20.
- Verification du nom de fichier.

### Risques

- Recalculer les totaux dans le PDF peut creer des divergences.
- Les styles PDF peuvent differer fortement du rendu navigateur.
- Les polices ou caracteres speciaux peuvent poser probleme selon la configuration PDF.

### Resultat attendu en fin de phase

Le MVP peut produire un document PDF professionnel et coherent avec le devis affiche.

## 12. Phase 7 - Durcissement, QA et polish MVP

### Objectif

Stabiliser l'application de bout en bout pour une demonstration fiable.

### Prerequis

- Phases 0 a 6 terminees.
- Flux manuel, conversationnel, IA et PDF disponibles.

### Taches detaillees

- Ajouter la configuration de tests unitaires et UI.
- Couvrir les modules domaine critiques.
- Couvrir l'integration IA avec fixtures sans appel reseau.
- Couvrir les composants UI critiques.
- Verifier responsive mobile et desktop.
- Verifier les erreurs:
  - Gemini indisponible;
  - API key absente;
  - Web Speech API absente;
  - permission micro refusee;
  - PDF impossible;
  - localStorage indisponible.
- Nettoyer les logs de debug.
- Verifier `npm run lint`.
- Verifier `npm run build`.
- Faire une revue finale des textes UX courts.
- Faire une revue finale de coherence PRD / architecture / plan.

### Fichiers/dossiers concernes

- `domain/`
- `store/`
- `ai/`
- `components/`
- `hooks/`
- `app/`
- `docs/`
- fichiers de configuration tests a ajouter pendant cette phase.

### Dependances a installer

Dependances de test recommandees:

- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `jsdom`

Playwright n'est pas obligatoire pour le premier durcissement. Il peut etre ajoute si l'equipe veut automatiser les scenarios e2e navigateur apres stabilisation du MVP.

### Criteres d'acceptation

- `npm run lint` passe.
- `npm run build` passe.
- Les tests domaine critiques passent.
- Les tests d'integration IA mockee passent.
- Les workflows manuels principaux sont validables:
  - nouveau devis;
  - ajout article par texte;
  - ajout template par texte;
  - correction d'une ligne;
  - clarification;
  - parametres entreprise;
  - export PDF.
- Aucune erreur testee ne corrompt le devis courant.

### Tests a prevoir

- Unitaires domaine:
  - calculs;
  - actions devis;
  - validation.
- Integration IA mockee:
  - tool call unique;
  - tool calls multiples;
  - clarification;
  - unknown action;
  - trigger PDF.
- UI:
  - saisie texte;
  - edition/suppression;
  - onglets mobile;
  - parametres;
  - export.
- Build:
  - lint;
  - build Next.js.

### Risques

- Tester trop tard les calculs financiers peut masquer des divergences UI/PDF.
- Les tests UI peuvent devenir fragiles si les composants sont trop couples aux details visuels.
- Une dependance Gemini en direct dans les tests rendrait la suite lente et instable.

### Resultat attendu en fin de phase

Le MVP est testable, demonstrable et conforme a l'architecture: l'utilisateur peut creer un devis par conversation controlee, le modifier, le clarifier, le configurer et l'exporter.

## 13. Criteres globaux de fin de MVP

Le MVP est considere termine lorsque:

- Gemini ne modifie jamais directement le store.
- Tous les tool calls passent par validation et executor.
- Le devis reste local-first et persiste en `localStorage`.
- Les templates sont decomposes en lignes atomiques.
- Les modifications et suppressions utilisent `lineItemId`.
- La voix remplit le champ de saisie sans envoi automatique.
- L'utilisateur peut toujours corriger avant traitement IA.
- Les parametres entreprise alimentent l'UI et le PDF.
- Les totaux UI et PDF proviennent des memes calculs.
- Les erreurs IA, STT et PDF ne corrompent pas le devis.
- Les commandes `npm run lint` et `npm run build` passent en fin de Phase 7.

## 14. Notes de dependances

Dependances deja presentes:

- `next`
- `react`
- `react-dom`
- `tailwindcss`
- TypeScript
- ESLint Next

Dependances prevues par phase:

| Phase | Dependances |
|---:|---|
| 1 | `zustand`, `zod` |
| 2 | `lucide-react`, shadcn/ui et composants Radix associes |
| 3 | Aucune obligatoire |
| 4 | `@google/genai` apres verification de la doc officielle Gemini |
| 5 | Aucune nouvelle |
| 6 | `@react-pdf/renderer` |
| 7 | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` |

## 15. Ordre logique et absence de dependances circulaires

- Le domaine precede l'UI pour eviter que la logique metier soit codee dans les composants.
- L'UI manuelle precede Gemini pour valider le store sans incertitude IA.
- La conversation precede Gemini pour separer UX de saisie et interpretation modele.
- Les clarifications suivent Gemini car elles dependent du format `request_clarification`.
- Le PDF suit le moteur et l'UI car il doit reutiliser les donnees et calculs stabilises.
- Le durcissement arrive en dernier, mais les tests unitaires de domaine peuvent commencer des la Phase 1.
