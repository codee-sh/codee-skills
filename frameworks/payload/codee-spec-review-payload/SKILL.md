---
name: codee-spec-review-payload
description: Review Payload CMS and Next.js specifications against Codee technical compliance rules. Use when codee-spec-writing delegates the final technical review of a Payload spec or when the user explicitly requests a Payload spec compliance review.
---

# Payload Spec Review

Run the final technical compliance gate for a Payload CMS or Next.js
specification after its structural review is complete.

## Steps

1. Read the repository's `AGENTS.md` and follow its Task Router.
2. Read the specification and the code areas it references.
3. Apply [references/compliance-review.md](references/compliance-review.md).
4. Mark every rule as `PASS`, `FAIL`, or `N/A` with a short justification.
5. Fix spec-level violations when the requested scope authorizes spec edits.
6. Return `APPROVED` only when every rule passes or has a justified `N/A`.

Repository instructions override this skill when they define a more specific or
newer rule.

## Output Format

Return the completed compliance matrix, the verdict, and a concise list of
required changes when the verdict is `CHANGES REQUIRED`.

