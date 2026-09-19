# Medusa Agent Template

Copy this section into the repository's agent instruction file. Remove rows for
skills that are not installed or relevant.

Official Medusa skills come first, followed by Codee conventions and workflows.

## Skill Router

Match every applicable row before acting. Use all listed skills; report any
unavailable skill.

| Task | Skills |
|------|--------|
| Medusa backend | `codee-medusa-backend` |
| Medusa Admin UI | `codee-medusa-admin-dashboard` |
| Medusa storefront integration | `codee-medusa-storefront-sdk` |
| Ecommerce storefront UI or flow | `codee-medusa-storefront-ux` |
| Generate a migration for a Medusa module | `db-generate` |
| Run pending database migrations | `db-migrate` |
| Script in `src/scripts/` or `src/migration-scripts/`, or a one-off data backfill | `codee-medusa-scripts` |
| Guided Medusa learning tutorial | `learning-medusa` |
| Bug report, before proposing or writing a fix | `codee-root-cause` |
| TypeScript implementation or review | `codee-ts-code-conventions` |
| Any Medusa backend file - where it goes, what it is named, its JSDoc | `codee-medusa-backend-conventions` |
| Test for a Medusa step, workflow, module, API route, or util | `codee-medusa-testing` |
| Medusa Admin form | `codee-medusa-admin-dashboard-forms` |
| User-facing UI text | `codee-ui-copy` |
| Write or restructure specifications | `codee-spec-writing` |
| Review a Medusa specification | `codee-spec-review-medusa` |
| Cross-cutting working notes | `codee-spec-notes` |
| Non-obvious finding worth recording, or looking one up | `codee-lessons` |
| Pull request description | `codee-generate-pr-description` |
| Client or stakeholder questions | `codee-writing-questions` |
| New agent skill | `codee-skill-creator` |
| Configure or re-configure the agent pipeline | `codee-setup-agent-pipeline` |

`db-generate`, `db-migrate`, and `learning-medusa` are listed for completeness. The user
invokes them explicitly, so the router is not expected to match them on its own.
