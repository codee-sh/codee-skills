# Pull Request Description Format

Use this structure for the generated pull request description:

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
