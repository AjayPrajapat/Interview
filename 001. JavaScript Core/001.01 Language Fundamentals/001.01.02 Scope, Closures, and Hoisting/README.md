# 001.01.02 Scope, Closures, and Hoisting

Category: JavaScript Core

Topic: 001.01 Language Fundamentals

## 1. Definition

Scope defines where an identifier can be accessed.

Closures allow a function to remember variables from the lexical environment where it was created, even after that outer function has finished executing.

Hoisting is the creation-phase behavior where JavaScript registers declarations before executing code line by line.

One-line version:

```txt
Scope decides visibility, closures preserve lexical access, and hoisting explains why declarations behave before their source line executes.
```

Expanded explanation:

- Scope answers: "Can this code see this variable?"
- Closure answers: "Why can this function still access that variable later?"
- Hoisting answers: "Why does this identifier exist before the declaration line runs?"

These three concepts belong together because they all come from the same engine model: execution contexts and lexical environments.

## 2. Why It Exists

JavaScript needs scope so different parts of a program can use names without constantly colliding.

JavaScript needs closures because functions are first-class values. A function can be returned, passed into another function, stored in an object, used as an event handler, used as a React callback, or scheduled asynchronously. If functions did not remember their lexical environment, common JavaScript patterns would break.

JavaScript has hoisting because engines create execution contexts before executing statements. During this creation phase, declarations are registered so the engine knows which identifiers belong to the current environment.

Problems solved:

- local variables can be isolated from global variables,
- functions can keep private state,
- callbacks can access the data they were created with,
- modules can hide implementation details,
- declaration behavior becomes deterministic during execution context creation.

Senior-level reason:

Scope, closures, and hoisting are not trivia. They control state ownership, memory retention, async behavior, and many production bugs in frontend and backend JavaScript.

## 3. Syntax & Variants

### Global Scope

```js
const appName = "Interview Prep";

function start() {
  console.log(appName);
}
```

`appName` is visible to `start` because `start` is created in a scope that can access the outer binding.

### Function Scope

```js
function calculate() {
  var total = 10;
  const tax = 2;
  return total + tax;
}

console.log(total); // ReferenceError
```

Variables declared inside a function are not visible outside that function.

### Block Scope

```js
if (true) {
  let count = 1;
  const limit = 5;
}

console.log(count); // ReferenceError
```

`let` and `const` are block-scoped. `var` is not.

### Lexical Scope

```js
const role = "admin";

function canDelete() {
  return role === "admin";
}
```

`canDelete` resolves `role` based on where the function was created, not where it is called.

### Closure

```js
function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
```

The inner function closes over `count`.

### Hoisting With `var`

```js
console.log(value); // undefined
var value = 10;
```

The declaration is registered and initialized to `undefined` during creation phase. The assignment still happens later.

### Hoisting With `let` / `const`

```js
console.log(value); // ReferenceError
let value = 10;
```

The binding exists but is uninitialized until execution reaches the declaration. This period is the temporal dead zone.

### Function Declaration Hoisting

```js
run(); // "running"

function run() {
  return "running";
}
```

Function declarations are hoisted with their function object initialized.

### Function Expression Hoisting

```js
run(); // TypeError: run is not a function

var run = function () {
  return "running";
};
```

Only the `var run` declaration is hoisted to `undefined`. The function assignment happens later.

## 4. Internal Working

JavaScript executes code inside execution contexts. Each execution context has environment records that store bindings.

Engine-level flow:

```txt
Parse source code
  -> build internal representation
  -> create execution context
  -> create lexical environment
  -> scan declarations
  -> create bindings
  -> initialize function declarations and var declarations
  -> leave let/const/class uninitialized
  -> execute code line by line
```

### Scope Chain

When JavaScript resolves an identifier, it checks the current environment first, then walks outward.

```txt
Current block environment
  -> function environment
  -> module/global environment
  -> ReferenceError if not found
```

Example:

```js
const level = "global";

function outer() {
  const level = "outer";

  function inner() {
    const level = "inner";
    return level;
  }

  return inner();
}
```

