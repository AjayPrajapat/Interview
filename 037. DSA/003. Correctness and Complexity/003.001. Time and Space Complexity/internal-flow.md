# Internal Flow: Time and Space Complexity

```text
Input / trigger
  -> boundary validation
  -> Correctness and Complexity decision point
  -> Time and Space Complexity execution path
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
