---
trigger: always_on
---

# Code Simplicity & Clean Implementation Rules

This rule defines the core coding standards, simplicity imperatives, module depth principles, and readability requirements across all packages and apps in the Jeanius monorepo.

---

## 1. Core Simplicity Imperative (Anti-Cleverness & YAGNI)

Write code optimized for human and agent comprehension 6 months from now over cleverness or brevity:
- **Prioritize clarity over brevity:** Write readable, explicit code. Ban dense one-liners, deeply nested ternaries, and complex regex tricks when simple standard library methods suffice.
- **Enforce the Rule of Three:** Never introduce an abstraction, generic utility, or interface seam until you have **3 distinct, concrete use cases**. Speculative abstractions create shallow code with high cognitive load.
- **Reject speculative generality:** Build strictly what the current task demands. Do not add unused parameters, "future-proofing" flags, or hypothetical configuration options.

---

## 2. Deep Modules & Clean Seams

Design **deep modules**: maximize the behavior hidden behind a small, cohesive interface.

```
┌────────────────────────────────────────┐
│ Small, Stable Interface (Few Methods)  │  ◄── Easy to learn, test, and use
├────────────────────────────────────────┤
│                                        │
│ Deep Implementation (Rich Logic)       │  ◄── Invariants, validation, workflows
│                                        │
└────────────────────────────────────────┘
```

- **Maximize caller leverage:** A caller should learn 1 or 2 intuitive method signatures to accomplish significant work (e.g. `order.markPaid(payment)` instead of orchestrating 8 separate setters).
- **Maximize maintainer locality:** Complex domain rules, state machine transitions, and invariant checks concentrate inside the module rather than leaking across call sites.
- **Apply the Deletion Test:** If deleting an abstraction makes complexity vanish, it was a pass-through shim. If deleting it causes complexity to scatter across 10 callers, it is a genuine deep module earning its place.
- **Seam reality rule:** One adapter means a hypothetical seam; avoid it. Two or more distinct adapters (e.g. `StripePaymentGateway` and `EsewaPaymentGateway`) confirm a real seam.

---

## 3. Function Structure & Flow Control

- **Enforce Guard Clauses (Early Returns):** Validate preconditions, permissions, and invariants at the top of the function. Return or throw immediately.
- **Strict Nesting Cap (Depth ≤ 2):** Code must never exceed 2 levels of indentation. Extract helper functions or use early returns whenever indentation approaches 3 levels:
  ```typescript
  // ✅ GOOD: Guard clauses, flat structure (nesting depth 1)
  export function calculateYardageNeeded(order: Order): BoltCut {
    if (order.status !== 'CONFIRMED') {
      throw new DomainError('Order must be confirmed before cutting');
    }
    if (order.lines.length === 0) {
      throw new DomainError('Cannot cut empty order');
    }
    return computeContinuousCut(order.lines);
  }

  // ❌ AVOID: Nested ladder (nesting depth 3+)
  export function calculateYardageNeeded(order: Order) {
    if (order.status === 'CONFIRMED') {
      if (order.lines.length > 0) {
        // deeply nested logic...
      }
    }
  }
  ```
- **Pure Returns Over In-Place Mutations:** Functions should accept arguments, calculate, and return fresh values. Never mutate input parameters directly.
- **Function Cohesion & Length:** Every function must do one identifiable task. Functions should generally fit within 35 lines. If a function grows beyond this, decompose it into focused private helpers.
- **Predictable Parameter Surfaces:** Prefer 1-3 positional arguments. When a function requires 4 or more parameters, wrap them in a single, strongly-typed `options` object with clear property names.

---

## 4. Semantic Type Design & Data Modeling

- **Branded Nominal IDs:** Use branded entity IDs (`EntityId<T>`) for domain entities. Prevent passing a `CustomerId` into an `OrderId` slot at compile time.
- **Encapsulated Value Objects:** Use domain Value Objects (`Money`, `InseamLength`, `WaistSize`) to bind arithmetic, physical tailor bounds, and currency formatting together.
- **Discriminated Unions for Multi-State Workflows:** Represent state machines using discriminated unions with a `status` tag. Enforce compile-time exhaustiveness:
  ```typescript
  type PaymentState =
    | { status: 'PENDING'; initiatedAt: Date }
    | { status: 'AUTHORIZED'; authCode: string; expiresAt: Date }
    | { status: 'SETTLED'; transactionId: string; settledAt: Date }
    | { status: 'FAILED'; reason: string; failedAt: Date };

  function handlePayment(state: PaymentState): void {
    switch (state.status) {
      case 'PENDING': return handlePending(state);
      case 'AUTHORIZED': return handleAuthorized(state);
      case 'SETTLED': return handleSettled(state);
      case 'FAILED': return handleFailed(state);
      default: {
        const _exhaustive: never = state;
        throw new Error(`Unhandled payment state: ${_exhaustive}`);
      }
    }
  }
  ```
- **Prohibit Type Escapes:** Never use `any` or `as unknown as Type`. If narrowing is required, write a TypeScript type guard (`function isDrop(product: Product): product is DropProduct`).

---

## 5. Self-Documenting Code & Intent Comments

- **Domain-Accurate Vocabulary:** Use canonical domain terms from [naming-conventions.md](file:///home/sarakb/projects/Jeanius/.agents/rules/naming-conventions.md) (`Order-Made`, `Drop`, `FabricBolt`, `CutTicket`).
- **Comments Explain 'Why', Never 'What':**
  - ✅ Document physical constraints: `// Raw selvedge shrinks 3% on first wash; add 1.25" to tailor cutting pattern.`
  - ✅ Document tax or legal edge-cases: `// Nepal export HS Code 6203.42 requires harmonized net weight in kg.`
  - ❌ Avoid restating code: `// Set status to PAID` above `order.status = 'PAID'`.
- **Eliminate Dead Comments:** Do not commit commented-out code, temporary debug logging, or outdated `TODO` comments without issue trackers.
