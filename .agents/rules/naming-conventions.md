# Naming Conventions & Code Style Rules (JN-055)

This rule defines consistent file naming, symbol casing, and domain vocabulary across the Jeanius monorepo.

---

## 1. File & Directory Casing

- **All filenames and directories must use `kebab-case`**:
  - ✅ `order-lifecycle.ts`
  - ✅ `cut-ticket-card.tsx`
  - ✅ `payment-orchestrator.service.ts`
  - ❌ `OrderLifecycle.ts`
  - ❌ `cutTicketCard.tsx`
- **Exceptions:** System files specified by frameworks (`README.md`, `AGENTS.md`, `next.config.ts`, `globals.css`).

---

## 2. Symbol Casing & Architectural Conventions

| Architectural Artifact | Casing | Suffix / Pattern | Example |
| :--- | :--- | :--- | :--- |
| **Domain Entity** | `PascalCase` | Entity name | `Order`, `Product`, `FabricBolt` |
| **Value Object** | `PascalCase` | Value name | `Money`, `Address`, `ExportDeclaration` |
| **Domain Event** | `PascalCase` | `...DomainEvent` | `OrderPaidDomainEvent` |
| **Repository Port** | `PascalCase` | `I...Repository` | `IOrderRepository`, `IFabricRepository` |
| **Repository Adapter** | `PascalCase` | `Drizzle...Repository` | `DrizzleOrderRepository` |
| **Gateway Port** | `PascalCase` | `I...Gateway` | `IPaymentGateway`, `IShippingGateway` |
| **Gateway Adapter** | `PascalCase` | `[Provider]...Adapter` | `StripePaymentAdapter`, `DhlShippingAdapter` |
| **Application Use Case**| `PascalCase` | `...UseCase` | `SubmitCheckoutUseCase.execute()` |
| **Zod Schema** | `camelCase` | `...Schema` | `checkoutInputSchema`, `orderFilterSchema` |
| **Zustand Store** | `camelCase` | `use...Store` | `useConfiguratorStore`, `useCartDrawerStore` |
| **React Component** | `PascalCase` | Descriptive noun | `CutTicketCard`, `DenimConfigurator` |
| **Server Action** | `camelCase` | Verb-first action | `submitOrderAction()`, `advanceStageAction()` |

---

## 3. Domain Vocabulary Consistency

Always use the canonical Jeanius domain terminology:
- Use **`Order-Made` (`OM`)**, not "Custom Made" or "Bespoke".
- Use **`DROP`**, not "In-Stock" or "Batch".
- Use **`Fabric Bolt`**, not "Denim Roll" or "Fabric Batch".
- Use **`Cut Ticket`**, not "Work Order" or "Production Slip".
- Use **`Craftsman` / `Tailor`**, not "Factory Worker" or "Manufacturer".
