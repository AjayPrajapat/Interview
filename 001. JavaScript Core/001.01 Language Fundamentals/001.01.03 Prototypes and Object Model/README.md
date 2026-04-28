# 001.01.03 Prototypes and Object Model

Category: JavaScript Core

Topic: 001.01 Language Fundamentals

## 1. Definition

JavaScript objects are dynamic collections of properties with an internal link to another object called their prototype.

The prototype chain is the lookup path JavaScript follows when a property is not found directly on an object.

One-line version:

```txt
JavaScript uses prototypes to share behavior between objects through delegation instead of classical inheritance.
```

Expanded explanation:

- An object can have own properties.
- An object can delegate missing property lookups to its prototype.
- That prototype can have its own prototype.
- Lookup continues until the property is found or the chain reaches `null`.
- Constructor functions and `class` syntax both build on this prototype model.

Important distinction:

- `prototype` is a property found on functions used as constructors.
- `[[Prototype]]` is the internal prototype link of an object.
- `__proto__` is a legacy accessor for an object's internal prototype.

## 2. Why It Exists

JavaScript needed a way to let objects share behavior without copying methods onto every instance.

Prototypes solve this problem:

```js
function User(name) {
  this.name = name;
}

User.prototype.sayHello = function () {
  return `Hello, ${this.name}`;
};

const user = new User("Ajay");
user.sayHello(); // "Hello, Ajay"
```

The `sayHello` method is stored once on `User.prototype`. Every instance can delegate to it.

Why language designers used this model:

- objects can be lightweight,
- behavior can be shared by delegation,
- dynamic extension is possible,
- constructor functions can create families of related objects,
- `class` syntax can be layered on top without changing the core object model.

Senior-level reason:

Prototypes are behind many things that look simple: object methods, arrays, classes, `instanceof`, property lookup, monkey patching, prototype pollution, hidden class optimization, and many framework internals.

## 3. Syntax & Variants

### Object Literal

```js
const user = {
  name: "Ajay",
  greet() {
    return `Hi ${this.name}`;
  },
};
```

`user` has own properties and usually inherits from `Object.prototype`.

### Own Property

```js
const user = { name: "Ajay" };

console.log(user.name); // own property
```

### Prototype Property Lookup

```js
const user = { name: "Ajay" };

console.log(user.toString); // found on Object.prototype
```

`toString` is not usually an own property of `user`; it is inherited.

### `Object.create`

```js
const baseUser = {
  canLogin() {
    return true;
  },
};

const admin = Object.create(baseUser);
admin.role = "admin";

admin.canLogin(); // true
```

`baseUser` becomes the prototype of `admin`.

### Constructor Function

```js
function User(name) {
  this.name = name;
}

User.prototype.greet = function () {
  return `Hi ${this.name}`;
};

const user = new User("Ajay");
```

`new` creates an object whose internal prototype points to `User.prototype`.

### `class` Syntax

```js
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hi ${this.name}`;
  }
}

const user = new User("Ajay");
```

`class` is syntax over the prototype model. Methods are placed on `User.prototype`.

### Static Methods

```js
class User {
  static fromName(name) {
    return new User(name);
  }

  constructor(name) {
    this.name = name;
  }
}
```

Static methods live on the constructor itself, not on instances.

### Null Prototype Object

```js
const dictionary = Object.create(null);
dictionary.key = "value";

console.log(dictionary.toString); // undefined
```

This object has no prototype chain. It is useful for dictionaries but lacks common object methods.

### Prototype Inspection

```js
Object.getPrototypeOf(user);
Object.hasOwn(user, "name");
user instanceof User;
```

Prefer standard APIs over `__proto__`.

## 4. Internal Working

Every ordinary object has an internal `[[Prototype]]` reference.

Property read flow:

```txt
Read obj.property
  -> check obj own properties
  -> if found, return value
  -> if not found, move to obj.[[Prototype]]
  -> repeat lookup
  -> stop at null
  -> return undefined if not found
```

Example:

```js
const base = {
  canRead() {
    return true;
  },
};

const user = Object.create(base);
user.name = "Ajay";

user.canRead(); // lookup finds method on base
```

Internal model:

```txt
user
  own: name
  [[Prototype]] -> base

base
  own: canRead
  [[Prototype]] -> Object.prototype

