# GitHub

CI, PR labels, the PR template and the release workflow, then the settings made by hand on GitHub and
npm. The workflows run once the repository has a GitHub remote; until then they wait in `.github/`.

### `.github/workflows/ci.yml`

Runs the validation gate of `SDLC.md` on every pull request into `develop`, on the lowest Node.js that
`engines` allows and on the current LTS, without stopping the other run when one fails.

```yaml
name: CI

# Runs the validation gate of SDLC.md on every pull request into develop, on the lowest Node.js the
# package supports (engines) and on the current LTS.

on:
  pull_request:
    branches:
      - develop

permissions:
  contents: read

concurrency:
  group: ci-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [22, 24]
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: ${{ matrix.node-version }}

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: yarn install --immutable

      - name: Lint
        run: yarn lint

      - name: Typecheck
        run: yarn typecheck

      - name: Admin typecheck
        run: yarn typecheck:admin

      - name: Format
        run: yarn format:check

      - name: Unit tests
        run: yarn test:unit
```

### `.github/workflows/pr-labeler.yml`

```yaml
name: PR Labeler

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Label the PR by its branch prefix
        uses: actions/labeler@v7
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          configuration-path: .github/labeler.yml
          sync-labels: true
```

### `.github/labeler.yml`

Labels sort PRs on GitHub; they build no release notes, which come from the changesets.

```yaml
# Labels a PR by its branch prefix (actions/labeler v7, `head-branch` regexps).
# The release PR's branch, changeset-release/develop, counts as a chore.

"type: feature":
  - head-branch: ["^feat/", "^feature/"]

"type: bug":
  - head-branch: ["^fix/", "^bug/"]

"type: chore":
  - head-branch: ["^refactor/", "^chore/", "^deps/", "^changeset-release/"]

"type: docs":
  - head-branch: ["^docs/"]

"type: breaking":
  - head-branch: ["^breaking/"]
```

### `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## What

<!-- What changes, in a sentence or two. -->

## Why

<!-- The problem or the need behind it; link the issue or the spec. -->

## How

<!-- The approach, and anything a reviewer should look at first. -->

## Testing

<!-- What was run, and what was checked by hand. -->

## Checklist

- [ ] A changeset is added (`yarn changeset`), or the PR says why it needs none
- [ ] The gate passes: `yarn lint`, `yarn typecheck`, `yarn typecheck:admin`, `yarn format:check`, `yarn test:unit`
```

### `.github/workflows/release.yml`

Medusa's release flow through `changesets/action` v2, as `SDLC.md`, "Release", describes: `select-mode`
picks `version` while `develop` has changesets and `publish` once the release PR is merged. `publish`
builds and publishes in one job, because Changesets publishes a Yarn project with `yarn npm publish`,
which takes no packed tarball; Yarn exchanges the job's OIDC token with npm and signs provenance from
`publishConfig.provenance`. The check of the packed list stops a publication without the build
(`release-tooling.md`, "package.json"). Keep the file's name: npm's trusted publisher names it.

```yaml
name: Release

# Versions and publishes the package from develop, as SDLC.md "Release" describes.
# While develop has changesets, the `version` job keeps one "chore: release" PR open; its merge leaves
# no changesets, and the `publish` job publishes to npm, tags v<version> and creates the GitHub
# release. npm's trusted publisher names this file: renaming it breaks publication.

on:
  push:
    branches:
      - develop

permissions: {}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}

jobs:
  select-mode:
    runs-on: ubuntu-latest
    outputs:
      mode: ${{ steps.select-mode.outputs.mode }}
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v7
        with:
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 24
          package-manager-cache: false

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: yarn install --immutable

      - name: Select mode
        id: select-mode
        uses: changesets/action/select-mode@v2

  version:
    if: needs.select-mode.outputs.mode == 'version'
    needs: select-mode
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v7
        with:
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 24
          package-manager-cache: false

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: yarn install --immutable

      - name: Open or update the release PR
        uses: changesets/action/version@v2
        with:
          commit-message: "chore: release"
          pr-title: "chore: release"
        env:
          # @changesets/changelog-github reads it to link each entry's PR, commit and author.
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # Builds and publishes in one job: Changesets publishes a Yarn project with `yarn npm publish`, which
  # cannot publish a packed tarball, so the build cannot be split into a job without `id-token`. Yarn
  # exchanges the job's OIDC token with npm (trusted publishing) and signs provenance
  # (`publishConfig.provenance`).
  publish:
    if: needs.select-mode.outputs.mode == 'publish'
    needs: select-mode
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v7
        with:
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 24
          package-manager-cache: false

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: yarn install --immutable

      - name: Build
        run: yarn build

      # Yarn packs by the "files" of package.json; a pattern it reads differently from npm once left
      # the whole build out of a published version. Stop before publishing an empty package.
      - name: Check the package holds the build
        run: |
          yarn pack --dry-run > pack-contents.txt
          grep -q ".medusa/server/src/lib/index.js" pack-contents.txt || { cat pack-contents.txt; echo "The package would ship without its build."; exit 1; }
          grep -q ".medusa/server/src/admin/index.js" pack-contents.txt || { cat pack-contents.txt; echo "The package would ship without its Admin."; exit 1; }

      - name: Publish, tag and create the GitHub release
        uses: changesets/action/publish@v2
```

## Settings made by hand

The user makes them; the agent lists them in its report.

- **GitHub repository** - `develop` as the default branch; branch protection on `develop` with CI as a
  required check; in Settings, Actions, General, Workflow permissions: "Read repository contents" and
  **Allow GitHub Actions to create and approve pull requests**, without which the `version` job fails
  with "GitHub Actions is not permitted to create or approve pull requests". In an organisation the
  repository's option stays greyed out until the organisation's own Actions settings allow it, and a
  repository transferred to another organisation takes that organisation's settings, so check both
  after a transfer.
- **npm trusted publisher** - on the package's Settings page on npmjs.com, GitHub Actions with the
  owner, the repository and `release.yml`, no environment. It can be set only on a package that exists,
  so it follows the hand-published placeholder (`SDLC.md`, "The first version"). No npm token is stored
  in the repository or its secrets.
