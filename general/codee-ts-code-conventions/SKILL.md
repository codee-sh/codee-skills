---
name: codee-ts-code-conventions
description: TypeScript code conventions for comments, JSDoc, naming, and code clarity. Use when writing or reviewing TypeScript code. Leave mechanical formatting to the project's formatter and linter.
---

# TypeScript Code Conventions

Apply semantic conventions that formatters and linters cannot reliably enforce.
Follow the project's Prettier, ESLint, or equivalent configuration for mechanical
formatting.

## Comments

### When to comment

Document every named function and class method with JSDoc, including private
helpers, one-line functions, accessors, and constructors. Inline anonymous
callbacks do not require JSDoc.

State the function or method's purpose concisely. Add implementation comments
only when the why is non-obvious: a hidden constraint, subtle invariant,
external-system quirk, or workaround for a specific bug. Prefer identifiers
that make the implementation self-explanatory.

### Format

| Situation | Format |
|-----------|--------|
| Single-line note | `// note` |
| Multi-line block | `/** */` |
| Multi-line type-field annotation | `/** */` inside the type body |
| Function or method documentation | Multi-line `/** */` block |

Do not use consecutive `//` lines as a substitute for a documentation block.
Do not collapse function or method JSDoc to a single-line `/** ... */` block.

### Characters

Use plain ASCII in comments and JSDoc.

Do not use:

- Unicode arrows such as `→`, `←`, or `⇒`
- Unicode dashes such as `–` or `—`
- Other decorative Unicode symbols

Prefer words such as "to", "from", "returns", and "depends on".

### JSDoc

When a documented function or method declares parameters, include an `@param`
tag for every parameter in signature order. This is required even when the
parameter name and type already make its purpose clear.

Use the remaining JSDoc tags when they add information that is not already clear
from the signature:

- `@param name - description` for every declared parameter
- `@returns description` when the result's shape or semantics need explanation
- `@throws` for non-obvious error conditions
- `@example` for non-trivial usage

## Naming

Use descriptive names that state what a value represents. Avoid unexplained
abbreviations and single-letter identifiers.

Name callback parameters after the represented value:

```ts
// Wrong
items.filter((a) => a.active)
addresses.map((a) => a.id)

// Correct
items.filter((item) => item.active)
addresses.map((address) => address.id)
```

Apply this rule to `map`, `filter`, `find`, `reduce`, `forEach`, `sort`, and
other higher-order functions.

## Related Skills

| When you are also... | Load |
|----------------------|------|
| Writing or reviewing Medusa TypeScript code | `codee-medusa-code-conventions` |
| Writing user-facing strings | `codee-ui-copy` |
