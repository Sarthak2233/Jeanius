# AGENTS.md — Engineering & Documentation Rules for Jeanius

This file defines the project-wide operational rules, architectural constraints, and workflow standards for all AI agents and human contributors working in the **Jeanius** monorepo.

---

## 1. Architectural Boundaries & Domain Isolation
- **Domain Purity:** `packages/domain` contains zero framework or database dependencies (pure TypeScript). Business logic, validation schemas, and invariants live here.
- **Application Layer:** `packages/application` defines port interfaces and orchestrates use-cases.
- **Data Access:** `packages/database` provides Drizzle ORM implementations of repository ports.
- **No Standalone API Microservices:** Next.js Server Actions and Route Handlers (`apps/storefront` & `apps/admin`) serve as the runtime server boundary. Server Actions and Route Handlers must immediately delegate to use cases in `packages/application`.
- **Client State:** Zustand is restricted to UI/interaction state only (`apps/storefront/stores/`). All commercial transactions and calculations must be verified server-side.

---

## 2. Mandatory Diagram Workflow Rule

Whenever creating or updating any document, specification, or ADR containing an architecture, sequence, state, lifecycle, or data-flow diagram, **strictly follow this workflow**:

1. **Source File:**
   - Save the raw Mermaid source in:
     `docs/assets/diagrams/src/<kebab-case-name>.mmd`
2. **Central SVG Compilation:**
   - Compile using the centralized generation script:
     ```bash
     pnpm run diagrams:generate
     ```
   - This produces `docs/assets/diagrams/<kebab-case-name>.svg` with a transparent background and neutral styling.
3. **Markdown Embedding:**
   - Embed the SVG via markdown image syntax with relative pathing.
   - Accompany the image with a collapsible `<details><summary>View Raw Diagram Source (.mmd)</summary>` block containing the diagram code.
   - **Never** rely on raw inline `mermaid` blocks alone for document rendering.
4. **Git Tracking:**
   - Always commit both the `.mmd` source file and the generated `.svg` asset.

---

## 3. Verification Protocol
Before completing any task or pull request:
- Run `./scripts/verify-monorepo.sh` to ensure all workspaces build and typecheck pass with 0 errors.
- Ensure all file links use markdown relative links or valid `file:///` anchors.
- Update [Production_Implementation.md](file:///home/sarakb/projects/Jeanius/Production_Implementation.md) with accurate task progress.

---

## 4. Code Quality & Refactoring Directives
- **Clean Code & Simplicity:** Follow [.agents/rules/coding-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/coding-rules.md). Build deep modules, enforce early guard clauses (max nesting ≤ 2), write pure functions over mutations, and avoid premature abstractions.
- **Disciplined Refactoring:** Follow [.agents/rules/refactor-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/refactor-rules.md). Refactor in isolated atomic commits, pin behavior with green tests before editing, delete dead code immediately, and never mix structural refactorings with behavioral feature changes.

