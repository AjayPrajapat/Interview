# Code-Level Understanding: Definitions

## Example Exercise

Build a small Design System example that demonstrates Definitions with:

- Typed inputs and outputs.
- Boundary validation.
- Explicit error paths.
- Tests for happy path and edge cases.
- Observability at important decisions.

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
