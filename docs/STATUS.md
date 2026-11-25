# Status - VoixDevis MVP

Derniere mise a jour: 2026-06-24
Source de planification: `docs/PLAN.md`  
Architecture de reference: `docs/ARCHITECTURE.md`  
Statut global: Phase 6 terminee, Phase 7 en attente de validation utilisateur

## 1. Reprise rapide

### Etat actuel

- `docs/PRD.md` existe et decrit le MVP.
- `docs/ARCHITECTURE.md` existe et definit l'architecture cible.
- `docs/PLAN.md` existe et detaille les phases d'implementation.
- La section 20 de `docs/ARCHITECTURE.md` renvoie vers `docs/PLAN.md`.
- La regle UX voix est actee: la voix remplit le champ, l'utilisateur corrige, puis envoie explicitement.
- Le catalogue a ete renomme en `data/catalog.ts`.
- La Phase 0 est terminee: guides Next.js locaux relus, tools officiels confirmes, scope plomberie confirme, `npm` confirme.
- La Phase 1 est terminee: dependances `zustand` et `zod` installees, types domaine/tools crees, helpers catalogue/templates crees, calculs financiers centralises crees, generateurs d'IDs crees, store Zustand persistant cree, actions devis locales implementees et tests domaine ajoutes.
- Les controles Phase 1 passent: `npm.cmd run test:domain`, `npm.cmd run lint`, `npm.cmd run build`.
- La Phase 2 est terminee: `lucide-react` installe, shadcn/ui initialise, composants UI requis ajoutes, AppShell responsive cree, rendu devis professionnel cree, ajout manuel article/template/ligne libre branche, edition/suppression de lignes et sections branchee, parametres entreprise persistants crees, bouton Nouveau devis branche.
- Amelioration post-Phase 2: le volet manuel permet de rechercher articles et packs par designation, mots-cles ou ID, tolere une faute legere et conserve la liste complete parcourable quand la recherche est vide.
- Les controles Phase 2 passent: `npm.cmd run test:domain`, `npm.cmd run lint`, `npm.cmd run build`.
- Verification navigateur effectuee sur `http://localhost:3001` avec `next start`: chargement desktop, ajout article, edition quantite, totaux, parametres entreprise et onglet mobile Devis valides.
- La Phase 3 est terminee: panneau conversation cree, liste de messages creee, composer texte branche, bouton micro branche, hook `hooks/useSpeechRecognition.ts` implemente, transcription live affichee et fallback texte conserve.
- La Phase 3 a valide le flux texte-first avant branchement Gemini: la voix remplit le champ et l'utilisateur envoie explicitement.
- Le bouton Nouveau devis repart sur une conversation propre avec un greeting local.
- Les outils manuels client/lignes restent accessibles depuis le panneau lateral de la conversation.
- Les controles Phase 3 passent: `npm.cmd run test:domain`, `npm.cmd run lint`, `npm.cmd run build`.
- Correctif post-Phase 3 applique: la detection Web Speech est maintenant faite apres hydratation navigateur pour eviter un bouton micro bloque a `disabled` apres prerendu Next.
- Verification navigateur automatisee limitee: `next start` repond en HTTP sur `127.0.0.1:3002` depuis le shell, mais le navigateur integre Codex a refuse la connexion locale pendant cette session.
- La Phase 4 est terminee cote implementation: SDK `@google/genai` installe, declarations tools creees, prompt builder cree, adapter serveur cree, route `POST /api/ai` creee, hook client branche et executor local valide.
- Le composer n'utilise plus la reponse locale simulee: l'envoi explicite appelle `/api/ai`, puis les tool calls valides sont appliques par le store.
- La cle Gemini reste cote serveur via `GEMINI_API_KEY`; `GEMINI_MODEL` permet de choisir le modele sans modifier le code.
- L'executor refuse les `articleId`, `templateId`, `lineItemId` et sections inconnus sans corrompre le devis.
- Les controles Phase 4 passent: `npm.cmd run test:domain`, `npm.cmd run lint`, `npm.cmd run build`.
- Verification locale Phase 4: sans `GEMINI_API_KEY`, `POST /api/ai` retourne bien l'erreur courte `Cle Gemini manquante.`.
- Correctif Web Speech desktop/mobile applique: les resultats cumulatifs sont dedupliques, la transcription intermediaire apparait uniquement dans le champ, et le dernier texte intermediaire est conserve si le navigateur termine la session avant de le marquer final.
- Les controles du correctif micro passent: 18 tests, `npm.cmd run lint` et `npm.cmd run build`.
- Le layout racine tolere les attributs ajoutes a `<html>` par les extensions navigateur comme Night Eye, sans masquer les erreurs d'hydratation des composants enfants.
- L'adapter Gemini ne lit plus `response.text` quand la reponse contient des function calls; l'avertissement SDK sur les parties non textuelles est supprime.
- Les erreurs API Gemini conservent leur statut: un quota `429` n'est plus masque en `502`; Vercel journalise maintenant le statut, le modele et un message borne sans secret.
- `delete_section` a ete livre avec l'executor de Phase 4, confirme via Gemini et couvert par un test de non-regression en Phase 5.
- La Phase 5 est terminee: les clarifications affichent des candidats catalogue tactiles, le clic ajoute localement l'article choisi et une reponse texte/voix conserve le contexte de clarification pour Gemini.
- `answer_question` et `unknown_action` restent sans mutation; `reset_quote` et le bouton Nouveau devis demandent une confirmation avant de vider le travail courant.
- Les controles Phase 5 passent: 27 tests, `npm.cmd run lint`, `npm.cmd run build`, parcours Gemini reel desktop et verification responsive mobile sans debordement.
- La Phase 6 est terminee: `@react-pdf/renderer` genere cote client un PDF depuis un snapshot immutable du devis, des parametres entreprise et des totaux centralises.
- Le bouton du devis et le tool Gemini `trigger_pdf_export` utilisent le meme hook d'export et produisent un nom de fichier stable avec la date et le client.
- Les controles Phase 6 passent: 34 tests, `npm.cmd run lint`, `npm.cmd run build`, telechargement manuel et telechargement demande via Gemini verifies dans le navigateur.
- Amelioration post-Phase 6: les raccourcis de remise fixes sont remplaces par un champ numerique libre et un selecteur compact `% / €`, avec recalcul direct et plafond de 100 %.
- Amelioration mobile post-Phase 6: sous le breakpoint desktop, le tableau est remplace par des articles compacts sur deux lignes, depliables pour modifier designation, quantite et prix ou supprimer la ligne.
- Un resume mobile fixe `Total HT / TVA / Total TTC` reste visible tant que les totaux complets sont hors ecran, puis disparait automatiquement a leur entree dans le viewport.
- Le correctif mobile est valide a 375 px sans debordement horizontal; edition, suppression, totaux reactifs, retour desktop, 34 tests, lint et build passent.
- La Phase 7 ne doit pas etre demarree sans validation utilisateur explicite.

