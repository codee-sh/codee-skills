# Release tooling

The files that make a plugin a package: Yarn 4, Changesets, the PR script, the package's publication
fields and the contributor pointer. The release itself runs in `.github/workflows/release.yml`
(`github.md`). Write each file at the path in its heading. A file that already exists is compared and
merged, never replaced wholesale.

## Yarn 4

Write `.yarnrc.yml` before the first Yarn 4 install: without `nodeLinker: node-modules` the install runs in
Plug'n'Play and removes `node_modules`, which the Medusa CLI, the Admin's Vite and yalc need. Then the user
runs, with `yarn dev` stopped:

```bash
corepack enable
corepack use yarn@4       # writes packageManager to package.json and installs
```

Not `yarn set version`: it writes Yarn into `.yarn/releases`, which a usual `.gitignore` drops, so a fresh
clone and CI break. Yarn 4 may add security settings while migrating from Yarn 1; keep `enableScripts`
and remove `approvedGitRepositories: ["**"]` and `npmMinimalAgeGate: 0` unless the plugin needs them.

### `.yarnrc.yml`

```yaml
enableScripts: true

nodeLinker: node-modules
```

## Changesets

`@changesets/cli` v3 and `@changesets/changelog-github` are dev dependencies (`"changeset": "changeset"`
in the scripts). `changesets/action` v2, which the release workflow runs, needs the CLI v3. No `version`
script: Yarn has its own `yarn version`, and the workflow runs `changeset version`.

```json
"devDependencies": {
  "@changesets/changelog-github": "^1.0.1",
  "@changesets/cli": "^3.0.3"
}
```

### `.changeset/config.json`

`@changesets/changelog-github` links each changelog entry to its PR, commit and author; `repo` is the
GitHub repository, `<owner>/<repository>`.

```json
{
  "$schema": "https://unpkg.com/@changesets/config@4.0.1/schema.json",
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "<owner>/<repository>" }
  ],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "develop",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

A maintainer who runs `changeset version` locally needs `GITHUB_TOKEN` for the links; the release flow
never asks for it.

### `.changeset/README.md`

```markdown
# Changesets

Each file here describes one user-facing change and its version bump. Add one with `yarn changeset`;
`yarn changeset version` applies them at a release. The process is in [SDLC.md](../SDLC.md), "Release".
```

## Scripts

Executable (`chmod +x`), run through `package.json`. Check each with `bash -n`.

### `scripts/create-pr.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# Opens a GitHub PR from the current branch into develop.
# The body is .ai/pr-description.md when it exists (codee-generate-pr-description writes it),
# otherwise the summaries of the branch's changesets.
# Requires: an origin remote and an authenticated gh CLI.
# The title is the branch's first commit subject, a conventional commit, unless PR_TITLE is set.
# Usage: yarn pr:create   (BASE_BRANCH and PR_TITLE override the defaults)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Error: the repository has no origin remote." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required but not found in PATH." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh CLI is not authenticated. Run 'gh auth login'." >&2
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ -z "$CURRENT_BRANCH" || "$CURRENT_BRANCH" == "HEAD" ]]; then
  echo "Error: unable to determine the current branch." >&2
  exit 1
fi

BASE_BRANCH="${BASE_BRANCH:-develop}"
FIRST_SUBJECT="$(git log --reverse --format=%s "${BASE_BRANCH}..HEAD" | sed -n 1p)"
PR_TITLE="${PR_TITLE:-${FIRST_SUBJECT}}"
if [[ -z "$PR_TITLE" ]]; then
  echo "Error: the branch has no commit over ${BASE_BRANCH}; set PR_TITLE or commit first." >&2
  exit 1
fi
BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT

if [[ -f .ai/pr-description.md ]]; then
  cp .ai/pr-description.md "$BODY_FILE"
else
  summaries=()
  while IFS= read -r file; do
    # The first paragraph after the changeset's front matter.
    summary="$(awk '
      /^---$/ { separators++; next }
      separators >= 2 {
        if (out == "" && $0 ~ /[^[:space:]]/) { out = $0; next }
        if (out != "" && $0 ~ /^[[:space:]]*$/) { exit }
        if (out != "") { out = out " " $0 }
      }
      END { print out }
    ' "$file")"
    [[ -n "$summary" ]] && summaries+=("$summary")
  done < <(git diff --name-only --diff-filter=AM "$BASE_BRANCH"...HEAD -- .changeset | grep -E '\.md$' | grep -v 'README\.md$' || true)

  {
    echo "## Summary"
    if [[ ${#summaries[@]} -gt 0 ]]; then
      printf -- "- %s\n" "${summaries[@]}"
    else
      echo "- Describe the change."
    fi
    echo
    echo "## Testing"
    echo "- Describe what was run."
  } > "$BODY_FILE"
fi

gh pr create \
  --base "$BASE_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --title "$PR_TITLE" \
  --body-file "$BODY_FILE"
```

## package.json

```json
"files": [
  ".medusa/server/**",
  "index.d.ts"
],
"publishConfig": {
  "access": "public",
  "provenance": true
},
"scripts": {
  "typecheck:admin": "tsc --noEmit -p src/admin/tsconfig.json",
  "prepublishOnly": "medusa plugin:build",
  "changeset": "changeset",
  "pr:create": "bash scripts/create-pr.sh"
}
```

- **`files`** - `.medusa/server/**`, never `.medusa/server`. Yarn, which packs the release, reads the
  bare folder as the few declaration files the `exports` name, where npm takes the whole folder; a
  package published that way holds no build and Medusa cannot load it. The release workflow checks the
  packed list before publishing.
- **`publishConfig.provenance`** - the release workflow's `yarn npm publish` signs the package's
  provenance from it, through the job's OIDC token.
- **`prepublishOnly`** - kept, so the one publication by hand, the first version, still builds.

`packageManager` comes from `corepack use`; the test scripts are in `integration-tests.md`.

### `CONTRIBUTING.md`

```markdown
# Contributing

- [SDLC.md](SDLC.md) - how a change goes from an idea to a release: specs, branches, changesets, the
  validation gate and the release.
- [CODE_REVIEW.md](CODE_REVIEW.md) - what a review checks and how severe a finding is.
- [AGENTS.md](AGENTS.md) - the rules AI agents follow here, the plugin's public contract among them.
- [docs/development.md](docs/development.md) - running the plugin linked into a Medusa project with
  `yarn dev` and yalc.
- [docs/tests.md](docs/tests.md) - how the tests run and where a new one goes.
```

## Leaving the earlier process

A plugin that released from `main` with its own scripts and published with a token removes, when it is
aligned: `scripts/prepare-release.sh`, `scripts/publish-package.sh`, the `prepare-release` and
`publish-package` scripts in `package.json`, `.npmrc`, `NPM_TOKEN` from `.env`,
`.github/workflows/release-on-merge.yml` and `.github/release.yml`. Its `main` branch is deleted once
`develop` holds everything `main` has, and `develop` becomes the default branch.
