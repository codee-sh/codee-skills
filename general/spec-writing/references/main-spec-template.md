# Main Spec Template

Use this template for the stable source-of-truth document of one module or initiative.

```md
# {Module / Initiative Title}

**Date:** YYYY-MM-DD
**Status:** review | active | decided
**Area:** backend | frontend | integration | device | tooling

> Folder: `.ai/specs/{module-name}/`

## TLDR

{1-3 short paragraphs}

## Scope

- in
- out

## Architecture

{short description}

## Folder References

- main spec: `./YYYY-MM-DD-main-spec.md`
- active sub-specs live in the same folder
- optional working notes: `./notes.md`
- closed sub-specs move to `./ended/`

## Active Sub-specs

- [sub-collection-reuse](./YYYY-MM-DD-sub-collection-reuse.md) - {one-line purpose}
- [sub-diagnostics-refresh](./YYYY-MM-DD-sub-diagnostics-refresh.md) - {one-line purpose}

## Ended Sub-specs

- [ended/sub-reader-pairing](./ended/YYYY-MM-DD-sub-reader-pairing.md) - {one-line purpose}

## Implementation Order

1. {dependency / ordering note}
2. {dependency / ordering note}

## Current Status

{2-5 short bullets or a short paragraph}

## Short Changelog

- YYYY-MM-DD - {major decision}
```