`inner` returns `"inner"` because the nearest binding wins.

### Closure Internals

When a function is created, it receives an internal reference to its lexical environment.

```txt
function object
  -> code body
  -> [[Environment]] reference
```

If the function escapes the outer function, the referenced environment stays alive.

```js
function createReader(secret) {
  return function readSecret() {
    return secret;
  };
}
```

`secret` is not destroyed when `createReader` returns because `readSecret` can still access it.

### Hoisting Internals

Hoisting is better understood as binding creation, not physical movement of code.

```js
console.log(a);
var a = 1;
```

Engine mental model:

```txt
Creation phase:
  a -> undefined

Execution phase:
  console.log(a)
  a = 1
```

For `let`:

```txt
Creation phase:
  a -> uninitialized

Execution phase:
  console.log(a) -> ReferenceError
  a = 1
```

## 5. Memory Behavior

Scope affects memory because variables live as long as their environment is reachable.

Normal function local variables can be garbage-collected after the function returns:

```js
function buildMessage() {
  const message = "hello";
  return message;
}
```

`message` does not need to stay alive after `buildMessage` finishes.

Closure-retained variables stay alive:

```js
function registerLargeData(data) {
  return function handler() {
    return data.id;
  };
}
```

If `handler` remains reachable, `data` remains reachable.

Memory model:

```txt
handler
  -> [[Environment]]
    -> data
      -> large object
```

Optimization:

```js
function registerLargeData(data) {
  const id = data.id;

  return function handler() {
    return id;
  };
}
```

Now the closure retains only `id`, not the whole object.

Production memory risks:

- event listeners closing over large state,
- React effects retaining stale props,
- long-lived timers retaining request data,
- module-level variables holding caches forever,
- closures in arrays or maps preventing garbage collection.

## 6. Execution Behavior

Scope is resolved at runtime by walking lexical environments.

Closures are created when functions are created, not when functions are called.

Hoisting happens during execution context creation, before normal line-by-line execution.

Execution timeline:

```txt
1. Source code is parsed.
2. Execution context is created.
3. Declarations are registered.
4. Function declarations and var bindings are initialized.
5. let/const/class bindings remain uninitialized.
6. Code executes line by line.
7. Function calls create new execution contexts.
8. Closures preserve outer lexical environments when needed.
```

Async interaction:

```js
function run() {
  const value = "created before timeout";

  setTimeout(() => {
    console.log(value);
  }, 100);
}

run();
```

The callback runs later, but it still sees `value` because the callback closed over the lexical environment created by `run`.

Loop interaction:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

Output:

```txt
3
3
3
```

`var` creates one shared function/global binding.

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

Output:

```txt
0
1
2
```

`let` creates a fresh per-iteration binding for the loop body.

## 7. Scope & Context Interaction

### Lexical Scope vs Dynamic Call Site

JavaScript scope is lexical. It depends on where code is written, not where a function is called.

```js
const name = "global";

function printName() {
  console.log(name);
}

function run() {
  const name = "local";
  printName();
}

run(); // "global"
```

`printName` was created in the global lexical environment, so it reads the global `name`.

### Closure and Request Context

In Node.js, closures are often used to capture request-scoped data:

```js
function createLogger(requestId) {
  return function log(message) {
    console.log({ requestId, message });
  };
}
```

This is useful because each request can get a logger that remembers its `requestId`.

Risk:

```js
const logs = [];

function handleRequest(req) {
  logs.push(() => req);
}
```

The closure stores the entire request object. This can retain headers, body, auth data, and other sensitive or large objects.

### `this` Is Not Lexical Scope

Normal functions get `this` from how they are called.

```js
const user = {
  name: "Ajay",
  sayName() {
    return this.name;
  },
};

const fn = user.sayName;
fn(); // undefined in strict mode context, or global-dependent behavior
```

Arrow functions close over `this` lexically:

```js
function createUser() {
  return {
    name: "Ajay",
    sayLater() {
      setTimeout(() => {
        console.log(this.name);
      }, 100);
    },
  };
}
```

