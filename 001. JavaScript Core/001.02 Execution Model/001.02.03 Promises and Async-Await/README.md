# 001.02.03 Promises and Async-Await

Category: JavaScript Core

Topic: 001.02 Execution Model

## 1. Definition

A promise is a JavaScript object that represents the eventual result of an asynchronous operation.

`async` / `await` is syntax built on top of promises that lets asynchronous code read like sequential code while still yielding back to the event loop at `await` points.

One-line version:

```txt
Promises model future completion; async/await is structured syntax for consuming promises.
```

Expanded explanation:

- A promise starts pending.
- It eventually becomes fulfilled or rejected.
- Fulfillment carries a value.
- Rejection carries a reason, usually an error.
- `.then`, `.catch`, and `.finally` register reactions.
- Promise reactions run as microtasks.
- An `async` function always returns a promise.
- `await` pauses the async function's continuation, not the whole JavaScript thread.

Promise states:

```txt
pending -> fulfilled
pending -> rejected
```

Once settled, a promise cannot change state again.

## 2. Why It Exists

JavaScript needed a better way to represent asynchronous work than deeply nested callbacks.

Before promises:

```js
readUser(id, (userError, user) => {
  if (userError) return handleError(userError);

  readOrders(user.id, (ordersError, orders) => {
    if (ordersError) return handleError(ordersError);

    render(user, orders);
  });
});
```

With promises:

```js
readUser(id)
  .then((user) => readOrders(user.id))
  .then((orders) => render(orders))
  .catch(handleError);
```

With `async` / `await`:

```js
async function load(id) {
  try {
    const user = await readUser(id);
    const orders = await readOrders(user.id);
    render(user, orders);
  } catch (error) {
    handleError(error);
  }
}
```

Problems solved:

- callback nesting,
- inconsistent async error handling,
- composition of async operations,
- sequential async workflows,
- parallel async workflows,
- cleanup after async work,
- readable control flow around remote calls and I/O.

Senior-level reason:

Promises are not just nicer syntax. They define error propagation, microtask ordering, concurrency control, request cancellation patterns, timeout strategy, unhandled rejection behavior, and production latency characteristics.

## 3. Syntax & Variants

### Creating A Promise

```js
const promise = new Promise((resolve, reject) => {
  if (Math.random() > 0.5) {
    resolve("ok");
  } else {
    reject(new Error("failed"));
  }
});
```

The executor runs synchronously.

### Consuming With `.then`

```js
fetchUser()
  .then((user) => {
    return user.name;
  })
  .then((name) => {
    console.log(name);
  });
```

Each `.then` returns a new promise.

### Handling Rejection

```js
fetchUser()
  .then(renderUser)
  .catch((error) => {
    console.error(error);
  });
```

`.catch(fn)` is similar to `.then(undefined, fn)`.

### Cleanup With `.finally`

```js
setLoading(true);

fetchUser()
  .then(renderUser)
  .catch(showError)
  .finally(() => {
    setLoading(false);
  });
```

`finally` runs after fulfillment or rejection.

### `async` Function

```js
async function loadUser(id) {
  return fetch(`/users/${id}`).then((response) => response.json());
}
```

This function always returns a promise.

### `await`

```js
async function loadUser(id) {
  const response = await fetch(`/users/${id}`);
  return response.json();
}
```

`await` unwraps fulfillment or throws on rejection.

### Parallel Work With `Promise.all`

```js
const [user, orders] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
]);
```

Both operations start before awaiting completion.

### Resilient Aggregation With `Promise.allSettled`

```js
const results = await Promise.allSettled([
  fetchProfile(id),
  fetchRecommendations(id),
  fetchNotifications(id),
]);
```

This waits for all promises, even if some reject.

### Race And Timeout Pattern

```js
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
}

await Promise.race([fetchUser(id), timeout(3000)]);
```

`Promise.race` settles when the first input settles.

### Cancellation With `AbortController`

```js
const controller = new AbortController();

const request = fetch("/api/users", {
  signal: controller.signal,
});

controller.abort();

await request;
```

