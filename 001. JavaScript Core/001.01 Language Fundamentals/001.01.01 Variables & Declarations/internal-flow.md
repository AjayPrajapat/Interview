# Internal Flow: Variables & Declarations

This file explains the runtime path from source code to initialized bindings. For visual diagrams, see [diagrams.md](./diagrams.md).

## Engine Flow

```text
Source code
  -> parse into syntax tree
  -> create execution context
  -> create lexical and variable environment records
  -> register declarations
  -> initialize var bindings to undefined
  -> keep let/const bindings uninitialized
  -> execute statements top to bottom
  -> initialize let/const at declaration line
  -> assign values to bindings
  -> resolve identifiers through the scope chain
```

## `var` Flow

```text
Encounter `var total = 10`
  -> creation phase creates binding `total`
  -> binding is initialized to undefined
  -> reads before assignment return undefined
  -> execution reaches declaration statement
  -> assignment writes 10 into existing binding
```

## `let` / `const` Flow

```text
Encounter `let total = 10` or `const total = 10`
  -> creation phase creates lexical binding `total`
  -> binding is uninitialized
  -> reads before declaration throw ReferenceError
  -> execution reaches declaration statement
  -> binding is initialized
  -> later reads are allowed
```

## Scope Lookup Flow

```text
Read identifier
  -> check current block environment
  -> if not found, check function environment
  -> if not found, check module/global environment
  -> if not found, throw ReferenceError
```

The nearest binding wins. This is why shadowing can produce surprising temporal dead zone behavior.

## Mutation Flow

```text
const user = { name: "Ajay" }
  -> binding `user` points to object
  -> binding cannot be reassigned
  -> object properties can still change
  -> other references to same object observe those changes
```

## Closure Retention Flow

```text
Outer function creates local binding
  -> inner function references that binding
  -> outer function returns
  -> inner function remains reachable
  -> referenced lexical environment remains reachable
  -> captured values cannot be garbage-collected
```

## Flow Review Checklist

- Can this binding be declared closer to the first use?
- Should this binding be `const` instead of `let`?
- Is reassignment communicating a real state transition?
- Could this object be mutated through another reference?
- Is a closure retaining more data than it needs?
- Is a block-level declaration shadowing a safer outer binding?
