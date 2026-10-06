---
trigger: always_on
---

## 6. Data Structures, Algorithms & Performance

Code must be both correct and appropriately efficient in **time, space, I/O, database access, and frontend rendering**. Prefer the simplest implementation that meets the expected scale. Do not introduce sophisticated algorithms or abstractions without a concrete need.

### 6.1 Complexity Awareness

* Every non-trivial algorithm must have an intentional time and space complexity.
* Prefer **O(1)** or **O(log n)** operations where practical.
* Prefer **O(n)** over **O(n²)** when processing collections that may grow.
* Actively identify and eliminate accidental **O(n²)** or worse behavior.
* Do not trade substantial readability for theoretical performance improvements that have no meaningful impact at the expected scale.
* Optimize the dominant cost rather than the most visible code.
* For non-obvious performance-sensitive algorithms, document expected complexity briefly.

```typescript
// Time: O(n)
// Space: O(n)
const customersById = new Map(
  customers.map((customer) => [customer.id, customer]),
);

for (const order of orders) {
  const customer = customersById.get(order.customerId);

  if (!customer) {
    continue;
  }

  processOrder(order, customer);
}
```

### 6.2 Choose Data Structures Intentionally

Choose data structures based on the operations the code performs.

* `Array`: ordered collections and sequential iteration.
* `Set`: uniqueness and membership checks.
* `Map`: keyed lookup and indexing.
* Stack: LIFO processing.
* Queue/deque: FIFO processing.
* Heap/priority queue: repeated minimum/maximum or priority retrieval.
* Trees/graphs: only when the domain or algorithm actually requires them.

Do not use an advanced data structure when a standard library structure is sufficient.

Before implementing a collection-heavy operation, ask:

1. What operations dominate?
2. How often are they performed?
3. How large can the collection become?
4. Can indexing eliminate repeated searches?
5. Is the additional memory justified?

### 6.3 Eliminate Accidental Quadratic Work

Avoid repeated linear searches inside loops when a `Map` or `Set` can provide constant-time average lookup.

```typescript
// ❌ O(n²)
const unmatchedOrders = orders.filter(
  (order) => !payments.some(
    (payment) => payment.orderId === order.id,
  ),
);

// ✅ O(n)
const paidOrderIds = new Set(
  payments.map((payment) => payment.orderId),
);

const unmatchedOrders = orders.filter(
  (order) => !paidOrderIds.has(order.id),
);
```

Watch specifically for:

* `.find()` inside loops
* `.some()` inside loops
* `.includes()` against large arrays inside loops
* nested collection iteration
* repeated sorting
* repeated filtering of the same collection
* repeated database queries inside loops

Do not mechanically combine every loop into one pass. Readability remains more important when the performance difference is insignificant.

### 6.4 Avoid Unnecessary Sorting

Sorting normally costs **O(n log n)**.

* Do not sort when only membership or lookup is required.
* Sort once and reuse the result when ordering is required repeatedly.
* If only the minimum or maximum is needed, use a linear scan instead of sorting the entire collection.
* If only the top K items are required from a very large dataset, consider an appropriate selection or heap-based approach rather than sorting everything.

```typescript
// ❌ O(n log n) when only the maximum is required
const largestOrder = [...orders]
  .sort((a, b) => b.total - a.total)[0];

// ✅ O(n)
const largestOrder = orders.reduce(
  (largest, order) =>
    order.total > largest.total ? order : largest,
);
```

### 6.5 Prefer Bounded Memory

* Avoid unnecessary copies of large collections.
* Avoid repeatedly cloning large objects or arrays.
* Process large datasets in pages, chunks, or streams where appropriate.
* Never introduce an unbounded cache merely to improve speed.
* Every cache must have a clear ownership, lifetime, size/invalidation strategy, and reason to exist.
* Prefer bounded memory usage when processing externally supplied or potentially large input.

**A cache without an invalidation or lifetime strategy is not an acceptable optimization.**

### 6.6 Backend and Database Efficiency

Treat database and network operations as part of the algorithm.

