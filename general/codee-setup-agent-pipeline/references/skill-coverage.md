# Cross-skill coverage check

Skills in this collection delegate to each other by name and point at each
other's reference files (`codee-<skill>/references/<file>`). A cherry-picked
install can leave those references dangling. This check finds every dangling
reference and produces one ready-to-paste command that installs what is
missing.

Run it during setup (workflow step "Verify cross-skill coverage") and any time
the user reports a skill "not found" mid-pipeline.

## Where installed skills live

`SKILLS_ROOT` is the directory that contains the installed skills — the parent
of this skill's own directory (the directory holding the `SKILL.md` you are
reading). For Claude Code this is typically `.claude/skills`; agent-neutral
installs use `.agents/skills`. Resolve it from this skill's actual location,
not from a guess.

A reference is also satisfied by a repo-local skill at
`.ai/skills/<name>/SKILL.md` — repo-local skills count as available.

## Detection

Two kinds of references must resolve:

1. **Name references** — mentions of a collection skill (`codee-…`) in any of
   an installed skill's markdown files.
2. **File references** — explicit cross-skill pointers of the form
   `codee-<skill>/references/<file>`; the target must exist inside the
   installed sibling skill.

There is no hardcoded roster. Every `codee-…` token that does not resolve to an
installed directory is reported — a genuinely missing skill and a typo both
deserve the same attention, and a roster would have to be kept in sync with the
collection to be worth anything.

Runnable check (POSIX shell; run from the repository root so repo-local
`.ai/skills/` overrides are seen):

```bash
# SKILLS_ROOT: parent directory of this skill's installed directory.
SKILLS_ROOT=${SKILLS_ROOT:-".claude/skills"}
missing=""
add_missing() { case " $missing " in *" $1 "*) ;; *) missing="$missing $1" ;; esac; }
for dir in "$SKILLS_ROOT"/codee-*/; do
  [ -f "${dir}SKILL.md" ] || continue
  for ref in $(grep -rhoE '(^|[^A-Za-z-])codee-[a-z][a-z0-9-]*[a-z0-9]' --include='*.md' "$dir" 2>/dev/null \
               | grep -oE 'codee-[a-z][a-z0-9-]*[a-z0-9]' | sort -u); do
    [ -d "$SKILLS_ROOT/$ref" ] && continue                   # installed
    [ -f ".ai/skills/$ref/SKILL.md" ] && continue            # repo-local skill
    add_missing "$ref"
  done
done
# Cross-skill file pointers must resolve inside the installed sibling.
for hit in $(grep -rhoE 'codee-[a-z0-9-]+/references/[A-Za-z0-9._/-]+' --include='*.md' \
             "$SKILLS_ROOT"/codee-*/ 2>/dev/null | sort -u); do
  [ -e "$SKILLS_ROOT/$hit" ] || add_missing "${hit%%/*}"
done
[ -z "$missing" ] && echo "SKILL_COVERAGE_OK" || echo "SKILL_COVERAGE_MISSING:$missing"
```

The leading-context guard in the first grep (`(^|[^A-Za-z-])`) drops substrings
of hyphenated words, so a token like `my-codee-thing` is not read as a skill
reference.

## Remediation

When the check prints `SKILL_COVERAGE_MISSING`, tell the user exactly what is
missing, which installed skills need it, and give them one command they can
paste and run as-is — one `--skill` flag per missing name:

```bash
npx skills add <collection-source> --skill codee-root-cause --skill codee-spec-writing
```

When many skills are missing, the simplest fix is installing the whole
collection (every skill is small until invoked):

```bash
npx skills add <collection-source> --skill '*'
```

`<collection-source>` is the `<owner>/<repo>` argument the skills were
originally installed with — never guess it. Resolve it in this order:

1. `skills-lock.json` at the repository root, when present: it records the
   source of every installed skill.
2. If this skill's installed directory is a symlink into a development
   checkout, follow it and read the checkout's `package.json`
   (`repository.url`) or `git remote get-url origin`.
3. Ask the operator once, then reuse the answer for every command printed in
   this run.

Substitute the resolved source into the command before showing it — the goal is
paste-and-run, not a template. After the user runs the install, re-run the
check and confirm it prints `SKILL_COVERAGE_OK`; setup is not complete while
references dangle. In unattended runs (`--defaults`) nothing can be installed
interactively: report the missing list and the exact command in the final
summary instead, and continue setup — the config itself is still valid.
