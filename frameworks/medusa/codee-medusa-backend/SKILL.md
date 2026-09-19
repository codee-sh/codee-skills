---
name: codee-medusa-backend
description: Load automatically when planning, researching, or implementing ANY Medusa backend features (custom modules, API routes, workflows, data models, module links, business logic). REQUIRED for all Medusa backend work in ALL modes (planning, implementation, exploration). Contains architectural patterns, best practices, and critical rules that MCP servers don't provide.
---

# Medusa Backend Development

Comprehensive backend development guide for Medusa applications. Contains patterns across 6 categories covering architecture, type safety, business logic placement, and common pitfalls.

## When to Apply

**Load this skill for ANY backend development task, including:**
- Creating or modifying custom modules and data models
- Implementing workflows for mutations
- Building API routes (store or admin)
- Defining module links between entities
- Writing business logic or validation
- Querying data across modules
- Implementing authentication/authorization

## Which Skill Owns What

This skill covers how Medusa works and what the framework dictates. It does not carry the project's
own conventions, its test rules, or its frontend guidance - load the skill that owns them:

| Subject | Skill |
|---|---|
| Architecture, modules, API routes, querying, links, subscribers, jobs | **this skill** |
| File layout, file and symbol naming, workflow/step JSDoc | `codee-medusa-backend-conventions` |
| Which test to write, at which layer, and where it lives | `codee-medusa-testing` |
| One-off and operational scripts | `codee-medusa-scripts` |
| Admin UI - widgets, pages, tables | `codee-medusa-admin-dashboard` |
| Admin forms | `codee-medusa-admin-dashboard-forms` |
| Calling backend routes from a storefront (SDK, data fetching) | `codee-medusa-storefront-sdk` |
| Commerce surfaces - cart, checkout, PDP, PLP, SEO | `codee-medusa-storefront-ux` |
| General TypeScript conventions | `codee-ts-code-conventions` |

## CRITICAL: Load Reference Files When Needed

**The quick reference below is NOT sufficient for implementation.** You MUST load relevant reference files before writing code for that component.

**Load these references based on what you're implementing:**

- **Creating a module?** → MUST load `references/custom-modules.md` first
- **Creating workflows?** → MUST load `references/workflows.md` first
- **Creating API routes?** → MUST load `references/api-routes.md` first
- **Creating module links?** → MUST load `references/module-links.md` first
- **Querying data?** → MUST load `references/querying-data.md` first
- **Adding authentication?** → MUST load `references/authentication.md` first

**Minimum requirement:** Load at least 1-2 reference files relevant to your specific task before implementing.

## Critical Architecture Pattern

**ALWAYS follow this flow - never bypass layers:**

```
Module (data models + CRUD operations)
  ↓ used by
Workflow (business logic + mutations with rollback)
  ↓ executed by
API Route (HTTP interface, validation middleware)
  ↓ called by
Frontend (admin dashboard/storefront via SDK)
```

**Key conventions:**
- Only GET, POST, DELETE methods (never PUT/PATCH)
- Workflows are required for ALL mutations
- Business logic belongs in workflow steps, NOT routes
- Query with `query.graph()` for cross-module data retrieval
- Query with `query.index()` (Index Module) for filtering across separate modules with links
- Module links maintain isolation between modules

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Architecture Violations | CRITICAL | `arch-` |
| 2 | Type Safety | CRITICAL | `type-` |
| 3 | Business Logic Placement | HIGH | `logic-` |
| 4 | Import & Code Organization | HIGH | `import-` |
| 5 | Data Access Patterns | MEDIUM (includes CRITICAL price rule) | `data-` |
| 6 | File Organization | MEDIUM | `file-` |

## Quick Reference

### 1. Architecture Violations (CRITICAL)

- `arch-workflow-required` - Use workflows for ALL mutations, never call module services from routes
- `arch-layer-bypass` - Never bypass layers (route → service without workflow)
- `arch-http-methods` - Use only GET, POST, DELETE (never PUT/PATCH)
- `arch-module-isolation` - Use module links, not direct cross-module service calls
- `arch-query-config-fields` - Don't set explicit `fields` when using `req.queryConfig`

### 2. Type Safety (CRITICAL)

- `type-request-schema` - Pass Zod inferred type to `MedusaRequest<T>` when using `req.validatedBody`
- `type-authenticated-request` - Use `AuthenticatedMedusaRequest` for protected routes (not `MedusaRequest`)
- `type-export-schema` - Export both Zod schema AND inferred type from middlewares
- `type-linkable-auto` - Never add `.linkable()` to data models (automatically added)
- `type-module-name-camelcase` - Module names MUST be camelCase, never use dashes (causes runtime errors)

