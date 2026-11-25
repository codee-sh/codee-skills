# Medusa Plugin Agent Template

Copy this section into a Medusa plugin repository's agent instruction file. Remove rows for skills that
are not installed or relevant. The plugin's rules - public contract, dependencies, `yarn dev`, who runs
what - come from `codee-medusa-plugin-delivery`, `references/agents-rules.md`.

A plugin has no storefront, no `src/scripts` and no hosting of its own, so the storefront, scripts,
client-questions and Cloud skills are left out.

## Skill Router

Match every applicable row before acting. Use all listed skills; report any
unavailable skill.

| Task | Skills |
|------|--------|
| Medusa backend | `codee-medusa-backend` |
| Medusa Admin UI, including forms, and where a file goes in `src/admin` | `codee-medusa-admin-dashboard` |
| Bug report, before proposing or writing a fix | `codee-root-cause` |
| TypeScript implementation or review, naming a function or a file, placing a helper | `codee-ts-code-conventions` |
| Any Medusa backend file - where it goes, what it is named, its JSDoc - and the plain functions beside it | `codee-medusa-backend-conventions` |
| Test for a Medusa step, workflow, module, API route, or util | `codee-medusa-testing` |
| Plugin tooling, release, npm publication, CI, integration test app, yalc, changeset text | `codee-medusa-plugin-delivery` |
| Plugin README, `docs/` pages, package name, description and keywords, GitHub description and topics | `codee-medusa-plugin-docs` |
| User-facing UI text | `codee-ui-copy` |
| Write or restructure specifications | `codee-spec-writing` |
| Review a Medusa specification | `codee-spec-review-medusa` |
| Working notes, including exploration for one spec module | `codee-spec-notes` |
| Non-obvious finding worth recording, or looking one up | `codee-lessons` |
| Pull request description | `codee-generate-pr-description` |
| New agent skill | `codee-skill-creator` |
