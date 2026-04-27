# Core Concepts: Routing and Lazy Loading

## Definition

Describe what Routing and Lazy Loading means in Angular, what problem it solves, and what boundary it owns.

## Internal Working

- Input enters through an explicit boundary.
- Validation and normalization happen before state changes.
- The Angular Architecture layer decides which path should execute.
- Side effects are isolated, observed, and made retry-safe where possible.

## Key Principles

- Make contracts explicit.
- Keep ownership clear.
- Prefer predictable degradation over hidden failure.
- Design for testability and observability from the start.
