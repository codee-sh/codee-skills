# Payload Agent Template

Copy this section into the repository's agent instruction file. Remove rows for
skills that are not installed or relevant.

## Skill Router

Match every applicable row before acting. Use all listed skills; report any
unavailable skill.

| Task | Skills |
|------|--------|
| Payload API, field, hook, query, or debugging | `codee-payload` |
| New Payload collection or data type | `codee-payload-build-collections` |
| Payload Admin view or field component | `codee-payload-build-modules` |
| Next.js frontend component or page | `codee-payload-frontend-build-components` |
| Payload best-practices audit | `codee-payload-review` |
| Payload security audit or hardening | `codee-payload-security` |
| Bug report, before proposing or writing a fix | `codee-root-cause` |
| TypeScript implementation or review | `codee-ts-code-conventions` |
| User-facing UI text | `codee-ui-copy` |
| Write or restructure specifications | `codee-spec-writing` |
| Review a Payload or Next.js specification | `codee-spec-review-payload` |
| Cross-cutting working notes | `codee-spec-notes` |
| Non-obvious finding worth recording, or looking one up | `codee-lessons` |
| Pull request description | `codee-generate-pr-description` |
| Client or stakeholder questions | `codee-writing-questions` |
| New agent skill | `codee-skill-creator` |
| Configure or re-configure the agent pipeline | `codee-setup-agent-pipeline` |
