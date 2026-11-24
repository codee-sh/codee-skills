# Listing: package metadata, npm, Medusa and GitHub

How a plugin is named and described, so a developer finds it on npm, Medusa can list it, and GitHub
shows the same words.

## Name

`@codee-sh/medusa-plugin-<domain>`: the domain in one or two plain words, the way a developer would
search for it - `cms`, `inpost`, `automations`, `notification-emails`. No brand names, no word repeated
(`content-cms` says "content" twice). The repository and its folder take the same
`medusa-plugin-<domain>`.

Choose it before the first publication. A published name cannot change: a new name is a new package,
and the old one is deprecated with `npm deprecate`. Check that it is free first:

```bash
npm view @codee-sh/medusa-plugin-<domain> name   # a 404 means it is free
npm view medusa-plugin-<domain> name             # an unscoped namesake confuses search
```

## `package.json`

```json
{
  "name": "@codee-sh/medusa-plugin-<domain>",
  "description": "<What it is> for Medusa v2: <the two or three things it gives a host>.",
  "keywords": [
    "medusa",
    "medusajs",
    "medusa-v2",
    "medusa-plugin",
    "medusa-plugin-integration",
    "medusa-plugin-<type>",
    "<search words>"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/codee-sh/medusa-plugin-<domain>.git"
  },
  "homepage": "https://github.com/codee-sh/medusa-plugin-<domain>#readme",
  "bugs": { "url": "https://github.com/codee-sh/medusa-plugin-<domain>/issues" },
  "license": "MIT",
  "author": "Codee"
}
```

- **`description`** - one sentence, under about 160 characters, starting with what the plugin is and
  naming Medusa v2. It is the single source: the GitHub description copies it word for word.
- **`keywords`**:
  - `medusa-v2` and `medusa-plugin-integration` are the two Medusa scrapes npm for to build its
    integrations listing.
  - Exactly one type keyword, from Medusa's list: `medusa-plugin-analytics`, `medusa-plugin-auth`,
    `medusa-plugin-cms`, `medusa-plugin-notification`, `medusa-plugin-payment`,
    `medusa-plugin-search`, `medusa-plugin-shipping`, or `medusa-plugin-other`.
  - `medusa`, `medusajs`, `medusa-plugin` for npm's own search.
  - Two to four words a developer types for the domain (`cms`, `headless-cms`; `email`,
    `notifications`). Not `plugin` alone, and not the package's own name, which npm already searches.
- **`repository`, `homepage`, `bugs`** - npm links to them from the package page; without them it
  links nowhere.
- Medusa compatibility is stated by `peerDependencies` on the `@medusajs/*` packages, and repeated in
  the README's Compatibility section.

## Medusa's integrations directory

From Medusa's documentation and the directory's announcement (checked 2026-11-24):

- Medusa scrapes npm for the two keywords above; the type keyword sorts the plugin into a category.
- The team reviews each plugin before it appears, and "primarily" features plugins that integrate a
  third-party service. A plugin that is a feature of its own still carries the keywords: it costs
  nothing, and the reviewers decide.
- To be featured: a clear description, relevant keywords, the Medusa versions it works with, and a
  public package on npm. There is no form to submit.

Sources: [Create a Plugin, "Package Keywords"](https://docs.medusajs.com/learn/fundamentals/plugins/create),
[Announcing the integrations directory](https://medusajs.com/blog/announcing-integrations-directory/).
Read them again before relying on a detail; the keyword list has changed between Medusa versions.

## GitHub repository

Set by hand when the repository is created, and kept in step with `package.json`:

- **Name:** `medusa-plugin-<domain>`, as the package and the folder.
- **Description:** `package.json` `description`, word for word.
- **Website:** the npm package page, once published.
- **Topics:** `medusa`, `medusajs`, `medusa-v2`, `medusa-plugin`, `typescript`, and the domain's
  search words from `keywords`.
- **Visibility:** public only when every commit in its history is free of client names and secrets;
  a repository built from a private one starts from a fresh history.

## Before the first publication

```bash
npm pack --dry-run
```

Check the name, the version, the description, the keywords and the file list (`files` in
`package.json`): the build, `index.d.ts`, the README, the licence - and nothing else.
