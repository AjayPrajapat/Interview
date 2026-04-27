# Internal Flow: Generics and Constraints

```text
Input / trigger
  -> boundary validation
  -> Type System Foundations decision point
  -> Generics and Constraints execution path
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
