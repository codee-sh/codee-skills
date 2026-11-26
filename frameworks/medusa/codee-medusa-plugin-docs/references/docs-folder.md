# The docs folder

`docs/` holds one page per topic a host developer looks up after the basic setup works. The README
links to every page; a page links to the README only for installation and setup, never repeats it.

## Pages

Use these names when the topic exists, so every plugin has the same map. Add a page of your own for a
topic none of them covers, named after the topic in kebab case.

| Page | Holds |
|---|---|
| `configuration.md` | Every plugin option: its key, type, default, and what it changes, with one full `medusa-config.ts` example. |
| `admin.md` | What the Admin screens let an editor do, and how a host extends them (widgets, zones, routes). |
| `translations.md` | The languages shipped, how a host overrides a text, and the namespace or key it overrides by. |
| `tests.md` | How the plugin's tests run and where a new one goes. For contributors. |
| `development.md` | Running the plugin linked into a project with `yarn dev` and yalc. For contributors. |
| `contributing/<topic>.md` | A contributor's guide to extending the plugin itself, such as adding a template. |
| `images/` | Screenshots and other images the pages show. |
| `media/` | Videos the pages show. |

Contributor pages (`tests.md`, `development.md`, `contributing/`) are linked from `CONTRIBUTING.md` as
well as from the README's Documentation list.

A folder of pages, such as `contributing/` or `guides/`, groups the pages of one theme; its `index.md`,
when it has one, introduces the folder. A page and a folder of the same name (`guides.md` beside
`guides/`) never both exist.

## A page

- Starts with `# <Topic>` and one sentence saying what the page covers and what it leaves to which page.
- One topic. When a page explains two things a reader looks up apart, split it.
- Sections answer the reader's questions in the order they arise: what it is, how to turn it on, the
  options, an example, the edge cases.
- Code examples use the package's public entry points and the current config types; an example that no
  longer compiles is a bug.
- Links are relative (`./configuration.md#subscribers`); an anchor is the heading's GitHub slug.
- A rule is explained in one page and linked from the others, never copied.

## How a section is laid out

A reader scans for the option, the shape or the error they need. Prose explains; a table, a list or a
code block holds what they look up.

- **Opening.** One to three sentences on what the feature is and what it is for, then the smallest
  example that works, before any option.
- **Options.** A table, one row per key: `| Option | Type | Default | Description |`, the description one
  sentence. An option that needs an example, or more than two sentences, gets a `###` of its own below
  the table.
- **The values of an option** are a list, each value in bold code: ``- **`"create"`** - adds a document``.
- **A data shape** - a config object, a request body, a response, a stored value - is a code block,
  never a sentence: a `ts` block for its type, a `json` block for an example value. Name the exported
  type when there is one; the prose after the block says what its parts mean.
- **A function** gets a `###` with its call, such as ``### `parseRichText(value)` ``, one sentence on what
  it returns, an example, and its edge cases. Several small helpers can share a table:
  `| Function | Returns | Description |`.
- **What fails** is a list under its own heading, such as `### When the start fails`: one case per item,
  the condition first, then the message in a code span and the HTTP status when there is one.
- **An aside** is a GitHub alert: `[!NOTE]` for what matters but is not critical, `[!WARNING]` for lost
  data or a trap. A section has one or two at most.
- **Sentences** stay under 30 words; a sentence with more than two commas becomes a list. A paragraph
  holds one idea, about 60 words at most, and a list item one or two sentences.
- **Headings** come every 200 to 300 words and name the thing or the task, in sentence case. Another
  page links to a heading by its slug: a renamed heading takes every link to it along.
- **Code blocks** always name their language. Code from a file starts with a comment naming it,
  `// src/cms/config.ts`, and `// ...` marks what is left out.

## What a page may hold

A page, and the README, is GitHub Markdown, with no front matter and no MDX: a docs site can be built
from it, as mostrajs.com builds the CMS docs, and it then renders the same on GitHub, on npm and on the
site.

- **An image** is a relative link to a file under `docs/images/`: `![The collection form](./images/collection-form.png)`.
  PNG, JPEG, GIF, WebP, AVIF or SVG.
- **A video** is an HTML tag, as Markdown has no syntax for one: `<video src="./media/demo.mp4" controls></video>`,
  with the file under `docs/media/`, as MP4 (H.264) or WebM. Keep it short: every clone of the
  repository carries it. A video uploaded to GitHub, by dropping it into the file's editor there, goes
  in with its `https://github.com/user-attachments/...` address as the `src`.
- **An aside** is a GitHub alert, one of `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` and
  `[!CAUTION]`, never nested in a list or another quote:

  ```markdown
  > [!WARNING]
  > Deleting a model deletes its entries.
  ```

- **HTML** is limited to `a`, `br`, `details`, `div`, `img`, `kbd`, `p`, `picture`, `source`, `sub`,
  `summary`, `sup` and `video`, with quoted attribute values and no `class`, `id` or `style`, which
  GitHub strips.
- **A component, a type or a tag named in prose** goes in a code span: `` `<Container>` ``,
  `` `Map<string, Field>` ``. Bare, GitHub drops it as unknown HTML.
- **An HTML comment** (`<!-- -->`) holds a note for maintainers only; neither GitHub nor the site shows
  it.

## Moving text out of the README

When a README carries guides, split it before adding more:

1. Map each README section to a page, in a table, before moving anything.
2. Move the sections word for word into their pages, in one commit with no edits, so the diff shows
   text only changing place.
3. In the same commit, rewrite the links the move broke: README anchors become page links.
4. Edit the moved text afterwards, in its own commit.
5. Check that every relative link and anchor in `README.md`, `CONTRIBUTING.md` and `docs/` resolves.
