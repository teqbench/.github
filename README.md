# .github

Central CI/CD workflows and configuration for the TeqBench organization.

## Reusable Workflows

| Workflow | Purpose | Used by |
| :--- | :--- | :--- |
| `ci.yml` | Lint, typecheck, format check, audit, test, build, badges (most steps individually toggleable) | Node.js packages and webapps |
| `noop-ci.yml` | No&#8209;op CI with version badge | Non&#8209;compilable repos (skill libraries, docs) |
| `release.yml` | Release Please versioning + (optional) publish to GitHub Packages | All repos (callers pass `publish: false` to opt out of publish) |
| `sync.yml` | Merge main back into dev after release | All repos |
| `claude.yml` | Claude Code integration (@claude triggers) | All repos |
| `dep-compat-check.yml` | Dependency compatibility tracking | Node.js package repos |
| `renovate.yml` | Scheduled Renovate runs for dependency updates | Central (this repo only) |

## How Consuming Repos Use These Workflows

Each repo has thin caller workflows that delegate to these reusable workflows:

```yaml
# .github/workflows/ci.yml in a Node.js package repo
name: ci
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  ci:
    uses: teqbench/.github/.github/workflows/ci.yml@main
    with:
      gist-id: ${{ vars.GIST_ID }}
    secrets: inherit
```

For non&#8209;compilable repos (no `package.json`), use `noop-ci.yml` instead:

```yaml
# .github/workflows/ci.yml in a skill library or docs repo
name: ci
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  ci:
    uses: teqbench/.github/.github/workflows/noop-ci.yml@main
    with:
      gist-id: ${{ vars.GIST_ID }}
    secrets: inherit
```

Caller templates are available in the `caller-templates/` directory.

## Adding a New Repo

1. Create the repo from the appropriate template (`teqbench.dev.templates.tbx-package` for Node.js packages)
2. Add thin caller workflows referencing the org reusable workflows
3. Add the repo name to the `repositories` array in `renovate-config.js` (if it has npm dependencies)
4. Set the `GIST_ID` repo variable to the shared gist ID (`a69600f4ed4ebed89ffb35d808e05eb4`)
5. Verify the repo has access to the org&#8209;level secrets. In **Organization Settings → Secrets and variables → Actions**, confirm each required secret is scoped to include this repository (either via "All repositories" or an explicit list)

## Required Secrets

These are set at the **organization level** so all repos inherit them:

| Secret | Purpose |
| :--- | :--- |
| `APP_CLIENT_ID` | teqbench&#8209;automation GitHub App Client ID (replaces deprecated `APP_ID`) |
| `APP_PRIVATE_KEY` | teqbench&#8209;automation GitHub App private key |
| `GIST_TOKEN` | Token for pushing badge data to gist |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Code |

## Caller Templates

The `caller-templates/` directory contains ready&#8209;to&#8209;copy thin caller workflow files:

| Template | Calls |
| :--- | :--- |
| `ci.yml` | `ci.yml` (Node.js) |
| `claude.yml` | `claude.yml` |
| `dep-compat-check.yml` | `dep&#8209;compat&#8209;check.yml` |
| `release.yml` | `release.yml` |
| `sync.yml` | `sync.yml` |

A `noop-ci.yml` caller template is not included because the caller file is identical to the `ci.yml` template with only the `uses:` line changed.
