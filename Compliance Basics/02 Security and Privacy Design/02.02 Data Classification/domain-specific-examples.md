# Domain-Specific Examples: Data Classification

## Domain Lens

Category domain: security and governance engineering

Use Data Classification to reason about a sensitive user workflow where identity, authorization, data handling, auditability, and threat modeling must align.

## Concrete Example

```ts
type AccessDecision = {
  subject: string;
  action: string;
  resource: string;
  allowed: boolean;
  reason: string;
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

In Compliance Basics, this example should translate into:

- clearer contracts,
- safer defaults,
- explicit failure behavior,
- better debugging evidence,
- and a stronger explanation during interviews or architecture reviews.
