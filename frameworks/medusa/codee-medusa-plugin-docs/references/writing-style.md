# Writing style

How the sentences of a README or a `docs/` page read. What goes in a table, a list or a code block is
`docs-folder.md`, "How a section is laid out"; this file is the prose around them.

## Contents

- [The voice](#the-voice)
- [Sentences](#sentences)
- [Punctuation](#punctuation)
- [Words](#words)
- [Text the product shows](#text-the-product-shows)
- [Check before you finish](#check-before-you-finish)

## The voice

The reader is a developer adding the plugin to a Medusa project. Write as a colleague who knows the
plugin well and explains it plainly.

- **Expert, but approachable.** Explain a hard topic in plain words and with an example. Never use a
  term to sound clever when a common word says the same.
- **Concrete.** A fact, a number, a config key or an example says more than an adjective.
- **A partner, not a mentor.** Say what happens and what to do. Leave out "simply", "just",
  "obviously", "of course", "easy" and "you should know".
- **No hype.** Never write "powerful", "seamless", "revolutionary", "best-in-class", "world-class",
  "cutting-edge", "game-changing", "robust" or "blazing fast". "Flexible", "complete" and
  "production-ready" appear only next to the fact that earns them.

## Sentences

- **Talk to the reader.** Use "you", the present tense and the active voice: "When you publish a
  document, the Store API serves it."
- **An action is a verb.** A sentence has a subject that does something, not an action turned into a
  noun:

  | Not | But |
  |---|---|
  | A save sends each area the editor changed. | When an editor saves, the Admin sends each area they changed. |
  | The start fails on a column naming no field. | Medusa does not start when a column names no field. |
  | A publish checks the required fields. | Publishing a document checks its required fields. |

- **One idea per sentence**, 25 words at most. Split a longer one, or make it a list.
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

- **One name per thing**, the one the product uses: the Admin, the Store API, a collection, a
  document, a field, a block type, a block, an area, a route, a singleton, a draft, a version.
- **An editor is a person** who edits content in the Admin. The tool is "the rich text editor".
- **The plugin is "the plugin"**; the app it runs in is "your project". A client's or a project's name
  never appears.
- **Medusa's terms as Medusa writes them**: module, data model, service, workflow, step, subscriber,
  scheduled job, Query, the File Module.
- **Code names in code spans**, exactly as the code spells them: `defineConfig`, `store.list`,
  `cms.document.updated`.
- **What the Admin shows in bold**, exactly as it shows it: **Publish**, **Save draft**, **Content**.

## Text the product shows

A button, a label or an error message is written in the code, under `codee-ui-copy`. A page quotes it
exactly, in a code span for a message and in bold for a label, and never rewords it. When a message
reads wrong, fix it in the code first, then quote the new text.

## Check before you finish

- Search the page for `;`, for ` - ` outside a list item's bold term, and for the words in "The voice".
- Read again every sentence over 25 words, and every sentence that starts with "A" followed by a verb
  turned into a noun: "A save", "A read", "A publish", "The start".
- Check that every "it" and "its" points at one noun.
