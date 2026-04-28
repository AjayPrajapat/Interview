# 📘 002.03 Memory Internals

> Memory internals explain why JavaScript feels automatic until heap growth, GC pauses, retained closures, Buffers, or browser DOM leaks become production incidents.

---

# 🧠 1. Overview

Memory Internals is the study of how JavaScript runtimes allocate, retain, move, and release memory.

It matters because JavaScript developers do not manually call `free()`, but they still control:

- what gets allocated,
- how often it gets allocated,
- what remains reachable,
- how long objects survive,
- how much work garbage collection must do,
- and whether memory pressure becomes latency, crashes, or user-facing slowness.

Where it is used:

- Frontend: SPA memory leaks, detached DOM nodes, long sessions, chart/table memory, Web Worker data transfer.
- Backend: Node heap growth, RSS vs `heapUsed`, Buffer/external memory, request payload retention, worker OOMs.
- System Design: cache sizing, streaming vs buffering, workload isolation, payload limits, capacity planning, observability.

---

# 🧩 2. Topic Breakdown (Table)

| Subtopic | Description | Difficulty |
| --- | --- | --- |
| Heap Layout | How objects, arrays, strings, closures, code, metadata, young space, old space, and external memory are organized. | Medium |
| Garbage Collection | How runtimes find unreachable objects, collect young/old generations, compact memory, and trade throughput for pause time. | Hard |
| Leaks and Retainers | How reachable object graphs accidentally stay alive through caches, closures, listeners, timers, DOM nodes, and queues. | Hard |

---

# 🚀 3. Learning Path

- Step 1: Learn heap vs stack, object reachability, shallow size, retained size, and Node memory metrics.
- Step 2: Learn generational GC, minor/major collection, promotion, mark/sweep/compact, and pause behavior.
- Step 3: Learn heap snapshots, dominators, retainer paths, detached DOM nodes, cache leaks, and production OOM debugging.
- Step 4: Connect memory to architecture: bounded caches, streaming, backpressure, worker isolation, and memory SLOs.

---

# 🔥 4. Key Concepts (Quick Understanding)

- Heap: where dynamically allocated objects live.
- Stack: active execution frames and short-lived execution state.
- GC root: a starting point for reachability, such as globals, stack variables, closures, module records, timers, and native handles.
- Reachability: an object is alive if it can be reached from a root.
- Shallow size: memory used by one object itself.
- Retained size: memory that would be freed if that object were removed.
- Young generation: area optimized for newly allocated, short-lived objects.
- Old generation: area for objects that survive long enough to become long-lived.
- Promotion: movement from young to old generation.
- Leak: memory that is no longer useful but still reachable.
- External memory: memory outside the JS heap but associated with JS objects, such as Node Buffers or ArrayBuffers.

Analogy:

- Think of heap memory like a warehouse.
- GC roots are people holding item tags.
- If an item can be reached by following tags, the cleaner must keep it.
- If nobody can reach it, the cleaner can remove it.
- A leak is not "forgotten garbage"; it is garbage that still has a tag pointing to it.

---

# 🏗️ 5. How It Works Internally

Simplified runtime memory flow:

```text
Code allocates object
  -> object enters heap
  -> reference is stored somewhere
  -> GC starts from roots
  -> reachable graph is marked alive
  -> unreachable memory is reclaimed
  -> survivors may be promoted or compacted
```

Generational model:

```text
New object
  -> young generation
  -> dies quickly: cheap collection
  -> survives: promoted to old generation
  -> old generation grows: more expensive major GC
```

Heap snapshot mental model:

```text
Root
  -> module cache
    -> Map
      -> user payload
        -> huge nested graph
```

The important debugging question is not "where was this object created?" It is:

- "Who still retains it?"

---

# ⚙️ 6. Practical Examples

## Simple Allocation

```ts
const user = {
  id: "u1",
  name: "Ava",
};
```

The object is allocated on the heap and remains alive while reachable.

## Closure Retention

```ts
function createReader(payload: BigPayload) {
  return function read() {
    return payload.id;
  };
}
```

The returned function keeps `payload` alive through its lexical environment.

## Unbounded Cache

```ts
const cache = new Map<string, Result>();

export async function getResult(key: string) {
  if (!cache.has(key)) {
    cache.set(key, await compute(key));
  }

  return cache.get(key)!;
}
```

Production risk:

- memory grows with key cardinality,
- objects promote to old generation,
- process eventually hits OOM.

Safer direction:

```ts
const cache = new LruCache<string, Result>({
  max: 10_000,
  ttlMs: 300_000,
});
```

## Node Memory Metrics

```ts
setInterval(() => {
  const memory = process.memoryUsage();

  console.log({
    heapUsedMb: memory.heapUsed / 1024 / 1024,
    rssMb: memory.rss / 1024 / 1024,
    externalMb: memory.external / 1024 / 1024,
    arrayBuffersMb: memory.arrayBuffers / 1024 / 1024,
  });
}, 30_000);
```

