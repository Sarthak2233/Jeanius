# Refactoring & Code Hygiene Rules

This rule defines the safety requirements, triggering signals, sequential workflows, and hygiene standards for refactoring code across the Jeanius monorepo.

---

## 1. The Cardinal Rule of Refactoring

Refactoring changes **internal structure** without altering **external observable behavior**:
- **Strict Commit Separation:** Never combine a structural refactoring with a feature addition or bug fix in the same commit.
  - Structural refactoring commit: `refactor(domain): extract InseamLength value object`
  - Behavioral feature commit: `feat(storefront): add custom inseam tailoring selector`
- **Zero Behavioral Drift:** If a refactoring unintentionally changes an HTTP response shape, database mutation side-effect, or validation rule, it is not a refactoring—it is an unvetted breaking change.

---

## 2. The Test Pinning Gate (Zero-Regression Discipline)

Never refactor code that lacks verified test coverage:
- **Green Baseline Requirement:** Run the relevant test suite before touching a single line of code. Confirm all existing tests pass (`GREEN`).
- **Pinning (Characterization) Tests:** If modifying legacy or untested code:
  1. Author characterization tests that assert the current inputs, outputs, and edge cases.
  2. Run the pinning tests to prove they pass.
  3. Proceed with the refactoring.
- **The Red-Green Refactoring Loop:**
  ```
  [Existing Code] ──► [Run Tests: GREEN] ──► [Refactor Structure] ──► [Run Tests: MUST STAY GREEN]
  ```

---

## 3. Refactoring Triggers & Code Smells

Refactor code when encountering these specific architectural smells:

| Code Smell | Observable Manifestation | Target Refactoring Transformation |
| :--- | :--- | :--- |
| **Shallow Module** | Class or function adds minimal logic; merely forwards calls to another layer. | Inline the pass-through or merge it into the caller; remove unnecessary layers. |
| **Primitive Obsession** | Raw numbers or strings represent domain values (cents, inches, fabric codes). | Extract an immutable **Value Object** (`Money`, `InseamLength`, `BoltCode`). |
| **Conditional Sprawl** | Duplicated `if/else` or `switch` branches checking entity types or statuses across files. | Replace with polymorphic domain methods or a lookup strategy map. |
| **Feature Envy** | A function in Service A repeatedly accesses properties of Entity B to compute a value. | Move the method onto Entity B where the data naturally lives. |
| **Long Parameter Lists** | A function or method accepts 4 or more loose parameters. | Bundle related parameters into a single, cohesive, typed options object. |
| **Nesting Depth > 2** | Code indents 3 or more levels inside loops and conditionals. | Invert conditions into guard clauses and return/throw early; extract sub-routines. |

---

## 4. The 5-Step Safe Refactoring Sequence

Execute refactorings in disciplined, reversible steps:

```
Step 1: PIN ───────► Verify green test suite; write pinning tests if coverage is missing.
Step 2: ISOLATE ───► Ensure working tree is clean on a dedicated feature/refactor branch.
Step 3: TRANSFORM ─► Apply small, atomic transformations (rename, extract method, extract class).
Step 4: VERIFY ────► Run `./scripts/verify-monorepo.sh` (build, lint, typecheck, tests).
Step 5: COMMIT ────► Commit independently with conventional prefix `refactor(<scope>): <summary>`.
```

---

## 5. Anti-Slop & Dead Code Elimination

Maintain a clean, lean codebase through continuous pruning:
- **Delete, Never Comment Out:** Immediately delete obsolete, replaced, or dead code. Never leave commented-out code blocks or inactive imports in the repository. Git history preserves all prior iterations.
- **Clean As You Go (Scoped Boy Scout Rule):** When touching a file for a task, clean up trivial formatting inconsistencies or dead imports in that file. **Do not** initiate sprawling, multi-file refactorings outside the scope of your active task.
- **Strangler Fig Migration for Large Subsystems:** When replacing a major subsystem:
  1. Introduce the new implementation behind an interface seam (e.g. `IPaymentGateway`).
  2. Route new calls or a subset of traffic through the new implementation.
  3. Incrementally migrate legacy call sites.
  4. Once legacy traffic reaches zero, delete the legacy adapter entirely.
