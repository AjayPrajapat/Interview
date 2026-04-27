# Compare And Contrast: Processes and Threads

## Compare With Simpler Alternatives

- Local implementation vs shared abstraction.
- Synchronous handling vs asynchronous workflow.
- Runtime validation vs compile-time constraints.
- Fail-fast behavior vs graceful degradation.
- Manual operation vs automated guardrails.

## Comparison Questions

- Which approach has the fewest moving parts?
- Which approach protects the invariant best?
- Which approach is easiest to operate during an incident?
- Which approach is easiest to migrate away from?
- Which approach creates the least cross-team coupling?

## Trade-Off Table

| Option | Best When | Risk | Operational Cost |
|---|---|---|---|
| Simple local approach | Scope is small and risk is low | Can duplicate logic | Low |
| Shared library or framework | Many consumers need consistency | Versioning and coupling | Medium |
| Platform or managed service | Scale or governance pressure is high | Vendor or platform dependency | Medium to high |
| Custom infrastructure | Requirements are specialized | Complexity and ownership burden | High |

## Decision Prompt

For Processes and Threads, choose the simplest approach that protects correctness today and leaves a clear path to evolve tomorrow.
