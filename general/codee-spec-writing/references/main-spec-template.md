# Main Spec Template

Use this template for the stable source of truth of one module or initiative. Keep implementation detail in linked sub-specs.

```md
# {Module / Initiative Title}

**Date:** YYYY-MM-DD
**Status:** review | active | decided
**Area:** backend | frontend | integration | device | tooling | cross-cutting

> Folder: `.ai/specs/{module-name}/`

## TLDR

{What the initiative changes, why it matters, and for whom.}

## Open Questions

> Include only while critical decisions are unresolved. Remove before approval.

- Q1. {Short decision-oriented question}

## Scope

### In scope

- {capability or boundary}

### Out of scope

- {explicit exclusion}

## Architecture

{Stable component boundaries, ownership, data flow, canonical mechanisms reused, and cross-cutting decisions. Link to sub-specs for details.}

## Evidence and References

- `{repo path}` - {what it proves or constrains}
- [{authoritative external source}]({url}) - {decision it supports}

## Active Sub-specs

- [sub-{topic}](./YYYY-MM-DD-sub-{topic}.md) - {one independently deliverable capability}

## Ended Sub-specs

- [ended/sub-{topic}](./ended/YYYY-MM-DD-sub-{topic}.md) - {closed capability}

## Implementation Order

1. {Sub-spec/dependency order and why}
2. {Sub-spec/dependency order and why}

## Risks and Cross-cutting Concerns

| Risk / failure scenario | Severity | Affected area | Mitigation | Residual risk |
|---|---|---|---|---|
| {concrete scenario} | low / medium / high / critical | {area} | {prevention/recovery} | {what remains} |

## Current Status

- `{status}` - {current initiative-level state}

## Short Changelog

- YYYY-MM-DD - {material decision, scope change, or lifecycle change}
```

Remove the Open Questions section once resolved. Omit an empty changelog, but retain the other sections and keep them concise.
