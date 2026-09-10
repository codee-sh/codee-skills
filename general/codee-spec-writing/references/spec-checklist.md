# Specification Review Checklist

Apply this checklist before finalizing any document written with `codee-spec-writing`. Record failures as severity-ranked findings, fix them, and then run the repository's stack-specific review.

## Evidence and Discovery

- [ ] Root and scoped repository instructions were read.
- [ ] The existing implementation and related tests were inspected.
- [ ] Related main specs, active sub-specs, relevant ended specs, notes, and authoritative spec-reference data were checked.
- [ ] Applicable domain and stack skills were loaded.
- [ ] External facts that may be stale or are not locally provable use authoritative sources.
- [ ] Each implementation-changing statement is evidenced, explicitly decided, or clearly labeled as an assumption/inference.
- [ ] Research stopped at decision sufficiency rather than becoming a generic survey.

## Scope and Structure

- [ ] Correct document type was chosen: main spec, sub-spec, or notes.
- [ ] The document is in the correct module folder and follows repository naming/lifecycle rules.
- [ ] The sub-spec contains one independently deliverable capability.
- [ ] Bundled capabilities that can ship independently were split or explicitly resolved through the Open Questions gate.
- [ ] Repeated detail was replaced with links to its source of truth.
- [ ] The spec describes the unique architectural diff, not standard framework boilerplate.
- [ ] Exploratory thoughts remain in `notes.md` until they become decisions or active scope.

## Decision Completeness

- [ ] No unresolved Open Questions remain before approval.
- [ ] Target behavior is explicit and observable.
- [ ] The chosen solution identifies ownership, boundaries, data flow, and canonical repository primitives.
- [ ] Material alternatives are recorded with repository-specific reasons for rejection.
- [ ] Public contracts include validation, authorization/scoping, compatibility, and ordering semantics where applicable.
- [ ] Persistence changes cover migrations, backfills, compatibility, and sensitive-data treatment where applicable.
- [ ] External calls, asynchronous work, and state mutations cover failure, retry, idempotency, and observability where applicable.
- [ ] Performance-sensitive paths cover expected scale, query shape, pagination, and cache invalidation where applicable.

## Risks and Reversibility

- [ ] Risks describe concrete failure scenarios rather than generic labels.
- [ ] Each risk includes severity, affected area, mitigation, and residual risk.
- [ ] Rollout ordering and operational checkpoints are explicit.
- [ ] Rollback or safe disablement is described for code, data, and contracts where applicable.
- [ ] User-visible degraded and failure behavior is defined.

## Main Spec

- [ ] Scope and shared architecture are stable and high-level.
- [ ] Active and ended sub-spec references are accurate.
- [ ] Implementation Order describes dependencies between sub-specs without duplicating their plans.
- [ ] Cross-cutting risks and contracts are represented.
- [ ] No large operational tracker or detailed step plan is embedded.

## Sub-spec Phasing and Plan

- [ ] Every active non-trivial sub-spec has Phasing and Implementation Plan sections.
- [ ] Each phase has a goal, prerequisites, and an objective exit gate.
- [ ] Each phase leaves the repository working, reviewable, and safe to merge.
- [ ] Steps are numbered by phase and name concrete outcomes and code areas.
- [ ] Every step has an objective verification method.
- [ ] Tests are planned at the layer required by repository guidance and are not deferred wholesale to the end.
- [ ] Relevant lint, typecheck, format, migration, and runtime checks appear at the appropriate checkpoints.
- [ ] No step requires an implementer to invent architecture, contracts, or product behavior.
- [ ] Acceptance Criteria map to one or more implementation steps and verification methods.

## Status and Lifecycle

- [ ] Short Tracker points to the current phase/step and material remaining gates without duplicating the full plan.
- [ ] `done` means implemented and verified in code.
- [ ] At most one tracker item is `in_progress`.
- [ ] Every `blocked` item names the concrete blocker.
- [ ] Changelog records only material decisions or lifecycle changes.
- [ ] Closed sub-specs and modules are moved according to repository rules, with cross-references updated.

## Review Verdict

- [ ] Findings are ranked Critical, High, Medium, or Low and include evidence.
- [ ] No Critical, High, or unresolved Medium finding remains.
- [ ] The required stack-specific compliance review passed or the document is explicitly reported as not ready.