* Avoid N+1 queries.
* Prefer batch queries when processing multiple records.
* Do not load an entire dataset when filtering, aggregation, projection, or pagination can be performed by the database.
* Select only required fields.
* Use appropriate database indexes for frequent lookup, filtering, joining, and ordering.
* Keep API responses bounded.
* Prefer cursor/keyset pagination for large datasets where offset pagination becomes expensive.
* Do not perform network or database calls inside loops when a batch operation is practical.
* Inspect generated queries when ORM behavior may cause inefficient access patterns.

```typescript
// ❌ N+1
for (const order of orders) {
  const customer = await customerRepository.findById(order.customerId);
  attachCustomer(order, customer);
}

// ✅ Batch lookup
const customerIds = [...new Set(
  orders.map((order) => order.customerId),
)];

const customers = await customerRepository.findByIds(customerIds);

const customersById = new Map(
  customers.map((customer) => [customer.id, customer]),
);

for (const order of orders) {
  const customer = customersById.get(order.customerId);

  if (!customer) {
    continue;
  }

  attachCustomer(order, customer);
}
```

### 6.7 Frontend Performance

Frontend performance includes JavaScript execution, rendering, memory, network traffic, and state updates.

* Do not perform expensive computation on every render.
* Avoid repeatedly scanning large collections during rendering.
* Avoid unnecessary component re-renders.
* Keep frontend state minimal and appropriately normalized.
* Use memoization only when repeated computation or rendering is actually expensive.
* Virtualize genuinely large lists instead of rendering thousands of DOM nodes.
* Debounce or throttle high-frequency operations such as search, resize, and scroll when appropriate.
* Cancel stale requests where supported.
* Prefer server-side filtering and pagination for datasets too large for the browser.
* Avoid transferring data the current view does not need.
* Do not introduce client-side caching without a clear invalidation strategy.

### 6.8 Algorithm Selection

Use established algorithms when they materially simplify or improve the solution with the comment on the piece of code to let the user know which aalgorithm is used where:

* Binary search
* Two pointers
* Sliding window
* Hash-based indexing
* Prefix sums
* BFS / DFS
* Topological sorting
* Heap / priority queue
* Divide and conquer
* Dynamic programming
* Greedy algorithms
* Interval merging
* Graph traversal

Do not use an advanced algorithm merely because it is theoretically interesting. **Prefer a straightforward O(n) solution over a complicated O(log n) or O(n log n) solution when the practical difference is negligible.**

### 6.9 Recursion and Traversal Safety

* Prefer iterative implementations when input depth may be large or externally controlled.
* Recursion is acceptable when it clearly expresses the algorithm and maximum depth is bounded.
* Tree and graph traversal must account for cycles and repeated nodes.
* Graph traversal must maintain a visited set when cycles are possible.
* Do not use recursion merely to reduce line count.

### 6.10 Optimization Discipline

Follow this optimization order:

1. Choose the correct algorithm.
2. Choose the correct data structure.
3. Eliminate unnecessary work.
4. Reduce database and network round trips.
5. Reduce unnecessary memory allocation.
6. Reduce unnecessary frontend rendering.
7. Only then consider micro-optimizations.

Do not introduce:

* premature caching
* unnecessary memoization
* speculative parallelism
* custom data structures without a concrete need
* clever bit-level or regex optimizations
* performance abstractions with only one use case

When an optimization makes code less obvious, it must be justified by **expected scale, measured performance, profiling, query analysis, or another concrete constraint**.

### 6.11 Performance Review Checklist

For performance-sensitive code, verify:

* [ ] No accidental O(n²) or worse operation.
* [ ] Appropriate `Map`/`Set` usage for repeated lookup or membership.
* [ ] Sorting is necessary and not repeatedly performed.
* [ ] Large inputs have bounded memory usage.
* [ ] No N+1 database or network operations.
* [ ] Queries retrieve only required data.
* [ ] Pagination is bounded and appropriate for dataset size.
* [ ] Frontend rendering does not perform unnecessary large computations.
* [ ] Caches have explicit lifetime and invalidation behavior.
* [ ] Optimization is justified by actual requirements or measured evidence.
* [ ] The implementation remains consistent with the simplicity and readability rules above.

### 6.12 Core Performance Principle

> **Use the simplest algorithm and data structure that satisfies correctness, expected scale, and performance requirements.**

Performance optimization must never become an excuse for speculative abstraction, premature complexity, or code that is difficult for humans and agents to understand six months later.