### Prochaine action recommandee

Attendre la validation utilisateur avant de demarrer la Phase 7 de `docs/PLAN.md`.


### Commandes de controle utiles

```bash
npm run lint
npm run build
npm run test:domain
```

`npm.cmd run build` peut demander un acces reseau hors sandbox pour recuperer les polices Google utilisees par `next/font`.

## 2. Progression des phases

| Phase | Milestone | Statut | Avancement | Bloque par | Prochaine action |
|---:|---|---|---:|---|---|
| 0 | Preparation du socle projet | Terminee | 100% | Rien | Aucune |
| 1 | Fondations domaine et store | Terminee | 100% | Rien | Aucune |
| 2 | UI devis, edition et parametres | Terminee | 100% | Rien | Aucune |
| 3 | Conversation texte et dictee assistee | Terminee | 100% | Rien | Aucune |
| 4 | Gemini Function Calling | Terminee | 100% | Rien | Aucune |
| 5 | Clarifications et edge cases metier | Terminee | 100% | Rien | Aucune |
| 6 | Export PDF | Terminee | 100% | Rien | Aucune |
| 7 | Durcissement, QA et polish MVP | Non demarree | 0% | Validation utilisateur | Attendre validation avant de demarrer le durcissement MVP |

Legende:

- `Non demarree`: aucun travail d'implementation commence.
- `A demarrer`: prochaine phase active.
- `En cours`: implementation commencee, criteres pas encore tous valides.
- `Terminee`: criteres d'acceptation de la phase valides.
- `Bloquee`: impossible d'avancer sans decision ou correction.

