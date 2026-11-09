# codee-skills

Reusable skills for AI coding agents, maintained by Codee. They follow the shared
`SKILL.md` format and work with agents supported by the
[`skills` CLI](https://github.com/vercel-labs/skills), including Claude Code and
Codex.

All skill names use the `codee-` prefix to avoid collisions with skills from other
repositories.

## Use the skills

**Always install from GitHub.** `codee-sh/codee-skills` is the source every
installation should name, so that `skills-lock.json` records the same source for
everyone on the project and `ags skills update` pulls the same published version
for all of them. A local clone is for developing the skills themselves, not for
installing them - see [Develop against a local clone](#develop-against-a-local-clone).

### Install directly with `npx skills`

Run the interactive installer to select skills and target agents:

```bash
npx skills add codee-sh/codee-skills
```

Install one specific skill:

```bash
npx skills add codee-sh/codee-skills --skill codee-ts-code-conventions
```

Install the TypeScript conventions with the Medusa extension:

```bash
npx skills add codee-sh/codee-skills \
  --skill codee-ts-code-conventions \
  --skill codee-medusa-backend-conventions
```

Install spec writing with the matching technical review:

```bash
# Medusa
npx skills add codee-sh/codee-skills \
  --skill codee-spec-writing \
  --skill codee-spec-review-medusa

# Payload CMS / Next.js
npx skills add codee-sh/codee-skills \
  --skill codee-spec-writing \
  --skill codee-spec-review-payload
```

Install all skills for Claude Code and Codex:

```bash
npx skills add codee-sh/codee-skills --skill '*' -a claude-code -a codex
```

Add `-g` to install globally instead of in the current project, or `-y` to skip
confirmation prompts.

### Develop against a local clone

Only for working on the skills themselves - testing an edit before it is pushed.

```bash
git clone git@github.com:codee-sh/codee-skills.git
npx skills add ./codee-skills --skill codee-spec-writing
```

A local install records `"sourceType": "local"` and a filesystem path in the
project's `skills-lock.json`, instead of `codee-sh/codee-skills`. That entry is
specific to one machine: a teammate cloning the project gets a path that does not
exist, and `ags skills update` pulls from your working copy rather than from the
published repository. Mixing both source types in one project means some skills
update from GitHub and some from your disk, and the two drift apart.

Install a skill this way while you are changing it; reinstall it from GitHub once
the change is pushed.

## Agent instruction templates

Copy the `Skill Router` section for your stack into the repository's agent
instruction file. Keep only rows for skills installed in that repository.

- [Default](agents-templates/default.md)
- [Medusa](agents-templates/medusa.md)
- [Medusa plugin](agents-templates/medusa-plugin.md) - for a plugin repository, with `codee-medusa-plugin-delivery`
- [Payload](agents-templates/payload.md)

The Medusa template combines Codee skills with the official
[`medusajs/medusa-agent-skills`](https://github.com/medusajs/medusa-agent-skills)
skills, so its router covers two sources. Install both to make every row resolve:

```bash
npx skills add codee-sh/codee-skills --skill '*'
npx skills add medusajs/medusa-agent-skills
```

## Available skills

Two kinds of skill live here. **Setup skills** run once in a repository, and again when its toolchain
changes. **Working skills** load on their own while you work, when the task matches their description;
you rarely call them by name.

### Setup - run once per repository

| Skill | What it does | When to run |
|---|---|---|
| `codee-setup-agent-pipeline` * | Writes `.ai/agentic.config.json`, which other skills read, installs the tracker descriptor, and generates missing `SDLC.md`, `AGENTS.md`, `CODE_REVIEW.md` for the autonomous ticket-to-PR pipeline. | In a new application repository, and when its validation scripts, tracker or labels change. Not in a Medusa plugin. |
| `codee-medusa-plugin-delivery` | Sets up or aligns a Medusa plugin: Yarn 4, branches, Changesets, the release, PR and publish scripts, manual npm publication, GitHub CI and release workflows, integration tests on a test app, the plugin's `SDLC.md` and `AGENTS.md` rules. | In a new plugin repository; when an existing plugin is brought to the same way of working; for any question about releasing, publishing or testing a plugin. |
| `codee-project-organization` | Writes `PROJECT-ORGANIZATION.md`: team, tools, workflow, sprints, ClickUp. | At the start of a client project. |

### General - working skills

| Skill | What it does | When it loads |
|---|---|---|
| `codee-spec-writing` | Writes and reviews specs: a main spec and sub-specs, open questions first, phased plans. | Planning a non-trivial feature, restructuring or reviewing a spec. |
| `codee-spec-notes` | Keeps working notes in `.ai/notes/{topic}/`, never in the specs. | Exploring before a spec, collecting context or client questions. |
| `codee-root-cause` * | Read-only root-cause analysis: where a bug is and the smallest change that fixes it. | A bug report, before a fix is proposed or written. |
| `codee-ts-code-conventions` | Comments, JSDoc, naming and clarity in TypeScript. | Writing or reviewing TypeScript. |
| `codee-ui-copy` | Polish and English rules for interface text. | Labels, buttons, messages, empty states, tooltips. |
| `codee-lessons` | Records non-obvious findings, one file each, in a catalog, and looks them up. | After a surprising bug or a fix that needs an explanation; before answering what may be recorded. |
| `codee-generate-pr-description` | Writes `.ai/pr-description.md` from the branch. | "Prepare the PR description". |
| `codee-writing-questions` | Formats questions for a client or stakeholder. | Writing questions to a client. |
| `codee-skill-creator` | Scaffolds a new skill from a template. | Creating a skill. |

### Medusa - working skills

| Skill | What it does | When it loads |
|---|---|---|
| `codee-medusa-backend` | Medusa backend architecture: modules, workflows, API routes, links, data models. | Any backend work, planning included. |
| `codee-medusa-backend-conventions` | Where a backend file goes, its name, its JSDoc, the shape of a step. | Writing or reviewing any backend file. |
| `codee-medusa-testing` | Which test a change owes, at which layer, with which runner and harness. | Before writing a step, workflow, module, route or util, or its test. |
| `codee-medusa-admin-dashboard` | Admin UI: components, data loading, forms, tables, navigation, and where a file goes in `src/admin`. | Any Admin work, planning included. |
| `codee-medusa-storefront-sdk` | Calling Medusa from a storefront: JS SDK, React Query, custom routes. | Storefront integration work. |
| `codee-medusa-storefront-ux` | Storefront UI and flows: cart, checkout, product pages, navigation. | Any storefront page or component. |
| `codee-medusa-scripts` | `src/scripts/` and `src/migration-scripts/`: where a script goes, dry runs, arguments, helpers. | Writing, reviewing or deleting a script or a data backfill. |
| `codee-spec-review-medusa` | Technical review of a Medusa spec against the code and the framework. | After the `codee-spec-writing` review of a Medusa spec. |

### Payload - working skills

| Skill | What it does | When it loads |
|---|---|---|
| `codee-payload` | Payload projects: config, fields, hooks, access control, the Payload API. | Any Payload work and debugging. |
| `codee-payload-build-collections` | Adding a collection, step by step. | A new collection or data type. |
| `codee-payload-build-modules` | A custom admin view or field component. | A new admin view, tab or field UI. |
| `codee-payload-frontend-build-components` | React components and pages in the Next.js and Tailwind front end. | A UI primitive, shared component or page. |
| `codee-payload-review` | Best-practice review: deployment and architecture hygiene. | Reviewing a project, or changing schema, migrations or deployment. |
| `codee-payload-security` | Security review and hardening. | Reviewing security, or changing auth, access, uploads, CORS or headers. |
| `codee-spec-review-payload` | Technical review of a Payload spec. | After the `codee-spec-writing` review of a Payload spec. |

\* Adapted from the [open-mercato/skills](https://github.com/open-mercato/skills)
collection (MIT, Copyright (c) 2026 Open Mercato). The original skills are the work of
the Open Mercato team; we reworked them for a stack-agnostic, non-autonomous workflow —
renamed them to the `codee-` prefix, removed the dependencies on skills we do not ship,
and generalised the pipeline references. The MIT notice stays inside each adapted
`SKILL.md`.

## Repository structure

```text
codee-skills/
├── general/
│   ├── codee-generate-pr-description/
│   ├── codee-lessons/
│   ├── codee-project-organization/
│   ├── codee-root-cause/
│   ├── codee-setup-agent-pipeline/
│   ├── codee-skill-creator/
│   ├── codee-spec-notes/
│   ├── codee-spec-writing/
│   ├── codee-ts-code-conventions/
│   ├── codee-ui-copy/
│   └── codee-writing-questions/
├── frameworks/
│   ├── medusa/
│   │   ├── codee-medusa-admin-dashboard/
│   │   ├── codee-medusa-backend/
│   │   ├── codee-medusa-backend-conventions/
│   │   ├── codee-medusa-plugin-delivery/
│   │   ├── codee-medusa-scripts/
│   │   ├── codee-medusa-storefront-sdk/
│   │   ├── codee-medusa-storefront-ux/
│   │   ├── codee-medusa-testing/
│   │   ├── codee-spec-review-medusa/
│   │   └── UPSTREAM.md          (where the copies of Medusa's skills come from)
│   └── payload/
│       ├── codee-payload/
│       ├── codee-payload-build-collections/
│       ├── codee-payload-build-modules/
│       ├── codee-payload-frontend-build-components/
│       ├── codee-payload-review/
│       ├── codee-payload-security/
│       └── codee-spec-review-payload/
├── bin/
├── commands/
└── package.json
```

Every skill folder must be a real directory. Symlinks in this repository are
ignored during skill discovery.

## Maintainer CLI: `ags`

The repository includes `ags`, a wrapper around `npx skills` for maintaining local
project copies and pushing edited skills back to this source repository.

Regular users do not need `ags`; the commands in [Use the skills](#use-the-skills)
are sufficient.

### Configure the command

Add an alias pointing to your local clone:

```bash
echo 'alias ags="node /path/to/codee-skills/bin/codee-skills.js"' >> ~/.zshrc
source ~/.zshrc
```

Replace `/path/to/codee-skills` with the actual path to the repository.

### Install and manage project skills

```bash
ags skills add                              # interactive installer
ags skills add codee-ts-code-conventions    # install one skill
ags skills add frameworks/medusa            # install a group
ags skills list                             # list installed skills
ags skills update                           # update all installed skills
ags skills update codee-ts-code-conventions # update one skill
ags skills remove codee-ts-code-conventions # remove one skill
```

`ags skills add` installs to both `.claude/skills/` and `.agents/skills/`.
Installed sources are recorded in `skills-lock.json`.

Note that `ags skills add` installs from your local clone, so it writes a `local`
source into the lock file, with the consequences described in
[Develop against a local clone](#develop-against-a-local-clone). Use it while
developing a skill; install the published version with
`npx skills add codee-sh/codee-skills --skill <name>` once it is pushed.

For local sources, `ags skills update` pulls the latest version of this repository,
compares the installed copies, and reinstalls skills that changed. External GitHub
or URL sources are updated through `npx skills`.

### Push an edited skill

Configure GitHub SSH access and make sure the repository uses its SSH remote:

```bash
git remote set-url origin git@github.com:codee-sh/codee-skills.git
```

Then push a skill edited in `.agents/skills/`:

```bash
ags push-skill
ags push-skill codee-ts-code-conventions
ags push-skill codee-ts-code-conventions --dry-run
```

The command:

1. Compares the complete skill directory from `.agents/skills/` with this repository.
2. Displays added, changed, and removed files.
3. Checks for newer remote commits.
4. Asks for confirmation.
5. Mirrors the skill into this repository, commits it, and pushes it.
6. Syncs the resulting skill to `.claude/skills/`.

`.agents/skills/` is the editable project copy. Do not edit `.claude/skills/`
directly because it is treated as a derived copy.

## Add a new skill

1. Create a directory in the appropriate group. Its name must start with `codee-`.
2. Add a `SKILL.md` file whose `name` exactly matches the directory name:

```markdown
---
name: codee-my-skill
description: Describe what the skill does and when the agent should use it.
---

# Codee My Skill

Add the skill instructions here.
```

3. Verify discovery with:

```bash
npx skills add . --list
```

The new skill is then available through both the local repository and
`codee-sh/codee-skills` after it is pushed.

## Requirements

- Node.js
- Git
- SSH access to GitHub only when pushing changes with `ags push-skill`
