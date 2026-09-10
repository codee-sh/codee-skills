# Module service tests

> Examples below use a placeholder `blog` / `Post` domain. Substitute your own module.

## Unit-first split

| Service logic | Test |
|---|---|
| HTTP client / outbound `fetch` | unit — mock `global.fetch` |
| Service method that delegates to the client | unit — `new Service({}, options)`, assert on `fetch` args |
| DML: create/update/list/delete, filters, computed fields, links | `moduleIntegrationTestRunner` — **optional / manual** |

If a method mixes both, split it or test the pure part and cover the DML part with one
integration test.

## Unit — mock `global.fetch`

```ts
import ApiClient from "../api-client"

/** Build a Response stub; override ok/status for error-path tests. */
const createResponse = (body: unknown, overrides: Partial<Response> = {}) =>
  ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(""),
    ...overrides,
  } as unknown as Response)

describe("ApiClient", () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it("normalizes the base URL and authenticates GET requests", async () => {
    const fetchMock = jest.fn().mockResolvedValue(createResponse({ items: [] }))
    global.fetch = fetchMock

    const client = new ApiClient({ baseUrl: "https://api.example/", apiKey: "secret" })
    await client.listItems(25, 100)

    expect(fetchMock).toHaveBeenCalledWith("https://api.example/items?limit=25&afterId=100", {
      headers: { "Content-Type": "application/json", Authorization: "secret" },
    })
  })

  it("includes the upstream body in request errors", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      createResponse(undefined, {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: jest.fn().mockResolvedValue("invalid key"),
      }),
    )

    const client = new ApiClient({ baseUrl: "https://api.example", apiKey: "secret" })
    await expect(client.listItems()).rejects.toThrow("401 Unauthorized")
  })
})
```

- Always restore `global.fetch` in `afterEach`.
- Assert the **exact** URL, method, headers, and body — these clients encode upstream
  contract details, and an integration test won't catch a wrong query-param name.
- Chain `mockResolvedValueOnce` for multi-request methods (id list → batch resolve).
- The service test is the same technique one level up: `new BlogModuleService({}, { baseUrl,
  apiKey })` and assert the delegated `fetch` call.

## Integration — `moduleIntegrationTestRunner`

**Optional / manual.** Boots a real Postgres.

- **Location:** `src/modules/<module>/__tests__/<name>.integration.spec.ts` (the
  `.integration.spec.ts` suffix is what `TEST_TYPE=integration:modules` matches).
- **Run:** `test:integration:modules`.

```ts
import { Modules } from "@medusajs/framework/utils"
import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { BLOG_MODULE } from ".."
import BlogModuleService from "../service"
import { Post } from "../models/post"

jest.setTimeout(60 * 1000)

moduleIntegrationTestRunner<BlogModuleService>({
  moduleName: BLOG_MODULE,
  moduleModels: [Post /* , ... */],
  resolve: "./src/modules/blog",
  // injectedDependencies: { [Modules.EVENT_BUS]: new MockEventBusService() },
  // moduleOptions: { baseUrl: "http://localhost", apiKey: "test" },
  testSuite: ({ service }) => {
    describe("BlogModuleService posts", () => {
      it("enforces the unique handle index", async () => {
        await service.createPosts([{ title: "A", handle: "a" }])
        await expect(service.createPosts([{ title: "B", handle: "a" }])).rejects.toThrow()
      })
    })
  },
})
```

- The runner creates and drops a random-named DB; each `it` runs against migrated tables.
- Use the **real generated method names** — they pluralize the model key
  (`listPosts`, `createPosts`), `retrieve` is the only exception. See
  `references/troubleshooting.md`.
- Good targets: composite/partial unique indexes, soft-delete + link dismissal, computed
  fields, filter shapes. Not: the HTTP client (cover that with the fetch-mock unit test).
