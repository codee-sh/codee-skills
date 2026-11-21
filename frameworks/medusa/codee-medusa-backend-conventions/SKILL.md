---
name: codee-medusa-backend-conventions
description: Where a file goes, what it is called, what its JSDoc must say, and what shape a step takes, across a Medusa backend - workflows and steps, API routes, modules, links, subscribers, jobs, and the plain functions beside them. Use when writing or reviewing any Medusa backend file, when naming a new step or workflow, when deciding where a helper goes, and when deciding what a step should accept and return.
---

# Medusa Backend Conventions

Apply this skill after `codee-ts-code-conventions`. Its `references/function-and-file-names.md` and
`references/code-layout.md` hold the rules for any TypeScript code; this skill narrows them for a
Medusa backend, states only where Medusa differs, and links the rest.

`codee-medusa-backend` covers what Medusa dictates. This skill covers what we decided where Medusa
left room: where a file goes, what it is called, and what its JSDoc must say. It overrides the base
comment rule only where it explicitly requires JSDoc.

## References

Load a reference before the work it covers:

- **Creating a file or a folder in a Medusa backend, or deciding where a helper goes?** MUST load
  `references/file-layout.md` first: the folder of each role in Medusa, when a helper leaves a step,
  and the layout of `workflows/`, `api/`, `modules/`, `links/`, `subscribers/` and `jobs/`.
- **Naming a step, a workflow or their files?** MUST load `references/step-and-workflow-names.md`
  first: where step verbs differ from plain functions, file names and ids, workflow naming, the step
  prefixes and the verbs that are not step prefixes.
- **Writing a workflow, a step, or a route, middleware, subscriber or job that reaches data?** MUST
  load `references/workflows-and-steps.md` first: where data is read and written, composition, one job
  per step, step shape, and the JSDoc of workflows and steps.

## Rules at a glance

Each is stated in full in its reference; this list only points there.

- Workflows group by domain: `src/workflows/<domain>/{steps,workflows,utils,types}/`.
- One `createStep` and one `createWorkflow` per file, the file named after the symbol, a workflow's id
  after its file.
- Query and module services are called in steps only; a route, a middleware, a subscriber and a job
  reach data through a workflow, reads included.
- A step reads, decides or writes - one of the three - and takes only the step prefixes.
- Every `when()` is named, and a `transform()` callback stays one level deep.
- Every `createWorkflow` and `createStep` has a JSDoc block.
- A helper leaves a step for a second consumer, or for one of the cases `file-layout.md` lists;
  testability is never a reason.

## Deviations

A codebase that predates these rules will break them in places. Leave those alone unless you are
fixing them deliberately, and record them in the project's own notes — not here. A shared skill
states the rule; the backlog of what does not yet meet it belongs to the project that carries it.
