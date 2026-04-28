# 001.03.02 Memory and Garbage Collection

Category: JavaScript Core

Topic: 001.03 Advanced Runtime Behavior

## 1. Definition

Memory management is how JavaScript allocates, retains, and releases memory for values, objects, functions, closures, buffers, DOM nodes, and runtime metadata.

Garbage collection is the automatic process where the JavaScript engine reclaims memory that is no longer reachable from active roots.

One-line version:

```txt
JavaScript allocates memory as your program creates values, and the garbage collector frees memory when those values are no longer reachable.
```

Expanded explanation:

- Primitive values are small immutable values.
- Objects, arrays, functions, maps, sets, buffers, promises, and DOM references can live on the heap.
- References keep values reachable.
- Reachable values cannot be collected.
- Unreachable values are eligible for garbage collection.
- Garbage collection is automatic, but memory leaks are still possible.

Key idea:

```txt
Memory leak in garbage-collected JavaScript usually means "still reachable but no longer useful."
```

## 2. Why It Exists

JavaScript needs memory management because programs constantly create temporary and long-lived values.

Garbage collection exists so developers do not manually call `free` or `delete` for most memory.

Problems solved:

- local variables can disappear after function execution,
- temporary objects can be reclaimed,
- closures can safely retain needed state,
- async callbacks can keep needed context,
- engines can optimize allocation and collection automatically.

But automatic memory management does not remove responsibility.

Senior-level reason:

Production JavaScript memory issues often come from retained references, unbounded caches, event listeners, intervals, closure retention, DOM leaks, global state, unresolved promises, large buffers, and poor cleanup. Understanding GC lets you debug memory growth instead of guessing.

## 3. Syntax & Variants

You do not usually invoke garbage collection manually. You influence memory by how you create and retain references.

### Object Allocation

```js
const user = { id: 1, name: "Ajay" };
```

Creates an object and stores a reference in `user`.

### Array Allocation

```js
const items = new Array(1000).fill(null);
```

Allocates an array and its elements.

### Function And Closure Allocation

```js
function createReader(data) {
  return function read() {
    return data.id;
  };
}
```

The returned function can retain `data`.

### Explicit Reference Removal

```js
let cache = loadLargeObject();

cache = null;
```

Setting a reference to `null` does not force GC, but it can make the object unreachable if no other references exist.

### Weak References

```js
const metadata = new WeakMap();

metadata.set(domNode, { createdAt: Date.now() });
```

WeakMap keys do not prevent garbage collection.

### FinalizationRegistry

```js
const registry = new FinalizationRegistry((id) => {
  console.log("collected", id);
});
```

This is advanced and should not be used for core business logic because finalization timing is not guaranteed.

### Node Memory Flags

```bash
node --max-old-space-size=4096 app.js
```

This increases the old-space heap limit, but it does not fix leaks.

## 4. Internal Working

Modern JavaScript engines usually use reachability-based garbage collection.

Mental model:

```txt
Start from roots
  -> global objects
  -> current call stack
  -> active closures
  -> pending callbacks
  -> module variables
  -> DOM/native references
  -> mark everything reachable
  -> collect unreachable objects
```

### Roots

Roots are starting points for reachability.

Examples:

- global variables,
- active stack frames,
- module-scope variables,
- pending timers,
- event listeners,
- promise reactions,
- DOM references,
- native runtime handles.

### Mark And Sweep

Simplified flow:

```txt
mark phase:
  find all reachable objects

sweep phase:
  reclaim unreachable objects
```

### Generational GC

Many engines separate objects by age.

```txt
new space / young generation:
  short-lived objects

old space / old generation:
  objects that survived collections
```

This works because many objects die young.

### Incremental And Concurrent GC

Engines try to reduce pause time by doing parts of GC incrementally or concurrently, but GC can still affect latency.

### Reachability Example

```js
let user = { name: "Ajay" };
const list = [user];

user = null;
```

