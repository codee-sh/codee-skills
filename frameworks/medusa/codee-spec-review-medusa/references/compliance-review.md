# Medusa Specification Compliance Review

Apply this matrix after the structural checklist from `codee-spec-writing`
passes.

| Rule | Source | Status | Notes |
|------|--------|--------|-------|
| No auth-sensitive values accepted from HTTP request params | Codee convention | PASS / FAIL / N/A | |
| All user-facing strings go through i18n, never hardcoded | Codee convention | PASS / FAIL / N/A | |
| The project build command is planned or verified at the required implementation checkpoints | AGENTS.md | PASS / FAIL / N/A | |
| Open Questions are removed or resolved before approval | Codee convention | PASS / FAIL / N/A | |
| Module name is camelCase | AGENTS.md | PASS / FAIL / N/A | |
| No PUT/PATCH methods | AGENTS.md | PASS / FAIL / N/A | |
| All mutations go through workflows | AGENTS.md | PASS / FAIL / N/A | |
| Routes do not call module services directly | AGENTS.md | PASS / FAIL / N/A | |
| Prices are not multiplied or divided by 100 | AGENTS.md | PASS / FAIL / N/A | |
| Imports are static | AGENTS.md | PASS / FAIL / N/A | |
| `transform()` handles data manipulation in workflows | AGENTS.md | PASS / FAIL / N/A | |
| `external_id` provides idempotency where required | AGENTS.md | PASS / FAIL / N/A | |
| All API inputs use Zod validation | AGENTS.md | PASS / FAIL / N/A | |
| Built-in Medusa workflows are preferred over custom workflows | Medusa guidance | PASS / FAIL / N/A | |
| `query.graph()` handles cross-module reads | AGENTS.md | PASS / FAIL / N/A | |
| `query.index()` handles cross-module filtering | AGENTS.md | PASS / FAIL / N/A | |

## Verdict

- **APPROVED** — Every rule passes or is explicitly `N/A` with justification.
- **CHANGES REQUIRED** — At least one rule fails or lacks enough evidence.

