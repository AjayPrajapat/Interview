# Failure Scenarios: Domain Modeling

## Common Failures

- Dependency timeout or unavailable downstream service.
- Invalid, duplicated, stale, or out-of-order input.
- Configuration drift between environments.
- CPU, memory, network, connection pool, queue depth, or browser main-thread exhaustion.
- Partial success where one side effect commits and another fails.

## Production Readiness

- Timeouts and cancellation.
- Idempotency keys or deduplication.
- Retry with backoff and jitter.
- Circuit breakers or load shedding.
- Rollback, compensation, or replay strategy.

## Failure Drill

Simulate these conditions:

- Dependency latency increases by 5x.
- Input arrives twice.
- A deploy runs old and new versions together.
- The cache is empty or contains stale data.
- A downstream write succeeds but the response is lost.
- Observability is delayed or incomplete.

For each condition, answer:

- What breaks first?
- What metric changes first?
- What log or trace field identifies the affected path?
- What mitigation can be applied without a full redeploy?
