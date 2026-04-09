# CLAUDE.md

This file provides guidance for Claude Code when working in this repository.

## Repository Overview

This is the organization-wide `.github` repo for TeqBench. It contains reusable GitHub Actions workflows, Renovate configuration, and caller templates that all TeqBench repos consume. Changes here affect every repo in the org.

## Contents

- `.github/workflows/` -- Reusable workflows called by thin callers in consuming repos
- `caller-templates/` -- Template thin caller workflow files for new repos
- `renovate-config.js` -- Central Renovate configuration for dependency updates across all repos
- `README.md` -- Repo documentation

## Reusable Workflows

| Workflow | Purpose | Consuming repos |
|---|---|---|
| `ci.yml` | Lint, typecheck, test, build, badges | All Node.js package repos |
| `noop-ci.yml` | No-op CI with version badge | Non-compilable repos (skill libraries, docs) |
| `release.yml` | Release Please versioning + publish | All repos |
| `sync.yml` | Merge main back into dev | All repos |
| `claude.yml` | Claude Code integration (@claude triggers) | All repos |
| `dep-compat-check.yml` | Dependency compatibility tracking | Node.js package repos |
| `renovate.yml` | Scheduled Renovate runs | Central (runs from this repo) |

## Impact of Changes

Every TeqBench repo references these workflows via `teqbench/.github/.github/workflows/<name>.yml@main`. Changes to a workflow file here take effect on the next workflow run in every consuming repo. Test changes carefully.

## Required Secrets (Org-Level)

| Secret | Purpose |
|---|---|
| `APP_ID` | teqbench-automation GitHub App ID |
| `APP_PRIVATE_KEY` | teqbench-automation GitHub App private key |
| `GIST_TOKEN` | Token for pushing badge data to gist |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Code |

## Adding a New Repo

1. Create the repo from the appropriate template
2. Add thin caller workflows referencing the org reusable workflows
3. Add the repo name to the `repositories` array in `renovate-config.js` (if it has npm dependencies)
4. Set the `GIST_ID` repo variable to the shared gist ID

## Commit Convention

Follow Conventional Commits strictly:

- `feat(scope): ...` -- New feature (minor bump)
- `fix(scope): ...` -- Bug fix (patch bump)
- `feat(scope)!: ...` -- Breaking change (major bump)
- `docs(scope): ...` -- Documentation
- `refactor(scope): ...` -- Refactor
- `chore(scope): ...` -- Maintenance

Use the workflow name as scope (e.g., `feat(ci): add coverage threshold check`, `fix(release): correct tag format`). Use `renovate` for Renovate config changes.

## Branching & Workflow

- `main` -- Production. Only receives merges from `release/*`, `hotfix/*`, or `release-please--*` branches.
- `dev` -- Integration branch. Receives merges from `feature/*` and `bugfix/*` branches.
- Create feature/bugfix branches off `dev`, PR back to `dev`.
- Use `release/*` branches to carry `dev` to `main`.
- Use `hotfix/*` branches off `main` for urgent fixes.

### What Claude Should Do

- Create feature or bugfix branches off `dev` when implementing changes.
- Use Conventional Commits messages.
- Create PRs targeting `dev` (never directly target `main`).
- Keep PRs focused and atomic.
- When modifying reusable workflows, consider impact on all consuming repos.

### What Claude Should NOT Do

- Never push directly to `main` or `dev`.
- Never force-push to any branch.
- Never delete branches.
- Never modify secrets or tokens.
- Never remove repos from the Renovate `repositories` array without explicit instruction.
- Never modify `release-please-config.json`, `.release-please-manifest.json`, or `CHANGELOG.md`.
