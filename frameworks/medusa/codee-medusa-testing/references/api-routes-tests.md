# API route tests

> Examples below use a placeholder `blog` / `Post` domain. Substitute your own route.

## Two layers

| Target | Test | Runner |
|---|---|---|
| Zod validator / middleware schema in isolation | unit — `schema.parse` / `.safeParse` | plain Jest |
| Full request path: validator + handler + workflow + response shape | HTTP integration — **optional / manual** | `medusaIntegrationTestRunner` |

## Unit — the validator

Export the schema from the middleware file so the test imports the real one.

```ts
import { CreatePostSchema } from "../middlewares"

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

Cover: defaults/coercion, each accepted enum value (`it.each`), and rejection of bad input.

## Integration — the route

**Optional / manual.** Boots the app + a real Postgres.

- **Location:** `integration-tests/http/<area>/<route>.spec.ts`.
- **Run:** `test:integration:http`.

```ts
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import jwt from "jsonwebtoken"
import { Modules } from "@medusajs/framework/utils"

jest.setTimeout(60 * 1000)

const headers: Record<string, string> = {}

medusaIntegrationTestRunner({
  env: { JWT_SECRET: "supersecret" },
  testSuite: ({ api, getContainer }) => {
    beforeEach(async () => {
      const container = getContainer()
      const userModule = container.resolve(Modules.USER)
      const authModule = container.resolve(Modules.AUTH)

      const user = await userModule.createUsers({ email: "admin@medusa.js" })
      const authIdentity = await authModule.createAuthIdentities({
        provider_identities: [
          { provider: "emailpass", entity_id: "admin@medusa.js", provider_metadata: { password: "secret" } },
        ],
        app_metadata: { user_id: user.id },
      })

      const token = jwt.sign(
        { actor_id: user.id, actor_type: "user", auth_identity_id: authIdentity.id },
        "supersecret",
        { expiresIn: "1d" },
      )
      headers.authorization = `Bearer ${token}`
    })

    describe("GET /admin/blog/posts", () => {
      it("returns the post list", async () => {
        const response = await api.get("/admin/blog/posts", { headers })

        expect(response.status).toEqual(200)
        expect(response.data).toHaveProperty("posts")
      })

      it("400s on an unknown query param", async () => {
        const { response } = await api
          .get("/admin/blog/posts?bogus=1", { headers })
          .catch((e) => e)

        expect(response.status).toEqual(400)
      })
    })
  },
})
```

## Notes

- `api.get(path, config?)`, `api.post(path, body, config?)`, `api.delete(path, config?)` —
  axios-like: success → `response.status` / `response.data`; non-2xx **throws**, so
  `.catch((e) => e)` and read `e.response`.
- Error body shape: `expect(response.data).toMatchObject({ type: "not_found" })`.
- Pass `env: { JWT_SECRET: "supersecret" }` and sign tokens with the same secret.
- Store-scoped routes also need a publishable API key header
  (`x-publishable-api-key`); create one through the API key module in `beforeEach`.
- If the route's `beforeEach` shows the handler never receives `validatedQuery` /
  `validatedBody`, the route-local middleware was never registered — see
  `references/troubleshooting.md`.
