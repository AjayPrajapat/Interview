# Architecture Decisions: Resource Contention

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
