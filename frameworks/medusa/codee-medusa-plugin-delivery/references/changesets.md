# Changesets

A changeset is the release note a host developer reads before upgrading. The release PR
(`chore: release`) shows it as the next `CHANGELOG.md` section, the merge of that PR makes the section
the body of the GitHub release, and `yarn pr:create` uses its first paragraph as the PR summary when
there is no PR description. Write it for all three. When a changeset is owed and which bump it takes is
`references/sdlc.md`.

## Shape

```markdown
---
"@codee-sh/medusa-plugin-<domain>": minor
---

<One sentence: what a host can now do, or what changed for them.>

**Behaviour changes - read before upgrading**
- <What behaves differently, and the exact change to make, with code.>

**Fixes**
- <What was wrong, as the host saw it.>

**Features**
- <What is new: the option, export, route or screen, by its public name.>
```

- The first paragraph is one sentence on one line and stands alone: the PR summary and the changelog's
  lead line.
- Use only the groups that apply, in this order. A small change is the first sentence alone.
- A change that asks something of the host goes under **Behaviour changes** with the code to write,
  and is repeated in the README's `Upgrading` section for the latest such release.
- Name what the host meets: config keys, exports, routes, events, Admin labels in bold. Leave out
  internal files, functions, tables the host never touches, spec names and client names.
- Say what happens, in the present tense: "The subscribers are opt-in", not "Made the subscribers
  opt-in".

## How it renders

`@changesets/changelog-github` turns each changeset into one bullet under its bump's heading
(`### Minor Changes`, `### Patch Changes`):

```markdown
- [#12](https://github.com/<owner>/<repo>/pull/12) [`a1b2c3d`](https://github.com/<owner>/<repo>/commit/a1b2c3d) Thanks [@login](https://github.com/login)! - <the first line>

  <every later line, indented under the bullet>
```

- Only the first line follows the links; keep the lead sentence on it.
- The rest stays inside the bullet. Bold labels and nested bullets render there, a heading does not read
  as one, so the groups are bold labels, as in the shape above.
- `#123` and `@login` in the text become links.
- The links come from the commit that added the changeset, looked up on GitHub when the release PR is
  built; a commit merged through a PR links that PR. A line `pr: 12`, `commit: <sha>` or
  `author: <login>` of its own overrides the lookup.

## One changeset for a release

Changesets pile up between releases, one per user-facing change. When they describe the same feature
in steps - before a first release above all, where the reader has never seen the earlier steps - merge
them into one before the release PR is merged:

1. Read every pending changeset and group its points under **Features**, **Fixes** and **Behaviour
   changes**, by what the host meets, not by the order they were written.
2. Drop what a later changeset undid or replaced; a first release has no behaviour changes, only
   features.
3. Write one changeset with the highest bump among them, delete the others, and commit both together.

## The first release

Its reader has seen none of the steps, so its one changeset introduces the plugin, and it becomes the
first GitHub release:

- The first line says what the plugin is and what a host gets from it.
- **Features**, grouped by area in nested bullets, reads like the README's Features list, at more detail.
- **Getting started** - the install command, the `plugins` entry and the smallest config - in a few
  lines, ending with a link to the README.
- **Documentation** - a link to each `docs/` page, by its title.

It is a `minor` from `0.0.x`, so the first version is `0.1.0`; no **Behaviour changes** or **Fixes**.
