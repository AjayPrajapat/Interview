# Core Concepts: Change Detection

## Definition

Change Detection is a core part of Angular that describes a specific behavior, boundary, or engineering decision inside Rendering and Reactivity.

The practical goal is to understand what problem it solves, what assumptions it makes, and what can break when those assumptions are false.

## Why It Exists

- It gives engineers a shared vocabulary for reasoning about Rendering and Reactivity.
- It makes hidden behavior explicit before it becomes a production bug.
- It helps separate local implementation choices from system-level consequences.
- It creates a foundation for deeper topics that depend on the same execution, data, or ownership model.

## Concept Boundary

Use Change Detection to reason about:

- Inputs and outputs.
- State ownership.
- Lifecycle timing.
- Error and failure behavior.
- Performance and scalability pressure.

Do not treat it as isolated trivia. In real systems, it interacts with runtime behavior, framework defaults, data contracts, deployment strategy, and team ownership.

## Internal Working

- Input enters through an explicit boundary.
- Validation and normalization happen before state changes.
- The Rendering and Reactivity layer decides which path should execute.
- Side effects are isolated, observed, and made retry-safe where possible.

## First-Principles Questions

- What state exists before this operation starts?
- Who owns that state?
- What invariant must remain true after execution?
- What assumptions are made about ordering, timing, identity, and dependencies?
- What is observable when the behavior succeeds, fails, or partially succeeds?

## Key Principles

- Make contracts explicit.
- Keep ownership clear.
- Prefer predictable degradation over hidden failure.
- Design for testability and observability from the start.
- Optimize only after identifying the real constraint.
- Treat unclear boundaries as future production risk.
