# GitHub

CI, PR labels, release notes and the release workflow. They run once the repository has a GitHub remote;
until then they wait in `.github/`. Making CI a required status is a branch protection setting in the
repository, not a file.

### `.github/workflows/ci.yml`

Runs the validation gate of `SDLC.md` on every pull request into `develop` or `main`.

```yaml
name: CI

# Runs the validation gate of SDLC.md on every pull request into develop or main.

on:
  pull_request:
    branches:
      - develop
      - main

permissions:
  contents: read

concurrency:
  group: ci-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

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
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Label PR based on title
        uses: actions/labeler@v5
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          configuration-path: .github/labeler.yml
          sync-labels: true
```

### `.github/labeler.yml`

```yaml
# Auto-label PRs based on title patterns
# This helps with automatic release notes generation

"type: feature":
  - title: ["feat:", "feature:", "add "]
  - head: ["feat/", "feature/", "add/"]

"type: bug":
  - title: ["fix:", "bug:", "bugfix:", "resolve "]
  - head: ["fix/", "bug/", "bugfix/"]

"type: improvement":
  - title: ["refactor:", "improve:", "update ", "enhance "]
  - head: ["refactor/", "improve/", "update/"]

"type: docs":
  - title: ["docs:", "documentation:"]
  - head: ["docs/", "documentation/"]

dependencies:
  - title: ["deps:", "dependencies:", "bump "]
  - head: ["deps/", "dependencies/"]

"type: chore":
  - title: ["chore:"]
  - head: ["chore/"]

breaking:
  - title: ["breaking:", "BREAKING:"]
  - head: ["breaking/"]
```

### `.github/release.yml`

```yaml
changelog:
  exclude:
    labels:
      - ignore-for-release
    authors:
      - dependabot
      - github-actions
  categories:
    - title: Features
      labels:
        - "type: feature"
    - title: Bugs
      labels:
        - "type: bug"
    - title: Improvements
      labels:
        - "type: improvement"
    - title: Documentation
      labels:
        - "type: docs"
        - docs
    - title: Dependencies
      labels:
        - dependencies
        - dependabot
    - title: Other Changes
      labels:
        - "*"
```

### `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description

<!-- Describe your changes in detail -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] Feature (new functionality)
- [ ] Bug fix
- [ ] Improvement/Refactor
- [ ] Documentation
- [ ] Dependencies update

## Testing

<!-- Describe how you tested your changes -->

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
- [ ] No new warnings generated
```

### `.github/workflows/release-on-merge.yml`

When a PR titled `release: ...` is merged into `main`, tags it `v<version>` and creates a GitHub Release from `CHANGELOG.md` and the merged PRs. Its npm step stays commented out: the plugin is published by hand with `yarn publish-package`.

```yaml
name: Create Tag and Release on Merge

# This workflow creates a tag and GitHub Release when a release PR is merged to main
# Triggered when PR with title starting with "release:" is merged to main

on:
  pull_request:
    types: [closed]
    branches:
      - main

