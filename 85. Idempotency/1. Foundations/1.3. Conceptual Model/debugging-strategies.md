# Debugging Strategies: Conceptual Model

## Debugging Flow

- Reproduce with minimal inputs.
- Add concurrency, load, and failure injection.
- Compare healthy and unhealthy paths.
- Follow correlation IDs across logs, traces, and metrics.
- Verify assumptions about ordering, retries, caching, ownership, and lifecycle timing.

## Useful Evidence

- Logs with structured fields.
- Distributed traces.
- Metrics by percentile and dimension.
- Heap snapshots and CPU profiles.
- Network captures.
- Query plans.
- Browser performance recordings where applicable.
