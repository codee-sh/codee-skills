# Medusa Agent Template

Copy this section into the repository's agent instruction file. Remove rows for
skills that are not installed or relevant.

Official Medusa skills come first, followed by Codee conventions and workflows.

## Skill Router

Match every applicable row before acting. Use all listed skills; report any
unavailable skill.

| Task | Skills |
|------|--------|
| Medusa backend | `building-with-medusa` |
| Medusa Admin UI | `building-admin-dashboard-customizations` |
| Medusa storefront integration | `building-storefronts` |
| Ecommerce storefront UI or flow | `storefront-best-practices` |
| Generate a migration for a Medusa module | `db-generate` |
| Run pending database migrations | `db-migrate` |
| Guided Medusa learning tutorial | `learning-medusa` |
| TypeScript implementation or review | `codee-ts-code-conventions` |
| Medusa workflow or step | `codee-medusa-code-conventions` |
| Test for a Medusa step, workflow, module, API route, or util | `codee-medusa-testing` |
| Medusa Admin form | `codee-admin-forms-with-medusa` |
| User-facing UI text | `codee-ui-copy` |
| Write or restructure specifications | `codee-spec-writing` |
| Review a Medusa specification | `codee-spec-review-medusa` |
| Cross-cutting working notes | `codee-spec-notes` |
| Pull request description | `codee-generate-pr-description` |
| Client or stakeholder questions | `codee-writing-questions` |
| New agent skill | `codee-skill-creator` |

`db-generate`, `db-migrate`, and `learning-medusa` are listed for completeness. The user
invokes them explicitly, so the router is not expected to match them on its own.
