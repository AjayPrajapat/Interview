# System Design Connections: Recovery Patterns

## Connection

Operational topics map to reliability, scalability, deployment safety, platform ownership, and business continuity.

## Design Dimensions

- Boundary: where does Recovery Patterns start and stop?
- State: who owns the state and how is it changed?
- Consistency: what must be immediately true, eventually true, or explicitly best-effort?
- Scale: what bottleneck appears first?
- Failure: what happens during timeout, retry, cancellation, or partial success?
- Observability: what must be logged, measured, traced, or audited?

## Architecture Review Questions

- Does this topic affect service boundaries?
- Does it change client or downstream contracts?
- Does it introduce shared state or shared ownership?
- Does it need a migration plan?
- Does it require a rollback path?
- Does it affect cost, latency, reliability, or security posture?

## Trade-Off Template

```text
Option A:
  Benefits:
  Costs:
  Failure modes:

Option B:
  Benefits:
  Costs:
  Failure modes:

Decision:
  Choose:
  Because:
  Revisit when:
```
