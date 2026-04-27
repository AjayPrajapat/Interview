# Capstone Exercise: Backpressure

## Scenario

You own a production workflow where correctness, observability, ownership, and maintainability matter. You must design, implement, test, operate, and explain Backpressure for a production system.

## Deliverables

1. A one-paragraph concept explanation.
2. A minimal code or architecture example.
3. A failure-mode table.
4. A debugging checklist.
5. A test plan.
6. A rollback or mitigation plan.
7. A short interview answer.
8. A staff-level review note.

## Constraints

- Assume at least one dependency can be slow.
- Assume input can be duplicated or malformed.
- Assume deploys are rolling, not instantaneous.
- Assume another team will depend on this behavior.
- Assume observability must be useful during an incident.

## Evaluation

Your solution is strong if:

- The invariant is explicit.
- The design is observable.
- Failure behavior is intentional.
- The implementation is testable.
- The trade-off is documented.
- The design can evolve without a rewrite.
