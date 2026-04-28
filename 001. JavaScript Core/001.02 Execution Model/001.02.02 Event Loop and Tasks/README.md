# 001.02.02 Event Loop and Tasks

Category: JavaScript Core

Topic: 001.02 Execution Model

## 1. Definition

The event loop is the runtime coordination mechanism that decides when queued JavaScript callbacks run after the current call stack becomes empty.

Tasks are scheduled units of work, such as timer callbacks, user events, network callbacks, script execution, and other host-driven callbacks.

One-line version:

```txt
The event loop lets JavaScript handle asynchronous work by running one synchronous callback at a time, then choosing the next queued callback when the call stack is empty.
```

Expanded explanation:

- JavaScript execution on one thread is stack-based and synchronous while code is running.
- Host environments such as browsers and Node.js provide queues for async work.
- The event loop checks whether the call stack is empty.
- If it is empty, the runtime selects queued work and runs its callback.
- Microtasks run at special checkpoints, usually after the current synchronous code and before the next task.
- Browser rendering gets opportunities between tasks, not while the stack is busy.

Important vocabulary:

- **Call stack:** currently executing function frames.
- **Task:** queued unit such as a timer, event, script, or message callback.
- **Microtask:** high-priority callback such as promise reactions and `queueMicrotask`.
- **Rendering opportunity:** browser chance to style, layout, paint, and handle visual updates.
- **Event loop tick/turn:** one pass where queued work may be selected and processed.

## 2. Why It Exists

JavaScript needed an execution model that could handle user events, timers, network responses, file I/O, promises, and rendering without running multiple pieces of JavaScript at the same time on the same thread.

The event loop solves this by allowing concurrency without shared-memory parallel execution in the main JavaScript thread.

Problems solved:

- run synchronous code predictably,
- defer callbacks until the current stack finishes,
- respond to user input,
- coordinate timers and I/O,
- schedule promise continuations,
- allow the browser to render between units of work,
- keep Node.js servers capable of handling many concurrent I/O operations.

Senior-level reason:

The event loop is the reason JavaScript can feel asynchronous while still being mostly single-threaded at the language level. It explains UI freezes, event-loop delay, promise ordering, timer surprises, starvation, hydration jank, slow request handlers, and production latency spikes.

## 3. Syntax & Variants

The event loop is not directly invoked with one syntax. You interact with it through APIs that schedule work.

### Synchronous Code

```js
console.log("A");
console.log("B");
```

Runs immediately on the current call stack.

### Timer Task

```js
setTimeout(() => {
  console.log("timer");
}, 0);
```

The callback is scheduled as a timer task. It cannot run until the current stack is empty and the timer is eligible.

### Repeating Timer

```js
const id = setInterval(() => {
  console.log("tick");
}, 1000);

clearInterval(id);
```

Intervals enqueue repeated timer callbacks, but callbacks can drift if the event loop is busy.

### Promise Microtask

```js
Promise.resolve().then(() => {
  console.log("promise");
});
```

Promise reactions run as microtasks.

### `queueMicrotask`

```js
queueMicrotask(() => {
  console.log("microtask");
});
```

This schedules a microtask directly.

### `async` / `await`

```js
async function run() {
  console.log("before");
  await Promise.resolve();
  console.log("after");
}
```

Code before `await` runs synchronously. Code after `await` resumes through promise/microtask scheduling.

### Browser Rendering Callback

```js
requestAnimationFrame(() => {
  updateAnimation();
});
```

`requestAnimationFrame` runs before a browser paint opportunity.

### Browser Event Callback

```js
button.addEventListener("click", () => {
  console.log("clicked");
});
```

User interaction queues event callbacks as tasks.

### Node-Specific Scheduling

```js
process.nextTick(() => {
  console.log("nextTick");
});

setImmediate(() => {
  console.log("immediate");
});
```

These are Node-specific and have ordering rules that differ from browsers.

## 4. Internal Working

The exact event loop is defined by the host environment, but the core mental model is stable.

Browser-style model:

```txt
Run current script/task
  -> call stack becomes empty
  -> drain microtask queue
  -> browser may render
  -> take next task from a task queue
  -> run that task's callback
  -> repeat
```

Example:

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
```

Output:

```txt
A
D
C
B
```

Why:

```txt
1. Current script runs: A, schedule timer, schedule promise microtask, D.
2. Current call stack clears.
3. Microtask queue drains: C.
4. Next eligible task runs: B.
```

### Task Queue

Tasks come from host APIs:

- initial script execution,
- timers,
- user input events,
- network callbacks,
- message events,
- history/navigation events,
- Node I/O callbacks,
- Node timers and immediates.

Only one task callback runs at a time on the same JavaScript thread.

### Microtask Queue

Microtasks include:

- promise `.then`, `.catch`, `.finally`,
- `await` continuation,
- `queueMicrotask`,
- mutation observer callbacks in browsers.

Microtasks are drained before the runtime takes the next task.

Important consequence:

```js
function loop() {
  queueMicrotask(loop);
}

loop();
```

This can starve tasks and rendering because the microtask queue never empties.

### Rendering Checkpoint

Browsers cannot render while JavaScript is running. Rendering happens only when the browser gets control back.

```txt
task runs
  -> microtasks drain
  -> browser may style/layout/paint
  -> next task
```

If a task is long, the page can feel frozen.

### Node.js Model

Node.js uses libuv phases for timers, pending callbacks, poll, check, close callbacks, plus microtask and `process.nextTick` processing around phase/callback boundaries.

You do not need to memorize every phase for most interviews, but you must know:

- Node has no browser render step.
- Node event-loop health affects server latency.
- `process.nextTick` runs before promise microtasks in Node.
- `setImmediate` and `setTimeout(..., 0)` ordering can depend on context.
- CPU-heavy JavaScript blocks I/O callbacks from running.

## 5. Memory Behavior

The event loop itself is a scheduling mechanism, but queued callbacks retain memory.

Example:

```js
function schedule(data) {
  setTimeout(() => {
    console.log(data.id);
  }, 60_000);
}
```

The callback closes over `data`. Until the timer fires or is cleared, `data` remains reachable.

Memory model:

```txt
timer queue
  -> callback
    -> closed-over lexical environment
      -> data object
```

Common memory risks:

- timers retaining large objects,
- intervals never cleared,
- promise chains retaining intermediate data,
- event listeners retaining DOM nodes,
- queued callbacks retaining request objects,
- unbounded job queues in userland,
- microtask loops accumulating closures.

Better:

```js
function schedule(data) {
  const id = data.id;

  setTimeout(() => {
    console.log(id);
  }, 60_000);
}
```

Capture only the value needed.

Cleanup matters:

```js
const id = setInterval(refresh, 1000);

function destroy() {
  clearInterval(id);
}
```

In React, Angular, and Node services, missing cleanup is a common source of leaks.

## 6. Execution Behavior

### Basic Ordering

```js
console.log("sync 1");

setTimeout(() => console.log("timer"), 0);

Promise.resolve().then(() => console.log("promise"));

console.log("sync 2");
```

Output:

```txt
sync 1
sync 2
promise
timer
```

### Microtasks Drain Fully

```js
Promise.resolve().then(() => {
  console.log("microtask 1");
  queueMicrotask(() => console.log("microtask 2"));
});

setTimeout(() => console.log("timer"), 0);
```

Output:

```txt
microtask 1
microtask 2
timer
```

The runtime drains microtasks before taking the next task.

### Timer Delay Is Minimum Delay

```js
const start = Date.now();

setTimeout(() => {
  console.log(Date.now() - start);
}, 0);

while (Date.now() - start < 1000) {}
```

The timer cannot run until the blocking loop ends.

### UI Rendering Interaction

```js
button.textContent = "Loading";
heavySynchronousWork();
button.textContent = "Done";
```

The browser may not paint `"Loading"` if the stack stays busy until `"Done"`.

To allow paint:

```js
button.textContent = "Loading";

