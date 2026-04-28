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
      ["Language Fundamentals", ["Variables & Declarations", "Scope, Closures, and Hoisting", "Prototypes and Object Model"]],
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

function simplePaddedId(value) {
  return String(value)
    .split(".")
    .map((part) => String(part).padStart(2, "0"))
    .join(".");
}

function numberedName(number, name, hasCategoryNumber = true) {
  const id = hasCategoryNumber ? paddedId(number) : simplePaddedId(number);
  return `${id} ${safeName(name)}`;
}

function categoryFolderName(number, name) {
  return `${String(number).padStart(3, "0")}. ${safeName(name)}`;
}

function prefixedName(prefix, number, name) {
  return prefix ? `${prefix}.${padNumber(number)} ${safeName(name)}` : numberedName(number, name);
}

function subtopicBlock(category, categoryNumber, topicNumber, subtopicNumber, topicName, subtopicName) {
  const id = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}.${subtopicNumber}`) : simplePaddedId(`${topicNumber}.${subtopicNumber}`);
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

      const id = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}`) : simplePaddedId(topicNumber);
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
  const topicId = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}`) : simplePaddedId(topicNumber);
  const links = subtopics
    .map((subtopicName, index) => {
      const rawId = categoryNumber ? `${categoryNumber}.${topicNumber}.${index + 1}` : `${topicNumber}.${index + 1}`;
      const id = categoryNumber ? paddedId(rawId) : simplePaddedId(rawId);
      return `- [${id} ${subtopicName}](./${numberedName(rawId, subtopicName, Boolean(categoryNumber))}/README.md)`;
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
  const id = categoryNumber ? paddedId(`${categoryNumber}.${topicNumber}.${subtopicNumber}`) : simplePaddedId(`${topicNumber}.${subtopicNumber}`);
  return `# ${id} ${subtopicName}

Category: ${category}

Topic: ${topicName}

## Files

- [Learning Objectives](./learning-objectives.md)
- [Core Concepts](./core-concepts.md)
- [Deep Concepts](./deep-concepts.md)
- [Code-Level Understanding](./code-level-understanding.md)
- [Real-World Usage](./real-world-usage.md)
- [Architecture Decisions](./architecture-decisions.md)
- [Interview Focus](./interview-focus.md)
- [Internal Flow](./internal-flow.md)
- [Diagrams](./diagrams.md)
- [Failure Scenarios](./failure-scenarios.md)
- [Debugging Strategies](./debugging-strategies.md)
- [Optimization Techniques](./optimization-techniques.md)
- [Mental Models](./mental-models.md)
- [Practice Drills](./practice-drills.md)
- [Validation Questions](./validation-questions.md)
- [Mastery Checklist](./mastery-checklist.md)
- [Revision Notes](./revision-notes.md)
- [Domain-Specific Examples](./domain-specific-examples.md)
- [Common Misconceptions](./common-misconceptions.md)
- [Hands-On Lab](./hands-on-lab.md)
- [Production Incident Review](./production-incident-review.md)
- [System Design Connections](./system-design-connections.md)
- [Interview Answer Framework](./interview-answer-framework.md)
- [Debugging Playbook](./debugging-playbook.md)
- [Staff Engineer Notes](./staff-engineer-notes.md)
- [Quick Reference](./quick-reference.md)
- [Question Bank](./question-bank.md)
- [Answer Rubric](./answer-rubric.md)
- [Compare And Contrast](./compare-and-contrast.md)
- [Capstone Exercise](./capstone-exercise.md)
- [Study Plan](./study-plan.md)
- [Teaching Notes](./teaching-notes.md)
- [Real Interview Prompts](./real-interview-prompts.md)

## Outcome

Use this folder to build interview-ready depth for ${subtopicName}: definition, internals, implementation, production behavior, debugging, and trade-offs.

## Recommended Study Order

1. Start with learning objectives and core concepts.
2. Move into deep concepts and internal flow.
3. Write or inspect code-level examples.
4. Connect the idea to real-world systems and architecture decisions.
5. Stress the topic with failure scenarios, debugging, and optimization.
6. Use quick reference, question bank, and answer rubric for self-testing.
7. Complete the capstone exercise before marking the topic complete.
`;
}

const enrichmentProfiles = [
  {
    test: /JavaScript|TypeScript|RxJS|Functional Programming|OOP/i,
    domain: "language/runtime engineering",
    example: "a shared utility used by browser clients, Node.js services, and test suites where small semantic mistakes spread widely",
    lab: "write a minimal TypeScript example, run it in Node.js, then change one assumption and record the output difference",
    code: `const input: unknown = "42";