Promises do not cancel by themselves. APIs must support cancellation.

## 4. Internal Working

A promise stores:

- state: pending, fulfilled, or rejected,
- result: fulfillment value or rejection reason,
- reactions: callbacks registered through `.then`, `.catch`, or `.finally`.

Promise settlement flow:

```txt
create promise
  -> executor runs synchronously
  -> resolve or reject is called later or now
  -> promise settles once
  -> registered reactions are queued as microtasks
  -> microtasks run after current stack clears
```

Example:

```js
console.log("A");

const promise = new Promise((resolve) => {
  console.log("B");
  resolve("C");
});

promise.then((value) => console.log(value));

console.log("D");
```

Output:

```txt
A
B
D
C
```

Why:

- promise executor runs synchronously,
- `.then` callback is a microtask,
- current stack finishes before microtasks run.

### Promise Resolution Procedure

If a `.then` callback returns a normal value, the next promise fulfills with that value.

```js
Promise.resolve(1)
  .then((value) => value + 1)
  .then(console.log); // 2
```

If it returns a promise, the chain waits for that promise.

```js
Promise.resolve(1)
  .then((value) => Promise.resolve(value + 1))
  .then(console.log); // 2
```

If it throws, the next promise rejects.

```js
Promise.resolve()
  .then(() => {
    throw new Error("boom");
  })
  .catch((error) => console.log(error.message));
```

### `async` Function Internals

This:

```js
async function run() {
  const value = await getValue();
  return value + 1;
}
```

Behaves conceptually like:

```js
function run() {
  return Promise.resolve(getValue()).then((value) => value + 1);
}
```

That is not exact engine source, but it is a useful mental model.

### `await` Internals

At `await`:

```txt
evaluate awaited expression
  -> convert to promise-like value
  -> suspend async function continuation
  -> return control to caller/event loop
  -> resume continuation as microtask after settlement
```

`await` does not block the thread.

## 5. Memory Behavior

Promises and async functions can retain memory through callbacks, closures, and unresolved work.

Example:

```js
function loadLater(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data.id), 60_000);
  });
}
```

The pending promise and timer callback retain `data` until the timer settles.

Memory model:

```txt
pending promise
  -> reactions
  -> callback closure
  -> closed-over data
```

Async function locals can be retained across `await`:

```js
async function process(data) {
  const largeBuffer = data.buffer;

  await sendMetadata(data.id);

  return largeBuffer.length;
}
```

`largeBuffer` may need to remain reachable until the function resumes after `await`.

Reduce retention:

```js
async function process(data) {
  const id = data.id;
  const length = data.buffer.length;

  await sendMetadata(id);

  return length;
}
```

Common memory risks:

- promises that never settle,
- unresolved request maps,
- async functions retaining large locals across `await`,
- long promise chains retaining intermediate values,
- forgotten timeout/interval cleanup,
- unbounded concurrency creating many pending promises,
- unresolved fetches after component unmount.

## 6. Execution Behavior

### Async Function Returns Immediately

```js
async function run() {
  return 1;
}

const result = run();

console.log(result instanceof Promise); // true
```

An `async` function wraps returned values in a promise.

### `await` Yields

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

The continuation after `await` runs as a microtask.

### Sequential Await

```js
const user = await fetchUser(id);
const orders = await fetchOrders(id);
```

`fetchOrders` starts only after `fetchUser` completes.

### Parallel Await

```js
const userPromise = fetchUser(id);
const ordersPromise = fetchOrders(id);

const user = await userPromise;
const orders = await ordersPromise;
```

Both operations start before the first await.

Cleaner:

```js
const [user, orders] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
]);
```

### Error Propagation

```js
async function load() {
  throw new Error("failed");
}

load().catch((error) => {
  console.log(error.message);
});
```

Throwing inside an async function rejects the returned promise.

### `try/catch` With Await

```js
try {
  const user = await fetchUser(id);
  render(user);
} catch (error) {
  showError(error);
}
```

