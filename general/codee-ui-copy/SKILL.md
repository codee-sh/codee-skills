---
name: codee-ui-copy
description: Create or review user-facing UI text in Polish or English using Codee language-specific copy rules. Use for labels, buttons, headings, descriptions, placeholders, validation messages, notifications, empty states, and tooltips.
---

# UI Copy

Prevent recurring copy mistakes when creating or revising text shown to users.

## Workflow

1. Determine the target language from the request, repository instructions,
   translation file, locale, and neighboring copy.
2. Load the matching rules:
   - English: [references/rules-en.md](references/rules-en.md)
   - Polish: [references/rules-pl.md](references/rules-pl.md)
   - Both languages: load both files
3. Read adjacent UI text and relevant specs to identify established terminology,
   tone, and capitalization.
4. Create or revise the copy using the shared rules and the selected
   language-specific rules.
5. Check every changed string before returning or applying it.

If the language remains ambiguous and the choice changes the result, ask which
locale is required.

## Shared Rules

- Be clear, direct, neutral, and concise.
- Use established domain terminology consistently.
- Do not expose internal identifiers, implementation details, or developer
  terminology unless users need them.
- Preserve interpolation variables, markup, and formatting tokens exactly.
- Write complete translatable messages instead of concatenated sentence
  fragments.
- Do not rename translation keys or change i18n integration unless the task
  explicitly requires it.
- Give icon-only controls and other non-text controls an accessible name.
- Do not use a tooltip as a substitute for a required visible label.

## Final Check

- The correct language rules were applied.
- The wording matches neighboring UI and project terminology.
- The user can understand what happened and what action is available.
- Dynamic values still fit grammatically.
- No placeholder, variable, markup, or translation key changed accidentally.

## Output

When creating copy, return the final strings in the requested structure.

When reviewing copy, provide the corrected version first. Explain corrections
briefly only when the rationale is useful or the user asks for it.