const parsed = typeof input === "string" ? Number(input) : input;
console.log({ input, parsed, type: typeof parsed });`,
    misconception: "Knowing syntax is enough. At senior level, you must understand runtime behavior, coercion, allocation, scheduling, and failure modes.",
    incident: "A production release works in tests but fails for a subset of users because runtime semantics differ for undefined, null, async timing, or object identity.",
    signals: "unexpected undefined values, TypeError spikes, memory growth, event-loop delay, inconsistent browser or Node.js behavior",
    system: "Language behavior shapes API contracts, serialization, frontend state, backend request handling, and debugging quality.",
  },
  {
    test: /Angular|React|Frontend|Browser|HTML|CSS|Design System|UI Engineering|State Management|Accessibility|SEO|Internationalization|Analytics|Feature Flags|SSR|CSR|SSG|Hydration|Webpack|Vite|Nx/i,
    domain: "frontend product engineering",
    example: "a customer-facing dashboard where rendering, state, accessibility, analytics, and network behavior must stay predictable",
    lab: "build a tiny UI state or rendering example, profile it, then add one failure path such as slow network or missing data",
    code: `type ViewState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };`,
    misconception: "Frontend is only presentation. In production, frontend code owns latency, accessibility, state correctness, telemetry, and user-visible resilience.",
    incident: "A deploy causes blank screens only for slow devices because rendering, hydration, state initialization, or bundle loading behaves differently under pressure.",
    signals: "Core Web Vitals regressions, hydration warnings, JavaScript errors, layout shifts, failed API calls, accessibility violations",
    system: "Frontend choices affect system design through caching, API shape, BFF boundaries, observability, experimentation, and user-perceived reliability.",
  },
  {
    test: /Node|NestJS|Express|API Design|REST|GraphQL|WebSocket|Authentication|Authorization|BFF|API Gateway/i,
    domain: "backend/API engineering",
    example: "a request path that validates input, authorizes access, performs work, emits telemetry, and returns a stable contract",
    lab: "implement a small endpoint contract with validation, typed result states, timeout handling, and one negative test",
    code: `type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; retryable: boolean };`,
    misconception: "The endpoint is the system. Real backend design includes contracts, idempotency, authz, rate limits, observability, rollout safety, and dependency behavior.",
    incident: "A downstream service slows down and causes request pileups because timeout, cancellation, connection pooling, or backpressure was not explicit.",
    signals: "p95/p99 latency, 4xx/5xx rate, saturation, connection pool exhaustion, timeout count, retry amplification",
    system: "API decisions define service boundaries, client contracts, security posture, data ownership, and operability.",
  },
  {
    test: /System Design|Distributed|Microservices|Event-Driven|Kafka|RabbitMQ|Caching|Redis|Queue|Background Jobs|Rate Limiting|Idempotency|Multi-Tenant|SaaS|Payment|Notification|Search|CQRS|Event Sourcing/i,
    domain: "distributed systems architecture",
    example: "a multi-service workflow where data moves through APIs, queues, caches, storage, and asynchronous processors",
    lab: "model a workflow with one synchronous call, one async message, one retry, and one compensation path",
    code: `type EventEnvelope<T> = {
  id: string;
  type: string;
  occurredAt: string;
  payload: T;
  idempotencyKey: string;
};`,
    misconception: "More services automatically improve scale. Distributed design trades local simplicity for coordination, consistency, observability, and failure complexity.",
    incident: "A partial outage duplicates work or loses ordering because retries, idempotency, deduplication, and event contracts were not designed together.",
    signals: "queue lag, duplicate events, consumer errors, cache stampedes, inconsistent reads, partition hot spots, retry storms",
    system: "This topic maps directly to service boundaries, consistency models, resilience patterns, capacity planning, and operational ownership.",
  },
  {
    test: /Database|SQL|NoSQL|Indexing|Transactions|Data Modeling|Domain-Driven/i,
    domain: "data and persistence engineering",
    example: "a high-traffic data access path where schema shape, indexes, transactions, and access patterns determine correctness and latency",
    lab: "design a table or document model, list access patterns, choose indexes, and describe one migration path",
    code: `type RecordState = {
  id: string;
  version: number;
  status: "draft" | "active" | "archived";
  updatedAt: string;
};`,
    misconception: "Database design is only schema design. Production data work includes access patterns, locking, migrations, consistency, backups, and query plans.",
    incident: "A query that is fast in staging becomes a production bottleneck because cardinality, index selectivity, lock contention, or transaction scope differs.",
    signals: "slow query logs, lock waits, deadlocks, high I/O, replication lag, connection saturation, migration duration",
    system: "Data decisions anchor domain boundaries, consistency guarantees, service autonomy, reporting, compliance, and disaster recovery.",
  },
  {
    test: /Security|OWASP|Compliance|Privacy|Threat Modeling|Governance/i,
    domain: "security and governance engineering",
    example: "a sensitive user workflow where identity, authorization, data handling, auditability, and threat modeling must align",
    lab: "draw a trust boundary diagram, list assets, identify attackers, add controls, and define audit evidence",
    code: `type AccessDecision = {
  subject: string;
  action: string;
  resource: string;
  allowed: boolean;
  reason: string;
};`,
    misconception: "Security is a checklist at the end. In real systems it is a design constraint across boundaries, defaults, data, operations, and incident response.",
    incident: "A permission change exposes data because authorization logic, caching, tenancy boundaries, or audit controls were incomplete.",
    signals: "auth failures, unusual access patterns, policy drift, missing audit logs, secret exposure, high-risk dependency alerts",
    system: "Security topics connect to trust boundaries, least privilege, data classification, compliance evidence, and architecture review.",
  },
  {
    test: /Cloud|DevOps|Docker|Kubernetes|CI-CD|Infrastructure|Observability|Logging|Monitoring|Tracing|Production Readiness|Operational Excellence|Resilience|Failure Handling|Backpressure|Load Testing|Capacity|Cost Optimization|Incident/i,
    domain: "platform and operations engineering",
    example: "a production service with deployment pipelines, health signals, autoscaling, alerting, rollback, and cost constraints",
    lab: "define SLIs, an alert, a rollback path, a capacity assumption, and a load-test scenario for this topic",
    code: `type ServiceSlo = {
  availabilityTarget: number;
  latencyP95Ms: number;
  errorBudgetPercent: number;
};`,
    misconception: "Operations starts after deploy. Production engineering starts in design through health checks, observability, capacity, resilience, and rollback.",
    incident: "A routine deploy becomes an incident because readiness checks, alerts, capacity limits, or rollback automation were incomplete.",
    signals: "error budget burn, pod restarts, CPU throttling, memory pressure, alert noise, deploy correlation, cost spikes",
    system: "Operational topics map to reliability, scalability, deployment safety, platform ownership, and business continuity.",
  },
  {
    test: /Testing|Unit|Integration|E2E|Contract|Performance Engineering|Scalability|Reliability|Production Debugging|Memory Leaks|Concurrency|Race Conditions/i,
    domain: "quality and performance engineering",
    example: "a critical workflow where tests, profiling, concurrency control, and failure injection prevent production regressions",
    lab: "write one fast test, one boundary test, one failure test, and one measurement experiment for this topic",
    code: `type TestCase = {
  name: string;
  arrange: string;
  act: string;
  assert: string;
  riskCovered: string;
};`,
    misconception: "Testing proves correctness. Tests sample risk; production confidence also needs observability, contracts, profiling, and controlled rollout.",
    incident: "A change passes tests but fails under concurrency, large data, slow devices, or realistic production traffic.",
    signals: "flaky tests, p99 regression, memory growth, race frequency, failed contracts, test coverage gaps, canary failures",
    system: "Quality topics connect implementation confidence to release safety, reliability, performance budgets, and incident prevention.",
  },
  {
    test: /AI|LLM|Prompt|RAG|Agentic|Copilot|Cursor|Claude|ChatGPT/i,
    domain: "AI-assisted engineering",
    example: "an AI-assisted workflow where prompts, context, tools, evaluation, review, and safety controls affect engineering output",
    lab: "create a prompt, define expected output, run a review checklist, and record failure cases or hallucination risks",
    code: `type EvaluationCase = {
  input: string;
  expectedBehavior: string;
  unacceptableFailure: string;
  reviewRequired: boolean;
};`,
    misconception: "AI output is either magic or useless. Senior use depends on task framing, context quality, evaluation, tool boundaries, and human review.",
    incident: "Generated code introduces a subtle security, correctness, or maintainability issue because review and evaluation gates were weak.",
    signals: "inconsistent outputs, hallucinated APIs, missing tests, unsafe assumptions, high token cost, poor retrieval grounding",
    system: "AI topics connect to developer productivity, code review, knowledge retrieval, governance, and quality control.",
  },
  {
    test: /Leadership|Mentoring|Decision|Review|Stakeholder|Estimation|Agile|Hiring|Documentation|RFC|Trade-off|Collaboration|Productivity|Staff/i,
    domain: "technical leadership",
    example: "a cross-team engineering decision where clarity, influence, trade-offs, delivery risk, and long-term ownership matter",
    lab: "write a one-page decision record with context, options, trade-offs, recommendation, risks, and follow-up signals",
    code: `type DecisionRecord = {
  context: string;
  options: string[];
  decision: string;
  tradeoffs: string[];
  reviewDate: string;
};`,
    misconception: "Leadership is mostly communication. Staff-level leadership is technical judgment made legible across teams and time.",
    incident: "A technically reasonable decision fails because ownership, migration path, stakeholder alignment, or operational readiness was unclear.",
    signals: "repeated escalations, unclear ownership, stalled reviews, rework, missed dependencies, decision churn",
    system: "Leadership topics shape architecture quality through decision records, governance, mentoring, planning, and cross-team alignment.",
  },
];

const defaultEnrichment = {
  domain: "general software engineering",
  example: "a production workflow where correctness, observability, ownership, and maintainability matter",
  lab: "create one small example, one failure scenario, one debugging checklist, and one architecture trade-off",
  code: `type LearningArtifact = {
  concept: string;
  example: string;
  failureMode: string;
  tradeoff: string;
};`,
  misconception: "Understanding the definition is enough. Mastery requires implementation, failure analysis, debugging, and trade-off reasoning.",
  incident: "A simple path fails in production because assumptions about input, state, ownership, or dependencies were not made explicit.",
  signals: "error rate, latency, saturation, logs, traces, customer reports, deploy correlation",
  system: "This topic connects local implementation choices to system behavior, reliability, scalability, and ownership.",
};

function enrichmentFor(category) {
  return enrichmentProfiles.find((profile) => profile.test.test(category)) ?? defaultEnrichment;
}

function subtopicFiles(category, topicName, subtopicName) {
  const enrichment = enrichmentFor(category);
  return new Map([
    [
      "learning-objectives.md",
      `# Learning Objectives: ${subtopicName}

