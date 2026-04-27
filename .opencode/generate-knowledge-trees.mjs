import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const directories = readdirSync(root)
  .filter((name) => /^\d+\.\s/.test(name) && statSync(join(root, name)).isDirectory())
  .sort((a, b) => Number(a.match(/^\d+/)[0]) - Number(b.match(/^\d+/)[0]));

const extraDirectories = [
  "Production Readiness",
  "Operational Excellence",
  "Resilience Patterns",
  "Failure Handling",
  "Backpressure",
  "Memory Leaks",
  "Concurrency",
  "Race Conditions",
  "Load Testing",
  "Capacity Planning",
  "Cost Optimization",
  "Compliance Basics",
  "Data Privacy",
  "Threat Modeling",
  "Architecture Governance",
];

const displayNames = new Map([
  ["HTML-CSS Core", "HTML/CSS Core"],
  ["WebSocket - Realtime Systems", "WebSocket / Realtime Systems"],
  ["Kafka - RabbitMQ", "Kafka / RabbitMQ"],
  ["CI-CD", "CI/CD"],
  ["Webpack - Vite - Nx", "Webpack / Vite / Nx"],
  ["SSR - CSR - SSG - Hydration", "SSR / CSR / SSG / Hydration"],
  ["Payment - Notification - Search Systems", "Payment / Notification / Search Systems"],
  ["LLM - AI Tools", "LLM / AI Tools"],
  ["GitHub Copilot - Cursor - Claude - ChatGPT", "GitHub Copilot / Cursor / Claude / ChatGPT"],
  ["Agile - Scrum - Delivery", "Agile / Scrum / Delivery"],
  ["Staff-Principal Engineer Mindset", "Staff/Principal Engineer Mindset"],
]);

