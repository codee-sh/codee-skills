---
name: codee-spec-writing
description: Write or review evidence-based software specifications using a concise main-spec and sub-spec system, with skeleton-first discovery, a critical Open Questions gate, repository research, architecture and failure analysis, and phased testable implementation plans. Use for non-trivial feature specs, architecture decisions, spec restructuring, lifecycle updates, and general spec review; load the repository's stack-specific review skill separately for technical compliance.
---

# Specification Writing and Review

Create decision-complete specifications that another engineer or agent can implement without inventing architecture along the way. Keep documents concise by separating stable module context from focused delivery slices.

The repository's instructions are the architectural law. This skill defines the process and document model; it does not replace stack-specific skills or authoritative project documentation.

## Operating Modes

- **Interactive (default):** unresolved questions that would materially change scope, contracts, data, security, or architecture are a hard gate. Write the skeleton, present the questions, and pause.
- **Autonomous:** use only when the user or an orchestrating workflow explicitly requests unattended execution. Resolve unknowns with the smallest reversible choice, document each assumption and its rationale, and mark any security, compatibility, or high-blast-radius assumption as `NEEDS HUMAN CONFIRMATION`.

Do not treat ordinary permission to write a spec as permission to enter autonomous mode.

## Document System

### Main spec

One stable source of truth per module or initiative. It owns boundaries, shared architecture, cross-cutting contracts, references, active sub-specs, and their dependency order. It does not duplicate execution detail from sub-specs.

### Sub-spec

One independently deliverable capability or coherent implementation slice. It owns detailed behavior, affected code, contracts, failure scenarios, acceptance criteria, phases, steps, and active execution state.

If two capabilities could be designed, implemented, shipped, or rolled back independently, raise splitting them into separate sub-specs as a critical scope question.

### Supporting locations

- `notes.md` contains temporary observations, hypotheses, and unresolved exploration. It is not a source of truth.
- module-local `ended/` contains closed sub-specs.
- global `.ai/specs/ended/` contains fully closed module folders.
- `.ai/specs/references/` contains authoritative supporting data when the repository uses it.

Use the repository's own spec location, configuration, and lifecycle rules when they differ.

## Evidence Rules

Specifications must be grounded in inspectable evidence. Do not turn memory or plausible framework behavior into a requirement.

Use sources in this order:

1. repository instructions and local overrides
2. related main specs, active sub-specs, ended specs when historically relevant, notes, and spec reference data
3. current implementation, tests, schemas, migrations, configuration, and installed dependency source/types
4. repository documentation and applicable local skills
5. authoritative external documentation, standards, source repositories, or primary research when local evidence is insufficient or likely stale
6. market-leading implementations when comparing product or architecture choices adds material value

Stop researching once the affected modules, existing primitives, public contracts, and material unknowns are known. Cite file paths or external links close to the decisions they support. Clearly label inference and assumptions.

Research should answer:

- What exists today, including reusable primitives and current constraints?
- What changes, and what deliberately remains unchanged?
- Which public or cross-module contracts are affected?
- Is a standard or market-proven mechanism preferable to a new local abstraction?
- Which complexity seen elsewhere is unnecessary for this scope?

## Workflow

### 1. Preflight

- Read the root and nearest scoped agent instructions.
- Read the repository's spec rules and inspect the spec tree.
- Read every file in the repository's authoritative spec-reference directory when required by repository instructions.
- Load all applicable domain and stack skills before making architecture decisions.
- Check the implementation and related tests before proposing changes.
- Preserve unrelated working-tree changes.

### 2. Classify the deliverable

- Update or create the **main spec** for module boundaries, shared architecture, or coordination between several delivery slices.
- Update or create a **sub-spec** for one focused, implementable capability.
- Use `notes.md` while direction is exploratory.
- Skip a maintained spec when the repository rules classify the change as trivial.

### 3. Write a minimal skeleton

Start with TLDR and two or three sections sufficient to expose the intended scope. Do not write the full design in one pass.

Before expanding it, identify critical unknowns. Always test scope cohesion: could any bundled capability function and ship without the others?

If critical unknowns exist, place a numbered `Open Questions` section immediately after TLDR. Keep each question short and decision-oriented. In interactive mode, pause after the skeleton until all are answered.

Do not use Open Questions for facts discoverable from the repository or authoritative documentation; research those directly.

### 4. Resolve decisions

Apply the answers, record material decisions, and remove `Open Questions` before approval. If a new critical unknown appears, reopen the gate only for that decision.

An approved spec must not contain unresolved implementation-changing questions.

### 5. Research the current state and alternatives

Inspect the concrete code paths and contracts named by the skeleton. Compare alternatives only where they affect architecture, operational risk, compatibility, or meaningful product behavior. Record why the chosen approach fits the repository better than rejected alternatives.

### 6. Complete the design

Describe only feature-specific details. Cover applicable concerns:

- components, ownership, and boundaries
- data flow and ordering
- data model, migration, compatibility, and sensitive-data handling
- API, event, job, configuration, or UI contracts
- authorization and scoping
- failure behavior, retries, idempotency, observability, and degraded operation
- performance, query shape, cache ownership, keys, TTL, and invalidation
- rollout, rollback, cleanup, and operational verification

Do not re-document standard framework boilerplate. Name the canonical repository mechanism that will be reused.

### 7. Break implementation into phases and steps

Every active, non-trivial sub-spec must end with a phased implementation plan. A main spec keeps only cross-sub-spec dependency order.

#### Phases

- A phase is a coherent delivery story with a concrete outcome.
- Prefer vertical slices over layer-only batches when practical.
- A phase may depend on an earlier phase, but completing it must leave the repository working, reviewable, and safe to merge.
- State the phase goal, prerequisites, and exit gate.
- Separate migrations, compatibility bridges, or rollout stages when they carry distinct operational risk.

#### Steps

- Number steps as `P1.1`, `P1.2`, `P2.1`, and so on.
- Each step must name the outcome and concrete code areas or artifacts involved.
- Each step must state how its behavior is verified.
- Include tests at the layer required by repository testing guidance; do not defer all testing to a final generic step.
- Include repository-prescribed lint, typecheck, format, migration, or runtime verification at the relevant checkpoint.
- A step that cannot be tested or objectively inspected is not implementation-ready.
- Do not create steps that require the implementer to choose a new architecture, contract, or product behavior.

Use the Short Tracker as a live pointer to the current phase and step, not as a duplicate of the plan.

### 8. Review

Run the structural checklist in [references/spec-checklist.md](references/spec-checklist.md), using [references/architectural-review-template.md](references/architectural-review-template.md) when producing a review deliverable, then run the stack-specific review required by repository instructions.

Review findings use these severities:

- **Critical:** security/data isolation issue, hard repository-rule violation, or architecture that cannot safely ship
- **High:** missing phasing, rollback, compatibility plan, major failure behavior, or incorrect component ownership
- **Medium:** incomplete acceptance evidence, inconsistent contract, unclear step, terminology drift, or avoidable spec bloat
- **Low:** readability, diagrams, or non-blocking editorial improvements

When authorized and available, use a fresh-context reviewer for scope cohesion and hidden assumptions. Otherwise perform the review directly and do not claim independent review.

Approval requires no Critical, High, or unresolved Medium findings. Low findings may remain only when explicitly non-blocking.

### 9. Finalize and maintain

- Update the main spec's active/ended references and dependency order.
- Keep Current Status and Short Tracker aligned with actual implementation state.
- Add a short dated changelog entry for material decision or lifecycle changes.
- Close and move specs only according to repository lifecycle rules.
- Do not edit production code while the task is specifically spec writing or review.

## Required Formats

Use [references/main-spec-template.md](references/main-spec-template.md) for main specs and [references/sub-spec-template.md](references/sub-spec-template.md) for sub-specs. Adapt conditional sections to the feature, but address every applicable concern.

### Main spec minimum

- title and metadata
- TLDR
- Scope
- Architecture
- Evidence and References
- Active Sub-specs
- Ended Sub-specs
- Implementation Order
- Risks and Cross-cutting Concerns
- Current Status

### Sub-spec minimum

- title and metadata
- TLDR
- Problem
- Current State and Evidence
- Target Behavior
- Proposed Solution and alternatives
- applicable contracts and architecture details
- Edge Cases and Failure Scenarios
- Risks, Rollout, and Rollback
- Dependencies
- Acceptance Criteria
- Phasing
- Implementation Plan
- Short Tracker

## Tracker and Status Rules

Allowed statuses are `pending`, `in_progress`, `blocked`, `done`, and `dropped`.

- `done` means implemented and verified in the codebase, not merely specified.
- `in_progress` identifies the one currently active item when work is underway.
- `blocked` states the concrete unresolved dependency.
- Keep only current phase/step pointers and material remaining work in Short Tracker.
- Do not copy every implementation step into Short Tracker.
- Do not use changelog entries as execution status.

## Hard Rules

- Repository instructions override this skill.
- One independently deliverable capability per sub-spec.
- Skeleton first; critical Open Questions are a hard gate in interactive mode.
- Every implementation-changing statement must be evidenced, explicitly decided, or labeled as an assumption.
- Specs describe the unique architectural diff, not generic framework behavior.
- Every active non-trivial sub-spec has phases, numbered testable steps, and phase exit gates.
- Every implementation step leaves the repository working and does not require an unstated design decision.
- Public contract changes include compatibility and rollout/rollback treatment.
- State changes and external dependencies include failure behavior and reversibility.
- Reviews rank findings by severity and justify the verdict.
- Spec writing and review do not authorize production-code changes.