`try/catch` catches rejections from awaited promises.

It does not catch an un-awaited promise that rejects later:

```js
try {
  fetchUser(id);
} catch (error) {
  // does not catch async rejection
}
```

## 7. Scope & Context Interaction

Promises preserve closures just like other callbacks.

```js
function loadForUser(userId) {
  return fetch(`/users/${userId}`).then(() => {
    console.log(userId);
  });
}
```

The `.then` callback closes over `userId`.

### Async Local State Across Await

```js
async function checkout(cart) {
  const orderId = createOrderId();

  await charge(cart);

  return orderId;
}
```

`orderId` remains available after `await`.

### Stale UI State

```jsx
async function handleSave() {
  await save(form);
  console.log(form);
}
```

If `form` changes while `save` is in flight, the function still sees the binding from the render where `handleSave` was created.

### `this` With Async Methods

```js
const userService = {
  baseUrl: "/users",
  async load(id) {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  },
};
```

`this` is determined when `load` is called.

Risk:

```js
const load = userService.load;
await load(1); // this is lost
```

Fix:

```js
const load = userService.load.bind(userService);
```

### Async Context Propagation

In production, one request may cross many async boundaries.

```txt
HTTP request
  -> await auth
  -> await database
  -> await cache
  -> await downstream API
```

Use explicit request IDs or runtime async context features so logs and traces remain connected.

## 8. Common Examples

### Fetch JSON

```js
async function getJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

Important: `fetch` only rejects for network-level failures, not HTTP 404/500 responses.

### Sequential Workflow

```js
async function createOrder(userId, cart) {
  const user = await fetchUser(userId);
  const payment = await chargePayment(user, cart);
  return createReceipt(user, payment);
}
```

Use sequential awaits when later steps depend on earlier results.

### Parallel Workflow

```js
async function loadDashboard(userId) {
  const [profile, notifications, recommendations] = await Promise.all([
    fetchProfile(userId),
    fetchNotifications(userId),
    fetchRecommendations(userId),
  ]);

  return { profile, notifications, recommendations };
}
```

Use parallel awaits when operations are independent.

### Partial Failure

```js
async function loadHomePage(userId) {
  const results = await Promise.allSettled([
    fetchProfile(userId),
    fetchRecommendations(userId),
    fetchAds(userId),
  ]);

  return results.map((result) =>
    result.status === "fulfilled" ? result.value : null,
  );
}
```

Useful when optional data should not fail the whole page.

### Timeout With Abort

```js
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}
```

This cancels the fetch and cleans up the timer.

### Bounded Concurrency

```js
async function mapLimit(items, limit, worker) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const promise = Promise.resolve()
      .then(() => worker(item))
      .then((result) => {
        results.push(result);
        executing.delete(promise);
      });

    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
```

Bound concurrency to avoid overwhelming dependencies.

## 9. Confusing / Tricky Examples

### `await` In A Loop Is Sequential

```js
for (const id of ids) {
  await fetchUser(id);
}
```

This runs one request at a time.

Parallel version:

```js
await Promise.all(ids.map((id) => fetchUser(id)));
```

Bounded version is safer for large `ids`.

### `forEach` Does Not Await

```js
ids.forEach(async (id) => {
  await fetchUser(id);
});

console.log("done");
```

`done` logs before the async callbacks finish.

Use:

```js
for (const id of ids) {
  await fetchUser(id);
}
```

Or:

```js
await Promise.all(ids.map((id) => fetchUser(id)));
```

### Missing `return` In Promise Chain

```js
fetchUser()
  .then((user) => {
    fetchOrders(user.id);
  })
  .then((orders) => {
    console.log(orders); // undefined
  });
```

Fix:

```js
fetchUser()
  .then((user) => fetchOrders(user.id))
  .then((orders) => {
    console.log(orders);
  });
```

### Promise Executor Is Sync

```js
console.log("A");

new Promise((resolve) => {
  console.log("B");
  resolve();
}).then(() => console.log("C"));

