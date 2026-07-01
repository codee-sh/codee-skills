# Spec Checklist

Apply this before finalizing a spec written with `spec-writing`.

## Structure

- [ ] Correct spec type chosen: main spec vs sub-spec
- [ ] Spec is in the correct module folder
- [ ] Filename follows the convention: `YYYY-MM-DD-main-spec.md` or `YYYY-MM-DD-sub-{focused-topic}.md`
- [ ] Spec is short enough for its type
- [ ] Repeated detail was replaced by references where possible
- [ ] Exploratory thoughts were kept in `notes.md` when they were not yet decisions or active scope

## Main Spec Checks

- [ ] Scope is clear
- [ ] Architecture is described at a high level only
- [ ] Folder references are clear
- [ ] Active sub-specs are linked
- [ ] Active sub-specs list contains only still-relevant work
- [ ] Implementation order explains dependencies between sub-specs
- [ ] No large operational tracker is embedded here

## Sub-spec Checks

- [ ] Problem is specific
- [ ] Target behavior is explicit
- [ ] Required changes name concrete code areas
- [ ] Acceptance criteria are testable
- [ ] Short Tracker is small and active-work only
- [ ] Sub-spec does not restate module-level architecture already covered by the main spec

## Status Hygiene

- [ ] `done` means implemented in code, not just planned
- [ ] `in_progress` is not used for already-finished foundational work
- [ ] Closed sub-specs are good candidates for the module-local `ended/`
- [ ] `notes.md` is not being used as a hidden tracker or source of truth

## Brevity

- [ ] No long historical narrative
- [ ] Changelog, if present, is short
- [ ] Implementation order does not duplicate the tracker
