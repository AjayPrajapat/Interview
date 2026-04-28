# 001.03.01 Equality and Coercion

Category: JavaScript Core

Topic: 001.03 Advanced Runtime Behavior

## 1. Definition

Equality is the set of JavaScript rules used to decide whether two values should be considered the same.

Coercion is the automatic or explicit conversion of a value from one type to another.

One-line version:

```txt
Equality answers "are these values the same?", while coercion answers "what type conversion happens before or during that comparison?"
```

JavaScript has multiple equality algorithms:

- `==` loose equality with coercion,
- `===` strict equality without most coercion,
- `Object.is` SameValue comparison,
- SameValueZero used by `Map`, `Set`, and `Array.prototype.includes`.

Example:

```js
0 == false; // true
0 === false; // false
Object.is(NaN, NaN); // true
[NaN].includes(NaN); // true
```

Mastery means knowing which algorithm is being used, what conversion happens, and which edge cases can break production logic.

## 2. Why It Exists

JavaScript was designed to be flexible across browser forms, strings, numbers, objects, and dynamic data. Coercion made early web programming convenient:

```js
"42" == 42; // true
```

But convenience creates ambiguity.

Equality rules exist because the language must compare:

- primitives,
- object references,
- numbers and numeric strings,
- booleans,
- `null` and `undefined`,
- `NaN`,
- signed zero,
- symbols,
- BigInts,
- boxed primitives,
- values crossing JSON/API boundaries.

Senior-level reason:

Equality and coercion are a source of subtle bugs in validation, feature flags, form handling, API parsing, caching, authorization checks, analytics, and distributed systems where data often arrives as strings.

## 3. Syntax & Variants

### Strict Equality

```js
value === expected;
value !== expected;
```

Use this as the default comparison.

```js
1 === 1; // true
1 === "1"; // false
```

### Loose Equality

```js
value == expected;
value != expected;
```

Loose equality can coerce types before comparing.

```js
1 == "1"; // true
false == 0; // true
```

### `Object.is`

```js
Object.is(value, expected);
```

Useful when `NaN` and `-0` matter.

```js
Object.is(NaN, NaN); // true
Object.is(0, -0); // false
```

### SameValueZero

Used by `includes`, `Map`, and `Set`.

```js
[NaN].includes(NaN); // true

const set = new Set([NaN]);
set.has(NaN); // true
```

SameValueZero treats `NaN` as equal to itself and treats `0` and `-0` as equal.

### Explicit Coercion

```js
Number("42"); // 42
String(42); // "42"
Boolean(""); // false
BigInt("42"); // 42n
```

Prefer explicit conversion at system boundaries.

### Implicit Coercion

```js
"5" - 1; // 4
"5" + 1; // "51"
!!value; // boolean conversion
```

Implicit coercion can be concise, but it must be intentional.

## 4. Internal Working

### Strict Equality

`===` usually compares without type conversion.

Mental model:

```txt
if types differ -> false
if both primitives -> compare primitive value
if both objects -> compare reference identity
special case: NaN !== NaN
special case: 0 === -0
```

Examples:

```js
NaN === NaN; // false
0 === -0; // true
{} === {}; // false
```

### Loose Equality

`==` follows a conversion algorithm.

Important cases:

```js
null == undefined; // true
null == 0; // false
"0" == 0; // true
0 == false; // true
"" == false; // true
[] == false; // true
```

Mental model:

```txt
same type -> compare like strict equality
null and undefined -> equal only to each other
number and string -> convert string to number
boolean involved -> convert boolean to number
object and primitive -> convert object to primitive, then compare
```

### Object-To-Primitive Conversion

Objects can be coerced to primitives through `Symbol.toPrimitive`, `valueOf`, and `toString`.

```js
const value = {
  valueOf() {
    return 10;
  },
};

value == 10; // true
```

Order depends on the coercion hint.

### Addition vs Subtraction

```js
"5" + 1; // "51"
"5" - 1; // 4
```

`+` can mean string concatenation or numeric addition. `-` is numeric.

### `NaN`

`NaN` means "not a number" as a numeric value.

```js
Number("abc"); // NaN
NaN === NaN; // false
Number.isNaN(NaN); // true
```

Use `Number.isNaN`, not global `isNaN`, unless you explicitly want coercion.

```js
isNaN("abc"); // true because coerced to NaN
Number.isNaN("abc"); // false
```

## 5. Memory Behavior

Equality itself usually does not allocate much memory, but coercion can create temporary values and trigger object conversion logic.

Primitive comparison:

```js
id === "user-1";
```

This is direct and cheap.

Object comparison:

```js
const a = { id: 1 };
const b = { id: 1 };

a === b; // false
```

