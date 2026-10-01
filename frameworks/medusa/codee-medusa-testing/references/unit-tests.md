# Unit tests — pure functions

For builders, mappers, normalizers, hashers, Zod schemas, and any exported helper with no
container dependency. Plain Jest, no framework mocking.

> Examples below use a placeholder `blog` / `Post` domain. Substitute your own module.

## Location & name

Colocated with the code under test:

```
src/workflows/blog/utils/build-post-payload.ts
src/workflows/blog/utils/__tests__/build-post-payload.unit.spec.ts
```

Picked up by `TEST_TYPE=unit` (`**/src/**/__tests__/**/*.unit.spec.[jt]s`).

## Shape — builder with factory helpers

```ts
import { buildPostPayload } from "../build-post-payload"
import type { PostDraft, PostSectionDraft } from "../../types"

/** Minimal valid section; override only the field under test. */
function buildSection(overrides: Partial<PostSectionDraft> = {}): PostSectionDraft {
  return {
    heading: "Intro",
    body: "Lorem ipsum.",
    published: true,
    ...overrides,
  }
}

/** Minimal valid draft built on top of buildSection(). */
function buildDraft(overrides: Partial<PostDraft> = {}): PostDraft {
  return {
    title: "Hello World",
    author: "jane",
    sections: [buildSection()],
    ...overrides,
  }
}

describe("buildPostPayload", () => {
  it("derives the handle from the title", () => {
    const payload = buildPostPayload(buildDraft({ title: "My First Post" }))
    expect(payload.handle).toBe("my-first-post")
  })

  it("drops sections that are not published", () => {
    const payload = buildPostPayload(
      buildDraft({ sections: [buildSection({ published: false })] }),
    )
    expect(payload.sections).toEqual([])
  })
})
```

## Shape — Zod schema

For a schema outside `src/api/` - a config, a form, a payload a step parses. A schema that
validates an API route is tested through that route's HTTP integration test instead, see
`api-routes-tests.md`.

Assert both directions — `parse` for defaults/coercion, `safeParse(...).success === false`
for rejection.

```ts
import { CreatePostSchema } from "../validators"

describe("CreatePostSchema", () => {
  it("defaults status to draft", () => {
    expect(CreatePostSchema.parse({ title: "T" }).status).toBe("draft")
  })

  it.each(["draft", "scheduled", "published"] as const)("accepts status %s", (status) => {
    expect(CreatePostSchema.parse({ title: "T", status }).status).toBe(status)
  })

  it("rejects an unknown status", () => {
    expect(CreatePostSchema.safeParse({ title: "T", status: "archived" }).success).toBe(false)
  })
})
```

## Conventions

- **Local factory helpers**, not shared fixture modules. One `buildX(overrides = {})` per
  input type, returning the smallest valid object; each helper builds on the ones below
  it. Tests pass only the fields they assert on.
- **One behavior per `it`**, named as a sentence about the behavior.
- **`it.each`** for table-driven cases — enum acceptance, boundary values.
- **No container, no `jest.mock` of framework packages.** If the function needs a service,
  it is not a pure function — use the step harness (`references/steps-tests.md`) or pass
  the dependency in as a plain argument.
- Async pure functions: `await expect(fn(input)).resolves.toEqual(...)` /
  `.rejects.toThrow(...)`.
- **One clock mechanism per file**: either `jest.useFakeTimers()` with `setSystemTime` and
  `advanceTimersByTimeAsync`, or a `jest.spyOn(Date, "now")`, never both. Fake timers already fake
  `Date.now`, so a second mechanism makes the result depend on which one ran last. Spy once per
  test, outside any loop.
- **A concurrency test asserts both sides**: that the limit held and that work really ran in
  parallel - the peak in-flight count equals the limit, not merely stays under it. A sequential
  implementation passes `peak <= limit`.
- **No `expect` inside `if`/`else`**: a branch decides which assertion runs, so a test can pass
  without asserting anything. Split the cases into separate tests or `it.each` rows.

## Invariant / parity tests

When a unit guards an invariant across two data sources (two registries that can drift,
a generated list vs a hand-maintained one), assert the full relationship — key counts,
one-to-one key mapping, per-entry parity — not a spot check of a few entries. A spot check
passes while the drift sits in the entry you didn't sample.
