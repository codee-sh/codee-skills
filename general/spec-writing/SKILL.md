---
name: spec-writing
description: Guide for creating high-quality, architecturally compliant specifications for this Medusa.js project. Use when starting a new spec or reviewing one against staff-engineer standards.
---

# Spec Writing & Review

Design and review specifications against this project's Medusa architecture, naming, and quality rules.

---

## Workflow

1. **Load Context** — Read `AGENTS.md` Task Router. Load the relevant spec from `.ai/specs/` if one exists for this topic. **Check `.ai/specs/references/` for any additional data files (field mappings, data exports, design docs) — read all files found there before proceeding.**
2. **Initialize** — Create an empty file: `.ai/specs/YYYY-MM-DD-kebab-case-title.md`
3. **Start Minimal** — Write a **Skeleton Spec** first: TLDR + 2–3 key sections. Do NOT write the full spec in one pass.
   - Before the skeleton, scan the brief for **critical unknowns** — decisions that block architecture, data model, or scope.
   - If unknowns exist, add a numbered **Open Questions** block (`Q1`, `Q2`, …) right after the TLDR.
   - **STOP after presenting the skeleton.** Do not proceed to Research or beyond until the user answers all questions. This is a hard gate.
4. **Iterate** — Apply answers to fill in the skeleton. Remove resolved questions. Repeat the gate for any new unknowns.
5. **Research** — Validate requirements against Medusa's built-in capabilities and official patterns. Check if a built-in workflow already exists before designing a custom one.
6. **Design** — Architecture, data flow, module structure, workflow steps, API contracts.
7. **Implementation Breakdown** — Break into **Phases** (stories) and **Steps** (testable tasks). Each step must result in a runnable application.
8. **Track Execution** — Maintain a live implementation tracker inside the spec. Mark items as `done`, `in_progress`, `pending`, or `blocked` as work progresses. Add newly discovered scope items immediately instead of hiding them in chat or only in the changelog.
9. **Review** — Apply the [Spec Checklist](references/spec-checklist.md).
10. **Compliance Gate** — Apply the [Compliance Review](references/compliance-review.md).
11. **Output** — Finalize the spec file.

---

## Output Formats

### 1. New Specification

Use [Specification Template](references/spec-template.md). Adapt structure as needed, but always cover:

- **Client Definition of Done (original)** — preserved client brief when the project started from a client-written scope or acceptance criteria
- **TLDR & Overview** — what and why
- **Problem Statement** — what are we solving
- **Proposed Solution** — high-level approach
- **Architecture** — module → workflow → route layers
- **Data Mapping** — external source → Medusa fields
- **Phasing** — delivery breakdown
- **Current Status** — short summary of where the implementation stands right now
- **Implementation Tracker** — live status list of concrete work items
- **Implementation Plan** — concrete steps
- **Open Questions** — unresolved decisions

### Phasing vs Execution Tracking

Keep these sections separate.

- **Phasing** describes the planned delivery slices such as `Phase 1`, `Phase 2`, and `Phase 3`. This is the stable scope structure.
- **Current Status** states the present state of the work in a few lines, for example `Phase 1 in progress`, `SQL source live`, or `Batch migrate pending`.
- **Implementation Tracker** is the operational checklist that changes during delivery. It must be updated whenever implementation status changes or new scope is discovered.

Recommended status values:

- `done` - implemented and reflected in the current codebase
- `in_progress` - actively being worked on
- `pending` - planned but not started
- `blocked` - cannot proceed until an external dependency or decision is resolved

Minimum tracker rules:

- Use one flat list of concrete items.
- Update the status of existing items instead of duplicating them.
- Add newly discovered work items as soon as they are identified.
- If an item changes scope, update the item text so the tracker remains accurate.
- Keep the tracker aligned with `Open Questions` and `Changelog`.
- Do not rely on the changelog alone to communicate current status.

### Preserving the Original Client Brief

When a feature starts from client-written scope, acceptance criteria, or phase text, preserve that material in a dedicated section:

- `## Client Definition of Done (original)`

Use it as a historical source block, not as the live implementation plan.

Rules:

- Keep the original client wording intact as much as possible.
- Add a short note that the content is preserved from the original client brief and should not be rewritten casually.
- Do not use this section as the operational tracker.
- If the client brief contains its own phase labels such as `Phase 1` or `Phase 2`, keep them there, but treat them as client language rather than the active implementation status model.
- Reflect current understanding separately in `TLDR`, `Phasing`, `Current Status`, `Implementation Tracker`, and `Open Questions`.
- When the original brief becomes inconsistent with the implemented solution, keep the original text and clarify the current implementation in the live sections instead of silently rewriting the source brief.

### 2. Architectural Review

When reviewing an existing spec:

```
# Architectural Review: {Spec Title}

## Summary
{1–3 sentences: what the spec proposes and overall health}

## Findings

### Critical
{Medusa layer violations, workflow bypasses, wrong HTTP methods, module name with dashes}

### High
{Missing idempotency, no error handling strategy, missing data mapping gaps}

### Medium
{Missing failure scenarios, ambiguous field names, missing pagination strategy}

### Low
{Stylistic nits, minor inconsistencies}

## Checklist
See references/spec-checklist.md
```

---

## Review Heuristics

1. **Layer Order** — Does the spec follow Module → Workflow → Route? No layer may be bypassed.
2. **Idempotency** — Is there an `external_id` or equivalent key to prevent duplicate imports on re-run?
3. **Transform vs. Step** — Is data mapping done in a `transform()` block (correct) or in a workflow step (wrong)?
4. **Built-in First** — Does the spec use `createProductsWorkflow` / `updateProductsWorkflow` instead of reinventing them?
5. **Open Questions Gate** — Are all architectural unknowns resolved before design proceeds?
6. **Status Accuracy** — Do `Current Status` and `Implementation Tracker` match the actual implementation state?
7. **Tracker Freshness** — Were newly discovered work items added to the tracker instead of being left only in chat or changelog notes?

---

## Quick Rule Reference (Medusa)

- `camelCase` module names — never dashes (`structPim` ✓, `struct-pim` ✗)
- `GET`, `POST`, `DELETE` only — never `PUT` or `PATCH`
- All mutations through a workflow — never call module service from a route
- Prices stored as-is — never multiply or divide by 100
- Static imports only — no `await import()` inside route handlers
- `transform()` for data manipulation inside workflows — not plain steps
- Use `external_id` for idempotency on all migration/sync operations
- Zod validation for all API route inputs

---

## Reference Materials

- [Spec Checklist](references/spec-checklist.md)
- [Compliance Review — dispatcher](references/compliance-review.md) — load first, then load the stack-specific file below
- [Compliance Review — Medusa.js](references/compliance-review-medusa.md) — for Medusa.js projects
- [Compliance Review — Payload CMS](references/compliance-review-payload.md) — for Payload CMS / Next.js projects
- [Specification Template](references/spec-template.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [Medusa Magento Example](https://docs.medusajs.com/resources/integrations/guides/magento)
