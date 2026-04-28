# 001.03.03 Modules and Bundling Boundaries

Category: JavaScript Core

Topic: 001.03 Advanced Runtime Behavior

## 1. Definition

A JavaScript module is a file-level unit of code with its own scope, explicit imports, and explicit exports.

Bundling is the build-time process of combining, transforming, splitting, and optimizing modules for a target runtime such as a browser, Node.js, edge runtime, or test environment.

One-line version:

```txt
Modules define code boundaries; bundlers decide how those boundaries are packaged and loaded in production.
```

Expanded explanation:

- Modules prevent accidental global variables.
- Imports express dependencies.
- Exports define public API.
- ES modules use live bindings.
- CommonJS uses runtime `require` and exported values.
- Bundlers rewrite module graphs for performance, compatibility, and deployment.
- Bundle boundaries affect load time, caching, tree shaking, side effects, and runtime failures.

## 2. Why It Exists

Modules exist because large programs need encapsulation and dependency management.

Without modules:

- global names collide,
- load order becomes fragile,
- code ownership is unclear,
- dead code is harder to remove,
- dependency cycles are harder to detect,
- teams cannot safely expose stable APIs.

Bundling exists because production environments need optimized delivery:

- browsers should not download thousands of tiny files unnecessarily,
- old browsers may need transformed syntax,
- code should be split by route or feature,
- unused code should be removed,
- assets need hashing and caching,
- server and client code must be separated.

Senior-level reason:

Modules and bundling boundaries are architecture boundaries. They decide what code is public, what code is private, what ships to users, what runs on the server, what can be tree-shaken, and what breaks during deploys.

## 3. Syntax & Variants

### Named Export

```js
export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export const DEFAULT_LOCALE = "en-US";
```

### Named Import

```js
import { formatCurrency } from "./money.js";
```

### Default Export

```js
export default function createClient() {
  return {};
}
```

### Default Import

```js
import createClient from "./client.js";
```

### Namespace Import

```js
import * as money from "./money.js";
```

### Re-Export

```js
export { formatCurrency } from "./money.js";
export * from "./date.js";
```

### Dynamic Import

```js
const module = await import("./heavy-chart.js");
module.renderChart();
```

Dynamic import creates an async boundary and often a bundle split point.

### CommonJS

```js
const fs = require("node:fs");

module.exports = {
  readConfig,
};
```

CommonJS is still common in Node.js packages.

### Package Boundary

```json
{
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./server": "./dist/server.js"
  },
  "sideEffects": false
}
```

Package metadata affects resolution, tree shaking, and import paths.

## 4. Internal Working

### ES Module Loading

Simplified ESM lifecycle:

```txt
parse module
  -> discover static imports/exports
  -> build module dependency graph
  -> instantiate modules and create bindings
  -> evaluate modules in dependency order
  -> expose live bindings to importers
```

### Live Bindings

```js
// counter.js
export let count = 0;

export function increment() {
  count += 1;
}
```

```js
// app.js
import { count, increment } from "./counter.js";

console.log(count); // 0
increment();
console.log(count); // 1
```

Imports are live views of exported bindings, not copied snapshots.

### Module Scope

```js
const secret = "private";

export function getSecretLength() {
  return secret.length;
}
```

`secret` is private to the module.

### Module Cache

Modules are evaluated once per module instance and then cached by the runtime/bundler.

```js
console.log("module evaluated");
```

If imported by multiple files, this side effect usually runs once.

### Bundler Graph

Bundlers analyze imports to build a graph:

```txt
entrypoint
  -> route module
    -> component
      -> utility
      -> stylesheet
      -> asset
```

Then they transform and emit chunks.

### Tree Shaking

Tree shaking removes unused exports when the bundler can prove they are unused and safe to remove.

```js
export function used() {}
export function unused() {}
```

If only `used` is imported, `unused` may be removed.

### Side Effects

```js
import "./polyfill.js";
import "./global.css";
```

These imports are for side effects. Bundlers must not remove them accidentally.

## 5. Memory Behavior

Modules are long-lived. Module-level state usually lives for the lifetime of the runtime or page session.

```js
const cache = new Map();

export function getCached(key) {
  return cache.get(key);
}
```

This cache is shared by all importers of the module instance.

Memory implications:

- module caches can retain data forever,
- imported singletons are shared state,
- dynamic chunks load code into memory,
- large dependencies increase parse/compile memory,
- circular imports can retain partial module state,
- client bundles can keep route code resident after load depending on runtime behavior.