setTimeout(() => {
  heavySynchronousWork();
  button.textContent = "Done";
}, 0);
```

This gives the browser a chance to process rendering between tasks, depending on timing.

### Async/Await Ordering

```js
async function run() {
  console.log("A");
  await null;
  console.log("B");
}

run();
console.log("C");
```

Output:

```txt
A
C
B
```

The continuation after `await` runs later as a microtask.

## 7. Scope & Context Interaction

Event loop scheduling does not change lexical scope. A callback keeps access to variables from where it was created.

```js
function start(userId) {
  setTimeout(() => {
    console.log(userId);
  }, 100);
}
```

The callback runs later, but it still closes over `userId`.

### Stale Closure Risk

```js
let count = 0;

setTimeout(() => {
  console.log(count);
}, 1000);

count = 10;
```

The callback reads the current binding value when it runs, not a snapshot.

In React, each render creates new bindings:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log(count);
  }, 1000);

  return () => clearInterval(id);
}, []);
```

The interval closes over the `count` from the render where the effect was created.

### `this` In Scheduled Callbacks

```js
const user = {
  name: "Ajay",
  greet() {
    setTimeout(function () {
      console.log(this.name);
    }, 0);
  },
};
```

The callback's `this` is not automatically `user`.

Fix:

```js
const user = {
  name: "Ajay",
  greet() {
    setTimeout(() => {
      console.log(this.name);
    }, 0);
  },
};
```

The arrow function captures `this` lexically from `greet`.

### Async Context

In production, async workflows need correlation IDs because the synchronous stack is split across tasks and microtasks.

```txt
request starts
  -> schedule database callback
  -> schedule promise continuation
  -> send response
```

Without async context propagation or explicit IDs, logs become difficult to connect.

## 8. Common Examples

### Classic Ordering Example

```js
console.log(1);

setTimeout(() => console.log(2), 0);

Promise.resolve().then(() => console.log(3));

console.log(4);
```

Output:

```txt
1
4
3
2
```

### Chunking Browser Work

```js
function processInChunks(items, chunkSize = 100) {
  let index = 0;

  function nextChunk() {
    const end = Math.min(index + chunkSize, items.length);

    while (index < end) {
      process(items[index]);
      index += 1;
    }

    if (index < items.length) {
      setTimeout(nextChunk, 0);
    }
  }

  nextChunk();
}
```

This lets other tasks and rendering happen between chunks.

### Microtask For Post-Sync Cleanup

```js
let pending = false;

function scheduleFlush() {
  if (pending) return;
  pending = true;

  queueMicrotask(() => {
    pending = false;
    flushChanges();
  });
}
```

This batches multiple synchronous calls into one microtask flush.

### Node Event-Loop Delay

```js
import { monitorEventLoopDelay } from "node:perf_hooks";

const histogram = monitorEventLoopDelay();
histogram.enable();

setInterval(() => {
  console.log(histogram.mean);
}, 10_000);
```

This helps detect blocking work in Node.js services.

### Yielding In Async Code

```js
async function processAll(items) {
  for (let i = 0; i < items.length; i += 1) {
    process(items[i]);

    if (i % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}
```

This gives the event loop a chance to run other tasks between batches.

## 9. Confusing / Tricky Examples

### `setTimeout(..., 0)` Is Not Immediate

```js
setTimeout(() => console.log("timer"), 0);

console.log("sync");
```

Output:

```txt
sync
timer
```

The timer callback waits until the current stack is empty.

### Microtask Before Timer

```js
setTimeout(() => console.log("timer"), 0);

Promise.resolve().then(() => console.log("promise"));
```

Output:

```txt
promise
timer
```

### Microtask Starvation

```js
function starve() {
  queueMicrotask(starve);
}

starve();

setTimeout(() => console.log("never reaches here"), 0);
```

The timer may never run because the microtask queue never empties.

### Promise Constructor Runs Synchronously

```js
new Promise((resolve) => {
  console.log("executor");
  resolve();
}).then(() => console.log("then"));

console.log("sync");
```

Output:

```txt
executor
sync
then
```

The executor runs immediately. The `.then` callback is a microtask.

### `await` Always Yields

