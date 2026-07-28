# Polish UI Copy Rules

Apply these rules only to Polish UI text.

## Contents

- [Preserve Polish Characters](#preserve-polish-characters)
- [Use Natural Polish](#use-natural-polish)
- [Use Sentence Case](#use-sentence-case)
- [Start Action Labels With a Verb](#start-action-labels-with-a-verb)
- [Avoid Decorative Punctuation](#avoid-decorative-punctuation)
- [Apply Punctuation by Surface](#apply-punctuation-by-surface)
- [Use User-Facing Names](#use-user-facing-names)
- [Keep the Form of Address Consistent](#keep-the-form-of-address-consistent)
- [Make Errors Actionable](#make-errors-actionable)
- [Keep Success Messages Focused](#keep-success-messages-focused)
- [Keep Empty States Useful](#keep-empty-states-useful)
- [Handle Counts With Plural Rules](#handle-counts-with-plural-rules)
- [Use Tooltips for Additional Context](#use-tooltips-for-additional-context)

## Preserve Polish Characters

Use Polish diacritics. Do not normalize Polish copy to ASCII.

Wrong:

`Zapisz zmiany pozniej`

Correct:

`Zapisz zmiany później`

## Use Natural Polish

Avoid literal English constructions and unnecessary anglicisms when an
established Polish term exists.

Wrong:

`Wykonaj zapisanie zmian`

Correct:

`Zapisz zmiany`

## Use Sentence Case

Use sentence case for headings, labels, buttons, and descriptions. Do not apply
English title case to Polish UI text.

Wrong:

`Dodaj Nowe Mapowanie`

Correct:

`Dodaj nowe mapowanie`

## Start Action Labels With a Verb

Buttons and menu actions should state the action directly.

Wrong:

`Mapowanie`

Correct:

`Dodaj mapowanie`

## Avoid Decorative Punctuation

Do not use em dashes, en dashes, decorative arrows, or ornamental symbols.
Rewrite the sentence or use plain words while preserving Polish characters.

Wrong:

`Tylko do odczytu — nie można edytować`

Correct:

`Tylko do odczytu. Nie można edytować.`

## Apply Punctuation by Surface

- Do not end buttons, labels, headings, or single-sentence descriptions with a
  period.
- End every sentence when a description contains multiple sentences.
- Use a question mark only for an actual question.

Wrong:

`Zapisz zmiany.`

Correct:

`Zapisz zmiany`

## Use User-Facing Names

Replace internal identifiers and unexplained abbreviations with the term users
recognize.

Wrong:

`Nieprawidłowe sales_org_id`

Correct:

`Wybierz prawidłową organizację sprzedaży`

## Keep the Form of Address Consistent

Prefer neutral phrasing unless the project explicitly defines formal or
informal direct address.

Wrong:

`Musisz podać adres e-mail`

Correct:

`Podaj adres e-mail`

## Make Errors Actionable

State what went wrong and, when possible, what the user can do next. Do not
blame the user.

Wrong:

`Wprowadzono błędne dane`

Correct:

`Podaj prawidłowy adres e-mail`

## Keep Success Messages Focused

Confirm the completed outcome without unnecessary filler.

Wrong:

`Proces zapisywania zmian zakończył się pomyślnie`

Correct:

`Zmiany zapisano`

## Keep Empty States Useful

State what is unavailable. Add a next action only when the user can resolve the
empty state.

Wrong:

`Nic tu nie ma`

Correct:

`Brak mapowań`

If an action is available:

`Brak mapowań. Dodaj mapowanie, aby rozpocząć.`

## Handle Counts With Plural Rules

Use the project's pluralization mechanism. Do not build Polish count messages
by concatenating a number with one fixed noun form.

Wrong:

`1 elementy`

Correct:

`1 element`

Wrong:

`5 elementy`

Correct:

`5 elementów`

## Use Tooltips for Additional Context

Do not repeat the visible label. Explain an unfamiliar control, constraint, or
consequence.

Wrong:

Label: `Archiwizuj`

Tooltip: `Archiwizuj`

Correct:

Label: `Archiwizuj`

Tooltip: `Ukryj element bez jego usuwania`