Avoid request-specific module globals in servers:

```js
let currentUser;

export function setCurrentUser(user) {
  currentUser = user;
}
```

This can leak state between requests in a Node process.

Better:

```js
export function createRequestContext(user) {
  return { user };
}
```

## 6. Execution Behavior

### Static Imports Run Before Module Body

```js
import "./setup.js";

console.log("app");
```

The dependency is loaded and evaluated before the importing module body runs.

### Top-Level Await

```js
const config = await loadConfig();

export { config };
```

Top-level await can delay evaluation of dependent modules.

Use carefully in shared libraries because it can slow startup or create dependency timing surprises.

### Dynamic Import Runs Later

```js
button.addEventListener("click", async () => {
  const { openModal } = await import("./modal.js");
  openModal();
});
```

The modal code may be split into a separate chunk and loaded on demand.

### Circular Dependency

```js
// a.js
import { b } from "./b.js";
export const a = "a";
console.log(b);
```

```js
// b.js
import { a } from "./a.js";
export const b = "b";
console.log(a);
```

Circular dependencies can expose uninitialized bindings or partial state depending on evaluation order.

### CommonJS Interop

ESM and CommonJS interop can be tricky because they have different loading and export models.

```js
import pkg from "commonjs-package";
```

Default import behavior may depend on transpiler/bundler configuration.

## 7. Scope & Context Interaction

Modules create module scope.

```js
const privateValue = 1;

export const publicValue = 2;
```

`privateValue` is not global. `publicValue` is available only through imports.

### Boundary Ownership

A module boundary is an ownership boundary:

```txt
internal implementation
  -> exported API
  -> consumers
```

Changing internal code should be safe. Changing exports can break consumers.

### Server vs Client Boundary

Frontend frameworks often separate server-only and client-safe modules.

Bad:

```js
// accidentally imported by browser code
import { readFileSync } from "node:fs";
```

Server-only modules must not cross into client bundles.

### Request Context

Module scope is not request scope.

```js
const userIds = [];

export function recordUser(id) {
  userIds.push(id);
}
```

This array is shared globally in the module instance.

## 8. Common Examples

### Utility Module

```js
// math.js
export function add(a, b) {
  return a + b;
}
```

```js
import { add } from "./math.js";
```

### Barrel File

```js
export { Button } from "./Button.js";
export { Modal } from "./Modal.js";
```

Barrels simplify imports but can hurt tree shaking if they re-export side-effectful modules carelessly.

### Lazy Route Loading

```js
const SettingsPage = lazy(() => import("./SettingsPage.js"));
```

Used to split rarely visited route code from the initial bundle.

### Package Public API

```js
export { createClient } from "./client.js";
export { ValidationError } from "./errors.js";
```

Keep public exports intentional and stable.

### Side-Effect Import

```js
import "./styles.css";
import "./polyfills.js";
```

Make side effects explicit so bundler behavior is predictable.

## 9. Confusing / Tricky Examples

### Import Is Not Copy

```js
import { count } from "./counter.js";
```

`count` is a live binding, not a copied value.

### Cannot Reassign Imported Binding

```js
import { count } from "./counter.js";

count = 10; // TypeError
```

Imported bindings are read-only from the importing module.

### Default Export Naming

```js
export default function user() {}
```

Importer can choose any local name:

```js
import anything from "./user.js";
```

This can reduce clarity compared to named exports.

### Circular Import TDZ

Circular modules can hit temporal dead zone errors when a binding is read before initialization.

### Tree Shaking Can Fail

Tree shaking may fail when:

- code uses CommonJS,
- modules have unknown side effects,
- package metadata is wrong,
- dynamic import paths are too broad,
- barrel files import too much.

### Dynamic Import Path Explosion

```js
import(`./pages/${name}.js`);
```

Bundlers may include many possible files because the path is dynamic.

## 10. Real Production Use Cases

### Initial Bundle Performance

Large initial bundles slow:

- download,
- parse,
- compile,
- hydration,
- interaction readiness.

### Code Splitting

Split code by:

- route,
- feature,
- admin-only surfaces,
- heavy charts/editors,
- rarely used integrations.

### Monorepo Boundaries

Packages should expose stable public APIs and avoid deep imports:

```js
import { Button } from "@company/ui";
```

Avoid:

```js
import Button from "@company/ui/src/internal/Button";
```

