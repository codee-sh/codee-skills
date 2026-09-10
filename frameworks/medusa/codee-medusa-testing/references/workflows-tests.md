# Workflow tests — `medusaIntegrationTestRunner`

**Optional / manual.** Needs a live Postgres. Not part of the routine check.

> Examples below use a placeholder `blog` / `Post` domain. Substitute your own workflow.

## When a workflow needs its own test

Most workflow logic belongs in steps and is covered by the step harness
(`references/steps-tests.md`). Add a workflow-level test **only** for behavior that emerges
from orchestration and cannot be seen from a single step:

- **Cross-step compensation** — step C throws, and you need to prove steps A and B rolled
  back (their `compensate` ran with the right input).
- **`when` / `transform` branching** between steps.
- **Workflow hooks** (`.hooks.someHook`) firing with the expected payload.
- **Data serialization between steps** — a step returns a class instance / Date / Error
  subclass and the next step receives it degraded (see error serialization in
  `references/troubleshooting.md`).

If none of these apply, a workflow test is redundant with the step tests — skip it and say
so.

## Pattern

```ts
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { publishPostWorkflow } from "../../src/workflows/blog/workflows"

jest.setTimeout(60 * 1000)

// Manual, DB-backed. Run: npm run test:integration:http
medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("publishPostWorkflow", () => {
      it("returns the published post", async () => {
        const { result } = await publishPostWorkflow(getContainer()).run({
          input: { postId: "post_1" },
        })

        expect(result).toMatchObject({ status: "published" })
      })

      it("surfaces the step error without throwing", async () => {
        const { errors } = await publishPostWorkflow(getContainer()).run({
          input: { postId: "missing" },
          throwOnError: false,
        })

        expect(errors.length).toBeGreaterThan(0)
        expect(errors[0].error.message).toContain("not found")
      })
    })
  },
})
```

## Notes

- **Location:** `integration-tests/http/<area>/<name>.spec.ts` — the `integration:http`
  runner globs that directory. Add a top-of-file comment noting the test is manual and
  DB-backed.
- **Run:** `test:integration:http`.
- `getContainer()` → pass to the workflow function, then `.run({ input, throwOnError? })`.
- `throwOnError: false` returns `{ result, errors }`; inspect `errors[0].error`.
- The runner creates a random-named database and drops it after the file. Outbound calls
  to third-party APIs are real unless the module is stubbed — prefer seeding local state
  and asserting on Medusa-side effects, or keep the assertion on error paths that never
  reach the network.
- Compensation check: run the workflow with an input that makes a later step throw, then
  query the container's services to prove earlier writes were undone.

## Subscribers & scheduled jobs

- The handler's pure logic (payload shaping, guards) → unit test that function directly.
- If the handler only wires `container.resolve(...)` into `workflow(...).run(...)`, test
  the workflow and trust the one-line wiring — don't boot the subscriber.
- If it must be exercised end to end, use `medusaIntegrationTestRunner` and invoke the
  handler with `{ container: getContainer(), ... }`.