const profileRules = [
  {
    test: /JavaScript Core/i,
    topics: [
      ["Language Fundamentals", ["Values and Types", "Scope, Closures, and Hoisting", "Prototypes and Object Model"]],
      ["Execution Model", ["Call Stack", "Event Loop and Tasks", "Promises and Async/Await"]],
      ["Advanced Runtime Behavior", ["Equality and Coercion", "Memory and Garbage Collection", "Modules and Bundling Boundaries"]],
      ["Production JavaScript", ["Error Handling", "Performance Profiling", "Maintainability at Scale"]],
    ],
  },
  {
    test: /JavaScript Internals/i,
    topics: [
      ["Engine Architecture", ["Parsing and AST", "Bytecode and JIT", "Inline Caches and Hidden Classes"]],
      ["Runtime Semantics", ["Execution Contexts", "Lexical Environments", "Microtasks and Macrotasks"]],
      ["Memory Internals", ["Heap Layout", "Garbage Collection", "Leaks and Retainers"]],
      ["Optimization Boundaries", ["Deoptimization", "Shape Changes", "Benchmarking Pitfalls"]],
    ],
  },
  {
    test: /TypeScript/i,
    topics: [
      ["Type System Foundations", ["Structural Typing", "Narrowing and Control Flow", "Generics and Constraints"]],
      ["Advanced Types", ["Conditional Types", "Mapped and Template Literal Types", "Variance and Inference"]],
      ["Application Architecture", ["API Contracts", "Domain Modeling", "Monorepo Type Boundaries"]],
      ["Compiler and Tooling", ["tsconfig Strategy", "Declaration Files", "Build Performance"]],
    ],
  },
  {
    test: /Angular/i,
    topics: [
      ["Angular Architecture", ["Modules and Standalone Components", "Dependency Injection", "Routing and Lazy Loading"]],
      ["Rendering and Reactivity", ["Change Detection", "Signals and RxJS", "Template Performance"]],
      ["State and Forms", ["Reactive Forms", "Component State", "Global State Patterns"]],
      ["Production Angular", ["Testing Strategy", "Bundle Optimization", "Enterprise Maintainability"]],
    ],
  },
  {
    test: /React/i,
    topics: [
      ["React Mental Model", ["Components and Props", "State and Effects", "Rendering and Reconciliation"]],
      ["Advanced React", ["Concurrent Rendering", "Suspense and Data Fetching", "Hooks Internals"]],
      ["Frontend Architecture", ["Component Boundaries", "State Placement", "Server Components and Hydration"]],
      ["Production React", ["Performance Profiling", "Testing Strategy", "Design System Integration"]],
    ],
  },
  {
    test: /Node\.js/i,
    topics: [
      ["Node Runtime", ["Event Loop", "Streams and Buffers", "Worker Threads and Clustering"]],
      ["Backend Engineering", ["HTTP Servers", "Async Error Handling", "Configuration and Secrets"]],
      ["Production Node", ["Memory Leaks", "CPU Profiling", "Graceful Shutdown"]],
      ["Service Architecture", ["API Boundaries", "Background Work", "Observability"]],
    ],
  },
  {
    test: /NestJS/i,
    topics: [
      ["Nest Architecture", ["Modules and Providers", "Dependency Injection", "Controllers and Pipes"]],
      ["Request Lifecycle", ["Guards", "Interceptors", "Filters"]],
      ["Backend Patterns", ["CQRS", "Event Emitters", "Database Integration"]],
      ["Production NestJS", ["Testing Modules", "Performance", "Operational Hardening"]],
    ],
  },
  {
    test: /Express/i,
    topics: [
      ["Express Fundamentals", ["Middleware Chain", "Routing", "Request and Response Objects"]],
      ["API Engineering", ["Validation", "Error Handling", "Versioning"]],
      ["Security and Reliability", ["Auth Middleware", "Rate Limiting", "Input Sanitization"]],
      ["Production Express", ["Process Lifecycle", "Observability", "Performance Tuning"]],
    ],
  },
  {
    test: /Browser Fundamentals/i,
    topics: [
      ["Browser Architecture", ["Processes and Threads", "Navigation Pipeline", "Rendering Engine"]],
      ["Web Platform APIs", ["DOM and Events", "Storage APIs", "Network APIs"]],
      ["Rendering Pipeline", ["Style Calculation", "Layout and Paint", "Compositing"]],
      ["Production Browser Issues", ["Compatibility", "Memory Pressure", "Performance Debugging"]],
    ],
  },
  {
    test: /HTML\/CSS|HTML-CSS/i,
    topics: [
      ["HTML Foundations", ["Semantic Markup", "Forms", "Document Metadata"]],
      ["CSS Architecture", ["Cascade and Specificity", "Layout Systems", "Responsive Design"]],
      ["Rendering and Accessibility", ["Accessible Names", "Focus Management", "Visual Stability"]],
      ["Production Styling", ["Design Tokens", "CSS Performance", "Maintainability"]],
    ],
  },
  {
    test: /Performance|Scalability|Reliability|Caching|Redis|Rate Limiting|Observability|Logging|Monitoring|Tracing/i,
    topics: [
      ["Foundations", ["Metrics and SLIs", "Latency and Throughput", "Capacity Limits"]],
      ["Runtime Behavior", ["Bottlenecks", "Resource Contention", "Backpressure"]],
      ["Production Operations", ["Alerting", "Incident Diagnosis", "Safe Rollouts"]],
      ["Optimization Strategy", ["Profiling", "Load Testing", "Cost and Complexity Trade-offs"]],
    ],
  },
  {
    test: /Production Readiness|Operational Excellence|Resilience Patterns|Failure Handling|Backpressure|Memory Leaks|Concurrency|Race Conditions|Load Testing|Capacity Planning|Cost Optimization/i,
    topics: [
      ["Readiness Foundations", ["Service Health", "Operational Ownership", "Release Safety"]],
      ["Failure and Resilience", ["Failure Modes", "Graceful Degradation", "Recovery Patterns"]],
      ["Runtime Pressure", ["Resource Saturation", "Concurrency Limits", "Backpressure Signals"]],
      ["Operational Strategy", ["Load Validation", "Capacity Forecasting", "Cost and Reliability Trade-offs"]],
    ],
  },
  {
    test: /Security|OWASP|Authentication|Authorization/i,
    topics: [
      ["Security Foundations", ["Threat Modeling", "Trust Boundaries", "Defense in Depth"]],
      ["Identity and Access", ["Authentication Flows", "Authorization Models", "Session and Token Security"]],
      ["Application Security", ["Input Validation", "Injection and XSS", "Secrets and Configuration"]],
      ["Production Security", ["Detection", "Incident Response", "Compliance and Auditability"]],
    ],
  },
  {
    test: /Compliance Basics|Data Privacy|Threat Modeling|Architecture Governance/i,
    topics: [
      ["Governance Foundations", ["Policies and Standards", "Risk Classification", "Ownership Model"]],
      ["Security and Privacy Design", ["Threat Modeling", "Data Classification", "Access Controls"]],
      ["Auditability", ["Evidence Collection", "Change Tracking", "Exception Handling"]],
      ["Production Governance", ["Architecture Reviews", "Compliance Drift", "Continuous Control Monitoring"]],
    ],
  },
  {
    test: /System Design|Distributed|Microservices|Event-Driven|Kafka|RabbitMQ|Queue|Background Jobs|CQRS|Event Sourcing|API Gateway|BFF|Multi-Tenant|SaaS/i,
    topics: [
      ["System Fundamentals", ["Requirements and Constraints", "Data Flow", "Service Boundaries"]],
      ["Distributed Behavior", ["Consistency", "Replication", "Failure Modes"]],
      ["Communication Patterns", ["Synchronous APIs", "Asynchronous Messaging", "Event Contracts"]],
      ["Production Architecture", ["Scalability", "Resilience", "Operability"]],
    ],
  },
  {
    test: /Database|SQL|NoSQL|Indexing|Transactions|Data Modeling/i,
    topics: [
      ["Data Modeling", ["Entities and Relationships", "Access Patterns", "Normalization and Denormalization"]],
      ["Query Execution", ["Indexes", "Query Plans", "Locking and Isolation"]],
      ["Distributed Data", ["Replication", "Sharding", "Consistency Trade-offs"]],
      ["Production Data", ["Migrations", "Backups", "Performance Debugging"]],
    ],
  },
  {
    test: /DSA|LLD|OOP|Functional|Design Patterns|Architecture Patterns|Clean Architecture|SOLID/i,
    topics: [
      ["Core Principles", ["Abstraction", "Encapsulation", "Composition"]],
      ["Design Techniques", ["Modeling", "Pattern Selection", "Dependency Management"]],
      ["Correctness and Complexity", ["Time and Space Complexity", "Invariants", "Edge Cases"]],
      ["Production Design", ["Maintainability", "Extensibility", "Refactoring Safety"]],
    ],
  },
  {
    test: /Cloud|DevOps|Docker|Kubernetes|CI\/CD|Infrastructure|Build Tools|Package|Monorepo|Webpack|Vite|Nx/i,
    topics: [
      ["Platform Foundations", ["Runtime Packaging", "Environment Strategy", "Dependency Boundaries"]],
      ["Delivery Pipeline", ["Builds", "Testing Gates", "Deployment Strategies"]],
      ["Cloud Operations", ["Networking", "Scaling", "Cost Control"]],
      ["Production Platform", ["Reliability", "Security", "Developer Experience"]],
    ],
  },
  {
    test: /Testing|Unit|Integration|E2E|Contract/i,
    topics: [
      ["Testing Strategy", ["Test Pyramid", "Risk-Based Coverage", "Test Data"]],
      ["Test Design", ["Mocks and Fakes", "Boundaries", "Determinism"]],
      ["Automation", ["CI Integration", "Flaky Test Control", "Parallelization"]],
      ["Production Confidence", ["Regression Detection", "Contract Safety", "Release Gates"]],
    ],
  },
  {
    test: /AI|LLM|Prompt|RAG|Agentic|Copilot|Cursor|Claude|ChatGPT/i,
    topics: [
      ["AI Engineering Foundations", ["Model Capabilities", "Context Windows", "Evaluation"]],
      ["Prompt and Workflow Design", ["Instruction Hierarchy", "Tool Use", "Human Review"]],
      ["RAG and Agents", ["Retrieval", "Grounding", "Planning and Execution"]],
      ["Production AI Use", ["Safety", "Cost and Latency", "Quality Control"]],
    ],
  },
  {
    test: /Leadership|Mentoring|Decision|Review|Stakeholder|Estimation|Agile|Hiring|Documentation|RFC|Trade-off|Collaboration|Productivity|Staff/i,
    topics: [
      ["Technical Leadership", ["Problem Framing", "Decision Making", "Influence Without Authority"]],
      ["Execution Systems", ["Planning", "Risk Management", "Delivery Cadence"]],
      ["Communication", ["RFCs", "Stakeholder Alignment", "Trade-off Narratives"]],
      ["Org-Level Engineering", ["Mentorship", "Hiring Bar", "Engineering Productivity"]],
    ],
  },
];

