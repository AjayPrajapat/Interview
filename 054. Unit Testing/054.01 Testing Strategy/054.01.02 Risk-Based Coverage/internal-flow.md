# Internal Flow: Risk-Based Coverage

```text
Input / trigger
  -> boundary validation
  -> Testing Strategy decision point
  -> Risk-Based Coverage execution path
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

## Expanded Flow

```text
Caller intent
  -> input construction
  -> boundary validation
  -> authorization / policy check when applicable
  -> current state lookup
  -> decision branch
  -> core Risk-Based Coverage behavior
  -> side effect execution
  -> result mapping
  -> telemetry emission
  -> retry, rollback, compensation, or user-visible response
```

## Flow Review Checklist

- Every state transition has a named owner.
- Every external call has a timeout.
- Every retryable operation is safe to retry.
- Every failure mode has a visible signal.
- Every expensive operation has a known limit.