## By The End, You Should Be Able To

- Define ${subtopicName} in the context of ${category} without relying on memorized wording.
- Explain why ${subtopicName} belongs under ${topicName} and what dependency it creates for later topics.
- Trace the normal flow, edge-case flow, and failure flow.
- Recognize common production symptoms related to ${subtopicName}.
- Choose between at least two implementation or architecture approaches and defend the trade-off.

## Depth Targets

- Beginner depth: explain what it is and where it appears.
- Intermediate depth: describe how it works internally and show a small example.
- Senior depth: identify failure modes, scaling pressure, debugging signals, and operational trade-offs.
- Staff depth: connect the topic to system boundaries, ownership, migration strategy, and long-term maintainability.

## Learning Artifacts To Produce

- A short definition in your own words.
- One diagram or text flow.
- One code example or concrete production example.
- One anti-pattern and its safer alternative.
- Three interview questions with answers.
`,
    ],
    [
      "core-concepts.md",
      `# Core Concepts: ${subtopicName}

## Definition

${subtopicName} is a core part of ${category} that describes a specific behavior, boundary, or engineering decision inside ${topicName}.

The practical goal is to understand what problem it solves, what assumptions it makes, and what can break when those assumptions are false.

## Why It Exists

- It gives engineers a shared vocabulary for reasoning about ${topicName}.
- It makes hidden behavior explicit before it becomes a production bug.
- It helps separate local implementation choices from system-level consequences.
- It creates a foundation for deeper topics that depend on the same execution, data, or ownership model.

