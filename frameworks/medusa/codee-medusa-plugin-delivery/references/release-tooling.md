# Release tooling

The files that make a plugin a package: Yarn 4, Changesets, the release, PR and publish scripts, npm
authentication and the contributor pointer. Write each file at the path in its heading. A file that
already exists is compared and merged, never replaced wholesale.

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

`@changesets/cli` is a dev dependency (`"changeset": "changeset"` in the scripts). No `version` script:
Yarn has its own `yarn version`; the release runs `yarn changeset version`.

### `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### `.changeset/README.md`

```markdown
# Changesets

Each file here describes one user-facing change and its version bump. Add one with `yarn changeset`;
`yarn changeset version` applies them at a release. The process is in [SDLC.md](../SDLC.md), "Release".
```

## npm authentication

`.npmrc` holds no secret, only the variable npm expands; `NPM_TOKEN` lives in the environment or in a
`.env` that git ignores.

### `.npmrc`

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

## Scripts

Executable (`chmod +x`), run through `package.json`. Check each with `bash -n`.

### `scripts/prepare-release.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# Versions the pending changesets on develop and opens the release branch.
# Without an `origin` remote it works locally and prints the merge and tag to run.
# Usage: yarn prepare-release

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ "$(git rev-parse --abbrev-ref HEAD)" != "develop" ]]; then
  echo "Error: run it on develop." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: the working tree is not clean; commit or stash the changes first." >&2
  exit 1
fi

HAS_ORIGIN=false
if git remote get-url origin >/dev/null 2>&1; then
  HAS_ORIGIN=true
  git pull --ff-only origin develop
fi

yarn changeset version

if git diff --quiet -- package.json; then
  echo "Error: no changeset to release; package.json kept its version." >&2
  exit 1
fi

VERSION="$(node -p "require('./package.json').version")"
RELEASE_BRANCH="release/v${VERSION}"

# Only what `changeset version` writes: the version, the changelog and the consumed changesets.
git add package.json CHANGELOG.md .changeset
git commit -m "chore: version packages"
git checkout -b "$RELEASE_BRANCH"

if [[ "$HAS_ORIGIN" == true ]]; then
  git push origin develop
  git push -u origin "$RELEASE_BRANCH"

  echo
  echo "Next: open a PR ${RELEASE_BRANCH} -> main titled \"release: v${VERSION}\", then tag main v${VERSION}."
else
  echo
  echo "No origin remote. Next, locally:"
  echo "  git checkout main && git merge --no-ff ${RELEASE_BRANCH}"
  echo "  git tag -a v${VERSION} -m \"Release v${VERSION}\""
  echo "  git checkout develop && git merge main"
fi
```

### `scripts/create-pr.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# Opens a GitHub PR from the current branch into develop.
# The body is .ai/pr-description.md when it exists (codee-generate-pr-description writes it),
# otherwise the summaries of the branch's changesets.
# Requires: an origin remote and an authenticated gh CLI.
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
PR_TITLE="${PR_TITLE:-${CURRENT_BRANCH}}"
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

### `scripts/publish-package.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# Publishes the version on main to npm, after the release is tagged.
# NPM_TOKEN comes from the environment or from .env, which .npmrc reads; the token is never printed.
# Usage: yarn publish-package            (pass --dry-run to see the package without publishing)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
  echo "Error: publish from main." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: the working tree is not clean." >&2
  exit 1
fi

VERSION="$(node -p "require('./package.json').version")"
if [[ "$(git tag --points-at HEAD)" != *"v${VERSION}"* ]]; then
  echo "Error: main is not tagged v${VERSION}; finish the release first." >&2
  exit 1
fi

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [[ -z "${NPM_TOKEN:-}" ]]; then
  echo "Error: NPM_TOKEN is not set; add it to .env or the environment." >&2
  exit 1
fi

# prepublishOnly runs `medusa plugin:build`, which removes .medusa/server: stop `yarn dev` first.
npm publish --access public "$@"
```

## package.json

```json
"publishConfig": { "access": "public" },
"scripts": {
  "typecheck:admin": "tsc --noEmit -p src/admin/tsconfig.json",
  "changeset": "changeset",
  "prepare-release": "bash scripts/prepare-release.sh",
  "pr:create": "bash scripts/create-pr.sh",
  "publish-package": "bash scripts/publish-package.sh"
}
```

`packageManager` comes from `corepack use`; the test scripts are in `integration-tests.md`.

### `CONTRIBUTING.md`

```markdown
# Contributing

- [SDLC.md](SDLC.md) - how a change goes from an idea to a release: specs, branches, changesets, the
  validation gate and the release steps.
- [CODE_REVIEW.md](CODE_REVIEW.md) - what a review checks and how severe a finding is.
- [AGENTS.md](AGENTS.md) - the rules AI agents follow here, the plugin's public contract among them.
```