The arrow callback uses the `this` from `sayLater`.

### Module Scope

ES modules have their own top-level scope.

```js
const internalCache = new Map();

export function getFromCache(key) {
  return internalCache.get(key);
}
```

`internalCache` is private to the module, but it is also long-lived for the life of the module instance.

## 8. Common Examples

### Private State With Closure

```js
function createCounter() {
  let count = 0;

  return {
    increment() {
      count += 1;
      return count;
    },
    reset() {
      count = 0;
    },
  };
}
```

The object methods share the same closed-over `count`.

### Function Factory

```js
function createMultiplier(factor) {
  return function multiply(value) {
    return value * factor;
  };
}

const double = createMultiplier(2);
double(5); // 10
```

### React Callback Closure

```jsx
function SearchBox({ query }) {
  function handleSubmit() {
    console.log("Submitting", query);
  }

  return <button onClick={handleSubmit}>Search</button>;
}
```

`handleSubmit` closes over the `query` value from that render.

### Node Middleware Closure

```js
function requireRole(role) {
  return function middleware(req, res, next) {
    if (!req.user?.roles.includes(role)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    next();
  };
}
```

The middleware remembers the required role.

## 9. Confusing / Tricky Examples

### Hoisting Does Not Move Assignment

```js
console.log(a); // undefined
var a = 10;
```

Only the declaration is hoisted. The assignment stays in place.

### TDZ With Shadowing

```js
const value = "outer";

{
  console.log(value); // ReferenceError
  const value = "inner";
}
```

The inner `value` shadows the outer `value` for the entire block, but it is uninitialized before the declaration line.

### Function Declaration vs Function Expression

```js
runA(); // works
runB(); // TypeError

function runA() {}

var runB = function () {};
```

`runA` is initialized during creation phase. `runB` starts as `undefined`.

### Closure Captures Binding, Not Snapshot

```js
let count = 0;

const getCount = () => count;

count = 5;

console.log(getCount()); // 5
```

The closure sees the binding, not a frozen copy of the initial value.

### Stale Closure In React

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count);
    }, 1000);

    return () => clearInterval(id);
  }, []);
}
```

The interval callback closes over the initial `count` because the dependency array is empty.

## 10. Real Production Use Cases

### Encapsulation

Closures hide internal state:

```js
function createTokenStore() {
  let token = null;

  return {
    set(nextToken) {
      token = nextToken;
    },
    get() {
      return token;
    },
  };
}
```

### Request-Scoped Utilities

```js
function createRequestTools(req) {
  const requestId = req.headers["x-request-id"];

  return {
    log(message) {
      console.log({ requestId, message });
    },
  };
}
```

### Frontend Event Handlers

```js
function createClickHandler(productId) {
  return function onClick() {
    track("product_clicked", { productId });
  };
}
```

### Configuration Factories

```js
function createApiClient(baseUrl) {
  return function request(path) {
    return fetch(`${baseUrl}${path}`);
  };
}
```

### Module-Level Caches

```js
const cache = new Map();

export function getCached(key, load) {
  if (!cache.has(key)) {
    cache.set(key, load());
  }

  return cache.get(key);
}
```

This is useful but requires bounds, invalidation, and ownership.

## 11. Interview Questions

1. What is lexical scope?
2. What is the difference between function scope and block scope?
3. What is a closure?
4. What does a closure capture: value or binding?
5. What is hoisting?
6. Why does `var` return `undefined` before declaration?
7. Why do `let` and `const` throw before declaration?
8. What is the temporal dead zone?
9. Why does `var` in a loop often produce `3, 3, 3`?
10. How does `let` fix loop closure bugs?
11. How can closures cause memory leaks?
12. How do closures appear in React hooks?
13. How do closures appear in Node.js middleware?
14. What is the difference between lexical scope and `this`?
15. How would you debug stale closure behavior in production?

## 12. Senior-Level Pitfalls

### Pitfall 1: Long-Lived Closures Retaining Large Objects

```js
function subscribe(userProfile) {
  window.addEventListener("resize", () => {
    console.log(userProfile.preferences.layout);
  });
}
```

The listener retains `userProfile` until removed.

### Pitfall 2: Shared Module State In Servers

```js
let currentUser;

