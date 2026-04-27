# Core Concepts: Incident Diagnosis

## Definition

Describe what Incident Diagnosis means in Tracing, what problem it solves, and what boundary it owns.

## Internal Working

- Input enters through an explicit boundary.
- Validation and normalization happen before state changes.
- The Production Operations layer decides which path should execute.
- Side effects are isolated, observed, and made retry-safe where possible.

## Key Principles

- Make contracts explicit.
- Keep ownership clear.
- Prefer predictable degradation over hidden failure.
- Design for testability and observability from the start.
