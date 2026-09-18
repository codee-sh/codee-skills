---
name: codee-medusa-code-conventions
description: Medusa-specific TypeScript code conventions for workflows and steps. Use when writing or reviewing Medusa workflow or step code.
---

# Medusa Code Conventions

Apply this skill after `codee-ts-code-conventions`.

This skill adds Medusa-specific conventions. It overrides the base comment rule
only where it explicitly requires JSDoc for workflows and steps. Use
`building-with-medusa` for architecture, API usage, data modeling, and workflow
design patterns.

## Workflow JSDoc

Every `createWorkflow` call must have a JSDoc block that describes:

1. What the workflow does.
2. The step dependency order, including concurrent and sequential steps.
3. Non-obvious constraints and compensations.

Example:

```ts
/**
 * Synchronizes one product with an external catalog.
 *
 * Step order:
 *   1. loadProductStep - loads the local product
 *   2. fetchCatalogProductStep - runs concurrently with step 1
 *   3. updateProductStep - depends on steps 1 and 2
 *
 * updateProductStep restores the previous product data during compensation.
 */
export const syncProductWorkflow = createWorkflow(...)
```

## Step JSDoc

Every `createStep` call must have a JSDoc block that describes:

1. What the step does and returns.
2. Non-obvious data sources or transformations.
3. Important edge cases, fallbacks, and compensation behavior.

Example:

```ts
/**
 * Maps catalog attributes to the product metadata shape.
 *
 * Unknown attributes are omitted and returned separately as
 * unsupportedAttributes for diagnostics.
 *
 * The compensation function restores the metadata received as input.
 */
export const mapCatalogAttributesStep = createStep(...)
```

## Step naming

A step's prefix says what kind of work it does. Pick from these before inventing a verb:

| Prefix | The step… | Example |
|---|---|---|
| `plan-` | reads current state and **decides a branch**, returning an action and a reason | `planAssetRegenerationStep` answers `skip` or `regenerate` |
| `prepare-` | **readies data for the next step**, which is the one that writes | `prepareAssetLinksStep` feeds `createRemoteLinkStep` |
| `list-` / `fetch-` | **reads** rows or an upstream response and returns them | `listProductImagesStep` |
| `register-` / `link-` / `repoint-` | **writes**, and owns its compensation | `registerAssetFormatsStep` |

Do not use `build-` for a step. It reads as a synonym of `prepare-`, and where both are in play
they drift until they name the same job under different words. `build-` stays for plain functions.

When a `transform()` in the workflow already does the shaping, do not add a step for it. A step
earns its place when the workflow needs a named node to pass along, or when the shaping is worth
a test of its own — and then it is the step that is tested, per `codee-medusa-testing`.
