# Sub-spec Template

Use this template for one independently deliverable capability inside a module folder. Conditional contract sections may be omitted only when genuinely inapplicable.

```md
# {Focused Change Title}

**Date:** YYYY-MM-DD
**Status:** review | active
**Area:** backend | frontend | integration | device | tooling | cross-cutting
**Related:** [main-spec](./YYYY-MM-DD-main-spec.md)

> Folder: same module folder as the main spec
> Filename: `YYYY-MM-DD-sub-{focused-topic}.md`

## TLDR

{What changes, why it matters, and the chosen direction.}

## Open Questions

> Include only while critical decisions are unresolved. Remove before approval.

- Q1. {Short decision-oriented question}

## Problem

{Specific current limitation and evidence that it exists.}

## Current State and Evidence

- `{repo path}` - {current behavior or constraint}
- [{authoritative external source}]({url}) - {fact or alternative it supports}
- **Inference:** {conclusion derived from evidence, if any}

## Target Behavior

- {observable rule}
- {observable rule}

## Proposed Solution

{Feature-specific architecture, ownership, boundaries, and data flow. Name existing repository primitives that are reused.}

### Alternatives Considered

- **{Alternative}:** {why it lost for this repository and scope}

## Data Model and Persistence

{Entities, fields, relations, migrations, compatibility, retention, and sensitive-data handling, or state why no persistence changes are required.}

## Contracts

{API/event/job/configuration contracts, request/response or payload shapes, validation, authorization, scoping, ordering, pagination, and compatibility.}

## UI/UX

{Only feature-specific flows, states, accessibility, and user-visible failure behavior. Omit when inapplicable.}

## Performance and Cache

{Expected scale, query shape, pagination boundary, cache ownership, keys, TTL, invalidation, and stampede/staleness behavior. Omit when immaterial.}

## Edge Cases and Failure Scenarios

| Scenario | Expected behavior | Verification |
|---|---|---|
| {failure or edge case} | {system/user-visible result} | {test or operational evidence} |

## Risks, Rollout, and Rollback

| Risk / failure scenario | Severity | Affected area | Mitigation | Residual risk |
|---|---|---|---|---|
| {concrete scenario} | low / medium / high / critical | {area} | {prevention/recovery} | {what remains} |

**Rollout:** {ordering, flags, migration/backfill, monitoring, or why direct rollout is safe}

**Rollback:** {how code/data/contracts are restored or safely disabled}

## Dependencies

- {prerequisite, existing primitive, or preceding sub-spec}

## Acceptance Criteria

- [ ] {observable, testable outcome}
- [ ] {failure/compatibility/performance outcome where applicable}

## Phasing

### Phase 1 - {Coherent delivery story}

**Goal:** {working outcome}

**Prerequisites:** {dependencies or `None`}

**Exit gate:** {tests, validation, and observable state required before Phase 2}

### Phase 2 - {Coherent delivery story}

**Goal:** {working outcome}

**Prerequisites:** {Phase 1 or other dependency}

**Exit gate:** {tests, validation, and observable state required for completion}

## Implementation Plan

### Phase 1

1. **P1.1 - {Testable step title}**
   - **Outcome:** {concrete behavior/artifact}
   - **Areas:** `{paths, modules, or contracts}`
   - **Changes:** {specific work without unresolved design choices}
   - **Verification:** {test layer, command, assertion, or inspection}

2. **P1.2 - {Testable step title}**
   - **Outcome:** {concrete behavior/artifact}
   - **Areas:** `{paths, modules, or contracts}`
   - **Changes:** {specific work}
   - **Verification:** {test and required repository check}

### Phase 2

1. **P2.1 - {Testable step title}**
   - **Outcome:** {concrete behavior/artifact}
   - **Areas:** `{paths, modules, or contracts}`
   - **Changes:** {specific work}
   - **Verification:** {test and required repository check}

## Short Tracker

- `pending` - Phase 1 / P1.1: {current next action}
- `pending` - Phase 1 exit gate
```

Remove Open Questions before approval. Use as many phases and steps as the capability needs; do not preserve placeholder phases or inapplicable sections.
