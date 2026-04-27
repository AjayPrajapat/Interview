# Core Concepts: Compliance and Auditability

## Definition

Describe what Compliance and Auditability means in OWASP Top 10, what problem it solves, and what boundary it owns.

## Internal Working

- Input enters through an explicit boundary.
- Validation and normalization happen before state changes.
- The Production Security layer decides which path should execute.
- Side effects are isolated, observed, and made retry-safe where possible.

## Key Principles

- Make contracts explicit.
- Keep ownership clear.
- Prefer predictable degradation over hidden failure.
- Design for testability and observability from the start.