Object.prototype
  own: toString, hasOwnProperty, ...
  [[Prototype]] -> null
```

### What `new` Does

```js
const user = new User("Ajay");
```

Mental model:

```txt
1. Create a new empty object.
2. Set object.[[Prototype]] to User.prototype.
3. Call User with this bound to the new object.
4. Return the object unless constructor returns another object explicitly.
```

Approximation:

```js
function createWithNew(Constructor, ...args) {
  const instance = Object.create(Constructor.prototype);
  const result = Constructor.apply(instance, args);

  return result !== null && typeof result === "object" ? result : instance;
}
```

### Method Lookup and `this`

When a method is found on the prototype, `this` still points to the receiver object before the dot.

```js
const base = {
  greet() {
    return this.name;
  },
};

const user = Object.create(base);
user.name = "Ajay";

user.greet(); // "Ajay"
```

The method lives on `base`, but `this` is `user`.

## 5. Memory Behavior

Prototypes reduce memory duplication by sharing methods.

Bad for memory:

```js
function User(name) {
  this.name = name;
  this.greet = function () {
    return `Hi ${this.name}`;
  };
}
```

Every instance gets a new `greet` function.

Better:

```js
function User(name) {
  this.name = name;
}

User.prototype.greet = function () {
  return `Hi ${this.name}`;
};
```

All instances share one `greet` function.

Memory model:

```txt
user1 ----\
          -> User.prototype -> greet function
user2 ----/
```

But prototype chains can hurt performance and memory predictability when mutated dynamically.

Risk patterns:

- adding properties in inconsistent order,
- deleting properties from hot objects,
- changing prototypes after object creation,
- monkey patching built-in prototypes,
- creating deeply nested prototype chains,
- storing large objects on prototypes accidentally.

## 6. Execution Behavior

Prototype behavior appears during property access, method calls, construction, and `instanceof`.

### Property Read

```js
user.role;
```

Execution:

```txt
check user.role
  -> check prototype.role
  -> check next prototype.role
  -> return value or undefined
```

### Property Write

```js
user.role = "admin";
```

Usually writes an own property on `user`; it does not modify the prototype property unless a setter is involved.

```js
const base = { role: "viewer" };
const user = Object.create(base);

user.role = "admin";

console.log(user.role); // "admin"
console.log(base.role); // "viewer"
```

### Method Call

```js
user.greet();
```

Execution:

```txt
lookup greet through prototype chain
  -> call function with this = user
```

### `instanceof`

```js
user instanceof User;
```

Checks whether `User.prototype` exists anywhere in `user`'s prototype chain.

### Async Interaction

Prototype lookup is synchronous, but methods found through prototypes can create async behavior.

```js
class ApiClient {
  async getUser(id) {
    return fetch(`/users/${id}`);
  }
}
```

The method lookup is synchronous. The method body returns a promise.

## 7. Scope & Context Interaction

Prototypes do not create lexical scope. They create delegation relationships between objects.

This is a common confusion:

```js
const base = {
  value: 1,
  getValue() {
    return this.value;
  },
};

const child = Object.create(base);
child.value = 2;

child.getValue(); // 2
```

`getValue` is found on `base`, but `this` is `child`.

### Prototype vs Closure

Closure private state:

```js
function createCounter() {
  let count = 0;

  return {
    increment() {
      count += 1;
      return count;
    },
  };
}
```

Prototype shared behavior:

```js
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count += 1;
    return this.count;
  }
}
```

Closure state is private per factory call. Prototype methods are shared across instances.

### Module Context

Classes and constructor functions are often exported from modules:

```js
export class User {
  constructor(id) {
    this.id = id;
  }
}
```

The class binding is module-scoped. Instances created from the class use the prototype chain.

## 8. Common Examples

### Shared Methods

```js
class Cart {
  constructor() {
    this.items = [];
  }

  add(item) {
    this.items.push(item);
  }
}

const cart = new Cart();
cart.add("book");
```

`add` is shared through `Cart.prototype`.

### Checking Own Properties

```js
const user = { name: "Ajay" };

Object.hasOwn(user, "name"); // true
Object.hasOwn(user, "toString"); // false
```

Use this when you need to distinguish own data from inherited behavior.

### Safer Dictionary Object

```js
const counts = Object.create(null);
counts.admin = 1;
```

No inherited keys like `toString` can collide with dictionary entries.

### Using Built-In Prototypes

```js
const items = [1, 2, 3];

