# File Layout

Where a file goes in a Medusa backend, in an application and a plugin alike. This narrows
`codee-ts-code-conventions` `references/code-layout.md`: it names the folder of each role and the
cases Medusa adds, and leaves every other rule there.

## Contents

- [Folder roles in Medusa](#folder-roles-in-medusa)
- [When a helper leaves its unit](#when-a-helper-leaves-its-unit)
- [`workflows/`](#workflows)
- [`api/`](#api)
- [`modules/`](#modules)
- [`links/`](#links)
- [`subscribers/` and `jobs/`](#subscribers-and-jobs)

## Folder roles in Medusa

| Role in `code-layout.md` | Folder in Medusa |
|---|---|
| Helper of one workflow domain | `src/workflows/<domain>/utils/` |
| Helper several workflow domains, routes or subscribers read | `src/utils/<domain>/` |
| A module's own code | `src/modules/<module>/lib/` |
| Technical: a client of an outside system | `src/modules/<module>/clients/` |
| Technical, in the Admin | `src/admin/lib/` - see `codee-medusa-admin-dashboard` `references/file-structure.md` |
| Shared, in a plugin: code a storefront imports too | `src/shared/`, behind an export entry of its own such as `./shared` |
| A script's helper | `src/scripts/shared/` - see `codee-medusa-scripts` |

`lib/` inside a module is that module's own domain code, not technical code: Medusa projects keep a
module's rules there, beside its service. Only the module's `clients/` talk to the outside.

## When a helper leaves its unit

A unit in Medusa is a step, a workflow's composition function, a route handler, a subscriber or a
job. The rule of `code-layout.md` holds - a helper leaves its unit for a second consumer - with one
narrowing: a step keeps its logic in its own file even when it runs several checks side by side, as
the `createStep` harness tests them there; the "file of its own beside its caller" case is for plain
functions only. These cases move a helper with one consumer:

- **A function a `transform()` callback calls** goes to `<domain>/utils/` with the unit test an
  exported util owes - see `workflows-and-steps.md`, "Workflow composition".
- **Code that belongs to a module's domain** rather than to the workflow goes to
  `src/modules/<module>/lib/`.
- **A pure function a plugin's Admin runs too**, such as a validation schema the server and the form
  share, goes to a file that imports nothing reaching Node - see `codee-medusa-admin-dashboard`
  `references/file-structure.md`, "In a plugin".

Testability is never a reason to extract: steps are tested through the `createStep` harness, per
`codee-medusa-testing`.

## `workflows/`

Group by domain, not by kind:

```
src/workflows/<domain>[/<sub-domain>]/{steps,workflows,utils,types}/<name>.ts
```

- **One `createStep` per file, one `createWorkflow` per file.** A file that defines two of either
  is splitting work the caller cannot name.
- How a step's or a workflow's file is named: `step-and-workflow-names.md`, "File names and ids".
- Where a helper goes: [When a helper leaves its unit](#when-a-helper-leaves-its-unit).

## `api/`

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
verb that says what it does to the request: `enforce-`, `ensure-`, `verify-`. These guard verbs are
Medusa's narrowing for middleware only; a plain function keeps `validate-`, per
`codee-ts-code-conventions` `references/function-and-file-names.md`.

**A list route answers `{ <plural>, count, limit, offset }`** - `{ reviews, count, limit, offset }` -
the shape Medusa's own list routes return, so the Admin's table code reads every list the same way.
Its default page size is one constant in its `query-config.ts`, which the route and the Admin hook
both use instead of repeating the number.

## `modules/`

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

## `links/`

One file per link, named after both sides, left to right: `review-product.ts`,
`wishlist-customer.ts`, `loyalty-tier-sales-channel.ts`.

Singular or plural in the file name carries no meaning - it does not track `isList`, and reading
one into it will mislead you. Check the definition.

## `subscribers/` and `jobs/`

Both are flat and kebab-case, and both export a default async handler plus a named `config`.

- **A subscriber is named after the event it answers, then what it does with it:**
  `order-placed-send-receipt.ts`, `product-updated-reindex.ts`.
- **A job is named after the work, verb first:** `expire-abandoned-carts.ts`,
  `process-pending-payouts.ts`.
