# Step tests — the `createStep` mock harness

Unit-test a step handler directly, without booting Medusa and without extracting a helper
function whose only caller is the test.

> Examples below use a placeholder `blog` / `Post` domain. Substitute your own module.

## Why this harness

`createStep(name, invoke, compensate)` returns a `StepFunction` object that cannot be
called in a unit test. Partially mock `@medusajs/framework/workflows-sdk` so `createStep`
returns the raw handler(s) instead. `jest.requireActual` keeps everything else real
(`StepResponse`, `createWorkflow`, …).

```ts
jest.mock("@medusajs/framework/workflows-sdk", () => {
  const actual = jest.requireActual("@medusajs/framework/workflows-sdk")

  return {
    ...actual,
    // no compensation:
    createStep: (_nameOrConfig: unknown, invoke: unknown) => invoke,
    // with compensation:
    // createStep: (_n, invoke, compensate) => [invoke, compensate],
  }
})
```

The mock is hoisted above the imports by Jest — keep it at the top of the file, before
importing the step.

## Full example — step without compensation

```ts
import { Modules } from "@medusajs/framework/utils"
import { BLOG_MODULE } from "../../../../../modules/blog"
import {
  loadPostContextStep,
  type LoadPostContextInput,
  type LoadPostContextOutput,
} from "../load-post-context"

jest.mock("@medusajs/framework/workflows-sdk", () => {
  const actual = jest.requireActual("@medusajs/framework/workflows-sdk")
  return { ...actual, createStep: (_n: unknown, invoke: unknown) => invoke }
})

/** All external services the step resolves, as jest mocks. */
function createDependencies(overrides: {
  post?: { id: string; author_id: string }
  author?: { id: string; name: string }
}) {
  return {
    blogModuleService: {
      retrievePost: jest.fn(async () => overrides.post ?? { id: "post_1", author_id: "usr_1" }),
    },
    userModuleService: {
      listUsers: jest.fn(async () => (overrides.author ? [overrides.author] : [])),
    },
  }
}

/** Fake container: resolve() switches on the registration key, throws on anything unexpected. */
async function runStep(
  input: LoadPostContextInput,
  dependencies: ReturnType<typeof createDependencies>,
): Promise<LoadPostContextOutput> {
  const container = {
    resolve: jest.fn((registrationName: string) => {
      if (registrationName === BLOG_MODULE) return dependencies.blogModuleService
      if (registrationName === Modules.USER) return dependencies.userModuleService
      throw new Error(`Unexpected dependency: ${registrationName}`)
    }),
  }
  const invoke = loadPostContextStep as unknown as (
    stepInput: LoadPostContextInput,
    context: { container: typeof container },
  ) => Promise<{ output: LoadPostContextOutput }>

  const response = await invoke(input, { container })
  return response.output
}

describe("loadPostContextStep", () => {
  it("returns the post together with its resolved author name", async () => {
    const result = await runStep(
      { postId: "post_1" },
      createDependencies({ author: { id: "usr_1", name: "Jane" } }),
    )
    expect(result).toEqual({ post: { id: "post_1", author_id: "usr_1" }, authorName: "Jane" })
  })

  it("falls back to 'Unknown' when the author was deleted", async () => {
    const result = await runStep({ postId: "post_1" }, createDependencies({}))
    expect(result.authorName).toBe("Unknown")
  })
})
```

## Full example — step with compensation

`createStep` returns `[invoke, compensate]`. Destructure both, drive each independently,
and check `response.compensateInput` (the value the framework would hand to `compensate`).

```ts
jest.mock("@medusajs/framework/workflows-sdk", () => {
  const actual = jest.requireActual("@medusajs/framework/workflows-sdk")
  return {
    ...actual,
    createStep: (_n: unknown, invoke: unknown, compensate: unknown) => [invoke, compensate],
  }
})

function getInvokeAndCompensate() {
  const [invoke, compensate] = createPostsStep as unknown as [
    (
      input: CreatePostsInput,
      ctx: { container: { resolve: (name: string) => unknown } },
    ) => Promise<{ output: CreatePostsOutput; compensateInput: string[] }>,
    (
      compensationInput: string[] | undefined,
      ctx: { container: { resolve: (name: string) => unknown } },
    ) => Promise<void>,
  ]
  return { invoke, compensate }
}

it("compensation deletes exactly the posts created by this run", async () => {
  const service = createBlogModuleService()
  const { invoke, compensate } = getInvokeAndCompensate()

  const response = await invoke({ titles: ["A", "B"] }, { container: containerFor(service) })
  await compensate(response.compensateInput, { container: containerFor(service) })

  expect(service.deletePosts).toHaveBeenCalledWith(["post_1", "post_2"])
})
```

Always cover: compensation with real input, compensation with `undefined` (no-op), and
that compensation touches **only** what this run created.

## Conventions

- `createDependencies()` / `createXModuleService()` factory returns all mocks; a stateful
  factory (`let seq = 0`, in-memory arrays) models create→read within one test.
- `containerFor(deps)` / inline `container` — `resolve` is a `jest.fn`, unknown key throws.
- Read `response.output`, `response.compensateInput` — the mock preserves the real
  `StepResponse`, so those properties exist.
- Common registration keys: `Modules.PRODUCT`, `Modules.CACHING`,
  `ContainerRegistrationKeys.LOGGER`, and each custom module's exported token.
- Assert on mock call args (`service.createX.mock.calls[0][0]`) and call counts, not just
  return values — order and "was not called" matter for these steps.
- `jest.setTimeout` not needed — no I/O.

## What this harness does NOT cover

Verifies the handler's logic, dependency resolution, output, and compensation in
isolation. Does **not** cover: workflow registration, step ordering, retries, `when` /
`transform`, hooks, or data serialization between steps. When those are the risk, add a
workflow integration test — `references/workflows-tests.md`.

## Coupling / when to revisit

This is a project-local harness, not an official Medusa test tool. It is coupled to the
current `createStep(nameOrConfig, invoke, compensate)` signature and Jest's CommonJS mock
hoisting. A `@medusajs/framework` major upgrade must re-check it.
