# Debugging Strategies: Event Emitters

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

## Debugging Checklist

- Confirm the exact symptom and affected scope.
- Compare a healthy request/path with an unhealthy one.
- Check recent deploys, config changes, data migrations, traffic shifts, and dependency incidents.
- Reduce the problem to one failing invariant.
- Reproduce with the smallest input that still fails.
- Add instrumentation before changing behavior if the cause is uncertain.

## Common False Leads

- Blaming the nearest stack trace frame instead of the root cause.
- Debugging averages while the issue is in p99.
- Ignoring retries that multiply traffic during incidents.
- Assuming local reproduction proves production behavior.
- Treating missing logs as proof that nothing happened.
