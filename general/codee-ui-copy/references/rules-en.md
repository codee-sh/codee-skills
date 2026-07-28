# English UI Copy Rules

Apply these rules only to English UI text.

## Contents

- [Use Natural English](#use-natural-english)
- [Use Sentence Case](#use-sentence-case)
- [Start Action Labels With a Verb](#start-action-labels-with-a-verb)
- [Avoid Decorative Punctuation](#avoid-decorative-punctuation)
- [Apply Punctuation by Surface](#apply-punctuation-by-surface)
- [Use User-Facing Names](#use-user-facing-names)
- [Make Errors Actionable](#make-errors-actionable)
- [Keep Success Messages Focused](#keep-success-messages-focused)
- [Keep Empty States Useful](#keep-empty-states-useful)
- [Use Tooltips for Additional Context](#use-tooltips-for-additional-context)

## Use Natural English

Prefer direct, idiomatic English over literal translations and internal
terminology.

Wrong:

`Perform creation of a new mapping`

Correct:

`Create mapping`

## Use Sentence Case

Use sentence case for headings, labels, buttons, and descriptions. Capitalize
proper nouns and established product names normally.

Wrong:

`Save Changes`

Correct:

`Save changes`

## Start Action Labels With a Verb

Buttons and menu actions should name the action they perform.

Wrong:

`Mapping`

Correct:

`Add mapping`

## Avoid Decorative Punctuation

Do not use em dashes, en dashes, decorative arrows, or ornamental symbols.
Rewrite the sentence or use plain words.

Wrong:

`Read-only — cannot be edited`

Correct:

`Read-only. Cannot be edited.`

## Apply Punctuation by Surface

- Do not end buttons, labels, headings, or single-sentence descriptions with a
  period.
- End every sentence when a description contains multiple sentences.
- Use a question mark only for an actual question.

Wrong:

`Save changes.`

Correct:

`Save changes`

## Use User-Facing Names

Replace internal identifiers and unexplained abbreviations with the term users
recognize.

Wrong:

`Invalid sales_org_id`

Correct:

`Select a valid sales organization`

## Make Errors Actionable

State what went wrong and, when possible, what the user can do next. Do not
blame the user.

Wrong:

`You entered invalid data`

Correct:

`Enter a valid email address`

## Keep Success Messages Focused

Confirm the completed outcome. Do not restate the entire action flow.

Wrong:

`The process of saving your changes has been completed successfully`

Correct:

`Changes saved`

## Keep Empty States Useful

State what is unavailable. Add a next action only when the user can resolve the
empty state.

Wrong:

`Nothing here`

Correct:

`No mappings yet`

If an action is available:

`No mappings yet. Add a mapping to get started.`

## Use Tooltips for Additional Context

Do not repeat the visible label. Explain an unfamiliar control, constraint, or
consequence.

Wrong:

Label: `Archive`

Tooltip: `Archive`

Correct:

Label: `Archive`

Tooltip: `Hide this item without deleting it`