console.log("D");
```

Output:

```txt
A
B
D
C
```

### `try/catch` Needs `await`

```js
try {
  failingAsync();
} catch (error) {
  console.log("caught");
}
```

If `failingAsync` returns a rejected promise, this does not catch it.

Fix:

```js
try {
  await failingAsync();
} catch (error) {
  console.log("caught");
}
```

### `Promise.all` Fails Fast

```js
await Promise.all([
  required(),
  optional(),
]);
```

If `optional` rejects, the whole `Promise.all` rejects. Use `allSettled` or handle optional errors individually when partial success is acceptable.

## 10. Real Production Use Cases

### API Request Pipelines

```js
async function handler(req, res) {
  const user = await authenticate(req);
  const data = await loadData(user.id);
  res.end(JSON.stringify(data));
}
```

Async/await makes request flow readable, but every await is a latency boundary.

### Frontend Data Fetching

```jsx
useEffect(() => {
  const controller = new AbortController();

  loadUser(userId, controller.signal).catch(reportError);

  return () => controller.abort();
}, [userId]);
```

Cleanup prevents stale updates and wasted network work.

### Payment Workflow

Payment systems need careful async design:

- timeout external calls,
- use idempotency keys,
- retry only safe operations,
- record durable state transitions,
- avoid double-charging.

### Background Jobs

```js
async function processJob(job) {
  await validate(job);
  await performSideEffect(job);
  await markComplete(job.id);
}
```

If a job fails halfway, the retry behavior must be safe.

### Fan-Out Requests

```js
const responses = await Promise.all(
  services.map((service) => service.fetchStatus()),
);
```

Fan-out can overload dependencies. Use limits, caching, batching, and timeouts.

## 11. Interview Questions

1. What are the states of a promise?
2. Does an `async` function always return a promise?
3. What does `await` do internally?
4. What is the output ordering with promises and timers?
5. Why does the promise executor run synchronously?
6. What is the difference between `.then` and `await`?
7. How does error propagation work in promise chains?
8. Why does `try/catch` require `await` for async errors?
9. What is the difference between `Promise.all` and `Promise.allSettled`?
10. What is the difference between `Promise.race` and `Promise.any`?
11. Why is `await` inside a loop sometimes a performance bug?
12. Why does `forEach(async () => {})` not wait?
13. How do you implement timeouts for async work?
14. How do you cancel fetch requests?
15. How do you avoid unbounded concurrency?
16. What is an unhandled promise rejection?
17. How would you debug async stack traces in production?

## 12. Senior-Level Pitfalls

### Pitfall 1: Sequential Work That Should Be Parallel

```js
const profile = await fetchProfile(id);
const orders = await fetchOrders(id);
const settings = await fetchSettings(id);
```

If independent, this adds unnecessary latency.

### Pitfall 2: Unbounded Parallelism

```js
await Promise.all(users.map((user) => sendEmail(user)));
```

For a huge user list, this can overwhelm SMTP, memory, network, or rate limits.

### Pitfall 3: Missing Timeout

```js
await fetch("https://dependency.example.com");
```

Without timeout/cancellation strategy, requests can hang or consume resources too long.

### Pitfall 4: Swallowed Rejections

```js
doWork().catch(() => {});
```

This hides failures and makes production debugging painful.

### Pitfall 5: Fire-And-Forget Without Ownership

```js
sendAnalytics(event);
```

If the promise rejects, who observes it? If the process exits, does it finish? If it repeats, is it idempotent?

### Pitfall 6: Partial Side Effects

```js
await chargeCard();
await saveOrder();
```

If `chargeCard` succeeds and `saveOrder` fails, the system needs recovery, reconciliation, or idempotency.

## 13. Best Practices

- Use `async` / `await` for readable sequential workflows.
- Use `Promise.all` for independent required work.
- Use `Promise.allSettled` for independent optional work.
- Bound concurrency for large collections.
- Always design timeout and cancellation behavior for network calls.
- Avoid `forEach` with async callbacks when you need to wait.
- Handle or intentionally propagate every rejection.
- Preserve error causes when wrapping errors.
- Use idempotency keys for retryable side effects.
- Add observability around async boundaries.
- Clean up timers, intervals, controllers, and subscriptions.
- Avoid fire-and-forget unless there is an explicit owner and error sink.

## 14. Debugging Scenarios

### Scenario 1: `done` Logs Too Early

```js
items.forEach(async (item) => {
  await save(item);
});

