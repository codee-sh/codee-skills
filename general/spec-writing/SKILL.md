---
name: spec-writing
description: Write short module specs with one main spec plus linked sub-specs. Use for new spec work when the team wants concise, reference-driven documentation instead of long monolithic specs.
---

# Spec Writing

Write specifications as a small document system, not as one growing epic file.

This skill replaces the older "one big spec" style when the topic is large enough to split into a module-level main spec and smaller execution sub-specs.

---

## When to Apply

Use this skill when:

- a spec is getting too long or mixing history with active work
- a module needs one stable source-of-truth plus several focused follow-ups
- the team wants specs to stay short and scannable
- you are creating a new module spec structure from scratch

Do not use this skill when:

- the change is small enough that a maintained spec would add more overhead than value
- the user wants a temporary working note, not a long-lived source-of-truth document

---

## Core Model

There are only two living spec types:

1. **Main spec**
   - one per module / initiative
   - stable source of truth
   - short overview + architecture + references
   - usually stays active for a long time

2. **Sub-spec**
   - one per flow / refactor / implementation slice
   - execution-focused
   - short and narrow
   - can move to `ended/` when done

The main spec should link to sub-specs instead of repeating their details.

There is also one optional support file:

3. **`notes.md`**
   - one per module folder when needed
   - short working notes
   - hypotheses, observations, test results, and unresolved thoughts
   - not a source of truth
   - can be cleaned up aggressively

---

## Folder Structure

Specs are grouped by module folder, not stored as one flat list.

Use this structure:

```text
.ai/specs/
  {module-name}/
    YYYY-MM-DD-main-spec.md
    YYYY-MM-DD-sub-{topic-a}.md
    YYYY-MM-DD-sub-{topic-b}.md
    notes.md
    ended/
      YYYY-MM-DD-sub-{closed-topic}.md
```

Rules:

- folder name is stable and module-oriented, for example `terminal-tap-to-pay`
- the main spec filename should be `YYYY-MM-DD-main-spec.md`
- sub-spec filenames should be `YYYY-MM-DD-sub-{focused-topic}.md`
- keep sub-spec topic names short; the folder already carries the module context
- `notes.md` is optional and stays local to the module folder
- closed sub-specs move into `ended/` inside the same module folder
- only truly global or cross-module specs should live directly under `.ai/specs/`

---

## Hard Rules

### 1. Keep every spec short

Default target:

- **Main spec**: roughly 1-2 screens
- **Sub-spec**: roughly 0.5-1.5 screens

If the spec is growing into a long narrative, split it.

### 2. Do not mix history with active work

- Historical decisions belong in a short changelog or in ended specs.
- Active work belongs in sub-specs and trackers.
- Do not turn the main spec into a running diary.

### 3. Link instead of repeating

If a detail already lives in another spec:

- add a reference
- add one sentence of summary if needed
- do not duplicate the whole section

### 4. One tracker per active spec

- Main spec: no large operational checklist
- Sub-spec: use a **Short Tracker**

### 5. Working notes do not belong in specs

If you are still exploring and do not want to declare direction yet:

- use `notes.md`
- do not pollute `Short Tracker`
- do not turn speculative thoughts into fake requirements

### 6. Main spec is not the place for deep execution detail

Main spec should answer:

- what this module is
- why it exists
- what sub-specs are active
- what order they depend on

Sub-specs should answer:

- what exact change is needed
- what behavior should result
- what code areas must change

---

## Workflow

1. **Load context**
   - Read `AGENTS.md` Task Router.
   - Read the existing main spec if one exists.
   - Read only the relevant active sub-specs.
   - Read `notes.md` only if the module folder already uses it and it looks relevant.

2. **Choose spec type**
   - If this is module-level architecture or coordination: update/create the **main spec**
   - If this is one focused implementation slice: create/update a **sub-spec**

3. **Choose or create the module folder**
   - Put the main spec and all of its sub-specs in one module folder.
   - Do not create a new top-level spec file if the topic clearly belongs to an existing module folder.

4. **Start minimal**
   - Before writing, identify critical unknowns.
   - If unknowns block architecture or scope, add `Open Questions` and stop after the skeleton.

5. **Write the shortest useful version**
   - Main spec: overview + references + ordering
   - Sub-spec: problem + target behavior + required changes + acceptance

6. **Use notes when direction is still forming**
   - Put short working notes in `notes.md` when you are still exploring.
   - Promote a note into a spec only when it becomes a decision, requirement, or active implementation slice.

7. **Track only what is still live**
   - Use a short tracker in sub-specs
   - Do not mirror the entire changelog in the tracker

8. **Close specs intentionally**
   - Move only finished sub-specs to the module's `ended/`
   - Keep main specs active unless the whole module/initiative is closed

