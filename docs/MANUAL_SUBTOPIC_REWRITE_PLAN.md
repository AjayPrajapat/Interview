# Manual Subtopic Rewrite Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use manual review discipline. Do not rewrite subtopic README files with bulk scripts or generators. Each subtopic must be read, judged against its topic, rewritten by hand, and verified before moving on.

**Goal:** Review and rewrite every subtopic `README.md` so each one becomes topic-specific, production-focused, interview-ready learning documentation instead of generic template text.

**Architecture:** Work in strict repository order. Each subtopic is treated as one manual documentation task with its own review, rewrite, verification, and progress note. Existing `diagrams.md` files may be referenced but should not be regenerated unless the subtopic README exposes a diagram mismatch.

**Tech Stack:** Markdown, Mermaid where useful, JavaScript/TypeScript examples where relevant, shell verification with `rg`, `sed`, `git diff --check`, and local Markdown link checks.

---

## Non-Negotiable Rules

- Rewrite one subtopic at a time.
- Read the current README before editing.
- Do not use `.opencode/enrich-subtopic-readmes.mjs` for this manual pass.
- Do not run bulk rewrite scripts.
- Keep the 18-section master structure.
- Make content specific to the category, topic, and subtopic.
- Add real examples, confusing examples, production use cases, debugging scenarios, exercises, comparisons, and Staff/Principal add-ons.
- Verify each edited file before moving to the next subtopic.
- Do not push until a reviewed batch is complete and verified.

## Required README Structure

Every reviewed subtopic README must include:

- `## 1. Definition`
- `## 2. Why It Exists`
- `## 3. Syntax & Variants`
- `## 4. Internal Working`
- `## 5. Memory Behavior`
- `## 6. Execution Behavior`
- `## 7. Scope & Context Interaction`
- `## 8. Common Examples`
- `## 9. Confusing / Tricky Examples`
- `## 10. Real Production Use Cases`
- `## 11. Interview Questions`
- `## 12. Senior-Level Pitfalls`
- `## 13. Best Practices`
- `## 14. Debugging Scenarios`
- `## 15. Exercises / Practice`
- `## 16. Comparison`
- `## 17. Related Concepts`
- `## Advanced Add-ons`
- `### Performance Impact`
- `### System Design Relevance`
- `### Security Impact`
- `### Browser vs Node Behavior`
- `### Polyfill / Implementation`
- `## 18. Summary`

## Per-Subtopic Task Card

Use this exact task card for every subtopic.

### Task: Rewrite `<SUBTOPIC README PATH>`

**Inputs to read first:**

- Current subtopic README.
- Neighboring subtopic READMEs in the same topic.
- Parent topic README.
- Parent category README.
- Existing `diagrams.md` for the same subtopic.

**Manual review questions:**

- What is the precise topic-specific definition?
- What problem does this concept solve in this category?
- Which syntax, API, pattern, protocol, or operational shape belongs here?
- What are the real internals?
- What memory, CPU, network, storage, browser, runtime, or organizational resource is affected?
- What execution path should a senior engineer be able to trace?
- What examples are actually relevant to this subtopic?
- What traps would show up in interviews?
- What production incidents or bugs can this cause?
- What should a Staff/Principal engineer mention that a mid-level engineer may miss?

**Rewrite requirements:**

- Replace generic generated wording.
- Keep examples concrete.
- Prefer domain-specific examples over abstract placeholders.
- Include at least one realistic production debugging scenario.
- Include at least one comparison table when the topic has meaningful alternatives.
- Include related concepts that point to nearby learning dependencies.
- Keep Markdown readable and balanced.

**Verification commands:**

