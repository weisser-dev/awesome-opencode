---
name: performance-profile
description: Analyze code for performance hotspots including complexity, N+1 queries, memory allocations, and caching opportunities
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: general
---

## What I do

- Analyze code for algorithmic complexity and performance anti-patterns
- Detect N+1 query patterns in database access code
- Identify unnecessary memory allocations and object creation
- Find missing or ineffective caching opportunities
- Produce a prioritized optimization plan with estimated impact

## When to use me

Use this skill when you need to:
- Investigate slow endpoints or operations
- Review code for performance before a load test
- Optimize database query patterns
- Reduce memory usage or garbage collection pressure
- Plan performance improvements with limited engineering time

## Process

1. **Identify the scope**: Determine what to profile
   - Specific endpoint or operation reported as slow
   - Module or service under performance review
   - Hot path identified by profiling tools

2. **Analyze algorithmic complexity**: Check for inefficient patterns
   - Nested loops over large collections (O(n^2) or worse)
   - Repeated linear searches where a hash map would work
   - Sorting in tight loops
   - String concatenation in loops (use builders/buffers)
   - Recursive functions without memoization

3. **Detect N+1 queries**: Scan database access patterns
   - Loop that executes a query per iteration
   - ORM lazy loading triggered in iteration
   - Missing eager loading / joins / batch fetching
   - Sequential queries that could be combined

4. **Check memory patterns**: Look for allocation hotspots
   - Large objects created inside loops
   - Unbounded list/buffer growth
   - Missing stream/iterator usage for large datasets
   - Holding references longer than needed (memory leaks)

5. **Evaluate caching**: Identify caching opportunities
   - Repeated identical computations or queries
   - Expensive operations with stable inputs
   - Missing HTTP cache headers on static responses
   - Cache invalidation correctness

6. **Produce optimization plan**: Prioritize by impact and effort

## Anti-Pattern Catalog

### N+1 Query Pattern

```python
# BAD: N+1 queries
users = db.query("SELECT * FROM users")
for user in users:
    orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")

# GOOD: Single query with JOIN or batch
users_with_orders = db.query("""
    SELECT u.*, o.*
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
""")
```

### Quadratic Loop

```javascript
// BAD: O(n * m) lookup
for (const order of orders) {
  const user = users.find(u => u.id === order.userId); // O(n) each time
}

// GOOD: O(n + m) with hash map
const userMap = new Map(users.map(u => [u.id, u]));
for (const order of orders) {
  const user = userMap.get(order.userId); // O(1) each time
}
```

### Unbounded Accumulation

```java
// BAD: Loading entire result set into memory
List<Record> allRecords = repository.findAll(); // millions of rows

// GOOD: Stream or paginate
try (Stream<Record> stream = repository.streamAll()) {
    stream.forEach(record -> process(record));
}
```

### Missing Memoization

```typescript
// BAD: Recomputing expensive result
function getReport(params: Params) {
  return expensiveComputation(params); // called repeatedly with same params
}

// GOOD: Cache the result
const cache = new Map<string, Report>();
function getReport(params: Params) {
  const key = JSON.stringify(params);
  if (!cache.has(key)) {
    cache.set(key, expensiveComputation(params));
  }
  return cache.get(key);
}
```

## Optimization Plan Format

```markdown
## Performance Optimization Plan

### Summary
- **Scope:** Order processing pipeline
- **Current p95 latency:** 2.4s
- **Target p95 latency:** 500ms

### Findings (Priority Order)

| # | Issue | Impact | Effort | Location |
|---|-------|--------|--------|----------|
| 1 | N+1 query in order loader | High | Low | `src/orders/loader.ts:34` |
| 2 | Quadratic user lookup | High | Low | `src/orders/enrich.ts:67` |
| 3 | No caching on product catalog | Medium | Medium | `src/products/service.ts:12` |
| 4 | Large JSON serialization in loop | Low | Low | `src/orders/export.ts:89` |

### Detailed Recommendations

#### 1. N+1 query in order loader (High Impact, Low Effort)
**Current:** 1 query per order to fetch items (100 orders = 101 queries)
**Fix:** Use batch query with `WHERE order_id IN (...)`
**Expected improvement:** ~80% latency reduction for this path
```

## Severity Assessment

| Level | Criteria |
|-------|----------|
| **Critical** | Causes timeouts, OOM, or system instability under normal load |
| **High** | Noticeable latency (>1s) on common user operations |
| **Medium** | Suboptimal but functional; affects throughput under high load |
| **Low** | Minor inefficiency; optimize if effort is minimal |

## Rules

- Always measure before and after; do not optimize without evidence
- Prioritize by impact-to-effort ratio, not just impact
- Focus on the hot path; do not optimize code that runs rarely
- Prefer algorithmic improvements over micro-optimizations
- Consider trade-offs: caching adds complexity and invalidation risk
- Document the expected improvement for each recommendation
- One optimization at a time; measure after each change
- Watch for premature optimization: if it is not measured as slow, skip it
