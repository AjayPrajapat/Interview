# Optimization Techniques: Variance and Inference

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

## Measurement Plan

- Define the target metric before optimizing.
- Capture baseline p50, p95, p99, error rate, and resource usage.
- Change one variable at a time.
- Re-measure under realistic load.
- Document the trade-off introduced by the optimization.

## When Not To Optimize

- The path is not on the critical user or system journey.
- The bottleneck is outside this layer.
- The optimization hides correctness problems.
- The added complexity has no owner.
- The expected gain is smaller than measurement noise.