### 3. Business Logic Placement (HIGH)

- `logic-workflow-validation` - Put business validation in workflow steps, not API routes
- `logic-ownership-checks` - Validate ownership/permissions in workflows, not routes
- `logic-module-service` - Keep modules simple (CRUD only), put logic in workflows

### 4. Import & Code Organization (HIGH)

- `import-top-level` - Import workflows/modules at file top, never use `await import()` in route body
- `import-static-only` - Use static imports for all dependencies
- `import-no-dynamic-routes` - Dynamic imports add overhead and break type checking

### 5. Data Access Patterns (MEDIUM)

- `data-price-format` - **CRITICAL**: Prices are stored as-is in Medusa (49.99 stored as 49.99, NOT in cents). Never multiply by 100 when saving or divide by 100 when displaying
- `data-query-method` - Use `query.graph()` for retrieving data; use `query.index()` (Index Module) for filtering across linked modules
- `data-query-graph` - Use `query.graph()` for cross-module queries with dot notation (without cross-module filtering)
- `data-query-index` - Use `query.index()` when filtering by properties of linked data models in separate modules
- `data-list-and-count` - Use `listAndCount` for single-module paginated queries
- `data-linked-filtering` - `query.graph()` can't filter by linked module fields - use `query.index()` or query from that entity directly
- `data-no-js-filter` - Don't use JavaScript `.filter()` on linked data - use database filters (`query.index()` or query the entity)
- `data-same-module-ok` - Can filter by same-module relations with `query.graph()` (e.g., product.variants)
- `data-auth-middleware` - Trust `authenticate` middleware, don't manually check `req.auth_context`

### 6. File Organization (MEDIUM)

- `file-links-directory` - Define module links in `src/links/[name].ts` - Medusa scans that directory
- `file-api-route-path` - The directory path under `src/api/` is the URL, and the handler file is
  always `route.ts`

Everything else about where a backend file goes and what it is called - the workflow directory
layout, one `createStep` per file, the file name matching the exported symbol, the workflow id
matching the file name, how `validators.ts` and `middlewares.ts` sit beside a route - is a project
convention, not a framework rule. `codee-medusa-backend-conventions` owns it. Do not restate it
here; the two would drift.

## Workflow Composition Rules

**The workflow function has critical constraints:**

```typescript
// ✅ CORRECT
const myWorkflow = createWorkflow(
  "name",
  function (input) { // Regular function, not async, not arrow
    const result = myStep(input) // No await
    return new WorkflowResponse(result)
  }
)

// ❌ WRONG
const myWorkflow = createWorkflow(
  "name",
  async (input) => { // ❌ No async, no arrow functions
    const result = await myStep(input) // ❌ No await
    if (input.condition) { /* ... */ } // ❌ No conditionals
    return new WorkflowResponse(result)
  }
)
```

**Constraints:**
- No async/await (runs at load time)
- No arrow functions (use `function`)
- No conditionals/ternaries (use `when()`)
- No variable manipulation (use `transform()`)
- No date creation (use `transform()`)
- Multiple step calls need `.config({ name: "unique-name" })` to avoid conflicts

## Common Mistakes Checklist

Before implementing, verify you're NOT doing these:

**Architecture:**
- [ ] Calling module services directly from API routes
- [ ] Using PUT or PATCH methods
- [ ] Bypassing workflows for mutations
- [ ] Setting `fields` explicitly with `req.queryConfig`
- [ ] Skipping migrations after creating module links

**Type Safety:**
- [ ] Forgetting `MedusaRequest<SchemaType>` type argument
- [ ] Using `MedusaRequest` instead of `AuthenticatedMedusaRequest` for protected routes
- [ ] Not exporting Zod inferred type from middlewares
- [ ] Adding `.linkable()` to data models
- [ ] Using dashes in module names (must be camelCase)

**Business Logic:**
- [ ] Validating business rules in API routes
- [ ] Checking ownership in routes instead of workflows
- [ ] Manually checking `req.auth_context?.actor_id` when middleware already applied

**Imports:**
- [ ] Using `await import()` in route handler bodies
- [ ] Dynamic imports for workflows or modules

