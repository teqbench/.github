# .github

Central CI/CD workflows and configuration for the TeqBench organization.

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — org-wide rules, conventions, and bot/secret reference
- [`renovate.md`](renovate.md) — Renovate configuration walkthrough and cascade behaviour
- [`runbook.md`](runbook.md) — operational runbook for manual operations, incident response, and routine maintenance

## Reusable Workflows

| Workflow | Purpose | Used by |
| :--- | :--- | :--- |
| `ci.yml` | Lint, typecheck, format check, audit, test, build, badges (most steps individually toggleable) | Node.js packages and webapps |
| `noop-ci.yml` | No&#8209;op CI with version badge | Non&#8209;compilable repos (skill libraries, docs) |
| `release.yml` | Release Please versioning + (optional) publish to GitHub Packages | All repos (callers pass `publish: false` to opt out of publish) |
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
    branches: [main]
  pull_request:
    branches: [main]

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
    branches: [main]
  pull_request:
    branches: [main]

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

## npm authentication for `@teqbench` packages

The reusable `ci.yml` and `release.yml` workflows export both `NODE_AUTH_TOKEN` and `NPM_TOKEN` (each set to `${{ secrets.GITHUB_TOKEN }}`) on every `npm ci` and `npm publish` step.

- **`NODE_AUTH_TOKEN`** is the convention used by [`actions/setup-node` ↗](https://github.com/actions/setup-node)'s auto&#8209;generated home `~/.npmrc`. Consumer repos without a custom `.npmrc` rely on this.
- **`NPM_TOKEN`** is the convention [Vercel ↗](https://vercel.com) sets natively. Consumer repos with a custom `.npmrc` (e.g. webapps that consume `@teqbench/*` packages and deploy via Vercel) should reference `${NPM_TOKEN}` so the same `.npmrc` works in both CI and Vercel without per&#8209;environment env&#8209;var overrides.

Recommended `.npmrc` for webapps that consume `@teqbench/*` packages:

```
@teqbench:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Vercel project env: set `NPM_TOKEN` to a [GitHub PAT ↗](https://github.com/settings/tokens) with `read:packages` scope.

## Caller Templates

The `caller-templates/` directory contains ready&#8209;to&#8209;copy thin caller workflow files:

| Template | Calls |
| :--- | :--- |
| `ci.yml` | `ci.yml` (Node.js) |
| `claude.yml` | `claude.yml` |
| `dep-compat-check.yml` | `dep&#8209;compat&#8209;check.yml` |
| `release.yml` | `release.yml` |

A `noop-ci.yml` caller template is not included because the caller file is identical to the `ci.yml` template with only the `uses:` line changed.