console.log("done");
```

Cause: `forEach` does not wait for returned promises.

Fix:

```js
await Promise.all(items.map((item) => save(item)));
console.log("done");
```

Or use `for...of` for sequential processing.

### Scenario 2: API Handler Hangs

```js
const result = await dependencyCall();
```

Likely cause: missing timeout or dependency never responds.

Debugging steps:

1. Add timing logs around the await.
2. Check dependency latency and error rate.
3. Add timeout with cancellation.
4. Decide retry policy.
5. Add metrics for timeout count and dependency duration.

### Scenario 3: Unhandled Promise Rejection

```js
async function run() {
  throw new Error("failed");
}

run();
```

Fix:

```js
await run();
```

Or:

```js
run().catch(reportError);
```

### Scenario 4: Slow Dashboard

```js
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();
```

If independent:

```js
const [a, b, c] = await Promise.all([
  fetchA(),
  fetchB(),
  fetchC(),
]);
```

Measure before and after.

### Scenario 5: Memory Growth During Batch

```js
await Promise.all(hugeList.map(processItem));
```

Cause: all promises and closures are created at once.

Fix: process with bounded concurrency.

### Scenario 6: User Navigates Away But Request Continues

Use `AbortController` and cleanup:

```js
const controller = new AbortController();

try {
  await fetch(url, { signal: controller.signal });
} finally {
  controller.abort();
}
```

In UI code, abort on unmount or route change.

## 15. Exercises / Practice

### Exercise 1

Predict the output:

```js
console.log("A");

Promise.resolve().then(() => console.log("B"));

console.log("C");
```

### Exercise 2

Predict the output:

```js
async function run() {
  console.log(1);
  await Promise.resolve();
  console.log(2);
}

run();
console.log(3);
```

### Exercise 3

Fix the bug:

```js
ids.forEach(async (id) => {
  await deleteUser(id);
});

console.log("all deleted");
```

### Exercise 4

Convert this callback-style flow to async/await:

```js
getUser(id, (error, user) => {
  if (error) return handle(error);
  getOrders(user.id, (ordersError, orders) => {
    if (ordersError) return handle(ordersError);
    render(user, orders);
  });
});
```

### Exercise 5

Write a `fetchWithTimeout(url, ms)` helper using `AbortController`.

### Exercise 6

Design a bounded-concurrency strategy for processing 10,000 items with a dependency limit of 10 concurrent requests.

### Exercise 7

Explain when `Promise.allSettled` is better than `Promise.all`.

## 16. Comparison

### Promise vs Async/Await

| Style | Strength | Risk |
|---|---|---|
| Promise chain | Good for pipeline composition | Missing `return` can break chains |
| Async/await | Reads like sequential code | Accidental sequential awaits |

### `Promise.all` vs `allSettled` vs `race` vs `any`

| API | Settles When | Rejection Behavior | Use Case |
|---|---|---|---|
| `Promise.all` | all fulfill | rejects on first rejection | all required |
| `Promise.allSettled` | all settle | never rejects from input rejection | partial success |
| `Promise.race` | first settles | follows first settlement | timeout/race |
| `Promise.any` | first fulfills | rejects only if all reject | use first successful source |

### Sequential vs Parallel vs Bounded

| Approach | Use When | Avoid When |
|---|---|---|
| Sequential `for...of await` | order matters, dependency limits are strict | independent work is latency-sensitive |
| `Promise.all` | small independent batch | huge list or strict rate limits |
| Bounded concurrency | large independent batch | implementation overhead is not worth it |

### Timeout vs Cancellation

| Concept | Meaning |
|---|---|
| Timeout | Stop waiting after a duration |
| Cancellation | Tell the underlying operation to stop |

`Promise.race` can stop waiting, but it does not cancel the losing operation unless the underlying API supports cancellation.

## 17. Related Concepts

Prerequisites:

- Call Stack
- Event Loop and Tasks
- Scope, Closures, and Hoisting
- Error Handling basics

Direct follow-ups:

- Error Handling
- WebSocket / Realtime Systems
- API Design
- Node.js Event Loop
- Background Jobs
- Idempotency
- Reliability Engineering

Production connections:

- request timeouts,
- retry policies,
- cancellation,
- idempotency,
- fan-out control,
- async context propagation,
- distributed tracing,
- frontend data fetching,
- background worker pipelines.

Knowledge graph:

```txt
Promise
  -> pending / fulfilled / rejected
  -> reactions
    -> microtasks
      -> async/await continuation
        -> error propagation
        -> concurrency control
        -> production timeout/cancellation strategy
