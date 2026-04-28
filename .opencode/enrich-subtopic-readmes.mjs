#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

const skipTopLevel = new Set([
  ".git",
  ".github",
  ".opencode",
  "docs",
]);

const preservedReadmes = new Set([
  path.join(
    "001. JavaScript Core",
    "001.01 Language Fundamentals",
    "001.01.01 Variables & Declarations",
    "README.md",
  ),
]);

const preservedDiagrams = new Set([
  path.join(
    "001. JavaScript Core",
    "001.01 Language Fundamentals",
    "001.01.01 Variables & Declarations",
    "diagrams.md",
  ),
]);

function stripNumber(name) {
  return name.replace(/^\d+(?:\.\d+)*\.?\s+/, "").trim();
}

function extractId(name) {
  const match = name.match(/^(\d+(?:\.\d+)*)\.?\s+/);
  return match?.[1] ?? "";
}

function cleanCategoryName(name) {
  return stripNumber(name).replaceAll("-", "/");
}

function cleanTopicName(name) {
  const id = extractId(name);
  const title = stripNumber(name);
  return id ? `${id} ${title}` : title;
}

function cleanSubtopicName(name) {
  const id = extractId(name);
  const title = stripNumber(name);
  return { id, title, heading: id ? `${id} ${title}` : title };
}

