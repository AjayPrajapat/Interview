# 001.04.01 Error Handling

Category: JavaScript Core

Topic: 001.04 Production JavaScript

## 1. Definition

Error handling is the way JavaScript programs detect, represent, propagate, recover from, log, and communicate failures.

One-line version:

```txt
Error handling turns unexpected or invalid execution paths into controlled, observable, recoverable behavior.
```

Expanded explanation:

- Synchronous errors are usually represented by thrown exceptions.
- Asynchronous errors are often represented by rejected promises.
- Operational errors are expected production failures such as timeouts, validation failures, unavailable dependencies, or rate limits.
- Programmer errors are bugs such as undefined variables, type mistakes, broken invariants, or impossible states.
- Production error handling must decide whether to retry, fallback, fail closed, fail open, alert, or crash.

Good error handling is not hiding errors. It is preserving context and choosing the correct recovery path.

## 2. Why It Exists

Real systems fail constantly:

- users send invalid input,
- network calls time out,
- APIs return 500,
- JSON parsing fails,
- permissions are missing,
- deployments introduce regressions,
- browser extensions interfere,
- storage quotas are exceeded,
- services return partial data.

Error handling exists so these failures do not become silent data corruption, security holes, poor user experiences, or untraceable incidents.

Senior-level reason:

In production, the important question is not "can I catch this error?" It is "what is the correct failure semantics for this boundary, and how will operators know what happened?"

## 3. Syntax & Variants

### Throwing

```js
throw new Error("Invalid user id");
```

Throw actual `Error` objects when possible so stack traces and metadata are preserved.

### Try/Catch

```js
try {
  riskyOperation();
} catch (error) {
  handle(error);
}
```

`catch` handles synchronous throws inside the `try` block.

### Finally

```js
let lockAcquired = false;

try {
  acquireLock();
  lockAcquired = true;
  performWork();
} finally {
  if (lockAcquired) releaseLock();
}
```

`finally` is for cleanup that must run on success or failure.

### Async/Await Error Handling

```js
try {
  const user = await fetchUser(id);
  return user;
} catch (error) {
  throw new Error("Failed to fetch user", { cause: error });
}
```

`try/catch` catches awaited promise rejections.

### Promise Catch

```js
fetchUser(id).catch((error) => {
  report(error);
});
```

Use when working directly with promises.

### Custom Error

```js
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}
```

Custom errors encode domain meaning.

### Error Cause

```js
throw new Error("Checkout failed", { cause: originalError });
```

Use `cause` to preserve the lower-level failure.

### Result Object

```js
return { ok: false, error: "invalid_email" };
```

Useful for expected validation or business-rule failures where exceptions would be too heavy or unclear.

## 4. Internal Working

### Synchronous Throw

```js
function a() {
  b();
}

function b() {
  throw new Error("boom");
}

a();
```

Internal flow:

```txt
b throws
  -> engine looks for nearest catch
  -> if none in b, unwind b frame
  -> if none in a, unwind a frame
  -> if none globally, unhandled error
```

### Stack Trace

An `Error` captures where it was created/thrown.

```js
const error = new Error("failed");
console.log(error.stack);
```

Stack traces help identify the synchronous call path.

### Promise Rejection

```js
async function run() {
  throw new Error("failed");
}

run();
```

Throwing inside an async function rejects the returned promise.

If nobody handles it, the runtime may report an unhandled rejection.

### Await And Catch

```js
try {
  await run();
} catch (error) {
  console.log("caught");
}
```

The rejection is converted back into a throw at the `await` point.

### Error Classification

Production systems usually separate:

```txt
validation error -> return 400 / show user feedback
authentication error -> return 401
authorization error -> return 403
not found -> return 404
dependency timeout -> retry/fallback/503
programmer bug -> log, alert, fail fast or isolate
```

## 5. Memory Behavior

Errors can retain memory through stack traces, causes, metadata, and closures.

Example:

```js
try {
  processLargePayload(payload);
} catch (error) {
  errors.push({ error, payload });
}
```

This retains the entire payload.

Better:

```js
logger.error({
  error,
  payloadId: payload.id,
  size: payload.length,
}, "payload processing failed");
```

Memory considerations:

