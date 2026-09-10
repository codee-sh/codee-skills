# Medusa Specification Compliance Review

Use this matrix as a routed checklist, not as a substitute for reading current repository and skill instructions. Apply every relevant sub-rule from the cited source. Add feature-specific rows when the spec touches behavior not represented here.

| Rule group | What must be verified | Primary source | Status | Evidence / justification |
|---|---|---|---|---|
| Repository compliance | The spec follows root/scoped instructions, spec lifecycle rules, naming, file placement, and the current validation policy. | Repository `AGENTS.md` files and `.ai/specs/AGENTS.md` | PASS / FAIL / N/A | |
| Evidence and framework version | Medusa behavior, endpoint availability, types, and limitations are proven from installed source/types or current official sources; assumptions are labeled. | Installed dependencies; official Medusa source/docs | PASS / FAIL / N/A | |
| Canonical mechanism reuse | Existing Medusa core endpoints/workflows and project primitives are preferred; every custom mechanism has a concrete gap and rationale. | `building-with-medusa`; current repository code | PASS / FAIL / N/A | |
| Layering and ownership | Module, workflow, route, event/job, and frontend responsibilities follow current project architecture; business logic is not placed in transport code. | `building-with-medusa` and routed references | PASS / FAIL / N/A | |
| Module isolation | Cross-module relations and operations use the current approved link/query/workflow mechanisms without forbidden coupling. | Medusa module-link/query guidance; repository code | PASS / FAIL / N/A | |
| HTTP method and route contract | Route method, path, request/response types, status/error behavior, fields, pagination, ordering, and compatibility are explicit and permitted. | API-route guidance; existing routes/types | PASS / FAIL / N/A | |
| Input validation | Every applicable path/query/body input has the required schema, inferred request type, limits, normalization, and rejection behavior. | API-route guidance; repository conventions | PASS / FAIL / N/A | |
| Authentication and authorization | Protected/public boundary, middleware, actor scope, sales-channel/tenant visibility, ownership, and sensitive inputs are explicit and enforced at the correct layer. | Authentication guidance; repository code | PASS / FAIL / N/A | |
| Mutation workflow and compensation | Every mutation uses the required workflow boundary; steps own business rules and side effects have compensation/rollback where required. | Workflow guidance; repository conventions | PASS / FAIL / N/A | |
| Workflow composition | Proposed workflow code can follow current Medusa composition constraints, including transforms, conditions, step identity, and static imports. | Workflow guidance | PASS / FAIL / N/A | |
| Read/query strategy | Query direction, filters, joins/links, count, pagination boundary, selected fields, and database-vs-JavaScript work use the correct Medusa mechanism. | Querying-data guidance; data model/link evidence | PASS / FAIL / N/A | |
| Data model and migrations | Ownership, names, fields, relations, indexes, migration generation responsibility, backfill, compatibility, and cleanup are defined. | Module/model guidance; root instructions; repository schema | PASS / FAIL / N/A | |
| Money and numeric semantics | Price and amount units match Medusa and project conventions without incorrect cent conversion; rounding and currency behavior are explicit when relevant. | Current Medusa/project money conventions | PASS / FAIL / N/A | |
| Events, jobs, and idempotency | Delivery semantics, stable identifiers, retries, duplicates, ordering, failure recovery, and observability are defined where applicable. | Subscriber/event/job guidance; repository patterns | PASS / FAIL / N/A | |
| Cache correctness | Cache ownership, key inputs, normalization, TTL, empty results, tags, invalidation events, stale-data behavior, and stampede risk are addressed. Replaceable manual writes use repository-required clear-before-set semantics and accurate mocks. | Root `AGENTS.md`; query/cache implementation evidence | PASS / FAIL / N/A | |
| Performance and scale | Expected cardinality, query count, hydration order, over-fetching, pagination-before-hydration, indexes, and bounded inputs are addressed where material. | Spec requirements; repository/data evidence | PASS / FAIL / N/A | |
| External dependencies | Timeouts, retries, circuit/degraded behavior, partial failure, secrets, and observability are defined for every external system. | Repository integration patterns; official provider docs | PASS / FAIL / N/A | |
| Storefront/admin boundary | Frontend calls use the required SDK/client, query state and cache ownership are clear, and user-visible states/copy/accessibility follow applicable skills. | Storefront/admin skills and repository code | PASS / FAIL / N/A | |
| Test obligations | Each changed backend layer has the exact test type, file location/pattern, harness, success cases, and failure/rollback/cache cases required by testing guidance. | `codee-medusa-testing`; existing tests | PASS / FAIL / N/A | |
| Phases and steps | Every non-trivial active sub-spec has coherent phases, numbered testable steps, phase exit gates, and no step leaves the repository broken or requires a new design decision. | `codee-spec-writing` | PASS / FAIL / N/A | |
| Validation checkpoints | Planned commands and runtime checks match current repository instructions and appear at the steps/phase gates where they provide evidence. | Root/scoped repository instructions | PASS / FAIL / N/A | |
| Failure, rollout, and rollback | Edge cases and user-visible failures are specified; rollout order, migrations/backfills, monitoring, safe disablement, and data/contract rollback are credible. | `codee-spec-writing`; applicable Medusa guidance | PASS / FAIL / N/A | |
| Open Questions | No unresolved question can change implementation, architecture, security, compatibility, or scope. | `codee-spec-writing` | PASS / FAIL / N/A | |

## Verdict Rules

- **APPROVED:** every applicable row passes, every `N/A` is justified, the general spec review passes, and no Critical, High, or unresolved Medium finding remains.
- **CHANGES REQUIRED:** any row fails, evidence is insufficient, a required source/skill was unavailable, or an implementation-changing Open Question remains.

Do not downgrade a hard repository or Medusa architecture violation because the proposed implementation appears convenient.
