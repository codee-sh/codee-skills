# codee-skills

Central repository of skills for AI agents. The skills work with Claude Code (`.claude/skills/`) and Codex (`.agents/skills/`).

## Repository Structure

```
codee-skills/
  general/                        # general skills
    code-style/
    project-organization/
    spec-writing/
    ui-copy/
    writing-questions/
  frameworks/
    medusa/
      admin-forms-with-medusa/
      code-style-medusa/
    payload/
      payload/
      payload-build-collections/
      payload-build-modules/
      payload-frontend-build-components/
      payload-security/
  bin/codee-skills.js             # CLI entry point
  commands/                       # command implementations
  package.json
```

> **Important:** Every skill folder must be a real directory - symlinks are ignored by `npx skills`.

---

## First Run

### 1. Clone the repo

```bash
git clone git@github.com:codee-sh/codee-skills.git
cd codee-skills
```

### 2. Add the CLI alias to `~/.zshrc`

```bash
echo 'alias ags="node /path/to/codee-skills/bin/codee-skills.js"' >> ~/.zshrc
source ~/.zshrc
```

Replace `/path/to/codee-skills` with the actual path to the cloned repo.

### 3. Configure SSH for GitHub

`push-skill` requires SSH access to this repo so that `git push` works without asking for a password:

```bash
# Check whether you have an SSH key
cat ~/.ssh/id_ed25519.pub

# If you do not have one, generate it
ssh-keygen -t ed25519 -C "your@email.com"

# Add the public key to GitHub: Settings → SSH and GPG keys

# Make sure the remote uses SSH, not HTTPS
git remote set-url origin git@github.com:codee-sh/codee-skills.git
```

---

## CLI: ags

Local tool for managing skills in projects.

The `skills` command is a thin wrapper around external `npx skills`. It adds source-path detection, installs to both `.claude/skills/` and `.agents/skills/`, and keeps the local copies in sync.

The source of truth for skills is always this repo (`codee-skills`). The source path is detected automatically based on the location of `bin/codee-skills.js`.

```bash
ags push-skill                          # list changed skills (interactive)
ags push-skill <name>                   # push a specific skill
ags push-skill <name> --dry-run         # preview without writing

ags skills add                          # interactive grouped TUI
ags skills add <name>                   # a specific skill, e.g. code-style
ags skills add frameworks/medusa        # an entire subfolder
ags skills update                       # update all skills from source
ags skills update <name>                # update a specific skill
ags skills list                         # list installed skills
ags skills remove <name>                # remove a skill
```

---

## Commands

### `skills add`

Installs skills from this repo into the current project. It always installs to both locations at the same time: `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex).

```bash
ags skills add                     # interactive grouped TUI
ags skills add code-style          # a specific skill
ags skills add frameworks/medusa   # an entire subfolder
```

After installation, `skills-lock.json` is created in the project. It stores the source of each skill.

---

### `skills update`

Compares `.claude/skills/` and `.agents/skills/` against the local copy of the `codee-skills` repo on disk. Reinstalls if any location is out of date.

Before comparing, it automatically runs `git pull` in the source repo, so it always compares against the latest GitHub version.

```bash
ags skills update              # checks all skills
ags skills update code-style   # checks one skill
```

---

### `skills list` / `skills remove`

```bash
ags skills list
ags skills remove code-style
```

---

### `push-skill`

Pushes a locally edited skill back to this repo.

```bash
ags push-skill                          # list changed skills
ags push-skill code-style               # a specific skill
ags push-skill code-style --dry-run     # preview without writing
```

**Flow:**
1. Scans `.agents/skills/` — the local source of truth — for changes compared to the source repo. `.claude/skills/` is a derived copy and is not scanned (used only as a fallback when `.agents/` is missing)
2. Shows a list of changed skills (interactive list)
3. Checks whether the remote repo has newer commits (`git fetch`)
4. Shows a content diff
5. Asks for confirmation
6. Copies the file -> `git commit` -> `git push` to this repo
7. Auto-syncs the derived copy: after the push, `.agents/skills/` is copied to `.claude/skills/`

---

## Typical Workflow

```bash
# 1. New project - install skills
ags skills add

# 2. Edit a skill locally in .agents/skills/code-style/SKILL.md
#    (.agents/ is the source of truth; do not hand-edit .claude/ — it is synced for you)

# 3. Push the changes to the repo
ags push-skill
# -> choose a skill from the list, confirm
# -> push to the repo + auto-sync to the other folder

# 4. In another project - get the new version
ags skills update
```

---

## Adding a New Skill

1. Create a folder in the appropriate place, for example `general/my-skill/`
2. Add a `SKILL.md` file with the required frontmatter:

```markdown
---
name: my-skill
description: A short description of what the skill does.
---

# Skill content...
```

3. The skill is automatically detected by `ags skills add`.

---

## Requirements

- Node.js
- Git with SSH access to this repo (`git@github.com:...`)
- `npx skills` (Vercel Labs) - installed automatically through `npx`
