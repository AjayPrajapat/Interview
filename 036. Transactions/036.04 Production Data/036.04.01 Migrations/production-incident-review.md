# Production Incident Review: Migrations

## Scenario

A query that is fast in staging becomes a production bottleneck because cardinality, index selectivity, lock contention, or transaction scope differs.

## First Symptoms

- User-visible issue appears intermittently.
- Error or latency increases for one path before the whole system looks unhealthy.
- The failure is correlated with traffic, deploy timing, data shape, or dependency behavior.

## Likely Signals

slow query logs, lock waits, deadlocks, high I/O, replication lag, connection saturation, migration duration

## Triage Flow

1. Confirm customer impact and affected scope.
2. Check recent deploys, config changes, data migrations, and traffic shifts.
3. Compare healthy and unhealthy examples.
4. Identify the first broken invariant.
5. Mitigate before root-causing if user impact is active.
6. Preserve evidence for post-incident learning.

## Post-Incident Questions

- Which assumption failed?
- Which alert should have fired earlier?
- Which dashboard was missing?
- Which test or validation would have caught this before deploy?
- Which ownership or process gap made recovery slower?