Objects compare by reference, not structure.

Memory model:

```txt
a -> object #1 { id: 1 }
b -> object #2 { id: 1 }
```

Structural equality requires custom comparison, serialization, hashing, or a library:

```js
JSON.stringify(a) === JSON.stringify(b);
```

This allocates strings and has ordering/type limitations.

Production memory risks:

- deep equality on large objects,
- repeated `JSON.stringify` for comparison,
- object-to-primitive coercion with custom methods,
- cache keys built with unstable stringification,
- comparing large arrays in hot render paths.

## 6. Execution Behavior

Equality runs synchronously.

Coercion can execute user-defined code when objects are converted to primitives.

```js
const value = {
  [Symbol.toPrimitive]() {
    console.log("coerced");
    return 1;
  },
};

console.log(value == 1);
```

Output:

```txt
coerced
true
```

This means equality with objects can have side effects.

### Short-Circuit Context

```js
if (input == null) {
  // true for null or undefined
}
```

This is one intentional use of loose equality in many codebases.

### Boolean Context

```js
if (value) {
  // Boolean coercion happens
}
```

This does not use `==`, but it is still coercion.

Falsy values:

```txt
false
0
-0
0n
""
null
undefined
NaN
```

### Collection Behavior

```js
const values = [NaN];

values.indexOf(NaN); // -1
values.includes(NaN); // true
```

`indexOf` uses strict equality. `includes` uses SameValueZero.

## 7. Scope & Context Interaction

Equality behavior does not depend on lexical scope, but bugs often appear at boundaries where context changes the type of data.

Examples:

- DOM input values are strings,
- URL query params are strings,
- JSON can remove `undefined`,
- databases may return numeric IDs as strings,
- environment variables are strings,
- feature flags may arrive as `"true"` instead of `true`,
- form checkboxes may produce strings depending on framework handling.

### Boundary Example

```js
const page = new URLSearchParams(location.search).get("page");

if (page === 1) {
  // never true because page is a string or null
}
```

Better:

```js
const page = Number(new URLSearchParams(location.search).get("page") ?? 1);

if (page === 1) {
  // explicit and predictable
}
```

### Closure Context

Closed-over values can change type if reassigned:

```js
let selectedId = "1";

function isSelected(id) {
  return selectedId === id;
}

selectedId = 1;

isSelected("1"); // false
```

Avoid reusing one variable for multiple type meanings.

## 8. Common Examples

### Default To Strict Equality

```js
if (user.role === "admin") {
  allow();
}
```

### Intentional Nullish Check

```js
if (value == null) {
  // catches null and undefined only
}
```

This is a common intentional exception when allowed by team style.

### Explicit Number Parsing

```js
const limit = Number(req.query.limit);

if (!Number.isInteger(limit) || limit < 1) {
  throw new Error("invalid limit");
}
```

### Object Reference Comparison

```js
const selected = user;

users.includes(selected); // checks reference identity
```

This only works if `selected` is the same object reference in the array.

### Map Key Equality

```js
const map = new Map();

map.set({ id: 1 }, "value");
map.get({ id: 1 }); // undefined
```

Object keys compare by reference.

Use stable primitive keys:

```js
map.set("user:1", "value");
map.get("user:1"); // "value"
```

## 9. Confusing / Tricky Examples

### Empty Array

```js
[] == false; // true
[] === false; // false
```

Why: object-to-primitive conversion turns `[]` into `""`, then `""` coerces to `0`, and `false` coerces to `0`.

### Empty Object

```js
{} == false; // false
```

Object conversion differs from array conversion.

### `null`

```js
null == undefined; // true
null == 0; // false
null >= 0; // true
```

Relational comparison and equality use different coercion rules.

### `NaN`

```js
NaN === NaN; // false
Object.is(NaN, NaN); // true
Number.isNaN(NaN); // true
```

### Signed Zero

```js
0 === -0; // true
Object.is(0, -0); // false
```

This matters in numeric libraries and low-level math edge cases.

### Boxed Primitives

```js
new Number(1) === 1; // false
new Number(1) == 1; // true
```

Avoid boxed primitives in application code.

### BigInt

```js
0n == 0; // true
0n === 0; // false
```

BigInt and Number are different types. Be careful around numeric boundaries.

## 10. Real Production Use Cases

### API Query Parameters

```js
const active = req.query.active;

if (active === true) {
  // bug: query params are usually strings
}
```

Fix:

```js
const active = req.query.active === "true";
```

### Feature Flags

```js
if (process.env.NEW_CHECKOUT === "true") {
  enableNewCheckout();
}
```

Environment variables are strings.

### Form Values

