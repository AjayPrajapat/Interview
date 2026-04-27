# Deep Concepts: Maintainability at Scale

## Hidden Behaviors

- Framework defaults that change lifecycle, ordering, caching, retries, or error propagation.
- Runtime behavior that only appears under concurrency, load, large input, or slow dependencies.
- State that survives longer than expected through closures, caches, sessions, queues, or retained references.
- Behavior that differs between local development, CI, staging, and production.
- Implicit coupling through shared configuration, shared libraries, generated code, schemas, or deployment order.

## Edge Cases

- Empty, null, duplicated, stale, malformed, or out-of-order input.
- Partial success after one side effect commits and another fails.
- Timeout, cancellation, retry, and race-condition paths.
- Version mismatch between clients, services, schemas, or packages.
- First request after deploy, cold start, cache miss, expired token, rotated secret, and rolling deployment overlap.

## Internal Mechanisms

Identify the queues, buffers, schedulers, locks, indexes, render phases, network hops, heap references, context boundaries, or persistence paths behind the abstraction.

## Performance Implications

Measure latency, throughput, memory, CPU, I/O, payload size, bundle size, query cost, and p95/p99 behavior.

## Senior Engineer Lens

- Ask what happens when this path runs 10x more often.
- Ask what happens when the dependency becomes slow but not fully down.
- Ask what signal would prove the issue is here and not one layer above or below.
- Ask whether the current abstraction makes migration easier or harder.
- Ask whether the team that owns this path can operate it during an incident.
