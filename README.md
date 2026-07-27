# codee-skills

Reusable skills for AI coding agents, maintained by Codee. They follow the shared
`SKILL.md` format and work with agents supported by the
[`skills` CLI](https://github.com/vercel-labs/skills), including Claude Code and
Codex.

All skill names use the `codee-` prefix to avoid collisions with skills from other
repositories.

## Use the skills

You can install the skills directly from GitHub or clone the repository and use
your local copy.

### Install directly with `npx skills`

Run the interactive installer to select skills and target agents:

```bash
npx skills add codee-sh/codee-skills
```

Install one specific skill:

```bash
npx skills add codee-sh/codee-skills --skill codee-code-style
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

### Clone and use the repository locally

```bash
git clone git@github.com:codee-sh/codee-skills.git
npx skills add ./codee-skills
```

You can also install a single skill from the cloned repository:

```bash
npx skills add ./codee-skills --skill codee-spec-writing
```

Using a local source is useful when developing or testing changes before pushing
them to GitHub.

## Available skills

### General

- `codee-code-style`
- `codee-generate-pr-description`
- `codee-project-organization`
- `codee-skill-creator`
- `codee-spec-notes`
- `codee-spec-writing`
- `codee-ui-copy`
- `codee-writing-questions`

### Medusa

- `codee-admin-forms-with-medusa`
- `codee-code-style-medusa`
- `codee-spec-review-medusa`

### Payload

- `codee-payload`
- `codee-payload-build-collections`
- `codee-payload-build-modules`
- `codee-payload-frontend-build-components`
- `codee-payload-review`
- `codee-payload-security`
- `codee-spec-review-payload`

## Repository structure

```text
codee-skills/
├── general/
│   ├── codee-code-style/
│   ├── codee-generate-pr-description/
│   ├── codee-project-organization/
│   ├── codee-skill-creator/
│   ├── codee-spec-notes/
│   ├── codee-spec-writing/
│   ├── codee-ui-copy/
│   └── codee-writing-questions/
├── frameworks/
│   ├── medusa/
│   │   ├── codee-admin-forms-with-medusa/
│   │   ├── codee-code-style-medusa/
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
ags skills add codee-code-style             # install one skill
ags skills add frameworks/medusa            # install a group
ags skills list                             # list installed skills
ags skills update                           # update all installed skills
ags skills update codee-code-style          # update one skill
ags skills remove codee-code-style          # remove one skill
```

`ags skills add` installs to both `.claude/skills/` and `.agents/skills/`.
Installed sources are recorded in `skills-lock.json`.

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
ags push-skill codee-code-style
ags push-skill codee-code-style --dry-run
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
