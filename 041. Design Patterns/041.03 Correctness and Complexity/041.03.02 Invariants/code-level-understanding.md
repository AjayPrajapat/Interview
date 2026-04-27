# Code-Level Understanding: Invariants

## Example Exercise

Build a small Design Patterns example that demonstrates Invariants with:

- Typed inputs and outputs.
- Boundary validation.
- Explicit error paths.
- Tests for happy path and edge cases.
- Observability at important decisions.

## Implementation Skeleton

```ts
type Input = {
  id: string;
  payload: unknown;
};

type Result =
  | { ok: true; value: unknown }
  | { ok: false; error: string; retryable: boolean };

export function handle(input: Input): Result {
  if (!input.id) {
    return { ok: false, error: "missing_id", retryable: false };
  }

  try {
    // Replace this block with a concrete Invariants example.
    const value = input.payload;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: "unexpected_failure", retryable: true };
  }
}
```

## Test Cases To Add

- Happy path with valid input.
- Invalid input at the boundary.
- Duplicate or repeated input.
- Slow dependency or timeout path.
- Partial failure or rollback path.
- Large input or high-frequency execution.

## Anti-Patterns

- Hidden global state.
- Unbounded retries or queues.
- Catch-all error handling with no recovery plan.
- Over-broad abstractions.
- Missing cancellation, timeout, or cleanup logic.

## Best Practices

- Keep interfaces narrow.
- Validate data at system boundaries.
- Model failure as part of the design.
- Add tests around contracts and invariants.
- Prefer clear code over clever code.
- Make idempotency, timeout, and cleanup behavior explicit when side effects exist.
- Add logs and metrics at decision points, not only at the outermost handler.
