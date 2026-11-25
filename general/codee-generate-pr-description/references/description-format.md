# Pull Request Description Format

A repository's pull request template, when it has one, sets the structure ("With a repository
template" below). Without one, use this default structure:

```markdown
## Summary

- Describe the user-facing and operational outcome.
- Include material behavior changes.

## Architecture

- Describe meaningful boundaries, data-flow changes, public API changes, or
  structural refactors.

## Database

- Describe schema changes, migrations, backfills, and manual deployment steps.

## Testing

- List only checks that were actually run and their results.
- Explicitly state important checks that were not run.
```

## Empty Sections

Keep all four headings. Use the following statements when a section has no
material content:

```markdown
## Architecture

- No material architecture changes.

## Database

- No database changes.
```

For testing, state what was not run instead of implying successful validation.
For example:

```markdown
## Testing

- Not run (PR description generation only).
```

## Writing Rules

- Describe outcomes rather than listing changed files.
- Consolidate related changes into one bullet.
- Use changed Changesets as the primary source for user-facing changes when
  the repository uses Changesets.
- Verify and enrich Changeset summaries with source diffs.
- Describe architecture only when boundaries, data flow, public APIs, or
  structure changed materially.
- Describe database impact from schema, migration, and source evidence.
- Mention manual migration and backfill requirements explicitly.
- Keep staged and unstaged work distinct from committed branch changes.
- Include additional sections only when the user or repository instructions
  require them.
- Do not include commit lists, commit hashes, implementation chronology,
  placeholders, speculative claims, or a generated-by-AI note.
- Do not claim that a test, build, migration, backfill, deployment, or CI check
  ran without direct evidence from the current task context.

## With a repository template

The template's headings, their order and its checklist are the description's structure; the default
headings above are not added. The writing rules above still apply to every section.

- Fill each heading with what it asks for, from the same evidence: user-facing changes and
  Changesets where it asks what changed, the reason or the linked issue or spec where it asks why,
  boundaries, data flow, public API and database impact where it asks how, and observed results only
  where it asks about testing.
- Drop the template's HTML comments and placeholder text once the section is filled.
- A heading with nothing to report keeps a one-line statement, as the empty sections above do.
- Keep each checklist item as written. Tick a box only when the evidence in the current task shows it
  is done, such as a Changeset in the diff or a gate run with its result; leave the rest unticked
  rather than guessing.
- When the template has no place for a migration or manual deployment step the change needs, state
  it in the section closest to how the change works.