## 3. Checklist de reprise par phase

### Phase 0 - Preparation du socle projet

Statut: Terminee

- [x] Relire `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`.
- [x] Relire `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`.
- [x] Relire `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`.
- [x] Relire `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`.
- [x] Confirmer la liste officielle des tools dans `docs/PLAN.md`.
- [x] Confirmer le scope MVP plomberie uniquement.
- [x] Confirmer la strategie STT: texte-first avec dictee assistee.
- [x] Confirmer que `npm` reste le gestionnaire de paquets.
- [x] Marquer la Phase 0 comme terminee quand tous les points ci-dessus sont faits.

Resultat attendu: contrats de base confirmes et Phase 1 prete a commencer.

### Phase 1 - Fondations domaine et store

Statut: Terminee

- [x] Creer les types domaine.
- [x] Creer les helpers de lookup catalogue/templates.
- [x] Creer les calculs financiers centralises.
- [x] Creer les generateurs d'IDs locaux.
- [x] Installer `zustand`.
- [x] Installer `zod`.
- [x] Creer le store Zustand persistant.
- [x] Implementer les actions de devis sans IA.
- [x] Ajouter les tests unitaires domaine prevus.
- [x] Valider les criteres d'acceptation de la Phase 1 dans `docs/PLAN.md`.

Resultat attendu: moteur de devis local testable sans UI finale, Gemini ni PDF.

### Phase 2 - UI devis, edition manuelle et parametres

Statut: Terminee

- [x] Installer `lucide-react`.
- [x] Initialiser shadcn/ui selon la documentation officielle.
- [x] Ajouter les composants UI shadcn necessaires.
- [x] Remplacer la page starter par l'AppShell.
- [x] Construire le split desktop et les onglets mobile.
- [x] Construire le rendu devis.
- [x] Ajouter l'edition manuelle des lignes.
- [x] Ajouter les parametres entreprise persistants.
- [x] Ajouter le bouton Nouveau devis.
- [x] Ajouter la recherche et le parcours complet des articles et packs dans le volet manuel.
- [x] Tester responsive, edition, suppression et persistence.
- [x] Valider les criteres d'acceptation de la Phase 2 dans `docs/PLAN.md`.

Resultat attendu: application locale utilisable sans IA.

### Phase 3 - Conversation texte et dictee assistee

Statut: Terminee

- [x] Creer le panneau conversation.
- [x] Creer la liste de messages.
- [x] Creer le composer texte.
- [x] Creer le bouton micro.
- [x] Implementer `hooks/useSpeechRecognition.ts`.
- [x] Afficher la transcription live.
- [x] Garantir que la voix ne declenche jamais Gemini automatiquement.
- [x] Ajouter le fallback texte si la Web Speech API est indisponible.
- [x] Tester saisie texte, correction avant envoi et refus micro.
- [x] Valider les criteres d'acceptation de la Phase 3 dans `docs/PLAN.md`.

Resultat attendu: saisie conversationnelle controlee, prete a etre connectee a Gemini.

### Phase 4 - Gemini Function Calling

Statut: Terminee

