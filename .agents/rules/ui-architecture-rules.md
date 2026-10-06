---
trigger: always_on
---

# UI Architecture, Component Locality & Design System Rules (JN-052)

This rule defines the architectural standards for user interface components, design systems, visual fidelity, and motion choreography across the Jeanius monorepo.

---

## 1. Architectural Imperative: Application-Local UI

UI components, design tokens, and presentation primitives reside strictly within the respective application workspaces (`apps/storefront` and `apps/admin`), **never** in a shared `packages/ui` package.

### Rationale
- **Divergent Design Contexts:**
  - `apps/storefront` is an ivory and dark-atelier luxury e-commerce experience characterized by editorial typography, delicate borders, narrative storytelling, and consumer customization flows.
  - `apps/admin` is a deep-slate industrial operations workbench engineered for dense telemetry tables, rapid keyboard flows, audit logs, and workshop production stages.
- **Elimination of Artificial Seams:**
  - Per [.agents/rules/coding-rules.md](.agents/rules/coding-rules.md) (Rule of Three and Deletion Test), shared UI packages introduce shallow pass-through shims that couple independent applications, complicate Turborepo pipelines, and produce premature abstractions with high maintenance friction.
- **Locality of Behavior:**
  - Changes to an operational badge or button must never risk breaking the luxury customer checkout experience, and vice versa.

### Directory Structure & Colocation
```text
apps/
├── storefront/
│   ├── components/            # Reusable storefront UI primitives (PriceDisplay, StatusBadge, Header)
│   └── app/                   # Route segments & colocated route-specific components
└── admin/
    ├── components/            # Reusable admin UI primitives (AdminNav, StatusBadge, PriceDisplay)
    └── app/                   # Route segments & colocated operational workbench views
```
- **Global within App:** Place reusable primitives used across multiple routes in `apps/<app>/components/`.
- **Route-Colocated:** If a component is only rendered within a specific route segment, colocate it in that route's folder (e.g. `apps/storefront/app/account/account-client.tsx`).

---

## 2. Frontend Design System & Skill Activation Matrix

Whenever authoring, designing, or refactoring UI components or pages, consult and apply the specialized design skills in `.agents/skills/`. Select the skill matching the architectural branch:

