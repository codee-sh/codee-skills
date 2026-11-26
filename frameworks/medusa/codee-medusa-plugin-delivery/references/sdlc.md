# SDLC.md for a Medusa plugin

The template of a plugin's `SDLC.md`. Copy the block below, resolve the `<...>` placeholders, and keep the
sentence of each `<!-- IF ... -->` block that matches the repository, removing the markers.

````markdown
# Software delivery process

## Purpose

This file documents how work reaches `develop` and how `develop` is released to npm in this repository.
Humans read the process here; the agent rules are in [AGENTS.md](AGENTS.md).

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
CI in `.github/workflows/ci.yml` runs the gate on every pull request into `develop`, and
`.github/workflows/pr-labeler.yml` labels it by its branch prefix (`.github/labeler.yml`).
<!-- END -->

Run the validation gate, have the diff looked at while it is still uncommitted, then commit.

Branches:

- `develop` - the default branch; every release is cut from it. There is no `main`.
- Topic branches - `feat/<name>`, `fix/<name>`, `refactor/<name>`, `chore/<name>`, `docs/<name>`,
  `deps/<name>`, `breaking/<name>`; the prefix gives the PR its label.

Once there is a remote, a topic branch reaches `develop` through a PR: `yarn pr:create` opens it, titled
with the branch's first commit subject - a conventional commit - and with `.ai/pr-description.md` from
`codee-generate-pr-description` as its body when it exists. The template in
`.github/PULL_REQUEST_TEMPLATE.md` asks for What, Why, How and Testing.

A user-facing change carries a changeset (`yarn changeset`), whose text becomes the release note: the
version bump follows "Plugin Contract" in [AGENTS.md](AGENTS.md), and a breaking change also says so in its
commit message. A change to tooling or process (`chore/`) needs none.

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
`yarn dev`; `yarn build` runs only in the release workflow.

**Integration tests are manual.** They run in the plugin against its test app and a Docker Postgres - see
[docs/tests.md](docs/tests.md) - when the risk is real, and the report says so.

## Release

`.github/workflows/release.yml` releases from `develop`; nobody versions, tags or publishes by hand.

1. While `develop` has changesets, every push opens or rewrites one PR, `chore: release`, from
   `changeset-release/develop`. It holds the next version in `package.json`, the new `CHANGELOG.md`
   section - each entry linked to its PR, commit and author by `@changesets/changelog-github` - and the
   consumed changesets.
2. The maintainer reads that PR - the version, and the section as the release note it becomes - and
   merges it when the release is wanted. GitHub runs no CI on a PR the workflow opened; when branch
   protection requires CI, close and reopen the PR.
3. The merge leaves `develop` without changesets, so the workflow builds the package, checks that the
   packed list holds the build, publishes it to npm through trusted publishing (OIDC, with provenance),
   tags `v<version>` and creates the GitHub release `v<version>`, whose body is the version's
   `CHANGELOG.md` section.

A failed publish job is re-run: `changeset publish` skips a version npm already has. A broken version is
deprecated with `npm deprecate` and fixed in a patch.

**The first version.** npm publishes a package's first version only with a credential, never through
OIDC, and its trusted publisher can be set only on a package that exists. So `0.0.1` is published once
by hand, from the maintainer's machine, and deprecated as a placeholder; the trusted publisher
(`<owner>`, `<repository>`, `release.yml`) is set on npm right before the release PR of `0.1.0` is
merged, as npm expects its first publish within 2 days. No npm token is stored anywhere.
````
