# Runtime Validation & Contract Rules (JN-054)

This rule defines the validation boundaries, Zod schema standards, and data sanitization protocols for the Jeanius monorepo.

---

## 1. The "Parse, Don't Validate" Principle

Never trust external input or pass untyped `any` objects into the application core:
- All external payloads entering via Server Actions, Route Handlers, webhooks, or query parameters must be validated at runtime using **Zod schemas defined in `packages/contracts`**.
- Parsing must produce strongly-typed DTOs that match application interface requirements.

---

## 2. Validation Locations

```
[External HTTP / Form Input]
             │
             ▼
[Zod Schema Parse in packages/contracts] ──► (Fail: Return 400/ValidationError)
             │
             ▼ (Valid strongly-typed DTO)
[Application Use Case]
             │
             ▼
[Domain Model Entity Invariant Check]   ──► (Fail: Throw DomainError)
             │
             ▼ (Valid Domain Entity)
[Database Repository Insertion]
```

---

## 3. Physical Denim Validation Bounds in Contracts

All customization schemas must enforce real-world physical tailor bounds:
- **Waist:** Min 28 inches, Max 42 inches (increments of 0.5" or 1").
- **Inseam Length:** Min 26 inches, Max 36 inches (increments of 0.5" or 1").
- **Currency:** Enum `'USD' | 'NPR' | 'EUR' | 'GBP'`.
- **Payment Providers:** Enum `'stripe' | 'esewa' | 'khalti' | 'fonepay'`.
- **Monogram Text:** Max 10 alphanumeric characters (uppercase letters and dots only).

---

## 4. Prohibited Validation Shortcuts

- ❌ Never use `as unknown as Type` to bypass validation.
- ❌ Never rely exclusively on client-side HTML form validation. All validation must be executed server-side.
