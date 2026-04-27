# Optimization Techniques: Migrations

## Optimization Order

1. Measure the bottleneck.
2. Remove unnecessary work.
3. Bound expensive paths.
4. Cache, batch, stream, paginate, debounce, or lazy-load only where evidence supports it.
5. Re-measure p95 and p99 behavior.

## Techniques

- Backpressure and bounded queues.
- Timeouts and circuit breakers.
- Data shape reduction.
- Indexing and query tuning.
- Bundle splitting or lazy loading.
- Connection pooling and concurrency limits.
- Precomputation for stable expensive work.
