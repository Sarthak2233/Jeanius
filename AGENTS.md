# AGENTS.md — Engineering & Documentation Rules for Jeanius & Jewl

This file defines the project-wide operational rules, architectural constraints, and workflow standards for all AI agents and human contributors working in the **Jeanius & Jewl** monorepo.

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
   - This produces `docs/assets/diagrams/<kebab-case-name>.svg` with self-contained high-contrast dark atelier card styling and semantic color palettes.
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

---

## 5. Master Rules Catalog (Context Pointers)

Every specialized engineering rule lives in `.agents/rules/`. Consult the corresponding rule file before and during task execution:

| Domain | Trigger Condition | Rule File Pointer |
| :--- | :--- | :--- |
| **Imports & Hierarchy** | Referencing cross-package imports | [.agents/rules/import-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/import-rules.md) |
| **Domain Purity** | Writing domain entities, value objects, invariants | [.agents/rules/domain-dependency-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/domain-dependency-rules.md) |
| **Code Simplicity** | Authoring functions, classes, data structures | [.agents/rules/coding-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/coding-rules.md) |
| **Refactoring** | Restructuring code, cleaning dead code | [.agents/rules/refactor-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/refactor-rules.md) |
| **Database & ORM** | Writing queries, mutations, repository ports | [.agents/rules/database-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/database-rules.md) |
| **Client / Server** | Creating Server Actions, RSC, client state | [.agents/rules/client-server-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/client-server-rules.md) |
| **Validation** | Parsing user inputs, DTOs, tailoring bounds | [.agents/rules/validation-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/validation-rules.md) |
| **Errors** | Throwing or handling domain/application exceptions | [.agents/rules/error-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/error-rules.md) |
| **Naming Conventions** | Naming files, symbols, types, domain vocabulary | [.agents/rules/naming-conventions.md](file:///home/sarakb/projects/Jeanius/.agents/rules/naming-conventions.md) |
| **Testing Strategy** | Authoring unit, integration, or e2e tests | [.agents/rules/testing-requirements.md](file:///home/sarakb/projects/Jeanius/.agents/rules/testing-requirements.md) |
| **Security & Auth** | Handling secrets, authentication, PII, sessions | [.agents/rules/security-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/security-rules.md) |
| **Observability** | Structured logging, metrics, error tracing | [.agents/rules/observability-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/observability-rules.md) |
| **Migrations** | Creating or executing database schema changes | [.agents/rules/migration-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/migration-rules.md) |
| **Git Commits** | Authoring conventional commits, PR prep | [.agents/rules/commit-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/commit-rules.md) |
| **Diagram Workflow** | Adding or editing architectural diagrams | [.agents/rules/diagram-workflow.md](file:///home/sarakb/projects/Jeanius/.agents/rules/diagram-workflow.md) |