```js
async function run() {
  console.log("A");
  await 1;
  console.log("B");
}

run();
console.log("C");
```

Output:

```txt
A
C
B
```

Even awaiting a non-promise value resumes asynchronously through promise semantics.

### Node `nextTick` Surprise

```js
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
```

In Node.js:

```txt
nextTick
promise
```

`process.nextTick` has special priority in Node and can also starve the event loop if abused.

## 10. Real Production Use Cases

### Browser Responsiveness

Event-loop knowledge helps prevent:

- frozen buttons,
- delayed input,
- janky animations,
- slow hydration,
- long tasks,
- delayed rendering after state changes.

### Node.js API Latency

Event-loop health determines whether a Node service can respond while other I/O is ready.

Blocking work causes:

- p99 latency spikes,
- timeout bursts,
- slow health checks,
- delayed socket handling,
- poor throughput.

### Frontend Framework Scheduling

React, Angular, and other frameworks coordinate rendering, effects, events, and change detection around the browser event loop.

Examples:

- React state updates in event handlers,
- effects running after paint,
- Angular zone.js tracking async work,
- hydration work competing with input responsiveness.

### Batching And Debouncing

Event-loop APIs are often used to batch or defer work:

```js
let timeoutId;

function onSearchInput(query) {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    search(query);
  }, 300);
}
```

### Observability

Production systems measure:

- long tasks in browsers,
- event-loop delay in Node,
- task duration,
- microtask-heavy code paths,
- timer drift,
- queue backlog,
- user interaction latency.

## 11. Interview Questions

1. What is the event loop?
2. What is the difference between call stack and event loop?
3. What is a task?
4. What is a microtask?
5. Why does `setTimeout(..., 0)` run after synchronous code?
6. Why do promise callbacks run before timers?
7. What happens after `await`?
8. Can microtasks starve rendering or timers?
9. How does the browser rendering step relate to tasks?
10. Why can a long synchronous function freeze the UI?
11. Why can CPU-heavy code hurt a Node.js server?
12. What is the difference between browser and Node event loops?
13. What is `process.nextTick`?
14. When would you use `queueMicrotask`?
15. How would you debug event-loop delay in production?

## 12. Senior-Level Pitfalls

### Pitfall 1: Blocking The Main Thread

```js
button.addEventListener("click", () => {
  expensiveCalculation();
});
```

If this takes hundreds of milliseconds, input and rendering are blocked.

### Pitfall 2: Promise Chains That Starve Tasks

```js
function loop() {
  Promise.resolve().then(loop);
}
```

This can prevent timers and rendering from progressing.

### Pitfall 3: Assuming Timer Precision

Timers are not real-time guarantees. They are delayed by busy stacks, clamping, browser throttling, background tabs, and runtime scheduling.

### Pitfall 4: Abusing `process.nextTick`

`process.nextTick` can starve I/O in Node when recursively scheduled.

### Pitfall 5: Missing Async Context

Logs from separate tasks or microtasks may look unrelated unless request IDs or async context propagation are used.

### Pitfall 6: Thinking Async Means Parallel

Async callbacks do not automatically run in parallel on the main JavaScript thread. CPU work still blocks unless moved to another thread/process or broken into chunks.

## 13. Best Practices

- Keep individual tasks short.
- Use microtasks for small post-sync coordination, not heavy work.
- Avoid recursive microtask or `nextTick` loops.
- Break large browser work into chunks.
- Use Web Workers for CPU-heavy frontend work.
- Use Node worker threads or background jobs for CPU-heavy backend work.
- Debounce high-frequency user input.
- Clear timers and intervals during cleanup.
- Measure event-loop delay in Node services.
- Monitor long tasks and interaction latency in browsers.
- Use correlation IDs for async workflows.
- Do not assume exact timer ordering across browser and Node contexts.

## 14. Debugging Scenarios

### Scenario 1: Button Click Feels Delayed

```js
button.addEventListener("click", () => {
  renderHugeList(items);
});
```

Likely cause: one long task blocks input and rendering.

Debugging steps:

