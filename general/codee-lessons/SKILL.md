---
name: codee-lessons
description: Record and retrieve non-obvious engineering findings as one tagged file per lesson, indexed by a catalog. Use when a bug's cause was surprising, when something failed in one environment and not another, when the same mistake shows up a second time, or when a fix only makes sense with an explanation that does not belong in the code. Trigger on "write this down", "save a lesson", "this bit me again", "why does it work locally but not in production", "note this for next time", and after any debugging session whose conclusion was not obvious from the code. Also load before answering a question whose answer may already be recorded, to route through the catalog instead of re-deriving it.
---

# Lessons

A lesson is a durable, non-obvious finding: what actually happened, why it is true, and the rule it produces. One file per lesson, one row per file in a catalog, and tags that let the next agent find it without reading everything.

## Where things live

Read `.ai/agentic.config.json` and use its `lessons` block. When there is no config, fall back to these defaults:

| Field | Default | What it is |
|---|---|---|
| `lessons.path` | `.ai/lessons` | one markdown record per lesson |
| `lessons.index` | `.ai/lessons.md` | the catalog that indexes them |
| `lessons.modulesFrom` | `.ai/specs` | the directory whose folder names are the module vocabulary |
| `lessons.areas` | — | the closed area vocabulary |
| `lessons.topics` | — | the closed cross-cutting vocabulary |

## Retrieving a lesson

**MUST route through the catalog. MUST NOT bulk-read the records directory.**

1. Start with the exact module id when the task names one. Module ids are the folder names under `lessons.modulesFrom` — a spec folder and its lessons carry the same identifier.
2. Add every area the work touches.
3. Use topics to narrow cross-cutting concerns.
4. Open only the records whose row matches. Three matching records read in full beat forty skimmed.

The catalog exists so an agent spends its context on the four lessons that apply, not on the thirty-eight that do not.

## Writing a lesson

### What belongs here, and what does not

A lesson carries the **evidence**, the **failure mode**, and the **durable rule**. Hard safety and workflow boundaries belong in the closest `AGENTS.md` instead — that file is read to decide what to do, this one is read to understand why.

When a finding produces both, split it: the rule goes to `AGENTS.md` as a trigger with a link, the explanation stays here. Never write the full explanation in both places.

Do not record: anything the code already states plainly, a one-off environment glitch, or a preference with no failure behind it.

### The record

One file at `<lessons.path>/<slug>.md`. The slug is the kebab-cased title, truncated at a word boundary to roughly 60 characters.

```markdown
---
{"title": "Clear a cache key before rewriting it", "modules": [], "areas": ["backend"], "topics": ["caching"]}
---

# Clear a cache key before rewriting it

<What happens, with the concrete evidence: the file, the API, the observed
behavior, and what made it invisible. Name why it reproduces in one environment
and not another when that is the point.>

<The durable rule, stated as an instruction.>
```

Front matter is a single JSON object with exactly four keys: `title`, `modules`, `areas`, `topics`.

- `modules` — folder names under `lessons.modulesFrom`, verbatim. A module tag that names no folder is an error, not a new module.
- `areas` — from `lessons.areas`. Several may apply.
- `topics` — from `lessons.topics`. **MUST NOT invent one.** A finding that needs a new topic is a deliberate edit to the config, made and explained before the record is written; otherwise the vocabulary sprawls into one term per lesson and stops grouping anything.

### The index row

Add exactly one row to `<lessons.index>`, under the heading for the record's first area:

```
- [Title](lessons/slug.md) - area:backend; module:sap-order-export; topic:sap,database
```

Omit `module:` or `topic:` when the list is empty. Keep the linked title identical to the record's `title` — the catalog is searched by title, and a renamed row orphans it.

## Validating

A catalog is only trustworthy while the records, the rows, and the vocabularies agree, and
each drifts on its own: a renamed title orphans a row, an invented topic quietly stops
grouping, a module tag outlives the folder it named. Repositories that add lessons often
should keep a checker next to their other maintenance scripts (conventionally
`tools/check-lessons.mjs`) and run it after every lesson change.

It must verify:

- every record's front matter parses and carries `title`, `modules`, `areas`, `topics`;
- every `modules` entry names a real folder under `lessons.modulesFrom`;
- every `areas` and `topics` entry comes from the configured vocabulary;
- every record has exactly one index row, and the row's title matches the record's;
- every index row points at a record that exists.

Pure filesystem reads, so it costs nothing to run on every edit.

## Rules

- **MUST keep one record per finding.** Two findings in one file cannot be tagged or retrieved separately.
- **MUST update an existing record** when new evidence refines a lesson already written, rather than adding a near-duplicate.
- **MUST keep the record self-contained.** Someone opening it from a link should not have to read the catalog or another record to understand it.
- **NEVER delete a lesson because the bug was fixed.** The rule survives the fix; that is the point. Record the fix in the lesson instead.
