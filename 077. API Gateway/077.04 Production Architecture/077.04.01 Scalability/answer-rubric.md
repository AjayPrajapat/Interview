# Answer Rubric: Scalability

## Weak Answer

- Gives only a definition.
- Explains only the happy path.
- Has no edge cases.
- Has no production symptoms.
- Uses vague phrases like "it depends" without naming the dependency.

## Good Answer

- Defines Scalability clearly.
- Explains the mechanism.
- Gives a concrete example.
- Names common edge cases.
- Mentions at least one debugging signal.

## Strong Senior Answer

- Connects Scalability to backend/API engineering.
- Explains failure behavior under load, retry, cancellation, or partial deploy.
- Compares two approaches and trade-offs.
- Mentions tests, observability, and rollback.
- Explains what changes at 10x scale.

## Staff-Level Answer

- Names ownership and blast radius.
- Explains migration and compatibility risk.
- Connects local design to system design.
- Discusses operational burden and cost.
- Defines the metric or incident pattern that would trigger redesign.

## Self-Score

| Score | Meaning |
|---:|---|
| 1 | I recognize the term. |
| 2 | I can explain the happy path. |
| 3 | I can implement and test it. |
| 4 | I can debug production failures. |
| 5 | I can make architecture decisions and teach others. |
