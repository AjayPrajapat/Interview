# Quick Reference: Trade-off Narratives

## Core Definition

Trade-off Narratives is a Agile / Scrum / Delivery concept inside Communication that should be understood through its boundary, invariant, execution flow, failure behavior, and trade-offs.

## Remember These Five Things

1. Boundary: where the behavior starts and stops.
2. Invariant: what must remain true.
3. Mechanism: how it works internally.
4. Failure: what breaks under bad input, load, retries, or partial deploys.
5. Signal: what evidence proves the behavior is healthy or unhealthy.

## Fast Mental Flow

```text
Define -> Trace -> Break -> Debug -> Optimize -> Explain trade-off
```

## Red Flags

- You can define it but cannot show an example.
- You know the happy path but not the failure path.
- You cannot name the metric or log that would reveal a production issue.
- You cannot compare a simple approach with a more scalable approach.
- You cannot explain ownership or rollback.

## One-Minute Review

- What is Trade-off Narratives?
- Why does it matter in Agile / Scrum / Delivery?
- What is one hidden edge case?
- How would you debug it?
- What would change at scale?