```js
const quantity = Number(form.quantity.value);
```

Convert at the boundary and validate immediately.

### Cache Keys

```js
cache.get(userId);
```

If some callers use `1` and others use `"1"`, cache hit behavior changes.

Normalize:

```js
const key = `user:${String(userId)}`;
```

### Authorization

```js
if (user.isAdmin == true) {
  allow();
}
```

This is too permissive if data is untrusted.

Prefer explicit validation:

```js
if (user.isAdmin === true) {
  allow();
}
```

## 11. Interview Questions

1. What is the difference between `==` and `===`?
2. Why is `NaN === NaN` false?
3. What does `Object.is` do differently from `===`?
4. What is SameValueZero?
5. Why does `[NaN].includes(NaN)` return true?
6. Why does `[NaN].indexOf(NaN)` return `-1`?
7. Why is `[] == false` true?
8. Why is `null == undefined` true?
9. Why is `null >= 0` true but `null == 0` false?
10. How do objects compare with `===`?
11. How does object-to-primitive coercion work?
12. Why should API inputs be normalized at boundaries?
13. When is `value == null` acceptable?
14. What are all falsy values?
15. How can equality bugs become security bugs?

## 12. Senior-Level Pitfalls

### Pitfall 1: Trusting API Types

External data often arrives as strings.

```js
if (req.query.limit === 10) {
  // likely false
}
```

### Pitfall 2: Using Truthiness For Valid Numeric Input

```js
if (!quantity) {
  throw new Error("missing quantity");
}
```

This rejects `0`, which may be valid in some domains.

### Pitfall 3: Comparing Objects Structurally With `===`

```js
{ id: 1 } === { id: 1 }; // false
```

### Pitfall 4: Deep Equality In Hot Paths

Deep comparison can be expensive and unstable if object shape or key order varies.

### Pitfall 5: Inconsistent ID Types

```js
selectedId === item.id;
```

If one side is a string and the other is a number, UI selection, cache lookup, and authorization checks can fail.

### Pitfall 6: Overusing Loose Equality

Loose equality can hide boundary bugs by making invalid input appear acceptable.

## 13. Best Practices

- Use `===` and `!==` by default.
- Use explicit conversion at boundaries.
- Validate after conversion.
- Use `Number.isNaN` instead of global `isNaN` for strict checks.
- Use `Object.is` when `NaN` or `-0` matters.
- Use `includes` instead of `indexOf` when checking for `NaN`.
- Normalize IDs to one type across a system.
- Avoid boxed primitives.
- Avoid deep equality in hot paths unless measured.
- Prefer schema validation for external data.
- Use `value == null` only as an intentional null-or-undefined check if your team allows it.

## 14. Debugging Scenarios

### Scenario 1: Feature Flag Always Off

```js
if (process.env.FEATURE_ENABLED === true) {
  enable();
}
```

Cause: environment variables are strings.

Fix:

```js
if (process.env.FEATURE_ENABLED === "true") {
  enable();
}
```

### Scenario 2: Pagination Ignores Page 0

```js
if (!page) {
  page = 1;
}
```

If `0` is meaningful, this is wrong.

Fix:

```js
if (page == null) {
  page = 1;
}
```

Or validate explicitly based on domain rules.

### Scenario 3: Selected Item Not Highlighted

```js
selectedId === item.id;
```

Debug:

```js
console.log(typeof selectedId, selectedId);
console.log(typeof item.id, item.id);
```

Fix by normalizing ID types at the boundary.

### Scenario 4: `NaN` Not Found

```js
values.indexOf(NaN); // -1
```

Fix:

```js
values.includes(NaN); // true
```

Or:

```js
values.some(Number.isNaN);
```

### Scenario 5: Cache Miss With Object Keys

```js
cache.set({ id: 1 }, user);
cache.get({ id: 1 }); // undefined
```

Cause: object keys compare by reference.

Fix: use stable primitive keys.

```js
cache.set("user:1", user);
```

### Scenario 6: Authorization Bug

```js
if (payload.isAdmin == true) {
  allow();
}
```

Debug by logging the type and source of `isAdmin`.

Fix with schema validation and strict boolean checks.

## 15. Exercises / Practice

### Exercise 1

Predict the output:

```js
console.log(0 == false);
console.log(0 === false);
console.log("" == false);
console.log([] == false);
```

### Exercise 2

Predict the output:

```js
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));
console.log([NaN].includes(NaN));
console.log([NaN].indexOf(NaN));
```

### Exercise 3

Fix this query param bug:

```js
if (req.query.limit === 10) {
  applyLimit(10);
}
```

### Exercise 4

Write a safe parser for a boolean query param.