## Concept Boundary

Use ${subtopicName} to reason about:

- Inputs and outputs.
- State ownership.
- Lifecycle timing.
- Error and failure behavior.
- Performance and scalability pressure.

Do not treat it as isolated trivia. In real systems, it interacts with runtime behavior, framework defaults, data contracts, deployment strategy, and team ownership.

## Internal Working

- Input enters through an explicit boundary.
- Validation and normalization happen before state changes.
- The ${topicName} layer decides which path should execute.
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
`,
    ],
    [
      "deep-concepts.md",
      `# Deep Concepts: ${subtopicName}

## Hidden Behaviors

- Framework defaults that change lifecycle, ordering, caching, retries, or error propagation.
- Runtime behavior that only appears under concurrency, load, large input, or slow dependencies.
- State that survives longer than expected through closures, caches, sessions, queues, or retained references.
- Behavior that differs between local development, CI, staging, and production.
- Implicit coupling through shared configuration, shared libraries, generated code, schemas, or deployment order.

## Edge Cases

- Empty, null, duplicated, stale, malformed, or out-of-order input.
- Partial success after one side effect commits and another fails.
- Timeout, cancellation, retry, and race-condition paths.
- Version mismatch between clients, services, schemas, or packages.
- First request after deploy, cold start, cache miss, expired token, rotated secret, and rolling deployment overlap.

## Internal Mechanisms

Identify the queues, buffers, schedulers, locks, indexes, render phases, network hops, heap references, context boundaries, or persistence paths behind the abstraction.

## Performance Implications

Measure latency, throughput, memory, CPU, I/O, payload size, bundle size, query cost, and p95/p99 behavior.

## Senior Engineer Lens

- Ask what happens when this path runs 10x more often.
- Ask what happens when the dependency becomes slow but not fully down.
- Ask what signal would prove the issue is here and not one layer above or below.
- Ask whether the current abstraction makes migration easier or harder.
- Ask whether the team that owns this path can operate it during an incident.
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

## Implementation Skeleton