function domainFor(category) {
  const value = category.toLowerCase();

  if (/javascript|typescript|rxjs|functional|oop|dsa|lld|design patterns/.test(value)) {
    return {
      codeLabel: "TypeScript / JavaScript",
      codeBlock: "ts",
      artifact: "function, type, object, runtime behavior, data structure, or algorithm",
      runtime: "engine, compiler, type system, memory model, call stack, event loop, and module boundary",
      production: "frontend apps, Node.js services, SDKs, libraries, build pipelines, and shared platform packages",
      metric: "runtime errors, latency, memory growth, bundle size, CPU time, test failures, and defect rate",
    };
  }

  if (/angular|react|frontend|browser|html|css|design system|ui engineering|state management|accessibility|seo|ssr|hydration|webpack|vite|nx/.test(value)) {
    return {
      codeLabel: "Frontend / TypeScript",
      codeBlock: "tsx",
      artifact: "component, hook, service, directive, route, store, style rule, or browser API usage",
      runtime: "rendering lifecycle, browser event loop, network boundary, state updates, layout, paint, and hydration",
      production: "SaaS dashboards, design systems, ecommerce flows, admin tools, realtime interfaces, and content platforms",
      metric: "Core Web Vitals, p95 interaction latency, bundle size, hydration cost, error rate, and accessibility violations",
    };
  }

  if (/node|nestjs|express|api|rest|graphql|websocket|authentication|authorization|gateway|bff/.test(value)) {
    return {
      codeLabel: "Node.js / TypeScript",
      codeBlock: "ts",
      artifact: "handler, controller, middleware, resolver, guard, interceptor, service, or API contract",
      runtime: "request lifecycle, validation, authorization, dependency calls, persistence, serialization, and response mapping",
      production: "payments, identity, notifications, search, realtime collaboration, SaaS APIs, and partner integrations",
      metric: "p95/p99 latency, error rate, saturation, timeout rate, retry volume, queue depth, and dependency health",
    };
  }

  if (/system design|distributed|microservices|event-driven|kafka|rabbitmq|queue|background|scalability|reliability|architecture|cqrs|event sourcing|multi-tenant|saas|payment|notification|search/.test(value)) {
    return {
      codeLabel: "System / Service Design",
      codeBlock: "txt",
      artifact: "service boundary, data flow, queue, topic, cache, database table, API, worker, or consistency model",
      runtime: "network hops, service ownership, data consistency, retries, queues, partitions, backpressure, and observability",
      production: "multi-service platforms, high-volume event pipelines, tenant-aware SaaS systems, and mission-critical workflows",
      metric: "throughput, p99 latency, availability, durability, lag, error budget burn, duplicate rate, and recovery time",
    };
  }

  if (/database|sql|nosql|indexing|transactions|data modeling|redis|caching/.test(value)) {
    return {
      codeLabel: "Data / Storage",
      codeBlock: "sql",
      artifact: "schema, query, transaction, index, cache key, document, table, or consistency boundary",
      runtime: "query planner, indexes, locks, isolation level, cache behavior, replication, and storage layout",
      production: "reporting systems, product databases, ledger workflows, caches, search stores, and analytics pipelines",
      metric: "query latency, lock wait, cache hit ratio, replication lag, cardinality, read/write amplification, and storage growth",
    };
  }

  if (/security|owasp|privacy|compliance|threat/.test(value)) {
    return {
      codeLabel: "Security / Platform",
      codeBlock: "txt",
      artifact: "control, policy, trust boundary, data classification, token, permission, audit event, or abuse case",
      runtime: "identity, trust boundaries, authorization checks, secret handling, input validation, auditability, and incident response",
      production: "identity systems, admin platforms, regulated data flows, payment systems, APIs, and internal tooling",
      metric: "blocked attack attempts, policy violations, audit gaps, exposure window, false positives, and incident response time",
    };
  }

  if (/cloud|devops|docker|kubernetes|ci|cd|infrastructure|observability|logging|monitoring|tracing|production|incident|operational|load testing|capacity|cost|resilience|failure|backpressure|concurrency|race|memory leaks/.test(value)) {
    return {
      codeLabel: "Operations / Platform",
      codeBlock: "yaml",
      artifact: "deployment, container, pipeline, alert, dashboard, runbook, scaling rule, or operational control",
      runtime: "deploy pipeline, runtime resources, autoscaling, health checks, telemetry, rollback, and incident workflow",
      production: "cloud platforms, Kubernetes clusters, CI/CD pipelines, SRE workflows, and operational control planes",
      metric: "availability, error budget burn, saturation, cost, deploy frequency, MTTR, alert quality, and capacity headroom",
    };
  }

  if (/testing|unit|integration|e2e|contract|performance engineering/.test(value)) {
    return {
      codeLabel: "Testing / Quality",
      codeBlock: "ts",
      artifact: "test case, fixture, contract, test double, assertion, load profile, or quality gate",
      runtime: "test isolation, environment setup, data lifecycle, determinism, parallelism, and feedback loops",
      production: "release pipelines, critical user journeys, API contracts, regression suites, and performance validation",
      metric: "coverage quality, flake rate, defect escape rate, test duration, confidence, and release risk",
    };
  }

  if (/llm|ai|prompt|copilot|cursor|claude|chatgpt|rag|agentic/.test(value)) {
    return {
      codeLabel: "AI-Assisted Engineering",
      codeBlock: "ts",
      artifact: "prompt, evaluation, retrieval pipeline, coding workflow, review loop, agent step, or safety policy",
      runtime: "context construction, retrieval, model behavior, evaluation, tool use, review gates, and human oversight",
      production: "developer platforms, support automation, code review assistants, documentation systems, and AI-enabled workflows",
      metric: "task success rate, hallucination rate, review quality, latency, cost, token usage, and human override rate",
    };
  }

  return {
    codeLabel: "Engineering",
    codeBlock: "ts",
    artifact: "module, workflow, decision, service, contract, or operational process",
    runtime: "boundaries, lifecycle, ownership, state transitions, dependencies, and feedback signals",
    production: "product systems, platform workflows, internal tools, APIs, data flows, and customer-facing services",
    metric: "latency, correctness, reliability, cost, maintainability, operational load, and customer impact",
  };
}