```

## Advanced Add-ons

### Performance Impact

Promises are useful but not free. The big performance issue is usually not promise overhead; it is concurrency shape.

Watch for:

- accidental sequential latency,
- unbounded parallelism,
- promise chains retaining memory,
- microtask-heavy loops,
- too many in-flight network requests,
- CPU work hidden inside async functions,
- missing cancellation after work is no longer needed.

Measure:

- dependency latency,
- number of in-flight promises,
- timeout count,
- rejection rate,
- event-loop delay,
- memory growth,
- p95/p99 request or interaction latency.

### System Design Relevance

Promises and async/await affect system design because they define how a service coordinates unreliable dependencies.

Architecture questions:

- Which operations can run in parallel?
- Which operations must be sequential?
- Which operations need idempotency?
- What is the timeout budget?
- What is the retry policy?
- What happens after partial success?
- How is cancellation propagated?
- How is async work observed across boundaries?

Design rule:

```txt
Async workflow design is dependency orchestration, not just syntax.
```

### Security Impact

Async bugs can become security and reliability issues.

Risks:

- authorization check not awaited,
- promise rejection swallowed,
- race between permission update and action,
- sensitive data retained in pending promises,
- timeout missing for untrusted dependencies,
- duplicate side effects after retry,
- background task failure hidden from audit logs.

Defenses:

- await security-critical checks,
- fail closed on rejection,
- log audit-relevant async failures,
- use idempotency keys,
- add cancellation and timeout controls,
- avoid fire-and-forget for critical work.

### Browser vs Node Behavior

Shared:

- promises use microtasks,
- `async` functions return promises,
- `await` resumes asynchronously,
- unhandled rejections matter.

Browser:

- fetch supports `AbortController`,
- UI may unmount while async work is pending,
- async work competes with rendering and input,
- background tabs can throttle timers.

Node.js:

- unhandled rejection policy depends on Node version/configuration,
- server request handlers must observe returned promises,
- async context propagation is important for logs/traces,
- worker threads/background queues may be needed for CPU-heavy async workflows.

### Polyfill / Implementation

You can implement a very small promise-like object to understand the model, but production promises must follow the full specification.

Minimal mental model:

```js
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

Promisifying a callback:

```js
function readFileAsync(fs, path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(data);
    });
  });
}
```

Staff-level takeaway: use promises to model completion, use async/await to structure control flow, and design every async boundary with timeout, cancellation, error propagation, observability, and concurrency limits.

## 18. Summary

Promises and async/await are central to modern JavaScript asynchronous programming.

Remember:

- a promise represents eventual completion,
- promises settle once,
- promise reactions run as microtasks,
- promise executors run synchronously,
- an async function always returns a promise,
- `await` yields and resumes later,
- `try/catch` works with awaited rejections,
- missing `await` can hide failures,
- `Promise.all` fails fast,
- `Promise.allSettled` supports partial success,
- unbounded concurrency can break dependencies,
- timeouts and cancellation must be designed explicitly,
- production async workflows need observability, idempotency, and clear ownership.
