# Default Agent Template

Copy this section into the repository's agent instruction file. Remove rows for
skills that are not installed or relevant.

## Skill Router

Match every applicable row before acting. Use all listed skills; report any
unavailable skill.

| Task | Skills |
|------|--------|
| Bug report, before proposing or writing a fix | `codee-root-cause` |
| TypeScript implementation or review | `codee-ts-code-conventions` |
| User-facing UI text | `codee-ui-copy` |
| Write or restructure specifications | `codee-spec-writing` |
| Cross-cutting working notes | `codee-spec-notes` |
| Pull request description | `codee-generate-pr-description` |
| Client or stakeholder questions | `codee-writing-questions` |
| New agent skill | `codee-skill-creator` |
| Configure or re-configure the agent pipeline | `codee-setup-agent-pipeline` |
