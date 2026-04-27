# Failure Scenarios: Modeling

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