| Branch / Context | Trigger Condition | Specialized Skill Pointer | Core Aesthetic & Directives |
| :--- | :--- | :--- | :--- |
| **Storefront Brand & Commerce** | Authoring or editing storefront routes, catalog cards, product detail pages (PDP), option selectors, or VIP drops | [.agents/skills/jeanius-frontend/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/jeanius-frontend/SKILL.md) | Authentic Jeanius brand language: OM announcements, structured option matrices, made-to-order statuses, and restrained editorial chrome. |
| **Storefront Luxury Editorial** | Designing hero layouts, typography scales, content guides, or VIP salon pages | [.agents/skills/minimalist-ui/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/minimalist-ui/SKILL.md) | Warm bone/off-white substrates (`#FDFBF7`), high-contrast editorial serif headings with tight tracking (`-0.03em`), and muted pastel status tags. |
| **High-End Component Craft** | Crafting interactive cards, nested enclosures, pill buttons, or premium surfaces | [.agents/skills/high-end-visual-design/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/high-end-visual-design/SKILL.md) | "Double-bezel" nested containers, concentric radii (`rounded-[calc(r - p)]`), nested trailing arrow glyphs, and generous macro-whitespace (`py-24`+). |
| **Admin Operations Workbench** | Building workshop kanbans (Tailor/Jeweller), fulfillment queues, or audit data tables | [.agents/skills/industrial-brutalist-ui/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/industrial-brutalist-ui/SKILL.md) | Tactical telemetry: dark slate substrates (`#0b0f19`, `#121826`), 1px division borders (`#334155`), JetBrains Mono tabular figures, and `<kbd>` shortcuts. |
| **Anti-Slop Quality Gate** | Authoring new pages or reviewing layouts to eliminate generic AI templates | [.agents/skills/design-taste-frontend/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/design-taste-frontend/SKILL.md) | Anti-slop audit: enforces asymmetric bento arrangements, bans default Bootstrap grids, and rejects cookie-cutter UI defaults. |
| **Page Upgrades & Redesigns** | Uplifting existing legacy views or components to meet current visual standards | [.agents/skills/redesign-existing-projects/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/redesign-existing-projects/SKILL.md) | Non-destructive uplift: upgrades aesthetic tokens, typography, and contrast while preserving existing logic and state intact. |
| **Motion & Scroll Storytelling** | Choreographing editorial narrative flow, staggered cards, or page transitions | [.agents/skills/gpt-taste/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/gpt-taste/SKILL.md) | Layout variance, gapless bento structures, wide typography, and hardware-accelerated motion choreography. |
| **3D Product Experiences** | Rendering interactive 3D jewellery rings, sizing mandrels, or denim turntable views | [.agents/skills/threejs-fundamentals/SKILL.md](file:///home/sarakb/projects/Jeanius/.agents/skills/threejs-fundamentals/SKILL.md) | Lightweight WebGL viewports, performant geometry, PBR studio lighting, and smooth orbit interaction. |

---

## 3. Minimal & Effective Animation Principles

Animations must feel **tactile, physical, and restrained**. Motion serves user cognition, spatial orientation, and instant physical feedback—never decorative theater or sluggish visual noise.

### A. The 150ms–250ms Rule (Timing & Easing)
- **Micro-Interactions (Buttons, Badges, Dropdown Items):** `150ms` to `200ms`.
- **Structural Transitions (Drawers, Modals, Accordions):** `200ms` to `250ms`.
- **Easing Curves:** Use fast-out, slow-settle cubic-beziers:
  ```css
  /* Physical, snappy deceleration */
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out;
  ```
- **Prohibited:** Standard linear transitions, slow dragging animations (> 300ms), and cartoony, bouncy elastic spring overshoots.

### B. GPU-Composited Properties Only (Zero Reflows / Zero CLS)
- Animate **strictly** two properties:
  1. `transform` (`translate3d`, `scale`, `rotate`)
  2. `opacity`
- **Prohibited:** Never animate layout-triggering properties (`width`, `height`, `margin`, `padding`, `top`, `left`, `border-width`). Modifying these causes expensive browser layout reflows and Cumulative Layout Shift (CLS).

### C. Physical Micro-Interactions
- **Active Button Press:** Apply a subtle tactile compression on press:
  ```css
  button:active {
    transform: scale(0.98);
  }
  ```
- **Card Hover Elevation:** Subtle micro-lift without heavy dark shadows:
  ```css
  .atelier-card {
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms ease;
  }
  .atelier-card:hover {
    transform: translateY(-2px);
    border-color: var(--color-border-hover);
  }
  ```
- **Focus Rings:** Use subtle, expanding concentric outlines (`ring-2 ring-indigo-500/20 ring-offset-1`), avoiding abrupt layout shifts.

### D. Accessibility & Motion Preference (Mandatory)
Every animation and transition must respect the user's operating system motion settings:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 4. Strict Prohibitions

1. **NO Shared UI Package:**
   - ❌ Never reintroduce `packages/ui` or any cross-app React component library.
   - ❌ Never import UI components across workspace boundaries (e.g. `apps/admin` importing from `apps/storefront` is strictly prohibited).
2. **Domain & Application Isolation:**
   - ❌ `packages/domain` and `packages/application` must **never** import React, JSX/TSX, CSS, or any presentation primitives.
3. **No Unverified Client Commercial Calculations:**
   - ❌ Pricing, discounts, bolt cut calculations, and shipping tariffs must be calculated server-side in `packages/application`. UI components (e.g. `PriceDisplay`) are purely presentational formatters.
4. **No Sluggish or Distracting Motion:**
   - ❌ No autoplaying video loops without explicit controls.
   - ❌ No slow, sweeping entrance animations that delay user interaction.
   - ❌ No heavy drop shadows or rainbow gradient borders.

---

## 5. Component Authoring Standards

In alignment with [.agents/rules/coding-rules.md](file:///home/sarakb/projects/Jeanius/.agents/rules/coding-rules.md):
- **Immutability:** Props must be marked with `readonly` (e.g. `readonly amount: number;`).
- **Nesting Depth:** Maximum indentation depth $\le 2$. Enforce early guard clauses.
- **Type Safety:** Zero `any` or loose type assertions. All component props must declare explicit TypeScript interfaces.
- **Naming Conventions:** Kebab-case file names (`price-display.tsx`, `status-badge.tsx`), PascalCase export symbols (`PriceDisplay`, `StatusBadge`).

---

## 6. Verification Protocol

Before completing any UI feature or pull request:
1. **Skill Conformity:** Verify that the component or page adheres to its designated skill in the Skill Activation Matrix.
2. **Motion Restraint:** Verify all transitions are $\le 250$ms, manipulate only `transform` and `opacity`, and include `prefers-reduced-motion` overrides.
3. **Compilation & Quality:** Run `./scripts/verify-monorepo.sh` ensuring all workspaces pass typecheck, lint, and build with 0 errors.
