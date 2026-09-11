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
  --skill codee-medusa-code-conventions
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
- [Payload](agents-templates/payload.md)

The Medusa template combines Codee skills with the official
[`medusajs/medusa-agent-skills`](https://github.com/medusajs/medusa-agent-skills)
skills, so its router covers two sources. Install both to make every row resolve:

```bash
npx skills add codee-sh/codee-skills --skill '*'
npx skills add medusajs/medusa-agent-skills
```

## Available skills

### General

- `codee-generate-pr-description`
- `codee-lessons`
- `codee-project-organization`
- `codee-root-cause` *
- `codee-setup-agent-pipeline` *
- `codee-skill-creator`
- `codee-spec-notes`
- `codee-spec-writing`
- `codee-ts-code-conventions`
- `codee-ui-copy`
- `codee-writing-questions`

### Medusa

- `codee-admin-forms-with-medusa`
- `codee-medusa-code-conventions`
- `codee-medusa-testing`
- `codee-spec-review-medusa`

### Payload

- `codee-payload`
- `codee-payload-build-collections`
- `codee-payload-build-modules`
- `codee-payload-frontend-build-components`
- `codee-payload-review`
- `codee-payload-security`
- `codee-spec-review-payload`

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
│   │   ├── codee-admin-forms-with-medusa/
│   │   ├── codee-medusa-code-conventions/
│   │   ├── codee-medusa-testing/
│   │   └── codee-spec-review-medusa/
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