export function setCurrentUser(user) {
  currentUser = user;
}
```

This is dangerous in Node.js servers because concurrent requests can overwrite shared state.

### Pitfall 3: Stale Closures In UI

Callbacks can close over old props or state if dependency tracking is wrong.

### Pitfall 4: Confusing Hoisting With Reordering

Hoisting does not mean JavaScript physically moves code. It means bindings are created during execution context setup.

### Pitfall 5: Hidden Coupling Through Closures

A function may look pure but depend on closed-over mutable state.

```js
let discount = 0.1;

function priceAfterDiscount(price) {
  return price * (1 - discount);
}
```

Tests can become order-dependent if `discount` changes elsewhere.

## 13. Best Practices

- Prefer `const` and `let` over `var`.
- Keep variable scope as narrow as possible.
- Avoid module-level mutable state for request-specific data.
- Use closures intentionally for encapsulation and function factories.
- Avoid capturing large objects when only a small value is needed.
- Clean up timers, subscriptions, event listeners, and intervals.
- In React, include correct dependencies or use functional state updates.
- Name closed-over values clearly.
- Treat closures as retained references during memory debugging.
- Explain hoisting as binding creation, not code movement.

## 14. Debugging Scenarios

### Scenario 1: Unexpected `undefined`

```js
console.log(total);
var total = calculateTotal();
```

Cause: `var` hoisting initializes `total` to `undefined`.

Fix:

```js
const total = calculateTotal();
console.log(total);
```

### Scenario 2: ReferenceError Inside Block

```js
const user = "outer";

if (true) {
  console.log(user);
  const user = "inner";
}
```

Cause: TDZ caused by block-scoped shadowing.

Fix: rename the inner binding or move the declaration before use.

### Scenario 3: Wrong Value In Async Loop

```js
for (var i = 0; i < urls.length; i++) {
  setTimeout(() => fetch(urls[i]), 0);
}
```

Cause: all callbacks share one `i`.

Fix:

```js
for (let i = 0; i < urls.length; i++) {
  setTimeout(() => fetch(urls[i]), 0);
}
```

### Scenario 4: Memory Leak From Event Listener

```js
function mount(data) {
  window.addEventListener("click", () => {
    console.log(data.id);
  });
}
```

Cause: listener retains `data`.

Fix: remove the listener or capture only what is needed.

```js
function mount(data) {
  const id = data.id;

  function onClick() {
    console.log(id);
  }

  window.addEventListener("click", onClick);

  return () => window.removeEventListener("click", onClick);
}
```

### Scenario 5: Stale State In React

```jsx
setInterval(() => {
  setCount(count + 1);
}, 1000);
```

Fix:

```jsx
setInterval(() => {
  setCount((current) => current + 1);
}, 1000);
```

Functional updates avoid depending on a stale closed-over `count`.

## 15. Exercises / Practice

### Exercise 1

Predict the output:

```js
console.log(a);
var a = 1;
console.log(a);
```

### Exercise 2

Predict the output:

```js
const value = "outer";

function run() {
  console.log(value);
}

function wrapper() {
  const value = "inner";
  run();
}

wrapper();
```

### Exercise 3

Fix the bug:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
```

### Exercise 4

Explain why this returns `2`:

```js
function outer() {
  let count = 1;

  return function inner() {
    count += 1;
    return count;
  };
}

const fn = outer();
console.log(fn());
```

### Exercise 5

Refactor this to avoid retaining the whole request:

```js
function createAuditLogger(req) {
  return function log(action) {
    console.log(req.user.id, req.headers, action);
  };
}
```

## 16. Comparison

### Scope vs Closure vs Hoisting

