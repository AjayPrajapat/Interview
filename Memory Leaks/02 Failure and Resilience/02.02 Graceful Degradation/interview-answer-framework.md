# Interview Answer Framework: Graceful Degradation

## Short Answer

Graceful Degradation in Memory Leaks is about protecting a specific behavior or decision inside Failure and Resilience. A strong answer explains the mechanism, the edge cases, and how it behaves in production.

## Senior Answer Structure

1. Define it.
2. Explain why it exists.
3. Describe the internal mechanism.
4. Give a small example.
5. Name edge cases.
6. Discuss production failure modes.
7. Compare two approaches.
8. Explain debugging and observability.
9. Close with how the design changes at scale.

## Staff-Level Upgrade

Add:

- ownership boundaries,
- migration risk,
- rollback strategy,
- cross-team impact,
- operational burden,
- and the metric that would make you revisit the decision.

## Practice Prompt

"Teach me Graceful Degradation as if I am strong at coding but new to Memory Leaks. Then explain what changes when this runs in production."
