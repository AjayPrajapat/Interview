# Internal Flow: Failure Modes

```text
Input / trigger
  -> boundary validation
  -> Failure and Resilience decision point
  -> Failure Modes execution path
  -> side effects / state change
  -> observable result
  -> retry, rollback, or compensation if needed
```

## Flow Questions

- What is the first trusted boundary?
- What state is read or written?
- Which operations are synchronous vs asynchronous?
- Which side effects must be idempotent?
- Where should logs, metrics, and traces be emitted?
