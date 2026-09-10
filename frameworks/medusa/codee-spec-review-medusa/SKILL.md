---
name: codee-spec-review-medusa
description: Run an evidence-based technical compliance review of Medusa specifications after the general codee-spec-writing review. Use for Medusa backend specs and cross-stack specs with a Medusa backend boundary; validate the proposed architecture, contracts, queries, cache behavior, tests, phasing, rollout, and rollback against repository rules, applicable Medusa skills, current code, and installed framework evidence.
---

# Medusa Specification Review

Act as the final Medusa technical gate after the structural and architectural review from `codee-spec-writing`. Verify that the specification is implementable in this repository and does not leave Medusa-specific decisions for the implementer.

This skill reviews documents only. It does not authorize production-code changes.

## Source Authority

Use evidence in this order:

1. root and nearest scoped repository agent instructions
2. the repository's spec lifecycle rules
3. applicable local Medusa, storefront, admin, TypeScript, and testing skills
4. current implementation, tests, schema, configuration, and installed dependency source/types
5. official Medusa documentation or source for version-sensitive behavior not provable locally

Repository instructions override a conflicting generic skill rule. Do not preserve a checklist rule merely because an older review used it: every verdict needs a current source and evidence.

## Required Context

Before reviewing:

1. Read `codee-spec-writing` and apply its structural checklist.
2. Read `building-with-medusa` completely.
3. Load only the Medusa reference files matching the spec's components, such as API routes, querying data, workflows, modules, links, authentication, subscribers/events, scheduled jobs, or error handling.
4. Load `codee-medusa-testing` when the spec creates or changes a backend route, workflow, step, service, subscriber, job, middleware/validator, or exported utility.
5. Load the applicable storefront/admin skills when the spec crosses those boundaries.
6. Read the reviewed spec, its main spec, directly related active sub-specs, and every implementation/code path it references.
7. Verify version-sensitive claims against installed source/types first and official Medusa sources second.

If a required skill is unavailable, report the missing gate and do not approve the spec.

## Review Workflow

### 1. Confirm scope cohesion

Verify that the sub-spec contains one independently deliverable capability and that its main-spec relationships and dependencies are accurate. Treat missing phasing for a non-trivial active sub-spec as High severity.

### 2. Trace the architecture

Walk each path end to end:

- HTTP/event/job trigger
- validation, authentication, and scoping
- query or workflow entry point
- module ownership and cross-module boundaries
- persistence and external side effects
- response/event/result contract
- cache, invalidation, and observability
- tests and operational verification

Confirm that reads and mutations use the canonical mechanisms required by the current repository and Medusa skills. Do not approve architecture described only as vague service or database work.

### 3. Verify contracts against evidence

Inspect existing routes, middleware, module links, data models, generated types, and installed Medusa APIs. Check names, shapes, filters, pagination/count semantics, ordering, visibility, authorization, error behavior, and compatibility.

When the spec proposes a custom primitive, verify that a core Medusa endpoint, workflow, query mechanism, or project abstraction cannot satisfy the need. Require the spec to state why the custom surface is necessary.

### 4. Verify operational safety

Review migrations, backfills, idempotency, retries, event delivery, cache invalidation, stale-data behavior, partial failure, rollout, rollback, and degraded operation wherever applicable.

Apply repository-specific invariants exactly. For this repository, any replaceable manual Caching Module write must plan `clear({ key })` before `set`, and its cache test double must reproduce the Redis non-overwrite behavior described in root instructions.

### 5. Verify the implementation plan

For every phase and step, check that:

- the proposed code location and Medusa layer are correct
- the outcome is concrete
- verification is objective and uses the required test layer
- validation commands match current repository instructions
- completing the step and phase leaves the repository working and safe to merge
- no unstated architectural or product decision remains

Do not require a generic build when repository instructions prescribe different checks. The repository's current validation policy is authoritative.

### 6. Apply the compliance matrix

Complete [references/compliance-review.md](references/compliance-review.md). Mark each applicable rule `PASS`, `FAIL`, or `N/A`, cite the source, and give concrete evidence. `N/A` requires a reason.

### 7. Fix and re-review

When the user authorized spec edits, correct spec-level findings and repeat the relevant checks. Do not modify production code. If resolving a finding requires a product decision, return it as an Open Question instead of inventing the answer.

## Severity

- **Critical:** security or data-isolation failure, destructive data risk without recovery, hard repository-rule violation, invalid Medusa architecture, or contract design that cannot safely ship
- **High:** wrong layer/ownership, missing validation or authorization, unsupported framework claim, missing migration/compatibility/rollback, missing phasing, or a phase that leaves the repository broken
- **Medium:** incomplete failure/cache/test behavior, ambiguous query or pagination semantics, weak verification, inconsistent terminology, or avoidable custom mechanism
- **Low:** non-blocking clarity, organization, or editorial improvement

## Output Format

```md
# Medusa Specification Review: {Spec Title}

## Summary

{Scope, architecture, and overall assessment.}

## Findings

### Critical
- {Finding with source, evidence, impact, and required correction, or `None`.}

### High
- {Finding with source, evidence, impact, and required correction, or `None`.}

### Medium
- {Finding with source, evidence, impact, and required correction, or `None`.}

### Low
- {Finding with source, evidence, impact, and suggested correction, or `None`.}

## Compliance Matrix

| Rule | Source | Status | Evidence / justification |
|---|---|---|---|
| {rule} | {current authority} | PASS / FAIL / N/A | {specific evidence} |

## Verdict

`APPROVED` | `CHANGES REQUIRED`

{Required changes when approval is withheld.}
```

Return `APPROVED` only when:

- the general `codee-spec-writing` review passes
- every compliance row passes or has a justified `N/A`
- no Critical, High, or unresolved Medium finding remains
- all Open Questions are resolved
- phases, steps, tests, validation, rollout, and rollback are implementation-ready

Disclose when an independent review was not performed; do not present self-review as independent validation.
