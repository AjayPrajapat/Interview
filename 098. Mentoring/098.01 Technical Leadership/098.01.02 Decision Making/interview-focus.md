# Interview Focus: Decision Making

## Common Questions

- What is Decision Making, and why does it matter?
- How does it work internally?
- How would you implement it in Mentoring?
- What breaks under load?
- How do you debug production issues related to it?

## Tricky Scenarios

- Intermittent failures.
- High p99 latency.
- Duplicate work.
- Stale data.
- Memory growth.
- Behavior that changes only in production.

## Follow-Up Depth

Be ready to discuss instrumentation, rollback plans, migration strategy, data consistency, operational ownership, and design changes at 10x scale.

## Answer Structure

Use this structure in interviews:

1. Define the topic precisely.
2. Explain the internal flow.
3. Show a small example.
4. Name edge cases and failure modes.
5. Discuss trade-offs.
6. Explain how you would debug it in production.
7. Describe how the design changes at scale.

## Strong Signals

- You can separate language/framework behavior from application architecture.
- You mention p95/p99, memory, ownership, rollout, and rollback where relevant.
- You do not answer only the happy path.
- You can explain when a simpler approach is better than an advanced one.
