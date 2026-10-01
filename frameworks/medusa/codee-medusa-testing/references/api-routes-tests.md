# API route tests

> Examples below use a placeholder `blog` / `Post` domain. Substitute your own route.

## One layer: the HTTP integration test

| Target | Test | Runner |
|---|---|---|
| The route: middleware, Zod validator, handler, workflow call, response shape | HTTP integration — **required, run manually** | `medusaIntegrationTestRunner` |

Nothing under `src/api/` carries a test - no `__tests__` beside a route.

- **No handler unit test.** One that calls `GET(req, res)` with a mocked container and a hand-built
  `req.validatedQuery` or `req.queryConfig` tests the mock: it passes while the middleware is
  unregistered, the query config is wrong, or `res.json` serializes something the client cannot
  read.
- **No validator unit test.** The schema's defaults, coercion and rejections are the route's
  behavior; assert them as the response the client gets - a default page size, a `400`.

Logic that is worth a test of its own and is not request handling belongs in a step, a
workflow or a module, and is tested there.

## Location and run

- **Location:** `integration-tests/http/<area>/<route>.spec.ts`.
- **Run:** `test:integration:http`, manually - it boots the app and a real Postgres.

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

      it("answers the default page when no pagination is sent", async () => {
        const response = await api.get("/admin/blog/posts", { headers })

        expect(response.data).toMatchObject({ limit: 20, offset: 0 })
      })

      it("400s on an unknown query param", async () => {
        const { response } = await api
          .get("/admin/blog/posts?bogus=1", { headers })
          .catch((e) => e)

        expect(response.status).toEqual(400)
      })
    })

    describe("POST /admin/blog/posts", () => {
      it.each(["draft", "scheduled", "published"])("accepts status %s", async (status) => {
        const response = await api.post("/admin/blog/posts", { title: "T", status }, { headers })

        expect(response.data.post.status).toEqual(status)
      })

      it("400s on an unknown status", async () => {
        const { response } = await api
          .post("/admin/blog/posts", { title: "T", status: "archived" }, { headers })
          .catch((e) => e)

        expect(response.status).toEqual(400)
      })
    })
  },
})
```

Cover the validator here: defaults and coercion as the response they produce, each accepted enum
value (`it.each`), and every rejection as a `400`.

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
