---
name: codee-medusa-scripts
description: >-
  Conventions for one-off and operational scripts in this Medusa backend - `src/scripts/`
  (manual `medusa exec`) and `src/migration-scripts/` (automatic on `medusa db:migrate`).
  Load it BEFORE writing, moving, reviewing or deleting anything in either directory, not
  after: it decides which of the two directories a script belongs in, whether the script
  defaults to writing or to a dry run, how it parses arguments, how it reaches data, where
  its shared helpers live, and when it may be deleted. Trigger on "write a script",
  "backfill", "migrate existing data", "one-off script", "clean up rows", "medusa exec",
  "seed", "reset", "audit script", on every new file under `src/scripts/` or
  `src/migration-scripts/`, and whenever a feature needs existing rows fixed up. Also load
  when deciding whether an existing script is still needed, when a script wants raw SQL or
  `PG_CONNECTION`, and when tempted to put script helpers in `src/utils/`.
---

# Medusa Scripts

Scripts are the least reviewed code in the repo and the code with the most direct reach
into production data. This skill exists because that combination went wrong once already:
`src/migration-scripts/initial-data-seed.ts` re-ran on every deployment, created a sales
channel, publishable key and store, then failed on the region step - and a failed
migration script is not compensated, so every deploy left another set behind.

Apply `codee-ts-code-conventions` and `codee-medusa-code-conventions` as well. Use
`codee-medusa-testing` for the test you owe.

## Which directory

Three places hold scripts, and they are not interchangeable. Pick by what the script needs, not
by what is nearby:

| Location | Runs | Has the Medusa container | For |
|---|---|---|---|
| `apps/backend/src/migration-scripts/` | automatically, every `medusa db:migrate` | yes | schema-time work that must happen unattended on deploy |
| `apps/backend/src/scripts/` | manually, `medusa exec <path> [args]` | yes | data fixes, backfills, seeds, operational tools |
| `tools/` | manually, `pnpm <name>` | no - plain Node or bash at the repo root | everything outside the app process: database dump / restore, code generation, repo checks |

Needing the container is the first question: if the script can do its job with a connection
string, an HTTP client or the file tree, it belongs in `tools/` and should not boot Medusa to get
there. A `tools/` script resolves the repo root from its own location and reads what it needs from
`apps/backend/.env` - see `tools/db-snapshot.sh` and `tools/dump-struct-product.mjs` for the two
shapes. Among the container scripts, needing to run unattended decides between the first two.

**`src/migration-scripts/` is the dangerous one.** It fires on every migrate and a failure is
**not compensated**, so partial writes stay. Nothing that creates or deletes data belongs there
unless it must run unattended, and then it needs an explicit environment guard - the
`RUN_INITIAL_DATA_SEED` pattern - so an empty-database seed cannot fire on a populated one. When
in doubt the answer is `src/scripts/`.

## Shape

```ts
export default async function scriptName({
  container,
  args,
}: {
  container: MedusaContainer
  args: string[]
}) {
```

- **Arguments are bare positional tokens.** `medusa exec` does not enable
  `unknown-options-as-args`, so Yargs rejects anything starting with `--` before the script
  starts. Write `dry-run`, not `--dry-run`, and do not accept both - the `--` branch is
  unreachable. Match with `args.includes(...)`, never by index: a positional
  `args[1] === "confirm"` silently does nothing when the caller reorders arguments.
- **A destructive script is safe by default.** No arguments means dry run; it applies only
  with an explicit `confirm` token. A non-destructive backfill may write by default, but its
  first log line says so.
- **A destructive script proves which database it is pointed at.** `medusa exec` uses
  whatever the active backend `.env` selects. Print a non-secret database identity, and for
  anything irreversible require the expected database name as an argument before applying.
- **One log prefix constant, named `LOG_PREFIX`**, on every line the script logs. Scripts
  log into the same stream as the server; an unprefixed line is unattributable.
- Scripts throwing a plain `Error` is correct - there is no HTTP response to map onto - so
  the `@medusajs/use-medusa-error-not-generic-error` warnings on this directory are expected
  and should not be "fixed".

## Reaching data

In order, stopping at the first that works: module service → `query.graph` → Link Module →
raw SQL through `PG_CONNECTION`.

Raw SQL is legitimate for exactly three things nothing above can do:

1. reading a link pivot table that has no module service,
2. reading a column absent from the DTO (`sales_channel.created_at`, say),
3. introspecting the schema - does this table or column exist at all.

When a script does drop to SQL:

- type the connection with `RawQueryable` from `src/scripts/shared/raw-query.ts`; never
  redeclare the shape locally,
- keep the functions that build SQL unexported, so no caller outside the file can reach an
  interpolated table or column name,
- bind every value (`?` + bindings). Interpolate only constants declared in the same file,
  and say so in a comment next to the constant,
- treat a table you could not read as "unknown", never as zero - a missing table must not
  become permission to delete.

## Where shared code lives

`src/scripts/shared/`. Not `src/utils/`: that directory is pure functions with unit tests
(every other file in it resolves nothing from the container), and it is imported by API
routes and workflows, so anything parked there is reachable from a request path it was never
written for.

## Idempotency and paging

Every script is re-runnable: a second run reports rows skipped and writes nothing. Page with
a `PAGE_SIZE` / `CHUNK_SIZE` constant and a loop - never load a whole table to iterate it.

## Lifecycle

A one-off script that no one retires becomes indistinguishable from a tool. Both halves are
required:

1. The docblock states what it migrates, what code path replaced the old one, and **the
   condition under which it may be deleted**.
2. A row in `src/scripts/README.md`: script, type (one-off / operational), mode
   (`confirm` / `dry-run` / none), and status. Status is where it has actually run -
   `pending`, or `applied on <env> <YYYY-MM-DD>`. "Written and tested on dev" is not
   "applied"; a one-off script may only be deleted once its row says it ran everywhere it
   had to.

Updating that row is part of writing the script, and part of running it.

## Before finishing

- Right directory, and a guard if it is `migration-scripts/`.
- Destructive ⇒ dry run by default, `confirm` to apply, database identity printed.
- Positional args, matched by `includes`.
- `LOG_PREFIX` on every log line.
- Lowest-privilege data access that works; raw SQL justified by one of the three reasons.
- Re-runnable, paged.
- Docblock says when it can be deleted; `README.md` row added.
- Pure helpers extracted and unit-tested per `codee-medusa-testing`.