jobs:
  create-tag-and-release:
    if: github.event.pull_request.merged == true && startsWith(github.event.pull_request.title, 'release:')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: main

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: yarn install --immutable

      # - name: Debug - Check NPM_TOKEN secret
      #   run: |
      #     if [ -z "${{ secrets.NPM_TOKEN }}" ]; then
      #       echo "❌ NPM_TOKEN secret is not set or empty"
      #       echo "Please add NPM_TOKEN secret in: Settings → Secrets and variables → Actions"
      #       exit 1
      #     else
      #       echo "✅ NPM_TOKEN secret exists (value is hidden for security)"
      #       echo "Secret length: ${#NPM_TOKEN} characters"
      #     fi
      #   env:
      #     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Extract version from package.json
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "tag=v$VERSION" >> $GITHUB_OUTPUT
          echo "✅ Detected version: $VERSION"

      - name: Check if tag already exists
        id: check-tag
        run: |
          TAG_NAME="${{ steps.version.outputs.tag }}"
          if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
            echo "exists=true" >> $GITHUB_OUTPUT
            echo "⚠️ Tag $TAG_NAME already exists locally"
          else
            echo "exists=false" >> $GITHUB_OUTPUT
            echo "✅ Tag $TAG_NAME does not exist, will create"
          fi

      - name: Create Git Tag
        if: steps.check-tag.outputs.exists == 'false'
        run: |
          TAG_NAME="${{ steps.version.outputs.tag }}"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
          git push origin "$TAG_NAME"
          echo "✅ Tag $TAG_NAME created and pushed"

      # - name: Publish to npm
      #   if: steps.check-tag.outputs.exists == 'false'
      #   run: |
      #     echo "🔐 Configuring npm authentication..."
      #     # npm automatically detects NODE_AUTH_TOKEN for authentication
      #     # Also set NPM_TOKEN for .npmrc compatibility (if needed)
          
      #     echo "🔍 Verifying npm authentication..."
      #     npm whoami --registry=https://registry.npmjs.org/ || {
      #       echo "❌ npm authentication failed!"
      #       echo "Check if NPM_TOKEN secret is correct in GitHub Secrets"
      #       exit 1
      #     }
          
      #     echo "📦 Publishing package..."
      #     npm publish --access restricted
      #   env:
      #     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      #     NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Generate and Create GitHub Release
        uses: actions/github-script@v7
        with:
          script: |
            const { execSync } = require('child_process');
            const fs = require('fs');
            
            // Get version from package.json
            const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            const version = packageJson.version;
            const tagName = `v${version}`;
            
            console.log(`📦 Creating release for tag: ${tagName}`);
            
            // Check if release already exists
            try {
              const existingRelease = await github.rest.repos.getReleaseByTag({
                owner: context.repo.owner,
                repo: context.repo.repo,
                tag: tagName
              });
              console.log(`⚠️ Release ${tagName} already exists!`);
              console.log(`Release URL: ${existingRelease.data.html_url}`);
              return;
            } catch (error) {
              if (error.status !== 404) {
                throw error;
              }
              console.log(`✅ No existing release found for ${tagName}, proceeding...`);
            }
            
            // Get previous tag
            const { data: tags } = await github.rest.repos.listTags({
              owner: context.repo.owner,
              repo: context.repo.repo,
              per_page: 10,
            });
            
            let previousTagName = '';
            for (const tag of tags) {
              if (tag.name !== tagName) {
                previousTagName = tag.name;
                break;
              }
            }
            
            console.log(`Generating release notes from ${previousTagName || 'start'} to ${tagName}`);
            
            // Get commits between tags
            let commits = [];
            try {
              const { data: comparison } = await github.rest.repos.compareCommits({
                owner: context.repo.owner,
                repo: context.repo.repo,
                base: previousTagName || 'HEAD~50',
                head: tagName,
              });
              commits = comparison.commits;
              console.log(`Found ${commits.length} commits between ${previousTagName || 'start'} and ${tagName}`);
            } catch (error) {
              console.log(`Could not compare commits: ${error.message}`);
              commits = [];
            }
            
            // Get PRs for commits
            const prMap = new Map();
            for (const commit of commits) {
              try {
                const { data: prs } = await github.rest.repos.listPullRequestsAssociatedWithCommit({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  commit_sha: commit.sha,
                });
                
                for (const pr of prs) {
                  if (pr.merged_at && 
                      !prMap.has(pr.number) && 
                      !pr.title.toLowerCase().includes('release:')) {
                    prMap.set(pr.number, pr);
                  }
                }
              } catch (error) {
                console.log(`Could not get PRs for commit ${commit.sha.substring(0, 7)}:`, error.message);
              }
            }
            
            const prs = Array.from(prMap.values());
            console.log(`Found ${prs.length} merged PRs between tags`);
            
            // Categorize PRs by labels
            const breaking = [];
            const features = [];
            const bugs = [];
            const improvements = [];
            const docs = [];
            const dependencies = [];
            const chores = [];
            const other = [];
            
            prs.forEach(pr => {
              const labels = pr.labels.map(l => l.name);
              const prLine = `- ${pr.title} (#${pr.number}) @${pr.user.login}`;
              
              if (labels.includes('breaking')) {
                breaking.push(prLine);
              } else if (labels.includes('type: feature')) {
                features.push(prLine);
              } else if (labels.includes('type: bug')) {
                bugs.push(prLine);
              } else if (labels.includes('type: improvement')) {
                improvements.push(prLine);
              } else if (labels.includes('type: docs')) {
                docs.push(prLine);
              } else if (labels.includes('dependencies')) {
                dependencies.push(prLine);
              } else if (labels.includes('type: chore')) {
                chores.push(prLine);
              } else {
                other.push(prLine);
              }
            });
            
            // Build release notes
            let releaseNotes = ``;
            
            // Get CHANGELOG.md content for this version
            let changelogContent = '';
            try {
              const changelogPath = './CHANGELOG.md';
              if (fs.existsSync(changelogPath)) {
                const changelogText = fs.readFileSync(changelogPath, 'utf8');
                const versionNumber = version;
                const escapedVersion = versionNumber.replace(/\./g, '\\.');
                const versionRegex = new RegExp(`##\\s+${escapedVersion}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`);
                const match = changelogText.match(versionRegex);
                
                if (match && match[1]) {
                  changelogContent = match[1].trim();
                  console.log(`✅ Found CHANGELOG.md content for version ${versionNumber}`);
                }
              }
            } catch (error) {
              console.log(`Could not read CHANGELOG.md: ${error.message}`);
            }
            
            // Use CHANGELOG.md if available
            if (changelogContent) {
              releaseNotes += changelogContent + '\n\n';
              releaseNotes += `---\n\n`;
              releaseNotes += `## Pull Requests\n\n`;
            } else {
              if (prs.length > 0) {
                const totalPRs = prs.length;
                releaseNotes += `This release includes ${totalPRs} ${totalPRs === 1 ? 'change' : 'changes'}.\n\n`;
              }
            }
            
            if (breaking.length > 0) {
              releaseNotes += `### Breaking Changes\n${breaking.join('\n')}\n\n`;
            }
            if (features.length > 0) {
              releaseNotes += `### New Features\n${features.join('\n')}\n\n`;
            }
            if (bugs.length > 0) {
              releaseNotes += `### Bug Fixes\n${bugs.join('\n')}\n\n`;
            }
            if (improvements.length > 0) {
              releaseNotes += `### Improvements\n${improvements.join('\n')}\n\n`;
            }
            if (docs.length > 0) {
              releaseNotes += `### Documentation\n${docs.join('\n')}\n\n`;
            }
            if (dependencies.length > 0) {
              releaseNotes += `### Dependencies\n${dependencies.join('\n')}\n\n`;
            }
            if (chores.length > 0) {
              releaseNotes += `### Chores\n${chores.join('\n')}\n\n`;
            }
            if (other.length > 0) {
              releaseNotes += `### Other Changes\n${other.join('\n')}\n\n`;
            }
            
            if (prs.length === 0) {
              releaseNotes += `No merged pull requests found for this release.\n\n`;
            }
            
            if (previousTagName) {
              releaseNotes += `\n---\n**Full Changelog**: https://github.com/${context.repo.owner}/${context.repo.repo}/compare/${previousTagName}...${tagName}`;
            }
            
            // Create GitHub Release
            const release = await github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: tagName,
              name: `Release ${tagName}`,
              body: releaseNotes,
              draft: false,
              prerelease: false,
              make_latest: 'true'
            });
            
            console.log(`✅ Release ${tagName} created successfully!`);
            console.log(`Release URL: ${release.data.html_url}`);
```
