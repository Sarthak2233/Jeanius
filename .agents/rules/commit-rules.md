# Commit Rules & Git Standards (JN-060)

This rule defines the Conventional Commit message standard, pre-commit validation checklist, and git branch workflows for contributors and agents.

---

## 1. Conventional Commits Standard

All commit messages in the Jeanius repository must follow the Conventional Commits specification:

```
<type>(<scope>): <short imperative description>

[optional body explaining motivation and non-obvious context]

[optional footer referencing task ID e.g. JN-046]
```

### Allowed Types
- **`feat`**: A new user-facing feature or domain capability.
- **`fix`**: A bug fix or invariant correction.
- **`docs`**: Documentation, specification, ADR, or diagram changes.
- **`refactor`**: Code restructuring without behavior changes.
- **`test`**: Adding or updating unit, integration, or e2e tests.
- **`chore`**: Tooling, dependencies, or CI/CD workflow updates.
- **`perf`**: Performance optimization.

### Example Valid Commits
- `feat(domain): implement FabricBolt continuous yardage allocation (JN-085)`
- `docs(adr): record two-phase inventory reservation decision (ADR-006)`
- `fix(checkout): enforce 10-minute TTL release on expired holds`

---

## 2. Pre-Commit Verification Protocol

Before executing any `git commit` or pushing code, the following checks **must pass completely with 0 errors**:
1. Run `./scripts/verify-monorepo.sh`:
   - Dependencies verified
   - Build passes across all 11 packages
   - Strict typecheck passes across all 11 packages
2. Run code style checks:
   - `pnpm run lint` passes
   - `pnpm run format:check` passes
3. If diagrams were added or edited:
   - `pnpm run diagrams:generate` must have been executed to compile vector SVGs.
   - Both `.mmd` source and `.svg` files must be staged.

---

## 3. Prohibited Git Actions
- ❌ Never push directly with `--no-verify` or bypass CI gates.
- ❌ Never commit secrets, `.env.local`, or private API credentials.
