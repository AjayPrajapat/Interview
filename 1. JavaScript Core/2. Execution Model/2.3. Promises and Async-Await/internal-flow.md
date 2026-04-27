# Internal Flow: Promises and Async/Await

```text
Input / trigger
  -> boundary validation
  -> Execution Model decision point
  -> Promises and Async/Await execution path
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
