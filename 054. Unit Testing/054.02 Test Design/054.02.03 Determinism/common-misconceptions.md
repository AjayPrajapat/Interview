# Common Misconceptions: Determinism

## Misconception 1

Testing proves correctness. Tests sample risk; production confidence also needs observability, contracts, profiling, and controlled rollout.

Correction: learn the underlying mechanism, then connect it to production behavior and team ownership.

## Misconception 2

"If it works locally, the concept is understood."

Correction: local behavior rarely includes production traffic shape, old clients, retries, slow dependencies, partial deploys, or operational constraints.

## Misconception 3

"The best answer is the most advanced pattern."

Correction: the best answer is the simplest design that protects the required invariant and can evolve when evidence justifies complexity.

## Misconception 4

"This is only an implementation detail."

Correction: implementation details become architecture concerns when they affect contracts, data ownership, reliability, security, cost, or cross-team dependencies.

## Review Prompt

Write one sentence explaining what you used to believe about Determinism, then rewrite it with the production constraint included.
