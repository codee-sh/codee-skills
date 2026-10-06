# Upstream Medusa skills

Four skills in this folder are copies of Medusa's own skills from
[medusajs/medusa-agent-skills](https://github.com/medusajs/medusa-agent-skills), kept under
`codee-` names with Codee's changes on top. This file records where each copy comes from, what
Codee changed, and how to bring a copy up to date. It sits outside the skill folders, so it is not
installed into projects.

## Sources

| Codee skill | Upstream path | Copied from | Baseline commit | Upstream checked on 2026-10-06 |
|---|---|---|---|---|
| `codee-medusa-admin-dashboard` | `plugins/medusa-dev/skills/building-admin-dashboard-customizations` | `42da91a` (2026-08-14) | `a993594` | up to date |
| `codee-medusa-backend` | `plugins/medusa-dev/skills/building-with-medusa` | `a46f3b1` (2026-09-09) | `435da63` | up to date |
| `codee-medusa-storefront-sdk` | `plugins/medusa-dev/skills/building-storefronts` | `88adfce` (2026-02-09) | `923efc5` | up to date |
| `codee-medusa-storefront-ux` | `plugins/ecommerce-storefront/skills/storefront-best-practices` | `da659ef` (2026-10-02) | `e246358` | up to date |

The baseline commit holds the verbatim upstream copy; the Codee changes are everything after it.

Every "copied from" commit was confirmed by comparing the whole skill folder at the baseline with
the upstream folder at that commit, apart from the `name:` field. Matching `SKILL.md` alone is not
enough: the first storefront-ux import matched `f923b95` on `SKILL.md` but was really `f08f937`,
two commits older, because only its `reference/` files had changed in between.

## Codee changes

Every skill: the `name:` field carries the `codee-` name, and references to other upstream skills
use the `codee-` names. The full set of Codee changes is always
`git diff <baseline> HEAD -- frameworks/medusa/<skill>`, where the baseline is the last commit that
copied upstream verbatim.

`codee-medusa-admin-dashboard` also carries:

- **Fixes to upstream code** - candidates to report to Medusa, after which they drop off this list:
  - `keepPreviousData: true` replaced by `placeholderData: keepPreviousData` (TanStack Query 5
    removed the option);
  - `Spinner` imported from `@medusajs/icons`, with `animate-spin`;
  - `Thumbnail` imported from `@medusajs/dashboard/components` - `@medusajs/ui` does not export it.
- **`references/forms.md` replaced by Codee's own.** Upstream's builds forms from `useState` with
  hand-written validation; Codee's uses route modal forms, `react-hook-form`, Zod v4 and
  `ManagerFields`.
- **`SKILL.md`:** `react-hook-form`, `@hookform/resolvers` and `zod` in "pnpm Users ONLY", and `components.md` and
  `forms.md` in the reference lists.
- **Codee sections:** "Query Keys" in `data-loading.md`; "Error Toasts", "Dates" and
  "Action Columns and Prompts" in `display-patterns.md`.
- **New file:** `references/components.md` (Components Router).

`codee-medusa-backend` also carries:

- **`reference/` is named `references/`**, the folder name every Codee skill uses. A sync maps
  upstream's `reference/<file>` to `references/<file>`, in the baseline commit too.
- **`SKILL.md`, "Validating Implementation":** the agent runs the checks the project's `AGENTS.md`
  lists and never the full build, which belongs to the user; upstream tells the agent to run the
  build and not to finish until it passes. The Linting bullet loses "alongside the build" for the
  same reason.
- **`SKILL.md`, "Tests" instead of upstream's "Next Steps":** testing is delegated to
  `codee-medusa-testing`.
- **Codee rules** across `SKILL.md` and the references, from the org's own way of building on
  Medusa (the commits after the baseline): error handling, workflows, custom modules, module links.

## Syncing a skill

1. Read upstream's history for the path since the recorded commit, and pick the commit to copy.
2. Save Codee's changes: `git diff <baseline> HEAD -- frameworks/medusa/<skill> > codee.patch`.
3. Overwrite the folder with upstream's files at that commit, keeping the `name:` field, and commit
   it on its own - it becomes the new baseline, and its diff shows exactly what upstream changed.
4. Re-apply Codee's changes file by file:
   `git merge-file <file> <old-baseline version> <pre-sync Codee version>`, then resolve any
   conflict by hand. Commit.
5. For `codee-medusa-admin-dashboard`: diff upstream's `references/forms.md` between the old and
   the new commit, port what still applies into Codee's `forms.md`, and delete upstream's file
   again.
6. Update the tables above.
7. Push the baseline and the re-apply commits together, so no published state lacks Codee's
   changes.
