# Changesets

A changeset is the release note a host developer reads before upgrading. `changeset version` copies it
into `CHANGELOG.md`, the release workflow copies that section into the GitHub release, and
`yarn pr:create` uses its first paragraph as the PR summary when there is no PR description. Write it
for all three. When a changeset is owed and which bump it takes is `codee-medusa-plugin-delivery`,
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

- The first paragraph is one sentence and stands alone: the PR summary and the changelog's lead line.
- Use only the groups that apply, in this order. A small change is the first sentence alone.
- A change that asks something of the host goes under **Behaviour changes** with the code to write,
  and is repeated in the README's `Upgrading` section for the latest such release.
- Name what the host meets: config keys, exports, routes, events, Admin labels in bold. Leave out
  internal files, functions, tables the host never touches, spec names and client names.
- Say what happens, in the present tense: "The subscribers are opt-in", not "Made the subscribers
  opt-in".

## One changeset for a release

Changesets pile up between releases, one per user-facing change. When they describe the same feature
in steps - before a first release above all, where the reader has never seen the earlier steps - merge
them into one before `yarn prepare-release`:

1. Read every pending changeset and group its points under **Features**, **Fixes** and **Behaviour
   changes**, by what the host meets, not by the order they were written.
2. Drop what a later changeset undid or replaced; a first release has no behaviour changes, only
   features.
3. Write one changeset with the highest bump among them, delete the others, and commit both together.

For a first release, the **Features** group reads like the README's Features list, at more detail.
