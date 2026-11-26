---
name: codee-technical-writing
description: How the prose of English text that explains something reads - a documentation page, a plugin's README and docs/, an Admin guide, a how-to - its voice, its sentences, its punctuation and its words, and how it quotes the text a product shows. Use whenever such prose is written, rewritten or reviewed, together with the skill or file that says what the text holds and who reads it (codee-medusa-plugin-docs for a plugin's docs, the guide's own README for an Admin guide). Trigger on "rewrite this page", "this reads badly", "fix the wording", "proofread the docs", "make the guide clearer", "write a docs page", "review the README text", "too many semicolons". Not for the text an interface shows, which is codee-ui-copy, nor for marketing copy, whose voice lives in the brand's repository.
---

# Technical Writing

How the sentences of a text that explains something read. What the text holds, who reads it and the
terms of its product come from the skill or file of that text: `codee-medusa-plugin-docs` for a
plugin's README and `docs/`, the guide's README for an Admin guide. This skill is the prose around
that content.

## When to use

- A documentation page, a README or a guide page is written, rewritten or reviewed.
- A reader or the user says a text reads badly, is hard to follow or is full of semicolons.
- Prose is checked before a docs change is committed.

## Steps

1. **Read what the text is for**: its audience, its terms and its layout, from the skill or file that
   owns it. That file wins where it is more specific, such as the imperative of a task guide.
2. **Write by the rules below.**
3. **Run the check** at the end of this file on every page you touched.

## The voice

- **Expert, but approachable.** Explain a hard topic in plain words and with an example. Never use a
  term to sound clever when a common word says the same.
- **Concrete.** A fact, a number, a key, a screen or an example says more than an adjective.
- **A partner, not a mentor.** Say what happens and what to do. Leave out "simply", "just",
  "obviously", "of course", "easy" and "you should know".
- **No hype.** Never write "powerful", "seamless", "revolutionary", "best-in-class", "world-class",
  "cutting-edge", "game-changing", "robust" or "blazing fast". "Flexible", "complete" and
  "production-ready" appear only next to the fact that earns them.

## Sentences

- **Talk to the reader.** Use "you", the present tense and the active voice: "When you publish a
  page, the store shows it."
- **An action is a verb.** A sentence has a subject that does something, not an action turned into a
  noun:

  | Not | But |
  |---|---|
  | A save sends each area the editor changed. | When an editor saves, the Admin sends each area they changed. |
  | The start fails on a column naming no field. | Medusa does not start when a column names no field. |
  | A publish checks the required fields. | Publishing a page checks its required fields. |

- **The passive only when the actor does not matter**, or when several actors can do it: "until the
  link is fixed" fits a write that may come from an editor or from code.
- **One idea per sentence**, 25 words at most. Split a longer one, or make it a list. A sentence with
  more than two commas is usually a list.
- **One idea per paragraph**, about 60 words at most.
- **No semicolons.** Write two sentences, or a list.
- **Name the thing.** When "it" or "its" could point at two nouns, repeat the noun. Never chain
  possessives: "the fields of the block's model", not "its model's fields".
- **Plain word order**: subject, verb, object. Not "A block whose type its area no longer takes, as the
  config changed, stays in place", but "When you remove a block type from an area, its blocks stay in
  place."
- **The condition first** when the sentence depends on it: "If the collection has drafts, ...".
- **A term is explained where it first appears**, in a clause or a link to the page that explains it.

## Punctuation

- **A comma before the last item** of a list in a sentence: "a page, a block, and an area".
- **A colon** introduces a list, an example or a code block, and nothing else.
- **No dash in prose**: no ` - `, en dash or em dash. Use a comma, parentheses or a new sentence. The
  one exception is the ` - ` after a bold term that opens a list item: ``- **`"drawer"`** - edits the
  row over the table``.
- **ASCII only**: straight quotes, no arrows, no ellipsis character, no emoji.
- **Headings** are in sentence case and end without a period.
- **A list item** that is a full sentence ends with a period; a fragment does not. The items of one
  list are all one or the other.

## Words

- **One name per thing**, the one the product uses, the same on every page. The owning skill or file
  lists them.
- **Code names in code spans**, exactly as the code spells them: `defineConfig`, `store.list`.
- **What a screen shows in bold**, exactly as it shows it: **Publish**, **Save draft**.

## Text the product shows

A button, a label or an error message is written in the code, under `codee-ui-copy`. A page quotes it
exactly, in a code span for a message and in bold for a label, and never rewords it. When a message
reads wrong, fix it in the code first, then quote the new text.

## Check before you finish

- Search each page for `;`, for ` - ` outside a list item's bold term, and for the words in "The
  voice".
- Read again every sentence over 25 words, and every sentence that opens with a verb turned into a
  noun: "A save", "A read", "A publish", "The start".
- Check that every "it" and "its" points at one noun.
- Compare a rewritten page with its version before: no fact is dropped, changed or added.