```bash
rg -n "^## (1\\. Definition|2\\. Why It Exists|3\\. Syntax & Variants|4\\. Internal Working|5\\. Memory Behavior|6\\. Execution Behavior|7\\. Scope & Context Interaction|8\\. Common Examples|9\\. Confusing / Tricky Examples|10\\. Real Production Use Cases|11\\. Interview Questions|12\\. Senior-Level Pitfalls|13\\. Best Practices|14\\. Debugging Scenarios|15\\. Exercises / Practice|16\\. Comparison|17\\. Related Concepts|Advanced Add-ons|18\\. Summary)|^### (Performance Impact|System Design Relevance|Security Impact|Browser vs Node Behavior|Polyfill / Implementation)" "<SUBTOPIC README PATH>"
git diff --check -- "<SUBTOPIC README PATH>"
node - <<'NODE'
const fs = require('fs');
const file = process.argv[1];
const text = fs.readFileSync(file, 'utf8');
const fences = (text.match(/^```/gm) || []).length;
console.log(`Fence markers: ${fences}`);
if (fences % 2 !== 0) process.exit(1);
NODE "<SUBTOPIC README PATH>"
```

**Completion note format:**

```txt
Completed: <SUBTOPIC PATH>
Changed: <specific topic-focused improvements>
Verified: headings, git diff --check, balanced code fences
Next: <NEXT SUBTOPIC PATH>
```

## Batch Strategy

Use small batches so review quality stays high.

- Batch size: 1 to 3 subtopics per turn.
- Commit/push checkpoint suggestion: after 12 subtopics, usually one full category.
- Deep JavaScript/TypeScript/runtime topics: 1 subtopic per turn.
- Operational or leadership topics: up to 3 subtopics per turn if content quality stays high.

## Progress Status

Legend:

- `[x]` Manually reviewed and rewritten.
- `[>]` Current / next target.
- `[ ]` Pending manual review.

## Current Completed Work

- [x] `001. JavaScript Core/001.01 Language Fundamentals/001.01.01 Variables & Declarations/README.md`
- [x] `001. JavaScript Core/001.01 Language Fundamentals/001.01.02 Scope, Closures, and Hoisting/README.md`
- [x] `001. JavaScript Core/001.01 Language Fundamentals/001.01.03 Prototypes and Object Model/README.md`
- [x] `001. JavaScript Core/001.02 Execution Model/001.02.01 Call Stack/README.md`
- [x] `001. JavaScript Core/001.02 Execution Model/001.02.02 Event Loop and Tasks/README.md`
- [x] `001. JavaScript Core/001.02 Execution Model/001.02.03 Promises and Async-Await/README.md`
- [x] `001. JavaScript Core/001.03 Advanced Runtime Behavior/001.03.01 Equality and Coercion/README.md`
- [x] `001. JavaScript Core/001.03 Advanced Runtime Behavior/001.03.02 Memory and Garbage Collection/README.md`
- [x] `001. JavaScript Core/001.03 Advanced Runtime Behavior/001.03.03 Modules and Bundling Boundaries/README.md`

## Strict Review Order

### 001. JavaScript Core

- [x] `001.01 Language Fundamentals/001.01.01 Variables & Declarations/README.md`
- [x] `001.01 Language Fundamentals/001.01.02 Scope, Closures, and Hoisting/README.md`
- [x] `001.01 Language Fundamentals/001.01.03 Prototypes and Object Model/README.md`
- [x] `001.02 Execution Model/001.02.01 Call Stack/README.md`
- [x] `001.02 Execution Model/001.02.02 Event Loop and Tasks/README.md`
- [x] `001.02 Execution Model/001.02.03 Promises and Async-Await/README.md`
- [x] `001.03 Advanced Runtime Behavior/001.03.01 Equality and Coercion/README.md`
- [x] `001.03 Advanced Runtime Behavior/001.03.02 Memory and Garbage Collection/README.md`
- [x] `001.03 Advanced Runtime Behavior/001.03.03 Modules and Bundling Boundaries/README.md`
- [>] `001.04 Production JavaScript/001.04.01 Error Handling/README.md`
- [ ] `001.04 Production JavaScript/001.04.02 Performance Profiling/README.md`
- [ ] `001.04 Production JavaScript/001.04.03 Maintainability at Scale/README.md`

### 002. JavaScript Internals

- [ ] `002.01 Engine Architecture/002.01.01 Parsing and AST/README.md`
- [ ] `002.01 Engine Architecture/002.01.02 Bytecode and JIT/README.md`
- [ ] `002.01 Engine Architecture/002.01.03 Inline Caches and Hidden Classes/README.md`
- [ ] `002.02 Runtime Semantics/002.02.01 Execution Contexts/README.md`
- [ ] `002.02 Runtime Semantics/002.02.02 Lexical Environments/README.md`
- [ ] `002.02 Runtime Semantics/002.02.03 Microtasks and Macrotasks/README.md`
- [ ] `002.03 Memory Internals/002.03.01 Heap Layout/README.md`
- [ ] `002.03 Memory Internals/002.03.02 Garbage Collection/README.md`
- [ ] `002.03 Memory Internals/002.03.03 Leaks and Retainers/README.md`
- [ ] `002.04 Optimization Boundaries/002.04.01 Deoptimization/README.md`
- [ ] `002.04 Optimization Boundaries/002.04.02 Shape Changes/README.md`
- [ ] `002.04 Optimization Boundaries/002.04.03 Benchmarking Pitfalls/README.md`

### 003. TypeScript

- [ ] `003.01 Type System Foundations/003.01.01 Structural Typing/README.md`
- [ ] `003.01 Type System Foundations/003.01.02 Narrowing and Control Flow/README.md`
- [ ] `003.01 Type System Foundations/003.01.03 Generics and Constraints/README.md`
- [ ] `003.02 Advanced Types/003.02.01 Conditional Types/README.md`
- [ ] `003.02 Advanced Types/003.02.02 Mapped and Template Literal Types/README.md`
- [ ] `003.02 Advanced Types/003.02.03 Variance and Inference/README.md`
- [ ] `003.03 Application Architecture/003.03.01 API Contracts/README.md`
- [ ] `003.03 Application Architecture/003.03.02 Domain Modeling/README.md`
- [ ] `003.03 Application Architecture/003.03.03 Monorepo Type Boundaries/README.md`
- [ ] `003.04 Compiler and Tooling/003.04.01 tsconfig Strategy/README.md`
- [ ] `003.04 Compiler and Tooling/003.04.02 Declaration Files/README.md`
- [ ] `003.04 Compiler and Tooling/003.04.03 Build Performance/README.md`

### 004-110 Numbered Categories

For categories `004` through `110`, process each category in numeric order. Each category has 12 subtopics:

```txt
<CATEGORY>/<TOPIC 01>/<SUBTOPIC 01>/README.md
<CATEGORY>/<TOPIC 01>/<SUBTOPIC 02>/README.md
<CATEGORY>/<TOPIC 01>/<SUBTOPIC 03>/README.md
<CATEGORY>/<TOPIC 02>/<SUBTOPIC 01>/README.md
<CATEGORY>/<TOPIC 02>/<SUBTOPIC 02>/README.md
<CATEGORY>/<TOPIC 02>/<SUBTOPIC 03>/README.md
<CATEGORY>/<TOPIC 03>/<SUBTOPIC 01>/README.md
<CATEGORY>/<TOPIC 03>/<SUBTOPIC 02>/README.md
<CATEGORY>/<TOPIC 03>/<SUBTOPIC 03>/README.md
<CATEGORY>/<TOPIC 04>/<SUBTOPIC 01>/README.md
<CATEGORY>/<TOPIC 04>/<SUBTOPIC 02>/README.md
<CATEGORY>/<TOPIC 04>/<SUBTOPIC 03>/README.md
```

Before starting each category, list its 12 exact README paths with:

```bash
find "<CATEGORY DIR>" -mindepth 3 -maxdepth 3 -type f -name README.md | sort
```

Then complete each path with the per-subtopic task card above.

### Unnumbered Senior Production Categories

After `110. Staff-Principal Engineer Mindset`, process these root categories alphabetically:

- [ ] `Architecture Governance`
- [ ] `Backpressure`
- [ ] `Capacity Planning`
- [ ] `Compliance Basics`
- [ ] `Concurrency`
- [ ] `Cost Optimization`
- [ ] `Data Privacy`
- [ ] `Failure Handling`
- [ ] `Load Testing`
- [ ] `Memory Leaks`
- [ ] `Operational Excellence`
- [ ] `Production Readiness`
- [ ] `Race Conditions`
- [ ] `Resilience Patterns`
- [ ] `Threat Modeling`

Each unnumbered category also has 12 subtopics. Before starting each, list exact README paths with:

```bash
find "<CATEGORY DIR>" -mindepth 3 -maxdepth 3 -type f -name README.md | sort
```

## Topic-Specific Rewrite Guidance

Use the category to decide what "deep" means.

### JavaScript / TypeScript / Runtime

Focus on language semantics, engine internals, execution context, memory, edge cases, browser vs Node behavior, interview output questions, and production bugs.

### Frontend

Focus on rendering, state, accessibility, hydration, browser APIs, performance, design system integration, and user-facing failure modes.

### Backend / API

Focus on request lifecycle, validation, authentication, persistence, dependency calls, timeouts, retries, idempotency, observability, and operational safety.

### Distributed Systems

Focus on boundaries, consistency, availability, ordering, retries, queues, backpressure, partial failure, SLOs, and incident response.

### Data

Focus on modeling, indexes, query plans, transactions, consistency, cardinality, migration, data quality, and operational debugging.

### Security / Compliance

Focus on threat models, trust boundaries, least privilege, data exposure, auditability, controls, abuse cases, and incident evidence.

### Cloud / DevOps / Observability

Focus on runtime operations, deployment safety, autoscaling, cost, SLOs, dashboards, alerts, traces, logs, capacity, rollback, and runbooks.

### Testing / Quality

Focus on test pyramid, determinism, fixtures, isolation, contracts, flakiness, CI feedback, coverage quality, and release confidence.

### AI-Assisted Engineering

Focus on model behavior, context construction, evaluation, retrieval, prompt failure modes, review gates, cost, latency, and human oversight.

### Leadership / Staff Engineering

Focus on decision quality, communication, trade-offs, governance, mentoring, alignment, delivery risk, architecture reviews, and organizational leverage.

## Batch Completion Checklist

At the end of each batch:

- [ ] Every edited README has the 18 master sections.
- [ ] Every edited README has Staff/Principal advanced add-ons.
- [ ] Every edited README has topic-specific examples.
- [ ] No edited README has obvious generic placeholder language.
- [ ] `git diff --check` passes for edited files.
- [ ] Code fences are balanced for edited files.
- [ ] Local Markdown links resolve for edited files.
- [ ] Final response names completed files and next file.

## Next Immediate Task

Continue with:

```txt
001. JavaScript Core/001.04 Production JavaScript/001.04.01 Error Handling/README.md
```
