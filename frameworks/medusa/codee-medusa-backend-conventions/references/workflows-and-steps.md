# Workflows and Steps

Where data is read and written, how a workflow is composed, what a step does and returns, and what
their JSDoc says. Names are in
`step-and-workflow-names.md`; where a helper goes is in `file-layout.md`.

## Contents

- [Where data is read and written](#where-data-is-read-and-written)
- [Workflow composition](#workflow-composition)
- [One job per step](#one-job-per-step)
- [Step shape](#step-shape)
- [Workflow JSDoc](#workflow-jsdoc)
- [Step JSDoc](#step-jsdoc)

## Where data is read and written

**Query and module services are called in steps only.** A route handler, a middleware, a subscriber
and a scheduled job reach data by running a workflow, reads included: a list or detail route runs a
`list-` or `get-` workflow composed of steps - `useQueryGraphStep` for a plain `query.graph` read -
never a module service or `query.graph` in its handler. A read written once as a step is reused by
every route and workflow that needs it; a read inside a handler can only be copied.

A middleware that reads no data - a header, a token checked against the owning module's options - runs
no workflow. A workflow util and every other plain function take what a step read and return what a
step writes, per `codee-ts-code-conventions` `references/code-layout.md`, "Plain functions are pure".

This narrows `codee-medusa-backend`, whose route examples read with `query.graph` in the handler:
Medusa allows it, and we do not.

## Workflow composition

**Every `when()` is named:** `when("sync-variant-images", input, (input) => ...)`. The name is
what the workflow engine shows for the branch, and it lets several `when()` blocks run one after
another in the same workflow. Medusa's own constraint - a nested `when()` breaks the outer block at
composition - is in `codee-medusa-backend` `references/workflows.md`, "Conditional Logic".

**A `transform()` callback stays one level deep.** It takes the step results and assembles the
output. The work done for each item - finding its related records, deciding a value from them -
goes into a named function that the callback calls once per item:

```ts
// Wrong: the per-item logic is nested inside the callback
transform({ result, versions }, ({ result, versions }) => ({
  ...result,
  documents: result.documents.map((document) => {
    const latest = versions.find((version) => version.document_id === document.id)
    return { ...document, has_draft: latest?.status === "draft" }
  }),
}))

// Correct: the callback only maps, and the function holds the logic
transform({ result, versions }, ({ result, versions }) => ({
  ...result,
  documents: result.documents.map((document) => buildListedDocument(document, versions)),
}))
```

A nested `map`, `find` or condition inside the composition function is read between step calls,
and nothing names it, documents it or tests it. A step's body is tested in place through the
`createStep` harness, but a transform callback has no test of its own. So the function goes in
`<domain>/utils/` and carries the unit test an exported util owes, per `codee-medusa-testing`,
even with one caller.

## One job per step

A step reads, decides, or writes - one of the three, which are the three groups of prefixes in
`step-and-workflow-names.md`, "Step naming". A step whose body needs two groups is two steps.

- A read step (`list-`, `get-`, `fetch-`) changes no state.
- A decision step (`validate-`, `prepare-`) changes no state.
- A write step (`create-`, `update-`, `delete-`, `upsert-`, `link-`, `unlink-`) writes what it is
  given and decides nothing. It may read in two cases, and both belong to the write rather than
  being a second job:
  - before writing, the current values it is about to overwrite, so that its compensation can put
    them back - Medusa's own update steps do the same;
  - after a create fails on a unique key, the row it collided with, to tell a lost race from a
    real failure. That read decides whether the write failed at all, so it cannot move to a
    following step.

An operation that needs all three - take a unit of work, close a batch, sync a record - is a
workflow named after the operation (see `step-and-workflow-names.md`, "Workflow naming"). A caller
that needs it as one node runs it with `.runAsStep()`, and the nested workflow's steps are
compensated when the caller rolls back.

## Step shape

**A step that drives a branch returns a discriminated union.** Where a workflow calls `when()` on
a step's result, that result carries an `action` to switch on, and the arm that does nothing
carries a `reason`:

```ts
export type RegenerationPlan =
  | { action: "skip"; imageId: string; reason: SkipReason }
  | { action: "regenerate"; imageId: string; widths: number[] }
```

The workflow then reads as `when(..., ({ plan }) => plan.action === "regenerate")`. Keeping the
signal in the type rather than in the step's name lets the compiler hold the two together; a
prefix cannot.

**A step that accepts `fields` accepts a union, not strings.** A step promises the shape of what
it returns. A caller free to pass any field string can ask for one the output type has no room
for - it will be read from the database and then silently dropped:

```ts
/** Fields readable on top of the defaults, bounded by what the output type can hold. */
export type ProductExtraField = "thumbnail" | "variants.id" | "variants.thumbnail"
```

A caller that genuinely needs arbitrary fields does not need this step - it needs
`useQueryGraphStep`, which `codee-medusa-backend` covers. Do not rebuild it.

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