1. Record browser performance profile.
2. Look for long tasks over 50 ms.
3. Identify the hot JavaScript function.
4. Virtualize, chunk, memoize, or move work to a worker.
5. Re-measure interaction latency.

### Scenario 2: Timer Fires Late

```js
setTimeout(sendHeartbeat, 1000);
heavySynchronousWork();
```

Likely cause: the stack was busy when the timer became eligible.

Fix:

- reduce blocking work,
- split work into chunks,
- move CPU-heavy work off-thread,
- avoid using timers as precise clocks.

### Scenario 3: Node p99 Latency Spike

```js
app.post("/import", (req, res) => {
  parseLargeCsv(req.body);
  res.end("ok");
});
```

Likely cause: CPU-heavy parsing blocks the Node event loop.

Debugging steps:

1. Measure event-loop delay.
2. Capture CPU profile.
3. Check request size distribution.
4. Move parsing to a worker/background job.
5. Add payload limits and backpressure.

### Scenario 4: Promise Callback Runs Before Timer

```js
setTimeout(() => log("timer"), 0);
Promise.resolve().then(() => log("promise"));
```

This is expected. Microtasks drain before the next task.

Debugging step: classify each callback as sync, microtask, or task before predicting output.

### Scenario 5: Memory Leak From Interval

```js
function mount(data) {
  setInterval(() => {
    refresh(data);
  }, 1000);
}
```

Likely cause: interval is never cleared and retains `data`.

Fix:

```js
function mount(data) {
  const id = setInterval(() => {
    refresh(data.id);
  }, 1000);

  return () => clearInterval(id);
}
```

### Scenario 6: Logs Lose Request Order

Async work splits execution across tasks and microtasks.

Fix:

- include request ID in every log,
- use async context tooling where appropriate,
- add trace/span IDs,
- log before and after scheduling important work.

## 15. Exercises / Practice

### Exercise 1

Predict the output:

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

### Exercise 2

Predict the output:

```js
async function run() {
  console.log(1);
  await null;
  console.log(2);
}

run();
console.log(3);
```

### Exercise 3

Fix this UI blocking issue:

```js
function onClick() {
  for (const item of hugeList) {
    process(item);
  }
}
```

### Exercise 4

Explain why this timer may never run:

```js
function loop() {
  queueMicrotask(loop);
}

loop();
setTimeout(() => console.log("timer"), 0);
```

### Exercise 5

Classify each as sync, task, or microtask:

- function body,
- `setTimeout`,
- promise `.then`,
- `queueMicrotask`,
- click handler,
- `await` continuation,
- `requestAnimationFrame`,
- `process.nextTick`.

### Exercise 6

Design a Node.js debugging plan for event-loop delay above 200 ms.

## 16. Comparison

### Task vs Microtask

| Concept | Examples | Runs When |
|---|---|---|
| Task | script, timer, click, message, I/O callback | selected by event loop when stack is empty |
| Microtask | promise reaction, `queueMicrotask`, await continuation | drained after current stack/task before next task |

### Browser vs Node Event Loop

| Area | Browser | Node.js |
|---|---|---|
| Rendering | Has style/layout/paint opportunities | No rendering step |
| Timers | `setTimeout`, `setInterval` | `setTimeout`, `setInterval` |
| Microtasks | promises, `queueMicrotask`, mutation observers | promises, `queueMicrotask`, plus `process.nextTick` behavior |
| CPU work impact | Freezes UI/input/rendering | Delays I/O and requests |
| Offload option | Web Workers | Worker threads, child processes, background jobs |

### `setTimeout` vs `queueMicrotask`

| API | Use For | Avoid For |
|---|---|---|
| `setTimeout(fn, 0)` | Yielding to a future task | Precise immediate execution |
| `queueMicrotask(fn)` | Small cleanup after current sync work | Heavy work or recursive loops |

### Async vs Parallel

| Word | Meaning |
|---|---|
| Async | Work continues later without blocking current stack |
| Parallel | Work runs at the same time on another thread/core/process |

## 17. Related Concepts

Prerequisites:

- Call Stack
- Scope, Closures, and Hoisting
- Functions Basics