```js
function parseBoolean(value) {
  // implement
}
```

### Exercise 5

Explain why this returns `false`:

```js
const a = { id: 1 };
const b = { id: 1 };

console.log(a === b);
```

### Exercise 6

Design a normalization strategy for IDs that arrive from URL params, database rows, and JSON APIs.

## 16. Comparison

### `==` vs `===` vs `Object.is`

| Algorithm | Coerces Types | `NaN` Equal To Itself | Distinguishes `0` And `-0` |
|---|---:|---:|---:|
| `==` | Yes | No | No |
| `===` | Mostly no | No | No |
| `Object.is` | No | Yes | Yes |

### `includes` vs `indexOf`

| Method | Equality Algorithm | `NaN` Found? |
|---|---|---:|
| `includes` | SameValueZero | Yes |
| `indexOf` | Strict equality | No |

### Truthy Check vs Explicit Check

| Check | Use When | Risk |
|---|---|---|
| `if (value)` | Any truthy value is acceptable | Rejects `0`, `""`, `false`, `NaN`, `null`, `undefined` |
| `value != null` | Need null-or-undefined check | Allows other falsy values |
| `value === expected` | Need exact value/type | Requires normalized types |

### Reference vs Structural Equality

| Type | `===` Means |
|---|---|
| Primitive | Same primitive value, with `NaN` exception |
| Object/function/array | Same reference |

## 17. Related Concepts

Prerequisites:

- Variables & Declarations
- Data Types
- Operators
- Truthy/Falsy

Direct follow-ups:

- Type Conversion
- Objects Basics
- Arrays Basics
- Validation
- API Design
- Security

Production connections:

- form parsing,
- URL query parsing,
- environment variables,
- JSON APIs,
- cache keys,
- feature flags,
- authorization checks,
- analytics event schemas,
- TypeScript runtime validation.

Knowledge graph:

```txt
Data Type
  -> coercion
    -> equality algorithm
      -> strict equality
      -> loose equality
      -> Object.is
      -> SameValueZero
        -> production validation and normalization
```

## Advanced Add-ons

### Performance Impact

Most equality checks are cheap. Problems appear when comparison triggers expensive conversion or deep structural comparison.

Watch for:

- deep equality in render loops,
- repeated JSON serialization for comparison,
- comparing large arrays,
- object-to-primitive conversion with custom methods,
- unstable cache key generation,
- unnecessary normalization inside hot loops.

Guideline: normalize at boundaries, then compare simple stable primitives in hot paths.

### System Design Relevance

Equality bugs often become system bugs when services disagree on data representation.

Examples:

- one service sends numeric IDs, another expects strings,
- feature flags use string values in environment config,
- cache keys differ by type,
- analytics schemas mix booleans and strings,
- authorization payloads are not validated.

Design rule:

```txt
Choose canonical types at system boundaries and enforce them with validation.
```

### Security Impact

Loose equality and implicit coercion can make unsafe input look safe.

Risk examples:

- authorization checks using `==`,
- string booleans accepted as real booleans,
- missing input validation,
- truthy checks accepting unexpected objects,
- cache key collision through coercion,
- audit flags interpreted inconsistently.

Security practice:

- validate schemas,
- reject unknown types,
- compare security-critical values with strict equality,
- normalize before authorization decisions.

### Browser vs Node Behavior

The equality algorithms are the same across compliant JavaScript runtimes.

Boundary differences:

- browser form inputs and URL params are strings,
- Node environment variables are strings,
- server frameworks may parse query params differently,
- database clients may return numbers, strings, BigInts, or Decimal-like objects depending on configuration,
- JSON loses `undefined`, symbols, and non-finite number distinctions.

### Polyfill / Implementation

You can implement small helpers to clarify intent.

Nullish check:

```js
function isNil(value) {
  return value === null || value === undefined;
}
```

SameValueZero approximation:

```js
function sameValueZero(a, b) {
  return a === b || (a !== a && b !== b);
}
```

Safe boolean parser:

```js
function parseBoolean(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new Error("invalid boolean");
}
```

Staff-level takeaway: do not rely on equality rules to clean up bad data. Normalize and validate data before it enters core business logic.

## 18. Summary

Equality and coercion control how JavaScript compares and converts values.

Remember:

- use `===` by default,
- `==` performs coercion,
- `null == undefined` is true,
- `NaN === NaN` is false,
- `Object.is(NaN, NaN)` is true,
- `Object.is(0, -0)` is false,
- `includes` can find `NaN`; `indexOf` cannot,
- objects compare by reference,
- external data often arrives as strings,
- truthiness is not the same as validation,
- normalize and validate at boundaries,
- security-critical comparisons should be explicit and strict.
