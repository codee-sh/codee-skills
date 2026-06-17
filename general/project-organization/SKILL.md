---
name: project-organization
description: Generates a PROJECT-ORGANIZATION.md file for a new software project — team structure, tools, workflow, sprints, and ClickUp setup.
---

# Skill: project-organization

Generates a `PROJECT-ORGANIZATION.md` file for a new software project.

## When to use

When starting a new project and needing to document team structure, tools, workflow, module specification methodology, and ClickUp setup.

## What to collect before generating

Ask the user if any of this information is missing:

1. **Team members** — names and roles (Tech Lead, Developer, DevOps, PM, Designer)
2. **PM tool** — default is ClickUp; is anything else being used?
3. **Communication tool** — Slack, Teams, other?
4. **Meeting platform** — Google Meet, Teams, Zoom?
5. **Repository** — GitHub, GitLab, Bitbucket?
6. **Sprint rhythm** — 1 week, 2 weeks, other?
7. **Stand-ups** — do we have them, how often?
8. **Meetings recorded?** — yes/no (for transcription purposes)

## Rules

- Module specifications go into `.ai/specs/` in the repository.
- Meetings are recorded for transcription (if the user confirms).
- Developer communicates with DevOps and PM directly (ad hoc) — no enforced daily stand-ups.
- Tech Lead reviews PRs before merging to `main`.
- Commit convention: `feat/fix/chore/docs: description [CU-xxx]` (ClickUp task ID).
- Environments: `local` → `develop/staging` (auto CI) → `main/production` (manual).

## Related skills

### `spec-writing`
Used in step 1 of the Module Specification Methodology. For each module listed in `.ai/specs/`, invoke the `spec-writing` skill to generate a full technical specification — data model, API endpoints, business logic, permissions, and inter-module integrations. The output is saved as `.ai/specs/<module-name>.md` and reviewed by the team before any implementation begins.

---

## Template

Replace all placeholder values (marked with `[...]`) with project-specific information.

```markdown
# Project Organization — [Project Name]

---

## TEAM

| Role | Person | Responsibilities |
|---|---|---|
| Project Manager | [TBD] | Sprint planning, client communication, acceptance |
| UX/UI Designer | [TBD] | Screen designs, design system, prototypes |
| Tech Lead | [Name] | System architecture, code review, technical decisions, PRs to `main` |
| Full-stack Developer | [Name] | Back-end ([framework], API, database) + Front-end ([framework], UI) |
| DevOps / Infrastructure | [Name(s)] | Servers, environments, CI/CD, backups, monitoring |

---

## TOOLS

### Project Management
| Tool | Purpose |
|---|---|
| **ClickUp** | Main PM tool — tasks, sprints, backlog, documentation |

### Communication
| Tool | Purpose |
|---|---|
| [Slack / Teams] | Day-to-day team communication |
| ClickUp comments | Discussions tied to a specific task |
| Meetings (Google Meet / Teams) | Sprint planning, review, retrospective — **all meetings are recorded** for transcription |

### Development
| Tool | Purpose |
|---|---|
| VS Code | IDE |
| Git + GitHub | Version control, code review (Pull Requests) |
| ESLint + Prettier | Code standards |
| Docker | Local development environment |
| [DB tool] | Database management |

### Testing
| Tool | Purpose |
|---|---|
| Jest | Unit and integration tests (back-end) |
| Playwright / Cypress | E2E tests (front-end) |

### CI/CD
| Tool | Purpose |
|---|---|
| GitHub Actions | Automated tests, build, deploy to staging |

### Technical Documentation
| Tool | Purpose |
|---|---|
| `.md` files in repository | Architecture analysis, priorities, technical decisions |
| Swagger / OpenAPI | API documentation (auto-generated) |
| Figma | UI/UX designs |

---

## CLICKUP PROJECT STRUCTURE

\```
Space: [Project Name]
│
├── List: Backlog
│   └── All tasks without an assigned sprint
│
├── List: Sprint 1 — [dates]
├── List: Sprint 2 — [dates]
├── ...
│
├── List: Bugs
│   └── Reports from testing and client
│
└── List: Documentation / Decisions
    └── Meeting notes, technical decisions
\```

### Task statuses

| Status | Meaning |
|---|---|
| `Backlog` | Defined, waiting for sprint |
| `To Do` | Assigned to sprint, not started |
| `In Progress` | Being implemented |
| `Code Review` | PR open, awaiting review |
| `Testing` | Handed to QA |
| `Done` | Accepted by PM / client |
| `Blocked` | Blocked — requires action outside the team |

### Task priorities

| Priority | Usage |
|---|---|
| `Urgent` | Blocking work, fix today |
| `High` | Goes into current sprint |
| `Normal` | Planned sprint |
| `Low` | To be discussed |

---

## MODULE SPECIFICATION METHODOLOGY

Before implementing any module, we build a technical specification using the `spec-writing` skill. Once the spec is reviewed and approved, it is broken down into ClickUp tasks and assigned to a sprint.

Specification files are stored in `.ai/specs/` in the repository.

---

## WORK RHYTHM

### Sprint cadence (2 weeks)

| When | Event |
|---|---|
| Monday (week 1) | **Sprint Planning** — define sprint scope from backlog |
| Once a week (day TBD) | **Team meeting** — progress, blockers, decisions |
| Ad hoc | **Direct communication** — Developer contacts DevOps or PM as needed |
| Friday (week 2) | **Sprint Review** — demo for the client |
| Friday (week 2) | **Retrospective** — process improvements |

### Git branching

\```
main          — production (merge from release only)
develop       — staging (integration)
feature/xxx   — new feature (merge to develop)
fix/xxx       — bug fix (merge to develop)
release/x.x   — release candidate (merge to main)
\```

### Code review

- Every PR requires at least one review before merging to `develop`.
- Tech Lead ([Name]) reviews PRs before merging to `main`.
- PRs must be linked to a ClickUp task (task ID in commit title).

### Commit convention

\```
feat: add patients module [CU-xxx]
fix: fix PESEL validation [CU-xxx]
chore: update dependencies
docs: update Swagger API
\```

---

## ENVIRONMENTS

| Environment | Purpose | Deployment |
|---|---|---|
| `local` | Developer machine (Docker) | Manual |
| `staging` | Team and client testing | Auto — on merge to `develop` |
| `production` | Live system | Manual — after review acceptance |

---

## CLIENT COMMUNICATION

- Weekly progress report (generated from ClickUp).
- Sprint Review every 2 weeks — demo on staging.
- Urgent client reports go to the **Bugs** list in ClickUp with `Urgent` priority.
- Scope changes require written confirmation before entering the backlog.
```