The object is still reachable through `list[0]`.

```txt
list -> object { name: "Ajay" }
```

## 5. Memory Behavior

### Stack vs Heap

Call stack:

- active function frames,
- local execution state,
- return positions.

Heap:

- objects,
- arrays,
- functions,
- closures,
- strings,
- maps,
- sets,
- buffers,
- engine metadata.

Example:

```js
function run() {
  const count = 1;
  const user = { name: "Ajay" };
}
```

`count` is primitive local state. `user` references a heap object.

### Retained References

```js
const handlers = [];

function register(data) {
  handlers.push(() => data.id);
}
```

Every handler retains `data`.

### Unbounded Cache

```js
const cache = new Map();

function getUser(id) {
  if (!cache.has(id)) {
    cache.set(id, loadUser(id));
  }

  return cache.get(id);
}
```

If `id` cardinality grows forever, memory grows forever.

### DOM Leaks

```js
const detachedNodes = [];

function removeNode(node) {
  node.remove();
  detachedNodes.push(node);
}
```

The DOM node is removed from the document but still reachable from JavaScript.

### Buffer Memory

In Node.js, buffers and native resources can contribute to memory pressure beyond ordinary JS object graphs.

```js
const buffer = Buffer.alloc(100 * 1024 * 1024);
```

Watch RSS as well as heap metrics.

## 6. Execution Behavior

Allocation happens during normal code execution.

Garbage collection happens automatically when the engine decides it is needed.

Important behavior:

- GC timing is nondeterministic.
- You cannot rely on exactly when collection happens.
- GC can introduce pauses.
- More allocation pressure can trigger more frequent GC.
- Long-lived references promote objects into older generations.

Example:

```js
function createTemporaryObjects() {
  for (let i = 0; i < 100000; i += 1) {
    const item = { index: i };
    use(item);
  }
}
```

Most `item` objects are short-lived and likely collected efficiently.

Leak behavior:

```js
const retained = [];

function createLeakingObjects() {
  for (let i = 0; i < 100000; i += 1) {
    retained.push({ index: i });
  }
}
```

Objects stay reachable through `retained`.

## 7. Scope & Context Interaction

Scope and closures strongly affect memory.

### Function Scope

```js
function run() {
  const value = { id: 1 };
}
```

After `run` returns, `value` can be collected if nothing else references it.

### Closure Retention

```js
function createHandler(data) {
  return function handler() {
    return data.id;
  };
}
```

If `handler` is retained, `data` is retained.

### Async Retention

```js
async function process(data) {
  await saveMetadata(data.id);
  return data.payload.length;
}
```

`data` may be retained across the `await`.

### Module Scope

```js
const registry = new Map();
```

Module-scope collections live for the lifetime of the module instance unless cleared.

### `this` Retention

```js
class Controller {
  constructor(largeState) {
    this.largeState = largeState;
  }

  register() {
    window.addEventListener("click", this.handleClick.bind(this));
  }
}
```

The bound function can retain the controller instance and all of `largeState`.

## 8. Common Examples

### Good Cleanup For Timer

```js
function startPolling() {
  const id = setInterval(refresh, 1000);

  return function stopPolling() {
    clearInterval(id);
  };
}
```

### Good Cleanup For Event Listener

```js
function mount(button) {
  function onClick() {
    console.log("clicked");
  }

  button.addEventListener("click", onClick);

  return () => button.removeEventListener("click", onClick);
}
```

### Bounded Cache

```js
class LruCache {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map();
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }

    this.map.set(key, value);

    if (this.map.size > this.limit) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}
```

### WeakMap Metadata

```js
const metadata = new WeakMap();

function attachMetadata(node, data) {
  metadata.set(node, data);
}
```

When `node` is unreachable elsewhere, the WeakMap entry does not keep it alive.

### Avoid Capturing Whole Object

```js
function schedule(user) {
  const userId = user.id;

  setTimeout(() => {
    audit(userId);
  }, 1000);
}
```

