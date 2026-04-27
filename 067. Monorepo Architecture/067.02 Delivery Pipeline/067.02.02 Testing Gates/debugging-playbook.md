# Debugging Playbook: Testing Gates

## Start Here

Debug Testing Gates by moving from symptom to invariant, not from stack trace to guess.

## Evidence To Gather

- Exact user or system symptom.
- Affected percentage and segment.
- Recent deploys or configuration changes.
- Logs with correlation IDs.
- Metrics by percentile, not only averages.
- Traces across boundaries.
- Resource saturation signals.
- Data shape or input examples.

## Domain Signals

error rate, latency, saturation, logs, traces, customer reports, deploy correlation

## Investigation Path

1. Reproduce with the smallest failing case.
2. Compare a passing case and failing case.
3. Identify where expected state diverges.
4. Check hidden defaults and lifecycle timing.
5. Add targeted instrumentation if evidence is missing.
6. Mitigate user impact.
7. Write the regression test or runbook update.

## Avoid

- Changing behavior before understanding the invariant.
- Debugging only the happy path.
- Trusting averages during tail-latency issues.
- Ignoring retries, caching, and partial deploys.
- Treating missing logs as proof that nothing happened.
