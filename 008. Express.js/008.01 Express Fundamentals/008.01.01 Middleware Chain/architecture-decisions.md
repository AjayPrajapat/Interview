# Architecture Decisions: Middleware Chain

## Approaches

- Simple in-process implementation.
- Framework-provided primitive.
- Shared internal platform capability.
- External managed service.
- Custom infrastructure for specialized scale or correctness needs.

## Trade-Offs

- Correctness vs latency.
- Simplicity vs flexibility.
- Team autonomy vs platform standardization.
- Build cost vs operational cost.
- Consistency vs availability.

## Decision Rule

Use the simplest approach that satisfies current correctness and scale needs. Move complexity behind stable interfaces only when pressure is proven by production evidence.

## Decision Matrix

| Pressure | Prefer | Avoid |
|---|---|---|
| Low scale, low risk | Simple local implementation | Premature platform abstraction |
| High correctness risk | Explicit validation and contracts | Implicit conventions |
| High traffic | Bounded queues, caching, batching, measurement | Unbounded fan-out |
| Many teams | Stable interfaces and ownership docs | Shared mutable behavior |
| Frequent change | Reversible decisions and feature flags | Big-bang migrations |

## Architecture Review Prompts

- What decision is hard to reverse?
- What does this couple us to?
- What is the blast radius of a bad deploy?
- How will future teams discover the intended pattern?
- Which metric tells us the decision stopped being good?