9. **Run compliance review before finalizing**
   - First run [references/spec-checklist.md](references/spec-checklist.md)
   - Then run [references/compliance-review.md](references/compliance-review.md)
   - Load the stack-specific compliance file named there
   - Treat compliance review as the final gate before calling the spec ready

---

## Main Spec Format

Use the template in [references/main-spec-template.md](references/main-spec-template.md).

Minimum sections:

- `# Title`
- `TLDR`
- `Scope`
- `Architecture`
- `Folder References`
- `Active Sub-specs`
- `Ended Sub-specs`
- `Implementation Order`
- `Current Status`
- `Short Changelog` (optional, but recommended for major decision changes)

### What belongs here

- module boundaries
- high-level architecture
- stable decisions
- folder-local references to active and ended follow-ups
- dependency order between sub-specs
- short references to active work

### What does not belong here

- long trackers
- detailed code-step plans
- repeated copies of sub-spec content
- lengthy historical narrative

---

## Sub-spec Format

Use the template in [references/sub-spec-template.md](references/sub-spec-template.md).

Minimum sections:

- `# Title`
- `TLDR`
- `Problem`
- `Target Behavior`
- `Required Changes`
- `Dependencies`
- `Acceptance Criteria`
- `Short Tracker`

Optional:

- `Out of Scope`
- `Current Status`

### Short Tracker

The **Short Tracker** is a small operational checklist for active work.

Rules:

- include only `pending`, `in_progress`, or `blocked` items by default
- include `done` items only if they materially affect the remaining scope
- update existing lines instead of duplicating them

Good:

```md
## Short Tracker

- `pending` - refactor cleanup step into a reuse-aware decision step
- `pending` - update arm workflow to reuse the current collection
- `pending` - verify diagnostics after the lifecycle refactor
```

Bad:

- 20+ item tracker
- repeating full changelog entries
- mixing future ideas with active scope

---

## Final Review

Before finalizing any spec:

1. Run [references/spec-checklist.md](references/spec-checklist.md)
2. Run [references/compliance-review.md](references/compliance-review.md)
3. Load and fill the stack-specific compliance matrix
4. Fix violations before marking the spec ready

Use this split consistently:

- `spec-checklist.md` validates structure, brevity, and tracker hygiene
- `compliance-review.md` validates hard technical rules for the project stack

---

## Changelog

Changelog is allowed, but keep it short.

Use it mainly in the **main spec** for:

- major architecture decisions
- scope reversals
- superseded approaches

Do not maintain a large dated diary inside every sub-spec.

If a sub-spec needs too much history, it is probably trying to be a main spec.

---

## notes.md

Use `notes.md` for short-lived working notes inside a module folder.

Good use cases:

- "I am trying to reason through this but I have not chosen direction yet"
- test observations
- quick option lists
- open hypotheses
- rough follow-up ideas that are not yet active scope

Rules:

- keep it short
- do not treat it as a source of truth
- move confirmed decisions into the main spec or a sub-spec
- move active work items into a `Short Tracker`
- delete or compress stale notes freely

`notes.md` exists to prevent premature spec bloat.

---

## Implementation Order

Keep `Implementation Order`, but treat it as a dependency map, not a giant plan.

Good:

- `Sub-spec A before Sub-spec B because B depends on the new model`
- `Webhook route before tap-open because the webhook is the trigger`

Bad:

- a long phase narrative that duplicates the tracker and plan

In main specs, `Implementation Order` should be short and cross-reference sub-specs.

In sub-specs, use `Dependencies` plus a tiny `Implementation Plan` only when needed.

---

## Status Rules

Recommended statuses:

- `done` - implemented and reflected in the codebase
- `in_progress` - actively being worked on
- `pending` - planned but not started
- `blocked` - cannot proceed because of an external dependency or unresolved decision
- `dropped` - intentionally abandoned

Do not mark a scope item `in_progress` if only its surrounding initiative is active.

Example:

- `done` - `pos_terminal` model + migration
- `in_progress` - `pos_terminal -> reader_id` integration in webhook and display flows

---

## Review Heuristics

1. **Spec type fit** - is this really a main spec or should it be a sub-spec?
2. **Folder fit** - is this spec in the correct module folder?
3. **Brevity** - can a whole section be replaced by a reference?
4. **No duplication** - does the main spec repeat sub-spec details?
5. **Tracker size** - is the tracker still short and operational?
6. **Notes hygiene** - are working thoughts kept in `notes.md` instead of bloating specs or trackers?
7. **Ordering clarity** - does the main spec explain dependencies between sub-specs?
8. **Ended hygiene** - are closed sub-specs moved into the module-local `ended/` folder?
9. **Status accuracy** - do statuses reflect code reality, not just planning intent?

---

## Reference Materials

- [Main Spec Template](references/main-spec-template.md)
- [Sub-spec Template](references/sub-spec-template.md)
- [Spec Checklist](references/spec-checklist.md)
- [Root AGENTS.md](../../../AGENTS.md)
