---
name: payload-review
description: Best-practices review & hardening for Payload CMS apps — deployment and architecture hygiene, NOT security (that's payload-security). Use when reviewing a project for good practices, or when changing the DB schema, migrations, collections, hooks, endpoints, indexes, transactions, env/config, or generated types/importmap. Self-contained — each item is what to check → how to fix, with copy-paste patterns.
---

# Payload — Best-practices review & hardening

Payload gives you a lot of power with very few guardrails: it will happily auto-sync your
schema, over-fetch relationships, run hooks outside transactions, and boot with a missing
secret. None of those are *security* holes (use **payload-security** for those) — they are
the operational and architectural mistakes that cause data loss, slow queries, flaky
deploys, and 3am incidents. Use this skill to review a project for those gaps and fix them
consistently.

Each item is: **what to check → how to fix**. The fix patterns are inline and
self-contained — adapt names and paths to the codebase at hand. They are deliberately
concise: this skill tells you *what to fix and why*, and hands off to the build skills for
*how to build it well*. When a fix needs deeper build guidance, reach for the right one:

- **payload** — how to structure a collection, field, hook, endpoint, query, or
  access-control function (detailed how-to references).
- **payload-build-collections** — step-by-step when the fix means adding a new collection
  or extending the schema.
- **payload-build-modules** — step-by-step when the fix means a custom admin view or field
  component.
- **code-style** — conventions for any code you write while applying a fix (comments,
  naming, file organisation).

---

## Audit file — always keep it current

Every run of this skill is tracked in a single living document at
**`.ai/audits/best-practices-audit.md`**.

**On starting** (review or any schema/migration/hook/endpoint/config change):
1. If the file does **not** exist, create it from the template below.
2. If it exists, read it first — it is the current status; build on it, don't restart.

**While working**, update the file **as you go**, not just at the end: when an item moves
from `[missing]`/`[partial]` to `[done]`, change its line immediately and note the
commit/migration/file that delivered it. The file must always reflect the real state of the
codebase — verify against the actual code before marking anything `[done]`, never trust a
stale status.

Keep this file out of version control — add `.ai/audits/` to `.gitignore`. Do not commit it.

Status markers: `[done]`, `[partial]`, `[missing]`, `[out-of-repo]` (infra/process).

Template:
```markdown
# Payload best-practices audit — status & plan

**Date:** <YYYY-MM-DD>
**Status:** in progress

Status markers: [done] · [partial] · [missing] · [out-of-repo] (infra/process)

## Implemented
- [done] <item> — <what + file/commit/migration reference>

## To do
### High priority
- [missing] <item> — <note, blocker, decision needed>
### Medium priority
- [partial] <item> — <note>

## Out of repo (infra/process)
- [out-of-repo] <item>

## Strengths (already good)
- [done] <item>
```

The checks below feed the rows of this file; map each one to a status marker.

---

## Run the security review too

This skill deliberately leaves security out of scope — but a project is not "reviewed"
until both halves are covered. As part of any review, also run the **payload-security**
skill (access control, auth, CORS/CSRF, uploads, headers, logging). The two are
complementary: security closes attack surface, this skill keeps the app correct and
operable. They write separate audit files (`security-audit.md` vs
`best-practices-audit.md`), so neither overwrites the other.

---

## Schema & migrations — never auto-push

**Check:** the DB adapter must have `push: false`. With `push: true` (the default in dev),
Payload diffs your models against the live DB and mutates the schema on every dev-server
start / boot — silently dropping columns or whole tables when a field changes. That is fine against
a throwaway local DB and catastrophic against anything shared or production.

**Fix:** turn auto-push off and route every schema change through an explicit, committed
migration:
```ts
db: postgresAdapter({
  push: false, // schema changes go through migrate:create + migrate only
  // ...pool / connection config
})
```
Workflow for any new collection / field / index / versioning change:
```bash
payload migrate:create <descriptive_name>   # writes a new file to the migrations dir
payload migrate                              # applies pending migrations
```
- Migrations are **code** — review the generated up/down before committing; commit the
  `.ts` and its `.json` snapshot together.
- Never hand-edit an already-applied migration; create a new one.
- Apply migrations in deploy via an explicit command step (e.g. `payload migrate` in
  the release/predeploy stage), **not** on app boot. The app starting should never be the
  thing that changes the schema.

## Generated types & import map stay in sync

**Check:** `payload-types.ts` and the admin import map drift the moment someone changes a
field or an admin component and forgets to regenerate. Stale types hide real type errors;
a stale import map means custom admin components silently don't load.

**Fix:** regenerate and commit after the relevant change, and verify in CI:
```bash
payload generate:types        # after any collection/field change
payload generate:importmap    # after adding/moving a custom admin component
```
In CI, run both and fail if `git diff` is non-empty — that proves the committed artifacts
match the code.

## Indexes for filtered & sorted fields

**Check:** any field used in a `where` clause, a sort, or an access-control filter needs an
index — without it the database does full scans that get slower as the table grows (the
classic "fast in dev, dead in prod" trap). **Relationship and upload fields are auto-indexed
by Payload** — don't flag those as missing. The real gaps are *scalar* fields you filter or
sort on (`text`, `select`, `number`, dates — e.g. `status`, `slug`, `email`) and multi-field
query patterns. Verify against the migration / DB (look for `_idx`), not the presence of an
`index: true` flag in the config — the flag is redundant for relationships, so its absence
does **not** mean "unindexed".

**Fix:** mark filtered scalar fields `index: true` (this is a schema change → migration):
```ts
{ name: 'status', type: 'select', options: [...], index: true } // filtered/sorted often
{ name: 'slug', type: 'text', index: true, unique: true }
```
For multi-field query patterns, add a compound index — in SQL adapters via raw SQL in a
migration's `up`; in Mongo via a compound index definition.

## Control `depth` — don't over-fetch relationships

**Check:** Payload populates relationships to a default `depth` of 2. Chains of nested
relationships (e.g. order → line-items → product → category) can balloon one read into
dozens of joins/queries.

**Fix:** pass an explicit `depth` matching what the caller actually needs, and prefer `0`
+ selective population on hot paths:
```ts
await payload.find({ collection: 'orders', depth: 1 }) // only one level of relations
```
Watch for N+1 in hooks that loop and call `payload.find` per row — batch with a single
`where: { id: { in: [...] } }` query instead.

## Run multi-step writes inside one transaction

**Check:** when a hook or endpoint performs several writes, they must share a transaction
so a failure rolls the whole thing back. The mechanism is `req` — Payload threads the
transaction through it. A local `payload.create(...)` that omits `req` runs in its **own**
transaction and will not roll back with the operation that triggered it, leaving orphaned
rows.

**Fix:** always forward `req` from hooks/endpoints into nested Local API calls:
```ts
const hook: CollectionAfterChangeHook = async ({ req, doc }) => {
  await req.payload.create({
    collection: 'audit-log',
    data: { record: doc.id },
    req, // <-- joins the caller's transaction; rolls back together on failure
  })
}
```

## Hooks: idempotent, fast, fail loud

**Check:** hooks run inside the request path. Heavy synchronous work (external HTTP, large
recomputations) blocks the response; non-idempotent hooks double-apply when an operation
retries or runs twice.

**Fix:**
- Keep request-path hooks cheap; offload slow work to a job/queue and react to it
  asynchronously.
- Make `beforeChange`/`afterChange` idempotent — compute from `data`/`doc`, don't blindly
  increment or append.
- Throw `APIError(message, status)` on invalid state so the operation aborts cleanly with
  a real status code, instead of letting a bad write through.

## Validate config & env at startup — fail fast

**Check:** `process.env.PAYLOAD_SECRET || ''` and `DATABASE_URL || ''` let the app boot
with an empty secret or no database, turning a missing-env mistake into a confusing runtime
failure (or an insecure default) much later.

**Fix:** assert required env up front so a misconfigured deploy fails immediately and
loudly:
```ts
function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}
const secret = required('PAYLOAD_SECRET')
const connectionString = required('DATABASE_URL')
```
Keep `.env` gitignored and a `.env.example` committed listing every required key.

## Custom endpoints validate input & return real status codes

**Check:** a custom `endpoints` handler that trusts `req.data` / query params without
validating them, or that returns `200` regardless of outcome, is a correctness hazard —
bad input flows straight into queries and callers can't tell success from failure.
(Access control on custom endpoints is a security concern — covered by **payload-security**.)

**Fix:** validate and coerce input before using it, and return status codes that match the
outcome:
```ts
endpoints: [{
  path: '/summary', method: 'get',
  handler: async (req) => {
    const limit = Number(req.query?.limit ?? 20)
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return Response.json({ error: 'limit must be 1–100' }, { status: 400 })
    }
    // ...run the query with validated params
    return Response.json(data)
  },
}]
```

## Stable slugs & field names

**Check:** collection `slug`s and field `name`s are part of the schema and the API
contract. Renaming a field is a destructive migration (drop + add) unless handled
deliberately, and breaks any stored reference or external client.

**Fix:** name things well the first time; treat renames as planned migrations that copy
data old→new in the `up` step rather than a bare rename that loses it. Set `required` and
`defaultValue` intentionally so existing rows migrate cleanly.

---

## Review checklist

- [ ] Security review run via the **payload-security** skill (separate audit file)
- [ ] DB adapter has `push: false`; no path auto-syncs schema
- [ ] Every schema change has a committed migration (`migrate:create` + `migrate`)
- [ ] Migrations applied via an explicit deploy command, never on app boot
- [ ] `generate:types` and `generate:importmap` run + committed; CI fails on drift
- [ ] Filtered/sorted scalar fields indexed (relationships are auto-indexed); verified in DB
- [ ] Hot read paths pass an explicit `depth`; no N+1 loops in hooks
- [ ] Multi-step writes forward `req` to share one transaction
- [ ] Request-path hooks are cheap and idempotent; invalid state throws `APIError`
- [ ] Required env vars asserted at startup; `.env.example` committed
- [ ] Custom endpoints validate input and return real status codes
- [ ] Slugs/field names stable; renames handled as data-preserving migrations
