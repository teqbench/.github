# .github

Central CI/CD workflows and configuration for the TeqBench organization.

## What's here

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Reusable CI workflow (lint, typecheck, test, build, badges) |
| `.github/workflows/release.yml` | Reusable release workflow (Release Please + publish to GitHub Packages) |
| `.github/workflows/sync.yml` | Reusable sync workflow (merge main back to dev) |
| `.github/workflows/dep-compat-check.yml` | Reusable dependency compatibility tracker |
| `.github/workflows/claude.yml` | Reusable Claude Code workflow (AI-assisted issues/PRs) |
| `.github/workflows/renovate.yml` | Runs Renovate on a schedule for all repos |
| `renovate-config.js` | Central Renovate configuration |

## How consuming repos use these workflows

Each repo has thin caller workflows that delegate to these reusable workflows. Example:

```yaml
# .github/workflows/ci.yml in any @teqbench package repo
name: CI
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

## Adding a new repo

1. Create the repo from the `teqbench.dev.templates.tbx-package` template (thin callers are included)
2. Add the repo name to the `repositories` array in `renovate-config.js`
3. Ensure the repo has the required secrets (`APP_ID`, `APP_PRIVATE_KEY`, `GIST_TOKEN`, `ANTHROPIC_API_KEY`) — use org-level secrets for automatic propagation

## Required secrets

These should be set at the **organization level** so all repos inherit them:

| Secret | Purpose |
|---|---|
| `APP_ID` | teqbench-automation GitHub App ID |
| `APP_PRIVATE_KEY` | teqbench-automation GitHub App private key |
| `GIST_TOKEN` | Token for pushing badge data to gist |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Code |
