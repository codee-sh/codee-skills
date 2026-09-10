# `@medusajs/test-utils` reference

Condensed from the Medusa docs (v2.18). The framework covers **integration tests only** —
unit tests are plain Jest.

## Project setup

`jest.config.js`:

```js
const { loadEnv } = require("@medusajs/framework/utils")
loadEnv("test", process.cwd())

module.exports = {
  transform: { "^.+\\.[jt]s$": ["@swc/jest", { jsc: { parser: { syntax: "typescript", decorators: true } } }] },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/"],
  setupFiles: ["./integration-tests/setup.js"],
}
```

`TEST_TYPE` switches `testMatch`:

| `TEST_TYPE` | `testMatch` | Script |
|---|---|---|
| `unit` | `**/src/**/__tests__/**/*.unit.spec.[jt]s` | `test:unit` (routine, CI) |
| `integration:modules` | `**/src/modules/**/__tests__/**/*.integration.spec.[jt]s` | `test:integration:modules` (manual) |
| `integration:http` | `**/integration-tests/http/**/*.spec.[jt]s` | `test:integration:http` (manual) |

All three scripts run `jest --runInBand --forceExit` with
`NODE_OPTIONS=--experimental-vm-modules`. `--runInBand` because tests share one database;
`--forceExit` because the booted app container does not always close cleanly.
`test:integration:modules` also passes `--passWithNoTests` (no module integration tests
exist yet).

`integration-tests/setup.js`:

```js
const { MetadataStorage } = require("@mikro-orm/core")
MetadataStorage.clear()
```

Required — clears MikroORM decorator metadata so entity definitions don't leak between
suites.

## `medusaIntegrationTestRunner`

```ts
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection, dbConfig }) => { /* describe/it */ },
  env: { JWT_SECRET: "supersecret" },   // extra process.env for the booted app
  inApp: true,                          // run the Medusa app in-process
})

jest.setTimeout(60 * 1000)
```

Creates a database with a random name before the file, drops it after. `testSuite`
receives:

| Key | What |
|---|---|
| `api` | HTTP client. `api.get(path, config?)`, `api.post(path, body, config?)`, `api.delete(path, config?)`. Axios-like — non-2xx throws; use `.catch((e) => e)` and read `e.response`. |
| `getContainer()` | The Medusa container. `getContainer().resolve(KEY)`. |
| `dbConnection` | Raw connection for direct setup/teardown. |
| `dbConfig` | `{ clientUrl, schema }` of the random test DB. |

Workflow test: `const { result } = await myWorkflow(getContainer()).run({ input })`; add
`throwOnError: false` to get `{ result, errors }` instead of a throw.

## `moduleIntegrationTestRunner`

```ts
import { moduleIntegrationTestRunner } from "@medusajs/test-utils"

moduleIntegrationTestRunner<BlogModuleService>({
  moduleName: BLOG_MODULE,            // registration name
  moduleModels: [Post],              // DML models (or one dummy model if none)
  resolve: "./src/modules/blog",     // path to the module directory
  testSuite: ({ service, getContainer, MikroOrmWrapper }) => { /* ... */ },
  moduleOptions: { apiKey: "123" },  // optional — passed to the module constructor
  injectedDependencies: {            // optional — mock cross-module deps
    [Modules.EVENT_BUS]: new MockEventBusService(),
  },
})

jest.setTimeout(60 * 1000)
```

`testSuite` receives `service` (typed via the generic) plus container/ORM helpers.
Random-named DB, migrated from `moduleModels`, dropped after the file.

## Upstream docs

- Overview — https://docs.medusajs.com/learn/debugging-and-testing/testing-tools
- Integration tests setup — https://docs.medusajs.com/learn/debugging-and-testing/testing-tools/integration-tests
- API route examples — https://docs.medusajs.com/learn/debugging-and-testing/testing-tools/integration-tests/api-routes
- Workflow examples — https://docs.medusajs.com/learn/debugging-and-testing/testing-tools/integration-tests/workflows
- Module tests — https://docs.medusajs.com/learn/debugging-and-testing/testing-tools/modules-tests
- Framework reference — https://docs.medusajs.com/resources/test-tools-reference