- [x] Verifier la documentation officielle Gemini au moment de l'implementation.
- [x] Installer le SDK Gemini officiel courant, `@google/genai`.
- [x] Ajouter le support runtime des variables `GEMINI_API_KEY` et `GEMINI_MODEL`.
- [x] Creer `ai/tools.ts`.
- [x] Creer `ai/promptBuilder.ts`.
- [x] Creer `ai/geminiClient.ts`.
- [x] Creer `app/api/ai/route.ts`.
- [x] Creer `hooks/useAiConversation.ts`.
- [x] Creer ou finaliser `domain/toolExecutor.ts`.
- [x] Tester les fixtures Gemini sans appel reseau.
- [x] Valider les criteres d'acceptation de la Phase 4 dans `docs/PLAN.md`.

Resultat attendu: l'IA peut modifier le devis via tool calls valides et executes cote application.

### Phase 5 - Clarifications et edge cases metier

Statut: Terminee

- [x] Implementer `request_clarification`.
- [x] Creer `components/chat/ClarificationActions.tsx`.
- [x] Mapper les candidate IDs vers les articles catalogue.
- [x] Implementer le clic candidat.
- [x] Gerer la resolution texte/voix d'une clarification.
- [x] Implementer `answer_question`.
- [x] Implementer `unknown_action`.
- [x] Implementer `reset_quote`.
- [x] `delete_section` deja implemente en Phase 4 et confirme par un test manuel via Gemini.
- [x] Tester ambiguite, clic candidat, question, hors scope, reset et suppression section.
- [x] Valider les criteres d'acceptation de la Phase 5 dans `docs/PLAN.md`.

Resultat attendu: le flux conversationnel gere les ambiguites et les commandes limites sans corrompre le devis.

### Phase 6 - Export PDF

Statut: Terminee

- [x] Installer `@react-pdf/renderer`.
- [x] Creer le snapshot PDF immutable.
- [x] Creer `components/pdf/QuotePdfDocument.tsx`.
- [x] Creer `components/pdf/ExportPdfButton.tsx`.
- [x] Creer `hooks/usePdfExport.ts`.
- [x] Brancher le bouton export.
- [x] Brancher le tool `trigger_pdf_export`.
- [x] Verifier coherence UI/PDF sur les totaux.
- [x] Tester export avec sections, ligne custom, template, remise et TVA.
- [x] Valider les criteres d'acceptation de la Phase 6 dans `docs/PLAN.md`.

Resultat attendu: devis professionnel exportable en PDF.

### Phase 7 - Durcissement, QA et polish MVP

Statut: Non demarree

- [ ] Installer `vitest`.
- [ ] Installer `@testing-library/react`.
- [ ] Installer `@testing-library/jest-dom`.
- [ ] Installer `jsdom`.
- [ ] Ajouter la configuration de tests.
- [ ] Couvrir les modules domaine critiques.
- [ ] Couvrir l'integration IA avec fixtures.
- [ ] Couvrir les composants UI critiques.
- [ ] Verifier les erreurs Gemini/STT/PDF/localStorage.
- [ ] Nettoyer les logs debug.
- [ ] Executer `npm run lint`.
- [ ] Executer `npm run build`.
- [ ] Valider les criteres globaux de fin de MVP dans `docs/PLAN.md`.

Resultat attendu: MVP stable, testable et demonstrable.

## 4. Decisions verrouillees

- Le MVP est local-first.
- Pas d'authentification.
- Pas de base de donnees serveur.
- Pas de persistance cloud.
- Le catalogue MVP est plomberie.
- Gemini ne modifie jamais directement le store.
- Les tool calls sont valides cote application.
- Les modifications/suppressions utilisent `lineItemId`.
- Les templates sont decomposes en lignes atomiques.
- La cle Gemini reste cote serveur.
- La voix ne declenche jamais automatiquement Gemini.
- `docs/PLAN.md` est la source de verite operationnelle.

## 5. Points de vigilance ouverts

