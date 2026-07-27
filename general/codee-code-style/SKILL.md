---
name: code-style
description: General code style conventions — comments, naming, file organisation. Load when writing or reviewing any TypeScript code.
---

# Code Style

---

## Comments

### When to comment

Only comment when the **why** is non-obvious: a hidden constraint, a subtle invariant, an external system quirk, a workaround for a specific bug. Do not describe what the code does — well-named identifiers already do that.

### Format rules

| Situation | Format |
|-----------|--------|
| Single-line inline note | `// note` |
| Multi-line block | `/** */` (JSDoc) |
| Type field annotation (multi-line) | `/** */` inside the type body |

Never use consecutive `//` lines as a substitute for `/** */`.

### Character rules

Use only plain ASCII characters in comments and JSDoc. Do not use:
- Unicode arrows (`→`, `←`, `⇒`)
- Unicode dashes (`–`, `—`) - use a plain hyphen `-` instead
- Any other non-ASCII symbols

Plain words are always preferred: write "to", "from", "returns", "depends on" instead of symbols.

The same rule applies to UI strings, labels, and descriptions.

### JSDoc conventions

Use JSDoc tags where they add information not already obvious from the signature:

- `@param name - description` — when the meaning of a parameter is not clear from its name/type
- `@returns description` — when the return value shape or semantics need explanation
- `@throws` — when a function throws under a non-obvious condition
- `@example` — when usage is non-trivial

Skip JSDoc entirely on trivial one-liners and getters where the signature is fully self-documenting.

---

## Naming

### Variables and parameters

Use descriptive names that reflect what the value represents. Avoid single-letter or abbreviated names.

**Callback parameters** must always be named after what they represent — never use `a`, `e`, `i`, `x`, or other single-letter shorthands:

```ts
// Wrong
items.filter((a) => a.active)
addresses.map((a) => a.id)

// Correct
items.filter((item) => item.active)
addresses.map((address) => address.id)
```

This applies to all higher-order functions: `map`, `filter`, `find`, `reduce`, `forEach`, `sort`, etc.

---

## Related skills

| When you are also... | Load |
|----------------------|------|
| Writing any user-facing string (labels, descriptions, headings, toasts) | `ui-copy` |