Capture the small stable value instead of the full object.

## 9. Confusing / Tricky Examples

### `delete` Does Not Force GC

```js
delete object.property;
```

This removes a property. It does not immediately collect memory, and it may hurt object-shape performance.

### `null` Does Not Force GC

```js
value = null;
```

This removes one reference. Collection happens only if the object becomes unreachable and the engine decides to run GC.

### Detached DOM Node

```js
let node = document.querySelector("#modal");
node.remove();
```

If `node` remains referenced, the DOM subtree may remain in memory.

### WeakMap Keys Must Be Objects

```js
const weak = new WeakMap();

weak.set("id", {}); // TypeError
```

WeakMap keys must be objects or non-registered symbols.

### Promise Retention

```js
let resolvePromise;

const promise = new Promise((resolve) => {
  resolvePromise = resolve;
});
```

If this promise and its reactions remain reachable, closed-over values can remain reachable too.

### DevTools Can Retain Objects

Objects logged in the console or selected in DevTools may stay reachable during debugging, making memory behavior look different.

## 10. Real Production Use Cases

### Browser SPAs

Common leaks:

- unremoved event listeners,
- stale intervals,
- retained DOM nodes,
- large client-side caches,
- WebSocket handlers retaining state,
- route transitions not cleaning subscriptions.

### Node.js APIs

Common leaks:

- module-level maps,
- per-request data stored globally,
- unbounded queues,
- response objects retained after completion,
- buffers retained in closures,
- logging contexts stored forever.

### React / Angular

Memory issues often come from:

- missing effect cleanup,
- subscriptions not unsubscribed,
- services retaining component references,
- closures over large props,
- cached observables without lifecycle control.

### Realtime Systems

WebSocket sessions must clean up:

- connection references,
- room membership,
- timers,
- heartbeat intervals,
- buffered messages,
- user presence state.

### Caches

Every cache needs:

- max size,
- TTL or invalidation,
- ownership,
- metrics,
- memory budget,
- clear behavior during deploys or tenant changes.

## 11. Interview Questions

1. How does JavaScript garbage collection work at a high level?
2. What does "reachable" mean?
3. What are GC roots?
4. What is a memory leak in garbage-collected JavaScript?
5. How can closures cause memory leaks?
6. How can event listeners cause memory leaks?
7. What is a detached DOM node?
8. What is the difference between `Map` and `WeakMap` for memory?
9. Does setting a variable to `null` force GC?
10. Why can unbounded caches leak memory?
11. How do you debug memory growth in Node.js?
12. How do you debug memory growth in the browser?
13. What is heap snapshot analysis?
14. What is RSS in Node.js?
15. How can async functions retain memory across `await`?

## 12. Senior-Level Pitfalls

### Pitfall 1: Treating GC As Leak Prevention

GC collects unreachable objects. It does not know whether reachable objects are still useful.

### Pitfall 2: Unbounded Maps

```js
const sessions = new Map();
```

Without cleanup, TTL, or lifecycle ownership, this can grow forever.

### Pitfall 3: Missing Listener Cleanup

```js
window.addEventListener("resize", handler);
```

If `handler` closes over component state and is never removed, memory grows after route changes.

### Pitfall 4: Retaining Request Objects

```js
logs.push(() => req);
```

This can retain headers, auth data, body, sockets, and user data.

### Pitfall 5: Only Watching Heap

Node memory pressure may appear in RSS, external memory, buffers, or native handles, not only JS heap.

### Pitfall 6: Increasing Heap Limit Instead Of Fixing Leak

`--max-old-space-size` can delay a crash, but it does not solve retained references.

## 13. Best Practices