- stack traces are strings/metadata,
- `cause` chains retain nested errors,
- error objects stored in arrays can accumulate,
- logs should not retain large objects unnecessarily,
- monitoring SDK breadcrumbs may store context,
- long-lived rejected promises can retain closures.

Do not attach huge objects or secrets directly to errors.

## 6. Execution Behavior

### Synchronous Catch

```js
try {
  JSON.parse("{bad json");
} catch (error) {
  console.log("invalid JSON");
}
```

Works because the error is thrown synchronously.

### Async Boundary

```js
try {
  setTimeout(() => {
    throw new Error("later");
  }, 0);
} catch {
  console.log("not caught");
}
```

The catch does not run because the callback executes in a later task.

### Awaited Rejection

```js
try {
  await Promise.reject(new Error("failed"));
} catch (error) {
  console.log("caught");
}
```

Works because the rejection is awaited.

### Unawaited Rejection

```js
try {
  Promise.reject(new Error("failed"));
} catch {
  console.log("not caught");
}
```

The promise rejects asynchronously; the synchronous catch does not catch it.

### Finally Return Trap

```js
function run() {
  try {
    throw new Error("failed");
  } finally {
    return "hidden";
  }
}
```

Returning from `finally` suppresses the thrown error. Avoid this.

## 7. Scope & Context Interaction

Errors need context, but context must be controlled.

Useful context:

- request ID,
- user ID or tenant ID when safe,
- route or operation name,
- dependency name,
- retry attempt,
- timeout duration,
- feature flag state,
- deploy version.

Dangerous context:

- passwords,
- tokens,
- full request bodies,
- credit card data,
- sensitive headers,
- large payloads,
- raw PII.

### Error Wrapping

```js
try {
  await paymentProvider.charge(input);
} catch (error) {
  throw new Error("Payment provider charge failed", {
    cause: error,
  });
}
```

Wrapping adds business context while preserving root cause.

### Async Context

Errors crossing async boundaries need correlation IDs.

```js
logger.error({ requestId, error }, "request failed");
```

Without correlation, stack traces alone may not reconstruct distributed workflows.

## 8. Common Examples

### Validation Error

```js
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}
```

### HTTP Handler

```js
async function handler(req, res) {
  try {
    const user = await createUser(req.body);
    res.statusCode = 201;
    res.end(JSON.stringify(user));
  } catch (error) {
    if (error instanceof ValidationError) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: error.message }));
      return;
    }

    logger.error({ error }, "create user failed");
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "internal_error" }));
  }
}
```

### Retry With Backoff

```js
async function retry(operation, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await delay(attempt * 100);
    }
  }

  throw new Error("Operation failed after retries", { cause: lastError });
}
```

Retry only safe, idempotent operations.

### Fallback

```js
async function loadRecommendations(userId) {
  try {
    return await recommendationService.load(userId);
  } catch (error) {
    logger.warn({ error, userId }, "recommendations unavailable");
    return [];
  }
}
```

Fallback is appropriate when degraded behavior is acceptable.

### Fail Closed

```js
async function canAccess(user, resource) {
  try {
    return await policy.check(user, resource);
  } catch (error) {
    logger.error({ error }, "policy check failed");
    return false;
  }
}
```

Security checks should usually fail closed.

## 9. Confusing / Tricky Examples

### Throwing Strings

```js
throw "failed";
```

Avoid this. Strings do not provide normal stack/error metadata.

### Catching Too Broadly

```js
try {
  return parse(input);
} catch {
  return {};
}
```

This hides bugs and corrupts data.

### Swallowing Promise Rejection

```js
doWork().catch(() => {});
```

If intentional, document why and emit observability.

### `finally` Suppression

```js
try {
  throw new Error("original");
} finally {
  throw new Error("cleanup failed");
}
```

The cleanup error can mask the original error.

### Async Timer Error

```js
try {
  setTimeout(() => {
    throw new Error("boom");
  }, 0);
} catch {
  // not caught
}
```

Handle inside the callback or use promise-based wrappers.

### `fetch` And HTTP Errors

```js
const response = await fetch("/missing");
```

`fetch` does not reject for HTTP 404/500. Check `response.ok`.

## 10. Real Production Use Cases

### API Error Mapping

Map internal errors to safe external responses:

```txt
ValidationError -> 400
AuthError -> 401
ForbiddenError -> 403
NotFoundError -> 404
DependencyTimeout -> 503
UnknownError -> 500
```

Do not expose internal stack traces to users.

### Frontend Error Boundaries

React error boundaries catch render errors, not async event-handler errors.

Use both UI boundaries and async error reporting.

### Background Jobs

Job errors need retry policy:

- retryable vs non-retryable,
- max attempts,
- dead-letter queue,
- idempotency,
- alerting after repeated failure.

### Payments

Payment errors require careful classification:

- card declined,
- provider timeout,
- duplicate request,
- unknown result,
- fraud hold,
- reconciliation required.

### Observability

Production errors need:

- structured logs,
- metrics,
- traces,
- error grouping,
- release version,
- customer impact,
- alert routing.

## 11. Interview Questions

1. What is the difference between throw and return-error patterns?
2. How does `try/catch` work with async/await?
3. Why does `try/catch` not catch a timer callback throw?
4. What is an unhandled promise rejection?
5. How do you design custom error classes?
6. What is `Error.cause` useful for?
7. What is the difference between operational and programmer errors?
8. When should you retry?
9. When should you not retry?
10. What does fail closed mean?
11. How should API errors be mapped to HTTP status codes?
12. How do you avoid leaking secrets in errors?
13. How do you preserve stack traces?
14. How do frontend error boundaries work?
15. How would you debug a production spike in errors?

## 12. Senior-Level Pitfalls

### Pitfall 1: Swallowing Errors

```js
catch (error) {
  return null;
}
```

This converts unknown failure into ambiguous data.

### Pitfall 2: Retrying Non-Idempotent Operations

Retrying payment capture or order creation without idempotency can duplicate side effects.

### Pitfall 3: Logging Sensitive Data

```js
logger.error({ body: req.body }, "request failed");
```

This can leak PII or secrets.

### Pitfall 4: One Generic Error Type

If every failure becomes `Error("failed")`, callers cannot choose correct recovery.

### Pitfall 5: Alerting On User Mistakes

Validation errors should not page the on-call team.

### Pitfall 6: Hiding Root Cause

Wrapping without `cause` loses the original stack and message.

## 13. Best Practices

- Throw `Error` objects, not strings.
- Use custom errors for meaningful domain categories.
- Preserve root cause with `cause`.
- Catch errors at boundaries where you can add context or recover.
- Do not catch just to hide errors.
- Validate inputs before business logic.
- Separate user-safe messages from internal logs.
- Retry only safe operations.
- Add timeouts to dependency calls.
- Fail closed for security and authorization.
- Add structured logs with correlation IDs.
- Avoid logging secrets or large payloads.
- Test failure paths, not only happy paths.

## 14. Debugging Scenarios

### Scenario 1: API Returns 500 For Bad Input

Cause: validation error is not classified.

Fix:

```js
if (error instanceof ValidationError) {
  return send(400, { error: error.message });
}
```

### Scenario 2: Unhandled Promise Rejection

```js
async function run() {
  throw new Error("failed");
}

run();
```

Fix:

```js
run().catch((error) => logger.error({ error }, "run failed"));
```

Or `await run()` inside an async boundary.

### Scenario 3: Unknown Payment Result

If a payment provider times out after receiving the request, retrying blindly may double-charge.

Fix:

- use idempotency key,
- query provider state,
- reconcile before retry,
- record durable attempt state.

### Scenario 4: Error Spike After Deploy

Debugging steps:

1. Group errors by release version.
2. Check top stack frames.
3. Compare affected routes/tenants.
4. Inspect recent config changes.
5. Roll back or disable feature flag.
6. Add regression test for the failure.

### Scenario 5: Frontend Blank Screen

Likely causes:

- render error without boundary,
- chunk loading failure,
- unhandled async error,
- incompatible API response.

Fix:

- add error boundary,
- report errors,
- show fallback UI,
- validate API response shape.

### Scenario 6: Cleanup Masks Original Error

```js
try {
  await writeData();
} finally {
  await cleanup(); // throws and hides writeData error
}
```

Fix: catch cleanup errors separately and preserve both contexts.

## 15. Exercises / Practice

### Exercise 1

Explain why this does not catch:

