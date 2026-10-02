# Diagram Generation & Documentation Workflow Rule

This rule defines the mandatory workflow for adding, modifying, or referencing any diagram (architecture, sequence, workflow, state/lifecycle, data flow, ERD) across all documentation and Markdown files in the Jeanius repository.

---

## Core Principle

**Never use raw inline Mermaid code blocks as the sole diagram rendering mechanism in markdown files.**
Inline Mermaid blocks often fail to render or break unpredictably across different viewers, IDE extensions, and GitHub previews when complex characters (parentheses, brackets, quotes) are present.

Instead, all diagrams must be compiled into high-fidelity, high-contrast dark atelier card vector SVGs and embedded as images, with the raw source preserved in an adjacent collapsible block.

---

## Mandatory Diagram Workflow

Whenever a document or specification is created or updated that contains a diagram:

### 1. Save Raw Diagram Source
- Place the raw Mermaid diagram definition in:
  `docs/assets/diagrams/src/<kebab-case-name>.mmd`
- Use kebab-case descriptive naming (e.g. `order-checkout-sequence.mmd`, `production-pipeline.mmd`).

### 2. Compile to Centralized Vector SVG
- Compile the `.mmd` source to a self-contained vector `.svg` in `docs/assets/diagrams/`:
  ```bash
  pnpm run diagrams:generate
  ```
  *(This runs `scripts/generate-diagrams.ts` with central dark theme config, custom atelier CSS, and high-contrast styling)*.
- The compiled output will automatically be created at:
  `docs/assets/diagrams/<kebab-case-name>.svg`

### 3. Embed in Markdown Document
- In the documentation file, embed the vector `.svg` using relative path markdown image syntax.
- Immediately below the image, include a `<details>` collapsible block containing the raw `.mmd` source code for easy future edits and auditability:

```markdown
![Descriptive Diagram Title](../assets/diagrams/<kebab-case-name>.svg)

<details>
<summary>View Raw Diagram Source (.mmd)</summary>

```mermaid
<diagram source code>
```
</details>
```

*(Adjust the relative path to `docs/assets/diagrams/` depending on the file's folder depth, e.g. `docs/assets/diagrams/<name>.svg` from root, or `../assets/diagrams/<name>.svg` from `docs/architecture/` or `docs/product/`)*.

### 4. Verification Checklist
- [ ] Diagram source exists in `docs/assets/diagrams/src/<name>.mmd`.
- [ ] Compiled SVG exists in `docs/assets/diagrams/<name>.svg` and is non-empty.
- [ ] Markdown file renders the SVG image and contains the collapsible raw source block.
- [ ] Both the `.mmd` source and `.svg` vector file are staged and committed to git.