---

# 🧠 7. Advanced Concepts

- Generational hypothesis: most objects die young.
- Stop-the-world pauses: some GC phases pause JavaScript execution.
- Incremental marking: GC work is split into smaller pieces.
- Concurrent marking/sweeping: some GC work can happen off the main execution thread.
- Compaction: moving objects to reduce fragmentation.
- Write barriers: bookkeeping needed when old objects reference young objects.
- Weak references: references that do not keep targets alive.
- FinalizationRegistry: cleanup notification mechanism, not deterministic resource management.
- External memory pressure: RSS can grow even when JS heap looks healthy.
- Detached DOM trees: browser nodes removed from the document but retained by JS.

---

# ⚠️ 8. Common Mistakes

- Assuming garbage collection prevents all memory leaks.
- Looking only at `heapUsed` and ignoring RSS/external memory.
- Using unbounded `Map` caches.
- Keeping request payloads in module globals.
- Capturing large objects in long-lived closures.
- Forgetting to remove event listeners and timers.
- Loading entire files/datasets instead of streaming.
- Treating WeakMap values as weak.
- Taking one heap snapshot and guessing instead of comparing snapshots.
- Increasing heap size to hide a leak.

---

# 🧨 9. Tricky Interview Scenarios

## Scenario 1: Closure Leak

```ts
function makeHandler(payload: BigPayload) {
  return () => payload.items.length;
}
```

Question:

- Why can `payload` remain alive after `makeHandler` returns?

Answer:

- The returned function closes over the binding that references `payload`.

## Scenario 2: RSS vs Heap

```text
heapUsed: 300 MB
rss: 1.8 GB
external: 1.2 GB
```

Question:

- Is this necessarily a JS object leak?

Answer:

- No. Investigate Buffers, ArrayBuffers, native modules, compression/image libraries, allocator fragmentation, and container limits.

## Scenario 3: WeakMap

```ts
const weak = new WeakMap<object, LargeValue>();
weak.set(key, largeValue);
```

Question:

- Is `largeValue` weak?

Answer:

- No. The key is weak. If the key remains reachable, the value remains reachable.

---

# 🏭 10. Production Use Cases

## React / Angular

- Detect detached DOM nodes.
- Clean up subscriptions, timers, observers, and listeners.
- Avoid retaining route/component state after navigation.
- Virtualize large lists and tables.
- Avoid duplicating large transformed datasets in memory.

## Node.js / APIs

- Bound caches and queues.
- Stream large request/response bodies.
- Monitor `heapUsed`, `rss`, `external`, event-loop delay, and GC time.
- Avoid retaining full request payloads across awaits.
- Watch Buffer-heavy paths such as uploads, compression, PDFs, and images.

## Large-Scale Systems

- Enforce payload limits.
- Use backpressure for queues and streams.
- Isolate memory-heavy tenants or jobs.
- Plan capacity based on peak retained memory, not only average traffic.
- Treat memory snapshots as sensitive production artifacts.

---

# 🧪 11. Interview Questions

## Beginner

- What is the heap?
- What is garbage collection?
- What is the difference between stack and heap?
- What makes an object reachable?

## Intermediate

- What is retained size?
- Why do generational collectors exist?
- Why can a closure cause a memory leak?
- What is the difference between `heapUsed` and RSS?

## Advanced

- How do you debug old-space growth in Node?
- How do you interpret heap snapshot dominators?
- What causes high GC time without a leak?
- How do Buffers affect Node memory analysis?

## Trick Questions

- Does setting a variable to `null` immediately free memory?
- Can an unreachable object still appear in memory for a while?
- Does WeakMap make values weak?
- Is increasing `--max-old-space-size` a fix?

---

# 🛠️ 12. Debugging Scenarios

## Bug: Worker OOM After Hours

Root cause:

- retry cache retains failed job payloads forever.

Fix:

- add TTL/max size,
- store small retry metadata instead of full payload,
- add cache size and retained memory metrics.

## Bug: SPA Memory Grows Per Route Change

Root cause:

- component event listener remains attached and captures old state.

Fix:

- remove listener during cleanup,
- inspect detached DOM nodes,
- compare heap snapshots before/after navigation.

## Bug: API p99 Spikes During Imports

Root cause:

- huge allocation bursts create GC pressure.

Fix:

- stream data,
- process in chunks,
- reduce intermediate arrays,
- monitor allocation rate and GC pause time.

---

# 📊 13. Performance & Optimization

Memory performance is about allocation rate, retention, GC cost, and locality.

Optimization tips:

- Reduce unnecessary allocations in hot paths.
- Avoid multiple transformed copies of large datasets.
- Stream large files and API responses.
- Use typed arrays for large numeric workloads.
- Keep caches bounded.
- Limit Promise concurrency.
- Avoid retaining full payloads across `await`.
- Use workers for memory-heavy browser operations.

