# Domain Dependency & Purity Rules (JN-050)

This rule defines the domain purity constraints for `packages/domain`.

---

## 1. Domain Purity Invariant

`packages/domain` represents the heart of the Jeanius business logic. It models artisanal raw denim manufacturing, custom waist/inseam tailoring, fabric bolt accounting, and commercial order state machines.

- **Zero Framework Leakage:** Domain logic must never depend on React, Next.js, Drizzle, Supabase, Stripe, or any external runtime library.
- **Zero IO / Network Dependencies:** Domain entities, value objects, and domain services must be 100% deterministic and unit-testable in-memory with zero mocks.
- **Encapsulated State Mutation:**
  - Entities must encapsulate their internal state.
  - State mutations must occur through expressive domain methods (e.g. `order.advanceStage('CUTTING')`, `order.cancelPriorToCutting()`), **never** through naked property mutations (`order.status = '...'`).
  - Domain invariants must be enforced in the entity constructor or factory method.

---

## 2. Value Objects vs. Entities

- **Entities:** Have a unique immutable identity (`id: string`), mutable lifecycle states, and track domain events.
- **Value Objects:** Are immutable data structures compared by value, not identity (e.g. `Money`, `Address`, `InseamLength`, `TailoringSpec`, `ExportDeclaration`). Any modification returns a new Value Object instance.

---

## 3. Prohibited Patterns in Domain

- ❌ `import ... from 'drizzle-orm'`
- ❌ `import ... from 'next/...'`
- ❌ `import ... from 'react'`
- ❌ `fetch('...')` or `axios.get('...')`
- ❌ `new Date()` calls that cannot be overridden or mocked with a fixed timestamp in tests.
