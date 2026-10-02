---
name: codee-spec-notes
description: Write short working notes in .ai/notes/ - one folder per topic, containing a same-named note file. The only home for working notes - exploration for a single spec module, cross-cutting context, and client questions still being collected all go here, never into .ai/specs/.
---

# Spec Notes

Write working notes as a small, topic-scoped folder - not as one growing file, and never inside the spec tree.

`.ai/notes/` is the only home for working notes. A `notes.md` inside a spec module grows into a second, drifting copy of the spec, gets linked from specs by anchor or line number, and then blocks or breaks the module's closure - so there is none. A note is short-term working memory; whatever a spec relies on moves into the spec.

---

## When to Apply

Use this skill when:

- capturing a decision, gotcha, or debugging insight that spans multiple modules/workflows
- recording context that a future session needs but that doesn't belong to one active spec
- exploring a direction for one spec module before it becomes a decision - name the topic after the module
- collecting questions for a client or stakeholder before they are answered
- the user asks to "save this to notes" / "zapisz to do notatek"

Do not use this skill when:

- the content is a stable decision or requirement - it belongs in a main spec or sub-spec, not a note
- the information is something Claude's own auto-memory should hold (user preferences, feedback about how to collaborate) - see the auto-memory system instead

---

## Folder Structure

```text
.ai/notes/
  {topic-name}/
    {topic-name}.md
```

Rules:

- one folder per topic, named after the topic (kebab-case, short)
- the primary note file has the **same name** as its folder
- the folder exists (instead of a flat file) so related material can land alongside the note later - e.g. a small script, a captured log excerpt, a follow-up note - without needing to restructure
- do not create subfolders inside a topic folder unless there is a second file to justify it
- topics are flat under `.ai/notes/` - no nested categories

---

## Hard Rules

### 1. Keep it short

A note is not a spec and not a runbook. Target: well under one screen. If it is growing into a narrative, it has become a spec - move it to `.ai/specs/` via `codee-spec-writing` instead.

### 2. Concrete information only

Every entry should be a fact, a decision, or a specific observation with a file/line reference - not a speculative essay. State what happened, why it matters, and where to look. Do not pad with restated context the reader can get from the code.

### 3. Do not accumulate - trim

When updating a note, prefer editing/replacing stale content over appending forever. A note that only grows becomes unreadable and stops being useful. Delete or compress freely.

### 4. Link instead of repeating

If detail already lives in a spec, another note, or a code comment, link to it (relative path) instead of copying it in.

### 5. One topic per note file

If a note starts covering two unrelated topics, split it into two topic folders.

### 6. A note is not evidence for a spec

A spec never depends on a note. When a finding from a note supports a spec, copy the finding into the spec and delete it from the note; never link to a note by anchor or line number. When a decision lands in a spec, remove it from the note, and delete a note that is left empty. A spec or module is not closed while it still depends on a note.

---

## Format

No required frontmatter. Plain markdown:

```md
# Notes — {Topic}

One-line description of what this folder tracks and why it's global (not module-scoped).

## {Short heading for one entry} (YYYY-MM-DD)

Concrete fact/decision, with file:line references. A few sentences, not a section.
```

Multiple dated entries can live in one file if they're genuinely the same topic - but split into a new topic folder once they stop being the same topic.

---

## Workflow

1. Check whether `.ai/notes/{topic-name}/` already exists for this topic before creating a new one.
2. If it exists, add a new dated entry or edit the existing content - don't create a second file for the same topic.
3. If it's new, create the folder and the same-named file.
4. Keep the entry concrete and short per the Hard Rules above.
5. If the note later hardens into a real decision/requirement that should outlive "working memory", promote it into a proper spec via `codee-spec-writing` and trim or remove the note.