| Sujet | Risque | Action prevue |
|---|---|---|
| Gemini SDK | API susceptible d'evoluer | Verifier la doc officielle en Phase 4 |
| Web Speech API | Support navigateur variable | Fallback texte obligatoire en Phase 3 |
| LocalStorage | Donnees corrompues ou schema ancien | Versionner la persistence en Phase 1 |
| `next dev` local | Echec possible sur lockfile `.next` selon permissions Windows | Utiliser `npm.cmd run build` ou lancer `next dev` au premier plan pour verification ciblee |

## 6. Known Issues

Problemes concrets deja identifies, a surveiller pendant l'implementation.

| Issue | Impact | Phase cible | Statut |
|---|---|---:|---|
| Les dossiers `ai/`, `data/`, `docs/` apparaissent non suivis par Git dans ce worktree | Risque d'oublier des fichiers au commit | 0 | Resolu |
| Web Speech API dependante de Chrome et du support navigateur | La voix peut etre indisponible chez certains utilisateurs | 3 | Ouvert |
| La Web Speech API peut dependre du reseau/service navigateur | Transcription lente ou instable en conditions chantier | 3 | Ouvert |
| Le navigateur integre Codex peut refuser l'acces a `127.0.0.1:3002` alors que le shell recoit HTTP 200 | Verification interactive automatisee limitee dans cette session | 3 | Ouvert |
| Le bouton micro pouvait rester desactive apres prerendu Next car le support Web Speech etait detecte trop tot | Dictée indisponible meme dans Chrome compatible | 3 | Resolu |
| Chrome desktop affichait deux fois la transcription intermediaire et Chrome mobile cumulait des fragments repetes | Texte du prompt duplique ou parfois perdu | 3 | Resolu |
| L'extension Night Eye injecte `nighteye` sur `<html>` avant React | Avertissement d'hydratation en developpement | 3 | Resolu |
| L'adapter lisait `response.text` sur une reponse Gemini composee de function calls | Avertissement SDK repetitif dans le terminal | 4 | Resolu |
| Les erreurs API Gemini etaient toutes converties en `GeminiModelError` | Quota, cle ou modele signales a tort comme action invalide | 4 | Resolu |
| Le reset devis est une action destructive | Perte de travail utilisateur si declenchement accidentel | 5 | Resolu |
| Gemini peut proposer des IDs invalides ou ambigus | Devis incoherent si validation insuffisante | 4 | Resolu |
| `next dev` peut echouer avec `Access is denied` lors de l'acquisition du lockfile `.next` | Verification dev server bloquee dans ce worktree | 2 | Ouvert |
| `GEMINI_API_KEY` n'etait pas renseignee pendant la validation initiale Phase 4 | Verification live Gemini alors impossible | 4 | Resolu |
| `npm install` signale deux vulnerabilites moderees dans l'arbre de dependances | Risque a qualifier avant livraison finale sans mise a jour forcee | 7 | Ouvert |
| Certains `DialogContent` shadcn n'ont pas de description accessible | Avertissement navigateur et contexte incomplet pour les lecteurs d'ecran | 7 | Ouvert |

## 7. Technical Debt

Compromis acceptes pour le MVP, non bloquants maintenant mais a suivre apres stabilisation.

| Dette | Pourquoi acceptee maintenant | Reprise possible |
|---|---|---|
| Catalogue mock statique embarque dans le prompt | Suffisant pour demontrer le matching MVP | Catalogue dynamique ou base de donnees |
| Pas d'indexation/recherche catalogue dediee | Le catalogue MVP reste petit | Recherche semantique ou index local |
| Pas de base de donnees serveur | MVP local-first sans compte utilisateur | Supabase ou autre persistance cloud |
| Pas d'historique multi-devis cloud | Hors scope MVP | Gestion multi-devis et synchronisation |
| Tests e2e Playwright repousses | D'abord stabiliser domaine, UI et IA mockee | Ajouter apres Phase 7 si besoin demo robuste |
| `answer_question` depend du contexte injecte a Gemini | Acceptable si les totaux calcules sont fournis par l'app | Reponses calculees par l'app puis formulees par IA |
| Catalogue limite a la plomberie | Scope MVP clair | Extension multi-metiers |

