# Troubleshooting Medusa Tests

Common failures when writing or running tests for a Medusa backend, and their fixes. Read
the mock sections before writing any mock — several of these pass locally and fail on
Medusa Cloud, or hide a real runtime bug.

> Examples use a placeholder `blog` / `Post` domain.

## Contents
- [Mock Errors](#mock-errors)
- [Runner Errors](#runner-errors)
- [Assertion Surprises](#assertion-surprises)
- [General Debugging Tips](#general-debugging-tips)

## Mock Errors

### Error: step under test is not a function

```
TypeError: fetchPostsStep is not a function
```

**Cause**: `createStep(...)` returns a `StepFunction` object, not the handler. It cannot be
called directly.

**Solution**: Partially mock the workflows SDK so `createStep` returns the raw handler.
Keep the `jest.mock` call at the top of the file — Jest hoists it above the imports.

```ts
jest.mock("@medusajs/framework/workflows-sdk", () => {
  const actual = jest.requireActual("@medusajs/framework/workflows-sdk")
  return {
    ...actual,
    createStep: (_n: unknown, invoke: unknown) => invoke,               // no compensation
    // createStep: (_n, invoke, compensate) => [invoke, compensate],    // with compensation
  }
})
```

`jest.requireActual` keeps `StepResponse` and `createWorkflow` real — only `createStep` is
replaced.

### Error: mock service method returns undefined

```
TypeError: this.listPostStatuses is not a function
```

**Cause**: `MedusaService` pluralizes every generated method name except `retrieve`. For a
model `PostStatus` the runtime methods are `listPostStatuses`, `createPostStatuses`,
`updatePostStatuses`, `deletePostStatuses` — even when create/update/delete receives a
single record. Irregular plurals (`Status` → `Statuses`) are the usual trap. A mock with
the wrong name silently returns `undefined`.

**Solution**: Name mock methods after the real generated API. Check an existing call site
or the service instance before writing the mock.

```ts
const blogModuleService = {
  listPostStatuses: jest.fn(async () => []),      // not listPostStatus
  createPostStatuses: jest.fn(async (rows) => rows),
}
```

### Error: cache-aside test passes but production serves a stale value

**Cause**: The Redis caching provider writes entry data with `HSETNX` — a `set` over a
live key is a silent no-op that only extends the stale value's TTL. The in-memory provider
used locally overwrites normally, so the bug is invisible until Cloud. A test mock that
overwrites on `set` hides the missing `clear`.

**Solution**: Production code must `clear({ key })` before `set` for a replaceable key.
Make the mock refuse the second write so the test catches a missing `clear`:

```ts
let cachedValue: unknown = null
const cachingModuleService = {
  get: jest.fn(async () => cachedValue),
  set: jest.fn(async ({ data }: { data: object }) => {
    cachedValue ??= data          // NOT: cachedValue = data
  }),
  clear: jest.fn(async () => { cachedValue = null }),
}
```

Also: `CachingModuleService` fires `void provider.set(...)`, so a `try/catch` around
`await cachingModuleService.set(...)` never observes a provider failure. Don't assert that
a resolved `set` means the value was stored.

### Error: container.resolve throws "Unexpected dependency"

**Cause**: The step resolves a registration key the fake container doesn't handle. This is
the harness working as intended — it surfaces every dependency the step actually uses.

**Solution**: Add the branch and a mock for it, or — if the key is unexpected — check
whether the step should be resolving it at all.

```ts
resolve: jest.fn((name: string) => {
  if (name === BLOG_MODULE) return blogModuleService
  if (name === Modules.USER) return userModuleService
  throw new Error(`Unexpected dependency: ${name}`)
})
```

## Runner Errors

### Error: test times out after 5000 ms

```
thrown: "Exceeded timeout of 5000 ms for a hook"
```

**Cause**: `medusaIntegrationTestRunner` / `moduleIntegrationTestRunner` boot a real
Postgres and migrate it. The default Jest timeout is too short.

**Solution**: Add `jest.setTimeout(60 * 1000)` at the top of every runner-based file.

### Error: "No tests found" from `test:integration:modules`

**Cause**: The `integration:modules` glob matches `*.integration.spec.ts` only, and no such
file exists yet.

**Solution**: Expected — the script passes `--passWithNoTests` and exits 0. Add a real
`src/modules/<module>/__tests__/<name>.integration.spec.ts` when a module needs DML
coverage.

### Error: entity metadata leaks between suites

```
ValidationError: Duplicate entity metadata "Post"
```

**Cause**: MikroORM decorator metadata is process-global and carries over between test
files.

**Solution**: Keep `MetadataStorage.clear()` in `integration-tests/setup.js` and keep that
file in `setupFiles`. Don't remove it.

### Error: TypeScript errors don't fail the test

**Cause**: `@swc/jest` strips types; it does not type-check. A test — and the code it
imports — can have type errors and still run green.

**Solution**: After test changes, run the project's lint check, and for `.ts` behavior
changes run `tsc` separately. Tests passing is not proof the code compiles.

## Assertion Surprises

### Error: `instanceof CustomError` is false in a workflow test

**Cause**: Workflow orchestration can serialize an `Error` subclass into a plain object
before it reaches an API route or subscriber. `name`, `message`, and custom fields
survive; the prototype does not.

**Solution**: At workflow boundaries, assert on the serialized structure
(`error.name`, `error.message`, custom fields) rather than the runtime class.

```ts
const { errors } = await publishPostWorkflow(getContainer()).run({ input, throwOnError: false })
expect(errors[0].error.message).toContain("not found")
```

### Error: `api.get(...)` rejects instead of returning a 4xx response

**Cause**: The runner's `api` client is axios-like — any non-2xx status rejects.

**Solution**: Catch and read `e.response`.

```ts
const { response } = await api.get("/admin/blog/posts/missing", { headers }).catch((e) => e)
expect(response.status).toEqual(404)
expect(response.data).toMatchObject({ type: "not_found" })
```

### Error: handler never receives `validatedQuery` / `validatedBody`

**Cause**: A route-local `middlewares.ts` is not loaded automatically — the middleware
collection must be spread into the central `api/*/middlewares.ts` aggregator.

**Solution**: Register the collection in the aggregator. An integration test that asserts
on a 400 for bad query params catches this regression.

## General Debugging Tips

### Run one test file

```bash
TEST_TYPE=unit npx jest path/to/file.unit.spec.ts
```

### See console output from a unit run

The `test:unit` script passes `--silent`. Drop it for one run:

```bash
TEST_TYPE=unit npx jest --runInBand path/to/file.unit.spec.ts
```

### Inspect what a step actually resolved

The fake container's `resolve` is a `jest.fn` — assert on its calls to see every
dependency the step touched.

```ts
expect(container.resolve).toHaveBeenCalledWith(BLOG_MODULE)
expect(container.resolve).not.toHaveBeenCalledWith(Modules.CACHING)
```