Direct follow-ups:

- Promises and Async/Await
- Error Handling
- Browser Rendering Pipeline
- Node.js Event Loop
- Streams and Buffers
- Performance Profiling
- Observability

Production connections:

- frontend long tasks,
- React and Angular scheduling,
- Node event-loop delay,
- async context propagation,
- request timeouts,
- queue backpressure,
- background jobs,
- worker threads and Web Workers.

Knowledge graph:

```txt
Call Stack
  -> current synchronous work
  -> stack empty
    -> drain microtasks
    -> browser may render
    -> event loop selects next task
      -> callback runs on call stack
```

## Advanced Add-ons

### Performance Impact

Event-loop health is directly tied to responsiveness and latency.

Performance risks:

- long synchronous tasks,
- too many microtasks,
- recursive `nextTick` or microtask loops,
- heavy promise chains,
- large JSON parsing/stringifying,
- CPU-heavy request handlers,
- rendering work that blocks input.

Metrics:

- browser long task count,
- Interaction to Next Paint,
- Total Blocking Time,
- Node event-loop delay,
- p95/p99 request latency,
- timer drift,
- CPU utilization.

### System Design Relevance

Event-loop constraints influence architecture.

Design choices:

- keep CPU-heavy work out of request/render paths,
- move expensive jobs to workers or queues,
- apply backpressure when work arrives faster than it can be processed,
- use streaming for large data,
- separate interactive work from batch work,
- use observability to detect event-loop saturation.

Decision question:

```txt
Can this work safely run on the main event loop, or should it be chunked, deferred, streamed, queued, or moved to another execution environment?
```

### Security Impact

Event-loop misuse can become availability risk.

Risks:

- denial of service through CPU-heavy payloads,
- recursive microtask starvation,
- unbounded timers or queued work,
- expensive parsing of malicious input,
- event-loop blocking that delays auth, rate limits, or health checks.

Defenses:

- input size limits,
- timeouts and cancellation,
- CPU budgets,
- worker isolation,
- rate limiting,
- backpressure,
- safe parser limits.

### Browser vs Node Behavior

Browser:

- rendering competes with JavaScript work,
- user input waits behind long tasks,
- background tabs may throttle timers,
- `requestAnimationFrame` aligns with paint,
- Web Workers provide off-main-thread CPU work.

Node.js:

- event-loop delay affects all connections on that process,
- libuv handles many I/O operations,
- `process.nextTick` is Node-specific,
- `setImmediate` is Node-specific,
- worker threads help CPU-bound tasks,
- event-loop delay should be monitored in production.

Core shared rule:

```txt
Callbacks do not interrupt currently running JavaScript.
```

### Polyfill / Implementation

You cannot polyfill the real event loop because it is provided by the host runtime.

You can model scheduling:

```js
const tasks = [];
const microtasks = [];

function scheduleTask(fn) {
  tasks.push(fn);
}

function scheduleMicrotask(fn) {
  microtasks.push(fn);
}

function runLoopOnce() {
  const task = tasks.shift();

  if (task) {
    task();
  }

  while (microtasks.length > 0) {
    const microtask = microtasks.shift();
    microtask();
  }
}
```

This model is incomplete, but it teaches the ordering idea: run one task, drain microtasks, then continue.

Staff-level takeaway: event-loop mastery means you can predict callback ordering, prevent starvation, keep user interactions responsive, protect Node servers from CPU blocking, and design async flows with observable boundaries.

## 18. Summary

The event loop coordinates asynchronous JavaScript execution.

Remember:

- synchronous code runs first on the call stack,
- callbacks do not interrupt running JavaScript,
- tasks include timers, events, messages, and I/O callbacks,
- microtasks include promise reactions, `await` continuations, and `queueMicrotask`,
- microtasks drain before the next task,
- too many microtasks can starve tasks and rendering,
- `setTimeout(..., 0)` means later, not immediately,
- browsers need event-loop gaps to render,
- Node.js event-loop delay causes server latency,
- async does not automatically mean parallel,
- production systems need event-loop metrics, input limits, cleanup, and backpressure.
