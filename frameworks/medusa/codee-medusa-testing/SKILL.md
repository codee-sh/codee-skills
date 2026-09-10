---
name: codee-medusa-testing
description: >-
  Decide what test to write and at which layer for ANY Medusa backend change, then write
  it to the repository's conventions. Covers steps, workflows, module services, custom
  API routes, middleware/validators, subscribers, scheduled jobs, and plain
  utils/builders/mappers. Load it BEFORE writing or reviewing the code, not after:
  it names the test you owe, the runner, the file location and name, and the mock harness
  for that layer. Trigger on "add a test", "write tests", "how do I test this
  step/workflow/module/route", "test coverage for X", on every new createStep /
  createWorkflow / MedusaService / API route / exported util, and whenever finishing a
  backend feature that still has no test. Also load when a step test needs the createStep
  mock harness, when choosing between a plain unit test and moduleIntegrationTestRunner /
  medusaIntegrationTestRunner, or when a test fails on cache mocks, generated DML method
  names, MikroORM metadata, or workflow error serialization.
---

# Medusa Testing

Pick the right test layer for a backend change and write it the way the repository
already does. Apply after `codee-ts-code-conventions` and
`codee-medusa-code-conventions` — those still govern naming, JSDoc, and clarity inside
the test file.

The goal: no step, workflow, module service, API route, or exported util lands "blind".
Every such change carries the test named in the altitude table below, or an explicit
one-line note in the PR/commit saying why not.

## Test altitude

Find the row for what you just wrote. The default is a fast unit test; integration runners are opt-in because they boot a real Postgres database.

| You wrote… | Default test | Runner | Reference |
|---|---|---|---|
| Pure function: builder, mapper, normalizer, hash, Zod schema | unit `*.unit.spec.ts`, colocated | plain Jest | `references/unit-tests.md` |
| Step (`createStep`), no compensation | step unit `*.unit.spec.ts`, colocated | `createStep` mock harness | `references/steps-tests.md` |
| Step with compensation | step unit — exercise `invoke` **and** `compensate` | `createStep` mock harness (`[invoke, compensate]`) | `references/steps-tests.md` |
| Workflow — emergent behavior only (cross-step compensation, `when` / `transform`, hooks, data passed between steps) | workflow integration — **optional / manual** | `medusaIntegrationTestRunner` + `workflow.run()` | `references/workflows-tests.md` |
| Module service — HTTP client / outbound calls | unit, mock `global.fetch` | plain Jest | `references/modules-tests.md` |
| Module service — DML / data-model / repository logic | module integration — **optional / manual** | `moduleIntegrationTestRunner` | `references/modules-tests.md` |
| Custom API route — full request path (validator + handler + workflow) | HTTP integration — **optional / manual** | `medusaIntegrationTestRunner` + `api.*` | `references/api-routes-tests.md` |
| Middleware / Zod validator in isolation | unit — `schema.parse` / `.safeParse` | plain Jest | `references/api-routes-tests.md` |
| Subscriber / scheduled job | unit for the handler's own logic; integration only if it must touch the container | plain Jest / `medusaIntegrationTestRunner` | `references/workflows-tests.md` |

`references/medusa-test-utils.md` — condensed `@medusajs/test-utils` reference (runner
signatures, `testSuite` shape, options) plus upstream doc links.

`references/troubleshooting.md` — read before writing any mock. Cache semantics, generated
DML method names, workflow error serialization, MikroORM metadata, Jest flags.

## Policy: unit-first

- **Unit tests are the baseline** and run in CI via the `test:unit` script.
- **Integration runners are optional and run manually.** `moduleIntegrationTestRunner` and
  `medusaIntegrationTestRunner` need a live Postgres; they are not part of the routine
  check. Add one when the risk is real (irreversible writes, cross-step compensation,
  auth wiring, a route whose middleware must be registered) and note in the test file
  that it is manual (`test:integration:modules` / `test:integration:http`).
- If the interesting logic can be pulled into a pure function or tested through the step
  harness, do that instead of reaching for a runner.

## Do not distort production code for tests

Test the step handler directly through the `createStep` mock harness. Do **not** extract
a second exported function out of a step (or route, or service method) whose only caller
is the test. The harness exists precisely so production code stays shaped by its real
use. See `references/steps-tests.md`.

## Conventions

| Thing | Rule |
|---|---|
| Unit test location | Colocated: `<dir>/__tests__/<name>.unit.spec.ts` |
| Module integration test | `src/modules/<module>/__tests__/<name>.integration.spec.ts` |
| HTTP / workflow integration test | `integration-tests/http/<area>/<name>.spec.ts` |
| Test names | Full sentence describing the behavior, not the method: `it("returns an empty list when the upstream sends no items")` |
| Fixtures | Local factory helpers with `overrides: Partial<T> = {}`, not shared fixture files |
| Timeout | `jest.setTimeout(60 * 1000)` in every runner-based file |
| Commands | `test:unit` (routine), `test:integration:modules` / `test:integration:http` (manual) |