Complexity reminder:

| Pattern | Memory Risk |
| --- | --- |
| `array.map().filter().map()` | intermediate arrays |
| unbounded `Map` | old-space growth |
| full-file buffering | peak memory spike |
| closure over payload | retained object graph |
| detached DOM references | browser-native memory retention |

---

# 🔐 14. Best Practices

- Prefer `const` and narrow scope to reduce accidental retention.
- Use bounded caches with TTL and eviction.
- Remove listeners, intervals, observers, and subscriptions.
- Use `AbortController` to cancel stale async work.
- Stream or paginate large data.
- Track memory metrics in production.
- Compare heap snapshots instead of guessing.
- Keep heap dumps protected; they can contain secrets and PII.
- Do not rely on finalizers for correctness.
- Increase heap limits only after understanding the memory profile.

---

# 🔗 15. Related Topics

- Garbage Collection → explains how unreachable heap objects are reclaimed.
- Leaks and Retainers → explains why unused objects remain reachable.
- Performance Profiling → helps identify allocation and GC pressure.
- Event Loop → GC pauses and long tasks affect responsiveness.
- Node.js Streams → reduce buffering and peak memory.
- Caching → improves latency but can create old-space growth.
- Observability → memory metrics, GC logs, heap snapshots, and alerts.
- Browser Fundamentals → DOM retention and main-thread memory pressure.

---

# 📚 16. Subtopic Deep Dive Links

- [[002.03.01 Heap Layout Detailed Guide]](./002.03.01 Heap Layout/README.md)
- [[002.03.02 Garbage Collection Detailed Guide]](./002.03.02 Garbage Collection/README.md)
- [[002.03.03 Leaks and Retainers Detailed Guide]](./002.03.03 Leaks and Retainers/README.md)

---

# ⚡ 17. Quick Revision (1-Min Summary)

- JavaScript memory is automatic, not magic.
- Objects stay alive while reachable from GC roots.
- Closures, caches, timers, listeners, modules, and DOM nodes commonly retain memory.
- Young generation handles short-lived allocations.
- Old generation growth is where many leaks become visible.
- RSS includes more than JS heap.
- Heap snapshots show retained object graphs.
- High allocation rate can hurt latency even without leaks.
- Bound memory by design: TTLs, limits, streaming, cleanup, backpressure.

---

# 🧾 18. Cheat Sheet

| Concept | Meaning |
| --- | --- |
| Heap | dynamic memory for objects |
| Stack | active execution state |
| GC root | starting point for reachability |
| Reachable | cannot be collected |
| Shallow size | object's own memory |
| Retained size | memory freed if object is removed |
| Young generation | new, short-lived objects |
| Old generation | long-lived survivors |
| RSS | total resident process memory |
| External memory | native/backing memory tied to JS objects |

Node memory command:

```ts
process.memoryUsage();
```

Common cleanup checklist:

```text
[ ] remove listeners
[ ] clear timers
[ ] cancel stale async work
[ ] bound caches
[ ] drain queues
[ ] stream large data
[ ] compare heap snapshots
```

---

# 🎯 19. Practice Exercises

## Easy

- Explain why an object remains alive while referenced by a global variable.
- Predict whether a local object can be collected after a function returns.

## Medium

- Refactor a function so it does not retain a full payload across `await`.
- Add TTL and max size to an unbounded cache design.

## Hard

- Given two heap snapshots, identify the dominator retaining most memory.
- Design memory observability for a Node file upload service.

## Output Prediction

```ts
function create() {
  const value = { items: new Array(1000).fill("x") };
  return () => value.items.length;
}

const fn = create();
```

Question:

- Is `value` collectable after `create()` returns?

## Fix The Bug

```ts
const requests = [];

export function track(req) {
  requests.push(req);
}
```

Fix:

- store bounded metadata, not full request objects,
- add retention policy,
- expose size metrics.

---

# 🧠 20. Mental Models (VERY IMPORTANT)

## The Warehouse Model

- Heap = warehouse.
- Objects = boxes.
- References = labels pointing to boxes.
- GC roots = people holding labels.
- GC = cleaner who can remove only boxes nobody can reach.

If a useless box still has a label chain from a root, the cleaner must keep it.

## The River Model

- Healthy memory flows like a river: allocate, use, release.
- Leaks are dams: objects stop flowing out.
- Allocation pressure is floodwater: even if it drains, the system struggles while volume is high.

## The Ownership Model

Every long-lived object needs an owner and an exit rule:

```text
Who owns it?
How large can it get?
When is it removed?
What metric proves it is healthy?
```

Staff-level memory work is mostly ownership work. The runtime collects unreachable objects; engineers design systems where useless objects actually become unreachable.