| Concept | Main Question | Example |
|---|---|---|
| Scope | Where is this name visible? | Block, function, module, global |
| Closure | Why can this function access old outer variables? | Function returned from another function |
| Hoisting | Why does declaration behavior happen before source order? | `var` reads as `undefined` |

### `var` vs `let` In Loops

| Feature | `var` | `let` |
|---|---|---|
| Loop binding | One shared binding | Per-iteration binding |
| Async callback behavior | Often captures final value | Captures iteration value |
| Scope | Function/global | Block |
| Modern use | Avoid | Prefer |

### Closure vs Object Private State

| Approach | Use When | Trade-Off |
|---|---|---|
| Closure private state | Simple encapsulation, function factories | Can retain memory invisibly |
| Object field | State should be inspectable or serializable | Less private by default |
| Class private field | Object-oriented API with privacy | Requires class semantics |

## 17. Related Concepts

Prerequisites:

- Variables & Declarations
- Execution Context
- Call Stack

Direct follow-ups:

- Functions Basics
- `this` keyword
- Prototypes
- Event Loop
- Promises and Async/Await
- Modules
- Garbage Collection

Production connections:

- React hooks and stale closures
- Node request lifecycle
- frontend event listeners
- memory leaks
- module-level caches
- async callbacks
- observability context propagation

Knowledge graph:

```txt
Execution Context
  -> Lexical Environment
    -> Scope Chain
      -> Identifier Resolution
      -> Closures
      -> Hoisting
        -> TDZ
        -> var/let/const behavior
```

## Advanced Add-ons

### Performance Impact

Closures are not inherently slow. Problems appear when closures retain large data, prevent garbage collection, or make hot code harder for the engine to optimize.

Performance considerations:

- avoid unnecessary closures in extremely hot loops unless measured,
- avoid capturing large objects in long-lived callbacks,
- avoid shape-changing objects captured by hot closures,
- remove listeners and timers when no longer needed,
- use profiling before changing code for performance.

### System Design Relevance

Scope and closures influence system design through state ownership.

Examples:

- request-scoped logging context,
- dependency injection factories,
- authentication middleware,
- module-level caches,
- background worker state,
- frontend component state and callbacks.

Design question:

```txt
Should this state live in a closure, an object, a request context, a cache, a database, or a service boundary?
```

### Security Impact

Closures can retain sensitive data longer than expected.

Security risks:

- closed-over tokens in browser callbacks,
- request objects retained after response,
- PII captured in logs,
- authorization context reused across users,
- accidental globals exposing data.

Best security practice: capture the smallest safe value and avoid retaining secrets longer than necessary.

### Browser vs Node Behavior

Browser:

- event listeners commonly create long-lived closures,
- global script `var` can attach to `window`,
- closures often retain DOM nodes,
- memory leaks can come from detached DOM references.

Node.js:

- module scope is long-lived,
- server processes handle many requests in one runtime,
- module-level state is shared across requests in the same process,
- closures can retain request, response, socket, or auth objects.

### Polyfill / Implementation

You cannot fully polyfill lexical scope, closures, or hoisting because they are engine-level language semantics.

You can simulate closure-like private state:

```js
function createBox(initialValue) {
  let value = initialValue;

  return {
    get() {
      return value;
    },
    set(nextValue) {
      value = nextValue;
    },
  };
}
```

You can transpile some block-scoping behavior for older environments, but perfect TDZ and lexical semantics are difficult to emulate without overhead.

## 18. Summary

Scope, closures, and hoisting are core JavaScript execution concepts.

Remember:

- Scope controls where names are visible.
- JavaScript uses lexical scope.
- Closures let functions remember outer bindings.
- Closures capture bindings, not frozen values.
- Hoisting is binding creation during execution context setup.
- `var` is initialized to `undefined`.
- `let`, `const`, and `class` are hoisted but uninitialized until execution reaches them.
- TDZ errors often come from shadowing.
- Closures are powerful for encapsulation, callbacks, factories, and middleware.
- Closures can also cause stale state and memory leaks.
- Senior engineers reason about lifetime, ownership, cleanup, and observability.