function exampleFor(domain, category, topicTitle, subtopicTitle) {
  if (domain.codeBlock === "sql") {
    return `-- ${subtopicTitle}: verify shape, access path, and correctness.
EXPLAIN
SELECT *
FROM important_records
WHERE tenant_id = :tenant_id
  AND status = :status
ORDER BY created_at DESC
LIMIT 50;`;
  }

  if (domain.codeBlock === "yaml") {
    return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${slugify(subtopicTitle)}-readiness
data:
  owner: platform
  topic: ${quoteYaml(topicTitle)}
  check: "Define health, limits, rollback, and alerts before production use."`;
  }

  if (domain.codeBlock === "txt") {
    return `${subtopicTitle} production flow
  -> define owner and boundary
  -> validate input and invariant
  -> execute core behavior
  -> handle timeout, retry, or partial failure
  -> emit logs, metrics, and traces
  -> verify customer and system impact`;
  }

  if (domain.codeBlock === "tsx") {
    return `type ${safeTypeName(subtopicTitle)}Props = {
  id: string;
  enabled: boolean;
};

export function ${safeTypeName(subtopicTitle)}View(props: ${safeTypeName(subtopicTitle)}Props) {
  const statusLabel = props.enabled ? "active" : "inactive";

  return (
    <section data-topic="${escapeAttr(subtopicTitle)}">
      <h2>{statusLabel}</h2>
    </section>
  );
}`;
  }

  return `type ${safeTypeName(subtopicTitle)}Input = {
  id: string;
  payload: unknown;
};

type ${safeTypeName(subtopicTitle)}Result =
  | { ok: true; value: unknown }
  | { ok: false; error: string; retryable: boolean };

export function handle${safeTypeName(subtopicTitle)}(
  input: ${safeTypeName(subtopicTitle)}Input,
): ${safeTypeName(subtopicTitle)}Result {
  if (!input.id) {
    return { ok: false, error: "missing_id", retryable: false };
  }

  try {
    const value = input.payload;
    return { ok: true, value };
  } catch {
    return { ok: false, error: "unexpected_failure", retryable: true };
  }
}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "topic";
}

function quoteYaml(value) {
  return value.replaceAll('"', '\\"');
}

function escapeAttr(value) {
  return value.replaceAll('"', "&quot;");
}

function mermaidLabel(value) {
  return value.replaceAll('"', '\\"');
}

function safeTypeName(value) {
  const cleaned = value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return cleaned && /^[A-Z]/.test(cleaned) ? cleaned : `Topic${cleaned || "Example"}`;
}

function readmeFor({ categoryName, topicName, subtopicName }) {
  const categoryTitle = cleanCategoryName(categoryName);
  const topicTitle = cleanTopicName(topicName);
  const { heading, title: subtopicTitle } = cleanSubtopicName(subtopicName);
  const domain = domainFor(categoryTitle);
  const code = exampleFor(domain, categoryTitle, topicTitle, subtopicTitle);

  return `# ${heading}

Category: ${categoryTitle}

Topic: ${topicTitle}

## Definition

${subtopicTitle} is a focused engineering concept inside ${topicTitle}. It describes a behavior, design choice, implementation technique, or operational concern that engineers must understand deeply to build reliable systems in ${categoryTitle}.

At a practical level, this topic answers:

- what problem it solves,
- what boundary it belongs to,
- what assumptions it depends on,
- how it behaves during normal execution,
- how it fails under pressure,
- and how to reason about it in production.

The goal is not only to recognize the term. The goal is to explain ${subtopicTitle} from first principles, apply it in code or architecture, debug it when it breaks, and defend trade-offs in an interview or design review.

## Why It Exists

${subtopicTitle} exists because real systems need explicit rules for correctness, ownership, execution, and change. Without this concept, teams usually rely on implicit assumptions, and implicit assumptions become bugs when systems grow.

This topic matters because it helps engineers:

- reduce ambiguity in ${topicTitle},
- make behavior easier to test and review,
- prevent local decisions from creating system-level failures,
- identify performance and reliability limits before production incidents,
- communicate trade-offs clearly across frontend, backend, platform, security, and product teams.

You should understand this before moving deeper because later topics often depend on the same mental models: state ownership, lifecycle timing, API contracts, failure handling, scaling pressure, and observability.

## Syntax / Interface Shape

Not every engineering topic has programming syntax, but every topic has an interface shape. The interface shape is how the concept appears to the rest of the system.

In ${categoryTitle}, ${subtopicTitle} commonly appears as a ${domain.artifact}.

Typical shape:

\`\`\`${domain.codeBlock}
${code}
\`\`\`

When reading or writing code for this topic, identify:

- the input boundary,
- the output contract,
- the state being read or changed,
- the owner of the behavior,
- the failure path,
- the observability signal.

## Internal Working

The internal working of ${subtopicTitle} should be understood as a lifecycle, not as a definition.

\`\`\`text
Input / trigger
  -> validate assumptions
  -> enter ${topicTitle} boundary
  -> apply ${subtopicTitle} rules
  -> read or update state
  -> handle success, failure, or partial success
  -> emit observable signal
  -> return result or continue workflow
\`\`\`

For this topic, inspect the real mechanism behind the abstraction:

- ${domain.runtime},
- ordering and timing,
- ownership of mutable state,
- limits and resource usage,
- retry, cancellation, cleanup, and rollback behavior,
- how the behavior changes between local development, CI, staging, and production.

Senior engineers do not stop at "it works." They ask what the runtime must do, what it keeps in memory, what it sends over the network, what can be retried, what can be duplicated, and what must be protected by invariants.

## Memory Behavior

Every topic consumes or protects memory, state, or another resource. For ${subtopicTitle}, reason about memory and resource behavior explicitly.

Common resources:

- memory and retained references,
- CPU and event-loop time,
- network calls and connection pools,
- database locks, indexes, and storage,
- queue depth and worker capacity,
- browser main-thread budget,
- cloud cost and operational attention.

Resource model:

\`\`\`text
Work enters system
  -> resource is allocated
  -> work is processed
  -> resource is released, retained, cached, or leaked
\`\`\`

Production questions:

- What grows with traffic?
- What grows with data size?
- What grows with number of tenants, teams, or services?
- What is bounded?
- What can leak?
- What needs cleanup?
- What metric proves the resource behavior is healthy?

For ${categoryTitle}, watch ${domain.metric}.

## Execution Behavior

Execution behavior describes what actually happens when the system runs.

Trace ${subtopicTitle} through:

- the happy path,
- invalid input,
- missing dependency,
- slow dependency,
- concurrent execution,
- retry after timeout,
- duplicate request or event,
- deploy with old and new versions running together,
- cleanup after failure.

Execution timeline:

\`\`\`text
Before
  -> required state and configuration exist
During
  -> core behavior runs and may touch dependencies
After
  -> result, side effects, and telemetry are visible
Failure
  -> caller receives error, retry, fallback, or compensation path
\`\`\`

The most important question is: what invariant must remain true even if the execution path is interrupted?

## Common Examples

### Example 1: Local Implementation

Use a local implementation when the behavior is simple, low-risk, and owned by one module or team.

\`\`\`${domain.codeBlock}
${code}
\`\`\`

### Example 2: Shared Abstraction

Move the behavior behind a shared abstraction when multiple teams repeat the same logic and the contract is stable.

\`\`\`text
Consumer
  -> stable interface
  -> shared implementation
  -> logs, metrics, tests, and ownership
\`\`\`

### Example 3: Platform or Managed Capability

Use a platform capability when correctness, scale, compliance, or operational cost is too important for every team to solve independently.

\`\`\`text
Product team
  -> platform API
  -> centrally owned reliability, security, and observability
\`\`\`

## Confusing Examples

### Confusion 1: The Name Sounds Simple

Many developers can define ${subtopicTitle}, but cannot trace its lifecycle or failure modes. Interviewers often move quickly from definition to edge cases.

### Confusion 2: Local Behavior Differs From Production

Local environments rarely reproduce production traffic, data shape, dependency latency, permissions, deploy overlap, or noisy neighbors.

### Confusion 3: The Happy Path Hides Ownership

If no one owns the failure path, monitoring, documentation, migration plan, or rollback process, the design is incomplete.

### Confusion 4: Optimization Before Measurement

Optimizing ${subtopicTitle} without baseline data can make the system harder to debug while failing to improve the real bottleneck.

## Production Use Cases

${subtopicTitle} appears in production anywhere ${categoryTitle} needs predictable behavior across real users, real traffic, real failures, and real team boundaries.

Used in:

- ${domain.production},
- payment and billing workflows,
- authentication and authorization flows,
- admin and internal platforms,
- realtime or async processing,
- reporting and analytics,
- compliance and audit trails,
- incident response and operational runbooks.

Production makes this harder because:

- inputs are messy,
- clients and services run different versions,
- dependencies degrade before they fail,
- retries multiply load,
- dashboards show symptoms before root cause,
- ownership is split across teams.

## Architecture Decisions

When designing around ${subtopicTitle}, compare multiple approaches.

| Approach | Use When | Trade-Off |
|---|---|---|
| Inline/local logic | Small scope, low risk, one owner | Fast to build, easier to duplicate |
| Shared library | Same logic repeated across modules | Versioning and rollout become important |
| Service/API boundary | Multiple consumers need stable behavior | Network, latency, and ownership overhead |
| Platform capability | High scale, compliance, or reliability needs | Requires platform maturity and governance |
| Managed service | Commodity capability with strong provider support | Less control, provider constraints |

Decision questions:

- What is the blast radius if this breaks?
- Who owns the contract?
- How often will it change?
- What must be observable?
- What happens during rollback?
- What is the simplest design that satisfies current correctness and scale?

## Interview Questions

1. What is ${subtopicTitle}, and why does it matter in ${categoryTitle}?
2. What problem does it solve inside ${topicTitle}?
3. How does it work internally?
4. What are the most common edge cases?
5. What failure modes appear only in production?
6. How would you implement a minimal version?
7. How would you test it?
8. How would you debug a production issue related to it?
9. What metrics or logs would you add?
10. How does the design change at 10x traffic, data, or team size?
11. What trade-offs exist between simple implementation and platform abstraction?
12. What senior-level mistake do engineers make with this topic?

## Senior-Level Pitfalls

### Pitfall 1: Treating It As Isolated Trivia

${subtopicTitle} is connected to runtime behavior, architecture, operations, and team ownership. A narrow definition is not enough.

### Pitfall 2: Ignoring Failure Semantics

A design that only explains success is not production-ready. Define timeout, retry, cancellation, idempotency, rollback, and cleanup behavior.

### Pitfall 3: Missing Observability

If the system cannot prove what happened, debugging becomes guesswork. Add logs, metrics, traces, and structured identifiers at decision points.

### Pitfall 4: Hidden Shared State

Shared state without clear ownership creates race conditions, stale reads, memory leaks, and cross-request contamination.

### Pitfall 5: Premature Abstraction

Abstracting too early can freeze weak assumptions. Wait until the repeated shape is stable, then extract a clear interface.

## Best Practices

- Start with a precise definition.
- Identify the owner and boundary.
- Make inputs, outputs, and invariants explicit.
- Prefer simple local design until the pressure for abstraction is real.
- Test normal, edge, and failure paths.
- Add observability before relying on the behavior in production.
- Keep resource usage bounded.
- Document assumptions and trade-offs.
- Design rollback and migration paths.
- Revisit the decision when scale, team count, or correctness requirements change.

## Debugging Scenarios

### Scenario 1: Works Locally, Fails In Production

Likely causes:

- different configuration,
- different data shape,
- missing permissions,
- dependency latency,
- concurrency,
- version mismatch.

Debugging steps:

1. Compare environment configuration.
2. Capture one failing input.
3. Trace the request or workflow end to end.
4. Check deploy, data, and dependency timelines.
5. Reproduce with production-like constraints.

### Scenario 2: Intermittent Failure

Likely causes:

- race condition,
- retry interaction,
- shared mutable state,
- timeout boundary,
- cache inconsistency,
- queue ordering.

Debugging steps:

1. Group failures by tenant, version, region, and dependency.
2. Inspect p95 and p99 instead of averages.
3. Add correlation IDs.
4. Check whether retries amplify the issue.
5. Verify cleanup and idempotency.

### Scenario 3: Performance Regression

Likely causes:

- unbounded work,
- inefficient query or algorithm,
- larger payload,
- cache miss pattern,
- excessive serialization,
- synchronous work on a critical path.

Debugging steps:

1. Establish baseline.
2. Profile the hot path.
3. Compare before and after deploy.
4. Measure resource saturation.
5. Optimize the proven bottleneck only.

### Scenario 4: Memory Or Resource Growth

Likely causes:

- retained references,
- unbounded queue,
- missing cleanup,
- long-lived subscriptions,
- growing cache,
- connection leak.

Debugging steps:

1. Capture heap, CPU, or resource profile.
2. Inspect retainers or open handles.
3. Confirm lifecycle cleanup.
4. Add bounds and eviction.
5. Verify recovery after load drops.

## Diagrams

Dedicated diagrams are available in [diagrams.md](./diagrams.md).

### Concept Flow

\`\`\`mermaid
flowchart TD
  A[Input or trigger] --> B[Validate assumptions]
  B --> C[Enter ${topicTitle} boundary]
  C --> D[Apply ${subtopicTitle}]
  D --> E[Read or change state]
  E --> F[Return result]
  F --> G[Emit telemetry]
\`\`\`

### Failure Flow

\`\`\`mermaid
flowchart TD
  A[Unexpected behavior] --> B{Input valid?}
  B -->|No| C[Fix validation or caller contract]
  B -->|Yes| D{State correct?}
  D -->|No| E[Inspect ownership, mutation, cache, or ordering]
  D -->|Yes| F{Dependency healthy?}
  F -->|No| G[Check timeout, retry, fallback, and saturation]
  F -->|Yes| H[Inspect implementation assumptions and edge cases]
\`\`\`

### Production Readiness Loop

\`\`\`text
Design
  -> implement
  -> test
  -> instrument
  -> deploy safely
  -> observe
  -> learn
  -> refine
\`\`\`

## Mini Exercises

### Exercise 1

Explain ${subtopicTitle} in your own words using three levels:

- beginner explanation,
- intermediate internal explanation,
- senior production explanation.

### Exercise 2

Draw the lifecycle for ${subtopicTitle}:

\`\`\`text
input -> decision -> state change -> output -> telemetry
\`\`\`

Mark where validation, failure handling, and cleanup happen.

### Exercise 3

Write one example where ${subtopicTitle} works correctly and one where it fails because of an edge case.

### Exercise 4

Create a debugging checklist for a production incident involving ${subtopicTitle}. Include logs, metrics, traces, and rollback options.

### Exercise 5

Compare two architecture choices for this topic and explain when each is better.

## Summary

${subtopicTitle} is a practical engineering topic, not just a vocabulary item. Mastery means you can define it, implement it, reason about internals, predict edge cases, debug failures, and explain trade-offs.

Remember:

- Start from first principles.
- Identify boundaries and ownership.
- Understand execution and resource behavior.
- Design for failure, not only success.
- Add observability.
- Keep the simplest design that satisfies correctness and scale.
- Revisit the design as production pressure changes.
`;
}

function diagramsFor({ categoryName, topicName, subtopicName }) {
  const categoryTitle = cleanCategoryName(categoryName);
  const topicTitle = cleanTopicName(topicName);
  const { heading, title: subtopicTitle } = cleanSubtopicName(subtopicName);
  const domain = domainFor(categoryTitle);
  const label = mermaidLabel(subtopicTitle);
  const topicLabel = mermaidLabel(topicTitle);
  const categoryLabel = mermaidLabel(categoryTitle);

  return `# Diagrams: ${heading}

Category: ${categoryTitle}

Topic: ${topicTitle}

Use these diagrams to understand ${subtopicTitle} visually: normal flow, internal lifecycle, memory/resource behavior, failure handling, debugging, optimization, and system design connections.

## 1. Concept Map

\`\`\`mermaid
flowchart TD
  A["${categoryLabel}"] --> B["${topicLabel}"]
  B --> C["${label}"]
  C --> D["Definition"]
  C --> E["Internal Working"]
  C --> F["Production Usage"]
  C --> G["Failure Modes"]
  C --> H["Interview Depth"]
\`\`\`

How to read it:

- The category gives the broad engineering domain.
- The topic gives the learning boundary.
- The subtopic is the smallest unit you must explain deeply.
- Mastery requires definition, internals, production behavior, failures, and interview reasoning.

## 2. Learning Flow

\`\`\`mermaid
flowchart LR
  A["Definition"] --> B["Why It Exists"]
  B --> C["Syntax or Interface"]
  C --> D["Internal Working"]
  D --> E["Memory Behavior"]
  E --> F["Execution Behavior"]
  F --> G["Production Use"]
  G --> H["Debugging"]
  H --> I["Architecture Decisions"]
  I --> J["Interview Readiness"]
\`\`\`

Use this order when studying. Do not jump to architecture trade-offs before you can explain the mechanics.

## 3. Internal Lifecycle

\`\`\`mermaid
flowchart TD
  A["Input or Trigger"] --> B["Validate Assumptions"]
  B --> C["Enter ${topicLabel} Boundary"]
  C --> D["Apply ${label} Rules"]
  D --> E["Read or Change State"]
  E --> F["Handle Success or Failure"]
  F --> G["Emit Logs, Metrics, Traces"]
  G --> H["Return Result or Continue Workflow"]
\`\`\`

Lifecycle questions:

- What starts this behavior?
- What state must already exist?
- What invariant must remain true?
- What is observable after completion?
- What cleanup is required if execution fails halfway?

## 4. Memory And Resource Model

\`\`\`text
Work enters ${subtopicTitle}
  -> memory, CPU, network, storage, or attention is allocated
  -> core behavior executes
  -> data may be copied, retained, cached, queued, or persisted
  -> resource is released, reused, bounded, or leaked
\`\`\`

For ${categoryTitle}, pay special attention to:

- ${domain.metric},
- ownership of mutable state,
- lifecycle of retained references,
- bounded vs unbounded work,
- cleanup after cancellation, timeout, or failed deploy.

## 5. Execution Timeline

\`\`\`mermaid
sequenceDiagram
  participant Caller
  participant Boundary
  participant Core as ${label}
  participant State
  participant Telemetry

  Caller->>Boundary: send input / trigger
  Boundary->>Boundary: validate contract
  Boundary->>Core: execute behavior
  Core->>State: read or update state
  State-->>Core: return state result
  Core->>Telemetry: emit signal
  Core-->>Caller: return output or error
\`\`\`

Trace this sequence for happy path, invalid input, slow dependency, retry, duplicate work, and partial failure.

## 6. Failure Decision Tree

\`\`\`mermaid
flowchart TD
  A["Unexpected Behavior"] --> B{"Input Valid?"}
  B -->|No| C["Fix Caller Contract or Validation"]
  B -->|Yes| D{"State Correct?"}
  D -->|No| E["Inspect Ownership, Mutation, Cache, Ordering"]
  D -->|Yes| F{"Dependency Healthy?"}
  F -->|No| G["Check Timeout, Retry, Fallback, Saturation"]
  F -->|Yes| H{"Resource Pressure?"}
  H -->|Yes| I["Profile CPU, Memory, I/O, Queue, Bundle, Query"]
  H -->|No| J["Inspect Edge Cases and Hidden Assumptions"]
\`\`\`

Use this when debugging. It keeps you from blaming the nearest stack trace before checking contracts, state, dependencies, and resource pressure.

## 7. Production Readiness Loop

\`\`\`mermaid
flowchart LR
  A["Design"] --> B["Implement"]
  B --> C["Test"]
  C --> D["Instrument"]
  D --> E["Deploy Safely"]
  E --> F["Observe"]
  F --> G["Learn"]
  G --> H["Refine"]
  H --> A
\`\`\`

Production-ready understanding means the topic can survive messy input, concurrency, retries, deploy overlap, degraded dependencies, and human operation during incidents.

## 8. Optimization Loop

\`\`\`mermaid
flowchart TD
  A["Measure Baseline"] --> B{"Bottleneck Proven?"}
  B -->|No| C["Add Better Instrumentation"]
  C --> A
  B -->|Yes| D["Remove Unnecessary Work"]
  D --> E["Bound Expensive Paths"]
  E --> F["Cache, Batch, Stream, or Defer"]
  F --> G["Re-measure p95 / p99 / Cost"]
  G --> H{"Trade-off Acceptable?"}
  H -->|No| I["Revert or Simplify"]
  H -->|Yes| J["Document Decision"]
\`\`\`

Do not optimize ${subtopicTitle} by intuition alone. Optimize only after measurement identifies the constraint.

## 9. Architecture Decision Map

\`\`\`mermaid
flowchart TD
  A["Need ${label}"] --> B{"Scope Small?"}
  B -->|Yes| C["Local Implementation"]
  B -->|No| D{"Repeated Across Teams?"}
  D -->|Yes| E["Shared Library or Pattern"]
  D -->|No| F{"Needs Independent Scaling?"}
  F -->|Yes| G["Service or Platform Boundary"]
  F -->|No| H["Keep Close to Owner"]
  E --> I["Versioning and Ownership"]
  G --> J["SLOs, Observability, Rollback"]
  H --> K["Simple, Explicit, Tested"]
\`\`\`

The right architecture depends on blast radius, ownership, scale, change frequency, and operational maturity.

## 10. Interview Answer Flow

\`\`\`text
Define
  -> explain why it exists
  -> describe internal working
  -> show code or concrete example
  -> name edge cases
  -> discuss production failures
  -> explain debugging strategy
  -> compare architecture trade-offs
  -> summarize best practices
\`\`\`

Strong answers move from mechanics to judgment. Weak answers stop at definitions.

## 11. Staff Engineer Review Diagram

\`\`\`mermaid
flowchart TD
  A["Proposal Uses ${label}"] --> B{"Clear Owner?"}
  B -->|No| C["Define Ownership"]
  B -->|Yes| D{"Failure Path Designed?"}
  D -->|No| E["Add Timeout, Retry, Rollback, Cleanup"]
  D -->|Yes| F{"Observable?"}
  F -->|No| G["Add Logs, Metrics, Traces"]
  F -->|Yes| H{"Scale Assumption Known?"}
  H -->|No| I["Define Capacity and Growth Model"]
  H -->|Yes| J["Ready for Review"]
\`\`\`

Use this in architecture review to move beyond code correctness into operational excellence.

## 12. Revision Checklist

\`\`\`text
[ ] I can define ${subtopicTitle}.
[ ] I can explain why it exists.
[ ] I can draw the internal flow.
[ ] I can describe memory/resource behavior.
[ ] I can trace execution behavior.
[ ] I can name edge cases and production failures.
[ ] I can debug it using logs, metrics, and traces.
[ ] I can compare architecture alternatives.
[ ] I can answer interview follow-ups.
\`\`\`
`;
}

async function isDirectory(fullPath) {
  try {
    const entries = await readdir(fullPath, { withFileTypes: true });
    return entries.length >= 0;
  } catch {
    return false;
  }
}

async function collectSubtopicReadmes() {
  const readmes = [];
  const categories = await readdir(rootDir, { withFileTypes: true });

  for (const category of categories) {
    if (!category.isDirectory() || skipTopLevel.has(category.name) || category.name.startsWith(".")) {
      continue;
    }

    const categoryPath = path.join(rootDir, category.name);
    const topics = await readdir(categoryPath, { withFileTypes: true }).catch(() => []);

    for (const topic of topics) {
      if (!topic.isDirectory() || topic.name.startsWith(".")) {
        continue;
      }

      const topicPath = path.join(categoryPath, topic.name);
      const subtopics = await readdir(topicPath, { withFileTypes: true }).catch(() => []);

      for (const subtopic of subtopics) {
        if (!subtopic.isDirectory() || subtopic.name.startsWith(".")) {
          continue;
        }

        const subtopicPath = path.join(category.name, topic.name, subtopic.name);
        const readmePath = path.join(subtopicPath, "README.md");
        const fullReadmePath = path.join(rootDir, readmePath);

        if (await isDirectory(path.dirname(fullReadmePath))) {
          readmes.push({
            subtopicPath,
            relativePath: readmePath,
            fullPath: fullReadmePath,
            categoryName: category.name,
            topicName: topic.name,
            subtopicName: subtopic.name,
          });
        }
      }
    }
  }

  return readmes;
}

async function main() {
  const readmes = await collectSubtopicReadmes();
  let readmesWritten = 0;
  let readmesPreserved = 0;
  let diagramsWritten = 0;
  let diagramsPreserved = 0;

  for (const readme of readmes) {
    if (preservedReadmes.has(readme.relativePath)) {
      readmesPreserved += 1;
    } else {
      const next = readmeFor(readme);
      const current = await readFile(readme.fullPath, "utf8").catch(() => "");

      if (current !== next) {
        await writeFile(readme.fullPath, next);
        readmesWritten += 1;
      }
    }

    const diagramPath = path.join(readme.subtopicPath, "diagrams.md");
    const fullDiagramPath = path.join(rootDir, diagramPath);

    if (preservedDiagrams.has(diagramPath)) {
      diagramsPreserved += 1;
      continue;
    }

    const nextDiagram = diagramsFor(readme);
    const currentDiagram = await readFile(fullDiagramPath, "utf8").catch(() => "");

    if (currentDiagram !== nextDiagram) {
      await writeFile(fullDiagramPath, nextDiagram);
      diagramsWritten += 1;
    }
  }

  console.log(`Discovered ${readmes.length} subtopic README files.`);
  console.log(`Updated ${readmesWritten} README files.`);
  console.log(`Preserved ${readmesPreserved} hand-authored README file.`);
  console.log(`Updated ${diagramsWritten} diagram files.`);
  console.log(`Preserved ${diagramsPreserved} hand-authored diagram file.`);
}

await main();