items.map((item) => item * 2);
```

`map` is found on `Array.prototype`.

### Extending With Composition Instead

```js
function createUserService({ logger, repository }) {
  return {
    async findUser(id) {
      logger.info({ id }, "find user");
      return repository.findById(id);
    },
  };
}
```

Many production systems prefer composition for service objects because dependencies are explicit.

## 9. Confusing / Tricky Examples

### `prototype` vs `__proto__`

```js
function User() {}

const user = new User();

console.log(User.prototype === Object.getPrototypeOf(user)); // true
```

`User.prototype` is the object assigned as the prototype of instances created with `new User()`.

### Method Extract Loses `this`

```js
const user = {
  name: "Ajay",
  greet() {
    return this.name;
  },
};

const greet = user.greet;
greet(); // undefined or TypeError depending on strict mode
```

The method is no longer called with `user` as the receiver.

Fix:

```js
const greet = user.greet.bind(user);
```

### Shadowing Prototype Property

```js
const base = { role: "viewer" };
const user = Object.create(base);

user.role = "admin";

console.log(user.role); // "admin"
console.log(base.role); // "viewer"
```

The assignment creates an own property that shadows the prototype property.

### `in` Checks Prototype Chain

```js
const user = { name: "Ajay" };

console.log("toString" in user); // true
console.log(Object.hasOwn(user, "toString")); // false
```

`in` checks inherited properties too.

### Mutating Built-In Prototypes

```js
Array.prototype.first = function () {
  return this[0];
};
```

This can break enumeration, conflict with libraries, create security risk, and surprise other teams.

### Prototype Pollution

```js
const payload = JSON.parse('{"__proto__":{"isAdmin":true}}');
```

If unsafe merge logic applies this payload into normal objects, inherited properties may be polluted.

## 10. Real Production Use Cases

### Framework Classes

Angular, NestJS, and many backend libraries use classes heavily.

```ts
class UsersService {
  findById(id: string) {
    return { id };
  }
}
```

Methods live on the prototype. Instances carry state and injected dependencies.

### Built-In APIs

Arrays, dates, maps, sets, errors, promises, and typed arrays all use prototypes.

```js
Promise.resolve(1).then((value) => value + 1);
```

`then` is found on `Promise.prototype`.

### Error Types

```js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
```

Custom errors rely on prototype chains for `instanceof` and stack behavior.

### Serialization Boundaries

JSON does not preserve prototypes.

```js
const user = new User("Ajay");
const copy = JSON.parse(JSON.stringify(user));

copy instanceof User; // false
```

Production implication: data crossing API boundaries usually becomes plain objects.

### Security Hardening

Use null-prototype dictionaries or safe parsing/merge utilities for untrusted object keys.

```js
const safeMap = Object.create(null);
```

This helps avoid inherited key collisions.

## 11. Interview Questions

1. What is a prototype in JavaScript?
2. What is the prototype chain?
3. What is the difference between `prototype` and `[[Prototype]]`?
4. What does `new` do internally?
5. How does property lookup work?
6. What is the difference between own and inherited properties?
7. How does `class` relate to prototypes?
8. What does `instanceof` check?
9. Why can extracting a method lose `this`?
10. What is prototype pollution?
11. Why should you avoid modifying built-in prototypes?
12. What happens to prototypes during JSON serialization?
13. How do prototypes affect memory usage?
14. How can prototype changes hurt performance?
15. When would you use `Object.create(null)`?

## 12. Senior-Level Pitfalls

### Pitfall 1: Treating `class` As Classical Inheritance

JavaScript `class` syntax still uses prototypes.

```js
class User {}

const user = new User();

Object.getPrototypeOf(user) === User.prototype; // true
```

### Pitfall 2: Using `for...in` Without Own-Property Checks

```js
for (const key in object) {
  process(key, object[key]);
}
```

This iterates enumerable inherited properties too.

Safer:

```js
for (const key of Object.keys(object)) {
  process(key, object[key]);
}
```

### Pitfall 3: Prototype Pollution Through Deep Merge

Unsafe deep merge logic can write into `__proto__`, `constructor`, or `prototype`.

### Pitfall 4: Runtime Prototype Mutation

Changing prototypes after objects are created can deoptimize hot paths and confuse object shape assumptions.

```js
Object.setPrototypeOf(user, otherPrototype);
```

Use this rarely.

### Pitfall 5: Shared Mutable Prototype State

```js
function User() {}