## 8. Journal de progression

| Date | Phase | Changement | Resultat | Suite |
|---|---|---|---|---|
| 2026-06-14 | Documentation | Creation de `docs/ARCHITECTURE.md` | Architecture cible disponible | Creer un plan operationnel |
| 2026-06-14 | Documentation | Creation de `docs/PLAN.md` et renvoi depuis `ARCHITECTURE.md` | Plan par phases disponible | Creer le suivi de progression |
| 2026-06-14 | Documentation | Creation de `docs/STATUS.md` | Reprise de travail facilitee | Demarrer Phase 0 |
| 2026-06-14 | Documentation | Ajout de `Known Issues` et `Technical Debt` | Suivi des problemes et dettes clarifie | Demarrer Phase 0 |
| 2026-06-14 | Preparation | Catalogue renomme en `data/catalog.ts` | Issue de nommage catalogue resolue | Mettre a jour les references du plan |
| 2026-06-14 | Phase 0 | Guides Next locaux relus et contrats confirmes | Phase 0 terminee | Demarrer Phase 1 |
| 2026-06-14 | Documentation | Ajout du workflow de session dans `AGENTS.md` | Les prochaines sessions savent lire et mettre a jour `STATUS.md` | Demarrer Phase 1 |
| 2026-06-14 | Documentation | Ajout des regles UI, TypeScript, Zod et qualite dans `AGENTS.md` | Les prochaines implementations ont des garde-fous techniques et UI | Demarrer Phase 1 |
| 2026-06-14 | Phase 1 | Installation de `zustand` et `zod`, creation du domaine devis, des validations, du store persistant et des tests domaine | Phase 1 terminee, controles `test:domain`, `lint` et `build` passes | Attendre validation utilisateur pour Phase 2 |
| 2026-06-14 | Phase 2 | Initialisation shadcn/ui, creation AppShell responsive, rendu devis, parametres entreprise, ajout manuel, edition et suppression | Phase 2 terminee, controles `test:domain`, `lint`, `build` et verification navigateur passes | Attendre validation utilisateur pour Phase 3 |
| 2026-06-15 | Phase 3 | Creation du panneau conversation, messages, composer texte, bouton micro, hook Web Speech et reponse assistant locale | Phase 3 terminee, controles `test:domain`, `lint` et `build` passes; navigateur integre bloque sur localhost | Attendre validation utilisateur pour Phase 4 |
| 2026-06-15 | Phase 3 | Correction de la detection Web Speech apres hydratation navigateur | Bouton micro debloquable dans les navigateurs compatibles; controles `test:domain`, `lint` et `build` passes | Tester dans Chrome ou Edge sur `http://localhost:3003/` |
| 2026-06-15 | Phase 4 | Installation `@google/genai`, creation tools Gemini, prompt builder, adapter serveur, route `/api/ai`, hook client et executor valide | Phase 4 terminee cote implementation; controles `test:domain`, `lint`, `build` passes; erreur courte sans cle Gemini validee | Attendre validation utilisateur pour Phase 5 |
| 2026-06-23 | Correctif Phase 3 | Reconstruction des resultats Web Speech, deduplication des fragments mobiles et suppression des deux encarts de transcription intermediaire | Une seule phrase est affichee dans le champ; le dernier interim est conserve; 18 tests, lint et build passent | Tester le micro sur Chrome desktop et Android reel |
| 2026-06-23 | Correctif UI | Ajout de `suppressHydrationWarning` sur le seul element `<html>` modifie par Night Eye | L'attribut injecte par l'extension ne declenche plus l'overlay React | Conserver les autres alertes d'hydratation actives |
| 2026-06-23 | Correctif Phase 4 | Suppression de la lecture `response.text` en mode Function Calling | Plus d'avertissement SDK `non-text parts functionCall`; les confirmations restent produites localement | Surveiller uniquement la latence Gemini |
| 2026-06-23 | Correctif Phase 4 | Conservation des statuts API Gemini et mapping `429`, `401/403`, `404`, `400` | Le quota gratuit atteint retourne maintenant `429` avec `Retry-After` et un message explicite | Configurer un quota adapte avant production |
| 2026-06-24 | Documentation | Realignement de la Phase 5 avec l'executor livre en Phase 4 | `delete_section` est marque acquis; seul son test de non-regression reste a couvrir en Phase 5 | Attendre la validation utilisateur avant de demarrer Phase 5 |
| 2026-06-24 | Phase 5 | Ajout des choix de clarification, resolution clic/texte/voix, messages sans mutation et confirmations de reset | Phase 5 terminee; 27 tests, lint, build et parcours Gemini desktop/mobile valides | Attendre validation utilisateur pour Phase 6 |
| 2026-06-24 | Amelioration Phase 2 | Remplacement des selects manuels par une recherche classee avec listes completes Article et Pack | Recherche accents/mots-cles/faute legere validee; 31 tests, lint, build et responsive passent | Attendre validation utilisateur pour Phase 6 |
| 2026-06-24 | Phase 6 | Ajout du snapshot immutable, du document React PDF, du bouton et de l'export declenche par Gemini | Phase 6 terminee; 34 tests, lint, build et deux parcours de telechargement navigateur valides | Attendre validation utilisateur pour Phase 7 |
| 2026-06-24 | Amelioration Phase 6 | Remplacement des remises predefinies par une saisie numerique avec unite `% / €` | Saisie libre, recalcul immediat, plafond 100 % et responsive sans debordement valides | Attendre validation utilisateur pour Phase 7 |
| 2026-06-24 | Amelioration mobile Phase 6 | Remplacement du tableau mobile par des lignes compactes depliables et ajout du resume de totaux conditionnel | Portrait 375 px sans scroll horizontal; edition, suppression, disparition au footer, desktop, tests, lint et build valides | Attendre validation utilisateur pour Phase 7 |

