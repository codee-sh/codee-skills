# SDLC.md for a Medusa plugin

The template of a plugin's `SDLC.md`. Copy the block below, resolve the `<...>` placeholders, and keep the
sentence of each `<!-- IF ... -->` block that matches the repository, removing the markers.

````markdown
# Software delivery process

## Purpose

This file documents how work reaches `develop` and is released to `main` in this repository, and how the
plugin is published. Humans read the process here; the agent rules are in [AGENTS.md](AGENTS.md).

This repository runs the process **without autonomous agents**. No skill claims work, commits, or merges on
its own; every outward action is taken by a human or after explicit approval, per `Ask First` in
[AGENTS.md](AGENTS.md).

## Roles

- **Author** - the human or agent who writes the change.
- **Reviewer** - reads the diff before the commit. The rules in [CODE_REVIEW.md](CODE_REVIEW.md) apply
  whether the reviewer is a human or a skill.
- **Maintainer** - owns this document, and decides when the plugin is released and published.

## Work lifecycle

| Stage | What happens | Driven by | Done when |
|---|---|---|---|
| Shaping | An idea is talked through before anything is built: the problem is questioned, alternatives are weighed, and the conversation ends in a decision. Non-trivial work gets a spec. | A human, `codee-spec-writing` | A decision, or a spec draft |
| Spec review | The spec is checked structurally, then against Medusa-specific technical rules. | `codee-spec-writing` review, then `codee-spec-review-medusa` | Spec approved |
| Implement | On a topic branch, locate the minimal change surface, then implement with the test the change owes and run the validation gate. | `codee-root-cause` for a bug, then `codee-medusa-testing` for the test layer | Gate passes |
| Verify in a project | With `yarn dev` running, walk through the change in a project linked through yalc. | A human | Works in the project |
| Review | Read the diff against [CODE_REVIEW.md](CODE_REVIEW.md) while it is still uncommitted. | A human, or a skill | No blocker left |
| Land | Commit on the topic branch and merge it into `develop` when asked, with a changeset for a user-facing change. | A human | Merged into `develop` |

## Definition of Ready

Work is ready when these answers are in its brief or a spec it links:

- the problem or need, and who has it;
- the expected outcome, and how it will be checked;
- what is out of scope;
- open questions, each marked blocking or non-blocking, with no blocking question left unanswered.

For a bug, ready means reproducible.

## Landing a change

<!-- IF no remote -->
The repository has no remote yet. CI in `.github/workflows/ci.yml` runs the gate on pull requests once it
has one; until then the rules below are the whole safety net.
<!-- IF remote -->
CI in `.github/workflows/ci.yml` runs the gate on every pull request into `develop` or `main`.
<!-- END -->

Run the validation gate, have the diff looked at while it is still uncommitted, then commit.

Branches:

- `main` - released code; it changes only through a release.
- `develop` - the work towards the next release; topic branches start from it and merge back into it.
- Topic branches - `feat/<name>`, `fix/<name>`, `refactor/<name>`, `chore/<name>`, `docs/<name>`.

Once there is a remote, a topic branch reaches `develop` through a PR: `yarn pr:create` opens it, with
`.ai/pr-description.md` from `codee-generate-pr-description` as its body when it exists.

A user-facing change carries a changeset (`yarn changeset`): a patch for a fix, a minor for an additive
change, a major for a change to the public contract in [AGENTS.md](AGENTS.md), "Plugin Contract", which also
says so in its commit message. A change to tooling or process (`chore/`) needs none.

A change that renames files carries the rename in its own commit, before the content edits.

An agent commits only when the person asks it to, and says where the change went.

## Validation gate

Every change passes the full gate before it lands, in this order:

- `yarn lint`
- `yarn typecheck`
- `yarn typecheck:admin`
- `yarn format:check`
- `yarn test:unit`

Any non-zero exit fails the gate and blocks the commit. A linked project sees a change through the user's
`yarn dev`; `yarn build` runs only at publication.

**Integration tests are manual.** They run in the plugin against its test app and a Docker Postgres - see
[docs/tests.md](docs/tests.md) - when the risk is real, and the report says so.

## Release

Publication is the maintainer's decision. Until then a project uses the plugin through yalc.

A release, when asked for - `yarn prepare-release` runs steps 1 and the branch of step 2, pushing only
when there is an `origin` remote:

1. On `develop`, `yarn changeset version` applies the changesets to `package.json` and `CHANGELOG.md`;
   commit it as `chore: version packages`.
2. Branch `release/v<version>` from `develop` and merge it into `main`, through a PR titled
   `release: v<version>` once there is a remote; tag `main` as `v<version>`.
3. Merge `main` back into `develop` when `main` has commits `develop` lacks.
4. Publish by hand, on `main` at the tag: `yarn publish-package --dry-run` to see the package, then
   `yarn publish-package`. It checks the branch, a clean tree and the tag, reads `NPM_TOKEN` from the
   environment or `.env` (ignored by git; `.npmrc` reads the variable), and runs
   `npm publish --access public`, whose `prepublishOnly` builds the plugin - so `yarn dev` is stopped
   first and started again after.

Before the first publication, the packed package is installed in a project and its routes are run.
````