User.prototype.roles = [];

const a = new User();
const b = new User();

a.roles.push("admin");
console.log(b.roles); // ["admin"]
```

The array is shared through the prototype.

## 13. Best Practices

- Prefer `class` syntax for constructor-style object creation in modern code.
- Understand that `class` still uses prototypes.
- Put methods on prototypes, not inside constructors, unless per-instance closure state is required.
- Store mutable per-instance data on the instance, not on the prototype.
- Prefer `Object.hasOwn` for own-property checks.
- Avoid mutating built-in prototypes.
- Avoid changing an object's prototype after creation.
- Use `Object.create(null)` for untrusted dictionary-like maps when appropriate.
- Prefer `Map` for arbitrary key/value collections.
- Treat JSON data as plain objects with no trusted prototype semantics.
- Sanitize `__proto__`, `constructor`, and `prototype` keys when merging untrusted data.

## 14. Debugging Scenarios

### Scenario 1: Method Is Undefined

```js
user.greet();
```

Debug:

```js
console.log(Object.keys(user));
console.log(Object.getPrototypeOf(user));
console.log("greet" in user);
console.log(Object.hasOwn(user, "greet"));
```

Likely causes:

- wrong instance type,
- prototype lost during serialization,
- method name typo,
- object created with `Object.create(null)`,
- method exists but not on this object's prototype chain.

### Scenario 2: `instanceof` Fails After API Call

```js
const user = await fetchUser();
user instanceof User; // false
```

Cause: JSON response creates plain objects.

Fix:

```js
const user = Object.assign(new User(), await fetchUser());
```

Or better: keep transport DTOs separate from domain objects.

### Scenario 3: Shared State Across Instances

```js
User.prototype.items = [];
```

Fix:

```js
function User() {
  this.items = [];
}
```

Mutable per-instance state belongs on the instance.

### Scenario 4: Unexpected Property Appears

```js
if (user.isAdmin) {
  allow();
}
```

If `isAdmin` is inherited through polluted prototype, this can become dangerous.

Fix:

```js
if (Object.hasOwn(user, "isAdmin") && user.isAdmin === true) {
  allow();
}
```

Also fix the unsafe input merge path.

### Scenario 5: Performance Regression

Symptoms:

- code becomes slower after dynamic object mutation,
- hot path creates objects with inconsistent property order,
- frequent `delete`,
- `Object.setPrototypeOf` in runtime path.

Debugging:

- profile CPU,
- inspect object construction patterns,
- avoid changing shapes after hot objects are created,
- prefer stable object layouts.

## 15. Exercises / Practice

### Exercise 1

Predict the output:

```js
const base = { value: 1 };
const child = Object.create(base);

child.value = 2;

console.log(child.value);
console.log(base.value);
```

### Exercise 2

Predict the output:

```js
function User(name) {
  this.name = name;
}

User.prototype.greet = function () {
  return this.name;
};

const user = new User("Ajay");
const greet = user.greet;

console.log(greet());
```

### Exercise 3

Fix the shared mutable prototype bug:

```js
function Cart() {}

Cart.prototype.items = [];
```

### Exercise 4

Implement a simplified `new` operator as a function.

```js
function create(Constructor, ...args) {
  // your implementation
}
```

### Exercise 5

Explain why this is true:

```js
const items = [];

console.log(items.map === Array.prototype.map);
```

### Exercise 6

Write a safe property check for user input:

```js
const input = JSON.parse(body);