## 9. Comment mettre a jour ce fichier

Apres chaque session de travail:

1. Mettre a jour `Derniere mise a jour`.
2. Mettre a jour `Statut global`.
3. Mettre a jour `1. Reprise rapide > Etat actuel` avec les faits les plus importants pour reprendre sans relire tout l'historique.
4. Mettre a jour `1. Reprise rapide > Prochaine action recommandee` pour pointer vers la prochaine tache concrete.
5. Mettre a jour la ligne de phase concernee dans le tableau de progression.
6. Cocher les taches terminees dans la checklist de phase.
7. Ajouter une entree dans le journal de progression.
8. Noter tout blocage dans `Points de vigilance ouverts`.
9. Ajouter les problemes concrets dans `Known Issues`.
10. Ajouter les compromis acceptes dans `Technical Debt`.
11. Indiquer clairement la prochaine action recommandee.

Regle pour `Etat actuel`:

- Garder uniquement les faits de reprise, pas le detail complet des travaux.
- Mentionner les fichiers crees ou modifies qui changent le point de depart.
- Mentionner la phase active et son statut.
- Mentionner les blocages importants s'ils changent la suite.
- Supprimer les faits obsoletes au lieu d'empiler l'historique.

Statuts autorises pour les phases:

- `Non demarree`
- `A demarrer`
- `En cours`
- `Terminee`
- `Bloquee`

## 10. Prochain point de reprise

Reprendre ici:

- Phase: 7 - Durcissement, QA et polish MVP
- Statut: Non demarree, en attente de validation utilisateur
- Premiere action: apres validation explicite, relire la Phase 7 et installer la pile de tests prevue
- Fichier de reference principal: `docs/PLAN.md`
