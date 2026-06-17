---
name: code-style-medusa
description: Medusa-specific code style conventions for workflows and steps. Load alongside code-style when writing or reviewing any Medusa workflow or step code.
---

# Code Style — Medusa

Extends the general `code-style` skill with conventions specific to Medusa workflows and steps.

> **Override:** The general `code-style` skill says "comment only when the why is non-obvious." For Medusa workflows and steps, JSDoc is **always required** regardless — the rules below apply unconditionally.

---

## Workflow comments

Every `createWorkflow` call must have a JSDoc block that describes:

1. What the workflow does (one sentence)
2. The fan-out / step dependency order (which steps run concurrently, which are sequential)
3. Any non-obvious constraints or compensations

**Example:**
```ts
/**
 * Simulates a Struct → Medusa product migration for a single Struct product ID.
 *
 * Step order:
 *   1. fetchStructProductDataStep          — fetches product root + all variant batches
 *   2. resolveOptionAxesStep               — concurrent with step 3
 *   3. fanOutStructProductStep             — concurrent with step 2
 *   4. buildMedusaProductsStep             — depends on steps 2 + 3
 *
 * Dry-run only — does not persist anything to the database.
 */
export const simulateProductMigrationWorkflow = createWorkflow(...)
```

---

## Step comments

Every `createStep` call must have a JSDoc block that describes:

1. What the step does and what it returns
2. Any non-obvious data sources or transformations
3. Key edge cases handled (quarantine, fallbacks, etc.)

**Example:**
```ts
/**
 * Groups Struct variants by the product's group_by attribute value,
 * producing one entry per future Medusa product.
 *
 * Variants with no group_by value are collected in `quarantinedVariants`
 * and excluded from `groups` entirely (scenario S15).
 *
 * Runs independently of resolveOptionAxesStep — both depend only on productData
 * and are executed concurrently by the workflow engine.
 */
export const fanOutStructProductStep = createStep(...)
```