```js
try {
  setTimeout(() => {
    throw new Error("boom");
  }, 0);
} catch {}
```

### Exercise 2

Write a `ValidationError` and map it to HTTP 400.

### Exercise 3

Fix this swallowed error:

```js
try {
  await save();
} catch {
  return null;
}
```

### Exercise 4

Design retry rules for:

- GET profile,
- POST payment charge,
- sending analytics,
- updating password.

### Exercise 5

Wrap a dependency error with `cause` and safe context.

### Exercise 6

Create a logging payload that includes request ID and operation name but excludes secrets.

## 16. Comparison

### Throw vs Result Object

| Approach | Use When | Risk |
|---|---|---|
| Throw exception | unexpected failure or boundary abort | overused for normal validation |
| Result object | expected business outcome | caller may ignore error branch |

### Operational vs Programmer Error

| Type | Example | Handling |
|---|---|---|
| Operational | timeout, invalid input, rate limit | recover, retry, fallback, return safe response |
| Programmer | undefined variable, invariant broken | log, alert, fix bug, maybe fail fast |

### Retry vs Fallback vs Fail

| Strategy | Use When |
|---|---|
| Retry | transient, idempotent, bounded |
| Fallback | degraded result is acceptable |
| Fail closed | security/correctness risk |
| Fail open | availability matters more and risk is acceptable |

## 17. Related Concepts

Prerequisites:

- Call Stack
- Event Loop and Tasks
- Promises and Async/Await
- Scope and Closures

Direct follow-ups:

- Production Debugging
- Incident Management
- Observability
- Logging
- Monitoring
- API Design
- Reliability Engineering

Production connections:

- HTTP status mapping,
- retries and backoff,
- idempotency,
- circuit breakers,
- dead-letter queues,
- frontend error boundaries,
- distributed tracing,
- alert design.

Knowledge graph:

```txt
Failure
  -> classify
    -> recover / retry / fallback / fail
      -> log and trace
        -> alert if actionable
          -> fix or mitigate
```

## Advanced Add-ons

### Performance Impact

Creating and throwing errors has cost, especially stack capture.

Guidelines:

- do not use exceptions for tight-loop control flow,
- avoid huge error metadata,
- sample noisy expected errors,
- preserve enough context for debugging,
- watch error storms after dependency failures.

### System Design Relevance

Error handling defines system reliability behavior.

Design questions:

- Who owns this failure?
- Is it retryable?
- Is it idempotent?
- Is fallback safe?
- Should users see this?
- Should on-call be alerted?
- What is the blast radius?

### Security Impact

Error handling can leak information or fail insecurely.

Risks:

- stack traces exposed to users,
- tokens logged,
- authorization failures treated as success,
- fail-open behavior on policy errors,
- detailed auth messages enabling enumeration.

Defenses:

- safe external messages,
- structured internal logs,
- secret redaction,
- fail closed for security checks,
- consistent auth error responses.

### Browser vs Node Behavior

Browser:

- global `window.onerror`,
- `unhandledrejection` event,
- framework error boundaries,
- chunk loading errors,
- user-facing fallback UI.

Node.js:

- unhandled promise rejection handling depends on runtime/config,
- uncaught exceptions may require process restart,
- server frameworks provide error middleware/filters,
- background jobs need retry/dead-letter behavior.

### Polyfill / Implementation

Implement safe wrappers and domain errors.

```js
class AppError extends Error {
  constructor(message, { code, status, cause } = {}) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}
```

Boundary wrapper:

```js
async function withErrorLogging(operation, context) {
  try {
    return await operation();
  } catch (error) {
    logger.error({ error, ...context }, "operation failed");
    throw error;
  }
}
```

Staff-level takeaway: production error handling is a contract between code, users, operators, and business risk.

## 18. Summary

Error handling is production control flow for failure.

Remember:

- throw `Error` objects,
- classify errors by meaning,
- catch at boundaries where you can recover or add context,
- do not swallow unknown failures,
- `try/catch` catches awaited rejections, not un-awaited async work,
- preserve causes,
- retry only safe idempotent operations,
- fail closed for security,
- avoid leaking sensitive data,
- make errors observable with logs, metrics, traces, and correlation IDs,
- test failure paths as seriously as happy paths.
