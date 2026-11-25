<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:voixdevis-session-rules -->
# VoixDevis session workflow

At the start of every implementation session:

1. Read `docs/STATUS.md` first.
2. Use `docs/STATUS.md` to identify the active phase, current blockers, known issues, technical debt, and the exact next action.
3. Read the relevant phase in `docs/PLAN.md` before changing code.
4. Use `docs/ARCHITECTURE.md` as the architecture contract.
5. Use `docs/PRD.md`, `ai/promptSystem.ts`, and `data/catalog.ts` as product, AI, and catalogue references.
6. Before writing any Next.js code, read the relevant local guide in `node_modules/next/dist/docs/`.

Implementation rules:

- Follow phases in `docs/PLAN.md` in order unless the user explicitly asks otherwise.
- Do not skip phase acceptance criteria.
- Keep Gemini as an intent translator only. Gemini emits tool calls; the app validates and applies state changes.
- Keep the quote state local-first in Zustand until the plan says otherwise.
- Keep the Gemini API key server-side only. Never expose it through `NEXT_PUBLIC_`.
- Validate all model/tool inputs before mutating app state.
- Use `lineItemId` for quote line updates/removals, not catalogue `articleId`.
- Keep speech-to-text text-first: voice fills the input, the user can edit, and Gemini is called only after explicit send.
- Keep calculations centralized so UI and PDF totals cannot diverge.
- Prefer existing project structure from `docs/ARCHITECTURE.md`.

UI and code quality rules:

- Shadcn UI is the primary design system once it is initialized in the project.
- Prefer existing Shadcn UI components before creating generic UI components.
- Reuse and compose Shadcn primitives whenever possible.
- Do not create custom generic `Button`, `Input`, `Dialog`, `Select`, `Tabs`, `Sheet`, `Table`, or `Tooltip` components when a Shadcn equivalent exists.
- Keep business-specific components outside `components/ui`.
- Before creating a new component, check whether it can be composed from existing UI primitives.
- Favor composition and small focused components over large custom components.
- Keep the visual language consistent across mobile tabs and desktop split-screen.
- Use TypeScript for application code.
- Avoid `any`. Use `unknown` for unknown data, then validate and narrow it.
- If `any` is truly unavoidable for a third-party edge case, keep it local, document why, and do not let it leak into domain types.
- Prefer explicit domain types over loose objects.
- Validate external inputs with Zod, especially API payloads, Gemini tool call arguments, and LocalStorage restored data.
- Keep business logic out of React components. Put quote actions, calculations, validation, and catalogue lookup in domain/store modules.
- Do not expose secrets in client code. Gemini secrets stay in server-only Route Handler code.
- Run `npm run lint` and `npm run build` before marking an implementation phase complete, unless the final response clearly explains why they were not run.

After every implementation session:

1. Update `docs/STATUS.md`.
2. Update `Derniere mise a jour`, `Statut global`, `Reprise rapide`, active phase progress, checklists, known issues, technical debt, and journal as needed.
3. Set `Prochain point de reprise` to the next concrete task.
4. Run relevant checks for the touched phase when feasible, and record anything not run in the final response.
<!-- END:voixdevis-session-rules -->