**Data Access:**
- [ ] **CRITICAL**: Multiplying prices by 100 when saving or dividing by 100 when displaying (prices are stored as-is: $49.99 = 49.99)
- [ ] Filtering by linked module fields with `query.graph()` (use `query.index()` or query from other side instead)
- [ ] Using JavaScript `.filter()` on linked data (use `query.index()` or query the linked entity directly)
- [ ] Not using `query.graph()` for cross-module data retrieval
- [ ] Using `query.graph()` when you need to filter across separate modules (use `query.index()` instead)

## Validating Implementation

**CRITICAL: Always run the build command after completing implementation to catch type errors and runtime issues.**

### When to Validate
- After implementing any new feature
- After making changes to modules, workflows, or API routes
- Before marking tasks as complete
- Proactively, without waiting for the user to ask

### How to Run Build

Detect the package manager and run the appropriate command:

```bash
npm run build      # or pnpm build / yarn build
```

### Handling Build Errors

If the build fails:
1. Read the error messages carefully
2. Fix type errors, import issues, and syntax errors
3. Run the build again to verify the fix
4. Do NOT mark implementation as complete until build succeeds

**Common build errors:**
- Missing imports or exports
- Type mismatches (e.g., missing `MedusaRequest<T>` type argument)
- Incorrect workflow composition (async functions, conditionals)

## Tests

Every step, workflow, module service, API route and exported util carries a test. This skill does
not decide which one: `codee-medusa-testing` names the layer, the runner, the file location and the
mock harness for the change at hand. Load it before writing the code, not after.

## How to Use

**For detailed patterns and examples, load reference files:**

```
references/custom-modules.md    - Creating modules with data models
references/workflows.md          - Workflow creation and step patterns
references/api-routes.md         - API route structure and validation
references/module-links.md       - Linking entities across modules
references/querying-data.md      - Query patterns and filtering rules
references/authentication.md     - Protecting routes and accessing users
references/error-handling.md     - MedusaError types and patterns
references/scheduled-jobs.md     - Cron jobs and periodic tasks
references/subscribers-and-events.md - Event handling
references/data-models.md        - Data model definitions and properties
references/workflow-hooks.md     - Extending core workflows through hooks
references/frontend-integration.md - Reaching the backend from a frontend
references/troubleshooting.md    - Common errors and solutions
```

Each reference file contains:
- Step-by-step implementation checklists
- Correct vs incorrect code examples
- TypeScript patterns and type safety
- Common pitfalls and solutions

## When to Use This Skill vs MedusaDocs MCP Server

**⚠️ CRITICAL: This skill should be consulted FIRST for planning and implementation.**

**Use this skill for (PRIMARY SOURCE):**
- **Planning** - Understanding how to structure Medusa backend features
- **Architecture** - Module → Workflow → API Route patterns
- **Best practices** - Correct vs incorrect code patterns
- **Critical rules** - What NOT to do (common mistakes and anti-patterns)
- **Implementation patterns** - Step-by-step guides with checklists

**Use MedusaDocs MCP server for (SECONDARY SOURCE):**
- Specific method signatures after you know which method to use
- Built-in module configuration options
- Official type definitions
- Framework-level configuration details

**Why skills come first:**
- Skills contain opinionated guidance and anti-patterns MCP doesn't have
- Skills show architectural patterns needed for planning
- MCP is reference material; skills are prescriptive guidance

## Integration with Frontend Applications

**⚠️ CRITICAL: Frontend applications MUST use the Medusa JS SDK for ALL API requests**

When building features that span backend and frontend:

**For Admin Dashboard:**
1. **Backend (this skill):** Module → Workflow → API Route
2. **Frontend:** Load `codee-medusa-admin-dashboard` skill
3. **Connection:**
   - Built-in endpoints: Use existing SDK methods (`sdk.admin.product.list()`)
   - Custom API routes: Use `sdk.client.fetch("/admin/my-route")`
   - **NEVER use regular fetch()** - missing auth headers will cause errors

**For Storefronts:**
1. **Backend (this skill):** Module → Workflow → API Route
2. **Frontend:** Load `codee-medusa-storefront-sdk` skill
3. **Connection:**
   - Built-in endpoints: Use existing SDK methods (`sdk.store.product.list()`)
   - Custom API routes: Use `sdk.client.fetch("/store/my-route")`
   - **NEVER use regular fetch()** - missing publishable API key will cause errors

**Why the SDK is required:**
- Store routes need `x-publishable-api-key` header
- Admin routes need `Authorization` and session headers
- SDK handles all required headers automatically
- Regular fetch() without headers → authentication/authorization errors

See respective frontend skills for complete integration patterns.
