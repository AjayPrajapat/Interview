# Domain-Specific Examples: Trade-off Narratives

## Domain Lens

Category domain: technical leadership

Use Trade-off Narratives to reason about a cross-team engineering decision where clarity, influence, trade-offs, delivery risk, and long-term ownership matter.

## Concrete Example

```ts
type DecisionRecord = {
  context: string;
  options: string[];
  decision: string;
  tradeoffs: string[];
  reviewDate: string;
};
```

## How To Study The Example

- Identify the input boundary.
- Name the invariant being protected.
- Trace the happy path.
- Add one invalid input.
- Add one high-scale or high-concurrency condition.
- Decide what telemetry would prove the behavior is correct.

## Production Translation

In Cross-Team Collaboration, this example should translate into:

- clearer contracts,
- safer defaults,
- explicit failure behavior,
- better debugging evidence,
- and a stronger explanation during interviews or architecture reviews.
