---
name: codee-generate-pr-description
description: Generate or update a pull request description from the current Git branch and save it to `.ai/pr-description.md`, in the repository's pull request template when it has one. Use when the user asks to generate, prepare, write, refresh, or update a PR description, including requests such as "Generate PR description" or "Prepare PR description". This skill only prepares the description artifact; it does not create or update the pull request.
---

# Generate PR Description

Create an evidence-based pull request description from the current repository
state. Save the description for a separate, manually invoked PR creation
workflow.

## Workflow

1. Read `references/description-format.md` completely before drafting the
   description.
2. Read the repository instructions, such as `AGENTS.md`, and honor any
   project-specific base branch, Changeset, migration, output, or PR format
   conventions.
3. Look for the repository's pull request template, where GitHub reads it,
   in any letter case: `.github/pull_request_template.md`,
   `pull_request_template.md` at the root, `docs/pull_request_template.md`,
   or one file under a `PULL_REQUEST_TEMPLATE/` folder in those places. When
   one exists, its headings, order and checklist are the description's
   structure (`references/description-format.md`, "With a repository
   template"); otherwise use the default format. When a folder holds several
   templates, ask which one applies.
4. Resolve the comparison base in this order:
   - a base explicitly provided by the user;
   - a base declared by the repository instructions;
   - `origin/develop`.
5. Verify that the selected base ref exists. If it does not exist, use an
   unambiguous base declared by the repository, such as its remote default
   branch. Ask the user when no reliable base can be determined.
6. Inspect the committed branch changes with read-only Git commands:

   ```bash
   git status --short --branch
   git diff --stat <base>...HEAD
   git diff --name-status <base>...HEAD
   git diff <base>...HEAD
   ```

   Narrow the full diff to relevant files when it is too large to review as
   one output.
7. Inspect staged and unstaged changes separately:

   ```bash
   git diff --cached --stat
   git diff --cached --name-status
   git diff --cached
   git diff --stat
   git diff --name-status
   git diff
   ```

   Include uncommitted work only when it belongs to the requested pull
   request. Do not present it as committed.
8. Read every changed Changeset when the repository uses Changesets. Use
   `.changeset/` by default, while honoring a project-specific location.
9. Identify changed migrations and database-related changes from repository
   instructions, changed paths, and source diffs. Do not assume a
   framework-specific migration directory. Record any required migration,
   backfill, or manual deployment step supported by the evidence.
10. Determine testing evidence from commands and results available in the
   current task context. Never infer that CI, tests, builds, migrations,
   backfills, or deployments ran.
11. Synthesize the findings in the template's structure or the default
    format of `references/description-format.md`, then create or overwrite `.ai/pr-description.md` unless the user or repository
    instructions specify another output path.
12. Validate the completed description:
    - every heading of the template, or of the default format, is present, in
      its order;
    - a checklist box is ticked only when the evidence supports it;
    - testing claims match observed results;
    - no commit list or commit hash is included;
    - no placeholder or speculative claim remains;
    - the output file is ignored by Git.
13. If the output file is not ignored, report that fact without modifying
    `.gitignore` unless the user explicitly requests the change.

## Boundaries

- Generate only the PR description artifact.
- Do not create or update a pull request.
- Do not invoke `create-pr`, `gh pr create`, `gh pr edit`, or an equivalent
  command.
- Do not push commits or branches.
- Do not run tests, builds, migrations, backfills, or deployments solely to
  generate the description.
- Do not use commit messages, commit lists, or commit hashes as description
  content.

## Output

Write concise English Markdown to `.ai/pr-description.md` by default. Overwrite
an existing description. Finish by reporting the output path and leave PR
creation to the user's separate manual workflow.
