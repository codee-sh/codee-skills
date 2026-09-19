---
name: codee-medusa-backend-conventions
description: Where a file goes, what it is called, and what its JSDoc must say across a Medusa backend - workflows and steps, API routes, modules, links, subscribers and jobs. Use when writing or reviewing any Medusa backend file, and whenever naming a new one.
---

# Medusa Backend Conventions

Apply this skill after `codee-ts-code-conventions`.

`codee-medusa-backend` covers what Medusa dictates. This skill covers what we decided where Medusa
left room: where a file goes, what it is called, and what its JSDoc must say. It overrides the base
comment rule only where it explicitly requires JSDoc.

## File layout

### `workflows/`

Group by domain, not by kind:

```
src/workflows/<domain>[/<sub-domain>]/{steps,workflows,utils,types}/<name>.ts
```

- **One `createStep` per file, one `createWorkflow` per file.** A file that defines two of either
  is splitting work the caller cannot name.
- **The file name is the exported symbol in kebab-case, minus the suffix.** `list-products.ts`
  exports `listProductsStep`; `create-order.ts` exports `createOrderWorkflow`.
- **A workflow's id string matches its file name.** `createWorkflow("sync-order-to-erp")`
  lives in `sync-order-to-erp.ts`. The id is what shows up in logs and the workflow engine,
  so a reader who sees one must be able to open the other.
- **Helpers shared inside a domain go in `<domain>/utils/`.** Extract a helper out of a step only
  when it has a second consumer, or when it belongs to a module's domain rather than to the
  workflow. Testability is never a reason to extract: steps are tested through the `createStep`
  harness, per `codee-medusa-testing`.

### `api/`

Medusa fixes the directory path - it is the URL - and the name `route.ts`. The rest is ours:

| File | Holds |
|---|---|
| `route.ts` | the handlers for that URL |
| `validators.ts` | Zod schemas and their inferred types, beside the route that uses them |
| `query-config.ts` | listed fields and pagination defaults, where a route paginates |
| `middlewares.ts` | that resource's own middleware |

`middlewares.ts` composes bottom-up: each resource declares its own, the area file
(`api/admin/middlewares.ts`, `api/store/middlewares.ts`) collects its resources, and
`api/middlewares.ts` collects the areas. Medusa only requires the last one; the rest keep a
middleware next to the route it guards.

Middleware shared across resources goes in `api/middlewares/<verb>-<subject>.ts`, named with the
verb that says what it does to the request: `enforce-`, `ensure-`, `verify-`.

### `modules/`

```
src/modules/<module-name>/
  index.ts                       module definition and the <NAME>_MODULE constant
  service.ts                     the module service
  models/                        one file per data model, plus an index.ts barrel
  migrations/                    generated, never hand-written
  types/ lib/ clients/ loaders/  as the module needs them
```

- The directory is kebab-case and the exported constant is `<NAME>_MODULE` in SCREAMING_SNAKE.
  What its *value* may contain is Medusa's constraint rather than ours - see `codee-medusa-backend`.
- The service class is `<Pascal>ModuleService`.
- A model file is kebab-case and exports the PascalCase model of the same name: `product-review.ts`
  exports `ProductReview`. Keep the two in step - a file that drops a word its model keeps makes the
  model unfindable by name.

### `links/`

One file per link, named after both sides, left to right: `review-product.ts`,
`wishlist-customer.ts`, `loyalty-tier-sales-channel.ts`.

Singular or plural in the file name carries no meaning - it does not track `isList`, and reading
one into it will mislead you. Check the definition.

### `subscribers/` and `jobs/`

Both are flat and kebab-case, and both export a default async handler plus a named `config`.

- **A subscriber is named after the event it answers, then what it does with it:**
  `order-placed-send-receipt.ts`, `product-updated-reindex.ts`.
- **A job is named after the work, verb first:** `expire-abandoned-carts.ts`,
  `process-pending-payouts.ts`.

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
| `plan-` | reads current state and **decides a branch**, returning an action and a reason | `planImageRegenerationStep` answers `skip` or `regenerate` |
| `prepare-` | **readies data for the next step**, which is the one that writes | `prepareReviewLinksStep` feeds `createRemoteLinkStep` |
| `list-` / `fetch-` | **reads** rows or an upstream response and returns them | `listProductImagesStep` |
| `register-` / `link-` / `repoint-` | **writes**, and owns its compensation | `registerProductVariantsStep` |

Do not use `build-` for a step. It reads as a synonym of `prepare-`, and where both are in play
they drift until they name the same job under different words. `build-` stays for plain functions.

When a `transform()` in the workflow already does the shaping, do not add a step for it. A step
earns its place when the workflow needs a named node to pass along, or when the shaping is worth
a test of its own — and then it is the step that is tested, per `codee-medusa-testing`.

## Deviations

A codebase that predates these rules will break them in places. Leave those alone unless you are
fixing them deliberately, and record them in the project's own notes — not here. A shared skill
states the rule; the backlog of what does not yet meet it belongs to the project that carries it.
