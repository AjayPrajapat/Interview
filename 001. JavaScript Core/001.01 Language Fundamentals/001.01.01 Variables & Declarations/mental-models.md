# Mental Models: Variables & Declarations

## Core Model

Think of Variables & Declarations as a contract between intent, state, execution, and observation.

```text
Intent -> Boundary -> State -> Decision -> Effect -> Signal
```

## First-Principles Frame

- What is the invariant?
- What is allowed to change?
- What must never happen?
- What is the smallest useful abstraction?
- What does the system do when reality violates assumptions?

## Staff-Level Frame

- Who owns this behavior?
- How does another team safely depend on it?
- How does it fail during deploys, migrations, or incidents?
- What is the cost of changing it later?
- What evidence would make us revisit the design?
