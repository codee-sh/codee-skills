---
name: codee-medusa-plugin-docs
description: What a Medusa plugin says to the people who install it - the README, the `docs/` folder, the package's name, description and keywords in `package.json`, the listing on npm and in Medusa's integrations directory, and the GitHub repository's description and topics. Use it whenever a plugin's README or a `docs/` page is written, restructured or reviewed, when a feature or a config option needs documenting, when a plugin is named or renamed, when its `description`, `keywords`, `repository`, `homepage` or `bugs` change, and before a plugin's first publication. Trigger on "write the README", "document this option", "add a docs page", "split the README", "npm keywords", "how will Medusa find the plugin", "GitHub description", "topics", "rename the package". Only for a Medusa plugin; the release tooling and the text of a changeset are codee-medusa-plugin-delivery.
---

# Medusa Plugin Docs

Every Codee plugin presents itself the same way: a short README that gets someone from "what is this"
to a running plugin, one `docs/` page per topic behind it, and package metadata that npm and Medusa can
find. This skill holds that shape. How the plugin is released and published, and the changesets that
become its release notes, are `codee-medusa-plugin-delivery`.

## When to use

- A README or a `docs/` page is written, restructured, reviewed or grows past its topic.
- A feature, a config option, an export or a route a host uses needs documenting.
- A plugin is named or renamed, or its `package.json` metadata changes.
- A plugin is about to be published for the first time, or its GitHub repository is created.

## What lives where

| Topic | Reference |
|---|---|
| `README.md`: its sections, their order, what stays out | `references/readme.md` |
| `docs/`: one topic per file, names, links, moving text out of the README | `references/docs-folder.md` |
| `package.json` name, description, keywords and links; npm, Medusa's directory, GitHub | `references/listing.md` |

## Steps

1. **Read what is there**: `README.md`, `docs/`, `package.json` (`name`, `description`, `keywords`,
   `exports`, `peerDependencies`, `engines`), and the README of the most recently updated
   Codee plugin as the working example. Run `git status` and keep what the user changed.
2. **Load only the reference the task needs.** A new option touches `docs-folder.md`, and `readme.md`
   only when it changes the Features list.
3. **Write for the plugin's user**, a developer installing it into a Medusa project: the config keys,
   exports, routes, events and Admin screens they meet. Internal file names, spec numbers and the
   name of any client project stay out.
4. **Move before you rewrite.** Text that changes place moves word for word in its own commit, and
   is edited after, so the diff of the move is reviewable.
5. **Check**: every relative link and anchor resolves, each code example matches the current exports
   and config types, every image, video, aside and HTML tag is one `references/docs-folder.md`, "What a
   page may hold", allows, and the README still follows `references/readme.md`.

## Output format

The edited `README.md`, `docs/*.md` or `package.json` fields, uncommitted, and a
short report: what changed, what moved, and any text the user sets by hand (the GitHub description and
topics).