- Keep object lifetimes clear.
- Capture only the data a closure needs.
- Clean up timers, intervals, listeners, subscriptions, and sockets.
- Bound caches by size and/or time.
- Prefer `WeakMap` for metadata keyed by objects.
- Avoid storing request-specific data in module globals.
- Monitor memory over time, not only at one point.
- Use heap snapshots to inspect retainers.
- Watch Node heap, RSS, and external memory.
- Avoid deep cloning large objects unless necessary.
- Document cache ownership and invalidation.
- Treat memory as a production SLO for long-running processes.

## 14. Debugging Scenarios

### Scenario 1: Browser Memory Grows After Route Changes

Likely causes:

- unremoved event listeners,
- intervals still running,
- subscriptions still active,
- detached DOM nodes,
- cached component data.

Debugging steps:

1. Take heap snapshot after initial load.
2. Navigate repeatedly.
3. Force GC from DevTools if available.
4. Take another snapshot.
5. Compare retained objects and inspect retainers.
6. Add cleanup on unmount/destroy.

### Scenario 2: Node Process RSS Keeps Growing

Likely causes:

- unbounded cache,
- buffers,
- native/external memory,
- request objects retained,
- queues growing faster than workers process.

Debugging steps:

1. Track heap used, heap total, RSS, and external memory.
2. Capture heap snapshots.
3. Inspect top retainers.
4. Check queue/cache cardinality.
5. Reproduce with load test.
6. Add bounds and cleanup.

### Scenario 3: Cache Leaks Per Tenant

```js
const cache = new Map();

function getTenantConfig(tenantId) {
  if (!cache.has(tenantId)) {
    cache.set(tenantId, loadConfig(tenantId));
  }

  return cache.get(tenantId);
}
```

Fix:

- add max size,
- add TTL,
- clear on tenant deletion,
- expose metrics,
- document owner.

### Scenario 4: Event Listener Retains Large State

```js
function mount(state) {
  window.addEventListener("scroll", () => {
    update(state.largeTree);
  });
}
```

Fix:

```js
function mount(state) {
  const treeId = state.largeTree.id;

  function onScroll() {
    update(treeId);
  }

  window.addEventListener("scroll", onScroll);

  return () => window.removeEventListener("scroll", onScroll);
}
```

### Scenario 5: Promise Batch Uses Too Much Memory

```js
await Promise.all(items.map(processItem));
```

If `items` is huge, this creates many promises and closures at once.

Fix: process with bounded concurrency.

## 15. Exercises / Practice

### Exercise 1

Explain which objects are reachable:

```js
let user = { name: "Ajay" };
const list = [user];
user = null;
```

### Exercise 2

Find the leak:

```js
const handlers = [];

function register(req) {
  handlers.push(() => req.user.id);
}
```

### Exercise 3

Refactor this cache to include a max size:

```js
const cache = new Map();
```

### Exercise 4

Explain why this can leak:

```js
setInterval(() => refresh(data), 1000);
```

### Exercise 5

Choose `Map` or `WeakMap`:

- metadata for DOM nodes,
- cache by string user ID,
- temporary metadata for object instances,
- tenant configuration cache.

### Exercise 6

Design a memory debugging plan for a Node service that grows from 300 MB to 2 GB over six hours.

## 16. Comparison

### Reachable vs Useful

| State | Meaning |
|---|---|
| Reachable | GC must keep it |
| Useful | Application still needs it |

Leaks are often reachable but no longer useful.

### `Map` vs `WeakMap`

| Structure | Key Type | Prevents Key GC? | Iterable |
|---|---|---:|---:|
| `Map` | any value | yes | yes |
| `WeakMap` | objects / non-registered symbols | no | no |

### Stack vs Heap

| Area | Stores | Lifetime |
|---|---|---|
| Stack | active call frames | until function returns/throws |
| Heap | objects and dynamic data | while reachable |

### Leak vs High Legitimate Usage

| Pattern | Interpretation |
|---|---|
| memory rises then plateaus | may be cache/warmup |
| memory rises forever | likely leak or unbounded workload |
| memory spikes then falls | temporary allocation pressure |
| RSS grows but heap stable | check buffers/native/external memory |