\`\`\`ts
type Input = {
  id: string;
  payload: unknown;
};

type Result =
  | { ok: true; value: unknown }
  | { ok: false; error: string; retryable: boolean };

export function handle(input: Input): Result {
  if (!input.id) {
    return { ok: false, error: "missing_id", retryable: false };
  }

  try {
    // Replace this block with a concrete ${subtopicName} example.
    const value = input.payload;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: "unexpected_failure", retryable: true };
  }
}
\`\`\`

## Test Cases To Add

- Happy path with valid input.
- Invalid input at the boundary.
- Duplicate or repeated input.
- Slow dependency or timeout path.
- Partial failure or rollback path.
- Large input or high-frequency execution.

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
- Make idempotency, timeout, and cleanup behavior explicit when side effects exist.
- Add logs and metrics at decision points, not only at the outermost handler.
`,
    ],
    [
      "real-world-usage.md",
      `# Real-World Usage: ${subtopicName}

## Production Uses

${subtopicName} matters anywhere ${category} needs predictable behavior across teams, releases, traffic spikes, and dependency failures.

## Why Production Makes It Harder

- Data arrives from older clients, newer clients, retries, imports, scripts, and background jobs.
- Multiple deploy versions may run at the same time.
- Dependencies can be degraded without being fully unavailable.
- Observability may show symptoms far away from the root cause.
- Ownership can be split across frontend, backend, platform, security, and data teams.

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
- What rollback or mitigation exists if this path breaks?
- What customer-facing symptom appears first?
- What operational dashboard would reveal the problem?
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

## Decision Matrix

| Pressure | Prefer | Avoid |
|---|---|---|
| Low scale, low risk | Simple local implementation | Premature platform abstraction |
| High correctness risk | Explicit validation and contracts | Implicit conventions |
| High traffic | Bounded queues, caching, batching, measurement | Unbounded fan-out |
| Many teams | Stable interfaces and ownership docs | Shared mutable behavior |
| Frequent change | Reversible decisions and feature flags | Big-bang migrations |

## Architecture Review Prompts

- What decision is hard to reverse?
- What does this couple us to?
- What is the blast radius of a bad deploy?
- How will future teams discover the intended pattern?
- Which metric tells us the decision stopped being good?
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

## Expanded Flow

\`\`\`text
Caller intent
  -> input construction
  -> boundary validation
  -> authorization / policy check when applicable
  -> current state lookup
  -> decision branch
  -> core ${subtopicName} behavior
  -> side effect execution
  -> result mapping
  -> telemetry emission
  -> retry, rollback, compensation, or user-visible response
\`\`\`

## Flow Review Checklist

- Every state transition has a named owner.
- Every external call has a timeout.
- Every retryable operation is safe to retry.
- Every failure mode has a visible signal.
- Every expensive operation has a known limit.
`,
    ],
    [
      "diagrams.md",
      `# Diagrams: ${subtopicName}

Use these diagrams to explain ${subtopicName} visually during revision, mentoring, architecture review, and interviews.

## Concept Flow

\`\`\`mermaid
flowchart TD
  A[Input or trigger] --> B[Validate assumptions]
  B --> C[Resolve ${topicName} context]
  C --> D[Apply ${subtopicName} behavior]
  D --> E[State or output changes]
  E --> F[Observable result]
  F --> G[Telemetry and feedback]
\`\`\`

## Internal Lifecycle

\`\`\`text
Start
  -> identify boundary
  -> load current state or context
  -> apply core rule
  -> handle edge case
  -> produce result
  -> emit logs, metrics, or traces where applicable
\`\`\`

## Failure Decision Tree

\`\`\`mermaid
flowchart TD
  A[Unexpected behavior] --> B{Input valid?}
  B -->|no| C[Fix validation or caller contract]
  B -->|yes| D{State correct?}
  D -->|no| E[Inspect ownership, mutation, caching, or ordering]
  D -->|yes| F{Dependency healthy?}
  F -->|no| G[Check timeout, retry, saturation, or fallback]
  F -->|yes| H[Inspect implementation assumptions and edge cases]
\`\`\`

## Production Mental Model

\`\`\`text
Correctness
  + lifecycle timing
  + state ownership
  + failure handling
  + observability
  + scale pressure
  = production-ready understanding
\`\`\`

## Diagram Review Questions

- What does the diagram make easier to explain?
- Where is the first failure boundary?
- Which state transition is most dangerous?
- Which signal would prove the behavior in production?
- How would the diagram change at 10x traffic, data, or team size?
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

## Failure Drill

Simulate these conditions:

- Dependency latency increases by 5x.
- Input arrives twice.
- A deploy runs old and new versions together.
- The cache is empty or contains stale data.
- A downstream write succeeds but the response is lost.
- Observability is delayed or incomplete.

For each condition, answer:

- What breaks first?
- What metric changes first?
- What log or trace field identifies the affected path?
- What mitigation can be applied without a full redeploy?
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

## Debugging Checklist

- Confirm the exact symptom and affected scope.
- Compare a healthy request/path with an unhealthy one.
- Check recent deploys, config changes, data migrations, traffic shifts, and dependency incidents.
- Reduce the problem to one failing invariant.
- Reproduce with the smallest input that still fails.
- Add instrumentation before changing behavior if the cause is uncertain.

## Common False Leads

- Blaming the nearest stack trace frame instead of the root cause.
- Debugging averages while the issue is in p99.
- Ignoring retries that multiply traffic during incidents.
- Assuming local reproduction proves production behavior.
- Treating missing logs as proof that nothing happened.
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

## Measurement Plan

- Define the target metric before optimizing.
- Capture baseline p50, p95, p99, error rate, and resource usage.
- Change one variable at a time.
- Re-measure under realistic load.
- Document the trade-off introduced by the optimization.

## When Not To Optimize

- The path is not on the critical user or system journey.
- The bottleneck is outside this layer.
- The optimization hides correctness problems.
- The added complexity has no owner.
- The expected gain is smaller than measurement noise.
`,
    ],
    [
      "mental-models.md",
      `# Mental Models: ${subtopicName}

## Core Model

Think of ${subtopicName} as a contract between intent, state, execution, and observation.

\`\`\`text
Intent -> Boundary -> State -> Decision -> Effect -> Signal
\`\`\`

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
`,
    ],
    [
      "practice-drills.md",
      `# Practice Drills: ${subtopicName}

## Drill 1: Explain

Explain ${subtopicName} in five sentences:

1. What it is.
2. Why it exists.
3. How it works internally.
4. What goes wrong.
5. How to debug or design around it.

## Drill 2: Trace

Draw or write a flow for:

\`\`\`text
input -> validation -> decision -> state change -> output -> telemetry
\`\`\`

## Drill 3: Break It

List what happens when:

- Input is missing.
- Input is duplicated.
- A dependency is slow.
- A retry happens.
- Two callers act concurrently.
- The system is mid-deploy.

## Drill 4: Teach It

Teach this to another engineer using:

- One simple example.
- One production example.
- One anti-pattern.
- One debugging technique.
`,
    ],
    [
      "validation-questions.md",
      `# Validation Questions: ${subtopicName}

## Conceptual Questions

1. What problem does ${subtopicName} solve in ${category}?
2. What internal mechanism or flow makes it work?
3. What assumptions does it rely on?
4. What edge cases are most likely to appear in production?
5. What is the difference between a local implementation concern and an architecture concern for this topic?

## Scenario Questions

1. A production issue appears only under high traffic. How would you investigate ${subtopicName}?
2. A retry causes duplicated work. What safeguards should exist?
3. A deploy changes behavior for only some users. What compatibility or rollout issue might explain it?

## Prediction Questions

1. What output, state change, or user-visible behavior do you expect when input is empty, duplicated, or stale?
2. What metric would move first if ${subtopicName} became the bottleneck?

## Mastery Prompt

Explain ${subtopicName} from beginner level to staff level in under five minutes, including one code-level detail and one production trade-off.
`,
    ],
    [
      "mastery-checklist.md",
      `# Mastery Checklist: ${subtopicName}

## Understanding

- [ ] I can define the topic clearly.
- [ ] I can explain why it belongs under ${topicName}.
- [ ] I can identify the main invariant.
- [ ] I can draw the internal flow.
- [ ] I can name at least five edge cases.

## Implementation

- [ ] I can build a minimal example.
- [ ] I can write tests for happy path and failure path.
- [ ] I can identify anti-patterns.
- [ ] I can add observability at useful points.
- [ ] I can reason about cleanup, cancellation, or rollback.

## Production

- [ ] I can describe how this fails under load.
- [ ] I can debug it with logs, metrics, traces, or profiles.
- [ ] I can explain the scalability limit.
- [ ] I can compare at least two architecture approaches.
- [ ] I can explain the operational owner and blast radius.

## Interview Readiness

- [ ] I can answer common questions.
- [ ] I can handle tricky scenarios.
- [ ] I can explain trade-offs.
- [ ] I can connect the topic to system design.
- [ ] I can teach it simply without losing depth.
`,
    ],
    [
      "revision-notes.md",
      `# Revision Notes: ${subtopicName}

## One-Line Summary

${subtopicName} is a ${category} topic that must be understood through definition, internal flow, failure behavior, production usage, and trade-offs.

## Remember

- Start with the invariant.
- Name the boundary.
- Trace the flow.
- Stress the edge cases.
- Measure before optimizing.
- Design rollback and observability before production incidents.

## Quick Review

- Definition:
- Internal mechanism:
- Example:
- Anti-pattern:
- Failure mode:
- Debugging signal:
- Optimization:
- Trade-off:

## Spaced Repetition Prompts

- Review after 1 day: explain the concept without notes.
- Review after 3 days: solve one scenario question.
- Review after 7 days: teach the topic and add one production example.
- Review after 14 days: connect it to a system design problem.
`,
    ],
    [
      "domain-specific-examples.md",
      `# Domain-Specific Examples: ${subtopicName}

## Domain Lens

Category domain: ${enrichment.domain}

Use ${subtopicName} to reason about ${enrichment.example}.

## Concrete Example

\`\`\`ts
${enrichment.code}
\`\`\`

## How To Study The Example

- Identify the input boundary.
- Name the invariant being protected.
- Trace the happy path.
- Add one invalid input.
- Add one high-scale or high-concurrency condition.
- Decide what telemetry would prove the behavior is correct.

## Production Translation

In ${category}, this example should translate into:

- clearer contracts,
- safer defaults,
- explicit failure behavior,
- better debugging evidence,
- and a stronger explanation during interviews or architecture reviews.
`,
    ],
    [
      "common-misconceptions.md",
      `# Common Misconceptions: ${subtopicName}

## Misconception 1

${enrichment.misconception}

Correction: learn the underlying mechanism, then connect it to production behavior and team ownership.

## Misconception 2

"If it works locally, the concept is understood."

Correction: local behavior rarely includes production traffic shape, old clients, retries, slow dependencies, partial deploys, or operational constraints.

## Misconception 3

"The best answer is the most advanced pattern."

Correction: the best answer is the simplest design that protects the required invariant and can evolve when evidence justifies complexity.

## Misconception 4

"This is only an implementation detail."

Correction: implementation details become architecture concerns when they affect contracts, data ownership, reliability, security, cost, or cross-team dependencies.

## Review Prompt

Write one sentence explaining what you used to believe about ${subtopicName}, then rewrite it with the production constraint included.
`,
    ],
    [
      "hands-on-lab.md",
      `# Hands-On Lab: ${subtopicName}

## Goal

Practice ${subtopicName} through a concrete ${enrichment.domain} exercise.

## Lab Task

${enrichment.lab}

## Steps

1. Write the smallest working example.
2. Add one boundary validation.
3. Add one failure path.
4. Add one test or manual verification case.
5. Add one metric, log field, trace label, or checklist item.
6. Explain the architecture trade-off in three sentences.

## Stretch Goals

- Run the example with duplicated input.
- Run the example with delayed or missing dependency behavior.
- Measure before and after one optimization.
- Write a rollback or mitigation note.

## Completion Criteria

- You can explain the result without reading the code.
- You can name what would break in production.
- You can describe what signal would reveal the breakage.
- You can state when you would not use this approach.
`,
    ],
    [
      "production-incident-review.md",
      `# Production Incident Review: ${subtopicName}

## Scenario

${enrichment.incident}

## First Symptoms

- User-visible issue appears intermittently.
- Error or latency increases for one path before the whole system looks unhealthy.
- The failure is correlated with traffic, deploy timing, data shape, or dependency behavior.

## Likely Signals

${enrichment.signals}

## Triage Flow

1. Confirm customer impact and affected scope.
2. Check recent deploys, config changes, data migrations, and traffic shifts.
3. Compare healthy and unhealthy examples.
4. Identify the first broken invariant.
5. Mitigate before root-causing if user impact is active.
6. Preserve evidence for post-incident learning.

## Post-Incident Questions

- Which assumption failed?
- Which alert should have fired earlier?
- Which dashboard was missing?
- Which test or validation would have caught this before deploy?
- Which ownership or process gap made recovery slower?
`,
    ],
    [
      "system-design-connections.md",
      `# System Design Connections: ${subtopicName}

## Connection

${enrichment.system}

## Design Dimensions

- Boundary: where does ${subtopicName} start and stop?
- State: who owns the state and how is it changed?
- Consistency: what must be immediately true, eventually true, or explicitly best-effort?
- Scale: what bottleneck appears first?
- Failure: what happens during timeout, retry, cancellation, or partial success?
- Observability: what must be logged, measured, traced, or audited?

## Architecture Review Questions

- Does this topic affect service boundaries?
- Does it change client or downstream contracts?
- Does it introduce shared state or shared ownership?
- Does it need a migration plan?
- Does it require a rollback path?
- Does it affect cost, latency, reliability, or security posture?

## Trade-Off Template

\`\`\`text
Option A:
  Benefits:
  Costs:
  Failure modes:

Option B:
  Benefits:
  Costs:
  Failure modes:

Decision:
  Choose:
  Because:
  Revisit when:
\`\`\`
`,
    ],
    [
      "interview-answer-framework.md",
      `# Interview Answer Framework: ${subtopicName}

## Short Answer

${subtopicName} in ${category} is about protecting a specific behavior or decision inside ${topicName}. A strong answer explains the mechanism, the edge cases, and how it behaves in production.

## Senior Answer Structure

1. Define it.
2. Explain why it exists.
3. Describe the internal mechanism.
4. Give a small example.
5. Name edge cases.
6. Discuss production failure modes.
7. Compare two approaches.
8. Explain debugging and observability.
9. Close with how the design changes at scale.

## Staff-Level Upgrade

Add:

- ownership boundaries,
- migration risk,
- rollback strategy,
- cross-team impact,
- operational burden,
- and the metric that would make you revisit the decision.

## Practice Prompt

"Teach me ${subtopicName} as if I am strong at coding but new to ${category}. Then explain what changes when this runs in production."
`,
    ],
    [
      "debugging-playbook.md",
      `# Debugging Playbook: ${subtopicName}

## Start Here

Debug ${subtopicName} by moving from symptom to invariant, not from stack trace to guess.

## Evidence To Gather

- Exact user or system symptom.
- Affected percentage and segment.
- Recent deploys or configuration changes.
- Logs with correlation IDs.
- Metrics by percentile, not only averages.
- Traces across boundaries.
- Resource saturation signals.
- Data shape or input examples.

## Domain Signals

${enrichment.signals}

## Investigation Path

1. Reproduce with the smallest failing case.
2. Compare a passing case and failing case.
3. Identify where expected state diverges.
4. Check hidden defaults and lifecycle timing.
5. Add targeted instrumentation if evidence is missing.
6. Mitigate user impact.
7. Write the regression test or runbook update.

## Avoid

- Changing behavior before understanding the invariant.
- Debugging only the happy path.
- Trusting averages during tail-latency issues.
- Ignoring retries, caching, and partial deploys.
- Treating missing logs as proof that nothing happened.
`,
    ],
    [
      "staff-engineer-notes.md",
      `# Staff Engineer Notes: ${subtopicName}

## What Staff Engineers Look For

- Is the boundary explicit?
- Is the invariant named?
- Is the failure behavior designed?
- Is the operational owner clear?
- Is the design reversible?
- Is there a migration path?
- Is the complexity justified by evidence?

## Review Lens

For ${subtopicName}, review the design across:

- correctness,
- operability,
- scalability,
- security,
- cost,
- developer experience,
- and long-term maintainability.

## Coaching Notes

- Ask juniors to explain the happy path.
- Ask mid-level engineers to explain edge cases.
- Ask seniors to explain production failures and debugging.
- Ask staff-level engineers to explain ownership, trade-offs, migration, and governance.

## Decision Record Prompt

\`\`\`text
Context:
Decision:
Options considered:
Trade-offs:
Risks:
Mitigations:
Revisit when:
Owner:
\`\`\`
`,
    ],
    [
      "quick-reference.md",
      `# Quick Reference: ${subtopicName}

## Core Definition

${subtopicName} is a ${category} concept inside ${topicName} that should be understood through its boundary, invariant, execution flow, failure behavior, and trade-offs.

## Remember These Five Things

1. Boundary: where the behavior starts and stops.
2. Invariant: what must remain true.
3. Mechanism: how it works internally.
4. Failure: what breaks under bad input, load, retries, or partial deploys.
5. Signal: what evidence proves the behavior is healthy or unhealthy.

## Fast Mental Flow

\`\`\`text
Define -> Trace -> Break -> Debug -> Optimize -> Explain trade-off
\`\`\`

## Red Flags

- You can define it but cannot show an example.
- You know the happy path but not the failure path.
- You cannot name the metric or log that would reveal a production issue.
- You cannot compare a simple approach with a more scalable approach.
- You cannot explain ownership or rollback.

## One-Minute Review

- What is ${subtopicName}?
- Why does it matter in ${category}?
- What is one hidden edge case?
- How would you debug it?
- What would change at scale?
`,
    ],
    [
      "question-bank.md",
      `# Question Bank: ${subtopicName}

## Level 1: Foundation

1. Define ${subtopicName} in your own words.
2. Why does ${subtopicName} belong under ${topicName}?
3. What are the main inputs and outputs?
4. What is the key invariant?
5. What is the simplest example?

## Level 2: Internal Mechanics

1. What internal mechanism makes this work?
2. What lifecycle, ordering, or state behavior matters?
3. What hidden default can change behavior?
4. What happens with empty, malformed, duplicated, or stale input?
5. What is different between local and production behavior?

## Level 3: Code And Design

1. How would you implement a minimal version?
2. What tests would you write first?
3. What anti-pattern would you avoid?
4. Where would you add validation?
5. Where would you add logging, metrics, or tracing?

## Level 4: Production

1. What breaks first under load?
2. What happens during timeout, retry, or cancellation?
3. What is the rollback or mitigation path?
4. What dashboard or alert should exist?
5. Who owns this behavior during an incident?

## Level 5: Staff-Level

1. What trade-off would you document in an RFC?
2. What migration risk exists?
3. What cross-team dependency does this create?
4. What metric would make you revisit the design?
5. How would you teach this to three experience levels?
`,
    ],
    [
      "answer-rubric.md",
      `# Answer Rubric: ${subtopicName}

## Weak Answer

- Gives only a definition.
- Explains only the happy path.
- Has no edge cases.
- Has no production symptoms.
- Uses vague phrases like "it depends" without naming the dependency.

## Good Answer

- Defines ${subtopicName} clearly.
- Explains the mechanism.
- Gives a concrete example.
- Names common edge cases.
- Mentions at least one debugging signal.

## Strong Senior Answer

- Connects ${subtopicName} to ${enrichment.domain}.
- Explains failure behavior under load, retry, cancellation, or partial deploy.
- Compares two approaches and trade-offs.
- Mentions tests, observability, and rollback.
- Explains what changes at 10x scale.

## Staff-Level Answer

- Names ownership and blast radius.
- Explains migration and compatibility risk.
- Connects local design to system design.
- Discusses operational burden and cost.
- Defines the metric or incident pattern that would trigger redesign.

## Self-Score

| Score | Meaning |
|---:|---|
| 1 | I recognize the term. |
| 2 | I can explain the happy path. |
| 3 | I can implement and test it. |
| 4 | I can debug production failures. |
| 5 | I can make architecture decisions and teach others. |
`,
    ],
    [
      "compare-and-contrast.md",
      `# Compare And Contrast: ${subtopicName}

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

For ${subtopicName}, choose the simplest approach that protects correctness today and leaves a clear path to evolve tomorrow.
`,
    ],
    [
      "capstone-exercise.md",
      `# Capstone Exercise: ${subtopicName}

## Scenario

You own ${enrichment.example}. You must design, implement, test, operate, and explain ${subtopicName} for a production system.

## Deliverables

1. A one-paragraph concept explanation.
2. A minimal code or architecture example.
3. A failure-mode table.
4. A debugging checklist.
5. A test plan.
6. A rollback or mitigation plan.
7. A short interview answer.
8. A staff-level review note.

## Constraints

- Assume at least one dependency can be slow.
- Assume input can be duplicated or malformed.
- Assume deploys are rolling, not instantaneous.
- Assume another team will depend on this behavior.
- Assume observability must be useful during an incident.

## Evaluation

Your solution is strong if:

- The invariant is explicit.
- The design is observable.
- Failure behavior is intentional.
- The implementation is testable.
- The trade-off is documented.
- The design can evolve without a rewrite.
`,
    ],
    [
      "study-plan.md",
      `# Study Plan: ${subtopicName}

## 30-Minute Pass

- Read quick reference.
- Read core concepts.
- Answer three foundation questions.
- Write a one-sentence summary.

## 60-Minute Pass

- Read deep concepts and internal flow.
- Work through the domain-specific example.
- Complete one practice drill.
- Answer one scenario question.

## 90-Minute Pass

- Complete the hands-on lab.
- Write the debugging playbook in your own words.
- Fill the mastery checklist.
- Compare two architecture approaches.

## Review Cadence

- Day 1: define and explain.
- Day 3: solve a scenario.
- Day 7: teach it.
- Day 14: connect it to system design.
- Day 30: revisit with a production incident lens.
`,
    ],
    [
      "teaching-notes.md",
      `# Teaching Notes: ${subtopicName}

## Teach To A Beginner

Start with the problem ${subtopicName} solves. Avoid jargon until the learner can explain the basic behavior.

## Teach To An Intermediate Engineer

Focus on internal mechanisms, edge cases, and implementation patterns. Ask them to predict behavior before showing the answer.

## Teach To A Senior Engineer

Discuss production failure modes, observability, tests, and trade-offs. Ask what breaks at scale.

## Teach To A Staff Engineer

Discuss ownership, migration, compatibility, operational burden, cross-team contracts, and governance.

## Teaching Sequence

1. Concrete example.
2. Internal mechanism.
3. Edge case.
4. Production failure.
5. Architecture trade-off.
6. Interview framing.

## Check For Understanding

- Can they explain it without copying your words?
- Can they predict a failure?
- Can they debug a symptom?
- Can they choose between two designs?
`,
    ],
    [
      "real-interview-prompts.md",
      `# Real Interview Prompts: ${subtopicName}

## Warm-Up

"Explain ${subtopicName} and why it matters in ${category}."

## Deep Dive

"Walk me through the internal flow. What state exists before and after execution?"

## Coding Or Design

"Design a minimal implementation that handles invalid input, duplicated input, and one failure path."

## Production Debugging

"This works in staging but fails intermittently in production. What do you check first?"

## Scale-Up

"Traffic grows by 10x. What bottleneck appears first and how do you prove it?"

## Staff-Level

"Write the trade-off summary you would put in an RFC. Include ownership, rollback, observability, and when to revisit the decision."

## Follow-Up Challenges

- What hidden assumption did you make?
- What metric would validate your answer?
- What would you simplify?
- What would you refuse to build yet?
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
    const topicPath = join(categoryPath, numberedName(topicId, topicName, Boolean(categoryNumber)));
    mkdirSync(topicPath, { recursive: true });
    writeFileSync(join(topicPath, "README.md"), topicReadmeFor(category, categoryNumber, topicNumber, topicName, subtopics));

    for (const [subtopicIndex, subtopicName] of subtopics.entries()) {
      const subtopicNumber = subtopicIndex + 1;
      const id = categoryNumber ? `${categoryNumber}.${topicNumber}.${subtopicNumber}` : `${topicNumber}.${subtopicNumber}`;
      const subtopicPath = join(topicPath, numberedName(id, subtopicName, Boolean(categoryNumber)));
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
