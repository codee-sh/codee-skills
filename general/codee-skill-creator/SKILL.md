---
name: skill-creator
description: Create a new skill from a ready-made skeleton. Use when the user wants to make, scaffold, or write a new agent skill, asks for a SKILL.md, or says "turn this into a skill". Copies a template and fills it in.
---

# Skill Creator

Create a new skill by copying a ready-made skeleton and filling it in. Keep it
lean — a skill is just a `SKILL.md` plus optional bundled resources.

## When to use

- The user asks to create, scaffold, or write a new skill.
- The user wants a `SKILL.md` for some workflow.
- A repeatable workflow surfaces in the conversation and the user says "turn
  this into a skill".

## Steps

1. **Capture intent.** Confirm three things before writing anything:
   - What the skill should let the agent do.
   - When it should trigger (the user phrases / contexts).
   - What the expected output is.
   If the conversation already contains the workflow, extract these from history
   and just confirm them.

2. **Pick the location.** New skills live under `.agents/skills/<skill-name>/`.
   Use a short, kebab-case `<skill-name>`.

3. **Copy the skeleton.** Copy `references/skill-template.md` to
   `.agents/skills/<skill-name>/SKILL.md`, then fill in every `<placeholder>`.

4. **Write the description carefully.** The `description` frontmatter field is
   the only thing that decides whether the skill triggers. Put ALL "when to use"
   info there, not in the body. State what it does AND specific contexts for
   when to use it. Be a little pushy — agents tend to under-trigger skills.

5. **Add resources only if needed.** If the skill needs scripts, reference docs,
   or output templates, add `scripts/`, `references/`, or `assets/`
   subdirectories. Skip them otherwise — most skills are just a `SKILL.md`.

6. **Review with fresh eyes.** Read the draft back. Cut anything that isn't
   pulling its weight. Prefer explaining *why* over rigid ALWAYS/NEVER rules.

## Output format

A `SKILL.md` (and any resource files) written under
`.agents/skills/<skill-name>/`. Report the path back to the user.

## Notes on frontmatter

Only `name` and `description` are read by the runtime. Custom fields (like a
`template:` key) are ignored — keep templates as files under `references/`, not
in frontmatter.