### Dependency Governance

Bundling exposes dependency costs:

- duplicate versions,
- heavy transitive packages,
- accidental server-only imports,
- polyfill bloat,
- side-effectful modules.

### SSR / Hydration

Server and client bundles differ. Code that touches `window` at module top level can crash SSR.

```js
const width = window.innerWidth; // SSR crash
```

Better:

```js
function getWidth() {
  return typeof window === "undefined" ? 0 : window.innerWidth;
}
```

## 11. Interview Questions

1. What is a JavaScript module?
2. What is module scope?
3. What is the difference between ESM and CommonJS?
4. What are live bindings?
5. Why are imported bindings read-only?
6. What is a circular dependency?
7. What is tree shaking?
8. What are side-effect imports?
9. What is code splitting?
10. How does dynamic import affect bundles?
11. Why can barrel files hurt tree shaking?
12. What is top-level await?
13. Why can module-level state be dangerous in Node servers?
14. How do server/client boundaries affect bundling?
15. How would you debug a production bundle-size regression?

## 12. Senior-Level Pitfalls

### Pitfall 1: Module-Level Request State

```js
let currentTenant;
```

In a server process, this is shared across requests.

### Pitfall 2: Accidental Client Bundle Bloat

```js
import { everything } from "huge-library";
```

Use targeted imports and verify bundle output.

### Pitfall 3: Wrong `sideEffects` Metadata

Marking a package as side-effect-free when it imports CSS or polyfills can break production.

### Pitfall 4: Circular Dependency Hidden By Tests

Tests may load modules in a different order than production bundles.

### Pitfall 5: Deep Imports Into Internals

Deep imports couple consumers to file layout and bypass package API governance.

### Pitfall 6: SSR-Unsafe Module Top Level

Accessing browser globals at module top level breaks server rendering.

## 13. Best Practices

- Prefer ES modules for modern application code.
- Keep module public APIs small and intentional.
- Avoid request-specific module globals.
- Use named exports for clearer refactoring in shared code.
- Avoid circular dependencies.
- Use dynamic import for heavy or rarely used code.
- Verify bundle analysis before and after dependency changes.
- Mark package side effects accurately.
- Keep server-only code out of client bundles.
- Avoid top-level browser globals in SSR-capable code.
- Use package `exports` to define supported import paths.
- Treat module boundaries as team and architecture boundaries.

## 14. Debugging Scenarios

### Scenario 1: Client Bundle Suddenly Grows

Debugging steps:

1. Run bundle analyzer.
2. Compare before/after dependency graph.
3. Look for duplicate package versions.
4. Check barrel imports.
5. Check dynamic import patterns.
6. Verify tree shaking and side effects.

### Scenario 2: SSR Crashes With `window is not defined`

Cause: browser global used at module top level.

Fix:

```js
if (typeof window !== "undefined") {
  // browser-only logic
}
```

Or move the code into a client-only boundary.

### Scenario 3: Imported Value Is Unexpected During Cycle

Likely cause: circular dependency and evaluation order.

Fix:

- extract shared constants to a third module,
- invert dependency,
- move side effects out of module top level,
- use functions to defer access.

### Scenario 4: CSS Missing In Production

Likely cause: package marked `sideEffects: false` while CSS imports were treated as removable.

Fix: configure side effects correctly.

### Scenario 5: Node Server Leaks Tenant State

```js
let tenantConfig;
```

Fix: pass request context explicitly or use a scoped context mechanism.

### Scenario 6: Dynamic Import 404 After Deploy

Likely cause: stale HTML references old chunk names or CDN cache mismatch.

Fix:

- use content-hashed assets,
- deploy HTML and chunks safely,
- configure CDN caching correctly,
- support old chunks during rolling deploys.

## 15. Exercises / Practice

### Exercise 1

Explain the difference between module scope and global scope.

### Exercise 2

Predict behavior with live bindings:

```js
// counter.js
export let count = 0;
export function inc() {
  count += 1;
}
```

```js
// app.js
import { count, inc } from "./counter.js";
inc();
console.log(count);
```

### Exercise 3

Refactor a circular dependency by extracting shared code into a third module.

### Exercise 4

Identify which imports are side-effect imports:

```js
import "./styles.css";
import { Button } from "./Button.js";
import "./polyfill.js";
```

### Exercise 5

Design a code-splitting plan for an admin dashboard with heavy charts.

### Exercise 6

Review a package `exports` field and decide which imports should be public.