const defaultTopics = [
  ["Foundations", ["Definitions", "Core Principles", "Conceptual Model"]],
  ["Deep Mechanics", ["Internal Flow", "Edge Cases", "Failure Modes"]],
  ["Production Usage", ["Real Systems", "Operational Concerns", "Scaling Constraints"]],
  ["Engineering Decisions", ["Trade-offs", "Debugging", "Optimization"]],
];

function categoryName(directory) {
  const safeCategoryName = directory.replace(/^\d+\.\s*/, "");
  return displayNames.get(safeCategoryName) ?? safeCategoryName;
}

function topicsFor(name) {
  return (profileRules.find((rule) => rule.test.test(name))?.topics ?? defaultTopics);
}

function slugText(text) {
  return text
    .replace(/&/g, "and")
    .replace(/\//g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeName(text) {
  return text
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function paddedId(value) {
  const parts = String(value).split(".");
  return parts
    .map((part, index) => String(part).padStart(parts.length > 1 && index === 0 ? 3 : 2, "0"))
    .join(".");
}

function numberedName(number, name) {
  return `${paddedId(number)} ${safeName(name)}`;
}

function categoryFolderName(number, name) {
  return `${String(number).padStart(3, "0")}. ${safeName(name)}`;
}

function prefixedName(prefix, number, name) {
  return prefix ? `${prefix}.${padNumber(number)} ${safeName(name)}` : numberedName(number, name);
}

function subtopicBlock(category, categoryNumber, topicNumber, subtopicNumber, topicName, subtopicName) {
  const id = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}.${subtopicNumber}`) : paddedId(`${topicNumber}.${subtopicNumber}`);
  return `### ${id} ${subtopicName}

#### 🔹 Core Concepts
- Definition: Understand ${subtopicName} as it applies to ${category}, including the problem it solves and the boundary it owns.
- Internal working: Trace the flow from input to processing to output, naming the state transitions, contracts, and dependencies involved.
- Key principles: Prefer explicit contracts, measurable behavior, isolated responsibilities, and designs that degrade predictably under stress.

#### 🔹 Deep Concepts
- Hidden behaviors: Watch for implicit defaults, lifecycle timing, ordering guarantees, cache state, retries, and framework/runtime abstractions that hide real cost.
- Edge cases: Empty input, duplicate input, partial failure, timeout, cancellation, race conditions, version mismatch, clock skew, and inconsistent downstream state.
- Internal mechanisms: Identify queues, buffers, schedulers, execution contexts, network boundaries, storage paths, locks, indexes, or render phases behind the abstraction.
- Performance implications: Measure latency, throughput, memory, CPU, I/O, bundle size, query cost, and tail behavior instead of trusting average-case intuition.

#### 🔹 Code-Level Understanding
- Example: Implement a small ${category} scenario where ${subtopicName} has a visible contract, typed inputs, explicit error handling, and test coverage.
- Anti-patterns: Leaky abstraction, over-broad shared state, hidden global configuration, unbounded retries, missing cancellation, and logging without correlation IDs.
- Best practices: Keep interfaces narrow, validate at boundaries, model failures explicitly, add observability at decision points, and make behavior reproducible in tests.

#### 🔹 Real-World Usage
- Where used in production: ${subtopicName} appears in systems that need predictable behavior across deploys, teams, and traffic patterns.
- Example systems: Payments, chat, SaaS workspaces, dashboards, notification systems, search, audit trails, developer platforms, and internal admin tools.

#### 🔹 Architecture Decisions
- Multiple approaches: Compare simple in-process handling, framework-provided primitives, external managed services, and custom infrastructure.
- Trade-offs: Balance correctness, latency, cost, operational burden, team familiarity, release risk, and long-term maintainability.
- When to use what: Use the simplest option that satisfies current scale and correctness needs, then move complexity behind stable interfaces when pressure is proven.

#### 🔹 Interview Focus
- Common questions: Explain ${subtopicName}, describe how it works internally, and show how you would implement or operate it in ${category}.
- Tricky scenarios: Debug intermittent failures, high tail latency, duplicated work, stale data, memory growth, or behavior that changes only under load.
- Follow-up depth: Be ready to discuss instrumentation, rollback plans, migration strategy, data consistency, and how the design changes at 10x scale.

#### 🔹 Internal Flow Diagram
\`\`\`text
Input / trigger
  -> boundary validation
  -> ${topicName} decision point
  -> ${subtopicName} execution path
  -> side effects / state change
  -> observable result
  -> retry, rollback, or compensation if needed
\`\`\`

#### 🔹 Failure Scenarios
- Dependency timeout or unavailable downstream service.
- Invalid, duplicated, stale, or out-of-order input.
- Configuration drift between environments.
- Resource exhaustion: CPU, memory, network, database connections, queue depth, or browser main-thread time.
- Partial success where one side effect commits and another fails.

#### 🔹 Debugging Strategies
- Reproduce with minimal inputs, then add concurrency, load, and failure injection.
- Inspect logs, traces, metrics, heap snapshots, profiles, network captures, query plans, or rendered output depending on the layer.
- Verify assumptions about ordering, ownership, retries, idempotency, caching, and lifecycle timing.
- Compare healthy and unhealthy paths using correlation IDs and timestamps.

#### 🔹 Optimization Techniques
- Remove unnecessary work before adding infrastructure.
- Batch, cache, debounce, stream, paginate, lazy-load, or precompute only where measurements show pressure.
- Add backpressure, timeouts, circuit breakers, and bounded queues around expensive paths.
- Optimize for p95/p99 behavior, not just happy-path averages.
`;
}

function readmeFor(category, categoryNumber = null) {
  const topics = topicsFor(category);
  const body = topics
    .map(([topicName, subtopics], topicIndex) => {
      const topicNumber = topicIndex + 1;
      const blocks = subtopics
        .map((subtopicName, subtopicIndex) =>
          subtopicBlock(category, categoryNumber, topicNumber, subtopicIndex + 1, topicName, subtopicName),
        )
        .join("\n---\n\n");

      const id = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}`) : paddedId(topicNumber);
      return `## ${id} ${slugText(topicName)}

${blocks}`;
    })
    .join("\n---\n\n");

  return `# 📚 CATEGORY: ${category}

${body}

---

## 🚀 Hidden Advanced Topics (Senior Level)

- Production-only failure modes: retries that amplify outages, cache stampedes, slow memory leaks, dependency brownouts, noisy-neighbor effects, and hidden coupling between release trains.
- Scaling issues most teams discover late: p99 latency, queue backlog growth, lock contention, hydration or rendering bottlenecks, oversized payloads, schema evolution, and observability cardinality explosions.
- Senior-level concerns: migration safety, backward compatibility, ownership boundaries, cost visibility, compliance constraints, graceful degradation, and operability during incidents.
- Advanced design pressure: deciding when to split responsibilities, when to centralize platform capability, and when local duplication is cheaper than shared abstraction.
- Production readiness: runbooks, dashboards, SLOs, alert thresholds, rollback paths, feature flags, capacity plans, and failure drills.

## 🧠 Mental Models

- Start from first principles: What invariant must hold, what can fail, who owns the state, and what must be observable?
- Think in boundaries: API boundary, runtime boundary, team boundary, data boundary, trust boundary, and deployment boundary.
- Separate correctness from performance: first prove behavior, then measure cost, then optimize the bottleneck.
- Prefer explicit trade-offs: latency vs consistency, flexibility vs simplicity, autonomy vs standardization, speed vs safety, and cost vs resilience.
- Design for change: stable contracts, reversible decisions, incremental migrations, and small blast radius.

## ⚠️ Common Mistakes

- Beginner mistakes: memorizing definitions without tracing real execution, ignoring edge cases, and relying on defaults without understanding them.
- Intermediate mistakes: over-engineering too early, hiding failures behind generic catch blocks, under-testing boundaries, and treating logs as observability.
- Senior-level blind spots: creating shared abstractions without ownership, optimizing local performance while harming system behavior, missing migration risk, and ignoring operational cost.
- Interview mistakes: answering only the happy path, skipping trade-offs, failing to discuss scale, and not explaining how to debug production incidents.
- Production mistakes: missing timeouts, missing idempotency, no rollback path, no load testing, weak dashboards, and unclear ownership during incidents.

## 🧩 System Design Mapping

- System Design: Use this category to reason about requirements, constraints, interfaces, state, consistency, failure handling, and operational readiness.
- Microservices: Map responsibilities to service boundaries, contracts, deployment ownership, observability, and independent scaling needs.
- Performance: Identify hot paths, remove unnecessary work, define budgets, measure tail latency, and profile before optimizing.
- Scalability: Plan for horizontal growth, bounded queues, partitioning, caching, backpressure, and graceful degradation.
- Security: Apply least privilege, validate boundaries, protect secrets, audit sensitive actions, and assume dependencies can be compromised.
- Reliability: Define SLOs, expose health signals, test failure modes, and prepare rollback or compensation paths before incidents.
`;
}

function topicReadmeFor(category, categoryNumber, topicNumber, topicName, subtopics) {
  const topicId = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}`) : paddedId(topicNumber);
  const links = subtopics
    .map((subtopicName, index) => {
      const id = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}.${index + 1}`) : paddedId(`${topicNumber}.${index + 1}`);
      return `- [${id} ${subtopicName}](./${numberedName(id, subtopicName)}/README.md)`;
    })
    .join("\n");

  return `# ${topicId} ${topicName}

Category: ${category}

## Subtopics

${links}

## Study Checklist

- Explain the topic from first principles.
- Trace the internal flow without hand-waving.
- Name edge cases, failure modes, and scaling limits.
- Show code-level understanding where applicable.
- Connect the topic to system design and production operations.
`;
}

function subtopicReadmeFor(category, categoryNumber, topicNumber, subtopicNumber, topicName, subtopicName) {
  const id = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}.${subtopicNumber}`) : paddedId(`${topicNumber}.${subtopicNumber}`);
  return `# ${id} ${subtopicName}

Category: ${category}

Topic: ${topicName}

## Files

- [Core Concepts](./core-concepts.md)
- [Deep Concepts](./deep-concepts.md)
- [Code-Level Understanding](./code-level-understanding.md)
- [Real-World Usage](./real-world-usage.md)
- [Architecture Decisions](./architecture-decisions.md)
- [Interview Focus](./interview-focus.md)
- [Internal Flow](./internal-flow.md)
- [Failure Scenarios](./failure-scenarios.md)
- [Debugging Strategies](./debugging-strategies.md)
- [Optimization Techniques](./optimization-techniques.md)

## Outcome

Use this folder to build interview-ready depth for ${subtopicName}: definition, internals, implementation, production behavior, debugging, and trade-offs.
`;
}

function subtopicFiles(category, topicName, subtopicName) {
  return new Map([
    [
      "core-concepts.md",
      `# Core Concepts: ${subtopicName}

## Definition

Describe what ${subtopicName} means in ${category}, what problem it solves, and what boundary it owns.

## Internal Working

- Input enters through an explicit boundary.
- Validation and normalization happen before state changes.
- The ${topicName} layer decides which path should execute.
- Side effects are isolated, observed, and made retry-safe where possible.

## Key Principles

- Make contracts explicit.
- Keep ownership clear.
- Prefer predictable degradation over hidden failure.
- Design for testability and observability from the start.
`,
    ],
    [
      "deep-concepts.md",
      `# Deep Concepts: ${subtopicName}

## Hidden Behaviors

- Framework defaults that change lifecycle, ordering, caching, retries, or error propagation.
- Runtime behavior that only appears under concurrency, load, large input, or slow dependencies.
- State that survives longer than expected through closures, caches, sessions, queues, or retained references.

## Edge Cases

- Empty, null, duplicated, stale, malformed, or out-of-order input.
- Partial success after one side effect commits and another fails.
- Timeout, cancellation, retry, and race-condition paths.
- Version mismatch between clients, services, schemas, or packages.

## Internal Mechanisms

Identify the queues, buffers, schedulers, locks, indexes, render phases, network hops, or persistence paths behind the abstraction.

## Performance Implications

Measure latency, throughput, memory, CPU, I/O, payload size, bundle size, query cost, and p95/p99 behavior.
`,
    ],
    [
      "code-level-understanding.md",
      `# Code-Level Understanding: ${subtopicName}

## Example Exercise

Build a small ${category} example that demonstrates ${subtopicName} with:

- Typed inputs and outputs.
- Boundary validation.
- Explicit error paths.
- Tests for happy path and edge cases.
- Observability at important decisions.

## Anti-Patterns

- Hidden global state.
- Unbounded retries or queues.
- Catch-all error handling with no recovery plan.
- Over-broad abstractions.
- Missing cancellation, timeout, or cleanup logic.

## Best Practices

- Keep interfaces narrow.
- Validate data at system boundaries.
- Model failure as part of the design.
- Add tests around contracts and invariants.
- Prefer clear code over clever code.
`,
    ],
    [
      "real-world-usage.md",
      `# Real-World Usage: ${subtopicName}

## Production Uses

${subtopicName} matters anywhere ${category} needs predictable behavior across teams, releases, traffic spikes, and dependency failures.

## Example Systems

- Payment workflows.
- Chat and realtime collaboration.
- SaaS tenant workspaces.
- Admin dashboards.
- Notification pipelines.
- Search and discovery.
- Audit and compliance systems.
- Developer platforms.

## Production Questions

- Who owns the data and behavior?
- What happens during partial failure?
- How is the path observed and alerted?
- How does this change at 10x traffic or 10x data?
`,
    ],
    [
      "architecture-decisions.md",
      `# Architecture Decisions: ${subtopicName}

## Approaches

- Simple in-process implementation.
- Framework-provided primitive.
- Shared internal platform capability.
- External managed service.
- Custom infrastructure for specialized scale or correctness needs.

## Trade-Offs

- Correctness vs latency.
- Simplicity vs flexibility.
- Team autonomy vs platform standardization.
- Build cost vs operational cost.
- Consistency vs availability.

## Decision Rule

Use the simplest approach that satisfies current correctness and scale needs. Move complexity behind stable interfaces only when pressure is proven by production evidence.
`,
    ],
    [
      "interview-focus.md",
      `# Interview Focus: ${subtopicName}

## Common Questions

- What is ${subtopicName}, and why does it matter?
- How does it work internally?
- How would you implement it in ${category}?
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
`,
    ],
    [
      "internal-flow.md",
      `# Internal Flow: ${subtopicName}

\`\`\`text
Input / trigger
  -> boundary validation
  -> ${topicName} decision point
  -> ${subtopicName} execution path
  -> side effects / state change
  -> observable result
  -> retry, rollback, or compensation if needed
\`\`\`

## Flow Questions

- What is the first trusted boundary?
- What state is read or written?
- Which operations are synchronous vs asynchronous?
- Which side effects must be idempotent?
- Where should logs, metrics, and traces be emitted?
`,
    ],
    [
      "failure-scenarios.md",
      `# Failure Scenarios: ${subtopicName}

## Common Failures

- Dependency timeout or unavailable downstream service.
- Invalid, duplicated, stale, or out-of-order input.
- Configuration drift between environments.
- CPU, memory, network, connection pool, queue depth, or browser main-thread exhaustion.
- Partial success where one side effect commits and another fails.

## Production Readiness

- Timeouts and cancellation.
- Idempotency keys or deduplication.
- Retry with backoff and jitter.
- Circuit breakers or load shedding.
- Rollback, compensation, or replay strategy.
`,
    ],
    [
      "debugging-strategies.md",
      `# Debugging Strategies: ${subtopicName}

## Debugging Flow

- Reproduce with minimal inputs.
- Add concurrency, load, and failure injection.
- Compare healthy and unhealthy paths.
- Follow correlation IDs across logs, traces, and metrics.
- Verify assumptions about ordering, retries, caching, ownership, and lifecycle timing.

## Useful Evidence

- Logs with structured fields.
- Distributed traces.
- Metrics by percentile and dimension.
- Heap snapshots and CPU profiles.
- Network captures.
- Query plans.
- Browser performance recordings where applicable.
`,
    ],
    [
      "optimization-techniques.md",
      `# Optimization Techniques: ${subtopicName}

## Optimization Order

1. Measure the bottleneck.
2. Remove unnecessary work.
3. Bound expensive paths.
4. Cache, batch, stream, paginate, debounce, or lazy-load only where evidence supports it.
5. Re-measure p95 and p99 behavior.

## Techniques

- Backpressure and bounded queues.
- Timeouts and circuit breakers.
- Data shape reduction.
- Indexing and query tuning.
- Bundle splitting or lazy loading.
- Connection pooling and concurrency limits.
- Precomputation for stable expensive work.
`,
    ],
  ]);
}

function generateSubdirectories(directory, category, categoryNumber = null) {
  const categoryPath = join(root, directory);
  const topics = topicsFor(category);

  for (const [topicIndex, [topicName, subtopics]] of topics.entries()) {
    const topicNumber = topicIndex + 1;
    const topicId = categoryNumber ? `${categoryNumber}.${topicNumber}` : `${topicNumber}`;
    const topicPath = join(categoryPath, numberedName(topicId, topicName));
    mkdirSync(topicPath, { recursive: true });
    writeFileSync(join(topicPath, "README.md"), topicReadmeFor(category, categoryNumber, topicNumber, topicName, subtopics));

    for (const [subtopicIndex, subtopicName] of subtopics.entries()) {
      const subtopicNumber = subtopicIndex + 1;
      const id = categoryNumber ? `${categoryNumber}.${topicNumber}.${subtopicNumber}` : `${topicNumber}.${subtopicNumber}`;
      const subtopicPath = join(topicPath, numberedName(id, subtopicName));
      mkdirSync(subtopicPath, { recursive: true });
      writeFileSync(join(subtopicPath, "README.md"), subtopicReadmeFor(category, categoryNumber, topicNumber, subtopicNumber, topicName, subtopicName));

      for (const [fileName, content] of subtopicFiles(category, topicName, subtopicName)) {
        writeFileSync(join(subtopicPath, fileName), content);
      }
    }
  }
}

for (const [categoryIndex, directory] of directories.entries()) {
  const category = categoryName(directory);
  const categoryNumber = categoryIndex + 1;
  writeFileSync(join(root, directory, "README.md"), readmeFor(category, categoryNumber));
  generateSubdirectories(directory, category, categoryNumber);
}

for (const directory of extraDirectories) {
  mkdirSync(join(root, directory), { recursive: true });
  writeFileSync(join(root, directory, "README.md"), readmeFor(directory));
  generateSubdirectories(directory, directory);
}

console.log(`Generated ${directories.length} numbered and ${extraDirectories.length} extra knowledge-tree directories.`);