## 17. Related Concepts

Prerequisites:

- Variables & Declarations
- Scope, Closures, and Hoisting
- Call Stack
- Promises and Async/Await

Direct follow-ups:

- JavaScript Internals: Heap Layout
- JavaScript Internals: Garbage Collection
- Leaks and Retainers
- Node.js Memory Leaks
- Performance Profiling
- Observability

Production connections:

- frontend route leaks,
- Node heap growth,
- cache design,
- WebSocket session cleanup,
- background queue pressure,
- browser long sessions,
- server memory limits,
- incident debugging.

Knowledge graph:

```txt
Allocation
  -> references
    -> reachability
      -> garbage collection
        -> retained objects
          -> leaks
          -> heap snapshots
          -> production memory limits
```

## Advanced Add-ons

### Performance Impact

Memory pressure affects latency and stability.

Impacts:

- more frequent GC,
- longer GC pauses,
- higher CPU,
- browser jank,
- Node latency spikes,
- container OOM kills,
- degraded cache behavior.

Metrics:

- heap used,
- heap total,
- RSS,
- external memory,
- GC pause duration,
- allocation rate,
- object count by type,
- cache size,
- queue depth.

### System Design Relevance

Memory design is system design for long-running JavaScript processes.

Design questions:

- What grows with users, tenants, connections, requests, or messages?
- What is the memory budget?
- What gets evicted?
- Who owns cleanup?
- What happens during traffic spikes?
- What happens when a worker restarts?
- What dashboards expose memory pressure?

### Security Impact

Memory bugs can become availability and privacy issues.

Risks:

- denial of service through large payloads,
- memory exhaustion via unbounded queues,
- retained PII in closures or logs,
- session data leaking across requests,
- heap snapshots containing secrets,
- stale authorization state retained in caches.

Defenses:

- payload limits,
- bounded queues/caches,
- cleanup sensitive data,
- secure heap snapshot handling,
- tenant-aware cache keys,
- least retention of secrets.

### Browser vs Node Behavior

Browser:

- DOM references can leak detached nodes,
- DevTools heap snapshots show retainers,
- long-lived tabs expose leaks,
- Web Workers have separate memory contexts,
- browser may throttle background pages.

Node.js:

- long-running processes amplify leaks,
- `process.memoryUsage()` exposes heap/RSS/external metrics,
- buffers can live outside ordinary heap accounting,
- containers can OOM-kill the process,
- heap snapshots and CPU profiles are essential debugging tools.

### Polyfill / Implementation

You cannot implement garbage collection in application JavaScript. It is engine behavior.

You can implement memory-safe patterns:

Bounded cache:

```js
function createBoundedMap(limit) {
  const map = new Map();

  return {
    set(key, value) {
      if (map.has(key)) map.delete(key);
      map.set(key, value);

      if (map.size > limit) {
        map.delete(map.keys().next().value);
      }
    },
    get(key) {
      return map.get(key);
    },
  };
}
```

Cleanup wrapper:

```js
function listen(target, event, handler) {
  target.addEventListener(event, handler);
  return () => target.removeEventListener(event, handler);
}
```

Staff-level takeaway: GC is automatic reclamation, not automatic lifecycle design. You still own references, cleanup, bounds, and observability.

## 18. Summary

Memory and garbage collection are core production JavaScript topics.

Remember:

- JavaScript collects unreachable objects automatically,
- reachable does not mean useful,
- leaks happen when unused objects remain reachable,
- closures, timers, listeners, maps, promises, DOM nodes, and buffers commonly retain memory,
- `null` and `delete` do not force GC,
- `WeakMap` helps attach metadata without preventing key collection,
- every cache needs bounds and ownership,
- browser and Node memory debugging use heap snapshots and retainer analysis,
- Node memory pressure includes heap, RSS, and external memory,
- senior engineers design cleanup and memory budgets before incidents happen.
