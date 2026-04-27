# Internal Flow: Mapped and Template Literal Types

```text
Input / trigger
  -> boundary validation
  -> Advanced Types decision point
  -> Mapped and Template Literal Types execution path
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