if (input.isAdmin) {
  allow();
}
```

## 16. Comparison

### Prototype vs Class

| Concept | Meaning | Reality |
|---|---|---|
| Prototype | Object used for delegation | Core JavaScript object model |
| Class | Syntax for constructor/prototype pattern | Built on prototypes |

### Own vs Inherited Property

| Property Type | Where It Lives | How To Check |
|---|---|---|
| Own | Directly on object | `Object.hasOwn(obj, key)` |
| Inherited | Somewhere in prototype chain | `key in obj` |

### Prototype State vs Instance State

| State Location | Use For | Avoid For |
|---|---|---|
| Prototype | Shared methods, immutable shared behavior | Mutable per-instance data |
| Instance | Per-object data | Shared methods repeated per instance |
| Closure | Private state | Large hidden retained state |

### Object vs Map

| Tool | Prefer When | Watch Out |
|---|---|---|
| Object | Structured records with known keys | Prototype keys and inherited properties |
| `Object.create(null)` | Dictionary without inherited keys | Missing normal object methods |
| `Map` | Arbitrary keys and frequent add/remove | Serialization differs from plain object |

## 17. Related Concepts

Prerequisites:

- Variables & Declarations
- Scope, Closures, and Hoisting
- Functions Basics
- Objects Basics

Direct follow-ups:

- `this` keyword
- Classes
- Inheritance
- Object property descriptors
- Modules
- Error handling
- TypeScript structural typing

Production connections:

- prototype pollution security issues,
- custom error classes,
- DTO vs domain model mapping,
- serialization boundaries,
- framework decorators and metadata,
- object shape performance,
- class-based Angular and NestJS patterns.

Knowledge graph:

```txt
Object
  -> own properties
  -> [[Prototype]]
    -> prototype chain
      -> property lookup
      -> method delegation
      -> instanceof
      -> class syntax
      -> prototype pollution risks
```

## Advanced Add-ons

### Performance Impact

Prototype lookup is usually fast when object shapes are stable.

Performance risks:

- changing prototypes at runtime,
- adding properties in inconsistent order,
- deleting properties from hot objects,
- megamorphic call sites,
- monkey patching built-ins,
- deep prototype chains,
- per-instance methods when thousands of instances are created.

Guideline: keep object layout stable and measure before optimizing.

### System Design Relevance

Prototypes matter at system boundaries because object identity and behavior do not always survive serialization.

Examples:

- API responses are plain objects, not class instances.
- Worker messages clone data and may lose prototype behavior.
- JSON persistence stores data, not methods.
- Domain models may need hydration from DTOs.
- Error instances may lose prototype/stack details across process boundaries.

Design question:

```txt
Is this data model behavior-rich inside one runtime, or plain data crossing a boundary?
```

### Security Impact

Prototype pollution is the major security concern.

Risky keys:

- `__proto__`
- `constructor`
- `prototype`

Risky operations:

- unsafe deep merge,
- trusting JSON objects,
- recursively assigning user-controlled keys,
- authorization checks that trust inherited properties.

Defenses:

- validate schemas,
- reject dangerous keys,
- use `Object.hasOwn`,
- use `Object.create(null)` or `Map` for dictionaries,
- keep dependencies patched.

### Browser vs Node Behavior

The core prototype model is the same in browser and Node.js.

Differences appear in host objects:

- browser DOM objects have browser-provided prototype chains,
- Node.js objects may inherit from EventEmitter or stream prototypes,
- cross-realm objects can make `instanceof` surprising,
- iframe/window boundaries can create different constructor identities.

Example cross-realm issue:

```js
// An array from another iframe may fail:
value instanceof Array;

// Safer:
Array.isArray(value);
```

### Polyfill / Implementation

You can implement simple delegation with `Object.create`.

```js
const userMethods = {
  greet() {
    return `Hi ${this.name}`;
  },
};

function createUser(name) {
  const user = Object.create(userMethods);
  user.name = name;
  return user;
}
```

Simplified `new`:

```js
function createNew(Constructor, ...args) {
  const instance = Object.create(Constructor.prototype);
  const result = Constructor.apply(instance, args);

  if ((typeof result === "object" && result !== null) || typeof result === "function") {
    return result;
  }

  return instance;
}
```

Staff-level takeaway: do not memorize prototypes as syntax. Understand property lookup, delegation, `this`, instance state, serialization boundaries, and security implications.

## 18. Summary

Prototypes are the foundation of JavaScript's object model.

Remember:

- objects have own properties and an internal prototype link,
- property lookup walks the prototype chain,
- `prototype` and `[[Prototype]]` are not the same thing,
- `class` syntax is built on prototypes,
- `new` links an instance to a constructor's prototype,
- methods on prototypes are shared across instances,
- mutable data on prototypes is usually a bug,
- `this` is determined by call site, not where the method was found,
- `in` checks inherited properties, while `Object.hasOwn` checks own properties,
- JSON does not preserve prototypes,
- prototype pollution is a real production security issue,
- stable object shapes help performance.
