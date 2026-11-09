---
name: codee-medusa-plugin-delivery
description: Set up or align how a Medusa plugin repository is developed, tested, released and published - Yarn 4 through Corepack, develop/main and topic branches, Changesets, the prepare-release, create-pr and publish-package scripts, manual npm publication, GitHub CI and release workflows, integration tests in the plugin itself on a test app with a Docker Postgres, yarn dev with yalc, and the plugin's SDLC.md and AGENTS.md rules (public contract, dependencies, who runs what). Use it once in a new plugin repository, when an existing plugin is brought to the same way of working, and whenever the question is how a plugin is released, published, versioned, tested in CI or against a database, or linked into a project. Trigger on "set up the plugin repo", "release the plugin", "publish to npm", "add changesets", "plugin CI", "integration tests in the plugin", "move the plugin to yarn 4", "align this plugin with the other plugins". Only for a Medusa plugin; an application uses codee-setup-agent-pipeline.
---

# Medusa Plugin Delivery

How a Medusa plugin repository works from a change to a published package, and how to set it up. A
plugin differs from an application: it runs only inside a project that installs it, owns at most its own
module's tables, is linked into a project through yalc while developed, and what it exports is a public
contract versioned on npm.

## When to use

- A new plugin repository needs its tooling and process.
- An existing plugin is brought to the same way of working as the others.
- A question about releasing, publishing, versioning, CI, integration tests or yalc in a plugin.

`codee-setup-agent-pipeline` configures the autonomous agent pipeline - tickets, labels, QA, merging by
skills - for any repository. A plugin uses this skill instead; it may run the pipeline skill as well only
when it wants that pipeline, and that skill never overwrites the `SDLC.md` written here.

## What it sets up

| Area | Reference |
|---|---|
| `SDLC.md`: branches, changesets, the gate, the release, the npm publication | `references/sdlc.md` |
| `AGENTS.md` and `CODE_REVIEW.md`: the plugin contract, dependencies, `yarn dev`, who runs what | `references/agents-rules.md` |
| Yarn 4, Changesets, `.npmrc`, the release, PR and publish scripts, `package.json`, `CONTRIBUTING.md` | `references/release-tooling.md` |
| `.github`: CI, PR labels, release notes, the release workflow, the PR template | `references/github.md` |
| The test app, a test module, migrations, `docs/tests.md` | `references/integration-tests.md` |

## Steps

1. **Read the repository first**: `package.json` (name, scripts, `packageManager`, dependencies), its
   modules and whether it owns models, `.github/`, `.changeset/`, `scripts/`, and the existing `AGENTS.md`,
   `SDLC.md`, `CODE_REVIEW.md`, `CONTRIBUTING.md`, `docs/`. Run `git status` and preserve what is there.
2. **Show the plan before writing.** List per area what is missing, what differs and what already
   matches. An existing document is merged block by block - add what is missing, replace a rule only
   where it says the opposite - never replaced wholesale. Write only after the user approves.
3. **Work on a topic branch** - `chore/plugin-delivery` from `develop`, or create `develop` from `main`
   when it does not exist, with the user's approval.
4. **Yarn 4 first.** Write `.yarnrc.yml`, then hand the user the Corepack commands in
   `references/release-tooling.md`. Everything after relies on Yarn 4.
5. **Release tooling and `.github`**: write the files from `references/release-tooling.md` and
   `references/github.md`, and add `@changesets/cli` to `devDependencies` for the user's install.
6. **Integration tests**: follow `references/integration-tests.md`. A plugin that owns no models gets a
   test module; the user generates its migrations.
7. **Documents**: `SDLC.md` from `references/sdlc.md`, the blocks of `references/agents-rules.md` merged
   into `AGENTS.md` and `CODE_REVIEW.md`, `CONTRIBUTING.md`, `docs/tests.md`. When
   `.ai/agentic.config.json` is missing, write one with only `validation` (the gate commands) and
   `lessons` (path, index, `modulesFrom`, areas, topics), which `codee-lessons` reads.
8. **Validate**: the gate, `bash -n` on each script, a YAML parse of each workflow, and the build check
   in `references/integration-tests.md`.
9. **Report** what was written, what the user runs, and what waits for a remote.

## What the user runs

The agent writes files; the user runs what installs, starts long processes, generates migrations or
publishes:

- `corepack enable` and `corepack use yarn@4`, then `yarn install` after any dependency change;
- `yarn dev` while developing, and stopping it before a publication;
- `yarn test:db:generate` after a change to a test model;
- creating the GitHub repository and the `origin` remote, branch protection with CI as a required check;
- `NPM_TOKEN` in `.env`, and `yarn publish-package`.

The agent may run the gate and the integration test cycle - `yarn test:db:up`, the tests,
`yarn test:db:down` for a database it started.

## Output format

The files of each reference at the repository paths they name, on a topic branch, uncommitted, and a
report: per area what was added or changed, the validation run and its result, and the user's commands
in order.
