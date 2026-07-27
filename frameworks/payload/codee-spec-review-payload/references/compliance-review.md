# Payload Specification Compliance Review

Apply this matrix after the structural checklist from `codee-spec-writing`
passes.

| Rule | Source | Status | Notes |
|------|--------|--------|-------|
| No auth-sensitive values accepted from HTTP request params | Codee convention | PASS / FAIL / N/A | |
| All user-facing strings go through i18n, never hardcoded | Codee convention | PASS / FAIL / N/A | |
| The project build command is planned or verified at the required implementation checkpoints | AGENTS.md | PASS / FAIL / N/A | |
| Open Questions are removed or resolved before approval | Codee convention | PASS / FAIL / N/A | |
| New collections are registered in `payload.config.ts` and exported from `collections/index.ts` | AGENTS.md | PASS / FAIL / N/A | |
| Schema changes include migration generation and application | AGENTS.md | PASS / FAIL / N/A | |
| Schema changes include generated type updates | AGENTS.md | PASS / FAIL / N/A | |
| `overrideAccess: true` appears only in server-side loaders, never client-side handlers | Security convention | PASS / FAIL / N/A | |
| Auth-sensitive IDs come from persisted documents, not HTTP request params | Security convention | PASS / FAIL / N/A | |
| Every collection explicitly defines create, read, update, and delete access | Codee convention | PASS / FAIL / N/A | |
| Custom admin components are added to the import map | Payload guidance | PASS / FAIL / N/A | |
| User-facing strings update the project's required locale files | Codee convention | PASS / FAIL / N/A | |

## Verdict

- **APPROVED** — Every rule passes or is explicitly `N/A` with justification.
- **CHANGES REQUIRED** — At least one rule fails or lacks enough evidence.