## 16. Comparison

### ESM vs CommonJS

| Area | ESM | CommonJS |
|---|---|---|
| Syntax | `import` / `export` | `require` / `module.exports` |
| Analysis | static imports analyzable | runtime loading flexible |
| Bindings | live bindings | exported values/objects |
| Browser support | native modern browsers | bundler/transpiler needed |
| Tree shaking | generally better | harder |

### Static Import vs Dynamic Import

| Import Type | Loaded | Use For |
|---|---|---|
| Static `import` | during module loading | required dependencies |
| Dynamic `import()` | at runtime | lazy features, code splitting |

### Module State vs Request State

| State Type | Lifetime | Risk |
|---|---|---|
| Module state | runtime/module instance | shared across requests/users |
| Request state | one request/workflow | must be passed or scoped |

### Tree Shaking vs Code Splitting

| Optimization | Goal |
|---|---|
| Tree shaking | remove unused code |
| Code splitting | load code later or separately |

## 17. Related Concepts

Prerequisites:

- Scope, Closures, and Hoisting
- Prototypes and Object Model
- Event Loop and Tasks

Direct follow-ups:

- Build Tools
- Webpack / Vite / Nx
- SSR / CSR / SSG / Hydration
- Package Management
- Monorepo Architecture
- Frontend Architecture

Production connections:

- bundle size budgets,
- CDN caching,
- SSR safety,
- dependency governance,
- public package APIs,
- lazy loading,
- side-effect management,
- rolling deploy chunk compatibility.

Knowledge graph:

```txt
Module
  -> imports / exports
  -> dependency graph
    -> bundler
      -> chunks
      -> tree shaking
      -> side effects
      -> runtime boundaries
```

## Advanced Add-ons

### Performance Impact

Modules and bundles affect:

- initial JavaScript size,
- parse time,
- compile time,
- hydration time,
- route transition latency,
- cache efficiency,
- memory usage,
- build time.

Measure:

- bundle analyzer output,
- unused JavaScript,
- chunk count,
- long tasks,
- Core Web Vitals,
- dependency duplication,
- server cold-start time.

### System Design Relevance

Module boundaries are architecture boundaries.

Questions:

- What is public API vs internal implementation?
- Which module owns this dependency?
- Can this code run on server, client, edge, or worker?
- What is the deployment and cache boundary?
- What happens during rolling deploys?
- How are breaking changes communicated?

### Security Impact

Risks:

- accidentally bundling server secrets into client code,
- dependency confusion,
- unsafe package entry points,
- supply-chain compromise,
- prototype pollution dependencies,
- exposing internal APIs through public exports.

Defenses:

- audit bundles for secrets,
- restrict public exports,
- pin/verify dependencies,
- use lockfiles,
- separate server/client modules,
- review transitive dependencies.

### Browser vs Node Behavior

Browser:

- ESM can load natively,
- bundlers optimize for download and execution,
- dynamic imports fetch chunks,
- client bundles must not include Node-only APIs.

Node.js:

- supports both ESM and CommonJS with rules,
- package `type` and `exports` matter,
- module cache affects singleton state,
- dynamic import returns a promise,
- interop can be surprising.

### Polyfill / Implementation

You cannot polyfill the whole module loader perfectly in userland, but bundlers implement module runtimes.

Simplified module registry:

```js
const modules = {};
const cache = {};

function define(id, factory) {
  modules[id] = factory;
}

function requireModule(id) {
  if (cache[id]) return cache[id].exports;

  const module = { exports: {} };
  cache[id] = module;
  modules[id](module, module.exports, requireModule);
  return module.exports;
}
```

Staff-level takeaway: modules are not just file organization. They shape runtime behavior, bundle cost, ownership, public API, deployment safety, and production reliability.

## 18. Summary

Modules and bundling boundaries define how JavaScript code is organized, shared, optimized, and shipped.

Remember:

- ES modules have module scope and explicit imports/exports,
- imports are live bindings,
- imported bindings are read-only to consumers,
- modules are evaluated and cached,
- module-level state is long-lived,
- CommonJS and ESM have different semantics,
- bundlers build dependency graphs,
- tree shaking removes provably unused code,
- dynamic import enables lazy loading and code splitting,
- side effects must be declared accurately,
- circular dependencies create evaluation-order bugs,
- server/client boundaries must be enforced,
- bundle boundaries affect performance, security, deploy safety, and architecture.
