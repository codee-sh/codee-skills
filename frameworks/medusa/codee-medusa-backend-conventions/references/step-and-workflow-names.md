# Step and Workflow Names

What a step, a workflow and their files are called. This narrows `codee-ts-code-conventions`
`references/function-and-file-names.md` for Medusa's own units; a plain function in a Medusa backend
takes the general table as it is.

## Contents

- [Where steps differ from plain functions](#where-steps-differ-from-plain-functions)
- [File names and ids](#file-names-and-ids)
- [Workflow naming](#workflow-naming)
- [Step naming](#step-naming)

## Where steps differ from plain functions

| Verb | A plain function | A step |
|---|---|---|
| `get-` | takes one thing that must exist, or throws | returns one record from Medusa, or throws |
| `list-` | gathers the items of what it was given | returns many records from Medusa or a local module |
| `fetch-` | never: a plain function does no I/O | reads from outside Medusa |
| `prepare-` | shapes input and runs the `validate-` helpers of its domain | shapes input and judges nothing: a check is a `validate-` step of its own |
| `build-` | builds a new object | never: use `prepare-` |
| `create-`, `update-`, `delete-`, `upsert-`, `link-`, `unlink-` | never: a plain function writes nothing | writes, and owns its compensation |

A step takes only the prefixes of [Step naming](#step-naming). The other verbs of the general table
- `find-`, `format-`, `map-` and the rest - name the plain functions a step calls.

## File names and ids

- **The file name is the exported symbol in kebab-case, minus the suffix.** `list-products.ts`
  exports `listProductsStep`; `create-order.ts` exports `createOrderWorkflow`.
- **A workflow's id string matches its file name.** `createWorkflow("sync-order-to-erp")`
  lives in `sync-order-to-erp.ts`. The id is what shows up in logs and the workflow engine,
  so a reader who sees one must be able to open the other.

## Workflow naming

A workflow is named after the operation, verb first. Its verb may be one that no step may use -
`sync-`, `process-`, `recover-`, `finish-`, `claim-`: the operation word lives on the workflow, and
the steps it composes keep the prefixes from [Step naming](#step-naming).

**`claim-` names one operation only:** taking exclusive ownership of one unit of work from a pool
that several runs draw from. A claim workflow:

1. reads the pool and the record that will carry the lease (`list-`, `get-`);
2. decides in a `prepare-` step that returns `skip` with a `reason`, or `claim` with the unit and a
   new lease token - the token is created in that step, not in a `transform()`, see
   `codee-medusa-backend` `references/workflows.md`, "Values That Must Not Change";
3. in the `claim` arm, marks the unit taken and writes the lease through `update-` steps whose
   compensation puts both back;
4. returns the claimed unit and the token, or nothing.

Later steps renew the token while they work and compare it before they write; the operation that
closes the unit releases it. Without a lease and that exclusivity it is not a claim - name the
workflow for what it writes.

A claim built from separate read and write steps is not atomic: two runs can read the same free
unit before either writes. Say in the workflow JSDoc how exclusive the claim is, and make the write
conditional (`UPDATE ... WHERE` the unit is still free) when two concurrent runs are a real case.

Medusa already uses "claim" as a noun - an order claim (`beginClaimOrderWorkflow`,
`orderClaimItemWorkflow`). Put the unit after the verb - `claim-import-batch`,
`claim-export-task` - so a claim workflow never reads as order-claim handling.

## Step naming

A step's prefix says what kind of work it does, on three axes. Pick from these before inventing
a verb.

**Reads**

| Prefix | The step… |
|---|---|
| `list-` | returns many records from Medusa or a local module |
| `get-` | returns one record from Medusa, or throws |
| `fetch-` | reads from **outside** Medusa - a foreign API, a foreign database, a file |

**Checks and shapes**

| Prefix | The step… |
|---|---|
| `validate-` | checks its input against rules and changes no state; throws on a violation, or returns the verdict when the workflow must record the outcome instead of aborting |
| `prepare-` | readies the input for the step that comes next |

`validate-` and `prepare-` differ in the question they answer. A `validate-` step asks whether the
input is acceptable, and may hand back what it checked - the validated values, the ids it matched -
so the next step does not repeat the work. A `prepare-` step judges nothing; it only shapes input
for the step after it. Return the verdict instead of throwing only when the workflow has to persist
the failure: a throw rolls the workflow back, and the record of why goes with it.

**Writes**

| Prefix | The step… |
|---|---|
| `create-` / `update-` / `delete-` | writes to Medusa and owns its compensation |
| `upsert-` | writes insert-or-update, where that is genuinely one operation |
| `link-` / `unlink-` | writes a module link rather than a row |

`fetch-` is not a longer word for `list-`. The difference is where the data comes from, and it
decides how the step must behave: anything crossing a network boundary can fail, so the step is
the place that owns the timeout, the retry and an error the caller can act on.

**Every outbound HTTP call has a timeout and retries transient failures** - a network error, a
timeout, 429, 502/503/504 - a bounded number of times with a growing delay; any other status fails
at once. When a module client already owns that policy, the `fetch-` step calls the client and adds
nothing on top: a second retry loop multiplies the attempts. A raw `fetch` in a step - a binary from
a public URL the client cannot serve - applies the same policy, with its numbers kept as named
constants. Tell a transient error by its `name` (`TypeError`, `TimeoutError`, `AbortError`), not by
`instanceof`: an error from `fetch` or an abort signal may come from another realm. The error a step
throws names what it called, without credentials or query string.

**Verbs that are not step prefixes.** Each is a synonym of one above, and where both are in play
they drift until they name the same job under different words:

| Instead of | Use |
|---|---|
| `plan-`, `resolve-`, `build-` | `prepare-` - or `list-`/`get-`/`fetch-` when the step's real work is reading |
| `load-`, `retrieve-`, `collect-` | `list-` or `get-` |
| `remove-` | `delete-` |
| `register-`, `write-`, `set-`, `add-`, `repoint-` | `create-` or `update-` |
| `claim-`, `acquire-`, `lock-`, `take-` | a `claim-` workflow built from read, `prepare-` and `update-` steps - see [Workflow naming](#workflow-naming) |

`build-` stays available for plain functions; only steps may not use it.

When a `transform()` in the workflow already does the shaping, do not add a step for it. A step
earns its place when the workflow needs a named node to pass along, or when the shaping is worth
a test of its own — and then it is the step that is tested, per `codee-medusa-testing`.
